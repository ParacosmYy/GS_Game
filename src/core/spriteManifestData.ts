/**
 * Sprite Manifest Data — 全角色最小 manifest 数据
 *
 * 当前阶段：每个角色只有 fallbackColors，无实际 atlas 或动画帧数据。
 * Ryo 作为样板角色，已填充完整动画 manifest，用于验证资产管线接口。
 * 未来资产管线就绪后，通过工具层离线生成完整 manifest 注入此处。
 *
 * 颜色来源：各角色 CharacterDefinition 中的 color / accentColor / specialColor
 * 映射规则：
 *   body  → 肤色（统一 #FFD699，待角色数据细化后区分）
 *   head  → 肤色（同 body）
 *   outfit → CharacterDefinition.color（角色主色/服装色）
 *   hair  → 角色特征发色（从角色设定推导）
 *
 * 归属: core/ — 只依赖 spriteManifest 类型，不持有运行时逻辑
 */

import type { SpriteManifest, SpriteAnimation, CharacterSpriteManifest } from './spriteManifest.js';

export const SPRITE_MANIFEST: SpriteManifest = {
  version: 1,
  characters: {},
};

// ===== 帧时长换算 =====
// 1 frame @60fps ≈ 16.67ms，取整到 17ms
const F = 17; // ms per game frame @60fps

// ===== 通用精灵帧参数 =====
// placeholder atlasX/atlasY = 0,0; 未来资产管线替换为真实 atlas 坐标
const STD_W = 80;
const STD_H = 160;

/**
 * 快速生成 N 个相同尺寸的 placeholder 帧
 * @param count 帧数
 * @param durationMs 每帧持续毫秒
 * @param w 宽度
 * @param h 高度
 */
function placeholderFrames(
  count: number,
  durationMs: number,
  w = STD_W,
  h = STD_H,
  atlasRow = 0,
): SpriteAnimation['frames'] {
  return Array.from({ length: count }, (_, i) => ({
    atlasX: i * w,
    atlasY: atlasRow * h,
    width: w,
    height: h,
    anchor: { x: w / 2, y: h },
    duration: durationMs,
  }));
}

/**
 * 生成攻击动画帧序列：startup + active + recovery
 * 每段帧数来自 FRAME_DATA，active 段可用不同尺寸(攻击延伸)
 * @param startup 攻击前摇帧数
 * @param active 攻击判定帧数
 * @param recovery 攻击后摇帧数
 * @param activeW active 阶段宽度(攻击范围延伸)
 * @param activeH active 阶段高度
 */
function attackFrames(
  startup: number,
  active: number,
  recovery: number,
  activeW = STD_W + 40,
  activeH = STD_H,
  atlasRow = 0,
): SpriteAnimation['frames'] {
  const frames: SpriteAnimation['frames'] = [];
  let col = 0;
  // startup: 蓄力/准备动作
  for (let i = 0; i < startup; i++) {
    frames.push({
      atlasX: col * STD_W, atlasY: atlasRow * STD_H,
      width: STD_W, height: STD_H,
      anchor: { x: STD_W / 2, y: STD_H },
      duration: F,
    });
    col++;
  }
  // active: 攻击判定帧，宽度延伸表示攻击范围
  for (let i = 0; i < active; i++) {
    frames.push({
      atlasX: col * activeW, atlasY: atlasRow * activeH,
      width: activeW, height: activeH,
      anchor: { x: activeW / 2, y: activeH },
      duration: F,
    });
    col++;
  }
  // recovery: 收招动作
  for (let i = 0; i < recovery; i++) {
    frames.push({
      atlasX: col * STD_W, atlasY: atlasRow * STD_H,
      width: STD_W, height: STD_H,
      anchor: { x: STD_W / 2, y: STD_H },
      duration: F,
    });
    col++;
  }
  return frames;
}

// ============================================================================
// Ryo 动画 Manifest — 样板角色完整动画数据
// ============================================================================
// 帧数据来源: frameDataConstants.ts (通常技) + frameDataChars.ts (必杀技/DM)
// 站姿/移动/跳跃等基础动画帧数为 placeholder，未来由 atlas 工具生成
// 攻击动画帧数严格对齐 FRAME_DATA 的 startup/active/recovery
// ============================================================================

