/**
 * Stage rendering — Orochi Shrine (大蛇神社)
 * Dark purple sky, ancient shrine with glowing orbs, broken torii gates,
 * floating purple particles, mist layers, eerie atmosphere
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT, STAGE_GROUND_Y } from '../core/constants.js';
import type { Star } from './stage.js';

// ===== Particle data =====

interface PurpleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  alpha: number;
}

interface MistWisp {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  phase: number;
  alpha: number;
}

const purpleParticles: PurpleParticle[] = [];
const mistWisps: MistWisp[] = [];
const glowingOrbs: { x: number; y: number; size: number; phase: number; speed: number }[] = [];
let initialized = false;

function init(): void {
  // Floating purple energy particles
  for (let i = 0; i < 30; i++) {
    purpleParticles.push({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * STAGE_GROUND_Y,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.2 - Math.random() * 0.6,
      size: 1 + Math.random() * 3,
      life: Math.floor(Math.random() * 120),
      maxLife: 100 + Math.floor(Math.random() * 80),
      alpha: 0.3 + Math.random() * 0.5,
    });
  }

  // Ground mist
  for (let i = 0; i < 8; i++) {
    mistWisps.push({
      x: Math.random() * CANVAS_WIDTH * 2 - CANVAS_WIDTH * 0.5,
      y: STAGE_GROUND_Y - 10 - Math.random() * 40,
      w: 120 + Math.random() * 180,
      h: 20 + Math.random() * 25,
      speed: 0.2 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.06 + Math.random() * 0.08,
    });
  }

  // Glowing shrine orbs
  for (let i = 0; i < 6; i++) {
    glowingOrbs.push({
      x: 80 + Math.random() * (CANVAS_WIDTH - 160),
      y: 120 + Math.random() * 250,
      size: 4 + Math.random() * 6,
      phase: Math.random() * Math.PI * 2,
      speed: 0.02 + Math.random() * 0.03,
    });
  }

  initialized = true;
}

// ===== Main draw =====

export function drawOrochiStage(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  _stars: Star[],
  globalTick: number,
): void {
  if (!initialized) init();

  drawSky(ctx, globalTick);
  drawDarkVortex(ctx, globalTick);
  drawDistantRuins(ctx, cameraX, globalTick);
  drawShrineStructure(ctx, cameraX, globalTick);
  drawBrokenTorii(ctx, cameraX);
  drawEnergyPillars(ctx, cameraX, globalTick);
  drawFloatingDebris(ctx, globalTick);
  drawGlowingOrbs(ctx, globalTick);
  drawLightningFlash(ctx, globalTick);
  drawGround(ctx, cameraX, globalTick);
  drawMist(ctx, globalTick);
  drawPurpleParticles(ctx, globalTick);
  drawBoundaries(ctx, cameraX);
}

// ===== Layer 0: Sky =====

function drawSky(ctx: CanvasRenderingContext2D, tick: number): void {
  // Deep purple-black sky with eerie gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  skyGrad.addColorStop(0, '#08000f');
  skyGrad.addColorStop(0.15, '#120025');
  skyGrad.addColorStop(0.3, '#1a0a38');
  skyGrad.addColorStop(0.5, '#220f45');
  skyGrad.addColorStop(0.7, '#1a0a35');
  skyGrad.addColorStop(0.85, '#150830');
  skyGrad.addColorStop(1, '#100520');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Large nebula-like purple glow in center
  const nebulaX = CANVAS_WIDTH * 0.5;
  const nebulaY = 180;
  const nebulaGrad = ctx.createRadialGradient(nebulaX, nebulaY, 10, nebulaX, nebulaY, 300);
  nebulaGrad.addColorStop(0, 'rgba(120, 30, 160, 0.15)');
  nebulaGrad.addColorStop(0.3, 'rgba(90, 20, 130, 0.1)');
  nebulaGrad.addColorStop(0.6, 'rgba(60, 10, 100, 0.05)');
  nebulaGrad.addColorStop(1, 'rgba(40, 5, 70, 0)');
  ctx.fillStyle = nebulaGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, 450);

  // Secondary green-teal nebula
  const nebula2Grad = ctx.createRadialGradient(200, 120, 5, 200, 120, 200);
  nebula2Grad.addColorStop(0, 'rgba(30, 120, 100, 0.08)');
  nebula2Grad.addColorStop(0.5, 'rgba(20, 80, 70, 0.04)');
  nebula2Grad.addColorStop(1, 'rgba(10, 50, 40, 0)');
  ctx.fillStyle = nebula2Grad;
  ctx.fillRect(0, 0, 400, 350);

  // Pulsating purple energy bands across sky
  for (let i = 0; i < 3; i++) {
    const bandY = 100 + i * 80;
    const pulse = Math.sin(tick * 0.01 + i * 1.5) * 0.02;
    const bandGrad = ctx.createLinearGradient(0, bandY - 15, 0, bandY + 15);
    bandGrad.addColorStop(0, 'rgba(80, 20, 120, 0)');
    bandGrad.addColorStop(0.5, `rgba(80, 20, 120, ${0.04 + pulse})`);
    bandGrad.addColorStop(1, 'rgba(80, 20, 120, 0)');
    ctx.fillStyle = bandGrad;
    ctx.fillRect(0, bandY - 15, CANVAS_WIDTH, 30);
  }

  // Dim stars
  for (let i = 0; i < 40; i++) {
    const sx = (i * 137 + 23) % CANVAS_WIDTH;
    const sy = (i * 89 + 17) % 250;
    const twinkle = 0.15 + 0.15 * Math.sin(tick * 0.02 + i * 2.3);
    ctx.fillStyle = `rgba(180, 150, 220, ${twinkle})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 0.5 + (i % 3) * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ===== Layer 1: Distant ruins =====

function drawDistantRuins(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  const px = cameraX * 0.08;

  // Dead twisted trees silhouettes
  const trees = [
    { x: 50, h: 160 },
    { x: 180, h: 130 },
    { x: 350, h: 180 },
    { x: 550, h: 140 },
    { x: 700, h: 170 },
    { x: 880, h: 150 },
  ];

  for (const tree of trees) {
    const tx = tree.x - px;
    const baseY = STAGE_GROUND_Y - 20;

    ctx.fillStyle = '#0a0515';
    // Trunk
    ctx.beginPath();
    ctx.moveTo(tx - 3, baseY);
    ctx.quadraticCurveTo(tx - 5, baseY - tree.h * 0.5, tx - 2, baseY - tree.h * 0.7);
    ctx.lineTo(tx + 2, baseY - tree.h * 0.7);
    ctx.quadraticCurveTo(tx + 5, baseY - tree.h * 0.5, tx + 3, baseY);
    ctx.closePath();
    ctx.fill();

    // Branches
    for (let b = 0; b < 4; b++) {
      const by = baseY - tree.h * (0.4 + b * 0.15);
      const dir = b % 2 === 0 ? 1 : -1;
      const sway = Math.sin(tick * 0.008 + tree.x + b) * 2;
      ctx.strokeStyle = '#0a0515';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx, by);
      ctx.quadraticCurveTo(tx + dir * 20 + sway, by - 15, tx + dir * 35 + sway, by - 8);
      ctx.stroke();
      // Sub-branch
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tx + dir * 20 + sway, by - 10);
      ctx.lineTo(tx + dir * 28 + sway, by - 20);
      ctx.stroke();
    }
  }

  // Distant mountain ridge (dark silhouettes)
  ctx.fillStyle = '#0d0820';
  ctx.beginPath();
  ctx.moveTo(0, STAGE_GROUND_Y - 30);
  ctx.lineTo(0, STAGE_GROUND_Y - 120);
  ctx.quadraticCurveTo(100, STAGE_GROUND_Y - 180, 200, STAGE_GROUND_Y - 130);
  ctx.quadraticCurveTo(300, STAGE_GROUND_Y - 90, 400, STAGE_GROUND_Y - 160);
  ctx.quadraticCurveTo(500, STAGE_GROUND_Y - 200, 600, STAGE_GROUND_Y - 140);
  ctx.quadraticCurveTo(700, STAGE_GROUND_Y - 100, 800, STAGE_GROUND_Y - 150);
  ctx.lineTo(CANVAS_WIDTH, STAGE_GROUND_Y - 120);
  ctx.lineTo(CANVAS_WIDTH, STAGE_GROUND_Y - 30);
  ctx.closePath();
  ctx.fill();

  // Atmospheric haze between mountains and midground
  const hazeGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y - 120, 0, STAGE_GROUND_Y - 30);
  hazeGrad.addColorStop(0, 'rgba(20, 8, 40, 0)');
  hazeGrad.addColorStop(0.5, 'rgba(30, 12, 50, 0.2)');
  hazeGrad.addColorStop(1, 'rgba(20, 8, 40, 0)');
  ctx.fillStyle = hazeGrad;
  ctx.fillRect(0, STAGE_GROUND_Y - 120, CANVAS_WIDTH, 90);
}

// ===== Layer 2: Shrine structure =====

function drawShrineStructure(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  const px = cameraX * 0.25;

  // Central ancient shrine — weathered stone platform
  const shrineX = 300 - px;
  const baseY = STAGE_GROUND_Y;

  // Stone foundation steps
  for (let s = 0; s < 3; s++) {
    const stepW = 200 - s * 30;
    const stepH = 8;
    const stepX = shrineX + (200 - stepW) / 2;
    const stepY = baseY - s * stepH;
    ctx.fillStyle = `rgba(35, 20, 50, ${0.9 - s * 0.1})`;
    ctx.fillRect(stepX, stepY, stepW, stepH);
    // Stone texture lines
    ctx.strokeStyle = 'rgba(80, 50, 100, 0.15)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(stepX + 3, stepY + 1, stepW - 6, stepH - 2);
  }

  // Main shrine building
  const shrineW = 160;
  const shrineH = 120;
  const shrineTop = baseY - 24 - shrineH;

  // Walls
  const wallGrad = ctx.createLinearGradient(shrineX + 20, shrineTop, shrineX + 20, baseY - 24);
  wallGrad.addColorStop(0, '#221535');
  wallGrad.addColorStop(0.5, '#1a0f2a');
  wallGrad.addColorStop(1, '#150b22');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(shrineX + 20, shrineTop, shrineW, shrineH);

  // Wall cracks
  ctx.strokeStyle = 'rgba(60, 30, 80, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(shrineX + 60, shrineTop + 20);
  ctx.lineTo(shrineX + 65, shrineTop + 50);
  ctx.lineTo(shrineX + 58, shrineTop + 80);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(shrineX + 130, shrineTop + 30);
  ctx.lineTo(shrineX + 125, shrineTop + 60);
  ctx.stroke();

  // Glowing entrance
  const doorX = shrineX + 70;
  const doorY = shrineTop + 40;
  const doorW = 50;
  const doorH = 80;
  // Door glow
  const doorGlow = ctx.createRadialGradient(doorX + doorW / 2, doorY + doorH / 2, 5, doorX + doorW / 2, doorY + doorH / 2, 60);
  doorGlow.addColorStop(0, `rgba(150, 50, 200, ${0.2 + Math.sin(tick * 0.03) * 0.08})`);
  doorGlow.addColorStop(0.5, 'rgba(100, 30, 150, 0.08)');
  doorGlow.addColorStop(1, 'rgba(60, 15, 90, 0)');
  ctx.fillStyle = doorGlow;
  ctx.fillRect(doorX - 40, doorY - 20, doorW + 80, doorH + 40);

  ctx.fillStyle = '#0a0512';
  ctx.fillRect(doorX, doorY, doorW, doorH);
  // Door frame
  ctx.strokeStyle = 'rgba(120, 60, 160, 0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(doorX, doorY, doorW, doorH);
  // Inner glow on door
  ctx.fillStyle = `rgba(130, 40, 180, ${0.15 + Math.sin(tick * 0.025) * 0.05})`;
  ctx.fillRect(doorX + 3, doorY + 3, doorW - 6, doorH - 3);

  // Roof
  ctx.fillStyle = '#1a0e28';
  ctx.beginPath();
  ctx.moveTo(shrineX - 5, shrineTop + 5);
  ctx.quadraticCurveTo(shrineX + shrineW * 0.15, shrineTop - 45, shrineX + shrineW / 2, shrineTop - 38);
  ctx.quadraticCurveTo(shrineX + shrineW * 0.85, shrineTop - 45, shrineX + shrineW + 25, shrineTop + 5);
  ctx.closePath();
  ctx.fill();

  // Roof edge with mystical glow
  ctx.strokeStyle = `rgba(160, 80, 200, ${0.3 + Math.sin(tick * 0.02) * 0.1})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(shrineX - 5, shrineTop + 5);
  ctx.quadraticCurveTo(shrineX + shrineW * 0.15, shrineTop - 45, shrineX + shrineW / 2, shrineTop - 38);
  ctx.quadraticCurveTo(shrineX + shrineW * 0.85, shrineTop - 45, shrineX + shrineW + 25, shrineTop + 5);
  ctx.stroke();

  // Ornamental roof details
  ctx.fillStyle = 'rgba(140, 60, 180, 0.3)';
  for (const rx of [shrineX - 5, shrineX + shrineW + 25]) {
    ctx.beginPath();
    ctx.moveTo(rx - 4, shrineTop + 5);
    ctx.lineTo(rx, shrineTop - 10);
    ctx.lineTo(rx + 4, shrineTop + 5);
    ctx.closePath();
    ctx.fill();
  }

  // Side pillars
  for (const pillarX of [shrineX + 30, shrineX + shrineW - 10]) {
    ctx.fillStyle = '#1a0f25';
    ctx.fillRect(pillarX, shrineTop + 10, 8, shrineH - 10);
    // Pillar glow rune
    const runeAlpha = 0.2 + Math.sin(tick * 0.025 + pillarX * 0.1) * 0.1;
    ctx.fillStyle = `rgba(150, 80, 200, ${runeAlpha})`;
    ctx.fillRect(pillarX + 1, shrineTop + 20, 6, 15);
    ctx.fillRect(pillarX + 1, shrineTop + 50, 6, 15);
    ctx.fillRect(pillarX + 1, shrineTop + 80, 6, 15);
  }

  // Stone lanterns flanking the shrine
  drawStoneLantern(ctx, shrineX - 30, baseY - 24, tick, 0);
  drawStoneLantern(ctx, shrineX + shrineW + 20, baseY - 24, tick, 1.5);

  // Offerings / ritual objects
  ctx.fillStyle = 'rgba(100, 50, 130, 0.3)';
  ctx.fillRect(shrineX + 60, baseY - 28, 12, 4);
  ctx.fillRect(shrineX + 80, baseY - 28, 12, 4);

  // Purple rune circle on ground in front of shrine
  drawRuneCircle(ctx, shrineX + shrineW / 2, baseY - 5, tick);
}

function drawStoneLantern(ctx: CanvasRenderingContext2D, x: number, y: number, tick: number, phase: number): void {
  // Base
  ctx.fillStyle = '#2a1838';
  ctx.fillRect(x - 8, y - 4, 16, 4);

  // Pillar
  ctx.fillStyle = '#221435';
  ctx.fillRect(x - 3, y - 35, 6, 31);

  // Light chamber
  const glowAlpha = 0.4 + Math.sin(tick * 0.03 + phase) * 0.15;
  const chamberGlow = ctx.createRadialGradient(x, y - 40, 0, x, y - 40, 25);
  chamberGlow.addColorStop(0, `rgba(160, 60, 220, ${glowAlpha * 0.6})`);
  chamberGlow.addColorStop(0.4, `rgba(120, 40, 180, ${glowAlpha * 0.2})`);
  chamberGlow.addColorStop(1, 'rgba(80, 20, 130, 0)');
  ctx.fillStyle = chamberGlow;
  ctx.fillRect(x - 25, y - 65, 50, 50);

  ctx.fillStyle = '#1a0e28';
  ctx.fillRect(x - 7, y - 48, 14, 14);
  ctx.fillStyle = `rgba(160, 60, 220, ${glowAlpha})`;
  ctx.fillRect(x - 5, y - 46, 10, 10);

  // Roof
  ctx.fillStyle = '#2a1838';
  ctx.beginPath();
  ctx.moveTo(x - 10, y - 48);
  ctx.lineTo(x, y - 58);
  ctx.lineTo(x + 10, y - 48);
  ctx.closePath();
  ctx.fill();
}

function drawRuneCircle(ctx: CanvasRenderingContext2D, cx: number, cy: number, tick: number): void {
  const runeAlpha = 0.08 + Math.sin(tick * 0.015) * 0.04;
  const radius = 50;

  ctx.save();
  ctx.strokeStyle = `rgba(150, 60, 200, ${runeAlpha})`;
  ctx.lineWidth = 1;

  // Outer circle
  ctx.beginPath();
  ctx.ellipse(cx, cy, radius, radius * 0.25, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Inner circle
  ctx.beginPath();
  ctx.ellipse(cx, cy, radius * 0.6, radius * 0.15, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Rune marks rotating slowly
  const rotation = tick * 0.005;
  for (let i = 0; i < 8; i++) {
    const angle = rotation + (i / 8) * Math.PI * 2;
    const rx = cx + Math.cos(angle) * radius * 0.8;
    const ry = cy + Math.sin(angle) * radius * 0.2;
    ctx.fillStyle = `rgba(150, 60, 200, ${runeAlpha * 1.5})`;
    ctx.beginPath();
    ctx.arc(rx, ry, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ===== Layer 3: Broken torii gates =====

function drawBrokenTorii(ctx: CanvasRenderingContext2D, cameraX: number): void {
  const px = cameraX * 0.3;

  // Left broken torii — leaning
  drawBrokenGate(ctx, 100 - px, STAGE_GROUND_Y, -8, true);
  // Right broken torii — partially collapsed
  drawBrokenGate(ctx, 620 - px, STAGE_GROUND_Y, 5, false);
}

function drawBrokenGate(ctx: CanvasRenderingContext2D, x: number, groundY: number, lean: number, isLeft: boolean): void {
  const h = 150;
  const w = 90;
  const topY = groundY - h;

  ctx.save();
  ctx.translate(x, groundY);
  ctx.rotate((lean * Math.PI) / 180);

  // Left pillar (mostly intact)
  const pillarGrad = ctx.createLinearGradient(-w / 2 - 5, 0, -w / 2 + 5, 0);
  pillarGrad.addColorStop(0, '#2a1020');
  pillarGrad.addColorStop(0.5, '#3a1828');
  pillarGrad.addColorStop(1, '#2a1020');
  ctx.fillStyle = pillarGrad;
  ctx.fillRect(-w / 2 - 5, -h + 20, 10, h - 20);

  // Right pillar (broken, shorter)
  const brokenH = isLeft ? h * 0.7 : h * 0.5;
  ctx.fillRect(w / 2 - 5, -brokenH + 10, 10, brokenH - 10);

  // Top beam (broken on one side)
  ctx.fillStyle = '#3a1828';
  ctx.beginPath();
  ctx.moveTo(-w / 2 - 15, -h + 16);
  ctx.quadraticCurveTo(0, -h - 8, w / 2 + 15, -h + 16);
  ctx.lineTo(w / 2 + 15, -h + 24);
  ctx.quadraticCurveTo(0, -h + 2, -w / 2 - 15, -h + 24);
  ctx.closePath();
  ctx.fill();

  // Fracture marks
  ctx.strokeStyle = 'rgba(80, 30, 50, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 5, -brokenH + 10);
  ctx.lineTo(w / 2 + 2, -brokenH + 15);
  ctx.lineTo(w / 2 - 3, -brokenH + 20);
  ctx.stroke();

  // Mystic glow where the break is
  const breakGlow = ctx.createRadialGradient(w / 2, -brokenH + 10, 0, w / 2, -brokenH + 10, 20);
  breakGlow.addColorStop(0, 'rgba(150, 50, 200, 0.2)');
  breakGlow.addColorStop(1, 'rgba(100, 30, 150, 0)');
  ctx.fillStyle = breakGlow;
  ctx.fillRect(w / 2 - 20, -brokenH - 10, 40, 40);

  // Fallen beam piece on ground
  ctx.fillStyle = '#3a1828';
  ctx.save();
  ctx.translate(isLeft ? 40 : -30, -5);
  ctx.rotate(0.2);
  ctx.fillRect(-25, -4, 50, 8);
  ctx.restore();

  ctx.restore();
}

// ===== Glowing orbs =====

function drawGlowingOrbs(ctx: CanvasRenderingContext2D, tick: number): void {
  for (const orb of glowingOrbs) {
    const floatY = Math.sin(tick * orb.speed + orb.phase) * 15;
    const floatX = Math.cos(tick * orb.speed * 0.7 + orb.phase) * 8;
    const ox = orb.x + floatX;
    const oy = orb.y + floatY;
    const pulse = 0.6 + Math.sin(tick * 0.04 + orb.phase) * 0.3;

    // Outer glow
    const outerGlow = ctx.createRadialGradient(ox, oy, 0, ox, oy, orb.size * 8);
    outerGlow.addColorStop(0, `rgba(140, 50, 200, ${0.15 * pulse})`);
    outerGlow.addColorStop(0.3, `rgba(110, 30, 170, ${0.08 * pulse})`);
    outerGlow.addColorStop(1, 'rgba(80, 20, 130, 0)');
    ctx.fillStyle = outerGlow;
    ctx.fillRect(ox - orb.size * 8, oy - orb.size * 8, orb.size * 16, orb.size * 16);

    // Inner bright core
    const innerGlow = ctx.createRadialGradient(ox, oy, 0, ox, oy, orb.size * 2);
    innerGlow.addColorStop(0, `rgba(220, 180, 255, ${0.6 * pulse})`);
    innerGlow.addColorStop(0.4, `rgba(180, 100, 230, ${0.4 * pulse})`);
    innerGlow.addColorStop(1, 'rgba(140, 50, 200, 0)');
    ctx.fillStyle = innerGlow;
    ctx.beginPath();
    ctx.arc(ox, oy, orb.size * 2, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.fillStyle = `rgba(230, 200, 255, ${0.8 * pulse})`;
    ctx.beginPath();
    ctx.arc(ox, oy, orb.size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ===== Layer 4: Ground =====

function drawGround(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  // Dark stone ground with moss
  const groundGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y, 0, CANVAS_HEIGHT);
  groundGrad.addColorStop(0, '#18102a');
  groundGrad.addColorStop(0.03, '#140c22');
  groundGrad.addColorStop(0.1, '#110a1e');
  groundGrad.addColorStop(0.4, '#0d0818');
  groundGrad.addColorStop(1, '#080510');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, STAGE_GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - STAGE_GROUND_Y);

  // Stone tile pattern
  ctx.strokeStyle = 'rgba(50, 30, 70, 0.15)';
  ctx.lineWidth = 0.5;
  for (let gy = STAGE_GROUND_Y + 8; gy < CANVAS_HEIGHT; gy += 12) {
    const offset = (Math.floor(gy / 12) % 2) * 25;
    for (let gx = offset; gx < CANVAS_WIDTH; gx += 50) {
      ctx.strokeRect(gx, gy, 48, 10);
    }
  }

  // Mossy patches
  const mossPatches = [80, 230, 400, 570, 720];
  for (const mx of mossPatches) {
    const mossGrad = ctx.createRadialGradient(mx, STAGE_GROUND_Y + 3, 0, mx, STAGE_GROUND_Y + 3, 20);
    mossGrad.addColorStop(0, 'rgba(30, 80, 50, 0.12)');
    mossGrad.addColorStop(1, 'rgba(20, 60, 35, 0)');
    ctx.fillStyle = mossGrad;
    ctx.beginPath();
    ctx.ellipse(mx, STAGE_GROUND_Y + 3, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cracks in stone with glowing fissures
  const fissures = [
    { points: [[120, 5], [130, 15], [125, 30], [135, 48], [128, 65]], glow: 0.6 },
    { points: [[500, 3], [510, 12], [505, 25], [515, 38], [508, 50]], glow: 0.5 },
    { points: [[300, 4], [295, 18], [305, 32], [298, 45]], glow: 0.7 },
    { points: [[680, 6], [690, 20], [685, 35], [695, 52], [688, 68]], glow: 0.4 },
  ];
  for (const fissure of fissures) {
    const fissurePulse = fissure.glow * (0.5 + Math.sin(tick * 0.03 + fissure.points[0][0] * 0.1) * 0.3);

    // Glow beneath crack
    for (let fi = 0; fi < fissure.points.length; fi++) {
      const fx = fissure.points[fi][0];
      const fy = STAGE_GROUND_Y + fissure.points[fi][1];
      const fissGlow = ctx.createRadialGradient(fx, fy, 0, fx, fy, 12);
      fissGlow.addColorStop(0, `rgba(160, 60, 220, ${fissurePulse * 0.15})`);
      fissGlow.addColorStop(1, 'rgba(120, 30, 180, 0)');
      ctx.fillStyle = fissGlow;
      ctx.fillRect(fx - 12, fy - 8, 24, 16);
    }

    // Crack line
    ctx.strokeStyle = `rgba(140, 50, 200, ${fissurePulse * 0.4})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(fissure.points[0][0], STAGE_GROUND_Y + fissure.points[0][1]);
    for (let fi = 1; fi < fissure.points.length; fi++) {
      ctx.lineTo(fissure.points[fi][0], STAGE_GROUND_Y + fissure.points[fi][1]);
    }
    ctx.stroke();

    // Inner bright line
    ctx.strokeStyle = `rgba(200, 150, 255, ${fissurePulse * 0.25})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(fissure.points[0][0], STAGE_GROUND_Y + fissure.points[0][1]);
    for (let fi = 1; fi < fissure.points.length; fi++) {
      ctx.lineTo(fissure.points[fi][0], STAGE_GROUND_Y + fissure.points[fi][1]);
    }
    ctx.stroke();
  }

  // Purple energy line at ground edge
  const edgeGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y - 3, 0, STAGE_GROUND_Y + 5);
  edgeGrad.addColorStop(0, 'rgba(120, 50, 180, 0.4)');
  edgeGrad.addColorStop(0.4, 'rgba(100, 40, 160, 0.2)');
  edgeGrad.addColorStop(1, 'rgba(80, 30, 130, 0)');
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, STAGE_GROUND_Y - 3, CANVAS_WIDTH, 8);
}

// ===== Mist =====

function drawMist(ctx: CanvasRenderingContext2D, tick: number): void {
  for (const wisp of mistWisps) {
    const wx = (wisp.x + tick * wisp.speed) % (CANVAS_WIDTH + wisp.w) - wisp.w * 0.5;
    const wy = wisp.y + Math.sin(tick * 0.01 + wisp.phase) * 5;
    const alpha = wisp.alpha + Math.sin(tick * 0.015 + wisp.phase) * 0.02;

    const mistGrad = ctx.createRadialGradient(wx + wisp.w / 2, wy, wisp.w * 0.1, wx + wisp.w / 2, wy, wisp.w * 0.5);
    mistGrad.addColorStop(0, `rgba(80, 40, 120, ${alpha})`);
    mistGrad.addColorStop(0.5, `rgba(60, 30, 90, ${alpha * 0.5})`);
    mistGrad.addColorStop(1, 'rgba(40, 20, 60, 0)');
    ctx.fillStyle = mistGrad;
    ctx.fillRect(wx, wy - wisp.h / 2, wisp.w, wisp.h);
  }
}

// ===== Purple particles =====

function drawPurpleParticles(ctx: CanvasRenderingContext2D, tick: number): void {
  for (const p of purpleParticles) {
    p.x += p.vx + Math.sin(tick * 0.015 + p.y * 0.02) * 0.3;
    p.y += p.vy;
    p.life++;

    if (p.life >= p.maxLife || p.y < -20 || p.x < -20 || p.x > CANVAS_WIDTH + 20) {
      p.x = Math.random() * CANVAS_WIDTH;
      p.y = STAGE_GROUND_Y + 10;
      p.vx = (Math.random() - 0.5) * 0.4;
      p.vy = -0.2 - Math.random() * 0.6;
      p.life = 0;
    }

    const lifeRatio = 1 - p.life / p.maxLife;
    const alpha = p.alpha * lifeRatio * (0.5 + 0.5 * Math.sin(tick * 0.05 + p.x * 0.1));

    // Glow
    const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
    glowGrad.addColorStop(0, `rgba(160, 80, 220, ${alpha * 0.4})`);
    glowGrad.addColorStop(0.5, `rgba(120, 50, 180, ${alpha * 0.1})`);
    glowGrad.addColorStop(1, 'rgba(80, 30, 130, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(p.x - p.size * 4, p.y - p.size * 4, p.size * 8, p.size * 8);

    // Core
    ctx.fillStyle = `rgba(200, 150, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ===== Dark swirling vortex =====

function drawDarkVortex(ctx: CanvasRenderingContext2D, tick: number): void {
  const cx = CANVAS_WIDTH * 0.5;
  const cy = 180;
  const rotation = tick * 0.003;

  // Multiple spiral arms
  for (let arm = 0; arm < 4; arm++) {
    const armAngle = rotation + (arm / 4) * Math.PI * 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(armAngle);

    for (let i = 0; i < 12; i++) {
      const t = i / 12;
      const spiralR = 30 + t * 120;
      const spiralAngle = t * Math.PI * 1.5;
      const sx = Math.cos(spiralAngle) * spiralR;
      const sy = Math.sin(spiralAngle) * spiralR * 0.4; // flatten for perspective
      const pulse = 0.5 + Math.sin(tick * 0.02 + i * 0.5) * 0.3;
      const alpha = (1 - t) * 0.06 * pulse;

      ctx.fillStyle = `rgba(100, 30, 160, ${alpha})`;
      ctx.beginPath();
      ctx.ellipse(sx, sy, 20 - t * 8, 8 - t * 3, spiralAngle * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Center glow
  const centerPulse = 0.5 + Math.sin(tick * 0.025) * 0.3;
  const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50);
  centerGrad.addColorStop(0, `rgba(140, 50, 200, ${0.15 * centerPulse})`);
  centerGrad.addColorStop(0.4, `rgba(100, 30, 160, ${0.08 * centerPulse})`);
  centerGrad.addColorStop(1, 'rgba(80, 20, 130, 0)');
  ctx.fillStyle = centerGrad;
  ctx.fillRect(cx - 50, cy - 50, 100, 100);
}

// ===== Energy pillars pulsing =====

function drawEnergyPillars(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  const px = cameraX * 0.2;
  const pillars = [
    { x: 100, h: 200 },
    { x: 300, h: 240 },
    { x: 550, h: 220 },
    { x: 750, h: 250 },
    { x: 900, h: 210 },
  ];

  for (let pi = 0; pi < pillars.length; pi++) {
    const pillar = pillars[pi];
    const ppx = pillar.x - px;
    if (ppx < -40 || ppx > CANVAS_WIDTH + 40) continue;
    const baseY = STAGE_GROUND_Y;

    // Pillar body — translucent energy column
    const pulse = 0.4 + Math.sin(tick * 0.025 + pi * 1.2) * 0.3;
    const pillarGrad = ctx.createLinearGradient(ppx, baseY - pillar.h, ppx, baseY);
    pillarGrad.addColorStop(0, `rgba(120, 40, 180, ${0.02 * pulse})`);
    pillarGrad.addColorStop(0.2, `rgba(140, 50, 200, ${0.12 * pulse})`);
    pillarGrad.addColorStop(0.5, `rgba(160, 60, 220, ${0.18 * pulse})`);
    pillarGrad.addColorStop(0.8, `rgba(140, 50, 200, ${0.12 * pulse})`);
    pillarGrad.addColorStop(1, `rgba(120, 40, 180, ${0.02 * pulse})`);
    ctx.fillStyle = pillarGrad;
    ctx.fillRect(ppx - 10, baseY - pillar.h, 20, pillar.h);

    // Energy rings traveling up the pillar
    for (let ri = 0; ri < 4; ri++) {
      const ringProgress = ((tick * 0.015 + ri * 0.25 + pi * 0.3) % 1);
      const ringY = baseY - ringProgress * pillar.h;
      const ringAlpha = Math.sin(ringProgress * Math.PI) * 0.3 * pulse;
      ctx.strokeStyle = `rgba(180, 100, 240, ${ringAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(ppx, ringY, 14 + Math.sin(ringProgress * Math.PI * 4) * 3, 4, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Top glow burst
    const topGlow = ctx.createRadialGradient(ppx, baseY - pillar.h, 0, ppx, baseY - pillar.h, 30);
    topGlow.addColorStop(0, `rgba(180, 100, 240, ${0.2 * pulse})`);
    topGlow.addColorStop(0.5, `rgba(140, 60, 200, ${0.08 * pulse})`);
    topGlow.addColorStop(1, 'rgba(120, 40, 180, 0)');
    ctx.fillStyle = topGlow;
    ctx.fillRect(ppx - 30, baseY - pillar.h - 30, 60, 60);

    // Base glow
    const baseGlow = ctx.createRadialGradient(ppx, baseY, 0, ppx, baseY, 25);
    baseGlow.addColorStop(0, `rgba(140, 50, 200, ${0.1 * pulse})`);
    baseGlow.addColorStop(1, 'rgba(120, 40, 180, 0)');
    ctx.fillStyle = baseGlow;
    ctx.fillRect(ppx - 25, baseY - 10, 50, 20);
  }
}

// ===== Floating debris/rocks =====

interface FloatingDebris {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  phase: number;
  floatBase: number;
}

const floatingDebris: FloatingDebris[] = [];
let debrisInit = false;

function initDebris(): void {
  for (let i = 0; i < 12; i++) {
    floatingDebris.push({
      x: Math.random() * CANVAS_WIDTH,
      y: 150 + Math.random() * 250,
      vx: (Math.random() - 0.5) * 0.3,
      vy: 0,
      size: 3 + Math.random() * 8,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      phase: Math.random() * Math.PI * 2,
      floatBase: 150 + Math.random() * 250,
    });
  }
  debrisInit = true;
}

function drawFloatingDebris(ctx: CanvasRenderingContext2D, tick: number): void {
  if (!debrisInit) initDebris();

  for (const d of floatingDebris) {
    d.x += d.vx;
    d.y = d.floatBase + Math.sin(tick * 0.01 + d.phase) * 20;
    d.rotation += d.rotSpeed;

    // Wrap around
    if (d.x < -20) d.x = CANVAS_WIDTH + 20;
    if (d.x > CANVAS_WIDTH + 20) d.x = -20;

    const glowPulse = 0.3 + Math.sin(tick * 0.03 + d.phase) * 0.15;

    // Debris glow
    const dGlow = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.size * 3);
    dGlow.addColorStop(0, `rgba(120, 50, 180, ${glowPulse * 0.15})`);
    dGlow.addColorStop(1, 'rgba(100, 30, 150, 0)');
    ctx.fillStyle = dGlow;
    ctx.fillRect(d.x - d.size * 3, d.y - d.size * 3, d.size * 6, d.size * 6);

    // Rock shape (irregular polygon)
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.rotate(d.rotation);
    ctx.fillStyle = `rgba(40, 25, 55, ${0.5 + glowPulse * 0.3})`;
    ctx.beginPath();
    const sides = 5 + Math.floor(d.size) % 3;
    for (let s = 0; s < sides; s++) {
      const angle = (s / sides) * Math.PI * 2;
      const r = d.size * (0.7 + Math.sin(s * 2.3 + d.phase) * 0.3);
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Edge glow
    ctx.strokeStyle = `rgba(160, 80, 220, ${glowPulse * 0.3})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.restore();
  }
}

// ===== Lightning flash effects =====

let lightningTimer = 0;
let lightningFlash = 0;

function drawLightningFlash(ctx: CanvasRenderingContext2D, tick: number): void {
  lightningTimer++;

  // Random lightning trigger
  if (lightningTimer > 180 + Math.random() * 300) {
    lightningFlash = 8;
    lightningTimer = 0;
  }

  if (lightningFlash > 0) {
    const intensity = lightningFlash / 8;

    // Screen flash
    ctx.fillStyle = `rgba(180, 160, 255, ${0.08 * intensity})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Lightning bolt
    const boltX = CANVAS_WIDTH * 0.3 + Math.random() * CANVAS_WIDTH * 0.4;
    ctx.save();
    ctx.strokeStyle = `rgba(200, 180, 255, ${0.4 * intensity})`;
    ctx.lineWidth = 2 * intensity;
    ctx.shadowColor = `rgba(180, 120, 255, ${intensity})`;
    ctx.shadowBlur = 10 * intensity;
    ctx.beginPath();
    let bx = boltX;
    let by = 0;
    ctx.moveTo(bx, by);
    for (let seg = 0; seg < 8; seg++) {
      bx += (Math.random() - 0.5) * 40;
      by += 30 + Math.random() * 30;
      ctx.lineTo(bx, by);
      // Branch
      if (seg % 3 === 0 && seg > 1) {
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bx, by);
        const branchLen = 20 + Math.random() * 30;
        ctx.lineTo(bx + (Math.random() - 0.5) * branchLen, by + branchLen * 0.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bx, by);
      }
    }
    ctx.stroke();
    ctx.restore();

    lightningFlash--;
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
