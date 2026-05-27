/**
 * ioriHighResRender.ts
 *
 * Integration layer: connects Iori's high-resolution pixel frame data
 * with the pixelFrameRenderer drawing API.
 *
 * Currently supports: IDLE, WALK (forward/backward), CROUCH, STAND_ATTACK (A/C)
 * Fallback states (jump, damage, etc.) will be added as frames are created.
 */

import { FighterState, AttackType } from '../../core/types.js';
import { drawPixelFrame, prerenderFrame, drawPrerenderedFrame, type PixelFrame, type PixelPalette } from './pixelFrameRenderer.js';
import { IORI_IDLE_FRAMES } from './ioriIdleFrames.js';
import { IORI_WALK_FORWARD_FRAMES, IORI_WALK_BACKWARD_FRAMES } from './ioriWalkFrames.js';
import { IORI_CROUCH_FRAMES } from './ioriCrouchFrames.js';
import { IORI_STAND_A_FRAMES, IORI_STAND_C_FRAMES } from './ioriAttackFrames.js';

// ===== Internal Frame Registry =====

interface FrameEntry {
  frames: PixelFrame[];
  palette: PixelPalette;
  ticksPerFrame: number;
  frameDurations?: number[];
}

const IORI_FRAMES = new Map<string, FrameEntry>();

const FRAME_CACHE = new Map<string, HTMLCanvasElement>();

interface SourcePixelFrame {
  width: number;
  height: number;
  palette: Record<number, string>;
  pixels: number[][];
}

function convertFrame(frame: SourcePixelFrame): { frame: PixelFrame; palette: PixelPalette } {
  const { width, height, palette: srcPalette, pixels } = frame;
  const cleanPalette: PixelPalette = {};
  for (const [key, color] of Object.entries(srcPalette)) {
    const idx = Number(key);
    if (idx > 0 && color !== 'transparent') {
      cleanPalette[idx] = color;
    }
  }
  const pixelFrame: PixelFrame = {
    width,
    height,
    pixels,
    anchor: { x: Math.floor(width / 2), y: height },
  };
  return { frame: pixelFrame, palette: cleanPalette };
}

function registerFrames(key: string, rawFrames: SourcePixelFrame[], ticksPerFrame: number): void {
  if (IORI_FRAMES.has(key)) return;
  const converted = rawFrames.map(convertFrame);
  if (converted.length === 0) return;
  IORI_FRAMES.set(key, {
    frames: converted.map(c => c.frame),
    palette: converted[0].palette,
    ticksPerFrame,
  });
}

function registerVariableFrames(key: string, rawFrames: SourcePixelFrame[], frameDurations: number[]): void {
  if (IORI_FRAMES.has(key)) return;
  const converted = rawFrames.map(convertFrame);
  if (converted.length === 0) return;
  IORI_FRAMES.set(key, {
    frames: converted.map(c => c.frame),
    palette: converted[0].palette,
    ticksPerFrame: frameDurations[0] || 8,
    frameDurations,
  });
}

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

function initAllFrames(): void {
  if (initialized) return;
  initialized = true;

  // IDLE — 6-frame breathing loop with variable frame hold
  registerVariableFrames('IDLE', IORI_IDLE_FRAMES, [8, 9, 12, 9, 10, 8]);

  // WALK — 4-frame forward/backward cycles
  registerFrames('WALK_FORWARD', IORI_WALK_FORWARD_FRAMES, 6);
  registerFrames('WALK_BACKWARD', IORI_WALK_BACKWARD_FRAMES, 7);

  // CROUCH — 4-frame crouch cycle
  registerFrames('CROUCH', IORI_CROUCH_FRAMES, 8);

  // ATTACKS — STAND_A (4 frames) + STAND_C (5 frames)
  registerVariableFrames('STAND_A', IORI_STAND_A_FRAMES, [4, 3, 4, 8]);
  registerVariableFrames('STAND_C', IORI_STAND_C_FRAMES, [6, 4, 5, 5, 10]);
}

// ===== State Resolution =====

function resolveFrameKey(
  state: FighterState,
  _currentAttack: AttackType | null,
  _vx: number,
  _facing: number,
): string | null {
  switch (state) {
    case FighterState.IDLE:
      return 'IDLE';
    case FighterState.WALK:
      return (_vx * _facing > 0) ? 'WALK_FORWARD' : 'WALK_BACKWARD';
    case FighterState.CROUCH:
    case FighterState.CROUCH_ATTACK:
      return 'CROUCH';
    case FighterState.STAND_ATTACK:
      if (_currentAttack === AttackType.STAND_C) {
        return 'STAND_C';
      }
      return 'STAND_A';
    default:
      return null;
  }
}

// ===== Public API =====

const IORI_TARGET_DISPLAY_HEIGHT = 144;

export function hasIoriHighResFrame(
  state: FighterState,
  currentAttack: AttackType | null = null,
  vx: number = 0,
  facing: number = 1,
): boolean {
  initAllFrames();
  const key = resolveFrameKey(state, currentAttack, vx, facing);
  if (key === null) return false;
  return IORI_FRAMES.has(key);
}

export function drawIoriHighResFrame(
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

  const entry = IORI_FRAMES.get(key);
  if (!entry) return false;

  const { frames, palette, ticksPerFrame } = entry;
  if (frames.length === 0) return false;

  const frameIdx = entry.frameDurations
    ? getVariableFrameIndex(stateAge, entry.frameDurations)
    : Math.floor(stateAge / entry.ticksPerFrame) % frames.length;
  const frame = frames[frameIdx];

  const scale = IORI_TARGET_DISPLAY_HEIGHT / frame.height;

  const cacheKey = `${key}:${frameIdx}:${scale}`;
  let cached = FRAME_CACHE.get(cacheKey);
  if (!cached) {
    cached = prerenderFrame(frame, scale, palette);
    FRAME_CACHE.set(cacheKey, cached);
  }
  drawPrerenderedFrame(ctx, cached, frame, x, y, scale, facing);
  return true;
}

export function drawIoriHighResAfterimage(
  ctx: CanvasRenderingContext2D,
  state: FighterState,
  stateAge: number,
  x: number,
  y: number,
  facing: number,
  currentAttack: AttackType | null = null,
  vx: number = 0,
  tint: string = '#aa00ff',
  alpha: number = 0.25,
): boolean {
  initAllFrames();

  const key = resolveFrameKey(state, currentAttack, vx, facing);
  if (key === null) return false;

  const entry = IORI_FRAMES.get(key);
  if (!entry) return false;

  const { frames, ticksPerFrame } = entry;
  if (frames.length === 0) return false;

  const frameIdx = Math.floor(stateAge / ticksPerFrame) % frames.length;
  const frame = frames[frameIdx];
  const scale = IORI_TARGET_DISPLAY_HEIGHT / frame.height;

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
