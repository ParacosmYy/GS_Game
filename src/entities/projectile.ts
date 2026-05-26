import { Direction } from '../core/types.js';
import { PROJECTILE_SPEED } from '../core/constants.js';

// ===== Projectile Level System =====
// weak:  normal projectile (A version) — loses to other projectiles
// strong: EX/MAX version — beats weak, trades with strong
// super: DM projectile — goes through everything
export type ProjectileLevel = 'weak' | 'strong' | 'super';

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

  /** Version tag for rendering differentiation (e.g., 'A' vs 'C' version) */
  version: string;

  /** Projectile level determines clash resolution */
  level: ProjectileLevel;

  /** Base damage for this projectile (before scaling) */
  baseDamage: number;

  /** Whether this is an EX/MAX enhanced projectile */
  isEX: boolean;

  /** Trail positions for rendering */
  trail: Array<{ x: number; y: number; frame: number }> = [];

  constructor(
    x: number, y: number, facing: Direction, activeFrames: number,
    ownerId: number, charId: string = 'kyo',
    hitboxW: number = 15, hitboxH: number = 15,
    speed: number = PROJECTILE_SPEED, version: string = 'A',
    level: ProjectileLevel = 'weak', baseDamage: number = 70,
    isEX: boolean = false,
  ) {
    this.x = x;
    this.y = y;
    this.facing = facing;
    this.vx = speed * facing;
    this.activeFrames = activeFrames;
    this.ownerId = ownerId;
    this.charId = charId;
    this.hitboxW = hitboxW;
    this.hitboxH = hitboxH;
    this.version = version;
    this.level = level;
    this.baseDamage = baseDamage;
    this.isEX = isEX;
  }

  update(): void {
    if (!this.active) return;

    // Store trail position (keep last 6 positions)
    this.trail.push({ x: this.x, y: this.y, frame: this.currentFrame });
    if (this.trail.length > 6) {
      this.trail.shift();
    }

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

  /** Check if this projectile overlaps another projectile */
  overlapsProjectile(other: Projectile): boolean {
    if (!this.active || !other.active) return false;
    // Only opposing projectiles can clash
    if (this.ownerId === other.ownerId) return false;
    const dx = Math.abs(this.x - other.x);
    const dy = Math.abs(this.y - other.y);
    return dx < (this.hitboxW + other.hitboxW) && dy < (this.hitboxH + other.hitboxH);
  }

  /**
   * Resolve clash between two projectiles.
   * Returns:
   *   'both_destroyed' — same level, both die
   *   'this_survives' — this has higher level
   *   'other_survives' — other has higher level
   *   null — no clash (same owner or not overlapping)
   */
  resolveClash(other: Projectile): 'both_destroyed' | 'this_survives' | 'other_survives' | null {
    if (!this.overlapsProjectile(other)) return null;

    const levelOrder: Record<ProjectileLevel, number> = {
      weak: 0,
      strong: 1,
      super: 2,
    };
    const thisLevel = levelOrder[this.level];
    const otherLevel = levelOrder[other.level];

    if (thisLevel > otherLevel) return 'this_survives';
    if (otherLevel > thisLevel) return 'other_survives';
    return 'both_destroyed';
  }

  /** Get the collision point between this and another projectile (for VFX) */
  getCollisionPoint(other: Projectile): { x: number; y: number } {
    return {
      x: (this.x + other.x) / 2,
      y: (this.y + other.y) / 2,
    };
  }

  /** Destroy this projectile (marks inactive) */
  destroy(): void {
    this.active = false;
  }
}

// ===== Projectile Clash Resolver =====
export interface ClashEvent {
  x: number;
  y: number;
  destroyedProjectiles: Projectile[];
  survivor: Projectile | null;
}

/**
 * Resolve all projectile-vs-projectile clashes in a list.
 * Returns an array of clash events for VFX rendering.
 */
export function resolveProjectileClashes(projectiles: Projectile[]): ClashEvent[] {
  const events: ClashEvent[] = [];
  // Process each unique pair
  for (let i = 0; i < projectiles.length; i++) {
    const a = projectiles[i];
    if (!a.active) continue;
    for (let j = i + 1; j < projectiles.length; j++) {
      const b = projectiles[j];
      if (!b.active) continue;

      const result = a.resolveClash(b);
      if (result === null) continue;

      const point = a.getCollisionPoint(b);

      if (result === 'both_destroyed') {
        a.destroy();
        b.destroy();
        events.push({
          x: point.x,
          y: point.y,
          destroyedProjectiles: [a, b],
          survivor: null,
        });
      } else if (result === 'this_survives') {
        b.destroy();
        events.push({
          x: point.x,
          y: point.y,
          destroyedProjectiles: [b],
          survivor: a,
        });
      } else {
        a.destroy();
        events.push({
          x: point.x,
          y: point.y,
          destroyedProjectiles: [a],
          survivor: b,
        });
      }
    }
  }
  return events;
}