export const RYO_ANIMATIONS: Record<string, SpriteAnimation> = {
  // ── 基础动作 ──────────────────────────────────────────────────────

  /** 站立待机 — MUGEN参考: 15帧×9ticks=135ticks(~2.25s), 呼吸摇摆
   *  帧节奏: 0-4 微上移(吸气) → 5-7 保持 → 8-14 回落(呼气)
   *  anchor.y偏移模拟呼吸：±1-2px垂直微动
   *  atlasX: 顺序网格布局, 每帧占 STD_W 像素宽
   */
  idle: {
    name: 'idle',
    loop: true,
    frames: [
      // inhale: body rises slightly
      { atlasX: 0 * STD_W, atlasY: 0, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 150 },
      { atlasX: 1 * STD_W, atlasY: 0, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H - 1 }, duration: 150 },
      { atlasX: 2 * STD_W, atlasY: 0, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H - 2 }, duration: 150 },
      { atlasX: 3 * STD_W, atlasY: 0, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H - 2 }, duration: 150 },
      { atlasX: 4 * STD_W, atlasY: 0, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H - 1 }, duration: 150 },
      // hold at peak
      { atlasX: 5 * STD_W, atlasY: 0, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H - 1 }, duration: 150 },
      { atlasX: 6 * STD_W, atlasY: 0, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 150 },
      { atlasX: 7 * STD_W, atlasY: 0, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 150 },
      // exhale: body settles back
      { atlasX: 8 * STD_W, atlasY: 0, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 150 },
      { atlasX: 9 * STD_W, atlasY: 0, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H + 1 }, duration: 150 },
      { atlasX: 10 * STD_W, atlasY: 0, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H + 1 }, duration: 150 },
      { atlasX: 11 * STD_W, atlasY: 0, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 150 },
      { atlasX: 12 * STD_W, atlasY: 0, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 150 },
      { atlasX: 13 * STD_W, atlasY: 0, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 150 },
      { atlasX: 14 * STD_W, atlasY: 0, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 150 },
    ],
  },

  /** 前走 — MUGEN参考: 10帧×5ticks=50ticks(~0.83s) */
  walk_forward: {
    name: 'walk_forward',
    loop: true,
    frames: placeholderFrames(10, 83, STD_W, STD_H, 1),
  },

  /** 后走 — MUGEN参考: 10帧×5ticks=50ticks */
  walk_backward: {
    name: 'walk_backward',
    loop: true,
    frames: placeholderFrames(10, 83, STD_W, STD_H, 2),
  },

  /** 垂直跳 — 8帧非循环 (起跳2 + 上升3 + 下降3) */
  jump_up: {
    name: 'jump_up',
    loop: false,
    frames: [
      // Takeoff: crouch-like launch
      { atlasX: 0 * STD_W, atlasY: 3 * STD_H, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 100 },
      { atlasX: 1 * STD_W, atlasY: 3 * STD_H, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 100 },
      // Ascent: arms up, legs tucked
      { atlasX: 2 * STD_W, atlasY: 3 * STD_H, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 83 },
      { atlasX: 3 * STD_W, atlasY: 3 * STD_H, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 83 },
      { atlasX: 4 * STD_W, atlasY: 3 * STD_H, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 83 },
      // Descent: extending down
      { atlasX: 5 * STD_W, atlasY: 3 * STD_H, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 83 },
      { atlasX: 6 * STD_W, atlasY: 3 * STD_H, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 83 },
      { atlasX: 7 * STD_W, atlasY: 3 * STD_H, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 100 },
    ],
  },

  /** 前跳 — 8帧非循环 (MUGEN ~40 ticks, 5 ticks/frame) */
  jump_forward: {
    name: 'jump_forward',
    loop: false,
    frames: [
      { atlasX: 0 * STD_W, atlasY: 4 * STD_H, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 100 },
      { atlasX: 1 * STD_W, atlasY: 4 * STD_H, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 100 },
      { atlasX: 2 * STD_W, atlasY: 4 * STD_H, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 83 },
      { atlasX: 3 * STD_W, atlasY: 4 * STD_H, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 83 },
      { atlasX: 4 * STD_W, atlasY: 4 * STD_H, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 83 },
      { atlasX: 5 * STD_W, atlasY: 4 * STD_H, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 83 },
      { atlasX: 6 * STD_W, atlasY: 4 * STD_H, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 83 },
      { atlasX: 7 * STD_W, atlasY: 4 * STD_H, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 100 },
    ],
  },

  /** 后跳 — 8帧非循环 */
  jump_backward: {
    name: 'jump_backward',
    loop: false,
    frames: [
      { atlasX: 0 * STD_W, atlasY: 5 * STD_H, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 100 },
      { atlasX: 1 * STD_W, atlasY: 5 * STD_H, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 100 },
      { atlasX: 2 * STD_W, atlasY: 5 * STD_H, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 83 },
      { atlasX: 3 * STD_W, atlasY: 5 * STD_H, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 83 },
      { atlasX: 4 * STD_W, atlasY: 5 * STD_H, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 83 },
      { atlasX: 5 * STD_W, atlasY: 5 * STD_H, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 83 },
      { atlasX: 6 * STD_W, atlasY: 5 * STD_H, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 83 },
      { atlasX: 7 * STD_W, atlasY: 5 * STD_H, width: STD_W, height: STD_H, anchor: { x: STD_W / 2, y: STD_H }, duration: 100 },
    ],
  },

  // ── 通常技 ──────────────────────────────────────────────────────
  // 帧数对齐 FRAME_DATA: startup + active + recovery

  /** 远A (远距离轻拳) — startup=6 + active=3 + recovery=5 = 14帧 */
  stand_a: {
    name: 'stand_a',
    loop: false,
    cancelStartFrame: 9, // startup(6) + active(3) 之后可取消
    frames: attackFrames(6, 3, 5),
  },

  /** 远B (远距离轻踢) — startup=7 + active=3 + recovery=14 = 24帧 */
  stand_b: {
    name: 'stand_b',
    loop: false,
    cancelStartFrame: 10, // startup(7) + active(3) 之后可取消
    frames: attackFrames(7, 3, 14),
  },

  /** 远C (远距离重拳) — startup=7 + active=3 + recovery=20 = 30帧 */
  stand_c: {
    name: 'stand_c',
    loop: false,
    cancelStartFrame: 10, // startup(7) + active(3) 之后可取消
    frames: attackFrames(7, 3, 20, STD_W + 50),
  },

  /** 远D (远距离重踢) — startup=10 + active=8 + recovery=20 = 38帧 */
  stand_d: {
    name: 'stand_d',
    loop: false,
    cancelStartFrame: 18, // startup(10) + active(8) 之后可取消
    frames: attackFrames(10, 8, 20, STD_W + 30),
  },

  /** 蹲A (蹲轻拳) — startup=5 + active=4 + recovery=7 = 16帧 */
  crouch_a: {
    name: 'crouch_a',
    loop: false,
    cancelStartFrame: 9, // startup(5) + active(4) 之后可取消
    frames: attackFrames(5, 4, 7),
  },

  /** 蹲B (蹲轻踢) — startup=5 + active=5 + recovery=5 = 15帧 */
  crouch_b: {
    name: 'crouch_b',
    loop: false,
    cancelStartFrame: 10, // startup(5) + active(5) 之后可取消
    frames: attackFrames(5, 5, 5),
  },

  /** 蹲C (蹲重拳) — startup=7 + active=5 + recovery=16 = 28帧 */
  crouch_c: {
    name: 'crouch_c',
    loop: false,
    cancelStartFrame: 12, // startup(7) + active(5) 之后可取消
    frames: attackFrames(7, 5, 16, STD_W + 40),
  },

  /** 蹲D (蹲重踢) — startup=5 + active=6 + recovery=31 = 42帧 */
  crouch_d: {
    name: 'crouch_d',
    loop: false,
    cancelStartFrame: 11, // startup(5) + active(6) 之后可取消
    frames: attackFrames(5, 6, 31, STD_W + 50),
  },

  // ── 受击/防御/倒地/起身 ──────────────────────────────────────────

  /** 站立受击 — 3帧非循环, 受击反应 */
  hurt_standing: {
    name: 'hurt_standing',
    loop: false,
    frames: placeholderFrames(3, F * 5, STD_W, STD_H, 6), // 每帧约5游戏帧时长
  },

  /** 蹲受击 — 3帧非循环 */
  hurt_crouching: {
    name: 'hurt_crouching',
    loop: false,
    frames: placeholderFrames(3, F * 5, STD_W, STD_H, 7),
  },

  /** 受击硬直 (通用 hitstun) — 11帧非循环 */
  hitstun: {
    name: 'hitstun',
    loop: false,
    frames: placeholderFrames(11, F, STD_W, STD_H, 8),
  },

  /** 防御硬直 (通用 blockstun) — 9帧非循环 */
  blockstun: {
    name: 'blockstun',
    loop: false,
    frames: placeholderFrames(9, F, STD_W, STD_H, 9),
  },

  /** 倒地 — 5帧非循环 (倒下2 + 躺地3) */
  knockdown: {
    name: 'knockdown',
    loop: false,
    frames: [
      ...placeholderFrames(2, F * 3, STD_W, STD_H, 10), // 倒下过程, 每帧3游戏帧
      ...placeholderFrames(3, F * 8, STD_W, STD_H, 10), // 躺地, 每帧较长
    ],
  },

  /** 起身 — 8帧非循环 */
  wakeup: {
    name: 'wakeup',
    loop: false,
    frames: placeholderFrames(8, F, STD_W, STD_H, 11),
  },

  // ── 胜利 ────────────────────────────────────────────────────────

  /** 胜利 — 4帧非循环, 200ms/帧 */
  win: {
    name: 'win',
    loop: false,
    frames: placeholderFrames(4, 200, STD_W, STD_H, 12),
  },

  // ── 特殊状态 ────────────────────────────────────────────────────

  /** 眩晕 — 4帧循环, 摇晃动画 */
  dizzy: {
    name: 'dizzy',
    loop: true,
    frames: placeholderFrames(4, 200, STD_W, STD_H, 24),
  },

  /** 防御崩坏 — 3帧非循环, 被破防后的硬直 */
  guard_crush: {
    name: 'guard_crush',
    loop: false,
    frames: placeholderFrames(3, 150, STD_W, STD_H, 25),
  },

  /** 挑衅 — 6帧非循环, KOF2002 START键挑衅 */
  taunt: {
    name: 'taunt',
    loop: false,
    frames: placeholderFrames(6, 100, STD_W, STD_H, 26),
  },

  // ── 必杀技 ──────────────────────────────────────────────────────
  // 帧数对齐 FRAME_DATA (frameDataChars.ts RYO_* 系列)
  // 同时保留旧名 (koouken/ko_hou/dm_haou) 与 AttackType 映射名 (ryo_koou/ryo_ko_hou/dm_ten_ha_ou)

  /** 虎煌拳 (Ko'ou Ken) — ryo_koou: startup=12 + active=18 + recovery=34 = 64帧 */
  ryo_koou: {
    name: 'ryo_koou',
    loop: false,
    cancelStartFrame: 30, // startup(12) + active(18) 后进入可取消
    frames: attackFrames(12, 18, 34, STD_W + 60, STD_H + 20),
  },
  /** @deprecated 使用 ryo_koou */
  koouken: {
    name: 'koouken',
    loop: false,
    cancelStartFrame: 30,
    frames: attackFrames(12, 18, 34, STD_W + 60, STD_H + 20),
  },

  /** 虎咆 (Ko Hou) — ryo_ko_hou: startup=5 + active=5 + recovery=25 = 35帧 */
  ryo_ko_hou: {
    name: 'ryo_ko_hou',
    loop: false,
    cancelStartFrame: 10, // startup(5) + active(5) 后可取消
    frames: attackFrames(5, 5, 25, STD_W + 30, STD_H + 30),
  },
  /** @deprecated 使用 ryo_ko_hou */
  ko_hou: {
    name: 'ko_hou',
    loop: false,
    cancelStartFrame: 10,
    frames: attackFrames(5, 5, 25, STD_W + 30, STD_H + 30),
  },

  /** 虎煌拳C (Ko'ou Ken C) — ryo_koou_c: startup=13 + active=20 + recovery=32 = 65帧 */
  ryo_koou_c: {
    name: 'ryo_koou_c',
    loop: false,
    cancelStartFrame: 33,
    frames: attackFrames(13, 20, 32, STD_W + 70, STD_H + 25),
  },

  /** 虎咲C (Ko Hou C) — ryo_ko_hou_c: startup=7 + active=10 + recovery=30 = 47帧 */
  ryo_ko_hou_c: {
    name: 'ryo_ko_hou_c',
    loop: false,
    cancelStartFrame: 17,
    frames: attackFrames(7, 10, 30, STD_W + 35, STD_H + 35),
  },

  /** 飛燕疾風脚 (Hien) — ryo_hien: startup=10 + active=8 + recovery=22 = 40帧 */
  ryo_hien: {
    name: 'ryo_hien',
    loop: false,
    cancelStartFrame: 18, // startup(10) + active(8) 后可取消
    frames: attackFrames(10, 8, 22, STD_W + 40, STD_H + 10),
  },

  /** 霸王翔吼拳 (Haou) — ryo_haou: startup=10 + active=12 + recovery=22 = 44帧 */
  ryo_haou: {
    name: 'ryo_haou',
    loop: false,
    cancelStartFrame: 22, // startup(10) + active(12) 后可取消
    frames: attackFrames(10, 12, 22, STD_W + 50, STD_H + 30),
  },

  // ── 超必杀技 (DM) ───────────────────────────────────────────────

  /** 天地霸煌拳 (Ten Ha Ou) DM — dm_ten_ha_ou: startup=18 + active=10 + recovery=35 = 63帧 */
  dm_ten_ha_ou: {
    name: 'dm_ten_ha_ou',
    loop: false,
    cancelStartFrame: 28, // startup(18) + active(10) 后可取消
    frames: attackFrames(18, 10, 35, STD_W + 80, STD_H + 40),
  },
  /** @deprecated 使用 dm_ten_ha_ou */
  dm_haou: {
    name: 'dm_haou',
    loop: false,
    cancelStartFrame: 22,
    frames: attackFrames(10, 12, 22, STD_W + 80, STD_H + 40),
  },

  // ── 龍虎乱舞 DM/SDM/HSDM ────────────────────────────────────────

  /** 龍虎乱舞 DM — dm_ryuko_ranbu: startup=8 + active=10 + recovery=38 = 56帧 */
  dm_ryuko_ranbu: {
    name: 'dm_ryuko_ranbu',
    loop: false,
    cancelStartFrame: 18,
    frames: attackFrames(8, 10, 38, STD_W + 50, STD_H + 20),
  },

  /** 龍虎乱舞 SDM — sdm_ryuko_ranbu: startup=6 + active=13 + recovery=36 = 55帧 */
  sdm_ryuko_ranbu: {
    name: 'sdm_ryuko_ranbu',
    loop: false,
    cancelStartFrame: 19,
    frames: attackFrames(6, 13, 36, STD_W + 55, STD_H + 25),
  },

  // ── 移动 & 闪避 ──────────────────────────────────────────────

  /** 跑步 — 8帧循环 */
  run: {
    name: 'run',
    loop: true,
    frames: placeholderFrames(8, 83, STD_W, STD_H, 13),
  },

  /** 蹲姿 idle — 4帧循环 */
  crouch_idle: {
    name: 'crouch_idle',
    loop: true,
    frames: placeholderFrames(4, 150, STD_W, STD_H, 14),
  },

  /** 小跳 — 4帧非循环 */
  hop: {
    name: 'hop',
    loop: false,
    frames: placeholderFrames(4, 100, STD_W, STD_H, 15),
  },

  /** 后闪 — 6帧非循环 */
  backdash: {
    name: 'backdash',
    loop: false,
    frames: placeholderFrames(6, 67, STD_W, STD_H, 16),
  },

  /** 前滚 — 6帧非循环 */
  roll: {
    name: 'roll',
    loop: false,
    frames: placeholderFrames(6, 67, STD_W, STD_H, 17),
  },

  /** 后滚 — 6帧非循环 */
  back_roll: {
    name: 'back_roll',
    loop: false,
    frames: placeholderFrames(6, 67, STD_W, STD_H, 18),
  },

  // ── 近距离攻击 ──────────────────────────────────────────────

  /** 近A — startup=4 + active=5 + recovery=5 = 14帧 */
  close_a: {
    name: 'close_a',
    loop: false,
    cancelStartFrame: 9,
    frames: attackFrames(4, 5, 5),
  },

  /** 近B — startup=5 + active=3 + recovery=8 = 16帧 */
  close_b: {
    name: 'close_b',
    loop: false,
    cancelStartFrame: 8,
    frames: attackFrames(5, 3, 8),
  },

  /** 近C — startup=4 + active=5 + recovery=16 = 25帧 */
  close_c: {
    name: 'close_c',
    loop: false,
    cancelStartFrame: 9,
    frames: attackFrames(4, 5, 16, STD_W + 20),
  },

  /** 近D — startup=5 + active=6 + recovery=18 = 29帧 */
  close_d: {
    name: 'close_d',
    loop: false,
    cancelStartFrame: 11,
    frames: attackFrames(5, 6, 18, STD_W + 20),
  },

  // ── 空中攻击 ──────────────────────────────────────────────

  /** 跳A — active=9 frames */
  jump_a: {
    name: 'jump_a',
    loop: false,
    frames: placeholderFrames(9, F, STD_W, STD_H, 19),
  },

  /** 跳B — active=7 frames */
  jump_b: {
    name: 'jump_b',
    loop: false,
    frames: placeholderFrames(7, F, STD_W, STD_H, 20),
  },

  /** 跳C — active=3 frames */
  jump_c: {
    name: 'jump_c',
    loop: false,
    frames: attackFrames(2, 3, 5, STD_W + 15),
  },

  /** 跳D — active=5 frames */
  jump_d: {
    name: 'jump_d',
    loop: false,
    frames: attackFrames(2, 5, 5, STD_W + 20),
  },

  // ── 投技 ──────────────────────────────────────────────

  /** 投技 — startup=5 + active=2 + recovery=20 = 27帧 */
  throw_anim: {
    name: 'throw_anim',
    loop: false,
    frames: attackFrames(5, 2, 20),
  },

  // ── 防御 ──────────────────────────────────────────────

  /** 站防 — 1帧 */
  block_stand: {
    name: 'block_stand',
    loop: false,
    frames: placeholderFrames(1, 200, STD_W, STD_H, 21),
  },

  /** 蹲防 — 1帧 */
  block_crouch: {
    name: 'block_crouch',
    loop: false,
    frames: placeholderFrames(1, 200, STD_W, STD_H, 22),
  },

  /** 空防 — 1帧 */
  block_air: {
    name: 'block_air',
    loop: false,
    frames: placeholderFrames(1, 200, STD_W, STD_H, 23),
  },

  // ── Ryo 命令通常技 ──────────────────────────────────────

  /** 冰柱割り →+A (overhead) — startup=8 + active=4 + recovery=12 = 24帧 */
  ryo_tsurizao: {
    name: 'ryo_tsurizao',
    loop: false,
    cancelStartFrame: 12,
    frames: attackFrames(8, 4, 12, STD_W + 15),
  },

  /** 落蹴 ↘+B (low) — startup=7 + active=4 + recovery=14 = 25帧 */
  ryo_orishi: {
    name: 'ryo_orishi',
    loop: false,
    cancelStartFrame: 11,
    frames: attackFrames(7, 4, 14),
  },
};

