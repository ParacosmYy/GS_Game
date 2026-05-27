/**
 * Ryo Content Package — Hitbox / Hurtbox Data
 *
 * Re-exports Ryo-specific hitbox offsets and per-frame attack hitbox data
 * from the canonical hitbox and attack frame sources.
 */
import { HITBOX_OFFSETS } from '../../../../core/hitboxConstants.js';
import { ATTACK_FRAMES } from '../../../../core/attackFrames.js';

/** Ryo-specific hitbox offset keys */
export const RYO_HITBOX_KEYS: string[] = [
  // Command normals
  'RYO_TSURIZAO',
  'RYO_ORISHI',
  // Specials
  'RYO_KOOU', 'RYO_KOOU_C',
  'RYO_KO_HOU', 'RYO_KO_HOU_C',
  'RYO_HIEN', 'RYO_HAOU',
  // DM / SDM / HSDM
  'DM_TEN_HA_OU',
  'DM_RYUKO_RANBU',
  'SDM_RYUKO_RANBU',
  'HSDM_RYUKO_RANBU',
];

type HitboxEntry = typeof HITBOX_OFFSETS[keyof typeof HITBOX_OFFSETS];

/** Get all Ryo hitbox offsets */
export function getRyoHitboxOffsets(): Record<string, HitboxEntry> {
  const result: Record<string, HitboxEntry> = {};
  for (const key of RYO_HITBOX_KEYS) {
    const hb = (HITBOX_OFFSETS as Record<string, HitboxEntry>)[key];
    if (hb) {
      result[key] = hb;
    }
  }
  return result;
}

/** Ryo-specific attack frame keys (per-frame hitbox data) */
export const RYO_ATTACK_FRAME_KEYS: string[] = [
  'RYO_TSURIZAO', 'RYO_ORISHI',
  'RYO_KOOU', 'RYO_KOOU_C',
  'RYO_KO_HOU', 'RYO_KO_HOU_C',
  'RYO_HIEN', 'RYO_HAOU',
  'DM_TEN_HA_OU', 'SDM_TEN_HA_OU',
  'DM_RYUKO_RANBU', 'SDM_RYUKO_RANBU', 'HSDM_RYUKO_RANBU',
];

type AttackFrameEntry = typeof ATTACK_FRAMES[keyof typeof ATTACK_FRAMES];

/** Get all Ryo per-frame attack hitbox data */
export function getRyoAttackFrames(): Record<string, AttackFrameEntry> {
  const result: Record<string, AttackFrameEntry> = {};
  for (const key of RYO_ATTACK_FRAME_KEYS) {
    const af = (ATTACK_FRAMES as Record<string, AttackFrameEntry>)[key];
    if (af) {
      result[key] = af;
    }
  }
  return result;
}
