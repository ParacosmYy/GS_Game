/**
 * Rugal Content Package — Attack Definitions
 *
 * 归属: content/characters/rugal/attacks/ — Rugal 专属攻击键保持内容包私有字符串。
 */
import { FRAME_DATA } from '../../../../core/frameDataConstants.js';

export const RUGAL_ATTACK_KEYS: string[] = [
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
  'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
  'RUGAL_DARK_SMASH',
  'RUGAL_KAISER_WAVE',
  'RUGAL_KAISER_WAVE_C',
  'RUGAL_REPPU_KEN',
  'RUGAL_REPPU_KEN_C',
  'RUGAL_GENOCIDE_CUTTER',
  'RUGAL_GENOCIDE_CUTTER_D',
  'RUGAL_DARK_BARRIER',
  'DM_RUGAL_GIGANTIC_PRESSURE',
  'DM_RUGAL_DEAD_END_SCREAMER',
];

type FrameDataEntry = typeof FRAME_DATA[keyof typeof FRAME_DATA];

export function getRugalFrameData(): Record<string, FrameDataEntry> {
  const result: Record<string, FrameDataEntry> = {};
  for (const key of RUGAL_ATTACK_KEYS) {
    const fd = (FRAME_DATA as Record<string, FrameDataEntry>)[key];
    if (fd) result[key] = fd;
  }
  return result;
}

export function getRugalAttackFrameData(attackKey: string): FrameDataEntry | undefined {
  return (FRAME_DATA as Record<string, FrameDataEntry>)[attackKey];
}
