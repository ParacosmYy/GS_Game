/**
 * Iori Content Package — Command / Input Routing (真实数据)
 *
 * Maps Iori's move list and input commands to their attack types.
 * 归属: content/characters/iori/commands/ — 只放"怎么按"的规则
 */

/** A single move entry with structured data */
export interface IoriMoveEntry {
  /** Move display name */
  name: string;
  /** Input notation string */
  input: string;
  /** Move category */
  type: 'command' | 'special' | 'dm' | 'sdm' | 'hsdm' | 'system';
  /** Corresponding AttackType key (if applicable) */
  attackTypeKey?: string;
}

/** Iori's move list, structured from the canonical definition */
export const IORI_MOVE_LIST: IoriMoveEntry[] = [
  // Command normals — 命令通常技
  { name: '夢弾 (Yume Yumi)', input: '→ + A', type: 'command', attackTypeKey: 'IORI_YUMEYUMI' },
  { name: '邯鄲 (Katanugi)', input: '↘ + B', type: 'command', attackTypeKey: 'IORI_KATANUGI' },
  { name: '百合折り (Yukiwarui)', input: '空中 ↓ + C', type: 'command', attackTypeKey: 'IORI_YUKIWARUI' },
  // Specials — 必杀技
  { name: '闇払い (Yamibarai)', input: '↓↘→ + A / C', type: 'special', attackTypeKey: 'IORI_YAMIBARAI' },
  { name: '鬼焼き (Oniyaki)', input: '→↓↘ + A / C', type: 'special', attackTypeKey: 'IORI_ONIYAKI' },
  { name: '琴月陰 (Kototsuki In)', input: '←↙↓↘→ + B / D', type: 'special', attackTypeKey: 'IORI_KOTOTSUKI' },
  { name: '屑風 (Kuzukaze)', input: '←↙↓↘→↗↓↙← + P', type: 'special', attackTypeKey: 'IORI_KUZUKAZE' },
  // Rekka — 葵花 chain
  { name: '葵花 (Aoihana)', input: '↓↙← + A / C', type: 'special', attackTypeKey: 'IORI_AOIHANA' },
  { name: '葵花 追撃 弐', input: '葵花中 ↓↙← + P', type: 'special', attackTypeKey: 'IORI_AOIHANA_2' },
  { name: '葵花 追撃 参', input: '葵花弐中 ↓↙← + P', type: 'special', attackTypeKey: 'IORI_AOIHANA_3' },
  // DMs — 超必杀技
  { name: '八稚女 (Yaotome)', input: '↓↙←↙↓↘→ + A / C', type: 'dm', attackTypeKey: 'DM_YATAGARASU' },
  // SDMs — MAX超必杀技
  { name: '八稚女 (MAX)', input: '↓↙←↙↓↘→ + AC', type: 'sdm', attackTypeKey: 'SDM_YATAGARASU' },
  // HSDM — 隐藏超必杀技 (MAX + 红血)
  { name: '八稚女 (HSDM)', input: 'MAX+红血 ↓↙←↙↓↘→ + AC', type: 'hsdm', attackTypeKey: 'HSDM_YAOTOME' },
  // System — 系统动作
  { name: '爆气 (MAX Mode)', input: 'K+U / O (shortcut)', type: 'system' },
];

/** Iori's win quotes */
export const IORI_WIN_QUOTES: string[] = ['くだらん...', '血の叫びが聞こえるか?', '俺の痛みを味わえ'];

/** All available action names for Iori's animation sequences */
export const IORI_AVAILABLE_ACTIONS: string[] = [
  'idle', 'walk_forward', 'walk_backward', 'jump_up', 'jump_forward', 'jump_backward',
  'stand_a', 'stand_b', 'stand_c', 'stand_d',
  'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
  'hitstun', 'blockstun', 'knockdown', 'wakeup',
  'win',
  'aoihana', 'oniyaki', 'yamibarai', 'kototsuki', 'kuzukaze',
  'iori_yumeyumi', 'iori_katanugi', 'iori_yukiwarui',
  'dm_yatagarasu',
];
