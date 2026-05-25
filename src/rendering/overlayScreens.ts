/**
 * Overlay screens — Super Flash, Match End, Title, Continue, Mode/Stage indicators
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/constants.js';
import { ROSTER } from '../characters/index.js';
import { roundRect, drawSNKText } from './utils.js';
import { drawPixelPortrait } from './pixelPortraits.js';

// ===== Super Flash =====

export function drawSuperFlash(
  ctx: CanvasRenderingContext2D, timer: number,
  flashScreenX: number, flashScreenY: number,
  flashType: 'DM' | 'SDM' = 'DM',
): void {
  ctx.save();
  // KOF2002 Super Flash 4阶段: FLASH(24-19) → DARKEN(18-13) → HOLD(12-5) → RELEASE(4-0)
  const isSDM = flashType === 'SDM';
  const isFlash = timer > 19;
  const isDarken = timer > 13;
  const isHold = timer > 4;

  // Phase 1: FLASH — 全屏白/金色闪烁 (帧24-20)
  if (isFlash) {
    const flashT = (timer - 19) / 5;
    const flashAlpha = flashT * 0.95;
    ctx.fillStyle = isSDM
      ? `rgba(255, 200, 100, ${flashAlpha})`
      : `rgba(255, 255, 255, ${flashAlpha})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // Phase 2: DARKEN — 背景变暗 (帧18起, 持续)
  if (isDarken) {
    const darkT = Math.min(1, (timer - 13) / 6);
    const alpha = 0.7 * darkT;
    ctx.fillStyle = isSDM ? `rgba(80, 0, 0, ${alpha})` : `rgba(0, 0, 80, ${alpha})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // Phase 2-3: 角色周围爆发光晕
  if (timer > 14) {
    const burstAlpha = Math.min(1, (timer - 14) / 4) * 0.9;
    const flashGrad = ctx.createRadialGradient(flashScreenX, flashScreenY, 0, flashScreenX, flashScreenY, 180);
    if (isSDM) {
      flashGrad.addColorStop(0, `rgba(255, 220, 160, ${burstAlpha})`);
      flashGrad.addColorStop(0.2, `rgba(255, 160, 50, ${burstAlpha * 0.7})`);
      flashGrad.addColorStop(0.5, `rgba(255, 80, 20, ${burstAlpha * 0.3})`);
      flashGrad.addColorStop(1, `rgba(255, 60, 10, 0)`);
    } else {
      flashGrad.addColorStop(0, `rgba(255, 255, 220, ${burstAlpha})`);
      flashGrad.addColorStop(0.2, `rgba(255, 230, 100, ${burstAlpha * 0.7})`);
      flashGrad.addColorStop(0.5, `rgba(255, 200, 50, ${burstAlpha * 0.3})`);
      flashGrad.addColorStop(1, `rgba(255, 180, 30, 0)`);
    }
    ctx.fillStyle = flashGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // 持久光晕 — HOLD阶段核心光球
  if (isHold) {
    const holdT = (timer - 4) / 16;
    const glowAlpha = holdT * 0.5;
    const glowSize = 90 + (1 - holdT) * 50;
    const glowGrad = ctx.createRadialGradient(flashScreenX, flashScreenY, 0, flashScreenX, flashScreenY, glowSize);
    if (isSDM) {
      glowGrad.addColorStop(0, `rgba(255, 160, 60, ${glowAlpha})`);
      glowGrad.addColorStop(0.4, `rgba(255, 100, 30, ${glowAlpha * 0.4})`);
      glowGrad.addColorStop(1, 'rgba(255, 80, 20, 0)');
    } else {
      glowGrad.addColorStop(0, `rgba(255, 255, 100, ${glowAlpha})`);
      glowGrad.addColorStop(0.4, `rgba(255, 200, 50, ${glowAlpha * 0.4})`);
      glowGrad.addColorStop(1, 'rgba(255, 200, 50, 0)');
    }
    ctx.fillStyle = glowGrad;
    ctx.fillRect(flashScreenX - 200, flashScreenY - 200, 400, 400);
  }

  // Ground shockwave ring
  if (timer > 8 && timer < 18) {
    const ringProgress = (18 - timer) / 10;
    const ringRadius = (1 - ringProgress) * 200;
    const ringAlpha = ringProgress * 0.5;
    ctx.strokeStyle = isSDM ? `rgba(255, 100, 30, ${ringAlpha})` : `rgba(255, 220, 80, ${ringAlpha})`;
    ctx.lineWidth = 3 * ringProgress;
    ctx.beginPath();
    ctx.ellipse(flashScreenX, flashScreenY + 40, ringRadius, ringRadius * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Radiating energy lines — 16 lines
  if (timer > 10) {
    const lineT = (timer - 10) / 14;
    const lineAlpha = lineT * 0.3;
    ctx.strokeStyle = isSDM ? `rgba(255, 180, 60, ${lineAlpha})` : `rgba(255, 255, 100, ${lineAlpha})`;
    ctx.lineWidth = 2;
    for (let a = 0; a < 16; a++) {
      const angle = (a / 16) * Math.PI * 2 + timer * 0.1;
      const len = 60 + lineT * 100;
      ctx.beginPath();
      ctx.moveTo(flashScreenX + Math.cos(angle) * 20, flashScreenY + Math.sin(angle) * 20);
      ctx.lineTo(flashScreenX + Math.cos(angle) * len, flashScreenY + Math.sin(angle) * len);
      ctx.stroke();
    }
    // Inner ring
    ctx.lineWidth = 1.5;
    for (let a = 0; a < 8; a++) {
      const angle = (a / 8) * Math.PI * 2 - timer * 0.15;
      const len = 30 + lineT * 40;
      ctx.beginPath();
      ctx.moveTo(flashScreenX + Math.cos(angle) * 15, flashScreenY + Math.sin(angle) * 15);
      ctx.lineTo(flashScreenX + Math.cos(angle) * len, flashScreenY + Math.sin(angle) * len);
      ctx.stroke();
    }
  }

  // Floating energy particles

  // KOF2002: 速度线 — DM发动时从角色向外辐射的直线
  if (timer > 12) {
    const speedLineT = (timer - 12) / 12;
    const lineAlpha = speedLineT * 0.2;
    ctx.save();
    ctx.strokeStyle = isSDM ? `rgba(255, 200, 100, ${lineAlpha})` : `rgba(255, 255, 200, ${lineAlpha})`;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const innerR = 30 + (1 - speedLineT) * 20;
      const outerR = 200 + (1 - speedLineT) * 150;
      ctx.beginPath();
      ctx.moveTo(flashScreenX + Math.cos(angle) * innerR, flashScreenY + Math.sin(angle) * innerR);
      ctx.lineTo(flashScreenX + Math.cos(angle) * outerR, flashScreenY + Math.sin(angle) * outerR);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (timer > 5) {
    const particleAlpha = Math.min(1, (timer - 5) / 10) * 0.8;
    for (let p = 0; p < 8; p++) {
      const pAngle = (p / 8) * Math.PI * 2 + timer * 0.2 + p * 0.5;
      const pDist = 40 + timer * 2 + p * 5;
      const px = flashScreenX + Math.cos(pAngle) * pDist;
      const py = flashScreenY + Math.sin(pAngle) * pDist * 0.6;
      const pSize = 2 + Math.sin(timer * 0.3 + p) * 1;
      ctx.fillStyle = isSDM ? `rgba(255, 160, 60, ${particleAlpha})` : `rgba(255, 240, 120, ${particleAlpha})`;
      ctx.beginPath();
      ctx.arc(px, py, pSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

// ===== Match End =====

export function drawMatchEnd(
  ctx: CanvasRenderingContext2D,
  winner: number | null,
  p1Wins: number,
  p2Wins: number,
  winQuote?: string,
  winnerColor?: string,
  tick?: number,
  winnerCharId?: string,
): void {
  ctx.save();

  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Winner portrait
  if (winner !== null && winnerCharId) {
    const charDef = ROSTER.find(c => c.id === winnerCharId);
    if (charDef?.pixelPortrait) {
      const portraitScale = 3;
      const pw = charDef.pixelPortrait.width * portraitScale;
      const ph = charDef.pixelPortrait.height * portraitScale;
      const px = CANVAS_WIDTH / 2 - pw / 2;
      const py = 40;
      // Portrait background frame
      ctx.fillStyle = 'rgba(20, 20, 40, 0.8)';
      roundRect(ctx, px - 8, py - 8, pw + 16, ph + 16, 8);
      ctx.fill();
      ctx.strokeStyle = winnerColor ?? '#FFD700';
      ctx.lineWidth = 2;
      roundRect(ctx, px - 8, py - 8, pw + 16, ph + 16, 8);
      ctx.stroke();
      drawPixelPortrait(ctx, charDef.pixelPortrait, px, py, portraitScale);
    }
  }

  const textOffsetY = (winner !== null && winnerCharId) ? 190 : 0;

  ctx.shadowColor = '#ff8800';
  ctx.shadowBlur = 25;
  drawSNKText(ctx, 'GAME', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80 + textOffsetY, 72, '#FFD700');
  ctx.shadowBlur = 0;

  if (winner !== null) {
    const wColor = winner === 0 ? '#ff6644' : '#4488ff';
    drawSNKText(ctx, `P${winner + 1} WINS THE MATCH`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20 + textOffsetY, 32, wColor);
    // Winner name
    if (winnerCharId) {
      const charDef = ROSTER.find(c => c.id === winnerCharId);
      if (charDef) {
        drawSNKText(ctx, charDef.nameCn, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 12 + textOffsetY, 20, wColor);
      }
    }
  } else {
    drawSNKText(ctx, 'DRAW GAME', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20 + textOffsetY, 32, '#ffcc00');
  }

  if (winQuote && winnerColor) {
    ctx.shadowColor = winnerColor;
    ctx.shadowBlur = 8;
    const chars = Math.min(winQuote.length, Math.floor((tick || 0) / 3));
    const visible = winQuote.substring(0, chars);
    drawSNKText(ctx, `"${visible}"`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 45 + textOffsetY, 16, winnerColor);
    ctx.shadowBlur = 0;
  }

  // Win markers
  const dotY = CANVAS_HEIGHT / 2 + 80 + textOffsetY;
  const dotSpacing = 22;
  for (let i = 0; i < p1Wins; i++) {
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2 - 50 + i * dotSpacing, dotY, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6644';
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  for (let i = 0; i < p2Wins; i++) {
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2 + 50 - i * dotSpacing, dotY, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#4488ff';
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawSNKText(ctx, 'VS', CANVAS_WIDTH / 2, dotY, 16, 'rgba(255,255,255,0.2)');
  drawSNKText(ctx, 'Press any key to continue', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 120, 13, 'rgba(255,255,255,0.5)');

  ctx.restore();
}

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
  const names: Record<string, string> = { temple: '日本寺廟', china: '唐人街', factory: '工場' };
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

  drawSNKText(ctx, 'Enter / J / R to start', CANVAS_WIDTH / 2, 425, 11, '#444455');
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
  ];

  const cardW = 195;
  const cardH = 180;
  const gap = 25;
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

    // Mode icon
    ctx.fillStyle = mode.color + (isSelected ? 'cc' : '44');
    ctx.beginPath();
    if (i === 0) {
      // Single icon — circle
      ctx.arc(cx + cardW / 2, cardY + 55, 25, 0, Math.PI * 2);
    } else {
      // Team icon — three circles
      for (let j = -1; j <= 1; j++) {
        ctx.moveTo(cx + cardW / 2 + j * 22 + 12, cardY + 55);
        ctx.arc(cx + cardW / 2 + j * 22, cardY + 55, 12, 0, Math.PI * 2);
      }
    }
    ctx.fill();

    // Mode label
    drawSNKText(ctx, mode.label, cx + cardW / 2, cardY + 100, 18, isSelected ? mode.color : '#888888');
    drawSNKText(ctx, mode.labelCn, cx + cardW / 2, cardY + 125, 14, isSelected ? '#ffffff' : '#666666');

    // Description
    ctx.font = '11px monospace';
    ctx.fillStyle = '#555566';
    ctx.fillText(mode.desc, cx + cardW / 2, cardY + 155);

    // Coming soon overlay for training mode icon
    if (i === 2) {
      // Training icon — crosshair
      ctx.strokeStyle = mode.color + (isSelected ? 'cc' : '44');
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx + cardW / 2, cardY + 55, 20, 0, Math.PI * 2);
      ctx.moveTo(cx + cardW / 2 - 28, cardY + 55);
      ctx.lineTo(cx + cardW / 2 + 28, cardY + 55);
      ctx.moveTo(cx + cardW / 2, cardY + 55 - 28);
      ctx.lineTo(cx + cardW / 2, cardY + 55 + 28);
      ctx.stroke();
    }
  }

  // Instructions
  drawSNKText(ctx, 'A/D or Arrow Keys: Select  |  Enter/J: Confirm', CANVAS_WIDTH / 2, 420, 12, '#444455');

  ctx.restore();
}

// ===== Continue Screen =====

export function drawContinue(ctx: CanvasRenderingContext2D, secondsLeft: number, cursorYes: boolean): void {
  ctx.save();

  ctx.fillStyle = 'rgba(0,0,0,0.88)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // KOF2002: 红色脉冲背景 — 倒计时紧迫感
  const pulseAlpha = secondsLeft <= 3 ? 0.15 + Math.sin(Date.now() * 0.01) * 0.1 : 0.05;
  ctx.fillStyle = `rgba(80, 0, 0, ${pulseAlpha})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.shadowColor = '#ff2222';
  ctx.shadowBlur = 25;
  drawSNKText(ctx, 'CONTINUE?', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80, 48, '#ff4444');
  ctx.shadowBlur = 0;

  // 倒计时数字 — 最后3秒脉动效果
  const isUrgent = secondsLeft <= 3;
  const countColor = isUrgent ? '#ff2222' : '#ffcc00';
  const countScale = isUrgent ? 1 + Math.sin(Date.now() * 0.015) * 0.1 : 1;
  const countSize = Math.round(72 * countScale);
  ctx.shadowColor = isUrgent ? '#ff0000' : '#ffaa00';
  ctx.shadowBlur = isUrgent ? 20 : 12;
  drawSNKText(ctx, `${secondsLeft}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10, countSize, countColor);
  ctx.shadowBlur = 0;

  // 进度条 — 可视化倒计时剩余
  const barW = 300;
  const barH = 6;
  const barX = CANVAS_WIDTH / 2 - barW / 2;
  const barY = CANVAS_HEIGHT / 2 + 55;
  const ratio = secondsLeft / 10;
  ctx.fillStyle = 'rgba(40, 40, 60, 0.8)';
  roundRect(ctx, barX, barY, barW, barH, 3);
  ctx.fill();
  const barColor = isUrgent ? '#ff2222' : '#ffcc00';
  ctx.fillStyle = barColor;
  roundRect(ctx, barX, barY, barW * ratio, barH, 3);
  ctx.fill();

  const yesX = CANVAS_WIDTH / 2 - 80;
  const noX = CANVAS_WIDTH / 2 + 80;
  const selY = CANVAS_HEIGHT / 2 + 90;

  if (cursorYes) {
    ctx.shadowColor = '#44ff44';
    ctx.shadowBlur = 15;
    drawSNKText(ctx, '> YES <', yesX, selY, 28, '#44ff44');
  } else {
    drawSNKText(ctx, 'YES', yesX, selY, 28, '#666666');
  }
  ctx.shadowBlur = 0;

  if (!cursorYes) {
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 15;
    drawSNKText(ctx, '> NO <', noX, selY, 28, '#ff4444');
  } else {
    drawSNKText(ctx, 'NO', noX, selY, 28, '#666666');
  }
  ctx.shadowBlur = 0;

  drawSNKText(ctx, 'Arrow Keys: Select  |  Enter: Confirm', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 140, 12, '#555566');

  ctx.restore();
}
