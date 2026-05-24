/**
 * Stage rendering — Japanese temple (日本寺庙) multi-layer parallax background
 * Enhanced: brighter, visible, atmospheric with rich detail
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT, STAGE_GROUND_Y } from '../core/constants.js';
import { roundRect } from './utils.js';

export interface Star {
  x: number;
  y: number;
  brightness: number;
  speed: number;
}

export function generateStars(count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * 800,
      y: Math.random() * 250,
      brightness: 0.3 + Math.random() * 0.7,
      speed: 0.3 + Math.random() * 0.7,
    });
  }
  return stars;
}

// ===== Particle system =====

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

const cherryBlossoms: Particle[] = [];
const fireflies: Particle[] = [];
const dustMotes: Particle[] = [];
let particlesInitialized = false;

function initParticles(): void {
  for (let i = 0; i < 15; i++) {
    cherryBlossoms.push({
      x: Math.random() * CANVAS_WIDTH * 1.5,
      y: Math.random() * STAGE_GROUND_Y * 0.8,
      vx: -0.3 + Math.random() * 0.6,
      vy: 0.4 + Math.random() * 0.8,
      size: 3 + Math.random() * 3,
      life: Math.random() * 200,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.05,
    });
  }
  for (let i = 0; i < 8; i++) {
    fireflies.push({
      x: 80 + Math.random() * (CANVAS_WIDTH - 160),
      y: 150 + Math.random() * 300,
      vx: -0.3 + Math.random() * 0.6,
      vy: -0.2 + Math.random() * 0.4,
      size: 1.5 + Math.random() * 1.5,
      life: Math.random() * 200,
      rotation: 0, rotSpeed: 0,
    });
  }
  for (let i = 0; i < 12; i++) {
    dustMotes.push({
      x: Math.random() * CANVAS_WIDTH,
      y: STAGE_GROUND_Y - 5 - Math.random() * 30,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -0.1 - Math.random() * 0.2,
      size: 1 + Math.random() * 2,
      life: Math.random() * 200,
      rotation: 0, rotSpeed: 0,
    });
  }
  particlesInitialized = true;
}

function updateParticles(particles: Particle[], tick: number, maxY: number): void {
  for (const p of particles) {
    p.x += p.vx + Math.sin(tick * 0.02 + p.y * 0.01) * 0.3;
    p.y += p.vy;
    p.life += 1;
    p.rotation += p.rotSpeed;
    if (p.y > maxY || p.x < -30 || p.x > CANVAS_WIDTH + 30 || p.y < -30) {
      p.x = Math.random() * CANVAS_WIDTH * 1.3;
      p.y = -5;
      p.life = 0;
    }
  }
}

// ===== Lanterns =====

interface Lantern {
  baseX: number;
  baseY: number;
  size: number;
  swayPhase: number;
  color: string;
}

const LANTERNS: Lantern[] = [
  { baseX: 150, baseY: 200, size: 14, swayPhase: 0, color: '#ff6633' },
  { baseX: 400, baseY: 170, size: 16, swayPhase: 1.5, color: '#ff5522' },
  { baseX: 650, baseY: 190, size: 13, swayPhase: 3.0, color: '#ff7744' },
  { baseX: 850, baseY: 180, size: 11, swayPhase: 4.5, color: '#ff6633' },
];

// ===== Cloud layer =====

interface Cloud {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  alpha: number;
}

const CLOUDS: Cloud[] = [
  { x: 100, y: 60, w: 200, h: 40, speed: 0.08, alpha: 0.06 },
  { x: 500, y: 30, w: 250, h: 50, speed: 0.05, alpha: 0.04 },
  { x: 900, y: 80, w: 180, h: 35, speed: 0.07, alpha: 0.05 },
];

// ===== Main draw =====

export function drawTempleStage(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  stars: Star[],
  globalTick: number,
): void {
  if (!particlesInitialized) initParticles();

  drawSky(ctx, stars, globalTick);
  drawClouds(ctx, globalTick);
  drawDistantMountains(ctx, cameraX);
  drawTempleBuildings(ctx, cameraX, globalTick);
  drawGround(ctx, cameraX);
  drawParticles(ctx, globalTick);
  drawStageBoundaries(ctx, cameraX);
}

// ===== Layer 0: Sky =====

function drawSky(ctx: CanvasRenderingContext2D, stars: Star[], globalTick: number): void {
  // Night sky — brighter than before so content is visible
  const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  skyGrad.addColorStop(0, '#0c1029');
  skyGrad.addColorStop(0.25, '#141840');
  skyGrad.addColorStop(0.5, '#1a1e4a');
  skyGrad.addColorStop(0.75, '#1e1540');
  skyGrad.addColorStop(1, '#1a1035');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Subtle nebula glow in center-sky
  const nebulaGrad = ctx.createRadialGradient(CANVAS_WIDTH / 2, 150, 20, CANVAS_WIDTH / 2, 150, 350);
  nebulaGrad.addColorStop(0, 'rgba(80, 50, 120, 0.12)');
  nebulaGrad.addColorStop(0.5, 'rgba(60, 40, 100, 0.06)');
  nebulaGrad.addColorStop(1, 'rgba(40, 30, 80, 0)');
  ctx.fillStyle = nebulaGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, 400);

  // Moon
  drawMoon(ctx, globalTick);

  // Stars — much brighter now
  for (const star of stars) {
    const twinkle = star.brightness * (0.5 + 0.5 * Math.sin(globalTick * 0.03 * star.speed + star.x));
    ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, 0.5 + star.brightness * 0.5, 0, Math.PI * 2);
    ctx.fill();
    // Bright stars get a glow
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

  // Large atmospheric glow
  const outerGlow = ctx.createRadialGradient(mx, my, 5, mx, my, 180);
  outerGlow.addColorStop(0, 'rgba(200, 200, 255, 0.15)');
  outerGlow.addColorStop(0.3, 'rgba(160, 160, 220, 0.08)');
  outerGlow.addColorStop(0.6, 'rgba(120, 120, 200, 0.03)');
  outerGlow.addColorStop(1, 'rgba(100, 80, 150, 0)');
  ctx.fillStyle = outerGlow;
  ctx.fillRect(mx - 180, my - 180, 360, 360);

  // Moon disc — brighter
  const moonGrad = ctx.createRadialGradient(mx - 4, my - 4, 0, mx, my, 25);
  moonGrad.addColorStop(0, 'rgba(240, 240, 255, 0.6)');
  moonGrad.addColorStop(0.5, 'rgba(220, 220, 240, 0.4)');
  moonGrad.addColorStop(0.8, 'rgba(200, 200, 230, 0.2)');
  moonGrad.addColorStop(1, 'rgba(180, 180, 210, 0)');
  ctx.fillStyle = moonGrad;
  ctx.beginPath();
  ctx.arc(mx, my, 25, 0, Math.PI * 2);
  ctx.fill();

  // Moon crater hints
  ctx.fillStyle = 'rgba(180, 180, 200, 0.1)';
  ctx.beginPath(); ctx.arc(mx - 5, my - 3, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(mx + 7, my + 4, 3, 0, Math.PI * 2); ctx.fill();
}

// ===== Clouds =====

function drawClouds(ctx: CanvasRenderingContext2D, tick: number): void {
  for (const cloud of CLOUDS) {
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

function drawDistantMountains(ctx: CanvasRenderingContext2D, cameraX: number): void {
  const px = cameraX * 0.1;

  // 4 mountain layers with visible color differentiation
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
    // Left slope
    ctx.quadraticCurveTo(startX + layer.w * 0.15, baseY - layer.h * 0.7, startX + layer.w * 0.35, baseY - layer.h);
    // Peak
    ctx.quadraticCurveTo(startX + layer.w * 0.5, baseY - layer.h * 1.05, startX + layer.w * 0.65, baseY - layer.h * 0.85);
    // Right slope
    ctx.quadraticCurveTo(startX + layer.w * 0.85, baseY - layer.h * 0.4, startX + layer.w, baseY);
    ctx.closePath();
    ctx.fill();

    // Snow cap hint on tallest peaks
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

  // Mist layer
  const mistGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y - 100, 0, STAGE_GROUND_Y - 15);
  mistGrad.addColorStop(0, 'rgba(30, 25, 55, 0)');
  mistGrad.addColorStop(0.4, 'rgba(40, 35, 65, 0.15)');
  mistGrad.addColorStop(0.8, 'rgba(35, 30, 60, 0.25)');
  mistGrad.addColorStop(1, 'rgba(30, 25, 55, 0)');
  ctx.fillStyle = mistGrad;
  ctx.fillRect(0, STAGE_GROUND_Y - 100, CANVAS_WIDTH, 85);
}

// ===== Layer 2: Temple buildings =====

function drawTempleBuildings(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  const px = cameraX * 0.3;

  // Left temple wing
  drawTempleWing(ctx, 30 - px, STAGE_GROUND_Y, 220, '#2a2040', '#1a1530', '#3a2850');

  // Central pagoda
  drawPagoda(ctx, 280 - px, STAGE_GROUND_Y, '#2a2245', '#1a1535', '#3a2855');

  // Right temple wing
  drawTempleWing(ctx, 520 - px, STAGE_GROUND_Y, 200, '#2a2040', '#1a1530', '#3a2850');

  // Torii gate
  drawTorii(ctx, 720 - px, STAGE_GROUND_Y);

  // Paper lanterns
  for (const lantern of LANTERNS) {
    drawLantern(ctx, lantern.baseX - px * 0.5, lantern.baseY, lantern.size, tick, lantern.swayPhase, lantern.color);
  }
}

function drawTempleWing(
  ctx: CanvasRenderingContext2D, x: number, groundY: number, w: number,
  bodyColor: string, roofColor: string, pillarColor: string,
): void {
  const wallH = 110;
  const roofH = 55;

  // Wall
  const wallGrad = ctx.createLinearGradient(x, groundY - wallH, x + w, groundY);
  wallGrad.addColorStop(0, bodyColor);
  wallGrad.addColorStop(1, shiftHex(bodyColor, -10));
  ctx.fillStyle = wallGrad;
  ctx.fillRect(x, groundY - wallH, w, wallH);

  // Wall texture — subtle horizontal lines
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  for (let ly = groundY - wallH + 10; ly < groundY; ly += 8) {
    ctx.beginPath();
    ctx.moveTo(x, ly);
    ctx.lineTo(x + w, ly);
    ctx.stroke();
  }

  // Window openings — glowing from inside
  const windowW = 18;
  const windowH = 28;
  const windowY = groundY - wallH + 25;
  for (let wx = x + 30; wx < x + w - 30; wx += 55) {
    // Window glow
    const windowGlow = ctx.createRadialGradient(wx + windowW / 2, windowY + windowH / 2, 0, wx + windowW / 2, windowY + windowH / 2, 25);
    windowGlow.addColorStop(0, 'rgba(255, 180, 80, 0.15)');
    windowGlow.addColorStop(1, 'rgba(255, 150, 50, 0)');
    ctx.fillStyle = windowGlow;
    ctx.fillRect(wx - 10, windowY - 10, windowW + 20, windowH + 20);

    // Window frame
    ctx.fillStyle = 'rgba(255, 200, 100, 0.12)';
    roundRect(ctx, wx, windowY, windowW, windowH, 2);
    ctx.fill();
    ctx.strokeStyle = pillarColor;
    ctx.lineWidth = 2;
    roundRect(ctx, wx, windowY, windowW, windowH, 2);
    ctx.stroke();
    // Window divider
    ctx.beginPath();
    ctx.moveTo(wx + windowW / 2, windowY);
    ctx.lineTo(wx + windowW / 2, windowY + windowH);
    ctx.stroke();
  }

  // Roof
  ctx.fillStyle = roofColor;
  ctx.beginPath();
  ctx.moveTo(x - 25, groundY - wallH + 5);
  ctx.quadraticCurveTo(x + w * 0.15, groundY - wallH - roofH, x + w * 0.5, groundY - wallH - roofH * 0.85);
  ctx.quadraticCurveTo(x + w * 0.85, groundY - wallH - roofH, x + w + 25, groundY - wallH + 5);
  ctx.closePath();
  ctx.fill();

  // Roof edge highlight — visible gold line
  ctx.strokeStyle = 'rgba(180, 140, 60, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 25, groundY - wallH + 5);
  ctx.quadraticCurveTo(x + w * 0.15, groundY - wallH - roofH, x + w * 0.5, groundY - wallH - roofH * 0.85);
  ctx.quadraticCurveTo(x + w * 0.85, groundY - wallH - roofH, x + w + 25, groundY - wallH + 5);
  ctx.stroke();

  // Roof end ornaments (chigi)
  ctx.fillStyle = 'rgba(180, 140, 60, 0.3)';
  for (const rx of [x - 25, x + w + 25]) {
    ctx.beginPath();
    ctx.moveTo(rx - 3, groundY - wallH + 5);
    ctx.lineTo(rx, groundY - wallH - 8);
    ctx.lineTo(rx + 3, groundY - wallH + 5);
    ctx.closePath();
    ctx.fill();
  }

  // Pillars
  const pillarCount = 5;
  const spacing = w / (pillarCount + 1);
  ctx.fillStyle = pillarColor;
  for (let i = 1; i <= pillarCount; i++) {
    ctx.fillRect(x + spacing * i - 3, groundY - wallH + 8, 6, wallH - 8);
    // Pillar highlight
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(x + spacing * i - 1, groundY - wallH + 8, 2, wallH - 8);
    ctx.fillStyle = pillarColor;
  }
}

function shiftHex(color: string, amount: number): string {
  const r = Math.max(0, Math.min(255, parseInt(color.slice(1, 3), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(color.slice(3, 5), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(color.slice(5, 7), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
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

    // Tier body
    ctx.fillStyle = bodyColor;
    ctx.fillRect(tx + 6, ty + 18, tierW - 12, tierH - 18);

    // Small windows per tier
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

    // Tier roof
    ctx.fillStyle = roofColor;
    ctx.beginPath();
    ctx.moveTo(tx - roofOverhang, ty + 20);
    ctx.quadraticCurveTo(tx + tierW * 0.15, ty - 12, tx + tierW * 0.5, ty - 6);
    ctx.quadraticCurveTo(tx + tierW * 0.85, ty - 12, tx + tierW + roofOverhang, ty + 20);
    ctx.closePath();
    ctx.fill();

    // Roof edge — gold
    ctx.strokeStyle = 'rgba(180, 140, 60, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tx - roofOverhang, ty + 20);
    ctx.quadraticCurveTo(tx + tierW * 0.15, ty - 12, tx + tierW * 0.5, ty - 6);
    ctx.quadraticCurveTo(tx + tierW * 0.85, ty - 12, tx + tierW + roofOverhang, ty + 20);
    ctx.stroke();

    // Roof end ornaments
    ctx.fillStyle = 'rgba(180, 140, 60, 0.3)';
    for (const rx of [tx - roofOverhang, tx + tierW + roofOverhang]) {
      ctx.beginPath();
      ctx.moveTo(rx - 3, ty + 20);
      ctx.lineTo(rx, ty + 8);
      ctx.lineTo(rx + 3, ty + 20);
      ctx.closePath();
      ctx.fill();
    }

    // Spire on top tier
    if (t === tiers - 1) {
      ctx.strokeStyle = 'rgba(200, 170, 80, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx + tierW / 2, ty - 6);
      ctx.lineTo(tx + tierW / 2, ty - 35);
      ctx.stroke();
      // Ornament ball
      ctx.fillStyle = 'rgba(220, 190, 100, 0.5)';
      ctx.beginPath();
      ctx.arc(tx + tierW / 2, ty - 37, 4, 0, Math.PI * 2);
      ctx.fill();
      // Spire rings
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

  // Central pillar
  ctx.fillStyle = pillarColor;
  ctx.fillRect(x + baseW / 2 - 5, groundY - tiers * tierH, 10, tiers * tierH);
}

function drawTorii(ctx: CanvasRenderingContext2D, x: number, groundY: number): void {
  const h = 140;
  const w = 100;
  const topY = groundY - h;

  // Pillars — bright red vermillion
  ctx.fillStyle = '#8B2020';
  ctx.fillRect(x - w / 2 - 5, topY + 22, 10, h - 22);
  ctx.fillRect(x + w / 2 - 5, topY + 22, 10, h - 22);

  // Pillar highlight
  ctx.fillStyle = 'rgba(255,200,150,0.08)';
  ctx.fillRect(x - w / 2 - 3, topY + 22, 3, h - 22);
  ctx.fillRect(x + w / 2 - 3, topY + 22, 3, h - 22);

  // Top beam (kasagi) — curved, vermillion
  ctx.fillStyle = '#8B2020';
  ctx.beginPath();
  ctx.moveTo(x - w / 2 - 18, topY + 16);
  ctx.quadraticCurveTo(x, topY - 14, x + w / 2 + 18, topY + 16);
  ctx.lineTo(x + w / 2 + 18, topY + 24);
  ctx.quadraticCurveTo(x, topY - 4, x - w / 2 - 18, topY + 24);
  ctx.closePath();
  ctx.fill();

  // Beam highlight
  ctx.strokeStyle = 'rgba(200, 100, 80, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - w / 2 - 18, topY + 16);
  ctx.quadraticCurveTo(x, topY - 14, x + w / 2 + 18, topY + 16);
  ctx.stroke();

  // Lower beam (nuki)
  ctx.fillStyle = '#8B2020';
  ctx.fillRect(x - w / 2 - 8, topY + 38, w + 16, 6);

  // Pillar bases
  for (const px of [x - w / 2, x + w / 2]) {
    ctx.fillStyle = '#555';
    ctx.fillRect(px - 8, groundY - 8, 16, 8);
  }
}

function drawLantern(ctx: CanvasRenderingContext2D, x: number, y: number, size: number,
  tick: number, phase: number, color: string): void {
  const swayX = Math.sin(tick * 0.015 + phase) * 4;
  const lx = x + swayX;

  // String
  ctx.strokeStyle = 'rgba(140, 110, 70, 0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 2.5);
  ctx.lineTo(lx, y - size * 0.5);
  ctx.stroke();

  // Large glow aura
  const glowGrad = ctx.createRadialGradient(lx, y, 0, lx, y, size * 6);
  glowGrad.addColorStop(0, 'rgba(255, 160, 50, 0.2)');
  glowGrad.addColorStop(0.3, 'rgba(255, 120, 30, 0.1)');
  glowGrad.addColorStop(0.6, 'rgba(255, 100, 20, 0.04)');
  glowGrad.addColorStop(1, 'rgba(255, 100, 20, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(lx - size * 6, y - size * 6, size * 12, size * 12);

  // Lantern body
  const flicker = 0.75 + 0.25 * Math.sin(tick * 0.06 + phase * 2);
  const hw = size * 0.9;
  const hh = size * 1.1;

  // Outer shell
  ctx.fillStyle = `rgba(${hexToRgb(color)}, ${0.5 * flicker})`;
  ctx.beginPath();
  ctx.ellipse(lx, y, hw, hh, 0, 0, Math.PI * 2);
  ctx.fill();

  // Inner glow
  ctx.fillStyle = `rgba(255, 230, 160, ${0.6 * flicker})`;
  ctx.beginPath();
  ctx.ellipse(lx, y, hw * 0.6, hh * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bright core
  ctx.fillStyle = `rgba(255, 250, 200, ${0.4 * flicker})`;
  ctx.beginPath();
  ctx.ellipse(lx, y, hw * 0.25, hh * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  // Top cap
  ctx.fillStyle = 'rgba(60, 40, 20, 0.7)';
  ctx.fillRect(lx - hw - 2, y - hh - 2, (hw + 2) * 2, 4);
  // Bottom cap
  ctx.fillRect(lx - hw - 1, y + hh - 2, (hw + 1) * 2, 3);

  // Horizontal ribs
  ctx.strokeStyle = 'rgba(80, 50, 25, 0.4)';
  ctx.lineWidth = 0.5;
  for (const ry of [-hh * 0.3, hh * 0.3]) {
    ctx.beginPath();
    ctx.moveTo(lx - hw, y + ry);
    ctx.lineTo(lx + hw, y + ry);
    ctx.stroke();
  }
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

// ===== Layer 3: Ground =====

function drawGround(ctx: CanvasRenderingContext2D, cameraX: number): void {
  // Wooden floor — warmer, more visible
  const groundGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y, 0, CANVAS_HEIGHT);
  groundGrad.addColorStop(0, '#3a3025');
  groundGrad.addColorStop(0.03, '#352a20');
  groundGrad.addColorStop(0.1, '#2a2218');
  groundGrad.addColorStop(0.4, '#201a12');
  groundGrad.addColorStop(1, '#14100a');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, STAGE_GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - STAGE_GROUND_Y);

  // Wood plank lines — more visible
  ctx.strokeStyle = 'rgba(80, 65, 45, 0.2)';
  ctx.lineWidth = 1;
  for (let fy = STAGE_GROUND_Y + 14; fy < CANVAS_HEIGHT; fy += 16) {
    ctx.beginPath();
    ctx.moveTo(0, fy);
    ctx.lineTo(CANVAS_WIDTH, fy);
    ctx.stroke();
  }

  // Vertical plank separators (scrolling)
  ctx.strokeStyle = 'rgba(60, 50, 35, 0.12)';
  for (let wx = 0; wx < 1600; wx += 110) {
    const sx = wx - cameraX;
    if (sx < -10 || sx > CANVAS_WIDTH + 10) continue;
    ctx.beginPath();
    ctx.moveTo(sx, STAGE_GROUND_Y);
    ctx.lineTo(sx, CANVAS_HEIGHT);
    ctx.stroke();
  }

  // Railing
  drawRailing(ctx, cameraX);

  // Ground top edge glow — more visible blue
  const edgeGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y - 4, 0, STAGE_GROUND_Y + 8);
  edgeGrad.addColorStop(0, 'rgba(100, 140, 255, 0.5)');
  edgeGrad.addColorStop(0.3, 'rgba(80, 120, 255, 0.3)');
  edgeGrad.addColorStop(0.6, 'rgba(80, 120, 255, 0.1)');
  edgeGrad.addColorStop(1, 'rgba(80, 120, 255, 0)');
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, STAGE_GROUND_Y - 4, CANVAS_WIDTH, 12);

  // Light reflection on ground near edge
  const reflGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y, 0, STAGE_GROUND_Y + 25);
  reflGrad.addColorStop(0, 'rgba(100, 140, 255, 0.08)');
  reflGrad.addColorStop(1, 'rgba(80, 120, 255, 0)');
  ctx.fillStyle = reflGrad;
  ctx.fillRect(0, STAGE_GROUND_Y, CANVAS_WIDTH, 25);
}

function drawRailing(ctx: CanvasRenderingContext2D, cameraX: number): void {
  const railY = STAGE_GROUND_Y - 2;
  const postSpacing = 85;

  // Vertical posts — warmer brown, more visible
  for (let wx = 0; wx < 1600; wx += postSpacing) {
    const sx = wx - cameraX;
    if (sx < -10 || sx > CANVAS_WIDTH + 10) continue;

    ctx.fillStyle = '#5a3a20';
    ctx.fillRect(sx - 3, railY - 35, 6, 35);

    // Post cap — slightly lighter
    ctx.fillStyle = '#6a4a30';
    ctx.fillRect(sx - 5, railY - 37, 10, 4);

    // Post highlight
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(sx - 1, railY - 35, 2, 35);
  }

  // Top rail
  ctx.fillStyle = '#5a3a20';
  ctx.fillRect(0, railY - 32, CANVAS_WIDTH, 5);
  // Rail highlight
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(0, railY - 32, CANVAS_WIDTH, 2);

  // Middle rail
  ctx.fillStyle = '#4a3020';
  ctx.fillRect(0, railY - 18, CANVAS_WIDTH, 3);
}

// ===== Particles rendering =====

function drawParticles(ctx: CanvasRenderingContext2D, tick: number): void {
  // Cherry blossoms — more visible, petal-shaped
  updateParticles(cherryBlossoms, tick, STAGE_GROUND_Y);
  for (const p of cherryBlossoms) {
    const alpha = 0.5 + 0.2 * Math.sin(p.life * 0.05);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = alpha;

    // Petal shape — elongated oval
    ctx.fillStyle = '#ff9eb5';
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner highlight
    ctx.fillStyle = '#ffc8d5';
    ctx.beginPath();
    ctx.ellipse(-0.5, -0.5, p.size * 0.4, p.size * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Fireflies — brighter, more magical
  updateParticles(fireflies, tick, STAGE_GROUND_Y);
  for (const p of fireflies) {
    const blink = Math.sin(tick * 0.08 + p.life * 0.1) * 0.5 + 0.5;
    const alpha = blink * 0.8;
    if (alpha < 0.15) continue;

    // Large glow
    const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6);
    glowGrad.addColorStop(0, `rgba(255, 255, 150, ${alpha * 0.4})`);
    glowGrad.addColorStop(0.3, `rgba(255, 255, 100, ${alpha * 0.15})`);
    glowGrad.addColorStop(1, 'rgba(255, 255, 100, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(p.x - p.size * 6, p.y - p.size * 6, p.size * 12, p.size * 12);

    // Core
    ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dust motes near ground
  updateParticles(dustMotes, tick, STAGE_GROUND_Y + 10);
  for (const p of dustMotes) {
    const alpha = 0.15 + 0.1 * Math.sin(p.life * 0.03);
    ctx.fillStyle = `rgba(200, 180, 150, ${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ===== Stage boundaries =====

function drawStageBoundaries(ctx: CanvasRenderingContext2D, cameraX: number): void {
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
