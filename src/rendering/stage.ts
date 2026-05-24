/**
 * Stage rendering — Japanese temple (日本寺庙) multi-layer parallax background
 * 4 parallax layers: sky, distant mountains, temple buildings, ground+railing
 * Dynamic elements: paper lanterns, cherry blossom particles, firefly particles
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT, STAGE_GROUND_Y } from '../core/constants.js';

// ===== Star field (kept for interface compatibility, rendered dimmer) =====

export interface Star {
  x: number;
  y: number;
  brightness: number;
  speed: number;
}

/** Generate a static star field */
export function generateStars(count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * 800,
      y: Math.random() * 300,
      brightness: 0.2 + Math.random() * 0.6,
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
}

// Pre-allocated particle pools (created once, reused)
const cherryBlossoms: Particle[] = [];
const fireflies: Particle[] = [];
let particlesInitialized = false;

function initParticles(): void {
  // Cherry blossoms: 7 particles
  for (let i = 0; i < 7; i++) {
    cherryBlossoms.push({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * STAGE_GROUND_Y,
      vx: -0.2 + Math.random() * 0.4,
      vy: 0.3 + Math.random() * 0.5,
      size: 2 + Math.random() * 2,
      life: Math.random() * 100,
    });
  }
  // Fireflies: 4 particles
  for (let i = 0; i < 4; i++) {
    fireflies.push({
      x: 100 + Math.random() * 600,
      y: 200 + Math.random() * 200,
      vx: -0.3 + Math.random() * 0.6,
      vy: -0.2 + Math.random() * 0.4,
      size: 1.5 + Math.random() * 1,
      life: Math.random() * 100,
    });
  }
  particlesInitialized = true;
}

function updateParticles(particles: Particle[], tick: number, maxY: number): void {
  for (const p of particles) {
    p.x += p.vx + Math.sin(tick * 0.02 + p.y * 0.01) * 0.3;
    p.y += p.vy;
    p.life += 1;
    if (p.y > maxY || p.x < -20 || p.x > CANVAS_WIDTH + 20) {
      p.x = Math.random() * CANVAS_WIDTH;
      p.y = -5;
      p.life = 0;
    }
  }
}

// ===== Paper lanterns =====

interface Lantern {
  baseX: number;
  baseY: number;
  size: number;
  swayPhase: number;
}

const LANTERNS: Lantern[] = [
  { baseX: 180, baseY: 220, size: 10, swayPhase: 0 },
  { baseX: 420, baseY: 190, size: 12, swayPhase: 1.5 },
  { baseX: 620, baseY: 210, size: 9, swayPhase: 3.0 },
];

// ===== Main draw =====

/** Draw the full stage: sky, mountains, temple, ground, particles, boundaries */
export function drawStage(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  stars: Star[],
  globalTick: number,
): void {
  if (!particlesInitialized) initParticles();

  drawSky(ctx, stars, globalTick);
  drawDistantMountains(ctx, cameraX);
  drawTempleBuildings(ctx, cameraX, globalTick);
  drawGround(ctx, cameraX);
  drawParticles(ctx, globalTick);
  drawStageBoundaries(ctx, cameraX);
}

// ===== Layer 0: Sky gradient (parallax 0x — static) =====

function drawSky(ctx: CanvasRenderingContext2D, stars: Star[], globalTick: number): void {
  // Main sky gradient: deep navy → dark purple
  const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  skyGrad.addColorStop(0, '#0a0a1a');
  skyGrad.addColorStop(0.4, '#0f0e22');
  skyGrad.addColorStop(0.7, '#15102a');
  skyGrad.addColorStop(1, '#1a1030');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Moon glow — upper right
  drawMoon(ctx, globalTick);

  // Dim stars (barely visible through temple atmosphere)
  for (const star of stars) {
    const twinkle = star.brightness * 0.15 * (0.6 + 0.4 * Math.sin(globalTick * 0.02 * star.speed + star.x));
    ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
    ctx.fillRect(star.x, star.y, 1, 1);
  }
}

