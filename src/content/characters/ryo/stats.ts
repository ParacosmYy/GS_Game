/**
 * Ryo Content Package — Stats
 *
 * Typed extraction of Ryo's character stats from the canonical definition.
 * This provides a typed, named-constant interface to Ryo's physics parameters.
 */
import { RyoDef } from '../../../characters/ryo.js';

export interface RyoStats {
  walkSpeed: number;
  runSpeed: number;
  jumpVelocity: number;
  hopVelocity: number;
  hyperJumpVelocity: number;
  maxHealth: number;
  pushWidth: number;
  jumpForwardSpeed: number;
  closeRange?: number;
  throwRange?: number;
}

/** Ryo's character stats as a typed constant */
export const RYO_STATS: RyoStats = RyoDef.stats;
