/**
 * Stage rendering — Industrial Factory (工場)
 * Dark industrial setting with machinery, pipes, sparks, smokestacks
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT, STAGE_GROUND_Y } from '../core/constants.js';
import type { Star } from './stage.js';

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

const sparks: Spark[] = [];
let sparkTimer = 0;

export function drawFactoryStage(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  _stars: Star[],
  globalTick: number,
): void {
  drawSky(ctx, globalTick);
  drawSmokestacks(ctx, cameraX, globalTick);
  drawMachinery(ctx, cameraX, globalTick);
  drawPipes(ctx, cameraX);
  drawGround(ctx, cameraX);
  drawSparks(ctx, globalTick);
  drawBoundaries(ctx, cameraX);
}

function drawSky(ctx: CanvasRenderingContext2D, tick: number): void {
  // Dark industrial sky with pollution haze
  const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  skyGrad.addColorStop(0, '#0a0a10');
  skyGrad.addColorStop(0.3, '#151520');
  skyGrad.addColorStop(0.5, '#1a1a28');
  skyGrad.addColorStop(0.7, '#202030');
  skyGrad.addColorStop(1, '#181825');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Pollution haze layer
  const hazeGrad = ctx.createRadialGradient(CANVAS_WIDTH / 2, 200, 50, CANVAS_WIDTH / 2, 200, 500);
  hazeGrad.addColorStop(0, 'rgba(80, 60, 40, 0.1)');
  hazeGrad.addColorStop(0.5, 'rgba(60, 50, 35, 0.05)');
  hazeGrad.addColorStop(1, 'rgba(40, 30, 20, 0)');
  ctx.fillStyle = hazeGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, 400);

  // Occasional lightning flicker
  if (tick % 300 < 3) {
    ctx.fillStyle = `rgba(200, 200, 255, ${0.08 * (1 - tick % 3 / 3)})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // Distant orange glow (furnace)
  const furnaceGrad = ctx.createRadialGradient(900, STAGE_GROUND_Y - 60, 10, 900, STAGE_GROUND_Y - 60, 150);
  furnaceGrad.addColorStop(0, 'rgba(255, 120, 30, 0.15)');
  furnaceGrad.addColorStop(0.5, 'rgba(255, 80, 20, 0.06)');
  furnaceGrad.addColorStop(1, 'rgba(255, 60, 10, 0)');
  ctx.fillStyle = furnaceGrad;
  ctx.fillRect(750, STAGE_GROUND_Y - 210, 300, 300);
}

function drawSmokestacks(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  const px = cameraX * 0.2;

  const stacks = [
    { x: 150, w: 30, h: 280 },
    { x: 350, w: 35, h: 310 },
    { x: 600, w: 28, h: 260 },
    { x: 850, w: 32, h: 290 },
  ];

  for (const stack of stacks) {
    const sx = stack.x - px;
    const baseY = STAGE_GROUND_Y;

    // Stack body
    const stackGrad = ctx.createLinearGradient(sx, baseY - stack.h, sx + stack.w, baseY);
    stackGrad.addColorStop(0, '#2a2a35');
    stackGrad.addColorStop(0.5, '#333340');
    stackGrad.addColorStop(1, '#252530');
    ctx.fillStyle = stackGrad;
    ctx.fillRect(sx, baseY - stack.h, stack.w, stack.h);

    // Stack taper (narrower at top)
    ctx.fillStyle = '#222230';
    ctx.beginPath();
    ctx.moveTo(sx - 2, baseY - stack.h + 30);
    ctx.lineTo(sx + 4, baseY - stack.h);
    ctx.lineTo(sx + stack.w - 4, baseY - stack.h);
    ctx.lineTo(sx + stack.w + 2, baseY - stack.h + 30);
    ctx.closePath();
    ctx.fill();

    // Rim at top
    ctx.fillStyle = '#3a3a48';
    ctx.fillRect(sx - 3, baseY - stack.h - 4, stack.w + 6, 6);

    // Horizontal bands
    ctx.fillStyle = '#444455';
    for (let by = baseY - stack.h + 50; by < baseY; by += 60) {
      ctx.fillRect(sx - 1, by, stack.w + 2, 3);
    }

    // Rust streaks
    ctx.fillStyle = 'rgba(120, 60, 30, 0.15)';
    ctx.fillRect(sx + stack.w * 0.3, baseY - stack.h + 40, 3, stack.h - 50);
    ctx.fillRect(sx + stack.w * 0.7, baseY - stack.h + 80, 2, stack.h - 100);

    // Smoke from top
    for (let si = 0; si < 5; si++) {
      const smokeY = baseY - stack.h - 10 - si * 25;
      const smokeX = sx + stack.w / 2 + Math.sin(tick * 0.01 + si + stack.x * 0.1) * (10 + si * 8);
      const smokeSize = 12 + si * 10;
      const smokeAlpha = Math.max(0, 0.12 - si * 0.02);
      ctx.fillStyle = `rgba(100, 100, 110, ${smokeAlpha})`;
      ctx.beginPath();
      ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawMachinery(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  const px = cameraX * 0.4;

  // Large industrial machines
  const machines = [
    { x: 30, w: 150, h: 90, color: '#2a2a38' },
    { x: 240, w: 120, h: 100, color: '#282838' },
    { x: 420, w: 180, h: 85, color: '#2c2c3a' },
    { x: 660, w: 130, h: 95, color: '#2a2a36' },
    { x: 830, w: 160, h: 80, color: '#2b2b38' },
  ];

  for (const m of machines) {
    const mx = m.x - px;
    const baseY = STAGE_GROUND_Y;

    // Machine body
    ctx.fillStyle = m.color;
    ctx.fillRect(mx, baseY - m.h, m.w, m.h);
    // Top panel
    ctx.fillStyle = '#353545';
    ctx.fillRect(mx, baseY - m.h, m.w, 8);
    // Rivets
    ctx.fillStyle = '#4a4a5a';
    for (let rx = mx + 10; rx < mx + m.w; rx += 20) {
      ctx.beginPath();
      ctx.arc(rx, baseY - m.h + 4, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Warning light (blinking)
    const blinkPhase = Math.sin(tick * 0.1 + m.x * 0.05);
    if (blinkPhase > 0) {
      const lightX = mx + m.w / 2;
      const lightY = baseY - m.h - 8;
      // Light glow
      const lightGlow = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, 15);
      lightGlow.addColorStop(0, `rgba(255, 50, 30, ${blinkPhase * 0.3})`);
      lightGlow.addColorStop(1, 'rgba(255, 30, 20, 0)');
      ctx.fillStyle = lightGlow;
      ctx.fillRect(lightX - 15, lightY - 15, 30, 30);
      // Light body
      ctx.fillStyle = `rgba(255, 80, 40, ${blinkPhase * 0.8})`;
      ctx.beginPath();
      ctx.arc(lightX, lightY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Panel details
    ctx.fillStyle = '#1a1a25';
    ctx.fillRect(mx + 15, baseY - m.h + 15, 25, 20);
    ctx.fillRect(mx + m.w - 40, baseY - m.h + 15, 25, 20);

    // Gauge with animated needle
    const gaugeX = mx + 28;
    const gaugeY = baseY - m.h + 25;
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, 7, 0, Math.PI * 2);
    ctx.stroke();
    const needleAngle = Math.sin(tick * 0.05 + m.x * 0.1) * 0.8 - Math.PI / 2;
    ctx.strokeStyle = '#ff4422';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gaugeX, gaugeY);
    ctx.lineTo(gaugeX + Math.cos(needleAngle) * 5, gaugeY + Math.sin(needleAngle) * 5);
    ctx.stroke();

    // Conveyor belt detail on bottom
    ctx.fillStyle = '#1a1a22';
    ctx.fillRect(mx + 5, baseY - 15, m.w - 10, 15);
    // Belt rollers
    ctx.fillStyle = '#3a3a45';
    for (let bx = mx + 10; bx < mx + m.w - 5; bx += 12) {
      const beltOffset = (tick * 2 + m.x) % 12;
      ctx.beginPath();
      ctx.arc(bx + beltOffset, baseY - 8, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawPipes(ctx: CanvasRenderingContext2D, cameraX: number): void {
  const px = cameraX * 0.3;

  // Horizontal pipes at various heights
  const pipes = [
    { y: STAGE_GROUND_Y - 150, r: 8, color: '#4a3a30' },
    { y: STAGE_GROUND_Y - 130, r: 6, color: '#3a4a40' },
    { y: STAGE_GROUND_Y - 170, r: 10, color: '#4a4030' },
  ];

  for (const pipe of pipes) {
    // Main pipe run
    ctx.fillStyle = pipe.color;
    ctx.fillRect(0, pipe.y - pipe.r, CANVAS_WIDTH, pipe.r * 2);

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(0, pipe.y - pipe.r, CANVAS_WIDTH, pipe.r * 0.5);

    // Joints/flanges
    for (let jx = 80 - (px % 120); jx < CANVAS_WIDTH; jx += 120) {
      ctx.fillStyle = shiftP(pipe.color, 20);
      ctx.fillRect(jx - 3, pipe.y - pipe.r - 2, 6, pipe.r * 2 + 4);
    }

    // Steam leak at a joint
    ctx.fillStyle = 'rgba(180, 180, 190, 0.1)';
    const leakX = 300 - px * 0.5;
    ctx.beginPath();
    ctx.ellipse(leakX, pipe.y - pipe.r - 5, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Vertical pipes
  const vPipes = [
    { x: 200, r: 10, h: 200, color: '#3a3530' },
    { x: 500, r: 8, h: 180, color: '#353a30' },
    { x: 750, r: 12, h: 220, color: '#3a3035' },
  ];

  for (const vp of vPipes) {
    const vx = vp.x - px;
    ctx.fillStyle = vp.color;
    ctx.fillRect(vx - vp.r, STAGE_GROUND_Y - vp.h, vp.r * 2, vp.h);
    // Valve wheel
    ctx.strokeStyle = '#cc3322';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(vx, STAGE_GROUND_Y - vp.h + 40, 8, 0, Math.PI * 2);
    ctx.stroke();
    // Valve spokes
    ctx.beginPath(); ctx.moveTo(vx - 6, STAGE_GROUND_Y - vp.h + 40); ctx.lineTo(vx + 6, STAGE_GROUND_Y - vp.h + 40); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(vx, STAGE_GROUND_Y - vp.h + 34); ctx.lineTo(vx, STAGE_GROUND_Y - vp.h + 46); ctx.stroke();
  }
}

function drawGround(ctx: CanvasRenderingContext2D, cameraX: number): void {
  // Metal floor with grating
  const groundGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y, 0, CANVAS_HEIGHT);
  groundGrad.addColorStop(0, '#2a2a35');
  groundGrad.addColorStop(0.03, '#252530');
  groundGrad.addColorStop(0.15, '#202028');
  groundGrad.addColorStop(1, '#15151e');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, STAGE_GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - STAGE_GROUND_Y);

  // Metal grate pattern
  ctx.strokeStyle = 'rgba(60, 60, 70, 0.2)';
  ctx.lineWidth = 1;
  for (let gy = STAGE_GROUND_Y + 6; gy < CANVAS_HEIGHT; gy += 10) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(CANVAS_WIDTH, gy); ctx.stroke();
  }
  for (let gx = 0; gx < CANVAS_WIDTH; gx += 10) {
    ctx.beginPath(); ctx.moveTo(gx, STAGE_GROUND_Y); ctx.lineTo(gx, CANVAS_HEIGHT); ctx.stroke();
  }

  // Ground edge — industrial yellow safety line
  ctx.fillStyle = 'rgba(200, 180, 50, 0.25)';
  ctx.fillRect(0, STAGE_GROUND_Y - 2, CANVAS_WIDTH, 4);
  // Yellow/black hazard stripes
  for (let hx = 0; hx < CANVAS_WIDTH; hx += 30) {
    ctx.fillStyle = hx % 60 < 30 ? 'rgba(30, 30, 0, 0.2)' : 'rgba(200, 180, 50, 0.15)';
    ctx.fillRect(hx, STAGE_GROUND_Y - 2, 15, 4);
  }

  // Puddles
  const puddles = [150, 400, 650, 900];
  for (const px of puddles) {
    const reflGrad = ctx.createRadialGradient(px, STAGE_GROUND_Y + 5, 0, px, STAGE_GROUND_Y + 5, 25);
    reflGrad.addColorStop(0, 'rgba(80, 100, 130, 0.1)');
    reflGrad.addColorStop(1, 'rgba(60, 80, 110, 0)');
    ctx.fillStyle = reflGrad;
    ctx.beginPath();
    ctx.ellipse(px, STAGE_GROUND_Y + 5, 25, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSparks(ctx: CanvasRenderingContext2D, tick: number): void {
  // Generate new sparks periodically (welding effect)
  sparkTimer++;
  if (sparkTimer % 15 === 0) {
    for (let i = 0; i < 4; i++) {
      sparks.push({
        x: 700 + Math.random() * 60,
        y: STAGE_GROUND_Y - 100 + Math.random() * 40,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 3 - 1,
        life: 15 + Math.floor(Math.random() * 15),
        maxLife: 30,
        size: 1 + Math.random() * 2,
      });
    }
  }

  // Update and draw
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.x += s.vx;
    s.y += s.vy;
    s.vy += 0.15; // gravity
    s.life--;
    if (s.life <= 0) {
      sparks.splice(i, 1);
      continue;
    }
    const alpha = s.life / s.maxLife;
    ctx.fillStyle = `rgba(255, ${180 + Math.random() * 75}, 50, ${alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size * alpha, 0, Math.PI * 2);
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

function shiftP(color: string, amount: number): string {
  const r = Math.max(0, Math.min(255, parseInt(color.slice(1, 3), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(color.slice(3, 5), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(color.slice(5, 7), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
