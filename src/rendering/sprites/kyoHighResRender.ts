/**
 * kyoHighResRender.ts
 *
 * Integration layer: connects Kyo's high-resolution pixel frame data
 * with the pixelFrameRenderer drawing API.
 *
 * Provides:
 * - Frame lookup by character ID + FighterState
 * - Type bridging between source PixelFrame and pixelFrameRenderer.PixelFrame
 * - Walk direction resolution (forward/backward from velocity + facing)
 * - Attack type resolution (STAND_A vs STAND_C from currentAttack)
 * - Crouch attack type resolution (CROUCH_A vs CROUCH_C from currentAttack)
 * - Air attack type resolution (AIR_A vs AIR_C vs AIR_D from currentAttack)
 * - Cycle timing for animation frames
 *
 * Currently supports: IDLE, WALK (fwd/back), STAND_ATTACK (A/C),
 *   CROUCH, JUMP (all jump types), HITSTUN, KNOCKDOWN
 * Fallback states (crouch_attack, air_attack, block, etc.) will follow.
 */

import { FighterState, AttackType } from '../../core/types.js';
import { drawPixelFrame, prerenderFrame, drawPrerenderedFrame, type PixelFrame, type PixelPalette } from './pixelFrameRenderer.js';
import { KYO_IDLE_FRAMES } from './kyoIdleFrames.js';
import { KYO_WALK_FORWARD_FRAMES, KYO_WALK_BACKWARD_FRAMES } from './kyoWalkFrames.js';
import { KYO_STAND_A_FRAMES, KYO_STAND_C_FRAMES } from './kyoAttackFrames.js';
import { KYO_CROUCH_FRAMES } from './kyoCrouchFrames.js';
import { KYO_JUMP_FRAMES } from './kyoJumpFrames.js';
import { KYO_HURT_FRAMES, KYO_KNOCKDOWN_FRAMES } from './kyoDamageFrames.js';
import { KYO_STAND_B_FRAMES, KYO_STAND_D_FRAMES } from './kyoKickFrames.js';

// ===== Internal Frame Registry =====

interface FrameEntry {
  frames: PixelFrame[];
  palette: PixelPalette;
  ticksPerFrame: number;
  /** Optional per-frame duration overrides. When present, frame cycling uses these instead of uniform ticksPerFrame. */
  frameDurations?: number[];
}

const KYO_FRAMES = new Map<string, FrameEntry>();

// Pre-rendered frame cache: key = "registryKey:scale:facing", value = offscreen canvas
const FRAME_CACHE = new Map<string, HTMLCanvasElement>();

/** Source frame type shared by all kyo*Frames.ts modules */
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
  if (KYO_FRAMES.has(key)) return;
  const converted = rawFrames.map(convertFrame);
  if (converted.length === 0) return;
  KYO_FRAMES.set(key, {
    frames: converted.map(c => c.frame),
    palette: converted[0].palette,
    ticksPerFrame,
  });
}

/** Register a set of frames with per-frame variable durations */
function registerVariableFrames(key: string, rawFrames: SourcePixelFrame[], frameDurations: number[]): void {
  if (KYO_FRAMES.has(key)) return;
  const converted = rawFrames.map(convertFrame);
  if (converted.length === 0) return;
  KYO_FRAMES.set(key, {
    frames: converted.map(c => c.frame),
    palette: converted[0].palette,
    ticksPerFrame: frameDurations[0] || 8, // fallback
    frameDurations,
  });
}

/** Compute frame index from non-uniform durations */
function getVariableFrameIndex(stateAge: number, frameDurations: number[]): number {
  let tickAccum = 0;
  const totalCycle = frameDurations.reduce((a, b) => a + b, 0);
  const cycleAge = stateAge % totalCycle;
  for (let i = 0; i < frameDurations.length; i++) {
    tickAccum += frameDurations[i];
    if (cycleAge < tickAccum) return i;
  }
  return frameDurations.length - 1;
}

// ===== Initialization =====

let initialized = false;

