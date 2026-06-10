/**
 * Omega Rugal Content Package - MUGEN Hitbox Action Map
 *
 * Attack keys map to cvsg_rugal actions generated from MUGEN AIR Clsn data.
 */
import {
  getMugenAttackTiming,
  getMugenActionSummary,
  getCharacterMugenActions,
  hasCharacterMugenData,
  type MugenAttackTiming,
  type MugenActionSummary,
} from '../../../../rendering/sprites/shared/mugenHitboxQuery.js';

const MUGEN_DIR = 'cvsg_rugal';

export const G_RUGAL_MUGEN_ACTION_MAP: Record<string, string> = {
  STAND_A: '200',
  STAND_B: '230',
  STAND_C: '210',
  STAND_D: '240',
  CLOSE_A: '220',
  CLOSE_B: '250',
  CLOSE_C: '210',
  CLOSE_D: '240',
  CROUCH_A: '400',
  CROUCH_B: '430',
  CROUCH_C: '410',
  CROUCH_D: '440',
  JUMP_A: '600',
  JUMP_B: '630',
  JUMP_C: '610',
  JUMP_D: '640',
  G_RUGAL_DARK_SMASH: '900',
  G_RUGAL_KAISER_WAVE: '1100',
  G_RUGAL_REPPU_KEN: '1200',
  G_RUGAL_GENOCIDE_CUTTER: '1400',
  G_RUGAL_DARK_BARRIER: '1700',
  DM_G_RUGAL_GIGANTIC_PRESSURE: '3000',
  DM_G_RUGAL_DEAD_END_SCREAMER: '3100',
};

export const G_RUGAL_HITBOX_KEYS: string[] = Object.keys(G_RUGAL_MUGEN_ACTION_MAP);

export interface GRugalMugenHitboxRef {
  actionId: string;
  source: 'mugen-hitboxes';
}

export function getGRugalHitboxOffsets(): Record<string, GRugalMugenHitboxRef> {
  const result: Record<string, GRugalMugenHitboxRef> = {};
  for (const [key, actionId] of Object.entries(G_RUGAL_MUGEN_ACTION_MAP)) {
    result[key] = { actionId, source: 'mugen-hitboxes' };
  }
  return result;
}

export const G_RUGAL_ATTACK_FRAME_KEYS: string[] = [];

export function getGRugalAttackFrames(): Record<string, never> {
  return {};
}

export function hasGRugalMugenData(): boolean {
  return hasCharacterMugenData(MUGEN_DIR);
}

export function getGRugalMugenTiming(attackKey: string): MugenAttackTiming | null {
  const action = G_RUGAL_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenAttackTiming(MUGEN_DIR, action);
}

export function getGRugalMugenActionSummary(attackKey: string): MugenActionSummary | null {
  const action = G_RUGAL_MUGEN_ACTION_MAP[attackKey];
  if (!action) return null;
  return getMugenActionSummary(MUGEN_DIR, action);
}

export function getGRugalMugenActions(): string[] {
  return getCharacterMugenActions(MUGEN_DIR);
}

export function getGRugalAttackTiming(attackKey: string): MugenAttackTiming | null {
  return getGRugalMugenTiming(attackKey);
}
