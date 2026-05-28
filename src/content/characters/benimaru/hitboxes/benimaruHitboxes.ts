/**
 * Benimaru Content Package — Hitbox / Hurtbox Data
 *
 * Provides Benimaru-specific hitbox data from two sources:
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

const MUGEN_DIR = 'cvsbenimaru';

export const BENIMARU_HITBOX_KEYS: string[] = [
  'BENIMARU_JACKKNIFE_KICK', 'BENIMARU_FLYING_DRILL',
  'BENIMARU_RAIJINKEN', 'BENIMARU_IAI_GERI',
  'BENIMARU_HANDOU_SANDAN_GERI', 'BENIMARU_SHINKUU_KATATEGOMA',
  'BENIMARU_COLLIDER', 'BENIMARU_SUPER_INAZUMA_KICK',
  'DM_RAIKOUKEN', 'DM_GENEI_HURRICANE',
  'SDM_RAIKOUKEN',
];

type HitboxEntry = typeof HITBOX_OFFSETS[keyof typeof HITBOX_OFFSETS];

export function getBenimaruHitboxOffsets(): Record<string, HitboxEntry> {
  const result: Record<string, HitboxEntry> = {};
  for (const key of BENIMARU_HITBOX_KEYS) {
    const hb = (HITBOX_OFFSETS as Record<string, HitboxEntry>)[key];
    if (hb) result[key] = hb;
  }
  return result;
}

export const BENIMARU_ATTACK_FRAME_KEYS: string[] = [
  'BENIMARU_JACKKNIFE_KICK', 'BENIMARU_FLYING_DRILL',
  'BENIMARU_RAIJINKEN', 'BENIMARU_IAI_GERI',
  'BENIMARU_SHINKUU_KATATEGOMA', 'BENIMARU_COLLIDER',
  'BENIMARU_SUPER_INAZUMA_KICK',
  'DM_RAIKOUKEN',
];

type AttackFrameEntry = typeof ATTACK_FRAMES[keyof typeof ATTACK_FRAMES];

export function getBenimaruAttackFrames(): Record<string, AttackFrameEntry> {
  const result: Record<string, AttackFrameEntry> = {};
  for (const key of BENIMARU_ATTACK_FRAME_KEYS) {
    const af = (ATTACK_FRAMES as Record<string, AttackFrameEntry>)[key];
    if (af) result[key] = af;
  }
  return result;
}

// ===== MUGEN Data Queries =====

export const BENIMARU_MUGEN_ACTION_MAP: Record<string, string> = {
  CLOSE_A: '200', CLOSE_B: '230', CLOSE_C: '210', CLOSE_D: '240',
  STAND_B: '231', STAND_C: '211', STAND_D: '241',
  CROUCH_A: '400', CROUCH_B: '430', CROUCH_C: '410', CROUCH_D: '440',
  JUMP_A: '600', JUMP_B: '630', JUMP_C: '610', JUMP_D: '640',
  BENIMARU_RAIJINKEN: '1000', BENIMARU_IAI_GERI: '1100',
  BENIMARU_HANDOU_SANDAN_GERI: '1110',
  BENIMARU_SHINKUU_KATATEGOMA: '1200',
  BENIMARU_COLLIDER: '1300',
  BENIMARU_SUPER_INAZUMA_KICK: '1400',
  DM_RAIKOUKEN: '3000', SDM_RAIKOUKEN: '3010',
  DM_GENEI_HURRICANE: '3100',
};

export function hasBenimaruMugenData(): boolean {
  return hasCharacterMugenData(MUGEN_DIR);
}

export function getBenimaruMugenTiming(attackKey: string): MugenAttackTiming | null {
  const action = BENIMARU_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenAttackTiming(MUGEN_DIR, action);
}

export function getBenimaruMugenActionSummary(attackKey: string): MugenActionSummary | null {
  const action = BENIMARU_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenActionSummary(MUGEN_DIR, action);
}

export function getBenimaruMugenActions(): string[] {
  return getCharacterMugenActions(MUGEN_DIR);
}

export function getBenimaruAttackTiming(attackKey: string): { startup: number; active: number; recovery: number; total: number } | null {
  const mugenTiming = getBenimaruMugenTiming(attackKey);
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
