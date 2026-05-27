/**
 * Screens — Character Select, VS Splash, Intro, KO, Win Quote
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/constants.js';
import { ROSTER } from '../characters/index.js';
import { roundRect, drawSNKText } from './utils.js';
import { drawPixelPortrait } from './pixelPortraits.js';
import type { PixelPortraitData } from './pixelPortraits.js';
import { getPortraitForSize } from './manifestRenderData.js';
import {
  RANDOM_SLOT_INDEX, TOTAL_SELECT_SLOTS, COLOR_PALETTES,
  VS_SPLASH_DURATION,
} from '../state/selectState.js';
import type { SelectState } from '../state/selectState.js';
import type { CharacterDefinition } from '../characters/types.js';
import type { StageId } from './stage.js';
import type { AnnounceSequence } from '../state/announceSequence.js';
import type { KODustParticle, KOPhase } from '../state/cinematicState.js';
import { KO_FLASH_DURATION, KO_ANNOUNCE_DURATION, KO_TRANSITION_PAUSE } from '../state/cinematicState.js';

// ===== 舞台名称映射 =====
const STAGE_NAMES: Record<StageId, string> = {
  temple: '日本寺庙 · Japan',
  china: '唐人街 · China',
  factory: '工場 · Factory',
  orochi: '大蛇神社 · Orochi',
  street: '街市夜市 · Street',
};

// ===== Character Select =====

/**
 * Helper: get the best portrait for a given size context.
 * Returns size-specific portrait if available, else CharacterDefinition.pixelPortrait.
 */
function getBestPortrait(
  char: CharacterDefinition | null,
  size: 'select' | 'vs' | 'hud' | 'win',
): PixelPortraitData | undefined {
  if (!char) return undefined;
  const sized = getPortraitForSize(char.id, size);
  return sized ?? char.pixelPortrait;
}

function drawPortraitContainedInBox(
  ctx: CanvasRenderingContext2D,
  portrait: PixelPortraitData,
  boxX: number,
  boxY: number,
  boxWidth: number,
  boxHeight: number,
  options: Parameters<typeof drawPixelPortrait>[5] = {},
): void {
  const scale = Math.min(boxWidth / portrait.width, boxHeight / portrait.height);
  const drawWidth = portrait.width * scale;
  const drawHeight = portrait.height * scale;
  const drawX = boxX + (boxWidth - drawWidth) / 2;
  const drawY = boxY + (boxHeight - drawHeight) / 2;

  drawPixelPortrait(ctx, portrait, drawX, drawY, scale, options);
}

