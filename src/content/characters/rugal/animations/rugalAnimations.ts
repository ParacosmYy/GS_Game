/**
 * Rugal Content Package — Animation Metadata
 *
 * 实际 MUGEN 帧序列来自 public/sprites/cvsrugal/manifest.json。
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

export const RUGAL_ANIMATION_META: Record<string, AnimationMeta> = {
  idle: { name: 'idle', type: 'loop', totalFrames: 6, ticksPerFrame: 8, loop: true, transition: 'blend', description: 'Boss stance' },
  walk_forward: { name: 'walk_forward', type: 'loop', totalFrames: 6, ticksPerFrame: 6, loop: true, transition: 'ease_in', description: 'Walk forward' },
  walk_backward: { name: 'walk_backward', type: 'loop', totalFrames: 6, ticksPerFrame: 7, loop: true, transition: 'ease_in', description: 'Walk backward' },
  run: { name: 'run', type: 'loop', totalFrames: 6, ticksPerFrame: 4, loop: true, transition: 'ease_in', description: 'Run' },
  backdash: { name: 'backdash', type: 'once', totalFrames: 8, ticksPerFrame: 3, loop: false, transition: 'ease_out', description: 'Backdash' },
  crouch: { name: 'crouch', type: 'loop', totalFrames: 1, ticksPerFrame: 8, loop: true, transition: 'blend', description: 'Crouch' },
  block: { name: 'block', type: 'once', totalFrames: 3, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Guard' },
  jump_up: { name: 'jump_up', type: 'once', totalFrames: 8, ticksPerFrame: 4, loop: false, transition: 'ease_out', description: 'Jump up' },
  jump_forward: { name: 'jump_forward', type: 'once', totalFrames: 8, ticksPerFrame: 4, loop: false, transition: 'ease_out', description: 'Jump forward' },
  jump_backward: { name: 'jump_backward', type: 'once', totalFrames: 8, ticksPerFrame: 4, loop: false, transition: 'ease_out', description: 'Jump backward' },
  stand_a: { name: 'stand_a', type: 'attack', totalFrames: 10, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Far A' },
  stand_b: { name: 'stand_b', type: 'attack', totalFrames: 10, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Far B' },
  stand_c: { name: 'stand_c', type: 'attack', totalFrames: 12, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Far C' },
  stand_d: { name: 'stand_d', type: 'attack', totalFrames: 12, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Far D' },
  crouch_a: { name: 'crouch_a', type: 'attack', totalFrames: 10, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Crouch A' },
  crouch_b: { name: 'crouch_b', type: 'attack', totalFrames: 10, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Crouch B' },
  crouch_c: { name: 'crouch_c', type: 'attack', totalFrames: 12, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Crouch C' },
  crouch_d: { name: 'crouch_d', type: 'attack', totalFrames: 12, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Crouch D' },
  jump_a: { name: 'jump_a', type: 'attack', totalFrames: 8, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Jump A' },
  jump_b: { name: 'jump_b', type: 'attack', totalFrames: 8, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Jump B' },
  jump_c: { name: 'jump_c', type: 'attack', totalFrames: 10, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Jump C' },
  jump_d: { name: 'jump_d', type: 'attack', totalFrames: 10, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Jump D' },
  hitstun: { name: 'hitstun', type: 'once', totalFrames: 4, ticksPerFrame: 3, loop: false, transition: 'snap', description: 'Hitstun' },
  knockdown: { name: 'knockdown', type: 'once', totalFrames: 8, ticksPerFrame: 4, loop: false, transition: 'snap', description: 'Knockdown' },
  wakeup: { name: 'wakeup', type: 'once', totalFrames: 6, ticksPerFrame: 3, loop: false, transition: 'ease_in', description: 'Wakeup' },
  win: { name: 'win', type: 'once', totalFrames: 8, ticksPerFrame: 8, loop: false, transition: 'ease_out', description: 'Win pose' },
  taunt: { name: 'taunt', type: 'once', totalFrames: 8, ticksPerFrame: 6, loop: false, transition: 'snap', description: 'Taunt' },
  max_mode: { name: 'max_mode', type: 'once', totalFrames: 4, ticksPerFrame: 6, loop: false, transition: 'snap', description: 'MAX activation' },
  rugal_dark_smash: { name: 'rugal_dark_smash', type: 'attack', totalFrames: 12, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Dark Smash' },
  rugal_kaiser_wave: { name: 'rugal_kaiser_wave', type: 'attack', totalFrames: 34, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Kaiser Wave' },
  rugal_reppu_ken: { name: 'rugal_reppu_ken', type: 'attack', totalFrames: 30, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Reppu Ken' },
  rugal_genocide_cutter: { name: 'rugal_genocide_cutter', type: 'attack', totalFrames: 38, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Genocide Cutter' },
  rugal_dark_barrier: { name: 'rugal_dark_barrier', type: 'attack', totalFrames: 32, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Dark Barrier' },
  dm_rugal_gigantic_pressure: { name: 'dm_rugal_gigantic_pressure', type: 'attack', totalFrames: 54, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Gigantic Pressure' },
  dm_rugal_dead_end_screamer: { name: 'dm_rugal_dead_end_screamer', type: 'attack', totalFrames: 60, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Dead End Screamer' },
};

export function getRugalAnimationNames(): string[] {
  return Object.keys(RUGAL_ANIMATION_META);
}

export function getRugalAnimMeta(name: string): AnimationMeta | undefined {
  return RUGAL_ANIMATION_META[name];
}

export function getRugalAttackAnimations(): AnimationMeta[] {
  return Object.values(RUGAL_ANIMATION_META).filter(meta => meta.type === 'attack');
}

export function getRugalLoopAnimations(): AnimationMeta[] {
  return Object.values(RUGAL_ANIMATION_META).filter(meta => meta.loop);
}
