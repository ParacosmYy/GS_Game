/**
 * Yuri Content Package — Move Definitions
 *
 * Full skill definitions with A/C/D/B/MAX version differences.
 */

export type MoveVersion = 'A' | 'C' | 'D' | 'B' | 'MAX';

export interface MoveVersionEntry {
  version: MoveVersion;
  attackTypeKey: string;
  differences: string;
  damageMultiplier: number;
  knockdown: boolean;
  invincibleStartup: boolean;
  isProjectile: boolean;
  isGrab: boolean;
}

export interface MoveDefinition {
  key: string;
  nameJa: string;
  nameEn: string;
  category: 'command_normal' | 'special' | 'dm' | 'sdm' | 'hsdm';
  input: string;
  versions: MoveVersionEntry[];
}

export const YURI_MOVES: MoveDefinition[] = [
  // Command Normals
  {
    key: 'yuri_upper_block',
    nameJa: '上段受け',
    nameEn: 'Upper Block',
    category: 'command_normal',
    input: '→+B',
    versions: [
      { version: 'B', attackTypeKey: 'YURI_UPPER_BLOCK', differences: 'Overhead attack', damageMultiplier: 0.8, knockdown: false, invincibleStartup: false, isProjectile: false, isGrab: false },
    ],
  },
  {
    key: 'yuri_lower_block',
    nameJa: '下段受け',
    nameEn: 'Lower Block',
    category: 'command_normal',
    input: '↘+B',
    versions: [
      { version: 'B', attackTypeKey: 'YURI_LOWER_BLOCK', differences: 'Low attack', damageMultiplier: 0.7, knockdown: false, invincibleStartup: false, isProjectile: false, isGrab: false },
    ],
  },
  {
    key: 'yuri_ori',
    nameJa: '百合折り',
    nameEn: 'Yuri Ori',
    category: 'command_normal',
    input: '空中←+B',
    versions: [
      { version: 'B', attackTypeKey: 'YURI_ORI', differences: 'Air cross-up', damageMultiplier: 0.8, knockdown: false, invincibleStartup: false, isProjectile: false, isGrab: false },
    ],
  },

  // Specials — Ko-ou Ken (QCF+P)
  {
    key: 'ko_ou_ken',
    nameJa: '虎煌拳',
    nameEn: 'Ko-ou Ken',
    category: 'special',
    input: '↓↘→+A or C',
    versions: [
      { version: 'A', attackTypeKey: 'YURI_KO_OU_KEN', differences: 'Weak version, faster startup', damageMultiplier: 0.7, knockdown: false, invincibleStartup: false, isProjectile: true, isGrab: false },
      { version: 'C', attackTypeKey: 'YURI_KO_OU_KEN', differences: 'Strong version, more damage', damageMultiplier: 1.0, knockdown: true, invincibleStartup: false, isProjectile: true, isGrab: false },
      { version: 'MAX', attackTypeKey: 'YURI_KO_OU_KEN', differences: 'EX version, larger projectile', damageMultiplier: 1.3, knockdown: true, invincibleStartup: false, isProjectile: true, isGrab: false },
    ],
  },

  // Specials — Haoh Sho Ko Ken (HCF+P)
  {
    key: 'haoh_sho_ko_ken',
    nameJa: '覇王翔吼拳',
    nameEn: 'Haoh Sho Ko Ken',
    category: 'special',
    input: '→←↙↓↘→+A or C',
    versions: [
      { version: 'A', attackTypeKey: 'YURI_HAOH_SHO_KO_KEN', differences: 'Weak version, faster', damageMultiplier: 1.0, knockdown: true, invincibleStartup: false, isProjectile: true, isGrab: false },
      { version: 'C', attackTypeKey: 'YURI_HAOH_SHO_KO_KEN', differences: 'Strong version, larger blast', damageMultiplier: 1.2, knockdown: true, invincibleStartup: false, isProjectile: true, isGrab: false },
      { version: 'MAX', attackTypeKey: 'YURI_HAOH_SHO_KO_KEN', differences: 'EX version', damageMultiplier: 1.5, knockdown: true, invincibleStartup: true, isProjectile: true, isGrab: false },
    ],
  },

  // Specials — Yuri Chou Upper (DP+P)
  {
    key: 'chou_upper',
    nameJa: ' Yuri超 upper',
    nameEn: 'Yuri Chou Upper',
    category: 'special',
    input: '→↓↘+A or C',
    versions: [
      { version: 'A', attackTypeKey: 'YURI_CHOU_UPPER', differences: 'Weak, 1 hit', damageMultiplier: 0.8, knockdown: true, invincibleStartup: true, isProjectile: false, isGrab: false },
      { version: 'C', attackTypeKey: 'YURI_CHOU_UPPER', differences: 'Strong, 2 hits', damageMultiplier: 1.2, knockdown: true, invincibleStartup: true, isProjectile: false, isGrab: false },
      { version: 'MAX', attackTypeKey: 'YURI_CHOU_UPPER', differences: 'EX, 3 hits', damageMultiplier: 1.5, knockdown: true, invincibleStartup: true, isProjectile: false, isGrab: false },
    ],
  },

  // Specials — Hyaku Retsu Binta (QCF+K)
  {
    key: 'hyaku_retsu_binta',
    nameJa: '百裂びんた',
    nameEn: 'Hyaku Retsu Binta',
    category: 'special',
    input: '↓↘→+B or D',
    versions: [
      { version: 'B', attackTypeKey: 'YURI_HYAKU_RETSU_BINTA', differences: 'Weak, multi-hit slap', damageMultiplier: 0.9, knockdown: false, invincibleStartup: false, isProjectile: false, isGrab: false },
      { version: 'D', attackTypeKey: 'YURI_HYAKU_RETSU_BINTA', differences: 'Strong, more hits', damageMultiplier: 1.1, knockdown: true, invincibleStartup: false, isProjectile: false, isGrab: false },
      { version: 'MAX', attackTypeKey: 'YURI_HYAKU_RETSU_BINTA', differences: 'EX version', damageMultiplier: 1.4, knockdown: true, invincibleStartup: false, isProjectile: false, isGrab: false },
    ],
  },

  // Specials — Hien Hou'ou Kyaku (QCB+K)
  {
    key: 'hien_hou_ou_kyaku',
    nameJa: '飛燕鳳凰脚',
    nameEn: 'Hien Hou\'ou Kyaku',
    category: 'special',
    input: '↓↙←+B or D',
    versions: [
      { version: 'B', attackTypeKey: 'YURI_HIEN_HOU_OU_KYAKU', differences: 'Weak, shorter range', damageMultiplier: 1.0, knockdown: true, invincibleStartup: false, isProjectile: false, isGrab: false },
      { version: 'D', attackTypeKey: 'YURI_HIEN_HOU_OU_KYAKU', differences: 'Strong, full range', damageMultiplier: 1.2, knockdown: true, invincibleStartup: false, isProjectile: false, isGrab: false },
      { version: 'MAX', attackTypeKey: 'YURI_HIEN_HOU_OU_KYAKU', differences: 'EX version, more damage', damageMultiplier: 1.5, knockdown: true, invincibleStartup: true, isProjectile: false, isGrab: false },
    ],
  },

  // Specials — Hishou Kuuretsu Zan (Air QCB+K)
  {
    key: 'hishou_kuuretsu_zan',
    nameJa: '飛翔空裂斬',
    nameEn: 'Hishou Kuuretsu Zan',
    category: 'special',
    input: '空中↓↙←+B or D',
    versions: [
      { version: 'B', attackTypeKey: 'YURI_HISHOU_KUURETSU_ZAN', differences: 'Weak, air dive', damageMultiplier: 0.9, knockdown: true, invincibleStartup: false, isProjectile: false, isGrab: false },
      { version: 'D', attackTypeKey: 'YURI_HISHOU_KUURETSU_ZAN', differences: 'Strong, deeper dive', damageMultiplier: 1.1, knockdown: true, invincibleStartup: false, isProjectile: false, isGrab: false },
    ],
  },

  // DM — Haoh Sho Ko Ken
  {
    key: 'dm_haoh_sho_ko_ken',
    nameJa: '覇王翔吼拳',
    nameEn: 'DM Haoh Sho Ko Ken',
    category: 'dm',
    input: '↓↘→↓↘→+A or C',
    versions: [
      { version: 'A', attackTypeKey: 'DM_YURI_HAOH_SHO_KO_KEN', differences: 'DM weak', damageMultiplier: 2.0, knockdown: true, invincibleStartup: true, isProjectile: true, isGrab: false },
      { version: 'C', attackTypeKey: 'DM_YURI_HAOH_SHO_KO_KEN', differences: 'DM strong', damageMultiplier: 2.2, knockdown: true, invincibleStartup: true, isProjectile: true, isGrab: false },
    ],
  },

  // DM — Hien Hou'ou Kyaku
  {
    key: 'dm_hien_hou_ou_kyaku',
    nameJa: '飛燕鳳凰脚',
    nameEn: 'DM Hien Hou\'ou Kyaku',
    category: 'dm',
    input: '↓↘→↘↓↙←+B or D',
    versions: [
      { version: 'B', attackTypeKey: 'DM_YURI_HIEN_HOU_OU_KYAKU', differences: 'DM weak', damageMultiplier: 2.0, knockdown: true, invincibleStartup: true, isProjectile: false, isGrab: false },
      { version: 'D', attackTypeKey: 'DM_YURI_HIEN_HOU_OU_KYAKU', differences: 'DM strong', damageMultiplier: 2.2, knockdown: true, invincibleStartup: true, isProjectile: false, isGrab: false },
    ],
  },

  // SDM
  {
    key: 'sdm_haoh_sho_ko_ken',
    nameJa: '覇王翔吼拳',
    nameEn: 'SDM Haoh Sho Ko Ken',
    category: 'sdm',
    input: '↓↘→↓↘→+A+C',
    versions: [
      { version: 'MAX', attackTypeKey: 'SDM_YURI_HAOH_SHO_KO_KEN', differences: 'SDM version', damageMultiplier: 2.8, knockdown: true, invincibleStartup: true, isProjectile: true, isGrab: false },
    ],
  },
  {
    key: 'sdm_hien_hou_ou_kyaku',
    nameJa: '飛燕鳳凰脚',
    nameEn: 'SDM Hien Hou\'ou Kyaku',
    category: 'sdm',
    input: '↓↘→↘↓↙←+B+D',
    versions: [
      { version: 'MAX', attackTypeKey: 'SDM_YURI_HIEN_HOU_OU_KYAKU', differences: 'SDM version', damageMultiplier: 2.8, knockdown: true, invincibleStartup: true, isProjectile: false, isGrab: false },
    ],
  },

  // HSDM
  {
    key: 'hsdm_hishou_kuuretsu_zan',
    nameJa: '飛翔空裂斬',
    nameEn: 'HSDM Hishou Kuuretsu Zan',
    category: 'hsdm',
    input: '↓↘→↓↘→+B+D',
    versions: [
      { version: 'MAX', attackTypeKey: 'HSDM_YURI_HISHOU_KUURETSU_ZAN', differences: 'HSDM version', damageMultiplier: 3.5, knockdown: true, invincibleStartup: true, isProjectile: false, isGrab: false },
    ],
  },
];

// Query functions
export function getMoveByKey(key: string): MoveDefinition | undefined {
  return YURI_MOVES.find(m => m.key === key);
}

export function getMoveByAttackType(attackTypeKey: string): MoveDefinition | undefined {
  return YURI_MOVES.find(m => m.versions.some(v => v.attackTypeKey === attackTypeKey));
}

export function getMovesByCategory(category: MoveDefinition['category']): MoveDefinition[] {
  return YURI_MOVES.filter(m => m.category === category);
}

export function getProjectileMoves(): MoveDefinition[] {
  return YURI_MOVES.filter(m => m.versions.some(v => v.isProjectile));
}

export function getInvincibleMoves(): MoveDefinition[] {
  return YURI_MOVES.filter(m => m.versions.some(v => v.invincibleStartup));
}

export function getMoveStats(): { total: number; specials: number; dms: number; sdms: number; hsdms: number } {
  return {
    total: YURI_MOVES.length,
    specials: YURI_MOVES.filter(m => m.category === 'special').length,
    dms: YURI_MOVES.filter(m => m.category === 'dm').length,
    sdms: YURI_MOVES.filter(m => m.category === 'sdm').length,
    hsdms: YURI_MOVES.filter(m => m.category === 'hsdm').length,
  };
}
