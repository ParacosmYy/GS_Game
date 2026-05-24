/**
 * Per-Frame Hitbox Data (逐帧判定框)
 *
 * 设计原则（参照 SNK KOF2002）:
 * 1. 出招帧(active)的攻击框随帧变化，模拟"挥拳轨迹"
 * 2. 出招时受击框(bodyOverride)可缩小，模拟"低姿"/"侧身"
 * 3. 重攻击有多帧判定，每帧框不同
 * 4. 必杀技可以有多段判定框（如升龙拳的上升段和下降段）
 *
 * 未在此表中定义的攻击会自动降级到 HITBOX_OFFSETS 的单框判定
 */
import type { AttackFrame, AttackFrameTable } from './types.js';
import { AttackType } from './types.js';

const F: (attack: Array<{ ox: number; oy: number; w: number; h: number }>, body?: { ox: number; oy: number; w: number; h: number }) => AttackFrame =
  (attack, body) => ({ attack, bodyOverride: body ?? null });

// ===== 站立远距离攻击 (Far Stand) =====
// 出招时身体前倾，攻击框随帧前移
const FAR_STAND_A_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -75, w: 35, h: 22 }]),  // frame 0: 手刚伸出
  F([{ ox: 48, oy: -73, w: 40, h: 22 }]),  // frame 1: 完全伸展
  F([{ ox: 48, oy: -73, w: 40, h: 22 }]),  // frame 2: 保持
];

const FAR_STAND_B_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -35, w: 40, h: 28 }]),
  F([{ ox: 45, oy: -33, w: 48, h: 30 }]),
  F([{ ox: 45, oy: -33, w: 48, h: 30 }]),
];

const FAR_STAND_C_FRAMES: AttackFrame[] = [
  // 蓄力帧：身体后仰，受击框缩小（侧身）
  F([{ ox: 30, oy: -70, w: 30, h: 30 }], { ox: 5, oy: 0, w: -10, h: 0 }),
  // 出拳帧：攻击框快速前伸
  F([{ ox: 55, oy: -68, w: 50, h: 35 }]),
  // 完全伸展
  F([{ ox: 58, oy: -65, w: 55, h: 35 }]),
  // 收回
  F([{ ox: 50, oy: -70, w: 45, h: 30 }]),
];

const FAR_STAND_D_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -30, w: 40, h: 35 }]),
  F([{ ox: 45, oy: -28, w: 55, h: 40 }], { ox: 5, oy: -5, w: -15, h: -20 }),
  F([{ ox: 48, oy: -25, w: 60, h: 40 }]),
  F([{ ox: 45, oy: -28, w: 55, h: 38 }]),
  F([{ ox: 40, oy: -30, w: 45, h: 35 }]),
];

// ===== 站立近距离攻击 (Close Stand) =====
// 近距离攻击出招快，框更近更小
const CLOSE_A_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -72, w: 30, h: 22 }]),
  F([{ ox: 40, oy: -70, w: 32, h: 22 }]),
  F([{ ox: 40, oy: -70, w: 32, h: 22 }]),
];

const CLOSE_B_FRAMES: AttackFrame[] = [
  F([{ ox: 32, oy: -25, w: 35, h: 22 }]),
  F([{ ox: 38, oy: -23, w: 38, h: 22 }]),
  F([{ ox: 38, oy: -23, w: 38, h: 22 }]),
];

const CLOSE_C_FRAMES: AttackFrame[] = [
  // 快速出拳，出招帧受击框缩小
  F([{ ox: 40, oy: -65, w: 42, h: 32 }], { ox: 3, oy: 0, w: -10, h: 0 }),
  F([{ ox: 45, oy: -63, w: 48, h: 35 }]),
  F([{ ox: 45, oy: -63, w: 48, h: 35 }]),
];

const CLOSE_D_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -25, w: 40, h: 30 }]),
  F([{ ox: 42, oy: -23, w: 48, h: 35 }]),
  F([{ ox: 42, oy: -23, w: 48, h: 35 }]),
  F([{ ox: 40, oy: -25, w: 45, h: 30 }]),
];

// ===== 命令通常技 =====
const CMD_GOFUYOU_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -55, w: 40, h: 30 }]),
  F([{ ox: 45, oy: -52, w: 48, h: 35 }]),
  F([{ ox: 48, oy: -50, w: 50, h: 35 }]),
  F([{ ox: 45, oy: -55, w: 45, h: 30 }]),
];

const CMD_88SHIKI_FRAMES: AttackFrame[] = [
  F([{ ox: 42, oy: -8, w: 45, h: 16 }]),
  F([{ ox: 50, oy: -6, w: 55, h: 18 }]),
  F([{ ox: 50, oy: -6, w: 55, h: 18 }]),
];

const CMD_NARAKU_FRAMES: AttackFrame[] = [
  F([{ ox: 25, oy: -35, w: 40, h: 35 }]),
  F([{ ox: 30, oy: -30, w: 45, h: 40 }]),
  F([{ ox: 30, oy: -25, w: 45, h: 45 }]),
  F([{ ox: 28, oy: -20, w: 42, h: 40 }]),
  F([{ ox: 25, oy: -15, w: 40, h: 35 }]),
];

// ===== 蹲下攻击 =====
const CROUCH_A_FRAMES: AttackFrame[] = [
  F([{ ox: 45, oy: -35, w: 35, h: 18 }]),
  F([{ ox: 50, oy: -33, w: 38, h: 18 }]),
  F([{ ox: 50, oy: -33, w: 38, h: 18 }]),
];

