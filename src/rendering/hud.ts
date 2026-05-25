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

// ===== SNK像素字体渲染 =====
// KOF2002风格: 每个字符用像素块绘制, 粗描边+实心填充, 模拟SNK街机ROM字体
const PIXEL_FONT_SCALE = 2; // 每个像素块的尺寸(px)

// 3x5像素字体定义 (SNK风格粗体方块字)
const PIXEL_GLYPHS: Record<string, number[]> = {
  '0': [0b111, 0b101, 0b101, 0b101, 0b111],
  '1': [0b010, 0b110, 0b010, 0b010, 0b111],
  '2': [0b111, 0b001, 0b111, 0b100, 0b111],
  '3': [0b111, 0b001, 0b111, 0b001, 0b111],
  '4': [0b101, 0b101, 0b111, 0b001, 0b001],
  '5': [0b111, 0b100, 0b111, 0b001, 0b111],
  '6': [0b111, 0b100, 0b111, 0b101, 0b111],
  '7': [0b111, 0b001, 0b010, 0b010, 0b010],
  '8': [0b111, 0b101, 0b111, 0b101, 0b111],
  '9': [0b111, 0b101, 0b111, 0b001, 0b111],
  ':': [0b000, 0b010, 0b000, 0b010, 0b000],
  '.': [0b000, 0b000, 0b000, 0b000, 0b010],
  '!': [0b010, 0b010, 0b010, 0b000, 0b010],
  'H': [0b101, 0b101, 0b111, 0b101, 0b101],
  'I': [0b111, 0b010, 0b010, 0b010, 0b111],
  'T': [0b111, 0b010, 0b010, 0b010, 0b010],
  '-': [0b000, 0b000, 0b111, 0b000, 0b000],
};

/**
 * SNK像素字体绘制 — 模拟KOF2002街机ROM字体
 * 每个字符由3x5像素块构成, 带粗黑色描边, SNK标志性风格
 */
function drawPixelText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  scale: number,
  fillColor: string,
  outlineColor: string = '#000000',
  align: 'left' | 'center' | 'right' = 'center',
): void {
  const s = PIXEL_FONT_SCALE * scale;
  const glyphW = 3;
  const glyphH = 5;
  const spacing = 1;
  const totalW = text.length * (glyphW + spacing) - spacing;

  let startX = x;
  if (align === 'center') startX = x - (totalW * s) / 2;
  else if (align === 'right') startX = x - totalW * s;

  const parsed = parseFillColor(fillColor);

  for (let ci = 0; ci < text.length; ci++) {
    const ch = text[ci];
    const glyph = PIXEL_GLYPHS[ch.toUpperCase()];
    if (!glyph) continue;
    const gx = startX + ci * (glyphW + spacing) * s;

    for (let row = 0; row < glyphH; row++) {
      for (let col = 0; col < glyphW; col++) {
        if (glyph[row] & (1 << (glyphW - 1 - col))) {
          const px = gx + col * s;
          const py = y + row * s;
          // 描边 — 1px外框, SNK风格粗边
          ctx.fillStyle = outlineColor;
          ctx.fillRect(px - 1, py - 1, s + 2, s + 2);
          // 填充
          ctx.fillStyle = parsed.fill;
          ctx.fillRect(px, py, s, s);
          // 顶部高光像素
          ctx.fillStyle = parsed.highlight;
          ctx.fillRect(px, py, s, Math.max(1, s * 0.3));
        }
      }
    }
  }
}

// 解析颜色为填充色+高光色
function parseFillColor(color: string): { fill: string; highlight: string } {
  const { r, g, b } = parseColorRGB(color);
  return {
    fill: color,
    highlight: `rgba(${Math.min(255, r + 60)}, ${Math.min(255, g + 60)}, ${Math.min(255, b + 60)}, 0.6)`,
  };
}

