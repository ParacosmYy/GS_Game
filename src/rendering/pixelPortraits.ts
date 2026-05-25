/**
 * SNK-style pixel portraits for character select.
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

/** 像素肖像渲染选项 */
export interface PixelPortraitRenderOptions {
  /** 外框颜色 */
  frameColor?: string;
  /** 背景颜色 */
  backdropColor?: string;
  /** 阴影颜色 */
  shadowColor?: string;
  /** 是否叠加轻微扫描线 */
  scanlines?: boolean;
}

function drawBackdropLayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  options: PixelPortraitRenderOptions,
): void {
  const pad = 3;

  ctx.save();
  if (options.shadowColor) {
    ctx.shadowColor = options.shadowColor;
    ctx.shadowBlur = 14;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
    ctx.fillRect(x + 1, y + 2, width, height);
  }

  if (options.backdropColor) {
    ctx.fillStyle = options.backdropColor;
    ctx.fillRect(x - pad, y - pad, width + pad * 2, height + pad * 2);

    const glass = ctx.createLinearGradient(x, y - pad, x, y + height + pad);
    glass.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
    glass.addColorStop(0.28, 'rgba(255, 255, 255, 0.04)');
    glass.addColorStop(0.65, 'rgba(255, 255, 255, 0.00)');
    glass.addColorStop(1, 'rgba(0, 0, 0, 0.18)');
    ctx.fillStyle = glass;
    ctx.fillRect(x - pad, y - pad, width + pad * 2, height + pad * 2);
  }
  ctx.restore();
}

function drawPortraitPixels(
  ctx: CanvasRenderingContext2D,
  portrait: PixelPortraitData,
  x: number,
  y: number,
  scale: number,
): void {
  for (let row = 0; row < portrait.height; row++) {
    const rowData = portrait.pixels[row];
    if (!rowData) continue;
    for (let col = 0; col < portrait.width; col++) {
      const idx = rowData[col] ?? 0;
      if (idx === 0) continue;
      const color = portrait.palette[idx];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
    }
  }
}

function drawGlassOverlay(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const sheen = ctx.createLinearGradient(x, y, x, y + height);
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
  sheen.addColorStop(0.26, 'rgba(255, 255, 255, 0.05)');
  sheen.addColorStop(0.62, 'rgba(255, 255, 255, 0.00)');
  sheen.addColorStop(1, 'rgba(0, 0, 0, 0.10)');
  ctx.fillStyle = sheen;
  ctx.fillRect(x, y, width, height);

  const vignette = ctx.createLinearGradient(x, y, x + width, y);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0.18)');
  vignette.addColorStop(0.15, 'rgba(0, 0, 0, 0.00)');
  vignette.addColorStop(0.85, 'rgba(0, 0, 0, 0.00)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.18)');
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = vignette;
  ctx.fillRect(x, y, width, height);

  ctx.restore();
}

function drawScanlines(
  ctx: CanvasRenderingContext2D,
  portrait: PixelPortraitData,
  x: number,
  y: number,
  scale: number,
): void {
  ctx.save();
  ctx.fillStyle = '#000';
  ctx.globalAlpha = 0.06;
  for (let row = 0; row < portrait.height; row += 3) {
    ctx.fillRect(x, y + row * scale, portrait.width * scale, 1);
  }
  ctx.globalAlpha = 0.025;
  for (let row = 1; row < portrait.height; row += 6) {
    ctx.fillRect(x, y + row * scale, portrait.width * scale, 1);
  }
  ctx.restore();
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  frameColor: string,
): void {
  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = frameColor;
  ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.strokeRect(x - 1, y - 1, width + 2, height + 2);

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.58)';
  ctx.strokeRect(x, y, width, height);
  ctx.restore();
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
  options: PixelPortraitRenderOptions = {},
): void {
  const width = portrait.width * scale;
  const height = portrait.height * scale;
  drawBackdropLayer(ctx, x, y, width, height, options);
  drawPortraitPixels(ctx, portrait, x, y, scale);
  drawGlassOverlay(ctx, x, y, width, height);
  if (options.scanlines) {
    drawScanlines(ctx, portrait, x, y, scale);
  }
  if (options.frameColor) {
    drawFrame(ctx, x, y, width, height, options.frameColor);
  }
}
