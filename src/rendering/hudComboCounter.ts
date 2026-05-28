/**
 * Combo Counter — KOF2002 arcade-authentic combo display
 * Split from hud.ts
 */
import { Fighter } from '../entities/fighter.js';
import { Camera } from '../core/camera.js';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
} from '../core/constants.js';
import { shiftColor } from './utils.js';

const COMBO_FADE_FRAMES = 60;

interface ComboFadeState {
  lastCombo: number;
  fadeTimer: number;
  lastDamage: number;
  scale: number;
  prevCount: number;
}

const comboFade: [ComboFadeState, ComboFadeState] = [
  { lastCombo: 0, fadeTimer: 0, lastDamage: 0, scale: 1, prevCount: 0 },
  { lastCombo: 0, fadeTimer: 0, lastDamage: 0, scale: 1, prevCount: 0 },
];

function getComboColor(combo: number): { fill: string; glow: string; shadow: string } {
  if (combo >= 15) {
    const t = (Date.now() % 1000) / 1000;
    const r = Math.round(200 + 55 * Math.sin(t * Math.PI * 2));
    const g = Math.round(200 + 55 * Math.sin(t * Math.PI * 2 + 2.094));
    const b = Math.round(200 + 55 * Math.sin(t * Math.PI * 2 + 4.189));
    const hex = `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
    return { fill: hex, glow: '#ff00ff', shadow: '#ff44ff' };
  }
  if (combo >= 10) {
    return { fill: '#ff2222', glow: '#ff0000', shadow: '#ff4444' };
  } else if (combo >= 5) {
    return { fill: '#ffdd00', glow: '#ffaa00', shadow: '#ffcc44' };
  }
  return { fill: '#ffffff', glow: '#ffffff', shadow: '#ffcc44' };
}

function drawComboDigit(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  fontSize: number,
  fillColor: string,
  alpha: number,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `bold ${fontSize}px "Courier New", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(3, Math.round(fontSize / 6));
  ctx.lineJoin = 'round';
  ctx.strokeText(text, x, y);

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = Math.max(2, Math.round(fontSize / 10));
  ctx.lineJoin = 'round';
  ctx.strokeText(text, x, y);

  const grad = ctx.createLinearGradient(x, y - fontSize * 0.5, x, y + fontSize * 0.5);
  grad.addColorStop(0, shiftColor(fillColor, 50));
  grad.addColorStop(0.35, fillColor);
  grad.addColorStop(1, shiftColor(fillColor, -40));
  ctx.fillStyle = grad;
  ctx.fillText(text, x, y);

  ctx.restore();
}

export function drawComboCounters(
  ctx: CanvasRenderingContext2D,
  fighters: Fighter[],
  comboCount: number[],
  _comboTimer: number[],
  camera: Camera,
  comboDamage?: number[],
): void {
  ctx.save();

  for (let i = 0; i < 2; i++) {
    const currentCombo = comboCount[i];
    const currentDamage = comboDamage?.[i] ?? 0;
    const fade = comboFade[i];

    if (currentCombo >= 2) {
      fade.lastCombo = currentCombo;
      fade.lastDamage = currentDamage;
      fade.fadeTimer = COMBO_FADE_FRAMES;
      if (currentCombo > fade.prevCount) {
        fade.scale = 1.4;
      }
    } else if (fade.fadeTimer > 0) {
      fade.fadeTimer--;
    }

    fade.prevCount = currentCombo;

    if (currentCombo < 2 && fade.fadeTimer <= 0) continue;

    const isActive = currentCombo >= 2;
    const displayCombo = isActive ? currentCombo : fade.lastCombo;
    const displayDamage = isActive ? currentDamage : fade.lastDamage;
    const alpha = isActive ? 1.0 : fade.fadeTimer / COMBO_FADE_FRAMES;

    if (alpha <= 0) continue;

    fade.scale += (1.0 - fade.scale) * 0.12;

    const f = fighters[i];
    const sx = camera.worldToScreen(f.x);
    const sy = f.y - f.displayHeight - 40;

    const colors = getComboColor(displayCombo);

    const baseFontSize = 28 + Math.min(displayCombo, 20) * 0.8;
    const fontSize = baseFontSize * fade.scale;

    ctx.save();
    const glowIntensity = Math.min(1, 0.3 + displayCombo * 0.04);
    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = 8 + Math.min(displayCombo, 20);
    drawComboDigit(ctx, `${displayCombo}`, sx, sy, fontSize, colors.fill, alpha);
    ctx.restore();

    const hitFontSize = 10;
    const hitOffsetX = fontSize * 0.4 + 4;
    const hitOffsetY = fontSize * 0.35;
    const hitColor = displayCombo >= 10 ? '#ff4444' : displayCombo >= 5 ? '#ffdd00' : '#cccccc';

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${hitFontSize}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.strokeText('HIT', sx + hitOffsetX, sy + hitOffsetY);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeText('HIT', sx + hitOffsetX, sy + hitOffsetY);
    ctx.fillStyle = hitColor;
    ctx.fillText('HIT', sx + hitOffsetX, sy + hitOffsetY);
    ctx.restore();

    if (displayDamage > 0) {
      const dmgFontSize = displayDamage >= 200 ? 18 : displayDamage >= 100 ? 16 : 14;
      const dmgY = sy + fontSize * 0.55 + 8;
      const dmgColor = displayDamage >= 200 ? '#ff2222'
        : displayDamage >= 100 ? '#ff6644'
          : '#ffcc44';

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 4;
      ctx.font = `bold ${dmgFontSize}px "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.strokeText(`${displayDamage}`, sx, dmgY);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeText(`${displayDamage}`, sx, dmgY);
      const dmgGrad = ctx.createLinearGradient(sx, dmgY - dmgFontSize * 0.5, sx, dmgY + dmgFontSize * 0.5);
      dmgGrad.addColorStop(0, shiftColor(dmgColor, 40));
      dmgGrad.addColorStop(0.4, dmgColor);
      dmgGrad.addColorStop(1, shiftColor(dmgColor, -30));
      ctx.fillStyle = dmgGrad;
      ctx.fillText(`${displayDamage}`, sx, dmgY);
      ctx.restore();
    }

    if (isActive && displayCombo >= 5) {
      const tier = displayCombo >= 15 ? 'EXCELLENT' : displayCombo >= 10 ? 'GREAT' : 'NICE';
      const tierColor = displayCombo >= 15 ? '#ff44ff' : displayCombo >= 10 ? '#ffaa00' : '#44ddff';
      const tierFontSize = 10;
      const tierY = sy - fontSize * 0.55 - 6;
      ctx.save();
      ctx.globalAlpha = alpha * 0.9;
      ctx.font = `bold ${tierFontSize}px "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.strokeText(tier, sx, tierY);
      ctx.fillStyle = tierColor;
      ctx.fillText(tier, sx, tierY);
      ctx.restore();
    }

    if (fade.fadeTimer <= 0 && !isActive) {
      fade.lastCombo = 0;
      fade.lastDamage = 0;
      fade.scale = 1;
      fade.prevCount = 0;
    }
  }

  // High combo screen edge glow
  const maxCombo = Math.max(comboCount[0], comboCount[1]);
  if (maxCombo >= 5) {
    const edgeAlpha = Math.min(0.18, (maxCombo - 4) * 0.025);
    const edgeColor = maxCombo >= 15 ? '#ff44ff' : maxCombo >= 10 ? '#ffaa00' : '#4488ff';
    const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
    ctx.save();
    ctx.globalAlpha = edgeAlpha * pulse;
    const topGrad = ctx.createLinearGradient(0, 0, 0, 40);
    topGrad.addColorStop(0, edgeColor);
    topGrad.addColorStop(1, edgeColor + '00');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, 40);
    const botGrad = ctx.createLinearGradient(0, CANVAS_HEIGHT, 0, CANVAS_HEIGHT - 40);
    botGrad.addColorStop(0, edgeColor);
    botGrad.addColorStop(1, edgeColor + '00');
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, CANVAS_HEIGHT - 40, CANVAS_WIDTH, 40);
    const leftGrad = ctx.createLinearGradient(0, 0, 30, 0);
    leftGrad.addColorStop(0, edgeColor);
    leftGrad.addColorStop(1, edgeColor + '00');
    ctx.fillStyle = leftGrad;
    ctx.fillRect(0, 0, 30, CANVAS_HEIGHT);
    const rightGrad = ctx.createLinearGradient(CANVAS_WIDTH, 0, CANVAS_WIDTH - 30, 0);
    rightGrad.addColorStop(0, edgeColor);
    rightGrad.addColorStop(1, edgeColor + '00');
    ctx.fillStyle = rightGrad;
    ctx.fillRect(CANVAS_WIDTH - 30, 0, 30, CANVAS_HEIGHT);
    ctx.restore();
  }

  ctx.restore();
}
