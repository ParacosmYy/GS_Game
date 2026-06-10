/**
 * Takuma Content Package — Move Definitions
 *
 * 归属: content/characters/takuma/moves/ — 只放"技能是什么"。
 */

export type MoveVersion = 'A' | 'B' | 'C' | 'D' | 'MAX';

export interface MoveVersionEntry {
  version: MoveVersion;
  attackTypeKey: string;
  differences: string;
  damageMultiplier: number;
  knockdown: boolean;
  invincibleStartup: number;
  isProjectile: boolean;
}

export interface MoveDefinition {
  key: string;
  nameJa: string;
  nameEn: string;
  category: 'command_normal' | 'special' | 'dm' | 'sdm';
  input: string;
  versions: MoveVersionEntry[];
}

export const TAKUMA_MOVES: MoveDefinition[] = [
  {
    key: 'TAKUMA_FUU_GA',
    nameJa: '風牙',
    nameEn: 'Fuu Ga',
    category: 'command_normal',
    input: '→ + A',
    versions: [{ version: 'A', attackTypeKey: 'TAKUMA_FUU_GA', differences: '师范上段突进掌', damageMultiplier: 1, knockdown: false, invincibleStartup: 0, isProjectile: false }],
  },
  {
    key: 'TAKUMA_GOUSOU',
    nameJa: '豪操',
    nameEn: 'Gousou',
    category: 'command_normal',
    input: '→ + B',
    versions: [{ version: 'B', attackTypeKey: 'TAKUMA_GOUSOU', differences: '中段压制踢', damageMultiplier: 1, knockdown: false, invincibleStartup: 0, isProjectile: false }],
  },
  {
    key: 'TAKUMA_KO_OU_KEN',
    nameJa: '虎煌拳',
    nameEn: 'Ko Ou Ken',
    category: 'special',
    input: '↓↘→ + A / C',
    versions: [
      { version: 'A', attackTypeKey: 'TAKUMA_KO_OU_KEN', differences: '弱版气功波', damageMultiplier: 1, knockdown: false, invincibleStartup: 0, isProjectile: true },
      { version: 'C', attackTypeKey: 'TAKUMA_KO_OU_KEN_C', differences: '强版气功波', damageMultiplier: 1.15, knockdown: false, invincibleStartup: 0, isProjectile: true },
    ],
  },
  {
    key: 'TAKUMA_HAOH_SHOU_KOU_KEN',
    nameJa: '覇王翔吼拳',
    nameEn: 'Haoh Shou Kou Ken',
    category: 'special',
    input: '→←↙↓↘→ + A / C',
    versions: [{ version: 'C', attackTypeKey: 'TAKUMA_HAOH_SHOU_KOU_KEN', differences: '大型气功波', damageMultiplier: 1.35, knockdown: true, invincibleStartup: 0, isProjectile: true }],
  },
  {
    key: 'TAKUMA_HIEN_SHIPPUU',
    nameJa: '飛燕疾風脚',
    nameEn: 'Hien Shippuu Kyaku',
    category: 'special',
    input: '↓↙← + B / D',
    versions: [{ version: 'D', attackTypeKey: 'TAKUMA_HIEN_SHIPPUU', differences: '飞燕踢突进', damageMultiplier: 1.2, knockdown: true, invincibleStartup: 0, isProjectile: false }],
  },
  {
    key: 'DM_RYUKO_RANBU_TAKUMA',
    nameJa: '龍虎乱舞',
    nameEn: 'Ryuko Ranbu',
    category: 'dm',
    input: '↓↘→↘↓↙← + A / C',
    versions: [{ version: 'A', attackTypeKey: 'DM_RYUKO_RANBU_TAKUMA', differences: 'DM 连续乱舞', damageMultiplier: 1, knockdown: true, invincibleStartup: 4, isProjectile: false }],
  },
  {
    key: 'SDM_RYUKO_RANBU_TAKUMA',
    nameJa: '龍虎乱舞 MAX',
    nameEn: 'Ryuko Ranbu SDM',
    category: 'sdm',
    input: 'MAX ↓↘→↘↓↙← + AC',
    versions: [{ version: 'MAX', attackTypeKey: 'SDM_RYUKO_RANBU_TAKUMA', differences: 'MAX 乱舞', damageMultiplier: 1.4, knockdown: true, invincibleStartup: 6, isProjectile: false }],
  },
];

export function getMoveByKey(key: string): MoveDefinition | undefined {
  return TAKUMA_MOVES.find(move => move.key === key);
}

export function getMoveByAttackType(attackTypeKey: string): MoveDefinition | undefined {
  return TAKUMA_MOVES.find(move => move.versions.some(version => version.attackTypeKey === attackTypeKey));
}

export function getMovesByCategory(category: MoveDefinition['category']): MoveDefinition[] {
  return TAKUMA_MOVES.filter(move => move.category === category);
}

export function getProjectileMoves(): MoveDefinition[] {
  return TAKUMA_MOVES.filter(move => move.versions.some(version => version.isProjectile));
}

export function getInvincibleMoves(): MoveDefinition[] {
  return TAKUMA_MOVES.filter(move => move.versions.some(version => version.invincibleStartup > 0));
}

export function getMoveStats(attackTypeKey: string): MoveVersionEntry | undefined {
  for (const move of TAKUMA_MOVES) {
    const version = move.versions.find(entry => entry.attackTypeKey === attackTypeKey);
    if (version) return version;
  }
  return undefined;
}
