/**
 * Iori Content Package — Hitbox / Hurtbox Data
 *
 * Re-exports Iori-specific hitbox offsets and per-frame attack hitbox data
 * from the canonical hitbox and attack frame sources.
 */
import { HITBOX_OFFSETS } from '../../../../core/hitboxConstants.js';
import { ATTACK_FRAMES } from '../../../../core/attackFrames.js';

/** Iori-specific hitbox offset keys */
export const IORI_HITBOX_KEYS: string[] = [
  // Command normals
  'IORI_YUMEYUMI',
  'IORI_KATANUGI',
  'IORI_YUKIWARUI',
  // Specials
  'IORI_YAMIBARAI', 'IORI_YAMIBARAI_C',
  'IORI_ONIYAKI', 'IORI_ONIYAKI_C',
  'IORI_KOTOTSUKI', 'IORI_KOTOTSUKI_D',
  'IORI_KUZUKAZE',
  // Rekka chain — 葵花
  'IORI_AOIHANA', 'IORI_AOIHANA_2', 'IORI_AOIHANA_3',
  'IORI_AOIHANA_C', 'IORI_AOIHANA_C_2', 'IORI_AOIHANA_C_3',
  // DM / SDM / HSDM
  'DM_YATAGARASU',
  'SDM_YATAGARASU',
  'HSDM_YAOTOME',
];

type HitboxEntry = typeof HITBOX_OFFSETS[keyof typeof HITBOX_OFFSETS];

/** Get all Iori hitbox offsets */
export function getIoriHitboxOffsets(): Record<string, HitboxEntry> {
  const result: Record<string, HitboxEntry> = {};
  for (const key of IORI_HITBOX_KEYS) {
    const hb = (HITBOX_OFFSETS as Record<string, HitboxEntry>)[key];
    if (hb) {
      result[key] = hb;
    }
  }
  return result;
}

/** Iori-specific attack frame keys (per-frame hitbox data) */
export const IORI_ATTACK_FRAME_KEYS: string[] = [
  'IORI_YUMEYUMI', 'IORI_KATANUGI', 'IORI_YUKIWARUI',
  'IORI_YAMIBARAI', 'IORI_YAMIBARAI_C',
  'IORI_ONIYAKI', 'IORI_ONIYAKI_C',
  'IORI_KOTOTSUKI', 'IORI_KOTOTSUKI_D', 'IORI_KUZUKAZE',
  'IORI_AOIHANA', 'IORI_AOIHANA_2', 'IORI_AOIHANA_3',
  'IORI_AOIHANA_C', 'IORI_AOIHANA_C_2', 'IORI_AOIHANA_C_3',
  'DM_YATAGARASU', 'SDM_YATAGARASU', 'HSDM_YAOTOME',
];

type AttackFrameEntry = typeof ATTACK_FRAMES[keyof typeof ATTACK_FRAMES];

/** Get all Iori per-frame attack hitbox data */
export function getIoriAttackFrames(): Record<string, AttackFrameEntry> {
  const result: Record<string, AttackFrameEntry> = {};
  for (const key of IORI_ATTACK_FRAME_KEYS) {
    const af = (ATTACK_FRAMES as Record<string, AttackFrameEntry>)[key];
    if (af) {
      result[key] = af;
    }
  }
  return result;
}
