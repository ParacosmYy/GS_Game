import { Direction } from '../core/types.js';
import { PROJECTILE_SPEED } from '../core/constants.js';

export class Projectile {
  x: number;
  y: number;
  vx: number;
  facing: Direction;
  active = true;
  activeFrames: number;
  currentFrame = 0;
  ownerId: number; // 0=P1, 1=P2 — prevents hitting owner
  charId: string;
  /** Hitbox half-width (total width = hitboxW * 2) */
  hitboxW: number;
  /** Hitbox half-height (total height = hitboxH * 2) */
  hitboxH: number;

  constructor(x: number, y: number, facing: Direction, activeFrames: number, ownerId: number, charId: string = 'kyo', hitboxW: number = 15, hitboxH: number = 15) {
    this.x = x;
    this.y = y;
    this.facing = facing;
    this.vx = PROJECTILE_SPEED * facing;
    this.activeFrames = activeFrames;
    this.ownerId = ownerId;
    this.charId = charId;
    this.hitboxW = hitboxW;
    this.hitboxH = hitboxH;
  }

  update(): void {
    if (!this.active) return;

    this.x += this.vx;
    this.currentFrame++;

    // Deactivate after active frames or going off-screen
    if (this.currentFrame >= this.activeFrames) {
      this.active = false;
    }
    // Stage boundary deactivation: well beyond visible area
    if (this.x < -100 || this.x > 1600) {
      this.active = false;
    }
  }

  getHitbox(): { x: number; y: number; width: number; height: number } | null {
    if (!this.active) return null;
    return {
      x: this.x - this.hitboxW,
      y: this.y - this.hitboxH,
      width: this.hitboxW * 2,
      height: this.hitboxH * 2,
    };
  }
}
