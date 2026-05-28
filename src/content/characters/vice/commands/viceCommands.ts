/**
 * Vice Content Package — Command / Input Routing (真实数据)
 *
 * Maps Vice's move list and input commands to their attack types.
 * 归属: content/characters/vice/commands/ — 只放"怎么按"的规则
 */

/** A single move entry with structured data */
export interface ViceMoveEntry {
  name: string;
  input: string;
  type: 'command' | 'special' | 'dm' | 'sdm' | 'hsdm' | 'system';
  attackTypeKey?: string;
}

/** Vice's move list, structured from the canonical definition */
export const VICE_MOVE_LIST: ViceMoveEntry[] = [
  // Command normals — 命令通常技
  { name: 'Monstrosity (モンストロシティ)', input: '→ + A', type: 'command', attackTypeKey: 'VICE_MONSTROSITY' },
  { name: 'Overkill (オーバーキル)', input: '→ + B', type: 'command', attackTypeKey: 'VICE_OVERKILL' },
  // Specials — 必杀技
  { name: 'Outrage (アウトレイジ)', input: '↓↘→ + A / C', type: 'special', attackTypeKey: 'VICE_OUTRAGE' },
  { name: 'Black End (ブラックエンド)', input: '↓↙← + A / C', type: 'special', attackTypeKey: 'VICE_BLACK_END' },
  { name: 'Mayhem (メイヘム)', input: '←↙↓↘→ + B / D', type: 'special', attackTypeKey: 'VICE_MAYHEM' },
  { name: 'Gore Fest (ゴアフェスト)', input: '→↘↓↙←→ + A / C', type: 'special', attackTypeKey: 'VICE_GORE_FEST' },
  // DMs — 超必杀技
  { name: 'Withering Surface (ウィザリングサーフェス)', input: '↓↘→↓↘→ + A / C', type: 'dm', attackTypeKey: 'DM_WITHERING_SURFACE' },
  { name: 'Negative Gain (ネガティブゲイン)', input: '→↘↓↙←→↘↓↙← + B / D', type: 'dm', attackTypeKey: 'DM_NEGATIVE_GAIN' },
  // SDMs — MAX超必杀技
  { name: 'Withering Surface SDM (ウィザリングサーフェスSDM)', input: 'MAX ↓↘→↓↘→ + AC', type: 'sdm', attackTypeKey: 'SDM_WITHERING_SURFACE' },
  { name: 'Negative Gain SDM (ネガティブゲインSDM)', input: 'MAX →↘↓↙←→↘↓↙← + BD', type: 'sdm', attackTypeKey: 'SDM_NEGATIVE_GAIN' },
  // System
  { name: '爆气 (MAX Mode)', input: 'K+U / O (shortcut)', type: 'system' },
];

/** Vice's win quotes — dark, Orochi-themed */
export const VICE_WIN_QUOTES: string[] = [
  '脆いわね…大蛇の血を知らないの？',
  'You were never a match for Orochi\'s power.',
  '血の記憶は消せない。あなたもいずれわかる。',
  'Why do you resist? The end is inevitable.',
  '大蛇の復活は近い。あなたには関係のないことか…',
];

/** All available action names for Vice's animation sequences */
export const VICE_AVAILABLE_ACTIONS: string[] = [
  'idle', 'walk_forward', 'walk_backward', 'run', 'crouch', 'block',
  'jump_up', 'jump_forward', 'jump_backward', 'air_block',
  'stand_a', 'stand_b', 'stand_c', 'stand_d',
  'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
  'throw',
  'hitstun', 'blockstun', 'knockdown', 'wakeup', 'dizzy', 'guard_crush',
  'win', 'taunt', 'max_mode',
  'vice_monstrosity', 'vice_overkill',
  'vice_outrage', 'vice_outrage_c',
  'vice_black_end', 'vice_mayhem', 'vice_gore_fest',
  'dm_withering_surface', 'dm_negative_gain',
  'sdm_withering_surface', 'sdm_negative_gain',
];
