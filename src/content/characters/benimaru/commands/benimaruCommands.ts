/**
 * Benimaru Content Package — Command / Input Routing (真实数据)
 *
 * Maps Benimaru Nikaido's move list and input commands to their attack types.
 * 归属: content/characters/benimaru/commands/ — 只放"怎么按"的规则
 */

/** A single move entry with structured data */
export interface BenimaruMoveEntry {
  name: string;
  input: string;
  type: 'command' | 'special' | 'dm' | 'sdm' | 'hsdm' | 'system';
  attackTypeKey?: string;
}

/** Benimaru's move list, structured from the canonical definition */
export const BENIMARU_MOVE_LIST: BenimaruMoveEntry[] = [
  // Command normals — 命令通常技
  { name: 'Jackknife Kick (ジャックナイフキック)', input: '→ + B', type: 'command', attackTypeKey: 'BENIMARU_JACKKNIFE_KICK' },
  { name: 'Flying Drill (フライングドリル)', input: '空中 ↓ + D', type: 'command', attackTypeKey: 'BENIMARU_FLYING_DRILL' },
  // Specials — 必杀技
  { name: 'Raijinken (雷韧拳)', input: '↓↘→ + A / C', type: 'special', attackTypeKey: 'BENIMARU_RAIJINKEN' },
  { name: 'Iai Geri (居合蹴り)', input: '↓↙← + B / D', type: 'special', attackTypeKey: 'BENIMARU_IAI_GERI' },
  { name: 'Handou Sandan Geri (反動三段蹴り)', input: 'Iai Geri中 ↓↘→ + B / D', type: 'special', attackTypeKey: 'BENIMARU_HANDOU_SANDAN_GERI' },
  { name: 'Shinkuu Katategoma (真空片手駒)', input: '→↓↘ + A / C', type: 'special', attackTypeKey: 'BENIMARU_SHINKUU_KATATEGOMA' },
  { name: 'Benimaru Collider (紅丸コレダー)', input: '→↘↓↙← → + A / C', type: 'special', attackTypeKey: 'BENIMARU_COLLIDER' },
  { name: 'Super Inazuma Kick (スーパー稲妻キック)', input: '↓蓄↑ + B / D', type: 'special', attackTypeKey: 'BENIMARU_SUPER_INAZUMA_KICK' },
  // DMs — 超必杀技
  { name: 'Raikouken (雷光拳)', input: '↓↘→↓↘→ + A / C', type: 'dm', attackTypeKey: 'DM_RAIKOUKEN' },
  { name: 'Genei Hurricane (幻影ハリケーン)', input: '↓↘→↓↘→ + B / D', type: 'dm', attackTypeKey: 'DM_GENEI_HURRICANE' },
  // SDMs — MAX超必杀技
  { name: 'Raikouken SDM (雷光拳 SDM)', input: 'MAX ↓↘→↓↘→ + AC', type: 'sdm', attackTypeKey: 'SDM_RAIKOUKEN' },
  // HSDM — 隐藏超必杀技
  { name: 'Raikouken EX (MAX+红血)', input: 'MAX+红血 ↓↘→↓↘→ + AC', type: 'hsdm', attackTypeKey: 'HSDM_RAIKOUKEN' },
  // System
  { name: '爆气 (MAX Mode)', input: 'K+U / O (shortcut)', type: 'system' },
];

/** Benimaru's win quotes */
export const BENIMARU_WIN_QUOTES: string[] = [
  'Thunder strikes, baby!',
  '感電したかい? Was it a shock?',
  'That\'s the power of lightning!',
];

/** All available action names for Benimaru's animation sequences */
export const BENIMARU_AVAILABLE_ACTIONS: string[] = [
  'idle', 'walk_forward', 'walk_backward', 'run', 'crouch', 'block',
  'jump_up', 'jump_forward', 'jump_backward', 'air_block',
  'stand_a', 'stand_b', 'stand_c', 'stand_d',
  'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
  'throw',
  'hitstun', 'blockstun', 'knockdown', 'wakeup', 'dizzy', 'guard_crush',
  'win', 'taunt', 'max_mode',
  'benimaru_raijinken', 'benimaru_iai_geri', 'benimaru_handou_sandan_geri',
  'benimaru_shinkuu_katategoma', 'benimaru_collider',
  'benimaru_super_inazuma_kick',
  'benimaru_jackknife_kick', 'benimaru_flying_drill',
  'dm_raikouken', 'dm_genei_hurricane',
];