/** Initialize all available frame sets. Idempotent. */
function initAllFrames(): void {
  if (initialized) return;
  initialized = true;

  // IDLE — 6-frame breathing loop with variable frame hold
  // KOF-authentic rhythm: hold at peak inhale (frame 2), faster through neutral
  registerVariableFrames('IDLE', KYO_IDLE_FRAMES, [8, 9, 12, 9, 10, 8]);

  // WALK FORWARD — 4-frame stride loop, 6 ticks per frame
  registerFrames('WALK_FORWARD', KYO_WALK_FORWARD_FRAMES, 6);

  // WALK BACKWARD — 4-frame cautious step loop, 7 ticks per frame (slower than forward)
  registerFrames('WALK_BACKWARD', KYO_WALK_BACKWARD_FRAMES, 7);

  // STAND_A (light punch) — 4 frames: windup-snap-hold-retract
  // startup=6, active=3, recovery=5
  registerVariableFrames('STAND_A', KYO_STAND_A_FRAMES, [6, 3, 2, 5]);

  // STAND_C (heavy punch) — 5 frames: windup-snap-hold-retract1-retract2
  // startup=7, active=3, recovery=20
  registerVariableFrames('STAND_C', KYO_STAND_C_FRAMES, [7, 3, 2, 8, 12]);

  // CROUCH — 4-frame crouch idle breathing loop
  registerVariableFrames('CROUCH', KYO_CROUCH_FRAMES, [8, 10, 8, 10]);

  // JUMP — 6-frame jump arc with variable timing
  // pre-jump, rise, peak_up, peak_fwd, descend, land
  registerVariableFrames('JUMP', KYO_JUMP_FRAMES, [4, 3, 5, 6, 5, 4]);

  // DAMAGE — hurt flinch and knockdown
  // HURT: quick recoil then settle [3, 5, 6, 4]
  registerVariableFrames('HURT', KYO_HURT_FRAMES, [3, 5, 6, 4]);
  // KNOCKDOWN: fly up slow, slam fast, ground settle
  registerVariableFrames('KNOCKDOWN', KYO_KNOCKDOWN_FRAMES, [4, 5, 6, 8, 10, 12]);

  // KICK ATTACKS
  registerVariableFrames('STAND_B', KYO_STAND_B_FRAMES, [7, 3, 2, 12]);
  registerVariableFrames('STAND_D', KYO_STAND_D_FRAMES, [10, 4, 4, 8, 12]);
}

// ===== State Resolution =====

/**
 * Resolve the internal frame registry key for a given game state.
 *
 * @returns The registry key (e.g. 'IDLE', 'WALK_FORWARD'), or null
 *          if no high-res frames exist for this state.
 */
function resolveFrameKey(
  state: FighterState,
  currentAttack: AttackType | null,
  vx: number,
  _facing: number,
): string | null {
  switch (state) {
    case FighterState.IDLE:
      return 'IDLE';

    case FighterState.WALK:
      // Forward vs backward determined by velocity direction relative to facing
      return (vx * _facing > 0) ? 'WALK_FORWARD' : 'WALK_BACKWARD';

    case FighterState.STAND_ATTACK:
      // Distinguish light (A) vs heavy (C) punch
      if (currentAttack === AttackType.STAND_C) {
        return 'STAND_C';
      }
      return 'STAND_A';

    case FighterState.CROUCH:
      return 'CROUCH';

    case FighterState.JUMP:
    case FighterState.RUN_JUMP:
    case FighterState.HOP:
    case FighterState.HYPER_JUMP:
      return 'JUMP';

    case FighterState.HITSTUN:
      return 'HURT';

    case FighterState.KNOCKDOWN:
      return 'KNOCKDOWN';

    default:
      return null;
  }
}

// ===== Public API =====

/**
 * Target display height in screen pixels for all Kyo high-res frames.
 * 48x72 frames rendered at 2x scale = 144px display height.
 */
const KYO_TARGET_DISPLAY_HEIGHT = 144;

