/**
 * Shared drawing utilities — pure functions used across rendering modules
 */

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const STAGE_GROUND_Y = 510;

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

/**
 * KOF2002-style perspective floor grid lines.
 * Draws horizontal lines that converge toward a vanishing point to simulate depth,
 * plus vertical lines that narrow as they recede.
 *
 * @param ctx - Canvas context
 * @param cameraX - Current camera offset for scrolling
 * @param lineColor - Color string for the grid lines (e.g. 'rgba(102, 102, 102, 0.15)')
 */
export function drawPerspectiveFloorGrid(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  lineColor: string = 'rgba(102, 102, 102, 0.15)',
): void {
  const vanishY = STAGE_GROUND_Y - 120;  // vanishing point Y (above the ground line)
  const groundBottom = CANVAS_HEIGHT;
  const floorHeight = groundBottom - STAGE_GROUND_Y;

  ctx.save();
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 0.5;

  // --- Horizontal lines (far-to-near, getting wider spacing) ---
  // Use a perspective distribution: lines are closer together near the top (far),
  // wider apart near the bottom (near). This creates depth.
  const numHLines = 10;
  for (let i = 1; i <= numHLines; i++) {
    const t = i / numHLines;
    // Perspective-corrected Y: lines bunch up near vanishY, spread near bottom
    const perspT = t * t;  // quadratic ease-in for perspective
    const y = STAGE_GROUND_Y + perspT * floorHeight;
    // Lines fade with distance (farther = more transparent)
    const alpha = 0.06 + t * 0.12;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
  }

  // --- Converging vertical lines (meet at vanishing point above) ---
  const numVLines = 12;
  const scrollOffset = (cameraX * 0.3) % (CANVAS_WIDTH / numVLines);
  ctx.globalAlpha = 0.08;
  for (let i = -2; i <= numVLines + 2; i++) {
    // Bottom X positions (evenly spaced at ground level, with camera scroll)
    const bottomX = (i / numVLines) * CANVAS_WIDTH + scrollOffset;
    // Top X converges toward center (vanishing point X = CANVAS_WIDTH / 2)
    const topX = CANVAS_WIDTH / 2 + (bottomX - CANVAS_WIDTH / 2) * 0.15;

    ctx.beginPath();
    ctx.moveTo(topX, vanishY);
    ctx.lineTo(bottomX, groundBottom);
    ctx.stroke();
  }

  ctx.restore();
}
