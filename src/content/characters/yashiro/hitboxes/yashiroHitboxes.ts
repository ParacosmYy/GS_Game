/**
 * Yashiro Content Package — Hitbox / Hurtbox Data
 *
 * Provides Yashiro-specific hitbox data from two sources:
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

const MUGEN_DIR = 'yashiro';

export const YASHIRO_HITBOX_KEYS: string[] = [
  'YASHIRO_SHUU_WANI', 'YASHIRO_JUU_ZUTSU',
  'YASHIRO_UPPER_DU', 'YASHIRO_UPPER_DU_C',
  'YASHIRO_NIRAAI', 'YASHIRO_NIRAAI_C',
  'YASHIRO_MUSATSU', 'YASHIRO_MUSATSU_D',
  'YASHIRO_SLEDGEHAMMER', 'YASHIRO_SLEDGEHAMMER_C',
  'DM_MILLION_BASH_STREAM', 'SDM_MILLION_BASH_STREAM',
];

type HitboxEntry = typeof HITBOX_OFFSETS[keyof typeof HITBOX_OFFSETS];

export function getYashiroHitboxOffsets(): Record<string, HitboxEntry> {
  const result: Record<string, HitboxEntry> = {};
  for (const key of YASHIRO_HITBOX_KEYS) {
    const hb = (HITBOX_OFFSETS as Record<string, HitboxEntry>)[key];
    if (hb) result[key] = hb;
  }
  return result;
}

export const YASHIRO_ATTACK_FRAME_KEYS: string[] = [
  'YASHIRO_SHUU_WANI', 'YASHIRO_JUU_ZUTSU',
  'YASHIRO_UPPER_DU', 'YASHIRO_UPPER_DU_C',
  'YASHIRO_NIRAAI', 'YASHIRO_NIRAAI_C',
  'YASHIRO_MUSATSU', 'YASHIRO_MUSATSU_D',
  'YASHIRO_SLEDGEHAMMER', 'YASHIRO_SLEDGEHAMMER_C',
  'DM_MILLION_BASH_STREAM', 'SDM_MILLION_BASH_STREAM',
];

type AttackFrameEntry = typeof ATTACK_FRAMES[keyof typeof ATTACK_FRAMES];

export function getYashiroAttackFrames(): Record<string, AttackFrameEntry> {
  const result: Record<string, AttackFrameEntry> = {};
  for (const key of YASHIRO_ATTACK_FRAME_KEYS) {
    const af = (ATTACK_FRAMES as Record<string, AttackFrameEntry>)[key];
    if (af) result[key] = af;
  }
  return result;
}

// ===== MUGEN Data Queries =====

export const YASHIRO_MUGEN_ACTION_MAP: Record<string, string> = {
  CLOSE_A: '200', CLOSE_B: '230', CLOSE_C: '210', CLOSE_D: '240',
  STAND_A: '205', STAND_B: '235', STAND_C: '215', STAND_D: '245',
  CROUCH_A: '400', CROUCH_B: '430', CROUCH_C: '410', CROUCH_D: '440',
  JUMP_A: '600', JUMP_B: '630', JUMP_C: '610', JUMP_D: '640',
  STAND_CD: '250', JUMP_CD: '690',
  THROW: '800',
  YASHIRO_SHUU_WANI: '1000',
  YASHIRO_JUU_ZUTSU: '1020',
  YASHIRO_UPPER_DU: '1050',
  YASHIRO_UPPER_DU_C: '1061',
  YASHIRO_NIRAAI: '1100',
  YASHIRO_NIRAAI_C: '1101',
  YASHIRO_MUSATSU: '1150',
  YASHIRO_MUSATSU_D: '1151',
  YASHIRO_SLEDGEHAMMER: '1200',
  YASHIRO_SLEDGEHAMMER_C: '1201',
  YASHIRO_MISSED: '1300',
  DM_MILLION_BASH_STREAM: '2005',
  SDM_MILLION_BASH_STREAM: '2055',
  DM_ORE_MAJI_MAMIRE: '2101',
  SDM_ORE_MAJI_MAMIRE: '2105',
};

export function hasYashiroMugenData(): boolean {
  return hasCharacterMugenData(MUGEN_DIR);
}

export function getYashiroMugenTiming(attackKey: string): MugenAttackTiming | null {
  const action = YASHIRO_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenAttackTiming(MUGEN_DIR, action);
}

export function getYashiroMugenActionSummary(attackKey: string): MugenActionSummary | null {
  const action = YASHIRO_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenActionSummary(MUGEN_DIR, action);
}

export function getYashiroMugenActions(): string[] {
  return getCharacterMugenActions(MUGEN_DIR);
}

export function getYashiroAttackTiming(attackKey: string): { startup: number; active: number; recovery: number; total: number } | null {
  const mugenTiming = getYashiroMugenTiming(attackKey);
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
