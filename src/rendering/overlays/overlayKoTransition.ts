/**
 * KO overlay and screen transition helpers (fade/wipe)
 * Split from overlayScreens.ts
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants.js';
import { drawSNKText } from '../utils.js';

// ===== Character KO Overlay =====

/**
 * KOF2002-style character name overlay during KO phase.
 * Shows the winning character's name in their signature color with glow,
 * and optionally the finishing move name below.
 *
 * Animation: fade in over 20 frames, hold, then fade out.
 */
export function drawCharacterKOOverlay(
  ctx: CanvasRenderingContext2D,
  charName: string,
  charNameCn: string,
  charColor: string,
  moveName: string | null,
  tick: number,
): void {
  ctx.save();

  const FADE_IN_FRAMES = 20;
  const HOLD_FRAMES = 100;
  const FADE_OUT_FRAMES = 30;
  const totalDuration = FADE_IN_FRAMES + HOLD_FRAMES + FADE_OUT_FRAMES;

  // Calculate alpha based on phase
  let alpha = 0;
  if (tick < FADE_IN_FRAMES) {
    // Fade in
    alpha = tick / FADE_IN_FRAMES;
  } else if (tick < FADE_IN_FRAMES + HOLD_FRAMES) {
    // Hold with subtle pulse
    alpha = 1.0;
  } else if (tick < totalDuration) {
    // Fade out
    alpha = 1.0 - (tick - FADE_IN_FRAMES - HOLD_FRAMES) / FADE_OUT_FRAMES;
  } else {
    alpha = 0;
  }

  if (alpha <= 0) { ctx.restore(); return; }

  ctx.globalAlpha = alpha;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const baseY = CANVAS_HEIGHT / 2 + 140;

  // Subtle glow behind name
  const glowGrad = ctx.createRadialGradient(
    CANVAS_WIDTH / 2, baseY, 10,
    CANVAS_WIDTH / 2, baseY, 120,
  );
  glowGrad.addColorStop(0, charColor + Math.round(0.3 * alpha * 255).toString(16).padStart(2, '0'));
  glowGrad.addColorStop(0.5, charColor + Math.round(0.1 * alpha * 255).toString(16).padStart(2, '0'));
  glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(CANVAS_WIDTH / 2 - 140, baseY - 50, 280, 100);

  // Character name — white text with colored glow, KOF2002 style
  const namePulse = 1.0 + Math.sin(tick * 0.08) * 0.02;
  const nameFontSize = Math.round(32 * namePulse);

  // Shadow/glow layer
  ctx.shadowColor = charColor;
  ctx.shadowBlur = 20 * alpha;
  ctx.font = `bold ${nameFontSize}px "Courier New", monospace`;

  // Colored outline for depth
  ctx.strokeStyle = charColor;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.strokeText(charNameCn, CANVAS_WIDTH / 2, baseY);

  // White fill
  ctx.fillStyle = '#ffffff';
  ctx.fillText(charNameCn, CANVAS_WIDTH / 2, baseY);

  ctx.shadowBlur = 0;

  // Move name — smaller font below character name
  if (moveName) {
    const moveAlpha = Math.min(1, Math.max(0, (tick - FADE_IN_FRAMES) / 15));
    ctx.globalAlpha = alpha * moveAlpha;

    const moveFontSize = 18;
    ctx.font = `bold ${moveFontSize}px "Courier New", monospace`;
    ctx.shadowColor = charColor;
    ctx.shadowBlur = 10 * moveAlpha;

    // Move name in character color, slightly transparent
    ctx.strokeStyle = charColor;
    ctx.lineWidth = 1;
    ctx.strokeText(moveName, CANVAS_WIDTH / 2, baseY + 35);

    ctx.fillStyle = '#ffffffdd';
    ctx.fillText(moveName, CANVAS_WIDTH / 2, baseY + 35);

    ctx.shadowBlur = 0;
  }

  // Decorative side lines flanking the name
  const lineLen = 50 + Math.sin(tick * 0.05) * 5;
  const lineY = baseY;
  const lineGap = ctx.measureText(charNameCn).width / 2 + 20;
  ctx.strokeStyle = charColor + Math.round(0.5 * alpha * 255).toString(16).padStart(2, '0');
  ctx.lineWidth = 1.5;
  // Left line
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2 - lineGap - lineLen, lineY);
  ctx.lineTo(CANVAS_WIDTH / 2 - lineGap, lineY);
  ctx.stroke();
  // Right line
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2 + lineGap, lineY);
  ctx.lineTo(CANVAS_WIDTH / 2 + lineGap + lineLen, lineY);
  ctx.stroke();

  ctx.globalAlpha = 1;
  ctx.restore();
}

// ===== Screen Transition Helpers =====

/**
 * Draw a screen fade overlay with the given alpha.
 * Alpha 0 = fully transparent (screen visible).
 * Alpha 1 = fully opaque black (screen hidden).
 */
export function drawScreenFade(ctx: CanvasRenderingContext2D, alpha: number): void {
  if (alpha <= 0) return;
  ctx.save();
  ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, Math.max(0, alpha))})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.restore();
}

/**
 * Draw a screen wipe overlay with the given progress and direction.
 * Progress 0 = no wipe (screen fully visible).
 * Progress 1 = fully wiped (screen hidden).
 * Direction 'left' wipes from right to left, 'right' from left to right.
 */
export function drawScreenWipe(
  ctx: CanvasRenderingContext2D,
  progress: number,
  direction: 'left' | 'right',
): void {
  if (progress <= 0) return;
  const p = Math.min(1, Math.max(0, progress));
  ctx.save();
  ctx.fillStyle = '#000000';

  if (direction === 'left') {
    const wipeX = CANVAS_WIDTH * (1 - p);
    ctx.fillRect(wipeX, 0, CANVAS_WIDTH - wipeX, CANVAS_HEIGHT);
    if (p < 1 && p > 0) {
      const glowGrad = ctx.createLinearGradient(wipeX - 30, 0, wipeX + 10, 0);
      glowGrad.addColorStop(0, 'rgba(255, 204, 0, 0)');
      glowGrad.addColorStop(0.5, 'rgba(255, 204, 0, 0.4)');
      glowGrad.addColorStop(1, 'rgba(255, 204, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(wipeX - 30, 0, 40, CANVAS_HEIGHT);
    }
  } else {
    const wipeX = CANVAS_WIDTH * p;
    ctx.fillRect(0, 0, wipeX, CANVAS_HEIGHT);
    if (p < 1 && p > 0) {
      const glowGrad = ctx.createLinearGradient(wipeX - 10, 0, wipeX + 30, 0);
      glowGrad.addColorStop(0, 'rgba(255, 204, 0, 0)');
      glowGrad.addColorStop(0.5, 'rgba(255, 204, 0, 0.4)');
      glowGrad.addColorStop(1, 'rgba(255, 204, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(wipeX - 10, 0, 40, CANVAS_HEIGHT);
    }
  }

  ctx.restore();
}
