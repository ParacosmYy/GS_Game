/**
 * Kensou Content Package — MUGEN Hitbox Action Map
 *
 * 归属: content/characters/kensou/hitboxes/ — 只放攻击键到 MUGEN action 的映射。
 */
import { ATTACK_FRAMES } from '../../../../core/attackFrames.js';
import {
  getMugenAttackTiming,
  getMugenActionSummary,
  getCharacterMugenActions,
  hasCharacterMugenData,
  type MugenAttackTiming,
  type MugenActionSummary,
} from '../../../../rendering/sprites/shared/mugenHitboxQuery.js';

const MUGEN_DIR = 'kensou';

export const KENSOU_MUGEN_ACTION_MAP: Record<string, string> = {
  STAND_A: '200',
  STAND_B: '240',
  STAND_C: '210',
  STAND_D: '235',
  CLOSE_A: '220',
  CLOSE_B: '250',
  CLOSE_C: '230',
  CLOSE_D: '260',
  CROUCH_A: '400',
  CROUCH_B: '430',
  CROUCH_C: '410',
  CROUCH_D: '440',
  JUMP_A: '600',
  JUMP_B: '630',
  JUMP_C: '610',
  JUMP_D: '640',
  KENSOU_BAKYAKU: '300',
  KENSOU_KAKUHI: '350',
  KENSOU_CHOU_KYUU_DAN: '1000',
  KENSOU_CHOU_KYUU_DAN_C: '1010',
  KENSOU_RYURENGA_TEN: '1050',
  KENSOU_RYURENGA_CHI: '1060',
  KENSOU_RYUSOU_GEKI: '1100',
  DM_SHIN_CHOU_KYUU_DAN: '3000',
  SDM_SHIN_CHOU_KYUU_DAN: '3100',
};

export const KENSOU_HITBOX_KEYS: string[] = [
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
  'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
  'KENSOU_BAKYAKU', 'KENSOU_KAKUHI',
  'KENSOU_RYURENGA_TEN', 'KENSOU_RYURENGA_CHI',
  'DM_SHIN_CHOU_KYUU_DAN',
];

export interface KensouMugenHitboxRef {
  actionId: string;
  source: 'mugen-hitboxes';
}

export function getKensouHitboxOffsets(): Record<string, KensouMugenHitboxRef> {
  return {
    STAND_A: { actionId: '200', source: 'mugen-hitboxes' },
    STAND_B: { actionId: '240', source: 'mugen-hitboxes' },
    STAND_C: { actionId: '210', source: 'mugen-hitboxes' },
    STAND_D: { actionId: '235', source: 'mugen-hitboxes' },
    CROUCH_A: { actionId: '400', source: 'mugen-hitboxes' },
    CROUCH_B: { actionId: '430', source: 'mugen-hitboxes' },
    CROUCH_C: { actionId: '410', source: 'mugen-hitboxes' },
    CROUCH_D: { actionId: '440', source: 'mugen-hitboxes' },
    JUMP_A: { actionId: '600', source: 'mugen-hitboxes' },
    JUMP_B: { actionId: '630', source: 'mugen-hitboxes' },
    JUMP_C: { actionId: '610', source: 'mugen-hitboxes' },
    JUMP_D: { actionId: '640', source: 'mugen-hitboxes' },
    KENSOU_BAKYAKU: { actionId: '300', source: 'mugen-hitboxes' },
    KENSOU_KAKUHI: { actionId: '350', source: 'mugen-hitboxes' },
    KENSOU_CHOU_KYUU_DAN: { actionId: '1000', source: 'mugen-hitboxes' },
    KENSOU_CHOU_KYUU_DAN_C: { actionId: '1010', source: 'mugen-hitboxes' },
    KENSOU_RYURENGA_TEN: { actionId: '1050', source: 'mugen-hitboxes' },
    KENSOU_RYURENGA_CHI: { actionId: '1060', source: 'mugen-hitboxes' },
    KENSOU_RYUSOU_GEKI: { actionId: '1100', source: 'mugen-hitboxes' },
    DM_SHIN_CHOU_KYUU_DAN: { actionId: '3000', source: 'mugen-hitboxes' },
    SDM_SHIN_CHOU_KYUU_DAN: { actionId: '3100', source: 'mugen-hitboxes' },
  };
}

export const KENSOU_ATTACK_FRAME_KEYS: string[] = ['KENSOU_BAKYAKU', 'KENSOU_KAKUHI'];

type AttackFrameEntry = typeof ATTACK_FRAMES[keyof typeof ATTACK_FRAMES];

export function getKensouAttackFrames(): Record<string, AttackFrameEntry> {
  const result: Record<string, AttackFrameEntry> = {};
  for (const key of KENSOU_ATTACK_FRAME_KEYS) {
    const frames = (ATTACK_FRAMES as Record<string, AttackFrameEntry>)[key];
    if (frames) result[key] = frames;
  }
  return result;
}

export function hasKensouMugenData(): boolean {
  return hasCharacterMugenData(MUGEN_DIR);
}

export function getKensouMugenTiming(attackKey: string): MugenAttackTiming | null {
  const action = KENSOU_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenAttackTiming(MUGEN_DIR, action);
}

export function getKensouMugenActionSummary(attackKey: string): MugenActionSummary | null {
  const action = KENSOU_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenActionSummary(MUGEN_DIR, action);
}

export function getKensouMugenActions(): string[] {
  return getCharacterMugenActions(MUGEN_DIR);
}

export function getKensouAttackTiming(attackKey: string): { startup: number; active: number; recovery: number; total: number } | null {
  const mugenTiming = getKensouMugenTiming(attackKey);
  if (mugenTiming) return mugenTiming;
  const legacyFrames = (ATTACK_FRAMES as Record<string, AttackFrameEntry>)[attackKey];
  if (!legacyFrames) return null;
  let startup = 0;
  let active = 0;
  let recovery = 0;
  for (const frame of legacyFrames) {
    if (frame.attack) active += 1;
    else if (active > 0) recovery += 1;
    else startup += 1;
  }
  return { startup, active, recovery, total: startup + active + recovery };
}
