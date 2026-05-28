/**
 * Ryo Content Package — Hitbox / Hurtbox Data
 *
 * Provides Ryo-specific hitbox data from two sources:
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

const MUGEN_DIR = 'cvsryo';

/** Ryo-specific hitbox offset keys */
export const RYO_HITBOX_KEYS: string[] = [
  'RYO_TSURIZAO', 'RYO_ORISHI',
  'RYO_KOOU', 'RYO_KOOU_C',
  'RYO_KO_HOU', 'RYO_KO_HOU_C',
  'RYO_HIEN', 'RYO_HAOU',
  'RYO_KOOUKEN_D', 'RYO_HIO_HACKER', 'RYO_ZANRETSU_KEN',
  'DM_TEN_HA_OU', 'DM_RYUKO_RANBU', 'SDM_RYUKO_RANBU', 'HSDM_RYUKO_RANBU',
];

type HitboxEntry = typeof HITBOX_OFFSETS[keyof typeof HITBOX_OFFSETS];

/** Get all Ryo hitbox offsets (legacy) */
export function getRyoHitboxOffsets(): Record<string, HitboxEntry> {
  const result: Record<string, HitboxEntry> = {};
  for (const key of RYO_HITBOX_KEYS) {
    const hb = (HITBOX_OFFSETS as Record<string, HitboxEntry>)[key];
    if (hb) result[key] = hb;
  }
  return result;
}

/** Ryo-specific attack frame keys (per-frame hitbox data) */
export const RYO_ATTACK_FRAME_KEYS: string[] = [
  'RYO_TSURIZAO', 'RYO_ORISHI',
  'RYO_KOOU', 'RYO_KOOU_C',
  'RYO_KO_HOU', 'RYO_KO_HOU_C',
  'RYO_HIEN', 'RYO_HAOU',
  'RYO_KOOUKEN_D', 'RYO_HIO_HACKER', 'RYO_ZANRETSU_KEN',
  'DM_TEN_HA_OU', 'SDM_TEN_HA_OU',
  'DM_RYUKO_RANBU', 'SDM_RYUKO_RANBU', 'HSDM_RYUKO_RANBU',
];

type AttackFrameEntry = typeof ATTACK_FRAMES[keyof typeof ATTACK_FRAMES];

/** Get all Ryo per-frame attack hitbox data (legacy) */
export function getRyoAttackFrames(): Record<string, AttackFrameEntry> {
  const result: Record<string, AttackFrameEntry> = {};
  for (const key of RYO_ATTACK_FRAME_KEYS) {
    const af = (ATTACK_FRAMES as Record<string, AttackFrameEntry>)[key];
    if (af) result[key] = af;
  }
  return result;
}

// ===== MUGEN Data Queries =====

/** AttackType → MUGEN action number mapping for Ryo */
export const RYO_MUGEN_ACTION_MAP: Record<string, string> = {
  CLOSE_A: '200', CLOSE_B: '230', CLOSE_C: '210', CLOSE_D: '240',
  STAND_B: '231', STAND_C: '211', STAND_D: '241',
  CROUCH_A: '400', CROUCH_B: '430', CROUCH_C: '410', CROUCH_D: '440',
  JUMP_A: '600', JUMP_B: '630', JUMP_C: '610', JUMP_D: '640',
  RYO_KOOU: '1000', RYO_KOOU_C: '1010', RYO_KOOUKEN_D: '1020',
  RYO_KO_HOU: '1100', RYO_KO_HOU_C: '1110',
  RYO_HIEN: '1200', RYO_HAOU: '1300',
  RYO_HIO_HACKER: '1400', RYO_ZANRETSU_KEN: '1500',
  RYO_TSURIZAO: '170',
  DM_RYUKO_RANBU: '3000', SDM_RYUKO_RANBU: '3010', HSDM_RYUKO_RANBU: '3020',
  DM_TEN_HA_OU: '3100', SDM_TEN_HA_OU: '3100',
};

/** Check if Ryo has MUGEN hitbox data available */
export function hasRyoMugenData(): boolean {
  return hasCharacterMugenData(MUGEN_DIR);
}

/** Get MUGEN attack timing for a Ryo attack */
export function getRyoMugenTiming(attackKey: string): MugenAttackTiming | null {
  const action = RYO_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenAttackTiming(MUGEN_DIR, action);
}

/** Get MUGEN action summary for a Ryo attack */
export function getRyoMugenActionSummary(attackKey: string): MugenActionSummary | null {
  const action = RYO_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenActionSummary(MUGEN_DIR, action);
}

/** Get all MUGEN actions available for Ryo */
export function getRyoMugenActions(): string[] {
  return getCharacterMugenActions(MUGEN_DIR);
}

/** Get attack timing from MUGEN data, falling back to legacy frame data */
export function getRyoAttackTiming(attackKey: string): { startup: number; active: number; recovery: number; total: number } | null {
  // Try MUGEN data first
  const mugenTiming = getRyoMugenTiming(attackKey);
  if (mugenTiming) return mugenTiming;

  // Fallback to legacy ATTACK_FRAMES
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