function drawMoon(ctx: CanvasRenderingContext2D, tick: number): void {
  const mx = 660;
  const my = 80;
  const pulseAlpha = 0.08 + 0.03 * Math.sin(tick * 0.01);

  // Outer glow
  const outerGlow = ctx.createRadialGradient(mx, my, 5, mx, my, 120);
  outerGlow.addColorStop(0, `rgba(200, 200, 255, ${pulseAlpha})`);
  outerGlow.addColorStop(0.3, `rgba(150, 140, 200, ${pulseAlpha * 0.5})`);
  outerGlow.addColorStop(1, 'rgba(100, 80, 150, 0)');
  ctx.fillStyle = outerGlow;
  ctx.fillRect(mx - 120, my - 120, 240, 240);

  // Moon disc
  const moonGrad = ctx.createRadialGradient(mx - 3, my - 3, 0, mx, my, 22);
  moonGrad.addColorStop(0, 'rgba(220, 220, 240, 0.3)');
  moonGrad.addColorStop(0.7, 'rgba(180, 180, 210, 0.15)');
  moonGrad.addColorStop(1, 'rgba(150, 140, 190, 0)');
  ctx.fillStyle = moonGrad;
  ctx.beginPath();
  ctx.arc(mx, my, 22, 0, Math.PI * 2);
  ctx.fill();
}

// ===== Layer 1: Distant mountains (parallax 0.1x) =====

function drawDistantMountains(ctx: CanvasRenderingContext2D, cameraX: number): void {
  const px = cameraX * 0.1;

  // Mountain range — 4 overlapping shapes, dark blue-grey
  const mountainColors = ['#12122a', '#101028', '#0e0e25', '#0c0c22'];
  const mountainHeights = [160, 130, 180, 140];
  const mountainOffsets = [0, 200, 450, 650];

  for (let m = 0; m < 4; m++) {
    ctx.fillStyle = mountainColors[m];
    ctx.beginPath();
    const baseY = STAGE_GROUND_Y - 40;
    const peakH = mountainHeights[m];
    const startX = mountainOffsets[m] - px;
    const width = 350;

    ctx.moveTo(startX - 50, baseY);
    // Left slope
    ctx.quadraticCurveTo(startX + width * 0.3, baseY - peakH, startX + width * 0.5, baseY - peakH * 0.9);
    // Right slope
    ctx.quadraticCurveTo(startX + width * 0.7, baseY - peakH * 0.5, startX + width + 50, baseY);
    ctx.closePath();
    ctx.fill();
  }

  // Mist layer at mountain base
  const mistGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y - 80, 0, STAGE_GROUND_Y - 20);
  mistGrad.addColorStop(0, 'rgba(20, 18, 40, 0)');
  mistGrad.addColorStop(0.6, 'rgba(25, 20, 45, 0.3)');
  mistGrad.addColorStop(1, 'rgba(20, 18, 40, 0)');
  ctx.fillStyle = mistGrad;
  ctx.fillRect(0, STAGE_GROUND_Y - 80, CANVAS_WIDTH, 60);
}

// ===== Layer 2: Temple buildings (parallax 0.3x) =====

function drawTempleBuildings(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  const px = cameraX * 0.3;

  // --- Left temple wing ---
  drawTempleWing(ctx, 50 - px, STAGE_GROUND_Y, 200, '#0d0d1e', '#0a0a18');

  // --- Central pagoda ---
  drawPagoda(ctx, 300 - px, STAGE_GROUND_Y, '#0e0e20', '#0b0b1a');

  // --- Right temple wing ---
  drawTempleWing(ctx, 550 - px, STAGE_GROUND_Y, 180, '#0d0d1e', '#0a0a18');

  // --- Torii gate (far right) ---
  drawTorii(ctx, 700 - px, STAGE_GROUND_Y);

  // --- Paper lanterns ---
  for (const lantern of LANTERNS) {
    drawLantern(ctx, lantern.baseX - px * 0.5, lantern.baseY, lantern.size, tick, lantern.swayPhase);
  }
}

