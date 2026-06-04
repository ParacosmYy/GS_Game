/**
 * Andy Content Package — Command / Input Routing (真实数据)
 *
 * Maps Andy's move list and input commands to their attack types.
 * 归属: content/characters/andy/commands/ — 只放"怎么按"的规则
 */

/** A single move entry with structured data */
export interface AndyMoveEntry {
  name: string;
  input: string;
  type: 'command' | 'special' | 'dm' | 'sdm' | 'hsdm' | 'system';
  attackTypeKey?: string;
}

/** Andy's move list, structured from the canonical definition */
export const ANDY_MOVE_LIST: AndyMoveEntry[] = [
  // Command normals — 命令通常技
  { name: 'Uwa Agito (上顎)', input: '→ + A', type: 'command', attackTypeKey: 'ANDY_UWA_AGITO' },
  { name: 'Gedan Agito (下顎)', input: '→ + B', type: 'command', attackTypeKey: 'ANDY_GEDAN_AGITO' },
  // Specials — 必杀技
  { name: 'Hishou Ken (飛翔拳)', input: '↓↘→ + A / C', type: 'special', attackTypeKey: 'ANDY_HISHOU_KEN' },
  { name: 'Shouryuu Dan (昇龍弾)', input: '→↓↘ + A / C', type: 'special', attackTypeKey: 'ANDY_SHOURYUU_DAN' },
  { name: 'Zan\'ei Ryuusei Ken (斬影流星拳)', input: '←↙↓↘→ + B / D', type: 'special', attackTypeKey: 'ANDY_ZANEI_RYUSEI_KEN' },
  { name: 'Geki Hishou Ken (激飛翔拳)', input: '↓↙← + K (air)', type: 'special', attackTypeKey: 'ANDY_GEKI_HISHOU_KEN' },
  // DMs — 超必杀技
  { name: 'Cho Reppa Dan (超裂破弾)', input: '↓↘→↓↘→ + P', type: 'dm', attackTypeKey: 'DM_CHO_REPPA_DAN' },
  // System
  { name: '爆气 (MAX Mode)', input: 'K+U / O (shortcut)', type: 'system' },
];

/** Andy's win quotes */
export const ANDY_WIN_QUOTES: string[] = [
  '这就是不知火流的实力。',
  '还得更加努力修行。',
  '哥哥，我追上你了！',
];

/** All available action names for Andy's animation sequences */
export const ANDY_AVAILABLE_ACTIONS: string[] = [
  'idle', 'walk_forward', 'walk_backward', 'run', 'crouch', 'block',
  'jump_up', 'jump_forward', 'jump_backward', 'air_block',
  'stand_a', 'stand_b', 'stand_c', 'stand_d',
  'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
  'throw',
  'hitstun', 'blockstun', 'knockdown', 'wakeup', 'dizzy', 'guard_crush',
  'win', 'taunt', 'max_mode',
  'andy_hishou_ken', 'andy_shouryuu_dan', 'andy_zanei_ryusei_ken',
  'andy_geki_hishou_ken',
  'andy_uwa_agito', 'andy_gedan_agito',
  'dm_cho_reppa_dan',
];