// ============================================================================
// 全角色最小动画 Manifest — 27 个非 Ryo 角色
// ============================================================================
// 每个角色获得 9 个基础动画 + 角色专属必杀技动画（占位帧）
// 基础动画帧数/时长对齐任务规范
// 必杀技名称来自 frameDataChars.ts 中各角色的关键招式
// ============================================================================

/** 创建占位动画条目 */
function makeAnim(name: string, frameCount: number, loop: boolean, durationMs: number): SpriteAnimation {
  return { name, frames: placeholderFrames(frameCount, durationMs), loop };
}

/**
 * 创建最小通用动画集 — 9 个基础动画
 * idle / walk_forward / crouch / jump / stand_a / stand_c / hurt / knockdown / win
 */
function createMinimalAnimations(): Record<string, SpriteAnimation> {
  return {
    idle:         makeAnim('idle',         4, true,  150),
    walk_forward: makeAnim('walk_forward', 6, true,  100),
    crouch:       makeAnim('crouch',       1, false, 200),
    jump:         makeAnim('jump',         6, false,  80),
    stand_a:      makeAnim('stand_a',      3, false, 100),
    stand_c:      makeAnim('stand_c',      4, false, 120),
    hurt:         makeAnim('hurt',         3, false, 100),
    knockdown:    makeAnim('knockdown',    4, false, 150),
    win:          makeAnim('win',          3, false, 200),
    dizzy:        makeAnim('dizzy',        4, true,  200),
    guard_crush:  makeAnim('guard_crush',  3, false, 150),
    taunt:        makeAnim('taunt',        6, false, 100),
  };
}

