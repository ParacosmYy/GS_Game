/**
 * Shoe rendering, attack trail, and color parsing utilities
 * Split from skeletalParts.ts
 */
import { shiftColor, roundRect } from '../utils.js';

export function drawShoe(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rot: number, color: string, facing: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const grad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  grad.addColorStop(0, shiftColor(color, 15));
  grad.addColorStop(1, shiftColor(color, -10));
  ctx.fillStyle = grad;
  roundRect(ctx, -w / 2 + facing * 2, -h / 2, w, h, 3);
  ctx.fill();
  ctx.strokeStyle = shiftColor(color, -30);
  ctx.lineWidth = 1;
  roundRect(ctx, -w / 2 + facing * 2, -h / 2, w, h, 3);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draw attack trail behind a striking limb during the active phase.
 * Draws 2-3 fading lines in the direction opposite to the attack motion.
 * @param ctx - Canvas 2D context (already translated/rotated to limb position)
 * @param attackPhase - Current attack phase ('startup' | 'active' | 'recovery' | 'none')
 * @param isKick - true for kick (vertical trail), false for punch (horizontal trail)
 * @param color - Trail color (typically character's special color)
 * @param limbLength - Length of the striking limb for trail sizing
 * @param facing - Direction character faces (1 or -1)
 */
export function drawAttackTrail(
  ctx: CanvasRenderingContext2D,
  attackPhase: string,
  isKick: boolean,
  color: string,
  limbLength: number,
  facing: number,
): void {
  if (attackPhase !== 'active') return;

  const { r, g, b } = parseColorRGB(color);
  const trailCount = 3;
  const trailSpacing = limbLength * 0.12;
  const baseTrailLen = limbLength * 0.35;

  ctx.save();
  ctx.lineCap = 'round';

  for (let i = 1; i <= trailCount; i++) {
    const alpha = 0.35 - (i - 1) * 0.1;
    const lineWidth = 3 - (i - 1) * 0.7;
    const offset = i * trailSpacing;

    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    ctx.lineWidth = lineWidth;

    ctx.beginPath();
    if (isKick) {
      // Vertical trail for kicks — trails upward behind the extending leg
      const trailX = -facing * offset * 0.3;
      const startY = -limbLength * 0.3;
      const endY = startY - baseTrailLen * (1 + i * 0.2);
      ctx.moveTo(trailX, startY);
      ctx.lineTo(trailX + facing * offset * 0.5, endY);
    } else {
      // Horizontal trail for punches — trails backward behind the extending arm
      const trailY = -offset * 0.3;
      const startX = -limbLength * 0.3;
      const endX = startX - facing * baseTrailLen * (1 + i * 0.2);
      ctx.moveTo(startX, trailY);
      ctx.lineTo(endX, trailY + offset * 0.5);
    }
    ctx.stroke();
  }

  ctx.restore();
}

/** Parse a color string to RGB components (utility for drawAttackTrail) */
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
    return m ? { r: +m[0], g: +m[1], b: +m[2] } : { r: 255, g: 160, b: 0 };
  }
  return { r: 255, g: 160, b: 0 };
}
