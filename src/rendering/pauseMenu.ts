/**
 * Pause Menu — KOF2002 风格暂停菜单
 *
 * 按Escape暂停,显示招式列表/按键说明/设置
 * 半透明暗色覆盖层,冻结战斗画面
 */
import type { CharacterDefinition } from '../characters/types.js';

const MENU_ITEMS = ['MOVE LIST', 'CONTROLS', 'RESUME'] as const;
const TAB_ITEMS: Array<'moves' | 'controls' | 'settings'> = ['moves', 'controls', 'settings'];

// KOF2002 color palette
const COLORS = {
  bg: 'rgba(0, 0, 0, 0.82)',
  border: '#FFD700',
  borderDim: '#8B7500',
  text: '#FFFFFF',
  textDim: '#888888',
  highlight: '#FFD700',
  accent: '#FF6600',
  panelBg: 'rgba(20, 15, 40, 0.95)',
  moveName: '#FFD700',
  moveCmd: '#AACCFF',
  moveCategory: '#88FF88',
  headerBg: 'rgba(255, 215, 0, 0.15)',
};

export function drawPauseMenu(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  cursor: number,
  tab: 'moves' | 'controls' | 'settings',
  p1Char: CharacterDefinition | null,
  p2Char: CharacterDefinition | null,
): void {
  // Dark overlay
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, canvasW, canvasH);

  const menuW = Math.min(800, canvasW - 40);
  const menuH = Math.min(560, canvasH - 40);
  const menuX = (canvasW - menuW) / 2;
  const menuY = (canvasH - menuH) / 2;

  // Panel background
  ctx.fillStyle = COLORS.panelBg;
  ctx.fillRect(menuX, menuY, menuW, menuH);

  // Gold border
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(menuX, menuY, menuW, menuH);

  // Header
  const headerH = 48;
  ctx.fillStyle = COLORS.headerBg;
  ctx.fillRect(menuX, menuY, menuW, headerH);
  ctx.strokeStyle = COLORS.borderDim;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(menuX, menuY + headerH);
  ctx.lineTo(menuX + menuW, menuY + headerH);
  ctx.stroke();

  // "PAUSED" title
  ctx.font = 'bold 28px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = COLORS.highlight;
  ctx.fillText('PAUSED', menuX + menuW / 2, menuY + headerH / 2);

  // Tab bar
  const tabBarY = menuY + headerH + 12;
  const tabW = menuW / 3;
  for (let i = 0; i < 3; i++) {
    const tx = menuX + i * tabW;
    const isActive = cursor === i || tab === TAB_ITEMS[i];
    ctx.fillStyle = isActive ? 'rgba(255, 215, 0, 0.2)' : 'transparent';
    ctx.fillRect(tx, tabBarY, tabW, 32);
    ctx.font = isActive ? 'bold 14px "Courier New", monospace' : '14px "Courier New", monospace';
    ctx.fillStyle = isActive ? COLORS.highlight : COLORS.textDim;
    ctx.fillText(MENU_ITEMS[i], tx + tabW / 2, tabBarY + 16);
    if (isActive) {
      ctx.strokeStyle = COLORS.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tx, tabBarY + 32);
      ctx.lineTo(tx + tabW, tabBarY + 32);
      ctx.stroke();
    }
  }

  // Content area
  const contentY = tabBarY + 44;
  const contentH = menuH - (contentY - menuY) - 50; // Leave space for footer
  ctx.save();
  ctx.beginPath();
  ctx.rect(menuX + 10, contentY, menuW - 20, contentH);
  ctx.clip();

  if (tab === 'moves') {
    drawMoveList(ctx, menuX + 10, contentY, menuW - 20, contentH, p1Char);
  } else if (tab === 'controls') {
    drawControls(ctx, menuX + 10, contentY, menuW - 20);
  } else {
    drawSettings(ctx, menuX + 10, contentY, menuW - 20);
  }

  ctx.restore();

  // Footer — navigation hint
  const footerY = menuY + menuH - 36;
  ctx.font = '12px "Courier New", monospace';
  ctx.fillStyle = COLORS.textDim;
  ctx.textAlign = 'center';
  ctx.fillText('← → : Switch Tab  |  ↑ ↓ : Scroll  |  ESC : Resume', menuX + menuW / 2, footerY + 10);
}

