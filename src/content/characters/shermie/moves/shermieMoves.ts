/**
 * Shermie Content Package — Move / Skill Definitions (真实数据)
 *
 * 必杀技版本差异（A/C/D/B），MAX强化版属性，取消消耗。
 * 这不是渲染数据，是"技能是什么"的结构化定义。
 *
 * 归属: content/characters/shermie/moves/ — 只放"技能是什么"
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

// ===== Shermie 必杀技定义 =====

export const SHERMIE_MOVES: MoveDefinition[] = [
  // ── 命令通常技 ──
  {
    key: 'SHERMIE_STAND',
    nameJa: 'シェルミースタンド',
    nameEn: 'Shermie Stand',
    category: 'command_normal',
    input: '→ + A',
    versions: [{
      version: 'A',
      attackTypeKey: 'SHERMIE_STAND',
      differences: '上段打击，对手必须站防',
      damageMultiplier: 1.0,
      knockdown: false,
      invincibleStartup: 0,
      isProjectile: false,
      isGrab: false,
    }],
  },
  {
    key: 'SHERMIE_CLASH',
    nameJa: 'シェルミークラッシュ',
    nameEn: 'Shermie Clash',
    category: 'command_normal',
    input: '→ + B',
    versions: [{
      version: 'B',
      attackTypeKey: 'SHERMIE_CLASH',
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
    key: 'SHERMIE_SHOOT',
    nameJa: 'シェルミーシュート',
    nameEn: 'Shermie Shoot',
    category: 'special',
    input: '↓↘→ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'SHERMIE_SHOOT',
        differences: '弱版，速度快10帧，旋转踢',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: false,
      },
      {
        version: 'C',
        attackTypeKey: 'SHERMIE_SHOOT_C',
        differences: '強版，速度14帧，伤害高，击倒',
        damageMultiplier: 1.29,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: false,
      },
    ],
  },
  {
    key: 'SHERMIE_CARNIVAL',
    nameJa: 'シェルミーカーニバル',
    nameEn: 'Shermie Carnival',
    category: 'special',
    input: '↓↙← + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'SHERMIE_CARNIVAL',
        differences: '多段旋转攻击，可取消',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: false,
      },
    ],
  },
  {
    key: 'SHERMIE_SPIRAL',
    nameJa: 'シェルミースパイラル',
    nameEn: 'Shermie Spiral',
    category: 'special',
    input: '→↘↓↙← + A / C (near)',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'SHERMIE_SPIRAL',
        differences: '弱版投技，速度5帧，螺旋投',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: true,
      },
      {
        version: 'C',
        attackTypeKey: 'SHERMIE_SPIRAL_C',
        differences: '強版投技，速度6帧，伤害高',
        damageMultiplier: 1.19,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: true,
      },
    ],
  },
  {
    key: 'SHERMIE_WHIP',
    nameJa: 'シェルミーウィップ',
    nameEn: 'Shermie Whip',
    category: 'special',
    input: '↓↘→ + B / D',
    versions: [
      {
        version: 'B',
        attackTypeKey: 'SHERMIE_WHIP',
        differences: '弱版，速度8帧，鞭踢',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: false,
      },
      {
        version: 'D',
        attackTypeKey: 'SHERMIE_WHIP_C',
        differences: '強版，速度10帧，伤害高，击倒',
        damageMultiplier: 1.21,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: false,
      },
    ],
  },
  {
    key: 'SHERMIE_SUPLEX',
    nameJa: 'シェルミークラッチ',
    nameEn: 'Shermie Clutch',
    category: 'special',
    input: '→↘↓↙← + B / D (near)',
    versions: [
      {
        version: 'B',
        attackTypeKey: 'SHERMIE_SUPLEX',
        differences: '近身投技，速度4帧，高速捕捉',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: true,
      },
    ],
  },
  {
    key: 'SHERMIE_AXLE_SPIN',
    nameJa: 'アクセルスピンキック',
    nameEn: 'Axle Spin Kick',
    category: 'special',
    input: '↓↙← + B / D',
    versions: [
      {
        version: 'B',
        attackTypeKey: 'SHERMIE_AXLE_SPIN',
        differences: '下段旋转扫，击倒',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: false,
      },
    ],
  },
  // ── 超必杀技 (DM) ──
  {
    key: 'DM_SHERMIE_CARNIVAL',
    nameJa: 'シェルミーカーニバル',
    nameEn: 'Shermie Carnival (DM)',
    category: 'dm',
    input: '↓↘→↓↘→ + B / D',
    versions: [
      {
        version: 'B',
        attackTypeKey: 'DM_SHERMIE_CARNIVAL',
        differences: 'DM版多段旋转，伤害200',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 5,
        isProjectile: false,
        isGrab: false,
      },
    ],
  },
  {
    key: 'DM_SHERMIE_FLASH',
    nameJa: 'シェルミーフラッシュ',
    nameEn: 'Shermie Flash (DM)',
    category: 'dm',
    input: '→↘↓↙←→ + A / C (near)',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'DM_SHERMIE_FLASH',
        differences: '投技DM，近身捕捉，伤害190',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 3,
        isProjectile: false,
        isGrab: true,
      },
    ],
  },
  // ── MAX超必杀技 (SDM) ──
  {
    key: 'SDM_SHERMIE_CARNIVAL',
    nameJa: 'シェルミーカーニバル',
    nameEn: 'Shermie Carnival (SDM)',
    category: 'sdm',
    input: 'MAX ↓↘→↓↘→ + BD',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'SDM_SHERMIE_CARNIVAL',
      differences: '强化多段旋转，伤害310',
      damageMultiplier: 1.55,
      knockdown: true,
      invincibleStartup: 8,
      isProjectile: false,
      isGrab: false,
    }],
  },
  {
    key: 'SDM_SHERMIE_FLASH',
    nameJa: 'シェルミーフラッシュ',
    nameEn: 'Shermie Flash (SDM)',
    category: 'sdm',
    input: 'MAX →↘↓↙←→ + AC (near)',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'SDM_SHERMIE_FLASH',
      differences: '强化投技SDM，伤害260',
      damageMultiplier: 1.37,
      knockdown: true,
      invincibleStartup: 6,
      isProjectile: false,
      isGrab: true,
    }],
  },
];

// ===== Query API =====

export function getMoveByKey(key: string): MoveDefinition | undefined {
  return SHERMIE_MOVES.find(m => m.key === key);
}

export function getMoveByAttackType(attackTypeKey: string): MoveDefinition | undefined {
  return SHERMIE_MOVES.find(m =>
    m.versions.some(v => v.attackTypeKey === attackTypeKey)
  );
}

export function getMovesByCategory(category: MoveDefinition['category']): MoveDefinition[] {
  return SHERMIE_MOVES.filter(m => m.category === category);
}

export function getProjectileMoves(): MoveDefinition[] {
  return SHERMIE_MOVES.filter(m => m.versions.some(v => v.isProjectile));
}

export function getInvincibleMoves(): MoveDefinition[] {
  return SHERMIE_MOVES.filter(m => m.versions.some(v => v.invincibleStartup > 0));
}

export function getGrabMoves(): MoveDefinition[] {
  return SHERMIE_MOVES.filter(m => m.versions.some(v => v.isGrab));
}

export function getMoveStats(attackTypeKey: string): MoveVersionEntry | undefined {
  for (const move of SHERMIE_MOVES) {
    const v = move.versions.find(v => v.attackTypeKey === attackTypeKey);
    if (v) return v;
  }
  return undefined;
}
