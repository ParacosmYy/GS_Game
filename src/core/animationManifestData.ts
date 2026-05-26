/**
 * Animation Manifest Data — Kyo / Iori / Ryo 帧序列数据
 *
 * 从 FRAME_DATA 的 startup/active/recovery 推导动画帧序列。
 * 当前阶段为 placeholder 数据：offsetX/offsetY = 0，hitboxKey 指向 FRAME_DATA key。
 * 未来资产管线就绪后，由工具层离线生成精确帧数据注入此处。
 *
 * 帧序列规则：
 * - 攻击动作: startup 帧(无 hitbox) + active 帧(有 hitboxKey) + recovery 帧(无 hitbox)
 * - 循环动作: idle/walk 有 >= 2 帧, loop=true
 * - 取消帧: 通常在 active 尾部 + recovery 前段
 * - 无敌帧: 升龙技 startup 阶段标记
 *
 * 归属: core/ — 只依赖 animationManifest 类型和 FRAME_DATA，不持有运行时逻辑
 */

import type { AnimFrame, AnimSequence, CharacterAnimManifest, AnimationManifest } from './animationManifest.js';
import { FRAME_DATA } from './frameDataConstants.js';

// ===== 工具函数 =====

/** 生成 N 个通用占位帧 */
function phFrames(
  count: number,
  durationPerFrame: number,
  hitboxKey?: string,
): AnimFrame[] {
  return Array.from({ length: count }, (_, i) => ({
    index: i,
    duration: durationPerFrame,
    offsetX: 0,
    offsetY: 0,
    ...(hitboxKey ? { hitboxKey } : {}),
  }));
}

/**
 * 根据 FRAME_DATA 的 startup/active/recovery 生成攻击帧序列
 * active 阶段每帧带 hitboxKey 链接到 FRAME_DATA
 */
function attackSequence(
  name: string,
  frameDataKey: string,
  cancelFromFrame?: number,
  invincibleStartup = 0,
): AnimSequence {
  const fd = FRAME_DATA[frameDataKey as keyof typeof FRAME_DATA];
  if (!fd) {
    // fallback: 最小占位
    return {
      name,
      frames: phFrames(1, 1),
      loop: false,
      cancelFrames: [],
      invincibleFrames: [],
    };
  }

  const { startup, active, recovery } = fd as { startup: number; active: number; recovery: number };
  const frames: AnimFrame[] = [];
  const cancelFrames: number[] = [];
  const invincibleFrames: number[] = [];

  // Startup 帧 — 每帧 duration=1 (1 game frame per frame)
  for (let i = 0; i < startup; i++) {
    frames.push({ index: frames.length, duration: 1, offsetX: 0, offsetY: 0 });
    if (i < invincibleStartup) {
      invincibleFrames.push(frames.length - 1);
    }
  }

  // Active 帧 — 带 hitboxKey
  for (let i = 0; i < active; i++) {
    frames.push({
      index: frames.length,
      duration: 1,
      offsetX: 0,
      offsetY: 0,
      hitboxKey: frameDataKey,
    });
  }

  // Recovery 帧
  for (let i = 0; i < recovery; i++) {
    frames.push({ index: frames.length, duration: 1, offsetX: 0, offsetY: 0 });
  }

  // 取消帧: active 尾部 + recovery 前段
  // 默认取消从 active 最后一帧开始到 recovery 前半
  if (cancelFromFrame !== undefined) {
    for (let i = cancelFromFrame; i < frames.length; i++) {
      cancelFrames.push(i);
    }
  } else {
    // 默认: active 后半 + recovery 前半可取消
    const activeEnd = startup + active;
    const cancelStart = startup + Math.ceil(active / 2);
    for (let i = cancelStart; i < activeEnd + Math.ceil(recovery / 2); i++) {
      if (i < frames.length) {
        cancelFrames.push(i);
      }
    }
  }

  return { name, frames, loop: false, cancelFrames, invincibleFrames };
}

/**
 * 生成循环序列 (idle, walk)
 */
function loopSequence(
  name: string,
  frameCount: number,
  durationPerFrame: number,
): AnimSequence {
  return {
    name,
    frames: phFrames(frameCount, durationPerFrame),
    loop: true,
    cancelFrames: [],
    invincibleFrames: [],
  };
}

/**
 * 生成非循环一次性序列 (jump, knockdown, wakeup, win)
 */
function onceSequence(
  name: string,
  frameCount: number,
  durationPerFrame: number,
): AnimSequence {
  return {
    name,
    frames: phFrames(frameCount, durationPerFrame),
    loop: false,
    cancelFrames: [],
    invincibleFrames: [],
  };
}

// ============================================================================
// Kyo Kusanagi — 草薙京
// ============================================================================
// 通常技 FRAME_DATA: STAND_A/B/C/D, CROUCH_A/B/C/D
// 必杀技: KYO_ONIYAKI (升龙), KYO_YAMIBARAI (波动), KYO_ARAGAMI (荒咬み)
// DM: DM_OROCHINAGI

