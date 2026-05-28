/**
 * Win Quote overlay and Announce Sequence
 * Split from screens.ts
 */
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
} from '../../core/constants.js';
import { roundRect, drawSNKText } from '../utils.js';
import { drawPixelPortrait } from '../pixelPortraits.js';
import type { PixelPortraitData } from '../pixelPortraits.js';
import type { AnnounceSequence } from '../../state/announceSequence.js';
import type { StageId } from '../stage.js';

// ===== Win Quote Overlay =====

export const WIN_QUOTE_DURATION = 180;

export function drawWinQuote(
  ctx: CanvasRenderingContext2D,
  timer: number,
  charName: string,
  winQuote: string,
  charColor: string,
  pixelPortrait: PixelPortraitData | undefined,
  stageId: StageId = 'temple',
): void {
  ctx.save();

  const fadeIn = Math.min(1, timer / 30);
  const fadeOut = timer > WIN_QUOTE_DURATION - 30 ? (WIN_QUOTE_DURATION - timer) / 30 : 1;
  const alpha = Math.min(fadeIn, fadeOut);

  // Stage-tinted overlay — each stage contributes its accent color subtly
  const theme = STAGE_THEMES[stageId] ?? STAGE_THEMES.temple;
  ctx.fillStyle = `rgba(0, 0, 0, ${0.65 * alpha})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  // Colored vignette layer using stage accent
  ctx.fillStyle = theme.accent + Math.round(0.12 * alpha * 255).toString(16).padStart(2, '0');
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = alpha;

  // 角色头像
  const portraitScale = 3;
  if (pixelPortrait) {
    const pw = pixelPortrait.width * portraitScale;
    const ph = pixelPortrait.height * portraitScale;
    const px = CANVAS_WIDTH / 2 - pw / 2;
    const py = 80;
    ctx.fillStyle = 'rgba(20, 20, 40, 0.85)';
    roundRect(ctx, px - 10, py - 10, pw + 20, ph + 20, 8);
    ctx.fill();
    ctx.strokeStyle = charColor;
    ctx.lineWidth = 2;
    roundRect(ctx, px - 10, py - 10, pw + 20, ph + 20, 8);
    ctx.stroke();
    drawPixelPortrait(ctx, pixelPortrait, px, py, portraitScale, {
      frameColor: charColor,
      backdropColor: 'rgba(12, 12, 24, 0.9)',
      scanlines: true,
    });
  }

  // 角色名
  const nameY = pixelPortrait ? 260 : CANVAS_HEIGHT / 2 - 60;
  ctx.shadowColor = '#ffcc00';
  ctx.shadowBlur = 20 * alpha;
  drawSNKText(ctx, charName, CANVAS_WIDTH / 2, nameY, 40, '#ffcc00');
  ctx.shadowBlur = 0;

  // 装饰分隔线
  const lineY = nameY + 30;
  const lineGrad = ctx.createLinearGradient(CANVAS_WIDTH / 2 - 120, 0, CANVAS_WIDTH / 2 + 120, 0);
  lineGrad.addColorStop(0, '#ffcc0000');
  lineGrad.addColorStop(0.3, `${charColor}88`);
  lineGrad.addColorStop(0.5, '#ffcc4466');
  lineGrad.addColorStop(0.7, `${charColor}88`);
  lineGrad.addColorStop(1, '#ffcc0000');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2 - 120, lineY);
  ctx.lineTo(CANVAS_WIDTH / 2 + 120, lineY);
  ctx.stroke();

  // 胜利台词 — 打字机效果
  const quoteY = lineY + 40;
  const charsVisible = Math.min(winQuote.length, Math.floor(Math.max(0, timer - 15) / 2.5));
  const visibleQuote = winQuote.substring(0, charsVisible);
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 6 * alpha;
  drawSNKText(ctx, `"${visibleQuote}"`, CANVAS_WIDTH / 2, quoteY, 22, '#ffffff');
  ctx.shadowBlur = 0;

  if (charsVisible > 0) {
    const quoteWidth = ctx.measureText(`"${visibleQuote}"`).width;
    const decorAlpha = 0.3 * alpha;
    ctx.fillStyle = `rgba(255, 204, 0, ${decorAlpha})`;
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2 - quoteWidth / 2 - 15, quoteY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2 + quoteWidth / 2 + 15, quoteY, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

// ===== Announce Sequence Overlay =====

export function drawAnnounceSequence(
  ctx: CanvasRenderingContext2D,
  seq: AnnounceSequence,
  canvasWidth: number,
  canvasHeight: number,
): void {
  const render = seq.getCurrentRender();
  if (!render) return;
  const { step, progress } = render;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 冲击波环
  if (step.shockwaveRings > 0 && progress < 0.5) {
    for (let r = 0; r < step.shockwaveRings; r++) {
      const ringProgress = Math.min(1, Math.max(0, progress * 2 - r * 0.08));
      if (ringProgress <= 0) continue;
      const ringRadius = 20 + ringProgress * (150 - r * 20);
      const ringAlpha = Math.max(0, 1 - ringProgress) * (1 - r * 0.2);
      if (ringAlpha > 0) {
        ctx.beginPath();
        ctx.arc(canvasWidth / 2, canvasHeight / 2, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, ${100 + r * 40}, 0, ${ringAlpha * 0.5})`;
        ctx.lineWidth = (3 - Math.min(r, 2)) * (1 - ringProgress) + 1;
        ctx.stroke();
      }
    }
  }

  // 全屏闪光
  if (step.flash && progress < step.flash.frames / step.duration) {
    const flashAlpha = step.flash.alpha * (1 - progress * step.duration / step.flash.frames);
    ctx.fillStyle = step.flash.color;
    ctx.globalAlpha = Math.max(0, flashAlpha);
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.globalAlpha = 1;
  }

  // 文字
  const alpha = step.alphaCurve(progress);
  const scale = step.scaleCurve(progress);
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

  const text = seq.getText();
  if (text && step.fontSize > 0) {
    const fontSize = Math.round(step.fontSize * scale);
    // 双层文字：先画描边再画填充
    ctx.font = `bold ${fontSize}px "Courier New", monospace`;
    ctx.shadowColor = step.glowColor;
    ctx.shadowBlur = 25 + (scale > 1 ? (scale - 1) * 20 : 0);
    // 描边层
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.lineWidth = 3;
    ctx.strokeText(text, canvasWidth / 2, canvasHeight / 2);
    // 填充层
    ctx.fillStyle = step.fillColor;
    ctx.fillText(text, canvasWidth / 2, canvasHeight / 2);
    ctx.shadowBlur = 0;
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

// ===== Stage Select Screen =====

const STAGE_PREVIEW_W = 120;
const STAGE_PREVIEW_H = 80;
const STAGE_PREVIEW_GAP = 16;
const ALL_STAGES: StageId[] = ['temple', 'china', 'factory', 'orochi', 'street', 'rooftop'];

const STAGE_THEMES: Record<string, { bg1: string; bg2: string; accent: string; pattern: string }> = {
  temple: { bg1: '#2a1a0a', bg2: '#1a0e05', accent: '#cc6633', pattern: '#cc6633' },
  china: { bg1: '#3a1515', bg2: '#1a0808', accent: '#ff4444', pattern: '#ffcc00' },
  factory: { bg1: '#1a2a1a', bg2: '#0a150a', accent: '#66aa66', pattern: '#88cc88' },
  orochi: { bg1: '#1a1a2a', bg2: '#0a0a15', accent: '#8866cc', pattern: '#aa88ff' },
  street: { bg1: '#2a2a1a', bg2: '#15150a', accent: '#ccaa33', pattern: '#ffdd66' },
  rooftop: { bg1: '#1a1530', bg2: '#0a0a1e', accent: '#8877bb', pattern: '#bbaadd' },
};