function getVisiblePortraitBounds(
  portrait: PixelPortraitData,
): { minX: number; minY: number; width: number; height: number } | null {
  let minX = portrait.width;
  let minY = portrait.height;
  let maxX = -1;
  let maxY = -1;

  for (let row = 0; row < portrait.height; row++) {
    const rowData = portrait.pixels[row];
    if (!rowData) continue;
    for (let col = 0; col < portrait.width; col++) {
      if ((rowData[col] ?? 0) === 0) continue;
      if (col < minX) minX = col;
      if (row < minY) minY = row;
      if (col > maxX) maxX = col;
      if (row > maxY) maxY = row;
    }
  }

  if (maxX < 0 || maxY < 0) return null;
  return {
    minX,
    minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

function cropPortraitToVisibleBounds(portrait: PixelPortraitData): PixelPortraitData | null {
  const bounds = getVisiblePortraitBounds(portrait);
  if (!bounds) return null;

  const pixels: number[][] = [];
  for (let row = 0; row < bounds.height; row++) {
    const sourceRow = portrait.pixels[bounds.minY + row] ?? [];
    pixels.push(sourceRow.slice(bounds.minX, bounds.minX + bounds.width));
  }

  return {
    width: bounds.width,
    height: bounds.height,
    palette: portrait.palette,
    pixels,
  };
}

function drawPortraitFitVisibleBoundsInBox(
  ctx: CanvasRenderingContext2D,
  portrait: PixelPortraitData,
  boxX: number,
  boxY: number,
  boxWidth: number,
  boxHeight: number,
  options: Parameters<typeof drawPixelPortrait>[5] = {},
): boolean {
  const cropped = cropPortraitToVisibleBounds(portrait);
  if (!cropped) return false;

  const scale = Math.min(boxWidth / cropped.width, boxHeight / cropped.height);
  const drawWidth = cropped.width * scale;
  const drawHeight = cropped.height * scale;
  const drawX = boxX + (boxWidth - drawWidth) / 2;
  const drawY = boxY + (boxHeight - drawHeight) / 2;

  drawPixelPortrait(ctx, cropped, drawX, drawY, scale, options);
  return true;
}

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

      const selectPortrait = getBestPortrait(char, 'select');
      if (selectPortrait) {
        const portraitBoxX = cx + 12;
        const portraitBoxY = portraitY + 4;
        const portraitBoxW = CARD_W - 24;
        const portraitBoxH = 40;
        if (!drawPortraitFitVisibleBoundsInBox(ctx, selectPortrait, portraitBoxX, portraitBoxY, portraitBoxW, portraitBoxH, {
          frameColor: char.color,
          backdropColor: 'rgba(8, 8, 18, 0.85)',
          scanlines: true,
        })) {
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
    const hoverPortrait = getBestPortrait(hoveredChar, 'select');
    if (hoverPortrait) {
      const previewBoxW = 120;
      const previewBoxH = 120;
      const ppx = CANVAS_WIDTH / 2 - previewBoxW / 2 - 100;
      const ppy = hoverY - previewBoxH / 2 - 5;
      // 肖像背景
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      roundRect(ctx, ppx - 4, ppy - 4, previewBoxW + 8, previewBoxH + 8, 4);
      ctx.fill();
      ctx.strokeStyle = hoveredChar.color + '88';
      ctx.lineWidth = 1;
      roundRect(ctx, ppx - 4, ppy - 4, previewBoxW + 8, previewBoxH + 8, 4);
      ctx.stroke();
      if (!drawPortraitFitVisibleBoundsInBox(ctx, hoverPortrait, ppx, ppy, previewBoxW, previewBoxH, {
        frameColor: hoveredChar.color,
        backdropColor: 'rgba(8, 8, 18, 0.9)',
        scanlines: true,
      })) {
        ctx.font = 'bold 44px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = hoveredChar.color;
        ctx.fillText(hoveredChar.portrait, ppx + previewBoxW / 2, ppy + previewBoxH / 2);
      }
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
  const infoPortrait = char ? getBestPortrait(char, 'select') : undefined;
  if (infoPortrait) {
    const portraitBoxW = 72;
    const portraitBoxH = 72;
    const ppx = isLeft ? 10 : CANVAS_WIDTH - 18 - portraitBoxW;
    const ppy = panelY + 2;
    ctx.fillStyle = 'rgba(10, 10, 20, 0.7)';
    roundRect(ctx, ppx, ppy, portraitBoxW, portraitBoxH, 4); ctx.fill();
    if (!drawPortraitFitVisibleBoundsInBox(ctx, infoPortrait, ppx + 4, ppy + 4, portraitBoxW - 8, portraitBoxH - 8, {
      frameColor: char?.color ?? '#888',
      backdropColor: 'rgba(8, 8, 18, 0.85)',
      scanlines: true,
    })) {
      ctx.font = 'bold 30px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = char?.color ?? '#888';
      ctx.fillText(char?.portrait ?? '?', ppx + portraitBoxW / 2, ppy + portraitBoxH / 2);
    }
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
  const isP1 = playerLabel === 'P1';
  const labelY = isP1 ? cy - 2 : cy + CARD_H + 10;
  // 小标签
  ctx.save();
  ctx.font = 'bold 9px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = labelColor;
  ctx.fillText(playerLabel + ' OK!', cx + CARD_W / 2, labelY);
  // Palette color indicator dot next to label
  const palette = COLOR_PALETTES[colorIndex];
  const dotX = cx + CARD_W / 2 + 28;
  const dotY = labelY - 3;
  ctx.fillStyle = palette.color;
  ctx.beginPath();
  ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
  ctx.stroke();
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
  const p1VSPortrait = p1Char ? getBestPortrait(p1Char, 'vs') : undefined;
  if (p1VSPortrait) {
    const scale = p1VSPortrait.width > 100 ? 1.5 : 3;
    const pw = p1VSPortrait.width * scale;
    const ph = p1VSPortrait.height * scale;
    const px = CANVAS_WIDTH * 0.25 - pw / 2;
    const py = 100;
    drawVSPortrait(ctx, px, py, pw, ph, p1VSPortrait, scale, (p1Char?.color ?? '#888'), tick, 0);
  }

  // P2头像 (右侧)
  const p2VSPortrait = p2Char ? getBestPortrait(p2Char, 'vs') : undefined;
  if (p2VSPortrait) {
    const scale = p2VSPortrait.width > 100 ? 1.5 : 3;
    const pw = p2VSPortrait.width * scale;
    const ph = p2VSPortrait.height * scale;
    const px = CANVAS_WIDTH * 0.75 - pw / 2;
    const py = 100;
    drawVSPortrait(ctx, px, py, pw, ph, p2VSPortrait, scale, (p2Char?.color ?? '#888'), tick, 1);
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

export function drawIntro(ctx: CanvasRenderingContext2D, phaseTimer: number, currentRound: number = 1, p1Name: string = '', p2Name: string = '', stageId?: StageId, p1Wins: number = 0, p2Wins: number = 0, winsNeeded: number = 2): void {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Phase 1: "ROUND X" (0 ~ INTRO_ROUND_FRAMES)
  if (phaseTimer < INTRO_ROUND_FRAMES) {
    // KOF2002: 回合开始能量爆发 — 前5帧中心放射状扩散环
    if (phaseTimer < 5) {
      ctx.save();
      ctx.globalAlpha = (5 - phaseTimer) / 5 * 0.2;
      ctx.strokeStyle = '#ffcc44';
      ctx.lineWidth = 2;
      const burstR = 20 + phaseTimer * 40;
      ctx.beginPath();
      ctx.ellipse(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, burstR, burstR * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    // KOF2002: 回合开始暗角 — 前20帧边缘渐暗
    if (phaseTimer < 20) {
      ctx.save();
      ctx.globalAlpha = (20 - phaseTimer) / 20 * 0.3;
      const grad = ctx.createRadialGradient(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.3, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.8);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.restore();
    }
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

    // KOF2002: MATCH POINT — 任一方只差一胜时显示
    const p1MatchPoint = p1Wins >= winsNeeded - 1 && p2Wins < winsNeeded;
    const p2MatchPoint = p2Wins >= winsNeeded - 1 && p1Wins < winsNeeded;
    if (p1MatchPoint || p2MatchPoint) {
      const mpAlpha = Math.min(1, Math.max(0, (phaseTimer - 40) / 15)) * fadeOut;
      ctx.globalAlpha = mpAlpha * alpha * 0.9;
      const mpColor = p1MatchPoint ? '#ff6644' : '#4488ff';
      const mpName = p1MatchPoint ? p1Name : p2Name;
      ctx.shadowColor = mpColor;
      ctx.shadowBlur = 10;
      drawSNKText(ctx, 'MATCH POINT', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 55, 16, mpColor);
      if (mpName) {
        drawSNKText(ctx, mpName, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 72, 11, 'rgba(200,200,200,0.7)');
      }
      ctx.shadowBlur = 0;
    }

    // KOF2002: 舞台名显示 — 底部淡入淡出
    if (stageId && STAGE_NAMES[stageId]) {
      const stageAlpha = Math.min(1, Math.max(0, (phaseTimer - 30) / 20)) * fadeOut;
      ctx.globalAlpha = stageAlpha * alpha * 0.7;
      drawSNKText(ctx, STAGE_NAMES[stageId], CANVAS_WIDTH / 2, CANVAS_HEIGHT - 130, 12, 'rgba(180,180,200,0.8)', '#000000');
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

    // KOF2002: FIGHT!瞬间橙色全屏闪光
    if (fightTimer < 4) {
      ctx.save();
      ctx.globalAlpha = (4 - fightTimer) / 4 * 0.25;
      ctx.fillStyle = '#ff6600';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.restore();
    }

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

/**
 * Extended KO draw function with KO phase state machine support.
 * Renders different visuals depending on the KO phase:
 *  PENDING: Slow-mo in progress, no KO overlay yet
 *  FLASH:   Screen darkens, dramatic flash, "K.O." text scales 0.5x → 1.5x → 1.0x
 *  ANNOUNCE: "K.O." text settled at 1.0x, white with red outline, 90 ticks
 *  DONE:    Fade out, round result shown
 */
export function drawKO(
  ctx: CanvasRenderingContext2D,
  winner: number | null,
  perfectPlayer: number | null = null,
  isTimeOver: boolean = false,
  p1Hp: number = 0,
  p2Hp: number = 0,
  maxHp: number = 1000,
  koTimer: number = 0,
  koDustParticles: KODustParticle[] = [],
  cameraX: number = 0,
  koPhase?: KOPhase,
  koPhaseTimer: number = 0,
): void {
  ctx.save();

  // Dark overlay with red pulsing vignette
  const pulseSpeed = 0.04;
  const vignettePulse = 0.6 + Math.sin(koTimer * pulseSpeed) * 0.15;
  ctx.fillStyle = `rgba(0, 0, 0, ${0.55 * vignettePulse})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const vigGrad = ctx.createRadialGradient(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 80, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 420);
  vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
  vigGrad.addColorStop(0.5, `rgba(80,0,0,${0.12 * vignettePulse})`);
  vigGrad.addColorStop(0.75, `rgba(120,0,0,${0.25 * vignettePulse})`);
  vigGrad.addColorStop(1, `rgba(160,0,0,${0.4 * vignettePulse})`);
  ctx.fillStyle = vigGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const titleText = isTimeOver ? 'TIME OVER' : 'K.O.!';
  const titleColor = isTimeOver ? '#ffaa00' : '#ff2200';
  const glowColor = isTimeOver ? '#ff8800' : '#ff0000';

  // KO impact dust particles
  for (const p of koDustParticles) {
    const screenX = p.x - cameraX;
    const alpha = Math.max(0, p.life / p.maxLife) * 0.8;
    ctx.fillStyle = p.color + Math.round(alpha * 255).toString(16).padStart(2, '0');
    ctx.beginPath();
    ctx.arc(screenX, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
    ctx.fill();
  }

  // KO shockwave rings — expanding outward over time
  const ringExpandProgress = Math.min(1, koTimer / 60);
  for (let r = 0; r < 5; r++) {
    const ringDelay = r * 0.12;
    const ringProgress = Math.min(1, Math.max(0, ringExpandProgress * 2 - ringDelay));
    if (ringProgress <= 0) continue;
    const ringR = 30 + ringProgress * (200 - r * 25);
    const ringAlpha = Math.max(0, 1 - ringProgress) * (1 - r * 0.15);
    if (ringAlpha > 0) {
      ctx.globalAlpha = ringAlpha * 0.4;
      ctx.strokeStyle = isTimeOver ? '#ffaa00' : '#ff4400';
      ctx.lineWidth = (4 - Math.min(r, 3)) * (1 - ringProgress) + 1;
      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20, ringR, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  // KO radial impact lines
  ctx.save();
  ctx.strokeStyle = isTimeOver ? 'rgba(255, 170, 0, 0.12)' : 'rgba(255, 34, 0, 0.15)';
  ctx.lineWidth = 2;
  const lineCount = 32;
  const lineProgress = Math.min(1, koTimer / 30);
  for (let i = 0; i < lineCount; i++) {
    const angle = (i / lineCount) * Math.PI * 2;
    const innerR = 40;
    const outerR = (100 + (i % 3) * 30) * (0.5 + lineProgress * 0.5);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2 + Math.cos(angle) * innerR, CANVAS_HEIGHT / 2 - 20 + Math.sin(angle) * innerR);
    ctx.lineTo(CANVAS_WIDTH / 2 + Math.cos(angle) * outerR, CANVAS_HEIGHT / 2 - 20 + Math.sin(angle) * outerR);
    ctx.stroke();
  }
  ctx.restore();

  // Title text — phase-aware scale animation
  const effectivePhase = koPhase ?? (koTimer > 5 ? 'ANNOUNCE' : 'FLASH');
  const effectivePhaseTimer = koPhase ? koPhaseTimer : koTimer;

  let textScale = 1;
  let textAlpha = 1;

  if (effectivePhase === 'FLASH' || (!koPhase && koTimer <= 5)) {
    // FLASH phase: scale from 0.5x → 1.5x → settle at 1.0x
    const flashProgress = Math.min(1, effectivePhaseTimer / KO_FLASH_DURATION);
    if (flashProgress < 0.3) {
      // 0→30%: scale from 0.5x up to 1.5x
      const t = flashProgress / 0.3;
      textScale = 0.5 + t * 1.0;
    } else if (flashProgress < 0.5) {
      // 30→50%: scale from 1.5x down to 0.9x (bounce undershoot)
      const t = (flashProgress - 0.3) / 0.2;
      textScale = 1.5 - t * 0.6;
    } else if (flashProgress < 0.7) {
      // 50→70%: scale from 0.9x back to 1.05x (small overshoot)
      const t = (flashProgress - 0.5) / 0.2;
      textScale = 0.9 + t * 0.15;
    } else {
      // 70→100%: settle at 1.0x
      const t = (flashProgress - 0.7) / 0.3;
      textScale = 1.05 - t * 0.05;
    }
    textAlpha = Math.min(1, flashProgress * 4);
  } else if (effectivePhase === 'ANNOUNCE') {
    // ANNOUNCE phase: stable at 1.0x, full alpha, subtle pulse
    const announceProgress = effectivePhaseTimer / KO_ANNOUNCE_DURATION;
    textScale = 1.0 + Math.sin(effectivePhaseTimer * 0.08) * 0.02;
    // Start fading near end of announce phase
    if (announceProgress > 0.85) {
      textAlpha = Math.max(0, (1 - announceProgress) / 0.15);
    }
  } else if (effectivePhase === 'DONE') {
    // DONE phase: fade out
    textAlpha = Math.max(0, 1 - effectivePhaseTimer / 30);
    textScale = 1.0;
  }
  ctx.globalAlpha = textAlpha;
  const fontSize = Math.round((isTimeOver ? 72 : 100) * textScale);

  // Enhanced K.O. text: white fill with red outline (Phase 52 spec)
  if (!isTimeOver) {
    // Red outline layer — thicker stroke for dramatic effect
    ctx.save();
    ctx.font = `bold ${fontSize}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 60 + (textScale - 1) * 30;
    // Red outline
    ctx.strokeStyle = '#cc0000';
    ctx.lineWidth = Math.max(4, Math.round(fontSize / 12));
    ctx.lineJoin = 'round';
    ctx.strokeText(titleText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
    // White fill
    ctx.fillStyle = '#ffffff';
    ctx.fillText(titleText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
    ctx.shadowBlur = 0;
    ctx.restore();
  } else {
    // TIME OVER: keep original gold styling
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 60 + (textScale - 1) * 30;
    drawSNKText(ctx, titleText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20, fontSize, titleColor);
    ctx.shadowBlur = 0;
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  // Winner announcement
  if (winner !== null) {
    const wColor = winner === 0 ? '#ff6644' : '#4488ff';
    const winAlpha = Math.min(1, Math.max(0, (koTimer - 30) / 20));
    ctx.globalAlpha = winAlpha;
    ctx.shadowColor = wColor;
    ctx.shadowBlur = 12;
    drawSNKText(ctx, `P${winner + 1} WINS`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50, 28, wColor);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  } else {
    const dkAlpha = Math.min(1, Math.max(0, (koTimer - 30) / 20));
    ctx.globalAlpha = dkAlpha;
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 12;
    drawSNKText(ctx, 'DOUBLE KO', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50, 28, '#ffcc00');
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // PERFECT with golden glow and sparkles — enhanced with gold flash
  if (perfectPlayer !== null) {
    const perfAlpha = Math.min(1, Math.max(0, (koTimer - 50) / 20));
    ctx.globalAlpha = perfAlpha;

    // Phase 52: Gold flash burst behind PERFECT text
    const goldBurstR = 80 + Math.sin(koTimer * 0.06) * 20;
    const goldBurstGrad = ctx.createRadialGradient(
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100, 5,
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100, goldBurstR,
    );
    goldBurstGrad.addColorStop(0, `rgba(255, 220, 100, ${0.5 * perfAlpha})`);
    goldBurstGrad.addColorStop(0.3, `rgba(255, 200, 50, ${0.3 * perfAlpha})`);
    goldBurstGrad.addColorStop(1, 'rgba(255, 180, 0, 0)');
    ctx.fillStyle = goldBurstGrad;
    ctx.fillRect(CANVAS_WIDTH / 2 - goldBurstR, CANVAS_HEIGHT / 2 + 100 - goldBurstR, goldBurstR * 2, goldBurstR * 2);
    ctx.globalAlpha = perfAlpha;

    // Golden glow background behind PERFECT text
    const perfGlowGrad = ctx.createRadialGradient(
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100, 10,
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100, 120,
    );
    perfGlowGrad.addColorStop(0, `rgba(255, 200, 50, ${0.3 * perfAlpha})`);
    perfGlowGrad.addColorStop(0.5, `rgba(255, 170, 0, ${0.15 * perfAlpha})`);
    perfGlowGrad.addColorStop(1, 'rgba(255, 150, 0, 0)');
    ctx.fillStyle = perfGlowGrad;
    ctx.fillRect(CANVAS_WIDTH / 2 - 150, CANVAS_HEIGHT / 2 + 40, 300, 120);

    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 35;
    drawSNKText(ctx, 'PERFECT!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100, 42, '#ffcc00');
    ctx.shadowBlur = 0;
    const perfColor = perfectPlayer === 0 ? '#ff6644' : '#4488ff';
    drawSNKText(ctx, `P${perfectPlayer + 1}`, CANVAS_WIDTH / 2 - 80, CANVAS_HEIGHT / 2 + 100, 16, perfColor);

    // Sparkle particles around PERFECT text
    const sparkleCount = 8;
    for (let s = 0; s < sparkleCount; s++) {
      const sparkleAngle = (s / sparkleCount) * Math.PI * 2 + koTimer * 0.03;
      const sparkleDist = 60 + Math.sin(koTimer * 0.05 + s) * 20;
      const sx = CANVAS_WIDTH / 2 + Math.cos(sparkleAngle) * sparkleDist;
      const sy = CANVAS_HEIGHT / 2 + 100 + Math.sin(sparkleAngle) * sparkleDist * 0.5;
      const sparkleSize = 2 + Math.sin(koTimer * 0.1 + s * 1.5) * 1.5;
      const sparkleAlpha = 0.5 + Math.sin(koTimer * 0.08 + s) * 0.3;
      ctx.fillStyle = `rgba(255, 230, 100, ${sparkleAlpha * perfAlpha})`;
      ctx.beginPath();
      // 4-pointed star shape
      ctx.moveTo(sx, sy - sparkleSize);
      ctx.lineTo(sx + sparkleSize * 0.3, sy);
      ctx.lineTo(sx, sy + sparkleSize);
      ctx.lineTo(sx - sparkleSize * 0.3, sy);
      ctx.closePath();
      ctx.fill();
    }

    // Bonus meter gain visual — golden upward arrows
    const arrowAlpha = Math.max(0, Math.sin(koTimer * 0.06)) * perfAlpha * 0.6;
    if (arrowAlpha > 0) {
      ctx.fillStyle = `rgba(255, 200, 50, ${arrowAlpha})`;
      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.fillText('+METER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 140);
    }

    ctx.globalAlpha = 1;
  }

  // KO Result HP comparison — all KO types, not just time over
  if (winner !== null && koTimer > 55) {
    const resultAlpha = Math.min(1, (koTimer - 55) / 20);
    const barY = CANVAS_HEIGHT / 2 + 80;
    const barW = 240;
    const barH = 16;
    const barX = CANVAS_WIDTH / 2 - barW / 2;
    const p1Ratio = Math.max(0, p1Hp / maxHp);
    const p2Ratio = Math.max(0, p2Hp / maxHp);

    ctx.globalAlpha = resultAlpha;

    // Result card background
    ctx.fillStyle = 'rgba(5, 5, 15, 0.8)';
    roundRect(ctx, barX - 12, barY - 22, barW + 24, barH + 38, 6);
    ctx.fill();
    // Card border — winner side glows
    ctx.strokeStyle = winner === 0 ? 'rgba(255, 100, 60, 0.6)' : 'rgba(68, 136, 255, 0.6)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, barX - 12, barY - 22, barW + 24, barH + 38, 6);
    ctx.stroke();

    // P1 label + HP percentage
    const p1Label = `P1 ${Math.round(p1Ratio * 100)}%`;
    drawSNKText(ctx, p1Label, barX - 5, barY - 10, 9, winner === 0 ? '#ff6644' : '#886655');
    // P2 label + HP percentage
    const p2Label = `${Math.round(p2Ratio * 100)}% P2`;
    drawSNKText(ctx, p2Label, barX + barW + 5, barY - 10, 9, winner === 1 ? '#4488ff' : '#556688');

    // HP bar background
    ctx.fillStyle = '#0f0f1a';
    roundRect(ctx, barX, barY, barW, barH, 3);
    ctx.fill();

    // P1 HP fill (left side)
    const p1FillW = Math.round(barW / 2 * p1Ratio);
    if (p1FillW > 0) {
      const p1Grad = ctx.createLinearGradient(barX, barY, barX, barY + barH);
      p1Grad.addColorStop(0, winner === 0 ? '#ff8855' : '#886655');
      p1Grad.addColorStop(1, winner === 0 ? '#cc4422' : '#554433');
      ctx.fillStyle = p1Grad;
      roundRect(ctx, barX, barY, p1FillW, barH, 3);
      ctx.fill();
    }

    // P2 HP fill (right side)
    const p2FillW = Math.round(barW / 2 * p2Ratio);
    if (p2FillW > 0) {
      const p2Grad = ctx.createLinearGradient(barX + barW - p2FillW, barY, barX + barW - p2FillW, barY + barH);
      p2Grad.addColorStop(0, winner === 1 ? '#6699ff' : '#556688');
      p2Grad.addColorStop(1, winner === 1 ? '#2244cc' : '#334455');
      ctx.fillStyle = p2Grad;
      roundRect(ctx, barX + barW - p2FillW, barY, p2FillW, barH, 3);
      ctx.fill();
    }

    // Center divider line
    ctx.strokeStyle = 'rgba(200, 168, 50, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, barY + 1);
    ctx.lineTo(CANVAS_WIDTH / 2, barY + barH - 1);
    ctx.stroke();

    // Winner side marker
    const markerX = winner === 0 ? barX - 3 : barX + barW + 3;
    const markerPulse = 0.6 + Math.sin(koTimer * 0.1) * 0.4;
    ctx.fillStyle = winner === 0 ? `rgba(255, 100, 60, ${markerPulse})` : `rgba(68, 136, 255, ${markerPulse})`;
    ctx.beginPath();
    if (winner === 0) {
      ctx.moveTo(markerX, barY + barH / 2 - 5);
      ctx.lineTo(markerX + 6, barY + barH / 2);
      ctx.lineTo(markerX, barY + barH / 2 + 5);
    } else {
      ctx.moveTo(markerX, barY + barH / 2 - 5);
      ctx.lineTo(markerX - 6, barY + barH / 2);
      ctx.lineTo(markerX, barY + barH / 2 + 5);
    }
    ctx.fill();

    // "WINNER" label under the winning side
    const winLabelX = winner === 0 ? barX + 20 : barX + barW - 20;
    drawSNKText(ctx, 'WIN', winLabelX, barY + barH + 6, 8, '#ffcc00');

    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '13px "Courier New", monospace';
  ctx.fillText('Press R to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 170);

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

// ===== Stage Select Screen =====

const STAGE_PREVIEW_W = 120;
const STAGE_PREVIEW_H = 80;
const STAGE_PREVIEW_GAP = 16;
const ALL_STAGES: StageId[] = ['temple', 'china', 'factory', 'orochi', 'street'];

const STAGE_THEMES: Record<string, { bg1: string; bg2: string; accent: string; pattern: string }> = {
  temple: { bg1: '#2a1a0a', bg2: '#1a0e05', accent: '#cc6633', pattern: '#cc6633' },
  china: { bg1: '#3a1515', bg2: '#1a0808', accent: '#ff4444', pattern: '#ffcc00' },
  factory: { bg1: '#1a2a1a', bg2: '#0a150a', accent: '#66aa66', pattern: '#88cc88' },
  orochi: { bg1: '#1a1a2a', bg2: '#0a0a15', accent: '#8866cc', pattern: '#aa88ff' },
  street: { bg1: '#2a2a1a', bg2: '#15150a', accent: '#ccaa33', pattern: '#ffdd66' },
};

export function drawStageSelect(
  ctx: CanvasRenderingContext2D,
  tick: number,
  cursor: number,
  ready: boolean,
): void {
  ctx.save();

  const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  bgGrad.addColorStop(0, '#080818');
  bgGrad.addColorStop(0.5, '#0c0c24');
  bgGrad.addColorStop(1, '#060614');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.strokeStyle = 'rgba(255,255,255,0.02)';
  ctx.lineWidth = 1;
  for (let i = -20; i < 40; i++) {
    const xOff = (tick * 0.3) % 60;
    ctx.beginPath();
    ctx.moveTo(i * 60 + xOff, 0);
    ctx.lineTo(i * 60 + xOff - CANVAS_HEIGHT, CANVAS_HEIGHT);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 80);
  const titleGrad = ctx.createLinearGradient(0, 78, CANVAS_WIDTH, 78);
  titleGrad.addColorStop(0, '#cc880000');
  titleGrad.addColorStop(0.3, '#cc880088');
  titleGrad.addColorStop(0.5, '#ffcc4466');
  titleGrad.addColorStop(0.7, '#cc880088');
  titleGrad.addColorStop(1, '#cc880000');
  ctx.strokeStyle = titleGrad;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 80); ctx.lineTo(CANVAS_WIDTH, 80); ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  drawSNKText(ctx, 'SELECT STAGE', CANVAS_WIDTH / 2, 25, 32, '#ffcc00');
  drawSNKText(ctx, 'A/D: move   Enter: confirm', CANVAS_WIDTH / 2, 58, 10, '#888888');

  const totalSlots = ALL_STAGES.length + 1;
  const totalW = totalSlots * STAGE_PREVIEW_W + (totalSlots - 1) * STAGE_PREVIEW_GAP;
  const startX = (CANVAS_WIDTH - totalW) / 2;
  const previewY = 180;

  for (let i = 0; i < totalSlots; i++) {
    const isRandom = i === ALL_STAGES.length;
    const stageId = isRandom ? null : ALL_STAGES[i];
    const theme = isRandom ? null : STAGE_THEMES[stageId!];
    const px = startX + i * (STAGE_PREVIEW_W + STAGE_PREVIEW_GAP);
    const isHovered = i === cursor;

    if (theme) {
      const thumbGrad = ctx.createLinearGradient(px, previewY, px, previewY + STAGE_PREVIEW_H);
      thumbGrad.addColorStop(0, theme.bg1);
      thumbGrad.addColorStop(1, theme.bg2);
      ctx.fillStyle = thumbGrad;
    } else {
      ctx.fillStyle = '#1a1a2e';
    }
    roundRect(ctx, px, previewY, STAGE_PREVIEW_W, STAGE_PREVIEW_H, 8);
    ctx.fill();

    if (theme) {
      ctx.fillStyle = theme.accent + '44';
      ctx.fillRect(px + 4, previewY + STAGE_PREVIEW_H - 20, STAGE_PREVIEW_W - 8, 2);
      ctx.fillStyle = theme.pattern + '22';
      if (stageId === 'temple') {
        ctx.beginPath();
        ctx.moveTo(px + 30, previewY + 20);
        ctx.lineTo(px + 60, previewY + 10);
        ctx.lineTo(px + 90, previewY + 20);
        ctx.lineTo(px + 85, previewY + 30);
        ctx.lineTo(px + 35, previewY + 30);
        ctx.closePath();
        ctx.fill();
      } else if (stageId === 'china') {
        for (const lx of [px + 25, px + 60, px + 95]) {
          ctx.beginPath(); ctx.arc(lx, previewY + 22, 8, 0, Math.PI * 2); ctx.fill();
        }
      } else if (stageId === 'factory') {
        ctx.beginPath(); ctx.arc(px + 40, previewY + 30, 15, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(px + 85, previewY + 25, 10, 0, Math.PI * 2); ctx.fill();
      } else if (stageId === 'orochi') {
        ctx.beginPath(); ctx.arc(px + 60, previewY + 25, 18, 0, Math.PI * 2); ctx.fill();
      } else if (stageId === 'street') {
        ctx.fillRect(px + 10, previewY + 15, 20, 45);
        ctx.fillRect(px + 40, previewY + 25, 15, 35);
        ctx.fillRect(px + 70, previewY + 20, 25, 40);
        ctx.fillRect(px + 100, previewY + 30, 15, 30);
      }
    } else {
      const pulse = 0.7 + Math.sin(tick * 0.08) * 0.3;
      ctx.fillStyle = `rgba(255, 204, 0, ${0.15 * pulse})`;
      roundRect(ctx, px + 4, previewY + 4, STAGE_PREVIEW_W - 8, STAGE_PREVIEW_H - 8, 6);
      ctx.fill();
      ctx.font = 'bold 30px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = `rgba(255, 204, 0, ${0.6 + pulse * 0.4})`;
      ctx.fillText('?', px + STAGE_PREVIEW_W / 2, previewY + STAGE_PREVIEW_H / 2 - 4);
    }

    ctx.strokeStyle = isHovered ? '#ffcc00' : 'rgba(255,255,255,0.08)';
    ctx.lineWidth = isHovered ? 3 : 1;
    roundRect(ctx, px, previewY, STAGE_PREVIEW_W, STAGE_PREVIEW_H, 8);
    ctx.stroke();

    const nameText = isRandom ? 'RANDOM' : STAGE_NAMES[stageId!];
    const displayName = isRandom ? 'RANDOM' : nameText!.split(' · ')[0];
    ctx.font = '10px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = isHovered ? '#ffcc00' : '#888';
    ctx.fillText(displayName, px + STAGE_PREVIEW_W / 2, previewY + STAGE_PREVIEW_H + 16);

    if (isHovered) {
      const glowPulse = 0.5 + Math.sin(tick * 0.12) * 0.3;
      ctx.save();
      ctx.shadowColor = '#ffcc00';
      ctx.shadowBlur = 18 * glowPulse;
      ctx.strokeStyle = `rgba(255, 204, 0, ${0.6 + glowPulse * 0.4})`;
      ctx.lineWidth = 2;
      roundRect(ctx, px - 4, previewY - 4, STAGE_PREVIEW_W + 8, STAGE_PREVIEW_H + 8, 12);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    if (ready && isHovered) {
      const flash = Math.sin(tick * 0.2) * 0.15 + 0.3;
      ctx.fillStyle = `rgba(255, 204, 0, ${flash})`;
      roundRect(ctx, px, previewY, STAGE_PREVIEW_W, STAGE_PREVIEW_H, 8);
      ctx.fill();
      ctx.font = 'bold 16px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText('OK!', px + STAGE_PREVIEW_W / 2, previewY + STAGE_PREVIEW_H / 2);
    }
  }

  const selectedIdx = cursor;
  const isSelectedRandom = selectedIdx === ALL_STAGES.length;
  const selectedStageId = isSelectedRandom ? null : ALL_STAGES[selectedIdx];
  const selectedTheme = selectedStageId ? STAGE_THEMES[selectedStageId] : null;

  const largePreviewY = 340;
  const largeW = 280;
  const largeH = 180;
  const largeX = CANVAS_WIDTH / 2 - largeW / 2;

  if (selectedTheme) {
    const lGrad = ctx.createLinearGradient(largeX, largePreviewY, largeX + largeW, largePreviewY + largeH);
    lGrad.addColorStop(0, selectedTheme.bg1);
    lGrad.addColorStop(1, selectedTheme.bg2);
    ctx.fillStyle = lGrad;
  } else {
    ctx.fillStyle = '#1a1a2e';
  }
  roundRect(ctx, largeX, largePreviewY, largeW, largeH, 10);
  ctx.fill();

  if (selectedTheme) {
    ctx.fillStyle = selectedTheme.accent + '33';
    ctx.fillRect(largeX + 10, largePreviewY + largeH - 40, largeW - 20, 3);
    ctx.fillStyle = selectedTheme.pattern + '15';
    ctx.beginPath();
    ctx.arc(largeX + largeW / 2, largePreviewY + largeH / 2, 60, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const pulse = 0.7 + Math.sin(tick * 0.08) * 0.3;
    ctx.font = 'bold 72px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = `rgba(255, 204, 0, ${0.3 + pulse * 0.3})`;
    ctx.fillText('?', largeX + largeW / 2, largePreviewY + largeH / 2);
  }

  ctx.strokeStyle = '#ffcc0088';
  ctx.lineWidth = 2;
  roundRect(ctx, largeX, largePreviewY, largeW, largeH, 10);
  ctx.stroke();

  const stageLabel = isSelectedRandom ? '???' : STAGE_NAMES[selectedStageId!];
  drawSNKText(ctx, stageLabel || 'RANDOM', CANVAS_WIDTH / 2, largePreviewY + largeH + 25, 20, '#ffcc00');
  if (!isSelectedRandom && stageLabel) {
    const subLabel = stageLabel.split(' · ')[1] || '';
    ctx.font = '12px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#888';
    ctx.fillText(subLabel, CANVAS_WIDTH / 2, largePreviewY + largeH + 45);
  }

  ctx.textAlign = 'left';
  ctx.restore();
}

// ===== Team Order Select Screen =====

export function drawTeamOrderSelect(
  ctx: CanvasRenderingContext2D,
  tick: number,
  p1Team: readonly { charDef: CharacterDefinition }[],
  p2Team: readonly { charDef: CharacterDefinition }[],
  p1Slots: number[],
  p2Slots: number[],
  cursor: number,
  swapMode: boolean,
  swapCursor: number,
  p1Ready: boolean,
  p2Ready: boolean,
): void {
  ctx.save();

  const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  bgGrad.addColorStop(0, '#080818');
  bgGrad.addColorStop(0.5, '#0c0c24');
  bgGrad.addColorStop(1, '#060614');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 70);
  drawSNKText(ctx, 'ORDER SELECT', CANVAS_WIDTH / 2, 22, 28, '#ffcc00');
  drawSNKText(ctx, 'Left/Right: pick slot   A: select   S: swap', CANVAS_WIDTH / 2, 52, 10, '#888888');

  const slotW = 100;
  const slotH = 140;
  const slotGap = 20;

  for (let pi = 0; pi < 2; pi++) {
    const team = pi === 0 ? p1Team : p2Team;
    const slots = pi === 0 ? p1Slots : p2Slots;
    const ready = pi === 0 ? p1Ready : p2Ready;
    const label = pi === 0 ? 'P1' : 'P2';
    const labelColor = pi === 0 ? '#22ccaa' : '#ff6644';
    const baseX = pi === 0 ? 80 : CANVAS_WIDTH - 80 - 3 * slotW - 2 * slotGap;

    drawSNKText(ctx, label, baseX + (3 * slotW + 2 * slotGap) / 2, 95, 18, labelColor);

    for (let si = 0; si < 3; si++) {
      const charIdx = slots[si];
      const char = team[charIdx]?.charDef;
      const sx = baseX + si * (slotW + slotGap);
      const sy = 120;

      const isActive = !ready && pi === 0 && cursor === si && !swapMode;
      const isSwapTarget = !ready && pi === 0 && swapMode && swapCursor === si;

      ctx.fillStyle = isActive ? 'rgba(34, 204, 170, 0.15)' : isSwapTarget ? 'rgba(255, 100, 0, 0.15)' : 'rgba(20, 20, 40, 0.8)';
      roundRect(ctx, sx, sy, slotW, slotH, 8);
      ctx.fill();

      const borderColor = isActive ? '#22ccaa' : isSwapTarget ? '#ff8800' : ready ? '#44ff4466' : 'rgba(255,255,255,0.1)';
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = isActive || isSwapTarget ? 3 : 1;
      roundRect(ctx, sx, sy, slotW, slotH, 8);
      ctx.stroke();

      if (isActive || isSwapTarget) {
        const glowPulse = 0.5 + Math.sin(tick * 0.12) * 0.3;
        ctx.save();
        ctx.shadowColor = isActive ? '#22ccaa' : '#ff8800';
        ctx.shadowBlur = 12 * glowPulse;
        ctx.strokeStyle = isActive ? `rgba(34, 204, 170, ${0.5 + glowPulse * 0.5})` : `rgba(255, 136, 0, ${0.5 + glowPulse * 0.5})`;
        ctx.lineWidth = 2;
        roundRect(ctx, sx - 3, sy - 3, slotW + 6, slotH + 6, 10);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      if (char) {
        const orderPortrait = getBestPortrait(char, 'select');
        if (orderPortrait) {
          const portraitBoxX = sx + 8;
          const portraitBoxY = sy + 10;
          const portraitBoxW = slotW - 16;
          const portraitBoxH = 92;
          if (!drawPortraitFitVisibleBoundsInBox(ctx, orderPortrait, portraitBoxX, portraitBoxY, portraitBoxW, portraitBoxH, {
            frameColor: char.color,
            backdropColor: 'rgba(8, 8, 18, 0.85)',
            scanlines: true,
          })) {
            const charGrad = ctx.createLinearGradient(sx + 10, sy + 10, sx + slotW - 10, sy + 90);
            charGrad.addColorStop(0, char.color);
            charGrad.addColorStop(1, char.accentColor);
            ctx.fillStyle = charGrad;
            roundRect(ctx, sx + 10, sy + 10, slotW - 20, 80, 4);
            ctx.fill();
            ctx.font = '28px serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#fff';
            ctx.fillText(char.portrait, sx + slotW / 2, sy + 55);
          }
        } else {
          const charGrad = ctx.createLinearGradient(sx + 10, sy + 10, sx + slotW - 10, sy + 90);
          charGrad.addColorStop(0, char.color);
          charGrad.addColorStop(1, char.accentColor);
          ctx.fillStyle = charGrad;
          roundRect(ctx, sx + 10, sy + 10, slotW - 20, 80, 4);
          ctx.fill();
          ctx.font = '28px serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#fff';
          ctx.fillText(char.portrait, sx + slotW / 2, sy + 55);
        }
        drawSNKText(ctx, char.nameCn, sx + slotW / 2, sy + slotH - 15, 12, '#eee');
      }

      ctx.font = 'bold 16px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = labelColor;
      ctx.fillText(`${si + 1}`, sx + slotW / 2, sy + slotH + 15);

      if (ready) {
        const flash = Math.sin(tick * 0.15) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 204, 0, ${flash * 0.3})`;
        roundRect(ctx, sx, sy, slotW, slotH, 8);
        ctx.fill();
        ctx.font = 'bold 14px "Courier New", monospace';
        ctx.fillStyle = '#ffcc00';
        ctx.fillText('OK!', sx + slotW / 2, sy + slotH / 2);
      }
    }
  }

  const centerX = CANVAS_WIDTH / 2;
  ctx.strokeStyle = 'rgba(255, 204, 0, 0.2)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(centerX, 80);
  ctx.lineTo(centerX, CANVAS_HEIGHT - 60);
  ctx.stroke();
  ctx.setLineDash([]);

  drawSNKText(ctx, 'VS', centerX, CANVAS_HEIGHT / 2, 36, 'rgba(255,255,255,0.15)');

  if (swapMode) {
    drawSNKText(ctx, 'SWAP MODE: Select target slot', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40, 12, '#ff8800');
  } else if (!p1Ready) {
    drawSNKText(ctx, 'Select a slot, then press S to swap', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40, 11, '#666');
  }

  ctx.textAlign = 'left';
  ctx.restore();
}

// ===== Transition Animations =====

const TRANSITION_WIPE_DURATION = 40;
const TRANSITION_ZOOM_DURATION = 50;
const TRANSITION_FADE_DURATION = 30;

export function drawTransition(
  ctx: CanvasRenderingContext2D,
  tick: number,
  type: 'wipe' | 'zoom' | 'fade',
  canvasWidth: number,
  canvasHeight: number,
): boolean {
  ctx.save();

  if (type === 'wipe') {
    const progress = Math.min(1, tick / TRANSITION_WIPE_DURATION);
    const wipeX = canvasWidth * (1 - progress);
    ctx.fillStyle = '#000000';
    ctx.fillRect(wipeX, 0, canvasWidth - wipeX, canvasHeight);
    if (progress < 1) {
      const glowGrad = ctx.createLinearGradient(wipeX - 30, 0, wipeX + 10, 0);
      glowGrad.addColorStop(0, 'rgba(255, 204, 0, 0)');
      glowGrad.addColorStop(0.5, 'rgba(255, 204, 0, 0.4)');
      glowGrad.addColorStop(1, 'rgba(255, 204, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(wipeX - 30, 0, 40, canvasHeight);
    }
    ctx.restore();
    return progress >= 1;
  }

  if (type === 'zoom') {
    const progress = Math.min(1, tick / TRANSITION_ZOOM_DURATION);
    if (progress < 0.5) {
      const p = progress / 0.5;
      ctx.fillStyle = `rgba(0, 0, 0, ${p * 0.9})`;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      const spotR = (1 - p) * canvasHeight * 0.6;
      if (spotR > 5) {
        const spotGrad = ctx.createRadialGradient(canvasWidth / 2, canvasHeight / 2, 0, canvasWidth / 2, canvasHeight / 2, spotR);
        spotGrad.addColorStop(0, `rgba(255, 204, 0, ${0.3 * (1 - p)})`);
        spotGrad.addColorStop(0.5, `rgba(255, 100, 0, ${0.15 * (1 - p)})`);
        spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = spotGrad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
    } else {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    if (progress < 0.15) {
      const lineAlpha = (1 - progress / 0.15) * 0.6;
      ctx.strokeStyle = `rgba(255, 204, 0, ${lineAlpha})`;
      ctx.lineWidth = 3;
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(canvasWidth / 2, canvasHeight / 2);
        ctx.lineTo(canvasWidth / 2 + Math.cos(angle) * canvasWidth, canvasHeight / 2 + Math.sin(angle) * canvasHeight);
        ctx.stroke();
      }
    }
    ctx.restore();
    return progress >= 1;
  }

  if (type === 'fade') {
    const progress = Math.min(1, tick / TRANSITION_FADE_DURATION);
    ctx.fillStyle = `rgba(0, 0, 0, ${progress})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
    return progress >= 1;
  }

  ctx.restore();
  return true;
}