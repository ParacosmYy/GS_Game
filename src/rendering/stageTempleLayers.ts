/**
 * Temple stage individual layer renderers — sky, mountains, buildings, ground, particles
 * Split from stageTemple.ts to keep file size under 600 lines
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT, STAGE_GROUND_Y } from '../core/constants.js';
import { roundRect } from './utils.js';
import type { Star } from './stageTemple.js';

// ===== Re-exported helpers =====

export function shiftHex(color: string, amount: number): string {
  const r = Math.max(0, Math.min(255, parseInt(color.slice(1, 3), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(color.slice(3, 5), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(color.slice(5, 7), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

// ===== Layer 0: Sky =====

export function drawSky(ctx: CanvasRenderingContext2D, stars: Star[], globalTick: number): void {
  // 夜空渐变
  const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  skyGrad.addColorStop(0, '#0c1029');
  skyGrad.addColorStop(0.25, '#141840');
  skyGrad.addColorStop(0.5, '#1a1e4a');
  skyGrad.addColorStop(0.75, '#1e1540');
  skyGrad.addColorStop(1, '#1a1035');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 星云辉光
  const nebulaGrad = ctx.createRadialGradient(CANVAS_WIDTH / 2, 150, 20, CANVAS_WIDTH / 2, 150, 350);
  nebulaGrad.addColorStop(0, 'rgba(80, 50, 120, 0.12)');
  nebulaGrad.addColorStop(0.5, 'rgba(60, 40, 100, 0.06)');
  nebulaGrad.addColorStop(1, 'rgba(40, 30, 80, 0)');
  ctx.fillStyle = nebulaGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, 400);

  // 月亮
  drawMoon(ctx, globalTick);

  // 星星
  for (const star of stars) {
    const twinkle = star.brightness * (0.5 + 0.5 * Math.sin(globalTick * 0.03 * star.speed + star.x));
    ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, 0.5 + star.brightness * 0.5, 0, Math.PI * 2);
    ctx.fill();
    if (star.brightness > 0.7) {
      ctx.fillStyle = `rgba(200,220,255,${twinkle * 0.2})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawMoon(ctx: CanvasRenderingContext2D, tick: number): void {
  const mx = 680;
  const my = 70;

  // 大气辉光
  const outerGlow = ctx.createRadialGradient(mx, my, 5, mx, my, 180);
  outerGlow.addColorStop(0, 'rgba(200, 200, 255, 0.15)');
  outerGlow.addColorStop(0.3, 'rgba(160, 160, 220, 0.08)');
  outerGlow.addColorStop(0.6, 'rgba(120, 120, 200, 0.03)');
  outerGlow.addColorStop(1, 'rgba(100, 80, 150, 0)');
  ctx.fillStyle = outerGlow;
  ctx.fillRect(mx - 180, my - 180, 360, 360);

  // 月盘
  const moonGrad = ctx.createRadialGradient(mx - 4, my - 4, 0, mx, my, 25);
  moonGrad.addColorStop(0, 'rgba(240, 240, 255, 0.6)');
  moonGrad.addColorStop(0.5, 'rgba(220, 220, 240, 0.4)');
  moonGrad.addColorStop(0.8, 'rgba(200, 200, 230, 0.2)');
  moonGrad.addColorStop(1, 'rgba(180, 180, 210, 0)');
  ctx.fillStyle = moonGrad;
  ctx.beginPath();
  ctx.arc(mx, my, 25, 0, Math.PI * 2);
  ctx.fill();

  // 月球环形山
  ctx.fillStyle = 'rgba(180, 180, 200, 0.1)';
  ctx.beginPath(); ctx.arc(mx - 5, my - 3, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(mx + 7, my + 4, 3, 0, Math.PI * 2); ctx.fill();
}

// ===== Clouds =====

export interface Cloud {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  alpha: number;
}

export function drawClouds(ctx: CanvasRenderingContext2D, tick: number, clouds: Cloud[]): void {
  for (const cloud of clouds) {
    const cx = (cloud.x + tick * cloud.speed) % (CANVAS_WIDTH + cloud.w * 2) - cloud.w;
    ctx.save();
    ctx.globalAlpha = cloud.alpha;
    ctx.fillStyle = '#8888bb';
    ctx.beginPath();
    ctx.ellipse(cx, cloud.y, cloud.w / 2, cloud.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + cloud.w * 0.3, cloud.y - cloud.h * 0.2, cloud.w * 0.35, cloud.h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx - cloud.w * 0.2, cloud.y + cloud.h * 0.1, cloud.w * 0.3, cloud.h * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ===== Layer 1: Mountains =====

export function drawDistantMountains(ctx: CanvasRenderingContext2D, cameraX: number): void {
  const px = cameraX * 0.1;

  // 四层山体
  const layers = [
    { color: '#1a1a3d', h: 180, ox: -50, w: 400 },
    { color: '#181840', h: 140, ox: 200, w: 350 },
    { color: '#20204a', h: 200, ox: 450, w: 380 },
    { color: '#16163a', h: 150, ox: 700, w: 320 },
  ];

  const baseY = STAGE_GROUND_Y - 30;

  for (const layer of layers) {
    const startX = layer.ox - px;
    ctx.fillStyle = layer.color;
    ctx.beginPath();
    ctx.moveTo(startX, baseY);
    ctx.quadraticCurveTo(startX + layer.w * 0.15, baseY - layer.h * 0.7, startX + layer.w * 0.35, baseY - layer.h);
    ctx.quadraticCurveTo(startX + layer.w * 0.5, baseY - layer.h * 1.05, startX + layer.w * 0.65, baseY - layer.h * 0.85);
    ctx.quadraticCurveTo(startX + layer.w * 0.85, baseY - layer.h * 0.4, startX + layer.w, baseY);
    ctx.closePath();
    ctx.fill();

    // 高峰积雪
    if (layer.h > 170) {
      ctx.fillStyle = 'rgba(200, 200, 230, 0.08)';
      ctx.beginPath();
      const peakX = startX + layer.w * 0.45;
      ctx.moveTo(peakX - 30, baseY - layer.h + 15);
      ctx.lineTo(peakX, baseY - layer.h);
      ctx.lineTo(peakX + 30, baseY - layer.h + 15);
      ctx.closePath();
      ctx.fill();
    }
  }

  // 雾气层
  const mistGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y - 100, 0, STAGE_GROUND_Y - 15);
  mistGrad.addColorStop(0, 'rgba(30, 25, 55, 0)');
  mistGrad.addColorStop(0.4, 'rgba(40, 35, 65, 0.15)');
  mistGrad.addColorStop(0.8, 'rgba(35, 30, 60, 0.25)');
  mistGrad.addColorStop(1, 'rgba(30, 25, 55, 0)');
  ctx.fillStyle = mistGrad;
  ctx.fillRect(0, STAGE_GROUND_Y - 100, CANVAS_WIDTH, 85);
}

// ===== Layer 2: Temple buildings =====

export interface Lantern {
  baseX: number;
  baseY: number;
  size: number;
  swayPhase: number;
  color: string;
}

export function drawTempleBuildings(
  ctx: CanvasRenderingContext2D, cameraX: number, tick: number,
  lanterns: Lantern[], clouds: Cloud[],
): void {
  const px = cameraX * 0.3;

  // 左侧偏殿
  drawTempleWing(ctx, 30 - px, STAGE_GROUND_Y, 220, '#2a2040', '#1a1530', '#3a2850');

  // 中央宝塔
  drawPagoda(ctx, 280 - px, STAGE_GROUND_Y, '#2a2245', '#1a1535', '#3a2855');

  // 右侧偏殿
  drawTempleWing(ctx, 520 - px, STAGE_GROUND_Y, 200, '#2a2040', '#1a1530', '#3a2850');

  // 鸟居
  drawTorii(ctx, 720 - px, STAGE_GROUND_Y);

  // 灯笼
  for (const lantern of lanterns) {
    drawLantern(ctx, lantern.baseX - px * 0.5, lantern.baseY, lantern.size, tick, lantern.swayPhase, lantern.color);
  }
}

function drawTempleWing(
  ctx: CanvasRenderingContext2D, x: number, groundY: number, w: number,
  bodyColor: string, roofColor: string, pillarColor: string,
): void {
  const wallH = 110;
  const roofH = 55;

  // 墙壁
  const wallGrad = ctx.createLinearGradient(x, groundY - wallH, x + w, groundY);
  wallGrad.addColorStop(0, bodyColor);
  wallGrad.addColorStop(1, shiftHex(bodyColor, -10));
  ctx.fillStyle = wallGrad;
  ctx.fillRect(x, groundY - wallH, w, wallH);

  // 墙壁纹理
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  for (let ly = groundY - wallH + 10; ly < groundY; ly += 8) {
    ctx.beginPath();
    ctx.moveTo(x, ly);
    ctx.lineTo(x + w, ly);
    ctx.stroke();
  }

  // 窗户
  const windowW = 18;
  const windowH = 28;
  const windowY = groundY - wallH + 25;
  for (let wx = x + 30; wx < x + w - 30; wx += 55) {
    const windowGlow = ctx.createRadialGradient(wx + windowW / 2, windowY + windowH / 2, 0, wx + windowW / 2, windowY + windowH / 2, 25);
    windowGlow.addColorStop(0, 'rgba(255, 180, 80, 0.15)');
    windowGlow.addColorStop(1, 'rgba(255, 150, 50, 0)');
    ctx.fillStyle = windowGlow;
    ctx.fillRect(wx - 10, windowY - 10, windowW + 20, windowH + 20);

    ctx.fillStyle = 'rgba(255, 200, 100, 0.12)';
    roundRect(ctx, wx, windowY, windowW, windowH, 2);
    ctx.fill();
    ctx.strokeStyle = pillarColor;
    ctx.lineWidth = 2;
    roundRect(ctx, wx, windowY, windowW, windowH, 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(wx + windowW / 2, windowY);
    ctx.lineTo(wx + windowW / 2, windowY + windowH);
    ctx.stroke();
  }

  // 屋顶
  ctx.fillStyle = roofColor;
  ctx.beginPath();
  ctx.moveTo(x - 25, groundY - wallH + 5);
  ctx.quadraticCurveTo(x + w * 0.15, groundY - wallH - roofH, x + w * 0.5, groundY - wallH - roofH * 0.85);
  ctx.quadraticCurveTo(x + w * 0.85, groundY - wallH - roofH, x + w + 25, groundY - wallH + 5);
  ctx.closePath();
  ctx.fill();

  // 屋顶金边
  ctx.strokeStyle = 'rgba(180, 140, 60, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 25, groundY - wallH + 5);
  ctx.quadraticCurveTo(x + w * 0.15, groundY - wallH - roofH, x + w * 0.5, groundY - wallH - roofH * 0.85);
  ctx.quadraticCurveTo(x + w * 0.85, groundY - wallH - roofH, x + w + 25, groundY - wallH + 5);
  ctx.stroke();

  // 千木
  ctx.fillStyle = 'rgba(180, 140, 60, 0.3)';
  for (const rx of [x - 25, x + w + 25]) {
    ctx.beginPath();
    ctx.moveTo(rx - 3, groundY - wallH + 5);
    ctx.lineTo(rx, groundY - wallH - 8);
    ctx.lineTo(rx + 3, groundY - wallH + 5);
    ctx.closePath();
    ctx.fill();
  }

  // 柱子
  const pillarCount = 5;
  const spacing = w / (pillarCount + 1);
  ctx.fillStyle = pillarColor;
  for (let i = 1; i <= pillarCount; i++) {
    ctx.fillRect(x + spacing * i - 3, groundY - wallH + 8, 6, wallH - 8);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(x + spacing * i - 1, groundY - wallH + 8, 2, wallH - 8);
    ctx.fillStyle = pillarColor;
  }
}

function drawPagoda(ctx: CanvasRenderingContext2D, x: number, groundY: number,
  bodyColor: string, roofColor: string, pillarColor: string): void {
  const tiers = 3;
  const baseW = 170;
  const tierH = 55;
  const roofOverhang = 28;

  for (let t = 0; t < tiers; t++) {
    const tierW = baseW - t * 30;
    const ty = groundY - (t + 1) * tierH;
    const tx = x + (baseW - tierW) / 2;

    // 层体
    ctx.fillStyle = bodyColor;
    ctx.fillRect(tx + 6, ty + 18, tierW - 12, tierH - 18);

    // 小窗
    if (t < 2) {
      const winCount = t === 0 ? 3 : 2;
      const winSpacing = (tierW - 20) / (winCount + 1);
      for (let wi = 1; wi <= winCount; wi++) {
        const wx = tx + 6 + winSpacing * wi;
        ctx.fillStyle = 'rgba(255, 180, 80, 0.1)';
        ctx.fillRect(wx - 5, ty + 25, 10, 18);
        ctx.strokeStyle = pillarColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(wx - 5, ty + 25, 10, 18);
      }
    }

    // 层顶
    ctx.fillStyle = roofColor;
    ctx.beginPath();
    ctx.moveTo(tx - roofOverhang, ty + 20);
    ctx.quadraticCurveTo(tx + tierW * 0.15, ty - 12, tx + tierW * 0.5, ty - 6);
    ctx.quadraticCurveTo(tx + tierW * 0.85, ty - 12, tx + tierW + roofOverhang, ty + 20);
    ctx.closePath();
    ctx.fill();

    // 层顶金边
    ctx.strokeStyle = 'rgba(180, 140, 60, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tx - roofOverhang, ty + 20);
    ctx.quadraticCurveTo(tx + tierW * 0.15, ty - 12, tx + tierW * 0.5, ty - 6);
    ctx.quadraticCurveTo(tx + tierW * 0.85, ty - 12, tx + tierW + roofOverhang, ty + 20);
    ctx.stroke();

    // 千木
    ctx.fillStyle = 'rgba(180, 140, 60, 0.3)';
    for (const rx of [tx - roofOverhang, tx + tierW + roofOverhang]) {
      ctx.beginPath();
      ctx.moveTo(rx - 3, ty + 20);
      ctx.lineTo(rx, ty + 8);
      ctx.lineTo(rx + 3, ty + 20);
      ctx.closePath();
      ctx.fill();
    }

    // 塔尖
    if (t === tiers - 1) {
      ctx.strokeStyle = 'rgba(200, 170, 80, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx + tierW / 2, ty - 6);
      ctx.lineTo(tx + tierW / 2, ty - 35);
      ctx.stroke();
      ctx.fillStyle = 'rgba(220, 190, 100, 0.5)';
      ctx.beginPath();
      ctx.arc(tx + tierW / 2, ty - 37, 4, 0, Math.PI * 2);
      ctx.fill();
      for (const ry of [ty - 15, ty - 22, ty - 29]) {
        ctx.strokeStyle = 'rgba(200, 170, 80, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tx + tierW / 2 - 6, ry);
        ctx.lineTo(tx + tierW / 2 + 6, ry);
        ctx.stroke();
      }
    }
  }

  // 中柱
  ctx.fillStyle = pillarColor;
  ctx.fillRect(x + baseW / 2 - 5, groundY - tiers * tierH, 10, tiers * tierH);
}

function drawTorii(ctx: CanvasRenderingContext2D, x: number, groundY: number): void {
  const h = 140;
  const w = 100;
  const topY = groundY - h;

  // 柱子
  ctx.fillStyle = '#8B2020';
  ctx.fillRect(x - w / 2 - 5, topY + 22, 10, h - 22);
  ctx.fillRect(x + w / 2 - 5, topY + 22, 10, h - 22);

  // 柱子高光
  ctx.fillStyle = 'rgba(255,200,150,0.08)';
  ctx.fillRect(x - w / 2 - 3, topY + 22, 3, h - 22);
  ctx.fillRect(x + w / 2 - 3, topY + 22, 3, h - 22);

  // 笠木
  ctx.fillStyle = '#8B2020';
  ctx.beginPath();
  ctx.moveTo(x - w / 2 - 18, topY + 16);
  ctx.quadraticCurveTo(x, topY - 14, x + w / 2 + 18, topY + 16);
  ctx.lineTo(x + w / 2 + 18, topY + 24);
  ctx.quadraticCurveTo(x, topY - 4, x - w / 2 - 18, topY + 24);
  ctx.closePath();
  ctx.fill();

  // 笠木高光
  ctx.strokeStyle = 'rgba(200, 100, 80, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - w / 2 - 18, topY + 16);
  ctx.quadraticCurveTo(x, topY - 14, x + w / 2 + 18, topY + 16);
  ctx.stroke();

  // 贯
  ctx.fillStyle = '#8B2020';
  ctx.fillRect(x - w / 2 - 8, topY + 38, w + 16, 6);

  // 柱基
  for (const px of [x - w / 2, x + w / 2]) {
    ctx.fillStyle = '#555';
    ctx.fillRect(px - 8, groundY - 8, 16, 8);
  }
}

function drawLantern(ctx: CanvasRenderingContext2D, x: number, y: number, size: number,
  tick: number, phase: number, color: string): void {
  const swayX = Math.sin(tick * 0.015 + phase) * 4;
  const lx = x + swayX;

  // 吊线
  ctx.strokeStyle = 'rgba(140, 110, 70, 0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 2.5);
  ctx.lineTo(lx, y - size * 0.5);
  ctx.stroke();

  // 大范围辉光
  const glowGrad = ctx.createRadialGradient(lx, y, 0, lx, y, size * 6);
  glowGrad.addColorStop(0, 'rgba(255, 160, 50, 0.2)');
  glowGrad.addColorStop(0.3, 'rgba(255, 120, 30, 0.1)');
  glowGrad.addColorStop(0.6, 'rgba(255, 100, 20, 0.04)');
  glowGrad.addColorStop(1, 'rgba(255, 100, 20, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(lx - size * 6, y - size * 6, size * 12, size * 12);

  // 灯笼体
  const flicker = 0.75 + 0.25 * Math.sin(tick * 0.06 + phase * 2);
  const hw = size * 0.9;
  const hh = size * 1.1;

  ctx.fillStyle = `rgba(${hexToRgb(color)}, ${0.5 * flicker})`;
  ctx.beginPath();
  ctx.ellipse(lx, y, hw, hh, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `rgba(255, 230, 160, ${0.6 * flicker})`;
  ctx.beginPath();
  ctx.ellipse(lx, y, hw * 0.6, hh * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `rgba(255, 250, 200, ${0.4 * flicker})`;
  ctx.beginPath();
  ctx.ellipse(lx, y, hw * 0.25, hh * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  // 上下盖
  ctx.fillStyle = 'rgba(60, 40, 20, 0.7)';
  ctx.fillRect(lx - hw - 2, y - hh - 2, (hw + 2) * 2, 4);
  ctx.fillRect(lx - hw - 1, y + hh - 2, (hw + 1) * 2, 3);

  // 横肋
  ctx.strokeStyle = 'rgba(80, 50, 25, 0.4)';
  ctx.lineWidth = 0.5;
  for (const ry of [-hh * 0.3, hh * 0.3]) {
    ctx.beginPath();
    ctx.moveTo(lx - hw, y + ry);
    ctx.lineTo(lx + hw, y + ry);
    ctx.stroke();
  }
}

// ===== Layer 3: Ground =====

export function drawGround(ctx: CanvasRenderingContext2D, cameraX: number): void {
  // 木地板
  const groundGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y, 0, CANVAS_HEIGHT);
  groundGrad.addColorStop(0, '#3a3025');
  groundGrad.addColorStop(0.03, '#352a20');
  groundGrad.addColorStop(0.1, '#2a2218');
  groundGrad.addColorStop(0.4, '#201a12');
  groundGrad.addColorStop(1, '#14100a');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, STAGE_GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - STAGE_GROUND_Y);

  // 木板纹
  ctx.strokeStyle = 'rgba(80, 65, 45, 0.2)';
  ctx.lineWidth = 1;
  for (let fy = STAGE_GROUND_Y + 14; fy < CANVAS_HEIGHT; fy += 16) {
    ctx.beginPath();
    ctx.moveTo(0, fy);
    ctx.lineTo(CANVAS_WIDTH, fy);
    ctx.stroke();
  }

  // 纵向板缝（滚动）
  ctx.strokeStyle = 'rgba(60, 50, 35, 0.12)';
  for (let wx = 0; wx < 1600; wx += 110) {
    const sx = wx - cameraX;
    if (sx < -10 || sx > CANVAS_WIDTH + 10) continue;
    ctx.beginPath();
    ctx.moveTo(sx, STAGE_GROUND_Y);
    ctx.lineTo(sx, CANVAS_HEIGHT);
    ctx.stroke();
  }

  // 栏杆
  drawRailing(ctx, cameraX);

  // 地面边缘蓝色辉光
  const edgeGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y - 4, 0, STAGE_GROUND_Y + 8);
  edgeGrad.addColorStop(0, 'rgba(100, 140, 255, 0.5)');
  edgeGrad.addColorStop(0.3, 'rgba(80, 120, 255, 0.3)');
  edgeGrad.addColorStop(0.6, 'rgba(80, 120, 255, 0.1)');
  edgeGrad.addColorStop(1, 'rgba(80, 120, 255, 0)');
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, STAGE_GROUND_Y - 4, CANVAS_WIDTH, 12);

  // 边缘反光
  const reflGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y, 0, STAGE_GROUND_Y + 25);
  reflGrad.addColorStop(0, 'rgba(100, 140, 255, 0.08)');
  reflGrad.addColorStop(1, 'rgba(80, 120, 255, 0)');
  ctx.fillStyle = reflGrad;
  ctx.fillRect(0, STAGE_GROUND_Y, CANVAS_WIDTH, 25);
}

function drawRailing(ctx: CanvasRenderingContext2D, cameraX: number): void {
  const railY = STAGE_GROUND_Y - 2;
  const postSpacing = 85;

  // 竖向栏杆柱
  for (let wx = 0; wx < 1600; wx += postSpacing) {
    const sx = wx - cameraX;
    if (sx < -10 || sx > CANVAS_WIDTH + 10) continue;

    ctx.fillStyle = '#5a3a20';
    ctx.fillRect(sx - 3, railY - 35, 6, 35);

    ctx.fillStyle = '#6a4a30';
    ctx.fillRect(sx - 5, railY - 37, 10, 4);

    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(sx - 1, railY - 35, 2, 35);
  }

  // 上横梁
  ctx.fillStyle = '#5a3a20';
  ctx.fillRect(0, railY - 32, CANVAS_WIDTH, 5);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(0, railY - 32, CANVAS_WIDTH, 2);

  // 中横梁
  ctx.fillStyle = '#4a3020';
  ctx.fillRect(0, railY - 18, CANVAS_WIDTH, 3);
}

