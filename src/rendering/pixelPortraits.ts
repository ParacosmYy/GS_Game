/**
 * SNK-style pixel portraits for character select
 *
 * Each portrait is a 2D grid where each cell is a color index.
 * Palette maps indices to hex colors; index 0 = transparent.
 */

/** Raw pixel portrait data — palette + 2D pixel grid */
export interface PixelPortraitData {
  /** Width in pixels (before scaling) */
  width: number;
  /** Height in pixels (before scaling) */
  height: number;
  /** Color palette: index → hex color. 0 = transparent */
  palette: Record<number, string>;
  /** Pixel data: 2D array [row][col] of palette indices */
  pixels: number[][];
}

/**
 * Draw a pixel portrait at the given position with the given scale.
 * Skips index 0 (transparent) and missing palette entries.
 */
export function drawPixelPortrait(
  ctx: CanvasRenderingContext2D,
  portrait: PixelPortraitData,
  x: number,
  y: number,
  scale: number = 3,
): void {
  for (let row = 0; row < portrait.height; row++) {
    for (let col = 0; col < portrait.width; col++) {
      const idx = portrait.pixels[row]![col]!;
      if (idx === 0) continue;
      const color = portrait.palette[idx];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
    }
  }
}