/** 创建必杀技占位动画 — 4 帧, 不循环, 100ms */
function specialAnim(name: string): SpriteAnimation {
  return makeAnim(name, 4, false, 100);
}

/** 创建超必杀技 (DM) 占位动画 — 6 帧, 不循环, 120ms */
function dmAnim(name: string): SpriteAnimation {
  return makeAnim(name, 6, false, 120);
}

// ── 角色专属动画生成函数 ──────────────────────────────────────────────

/** Kyo — 鬼焼き/暗払い/荒咬み/RED Kicks + DM 大蛇薙 */
function kyoAnimations(): Record<string, SpriteAnimation> {
  return {
    ...createMinimalAnimations(),
    oniyaki:        specialAnim('oniyaki'),
    yamibarai:      specialAnim('yamibarai'),
    aragami:        specialAnim('aragami'),
    red_kick:       specialAnim('red_kick'),
    dokugami:       specialAnim('dokugami'),
    dm_orochinagi:  dmAnim('dm_orochinagi'),
  };
}

/** Iori — 葵花/鬼焼き/屑風/琴月 + DM 八稚女 */
function ioriAnimations(): Record<string, SpriteAnimation> {
  return {
    ...createMinimalAnimations(),
    aoihana:     specialAnim('aoihana'),
    yamibarai:   specialAnim('yamibarai'),
    oniyaki:     specialAnim('oniyaki'),
    kototsuki:   specialAnim('kototsuki'),
    kuzukaze:    specialAnim('kuzukaze'),
    dm_yaotome:  dmAnim('dm_yaotome'),
  };
}