function drawTempleWing(
  ctx: CanvasRenderingContext2D, x: number, groundY: number, w: number,
  bodyColor: string, roofColor: string,
): void {
  const wallH = 100;
  const roofH = 50;

  // Wall
  ctx.fillStyle = bodyColor;
  ctx.fillRect(x, groundY - wallH, w, wallH);

  // Roof — curved Japanese style
  ctx.fillStyle = roofColor;
  ctx.beginPath();
  ctx.moveTo(x - 20, groundY - wallH);
  ctx.quadraticCurveTo(x + w * 0.2, groundY - wallH - roofH, x + w * 0.5, groundY - wallH - roofH * 0.85);
  ctx.quadraticCurveTo(x + w * 0.8, groundY - wallH - roofH, x + w + 20, groundY - wallH);
  ctx.closePath();
  ctx.fill();

  // Roof edge highlight
  ctx.strokeStyle = 'rgba(80, 60, 40, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 20, groundY - wallH);
  ctx.quadraticCurveTo(x + w * 0.2, groundY - wallH - roofH, x + w * 0.5, groundY - wallH - roofH * 0.85);
  ctx.quadraticCurveTo(x + w * 0.8, groundY - wallH - roofH, x + w + 20, groundY - wallH);
  ctx.stroke();

  // Pillars
  const pillarCount = 4;
  const spacing = w / (pillarCount + 1);
  ctx.fillStyle = 'rgba(40, 30, 25, 0.5)';
  for (let i = 1; i <= pillarCount; i++) {
    ctx.fillRect(x + spacing * i - 3, groundY - wallH + 5, 6, wallH - 5);
  }
}

