/**
 * Andy Content Package — Move / Skill Definitions (真实数据)
 *
 * 必杀技版本差异（A/C/D/B），MAX强化版属性，取消消耗。
 * 这不是渲染数据，是"技能是什么"的结构化定义。
 *
 * 归属: content/characters/andy/moves/ — 只放"技能是什么"
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

// ===== Andy 必杀技定义 =====

export const ANDY_MOVES: MoveDefinition[] = [
  // ── 命令通常技 ──
  {
    key: 'ANDY_UWA_AGITO',
    nameJa: '上顎',
    nameEn: 'Uwa Agito',
    category: 'command_normal',
    input: '→ + A',
    versions: [{
      version: 'A',
      attackTypeKey: 'ANDY_UWA_AGITO',
      differences: '上段打击，对手必须站防',
      damageMultiplier: 1.0,
      knockdown: false,
      invincibleStartup: 0,
      isProjectile: false,
      isGrab: false,
    }],
  },
  {
    key: 'ANDY_GEDAN_AGITO',
    nameJa: '下顎',
    nameEn: 'Gedan Agito',
    category: 'command_normal',
    input: '→ + B',
    versions: [{
      version: 'B',
      attackTypeKey: 'ANDY_GEDAN_AGITO',
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
    key: 'ANDY_HISHOU_KEN',
    nameJa: '飛翔拳',
    nameEn: 'Hishou Ken',
    category: 'special',
    input: '↓↘→ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'ANDY_HISHOU_KEN',
        differences: '弱版，速度快14帧，小能量弹',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: true,
        isGrab: false,
      },
      {
        version: 'C',
        attackTypeKey: 'ANDY_HISHOU_KEN_C',
        differences: '強版，速度18帧，大能量弹，伤害高',
        damageMultiplier: 1.33,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: true,
        isGrab: false,
      },
    ],
  },
  {
    key: 'ANDY_SHOURYUU_DAN',
    nameJa: '昇龍弾',
    nameEn: 'Shouryuu Dan',
    category: 'special',
    input: '→↓↘ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'ANDY_SHOURYUU_DAN',
        differences: '弱版，速度5帧，1hit uppercut',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 2,
        isProjectile: false,
        isGrab: false,
      },
      {
        version: 'C',
        attackTypeKey: 'ANDY_SHOURYUU_DAN_C',
        differences: '強版，速度6帧，2hit uppercut，伤害高',
        damageMultiplier: 1.36,
        knockdown: true,
        invincibleStartup: 4,
        isProjectile: false,
        isGrab: false,
      },
    ],
  },
  {
    key: 'ANDY_ZANEI_RYUSEI_KEN',
    nameJa: '斬影流星拳',
    nameEn: "Zan'ei Ryuusei Ken",
    category: 'special',
    input: '←↙↓↘→ + B / D',
    versions: [
      {
        version: 'B',
        attackTypeKey: 'ANDY_ZANEI_RYUSEI_KEN',
        differences: '弱版，短距离dash punch，速度8帧',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: false,
      },
      {
        version: 'D',
        attackTypeKey: 'ANDY_ZANEI_RYUSEI_KEN_D',
        differences: '強版，长距离dash punch，伤害高，击倒',
        damageMultiplier: 1.22,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: false,
      },
    ],
  },
  {
    key: 'ANDY_GEKI_HISHOU_KEN',
    nameJa: '激飛翔拳',
    nameEn: 'Geki Hishou Ken',
    category: 'special',
    input: '↓↙← + K (air)',
    versions: [{
      version: 'B',
      attackTypeKey: 'ANDY_GEKI_HISHOU_KEN',
      differences: '空中diving attack，击倒',
      damageMultiplier: 1.0,
      knockdown: true,
      invincibleStartup: 0,
      isProjectile: false,
      isGrab: false,
    }],
  },
  // ── 超必杀技 (DM) ──
  {
    key: 'DM_CHO_REPPA_DAN',
    nameJa: '超裂破弾',
    nameEn: 'Cho Reppa Dan (DM)',
    category: 'dm',
    input: '↓↘→↓↘→ + P',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'DM_CHO_REPPA_DAN',
        differences: 'DM版多段上升uppercut，伤害200',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 5,
        isProjectile: false,
        isGrab: false,
      },
    ],
  },
];

// ===== Query API =====

export function getMoveByKey(key: string): MoveDefinition | undefined {
  return ANDY_MOVES.find(m => m.key === key);
}

export function getMoveByAttackType(attackTypeKey: string): MoveDefinition | undefined {
  return ANDY_MOVES.find(m =>
    m.versions.some(v => v.attackTypeKey === attackTypeKey)
  );
}

export function getMovesByCategory(category: MoveDefinition['category']): MoveDefinition[] {
  return ANDY_MOVES.filter(m => m.category === category);
}

export function getProjectileMoves(): MoveDefinition[] {
  return ANDY_MOVES.filter(m => m.versions.some(v => v.isProjectile));
}

export function getInvincibleMoves(): MoveDefinition[] {
  return ANDY_MOVES.filter(m => m.versions.some(v => v.invincibleStartup > 0));
}

export function getGrabMoves(): MoveDefinition[] {
  return ANDY_MOVES.filter(m => m.versions.some(v => v.isGrab));
}

export function getMoveStats(attackTypeKey: string): MoveVersionEntry | undefined {
  for (const move of ANDY_MOVES) {
    const v = move.versions.find(v => v.attackTypeKey === attackTypeKey);
    if (v) return v;
  }
  return undefined;
}
