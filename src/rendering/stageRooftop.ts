/**
 * Stage rendering — Japan Rooftop Night (日本屋上夜战)
 * City skyline at night, neon signs with kanji labels, rooftop fence,
 * wind-blown debris, moon with clouds, distant tower lights,
 * atmospheric haze, shooting stars, searchlight sweep, wet ground reflections
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT, STAGE_GROUND_Y } from '../core/constants.js';
import { roundRect } from './utils.js';
import type { Star } from './stage.js';

// ===== Particle data =====

interface WindDebris {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  life: number;
  type: 'paper' | 'leaf' | 'ribbon';
}

interface NeonSign {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  flickerPhase: number;
  flickerSpeed: number;
  label: string;
}

interface Cloud {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  alpha: number;
}

interface TowerLight {
  x: number;
  y: number;
  blinkPhase: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  brightness: number;
  active: boolean;
}

interface Searchlight {
  angle: number;
  targetAngle: number;
  originX: number;
  originY: number;
}

const debris: WindDebris[] = [];
const neonSigns: NeonSign[] = [];
const clouds: Cloud[] = [];
const towerLights: TowerLight[] = [];
const shootingStars: ShootingStar[] = [];
const searchlight: Searchlight = { angle: -0.3, targetAngle: 0.3, originX: -30, originY: 0 };
let lastShootingStarTick = 0;
let initialized = false;

function init(): void {
  // Wind debris
  for (let i = 0; i < 18; i++) {
    debris.push({
      x: Math.random() * CANVAS_WIDTH * 1.5,
      y: Math.random() * STAGE_GROUND_Y * 0.8,
      vx: 1.5 + Math.random() * 2,
      vy: -0.3 + Math.random() * 0.6,
      size: 2 + Math.random() * 4,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.08,
      life: Math.floor(Math.random() * 200),
      type: (['paper', 'leaf', 'ribbon'] as const)[Math.floor(Math.random() * 3)],
    });
  }

  // Neon signs with kanji labels
  neonSigns.push(
    { x: 80, y: 140, w: 22, h: 28, color: '#ff3366', flickerPhase: 0, flickerSpeed: 0.06, label: '酒' },
    { x: 220, y: 120, w: 18, h: 24, color: '#33ff99', flickerPhase: 1.5, flickerSpeed: 0.04, label: '薬' },
    { x: 380, y: 155, w: 25, h: 30, color: '#ff6633', flickerPhase: 3.0, flickerSpeed: 0.07, label: '格' },
    { x: 520, y: 130, w: 20, h: 26, color: '#3399ff', flickerPhase: 4.5, flickerSpeed: 0.05, label: '電' },
    { x: 660, y: 145, w: 22, h: 28, color: '#ffcc00', flickerPhase: 2.0, flickerSpeed: 0.06, label: '銀' },
  );

  // Moonlit clouds
  clouds.push(
    { x: 100, y: 40, w: 180, h: 35, speed: 0.12, alpha: 0.06 },
    { x: 450, y: 25, w: 220, h: 45, speed: 0.08, alpha: 0.05 },
    { x: 800, y: 55, w: 150, h: 30, speed: 0.10, alpha: 0.04 },
  );

  // Tower blink lights
  for (let i = 0; i < 8; i++) {
    towerLights.push({
      x: 60 + i * 100 + Math.random() * 30,
      y: 60 + Math.random() * 80,
      blinkPhase: Math.random() * Math.PI * 2,
      color: i % 2 === 0 ? '#ff3333' : '#ffffff',
    });
  }

  // Searchlight origin (off-screen building top)
  searchlight.originY = STAGE_GROUND_Y - 260;

  initialized = true;
}

// ===== Main draw =====

export function drawRooftopStage(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  stars: Star[],
  globalTick: number,
): void {
  if (!initialized) init();

  drawSky(ctx, stars, globalTick);
  drawShootingStars(ctx, globalTick);
  drawMoon(ctx, globalTick);
  drawClouds(ctx, globalTick);
  drawCitySkyline(ctx, cameraX, globalTick);
  drawNeonSigns(ctx, globalTick);
  drawTowerLights(ctx, globalTick);
  drawDistantBuildings(ctx, cameraX);
  drawSearchlight(ctx, globalTick);
  drawAtmosphericHaze(ctx, globalTick);
  drawRooftopFence(ctx, cameraX);
  drawGround(ctx, cameraX, globalTick);
  renderWindDebris(ctx, globalTick);
}

// ===== Sky =====

function drawSky(ctx: CanvasRenderingContext2D, stars: Star[], tick: number): void {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, STAGE_GROUND_Y);
  skyGrad.addColorStop(0, '#050520');
  skyGrad.addColorStop(0.3, '#0a0a30');
  skyGrad.addColorStop(0.6, '#101040');
  skyGrad.addColorStop(1, '#181848');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, STAGE_GROUND_Y);

  for (const s of stars) {
    const twinkle = 0.4 + Math.sin(tick * s.speed * 0.1 + s.x) * 0.3;
    ctx.globalAlpha = s.brightness * twinkle;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // City glow on horizon
  const horizonGlow = ctx.createLinearGradient(0, STAGE_GROUND_Y - 120, 0, STAGE_GROUND_Y);
  horizonGlow.addColorStop(0, 'rgba(40, 30, 60, 0)');
  horizonGlow.addColorStop(0.5, 'rgba(50, 35, 70, 0.15)');
  horizonGlow.addColorStop(1, 'rgba(60, 40, 80, 0.25)');
  ctx.fillStyle = horizonGlow;
  ctx.fillRect(0, STAGE_GROUND_Y - 120, CANVAS_WIDTH, 120);
}

// ===== Shooting Stars =====

function drawShootingStars(ctx: CanvasRenderingContext2D, tick: number): void {
  if (tick - lastShootingStarTick > 300 + Math.random() * 300 && shootingStars.length < 3) {
    shootingStars.push({
      x: 100 + Math.random() * (CANVAS_WIDTH - 200),
      y: 10 + Math.random() * 60,
      vx: 4 + Math.random() * 3,
      vy: 1.5 + Math.random() * 1.5,
      life: 0,
      maxLife: 20 + Math.floor(Math.random() * 15),
      brightness: 0.6 + Math.random() * 0.4,
      active: true,
    });
    lastShootingStarTick = tick;
  }

  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const s = shootingStars[i];
    if (!s.active) { shootingStars.splice(i, 1); continue; }

    s.x += s.vx;
    s.y += s.vy;
    s.life++;

    if (s.life >= s.maxLife) { s.active = false; continue; }

    const progress = s.life / s.maxLife;
    const alpha = s.brightness * (progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7);
    if (alpha <= 0) continue;

    const norm = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
    const trailLen = 25;

    ctx.save();
    ctx.globalAlpha = alpha;

    const trailGrad = ctx.createLinearGradient(
      s.x, s.y,
      s.x - (s.vx / norm) * trailLen,
      s.y - (s.vy / norm) * trailLen,
    );
    trailGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    trailGrad.addColorStop(1, 'rgba(200, 220, 255, 0)');
    ctx.strokeStyle = trailGrad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - (s.vx / norm) * trailLen, s.y - (s.vy / norm) * trailLen);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#aaccff';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  }
}

// ===== Moon =====

function drawMoon(ctx: CanvasRenderingContext2D, tick: number): void {
  const moonX = CANVAS_WIDTH * 0.78;
  const moonY = 65;
  const moonR = 28;

  ctx.save();
  for (let layer = 3; layer >= 0; layer--) {
    const r = moonR + layer * 20;
    const alpha = 0.03 - layer * 0.005;
    const moonGlow = ctx.createRadialGradient(moonX, moonY, moonR * 0.5, moonX, moonY, r);
    moonGlow.addColorStop(0, `rgba(220, 230, 255, ${alpha + Math.sin(tick * 0.02) * 0.005})`);
    moonGlow.addColorStop(1, 'rgba(220, 230, 255, 0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const discGrad = ctx.createRadialGradient(moonX - 5, moonY - 5, 2, moonX, moonY, moonR);
  discGrad.addColorStop(0, '#f0f0ff');
  discGrad.addColorStop(0.6, '#dde0f0');
  discGrad.addColorStop(1, '#b8bdd8');
  ctx.fillStyle = discGrad;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.15;
  ctx.fillStyle = '#a0a4c0';
  ctx.beginPath(); ctx.arc(moonX - 8, moonY - 4, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(moonX + 6, moonY + 6, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(moonX + 2, moonY - 10, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ===== Clouds =====

function drawClouds(ctx: CanvasRenderingContext2D, tick: number): void {
  for (const c of clouds) {
    const x = ((c.x + tick * c.speed) % (CANVAS_WIDTH + c.w * 2)) - c.w;
    const alpha = c.alpha + Math.sin(tick * 0.01 + c.y) * 0.01;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(180, 190, 220, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x, c.y, c.w / 2, c.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + c.w * 0.3, c.y - c.h * 0.1, c.w * 0.35, c.h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ===== City Skyline =====

function drawCitySkyline(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  ctx.save();
  const parallax = cameraX * 0.15;

  ctx.fillStyle = '#0c0c22';
  const farBuildings = [
    { x: 20, w: 50, h: 180 }, { x: 80, w: 40, h: 220 }, { x: 130, w: 60, h: 160 },
    { x: 200, w: 35, h: 250 }, { x: 250, w: 55, h: 190 }, { x: 320, w: 45, h: 230 },
    { x: 380, w: 65, h: 170 }, { x: 460, w: 40, h: 260 }, { x: 520, w: 50, h: 200 },
    { x: 580, w: 55, h: 240 }, { x: 650, w: 45, h: 180 }, { x: 710, w: 60, h: 210 },
  ];
  for (const b of farBuildings) {
    const bx = b.x - parallax * 0.5;
    ctx.fillRect(bx, STAGE_GROUND_Y - b.h, b.w, b.h);
  }

  ctx.fillStyle = '#111130';
  const midBuildings = [
    { x: 50, w: 60, h: 140 }, { x: 120, w: 45, h: 180 }, { x: 180, w: 70, h: 130 },
    { x: 270, w: 50, h: 190 }, { x: 340, w: 55, h: 150 }, { x: 410, w: 65, h: 170 },
    { x: 490, w: 45, h: 200 }, { x: 560, w: 60, h: 140 }, { x: 640, w: 50, h: 180 },
    { x: 720, w: 55, h: 160 },
  ];
  for (const b of midBuildings) {
    const bx = b.x - parallax;
    ctx.fillRect(bx, STAGE_GROUND_Y - b.h, b.w, b.h);
    ctx.fillStyle = 'rgba(255, 230, 150, 0.25)';
    for (let wy = STAGE_GROUND_Y - b.h + 12; wy < STAGE_GROUND_Y - 15; wy += 18) {
      for (let wx = bx + 6; wx < bx + b.w - 6; wx += 12) {
        const lit = Math.sin(tick * 0.01 + wx * 0.3 + wy * 0.2) > 0.2;
        if (lit) {
          ctx.fillRect(wx, wy, 5, 7);
        }
      }
    }
    ctx.fillStyle = '#111130';
  }

  ctx.restore();
}

// ===== Neon Signs =====

function drawNeonSigns(ctx: CanvasRenderingContext2D, tick: number): void {
  for (const n of neonSigns) {
    const flicker = Math.sin(tick * n.flickerSpeed + n.flickerPhase);
    const on = flicker > -0.8;
    if (!on) continue;

    const alpha = 0.4 + flicker * 0.2;
    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.fillStyle = '#0a0a1a';
    roundRect(ctx, n.x, n.y, n.w, n.h, 3);
    ctx.fill();

    ctx.strokeStyle = n.color;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = n.color;
    ctx.shadowBlur = 8;
    roundRect(ctx, n.x, n.y, n.w, n.h, 3);
    ctx.stroke();

    // Kanji label inside sign
    ctx.shadowBlur = 4;
    ctx.shadowColor = n.color;
    ctx.fillStyle = n.color;
    ctx.font = `bold ${Math.min(n.h - 6, 14)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(n.label, n.x + n.w / 2, n.y + n.h / 2);

    // Inner glow
    ctx.shadowBlur = 0;
    const glowGrad = ctx.createRadialGradient(
      n.x + n.w / 2, n.y + n.h / 2, 0,
      n.x + n.w / 2, n.y + n.h / 2, n.w,
    );
    glowGrad.addColorStop(0, n.color + '15');
    glowGrad.addColorStop(1, n.color + '00');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(n.x - n.w / 2, n.y - n.h / 2, n.w * 2, n.h * 2);

    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

// ===== Tower Lights =====

function drawTowerLights(ctx: CanvasRenderingContext2D, tick: number): void {
  for (const t of towerLights) {
    const blink = Math.sin(tick * 0.08 + t.blinkPhase);
    if (blink < 0.3) continue;

    const alpha = (blink - 0.3) * 0.7;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = t.color;
    ctx.beginPath();
    ctx.arc(t.x, t.y, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha * 0.3;
    ctx.beginPath();
    ctx.arc(t.x, t.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ===== Distant Buildings (near layer) =====

function drawDistantBuildings(ctx: CanvasRenderingContext2D, cameraX: number): void {
  const parallax = cameraX * 0.35;
  ctx.fillStyle = '#161640';

  const buildings = [
    { x: 30, w: 80, h: 110 }, { x: 130, w: 60, h: 140 }, { x: 210, w: 90, h: 100 },
    { x: 330, w: 70, h: 130 }, { x: 420, w: 85, h: 105 }, { x: 530, w: 65, h: 135 },
    { x: 620, w: 80, h: 115 }, { x: 730, w: 70, h: 125 },
  ];
  for (const b of buildings) {
    const bx = b.x - parallax;
    ctx.fillRect(bx, STAGE_GROUND_Y - b.h, b.w, b.h);
    if (b.h > 120) {
      ctx.strokeStyle = '#222250';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx + b.w / 2, STAGE_GROUND_Y - b.h);
      ctx.lineTo(bx + b.w / 2, STAGE_GROUND_Y - b.h - 15);
      ctx.stroke();
    }
  }
}

// ===== Searchlight =====

function drawSearchlight(ctx: CanvasRenderingContext2D, tick: number): void {
  const diff = searchlight.targetAngle - searchlight.angle;
  searchlight.angle += diff * 0.009;

  if (Math.abs(diff) < 0.02) {
    searchlight.targetAngle = -0.6 + Math.random() * 1.2;
  }

  const ox = searchlight.originX;
  const oy = searchlight.originY;
  const beamLen = 500;
  const beamWidth = 0.06;

  const endX = ox + Math.cos(searchlight.angle) * beamLen;
  const endY = oy + Math.sin(searchlight.angle) * beamLen;
  const perpX = -Math.sin(searchlight.angle) * beamLen * beamWidth;
  const perpY = Math.cos(searchlight.angle) * beamLen * beamWidth;

  ctx.save();
  ctx.globalAlpha = 0.04 + Math.sin(tick * 0.03) * 0.01;

  const beamGrad = ctx.createLinearGradient(ox, oy, endX, endY);
  beamGrad.addColorStop(0, 'rgba(255, 255, 220, 0.5)');
  beamGrad.addColorStop(0.5, 'rgba(255, 255, 200, 0.15)');
  beamGrad.addColorStop(1, 'rgba(255, 255, 200, 0)');

  ctx.fillStyle = beamGrad;
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(endX + perpX, endY + perpY);
  ctx.lineTo(endX - perpX, endY - perpY);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 0.15;
  ctx.fillStyle = '#ffffcc';
  ctx.beginPath();
  ctx.arc(ox, oy, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ===== Atmospheric Haze =====

function drawAtmosphericHaze(ctx: CanvasRenderingContext2D, tick: number): void {
  const hazeGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y - 80, 0, STAGE_GROUND_Y);
  hazeGrad.addColorStop(0, 'rgba(30, 25, 50, 0)');
  hazeGrad.addColorStop(0.5, 'rgba(40, 30, 55, 0.08)');
  hazeGrad.addColorStop(1, 'rgba(50, 35, 60, 0.15)');
  ctx.fillStyle = hazeGrad;
  ctx.fillRect(0, STAGE_GROUND_Y - 80, CANVAS_WIDTH, 80);

  for (let i = 0; i < 4; i++) {
    const wispX = ((tick * 0.3 + i * 220) % (CANVAS_WIDTH + 150)) - 75;
    const wispY = STAGE_GROUND_Y - 40 + Math.sin(tick * 0.015 + i * 1.8) * 15;
    const wispAlpha = 0.04 + Math.sin(tick * 0.02 + i) * 0.02;
    const wispGrad = ctx.createRadialGradient(wispX, wispY, 0, wispX, wispY, 80);
    wispGrad.addColorStop(0, `rgba(60, 45, 75, ${wispAlpha})`);
    wispGrad.addColorStop(1, 'rgba(60, 45, 75, 0)');
    ctx.fillStyle = wispGrad;
    ctx.beginPath();
    ctx.ellipse(wispX, wispY, 80, 15, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ===== Rooftop Fence =====

function drawRooftopFence(ctx: CanvasRenderingContext2D, cameraX: number): void {
  const parallax = cameraX * 0.6;
  const fenceY = STAGE_GROUND_Y - 8;

  ctx.save();
  ctx.strokeStyle = '#333355';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(0, fenceY - 30);
  ctx.lineTo(CANVAS_WIDTH, fenceY - 30);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, fenceY - 15);
  ctx.lineTo(CANVAS_WIDTH, fenceY - 15);
  ctx.stroke();

  ctx.lineWidth = 2.5;
  for (let x = 20; x < CANVAS_WIDTH + 20; x += 40) {
    const postX = x - (parallax % 40);
    ctx.beginPath();
    ctx.moveTo(postX, fenceY);
    ctx.lineTo(postX, fenceY - 42);
    ctx.stroke();
    ctx.fillStyle = '#444466';
    ctx.beginPath();
    ctx.arc(postX, fenceY - 42, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ===== Ground =====

function drawGround(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  const groundGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y, 0, CANVAS_HEIGHT);
  groundGrad.addColorStop(0, '#2a2a3a');
  groundGrad.addColorStop(0.1, '#252535');
  groundGrad.addColorStop(0.5, '#1e1e2e');
  groundGrad.addColorStop(1, '#181828');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, STAGE_GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - STAGE_GROUND_Y);

  // Concrete texture lines
  ctx.strokeStyle = 'rgba(60, 60, 80, 0.15)';
  ctx.lineWidth = 0.5;
  const offset = cameraX % 80;
  for (let x = -offset; x < CANVAS_WIDTH + 80; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, STAGE_GROUND_Y);
    ctx.lineTo(x, CANVAS_HEIGHT);
    ctx.stroke();
  }

  // Ground edge highlight
  ctx.strokeStyle = 'rgba(80, 80, 110, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, STAGE_GROUND_Y + 0.5);
  ctx.lineTo(CANVAS_WIDTH, STAGE_GROUND_Y + 0.5);
  ctx.stroke();

  // Puddle reflections — moonlight + neon color shimmer
  const puddles = [120, 300, 500, 680];
  const neonColors = ['#ff3366', '#33ff99', '#ff6633', '#3399ff'];
  for (let i = 0; i < puddles.length; i++) {
    const px = puddles[i];
    const pw = 30 + Math.sin(px) * 10;

    const puddleGrad = ctx.createRadialGradient(px, STAGE_GROUND_Y + 4, 0, px, STAGE_GROUND_Y + 4, pw);
    puddleGrad.addColorStop(0, 'rgba(100, 100, 140, 0.08)');
    puddleGrad.addColorStop(1, 'rgba(100, 100, 140, 0)');
    ctx.fillStyle = puddleGrad;
    ctx.beginPath();
    ctx.ellipse(px, STAGE_GROUND_Y + 4, pw, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neon color reflection shimmer
    const shimmer = 0.03 + Math.sin(tick * 0.04 + i * 2) * 0.015;
    ctx.globalAlpha = shimmer;
    ctx.fillStyle = neonColors[i % neonColors.length];
    ctx.beginPath();
    ctx.ellipse(px + 5, STAGE_GROUND_Y + 3, pw * 0.6, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Wet ground sheen
  const sheenAlpha = 0.02 + Math.sin(tick * 0.01) * 0.005;
  const sheenGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y, 0, STAGE_GROUND_Y + 12);
  sheenGrad.addColorStop(0, `rgba(80, 80, 120, ${sheenAlpha})`);
  sheenGrad.addColorStop(1, 'rgba(80, 80, 120, 0)');
  ctx.fillStyle = sheenGrad;
  ctx.fillRect(0, STAGE_GROUND_Y, CANVAS_WIDTH, 12);
}

// ===== Wind Debris =====

function renderWindDebris(ctx: CanvasRenderingContext2D, tick: number): void {
  for (const d of debris) {
    d.x += d.vx + Math.sin(tick * 0.015 + d.y * 0.01) * 0.5;
    d.y += d.vy + Math.sin(tick * 0.02 + d.x * 0.005) * 0.3;
    d.rotation += d.rotSpeed;
    d.life++;

    if (d.x > CANVAS_WIDTH + 50 || d.y > STAGE_GROUND_Y + 10 || d.y < -20) {
      d.x = -20 - Math.random() * 50;
      d.y = 50 + Math.random() * (STAGE_GROUND_Y - 100);
      d.life = 0;
    }

    const alpha = Math.min(0.6, Math.max(0, 0.5 - d.life * 0.001));
    if (alpha <= 0) continue;

    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.rotate(d.rotation);
    ctx.globalAlpha = alpha;

    if (d.type === 'paper') {
      ctx.fillStyle = '#c8c8d8';
      ctx.fillRect(-d.size / 2, -d.size / 4, d.size, d.size / 2);
    } else if (d.type === 'leaf') {
      ctx.fillStyle = '#3a4a3a';
      ctx.beginPath();
      ctx.ellipse(0, 0, d.size, d.size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = '#888899';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-d.size, 0);
      ctx.quadraticCurveTo(0, -d.size * 0.5, d.size, 0);
      ctx.stroke();
    }

    ctx.restore();
  }
}
