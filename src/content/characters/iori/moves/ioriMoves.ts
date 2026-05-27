/**
 * Iori Content Package — Move / Skill Definitions (真实数据)
 *
 * 必杀技版本差异（A/C），MAX强化版属性，取消消耗。
 * 这不是渲染数据，是"技能是什么"的结构化定义。
 *
 * 归属: content/characters/iori/moves/ — 只放"技能是什么"
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
  category: 'command_normal' | 'special' | 'dm' | 'sdm';
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

// ===== Iori 必杀技定义 =====

export const IORI_MOVES: MoveDefinition[] = [
  // ── 命令通常技 ──
  {
    key: 'IORI_YUMEYUMI',
    nameJa: '夢弾',
    nameEn: 'Yume Yumi (Dream Bullet)',
    category: 'command_normal',
    input: '→ + A',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'IORI_YUMEYUMI',
        differences: '2段overhead攻击，对手必须站防',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'IORI_KATANUGI',
    nameJa: '邯鄲',
    nameEn: 'Katanugi (Low Slash)',
    category: 'command_normal',
    input: '↘ + B',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'IORI_KATANUGI',
        differences: '下段攻击，对手必须蹲防',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'IORI_YUKIWARUI',
    nameJa: '百合折り',
    nameEn: 'Yukiwarui (Lily Breaker)',
    category: 'command_normal',
    input: '空中 ↓ + C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'IORI_YUKIWARUI',
        differences: '空中命令技，crossup攻击',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },

  // ── 必杀技 ──

  {
    key: 'IORI_YAMIBARAI',
    nameJa: '闇払い',
    nameEn: 'Yamibarai (Dark Sweep)',
    category: 'special',
    input: '↓↘→ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'IORI_YAMIBARAI',
        differences: '弱版，紫色飞行道具，速度较慢',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: true,
      },
      {
        version: 'C',
        attackTypeKey: 'IORI_YAMIBARAI_C',
        differences: '强版，紫色飞行道具，速度更快，伤害更高',
        damageMultiplier: 1.3,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: true,
      },
    ],
  },
  {
    key: 'IORI_ONIYAKI',
    nameJa: '鬼焼き',
    nameEn: 'Oniyaki (Demon Burner)',
    category: 'special',
    input: '→↓↘ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'IORI_ONIYAKI',
        differences: '弱版，单段上升，startup快',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 1,
        isProjectile: false,
      },
      {
        version: 'C',
        attackTypeKey: 'IORI_ONIYAKI_C',
        differences: '强版，多段上升，无敌帧更多，伤害更高',
        damageMultiplier: 1.5,
        knockdown: true,
        invincibleStartup: 3,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'IORI_KOTOTSUKI',
    nameJa: '琴月陰',
    nameEn: 'Kototsuki In (Moon Shadow)',
    category: 'special',
    input: '←↙↓↘→ + B / D',
    versions: [
      {
        version: 'D',
        attackTypeKey: 'IORI_KOTOTSUKI',
        differences: '突进攻击，短距离冲刺HKD',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'IORI_KUZUKAZE',
    nameJa: '屑風',
    nameEn: 'Kuzukaze (Scrap Wind)',
    category: 'special',
    input: '←↙↓↘→↗↓↙← + P',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'IORI_KUZUKAZE',
        differences: '指令投，抓取对手换边，不可防御',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },

  // ── 葵花 Rekka Chain ──

  {
    key: 'IORI_AOIHANA',
    nameJa: '葵花',
    nameEn: 'Aoihana (Holly Flower)',
    category: 'special',
    input: '↓↙← + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'IORI_AOIHANA',
        differences: '葵花起手，命中后可接第二段',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'IORI_AOIHANA_2',
    nameJa: '葵花 追撃 弐',
    nameEn: 'Aoihana 2nd (Follow-up)',
    category: 'special',
    input: '葵花中 ↓↙← + P',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'IORI_AOIHANA_2',
        differences: '葵花第二段，下段追击',
        damageMultiplier: 0.8,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'IORI_AOIHANA_3',
    nameJa: '葵花 追撃 参',
    nameEn: 'Aoihana 3rd (Final)',
    category: 'special',
    input: '葵花弐中 ↓↙← + P',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'IORI_AOIHANA_3',
        differences: '葵花最终段，overhead击倒',
        damageMultiplier: 0.9,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },

  // ── DM (超必杀技) ──

  {
    key: 'DM_YAOTOME',
    nameJa: '八稚女',
    nameEn: 'Yaotome (Eight Maidens)',
    category: 'dm',
    input: '↓↙←↙↓↘→ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'DM_YAOTOME',
        differences: '八稚女 DM，狂暴连斩，消耗1条stock',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 5,
        isProjectile: false,
      },
    ],
  },

  // ── SDM (MAX超必杀技) ──

  {
    key: 'SDM_YAOTOME',
    nameJa: '八稚女 (MAX)',
    nameEn: 'Yaotome MAX',
    category: 'sdm',
    input: '↓↙←↙↓↘→ + AC',
    versions: [
      {
        version: 'MAX',
        attackTypeKey: 'SDM_YAOTOME',
        differences: '强化版，伤害更高，攻击帧更长，最终段紫焰爆发',
        damageMultiplier: 1.6,
        knockdown: true,
        invincibleStartup: 8,
        isProjectile: false,
      },
    ],
  },
];

// ===== 查询 API =====

/** 按 key 获取招式定义 */
export function getMoveByKey(key: string): MoveDefinition | undefined {
  return IORI_MOVES.find(m => m.key === key);
}

/** 按 AttackType 获取招式定义和版本 */
export function getMoveByAttackType(atkType: string): { move: MoveDefinition; version: MoveVersionEntry } | undefined {
  for (const move of IORI_MOVES) {
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
  return IORI_MOVES.filter(m => m.category === category);
}

/** 获取所有飞行道具类招式 */
export function getProjectileMoves(): MoveDefinition[] {
  return IORI_MOVES.filter(m => m.versions.some(v => v.isProjectile));
}

/** 获取所有有无敌帧的招式 */
export function getInvincibleMoves(): { move: MoveDefinition; version: MoveVersionEntry }[] {
  const result: { move: MoveDefinition; version: MoveVersionEntry }[] = [];
  for (const move of IORI_MOVES) {
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
  for (const move of IORI_MOVES) {
    byCategory[move.category] = (byCategory[move.category] ?? 0) + 1;
    versions += move.versions.length;
  }
  return { total: IORI_MOVES.length, byCategory, versions };
}
