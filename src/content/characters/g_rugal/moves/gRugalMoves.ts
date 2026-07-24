/**
 * Omega Rugal Content Package - Move Definitions
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

export const G_RUGAL_MOVES: MoveDefinition[] = [
  { key: 'G_RUGAL_DARK_SMASH', nameJa: 'Dark Smash', nameEn: 'Dark Smash', category: 'command_normal', input: 'forward + A', versions: [{ version: 'A', attackTypeKey: 'G_RUGAL_DARK_SMASH', differences: 'Omega command normal', damageMultiplier: 1, knockdown: false, invincibleStartup: 0, isProjectile: false }] },
  { key: 'G_RUGAL_KAISER_WAVE', nameJa: 'Kaiser Wave', nameEn: 'Kaiser Wave', category: 'special', input: 'quarter-circle forward + A / C', versions: [
    { version: 'A', attackTypeKey: 'G_RUGAL_KAISER_WAVE', differences: 'MUGEN action 1100 projectile startup', damageMultiplier: 1.15, knockdown: false, invincibleStartup: 0, isProjectile: true },
    { version: 'C', attackTypeKey: 'G_RUGAL_KAISER_WAVE_C', differences: 'MUGEN action 1110 strong projectile startup', damageMultiplier: 1.25, knockdown: false, invincibleStartup: 0, isProjectile: true },
  ] },
  { key: 'G_RUGAL_REPPU_KEN', nameJa: 'Reppu Ken', nameEn: 'Reppu Ken', category: 'special', input: 'quarter-circle back + A / C', versions: [
    { version: 'A', attackTypeKey: 'G_RUGAL_REPPU_KEN', differences: 'MUGEN action 1200 slash wave', damageMultiplier: 1.1, knockdown: true, invincibleStartup: 0, isProjectile: true },
    { version: 'C', attackTypeKey: 'G_RUGAL_REPPU_KEN_C', differences: 'MUGEN action 1210 strong slash wave', damageMultiplier: 1.2, knockdown: true, invincibleStartup: 0, isProjectile: true },
  ] },
  { key: 'G_RUGAL_GENOCIDE_CUTTER', nameJa: 'Genocide Cutter', nameEn: 'Genocide Cutter', category: 'special', input: 'dragon-punch + B / D', versions: [
    { version: 'B', attackTypeKey: 'G_RUGAL_GENOCIDE_CUTTER', differences: 'MUGEN action 1400 anti-air kick', damageMultiplier: 1.25, knockdown: true, invincibleStartup: 3, isProjectile: false },
    { version: 'D', attackTypeKey: 'G_RUGAL_GENOCIDE_CUTTER_D', differences: 'MUGEN action 1410 strong anti-air kick', damageMultiplier: 1.35, knockdown: true, invincibleStartup: 4, isProjectile: false },
  ] },
  { key: 'G_RUGAL_DARK_BARRIER', nameJa: 'Dark Barrier', nameEn: 'Dark Barrier', category: 'special', input: 'quarter-circle forward + B / D', versions: [{ version: 'B', attackTypeKey: 'G_RUGAL_DARK_BARRIER', differences: 'MUGEN action 1700 barrier', damageMultiplier: 1.1, knockdown: false, invincibleStartup: 0, isProjectile: false }] },
  { key: 'DM_G_RUGAL_GIGANTIC_PRESSURE', nameJa: 'Gigantic Pressure', nameEn: 'Gigantic Pressure', category: 'dm', input: 'double quarter-circle forward + A / C', versions: [{ version: 'A', attackTypeKey: 'DM_G_RUGAL_GIGANTIC_PRESSURE', differences: 'MUGEN action 3000 boss rush DM', damageMultiplier: 1, knockdown: true, invincibleStartup: 5, isProjectile: false }] },
  { key: 'DM_G_RUGAL_DEAD_END_SCREAMER', nameJa: 'Dead End Screamer', nameEn: 'Dead End Screamer', category: 'dm', input: 'double half-circle forward + A / C', versions: [{ version: 'C', attackTypeKey: 'DM_G_RUGAL_DEAD_END_SCREAMER', differences: 'MUGEN action 3100 boss finisher DM', damageMultiplier: 1.1, knockdown: true, invincibleStartup: 5, isProjectile: false }] },
];

export function getMoveByKey(key: string): MoveDefinition | undefined {
  return G_RUGAL_MOVES.find(move => move.key === key);
}

export function getMoveByAttackType(attackTypeKey: string): MoveDefinition | undefined {
  return G_RUGAL_MOVES.find(move => move.versions.some(version => version.attackTypeKey === attackTypeKey));
}

export function getMovesByCategory(category: MoveDefinition['category']): MoveDefinition[] {
  return G_RUGAL_MOVES.filter(move => move.category === category);
}

export function getProjectileMoves(): MoveDefinition[] {
  return G_RUGAL_MOVES.filter(move => move.versions.some(version => version.isProjectile));
}

export function getInvincibleMoves(): MoveDefinition[] {
  return G_RUGAL_MOVES.filter(move => move.versions.some(version => version.invincibleStartup > 0));
}

export function getMoveStats(attackTypeKey: string): MoveVersionEntry | undefined {
  for (const move of G_RUGAL_MOVES) {
    const version = move.versions.find(entry => entry.attackTypeKey === attackTypeKey);
    if (version) return version;
  }
  return undefined;
}
