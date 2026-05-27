/**
 * Kyo Content Package — Animation Metadata
 *
 * 动作帧元数据: 动作列表、帧数、循环属性、过渡类型。
 * 实际帧序列数据来自 core/animationManifestData.ts, 此文件只放元数据描述层。
 *
 * 归属: content/characters/kyo/animations/ — 只放"动作帧是什么"
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

export const KYO_ANIMATION_META: Record<string, AnimationMeta> = {
  // === 基础动作 ===
  idle:           { name: 'idle', type: 'loop', totalFrames: 6, ticksPerFrame: 8, loop: true, transition: 'blend', description: '站立待机,草薙流格斗术基本架势' },
  walk_forward:   { name: 'walk_forward', type: 'loop', totalFrames: 4, ticksPerFrame: 6, loop: true, transition: 'ease_in', description: '前进移动,重心前倾' },
  walk_backward:  { name: 'walk_backward', type: 'loop', totalFrames: 4, ticksPerFrame: 7, loop: true, transition: 'ease_in', description: '后退移动,保持架势' },
  run:            { name: 'run', type: 'loop', totalFrames: 2, ticksPerFrame: 4, loop: true, transition: 'ease_in', description: '跑步前冲' },
  crouch:         { name: 'crouch', type: 'loop', totalFrames: 1, ticksPerFrame: 8, loop: true, transition: 'blend', description: '蹲下姿态' },
  block:          { name: 'block', type: 'loop', totalFrames: 2, ticksPerFrame: 3, loop: true, transition: 'snap', description: '站立防御' },
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
  kyo_yamibarai:   { name: 'kyo_yamibarai', type: 'attack', totalFrames: 64, ticksPerFrame: 2, loop: false, transition: 'snap', description: '闇払い A版,飞行道具' },
  kyo_yamibarai_c: { name: 'kyo_yamibarai_c', type: 'attack', totalFrames: 65, ticksPerFrame: 2, loop: false, transition: 'snap', description: '闇払い C版,强飞行道具' },
  kyo_oniyaki:     { name: 'kyo_oniyaki', type: 'attack', totalFrames: 35, ticksPerFrame: 2, loop: false, transition: 'snap', description: '鬼焼き A版,对空升龙' },
  kyo_oniyaki_c:   { name: 'kyo_oniyaki_c', type: 'attack', totalFrames: 47, ticksPerFrame: 2, loop: false, transition: 'snap', description: '鬼焼き C版,无敌升龙' },
  kyo_75kai:       { name: 'kyo_75kai', type: 'attack', totalFrames: 30, ticksPerFrame: 2, loop: false, transition: 'snap', description: '75式·改 第一段' },
  kyo_75kai_2:     { name: 'kyo_75kai_2', type: 'attack', totalFrames: 25, ticksPerFrame: 2, loop: false, transition: 'snap', description: '75式·改 第二段' },
  kyo_red_kick:    { name: 'kyo_red_kick', type: 'attack', totalFrames: 40, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'R.E.D. Kick,高段回旋踢' },

  // === 命令通常技 ===
  cmd_gofu_you: { name: 'cmd_gofu_you', type: 'attack', totalFrames: 28, ticksPerFrame: 2, loop: false, transition: 'snap', description: '轟斧陽,中段overhead' },
  cmd_88shiki:  { name: 'cmd_88shiki', type: 'attack', totalFrames: 32, ticksPerFrame: 2, loop: false, transition: 'snap', description: '八拾八式,下段2Hit' },
  cmd_naraku:   { name: 'cmd_naraku', type: 'attack', totalFrames: 20, ticksPerFrame: 2, loop: false, transition: 'snap', description: '奈落落とし,空中KD' },

  // === Rekka — 荒咬み chain ===
  kyo_aragami:            { name: 'kyo_aragami', type: 'attack', totalFrames: 36, ticksPerFrame: 2, loop: false, transition: 'snap', description: '114式·荒咬み,rekka起手' },
  kyo_aragami_konokizu:   { name: 'kyo_aragami_konokizu', type: 'attack', totalFrames: 28, ticksPerFrame: 2, loop: false, transition: 'snap', description: '128式·九傷,派生技' },
  kyo_aragami_yanosabi:   { name: 'kyo_aragami_yanosabi', type: 'attack', totalFrames: 30, ticksPerFrame: 2, loop: false, transition: 'snap', description: '127式·八錆,派生技' },
  kyo_nanase:             { name: 'kyo_nanase', type: 'attack', totalFrames: 24, ticksPerFrame: 2, loop: false, transition: 'snap', description: '七瀬,踢击派生' },
  kyo_koto_tsuki:         { name: 'kyo_koto_tsuki', type: 'attack', totalFrames: 26, ticksPerFrame: 2, loop: false, transition: 'snap', description: '琴月陽,掌击派生' },
  kyo_yakisogi:           { name: 'kyo_yakisogi', type: 'attack', totalFrames: 22, ticksPerFrame: 2, loop: false, transition: 'snap', description: '破砕,打击派生' },

  // === Rekka — 毒咬み chain ===
  kyo_dokugami:   { name: 'kyo_dokugami', type: 'attack', totalFrames: 38, ticksPerFrame: 2, loop: false, transition: 'snap', description: '115式·毒咬み,rekka起手' },
  kyo_tsumiyomi:  { name: 'kyo_tsumiyomi', type: 'attack', totalFrames: 28, ticksPerFrame: 2, loop: false, transition: 'snap', description: '401式·罪詠み,派生技' },
  kyo_batsuyomi:  { name: 'kyo_batsuyomi', type: 'attack', totalFrames: 30, ticksPerFrame: 2, loop: false, transition: 'snap', description: '402式·罰詠み,最终派生' },

  // === DM ===
  dm_orochinagi:  { name: 'dm_orochinagi', type: 'attack', totalFrames: 68, ticksPerFrame: 2, loop: false, transition: 'snap', description: '大蛇薙 DM,巨大火焰爆发' },
  sdm_orochinagi: { name: 'sdm_orochinagi', type: 'attack', totalFrames: 67, ticksPerFrame: 2, loop: false, transition: 'snap', description: '大蛇薙 SDM' },
};

/** 获取Kyo所有动作名称 */
export function getKyoAnimationNames(): string[] {
  return Object.keys(KYO_ANIMATION_META);
}

/** 获取指定动作元数据 */
export function getKyoAnimMeta(name: string): AnimationMeta | undefined {
  return KYO_ANIMATION_META[name];
}

/** 获取攻击动作列表 */
export function getKyoAttackAnimations(): AnimationMeta[] {
  return Object.values(KYO_ANIMATION_META).filter(m => m.type === 'attack');
}

/** 获取循环动作列表 */
export function getKyoLoopAnimations(): AnimationMeta[] {
  return Object.values(KYO_ANIMATION_META).filter(m => m.loop);
}
