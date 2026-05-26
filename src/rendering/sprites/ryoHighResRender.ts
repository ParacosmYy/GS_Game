/**
 * ryoHighResRender.ts
 *
 * Integration layer: connects Ryo's high-resolution pixel frame data
 * with the pixelFrameRenderer drawing API.
 *
 * Provides:
 * - Frame lookup by character ID + FighterState
 * - Type bridging between source PixelFrame and pixelFrameRenderer.PixelFrame
 * - Walk direction resolution (forward/backward from velocity + facing)
 * - Attack type resolution (STAND_A vs STAND_C from currentAttack)
 * - Cycle timing for animation frames
 */

import { FighterState, AttackType } from '../../core/types.js';
import { drawPixelFrame, type PixelFrame, type PixelPalette } from './pixelFrameRenderer.js';
import { RYO_IDLE_FRAMES } from './ryoIdleFrames.js';
import { RYO_WALK_FORWARD_FRAMES, RYO_WALK_BACKWARD_FRAMES } from './ryoWalkFrames.js';
import { RYO_STAND_A_FRAMES, RYO_STAND_C_FRAMES } from './ryoAttackFrames.js';
import { RYO_JUMP_FRAMES } from './ryoJumpFrames.js';
import { RYO_HURT_FRAMES, RYO_KNOCKDOWN_FRAMES } from './ryoDamageFrames.js';
import { RYO_CROUCH_FRAMES, RYO_CROUCH_A_FRAMES, RYO_CROUCH_C_FRAMES } from './ryoCrouchFrames.js';
import { RYO_AIR_A_FRAMES, RYO_AIR_C_FRAMES, RYO_AIR_D_FRAMES } from './ryoAirAttackFrames.js';

// ===== Internal Frame Registry =====
//
// Uses string keys instead of FighterState directly so we can distinguish
// sub-states (e.g. 'WALK_FORWARD' vs 'WALK_BACKWARD', 'STAND_A' vs 'STAND_C')
// while keeping a single flat lookup.

interface FrameEntry {
  frames: PixelFrame[];
  palette: PixelPalette;
  ticksPerFrame: number;
}

const RYO_FRAMES = new Map<string, FrameEntry>();

/** Source frame type shared by all ryo*Frames.ts modules */
interface SourcePixelFrame {
  width: number;
  height: number;
  palette: Record<number, string>;
  pixels: number[][];
}

/**
 * Convert a source PixelFrame (palette embedded) into the
 * pixelFrameRenderer.PixelFrame format (palette separated, anchor computed).
 */
