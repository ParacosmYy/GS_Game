/**
 * Terry Content Package — Hitbox / Hurtbox Data
 *
 * Re-exports Terry-specific hitbox offsets and per-frame attack hitbox data
 * from the canonical hitbox and attack frame sources.
 */
import { HITBOX_OFFSETS } from '../../../../core/hitboxConstants.js';
import { ATTACK_FRAMES } from '../../../../core/attackFrames.js';

/** Terry-specific hitbox offset keys */
export const TERRY_HITBOX_KEYS: string[] = [
  // Command normals
  'TERRY_BACK_KNCKLE',
  'TERRY_COMBO_BLOW',
  // Specials
  'TERRY_POWER_WAVE',
  'TERRY_BURN_KNUCKLE',
  'TERRY_CRACK_SHOT',
  'TERRY_POWER_DUNK',
  'TERRY_RISING_TACKLE',
  // DM / SDM / HSDM
  'DM_POWER_GEYSER',
  'DM_HIGH_ANGLE_GEYSER',
  'SDM_POWER_GEYSER',
  'SDM_HIGH_ANGLE_GEYSER',
];

type HitboxEntry = typeof HITBOX_OFFSETS[keyof typeof HITBOX_OFFSETS];

/** Get all Terry hitbox offsets */
export function getTerryHitboxOffsets(): Record<string, HitboxEntry> {
  const result: Record<string, HitboxEntry> = {};
  for (const key of TERRY_HITBOX_KEYS) {
    const hb = (HITBOX_OFFSETS as Record<string, HitboxEntry>)[key];
    if (hb) {
      result[key] = hb;
    }
  }
  return result;
}

/** Terry-specific attack frame keys (per-frame hitbox data) */
export const TERRY_ATTACK_FRAME_KEYS: string[] = [
  'TERRY_BACK_KNCKLE', 'TERRY_COMBO_BLOW',
  'TERRY_BURN_KNUCKLE', 'TERRY_CRACK_SHOT', 'TERRY_POWER_WAVE',
  'TERRY_POWER_DUNK', 'TERRY_RISING_TACKLE',
  'DM_POWER_GEYSER',
];

type AttackFrameEntry = typeof ATTACK_FRAMES[keyof typeof ATTACK_FRAMES];

/** Get all Terry per-frame attack hitbox data */
export function getTerryAttackFrames(): Record<string, AttackFrameEntry> {
  const result: Record<string, AttackFrameEntry> = {};
  for (const key of TERRY_ATTACK_FRAME_KEYS) {
    const af = (ATTACK_FRAMES as Record<string, AttackFrameEntry>)[key];
    if (af) {
      result[key] = af;
    }
  }
  return result;
}
