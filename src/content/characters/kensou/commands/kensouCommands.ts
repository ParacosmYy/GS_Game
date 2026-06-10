/**
 * Kensou Content Package — Command / Input Routing
 *
 * 归属: content/characters/kensou/commands/ — 只放"怎么按"和可用动作清单。
 * 对应 KOF 差距: 已有 Kensou MUGEN manifest/hitboxes，补内容包入口。
 */

export interface KensouMoveEntry {
  name: string;
  input: string;
  type: 'command' | 'special' | 'dm' | 'sdm' | 'system';
  attackTypeKey?: string;
}

export const KENSOU_MOVE_LIST: KensouMoveEntry[] = [
  { name: 'Bakyaku', input: '→ + B', type: 'command', attackTypeKey: 'KENSOU_BAKYAKU' },
  { name: 'Kakuhi', input: '↘ + D', type: 'command', attackTypeKey: 'KENSOU_KAKUHI' },
  { name: 'Chou Kyuu Dan', input: '↓↘→ + A / C', type: 'special', attackTypeKey: 'KENSOU_CHOU_KYUU_DAN' },
  { name: 'Ryurenga Tentei', input: '↓↙← + A / C', type: 'special', attackTypeKey: 'KENSOU_RYURENGA_TEN' },
  { name: 'Ryusou Geki', input: '←↙↓↘→ + A / C', type: 'special', attackTypeKey: 'KENSOU_RYUSOU_GEKI' },
  { name: 'Shin Chou Kyuu Dan', input: '↓↘→↓↘→ + A / C', type: 'dm', attackTypeKey: 'DM_SHIN_CHOU_KYUU_DAN' },
  { name: 'Shin Chou Kyuu Dan SDM', input: 'MAX ↓↘→↓↘→ + AC', type: 'sdm', attackTypeKey: 'SDM_SHIN_CHOU_KYUU_DAN' },
  { name: 'MAX Mode', input: 'K+U / O shortcut', type: 'system' },
];

export const KENSOU_WIN_QUOTES: string[] = [
  'Psychic power and appetite both win.',
  'Athena, did you see that one?',
  'Too slow. I already read the opening.',
];

export const KENSOU_AVAILABLE_ACTIONS: string[] = [
  'idle', 'walk_forward', 'walk_backward', 'run', 'backdash',
  'crouch', 'block', 'jump_up', 'jump_forward', 'jump_backward',
  'stand_a', 'stand_b', 'stand_c', 'stand_d',
  'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
  'jump_a', 'jump_b', 'jump_c', 'jump_d',
  'hitstun', 'knockdown', 'wakeup', 'win', 'taunt', 'max_mode',
  'kensou_bakyaku', 'kensou_kakuhi', 'kensou_chou_kyuu_dan',
  'kensou_ryurenga_ten', 'kensou_ryurenga_chi', 'kensou_ryusou_geki',
  'dm_shin_chou_kyuu_dan', 'sdm_shin_chou_kyuu_dan',
];
