/**
 * Rugal Content Package — Move Definitions
 *
 * 归属: content/characters/rugal/moves/ — 只放"技能是什么"。
 */

export type MoveVersion = 'A' | 'B' | 'C' | 'D';

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
  category: 'command_normal' | 'special' | 'dm';
  input: string;
  versions: MoveVersionEntry[];
}

export const RUGAL_MOVES: MoveDefinition[] = [
  { key: 'RUGAL_DARK_SMASH', nameJa: 'ダークスマッシュ', nameEn: 'Dark Smash', category: 'command_normal', input: '→ + A', versions: [{ version: 'A', attackTypeKey: 'RUGAL_DARK_SMASH', differences: 'Boss command normal', damageMultiplier: 1, knockdown: false, invincibleStartup: 0, isProjectile: false }] },
  {
    key: 'RUGAL_KAISER_WAVE',
    nameJa: 'カイザーウェイブ',
    nameEn: 'Kaiser Wave',
    category: 'special',
    input: '↓↘→ + A / C',
    versions: [
      { version: 'A', attackTypeKey: 'RUGAL_KAISER_WAVE', differences: 'Weak projectile', damageMultiplier: 1, knockdown: false, invincibleStartup: 0, isProjectile: true },
      { version: 'C', attackTypeKey: 'RUGAL_KAISER_WAVE_C', differences: 'Strong projectile', damageMultiplier: 1.2, knockdown: false, invincibleStartup: 0, isProjectile: true },
    ],
  },
  {
    key: 'RUGAL_REPPU_KEN',
    nameJa: '烈風拳',
    nameEn: 'Reppu Ken',
    category: 'special',
    input: '↓↙← + A / C',
    versions: [
      { version: 'A', attackTypeKey: 'RUGAL_REPPU_KEN', differences: 'Weak slash wave', damageMultiplier: 1, knockdown: false, invincibleStartup: 0, isProjectile: true },
      { version: 'C', attackTypeKey: 'RUGAL_REPPU_KEN_C', differences: 'Strong slash wave', damageMultiplier: 1.2, knockdown: true, invincibleStartup: 0, isProjectile: true },
    ],
  },
  {
    key: 'RUGAL_GENOCIDE_CUTTER',
    nameJa: 'ジェノサイドカッター',
    nameEn: 'Genocide Cutter',
    category: 'special',
    input: '→↓↘ + B / D',
    versions: [
      { version: 'B', attackTypeKey: 'RUGAL_GENOCIDE_CUTTER', differences: 'Weak anti-air kick', damageMultiplier: 1, knockdown: true, invincibleStartup: 2, isProjectile: false },
      { version: 'D', attackTypeKey: 'RUGAL_GENOCIDE_CUTTER_D', differences: 'Strong anti-air kick', damageMultiplier: 1.25, knockdown: true, invincibleStartup: 3, isProjectile: false },
    ],
  },
  { key: 'RUGAL_DARK_BARRIER', nameJa: 'ダークバリア', nameEn: 'Dark Barrier', category: 'special', input: '↓↘→ + B / D', versions: [{ version: 'B', attackTypeKey: 'RUGAL_DARK_BARRIER', differences: 'Mid barrier kick', damageMultiplier: 1.1, knockdown: false, invincibleStartup: 0, isProjectile: false }] },
  { key: 'DM_RUGAL_GIGANTIC_PRESSURE', nameJa: 'ギガンテックプレッシャー', nameEn: 'Gigantic Pressure', category: 'dm', input: '↓↘→↓↘→ + A / C', versions: [{ version: 'A', attackTypeKey: 'DM_RUGAL_GIGANTIC_PRESSURE', differences: 'Boss rush DM', damageMultiplier: 1, knockdown: true, invincibleStartup: 5, isProjectile: false }] },
  { key: 'DM_RUGAL_DEAD_END_SCREAMER', nameJa: 'デッドエンドスクリーマー', nameEn: 'Dead End Screamer', category: 'dm', input: '←↙↓↘→←↙↓↘→ + A / C', versions: [{ version: 'C', attackTypeKey: 'DM_RUGAL_DEAD_END_SCREAMER', differences: 'Boss finisher DM', damageMultiplier: 1.1, knockdown: true, invincibleStartup: 5, isProjectile: false }] },
];

export function getMoveByKey(key: string): MoveDefinition | undefined {
  return RUGAL_MOVES.find(move => move.key === key);
}

export function getMoveByAttackType(attackTypeKey: string): MoveDefinition | undefined {
  return RUGAL_MOVES.find(move => move.versions.some(version => version.attackTypeKey === attackTypeKey));
}

export function getMovesByCategory(category: MoveDefinition['category']): MoveDefinition[] {
  return RUGAL_MOVES.filter(move => move.category === category);
}

export function getProjectileMoves(): MoveDefinition[] {
  return RUGAL_MOVES.filter(move => move.versions.some(version => version.isProjectile));
}

export function getInvincibleMoves(): MoveDefinition[] {
  return RUGAL_MOVES.filter(move => move.versions.some(version => version.invincibleStartup > 0));
}

export function getMoveStats(attackTypeKey: string): MoveVersionEntry | undefined {
  for (const move of RUGAL_MOVES) {
    const version = move.versions.find(entry => entry.attackTypeKey === attackTypeKey);
    if (version) return version;
  }
  return undefined;
}
