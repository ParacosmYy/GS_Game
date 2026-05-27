/**
 * Overlay screens — Super Flash, Match End, Title, Continue, Mode/Stage indicators
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/constants.js';
import { ROSTER } from '../characters/index.js';
import { roundRect, drawSNKText } from './utils.js';
import { drawPixelPortrait } from './pixelPortraits.js';
import { getPortraitForSize } from './manifestRenderData.js';
import type { PortraitSize } from '../core/portraitManifest.js';

// ===== Super Flash camera zoom state =====
let superFlashZoom = 1.0;

/** Get current super flash zoom factor (for canvas transform) */
export function getSuperFlashZoom(): number { return superFlashZoom; }

/** Update super flash zoom — call each tick with the current timer */
export function updateSuperFlashZoom(timer: number, maxTimer: number): void {
  if (timer > 0 && timer >= maxTimer - 8) {
    // Zoom in over 8 ticks from 1.0 to 1.08
    const progress = (maxTimer - timer) / 8;
    superFlashZoom = 1.0 + 0.08 * Math.min(1, progress);
  } else if (timer <= 0 && superFlashZoom > 1.001) {
    // Snap back after flash ends
    superFlashZoom = 1.0 + (superFlashZoom - 1.0) * 0.7;
    if (superFlashZoom < 1.001) superFlashZoom = 1.0;
  } else if (timer <= 0) {
    superFlashZoom = 1.0;
  }
}

// ===== Super Flash =====

