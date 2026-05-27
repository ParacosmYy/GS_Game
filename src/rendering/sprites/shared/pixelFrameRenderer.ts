/**
 * pixelFrameRenderer.ts
 *
 * High-resolution pixel frame renderer for character sprites.
 * Draws PixelFrame data (palette-indexed pixel grids) onto a Canvas.
 * Used as a stepping stone toward full sprite atlas rendering,
 * replacing the procedural skeletal/block rendering with actual pixel art data.
 *
 * Design decisions:
 * - Pixels are stored as palette indices (compact, palette-swappable)
 * - Each pixel is drawn as a scale x scale rectangle for crisp scaling
 * - Facing=-1 performs a horizontal mirror by flipping column order
 * - Coordinates: x=character center, y=character bottom (feet)
 */

// ===== PixelFrame Type =====

/** Color palette: maps a palette index to a CSS color string */
export type PixelPalette = Record<number, string>;

/**
 * A single frame of high-resolution pixel art.
 *
 * Coordinates within the frame:
 *   pixels[row][col] where row 0 is the top, col 0 is the left.
 *   Each entry is a palette index. 0 = transparent (not drawn).
 */
export interface PixelFrame {
  /** Frame width in pixels */
  width: number;
  /** Frame height in pixels */
  height: number;
  /**
   * Palette-indexed pixel data. pixels[row][col] gives a palette key.
   * 0 or missing = transparent.
   */
  pixels: number[][];
  /**
   * Anchor point within the frame (pixel coordinates).
   * Typically the character's center-bottom: { x: width/2, y: height }.
   * This anchor aligns with the (x, y) screen position passed to drawPixelFrame.
   */
  anchor: { x: number; y: number };
}

// ===== Renderer =====

/**
 * Draws a high-resolution PixelFrame onto the canvas.
 *
 * @param ctx    - Canvas 2D context
 * @param frame  - The pixel frame data to render
 * @param x      - Screen X coordinate (character center horizontal)
 * @param y      - Screen Y coordinate (character feet / bottom)
 * @param scale  - Pixel scale factor (1 = original size, 2 = 2x, etc.)
 * @param facing - 1 = facing right, -1 = facing left (mirrored)
 * @param palette - Color palette mapping index to CSS color string
 */
export function drawPixelFrame(
  ctx: CanvasRenderingContext2D,
  frame: PixelFrame,
  x: number,
  y: number,
  scale: number,
  facing: number,
  palette: PixelPalette,
): void {
  const { width, height, pixels, anchor } = frame;

  // Calculate draw origin so that (x, y) lands on the anchor point.
  // anchor is in unscaled pixel space within the frame.
  const drawOriginX = x - anchor.x * scale;
  const drawOriginY = y - anchor.y * scale;

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  // Iterate rows top-to-bottom
  for (let row = 0; row < height; row++) {
    const pixelRow = pixels[row];
    if (!pixelRow) continue;

    for (let col = 0; col < width; col++) {
      const paletteIndex = pixelRow[col];
      // 0 = transparent, skip
      if (paletteIndex === 0) continue;

      const color = palette[paletteIndex];
      if (!color) continue;

      // Determine the screen column position.
      // When facing left (-1), mirror the column: col 0 becomes the rightmost.
      const screenCol = facing === -1 ? (width - 1 - col) : col;

      const px = drawOriginX + screenCol * scale;
      const py = drawOriginY + row * scale;

      ctx.fillStyle = color;
      ctx.fillRect(Math.round(px), Math.round(py), scale, scale);
    }
  }

  ctx.restore();
}

/**
 * Draws a PixelFrame with a global offset in addition to the anchor.
 * Useful for frame-specific offsets (e.g., walk lean, attack lunge).
 *
 * @param ctx     - Canvas 2D context
 * @param frame   - The pixel frame data
 * @param x       - Screen X (character center)
 * @param y       - Screen Y (character feet)
 * @param scale   - Pixel scale factor
 * @param facing  - 1=right, -1=left
 * @param palette - Color palette
 * @param offsetX - Additional horizontal offset in screen pixels (applied with facing)
 * @param offsetY - Additional vertical offset in screen pixels
 */
export function drawPixelFrameOffset(
  ctx: CanvasRenderingContext2D,
  frame: PixelFrame,
  x: number,
  y: number,
  scale: number,
  facing: number,
  palette: PixelPalette,
  offsetX: number,
  offsetY: number,
): void {
  drawPixelFrame(
    ctx,
    frame,
    x + offsetX * facing,
    y + offsetY,
    scale,
    facing,
    palette,
  );
}

/**
 * Pre-renders a PixelFrame to an offscreen canvas at a given scale.
 * Returns the offscreen canvas for fast repeated blitting via drawImage.
 *
 * @param frame   - The pixel frame data
 * @param scale   - Pixel scale factor
 * @param palette - Color palette
 * @returns OffscreenCanvas or HTMLCanvasElement with the rendered frame
 */
export function prerenderFrame(
  frame: PixelFrame,
  scale: number,
  palette: PixelPalette,
): HTMLCanvasElement {
  const { width, height, pixels } = frame;
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d')!;

  ctx.imageSmoothingEnabled = false;

  for (let row = 0; row < height; row++) {
    const pixelRow = pixels[row];
    if (!pixelRow) continue;

    for (let col = 0; col < width; col++) {
      const paletteIndex = pixelRow[col];
      if (paletteIndex === 0) continue;

      const color = palette[paletteIndex];
      if (!color) continue;

      ctx.fillStyle = color;
      ctx.fillRect(col * scale, row * scale, scale, scale);
    }
  }

  return canvas;
}

/**
 * Draws a pre-rendered frame canvas to the screen.
 * Supports facing (mirror) via canvas transform.
 *
 * @param ctx       - Target canvas context
 * @param rendered  - Pre-rendered canvas (from prerenderFrame)
 * @param frame     - Original frame (for anchor data)
 * @param x         - Screen X (character center)
 * @param y         - Screen Y (character feet)
 * @param scale     - The scale used during prerender
 * @param facing    - 1=right, -1=left
 */
export function drawPrerenderedFrame(
  ctx: CanvasRenderingContext2D,
  rendered: HTMLCanvasElement,
  frame: PixelFrame,
  x: number,
  y: number,
  scale: number,
  facing: number,
): void {
  const { anchor } = frame;
  const drawX = x - anchor.x * scale;
  const drawY = y - anchor.y * scale;

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  if (facing === -1) {
    // Mirror: translate to the right edge and flip horizontally
    ctx.translate(
      Math.round(drawX) + rendered.width,
      Math.round(drawY),
    );
    ctx.scale(-1, 1);
    ctx.drawImage(rendered, 0, 0);
  } else {
    ctx.drawImage(rendered, Math.round(drawX), Math.round(drawY));
  }

  ctx.restore();
}
