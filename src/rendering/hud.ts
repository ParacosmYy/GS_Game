/**
 * HUD rendering — health bars, power gauge, timer, guard gauge, combo counters
 */
import { Fighter } from '../entities/fighter.js';
import { Camera } from '../core/camera.js';
import type { PowerGauge, MaxModeState } from '../core/types.js';
import { CANVAS_WIDTH, MAX_HEALTH, MAX_STOCKS } from '../core/constants.js';
import { shiftColor, roundRect } from './utils.js';

// ===== Main HUD =====

/** Draw the complete HUD: health bars, guard gauges, timer */
export function drawHUD(ctx: CanvasRenderingContext2D, fighters: Fighter[], tick: number): void {
  if (fighters.length < 2) return;

  const barWidth = 300;
  const barHeight = 20;
  const barY = 30;
  const margin = 50;

  // HUD background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 56);

  // Decorative top border line
  const borderGrad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, 0);
  borderGrad.addColorStop(0, '#cc222200');
  borderGrad.addColorStop(0.3, '#cc222288');
  borderGrad.addColorStop(0.5, '#ffffff44');
  borderGrad.addColorStop(0.7, '#2244cc88');
  borderGrad.addColorStop(1, '#2244cc00');
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 56); ctx.lineTo(CANVAS_WIDTH, 56); ctx.stroke();

  // P1 label
  ctx.fillStyle = '#ff4444';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('P1', 10, barY - 8);

  // P1 health bar
  const p1Ratio = Math.max(0, fighters[0].health / MAX_HEALTH);
  drawHealthBar(ctx, margin, barY, barWidth, barHeight, p1Ratio, true);
  // P1 guard gauge bar
  drawGuardGauge(ctx, margin, barY + barHeight + 3, barWidth, 5, fighters[0].guardGauge, true);

  // P2 label
  ctx.fillStyle = '#4488ff';
  ctx.textAlign = 'right';
  ctx.fillText('P2', CANVAS_WIDTH - 10, barY - 8);

  // P2 health bar
  const p2Ratio = Math.max(0, fighters[1].health / MAX_HEALTH);
  drawHealthBar(ctx, CANVAS_WIDTH - margin - barWidth, barY, barWidth, barHeight, p2Ratio, false);
  // P2 guard gauge bar
  drawGuardGauge(ctx, CANVAS_WIDTH - margin - barWidth, barY + barHeight + 3, barWidth, 5, fighters[1].guardGauge, false);

  // Timer in center
  const timeSeconds = Math.max(0, 99 - Math.floor(tick / 60));
  const timeStr = timeSeconds.toString().padStart(2, '0');
  ctx.fillStyle = timeSeconds <= 10 ? '#ff4444' : '#dddddd';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(timeStr, CANVAS_WIDTH / 2, barY + 8);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
}

// ===== Health Bar =====

function drawHealthBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, ratio: number, leftAligned: boolean): void {
  // Outer frame
  ctx.fillStyle = '#0a0a0f';
  roundRect(ctx, x - 2, y - 2, w + 4, h + 4, 4);
  ctx.fill();

  // Inner background
  ctx.fillStyle = '#1a1a22';
  roundRect(ctx, x, y, w, h, 3);
  ctx.fill();

  // Tick marks
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let t = 0.25; t < 1; t += 0.25) {
    const tx = leftAligned ? x + w * t : x + w * (1 - t);
    ctx.beginPath(); ctx.moveTo(tx, y); ctx.lineTo(tx, y + h); ctx.stroke();
  }

  // Health fill
  const fillW = w * ratio;
  if (fillW <= 0) return;

  const healthColor = ratio > 0.5 ? '#22cc55' : ratio > 0.25 ? '#ccaa22' : '#cc2233';
  const healthGrad = ctx.createLinearGradient(x, y, x, y + h);
  healthGrad.addColorStop(0, shiftColor(healthColor, 40));
  healthGrad.addColorStop(0.5, healthColor);
  healthGrad.addColorStop(1, shiftColor(healthColor, -20));

  ctx.fillStyle = healthGrad;
  if (leftAligned) {
    roundRect(ctx, x, y, fillW, h, 3);
    ctx.fill();
  } else {
    roundRect(ctx, x + w - fillW, y, fillW, h, 3);
    ctx.fill();
  }

  // Shine highlight
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  const shineW = Math.max(0, fillW - 6);
  if (shineW > 0) {
    if (leftAligned) {
      ctx.fillRect(x + 3, y + 2, shineW, 3);
    } else {
      ctx.fillRect(x + w - fillW + 3, y + 2, shineW, 3);
    }
  }

  // Border
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 3);
  ctx.stroke();
}

// ===== Guard Gauge =====