function parseColorRGB(color: string): { r: number; g: number; b: number } {
  if (color.startsWith('#')) {
    return {
      r: parseInt(color.slice(1, 3), 16),
      g: parseInt(color.slice(3, 5), 16),
      b: parseInt(color.slice(5, 7), 16),
    };
  }
  if (color.startsWith('rgba(') || color.startsWith('rgb(')) {
    const m = color.match(/(\d+)/g);
    return m ? { r: +m[0], g: +m[1], b: +m[2] } : { r: 128, g: 128, b: 128 };
  }
  return { r: 128, g: 128, b: 128 };
}

export function drawHUD(ctx: CanvasRenderingContext2D, fighters: Fighter[], tick: number, delayedHealth: [number, number], p1Wins: number = 0, p2Wins: number = 0, p1Name: string = '', p2Name: string = '', currentRound: number = 1, firstAttacker: number | null = null): void {
  if (fighters.length < 2) return;
  // HUD背景 — 深色渐变
  const hudGrad = ctx.createLinearGradient(0, 0, 0, 58);
  hudGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  hudGrad.addColorStop(1, 'rgba(10, 8, 15, 0.85)');
  ctx.fillStyle = hudGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, 58);
  // 顶部装饰线 — 金色渐变
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
  // P1标签
  drawSNKText(ctx, '1P', HUD_MARGIN + 8, HUD_BAR_Y - 3, 12, '#ff4444', '#000000', 'center');
  // P1角色名
  if (p1Name) {
    drawSNKText(ctx, p1Name, HUD_MARGIN + 22, HUD_BAR_Y - 8, 10, '#cccccc', '#000000', 'left');
  }
  // P1血条
  const p1Ratio = Math.max(0, fighters[0].health / MAX_HEALTH);
  const p1DelayedRatio = Math.max(0, delayedHealth[0] / MAX_HEALTH);
  drawHealthBar(ctx, HUD_MARGIN, HUD_BAR_Y, HUD_BAR_WIDTH, HUD_BAR_HEIGHT, p1Ratio, p1DelayedRatio, true, tick);
  drawGuardGauge(ctx, HUD_MARGIN, HUD_BAR_Y + HUD_BAR_HEIGHT + 3, HUD_BAR_WIDTH, 5, fighters[0].guardGauge, true, tick);
  // P1低血量警告
  if (p1Ratio <= 0.25 && p1Ratio > 0 && tick % 30 < 20) {
    drawSNKText(ctx, '!', HUD_MARGIN + 8, HUD_BAR_Y + HUD_BAR_HEIGHT + 14, 11, '#ff2200', '#000000', 'center');
  }
  // P2标签
  drawSNKText(ctx, '2P', CANVAS_WIDTH - HUD_MARGIN - 18, HUD_BAR_Y - 3, 12, '#4488ff', '#000000', 'center');
  // P2角色名
  if (p2Name) {
    drawSNKText(ctx, p2Name, CANVAS_WIDTH - HUD_MARGIN - 22, HUD_BAR_Y - 8, 10, '#cccccc', '#000000', 'right');
  }
  // P2血条
  const p2Ratio = Math.max(0, fighters[1].health / MAX_HEALTH);
  const p2DelayedRatio = Math.max(0, delayedHealth[1] / MAX_HEALTH);
  drawHealthBar(ctx, CANVAS_WIDTH - HUD_MARGIN - HUD_BAR_WIDTH, HUD_BAR_Y, HUD_BAR_WIDTH, HUD_BAR_HEIGHT, p2Ratio, p2DelayedRatio, false, tick);
  drawGuardGauge(ctx, CANVAS_WIDTH - HUD_MARGIN - HUD_BAR_WIDTH, HUD_BAR_Y + HUD_BAR_HEIGHT + 3, HUD_BAR_WIDTH, 5, fighters[1].guardGauge, false, tick);
  // P2低血量警告
  if (p2Ratio <= 0.25 && p2Ratio > 0 && tick % 30 < 20) {
    drawSNKText(ctx, '!', CANVAS_WIDTH - HUD_MARGIN - 18, HUD_BAR_Y + HUD_BAR_HEIGHT + 14, 11, '#ff2200', '#000000', 'center');
  }
  // First Attack标记
  if (firstAttacker !== null) {
    const faColor = firstAttacker === 0 ? '#ff6644' : '#4488ff';
    const faX = firstAttacker === 0 ? HUD_MARGIN + HUD_BAR_WIDTH + 10 : CANVAS_WIDTH - HUD_MARGIN - HUD_BAR_WIDTH - 10;
    const faY = HUD_BAR_Y + HUD_BAR_HEIGHT + 16;
    const pulse = Math.sin(tick * 0.1) * 0.3 + 0.7;
    ctx.globalAlpha = pulse;
    drawSNKText(ctx, 'FA', faX + (firstAttacker === 0 ? 30 : -30), faY, 8, faColor, '#000000', 'center');
    ctx.globalAlpha = 1;
  }
  // 计时器 — 像素字体+装饰框
  const timeSeconds = Math.max(0, ROUND_TIME - Math.floor(tick / 60));
  const timeStr = timeSeconds.toString().padStart(2, '0');
  const timerX = CANVAS_WIDTH / 2;
  const timerY = HUD_BAR_Y + 8;
  // 计时器背景 — 圆角+金边, 紧急时红色脉冲
  const urgentPulse = timeSeconds <= 10 ? (Math.sin(tick * 0.2) * 0.3 + 0.4) : 0;
  const bgR = Math.round(10 + urgentPulse * 180);
  ctx.fillStyle = `rgba(${bgR}, 10, 20, 0.9)`;
  roundRect(ctx, timerX - 30, timerY - 17, 60, 32, 8);
  ctx.fill();
  ctx.strokeStyle = '#c8a832';
  ctx.lineWidth = 2;
  roundRect(ctx, timerX - 30, timerY - 17, 60, 32, 8);
  ctx.stroke();
  // 内金边
  ctx.strokeStyle = 'rgba(200, 168, 50, 0.3)';
  ctx.lineWidth = 1;
  roundRect(ctx, timerX - 27, timerY - 14, 54, 26, 6);
  ctx.stroke();
  // 计时器文字 — 像素字体(SNK ROM风格)
  const timerColor = timeSeconds <= 10 ? '#ff4444' : timeSeconds <= 30 ? '#ffcc44' : '#eeeeee';
  const timerScale = timeSeconds <= 10 ? 1.3 : 1.0; // 紧急时放大
  // 10秒以下: 红色闪烁+放大
  if (timeSeconds <= 10) {
    const blinkSpeed = timeSeconds <= 5 ? 0.4 : 0.15;
    const blink = Math.sin(tick * blinkSpeed) > -0.3;
    if (blink) {
      // 红色辉光
      ctx.save();
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 12;
      drawPixelText(ctx, timeStr, timerX, timerY - 5, timerScale, timerColor);
      ctx.restore();
      // 标准文字叠加(保持可读性)
      drawSNKText(ctx, timeStr, timerX, timerY, 24, timerColor);
    }
  } else {
    // 正常: 像素字体+标准字体叠加
    drawPixelText(ctx, timeStr, timerX, timerY - 5, timerScale, timerColor);
    drawSNKText(ctx, timeStr, timerX, timerY, 24, timerColor);
  }
  // "TIME"标签
  drawSNKText(ctx, 'TIME', timerX, timerY - 14, 8, 'rgba(200, 168, 50, 0.7)', '#000000', 'center');
  // 回合指示器 — 菱形(最多3局)
  const maxRounds = 3;
  const dotY = timerY + 20;
  const dotSpacing = 12;
  const dotsStartX = timerX - ((maxRounds - 1) * dotSpacing) / 2;
  for (let r = 1; r <= maxRounds; r++) {
    const dx = dotsStartX + (r - 1) * dotSpacing;
    const ds = r === currentRound ? 3.5 : 2.5;
    ctx.beginPath();
    ctx.moveTo(dx, dotY - ds);
    ctx.lineTo(dx + ds, dotY);
    ctx.lineTo(dx, dotY + ds);
    ctx.lineTo(dx - ds, dotY);
    ctx.closePath();
    if (r === currentRound) {
      const pulse = 0.7 + 0.3 * Math.sin(tick * 0.1);
      ctx.fillStyle = `rgba(255, 204, 0, ${pulse})`;
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (r < currentRound) {
      ctx.fillStyle = '#555';
      ctx.fill();
    } else {
      ctx.strokeStyle = 'rgba(200, 168, 50, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  // 胜利标记 — KOF2002风格菱形(带内部渐变+金边+阴影)
  const winMarkerY = HUD_BAR_Y + HUD_BAR_HEIGHT + 16;
  const winSpacing = HUD_WIN_MARKER_SIZE * 3;
  for (let i = 0; i < p1Wins; i++) {
    drawWinDiamond(ctx, HUD_MARGIN + HUD_BAR_WIDTH + 10 + i * winSpacing, winMarkerY, HUD_WIN_MARKER_SIZE, '#ff6644', tick);
  }
  for (let i = 0; i < p2Wins; i++) {
    drawWinDiamond(ctx, CANVAS_WIDTH - HUD_MARGIN - HUD_BAR_WIDTH - 10 - i * winSpacing, winMarkerY, HUD_WIN_MARKER_SIZE, '#4488ff', tick);
  }
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  // 角色名牌 — 血条下方小字
  drawNamePlate(ctx, HUD_MARGIN, HUD_BAR_Y + HUD_BAR_HEIGHT + 26, p1Name, '#ff6644', 'left');
  drawNamePlate(ctx, CANVAS_WIDTH - HUD_MARGIN, HUD_BAR_Y + HUD_BAR_HEIGHT + 26, p2Name, '#4488ff', 'right');
  // 5秒以下屏幕边缘红色脉冲
  if (timeSeconds <= 5) {
    const vPulse = Math.sin(tick * 0.25) * 0.15 + 0.15;
    const vGrad = ctx.createRadialGradient(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.35, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.7);
    vGrad.addColorStop(0, 'rgba(255, 0, 0, 0)');
    vGrad.addColorStop(1, `rgba(255, 0, 0, ${vPulse})`);
    ctx.fillStyle = vGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
}

/**
 * KOF2002胜利菱形 — 内部渐变+金边+阴影+高光
 * 正版KOF的胜利标记有明显的3D立体感: 上半亮、下半暗、中心高光
 */
function drawWinDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, tick: number): void {
  const s = size;
  // 外部阴影
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 1;
  // 菱形路径
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.lineTo(x + s, y);
  ctx.lineTo(x, y + s);
  ctx.lineTo(x - s, y);
  ctx.closePath();
  // 内部渐变填充 — 上亮下暗, 3D效果
  const innerGrad = ctx.createLinearGradient(x, y - s, x, y + s);
  innerGrad.addColorStop(0, shiftColor(color, 60));
  innerGrad.addColorStop(0.4, color);
  innerGrad.addColorStop(1, shiftColor(color, -50));
  ctx.fillStyle = innerGrad;
  ctx.fill();
  ctx.restore();
  // 金色外边框
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.lineTo(x + s, y);
  ctx.lineTo(x, y + s);
  ctx.lineTo(x - s, y);
  ctx.closePath();
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // 内部高光 — 上半菱形亮斑
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.8);
  ctx.lineTo(x + s * 0.4, y - s * 0.1);
  ctx.lineTo(x, y + s * 0.1);
  ctx.lineTo(x - s * 0.4, y - s * 0.1);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fill();
  // 中心高光点 — 微弱脉冲
  const glowPulse = 0.3 + 0.15 * Math.sin(tick * 0.08);
  ctx.beginPath();
  ctx.arc(x, y - s * 0.2, s * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 255, 200, ${glowPulse})`;
  ctx.fill();
}

/**
 * 角色名牌 — 血条下方小字显示 "P1: KYO"
 * KOF2002正版: 名牌在血条正下方, 半透明底色, 小号字
 */
function drawNamePlate(ctx: CanvasRenderingContext2D, x: number, y: number, name: string, playerColor: string, align: 'left' | 'right'): void {
  if (!name) return;
  const text = `${playerColor === '#ff6644' ? 'P1' : 'P2'}: ${name}`;
  // 半透明底色
  const plateW = 70;
  const plateH = 12;
  const plateX = align === 'left' ? x : x - plateW;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  roundRect(ctx, plateX, y - 2, plateW, plateH, 3);
  ctx.fill();
  // 左侧角色色条
  ctx.fillStyle = playerColor;
  if (align === 'left') {
    ctx.fillRect(plateX, y - 2, 2, plateH);
  } else {
    ctx.fillRect(plateX + plateW - 2, y - 2, 2, plateH);
  }
  // 文字
  drawSNKText(ctx, text, align === 'left' ? plateX + 4 : plateX + plateW - 4, y + 4, 9, 'rgba(200, 200, 200, 0.8)', '#000000', align);
}

function drawHealthBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, ratio: number, delayedRatio: number, leftAligned: boolean, frameCount: number): void {
  // 外框 — 深底+金边, 低血量红色脉冲
  ctx.fillStyle = '#05050a';
  roundRect(ctx, x - 3, y - 3, w + 6, h + 6, 5);
  ctx.fill();
  const borderPulse = ratio <= 0.25 ? (Math.sin(frameCount * 0.2) * 0.3 + 0.5) : 0.4;
  const borderCol = ratio <= 0.25 ? `rgba(255, 60, 0, ${borderPulse})` : 'rgba(200, 168, 50, 0.4)';
  ctx.strokeStyle = borderCol;
  ctx.lineWidth = ratio <= 0.25 ? 2 : 1;
  roundRect(ctx, x - 3, y - 3, w + 6, h + 6, 5);
  ctx.stroke();
  // 内背景
  ctx.fillStyle = '#0f0f18';
  roundRect(ctx, x, y, w, h, 3);
  ctx.fill();
  // 10%分段线 — KOF2002正版: 深色嵌入线, 不是覆盖标记
  // 使用略亮于背景但暗于血量的颜色, 模拟正版分段刻度
  for (let t = 0.1; t < 1; t += 0.1) {
    const tx = leftAligned ? x + w * t : x + w * (1 - t);
    // 外刻度线 — 贯穿血条的深色线
    ctx.strokeStyle = 'rgba(5, 5, 15, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(tx, y + 1); ctx.lineTo(tx, y + h - 1); ctx.stroke();
    // 内嵌高亮线 — 模拟正版的玻璃分割线效果
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(tx + 1, y + 1); ctx.lineTo(tx + 1, y + h - 1); ctx.stroke();
  }
  // 残影血条(延迟血量) — 红色残影
  const delayedFillW = Math.round(w * delayedRatio);
  if (delayedFillW > 0 && delayedRatio > ratio) {
    ctx.fillStyle = 'rgba(200, 60, 40, 0.6)';
    if (leftAligned) {
      roundRect(ctx, x, y, delayedFillW, h, 3);
      ctx.fill();
    } else {
      roundRect(ctx, x + w - delayedFillW, y, delayedFillW, h, 3);
      ctx.fill();
    }
  }
  // 血条填充
  const fillW = Math.round(w * ratio);
  if (fillW <= 0) return;
  const isLowHealth = ratio <= 0.30;
  const healthColor = ratio > 0.30 ? '#e8b820' : '#FF8C00';
  const healthGrad = ctx.createLinearGradient(x, y, x, y + h);
  healthGrad.addColorStop(0, shiftColor(healthColor, 50));
  healthGrad.addColorStop(0.3, shiftColor(healthColor, 20));
  healthGrad.addColorStop(0.7, healthColor);
  healthGrad.addColorStop(1, shiftColor(healthColor, -30));
  // 低血量发光
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
  // 顶部高光
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  const shineW = Math.max(0, fillW - 6);
  if (shineW > 0) {
    if (leftAligned) {
      ctx.fillRect(x + 3, y + 1, shineW, 3);
    } else {
      ctx.fillRect(x + w - fillW + 3, y + 1, shineW, 3);
    }
  }
  // 边框
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 3);
  ctx.stroke();
}

function drawGuardGauge(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, gauge: number, leftAligned: boolean, tick: number = 0): void {
  const ratio = Math.max(0, Math.min(1, gauge / 100));
  const fillW = w * ratio;
  // 防御槽危急抖动
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
  // 防御崩坏预警
  if (ratio <= 0.3 && ratio > 0) {
    const warnPulse = Math.sin(tick * 0.25) * 0.5 + 0.5;
    ctx.strokeStyle = `rgba(255, 40, 40, ${warnPulse * 0.8})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(sx - 1, sy - 1, w + 2, h + 2);
  }
  // 防御槽危急发光
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
  // 防御槽健康绿光
  if (ratio >= 0.8) {
    const greenPulse = Math.sin(tick * 0.08) * 0.15 + 0.15;
    ctx.strokeStyle = `rgba(68, 255, 136, ${greenPulse})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(sx - 1, sy - 1, w + 2, h + 2);
  }
}

/**
 * 能量槽渲染 — KOF2002正版金色发光
 * 满stock时该段金色脉冲发光, DM可用时整条边框微亮
 */
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
    // 背景框+金边
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    roundRect(ctx, baseX - 3, gaugeY - 3, gaugeW + 6, gaugeH + 6, 5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(200, 168, 50, 0.3)';
    ctx.lineWidth = 1;
    roundRect(ctx, baseX - 3, gaugeY - 3, gaugeW + 6, gaugeH + 6, 5);
    ctx.stroke();
    // 每段
    for (let s = 0; s < MAX_STOCKS; s++) {
      const segX = baseX + s * (segW + segGap);
      const isFilled = s < gauge.stocks;
      const isCharging = s === gauge.stocks && gauge.meter > 0;
      // 段背景
      ctx.fillStyle = '#0f0f18';
      ctx.fillRect(segX, gaugeY, segW, gaugeH);
      if (isFilled) {
        // 已满 — 金色脉冲发光(KOF2002标志性金色glow)
        const glowPhase = Math.sin(Date.now() / 150 + s * 0.5);
        const glowAlpha = 0.7 + 0.3 * glowPhase;
        // 底层辉光
        ctx.save();
        ctx.shadowColor = `rgba(255, 180, 0, ${glowAlpha * 0.6})`;
        ctx.shadowBlur = 6 + 3 * glowPhase;
        const segGrad = ctx.createLinearGradient(segX, gaugeY, segX + segW, gaugeY);
        segGrad.addColorStop(0, '#ff8800');
        segGrad.addColorStop(0.3, '#ffaa22');
        segGrad.addColorStop(0.5, '#ffcc00');
        segGrad.addColorStop(0.7, '#ffaa22');
        segGrad.addColorStop(1, '#ff8800');
        ctx.fillStyle = segGrad;
        ctx.fillRect(segX, gaugeY, segW, gaugeH);
        ctx.restore();
        // 顶部高光
        ctx.fillStyle = `rgba(255, 255, 200, ${0.2 + 0.1 * glowPhase})`;
        ctx.fillRect(segX, gaugeY, segW, 2);
        // 底部暗边
        ctx.fillStyle = 'rgba(100, 50, 0, 0.3)';
        ctx.fillRect(segX, gaugeY + gaugeH - 1, segW, 1);
      } else if (isCharging) {
        const fillRatio = gauge.meter / gauge.maxMeter;
        const fillW = fillRatio * segW;
        // 充电渐变
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
      // 段边框
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(segX, gaugeY, segW, gaugeH);
    }
    // DM可用脉冲边框
    if (gauge.stocks >= 1 && !maxMode.active) {
      const readyPulse = Math.sin(Date.now() / 200) * 0.15 + 0.15;
      ctx.strokeStyle = `rgba(255, 170, 0, ${readyPulse})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(baseX) - 1, gaugeY - 1, gaugeW + 2, gaugeH + 2);
    }
    // MAX满槽提示
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
    // MAX模式计时条
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
    if (m.defeated) {
      ctx.fillStyle = '#333';
    } else if (m.active) {
      ctx.fillStyle = '#443300';
      ctx.fillRect(x - 5, y - 1, 10, 11);
      ctx.fillStyle = '#ffcc00';
    } else {
      ctx.fillStyle = '#888';
    }
    ctx.textAlign = 'center';
    ctx.fillText(m.name[0], x, y);
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

