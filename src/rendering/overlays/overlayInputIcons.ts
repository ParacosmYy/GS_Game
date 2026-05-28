/**
 * Visual Input Icon Renderer — KOF2002-style fighting game notation
 * Draws directional arrows and button circles for move list display
 */

const ARROW_SIZE = 5;
const BUTTON_RADIUS = 5;
const SYMBOL_GAP = 2;

type ArrowDir = '→' | '←' | '↑' | '↓' | '↘' | '↙' | '↗' | '↖' | '·';
type ButtonLabel = 'P' | 'K' | 'A' | 'B' | 'C' | 'D';

const ARROW_COLORS: Record<string, string> = {
  '→': '#88ccff',
  '←': '#88ccff',
  '↑': '#88ccff',
  '↓': '#88ccff',
  '↘': '#ffcc44',
  '↙': '#ffcc44',
  '↗': '#ffcc44',
  '↖': '#ffcc44',
  '·': '#666666',
};

const BUTTON_COLORS: Record<string, { fill: string; border: string }> = {
  A: { fill: '#44aaff', border: '#2277cc' },
  B: { fill: '#44dd44', border: '#228822' },
  C: { fill: '#ff6644', border: '#cc3322' },
  D: { fill: '#dd44dd', border: '#992299' },
  P: { fill: '#ffcc44', border: '#cc9922' },
  K: { fill: '#44ddaa', border: '#228866' },
};

/** Parse input notation string into typed tokens */
function parseInputTokens(input: string): (ArrowDir | ButtonLabel | '+' | '/' | '~' | string)[] {
  const tokens: (ArrowDir | ButtonLabel | '+' | '/' | '~' | string)[] = [];
  const arrowSet = new Set(['→', '←', '↑', '↓', '↘', '↙', '↗', '↖', '·']);
  const buttonSet = new Set(['A', 'B', 'C', 'D', 'P', 'K']);
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (arrowSet.has(ch)) {
      tokens.push(ch as ArrowDir);
    } else if (buttonSet.has(ch)) {
      tokens.push(ch as ButtonLabel);
    } else if (ch === '+' || ch === '/' || ch === '~') {
      tokens.push(ch);
    } else if (ch === '(' || ch === ')' || ch === ',') {
      tokens.push(ch);
    } else {
      // Accumulate multi-char text tokens
      let text = ch;
      while (i + 1 < input.length && !arrowSet.has(input[i + 1]) && !buttonSet.has(input[i + 1]) && input[i + 1] !== '+' && input[i + 1] !== '/') {
        text += input[++i];
      }
      tokens.push(text);
    }
    i++;
  }
  return tokens;
}

/** Draw a directional arrow shape at (cx, cy) center */
function drawArrow(ctx: CanvasRenderingContext2D, dir: ArrowDir, cx: number, cy: number, color: string): void {
  const s = ARROW_SIZE;
  ctx.fillStyle = color;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 0.8;

  switch (dir) {
    case '→':
      ctx.beginPath();
      ctx.moveTo(cx + s, cy);
      ctx.lineTo(cx - s * 0.4, cy - s * 0.7);
      ctx.lineTo(cx - s * 0.1, cy);
      ctx.lineTo(cx - s * 0.4, cy + s * 0.7);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      break;
    case '←':
      ctx.beginPath();
      ctx.moveTo(cx - s, cy);
      ctx.lineTo(cx + s * 0.4, cy - s * 0.7);
      ctx.lineTo(cx + s * 0.1, cy);
      ctx.lineTo(cx + s * 0.4, cy + s * 0.7);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      break;
    case '↑':
      ctx.beginPath();
      ctx.moveTo(cx, cy - s);
      ctx.lineTo(cx - s * 0.7, cy + s * 0.4);
      ctx.lineTo(cx, cy + s * 0.1);
      ctx.lineTo(cx + s * 0.7, cy + s * 0.4);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      break;
    case '↓':
      ctx.beginPath();
      ctx.moveTo(cx, cy + s);
      ctx.lineTo(cx - s * 0.7, cy - s * 0.4);
      ctx.lineTo(cx, cy - s * 0.1);
      ctx.lineTo(cx + s * 0.7, cy - s * 0.4);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      break;
    case '↘':
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.75, cy + s * 0.75);
      ctx.lineTo(cx - s * 0.3, cy + s * 0.1);
      ctx.lineTo(cx + s * 0.1, cy - s * 0.3);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      break;
    case '↙':
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.75, cy + s * 0.75);
      ctx.lineTo(cx + s * 0.1, cy + s * 0.1);
      ctx.lineTo(cx - s * 0.1, cy - s * 0.3);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      break;
    case '↗':
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.75, cy - s * 0.75);
      ctx.lineTo(cx - s * 0.1, cy - s * 0.1);
      ctx.lineTo(cx + s * 0.3, cy + s * 0.1);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      break;
    case '↖':
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.75, cy - s * 0.75);
      ctx.lineTo(cx + s * 0.3, cy - s * 0.1);
      ctx.lineTo(cx - s * 0.1, cy + s * 0.3);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      break;
    case '·':
      ctx.beginPath();
      ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
}

