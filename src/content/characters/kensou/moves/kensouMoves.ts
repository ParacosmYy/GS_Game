/**
 * Kensou Content Package — Move Definitions
 *
 * 归属: content/characters/kensou/moves/ — 只放"技能是什么"。
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

export const KENSOU_MOVES: MoveDefinition[] = [
  { key: 'KENSOU_BAKYAKU', nameJa: '後旋腿', nameEn: 'Bakyaku', category: 'command_normal', input: '→ + B', versions: [{ version: 'B', attackTypeKey: 'KENSOU_BAKYAKU', differences: '中段踢', damageMultiplier: 1, knockdown: false, invincibleStartup: 0, isProjectile: false }] },
  { key: 'KENSOU_KAKUHI', nameJa: '龍顎', nameEn: 'Kakuhi', category: 'command_normal', input: '↘ + D', versions: [{ version: 'D', attackTypeKey: 'KENSOU_KAKUHI', differences: '下段滑踢', damageMultiplier: 1, knockdown: false, invincibleStartup: 0, isProjectile: false }] },
  {
    key: 'KENSOU_CHOU_KYUU_DAN',
    nameJa: '超球弾',
    nameEn: 'Chou Kyuu Dan',
    category: 'special',
    input: '↓↘→ + A / C',
    versions: [
      { version: 'A', attackTypeKey: 'KENSOU_CHOU_KYUU_DAN', differences: '弱版超能力弹', damageMultiplier: 1, knockdown: false, invincibleStartup: 0, isProjectile: true },
      { version: 'C', attackTypeKey: 'KENSOU_CHOU_KYUU_DAN_C', differences: '强版超能力弹', damageMultiplier: 1.15, knockdown: false, invincibleStartup: 0, isProjectile: true },
    ],
  },
  {
    key: 'KENSOU_RYURENGA',
    nameJa: '龍連牙',
    nameEn: 'Ryurenga',
    category: 'special',
    input: '↓↙← + A / C',
    versions: [
      { version: 'A', attackTypeKey: 'KENSOU_RYURENGA_TEN', differences: '弱版突进连击', damageMultiplier: 1, knockdown: false, invincibleStartup: 0, isProjectile: false },
      { version: 'C', attackTypeKey: 'KENSOU_RYURENGA_CHI', differences: '强版突进连击', damageMultiplier: 1.2, knockdown: true, invincibleStartup: 0, isProjectile: false },
    ],
  },
  { key: 'KENSOU_RYUSOU_GEKI', nameJa: '龍爪撃', nameEn: 'Ryusou Geki', category: 'special', input: '←↙↓↘→ + A / C', versions: [{ version: 'A', attackTypeKey: 'KENSOU_RYUSOU_GEKI', differences: '近身抓取/突进技', damageMultiplier: 1.25, knockdown: true, invincibleStartup: 0, isProjectile: false }] },
  { key: 'DM_SHIN_CHOU_KYUU_DAN', nameJa: '神龍超球弾', nameEn: 'Shin Chou Kyuu Dan', category: 'dm', input: '↓↘→↓↘→ + A / C', versions: [{ version: 'A', attackTypeKey: 'DM_SHIN_CHOU_KYUU_DAN', differences: 'DM 超能力弹', damageMultiplier: 1, knockdown: true, invincibleStartup: 4, isProjectile: true }] },
  { key: 'SDM_SHIN_CHOU_KYUU_DAN', nameJa: '神龍超球弾 MAX', nameEn: 'Shin Chou Kyuu Dan SDM', category: 'sdm', input: 'MAX ↓↘→↓↘→ + AC', versions: [{ version: 'MAX', attackTypeKey: 'SDM_SHIN_CHOU_KYUU_DAN', differences: 'MAX 超能力弹', damageMultiplier: 1.4, knockdown: true, invincibleStartup: 6, isProjectile: true }] },
];

export function getMoveByKey(key: string): MoveDefinition | undefined {
  return KENSOU_MOVES.find(move => move.key === key);
}

export function getMoveByAttackType(attackTypeKey: string): MoveDefinition | undefined {
  return KENSOU_MOVES.find(move => move.versions.some(version => version.attackTypeKey === attackTypeKey));
}

export function getMovesByCategory(category: MoveDefinition['category']): MoveDefinition[] {
  return KENSOU_MOVES.filter(move => move.category === category);
}

export function getProjectileMoves(): MoveDefinition[] {
  return KENSOU_MOVES.filter(move => move.versions.some(version => version.isProjectile));
}

export function getInvincibleMoves(): MoveDefinition[] {
  return KENSOU_MOVES.filter(move => move.versions.some(version => version.invincibleStartup > 0));
}

export function getMoveStats(attackTypeKey: string): MoveVersionEntry | undefined {
  for (const move of KENSOU_MOVES) {
    const version = move.versions.find(entry => entry.attackTypeKey === attackTypeKey);
    if (version) return version;
  }
  return undefined;
}
