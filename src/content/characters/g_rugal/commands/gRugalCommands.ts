/**
 * Omega Rugal Content Package - Command / Input Routing
 *
 * This file describes content-package commands only. Playable routing remains
 * outside this minimal MUGEN import slice.
 */

export interface GRugalMoveEntry {
  name: string;
  input: string;
  type: 'command' | 'special' | 'dm' | 'system';
  attackTypeKey?: string;
}

export const G_RUGAL_MOVE_LIST: GRugalMoveEntry[] = [
  { name: 'Dark Smash', input: 'forward + A', type: 'command', attackTypeKey: 'G_RUGAL_DARK_SMASH' },
  { name: 'Kaiser Wave', input: 'quarter-circle forward + A / C', type: 'special', attackTypeKey: 'G_RUGAL_KAISER_WAVE' },
  { name: 'Reppu Ken', input: 'quarter-circle back + A / C', type: 'special', attackTypeKey: 'G_RUGAL_REPPU_KEN' },
  { name: 'Genocide Cutter', input: 'dragon-punch + B / D', type: 'special', attackTypeKey: 'G_RUGAL_GENOCIDE_CUTTER' },
  { name: 'Dark Barrier', input: 'quarter-circle forward + B / D', type: 'special', attackTypeKey: 'G_RUGAL_DARK_BARRIER' },
  { name: 'Gigantic Pressure', input: 'double quarter-circle forward + A / C', type: 'dm', attackTypeKey: 'DM_G_RUGAL_GIGANTIC_PRESSURE' },
  { name: 'Dead End Screamer', input: 'double half-circle forward + A / C', type: 'dm', attackTypeKey: 'DM_G_RUGAL_DEAD_END_SCREAMER' },
  { name: 'MAX Mode', input: 'K+U / O shortcut', type: 'system' },
];

export const G_RUGAL_WIN_QUOTES: string[] = [
  'Absolute power leaves no survivors.',
  'You have witnessed the Omega.',
  'Even your strongest technique belongs in my collection.',
];

export const G_RUGAL_AVAILABLE_ACTIONS: string[] = [
  'idle', 'walk_forward', 'walk_backward',
  'crouch', 'jump_up', 'jump_forward', 'jump_backward',
  'stand_a', 'stand_b', 'stand_c', 'stand_d',
  'close_a', 'close_b', 'close_c', 'close_d',
  'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
  'jump_a', 'jump_b', 'jump_c', 'jump_d',
  'hitstun', 'knockdown', 'win', 'taunt',
  'g_rugal_dark_smash', 'g_rugal_kaiser_wave', 'g_rugal_reppu_ken',
  'g_rugal_genocide_cutter', 'g_rugal_dark_barrier',
  'dm_g_rugal_gigantic_pressure', 'dm_g_rugal_dead_end_screamer',
];
