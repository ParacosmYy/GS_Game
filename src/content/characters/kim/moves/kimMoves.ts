/**
 * Kim Content Package — Move / Skill Definitions (真实数据)
 *
 * 必杀技版本差异（B/D），MAX强化版属性，取消消耗。
 * 这不是渲染数据，是"技能是什么"的结构化定义。
 *
 * 归属: content/characters/kim/moves/ — 只放"技能是什么"
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

// ===== Kim 必杀技定义 =====

export const KIM_MOVES: MoveDefinition[] = [
  // ── 命令通常技 ──
  {
    key: 'KIM_HISHOU',
    nameJa: '飛翔脚',
    nameEn: 'Hishou Kyaku (Air Dive)',
    category: 'command_normal',
    input: '空中 ↓↘→ + K',
    versions: [{
      version: 'B',
      attackTypeKey: 'KIM_HISHOU',
      differences: '空中斜下踢，命中后可连段',
      damageMultiplier: 1.0,
      knockdown: false,
      invincibleStartup: 0,
      isProjectile: false,
    }],
  },
  {
    key: 'KIM_HISHOU_KICK',
    nameJa: '飛翔踢',
    nameEn: 'Hishou Kick',
    category: 'command_normal',
    input: '→ + B',
    versions: [{
      version: 'B',
      attackTypeKey: 'KIM_HISHOU_KICK',
      differences: '中段，浮空对手可连段',
      damageMultiplier: 1.0,
      knockdown: false,
      invincibleStartup: 0,
      isProjectile: false,
    }],
  },
  {
    key: 'KIM_HANSEN',
    nameJa: '半旋蹴',
    nameEn: 'Hansen (Half Spin)',
    category: 'command_normal',
    input: '↘ + D',
    versions: [{
      version: 'D',
      attackTypeKey: 'KIM_HANSEN',
      differences: '2Hit中段攻击',
      damageMultiplier: 1.0,
      knockdown: false,
      invincibleStartup: 0,
      isProjectile: false,
    }],
  },
  // ── 必杀技 ──
  {
    key: 'KIM_HIENZAN',
    nameJa: '飛燕斬',
    nameEn: 'Hienzan (Flying Swallow Cut)',
    category: 'special',
    input: '↓蓄↑ + B / D',
    versions: [
      {
        version: 'B',
        attackTypeKey: 'KIM_HIENZAN',
        differences: '弱版，速度5帧，伤害100',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 2,
        isProjectile: false,
      },
      {
        version: 'D',
        attackTypeKey: 'KIM_HIENZAN_D',
        differences: '強版，速度7帧，伤害140，上升更高',
        damageMultiplier: 1.4,
        knockdown: true,
        invincibleStartup: 3,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'KIM_HANGETSU',
    nameJa: '半月蹴',
    nameEn: 'Hangetsu Zan (Half Moon Kick)',
    category: 'special',
    input: '↓↙← + B / D',
    versions: [
      {
        version: 'B',
        attackTypeKey: 'KIM_HANGETSU',
        differences: '弱版，速度7帧',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
      {
        version: 'D',
        attackTypeKey: 'KIM_HANGETSU_D',
        differences: '強版，速度9帧，伤害高',
        damageMultiplier: 1.375,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'KIM_SANREN',
    nameJa: '三連撃',
    nameEn: 'Sanren Geki (Triple Strike)',
    category: 'special',
    input: '↓↙← + P (×3)',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'KIM_SANREN',
        differences: '三连段，每段独立命中',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
      {
        version: 'C',
        attackTypeKey: 'KIM_SANREN_2',
        differences: 'C版强化连段',
        damageMultiplier: 1.15,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'KIM_HAKI',
    nameJa: '覇気脚',
    nameEn: 'Haki Kyaku (Overpower Kick)',
    category: 'special',
    input: '↓↓ + B / D',
    versions: [{
      version: 'B',
      attackTypeKey: 'KIM_HAKI',
      differences: '快速下段突进踢，速度9帧',
      damageMultiplier: 1.0,
      knockdown: false,
      invincibleStartup: 0,
      isProjectile: false,
    }],
  },
  // ── 超必杀技 (DM) ──
  {
    key: 'DM_PHOENIX_KICK',
    nameJa: '鳳凰脚',
    nameEn: 'Houou Kyaku (Phoenix Kick) (DM)',
    category: 'dm',
    input: '↓↙←↓↙← + K',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'DM_PHOENIX_KICK',
      differences: '飞踢突进DM，伤害200',
      damageMultiplier: 1.0,
      knockdown: true,
      invincibleStartup: 5,
      isProjectile: false,
    }],
  },
  {
    key: 'DM_PHOENIX_HITEN',
    nameJa: '鳳凰天舞脚',
    nameEn: 'Houou Tendou Kyaku (Phoenix Heaven Dance) (DM)',
    category: 'dm',
    input: '↓↘→↓↘→ + K',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'DM_PHOENIX_HITEN',
      differences: '飞空连踢DM，伤害180',
      damageMultiplier: 1.0,
      knockdown: true,
      invincibleStartup: 4,
      isProjectile: false,
    }],
  },
  // ── MAX超必杀技 (SDM) ──
  {
    key: 'SDM_PHOENIX_HITEN',
    nameJa: '鳳凰天舞脚 (MAX)',
    nameEn: 'Houou Tendou Kyaku (SDM)',
    category: 'sdm',
    input: 'MAX ↓↘→↓↘→ + KK',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'SDM_PHOENIX_HITEN',
      differences: '强化版飞空连踢，伤害260',
      damageMultiplier: 1.44,
      knockdown: true,
      invincibleStartup: 7,
      isProjectile: false,
    }],
  },
  // ── 隐藏超必杀技 (HSDM) ──
  {
    key: 'HSDM_PHOENIX_HITEN',
    nameJa: '鳳凰天舞脚 EX',
    nameEn: 'Houou Tendou Kyaku EX (HSDM)',
    category: 'hsdm',
    input: 'MAX+红血 ↓↘→↓↘→ + KK',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'HSDM_PHOENIX_HITEN',
      differences: '终极版飞空连踢，伤害280',
      damageMultiplier: 1.56,
      knockdown: true,
      invincibleStartup: 10,
      isProjectile: false,
    }],
  },
];

// ===== Query API =====

export function getMoveByKey(key: string): MoveDefinition | undefined {
  return KIM_MOVES.find(m => m.key === key);
}

export function getMoveByAttackType(attackTypeKey: string): MoveDefinition | undefined {
  return KIM_MOVES.find(m =>
    m.versions.some(v => v.attackTypeKey === attackTypeKey)
  );
}

export function getMovesByCategory(category: MoveDefinition['category']): MoveDefinition[] {
  return KIM_MOVES.filter(m => m.category === category);
}

export function getProjectileMoves(): MoveDefinition[] {
  return KIM_MOVES.filter(m => m.versions.some(v => v.isProjectile));
}

export function getInvincibleMoves(): MoveDefinition[] {
  return KIM_MOVES.filter(m => m.versions.some(v => v.invincibleStartup > 0));
}

export function getMoveStats(attackTypeKey: string): MoveVersionEntry | undefined {
  for (const move of KIM_MOVES) {
    const v = move.versions.find(v => v.attackTypeKey === attackTypeKey);
    if (v) return v;
  }
  return undefined;
}
