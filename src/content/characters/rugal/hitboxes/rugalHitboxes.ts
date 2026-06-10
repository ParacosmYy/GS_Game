/**
 * Rugal Content Package — MUGEN Hitbox Action Map
 *
 * 归属: content/characters/rugal/hitboxes/ — 只放攻击键到 MUGEN action 的映射。
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

const MUGEN_DIR = 'cvsrugal';

export const RUGAL_MUGEN_ACTION_MAP: Record<string, string> = {
  STAND_A: '200',
  STAND_B: '230',
  STAND_C: '210',
  STAND_D: '240',
  CLOSE_A: '220',
  CLOSE_B: '250',
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
  RUGAL_DARK_SMASH: '900',
  RUGAL_KAISER_WAVE: '1100',
  RUGAL_KAISER_WAVE_C: '1110',
  RUGAL_REPPU_KEN: '1200',
  RUGAL_REPPU_KEN_C: '1210',
  RUGAL_GENOCIDE_CUTTER: '1400',
  RUGAL_GENOCIDE_CUTTER_D: '1410',
  RUGAL_DARK_BARRIER: '1700',
  DM_RUGAL_GIGANTIC_PRESSURE: '3000',
  DM_RUGAL_DEAD_END_SCREAMER: '3100',
};

export const RUGAL_HITBOX_KEYS: string[] = Object.keys(RUGAL_MUGEN_ACTION_MAP);

export interface RugalMugenHitboxRef {
  actionId: string;
  source: 'mugen-hitboxes';
}

export function getRugalHitboxOffsets(): Record<string, RugalMugenHitboxRef> {
  const result: Record<string, RugalMugenHitboxRef> = {};
  for (const [key, actionId] of Object.entries(RUGAL_MUGEN_ACTION_MAP)) {
    result[key] = { actionId, source: 'mugen-hitboxes' };
  }
  return result;
}

export const RUGAL_ATTACK_FRAME_KEYS: string[] = [];

type AttackFrameEntry = typeof ATTACK_FRAMES[keyof typeof ATTACK_FRAMES];

export function getRugalAttackFrames(): Record<string, AttackFrameEntry> {
  return {};
}

export function hasRugalMugenData(): boolean {
  return hasCharacterMugenData(MUGEN_DIR);
}

export function getRugalMugenTiming(attackKey: string): MugenAttackTiming | null {
  const action = RUGAL_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenAttackTiming(MUGEN_DIR, action);
}

export function getRugalMugenActionSummary(attackKey: string): MugenActionSummary | null {
  const action = RUGAL_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenActionSummary(MUGEN_DIR, action);
}

export function getRugalMugenActions(): string[] {
  return getCharacterMugenActions(MUGEN_DIR);
}

export function getRugalAttackTiming(attackKey: string): MugenAttackTiming | null {
  return getRugalMugenTiming(attackKey);
}
