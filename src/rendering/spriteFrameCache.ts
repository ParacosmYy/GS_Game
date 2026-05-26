/**
 * Sprite Frame Cache — pre-renders bone poses to offscreen canvases
 *
 * Caches skeletal fighter poses as bitmap frames keyed by
 * (charId, state, frameIndex, colorIndex). This provides frame-level
 * sprite control without real atlas assets.
 *
 * Usage: opt-in via setFrameCacheEnabled(true) in skeletalFighter.ts.
 * By default, rendering remains live (no caching).
 */

/** Frame dimensions for cached sprites */
const FRAME_WIDTH = 160;
const FRAME_HEIGHT = 200;

/**
 * Creates an offscreen canvas element.
 * Falls back gracefully if document is not available (SSR / test env).
 */
function createOffscreenCanvas(width: number, height: number): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * Manages pre-rendered sprite frames for skeletal fighters.
 *
 * Each cached frame is an HTMLCanvasElement containing the rendered
 * skeletal pose for a specific (charId, state, frameIndex, colorIndex) combo.
 */
export class SpriteFrameCache {
  private cache: Map<string, HTMLCanvasElement> = new Map();
  private readonly frameWidth = FRAME_WIDTH;
  private readonly frameHeight = FRAME_HEIGHT;

  // ── Key management ──

  private makeKey(charId: string, state: string, frameIndex: number, colorIndex: number): string {
    return `${charId}:${state}:${frameIndex}:${colorIndex}`;
  }

  /** Check if a specific frame is already cached */
  has(charId: string, state: string, frameIndex: number, colorIndex: number): boolean {
    return this.cache.has(this.makeKey(charId, state, frameIndex, colorIndex));
  }

  /** Retrieve a cached frame, or null if not present */
  get(charId: string, state: string, frameIndex: number, colorIndex: number): HTMLCanvasElement | null {
    return this.cache.get(this.makeKey(charId, state, frameIndex, colorIndex)) ?? null;
  }

  // ── Rendering to cache ──

  /**
   * Pre-render a skeletal pose frame into the cache.
   *
   * @param drawFn - A function that draws the skeletal pose onto the given context.
   *   The function receives a context pre-translated so (0,0) is at the bottom-center
   *   of the frame (where the character's feet should be).
   * @returns The cached canvas element, or null if canvas creation failed.
   */
  renderToCache(
    drawFn: (ctx: CanvasRenderingContext2D) => void,
    charId: string,
    state: string,
    frameIndex: number,
    colorIndex: number,
  ): HTMLCanvasElement | null {
    const key = this.makeKey(charId, state, frameIndex, colorIndex);
    const existing = this.cache.get(key);
    if (existing) return existing;

    const canvas = createOffscreenCanvas(this.frameWidth, this.frameHeight);
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, this.frameWidth, this.frameHeight);

    // Translate so character origin (feet center) is at bottom-center of frame.
    // This matches the convention in drawSkeletalFighter where sy = ground position.
    ctx.save();
    ctx.translate(this.frameWidth / 2, this.frameHeight);
    drawFn(ctx);
    ctx.restore();

    this.cache.set(key, canvas);
    return canvas;
  }

  /**
   * Draw a cached frame (or render & cache on miss) onto the main canvas.
   *
   * @param mainCtx - The target canvas context
   * @param x - X position (character ground x)
   * @param y - Y position (character ground y)
   * @param drawFn - Fallback draw function for cache miss
   * @returns true if a cached frame was used, false if live-rendered
   */
  blitCachedFrame(
    mainCtx: CanvasRenderingContext2D,
    x: number,
    y: number,
    drawFn: (ctx: CanvasRenderingContext2D) => void,
    charId: string,
    state: string,
    frameIndex: number,
    colorIndex: number,
  ): boolean {
    let frame = this.get(charId, state, frameIndex, colorIndex);

    if (!frame) {
      // Cache miss — render into cache
      frame = this.renderToCache(drawFn, charId, state, frameIndex, colorIndex);
    }

    if (frame) {
      // Blit cached frame: drawImage centered so feet align with (x, y)
      mainCtx.drawImage(
        frame,
        x - this.frameWidth / 2,
        y - this.frameHeight,
      );
      return true;
    }

    // Canvas unavailable — fall back to live rendering
    drawFn(mainCtx);
    return false;
  }

  // ── Warmup ──

  /**
   * Pre-warm the cache for a character's key animation states.
   *
   * @param charId - Character identifier (e.g. 'ryo')
   * @param statesToFrames - Map of state names to frame count arrays
   *   e.g. { IDLE: 8, WALK: 6, HITSTUN: 5, KNOCKDOWN: 6 }
   * @param drawFn - Function to draw a single pose frame given (ctx, state, frameIndex, colorIndex)
   * @param colorCount - Number of color palettes to pre-render (default 4)
   */
  warmup(
    charId: string,
    statesToFrames: Record<string, number>,
    drawFn: (ctx: CanvasRenderingContext2D, state: string, frameIndex: number, colorIndex: number) => void,
    colorCount: number = 4,
  ): void {
    for (let colorIdx = 0; colorIdx < colorCount; colorIdx++) {
      for (const [state, frameCount] of Object.entries(statesToFrames)) {
        for (let frameIdx = 0; frameIdx < frameCount; frameIdx++) {
          this.renderToCache(
            (ctx) => drawFn(ctx, state, frameIdx, colorIdx),
            charId,
            state,
            frameIdx,
            colorIdx,
          );
        }
      }
    }
  }

  // ── Lifecycle ──

  /** Clear all cached frames */
  clear(): void {
    this.cache.clear();
  }

  /** Number of cached frames */
  get size(): number {
    return this.cache.size;
  }

  /** Dimensions info for external consumers */
  get dimensions(): { width: number; height: number } {
    return { width: this.frameWidth, height: this.frameHeight };
  }
}

/** Singleton sprite frame cache instance */
export const spriteFrameCache = new SpriteFrameCache();