/** Draw guard gauge bar (thin bar under health bar, blue→yellow→red gradient) */
function drawGuardGauge(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, gauge: number, leftAligned: boolean): void {
  const ratio = Math.max(0, Math.min(1, gauge / 100));
  const fillW = w * ratio;

  // Background
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  ctx.fillStyle = '#1a1a22';
  ctx.fillRect(x, y, w, h);

  if (fillW > 0) {
    let gaugeColor: string;
    if (ratio > 0.6) {
      gaugeColor = '#4488ff'; // Blue — healthy
    } else if (ratio > 0.3) {
      gaugeColor = '#ccaa22'; // Yellow — warning
    } else {
      gaugeColor = '#cc2233'; // Red — critical
    }
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, shiftColor(gaugeColor, 40));
    grad.addColorStop(0.5, gaugeColor);
    grad.addColorStop(1, shiftColor(gaugeColor, -20));
    ctx.fillStyle = grad;
    if (leftAligned) {
      ctx.fillRect(x, y, fillW, h);
    } else {
      ctx.fillRect(x + w - fillW, y, fillW, h);
    }
  }

  // Border
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
}

// ===== Power Gauge =====

/** Draw power gauge stocks and MAX mode indicator for both players */
export function drawPowerGauges(ctx: CanvasRenderingContext2D, gauges: [PowerGauge, PowerGauge], maxModes: [MaxModeState, MaxModeState]): void {
  const gaugeY = 50;
  const stockW = 30;
  const stockH = 6;
  const stockGap = 3;

  for (let p = 0; p < 2; p++) {
    const gauge = gauges[p];
    const maxMode = maxModes[p];
    const isP1 = p === 0;
    const baseX = isP1 ? 50 : CANVAS_WIDTH - 50 - MAX_STOCKS * (stockW + stockGap);

    // Draw stocks
    for (let s = 0; s < MAX_STOCKS; s++) {
      const x = baseX + s * (stockW + stockGap);
      const filled = s < gauge.stocks;

      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(x, gaugeY, stockW, stockH);

      if (filled) {
        const stockGrad = ctx.createLinearGradient(x, gaugeY, x + stockW, gaugeY);
        stockGrad.addColorStop(0, '#ffaa00');
        stockGrad.addColorStop(1, '#ff6600');
        ctx.fillStyle = stockGrad;
        ctx.fillRect(x, gaugeY, stockW, stockH);
      } else if (s === gauge.stocks && gauge.meter > 0) {
        const fillW = (gauge.meter / gauge.maxMeter) * stockW;
        const partialGrad = ctx.createLinearGradient(x, gaugeY, x + fillW, gaugeY);
        partialGrad.addColorStop(0, '#4488ff');
        partialGrad.addColorStop(1, '#2266dd');
        ctx.fillStyle = partialGrad;
        ctx.fillRect(x, gaugeY, fillW, stockH);
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, gaugeY, stockW, stockH);
    }

    // MAX mode indicator
    if (maxMode.active) {
      const maxBaseX = isP1 ? 50 : CANVAS_WIDTH - 50 - 60;
      const pct = maxMode.timer / maxMode.maxDuration;
      ctx.fillStyle = 'rgba(255, 100, 255, 0.8)';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = isP1 ? 'left' : 'right';
      ctx.fillText('MAX', isP1 ? maxBaseX : maxBaseX + 60, gaugeY + 16);

      // Timer bar
      const timerX = isP1 ? maxBaseX + 32 : maxBaseX;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(timerX, gaugeY + 10, 60, 4);
      ctx.fillStyle = `rgba(255, ${Math.round(100 + 155 * pct)}, 255, 0.8)`;
      ctx.fillRect(timerX, gaugeY + 10, 60 * pct, 4);
      ctx.textAlign = 'left';
    }
  }
}

// ===== Combo Counters =====

/** Draw floating combo counter text near fighters */
export function drawComboCounters(
  ctx: CanvasRenderingContext2D,
  fighters: Fighter[],
  comboCount: number[],
  comboTimer: number[],
  camera: Camera,
): void {
  ctx.save();
  for (let i = 0; i < 2; i++) {
    if (comboCount[i] < 2) continue;
    const f = fighters[i];
    const sx = camera.worldToScreen(f.x);
    const sy = f.y - f.displayHeight - 30;
    const alpha = Math.min(1, comboTimer[i] < 30 ? 1 : 1 - (comboTimer[i] - 30) / 30);
    if (alpha <= 0) continue;

    ctx.globalAlpha = alpha;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffcc00';
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur = 8;
    ctx.font = `bold ${16 + Math.min(comboCount[i], 10)}px monospace`;
    ctx.fillText(`${comboCount[i]} COMBO`, sx, sy);
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}
