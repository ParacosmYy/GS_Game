/**
 * Stage system — routes to stage-specific renderers based on current stage ID.
 * Stages: temple (日本寺庙), china (唐人街), factory (工場),
 *         orochi (大蛇神社), street (街市夜市)
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT, STAGE_GROUND_Y } from '../core/constants.js';
import { drawTempleStage } from './stageTemple.js';
import { drawChinaStage } from './stageChina.js';
import { drawFactoryStage } from './stageFactory.js';
import { drawOrochiStage } from './stageOrochi.js';
import { drawStreetStage } from './stageStreet.js';
import { drawRooftopStage } from './stageRooftop.js';

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

export type StageId = 'temple' | 'china' | 'factory' | 'orochi' | 'street' | 'rooftop';

const ALL_STAGES: StageId[] = ['temple', 'china', 'factory', 'orochi', 'street', 'rooftop'];
let currentStage: StageId = 'temple';

export function setStage(id: StageId): void {
  currentStage = id;
}

export function getStage(): StageId {
  return currentStage;
}

export function getAllStages(): StageId[] {
  return ALL_STAGES;
}

export function cycleStage(): StageId {
  const idx = ALL_STAGES.indexOf(currentStage);
  currentStage = ALL_STAGES[(idx + 1) % ALL_STAGES.length];
  return currentStage;
}

export function drawStage(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  stars: Star[],
  globalTick: number,
): void {
  switch (currentStage) {
    case 'temple':
      drawTempleStage(ctx, cameraX, stars, globalTick);
      break;
    case 'china':
      drawChinaStage(ctx, cameraX, stars, globalTick);
      break;
    case 'factory':
      drawFactoryStage(ctx, cameraX, stars, globalTick);
      break;
    case 'orochi':
      drawOrochiStage(ctx, cameraX, stars, globalTick);
      break;
    case 'street':
      drawStreetStage(ctx, cameraX, stars, globalTick);
      break;
    case 'rooftop':
      drawRooftopStage(ctx, cameraX, stars, globalTick);
      break;
  }
  // KOF2002: 环境浮尘 — 地面附近缓慢漂浮的微粒
  drawAmbientDust(ctx, globalTick);
}

function drawAmbientDust(ctx: CanvasRenderingContext2D, tick: number): void {
  ctx.save();
  for (let i = 0; i < 8; i++) {
    const baseX = ((i * 113 + tick * 0.15) % (CANVAS_WIDTH + 40)) - 20;
    const y = STAGE_GROUND_Y - 8 - Math.sin(tick * 0.02 + i * 1.7) * 15;
    const alpha = 0.12 + Math.sin(tick * 0.03 + i) * 0.06;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#aaaacc';
    ctx.beginPath();
    ctx.arc(baseX, y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
