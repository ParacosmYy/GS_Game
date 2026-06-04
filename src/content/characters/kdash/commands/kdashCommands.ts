/**
 * K' Content Package — Command / Input Routing (真实数据)
 *
 * Maps K''s move list and input commands to their attack types.
 * 归属: content/characters/kdash/commands/ — 只放"怎么按"的规则
 */

/** A single move entry with structured data */
export interface KdashMoveEntry {
  name: string;
  input: string;
  type: 'command' | 'special' | 'dm' | 'sdm' | 'hsdm' | 'system';
  attackTypeKey?: string;
}

/** K''s move list, structured from the canonical definition */
export const KDASH_MOVE_LIST: KdashMoveEntry[] = [
  // Command normals — 命令通常技
  { name: 'One Inch (ワンインチ)', input: '→ + A', type: 'command', attackTypeKey: 'KDASH_ONE_INCH' },
  { name: 'Trigger Shot (トリガーショット)', input: '↘ + D', type: 'command', attackTypeKey: 'KDASH_TRIGGER' },
  // Specials — 必杀技
  { name: 'Eins Trigger (アインストリガー)', input: '↓↘→ + A / C', type: 'special', attackTypeKey: 'KDASH_EINS' },
  { name: 'Crow Bites (クロウバイツ)', input: '→↓↘ + A / C', type: 'special', attackTypeKey: 'KDASH_CROW' },
  { name: 'Minute Spike (ミニッツスパイク)', input: '↓↙← + K', type: 'special', attackTypeKey: 'KDASH_MINUTE' },
  { name: 'Narrow Spike (ナロウスパイク)', input: '↓↘→ + K', type: 'special', attackTypeKey: 'KDASH_NARROW' },
  // DMs — 超必杀技
  { name: 'Chain Shot (チェーンショット)', input: '↓↘→↓↘→ + P', type: 'dm', attackTypeKey: 'DM_CHAIN_SHOT' },
  // SDMs — MAX超必杀技
  { name: 'Chain Shot SDM (チェーンショット)', input: 'MAX ↓↘→↓↘→ + AC', type: 'sdm', attackTypeKey: 'SDM_CHAIN_SHOT' },
  // System
  { name: '爆气 (MAX Mode)', input: 'K+U / O (shortcut)', type: 'system' },
];

/** K''s win quotes */
export const KDASH_WIN_QUOTES: string[] = [
  '...チッ',
  '俺の邪魔をするな',
  'secondから逃げられない',
];

/** All available action names for K''s animation sequences */
export const KDASH_AVAILABLE_ACTIONS: string[] = [
  'idle', 'walk_forward', 'walk_backward', 'run', 'crouch', 'block',
  'jump_up', 'jump_forward', 'jump_backward', 'air_block',
  'stand_a', 'stand_b', 'stand_c', 'stand_d',
  'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
  'throw',
  'hitstun', 'blockstun', 'knockdown', 'wakeup', 'dizzy', 'guard_crush',
  'win', 'taunt', 'max_mode',
  'kdash_one_inch', 'kdash_trigger',
  'kdash_eins', 'kdash_eins_c',
  'kdash_crow', 'kdash_crow_c',
  'kdash_minute', 'kdash_narrow',
  'dm_chain_shot', 'sdm_chain_shot',
];
