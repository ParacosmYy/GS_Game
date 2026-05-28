/**
 * Kim Content Package — Hitbox / Hurtbox Data
 *
 * Re-exports Kim-specific hitbox offsets and per-frame attack hitbox data
 * from the canonical hitbox and attack frame sources.
 */
import { HITBOX_OFFSETS } from '../../../../core/hitboxConstants.js';
import { ATTACK_FRAMES } from '../../../../core/attackFrames.js';

/** Kim-specific hitbox offset keys */
export const KIM_HITBOX_KEYS: string[] = [
  // Command normals
  'KIM_HISHOU_KICK',
  'KIM_HANSEN',
  'KIM_HISHOU',
  // Specials
  'KIM_HIENZAN',
  'KIM_HANGETSU',
  'KIM_HAKI',
  'KIM_SANREN',
  // Additional specials
  'KIM_KUZUSHI_GERI',
  'KIM_NERICHAGI',
  'KIM_KAITEN_HIEN_ZAN',
  // DM / SDM / HSDM
  'DM_PHOENIX_KICK',
  'DM_PHOENIX_HITEN',
  'SDM_PHOENIX_HITEN',
  'SDM_PHOENIX_HITEN_EX',
  'HSDM_PHOENIX_HITEN',
];

type HitboxEntry = typeof HITBOX_OFFSETS[keyof typeof HITBOX_OFFSETS];

/** Get all Kim hitbox offsets */
export function getKimHitboxOffsets(): Record<string, HitboxEntry> {
  const result: Record<string, HitboxEntry> = {};
  for (const key of KIM_HITBOX_KEYS) {
    const hb = (HITBOX_OFFSETS as Record<string, HitboxEntry>)[key];
    if (hb) {
      result[key] = hb;
    }
  }
  return result;
}

/** Kim-specific attack frame keys (per-frame hitbox data) */
export const KIM_ATTACK_FRAME_KEYS: string[] = [
  'KIM_HISHOU_KICK', 'KIM_HANSEN',
  'KIM_HIENZAN', 'KIM_HANGETSU', 'KIM_HAKI', 'KIM_HISHOU', 'KIM_SANREN',
  'DM_PHOENIX_KICK',
];

type AttackFrameEntry = typeof ATTACK_FRAMES[keyof typeof ATTACK_FRAMES];

/** Get all Kim per-frame attack hitbox data */
export function getKimAttackFrames(): Record<string, AttackFrameEntry> {
  const result: Record<string, AttackFrameEntry> = {};
  for (const key of KIM_ATTACK_FRAME_KEYS) {
    const af = (ATTACK_FRAMES as Record<string, AttackFrameEntry>)[key];
    if (af) {
      result[key] = af;
    }
  }
  return result;
}
