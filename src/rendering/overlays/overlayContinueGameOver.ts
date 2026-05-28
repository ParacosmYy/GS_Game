/**
 * Continue / Game Over / Round Score Breakdown screens
 * Split from overlayScreens.ts
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants.js';
import { roundRect, drawSNKText } from '../utils.js';

// ===== Continue Screen =====

export interface ContinueProgress {
  stageIndex: number;
  totalStages: number;
  score: number;
  defeatedColors: string[];
}

export function drawContinue(ctx: CanvasRenderingContext2D, secondsLeft: number, cursorYes: boolean, defeatedChar?: import('../../characters/types.js').CharacterDefinition, winnerChar?: import('../../characters/types.js').CharacterDefinition, progress?: ContinueProgress): void {
  ctx.save();

  ctx.fillStyle = 'rgba(0,0,0,0.88)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // KOF2002: 红色脉冲背景 — 倒计时紧迫感
  const pulseAlpha = secondsLeft <= 3 ? 0.15 + Math.sin(Date.now() * 0.01) * 0.1 : 0.05;
  ctx.fillStyle = `rgba(80, 0, 0, ${pulseAlpha})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // KOF2002: 败者/胜者角色肖像 — 经典街机Continue仪式感
  const portraitY = CANVAS_HEIGHT / 2 - 20;
  const portraitH = 80;
  const portraitW = 70;

  if (defeatedChar) {
    const dpx = CANVAS_WIDTH / 2 - 200;
    const dpy = portraitY - portraitH / 2;
    ctx.fillStyle = 'rgba(15,15,25,0.8)';
    roundRect(ctx, dpx - 4, dpy - 4, portraitW + 8, portraitH + 8, 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(100,100,120,0.4)';
    ctx.lineWidth = 1;
    roundRect(ctx, dpx - 4, dpy - 4, portraitW + 8, portraitH + 8, 4);
    ctx.stroke();
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.font = `bold 36px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#666';
    ctx.fillText(defeatedChar.portrait, dpx + portraitW / 2, dpy + portraitH / 2);
    ctx.restore();
    drawSNKText(ctx, defeatedChar.nameCn, dpx + portraitW / 2, dpy + portraitH + 14, 12, '#666666');
    drawSNKText(ctx, 'DEFEATED', dpx + portraitW / 2, dpy - 14, 9, '#884444');
  }

  if (winnerChar) {
    const wpx = CANVAS_WIDTH / 2 + 130;
    const wpy = portraitY - portraitH / 2;
    ctx.fillStyle = 'rgba(10,10,20,0.7)';
    roundRect(ctx, wpx - 4, wpy - 4, portraitW + 8, portraitH + 8, 4);
    ctx.fill();
    ctx.strokeStyle = winnerChar.color + '66';
    ctx.lineWidth = 1.5;
    roundRect(ctx, wpx - 4, wpy - 4, portraitW + 8, portraitH + 8, 4);
    ctx.stroke();
    ctx.save();
    ctx.shadowColor = winnerChar.color;
    ctx.shadowBlur = 8;
    ctx.font = `bold 36px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = winnerChar.color;
    ctx.fillText(winnerChar.portrait, wpx + portraitW / 2, wpy + portraitH / 2);
    ctx.shadowBlur = 0;
    ctx.restore();
    drawSNKText(ctx, winnerChar.nameCn, wpx + portraitW / 2, wpy + portraitH + 14, 12, winnerChar.color);
    drawSNKText(ctx, 'WINNER', wpx + portraitW / 2, wpy - 14, 9, '#ffcc44');
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Coin insert visual hint — top area
  const coinPulse = 0.4 + Math.sin(Date.now() * 0.005) * 0.3;
  ctx.globalAlpha = coinPulse;
  // Coin slot rectangle
  const coinSlotX = CANVAS_WIDTH / 2 - 18;
  const coinSlotY = 50;
  ctx.fillStyle = 'rgba(80, 80, 100, 0.6)';
  roundRect(ctx, coinSlotX, coinSlotY, 36, 48, 6);
  ctx.fill();
  ctx.strokeStyle = '#888899';
  ctx.lineWidth = 1.5;
  roundRect(ctx, coinSlotX, coinSlotY, 36, 48, 6);
  ctx.stroke();
  // Coin slot opening
  ctx.fillStyle = '#222';
  roundRect(ctx, coinSlotX + 10, coinSlotY + 6, 16, 4, 2);
  ctx.fill();
  // Coin icon
  ctx.fillStyle = '#ffcc00';
  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH / 2, coinSlotY + 28, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#cc9900';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#cc9900';
  ctx.font = 'bold 10px "Courier New", monospace';
  ctx.fillText('$', CANVAS_WIDTH / 2, coinSlotY + 30);
  ctx.globalAlpha = 1;

  // "INSERT COIN" text
  drawSNKText(ctx, 'INSERT COIN', CANVAS_WIDTH / 2, coinSlotY + 58, 12, '#888899');

  // Progress summary banner — show how far the player got
  if (progress && progress.totalStages > 0) {
    const bannerY = 130;
    // Stage indicator
    drawSNKText(ctx, `STAGE ${progress.stageIndex + 1} / ${progress.totalStages}`, CANVAS_WIDTH / 2, bannerY, 18, '#ddaa44');
    // Score display
    const scoreStr = progress.score.toLocaleString();
    drawSNKText(ctx, `SCORE ${scoreStr}`, CANVAS_WIDTH / 2, bannerY + 22, 13, '#cccccc');
    // Defeated opponents dots
    const dotR = 5;
    const dotGap = 18;
    const dotsStartX = CANVAS_WIDTH / 2 - (progress.totalStages - 1) * dotGap / 2;
    for (let i = 0; i < progress.totalStages; i++) {
      const dx = dotsStartX + i * dotGap;
      const dy = bannerY + 44;
      ctx.beginPath();
      ctx.arc(dx, dy, dotR, 0, Math.PI * 2);
      if (i < progress.defeatedColors.length) {
        ctx.fillStyle = progress.defeatedColors[i];
        ctx.fill();
        ctx.strokeStyle = '#ffffff44';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (i === progress.stageIndex) {
        ctx.fillStyle = '#ff4444';
        ctx.fill();
        ctx.strokeStyle = '#ff666666';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#44444488';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  // CONTINUE? header
  ctx.shadowColor = '#ff2222';
  ctx.shadowBlur = 25;
  drawSNKText(ctx, 'CONTINUE?', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80, 48, '#ff4444');
  ctx.shadowBlur = 0;

  // Countdown number — flashing effect in last 3 seconds
  const isUrgent = secondsLeft <= 3;
  const countColor = isUrgent ? '#ff2222' : '#ffcc00';
  const countScale = isUrgent ? 1 + Math.sin(Date.now() * 0.015) * 0.1 : 1;
  const countSize = Math.round(72 * countScale);
  // Flashing effect for urgent countdown
  if (isUrgent) {
    const flashPhase = Math.sin(Date.now() * 0.012);
    if (flashPhase > 0) {
      ctx.fillStyle = `rgba(255, 50, 50, ${flashPhase * 0.15})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }
  ctx.shadowColor = isUrgent ? '#ff0000' : '#ffaa00';
  ctx.shadowBlur = isUrgent ? 20 : 12;
  drawSNKText(ctx, `${secondsLeft}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10, countSize, countColor);
  ctx.shadowBlur = 0;

  // Progress bar — visual countdown
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
  if (barW * ratio > 0) {
    roundRect(ctx, barX, barY, barW * ratio, barH, 3);
    ctx.fill();
  }

  // YES / NO selection with cursor
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

// ===== Game Over Screen =====

const GAME_OVER_DURATION = 180; // 3 seconds at 60fps

export function drawGameOver(ctx: CanvasRenderingContext2D, timer: number): void {
  ctx.save();

  // Gradually dimming background
  const dimProgress = Math.min(1, timer / GAME_OVER_DURATION);
  ctx.fillStyle = `rgba(0, 0, 0, ${0.7 + dimProgress * 0.25})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Visual decay — scanline effect that intensifies
  const scanlineAlpha = 0.05 + dimProgress * 0.1;
  ctx.fillStyle = `rgba(0, 0, 0, ${scanlineAlpha})`;
  for (let y = 0; y < CANVAS_HEIGHT; y += 3) {
    ctx.fillRect(0, y, CANVAS_WIDTH, 1);
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // "GAME OVER" — large red text with dramatic appearance
  const textProgress = Math.min(1, timer / 30);
  let textScale = 1;
  if (textProgress < 0.15) {
    textScale = 1 + (1 - textProgress / 0.15) * 1.5;
  } else if (textProgress < 0.3) {
    const bounceP = (textProgress - 0.15) / 0.15;
    textScale = 1 + 0.1 * Math.sin(bounceP * Math.PI);
  }
  const textAlpha = Math.min(1, textProgress * 2.5);
  ctx.globalAlpha = textAlpha;

  const fontSize = Math.round(80 * textScale);

  // Red glow behind text
  const glowGrad = ctx.createRadialGradient(
    CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20, 20,
    CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20, 200,
  );
  glowGrad.addColorStop(0, `rgba(200, 0, 0, ${0.2 * textAlpha})`);
  glowGrad.addColorStop(0.5, `rgba(150, 0, 0, ${0.1 * textAlpha})`);
  glowGrad.addColorStop(1, 'rgba(100, 0, 0, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.shadowColor = '#ff0000';
  ctx.shadowBlur = 40;
  drawSNKText(ctx, 'GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20, fontSize, '#cc0000');
  ctx.shadowBlur = 20;
  drawSNKText(ctx, 'GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20, fontSize, '#ff2222');
  ctx.shadowBlur = 0;

  // Subtitle — fades in after main text
  const subAlpha = Math.min(1, Math.max(0, (timer - 40) / 30));
  ctx.globalAlpha = subAlpha * 0.6;
  drawSNKText(ctx, 'RETURNING TO TITLE...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50, 14, '#888888');
  ctx.globalAlpha = 1;

  ctx.restore();
}

export { GAME_OVER_DURATION };

