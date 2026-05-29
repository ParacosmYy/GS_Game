/**
 * Yuri Content Package — Attack Key Registry
 */

import { FRAME_DATA } from '../../../../core/frameDataConstants.js';

type FrameDataEntry = typeof FRAME_DATA[keyof typeof FRAME_DATA];

export const YURI_ATTACK_KEYS: string[] = [
  // Normals — stand
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  // Normals — close
  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
  // Normals — crouch
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
  // Normals — jump
  'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
  // Command normals
  'YURI_UPPER_BLOCK', 'YURI_LOWER_BLOCK', 'YURI_ORI',
  // Throws
  'YURI_THROW_C', 'YURI_THROW_D', 'YURI_AIR_THROW',
  // Blowback
  'BLOWBACK', 'JUMP_BLOWBACK',
  // Specials
  'YURI_KO_OU_KEN', 'YURI_HAOH_SHO_KO_KEN', 'YURI_CHOU_UPPER',
  'YURI_HYAKU_RETSU_BINTA', 'YURI_HIEN_HOU_OU_KYAKU',
  'YURI_HISHOU_KUURETSU_ZAN', 'YURI_RAI_KEN',
  // DM
  'DM_YURI_HAOH_SHO_KO_KEN', 'DM_YURI_HIEN_HOU_OU_KYAKU',
  // SDM
  'SDM_YURI_HAOH_SHO_KO_KEN', 'SDM_YURI_HIEN_HOU_OU_KYAKU',
  // HSDM
  'HSDM_YURI_HISHOU_KUURETSU_ZAN',
];

export function getYuriFrameData(): Record<string, FrameDataEntry> {
  const result: Record<string, FrameDataEntry> = {};
  for (const key of YURI_ATTACK_KEYS) {
    const fd = (FRAME_DATA as Record<string, FrameDataEntry>)[key];
    if (fd) {
      result[key] = fd;
    }
  }
  return result;
}

export function getYuriAttackFrameData(attackKey: string): FrameDataEntry | undefined {
  return (FRAME_DATA as Record<string, FrameDataEntry>)[attackKey];
}
