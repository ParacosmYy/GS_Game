/**
 * VS Splash screen
 * Split from screens.ts
 */
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
} from '../../core/constants.js';
import { roundRect, drawSNKText } from '../utils.js';
import { drawPixelPortrait } from '../pixelPortraits.js';
import type { PixelPortraitData } from '../pixelPortraits.js';
import { getPortraitForSize, getRealPortraitEntryForSize } from '../manifestRenderData.js';
import { drawRealPortraitInBox } from '../realPortraits.js';
import { RANDOM_SLOT_INDEX, COLOR_PALETTES, VS_SPLASH_DURATION } from '../../state/selectState.js';
import type { SelectState } from '../../state/selectState.js';
import type { CharacterDefinition } from '../../characters/types.js';
import type { StageId } from '../stage.js';
import { getRivalDialogue, getRivalThemeColors } from '../../core/rivalData.js';

// Stage name mapping
const STAGE_NAMES: Record<StageId, string> = {
  temple: '日本寺庙 · Japan',
  china: '唐人街 · China',
  factory: '工場 · Factory',
  orochi: '大蛇神社 · Orochi',
  street: '街市夜市 · Street',
  rooftop: '日本屋上 · Rooftop',
};

function getBestPortrait(
  char: CharacterDefinition | null,
  size: 'select' | 'vs' | 'hud' | 'win',
): PixelPortraitData | undefined {
  if (!char) return undefined;
  const sized = getPortraitForSize(char.id, size);
  return sized ?? char.pixelPortrait;
}

// ===== VS Splash =====

