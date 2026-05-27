/**
 * Ryo Content Package — Move / Skill Definitions (真实数据)
 *
 * 必杀技版本差异（A/C），MAX强化版属性，取消消耗。
 * 这不是渲染数据，是"技能是什么"的结构化定义。
 *
 * 归属: content/characters/ryo/moves/ — 只放"技能是什么"
 */
import type { AttackType } from '../../../../core/types.js';

// ===== 版本差异系统 =====

export type MoveVersion = 'A' | 'C' | 'D' | 'MAX';

export interface MoveDefinition {
  /** 内部键名 (对应 AttackType) */
  key: string;
  /** 日文名 */
  nameJa: string;
  /** 英文名 */
  nameEn: string;
  /** 招式分类 */
  category: 'command_normal' | 'special' | 'dm' | 'sdm' | 'hsdm';
  /** 输入指令 */
  input: string;
  /** 版本列表（有的招式只有单一版本） */
  versions: MoveVersionEntry[];
}

export interface MoveVersionEntry {
  /** 版本标识 */
  version: MoveVersion;
  /** 对应 AttackType */
  attackTypeKey: string;
  /** 与A版的差异描述 */
  differences: string;
  /** 相对A版伤害倍率 */
  damageMultiplier: number;
  /** 击倒 */
  knockdown: boolean;
  /** 无敌帧数 (startup期间) */
  invincibleStartup: number;
  /** 弹幕属性 */
  isProjectile: boolean;
}

// ===== Ryo 必杀技定义 =====

