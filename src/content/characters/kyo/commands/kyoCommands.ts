/**
 * Kyo Content Package — Command / Input Routing (真实数据)
 *
 * Maps Kyo's move list and input commands to their attack types.
 * 归属: content/characters/kyo/commands/ — 只放"怎么按"的规则
 */
import { KyoDef } from '../../../../characters/kyo.js';

/** A single move entry with structured data */
export interface KyoMoveEntry {
  /** Move display name */
  name: string;
  /** Input notation string */
  input: string;
  /** Move category */
  type: 'command' | 'special' | 'dm' | 'sdm' | 'system';
  /** Corresponding AttackType key (if applicable) */
  attackTypeKey?: string;
}

/** Kyo's move list, structured from the canonical definition */
export const KYO_MOVE_LIST: KyoMoveEntry[] = [
  // Command normals — 命令通常技
  { name: '外式·轟斧陽 (Gofu You)', input: '→ + B', type: 'command', attackTypeKey: 'CMD_GOFU_YOU' },
  { name: '八拾八式 (88 Shiki)', input: '↘ + D', type: 'command', attackTypeKey: 'CMD_88SHIKI' },
  { name: '外式·奈落落とし (Naraku Otoshi)', input: '空中 ↓ + C', type: 'command', attackTypeKey: 'CMD_NARAKU' },
  // Specials — 必杀技
  { name: '闇払い (Yamibarai)', input: '↓↘→ + A / C', type: 'special', attackTypeKey: 'KYO_YAMIBARAI' },
  { name: '鬼焼き (Oniyaki)', input: '→↓↘ + A / C', type: 'special', attackTypeKey: 'KYO_ONIYAKI' },
  { name: '75式·改 (75 Shiki Kai)', input: '↓↘→ + K, K', type: 'special', attackTypeKey: 'KYO_75KAI' },
  { name: 'R.E.D. KICK', input: '←↓↙ + K', type: 'special', attackTypeKey: 'KYO_RED_KICK' },
  // Rekka — 荒咬み chain
  { name: '114式·荒咬み (Aragami)', input: '↓↘→ + A', type: 'special', attackTypeKey: 'KYO_ARAGAMI' },
  { name: '128式·九傷 (Kono Kizu)', input: '荒咬み中 ↓↘→ + P', type: 'special', attackTypeKey: 'KYO_ARAGAMI_KONOKIZU' },
  { name: '127式·八錆 (Yano Sabi)', input: '荒咬み中 ←↙↓ + P', type: 'special', attackTypeKey: 'KYO_ARAGAMI_YANOSABI' },
  { name: '七瀬 (Nanase)', input: '九傷中 ↓↘→ + K', type: 'special', attackTypeKey: 'KYO_NANASE' },
  { name: '琴月陽 (Gekio)', input: '九傷/八錆中 → + P', type: 'special', attackTypeKey: 'KYO_KOTO_TSUKI' },
  { name: '破砕 (Yaki Sogi)', input: '八錆中 P', type: 'special', attackTypeKey: 'KYO_YAKISOGI' },
  // Rekka — 毒咬み chain
  { name: '115式·毒咬み (Dokugami)', input: '↓↘→ + C', type: 'special', attackTypeKey: 'KYO_DOKUGAMI' },
  { name: '401式·罪詠み (Tsumiyomi)', input: '毒咬み中 ←↙↓ + P', type: 'special', attackTypeKey: 'KYO_TSUMIYOMI' },
  { name: '402式·罰詠み (Batsuyomi)', input: '罪詠み中 → + P', type: 'special', attackTypeKey: 'KYO_BATSUYOMI' },
  // DMs — 超必杀技
  { name: '大蛇薙 (Orochinagi)', input: '↓↙←↙↓↘→ + A / C', type: 'dm', attackTypeKey: 'DM_OROCHINAGI' },
  // SDMs — MAX超必杀技
  { name: '大蛇薙 (MAX)', input: '↓↙←↙↓↘→ + AC', type: 'sdm', attackTypeKey: 'SDM_OROCHINAGI' },
  // System — 系统动作
  { name: '爆气 (MAX Mode)', input: 'K+U / O (shortcut)', type: 'system' },
];

/** Kyo's win quotes */
export const KYO_WIN_QUOTES: string[] = KyoDef.winQuotes;

/** All available action names for Kyo's animation sequences */
export const KYO_AVAILABLE_ACTIONS: string[] = [
  'idle', 'walk_forward', 'walk_backward', 'run', 'crouch', 'block',
  'jump_up', 'jump_forward', 'jump_backward', 'air_block',
  'stand_a', 'stand_b', 'stand_c', 'stand_d',
  'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
  'throw',
  'hitstun', 'blockstun', 'knockdown', 'wakeup', 'dizzy', 'guard_crush',
  'win', 'taunt', 'max_mode',
  'kyo_yamibarai', 'kyo_oniyaki', 'kyo_75kai', 'kyo_red_kick',
  'kyo_aragami', 'kyo_dokugami',
  'cmd_gofu_you', 'cmd_88shiki', 'cmd_naraku',
  'dm_orochinagi',
];