export function drawSuperFlash(
  ctx: CanvasRenderingContext2D, timer: number,
  flashScreenX: number, flashScreenY: number,
  flashType: 'DM' | 'SDM' | 'HSDM' = 'DM',
  moveName?: string | null,
): void {
  ctx.save();
  // KOF2002 Super Flash 4阶段: FLASH(24-19) → DARKEN(18-13) → HOLD(12-5) → RELEASE(4-0)
  const isSDM = flashType === 'SDM';
  const isHSDM = flashType === 'HSDM';
  const isFlash = timer > 19;
  const isDarken = timer > 13;
  const isHold = timer > 4;

  // Phase 1: FLASH — 全屏白/金色闪烁 (帧24-20)
  if (isFlash) {
    const flashT = (timer - 19) / 5;
    const flashAlpha = flashT * (isHSDM ? 1.0 : 0.95);
    if (isHSDM) {
      ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      // Second layer: magenta tint
      ctx.fillStyle = `rgba(255, 50, 200, ${flashAlpha * 0.6})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else if (isSDM) {
      ctx.fillStyle = `rgba(255, 200, 100, ${flashAlpha})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }

  // Phase 2: DARKEN — 背景变暗60% (帧18起, 持续) — Phase 51 enhancement
  if (isDarken) {
    const darkT = Math.min(1, (timer - 13) / 6);
    const alpha = 0.6 * darkT;
    if (isHSDM) {
      ctx.fillStyle = `rgba(60, 0, 60, ${alpha})`;
    } else if (isSDM) {
      ctx.fillStyle = `rgba(80, 0, 0, ${alpha})`;
    } else {
      ctx.fillStyle = `rgba(0, 0, 80, ${alpha})`;
    }
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // Phase 51: Energy burst ring — expanding ring centered on attacker over 10 ticks then fades
  if (timer <= 24 && timer > 14) {
    const ringProgress = (24 - timer) / 10;
    const ringRadius = 30 + ringProgress * (isHSDM ? 280 : 220);
    const ringAlpha = (1 - ringProgress) * 0.65;
    const ringWidth = (4 + ringProgress * 3) * (1 - ringProgress);
    let ringColor: string;
    if (isHSDM) {
      ringColor = `rgba(255, 100, 255, ${ringAlpha})`;
    } else if (isSDM) {
      ringColor = `rgba(255, 180, 50, ${ringAlpha})`;
    } else {
      ringColor = `rgba(255, 255, 200, ${ringAlpha})`;
    }
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = ringWidth;
    ctx.beginPath();
    ctx.arc(flashScreenX, flashScreenY, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
    // Inner bright ring
    ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha * 0.5})`;
    ctx.lineWidth = ringWidth * 0.4;
    ctx.beginPath();
    ctx.arc(flashScreenX, flashScreenY, ringRadius * 0.85, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Phase 2-3: 角色周围爆发光晕
  if (timer > 14) {
    const burstAlpha = Math.min(1, (timer - 14) / 4) * (isHSDM ? 1.0 : 0.9);
    const glowRadius = isHSDM ? 240 : 180;
    const flashGrad = ctx.createRadialGradient(flashScreenX, flashScreenY, 0, flashScreenX, flashScreenY, glowRadius);
    if (isHSDM) {
      flashGrad.addColorStop(0, `rgba(255, 255, 255, ${burstAlpha})`);
      flashGrad.addColorStop(0.15, `rgba(255, 100, 255, ${burstAlpha * 0.8})`);
      flashGrad.addColorStop(0.35, `rgba(200, 50, 200, ${burstAlpha * 0.5})`);
      flashGrad.addColorStop(0.6, `rgba(255, 50, 150, ${burstAlpha * 0.2})`);
      flashGrad.addColorStop(1, `rgba(200, 30, 100, 0)`);
    } else if (isSDM) {
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
    const glowAlpha = holdT * (isHSDM ? 0.7 : 0.5);
    const glowSize = (isHSDM ? 120 : 90) + (1 - holdT) * (isHSDM ? 70 : 50);
    const glowGrad = ctx.createRadialGradient(flashScreenX, flashScreenY, 0, flashScreenX, flashScreenY, glowSize);
    if (isHSDM) {
      glowGrad.addColorStop(0, `rgba(255, 200, 255, ${glowAlpha})`);
      glowGrad.addColorStop(0.3, `rgba(255, 100, 255, ${glowAlpha * 0.6})`);
      glowGrad.addColorStop(0.6, `rgba(200, 50, 200, ${glowAlpha * 0.3})`);
      glowGrad.addColorStop(1, 'rgba(150, 30, 150, 0)');
    } else if (isSDM) {
      glowGrad.addColorStop(0, `rgba(255, 160, 60, ${glowAlpha})`);
      glowGrad.addColorStop(0.4, `rgba(255, 100, 30, ${glowAlpha * 0.4})`);
      glowGrad.addColorStop(1, 'rgba(255, 80, 20, 0)');
    } else {
      glowGrad.addColorStop(0, `rgba(255, 255, 100, ${glowAlpha})`);
      glowGrad.addColorStop(0.4, `rgba(255, 200, 50, ${glowAlpha * 0.4})`);
      glowGrad.addColorStop(1, 'rgba(255, 200, 50, 0)');
    }
    ctx.fillStyle = glowGrad;
    ctx.fillRect(flashScreenX - (isHSDM ? 260 : 200), flashScreenY - (isHSDM ? 260 : 200), isHSDM ? 520 : 400, isHSDM ? 520 : 400);
  }

  // Ground shockwave ring
  if (timer > 8 && timer < 18) {
    const ringProgress = (18 - timer) / 10;
    const ringRadius = (1 - ringProgress) * (isHSDM ? 260 : 200);
    const ringAlpha = ringProgress * (isHSDM ? 0.7 : 0.5);
    if (isHSDM) {
      ctx.strokeStyle = `rgba(255, 100, 255, ${ringAlpha})`;
    } else if (isSDM) {
      ctx.strokeStyle = `rgba(255, 100, 30, ${ringAlpha})`;
    } else {
      ctx.strokeStyle = `rgba(255, 220, 80, ${ringAlpha})`;
    }
    ctx.lineWidth = (isHSDM ? 5 : 3) * ringProgress;
    ctx.beginPath();
    ctx.ellipse(flashScreenX, flashScreenY + 40, ringRadius, ringRadius * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Radiating energy lines — more lines for HSDM
  const lineCount = isHSDM ? 24 : 16;
  if (timer > 10) {
    const lineT = (timer - 10) / 14;
    const lineAlpha = lineT * (isHSDM ? 0.5 : 0.3);
    if (isHSDM) {
      ctx.strokeStyle = `rgba(255, 150, 255, ${lineAlpha})`;
    } else if (isSDM) {
      ctx.strokeStyle = `rgba(255, 180, 60, ${lineAlpha})`;
    } else {
      ctx.strokeStyle = `rgba(255, 255, 100, ${lineAlpha})`;
    }
    ctx.lineWidth = isHSDM ? 3 : 2;
    for (let a = 0; a < lineCount; a++) {
      const angle = (a / lineCount) * Math.PI * 2 + timer * 0.1;
      const len = 60 + lineT * (isHSDM ? 140 : 100);
      ctx.beginPath();
      ctx.moveTo(flashScreenX + Math.cos(angle) * 20, flashScreenY + Math.sin(angle) * 20);
      ctx.lineTo(flashScreenX + Math.cos(angle) * len, flashScreenY + Math.sin(angle) * len);
      ctx.stroke();
    }
    // Inner ring
    ctx.lineWidth = isHSDM ? 2.5 : 1.5;
    const innerCount = isHSDM ? 12 : 8;
    for (let a = 0; a < innerCount; a++) {
      const angle = (a / innerCount) * Math.PI * 2 - timer * 0.15;
      const len = 30 + lineT * (isHSDM ? 60 : 40);
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
    const lineAlpha = speedLineT * (isHSDM ? 0.35 : 0.2);
    ctx.save();
    if (isHSDM) {
      ctx.strokeStyle = `rgba(255, 180, 255, ${lineAlpha})`;
    } else if (isSDM) {
      ctx.strokeStyle = `rgba(255, 200, 100, ${lineAlpha})`;
    } else {
      ctx.strokeStyle = `rgba(255, 255, 200, ${lineAlpha})`;
    }
    ctx.lineWidth = isHSDM ? 2.5 : 1.5;
    const speedLineCount = isHSDM ? 32 : 24;
    for (let i = 0; i < speedLineCount; i++) {
      const angle = (i / speedLineCount) * Math.PI * 2;
      const innerR = 30 + (1 - speedLineT) * 20;
      const outerR = (isHSDM ? 260 : 200) + (1 - speedLineT) * (isHSDM ? 200 : 150);
      ctx.beginPath();
      ctx.moveTo(flashScreenX + Math.cos(angle) * innerR, flashScreenY + Math.sin(angle) * innerR);
      ctx.lineTo(flashScreenX + Math.cos(angle) * outerR, flashScreenY + Math.sin(angle) * outerR);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (timer > 5) {
    const particleAlpha = Math.min(1, (timer - 5) / 10) * (isHSDM ? 1.0 : 0.8);
    const particleCount = isHSDM ? 14 : 8;
    for (let p = 0; p < particleCount; p++) {
      const pAngle = (p / particleCount) * Math.PI * 2 + timer * 0.2 + p * 0.5;
      const pDist = 40 + timer * (isHSDM ? 3 : 2) + p * 5;
      const px = flashScreenX + Math.cos(pAngle) * pDist;
      const py = flashScreenY + Math.sin(pAngle) * pDist * 0.6;
      const pSize = 2 + Math.sin(timer * 0.3 + p) * (isHSDM ? 2 : 1);
      if (isHSDM) {
        ctx.fillStyle = p % 3 === 0 ? `rgba(255, 255, 255, ${particleAlpha})` : `rgba(255, 120, 255, ${particleAlpha})`;
      } else if (isSDM) {
        ctx.fillStyle = `rgba(255, 160, 60, ${particleAlpha})`;
      } else {
        ctx.fillStyle = `rgba(255, 240, 120, ${particleAlpha})`;
      }
      ctx.beginPath();
      ctx.arc(px, py, pSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // KOF2002: DM name banner — large centered move name during DARKEN/HOLD phase
  if (moveName && timer <= 19 && timer > 4) {
    const bannerAlpha = timer > 14 ? Math.min(1, (19 - timer) / 5) : Math.min(1, (timer - 4) / 8);
    const bannerScale = timer > 16 ? 1.8 - (19 - timer) * 0.27 : 1.0;
    const bannerY = CANVAS_HEIGHT * 0.38;

    ctx.save();
    ctx.globalAlpha = bannerAlpha;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Banner background bar
    const barW = Math.max(200, moveName.length * 28 + 60);
    const barH = 40;
    const barGrad = ctx.createLinearGradient(CANVAS_WIDTH / 2 - barW / 2, bannerY - barH / 2, CANVAS_WIDTH / 2 + barW / 2, bannerY + barH / 2);
    if (isHSDM) {
      barGrad.addColorStop(0, 'rgba(80, 0, 120, 0.85)');
      barGrad.addColorStop(0.5, 'rgba(120, 20, 160, 0.9)');
      barGrad.addColorStop(1, 'rgba(80, 0, 120, 0.85)');
    } else if (isSDM) {
      barGrad.addColorStop(0, 'rgba(100, 40, 0, 0.85)');
      barGrad.addColorStop(0.5, 'rgba(160, 60, 0, 0.9)');
      barGrad.addColorStop(1, 'rgba(100, 40, 0, 0.85)');
    } else {
      barGrad.addColorStop(0, 'rgba(40, 30, 0, 0.85)');
      barGrad.addColorStop(0.5, 'rgba(80, 60, 0, 0.9)');
      barGrad.addColorStop(1, 'rgba(40, 30, 0, 0.85)');
    }
    ctx.fillStyle = barGrad;
    roundRect(ctx, CANVAS_WIDTH / 2 - barW / 2 * bannerScale, bannerY - barH / 2 * bannerScale, barW * bannerScale, barH * bannerScale, 6);
    ctx.fill();

    // Gold border
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    roundRect(ctx, CANVAS_WIDTH / 2 - barW / 2 * bannerScale, bannerY - barH / 2 * bannerScale, barW * bannerScale, barH * bannerScale, 6);
    ctx.stroke();

    // Move name text
    const nameColor = isHSDM ? '#ff88ff' : isSDM ? '#ffaa44' : '#ffd700';
    ctx.shadowColor = nameColor;
    ctx.shadowBlur = 15;
    const fontSize = Math.round(22 * bannerScale);
    drawSNKText(ctx, moveName, CANVAS_WIDTH / 2, bannerY, fontSize, nameColor);
    ctx.shadowBlur = 0;

    ctx.restore();
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

// ===== Arcade Complete Screen =====

export function drawArcadeComplete(ctx: CanvasRenderingContext2D, timer: number): void {
  ctx.save();

  ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Golden sparkle particles
  const sparkleCount = 20;
  for (let i = 0; i < sparkleCount; i++) {
    const sx = (Math.sin(timer * 0.02 + i * 1.3) * 0.5 + 0.5) * CANVAS_WIDTH;
    const sy = (Math.cos(timer * 0.015 + i * 2.1) * 0.5 + 0.5) * CANVAS_HEIGHT;
    const sa = (0.3 + Math.sin(timer * 0.08 + i * 0.7) * 0.3) * Math.min(1, timer / 30);
    const ss = 2 + Math.sin(timer * 0.1 + i) * 1;
    if (sa > 0) {
      ctx.fillStyle = `rgba(255, 220, 100, ${sa})`;
      ctx.beginPath();
      ctx.moveTo(sx, sy - ss);
      ctx.lineTo(sx + ss * 0.35, sy);
      ctx.lineTo(sx, sy + ss);
      ctx.lineTo(sx - ss * 0.35, sy);
      ctx.closePath();
      ctx.fill();
    }
  }

  const fadeIn = Math.min(1, timer / 30);
  ctx.globalAlpha = fadeIn;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // CONGRATULATIONS — gold glow
  const textProgress = Math.min(1, timer / 20);
  const textScale = 1 + (1 - textProgress) * 0.5;
  ctx.shadowColor = '#ffcc00';
  ctx.shadowBlur = 40;
  drawSNKText(ctx, 'CONGRATULATIONS', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40, Math.round(48 * textScale), '#ffcc00');
  ctx.shadowBlur = 0;

  // Subtitle
  const subAlpha = Math.min(1, Math.max(0, (timer - 20) / 20));
  ctx.globalAlpha = subAlpha;
  drawSNKText(ctx, 'YOU HAVE DEFEATED ALL OPPONENTS', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20, 16, '#ff8844');

  // Press any key
  const pressAlpha = 0.3 + Math.sin(timer * 0.06) * 0.2;
  ctx.globalAlpha = pressAlpha;
  drawSNKText(ctx, 'PRESS ANY KEY', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60, 13, 'rgba(255,255,255,0.7)');
  ctx.globalAlpha = 1;

  ctx.restore();
}

// ===== Next Match Transition =====

export function drawNextMatch(
  ctx: CanvasRenderingContext2D,
  timer: number,
  nextChar: import('../characters/types.js').CharacterDefinition | undefined,
  stageNumber: number,
  totalStages: number,
): void {
  ctx.save();

  ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Red accent pulse
  const pulseAlpha = 0.05 + Math.sin(timer * 0.04) * 0.03;
  ctx.fillStyle = `rgba(80, 20, 0, ${pulseAlpha})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Diagonal scan lines for arcade feel
  ctx.strokeStyle = `rgba(255, 120, 40, ${0.02 + Math.sin(timer * 0.03) * 0.01})`;
  ctx.lineWidth = 0.5;
  for (let i = -10; i < 30; i++) {
    const xOff = (timer * 0.2) % 60;
    ctx.beginPath();
    ctx.moveTo(i * 60 + xOff, 0);
    ctx.lineTo(i * 60 + xOff - CANVAS_HEIGHT, CANVAS_HEIGHT);
    ctx.stroke();
  }

  const fadeIn = Math.min(1, timer / 20);
  ctx.globalAlpha = fadeIn;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // "NEXT STAGE" header — KOF-style scaling entrance
  const headerProgress = Math.min(1, timer / 15);
  const headerScale = 1 + (1 - headerProgress) * 0.8;

  // Energy ring burst
  if (timer < 30) {
    const ringP = timer / 30;
    const ringR = 30 + ringP * 200;
    const ringA = (1 - ringP) * 0.4;
    ctx.strokeStyle = `rgba(255, 140, 40, ${ringA})`;
    ctx.lineWidth = (3 - ringP * 2);
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80, ringR, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.shadowColor = '#ff8800';
  ctx.shadowBlur = 25;
  drawSNKText(ctx, `STAGE ${stageNumber}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80, Math.round(36 * headerScale), '#ff8800');
  ctx.shadowBlur = 0;

  // Stage name subtitle
  const allStages: string[] = ['temple', 'china', 'factory', 'orochi', 'street'];
  const stageNames: Record<string, string> = {
    temple: '日本寺庙 · Japan',
    china: '唐人街 · China',
    factory: '工場 · Factory',
    orochi: '大蛇神社 · Orochi',
    street: '街市夜市 · Street',
  };
  const currentStageName = stageNames[allStages[(stageNumber - 1) % allStages.length]] ?? '';
  const stageAlpha = Math.min(1, Math.max(0, (timer - 5) / 15));
  ctx.globalAlpha = stageAlpha * fadeIn;
  drawSNKText(ctx, currentStageName, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50, 12, 'rgba(200,180,160,0.7)');
  ctx.globalAlpha = fadeIn;

  // Stage progress bar
  const barW = 200;
  const barH = 6;
  const barX = CANVAS_WIDTH / 2 - barW / 2;
  const barY = CANVAS_HEIGHT / 2 - 45;
  ctx.fillStyle = 'rgba(40, 40, 60, 0.8)';
  roundRect(ctx, barX, barY, barW, barH, 3);
  ctx.fill();
  const ratio = stageNumber / totalStages;
  ctx.fillStyle = '#ff8800';
  if (barW * ratio > 0) {
    roundRect(ctx, barX, barY, barW * ratio, barH, 3);
    ctx.fill();
  }

  // Next opponent info
  if (nextChar) {
    const infoAlpha = Math.min(1, Math.max(0, (timer - 10) / 20));
    ctx.globalAlpha = infoAlpha;

    // Opponent name
    ctx.shadowColor = nextChar.color;
    ctx.shadowBlur = 20;
    drawSNKText(ctx, 'VS', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 28, '#ffcc00');
    ctx.shadowBlur = 0;

    const nameProgress = Math.min(1, Math.max(0, (timer - 20) / 15));
    ctx.globalAlpha = nameProgress * infoAlpha;
    ctx.shadowColor = nextChar.color;
    ctx.shadowBlur = 15;
    drawSNKText(ctx, nextChar.nameCn, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 45, 36, nextChar.color);
    ctx.shadowBlur = 0;

    // Character color accent bar
    const accentW = 120;
    const accentH = 3;
    const accentX = CANVAS_WIDTH / 2 - accentW / 2;
    const accentY = CANVAS_HEIGHT / 2 + 70;
    const accentGrad = ctx.createLinearGradient(accentX, 0, accentX + accentW, 0);
    accentGrad.addColorStop(0, nextChar.color + '00');
    accentGrad.addColorStop(0.5, nextChar.color + 'cc');
    accentGrad.addColorStop(1, nextChar.color + '00');
    ctx.fillStyle = accentGrad;
    ctx.fillRect(accentX, accentY, accentW, accentH);
  }

  // "PRESS START" prompt
  const promptAlpha = timer > 40 ? 0.3 + Math.sin(timer * 0.06) * 0.2 : 0;
  ctx.globalAlpha = promptAlpha;
  drawSNKText(ctx, 'PRESS START', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 110, 13, 'rgba(255,255,255,0.7)');

  ctx.globalAlpha = 1;
  ctx.restore();
}

// ===== Character KO Overlay =====

/**
 * KOF2002-style character name overlay during KO phase.
 * Shows the winning character's name in their signature color with glow,
 * and optionally the finishing move name below.
 *
 * Animation: fade in over 20 frames, hold, then fade out.
 */
export function drawCharacterKOOverlay(
  ctx: CanvasRenderingContext2D,
  charName: string,
  charNameCn: string,
  charColor: string,
  moveName: string | null,
  tick: number,
): void {
  ctx.save();

  const FADE_IN_FRAMES = 20;
  const HOLD_FRAMES = 100;
  const FADE_OUT_FRAMES = 30;
  const totalDuration = FADE_IN_FRAMES + HOLD_FRAMES + FADE_OUT_FRAMES;

  // Calculate alpha based on phase
  let alpha = 0;
  if (tick < FADE_IN_FRAMES) {
    // Fade in
    alpha = tick / FADE_IN_FRAMES;
  } else if (tick < FADE_IN_FRAMES + HOLD_FRAMES) {
    // Hold with subtle pulse
    alpha = 1.0;
  } else if (tick < totalDuration) {
    // Fade out
    alpha = 1.0 - (tick - FADE_IN_FRAMES - HOLD_FRAMES) / FADE_OUT_FRAMES;
  } else {
    alpha = 0;
  }

  if (alpha <= 0) { ctx.restore(); return; }

  ctx.globalAlpha = alpha;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const baseY = CANVAS_HEIGHT / 2 + 140;

  // Subtle glow behind name
  const glowGrad = ctx.createRadialGradient(
    CANVAS_WIDTH / 2, baseY, 10,
    CANVAS_WIDTH / 2, baseY, 120,
  );
  glowGrad.addColorStop(0, charColor + Math.round(0.3 * alpha * 255).toString(16).padStart(2, '0'));
  glowGrad.addColorStop(0.5, charColor + Math.round(0.1 * alpha * 255).toString(16).padStart(2, '0'));
  glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(CANVAS_WIDTH / 2 - 140, baseY - 50, 280, 100);

  // Character name — white text with colored glow, KOF2002 style
  const namePulse = 1.0 + Math.sin(tick * 0.08) * 0.02;
  const nameFontSize = Math.round(32 * namePulse);

  // Shadow/glow layer
  ctx.shadowColor = charColor;
  ctx.shadowBlur = 20 * alpha;
  ctx.font = `bold ${nameFontSize}px "Courier New", monospace`;

  // Colored outline for depth
  ctx.strokeStyle = charColor;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.strokeText(charNameCn, CANVAS_WIDTH / 2, baseY);

  // White fill
  ctx.fillStyle = '#ffffff';
  ctx.fillText(charNameCn, CANVAS_WIDTH / 2, baseY);

  ctx.shadowBlur = 0;

  // Move name — smaller font below character name
  if (moveName) {
    const moveAlpha = Math.min(1, Math.max(0, (tick - FADE_IN_FRAMES) / 15));
    ctx.globalAlpha = alpha * moveAlpha;

    const moveFontSize = 18;
    ctx.font = `bold ${moveFontSize}px "Courier New", monospace`;
    ctx.shadowColor = charColor;
    ctx.shadowBlur = 10 * moveAlpha;

    // Move name in character color, slightly transparent
    ctx.strokeStyle = charColor;
    ctx.lineWidth = 1;
    ctx.strokeText(moveName, CANVAS_WIDTH / 2, baseY + 35);

    ctx.fillStyle = '#ffffffdd';
    ctx.fillText(moveName, CANVAS_WIDTH / 2, baseY + 35);

    ctx.shadowBlur = 0;
  }

  // Decorative side lines flanking the name
  const lineLen = 50 + Math.sin(tick * 0.05) * 5;
  const lineY = baseY;
  const lineGap = ctx.measureText(charNameCn).width / 2 + 20;
  ctx.strokeStyle = charColor + Math.round(0.5 * alpha * 255).toString(16).padStart(2, '0');
  ctx.lineWidth = 1.5;
  // Left line
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2 - lineGap - lineLen, lineY);
  ctx.lineTo(CANVAS_WIDTH / 2 - lineGap, lineY);
  ctx.stroke();
  // Right line
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2 + lineGap, lineY);
  ctx.lineTo(CANVAS_WIDTH / 2 + lineGap + lineLen, lineY);
  ctx.stroke();

  ctx.globalAlpha = 1;
  ctx.restore();
}

// ===== Screen Transition Helpers =====

/**
 * Draw a screen fade overlay with the given alpha.
 * Alpha 0 = fully transparent (screen visible).
 * Alpha 1 = fully opaque black (screen hidden).
 */
export function drawScreenFade(ctx: CanvasRenderingContext2D, alpha: number): void {
  if (alpha <= 0) return;
  ctx.save();
  ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, Math.max(0, alpha))})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.restore();
}

/**
 * Draw a screen wipe overlay with the given progress and direction.
 * Progress 0 = no wipe (screen fully visible).
 * Progress 1 = fully wiped (screen hidden).
 * Direction 'left' wipes from right to left, 'right' from left to right.
 */
export function drawScreenWipe(
  ctx: CanvasRenderingContext2D,
  progress: number,
  direction: 'left' | 'right',
): void {
  if (progress <= 0) return;
  const p = Math.min(1, Math.max(0, progress));
  ctx.save();
  ctx.fillStyle = '#000000';

  if (direction === 'left') {
    const wipeX = CANVAS_WIDTH * (1 - p);
    ctx.fillRect(wipeX, 0, CANVAS_WIDTH - wipeX, CANVAS_HEIGHT);
    if (p < 1 && p > 0) {
      const glowGrad = ctx.createLinearGradient(wipeX - 30, 0, wipeX + 10, 0);
      glowGrad.addColorStop(0, 'rgba(255, 204, 0, 0)');
      glowGrad.addColorStop(0.5, 'rgba(255, 204, 0, 0.4)');
      glowGrad.addColorStop(1, 'rgba(255, 204, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(wipeX - 30, 0, 40, CANVAS_HEIGHT);
    }
  } else {
    const wipeX = CANVAS_WIDTH * p;
    ctx.fillRect(0, 0, wipeX, CANVAS_HEIGHT);
    if (p < 1 && p > 0) {
      const glowGrad = ctx.createLinearGradient(wipeX - 10, 0, wipeX + 30, 0);
      glowGrad.addColorStop(0, 'rgba(255, 204, 0, 0)');
      glowGrad.addColorStop(0.5, 'rgba(255, 204, 0, 0.4)');
      glowGrad.addColorStop(1, 'rgba(255, 204, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(wipeX - 10, 0, 40, CANVAS_HEIGHT);
    }
  }

  ctx.restore();
}

// ===== Training Mode HUD =====

import type { TrainingModeState, FrameDataDisplay, InputHistoryEntry } from '../state/trainingMode.js';
import type { MoveListEntry } from '../core/types.js';

/**
 * Draw the full training mode HUD overlay.
 * - Top: "TRAINING MODE" label + dummy behavior
 * - Left top: Move list panel
 * - Left bottom: Input history panel
 * - Bottom: Frame data panel
 * - Right: Controls help
 */
export function drawTrainingHUD(
  ctx: CanvasRenderingContext2D,
  training: TrainingModeState,
  comboCount: number,
  comboDamage: number,
  tick: number,
  moveList: MoveListEntry[] = [],
): void {
  ctx.save();

  // ===== Top bar: TRAINING MODE label =====
  const topBarH = 30;
  const topGrad = ctx.createLinearGradient(0, 0, 0, topBarH);
  topGrad.addColorStop(0, 'rgba(0, 50, 0, 0.75)');
  topGrad.addColorStop(1, 'rgba(0, 30, 0, 0.5)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, topBarH);
  // Bottom border
  ctx.strokeStyle = 'rgba(68, 255, 68, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, topBarH);
  ctx.lineTo(CANVAS_WIDTH, topBarH);
  ctx.stroke();

  ctx.font = 'bold 14px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#44ff44';
  ctx.fillText('TRAINING MODE', 12, 16);

  // Dummy behavior display (top right)
  ctx.textAlign = 'right';
  ctx.font = '11px "Courier New", monospace';
  ctx.fillStyle = '#888';
  ctx.fillText('Dummy:', CANVAS_WIDTH - 140, 11);
  ctx.fillStyle = '#ffcc00';
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.fillText(training.getDummyBehaviorLabel(), CANVAS_WIDTH - 12, 11);

  // Combo display
  ctx.fillStyle = '#aaa';
  ctx.font = '10px "Courier New", monospace';
  ctx.fillText('Combo:', CANVAS_WIDTH - 140, 23);
  ctx.fillStyle = '#ffcc00';
  ctx.fillText(`${comboCount}`, CANVAS_WIDTH - 90, 23);
  ctx.fillStyle = '#aaa';
  ctx.fillText('Dmg:', CANVAS_WIDTH - 75, 23);
  ctx.fillStyle = '#ff6644';
  ctx.fillText(`${comboDamage}`, CANVAS_WIDTH - 45, 23);

  // ===== Left top panel: Move list =====
  if (training.showMoveList) {
    drawMoveListPanel(ctx, moveList);
  }

  // ===== Left bottom panel: Input history =====
  if (training.showInputHistory) {
    drawInputHistoryPanelAdjusted(ctx, training.inputHistory, tick, training.showMoveList, moveList);
  }

  // ===== Bottom panel: Frame data =====
  if (training.showFrameData) {
    drawFrameDataPanel(ctx, training.lastFrameData);
  }

  // ===== Right panel: Controls help =====
  drawControlsPanel(ctx);

  ctx.restore();
}

/** SNK-style categorized move list panel with section headers */
function drawMoveListPanel(ctx: CanvasRenderingContext2D, moveList: MoveListEntry[]): void {
  const panelX = 4;
  const panelY = 36;
  const panelW = 270;
  const lineH = 13;
  const sectionH = 16;

  // Group moves by category in KOF order
  const categoryOrder: { key: string; label: string }[] = [
    { key: 'command', label: 'COMMAND NORMALS' },
    { key: 'special', label: 'SPECIAL MOVES' },
    { key: 'dm', label: 'DESPERATION MOVES' },
    { key: 'sdm', label: 'MAX DM' },
    { key: 'system', label: 'SYSTEM' },
  ];

  const groups = new Map<string, MoveListEntry[]>();
  for (const cat of categoryOrder) {
    groups.set(cat.key, []);
  }
  for (const move of moveList) {
    const type = move.type ?? 'normal';
    if (groups.has(type)) {
      groups.get(type)!.push(move);
    }
  }

  // Calculate panel height
  let totalLines = 0;
  let hasContent = false;
  for (const cat of categoryOrder) {
    const entries = groups.get(cat.key)!;
    if (entries.length > 0) {
      totalLines += sectionH + entries.length * lineH;
      hasContent = true;
    }
  }
  if (!hasContent) totalLines = 40;
  const panelH = 20 + totalLines + 4;

  // Background with SNK-style dark gradient
  const bg = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelH);
  bg.addColorStop(0, 'rgba(10, 10, 20, 0.85)');
  bg.addColorStop(1, 'rgba(5, 5, 15, 0.75)');
  ctx.fillStyle = bg;
  roundRect(ctx, panelX, panelY, panelW, panelH, 6);
  ctx.fill();

  // Gold border — SNK style
  ctx.strokeStyle = 'rgba(200, 160, 60, 0.5)';
  ctx.lineWidth = 1;
  roundRect(ctx, panelX, panelY, panelW, panelH, 6);
  ctx.stroke();

  // Header bar
  ctx.fillStyle = 'rgba(200, 160, 60, 0.15)';
  ctx.fillRect(panelX + 1, panelY + 1, panelW - 2, 16);
  ctx.font = 'bold 10px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#ddb840';
  ctx.fillText('MOVE LIST', panelX + 8, panelY + 4);
  ctx.fillStyle = '#886';
  ctx.font = '8px "Courier New", monospace';
  ctx.fillText('[F5]', panelX + panelW - 30, panelY + 5);

  if (!moveList.length) {
    ctx.fillStyle = '#666';
    ctx.font = '9px "Courier New", monospace';
    ctx.fillText('暂无招式表数据', panelX + 12, panelY + 22);
    return;
  }

  // Section header styling
  const sectionStyle: Record<string, { color: string; bg: string }> = {
    command: { color: '#88ccff', bg: 'rgba(80, 140, 220, 0.1)' },
    special: { color: '#ffcc44', bg: 'rgba(220, 180, 40, 0.1)' },
    dm: { color: '#ff8844', bg: 'rgba(220, 120, 40, 0.12)' },
    sdm: { color: '#ff4466', bg: 'rgba(220, 50, 80, 0.12)' },
    system: { color: '#88ff88', bg: 'rgba(80, 200, 80, 0.1)' },
  };

  let curY = panelY + 20;

  for (const cat of categoryOrder) {
    const entries = groups.get(cat.key)!;
    if (entries.length === 0) continue;

    const style = sectionStyle[cat.key] ?? { color: '#ccc', bg: 'rgba(128,128,128,0.1)' };

    // Section header with colored left accent bar
    ctx.fillStyle = style.bg;
    ctx.fillRect(panelX + 2, curY, panelW - 4, sectionH - 2);
    ctx.fillStyle = style.color;
    ctx.fillRect(panelX + 2, curY, 3, sectionH - 2);

    ctx.font = 'bold 9px "Courier New", monospace';
    ctx.fillStyle = style.color;
    ctx.fillText(cat.label, panelX + 10, curY + 2);
    curY += sectionH;

    // Move entries
    ctx.font = '9px "Courier New", monospace';
    for (const move of entries) {
      // Move name
      ctx.fillStyle = '#ddd';
      const nameX = panelX + 10;
      ctx.fillText(move.name, nameX, curY + 1);

      // Input notation — right-aligned
      ctx.textAlign = 'right';
      ctx.fillStyle = style.color;
      ctx.fillText(move.input, panelX + panelW - 8, curY + 1);
      ctx.textAlign = 'left';
      curY += lineH;
    }
    curY += 2;
  }
}

/** Input history panel on the left side (adjusted for move list above) */
function drawInputHistoryPanelAdjusted(
  ctx: CanvasRenderingContext2D,
  history: InputHistoryEntry[],
  tick: number,
  showMoveList: boolean,
  moveList: MoveListEntry[],
): void {
  // Calculate move list panel height to position input history below it
  let moveListBottom = 36;
  if (showMoveList && moveList.length > 0) {
    const lineH = 13;
    const sectionH = 16;
    let totalLines = 0;
    const seen = new Set<string>();
    for (const move of moveList) {
      const t = move.type ?? 'normal';
      if (!seen.has(t)) { seen.add(t); totalLines += sectionH; }
      totalLines += lineH;
    }
    moveListBottom = 36 + 20 + totalLines + 6;
  } else if (showMoveList) {
    moveListBottom = 36 + 44;
  }

  const panelX = 4;
  const panelY = moveListBottom + 4;
  const panelW = 220;
  const lineH = 14;
  const maxLines = 12;
  const panelH = 20 + maxLines * lineH;

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  roundRect(ctx, panelX, panelY, panelW, panelH, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(68, 255, 68, 0.2)';
  ctx.lineWidth = 1;
  roundRect(ctx, panelX, panelY, panelW, panelH, 6);
  ctx.stroke();

  // Header
  ctx.font = 'bold 10px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#44ff44';
  ctx.fillText('INPUT HISTORY', panelX + 8, panelY + 4);

  // Entries
  ctx.font = '10px "Courier New", monospace';
  const startIdx = Math.max(0, history.length - maxLines);
  for (let i = startIdx; i < history.length; i++) {
    const entry = history[i];
    const lineIdx = i - startIdx;
    const y = panelY + 20 + lineIdx * lineH;

    // Fade older entries
    const age = tick - entry.frame;
    const alpha = Math.max(0.3, 1 - age / 300);
    ctx.globalAlpha = alpha;

    // Direction arrow
    ctx.fillStyle = '#88ccff';
    ctx.fillText(entry.direction, panelX + 8, y);

    // Buttons
    if (entry.buttons.length > 0) {
      ctx.fillStyle = '#ffcc44';
      ctx.fillText(entry.buttons.join(' '), panelX + 24, y);
    }

    ctx.globalAlpha = 1;
  }

  // Empty state
  if (history.length === 0) {
    ctx.fillStyle = '#555';
    ctx.font = '10px "Courier New", monospace';
    ctx.fillText('(no input yet)', panelX + 8, panelY + 24);
  }
}

/** Frame data panel at the bottom */
function drawFrameDataPanel(
  ctx: CanvasRenderingContext2D,
  frameData: FrameDataDisplay | null,
): void {
  const panelW = CANVAS_WIDTH - 8;
  const panelH = 52;
  const panelX = 4;
  const panelY = CANVAS_HEIGHT - panelH - 4;

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  roundRect(ctx, panelX, panelY, panelW, panelH, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(68, 255, 68, 0.2)';
  ctx.lineWidth = 1;
  roundRect(ctx, panelX, panelY, panelW, panelH, 6);
  ctx.stroke();

  if (!frameData) {
    ctx.font = '12px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#555';
    ctx.fillText('Attack to see frame data', panelX + panelW / 2, panelY + panelH / 2);
    return;
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Attack name + phase indicator
  const phaseColors: Record<string, string> = {
    startup: '#8888ff',
    active: '#ff4444',
    recovery: '#44cc44',
    none: '#888',
  };
  const phaseColor = phaseColors[frameData.phase] || '#888';

  // Row 1: Attack name, phase, current frame
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(frameData.attackName, panelX + 10, panelY + 6);

  // Phase indicator with colored dot
  ctx.fillStyle = phaseColor;
  ctx.beginPath();
  ctx.arc(panelX + 10 + ctx.measureText(frameData.attackName).width + 14, panelY + 12, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = phaseColor;
  ctx.font = '10px "Courier New", monospace';
  ctx.fillText(frameData.phase.toUpperCase(), panelX + 10 + ctx.measureText(frameData.attackName).width + 22, panelY + 7);

  // Current frame / total
  const totalFrames = frameData.startup + frameData.active + frameData.recovery;
  ctx.fillStyle = '#aaa';
  ctx.fillText(`f${frameData.currentFrame}/${totalFrames}`, panelX + 10 + ctx.measureText(frameData.attackName).width + 85, panelY + 7);

  // Row 2: Frame data columns
  const row2Y = panelY + 22;
  const colW = 85;
  const cols = [
    { label: 'STARTUP', value: `${frameData.startup}f`, color: '#8888ff' },
    { label: 'ACTIVE', value: `${frameData.active}f`, color: '#ff4444' },
    { label: 'RECOVERY', value: `${frameData.recovery}f`, color: '#44cc44' },
    { label: 'DAMAGE', value: `${frameData.damage}`, color: '#ff8844' },
    { label: 'HITSTUN', value: `${frameData.hitstun}f`, color: '#ffcc44' },
    { label: 'BLOCKSTUN', value: `${frameData.blockstun}f`, color: '#44aaff' },
  ];

  ctx.font = '9px "Courier New", monospace';
  for (let i = 0; i < cols.length; i++) {
    const cx = panelX + 10 + i * colW;
    ctx.fillStyle = '#666';
    ctx.fillText(cols[i].label, cx, row2Y);
    ctx.fillStyle = cols[i].color;
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillText(cols[i].value, cx, row2Y + 12);
    ctx.font = '9px "Courier New", monospace';
  }

  // Advantage display (right side)
  const advX = panelX + panelW - 180;
  ctx.fillStyle = '#666';
  ctx.fillText('ADV HIT', advX, row2Y);
  const advHitColor = frameData.advantageHit >= 0 ? '#44ff44' : '#ff4444';
  ctx.fillStyle = advHitColor;
  ctx.font = 'bold 12px "Courier New", monospace';
  ctx.fillText(frameData.advantageHit >= 0 ? `+${frameData.advantageHit}` : `${frameData.advantageHit}`, advX, row2Y + 12);

  ctx.font = '9px "Courier New", monospace';
  ctx.fillStyle = '#666';
  ctx.fillText('ADV BLOCK', advX + 80, row2Y);
  const advBlockColor = frameData.advantageBlock >= 0 ? '#44ff44' : '#ff4444';
  ctx.fillStyle = advBlockColor;
  ctx.font = 'bold 12px "Courier New", monospace';
  ctx.fillText(frameData.advantageBlock >= 0 ? `+${frameData.advantageBlock}` : `${frameData.advantageBlock}`, advX + 80, row2Y + 12);
}

/** Controls help panel on the right side */
function drawControlsPanel(ctx: CanvasRenderingContext2D): void {
  const panelW = 155;
  const panelH = 136;
  const panelX = CANVAS_WIDTH - panelW - 4;
  const panelY = 36;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  roundRect(ctx, panelX, panelY, panelW, panelH, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(68, 255, 68, 0.15)';
  ctx.lineWidth = 1;
  roundRect(ctx, panelX, panelY, panelW, panelH, 6);
  ctx.stroke();

  ctx.font = '9px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const lines = [
    { key: 'F1', desc: 'Dummy behavior' },
    { key: 'F2', desc: 'Reset positions' },
    { key: 'F3', desc: 'Input display' },
    { key: 'F4', desc: 'Frame data' },
    { key: 'F5', desc: 'Move list' },
    { key: 'F6', desc: 'CRT filter' },
    { key: 'ESC', desc: 'Back to select' },
  ];

  for (let i = 0; i < lines.length; i++) {
    const y = panelY + 6 + i * 18;
    ctx.fillStyle = '#ffcc00';
    ctx.fillText(lines[i].key, panelX + 6, y);
    ctx.fillStyle = '#888';
    ctx.fillText(lines[i].desc, panelX + 36, y);
  }
}
