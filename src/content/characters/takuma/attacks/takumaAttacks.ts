/**
 * Takuma Content Package — Attack Definitions
 *
 * 归属: content/characters/takuma/attacks/ — 只放 Takuma 内容包攻击键。
 * 真实动作来源通过 hitboxes/takumaHitboxes.ts 的 MUGEN action map 对齐 manifest。
 */
import { FRAME_DATA } from '../../../../core/frameDataConstants.js';

export const TAKUMA_ATTACK_KEYS: string[] = [
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
  'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
  'TAKUMA_FUU_GA',
  'TAKUMA_GOUSOU',
  'TAKUMA_KO_OU_KEN',
  'TAKUMA_KO_OU_KEN_C',
  'TAKUMA_HAOH_SHOU_KOU_KEN',
  'TAKUMA_HIEN_SHIPPUU',
  'DM_RYUKO_RANBU_TAKUMA',
  'SDM_RYUKO_RANBU_TAKUMA',
];

type FrameDataEntry = typeof FRAME_DATA[keyof typeof FRAME_DATA];

export function getTakumaFrameData(): Record<string, FrameDataEntry> {
  const result: Record<string, FrameDataEntry> = {};
  for (const key of TAKUMA_ATTACK_KEYS) {
    const fd = (FRAME_DATA as Record<string, FrameDataEntry>)[key];
    if (fd) result[key] = fd;
  }
  return result;
}

export function getTakumaAttackFrameData(attackKey: string): FrameDataEntry | undefined {
  return (FRAME_DATA as Record<string, FrameDataEntry>)[attackKey];
}
