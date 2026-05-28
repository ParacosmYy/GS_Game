/**
 * hitboxDebugMugen.ts
 *
 * Enhanced hitbox debug visualization with MUGEN data overlay.
 * Shows both game hitboxes and real MUGEN Clsn data side by side.
 *
 * Layers:
 *   - Green: Game hurtbox
 *   - Red: Game hitbox (attack)
 *   - Cyan: MUGEN hurtbox (Clsn2)
 *   - Magenta: MUGEN attack box (Clsn1)
 *   - Blue: Pushbox
 *   - Yellow: Throw box
 *
 * Toggle: F2 cycles: off → game → both → mugen → off
 */

import type { Fighter } from '../entities/fighter.js';
import type { Projectile } from '../entities/projectile.js';
import type { Camera } from '../core/camera.js';
import {
  getHurtboxesAtFrame,
  getAttackBoxesAtFrame,
  hurtboxToGameRect,
  hasManifestHurtboxes,
  type MugenHurtbox,
  type MugenAttackBox,
} from './sprites/shared/mugenHurtboxLoader.js';
import { getCharacterConfig, resolveGenericMugenAction } from './sprites/shared/characterSpriteRegistry.js';
import { calculateScaleFactor } from './sprites/shared/mugenHitboxLoader.js';

// ===== Display modes =====

export type HitboxDisplayMode = 'game' | 'mugen' | 'both';

let displayMode: HitboxDisplayMode = 'game';

export function setHitboxDisplayMode(mode: HitboxDisplayMode): void {
  displayMode = mode;
}

export function getHitboxDisplayMode(): HitboxDisplayMode {
  return displayMode;
}

export function cycleHitboxDisplayMode(): HitboxDisplayMode {
  const modes: HitboxDisplayMode[] = ['game', 'both', 'mugen'];
  const idx = modes.indexOf(displayMode);
  displayMode = modes[(idx + 1) % modes.length];
  return displayMode;
}

// ===== Colors =====

const GAME_COLORS = {
  hurtbox: 'rgba(0, 255, 0, 0.2)',
  hurtboxBorder: 'rgba(0, 255, 0, 0.6)',
  hitbox: 'rgba(255, 0, 0, 0.25)',
  hitboxBorder: 'rgba(255, 0, 0, 0.8)',
  pushbox: 'rgba(0, 100, 255, 0.12)',
  pushboxBorder: 'rgba(0, 100, 255, 0.4)',
  throwbox: 'rgba(255, 220, 0, 0.2)',
  throwboxBorder: 'rgba(255, 220, 0, 0.6)',
};

const MUGEN_COLORS = {
  hurtbox: 'rgba(0, 220, 220, 0.2)',
  hurtboxBorder: 'rgba(0, 220, 220, 0.7)',
  hitbox: 'rgba(255, 0, 220, 0.25)',
  hitboxBorder: 'rgba(255, 0, 220, 0.8)',
};

// ===== Drawing helpers =====

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
    ctx.font = '7px monospace';
    ctx.fillStyle = border;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(label, x + 2, y + 1);
  }
}

function getFighterAnimFrameIndex(fighter: Fighter): number {
  // The fighter's animation state isn't directly exposed.
  // Use attackFrame during attacks, or approximate from stateAge.
  if (fighter.attackPhase !== 'none') return fighter.attackFrame;
  return Math.floor(fighter.stateAge / 4) % 100;
}

// ===== MUGEN data lookup =====

function drawMugenBoxes(
  ctx: CanvasRenderingContext2D,
  fighter: Fighter,
  camX: number,
): void {
  const config = getCharacterConfig(fighter.charId);
  if (!config || !hasManifestHurtboxes(config.mugenDir)) return;

  const actionNumber = resolveGenericMugenAction(
    config, fighter.state, fighter.currentAttack, 0, fighter.facing,
  );
  if (!actionNumber) return;

  const frameIndex = getFighterAnimFrameIndex(fighter);
  const scale = calculateScaleFactor(config.targetDisplayHeight, 200);

  // Draw MUGEN hurtboxes
  const hurtboxes = getHurtboxesAtFrame(config.mugenDir, actionNumber, frameIndex);
  if (hurtboxes) {
    for (const hb of hurtboxes) {
      const rect = hurtboxToGameRect(hb, fighter.x, fighter.y, fighter.facing, scale);
      drawBox(ctx,
        rect.x - camX, rect.y, rect.width, rect.height,
        MUGEN_COLORS.hurtbox, MUGEN_COLORS.hurtboxBorder, 'M-BODY');
    }
  }

  // Draw MUGEN attack boxes
  const attackBoxes = getAttackBoxesAtFrame(config.mugenDir, actionNumber, frameIndex);
  if (attackBoxes) {
    for (const ab of attackBoxes) {
      const rect = hurtboxToGameRect(ab as MugenHurtbox, fighter.x, fighter.y, fighter.facing, scale);
      drawBox(ctx,
        rect.x - camX, rect.y, rect.width, rect.height,
        MUGEN_COLORS.hitbox, MUGEN_COLORS.hitboxBorder, 'M-ATK');
    }
  }
}

