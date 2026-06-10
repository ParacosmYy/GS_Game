/**
 * Takuma Content Package — MUGEN Hitbox Action Map
 *
 * 归属: content/characters/takuma/hitboxes/ — 只放攻击键到 MUGEN action 的映射。
 * runtime 仍消费 public/sprites/takuma/manifest.json 与 hitboxes.json。
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

const MUGEN_DIR = 'takuma';

export const TAKUMA_MUGEN_ACTION_MAP: Record<string, string> = {
  STAND_A: '200',
  STAND_B: '230',
  STAND_C: '210',
  STAND_D: '240',
  CLOSE_A: '205',
  CLOSE_B: '235',
  CLOSE_C: '215',
  CLOSE_D: '245',
  CROUCH_A: '400',
  CROUCH_B: '430',
  CROUCH_C: '410',
  CROUCH_D: '440',
  JUMP_A: '600',
  JUMP_B: '630',
  JUMP_C: '610',
  JUMP_D: '640',
  TAKUMA_FUU_GA: '300',
  TAKUMA_GOUSOU: '310',
  TAKUMA_KO_OU_KEN: '1000',
  TAKUMA_KO_OU_KEN_C: '1010',
  TAKUMA_HAOH_SHOU_KOU_KEN: '1020',
  TAKUMA_HIEN_SHIPPUU: '1200',
  DM_RYUKO_RANBU_TAKUMA: '3000',
  SDM_RYUKO_RANBU_TAKUMA: '3200',
};

export const TAKUMA_HITBOX_KEYS: string[] = [
  'STAND_B',
  'CLOSE_B',
  'CROUCH_B',
  'JUMP_B',
];

export interface TakumaMugenHitboxRef {
  actionId: string;
  source: 'mugen-hitboxes';
}

export function getTakumaHitboxOffsets(): Record<string, TakumaMugenHitboxRef> {
  return {
    STAND_B: { actionId: '230', source: 'mugen-hitboxes' },
    CLOSE_B: { actionId: '235', source: 'mugen-hitboxes' },
    CROUCH_B: { actionId: '430', source: 'mugen-hitboxes' },
    JUMP_B: { actionId: '635', source: 'mugen-hitboxes' },
  };
}

export const TAKUMA_ATTACK_FRAME_KEYS: string[] = [
  'TAKUMA_FUU_GA',
  'TAKUMA_GOUSOU',
  'DM_RYUKO_RANBU_TAKUMA',
  'SDM_RYUKO_RANBU_TAKUMA',
];

type AttackFrameEntry = typeof ATTACK_FRAMES[keyof typeof ATTACK_FRAMES];

export function getTakumaAttackFrames(): Record<string, AttackFrameEntry> {
  const result: Record<string, AttackFrameEntry> = {};
  for (const key of TAKUMA_ATTACK_FRAME_KEYS) {
    const frames = (ATTACK_FRAMES as Record<string, AttackFrameEntry>)[key];
    if (frames) result[key] = frames;
  }
  return result;
}

export function hasTakumaMugenData(): boolean {
  return hasCharacterMugenData(MUGEN_DIR);
}

export function getTakumaMugenTiming(attackKey: string): MugenAttackTiming | null {
  const action = TAKUMA_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenAttackTiming(MUGEN_DIR, action);
}

export function getTakumaMugenActionSummary(attackKey: string): MugenActionSummary | null {
  const action = TAKUMA_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenActionSummary(MUGEN_DIR, action);
}

export function getTakumaMugenActions(): string[] {
  return getCharacterMugenActions(MUGEN_DIR);
}

export function getTakumaAttackTiming(attackKey: string): { startup: number; active: number; recovery: number; total: number } | null {
  const mugenTiming = getTakumaMugenTiming(attackKey);
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
