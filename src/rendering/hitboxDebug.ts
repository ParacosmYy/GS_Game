/**
 * Hitbox/Hurtbox debug visualization — KOF training mode collision display
 *
 * Draws color-coded collision rectangles over fighters:
 *   - Green: hurtbox (body)
 *   - Red: active hitboxes (attack)
 *   - Blue: pushbox (preventing overlap)
 *   - Yellow: throw box
 *
 * Toggle: training mode F5 key
 */

import type { Fighter } from '../entities/fighter.js';
import type { Projectile } from '../entities/projectile.js';
import type { Camera } from '../core/camera.js';

const COLORS = {
  hurtbox: 'rgba(0, 255, 0, 0.25)',
  hurtboxBorder: 'rgba(0, 255, 0, 0.7)',
  hitbox: 'rgba(255, 0, 0, 0.3)',
  hitboxBorder: 'rgba(255, 0, 0, 0.9)',
  pushbox: 'rgba(0, 100, 255, 0.15)',
  pushboxBorder: 'rgba(0, 100, 255, 0.5)',
  throwbox: 'rgba(255, 220, 0, 0.25)',
  throwboxBorder: 'rgba(255, 220, 0, 0.7)',
};

function drawBox(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  fill: string, border: string, label?: string,
): void {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
  if (label) {
    ctx.font = '8px monospace';
    ctx.fillStyle = border;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(label, x + 2, y + 1);
  }
}

export function drawHitboxOverlay(
  ctx: CanvasRenderingContext2D,
  fighters: Fighter[],
  projectiles: Projectile[],
  camera: Camera,
): void {
  ctx.save();

  const camX = camera.x;

  for (const f of fighters) {
    // Hurtbox (body)
    const hurt = f.getEffectiveHurtbox();
    if (hurt) {
      drawBox(ctx,
        hurt.x - camX, hurt.y, hurt.width, hurt.height,
        COLORS.hurtbox, COLORS.hurtboxBorder, 'BODY');
    }

    // Active hitboxes
    const hitboxes = f.getActiveHitboxes();
    for (const hb of hitboxes) {
      drawBox(ctx,
        hb.x - camX, hb.y, hb.width, hb.height,
        COLORS.hitbox, COLORS.hitboxBorder, 'ATK');
    }

    // Pushbox
    const push = f.getPushbox();
    drawBox(ctx,
      push.x - camX, push.y, push.width, push.height,
      COLORS.pushbox, COLORS.pushboxBorder, 'PUSH');

    // Throw box
    const throwBox = f.getThrowbox();
    if (throwBox) {
      drawBox(ctx,
        throwBox.x - camX, throwBox.y, throwBox.width, throwBox.height,
        COLORS.throwbox, COLORS.throwboxBorder, 'THROW');
    }
  }

  // Projectile hitboxes
  for (const p of projectiles) {
    if (!p.active) continue;
    const hb = p.getHitbox();
    if (hb) {
      drawBox(ctx,
        hb.x - camX, hb.y, hb.width, hb.height,
        COLORS.hitbox, COLORS.hitboxBorder, 'PROJ');
    }
  }

  // Legend
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(10, 10, 120, 70);
  ctx.globalAlpha = 1;
  ctx.font = '9px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const legendItems = [
    { color: COLORS.hurtboxBorder, label: 'Hurtbox (body)' },
    { color: COLORS.hitboxBorder, label: 'Hitbox (attack)' },
    { color: COLORS.pushboxBorder, label: 'Pushbox' },
    { color: COLORS.throwboxBorder, label: 'Throw box' },
  ];
  for (let i = 0; i < legendItems.length; i++) {
    ctx.fillStyle = legendItems[i].color;
    ctx.fillRect(14, 14 + i * 15, 10, 10);
    ctx.fillStyle = '#ccc';
    ctx.fillText(legendItems[i].label, 28, 15 + i * 15);
  }

  ctx.restore();
}
