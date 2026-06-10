/**
 * Kensou Content Package — Attack Definitions
 *
 * 归属: content/characters/kensou/attacks/ — 只放 Kensou 内容包攻击键。
 */
import { FRAME_DATA } from '../../../../core/frameDataConstants.js';

export const KENSOU_ATTACK_KEYS: string[] = [
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
  'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
  'KENSOU_BAKYAKU',
  'KENSOU_KAKUHI',
  'KENSOU_CHOU_KYUU_DAN',
  'KENSOU_CHOU_KYUU_DAN_C',
  'KENSOU_RYURENGA_TEN',
  'KENSOU_RYURENGA_CHI',
  'KENSOU_RYUSOU_GEKI',
  'DM_SHIN_CHOU_KYUU_DAN',
  'SDM_SHIN_CHOU_KYUU_DAN',
];

type FrameDataEntry = typeof FRAME_DATA[keyof typeof FRAME_DATA];

export function getKensouFrameData(): Record<string, FrameDataEntry> {
  const result: Record<string, FrameDataEntry> = {};
  for (const key of KENSOU_ATTACK_KEYS) {
    const fd = (FRAME_DATA as Record<string, FrameDataEntry>)[key];
    if (fd) result[key] = fd;
  }
  return result;
}

export function getKensouAttackFrameData(attackKey: string): FrameDataEntry | undefined {
  return (FRAME_DATA as Record<string, FrameDataEntry>)[attackKey];
}