const CROUCH_B_FRAMES: AttackFrame[] = [
  F([{ ox: 45, oy: -15, w: 42, h: 18 }]),
  F([{ ox: 50, oy: -13, w: 48, h: 18 }]),
  F([{ ox: 50, oy: -13, w: 48, h: 18 }]),
];

const CROUCH_C_FRAMES: AttackFrame[] = [
  // 蹲重拳：从下往上挥，受击框降低
  F([{ ox: 30, oy: -60, w: 40, h: 35 }], { ox: 0, oy: 10, w: 0, h: -20 }),
  F([{ ox: 42, oy: -55, w: 50, h: 38 }]),
  F([{ ox: 45, oy: -50, w: 52, h: 40 }]),
  F([{ ox: 40, oy: -55, w: 48, h: 38 }]),
];

const CROUCH_D_FRAMES: AttackFrame[] = [
  // 扫堂腿：低姿，受击框大幅缩小
  F([{ ox: 40, oy: -10, w: 45, h: 15 }], { ox: 0, oy: 15, w: 0, h: -35 }),
  F([{ ox: 50, oy: -8, w: 55, h: 18 }], { ox: 0, oy: 15, w: 0, h: -35 }),
  F([{ ox: 52, oy: -8, w: 58, h: 18 }], { ox: 0, oy: 15, w: 0, h: -35 }),
  F([{ ox: 50, oy: -10, w: 52, h: 16 }], { ox: 0, oy: 10, w: 0, h: -25 }),
];

// ===== 跳跃攻击 =====
const JUMP_A_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -45, w: 35, h: 28 }]),
  F([{ ox: 35, oy: -42, w: 38, h: 28 }]),
  F([{ ox: 35, oy: -42, w: 38, h: 28 }]),
  F([{ ox: 33, oy: -45, w: 35, h: 28 }]),
  F([{ ox: 33, oy: -45, w: 35, h: 28 }]),
];

const JUMP_B_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -30, w: 40, h: 32 }]),
  F([{ ox: 35, oy: -28, w: 45, h: 35 }]),
  F([{ ox: 35, oy: -28, w: 45, h: 35 }]),
  F([{ ox: 33, oy: -30, w: 42, h: 32 }]),
  F([{ ox: 33, oy: -30, w: 42, h: 32 }]),
];

const JUMP_C_FRAMES: AttackFrame[] = [
  F([{ ox: 25, oy: -50, w: 42, h: 35 }]),
  F([{ ox: 30, oy: -48, w: 48, h: 38 }]),
  F([{ ox: 32, oy: -45, w: 50, h: 40 }]),
  F([{ ox: 30, oy: -48, w: 48, h: 38 }]),
  F([{ ox: 28, oy: -50, w: 45, h: 36 }]),
  F([{ ox: 28, oy: -50, w: 45, h: 36 }]),
];

const JUMP_D_FRAMES: AttackFrame[] = [
  F([{ ox: 25, oy: -35, w: 42, h: 35 }]),
  F([{ ox: 30, oy: -32, w: 48, h: 38 }]),
  F([{ ox: 32, oy: -30, w: 50, h: 40 }]),
  F([{ ox: 30, oy: -32, w: 48, h: 38 }]),
  F([{ ox: 28, oy: -35, w: 45, h: 36 }]),
  F([{ ox: 28, oy: -35, w: 45, h: 36 }]),
];

// ===== 投技 =====
const THROW_FRAMES: AttackFrame[] = [
  F([{ ox: 10, oy: -60, w: 70, h: 60 }]),
  F([{ ox: 10, oy: -60, w: 70, h: 60 }]),
];

// ===== CD 击飞攻击 =====
const STAND_CD_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -50, w: 50, h: 40 }]),
  F([{ ox: 45, oy: -48, w: 58, h: 42 }]),
  F([{ ox: 48, oy: -45, w: 62, h: 45 }]),
  F([{ ox: 45, oy: -50, w: 55, h: 40 }]),
];

const JUMP_CD_FRAMES: AttackFrame[] = [
  F([{ ox: 32, oy: -35, w: 48, h: 38 }]),
  F([{ ox: 40, oy: -32, w: 55, h: 40 }]),
  F([{ ox: 42, oy: -30, w: 58, h: 42 }]),
  F([{ ox: 40, oy: -33, w: 52, h: 38 }]),
  F([{ ox: 38, oy: -35, w: 48, h: 36 }]),
];

// ===== 必杀技 =====
const SPECIAL_UPPER_FRAMES: AttackFrame[] = [
  // 升龙拳：上升段，受击框大幅缩小（无敌感）
  F([{ ox: 25, oy: -80, w: 40, h: 45 }], { ox: 5, oy: -10, w: -15, h: -30 }),
  F([{ ox: 30, oy: -85, w: 42, h: 48 }], { ox: 5, oy: -10, w: -15, h: -30 }),
  // 下降段，受击框恢复，攻击框变小
  F([{ ox: 28, oy: -75, w: 38, h: 40 }]),
  F([{ ox: 25, oy: -65, w: 35, h: 35 }]),
  F([{ ox: 22, oy: -55, w: 30, h: 30 }]),
  F([{ ox: 20, oy: -50, w: 28, h: 28 }]),
];

