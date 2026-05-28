/**
 * HUD Power Gauge rendering — extracted from hud.ts
 * SNK-style segmented super meter, MAX mode glow, DM-ready flash, desperation indicator
 */
import type { PowerGauge, MaxModeState } from '../core/types.js';
import {
  MAX_STOCKS,
  CANVAS_WIDTH, HUD_MARGIN,
  HUD_GAUGE_Y, HUD_GAUGE_WIDTH, HUD_GAUGE_HEIGHT,
} from '../core/constants.js';
import { roundRect, drawSNKText } from './utils.js';
import { meterFlashTimers, meterStockFlashes } from './meterFlash.js';

export function drawPowerGauges(ctx: CanvasRenderingContext2D, gauges: [PowerGauge, PowerGauge], maxModes: [MaxModeState, MaxModeState], desperations?: [boolean, boolean]): void {
  const gaugeY = HUD_GAUGE_Y;
  const gaugeW = HUD_GAUGE_WIDTH;
  const gaugeH = HUD_GAUGE_HEIGHT;
  const numSegments = 3;
  const segGap = 5;
  const segW = (gaugeW - (numSegments - 1) * segGap) / numSegments;
  const now = Date.now();

  for (let p = 0; p < 2; p++) {
    const gauge = gauges[p];
    const maxMode = maxModes[p];
    const isDesperate = desperations?.[p] ?? false;
    const isP1 = p === 0;
    const baseX = isP1 ? HUD_MARGIN : CANVAS_WIDTH - HUD_MARGIN - gaugeW;

    const totalMeter = gauge.stocks * gauge.maxMeter + gauge.meter;
    const totalMax = MAX_STOCKS * gauge.maxMeter;
    const meterRatio = totalMeter / totalMax;

    const filledSegments = Math.min(numSegments, Math.floor(meterRatio * numSegments + 0.001));
    const partialFill = (meterRatio * numSegments) - filledSegments;

    // Outer frame
    ctx.fillStyle = '#1a1a28';
    roundRect(ctx, baseX - 4, gaugeY - 4, gaugeW + 8, gaugeH + 8, 6);
    ctx.fill();
    ctx.fillStyle = '#08080f';
    roundRect(ctx, baseX - 3, gaugeY - 3, gaugeW + 6, gaugeH + 6, 5);
    ctx.fill();

    const borderBright = Math.min(1, 0.3 + meterRatio * 0.5);
    ctx.strokeStyle = `rgba(200, 168, 50, ${borderBright})`;
    ctx.lineWidth = 1.5;
    roundRect(ctx, baseX - 4, gaugeY - 4, gaugeW + 8, gaugeH + 8, 6);
    ctx.stroke();

    for (let s = 0; s < numSegments; s++) {
      const segX = baseX + s * (segW + segGap);
      const isFilled = s < filledSegments;
      const isCharging = s === filledSegments && partialFill > 0;

      const emptyGrad = ctx.createLinearGradient(segX, gaugeY, segX, gaugeY + gaugeH);
      emptyGrad.addColorStop(0, '#1a1a2a');
      emptyGrad.addColorStop(0.5, '#12121e');
      emptyGrad.addColorStop(1, '#0a0a14');
      ctx.fillStyle = emptyGrad;
      ctx.fillRect(segX, gaugeY, segW, gaugeH);

      if (isFilled) {
        const pulsePhase = Math.sin(now / 150 + s * 0.8);
        const pulseAlpha = 0.85 + 0.15 * pulsePhase;
        ctx.save();
        ctx.shadowColor = `rgba(100, 170, 255, ${pulseAlpha * 0.4})`;
        ctx.shadowBlur = 3 + 2 * pulsePhase;

        const segGrad = ctx.createLinearGradient(segX, gaugeY, segX + segW, gaugeY);
        segGrad.addColorStop(0, '#2255aa');
        segGrad.addColorStop(0.3, '#3377cc');
        segGrad.addColorStop(0.55, '#88bbee');
        segGrad.addColorStop(0.75, '#ddbb66');
        segGrad.addColorStop(1, '#ffcc44');
        ctx.fillStyle = segGrad;
        ctx.fillRect(segX, gaugeY, segW, gaugeH);
        ctx.restore();

        ctx.fillStyle = `rgba(220, 235, 255, ${0.3 + 0.1 * pulsePhase})`;
        ctx.fillRect(segX + 1, gaugeY, segW - 2, 2);
        ctx.fillStyle = 'rgba(0, 0, 30, 0.4)';
        ctx.fillRect(segX + 1, gaugeY + gaugeH - 2, segW - 2, 2);
      } else if (isCharging) {
        const fillW = partialFill * segW;
        const nearFull = partialFill > 0.75;
        const chargeBright = nearFull ? 0.7 + 0.3 * Math.sin(now / 100) : 1.0;
        ctx.save();
        ctx.globalAlpha = chargeBright;
        const chargeGrad = ctx.createLinearGradient(segX, gaugeY, segX + fillW, gaugeY);
        chargeGrad.addColorStop(0, nearFull ? '#3377aa' : '#223355');
        chargeGrad.addColorStop(0.5, nearFull ? '#4499cc' : '#335577');
        chargeGrad.addColorStop(1, nearFull ? '#66bbee' : '#447799');
        ctx.fillStyle = chargeGrad;
        ctx.fillRect(segX, gaugeY, fillW, gaugeH);
        ctx.fillStyle = `rgba(150, 200, 255, ${nearFull ? 0.3 : 0.1})`;
        ctx.fillRect(segX, gaugeY, fillW, 2);
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      if (s < numSegments - 1) {
        const divX = segX + segW + 1;
        ctx.fillStyle = 'rgba(200, 168, 50, 0.35)';
        ctx.fillRect(divX - 1, gaugeY - 1, 1, gaugeH + 2);
        ctx.fillStyle = '#000000';
        ctx.fillRect(divX, gaugeY - 1, 2, gaugeH + 2);
        ctx.fillStyle = 'rgba(200, 168, 50, 0.35)';
        ctx.fillRect(divX + 2, gaugeY - 1, 1, gaugeH + 2);
      }

      ctx.strokeStyle = isFilled ? 'rgba(150, 200, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.strokeRect(segX, gaugeY, segW, gaugeH);
    }

    // Meter-above-50% glow
    if (meterRatio > 0.5 && !maxMode.active) {
      const glowPulse = Math.sin(now / 200) * 0.2 + 0.35;
      ctx.save();
      ctx.shadowColor = `rgba(80, 160, 255, ${glowPulse})`;
      ctx.shadowBlur = 14;
      ctx.strokeStyle = `rgba(100, 180, 255, ${glowPulse * 0.8})`;
      ctx.lineWidth = 2;
      roundRect(ctx, baseX - 5, gaugeY - 5, gaugeW + 10, gaugeH + 10, 7);
      ctx.stroke();
      ctx.restore();
    }

    // DM-ready double-layer pulsing border
    if (gauge.stocks >= 1 && !maxMode.active) {
      const readyPulse = Math.sin(now / 200) * 0.25 + 0.35;
      const readyVisible = Math.sin(now / 200) > -0.3;
      if (readyVisible) {
        ctx.strokeStyle = `rgba(255, 200, 80, ${readyPulse})`;
        ctx.lineWidth = 2;
        roundRect(ctx, Math.round(baseX) - 3, gaugeY - 3, gaugeW + 6, gaugeH + 6, 6);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255, 255, 255, ${readyPulse * 0.5})`;
        ctx.lineWidth = 1;
        roundRect(ctx, Math.round(baseX) - 1, gaugeY - 1, gaugeW + 2, gaugeH + 2, 4);
        ctx.stroke();
      }
    }

    // Full meter "MAX" text
    if (!maxMode.active && gauge.stocks >= MAX_STOCKS) {
      const pulseAlpha = 0.7 + 0.3 * Math.sin(now / 120);
      ctx.save();
      ctx.globalAlpha = pulseAlpha;
      ctx.shadowColor = '#ff8800';
      ctx.shadowBlur = 16 + 6 * Math.sin(now / 80);
      drawSNKText(ctx, 'MAX', isP1 ? baseX + gaugeW + 16 : baseX - 16, gaugeY + 7, 14, '#ffcc00', '#000000', isP1 ? 'left' : 'right');
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      ctx.restore();

      const dmFlash = Math.sin(now / 100) > 0;
      if (dmFlash) {
        ctx.save();
        ctx.shadowColor = '#ffcc00';
        ctx.shadowBlur = 18;
        ctx.strokeStyle = 'rgba(255, 200, 0, 0.7)';
        ctx.lineWidth = 2.5;
        roundRect(ctx, baseX - 6, gaugeY - 6, gaugeW + 12, gaugeH + 12, 8);
        ctx.stroke();
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1.5;
        roundRect(ctx, baseX - 3, gaugeY - 3, gaugeW + 6, gaugeH + 6, 5);
        ctx.stroke();
        ctx.restore();
      }
    }

    // MAX mode green halo
    if (maxMode.active) {
      const pct = maxMode.timer / maxMode.maxDuration;
      const centerX = baseX + gaugeW / 2;
      const centerY = gaugeY + gaugeH / 2;
      const haloRadius = Math.max(gaugeW, gaugeH) * 0.7;
      const flickerPhase = Math.sin(now / 60);
      const flickerAlpha = 0.15 + 0.12 * flickerPhase;

      ctx.save();
      const greenHalo = ctx.createRadialGradient(centerX, centerY, haloRadius * 0.1, centerX, centerY, haloRadius);
      greenHalo.addColorStop(0, `rgba(100, 255, 150, ${flickerAlpha * 1.5})`);
      greenHalo.addColorStop(0.4, `rgba(50, 255, 100, ${flickerAlpha})`);
      greenHalo.addColorStop(1, `rgba(0, 200, 80, 0)`);
      ctx.shadowColor = `rgba(0, 255, 100, ${0.5 + 0.3 * flickerPhase})`;
      ctx.shadowBlur = 15;
      ctx.fillStyle = greenHalo;
      ctx.fillRect(baseX - 8, gaugeY - 8, gaugeW + 16, gaugeH + 16);
      ctx.restore();

      const outerGlow = Math.sin(now / 80) * 0.3 + 0.5;
      ctx.save();
      ctx.shadowColor = `rgba(0, 255, 100, ${outerGlow})`;
      ctx.shadowBlur = 15;
      ctx.strokeStyle = `rgba(100, 255, 150, ${outerGlow * 0.8})`;
      ctx.lineWidth = 2;
      roundRect(ctx, baseX - 6, gaugeY - 6, gaugeW + 12, gaugeH + 12, 8);
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.shadowColor = `rgba(200, 255, 220, ${outerGlow * 0.5})`;
      ctx.shadowBlur = 15;
      ctx.strokeStyle = `rgba(200, 255, 220, ${outerGlow * 0.4})`;
      ctx.lineWidth = 1;
      roundRect(ctx, baseX - 3, gaugeY - 3, gaugeW + 6, gaugeH + 6, 5);
      ctx.stroke();
      ctx.restore();

      const pulseAlpha = 0.8 + Math.sin(now / 100) * 0.2;
      ctx.save();
      ctx.globalAlpha = pulseAlpha;
      ctx.shadowColor = '#00ff44';
      ctx.shadowBlur = 12;
      drawSNKText(ctx, 'MAX', isP1 ? baseX + gaugeW + 16 : baseX - 16, gaugeY + 7, 13, '#66ff88', '#000000', isP1 ? 'left' : 'right');
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      ctx.restore();

      // MAX timer bar
      const timerBarY = gaugeY + gaugeH + 5;
      const isLowTimer = maxMode.timer < 100;
      const timerFlashRed = isLowTimer && Math.sin(Date.now() * 0.015) > 0;
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      roundRect(ctx, Math.round(baseX), timerBarY, gaugeW, 5, 2);
      ctx.fill();
      if (timerFlashRed) {
        const redGrad = ctx.createLinearGradient(Math.round(baseX), timerBarY, Math.round(baseX + gaugeW * pct), timerBarY);
        redGrad.addColorStop(0, '#ff3333');
        redGrad.addColorStop(0.5, '#ff5544');
        redGrad.addColorStop(1, '#ff8866');
        ctx.fillStyle = redGrad;
      } else {
        const blueGrad = ctx.createLinearGradient(Math.round(baseX), timerBarY, Math.round(baseX + gaugeW * pct), timerBarY);
        blueGrad.addColorStop(0, '#2266ff');
        blueGrad.addColorStop(0.5, '#4488ff');
        blueGrad.addColorStop(1, '#66aaff');
        ctx.fillStyle = blueGrad;
      }
      roundRect(ctx, Math.round(baseX), timerBarY, Math.round(gaugeW * pct), 5, 2);
      ctx.fill();
      if (isLowTimer) {
        ctx.save();
        ctx.shadowColor = timerFlashRed ? 'rgba(255, 30, 30, 0.7)' : 'rgba(255, 60, 60, 0.5)';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = timerFlashRed ? 'rgba(255, 30, 30, 0.6)' : 'rgba(255, 60, 60, 0.4)';
        ctx.lineWidth = 1.5;
        roundRect(ctx, Math.round(baseX), timerBarY, gaugeW, 5, 2);
        ctx.stroke();
        ctx.restore();
      }
      ctx.strokeStyle = isLowTimer ? 'rgba(255, 100, 100, 0.3)' : 'rgba(100, 180, 255, 0.3)';
      ctx.lineWidth = 1;
      roundRect(ctx, Math.round(baseX), timerBarY, gaugeW, 5, 2);
      ctx.stroke();
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }

    // Meter gain flash
    const flashTimer = meterFlashTimers[p];
    if (flashTimer > 0) {
      const flashAlpha = (flashTimer / 12) * 0.45;
      ctx.save();
      ctx.globalAlpha = flashAlpha;
      const flashGrad = ctx.createLinearGradient(baseX, gaugeY, baseX + gaugeW, gaugeY + gaugeH);
      flashGrad.addColorStop(0, '#ffffff');
      flashGrad.addColorStop(0.3, '#ffeedd');
      flashGrad.addColorStop(0.7, '#ffcc66');
      flashGrad.addColorStop(1, '#ffffff');
      ctx.fillStyle = flashGrad;
      ctx.fillRect(baseX, gaugeY, gaugeW, gaugeH);
      ctx.restore();
    }

    // Stock gain flash
    const stockFlash = meterStockFlashes[p];
    if (stockFlash > 0) {
      const stockAlpha = (stockFlash / 20) * 0.6;
      ctx.save();
      ctx.shadowColor = '#ffcc00';
      ctx.shadowBlur = 12 * (stockFlash / 20);
      ctx.strokeStyle = `rgba(255, 200, 0, ${stockAlpha})`;
      ctx.lineWidth = 3;
      roundRect(ctx, baseX - 6, gaugeY - 6, gaugeW + 12, gaugeH + 12, 8);
      ctx.stroke();
      ctx.restore();
    }

    // Desperation indicator
    if (isDesperate && !maxMode.active) {
      const despPulse = Math.sin(now / 160) * 0.3 + 0.5;
      const despFlash = Math.sin(now / 80) > 0.2;
      ctx.save();
      ctx.shadowColor = `rgba(255, 30, 30, ${despPulse})`;
      ctx.shadowBlur = 10 + 5 * despPulse;
      ctx.strokeStyle = `rgba(255, 40, 40, ${despPulse * 0.7})`;
      ctx.lineWidth = 2;
      roundRect(ctx, baseX - 6, gaugeY - 6, gaugeW + 12, gaugeH + 12, 8);
      ctx.stroke();
      ctx.restore();
      if (despFlash) {
        ctx.save();
        ctx.shadowColor = '#ff2222';
        ctx.shadowBlur = 6;
        ctx.strokeStyle = 'rgba(255, 80, 60, 0.4)';
        ctx.lineWidth = 1;
        roundRect(ctx, baseX - 3, gaugeY - 3, gaugeW + 6, gaugeH + 6, 5);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Desperation + MAX: "HSDM" text flash
    if (isDesperate && maxMode.active) {
      const hsPulse = 0.6 + 0.4 * Math.sin(now / 100);
      ctx.save();
      ctx.globalAlpha = hsPulse;
      ctx.shadowColor = '#ff2222';
      ctx.shadowBlur = 14;
      drawSNKText(ctx, 'HSDM', isP1 ? baseX + gaugeW + 16 : baseX - 16, gaugeY + 7, 11, '#ff4444', '#000000', isP1 ? 'left' : 'right');
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      ctx.restore();
      const crGlow = Math.sin(now / 120) * 0.15 + 0.2;
      ctx.save();
      ctx.shadowColor = `rgba(255, 20, 20, ${crGlow + 0.3})`;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = `rgba(255, 50, 50, ${crGlow})`;
      ctx.lineWidth = 2.5;
      roundRect(ctx, baseX - 7, gaugeY - 7, gaugeW + 14, gaugeH + 14, 9);
      ctx.stroke();
      ctx.restore();
    }
  }
}
