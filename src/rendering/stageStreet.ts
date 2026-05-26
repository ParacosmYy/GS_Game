/**
 * Stage rendering — Street Market (街市夜市)
 * Neon-lit Asian street market at night, hanging lanterns, food stalls,
 * rain effects, puddle reflections, bustling atmosphere
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT, STAGE_GROUND_Y } from '../core/constants.js';
import { roundRect, drawPerspectiveFloorGrid } from './utils.js';
import type { Star } from './stage.js';

// ===== Rain drop =====

interface RainDrop {
  x: number;
  y: number;
  speed: number;
  length: number;
  alpha: number;
}

interface NeonSign {
  x: number;
  y: number;
  text: string;
  color: string;
  flickerPhase: number;
  width: number;
  height: number;
}

interface Lantern {
  x: number;
  y: number;
  size: number;
  color: string;
  swayPhase: number;
}

interface Puddle {
  x: number;
  w: number;
  depth: number;
}

const rainDrops: RainDrop[] = [];
const neonSigns: NeonSign[] = [];
const hangingLanterns: Lantern[] = [];
const puddles: Puddle[] = [];
let initialized = false;

function init(): void {
  // Rain
  for (let i = 0; i < 120; i++) {
    rainDrops.push({
      x: Math.random() * (CANVAS_WIDTH + 100),
      y: Math.random() * CANVAS_HEIGHT,
      speed: 8 + Math.random() * 6,
      length: 8 + Math.random() * 12,
      alpha: 0.1 + Math.random() * 0.2,
    });
  }

  // Neon signs
  neonSigns.push(
    { x: 60, y: 120, text: '酒', color: '#ff3366', flickerPhase: 0, width: 35, height: 40 },
    { x: 250, y: 100, text: '食', color: '#33ff99', flickerPhase: 1.2, width: 35, height: 40 },
    { x: 470, y: 110, text: '龍', color: '#ff6633', flickerPhase: 2.5, width: 35, height: 40 },
    { x: 660, y: 95, text: '福', color: '#3399ff', flickerPhase: 3.8, width: 35, height: 40 },
  );

  // Hanging lanterns
  for (let i = 0; i < 16; i++) {
    hangingLanterns.push({
      x: 30 + i * 52,
      y: 65 + Math.sin(i * 0.8) * 10,
      size: 7 + (i % 3) * 2,
      color: i % 2 === 0 ? '#ff3322' : '#ffaa22',
      swayPhase: i * 0.7,
    });
  }

  // Puddles on ground
  for (let i = 0; i < 6; i++) {
    puddles.push({
      x: 60 + i * 130 + Math.random() * 40,
      w: 40 + Math.random() * 50,
      depth: 3 + Math.random() * 4,
    });
  }

  initialized = true;
}

// ===== Main draw =====

export function drawStreetStage(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  _stars: Star[],
  globalTick: number,
): void {
  if (!initialized) init();

  drawSky(ctx, globalTick);
  drawDistantSkyline(ctx, cameraX);
  drawNeonSigns(ctx, cameraX, globalTick);
  drawBuildings(ctx, cameraX, globalTick);
  drawMovingCars(ctx, cameraX, globalTick);
  drawFoodStalls(ctx, cameraX, globalTick);
  drawHangingLanterns(ctx, cameraX, globalTick);
  drawAwnings(ctx, cameraX, globalTick);
  drawUrbanDetails(ctx, cameraX, globalTick);
  drawGround(ctx, cameraX, globalTick);
  drawRain(ctx, globalTick);
  drawPuddleReflections(ctx, globalTick);
  drawBoundaries(ctx, cameraX);
}

// ===== Layer 0: Sky =====

function drawSky(ctx: CanvasRenderingContext2D, tick: number): void {
  // Night sky with urban light pollution
  const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  skyGrad.addColorStop(0, '#050810');
  skyGrad.addColorStop(0.2, '#0a1020');
  skyGrad.addColorStop(0.4, '#101828');
  skyGrad.addColorStop(0.6, '#152035');
  skyGrad.addColorStop(0.8, '#1a2540');
  skyGrad.addColorStop(1, '#152030');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Urban glow from below
  const urbanGlow = ctx.createLinearGradient(0, CANVAS_HEIGHT, 0, 0);
  urbanGlow.addColorStop(0, 'rgba(255, 150, 80, 0.08)');
  urbanGlow.addColorStop(0.3, 'rgba(255, 120, 60, 0.04)');
  urbanGlow.addColorStop(0.6, 'rgba(200, 100, 50, 0.02)');
  urbanGlow.addColorStop(1, 'rgba(100, 60, 30, 0)');
  ctx.fillStyle = urbanGlow;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Clouds reflecting city lights
  for (let i = 0; i < 5; i++) {
    const cx = ((i * 200 + tick * 0.06) % (CANVAS_WIDTH + 300)) - 150;
    const cy = 30 + i * 25;
    ctx.fillStyle = `rgba(180, 130, 80, ${0.03 + i * 0.01})`;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 100 + i * 15, 12 + i * 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // A few dim stars visible through light pollution
  for (let i = 0; i < 15; i++) {
    const sx = (i * 173 + 41) % CANVAS_WIDTH;
    const sy = (i * 67 + 11) % 120;
    const twinkle = 0.08 + 0.06 * Math.sin(tick * 0.025 + i * 3.1);
    ctx.fillStyle = `rgba(200, 200, 220, ${twinkle})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ===== Layer 1: Distant skyline =====

function drawDistantSkyline(ctx: CanvasRenderingContext2D, cameraX: number): void {
  const px = cameraX * 0.05;

  // High-rise buildings in distance
  const buildings = [
    { x: 20, w: 35, h: 200 }, { x: 60, w: 25, h: 170 }, { x: 100, w: 40, h: 220 },
    { x: 160, w: 30, h: 185 }, { x: 200, w: 45, h: 240 }, { x: 260, w: 28, h: 195 },
    { x: 310, w: 38, h: 210 }, { x: 360, w: 32, h: 180 }, { x: 410, w: 42, h: 235 },
    { x: 470, w: 30, h: 190 }, { x: 510, w: 36, h: 215 }, { x: 560, w: 28, h: 175 },
    { x: 600, w: 40, h: 205 }, { x: 660, w: 34, h: 195 }, { x: 710, w: 38, h: 225 },
    { x: 760, w: 26, h: 185 },
  ];

  for (const b of buildings) {
    const bx = b.x - px;
    const baseY = STAGE_GROUND_Y - 60;
    ctx.fillStyle = '#0a0e18';
    ctx.fillRect(bx, baseY - b.h, b.w, b.h + 60);

    // Random lit windows
    for (let wy = baseY - b.h + 10; wy < baseY - 10; wy += 12) {
      for (let wx = bx + 4; wx < bx + b.w - 4; wx += 8) {
        if (Math.sin(wx * 13.7 + wy * 7.3) > 0.3) {
          const warmth = Math.sin(wx * 3.1 + wy * 5.7) * 0.5 + 0.5;
          ctx.fillStyle = warmth > 0.5
            ? `rgba(255, 200, 100, ${0.15 + warmth * 0.1})`
            : `rgba(180, 200, 255, ${0.1 + warmth * 0.05})`;
          ctx.fillRect(wx, wy, 4, 5);
        }
      }
    }
  }

  // Atmospheric haze between buildings and midground
  const hazeGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y - 120, 0, STAGE_GROUND_Y - 40);
  hazeGrad.addColorStop(0, 'rgba(20, 25, 40, 0)');
  hazeGrad.addColorStop(0.5, 'rgba(25, 30, 50, 0.15)');
  hazeGrad.addColorStop(1, 'rgba(30, 35, 55, 0.1)');
  ctx.fillStyle = hazeGrad;
  ctx.fillRect(0, STAGE_GROUND_Y - 120, CANVAS_WIDTH, 80);
}

// ===== Layer 2: Buildings =====

function drawBuildings(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  const px = cameraX * 0.2;

  const midBuildings = [
    { x: -20, w: 130, h: 200, color: '#141822' },
    { x: 130, w: 100, h: 180, color: '#161c28' },
    { x: 260, w: 120, h: 210, color: '#131a24' },
    { x: 410, w: 110, h: 190, color: '#151b26' },
    { x: 550, w: 130, h: 205, color: '#141922' },
    { x: 710, w: 120, h: 185, color: '#161c28' },
  ];

  for (const b of midBuildings) {
    const bx = b.x - px;
    const baseY = STAGE_GROUND_Y;

    // Building body
    ctx.fillStyle = b.color;
    ctx.fillRect(bx, baseY - b.h, b.w, b.h);

    // Ground floor shop front
    ctx.fillStyle = 'rgba(40, 30, 20, 0.5)';
    ctx.fillRect(bx, baseY - 65, b.w, 65);

    // Shop window glow
    const shopGlow = ctx.createRadialGradient(bx + b.w / 2, baseY - 40, 0, bx + b.w / 2, baseY - 40, 50);
    shopGlow.addColorStop(0, 'rgba(255, 180, 80, 0.08)');
    shopGlow.addColorStop(1, 'rgba(255, 150, 50, 0)');
    ctx.fillStyle = shopGlow;
    ctx.fillRect(bx, baseY - 65, b.w, 65);

    // Windows on upper floors
    for (let floor = 0; floor < 3; floor++) {
      const floorY = baseY - b.h + 20 + floor * 40;
      for (let wx = bx + 10; wx < bx + b.w - 15; wx += 22) {
        const lit = Math.sin(wx * 7.1 + floor * 3.3 + b.x * 0.5) > 0;
        if (lit) {
          const warmFlicker = 0.15 + Math.sin(tick * 0.02 + wx * 0.3) * 0.03;
          ctx.fillStyle = `rgba(255, 200, 120, ${warmFlicker})`;
          ctx.fillRect(wx, floorY, 14, 16);
          // Window frame
          ctx.strokeStyle = 'rgba(60, 50, 40, 0.3)';
          ctx.lineWidth = 1;
          ctx.strokeRect(wx, floorY, 14, 16);
          ctx.beginPath();
          ctx.moveTo(wx + 7, floorY);
          ctx.lineTo(wx + 7, floorY + 16);
          ctx.stroke();
        } else {
          ctx.fillStyle = 'rgba(15, 20, 30, 0.5)';
          ctx.fillRect(wx, floorY, 14, 16);
        }
      }
    }

    // Air conditioning units
    if (b.w > 100) {
      ctx.fillStyle = '#2a2a35';
      ctx.fillRect(bx + 15, baseY - b.h + 95, 18, 10);
      ctx.fillRect(bx + b.w - 35, baseY - b.h + 75, 18, 10);
    }
  }

  // Hanging electrical cables between buildings
  ctx.strokeStyle = 'rgba(60, 60, 70, 0.3)';
  ctx.lineWidth = 1;
  for (let ci = 0; ci < 4; ci++) {
    const cableStartX = midBuildings[ci * 2].x + midBuildings[ci * 2].w - px;
    const cableEndX = midBuildings[ci * 2 + 1].x - px;
    const cableY = STAGE_GROUND_Y - 120 - ci * 15;
    if (cableEndX > cableStartX) {
      ctx.beginPath();
      ctx.moveTo(cableStartX, cableY);
      ctx.quadraticCurveTo((cableStartX + cableEndX) / 2, cableY + 20 + Math.sin(tick * 0.01 + ci) * 3, cableEndX, cableY);
      ctx.stroke();
    }
  }
}

// ===== Layer 3: Neon signs =====

function drawNeonSigns(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  const px = cameraX * 0.25;

  for (const sign of neonSigns) {
    const sx = sign.x - px;
    const flicker = Math.sin(tick * 0.08 + sign.flickerPhase) > -0.8
      ? 0.7 + Math.sin(tick * 0.15 + sign.flickerPhase) * 0.3
      : 0.1;

    // Sign background board
    ctx.fillStyle = 'rgba(20, 15, 10, 0.8)';
    roundRect(ctx, sx, sign.y, sign.width, sign.height, 3);
    ctx.fill();

    // Neon text glow
    const glowGrad = ctx.createRadialGradient(
      sx + sign.width / 2, sign.y + sign.height / 2, 0,
      sx + sign.width / 2, sign.y + sign.height / 2, 40,
    );
    glowGrad.addColorStop(0, sign.color.replace(')', `, ${0.3 * flicker})`).replace('rgb', 'rgba'));
    glowGrad.addColorStop(0.5, sign.color.replace(')', `, ${0.1 * flicker})`).replace('rgb', 'rgba'));
    glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(sx - 20, sign.y - 20, sign.width + 40, sign.height + 40);

    // Actually draw with neon color
    ctx.save();
    ctx.globalAlpha = flicker;
    ctx.font = `bold 22px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Neon glow outline
    ctx.shadowColor = sign.color;
    ctx.shadowBlur = 10 * flicker;
    ctx.fillStyle = sign.color;
    ctx.fillText(sign.text, sx + sign.width / 2, sign.y + sign.height / 2 + 1);

    // Bright center
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = flicker * 0.6;
    ctx.fillText(sign.text, sx + sign.width / 2, sign.y + sign.height / 2 + 1);
    ctx.restore();

    // Mounting wires
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx + 5, sign.y);
    ctx.lineTo(sx + 5, sign.y - 25);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sx + sign.width - 5, sign.y);
    ctx.lineTo(sx + sign.width - 5, sign.y - 25);
    ctx.stroke();
  }
}

// ===== Food stalls =====

function drawFoodStalls(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  const px = cameraX * 0.45;

  const stalls = [
    { x: 30, w: 100, h: 70, color: '#cc3322', label: '拉麵' },
    { x: 200, w: 90, h: 65, color: '#dd6622', label: '焼鳥' },
    { x: 370, w: 110, h: 75, color: '#bb2244', label: '餃子' },
    { x: 540, w: 95, h: 68, color: '#cc5533', label: '天婦羅' },
    { x: 700, w: 105, h: 72, color: '#aa3355', label: 'お好み焼' },
  ];

  for (const stall of stalls) {
    const sx = stall.x - px;
    const baseY = STAGE_GROUND_Y;

    // Stall counter body
    ctx.fillStyle = '#3a2818';
    ctx.fillRect(sx, baseY - 45, stall.w, 45);

    // Counter surface
    ctx.fillStyle = '#5a4030';
    ctx.fillRect(sx - 3, baseY - 47, stall.w + 6, 5);

    // Display shelf
    ctx.fillStyle = '#4a3525';
    ctx.fillRect(sx + 5, baseY - 65, stall.w - 10, 18);
    ctx.fillStyle = '#5a4535';
    ctx.fillRect(sx + 3, baseY - 67, stall.w - 6, 3);

    // Food items on display
    for (let fi = 0; fi < 4; fi++) {
      const fx = sx + 12 + fi * ((stall.w - 20) / 4);
      ctx.fillStyle = '#886644';
      ctx.beginPath();
      ctx.arc(fx, baseY - 57, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#aa8855';
      ctx.beginPath();
      ctx.arc(fx, baseY - 58, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Canopy with wave
    const canopyWave = Math.sin(tick * 0.02 + stall.x * 0.01) * 3;
    ctx.fillStyle = stall.color;
    ctx.beginPath();
    ctx.moveTo(sx - 12, baseY - stall.h);
    ctx.quadraticCurveTo(sx + stall.w * 0.5, baseY - stall.h - 12 + canopyWave, sx + stall.w + 12, baseY - stall.h);
    ctx.lineTo(sx + stall.w + 12, baseY - stall.h + 10);
    ctx.quadraticCurveTo(sx + stall.w * 0.5, baseY - stall.h - 2 + canopyWave, sx - 12, baseY - stall.h + 10);
    ctx.closePath();
    ctx.fill();

    // Canopy stripes
    ctx.fillStyle = shiftC(stall.color, 30);
    for (let stripe = sx - 8; stripe < sx + stall.w + 8; stripe += 14) {
      ctx.fillRect(stripe, baseY - stall.h + 2, 7, 7);
    }

    // Canopy fringe
    ctx.fillStyle = shiftC(stall.color, -20);
    for (let fx = sx - 10; fx < sx + stall.w + 8; fx += 6) {
      ctx.fillRect(fx, baseY - stall.h + 9, 5, 4);
    }

    // Support poles
    ctx.fillStyle = '#3a2515';
    ctx.fillRect(sx - 2, baseY - stall.h - 5, 5, stall.h + 5);
    ctx.fillRect(sx + stall.w - 3, baseY - stall.h - 5, 5, stall.h + 5);

    // Steam from cooking
    for (let si = 0; si < 4; si++) {
      const steamX = sx + 15 + si * 22 + Math.sin(tick * 0.03 + si) * 3;
      const steamY = baseY - 68 - si * 12 - Math.abs(Math.sin(tick * 0.04 + si + stall.x * 0.05)) * 10;
      const steamAlpha = 0.12 - si * 0.02;
      ctx.fillStyle = `rgba(220, 220, 220, ${Math.max(0, steamAlpha)})`;
      ctx.beginPath();
      ctx.ellipse(steamX, steamY, 6 + si * 2, 4 + si, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Warm glow from stall
    const warmGlow = ctx.createRadialGradient(sx + stall.w / 2, baseY - 50, 0, sx + stall.w / 2, baseY - 50, 50);
    warmGlow.addColorStop(0, 'rgba(255, 180, 80, 0.06)');
    warmGlow.addColorStop(1, 'rgba(255, 150, 50, 0)');
    ctx.fillStyle = warmGlow;
    ctx.fillRect(sx - 30, baseY - 100, stall.w + 60, 100);
  }
}

// ===== Hanging lanterns =====

function drawHangingLanterns(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  const px = cameraX * 0.15;

  // String wire across the top
  ctx.strokeStyle = 'rgba(80, 60, 40, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 55);
  ctx.quadraticCurveTo(CANVAS_WIDTH / 2, 50 + Math.sin(tick * 0.01) * 3, CANVAS_WIDTH, 55);
  ctx.stroke();

  for (const lantern of hangingLanterns) {
    const lx = lantern.x - px * 0.3;
    if (lx < -20 || lx > CANVAS_WIDTH + 20) continue;

    const sway = Math.sin(tick * 0.02 + lantern.swayPhase) * 3;
    const drawX = lx + sway;
    const drawY = lantern.y;
    const sz = lantern.size;
    const flicker = 0.7 + Math.sin(tick * 0.06 + lantern.swayPhase) * 0.2;

    // Hanging string
    ctx.strokeStyle = 'rgba(100, 70, 40, 0.4)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(lx, drawY - sz * 2.5);
    ctx.lineTo(drawX, drawY - sz * 0.6);
    ctx.stroke();

    // Lantern glow
    const lanternGlow = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, sz * 5);
    lanternGlow.addColorStop(0, `rgba(255, 120, 40, ${0.15 * flicker})`);
    lanternGlow.addColorStop(0.5, `rgba(255, 80, 20, ${0.05 * flicker})`);
    lanternGlow.addColorStop(1, 'rgba(255, 60, 10, 0)');
    ctx.fillStyle = lanternGlow;
    ctx.fillRect(drawX - sz * 5, drawY - sz * 5, sz * 10, sz * 10);

    // Lantern body
    ctx.fillStyle = lantern.color;
    ctx.beginPath();
    ctx.ellipse(drawX, drawY, sz * 0.8, sz, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner glow
    ctx.fillStyle = `rgba(255, 220, 150, ${0.5 * flicker})`;
    ctx.beginPath();
    ctx.ellipse(drawX, drawY, sz * 0.4, sz * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Top and bottom caps
    ctx.fillStyle = 'rgba(60, 40, 20, 0.7)';
    ctx.fillRect(drawX - sz - 1, drawY - sz - 2, sz * 2 + 2, 3);
    ctx.fillRect(drawX - sz, drawY + sz - 1, sz * 2, 2);

    // Tassel
    ctx.strokeStyle = 'rgba(180, 100, 40, 0.4)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(drawX, drawY + sz);
    ctx.lineTo(drawX, drawY + sz + 4);
    ctx.stroke();
  }
}

// ===== Awnings and overhead structures =====

function drawAwnings(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  const px = cameraX * 0.35;

  // Overhead banner strings
  for (let bi = 0; bi < 3; bi++) {
    const bannerY = 70 + bi * 15;
    const bannerStartX = 100 + bi * 200 - px * 0.2;
    const bannerEndX = bannerStartX + 150;
    const sag = 8 + Math.sin(tick * 0.01 + bi) * 2;

    ctx.strokeStyle = 'rgba(100, 80, 50, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bannerStartX, bannerY);
    ctx.quadraticCurveTo((bannerStartX + bannerEndX) / 2, bannerY + sag, bannerEndX, bannerY);
    ctx.stroke();

    // Hanging fabric strips
    for (let fi = bannerStartX + 10; fi < bannerEndX - 10; fi += 18) {
      const fy = bannerY + sag * Math.sin(((fi - bannerStartX) / (bannerEndX - bannerStartX)) * Math.PI);
      ctx.fillStyle = bi % 2 === 0 ? 'rgba(200, 40, 40, 0.2)' : 'rgba(40, 40, 200, 0.15)';
      ctx.fillRect(fi, fy, 6, 10 + Math.sin(tick * 0.03 + fi * 0.1) * 2);
    }
  }
}

// ===== Layer 4: Ground =====

function drawGround(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  // Wet pavement
  const groundGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y, 0, CANVAS_HEIGHT);
  groundGrad.addColorStop(0, '#252530');
  groundGrad.addColorStop(0.03, '#202028');
  groundGrad.addColorStop(0.1, '#1a1a22');
  groundGrad.addColorStop(0.4, '#151518');
  groundGrad.addColorStop(1, '#101015');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, STAGE_GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - STAGE_GROUND_Y);

  // Wet reflective sheen
  ctx.fillStyle = 'rgba(80, 90, 110, 0.05)';
  ctx.fillRect(0, STAGE_GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - STAGE_GROUND_Y);

  // Cobblestone / tile pattern
  ctx.strokeStyle = 'rgba(50, 50, 60, 0.12)';
  ctx.lineWidth = 0.5;
  for (let gy = STAGE_GROUND_Y + 6; gy < CANVAS_HEIGHT; gy += 10) {
    const offset = (Math.floor(gy / 10) % 2) * 15;
    for (let gx = offset; gx < CANVAS_WIDTH; gx += 30) {
      ctx.strokeRect(gx, gy, 28, 8);
    }
  }

  // Curb edge
  ctx.fillStyle = 'rgba(60, 55, 50, 0.4)';
  ctx.fillRect(0, STAGE_GROUND_Y - 2, CANVAS_WIDTH, 4);

  // Yellow safety strip at edge
  ctx.fillStyle = 'rgba(180, 160, 60, 0.15)';
  ctx.fillRect(0, STAGE_GROUND_Y - 1, CANVAS_WIDTH, 2);

  // KOF2002 perspective floor grid for depth
  drawPerspectiveFloorGrid(ctx, cameraX, 'rgba(102, 102, 102, 0.1)');

  // Puddle base shapes
  for (const puddle of puddles) {
    const puddleGrad = ctx.createRadialGradient(puddle.x, STAGE_GROUND_Y + puddle.depth, 0, puddle.x, STAGE_GROUND_Y + puddle.depth, puddle.w * 0.6);
    puddleGrad.addColorStop(0, 'rgba(60, 70, 100, 0.12)');
    puddleGrad.addColorStop(0.7, 'rgba(50, 60, 90, 0.06)');
    puddleGrad.addColorStop(1, 'rgba(40, 50, 80, 0)');
    ctx.fillStyle = puddleGrad;
    ctx.beginPath();
    ctx.ellipse(puddle.x, STAGE_GROUND_Y + puddle.depth, puddle.w * 0.5, puddle.depth + 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ===== Rain =====

function drawRain(ctx: CanvasRenderingContext2D, tick: number): void {
  ctx.save();
  for (const drop of rainDrops) {
    drop.y += drop.speed;
    drop.x -= 1.5; // slight wind

    if (drop.y > CANVAS_HEIGHT + 10) {
      drop.y = -drop.length;
      drop.x = Math.random() * (CANVAS_WIDTH + 100);
    }
    if (drop.x < -10) {
      drop.x = CANVAS_WIDTH + 10;
    }

    ctx.strokeStyle = `rgba(180, 200, 230, ${drop.alpha})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(drop.x, drop.y);
    ctx.lineTo(drop.x - 1.5, drop.y + drop.length);
    ctx.stroke();
  }

  // Rain splash on ground
  for (let i = 0; i < 8; i++) {
    const splashTick = tick + i * 7;
    const splashPhase = splashTick % 20;
    if (splashPhase < 6) {
      const sx = (i * 103 + splashTick * 0.5) % CANVAS_WIDTH;
      const sy = STAGE_GROUND_Y + 2;
      const splashAlpha = (1 - splashPhase / 6) * 0.15;
      ctx.strokeStyle = `rgba(180, 200, 230, ${splashAlpha})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.ellipse(sx, sy, 3 + splashPhase, 1 + splashPhase * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.restore();
}

// ===== Puddle reflections =====

function drawPuddleReflections(ctx: CanvasRenderingContext2D, tick: number): void {
  for (const puddle of puddles) {
    // Neon color reflections in puddles
    const colors = [
      { r: 255, g: 100, b: 50 },
      { r: 50, g: 200, b: 150 },
      { r: 255, g: 50, b: 100 },
    ];

    for (let ci = 0; ci < colors.length; ci++) {
      const c = colors[ci];
      const rippleX = puddle.x + Math.sin(tick * 0.03 + ci * 2) * puddle.w * 0.2;
      const rippleY = STAGE_GROUND_Y + puddle.depth + 1;
      const rippleAlpha = 0.04 + Math.sin(tick * 0.02 + ci * 1.5) * 0.02;

      ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${rippleAlpha})`;
      ctx.beginPath();
      ctx.ellipse(rippleX, rippleY, 8 + Math.sin(tick * 0.04 + ci) * 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ripple rings from rain
    for (let ri = 0; ri < 2; ri++) {
      const rippleTick = (tick + ri * 11 + puddle.x * 0.5) % 30;
      if (rippleTick < 15) {
        const rx = puddle.x + Math.sin(tick * 0.05 + ri * 3) * puddle.w * 0.3;
        const ry = STAGE_GROUND_Y + puddle.depth + 1;
        const rippleSize = rippleTick * 0.8;
        const rippleAlpha = (1 - rippleTick / 15) * 0.08;
        ctx.strokeStyle = `rgba(200, 210, 230, ${rippleAlpha})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.ellipse(rx, ry, rippleSize, rippleSize * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
}

// ===== Boundaries =====

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

// ===== Utility =====

function shiftC(color: string, amount: number): string {
  const r = Math.max(0, Math.min(255, parseInt(color.slice(1, 3), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(color.slice(3, 5), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(color.slice(5, 7), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// ===== Moving cars in background =====

interface BackgroundCar {
  worldX: number;
  speed: number;
  w: number;
  h: number;
  color: string;
  headlightColor: string;
  direction: number;
  lane: number;
}

const bgCars: BackgroundCar[] = [];
let carsInit = false;

function initCars(): void {
  const carColors = ['#1a2a3a', '#2a1a1a', '#1a1a2a', '#2a2a1a', '#1a2a2a', '#2a1a2a'];
  const headlightColors = ['#ffffcc', '#ffeeaa', '#ffeedd'];
  for (let i = 0; i < 4; i++) {
    bgCars.push({
      worldX: 100 + i * 350 + Math.random() * 100,
      speed: 0.8 + Math.random() * 0.6,
      w: 50 + Math.random() * 25,
      h: 22 + Math.random() * 8,
      color: carColors[i % carColors.length],
      headlightColor: headlightColors[i % headlightColors.length],
      direction: i % 2 === 0 ? 1 : -1,
      lane: i % 2 === 0 ? 0 : 1,
    });
  }
  carsInit = true;
}

function drawMovingCars(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  if (!carsInit) initCars();
  const px = cameraX * 0.12;
  const roadY = STAGE_GROUND_Y - 55;

  // Road surface hint
  ctx.fillStyle = 'rgba(20, 22, 28, 0.4)';
  ctx.fillRect(0, roadY, CANVAS_WIDTH, 40);

  // Road lane markings
  ctx.strokeStyle = 'rgba(200, 200, 100, 0.08)';
  ctx.lineWidth = 1;
  ctx.setLineDash([15, 20]);
  const dashOffset = (tick * 0.5) % 35;
  ctx.lineDashOffset = -dashOffset;
  ctx.beginPath();
  ctx.moveTo(0, roadY + 20);
  ctx.lineTo(CANVAS_WIDTH, roadY + 20);
  ctx.stroke();
  ctx.setLineDash([]);

  for (const car of bgCars) {
    // Move car
    car.worldX += car.speed * car.direction;
    // Wrap
    if (car.direction > 0 && car.worldX > 1200) car.worldX = -100;
    if (car.direction < 0 && car.worldX < -100) car.worldX = 1200;

    const cx = car.worldX - px;
    if (cx < -80 || cx > CANVAS_WIDTH + 80) continue;
    const cy = roadY + 5 + car.lane * 18;

    // Car body
    ctx.fillStyle = car.color;
    ctx.beginPath();
    ctx.moveTo(cx, cy + car.h);
    ctx.lineTo(cx, cy + 5);
    ctx.quadraticCurveTo(cx + 5, cy, cx + car.w * 0.3, cy);
    ctx.lineTo(cx + car.w * 0.7, cy);
    ctx.quadraticCurveTo(cx + car.w - 5, cy, cx + car.w, cy + 5);
    ctx.lineTo(cx + car.w, cy + car.h);
    ctx.closePath();
    ctx.fill();

    // Windshield
    ctx.fillStyle = 'rgba(60, 80, 120, 0.3)';
    const windshieldX = car.direction > 0 ? cx + car.w * 0.55 : cx + car.w * 0.15;
    ctx.fillRect(windshieldX, cy + 2, car.w * 0.28, car.h * 0.5);

    // Headlights
    const headlightX = car.direction > 0 ? cx + car.w : cx;
    ctx.fillStyle = car.headlightColor;
    ctx.beginPath();
    ctx.arc(headlightX, cy + car.h * 0.3, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(headlightX, cy + car.h * 0.7, 2, 0, Math.PI * 2);
    ctx.fill();

    // Headlight beam
    const beamDir = car.direction;
    const beamGrad = ctx.createLinearGradient(headlightX, 0, headlightX + beamDir * 40, 0);
    beamGrad.addColorStop(0, 'rgba(255, 255, 200, 0.06)');
    beamGrad.addColorStop(1, 'rgba(255, 255, 200, 0)');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(headlightX, cy, beamDir * 40, car.h);

    // Tail lights
    const tailX = car.direction > 0 ? cx : cx + car.w;
    ctx.fillStyle = 'rgba(255, 30, 30, 0.6)';
    ctx.beginPath();
    ctx.arc(tailX, cy + car.h * 0.3, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(tailX, cy + car.h * 0.7, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Reflection on wet road
    ctx.fillStyle = `rgba(${parseInt(car.color.slice(1, 3), 16)}, ${parseInt(car.color.slice(3, 5), 16)}, ${parseInt(car.color.slice(5, 7), 16)}, 0.04)`;
    ctx.beginPath();
    ctx.ellipse(cx + car.w / 2, cy + car.h + 8, car.w * 0.6, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ===== Urban details: trash cans, crates, signage =====

function drawUrbanDetails(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  const px = cameraX * 0.45;

  const details = [
    { x: 60, type: 'trashcan' },
    { x: 180, type: 'crate' },
    { x: 420, type: 'trashcan' },
    { x: 580, type: 'hydrant' },
    { x: 720, type: 'crate' },
    { x: 850, type: 'trashcan' },
    { x: 960, type: 'crate' },
  ];

  for (const detail of details) {
    const dx = detail.x - px;
    if (dx < -30 || dx > CANVAS_WIDTH + 30) continue;
    const baseY = STAGE_GROUND_Y;

    if (detail.type === 'trashcan') {
      // Trash can body
      const tcGrad = ctx.createLinearGradient(dx - 8, baseY - 30, dx + 8, baseY);
      tcGrad.addColorStop(0, '#3a3a42');
      tcGrad.addColorStop(0.5, '#454550');
      tcGrad.addColorStop(1, '#353540');
      ctx.fillStyle = tcGrad;
      ctx.beginPath();
      ctx.moveTo(dx - 8, baseY);
      ctx.lineTo(dx - 7, baseY - 28);
      ctx.lineTo(dx + 7, baseY - 28);
      ctx.lineTo(dx + 8, baseY);
      ctx.closePath();
      ctx.fill();

      // Lid
      ctx.fillStyle = '#4a4a55';
      ctx.fillRect(dx - 9, baseY - 32, 18, 4);
      // Lid handle
      ctx.fillStyle = '#555560';
      ctx.fillRect(dx - 3, baseY - 35, 6, 4);

      // Horizontal bands
      ctx.strokeStyle = 'rgba(80, 80, 90, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(dx - 7, baseY - 15);
      ctx.lineTo(dx + 7, baseY - 15);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(dx - 8, baseY - 8);
      ctx.lineTo(dx + 8, baseY - 8);
      ctx.stroke();

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.beginPath();
      ctx.ellipse(dx, baseY, 10, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (detail.type === 'crate') {
      // Wooden crate
      ctx.fillStyle = '#4a3828';
      ctx.fillRect(dx - 12, baseY - 20, 24, 20);

      // Planks
      ctx.strokeStyle = 'rgba(80, 60, 40, 0.3)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(dx - 12, baseY - 10);
      ctx.lineTo(dx + 12, baseY - 10);
      ctx.stroke();

      // Cross brace
      ctx.strokeStyle = 'rgba(100, 70, 40, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(dx - 10, baseY - 18);
      ctx.lineTo(dx + 10, baseY - 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(dx + 10, baseY - 18);
      ctx.lineTo(dx - 10, baseY - 2);
      ctx.stroke();

      // Highlight
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(dx - 12, baseY - 20, 24, 3);

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.ellipse(dx, baseY + 1, 14, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (detail.type === 'hydrant') {
      // Fire hydrant
      ctx.fillStyle = '#882222';
      ctx.fillRect(dx - 4, baseY - 18, 8, 18);

      // Top dome
      ctx.fillStyle = '#993333';
      ctx.beginPath();
      ctx.arc(dx, baseY - 18, 5, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(dx - 5, baseY - 18, 10, 2);

      // Side nozzle
      ctx.fillStyle = '#772222';
      ctx.fillRect(dx + 4, baseY - 12, 5, 4);
      ctx.fillRect(dx - 9, baseY - 12, 5, 4);

      // Highlight
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(dx - 2, baseY - 18, 2, 16);

      // Reflective ring
      ctx.fillStyle = `rgba(255, 255, 200, ${0.15 + Math.sin(tick * 0.05 + detail.x) * 0.1})`;
      ctx.fillRect(dx - 5, baseY - 7, 10, 2);
    }
  }
}
