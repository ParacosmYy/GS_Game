/**
 * Kim Content Package — Command / Input Routing (真实数据)
 *
 * Maps Kim's move list and input commands to their attack types.
 * 归属: content/characters/kim/commands/ — 只放"怎么按"的规则
 */

/** A single move entry with structured data */
export interface KimMoveEntry {
  name: string;
  input: string;
  type: 'command' | 'special' | 'dm' | 'sdm' | 'hsdm' | 'system';
  attackTypeKey?: string;
}

/** Kim's move list, structured from the canonical definition */
export const KIM_MOVE_LIST: KimMoveEntry[] = [
  // Command normals — 命令通常技
  { name: '飛翔脚 (Hishou Kyaku)', input: '空中 ↓↘→ + K', type: 'command', attackTypeKey: 'KIM_HISHOU' },
  { name: '飛翔踢 (Hishou Kick)', input: '→ + B', type: 'command', attackTypeKey: 'KIM_HISHOU_KICK' },
  { name: '半旋蹴 (Hansen)', input: '↘ + D', type: 'command', attackTypeKey: 'KIM_HANSEN' },
  // Specials — 必杀技
  { name: '飛燕斬 (Hienzan)', input: '↓蓄↑ + B / D', type: 'special', attackTypeKey: 'KIM_HIENZAN' },
  { name: '半月蹴 (Hangetsu Zan)', input: '↓↙← + B / D', type: 'special', attackTypeKey: 'KIM_HANGETSU' },
  { name: '三連撃 (Sanren Geki)', input: '↓↙← + P (×3)', type: 'special', attackTypeKey: 'KIM_SANREN' },
  { name: '覇気脚 (Haki Kyaku)', input: '↓↓ + B / D', type: 'special', attackTypeKey: 'KIM_HAKI' },
  // DMs — 超必杀技
  { name: '鳳凰脚 (Houou Kyaku)', input: '↓↙←↓↙← + K', type: 'dm', attackTypeKey: 'DM_PHOENIX_KICK' },
  { name: '鳳凰天舞脚 (Houou Tendou Kyaku)', input: '↓↘→↓↘→ + K', type: 'dm', attackTypeKey: 'DM_PHOENIX_HITEN' },
  // SDMs — MAX超必杀技
  { name: '鳳凰天舞脚 (MAX)', input: 'MAX ↓↘→↓↘→ + KK', type: 'sdm', attackTypeKey: 'SDM_PHOENIX_HITEN' },
  // HSDM — 隐藏超必杀技
  { name: '鳳凰天舞脚 EX (MAX+红血)', input: 'MAX+红血 ↓↘→↓↘→ + KK', type: 'hsdm', attackTypeKey: 'HSDM_PHOENIX_HITEN' },
  // System
  { name: '爆气 (MAX Mode)', input: 'K+U / O (shortcut)', type: 'system' },
];

/** Kim's win quotes */
export const KIM_WIN_QUOTES: string[] = [
  '弱者には手加減しない!',
  '正義は勝つ! これが私の信念だ',
  'まだ修行が足りないな',
];

/** All available action names for Kim's animation sequences */
export const KIM_AVAILABLE_ACTIONS: string[] = [
  'idle', 'walk_forward', 'walk_backward', 'run', 'crouch', 'block',
  'jump_up', 'jump_forward', 'jump_backward', 'air_block',
  'stand_a', 'stand_b', 'stand_c', 'stand_d',
  'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
  'throw',
  'hitstun', 'blockstun', 'knockdown', 'wakeup', 'dizzy', 'guard_crush',
  'win', 'taunt', 'max_mode',
  'kim_hienzan', 'kim_hangetsu', 'kim_sanren', 'kim_haki',
  'kim_hishou', 'kim_hishou_kick', 'kim_hansen',
  'dm_phoenix_kick', 'dm_phoenix_hiten',
];