const SPECIAL_PROJECTILE_FRAMES: AttackFrame[] = [
  // 发波：只在第一帧有手部攻击判定
  F([{ ox: 50, oy: -60, w: 35, h: 28 }]),
];

// ===== 角色专属必杀技 =====

// 京：75式·改（两段踢）
const KYO_75KAI_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -30, w: 45, h: 28 }]),
  F([{ ox: 45, oy: -28, w: 48, h: 30 }]),
  F([{ ox: 45, oy: -28, w: 48, h: 30 }]),
  F([{ ox: 42, oy: -30, w: 45, h: 28 }]),
];

const KYO_75KAI_2_FRAMES: AttackFrame[] = [
  F([{ ox: 42, oy: -35, w: 48, h: 30 }]),
  F([{ ox: 48, oy: -32, w: 52, h: 32 }]),
  F([{ ox: 48, oy: -32, w: 52, h: 32 }]),
  F([{ ox: 45, oy: -35, w: 48, h: 30 }]),
];

// 京：R.E.D. Kick（空中旋转踢）
const KYO_RED_KICK_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -50, w: 45, h: 35 }]),
  F([{ ox: 40, oy: -45, w: 50, h: 38 }]),
  F([{ ox: 42, oy: -42, w: 55, h: 40 }]),
  F([{ ox: 40, oy: -45, w: 52, h: 38 }]),
  F([{ ox: 38, oy: -50, w: 48, h: 35 }]),
];

// 京：荒咬み系
const KYO_ARAGAMI_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -65, w: 42, h: 30 }]),
  F([{ ox: 48, oy: -62, w: 48, h: 32 }]),
  F([{ ox: 48, oy: -62, w: 48, h: 32 }]),
  F([{ ox: 45, oy: -65, w: 45, h: 30 }]),
];

const KYO_ARAGAMI_KONOKIZU_FRAMES: AttackFrame[] = [
  F([{ ox: 42, oy: -55, w: 44, h: 28 }]),
  F([{ ox: 48, oy: -52, w: 48, h: 30 }]),
  F([{ ox: 48, oy: -52, w: 48, h: 30 }]),
  F([{ ox: 45, oy: -55, w: 44, h: 28 }]),
];

const KYO_ARAGAMI_YANOSABI_FRAMES: AttackFrame[] = [
  // 对空升拳：受击框缩小
  F([{ ox: 35, oy: -75, w: 42, h: 40 }], { ox: 3, oy: -5, w: -10, h: -20 }),
  F([{ ox: 40, oy: -78, w: 45, h: 42 }], { ox: 3, oy: -5, w: -10, h: -20 }),
  F([{ ox: 42, oy: -80, w: 45, h: 45 }]),
  F([{ ox: 40, oy: -75, w: 42, h: 42 }]),
  F([{ ox: 38, oy: -70, w: 40, h: 40 }]),
];

const KYO_NANASE_FRAMES: AttackFrame[] = [
  F([{ ox: 42, oy: -32, w: 48, h: 35 }]),
  F([{ ox: 48, oy: -30, w: 52, h: 38 }]),
  F([{ ox: 50, oy: -28, w: 55, h: 40 }]),
  F([{ ox: 48, oy: -32, w: 50, h: 36 }]),
  F([{ ox: 45, oy: -35, w: 48, h: 35 }]),
];

const KYO_KOTO_TSUKI_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -55, w: 52, h: 35 }]),
  F([{ ox: 55, oy: -52, w: 58, h: 38 }]),
  F([{ ox: 58, oy: -50, w: 62, h: 40 }]),
  F([{ ox: 55, oy: -52, w: 58, h: 38 }]),
  F([{ ox: 52, oy: -55, w: 55, h: 35 }]),
  F([{ ox: 48, oy: -58, w: 52, h: 35 }]),
];

const KYO_YAKISOGI_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -70, w: 42, h: 38 }]),
  F([{ ox: 40, oy: -68, w: 45, h: 42 }]),
  F([{ ox: 42, oy: -65, w: 48, h: 45 }]),
  F([{ ox: 40, oy: -68, w: 45, h: 42 }]),
];

// 京：毒咬み系
const KYO_DOKUGAMI_FRAMES: AttackFrame[] = [
  F([{ ox: 42, oy: -60, w: 45, h: 32 }]),
  F([{ ox: 48, oy: -58, w: 50, h: 34 }]),
  F([{ ox: 48, oy: -58, w: 50, h: 34 }]),
  F([{ ox: 45, oy: -60, w: 48, h: 32 }]),
];

const KYO_TSUMIYOMI_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -55, w: 44, h: 28 }]),
  F([{ ox: 45, oy: -52, w: 48, h: 30 }]),
  F([{ ox: 45, oy: -52, w: 48, h: 30 }]),
  F([{ ox: 42, oy: -55, w: 45, h: 28 }]),
];

const KYO_BATSUYOMI_FRAMES: AttackFrame[] = [
  F([{ ox: 42, oy: -70, w: 48, h: 35 }]),
  F([{ ox: 48, oy: -68, w: 52, h: 38 }]),
  F([{ ox: 50, oy: -65, w: 55, h: 40 }]),
  F([{ ox: 48, oy: -68, w: 52, h: 38 }]),
  F([{ ox: 45, oy: -70, w: 48, h: 35 }]),
];