function convertFrame(frame: SourcePixelFrame): { frame: PixelFrame; palette: PixelPalette } {
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

/** Register a set of frames under a given registry key */
function registerFrames(key: string, rawFrames: SourcePixelFrame[], ticksPerFrame: number): void {
  if (RYO_FRAMES.has(key)) return;
  const converted = rawFrames.map(convertFrame);
  if (converted.length === 0) return;
  RYO_FRAMES.set(key, {
    frames: converted.map(c => c.frame),
    palette: converted[0].palette,
    ticksPerFrame,
  });
}

// ===== Initialization =====

let initialized = false;

/** Initialize all available frame sets. Idempotent. */
function initAllFrames(): void {
  if (initialized) return;
  initialized = true;

  // IDLE — 8-frame breathing loop, slow cycle
  registerFrames('IDLE', RYO_IDLE_FRAMES, 9);

  // WALK — forward and backward stored as separate entries
  registerFrames('WALK_FORWARD', RYO_WALK_FORWARD_FRAMES, 6);
  registerFrames('WALK_BACKWARD', RYO_WALK_BACKWARD_FRAMES, 6);

  // ATTACK — stand_a (light punch) and stand_c (heavy punch)
  registerFrames('STAND_A', RYO_STAND_A_FRAMES, 4);
  registerFrames('STAND_C', RYO_STAND_C_FRAMES, 4);

  // DAMAGE — hurt (5f) and knockdown (6f)
  registerFrames('HURT', RYO_HURT_FRAMES, 4);
  registerFrames('KNOCKDOWN', RYO_KNOCKDOWN_FRAMES, 5);

  // JUMP — 6-frame jump arc
  registerFrames('JUMP', RYO_JUMP_FRAMES, 5);

  // CROUCH — crouch idle (4f loop)
  registerFrames('CROUCH', RYO_CROUCH_FRAMES, 9);

  // CROUCH ATTACK — crouch_a (3f low jab) and crouch_c (4f low uppercut)
  registerFrames('CROUCH_A', RYO_CROUCH_A_FRAMES, 4);
  registerFrames('CROUCH_C', RYO_CROUCH_C_FRAMES, 5);

  // AIR ATTACK — air_a (3f air jab), air_c (4f air heavy), air_d (4f air kick)
  registerFrames('AIR_A', RYO_AIR_A_FRAMES, 4);
  registerFrames('AIR_C', RYO_AIR_C_FRAMES, 4);
  registerFrames('AIR_D', RYO_AIR_D_FRAMES, 4);
}

// ===== State Resolution =====
//
// Maps FighterState + context (attackType, vx, facing) to the
// internal registry key.

/**
 * Resolve the internal frame registry key for a given game state.
 *
 * @returns The registry key (e.g. 'WALK_FORWARD', 'STAND_A'), or null
 *          if no high-res frames exist for this state.
 */
function resolveFrameKey(
  state: FighterState,
  currentAttack: AttackType | null,
  vx: number,
  facing: number,
): string | null {
  switch (state) {
    case FighterState.IDLE:
      return 'IDLE';

    case FighterState.WALK:
      // Forward walk: vx has same sign as facing
      // Backward walk: vx has opposite sign to facing
      return (vx * facing > 0) ? 'WALK_FORWARD' : 'WALK_BACKWARD';

    case FighterState.STAND_ATTACK:
      // Resolve attack type to the correct frame set
      if (currentAttack === AttackType.STAND_C || currentAttack === AttackType.CLOSE_C) {
        return 'STAND_C';
      }
      // Default to STAND_A for STAND_A, CLOSE_A, and any other stand attack
      return 'STAND_A';

    case FighterState.HITSTUN:
      return 'HURT';

    case FighterState.KNOCKDOWN:
      return 'KNOCKDOWN';

    case FighterState.JUMP:
    case FighterState.HOP:
    case FighterState.RUN_JUMP:
    case FighterState.HYPER_JUMP:
      return 'JUMP';

    default:
      return null;
  }
}

// ===== Public API =====

/** Scale factor for high-res pixel frames. 2x so each source pixel becomes a 2x2 block. */
export const RYO_HIGHRES_SCALE = 2;

/**
 * Check whether a high-resolution frame is available for the given character and state.
 */
export function hasHighResFrame(
  charId: string,
  state: FighterState,
  currentAttack: AttackType | null = null,
  vx: number = 0,
  facing: number = 1,
): boolean {
  if (charId !== 'ryo') return false;
  initAllFrames();
  const key = resolveFrameKey(state, currentAttack, vx, facing);
  if (key === null) return false;
  return RYO_FRAMES.has(key);
}

/**
 * Draw a high-resolution pixel frame for the given character.
 *
 * @param ctx            - Canvas 2D context
 * @param charId         - Character ID (e.g. 'ryo')
 * @param state          - Current FighterState
 * @param stateAge       - Ticks spent in the current state (for cyclic animation)
 * @param x              - Screen X (character center)
 * @param y              - Screen Y (character feet)
 * @param facing         - 1=right, -1=left
 * @param currentAttack  - Current attack type (for resolving STAND_A vs STAND_C)
 * @param vx             - Horizontal velocity (for resolving walk forward vs backward)
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
  currentAttack: AttackType | null = null,
  vx: number = 0,
): boolean {
  if (charId !== 'ryo') return false;
  initAllFrames();

  const key = resolveFrameKey(state, currentAttack, vx, facing);
  if (key === null) return false;

  const entry = RYO_FRAMES.get(key);
  if (!entry) return false;

  const { frames, palette, ticksPerFrame } = entry;
  if (frames.length === 0) return false;

  // Cyclic frame selection matching the skeletal renderer pattern
  const frameIdx = Math.floor(stateAge / ticksPerFrame) % frames.length;
  const frame = frames[frameIdx];

  drawPixelFrame(ctx, frame, x, y, RYO_HIGHRES_SCALE, facing, palette);
  return true;
}
