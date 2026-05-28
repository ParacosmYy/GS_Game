/**
 * HUD rendering — SNK-style health bars, power gauge, timer, guard gauge, combo counters
 * Upgraded: segmented HP bars with damage flash, HP gradient, low-HP pulse,
 *           meter tick marks / glow / DM-ready flash, timer "TIME" label + critical flash,
 *           round indicator with win marks, character name plates, combo counter with color tiers
 */
import { Fighter } from '../entities/fighter.js';
import { Camera } from '../core/camera.js';
import type { PowerGauge, MaxModeState, MoveListEntry, MoveCategory } from '../core/types.js';
import { FighterState } from '../core/types.js';
import { meterFlashTimers, meterStockFlashes } from './meterFlash.js';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, MAX_HEALTH, MAX_STOCKS, ROUND_TIME,
  HUD_BAR_WIDTH, HUD_BAR_HEIGHT, HUD_BAR_Y, HUD_MARGIN,
  HUD_TIMER_SIZE, HUD_GAUGE_Y, HUD_GAUGE_WIDTH, HUD_GAUGE_HEIGHT,
  HUD_GAUGE_SEGMENT_GAP, HUD_WIN_MARKER_SIZE,
} from '../core/constants.js';
import { shiftColor, roundRect, drawSNKText } from './utils.js';
import { drawComboCounters } from './hudComboCounter.js';
import { drawPowerGauges } from './hudPowerGauges.js';
export { drawPowerGauges } from './hudPowerGauges.js';
import { ROSTER } from '../characters/index.js';
import { drawPixelPortrait } from './pixelPortraits.js';
import { getPortraitForSize } from './manifestRenderData.js';

const charById = new Map(ROSTER.map(c => [c.id, c]));

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

// ===== Arcade Score & Stats =====
let arcadeScore = 0;
let displayScore = 0;
let arcadePerfectCount = 0;
let arcadeMatchCount = 0;
let arcadeCumulativeCombo = 0;
let arcadeCumulativeDamage = 0;

// Score popup state
let scorePopupAmount = 0;
let scorePopupTimer = 0;

export function addArcadeScore(points: number): void {
  arcadeScore += points;
  // Trigger score popup
  scorePopupAmount = points;
  scorePopupTimer = 60;
}

export function getArcadeScore(): number { return arcadeScore; }

export function addArcadePerfect(): void { arcadePerfectCount++; }
export function addArcadeMatchWin(): void { arcadeMatchCount++; }
export function addArcadeCumulativeStats(combo: number, damage: number): void {
  arcadeCumulativeCombo = Math.max(arcadeCumulativeCombo, combo);
  arcadeCumulativeDamage += damage;
}

export function getArcadeStats(): { score: number; perfects: number; matches: number; maxCombo: number; totalDamage: number } {
  return { score: arcadeScore, perfects: arcadePerfectCount, matches: arcadeMatchCount, maxCombo: arcadeCumulativeCombo, totalDamage: arcadeCumulativeDamage };
}

export function resetArcadeScore(): void {
  arcadeScore = 0;
  displayScore = 0;
  arcadePerfectCount = 0;
  arcadeMatchCount = 0;
  arcadeCumulativeCombo = 0;
  arcadeCumulativeDamage = 0;
  scorePopupAmount = 0;
  scorePopupTimer = 0;
}

function tickArcadeScore(): void {
  // Smoothly roll up the display number
  if (displayScore < arcadeScore) {
    const diff = arcadeScore - displayScore;
    displayScore += Math.max(1, Math.ceil(diff * 0.15));
  }
}

// ===== Combo counter fade state (see ComboFadeState below) =====

/** HUD portrait size constants */
const HUD_PORTRAIT_SIZE = 30;

/**
 * Draw character portrait in HUD area.
 * Uses PixelPortraitData for characters that have one, falls back to colored square.
 */