const KYO_SEQUENCES: Record<string, AnimSequence> = {
  // ── 基础动作 ──
  idle:           loopSequence('idle', 4, 9),          // 4帧循环, ~9帧/帧
  walk_forward:   loopSequence('walk_forward', 6, 6),  // 6帧循环, ~6帧/帧
  walk_backward:  loopSequence('walk_backward', 6, 7),  // 6帧循环, ~7帧/帧
  jump_up:        onceSequence('jump_up', 8, 5),       // 8帧, 5帧/帧
  jump_forward:   onceSequence('jump_forward', 10, 5), // 10帧, 5帧/帧
  jump_backward:  onceSequence('jump_backward', 10, 5),

  // ── 通常技 (startup+active+recovery 严格对齐 FRAME_DATA) ──
  stand_a:  attackSequence('stand_a', 'STAND_A', 8),   // 6+3+5=14帧
  stand_b:  attackSequence('stand_b', 'STAND_B', 9),   // 7+3+14=24帧
  stand_c:  attackSequence('stand_c', 'STAND_C', 9),   // 7+3+20=30帧
  stand_d:  attackSequence('stand_d', 'STAND_D', 14),  // 10+8+20=38帧
  crouch_a: attackSequence('crouch_a', 'CROUCH_A', 8), // 5+4+7=16帧
  crouch_b: attackSequence('crouch_b', 'CROUCH_B', 9), // 5+5+5=15帧
  crouch_c: attackSequence('crouch_c', 'CROUCH_C', 9), // 7+5+16=28帧
  crouch_d: attackSequence('crouch_d', 'CROUCH_D', 10), // 5+6+31=42帧

  // ── 受击/防御/倒地 ──
  hitstun:   onceSequence('hitstun', 11, 1),   // 11帧 (对齐 hitstun=11)
  blockstun: onceSequence('blockstun', 9, 1),  // 9帧 (对齐 blockstun=9)
  knockdown: onceSequence('knockdown', 30, 1), // 倒地+躺地
  wakeup:    onceSequence('wakeup', 8, 1),      // 起身

  // ── 胜利 ──
  win: onceSequence('win', 6, 10), // 6帧, 10帧/帧

  // ── 必杀技 ──
  oniyaki:     attackSequence('oniyaki', 'KYO_ONIYAKI', 12, 4),       // 升龙, startup前4帧无敌
  yamibarai:   attackSequence('yamibarai', 'KYO_YAMIBARAI', 28),      // 波动拳
  aragami:     attackSequence('aragami', 'KYO_ARAGAMI', 16),          // 荒咬み
  red_kick:    attackSequence('red_kick', 'KYO_RED_KICK', 22),        // R.E.D.Kick
  dokugami:    attackSequence('dokugami', 'KYO_DOKUGAMI', 22),        // 毒咬み

  // ── DM ──
  dm_orochinagi: attackSequence('dm_orochinagi', 'DM_OROCHINAGI', 36), // 大蛇薙
};

// ============================================================================
// Iori Yagami — 八神庵
// ============================================================================
// 通常技 FRAME_DATA: STAND_A/B/C/D, CROUCH_A/B/C/D
// 必杀技: IORI_AOIHANA (葵花), IORI_ONIYAKI (鬼焼き), IORI_YAMIBARAI (闇払い),
//          IORI_KOTOTSUKI (琴月陰), IORI_KUZUKAZE (屑風)
// DM: DM_YAOTOME (八稚女)

const IORI_SEQUENCES: Record<string, AnimSequence> = {
  // ── 基础动作 ──
  idle:           loopSequence('idle', 4, 9),
  walk_forward:   loopSequence('walk_forward', 6, 6),
  walk_backward:  loopSequence('walk_backward', 6, 7),
  jump_up:        onceSequence('jump_up', 8, 5),
  jump_forward:   onceSequence('jump_forward', 10, 5),
  jump_backward:  onceSequence('jump_backward', 10, 5),

  // ── 通常技 ──
  stand_a:  attackSequence('stand_a', 'STAND_A', 8),
  stand_b:  attackSequence('stand_b', 'STAND_B', 9),
  stand_c:  attackSequence('stand_c', 'STAND_C', 9),
  stand_d:  attackSequence('stand_d', 'STAND_D', 14),
  crouch_a: attackSequence('crouch_a', 'CROUCH_A', 8),
  crouch_b: attackSequence('crouch_b', 'CROUCH_B', 9),
  crouch_c: attackSequence('crouch_c', 'CROUCH_C', 9),
  crouch_d: attackSequence('crouch_d', 'CROUCH_D', 10),

  // ── 受击/防御/倒地 ──
  hitstun:   onceSequence('hitstun', 11, 1),
  blockstun: onceSequence('blockstun', 9, 1),
  knockdown: onceSequence('knockdown', 30, 1),
  wakeup:    onceSequence('wakeup', 8, 1),

  // ── 胜利 ──
  win: onceSequence('win', 6, 10),

  // ── 必杀技 ──
  aoihana:    attackSequence('aoihana', 'IORI_AOIHANA', 8),           // 葵花
  oniyaki:    attackSequence('oniyaki', 'IORI_ONIYAKI', 8, 3),       // 鬼焼き, startup前3帧无敌
  yamibarai:  attackSequence('yamibarai', 'IORI_YAMIBARAI', 16),     // 闇払い
  kototsuki:  attackSequence('kototsuki', 'IORI_KOTOTSUKI', 14),     // 琴月陰
  kuzukaze:   attackSequence('kuzukaze', 'IORI_KUZUKAZE', 10),       // 屑風 (指令投)

  // ── DM ──
  dm_yaotome: attackSequence('dm_yaotome', 'DM_YAOTOME', 18),        // 八稚女
};

