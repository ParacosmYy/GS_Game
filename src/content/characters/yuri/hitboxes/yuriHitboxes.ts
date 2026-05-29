/**
 * Yuri Content Package — Hitbox Data + MUGEN Clsn Integration
 */

import { HITBOX_OFFSETS } from '../../../../core/hitboxConstants.js';
import { ATTACK_FRAMES } from '../../../../core/attackFrames.js';
import {
  getMugenAttackTiming,
  getMugenActionSummary,
  hasCharacterMugenData,
  type MugenAttackTiming,
  type MugenActionSummary,
} from '../../../../rendering/sprites/shared/mugenHitboxQuery.js';

const MUGEN_DIR = 'cvsyuri';

export const YURI_HITBOX_KEYS: string[] = [
  'YURI_KO_OU_KEN', 'YURI_HAOH_SHO_KO_KEN', 'YURI_CHOU_UPPER',
  'YURI_HYAKU_RETSU_BINTA', 'YURI_HIEN_HOU_OU_KYAKU',
  'YURI_HISHOU_KUURETSU_ZAN', 'YURI_RAI_KEN',
];

type HitboxEntry = typeof HITBOX_OFFSETS[keyof typeof HITBOX_OFFSETS];

export function getYuriHitboxOffsets(): Record<string, HitboxEntry> {
  const result: Record<string, HitboxEntry> = {};
  for (const key of YURI_HITBOX_KEYS) {
    const hb = (HITBOX_OFFSETS as Record<string, HitboxEntry>)[key];
    if (hb) result[key] = hb;
  }
  return result;
}

export const YURI_ATTACK_FRAME_KEYS: string[] = [
  'YURI_KO_OU_KEN', 'YURI_HAOH_SHO_KO_KEN', 'YURI_CHOU_UPPER',
  'YURI_HYAKU_RETSU_BINTA', 'YURI_HIEN_HOU_OU_KYAKU',
  'YURI_HISHOU_KUURETSU_ZAN', 'YURI_RAI_KEN',
  'DM_YURI_HAOH_SHO_KO_KEN', 'DM_YURI_HIEN_HOU_OU_KYAKU',
  'SDM_YURI_HAOH_SHO_KO_KEN', 'SDM_YURI_HIEN_HOU_OU_KYAKU',
  'HSDM_YURI_HISHOU_KUURETSU_ZAN',
];

type AttackFrameEntry = typeof ATTACK_FRAMES[keyof typeof ATTACK_FRAMES];

export function getYuriAttackFrames(): Record<string, AttackFrameEntry> {
  const result: Record<string, AttackFrameEntry> = {};
  for (const key of YURI_ATTACK_FRAME_KEYS) {
    const af = (ATTACK_FRAMES as Record<string, AttackFrameEntry>)[key];
    if (af) result[key] = af;
  }
  return result;
}

export const YURI_MUGEN_ACTION_MAP: Record<string, string> = {
  STAND_A: '200', STAND_B: '210', STAND_C: '220', STAND_D: '230',
  CLOSE_A: '201', CLOSE_B: '211', CLOSE_C: '221', CLOSE_D: '231',
  CROUCH_A: '400', CROUCH_B: '410', CROUCH_C: '420', CROUCH_D: '430',
  JUMP_A: '600', JUMP_B: '610', JUMP_C: '620', JUMP_D: '630',
  YURI_UPPER_BLOCK: '300',
  YURI_THROW_C: '800', YURI_THROW_D: '810',
  YURI_AIR_THROW: '875',
  BLOWBACK: '250',
  YURI_KO_OU_KEN: '1000',
  YURI_HAOH_SHO_KO_KEN: '1100',
  YURI_CHOU_UPPER: '1200',
  YURI_HIEN_HOU_OU_KYAKU: '1300',
  YURI_HISHOU_KUURETSU_ZAN: '1400',
  YURI_HYAKU_RETSU_BINTA: '850',
  DM_YURI_HAOH_SHO_KO_KEN: '3000',
  DM_YURI_HIEN_HOU_OU_KYAKU: '3200',
  SDM_YURI_HAOH_SHO_KO_KEN: '3100',
  SDM_YURI_HIEN_HOU_OU_KYAKU: '3200',
};

export function hasYuriMugenData(): boolean {
  return hasCharacterMugenData(MUGEN_DIR);
}

export function getYuriMugenTiming(attackKey: string): MugenAttackTiming | null {
  const action = YURI_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenAttackTiming(MUGEN_DIR, action);
}

export function getYuriMugenActionSummary(attackKey: string): MugenActionSummary | null {
  const action = YURI_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenActionSummary(MUGEN_DIR, action);
}

export function getYuriMugenActions(): string[] {
  if (!hasCharacterMugenData(MUGEN_DIR)) return [];
  return Object.keys(YURI_MUGEN_ACTION_MAP);
}

export function getYuriAttackTiming(attackKey: string): { startup: number; active: number; recovery: number; total: number } | null {
  const mugenTiming = getYuriMugenTiming(attackKey);
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
