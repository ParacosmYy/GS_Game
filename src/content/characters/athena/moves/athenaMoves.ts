/**
 * Athena Content Package — Move / Skill Definitions (真实数据)
 *
 * 必杀技版本差异（A/C/B/D），MAX强化版属性，取消消耗。
 * 这不是渲染数据，是"技能是什么"的结构化定义。
 *
 * 归属: content/characters/athena/moves/ — 只放"技能是什么"
 */

// ===== 版本差异系统 =====

export type MoveVersion = 'A' | 'C' | 'D' | 'B' | 'MAX';

export interface MoveDefinition {
  key: string;
  nameJa: string;
  nameEn: string;
  category: 'command_normal' | 'special' | 'dm' | 'sdm' | 'hsdm';
  input: string;
  versions: MoveVersionEntry[];
}

export interface MoveVersionEntry {
  version: MoveVersion;
  attackTypeKey: string;
  differences: string;
  damageMultiplier: number;
  knockdown: boolean;
  invincibleStartup: number;
  isProjectile: boolean;
}

// ===== Athena 必杀技定义 =====

export const ATHENA_MOVES: MoveDefinition[] = [
  // ── 命令通常技 ──
  {
    key: 'ATHENA_PHOENIX_REFLECT',
    nameJa: 'サイコリフレクト',
    nameEn: 'Phoenix Reflect',
    category: 'command_normal',
    input: '→ + B',
    versions: [{
      version: 'B',
      attackTypeKey: 'ATHENA_PHOENIX_REFLECT',
      differences: '中段攻撃，对手必须站防',
      damageMultiplier: 1.0,
      knockdown: false,
      invincibleStartup: 0,
      isProjectile: false,
    }],
  },
  {
    key: 'ATHENA_LOW_B',
    nameJa: '↘+B',
    nameEn: 'Low B',
    category: 'command_normal',
    input: '↘ + B',
    versions: [{
      version: 'B',
      attackTypeKey: 'ATHENA_LOW_B',
      differences: '下段攻撃，对手必须蹲防',
      damageMultiplier: 1.0,
      knockdown: false,
      invincibleStartup: 0,
      isProjectile: false,
    }],
  },
  {
    key: 'ATHENA_AIR_B',
    nameJa: '空中↓+B',
    nameEn: 'Air Crossup B',
    category: 'command_normal',
    input: '空中 ↓ + B',
    versions: [{
      version: 'B',
      attackTypeKey: 'ATHENA_AIR_B',
      differences: '空中めくり攻撃，背后判定',
      damageMultiplier: 1.0,
      knockdown: false,
      invincibleStartup: 0,
      isProjectile: false,
    }],
  },
  // ── 必杀技 ──
  {
    key: 'ATHENA_PSYCHO_BALL',
    nameJa: 'サイコボール',
    nameEn: 'Psycho Ball',
    category: 'special',
    input: '↓↙← + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'ATHENA_PSYCHO_BALL',
        differences: '弱版，速度12帧，飞行距离中等',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: true,
      },
      {
        version: 'C',
        attackTypeKey: 'ATHENA_PSYCHO_BALL_C',
        differences: '強版，速度14帧，伤害高，飞行距离长',
        damageMultiplier: 1.43,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: true,
      },
    ],
  },
  {
    key: 'ATHENA_PSYCHO_SWORD',
    nameJa: 'サイコソード',
    nameEn: 'Psycho Sword',
    category: 'special',
    input: '→↓↘ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'ATHENA_PSYCHO_SWORD',
        differences: '弱版，速度5帧，上升短，单段',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 1,
        isProjectile: false,
      },
      {
        version: 'C',
        attackTypeKey: 'ATHENA_PSYCHO_SWORD_C',
        differences: '強版，速度5帧但多段，上升高，伤害1.13倍',
        damageMultiplier: 1.13,
        knockdown: true,
        invincibleStartup: 2,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'ATHENA_PHOENIX_ARROW',
    nameJa: 'フェニックスアロー',
    nameEn: 'Phoenix Arrow',
    category: 'special',
    input: '空中 ↓↘→ + B / D',
    versions: [{
      version: 'B',
      attackTypeKey: 'ATHENA_PHOENIX_ARROW',
      differences: '空中突進攻撃，多段判定，击倒',
      damageMultiplier: 1.0,
      knockdown: true,
      invincibleStartup: 0,
      isProjectile: false,
    }],
  },
  {
    key: 'ATHENA_PSYCHO_TELEPORT',
    nameJa: 'サイコテレポート',
    nameEn: 'Psycho Teleport',
    category: 'special',
    input: '↓↙← + B / D',
    versions: [
      {
        version: 'B',
        attackTypeKey: 'ATHENA_PSYCHO_TELEPORT',
        differences: '短距离瞬移，5帧启动',
        damageMultiplier: 0,
        knockdown: false,
        invincibleStartup: 3,
        isProjectile: false,
      },
      {
        version: 'D',
        attackTypeKey: 'ATHENA_PSYCHO_TELEPORT_C',
        differences: '長距離瞬移，8帧启动',
        damageMultiplier: 0,
        knockdown: false,
        invincibleStartup: 5,
        isProjectile: false,
      },
    ],
  },
  // ── 超必杀技 (DM) ──
  {
    key: 'DM_SHINING_CRYSTAL_BIT',
    nameJa: 'シャイニングクリスタルビット',
    nameEn: 'Shining Crystal Bit (DM)',
    category: 'dm',
    input: '↓↘→↓↘→ + A / C',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'DM_SHINING_CRYSTAL_BIT',
      differences: 'DM版，伤害200，周围サイコ能量爆发',
      damageMultiplier: 1.0,
      knockdown: true,
      invincibleStartup: 5,
      isProjectile: false,
    }],
  },
  {
    key: 'DM_PHOENIX_FANG_ARROW',
    nameJa: 'フェニックスファングアロー',
    nameEn: 'Phoenix Fang Arrow (DM)',
    category: 'dm',
    input: '空中 ↓↘→↓↘→ + A / C',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'DM_PHOENIX_FANG_ARROW',
      differences: '空中DM版，伤害180，空中连续箭攻击',
      damageMultiplier: 1.0,
      knockdown: true,
      invincibleStartup: 4,
      isProjectile: false,
    }],
  },
  // ── MAX超必杀技 (SDM) ──
  {
    key: 'SDM_SHINING_CRYSTAL_BIT',
    nameJa: 'シャイニングクリスタルビットSDM',
    nameEn: 'Shining Crystal Bit (SDM)',
    category: 'sdm',
    input: 'MAX ↓↘→↓↘→ + AC',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'SDM_SHINING_CRYSTAL_BIT',
      differences: 'SDM版，伤害300，强化サイコ能量爆发',
      damageMultiplier: 1.5,
      knockdown: true,
      invincibleStartup: 8,
      isProjectile: false,
    }],
  },
  {
    key: 'SDM_PHOENIX_FANG_ARROW',
    nameJa: 'フェニックスファングアローSDM',
    nameEn: 'Phoenix Fang Arrow (SDM)',
    category: 'sdm',
    input: 'MAX 空中 ↓↘→↓↘→ + AC',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'SDM_PHOENIX_FANG_ARROW',
      differences: 'SDM版，伤害240，强化空中連続箭攻击',
      damageMultiplier: 1.33,
      knockdown: true,
      invincibleStartup: 6,
      isProjectile: false,
    }],
  },
];

// ===== Query API =====

export function getMoveByKey(key: string): MoveDefinition | undefined {
  return ATHENA_MOVES.find(m => m.key === key);
}

export function getMoveByAttackType(attackTypeKey: string): MoveDefinition | undefined {
  return ATHENA_MOVES.find(m =>
    m.versions.some(v => v.attackTypeKey === attackTypeKey)
  );
}

export function getMovesByCategory(category: MoveDefinition['category']): MoveDefinition[] {
  return ATHENA_MOVES.filter(m => m.category === category);
}

export function getProjectileMoves(): MoveDefinition[] {
  return ATHENA_MOVES.filter(m => m.versions.some(v => v.isProjectile));
}

export function getInvincibleMoves(): MoveDefinition[] {
  return ATHENA_MOVES.filter(m => m.versions.some(v => v.invincibleStartup > 0));
}

export function getMoveStats(attackTypeKey: string): MoveVersionEntry | undefined {
  for (const move of ATHENA_MOVES) {
    const v = move.versions.find(v => v.attackTypeKey === attackTypeKey);
    if (v) return v;
  }
  return undefined;
}
