/**
 * Mai Content Package — Move / Skill Definitions (真实数据)
 *
 * 必杀技版本差异（A/C/D/B），MAX强化版属性，取消消耗。
 * 这不是渲染数据，是"技能是什么"的结构化定义。
 *
 * 归属: content/characters/mai/moves/ — 只放"技能是什么"
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

// ===== Mai 必杀技定义 =====

export const MAI_MOVES: MoveDefinition[] = [
  // ── 命令通常技 ──
  {
    key: 'MAI_HISSATSU_SHINOBIBACHI',
    nameJa: '必殺忍蜂',
    nameEn: 'Hissatsu Shinobibachi',
    category: 'command_normal',
    input: '→ + B',
    versions: [{
      version: 'B',
      attackTypeKey: 'MAI_HISSATSU_SHINOBIBACHI',
      differences: '上段打击，对手必须站防',
      damageMultiplier: 1.0,
      knockdown: false,
      invincibleStartup: 0,
      isProjectile: false,
      isGrab: false,
    }],
  },
  {
    key: 'MAI_YUSURA_UMA',
    nameJa: '夕櫻舞',
    nameEn: 'Yusura Uma',
    category: 'command_normal',
    input: '↘ + B',
    versions: [{
      version: 'B',
      attackTypeKey: 'MAI_YUSURA_UMA',
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
    key: 'MAI_KA_CHO_SEN',
    nameJa: '花蝶扇',
    nameEn: 'Kachousen',
    category: 'special',
    input: '↓↘→ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'MAI_KA_CHO_SEN',
        differences: '弱版，速度12帧，扇形飞行道具',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: true,
        isGrab: false,
      },
      {
        version: 'C',
        attackTypeKey: 'MAI_KA_CHO_SEN_C',
        differences: '強版，速度16帧，伤害高，飞行道具更强',
        damageMultiplier: 1.29,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: true,
        isGrab: false,
      },
    ],
  },
  {
    key: 'MAI_RYU_EN_BU',
    nameJa: '龍炎舞',
    nameEn: 'Ryuuenbu',
    category: 'special',
    input: '↓↙← + K',
    versions: [
      {
        version: 'B',
        attackTypeKey: 'MAI_RYU_EN_BU',
        differences: '火焰扇击，多段攻击',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: false,
      },
    ],
  },
  {
    key: 'MAI_HISHO_RYU_EN_JIN',
    nameJa: '飛翔龍炎陣',
    nameEn: 'Hishou Ryuenjin',
    category: 'special',
    input: '→↓↘ + K',
    versions: [
      {
        version: 'B',
        attackTypeKey: 'MAI_HISHO_RYU_EN_JIN',
        differences: '火焰升龙，速度6帧，无敌对空',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 4,
        isProjectile: false,
        isGrab: false,
      },
    ],
  },
  // ── 超必杀技 (DM) ──
  {
    key: 'DM_HAKA_OTOSHI',
    nameJa: '蜂巢落とし',
    nameEn: 'Haka Otoshi (DM)',
    category: 'dm',
    input: '↓↘→↓↘→ + K',
    versions: [
      {
        version: 'B',
        attackTypeKey: 'DM_HAKA_OTOSHI',
        differences: 'DM版超必杀扇舞，伤害200',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 5,
        isProjectile: false,
        isGrab: false,
      },
    ],
  },
  // ── MAX超必杀技 (SDM) ──
  {
    key: 'SDM_HAKA_OTOSHI',
    nameJa: '蜂巢落とし',
    nameEn: 'Haka Otoshi (SDM)',
    category: 'sdm',
    input: 'MAX ↓↘→↓↘→ + BD',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'SDM_HAKA_OTOSHI',
      differences: '强化超必杀扇舞，伤害310',
      damageMultiplier: 1.55,
      knockdown: true,
      invincibleStartup: 8,
      isProjectile: false,
      isGrab: false,
    }],
  },
];

// ===== Query API =====

export function getMoveByKey(key: string): MoveDefinition | undefined {
  return MAI_MOVES.find(m => m.key === key);
}

export function getMoveByAttackType(attackTypeKey: string): MoveDefinition | undefined {
  return MAI_MOVES.find(m =>
    m.versions.some(v => v.attackTypeKey === attackTypeKey)
  );
}

export function getMovesByCategory(category: MoveDefinition['category']): MoveDefinition[] {
  return MAI_MOVES.filter(m => m.category === category);
}

export function getProjectileMoves(): MoveDefinition[] {
  return MAI_MOVES.filter(m => m.versions.some(v => v.isProjectile));
}

export function getInvincibleMoves(): MoveDefinition[] {
  return MAI_MOVES.filter(m => m.versions.some(v => v.invincibleStartup > 0));
}

export function getGrabMoves(): MoveDefinition[] {
  return MAI_MOVES.filter(m => m.versions.some(v => v.isGrab));
}

export function getMoveStats(attackTypeKey: string): MoveVersionEntry | undefined {
  for (const move of MAI_MOVES) {
    const v = move.versions.find(v => v.attackTypeKey === attackTypeKey);
    if (v) return v;
  }
  return undefined;
}
