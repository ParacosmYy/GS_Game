/**
 * Stage rendering — background, ground, stars, floor grid, stage boundaries
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT, STAGE_GROUND_Y } from '../core/constants.js';

// ===== Star field =====

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

// ===== Stage drawing =====

/** Draw the full stage: sky, stars, city silhouette, ground, grid, boundaries */
export function drawStage(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  stars: Star[],
  globalTick: number,
): void {
  drawSky(ctx);
  drawStars(ctx, stars, globalTick);
  drawCitySilhouette(ctx, cameraX);
  drawFloorGrid(ctx, cameraX);
  drawGround(ctx);
  drawStageBoundaries(ctx, cameraX);
}

function drawSky(ctx: CanvasRenderingContext2D): void {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  skyGrad.addColorStop(0, '#0a0a1a');
  skyGrad.addColorStop(0.35, '#0e0e2a');
  skyGrad.addColorStop(0.7, '#151535');
  skyGrad.addColorStop(1, '#1a1a40');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawStars(ctx: CanvasRenderingContext2D, stars: Star[], globalTick: number): void {
  for (const star of stars) {
    const twinkle = star.brightness * (0.6 + 0.4 * Math.sin(globalTick * 0.02 * star.speed + star.x));
    ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
    ctx.fillRect(star.x, star.y, 1.5, 1.5);
  }
}

function drawCitySilhouette(ctx: CanvasRenderingContext2D, cameraX: number): void {
  ctx.fillStyle = '#0d0d20';
  const px = cameraX * 0.15;
  for (let i = 0; i < 12; i++) {
    const bx = i * 120 - (px % 120);
    const bh = 40 + Math.sin(i * 2.7) * 30;
    ctx.fillRect(bx, STAGE_GROUND_Y - bh, 50, bh);
    ctx.fillRect(bx + 60, STAGE_GROUND_Y - bh * 0.7, 40, bh * 0.7);
  }
}

function drawFloorGrid(ctx: CanvasRenderingContext2D, cameraX: number): void {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  for (let wx = 0; wx < 1600; wx += 80) {
    const sx = wx - cameraX;
    if (sx < -10 || sx > CANVAS_WIDTH + 10) continue;
    ctx.beginPath();
    ctx.moveTo(sx, STAGE_GROUND_Y);
    ctx.lineTo(sx, CANVAS_HEIGHT);
    ctx.stroke();
  }
  for (let fy = STAGE_GROUND_Y + 30; fy < CANVAS_HEIGHT; fy += 30) {
    ctx.beginPath();
    ctx.moveTo(0, fy);
    ctx.lineTo(CANVAS_WIDTH, fy);
    ctx.stroke();
  }
}

function drawGround(ctx: CanvasRenderingContext2D): void {
  const groundGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y, 0, CANVAS_HEIGHT);
  groundGrad.addColorStop(0, '#2a2a38');
  groundGrad.addColorStop(0.05, '#222230');
  groundGrad.addColorStop(1, '#16161f');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, STAGE_GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - STAGE_GROUND_Y);

  // Ground top edge glow
  const edgeGrad = ctx.createLinearGradient(0, STAGE_GROUND_Y - 3, 0, STAGE_GROUND_Y + 6);
  edgeGrad.addColorStop(0, 'rgba(80, 120, 255, 0.4)');
  edgeGrad.addColorStop(0.5, 'rgba(80, 120, 255, 0.15)');
  edgeGrad.addColorStop(1, 'rgba(80, 120, 255, 0)');
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, STAGE_GROUND_Y - 3, CANVAS_WIDTH, 9);
}

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
