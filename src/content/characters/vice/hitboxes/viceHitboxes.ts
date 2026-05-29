/**
 * Vice Content Package — Hitbox / Hurtbox Data
 *
 * Provides Vice-specific hitbox data from two sources:
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

const MUGEN_DIR = 'cvsvice';

export const VICE_HITBOX_KEYS: string[] = [
  'VICE_MONSTROSITY', 'VICE_OVERKILL',
  'VICE_OUTRAGE', 'VICE_OUTRAGE_C',
  'VICE_BLACK_END', 'VICE_MAYHEM',
  'DM_NEGATIVE_GAIN', 'SDM_NEGATIVE_GAIN',
  'VICE_OUTRAGE_QCB', 'VICE_MAYHEM_QCF',
];

type HitboxEntry = typeof HITBOX_OFFSETS[keyof typeof HITBOX_OFFSETS];

export function getViceHitboxOffsets(): Record<string, HitboxEntry> {
  const result: Record<string, HitboxEntry> = {};
  for (const key of VICE_HITBOX_KEYS) {
    const hb = (HITBOX_OFFSETS as Record<string, HitboxEntry>)[key];
    if (hb) result[key] = hb;
  }
  return result;
}

export const VICE_ATTACK_FRAME_KEYS: string[] = [
  'VICE_MONSTROSITY', 'VICE_OVERKILL',
  'VICE_OUTRAGE', 'VICE_OUTRAGE_C',
  'VICE_BLACK_END', 'VICE_MAYHEM',
  'DM_NEGATIVE_GAIN', 'SDM_NEGATIVE_GAIN',
];

type AttackFrameEntry = typeof ATTACK_FRAMES[keyof typeof ATTACK_FRAMES];

export function getViceAttackFrames(): Record<string, AttackFrameEntry> {
  const result: Record<string, AttackFrameEntry> = {};
  for (const key of VICE_ATTACK_FRAME_KEYS) {
    const af = (ATTACK_FRAMES as Record<string, AttackFrameEntry>)[key];
    if (af) result[key] = af;
  }
  return result;
}

// ===== MUGEN Data Queries =====

export const VICE_MUGEN_ACTION_MAP: Record<string, string> = {
  CLOSE_A: '200', CLOSE_B: '230', CLOSE_C: '210', CLOSE_D: '240',
  STAND_B: '231', STAND_C: '211', STAND_D: '241',
  CROUCH_A: '400', CROUCH_B: '430', CROUCH_C: '410', CROUCH_D: '440',
  JUMP_A: '600', JUMP_B: '630', JUMP_C: '610', JUMP_D: '640',
  VICE_OUTRAGE: '1000', VICE_OUTRAGE_C: '1010',
  VICE_BLACK_END: '1100', VICE_MAYHEM: '1200',
  DM_NEGATIVE_GAIN: '3000', SDM_NEGATIVE_GAIN: '3010',
};

export function hasViceMugenData(): boolean {
  return hasCharacterMugenData(MUGEN_DIR);
}

export function getViceMugenTiming(attackKey: string): MugenAttackTiming | null {
  const action = VICE_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenAttackTiming(MUGEN_DIR, action);
}

export function getViceMugenActionSummary(attackKey: string): MugenActionSummary | null {
  const action = VICE_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenActionSummary(MUGEN_DIR, action);
}

export function getViceMugenActions(): string[] {
  return getCharacterMugenActions(MUGEN_DIR);
}

export function getViceAttackTiming(attackKey: string): { startup: number; active: number; recovery: number; total: number } | null {
  const mugenTiming = getViceMugenTiming(attackKey);
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
