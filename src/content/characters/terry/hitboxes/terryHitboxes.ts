/**
 * Terry Content Package — Hitbox / Hurtbox Data
 *
 * Provides Terry-specific hitbox data from two sources:
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

const MUGEN_DIR = 'cvsterry';

export const TERRY_HITBOX_KEYS: string[] = [
  'TERRY_BACK_KNCKLE', 'TERRY_COMBO_BLOW',
  'TERRY_POWER_WAVE', 'TERRY_BURN_KNUCKLE', 'TERRY_CRACK_SHOT',
  'TERRY_POWER_DUNK', 'TERRY_RISING_TACKLE',
  'DM_POWER_GEYSER', 'DM_HIGH_ANGLE_GEYSER',
  'SDM_POWER_GEYSER', 'SDM_HIGH_ANGLE_GEYSER',
];

type HitboxEntry = typeof HITBOX_OFFSETS[keyof typeof HITBOX_OFFSETS];

export function getTerryHitboxOffsets(): Record<string, HitboxEntry> {
  const result: Record<string, HitboxEntry> = {};
  for (const key of TERRY_HITBOX_KEYS) {
    const hb = (HITBOX_OFFSETS as Record<string, HitboxEntry>)[key];
    if (hb) result[key] = hb;
  }
  return result;
}

export const TERRY_ATTACK_FRAME_KEYS: string[] = [
  'TERRY_BACK_KNCKLE', 'TERRY_COMBO_BLOW',
  'TERRY_BURN_KNUCKLE', 'TERRY_CRACK_SHOT', 'TERRY_POWER_WAVE',
  'TERRY_POWER_DUNK', 'TERRY_RISING_TACKLE',
  'DM_POWER_GEYSER',
];

type AttackFrameEntry = typeof ATTACK_FRAMES[keyof typeof ATTACK_FRAMES];

export function getTerryAttackFrames(): Record<string, AttackFrameEntry> {
  const result: Record<string, AttackFrameEntry> = {};
  for (const key of TERRY_ATTACK_FRAME_KEYS) {
    const af = (ATTACK_FRAMES as Record<string, AttackFrameEntry>)[key];
    if (af) result[key] = af;
  }
  return result;
}

// ===== MUGEN Data Queries =====

export const TERRY_MUGEN_ACTION_MAP: Record<string, string> = {
  CLOSE_A: '200', CLOSE_B: '231', CLOSE_C: '211', CLOSE_D: '241',
  STAND_A: '200',
  STAND_B: '231', STAND_C: '211', STAND_D: '241',
  CROUCH_A: '400', CROUCH_B: '430', CROUCH_C: '410', CROUCH_D: '440',
  JUMP_A: '600', JUMP_B: '630', JUMP_C: '610', JUMP_D: '640',
  TERRY_POWER_WAVE: '1000', TERRY_BURN_KNUCKLE: '1010',
  TERRY_CRACK_SHOT: '1020', TERRY_POWER_DUNK: '1100',
  TERRY_RISING_TACKLE: '1200',
  TERRY_BACK_KNCKLE: '1300', TERRY_COMBO_BLOW: '1400',
  DM_POWER_GEYSER: '3000', SDM_POWER_GEYSER: '3010',
  DM_HIGH_ANGLE_GEYSER: '3100', SDM_HIGH_ANGLE_GEYSER: '3100',
};

export function hasTerryMugenData(): boolean {
  return hasCharacterMugenData(MUGEN_DIR);
}

export function getTerryMugenTiming(attackKey: string): MugenAttackTiming | null {
  const action = TERRY_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenAttackTiming(MUGEN_DIR, action);
}

export function getTerryMugenActionSummary(attackKey: string): MugenActionSummary | null {
  const action = TERRY_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenActionSummary(MUGEN_DIR, action);
}

export function getTerryMugenActions(): string[] {
  return getCharacterMugenActions(MUGEN_DIR);
}

export function getTerryAttackTiming(attackKey: string): { startup: number; active: number; recovery: number; total: number } | null {
  const mugenTiming = getTerryMugenTiming(attackKey);
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