// 京：鬼焼き dp+A (weak upper, single hit)
const KYO_ONIYAKI_FRAMES: AttackFrame[] = [
  F([{ ox: 28, oy: -78, w: 42, h: 44 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 34, oy: -85, w: 46, h: 48 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 36, oy: -88, w: 48, h: 50 }]),
  F([{ ox: 34, oy: -80, w: 44, h: 45 }]),
  F([{ ox: 30, oy: -70, w: 40, h: 40 }]),
];

// 京：鬼焼き dp+C (strong upper, multi-hit, full invincible)
const KYO_ONIYAKI_C_FRAMES: AttackFrame[] = [
  F([{ ox: 28, oy: -78, w: 42, h: 44 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 34, oy: -85, w: 46, h: 48 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 36, oy: -88, w: 48, h: 50 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 36, oy: -88, w: 48, h: 50 }]),
  F([{ ox: 34, oy: -85, w: 46, h: 48 }]),
  F([{ ox: 34, oy: -80, w: 44, h: 45 }]),
  F([{ ox: 30, oy: -70, w: 40, h: 40 }]),
  F([{ ox: 26, oy: -58, w: 36, h: 35 }]),
  F([{ ox: 24, oy: -48, w: 32, h: 30 }]),
  F([{ ox: 22, oy: -40, w: 28, h: 28 }]),
];

// 京：闇払い qcf+A (weak projectile)
const KYO_YAMIBARAI_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -58, w: 36, h: 28 }]),
];

// 京：闇払い qcf+C (strong projectile)
const KYO_YAMIBARAI_C_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -58, w: 36, h: 28 }]),
];

// ===== 八神庵 =====

// 葵花三段
const IORI_AOIHANA_FRAMES: AttackFrame[] = [
  F([{ ox: 42, oy: -55, w: 45, h: 32 }]),
  F([{ ox: 48, oy: -52, w: 50, h: 34 }]),
  F([{ ox: 48, oy: -52, w: 50, h: 34 }]),
  F([{ ox: 45, oy: -55, w: 48, h: 32 }]),
];

const IORI_AOIHANA_2_FRAMES: AttackFrame[] = [
  F([{ ox: 42, oy: -18, w: 48, h: 22 }]),
  F([{ ox: 48, oy: -16, w: 52, h: 24 }]),
  F([{ ox: 48, oy: -16, w: 52, h: 24 }]),
  F([{ ox: 45, oy: -18, w: 48, h: 22 }]),
];

const IORI_AOIHANA_3_FRAMES: AttackFrame[] = [
  // 最终段升拳：受击框缩小
  F([{ ox: 38, oy: -65, w: 45, h: 38 }], { ox: 3, oy: -5, w: -10, h: -20 }),
  F([{ ox: 42, oy: -70, w: 48, h: 42 }], { ox: 3, oy: -5, w: -10, h: -20 }),
  F([{ ox: 45, oy: -72, w: 50, h: 45 }]),
  F([{ ox: 42, oy: -68, w: 48, h: 42 }]),
  F([{ ox: 40, oy: -65, w: 45, h: 40 }]),
];

// 八神：闇払い qcf+A (weak projectile)
const IORI_YAMIBARAI_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -58, w: 36, h: 28 }]),
];

// 八神：闇払い qcf+C (strong projectile)
const IORI_YAMIBARAI_C_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -58, w: 36, h: 28 }]),
];

// 八神：鬼焼き dp+A (weak upper)
const IORI_ONIYAKI_FRAMES: AttackFrame[] = [
  F([{ ox: 26, oy: -78, w: 42, h: 44 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 32, oy: -85, w: 46, h: 48 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 34, oy: -88, w: 48, h: 50 }]),
  F([{ ox: 32, oy: -80, w: 44, h: 45 }]),
  F([{ ox: 28, oy: -70, w: 40, h: 40 }]),
];

// 八神：鬼焼き dp+C (strong upper, fully invincible)
const IORI_ONIYAKI_C_FRAMES: AttackFrame[] = [
  F([{ ox: 26, oy: -78, w: 42, h: 44 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 32, oy: -85, w: 46, h: 48 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 34, oy: -88, w: 48, h: 50 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 34, oy: -88, w: 48, h: 50 }]),
  F([{ ox: 32, oy: -85, w: 46, h: 48 }]),
  F([{ ox: 32, oy: -80, w: 44, h: 45 }]),
  F([{ ox: 28, oy: -70, w: 40, h: 40 }]),
  F([{ ox: 24, oy: -58, w: 36, h: 35 }]),
  F([{ ox: 22, oy: -48, w: 32, h: 30 }]),
  F([{ ox: 20, oy: -40, w: 28, h: 28 }]),
];

// 八神：琴月陰 (dash grab)
const IORI_KOTOTSUKI_FRAMES: AttackFrame[] = [
  F([{ ox: 50, oy: -55, w: 42, h: 38 }]),
  F([{ ox: 55, oy: -52, w: 48, h: 42 }]),
  F([{ ox: 58, oy: -50, w: 52, h: 44 }]),
  F([{ ox: 55, oy: -52, w: 48, h: 42 }]),
];

// 八神：屑風 (command throw)
const IORI_KUZUKAZE_FRAMES: AttackFrame[] = [
  F([{ ox: 45, oy: -55, w: 40, h: 50 }]),
  F([{ ox: 50, oy: -52, w: 44, h: 52 }]),
  F([{ ox: 50, oy: -52, w: 44, h: 52 }]),
  F([{ ox: 48, oy: -55, w: 42, h: 50 }]),
];

