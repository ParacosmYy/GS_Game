/**
 * Ryo Content Package — Character Data
 *
 * Typed, self-contained character metadata for Ryo Sakazaki.
 * This is the single source of truth for Ryo's identity and physics parameters.
 * Stats are derived from the canonical definition in characters/ryo.ts.
 */
import { RyoDef } from '../../../characters/ryo.js';

/** Ryo's character metadata — identity, physics, display properties */
export const RYO_CHARACTER_DATA = {
  /** Unique character identifier */
  id: 'ryo' as const,
  /** Full display name */
  displayName: 'RYO SAKAZAKI',
  /** Chinese name */
  nameCn: '坂崎亮',
  /** Character subtitle / title */
  subtitle: 'The Invincible Dragon',
  /** Weight class (100 = standard) */
  weight: 100,
  /** Forward walk speed in pixels/frame */
  walkSpeedForward: RyoDef.stats.walkSpeed,
  /** Backward walk speed in pixels/frame */
  walkSpeedBackward: Math.round(RyoDef.stats.walkSpeed * 0.7 * 10) / 10,
  /** Run speed in pixels/frame */
  runSpeed: RyoDef.stats.runSpeed,
  /** Initial jump vertical velocity */
  jumpVelocity: RyoDef.stats.jumpVelocity,
  /** Hop vertical velocity */
  hopVelocity: RyoDef.stats.hopVelocity,
  /** Hyper jump vertical velocity */
  hyperJumpVelocity: RyoDef.stats.hyperJumpVelocity,
  /** Gravity applied per frame */
  gravity: 0.8,
  /** Maximum health points */
  maxHP: RyoDef.stats.maxHealth,
  /** Portrait theme color */
  portraitColor: RyoDef.color,
  /** Accent color for special effects */
  themeColor: RyoDef.accentColor,
  /** Close range threshold for proximity normals */
  closeRange: RyoDef.stats.closeRange ?? 88,
  /** Throw range in pixels */
  throwRange: RyoDef.stats.throwRange ?? 108,
} as const;
