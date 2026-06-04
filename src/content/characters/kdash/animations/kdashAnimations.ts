/**
 * K' Content Package — Animation Metadata
 *
 * 动作帧元数据: 动作列表、帧数、循环属性、过渡类型。
 * 实际帧序列数据来自 core/animationManifestData.ts, 此文件只放元数据描述层。
 *
 * 归属: content/characters/kdash/animations/ — 只放"动作帧是什么"
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

export const KDASH_ANIMATION_META: Record<string, AnimationMeta> = {
  // === 基础动作 ===
  idle:           { name: 'idle', type: 'loop', totalFrames: 6, ticksPerFrame: 8, loop: true, transition: 'blend', description: '站立待机,懒散插兜架势' },
  walk_forward:   { name: 'walk_forward', type: 'loop', totalFrames: 4, ticksPerFrame: 6, loop: true, transition: 'ease_in', description: '前进移动,手臂自然摆动' },
  walk_backward:  { name: 'walk_backward', type: 'loop', totalFrames: 4, ticksPerFrame: 7, loop: true, transition: 'ease_in', description: '后退移动,保持架势' },
  run:            { name: 'run', type: 'loop', totalFrames: 2, ticksPerFrame: 4, loop: true, transition: 'ease_in', description: '跑步前冲,前倾幅度大' },
  crouch:         { name: 'crouch', type: 'loop', totalFrames: 1, ticksPerFrame: 8, loop: true, transition: 'blend', description: '蹲下姿态,重心低' },
  block:          { name: 'block', type: 'loop', totalFrames: 2, ticksPerFrame: 3, loop: true, transition: 'snap', description: '站立防御,双臂交叉' },
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
  stand_a:  { name: 'stand_a', type: 'attack', totalFrames: 14, ticksPerFrame: 2, loop: false, transition: 'snap', description: '远A轻拳,快速jab' },
  stand_b:  { name: 'stand_b', type: 'attack', totalFrames: 24, ticksPerFrame: 2, loop: false, transition: 'snap', description: '远B轻踢' },
  stand_c:  { name: 'stand_c', type: 'attack', totalFrames: 30, ticksPerFrame: 2, loop: false, transition: 'snap', description: '远C重拳,高伤害' },
  stand_d:  { name: 'stand_d', type: 'attack', totalFrames: 38, ticksPerFrame: 2, loop: false, transition: 'snap', description: '远D重踢,击倒' },
  crouch_a: { name: 'crouch_a', type: 'attack', totalFrames: 16, ticksPerFrame: 2, loop: false, transition: 'snap', description: '蹲A轻拳' },
  crouch_b: { name: 'crouch_b', type: 'attack', totalFrames: 15, ticksPerFrame: 2, loop: false, transition: 'snap', description: '蹲B下段轻踢' },
  crouch_c: { name: 'crouch_c', type: 'attack', totalFrames: 28, ticksPerFrame: 2, loop: false, transition: 'snap', description: '蹲C重拳' },
  crouch_d: { name: 'crouch_d', type: 'attack', totalFrames: 42, ticksPerFrame: 2, loop: false, transition: 'snap', description: '蹲D下段重踢,扫堂腿' },
  jump_a:   { name: 'jump_a', type: 'attack', totalFrames: 12, ticksPerFrame: 2, loop: false, transition: 'snap', description: '空中A轻拳' },
  jump_b:   { name: 'jump_b', type: 'attack', totalFrames: 14, ticksPerFrame: 2, loop: false, transition: 'snap', description: '空中B轻踢' },
  jump_c:   { name: 'jump_c', type: 'attack', totalFrames: 18, ticksPerFrame: 2, loop: false, transition: 'snap', description: '空中C重拳' },
  jump_d:   { name: 'jump_d', type: 'attack', totalFrames: 20, ticksPerFrame: 2, loop: false, transition: 'snap', description: '空中D重踢' },

  // === 受击/状态 ===
  hitstun:     { name: 'hitstun', type: 'once', totalFrames: 5, ticksPerFrame: 2, loop: false, transition: 'snap', description: '受击硬直' },
  blockstun:   { name: 'blockstun', type: 'once', totalFrames: 9, ticksPerFrame: 1, loop: false, transition: 'snap', description: '防御硬直' },
  knockdown:   { name: 'knockdown', type: 'once', totalFrames: 6, ticksPerFrame: 5, loop: false, transition: 'snap', description: '倒地' },
  wakeup:      { name: 'wakeup', type: 'once', totalFrames: 8, ticksPerFrame: 1, loop: false, transition: 'ease_in', description: '起身' },
  dizzy:       { name: 'dizzy', type: 'loop', totalFrames: 4, ticksPerFrame: 6, loop: true, transition: 'blend', description: '眩晕' },
  guard_crush: { name: 'guard_crush', type: 'once', totalFrames: 4, ticksPerFrame: 8, loop: false, transition: 'snap', description: '防御崩坏' },

  // === 胜利/系统 ===
  win:      { name: 'win', type: 'once', totalFrames: 8, ticksPerFrame: 10, loop: false, transition: 'ease_out', description: '胜利姿势' },
  taunt:    { name: 'taunt', type: 'once', totalFrames: 6, ticksPerFrame: 10, loop: false, transition: 'ease_out', description: '挑衅' },
  max_mode: { name: 'max_mode', type: 'once', totalFrames: 4, ticksPerFrame: 6, loop: false, transition: 'snap', description: '爆气MAX Mode' },

  // === 命令通常技 ===
  kdash_one_inch:  { name: 'kdash_one_inch', type: 'attack', totalFrames: 36, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'One Inch,短距离爆发打击' },
  kdash_trigger:   { name: 'kdash_trigger', type: 'attack', totalFrames: 34, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Trigger Shot,下段踢' },

  // === 必杀技 ===
  kdash_eins:      { name: 'kdash_eins', type: 'attack', totalFrames: 32, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Eins Trigger A版,火焰飞行道具' },
  kdash_eins_c:    { name: 'kdash_eins_c', type: 'attack', totalFrames: 36, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Eins Trigger C版,强火焰飞行道具' },
  kdash_crow:      { name: 'kdash_crow', type: 'attack', totalFrames: 30, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Crow Bites A版,对空上勾拳' },
  kdash_crow_c:    { name: 'kdash_crow_c', type: 'attack', totalFrames: 34, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Crow Bites C版,强对空上勾拳,无敌' },
  kdash_minute:    { name: 'kdash_minute', type: 'attack', totalFrames: 28, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Minute Spike,空中踢击overhead' },
  kdash_narrow:    { name: 'kdash_narrow', type: 'attack', totalFrames: 26, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Narrow Spike,低段突进踢' },

  // === DM ===
  dm_chain_shot:    { name: 'dm_chain_shot', type: 'attack', totalFrames: 56, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Chain Shot DM,连续打击超必杀' },

  // === SDM ===
  sdm_chain_shot:   { name: 'sdm_chain_shot', type: 'attack', totalFrames: 62, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Chain Shot SDM,强化连续打击' },
};

/** 获取K'所有动作名称 */
export function getKdashAnimationNames(): string[] {
  return Object.keys(KDASH_ANIMATION_META);
}

/** 获取指定动作元数据 */
export function getKdashAnimMeta(name: string): AnimationMeta | undefined {
  return KDASH_ANIMATION_META[name];
}

/** 获取攻击动作列表 */
export function getKdashAttackAnimations(): AnimationMeta[] {
  return Object.values(KDASH_ANIMATION_META).filter(m => m.type === 'attack');
}

/** 获取循环动作列表 */
export function getKdashLoopAnimations(): AnimationMeta[] {
  return Object.values(KDASH_ANIMATION_META).filter(m => m.loop);
}
