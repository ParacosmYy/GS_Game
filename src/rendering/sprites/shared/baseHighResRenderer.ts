/**
 * baseHighResRenderer.ts
 *
 * Shared infrastructure for per-character high-resolution pixel frame rendering.
 *
 * Each character (Ryo, Kyo, Iori, ...) provides:
 *   1. Frame data files (kyoIdleFrames.ts, kyoAttackFrames.ts, etc.)
 *   2. An initXxxFrames() function that registers all frame sets
 *   3. A resolveXxxFrameKey() function that maps (FighterState, AttackType) → registry key
 *
 * Everything else — conversion, caching, prerendering, drawing, afterimage —
 * is handled by this shared base.
 */

import {
  drawPixelFrame,
  prerenderFrame,
  drawPrerenderedFrame,
  type PixelFrame,
  type PixelPalette,
} from './pixelFrameRenderer.js';
import type { FighterState, AttackType } from '../../../core/types.js';

// ===== Types =====

export interface FrameEntry {
  frames: PixelFrame[];
  palette: PixelPalette;
  ticksPerFrame: number;
  frameDurations?: number[];
}

export interface SourcePixelFrame {
  width: number;
  height: number;
  palette: Record<number, string>;
  pixels: number[][];
}

// ===== Conversion =====

export function convertFrame(frame: SourcePixelFrame): { frame: PixelFrame; palette: PixelPalette } {
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

// ===== Registration =====

export function registerFrames(
  registry: Map<string, FrameEntry>,
  key: string,
  rawFrames: SourcePixelFrame[],
  ticksPerFrame: number,
): void {
  if (registry.has(key)) return;
  const converted = rawFrames.map(convertFrame);
  if (converted.length === 0) return;
  registry.set(key, {
    frames: converted.map(c => c.frame),
    palette: converted[0].palette,
    ticksPerFrame,
  });
}

export function registerVariableFrames(
  registry: Map<string, FrameEntry>,
  key: string,
  rawFrames: SourcePixelFrame[],
  frameDurations: number[],
): void {
  if (registry.has(key)) return;
  const converted = rawFrames.map(convertFrame);
  if (converted.length === 0) return;
  registry.set(key, {
    frames: converted.map(c => c.frame),
    palette: converted[0].palette,
    ticksPerFrame: frameDurations[0] || 8,
    frameDurations,
  });
}

// ===== Frame Index =====

export function getVariableFrameIndex(stateAge: number, frameDurations: number[]): number {
  let tickAccum = 0;
  const totalCycle = frameDurations.reduce((a, b) => a + b, 0);
  const cycleAge = stateAge % totalCycle;
  for (let i = 0; i < frameDurations.length; i++) {
    tickAccum += frameDurations[i];
    if (cycleAge < tickAccum) return i;
  }
  return frameDurations.length - 1;
}

// ===== Factory =====

export interface HighResRenderer {
  has(state: FighterState, attack: AttackType | null, vx: number, facing: number): boolean;
  resolveKey(state: FighterState, attack: AttackType | null, vx: number, facing: number): string | null;
  draw(ctx: CanvasRenderingContext2D, state: FighterState, stateAge: number, x: number, y: number, facing: number, attack: AttackType | null, vx: number): boolean;
  drawAfterimage(ctx: CanvasRenderingContext2D, state: FighterState, stateAge: number, x: number, y: number, facing: number, attack: AttackType | null, vx: number, tint?: string, alpha?: number): boolean;
  drawWinPose(ctx: CanvasRenderingContext2D, stateAge: number, x: number, y: number, facing: number): boolean;
}

export interface HighResRendererConfig {
  targetDisplayHeight: number;
  defaultTint: string;
  defaultAlpha?: number;
  setup: (
    reg: (key: string, frames: SourcePixelFrame[], tpf: number) => void,
    regV: (key: string, frames: SourcePixelFrame[], durations: number[]) => void,
  ) => void;
  resolveKey: (state: FighterState, attack: AttackType | null, vx: number, facing: number) => string | null;
}

export function createHighResRenderer(config: HighResRendererConfig): HighResRenderer {
  const registry = new Map<string, FrameEntry>();
  const cache = new Map<string, HTMLCanvasElement>();
  let initialized = false;

  function ensureInit() {
    if (initialized) return;
    initialized = true;
    const boundReg = (key: string, frames: SourcePixelFrame[], tpf: number) =>
      registerFrames(registry, key, frames, tpf);
    const boundRegV = (key: string, frames: SourcePixelFrame[], durations: number[]) =>
      registerVariableFrames(registry, key, frames, durations);
    config.setup(boundReg, boundRegV);
  }

  return {
    has(state, attack, vx, facing) {
      ensureInit();
      const key = config.resolveKey(state, attack, vx, facing);
      return key !== null && registry.has(key);
    },
    resolveKey(state, attack, vx, facing) {
      ensureInit();
      return config.resolveKey(state, attack, vx, facing);
    },
    draw(ctx, state, stateAge, x, y, facing, attack, vx) {
      ensureInit();
      const key = config.resolveKey(state, attack, vx, facing);
      if (key === null) return false;
      return drawFromRegistry(ctx, registry, cache, key, stateAge, x, y, facing, config.targetDisplayHeight);
    },
    drawAfterimage(ctx, state, stateAge, x, y, facing, attack, vx, tint, alpha) {
      ensureInit();
      const key = config.resolveKey(state, attack, vx, facing);
      if (key === null) return false;
      return drawAfterimageFromRegistry(
        ctx, registry, key, stateAge, x, y, facing, config.targetDisplayHeight,
        tint ?? config.defaultTint, alpha ?? config.defaultAlpha ?? 0.25,
      );
    },
    drawWinPose(ctx, stateAge, x, y, facing) {
      ensureInit();
      const entry = registry.get('WIN');
      if (!entry) return false;
      const { frames, palette, ticksPerFrame } = entry;
      if (frames.length === 0) return false;
      const frameIdx = Math.floor(stateAge / ticksPerFrame) % frames.length;
      const frame = frames[frameIdx];
      const scale = config.targetDisplayHeight / frame.height;
      drawPixelFrame(ctx, frame, x, y, scale, facing, palette);
      return true;
    },
  };
}

// ===== Drawing =====

export function drawFromRegistry(
  ctx: CanvasRenderingContext2D,
  registry: Map<string, FrameEntry>,
  cache: Map<string, HTMLCanvasElement>,
  key: string,
  stateAge: number,
  x: number,
  y: number,
  facing: number,
  targetHeight: number,
): boolean {
  const entry = registry.get(key);
  if (!entry) return false;

  const { frames, palette, ticksPerFrame } = entry;
  if (frames.length === 0) return false;

  const frameIdx = entry.frameDurations
    ? getVariableFrameIndex(stateAge, entry.frameDurations)
    : Math.floor(stateAge / ticksPerFrame) % frames.length;
  const frame = frames[frameIdx];

  const scale = targetHeight / frame.height;

  const cacheKey = `${key}:${frameIdx}:${scale}`;
  let cached = cache.get(cacheKey);
  if (!cached) {
    cached = prerenderFrame(frame, scale, palette);
    cache.set(cacheKey, cached);
  }
  drawPrerenderedFrame(ctx, cached, frame, x, y, scale, facing);
  return true;
}

export function drawAfterimageFromRegistry(
  ctx: CanvasRenderingContext2D,
  registry: Map<string, FrameEntry>,
  key: string,
  stateAge: number,
  x: number,
  y: number,
  facing: number,
  targetHeight: number,
  tint: string,
  alpha: number,
): boolean {
  const entry = registry.get(key);
  if (!entry) return false;

  const { frames, ticksPerFrame } = entry;
  if (frames.length === 0) return false;

  const frameIdx = Math.floor(stateAge / ticksPerFrame) % frames.length;
  const frame = frames[frameIdx];
  const scale = targetHeight / frame.height;

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
