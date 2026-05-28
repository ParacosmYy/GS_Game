/**
 * Character Select screen
 * Split from screens.ts
 */
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
} from '../../core/constants.js';
import { ROSTER } from '../../characters/index.js';
import { roundRect, drawSNKText } from '../utils.js';
import { drawPixelPortrait } from '../pixelPortraits.js';
import type { PixelPortraitData } from '../pixelPortraits.js';
import { getPortraitForSize } from '../manifestRenderData.js';
import { getRivalDialogue, getRivalThemeColors } from '../../core/rivalData.js';
import type { SelectState } from '../../state/selectState.js';
import { RANDOM_SLOT_INDEX, TOTAL_SELECT_SLOTS, COLOR_PALETTES, VS_SPLASH_DURATION } from '../../state/selectState.js';
import type { CharacterDefinition } from '../../characters/types.js';
import type { StageId } from '../stage.js';

// ===== 舞台名称映射 =====
const STAGE_NAMES: Record<StageId, string> = {
  temple: '日本寺庙 · Japan',
  china: '唐人街 · China',
  factory: '工場 · Factory',
  orochi: '大蛇神社 · Orochi',
  street: '街市夜市 · Street',
  rooftop: '日本屋上 · Rooftop',
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

function cropPortraitToAspect(
  portrait: PixelPortraitData,
  targetAspect: number,
  focusX: number = 0.5,
  focusY: number = 0.42,
): PixelPortraitData {
  const currentAspect = portrait.width / portrait.height;
  let cropX = 0;
  let cropY = 0;
  let cropWidth = portrait.width;
  let cropHeight = portrait.height;

  if (currentAspect > targetAspect) {
    cropHeight = portrait.height;
    cropWidth = Math.max(1, Math.round(cropHeight * targetAspect));
    cropX = Math.max(0, Math.min(portrait.width - cropWidth, Math.round(portrait.width * focusX - cropWidth / 2)));
  } else if (currentAspect < targetAspect) {
    cropWidth = portrait.width;
    cropHeight = Math.max(1, Math.round(cropWidth / targetAspect));
    cropY = Math.max(0, Math.min(portrait.height - cropHeight, Math.round(portrait.height * focusY - cropHeight / 2)));
  }

  if (cropX === 0 && cropY === 0 && cropWidth === portrait.width && cropHeight === portrait.height) {
    return portrait;
  }

  const pixels: number[][] = [];
  for (let row = 0; row < cropHeight; row++) {
    const sourceRow = portrait.pixels[cropY + row] ?? [];
    pixels.push(sourceRow.slice(cropX, cropX + cropWidth));
  }

  return {
    width: cropWidth,
    height: cropHeight,
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
  const framed = cropPortraitToAspect(cropped, 0.78);

  const scale = Math.min(boxWidth / framed.width, boxHeight / framed.height);
  const drawWidth = Math.max(1, Math.floor(framed.width * scale));
  const drawHeight = Math.max(1, Math.floor(framed.height * scale));
  const drawX = Math.round(boxX + (boxWidth - drawWidth) / 2);
  const drawY = Math.round(boxY + (boxHeight - drawHeight) / 2);

  ctx.save();

  if (options.shadowColor) {
    ctx.shadowColor = options.shadowColor;
    ctx.shadowBlur = 14;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
    ctx.fillRect(drawX + 1, drawY + 2, drawWidth, drawHeight);
    ctx.shadowBlur = 0;
  }

  if (options.backdropColor) {
    const pad = 3;
    ctx.fillStyle = options.backdropColor;
    ctx.fillRect(drawX - pad, drawY - pad, drawWidth + pad * 2, drawHeight + pad * 2);
    const glass = ctx.createLinearGradient(drawX, drawY - pad, drawX, drawY + drawHeight + pad);
    glass.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
    glass.addColorStop(0.28, 'rgba(255, 255, 255, 0.04)');
    glass.addColorStop(0.65, 'rgba(255, 255, 255, 0.00)');
    glass.addColorStop(1, 'rgba(0, 0, 0, 0.18)');
    ctx.fillStyle = glass;
    ctx.fillRect(drawX - pad, drawY - pad, drawWidth + pad * 2, drawHeight + pad * 2);
  }

  for (let targetY = 0; targetY < drawHeight; targetY++) {
    const sourceY = Math.min(framed.height - 1, Math.floor(targetY * framed.height / drawHeight));
    const rowData = framed.pixels[sourceY] ?? [];
    for (let targetX = 0; targetX < drawWidth; targetX++) {
      const sourceX = Math.min(framed.width - 1, Math.floor(targetX * framed.width / drawWidth));
      const idx = rowData[sourceX] ?? 0;
      if (idx === 0) continue;
      const color = framed.palette[idx];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(drawX + targetX, drawY + targetY, 1, 1);
    }
  }

  if (options.scanlines) {
    ctx.fillStyle = '#000';
    ctx.globalAlpha = 0.06;
    for (let row = 0; row < drawHeight; row += 3) {
      ctx.fillRect(drawX, drawY + row, drawWidth, 1);
    }
    ctx.globalAlpha = 0.025;
    for (let row = 1; row < drawHeight; row += 6) {
      ctx.fillRect(drawX, drawY + row, drawWidth, 1);
    }
  }

  if (options.frameColor) {
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
    ctx.strokeStyle = options.frameColor;
    ctx.strokeRect(drawX - 2, drawY - 2, drawWidth + 4, drawHeight + 4);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.strokeRect(drawX - 1, drawY - 1, drawWidth + 2, drawHeight + 2);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.58)';
    ctx.strokeRect(drawX, drawY, drawWidth, drawHeight);
  }

  ctx.restore();
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

  // ===== Move command preview — hovered character's special move inputs =====
  if (hoveredChar && hoveredChar.moveList && hoveredChar.moveList.length > 0) {
    const mlX = CANVAS_WIDTH / 2 + 130;
    const mlY = hoverY - 40;
    ctx.save();
    ctx.globalAlpha = Math.min(1, Math.max(0, (tick % 120) / 20)) * 0.85;
    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    roundRect(ctx, mlX - 8, mlY - 8, 170, hoveredChar.moveList.length * 16 + 26, 6);
    ctx.fill();
    ctx.strokeStyle = hoveredChar.color + '44';
    ctx.lineWidth = 1;
    roundRect(ctx, mlX - 8, mlY - 8, 170, hoveredChar.moveList.length * 16 + 26, 6);
    ctx.stroke();
    // "MOVES" header
    drawSNKText(ctx, 'MOVES', mlX + 75, mlY + 2, 10, hoveredChar.color);
    // Move entries
    ctx.textAlign = 'left';
    for (let mi = 0; mi < Math.min(hoveredChar.moveList.length, 8); mi++) {
      const mv = hoveredChar.moveList[mi];
      const entryY = mlY + 16 + mi * 16;
      // Move name
      ctx.fillStyle = '#ddd';
      ctx.font = '10px "Courier New", monospace';
      ctx.fillText(mv.name.substring(0, 10), mlX, entryY);
      // Input notation
      ctx.fillStyle = hoveredChar.color;
      ctx.font = '9px "Courier New", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(mv.input.substring(0, 14), mlX + 158, entryY);
      ctx.textAlign = 'left';
    }
    ctx.restore();
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

