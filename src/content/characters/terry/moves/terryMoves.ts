/**
 * Terry Content Package — Move / Skill Definitions (真实数据)
 *
 * 必杀技版本差异（A/C/D/B），MAX强化版属性，取消消耗。
 * 这不是渲染数据，是"技能是什么"的结构化定义。
 *
 * 归属: content/characters/terry/moves/ — 只放"技能是什么"
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

// ===== Terry 必杀技定义 =====

export const TERRY_MOVES: MoveDefinition[] = [
  // ── 命令通常技 ──
  {
    key: 'TERRY_BACK_KNCKLE',
    nameJa: 'バックナックル',
    nameEn: 'Back Knuckle',
    category: 'command_normal',
    input: '→ + A',
    versions: [{
      version: 'A',
      attackTypeKey: 'TERRY_BACK_KNCKLE',
      differences: '中段攻击，对手必须站防',
      damageMultiplier: 1.0,
      knockdown: false,
      invincibleStartup: 0,
      isProjectile: false,
    }],
  },
  {
    key: 'TERRY_COMBO_BLOW',
    nameJa: 'コンビネーションブロー',
    nameEn: 'Combination Blow',
    category: 'command_normal',
    input: '↘ + B',
    versions: [{
      version: 'B',
      attackTypeKey: 'TERRY_COMBO_BLOW',
      differences: '下段攻击，对手必须蹲防',
      damageMultiplier: 1.0,
      knockdown: false,
      invincibleStartup: 0,
      isProjectile: false,
    }],
  },
  // ── 必杀技 ──
  {
    key: 'TERRY_POWER_WAVE',
    nameJa: 'パワーウェーブ',
    nameEn: 'Power Wave',
    category: 'special',
    input: '↓↘→ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'TERRY_POWER_WAVE',
        differences: '弱版，速度快，飞行距离短',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: true,
      },
      {
        version: 'C',
        attackTypeKey: 'TERRY_ROUND_WAVE',
        differences: '強版Round Wave，速度慢但伤害高，近距离地面冲击',
        damageMultiplier: 1.29,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: true,
      },
    ],
  },
  {
    key: 'TERRY_BURN_KNUCKLE',
    nameJa: 'バーンナックル',
    nameEn: 'Burn Knuckle',
    category: 'special',
    input: '↓↙← + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'TERRY_BURN_KNUCKLE',
        differences: '弱版，速度11帧，距离短',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
      {
        version: 'C',
        attackTypeKey: 'TERRY_BURN_KNUCKLE_C',
        differences: '強版，速度16帧，伤害高，距离长',
        damageMultiplier: 1.45,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
      {
        version: 'D',
        attackTypeKey: 'TERRY_BURN_KNUCKLE_D',
        differences: 'D版，速度18帧，最高伤害',
        damageMultiplier: 1.73,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'TERRY_CRACK_SHOT',
    nameJa: 'クラックシュート',
    nameEn: 'Crack Shot',
    category: 'special',
    input: '↓↙← + B / D',
    versions: [
      {
        version: 'B',
        attackTypeKey: 'TERRY_CRACK_SHOT',
        differences: '弱版，速度9帧',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
      {
        version: 'D',
        attackTypeKey: 'TERRY_CRACK_SHOT_D',
        differences: '強版，速度11帧，伤害高',
        damageMultiplier: 1.2,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'TERRY_POWER_DUNK',
    nameJa: 'パワーダンク',
    nameEn: 'Power Dunk',
    category: 'special',
    input: '→↓↘ + B / D',
    versions: [
      {
        version: 'B',
        attackTypeKey: 'TERRY_POWER_DUNK',
        differences: '弱版，速度8帧，浮空',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 2,
        isProjectile: false,
      },
      {
        version: 'D',
        attackTypeKey: 'TERRY_POWER_DUNK_D',
        differences: '強版，速度10帧，伤害高',
        damageMultiplier: 1.22,
        knockdown: true,
        invincibleStartup: 3,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'TERRY_RISING_TACKLE',
    nameJa: 'ライジングタックル',
    nameEn: 'Rising Tackle',
    category: 'special',
    input: '↓蓄↑ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'TERRY_RISING_TACKLE',
        differences: '弱版，速度6帧，上升多段',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 1,
        isProjectile: false,
      },
      {
        version: 'C',
        attackTypeKey: 'TERRY_RISING_TACKLE_C',
        differences: '強版，速度6帧但伤害1.44倍，上升更高',
        damageMultiplier: 1.44,
        knockdown: true,
        invincibleStartup: 2,
        isProjectile: false,
      },
    ],
  },
  // ── 超必杀技 (DM) ──
  {
    key: 'DM_POWER_GEYSER',
    nameJa: 'パワーゲイザー',
    nameEn: 'Power Geyser (DM)',
    category: 'dm',
    input: '↓↘→↓↘→ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'DM_POWER_GEYSER_A',
        differences: 'A版，伤害200',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 5,
        isProjectile: false,
      },
      {
        version: 'C',
        attackTypeKey: 'DM_POWER_GEYSER_C',
        differences: 'C版，伤害200，同A版',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 5,
        isProjectile: false,
      },
      {
        version: 'MAX',
        attackTypeKey: 'DM_POWER_GEYSER',
        differences: '默认版，伤害220',
        damageMultiplier: 1.1,
        knockdown: true,
        invincibleStartup: 6,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'DM_HIGH_ANGLE_GEYSER',
    nameJa: 'ハイアングルゲイザー',
    nameEn: 'High Angle Geyser (DM)',
    category: 'dm',
    input: '↓↘→↓↘→ + B / D',
    versions: [
      {
        version: 'B',
        attackTypeKey: 'DM_HIGH_ANGLE_GEYSER_B',
        differences: 'B版，伤害190',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 4,
        isProjectile: false,
      },
      {
        version: 'D',
        attackTypeKey: 'DM_HIGH_ANGLE_GEYSER_D',
        differences: 'D版，伤害190',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 4,
        isProjectile: false,
      },
      {
        version: 'MAX',
        attackTypeKey: 'DM_HIGH_ANGLE_GEYSER',
        differences: '默认版，伤害200',
        damageMultiplier: 1.05,
        knockdown: true,
        invincibleStartup: 5,
        isProjectile: false,
      },
    ],
  },
  // ── MAX超必杀技 (SDM) ──
  {
    key: 'SDM_TRIPLE_GEYSER',
    nameJa: 'トリプルゲイザー',
    nameEn: 'Triple Geyser (SDM)',
    category: 'sdm',
    input: 'MAX ↓↘→↓↘→ + AC',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'SDM_TRIPLE_GEYSER',
      differences: '三连喷泉，伤害340',
      damageMultiplier: 1.55,
      knockdown: true,
      invincibleStartup: 8,
      isProjectile: false,
    }],
  },
  // ── 隐藏超必杀技 (HSDM) ──
  {
    key: 'HSDM_POWER_GEYSER',
    nameJa: 'パワーゲイザーEX',
    nameEn: 'Power Geyser EX (HSDM)',
    category: 'hsdm',
    input: 'MAX+红血 ↓↘→↓↘→ + AC',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'HSDM_POWER_GEYSER',
      differences: '终极版喷泉，伤害300',
      damageMultiplier: 1.36,
      knockdown: true,
      invincibleStartup: 10,
      isProjectile: false,
    }],
  },
];

// ===== Query API =====

export function getMoveByKey(key: string): MoveDefinition | undefined {
  return TERRY_MOVES.find(m => m.key === key);
}

export function getMoveByAttackType(attackTypeKey: string): MoveDefinition | undefined {
  return TERRY_MOVES.find(m =>
    m.versions.some(v => v.attackTypeKey === attackTypeKey)
  );
}

export function getMovesByCategory(category: MoveDefinition['category']): MoveDefinition[] {
  return TERRY_MOVES.filter(m => m.category === category);
}

export function getProjectileMoves(): MoveDefinition[] {
  return TERRY_MOVES.filter(m => m.versions.some(v => v.isProjectile));
}

export function getInvincibleMoves(): MoveDefinition[] {
  return TERRY_MOVES.filter(m => m.versions.some(v => v.invincibleStartup > 0));
}

export function getMoveStats(attackTypeKey: string): MoveVersionEntry | undefined {
  for (const move of TERRY_MOVES) {
    const v = move.versions.find(v => v.attackTypeKey === attackTypeKey);
    if (v) return v;
  }
  return undefined;
}
