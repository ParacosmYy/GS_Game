/**
 * Yamazaki Content Package — Command / Input Routing (真实数据)
 *
 * Maps Yamazaki's move list and input commands to their attack types.
 * 归属: content/characters/yamazaki/commands/ — 只放"怎么按"的规则
 *
 * Ryuji Yamazaki (山崎竜二) — Orochi bloodline, one-handed snake-arm fighter.
 * Notable: Hebi Tsukai follow-up system, counter-based neutral, no projectiles.
 */

/** A single move entry with structured data */
export interface YamazakiMoveEntry {
  name: string;
  input: string;
  type: 'command' | 'special' | 'dm' | 'sdm' | 'hsdm' | 'system';
  attackTypeKey?: string;
}

/** Yamazaki's move list, structured from the canonical definition */
export const YAMAZAKI_MOVE_LIST: YamazakiMoveEntry[] = [
  // Command normals — 命令通常技
  { name: 'Sashi (刺し)', input: '→ + A', type: 'command', attackTypeKey: 'YAMAZAKI_SASHI' },
  { name: 'Bokkai (暴会)', input: '↘ + B', type: 'command', attackTypeKey: 'YAMAZAKI_BOKKAI' },
  // Specials — 必杀技
  { name: 'Snake Arm (蛇使い・弐) qcf+A', input: '↓↘→ + A', type: 'special', attackTypeKey: 'YAMAZAKI_SNAKE_ARM' },
  { name: 'Snake Arm (蛇使い・弐) qcf+C', input: '↓↘→ + C', type: 'special', attackTypeKey: 'YAMAZAKI_SNAKE_ARM_C' },
  { name: 'Sandstorm (爆弾拳) / Hebi Tsukai (蛇使い)', input: '↓↙← + A / C', type: 'special', attackTypeKey: 'YAMAZAKI_SANDSTORM' },
  { name: 'Bai Gaeshi (倍返し)', input: '↓↙← + B / D', type: 'special', attackTypeKey: 'YAMAZAKI_BAI_GA_SE' },
  // DMs — 超必杀技
  { name: 'Guillotine (ギロチン)', input: '↓↘→↓↘→ + A / C', type: 'dm', attackTypeKey: 'DM_GUILLOTINE' },
  // SDMs — MAX超必杀技
  { name: 'Guillotine SDM (ギロチンSDM)', input: 'MAX ↓↘→↓↘→ + AC', type: 'sdm', attackTypeKey: 'SDM_GUILLOTINE' },
  // HSDM — Drill (隠し超必殺技)
  { name: 'Drill (ドリル)', input: 'MAX+红血 →→→→+AC', type: 'hsdm', attackTypeKey: 'HSDM_DRILL' },
  // System
  { name: '爆気 (MAX Mode)', input: 'K+U / O (shortcut)', type: 'system' },
];

/** Yamazaki's win quotes */
export const YAMAZAKI_WIN_QUOTES: string[] = [
  '俺の暴力に…同情するな！',
  'Still standing? Heh... not for long.',
  '俺に触れると…どうなるか分かってるんだろ?',
];

/** All available action names for Yamazaki's animation sequences */
export const YAMAZAKI_AVAILABLE_ACTIONS: string[] = [
  'idle', 'walk_forward', 'walk_backward', 'run', 'crouch', 'block',
  'jump_up', 'jump_forward', 'jump_backward', 'air_block',
  'stand_a', 'stand_b', 'stand_c', 'stand_d',
  'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
  'throw',
  'hitstun', 'blockstun', 'knockdown', 'wakeup', 'dizzy', 'guard_crush',
  'win', 'taunt', 'max_mode',
  'yamazaki_snake_arm', 'yamazaki_snake_arm_c',
  'yamazaki_sandstorm', 'yamazaki_bai_ga_se',
  'yamazaki_sashi', 'yamazaki_bokkai',
  'dm_guillotine', 'sdm_guillotine',
];
