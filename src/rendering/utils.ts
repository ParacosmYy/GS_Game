/**
 * Shared drawing utilities — pure functions used across rendering modules
 */

/** Draw a rounded rectangle path (does NOT fill/stroke — caller must ctx.fill() or ctx.stroke()) */
export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** Shift a color's RGB channels by a uniform amount */
export function shiftColor(color: string, amount: number): string {
  const { r, g, b } = parseColor(color);
  const nr = Math.min(255, Math.max(0, r + amount));
  const ng = Math.min(255, Math.max(0, g + amount));
  const nb = Math.min(255, Math.max(0, b + amount));
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

/** Parse a CSS color string to {r, g, b} */
export function parseColor(color: string): { r: number; g: number; b: number } {
  if (color.startsWith('#')) {
    return {
      r: parseInt(color.slice(1, 3), 16),
      g: parseInt(color.slice(3, 5), 16),
      b: parseInt(color.slice(5, 7), 16),
    };
  }
  if (color.startsWith('rgba(') || color.startsWith('rgb(')) {
    const m = color.match(/(\d+)/g);
    return m ? { r: +m[0], g: +m[1], b: +m[2] } : { r: 128, g: 128, b: 128 };
  }
  return { r: 128, g: 128, b: 128 };
}

/** SNK风格文字: 粗描边+渐变填充+顶部高光 (KOF2002经典文字风格) */
export function drawSNKText(
  ctx: CanvasRenderingContext2D,
  text: string, x: number, y: number,
  fontSize: number, fillColor: string, strokeColor: string = '#000000',
  align: CanvasTextAlign = 'center', baseline: CanvasTextBaseline = 'middle',
): void {
  ctx.save();
  ctx.font = `bold ${fontSize}px "Courier New", monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  // 外描边 (黑色粗边, SNK经典风格)
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = Math.max(2, Math.round(fontSize / 8));
  ctx.lineJoin = 'round';
  ctx.strokeText(text, x, y);
  // 渐变填充 (从亮到暗, SNK金属感)
  const grad = ctx.createLinearGradient(x, y - fontSize * 0.5, x, y + fontSize * 0.5);
  grad.addColorStop(0, shiftColor(fillColor, 40));
  grad.addColorStop(0.3, fillColor);
  grad.addColorStop(1, shiftColor(fillColor, -40));
  ctx.fillStyle = grad;
  ctx.fillText(text, x, y);
  // 顶部高光线
  ctx.fillStyle = `rgba(255, 255, 255, 0.25)`;
  ctx.fillText(text, x, y - 0.5);
  ctx.restore();
}
