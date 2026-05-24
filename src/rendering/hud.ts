/**
 * HUD rendering — health bars, power gauge, timer, guard gauge, combo counters
 */
import { Fighter } from '../entities/fighter.js';
import { Camera } from '../core/camera.js';
import type { PowerGauge, MaxModeState } from '../core/types.js';
import {
  CANVAS_WIDTH, MAX_HEALTH, MAX_STOCKS, ROUND_TIME,
  HUD_BAR_WIDTH, HUD_BAR_HEIGHT, HUD_BAR_Y, HUD_MARGIN,
  HUD_TIMER_SIZE, HUD_GAUGE_Y, HUD_GAUGE_WIDTH, HUD_GAUGE_HEIGHT,
  HUD_GAUGE_SEGMENT_GAP, HUD_WIN_MARKER_SIZE,
} from '../core/constants.js';
import { shiftColor, roundRect } from './utils.js';

// ===== Main HUD =====

/** Draw the complete HUD: health bars, guard gauges, timer, win markers */
export function drawHUD(ctx: CanvasRenderingContext2D, fighters: Fighter[], tick: number, delayedHealth: [number, number], p1Wins: number = 0, p2Wins: number = 0, p1Name: string = '', p2Name: string = ''): void {
  if (fighters.length < 2) return;

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
  ctx.fillText('P1', 10, HUD_BAR_Y - 8);

  // P1 character name (above health bar)
  if (p1Name) {
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#999';
    ctx.textAlign = 'left';
    ctx.fillText(p1Name, HUD_MARGIN, HUD_BAR_Y - 6);
  }

  // P1 health bar
  const p1Ratio = Math.max(0, fighters[0].health / MAX_HEALTH);
  const p1DelayedRatio = Math.max(0, delayedHealth[0] / MAX_HEALTH);
  drawHealthBar(ctx, HUD_MARGIN, HUD_BAR_Y, HUD_BAR_WIDTH, HUD_BAR_HEIGHT, p1Ratio, p1DelayedRatio, true, tick);
  // P1 guard gauge bar
  drawGuardGauge(ctx, HUD_MARGIN, HUD_BAR_Y + HUD_BAR_HEIGHT + 3, HUD_BAR_WIDTH, 5, fighters[0].guardGauge, true);

  // P2 label
  ctx.fillStyle = '#4488ff';
  ctx.textAlign = 'right';
  ctx.fillText('P2', CANVAS_WIDTH - 10, HUD_BAR_Y - 8);

  // P2 character name (above health bar)
  if (p2Name) {
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#999';
    ctx.textAlign = 'right';
    ctx.fillText(p2Name, CANVAS_WIDTH - HUD_MARGIN, HUD_BAR_Y - 6);
  }

  // P2 health bar
  const p2Ratio = Math.max(0, fighters[1].health / MAX_HEALTH);
  const p2DelayedRatio = Math.max(0, delayedHealth[1] / MAX_HEALTH);
  drawHealthBar(ctx, CANVAS_WIDTH - HUD_MARGIN - HUD_BAR_WIDTH, HUD_BAR_Y, HUD_BAR_WIDTH, HUD_BAR_HEIGHT, p2Ratio, p2DelayedRatio, false, tick);
  // P2 guard gauge bar
  drawGuardGauge(ctx, CANVAS_WIDTH - HUD_MARGIN - HUD_BAR_WIDTH, HUD_BAR_Y + HUD_BAR_HEIGHT + 3, HUD_BAR_WIDTH, 5, fighters[1].guardGauge, false);

  // Timer in center — decorative frame + larger text
  const timeSeconds = Math.max(0, ROUND_TIME - Math.floor(tick / 60));
  const timeStr = timeSeconds.toString().padStart(2, '0');
  const timerX = CANVAS_WIDTH / 2;
  const timerY = HUD_BAR_Y + 8;

  // Decorative rounded rectangle frame behind timer
  ctx.fillStyle = 'rgba(10, 10, 20, 0.85)';
  roundRect(ctx, timerX - 28, timerY - 16, 56, 30, 6);
  ctx.fill();
  ctx.strokeStyle = '#c8a832';
  ctx.lineWidth = 1.5;
  roundRect(ctx, timerX - 28, timerY - 16, 56, 30, 6);
  ctx.stroke();

  ctx.fillStyle = timeSeconds <= 10 ? '#ff4444' : '#dddddd';
  ctx.font = `bold ${HUD_TIMER_SIZE}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(timeStr, timerX, timerY);

  // Win markers — diamond shapes near health bar inner edges
  const winMarkerY = HUD_BAR_Y + HUD_BAR_HEIGHT + 16;
  const winSpacing = HUD_WIN_MARKER_SIZE * 3;

  // P1 wins (right side of P1 health bar)
  const p1MarkerBaseX = HUD_MARGIN + HUD_BAR_WIDTH + 10;
  for (let i = 0; i < p1Wins; i++) {
    drawDiamond(ctx, p1MarkerBaseX + i * winSpacing, winMarkerY, HUD_WIN_MARKER_SIZE);
    ctx.fillStyle = '#ff6644';
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // P2 wins (left side of P2 health bar)
  const p2MarkerBaseX = CANVAS_WIDTH - HUD_MARGIN - HUD_BAR_WIDTH - 10;
  for (let i = 0; i < p2Wins; i++) {
    drawDiamond(ctx, p2MarkerBaseX - i * winSpacing, winMarkerY, HUD_WIN_MARKER_SIZE);
    ctx.fillStyle = '#4488ff';
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
}

/** Draw a diamond shape centered at (x, y) with given half-size */
function drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x - size, y);
  ctx.closePath();
}

// ===== Health Bar =====

function drawHealthBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, ratio: number, delayedRatio: number, leftAligned: boolean, frameCount: number): void {
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

  // White ghost bar (delayed health — drawn BEFORE colored bar)
  const delayedFillW = Math.round(w * delayedRatio);
  if (delayedFillW > 0 && delayedRatio > ratio) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    if (leftAligned) {
      roundRect(ctx, x, y, delayedFillW, h, 3);
      ctx.fill();
    } else {
      roundRect(ctx, x + w - delayedFillW, y, delayedFillW, h, 3);
      ctx.fill();
    }
  }

  // Health fill
  const fillW = Math.round(w * ratio);
  if (fillW <= 0) return;

  // Health bar color: green >50%, yellow 25-50%, orange ≤25% (HSDM signal)
  const isLowHealth = ratio <= 0.25;
  const healthColor = ratio > 0.50 ? '#22cc55' : ratio > 0.25 ? '#FFD700' : '#FF8C00';

  const healthGrad = ctx.createLinearGradient(x, y, x, y + h);
  healthGrad.addColorStop(0, shiftColor(healthColor, 40));
  healthGrad.addColorStop(0.5, healthColor);
  healthGrad.addColorStop(1, shiftColor(healthColor, -20));

  // Orange glow behind bar when ≤25% (HSDM signal)
  if (isLowHealth) {
    ctx.save();
    const pulseAlpha = 0.3 + 0.2 * Math.sin(frameCount * 0.1);
    ctx.shadowColor = `rgba(255, 100, 0, ${pulseAlpha + 0.3})`;
    ctx.shadowBlur = 8 + 4 * Math.sin(frameCount * 0.15);
    ctx.fillStyle = healthGrad;
    if (leftAligned) {
      roundRect(ctx, x, y, fillW, h, 3);
      ctx.fill();
    } else {
      roundRect(ctx, x + w - fillW, y, fillW, h, 3);
      ctx.fill();
    }
    ctx.restore();
  }

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

/** Draw power gauge — continuous segmented bar at bottom of screen */
export function drawPowerGauges(ctx: CanvasRenderingContext2D, gauges: [PowerGauge, PowerGauge], maxModes: [MaxModeState, MaxModeState]): void {
  const gaugeY = HUD_GAUGE_Y;
  const gaugeW = HUD_GAUGE_WIDTH;
  const gaugeH = HUD_GAUGE_HEIGHT;
  const segGap = HUD_GAUGE_SEGMENT_GAP;
  const segW = (gaugeW - (MAX_STOCKS - 1) * segGap) / MAX_STOCKS;

  for (let p = 0; p < 2; p++) {
    const gauge = gauges[p];
    const maxMode = maxModes[p];
    const isP1 = p === 0;

    // P1 from left, P2 from right (mirrored)
    const baseX = isP1 ? HUD_MARGIN : CANVAS_WIDTH - HUD_MARGIN - gaugeW;

    // Background bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    roundRect(ctx, baseX - 2, gaugeY - 2, gaugeW + 4, gaugeH + 4, 4);
    ctx.fill();

    // Draw each segment
    for (let s = 0; s < MAX_STOCKS; s++) {
      const segX = baseX + s * (segW + segGap);
      const isFilled = s < gauge.stocks;
      const isCharging = s === gauge.stocks && gauge.meter > 0;

      // Segment background
      ctx.fillStyle = '#1a1a22';
      ctx.fillRect(segX, gaugeY, segW, gaugeH);

      if (isFilled) {
        // Filled segment — orange→gold gradient
        const segGrad = ctx.createLinearGradient(segX, gaugeY, segX + segW, gaugeY);
        segGrad.addColorStop(0, '#ff8800');
        segGrad.addColorStop(1, '#ffcc00');
        ctx.fillStyle = segGrad;
        ctx.fillRect(segX, gaugeY, segW, gaugeH);
      } else if (isCharging) {
        // Partial fill — lighter orange
        const fillW = (gauge.meter / gauge.maxMeter) * segW;
        const partialGrad = ctx.createLinearGradient(segX, gaugeY, segX + fillW, gaugeY);
        partialGrad.addColorStop(0, '#cc8844');
        partialGrad.addColorStop(1, '#ffaa55');
        ctx.fillStyle = partialGrad;
        ctx.fillRect(segX, gaugeY, fillW, gaugeH);
      }

      // Segment border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(segX, gaugeY, segW, gaugeH);
    }

    // Overall bar border
    ctx.strokeStyle = 'rgba(255, 200, 0, 0.3)';
    ctx.lineWidth = 1;
    roundRect(ctx, baseX - 2, gaugeY - 2, gaugeW + 4, gaugeH + 4, 4);
    ctx.stroke();

    // "MAX" text with pulsing glow when all 3 stocks full AND NOT in MAX mode
    if (!maxMode.active && gauge.stocks >= MAX_STOCKS) {
      const pulseAlpha = 0.7 + 0.3 * Math.sin(Date.now() / 120);
      ctx.save();
      ctx.fillStyle = `rgba(255, 204, 0, ${pulseAlpha})`;
      ctx.shadowColor = '#ff8800';
      ctx.shadowBlur = 10 + 4 * Math.sin(Date.now() / 80);
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = isP1 ? 'left' : 'right';
      ctx.textBaseline = 'top';
      ctx.fillText('MAX', isP1 ? baseX + gaugeW + 6 : baseX - 6, gaugeY - 2);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // MAX mode timer bar (green, KOF style)
    if (maxMode.active) {
      const maxBaseX = isP1 ? HUD_MARGIN : CANVAS_WIDTH - HUD_MARGIN - gaugeW;
      const pct = maxMode.timer / maxMode.maxDuration;
      const pulseAlpha = 0.7 + Math.sin(Date.now() / 100) * 0.3;

      // MAX label with glow
      ctx.save();
      ctx.fillStyle = `rgba(100, 255, 100, ${pulseAlpha})`;
      ctx.shadowColor = '#00ff44';
      ctx.shadowBlur = 6;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = isP1 ? 'left' : 'right';
      ctx.textBaseline = 'top';
      ctx.fillText('MAX', isP1 ? maxBaseX + gaugeW + 6 : maxBaseX - 6, gaugeY - 2);
      ctx.shadowBlur = 0;
      ctx.restore();

      // Timer bar
      const timerBarW = gaugeW;
      const timerBarY = gaugeY + gaugeH + 4;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(Math.round(maxBaseX), timerBarY, timerBarW, 4);

      const greenGrad = ctx.createLinearGradient(Math.round(maxBaseX), timerBarY, Math.round(maxBaseX + timerBarW * pct), timerBarY);
      greenGrad.addColorStop(0, '#22ff66');
      greenGrad.addColorStop(1, '#44ff88');
      ctx.fillStyle = greenGrad;
      ctx.fillRect(Math.round(maxBaseX), timerBarY, Math.round(timerBarW * pct), 4);

      ctx.strokeStyle = 'rgba(100, 255, 100, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(maxBaseX), timerBarY, timerBarW, 4);

      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }
  }
}

// ===== Team Order Display (3v3) =====

export interface TeamDisplayInfo {
  members: { name: string; defeated: boolean; active: boolean }[];
}

/** Draw 3v3 team order under each side of the health bar */
export function drawTeamOrder(
  ctx: CanvasRenderingContext2D,
  p1Team: TeamDisplayInfo | null,
  p2Team: TeamDisplayInfo | null,
): void {
  if (!p1Team && !p2Team) return;

  const y = HUD_BAR_Y + HUD_BAR_HEIGHT + 14;

  ctx.font = 'bold 9px monospace';
  ctx.textBaseline = 'top';

  if (p1Team) {
    drawTeamSide(ctx, p1Team, HUD_MARGIN, y, 'left');
  }
  if (p2Team) {
    drawTeamSide(ctx, p2Team, CANVAS_WIDTH - HUD_MARGIN, y, 'right');
  }

  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
}

function drawTeamSide(ctx: CanvasRenderingContext2D, team: TeamDisplayInfo, baseX: number, y: number, side: 'left' | 'right'): void {
  const spacing = 14;
  const total = team.members.length;

  for (let i = 0; i < total; i++) {
    const m = team.members[i];
    const x = side === 'left' ? baseX + i * spacing : baseX - (total - 1 - i) * spacing;

    if (m.defeated) {
      ctx.fillStyle = '#555';
    } else if (m.active) {
      ctx.fillStyle = '#ffcc00';
    } else {
      ctx.fillStyle = '#aaa';
    }

    ctx.textAlign = 'center';
    const label = m.active ? `►${m.name[0]}` : m.name[0];
    ctx.fillText(label, x, y);

    // Health dot indicator
    const dotY = y + 12;
    ctx.beginPath();
    ctx.arc(x, dotY, 3, 0, Math.PI * 2);
    ctx.fillStyle = m.defeated ? '#333' : m.active ? '#22cc55' : '#666';
    ctx.fill();
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
