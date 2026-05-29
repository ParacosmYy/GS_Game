/**
 * genericCharacterRenderer.ts
 *
 * Creates a HighResRenderer for any character that has real sprites.
 * Used by rendererFighter.ts for characters without a dedicated renderer file.
 */

import { createHighResRenderer, type SpriteImageFrame } from './baseHighResRenderer.js';
import { resolveGenericMugenAction, type CharacterSpriteConfig } from './characterSpriteRegistry.js';
import type { FighterState, AttackType } from '../../../core/types.js';

const rendererCache = new Map<string, ReturnType<typeof createHighResRenderer>>();

/**
 * Get or create a renderer for a character using real sprites.
 * Returns null if the character has no sprite config or no loaded sprites.
 */
export function getGenericCharacterRenderer(
  charId: string,
  config: CharacterSpriteConfig,
  sprites: Map<string, SpriteImageFrame[]>,
): ReturnType<typeof createHighResRenderer> | null {
  const cached = rendererCache.get(charId);
  if (cached) return cached;

  const resolveKey = (state: FighterState, attack: AttackType | null, vx: number, facing: number) =>
    resolveGenericMugenAction(config, state, attack, vx, facing);

  const renderer = createHighResRenderer({
    targetDisplayHeight: config.targetDisplayHeight,
    defaultTint: config.defaultTint,
    setup() { /* no procedural fallback for generic characters */ },
    resolveKey,
    imageSetup(regImg) {
      for (const [actionId, frames] of sprites) {
        regImg(actionId, frames);
        // Register zero-padded alias (e.g. '020' → '20') so resolveKey can find both formats
        const trimmed = actionId.replace(/^0+(\d)/, '$1');
        if (trimmed !== actionId) regImg(trimmed, frames);
      }
      // Alias WIN → MUGEN win action
      const winAction = config.winAction ?? '181';
      const winFrames = sprites.get(winAction);
      if (winFrames) regImg('WIN', winFrames);
    },
  });

  rendererCache.set(charId, renderer);
  return renderer;
}

/**
 * Try to draw a character using real sprites via the generic renderer.
 * Returns true if the character was drawn, false if no sprites available.
 */
export function drawGenericCharacterSprite(
  ctx: CanvasRenderingContext2D,
  charId: string,
  config: CharacterSpriteConfig,
  sprites: Map<string, SpriteImageFrame[]>,
  state: FighterState,
  stateAge: number,
  x: number,
  y: number,
  facing: number,
  attack: AttackType | null,
  vx: number,
): boolean {
  const renderer = getGenericCharacterRenderer(charId, config, sprites);
  if (!renderer) return false;
  return renderer.draw(ctx, state, stateAge, x, y, facing, attack, vx);
}
