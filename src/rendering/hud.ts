/**
 * HUD rendering — SNK-style health bars, power gauge, timer, guard gauge, combo counters
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

export function drawHUD(ctx: CanvasRenderingContext2D, fighters: Fighter[], tick: number, delayedHealth: [number, number], p1Wins: number = 0, p2Wins: number = 0, p1Name: string = '', p2Name: string = ''): void {
  if (fighters.length < 2) return;

  // HUD background — dark gradient
  const hudGrad = ctx.createLinearGradient(0, 0, 0, 58);
  hudGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  hudGrad.addColorStop(1, 'rgba(10, 8, 15, 0.85)');
  ctx.fillStyle = hudGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, 58);

  // Decorative top border — gold gradient line
  const borderGrad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, 0);
  borderGrad.addColorStop(0, '#cc880044');
  borderGrad.addColorStop(0.2, '#cc8800aa');
  borderGrad.addColorStop(0.4, '#ffcc4466');
  borderGrad.addColorStop(0.5, '#ffffff44');
  borderGrad.addColorStop(0.6, '#ffcc4466');
  borderGrad.addColorStop(0.8, '#4466ccaa');
  borderGrad.addColorStop(1, '#4466cc44');
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 58); ctx.lineTo(CANVAS_WIDTH, 58); ctx.stroke();

  // P1 label — styled
  drawPlayerLabel(ctx, '1P', HUD_MARGIN - 2, HUD_BAR_Y - 10, '#ff4444', '#ffcc00');

  // P1 character name
  if (p1Name) {
    ctx.font = 'bold 10px "Courier New", monospace';
    ctx.fillStyle = '#ccc';
    ctx.textAlign = 'left';
    ctx.fillText(p1Name, HUD_MARGIN + 22, HUD_BAR_Y - 8);
  }

  // P1 health bar
  const p1Ratio = Math.max(0, fighters[0].health / MAX_HEALTH);
  const p1DelayedRatio = Math.max(0, delayedHealth[0] / MAX_HEALTH);
  drawHealthBar(ctx, HUD_MARGIN, HUD_BAR_Y, HUD_BAR_WIDTH, HUD_BAR_HEIGHT, p1Ratio, p1DelayedRatio, true, tick);
  drawGuardGauge(ctx, HUD_MARGIN, HUD_BAR_Y + HUD_BAR_HEIGHT + 3, HUD_BAR_WIDTH, 5, fighters[0].guardGauge, true);

  // P2 label
  drawPlayerLabel(ctx, '2P', CANVAS_WIDTH - HUD_MARGIN - 18, HUD_BAR_Y - 10, '#4488ff', '#ffcc00');

  // P2 character name
  if (p2Name) {
    ctx.font = 'bold 10px "Courier New", monospace';
    ctx.fillStyle = '#ccc';
    ctx.textAlign = 'right';
    ctx.fillText(p2Name, CANVAS_WIDTH - HUD_MARGIN - 22, HUD_BAR_Y - 8);
  }

  // P2 health bar
  const p2Ratio = Math.max(0, fighters[1].health / MAX_HEALTH);
  const p2DelayedRatio = Math.max(0, delayedHealth[1] / MAX_HEALTH);
  drawHealthBar(ctx, CANVAS_WIDTH - HUD_MARGIN - HUD_BAR_WIDTH, HUD_BAR_Y, HUD_BAR_WIDTH, HUD_BAR_HEIGHT, p2Ratio, p2DelayedRatio, false, tick);
  drawGuardGauge(ctx, CANVAS_WIDTH - HUD_MARGIN - HUD_BAR_WIDTH, HUD_BAR_Y + HUD_BAR_HEIGHT + 3, HUD_BAR_WIDTH, 5, fighters[1].guardGauge, false);

  // Timer — decorative frame
  const timeSeconds = Math.max(0, ROUND_TIME - Math.floor(tick / 60));
  const timeStr = timeSeconds.toString().padStart(2, '0');
  const timerX = CANVAS_WIDTH / 2;
  const timerY = HUD_BAR_Y + 8;

  // Timer background — rounded with gold border
  ctx.fillStyle = 'rgba(10, 10, 20, 0.9)';
  roundRect(ctx, timerX - 30, timerY - 17, 60, 32, 8);
  ctx.fill();
  ctx.strokeStyle = '#c8a832';
  ctx.lineWidth = 2;
  roundRect(ctx, timerX - 30, timerY - 17, 60, 32, 8);
  ctx.stroke();
  // Inner gold border
  ctx.strokeStyle = 'rgba(200, 168, 50, 0.3)';
  ctx.lineWidth = 1;
  roundRect(ctx, timerX - 27, timerY - 14, 54, 26, 6);
  ctx.stroke();

  // Timer text
  ctx.fillStyle = timeSeconds <= 10 ? '#ff4444' : timeSeconds <= 30 ? '#ffcc44' : '#eeeeee';
  if (timeSeconds <= 10) {
    ctx.save();
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 6;
  }
  ctx.font = `bold ${HUD_TIMER_SIZE}px "Courier New", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(timeStr, timerX, timerY);
  if (timeSeconds <= 10) ctx.restore();

  // Win markers — styled diamonds
  const winMarkerY = HUD_BAR_Y + HUD_BAR_HEIGHT + 16;
  const winSpacing = HUD_WIN_MARKER_SIZE * 3;

  for (let i = 0; i < p1Wins; i++) {
    drawDiamond(ctx, HUD_MARGIN + HUD_BAR_WIDTH + 10 + i * winSpacing, winMarkerY, HUD_WIN_MARKER_SIZE, '#ff6644');
  }
  for (let i = 0; i < p2Wins; i++) {
    drawDiamond(ctx, CANVAS_WIDTH - HUD_MARGIN - HUD_BAR_WIDTH - 10 - i * winSpacing, winMarkerY, HUD_WIN_MARKER_SIZE, '#4488ff');
  }

  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
}

/** Draw a styled player label */
function drawPlayerLabel(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, accent: string): void {
  ctx.save();
  ctx.font = 'bold 12px "Courier New", monospace';
  // Background glow
  ctx.fillStyle = color + '22';
  ctx.fillRect(x - 2, y - 10, 24, 14);
  // Text
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x - size, y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Inner highlight
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.5);
  ctx.lineTo(x + size * 0.5, y);
  ctx.lineTo(x, y + size * 0.2);
  ctx.lineTo(x - size * 0.5, y);
  ctx.closePath();
  ctx.fill();
}