// ============================================================================
// Ryo Sakazaki — 坂崎亮
// ============================================================================
// 通常技 FRAME_DATA: STAND_A/B/C/D, CROUCH_A/B/C/D
// 必杀技: RYO_KOOU (虎煌), RYO_KO_HOU (虎咆), RYO_HIEN (飛燕)
// DM: DM_TEN_HA_OU (天地霸煌拳)

const RYO_SEQUENCES: Record<string, AnimSequence> = {
  // ── 基础动作 ──
  idle:           loopSequence('idle', 4, 9),
  walk_forward:   loopSequence('walk_forward', 6, 6),
  walk_backward:  loopSequence('walk_backward', 6, 7),
  jump_up:        onceSequence('jump_up', 8, 5),
  jump_forward:   onceSequence('jump_forward', 10, 5),
  jump_backward:  onceSequence('jump_backward', 10, 5),

  // ── 通常技 ──
  stand_a:  attackSequence('stand_a', 'STAND_A', 8),
  stand_b:  attackSequence('stand_b', 'STAND_B', 9),
  stand_c:  attackSequence('stand_c', 'STAND_C', 9),
  stand_d:  attackSequence('stand_d', 'STAND_D', 14),
  crouch_a: attackSequence('crouch_a', 'CROUCH_A', 8),
  crouch_b: attackSequence('crouch_b', 'CROUCH_B', 9),
  crouch_c: attackSequence('crouch_c', 'CROUCH_C', 9),
  crouch_d: attackSequence('crouch_d', 'CROUCH_D', 10),

  // ── 受击/防御/倒地 ──
  hitstun:   onceSequence('hitstun', 11, 1),
  blockstun: onceSequence('blockstun', 9, 1),
  knockdown: onceSequence('knockdown', 30, 1),
  wakeup:    onceSequence('wakeup', 8, 1),

  // ── 胜利 ──
  win: onceSequence('win', 6, 10),

  // ── 必杀技 (AttackType 映射名) ──
  ryo_koou:   attackSequence('ryo_koou', 'RYO_KOOU', 28),             // 虎煌拳 ↓↘→+A
  ryo_ko_hou: attackSequence('ryo_ko_hou', 'RYO_KO_HOU', 9, 3),       // 虎咆 →↓↘+A, startup前3帧无敌
  ryo_hien:   attackSequence('ryo_hien', 'RYO_HIEN', 16),             // 飛燕疾風脚 ←↙↓+K
  ryo_haou:   attackSequence('ryo_haou', 'RYO_HAOU', 20),             // 霸王翔吼拳 ↓↘→+K

  // ── DM (AttackType 映射名) ──
  dm_ten_ha_ou: attackSequence('dm_ten_ha_ou', 'DM_TEN_HA_OU', 26),   // 天地霸煌拳

  // ── 必杀技 (旧名，向后兼容) ──
  koouken:  attackSequence('koouken', 'RYO_KOOU', 28),
  ko_hou:   attackSequence('ko_hou', 'RYO_KO_HOU', 9, 3),
  hien:     attackSequence('hien', 'RYO_HIEN', 16),
  haou:     attackSequence('haou', 'RYO_HAOU', 20),

  // ── DM (旧名，向后兼容) ──
  dm_haou: attackSequence('dm_haou', 'DM_TEN_HA_OU', 26),
};

// ============================================================================
// 全局 Animation Manifest
// ============================================================================

export const ANIMATION_MANIFEST: AnimationManifest = {
  version: 1,
  characters: {
    kyo:  { charId: 'kyo',  sequences: KYO_SEQUENCES },
    iori: { charId: 'iori', sequences: IORI_SEQUENCES },
    ryo:  { charId: 'ryo',  sequences: RYO_SEQUENCES },
  },
};

/** 获取指定角色的 manifest */
export function getCharacterAnimManifest(charId: string): CharacterAnimManifest | undefined {
  return ANIMATION_MANIFEST.characters[charId];
}

/**
 * 必须存在的序列名称列表 — 每个角色至少要有这些
 */
export const REQUIRED_SEQUENCES: string[] = [
  'idle',
  'walk_forward',
  'walk_backward',
  'jump_up',
  'jump_forward',
  'jump_backward',
  'stand_a',
  'stand_b',
  'stand_c',
  'stand_d',
  'crouch_a',
  'crouch_b',
  'crouch_c',
  'crouch_d',
  'hitstun',
  'blockstun',
  'knockdown',
  'wakeup',
  'win',
];
