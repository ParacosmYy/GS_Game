/**
 * Terry Content Package — Command / Input Routing (真实数据)
 *
 * Maps Terry's move list and input commands to their attack types.
 * 归属: content/characters/terry/commands/ — 只放"怎么按"的规则
 */

/** A single move entry with structured data */
export interface TerryMoveEntry {
  name: string;
  input: string;
  type: 'command' | 'special' | 'dm' | 'sdm' | 'hsdm' | 'system';
  attackTypeKey?: string;
}

/** Terry's move list, structured from the canonical definition */
export const TERRY_MOVE_LIST: TerryMoveEntry[] = [
  // Command normals — 命令通常技
  { name: 'Back Knuckle (バックナックル)', input: '→ + A', type: 'command', attackTypeKey: 'TERRY_BACK_KNCKLE' },
  { name: 'Combination Blow (コンビネーションブロー)', input: '↘ + B', type: 'command', attackTypeKey: 'TERRY_COMBO_BLOW' },
  // Specials — 必杀技
  { name: 'Power Wave (パワーウェーブ)', input: '↓↘→ + A / C', type: 'special', attackTypeKey: 'TERRY_POWER_WAVE' },
  { name: 'Burn Knuckle (バーンナックル)', input: '↓↙← + A / C', type: 'special', attackTypeKey: 'TERRY_BURN_KNUCKLE' },
  { name: 'Crack Shot (クラックシュート)', input: '↓↙← + B / D', type: 'special', attackTypeKey: 'TERRY_CRACK_SHOT' },
  { name: 'Power Dunk (パワーダンク)', input: '→↓↘ + B / D', type: 'special', attackTypeKey: 'TERRY_POWER_DUNK' },
  { name: 'Rising Tackle (ライジングタックル)', input: '↓蓄↑ + A / C', type: 'special', attackTypeKey: 'TERRY_RISING_TACKLE' },
  // DMs — 超必杀技
  { name: 'Power Geyser (パワーゲイザー)', input: '↓↘→↓↘→ + A / C', type: 'dm', attackTypeKey: 'DM_POWER_GEYSER' },
  { name: 'High Angle Geyser (ハイアングルゲイザー)', input: '↓↘→↓↘→ + B / D', type: 'dm', attackTypeKey: 'DM_HIGH_ANGLE_GEYSER' },
  // SDMs — MAX超必杀技
  { name: 'Triple Geyser (トリプルゲイザー)', input: 'MAX ↓↘→↓↘→ + AC', type: 'sdm', attackTypeKey: 'SDM_TRIPLE_GEYSER' },
  // HSDM — 隐藏超必杀技
  { name: 'Power Geyser EX (MAX+红血)', input: 'MAX+红血 ↓↘→↓↘→ + AC', type: 'hsdm', attackTypeKey: 'HSDM_POWER_GEYSER' },
  // System
  { name: '爆气 (MAX Mode)', input: 'K+U / O (shortcut)', type: 'system' },
];

/** Terry's win quotes */
export const TERRY_WIN_QUOTES: string[] = [
  'Hey, come on, come on!!',
  'OK! 終わったな',
  'Stand up! まだやれるだろ?',
];

/** All available action names for Terry's animation sequences */
export const TERRY_AVAILABLE_ACTIONS: string[] = [
  'idle', 'walk_forward', 'walk_backward', 'run', 'crouch', 'block',
  'jump_up', 'jump_forward', 'jump_backward', 'air_block',
  'stand_a', 'stand_b', 'stand_c', 'stand_d',
  'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
  'throw',
  'hitstun', 'blockstun', 'knockdown', 'wakeup', 'dizzy', 'guard_crush',
  'win', 'taunt', 'max_mode',
  'terry_power_wave', 'terry_burn_knuckle', 'terry_crack_shot',
  'terry_power_dunk', 'terry_rising_tackle',
  'terry_back_knckle', 'terry_combo_blow',
  'dm_power_geyser', 'dm_high_angle_geyser',
];
