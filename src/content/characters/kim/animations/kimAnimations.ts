/**
 * Kim Content Package — Animation Metadata
 *
 * 动作帧元数据: 动作列表、帧数、循环属性、过渡类型。
 * 实际帧序列数据来自 core/animationManifestData.ts, 此文件只放元数据描述层。
 *
 * 归属: content/characters/kim/animations/ — 只放"动作帧是什么"
 *
 * Kim is a taekwondo fighter — his normals are predominantly kicks.
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

export const KIM_ANIMATION_META: Record<string, AnimationMeta> = {
  // === 基础动作 ===
  idle:           { name: 'idle', type: 'loop', totalFrames: 6, ticksPerFrame: 8, loop: true, transition: 'blend', description: '站立待机,跆拳道基本架势,双手握拳' },
  walk_forward:   { name: 'walk_forward', type: 'loop', totalFrames: 6, ticksPerFrame: 6, loop: true, transition: 'ease_in', description: '前进移动,重心前倾' },
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

  // === 通常技 (Normals — predominantly kicks) ===
  stand_a:  { name: 'stand_a', type: 'attack', totalFrames: 14, ticksPerFrame: 2, loop: false, transition: 'snap', description: '远A轻拳,快速 jab' },
  stand_b:  { name: 'stand_b', type: 'attack', totalFrames: 24, ticksPerFrame: 2, loop: false, transition: 'snap', description: '远B轻踢,跆拳道前踢' },
  stand_c:  { name: 'stand_c', type: 'attack', totalFrames: 30, ticksPerFrame: 2, loop: false, transition: 'snap', description: '远C重拳' },
  stand_d:  { name: 'stand_d', type: 'attack', totalFrames: 38, ticksPerFrame: 2, loop: false, transition: 'snap', description: '远D重踢,跆拳道回旋踢,击倒' },
  crouch_a: { name: 'crouch_a', type: 'attack', totalFrames: 16, ticksPerFrame: 2, loop: false, transition: 'snap', description: '蹲A轻拳' },
  crouch_b: { name: 'crouch_b', type: 'attack', totalFrames: 15, ticksPerFrame: 2, loop: false, transition: 'snap', description: '蹲B下段轻踢' },
  crouch_c: { name: 'crouch_c', type: 'attack', totalFrames: 28, ticksPerFrame: 2, loop: false, transition: 'snap', description: '蹲C重拳' },
  crouch_d: { name: 'crouch_d', type: 'attack', totalFrames: 42, ticksPerFrame: 2, loop: false, transition: 'snap', description: '蹲D下段重踢,跆拳道扫堂腿' },
  jump_a:   { name: 'jump_a', type: 'attack', totalFrames: 12, ticksPerFrame: 2, loop: false, transition: 'snap', description: '空中A轻拳' },
  jump_b:   { name: 'jump_b', type: 'attack', totalFrames: 14, ticksPerFrame: 2, loop: false, transition: 'snap', description: '空中B轻踢' },
  jump_c:   { name: 'jump_c', type: 'attack', totalFrames: 18, ticksPerFrame: 2, loop: false, transition: 'snap', description: '空中C重拳' },
  jump_d:   { name: 'jump_d', type: 'attack', totalFrames: 20, ticksPerFrame: 2, loop: false, transition: 'snap', description: '空中D重踢,跆拳道空中踢' },

  // === 受击/状态 ===
  hitstun:     { name: 'hitstun', type: 'once', totalFrames: 5, ticksPerFrame: 2, loop: false, transition: 'snap', description: '受击硬直' },
  blockstun:   { name: 'blockstun', type: 'once', totalFrames: 9, ticksPerFrame: 1, loop: false, transition: 'snap', description: '防御硬直' },
  knockdown:   { name: 'knockdown', type: 'once', totalFrames: 6, ticksPerFrame: 5, loop: false, transition: 'snap', description: '倒地' },
  wakeup:      { name: 'wakeup', type: 'once', totalFrames: 8, ticksPerFrame: 1, loop: false, transition: 'ease_in', description: '起身' },
  dizzy:       { name: 'dizzy', type: 'loop', totalFrames: 4, ticksPerFrame: 6, loop: true, transition: 'blend', description: '眩晕' },
  guard_crush: { name: 'guard_crush', type: 'once', totalFrames: 4, ticksPerFrame: 8, loop: false, transition: 'snap', description: '防御崩坏' },

  // === 胜利/系统 ===
  win:      { name: 'win', type: 'once', totalFrames: 8, ticksPerFrame: 10, loop: false, transition: 'ease_out', description: '胜利姿势,跆拳道架势' },
  taunt:    { name: 'taunt', type: 'once', totalFrames: 6, ticksPerFrame: 10, loop: false, transition: 'ease_out', description: '挑衅' },
  max_mode: { name: 'max_mode', type: 'once', totalFrames: 4, ticksPerFrame: 6, loop: false, transition: 'snap', description: '爆气MAX Mode' },

  // === 命令通常技 ===
  kim_hishou_kick: { name: 'kim_hishou_kick', type: 'attack', totalFrames: 28, ticksPerFrame: 2, loop: false, transition: 'snap', description: '飛翔踢,中段overhead踢击' },
  kim_hansen:      { name: 'kim_hansen', type: 'attack', totalFrames: 32, ticksPerFrame: 2, loop: false, transition: 'snap', description: '半旋蹴,2Hit中段回旋踢' },
  kim_hishou:      { name: 'kim_hishou', type: 'attack', totalFrames: 20, ticksPerFrame: 2, loop: false, transition: 'snap', description: '飛翔脚,空中斜下踢' },

  // === 必杀技 ===
  kim_hienzan:     { name: 'kim_hienzan', type: 'attack', totalFrames: 36, ticksPerFrame: 2, loop: false, transition: 'snap', description: '飛燕斬 B版,对空flash kick' },
  kim_hienzan_d:   { name: 'kim_hienzan_d', type: 'attack', totalFrames: 47, ticksPerFrame: 2, loop: false, transition: 'snap', description: '飛燕斬 D版,强版多段flash kick' },
  kim_hangetsu:    { name: 'kim_hangetsu', type: 'attack', totalFrames: 48, ticksPerFrame: 2, loop: false, transition: 'snap', description: '半月蹴 B版,half-moon kick' },
  kim_hangetsu_d:  { name: 'kim_hangetsu_d', type: 'attack', totalFrames: 54, ticksPerFrame: 2, loop: false, transition: 'snap', description: '半月蹴 D版,强版overhead kick' },
  kim_haki:        { name: 'kim_haki', type: 'attack', totalFrames: 34, ticksPerFrame: 2, loop: false, transition: 'snap', description: '覇気脚,快速下段突进踢' },
  kim_sanren:      { name: 'kim_sanren', type: 'attack', totalFrames: 46, ticksPerFrame: 2, loop: false, transition: 'snap', description: '三連撃,三连打击' },
  kim_sanren_2:    { name: 'kim_sanren_2', type: 'attack', totalFrames: 44, ticksPerFrame: 2, loop: false, transition: 'snap', description: '三連撃追加,后续打击' },
  kim_kuzushi_geri:     { name: 'kim_kuzushi_geri', type: 'attack', totalFrames: 34, ticksPerFrame: 2, loop: false, transition: 'snap', description: '崩し蹴り,overhead踢击' },
  kim_nerichagi:        { name: 'kim_nerichagi', type: 'attack', totalFrames: 36, ticksPerFrame: 2, loop: false, transition: 'snap', description: '滑り蹴り,下段滑踢' },
  kim_kaiten_hien_zan:  { name: 'kim_kaiten_hien_zan', type: 'attack', totalFrames: 41, ticksPerFrame: 2, loop: false, transition: 'snap', description: '回転飛燕斬,对空回旋踢' },

  // === DM ===
  dm_phoenix_kick:     { name: 'dm_phoenix_kick', type: 'attack', totalFrames: 64, ticksPerFrame: 2, loop: false, transition: 'snap', description: '鳳凰脚 DM,飞踢突进' },
  dm_phoenix_hiten:    { name: 'dm_phoenix_hiten', type: 'attack', totalFrames: 43, ticksPerFrame: 2, loop: false, transition: 'snap', description: '鳳凰天舞脚 DM,飞空连踢' },

  // === SDM ===
  sdm_phoenix_hiten:     { name: 'sdm_phoenix_hiten', type: 'attack', totalFrames: 42, ticksPerFrame: 2, loop: false, transition: 'snap', description: '鳳凰天舞脚 SDM,强化飞空连踢' },
  sdm_phoenix_hiten_ex:  { name: 'sdm_phoenix_hiten_ex', type: 'attack', totalFrames: 47, ticksPerFrame: 2, loop: false, transition: 'snap', description: '鳳凰天舞脚 SDM EX,MAX强化版' },

  // === HSDM ===
  hsdm_phoenix_hiten:    { name: 'hsdm_phoenix_hiten', type: 'attack', totalFrames: 51, ticksPerFrame: 2, loop: false, transition: 'snap', description: '鳳凰天舞脚 HSDM,隐藏超必杀' },
};

/** 获取Kim所有动作名称 */
export function getKimAnimationNames(): string[] {
  return Object.keys(KIM_ANIMATION_META);
}

/** 获取指定动作元数据 */
export function getKimAnimMeta(name: string): AnimationMeta | undefined {
  return KIM_ANIMATION_META[name];
}

/** 获取攻击动作列表 */
export function getKimAttackAnimations(): AnimationMeta[] {
  return Object.values(KIM_ANIMATION_META).filter(m => m.type === 'attack');
}

/** 获取循环动作列表 */
export function getKimLoopAnimations(): AnimationMeta[] {
  return Object.values(KIM_ANIMATION_META).filter(m => m.loop);
}