// ===== 特瑞 =====
const TERRY_BURN_KNUCKLE_FRAMES: AttackFrame[] = [
  F([{ ox: 45, oy: -55, w: 48, h: 30 }]),
  F([{ ox: 52, oy: -52, w: 55, h: 34 }]),
  F([{ ox: 55, oy: -50, w: 58, h: 36 }]),
  F([{ ox: 52, oy: -52, w: 55, h: 34 }]),
  F([{ ox: 48, oy: -55, w: 50, h: 32 }]),
  F([{ ox: 45, oy: -55, w: 48, h: 30 }]),
];

const TERRY_CRACK_SHOT_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -45, w: 45, h: 35 }]),
  F([{ ox: 48, oy: -42, w: 52, h: 38 }]),
  F([{ ox: 52, oy: -40, w: 55, h: 40 }]),
  F([{ ox: 48, oy: -42, w: 52, h: 38 }]),
  F([{ ox: 45, oy: -45, w: 48, h: 35 }]),
];

const TERRY_POWER_WAVE_FRAMES: AttackFrame[] = [
  // Power Wave: ground projectile, hand strike frame
  F([{ ox: 50, oy: -40, w: 38, h: 28 }]),
];

const TERRY_POWER_DUNK_FRAMES: AttackFrame[] = [
  // Power Dunk: rising dunk, body shrinks during ascent
  F([{ ox: 30, oy: -70, w: 40, h: 40 }], { ox: 5, oy: -8, w: -12, h: -25 }),
  F([{ ox: 35, oy: -78, w: 45, h: 44 }], { ox: 5, oy: -8, w: -12, h: -25 }),
  F([{ ox: 38, oy: -82, w: 48, h: 46 }]),
  F([{ ox: 35, oy: -75, w: 44, h: 42 }]),
  F([{ ox: 30, oy: -65, w: 40, h: 38 }]),
];

const TERRY_RISING_TACKLE_FRAMES: AttackFrame[] = [
  // Rising Tackle: charge upper, multi-hit vertical spin
  F([{ ox: 25, oy: -72, w: 38, h: 42 }], { ox: 3, oy: -10, w: -10, h: -28 }),
  F([{ ox: 30, oy: -80, w: 42, h: 45 }], { ox: 3, oy: -10, w: -10, h: -28 }),
  F([{ ox: 32, oy: -85, w: 44, h: 48 }], { ox: 3, oy: -10, w: -10, h: -28 }),
  F([{ ox: 30, oy: -80, w: 42, h: 45 }]),
  F([{ ox: 28, oy: -72, w: 40, h: 42 }]),
  F([{ ox: 25, oy: -62, w: 36, h: 38 }]),
];

// ===== 金 =====
const KIM_HIENZAN_FRAMES: AttackFrame[] = [
  // 飛燕斬：上升踢，受击框缩小
  F([{ ox: 32, oy: -75, w: 40, h: 42 }], { ox: 3, oy: -5, w: -10, h: -25 }),
  F([{ ox: 38, oy: -80, w: 45, h: 45 }], { ox: 3, oy: -5, w: -10, h: -25 }),
  F([{ ox: 40, oy: -82, w: 48, h: 48 }]),
  F([{ ox: 38, oy: -78, w: 45, h: 45 }]),
  F([{ ox: 35, oy: -72, w: 42, h: 42 }]),
];

// 金：半月斬 (spinning kick)
const KIM_HANGETSU_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -55, w: 45, h: 38 }]),
  F([{ ox: 42, oy: -50, w: 50, h: 42 }]),
  F([{ ox: 45, oy: -48, w: 52, h: 44 }]),
  F([{ ox: 42, oy: -50, w: 50, h: 42 }]),
  F([{ ox: 38, oy: -55, w: 45, h: 38 }]),
];

// 金：覇気脚 (low sweep)
const KIM_HAKI_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -20, w: 50, h: 28 }]),
  F([{ ox: 48, oy: -18, w: 55, h: 30 }]),
  F([{ ox: 50, oy: -18, w: 55, h: 30 }]),
  F([{ ox: 48, oy: -20, w: 50, h: 28 }]),
];

// 金：飛翔脚 (air dive kick)
const KIM_HISHOU_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -40, w: 48, h: 42 }]),
  F([{ ox: 45, oy: -35, w: 55, h: 45 }]),
  F([{ ox: 48, oy: -32, w: 58, h: 48 }]),
  F([{ ox: 45, oy: -35, w: 55, h: 45 }]),
];

// 金：三連撃 (rekka punch chain)
const KIM_SANREN_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -60, w: 42, h: 30 }]),
  F([{ ox: 48, oy: -58, w: 48, h: 32 }]),
  F([{ ox: 48, oy: -58, w: 48, h: 32 }]),
  F([{ ox: 44, oy: -60, w: 44, h: 30 }]),
];

// ===== 坂崎亮 =====

// 虎煌 qcf+A (weak projectile)
const RYO_KOOU_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -58, w: 36, h: 28 }]),
];

// 虎煌 qcf+C (strong projectile)
const RYO_KOOU_C_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -58, w: 38, h: 30 }]),
];

// 虎咆 dp+A (weak upper)
const RYO_KO_HOU_FRAMES: AttackFrame[] = [
  F([{ ox: 28, oy: -78, w: 42, h: 44 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 34, oy: -85, w: 46, h: 48 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 36, oy: -88, w: 48, h: 50 }]),
  F([{ ox: 34, oy: -80, w: 44, h: 45 }]),
  F([{ ox: 30, oy: -70, w: 40, h: 40 }]),
];

