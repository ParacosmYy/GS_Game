/**
 * Ryo Content Package — Command / Input Routing
 *
 * Maps Ryo's move list and input commands to their attack types.
 * This provides a structured view of Ryo's move list from the content package.
 */
import { RyoDef } from '../../../characters/ryo.js';

/** A single move entry with structured data */
export interface RyoMoveEntry {
  /** Move display name */
  name: string;
  /** Input notation string */
  input: string;
  /** Move category */
  type: 'command' | 'special' | 'dm' | 'sdm' | 'system';
  /** Corresponding AttackType key (if applicable) */
  attackTypeKey?: string;
}

/** Ryo's move list, structured from the canonical definition */
export const RYO_MOVE_LIST: RyoMoveEntry[] = [
  // Command normals
  { name: '冰柱割り (Tsurizarao)', input: '→ + A', type: 'command', attackTypeKey: 'RYO_TSURIZAO' },
  { name: '落蹴 (Orishi)', input: '↘ + B', type: 'command', attackTypeKey: 'RYO_ORISHI' },
  // Specials
  { name: '虎煌拳 (Ko\'ou Ken)', input: '↓↘→ + A / C', type: 'special', attackTypeKey: 'RYO_KOOU' },
  { name: '虎咆 (Kohou)', input: '→↓↘ + A / C', type: 'special', attackTypeKey: 'RYO_KO_HOU' },
  { name: '飛燕疾風脚 (Hien Shippu Kyaku)', input: '←↙↓ + K', type: 'special', attackTypeKey: 'RYO_HIEN' },
  { name: '霸王翔吼拳 (Haou Shoukou Ken)', input: '↓↘→ + K', type: 'special', attackTypeKey: 'RYO_HAOU' },
  // DMs
  { name: '天地霸煌拳 (Tenha Haou Ken)', input: '↓↘→↓↘→ + A / C', type: 'dm', attackTypeKey: 'DM_TEN_HA_OU' },
  { name: '龍虎乱舞 (Ryuko Ranbu)', input: '↓↘→↘↓↙← + A / C', type: 'dm', attackTypeKey: 'DM_RYUKO_RANBU' },
  // SDMs
  { name: '天地霸煌拳 (MAX)', input: '↓↘→↓↘→ + AC', type: 'sdm', attackTypeKey: 'SDM_TEN_HA_OU' },
  { name: '龍虎乱舞 (MAX)', input: '↓↘→↘↓↙← + AC', type: 'sdm', attackTypeKey: 'SDM_RYUKO_RANBU' },
  // System
  { name: '爆气 (MAX Mode)', input: 'K+U / O (shortcut)', type: 'system' },
];

/** Ryo's win quotes */
export const RYO_WIN_QUOTES: string[] = RyoDef.winQuotes;

/** All available action names for Ryo's animation sequences */
export const RYO_AVAILABLE_ACTIONS: string[] = [
  'idle', 'walk_forward', 'walk_backward', 'run', 'crouch', 'block',
  'jump_up', 'jump_forward', 'jump_backward', 'air_block',
  'stand_a', 'stand_b', 'stand_c', 'stand_d',
  'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
  'throw',
  'hitstun', 'blockstun', 'knockdown', 'wakeup', 'dizzy', 'guard_crush',
  'win', 'taunt', 'max_mode',
  'ryo_koou', 'ryo_ko_hou', 'ryo_hien', 'ryo_haou',
  'ryo_tsurizao', 'ryo_orishi',
  'dm_ten_ha_ou',
  // Backward compat aliases
  'koouken', 'ko_hou', 'hien', 'haou', 'dm_haou',
];