// ===== Main draw function =====

export function drawHitboxOverlayEnhanced(
  ctx: CanvasRenderingContext2D,
  fighters: Fighter[],
  projectiles: Projectile[],
  camera: Camera,
): void {
  ctx.save();

  const camX = camera.x;

  for (const f of fighters) {
    // Game hurtbox
    if (displayMode !== 'mugen') {
      const hurt = f.getEffectiveHurtbox();
      if (hurt) {
        drawBox(ctx,
          hurt.x - camX, hurt.y, hurt.width, hurt.height,
          GAME_COLORS.hurtbox, GAME_COLORS.hurtboxBorder, 'BODY');
      }

      // Game active hitboxes
      const hitboxes = f.getActiveHitboxes();
      for (const hb of hitboxes) {
        drawBox(ctx,
          hb.x - camX, hb.y, hb.width, hb.height,
          GAME_COLORS.hitbox, GAME_COLORS.hitboxBorder, 'ATK');
      }

      // Pushbox
      const push = f.getPushbox();
      drawBox(ctx,
        push.x - camX, push.y, push.width, push.height,
        GAME_COLORS.pushbox, GAME_COLORS.pushboxBorder, 'PUSH');

      // Throw box
      const throwBox = f.getThrowbox();
      if (throwBox) {
        drawBox(ctx,
          throwBox.x - camX, throwBox.y, throwBox.width, throwBox.height,
          GAME_COLORS.throwbox, GAME_COLORS.throwboxBorder, 'THROW');
      }
    }

    // MUGEN overlay
    if (displayMode !== 'game') {
      drawMugenBoxes(ctx, f, camX);
    }
  }

  // Projectile hitboxes (game only)
  if (displayMode !== 'mugen') {
    for (const p of projectiles) {
      if (!p.active) continue;
      const hb = p.getHitbox();
      if (hb) {
        drawBox(ctx,
          hb.x - camX, hb.y, hb.width, hb.height,
          GAME_COLORS.hitbox, GAME_COLORS.hitboxBorder, 'PROJ');
      }
    }
  }

  // Legend
  const showGame = displayMode !== 'mugen';
  const showMugen = displayMode !== 'game';

  let legendH = 15;
  const legendItems: Array<{ color: string; label: string }> = [];

  if (showGame) {
    legendH += 60;
    legendItems.push(
      { color: GAME_COLORS.hurtboxBorder, label: 'Hurtbox (body)' },
      { color: GAME_COLORS.hitboxBorder, label: 'Hitbox (attack)' },
      { color: GAME_COLORS.pushboxBorder, label: 'Pushbox' },
      { color: GAME_COLORS.throwboxBorder, label: 'Throw box' },
    );
  }
  if (showMugen) {
    legendH += 30;
    legendItems.push(
      { color: MUGEN_COLORS.hurtboxBorder, label: 'MUGEN hurtbox' },
      { color: MUGEN_COLORS.hitboxBorder, label: 'MUGEN attack' },
    );
  }

  ctx.globalAlpha = 0.85;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(10, 10, 140, legendH);
  ctx.globalAlpha = 1;
  ctx.font = '9px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  ctx.fillStyle = '#fff';
  ctx.fillText(`Mode: ${displayMode.toUpperCase()}`, 14, 14);

  for (let i = 0; i < legendItems.length; i++) {
    ctx.fillStyle = legendItems[i].color;
    ctx.fillRect(14, 28 + i * 14, 8, 8);
    ctx.fillStyle = '#ccc';
    ctx.fillText(legendItems[i].label, 26, 28 + i * 14);
  }

  ctx.restore();
}
