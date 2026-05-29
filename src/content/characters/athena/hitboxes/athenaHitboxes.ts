/**
 * Athena Content Package — Hitbox / Hurtbox Data
 *
 * Provides Athena-specific hitbox data from two sources:
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

const MUGEN_DIR = 'cvsathena';

export const ATHENA_HITBOX_KEYS: string[] = [
  'ATHENA_PHOENIX_REFLECT', 'ATHENA_LOW_B', 'ATHENA_AIR_B',
  'ATHENA_PSYCHO_BALL', 'ATHENA_PSYCHO_BALL_C',
  'ATHENA_PSYCHO_SWORD', 'ATHENA_PSYCHO_SWORD_C',
  'ATHENA_PHOENIX_ARROW',
  'DM_SHINING_CRYSTAL_BIT', 'SDM_SHINING_CRYSTAL_BIT',
];

type HitboxEntry = typeof HITBOX_OFFSETS[keyof typeof HITBOX_OFFSETS];

export function getAthenaHitboxOffsets(): Record<string, HitboxEntry> {
  const result: Record<string, HitboxEntry> = {};
  for (const key of ATHENA_HITBOX_KEYS) {
    const hb = (HITBOX_OFFSETS as Record<string, HitboxEntry>)[key];
    if (hb) result[key] = hb;
  }
  return result;
}

export const ATHENA_ATTACK_FRAME_KEYS: string[] = [
  'ATHENA_PHOENIX_REFLECT', 'ATHENA_LOW_B', 'ATHENA_AIR_B',
  'ATHENA_PSYCHO_BALL', 'ATHENA_PSYCHO_BALL_C',
  'ATHENA_PSYCHO_SWORD', 'ATHENA_PSYCHO_SWORD_C',
  'ATHENA_PHOENIX_ARROW', 'DM_SHINING_CRYSTAL_BIT',
];

type AttackFrameEntry = typeof ATTACK_FRAMES[keyof typeof ATTACK_FRAMES];

export function getAthenaAttackFrames(): Record<string, AttackFrameEntry> {
  const result: Record<string, AttackFrameEntry> = {};
  for (const key of ATHENA_ATTACK_FRAME_KEYS) {
    const af = (ATTACK_FRAMES as Record<string, AttackFrameEntry>)[key];
    if (af) result[key] = af;
  }
  return result;
}

// ===== MUGEN Data Queries =====

export const ATHENA_MUGEN_ACTION_MAP: Record<string, string> = {
  CLOSE_A: '200', CLOSE_B: '230', CLOSE_C: '210', CLOSE_D: '240',
  STAND_B: '231', STAND_C: '211', STAND_D: '241',
  CROUCH_A: '400', CROUCH_B: '430', CROUCH_C: '410', CROUCH_D: '440',
  JUMP_A: '600', JUMP_B: '630', JUMP_C: '610', JUMP_D: '640',
  ATHENA_PSYCHO_BALL: '1000', ATHENA_PSYCHO_BALL_C: '1010',
  ATHENA_PSYCHO_SWORD: '1100', ATHENA_PSYCHO_SWORD_C: '1110',
  ATHENA_PHOENIX_ARROW: '1200',
  DM_SHINING_CRYSTAL_BIT: '3000', SDM_SHINING_CRYSTAL_BIT: '3010',
};

export function hasAthenaMugenData(): boolean {
  return hasCharacterMugenData(MUGEN_DIR);
}

export function getAthenaMugenTiming(attackKey: string): MugenAttackTiming | null {
  const action = ATHENA_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenAttackTiming(MUGEN_DIR, action);
}

export function getAthenaMugenActionSummary(attackKey: string): MugenActionSummary | null {
  const action = ATHENA_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenActionSummary(MUGEN_DIR, action);
}

export function getAthenaMugenActions(): string[] {
  return getCharacterMugenActions(MUGEN_DIR);
}

export function getAthenaAttackTiming(attackKey: string): { startup: number; active: number; recovery: number; total: number } | null {
  const mugenTiming = getAthenaMugenTiming(attackKey);
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
