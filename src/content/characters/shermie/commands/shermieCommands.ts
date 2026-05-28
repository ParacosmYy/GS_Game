/**
 * Shermie Content Package — Command / Input Routing (真实数据)
 *
 * Maps Shermie's move list and input commands to their attack types.
 * 归属: content/characters/shermie/commands/ — 只放"怎么按"的规则
 */

/** A single move entry with structured data */
export interface ShermieMoveEntry {
  name: string;
  input: string;
  type: 'command' | 'special' | 'dm' | 'sdm' | 'hsdm' | 'system';
  attackTypeKey?: string;
}

/** Shermie's move list, structured from the canonical definition */
export const SHERMIE_MOVE_LIST: ShermieMoveEntry[] = [
  // Command normals — 命令通常技
  { name: 'Shermie Stand (シェルミースタンド)', input: '→ + A', type: 'command', attackTypeKey: 'SHERMIE_STAND' },
  { name: 'Shermie Clash (シェルミークラッシュ)', input: '→ + B', type: 'command', attackTypeKey: 'SHERMIE_CLASH' },
  // Specials — 必杀技
  { name: 'Shermie Shoot (シェルミーシュート)', input: '↓↘→ + A / C', type: 'special', attackTypeKey: 'SHERMIE_SHOOT' },
  { name: 'Shermie Carnival (シェルミーカーニバル)', input: '↓↙← + A / C', type: 'special', attackTypeKey: 'SHERMIE_CARNIVAL' },
  { name: 'Shermie Spiral (シェルミースパイラル)', input: '→↘↓↙← + A / C (near)', type: 'special', attackTypeKey: 'SHERMIE_SPIRAL' },
  { name: 'Shermie Whip (シェルミーウィップ)', input: '↓↘→ + B / D', type: 'special', attackTypeKey: 'SHERMIE_WHIP' },
  { name: 'Shermie Clutch (シェルミークラッチ)', input: '→↘↓↙← + B / D (near)', type: 'special', attackTypeKey: 'SHERMIE_SUPLEX' },
  { name: 'Axle Spin Kick (アクセルスピンキック)', input: '↓↙← + B / D', type: 'special', attackTypeKey: 'SHERMIE_AXLE_SPIN' },
  // DMs — 超必杀技
  { name: 'Shermie Carnival DM (シェルミーカーニバル)', input: '↓↘→↓↘→ + B / D', type: 'dm', attackTypeKey: 'DM_SHERMIE_CARNIVAL' },
  { name: 'Shermie Flash DM (シェルミーフラッシュ)', input: '→↘↓↙←→ + A / C (near)', type: 'dm', attackTypeKey: 'DM_SHERMIE_FLASH' },
  // SDMs — MAX超必杀技
  { name: 'Shermie Carnival SDM (シェルミーカーニバル)', input: 'MAX ↓↘→↓↘→ + BD', type: 'sdm', attackTypeKey: 'SDM_SHERMIE_CARNIVAL' },
  { name: 'Shermie Flash SDM (シェルミーフラッシュ)', input: 'MAX →↘↓↙←→ + AC (near)', type: 'sdm', attackTypeKey: 'SDM_SHERMIE_FLASH' },
  // System
  { name: '爆气 (MAX Mode)', input: 'K+U / O (shortcut)', type: 'system' },
];

/** Shermie's win quotes */
export const SHERMIE_WIN_QUOTES: string[] = [
  'Am I too strong for you?',
  '私のテクニックに勝てるわけないでしょ?',
  'You were pretty cute... until you lost!',
];

/** All available action names for Shermie's animation sequences */
export const SHERMIE_AVAILABLE_ACTIONS: string[] = [
  'idle', 'walk_forward', 'walk_backward', 'run', 'crouch', 'block',
  'jump_up', 'jump_forward', 'jump_backward', 'air_block',
  'stand_a', 'stand_b', 'stand_c', 'stand_d',
  'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
  'throw',
  'hitstun', 'blockstun', 'knockdown', 'wakeup', 'dizzy', 'guard_crush',
  'win', 'taunt', 'max_mode',
  'shermie_shoot', 'shermie_carnival', 'shermie_spiral',
  'shermie_whip', 'shermie_suplex', 'shermie_axle_spin',
  'shermie_stand', 'shermie_clash',
  'dm_shermie_carnival', 'dm_shermie_flash',
];
