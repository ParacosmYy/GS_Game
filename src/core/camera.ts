import { Fighter } from '../entities/fighter.js';
import { CANVAS_WIDTH, STAGE_WIDTH } from './constants.js';

export class Camera {
  x = 0;

  update(targetA: Fighter, targetB: Fighter): void {
    const midX = (targetA.x + targetB.x) / 2;
    this.x = Math.max(0, Math.min(midX - CANVAS_WIDTH / 2, STAGE_WIDTH - CANVAS_WIDTH));
  }

  worldToScreen(worldX: number): number {
    return worldX - this.x;
  }
}