/** Terry — Power Wave / Burn Knuckle / Crack Shot / Rising Tackle + DM Power Geyser */
function terryAnimations(): Record<string, SpriteAnimation> {
  return {
    ...createMinimalAnimations(),
    power_wave:      specialAnim('power_wave'),
    burn_knuckle:    specialAnim('burn_knuckle'),
    crack_shot:      specialAnim('crack_shot'),
    power_dunk:      specialAnim('power_dunk'),
    rising_tackle:   specialAnim('rising_tackle'),
    dm_power_geyser: dmAnim('dm_power_geyser'),
  };
}

/** Andy — 飞翔拳 / 昇龍弾 / 斬影流星拳 / 空破弾 + DM 超裂破弾 */
function andyAnimations(): Record<string, SpriteAnimation> {
  return {
    ...createMinimalAnimations(),
    hishou_ken:           specialAnim('hishou_ken'),
    shouryuu_dan:         specialAnim('shouryuu_dan'),
    zanei_ryusei_ken:     specialAnim('zanei_ryusei_ken'),
    kuhadan:              specialAnim('kuhadan'),
    dm_cho_reppa_dan:     dmAnim('dm_cho_reppa_dan'),
  };
}

/** Joe — Hurricane Upper / Tiger Kick / 爆裂拳 / 黄金のカカト + DM Screw Upper */
function joeAnimations(): Record<string, SpriteAnimation> {
  return {
    ...createMinimalAnimations(),
    hurricane:       specialAnim('hurricane'),
    tiger_kick:      specialAnim('tiger_kick'),
    bakuretsuken:    specialAnim('bakuretsuken'),
    slash_kick:      specialAnim('slash_kick'),
    ougon_kakato:    specialAnim('ougon_kakato'),
    dm_screw_upper:  dmAnim('dm_screw_upper'),
  };
}

/** Kim — 飛燕斬 / 半月斬 / 飛翔脚 / 三連脚 + DM 鳳凰脚 */
function kimAnimations(): Record<string, SpriteAnimation> {
  return {
    ...createMinimalAnimations(),
    hienzan:        specialAnim('hienzan'),
    hangetsu:       specialAnim('hangetsu'),
    hishou:         specialAnim('hishou'),
    sanren:         specialAnim('sanren'),
    dm_yatagarasu:  dmAnim('dm_yatagarasu'),
  };
}