// 虎咆 dp+C (strong upper, fully invincible)
const RYO_KO_HOU_C_FRAMES: AttackFrame[] = [
  F([{ ox: 28, oy: -78, w: 42, h: 44 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 34, oy: -85, w: 46, h: 48 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 36, oy: -88, w: 48, h: 50 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 36, oy: -88, w: 48, h: 50 }]),
  F([{ ox: 34, oy: -85, w: 46, h: 48 }]),
  F([{ ox: 34, oy: -80, w: 44, h: 45 }]),
  F([{ ox: 30, oy: -70, w: 40, h: 40 }]),
  F([{ ox: 26, oy: -58, w: 36, h: 35 }]),
  F([{ ox: 24, oy: -48, w: 32, h: 30 }]),
  F([{ ox: 22, oy: -40, w: 28, h: 28 }]),
];

// 飛燕疾風脚 qcb+K (overhead kick)
const RYO_HIEN_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -60, w: 45, h: 35 }]),
  F([{ ox: 42, oy: -55, w: 52, h: 38 }]),
  F([{ ox: 45, oy: -52, w: 55, h: 40 }]),
  F([{ ox: 42, oy: -55, w: 52, h: 38 }]),
  F([{ ox: 38, oy: -58, w: 48, h: 35 }]),
];

// 霸王翔吼拳 qcf+K (counter stance)
const RYO_HAOU_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -60, w: 42, h: 35 }]),
  F([{ ox: 42, oy: -58, w: 48, h: 38 }]),
  F([{ ox: 45, oy: -55, w: 50, h: 40 }]),
  F([{ ox: 42, oy: -58, w: 48, h: 38 }]),
  F([{ ox: 38, oy: -60, w: 44, h: 35 }]),
];

// DM: 天地霸煌拳
const DM_TEN_HA_OU_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -68, w: 58, h: 48 }]),
  F([{ ox: 36, oy: -65, w: 68, h: 52 }]),
  F([{ ox: 40, oy: -62, w: 75, h: 55 }]),
  F([{ ox: 40, oy: -62, w: 78, h: 58 }]),
  F([{ ox: 40, oy: -62, w: 78, h: 58 }]),
  F([{ ox: 38, oy: -64, w: 72, h: 52 }]),
  ...Array.from({ length: 18 }, (_, i) =>
    F([{ ox: 28 - i * 0.3, oy: -68 + i * 0.5, w: 58 - i * 1.5, h: 46 - i }])
  ),
];

// ===== 莉安娜 =====

// 月光 qcf+A (weak projectile)
const LEONA_MOON_SLASH_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -58, w: 36, h: 28 }]),
];

// 月光 qcf+C (strong projectile)
const LEONA_MOON_SLASH_C_FRAMES: AttackFrame[] = [
  F([{ ox: 48, oy: -58, w: 38, h: 30 }]),
];

// 威光 dp+A (weak upper)
const LEONA_EAR_RING_FRAMES: AttackFrame[] = [
  F([{ ox: 28, oy: -78, w: 42, h: 44 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 34, oy: -85, w: 46, h: 48 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 36, oy: -88, w: 48, h: 50 }]),
  F([{ ox: 34, oy: -80, w: 44, h: 45 }]),
  F([{ ox: 30, oy: -70, w: 40, h: 40 }]),
];

// 威光 dp+C (strong upper, fully invincible)
const LEONA_EAR_RING_C_FRAMES: AttackFrame[] = [
  F([{ ox: 28, oy: -78, w: 42, h: 44 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 34, oy: -85, w: 46, h: 48 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 36, oy: -88, w: 48, h: 50 }], { ox: 5, oy: -10, w: -15, h: -28 }),
  F([{ ox: 36, oy: -88, w: 48, h: 50 }]),
  F([{ ox: 34, oy: -85, w: 46, h: 48 }]),
  F([{ ox: 34, oy: -80, w: 44, h: 45 }]),
  F([{ ox: 30, oy: -70, w: 40, h: 40 }]),
  F([{ ox: 26, oy: -58, w: 36, h: 35 }]),
  F([{ ox: 24, oy: -48, w: 32, h: 30 }]),
  F([{ ox: 22, oy: -40, w: 28, h: 28 }]),
];

// 手刀 qcb+P (rush slash)
const LEONA_GRAND_SABER_FRAMES: AttackFrame[] = [
  F([{ ox: 40, oy: -58, w: 48, h: 32 }]),
  F([{ ox: 48, oy: -55, w: 55, h: 36 }]),
  F([{ ox: 52, oy: -52, w: 58, h: 38 }]),
  F([{ ox: 48, oy: -55, w: 55, h: 36 }]),
  F([{ ox: 44, oy: -58, w: 50, h: 34 }]),
];

// X标 qcf+K (low)
const LEONA_BALTIC_FRAMES: AttackFrame[] = [
  F([{ ox: 38, oy: -22, w: 48, h: 28 }]),
  F([{ ox: 45, oy: -20, w: 54, h: 30 }]),
  F([{ ox: 48, oy: -18, w: 56, h: 32 }]),
  F([{ ox: 45, oy: -20, w: 54, h: 30 }]),
];

