/**
 * Yashiro Content Package — Command / Input Routing
 *
 * Maps Yashiro's move list and input commands to their attack types.
 * 归属: content/characters/yashiro/commands/ — 只放"怎么按"的规则
 */

/** A single move entry with structured data */
export interface YashiroMoveEntry {
  name: string;
  input: string;
  type: 'command' | 'special' | 'dm' | 'sdm' | 'hsdm' | 'system';
  attackTypeKey?: string;
}

/** Yashiro's move list, structured from the canonical definition */
export const YASHIRO_MOVE_LIST: YashiroMoveEntry[] = [
  // Command normals — 命令通常技
  { name: 'Shuu Wani (シュウワニ)', input: '→ + A', type: 'command', attackTypeKey: 'YASHIRO_SHUU_WANI' },
  { name: 'Juu Zutsu (ジュウズツ)', input: '→ + B', type: 'command', attackTypeKey: 'YASHIRO_JUU_ZUTSU' },
  // Specials — 必杀技
  { name: 'Upper Duke (アッパーデューク)', input: '↓↘→ + A / C', type: 'special', attackTypeKey: 'YASHIRO_UPPER_DU' },
  { name: 'Regret Bash (リグレットバッシュ)', input: '↓↙← + A / C', type: 'special', attackTypeKey: 'YASHIRO_NIRAAI' },
  { name: 'Jet Counter (ジェットカウンター)', input: '↓↘→ + B / D', type: 'special', attackTypeKey: 'YASHIRO_MUSATSU' },
  { name: 'Sledgehammer (スレッジハンマー)', input: '→↓↘ + A / C', type: 'special', attackTypeKey: 'YASHIRO_SLEDGEHAMMER' },
  { name: 'Missed (ミス)', input: '←↙↓↘→ + K', type: 'special', attackTypeKey: 'YASHIRO_MISSED' },
  // DMs — 超必杀技
  { name: 'Million Bash Stream (ミリオンバッシュストリーム)', input: '↓↙←↓↙← + A / C', type: 'dm', attackTypeKey: 'DM_MILLION_BASH_STREAM' },
  { name: 'Ore Maji Mamire (オレマジマミレ)', input: '←↙↓↘→←↙↓↘→ + P (near)', type: 'dm', attackTypeKey: 'DM_ORE_MAJI_MAMIRE' },
  // SDMs — MAX超必杀技
  { name: 'Million Bash Stream SDM (ミリオンバッシュストリーム)', input: 'MAX ↓↙←↓↙← + AC', type: 'sdm', attackTypeKey: 'SDM_MILLION_BASH_STREAM' },
  { name: 'Ore Maji Mamire SDM (オレマジマミレ)', input: 'MAX ←↙↓↘→←↙↓↘→ + AC (near)', type: 'sdm', attackTypeKey: 'SDM_ORE_MAJI_MAMIRE' },
  // System
  { name: '爆气 (MAX Mode)', input: 'K+U / O (shortcut)', type: 'system' },
];

/** Yashiro's win quotes */
export const YASHIRO_WIN_QUOTES: string[] = [
  '我的拳头就是正义！',
  '太弱了，回去练练吧。',
  '这就是力量的差距。',
];

/** All available action names for Yashiro's animation sequences */
export const YASHIRO_AVAILABLE_ACTIONS: string[] = [
  'idle', 'walk_forward', 'walk_backward', 'run', 'crouch', 'block',
  'jump_up', 'jump_forward', 'jump_backward', 'air_block',
  'stand_a', 'stand_b', 'stand_c', 'stand_d',
  'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
  'throw',
  'hitstun', 'blockstun', 'knockdown', 'wakeup', 'dizzy', 'guard_crush',
  'win', 'taunt', 'max_mode',
  'yashiro_upper_du', 'yashiro_niraai', 'yashiro_musatsu',
  'yashiro_sledgehammer', 'yashiro_missed',
  'yashiro_shuu_wani', 'yashiro_juu_zutsu',
  'dm_million_bash_stream', 'dm_ore_maji_mamire',
];