/** Chang — 鉄球大回転 / 鉄球粉砕 / 鉄球飛燕斬 + DM 鉄球大破壊 */
function changAnimations(): Record<string, SpriteAnimation> {
  return {
    ...createMinimalAnimations(),
    tekyuu_kaiten:       specialAnim('tekyuu_kaiten'),
    tekyuu_fasshu:       specialAnim('tekyuu_fasshu'),
    tekyuu_hien_zan:     specialAnim('tekyuu_hien_zan'),
    dai_hakki:           specialAnim('dai_hakki'),
    dm_tekyuu_dai_sessa: dmAnim('dm_tekyuu_dai_sessa'),
  };
}

/** Choi — 飛翔口脚 / 回転飛燕斬 / 鳳翼天心 + DM 真超鳳翼 */
function choiAnimations(): Record<string, SpriteAnimation> {
  return {
    ...createMinimalAnimations(),
    hishou_kyaku:         specialAnim('hishou_kyaku'),
    kaiten_hien_zan:      specialAnim('kaiten_hien_zan'),
    houyoku_tenshin:      specialAnim('houyoku_tenshin'),
    tataki_komyaku:       specialAnim('tataki_komyaku'),
    dm_shin_chou_houyoku: dmAnim('dm_shin_chou_houyoku'),
  };
}

/** Robert — 龍撃拳 / 龍斬 / 飛燕龍脚 / 幻影脚 + DM 龍虎乱舞 */
function robertAnimations(): Record<string, SpriteAnimation> {
  return {
    ...createMinimalAnimations(),
    ryu_geki:        specialAnim('ryu_geki'),
    ryu_zan:         specialAnim('ryu_zan'),
    hien_ryu_jin:    specialAnim('hien_ryu_jin'),
    genei_kyaku:     specialAnim('genei_kyaku'),
    dm_ryuko_ranbu:  dmAnim('dm_ryuko_ranbu'),
  };
}

/** Leona — Moon Slasher / Ear Ring / Grand Saber / Baltic Launcher + DM V Slasher */
function leonaAnimations(): Record<string, SpriteAnimation> {
  return {
    ...createMinimalAnimations(),
    moon_slash:       specialAnim('moon_slash'),
    ear_ring:         specialAnim('ear_ring'),
    grand_saber:     specialAnim('grand_saber'),
    baltic_launcher: specialAnim('baltic_launcher'),
    dm_v_slasher:    dmAnim('dm_v_slasher'),
  };
}

/** Ralf — Vulcan Punch / Backbreaker / Gatling Attack + DM Galactica Phantom */
function ralfAnimations(): Record<string, SpriteAnimation> {
  return {
    ...createMinimalAnimations(),
    vulcan_punch:          specialAnim('vulcan_punch'),
    backbreaker:           specialAnim('backbreaker'),
    gatling_attack:        specialAnim('gatling_attack'),
    ralf_kick:             specialAnim('ralf_kick'),
    dm_galactica_phantom:  dmAnim('dm_galactica_phantom'),
  };
}

/** Clark — Argentine Backbreaker / Napalm Stretch / Flash Elbow + DM Super Argentine */
function clarkAnimations(): Record<string, SpriteAnimation> {
  return {
    ...createMinimalAnimations(),
    argentine:          specialAnim('argentine'),
    flash_elbow:        specialAnim('flash_elbow'),
    napalm_stretch:     specialAnim('napalm_stretch'),
    mount_tackle:       specialAnim('mount_tackle'),
    dm_super_argentine: dmAnim('dm_super_argentine'),
  };
}

/** Athena — Psycho Ball / Psycho Sword / Phoenix Arrow / Teleport + DM Shining Crystal Bit */
function athenaAnimations(): Record<string, SpriteAnimation> {
  return {
    ...createMinimalAnimations(),
    psycho_ball:        specialAnim('psycho_ball'),
    psycho_sword:       specialAnim('psycho_sword'),
    phoenix_arrow:      specialAnim('phoenix_arrow'),
    psycho_teleport:    specialAnim('psycho_teleport'),
    dm_shining_crystal: dmAnim('dm_shining_crystal'),
  };
}

/** Mai — 花蝶扇 / 飛翔龍炎陣 / ムササビ / 必殺忍蜂 + DM 超必殺忍蜂 */
function maiAnimations(): Record<string, SpriteAnimation> {
  return {
    ...createMinimalAnimations(),
    ka_cho_sen:        specialAnim('ka_cho_sen'),
    hisho_ryu_en_jin:  specialAnim('hisho_ryu_en_jin'),
    musasabi:          specialAnim('musasabi'),
    hissatsu_shinobi:  specialAnim('hissatsu_shinobi'),
    dm_chou_hissatsu:  dmAnim('dm_chou_hissatsu'),
  };
}

/** K' — Eins Trigger / Second Shell / Crow Bite / Minute Spike + DM Chain Drive */
function kdashAnimations(): Record<string, SpriteAnimation> {
  return {
    ...createMinimalAnimations(),
    eins:            specialAnim('eins'),
    second_shell:    specialAnim('second_shell'),
    crow_bite:       specialAnim('crow_bite'),
    one_inch:        specialAnim('one_inch'),
    minute_spike:    specialAnim('minute_spike'),
    dm_chain_drive:  dmAnim('dm_chain_drive'),
  };
}

/** Kula — Diamond Breath / Counter Shell / Diamond Edge / Rei Spin + DM Freeze */
function kulaAnimations(): Record<string, SpriteAnimation> {
  return {
    ...createMinimalAnimations(),
    breath:       specialAnim('breath'),
    shell:        specialAnim('shell'),
    lay:          specialAnim('lay'),
    edge:         specialAnim('edge'),
    rei_spin:     specialAnim('rei_spin'),
    dm_freeze:    dmAnim('dm_freeze'),
  };
}