export const RYO_MOVES: MoveDefinition[] = [
  // ── 命令通常技 ──
  {
    key: 'RYO_TSURIZAO',
    nameJa: '冰柱割り',
    nameEn: 'Tsurizarao (Ice Cutter)',
    category: 'command_normal',
    input: '→ + A',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'RYO_TSURIZAO',
        differences: '中段攻击，对手必须站防',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'RYO_ORISHI',
    nameJa: '落蹴',
    nameEn: 'Orishi (Falling Kick)',
    category: 'command_normal',
    input: '↘ + B',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'RYO_ORISHI',
        differences: '下段攻击，对手必须蹲防',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },

  // ── 必杀技 ──

  {
    key: 'RYO_KOOU',
    nameJa: '虎煌拳',
    nameEn: "Ko'ou Ken (Tiger Flame Punch)",
    category: 'special',
    input: '↓↘→ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'RYO_KOOU',
        differences: '弱版，飞行速度较慢，伤害较低',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: true,
      },
      {
        version: 'C',
        attackTypeKey: 'RYO_KOOU_C',
        differences: '强版，飞行速度更快，伤害更高，飞得更远',
        damageMultiplier: 1.3,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: true,
      },
    ],
  },
  {
    key: 'RYO_KO_HOU',
    nameJa: '虎咆',
    nameEn: 'Kohou (Tiger Roar)',
    category: 'special',
    input: '→↓↘ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'RYO_KO_HOU',
        differences: '弱版，单段上升，startup快',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 1,
        isProjectile: false,
      },
      {
        version: 'C',
        attackTypeKey: 'RYO_KO_HOU_C',
        differences: '强版，多段上升，无敌帧更多，伤害更高',
        damageMultiplier: 1.5,
        knockdown: true,
        invincibleStartup: 3,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'RYO_HIEN',
    nameJa: '飛燕疾風脚',
    nameEn: 'Hien Shippu Kyaku (Flying Swallow Kick)',
    category: 'special',
    input: '←↙↓ + K',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'RYO_HIEN',
        differences: '空中飞踢，命中后弹地',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'RYO_HAOU',
    nameJa: '霸王翔吼拳',
    nameEn: 'Haou Shoukou Ken (Supreme King Soaring Fist)',
    category: 'special',
    input: '↓↘→ + K',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'RYO_HAOU',
        differences: '大飞行道具，速度慢但判定大',
        damageMultiplier: 1.2,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: true,
      },
    ],
  },

  {
    key: 'RYO_KOOUKEN_D',
    nameJa: '虎煌拳D版',
    nameEn: "Ko'ou Ken D (Heavy Tiger Wave)",
    category: 'special',
    input: 'qcf + D (heavy projectile)',
    versions: [
      {
        version: 'D',
        attackTypeKey: 'RYO_KOOUKEN_D',
        differences: '重版飞行道具,高伤害,击倒效果,出手慢但威力大',
        damageMultiplier: 1.5,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: true,
      },
    ],
  },

  {
    key: 'RYO_HIO_HACKER',
    nameJa: '猛速突進拳',
    nameEn: 'Hio Hacker (Dash Strike)',
    category: 'special',
    input: 'f + A (dash strike)',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'RYO_HIO_HACKER',
        differences: '突进技,快速前冲打击',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'RYO_ZANRETSU_KEN',
    nameJa: '暢連拳',
    nameEn: 'Zanretsu Ken (Multi Punch)',
    category: 'special',
    input: 'qcb + P (rapid punch)',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'RYO_ZANRETSU_KEN',
        differences: '连打技,多段拳击(约6hit),单hit低伤害但总计高',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },  // ── DM (超必杀技) ──

  {
    key: 'DM_TEN_HA_OU',
    nameJa: '天地霸煌拳',
    nameEn: 'Tenha Haou Ken (Heaven & Earth Supreme Fist)',
    category: 'dm',
    input: '↓↘→↓↘→ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'DM_TEN_HA_OU',
        differences: '巨大能量爆发，消耗1条stock',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 5,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'DM_RYUKO_RANBU',
    nameJa: '龍虎乱舞',
    nameEn: 'Ryuko Ranbu (Dragon Tiger Dance)',
    category: 'dm',
    input: '↓↘→↘↓↙← + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'DM_RYUKO_RANBU',
        differences: '突进乱舞技，消耗1条stock',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 3,
        isProjectile: false,
      },
    ],
  },

  // ── SDM (MAX超必杀技) ──

  {
    key: 'SDM_TEN_HA_OU',
    nameJa: '天地霸煌拳 (MAX)',
    nameEn: 'Tenha Haou Ken MAX',
    category: 'sdm',
    input: '↓↘→↓↘→ + AC',
    versions: [
      {
        version: 'MAX',
        attackTypeKey: 'SDM_TEN_HA_OU',
        differences: '强化版，伤害更高，攻击帧更长，屏幕闪白更强',
        damageMultiplier: 1.6,
        knockdown: true,
        invincibleStartup: 8,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'SDM_RYUKO_RANBU',
    nameJa: '龍虎乱舞 (MAX)',
    nameEn: 'Ryuko Ranbu MAX',
    category: 'sdm',
    input: '↓↘→↘↓↙← + AC',
    versions: [
      {
        version: 'MAX',
        attackTypeKey: 'SDM_RYUKO_RANBU',
        differences: '强化乱舞，更多hit，最后一击击飞更远',
        damageMultiplier: 1.6,
        knockdown: true,
        invincibleStartup: 5,
        isProjectile: false,
      },
    ],
  },

  // ── HSDM (Hidden MAX超必杀技) ──

  {
    key: 'HSDM_RYUKO_RANBU',
    nameJa: '龍虎乱舞 (HSDM)',
    nameEn: 'Ryuko Ranbu HSDM',
    category: 'hsdm',
    input: '↓↘→↘↓↙← + AC (HP < 25%, MAX mode)',
    versions: [
      {
        version: 'MAX',
        attackTypeKey: 'HSDM_RYUKO_RANBU',
        differences: '隐藏MAX超必，条件：血量<25%且MAX mode中，威力最强',
        damageMultiplier: 2.2,
        knockdown: true,
        invincibleStartup: 10,
        isProjectile: false,
      },
    ],
  },
];

// ===== 查询 API =====

/** 按 key 获取招式定义 */
export function getMoveByKey(key: string): MoveDefinition | undefined {
  return RYO_MOVES.find(m => m.key === key);
}

/** 按 AttackType 获取招式定义和版本 */
export function getMoveByAttackType(atkType: string): { move: MoveDefinition; version: MoveVersionEntry } | undefined {
  for (const move of RYO_MOVES) {
    for (const ver of move.versions) {
      if (ver.attackTypeKey === atkType) {
        return { move, version: ver };
      }
    }
  }
  return undefined;
}

/** 获取指定分类的所有招式 */
export function getMovesByCategory(category: MoveDefinition['category']): MoveDefinition[] {
  return RYO_MOVES.filter(m => m.category === category);
}

/** 获取所有飞行道具类招式 */
export function getProjectileMoves(): MoveDefinition[] {
  return RYO_MOVES.filter(m => m.versions.some(v => v.isProjectile));
}

/** 获取所有有无敌帧的招式 */
export function getInvincibleMoves(): { move: MoveDefinition; version: MoveVersionEntry }[] {
  const result: { move: MoveDefinition; version: MoveVersionEntry }[] = [];
  for (const move of RYO_MOVES) {
    for (const ver of move.versions) {
      if (ver.invincibleStartup > 0) {
        result.push({ move, version: ver });
      }
    }
  }
  return result;
}

/** 招式总数统计 */
export function getMoveStats(): { total: number; byCategory: Record<string, number>; versions: number } {
  const byCategory: Record<string, number> = {};
  let versions = 0;
  for (const move of RYO_MOVES) {
    byCategory[move.category] = (byCategory[move.category] ?? 0) + 1;
    versions += move.versions.length;
  }
  return { total: RYO_MOVES.length, byCategory, versions };
}
