/**
 * Kensou Content Package — Animation Metadata
 *
 * 归属: content/characters/kensou/animations/ — 只放动作元数据。
 * 实际 MUGEN 帧序列来自 public/sprites/kensou/manifest.json。
 */

export interface AnimationMeta {
  name: string;
  type: 'loop' | 'once' | 'attack';
  totalFrames: number;
  ticksPerFrame: number;
  loop: boolean;
  transition: 'snap' | 'ease_in' | 'ease_out' | 'blend';
  description: string;
}

export const KENSOU_ANIMATION_META: Record<string, AnimationMeta> = {
  idle: { name: 'idle', type: 'loop', totalFrames: 5, ticksPerFrame: 8, loop: true, transition: 'blend', description: '超能力少年待机' },
  walk_forward: { name: 'walk_forward', type: 'loop', totalFrames: 6, ticksPerFrame: 6, loop: true, transition: 'ease_in', description: '前进步伐' },
  walk_backward: { name: 'walk_backward', type: 'loop', totalFrames: 6, ticksPerFrame: 7, loop: true, transition: 'ease_in', description: '后退步伐' },
  run: { name: 'run', type: 'loop', totalFrames: 6, ticksPerFrame: 4, loop: true, transition: 'ease_in', description: '前冲' },
  backdash: { name: 'backdash', type: 'once', totalFrames: 8, ticksPerFrame: 3, loop: false, transition: 'ease_out', description: '后撤步' },
  crouch: { name: 'crouch', type: 'loop', totalFrames: 1, ticksPerFrame: 8, loop: true, transition: 'blend', description: '蹲姿' },
  block: { name: 'block', type: 'once', totalFrames: 3, ticksPerFrame: 2, loop: false, transition: 'snap', description: '防御' },
  jump_up: { name: 'jump_up', type: 'once', totalFrames: 8, ticksPerFrame: 4, loop: false, transition: 'ease_out', description: '垂直跳跃' },
  jump_forward: { name: 'jump_forward', type: 'once', totalFrames: 8, ticksPerFrame: 4, loop: false, transition: 'ease_out', description: '前跳' },
  jump_backward: { name: 'jump_backward', type: 'once', totalFrames: 8, ticksPerFrame: 4, loop: false, transition: 'ease_out', description: '后跳' },
  stand_a: { name: 'stand_a', type: 'attack', totalFrames: 10, ticksPerFrame: 2, loop: false, transition: 'snap', description: '远A' },
  stand_b: { name: 'stand_b', type: 'attack', totalFrames: 10, ticksPerFrame: 2, loop: false, transition: 'snap', description: '远B' },
  stand_c: { name: 'stand_c', type: 'attack', totalFrames: 12, ticksPerFrame: 2, loop: false, transition: 'snap', description: '远C' },
  stand_d: { name: 'stand_d', type: 'attack', totalFrames: 12, ticksPerFrame: 2, loop: false, transition: 'snap', description: '远D' },
  crouch_a: { name: 'crouch_a', type: 'attack', totalFrames: 10, ticksPerFrame: 2, loop: false, transition: 'snap', description: '蹲A' },
  crouch_b: { name: 'crouch_b', type: 'attack', totalFrames: 10, ticksPerFrame: 2, loop: false, transition: 'snap', description: '蹲B' },
  crouch_c: { name: 'crouch_c', type: 'attack', totalFrames: 12, ticksPerFrame: 2, loop: false, transition: 'snap', description: '蹲C' },
  crouch_d: { name: 'crouch_d', type: 'attack', totalFrames: 12, ticksPerFrame: 2, loop: false, transition: 'snap', description: '蹲D' },
  jump_a: { name: 'jump_a', type: 'attack', totalFrames: 8, ticksPerFrame: 2, loop: false, transition: 'snap', description: '跳A' },
  jump_b: { name: 'jump_b', type: 'attack', totalFrames: 8, ticksPerFrame: 2, loop: false, transition: 'snap', description: '跳B' },
  jump_c: { name: 'jump_c', type: 'attack', totalFrames: 10, ticksPerFrame: 2, loop: false, transition: 'snap', description: '跳C' },
  jump_d: { name: 'jump_d', type: 'attack', totalFrames: 10, ticksPerFrame: 2, loop: false, transition: 'snap', description: '跳D' },
  hitstun: { name: 'hitstun', type: 'once', totalFrames: 4, ticksPerFrame: 3, loop: false, transition: 'snap', description: '受击' },
  knockdown: { name: 'knockdown', type: 'once', totalFrames: 8, ticksPerFrame: 4, loop: false, transition: 'snap', description: '倒地' },
  wakeup: { name: 'wakeup', type: 'once', totalFrames: 6, ticksPerFrame: 3, loop: false, transition: 'ease_in', description: '起身' },
  win: { name: 'win', type: 'once', totalFrames: 8, ticksPerFrame: 8, loop: false, transition: 'ease_out', description: '胜利动作' },
  taunt: { name: 'taunt', type: 'once', totalFrames: 8, ticksPerFrame: 6, loop: false, transition: 'snap', description: '挑衅' },
  max_mode: { name: 'max_mode', type: 'once', totalFrames: 4, ticksPerFrame: 6, loop: false, transition: 'snap', description: 'MAX发动' },
  kensou_bakyaku: { name: 'kensou_bakyaku', type: 'attack', totalFrames: 12, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Bakyaku' },
  kensou_kakuhi: { name: 'kensou_kakuhi', type: 'attack', totalFrames: 12, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Kakuhi' },
  kensou_chou_kyuu_dan: { name: 'kensou_chou_kyuu_dan', type: 'attack', totalFrames: 30, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Chou Kyuu Dan' },
  kensou_ryurenga_ten: { name: 'kensou_ryurenga_ten', type: 'attack', totalFrames: 34, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Ryurenga Tentei' },
  kensou_ryurenga_chi: { name: 'kensou_ryurenga_chi', type: 'attack', totalFrames: 34, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Ryurenga Chitei' },
  kensou_ryusou_geki: { name: 'kensou_ryusou_geki', type: 'attack', totalFrames: 36, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Ryusou Geki' },
  dm_shin_chou_kyuu_dan: { name: 'dm_shin_chou_kyuu_dan', type: 'attack', totalFrames: 54, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Shin Chou Kyuu Dan DM' },
  sdm_shin_chou_kyuu_dan: { name: 'sdm_shin_chou_kyuu_dan', type: 'attack', totalFrames: 60, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Shin Chou Kyuu Dan SDM' },
};

export function getKensouAnimationNames(): string[] {
  return Object.keys(KENSOU_ANIMATION_META);
}

export function getKensouAnimMeta(name: string): AnimationMeta | undefined {
  return KENSOU_ANIMATION_META[name];
}

export function getKensouAttackAnimations(): AnimationMeta[] {
  return Object.values(KENSOU_ANIMATION_META).filter(meta => meta.type === 'attack');
}

export function getKensouLoopAnimations(): AnimationMeta[] {
  return Object.values(KENSOU_ANIMATION_META).filter(meta => meta.loop);
}
