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
 * - Crouch attack type resolution (CROUCH_A vs CROUCH_C from currentAttack)
 * - Air attack type resolution (AIR_A vs AIR_C vs AIR_D from currentAttack)
 * - Cycle timing for animation frames
 */

import { FighterState, AttackType } from '../../core/types.js';
import { drawPixelFrame, prerenderFrame, drawPrerenderedFrame, type PixelFrame, type PixelPalette } from './pixelFrameRenderer.js';
import { RYO_IDLE_FRAMES } from './ryoIdleFrames.js';
import { RYO_WALK_FORWARD_FRAMES, RYO_WALK_BACKWARD_FRAMES } from './ryoWalkFrames.js';
import { RYO_STAND_A_FRAMES, RYO_STAND_C_FRAMES, RYO_CLOSE_A_FRAMES, RYO_CLOSE_C_FRAMES } from './ryoAttackFrames.js';
import { RYO_STAND_B_FRAMES, RYO_STAND_D_FRAMES } from './ryoKickFrames.js';
import { RYO_CROUCH_B_FRAMES, RYO_CROUCH_D_FRAMES } from './ryoCrouchKickFrames.js';
import { RYO_CLOSE_B_FRAMES, RYO_CLOSE_D_FRAMES } from './ryoCloseKickFrames.js';
import { RYO_JUMP_FRAMES } from './ryoJumpFrames.js';
import { RYO_HURT_FRAMES, RYO_KNOCKDOWN_FRAMES } from './ryoDamageFrames.js';
import { RYO_CROUCH_FRAMES, RYO_CROUCH_A_FRAMES, RYO_CROUCH_C_FRAMES } from './ryoCrouchFrames.js';
import { RYO_AIR_A_FRAMES, RYO_AIR_C_FRAMES, RYO_AIR_D_FRAMES } from './ryoAirAttackFrames.js';
import {
  RYO_KO_HOU_FRAMES, RYO_KOOU_FRAMES, RYO_HIEN_FRAMES,
  RYO_HAOU_FRAMES, RYO_KOOU_C_FRAMES, RYO_KO_HOU_C_FRAMES,
} from './ryoSpecialFrames.js';
import {
  RYO_DM_TEN_HA_OU_FRAMES, RYO_DM_RYUKO_RANBU_FRAMES,
  RYO_SDM_TEN_HA_OU_FRAMES, RYO_HSDM_RYUKO_RANBU_FRAMES,
} from './ryoSuperFrames.js';
import {
  RYO_RUN_FRAMES, RYO_BACKDASH_FRAMES, RYO_ROLL_FRAMES, RYO_BACK_ROLL_FRAMES,
  RYO_GUARD_CRUSH_FRAMES, RYO_MAX_MODE_FRAMES, RYO_TAUNT_FRAMES,
  RYO_COUNTER_STANCE_FRAMES, RYO_RYUKO_RANBU_FRAMES,
} from './ryoMovementFrames.js';
import { RYO_BLOCK_FRAMES } from './ryoBlockFrames.js';
import { RYO_WIN_FRAMES } from './ryoWinFrames.js';
import { RYO_DIZZY_FRAMES } from './ryoDizzyFrames.js';
import { RYO_THROW_FRAMES } from './ryoThrowFrames.js';

// ===== Internal Frame Registry =====
//
// Uses string keys instead of FighterState directly so we can distinguish
// sub-states (e.g. 'WALK_FORWARD' vs 'WALK_BACKWARD', 'STAND_A' vs 'STAND_C')
// while keeping a single flat lookup.

interface FrameEntry {
  frames: PixelFrame[];
  palette: PixelPalette;
  ticksPerFrame: number;
  /** Optional per-frame duration overrides. When present, frame cycling uses these instead of uniform ticksPerFrame. */
  frameDurations?: number[];
}

const RYO_FRAMES = new Map<string, FrameEntry>();

// Pre-rendered frame cache: key = "registryKey:scale:facing", value = offscreen canvas
const FRAME_CACHE = new Map<string, HTMLCanvasElement>();

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

