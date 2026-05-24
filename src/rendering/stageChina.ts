/**
 * Stage rendering — China Town Street (唐人街)
 * Daytime scene with market stalls, lanterns, signs, crowds
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT, STAGE_GROUND_Y } from '../core/constants.js';
import type { Star } from './stage.js';
import { roundRect } from './utils.js';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  rotation: number;
  rotSpeed: number;
}

const banners: Particle[] = [];
const smokePuffs: Particle[] = [];
let initialized = false;

function init(): void {
  for (let i = 0; i < 8; i++) {
    banners.push({
      x: 50 + Math.random() * 900,
      y: 100 + Math.random() * 200,
      vx: 0, vy: 0, size: 20 + Math.random() * 15,
      life: Math.random() * 200, rotation: Math.random() * 0.3 - 0.15, rotSpeed: 0.002,
    });
  }
  for (let i = 0; i < 10; i++) {
    smokePuffs.push({
      x: 100 + Math.random() * 800,
      y: STAGE_GROUND_Y - 50 - Math.random() * 80,
      vx: (Math.random() - 0.5) * 0.3, vy: -0.3 - Math.random() * 0.5,
      size: 8 + Math.random() * 12, life: Math.random() * 200, rotation: 0, rotSpeed: 0,
    });
  }
  initialized = true;
}

export function drawChinaStage(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  _stars: Star[],
  globalTick: number,
): void {
  if (!initialized) init();

  drawSky(ctx, globalTick);
  drawDistantBuildings(ctx, cameraX);
  drawMarketStalls(ctx, cameraX, globalTick);
  drawSigns(ctx, cameraX, globalTick);
  drawGround(ctx, cameraX);
  drawParticles(ctx, globalTick);
  drawBoundaries(ctx, cameraX);
}

function drawSky(ctx: CanvasRenderingContext2D, tick: number): void {
  // Warm sunset sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  skyGrad.addColorStop(0, '#2a1525');
  skyGrad.addColorStop(0.2, '#4a2040');
  skyGrad.addColorStop(0.4, '#8a3535');
  skyGrad.addColorStop(0.6, '#cc6633');
  skyGrad.addColorStop(0.8, '#dd8844');
  skyGrad.addColorStop(1, '#aa5533');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Sun low on horizon
  const sunX = 750;
  const sunY = 180;
  const sunGrad = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 120);
  sunGrad.addColorStop(0, 'rgba(255, 200, 80, 0.5)');
  sunGrad.addColorStop(0.3, 'rgba(255, 160, 50, 0.25)');
  sunGrad.addColorStop(0.6, 'rgba(255, 120, 40, 0.08)');
  sunGrad.addColorStop(1, 'rgba(255, 100, 30, 0)');
  ctx.fillStyle = sunGrad;
  ctx.fillRect(sunX - 120, sunY - 120, 240, 240);

  // Sun disc
  ctx.fillStyle = 'rgba(255, 220, 120, 0.6)';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 20, 0, Math.PI * 2);
  ctx.fill();

  // Cloud wisps
  for (let i = 0; i < 5; i++) {
    const cx = ((i * 200 + tick * 0.15) % (CANVAS_WIDTH + 200)) - 100;
    const cy = 60 + i * 30;
    ctx.fillStyle = `rgba(255, 180, 120, ${0.08 + i * 0.02})`;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 80 + i * 10, 15 + i * 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDistantBuildings(ctx: CanvasRenderingContext2D, cameraX: number): void {
  const px = cameraX * 0.15;
  const baseY = STAGE_GROUND_Y - 10;

  // Layer of distant pagodas and buildings
  const buildings = [
    { x: 30, w: 80, h: 140, color: '#3a2020' },
    { x: 120, w: 60, h: 100, color: '#352020' },
    { x: 200, w: 100, h: 170, color: '#402525' },
    { x: 320, w: 70, h: 110, color: '#382222' },
    { x: 410, w: 90, h: 155, color: '#3d2424' },
    { x: 520, w: 75, h: 130, color: '#362020' },
    { x: 620, w: 110, h: 180, color: '#422828' },
    { x: 750, w: 65, h: 105, color: '#341e1e' },
    { x: 830, w: 95, h: 150, color: '#3b2323' },
    { x: 950, w: 80, h: 125, color: '#372121' },
  ];

  for (const b of buildings) {
    const bx = b.x - px;
    ctx.fillStyle = b.color;
    ctx.fillRect(bx, baseY - b.h, b.w, b.h);
    // Pagoda roof hint
    ctx.fillStyle = shiftC(b.color, -15);
    ctx.beginPath();
    ctx.moveTo(bx - 10, baseY - b.h + 5);
    ctx.quadraticCurveTo(bx + b.w * 0.5, baseY - b.h - 20, bx + b.w + 10, baseY - b.h + 5);
    ctx.closePath();
    ctx.fill();
  }

  // Atmospheric haze
  const hazeGrad = ctx.createLinearGradient(0, baseY - 80, 0, baseY);
  hazeGrad.addColorStop(0, 'rgba(180, 100, 60, 0)');
  hazeGrad.addColorStop(0.7, 'rgba(180, 100, 60, 0.12)');
  hazeGrad.addColorStop(1, 'rgba(150, 80, 50, 0.2)');
  ctx.fillStyle = hazeGrad;
  ctx.fillRect(0, baseY - 80, CANVAS_WIDTH, 80);
}

function drawMarketStalls(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  const px = cameraX * 0.4;

  const stalls = [
    { x: 50, w: 120, h: 80, color: '#aa3333', sign: '食' },
    { x: 250, w: 100, h: 70, color: '#cc6622', sign: '酒' },
    { x: 450, w: 130, h: 85, color: '#aa2244', sign: '茶' },
    { x: 650, w: 110, h: 75, color: '#bb4422', sign: '餅' },
    { x: 830, w: 100, h: 80, color: '#993355', sign: '薬' },
  ];

  for (const stall of stalls) {
    const sx = stall.x - px;
    const baseY = STAGE_GROUND_Y;

    // Stall body (wooden counter)
    ctx.fillStyle = '#5a3a20';
    ctx.fillRect(sx, baseY - 50, stall.w, 50);

    // Counter top
    ctx.fillStyle = '#7a5a35';
    ctx.fillRect(sx - 5, baseY - 52, stall.w + 10, 5);

    // Canopy/awning
    ctx.fillStyle = stall.color;
    const awningWave = Math.sin(tick * 0.02 + stall.x * 0.01) * 3;
    ctx.beginPath();
    ctx.moveTo(sx - 15, baseY - stall.h);
    ctx.quadraticCurveTo(sx + stall.w * 0.5, baseY - stall.h - 15 + awningWave, sx + stall.w + 15, baseY - stall.h);
    ctx.lineTo(sx + stall.w + 15, baseY - stall.h + 12);
    ctx.quadraticCurveTo(sx + stall.w * 0.5, baseY - stall.h - 3 + awningWave, sx - 15, baseY - stall.h + 12);
    ctx.closePath();
    ctx.fill();

    // Canopy fringe
    ctx.fillStyle = shiftC(stall.color, 20);
    for (let fx = sx - 10; fx < sx + stall.w + 10; fx += 8) {
      ctx.fillRect(fx, baseY - stall.h + 10, 6, 4);
    }

    // Poles
    ctx.fillStyle = '#4a2a15';
    ctx.fillRect(sx - 3, baseY - stall.h - 5, 6, stall.h + 5);
    ctx.fillRect(sx + stall.w - 3, baseY - stall.h - 5, 6, stall.h + 5);

    // Steam rising from food stall
    for (let si = 0; si < 3; si++) {
      const steamX = sx + 20 + si * 30;
      const steamPhase = tick * 0.05 + si;
      const steamAlpha = 0.15 + Math.sin(steamPhase) * 0.1;
      ctx.fillStyle = `rgba(220, 220, 220, ${steamAlpha})`;
      ctx.beginPath();
      ctx.ellipse(steamX + Math.sin(steamPhase * 0.5) * 5, baseY - 55 - si * 15, 8, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Red paper lanterns strung across
  for (let li = 0; li < 12; li++) {
    const lx = ((li * 90 + 20) - px * 0.3) % (CANVAS_WIDTH + 100);
    if (lx < -20 || lx > CANVAS_WIDTH + 20) continue;
    const ly = 140 + Math.sin(tick * 0.02 + li) * 4;
    const lSize = 6 + Math.sin(tick * 0.03 + li * 0.5) * 1;
    // String
    ctx.strokeStyle = 'rgba(120, 80, 40, 0.4)';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(lx, ly - lSize * 2); ctx.lineTo(lx, ly - lSize); ctx.stroke();
    // Glow
    const lGlow = ctx.createRadialGradient(lx, ly, 0, lx, ly, lSize * 4);
    lGlow.addColorStop(0, 'rgba(255, 100, 30, 0.15)');
    lGlow.addColorStop(1, 'rgba(255, 80, 20, 0)');
    ctx.fillStyle = lGlow;
    ctx.fillRect(lx - lSize * 4, ly - lSize * 4, lSize * 8, lSize * 8);
    // Body
    ctx.fillStyle = '#cc3322';
    ctx.beginPath();
    ctx.ellipse(lx, ly, lSize, lSize * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
    // Inner
    ctx.fillStyle = '#ff6644';
    ctx.beginPath();
    ctx.ellipse(lx, ly, lSize * 0.5, lSize * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Top/bottom
    ctx.fillStyle = '#881111';
    ctx.fillRect(lx - lSize - 1, ly - lSize * 1.2 - 2, lSize * 2 + 2, 3);
    ctx.fillRect(lx - lSize, ly + lSize * 1.2 - 1, lSize * 2, 2);
  }
}

function drawSigns(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  const px = cameraX * 0.35;

  const signs = [
    { x: 100, y: 160, text: '龍', color: '#ffdd44', bg: '#881111' },
    { x: 350, y: 140, text: '鳳', color: '#ffdd44', bg: '#881111' },
    { x: 580, y: 155, text: '福', color: '#ffcc33', bg: '#992222' },
    { x: 800, y: 145, text: '壽', color: '#ffcc33', bg: '#882222' },
  ];

  for (const sign of signs) {
    const sx = sign.x - px;
    const sway = Math.sin(tick * 0.015 + sign.x * 0.01) * 3;
    const sw = 30, sh = 35;

    ctx.save();
    ctx.translate(sx + sway, sign.y);

    // Hanging string
    ctx.strokeStyle = 'rgba(100, 60, 30, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -40); ctx.lineTo(0, -sh / 2); ctx.stroke();

    // Sign board
    ctx.fillStyle = sign.bg;
    roundRect(ctx, -sw / 2, -sh / 2, sw, sh, 3);
    ctx.fill();
    ctx.strokeStyle = '#ffdd44';
    ctx.lineWidth = 1;
    roundRect(ctx, -sw / 2, -sh / 2, sw, sh, 3);
    ctx.stroke();

    // Character
    ctx.fillStyle = sign.color;
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sign.text, 0, 1);

    ctx.restore();
  }
}

function drawGround(ctx: CanvasRenderingContext2D, cameraX: number): void {
  // Stone/concrete ground
  const groundGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y, 0, CANVAS_HEIGHT);
  groundGrad.addColorStop(0, '#554433');
  groundGrad.addColorStop(0.03, '#4a3a28');
  groundGrad.addColorStop(0.15, '#3a2a1c');
  groundGrad.addColorStop(1, '#2a1a10');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, STAGE_GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - STAGE_GROUND_Y);

  // Cobblestone pattern
  ctx.strokeStyle = 'rgba(80, 65, 50, 0.15)';
  ctx.lineWidth = 1;
  for (let gy = STAGE_GROUND_Y + 8; gy < CANVAS_HEIGHT; gy += 14) {
    const offset = (Math.floor(gy / 14) % 2) * 20;
    for (let gx = offset; gx < CANVAS_WIDTH; gx += 40) {
      ctx.strokeRect(gx, gy, 38, 12);
    }
  }

  // Ground edge highlight (warm)
  const edgeGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y - 3, 0, STAGE_GROUND_Y + 5);
  edgeGrad.addColorStop(0, 'rgba(200, 150, 80, 0.3)');
  edgeGrad.addColorStop(1, 'rgba(180, 130, 70, 0)');
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, STAGE_GROUND_Y - 3, CANVAS_WIDTH, 8);
}

function drawParticles(ctx: CanvasRenderingContext2D, tick: number): void {
  // Banner flutter
  for (const b of banners) {
    b.rotation += b.rotSpeed + Math.sin(tick * 0.03 + b.x * 0.01) * 0.002;
    const alpha = 0.6 + Math.sin(tick * 0.02 + b.life * 0.05) * 0.2;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.rotation);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#cc3322';
    ctx.fillRect(-b.size / 2, -4, b.size, 8);
    ctx.fillStyle = '#ffcc33';
    ctx.font = 'bold 6px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('福', 0, 0);
    ctx.restore();
  }

  // Smoke from food stalls
  for (const s of smokePuffs) {
    s.x += s.vx;
    s.y += s.vy;
    s.life++;
    if (s.y < STAGE_GROUND_Y - 150 || s.life > 200) {
      s.x = 100 + Math.random() * 800;
      s.y = STAGE_GROUND_Y - 40 - Math.random() * 20;
      s.life = 0;
    }
    const alpha = Math.max(0, 0.12 - s.life * 0.001);
    ctx.fillStyle = `rgba(200, 200, 200, ${alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBoundaries(ctx: CanvasRenderingContext2D, cameraX: number): void {
  ctx.strokeStyle = 'rgba(255, 50, 50, 0.15)';
  ctx.lineWidth = 2;
  const leftEdge = -cameraX;
  const rightEdge = 1400 - cameraX;
  if (leftEdge >= 0 && leftEdge <= CANVAS_WIDTH) {
    ctx.beginPath(); ctx.moveTo(leftEdge, 80); ctx.lineTo(leftEdge, CANVAS_HEIGHT); ctx.stroke();
  }
  if (rightEdge >= 0 && rightEdge <= CANVAS_WIDTH) {
    ctx.beginPath(); ctx.moveTo(rightEdge, 80); ctx.lineTo(rightEdge, CANVAS_HEIGHT); ctx.stroke();
  }
}

function shiftC(color: string, amount: number): string {
  const r = Math.max(0, Math.min(255, parseInt(color.slice(1, 3), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(color.slice(3, 5), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(color.slice(5, 7), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
