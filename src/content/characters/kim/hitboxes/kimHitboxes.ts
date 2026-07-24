/**
 * Kim Content Package — Hitbox / Hurtbox Data
 *
 * Provides Kim-specific hitbox data from two sources:
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

const MUGEN_DIR = 'cvskim';

export const KIM_HITBOX_KEYS: string[] = [
  'KIM_HISHOU_KICK', 'KIM_HANSEN', 'KIM_HISHOU',
  'KIM_HIENZAN', 'KIM_HANGETSU', 'KIM_HAKI', 'KIM_SANREN',
  'KIM_KUZUSHI_GERI', 'KIM_NERICHAGI', 'KIM_KAITEN_HIEN_ZAN',
  'DM_PHOENIX_KICK', 'DM_PHOENIX_HITEN',
  'SDM_PHOENIX_HITEN', 'SDM_PHOENIX_HITEN_EX', 'HSDM_PHOENIX_HITEN',
];

type HitboxEntry = typeof HITBOX_OFFSETS[keyof typeof HITBOX_OFFSETS];

export function getKimHitboxOffsets(): Record<string, HitboxEntry> {
  const result: Record<string, HitboxEntry> = {};
  for (const key of KIM_HITBOX_KEYS) {
    const hb = (HITBOX_OFFSETS as Record<string, HitboxEntry>)[key];
    if (hb) result[key] = hb;
  }
  return result;
}

export const KIM_ATTACK_FRAME_KEYS: string[] = [
  'KIM_HISHOU_KICK', 'KIM_HANSEN',
  'KIM_HIENZAN', 'KIM_HANGETSU', 'KIM_HAKI', 'KIM_HISHOU', 'KIM_SANREN',
  'DM_PHOENIX_KICK',
];

type AttackFrameEntry = typeof ATTACK_FRAMES[keyof typeof ATTACK_FRAMES];

export function getKimAttackFrames(): Record<string, AttackFrameEntry> {
  const result: Record<string, AttackFrameEntry> = {};
  for (const key of KIM_ATTACK_FRAME_KEYS) {
    const af = (ATTACK_FRAMES as Record<string, AttackFrameEntry>)[key];
    if (af) result[key] = af;
  }
  return result;
}

// ===== MUGEN Data Queries =====

export const KIM_MUGEN_ACTION_MAP: Record<string, string> = {
  CLOSE_A: '200', CLOSE_B: '231', CLOSE_C: '210', CLOSE_D: '240',
  STAND_A: '200', STAND_B: '231', STAND_C: '210', STAND_D: '240',
  CROUCH_A: '400', CROUCH_B: '430', CROUCH_C: '410', CROUCH_D: '440',
  JUMP_A: '600', JUMP_B: '630', JUMP_C: '610', JUMP_D: '640',
  KIM_HISHOU_KICK: '300', KIM_HANSEN: '340',
  KIM_HIENZAN: '1000', KIM_HANGETSU: '1011', KIM_HAKI: '1021',
  KIM_HISHOU: '1100', KIM_SANREN: '1200',
  DM_PHOENIX_KICK: '3000', SDM_PHOENIX_KICK: '3010',
  DM_PHOENIX_HITEN: '3100', SDM_PHOENIX_HITEN: '3100', HSDM_PHOENIX_HITEN: '3120',
};

export function hasKimMugenData(): boolean {
  return hasCharacterMugenData(MUGEN_DIR);
}

export function getKimMugenTiming(attackKey: string): MugenAttackTiming | null {
  const action = KIM_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenAttackTiming(MUGEN_DIR, action);
}

export function getKimMugenActionSummary(attackKey: string): MugenActionSummary | null {
  const action = KIM_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenActionSummary(MUGEN_DIR, action);
}

export function getKimMugenActions(): string[] {
  return getCharacterMugenActions(MUGEN_DIR);
}

export function getKimAttackTiming(attackKey: string): { startup: number; active: number; recovery: number; total: number } | null {
  const mugenTiming = getKimMugenTiming(attackKey);
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
