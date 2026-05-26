/**
 * Stage rendering — Industrial Factory (工場)
 * Dark industrial setting with machinery, pipes, sparks, smokestacks
 * Enhanced with richer detail, more animated elements, atmospheric effects
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

interface SteamPuff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
}

interface DustMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
}

const sparks: Spark[] = [];
const steamPuffs: SteamPuff[] = [];
const dustMotes: DustMote[] = [];
let sparkTimer = 0;
let initialized = false;

function init(): void {
  // Steam from pipes
  for (let i = 0; i < 8; i++) {
    steamPuffs.push({
      x: 200 + Math.random() * 600,
      y: STAGE_GROUND_Y - 100 - Math.random() * 60,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.4 - Math.random() * 0.4,
      size: 5 + Math.random() * 8,
      life: Math.floor(Math.random() * 60),
      maxLife: 80 + Math.floor(Math.random() * 40),
    });
  }

  // Industrial dust motes
  for (let i = 0; i < 20; i++) {
    dustMotes.push({
      x: Math.random() * CANVAS_WIDTH,
      y: 100 + Math.random() * (STAGE_GROUND_Y - 150),
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.2,
      size: 0.5 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
    });
  }
  initialized = true;
}

export function drawFactoryStage(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  _stars: Star[],
  globalTick: number,
): void {
  if (!initialized) init();

  drawSky(ctx, globalTick);
  drawSmokestacks(ctx, cameraX, globalTick);
  drawCranes(ctx, cameraX, globalTick);
  drawFluorescentLights(ctx, cameraX, globalTick);
  drawMachinery(ctx, cameraX, globalTick);
  drawConveyorBoxes(ctx, cameraX, globalTick);
  drawPipes(ctx, cameraX, globalTick);
  drawWarningLights(ctx, cameraX, globalTick);
  drawGround(ctx, cameraX, globalTick);
  drawSparks(ctx, globalTick);
  drawSteam(ctx, globalTick);
  drawDust(ctx, globalTick);
  drawBoundaries(ctx, cameraX);
}

function drawSky(ctx: CanvasRenderingContext2D, tick: number): void {
  // Dark industrial sky — more atmospheric
  const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  skyGrad.addColorStop(0, '#060608');
  skyGrad.addColorStop(0.15, '#0a0a12');
  skyGrad.addColorStop(0.3, '#101018');
  skyGrad.addColorStop(0.5, '#151520');
  skyGrad.addColorStop(0.65, '#1a1a28');
  skyGrad.addColorStop(0.8, '#202030');
  skyGrad.addColorStop(0.9, '#1a1a25');
  skyGrad.addColorStop(1, '#181820');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Pollution haze — layered
  const hazeGrad1 = ctx.createRadialGradient(CANVAS_WIDTH * 0.3, 250, 30, CANVAS_WIDTH * 0.3, 250, 300);
  hazeGrad1.addColorStop(0, 'rgba(80, 60, 35, 0.12)');
  hazeGrad1.addColorStop(0.5, 'rgba(60, 45, 30, 0.06)');
  hazeGrad1.addColorStop(1, 'rgba(40, 30, 20, 0)');
  ctx.fillStyle = hazeGrad1;
  ctx.fillRect(0, 0, CANVAS_WIDTH, 500);

  const hazeGrad2 = ctx.createRadialGradient(CANVAS_WIDTH * 0.7, 300, 20, CANVAS_WIDTH * 0.7, 300, 250);
  hazeGrad2.addColorStop(0, 'rgba(90, 70, 45, 0.1)');
  hazeGrad2.addColorStop(0.5, 'rgba(70, 50, 30, 0.05)');
  hazeGrad2.addColorStop(1, 'rgba(50, 35, 20, 0)');
  ctx.fillStyle = hazeGrad2;
  ctx.fillRect(0, 0, CANVAS_WIDTH, 500);

  // Occasional lightning flicker — more dramatic
  const lightningCycle = tick % 400;
  if (lightningCycle < 4) {
    const intensity = 1 - lightningCycle / 4;
    ctx.fillStyle = `rgba(180, 190, 255, ${0.1 * intensity})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // Lightning flash on smoke stacks
    ctx.fillStyle = `rgba(200, 210, 255, ${0.15 * intensity})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, 100);
  }

  // Distant orange glow (furnace) — pulsating
  const furnacePulse = 0.12 + Math.sin(tick * 0.03) * 0.03;
  const furnaceGrad = ctx.createRadialGradient(900, STAGE_GROUND_Y - 60, 10, 900, STAGE_GROUND_Y - 60, 180);
  furnaceGrad.addColorStop(0, `rgba(255, 120, 30, ${furnacePulse})`);
  furnaceGrad.addColorStop(0.3, `rgba(255, 80, 20, ${furnacePulse * 0.5})`);
  furnaceGrad.addColorStop(0.6, `rgba(255, 60, 10, ${furnacePulse * 0.2})`);
  furnaceGrad.addColorStop(1, 'rgba(255, 60, 10, 0)');
  ctx.fillStyle = furnaceGrad;
  ctx.fillRect(720, STAGE_GROUND_Y - 240, 360, 360);

  // Second smaller furnace glow
  const furnace2Grad = ctx.createRadialGradient(100, STAGE_GROUND_Y - 80, 5, 100, STAGE_GROUND_Y - 80, 100);
  furnace2Grad.addColorStop(0, `rgba(255, 100, 20, ${furnacePulse * 0.6})`);
  furnace2Grad.addColorStop(1, 'rgba(255, 60, 10, 0)');
  ctx.fillStyle = furnace2Grad;
  ctx.fillRect(0, STAGE_GROUND_Y - 180, 200, 200);

  // Dim industrial clouds
  for (let i = 0; i < 4; i++) {
    const cx = ((i * 250 + tick * 0.03) % (CANVAS_WIDTH + 200)) - 100;
    const cy = 50 + i * 30;
    ctx.fillStyle = `rgba(50, 45, 40, ${0.08 + i * 0.02})`;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 120 + i * 15, 15 + i * 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSmokestacks(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  const px = cameraX * 0.15;

  const stacks = [
    { x: 100, w: 32, h: 300 },
    { x: 280, w: 38, h: 330 },
    { x: 500, w: 30, h: 285 },
    { x: 680, w: 34, h: 310 },
    { x: 860, w: 28, h: 290 },
  ];

  for (const stack of stacks) {
    const sx = stack.x - px;
    const baseY = STAGE_GROUND_Y;

    // Stack body with gradient
    const stackGrad = ctx.createLinearGradient(sx, baseY - stack.h, sx + stack.w, baseY);
    stackGrad.addColorStop(0, '#282835');
    stackGrad.addColorStop(0.3, '#30303d');
    stackGrad.addColorStop(0.6, '#353542');
    stackGrad.addColorStop(1, '#252530');
    ctx.fillStyle = stackGrad;
    ctx.fillRect(sx, baseY - stack.h, stack.w, stack.h);

    // Stack taper (narrower at top)
    ctx.fillStyle = '#222230';
    ctx.beginPath();
    ctx.moveTo(sx - 3, baseY - stack.h + 35);
    ctx.lineTo(sx + 5, baseY - stack.h);
    ctx.lineTo(sx + stack.w - 5, baseY - stack.h);
    ctx.lineTo(sx + stack.w + 3, baseY - stack.h + 35);
    ctx.closePath();
    ctx.fill();

    // Rim at top
    ctx.fillStyle = '#3a3a4a';
    ctx.fillRect(sx - 4, baseY - stack.h - 5, stack.w + 8, 7);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(sx - 4, baseY - stack.h - 5, stack.w + 8, 2);

    // Warning stripe near top
    for (let hy = baseY - stack.h + 10; hy < baseY - stack.h + 30; hy += 6) {
      ctx.fillStyle = hy % 12 < 6 ? 'rgba(200, 150, 30, 0.15)' : 'rgba(30, 30, 0, 0.15)';
      ctx.fillRect(sx, hy, stack.w, 3);
    }

    // Horizontal bands
    ctx.fillStyle = '#444455';
    for (let by = baseY - stack.h + 60; by < baseY; by += 55) {
      ctx.fillRect(sx - 2, by, stack.w + 4, 4);
    }

    // Rivets along bands
    ctx.fillStyle = '#555566';
    for (let by = baseY - stack.h + 60; by < baseY; by += 55) {
      ctx.beginPath();
      ctx.arc(sx + 4, by + 2, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + stack.w - 4, by + 2, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Rust streaks — more detailed
    ctx.fillStyle = 'rgba(120, 60, 25, 0.18)';
    ctx.fillRect(sx + stack.w * 0.25, baseY - stack.h + 45, 3, stack.h - 55);
    ctx.fillRect(sx + stack.w * 0.65, baseY - stack.h + 85, 2, stack.h - 100);
    // Drip rust
    for (let dr = 0; dr < 3; dr++) {
      const drx = sx + stack.w * (0.2 + dr * 0.3);
      const dry = baseY - stack.h + 50 + dr * 40;
      ctx.fillStyle = 'rgba(100, 50, 20, 0.1)';
      ctx.beginPath();
      ctx.ellipse(drx, dry, 2, 6 + dr * 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Smoke from top — more volumetric
    for (let si = 0; si < 7; si++) {
      const smokeY = baseY - stack.h - 12 - si * 28;
      const windDrift = Math.sin(tick * 0.008 + si * 0.5 + stack.x * 0.1) * (8 + si * 10);
      const smokeX = sx + stack.w / 2 + windDrift;
      const smokeSize = 14 + si * 12;
      const smokeAlpha = Math.max(0, 0.14 - si * 0.018);
      ctx.fillStyle = `rgba(90, 90, 100, ${smokeAlpha})`;
      ctx.beginPath();
      ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
      ctx.fill();
      // Inner core
      ctx.fillStyle = `rgba(110, 110, 120, ${smokeAlpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(smokeX, smokeY, smokeSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawCranes(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  const px = cameraX * 0.1;

  // Industrial crane silhouettes in far background
  const cranes = [
    { x: 350, h: 220, armLen: 120, dir: 1 },
    { x: 600, h: 250, armLen: 100, dir: -1 },
  ];

  for (const crane of cranes) {
    const cx = crane.x - px;
    const baseY = STAGE_GROUND_Y - 30;

    // Tower
    ctx.strokeStyle = 'rgba(50, 50, 55, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, baseY);
    ctx.lineTo(cx, baseY - crane.h);
    ctx.stroke();

    // Cross braces
    ctx.lineWidth = 1;
    for (let by = baseY - 30; by > baseY - crane.h; by -= 30) {
      ctx.beginPath();
      ctx.moveTo(cx - 5, by);
      ctx.lineTo(cx + 5, by - 30);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 5, by);
      ctx.lineTo(cx - 5, by - 30);
      ctx.stroke();
    }

    // Arm
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, baseY - crane.h);
    ctx.lineTo(cx + crane.armLen * crane.dir, baseY - crane.h + 5);
    ctx.stroke();

    // Cable
    const cableSway = Math.sin(tick * 0.01 + crane.x) * 3;
    ctx.strokeStyle = 'rgba(60, 60, 65, 0.4)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx + crane.armLen * crane.dir * 0.8, baseY - crane.h + 4);
    ctx.lineTo(cx + crane.armLen * crane.dir * 0.8 + cableSway, baseY - crane.h + 80);
    ctx.stroke();

    // Hook
    ctx.strokeStyle = 'rgba(70, 70, 75, 0.5)';
    ctx.lineWidth = 1.5;
    const hookX = cx + crane.armLen * crane.dir * 0.8 + cableSway;
    const hookY = baseY - crane.h + 80;
    ctx.beginPath();
    ctx.arc(hookX, hookY + 5, 4, Math.PI * 0.5, Math.PI * 1.8);
    ctx.stroke();

    // Warning light on top
    const blink = Math.sin(tick * 0.08 + crane.x) > 0;
    if (blink) {
      ctx.fillStyle = 'rgba(255, 50, 30, 0.4)';
      ctx.beginPath();
      ctx.arc(cx, baseY - crane.h - 3, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawMachinery(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  const px = cameraX * 0.4;

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

    // Machine body with richer shading
    const machGrad = ctx.createLinearGradient(mx, baseY - m.h, mx, baseY);
    machGrad.addColorStop(0, shiftP(m.color, 10));
    machGrad.addColorStop(0.5, m.color);
    machGrad.addColorStop(1, shiftP(m.color, -8));
    ctx.fillStyle = machGrad;
    ctx.fillRect(mx, baseY - m.h, m.w, m.h);

    // Top panel
    ctx.fillStyle = '#353548';
    ctx.fillRect(mx, baseY - m.h, m.w, 8);
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(mx, baseY - m.h, m.w, 2);

    // Rivets — more detailed
    ctx.fillStyle = '#4a4a5e';
    for (let rx = mx + 10; rx < mx + m.w; rx += 18) {
      ctx.beginPath();
      ctx.arc(rx, baseY - m.h + 4, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(rx, baseY - 4, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Side rivets
    for (let ry = baseY - m.h + 20; ry < baseY - 10; ry += 20) {
      ctx.beginPath();
      ctx.arc(mx + 5, ry, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mx + m.w - 5, ry, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Warning light (blinking) — brighter
    const blinkPhase = Math.sin(tick * 0.1 + m.x * 0.05);
    if (blinkPhase > 0) {
      const lightX = mx + m.w / 2;
      const lightY = baseY - m.h - 8;
      // Light glow
      const lightGlow = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, 20);
      lightGlow.addColorStop(0, `rgba(255, 50, 30, ${blinkPhase * 0.4})`);
      lightGlow.addColorStop(0.5, `rgba(255, 30, 20, ${blinkPhase * 0.15})`);
      lightGlow.addColorStop(1, 'rgba(255, 30, 20, 0)');
      ctx.fillStyle = lightGlow;
      ctx.fillRect(lightX - 20, lightY - 20, 40, 40);
      // Light body
      ctx.fillStyle = `rgba(255, 80, 40, ${blinkPhase * 0.9})`;
      ctx.beginPath();
      ctx.arc(lightX, lightY, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Panel details
    ctx.fillStyle = '#1a1a28';
    ctx.fillRect(mx + 15, baseY - m.h + 15, 25, 22);
    ctx.fillRect(mx + m.w - 45, baseY - m.h + 15, 25, 22);
    // Panel border
    ctx.strokeStyle = 'rgba(80, 80, 100, 0.2)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(mx + 15, baseY - m.h + 15, 25, 22);
    ctx.strokeRect(mx + m.w - 45, baseY - m.h + 15, 25, 22);

    // Gauge with animated needle
    const gaugeX = mx + 28;
    const gaugeY = baseY - m.h + 26;
    // Gauge face
    ctx.fillStyle = 'rgba(30, 30, 40, 0.6)';
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, 8, 0, Math.PI * 2);
    ctx.stroke();
    // Tick marks
    for (let a = 0; a < 6; a++) {
      const angle = -Math.PI * 0.75 + (a / 5) * Math.PI * 1.5;
      ctx.beginPath();
      ctx.moveTo(gaugeX + Math.cos(angle) * 6, gaugeY + Math.sin(angle) * 6);
      ctx.lineTo(gaugeX + Math.cos(angle) * 7.5, gaugeY + Math.sin(angle) * 7.5);
      ctx.stroke();
    }
    // Needle
    const needleAngle = Math.sin(tick * 0.05 + m.x * 0.1) * 0.8 - Math.PI / 2;
    ctx.strokeStyle = '#ff4422';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gaugeX, gaugeY);
    ctx.lineTo(gaugeX + Math.cos(needleAngle) * 6, gaugeY + Math.sin(needleAngle) * 6);
    ctx.stroke();
    // Center dot
    ctx.fillStyle = '#ff4422';
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, 1, 0, Math.PI * 2);
    ctx.fill();

    // Second gauge
    const gauge2X = mx + m.w - 32;
    ctx.fillStyle = 'rgba(30, 30, 40, 0.6)';
    ctx.beginPath();
    ctx.arc(gauge2X, gaugeY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(gauge2X, gaugeY, 6, 0, Math.PI * 2);
    ctx.stroke();
    const needle2 = Math.cos(tick * 0.07 + m.x * 0.15) * 0.6 - Math.PI / 2;
    ctx.strokeStyle = '#44aaff';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(gauge2X, gaugeY);
    ctx.lineTo(gauge2X + Math.cos(needle2) * 4.5, gaugeY + Math.sin(needle2) * 4.5);
    ctx.stroke();

    // Conveyor belt detail on bottom
    ctx.fillStyle = '#1a1a25';
    ctx.fillRect(mx + 5, baseY - 18, m.w - 10, 18);
    // Belt rollers
    ctx.fillStyle = '#3a3a4a';
    for (let bx = mx + 10; bx < mx + m.w - 5; bx += 12) {
      const beltOffset = (tick * 2 + m.x) % 12;
      ctx.beginPath();
      ctx.arc(bx + beltOffset, baseY - 10, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    // Belt surface texture
    ctx.strokeStyle = 'rgba(60, 60, 70, 0.15)';
    ctx.lineWidth = 0.5;
    for (let bx = mx + 8; bx < mx + m.w - 5; bx += 6) {
      const beltOff = (tick * 2 + m.x) % 6;
      ctx.beginPath();
      ctx.moveTo(bx + beltOff, baseY - 17);
      ctx.lineTo(bx + beltOff, baseY - 3);
      ctx.stroke();
    }

    // Oil stain
    ctx.fillStyle = 'rgba(20, 20, 30, 0.2)';
    ctx.beginPath();
    ctx.ellipse(mx + m.w * 0.3, baseY - 5, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPipes(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  const px = cameraX * 0.25;

  // Horizontal pipes at various heights
  const pipes = [
    { y: STAGE_GROUND_Y - 155, r: 9, color: '#4a3a30' },
    { y: STAGE_GROUND_Y - 135, r: 7, color: '#3a4a40' },
    { y: STAGE_GROUND_Y - 175, r: 11, color: '#4a4030' },
    { y: STAGE_GROUND_Y - 200, r: 6, color: '#404a3a' },
  ];

  for (const pipe of pipes) {
    // Main pipe run
    ctx.fillStyle = pipe.color;
    ctx.fillRect(0, pipe.y - pipe.r, CANVAS_WIDTH, pipe.r * 2);

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(0, pipe.y - pipe.r, CANVAS_WIDTH, pipe.r * 0.4);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(0, pipe.y + pipe.r * 0.5, CANVAS_WIDTH, pipe.r * 0.5);

    // Joints/flanges
    for (let jx = 60 - (px % 110); jx < CANVAS_WIDTH; jx += 110) {
      ctx.fillStyle = shiftP(pipe.color, 25);
      ctx.fillRect(jx - 4, pipe.y - pipe.r - 3, 8, pipe.r * 2 + 6);
      // Bolts on flange
      ctx.fillStyle = '#555';
      ctx.beginPath();
      ctx.arc(jx, pipe.y - pipe.r + 2, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(jx, pipe.y + pipe.r - 2, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Steam leak at a joint — animated
    const leakX = 280 - px * 0.4;
    if (leakX > -30 && leakX < CANVAS_WIDTH + 30) {
      const leakIntensity = 0.5 + Math.sin(tick * 0.04) * 0.3;
      ctx.fillStyle = `rgba(180, 180, 195, ${0.08 * leakIntensity})`;
      for (let sp = 0; sp < 3; sp++) {
        const spx = leakX + Math.sin(tick * 0.05 + sp) * 5;
        const spy = pipe.y - pipe.r - 8 - sp * 8;
        ctx.beginPath();
        ctx.ellipse(spx, spy, 6 + sp * 3, 4 + sp * 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Vertical pipes
  const vPipes = [
    { x: 180, r: 11, h: 210, color: '#3a3530' },
    { x: 460, r: 9, h: 190, color: '#353a30' },
    { x: 720, r: 13, h: 230, color: '#3a3035' },
    { x: 900, r: 8, h: 170, color: '#353530' },
  ];

  for (const vp of vPipes) {
    const vx = vp.x - px;
    if (vx < -20 || vx > CANVAS_WIDTH + 20) continue;

    ctx.fillStyle = vp.color;
    ctx.fillRect(vx - vp.r, STAGE_GROUND_Y - vp.h, vp.r * 2, vp.h);

    // Highlight on pipe
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(vx - vp.r * 0.3, STAGE_GROUND_Y - vp.h, vp.r * 0.4, vp.h);

    // Valve wheel — more detailed
    const valveY = STAGE_GROUND_Y - vp.h + 45;
    ctx.strokeStyle = '#cc3322';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(vx, valveY, 9, 0, Math.PI * 2);
    ctx.stroke();
    // Valve spokes
    const spokeRotation = tick * 0.01;
    for (let sp = 0; sp < 4; sp++) {
      const angle = spokeRotation + sp * Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(vx + Math.cos(angle) * 3, valveY + Math.sin(angle) * 3);
      ctx.lineTo(vx + Math.cos(angle) * 7, valveY + Math.sin(angle) * 7);
      ctx.stroke();
    }
    // Valve center
    ctx.fillStyle = '#cc3322';
    ctx.beginPath();
    ctx.arc(vx, valveY, 2, 0, Math.PI * 2);
    ctx.fill();

    // Pipe support brackets
    for (let by = STAGE_GROUND_Y - vp.h + 80; by < STAGE_GROUND_Y - 20; by += 60) {
      ctx.fillStyle = shiftP(vp.color, 15);
      ctx.fillRect(vx - vp.r - 3, by, vp.r * 2 + 6, 4);
    }
  }
}

function drawWarningLights(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  const px = cameraX * 0.35;

  // Floor-level warning lights
  const lights = [
    { x: 80, color: '255, 200, 50' },
    { x: 300, color: '255, 50, 50' },
    { x: 550, color: '255, 200, 50' },
    { x: 750, color: '255, 50, 50' },
  ];

  for (const light of lights) {
    const lx = light.x - px;
    if (lx < -20 || lx > CANVAS_WIDTH + 20) continue;

    const blink = Math.sin(tick * 0.06 + light.x * 0.1) > 0 ? 1 : 0.1;
    const ly = STAGE_GROUND_Y - 4;

    // Light fixture
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(lx - 4, ly - 3, 8, 6);

    // Glow
    const lightGlow = ctx.createRadialGradient(lx, ly, 0, lx, ly, 15);
    lightGlow.addColorStop(0, `rgba(${light.color}, ${0.3 * blink})`);
    lightGlow.addColorStop(1, `rgba(${light.color}, 0)`);
    ctx.fillStyle = lightGlow;
    ctx.fillRect(lx - 15, ly - 15, 30, 30);

    // Lens
    ctx.fillStyle = `rgba(${light.color}, ${0.7 * blink})`;
    ctx.beginPath();
    ctx.arc(lx, ly, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGround(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  // Metal floor with grating — more detailed
  const groundGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y, 0, CANVAS_HEIGHT);
  groundGrad.addColorStop(0, '#2c2c38');
  groundGrad.addColorStop(0.02, '#282832');
  groundGrad.addColorStop(0.05, '#252530');
  groundGrad.addColorStop(0.15, '#202028');
  groundGrad.addColorStop(0.4, '#1a1a22');
  groundGrad.addColorStop(1, '#12121a');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, STAGE_GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - STAGE_GROUND_Y);

  // Metal grate pattern — finer
  ctx.strokeStyle = 'rgba(55, 55, 65, 0.18)';
  ctx.lineWidth = 0.5;
  for (let gy = STAGE_GROUND_Y + 5; gy < CANVAS_HEIGHT; gy += 8) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(CANVAS_WIDTH, gy); ctx.stroke();
  }
  for (let gx = 0; gx < CANVAS_WIDTH; gx += 8) {
    ctx.beginPath(); ctx.moveTo(gx, STAGE_GROUND_Y); ctx.lineTo(gx, CANVAS_HEIGHT); ctx.stroke();
  }

  // Oil stains
  const oilStains = [120, 350, 580, 780];
  for (const ox of oilStains) {
    const stainGrad = ctx.createRadialGradient(ox, STAGE_GROUND_Y + 8, 0, ox, STAGE_GROUND_Y + 8, 20);
    stainGrad.addColorStop(0, 'rgba(20, 20, 30, 0.25)');
    stainGrad.addColorStop(0.7, 'rgba(20, 20, 30, 0.1)');
    stainGrad.addColorStop(1, 'rgba(20, 20, 30, 0)');
    ctx.fillStyle = stainGrad;
    ctx.beginPath();
    ctx.ellipse(ox, STAGE_GROUND_Y + 8, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ground edge — industrial yellow safety line with hazard stripes
  ctx.fillStyle = 'rgba(200, 180, 50, 0.3)';
  ctx.fillRect(0, STAGE_GROUND_Y - 2, CANVAS_WIDTH, 4);
  // Hazard stripes
  for (let hx = 0; hx < CANVAS_WIDTH; hx += 30) {
    ctx.fillStyle = hx % 60 < 30 ? 'rgba(30, 30, 0, 0.25)' : 'rgba(200, 180, 50, 0.2)';
    ctx.fillRect(hx, STAGE_GROUND_Y - 2, 15, 4);
  }

  // Puddles with industrial reflections
  const puddles = [
    { x: 150, w: 35 }, { x: 400, w: 45 }, { x: 650, w: 30 }, { x: 850, w: 40 },
  ];
  for (const puddle of puddles) {
    const puddleGrad = ctx.createRadialGradient(puddle.x, STAGE_GROUND_Y + 6, 0, puddle.x, STAGE_GROUND_Y + 6, puddle.w * 0.6);
    puddleGrad.addColorStop(0, 'rgba(60, 70, 100, 0.15)');
    puddleGrad.addColorStop(0.5, 'rgba(50, 60, 90, 0.08)');
    puddleGrad.addColorStop(1, 'rgba(40, 50, 80, 0)');
    ctx.fillStyle = puddleGrad;
    ctx.beginPath();
    ctx.ellipse(puddle.x, STAGE_GROUND_Y + 6, puddle.w * 0.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Oil slick rainbow on puddle
    const slickPhase = tick * 0.02 + puddle.x;
    for (let si = 0; si < 3; si++) {
      const slickX = puddle.x + Math.sin(slickPhase + si * 2) * puddle.w * 0.2;
      const slickColor = [
        `rgba(200, 100, 50, 0.04)`,
        `rgba(50, 200, 100, 0.03)`,
        `rgba(100, 50, 200, 0.03)`,
      ][si];
      ctx.fillStyle = slickColor;
      ctx.beginPath();
      ctx.ellipse(slickX, STAGE_GROUND_Y + 6, 6, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Scattered bolts and debris
  ctx.fillStyle = 'rgba(60, 60, 70, 0.2)';
  const debris = [180, 350, 520, 680, 800];
  for (const dx of debris) {
    ctx.beginPath();
    ctx.arc(dx, STAGE_GROUND_Y + 12, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSparks(ctx: CanvasRenderingContext2D, tick: number): void {
  // Generate new sparks periodically (welding effect)
  sparkTimer++;
  if (sparkTimer % 12 === 0) {
    for (let i = 0; i < 5; i++) {
      sparks.push({
        x: 700 + Math.random() * 60,
        y: STAGE_GROUND_Y - 100 + Math.random() * 40,
        vx: (Math.random() - 0.5) * 5,
        vy: -Math.random() * 4 - 1,
        life: 18 + Math.floor(Math.random() * 18),
        maxLife: 36,
        size: 1 + Math.random() * 2.5,
      });
    }
  }

  // Secondary welding point
  if (sparkTimer % 25 === 0) {
    for (let i = 0; i < 3; i++) {
      sparks.push({
        x: 200 + Math.random() * 40,
        y: STAGE_GROUND_Y - 80 + Math.random() * 30,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 3 - 0.5,
        life: 12 + Math.floor(Math.random() * 12),
        maxLife: 24,
        size: 0.8 + Math.random() * 1.5,
      });
    }
  }

  // Update and draw
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.x += s.vx;
    s.y += s.vy;
    s.vy += 0.18;
    s.vx *= 0.99;
    s.life--;
    if (s.life <= 0) {
      sparks.splice(i, 1);
      continue;
    }
    const alpha = s.life / s.maxLife;
    // Trail
    ctx.strokeStyle = `rgba(255, ${150 + Math.random() * 80}, 30, ${alpha * 0.5})`;
    ctx.lineWidth = s.size * alpha;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - s.vx * 2, s.y - s.vy * 2);
    ctx.stroke();
    // Head
    ctx.fillStyle = `rgba(255, ${200 + Math.random() * 55}, 80, ${alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSteam(ctx: CanvasRenderingContext2D, tick: number): void {
  for (const puff of steamPuffs) {
    puff.x += puff.vx;
    puff.y += puff.vy;
    puff.size += 0.05;
    puff.life++;

    if (puff.life >= puff.maxLife) {
      puff.x = 200 + Math.random() * 600;
      puff.y = STAGE_GROUND_Y - 80 - Math.random() * 50;
      puff.life = 0;
      puff.size = 5 + Math.random() * 8;
    }

    const lifeRatio = 1 - puff.life / puff.maxLife;
    const alpha = lifeRatio * 0.1;
    ctx.fillStyle = `rgba(180, 185, 195, ${alpha})`;
    ctx.beginPath();
    ctx.arc(puff.x, puff.y, puff.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDust(ctx: CanvasRenderingContext2D, tick: number): void {
  for (const d of dustMotes) {
    d.x += d.vx + Math.sin(tick * 0.01 + d.phase) * 0.15;
    d.y += d.vy + Math.cos(tick * 0.008 + d.phase) * 0.1;

    if (d.x < -10) d.x = CANVAS_WIDTH + 10;
    if (d.x > CANVAS_WIDTH + 10) d.x = -10;
    if (d.y < 50) d.y = STAGE_GROUND_Y - 100;
    if (d.y > STAGE_GROUND_Y - 20) d.y = 100;

    const alpha = 0.08 + Math.sin(tick * 0.02 + d.phase) * 0.04;
    ctx.fillStyle = `rgba(180, 180, 200, ${alpha})`;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
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

// ===== Fluorescent lights with flickering =====

interface FluorescentLight {
  x: number;
  y: number;
  w: number;
  flickerPhase: number;
  flickerSpeed: number;
  broken: boolean;
}

const fluorescentLights: FluorescentLight[] = [];
let lightsInit = false;

function initFluorescentLights(): void {
  for (let i = 0; i < 10; i++) {
    fluorescentLights.push({
      x: 50 + i * 90,
      y: 70 + (i % 3) * 25,
      w: 60 + (i % 2) * 20,
      flickerPhase: Math.random() * Math.PI * 2,
      flickerSpeed: 0.05 + Math.random() * 0.15,
      broken: i === 3 || i === 7,
    });
  }
  lightsInit = true;
}

function drawFluorescentLights(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  if (!lightsInit) initFluorescentLights();
  const px = cameraX * 0.08;

  for (const light of fluorescentLights) {
    const lx = light.x - px;
    if (lx < -80 || lx > CANVAS_WIDTH + 80) continue;

    let brightness: number;
    if (light.broken) {
      const erratic = Math.sin(tick * 0.3 + light.flickerPhase) * Math.sin(tick * 0.17 + light.flickerPhase * 2);
      brightness = erratic > 0.3 ? 0.3 : 0;
    } else {
      const flickerCycle = Math.sin(tick * light.flickerSpeed + light.flickerPhase);
      brightness = flickerCycle > -0.8 ? 0.6 + flickerCycle * 0.2 : 0.1;
    }

    // Fixture housing
    ctx.fillStyle = '#3a3a45';
    ctx.fillRect(lx, light.y, light.w, 5);
    ctx.fillStyle = '#454550';
    ctx.fillRect(lx - 2, light.y - 2, light.w + 4, 3);

    if (brightness > 0.05) {
      // Downward light cone
      const coneGrad = ctx.createLinearGradient(lx + light.w / 2, light.y + 5, lx + light.w / 2, light.y + 120);
      coneGrad.addColorStop(0, `rgba(200, 220, 255, ${brightness * 0.12})`);
      coneGrad.addColorStop(0.4, `rgba(180, 200, 240, ${brightness * 0.05})`);
      coneGrad.addColorStop(1, 'rgba(160, 180, 220, 0)');
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(lx - 5, light.y + 5);
      ctx.lineTo(lx + light.w + 5, light.y + 5);
      ctx.lineTo(lx + light.w + 20, light.y + 120);
      ctx.lineTo(lx - 20, light.y + 120);
      ctx.closePath();
      ctx.fill();

      // Tube
      ctx.fillStyle = `rgba(220, 235, 255, ${brightness * 0.8})`;
      ctx.fillRect(lx + 3, light.y + 1, light.w - 6, 3);

      // Glow around tube
      const tubeGlow = ctx.createRadialGradient(lx + light.w / 2, light.y + 2, 0, lx + light.w / 2, light.y + 2, 25);
      tubeGlow.addColorStop(0, `rgba(200, 220, 255, ${brightness * 0.2})`);
      tubeGlow.addColorStop(1, 'rgba(180, 200, 240, 0)');
      ctx.fillStyle = tubeGlow;
      ctx.fillRect(lx - 15, light.y - 15, light.w + 30, 35);
    } else {
      ctx.fillStyle = 'rgba(60, 65, 75, 0.5)';
      ctx.fillRect(lx + 3, light.y + 1, light.w - 6, 3);
    }

    // Mounting wires
    ctx.strokeStyle = 'rgba(80, 80, 90, 0.3)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(lx + 10, light.y - 2);
    ctx.lineTo(lx + 10, light.y - 12);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(lx + light.w - 10, light.y - 2);
    ctx.lineTo(lx + light.w - 10, light.y - 12);
    ctx.stroke();
  }
}

// ===== Conveyor belt with moving boxes =====

interface ConveyorBox {
  worldX: number;
  w: number;
  h: number;
  color: string;
  speed: number;
}

const conveyorBoxes: ConveyorBox[] = [];
let conveyorInit = false;

function initConveyorBoxes(): void {
  const colors = ['#5a4030', '#4a3828', '#6a4838', '#504030', '#584238'];
  for (let i = 0; i < 6; i++) {
    conveyorBoxes.push({
      worldX: 100 + i * 180 + Math.random() * 60,
      w: 25 + Math.random() * 20,
      h: 20 + Math.random() * 15,
      color: colors[i % colors.length],
      speed: 0.4 + Math.random() * 0.2,
    });
  }
  conveyorInit = true;
}

function drawConveyorBoxes(ctx: CanvasRenderingContext2D, cameraX: number, tick: number): void {
  if (!conveyorInit) initConveyorBoxes();
  const px = cameraX * 0.4;
  const conveyorY = STAGE_GROUND_Y - 18;
  const conveyorStartWorld = 80;
  const conveyorEndWorld = 950;

  // Conveyor belt structure
  const beltScreenStart = conveyorStartWorld - px;
  const beltScreenEnd = conveyorEndWorld - px;
  const beltTopY = conveyorY;

  // Belt surface
  const clipStart = Math.max(0, beltScreenStart);
  const clipEnd = Math.min(CANVAS_WIDTH, beltScreenEnd);
  ctx.fillStyle = '#1a1a25';
  ctx.fillRect(clipStart, beltTopY, clipEnd - clipStart, 16);

  // Belt rollers (moving lines)
  ctx.strokeStyle = 'rgba(60, 60, 70, 0.2)';
  ctx.lineWidth = 1;
  const rollerSpacing = 12;
  const offset = (tick * 1.5) % rollerSpacing;
  for (let rx = clipStart + offset; rx < clipEnd; rx += rollerSpacing) {
    ctx.beginPath();
    ctx.moveTo(rx, beltTopY);
    ctx.lineTo(rx, beltTopY + 16);
    ctx.stroke();
  }

  // Belt edges
  ctx.fillStyle = '#3a3a4a';
  ctx.fillRect(clipStart, beltTopY - 2, clipEnd - clipStart, 2);
  ctx.fillRect(clipStart, beltTopY + 16, clipEnd - clipStart, 2);

  // Support legs
  for (let legWorld = conveyorStartWorld + 100; legWorld < conveyorEndWorld - 50; legWorld += 200) {
    const legX = legWorld - px;
    if (legX < -10 || legX > CANVAS_WIDTH + 10) continue;
    ctx.fillStyle = '#3a3a4a';
    ctx.fillRect(legX - 2, beltTopY + 18, 4, STAGE_GROUND_Y - beltTopY - 18);
  }

  // Moving boxes
  for (const box of conveyorBoxes) {
    box.worldX += box.speed;
    if (box.worldX > conveyorEndWorld + 50) {
      box.worldX = conveyorStartWorld - box.w - Math.random() * 80;
    }

    const boxX = box.worldX - px;
    if (boxX < -50 || boxX > CANVAS_WIDTH + 50) continue;
    const boxY = beltTopY - box.h;

    // Box body
    const boxGrad = ctx.createLinearGradient(boxX, boxY, boxX, boxY + box.h);
    boxGrad.addColorStop(0, shiftP(box.color, 15));
    boxGrad.addColorStop(0.5, box.color);
    boxGrad.addColorStop(1, shiftP(box.color, -10));
    ctx.fillStyle = boxGrad;
    ctx.fillRect(boxX, boxY, box.w, box.h);

    // Box tape
    ctx.fillStyle = 'rgba(180, 160, 120, 0.3)';
    ctx.fillRect(boxX + box.w * 0.4, boxY, box.w * 0.2, box.h);
    ctx.fillRect(boxX, boxY + box.h * 0.4, box.w, box.h * 0.2);

    // Box edge highlight
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(boxX, boxY, box.w, 2);
    ctx.fillRect(boxX, boxY, 2, box.h);

    // Box shadow on belt
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(boxX + 2, beltTopY - 1, box.w, 2);
  }
}
