/**
 * Rugal Content Package — Command / Input Routing
 *
 * 归属: content/characters/rugal/commands/ — 只放 boss 的可用动作和指令描述。
 * Rugal 专属键保持字符串形式，避免依赖尚未归口的 core enum 草稿。
 */

export interface RugalMoveEntry {
  name: string;
  input: string;
  type: 'command' | 'special' | 'dm' | 'sdm' | 'system';
  attackTypeKey?: string;
}

export const RUGAL_MOVE_LIST: RugalMoveEntry[] = [
  { name: 'Dark Smash', input: '→ + A', type: 'command', attackTypeKey: 'RUGAL_DARK_SMASH' },
  { name: 'Kaiser Wave', input: '↓↘→ + A / C', type: 'special', attackTypeKey: 'RUGAL_KAISER_WAVE' },
  { name: 'Reppu Ken', input: '↓↙← + A / C', type: 'special', attackTypeKey: 'RUGAL_REPPU_KEN' },
  { name: 'Genocide Cutter', input: '→↓↘ + B / D', type: 'special', attackTypeKey: 'RUGAL_GENOCIDE_CUTTER' },
  { name: 'Dark Barrier', input: '↓↘→ + B / D', type: 'special', attackTypeKey: 'RUGAL_DARK_BARRIER' },
  { name: 'Gigantic Pressure', input: '↓↘→↓↘→ + A / C', type: 'dm', attackTypeKey: 'DM_RUGAL_GIGANTIC_PRESSURE' },
  { name: 'Dead End Screamer', input: '←↙↓↘→←↙↓↘→ + A / C', type: 'dm', attackTypeKey: 'DM_RUGAL_DEAD_END_SCREAMER' },
  { name: 'MAX Mode', input: 'K+U / O shortcut', type: 'system' },
];

export const RUGAL_WIN_QUOTES: string[] = [
  'You are not worth adding to my collection.',
  'This is the taste of absolute power.',
  'Bow before the emperor of fighters.',
];

export const RUGAL_AVAILABLE_ACTIONS: string[] = [
  'idle', 'walk_forward', 'walk_backward', 'run', 'backdash',
  'crouch', 'block', 'jump_up', 'jump_forward', 'jump_backward',
  'stand_a', 'stand_b', 'stand_c', 'stand_d',
  'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
  'jump_a', 'jump_b', 'jump_c', 'jump_d',
  'hitstun', 'knockdown', 'wakeup', 'win', 'taunt', 'max_mode',
  'rugal_dark_smash', 'rugal_kaiser_wave', 'rugal_reppu_ken',
  'rugal_genocide_cutter', 'rugal_dark_barrier',
  'dm_rugal_gigantic_pressure', 'dm_rugal_dead_end_screamer',
];
