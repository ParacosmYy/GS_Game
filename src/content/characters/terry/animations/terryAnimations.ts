/**
 * Terry Content Package — Animation Metadata
 *
 * 动作帧元数据: 动作列表、帧数、循环属性、过渡类型。
 * 实际帧序列数据来自 core/animationManifestData.ts, 此文件只放元数据描述层。
 *
 * 归属: content/characters/terry/animations/ — 只放"动作帧是什么"
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

export const TERRY_ANIMATION_META: Record<string, AnimationMeta> = {
  // === 基础动作 ===
  idle:           { name: 'idle', type: 'loop', totalFrames: 6, ticksPerFrame: 8, loop: true, transition: 'blend', description: '站立待机,南镇格斗术基本架势' },
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

  // === 必杀技 ===
  terry_power_wave:   { name: 'terry_power_wave', type: 'attack', totalFrames: 64, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Power Wave A版,地面波飞行道具' },
  terry_round_wave:   { name: 'terry_round_wave', type: 'attack', totalFrames: 45, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Round Wave C版,近距离地面冲击' },
  terry_burn_knuckle: { name: 'terry_burn_knuckle', type: 'attack', totalFrames: 39, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Burn Knuckle,突进能量拳' },
  terry_burn_knuckle_c: { name: 'terry_burn_knuckle_c', type: 'attack', totalFrames: 50, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Burn Knuckle C版,长距离能量拳' },
  terry_burn_knuckle_d: { name: 'terry_burn_knuckle_d', type: 'attack', totalFrames: 54, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Burn Knuckle D版,重距离能量拳' },
  terry_crack_shot:   { name: 'terry_crack_shot', type: 'attack', totalFrames: 38, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Crack Shot B版,中段回旋踢' },
  terry_crack_shot_d: { name: 'terry_crack_shot_d', type: 'attack', totalFrames: 40, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Crack Shot D版,强中段回旋踢' },
  terry_power_dunk:   { name: 'terry_power_dunk', type: 'attack', totalFrames: 56, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Power Dunk B版,上升扣篮' },
  terry_power_dunk_d: { name: 'terry_power_dunk_d', type: 'attack', totalFrames: 62, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Power Dunk D版,强上升扣篮' },
  terry_rising_tackle: { name: 'terry_rising_tackle', type: 'attack', totalFrames: 53, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Rising Tackle A版,上升多段头锤' },
  terry_rising_tackle_c: { name: 'terry_rising_tackle_c', type: 'attack', totalFrames: 61, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Rising Tackle C版,强上升多段头锤' },
  terry_power_charge: { name: 'terry_power_charge', type: 'attack', totalFrames: 32, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Power Charge,突进肩撞' },
  terry_hammer_punch: { name: 'terry_hammer_punch', type: 'attack', totalFrames: 38, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Hammer Punch,中段下砸拳' },

  // === 命令通常技 ===
  terry_back_knckle: { name: 'terry_back_knckle', type: 'attack', totalFrames: 21, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Back Knuckle,中段反手拳' },
  terry_combo_blow:  { name: 'terry_combo_blow', type: 'attack', totalFrames: 29, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Combination Blow,下段突进' },

  // === DM ===
  dm_power_geyser:        { name: 'dm_power_geyser', type: 'attack', totalFrames: 70, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Power Geyser DM,地面喷泉爆发' },
  dm_high_angle_geyser:   { name: 'dm_high_angle_geyser', type: 'attack', totalFrames: 52, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'High Angle Geyser DM,斜上方喷泉' },

  // === SDM ===
  sdm_triple_geyser:      { name: 'sdm_triple_geyser', type: 'attack', totalFrames: 75, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Triple Geyser SDM,三连喷泉' },
  sdm_power_geyser_ex:    { name: 'sdm_power_geyser_ex', type: 'attack', totalFrames: 68, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Power Geyser EX SDM,强化喷泉' },
  sdm_high_angle_geyser:  { name: 'sdm_high_angle_geyser', type: 'attack', totalFrames: 57, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'High Angle Geyser SDM,强化斜上方喷泉' },

  // === HSDM ===
  hsdm_power_geyser:      { name: 'hsdm_power_geyser', type: 'attack', totalFrames: 65, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Power Geyser HSDM,终极喷泉' },
};

/** 获取Terry所有动作名称 */
export function getTerryAnimationNames(): string[] {
  return Object.keys(TERRY_ANIMATION_META);
}

/** 获取指定动作元数据 */
export function getTerryAnimMeta(name: string): AnimationMeta | undefined {
  return TERRY_ANIMATION_META[name];
}

/** 获取攻击动作列表 */
export function getTerryAttackAnimations(): AnimationMeta[] {
  return Object.values(TERRY_ANIMATION_META).filter(m => m.type === 'attack');
}

/** 获取循环动作列表 */
export function getTerryLoopAnimations(): AnimationMeta[] {
  return Object.values(TERRY_ANIMATION_META).filter(m => m.loop);
}
