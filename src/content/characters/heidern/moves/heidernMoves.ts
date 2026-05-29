/**
 * Heidern Content Package — Move / Skill Definitions (真实数据)
 *
 * 必杀技版本差异（A/C/D/B），MAX强化版属性，取消消耗。
 * Heidern's moveset includes charge inputs (Cross Cutter, Moon Slasher),
 * command grabs (Stormbringer, Killing Bringer), and projectile/slash attacks.
 *
 * 归属: content/characters/heidern/moves/ — 只放"技能是什么"
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
  isGrab: boolean;
}

// ===== Heidern 必杀技定义 =====

export const HEIDERN_MOVES: MoveDefinition[] = [
  // ── 命令通常技 ──
  {
    key: 'HEIDERN_SLIDING',
    nameJa: 'スライディング',
    nameEn: 'Sliding',
    category: 'command_normal',
    input: '↘ + B',
    versions: [{
      version: 'B',
      attackTypeKey: 'HEIDERN_SLIDING',
      differences: '下段スライディング攻撃，对手必须蹲防',
      damageMultiplier: 1.0,
      knockdown: false,
      invincibleStartup: 0,
      isProjectile: false,
      isGrab: false,
    }],
  },
  {
    key: 'HEIDERN_COMMAND_A',
    nameJa: '→+A',
    nameEn: 'Command A',
    category: 'command_normal',
    input: '→ + A',
    versions: [{
      version: 'A',
      attackTypeKey: 'HEIDERN_COMMAND_A',
      differences: '上段打撃，取消可能',
      damageMultiplier: 1.0,
      knockdown: false,
      invincibleStartup: 0,
      isProjectile: false,
      isGrab: false,
    }],
  },
  // ── 必杀技 ──
  {
    key: 'HEIDERN_CROSS_CUTTER',
    nameJa: 'クロスカッター',
    nameEn: 'Cross Cutter',
    category: 'special',
    input: '←蓄→ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'HEIDERN_CROSS_CUTTER',
        differences: '弱版，飞行道具速度中，单发斩击波',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: true,
        isGrab: false,
      },
      {
        version: 'C',
        attackTypeKey: 'HEIDERN_CROSS_CUTTER_C',
        differences: '強版，伤害高，飞行道具速度更快',
        damageMultiplier: 1.4,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: true,
        isGrab: false,
      },
    ],
  },
  {
    key: 'HEIDERN_MOON_SLASHER',
    nameJa: 'ムーンスラッシャー',
    nameEn: 'Moon Slasher',
    category: 'special',
    input: '↓蓄↑ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'HEIDERN_MOON_SLASHER',
        differences: '弱版，対空斩击，上升短，单段',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 1,
        isProjectile: false,
        isGrab: false,
      },
      {
        version: 'C',
        attackTypeKey: 'HEIDERN_MOON_SLASHER_C',
        differences: '強版，多段斩击，上升高，伤害1.3倍',
        damageMultiplier: 1.3,
        knockdown: true,
        invincibleStartup: 2,
        isProjectile: false,
        isGrab: false,
      },
    ],
  },
  {
    key: 'HEIDERN_NECK_ROLLER',
    nameJa: 'ネックローリング',
    nameEn: 'Neck Roller',
    category: 'special',
    input: '↓↙← + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'HEIDERN_NECK_ROLLER',
        differences: '弱版，首绞り投げ，近距离抓取',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: true,
      },
      {
        version: 'C',
        attackTypeKey: 'HEIDERN_NECK_ROLLER_C',
        differences: '強版，首绞り投げ，距离稍远，伤害高',
        damageMultiplier: 1.3,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: true,
      },
    ],
  },
  {
    key: 'HEIDERN_STORMBRINGER',
    nameJa: 'ストームブリンガー',
    nameEn: 'Stormbringer',
    category: 'special',
    input: '←↙↓↘→ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'HEIDERN_STORMBRINGER',
        differences: '弱版コマンド投げ，近距离抓取+连打',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: true,
      },
      {
        version: 'C',
        attackTypeKey: 'HEIDERN_STORMBRINGER_C',
        differences: '強版コマンド投げ，伤害高，连打段数增加',
        damageMultiplier: 1.5,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: true,
      },
    ],
  },
  {
    key: 'HEIDERN_KILLING_BRINGER',
    nameJa: 'キリングブリンガー',
    nameEn: 'Killing Bringer',
    category: 'special',
    input: '←↙↓↘→ + B / D',
    versions: [
      {
        version: 'B',
        attackTypeKey: 'HEIDERN_KILLING_BRINGER',
        differences: '弱版当て身投げ，打撃を取って投げ',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: true,
      },
      {
        version: 'D',
        attackTypeKey: 'HEIDERN_KILLING_BRINGER_D',
        differences: '強版当て身投げ，判定时间长',
        damageMultiplier: 1.2,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: true,
      },
    ],
  },
  {
    key: 'HEIDERN_LEIDEN_REITTER',
    nameJa: 'ライデンライター',
    nameEn: 'Leiden Reitter',
    category: 'special',
    input: '↓↙← + B / D',
    versions: [
      {
        version: 'B',
        attackTypeKey: 'HEIDERN_LEIDEN_REITTER',
        differences: '弱版，回転踢り突進',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: false,
      },
      {
        version: 'D',
        attackTypeKey: 'HEIDERN_LEIDEN_REITTER_D',
        differences: '強版，回転踢り突進，伤害高',
        damageMultiplier: 1.3,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: false,
      },
    ],
  },
  // ── 超必杀技 (DM) ──
  {
    key: 'DM_HEIDERN_CRITICAL_DRIVER',
    nameJa: 'クリティカルドライバー',
    nameEn: 'Critical Driver (DM)',
    category: 'dm',
    input: '←↙↓↘→↘↓↙← + A / C',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'DM_HEIDERN_CRITICAL_DRIVER',
      differences: 'DM版コマンド投げ，伤害200，连续首绞り→投げ',
      damageMultiplier: 1.0,
      knockdown: true,
      invincibleStartup: 4,
      isProjectile: false,
      isGrab: true,
    }],
  },
  {
    key: 'DM_HEIDERN_END',
    nameJa: 'ハイデルンエンド',
    nameEn: 'Heidern End (DM)',
    category: 'dm',
    input: '↓↘→↓↘→ + A / C',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'DM_HEIDERN_END',
      differences: 'DM版突進攻撃，伤害180，军刀连斩',
      damageMultiplier: 1.0,
      knockdown: true,
      invincibleStartup: 5,
      isProjectile: false,
      isGrab: false,
    }],
  },
  // ── MAX超必杀技 (SDM) ──
  {
    key: 'SDM_HEIDERN_CRITICAL_DRIVER',
    nameJa: 'クリティカルドライバーSDM',
    nameEn: 'Critical Driver (SDM)',
    category: 'sdm',
    input: 'MAX ←↙↓↘→↘↓↙← + AC',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'SDM_HEIDERN_CRITICAL_DRIVER',
      differences: 'SDM版コマンド投げ，伤害300，强化首绞り+地面叩きつけ',
      damageMultiplier: 1.5,
      knockdown: true,
      invincibleStartup: 6,
      isProjectile: false,
      isGrab: true,
    }],
  },
  {
    key: 'SDM_HEIDERN_END',
    nameJa: 'ハイデルンエンドSDM',
    nameEn: 'Heidern End (SDM)',
    category: 'sdm',
    input: 'MAX ↓↘→↓↘→ + AC',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'SDM_HEIDERN_END',
      differences: 'SDM版突進攻撃，伤害240，强化军刀连续斩击',
      damageMultiplier: 1.33,
      knockdown: true,
      invincibleStartup: 7,
      isProjectile: false,
      isGrab: false,
    }],
  },
  // ── Hidden SDM (HSDM) ──
  {
    key: 'HSDM_HEIDERN_EXECUTION',
    nameJa: 'ハイデルンエクスキュージョン',
    nameEn: 'Heidern Execution (HSDM)',
    category: 'hsdm',
    input: 'MAX ↓↙←↓↙← + BD',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'HSDM_HEIDERN_EXECUTION',
      differences: 'HSDM版，伤害350，当て身成功后执行致命连撃',
      damageMultiplier: 1.75,
      knockdown: true,
      invincibleStartup: 8,
      isProjectile: false,
      isGrab: true,
    }],
  },
];

// ===== Query API =====

export function getMoveByKey(key: string): MoveDefinition | undefined {
  return HEIDERN_MOVES.find(m => m.key === key);
}

export function getMoveByAttackType(attackTypeKey: string): MoveDefinition | undefined {
  return HEIDERN_MOVES.find(m =>
    m.versions.some(v => v.attackTypeKey === attackTypeKey)
  );
}

export function getMovesByCategory(category: MoveDefinition['category']): MoveDefinition[] {
  return HEIDERN_MOVES.filter(m => m.category === category);
}

export function getProjectileMoves(): MoveDefinition[] {
  return HEIDERN_MOVES.filter(m => m.versions.some(v => v.isProjectile));
}

export function getInvincibleMoves(): MoveDefinition[] {
  return HEIDERN_MOVES.filter(m => m.versions.some(v => v.invincibleStartup > 0));
}

export function getGrabMoves(): MoveDefinition[] {
  return HEIDERN_MOVES.filter(m => m.versions.some(v => v.isGrab));
}

export function getMoveStats(attackTypeKey: string): MoveVersionEntry | undefined {
  for (const move of HEIDERN_MOVES) {
    const v = move.versions.find(v => v.attackTypeKey === attackTypeKey);
    if (v) return v;
  }
  return undefined;
}