function drawMoveList(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  _h: number,
  charDef: CharacterDefinition | null,
): void {
  if (!charDef || !charDef.moveList) {
    ctx.font = '16px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.textDim;
    ctx.fillText('No move data available', x + w / 2, y + 30);
    return;
  }

  const moves = charDef.moveList;
  let cy = y + 8;
  const lineH = 22;

  // Character name header
  ctx.font = 'bold 16px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = COLORS.accent;
  ctx.fillText(`${charDef.name} - ${charDef.nameCn}`, x + 8, cy);
  cy += lineH + 4;

  // Separator
  ctx.strokeStyle = COLORS.borderDim;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(x, cy);
  ctx.lineTo(x + w, cy);
  ctx.stroke();
  cy += 8;

  for (const move of moves) {
    if (cy > y + _h - 10) break;

    // Category color
    const catType = move.type ?? 'normal';
    const catColor = catType === 'special' ? COLORS.moveCategory :
                     catType === 'dm' ? '#FF6666' :
                     catType === 'sdm' ? '#FF44FF' :
                     catType === 'hsdm' ? '#FFFF44' :
                     catType === 'system' ? '#88FFFF' :
                     COLORS.textDim;

    // Move name
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = COLORS.moveName;
    ctx.fillText(move.name, x + 8, cy);

    // Command notation
    ctx.font = '12px "Courier New", monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = COLORS.moveCmd;
    ctx.fillText(move.input, x + w * 0.7, cy);

    // Category tag
    ctx.font = '10px "Courier New", monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = catColor;
    ctx.fillText(catType.toUpperCase(), x + w - 8, cy);

    cy += lineH;
  }
}

function drawControls(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
): void {
  let cy = y + 8;
  const lineH = 22;

  const controls = [
    { label: 'P1 Movement', keys: 'W A S D' },
    { label: 'P1 Light Punch (A)', keys: 'J' },
    { label: 'P1 Light Kick (B)', keys: 'K' },
    { label: 'P1 Strong Punch (C)', keys: 'U' },
    { label: 'P1 Strong Kick (D)', keys: 'I' },
    { label: 'P1 Throw', keys: 'L' },
    { label: 'P1 MAX/Burst', keys: 'O' },
    { label: '', keys: '' },
    { label: 'P2 Movement', keys: '↑ ← ↓ →' },
    { label: 'P2 Light Punch (A)', keys: 'Numpad 1' },
    { label: 'P2 Light Kick (B)', keys: 'Numpad 2' },
    { label: 'P2 Strong Punch (C)', keys: 'Numpad 3' },
    { label: 'P2 Strong Kick (D)', keys: 'Numpad 4' },
    { label: 'P2 Throw', keys: 'Numpad 0' },
    { label: 'P2 MAX/Burst', keys: 'Numpad .' },
    { label: '', keys: '' },
    { label: 'Pause / Resume', keys: 'Escape' },
    { label: 'Start', keys: 'P (P1) / Numpad 9 (P2)' },
  ];

  for (const c of controls) {
    if (!c.label) { cy += lineH / 2; continue; }
    ctx.font = '13px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = COLORS.text;
    ctx.fillText(c.label, x + 8, cy);
    ctx.textAlign = 'right';
    ctx.fillStyle = COLORS.moveCmd;
    ctx.fillText(c.keys, x + w - 8, cy);
    cy += lineH;
  }
}

function drawSettings(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  _w: number,
): void {
  let cy = y + 8;
  const lineH = 26;

  const settings = [
    { label: 'Training Mode', desc: 'Health regen + input display (select from MODE)' },
    { label: 'Debug Mode', desc: 'Show hitboxes + frame data overlay' },
    { label: 'Simplified Mode', desc: 'Reduced motion inputs for beginners' },
    { label: '', desc: '' },
    { label: 'Version', desc: 'KOF2002 Wind & Cloud Revival - Fan Project' },
  ];

  for (const s of settings) {
    if (!s.label) { cy += lineH / 2; continue; }
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = COLORS.moveName;
    ctx.fillText(s.label, x + 8, cy);
    ctx.font = '11px "Courier New", monospace';
    ctx.fillStyle = COLORS.textDim;
    ctx.fillText(s.desc, x + 8, cy + 16);
    cy += lineH;
  }
}
