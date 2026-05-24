import { Fighter } from '../entities/fighter.js';
import { CANVAS_WIDTH, STAGE_WIDTH } from './constants.js';

export class Camera {
  x = 0;
  private targetX = 0;

  update(targetA: Fighter, targetB: Fighter): void {
    const midX = (targetA.x + targetB.x) / 2;
    this.targetX = Math.max(0, Math.min(midX - CANVAS_WIDTH / 2, STAGE_WIDTH - CANVAS_WIDTH));
    // KOF2002: smooth camera follow (lerp 0.15 per frame, snaps when close)
    const diff = this.targetX - this.x;
    if (Math.abs(diff) < 0.5) {
      this.x = this.targetX;
    } else {
      this.x += diff * 0.15;
    }
  }

  worldToScreen(worldX: number): number {
    return worldX - this.x;
  }
}
