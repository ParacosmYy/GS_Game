/**
 * Iori Content Package — Hitbox / Hurtbox Data
 *
 * Provides Iori-specific hitbox data from two sources:
 * 1. MUGEN Clsn data (real AIR collision data, preferred)
 * 2. Legacy hardcoded HITBOX_OFFSETS / ATTACK_FRAMES (fallback)
 *
 * MUGEN data is loaded from hitboxes.json at runtime.
 * Legacy data is used when MUGEN data is unavailable.
 */
import { HITBOX_OFFSETS } from '../../../../core/hitboxConstants.js';
import { ATTACK_FRAMES } from '../../../../core/attackFrames.js';
import {
  getMugenActionSummary,
  getMugenAttackTiming,
  getCharacterMugenActions,
  hasCharacterMugenData,
  type MugenAttackTiming,
  type MugenActionSummary,
} from '../../../../rendering/sprites/shared/mugenHitboxQuery.js';

const MUGEN_DIR = 'yiori';

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

// ===== MUGEN Data Queries =====

/** AttackType → MUGEN action number mapping for Iori (ihoo1836 yiori) */
export const IORI_MUGEN_ACTION_MAP: Record<string, string> = {
  CLOSE_A: '202', CLOSE_B: '225', CLOSE_C: '215', CLOSE_D: '250',
  STAND_A: '200', STAND_B: '230', STAND_C: '212', STAND_D: '240',
  CROUCH_A: '400', CROUCH_B: '430', CROUCH_C: '420', CROUCH_D: '450',
  JUMP_A: '600', JUMP_B: '630', JUMP_C: '611', JUMP_D: '640',
  IORI_YUMEYUMI: '300', IORI_KATANUGI: '301', IORI_YUKIWARUI: '620',
  IORI_YAMIBARAI: '1000', IORI_YAMIBARAI_C: '1001',
  IORI_ONIYAKI: '1030', IORI_ONIYAKI_C: '1032',
  IORI_AOIHANA: '1200', IORI_AOIHANA_2: '1201', IORI_AOIHANA_3: '1202',
  IORI_AOIHANA_C: '1210', IORI_AOIHANA_C_2: '1211', IORI_AOIHANA_C_3: '1212',
  IORI_KOTOTSUKI: '1300', IORI_KOTOTSUKI_D: '1301',
  IORI_KUZUKAZE: '1400',
  DM_YATAGARASU: '2000', SDM_YATAGARASU: '3000', HSDM_YAOTOME: '3500',
};

/** Check if Iori has MUGEN hitbox data available */
export function hasIoriMugenData(): boolean {
  return hasCharacterMugenData(MUGEN_DIR);
}

/** Get MUGEN attack timing for an Iori attack */
export function getIoriMugenTiming(attackKey: string): MugenAttackTiming | null {
  const action = IORI_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenAttackTiming(MUGEN_DIR, action);
}

/** Get MUGEN action summary for an Iori attack */
export function getIoriMugenActionSummary(attackKey: string): MugenActionSummary | null {
  const action = IORI_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenActionSummary(MUGEN_DIR, action);
}

/** Get all MUGEN actions available for Iori */
export function getIoriMugenActions(): string[] {
  return getCharacterMugenActions(MUGEN_DIR);
}

/** Get attack timing from MUGEN data, falling back to legacy frame data */
export function getIoriAttackTiming(attackKey: string): { startup: number; active: number; recovery: number; total: number } | null {
  const mugenTiming = getIoriMugenTiming(attackKey);
  if (mugenTiming) return mugenTiming;

  const legacyFrames = (ATTACK_FRAMES as Record<string, AttackFrameEntry>)[attackKey];
  if (!legacyFrames) return null;

  let startup = 0, active = 0, recovery = 0;
  for (const frame of legacyFrames) {
    if (frame.attack) active++;
    else if (active > 0) recovery++;
    else startup++;
  }
  return { startup, active, recovery, total: startup + active + recovery };
}