/**
 * Check whether a high-resolution frame is available for the given character and state.
 */
export function hasKyoHighResFrame(
  state: FighterState,
  currentAttack: AttackType | null = null,
  vx: number = 0,
  facing: number = 1,
): boolean {
  initAllFrames();
  const key = resolveFrameKey(state, currentAttack, vx, facing);
  if (key === null) return false;
  return KYO_FRAMES.has(key);
}

/**
 * Draw a high-resolution pixel frame for Kyo.
 *
 * @param ctx            - Canvas 2D context
 * @param state          - Current FighterState
 * @param stateAge       - Ticks spent in the current state (for cyclic animation)
 * @param x              - Screen X (character center)
 * @param y              - Screen Y (character feet)
 * @param facing         - 1=right, -1=left
 * @param currentAttack  - Current attack type (for resolving STAND_A vs STAND_C)
 * @param vx             - Horizontal velocity (for resolving walk forward vs backward)
 * @returns true if a high-res frame was drawn, false if caller should fall back
 */
export function drawKyoHighResFrame(
  ctx: CanvasRenderingContext2D,
  state: FighterState,
  stateAge: number,
  x: number,
  y: number,
  facing: number,
  currentAttack: AttackType | null = null,
  vx: number = 0,
): boolean {
  initAllFrames();

  const key = resolveFrameKey(state, currentAttack, vx, facing);
  if (key === null) return false;

  const entry = KYO_FRAMES.get(key);
  if (!entry) return false;

  const { frames, palette, ticksPerFrame } = entry;
  if (frames.length === 0) return false;

  // Cyclic frame selection — use variable durations when available
  const frameIdx = entry.frameDurations
    ? getVariableFrameIndex(stateAge, entry.frameDurations)
    : Math.floor(stateAge / entry.ticksPerFrame) % frames.length;
  const frame = frames[frameIdx];

  // Compute scale dynamically so all frame sizes display at the same target height.
  const scale = KYO_TARGET_DISPLAY_HEIGHT / frame.height;

  // Use pre-rendered frame cache for performance
  const cacheKey = `${key}:${frameIdx}:${scale}`;
  let cached = FRAME_CACHE.get(cacheKey);
  if (!cached) {
    cached = prerenderFrame(frame, scale, palette);
    FRAME_CACHE.set(cacheKey, cached);
  }
  drawPrerenderedFrame(ctx, cached, frame, x, y, scale, facing);
  return true;
}

/**
 * Draw Kyo's high-res frame as a tinted afterimage ghost.
 * Used for RUN/BACKDASH/ROLL trails.
 * Returns true if a pixel frame was available and drawn.
 */
export function drawKyoHighResAfterimage(
  ctx: CanvasRenderingContext2D,
  state: FighterState,
  stateAge: number,
  x: number,
  y: number,
  facing: number,
  currentAttack: AttackType | null = null,
  vx: number = 0,
  tint: string = '#ff6600',
  alpha: number = 0.25,
): boolean {
  initAllFrames();

  const key = resolveFrameKey(state, currentAttack, vx, facing);
  if (key === null) return false;

  const entry = KYO_FRAMES.get(key);
  if (!entry) return false;

  const { frames, ticksPerFrame } = entry;
  if (frames.length === 0) return false;

  const frameIdx = Math.floor(stateAge / ticksPerFrame) % frames.length;
  const frame = frames[frameIdx];
  const scale = KYO_TARGET_DISPLAY_HEIGHT / frame.height;

  // Build a tinted palette: replace all non-transparent colors with the tint
  const tintedPalette: PixelPalette = {};
  for (const [idxStr, color] of Object.entries(entry.palette)) {
    const idx = Number(idxStr);
    if (idx > 0 && color !== 'transparent') {
      tintedPalette[idx] = tint;
    } else {
      tintedPalette[idx] = color;
    }
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  drawPixelFrame(ctx, frame, x, y, scale, facing, tintedPalette);
  ctx.restore();
  return true;
}
