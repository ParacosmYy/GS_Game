/**
 * Screens — Character Select, VS Splash, Intro, KO, Win Quote
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/constants.js';
import { ROSTER } from '../characters/index.js';
import { roundRect, drawSNKText } from './utils.js';
import { drawPixelPortrait } from './pixelPortraits.js';
import type { PixelPortraitData } from './pixelPortraits.js';
import {
  RANDOM_SLOT_INDEX, TOTAL_SELECT_SLOTS, COLOR_PALETTES,
  VS_SPLASH_DURATION,
} from '../state/selectState.js';
import type { SelectState } from '../state/selectState.js';
import type { StageId } from './stage.js';
import type { AnnounceSequence } from '../state/announceSequence.js';

// ===== 舞台名称映射 =====
const STAGE_NAMES: Record<StageId, string> = {
  temple: '日本寺庙 · Japan',
  china: '唐人街 · China',
  factory: '工場 · Factory',
  orochi: '大蛇神社 · Orochi',
  street: '街市夜市 · Street',
};

// ===== Character Select =====

// 格子布局参数
const CARD_W = 68;
const CARD_H = 80;
const CARD_GAP = 6;
const GRID_COLS = 8;

export function drawCharacterSelect(
  ctx: CanvasRenderingContext2D,
  selectState: SelectState,
  tick: number,
  simplifiedMode: boolean,
  currentStage: StageId,
): void {
  const p1Cursor = selectState.p1Cursor;
  const p2Cursor = selectState.p2Cursor;
  const p1Ready = selectState.p1Ready;
  const p2Ready = selectState.p2Ready;
  const p2IsAI = selectState.p2IsAI;
  const p1ColorIndex = selectState.p1ColorIndex;
  const p2ColorIndex = selectState.p2ColorIndex;

  ctx.save();

  // 背景 — 深色渐变 + 动态条纹
  const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  bgGrad.addColorStop(0, '#080818');
  bgGrad.addColorStop(0.5, '#0c0c24');
  bgGrad.addColorStop(1, '#060614');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 动态对角条纹
  ctx.strokeStyle = 'rgba(255,255,255,0.02)';
  ctx.lineWidth = 1;
  for (let i = -20; i < 40; i++) {
    const xOff = (tick * 0.3) % 60;
    ctx.beginPath();
    ctx.moveTo(i * 60 + xOff, 0);
    ctx.lineTo(i * 60 + xOff - CANVAS_HEIGHT, CANVAS_HEIGHT);
    ctx.stroke();
  }

  // 标题栏
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 85);
  const titleGrad = ctx.createLinearGradient(0, 83, CANVAS_WIDTH, 83);
  titleGrad.addColorStop(0, '#cc880000');
  titleGrad.addColorStop(0.3, '#cc880088');
  titleGrad.addColorStop(0.5, '#ffcc4466');
  titleGrad.addColorStop(0.7, '#cc880088');
  titleGrad.addColorStop(1, '#cc880000');
  ctx.strokeStyle = titleGrad;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 85); ctx.lineTo(CANVAS_WIDTH, 85); ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  drawSNKText(ctx, 'SELECT YOUR FIGHTER', CANVAS_WIDTH / 2, 28, 32, '#ffcc00');

  // 操作提示 — 按钮对应颜色
  const hintText = p1Ready
    ? 'P1: WAITING...'
    : 'A/D:move  A/B/C/D:select color';
  drawSNKText(ctx, hintText, CANVAS_WIDTH / 2, 62, 10, '#888888');

  // 角色卡网格 — 包含随机选择格
  const rows = Math.ceil(TOTAL_SELECT_SLOTS / GRID_COLS);
  const gridH = rows * CARD_H + (rows - 1) * CARD_GAP;
  const startY = 90;

  for (let i = 0; i < TOTAL_SELECT_SLOTS; i++) {
    const isRandomSlot = i >= ROSTER.length;
    const char = isRandomSlot ? null : ROSTER[i];
    const row = Math.floor(i / GRID_COLS);
    const col = i % GRID_COLS;
    const colsInRow = Math.min(GRID_COLS, TOTAL_SELECT_SLOTS - row * GRID_COLS);
    const rowW = colsInRow * CARD_W + (colsInRow - 1) * CARD_GAP;
    const rowStartX = (CANVAS_WIDTH - rowW) / 2;
    const cx = rowStartX + col * (CARD_W + CARD_GAP);
    const cy = startY + row * (CARD_H + CARD_GAP);
    const isP1Here = p1Cursor === i;
    const isP2Here = p2Cursor === i;
    const p1ConfirmedHere = p1Ready && isP1Here;
    const p2ConfirmedHere = p2Ready && isP2Here;

    // 卡片背景
    const cardGrad = ctx.createLinearGradient(cx, cy, cx, cy + CARD_H);
    if (isRandomSlot) {
      cardGrad.addColorStop(0, '#1a1a2e');
      cardGrad.addColorStop(1, '#141428');
    } else {
      cardGrad.addColorStop(0, '#14142a');
      cardGrad.addColorStop(1, '#0e0e1e');
    }
    ctx.fillStyle = cardGrad;
    roundRect(ctx, cx, cy, CARD_W, CARD_H, 10);
    ctx.fill();

    // 卡片边框
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    roundRect(ctx, cx, cy, CARD_W, CARD_H, 10);
    ctx.stroke();

    if (isRandomSlot) {
      // 随机选择格 — "?" 图标 + 特殊视觉
      const pulse = 0.7 + Math.sin(tick * 0.08) * 0.3;
      ctx.fillStyle = `rgba(255, 204, 0, ${0.15 * pulse})`;
      roundRect(ctx, cx + 4, cy + 4, CARD_W - 8, CARD_H - 8, 6);
      ctx.fill();
      // 闪烁问号
      ctx.font = 'bold 36px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = `rgba(255, 204, 0, ${0.6 + pulse * 0.4})`;
      ctx.fillText('?', cx + CARD_W / 2, cy + CARD_H / 2 - 6);
      drawSNKText(ctx, 'RANDOM', cx + CARD_W / 2, cy + CARD_H - 12, 9, '#ffcc00');
    } else if (char) {
      // 角色顶部色条
      ctx.fillStyle = char.color + '44';
      ctx.fillRect(cx + 6, cy + 6, CARD_W - 12, 2);

      // 头像区域
      const portraitY = cy + 12;
      ctx.fillStyle = '#0a0a18';
      roundRect(ctx, cx + 8, portraitY, CARD_W - 16, 48, 4);
      ctx.fill();

      if (char.pixelPortrait) {
        const portraitScale = 1.2;
        const pw = char.pixelPortrait.width * portraitScale;
        const ph = char.pixelPortrait.height * portraitScale;
        const px = cx + 8 + ((CARD_W - 16) - pw) / 2;
        const py = portraitY + (48 - ph) / 2;
        drawPixelPortrait(ctx, char.pixelPortrait, px, py, portraitScale, {
          frameColor: char.color,
          backdropColor: 'rgba(8, 8, 18, 0.85)',
          scanlines: true,
        });
      } else {
        const charGrad = ctx.createLinearGradient(cx + 10, portraitY + 3, cx + CARD_W - 10, portraitY + 45);
        charGrad.addColorStop(0, char.color);
        charGrad.addColorStop(1, char.accentColor);
        ctx.fillStyle = charGrad;
        roundRect(ctx, cx + 10, portraitY + 3, CARD_W - 20, 42, 3);
        ctx.fill();
        ctx.font = '22px serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.fillText(char.portrait, cx + CARD_W / 2, portraitY + 30);
      }

      // 角色名
      drawSNKText(ctx, char.nameCn, cx + CARD_W / 2, cy + 68, 12, '#eeeeee');
    }

    // 已确认角色 — 金色边框 + 发光
    if (p1ConfirmedHere || p2ConfirmedHere) {
      const glowPulse = 0.6 + Math.sin(tick * 0.12) * 0.4;
      ctx.save();
      ctx.shadowColor = '#ffcc00';
      ctx.shadowBlur = 12 * glowPulse;
      ctx.strokeStyle = `rgba(255, 204, 0, ${0.7 + glowPulse * 0.3})`;
      ctx.lineWidth = 3;
      roundRect(ctx, cx - 3, cy - 3, CARD_W + 6, CARD_H + 6, 12);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();

      // 确认标签 + 颜色指示器
      if (p1ConfirmedHere) {
        drawConfirmedLabel(ctx, cx, cy, 'P1', '#22ccaa', p1ColorIndex, tick);
      }
      if (p2ConfirmedHere) {
        drawConfirmedLabel(ctx, cx, cy + CARD_H - 4, 'P2', '#ff6644', p2ColorIndex, tick);
      }
    }

    // P1光标 — 青蓝色脉动
    if (isP1Here && !p1ConfirmedHere) {
      drawCursorBracket(ctx, cx, cy, CARD_W, CARD_H, tick, 0, '#22ccaa', '#22ccaa');
      drawSNKText(ctx, 'P1', cx + CARD_W / 2, cy - 8, 9, '#22ccaa');
    }

    // P2光标 — 红橙色脉动
    if (isP2Here && !p2ConfirmedHere) {
      drawCursorBracket(ctx, cx, cy, CARD_W, CARD_H, tick, 1, '#ff6644', '#ff6644');
      drawSNKText(ctx, 'P2', cx + CARD_W / 2, cy + CARD_H + 12, 9, '#ff6644');
    }
  }

  // ===== 悬停角色名大字显示 + 放大肖像预览 (网格下方) =====
  const hoveredChar = selectState.getCharAtCursor(p1Ready ? p2Cursor : p1Cursor);
  const hoverY = startY + gridH + 8;
  if (hoveredChar) {
    // 放大肖像预览 — 网格左侧
    if (hoveredChar.pixelPortrait) {
      const previewScale = 4;
      const pw = hoveredChar.pixelPortrait.width * previewScale;
      const ph = hoveredChar.pixelPortrait.height * previewScale;
      const ppx = CANVAS_WIDTH / 2 - pw / 2 - 100;
      const ppy = hoverY - ph / 2 - 5;
      // 肖像背景
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      roundRect(ctx, ppx - 4, ppy - 4, pw + 8, ph + 8, 4);
      ctx.fill();
      ctx.strokeStyle = hoveredChar.color + '88';
      ctx.lineWidth = 1;
      roundRect(ctx, ppx - 4, ppy - 4, pw + 8, ph + 8, 4);
      ctx.stroke();
      drawPixelPortrait(ctx, hoveredChar.pixelPortrait, ppx, ppy, previewScale, {
        frameColor: hoveredChar.color,
        backdropColor: 'rgba(8, 8, 18, 0.9)',
        scanlines: true,
      });
    }
    // 角色名大字 — 网格中央偏右
    ctx.save();
    ctx.shadowColor = hoveredChar.color;
    ctx.shadowBlur = 12;
    drawSNKText(ctx, hoveredChar.nameCn, CANVAS_WIDTH / 2 + 60, hoverY - 5, 32, hoveredChar.color);
    ctx.shadowBlur = 0;
    ctx.restore();
    // 角色英文名
    if (hoveredChar.name) {
      ctx.fillStyle = '#888';
      ctx.font = '10px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(hoveredChar.name, CANVAS_WIDTH / 2 + 60, hoverY + 12);
    }
  } else if (p1Ready ? selectState.isRandomSlot(p2Cursor) : selectState.isRandomSlot(p1Cursor)) {
    drawSNKText(ctx, '???', CANVAS_WIDTH / 2, hoverY, 28, '#ffcc00');
  }

  // ===== 底部面板 — P1/P2信息 =====
  const panelY = 340;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, panelY - 10, CANVAS_WIDTH, 120);
  // 分隔线
  const divGrad = ctx.createLinearGradient(0, panelY - 10, CANVAS_WIDTH, panelY - 10);
  divGrad.addColorStop(0, '#cc880000');
  divGrad.addColorStop(0.5, '#cc880088');
  divGrad.addColorStop(1, '#cc880000');
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, panelY - 10); ctx.lineTo(CANVAS_WIDTH, panelY - 10); ctx.stroke();

  // P1信息
  drawPlayerInfo(ctx, p1Cursor, p1Ready, p1ColorIndex, 'P1', '#22ccaa', true, selectState, tick, panelY);
  // P2信息
  drawPlayerInfo(ctx, p2Cursor, p2Ready, p2ColorIndex, 'P2', '#ff6644', false, selectState, tick, panelY);

  // 中央VS
  drawSNKText(ctx, 'VS', CANVAS_WIDTH / 2, panelY + 25, 44, 'rgba(255,255,255,0.08)');

  // AI切换
  ctx.fillStyle = p2IsAI ? '#44ff88' : '#ff6644';
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(p2IsAI ? 'AI ON' : 'P2 Human', CANVAS_WIDTH / 2, panelY + 55);
  ctx.font = '10px "Courier New", monospace';
  ctx.fillStyle = '#666';
  ctx.fillText('T: toggle AI', CANVAS_WIDTH / 2, panelY + 70);

  // 模式切换
  if (!p1Ready || !p2Ready) {
    const modeY = panelY + 88;
    const tabs = [
      { label: 'Standard', desc: 'QCF motions', active: !simplifiedMode, x: 330 },
      { label: 'Simplified', desc: 'U/I/O buttons', active: simplifiedMode, x: 470 },
    ];
    for (const t of tabs) {
      const tw = 120, th = 28;
      ctx.fillStyle = t.active ? 'rgba(0,180,80,0.85)' : 'rgba(40,40,60,0.8)';
      roundRect(ctx, t.x - tw / 2, modeY, tw, th, 6); ctx.fill();
      ctx.strokeStyle = t.active ? '#44ff88' : '#555';
      ctx.lineWidth = t.active ? 2 : 1;
      roundRect(ctx, t.x - tw / 2, modeY, tw, th, 6); ctx.stroke();
      ctx.font = 'bold 12px "Courier New", monospace'; ctx.textAlign = 'center';
      ctx.fillStyle = t.active ? '#fff' : '#999';
      ctx.fillText(t.label, t.x, modeY + th / 2);
      ctx.font = '9px "Courier New", monospace';
      ctx.fillStyle = t.active ? '#ccffcc' : '#666';
      ctx.fillText(t.desc, t.x, modeY + th + 12);
    }
  }

  // 舞台名称 (底部)
  const stageName = STAGE_NAMES[currentStage] || currentStage;
  drawSNKText(ctx, `STAGE: ${stageName}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 14, 11, '#888888');
  ctx.font = '10px "Courier New", monospace';
  ctx.fillStyle = '#555';
  ctx.textAlign = 'center';
  ctx.fillText('N: change stage', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 2);

  ctx.textAlign = 'left';
  ctx.restore();
}

// 绘制玩家信息面板 (P1/P2)
function drawPlayerInfo(
  ctx: CanvasRenderingContext2D,
  cursor: number,
  ready: boolean,
  colorIndex: number,
  label: string,
  labelColor: string,
  isLeft: boolean,
  selectState: SelectState,
  tick: number,
  panelY: number,
): void {
  const isRandom = selectState.isRandomSlot(cursor);
  const char = isRandom ? null : ROSTER[cursor];
  const align: CanvasTextAlign = isLeft ? 'left' : 'right';
  const baseX = isLeft ? 90 : CANVAS_WIDTH - 90;

  // 头像预览
  if (char?.pixelPortrait) {
    const pScale = 2;
    const pw = char.pixelPortrait.width * pScale;
    const ph = char.pixelPortrait.height * pScale;
    const ppx = isLeft ? 10 : CANVAS_WIDTH - pw - 18;
    const ppy = panelY + 2;
    ctx.fillStyle = 'rgba(10, 10, 20, 0.7)';
    roundRect(ctx, ppx, ppy, pw + 8, ph + 8, 4); ctx.fill();
    drawPixelPortrait(ctx, char.pixelPortrait, ppx + 4, ppy + 4, pScale, {
      frameColor: char.color,
      backdropColor: 'rgba(8, 8, 18, 0.85)',
      scanlines: true,
    });
  } else if (isRandom) {
    // 随机格 — 问号图标
    const ppx = isLeft ? 15 : CANVAS_WIDTH - 70;
    ctx.fillStyle = 'rgba(10, 10, 20, 0.7)';
    roundRect(ctx, ppx, panelY + 2, 60, 60, 4); ctx.fill();
    ctx.font = 'bold 30px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffcc00';
    ctx.fillText('?', ppx + 30, panelY + 35);
  }

  // 标签
  drawSNKText(ctx, label, baseX, panelY + 8, 12, labelColor, '#000000', align);

  // 角色名
  const nameText = char ? char.nameCn : 'RANDOM';
  const nameColor = char ? char.color : '#ffcc00';
  drawSNKText(ctx, nameText, baseX, panelY + 30, 20, nameColor, '#000000', align);

  // 确认状态 / 颜色指示
  if (ready) {
    // 已确认 — 显示选色
    const palette = COLOR_PALETTES[colorIndex];
    drawSNKText(ctx, `${palette.label} COLOR`, baseX, panelY + 50, 11, '#ffcc00', '#000000', align);
    // 色块指示器
    const indicatorX = isLeft ? baseX + 55 : baseX - 60;
    ctx.fillStyle = palette.color;
    ctx.fillRect(indicatorX, panelY + 44, 12, 12);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(indicatorX, panelY + 44, 12, 12);
  } else {
    const hint = label === 'P1' ? 'A/B/C/D to select' : (selectState.p2IsAI ? '[AI]' : 'Numpad to select');
    drawSNKText(ctx, hint, baseX, panelY + 50, 11, '#666666', '#000000', align);
  }

  // 角色色条
  const barX = isLeft ? baseX - 5 : CANVAS_WIDTH - baseX - 95;
  ctx.fillStyle = char ? char.color : '#ffcc00';
  ctx.fillRect(isLeft ? baseX - 5 : baseX - 95, panelY - 4, 100, 2);
}

// 绘制光标角括号 (带脉动动画)
function drawCursorBracket(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  w: number, h: number,
  tick: number, playerIndex: number,
  color: string, glowColor: string,
): void {
  const phase = tick * 0.1 + playerIndex * 2;
  const pulse = 0.5 + Math.sin(phase) * 0.3;
  const bLen = 8;
  const bOff = 4 + Math.sin(phase * 1.5) * 1;

  // 全边框发光
  ctx.strokeStyle = glowColor + Math.round(pulse * 255).toString(16).padStart(2, '0');
  ctx.lineWidth = 2;
  roundRect(ctx, cx - 2, cy - 2, w + 4, h + 4, 8);
  ctx.stroke();

  // 角括号
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  // 左上
  ctx.beginPath(); ctx.moveTo(cx - bOff, cy - bOff + bLen); ctx.lineTo(cx - bOff, cy - bOff); ctx.lineTo(cx - bOff + bLen, cy - bOff); ctx.stroke();
  // 右上
  ctx.beginPath(); ctx.moveTo(cx + w + bOff - bLen, cy - bOff); ctx.lineTo(cx + w + bOff, cy - bOff); ctx.lineTo(cx + w + bOff, cy - bOff + bLen); ctx.stroke();
  // 左下
  ctx.beginPath(); ctx.moveTo(cx - bOff, cy + h + bOff - bLen); ctx.lineTo(cx - bOff, cy + h + bOff); ctx.lineTo(cx - bOff + bLen, cy + h + bOff); ctx.stroke();
  // 右下
  ctx.beginPath(); ctx.moveTo(cx + w + bOff - bLen, cy + h + bOff); ctx.lineTo(cx + w + bOff, cy + h + bOff); ctx.lineTo(cx + w + bOff, cy + h + bOff - bLen); ctx.stroke();
}

// 绘制已确认标签 + 颜色指示器
function drawConfirmedLabel(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  playerLabel: string,
  labelColor: string,
  colorIndex: number,
  tick: number,
): void {
  // 小标签
  ctx.save();
  ctx.font = 'bold 9px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = labelColor;
  ctx.fillText(playerLabel + ' OK!', cx + CARD_W / 2, cy + (playerLabel === 'P1' ? - 2 : CARD_H + 10));
  ctx.restore();
}

// ===== VS Splash =====

export function drawVSSplash(
  ctx: CanvasRenderingContext2D,
  selectState: SelectState,
  tick: number,
): void {
  const timer = selectState.vsSplashTimer;
  if (timer < 0) return;
  const progress = timer / VS_SPLASH_DURATION;

  ctx.save();

  // 全屏黑色背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 淡入动画
  const fadeIn = Math.min(1, timer / 15);
  ctx.globalAlpha = fadeIn;

  const p1Char = selectState.p1ConfirmedChar;
  const p2Char = selectState.p2ConfirmedChar;

  // P1头像 (左侧)
  if (p1Char?.pixelPortrait) {
    const scale = 3;
    const pw = p1Char.pixelPortrait.width * scale;
    const ph = p1Char.pixelPortrait.height * scale;
    const px = CANVAS_WIDTH * 0.25 - pw / 2;
    const py = 100;
    drawVSPortrait(ctx, px, py, pw, ph, p1Char.pixelPortrait, scale, p1Char.color, tick, 0);
  }

  // P2头像 (右侧)
  if (p2Char?.pixelPortrait) {
    const scale = 3;
    const pw = p2Char.pixelPortrait.width * scale;
    const ph = p2Char.pixelPortrait.height * scale;
    const px = CANVAS_WIDTH * 0.75 - pw / 2;
    const py = 100;
    drawVSPortrait(ctx, px, py, pw, ph, p2Char.pixelPortrait, scale, p2Char.color, tick, 1);
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

  ctx.globalAlpha = 1;
  ctx.restore();
}

// VS闪屏中的头像绘制
function drawVSPortrait(
  ctx: CanvasRenderingContext2D,
  px: number, py: number,
  pw: number, ph: number,
  portrait: PixelPortraitData,
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
    drawPixelPortrait(ctx, portrait, px, py, scale, {
      frameColor: color,
      backdropColor: 'rgba(20, 20, 40, 0.85)',
      scanlines: true,
    });
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

// ===== Intro Overlay =====

// 回合介绍时间分配: ROUND显示90帧(1.5s) + FIGHT!显示60帧(1s) = 总150帧(2.5s)
const INTRO_ROUND_FRAMES = 90;
const INTRO_FIGHT_FRAMES = 60;

export function drawIntro(ctx: CanvasRenderingContext2D, phaseTimer: number, currentRound: number = 1, p1Name: string = '', p2Name: string = ''): void {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Phase 1: "ROUND X" (0 ~ INTRO_ROUND_FRAMES)
  if (phaseTimer < INTRO_ROUND_FRAMES) {
    const progress = phaseTimer / INTRO_ROUND_FRAMES;
    const fadeIn = Math.min(1, phaseTimer / 20);
    const fadeOut = phaseTimer > INTRO_ROUND_FRAMES - 20 ? (INTRO_ROUND_FRAMES - phaseTimer) / 20 : 1;
    const alpha = Math.min(fadeIn, fadeOut);
    const scaleProgress = Math.min(1, phaseTimer / 15);
    const scale = 1 + (1 - scaleProgress) * 0.6;
    ctx.globalAlpha = alpha;
    const fontSize = Math.round(52 * scale);

    // 电影感黑条
    const barAlpha = alpha * 0.7;
    ctx.fillStyle = `rgba(0,0,0,${barAlpha})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, 100);
    ctx.fillRect(0, CANVAS_HEIGHT - 100, CANVAS_WIDTH, 100);

    // "ROUND X" — SNK style
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur = 15 + (1 - scaleProgress) * 10;
    drawSNKText(ctx, `ROUND ${currentRound}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20, fontSize, '#ffcc00');
    ctx.shadowBlur = 0;
    const romanNumerals = ['', 'I', 'II', 'III', 'IV', 'V'];
    const roman = romanNumerals[currentRound] || `${currentRound}`;
    drawSNKText(ctx, roman, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10, 14, 'rgba(200,168,50,0.6)');

    // 角色名显示
    if (p1Name && p2Name) {
      const nameAlpha = Math.min(1, Math.max(0, (phaseTimer - 10) / 20));
      ctx.globalAlpha = nameAlpha * alpha;
      drawSNKText(ctx, p1Name, CANVAS_WIDTH / 2 - 30, CANVAS_HEIGHT / 2 + 35, 16, '#ff6644', '#000000', 'right');
      drawSNKText(ctx, p2Name, CANVAS_WIDTH / 2 + 30, CANVAS_HEIGHT / 2 + 35, 16, '#4488ff', '#000000', 'left');
      drawSNKText(ctx, 'VS', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 35, 14, '#ffcc00');
    }
  }
  // Phase 2: "FIGHT!" (INTRO_ROUND_FRAMES ~ total)
  else if (phaseTimer < INTRO_ROUND_FRAMES + INTRO_FIGHT_FRAMES) {
    const fightTimer = phaseTimer - INTRO_ROUND_FRAMES;
    const fp = fightTimer / INTRO_FIGHT_FRAMES;
    const scaleProgress = Math.min(1, fightTimer / 8);
    const scale = 1 + (1 - scaleProgress) * 1.8;
    const fadeAlpha = fp > 0.5 ? Math.max(0, 1 - (fp - 0.5) * 2) : 1;
    ctx.globalAlpha = Math.min(1, Math.max(0, fadeAlpha));

    // 冲击波环
    for (let r = 0; r < 3; r++) {
      const ringDelay = r * 0.1;
      const ringProgress = Math.min(1, Math.max(0, fp * 2 - ringDelay));
      if (ringProgress <= 0) continue;
      const ringRadius = 20 + ringProgress * (150 - r * 25);
      const ringAlpha = Math.max(0, 1 - ringProgress) * (1 - r * 0.3) * fadeAlpha;
      if (ringAlpha > 0) {
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, ${100 + r * 60}, 0, ${ringAlpha * 0.5})`;
        ctx.lineWidth = (3 - r) * (1 - ringProgress) + 1;
        ctx.stroke();
      }
    }

    const fontSize = Math.round(72 * scale);
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 25 + (1 - scaleProgress) * 15;
    drawSNKText(ctx, 'FIGHT!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20, fontSize, '#ff4400');
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

// ===== KO Screen =====

export function drawKO(ctx: CanvasRenderingContext2D, winner: number | null, perfectPlayer: number | null = null, isTimeOver: boolean = false, p1Hp: number = 0, p2Hp: number = 0, maxHp: number = 1000): void {
  ctx.save();

  // Dark overlay with red vignette
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const vigGrad = ctx.createRadialGradient(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 100, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 400);
  vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
  vigGrad.addColorStop(0.7, 'rgba(80,0,0,0.15)');
  vigGrad.addColorStop(1, 'rgba(100,0,0,0.3)');
  ctx.fillStyle = vigGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const titleText = isTimeOver ? 'TIME OVER' : 'K.O.!';
  const titleColor = isTimeOver ? '#ffaa00' : '#ff2200';
  const glowColor = isTimeOver ? '#ff8800' : '#ff0000';

  // KO/Time Over shockwave rings
  for (let r = 0; r < 3; r++) {
    const ringR = 60 + r * 50;
    ctx.globalAlpha = 0.15 - r * 0.04;
    ctx.strokeStyle = isTimeOver ? '#ffaa00' : '#ff4400';
    ctx.lineWidth = 3 - r;
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20, ringR, 0, Math.PI * 2);
    ctx.stroke();
  }
  // KO冲击线
  ctx.save();
  ctx.strokeStyle = isTimeOver ? `rgba(255, 170, 0, 0.12)` : `rgba(255, 34, 0, 0.15)`;
  ctx.lineWidth = 2;
  for (let i = 0; i < 32; i++) {
    const angle = (i / 32) * Math.PI * 2;
    const innerR = 40;
    const outerR = 180 + (i % 3) * 30;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2 + Math.cos(angle) * innerR, CANVAS_HEIGHT / 2 - 20 + Math.sin(angle) * innerR);
    ctx.lineTo(CANVAS_WIDTH / 2 + Math.cos(angle) * outerR, CANVAS_HEIGHT / 2 - 20 + Math.sin(angle) * outerR);
    ctx.stroke();
  }
  ctx.restore();
  ctx.globalAlpha = 1;

  // Title text
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 60;
  drawSNKText(ctx, titleText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20, isTimeOver ? 72 : 100, titleColor);
  ctx.shadowBlur = 0;

  if (winner !== null) {
    const wColor = winner === 0 ? '#ff6644' : '#4488ff';
    ctx.shadowColor = wColor;
    ctx.shadowBlur = 12;
    drawSNKText(ctx, `P${winner + 1} WINS`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50, 28, wColor);
    ctx.shadowBlur = 0;
  } else {
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 12;
    drawSNKText(ctx, 'DOUBLE KO', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50, 28, '#ffcc00');
    ctx.shadowBlur = 0;
  }

  if (perfectPlayer !== null) {
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 35;
    drawSNKText(ctx, 'PERFECT!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100, 42, '#ffcc00');
    ctx.shadowBlur = 0;
    const perfColor = perfectPlayer === 0 ? '#ff6644' : '#4488ff';
    drawSNKText(ctx, `P${perfectPlayer + 1}`, CANVAS_WIDTH / 2 - 80, CANVAS_HEIGHT / 2 + 100, 16, perfColor);
  }

  // Time Over血量对比条
  if (isTimeOver && winner !== null) {
    const barY = CANVAS_HEIGHT / 2 + 85;
    const barW = 200;
    const barH = 12;
    const barX = CANVAS_WIDTH / 2 - barW / 2;
    const p1Ratio = Math.max(0, p1Hp / maxHp);
    const p2Ratio = Math.max(0, p2Hp / maxHp);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    roundRect(ctx, barX - 2, barY - 2, barW + 4, barH + 4, 4);
    ctx.fill();
    ctx.fillStyle = '#ff6644';
    roundRect(ctx, barX, barY, barW * p1Ratio, barH, 3);
    ctx.fill();
    ctx.fillStyle = '#4488ff';
    roundRect(ctx, barX + barW * p1Ratio, barY, barW * p2Ratio, barH, 3);
    ctx.fill();
    ctx.strokeStyle = 'rgba(200,168,50,0.4)';
    ctx.lineWidth = 1;
    roundRect(ctx, barX, barY, barW, barH, 3);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '13px "Courier New", monospace';
  ctx.fillText('Press R to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 140);

  ctx.restore();
}

// ===== Win Quote Overlay =====

export const WIN_QUOTE_DURATION = 180;

export function drawWinQuote(
  ctx: CanvasRenderingContext2D,
  timer: number,
  charName: string,
  winQuote: string,
  charColor: string,
  pixelPortrait: PixelPortraitData | undefined,
): void {
  ctx.save();

  const fadeIn = Math.min(1, timer / 30);
  const fadeOut = timer > WIN_QUOTE_DURATION - 30 ? (WIN_QUOTE_DURATION - timer) / 30 : 1;
  const alpha = Math.min(fadeIn, fadeOut);

  ctx.fillStyle = `rgba(0, 0, 0, ${0.7 * alpha})`;
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
