/**
 * Stage rendering — China Town Street (唐人街)
 * Daytime scene with market stalls, lanterns, signs, crowds
 * Enhanced with richer layers, more detail, and better atmosphere
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

interface CrowdPerson {
  x: number;
  baseY: number;
  h: number;
  color: string;
  phase: number;
  type: number;
}

const banners: Particle[] = [];
const smokePuffs: Particle[] = [];
const sparkles: Particle[] = [];
const crowd: CrowdPerson[] = [];
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
  for (let i = 0; i < 14; i++) {
    smokePuffs.push({
      x: 80 + Math.random() * 850,
      y: STAGE_GROUND_Y - 50 - Math.random() * 80,
      vx: (Math.random() - 0.5) * 0.3, vy: -0.3 - Math.random() * 0.5,
      size: 8 + Math.random() * 12, life: Math.random() * 200, rotation: 0, rotSpeed: 0,
    });
  }
  // Golden sparkles from sunlight
  for (let i = 0; i < 12; i++) {
    sparkles.push({
      x: Math.random() * CANVAS_WIDTH,
      y: 100 + Math.random() * 350,
      vx: (Math.random() - 0.5) * 0.2,
      vy: 0.1 + Math.random() * 0.2,
      size: 1 + Math.random() * 2,
      life: Math.floor(Math.random() * 100),
      rotation: 0, rotSpeed: 0,
    });
  }
  // Background crowd
  const crowdColors = ['#553322', '#443322', '#554433', '#443311', '#554422', '#334433', '#553333'];
  for (let i = 0; i < 20; i++) {
    crowd.push({
      x: 20 + i * 45 + Math.random() * 15,
      baseY: STAGE_GROUND_Y - 5 - Math.random() * 8,
      h: 25 + Math.random() * 15,
      color: crowdColors[i % crowdColors.length],
      phase: Math.random() * Math.PI * 2,
      type: Math.floor(Math.random() * 3),
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
  drawBackgroundCrowd(ctx, cameraX, globalTick);
  drawMarketStalls(ctx, cameraX, globalTick);
  drawSigns(ctx, cameraX, globalTick);
  drawClotheslines(ctx, cameraX, globalTick);
  drawGround(ctx, cameraX, globalTick);
  drawParticles(ctx, globalTick);
  drawSparkles(ctx, globalTick);
  drawBoundaries(ctx, cameraX);
}

function drawSky(ctx: CanvasRenderingContext2D, tick: number): void {
  // Richer sunset sky with more color stops
  const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  skyGrad.addColorStop(0, '#1a0a18');
  skyGrad.addColorStop(0.1, '#2a1525');
  skyGrad.addColorStop(0.2, '#4a2040');
  skyGrad.addColorStop(0.3, '#6a2838');
  skyGrad.addColorStop(0.4, '#8a3535');
  skyGrad.addColorStop(0.55, '#bb5530');
  skyGrad.addColorStop(0.65, '#cc6633');
  skyGrad.addColorStop(0.75, '#dd8844');
  skyGrad.addColorStop(0.85, '#cc7740');
  skyGrad.addColorStop(0.95, '#aa5533');
  skyGrad.addColorStop(1, '#884422');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Sun with richer glow
  const sunX = 750;
  const sunY = 180;

  // Outer atmospheric glow
  const atmoGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 250);
  atmoGlow.addColorStop(0, 'rgba(255, 200, 80, 0.4)');
  atmoGlow.addColorStop(0.2, 'rgba(255, 160, 50, 0.2)');
  atmoGlow.addColorStop(0.4, 'rgba(255, 120, 40, 0.1)');
  atmoGlow.addColorStop(0.7, 'rgba(255, 100, 30, 0.04)');
  atmoGlow.addColorStop(1, 'rgba(255, 80, 20, 0)');
  ctx.fillStyle = atmoGlow;
  ctx.fillRect(sunX - 250, sunY - 250, 500, 500);

  // Sun rays
  ctx.save();
  ctx.translate(sunX, sunY);
  ctx.globalAlpha = 0.03;
  for (let r = 0; r < 12; r++) {
    ctx.rotate(Math.PI / 6);
    ctx.fillStyle = '#ffcc66';
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(0, -200);
    ctx.lineTo(4, 0);
    ctx.fill();
  }
  ctx.restore();

  // Sun disc with gradient
  const sunGrad = ctx.createRadialGradient(sunX - 3, sunY - 3, 0, sunX, sunY, 22);
  sunGrad.addColorStop(0, 'rgba(255, 240, 180, 0.8)');
  sunGrad.addColorStop(0.4, 'rgba(255, 220, 120, 0.6)');
  sunGrad.addColorStop(0.8, 'rgba(255, 200, 80, 0.3)');
  sunGrad.addColorStop(1, 'rgba(255, 180, 60, 0)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 22, 0, Math.PI * 2);
  ctx.fill();

  // Cloud wisps — richer
  for (let i = 0; i < 7; i++) {
    const cx = ((i * 160 + tick * (0.08 + i * 0.02)) % (CANVAS_WIDTH + 300)) - 150;
    const cy = 40 + i * 28;
    const alpha = 0.06 + i * 0.015;
    const warmth = i < 3 ? '255, 180, 120' : '255, 150, 100';
    ctx.fillStyle = `rgba(${warmth}, ${alpha})`;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 90 + i * 12, 12 + i * 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Sub-cloud
    ctx.fillStyle = `rgba(${warmth}, ${alpha * 0.6})`;
    ctx.beginPath();
    ctx.ellipse(cx + 40, cy - 5, 50 + i * 5, 8 + i * 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Birds silhouettes
  const birdTick = tick * 0.5;
  for (let b = 0; b < 4; b++) {
    const bx = (birdTick * 0.8 + b * 120) % (CANVAS_WIDTH + 200) - 100;
    const by = 60 + b * 20 + Math.sin(tick * 0.03 + b * 2) * 5;
    const wingPhase = Math.sin(tick * 0.15 + b * 3);
    ctx.strokeStyle = 'rgba(30, 15, 10, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bx - 6, by + wingPhase * 3);
    ctx.quadraticCurveTo(bx - 2, by - 2, bx, by);
    ctx.quadraticCurveTo(bx + 2, by - 2, bx + 6, by + wingPhase * 3);
    ctx.stroke();
  }
}

function drawDistantBuildings(ctx: CanvasRenderingContext2D, cameraX: number): void {
  const px = cameraX * 0.12;
  const baseY = STAGE_GROUND_Y - 10;

  // Multiple layers of buildings for depth
  // Back layer (darkest)
  const backBuildings = [
    { x: 0, w: 90, h: 160 }, { x: 100, w: 70, h: 130 }, { x: 180, w: 110, h: 190 },
    { x: 310, w: 80, h: 145 }, { x: 400, w: 100, h: 175 }, { x: 520, w: 75, h: 140 },
    { x: 610, w: 120, h: 200 }, { x: 750, w: 85, h: 155 }, { x: 850, w: 100, h: 170 },
  ];

  for (const b of backBuildings) {
    const bx = b.x - px * 0.5;
    ctx.fillStyle = '#1a1010';
    ctx.fillRect(bx, baseY - b.h, b.w, b.h);
    // Pagoda roof hint
    ctx.fillStyle = '#150c0c';
    ctx.beginPath();
    ctx.moveTo(bx - 12, baseY - b.h + 5);
    ctx.quadraticCurveTo(bx + b.w * 0.5, baseY - b.h - 22, bx + b.w + 12, baseY - b.h + 5);
    ctx.closePath();
    ctx.fill();
  }

  // Front layer (slightly lighter)
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
    // Multi-tier pagoda roof for taller buildings
    if (b.h > 140) {
      // Second tier
      ctx.fillStyle = shiftC(b.color, -12);
      ctx.beginPath();
      ctx.moveTo(bx - 8, baseY - b.h + 5);
      ctx.quadraticCurveTo(bx + b.w * 0.5, baseY - b.h - 18, bx + b.w + 8, baseY - b.h + 5);
      ctx.closePath();
      ctx.fill();
      // Top tier
      ctx.fillStyle = shiftC(b.color, -18);
      const tw = b.w * 0.5;
      const ttx = bx + (b.w - tw) / 2;
      ctx.beginPath();
      ctx.moveTo(ttx - 5, baseY - b.h + 5);
      ctx.quadraticCurveTo(ttx + tw * 0.5, baseY - b.h - 30, ttx + tw + 5, baseY - b.h + 5);
      ctx.closePath();
      ctx.fill();
      // Spire
      ctx.strokeStyle = 'rgba(180, 140, 60, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx + b.w / 2, baseY - b.h - 25);
      ctx.lineTo(bx + b.w / 2, baseY - b.h - 38);
      ctx.stroke();
    } else {
      ctx.fillStyle = shiftC(b.color, -15);
      ctx.beginPath();
      ctx.moveTo(bx - 10, baseY - b.h + 5);
      ctx.quadraticCurveTo(bx + b.w * 0.5, baseY - b.h - 20, bx + b.w + 10, baseY - b.h + 5);
      ctx.closePath();
      ctx.fill();
    }
    // Lit windows
    for (let wy = baseY - b.h + 25; wy < baseY - 15; wy += 25) {
      for (let wx = bx + 8; wx < bx + b.w - 12; wx += 18) {
        if (Math.sin(wx * 13.7 + wy * 7.3) > 0.2) {
          ctx.fillStyle = 'rgba(255, 180, 80, 0.08)';
          ctx.fillRect(wx, wy, 8, 10);
        }
      }
    }
  }

  // Atmospheric haze — more layered
  const hazeGrad1 = ctx.createLinearGradient(0, baseY - 100, 0, baseY);
  hazeGrad1.addColorStop(0, 'rgba(160, 90, 50, 0)');
  hazeGrad1.addColorStop(0.5, 'rgba(170, 100, 60, 0.08)');
  hazeGrad1.addColorStop(1, 'rgba(150, 80, 50, 0.18)');
  ctx.fillStyle = hazeGrad1;
  ctx.fillRect(0, baseY - 100, CANVAS_WIDTH, 100);

  const hazeGrad2 = ctx.createLinearGradient(0, baseY - 40, 0, baseY + 20);
  hazeGrad2.addColorStop(0, 'rgba(180, 110, 70, 0)');
  hazeGrad2.addColorStop(0.5, 'rgba(190, 120, 80, 0.1)');
  hazeGrad2.addColorStop(1, 'rgba(160, 90, 55, 0)');
  ctx.fillStyle = hazeGrad2;
  ctx.fillRect(0, baseY - 40, CANVAS_WIDTH, 60);
}

function drawBackgroundCrowd(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  const px = cameraX * 0.38;

  for (const person of crowd) {
    const personX = person.x - px;
    if (personX < -20 || personX > CANVAS_WIDTH + 20) continue;

    const bob = Math.sin(tick * 0.04 + person.phase) * 1.5;
    const py = person.baseY + bob;
    const h = person.h;

    // Body
    ctx.fillStyle = person.color;
    ctx.fillRect(personX - 5, py - h + 8, 10, h - 8);

    // Head
    ctx.beginPath();
    ctx.arc(personX, py - h, 5, 0, Math.PI * 2);
    ctx.fill();

    // Simple arm animation for some
    if (person.type === 1) {
      const armAngle = Math.sin(tick * 0.06 + person.phase) * 0.3;
      ctx.strokeStyle = person.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(personX + 5, py - h + 15);
      ctx.lineTo(personX + 5 + Math.cos(armAngle) * 8, py - h + 15 + Math.sin(armAngle) * 8);
      ctx.stroke();
    }
  }
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

    // Stall body (wooden counter) with richer detail
    const counterGrad = ctx.createLinearGradient(sx, baseY - 50, sx, baseY);
    counterGrad.addColorStop(0, '#6a4a28');
    counterGrad.addColorStop(0.5, '#5a3a20');
    counterGrad.addColorStop(1, '#4a2a15');
    ctx.fillStyle = counterGrad;
    ctx.fillRect(sx, baseY - 50, stall.w, 50);

    // Counter front panel with wood grain
    ctx.strokeStyle = 'rgba(90, 70, 40, 0.15)';
    ctx.lineWidth = 0.5;
    for (let ly = baseY - 45; ly < baseY - 5; ly += 5) {
      ctx.beginPath();
      ctx.moveTo(sx + 2, ly);
      ctx.lineTo(sx + stall.w - 2, ly);
      ctx.stroke();
    }

    // Counter top — polished wood
    ctx.fillStyle = '#7a5a35';
    ctx.fillRect(sx - 5, baseY - 52, stall.w + 10, 5);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(sx - 5, baseY - 52, stall.w + 10, 2);

    // Display items on counter
    for (let di = 0; di < 3; di++) {
      const dx = sx + 15 + di * 35;
      ctx.fillStyle = '#8a6a40';
      ctx.beginPath();
      ctx.arc(dx, baseY - 55, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Canopy/awning with more detail
    ctx.fillStyle = stall.color;
    const awningWave = Math.sin(tick * 0.02 + stall.x * 0.01) * 3;
    ctx.beginPath();
    ctx.moveTo(sx - 15, baseY - stall.h);
    ctx.quadraticCurveTo(sx + stall.w * 0.5, baseY - stall.h - 15 + awningWave, sx + stall.w + 15, baseY - stall.h);
    ctx.lineTo(sx + stall.w + 15, baseY - stall.h + 12);
    ctx.quadraticCurveTo(sx + stall.w * 0.5, baseY - stall.h - 3 + awningWave, sx - 15, baseY - stall.h + 12);
    ctx.closePath();
    ctx.fill();

    // Canopy stripes
    const stripeColor = shiftC(stall.color, 25);
    for (let stripe = sx - 10; stripe < sx + stall.w + 8; stripe += 16) {
      ctx.fillStyle = stripeColor;
      ctx.fillRect(stripe, baseY - stall.h + 2, 8, 8);
    }

    // Canopy fringe
    ctx.fillStyle = shiftC(stall.color, -20);
    for (let fx = sx - 10; fx < sx + stall.w + 10; fx += 7) {
      const fringeWave = Math.sin(tick * 0.025 + fx * 0.05) * 1;
      ctx.fillRect(fx, baseY - stall.h + 10 + fringeWave, 5, 5);
    }

    // Support poles with brackets
    ctx.fillStyle = '#4a2a15';
    ctx.fillRect(sx - 3, baseY - stall.h - 5, 6, stall.h + 5);
    ctx.fillRect(sx + stall.w - 3, baseY - stall.h - 5, 6, stall.h + 5);
    // Pole caps
    ctx.fillStyle = '#5a3a20';
    ctx.fillRect(sx - 5, baseY - stall.h - 7, 10, 3);
    ctx.fillRect(sx + stall.w - 5, baseY - stall.h - 7, 10, 3);

    // Hanging menu board
    ctx.fillStyle = '#3a2010';
    roundRect(ctx, sx + stall.w / 2 - 15, baseY - stall.h + 15, 30, 20, 2);
    ctx.fill();
    ctx.strokeStyle = shiftC(stall.color, 30);
    ctx.lineWidth = 1;
    roundRect(ctx, sx + stall.w / 2 - 15, baseY - stall.h + 15, 30, 20, 2);
    ctx.stroke();

    // Steam from cooking — richer
    for (let si = 0; si < 4; si++) {
      const steamX = sx + 15 + si * 28 + Math.sin(tick * 0.035 + si + stall.x * 0.05) * 4;
      const steamBaseY = baseY - 55;
      for (let sl = 0; sl < 3; sl++) {
        const steamY = steamBaseY - sl * 12 - Math.abs(Math.sin(tick * 0.04 + si + sl)) * 8;
        const steamAlpha = Math.max(0, (0.15 - sl * 0.04) * (1 - Math.sin(tick * 0.05 + si + sl) * 0.3));
        ctx.fillStyle = `rgba(230, 220, 210, ${steamAlpha})`;
        ctx.beginPath();
        ctx.ellipse(steamX + Math.sin(tick * 0.04 + sl * 0.5) * 3, steamY, 7 + sl * 2, 4 + sl, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Warm glow from stall
    const warmGlow = ctx.createRadialGradient(sx + stall.w / 2, baseY - 60, 0, sx + stall.w / 2, baseY - 60, 50);
    warmGlow.addColorStop(0, 'rgba(255, 180, 80, 0.08)');
    warmGlow.addColorStop(1, 'rgba(255, 150, 50, 0)');
    ctx.fillStyle = warmGlow;
    ctx.fillRect(sx - 40, baseY - 110, stall.w + 80, 110);
  }

  // Red paper lanterns strung across — more detailed
  for (let li = 0; li < 14; li++) {
    const lx = ((li * 80 + 20) - px * 0.3) % (CANVAS_WIDTH + 120);
    if (lx < -20 || lx > CANVAS_WIDTH + 20) continue;
    const ly = 135 + Math.sin(tick * 0.02 + li) * 4;
    const lSize = 7 + Math.sin(tick * 0.03 + li * 0.5) * 1;
    const flicker = 0.7 + Math.sin(tick * 0.05 + li * 0.7) * 0.2;

    // String
    ctx.strokeStyle = 'rgba(120, 80, 40, 0.4)';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(lx, ly - lSize * 2.5); ctx.lineTo(lx, ly - lSize); ctx.stroke();

    // Glow
    const lGlow = ctx.createRadialGradient(lx, ly, 0, lx, ly, lSize * 5);
    lGlow.addColorStop(0, `rgba(255, 100, 30, ${0.18 * flicker})`);
    lGlow.addColorStop(0.5, `rgba(255, 80, 20, ${0.06 * flicker})`);
    lGlow.addColorStop(1, 'rgba(255, 80, 20, 0)');
    ctx.fillStyle = lGlow;
    ctx.fillRect(lx - lSize * 5, ly - lSize * 5, lSize * 10, lSize * 10);

    // Body
    ctx.fillStyle = '#cc3322';
    ctx.beginPath();
    ctx.ellipse(lx, ly, lSize, lSize * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner glow
    ctx.fillStyle = `rgba(255, 130, 60, ${0.5 * flicker})`;
    ctx.beginPath();
    ctx.ellipse(lx, ly, lSize * 0.5, lSize * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Top/bottom caps
    ctx.fillStyle = '#881111';
    ctx.fillRect(lx - lSize - 1, ly - lSize * 1.2 - 2, lSize * 2 + 2, 3);
    ctx.fillRect(lx - lSize, ly + lSize * 1.2 - 1, lSize * 2, 2);

    // Gold character
    ctx.fillStyle = `rgba(255, 220, 100, ${0.5 * flicker})`;
    ctx.font = `bold ${Math.max(5, lSize * 0.8)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const chars = ['福', '壽', '喜', '祿'];
    ctx.fillText(chars[li % 4], lx, ly + 1);

    // Tassel
    ctx.strokeStyle = 'rgba(200, 150, 50, 0.3)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(lx, ly + lSize * 1.2);
    ctx.lineTo(lx, ly + lSize * 1.2 + 5);
    ctx.stroke();
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
    const sw = 32, sh = 38;

    ctx.save();
    ctx.translate(sx + sway, sign.y);

    // Hanging string with knot
    ctx.strokeStyle = 'rgba(100, 60, 30, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -45); ctx.lineTo(0, -sh / 2 - 3); ctx.stroke();
    // Knot
    ctx.fillStyle = 'rgba(180, 100, 40, 0.5)';
    ctx.beginPath();
    ctx.arc(0, -sh / 2 - 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Sign board shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    roundRect(ctx, -sw / 2 + 2, -sh / 2 + 2, sw, sh, 3);
    ctx.fill();

    // Sign board
    ctx.fillStyle = sign.bg;
    roundRect(ctx, -sw / 2, -sh / 2, sw, sh, 3);
    ctx.fill();

    // Gold border
    ctx.strokeStyle = sign.color;
    ctx.lineWidth = 1.5;
    roundRect(ctx, -sw / 2, -sh / 2, sw, sh, 3);
    ctx.stroke();

    // Inner border
    ctx.strokeStyle = `rgba(255, 220, 100, 0.2)`;
    ctx.lineWidth = 0.5;
    roundRect(ctx, -sw / 2 + 3, -sh / 2 + 3, sw - 6, sh - 6, 2);
    ctx.stroke();

    // Character
    ctx.fillStyle = sign.color;
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sign.text, 0, 1);

    ctx.restore();
  }
}

function drawClotheslines(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  const px = cameraX * 0.25;

  // Clotheslines between buildings
  const lines = [
    { x1: 100, x2: 300, y: 220 },
    { x1: 450, x2: 680, y: 210 },
    { x1: 700, x2: 900, y: 225 },
  ];

  const clothing = [
    { color: '#cc4444', w: 12, h: 16 },
    { color: '#4444cc', w: 10, h: 14 },
    { color: '#cccc44', w: 11, h: 15 },
    { color: '#44cc44', w: 13, h: 17 },
  ];

  for (const line of lines) {
    const x1 = line.x1 - px;
    const x2 = line.x2 - px;
    const sag = 10 + Math.sin(tick * 0.01) * 2;

    // Rope
    ctx.strokeStyle = 'rgba(100, 80, 50, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, line.y);
    ctx.quadraticCurveTo((x1 + x2) / 2, line.y + sag, x2, line.y);
    ctx.stroke();

    // Clothes hanging
    const clothCount = Math.floor((x2 - x1) / 40);
    for (let ci = 0; ci < clothCount && ci < 5; ci++) {
      const t = (ci + 1) / (clothCount + 1);
      const cx = x1 + (x2 - x1) * t;
      const cy = line.y + sag * Math.sin(t * Math.PI);
      const cloth = clothing[ci % clothing.length];
      const clothWave = Math.sin(tick * 0.025 + ci * 1.5) * 2;

      ctx.fillStyle = cloth.color;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(clothWave * 0.02);
      ctx.fillRect(-cloth.w / 2, 0, cloth.w, cloth.h);
      ctx.restore();
    }
  }
}

function drawGround(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  // Stone/concrete ground — richer
  const groundGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y, 0, CANVAS_HEIGHT);
  groundGrad.addColorStop(0, '#554433');
  groundGrad.addColorStop(0.02, '#4a3a28');
  groundGrad.addColorStop(0.08, '#3d2e1f');
  groundGrad.addColorStop(0.2, '#3a2a1c');
  groundGrad.addColorStop(0.5, '#2a1a10');
  groundGrad.addColorStop(1, '#1a100a');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, STAGE_GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - STAGE_GROUND_Y);

  // Cobblestone pattern — more detailed
  ctx.strokeStyle = 'rgba(80, 65, 50, 0.12)';
  ctx.lineWidth = 0.5;
  for (let gy = STAGE_GROUND_Y + 6; gy < CANVAS_HEIGHT; gy += 12) {
    const offset = (Math.floor(gy / 12) % 2) * 20;
    for (let gx = offset; gx < CANVAS_WIDTH; gx += 38) {
      ctx.strokeRect(gx, gy, 36, 10);
      // Stone texture
      ctx.fillStyle = `rgba(70, 55, 40, ${0.03 + Math.sin(gx * 3.1 + gy * 5.7) * 0.02})`;
      ctx.fillRect(gx + 1, gy + 1, 34, 8);
    }
  }

  // Drainage channel
  ctx.fillStyle = '#2a1a10';
  ctx.fillRect(0, STAGE_GROUND_Y, CANVAS_WIDTH, 3);
  ctx.fillStyle = 'rgba(60, 50, 35, 0.3)';
  ctx.fillRect(0, STAGE_GROUND_Y + 3, CANVAS_WIDTH, 2);

  // Ground edge highlight (warm)
  const edgeGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y - 4, 0, STAGE_GROUND_Y + 6);
  edgeGrad.addColorStop(0, 'rgba(200, 150, 80, 0)');
  edgeGrad.addColorStop(0.3, 'rgba(200, 150, 80, 0.35)');
  edgeGrad.addColorStop(0.6, 'rgba(180, 130, 70, 0.15)');
  edgeGrad.addColorStop(1, 'rgba(180, 130, 70, 0)');
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, STAGE_GROUND_Y - 4, CANVAS_WIDTH, 10);

  // Scattered fallen leaves
  for (let i = 0; i < 10; i++) {
    const lx = (i * 87 + 30 + Math.sin(tick * 0.005 + i) * 5) % CANVAS_WIDTH;
    const ly = STAGE_GROUND_Y + 5 + (i * 13) % 30;
    ctx.fillStyle = `rgba(${150 + i * 10}, ${100 + i * 5}, 40, ${0.1 + Math.sin(i * 2.3) * 0.05})`;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(i * 0.7);
    ctx.beginPath();
    ctx.ellipse(0, 0, 3, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawSparkles(ctx: CanvasRenderingContext2D, tick: number): void {
  for (const s of sparkles) {
    s.x += s.vx;
    s.y += s.vy;
    s.life++;
    if (s.life > 100 || s.y > STAGE_GROUND_Y) {
      s.x = Math.random() * CANVAS_WIDTH;
      s.y = 100 + Math.random() * 300;
      s.life = 0;
    }
    const alpha = Math.max(0, (1 - s.life / 100) * 0.3 * (0.5 + Math.sin(tick * 0.1 + s.x * 0.5) * 0.5));
    if (alpha < 0.02) continue;

    ctx.fillStyle = `rgba(255, 240, 200, ${alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Cross sparkle
    ctx.strokeStyle = `rgba(255, 240, 200, ${alpha * 0.5})`;
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    ctx.moveTo(s.x - s.size, s.y);
    ctx.lineTo(s.x + s.size, s.y);
    ctx.moveTo(s.x, s.y - s.size);
    ctx.lineTo(s.x, s.y + s.size);
    ctx.stroke();
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, tick: number): void {
  // Banner flutter — more detail
  for (const b of banners) {
    b.rotation += b.rotSpeed + Math.sin(tick * 0.03 + b.x * 0.01) * 0.002;
    const alpha = 0.6 + Math.sin(tick * 0.02 + b.life * 0.05) * 0.2;
    const wave = Math.sin(tick * 0.025 + b.x * 0.008) * 3;

    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.rotation);
    ctx.globalAlpha = alpha;

    // Banner body
    ctx.fillStyle = '#cc3322';
    ctx.fillRect(-b.size / 2, -4 + wave * 0.2, b.size, 10);
    // Gold border
    ctx.strokeStyle = '#ffcc33';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(-b.size / 2, -4 + wave * 0.2, b.size, 10);
    // Character
    ctx.fillStyle = '#ffcc33';
    ctx.font = 'bold 6px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('福', 0, 1 + wave * 0.2);

    ctx.restore();
  }

  // Smoke from food stalls — more volumetric
  for (const s of smokePuffs) {
    s.x += s.vx + Math.sin(tick * 0.01 + s.y * 0.02) * 0.15;
    s.y += s.vy;
    s.life++;
    s.size += 0.02;
    if (s.y < STAGE_GROUND_Y - 180 || s.life > 200) {
      s.x = 80 + Math.random() * 850;
      s.y = STAGE_GROUND_Y - 40 - Math.random() * 20;
      s.life = 0;
      s.size = 8 + Math.random() * 12;
    }
    const alpha = Math.max(0, 0.1 - s.life * 0.0008);
    ctx.fillStyle = `rgba(210, 205, 195, ${alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
    // Inner brighter area
    ctx.fillStyle = `rgba(230, 225, 215, ${alpha * 0.5})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size * 0.5, 0, Math.PI * 2);
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