/** Yashiro — 虎舞/斧旋/upper/無殺 + DM Armageddon Busters */
function yashiroAnimations(): Record<string, SpriteAnimation> {
  return {
    ...createMinimalAnimations(),
    shuu_wani:              specialAnim('shuu_wani'),
    juu_zutsu:              specialAnim('juu_zutsu'),
    upper_du:               specialAnim('upper_du'),
    musatsu:                specialAnim('musatsu'),
    dm_armageddon_busters:  dmAnim('dm_armageddon_busters'),
  };
}

/** Shermie — Shermie Shoot / Carnival / Spiral / Axle Spin + DM Shermie Flash */
function shermieAnimations(): Record<string, SpriteAnimation> {
  return {
    ...createMinimalAnimations(),
    shermie_shoot:     specialAnim('shermie_shoot'),
    shermie_carnival:  specialAnim('shermie_carnival'),
    shermie_spiral:    specialAnim('shermie_spiral'),
    shermie_axle_spin: specialAnim('shermie_axle_spin'),
    dm_shermie_flash:  dmAnim('dm_shermie_flash'),
  };
}

/** Chris — Shot Weaver / Twister Drive / Scramble Dash + DM Chain Slide Touch */
function chrisAnimations(): Record<string, SpriteAnimation> {
  return {
    ...createMinimalAnimations(),
    shot_weave:      specialAnim('shot_weave'),
    twister_drive:   specialAnim('twister_drive'),
    scramble_dash:   specialAnim('scramble_dash'),
    tsuki_tsuka:     specialAnim('tsuki_tsuka'),
    dm_chain_slide:  dmAnim('dm_chain_slide'),
  };
}

/** Mature — Metal Massacre / Heaven's Gate / Ecstasy / Vanilla Rush + DM Nocturnal Light */
function matureAnimations(): Record<string, SpriteAnimation> {
  return {
    ...createMinimalAnimations(),
    massacre:      specialAnim('massacre'),
    heavens_gate:  specialAnim('heavens_gate'),
    ecstasy:       specialAnim('ecstasy'),
    vanilla_rush:  specialAnim('vanilla_rush'),
    dm_nocturnal:  dmAnim('dm_nocturnal'),
  };
}

/** Vice — Outrage / Black End / Mayhem / Decide + DM Negative Gain */
function viceAnimations(): Record<string, SpriteAnimation> {
  return {
    ...createMinimalAnimations(),
    outrage:          specialAnim('outrage'),
    black_end:        specialAnim('black_end'),
    mayhem:           specialAnim('mayhem'),
    decide:           specialAnim('decide'),
    dm_negative_gain: dmAnim('dm_negative_gain'),
  };
}

/** Billy — 三節棍 / 旋風棍 / 飛燕斬 / 流星脚 + DM 火炎旋風陣 */
function billyAnimations(): Record<string, SpriteAnimation> {
  return {
    ...createMinimalAnimations(),
    sansetsu_kon:   specialAnim('sansetsu_kon'),
    senpu_kon:      specialAnim('senpu_kon'),
    hien_zan:       specialAnim('hien_zan'),
    ryusei_kyaku:   specialAnim('ryusei_kyaku'),
    dm_kaen_senpu:  dmAnim('dm_kaen_senpu'),
  };
}

/** Yamazaki — Snake Arm / Sandstorm / 蛇使い / 爆弾拳 + DM Guillotine */
function yamazakiAnimations(): Record<string, SpriteAnimation> {
  return {
    ...createMinimalAnimations(),
    snake_arm:      specialAnim('snake_arm'),
    sandstorm:      specialAnim('sandstorm'),
    hebi_tsukai:    specialAnim('hebi_tsukai'),
    bakudan_ken:    specialAnim('bakudan_ken'),
    dm_guillotine:  dmAnim('dm_guillotine'),
  };
}

/** Mary — Straight Slicer / Spider / Vertical Arrow / Backdrop Real + DM Typhoon */
function maryAnimations(): Record<string, SpriteAnimation> {
  return {
    ...createMinimalAnimations(),
    straight_slicer:  specialAnim('straight_slicer'),
    spider:           specialAnim('spider'),
    vertical_arrow:   specialAnim('vertical_arrow'),
    backdrop_real:    specialAnim('backdrop_real'),
    dm_typhoon:       dmAnim('dm_typhoon'),
  };
}

/** Xiangfei — 万泊/天弾/麻保飛車/猿臂/円閉 + DM 超カリンガ */
function xiangfeiAnimations(): Record<string, SpriteAnimation> {
  return {
    ...createMinimalAnimations(),
    nanpa:           specialAnim('nanpa'),
    tenpatsu:        specialAnim('tenpatsu'),
    maho_hisha:      specialAnim('maho_hisha'),
    manpi:           specialAnim('manpi'),
    enzan:           specialAnim('enzan'),
    dm_cho_ka_ringa: dmAnim('dm_cho_ka_ringa'),
  };
}

/** Kasumi — 皇拳/重ね当て/無劫斬/崩山天 + DM 超無劫斬 */
function kasumiAnimations(): Record<string, SpriteAnimation> {
  return {
    ...createMinimalAnimations(),
    koou_ken:          specialAnim('koou_ken'),
    kasane_ate:        specialAnim('kasane_ate'),
    mukigenzan:        specialAnim('mukigenzan'),
    hakusanten:        specialAnim('hakusanten'),
    dm_cho_mukigenzan: dmAnim('dm_cho_mukigenzan'),
  };
}

// ── 角色动画映射表 ────────────────────────────────────────────────────
// ryo 由 RYO_ANIMATIONS 处理，不在此表中