// ===== Health Bar =====

function drawHealthBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, ratio: number, delayedRatio: number, leftAligned: boolean, frameCount: number): void {
  // Outer frame — darker with gold border
  ctx.fillStyle = '#05050a';
  roundRect(ctx, x - 3, y - 3, w + 6, h + 6, 5);
  ctx.fill();
  ctx.strokeStyle = 'rgba(200, 168, 50, 0.4)';
  ctx.lineWidth = 1;
  roundRect(ctx, x - 3, y - 3, w + 6, h + 6, 5);
  ctx.stroke();

  // Inner background
  ctx.fillStyle = '#0f0f18';
  roundRect(ctx, x, y, w, h, 3);
  ctx.fill();

  // Tick marks
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let t = 0.25; t < 1; t += 0.25) {
    const tx = leftAligned ? x + w * t : x + w * (1 - t);
    ctx.beginPath(); ctx.moveTo(tx, y); ctx.lineTo(tx, y + h); ctx.stroke();
  }

  // White ghost bar (delayed health)
  const delayedFillW = Math.round(w * delayedRatio);
  if (delayedFillW > 0 && delayedRatio > ratio) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
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

  // Color: green >50%, yellow 25-50%, orange <=25%
  const isLowHealth = ratio <= 0.25;
  const healthColor = ratio > 0.50 ? '#22cc55' : ratio > 0.25 ? '#FFD700' : '#FF8C00';

  const healthGrad = ctx.createLinearGradient(x, y, x, y + h);
  healthGrad.addColorStop(0, shiftColor(healthColor, 50));
  healthGrad.addColorStop(0.3, shiftColor(healthColor, 20));
  healthGrad.addColorStop(0.7, healthColor);
  healthGrad.addColorStop(1, shiftColor(healthColor, -30));

  // Low health glow
  if (isLowHealth) {
    ctx.save();
    const pulseAlpha = 0.3 + 0.2 * Math.sin(frameCount * 0.1);
    ctx.shadowColor = `rgba(255, 100, 0, ${pulseAlpha + 0.3})`;
    ctx.shadowBlur = 10 + 5 * Math.sin(frameCount * 0.15);
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
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  const shineW = Math.max(0, fillW - 6);
  if (shineW > 0) {
    if (leftAligned) {
      ctx.fillRect(x + 3, y + 1, shineW, 3);
    } else {
      ctx.fillRect(x + w - fillW + 3, y + 1, shineW, 3);
    }
  }

  // Border
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 3);
  ctx.stroke();
}

