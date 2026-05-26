/**
 * HUD rendering — SNK-style health bars, power gauge, timer, guard gauge, combo counters
 * Upgraded: segmented HP bars with damage flash, HP gradient, low-HP pulse,
 *           meter tick marks / glow / DM-ready flash, timer "TIME" label + critical flash,
 *           round indicator with win marks, character name plates, combo counter with color tiers
 */
import { Fighter } from '../entities/fighter.js';
import { Camera } from '../core/camera.js';
import type { PowerGauge, MaxModeState } from '../core/types.js';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, MAX_HEALTH, MAX_STOCKS, ROUND_TIME,
  HUD_BAR_WIDTH, HUD_BAR_HEIGHT, HUD_BAR_Y, HUD_MARGIN,
  HUD_TIMER_SIZE, HUD_GAUGE_Y, HUD_GAUGE_WIDTH, HUD_GAUGE_HEIGHT,
  HUD_GAUGE_SEGMENT_GAP, HUD_WIN_MARKER_SIZE,
} from '../core/constants.js';
import { shiftColor, roundRect, drawSNKText } from './utils.js';
import { drawRyoPortrait } from './skeletalParts.js';

// ===== SNK pixel font rendering =====
const PIXEL_FONT_SCALE = 2;

const PIXEL_GLYPHS: Record<string, number[]> = {
  '0': [0b111, 0b101, 0b101, 0b101, 0b111],
  '1': [0b010, 0b110, 0b010, 0b010, 0b111],
  '2': [0b111, 0b001, 0b111, 0b100, 0b111],
  '3': [0b111, 0b001, 0b111, 0b001, 0b111],
  '4': [0b101, 0b101, 0b111, 0b001, 0b001],
  '5': [0b111, 0b100, 0b111, 0b001, 0b111],
  '6': [0b111, 0b100, 0b111, 0b101, 0b111],
  '7': [0b111, 0b001, 0b010, 0b010, 0b010],
  '8': [0b111, 0b101, 0b111, 0b101, 0b111],
  '9': [0b111, 0b101, 0b111, 0b001, 0b111],
  ':': [0b000, 0b010, 0b000, 0b010, 0b000],
  '.': [0b000, 0b000, 0b000, 0b000, 0b010],
  '!': [0b010, 0b010, 0b010, 0b000, 0b010],
  'H': [0b101, 0b101, 0b111, 0b101, 0b101],
  'I': [0b111, 0b010, 0b010, 0b010, 0b111],
  'T': [0b111, 0b010, 0b010, 0b010, 0b010],
  '-': [0b000, 0b000, 0b111, 0b000, 0b000],
};

function drawPixelText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  scale: number,
  fillColor: string,
  outlineColor: string = '#000000',
  align: 'left' | 'center' | 'right' = 'center',
): void {
  const s = PIXEL_FONT_SCALE * scale;
  const glyphW = 3;
  const glyphH = 5;
  const spacing = 1;
  const totalW = text.length * (glyphW + spacing) - spacing;

  let startX = x;
  if (align === 'center') startX = x - (totalW * s) / 2;
  else if (align === 'right') startX = x - totalW * s;

  const parsed = parseFillColor(fillColor);

  for (let ci = 0; ci < text.length; ci++) {
    const ch = text[ci];
    const glyph = PIXEL_GLYPHS[ch.toUpperCase()];
    if (!glyph) continue;
    const gx = startX + ci * (glyphW + spacing) * s;

    for (let row = 0; row < glyphH; row++) {
      for (let col = 0; col < glyphW; col++) {
        if (glyph[row] & (1 << (glyphW - 1 - col))) {
          const px = gx + col * s;
          const py = y + row * s;
          ctx.fillStyle = outlineColor;
          ctx.fillRect(px - 1, py - 1, s + 2, s + 2);
          ctx.fillStyle = parsed.fill;
          ctx.fillRect(px, py, s, s);
          ctx.fillStyle = parsed.highlight;
          ctx.fillRect(px, py, s, Math.max(1, s * 0.3));
        }
      }
    }
  }
}

function parseFillColor(color: string): { fill: string; highlight: string } {
  const { r, g, b } = parseColorRGB(color);
  return {
    fill: color,
    highlight: `rgba(${Math.min(255, r + 60)}, ${Math.min(255, g + 60)}, ${Math.min(255, b + 60)}, 0.6)`,
  };
}

function parseColorRGB(color: string): { r: number; g: number; b: number } {
  if (color.startsWith('#')) {
    return {
      r: parseInt(color.slice(1, 3), 16),
      g: parseInt(color.slice(3, 5), 16),
      b: parseInt(color.slice(5, 7), 16),
    };
  }
  if (color.startsWith('rgba(') || color.startsWith('rgb(')) {
    const m = color.match(/(\d+)/g);
    return m ? { r: +m[0], g: +m[1], b: +m[2] } : { r: 128, g: 128, b: 128 };
  }
  return { r: 128, g: 128, b: 128 };
}

// ===== Damage flash state per player =====
// Tracks the "white flash" region on the health bar after taking damage
interface DamageFlashState {
  /** Ratio where flash starts (closer to full-HP side) */
  fromRatio: number;
  /** Ratio where flash ends (closer to current HP) */
  toRatio: number;
  /** Remaining frames for this flash */
  timer: number;
  /** Maximum frames for the flash (for interpolation) */
  maxTimer: number;
}

const damageFlash: [DamageFlashState, DamageFlashState] = [
  { fromRatio: 0, toRatio: 0, timer: 0, maxTimer: 1 },
  { fromRatio: 0, toRatio: 0, timer: 0, maxTimer: 1 },
];

// Previous health tracking for detecting damage
let prevHealth: [number, number] = [MAX_HEALTH, MAX_HEALTH];

/**
 * Update damage flash state — call each frame before drawHUD
 */
function updateDamageFlash(fighters: Fighter[]): void {
  for (let p = 0; p < 2; p++) {
    const hp = fighters[p].health;
    if (hp < prevHealth[p] && prevHealth[p] > 0) {
      // Damage taken: start new flash
      const newRatio = Math.max(0, hp / MAX_HEALTH);
      const oldRatio = Math.max(0, prevHealth[p] / MAX_HEALTH);
      damageFlash[p].fromRatio = newRatio;
      damageFlash[p].toRatio = oldRatio;
      damageFlash[p].timer = 18; // 18 frames (~300ms) of white flash
      damageFlash[p].maxTimer = 18;
    }
    if (damageFlash[p].timer > 0) {
      damageFlash[p].timer--;
    }
    prevHealth[p] = hp;
  }
}

/**
 * Reset damage flash — call on round start
 */
export function resetHUDFlash(): void {
  for (let p = 0; p < 2; p++) {
    damageFlash[p].timer = 0;
    prevHealth[p] = MAX_HEALTH;
  }
}

// ===== Combo counter animation state =====
interface ComboAnimState {
  /** Displayed count (animates toward actual) */
  displayed: number;
  /** Scale multiplier (1.0 = normal, pops to 1.3 on increment) */
  scale: number;
  /** Previous combo count for detecting increments */
  prevCount: number;
}

