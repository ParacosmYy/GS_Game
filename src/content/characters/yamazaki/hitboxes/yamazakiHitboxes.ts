/**
 * Yamazaki Content Package — Hitbox / Hurtbox Data
 *
 * Provides Yamazaki-specific hitbox data from two sources:
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

const MUGEN_DIR = 'cvsyamazaki';

export const YAMAZAKI_HITBOX_KEYS: string[] = [
  'YAMAZAKI_SASHI', 'YAMAZAKI_BOKKAI',
  'YAMAZAKI_SNAKE_ARM', 'YAMAZAKI_SNAKE_ARM_C',
  'YAMAZAKI_SANDSTORM', 'YAMAZAKI_BAI_GA_SE',
  'YAMAZAKI_SNAKE_ARM_QCF', 'YAMAZAKI_DRILL',
  'DM_GUILLOTINE', 'SDM_GUILLOTINE',
];

type HitboxEntry = typeof HITBOX_OFFSETS[keyof typeof HITBOX_OFFSETS];

export function getYamazakiHitboxOffsets(): Record<string, HitboxEntry> {
  const result: Record<string, HitboxEntry> = {};
  for (const key of YAMAZAKI_HITBOX_KEYS) {
    const hb = (HITBOX_OFFSETS as Record<string, HitboxEntry>)[key];
    if (hb) result[key] = hb;
  }
  return result;
}

export const YAMAZAKI_ATTACK_FRAME_KEYS: string[] = [
  'YAMAZAKI_SASHI', 'YAMAZAKI_BOKKAI',
  'YAMAZAKI_SNAKE_ARM', 'YAMAZAKI_SNAKE_ARM_C',
  'YAMAZAKI_SANDSTORM', 'YAMAZAKI_BAI_GA_SE',
  'DM_GUILLOTINE',
];

type AttackFrameEntry = typeof ATTACK_FRAMES[keyof typeof ATTACK_FRAMES];

export function getYamazakiAttackFrames(): Record<string, AttackFrameEntry> {
  const result: Record<string, AttackFrameEntry> = {};
  for (const key of YAMAZAKI_ATTACK_FRAME_KEYS) {
    const af = (ATTACK_FRAMES as Record<string, AttackFrameEntry>)[key];
    if (af) result[key] = af;
  }
  return result;
}

// ===== MUGEN Data Queries =====

/** Maps Yamazaki attack keys to MUGEN action numbers */
export const YAMAZAKI_MUGEN_ACTION_MAP: Record<string, string> = {
  CLOSE_A: '200', CLOSE_B: '230', CLOSE_C: '210', CLOSE_D: '240',
  STAND_B: '231', STAND_C: '211', STAND_D: '241',
  CROUCH_A: '400', CROUCH_B: '430', CROUCH_C: '410', CROUCH_D: '440',
  JUMP_A: '600', JUMP_B: '630', JUMP_C: '610', JUMP_D: '640',
  YAMAZAKI_SNAKE_ARM: '1000', YAMAZAKI_SNAKE_ARM_C: '1001',
  YAMAZAKI_SANDSTORM: '1100', YAMAZAKI_BAI_GA_SE: '1200',
  DM_GUILLOTINE: '3000', SDM_GUILLOTINE: '3010',
};

export function hasYamazakiMugenData(): boolean {
  return hasCharacterMugenData(MUGEN_DIR);
}

export function getYamazakiMugenTiming(attackKey: string): MugenAttackTiming | null {
  const action = YAMAZAKI_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenAttackTiming(MUGEN_DIR, action);
}

export function getYamazakiMugenActionSummary(attackKey: string): MugenActionSummary | null {
  const action = YAMAZAKI_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenActionSummary(MUGEN_DIR, action);
}

export function getYamazakiMugenActions(): string[] {
  return getCharacterMugenActions(MUGEN_DIR);
}

export function getYamazakiAttackTiming(attackKey: string): { startup: number; active: number; recovery: number; total: number } | null {
  const mugenTiming = getYamazakiMugenTiming(attackKey);
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