/**
 * 连击计数器 — KOF2002风格
 * 大连击(7+)金色边框, HIT标签小字, 伤害分级
 */
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
    const combo = comboCount[i];
    let comboColor: string;
    let glowColor: string;
    if (combo >= 20) { comboColor = '#ff2222'; glowColor = '#ff0000'; }
    else if (combo >= 10) { comboColor = '#ff8800'; glowColor = '#ff6600'; }
    else if (combo >= 5) { comboColor = '#ffcc00'; glowColor = '#ffaa00'; }
    else { comboColor = '#ffffff'; glowColor = '#ffcc44'; }
    // 连击数 — SNK风格发光+脉冲
    const baseFontSize = 20 + Math.min(combo, 15);
    const pulseScale = comboTimer[i] > 50 ? 1.15 : 1.0;
    const fontSize = baseFontSize * pulseScale;
    // 连击即将消失闪烁
    const isFading = comboTimer[i] < 12;
    const flashCol = isFading && comboTimer[i] % 3 < 2 ? '#ffffff' : comboColor;
    const flashGlow = isFading ? '#ffffff' : glowColor;
    // 7+连击: 金色边框/外框效果
    if (combo >= 7) {
      const goldGlow = Math.sin(Date.now() / 80) * 0.3 + 0.7;
      ctx.save();
      ctx.shadowColor = `rgba(255, 200, 0, ${goldGlow})`;
      ctx.shadowBlur = 16 + Math.min(combo, 15);
      // 金色外描边
      ctx.font = `bold ${fontSize}px "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = `rgba(255, 200, 0, ${goldGlow * 0.8})`;
      ctx.lineWidth = Math.max(3, Math.round(fontSize / 5));
      ctx.lineJoin = 'round';
      ctx.strokeText(`${combo}`, sx, sy);
      ctx.restore();
    }
    // 连击数主文字
    ctx.save();
    ctx.shadowColor = flashGlow;
    ctx.shadowBlur = 12 + Math.min(combo, 10);
    drawSNKText(ctx, `${combo}`, sx, sy, fontSize, flashCol);
    ctx.restore();
    // "HIT"标签 — 小字, 位于数字右下(KOF2002正版布局)
    const hitOffsetX = 12 + Math.min(combo, 10) * 0.5;
    const hitOffsetY = 6;
    const hitColor = combo >= 7 ? '#ffcc00' : comboColor;
    drawSNKText(ctx, 'HIT', sx + hitOffsetX, sy + hitOffsetY, 9, hitColor);
    // 连击总伤害
    if (comboDamage && comboDamage[i] > 0) {
      const totalDmg = comboDamage[i];
      const dmgCol = totalDmg >= 200 ? '#ff2222' : totalDmg >= 100 ? '#ff6644' : '#ffcc44';
      drawSNKText(ctx, `${totalDmg}`, sx, sy + 30, totalDmg >= 200 ? 15 : 13, dmgCol);
    }
    // 连击计时条
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
