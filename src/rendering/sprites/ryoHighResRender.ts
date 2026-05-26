/**
 * ryoHighResRender.ts
 *
 * Integration layer: connects Ryo's high-resolution pixel frame data
 * with the pixelFrameRenderer drawing API.
 *
 * Provides:
 * - Frame lookup by character ID + FighterState
 * - Type bridging between ryoIdleFrames.PixelFrame and pixelFrameRenderer.PixelFrame
 * - Cycle timing for animation frames
 */

import { FighterState } from '../../core/types.js';
import { drawPixelFrame, type PixelFrame, type PixelPalette } from './pixelFrameRenderer.js';
import { RYO_IDLE_FRAMES } from './ryoIdleFrames.js';
import { RYO_WALK_FORWARD_FRAMES, RYO_WALK_BACKWARD_FRAMES } from './ryoWalkFrames.js';
import { RYO_STAND_A_FRAMES, RYO_STAND_C_FRAMES } from './ryoAttackFrames.js';

// ===== Frame Registry =====

/** Frames per animation state for Ryo */
const RYO_FRAMES: Partial<Record<FighterState, { frames: PixelFrame[]; palette: PixelPalette; ticksPerFrame: number }>> = {};

/**
 * Convert a ryoIdleFrames.PixelFrame (palette embedded) into the
 * pixelFrameRenderer.PixelFrame format (palette separated, anchor computed).
 */
function convertIdleFrame(frame: { width: number; height: number; palette: Record<number, string>; pixels: number[][] }): { frame: PixelFrame; palette: PixelPalette } {
  const { width, height, palette: srcPalette, pixels } = frame;
  // Build clean palette (skip index 0 which is transparent)
  const cleanPalette: PixelPalette = {};
  for (const [key, color] of Object.entries(srcPalette)) {
    const idx = Number(key);
    if (idx > 0 && color !== 'transparent') {
      cleanPalette[idx] = color;
    }
  }
  // Anchor: character center-bottom
  const pixelFrame: PixelFrame = {
    width,
    height,
    pixels,
    anchor: { x: Math.floor(width / 2), y: height },
  };
  return { frame: pixelFrame, palette: cleanPalette };
}

// Initialize IDLE frames
function initIdleFrames(): void {
  if (RYO_FRAMES[FighterState.IDLE]) return; // already initialized
  const converted = RYO_IDLE_FRAMES.map(convertIdleFrame);
  if (converted.length === 0) return;
  RYO_FRAMES[FighterState.IDLE] = {
    frames: converted.map(c => c.frame),
    palette: converted[0].palette,
    ticksPerFrame: 9,
  };
}

/** Register a set of frames for a given state */
function registerFrames(state: FighterState, rawFrames: { width: number; height: number; palette: Record<number, string>; pixels: number[][] }[], ticksPerFrame: number): void {
  if (RYO_FRAMES[state]) return;
  const converted = rawFrames.map(convertIdleFrame);
  if (converted.length === 0) return;
  RYO_FRAMES[state] = {
    frames: converted.map(c => c.frame),
    palette: converted[0].palette,
    ticksPerFrame,
  };
}

// Initialize all available frame sets
function initAllFrames(): void {
  initIdleFrames();
  registerFrames(FighterState.WALK, RYO_WALK_FORWARD_FRAMES, 6);
  registerFrames(FighterState.STAND_ATTACK, RYO_STAND_A_FRAMES, 4);
}

// ===== Public API =====

/** Scale factor for high-res pixel frames. 2x so each source pixel becomes a 2x2 block. */
export const RYO_HIGHRES_SCALE = 2;

/**
 * Check whether a high-resolution frame is available for the given character and state.
 */
export function hasHighResFrame(charId: string, state: FighterState): boolean {
  if (charId !== 'ryo') return false;
  initAllFrames();
  return RYO_FRAMES[state] !== undefined;
}

/**
 * Draw a high-resolution pixel frame for the given character.
 *
 * @param ctx         - Canvas 2D context
 * @param charId      - Character ID (e.g. 'ryo')
 * @param state       - Current FighterState
 * @param stateAge    - Ticks spent in the current state (for cyclic animation)
 * @param x           - Screen X (character center)
 * @param y           - Screen Y (character feet)
 * @param facing      - 1=right, -1=left
 * @returns true if a high-res frame was drawn, false if caller should fall back
 */
export function drawHighResFrame(
  ctx: CanvasRenderingContext2D,
  charId: string,
  state: FighterState,
  stateAge: number,
  x: number,
  y: number,
  facing: number,
): boolean {
  if (charId !== 'ryo') return false;
  initIdleFrames();

  const entry = RYO_FRAMES[state];
  if (!entry) return false;

  const { frames, palette, ticksPerFrame } = entry;
  if (frames.length === 0) return false;

  // Cyclic frame selection matching the skeletal renderer pattern
  const frameIdx = Math.floor(stateAge / ticksPerFrame) % frames.length;
  const frame = frames[frameIdx];

  drawPixelFrame(ctx, frame, x, y, RYO_HIGHRES_SCALE, facing, palette);
  return true;
}
