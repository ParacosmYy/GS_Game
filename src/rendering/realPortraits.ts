/**
 * Real MUGEN portrait renderer.
 *
 * Rendering consumes PortraitEntry.imagePath generated from manifest data.
 * It never parses MUGEN files and falls back to existing pixel portraits while
 * the browser image is still loading.
 */
import type { PortraitEntry } from '../core/portraitManifest.js';

export interface RealPortraitRenderOptions {
  frameColor?: string;
  backdropColor?: string;
  shadowColor?: string;
  scanlines?: boolean;
  fit?: 'contain' | 'cover';
}

const imageCache = new Map<string, HTMLImageElement | 'failed'>();

function getCachedImage(src: string): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;

  const cached = imageCache.get(src);
  if (cached === 'failed') return null;
  if (cached) return cached;

  const image = new Image();
  image.onload = () => imageCache.set(src, image);
  image.onerror = () => imageCache.set(src, 'failed');
  image.src = src;
  imageCache.set(src, image);
  return image;
}

function isImageReady(image: HTMLImageElement): boolean {
  return image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
): void {
  ctx.lineWidth = 1;
  ctx.strokeStyle = color;
  ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.strokeRect(x - 1, y - 1, width + 2, height + 2);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.58)';
  ctx.strokeRect(x, y, width, height);
}

function drawScanlines(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
  ctx.save();
  ctx.fillStyle = '#000';
  ctx.globalAlpha = 0.06;
  for (let row = 0; row < height; row += 3) {
    ctx.fillRect(x, y + row, width, 1);
  }
  ctx.globalAlpha = 0.025;
  for (let row = 1; row < height; row += 6) {
    ctx.fillRect(x, y + row, width, 1);
  }
  ctx.restore();
}

export function canDrawRealPortrait(entry: PortraitEntry | undefined): boolean {
  return entry?.source === 'mugen-sprite' && typeof entry.imagePath === 'string' && entry.imagePath.length > 0;
}

export function drawRealPortraitInBox(
  ctx: CanvasRenderingContext2D,
  entry: PortraitEntry | undefined,
  boxX: number,
  boxY: number,
  boxWidth: number,
  boxHeight: number,
  options: RealPortraitRenderOptions = {},
): boolean {
  if (!canDrawRealPortrait(entry)) return false;

  const image = getCachedImage(entry!.imagePath!);
  if (!image || !isImageReady(image)) return false;

  const sourceWidth = entry!.assetWidth ?? image.naturalWidth;
  const sourceHeight = entry!.assetHeight ?? image.naturalHeight;
  const scale = options.fit === 'cover'
    ? Math.max(boxWidth / sourceWidth, boxHeight / sourceHeight)
    : Math.min(boxWidth / sourceWidth, boxHeight / sourceHeight);
  const drawWidth = Math.max(1, Math.round(sourceWidth * scale));
  const drawHeight = Math.max(1, Math.round(sourceHeight * scale));
  const drawX = Math.round(boxX + (boxWidth - drawWidth) / 2);
  const drawY = Math.round(boxY + (boxHeight - drawHeight) / 2);

  ctx.save();
  ctx.beginPath();
  ctx.rect(boxX, boxY, boxWidth, boxHeight);
  ctx.clip();

  if (options.shadowColor) {
    ctx.shadowColor = options.shadowColor;
    ctx.shadowBlur = 14;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
    ctx.fillRect(drawX + 1, drawY + 2, drawWidth, drawHeight);
    ctx.shadowBlur = 0;
  }

  if (options.backdropColor) {
    ctx.fillStyle = options.backdropColor;
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
  }

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);

  if (options.scanlines) {
    drawScanlines(ctx, boxX, boxY, boxWidth, boxHeight);
  }
  if (options.frameColor) {
    drawFrame(ctx, boxX, boxY, boxWidth, boxHeight, options.frameColor);
  }

  ctx.restore();
  return true;
}
