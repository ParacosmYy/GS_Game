/**
 * Mai Content Package — Command / Input Routing (真实数据)
 *
 * Maps Mai's move list and input commands to their attack types.
 * 归属: content/characters/mai/commands/ — 只放"怎么按"的规则
 */

/** A single move entry with structured data */
export interface MaiMoveEntry {
  name: string;
  input: string;
  type: 'command' | 'special' | 'dm' | 'sdm' | 'hsdm' | 'system';
  attackTypeKey?: string;
}

/** Mai's move list, structured from the canonical definition */
export const MAI_MOVE_LIST: MaiMoveEntry[] = [
  // Command normals — 命令通常技
  { name: '必殺忍蜂 (Hissatsu Shinobibachi)', input: '→ + B', type: 'command', attackTypeKey: 'MAI_HISSATSU_SHINOBIBACHI' },
  { name: '夕櫻舞 (Yusura Uma)', input: '↘ + B', type: 'command', attackTypeKey: 'MAI_YUSURA_UMA' },
  // Specials — 必杀技
  { name: '花蝶扇 (Kachousen)', input: '↓↘→ + A / C', type: 'special', attackTypeKey: 'MAI_KA_CHO_SEN' },
  { name: '龍炎舞 (Ryuuenbu)', input: '↓↙← + K', type: 'special', attackTypeKey: 'MAI_RYU_EN_BU' },
  { name: '飛翔龍炎陣 (Hishou Ryuenjin)', input: '→↓↘ + K', type: 'special', attackTypeKey: 'MAI_HISHO_RYU_EN_JIN' },
  // DMs — 超必杀技
  { name: '蜂巢落とし (Haka Otoshi / Housenka)', input: '↓↘→↓↘→ + K', type: 'dm', attackTypeKey: 'DM_HAKA_OTOSHI' },
  // SDMs — MAX超必杀技
  { name: '蜂巢落とし SDM (Haka Otoshi SDM)', input: 'MAX ↓↘→↓↘→ + BD', type: 'sdm', attackTypeKey: 'SDM_HAKA_OTOSHI' },
  // System
  { name: '爆气 (MAX Mode)', input: 'K+U / O (shortcut)', type: 'system' },
];

/** Mai's win quotes */
export const MAI_WIN_QUOTES: string[] = [
  'よっ！日本一の美女は誰かだって？…決まってるじゃない！',
  '私の炎から逃げられると思って？',
  '安室先生にも褒められた忍びの腕前よ！',
];

/** All available action names for Mai's animation sequences */
export const MAI_AVAILABLE_ACTIONS: string[] = [
  'idle', 'walk_forward', 'walk_backward', 'run', 'crouch', 'block',
  'jump_up', 'jump_forward', 'jump_backward', 'air_block',
  'stand_a', 'stand_b', 'stand_c', 'stand_d',
  'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
  'throw',
  'hitstun', 'blockstun', 'knockdown', 'wakeup', 'dizzy', 'guard_crush',
  'win', 'taunt', 'max_mode',
  'mai_kachousen', 'mai_ryuuenbu', 'mai_ryuenjin',
  'mai_hissatsu_shinobibachi', 'mai_yusura_uma',
  'dm_haka_otoshi', 'sdm_haka_otoshi',
];
