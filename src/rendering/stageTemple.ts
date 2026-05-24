/**
 * Stage rendering — Japanese temple (日本寺庙) multi-layer parallax background
 * Orchestrates layer rendering from stageTempleLayers.ts
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT, STAGE_GROUND_Y } from '../core/constants.js';
import {
  drawSky,
  drawClouds,
  drawDistantMountains,
  drawTempleBuildings,
  drawGround,
} from './stageTempleLayers.js';
import type { Cloud, Lantern } from './stageTempleLayers.js';

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

// ===== Particle data =====

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

// ===== Static scene data =====

const LANTERNS: Lantern[] = [
  { baseX: 150, baseY: 200, size: 14, swayPhase: 0, color: '#ff6633' },
  { baseX: 400, baseY: 170, size: 16, swayPhase: 1.5, color: '#ff5522' },
  { baseX: 650, baseY: 190, size: 13, swayPhase: 3.0, color: '#ff7744' },
  { baseX: 850, baseY: 180, size: 11, swayPhase: 4.5, color: '#ff6633' },
];

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
  drawClouds(ctx, globalTick, CLOUDS);
  drawDistantMountains(ctx, cameraX);
  drawTempleBuildings(ctx, cameraX, globalTick, LANTERNS, CLOUDS);
  drawGround(ctx, cameraX);
  renderParticles(ctx, globalTick);
  renderStageBoundaries(ctx, cameraX);
}

// ===== Particle update + rendering =====

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

function renderParticles(ctx: CanvasRenderingContext2D, tick: number): void {
  // 樱花花瓣
  updateParticles(cherryBlossoms, tick, STAGE_GROUND_Y);
  for (const p of cherryBlossoms) {
    const alpha = 0.5 + 0.2 * Math.sin(p.life * 0.05);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = alpha;

    ctx.fillStyle = '#ff9eb5';
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffc8d5';
    ctx.beginPath();
    ctx.ellipse(-0.5, -0.5, p.size * 0.4, p.size * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 萤火虫
  updateParticles(fireflies, tick, STAGE_GROUND_Y);
  for (const p of fireflies) {
    const blink = Math.sin(tick * 0.08 + p.life * 0.1) * 0.5 + 0.5;
    const alpha = blink * 0.8;
    if (alpha < 0.15) continue;

    const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6);
    glowGrad.addColorStop(0, `rgba(255, 255, 150, ${alpha * 0.4})`);
    glowGrad.addColorStop(0.3, `rgba(255, 255, 100, ${alpha * 0.15})`);
    glowGrad.addColorStop(1, 'rgba(255, 255, 100, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(p.x - p.size * 6, p.y - p.size * 6, p.size * 12, p.size * 12);

    ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // 地面尘埃
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

function renderStageBoundaries(ctx: CanvasRenderingContext2D, cameraX: number): void {
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