const comboAnim: [ComboAnimState, ComboAnimState] = [
  { displayed: 0, scale: 1, prevCount: 0 },
  { displayed: 0, scale: 1, prevCount: 0 },
];

/** HUD portrait size constants */
const HUD_PORTRAIT_SIZE = 30;

/**
 * Draw character portrait in HUD area.
 * Uses drawRyoPortrait for Ryo, falls back to simple colored square for others.
 */
function drawHUDPortrait(
  ctx: CanvasRenderingContext2D,
  charId: string,
  x: number, y: number,
  healthPercent: number,
): void {
  if (charId === 'ryo') {
    drawRyoPortrait(ctx, x, y, HUD_PORTRAIT_SIZE, HUD_PORTRAIT_SIZE, healthPercent, 0);
  } else {
    // Fallback: simple colored square with first letter
    const colors: Record<string, string> = {
      kyo: '#FF6600', iori: '#AA1133', terry: '#CC8800', andy: '#FFAA22',
      joe: '#FF8800', kim: '#2288CC', chang: '#885522', choi: '#66CC66',
      robert: '#22AA44', leona: '#2266BB', ralf: '#CC6633', clark: '#556B2F',
      athena: '#FF66AA', mai: '#FF4488', kdash: '#444466', kula: '#4488CC',
      yashiro: '#664488', shermie: '#CC44AA', chris: '#FF8844',
      mature: '#882255', vice: '#3366AA', billy: '#4488CC', yamazaki: '#556622',
      mary: '#5588CC', xiangfei: '#EE6688', kasumi: '#DD4466',
    };
    const col = colors[charId] ?? '#888';
    ctx.fillStyle = '#0a0a18';
    roundRect(ctx, x, y, HUD_PORTRAIT_SIZE, HUD_PORTRAIT_SIZE, 3);
    ctx.fill();
    const grad = ctx.createLinearGradient(x, y, x + HUD_PORTRAIT_SIZE, y + HUD_PORTRAIT_SIZE);
    grad.addColorStop(0, col);
    grad.addColorStop(1, shiftColor(col, -40));
    ctx.fillStyle = grad;
    roundRect(ctx, x + 2, y + 2, HUD_PORTRAIT_SIZE - 4, HUD_PORTRAIT_SIZE - 4, 2);
    ctx.fill();
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(charId[0].toUpperCase(), x + HUD_PORTRAIT_SIZE / 2, y + HUD_PORTRAIT_SIZE / 2);
    ctx.strokeStyle = 'rgba(200, 168, 50, 0.4)';
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, HUD_PORTRAIT_SIZE, HUD_PORTRAIT_SIZE, 3);
    ctx.stroke();
  }
}