/** Draw a button circle with label at (cx, cy) center */
function drawButton(ctx: CanvasRenderingContext2D, label: ButtonLabel, cx: number, cy: number): void {
  const r = BUTTON_RADIUS;
  const colors = BUTTON_COLORS[label] ?? { fill: '#888888', border: '#555555' };

  // Filled circle
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = colors.fill;
  ctx.fill();
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Label text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${r * 1.4}px "Courier New", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy + 0.5);
}

/** Draw a separator symbol */
function drawSeparator(ctx: CanvasRenderingContext2D, sep: '+' | '/' | '~', cx: number, cy: number): void {
  ctx.fillStyle = sep === '+' ? '#888888' : sep === '/' ? '#666666' : '#aaaaaa';
  ctx.font = `bold 8px "Courier New", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(sep, cx, cy);
}

/**
 * Measure the width of a visual input notation string.
 * Used for right-alignment in the move list panel.
 */
export function measureVisualInput(input: string): number {
  const tokens = parseInputTokens(input);
  let width = 0;
  for (const tok of tokens) {
    if (typeof tok === 'string' && (tok === '+' || tok === '/' || tok === '~')) {
      width += 6 + SYMBOL_GAP;
    } else if (typeof tok === 'string' && tok.length > 1) {
      width += tok.length * 5 + SYMBOL_GAP;
    } else if (tok === '→' || tok === '←' || tok === '↑' || tok === '↓' ||
               tok === '↘' || tok === '↙' || tok === '↗' || tok === '↖' || tok === '·') {
      width += ARROW_SIZE * 2 + 2 + SYMBOL_GAP;
    } else {
      width += BUTTON_RADIUS * 2 + 2 + SYMBOL_GAP;
    }
  }
  return width;
}

/**
 * Draw visual input notation at a given position.
 * @param rightX — right edge x position (right-aligned)
 * @param y — vertical center of the notation
 */
export function drawVisualInput(
  ctx: CanvasRenderingContext2D,
  input: string,
  rightX: number,
  y: number,
  accentColor: string = '#ffcc44',
): void {
  const tokens = parseInputTokens(input);
  const totalWidth = measureVisualInput(input);

  let curX = rightX - totalWidth;
  ctx.save();

  for (const tok of tokens) {
    if (typeof tok === 'string' && (tok === '+' || tok === '/' || tok === '~')) {
      drawSeparator(ctx, tok as '+' | '/' | '~', curX + 3, y);
      curX += 6 + SYMBOL_GAP;
    } else if (typeof tok === 'string' && tok.length > 1) {
      // Multi-char text (e.g. "MAX", "HSDM")
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 8px "Courier New", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(tok, curX, y);
      curX += tok.length * 5 + SYMBOL_GAP;
    } else if (tok === '→' || tok === '←' || tok === '↑' || tok === '↓' ||
               tok === '↘' || tok === '↙' || tok === '↗' || tok === '↖' || tok === '·') {
      const color = ARROW_COLORS[tok] ?? '#888888';
      drawArrow(ctx, tok as ArrowDir, curX + ARROW_SIZE + 1, y, color);
      curX += ARROW_SIZE * 2 + 2 + SYMBOL_GAP;
    } else {
      drawButton(ctx, tok as ButtonLabel, curX + BUTTON_RADIUS + 1, y);
      curX += BUTTON_RADIUS * 2 + 2 + SYMBOL_GAP;
    }
  }

  ctx.restore();
}