// DM: V字金锯
const DM_V_SLASHER_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -68, w: 58, h: 48 }]),
  F([{ ox: 36, oy: -65, w: 68, h: 52 }]),
  F([{ ox: 40, oy: -62, w: 75, h: 55 }]),
  F([{ ox: 40, oy: -62, w: 78, h: 58 }]),
  F([{ ox: 40, oy: -62, w: 78, h: 58 }]),
  F([{ ox: 38, oy: -64, w: 72, h: 52 }]),
  ...Array.from({ length: 16 }, (_, i) =>
    F([{ ox: 28 - i * 0.3, oy: -68 + i * 0.5, w: 58 - i * 1.5, h: 46 - i }])
  ),
];

// ===== DM 超必杀技 =====
const DM_OROCHINAGI_FRAMES: AttackFrame[] = [
  F([{ ox: 30, oy: -70, w: 60, h: 50 }]),
  F([{ ox: 38, oy: -68, w: 70, h: 55 }]),
  F([{ ox: 42, oy: -65, w: 78, h: 58 }]),
  F([{ ox: 42, oy: -65, w: 80, h: 60 }]),
  F([{ ox: 42, oy: -65, w: 80, h: 60 }]),
  F([{ ox: 40, oy: -67, w: 75, h: 55 }]),
  F([{ ox: 38, oy: -68, w: 70, h: 52 }]),
  F([{ ox: 35, oy: -70, w: 65, h: 50 }]),
  // 后续帧逐渐缩小
  ...Array.from({ length: 22 }, (_, i) =>
    F([{ ox: 30 - i * 0.3, oy: -70 + i * 0.5, w: 60 - i * 1.5, h: 48 - i }])
  ),
];

const DM_YATAGARASU_FRAMES: AttackFrame[] = [
  F([{ ox: 28, oy: -62, w: 55, h: 48 }]),
  F([{ ox: 34, oy: -60, w: 65, h: 52 }]),
  F([{ ox: 38, oy: -58, w: 72, h: 55 }]),
  F([{ ox: 38, oy: -58, w: 72, h: 55 }]),
  F([{ ox: 36, oy: -60, w: 68, h: 52 }]),
  ...Array.from({ length: 15 }, (_, i) =>
    F([{ ox: 32 - i * 0.2, oy: -62 + i * 0.3, w: 60 - i, h: 48 - i * 0.5 }])
  ),
];

const DM_POWER_GEYSER_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -55, w: 60, h: 45 }]),
  F([{ ox: 40, oy: -52, w: 72, h: 50 }]),
  F([{ ox: 42, oy: -50, w: 78, h: 52 }]),
  ...Array.from({ length: 12 }, (_, i) =>
    F([{ ox: 38 + i * 0.5, oy: -52 + i * 0.3, w: 68 - i * 1.5, h: 48 - i * 0.5 }])
  ),
];

const DM_PHOENIX_KICK_FRAMES: AttackFrame[] = [
  F([{ ox: 35, oy: -52, w: 58, h: 45 }]),
  F([{ ox: 42, oy: -48, w: 68, h: 52 }]),
  F([{ ox: 45, oy: -45, w: 72, h: 55 }]),
  ...Array.from({ length: 15 }, (_, i) =>
    F([{ ox: 40 + i * 0.3, oy: -48 + i * 0.3, w: 65 - i, h: 50 - i * 0.5 }])
  ),
];

