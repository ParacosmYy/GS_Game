/**
 * Character Intro Quotes — KOF2002-style pre-fight dialogue
 *
 * During INTRO phase (frames 41-90), each character briefly shows
 * a short line of text near their position. This adds personality
 * and is a signature KOF feature — Kyo's confident challenge,
 * Iori's menacing threat, Ryo's focused determination.
 *
 * Quotes are selected randomly from a pool, with optional
 * opponent-specific lines for rival matchups.
 */

// ─── Intro quote registry ───────────────────────────────────────

interface IntroQuotePool {
  /** Generic quotes shown against any opponent */
  generic: string[];
  /** Opponent-specific quotes: key = opponent charId */
  rival?: Record<string, string[]>;
}

const INTRO_QUOTES: Record<string, IntroQuotePool> = {
  ryo: {
    generic: [
      '来吧！',
      '全力以赴！',
      '准备好！',
      '让我看看你的本事！',
    ],
    rival: {
      kyo: ['火焰之力？让我见识一下！'],
      iori: ['大蛇之力...由我来斩断！'],
    },
  },
  kyo: {
    generic: [
      '嘿嘿，开始吧！',
      '我等很久了！',
      '别眨眼！',
      '让你见识草薙的火焰！',
    ],
    rival: {
      iori: ['八神...今天了断一切！'],
      ryo: ['极限流吗？有意思！'],
    },
  },
  iori: {
    generic: [
      '哼...无聊',
      '愚蠢...',
      '一瞬间就够了',
      '准备好消失了吗？',
    ],
    rival: {
      kyo: ['草薙...只有你能让我兴奋'],
      ryo: ['无聊的正义感...'],
    },
  },
};

// ─── Display state ───────────────────────────────────────────────

interface IntroQuoteState {
  active: boolean;
  p1Quote: string;
  p2Quote: string;
  timer: number;
  duration: number;
}

const state: IntroQuoteState = {
  active: false,
  p1Quote: '',
  p2Quote: '',
  timer: 0,
  duration: 70,
};

function pickQuote(pool: IntroQuotePool, opponentId: string): string {
  // Check rival-specific quotes first
  if (pool.rival?.[opponentId]?.length) {
    const rivalQuotes = pool.rival[opponentId];
    if (Math.random() < 0.6) {
      return rivalQuotes[Math.floor(Math.random() * rivalQuotes.length)];
    }
  }
  return pool.generic[Math.floor(Math.random() * pool.generic.length)];
}

// ─── Public API ──────────────────────────────────────────────────

export function triggerIntroQuotes(p1CharId: string, p2CharId: string): void {
  const p1Pool = INTRO_QUOTES[p1CharId];
  const p2Pool = INTRO_QUOTES[p2CharId];

  state.p1Quote = p1Pool ? pickQuote(p1Pool, p2CharId) : '';
  state.p2Quote = p2Pool ? pickQuote(p2Pool, p1CharId) : '';
  state.active = !!(state.p1Quote || state.p2Quote);
  state.timer = 0;
}

export function tickIntroQuotes(): void {
  if (!state.active) return;
  state.timer++;
  if (state.timer >= state.duration) {
    state.active = false;
  }
}

export function resetIntroQuotes(): void {
  state.active = false;
  state.timer = 0;
}

// ─── Rendering ───────────────────────────────────────────────────

const CHAR_COLORS: Record<string, string> = {
  ryo: '#ff6644',
  kyo: '#ff4400',
  iori: '#aa44ff',
};

export function drawIntroQuotes(
  ctx: CanvasRenderingContext2D,
  p1CharId: string, p1X: number, p1Y: number,
  p2CharId: string, p2X: number, p2Y: number,
  cameraX: number,
): void {
  if (!state.active) return;

  const progress = state.timer / state.duration;
  // Alpha: fade in 0-10%, hold 10-70%, fade out 70-100%
  let alpha: number;
  if (progress < 0.1) alpha = progress / 0.1;
  else if (progress < 0.7) alpha = 1.0;
  else alpha = (1 - progress) / 0.3;

  ctx.save();

  // P1 quote — left side, character color
  if (state.p1Quote) {
    const sx = p1X - cameraX;
    const sy = p1Y - 95;
    const color = CHAR_COLORS[p1CharId] ?? '#ffffff';
    drawQuoteBubble(ctx, state.p1Quote, sx, sy, alpha, color, 1);
  }

  // P2 quote — right side, character color
  if (state.p2Quote) {
    const sx = p2X - cameraX;
    const sy = p2Y - 95;
    const color = CHAR_COLORS[p2CharId] ?? '#ffffff';
    drawQuoteBubble(ctx, state.p2Quote, sx, sy, alpha, color, -1);
  }

  ctx.restore();
}

function drawQuoteBubble(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  alpha: number,
  color: string,
  facing: number,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Measure text for background
  const metrics = ctx.measureText(text);
  const textW = metrics.width;
  const padX = 8;
  const padY = 4;
  const bubbleW = textW + padX * 2;
  const bubbleH = 16 + padY * 2;

  // Bubble background — dark semi-transparent
  const bx = x - bubbleW / 2;
  const by = y - bubbleH / 2;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.beginPath();
  ctx.roundRect(bx, by, bubbleW, bubbleH, 4);
  ctx.fill();

  // Bubble border — character color
  ctx.strokeStyle = color + 'aa';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(bx, by, bubbleW, bubbleH, 4);
  ctx.stroke();

  // Tail pointing toward character
  const tailX = x + facing * (bubbleW / 2 - 4);
  const tailY = by + bubbleH;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.beginPath();
  ctx.moveTo(tailX - 4, tailY);
  ctx.lineTo(tailX + facing * 6, tailY + 6);
  ctx.lineTo(tailX + 4, tailY);
  ctx.closePath();
  ctx.fill();

  // Text — white with color shadow
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, x, y);
  ctx.shadowBlur = 0;

  ctx.restore();
}
