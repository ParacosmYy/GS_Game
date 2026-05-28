/**
 * Yamazaki Content Package — Move / Skill Definitions (真实数据)
 *
 * 必杀技版本差异（A/C），MAX强化版属性，取消消耗。
 * 这不是渲染数据，是"技能是什么"的结构化定义。
 *
 * 归属: content/characters/yamazaki/moves/ — 只放"技能是什么"
 *
 * Ryuji Yamazaki (山崎竜二) — Orochi bloodline, one-handed fighter.
 * Unique mechanic: Snake Arm system with follow-ups, counter-based neutral.
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

// ===== Yamazaki 必杀技定义 =====

export const YAMAZAKI_MOVES: MoveDefinition[] = [
  // ── 命令通常技 ──
  {
    key: 'YAMAZAKI_SASHI',
    nameJa: '刺し',
    nameEn: 'Sashi',
    category: 'command_normal',
    input: '→ + A',
    versions: [{
      version: 'A',
      attackTypeKey: 'YAMAZAKI_SASHI',
      differences: '上段攻击，速度7帧，对手必须站防',
      damageMultiplier: 1.0,
      knockdown: false,
      invincibleStartup: 0,
      isProjectile: false,
    }],
  },
  {
    key: 'YAMAZAKI_BOKKAI',
    nameJa: '暴会',
    nameEn: 'Bokkai',
    category: 'command_normal',
    input: '↘ + B',
    versions: [{
      version: 'B',
      attackTypeKey: 'YAMAZAKI_BOKKAI',
      differences: '下段攻击，对手必须蹲防',
      damageMultiplier: 1.0,
      knockdown: false,
      invincibleStartup: 0,
      isProjectile: false,
    }],
  },
  // ── 必杀技 ──
  {
    key: 'YAMAZAKI_SNAKE_ARM',
    nameJa: '蛇使い・弐',
    nameEn: 'Snake Arm',
    category: 'special',
    input: '↓↘→ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'YAMAZAKI_SNAKE_ARM',
        differences: '弱版，速度10帧，蛇臂延伸距离短',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
      {
        version: 'C',
        attackTypeKey: 'YAMAZAKI_SNAKE_ARM_C',
        differences: '強版，速度14帧，蛇臂延伸更远，击倒',
        damageMultiplier: 1.38,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'YAMAZAKI_SANDSTORM',
    nameJa: '爆弾拳 / 蛇使い',
    nameEn: 'Sandstorm / Hebi Tsukai',
    category: 'special',
    input: '↓↙← + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'YAMAZAKI_SANDSTORM',
        differences: '爆弾拳，中段打击，击倒',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
      },
      {
        version: 'C',
        attackTypeKey: 'YAMAZAKI_SANDSTORM',
        differences: '蛇使い C版，爆发更强',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'YAMAZAKI_BAI_GA_SE',
    nameJa: '倍返し',
    nameEn: 'Bai Gaeshi',
    category: 'special',
    input: '↓↙← + B / D',
    versions: [
      {
        version: 'B',
        attackTypeKey: 'YAMAZAKI_BAI_GA_SE',
        differences: '弱版，下段扫腿反击，速度10帧',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
      },
      {
        version: 'D',
        attackTypeKey: 'YAMAZAKI_BAI_GA_SE',
        differences: '強版，更远距离，同样击倒',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },
  // ── 超必杀技 (DM) ──
  {
    key: 'DM_GUILLOTINE',
    nameJa: 'ギロチン',
    nameEn: 'Guillotine (DM)',
    category: 'dm',
    input: '↓↘→↓↘→ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'DM_GUILLOTINE',
        differences: 'A版，伤害210，断头台级重击',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 5,
        isProjectile: false,
      },
      {
        version: 'C',
        attackTypeKey: 'DM_GUILLOTINE',
        differences: 'C版，伤害210，同A版',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 5,
        isProjectile: false,
      },
      {
        version: 'MAX',
        attackTypeKey: 'DM_GUILLOTINE',
        differences: '默认版，伤害210',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 6,
        isProjectile: false,
      },
    ],
  },
  // ── MAX超必杀技 (SDM) ──
  {
    key: 'SDM_GUILLOTINE',
    nameJa: 'ギロチン SDM',
    nameEn: 'Guillotine (SDM)',
    category: 'sdm',
    input: 'MAX ↓↘→↓↘→ + AC',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'SDM_GUILLOTINE',
      differences: '强化版断头台，伤害320',
      damageMultiplier: 1.52,
      knockdown: true,
      invincibleStartup: 8,
      isProjectile: false,
    }],
  },
  // ── 隐藏超必杀技 (HSDM) ──
  {
    key: 'HSDM_DRILL',
    nameJa: 'ドリル',
    nameEn: 'Drill (HSDM)',
    category: 'hsdm',
    input: 'MAX+红血 →→→→+AC',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'HSDM_DRILL',
      differences: '终极ドリル,多段连续钻击,伤害350',
      damageMultiplier: 1.67,
      knockdown: true,
      invincibleStartup: 10,
      isProjectile: false,
    }],
  },
];

// ===== Query API =====

export function getMoveByKey(key: string): MoveDefinition | undefined {
  return YAMAZAKI_MOVES.find(m => m.key === key);
}

export function getMoveByAttackType(attackTypeKey: string): MoveDefinition | undefined {
  return YAMAZAKI_MOVES.find(m =>
    m.versions.some(v => v.attackTypeKey === attackTypeKey)
  );
}

export function getMovesByCategory(category: MoveDefinition['category']): MoveDefinition[] {
  return YAMAZAKI_MOVES.filter(m => m.category === category);
}

export function getProjectileMoves(): MoveDefinition[] {
  return YAMAZAKI_MOVES.filter(m => m.versions.some(v => v.isProjectile));
}

export function getInvincibleMoves(): MoveDefinition[] {
  return YAMAZAKI_MOVES.filter(m => m.versions.some(v => v.invincibleStartup > 0));
}

export function getMoveStats(attackTypeKey: string): MoveVersionEntry | undefined {
  for (const move of YAMAZAKI_MOVES) {
    const v = move.versions.find(v => v.attackTypeKey === attackTypeKey);
    if (v) return v;
  }
  return undefined;
}
