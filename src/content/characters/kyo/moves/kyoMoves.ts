/**
 * Kyo Content Package — Move / Skill Definitions (真实数据)
 *
 * 必杀技版本差异（A/C），MAX强化版属性，取消消耗。
 * 这不是渲染数据，是"技能是什么"的结构化定义。
 *
 * 归属: content/characters/kyo/moves/ — 只放"技能是什么"
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

// ===== Kyo 必杀技定义 =====

export const KYO_MOVES: MoveDefinition[] = [
  // ── 命令通常技 ──
  {
    key: 'CMD_GOFU_YOU',
    nameJa: '外式·轟斧陽',
    nameEn: 'Gofu You (Overhead Axe)',
    category: 'command_normal',
    input: '→ + B',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'CMD_GOFU_YOU',
        differences: '中段攻击，对手必须站防',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'CMD_88SHIKI',
    nameJa: '八拾八式',
    nameEn: '88 Shiki (Low Sweep)',
    category: 'command_normal',
    input: '↘ + D',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'CMD_88SHIKI',
        differences: '下段2Hit攻击，对手必须蹲防',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'CMD_NARAKU',
    nameJa: '外式·奈落落とし',
    nameEn: 'Naraku Otoshi (Air Slam)',
    category: 'command_normal',
    input: '空中 ↓ + C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'CMD_NARAKU',
        differences: '空中命令技，击倒效果',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },

  // ── 必杀技 ──

  {
    key: 'KYO_YAMIBARAI',
    nameJa: '闇払い',
    nameEn: 'Yamibarai (Dark Sweep)',
    category: 'special',
    input: '↓↘→ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'KYO_YAMIBARAI',
        differences: '弱版，飞行道具，速度较慢',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: true,
      },
      {
        version: 'C',
        attackTypeKey: 'KYO_YAMIBARAI_C',
        differences: '强版，飞行道具，速度更快，飞得更远',
        damageMultiplier: 1.3,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: true,
      },
    ],
  },
  {
    key: 'KYO_ONIYAKI',
    nameJa: '鬼焼き',
    nameEn: 'Oniyaki (Demon Burner)',
    category: 'special',
    input: '→↓↘ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'KYO_ONIYAKI',
        differences: '弱版，单段上升，startup快',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 1,
        isProjectile: false,
      },
      {
        version: 'C',
        attackTypeKey: 'KYO_ONIYAKI_C',
        differences: '强版，多段上升，无敌帧更多，伤害更高',
        damageMultiplier: 1.5,
        knockdown: true,
        invincibleStartup: 3,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'KYO_75KAI',
    nameJa: '75式·改',
    nameEn: '75 Shiki Kai (Two-Kick)',
    category: 'special',
    input: '↓↘→ + K, K',
    versions: [
      {
        version: 'D',
        attackTypeKey: 'KYO_75KAI',
        differences: '第一段踢击，命中后可接第二段',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'KYO_RED_KICK',
    nameJa: 'R.E.D. KICK',
    nameEn: 'R.E.D. Kick (Reverse Edge Drop)',
    category: 'special',
    input: '←↓↙ + K',
    versions: [
      {
        version: 'D',
        attackTypeKey: 'KYO_RED_KICK',
        differences: '高段回旋踢，击倒效果',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },

  // ── 荒咬み Rekka Chain ──

  {
    key: 'KYO_ARAGAMI',
    nameJa: '114式·荒咬み',
    nameEn: '114 Shiki Aragami (Wild Bite)',
    category: 'special',
    input: '↓↘→ + A',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'KYO_ARAGAMI',
        differences: '荒咬み起手，命中后可派生九傷/八錆',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'KYO_ARAGAMI_KONOKIZU',
    nameJa: '128式·九傷',
    nameEn: '128 Shiki Kono Kizu (Nine Wounds)',
    category: 'special',
    input: '荒咬み中 ↓↘→ + P',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'KYO_ARAGAMI_KONOKIZU',
        differences: '荒咬み派生，命中后可接七瀬/琴月陽',
        damageMultiplier: 0.8,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'KYO_ARAGAMI_YANOSABI',
    nameJa: '127式·八錆',
    nameEn: '127 Shiki Yano Sabi (Eight Rust)',
    category: 'special',
    input: '荒咬み中 ←↙↓ + P',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'KYO_ARAGAMI_YANOSABI',
        differences: '荒咬み派生，命中后可接琴月陽/破砕',
        damageMultiplier: 0.8,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'KYO_NANASE',
    nameJa: '七瀬',
    nameEn: 'Nanase (Seven Rapids)',
    category: 'special',
    input: '九傷中 ↓↘→ + K',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'KYO_NANASE',
        differences: '九傷派生踢击',
        damageMultiplier: 0.7,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'KYO_KOTO_TSUKI',
    nameJa: '琴月陽',
    nameEn: 'Gekio (Moon Palm)',
    category: 'special',
    input: '九傷/八錆中 → + P',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'KYO_KOTO_TSUKI',
        differences: '掌击派生，击倒效果',
        damageMultiplier: 0.7,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'KYO_YAKISOGI',
    nameJa: '破砕',
    nameEn: 'Yaki Sogi (Crushing)',
    category: 'special',
    input: '八錆中 P',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'KYO_YAKISOGI',
        differences: '八錆派生打击',
        damageMultiplier: 0.7,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },

  // ── 毒咬み Rekka Chain ──

  {
    key: 'KYO_DOKUGAMI',
    nameJa: '115式·毒咬み',
    nameEn: '115 Shiki Dokugami (Poison Bite)',
    category: 'special',
    input: '↓↘→ + C',
    versions: [
      {
        version: 'C',
        attackTypeKey: 'KYO_DOKUGAMI',
        differences: '毒咬み起手，命中后可派生罪詠み',
        damageMultiplier: 1.2,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'KYO_TSUMIYOMI',
    nameJa: '401式·罪詠み',
    nameEn: '401 Shiki Tsumiyomi (Sin Reading)',
    category: 'special',
    input: '毒咬み中 ←↙↓ + P',
    versions: [
      {
        version: 'C',
        attackTypeKey: 'KYO_TSUMIYOMI',
        differences: '毒咬み派生，命中后可接罰詠み',
        damageMultiplier: 0.8,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'KYO_BATSUYOMI',
    nameJa: '402式·罰詠み',
    nameEn: '402 Shiki Batsuyomi (Punishment Reading)',
    category: 'special',
    input: '罪詠み中 → + P',
    versions: [
      {
        version: 'C',
        attackTypeKey: 'KYO_BATSUYOMI',
        differences: '毒咬み最终派生，击倒效果',
        damageMultiplier: 0.8,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },

  // ── DM (超必杀技) ──

  {
    key: 'DM_OROCHINAGI',
    nameJa: '大蛇薙',
    nameEn: 'Orochinagi (Quelling Serpent)',
    category: 'dm',
    input: '↓↙←↙↓↘→ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'DM_OROCHINAGI',
        differences: '大蛇薙 DM，巨大火焰爆发，消耗1条stock',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 5,
        isProjectile: false,
      },
    ],
  },

  // ── SDM (MAX超必杀技) ──

  {
    key: 'SDM_OROCHINAGI',
    nameJa: '大蛇薙 (MAX)',
    nameEn: 'Orochinagi MAX',
    category: 'sdm',
    input: '↓↙←↙↓↘→ + AC',
    versions: [
      {
        version: 'MAX',
        attackTypeKey: 'SDM_OROCHINAGI',
        differences: '强化版，伤害更高，攻击帧更长，火焰特效更强',
        damageMultiplier: 1.6,
        knockdown: true,
        invincibleStartup: 8,
        isProjectile: false,
      },
    ],
  },

  // ── HSDM (隐藏超必杀技) ──

  {
    key: 'HSDM_OROCHINAGI',
    nameJa: '大蛇薙 (HSDM)',
    nameEn: 'Orochinagi HSDM',
    category: 'hsdm',
    input: '↓↙←↙↓↘→ + AC (MAX+低血量)',
    versions: [
      {
        version: 'MAX',
        attackTypeKey: 'HSDM_OROCHINAGI',
        differences: '隐藏超必，血量1/4以下时可用，超大范围火焰爆发',
        damageMultiplier: 2.2,
        knockdown: true,
        invincibleStartup: 12,
        isProjectile: false,
      },
    ],
  },
];

// ===== 查询 API =====

/** 按 key 获取招式定义 */
export function getMoveByKey(key: string): MoveDefinition | undefined {
  return KYO_MOVES.find(m => m.key === key);
}

/** 按 AttackType 获取招式定义和版本 */
export function getMoveByAttackType(atkType: string): { move: MoveDefinition; version: MoveVersionEntry } | undefined {
  for (const move of KYO_MOVES) {
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
  return KYO_MOVES.filter(m => m.category === category);
}

/** 获取所有飞行道具类招式 */
export function getProjectileMoves(): MoveDefinition[] {
  return KYO_MOVES.filter(m => m.versions.some(v => v.isProjectile));
}

/** 获取所有有无敌帧的招式 */
export function getInvincibleMoves(): { move: MoveDefinition; version: MoveVersionEntry }[] {
  const result: { move: MoveDefinition; version: MoveVersionEntry }[] = [];
  for (const move of KYO_MOVES) {
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
  for (const move of KYO_MOVES) {
    byCategory[move.category] = (byCategory[move.category] ?? 0) + 1;
    versions += move.versions.length;
  }
  return { total: KYO_MOVES.length, byCategory, versions };
}
