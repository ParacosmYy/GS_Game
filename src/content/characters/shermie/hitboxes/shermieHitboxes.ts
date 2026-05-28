/**
 * Shermie Content Package — Hitbox / Hurtbox Data
 *
 * Provides Shermie-specific hitbox data from two sources:
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

const MUGEN_DIR = 'shermie';

export const SHERMIE_HITBOX_KEYS: string[] = [
  'SHERMIE_STAND', 'SHERMIE_CLASH',
  'SHERMIE_SHOOT', 'SHERMIE_SHOOT_C',
  'SHERMIE_CARNIVAL', 'SHERMIE_AXLE_SPIN',
  'DM_SHERMIE_CARNIVAL', 'SDM_SHERMIE_CARNIVAL',
];

type HitboxEntry = typeof HITBOX_OFFSETS[keyof typeof HITBOX_OFFSETS];

export function getShermieHitboxOffsets(): Record<string, HitboxEntry> {
  const result: Record<string, HitboxEntry> = {};
  for (const key of SHERMIE_HITBOX_KEYS) {
    const hb = (HITBOX_OFFSETS as Record<string, HitboxEntry>)[key];
    if (hb) result[key] = hb;
  }
  return result;
}

export const SHERMIE_ATTACK_FRAME_KEYS: string[] = [
  'SHERMIE_STAND', 'SHERMIE_CLASH',
  'SHERMIE_SHOOT', 'SHERMIE_SHOOT_C',
  'SHERMIE_CARNIVAL', 'SHERMIE_AXLE_SPIN',
  'DM_SHERMIE_CARNIVAL', 'SDM_SHERMIE_CARNIVAL',
];

type AttackFrameEntry = typeof ATTACK_FRAMES[keyof typeof ATTACK_FRAMES];

export function getShermieAttackFrames(): Record<string, AttackFrameEntry> {
  const result: Record<string, AttackFrameEntry> = {};
  for (const key of SHERMIE_ATTACK_FRAME_KEYS) {
    const af = (ATTACK_FRAMES as Record<string, AttackFrameEntry>)[key];
    if (af) result[key] = af;
  }
  return result;
}

// ===== MUGEN Data Queries =====

export const SHERMIE_MUGEN_ACTION_MAP: Record<string, string> = {
  CLOSE_A: '200', CLOSE_B: '230', CLOSE_C: '210', CLOSE_D: '240',
  STAND_B: '231', STAND_C: '211', STAND_D: '241',
  CROUCH_A: '400', CROUCH_B: '430', CROUCH_C: '410', CROUCH_D: '440',
  JUMP_A: '600', JUMP_B: '630', JUMP_C: '610', JUMP_D: '640',
  SHERMIE_SHOOT: '1000', SHERMIE_CARNIVAL: '1010',
  SHERMIE_AXLE_SPIN: '1020', SHERMIE_SPIRAL: '1100',
  SHERMIE_WHIP: '1200', SHERMIE_SUPLEX: '1300',
  DM_SHERMIE_CARNIVAL: '3000', SDM_SHERMIE_CARNIVAL: '3010',
  DM_SHERMIE_FLASH: '3100', SDM_SHERMIE_FLASH: '3110',
};

export function hasShermieMugenData(): boolean {
  return hasCharacterMugenData(MUGEN_DIR);
}

export function getShermieMugenTiming(attackKey: string): MugenAttackTiming | null {
  const action = SHERMIE_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenAttackTiming(MUGEN_DIR, action);
}

export function getShermieMugenActionSummary(attackKey: string): MugenActionSummary | null {
  const action = SHERMIE_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenActionSummary(MUGEN_DIR, action);
}

export function getShermieMugenActions(): string[] {
  return getCharacterMugenActions(MUGEN_DIR);
}

export function getShermieAttackTiming(attackKey: string): { startup: number; active: number; recovery: number; total: number } | null {
  const mugenTiming = getShermieMugenTiming(attackKey);
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
