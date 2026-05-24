/**
 * Stage system — routes to stage-specific renderers based on current stage ID.
 * Stages: temple (日本寺庙), china (唐人街), factory (工場)
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT, STAGE_GROUND_Y } from '../core/constants.js';
import { drawTempleStage } from './stageTemple.js';
import { drawChinaStage } from './stageChina.js';
import { drawFactoryStage } from './stageFactory.js';

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

export type StageId = 'temple' | 'china' | 'factory';

const ALL_STAGES: StageId[] = ['temple', 'china', 'factory'];
let currentStage: StageId = 'temple';

export function setStage(id: StageId): void {
  currentStage = id;
}

export function getStage(): StageId {
  return currentStage;
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
  }
}
