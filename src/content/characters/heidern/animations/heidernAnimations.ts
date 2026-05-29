/**
 * Heidern Content Package — Animation Metadata
 *
 * 动作帧元数据: 动作列表、帧数、循环属性、过渡类型。
 * 实际帧序列数据来自 core/spriteManifestData.ts, 此文件只放元数据描述层。
 *
 * Heidern's animations reflect his military mercenary style:
 * precise, disciplined movements with knife strikes and grabs.
 *
 * 归属: content/characters/heidern/animations/ — 只放"动作帧是什么"
 */

export interface AnimationMeta {
  /** 动作名称 */
  name: string;
  /** 动作类型 */
  type: 'loop' | 'once' | 'attack';
  /** 总帧数 */
  totalFrames: number;
  /** 每帧tick数 */
  ticksPerFrame: number;
  /** 是否循环 */
  loop: boolean;
  /** 过渡类型 */
  transition: 'snap' | 'ease_in' | 'ease_out' | 'blend';
  /** 描述 */
  description: string;
}

export const HEIDERN_ANIMATION_META: Record<string, AnimationMeta> = {
  // === 基础动作 ===
  idle:           { name: 'idle', type: 'loop', totalFrames: 11, ticksPerFrame: 5, loop: true, transition: 'blend', description: '站立待机,军人体态,双手自然下垂' },
  walk_forward:   { name: 'walk_forward', type: 'loop', totalFrames: 6, ticksPerFrame: 6, loop: true, transition: 'ease_in', description: '前进移动,军人步伐' },
  walk_backward:  { name: 'walk_backward', type: 'loop', totalFrames: 6, ticksPerFrame: 7, loop: true, transition: 'ease_in', description: '后退移动,保持警觉' },
  run:            { name: 'run', type: 'loop', totalFrames: 2, ticksPerFrame: 4, loop: true, transition: 'ease_in', description: '跑步前冲' },
  crouch:         { name: 'crouch', type: 'loop', totalFrames: 1, ticksPerFrame: 8, loop: true, transition: 'blend', description: '蹲下姿态' },
  block:          { name: 'block', type: 'loop', totalFrames: 2, ticksPerFrame: 3, loop: true, transition: 'snap', description: '站立防御' },
  jump_up:        { name: 'jump_up', type: 'once', totalFrames: 8, ticksPerFrame: 5, loop: false, transition: 'ease_out', description: '垂直跳跃' },
  jump_forward:   { name: 'jump_forward', type: 'once', totalFrames: 10, ticksPerFrame: 5, loop: false, transition: 'ease_out', description: '前跳' },
  jump_backward:  { name: 'jump_backward', type: 'once', totalFrames: 10, ticksPerFrame: 5, loop: false, transition: 'ease_out', description: '后跳' },
  backdash:       { name: 'backdash', type: 'once', totalFrames: 12, ticksPerFrame: 2, loop: false, transition: 'snap', description: '后撤步' },
  hop:            { name: 'hop', type: 'once', totalFrames: 6, ticksPerFrame: 4, loop: false, transition: 'ease_out', description: '小跳' },
  hyper_jump:     { name: 'hyper_jump', type: 'once', totalFrames: 12, ticksPerFrame: 5, loop: false, transition: 'ease_out', description: '超跳' },
  run_jump:       { name: 'run_jump', type: 'once', totalFrames: 10, ticksPerFrame: 5, loop: false, transition: 'ease_out', description: '跑跳' },
  roll:           { name: 'roll', type: 'once', totalFrames: 16, ticksPerFrame: 2, loop: false, transition: 'snap', description: '前滚回避' },
  back_roll:      { name: 'back_roll', type: 'once', totalFrames: 16, ticksPerFrame: 2, loop: false, transition: 'snap', description: '后滚回避' },
  air_block:      { name: 'air_block', type: 'loop', totalFrames: 2, ticksPerFrame: 4, loop: true, transition: 'snap', description: '空中防御' },
  throw_anim:     { name: 'throw_anim', type: 'once', totalFrames: 20, ticksPerFrame: 2, loop: false, transition: 'snap', description: '投技' },

  // === 通常技 ===
  stand_a:  { name: 'stand_a', type: 'attack', totalFrames: 14, ticksPerFrame: 2, loop: false, transition: 'snap', description: '远A轻拳,军刀术 jab' },
  stand_b:  { name: 'stand_b', type: 'attack', totalFrames: 24, ticksPerFrame: 2, loop: false, transition: 'snap', description: '远B轻踢' },
  stand_c:  { name: 'stand_c', type: 'attack', totalFrames: 30, ticksPerFrame: 2, loop: false, transition: 'snap', description: '远C重拳,军刀斩' },
  stand_d:  { name: 'stand_d', type: 'attack', totalFrames: 38, ticksPerFrame: 2, loop: false, transition: 'snap', description: '远D重踢,击倒' },
  crouch_a: { name: 'crouch_a', type: 'attack', totalFrames: 16, ticksPerFrame: 2, loop: false, transition: 'snap', description: '蹲A轻拳' },
  crouch_b: { name: 'crouch_b', type: 'attack', totalFrames: 15, ticksPerFrame: 2, loop: false, transition: 'snap', description: '蹲B下段轻踢' },
  crouch_c: { name: 'crouch_c', type: 'attack', totalFrames: 28, ticksPerFrame: 2, loop: false, transition: 'snap', description: '蹲C重拳' },
  crouch_d: { name: 'crouch_d', type: 'attack', totalFrames: 42, ticksPerFrame: 2, loop: false, transition: 'snap', description: '蹲D下段重踢,扫堂腿' },
  jump_a:   { name: 'jump_a', type: 'attack', totalFrames: 12, ticksPerFrame: 2, loop: false, transition: 'snap', description: '空中A轻拳' },
  jump_b:   { name: 'jump_b', type: 'attack', totalFrames: 14, ticksPerFrame: 2, loop: false, transition: 'snap', description: '空中B轻踢' },
  jump_c:   { name: 'jump_c', type: 'attack', totalFrames: 18, ticksPerFrame: 2, loop: false, transition: 'snap', description: '空中C重拳,空中军刀斩' },
  jump_d:   { name: 'jump_d', type: 'attack', totalFrames: 20, ticksPerFrame: 2, loop: false, transition: 'snap', description: '空中D重踢' },

  // === 受击/状态 ===
  hitstun:     { name: 'hitstun', type: 'once', totalFrames: 5, ticksPerFrame: 2, loop: false, transition: 'snap', description: '受击硬直' },
  blockstun:   { name: 'blockstun', type: 'once', totalFrames: 9, ticksPerFrame: 1, loop: false, transition: 'snap', description: '防御硬直' },
  knockdown:   { name: 'knockdown', type: 'once', totalFrames: 6, ticksPerFrame: 5, loop: false, transition: 'snap', description: '倒地' },
  wakeup:      { name: 'wakeup', type: 'once', totalFrames: 8, ticksPerFrame: 1, loop: false, transition: 'ease_in', description: '起身' },
  dizzy:       { name: 'dizzy', type: 'loop', totalFrames: 4, ticksPerFrame: 6, loop: true, transition: 'blend', description: '眩晕' },
  guard_crush: { name: 'guard_crush', type: 'once', totalFrames: 4, ticksPerFrame: 8, loop: false, transition: 'snap', description: '防御崩坏' },

  // === 胜利/系统 ===
  win:      { name: 'win', type: 'once', totalFrames: 8, ticksPerFrame: 10, loop: false, transition: 'ease_out', description: '胜利姿势,军人敬礼' },
  taunt:    { name: 'taunt', type: 'once', totalFrames: 6, ticksPerFrame: 10, loop: false, transition: 'ease_out', description: '挑衅' },
  max_mode: { name: 'max_mode', type: 'once', totalFrames: 4, ticksPerFrame: 6, loop: false, transition: 'snap', description: '爆气MAX Mode' },

  // === 必杀技 ===
  heidern_cross_cutter:    { name: 'heidern_cross_cutter', type: 'attack', totalFrames: 64, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Cross Cutter A版,クロスカッター飛行道具' },
  heidern_cross_cutter_c:  { name: 'heidern_cross_cutter_c', type: 'attack', totalFrames: 68, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Cross Cutter C版,強クロスカッター' },
  heidern_moon_slasher:    { name: 'heidern_moon_slasher', type: 'attack', totalFrames: 36, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Moon Slasher A版,ムーンスラッシャー対空斬撃' },
  heidern_moon_slasher_c:  { name: 'heidern_moon_slasher_c', type: 'attack', totalFrames: 43, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Moon Slasher C版,強ムーンスラッシャー多段' },
  heidern_neck_roller:     { name: 'heidern_neck_roller', type: 'attack', totalFrames: 40, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Neck Roller A版,ネックローリング首投げ' },
  heidern_neck_roller_c:   { name: 'heidern_neck_roller_c', type: 'attack', totalFrames: 40, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Neck Roller C版,強ネックローリング' },
  heidern_stormbringer:    { name: 'heidern_stormbringer', type: 'attack', totalFrames: 44, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Stormbringer A版,ストームブリンガーコマンド投げ' },
  heidern_stormbringer_c:  { name: 'heidern_stormbringer_c', type: 'attack', totalFrames: 44, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Stormbringer C版,強ストームブリンガー' },
  heidern_killing_bringer: { name: 'heidern_killing_bringer', type: 'attack', totalFrames: 40, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Killing Bringer B版,キリングブリンガー当て身投げ' },
  heidern_killing_bringer_d: { name: 'heidern_killing_bringer_d', type: 'attack', totalFrames: 42, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Killing Bringer D版,強キリングブリンガー' },
  heidern_leiden_reitter:  { name: 'heidern_leiden_reitter', type: 'attack', totalFrames: 38, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Leiden Reitter B版,ライデンライター回転踢り' },
  heidern_leiden_reitter_d: { name: 'heidern_leiden_reitter_d', type: 'attack', totalFrames: 42, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Leiden Reitter D版,強ライデンライター' },

  // === 命令通常技 ===
  heidern_sliding:    { name: 'heidern_sliding', type: 'attack', totalFrames: 37, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Sliding ↘+B,スライディング下段' },
  heidern_command_a:  { name: 'heidern_command_a', type: 'attack', totalFrames: 33, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Command A →+A,上段打撃' },

  // === DM ===
  dm_heidern_critical_driver: { name: 'dm_heidern_critical_driver', type: 'attack', totalFrames: 53, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Critical Driver DM,クリティカルドライバー投げ' },
  dm_heidern_end:             { name: 'dm_heidern_end', type: 'attack', totalFrames: 58, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Heidern End DM,ハイデルンエンド軍刀連斬' },

  // === SDM ===
  sdm_heidern_critical_driver: { name: 'sdm_heidern_critical_driver', type: 'attack', totalFrames: 53, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Critical Driver SDM,強化クリティカルドライバー' },
  sdm_heidern_end:             { name: 'sdm_heidern_end', type: 'attack', totalFrames: 58, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Heidern End SDM,強化ハイデルンエンド' },

  // === HSDM ===
  hsdm_heidern_execution: { name: 'hsdm_heidern_execution', type: 'attack', totalFrames: 58, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Heidern Execution HSDM,ハイデルンエクスキュージョン' },
};

/** 获取Heidern所有动作名称 */
export function getHeidernAnimationNames(): string[] {
  return Object.keys(HEIDERN_ANIMATION_META);
}

/** 获取指定动作元数据 */
export function getHeidernAnimMeta(name: string): AnimationMeta | undefined {
  return HEIDERN_ANIMATION_META[name];
}

/** 获取攻击动作列表 */
export function getHeidernAttackAnimations(): AnimationMeta[] {
  return Object.values(HEIDERN_ANIMATION_META).filter(m => m.type === 'attack');
}

/** 获取循环动作列表 */
export function getHeidernLoopAnimations(): AnimationMeta[] {
  return Object.values(HEIDERN_ANIMATION_META).filter(m => m.loop);
}