// ===== 导出完整的逐帧判定表 =====
export const ATTACK_FRAMES: AttackFrameTable = {
  [AttackType.STAND_A]: FAR_STAND_A_FRAMES,
  [AttackType.STAND_B]: FAR_STAND_B_FRAMES,
  [AttackType.STAND_C]: FAR_STAND_C_FRAMES,
  [AttackType.STAND_D]: FAR_STAND_D_FRAMES,
  [AttackType.CLOSE_A]: CLOSE_A_FRAMES,
  [AttackType.CLOSE_B]: CLOSE_B_FRAMES,
  [AttackType.CLOSE_C]: CLOSE_C_FRAMES,
  [AttackType.CLOSE_D]: CLOSE_D_FRAMES,
  [AttackType.CMD_GOFU_YOU]: CMD_GOFUYOU_FRAMES,
  [AttackType.CMD_88SHIKI]: CMD_88SHIKI_FRAMES,
  [AttackType.CMD_NARAKU]: CMD_NARAKU_FRAMES,
  [AttackType.CROUCH_A]: CROUCH_A_FRAMES,
  [AttackType.CROUCH_B]: CROUCH_B_FRAMES,
  [AttackType.CROUCH_C]: CROUCH_C_FRAMES,
  [AttackType.CROUCH_D]: CROUCH_D_FRAMES,
  [AttackType.JUMP_A]: JUMP_A_FRAMES,
  [AttackType.JUMP_B]: JUMP_B_FRAMES,
  [AttackType.JUMP_C]: JUMP_C_FRAMES,
  [AttackType.JUMP_D]: JUMP_D_FRAMES,
  [AttackType.THROW]: THROW_FRAMES,
  [AttackType.STAND_CD]: STAND_CD_FRAMES,
  [AttackType.JUMP_CD]: JUMP_CD_FRAMES,
  [AttackType.SPECIAL_UPPER]: SPECIAL_UPPER_FRAMES,
  [AttackType.SPECIAL_PROJECTILE]: SPECIAL_PROJECTILE_FRAMES,
  [AttackType.KYO_75KAI]: KYO_75KAI_FRAMES,
  [AttackType.KYO_75KAI_2]: KYO_75KAI_2_FRAMES,
  [AttackType.KYO_RED_KICK]: KYO_RED_KICK_FRAMES,
  [AttackType.KYO_ARAGAMI]: KYO_ARAGAMI_FRAMES,
  [AttackType.KYO_ARAGAMI_KONOKIZU]: KYO_ARAGAMI_KONOKIZU_FRAMES,
  [AttackType.KYO_ARAGAMI_YANOSABI]: KYO_ARAGAMI_YANOSABI_FRAMES,
  [AttackType.KYO_NANASE]: KYO_NANASE_FRAMES,
  [AttackType.KYO_KOTO_TSUKI]: KYO_KOTO_TSUKI_FRAMES,
  [AttackType.KYO_YAKISOGI]: KYO_YAKISOGI_FRAMES,
  [AttackType.KYO_DOKUGAMI]: KYO_DOKUGAMI_FRAMES,
  [AttackType.KYO_TSUMIYOMI]: KYO_TSUMIYOMI_FRAMES,
  [AttackType.KYO_BATSUYOMI]: KYO_BATSUYOMI_FRAMES,
  [AttackType.KYO_ONIYAKI]: KYO_ONIYAKI_FRAMES,
  [AttackType.KYO_ONIYAKI_C]: KYO_ONIYAKI_C_FRAMES,
  [AttackType.KYO_YAMIBARAI]: KYO_YAMIBARAI_FRAMES,
  [AttackType.KYO_YAMIBARAI_C]: KYO_YAMIBARAI_C_FRAMES,
  [AttackType.IORI_AOIHANA]: IORI_AOIHANA_FRAMES,
  [AttackType.IORI_AOIHANA_2]: IORI_AOIHANA_2_FRAMES,
  [AttackType.IORI_AOIHANA_3]: IORI_AOIHANA_3_FRAMES,
  [AttackType.IORI_YAMIBARAI]: IORI_YAMIBARAI_FRAMES,
  [AttackType.IORI_YAMIBARAI_C]: IORI_YAMIBARAI_C_FRAMES,
  [AttackType.IORI_ONIYAKI]: IORI_ONIYAKI_FRAMES,
  [AttackType.IORI_ONIYAKI_C]: IORI_ONIYAKI_C_FRAMES,
  [AttackType.IORI_KOTOTSUKI]: IORI_KOTOTSUKI_FRAMES,
  [AttackType.IORI_KUZUKAZE]: IORI_KUZUKAZE_FRAMES,
  [AttackType.TERRY_BURN_KNUCKLE]: TERRY_BURN_KNUCKLE_FRAMES,
  [AttackType.TERRY_CRACK_SHOT]: TERRY_CRACK_SHOT_FRAMES,
  [AttackType.TERRY_POWER_WAVE]: TERRY_POWER_WAVE_FRAMES,
  [AttackType.TERRY_POWER_DUNK]: TERRY_POWER_DUNK_FRAMES,
  [AttackType.TERRY_RISING_TACKLE]: TERRY_RISING_TACKLE_FRAMES,
  [AttackType.KIM_HIENZAN]: KIM_HIENZAN_FRAMES,
  [AttackType.KIM_HANGETSU]: KIM_HANGETSU_FRAMES,
  [AttackType.KIM_HAKI]: KIM_HAKI_FRAMES,
  [AttackType.KIM_HISHOU]: KIM_HISHOU_FRAMES,
  [AttackType.KIM_SANREN]: KIM_SANREN_FRAMES,
  [AttackType.DM_OROCHINAGI]: DM_OROCHINAGI_FRAMES,
  [AttackType.DM_YATAGARASU]: DM_YATAGARASU_FRAMES,
  [AttackType.DM_POWER_GEYSER]: DM_POWER_GEYSER_FRAMES,
  [AttackType.DM_PHOENIX_KICK]: DM_PHOENIX_KICK_FRAMES,
  // 坂崎亮
  [AttackType.RYO_KOOU]: RYO_KOOU_FRAMES,
  [AttackType.RYO_KOOU_C]: RYO_KOOU_C_FRAMES,
  [AttackType.RYO_KO_HOU]: RYO_KO_HOU_FRAMES,
  [AttackType.RYO_KO_HOU_C]: RYO_KO_HOU_C_FRAMES,
  [AttackType.RYO_HIEN]: RYO_HIEN_FRAMES,
  [AttackType.RYO_HAOU]: RYO_HAOU_FRAMES,
  [AttackType.DM_TEN_HA_OU]: DM_TEN_HA_OU_FRAMES,
  // 莉安娜
  [AttackType.LEONA_MOON_SLASH]: LEONA_MOON_SLASH_FRAMES,
  [AttackType.LEONA_MOON_SLASH_C]: LEONA_MOON_SLASH_C_FRAMES,
  [AttackType.LEONA_EAR_RING]: LEONA_EAR_RING_FRAMES,
  [AttackType.LEONA_EAR_RING_C]: LEONA_EAR_RING_C_FRAMES,
  [AttackType.LEONA_GRAND_SABER]: LEONA_GRAND_SABER_FRAMES,
  [AttackType.LEONA_BALTIC]: LEONA_BALTIC_FRAMES,
  [AttackType.DM_V_SLASHER]: DM_V_SLASHER_FRAMES,
};
