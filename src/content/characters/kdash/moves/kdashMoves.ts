/**
 * K' Content Package — Move / Skill Definitions (真实数据)
 *
 * 必杀技版本差异（A/C），MAX强化版属性，取消消耗。
 * 这不是渲染数据，是"技能是什么"的结构化定义。
 *
 * 归属: content/characters/kdash/moves/ — 只放"技能是什么"
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

// ===== K' 必杀技定义 =====

export const KDASH_MOVES: MoveDefinition[] = [
  // ── 命令通常技 ──
  {
    key: 'KDASH_ONE_INCH',
    nameJa: 'ワンインチ',
    nameEn: 'One Inch',
    category: 'command_normal',
    input: '→ + A',
    versions: [{
      version: 'A',
      attackTypeKey: 'KDASH_ONE_INCH',
      differences: '上段打击，近距离爆发力强',
      damageMultiplier: 1.0,
      knockdown: false,
      invincibleStartup: 0,
      isProjectile: false,
      isGrab: false,
    }],
  },
  {
    key: 'KDASH_TRIGGER',
    nameJa: 'トリガーショット',
    nameEn: 'Trigger Shot',
    category: 'command_normal',
    input: '↘ + D',
    versions: [{
      version: 'D',
      attackTypeKey: 'KDASH_TRIGGER',
      differences: '下段踢，对手必须蹲防',
      damageMultiplier: 1.0,
      knockdown: false,
      invincibleStartup: 0,
      isProjectile: false,
      isGrab: false,
    }],
  },
  // ── 必杀技 ──
  {
    key: 'KDASH_EINS',
    nameJa: 'アインストリガー',
    nameEn: 'Eins Trigger',
    category: 'special',
    input: '↓↘→ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'KDASH_EINS',
        differences: '弱版，速度12帧，火焰飞行道具',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: true,
        isGrab: false,
      },
      {
        version: 'C',
        attackTypeKey: 'KDASH_EINS_C',
        differences: '強版，速度10帧，伤害高，击倒，弹速快',
        damageMultiplier: 1.33,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: true,
        isGrab: false,
      },
    ],
  },
  {
    key: 'KDASH_CROW',
    nameJa: 'クロウバイツ',
    nameEn: 'Crow Bites',
    category: 'special',
    input: '→↓↘ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'KDASH_CROW',
        differences: '弱版，速度5帧，对空上勾拳',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: false,
      },
      {
        version: 'C',
        attackTypeKey: 'KDASH_CROW_C',
        differences: '強版，速度4帧，伤害高，击倒，有无敌启动',
        damageMultiplier: 1.29,
        knockdown: true,
        invincibleStartup: 4,
        isProjectile: false,
        isGrab: false,
      },
    ],
  },
  {
    key: 'KDASH_MINUTE',
    nameJa: 'ミニッツスパイク',
    nameEn: 'Minute Spike',
    category: 'special',
    input: '↓↙← + K',
    versions: [
      {
        version: 'B',
        attackTypeKey: 'KDASH_MINUTE',
        differences: '空中踢击overhead，速度8帧',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: false,
      },
    ],
  },
  {
    key: 'KDASH_NARROW',
    nameJa: 'ナロウスパイク',
    nameEn: 'Narrow Spike',
    category: 'special',
    input: '↓↘→ + K',
    versions: [
      {
        version: 'B',
        attackTypeKey: 'KDASH_NARROW',
        differences: '低段突进踢，速度10帧',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: false,
      },
    ],
  },
  // ── 超必杀技 (DM) ──
  {
    key: 'DM_CHAIN_SHOT',
    nameJa: 'チェーンショット',
    nameEn: 'Chain Shot (DM)',
    category: 'dm',
    input: '↓↘→↓↘→ + P',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'DM_CHAIN_SHOT',
        differences: 'DM版连续打击，伤害200，无敌启动',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 6,
        isProjectile: false,
        isGrab: false,
      },
    ],
  },
  // ── MAX超必杀技 (SDM) ──
  {
    key: 'SDM_CHAIN_SHOT',
    nameJa: 'チェーンショット',
    nameEn: 'Chain Shot (SDM)',
    category: 'sdm',
    input: 'MAX ↓↘→↓↘→ + AC',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'SDM_CHAIN_SHOT',
      differences: '强化连续打击，伤害300，无敌启动更长',
      damageMultiplier: 1.5,
      knockdown: true,
      invincibleStartup: 8,
      isProjectile: false,
      isGrab: false,
    }],
  },
];

// ===== Query API =====

export function getMoveByKey(key: string): MoveDefinition | undefined {
  return KDASH_MOVES.find(m => m.key === key);
}

export function getMoveByAttackType(attackTypeKey: string): MoveDefinition | undefined {
  return KDASH_MOVES.find(m =>
    m.versions.some(v => v.attackTypeKey === attackTypeKey)
  );
}

export function getMovesByCategory(category: MoveDefinition['category']): MoveDefinition[] {
  return KDASH_MOVES.filter(m => m.category === category);
}

export function getProjectileMoves(): MoveDefinition[] {
  return KDASH_MOVES.filter(m => m.versions.some(v => v.isProjectile));
}

export function getInvincibleMoves(): MoveDefinition[] {
  return KDASH_MOVES.filter(m => m.versions.some(v => v.invincibleStartup > 0));
}

export function getGrabMoves(): MoveDefinition[] {
  return KDASH_MOVES.filter(m => m.versions.some(v => v.isGrab));
}

export function getMoveStats(attackTypeKey: string): MoveVersionEntry | undefined {
  for (const move of KDASH_MOVES) {
    const v = move.versions.find(v => v.attackTypeKey === attackTypeKey);
    if (v) return v;
  }
  return undefined;
}
