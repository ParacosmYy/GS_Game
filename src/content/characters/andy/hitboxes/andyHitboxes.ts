/**
 * Andy Content Package — Hitbox / Hurtbox Data
 *
 * Provides Andy-specific hitbox data from two sources:
 * 1. MUGEN Clsn data (real AIR collision data, preferred)
 * 2. Legacy hardcoded HITBOX_OFFSETS / ATTACK_FRAMES (fallback)
 */
import { HITBOX_OFFSETS } from '../../../../core/hitboxConstants.js';
import { ATTACK_FRAMES } from '../../../../core/attackFrames.js';
import {
  getMugenAttackTiming,
  getMugenActionSummary,
  getCharacterMugenActions,
  hasCharacterMugenData,
  type MugenAttackTiming,
  type MugenActionSummary,
} from '../../../../rendering/sprites/shared/mugenHitboxQuery.js';

const MUGEN_DIR = 'andy';

export const ANDY_HITBOX_KEYS: string[] = [
  'ANDY_UWA_AGITO', 'ANDY_GEDAN_AGITO',
  'ANDY_HISHOU_KEN', 'ANDY_HISHOU_KEN_C',
  'ANDY_SHOURYUU_DAN', 'ANDY_SHOURYUU_DAN_C',
  'ANDY_ZANEI_RYUSEI_KEN', 'ANDY_ZANEI_RYUSEI_KEN_D',
  'ANDY_GEKI_HISHOU_KEN',
  'DM_CHO_REPPA_DAN',
];

type HitboxEntry = typeof HITBOX_OFFSETS[keyof typeof HITBOX_OFFSETS];

export function getAndyHitboxOffsets(): Record<string, HitboxEntry> {
  const result: Record<string, HitboxEntry> = {};
  for (const key of ANDY_HITBOX_KEYS) {
    const hb = (HITBOX_OFFSETS as Record<string, HitboxEntry>)[key];
    if (hb) result[key] = hb;
  }
  return result;
}

export const ANDY_ATTACK_FRAME_KEYS: string[] = [
  'ANDY_UWA_AGITO', 'ANDY_GEDAN_AGITO',
  'ANDY_HISHOU_KEN', 'ANDY_HISHOU_KEN_C',
  'ANDY_SHOURYUU_DAN', 'ANDY_SHOURYUU_DAN_C',
  'ANDY_ZANEI_RYUSEI_KEN', 'ANDY_ZANEI_RYUSEI_KEN_D',
  'ANDY_GEKI_HISHOU_KEN',
  'DM_CHO_REPPA_DAN',
];

type AttackFrameEntry = typeof ATTACK_FRAMES[keyof typeof ATTACK_FRAMES];

export function getAndyAttackFrames(): Record<string, AttackFrameEntry> {
  const result: Record<string, AttackFrameEntry> = {};
  for (const key of ANDY_ATTACK_FRAME_KEYS) {
    const af = (ATTACK_FRAMES as Record<string, AttackFrameEntry>)[key];
    if (af) result[key] = af;
  }
  return result;
}

// ===== MUGEN Data Queries =====

export const ANDY_MUGEN_ACTION_MAP: Record<string, string> = {
  CLOSE_A: '200', CLOSE_B: '230', CLOSE_C: '210', CLOSE_D: '240',
  STAND_A: '205', STAND_B: '235', STAND_C: '215', STAND_D: '245',
  CROUCH_A: '400', CROUCH_B: '430', CROUCH_C: '410', CROUCH_D: '440',
  JUMP_A: '600', JUMP_B: '630', JUMP_C: '610', JUMP_D: '640',
  ANDY_UWA_AGITO: '250', ANDY_GEDAN_AGITO: '260',
  ANDY_HISHOU_KEN: '1000', ANDY_HISHOU_KEN_C: '1010',
  ANDY_SHOURYUU_DAN: '1100', ANDY_SHOURYUU_DAN_C: '1150',
  ANDY_ZANEI_RYUSEI_KEN: '1200', ANDY_ZANEI_RYUSEI_KEN_D: '1250',
  ANDY_GEKI_HISHOU_KEN: '1400',
  DM_CHO_REPPA_DAN: '3000',
};

export function hasAndyMugenData(): boolean {
  return hasCharacterMugenData(MUGEN_DIR);
}

export function getAndyMugenTiming(attackKey: string): MugenAttackTiming | null {
  const action = ANDY_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenAttackTiming(MUGEN_DIR, action);
}

export function getAndyMugenActionSummary(attackKey: string): MugenActionSummary | null {
  const action = ANDY_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenActionSummary(MUGEN_DIR, action);
}

export function getAndyMugenActions(): string[] {
  return getCharacterMugenActions(MUGEN_DIR);
}

export function getAndyAttackTiming(attackKey: string): { startup: number; active: number; recovery: number; total: number } | null {
  const mugenTiming = getAndyMugenTiming(attackKey);
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