// ===== Guard Gauge =====

function drawGuardGauge(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, gauge: number, leftAligned: boolean): void {
  const ratio = Math.max(0, Math.min(1, gauge / 100));
  const fillW = w * ratio;

  ctx.fillStyle = '#05050a';
  ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  ctx.fillStyle = '#0f0f18';
  ctx.fillRect(x, y, w, h);

  if (fillW > 0) {
    let gaugeColor: string;
    if (ratio > 0.6) {
      gaugeColor = '#4488ff';
    } else if (ratio > 0.3) {
      gaugeColor = '#ccaa22';
    } else {
      gaugeColor = '#cc2233';
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

  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
}

// ===== Power Gauge =====

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
    const baseX = isP1 ? HUD_MARGIN : CANVAS_WIDTH - HUD_MARGIN - gaugeW;

    // Background bar with gold border
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    roundRect(ctx, baseX - 3, gaugeY - 3, gaugeW + 6, gaugeH + 6, 5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(200, 168, 50, 0.3)';
    ctx.lineWidth = 1;
    roundRect(ctx, baseX - 3, gaugeY - 3, gaugeW + 6, gaugeH + 6, 5);
    ctx.stroke();

    // Draw each segment
    for (let s = 0; s < MAX_STOCKS; s++) {
      const segX = baseX + s * (segW + segGap);
      const isFilled = s < gauge.stocks;
      const isCharging = s === gauge.stocks && gauge.meter > 0;

      // Segment background
      ctx.fillStyle = '#0f0f18';
      ctx.fillRect(segX, gaugeY, segW, gaugeH);

      if (isFilled) {
        // Filled — orange to gold gradient with glow
        const segGrad = ctx.createLinearGradient(segX, gaugeY, segX + segW, gaugeY);
        segGrad.addColorStop(0, '#ff8800');
        segGrad.addColorStop(0.5, '#ffaa22');
        segGrad.addColorStop(1, '#ffcc00');
        ctx.fillStyle = segGrad;
        ctx.fillRect(segX, gaugeY, segW, gaugeH);
        // Top shine
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(segX, gaugeY, segW, 2);
      } else if (isCharging) {
        // Partial fill
        const fillW = (gauge.meter / gauge.maxMeter) * segW;
        const partialGrad = ctx.createLinearGradient(segX, gaugeY, segX + fillW, gaugeY);
        partialGrad.addColorStop(0, '#cc8844');
        partialGrad.addColorStop(1, '#ffaa55');
        ctx.fillStyle = partialGrad;
        ctx.fillRect(segX, gaugeY, fillW, gaugeH);
      }

      // Segment border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(segX, gaugeY, segW, gaugeH);
    }

    // MAX text when full
    if (!maxMode.active && gauge.stocks >= MAX_STOCKS) {
      const pulseAlpha = 0.7 + 0.3 * Math.sin(Date.now() / 120);
      ctx.save();
      ctx.fillStyle = `rgba(255, 204, 0, ${pulseAlpha})`;
      ctx.shadowColor = '#ff8800';
      ctx.shadowBlur = 12 + 4 * Math.sin(Date.now() / 80);
      ctx.font = 'bold 13px "Courier New", monospace';
      ctx.textAlign = isP1 ? 'left' : 'right';
      ctx.textBaseline = 'top';
      ctx.fillText('MAX', isP1 ? baseX + gaugeW + 8 : baseX - 8, gaugeY - 2);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // MAX mode timer bar
    if (maxMode.active) {
      const pct = maxMode.timer / maxMode.maxDuration;
      const pulseAlpha = 0.7 + Math.sin(Date.now() / 100) * 0.3;

      ctx.save();
      ctx.fillStyle = `rgba(100, 255, 100, ${pulseAlpha})`;
      ctx.shadowColor = '#00ff44';
      ctx.shadowBlur = 8;
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.textAlign = isP1 ? 'left' : 'right';
      ctx.textBaseline = 'top';
      ctx.fillText('MAX', isP1 ? baseX + gaugeW + 8 : baseX - 8, gaugeY - 2);
      ctx.shadowBlur = 0;
      ctx.restore();

      const timerBarY = gaugeY + gaugeH + 4;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(Math.round(baseX), timerBarY, gaugeW, 4);

      const greenGrad = ctx.createLinearGradient(Math.round(baseX), timerBarY, Math.round(baseX + gaugeW * pct), timerBarY);
      greenGrad.addColorStop(0, '#22ff66');
      greenGrad.addColorStop(1, '#44ff88');
      ctx.fillStyle = greenGrad;
      ctx.fillRect(Math.round(baseX), timerBarY, Math.round(gaugeW * pct), 4);

      ctx.strokeStyle = 'rgba(100, 255, 100, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(baseX), timerBarY, gaugeW, 4);

      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }
  }
}

// ===== Team Order =====

export interface TeamDisplayInfo {
  members: { name: string; defeated: boolean; active: boolean }[];
}

export function drawTeamOrder(
  ctx: CanvasRenderingContext2D,
  p1Team: TeamDisplayInfo | null,
  p2Team: TeamDisplayInfo | null,
): void {
  if (!p1Team && !p2Team) return;

  const y = HUD_BAR_Y + HUD_BAR_HEIGHT + 14;
  ctx.font = 'bold 9px "Courier New", monospace';
  ctx.textBaseline = 'top';

  if (p1Team) drawTeamSide(ctx, p1Team, HUD_MARGIN, y, 'left');
  if (p2Team) drawTeamSide(ctx, p2Team, CANVAS_WIDTH - HUD_MARGIN, y, 'right');

  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
}

function drawTeamSide(ctx: CanvasRenderingContext2D, team: TeamDisplayInfo, baseX: number, y: number, side: 'left' | 'right'): void {
  const spacing = 16;
  const total = team.members.length;

  for (let i = 0; i < total; i++) {
    const m = team.members[i];
    const x = side === 'left' ? baseX + i * spacing : baseX - (total - 1 - i) * spacing;

    // Character initial with styled background
    if (m.defeated) {
      ctx.fillStyle = '#333';
    } else if (m.active) {
      // Active indicator — gold background
      ctx.fillStyle = '#443300';
      ctx.fillRect(x - 5, y - 1, 10, 11);
      ctx.fillStyle = '#ffcc00';
    } else {
      ctx.fillStyle = '#888';
    }

    ctx.textAlign = 'center';
    ctx.fillText(m.name[0], x, y);

    // Status dot
    const dotY = y + 13;
    ctx.beginPath();
    ctx.arc(x, dotY, 3, 0, Math.PI * 2);
    ctx.fillStyle = m.defeated ? '#333' : m.active ? '#22cc55' : '#555';
    ctx.fill();
    if (m.active && !m.defeated) {
      ctx.strokeStyle = '#22cc55';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

// ===== Combo Counters =====

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

    // Combo count — styled with glow
    const fontSize = 18 + Math.min(comboCount[i], 10);
    ctx.save();
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffcc00';
    ctx.font = `bold ${fontSize}px "Courier New", monospace`;
    ctx.fillText(`${comboCount[i]}`, sx, sy);
    ctx.restore();

    // "COMBO" text below
    ctx.fillStyle = '#ff8844';
    ctx.font = `bold 10px "Courier New", monospace`;
    ctx.fillText('COMBO', sx, sy + 14);
  }
  ctx.restore();
}
