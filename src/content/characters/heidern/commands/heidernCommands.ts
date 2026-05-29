/**
 * Heidern Content Package — Command / Input Routing (真实数据)
 *
 * Maps Heidern's move list and input commands to their attack types.
 * Heidern is a military-style mercenary with knife strikes, command grabs,
 * and projectile techniques. Leader of the Ikari Warriors.
 *
 * 归属: content/characters/heidern/commands/ — 只放"怎么按"的规则
 */

/** A single move entry with structured data */
export interface HeidernMoveEntry {
  name: string;
  input: string;
  type: 'command' | 'special' | 'dm' | 'sdm' | 'hsdm' | 'system';
  attackTypeKey?: string;
}

/** Heidern's move list, structured from the canonical KOF2002 definition */
export const HEIDERN_MOVE_LIST: HeidernMoveEntry[] = [
  // Command normals — 命令通常技
  { name: 'Sliding (スライディング)', input: '↘ + B', type: 'command', attackTypeKey: 'HEIDERN_SLIDING' },
  { name: 'Cross Cutter Stance (クロスカッター派生)', input: '→ + A', type: 'command', attackTypeKey: 'HEIDERN_COMMAND_A' },
  // Specials — 必杀技
  { name: 'Cross Cutter (クロスカッター)', input: '←蓄→ + A / C', type: 'special', attackTypeKey: 'HEIDERN_CROSS_CUTTER' },
  { name: 'Moon Slasher (ムーンスラッシャー)', input: '↓蓄↑ + A / C', type: 'special', attackTypeKey: 'HEIDERN_MOON_SLASHER' },
  { name: 'Neck Roller (ネックローリング)', input: '↓↙← + A / C', type: 'special', attackTypeKey: 'HEIDERN_NECK_ROLLER' },
  { name: 'Stormbringer (ストームブリンガー)', input: '←↙↓↘→ + A / C', type: 'special', attackTypeKey: 'HEIDERN_STORMBRINGER' },
  { name: 'Killing Bringer (キリングブリンガー)', input: '←↙↓↘→ + B / D', type: 'special', attackTypeKey: 'HEIDERN_KILLING_BRINGER' },
  { name: 'Leiden Reitter (ライデンライター)', input: '↓↙← + B / D', type: 'special', attackTypeKey: 'HEIDERN_LEIDEN_REITTER' },
  // DMs — 超必杀技
  { name: 'Critical Driver (クリティカルドライバー)', input: '←↙↓↘→↘↓↙← + A / C', type: 'dm', attackTypeKey: 'DM_HEIDERN_CRITICAL_DRIVER' },
  { name: 'Heidern End (ハイデルンエンド)', input: '↓↘→↓↘→ + A / C', type: 'dm', attackTypeKey: 'DM_HEIDERN_END' },
  // SDMs — MAX超必杀技
  { name: 'Critical Driver SDM (クリティカルドライバーSDM)', input: 'MAX ←↙↓↘→↘↓↙← + AC', type: 'sdm', attackTypeKey: 'SDM_HEIDERN_CRITICAL_DRIVER' },
  { name: 'Heidern End SDM (ハイデルンエンドSDM)', input: 'MAX ↓↘→↓↘→ + AC', type: 'sdm', attackTypeKey: 'SDM_HEIDERN_END' },
  // HSDMs — Hidden SDM (KOF2002UM)
  { name: 'Heidern Execution (ハイデルンエクスキュージョン)', input: 'MAX ↓↙←↓↙← + BD', type: 'hsdm', attackTypeKey: 'HSDM_HEIDERN_EXECUTION' },
  // System
  { name: '爆气 (MAX Mode)', input: 'K+U / O (shortcut)', type: 'system' },
];

/** Heidern's win quotes */
export const HEIDERN_WIN_QUOTES: string[] = [
  '任務完了...',
  '私に敗北の二文字はない',
  '軍人として、戦いに理由を問わない',
  '...次の標的は誰だ',
  'これが傭兵の戦い方だ',
  '軍規に従い、標的を排除した',
];

/** All available action names for Heidern's animation sequences */
export const HEIDERN_AVAILABLE_ACTIONS: string[] = [
  'idle', 'walk_forward', 'walk_backward', 'run', 'crouch', 'block',
  'jump_up', 'jump_forward', 'jump_backward', 'air_block',
  'stand_a', 'stand_b', 'stand_c', 'stand_d',
  'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
  'jump_a', 'jump_b', 'jump_c', 'jump_d',
  'throw',
  'hitstun', 'blockstun', 'knockdown', 'wakeup', 'dizzy', 'guard_crush',
  'win', 'taunt', 'max_mode',
  'heidern_cross_cutter', 'heidern_cross_cutter_c',
  'heidern_moon_slasher', 'heidern_moon_slasher_c',
  'heidern_neck_roller', 'heidern_neck_roller_c',
  'heidern_stormbringer', 'heidern_stormbringer_c',
  'heidern_killing_bringer', 'heidern_killing_bringer_d',
  'heidern_leiden_reitter', 'heidern_leiden_reitter_d',
  'heidern_sliding', 'heidern_command_a',
  'dm_heidern_critical_driver', 'dm_heidern_end',
  'sdm_heidern_critical_driver', 'sdm_heidern_end',
  'hsdm_heidern_execution',
];
