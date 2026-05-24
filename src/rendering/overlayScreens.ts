/**
 * Overlay screens — Super Flash, Match End, Title, Continue, Mode/Stage indicators
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/constants.js';
import { ROSTER } from '../characters/index.js';
import { roundRect, drawSNKText } from './utils.js';

// ===== Super Flash =====

export function drawSuperFlash(
  ctx: CanvasRenderingContext2D, timer: number,
  flashScreenX: number, flashScreenY: number,
  flashType: 'DM' | 'SDM' = 'DM',
): void {
  ctx.save();
  const progress = timer / 20;
  const isSDM = flashType === 'SDM';

  // Dark overlay
  const alpha = 0.65 * progress;
  ctx.fillStyle = isSDM ? `rgba(80, 0, 0, ${alpha})` : `rgba(0, 0, 80, ${alpha})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Flash burst — initial bright white flash
  if (timer > 14) {
    const flashAlpha = (timer - 14) / 6 * 0.9;
    const flashGrad = ctx.createRadialGradient(flashScreenX, flashScreenY, 0, flashScreenX, flashScreenY, 180);
    if (isSDM) {
      flashGrad.addColorStop(0, `rgba(255, 220, 160, ${flashAlpha})`);
      flashGrad.addColorStop(0.2, `rgba(255, 160, 50, ${flashAlpha * 0.7})`);
      flashGrad.addColorStop(0.5, `rgba(255, 80, 20, ${flashAlpha * 0.3})`);
      flashGrad.addColorStop(1, `rgba(255, 60, 10, 0)`);
    } else {
      flashGrad.addColorStop(0, `rgba(255, 255, 220, ${flashAlpha})`);
      flashGrad.addColorStop(0.2, `rgba(255, 230, 100, ${flashAlpha * 0.7})`);
      flashGrad.addColorStop(0.5, `rgba(255, 200, 50, ${flashAlpha * 0.3})`);
      flashGrad.addColorStop(1, `rgba(255, 180, 30, 0)`);
    }
    ctx.fillStyle = flashGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // Lingering glow
  const glowAlpha = progress * 0.5;
  const glowSize = 90 + (1 - progress) * 50;
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
    const lineAlpha = (timer - 10) / 10 * 0.3;
    ctx.strokeStyle = isSDM ? `rgba(255, 180, 60, ${lineAlpha})` : `rgba(255, 255, 100, ${lineAlpha})`;
    ctx.lineWidth = 2;
    for (let a = 0; a < 16; a++) {
      const angle = (a / 16) * Math.PI * 2 + timer * 0.1;
      const len = 60 + (1 - progress) * 100;
      ctx.beginPath();
      ctx.moveTo(flashScreenX + Math.cos(angle) * 20, flashScreenY + Math.sin(angle) * 20);
      ctx.lineTo(flashScreenX + Math.cos(angle) * len, flashScreenY + Math.sin(angle) * len);
      ctx.stroke();
    }
    // Inner ring
    ctx.lineWidth = 1.5;
    for (let a = 0; a < 8; a++) {
      const angle = (a / 8) * Math.PI * 2 - timer * 0.15;
      const len = 30 + (1 - progress) * 40;
      ctx.beginPath();
      ctx.moveTo(flashScreenX + Math.cos(angle) * 15, flashScreenY + Math.sin(angle) * 15);
      ctx.lineTo(flashScreenX + Math.cos(angle) * len, flashScreenY + Math.sin(angle) * len);
      ctx.stroke();
    }
  }

  // Floating energy particles
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
): void {
  ctx.save();

  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.shadowColor = '#ff8800';
  ctx.shadowBlur = 25;
  drawSNKText(ctx, 'GAME', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80, 72, '#FFD700');
  ctx.shadowBlur = 0;

  if (winner !== null) {
    const wColor = winner === 0 ? '#ff6644' : '#4488ff';
    drawSNKText(ctx, `P${winner + 1} WINS THE MATCH`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20, 32, wColor);
  } else {
    drawSNKText(ctx, 'DRAW GAME', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20, 32, '#ffcc00');
  }

  if (winQuote && winnerColor) {
    ctx.shadowColor = winnerColor;
    ctx.shadowBlur = 8;
    drawSNKText(ctx, `"${winQuote}"`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 25, 16, winnerColor);
    ctx.shadowBlur = 0;
  }

  // Win markers
  const dotY = CANVAS_HEIGHT / 2 + 65;
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

  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  grad.addColorStop(0, '#0a0a22');
  grad.addColorStop(0.3, '#0f0f35');
  grad.addColorStop(0.7, '#0a0a28');
  grad.addColorStop(1, '#050515');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Animated particles
  for (let i = 0; i < 60; i++) {
    const x = ((i * 137 + tick * 0.3) % CANVAS_WIDTH);
    const y = ((i * 97 + tick * 0.12) % CANVAS_HEIGHT);
    const s = 0.5 + Math.sin(tick * 0.04 + i) * 0.5;
    const a = 0.2 + Math.sin(tick * 0.03 + i * 0.5) * 0.15;
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.beginPath();
    ctx.arc(x, y, s, 0, Math.PI * 2);
    ctx.fill();
  }

  // Logo glow
  const logoGlow = ctx.createRadialGradient(CANVAS_WIDTH / 2, 155, 10, CANVAS_WIDTH / 2, 155, 250);
  logoGlow.addColorStop(0, 'rgba(255, 100, 0, 0.12)');
  logoGlow.addColorStop(0.5, 'rgba(255, 60, 0, 0.05)');
  logoGlow.addColorStop(1, 'rgba(255, 40, 0, 0)');
  ctx.fillStyle = logoGlow;
  ctx.fillRect(CANVAS_WIDTH / 2 - 250, 50, 500, 200);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.shadowColor = '#ff4400';
  ctx.shadowBlur = 30;
  drawSNKText(ctx, 'KOF 2002', CANVAS_WIDTH / 2, 140, 52, '#ff6600');
  ctx.shadowBlur = 50;
  drawSNKText(ctx, 'KOF 2002', CANVAS_WIDTH / 2, 140, 52, '#ff6600');
  ctx.shadowBlur = 0;

  ctx.shadowColor = '#cc8800';
  ctx.shadowBlur = 10;
  drawSNKText(ctx, '风云再起', CANVAS_WIDTH / 2, 185, 22, '#cc8844');
  ctx.shadowBlur = 0;

  // Decorative line
  const lineGrad = ctx.createLinearGradient(CANVAS_WIDTH / 2 - 150, 0, CANVAS_WIDTH / 2 + 150, 0);
  lineGrad.addColorStop(0, '#ff440000');
  lineGrad.addColorStop(0.3, '#ff440088');
  lineGrad.addColorStop(0.5, '#ffcc4466');
  lineGrad.addColorStop(0.7, '#ff440088');
  lineGrad.addColorStop(1, '#ff440000');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2 - 150, 210);
  ctx.lineTo(CANVAS_WIDTH / 2 + 150, 210);
  ctx.stroke();

  // Character silhouettes
  const silY = 280;
  for (let i = 0; i < ROSTER.length; i++) {
    const sx = CANVAS_WIDTH / 2 + (i - ROSTER.length / 2 + 0.5) * 50;
    const bob = Math.sin(tick * 0.03 + i) * 3;
    ctx.fillStyle = ROSTER[i].color + '88';
    ctx.beginPath();
    ctx.arc(sx, silY + bob, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff8';
    ctx.font = '8px "Courier New", monospace';
    ctx.fillText(ROSTER[i].nameCn[0], sx, silY + bob + 3);
  }

  // PRESS START
  const blinkVal = Math.sin(tick * 0.08) * 0.5 + 0.5;
  if (blinkVal > 0.3) {
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 15;
    ctx.globalAlpha = blinkVal;
    drawSNKText(ctx, 'PRESS START', CANVAS_WIDTH / 2, 370, 24, '#ffcc00');
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  drawSNKText(ctx, 'Enter / J / R to start', CANVAS_WIDTH / 2, 420, 11, '#444455');
  drawSNKText(ctx, 'Tab: Simplified mode  |  N: Change stage  |  F1: Debug  |  M: Music  |  B: BGM', CANVAS_WIDTH / 2, 545, 10, '#333344');
  drawSNKText(ctx, 'HTML5 Canvas + TypeScript', CANVAS_WIDTH / 2, 565, 10, '#333344');

  ctx.restore();
}

// ===== Continue Screen =====

export function drawContinue(ctx: CanvasRenderingContext2D, secondsLeft: number, cursorYes: boolean): void {
  ctx.save();

  ctx.fillStyle = 'rgba(0,0,0,0.88)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.shadowColor = '#ff2222';
  ctx.shadowBlur = 25;
  drawSNKText(ctx, 'CONTINUE?', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80, 48, '#ff4444');
  ctx.shadowBlur = 0;

  ctx.shadowBlur = 12;
  const countColor = secondsLeft <= 3 ? '#ff2222' : '#ffcc00';
  drawSNKText(ctx, `${secondsLeft}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10, 72, countColor);
  ctx.shadowBlur = 0;

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
