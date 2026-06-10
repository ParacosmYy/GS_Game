/**
 * Omega Rugal Content Package - Animation Metadata
 *
 * Runtime frame sequences come from public/sprites/cvsg_rugal/manifest.json.
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

export const G_RUGAL_ANIMATION_META: Record<string, AnimationMeta> = {
  idle: { name: 'idle', type: 'loop', totalFrames: 6, ticksPerFrame: 8, loop: true, transition: 'blend', description: 'Omega boss stance' },
  walk_forward: { name: 'walk_forward', type: 'loop', totalFrames: 6, ticksPerFrame: 6, loop: true, transition: 'ease_in', description: 'Walk forward' },
  walk_backward: { name: 'walk_backward', type: 'loop', totalFrames: 6, ticksPerFrame: 7, loop: true, transition: 'ease_in', description: 'Walk backward' },
  crouch: { name: 'crouch', type: 'loop', totalFrames: 1, ticksPerFrame: 8, loop: true, transition: 'blend', description: 'Crouch' },
  jump_up: { name: 'jump_up', type: 'once', totalFrames: 8, ticksPerFrame: 4, loop: false, transition: 'ease_out', description: 'Jump up' },
  jump_forward: { name: 'jump_forward', type: 'once', totalFrames: 8, ticksPerFrame: 4, loop: false, transition: 'ease_out', description: 'Jump forward' },
  jump_backward: { name: 'jump_backward', type: 'once', totalFrames: 8, ticksPerFrame: 4, loop: false, transition: 'ease_out', description: 'Jump backward' },
  hitstun: { name: 'hitstun', type: 'once', totalFrames: 4, ticksPerFrame: 3, loop: false, transition: 'snap', description: 'Hitstun' },
  knockdown: { name: 'knockdown', type: 'once', totalFrames: 8, ticksPerFrame: 4, loop: false, transition: 'snap', description: 'Knockdown' },
  win: { name: 'win', type: 'once', totalFrames: 8, ticksPerFrame: 8, loop: false, transition: 'ease_out', description: 'Win pose' },
  taunt: { name: 'taunt', type: 'once', totalFrames: 8, ticksPerFrame: 6, loop: false, transition: 'snap', description: 'Taunt' },
  stand_a: { name: 'stand_a', type: 'attack', totalFrames: 10, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Far A' },
  stand_b: { name: 'stand_b', type: 'attack', totalFrames: 10, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Far B' },
  stand_c: { name: 'stand_c', type: 'attack', totalFrames: 12, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Far C' },
  stand_d: { name: 'stand_d', type: 'attack', totalFrames: 12, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Far D' },
  close_a: { name: 'close_a', type: 'attack', totalFrames: 10, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Close A' },
  close_b: { name: 'close_b', type: 'attack', totalFrames: 10, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Close B' },
  close_c: { name: 'close_c', type: 'attack', totalFrames: 12, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Close C' },
  close_d: { name: 'close_d', type: 'attack', totalFrames: 12, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Close D' },
  crouch_a: { name: 'crouch_a', type: 'attack', totalFrames: 10, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Crouch A' },
  crouch_b: { name: 'crouch_b', type: 'attack', totalFrames: 10, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Crouch B' },
  crouch_c: { name: 'crouch_c', type: 'attack', totalFrames: 12, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Crouch C' },
  crouch_d: { name: 'crouch_d', type: 'attack', totalFrames: 12, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Crouch D' },
  jump_a: { name: 'jump_a', type: 'attack', totalFrames: 8, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Jump A' },
  jump_b: { name: 'jump_b', type: 'attack', totalFrames: 8, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Jump B' },
  jump_c: { name: 'jump_c', type: 'attack', totalFrames: 10, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Jump C' },
  jump_d: { name: 'jump_d', type: 'attack', totalFrames: 10, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Jump D' },
  g_rugal_dark_smash: { name: 'g_rugal_dark_smash', type: 'attack', totalFrames: 12, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Dark Smash' },
  g_rugal_kaiser_wave: { name: 'g_rugal_kaiser_wave', type: 'attack', totalFrames: 34, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Kaiser Wave' },
  g_rugal_reppu_ken: { name: 'g_rugal_reppu_ken', type: 'attack', totalFrames: 30, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Reppu Ken' },
  g_rugal_genocide_cutter: { name: 'g_rugal_genocide_cutter', type: 'attack', totalFrames: 38, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Genocide Cutter' },
  g_rugal_dark_barrier: { name: 'g_rugal_dark_barrier', type: 'attack', totalFrames: 32, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Dark Barrier' },
  dm_g_rugal_gigantic_pressure: { name: 'dm_g_rugal_gigantic_pressure', type: 'attack', totalFrames: 54, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Gigantic Pressure' },
  dm_g_rugal_dead_end_screamer: { name: 'dm_g_rugal_dead_end_screamer', type: 'attack', totalFrames: 60, ticksPerFrame: 2, loop: false, transition: 'snap', description: 'Dead End Screamer' },
};

export function getGRugalAnimationNames(): string[] {
  return Object.keys(G_RUGAL_ANIMATION_META);
}

export function getGRugalAnimMeta(name: string): AnimationMeta | undefined {
  return G_RUGAL_ANIMATION_META[name];
}

export function getGRugalAttackAnimations(): AnimationMeta[] {
  return Object.values(G_RUGAL_ANIMATION_META).filter(meta => meta.type === 'attack');
}

export function getGRugalLoopAnimations(): AnimationMeta[] {
  return Object.values(G_RUGAL_ANIMATION_META).filter(meta => meta.loop);
}
