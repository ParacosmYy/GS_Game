/**
 * Match End overlay — winner/draw display with portraits and win quotes
 * Split from overlayScreens.ts
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants.js';
import { ROSTER } from '../../characters/index.js';
import { roundRect, drawSNKText } from '../utils.js';
import { drawPixelPortrait } from '../pixelPortraits.js';
import { getPortraitForSize } from '../manifestRenderData.js';
import type { PortraitSize } from '../../core/portraitManifest.js';

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

  // Background — dark with subtle radial gradient
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Subtle background glow for winner
  if (winner !== null && winnerColor) {
    const bgGlow = ctx.createRadialGradient(
      CANVAS_WIDTH / 2, 200, 30,
      CANVAS_WIDTH / 2, 200, 250,
    );
    bgGlow.addColorStop(0, (winnerColor ?? '#FFD700') + '22');
    bgGlow.addColorStop(0.5, (winnerColor ?? '#FFD700') + '11');
    bgGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, CANVAS_WIDTH, 400);
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const tickVal = tick || 0;
  const fadeIn = Math.min(1, tickVal / 30);

  // Winner portrait — larger, centered, with sparkle glow
  if (winner !== null && winnerCharId) {
    const charDef = ROSTER.find(c => c.id === winnerCharId);
    // Use sized win portrait if available, fallback to base pixelPortrait
    const winPortrait = charDef ? (getPortraitForSize(winnerCharId, 'win' as PortraitSize) ?? charDef.pixelPortrait) : undefined;
    const charColor = charDef?.color ?? '#ffcc00';
    if (winPortrait) {
      const portraitScale = winPortrait.width >= 120 ? 2.5 : 4;
      const pw = winPortrait.width * portraitScale;
      const ph = winPortrait.height * portraitScale;
      const px = CANVAS_WIDTH / 2 - pw / 2;
      const py = 20;

      ctx.globalAlpha = fadeIn;

      // Glow aura behind portrait
      const auraGrad = ctx.createRadialGradient(
        px + pw / 2, py + ph / 2, pw * 0.3,
        px + pw / 2, py + ph / 2, pw * 0.9,
      );
      const auraPulse = 0.3 + Math.sin(tickVal * 0.06) * 0.1;
      auraGrad.addColorStop(0, charColor + Math.round(auraPulse * 255).toString(16).padStart(2, '0'));
      auraGrad.addColorStop(0.6, charColor + Math.round(auraPulse * 0.4 * 255).toString(16).padStart(2, '0'));
      auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = auraGrad;
      ctx.fillRect(px - pw * 0.3, py - ph * 0.3, pw * 1.6, ph * 1.6);

      // Portrait background frame
      ctx.fillStyle = 'rgba(12, 12, 28, 0.9)';
      roundRect(ctx, px - 10, py - 10, pw + 20, ph + 20, 10);
      ctx.fill();
      // Animated border glow
      const borderPulse = 0.5 + Math.sin(tickVal * 0.08) * 0.3;
      ctx.strokeStyle = winnerColor ?? '#FFD700';
      ctx.lineWidth = 2;
      ctx.globalAlpha = fadeIn * borderPulse;
      roundRect(ctx, px - 10, py - 10, pw + 20, ph + 20, 10);
      ctx.stroke();
      ctx.globalAlpha = fadeIn;

      drawPixelPortrait(ctx, winPortrait, px, py, portraitScale, {
        frameColor: charColor,
        backdropColor: 'rgba(8, 8, 18, 0.9)',
        scanlines: true,
      });

      // Sparkle particles around portrait
      const sparkleCount = 12;
      for (let s = 0; s < sparkleCount; s++) {
        const sparkleAngle = (s / sparkleCount) * Math.PI * 2 + tickVal * 0.02;
        const sparkleDist = pw * 0.55 + Math.sin(tickVal * 0.04 + s * 0.8) * 15;
        const sx = px + pw / 2 + Math.cos(sparkleAngle) * sparkleDist;
        const sy = py + ph / 2 + Math.sin(sparkleAngle) * sparkleDist * 0.6;
        const sparkleAlpha = (0.3 + Math.sin(tickVal * 0.07 + s * 1.2) * 0.3) * fadeIn;
        const sparkleSize = 2 + Math.sin(tickVal * 0.09 + s) * 1;
        if (sparkleAlpha > 0) {
          ctx.fillStyle = `rgba(255, 230, 120, ${sparkleAlpha})`;
          // 4-pointed star
          ctx.beginPath();
          ctx.moveTo(sx, sy - sparkleSize);
          ctx.lineTo(sx + sparkleSize * 0.35, sy);
          ctx.lineTo(sx, sy + sparkleSize);
          ctx.lineTo(sx - sparkleSize * 0.35, sy);
          ctx.closePath();
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
    }
  }

  const portraitOffset = (winner !== null && winnerCharId) ? 180 : 0;

  // Winner name — bold, centered
  if (winner !== null) {
    const wColor = winner === 0 ? '#ff6644' : '#4488ff';
    const nameAlpha = Math.min(1, Math.max(0, (tickVal - 10) / 20));
    ctx.globalAlpha = nameAlpha;

    if (winnerCharId) {
      const charDef = ROSTER.find(c => c.id === winnerCharId);
      if (charDef) {
        ctx.shadowColor = wColor;
        ctx.shadowBlur = 20;
        drawSNKText(ctx, charDef.nameCn, CANVAS_WIDTH / 2, portraitOffset + 10, 36, wColor);
        ctx.shadowBlur = 0;
      }
    }

    // "WINS" text
    const winsAlpha = Math.min(1, Math.max(0, (tickVal - 20) / 20));
    ctx.globalAlpha = winsAlpha;
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 15;
    drawSNKText(ctx, 'WINS', CANVAS_WIDTH / 2, portraitOffset + 45, 48, '#FFD700');
    ctx.shadowBlur = 0;

    ctx.globalAlpha = 1;
  } else {
    const drawAlpha = Math.min(1, Math.max(0, (tickVal - 10) / 20));
    ctx.globalAlpha = drawAlpha;
    drawSNKText(ctx, 'DRAW GAME', CANVAS_WIDTH / 2, portraitOffset + 20, 32, '#ffcc00');
    ctx.globalAlpha = 1;
  }

  // Win quote — typewriter effect
  if (winQuote && winnerColor && winner !== null) {
    const quoteAlpha = Math.min(1, Math.max(0, (tickVal - 40) / 20));
    ctx.globalAlpha = quoteAlpha;
    ctx.shadowColor = winnerColor;
    ctx.shadowBlur = 8;
    const chars = Math.min(winQuote.length, Math.floor(Math.max(0, tickVal - 40) / 3));
    const visible = winQuote.substring(0, chars);
    drawSNKText(ctx, `"${visible}"`, CANVAS_WIDTH / 2, portraitOffset + 85, 16, winnerColor);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // Win markers — P1 vs P2 score circles
  const dotY = portraitOffset + 120;
  const dotSpacing = 22;
  const dotAlpha = Math.min(1, Math.max(0, (tickVal - 25) / 15));
  ctx.globalAlpha = dotAlpha;
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

  // "Press any key" — pulsing
  const pressAlpha = 0.3 + Math.sin(tickVal * 0.06) * 0.2;
  ctx.globalAlpha = pressAlpha;
  drawSNKText(ctx, 'Press any key to continue', CANVAS_WIDTH / 2, portraitOffset + 155, 13, 'rgba(255,255,255,0.7)');
  ctx.globalAlpha = 1;

  ctx.restore();
}
