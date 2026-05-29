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
  /** Optional custom anchor; defaults to { x: width/2, y: height } */
  anchor?: { x: number; y: number };
}

// ===== PNG Image Types =====

/** A single frame backed by a real PNG image (instead of procedural pixel array) */
export interface SpriteImageFrame {
  /** Loaded HTMLImageElement */
  image: HTMLImageElement;
  /** Source rectangle within the image (typically full image for individual PNGs) */
  srcRect: { x: number; y: number; w: number; h: number };
  /** Anchor point in sprite pixel coords (character center-bottom) */
  anchor: { x: number; y: number };
  /** Duration in ticks */
  duration: number;
}

/** Registry entry for PNG-based sprite animations */
export interface ImageFrameEntry {
  frames: SpriteImageFrame[];
  frameDurations: number[];
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
    anchor: frame.anchor ?? { x: Math.floor(width / 2), y: height },
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

// ===== PNG Image Registration =====

export function registerImageFrames(
  registry: Map<string, ImageFrameEntry>,
  key: string,
  frames: SpriteImageFrame[],
): void {
  if (registry.has(key)) return;
  if (frames.length === 0) return;
  registry.set(key, {
    frames,
    frameDurations: frames.map(f => f.duration),
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

/** Extended config that also supports PNG image frames */
export interface ImageRendererConfig extends HighResRendererConfig {
  /** If provided, PNG images take priority over procedural pixel frames */
  imageSetup?: (
    regImg: (key: string, frames: SpriteImageFrame[]) => void,
  ) => void;
}

export function createHighResRenderer(config: HighResRendererConfig | ImageRendererConfig): HighResRenderer {
  const registry = new Map<string, FrameEntry>();
  const imageRegistry = new Map<string, ImageFrameEntry>();
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

    // Register PNG image frames if imageSetup provided
    const imgConfig = config as ImageRendererConfig;
    if (imgConfig.imageSetup) {
      const boundRegImg = (key: string, frames: SpriteImageFrame[]) =>
        registerImageFrames(imageRegistry, key, frames);
      imgConfig.imageSetup(boundRegImg);
    }
  }

  return {
    has(state, attack, vx, facing) {
      ensureInit();
      const key = config.resolveKey(state, attack, vx, facing);
      return key !== null && (imageRegistry.has(key) || registry.has(key));
    },
    resolveKey(state, attack, vx, facing) {
      ensureInit();
      return config.resolveKey(state, attack, vx, facing);
    },
    draw(ctx, state, stateAge, x, y, facing, attack, vx) {
      ensureInit();
      const key = config.resolveKey(state, attack, vx, facing);
      if (key === null) return false;
      // PNG image path takes priority
      if (imageRegistry.has(key)) {
        return drawImageFromRegistry(ctx, imageRegistry, key, stateAge, x, y, facing, config.targetDisplayHeight);
      }
      return drawFromRegistry(ctx, registry, cache, key, stateAge, x, y, facing, config.targetDisplayHeight);
    },
    drawAfterimage(ctx, state, stateAge, x, y, facing, attack, vx, tint, alpha) {
      ensureInit();
      const key = config.resolveKey(state, attack, vx, facing);
      if (key === null) return false;
      // PNG image path takes priority
      if (imageRegistry.has(key)) {
        return drawImageAfterimageFromRegistry(
          ctx, imageRegistry, key, stateAge, x, y, facing, config.targetDisplayHeight,
          tint ?? config.defaultTint, alpha ?? config.defaultAlpha ?? 0.25,
        );
      }
      return drawAfterimageFromRegistry(
        ctx, registry, key, stateAge, x, y, facing, config.targetDisplayHeight,
        tint ?? config.defaultTint, alpha ?? config.defaultAlpha ?? 0.25,
      );
    },
    drawWinPose(ctx, stateAge, x, y, facing) {
      ensureInit();
      // PNG image path for WIN
      if (imageRegistry.has('WIN')) {
        return drawImageFromRegistry(ctx, imageRegistry, 'WIN', stateAge, x, y, facing, config.targetDisplayHeight);
      }
      const entry = registry.get('WIN');
      if (!entry) return false;
      const { frames, palette, ticksPerFrame } = entry;
      if (frames.length === 0) return false;
      const frameIdx = entry.frameDurations
        ? getVariableFrameIndex(stateAge, entry.frameDurations)
        : Math.floor(stateAge / ticksPerFrame) % frames.length;
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

  const frameIdx = entry.frameDurations
    ? getVariableFrameIndex(stateAge, entry.frameDurations)
    : Math.floor(stateAge / ticksPerFrame) % frames.length;
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

// ===== PNG Image Drawing =====

export function drawImageFromRegistry(
  ctx: CanvasRenderingContext2D,
  registry: Map<string, ImageFrameEntry>,
  key: string,
  stateAge: number,
  x: number,
  y: number,
  facing: number,
  targetHeight: number,
): boolean {
  const entry = registry.get(key);
  if (!entry || entry.frames.length === 0) return false;

  const frameIdx = getVariableFrameIndex(stateAge, entry.frameDurations);
  const frame = entry.frames[frameIdx % entry.frames.length];
  const { image, srcRect, anchor } = frame;

  // Lazy-loaded images may not be ready yet — skip frame until loaded
  if (!image.complete || image.naturalWidth === 0) return false;

  const scale = targetHeight / srcRect.h;

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  const drawX = x - anchor.x * scale;
  const drawY = y - anchor.y * scale;

  if (facing === -1) {
    ctx.translate(Math.round(drawX) + srcRect.w * scale, Math.round(drawY));
    ctx.scale(-1, 1);
    ctx.drawImage(image, srcRect.x, srcRect.y, srcRect.w, srcRect.h, 0, 0, srcRect.w * scale, srcRect.h * scale);
  } else {
    ctx.drawImage(image, srcRect.x, srcRect.y, srcRect.w, srcRect.h, Math.round(drawX), Math.round(drawY), srcRect.w * scale, srcRect.h * scale);
  }

  ctx.restore();
  return true;
}

export function drawImageAfterimageFromRegistry(
  ctx: CanvasRenderingContext2D,
  registry: Map<string, ImageFrameEntry>,
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
  if (!entry || entry.frames.length === 0) return false;

  const frameIdx = getVariableFrameIndex(stateAge, entry.frameDurations);
  const frame = entry.frames[frameIdx % entry.frames.length];
  const { image, srcRect, anchor } = frame;

  if (!image.complete || image.naturalWidth === 0) return false;

  const scale = targetHeight / srcRect.h;

  // Draw tinted afterimage using a temporary canvas
  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = srcRect.w;
  tmpCanvas.height = srcRect.h;
  const tmpCtx = tmpCanvas.getContext('2d')!;
  tmpCtx.drawImage(image, srcRect.x, srcRect.y, srcRect.w, srcRect.h, 0, 0, srcRect.w, srcRect.h);

  // Apply tint using globalCompositeOperation
  tmpCtx.globalCompositeOperation = 'source-atop';
  tmpCtx.fillStyle = tint;
  tmpCtx.fillRect(0, 0, srcRect.w, srcRect.h);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = false;

  const drawX = x - anchor.x * scale;
  const drawY = y - anchor.y * scale;

  if (facing === -1) {
    ctx.translate(Math.round(drawX) + srcRect.w * scale, Math.round(drawY));
    ctx.scale(-1, 1);
    ctx.drawImage(tmpCanvas, 0, 0, srcRect.w * scale, srcRect.h * scale);
  } else {
    ctx.drawImage(tmpCanvas, Math.round(drawX), Math.round(drawY), srcRect.w * scale, srcRect.h * scale);
  }

  ctx.restore();
  return true;
}
