/**
 * Mai Content Package — Hitbox / Hurtbox Data
 *
 * Provides Mai-specific hitbox data from two sources:
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

const MUGEN_DIR = 'mai';

export const MAI_HITBOX_KEYS: string[] = [
  'MAI_HISSATSU_SHINOBIBACHI', 'MAI_YUSURA_UMA',
  'MAI_KA_CHO_SEN', 'MAI_KA_CHO_SEN_C',
  'MAI_RYU_EN_BU', 'MAI_HISHO_RYU_EN_JIN',
  'DM_HAKA_OTOSHI', 'SDM_HAKA_OTOSHI',
];

type HitboxEntry = typeof HITBOX_OFFSETS[keyof typeof HITBOX_OFFSETS];

export function getMaiHitboxOffsets(): Record<string, HitboxEntry> {
  const result: Record<string, HitboxEntry> = {};
  for (const key of MAI_HITBOX_KEYS) {
    const hb = (HITBOX_OFFSETS as Record<string, HitboxEntry>)[key];
    if (hb) result[key] = hb;
  }
  return result;
}

export const MAI_ATTACK_FRAME_KEYS: string[] = [
  'MAI_HISSATSU_SHINOBIBACHI', 'MAI_YUSURA_UMA',
  'MAI_KA_CHO_SEN', 'MAI_KA_CHO_SEN_C',
  'MAI_RYU_EN_BU', 'MAI_HISHO_RYU_EN_JIN',
  'DM_HAKA_OTOSHI', 'SDM_HAKA_OTOSHI',
];

type AttackFrameEntry = typeof ATTACK_FRAMES[keyof typeof ATTACK_FRAMES];

export function getMaiAttackFrames(): Record<string, AttackFrameEntry> {
  const result: Record<string, AttackFrameEntry> = {};
  for (const key of MAI_ATTACK_FRAME_KEYS) {
    const af = (ATTACK_FRAMES as Record<string, AttackFrameEntry>)[key];
    if (af) result[key] = af;
  }
  return result;
}

// ===== MUGEN Data Queries =====

/** Maps attack keys to MUGEN action numbers from hitboxes.json */
export const MAI_MUGEN_ACTION_MAP: Record<string, string> = {
  // Normals — close stand
  CLOSE_A: '500', CLOSE_B: '530', CLOSE_C: '510', CLOSE_D: '550',
  // Normals — far stand
  STAND_A: '200', STAND_B: '530', STAND_C: '510', STAND_D: '550',
  // Normals — crouch
  CROUCH_A: '600', CROUCH_B: '610', CROUCH_C: '700', CROUCH_D: '330',
  // Normals — jump
  JUMP_A: '600', JUMP_B: '601', JUMP_C: '610', JUMP_D: '1800',
  // Command normals
  MAI_HISSATSU_SHINOBIBACHI: '1070',
  MAI_YUSURA_UMA: '1071',
  // Specials
  MAI_KA_CHO_SEN: '1012',      // Kachousen weak fan projectile
  MAI_KA_CHO_SEN_C: '1012',    // Kachousen strong fan projectile
  MAI_RYU_EN_BU: '1100',       // Ryuuenbu flame kick
  MAI_HISHO_RYU_EN_JIN: '1200', // Hishou Ryuenjin flame upper
  // DM / SDM
  DM_HAKA_OTOSHI: '3000',      // Haka Otoshi DM
  SDM_HAKA_OTOSHI: '3050',     // Haka Otoshi SDM
};

export function hasMaiMugenData(): boolean {
  return hasCharacterMugenData(MUGEN_DIR);
}

export function getMaiMugenTiming(attackKey: string): MugenAttackTiming | null {
  const action = MAI_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenAttackTiming(MUGEN_DIR, action);
}

export function getMaiMugenActionSummary(attackKey: string): MugenActionSummary | null {
  const action = MAI_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenActionSummary(MUGEN_DIR, action);
}

export function getMaiMugenActions(): string[] {
  return getCharacterMugenActions(MUGEN_DIR);
}

export function getMaiAttackTiming(attackKey: string): { startup: number; active: number; recovery: number; total: number } | null {
  const mugenTiming = getMaiMugenTiming(attackKey);
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
