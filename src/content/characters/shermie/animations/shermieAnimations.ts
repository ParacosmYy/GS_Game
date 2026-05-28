/**
 * Shermie Content Package — Animation Metadata
 *
 * 动作帧元数据: 动作列表、帧数、循环属性、过渡类型。
 * 实际帧序列数据来自 core/animationManifestData.ts, 此文件只放元数据描述层。
 *
 * 归属: content/characters/shermie/animations/ — 只放"动作帧是什么"
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

export const SHERMIE_ANIMATION_META: Record<string, AnimationMeta> = {
  // === 基础动作 ===
  idle:           { name: 'idle', type: 'loop', totalFrames: 6, ticksPerFrame: 8, loop: true, transition: 'blend', description: '站立待机,紫色格斗术基本架势' },
  walk_forward:   { name: 'walk_forward', type: 'loop', totalFrames: 6, ticksPerFrame: 6, loop: true, transition: 'ease_in', description: '前进移动,柔身逼近' },
  walk_backward:  { name: 'walk_backward', type: 'loop', totalFrames: 6, ticksPerFrame: 7, loop: true, transition: 'ease_in', description: '后退移动,保持架势' },
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
  stand_a:  { name: 'stand_a', type: 'attack', totalFrames: 14, ticksPerFrame: 2, loop: false, transition: 'snap', description: '远A轻拳,快速 jab' },
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
  dizzy:       { name: 'dizzy', type: 'loop', totalFrames: 4, ticksPerFrame: 6, loop: true, transition: 'blend', description: '眩晕,头上星星转' },
  guard_crush: { name: 'guard_crush', type: 'once', totalFrames: 4, ticksPerFrame: 8, loop: false, transition: 'snap', description: '防御崩坏' },

  // === 胜利/系统 ===
  win:      { name: 'win', type: 'once', totalFrames: 8, ticksPerFrame: 10, loop: false, transition: 'ease_out', description: '胜利姿势' },
  taunt:    { name: 'taunt', type: 'once', totalFrames: 6, ticksPerFrame: 10, loop: false, transition: 'ease_out', description: '挑衅' },
  max_mode: { name: 'max_mode', type: 'once', totalFrames: 4, ticksPerFrame: 6, loop: false, transition: 'snap', description: '爆气MAX Mode' },

  // === 命令通常技 ===
  shermie_stand:  { name: 'shermie_stand', type: 'attack', totalFrames: 38, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Shermie Stand,上段反手击' },
  shermie_clash:  { name: 'shermie_clash', type: 'attack', totalFrames: 34, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Shermie Clash,下段滑踢' },

  // === 必杀技 ===
  shermie_shoot:    { name: 'shermie_shoot', type: 'attack', totalFrames: 40, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Shermie Shoot A版,旋转踢' },
  shermie_shoot_c:  { name: 'shermie_shoot_c', type: 'attack', totalFrames: 52, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Shermie Shoot C版,强旋转踢' },
  shermie_carnival: { name: 'shermie_carnival', type: 'attack', totalFrames: 43, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Shermie Carnival,多段旋转攻击' },
  shermie_spiral:   { name: 'shermie_spiral', type: 'attack', totalFrames: 38, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Shermie Spiral A版,近身投技' },
  shermie_spiral_c: { name: 'shermie_spiral_c', type: 'attack', totalFrames: 41, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Shermie Spiral C版,强近身投技' },
  shermie_whip:     { name: 'shermie_whip', type: 'attack', totalFrames: 38, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Shermie Whip B版,鞭踢' },
  shermie_whip_c:   { name: 'shermie_whip_c', type: 'attack', totalFrames: 46, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Shermie Whip D版,强鞭踢' },
  shermie_suplex:   { name: 'shermie_suplex', type: 'attack', totalFrames: 35, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Shermie Suplex,近身投技' },
  shermie_axle_spin: { name: 'shermie_axle_spin', type: 'attack', totalFrames: 46, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Axle Spin Kick,下段旋转扫' },

  // === DM ===
  dm_shermie_carnival:  { name: 'dm_shermie_carnival', type: 'attack', totalFrames: 62, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Shermie Carnival DM,多段旋转必杀' },
  dm_shermie_flash:     { name: 'dm_shermie_flash', type: 'attack', totalFrames: 49, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Shermie Flash DM,近身投技必杀' },

  // === SDM ===
  sdm_shermie_carnival: { name: 'sdm_shermie_carnival', type: 'attack', totalFrames: 68, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Shermie Carnival SDM,强化多段旋转' },
  sdm_shermie_flash:    { name: 'sdm_shermie_flash', type: 'attack', totalFrames: 48, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Shermie Flash SDM,强化近身投技' },
};

/** 获取Shermie所有动作名称 */
export function getShermieAnimationNames(): string[] {
  return Object.keys(SHERMIE_ANIMATION_META);
}

/** 获取指定动作元数据 */
export function getShermieAnimMeta(name: string): AnimationMeta | undefined {
  return SHERMIE_ANIMATION_META[name];
}

/** 获取攻击动作列表 */
export function getShermieAttackAnimations(): AnimationMeta[] {
  return Object.values(SHERMIE_ANIMATION_META).filter(m => m.type === 'attack');
}

/** 获取循环动作列表 */
export function getShermieLoopAnimations(): AnimationMeta[] {
  return Object.values(SHERMIE_ANIMATION_META).filter(m => m.loop);
}
