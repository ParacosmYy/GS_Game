/**
 * Takuma Content Package — Command / Input Routing
 *
 * 归属: content/characters/takuma/commands/ — 只放"怎么按"和可用动作清单。
 * 对应 KOF 差距: 已有 Takuma MUGEN manifest/hitboxes，补内容包入口。
 */

export interface TakumaMoveEntry {
  name: string;
  input: string;
  type: 'command' | 'special' | 'dm' | 'sdm' | 'system';
  attackTypeKey?: string;
}

export const TAKUMA_MOVE_LIST: TakumaMoveEntry[] = [
  { name: 'Fuu Ga', input: '→ + A', type: 'command', attackTypeKey: 'TAKUMA_FUU_GA' },
  { name: 'Gousou', input: '→ + B', type: 'command', attackTypeKey: 'TAKUMA_GOUSOU' },
  { name: 'Ko Ou Ken', input: '↓↘→ + A / C', type: 'special', attackTypeKey: 'TAKUMA_KO_OU_KEN' },
  { name: 'Haoh Shou Kou Ken', input: '→←↙↓↘→ + A / C', type: 'special', attackTypeKey: 'TAKUMA_HAOH_SHOU_KOU_KEN' },
  { name: 'Hien Shippuu Kyaku', input: '↓↙← + B / D', type: 'special', attackTypeKey: 'TAKUMA_HIEN_SHIPPUU' },
  { name: 'Ryuko Ranbu', input: '↓↘→↘↓↙← + A / C', type: 'dm', attackTypeKey: 'DM_RYUKO_RANBU_TAKUMA' },
  { name: 'Ryuko Ranbu SDM', input: 'MAX ↓↘→↘↓↙← + AC', type: 'sdm', attackTypeKey: 'SDM_RYUKO_RANBU_TAKUMA' },
  { name: 'MAX Mode', input: 'K+U / O shortcut', type: 'system' },
];

export const TAKUMA_WIN_QUOTES: string[] = [
  'Kyokugen karate has no weak stance.',
  'The old master still hits first.',
  'Train harder before you challenge Takuma.',
];

export const TAKUMA_AVAILABLE_ACTIONS: string[] = [
  'idle', 'walk_forward', 'walk_backward', 'run', 'backdash',
  'crouch', 'block', 'jump_up', 'jump_forward', 'jump_backward',
  'stand_a', 'stand_b', 'stand_c', 'stand_d',
  'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
  'jump_a', 'jump_b', 'jump_c', 'jump_d',
  'hitstun', 'knockdown', 'wakeup', 'win', 'taunt', 'max_mode',
  'takuma_fuu_ga', 'takuma_gousou', 'takuma_ko_ou_ken',
  'takuma_haoh_shou_kou_ken', 'takuma_hien_shippuu',
  'dm_ryuko_ranbu_takuma', 'sdm_ryuko_ranbu_takuma',
];