function drawPagoda(ctx: CanvasRenderingContext2D, x: number, groundY: number,
  bodyColor: string, roofColor: string): void {
  // 3-tier pagoda
  const tiers = 3;
  const baseW = 160;
  const tierH = 50;
  const roofOverhang = 25;

  for (let t = 0; t < tiers; t++) {
    const tierW = baseW - t * 30;
    const ty = groundY - (t + 1) * tierH;
    const tx = x + (baseW - tierW) / 2;

    // Tier body
    ctx.fillStyle = bodyColor;
    ctx.fillRect(tx + 5, ty + 15, tierW - 10, tierH - 15);

    // Tier roof
    ctx.fillStyle = roofColor;
    ctx.beginPath();
    ctx.moveTo(tx - roofOverhang, ty + 18);
    ctx.quadraticCurveTo(tx + tierW * 0.15, ty - 10, tx + tierW * 0.5, ty - 5);
    ctx.quadraticCurveTo(tx + tierW * 0.85, ty - 10, tx + tierW + roofOverhang, ty + 18);
    ctx.closePath();
    ctx.fill();

    // Roof edge
    ctx.strokeStyle = 'rgba(90, 70, 50, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tx - roofOverhang, ty + 18);
    ctx.quadraticCurveTo(tx + tierW * 0.15, ty - 10, tx + tierW * 0.5, ty - 5);
    ctx.quadraticCurveTo(tx + tierW * 0.85, ty - 10, tx + tierW + roofOverhang, ty + 18);
    ctx.stroke();

    // Spire ornament on top tier
    if (t === tiers - 1) {
      ctx.strokeStyle = 'rgba(150, 130, 80, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx + tierW / 2, ty - 5);
      ctx.lineTo(tx + tierW / 2, ty - 30);
      ctx.stroke();
      // Ornament tip
      ctx.fillStyle = 'rgba(200, 180, 100, 0.3)';
      ctx.beginPath();
      ctx.arc(tx + tierW / 2, ty - 32, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Central pillar (visible through openings)
  ctx.fillStyle = 'rgba(35, 25, 20, 0.4)';
  ctx.fillRect(x + baseW / 2 - 4, groundY - tiers * tierH, 8, tiers * tierH);
}

function drawTorii(ctx: CanvasRenderingContext2D, x: number, groundY: number): void {
  const h = 130;
  const w = 90;
  const topY = groundY - h;

  // Pillars
  ctx.fillStyle = 'rgba(60, 20, 15, 0.5)';
  ctx.fillRect(x - w / 2 - 4, topY + 20, 8, h - 20);
  ctx.fillRect(x + w / 2 - 4, topY + 20, 8, h - 20);

  // Top beam (kasagi) — curved
  ctx.fillStyle = 'rgba(70, 25, 18, 0.5)';
  ctx.beginPath();
  ctx.moveTo(x - w / 2 - 15, topY + 15);
  ctx.quadraticCurveTo(x, topY - 10, x + w / 2 + 15, topY + 15);
  ctx.lineTo(x + w / 2 + 15, topY + 22);
  ctx.quadraticCurveTo(x, topY, x - w / 2 - 15, topY + 22);
  ctx.closePath();
  ctx.fill();

  // Lower beam (nuki)
  ctx.fillRect(x - w / 2 - 5, topY + 35, w + 10, 5);
}

function drawLantern(ctx: CanvasRenderingContext2D, x: number, y: number, size: number,
  tick: number, phase: number): void {
  // Gentle sway
  const swayX = Math.sin(tick * 0.015 + phase) * 3;
  const lx = x + swayX;

  // String
  ctx.strokeStyle = 'rgba(120, 100, 70, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 2);
  ctx.lineTo(lx, y - size * 0.5);
  ctx.stroke();

  // Glow aura
  const glowGrad = ctx.createRadialGradient(lx, y, 0, lx, y, size * 4);
  glowGrad.addColorStop(0, 'rgba(255, 160, 50, 0.12)');
  glowGrad.addColorStop(0.5, 'rgba(255, 120, 30, 0.05)');
  glowGrad.addColorStop(1, 'rgba(255, 100, 20, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(lx - size * 4, y - size * 4, size * 8, size * 8);

  // Lantern body (rounded rectangle)
  const flicker = 0.7 + 0.3 * Math.sin(tick * 0.05 + phase * 2);
  ctx.fillStyle = `rgba(255, 140, 40, ${0.6 * flicker})`;
  ctx.beginPath();
  const hw = size * 0.8;
  const hh = size;
  ctx.ellipse(lx, y, hw, hh, 0, 0, Math.PI * 2);
  ctx.fill();

  // Inner bright core
  ctx.fillStyle = `rgba(255, 220, 150, ${0.5 * flicker})`;
  ctx.beginPath();
  ctx.ellipse(lx, y, hw * 0.5, hh * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Top cap
  ctx.fillStyle = 'rgba(60, 40, 20, 0.6)';
  ctx.fillRect(lx - hw - 2, y - hh - 2, (hw + 2) * 2, 4);
}

// ===== Layer 3: Ground + railing (parallax 1x) =====

function drawGround(ctx: CanvasRenderingContext2D, cameraX: number): void {
  // Wooden floor gradient
  const groundGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y, 0, CANVAS_HEIGHT);
  groundGrad.addColorStop(0, '#2a2520');
  groundGrad.addColorStop(0.03, '#252018');
  groundGrad.addColorStop(0.15, '#1e1a14');
  groundGrad.addColorStop(1, '#14120e');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, STAGE_GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - STAGE_GROUND_Y);

  // Wood plank lines
  ctx.strokeStyle = 'rgba(60, 50, 35, 0.15)';
  ctx.lineWidth = 1;
  for (let fy = STAGE_GROUND_Y + 12; fy < CANVAS_HEIGHT; fy += 14) {
    ctx.beginPath();
    ctx.moveTo(0, fy);
    ctx.lineTo(CANVAS_WIDTH, fy);
    ctx.stroke();
  }

  // Vertical plank separators (scrolling with camera)
  ctx.strokeStyle = 'rgba(50, 40, 30, 0.1)';
  for (let wx = 0; wx < 1600; wx += 100) {
    const sx = wx - cameraX;
    if (sx < -10 || sx > CANVAS_WIDTH + 10) continue;
    ctx.beginPath();
    ctx.moveTo(sx, STAGE_GROUND_Y);
    ctx.lineTo(sx, CANVAS_HEIGHT);
    ctx.stroke();
  }

  // Railing
  drawRailing(ctx, cameraX);

  // Ground top edge glow
  const edgeGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y - 3, 0, STAGE_GROUND_Y + 6);
  edgeGrad.addColorStop(0, 'rgba(80, 120, 255, 0.4)');
  edgeGrad.addColorStop(0.5, 'rgba(80, 120, 255, 0.15)');
  edgeGrad.addColorStop(1, 'rgba(80, 120, 255, 0)');
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, STAGE_GROUND_Y - 3, CANVAS_WIDTH, 9);
}

function drawRailing(ctx: CanvasRenderingContext2D, cameraX: number): void {
  const railY = STAGE_GROUND_Y - 2;
  const postSpacing = 80;

  // Vertical posts
  ctx.fillStyle = 'rgba(80, 55, 30, 0.5)';
  for (let wx = 0; wx < 1600; wx += postSpacing) {
    const sx = wx - cameraX;
    if (sx < -10 || sx > CANVAS_WIDTH + 10) continue;
    ctx.fillRect(sx - 2, railY - 30, 4, 30);
    // Post cap
    ctx.fillStyle = 'rgba(100, 70, 35, 0.5)';
    ctx.fillRect(sx - 4, railY - 32, 8, 4);
    ctx.fillStyle = 'rgba(80, 55, 30, 0.5)';
  }

  // Top rail
  ctx.fillStyle = 'rgba(90, 60, 30, 0.45)';
  ctx.fillRect(0, railY - 28, CANVAS_WIDTH, 4);

  // Middle rail
  ctx.fillStyle = 'rgba(75, 50, 25, 0.35)';
  ctx.fillRect(0, railY - 16, CANVAS_WIDTH, 3);
}

// ===== Particles rendering =====

function drawParticles(ctx: CanvasRenderingContext2D, tick: number): void {
  updateParticles(cherryBlossoms, tick, STAGE_GROUND_Y);

  // Cherry blossoms
  for (const p of cherryBlossoms) {
    const alpha = 0.4 + 0.2 * Math.sin(p.life * 0.05);
    ctx.fillStyle = `rgba(255, 180, 200, ${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    // Inner highlight
    ctx.fillStyle = `rgba(255, 220, 230, ${alpha * 0.6})`;
    ctx.beginPath();
    ctx.arc(p.x - 0.5, p.y - 0.5, p.size * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  updateParticles(fireflies, tick, STAGE_GROUND_Y);

  // Fireflies
  for (const p of fireflies) {
    const blink = Math.sin(tick * 0.08 + p.life * 0.1) * 0.5 + 0.5;
    const alpha = blink * 0.7;
    if (alpha < 0.1) continue;

    // Glow
    const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
    glowGrad.addColorStop(0, `rgba(255, 255, 150, ${alpha * 0.3})`);
    glowGrad.addColorStop(1, 'rgba(255, 255, 100, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(p.x - p.size * 4, p.y - p.size * 4, p.size * 8, p.size * 8);

    // Core
    ctx.fillStyle = `rgba(255, 255, 180, ${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ===== Stage boundaries (kept as-is) =====

function drawStageBoundaries(ctx: CanvasRenderingContext2D, cameraX: number): void {
  ctx.strokeStyle = 'rgba(255, 50, 50, 0.2)';
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
