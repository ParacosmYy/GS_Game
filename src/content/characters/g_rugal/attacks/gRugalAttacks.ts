/**
 * Omega Rugal Content Package - Attack Definitions
 *
 * Omega Rugal-specific keys stay private strings until core combat definitions
 * are intentionally added.
 */
import { FRAME_DATA } from '../../../../core/frameDataConstants.js';

export const G_RUGAL_ATTACK_KEYS: string[] = [
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
  'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
  'G_RUGAL_DARK_SMASH',
  'G_RUGAL_KAISER_WAVE',
  'G_RUGAL_REPPU_KEN',
  'G_RUGAL_GENOCIDE_CUTTER',
  'G_RUGAL_DARK_BARRIER',
  'DM_G_RUGAL_GIGANTIC_PRESSURE',
  'DM_G_RUGAL_DEAD_END_SCREAMER',
];

type FrameDataEntry = typeof FRAME_DATA[keyof typeof FRAME_DATA];

export function getGRugalFrameData(): Record<string, FrameDataEntry> {
  const result: Record<string, FrameDataEntry> = {};
  for (const key of G_RUGAL_ATTACK_KEYS) {
    const fd = (FRAME_DATA as Record<string, FrameDataEntry>)[key];
    if (fd) result[key] = fd;
  }
  return result;
}

export function getGRugalAttackFrameData(attackKey: string): FrameDataEntry | undefined {
  return (FRAME_DATA as Record<string, FrameDataEntry>)[attackKey];
}