export function drawHUD(ctx: CanvasRenderingContext2D, fighters: Fighter[], tick: number, delayedHealth: [number, number], p1Wins: number = 0, p2Wins: number = 0, p1Name: string = '', p2Name: string = '', currentRound: number = 1, firstAttacker: number | null = null): void {
  if (fighters.length < 2) return;

  // Update damage flash tracking
  updateDamageFlash(fighters);

  // HUD background — dark gradient, slightly taller for name plates
  const hudGrad = ctx.createLinearGradient(0, 0, 0, 62);
  hudGrad.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
  hudGrad.addColorStop(1, 'rgba(10, 8, 15, 0.88)');
  ctx.fillStyle = hudGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, 62);

  // Top gold decorative line — asymmetric P1/P2 colors meeting in center
  const borderGrad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, 0);
  borderGrad.addColorStop(0, '#cc880044');
  borderGrad.addColorStop(0.2, '#cc8800aa');
  borderGrad.addColorStop(0.4, '#ffcc4466');
  borderGrad.addColorStop(0.5, '#ffffff44');
  borderGrad.addColorStop(0.6, '#ffcc4466');
  borderGrad.addColorStop(0.8, '#4466ccaa');
  borderGrad.addColorStop(1, '#4466cc44');
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 62); ctx.lineTo(CANVAS_WIDTH, 62); ctx.stroke();

  // ===== Character portraits in HUD =====
  const p1PortraitX = HUD_MARGIN - HUD_PORTRAIT_SIZE - 6;
  const p1PortraitY = HUD_BAR_Y - 2;
  drawHUDPortrait(ctx, fighters[0].charId, p1PortraitX, p1PortraitY, Math.max(0, fighters[0].health / MAX_HEALTH));

  const p2PortraitX = CANVAS_WIDTH - HUD_MARGIN + 6;
  const p2PortraitY = HUD_BAR_Y - 2;
  drawHUDPortrait(ctx, fighters[1].charId, p2PortraitX, p2PortraitY, Math.max(0, fighters[1].health / MAX_HEALTH));

  // ===== P1 side =====
  drawSNKText(ctx, '1P', HUD_MARGIN + 8, HUD_BAR_Y - 3, 12, '#ff4444', '#000000', 'center');
  if (p1Name) {
    drawSNKText(ctx, p1Name, HUD_MARGIN + 22, HUD_BAR_Y - 8, 10, '#cccccc', '#000000', 'left');
  }
  const p1Ratio = Math.max(0, fighters[0].health / MAX_HEALTH);
  const p1DelayedRatio = Math.max(0, delayedHealth[0] / MAX_HEALTH);
  drawHealthBar(ctx, HUD_MARGIN, HUD_BAR_Y, HUD_BAR_WIDTH, HUD_BAR_HEIGHT, p1Ratio, p1DelayedRatio, true, tick, damageFlash[0]);
  drawGuardGauge(ctx, HUD_MARGIN, HUD_BAR_Y + HUD_BAR_HEIGHT + 3, HUD_BAR_WIDTH, 5, fighters[0].guardGauge, true, tick);

  // P1 low health warning — pulsing red bar outline + exclamation
  if (p1Ratio <= 0.25 && p1Ratio > 0) {
    const warnAlpha = 0.4 + 0.4 * Math.sin(tick * 0.2);
    ctx.save();
    ctx.strokeStyle = `rgba(255, 30, 0, ${warnAlpha})`;
    ctx.lineWidth = 3;
    roundRect(ctx, HUD_MARGIN - 4, HUD_BAR_Y - 4, HUD_BAR_WIDTH + 8, HUD_BAR_HEIGHT + 8, 6);
    ctx.stroke();
    ctx.restore();
    if (tick % 30 < 20) {
      drawSNKText(ctx, '!', HUD_MARGIN + 8, HUD_BAR_Y + HUD_BAR_HEIGHT + 14, 11, '#ff2200', '#000000', 'center');
    }
  }

  // ===== P2 side =====
  drawSNKText(ctx, '2P', CANVAS_WIDTH - HUD_MARGIN - 18, HUD_BAR_Y - 3, 12, '#4488ff', '#000000', 'center');
  if (p2Name) {
    drawSNKText(ctx, p2Name, CANVAS_WIDTH - HUD_MARGIN - 22, HUD_BAR_Y - 8, 10, '#cccccc', '#000000', 'right');
  }
  const p2Ratio = Math.max(0, fighters[1].health / MAX_HEALTH);
  const p2DelayedRatio = Math.max(0, delayedHealth[1] / MAX_HEALTH);
  drawHealthBar(ctx, CANVAS_WIDTH - HUD_MARGIN - HUD_BAR_WIDTH, HUD_BAR_Y, HUD_BAR_WIDTH, HUD_BAR_HEIGHT, p2Ratio, p2DelayedRatio, false, tick, damageFlash[1]);
  drawGuardGauge(ctx, CANVAS_WIDTH - HUD_MARGIN - HUD_BAR_WIDTH, HUD_BAR_Y + HUD_BAR_HEIGHT + 3, HUD_BAR_WIDTH, 5, fighters[1].guardGauge, false, tick);

  // P2 low health warning
  if (p2Ratio <= 0.25 && p2Ratio > 0) {
    const warnAlpha = 0.4 + 0.4 * Math.sin(tick * 0.2);
    ctx.save();
    ctx.strokeStyle = `rgba(255, 30, 0, ${warnAlpha})`;
    ctx.lineWidth = 3;
    roundRect(ctx, CANVAS_WIDTH - HUD_MARGIN - HUD_BAR_WIDTH - 4, HUD_BAR_Y - 4, HUD_BAR_WIDTH + 8, HUD_BAR_HEIGHT + 8, 6);
    ctx.stroke();
    ctx.restore();
    if (tick % 30 < 20) {
      drawSNKText(ctx, '!', CANVAS_WIDTH - HUD_MARGIN - 18, HUD_BAR_Y + HUD_BAR_HEIGHT + 14, 11, '#ff2200', '#000000', 'center');
    }
  }

  // ===== First Attack marker =====
  if (firstAttacker !== null) {
    const faColor = firstAttacker === 0 ? '#ff6644' : '#4488ff';
    const faX = firstAttacker === 0 ? HUD_MARGIN + HUD_BAR_WIDTH + 10 : CANVAS_WIDTH - HUD_MARGIN - HUD_BAR_WIDTH - 10;
    const faY = HUD_BAR_Y + HUD_BAR_HEIGHT + 16;
    const pulse = Math.sin(tick * 0.1) * 0.3 + 0.7;
    ctx.globalAlpha = pulse;
    drawSNKText(ctx, 'FA', faX + (firstAttacker === 0 ? 30 : -30), faY, 8, faColor, '#000000', 'center');
    ctx.globalAlpha = 1;
  }

  // ===== Timer display — KOF2002 arcade-authentic =====
  const timeSeconds = Math.max(0, ROUND_TIME - Math.floor(tick / 60));
  const timeStr = timeSeconds.toString().padStart(2, '0');
  const timerX = CANVAS_WIDTH / 2;
  const timerY = HUD_BAR_Y + 8;
  const isUrgent = timeSeconds <= 10;
  const isCritical = timeSeconds <= 5;

  // "TIME" label above the timer — gold with brighter styling
  const timeLabelColor = isCritical ? '#ff6644' : isUrgent ? '#ffcc44' : 'rgba(200, 168, 50, 0.9)';
  drawSNKText(ctx, 'TIME', timerX, timerY - 17, 10, timeLabelColor, '#000000', 'center');

  // Timer background — recessed slot with bevel
  const urgentPulse = isUrgent ? (Math.sin(tick * 0.25) * 0.35 + 0.45) : 0;
  const bgR = Math.round(12 + urgentPulse * 200);
  const bgG = Math.round(8 + (isCritical ? urgentPulse * 20 : 0));
  // Outer bevel
  ctx.fillStyle = isUrgent ? `rgba(${bgR}, ${bgG}, 15, 0.92)` : 'rgba(8, 8, 20, 0.92)';
  roundRect(ctx, timerX - 33, timerY - 14, 66, 36, 9);
  ctx.fill();
  // Inner darker area
  ctx.fillStyle = isUrgent ? `rgba(${Math.round(bgR * 0.6)}, 5, 10, 0.95)` : 'rgba(5, 5, 14, 0.95)';
  roundRect(ctx, timerX - 30, timerY - 11, 60, 30, 7);
  ctx.fill();

  // Gold border — pulses brighter when urgent
  const goldBorderAlpha = isUrgent ? (0.6 + urgentPulse * 0.4) : 0.5;
  ctx.strokeStyle = isCritical ? `rgba(255, 80, 40, ${goldBorderAlpha})` : `rgba(200, 168, 50, ${goldBorderAlpha})`;
  ctx.lineWidth = 2;
  roundRect(ctx, timerX - 33, timerY - 14, 66, 36, 9);
  ctx.stroke();
  // Inner border
  ctx.strokeStyle = isUrgent ? `rgba(255, 100, 60, ${goldBorderAlpha * 0.4})` : 'rgba(200, 168, 50, 0.25)';
  ctx.lineWidth = 1;
  roundRect(ctx, timerX - 30, timerY - 11, 60, 30, 7);
  ctx.stroke();

  // Red glow halo when urgent
  if (isUrgent) {
    ctx.save();
    ctx.shadowColor = isCritical ? `rgba(255, 30, 0, ${0.5 + urgentPulse * 0.3})` : `rgba(255, 80, 40, ${urgentPulse * 0.4})`;
    ctx.shadowBlur = isCritical ? 20 : 12;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0)';
    roundRect(ctx, timerX - 33, timerY - 14, 66, 36, 9);
    ctx.stroke();
    ctx.restore();
  }

  // Timer text — larger pixel font (SNK ROM style) with color-coded urgency
  const timerColor = isCritical ? '#ff2222' : isUrgent ? '#ff5533' : timeSeconds <= 30 ? '#ffcc44' : '#eeeeee';
  const timerScale = isUrgent ? 1.6 : 1.3;

  if (isUrgent) {
    // Urgent timer: blink + strong red glow + pixel shake
    const blinkSpeed = isCritical ? 0.5 : 0.25;
    const blink = Math.sin(tick * blinkSpeed) > -0.2;
    if (blink) {
      ctx.save();
      // Red shadow glow behind digits
      ctx.shadowColor = isCritical ? '#ff0000' : '#ff4400';
      ctx.shadowBlur = isCritical ? 18 : 14;
      // Subtle horizontal shake at critical
      const shakeX = isCritical ? Math.sin(tick * 1.5) * 1.2 : 0;
      drawPixelText(ctx, timeStr, timerX + shakeX, timerY - 6, timerScale, timerColor);
      ctx.restore();
      // SNK text fallback layer
      drawSNKText(ctx, timeStr, timerX + (isCritical ? Math.sin(tick * 1.5) * 1.2 : 0), timerY - 1, 28, timerColor);
    }
  } else {
    // Normal timer: steady display with subtle glow
    ctx.save();
    ctx.shadowColor = 'rgba(200, 168, 50, 0.2)';
    ctx.shadowBlur = 6;
    drawPixelText(ctx, timeStr, timerX, timerY - 6, timerScale, timerColor);
    ctx.restore();
    drawSNKText(ctx, timeStr, timerX, timerY - 1, 28, timerColor);
  }

  // ===== Round indicator — diamond shapes (up to 3 rounds) =====
  const maxRounds = 3;
  const dotY = timerY + 22;
  const dotSpacing = 12;
  const dotsStartX = timerX - ((maxRounds - 1) * dotSpacing) / 2;
  for (let r = 1; r <= maxRounds; r++) {
    const dx = dotsStartX + (r - 1) * dotSpacing;
    const ds = r === currentRound ? 3.5 : 2.5;
    ctx.beginPath();
    ctx.moveTo(dx, dotY - ds);
    ctx.lineTo(dx + ds, dotY);
    ctx.lineTo(dx, dotY + ds);
    ctx.lineTo(dx - ds, dotY);
    ctx.closePath();
    if (r === currentRound) {
      const pulse = 0.7 + 0.3 * Math.sin(tick * 0.1);
      ctx.fillStyle = `rgba(255, 204, 0, ${pulse})`;
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (r < currentRound) {
      ctx.fillStyle = '#555';
      ctx.fill();
    } else {
      ctx.strokeStyle = 'rgba(200, 168, 50, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // ===== Win marks — KOF2002 diamond style =====
  const winMarkerY = HUD_BAR_Y + HUD_BAR_HEIGHT + 16;
  const winSpacing = HUD_WIN_MARKER_SIZE * 3;
  for (let i = 0; i < p1Wins; i++) {
    drawWinDiamond(ctx, HUD_MARGIN + HUD_BAR_WIDTH + 10 + i * winSpacing, winMarkerY, HUD_WIN_MARKER_SIZE, '#ff6644', tick);
  }
  for (let i = 0; i < p2Wins; i++) {
    drawWinDiamond(ctx, CANVAS_WIDTH - HUD_MARGIN - HUD_BAR_WIDTH - 10 - i * winSpacing, winMarkerY, HUD_WIN_MARKER_SIZE, '#4488ff', tick);
  }

  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  // ===== Character name plates below health bars =====
  drawNamePlate(ctx, HUD_MARGIN, HUD_BAR_Y + HUD_BAR_HEIGHT + 26, p1Name, '#ff6644', 'left');
  drawNamePlate(ctx, CANVAS_WIDTH - HUD_MARGIN, HUD_BAR_Y + HUD_BAR_HEIGHT + 26, p2Name, '#4488ff', 'right');

  // ===== Screen edge red pulse when time < 10 (stronger at < 5) =====
  if (timeSeconds <= 10) {
    const intensity = isCritical ? 1.0 : 0.4;
    const vPulse = Math.sin(tick * (isCritical ? 0.3 : 0.2)) * 0.15 * intensity + 0.12 * intensity;
    const vGrad = ctx.createRadialGradient(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.3, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.65);
    vGrad.addColorStop(0, 'rgba(255, 0, 0, 0)');
    vGrad.addColorStop(1, `rgba(255, 0, 0, ${vPulse})`);
    ctx.fillStyle = vGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // Additional top/bottom edge vignette at critical
    if (isCritical) {
      const edgeAlpha = 0.1 + 0.12 * Math.sin(tick * 0.35);
      ctx.fillStyle = `rgba(180, 0, 0, ${edgeAlpha})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, 40);
      ctx.fillRect(0, CANVAS_HEIGHT - 40, CANVAS_WIDTH, 40);
    }
  }
}

// ===== Health bar with HP-based gradient, segments, damage flash, low-HP pulse =====

/**
 * Get HP-ratio-based color: green -> yellow -> red
 * KOF2002 authentic: HP bar color shifts based on remaining health
 */
function getHealthColor(ratio: number): string {
  if (ratio > 0.6) {
    // Green to yellow-green
    const t = (ratio - 0.6) / 0.4; // 0 at 60%, 1 at 100%
    const r = Math.round(200 - t * 100);
    const g = Math.round(180 + t * 40);
    const b = Math.round(20 - t * 20);
    return `rgb(${r}, ${g}, ${b})`;
  } else if (ratio > 0.3) {
    // Yellow to orange
    const t = (ratio - 0.3) / 0.3; // 0 at 30%, 1 at 60%
    const r = Math.round(255 - t * 55);
    const g = Math.round(140 + t * 40);
    const b = Math.round(0);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Orange to red
    const t = ratio / 0.3; // 0 at 0%, 1 at 30%
    const r = 255;
    const g = Math.round(40 * t);
    const b = 0;
    return `rgb(${r}, ${g}, ${b})`;
  }
}

function drawHealthBar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  ratio: number, delayedRatio: number,
  leftAligned: boolean, frameCount: number,
  flash: DamageFlashState,
): void {
  // Outer frame — dark background + border (pulses red when low HP)
  ctx.fillStyle = '#05050a';
  roundRect(ctx, x - 3, y - 3, w + 6, h + 6, 5);
  ctx.fill();

  const isLowHP = ratio <= 0.25;
  const borderPulse = isLowHP ? (Math.sin(frameCount * 0.2) * 0.3 + 0.5) : 0.4;
  const borderCol = isLowHP ? `rgba(255, 60, 0, ${borderPulse})` : 'rgba(200, 168, 50, 0.4)';
  ctx.strokeStyle = borderCol;
  ctx.lineWidth = isLowHP ? 2 : 1;
  roundRect(ctx, x - 3, y - 3, w + 6, h + 6, 5);
  ctx.stroke();

  // Inner background
  ctx.fillStyle = '#0f0f18';
  roundRect(ctx, x, y, w, h, 3);
  ctx.fill();

  // 10% segment dividers — KOF2002 style embedded lines
  for (let t = 0.1; t < 1; t += 0.1) {
    const tx = leftAligned ? x + w * t : x + w * (1 - t);
    ctx.strokeStyle = 'rgba(5, 5, 15, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(tx, y + 1); ctx.lineTo(tx, y + h - 1); ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(tx + 1, y + 1); ctx.lineTo(tx + 1, y + h - 1); ctx.stroke();
  }

  // Delayed health bar (red ghost)
  const delayedFillW = Math.round(w * delayedRatio);
  if (delayedFillW > 0 && delayedRatio > ratio) {
    ctx.fillStyle = 'rgba(200, 60, 40, 0.6)';
    if (leftAligned) {
      roundRect(ctx, x, y, delayedFillW, h, 3);
      ctx.fill();
    } else {
      roundRect(ctx, x + w - delayedFillW, y, delayedFillW, h, 3);
      ctx.fill();
    }
  }

  // Damage flash — white flash on the damaged portion
  if (flash.timer > 0 && flash.toRatio > flash.fromRatio) {
    const flashProgress = flash.timer / flash.maxTimer; // 1 at start, 0 at end
    const flashFromX = leftAligned ? x + w * flash.fromRatio : x + w * (1 - flash.toRatio);
    const flashWidth = Math.round(w * (flash.toRatio - flash.fromRatio));
    if (flashWidth > 0) {
      // White flash that fades to transparent
      const flashAlpha = flashProgress * 0.8;
      ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
      if (leftAligned) {
        ctx.fillRect(flashFromX, y, flashWidth, h);
      } else {
        // Flash from the right side of the bar
        ctx.fillRect(Math.round(x + w * (1 - flash.toRatio)), y, flashWidth, h);
      }
    }
  }

  // Health bar fill — HP-ratio-based gradient color
  const fillW = Math.round(w * ratio);
  if (fillW <= 0) return;

  const healthColor = getHealthColor(ratio);
  const healthGrad = ctx.createLinearGradient(x, y, x, y + h);
  healthGrad.addColorStop(0, shiftColor(healthColor, 50));
  healthGrad.addColorStop(0.3, shiftColor(healthColor, 20));
  healthGrad.addColorStop(0.7, healthColor);
  healthGrad.addColorStop(1, shiftColor(healthColor, -30));

  // Low HP glow effect — pulsing shadow
  if (isLowHP) {
    ctx.save();
    const isCritical = ratio < 0.1;
    const pulseSpeed = isCritical ? 0.3 : 0.1;
    const pulseAlpha = isCritical ? 0.5 + 0.3 * Math.sin(frameCount * pulseSpeed) : 0.3 + 0.2 * Math.sin(frameCount * pulseSpeed);
    const glowColor = isCritical ? `rgba(255, 30, 0, ${pulseAlpha})` : `rgba(255, 100, 0, ${pulseAlpha + 0.3})`;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = isCritical ? 16 + 8 * Math.sin(frameCount * 0.25) : 10 + 5 * Math.sin(frameCount * 0.15);
    ctx.fillStyle = healthGrad;
    if (leftAligned) {
      roundRect(ctx, x, y, fillW, h, 3);
      ctx.fill();
    } else {
      roundRect(ctx, x + w - fillW, y, fillW, h, 3);
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.fillStyle = healthGrad;
  if (leftAligned) {
    roundRect(ctx, x, y, fillW, h, 3);
    ctx.fill();
  } else {
    roundRect(ctx, x + w - fillW, y, fillW, h, 3);
    ctx.fill();
  }

  // Top highlight stripe
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  const shineW = Math.max(0, fillW - 6);
  if (shineW > 0) {
    if (leftAligned) {
      ctx.fillRect(x + 3, y + 1, shineW, 3);
    } else {
      ctx.fillRect(x + w - fillW + 3, y + 1, shineW, 3);
    }
  }

  // Inner border
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 3);
  ctx.stroke();
}

// ===== Guard gauge =====

function drawGuardGauge(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, gauge: number, leftAligned: boolean, tick: number = 0): void {
  const ratio = Math.max(0, Math.min(1, gauge / 100));
  const fillW = w * ratio;
  const critShake = ratio > 0 && ratio < 0.2 ? Math.sin(tick * 0.5) * 1.5 : 0;
  const sx = x + critShake;
  const sy = y;
  ctx.fillStyle = '#05050a';
  ctx.fillRect(sx - 1, sy - 1, w + 2, h + 2);
  ctx.fillStyle = '#0f0f18';
  ctx.fillRect(sx, sy, w, h);
  if (fillW > 0) {
    let gaugeColor: string;
    if (ratio > 0.6) {
      gaugeColor = '#4488ff';
    } else if (ratio > 0.3) {
      gaugeColor = '#ccaa22';
    } else {
      const blink = Math.sin(tick * 0.3) > 0;
      gaugeColor = blink ? '#ff4455' : '#cc2233';
    }
    const grad = ctx.createLinearGradient(sx, sy, sx, sy + h);
    grad.addColorStop(0, shiftColor(gaugeColor, 40));
    grad.addColorStop(0.5, gaugeColor);
    grad.addColorStop(1, shiftColor(gaugeColor, -20));
    ctx.fillStyle = grad;
    if (leftAligned) {
      ctx.fillRect(sx, sy, fillW, h);
    } else {
      ctx.fillRect(sx + w - fillW, sy, fillW, h);
    }
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.strokeRect(sx, sy, w, h);
  if (ratio <= 0.3 && ratio > 0) {
    const warnPulse = Math.sin(tick * 0.25) * 0.5 + 0.5;
    ctx.strokeStyle = `rgba(255, 40, 40, ${warnPulse * 0.8})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(sx - 1, sy - 1, w + 2, h + 2);
  }
  if (ratio > 0 && ratio < 0.2) {
    const critGlow = Math.sin(tick * 0.4) * 0.3 + 0.4;
    ctx.save();
    ctx.shadowColor = `rgba(255, 30, 30, ${critGlow})`;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = `rgba(255, 60, 40, ${critGlow})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(sx - 2, sy - 2, w + 4, h + 4);
    ctx.restore();
  }
  if (ratio >= 0.8) {
    const greenPulse = Math.sin(tick * 0.08) * 0.15 + 0.15;
    ctx.strokeStyle = `rgba(68, 255, 136, ${greenPulse})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(sx - 1, sy - 1, w + 2, h + 2);
  }
}

// ===== Power gauge with tick marks, glow, DM-ready flash =====

/**
 * Energy gauge rendering — KOF2002 arcade-authentic segmented power gauge
 * 3 bold segments separated by 2px black + 1px gold-highlight dividers.
 * Filled segments: deep blue (#2255aa) to gold-blue (#ffcc44) horizontal gradient.
 * MAX mode: radialGradient green halo with shadowBlur=15.
 * DM-ready: double-layer pulsing border (outer gold + inner white).
 */
export function drawPowerGauges(ctx: CanvasRenderingContext2D, gauges: [PowerGauge, PowerGauge], maxModes: [MaxModeState, MaxModeState]): void {
  const gaugeY = HUD_GAUGE_Y;
  const gaugeW = HUD_GAUGE_WIDTH;
  const gaugeH = HUD_GAUGE_HEIGHT;
  // KOF2002 authentic: 3 segments for 3-level super stock gauge
  const numSegments = 3;
  const segGap = 5; // total gap width: 2px black + 1px gold highlight on each side
  const segW = (gaugeW - (numSegments - 1) * segGap) / numSegments;
  const now = Date.now();

  for (let p = 0; p < 2; p++) {
    const gauge = gauges[p];
    const maxMode = maxModes[p];
    const isP1 = p === 0;
    const baseX = isP1 ? HUD_MARGIN : CANVAS_WIDTH - HUD_MARGIN - gaugeW;

    // Map actual stocks/meter onto the 3 visual segments
    // With MAX_STOCKS=5, we map: stocks 0-1 = seg 0, stocks 2-3 = seg 1, stocks 4+ = seg 2
    const totalMeter = gauge.stocks * gauge.maxMeter + gauge.meter;
    const totalMax = MAX_STOCKS * gauge.maxMeter;
    const meterRatio = totalMeter / totalMax;

    // Calculate per-segment fill: how many of the 3 visual segments are full / charging
    const filledSegments = Math.min(numSegments, Math.floor(meterRatio * numSegments + 0.001));
    const partialFill = (meterRatio * numSegments) - filledSegments;

    // ---- Outer frame: dark recessed slot with gold beveled border ----
    ctx.fillStyle = '#1a1a28';
    roundRect(ctx, baseX - 4, gaugeY - 4, gaugeW + 8, gaugeH + 8, 6);
    ctx.fill();
    ctx.fillStyle = '#08080f';
    roundRect(ctx, baseX - 3, gaugeY - 3, gaugeW + 6, gaugeH + 6, 5);
    ctx.fill();

    // Gold border — brighter when meter is high
    const borderBright = Math.min(1, 0.3 + meterRatio * 0.5);
    ctx.strokeStyle = `rgba(200, 168, 50, ${borderBright})`;
    ctx.lineWidth = 1.5;
    roundRect(ctx, baseX - 4, gaugeY - 4, gaugeW + 8, gaugeH + 8, 6);
    ctx.stroke();

    // ---- Each visual segment ----
    for (let s = 0; s < numSegments; s++) {
      const segX = baseX + s * (segW + segGap);
      const isFilled = s < filledSegments;
      const isCharging = s === filledSegments && partialFill > 0;

      // Segment recessed background — dark grey-blue (#1a1a2a)
      const emptyGrad = ctx.createLinearGradient(segX, gaugeY, segX, gaugeY + gaugeH);
      emptyGrad.addColorStop(0, '#1a1a2a');
      emptyGrad.addColorStop(0.5, '#12121e');
      emptyGrad.addColorStop(1, '#0a0a14');
      ctx.fillStyle = emptyGrad;
      ctx.fillRect(segX, gaugeY, segW, gaugeH);

      if (isFilled) {
        // ---- Filled segment: deep blue (#2255aa) to gold-blue (#ffcc44) horizontal gradient ----
        const pulsePhase = Math.sin(now / 150 + s * 0.8);
        const pulseAlpha = 0.85 + 0.15 * pulsePhase;
        ctx.save();
        // Per-segment inner glow
        ctx.shadowColor = `rgba(100, 170, 255, ${pulseAlpha * 0.4})`;
        ctx.shadowBlur = 3 + 2 * pulsePhase;

        // Horizontal gradient: deep blue -> gold-blue across the segment width
        const segGrad = ctx.createLinearGradient(segX, gaugeY, segX + segW, gaugeY);
        segGrad.addColorStop(0, '#2255aa');
        segGrad.addColorStop(0.3, '#3377cc');
        segGrad.addColorStop(0.55, '#88bbee');
        segGrad.addColorStop(0.75, '#ddbb66');
        segGrad.addColorStop(1, '#ffcc44');
        ctx.fillStyle = segGrad;
        ctx.fillRect(segX, gaugeY, segW, gaugeH);
        ctx.restore();

        // Vertical specular highlight on top edge
        ctx.fillStyle = `rgba(220, 235, 255, ${0.3 + 0.1 * pulsePhase})`;
        ctx.fillRect(segX + 1, gaugeY, segW - 2, 2);
        // Bottom shadow edge
        ctx.fillStyle = 'rgba(0, 0, 30, 0.4)';
        ctx.fillRect(segX + 1, gaugeY + gaugeH - 2, segW - 2, 2);
      } else if (isCharging) {
        // ---- Charging segment: partial fill, dark teal to bright cyan ----
        const fillW = partialFill * segW;
        const nearFull = partialFill > 0.75;
        const chargeBright = nearFull ? 0.7 + 0.3 * Math.sin(now / 100) : 1.0;
        ctx.save();
        ctx.globalAlpha = chargeBright;
        // Gradient from dark cyan-teal to bright blue as it charges
        const chargeGrad = ctx.createLinearGradient(segX, gaugeY, segX + fillW, gaugeY);
        chargeGrad.addColorStop(0, nearFull ? '#3377aa' : '#223355');
        chargeGrad.addColorStop(0.5, nearFull ? '#4499cc' : '#335577');
        chargeGrad.addColorStop(1, nearFull ? '#66bbee' : '#447799');
        ctx.fillStyle = chargeGrad;
        ctx.fillRect(segX, gaugeY, fillW, gaugeH);
        // Charging specular highlight
        ctx.fillStyle = `rgba(150, 200, 255, ${nearFull ? 0.3 : 0.1})`;
        ctx.fillRect(segX, gaugeY, fillW, 2);
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      // ---- 2px black divider + 1px gold highlight on each side between segments ----
      if (s < numSegments - 1) {
        const divX = segX + segW + 1; // 1px padding for gold highlight
        // Left gold highlight edge (1px)
        ctx.fillStyle = 'rgba(200, 168, 50, 0.35)';
        ctx.fillRect(divX - 1, gaugeY - 1, 1, gaugeH + 2);
        // Center black divider (2px)
        ctx.fillStyle = '#000000';
        ctx.fillRect(divX, gaugeY - 1, 2, gaugeH + 2);
        // Right gold highlight edge (1px)
        ctx.fillStyle = 'rgba(200, 168, 50, 0.35)';
        ctx.fillRect(divX + 2, gaugeY - 1, 1, gaugeH + 2);
      }

      // Segment inner border
      ctx.strokeStyle = isFilled ? 'rgba(150, 200, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.strokeRect(segX, gaugeY, segW, gaugeH);
    }

    // ---- Meter-above-50% glow: stronger outer glow effect ----
    if (meterRatio > 0.5 && !maxMode.active) {
      const glowPulse = Math.sin(now / 200) * 0.2 + 0.35;
      ctx.save();
      ctx.shadowColor = `rgba(80, 160, 255, ${glowPulse})`;
      ctx.shadowBlur = 14;
      ctx.strokeStyle = `rgba(100, 180, 255, ${glowPulse * 0.8})`;
      ctx.lineWidth = 2;
      roundRect(ctx, baseX - 5, gaugeY - 5, gaugeW + 10, gaugeH + 10, 7);
      ctx.stroke();
      ctx.restore();
    }

    // ---- DM-ready: double-layer pulsing border (at least 1 stock, not MAX) ----
    if (gauge.stocks >= 1 && !maxMode.active) {
      const readyPulse = Math.sin(now / 200) * 0.25 + 0.35;
      const readyVisible = Math.sin(now / 200) > -0.3;
      if (readyVisible) {
        // Outer gold border
        ctx.strokeStyle = `rgba(255, 200, 80, ${readyPulse})`;
        ctx.lineWidth = 2;
        roundRect(ctx, Math.round(baseX) - 3, gaugeY - 3, gaugeW + 6, gaugeH + 6, 6);
        ctx.stroke();
        // Inner white border
        ctx.strokeStyle = `rgba(255, 255, 255, ${readyPulse * 0.5})`;
        ctx.lineWidth = 1;
        roundRect(ctx, Math.round(baseX) - 1, gaugeY - 1, gaugeW + 2, gaugeH + 2, 4);
        ctx.stroke();
      }
    }

    // ---- Full meter: "MAX" text with strong DM-ready double-layer flash ----
    if (!maxMode.active && gauge.stocks >= MAX_STOCKS) {
      const pulseAlpha = 0.7 + 0.3 * Math.sin(now / 120);
      ctx.save();
      ctx.globalAlpha = pulseAlpha;
      ctx.shadowColor = '#ff8800';
      ctx.shadowBlur = 16 + 6 * Math.sin(now / 80);
      drawSNKText(ctx, 'MAX', isP1 ? baseX + gaugeW + 16 : baseX - 16, gaugeY + 7, 14, '#ffcc00', '#000000', isP1 ? 'left' : 'right');
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      ctx.restore();

      // Double-layer DM-ready flash border with pulse rhythm
      const dmFlash = Math.sin(now / 100) > 0;
      if (dmFlash) {
        ctx.save();
        // Outer gold glow ring
        ctx.shadowColor = '#ffcc00';
        ctx.shadowBlur = 18;
        ctx.strokeStyle = 'rgba(255, 200, 0, 0.7)';
        ctx.lineWidth = 2.5;
        roundRect(ctx, baseX - 6, gaugeY - 6, gaugeW + 12, gaugeH + 12, 8);
        ctx.stroke();
        // Inner white flash layer
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1.5;
        roundRect(ctx, baseX - 3, gaugeY - 3, gaugeW + 6, gaugeH + 6, 5);
        ctx.stroke();
        ctx.restore();
      }
    }

    // ---- MAX mode: radialGradient green halo with shadowBlur=15 ----
    if (maxMode.active) {
      const pct = maxMode.timer / maxMode.maxDuration;

      // Green radialGradient halo covering entire gauge area
      const centerX = baseX + gaugeW / 2;
      const centerY = gaugeY + gaugeH / 2;
      const haloRadius = Math.max(gaugeW, gaugeH) * 0.7;
      const flickerPhase = Math.sin(now / 60);
      const flickerAlpha = 0.15 + 0.12 * flickerPhase;

      ctx.save();
      const greenHalo = ctx.createRadialGradient(
        centerX, centerY, haloRadius * 0.1,
        centerX, centerY, haloRadius,
      );
      greenHalo.addColorStop(0, `rgba(100, 255, 150, ${flickerAlpha * 1.5})`);
      greenHalo.addColorStop(0.4, `rgba(50, 255, 100, ${flickerAlpha})`);
      greenHalo.addColorStop(1, `rgba(0, 200, 80, 0)`);
      ctx.shadowColor = `rgba(0, 255, 100, ${0.5 + 0.3 * flickerPhase})`;
      ctx.shadowBlur = 15;
      ctx.fillStyle = greenHalo;
      ctx.fillRect(baseX - 8, gaugeY - 8, gaugeW + 16, gaugeH + 16);
      ctx.restore();

      // Outer green glow ring (shadowBlur=15)
      const outerGlow = Math.sin(now / 80) * 0.3 + 0.5;
      ctx.save();
      ctx.shadowColor = `rgba(0, 255, 100, ${outerGlow})`;
      ctx.shadowBlur = 15;
      ctx.strokeStyle = `rgba(100, 255, 150, ${outerGlow * 0.8})`;
      ctx.lineWidth = 2;
      roundRect(ctx, baseX - 6, gaugeY - 6, gaugeW + 12, gaugeH + 12, 8);
      ctx.stroke();
      ctx.restore();
      // Inner glow ring
      ctx.save();
      ctx.shadowColor = `rgba(200, 255, 220, ${outerGlow * 0.5})`;
      ctx.shadowBlur = 15;
      ctx.strokeStyle = `rgba(200, 255, 220, ${outerGlow * 0.4})`;
      ctx.lineWidth = 1;
      roundRect(ctx, baseX - 3, gaugeY - 3, gaugeW + 6, gaugeH + 6, 5);
      ctx.stroke();
      ctx.restore();

      // "MAX" label with green glow
      const pulseAlpha = 0.8 + Math.sin(now / 100) * 0.2;
      ctx.save();
      ctx.globalAlpha = pulseAlpha;
      ctx.shadowColor = '#00ff44';
      ctx.shadowBlur = 12;
      drawSNKText(ctx, 'MAX', isP1 ? baseX + gaugeW + 16 : baseX - 16, gaugeY + 7, 13, '#66ff88', '#000000', isP1 ? 'left' : 'right');
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      ctx.restore();

      // MAX timer bar
      const timerBarY = gaugeY + gaugeH + 5;
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      roundRect(ctx, Math.round(baseX), timerBarY, gaugeW, 5, 2);
      ctx.fill();
      const greenGrad = ctx.createLinearGradient(Math.round(baseX), timerBarY, Math.round(baseX + gaugeW * pct), timerBarY);
      greenGrad.addColorStop(0, '#22ff66');
      greenGrad.addColorStop(0.5, '#44ff88');
      greenGrad.addColorStop(1, '#88ffaa');
      ctx.fillStyle = greenGrad;
      roundRect(ctx, Math.round(baseX), timerBarY, Math.round(gaugeW * pct), 5, 2);
      ctx.fill();
      // Timer bar glow when running low
      if (pct < 0.3) {
        ctx.save();
        ctx.shadowColor = 'rgba(255, 60, 60, 0.5)';
        ctx.shadowBlur = 6;
        ctx.strokeStyle = 'rgba(255, 60, 60, 0.4)';
        ctx.lineWidth = 1;
        roundRect(ctx, Math.round(baseX), timerBarY, gaugeW, 5, 2);
        ctx.stroke();
        ctx.restore();
      }
      ctx.strokeStyle = 'rgba(100, 255, 100, 0.25)';
      ctx.lineWidth = 1;
      roundRect(ctx, Math.round(baseX), timerBarY, gaugeW, 5, 2);
      ctx.stroke();
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }
  }
}

// ===== Team display =====

export interface TeamDisplayInfo {
  members: { name: string; defeated: boolean; active: boolean }[];
}

export function drawTeamOrder(
  ctx: CanvasRenderingContext2D,
  p1Team: TeamDisplayInfo | null,
  p2Team: TeamDisplayInfo | null,
): void {
  if (!p1Team && !p2Team) return;
  const y = HUD_BAR_Y + HUD_BAR_HEIGHT + 14;
  ctx.font = 'bold 9px "Courier New", monospace';
  ctx.textBaseline = 'top';
  if (p1Team) drawTeamSide(ctx, p1Team, HUD_MARGIN, y, 'left');
  if (p2Team) drawTeamSide(ctx, p2Team, CANVAS_WIDTH - HUD_MARGIN, y, 'right');
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
}

function drawTeamSide(ctx: CanvasRenderingContext2D, team: TeamDisplayInfo, baseX: number, y: number, side: 'left' | 'right'): void {
  const spacing = 16;
  const total = team.members.length;
  for (let i = 0; i < total; i++) {
    const m = team.members[i];
    const x = side === 'left' ? baseX + i * spacing : baseX - (total - 1 - i) * spacing;
    if (m.defeated) {
      ctx.fillStyle = '#333';
    } else if (m.active) {
      ctx.fillStyle = '#443300';
      ctx.fillRect(x - 5, y - 1, 10, 11);
      ctx.fillStyle = '#ffcc00';
    } else {
      ctx.fillStyle = '#888';
    }
    ctx.textAlign = 'center';
    ctx.fillText(m.name[0], x, y);
    const dotY = y + 13;
    ctx.beginPath();
    ctx.arc(x, dotY, 3, 0, Math.PI * 2);
    ctx.fillStyle = m.defeated ? '#333' : m.active ? '#22cc55' : '#555';
    ctx.fill();
    if (m.active && !m.defeated) {
      ctx.strokeStyle = '#22cc55';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

// ===== Win diamond =====

/**
 * KOF2002 win diamond — inner gradient + gold border + highlight
 */
function drawWinDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, tick: number): void {
  const s = size;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 1;
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.lineTo(x + s, y);
  ctx.lineTo(x, y + s);
  ctx.lineTo(x - s, y);
  ctx.closePath();
  const innerGrad = ctx.createLinearGradient(x, y - s, x, y + s);
  innerGrad.addColorStop(0, shiftColor(color, 60));
  innerGrad.addColorStop(0.4, color);
  innerGrad.addColorStop(1, shiftColor(color, -50));
  ctx.fillStyle = innerGrad;
  ctx.fill();
  ctx.restore();
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.lineTo(x + s, y);
  ctx.lineTo(x, y + s);
  ctx.lineTo(x - s, y);
  ctx.closePath();
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Upper highlight
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.8);
  ctx.lineTo(x + s * 0.4, y - s * 0.1);
  ctx.lineTo(x, y + s * 0.1);
  ctx.lineTo(x - s * 0.4, y - s * 0.1);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fill();
  // Center glow pulse
  const glowPulse = 0.3 + 0.15 * Math.sin(tick * 0.08);
  ctx.beginPath();
  ctx.arc(x, y - s * 0.2, s * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 255, 200, ${glowPulse})`;
  ctx.fill();
}

// ===== Name plate =====

/**
 * Character name plate — below health bar, semi-transparent background + player color bar
 * Bold styling for the name text
 */
function drawNamePlate(ctx: CanvasRenderingContext2D, x: number, y: number, name: string, playerColor: string, align: 'left' | 'right'): void {
  if (!name) return;
  const text = `${playerColor === '#ff6644' ? 'P1' : 'P2'}: ${name}`;
  const plateW = 80;
  const plateH = 13;
  const plateX = align === 'left' ? x : x - plateW;
  // Semi-transparent background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  roundRect(ctx, plateX, y - 2, plateW, plateH, 3);
  ctx.fill();
  // Player color side bar
  ctx.fillStyle = playerColor;
  if (align === 'left') {
    ctx.fillRect(plateX, y - 2, 2, plateH);
  } else {
    ctx.fillRect(plateX + plateW - 2, y - 2, 2, plateH);
  }
  // Name text — bold
  drawSNKText(ctx, text, align === 'left' ? plateX + 5 : plateX + plateW - 5, y + 5, 9, 'rgba(220, 220, 220, 0.9)', '#000000', align);
}

// ===== Combo counter with color tiers and scale animation =====

/**
 * Combo counter — KOF2002 style
 * Color tiers: white (2-4) -> yellow (5-9) -> orange (10-19) -> red (20+)
 * Scale pop on increment
 */
export function drawComboCounters(
  ctx: CanvasRenderingContext2D,
  fighters: Fighter[],
  comboCount: number[],
  comboTimer: number[],
  camera: Camera,
  comboDamage?: number[],
): void {
  ctx.save();
  for (let i = 0; i < 2; i++) {
    if (comboCount[i] < 2) {
      comboAnim[i].prevCount = 0;
      comboAnim[i].scale = 1;
      continue;
    }

    // Detect combo increment for scale animation
    if (comboCount[i] > comboAnim[i].prevCount) {
      comboAnim[i].scale = 1.35; // Pop up on increment
    }
    comboAnim[i].prevCount = comboCount[i];

    // Smoothly decay scale back to 1.0
    comboAnim[i].scale += (1.0 - comboAnim[i].scale) * 0.15;

    const f = fighters[i];
    const sx = camera.worldToScreen(f.x);
    const sy = f.y - f.displayHeight - 30;
    const alpha = Math.min(1, comboTimer[i] < 30 ? 1 : 1 - (comboTimer[i] - 30) / 30);
    if (alpha <= 0) continue;

    ctx.globalAlpha = alpha;
    ctx.textAlign = 'center';

    const combo = comboCount[i];
    let comboColor: string;
    let glowColor: string;

    // Color tier system: white -> yellow -> orange -> red
    if (combo >= 20) { comboColor = '#ff2222'; glowColor = '#ff0000'; }
    else if (combo >= 10) { comboColor = '#ff8800'; glowColor = '#ff6600'; }
    else if (combo >= 5) { comboColor = '#ffcc00'; glowColor = '#ffaa00'; }
    else { comboColor = '#ffffff'; glowColor = '#ffcc44'; }

    // Font size with scale animation
    const baseFontSize = 20 + Math.min(combo, 15);
    const pulseScale = comboTimer[i] > 50 ? 1.15 : 1.0;
    const fontSize = baseFontSize * pulseScale * comboAnim[i].scale;

    // Fade-out blink
    const isFading = comboTimer[i] < 12;
    const flashCol = isFading && comboTimer[i] % 3 < 2 ? '#ffffff' : comboColor;
    const flashGlow = isFading ? '#ffffff' : glowColor;

    // 7+ combo: gold outline effect
    if (combo >= 7) {
      const goldGlow = Math.sin(Date.now() / 80) * 0.3 + 0.7;
      ctx.save();
      ctx.shadowColor = `rgba(255, 200, 0, ${goldGlow})`;
      ctx.shadowBlur = 16 + Math.min(combo, 15);
      ctx.font = `bold ${fontSize}px "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = `rgba(255, 200, 0, ${goldGlow * 0.8})`;
      ctx.lineWidth = Math.max(3, Math.round(fontSize / 5));
      ctx.lineJoin = 'round';
      ctx.strokeText(`${combo}`, sx, sy);
      ctx.restore();
    }

    // Combo number main text
    ctx.save();
    ctx.shadowColor = flashGlow;
    ctx.shadowBlur = 12 + Math.min(combo, 10);
    drawSNKText(ctx, `${combo}`, sx, sy, fontSize, flashCol);
    ctx.restore();

    // "HIT" label — small text at lower-right of number (KOF2002 layout)
    const hitOffsetX = 12 + Math.min(combo, 10) * 0.5;
    const hitOffsetY = 6;
    const hitColor = combo >= 7 ? '#ffcc00' : comboColor;
    drawSNKText(ctx, 'HIT', sx + hitOffsetX, sy + hitOffsetY, 9, hitColor);

    // Combo total damage
    if (comboDamage && comboDamage[i] > 0) {
      const totalDmg = comboDamage[i];
      const dmgCol = totalDmg >= 200 ? '#ff2222' : totalDmg >= 100 ? '#ff6644' : '#ffcc44';
      drawSNKText(ctx, `${totalDmg}`, sx, sy + 30, totalDmg >= 200 ? 15 : 13, dmgCol);
    }

    // Combo timer bar
    const ctRatio = Math.max(0, comboTimer[i] / 60);
    if (ctRatio > 0) {
      const barW = 30, barH = 2;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(sx - barW / 2, sy + 38, barW, barH);
      const ctCol = ctRatio > 0.5 ? '#22cc55' : ctRatio > 0.25 ? '#ffcc00' : '#ff4444';
      ctx.fillStyle = ctCol;
      ctx.fillRect(sx - barW / 2, sy + 38, barW * ctRatio, barH);
    }
  }
  ctx.restore();
}
