/**
 * Kyo Content Package — Hitbox / Hurtbox Data
 *
 * Provides Kyo-specific hitbox data from two sources:
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

const MUGEN_DIR = 'cvskyo';

/** Kyo-specific hitbox offset keys */
export const KYO_HITBOX_KEYS: string[] = [
  'CMD_GOFU_YOU', 'CMD_88SHIKI', 'CMD_NARAKU',
  'KYO_75KAI', 'KYO_75KAI_2', 'KYO_RED_KICK',
  'KYO_ONIYAKI', 'KYO_ONIYAKI_C',
  'KYO_YAMIBARAI', 'KYO_YAMIBARAI_C',
  'KYO_ARAGAMI', 'KYO_ARAGAMI_KONOKIZU', 'KYO_ARAGAMI_YANOSABI',
  'KYO_NANASE', 'KYO_KOTO_TSUKI', 'KYO_YAKISOGI',
  'KYO_DOKUGAMI', 'KYO_TSUMIYOMI', 'KYO_BATSUYOMI',
  'DM_OROCHINAGI', 'SDM_OROCHINAGI', 'HSDM_OROCHINAGI',
];

type HitboxEntry = typeof HITBOX_OFFSETS[keyof typeof HITBOX_OFFSETS];

/** Get all Kyo hitbox offsets (legacy) */
export function getKyoHitboxOffsets(): Record<string, HitboxEntry> {
  const result: Record<string, HitboxEntry> = {};
  for (const key of KYO_HITBOX_KEYS) {
    const hb = (HITBOX_OFFSETS as Record<string, HitboxEntry>)[key];
    if (hb) result[key] = hb;
  }
  return result;
}

/** Kyo-specific attack frame keys (per-frame hitbox data) */
export const KYO_ATTACK_FRAME_KEYS: string[] = [
  'CMD_GOFU_YOU', 'CMD_88SHIKI', 'CMD_NARAKU',
  'KYO_75KAI', 'KYO_75KAI_2', 'KYO_RED_KICK',
  'KYO_ONIYAKI', 'KYO_ONIYAKI_C',
  'KYO_YAMIBARAI', 'KYO_YAMIBARAI_C',
  'KYO_ARAGAMI', 'KYO_ARAGAMI_KONOKIZU', 'KYO_ARAGAMI_YANOSABI',
  'KYO_NANASE', 'KYO_KOTO_TSUKI', 'KYO_YAKISOGI',
  'KYO_DOKUGAMI', 'KYO_TSUMIYOMI', 'KYO_BATSUYOMI',
  'DM_OROCHINAGI', 'SDM_OROCHINAGI', 'HSDM_OROCHINAGI',
];

type AttackFrameEntry = typeof ATTACK_FRAMES[keyof typeof ATTACK_FRAMES];

/** Get all Kyo per-frame attack hitbox data (legacy) */
export function getKyoAttackFrames(): Record<string, AttackFrameEntry> {
  const result: Record<string, AttackFrameEntry> = {};
  for (const key of KYO_ATTACK_FRAME_KEYS) {
    const af = (ATTACK_FRAMES as Record<string, AttackFrameEntry>)[key];
    if (af) result[key] = af;
  }
  return result;
}

// ===== MUGEN Data Queries =====

/** AttackType → MUGEN action number mapping for Kyo (Warusaki3 cvskyo) */
export const KYO_MUGEN_ACTION_MAP: Record<string, string> = {
  CLOSE_A: '200', CLOSE_B: '230', CLOSE_C: '210', CLOSE_D: '240',
  STAND_B: '231', STAND_C: '211', STAND_D: '241',
  CROUCH_A: '400', CROUCH_B: '430', CROUCH_C: '410', CROUCH_D: '440',
  JUMP_A: '600', JUMP_B: '630', JUMP_C: '610', JUMP_D: '640',
  CMD_NARAKU: '620',
  CMD_GOFU_YOU: '2400', CMD_88SHIKI: '500',
  KYO_ONIYAKI: '1800', KYO_ONIYAKI_C: '1810',
  KYO_YAMIBARAI: '2300', KYO_YAMIBARAI_C: '2310',
  KYO_RED_KICK: '2200',
  KYO_75KAI: '2100', KYO_75KAI_2: '2100',
  KYO_ARAGAMI: '1000', KYO_ARAGAMI_KONOKIZU: '1400',
  KYO_ARAGAMI_YANOSABI: '1300', KYO_NANASE: '1200',
  KYO_KOTO_TSUKI: '1100', KYO_YAKISOGI: '1400',
  KYO_DOKUGAMI: '1500', KYO_TSUMIYOMI: '1600', KYO_BATSUYOMI: '1700',
  DM_OROCHINAGI: '3000', SDM_OROCHINAGI: '3000', HSDM_OROCHINAGI: '3020',
};

/** Check if Kyo has MUGEN hitbox data available */
export function hasKyoMugenData(): boolean {
  return hasCharacterMugenData(MUGEN_DIR);
}

/** Get MUGEN attack timing for a Kyo attack */
export function getKyoMugenTiming(attackKey: string): MugenAttackTiming | null {
  const action = KYO_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenAttackTiming(MUGEN_DIR, action);
}

/** Get MUGEN action summary for a Kyo attack */
export function getKyoMugenActionSummary(attackKey: string): MugenActionSummary | null {
  const action = KYO_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenActionSummary(MUGEN_DIR, action);
}

/** Get all MUGEN actions available for Kyo */
export function getKyoMugenActions(): string[] {
  return getCharacterMugenActions(MUGEN_DIR);
}

/** Get attack timing from MUGEN data, falling back to legacy frame data */
export function getKyoAttackTiming(attackKey: string): { startup: number; active: number; recovery: number; total: number } | null {
  const mugenTiming = getKyoMugenTiming(attackKey);
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
