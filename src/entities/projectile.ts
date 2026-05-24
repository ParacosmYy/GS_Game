import { Direction } from '../core/types.js';
import { PROJECTILE_SPEED, HITBOX_OFFSETS } from '../core/constants.js';

export class Projectile {
  x: number;
  y: number;
  vx: number;
  facing: Direction;
  active = true;
  activeFrames: number;
  currentFrame = 0;

  constructor(x: number, y: number, facing: Direction, activeFrames: number) {
    this.x = x;
    this.y = y;
    this.facing = facing;
    this.vx = PROJECTILE_SPEED * facing;
    this.activeFrames = activeFrames;
  }

  update(): void {
    if (!this.active) return;

    this.x += this.vx;
    this.currentFrame++;

    // Deactivate after active frames or going off-screen
    if (this.currentFrame >= this.activeFrames) {
      this.active = false;
    }
    if (this.x < -100 || this.x > 1600) {
      this.active = false;
    }
  }

  getHitbox(): { x: number; y: number; width: number; height: number } | null {
    if (!this.active) return null;

    const offset = HITBOX_OFFSETS.SPECIAL_PROJECTILE;
    return {
      x: this.x - 15,
      y: this.y - 15,
      width: 30,
      height: 30,
    };
  }
}