const CHARACTER_ANIMATION_BUILDERS: Record<string, () => Record<string, SpriteAnimation>> = {
  kyo:      kyoAnimations,
  iori:     ioriAnimations,
  terry:    terryAnimations,
  andy:     andyAnimations,
  joe:      joeAnimations,
  kim:      kimAnimations,
  chang:    changAnimations,
  choi:     choiAnimations,
  robert:   robertAnimations,
  leona:    leonaAnimations,
  ralf:     ralfAnimations,
  clark:    clarkAnimations,
  athena:   athenaAnimations,
  mai:      maiAnimations,
  kdash:    kdashAnimations,
  kula:     kulaAnimations,
  yashiro:  yashiroAnimations,
  shermie:  shermieAnimations,
  chris:    chrisAnimations,
  mature:   matureAnimations,
  vice:     viceAnimations,
  billy:    billyAnimations,
  yamazaki: yamazakiAnimations,
  mary:     maryAnimations,
  xiangfei: xiangfeiAnimations,
  kasumi:   kasumiAnimations,
};

/**
 * 全角色 fallback 颜色表
 *
 * 29个角色按 ROSTER 注册顺序排列。
 * body/head 暂用统一肤色，未来替换为角色精确 palette 后可区分。
 */
const CHARACTER_COLORS: Record<string, { body: string; head: string; outfit: string; hair: string }> = {
  // ── 日本队 ──
  kyo:    { body: '#FFD699', head: '#FFD699', outfit: '#FF6600', hair: '#1A1A2E' },
  iori:   { body: '#FFD699', head: '#FFD699', outfit: '#AA1133', hair: '#C41E3A' },
  // ── 饿狼队 ──
  terry:  { body: '#FFD699', head: '#FFD699', outfit: '#CC8800', hair: '#FFD700' },
  andy:   { body: '#FFD699', head: '#FFD699', outfit: '#FFAA22', hair: '#DAA520' },
  joe:    { body: '#FFD699', head: '#FFD699', outfit: '#FF8800', hair: '#2F2F2F' },
  // ── 韩国队 ──
  kim:    { body: '#FFD699', head: '#FFD699', outfit: '#2288CC', hair: '#1A1A2E' },
  chang:  { body: '#FFD699', head: '#FFD699', outfit: '#885522', hair: '#2F2F2F' },
  choi:   { body: '#FFD699', head: '#FFD699', outfit: '#66CC66', hair: '#4A4A4A' },
  // ── 极限流队 ──
  ryo:    { body: '#FFD699', head: '#FFD699', outfit: '#DD6600', hair: '#8B4513' },
  robert: { body: '#FFD699', head: '#FFD699', outfit: '#22AA44', hair: '#DAA520' },
  // ── 怒队 ──
  leona:  { body: '#FFD699', head: '#FFD699', outfit: '#2266BB', hair: '#C0C0C0' },
  ralf:   { body: '#FFD699', head: '#FFD699', outfit: '#CC6633', hair: '#8B4513' },
  clark:  { body: '#FFD699', head: '#FFD699', outfit: '#556B2F', hair: '#DAA520' },
  // ── 超能力队 ──
  athena: { body: '#FFD699', head: '#FFD699', outfit: '#FF66AA', hair: '#8B008B' },
  // ── 女性格斗家队 ──
  mai:    { body: '#FFD699', head: '#FFD699', outfit: '#FF4488', hair: '#1A1A2E' },
  // ── K'队 ──
  kdash:  { body: '#FFD699', head: '#FFD699', outfit: '#444466', hair: '#C0C0C0' },
  kula:   { body: '#FFD699', head: '#FFD699', outfit: '#4488CC', hair: '#B0C4DE' },
  // ── 大蛇队 ──
  yashiro:{ body: '#FFD699', head: '#FFD699', outfit: '#664488', hair: '#E8E8E8' },
  shermie:{ body: '#FFD699', head: '#FFD699', outfit: '#CC44AA', hair: '#8B4513' },
  chris:  { body: '#FFD699', head: '#FFD699', outfit: '#FF8844', hair: '#DAA520' },
  // ── 大蛇四天王 ──
  mature: { body: '#FFD699', head: '#FFD699', outfit: '#882255', hair: '#DAA520' },
  vice:   { body: '#FFD699', head: '#FFD699', outfit: '#3366AA', hair: '#C0C0C0' },
  // ── 其他 ──
  billy:  { body: '#FFD699', head: '#FFD699', outfit: '#4488CC', hair: '#FFD700' },
  yamazaki:{ body: '#FFD699', head: '#FFD699', outfit: '#556622', hair: '#1A1A2E' },
  mary:   { body: '#FFD699', head: '#FFD699', outfit: '#5588CC', hair: '#DAA520' },
  xiangfei:{ body: '#FFD699', head: '#FFD699', outfit: '#EE6688', hair: '#1A1A2E' },
  kasumi: { body: '#FFD699', head: '#FFD699', outfit: '#DD4466', hair: '#1A1A2E' },
};

// 填充 manifest — 每个角色创建最小条目 + 角色专属动画
// Ryo 使用 RYO_ANIMATIONS（样板角色完整数据），其他角色使用专属动画生成函数
for (const [charId, colors] of Object.entries(CHARACTER_COLORS)) {
  const animations = charId === 'ryo'
    ? RYO_ANIMATIONS
    : (CHARACTER_ANIMATION_BUILDERS[charId]?.() ?? createMinimalAnimations());

  const base: CharacterSpriteManifest = {
    charId,
    atlasPath: `assets/sprites/${charId}.png`,
    animations,
    fallbackColors: colors,
  };

  // Ryo 作为样板角色，拥有完整的 4 色 palette 变体
  if (charId === 'ryo') {
    base.palettes = [
      // P1: 橙色道服 + 棕发 (默认)
      ['#DD6600', '#8B4513', '#FFD699', '#222222'],
      // P2: 红色道服 + 黑发
      ['#CC2200', '#1A1A2E', '#FFD699', '#333333'],
      // P3: 白色道服 + 金发
      ['#DDDDDD', '#DAA520', '#FFD699', '#222222'],
      // P4: 黑色道服 + 银发
      ['#222222', '#C0C0C0', '#FFD699', '#444444'],
    ];
  }

  SPRITE_MANIFEST.characters[charId] = base;
}
