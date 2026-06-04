/**
 * Clark Content Package — Animation Metadata
 *
 * 动作帧元数据: 动作列表、帧数、循环属性、过渡类型。
 * 实际帧序列数据来自 core/animationManifestData.ts, 此文件只放元数据描述层。
 *
 * 归属: content/characters/clark/animations/ — 只放"动作帧是什么"
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

export const CLARK_ANIMATION_META: Record<string, AnimationMeta> = {
  // === 基础动作 ===
  idle:           { name: 'idle', type: 'loop', totalFrames: 6, ticksPerFrame: 8, loop: true, transition: 'blend', description: '站立待机,格斗家宽架势,准备抓投' },
  walk_forward:   { name: 'walk_forward', type: 'loop', totalFrames: 4, ticksPerFrame: 6, loop: true, transition: 'ease_in', description: '前进移动,逼近对手准备投技' },
  walk_backward:  { name: 'walk_backward', type: 'loop', totalFrames: 4, ticksPerFrame: 7, loop: true, transition: 'ease_in', description: '后退移动,保持架势' },
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
  clark_death_lake: { name: 'clark_death_lake', type: 'attack', totalFrames: 42, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Death Lake Drive,上段overhead' },
  clark_stomp:      { name: 'clark_stomp', type: 'attack', totalFrames: 34, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Stomp,下段踩踏' },

  // === 必杀技 ===
  clark_argentine:   { name: 'clark_argentine', type: 'attack', totalFrames: 40, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Super Argentine Backbreaker A版,近身投技' },
  clark_argentine_c: { name: 'clark_argentine_c', type: 'attack', totalFrames: 44, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Super Argentine Backbreaker C版,强近身投技' },
  clark_napalm:      { name: 'clark_napalm', type: 'attack', totalFrames: 38, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Napalm Stretch,对空捕捉投' },
  clark_flash_elbow: { name: 'clark_flash_elbow', type: 'attack', totalFrames: 30, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Flash Elbow,投技后追击肘击' },
  clark_mount_tackle: { name: 'clark_mount_tackle', type: 'attack', totalFrames: 36, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Mount Tackle,近身冲撞投' },
  clark_vulcan:      { name: 'clark_vulcan', type: 'attack', totalFrames: 44, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Vulcan Punch,多段连打' },

  // === DM ===
  dm_argentine_dm:   { name: 'dm_argentine_dm', type: 'attack', totalFrames: 52, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Super Argentine Backbreaker DM,超必杀投技' },
  dm_rolling_cradle: { name: 'dm_rolling_cradle', type: 'attack', totalFrames: 58, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Rolling Cradle DM,回旋摇篮投' },

  // === SDM ===
  sdm_argentine_dm:   { name: 'sdm_argentine_dm', type: 'attack', totalFrames: 56, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Super Argentine Backbreaker SDM,强化超必杀投技' },
  sdm_rolling_cradle: { name: 'sdm_rolling_cradle', type: 'attack', totalFrames: 62, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Rolling Cradle SDM,强化回旋摇篮投' },
};

/** 获取Clark所有动作名称 */
export function getClarkAnimationNames(): string[] {
  return Object.keys(CLARK_ANIMATION_META);
}

/** 获取指定动作元数据 */
export function getClarkAnimMeta(name: string): AnimationMeta | undefined {
  return CLARK_ANIMATION_META[name];
}

/** 获取攻击动作列表 */
export function getClarkAttackAnimations(): AnimationMeta[] {
  return Object.values(CLARK_ANIMATION_META).filter(m => m.type === 'attack');
}

/** 获取循环动作列表 */
export function getClarkLoopAnimations(): AnimationMeta[] {
  return Object.values(CLARK_ANIMATION_META).filter(m => m.loop);
}
