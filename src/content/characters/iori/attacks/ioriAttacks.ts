/**
 * Iori Content Package — Attack Definitions
 *
 * Re-exports Iori-specific frame data from the canonical source.
 * Includes all Iori normals, command normals, specials, rekka chain, and DMs.
 *
 * Frame data keys follow AttackType enum naming.
 */
import { FRAME_DATA } from '../../../../core/frameDataConstants.js';
import type { AttackType } from '../../../../core/types.js';

/** All Iori-specific attack type keys */
export const IORI_ATTACK_KEYS: string[] = [
  // Normals (shared generic)
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
  'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
  // Command normals
  'IORI_YUMEYUMI',       // →+A 夢弾 (2-hit overhead)
  'IORI_KATANUGI',       // ↘+B 邯鄲 (low)
  'IORI_YUKIWARUI',      // 空中↓+C 百合折り (air crossup)
  // Specials
  'IORI_YAMIBARAI',      // ↓↘→+A 闇払い (weak projectile)
  'IORI_YAMIBARAI_C',    // ↓↘→+C 闇払い (strong projectile)
  'IORI_ONIYAKI',        // →↓↘+A 鬼焼き (weak upper)
  'IORI_ONIYAKI_C',      // →↓↘+C 鬼焼き (strong upper, invincible)
  'IORI_KOTOTSUKI',      // ←↙↓↘→+B 琴月陰 (dash, short)
  'IORI_KOTOTSUKI_D',    // ←↙↓↘→+D 琴月陰 (dash, long)
  'IORI_KUZUKAZE',       // ←↙↓↘→↗↓↙←+P 屑風 (command throw)
  // Rekka chain — 葵花 (Aoihana)
  'IORI_AOIHANA',        // ↓↙←+P (rekka starter, A version)
  'IORI_AOIHANA_2',      // 葵花 second hit
  'IORI_AOIHANA_3',      // 葵花 third hit (overhead HKD)
  'IORI_AOIHANA_C',      // ↓↙←+C (rekka starter, C version)
  'IORI_AOIHANA_C_2',    // 葵花 C版 second hit
  'IORI_AOIHANA_C_3',    // 葵花 C版 third hit
  // Throws
  'THROW', 'THROW_FORWARD', 'THROW_BACK',
  // CD blowback
  'STAND_CD', 'JUMP_CD',
  // DM / SDM
  'DM_YAOTOME',    // 八稚女 DM
  'SDM_YAOTOME',   // 八稚女 SDM
];

/** Iori's frame data, keyed by AttackType string */
export function getIoriFrameData(): Record<string, FrameDataEntry> {
  const result: Record<string, FrameDataEntry> = {};
  for (const key of IORI_ATTACK_KEYS) {
    const fd = (FRAME_DATA as Record<string, FrameDataEntry>)[key];
    if (fd) {
      result[key] = fd;
    }
  }
  return result;
}

/** Convenience: frame data for a single Iori attack */
export function getIoriAttackFrameData(attackKey: string): FrameDataEntry | undefined {
  return (FRAME_DATA as Record<string, FrameDataEntry>)[attackKey];
}

type FrameDataEntry = typeof FRAME_DATA[keyof typeof FRAME_DATA];
