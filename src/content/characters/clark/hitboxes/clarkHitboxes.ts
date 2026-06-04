/**
 * Clark Content Package — Hitbox / Hurtbox Data
 *
 * Provides Clark-specific hitbox data from two sources:
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

const MUGEN_DIR = 'clark';

export const CLARK_HITBOX_KEYS: string[] = [
  'CLARK_DEATH_LAKE', 'CLARK_STOMP',
  'CLARK_ARGENTINE', 'CLARK_ARGENTINE_C',
  'CLARK_NAPALM', 'CLARK_FLASH_ELBOW',
  'CLARK_MOUNT_TACKLE', 'CLARK_VULCAN',
  'DM_ARGENTINE_DM', 'SDM_ARGENTINE_DM',
  'DM_ROLLING_CRADLE', 'SDM_ROLLING_CRADLE',
];

type HitboxEntry = typeof HITBOX_OFFSETS[keyof typeof HITBOX_OFFSETS];

export function getClarkHitboxOffsets(): Record<string, HitboxEntry> {
  const result: Record<string, HitboxEntry> = {};
  for (const key of CLARK_HITBOX_KEYS) {
    const hb = (HITBOX_OFFSETS as Record<string, HitboxEntry>)[key];
    if (hb) result[key] = hb;
  }
  return result;
}

export const CLARK_ATTACK_FRAME_KEYS: string[] = [
  'CLARK_DEATH_LAKE', 'CLARK_STOMP',
  'CLARK_ARGENTINE', 'CLARK_ARGENTINE_C',
  'CLARK_NAPALM', 'CLARK_FLASH_ELBOW',
  'CLARK_MOUNT_TACKLE', 'CLARK_VULCAN',
  'DM_ARGENTINE_DM', 'SDM_ARGENTINE_DM',
  'DM_ROLLING_CRADLE', 'SDM_ROLLING_CRADLE',
];

type AttackFrameEntry = typeof ATTACK_FRAMES[keyof typeof ATTACK_FRAMES];

export function getClarkAttackFrames(): Record<string, AttackFrameEntry> {
  const result: Record<string, AttackFrameEntry> = {};
  for (const key of CLARK_ATTACK_FRAME_KEYS) {
    const af = (ATTACK_FRAMES as Record<string, AttackFrameEntry>)[key];
    if (af) result[key] = af;
  }
  return result;
}

// ===== MUGEN Data Queries =====

// MUGEN action numbers from public/sprites/clark/hitboxes.json
export const CLARK_MUGEN_ACTION_MAP: Record<string, string> = {
  CLOSE_A: '200', CLOSE_B: '230', CLOSE_C: '210', CLOSE_D: '240',
  STAND_A: '205', STAND_B: '235', STAND_C: '215', STAND_D: '245',
  STAND_CD: '250',
  CROUCH_A: '400', CROUCH_B: '430', CROUCH_C: '410', CROUCH_D: '440',
  JUMP_A: '600', JUMP_B: '630', JUMP_C: '610', JUMP_D: '640',
  JUMP_CD: '650',
  THROW_FORWARD: '800', THROW_BACK: '880',
  CLARK_ARGENTINE: '1000', CLARK_ARGENTINE_C: '1000',
  CLARK_NAPALM: '1100', CLARK_NAPALM_C: '1150',
  CLARK_MOUNT_TACKLE: '1200', CLARK_MOUNT_TACKLE_C: '1250',
  CLARK_FLASH_ELBOW: '1300',
  CLARK_VULCAN: '1610',
  CLARK_DEATH_LAKE: '750',
  CLARK_STOMP: '1420',
  DM_ARGENTINE_DM: '3000', SDM_ARGENTINE_DM: '3100',
  DM_ROLLING_CRADLE: '3210', SDM_ROLLING_CRADLE: '3310',
};

export function hasClarkMugenData(): boolean {
  return hasCharacterMugenData(MUGEN_DIR);
}

export function getClarkMugenTiming(attackKey: string): MugenAttackTiming | null {
  const action = CLARK_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenAttackTiming(MUGEN_DIR, action);
}

export function getClarkMugenActionSummary(attackKey: string): MugenActionSummary | null {
  const action = CLARK_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenActionSummary(MUGEN_DIR, action);
}

export function getClarkMugenActions(): string[] {
  return getCharacterMugenActions(MUGEN_DIR);
}

export function getClarkAttackTiming(attackKey: string): { startup: number; active: number; recovery: number; total: number } | null {
  const mugenTiming = getClarkMugenTiming(attackKey);
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
