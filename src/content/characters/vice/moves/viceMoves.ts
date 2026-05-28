/**
 * Vice Content Package — Move / Skill Definitions (真实数据)
 *
 * 必杀技版本差异（A/C/D/B），MAX强化版属性，取消消耗。
 * 这不是渲染数据，是"技能是什么"的结构化定义。
 *
 * 归属: content/characters/vice/moves/ — 只放"技能是什么"
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

// ===== Vice 必杀技定义 =====

export const VICE_MOVES: MoveDefinition[] = [
  // ── 命令通常技 ──
  {
    key: 'VICE_MONSTROSITY',
    nameJa: 'モンストロシティ',
    nameEn: 'Monstrosity',
    category: 'command_normal',
    input: '→ + A',
    versions: [{
      version: 'A',
      attackTypeKey: 'VICE_MONSTROSITY',
      differences: '上体打击,可取消到必杀技',
      damageMultiplier: 1.0,
      knockdown: false,
      invincibleStartup: 0,
      isProjectile: false,
      isGrab: false,
    }],
  },
  {
    key: 'VICE_OVERKILL',
    nameJa: 'オーバーキル',
    nameEn: 'Overkill',
    category: 'command_normal',
    input: '→ + B',
    versions: [{
      version: 'B',
      attackTypeKey: 'VICE_OVERKILL',
      differences: '下段打击,对手必须蹲防',
      damageMultiplier: 1.0,
      knockdown: false,
      invincibleStartup: 0,
      isProjectile: false,
      isGrab: false,
    }],
  },
  // ── 必杀技 ──
  {
    key: 'VICE_OUTRAGE',
    nameJa: 'アウトレイジ',
    nameEn: 'Outrage',
    category: 'special',
    input: '↓↘→ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'VICE_OUTRAGE',
        differences: '弱版,速度快10帧,近距离突进拳',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: false,
      },
      {
        version: 'C',
        attackTypeKey: 'VICE_OUTRAGE_C',
        differences: '強版,速度慢14帧,高伤害,击倒',
        damageMultiplier: 1.42,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: false,
      },
    ],
  },
  {
    key: 'VICE_BLACK_END',
    nameJa: 'ブラックエンド',
    nameEn: 'Black End',
    category: 'special',
    input: '↓↙← + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'VICE_BLACK_END',
        differences: '投技摔投,6帧启动,不可防御',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: true,
      },
      {
        version: 'C',
        attackTypeKey: 'VICE_BLACK_END',
        differences: 'C版同A版,投技摔投',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: true,
      },
    ],
  },
  {
    key: 'VICE_MAYHEM',
    nameJa: 'メイヘム',
    nameEn: 'Mayhem',
    category: 'special',
    input: '←↙↓↘→ + B / D',
    versions: [
      {
        version: 'B',
        attackTypeKey: 'VICE_MAYHEM',
        differences: '弱版,下段突进,9帧启动',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: false,
      },
      {
        version: 'D',
        attackTypeKey: 'VICE_MAYHEM',
        differences: '強版,伤害更高,距离更长',
        damageMultiplier: 1.25,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: false,
      },
    ],
  },
  {
    key: 'VICE_GORE_FEST',
    nameJa: 'ゴアフェスト',
    nameEn: 'Gore Fest',
    category: 'special',
    input: '→↘↓↙←→ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'VICE_GORE_FEST',
        differences: '指令投,5帧启动,不可防御,高伤害',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: true,
      },
      {
        version: 'C',
        attackTypeKey: 'VICE_GORE_FEST',
        differences: 'C版同A版,指令投',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: true,
      },
    ],
  },
  // ── 超必杀技 (DM) ──
  {
    key: 'DM_WITHERING_SURFACE',
    nameJa: 'ウィザリングサーフェス',
    nameEn: 'Withering Surface (DM)',
    category: 'dm',
    input: '↓↘→↓↘→ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'DM_WITHERING_SURFACE',
        differences: 'A版,多段突进冲击,伤害180',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 4,
        isProjectile: false,
        isGrab: false,
      },
      {
        version: 'C',
        attackTypeKey: 'DM_WITHERING_SURFACE',
        differences: 'C版,多段突进冲击,伤害180',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 4,
        isProjectile: false,
        isGrab: false,
      },
    ],
  },
  {
    key: 'DM_NEGATIVE_GAIN',
    nameJa: 'ネガティブゲイン',
    nameEn: 'Negative Gain (DM)',
    category: 'dm',
    input: '→↘↓↙←→↘↓↙← + B / D',
    versions: [
      {
        version: 'B',
        attackTypeKey: 'DM_NEGATIVE_GAIN',
        differences: 'B版,指令投DM,不可防御,伤害200',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 2,
        isProjectile: false,
        isGrab: true,
      },
      {
        version: 'D',
        attackTypeKey: 'DM_NEGATIVE_GAIN',
        differences: 'D版,指令投DM,不可防御,伤害200',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 2,
        isProjectile: false,
        isGrab: true,
      },
    ],
  },
  // ── MAX超必杀技 (SDM) ──
  {
    key: 'SDM_WITHERING_SURFACE',
    nameJa: 'ウィザリングサーフェスSDM',
    nameEn: 'Withering Surface (SDM)',
    category: 'sdm',
    input: 'MAX ↓↘→↓↘→ + AC',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'SDM_WITHERING_SURFACE',
      differences: '强化版多段冲击,伤害280',
      damageMultiplier: 1.56,
      knockdown: true,
      invincibleStartup: 6,
      isProjectile: false,
      isGrab: false,
    }],
  },
  {
    key: 'SDM_NEGATIVE_GAIN',
    nameJa: 'ネガティブゲインSDM',
    nameEn: 'Negative Gain (SDM)',
    category: 'sdm',
    input: 'MAX →↘↓↙←→↘↓↙← + BD',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'SDM_NEGATIVE_GAIN',
      differences: '强化版指令投,伤害320,不可防御',
      damageMultiplier: 1.6,
      knockdown: true,
      invincibleStartup: 4,
      isProjectile: false,
      isGrab: true,
    }],
  },
];

// ===== Query API =====

export function getMoveByKey(key: string): MoveDefinition | undefined {
  return VICE_MOVES.find(m => m.key === key);
}

export function getMoveByAttackType(attackTypeKey: string): MoveDefinition | undefined {
  return VICE_MOVES.find(m =>
    m.versions.some(v => v.attackTypeKey === attackTypeKey)
  );
}

export function getMovesByCategory(category: MoveDefinition['category']): MoveDefinition[] {
  return VICE_MOVES.filter(m => m.category === category);
}

export function getProjectileMoves(): MoveDefinition[] {
  return VICE_MOVES.filter(m => m.versions.some(v => v.isProjectile));
}

export function getInvincibleMoves(): MoveDefinition[] {
  return VICE_MOVES.filter(m => m.versions.some(v => v.invincibleStartup > 0));
}

export function getGrabMoves(): MoveDefinition[] {
  return VICE_MOVES.filter(m => m.versions.some(v => v.isGrab));
}

export function getMoveStats(attackTypeKey: string): MoveVersionEntry | undefined {
  for (const move of VICE_MOVES) {
    const v = move.versions.find(v => v.attackTypeKey === attackTypeKey);
    if (v) return v;
  }
  return undefined;
}
