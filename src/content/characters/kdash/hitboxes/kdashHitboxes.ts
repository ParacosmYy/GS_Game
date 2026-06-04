/**
 * K' Content Package — Hitbox / Hurtbox Data
 *
 * Provides K'-specific hitbox data from two sources:
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

const MUGEN_DIR = 'kdash';

export const KDASH_HITBOX_KEYS: string[] = [
  'KDASH_ONE_INCH', 'KDASH_TRIGGER',
  'KDASH_EINS', 'KDASH_EINS_C',
  'KDASH_CROW', 'KDASH_CROW_C',
  'KDASH_MINUTE', 'KDASH_NARROW',
  'DM_CHAIN_SHOT', 'SDM_CHAIN_SHOT',
];

type HitboxEntry = typeof HITBOX_OFFSETS[keyof typeof HITBOX_OFFSETS];

export function getKdashHitboxOffsets(): Record<string, HitboxEntry> {
  const result: Record<string, HitboxEntry> = {};
  for (const key of KDASH_HITBOX_KEYS) {
    const hb = (HITBOX_OFFSETS as Record<string, HitboxEntry>)[key];
    if (hb) result[key] = hb;
  }
  return result;
}

export const KDASH_ATTACK_FRAME_KEYS: string[] = [
  'KDASH_ONE_INCH', 'KDASH_TRIGGER',
  'KDASH_EINS', 'KDASH_EINS_C',
  'KDASH_CROW', 'KDASH_CROW_C',
  'KDASH_MINUTE', 'KDASH_NARROW',
  'DM_CHAIN_SHOT', 'SDM_CHAIN_SHOT',
];

type AttackFrameEntry = typeof ATTACK_FRAMES[keyof typeof ATTACK_FRAMES];

export function getKdashAttackFrames(): Record<string, AttackFrameEntry> {
  const result: Record<string, AttackFrameEntry> = {};
  for (const key of KDASH_ATTACK_FRAME_KEYS) {
    const af = (ATTACK_FRAMES as Record<string, AttackFrameEntry>)[key];
    if (af) result[key] = af;
  }
  return result;
}

// ===== MUGEN Data Queries =====

/** Maps K' attack type keys to MUGEN action numbers from hitboxes.json */
export const KDASH_MUGEN_ACTION_MAP: Record<string, string> = {
  // Normals — close stand (200-series from hitboxes.json)
  CLOSE_A: '200', CLOSE_B: '205', CLOSE_C: '210', CLOSE_D: '215',
  // Normals — stand (300-series)
  STAND_B: '300', STAND_C: '305', STAND_D: '310',
  // Normals — crouch (400-series)
  CROUCH_A: '400', CROUCH_B: '500', CROUCH_C: '505', CROUCH_D: '600',
  // Normals — jump
  JUMP_A: '610',
  // Command normals
  KDASH_ONE_INCH: '700',       // ->+A (action 700: multi-frame punch)
  KDASH_TRIGGER: '705',        // ->+D (action 705: multi-frame kick)
  // Specials
  KDASH_EINS: '1001',          // qcf+A Eins Trigger (action 1001: projectile)
  KDASH_EINS_C: '1030',        // qcf+C Eins Trigger strong (action 1030: longer projectile)
  KDASH_CROW: '1010',          // dp+A Crow Bites (action 1010: rising upper)
  KDASH_CROW_C: '1035',        // dp+C Crow Bites strong (action 1035: rising upper)
  KDASH_MINUTE: '1200',        // qcb+K Minute Spike (action 1200: overhead kick)
  KDASH_NARROW: '1210',        // qcf+K Narrow Spike (action 1210: low kick)
  // DM / SDM
  DM_CHAIN_SHOT: '1300',       // Chain Shot DM
  SDM_CHAIN_SHOT: '1305',      // Chain Shot SDM
};

export function hasKdashMugenData(): boolean {
  return hasCharacterMugenData(MUGEN_DIR);
}

export function getKdashMugenTiming(attackKey: string): MugenAttackTiming | null {
  const action = KDASH_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenAttackTiming(MUGEN_DIR, action);
}

export function getKdashMugenActionSummary(attackKey: string): MugenActionSummary | null {
  const action = KDASH_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenActionSummary(MUGEN_DIR, action);
}

export function getKdashMugenActions(): string[] {
  return getCharacterMugenActions(MUGEN_DIR);
}

export function getKdashAttackTiming(attackKey: string): { startup: number; active: number; recovery: number; total: number } | null {
  const mugenTiming = getKdashMugenTiming(attackKey);
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
