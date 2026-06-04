/**
 * Clark Content Package — Command / Input Routing
 *
 * Maps Clark's move list and input commands to their attack types.
 * 归属: content/characters/clark/commands/ — 只放"怎么按"的规则
 */

/** A single move entry with structured data */
export interface ClarkMoveEntry {
  name: string;
  input: string;
  type: 'command' | 'special' | 'dm' | 'sdm' | 'hsdm' | 'system';
  attackTypeKey?: string;
}

/** Clark's move list, structured from the canonical definition */
export const CLARK_MOVE_LIST: ClarkMoveEntry[] = [
  // Command normals — 命令通常技
  { name: 'Death Lake Drive (デスレイクドライブ)', input: '→ + A', type: 'command', attackTypeKey: 'CLARK_DEATH_LAKE' },
  { name: 'Stomp (ストンピング)', input: '→ + B', type: 'command', attackTypeKey: 'CLARK_STOMP' },
  // Specials — 必杀技
  { name: 'Super Argentine Backbreaker (スーパーアルゼンチンバックブリーカー)', input: '↓↙← + A', type: 'special', attackTypeKey: 'CLARK_ARGENTINE' },
  { name: 'Super Argentine Backbreaker C (スーパーアルゼンチンバックブリーカー)', input: '↓↙← + C', type: 'special', attackTypeKey: 'CLARK_ARGENTINE_C' },
  { name: 'Napalm Stretch (ナパームストレッチ)', input: '↓↘→ + A / C', type: 'special', attackTypeKey: 'CLARK_NAPALM' },
  { name: 'Flash Elbow (フラッシュエルボー)', input: '↓↘→ + A / C (after throw)', type: 'special', attackTypeKey: 'CLARK_FLASH_ELBOW' },
  { name: 'Mount Tackle (マウントタックル)', input: '→↘↓↙← + A / C (near)', type: 'special', attackTypeKey: 'CLARK_MOUNT_TACKLE' },
  { name: 'Vulcan Punch (バルカンパンチ)', input: '↓↘→ + B / D', type: 'special', attackTypeKey: 'CLARK_VULCAN' },
  // DMs — 超必杀技
  { name: 'Super Argentine Backbreaker DM (スーパーアルゼンチンバックブリーカー)', input: '↓↘→↓↘→ + A / C', type: 'dm', attackTypeKey: 'DM_ARGENTINE_DM' },
  { name: 'Rolling Cradle DM (ローリングクレイドル)', input: '↓↙←↓↙← + B / D (near)', type: 'dm', attackTypeKey: 'DM_ROLLING_CRADLE' },
  // SDMs — MAX超必杀技
  { name: 'Super Argentine Backbreaker SDM (スーパーアルゼンチンバックブリーカー)', input: 'MAX ↓↘→↓↘→ + AC', type: 'sdm', attackTypeKey: 'SDM_ARGENTINE_DM' },
  { name: 'Rolling Cradle SDM (ローリングクレイドル)', input: 'MAX ↓↙←↓↙← + BD (near)', type: 'sdm', attackTypeKey: 'SDM_ROLLING_CRADLE' },
  // System
  { name: '爆气 (MAX Mode)', input: 'K+U / O (shortcut)', type: 'system' },
];

/** Clark's win quotes */
export const CLARK_WIN_QUOTES: string[] = [
  '任务完成。',
  '你太轻了。',
  '这就是军队的格斗术。',
];

/** All available action names for Clark's animation sequences */
export const CLARK_AVAILABLE_ACTIONS: string[] = [
  'idle', 'walk_forward', 'walk_backward', 'run', 'crouch', 'block',
  'jump_up', 'jump_forward', 'jump_backward', 'air_block',
  'stand_a', 'stand_b', 'stand_c', 'stand_d',
  'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
  'throw',
  'hitstun', 'blockstun', 'knockdown', 'wakeup', 'dizzy', 'guard_crush',
  'win', 'taunt', 'max_mode',
  'clark_argentine', 'clark_argentine_c', 'clark_napalm',
  'clark_flash_elbow', 'clark_mount_tackle', 'clark_vulcan',
  'clark_death_lake', 'clark_stomp',
  'dm_argentine_dm', 'dm_rolling_cradle',
];
