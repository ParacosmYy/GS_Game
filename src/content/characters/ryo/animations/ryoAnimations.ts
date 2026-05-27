/**
 * Ryo Content Package — Animation Metadata
 *
 * 动作帧元数据: 动作列表、帧数、循环属性、过渡类型。
 * 实际帧序列数据来自 core/animationManifestData.ts, 此文件只放元数据描述层。
 *
 * 归属: content/characters/ryo/animations/ — 只放"动作帧是什么"
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

export const RYO_ANIMATION_META: Record<string, AnimationMeta> = {
  // === 基础动作 ===
  idle:           { name: 'idle', type: 'loop', totalFrames: 8, ticksPerFrame: 8, loop: true, transition: 'blend', description: '站立待机,极限流空手道基本架势' },
  walk_forward:   { name: 'walk_forward', type: 'loop', totalFrames: 6, ticksPerFrame: 6, loop: true, transition: 'ease_in', description: '前进移动,重心前倾' },
  walk_backward:  { name: 'walk_backward', type: 'loop', totalFrames: 6, ticksPerFrame: 7, loop: true, transition: 'ease_in', description: '后退移动,保持架势' },
  run:            { name: 'run', type: 'loop', totalFrames: 4, ticksPerFrame: 4, loop: true, transition: 'ease_in', description: '跑步前冲' },
  crouch:         { name: 'crouch', type: 'loop', totalFrames: 1, ticksPerFrame: 8, loop: true, transition: 'blend', description: '蹲下姿态' },
  block:          { name: 'block', type: 'loop', totalFrames: 4, ticksPerFrame: 3, loop: true, transition: 'snap', description: '站立防御' },
  jump_up:        { name: 'jump_up', type: 'once', totalFrames: 8, ticksPerFrame: 5, loop: false, transition: 'ease_out', description: '垂直跳跃' },
  jump_forward:   { name: 'jump_forward', type: 'once', totalFrames: 10, ticksPerFrame: 5, loop: false, transition: 'ease_out', description: '前跳' },
  jump_backward:  { name: 'jump_backward', type: 'once', totalFrames: 10, ticksPerFrame: 5, loop: false, transition: 'ease_out', description: '后跳' },

  // === 通常技 ===
  stand_a:  { name: 'stand_a', type: 'attack', totalFrames: 14, ticksPerFrame: 2, loop: false, transition: 'snap', description: '远A轻拳,快速 jab' },
  stand_b:  { name: 'stand_b', type: 'attack', totalFrames: 24, ticksPerFrame: 2, loop: false, transition: 'snap', description: '远B轻踢' },
  stand_c:  { name: 'stand_c', type: 'attack', totalFrames: 30, ticksPerFrame: 2, loop: false, transition: 'snap', description: '远C重拳,高伤害' },
  stand_d:  { name: 'stand_d', type: 'attack', totalFrames: 38, ticksPerFrame: 2, loop: false, transition: 'snap', description: '远D重踢,击倒' },
  crouch_a: { name: 'crouch_a', type: 'attack', totalFrames: 16, ticksPerFrame: 2, loop: false, transition: 'snap', description: '蹲A轻拳' },
  crouch_b: { name: 'crouch_b', type: 'attack', totalFrames: 15, ticksPerFrame: 2, loop: false, transition: 'snap', description: '蹲B下段轻踢' },
  crouch_c: { name: 'crouch_c', type: 'attack', totalFrames: 28, ticksPerFrame: 2, loop: false, transition: 'snap', description: '蹲C重拳' },
  crouch_d: { name: 'crouch_d', type: 'attack', totalFrames: 42, ticksPerFrame: 2, loop: false, transition: 'snap', description: '蹲D下段重踢,扫堂腿' },

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

  // === 必杀技 ===
  ryo_koou:     { name: 'ryo_koou', type: 'attack', totalFrames: 64, ticksPerFrame: 2, loop: false, transition: 'snap', description: '虎煌拳 A版,飞行道具' },
  ryo_koou_c:   { name: 'ryo_koou_c', type: 'attack', totalFrames: 65, ticksPerFrame: 2, loop: false, transition: 'snap', description: '虎煌拳 C版,强飞行道具' },
  ryo_ko_hou:   { name: 'ryo_ko_hou', type: 'attack', totalFrames: 35, ticksPerFrame: 2, loop: false, transition: 'snap', description: '虎咲 A版,对空升龙' },
  ryo_ko_hou_c: { name: 'ryo_ko_hou_c', type: 'attack', totalFrames: 47, ticksPerFrame: 2, loop: false, transition: 'snap', description: '虎咲 C版,无敌升龙' },
  ryo_hien:     { name: 'ryo_hien', type: 'attack', totalFrames: 40, ticksPerFrame: 2, loop: false, transition: 'snap', description: '飛燕疾風脚,空中飞踢' },
  ryo_haou:     { name: 'ryo_haou', type: 'attack', totalFrames: 44, ticksPerFrame: 2, loop: false, transition: 'snap', description: '霸王翔吼拳,大飞行道具' },

  // === DM ===
  dm_ten_ha_ou:       { name: 'dm_ten_ha_ou', type: 'attack', totalFrames: 68, ticksPerFrame: 2, loop: false, transition: 'snap', description: '天地霸煌拳 DM,巨大能量爆发' },
  sdm_ten_ha_ou:      { name: 'sdm_ten_ha_ou', type: 'attack', totalFrames: 67, ticksPerFrame: 2, loop: false, transition: 'snap', description: '天地霸煌拳 SDM' },
  dm_ryuko_ranbu:     { name: 'dm_ryuko_ranbu', type: 'attack', totalFrames: 56, ticksPerFrame: 2, loop: false, transition: 'snap', description: '龍虎乱舞 DM,突进乱舞' },
  sdm_ryuko_ranbu:    { name: 'sdm_ryuko_ranbu', type: 'attack', totalFrames: 55, ticksPerFrame: 2, loop: false, transition: 'snap', description: '龍虎乱舞 SDM' },
  hsdm_ryuko_ranbu:   { name: 'hsdm_ryuko_ranbu', type: 'attack', totalFrames: 56, ticksPerFrame: 2, loop: false, transition: 'snap', description: '龍虎乱舞 HSDM,隐藏超必' },
};

/** 获取Ryo所有动作名称 */
export function getRyoAnimationNames(): string[] {
  return Object.keys(RYO_ANIMATION_META);
}

/** 获取指定动作元数据 */
export function getRyoAnimMeta(name: string): AnimationMeta | undefined {
  return RYO_ANIMATION_META[name];
}

/** 获取攻击动作列表 */
export function getRyoAttackAnimations(): AnimationMeta[] {
  return Object.values(RYO_ANIMATION_META).filter(m => m.type === 'attack');
}

/** 获取循环动作列表 */
export function getRyoLoopAnimations(): AnimationMeta[] {
  return Object.values(RYO_ANIMATION_META).filter(m => m.loop);
}