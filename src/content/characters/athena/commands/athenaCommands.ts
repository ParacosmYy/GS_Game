/**
 * Athena Content Package — Command / Input Routing (真实数据)
 *
 * Maps Athena's move list and input commands to their attack types.
 * 归属: content/characters/athena/commands/ — 只放"怎么按"的规则
 */

/** A single move entry with structured data */
export interface AthenaMoveEntry {
  name: string;
  input: string;
  type: 'command' | 'special' | 'dm' | 'sdm' | 'hsdm' | 'system';
  attackTypeKey?: string;
}

/** Athena's move list, structured from the canonical definition */
export const ATHENA_MOVE_LIST: AthenaMoveEntry[] = [
  // Command normals — 命令通常技
  { name: 'Phoenix Reflect (サイコリフレクト)', input: '→ + B', type: 'command', attackTypeKey: 'ATHENA_PHOENIX_REFLECT' },
  { name: 'Low B (↘+B)', input: '↘ + B', type: 'command', attackTypeKey: 'ATHENA_LOW_B' },
  { name: 'Air Crossup B (空中↓+B)', input: '空中 ↓ + B', type: 'command', attackTypeKey: 'ATHENA_AIR_B' },
  // Specials — 必杀技
  { name: 'Psycho Ball (サイコボール)', input: '↓↙← + A / C', type: 'special', attackTypeKey: 'ATHENA_PSYCHO_BALL' },
  { name: 'Psycho Ball C (サイコボール・強)', input: '↓↙← + C', type: 'special', attackTypeKey: 'ATHENA_PSYCHO_BALL_C' },
  { name: 'Psycho Sword (サイコソード)', input: '→↓↘ + A / C', type: 'special', attackTypeKey: 'ATHENA_PSYCHO_SWORD' },
  { name: 'Psycho Sword C (サイコソード・強)', input: '→↓↘ + C', type: 'special', attackTypeKey: 'ATHENA_PSYCHO_SWORD_C' },
  { name: 'Phoenix Arrow (フェニックスアロー)', input: '空中 ↓↘→ + B / D', type: 'special', attackTypeKey: 'ATHENA_PHOENIX_ARROW' },
  { name: 'Psycho Teleport (サイコテレポート)', input: '↓↙← + B / D', type: 'special', attackTypeKey: 'ATHENA_PSYCHO_TELEPORT' },
  // DMs — 超必杀技
  { name: 'Shining Crystal Bit (シャイニングクリスタルビット)', input: '↓↘→↓↘→ + A / C', type: 'dm', attackTypeKey: 'DM_SHINING_CRYSTAL_BIT' },
  { name: 'Phoenix Fang Arrow (フェニックスファングアロー)', input: '空中 ↓↘→↓↘→ + A / C', type: 'dm', attackTypeKey: 'DM_PHOENIX_FANG_ARROW' },
  // SDMs — MAX超必杀技
  { name: 'Shining Crystal Bit SDM (シャイニングクリスタルビットSDM)', input: 'MAX ↓↘→↓↘→ + AC', type: 'sdm', attackTypeKey: 'SDM_SHINING_CRYSTAL_BIT' },
  { name: 'Phoenix Fang Arrow SDM (フェニックスファングアローSDM)', input: 'MAX 空中 ↓↘→↓↘→ + AC', type: 'sdm', attackTypeKey: 'SDM_PHOENIX_FANG_ARROW' },
  // System
  { name: '爆气 (MAX Mode)', input: 'K+U / O (shortcut)', type: 'system' },
];

/** Athena's win quotes */
export const ATHENA_WIN_QUOTES: string[] = [
  'まだまだこれからです！',
  '私の勝ちですね',
  'サイコパワー、見せてあげます！',
  '次のステージへ、レッツゴー！',
  'ファンの皆さん、ありがとう！',
  '夢は逃げない、追いかけるものです！',
];

/** All available action names for Athena's animation sequences */
export const ATHENA_AVAILABLE_ACTIONS: string[] = [
  'idle', 'walk_forward', 'walk_backward', 'run', 'crouch', 'block',
  'jump_up', 'jump_forward', 'jump_backward', 'air_block',
  'stand_a', 'stand_b', 'stand_c', 'stand_d',
  'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
  'jump_a', 'jump_b', 'jump_c', 'jump_d',
  'throw',
  'hitstun', 'blockstun', 'knockdown', 'wakeup', 'dizzy', 'guard_crush',
  'win', 'taunt', 'max_mode',
  'athena_psycho_ball', 'athena_psycho_ball_c',
  'athena_psycho_sword', 'athena_psycho_sword_c',
  'athena_phoenix_arrow', 'athena_psycho_teleport',
  'athena_phoenix_reflect', 'athena_low_b', 'athena_air_b',
  'dm_shining_crystal_bit', 'dm_phoenix_fang_arrow',
  'sdm_shining_crystal_bit', 'sdm_phoenix_fang_arrow',
];
