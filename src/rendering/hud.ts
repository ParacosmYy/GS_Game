/**
 * HUD rendering — SNK-style health bars, power gauge, timer, guard gauge, combo counters
 */
import { Fighter } from '../entities/fighter.js';
import { Camera } from '../core/camera.js';
import type { PowerGauge, MaxModeState } from '../core/types.js';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, MAX_HEALTH, MAX_STOCKS, ROUND_TIME,
  HUD_BAR_WIDTH, HUD_BAR_HEIGHT, HUD_BAR_Y, HUD_MARGIN,
  HUD_TIMER_SIZE, HUD_GAUGE_Y, HUD_GAUGE_WIDTH, HUD_GAUGE_HEIGHT,
  HUD_GAUGE_SEGMENT_GAP, HUD_WIN_MARKER_SIZE,
} from '../core/constants.js';
import { shiftColor, roundRect, drawSNKText } from './utils.js';
export function drawHUD(ctx: CanvasRenderingContext2D, fighters: Fighter[], tick: number, delayedHealth: [number, number], p1Wins: number = 0, p2Wins: number = 0, p1Name: string = '', p2Name: string = '', currentRound: number = 1, firstAttacker: number | null = null): void {
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
  drawSNKText(ctx, '1P', HUD_MARGIN + 8, HUD_BAR_Y - 3, 12, '#ff4444', '#000000', 'center');
  // P1 character name — SNK style
  if (p1Name) {
    drawSNKText(ctx, p1Name, HUD_MARGIN + 22, HUD_BAR_Y - 8, 10, '#cccccc', '#000000', 'left');
  }
  // P1 health bar
  const p1Ratio = Math.max(0, fighters[0].health / MAX_HEALTH);
  const p1DelayedRatio = Math.max(0, delayedHealth[0] / MAX_HEALTH);
  drawHealthBar(ctx, HUD_MARGIN, HUD_BAR_Y, HUD_BAR_WIDTH, HUD_BAR_HEIGHT, p1Ratio, p1DelayedRatio, true, tick);
  drawGuardGauge(ctx, HUD_MARGIN, HUD_BAR_Y + HUD_BAR_HEIGHT + 3, HUD_BAR_WIDTH, 5, fighters[0].guardGauge, true, tick);
  // KOF2002: P1 low health DANGER warning
  if (p1Ratio <= 0.25 && p1Ratio > 0 && tick % 30 < 20) {
    drawSNKText(ctx, '!', HUD_MARGIN + 8, HUD_BAR_Y + HUD_BAR_HEIGHT + 14, 11, '#ff2200', '#000000', 'center');
  }
  // P2 label — styled
  drawSNKText(ctx, '2P', CANVAS_WIDTH - HUD_MARGIN - 18, HUD_BAR_Y - 3, 12, '#4488ff', '#000000', 'center');
  // P2 character name — SNK style
  if (p2Name) {
    drawSNKText(ctx, p2Name, CANVAS_WIDTH - HUD_MARGIN - 22, HUD_BAR_Y - 8, 10, '#cccccc', '#000000', 'right');
  }
  // P2 health bar
  const p2Ratio = Math.max(0, fighters[1].health / MAX_HEALTH);
  const p2DelayedRatio = Math.max(0, delayedHealth[1] / MAX_HEALTH);
  drawHealthBar(ctx, CANVAS_WIDTH - HUD_MARGIN - HUD_BAR_WIDTH, HUD_BAR_Y, HUD_BAR_WIDTH, HUD_BAR_HEIGHT, p2Ratio, p2DelayedRatio, false, tick);
  drawGuardGauge(ctx, CANVAS_WIDTH - HUD_MARGIN - HUD_BAR_WIDTH, HUD_BAR_Y + HUD_BAR_HEIGHT + 3, HUD_BAR_WIDTH, 5, fighters[1].guardGauge, false, tick);
  // KOF2002: P2 low health DANGER warning
  if (p2Ratio <= 0.25 && p2Ratio > 0 && tick % 30 < 20) {
    drawSNKText(ctx, '!', CANVAS_WIDTH - HUD_MARGIN - 18, HUD_BAR_Y + HUD_BAR_HEIGHT + 14, 11, '#ff2200', '#000000', 'center');
  }
  // KOF2002: First Attack badge — persistent indicator for the round
  if (firstAttacker !== null) {
    const faColor = firstAttacker === 0 ? '#ff6644' : '#4488ff';
    const faX = firstAttacker === 0 ? HUD_MARGIN + HUD_BAR_WIDTH + 10 : CANVAS_WIDTH - HUD_MARGIN - HUD_BAR_WIDTH - 10;
    const faY = HUD_BAR_Y + HUD_BAR_HEIGHT + 16;
    const pulse = Math.sin(tick * 0.1) * 0.3 + 0.7;
    ctx.globalAlpha = pulse;
    drawSNKText(ctx, 'FA', faX + (firstAttacker === 0 ? 30 : -30), faY, 8, faColor, '#000000', 'center');
    ctx.globalAlpha = 1;
  }
  // Timer — decorative frame
  const timeSeconds = Math.max(0, ROUND_TIME - Math.floor(tick / 60));
  const timeStr = timeSeconds.toString().padStart(2, '0');
  const timerX = CANVAS_WIDTH / 2;
  const timerY = HUD_BAR_Y + 8;
  // Timer background — rounded with gold border, red pulse when low
  const urgentPulse = timeSeconds <= 10 ? (Math.sin(tick * 0.2) * 0.3 + 0.4) : 0;
  const bgR = Math.round(10 + urgentPulse * 180);
  ctx.fillStyle = `rgba(${bgR}, 10, 20, 0.9)`;
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
  // Timer text — SNK style with blink when low
  const timerColor = timeSeconds <= 10 ? '#ff4444' : timeSeconds <= 30 ? '#ffcc44' : '#eeeeee';
  if (timeSeconds <= 10) {
    ctx.save();
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 8;
    // Blink faster as time runs out: 10s = slow blink, 5s = fast blink
    const blinkSpeed = timeSeconds <= 5 ? 0.4 : 0.15;
    const blink = Math.sin(tick * blinkSpeed) > -0.3;
    if (blink) drawSNKText(ctx, timeStr, timerX, timerY, 24, timerColor);
    ctx.restore();
  } else {
    drawSNKText(ctx, timeStr, timerX, timerY, 24, timerColor);
  }
  // "TIME" 标签在计时器上方 — SNK style
  drawSNKText(ctx, 'TIME', timerX, timerY - 14, 8, 'rgba(200, 168, 50, 0.7)', '#000000', 'center');
  // Round指示器 — 圆点(最多3局)
  const maxRounds = 3;
  const dotY = timerY + 20;
  const dotSpacing = 8;
  const dotsStartX = timerX - ((maxRounds - 1) * dotSpacing) / 2;
  for (let r = 1; r <= maxRounds; r++) {
    const dx = dotsStartX + (r - 1) * dotSpacing;
    ctx.beginPath();
    ctx.arc(dx, dotY, 2.5, 0, Math.PI * 2);
    if (r === currentRound) {
      ctx.fillStyle = '#ffcc00';
      ctx.fill();
    } else if (r < currentRound) {
      ctx.fillStyle = '#666';
      ctx.fill();
    } else {
      ctx.strokeStyle = 'rgba(200, 168, 50, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
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
  // KOF2002: 计时器<5秒屏幕边缘红色脉冲警告
  if (timeSeconds <= 5) {
    const vPulse = Math.sin(tick * 0.25) * 0.15 + 0.15;
    const vGrad = ctx.createRadialGradient(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.35, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.7);
    vGrad.addColorStop(0, 'rgba(255, 0, 0, 0)');
    vGrad.addColorStop(1, `rgba(255, 0, 0, ${vPulse})`);
    ctx.fillStyle = vGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
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
function drawHealthBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, ratio: number, delayedRatio: number, leftAligned: boolean, frameCount: number): void {
  // Outer frame — darker with gold border, red pulse when low HP
  ctx.fillStyle = '#05050a';
  roundRect(ctx, x - 3, y - 3, w + 6, h + 6, 5);
  ctx.fill();
  const borderPulse = ratio <= 0.25 ? (Math.sin(frameCount * 0.2) * 0.3 + 0.5) : 0.4;
  const borderCol = ratio <= 0.25 ? `rgba(255, 60, 0, ${borderPulse})` : 'rgba(200, 168, 50, 0.4)';
  ctx.strokeStyle = borderCol;
  ctx.lineWidth = ratio <= 0.25 ? 2 : 1;
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
  // Low health glow — KOF2002: <10%极速红色脉冲, <25%橙色脉冲
  if (isLowHealth) {
    ctx.save();
    const isCritical = ratio < 0.1;
    const pulseSpeed = isCritical ? 0.3 : 0.1;
    const pulseAlpha = isCritical ? 0.5 + 0.3 * Math.sin(frameCount * pulseSpeed) : 0.3 + 0.2 * Math.sin(frameCount * pulseSpeed);
    const glowColor = isCritical ? `rgba(255, 30, 0, ${pulseAlpha})` : `rgba(255, 100, 0, ${pulseAlpha + 0.3})`;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = isCritical ? 16 + 8 * Math.sin(frameCount * 0.25) : 10 + 5 * Math.sin(frameCount * 0.15);
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
function drawGuardGauge(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, gauge: number, leftAligned: boolean, tick: number = 0): void {
  const ratio = Math.max(0, Math.min(1, gauge / 100));
  const fillW = w * ratio;
  // KOF2002: 防御槽危急时微抖(< 20%), 产生紧迫感
  const critShake = ratio > 0 && ratio < 0.2 ? Math.sin(tick * 0.5) * 1.5 : 0;
  const sx = x + critShake;
  const sy = y;
  ctx.fillStyle = '#05050a';
  ctx.fillRect(sx - 1, sy - 1, w + 2, h + 2);
  ctx.fillStyle = '#0f0f18';
  ctx.fillRect(sx, sy, w, h);
  if (fillW > 0) {
    let gaugeColor: string;
    if (ratio > 0.6) {
      gaugeColor = '#4488ff';
    } else if (ratio > 0.3) {
      gaugeColor = '#ccaa22';
    } else {
      const blink = Math.sin(tick * 0.3) > 0;
      gaugeColor = blink ? '#ff4455' : '#cc2233';
    }
    const grad = ctx.createLinearGradient(sx, sy, sx, sy + h);
    grad.addColorStop(0, shiftColor(gaugeColor, 40));
    grad.addColorStop(0.5, gaugeColor);
    grad.addColorStop(1, shiftColor(gaugeColor, -20));
    ctx.fillStyle = grad;
    if (leftAligned) {
      ctx.fillRect(sx, sy, fillW, h);
    } else {
      ctx.fillRect(sx + w - fillW, sy, fillW, h);
    }
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.strokeRect(sx, sy, w, h);
  // 防御崩坏预警 — 低于30%时边框闪烁红光
  if (ratio <= 0.3 && ratio > 0) {
    const warnPulse = Math.sin(tick * 0.25) * 0.5 + 0.5;
    ctx.strokeStyle = `rgba(255, 40, 40, ${warnPulse * 0.8})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(sx - 1, sy - 1, w + 2, h + 2);
  }
  // 防御槽危急(<20%)额外发光扩散
  if (ratio > 0 && ratio < 0.2) {
    const critGlow = Math.sin(tick * 0.4) * 0.3 + 0.4;
    ctx.save();
    ctx.shadowColor = `rgba(255, 30, 30, ${critGlow})`;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = `rgba(255, 60, 40, ${critGlow})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(sx - 2, sy - 2, w + 4, h + 4);
    ctx.restore();
  }
  // 防御槽健康(>80%)时微弱绿光
  if (ratio >= 0.8) {
    const greenPulse = Math.sin(tick * 0.08) * 0.15 + 0.15;
    ctx.strokeStyle = `rgba(68, 255, 136, ${greenPulse})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(sx - 1, sy - 1, w + 2, h + 2);
  }
}
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
        const fillRatio = gauge.meter / gauge.maxMeter;
        const fillW = fillRatio * segW;
        // KOF2002: 充电中渐变 — 接近充满时脉冲更亮
        const nearFull = fillRatio > 0.75;
        const brightPulse = nearFull ? 0.7 + 0.3 * Math.sin(Date.now() / 100) : 1.0;
        const partialGrad = ctx.createLinearGradient(segX, gaugeY, segX + fillW, gaugeY);
        partialGrad.addColorStop(0, nearFull ? '#ff9933' : '#cc8844');
        partialGrad.addColorStop(1, nearFull ? '#ffcc44' : '#ffaa55');
        ctx.globalAlpha = brightPulse;
        ctx.fillStyle = partialGrad;
        ctx.fillRect(segX, gaugeY, fillW, gaugeH);
        ctx.globalAlpha = 1;
      }
      // Segment border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(segX, gaugeY, segW, gaugeH);
    }
    // KOF2002: 气槽可用脉冲 — 有stock时边框微弱发光提示DM可用
    if (gauge.stocks >= 1 && !maxMode.active) {
      const readyPulse = Math.sin(Date.now() / 200) * 0.15 + 0.15;
      ctx.strokeStyle = `rgba(255, 170, 0, ${readyPulse})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(baseX) - 1, gaugeY - 1, gaugeW + 2, gaugeH + 2);
    }
    // MAX text when full — SNK style
    if (!maxMode.active && gauge.stocks >= MAX_STOCKS) {
      const pulseAlpha = 0.7 + 0.3 * Math.sin(Date.now() / 120);
      ctx.save();
      ctx.globalAlpha = pulseAlpha;
      ctx.shadowColor = '#ff8800';
      ctx.shadowBlur = 12 + 4 * Math.sin(Date.now() / 80);
      drawSNKText(ctx, 'MAX', isP1 ? baseX + gaugeW + 14 : baseX - 14, gaugeY + 6, 13, '#ffcc00', '#000000', isP1 ? 'left' : 'right');
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      ctx.restore();
    }
    // MAX mode timer bar
    if (maxMode.active) {
      const pct = maxMode.timer / maxMode.maxDuration;
      const pulseAlpha = 0.7 + Math.sin(Date.now() / 100) * 0.3;
      ctx.save();
      ctx.globalAlpha = pulseAlpha;
      ctx.shadowColor = '#00ff44';
      ctx.shadowBlur = 8;
      drawSNKText(ctx, 'MAX', isP1 ? baseX + gaugeW + 14 : baseX - 14, gaugeY + 6, 12, '#66ff88', '#000000', isP1 ? 'left' : 'right');
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
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
export function drawComboCounters(
  ctx: CanvasRenderingContext2D,
  fighters: Fighter[],
  comboCount: number[],
  comboTimer: number[],
  camera: Camera,
  comboDamage?: number[],
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
    // 连击数颜色随连击数变化: 2-4白, 5-9黄, 10-19橙, 20+红
    const combo = comboCount[i];
    let comboColor: string;
    let glowColor: string;
    if (combo >= 20) { comboColor = '#ff2222'; glowColor = '#ff0000'; }
    else if (combo >= 10) { comboColor = '#ff8800'; glowColor = '#ff6600'; }
    else if (combo >= 5) { comboColor = '#ffcc00'; glowColor = '#ffaa00'; }
    else { comboColor = '#ffffff'; glowColor = '#ffcc44'; }
    // Combo count — SNK style with glow + pulse on recent hit
    const baseFontSize = 20 + Math.min(combo, 15);
    const pulseScale = comboTimer[i] > 50 ? 1.15 : 1.0;
    const fontSize = baseFontSize * pulseScale;
    // KOF2002: 连击即将消失时闪烁白色
    const flashCol = comboTimer[i] < 8 && comboTimer[i] % 3 < 2 ? '#ffffff' : comboColor;
    const flashGlow = comboTimer[i] < 8 ? '#ffffff' : glowColor;
    ctx.save();
    ctx.shadowColor = flashGlow;
    ctx.shadowBlur = 12 + Math.min(combo, 10);
    drawSNKText(ctx, `${combo}`, sx, sy, fontSize, flashCol);
    ctx.restore();
    // "HIT" text below — SNK style
    drawSNKText(ctx, 'HIT', sx, sy + 16, 11, comboColor);
    // Combo damage total display — SNK style
    if (comboDamage && comboDamage[i] > 0) {
      // KOF2002: 连击总伤害颜色分级 — 高伤害红, 中伤害橙, 低伤害黄
      const totalDmg = comboDamage[i];
      const dmgCol = totalDmg >= 200 ? '#ff2222' : totalDmg >= 100 ? '#ff6644' : '#ffcc44';
      drawSNKText(ctx, `${totalDmg}`, sx, sy + 30, totalDmg >= 200 ? 15 : 13, dmgCol);
    }
    // Combo timer bar — shows remaining combo window
    const ctRatio = Math.max(0, comboTimer[i] / 60);
    if (ctRatio > 0) {
      const barW = 30, barH = 2;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(sx - barW / 2, sy + 38, barW, barH);
      const ctCol = ctRatio > 0.5 ? '#22cc55' : ctRatio > 0.25 ? '#ffcc00' : '#ff4444';
      ctx.fillStyle = ctCol;
      ctx.fillRect(sx - barW / 2, sy + 38, barW * ctRatio, barH);
    }
  }
  ctx.restore();
}
