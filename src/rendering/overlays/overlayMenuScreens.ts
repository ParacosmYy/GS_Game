/**
 * Menu screens — Title, Mode Select, Options, Mode/Stage indicators
 * Split from overlayScreens.ts
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants.js';
import { ROSTER } from '../../characters/index.js';
import { roundRect, drawSNKText } from '../utils.js';

// ===== Mode / Stage Indicators =====

export function drawModeIndicator(ctx: CanvasRenderingContext2D, simplifiedMode: boolean, alpha: number): void {
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.globalAlpha = Math.min(1, alpha);
  const label = simplifiedMode ? 'Simplified' : 'Standard';
  const bg = simplifiedMode ? 'rgba(0,180,80,0.85)' : 'rgba(60,60,100,0.85)';
  const border = simplifiedMode ? '#44ff88' : '#8888bb';
  const pw = 160, ph = 26, px = (CANVAS_WIDTH - pw) / 2, py = 52;
  ctx.fillStyle = bg; roundRect(ctx, px, py, pw, ph, 13); ctx.fill();
  ctx.strokeStyle = border; ctx.lineWidth = 1.5;
  roundRect(ctx, px, py, pw, ph, 13); ctx.stroke();
  ctx.font = 'bold 13px "Courier New", monospace'; ctx.fillStyle = '#fff';
  ctx.fillText(label, CANVAS_WIDTH / 2, py + ph / 2);
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawStageIndicator(ctx: CanvasRenderingContext2D, stageId: string, alpha: number): void {
  const names: Record<string, string> = { temple: '日本寺廟', china: '唐人街', factory: '工場', orochi: '大蛇神社', street: '街市夜市', rooftop: '日本屋上' };
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.globalAlpha = Math.min(1, alpha);
  const label = names[stageId] ?? stageId;
  const pw = 140, ph = 26, px = (CANVAS_WIDTH - pw) / 2, py = 82;
  ctx.fillStyle = 'rgba(60, 40, 20, 0.85)'; roundRect(ctx, px, py, pw, ph, 13); ctx.fill();
  ctx.strokeStyle = '#cc8844'; ctx.lineWidth = 1.5;
  roundRect(ctx, px, py, pw, ph, 13); ctx.stroke();
  ctx.font = 'bold 13px "Courier New", monospace'; ctx.fillStyle = '#ffcc88';
  ctx.fillText(label, CANVAS_WIDTH / 2, py + ph / 2);
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ===== Title Screen =====

export function drawTitle(ctx: CanvasRenderingContext2D, tick: number): void {
  ctx.save();

  // 背景 — 深蓝紫渐变 + 微妙脉动
  const bgPulse = 0.03 + Math.sin(tick * 0.01) * 0.01;
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  grad.addColorStop(0, '#0a0a22');
  grad.addColorStop(0.3, '#0f0f35');
  grad.addColorStop(0.7, '#0a0a28');
  grad.addColorStop(1, '#050515');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // KOF2002: 背景网格 — 暗色对角线网格模拟街机感
  ctx.strokeStyle = `rgba(60, 40, 80, ${bgPulse})`;
  ctx.lineWidth = 0.5;
  for (let i = -20; i < 30; i++) {
    const xOff = (tick * 0.15) % 40;
    ctx.beginPath();
    ctx.moveTo(i * 40 + xOff, 0);
    ctx.lineTo(i * 40 + xOff - CANVAS_HEIGHT, CANVAS_HEIGHT);
    ctx.stroke();
  }

  // 动态粒子 — 三层(远景慢/中景中/近景快)
  for (let layer = 0; layer < 3; layer++) {
    const count = 20 + layer * 10;
    const speed = 0.1 + layer * 0.12;
    const baseAlpha = 0.1 + layer * 0.05;
    const size = 0.5 + layer * 0.3;
    for (let i = 0; i < count; i++) {
      const seed = layer * 1000 + i;
      const x = ((seed * 137 + tick * speed) % CANVAS_WIDTH);
      const y = ((seed * 97 + tick * speed * 0.4) % CANVAS_HEIGHT);
      const flicker = Math.sin(tick * 0.04 + seed * 0.3) * 0.5 + 0.5;
      const a = baseAlpha + flicker * 0.1;
      // 不同层颜色: 远蓝/中橙/近黄
      const colors = ['rgba(100,120,255,', 'rgba(255,140,60,', 'rgba(255,220,100,'];
      ctx.fillStyle = colors[layer] + a + ')';
      ctx.beginPath();
      ctx.arc(x, y, size * flicker, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Logo下方能量火焰 — KOF标志性底部火焰效果
  const flameBaseY = 215;
  for (let f = 0; f < 30; f++) {
    const fx = CANVAS_WIDTH / 2 + (f - 15) * 20;
    const flameH = 15 + Math.sin(tick * 0.08 + f * 0.5) * 8 + Math.sin(tick * 0.12 + f * 0.3) * 5;
    const flameW = 12 + Math.sin(tick * 0.06 + f) * 3;
    const flameAlpha = 0.08 + Math.sin(tick * 0.1 + f * 0.4) * 0.04;
    const distFromCenter = Math.abs(f - 15) / 15;
    const flameGrad = ctx.createLinearGradient(fx, flameBaseY, fx, flameBaseY - flameH);
    flameGrad.addColorStop(0, `rgba(255, 80, 0, ${flameAlpha})`);
    flameGrad.addColorStop(0.4, `rgba(255, 160, 30, ${flameAlpha * 0.7})`);
    flameGrad.addColorStop(1, `rgba(255, 220, 80, 0)`);
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(fx - flameW / 2, flameBaseY);
    ctx.quadraticCurveTo(fx - flameW / 4, flameBaseY - flameH * 0.6, fx + Math.sin(tick * 0.15 + f) * 3, flameBaseY - flameH);
    ctx.quadraticCurveTo(fx + flameW / 4, flameBaseY - flameH * 0.6, fx + flameW / 2, flameBaseY);
    ctx.closePath();
    ctx.fill();
  }

  // Logo 辉光 — 双层径向渐变
  const logoGlow = ctx.createRadialGradient(CANVAS_WIDTH / 2, 155, 10, CANVAS_WIDTH / 2, 155, 250);
  logoGlow.addColorStop(0, 'rgba(255, 100, 0, 0.15)');
  logoGlow.addColorStop(0.3, 'rgba(255, 60, 0, 0.08)');
  logoGlow.addColorStop(0.7, 'rgba(200, 40, 0, 0.03)');
  logoGlow.addColorStop(1, 'rgba(255, 40, 0, 0)');
  ctx.fillStyle = logoGlow;
  ctx.fillRect(CANVAS_WIDTH / 2 - 250, 50, 500, 200);
  // 外层脉冲辉光
  const outerPulse = 0.04 + Math.sin(tick * 0.02) * 0.02;
  const outerGlow = ctx.createRadialGradient(CANVAS_WIDTH / 2, 155, 100, CANVAS_WIDTH / 2, 155, 350);
  outerGlow.addColorStop(0, `rgba(255, 100, 0, ${outerPulse})`);
  outerGlow.addColorStop(1, 'rgba(255, 40, 0, 0)');
  ctx.fillStyle = outerGlow;
  ctx.fillRect(CANVAS_WIDTH / 2 - 350, 0, 700, 350);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // "KOF" — 更大更醒目，金色渐变+双层shadow
  ctx.shadowColor = '#ff4400';
  ctx.shadowBlur = 40;
  drawSNKText(ctx, 'KOF', CANVAS_WIDTH / 2 - 80, 130, 64, '#ff8800');
  ctx.shadowBlur = 60;
  drawSNKText(ctx, 'KOF', CANVAS_WIDTH / 2 - 80, 130, 64, '#ff6600');
  ctx.shadowBlur = 0;

  // "2002" — 数字更大，右侧偏移
  ctx.shadowColor = '#ffaa00';
  ctx.shadowBlur = 30;
  drawSNKText(ctx, '2002', CANVAS_WIDTH / 2 + 80, 130, 56, '#ffcc44');
  ctx.shadowBlur = 0;

  // 副标题 — 风云再起
  ctx.shadowColor = '#cc8800';
  ctx.shadowBlur = 10;
  drawSNKText(ctx, '风云再起', CANVAS_WIDTH / 2, 185, 22, '#cc8844');
  ctx.shadowBlur = 0;

  // 装饰线 — 宽版+脉冲
  const linePulse = 0.6 + Math.sin(tick * 0.05) * 0.2;
  const lineGrad = ctx.createLinearGradient(CANVAS_WIDTH / 2 - 250, 0, CANVAS_WIDTH / 2 + 250, 0);
  lineGrad.addColorStop(0, '#ff440000');
  lineGrad.addColorStop(0.2, `rgba(255, 68, 0, ${0.5 * linePulse})`);
  lineGrad.addColorStop(0.5, `rgba(255, 204, 68, ${0.7 * linePulse})`);
  lineGrad.addColorStop(0.8, `rgba(255, 68, 0, ${0.5 * linePulse})`);
  lineGrad.addColorStop(1, '#ff440000');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2 - 250, 210);
  ctx.lineTo(CANVAS_WIDTH / 2 + 250, 210);
  ctx.stroke();
  // 第二条细线
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2 - 200, 213);
  ctx.lineTo(CANVAS_WIDTH / 2 + 200, 213);
  ctx.stroke();

  // Character silhouettes — 多行排列，不超出画布
  const SIL_COLS = 14;
  const SIL_SPACING_X = 38;
  const SIL_SPACING_Y = 42;
  const SIL_RADIUS = 10;
  const silStartY = 250;
  for (let i = 0; i < ROSTER.length; i++) {
    const row = Math.floor(i / SIL_COLS);
    const col = i % SIL_COLS;
    const colsInRow = Math.min(SIL_COLS, ROSTER.length - row * SIL_COLS);
    const rowW = colsInRow * SIL_SPACING_X;
    const sx = (CANVAS_WIDTH - rowW) / 2 + col * SIL_SPACING_X + SIL_SPACING_X / 2;
    const sy = silStartY + row * SIL_SPACING_Y;
    const bob = Math.sin(tick * 0.03 + i * 0.7) * 2;
    // 角色专属发光晕 — 每个角色独特颜色
    const glowAlpha = 0.15 + Math.sin(tick * 0.05 + i * 1.2) * 0.08;
    ctx.fillStyle = ROSTER[i].color + Math.round(glowAlpha * 255).toString(16).padStart(2, '0');
    ctx.beginPath();
    ctx.arc(sx, sy + bob, SIL_RADIUS + 4, 0, Math.PI * 2);
    ctx.fill();
    // 主体圆
    ctx.fillStyle = ROSTER[i].color + 'cc';
    ctx.beginPath();
    ctx.arc(sx, sy + bob, SIL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    // 中心高光
    ctx.fillStyle = ROSTER[i].accentColor + '66';
    ctx.beginPath();
    ctx.arc(sx, sy + bob - 2, SIL_RADIUS * 0.5, 0, Math.PI * 2);
    ctx.fill();
    // 角色名首字
    ctx.fillStyle = '#fff';
    ctx.font = '7px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ROSTER[i].nameCn[0], sx, sy + bob + 1);
  }

  // PRESS START — 脉冲发光+缩放效果
  const blinkVal = Math.sin(tick * 0.08) * 0.5 + 0.5;
  if (blinkVal > 0.2) {
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 15 + blinkVal * 10;
    ctx.globalAlpha = blinkVal;
    drawSNKText(ctx, 'PRESS START', CANVAS_WIDTH / 2, 375, 24, '#ffcc00');
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  // 底部能量条 — KOF风格扫描线
  const barY = CANVAS_HEIGHT - 20;
  const scanX = (tick * 3) % CANVAS_WIDTH;
  const scanGrad = ctx.createLinearGradient(scanX - 60, 0, scanX + 60, 0);
  scanGrad.addColorStop(0, 'rgba(255, 100, 0, 0)');
  scanGrad.addColorStop(0.5, 'rgba(255, 100, 0, 0.3)');
  scanGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');
  ctx.fillStyle = scanGrad;
  ctx.fillRect(0, barY, CANVAS_WIDTH, 2);
  ctx.fillStyle = 'rgba(255, 100, 0, 0.05)';
  ctx.fillRect(0, barY, CANVAS_WIDTH, 2);

  drawSNKText(ctx, 'J: Select  |  Enter: Mode Select  |  R: Restart', CANVAS_WIDTH / 2, 425, 11, '#444455');
  drawSNKText(ctx, 'Tab: Simplified mode  |  N: Change stage  |  F1: Debug  |  M: Music  |  B: BGM', CANVAS_WIDTH / 2, 545, 10, '#333344');
  drawSNKText(ctx, 'HTML5 Canvas + TypeScript', CANVAS_WIDTH / 2, 565, 10, '#333344');

  ctx.restore();
}

// ===== Mode Select Screen =====

export function drawModeSelect(ctx: CanvasRenderingContext2D, tick: number, cursor: number): void {
  ctx.save();

  // Background — dark with subtle pattern
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  grad.addColorStop(0, '#08081a');
  grad.addColorStop(0.5, '#0c0c28');
  grad.addColorStop(1, '#060614');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Animated particles
  for (let i = 0; i < 40; i++) {
    const x = ((i * 137 + tick * 0.2) % CANVAS_WIDTH);
    const y = ((i * 97 + tick * 0.08) % CANVAS_HEIGHT);
    const a = 0.15 + Math.sin(tick * 0.03 + i * 0.5) * 0.1;
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.beginPath();
    ctx.arc(x, y, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Title
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.shadowColor = '#ff6600';
  ctx.shadowBlur = 20;
  drawSNKText(ctx, 'SELECT MODE', CANVAS_WIDTH / 2, 100, 40, '#ffcc00');
  ctx.shadowBlur = 0;

  // Decorative line
  const lineGrad = ctx.createLinearGradient(CANVAS_WIDTH / 2 - 200, 0, CANVAS_WIDTH / 2 + 200, 0);
  lineGrad.addColorStop(0, '#ff440000');
  lineGrad.addColorStop(0.3, '#ff440088');
  lineGrad.addColorStop(0.5, '#ffcc4466');
  lineGrad.addColorStop(0.7, '#ff440088');
  lineGrad.addColorStop(1, '#ff440000');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2 - 200, 130);
  ctx.lineTo(CANVAS_WIDTH / 2 + 200, 130);
  ctx.stroke();

  // Mode cards
  const modes = [
    { label: 'SINGLE BATTLE', labelCn: '单人模式', desc: '1P vs CPU/AI — Best of 3 rounds', color: '#ff4444' },
    { label: 'TEAM BATTLE', labelCn: '组队模式 3v3', desc: '3v3 Team KOF — KO switches to next fighter', color: '#4488ff' },
    { label: 'TRAINING', labelCn: '训练模式', desc: 'Free practice — Input display & frame data', color: '#44cc44' },
    { label: 'OPTIONS', labelCn: '设置', desc: 'Difficulty / Rounds / Time / Display', color: '#aa88ff' },
  ];

  const cardW = 160;
  const cardH = 160;
  const gap = 18;
  const startX = (CANVAS_WIDTH - (modes.length * cardW + (modes.length - 1) * gap)) / 2;
  const cardY = 180;

  for (let i = 0; i < modes.length; i++) {
    const mode = modes[i];
    const cx = startX + i * (cardW + gap);
    const isSelected = cursor === i;

    // Card background
    const cardGrad = ctx.createLinearGradient(cx, cardY, cx, cardY + cardH);
    cardGrad.addColorStop(0, '#14142e');
    cardGrad.addColorStop(1, '#0e0e20');
    ctx.fillStyle = cardGrad;
    roundRect(ctx, cx, cardY, cardW, cardH, 12);
    ctx.fill();

    // Selection highlight
    if (isSelected) {
      const pulse = 0.5 + Math.sin(tick * 0.1) * 0.3;
      ctx.strokeStyle = mode.color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = pulse;
      roundRect(ctx, cx - 4, cardY - 4, cardW + 8, cardH + 8, 14);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Glow
      const glowGrad = ctx.createRadialGradient(cx + cardW / 2, cardY + cardH / 2, 10, cx + cardW / 2, cardY + cardH / 2, cardW * 0.6);
      glowGrad.addColorStop(0, mode.color + '15');
      glowGrad.addColorStop(1, mode.color + '00');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(cx, cardY, cardW, cardH);
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      roundRect(ctx, cx, cardY, cardW, cardH, 12);
      ctx.stroke();
    }

    // Mode icon — per-mode unique icon
    const iconColor = mode.color + (isSelected ? 'cc' : '44');
    const iconCx = cx + cardW / 2;
    const iconCy = cardY + 55;

    if (i === 0) {
      // Single — single circle
      ctx.fillStyle = iconColor;
      ctx.beginPath();
      ctx.arc(iconCx, iconCy, 25, 0, Math.PI * 2);
      ctx.fill();
    } else if (i === 1) {
      // Team — three circles
      ctx.fillStyle = iconColor;
      ctx.beginPath();
      for (let j = -1; j <= 1; j++) {
        ctx.moveTo(iconCx + j * 22 + 12, iconCy);
        ctx.arc(iconCx + j * 22, iconCy, 12, 0, Math.PI * 2);
      }
      ctx.fill();
    } else if (i === 2) {
      // Training — crosshair
      ctx.strokeStyle = iconColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(iconCx, iconCy, 20, 0, Math.PI * 2);
      ctx.moveTo(iconCx - 28, iconCy);
      ctx.lineTo(iconCx + 28, iconCy);
      ctx.moveTo(iconCx, iconCy - 28);
      ctx.lineTo(iconCx, iconCy + 28);
      ctx.stroke();
    } else if (i === 3) {
      // Options — gear (hexagon with inner circle)
      ctx.strokeStyle = iconColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let t = 0; t < 6; t++) {
        const angle = (t / 6) * Math.PI * 2 - Math.PI / 2;
        const gx = iconCx + Math.cos(angle) * 22;
        const gy = iconCy + Math.sin(angle) * 22;
        if (t === 0) ctx.moveTo(gx, gy);
        else ctx.lineTo(gx, gy);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(iconCx, iconCy, 10, 0, Math.PI * 2);
      ctx.stroke();
      // Gear teeth
      for (let t = 0; t < 6; t++) {
        const angle = (t / 6) * Math.PI * 2 - Math.PI / 2;
        const tx = iconCx + Math.cos(angle) * 26;
        const ty = iconCy + Math.sin(angle) * 26;
        ctx.beginPath();
        ctx.arc(tx, ty, 4, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Mode label
    drawSNKText(ctx, mode.label, cx + cardW / 2, cardY + 100, 18, isSelected ? mode.color : '#888888');
    drawSNKText(ctx, mode.labelCn, cx + cardW / 2, cardY + 125, 14, isSelected ? '#ffffff' : '#666666');

    // Description
    ctx.font = '11px monospace';
    ctx.fillStyle = '#555566';
    ctx.fillText(mode.desc, cx + cardW / 2, cardY + 155);
  }

  // Instructions
  drawSNKText(ctx, 'A/D or Arrow Keys: Select  |  Enter/J: Confirm', CANVAS_WIDTH / 2, 420, 12, '#444455');

  ctx.restore();
}

// ===== Options Screen =====

export interface GameOptions {
  difficulty: 0 | 1 | 2;     // 0=Easy, 1=Normal, 2=Hard
  roundsToWin: 1 | 2 | 3;   // best-of: 1/3/5
  timeLimit: 30 | 60 | 99 | 0; // 0=∞
  crtEnabled: boolean;
  simplifiedMode: boolean;
}

export const DEFAULT_OPTIONS: GameOptions = {
  difficulty: 1,
  roundsToWin: 2,
  timeLimit: 60,
  crtEnabled: true,
  simplifiedMode: false,
};

const DIFFICULTY_LABELS = ['EASY', 'NORMAL', 'HARD'];
const ROUNDS_LABELS = ['1 ROUND', 'BEST OF 3', 'BEST OF 5'];
const TIME_LABELS = ['30 SEC', '60 SEC', '99 SEC', 'INFINITE'];

export function drawOptionsScreen(
  ctx: CanvasRenderingContext2D,
  tick: number,
  cursor: number,
  options: GameOptions,
): void {
  ctx.save();

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  bg.addColorStop(0, '#08081a');
  bg.addColorStop(0.5, '#0c0c28');
  bg.addColorStop(1, '#060614');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Animated particles
  for (let i = 0; i < 20; i++) {
    const x = ((i * 137 + tick * 0.15) % CANVAS_WIDTH);
    const y = ((i * 97 + tick * 0.06) % CANVAS_HEIGHT);
    const a = 0.1 + Math.sin(tick * 0.02 + i) * 0.08;
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.beginPath();
    ctx.arc(x, y, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Title
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#ff6600';
  ctx.shadowBlur = 20;
  drawSNKText(ctx, 'OPTIONS', CANVAS_WIDTH / 2, 60, 36, '#ffcc00');
  ctx.shadowBlur = 0;

  // Decorative line
  const lineGrad = ctx.createLinearGradient(CANVAS_WIDTH / 2 - 180, 0, CANVAS_WIDTH / 2 + 180, 0);
  lineGrad.addColorStop(0, '#ff440000');
  lineGrad.addColorStop(0.3, '#ff440088');
  lineGrad.addColorStop(0.5, '#ffcc4466');
  lineGrad.addColorStop(0.7, '#ff440088');
  lineGrad.addColorStop(1, '#ff440000');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2 - 180, 85);
  ctx.lineTo(CANVAS_WIDTH / 2 + 180, 85);
  ctx.stroke();

  // Settings entries
  const settings = [
    { label: 'DIFFICULTY', value: DIFFICULTY_LABELS[options.difficulty], color: '#ff8844' },
    { label: 'ROUNDS', value: ROUNDS_LABELS[options.roundsToWin], color: '#4488ff' },
    { label: 'TIME LIMIT', value: TIME_LABELS[TIME_LABELS.indexOf(TIME_LABELS.find((_, i) => [30,60,99,0][i] === options.timeLimit) ?? '60 SEC')], color: '#44cc44' },
    { label: 'CRT FILTER', value: options.crtEnabled ? 'ON' : 'OFF', color: '#aa88ff' },
    { label: 'SIMPLIFIED MODE', value: options.simplifiedMode ? 'ON' : 'OFF', color: '#ffcc44' },
  ];

  const startY = 120;
  const lineH = 52;

  for (let i = 0; i < settings.length; i++) {
    const s = settings[i];
    const y = startY + i * lineH;
    const isSelected = cursor === i;

    // Row background
    if (isSelected) {
      const rowBg = ctx.createLinearGradient(CANVAS_WIDTH * 0.15, y, CANVAS_WIDTH * 0.85, y);
      rowBg.addColorStop(0, 'rgba(255, 215, 0, 0)');
      rowBg.addColorStop(0.2, 'rgba(255, 215, 0, 0.06)');
      rowBg.addColorStop(0.8, 'rgba(255, 215, 0, 0.06)');
      rowBg.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = rowBg;
      ctx.fillRect(CANVAS_WIDTH * 0.15, y, CANVAS_WIDTH * 0.7, lineH - 4);

      // Left accent bar
      ctx.fillStyle = s.color;
      ctx.fillRect(CANVAS_WIDTH * 0.15, y, 3, lineH - 4);
    }

    // Setting label
    ctx.font = isSelected ? 'bold 16px "Courier New", monospace' : '15px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = isSelected ? '#ffffff' : '#777';
    ctx.fillText(s.label, CANVAS_WIDTH * 0.22, y + lineH / 2 - 2);

    // Value — with ← value → arrows when selected
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.fillStyle = isSelected ? s.color : '#555';
    const valX = CANVAS_WIDTH * 0.68;
    if (isSelected) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '14px "Courier New", monospace';
      ctx.fillText('◄', valX - 60, y + lineH / 2 - 2);
      ctx.fillText('►', valX + 60, y + lineH / 2 - 2);
      ctx.font = 'bold 16px "Courier New", monospace';
      ctx.fillStyle = s.color;
    }
    ctx.fillText(s.value, valX, y + lineH / 2 - 2);
  }

  // Back button
  const backY = startY + settings.length * lineH + 20;
  const isBackSelected = cursor === settings.length;
  ctx.font = isBackSelected ? 'bold 18px "Courier New", monospace' : '16px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = isBackSelected ? '#ffcc00' : '#555';
  ctx.fillText('◄ BACK', CANVAS_WIDTH / 2, backY);

  // Footer instructions
  ctx.font = '11px "Courier New", monospace';
  ctx.fillStyle = '#444455';
  ctx.fillText('↑ ↓ : Select  |  ← → : Change  |  Enter : Back', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30);

  ctx.restore();
}
