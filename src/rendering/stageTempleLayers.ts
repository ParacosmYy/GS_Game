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
  // 夜空渐变 — 更丰富的多层渐变
  const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  skyGrad.addColorStop(0, '#06081a');
  skyGrad.addColorStop(0.1, '#0a0e28');
  skyGrad.addColorStop(0.25, '#101640');
  skyGrad.addColorStop(0.4, '#161c4e');
  skyGrad.addColorStop(0.55, '#1a1a4a');
  skyGrad.addColorStop(0.7, '#1e1540');
  skyGrad.addColorStop(0.85, '#1a1035');
  skyGrad.addColorStop(1, '#12082a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 银河辉光带
  const milkyGrad = ctx.createLinearGradient(0, 80, CANVAS_WIDTH, 200);
  milkyGrad.addColorStop(0, 'rgba(60, 50, 100, 0)');
  milkyGrad.addColorStop(0.3, 'rgba(80, 70, 130, 0.06)');
  milkyGrad.addColorStop(0.5, 'rgba(100, 80, 140, 0.08)');
  milkyGrad.addColorStop(0.7, 'rgba(80, 70, 130, 0.06)');
  milkyGrad.addColorStop(1, 'rgba(60, 50, 100, 0)');
  ctx.fillStyle = milkyGrad;
  ctx.fillRect(0, 50, CANVAS_WIDTH, 200);

  // 星云辉光
  const nebulaGrad = ctx.createRadialGradient(CANVAS_WIDTH / 2, 150, 20, CANVAS_WIDTH / 2, 150, 350);
  nebulaGrad.addColorStop(0, 'rgba(80, 50, 120, 0.15)');
  nebulaGrad.addColorStop(0.3, 'rgba(70, 40, 110, 0.08)');
  nebulaGrad.addColorStop(0.6, 'rgba(50, 30, 90, 0.04)');
  nebulaGrad.addColorStop(1, 'rgba(40, 30, 80, 0)');
  ctx.fillStyle = nebulaGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, 400);

  // 第二星云
  const neb2Grad = ctx.createRadialGradient(150, 100, 10, 150, 100, 180);
  neb2Grad.addColorStop(0, 'rgba(40, 60, 120, 0.06)');
  neb2Grad.addColorStop(0.5, 'rgba(30, 50, 100, 0.03)');
  neb2Grad.addColorStop(1, 'rgba(20, 40, 80, 0)');
  ctx.fillStyle = neb2Grad;
  ctx.fillRect(0, 0, 350, 300);

  // 月亮
  drawMoon(ctx, globalTick);

  // 星星 — 分层绘制
  for (const star of stars) {
    const twinkle = star.brightness * (0.5 + 0.5 * Math.sin(globalTick * 0.03 * star.speed + star.x));
    // 十字光芒 (亮星)
    if (star.brightness > 0.6) {
      ctx.strokeStyle = `rgba(200,220,255,${twinkle * 0.15})`;
      ctx.lineWidth = 0.5;
      const len = 3 + star.brightness * 3;
      ctx.beginPath();
      ctx.moveTo(star.x - len, star.y);
      ctx.lineTo(star.x + len, star.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(star.x, star.y - len);
      ctx.lineTo(star.x, star.y + len);
      ctx.stroke();
    }
    ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, 0.5 + star.brightness * 0.5, 0, Math.PI * 2);
    ctx.fill();
    if (star.brightness > 0.7) {
      ctx.fillStyle = `rgba(200,220,255,${twinkle * 0.2})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 流星
  drawShootingStar(ctx, globalTick);
}

function drawShootingStar(ctx: CanvasRenderingContext2D, tick: number): void {
  const cycle = tick % 600;
  if (cycle < 15) {
    const progress = cycle / 15;
    const sx = 600 + progress * 150;
    const sy = 30 + progress * 80;
    const trailLen = 30 * (1 - progress);
    const alpha = (1 - progress) * 0.6;
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx - trailLen * 0.7, sy - trailLen * 0.3);
    ctx.stroke();
    // Head glow
    const headGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 5);
    headGlow.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
    headGlow.addColorStop(1, 'rgba(200, 220, 255, 0)');
    ctx.fillStyle = headGlow;
    ctx.fillRect(sx - 5, sy - 5, 10, 10);
  }
}

function drawMoon(ctx: CanvasRenderingContext2D, tick: number): void {
  const mx = 680;
  const my = 70;

  // 外层大气辉光
  const outerGlow = ctx.createRadialGradient(mx, my, 5, mx, my, 220);
  outerGlow.addColorStop(0, 'rgba(200, 200, 255, 0.12)');
  outerGlow.addColorStop(0.2, 'rgba(180, 180, 240, 0.08)');
  outerGlow.addColorStop(0.5, 'rgba(140, 140, 210, 0.03)');
  outerGlow.addColorStop(1, 'rgba(100, 80, 150, 0)');
  ctx.fillStyle = outerGlow;
  ctx.fillRect(mx - 220, my - 220, 440, 440);

  // 月盘渐变
  const moonGrad = ctx.createRadialGradient(mx - 4, my - 4, 0, mx, my, 28);
  moonGrad.addColorStop(0, 'rgba(245, 245, 255, 0.7)');
  moonGrad.addColorStop(0.3, 'rgba(230, 230, 250, 0.5)');
  moonGrad.addColorStop(0.6, 'rgba(210, 210, 240, 0.3)');
  moonGrad.addColorStop(0.85, 'rgba(190, 190, 230, 0.15)');
  moonGrad.addColorStop(1, 'rgba(170, 170, 210, 0)');
  ctx.fillStyle = moonGrad;
  ctx.beginPath();
  ctx.arc(mx, my, 28, 0, Math.PI * 2);
  ctx.fill();

  // 月球环形山 — layered craters with depth and rims
  const craters = [
    { cx: mx - 7, cy: my - 5, r: 7, depth: 0.10 },
    { cx: mx + 9, cy: my + 5, r: 4.5, depth: 0.12 },
    { cx: mx + 2, cy: my - 9, r: 5, depth: 0.08 },
    { cx: mx - 4, cy: my + 8, r: 3, depth: 0.09 },
    { cx: mx + 12, cy: my - 2, r: 2.5, depth: 0.07 },
    { cx: mx - 10, cy: my + 3, r: 3.5, depth: 0.06 },
    { cx: mx + 5, cy: my + 11, r: 2, depth: 0.05 },
    { cx: mx - 1, cy: my + 3, r: 8, depth: 0.04 },
  ];
  for (const c of craters) {
    // Crater shadow (inner)
    ctx.fillStyle = `rgba(140, 140, 170, ${c.depth})`;
    ctx.beginPath();
    ctx.arc(c.cx, c.cy, c.r, 0, Math.PI * 2);
    ctx.fill();
    // Crater rim highlight (upper-left)
    ctx.strokeStyle = `rgba(220, 220, 245, ${c.depth * 0.6})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(c.cx, c.cy, c.r, Math.PI * 0.9, Math.PI * 1.6);
    ctx.stroke();
    // Crater floor shadow (bottom-right offset)
    ctx.fillStyle = `rgba(120, 120, 155, ${c.depth * 0.5})`;
    ctx.beginPath();
    ctx.arc(c.cx + c.r * 0.2, c.cy + c.r * 0.2, c.r * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // 月光照射方向光柱
  const moonLight = ctx.createLinearGradient(mx, my + 28, mx + 80, STAGE_GROUND_Y);
  moonLight.addColorStop(0, 'rgba(180, 180, 220, 0.02)');
  moonLight.addColorStop(0.5, 'rgba(150, 150, 200, 0.01)');
  moonLight.addColorStop(1, 'rgba(120, 120, 180, 0)');
  ctx.fillStyle = moonLight;
  ctx.beginPath();
  ctx.moveTo(mx - 10, my + 28);
  ctx.lineTo(mx + 100, STAGE_GROUND_Y);
  ctx.lineTo(mx - 60, STAGE_GROUND_Y);
  ctx.closePath();
  ctx.fill();
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

    // Multi-ellipse cloud shape with subtle purple-blue tint
    const cloudColor = '#8888bb';
    const cloudBright = '#9999cc';
    ctx.fillStyle = cloudColor;
    ctx.beginPath();
    ctx.ellipse(cx, cloud.y, cloud.w / 2, cloud.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = cloudBright;
    ctx.beginPath();
    ctx.ellipse(cx + cloud.w * 0.3, cloud.y - cloud.h * 0.2, cloud.w * 0.35, cloud.h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = cloudColor;
    ctx.beginPath();
    ctx.ellipse(cx - cloud.w * 0.2, cloud.y + cloud.h * 0.1, cloud.w * 0.3, cloud.h * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    // Extra sub-cloud
    ctx.fillStyle = cloudBright;
    ctx.beginPath();
    ctx.ellipse(cx + cloud.w * 0.1, cloud.y + cloud.h * 0.15, cloud.w * 0.25, cloud.h * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// ===== Layer 1: Mountains (3 parallax depth layers) =====

export function drawDistantMountains(ctx: CanvasRenderingContext2D, cameraX: number): void {
  const baseY = STAGE_GROUND_Y - 30;

  // ---- Far layer (parallax 0.06) — lightest, most distant ----
  const fpx = cameraX * 0.06;
  const farPeaks = [
    { color: '#0c0c32', h: 200, ox: -60, w: 500 },
    { color: '#0e0e38', h: 170, ox: 300, w: 450 },
    { color: '#0b0b30', h: 190, ox: 650, w: 420 },
  ];
  for (const layer of farPeaks) {
    const startX = layer.ox - fpx;
    ctx.fillStyle = layer.color;
    ctx.beginPath();
    ctx.moveTo(startX, baseY);
    ctx.quadraticCurveTo(startX + layer.w * 0.15, baseY - layer.h * 0.6, startX + layer.w * 0.3, baseY - layer.h * 0.9);
    ctx.quadraticCurveTo(startX + layer.w * 0.45, baseY - layer.h * 1.05, startX + layer.w * 0.55, baseY - layer.h * 1.0);
    ctx.quadraticCurveTo(startX + layer.w * 0.7, baseY - layer.h * 0.8, startX + layer.w * 0.85, baseY - layer.h * 0.45);
    ctx.quadraticCurveTo(startX + layer.w * 0.95, baseY - layer.h * 0.2, startX + layer.w, baseY);
    ctx.closePath();
    ctx.fill();
  }

  // ---- Mid layer (parallax 0.1) — medium darkness ----
  const mpx = cameraX * 0.1;
  const midPeaks = [
    { color: '#10103a', h: 230, ox: -80, w: 450 },
    { color: '#141440', h: 190, ox: 180, w: 380 },
    { color: '#1a1a4a', h: 250, ox: 440, w: 420 },
    { color: '#12123e', h: 175, ox: 750, w: 350 },
  ];
  for (const layer of midPeaks) {
    const startX = layer.ox - mpx;
    ctx.fillStyle = layer.color;
    ctx.beginPath();
    ctx.moveTo(startX, baseY);
    ctx.quadraticCurveTo(startX + layer.w * 0.1, baseY - layer.h * 0.5, startX + layer.w * 0.25, baseY - layer.h * 0.85);
    ctx.quadraticCurveTo(startX + layer.w * 0.35, baseY - layer.h * 1.0, startX + layer.w * 0.5, baseY - layer.h * 1.05);
    ctx.quadraticCurveTo(startX + layer.w * 0.65, baseY - layer.h * 1.0, startX + layer.w * 0.75, baseY - layer.h * 0.75);
    ctx.quadraticCurveTo(startX + layer.w * 0.9, baseY - layer.h * 0.35, startX + layer.w, baseY);
    ctx.closePath();
    ctx.fill();

    // Snow caps
    if (layer.h > 200) {
      const peakX = startX + layer.w * 0.45;
      const peakY = baseY - layer.h * 1.05;
      ctx.fillStyle = 'rgba(200, 200, 230, 0.08)';
      ctx.beginPath();
      ctx.moveTo(peakX - 35, peakY + 18);
      ctx.lineTo(peakX - 8, peakY);
      ctx.lineTo(peakX + 12, peakY + 4);
      ctx.lineTo(peakX + 30, peakY + 15);
      ctx.closePath();
      ctx.fill();
    }
  }

  // ---- Near layer (parallax 0.16) — darkest, closest ----
  const npx = cameraX * 0.16;
  const nearPeaks = [
    { color: '#141440', h: 160, ox: -30, w: 400 },
    { color: '#181848', h: 140, ox: 250, w: 350 },
    { color: '#151544', h: 170, ox: 500, w: 380 },
    { color: '#161644', h: 130, ox: 800, w: 320 },
  ];
  for (const layer of nearPeaks) {
    const startX = layer.ox - npx;
    ctx.fillStyle = layer.color;
    ctx.beginPath();
    ctx.moveTo(startX, baseY);
    ctx.quadraticCurveTo(startX + layer.w * 0.2, baseY - layer.h * 0.7, startX + layer.w * 0.4, baseY - layer.h * 0.95);
    ctx.quadraticCurveTo(startX + layer.w * 0.5, baseY - layer.h, startX + layer.w * 0.6, baseY - layer.h * 0.9);
    ctx.quadraticCurveTo(startX + layer.w * 0.8, baseY - layer.h * 0.5, startX + layer.w, baseY);
    ctx.closePath();
    ctx.fill();
  }

  // 松树剪影层
  drawPineSilhouettes(ctx, baseY, cameraX * 0.12);

  // 雾气层 — 多层雾
  const mistGrad1 = ctx.createLinearGradient(0, STAGE_GROUND_Y - 130, 0, STAGE_GROUND_Y - 40);
  mistGrad1.addColorStop(0, 'rgba(25, 20, 50, 0)');
  mistGrad1.addColorStop(0.3, 'rgba(30, 25, 55, 0.08)');
  mistGrad1.addColorStop(0.6, 'rgba(35, 30, 60, 0.15)');
  mistGrad1.addColorStop(0.85, 'rgba(40, 35, 65, 0.2)');
  mistGrad1.addColorStop(1, 'rgba(30, 25, 55, 0)');
  ctx.fillStyle = mistGrad1;
  ctx.fillRect(0, STAGE_GROUND_Y - 130, CANVAS_WIDTH, 90);

  const mistGrad2 = ctx.createLinearGradient(0, STAGE_GROUND_Y - 70, 0, STAGE_GROUND_Y - 15);
  mistGrad2.addColorStop(0, 'rgba(30, 25, 55, 0)');
  mistGrad2.addColorStop(0.5, 'rgba(40, 35, 65, 0.18)');
  mistGrad2.addColorStop(1, 'rgba(30, 25, 55, 0)');
  ctx.fillStyle = mistGrad2;
  ctx.fillRect(0, STAGE_GROUND_Y - 70, CANVAS_WIDTH, 55);
}

function drawPineSilhouettes(ctx: CanvasRenderingContext2D, baseY: number, px: number): void {
  ctx.fillStyle = '#0e0e30';
  const pinePositions = [
    { x: 60, scale: 0.8 }, { x: 140, scale: 1.0 }, { x: 230, scale: 0.7 },
    { x: 380, scale: 0.9 }, { x: 460, scale: 1.1 }, { x: 540, scale: 0.6 },
    { x: 630, scale: 0.85 }, { x: 720, scale: 0.95 }, { x: 800, scale: 0.75 },
  ];

  for (const pine of pinePositions) {
    const tx = pine.x - px * 0.5;
    const s = pine.scale;
    const trunkH = 30 * s;
    const canopyH = 40 * s;
    const canopyW = 18 * s;

    // Trunk
    ctx.fillRect(tx - 2 * s, baseY - trunkH - canopyH + 20, 4 * s, trunkH);

    // Canopy layers (triangle stacking)
    for (let layer = 0; layer < 3; layer++) {
      const layerY = baseY - trunkH - canopyH + layer * 12 * s + 15;
      const layerW = canopyW - layer * 4 * s;
      ctx.beginPath();
      ctx.moveTo(tx, layerY - 8 * s);
      ctx.lineTo(tx - layerW, layerY + 5 * s);
      ctx.lineTo(tx + layerW, layerY + 5 * s);
      ctx.closePath();
      ctx.fill();
    }
  }
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

  // 石灯笼 (ground level decorative)
  drawStoneLanterns(ctx, cameraX, tick);

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

  // 注连绳 (sacred rope) between buildings
  drawShimenawa(ctx, 180 - px, 200, 420 - px, 200, tick);
}

function drawStoneLanterns(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  const px = cameraX * 0.35;
  const positions = [160, 480, 760];

  for (const pos of positions) {
    const sx = pos - px;
    const baseY = STAGE_GROUND_Y;
    const lanternH = 45;
    const phase = pos * 0.1;

    // Base stone
    ctx.fillStyle = '#3a3540';
    ctx.fillRect(sx - 8, baseY - 5, 16, 5);

    // Pillar
    ctx.fillStyle = '#333040';
    ctx.fillRect(sx - 3, baseY - lanternH + 10, 6, lanternH - 10);

    // Light chamber — pulsing warm orange glow
    const glowAlpha = 0.18 + Math.sin(tick * 0.025 + phase) * 0.08;
    const chamberGlow = ctx.createRadialGradient(sx, baseY - lanternH, 0, sx, baseY - lanternH, 28);
    chamberGlow.addColorStop(0, `rgba(255, 180, 80, ${glowAlpha * 1.2})`);
    chamberGlow.addColorStop(0.3, `rgba(255, 140, 40, ${glowAlpha * 0.6})`);
    chamberGlow.addColorStop(0.6, `rgba(255, 100, 20, ${glowAlpha * 0.25})`);
    chamberGlow.addColorStop(1, 'rgba(255, 80, 10, 0)');
    ctx.fillStyle = chamberGlow;
    ctx.fillRect(sx - 28, baseY - lanternH - 28, 56, 56);

    ctx.fillStyle = '#2a2535';
    ctx.fillRect(sx - 6, baseY - lanternH + 2, 12, 10);
    ctx.fillStyle = `rgba(255, 200, 100, ${glowAlpha * 2})`;
    ctx.fillRect(sx - 4, baseY - lanternH + 4, 8, 6);

    // Roof
    ctx.fillStyle = '#3a3540';
    ctx.beginPath();
    ctx.moveTo(sx - 9, baseY - lanternH + 2);
    ctx.lineTo(sx, baseY - lanternH - 8);
    ctx.lineTo(sx + 9, baseY - lanternH + 2);
    ctx.closePath();
    ctx.fill();

    // Top ornament
    ctx.fillStyle = '#4a4555';
    ctx.beginPath();
    ctx.arc(sx, baseY - lanternH - 8, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawShimenawa(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, tick: number): void {
  const midX = (x1 + x2) / 2;
  const sag = 15 + Math.sin(tick * 0.01) * 2;

  ctx.strokeStyle = 'rgba(180, 160, 100, 0.25)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(midX, y1 + sag, x2, y2);
  ctx.stroke();

  // Shide (paper zigzag) tassels
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  for (let i = 0; i < 5; i++) {
    const t = (i + 1) / 6;
    const tx = x1 + (x2 - x1) * t;
    const ty = y1 + sag * Math.sin(t * Math.PI);
    ctx.fillRect(tx - 2, ty, 4, 8);
    // Zigzag
    ctx.beginPath();
    ctx.moveTo(tx - 2, ty + 8);
    ctx.lineTo(tx, ty + 11);
    ctx.lineTo(tx + 2, ty + 8);
    ctx.lineTo(tx, ty + 14);
    ctx.stroke();
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
  wallGrad.addColorStop(0.5, shiftHex(bodyColor, -5));
  wallGrad.addColorStop(1, shiftHex(bodyColor, -10));
  ctx.fillStyle = wallGrad;
  ctx.fillRect(x, groundY - wallH, w, wallH);

  // 墙壁纹理 — 更细致
  ctx.strokeStyle = 'rgba(255,255,255,0.025)';
  ctx.lineWidth = 1;
  for (let ly = groundY - wallH + 10; ly < groundY; ly += 8) {
    ctx.beginPath();
    ctx.moveTo(x, ly);
    ctx.lineTo(x + w, ly);
    ctx.stroke();
  }

  // 下部墙裙板
  ctx.fillStyle = shiftHex(bodyColor, -15);
  ctx.fillRect(x, groundY - 25, w, 25);

  // 窗户
  const windowW = 18;
  const windowH = 28;
  const windowY = groundY - wallH + 25;
  for (let wx = x + 30; wx < x + w - 30; wx += 55) {
    // 窗户灯光投射
    const windowGlow = ctx.createRadialGradient(wx + windowW / 2, windowY + windowH / 2, 0, wx + windowW / 2, windowY + windowH / 2, 35);
    windowGlow.addColorStop(0, 'rgba(255, 180, 80, 0.18)');
    windowGlow.addColorStop(0.5, 'rgba(255, 150, 50, 0.06)');
    windowGlow.addColorStop(1, 'rgba(255, 150, 50, 0)');
    ctx.fillStyle = windowGlow;
    ctx.fillRect(wx - 15, windowY - 15, windowW + 30, windowH + 30);

    // 窗户本体
    ctx.fillStyle = 'rgba(255, 200, 100, 0.15)';
    roundRect(ctx, wx, windowY, windowW, windowH, 2);
    ctx.fill();
    ctx.strokeStyle = pillarColor;
    ctx.lineWidth = 2;
    roundRect(ctx, wx, windowY, windowW, windowH, 2);
    ctx.stroke();
    // 窗棂
    ctx.beginPath();
    ctx.moveTo(wx + windowW / 2, windowY);
    ctx.lineTo(wx + windowW / 2, windowY + windowH);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(wx, windowY + windowH / 2);
    ctx.lineTo(wx + windowW, windowY + windowH / 2);
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

  // 屋顶瓦片纹理
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 0.5;
  for (let ry = groundY - wallH - roofH * 0.6; ry < groundY - wallH + 5; ry += 6) {
    ctx.beginPath();
    const t = (ry - (groundY - wallH - roofH * 0.6)) / (roofH * 0.6 + 5);
    const halfW = (x + w / 2) - (x - 25) + 25 * t;
    const centerX = x + w / 2;
    ctx.moveTo(centerX - halfW, ry);
    ctx.quadraticCurveTo(centerX, ry - 3, centerX + halfW, ry);
    ctx.stroke();
  }

  // 屋顶金边
  ctx.strokeStyle = 'rgba(180, 140, 60, 0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 25, groundY - wallH + 5);
  ctx.quadraticCurveTo(x + w * 0.15, groundY - wallH - roofH, x + w * 0.5, groundY - wallH - roofH * 0.85);
  ctx.quadraticCurveTo(x + w * 0.85, groundY - wallH - roofH, x + w + 25, groundY - wallH + 5);
  ctx.stroke();

  // 鬼瓦 (ornamental end tiles)
  ctx.fillStyle = 'rgba(180, 140, 60, 0.35)';
  for (const rx of [x - 25, x + w + 25]) {
    ctx.beginPath();
    ctx.moveTo(rx - 4, groundY - wallH + 5);
    ctx.lineTo(rx, groundY - wallH - 10);
    ctx.lineTo(rx + 4, groundY - wallH + 5);
    ctx.closePath();
    ctx.fill();
  }

  // 柱子 — 带底座
  const pillarCount = 5;
  const spacing = w / (pillarCount + 1);
  for (let i = 1; i <= pillarCount; i++) {
    const pillarX = x + spacing * i;
    // 柱底石
    ctx.fillStyle = '#4a4555';
    ctx.fillRect(pillarX - 5, groundY - 6, 10, 6);
    // 柱身
    const pillarGrad = ctx.createLinearGradient(pillarX - 3, 0, pillarX + 3, 0);
    pillarGrad.addColorStop(0, shiftHex(pillarColor, -8));
    pillarGrad.addColorStop(0.3, pillarColor);
    pillarGrad.addColorStop(0.7, pillarColor);
    pillarGrad.addColorStop(1, shiftHex(pillarColor, -5));
    ctx.fillStyle = pillarGrad;
    ctx.fillRect(pillarX - 3, groundY - wallH + 8, 6, wallH - 8);
    // 柱子高光
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(pillarX - 1, groundY - wallH + 8, 2, wallH - 8);
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

    // 层体纹理
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 0.5;
    for (let ly = ty + 22; ly < ty + tierH; ly += 6) {
      ctx.beginPath();
      ctx.moveTo(tx + 6, ly);
      ctx.lineTo(tx + tierW - 6, ly);
      ctx.stroke();
    }

    // 小窗
    if (t < 2) {
      const winCount = t === 0 ? 3 : 2;
      const winSpacing = (tierW - 20) / (winCount + 1);
      for (let wi = 1; wi <= winCount; wi++) {
        const wx = tx + 6 + winSpacing * wi;
        const windowGlow = ctx.createRadialGradient(wx, ty + 34, 0, wx, ty + 34, 15);
        windowGlow.addColorStop(0, 'rgba(255, 180, 80, 0.12)');
        windowGlow.addColorStop(1, 'rgba(255, 150, 50, 0)');
        ctx.fillStyle = windowGlow;
        ctx.fillRect(wx - 15, ty + 19, 30, 30);
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

    // 层顶瓦片纹理
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 0.5;
    for (let ry = ty + 5; ry < ty + 18; ry += 5) {
      const progress = (ry - ty + 6) / 26;
      const edgeLeft = tx - roofOverhang + (roofOverhang + 6) * progress;
      const edgeRight = tx + tierW + roofOverhang - (roofOverhang - 6) * progress;
      ctx.beginPath();
      ctx.moveTo(edgeLeft, ry);
      ctx.quadraticCurveTo(tx + tierW / 2, ry - 2, edgeRight, ry);
      ctx.stroke();
    }

    // 层顶金边
    ctx.strokeStyle = 'rgba(180, 140, 60, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tx - roofOverhang, ty + 20);
    ctx.quadraticCurveTo(tx + tierW * 0.15, ty - 12, tx + tierW * 0.5, ty - 6);
    ctx.quadraticCurveTo(tx + tierW * 0.85, ty - 12, tx + tierW + roofOverhang, ty + 20);
    ctx.stroke();

    // 鬼瓦
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
      // 相轮 (finial rings)
      ctx.strokeStyle = 'rgba(200, 170, 80, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx + tierW / 2, ty - 6);
      ctx.lineTo(tx + tierW / 2, ty - 38);
      ctx.stroke();
      ctx.fillStyle = 'rgba(220, 190, 100, 0.5)';
      ctx.beginPath();
      ctx.arc(tx + tierW / 2, ty - 40, 4, 0, Math.PI * 2);
      ctx.fill();
      // 宝珠光辉
      const orbGlow = ctx.createRadialGradient(tx + tierW / 2, ty - 40, 0, tx + tierW / 2, ty - 40, 15);
      orbGlow.addColorStop(0, 'rgba(220, 190, 100, 0.15)');
      orbGlow.addColorStop(1, 'rgba(200, 170, 80, 0)');
      ctx.fillStyle = orbGlow;
      ctx.fillRect(tx + tierW / 2 - 15, ty - 55, 30, 30);
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

  // 柱子 — 带更深的朱红渐变
  const pillarGrad1 = ctx.createLinearGradient(x - w / 2 - 5, 0, x - w / 2 + 5, 0);
  pillarGrad1.addColorStop(0, '#6B1515');
  pillarGrad1.addColorStop(0.3, '#8B2020');
  pillarGrad1.addColorStop(0.7, '#8B2020');
  pillarGrad1.addColorStop(1, '#6B1515');
  ctx.fillStyle = pillarGrad1;
  ctx.fillRect(x - w / 2 - 5, topY + 22, 10, h - 22);

  const pillarGrad2 = ctx.createLinearGradient(x + w / 2 - 5, 0, x + w / 2 + 5, 0);
  pillarGrad2.addColorStop(0, '#6B1515');
  pillarGrad2.addColorStop(0.3, '#8B2020');
  pillarGrad2.addColorStop(0.7, '#8B2020');
  pillarGrad2.addColorStop(1, '#6B1515');
  ctx.fillStyle = pillarGrad2;
  ctx.fillRect(x + w / 2 - 5, topY + 22, 10, h - 22);

  // 柱子高光
  ctx.fillStyle = 'rgba(255,200,150,0.08)';
  ctx.fillRect(x - w / 2 - 3, topY + 22, 3, h - 22);
  ctx.fillRect(x + w / 2 - 3, topY + 22, 3, h - 22);

  // 笠木
  const kasagiGrad = ctx.createLinearGradient(0, topY - 14, 0, topY + 24);
  kasagiGrad.addColorStop(0, '#8B2020');
  kasagiGrad.addColorStop(0.5, '#9B2828');
  kasagiGrad.addColorStop(1, '#7B1818');
  ctx.fillStyle = kasagiGrad;
  ctx.beginPath();
  ctx.moveTo(x - w / 2 - 18, topY + 16);
  ctx.quadraticCurveTo(x, topY - 14, x + w / 2 + 18, topY + 16);
  ctx.lineTo(x + w / 2 + 18, topY + 24);
  ctx.quadraticCurveTo(x, topY - 4, x - w / 2 - 18, topY + 24);
  ctx.closePath();
  ctx.fill();

  // 笠木高光
  ctx.strokeStyle = 'rgba(200, 100, 80, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - w / 2 - 18, topY + 16);
  ctx.quadraticCurveTo(x, topY - 14, x + w / 2 + 18, topY + 16);
  ctx.stroke();

  // 岛木 (shimaki — secondary bar)
  ctx.fillStyle = '#8B2020';
  ctx.fillRect(x - w / 2 - 8, topY + 38, w + 16, 6);

  // 额束 (gakizuki — central tablet)
  ctx.fillStyle = '#6B1818';
  roundRect(ctx, x - 15, topY + 24, 30, 14, 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(200, 160, 60, 0.3)';
  ctx.lineWidth = 1;
  roundRect(ctx, x - 15, topY + 24, 30, 14, 2);
  ctx.stroke();

  // 柱基
  for (const px of [x - w / 2, x + w / 2]) {
    ctx.fillStyle = '#555';
    ctx.fillRect(px - 8, groundY - 8, 16, 8);
    ctx.fillStyle = '#666';
    ctx.fillRect(px - 10, groundY - 10, 20, 3);
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
  const glowGrad = ctx.createRadialGradient(lx, y, 0, lx, y, size * 7);
  glowGrad.addColorStop(0, 'rgba(255, 160, 50, 0.22)');
  glowGrad.addColorStop(0.2, 'rgba(255, 120, 30, 0.12)');
  glowGrad.addColorStop(0.5, 'rgba(255, 100, 20, 0.05)');
  glowGrad.addColorStop(1, 'rgba(255, 100, 20, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(lx - size * 7, y - size * 7, size * 14, size * 14);

  // 地面光圈
  const groundGlow = ctx.createRadialGradient(lx, STAGE_GROUND_Y, 0, lx, STAGE_GROUND_Y, size * 5);
  groundGlow.addColorStop(0, 'rgba(255, 160, 50, 0.06)');
  groundGlow.addColorStop(1, 'rgba(255, 120, 30, 0)');
  ctx.fillStyle = groundGlow;
  ctx.fillRect(lx - size * 5, STAGE_GROUND_Y - 3, size * 10, 6);

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

  // 穗 (tassel)
  ctx.strokeStyle = `rgba(200, 160, 50, ${0.3 * flicker})`;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(lx, y + hh + 1);
  ctx.lineTo(lx, y + hh + 6);
  ctx.stroke();
}

// ===== Layer 3: Ground =====

export function drawGround(ctx: CanvasRenderingContext2D, cameraX: number): void {
  // 木地板 — 更丰富的渐变
  const groundGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y, 0, CANVAS_HEIGHT);
  groundGrad.addColorStop(0, '#3a3025');
  groundGrad.addColorStop(0.02, '#352a20');
  groundGrad.addColorStop(0.06, '#2e2418');
  groundGrad.addColorStop(0.15, '#282015');
  groundGrad.addColorStop(0.4, '#201a12');
  groundGrad.addColorStop(1, '#14100a');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, STAGE_GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - STAGE_GROUND_Y);

  // 木板纹 — 更精细
  ctx.strokeStyle = 'rgba(80, 65, 45, 0.18)';
  ctx.lineWidth = 0.5;
  for (let fy = STAGE_GROUND_Y + 14; fy < CANVAS_HEIGHT; fy += 16) {
    ctx.beginPath();
    ctx.moveTo(0, fy);
    ctx.lineTo(CANVAS_WIDTH, fy);
    ctx.stroke();
  }

  // 纵向板缝（滚动）
  ctx.strokeStyle = 'rgba(60, 50, 35, 0.1)';
  for (let wx = 0; wx < 1600; wx += 110) {
    const sx = wx - cameraX;
    if (sx < -10 || sx > CANVAS_WIDTH + 10) continue;
    ctx.beginPath();
    ctx.moveTo(sx, STAGE_GROUND_Y);
    ctx.lineTo(sx, CANVAS_HEIGHT);
    ctx.stroke();
    // 钉痕
    ctx.fillStyle = 'rgba(100, 80, 60, 0.15)';
    ctx.beginPath();
    ctx.arc(sx, STAGE_GROUND_Y + 14, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(sx, STAGE_GROUND_Y + 30, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 栏杆
  drawRailing(ctx, cameraX);

  // KOF2002: 远景观众剪影 — 栏杆后方的暗色人影增加氛围
  drawSpectators(ctx, cameraX);

  // 地面边缘蓝色辉光 — 更强
  const edgeGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y - 5, 0, STAGE_GROUND_Y + 10);
  edgeGrad.addColorStop(0, 'rgba(100, 140, 255, 0.6)');
  edgeGrad.addColorStop(0.2, 'rgba(90, 130, 255, 0.4)');
  edgeGrad.addColorStop(0.5, 'rgba(80, 120, 255, 0.15)');
  edgeGrad.addColorStop(1, 'rgba(80, 120, 255, 0)');
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, STAGE_GROUND_Y - 5, CANVAS_WIDTH, 15);

  // 边缘反光
  const reflGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y, 0, STAGE_GROUND_Y + 35);
  reflGrad.addColorStop(0, 'rgba(100, 140, 255, 0.1)');
  reflGrad.addColorStop(0.3, 'rgba(80, 120, 255, 0.04)');
  reflGrad.addColorStop(1, 'rgba(80, 120, 255, 0)');
  ctx.fillStyle = reflGrad;
  ctx.fillRect(0, STAGE_GROUND_Y, CANVAS_WIDTH, 35);
}

function drawRailing(ctx: CanvasRenderingContext2D, cameraX: number): void {
  const railY = STAGE_GROUND_Y - 2;
  const postSpacing = 85;

  // 竖向栏杆柱
  for (let wx = 0; wx < 1600; wx += postSpacing) {
    const sx = wx - cameraX;
    if (sx < -10 || sx > CANVAS_WIDTH + 10) continue;

    // 柱身
    const postGrad = ctx.createLinearGradient(sx - 3, 0, sx + 3, 0);
    postGrad.addColorStop(0, '#4a2a18');
    postGrad.addColorStop(0.3, '#5a3a20');
    postGrad.addColorStop(0.7, '#5a3a20');
    postGrad.addColorStop(1, '#4a2a18');
    ctx.fillStyle = postGrad;
    ctx.fillRect(sx - 3, railY - 38, 6, 38);

    // 柱顶
    ctx.fillStyle = '#6a4a30';
    ctx.fillRect(sx - 5, railY - 40, 10, 4);
    ctx.fillStyle = '#7a5a38';
    ctx.fillRect(sx - 4, railY - 41, 8, 2);

    // 柱子高光
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(sx - 1, railY - 38, 2, 38);
  }

  // 上横梁
  ctx.fillStyle = '#5a3a20';
  ctx.fillRect(0, railY - 34, CANVAS_WIDTH, 5);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(0, railY - 34, CANVAS_WIDTH, 2);
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.fillRect(0, railY - 30, CANVAS_WIDTH, 1);

  // 中横梁
  ctx.fillStyle = '#4a3020';
  ctx.fillRect(0, railY - 20, CANVAS_WIDTH, 3);
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  ctx.fillRect(0, railY - 20, CANVAS_WIDTH, 1);

  // 下横梁
  ctx.fillStyle = '#3a2518';
  ctx.fillRect(0, railY - 8, CANVAS_WIDTH, 3);
}

// KOF2002: 远景观众剪影 — 栏杆后方的暗色人影, 增加格斗赛氛围
function drawSpectators(ctx: CanvasRenderingContext2D, cameraX: number): void {
  // 观众数据: [世界X位置, 身高, 体宽, 头大小, 微摆相位]
  const specs: number[][] = [
    [60, 38, 14, 6, 0], [120, 42, 16, 7, 1.2], [200, 35, 12, 5.5, 2.4],
    [280, 40, 15, 6.5, 0.8], [350, 44, 17, 7, 3.1], [420, 36, 13, 5.5, 1.5],
    [500, 41, 15, 6.5, 0.3], [580, 38, 14, 6, 2.7], [650, 43, 16, 7, 1.8],
    [730, 37, 13, 5.5, 0.6], [800, 40, 15, 6.5, 3.5], [870, 35, 12, 5, 2.2],
    [950, 42, 16, 7, 1.0], [1020, 39, 14, 6, 0.4], [1100, 36, 13, 5.5, 2.9],
    [1180, 44, 17, 7, 1.6], [1260, 38, 14, 6, 3.3], [1340, 41, 15, 6.5, 0.9],
  ];
  const baseY = STAGE_GROUND_Y - 42; // 栏杆后方
  ctx.save();
  for (const [wx, h, w, headR, phase] of specs) {
    const sx = wx - cameraX * 0.85; // 视差: 观众滚动比前景慢
    if (sx < -30 || sx > CANVAS_WIDTH + 30) continue;
    const sway = Math.sin(Date.now() * 0.001 + phase) * 1.5; // 微摆
    ctx.globalAlpha = 0.25 + Math.sin(phase * 2.3) * 0.08;
    // 身体
    ctx.fillStyle = '#1a1520';
    ctx.fillRect(sx - w / 2 + sway, baseY - h + headR * 2, w, h - headR * 2);
    // 头
    ctx.beginPath();
    ctx.arc(sx + sway, baseY - h + headR, headR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}