/** Register a set of frames with per-frame variable durations */
function registerVariableFrames(key: string, rawFrames: SourcePixelFrame[], frameDurations: number[]): void {
  if (RYO_FRAMES.has(key)) return;
  const converted = rawFrames.map(convertFrame);
  if (converted.length === 0) return;
  RYO_FRAMES.set(key, {
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

  // IDLE — 8-frame breathing loop with variable frame hold
  // KOF-authentic rhythm: hold at peak inhale (frame 3), faster through neutral
  // Frame order: neutral → rise → rising → peak → descend → descending → valley → return
  registerVariableFrames('IDLE', RYO_IDLE_FRAMES, [7, 8, 9, 12, 9, 8, 10, 7]);

  // WALK — variable frame rhythm: stride contact holds longer, passing phase faster
  registerVariableFrames('WALK_FORWARD', RYO_WALK_FORWARD_FRAMES, [7, 5, 7, 7, 5, 7]);
  registerVariableFrames('WALK_BACKWARD', RYO_WALK_BACKWARD_FRAMES, [8, 6, 8, 8, 6, 8]);

  // ATTACK — variable frame durations matching combat startup/active/recovery phases
  // STAND_A: startup=6, active=3, recovery=5 → 4 frames: [6, 3, 2, 5] (windup-snap-hold-retract)
  registerVariableFrames('STAND_A', RYO_STAND_A_FRAMES, [6, 3, 2, 5]);
  // STAND_C: startup=7, active=3, recovery=20 → 5 frames: [7, 3, 2, 8, 12] (windup-snap-hold-retract1-retract2)
  registerVariableFrames('STAND_C', RYO_STAND_C_FRAMES, [7, 3, 2, 8, 12]);

  // CLOSE PUNCHES — close_a (elbow), close_c (uppercut)
  // CLOSE_A: startup=4, active=2, recovery=8 → [4, 2, 5, 5]
  registerVariableFrames('CLOSE_A', RYO_CLOSE_A_FRAMES, [4, 2, 5, 5]);
  // CLOSE_C: startup=2, active=5, recovery=11 → [2, 5, 6, 5]
  registerVariableFrames('CLOSE_C', RYO_CLOSE_C_FRAMES, [2, 5, 6, 5]);

  // KICK ATTACKS — variable frames matching combat phases
  // STAND_B: startup=7, active=3, recovery=14 → [7, 3, 2, 12]
  registerVariableFrames('STAND_B', RYO_STAND_B_FRAMES, [7, 3, 2, 12]);
  // STAND_D: startup=10, active=8, recovery=20 → [10, 4, 4, 8, 12]
  registerVariableFrames('STAND_D', RYO_STAND_D_FRAMES, [10, 4, 4, 8, 12]);

  // CLOSE KICKS — close_b (light knee), close_d (heavy knee/kick)
  // CLOSE_B: startup=5, active=2, recovery=8 → [5, 2, 8]
  registerVariableFrames('CLOSE_B', RYO_CLOSE_B_FRAMES, [5, 2, 8]);
  // CLOSE_D: startup=6, active=4, recovery=12 → [6, 4, 6, 8]
  registerVariableFrames('CLOSE_D', RYO_CLOSE_D_FRAMES, [6, 4, 6, 8]);

  // DAMAGE — hurt and knockdown with KOF weight rhythm
  // HURT: flinch reaction — quick recoil then settle [3, 5, 6, 4]
  registerVariableFrames('HURT', RYO_HURT_FRAMES, [3, 5, 6, 4]);
  // KNOCKDOWN: fly up slow, slam fast, ground settle
  registerVariableFrames('KNOCKDOWN', RYO_KNOCKDOWN_FRAMES, [4, 5, 6, 8, 10, 12]);

  // JUMP — 6-frame jump arc with variable timing
  // KOF2002: crouch_prep(4) → launch(3) → rising(5) → peak(6) → falling(5) → landing(4)
  registerVariableFrames('JUMP', RYO_JUMP_FRAMES, [4, 3, 5, 6, 5, 4]);

  // CROUCH — crouch idle (4f breathing loop)
  // KOF2002: slow breathing rhythm with hold on inhale
  registerVariableFrames('CROUCH', RYO_CROUCH_FRAMES, [8, 10, 8, 10]);

  // CROUCH ATTACK — variable timing per KOF2002 frame data
  // crouch_A: fast low jab — quick startup, 2f active, moderate recovery
  registerVariableFrames('CROUCH_A', RYO_CROUCH_A_FRAMES, [3, 2, 5]);
  // crouch_C: heavy low uppercut — windup, active, two-stage recovery
  registerVariableFrames('CROUCH_C', RYO_CROUCH_C_FRAMES, [5, 3, 5, 10]);
  // CROUCH KICKS
  // crouch_B: quick low kick — moderate startup, 2f active, moderate recovery
  registerVariableFrames('CROUCH_B', RYO_CROUCH_B_FRAMES, [4, 2, 7]);
  // crouch_D: sweep — windup, multi-frame active sweep arc, long recovery
  registerVariableFrames('CROUCH_D', RYO_CROUCH_D_FRAMES, [6, 3, 3, 3, 12]);

  // AIR ATTACK — variable timing for air attacks
  // air_A: quick air jab — fast startup, brief active, moderate recovery
  registerVariableFrames('AIR_A', RYO_AIR_A_FRAMES, [3, 3, 5]);
  // air_C: heavy air punch — startup, two active frames, recovery
  registerVariableFrames('AIR_C', RYO_AIR_C_FRAMES, [5, 3, 3, 5]);
  // air_D: air kick — startup, two active frames, recovery
  registerVariableFrames('AIR_D', RYO_AIR_D_FRAMES, [4, 3, 3, 5]);

  // SPECIALS — ticksPerFrame calibrated to frameData totals
  // KO_HOU: startup=5, active=5, recovery=25 = 35; 5 frames × 7 = 35
  // SPECIAL MOVES — variable timing per KOF2002 frame data
  // Ko'Hou (weak uppercut): fast startup, multi-stage recovery
  registerVariableFrames('KO_HOU', RYO_KO_HOU_FRAMES, [4, 3, 5, 7, 10]);
  // Koou Ken (fireball): startup → cast → recovery → settle
  registerVariableFrames('KOOU', RYO_KOOU_FRAMES, [6, 3, 8, 12]);
  // Hien Senpuu Kyaku (flying kick): startup → active → peak → recovery → settle
  registerVariableFrames('HIEN', RYO_HIEN_FRAMES, [5, 3, 3, 6, 10]);
  // Haou Shou Kou Ken (super fireball): heavy startup → active → long recovery
  registerVariableFrames('HAOU', RYO_HAOU_FRAMES, [8, 4, 14]);
  // EX Koou Ken: faster startup, same recovery pattern
  registerVariableFrames('KOOU_C', RYO_KOOU_C_FRAMES, [4, 3, 10]);
  // EX Ko'Hou: fast startup, moderate recovery
  registerVariableFrames('KO_HOU_C', RYO_KO_HOU_C_FRAMES, [3, 3, 8]);

  // SUPERS — DM/SDM/HSDM
  // DM_TEN_HA_OU: 4 frames × 12 = 48
  registerFrames('DM_TEN_HA_OU', RYO_DM_TEN_HA_OU_FRAMES, 12);
  // DM_RYUKO_RANBU: 5 frames × 8 = 40
  registerFrames('DM_RYUKO_RANBU', RYO_DM_RYUKO_RANBU_FRAMES, 8);
  // SDM_TEN_HA_OU: 3 frames × 16 = 48
  registerFrames('SDM_TEN_HA_OU', RYO_SDM_TEN_HA_OU_FRAMES, 16);
  // HSDM_RYUKO_RANBU: 4 frames × 10 = 40
  registerFrames('HSDM_RYUKO_RANBU', RYO_HSDM_RYUKO_RANBU_FRAMES, 10);

  // MOVEMENT — run, backdash, rolls
  registerFrames('RUN', RYO_RUN_FRAMES, 3);
  registerFrames('BACKDASH', RYO_BACKDASH_FRAMES, 3);
  registerFrames('ROLL', RYO_ROLL_FRAMES, 4);
  registerFrames('BACK_ROLL', RYO_BACK_ROLL_FRAMES, 4);

  // SUB-STATES — guard crush, MAX mode, taunt, counter, block, dizzy, throw
  registerFrames('BLOCK', RYO_BLOCK_FRAMES, 8);
  registerFrames('DIZZY', RYO_DIZZY_FRAMES, 10);
  registerFrames('THROW', RYO_THROW_FRAMES, 6);
  registerFrames('GUARD_CRUSH', RYO_GUARD_CRUSH_FRAMES, 8);
  registerFrames('MAX_MODE', RYO_MAX_MODE_FRAMES, 6);
  registerFrames('TAUNT', RYO_TAUNT_FRAMES, 12);
  registerFrames('COUNTER_STANCE', RYO_COUNTER_STANCE_FRAMES, 8);

  // SUPERS — Ryuko Ranbu (SDM/HSDM)
  registerFrames('RYUKO_RANBU', RYO_RYUKO_RANBU_FRAMES, 5);

  // WIN POSE — arms crossed victory
  registerFrames('WIN', RYO_WIN_FRAMES, 12);
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

    case FighterState.RUN:
      return 'RUN';

    case FighterState.BACKDASH:
      return 'BACKDASH';

    case FighterState.ROLL:
      return 'ROLL';

    case FighterState.BACK_ROLL:
      return 'BACK_ROLL';

    case FighterState.WALK:
      // Forward walk: vx has same sign as facing
      // Backward walk: vx has opposite sign to facing
      return (vx * facing > 0) ? 'WALK_FORWARD' : 'WALK_BACKWARD';

    case FighterState.STAND_ATTACK:
      // Resolve attack type to the correct frame set
      if (currentAttack === AttackType.STAND_C) {
        return 'STAND_C';
      }
      if (currentAttack === AttackType.CLOSE_C) {
        return 'CLOSE_C';
      }
      // Special moves: uppercut variants
      if (currentAttack === AttackType.RYO_KO_HOU) {
        return 'KO_HOU';
      }
      if (currentAttack === AttackType.RYO_KO_HOU_C) {
        return 'KO_HOU_C';
      }
      // Special moves: projectile variants
      if (currentAttack === AttackType.RYO_KOOU) {
        return 'KOOU';
      }
      if (currentAttack === AttackType.RYO_KOOU_C) {
        return 'KOOU_C';
      }
      // Special moves: flying kick
      if (currentAttack === AttackType.RYO_HIEN) {
        return 'HIEN';
      }
      // Special moves: counter
      if (currentAttack === AttackType.RYO_HAOU) {
        return 'HAOU';
      }
      // Special moves: heavy projectile (D version of Ko'ou Ken)
      if (currentAttack === AttackType.RYO_KOOUKEN_D) {
        return 'KOOU';
      }
      // Special moves: dash strike
      if (currentAttack === AttackType.RYO_HIO_HACKER) {
        return 'STAND_C';
      }
      // Special moves: multi-punch
      if (currentAttack === AttackType.RYO_ZANRETSU_KEN) {
        return 'STAND_A';
      }
      // Super moves: Ten Ha Ou variants
      if (currentAttack === AttackType.DM_TEN_HA_OU) {
        return 'DM_TEN_HA_OU';
      }
      if (currentAttack === AttackType.SDM_TEN_HA_OU) {
        return 'SDM_TEN_HA_OU';
      }
      // Super moves: Ryuko Ranbu variants
      if (currentAttack === AttackType.DM_RYUKO_RANBU
        || currentAttack === AttackType.SDM_RYUKO_RANBU) {
        return 'RYUKO_RANBU';
      }
      if (currentAttack === AttackType.HSDM_RYUKO_RANBU) {
        return 'HSDM_RYUKO_RANBU';
      }
      // Default to STAND_A for STAND_A and any other stand attack
      if (currentAttack === AttackType.STAND_A) return 'STAND_A';
      if (currentAttack === AttackType.CLOSE_A) return 'CLOSE_A';
      if (currentAttack === AttackType.STAND_B) return 'STAND_B';
      if (currentAttack === AttackType.STAND_D) return 'STAND_D';
      if (currentAttack === AttackType.CLOSE_B) return 'CLOSE_B';
      if (currentAttack === AttackType.CLOSE_D) return 'CLOSE_D';
      // Command normals: tsurizao is an overhead punch (use STAND_C), orishi is low kick
      if (currentAttack === AttackType.RYO_TSURIZAO) return 'STAND_C';
      return 'STAND_A';

    case FighterState.CROUCH:
      return 'CROUCH';

    case FighterState.CROUCH_ATTACK:
      // Resolve crouch attack: each has dedicated pixel frames now
      if (currentAttack === AttackType.CROUCH_B) return 'CROUCH_B';
      if (currentAttack === AttackType.CROUCH_C) return 'CROUCH_C';
      if (currentAttack === AttackType.CROUCH_D) return 'CROUCH_D';
      // Command normal: orishi (↘+B) is a low kick, use CROUCH_B sprite
      if (currentAttack === AttackType.RYO_ORISHI) return 'CROUCH_B';
      return 'CROUCH_A';

    case FighterState.AIR_ATTACK:
      // Resolve air attack type: JUMP_C -> AIR_C, JUMP_D -> AIR_D, else AIR_A
      if (currentAttack === AttackType.JUMP_C || currentAttack === AttackType.JUMP_CD) {
        return 'AIR_C';
      }
      if (currentAttack === AttackType.JUMP_D) {
        return 'AIR_D';
      }
      return 'AIR_A';

    case FighterState.HITSTUN:
      return 'HURT';

    case FighterState.KNOCKDOWN:
      return 'KNOCKDOWN';

    case FighterState.GETUP:
      // Getup uses the last knockdown frames (lying → rising), same frame set
      return 'KNOCKDOWN';

    case FighterState.JUMP:
    case FighterState.HOP:
    case FighterState.RUN_JUMP:
    case FighterState.HYPER_JUMP:
      return 'JUMP';

    case FighterState.THROW:
      return 'THROW';

    case FighterState.BLOCK:
    case FighterState.AIR_BLOCK:
      return 'BLOCK';

    case FighterState.DIZZY:
      return 'DIZZY';

    case FighterState.GUARD_CRUSH:
      return 'GUARD_CRUSH';

    case FighterState.MAX_MODE:
      return 'MAX_MODE';

    case FighterState.TAUNT:
      return 'TAUNT';

    case FighterState.COUNTER_STANCE:
      return 'COUNTER_STANCE';

    default:
      return null;
  }
}

// ===== Public API =====

/**
 * Target display height in screen pixels for all Ryo high-res frames.
 * Historically 48x72 frames rendered at 2x scale = 144px display height.
 * Newer 96x144 frames render at 1x scale to hit the same 144px target.
 */
const RYO_TARGET_DISPLAY_HEIGHT = 144;

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
 * Resolve the frame registry key for a given character state.
 * Returns null if the character is not 'ryo' or the state has no mapping.
 */
export function getResolvedFrameKey(
  charId: string,
  state: FighterState,
  currentAttack: AttackType | null = null,
  vx: number = 0,
  facing: number = 1,
): string | null {
  if (charId !== 'ryo') return null;
  initAllFrames();
  return resolveFrameKey(state, currentAttack, vx, facing);
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

  // Cyclic frame selection — use variable durations when available
  const frameIdx = entry.frameDurations
    ? getVariableFrameIndex(stateAge, entry.frameDurations)
    : Math.floor(stateAge / entry.ticksPerFrame) % frames.length;
  const frame = frames[frameIdx];

  // Compute scale dynamically so all frame sizes display at the same target height.
  // 48x72 frames -> scale 2 (72*2=144), 96x144 frames -> scale 1 (144*1=144).
  const scale = RYO_TARGET_DISPLAY_HEIGHT / frame.height;

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
 * Draw Ryo's high-res frame as a tinted afterimage ghost.
 * Used for RUN/BACKDASH/ROLL trails instead of skeletal fallback.
 * Returns true if a pixel frame was available and drawn.
 */
export function drawHighResAfterimage(
  ctx: CanvasRenderingContext2D,
  charId: string,
  state: FighterState,
  stateAge: number,
  x: number,
  y: number,
  facing: number,
  currentAttack: AttackType | null = null,
  vx: number = 0,
  tint: string = '#ff8844',
  alpha: number = 0.25,
): boolean {
  if (charId !== 'ryo') return false;
  initAllFrames();

  const key = resolveFrameKey(state, currentAttack, vx, facing);
  if (key === null) return false;

  const entry = RYO_FRAMES.get(key);
  if (!entry) return false;

  const { frames, ticksPerFrame } = entry;
  if (frames.length === 0) return false;

  const frameIdx = Math.floor(stateAge / ticksPerFrame) % frames.length;
  const frame = frames[frameIdx];
  const scale = RYO_TARGET_DISPLAY_HEIGHT / frame.height;

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

/**
 * Draw Ryo's win/victory pose. Called directly during WIN_QUOTE game phase.
 */
export function drawRyoWinPose(
  ctx: CanvasRenderingContext2D,
  stateAge: number,
  x: number,
  y: number,
  facing: number,
): boolean {
  initAllFrames();
  const entry = RYO_FRAMES.get('WIN');
  if (!entry) return false;
  const { frames, palette, ticksPerFrame } = entry;
  if (frames.length === 0) return false;
  const frameIdx = Math.floor(stateAge / ticksPerFrame) % frames.length;
  const frame = frames[frameIdx];
  const scale = RYO_TARGET_DISPLAY_HEIGHT / frame.height;
  drawPixelFrame(ctx, frame, x, y, scale, facing, palette);
  return true;
}