function drawHUDPortrait(
  ctx: CanvasRenderingContext2D,
  charId: string,
  x: number, y: number,
  healthPercent: number,
): void {
  // Try size-specific portrait first, then fallback to CharacterDefinition.pixelPortrait
  const sizedPortrait = getPortraitForSize(charId, 'hud');
  const charDef = charById.get(charId);
  const portrait = sizedPortrait ?? charDef?.pixelPortrait;

  if (portrait) {
    ctx.save();
    ctx.beginPath();
    roundRect(ctx, x, y, HUD_PORTRAIT_SIZE, HUD_PORTRAIT_SIZE, 3);
    ctx.clip();
    // For HUD-sized portraits, use scale=1; for base portraits, fit into HUD area
    const isNativeSize = portrait.width === HUD_PORTRAIT_SIZE;
    const scale = isNativeSize ? 1 : Math.min(HUD_PORTRAIT_SIZE / portrait.width, HUD_PORTRAIT_SIZE / portrait.height);
    const pw = portrait.width * scale;
    const ph = portrait.height * scale;
    const ox = Math.floor((HUD_PORTRAIT_SIZE - pw) / 2);
    const oy = Math.floor((HUD_PORTRAIT_SIZE - ph) / 2);
    drawPixelPortrait(ctx, portrait, x + ox, y + oy, scale, {
      backdropColor: 'rgba(8, 8, 18, 0.9)',
      frameColor: charDef?.color ?? '#888',
    });
    // Low-health danger tint
    if (healthPercent < 0.25) {
      ctx.fillStyle = `rgba(180, 30, 10, ${0.15 + 0.1 * Math.sin(Date.now() * 0.008)})`;
      ctx.fillRect(x, y, HUD_PORTRAIT_SIZE, HUD_PORTRAIT_SIZE);
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(200, 168, 50, 0.4)';
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, HUD_PORTRAIT_SIZE, HUD_PORTRAIT_SIZE, 3);
    ctx.stroke();
  } else {
    // Fallback: colored square with initial letter
    const colors: Record<string, string> = {
      ryo: '#DD6600', kyo: '#FF6600', iori: '#AA1133', terry: '#CC8800', andy: '#FFAA22',
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

/** Color for each move category */
const MOVE_TYPE_COLORS: Record<string, string> = {
  command: '#88ccff',   // blue — command normals
  special: '#ffcc44',   // gold — specials
  dm: '#ff8844',        // orange — desperation moves
  sdm: '#ff4466',       // red — super DM
  hsdm: '#ff2244',      // bright red — hidden SDM
  system: '#88ff88',    // green — system (burst etc.)
  normal: '#d8d8d8',    // white — normal attacks
};

/** Category display priority for in-game move list */
const CATEGORY_ORDER: MoveCategory[] = ['special', 'dm', 'sdm', 'hsdm', 'command', 'system'];
const CATEGORY_LABELS: Record<string, string> = {
  command: 'CMD',
  special: 'SP',
  dm: 'DM',
  sdm: 'MAX',
  hsdm: 'HSDM',
  system: 'SYS',
  normal: '',
};

function drawMoveListPanel(
  ctx: CanvasRenderingContext2D,
  moveList: MoveListEntry[],
  simplifiedMode: boolean,
): void {
  if (moveList.length === 0) return;

  const panelX = 12;
  const panelW = 310;
  const lineH = 13;
  const headerH = 18;
  const footerH = 16;
  const maxMoves = 10;

  // Prioritize: specials & DMs first, then command normals
  const prioritized = [...moveList]
    .sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a.type ?? 'normal');
      const bi = CATEGORY_ORDER.indexOf(b.type ?? 'normal');
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    })
    .slice(0, maxMoves);

  const panelH = headerH + prioritized.length * lineH + footerH + 10;
  const panelY = CANVAS_HEIGHT - panelH - 22;

  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
  roundRect(ctx, panelX, panelY, panelW, panelH, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(200, 168, 50, 0.32)';
  ctx.lineWidth = 1;
  roundRect(ctx, panelX, panelY, panelW, panelH, 6);
  ctx.stroke();

  ctx.font = 'bold 10px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#ffd36a';
  ctx.fillText('MOVE LIST', panelX + 8, panelY + 4);

  ctx.font = '9px "Courier New", monospace';
  for (let i = 0; i < prioritized.length; i++) {
    const move = prioritized[i];
    const y = panelY + headerH + i * lineH + 4;
    const catLabel = CATEGORY_LABELS[move.type ?? ''] ?? '';
    const color = MOVE_TYPE_COLORS[move.type ?? 'normal'] ?? '#d8d8d8';

    // Category badge
    if (catLabel) {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.5;
      ctx.fillText(catLabel, panelX + 8, y);
      ctx.globalAlpha = 1.0;
    }

    // Move name + input
    ctx.fillStyle = color;
    const nameX = panelX + 36;
    const name = move.name.length > 22 ? move.name.slice(0, 21) + '…' : move.name;
    const input = move.input.length > 18 ? move.input.slice(0, 17) + '…' : move.input;
    ctx.fillText(name, nameX, y);
    ctx.fillStyle = 'rgba(180, 180, 180, 0.7)';
    ctx.textAlign = 'right';
    ctx.fillText(input, panelX + panelW - 8, y);
    ctx.textAlign = 'left';
  }

  const burstHint = simplifiedMode
    ? 'O = 爆气'
    : 'K+U / O = 爆气';
  ctx.fillStyle = 'rgba(200, 255, 200, 0.82)';
  ctx.fillText(burstHint, panelX + 10, panelY + panelH - footerH + 2);
  ctx.restore();
}

export function drawHUD(
  ctx: CanvasRenderingContext2D,
  fighters: Fighter[],
  tick: number,
  delayedHealth: [number, number],
  p1Wins: number = 0,
  p2Wins: number = 0,
  p1Name: string = '',
  p2Name: string = '',
  currentRound: number = 1,
  firstAttacker: number | null = null,
  p1MoveList: MoveListEntry[] = [],
  simplifiedMode: boolean = false,
): void {
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
  drawStunIndicator(ctx, HUD_MARGIN, HUD_BAR_Y + HUD_BAR_HEIGHT + 10, HUD_BAR_WIDTH, 3, fighters[0].stunGauge, true, tick);

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
  drawStunIndicator(ctx, CANVAS_WIDTH - HUD_MARGIN - HUD_BAR_WIDTH, HUD_BAR_Y + HUD_BAR_HEIGHT + 10, HUD_BAR_WIDTH, 3, fighters[1].stunGauge, false, tick);

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

  // ===== Arcade Score — KOF2002 live score display =====
  if (arcadeScore > 0) {
    // Smooth score counter animation
    if (displayScore < arcadeScore) {
      const diff = arcadeScore - displayScore;
      displayScore += Math.ceil(diff * 0.15);
      if (displayScore > arcadeScore) displayScore = arcadeScore;
    }
    const scoreStr = displayScore.toLocaleString().padStart(8, ' ');
    const scoreX = CANVAS_WIDTH / 2;
    const scoreY = HUD_BAR_Y + HUD_BAR_HEIGHT + 26;
    ctx.globalAlpha = 0.7;
    drawSNKText(ctx, scoreStr, scoreX, scoreY, 8, '#ffcc44', '#000000', 'center');
    ctx.globalAlpha = 1;
  }

  // ===== Score popup animation =====
  if (scorePopupTimer > 0) {
    scorePopupTimer--;
    const popProgress = 1 - scorePopupTimer / 60;
    const popAlpha = popProgress < 0.3 ? popProgress / 0.3 : popProgress > 0.7 ? (1 - popProgress) / 0.3 : 1;
    const popY = HUD_BAR_Y + HUD_BAR_HEIGHT + 36 - popProgress * 12;
    const popScale = popProgress < 0.15 ? 1 + (0.15 - popProgress) / 0.15 * 0.5 : 1;
    ctx.save();
    ctx.globalAlpha = Math.max(0, popAlpha * 0.9);
    const fontSize = Math.round(10 * popScale);
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 6;
    drawSNKText(ctx, `+${scorePopupAmount}`, CANVAS_WIDTH / 2, popY, fontSize, '#ffcc00', '#000000', 'center');
    ctx.shadowBlur = 0;
    ctx.restore();
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
  // KOF2002: 数字切换瞬间微缩放——秒数变化时前8帧从1.15x缩到1x
  const subTick = tick % 60;
  const digitPop = subTick < 8 ? 1 + (1 - subTick / 8) * 0.15 : 1;
  const timerScale = (isUrgent ? 1.6 : 1.3) * digitPop;

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

  // ===== Per-player round win dots (Phase 53: filled circles for rounds won, empty for remaining) =====
  // P1 dots: left of center, P2 dots: right of center
  const roundsNeededToWin = 2; // best of 3
  const p1DotsX = timerX - 55;
  const p2DotsX = timerX + 55;
  const dotR = 4;
  const dotGap = 14;

  for (let i = 0; i < roundsNeededToWin; i++) {
    // P1 round dot
    const p1dx = p1DotsX + i * dotGap;
    ctx.beginPath();
    ctx.arc(p1dx, dotY, dotR, 0, Math.PI * 2);
    if (i < p1Wins) {
      // Filled — P1 won this round; latest win is slightly larger
      const isLatest = i === p1Wins - 1;
      const r = isLatest ? dotR * 1.3 : dotR;
      ctx.beginPath();
      ctx.arc(p1dx, dotY, r, 0, Math.PI * 2);
      const winGlow = 0.7 + 0.3 * Math.sin(tick * 0.08 + i);
      ctx.fillStyle = `rgba(255, 100, 60, ${winGlow})`;
      ctx.fill();
      ctx.strokeStyle = '#ff6644';
      ctx.lineWidth = isLatest ? 2 : 1.5;
      ctx.stroke();
    } else {
      // Empty — round not yet won
      ctx.strokeStyle = 'rgba(255, 100, 60, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // P2 round dot
    const p2dx = p2DotsX + i * dotGap;
    ctx.beginPath();
    ctx.arc(p2dx, dotY, dotR, 0, Math.PI * 2);
    if (i < p2Wins) {
      // Filled — P2 won this round; latest win is slightly larger
      const isLatest = i === p2Wins - 1;
      const r = isLatest ? dotR * 1.3 : dotR;
      ctx.beginPath();
      ctx.arc(p2dx, dotY, r, 0, Math.PI * 2);
      const winGlow = 0.7 + 0.3 * Math.sin(tick * 0.08 + i);
      ctx.fillStyle = `rgba(68, 136, 255, ${winGlow})`;
      ctx.fill();
      ctx.strokeStyle = '#4488ff';
      ctx.lineWidth = isLatest ? 2 : 1.5;
      ctx.stroke();
    } else {
      // Empty — round not yet won
      ctx.strokeStyle = 'rgba(68, 136, 255, 0.3)';
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

  // ===== KOF2002: MATCH POINT indicator =====
  // When one player has (winsNeeded - 1) wins, show "MATCH POINT" near their side
  const winsNeeded = 2; // BO3 by default
  const mpPulse = 0.6 + Math.sin(tick * 0.1) * 0.4;
  if (p1Wins === winsNeeded - 1 && p2Wins < winsNeeded) {
    ctx.save();
    ctx.globalAlpha = mpPulse;
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 8;
    drawSNKText(ctx, 'MATCH', HUD_MARGIN + HUD_BAR_WIDTH + 10, winMarkerY + 18, 8, '#ff4400');
    drawSNKText(ctx, 'POINT', HUD_MARGIN + HUD_BAR_WIDTH + 10, winMarkerY + 28, 8, '#ff4400');
    ctx.shadowBlur = 0;
    ctx.restore();
  }
  if (p2Wins === winsNeeded - 1 && p1Wins < winsNeeded) {
    ctx.save();
    ctx.globalAlpha = mpPulse;
    ctx.shadowColor = '#4488ff';
    ctx.shadowBlur = 8;
    const mpX = CANVAS_WIDTH - HUD_MARGIN - HUD_BAR_WIDTH - 10;
    drawSNKText(ctx, 'MATCH', mpX, winMarkerY + 18, 8, '#4488ff', '#000000', 'right');
    drawSNKText(ctx, 'POINT', mpX, winMarkerY + 28, 8, '#4488ff', '#000000', 'right');
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // ===== KOF2002: Match point screen edge glow =====
  // Subtle edge glow when match point is active for either player
  const isMatchPoint = (p1Wins === winsNeeded - 1 && p2Wins < winsNeeded)
    || (p2Wins === winsNeeded - 1 && p1Wins < winsNeeded);
  if (isMatchPoint) {
    const edgeAlpha = 0.06 + Math.sin(tick * 0.08) * 0.04;
    const edgeColor = p1Wins === winsNeeded - 1 ? '#ff4400' : '#4488ff';
    // Left edge glow
    const leftGrad = ctx.createLinearGradient(0, 0, 30, 0);
    leftGrad.addColorStop(0, edgeColor);
    leftGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = edgeAlpha;
    ctx.fillStyle = leftGrad;
    ctx.fillRect(0, 0, 30, CANVAS_HEIGHT);
    // Right edge glow
    const rightGrad = ctx.createLinearGradient(CANVAS_WIDTH, 0, CANVAS_WIDTH - 30, 0);
    rightGrad.addColorStop(0, edgeColor);
    rightGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rightGrad;
    ctx.fillRect(CANVAS_WIDTH - 30, 0, 30, CANVAS_HEIGHT);
    ctx.globalAlpha = 1;
  }

  // ===== KOF2002: Round start lingering indicator =====
  // Shows "ROUND X" fading text below timer for first 90 ticks of each round
  const ROUND_DISPLAY_DURATION = 90;
  if (tick < ROUND_DISPLAY_DURATION && currentRound > 1) {
    const fadeProgress = tick / ROUND_DISPLAY_DURATION;
    const roundAlpha = Math.max(0, 1 - fadeProgress * fadeProgress); // quadratic fade
    ctx.save();
    ctx.globalAlpha = roundAlpha * 0.7;
    const romanNumerals = ['', 'I', 'II', 'III', 'IV', 'V'];
    const roman = romanNumerals[currentRound] || `${currentRound}`;
    drawSNKText(ctx, `ROUND ${roman}`, timerX, CANVAS_HEIGHT / 2 - 10, 16, '#ffcc00', '#000000', 'center');
    ctx.restore();
  }

  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  // ===== Character name plates below health bars =====
  drawNamePlate(ctx, HUD_MARGIN, HUD_BAR_Y + HUD_BAR_HEIGHT + 26, p1Name, '#ff6644', 'left');
  drawNamePlate(ctx, CANVAS_WIDTH - HUD_MARGIN, HUD_BAR_Y + HUD_BAR_HEIGHT + 26, p2Name, '#4488ff', 'right');

  // ===== Dizzy warning indicator near name plates =====
  if (fighters[0].state === FighterState.DIZZY) {
    const dzPulse = Math.sin(tick * 0.3) * 0.4 + 0.6;
    ctx.save();
    ctx.globalAlpha = dzPulse;
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 6;
    drawSNKText(ctx, 'DIZZY!', HUD_MARGIN + 50, HUD_BAR_Y + HUD_BAR_HEIGHT + 38, 8, '#ffcc00');
    ctx.shadowBlur = 0;
    ctx.restore();
  }
  if (fighters[1].state === FighterState.DIZZY) {
    const dzPulse = Math.sin(tick * 0.3) * 0.4 + 0.6;
    ctx.save();
    ctx.globalAlpha = dzPulse;
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 6;
    drawSNKText(ctx, 'DIZZY!', CANVAS_WIDTH - HUD_MARGIN - 50, HUD_BAR_Y + HUD_BAR_HEIGHT + 38, 8, '#ffcc00', '#000000', 'right');
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // ===== P1 move list panel (only in simplified mode for non-training gameplay) =====
  if (p1MoveList.length > 0 && simplifiedMode) {
    drawMoveListPanel(ctx, p1MoveList, simplifiedMode);
  }

  // ===== Arcade Score display (P1 side, bottom-left) =====
  if (arcadeScore > 0 || displayScore > 0) {
    tickArcadeScore();
    const scoreX = HUD_MARGIN;
    const scoreY = CANVAS_HEIGHT - 20;
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    drawSNKText(ctx, 'SCORE', scoreX, scoreY - 14, 9, '#888');
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 6;
    drawSNKText(ctx, displayScore.toString().padStart(8, '0'), scoreX, scoreY, 14, '#ffcc00');
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // ===== Desperation screen edge — crimson vignette when either fighter HP < 25% =====
  const anyDesperate = p1Ratio <= 0.25 || p2Ratio <= 0.25;
  if (anyDesperate) {
    const despIntensity = Math.sin(tick * 0.18) * 0.08 + 0.1;
    const dGrad = ctx.createRadialGradient(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.35, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.6);
    dGrad.addColorStop(0, 'rgba(120, 0, 0, 0)');
    dGrad.addColorStop(1, `rgba(140, 0, 0, ${despIntensity})`);
    ctx.fillStyle = dGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

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

// ===== Stun indicator (thin bar below guard gauge) =====

function drawStunIndicator(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, stunGauge: number, leftAligned: boolean, tick: number = 0): void {
  const ratio = Math.max(0, Math.min(1, stunGauge / 100));
  if (ratio <= 0) return;
  const fillW = w * ratio;
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(x, y, w, h);
  let color: string;
  if (ratio > 0.7) {
    const pulse = Math.sin(tick * 0.4) > 0;
    color = pulse ? '#ff4444' : '#cc2222';
  } else if (ratio > 0.4) {
    color = '#cc8822';
  } else {
    color = '#446644';
  }
  ctx.fillStyle = color;
  if (leftAligned) {
    ctx.fillRect(x, y, fillW, h);
  } else {
    ctx.fillRect(x + w - fillW, y, fillW, h);
  }
  // Stun warning glow when near dizzy threshold (>85%)
  if (ratio > 0.85) {
    const warnPulse = Math.sin(tick * 0.5) * 0.4 + 0.5;
    ctx.save();
    ctx.shadowColor = `rgba(255, 30, 30, ${warnPulse})`;
    ctx.shadowBlur = 6;
    ctx.strokeStyle = `rgba(255, 60, 40, ${warnPulse * 0.6})`;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 1, y - 1, w + 2, h + 2);
    ctx.restore();
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
  // KOF2002: subtle pulse on win diamonds
  const pulse = 1 + 0.06 * Math.sin(tick * 0.15);
  const s = size * pulse;
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
  const plateW = 90;
  const plateH = 14;
  const plateX = align === 'left' ? x : x - plateW;
  // Semi-transparent background with slight gradient
  const plateGrad = ctx.createLinearGradient(plateX, y - 2, plateX + plateW, y - 2);
  if (align === 'left') {
    plateGrad.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
    plateGrad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
  } else {
    plateGrad.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
    plateGrad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
  }
  ctx.fillStyle = plateGrad;
  roundRect(ctx, plateX, y - 2, plateW, plateH, 3);
  ctx.fill();
  // Player color side bar — wider for better visibility
  ctx.fillStyle = playerColor;
  if (align === 'left') {
    ctx.fillRect(plateX, y - 2, 2.5, plateH);
  } else {
    ctx.fillRect(plateX + plateW - 2.5, y - 2, 2.5, plateH);
  }
  // Name text — white with shadow for readability
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 2;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  drawSNKText(ctx, text, align === 'left' ? plateX + 6 : plateX + plateW - 6, y + 5, 9, 'rgba(230, 230, 230, 0.95)', '#000000', align);
  ctx.restore();
}

// ===== Combo counter — extracted to hudComboCounter.ts =====
