/**
 * Super Flash overlay — DM/SDM/HSDM cinematic flash effect
 * Split from overlayScreens.ts
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants.js';
import { roundRect, drawSNKText } from '../utils.js';

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

    // HSDM: animated scan line sweep across banner
    if (isHSDM && timer > 8 && timer < 18) {
      const scanT = (18 - timer) / 10;
      const scanX = CANVAS_WIDTH / 2 - barW * bannerScale / 2 + (1 - scanT) * barW * bannerScale;
      const scanW = 30;
      const scanGrad = ctx.createLinearGradient(scanX - scanW / 2, 0, scanX + scanW / 2, 0);
      scanGrad.addColorStop(0, 'rgba(255, 200, 255, 0)');
      scanGrad.addColorStop(0.5, `rgba(255, 200, 255, ${0.3 * bannerAlpha})`);
      scanGrad.addColorStop(1, 'rgba(255, 200, 255, 0)');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(
        CANVAS_WIDTH / 2 - barW * bannerScale / 2,
        bannerY - barH * bannerScale / 2,
        barW * bannerScale,
        barH * bannerScale,
      );
    }

    ctx.restore();
  }

  ctx.restore();
}
