/**
 * Screen transition animations
 * Split from screens.ts
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants.js';


const TRANSITION_WIPE_DURATION = 40;
const TRANSITION_ZOOM_DURATION = 50;
const TRANSITION_FADE_DURATION = 30;
const TRANSITION_CURTAIN_DURATION = 36;

export function drawTransition(
  ctx: CanvasRenderingContext2D,
  tick: number,
  type: 'wipe' | 'zoom' | 'fade' | 'curtain',
  canvasWidth: number,
  canvasHeight: number,
): boolean {
  ctx.save();

  if (type === 'curtain') {
    // KOF2002-style curtain close: two black bars slide from top/bottom to center
    const progress = Math.min(1, tick / TRANSITION_CURTAIN_DURATION);
    const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    const barH = (canvasHeight / 2) * ease;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvasWidth, barH);
    ctx.fillRect(0, canvasHeight - barH, canvasWidth, barH);
    // Gold edge glow on the curtain edges
    if (progress < 0.9) {
      const edgeAlpha = (1 - progress) * 0.5;
      const topEdge = ctx.createLinearGradient(0, barH - 6, 0, barH + 4);
      topEdge.addColorStop(0, 'rgba(255, 204, 0, 0)');
      topEdge.addColorStop(0.5, `rgba(255, 204, 0, ${edgeAlpha})`);
      topEdge.addColorStop(1, 'rgba(255, 204, 0, 0)');
      ctx.fillStyle = topEdge;
      ctx.fillRect(0, barH - 6, canvasWidth, 10);
      const botEdge = ctx.createLinearGradient(0, canvasHeight - barH - 4, 0, canvasHeight - barH + 6);
      botEdge.addColorStop(0, 'rgba(255, 204, 0, 0)');
      botEdge.addColorStop(0.5, `rgba(255, 204, 0, ${edgeAlpha})`);
      botEdge.addColorStop(1, 'rgba(255, 204, 0, 0)');
      ctx.fillStyle = botEdge;
      ctx.fillRect(0, canvasHeight - barH - 4, canvasWidth, 10);
    }
    ctx.restore();
    return progress >= 1;
  }

  if (type === 'wipe') {
    const progress = Math.min(1, tick / TRANSITION_WIPE_DURATION);
    const wipeX = canvasWidth * (1 - progress);
    ctx.fillStyle = '#000000';
    ctx.fillRect(wipeX, 0, canvasWidth - wipeX, canvasHeight);
    if (progress < 1) {
      const glowGrad = ctx.createLinearGradient(wipeX - 30, 0, wipeX + 10, 0);
      glowGrad.addColorStop(0, 'rgba(255, 204, 0, 0)');
      glowGrad.addColorStop(0.5, 'rgba(255, 204, 0, 0.4)');
      glowGrad.addColorStop(1, 'rgba(255, 204, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(wipeX - 30, 0, 40, canvasHeight);
    }
    ctx.restore();
    return progress >= 1;
  }

  if (type === 'zoom') {
    const progress = Math.min(1, tick / TRANSITION_ZOOM_DURATION);
    if (progress < 0.5) {
      const p = progress / 0.5;
      ctx.fillStyle = `rgba(0, 0, 0, ${p * 0.9})`;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      const spotR = (1 - p) * canvasHeight * 0.6;
      if (spotR > 5) {
        const spotGrad = ctx.createRadialGradient(canvasWidth / 2, canvasHeight / 2, 0, canvasWidth / 2, canvasHeight / 2, spotR);
        spotGrad.addColorStop(0, `rgba(255, 204, 0, ${0.3 * (1 - p)})`);
        spotGrad.addColorStop(0.5, `rgba(255, 100, 0, ${0.15 * (1 - p)})`);
        spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = spotGrad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
    } else {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    if (progress < 0.15) {
      const lineAlpha = (1 - progress / 0.15) * 0.6;
      ctx.strokeStyle = `rgba(255, 204, 0, ${lineAlpha})`;
      ctx.lineWidth = 3;
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(canvasWidth / 2, canvasHeight / 2);
        ctx.lineTo(canvasWidth / 2 + Math.cos(angle) * canvasWidth, canvasHeight / 2 + Math.sin(angle) * canvasHeight);
        ctx.stroke();
      }
    }
    ctx.restore();
    return progress >= 1;
  }

  if (type === 'fade') {
    const progress = Math.min(1, tick / TRANSITION_FADE_DURATION);
    ctx.fillStyle = `rgba(0, 0, 0, ${progress})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
    return progress >= 1;
  }

  ctx.restore();
  return true;
}