export function drawVSSplash(
  ctx: CanvasRenderingContext2D,
  selectState: SelectState,
  tick: number,
  currentStage: StageId,
): void {
  const timer = selectState.vsSplashTimer;
  if (timer < 0) return;
  const progress = timer / VS_SPLASH_DURATION;

  ctx.save();

  // 全屏黑色背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // KOF2002 diagonal slash wipe effect
  if (timer > 0 && timer < 20) {
    const slashProgress = timer / 20;
    const slashX = CANVAS_WIDTH * slashProgress;
    const slashY = CANVAS_HEIGHT * slashProgress;
    ctx.save();
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(slashX, 0);
    ctx.lineTo(0, slashY);
    ctx.stroke();
    // Trail glow
    ctx.globalAlpha = Math.max(0, 1 - slashProgress * 1.5);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(slashX + 5, 0);
    ctx.lineTo(0, slashY + 5);
    ctx.stroke();
    ctx.restore();
  }

  // 淡入动画
  const fadeIn = Math.min(1, timer / 15);
  ctx.globalAlpha = fadeIn;

  const p1Char = selectState.p1ConfirmedChar;
  const p2Char = selectState.p2ConfirmedChar;

  // P1头像 (左侧)
  const p1VSPortrait = p1Char ? getBestPortrait(p1Char, 'vs') : undefined;
  const p1RealVSPortrait = p1Char ? getRealPortraitEntryForSize(p1Char.id, 'vs') : undefined;
  if (p1VSPortrait || p1RealVSPortrait) {
    const sourceWidth = p1RealVSPortrait?.assetWidth ?? p1VSPortrait?.width ?? 120;
    const sourceHeight = p1RealVSPortrait?.assetHeight ?? p1VSPortrait?.height ?? 140;
    const scale = sourceWidth > 100 ? 1.5 : 3;
    const pw = sourceWidth * scale;
    const ph = sourceHeight * scale;
    const px = CANVAS_WIDTH * 0.25 - pw / 2;
    const py = 100;
    drawVSPortrait(ctx, px, py, pw, ph, p1VSPortrait, p1RealVSPortrait, scale, (p1Char?.color ?? '#888'), tick, 0);
  }

  // P2头像 (右侧)
  const p2VSPortrait = p2Char ? getBestPortrait(p2Char, 'vs') : undefined;
  const p2RealVSPortrait = p2Char ? getRealPortraitEntryForSize(p2Char.id, 'vs') : undefined;
  if (p2VSPortrait || p2RealVSPortrait) {
    const sourceWidth = p2RealVSPortrait?.assetWidth ?? p2VSPortrait?.width ?? 120;
    const sourceHeight = p2RealVSPortrait?.assetHeight ?? p2VSPortrait?.height ?? 140;
    const scale = sourceWidth > 100 ? 1.5 : 3;
    const pw = sourceWidth * scale;
    const ph = sourceHeight * scale;
    const px = CANVAS_WIDTH * 0.75 - pw / 2;
    const py = 100;
    drawVSPortrait(ctx, px, py, pw, ph, p2VSPortrait, p2RealVSPortrait, scale, (p2Char?.color ?? '#888'), tick, 1);
  }

  // P1角色名 (左侧)
  if (p1Char) {
    const nameSlide = Math.min(1, timer / 20);
    const nameX = CANVAS_WIDTH * 0.25;
    ctx.save();
    ctx.shadowColor = '#22ccaa';
    ctx.shadowBlur = 15;
    drawSNKText(ctx, p1Char.nameCn, nameX, 300, 30, '#22ccaa');
    ctx.shadowBlur = 0;
    ctx.restore();
    // P1颜色标记
    drawVSPaletteDots(ctx, nameX, 330, selectState.p1ColorIndex, tick, 0);
  }

  // P2角色名 (右侧)
  if (p2Char) {
    const nameX = CANVAS_WIDTH * 0.75;
    ctx.save();
    ctx.shadowColor = '#ff6644';
    ctx.shadowBlur = 15;
    drawSNKText(ctx, p2Char.nameCn, nameX, 300, 30, '#ff6644');
    ctx.shadowBlur = 0;
    ctx.restore();
    drawVSPaletteDots(ctx, nameX, 330, selectState.p2ColorIndex, tick, 1);
  }

  // 中央"VS" — 爆发式动画
  const vsProgress = Math.min(1, timer / 12);
  const vsScale = 1 + (1 - vsProgress) * 2.5;
  const vsAlpha = vsProgress;
  ctx.globalAlpha = vsAlpha * fadeIn;

  // 冲击波环
  for (let r = 0; r < 3; r++) {
    const ringDelay = r * 0.08;
    const ringProgress = Math.min(1, Math.max(0, progress * 2 - ringDelay));
    if (ringProgress <= 0) continue;
    const ringRadius = 30 + ringProgress * (100 - r * 20);
    const ringAlpha = Math.max(0, 1 - ringProgress) * (1 - r * 0.3);
    if (ringAlpha > 0) {
      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 204, 0, ${ringAlpha * 0.6})`;
      ctx.lineWidth = (3 - r) * (1 - ringProgress) + 1;
      ctx.stroke();
    }
  }

  // VS文字
  ctx.save();
  ctx.shadowColor = '#ffcc00';
  ctx.shadowBlur = 30 + (1 - vsProgress) * 20;
  drawSNKText(ctx, 'VS', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, Math.round(64 * vsScale), '#ffcc00');
  ctx.shadowBlur = 0;
  ctx.restore();

  // 分隔线
  const lineAlpha = Math.min(1, (timer - 10) / 20);
  if (lineAlpha > 0) {
    ctx.globalAlpha = lineAlpha * fadeIn;
    ctx.strokeStyle = 'rgba(255, 204, 0, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 60);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 60);
    ctx.stroke();
  }

  // KOF2002: Rival dialogue — special matchup intro lines
  if (p1Char && p2Char) {
    const rival = getRivalDialogue(p1Char.id, p2Char.id);
    if (rival) {
      const colors = getRivalThemeColors(rival.theme);
      // Determine which character is P1's line vs P2's
      const p1IsA = rival.pair[0] === p1Char.id;
      const p1Line = p1IsA ? rival.lineA : rival.lineB;
      const p2Line = p1IsA ? rival.lineB : rival.lineA;
      const p1Color = p1IsA ? colors.textA : colors.textB;
      const p2Color = p1IsA ? colors.textB : colors.textA;

      const rivalAlpha = Math.min(1, Math.max(0, (timer - 25) / 15));
      ctx.globalAlpha = rivalAlpha * fadeIn;

      // Rival flash at dialogue reveal
      if (timer >= 25 && timer < 29) {
        ctx.save();
        ctx.globalAlpha = (29 - timer) / 4 * 0.2 * fadeIn;
        ctx.fillStyle = colors.flash;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.restore();
        ctx.globalAlpha = rivalAlpha * fadeIn;
      }

      // Dialogue background
      const dlgY = CANVAS_HEIGHT - 130;
      const dlgH = 90;
      ctx.fillStyle = colors.bg;
      roundRect(ctx, 30, dlgY, CANVAS_WIDTH - 60, dlgH, 8);
      ctx.fill();
      // Themed border
      const borderPulse = 0.5 + Math.sin(tick * 0.08) * 0.3;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 2;
      ctx.globalAlpha = rivalAlpha * fadeIn * borderPulse;
      roundRect(ctx, 30, dlgY, CANVAS_WIDTH - 60, dlgH, 8);
      ctx.stroke();
      ctx.globalAlpha = rivalAlpha * fadeIn;

      // "RIVAL BATTLE" indicator
      ctx.save();
      ctx.shadowColor = colors.border;
      ctx.shadowBlur = 8;
      drawSNKText(ctx, 'RIVAL BATTLE', CANVAS_WIDTH / 2, dlgY + 14, 10, colors.border);
      ctx.shadowBlur = 0;
      ctx.restore();

      // P1 dialogue line
      const p1CharsVisible = Math.min(p1Line.length, Math.floor(Math.max(0, timer - 30) / 1.8));
      if (p1CharsVisible > 0) {
        drawSNKText(ctx, p1Line.substring(0, p1CharsVisible), CANVAS_WIDTH * 0.25, dlgY + 38, 14, p1Color, '#000000', 'center');
      }

      // P2 dialogue line
      const p2CharsVisible = Math.min(p2Line.length, Math.floor(Math.max(0, timer - 45) / 1.8));
      if (p2CharsVisible > 0) {
        drawSNKText(ctx, p2Line.substring(0, p2CharsVisible), CANVAS_WIDTH * 0.75, dlgY + 62, 14, p2Color, '#000000', 'center');
      }
    }
  }

  // Stage name (bottom center)
  const stageAlpha = Math.min(1, Math.max(0, (timer - 15) / 15));
  if (stageAlpha > 0) {
    ctx.globalAlpha = stageAlpha * fadeIn;
    const stageName = STAGE_NAMES[currentStage] || currentStage;
    ctx.save();
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 6;
    drawSNKText(ctx, stageName, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 28, 12, '#ccaa44');
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

// VS闪屏中的头像绘制
function drawVSPortrait(
  ctx: CanvasRenderingContext2D,
  px: number, py: number,
  pw: number, ph: number,
  portrait: PixelPortraitData | undefined,
  realPortrait: ReturnType<typeof getRealPortraitEntryForSize>,
  scale: number,
  color: string,
  tick: number,
  playerIndex: number,
): void {
  // 背景框
  ctx.fillStyle = 'rgba(20, 20, 40, 0.85)';
  roundRect(ctx, px - 12, py - 12, pw + 24, ph + 24, 8);
  ctx.fill();
  // 角色色边框
  const pulse = 0.6 + Math.sin(tick * 0.1 + playerIndex * 3) * 0.4;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = pulse;
  roundRect(ctx, px - 12, py - 12, pw + 24, ph + 24, 8);
  ctx.stroke();
  ctx.globalAlpha = 1;
  const drewReal = drawRealPortraitInBox(ctx, realPortrait, px, py, pw, ph, {
    frameColor: color,
    backdropColor: 'rgba(20, 20, 40, 0.85)',
    scanlines: true,
    fit: 'contain',
  });
  if (!drewReal && portrait) {
    drawPixelPortrait(ctx, portrait, px, py, scale, {
      frameColor: color,
      backdropColor: 'rgba(20, 20, 40, 0.85)',
      scanlines: true,
    });
  }
    // Shimmer sweep — diagonal light line across portrait
    const shimmerPhase = ((tick * 0.02 + playerIndex * 0.5) % 1.0);
    const shimmerX = px - 20 + shimmerPhase * (pw + 40);
    const shimmerGrad = ctx.createLinearGradient(shimmerX - 15, py, shimmerX + 15, py + ph);
    shimmerGrad.addColorStop(0, 'rgba(255,255,255,0)');
    shimmerGrad.addColorStop(0.4, 'rgba(255,255,255,0.08)');
    shimmerGrad.addColorStop(0.5, 'rgba(255,255,255,0.15)');
    shimmerGrad.addColorStop(0.6, 'rgba(255,255,255,0.08)');
    shimmerGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.save();
    ctx.beginPath();
    roundRect(ctx, px, py, pw, ph, 4);
    ctx.clip();
    ctx.fillStyle = shimmerGrad;
    ctx.fillRect(px, py, pw, ph);
    ctx.restore();
}

// VS闪屏中的调色板圆点
function drawVSPaletteDots(
  ctx: CanvasRenderingContext2D,
  cx: number, y: number,
  activeIndex: number,
  tick: number,
  playerIndex: number,
): void {
  const dotR = 5;
  const gap = 16;
  const startX = cx - (COLOR_PALETTES.length - 1) * gap / 2;
  for (let i = 0; i < COLOR_PALETTES.length; i++) {
    const x = startX + i * gap;
    ctx.beginPath();
    ctx.arc(x, y, dotR, 0, Math.PI * 2);
    ctx.fillStyle = COLOR_PALETTES[i].color;
    ctx.fill();
    if (i === activeIndex) {
      // 选中的颜色 — 高亮环
      const ringPulse = 0.7 + Math.sin(tick * 0.15 + playerIndex) * 0.3;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, dotR + 3, 0, Math.PI * 2);
      ctx.globalAlpha = ringPulse;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
}
