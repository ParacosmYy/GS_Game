/**
 * Iori Content Package — Animation Metadata
 *
 * 动作帧元数据: 动作列表、帧数、循环属性、过渡类型。
 * 实际帧序列数据来自 core/animationManifestData.ts, 此文件只放元数据描述层。
 *
 * 归属: content/characters/iori/animations/ — 只放"动作帧是什么"
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

export const IORI_ANIMATION_META: Record<string, AnimationMeta> = {
  // === 基础动作 ===
  idle:           { name: 'idle', type: 'loop', totalFrames: 4, ticksPerFrame: 9, loop: true, transition: 'blend', description: '站立待机,八神流格斗术慵懒架势' },
  walk_forward:   { name: 'walk_forward', type: 'loop', totalFrames: 6, ticksPerFrame: 6, loop: true, transition: 'ease_in', description: '前进移动,低身位推进' },
  walk_backward:  { name: 'walk_backward', type: 'loop', totalFrames: 6, ticksPerFrame: 7, loop: true, transition: 'ease_in', description: '后退移动,保持架势' },
  jump_up:        { name: 'jump_up', type: 'once', totalFrames: 8, ticksPerFrame: 5, loop: false, transition: 'ease_out', description: '垂直跳跃' },
  jump_forward:   { name: 'jump_forward', type: 'once', totalFrames: 10, ticksPerFrame: 5, loop: false, transition: 'ease_out', description: '前跳' },
  jump_backward:  { name: 'jump_backward', type: 'once', totalFrames: 10, ticksPerFrame: 5, loop: false, transition: 'ease_out', description: '后跳' },

  // === 通常技 ===
  stand_a:  { name: 'stand_a', type: 'attack', totalFrames: 8, ticksPerFrame: 2, loop: false, transition: 'snap', description: '远A轻拳,快速爪击jab' },
  stand_b:  { name: 'stand_b', type: 'attack', totalFrames: 9, ticksPerFrame: 2, loop: false, transition: 'snap', description: '远B轻踢' },
  stand_c:  { name: 'stand_c', type: 'attack', totalFrames: 9, ticksPerFrame: 2, loop: false, transition: 'snap', description: '远C重拳,爪击高伤害' },
  stand_d:  { name: 'stand_d', type: 'attack', totalFrames: 14, ticksPerFrame: 2, loop: false, transition: 'snap', description: '远D重踢,击倒' },
  crouch_a: { name: 'crouch_a', type: 'attack', totalFrames: 8, ticksPerFrame: 2, loop: false, transition: 'snap', description: '蹲A轻拳' },
  crouch_b: { name: 'crouch_b', type: 'attack', totalFrames: 9, ticksPerFrame: 2, loop: false, transition: 'snap', description: '蹲B下段轻踢' },
  crouch_c: { name: 'crouch_c', type: 'attack', totalFrames: 9, ticksPerFrame: 2, loop: false, transition: 'snap', description: '蹲C重拳' },
  crouch_d: { name: 'crouch_d', type: 'attack', totalFrames: 10, ticksPerFrame: 2, loop: false, transition: 'snap', description: '蹲D下段重踢,扫堂腿' },

  // === 受击/状态 ===
  hitstun:     { name: 'hitstun', type: 'once', totalFrames: 11, ticksPerFrame: 1, loop: false, transition: 'snap', description: '受击硬直' },
  blockstun:   { name: 'blockstun', type: 'once', totalFrames: 9, ticksPerFrame: 1, loop: false, transition: 'snap', description: '防御硬直' },
  knockdown:   { name: 'knockdown', type: 'once', totalFrames: 30, ticksPerFrame: 1, loop: false, transition: 'snap', description: '倒地' },
  wakeup:      { name: 'wakeup', type: 'once', totalFrames: 8, ticksPerFrame: 1, loop: false, transition: 'ease_in', description: '起身' },

  // === 胜利 ===
  win: { name: 'win', type: 'once', totalFrames: 6, ticksPerFrame: 10, loop: false, transition: 'ease_out', description: '胜利姿势,狂笑' },

  // === 必杀技 ===
  iori_yamibarai:   { name: 'iori_yamibarai', type: 'attack', totalFrames: 32, ticksPerFrame: 2, loop: false, transition: 'snap', description: '闇払い A版,紫色飞行道具' },
  iori_yamibarai_c: { name: 'iori_yamibarai_c', type: 'attack', totalFrames: 40, ticksPerFrame: 2, loop: false, transition: 'snap', description: '闇払い C版,强紫色飞行道具' },
  iori_oniyaki:     { name: 'iori_oniyaki', type: 'attack', totalFrames: 30, ticksPerFrame: 2, loop: false, transition: 'snap', description: '鬼焼き A版,对空升龙' },
  iori_oniyaki_c:   { name: 'iori_oniyaki_c', type: 'attack', totalFrames: 45, ticksPerFrame: 2, loop: false, transition: 'snap', description: '鬼焼き C版,无敌升龙' },
  iori_kototsuki:   { name: 'iori_kototsuki', type: 'attack', totalFrames: 28, ticksPerFrame: 2, loop: false, transition: 'snap', description: '琴月陰 B版,短距离突进HKD' },
  iori_kototsuki_d: { name: 'iori_kototsuki_d', type: 'attack', totalFrames: 34, ticksPerFrame: 2, loop: false, transition: 'snap', description: '琴月陰 D版,长距离突进HKD' },
  iori_kuzukaze:    { name: 'iori_kuzukaze', type: 'attack', totalFrames: 20, ticksPerFrame: 2, loop: false, transition: 'snap', description: '屑風,指令投换边' },

  // === 命令通常技 ===
  iori_yumeyumi:  { name: 'iori_yumeyumi', type: 'attack', totalFrames: 22, ticksPerFrame: 2, loop: false, transition: 'snap', description: '夢弾,2段overhead' },
  iori_katanugi:  { name: 'iori_katanugi', type: 'attack', totalFrames: 18, ticksPerFrame: 2, loop: false, transition: 'snap', description: '邯鄲,下段攻击' },
  iori_yukiwarui: { name: 'iori_yukiwarui', type: 'attack', totalFrames: 16, ticksPerFrame: 2, loop: false, transition: 'snap', description: '百合折り,空中crossup' },

  // === Rekka — 葵花 A chain ===
  iori_aoihana:   { name: 'iori_aoihana', type: 'attack', totalFrames: 16, ticksPerFrame: 2, loop: false, transition: 'snap', description: '葵花壹段A版,rekka起手爪击' },
  iori_aoihana_2: { name: 'iori_aoihana_2', type: 'attack', totalFrames: 16, ticksPerFrame: 2, loop: false, transition: 'snap', description: '葵花弐段A版,下段追击' },
  iori_aoihana_3: { name: 'iori_aoihana_3', type: 'attack', totalFrames: 18, ticksPerFrame: 2, loop: false, transition: 'snap', description: '葵花参段A版,overhead击倒' },

  // === Rekka — 葵花 C chain ===
  iori_aoihana_c:   { name: 'iori_aoihana_c', type: 'attack', totalFrames: 18, ticksPerFrame: 2, loop: false, transition: 'snap', description: '葵花壹段C版,慢速高伤害爪击' },
  iori_aoihana_c_2: { name: 'iori_aoihana_c_2', type: 'attack', totalFrames: 18, ticksPerFrame: 2, loop: false, transition: 'snap', description: '葵花弐段C版,下段追击' },
  iori_aoihana_c_3: { name: 'iori_aoihana_c_3', type: 'attack', totalFrames: 20, ticksPerFrame: 2, loop: false, transition: 'snap', description: '葵花参段C版,overhead击倒' },

  // === DM ===
  dm_yaotome:   { name: 'dm_yaotome', type: 'attack', totalFrames: 36, ticksPerFrame: 2, loop: false, transition: 'snap', description: '八稚女 DM,狂暴连斩' },
  sdm_yaotome:  { name: 'sdm_yaotome', type: 'attack', totalFrames: 40, ticksPerFrame: 2, loop: false, transition: 'snap', description: '八稚女 SDM,强化狂暴连斩' },
  hsdm_yaotome: { name: 'hsdm_yaotome', type: 'attack', totalFrames: 44, ticksPerFrame: 2, loop: false, transition: 'snap', description: '八稚女 HSDM,隐藏超必杀' },
};

/** 获取Iori所有动作名称 */
export function getIoriAnimationNames(): string[] {
  return Object.keys(IORI_ANIMATION_META);
}

/** 获取指定动作元数据 */
export function getIoriAnimMeta(name: string): AnimationMeta | undefined {
  return IORI_ANIMATION_META[name];
}

/** 获取攻击动作列表 */
export function getIoriAttackAnimations(): AnimationMeta[] {
  return Object.values(IORI_ANIMATION_META).filter(m => m.type === 'attack');
}

/** 获取循环动作列表 */
export function getIoriLoopAnimations(): AnimationMeta[] {
  return Object.values(IORI_ANIMATION_META).filter(m => m.loop);
}
