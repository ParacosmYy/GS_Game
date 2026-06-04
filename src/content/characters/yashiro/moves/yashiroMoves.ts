/**
 * Yashiro Content Package — Move / Skill Definitions
 *
 * 必杀技版本差异（A/C/D/B），MAX强化版属性，取消消耗。
 * 这不是渲染数据，是"技能是什么"的结构化定义。
 *
 * 归属: content/characters/yashiro/moves/ — 只放"技能是什么"
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

// ===== Yashiro 必杀技定义 =====

export const YASHIRO_MOVES: MoveDefinition[] = [
  // ── 命令通常技 ──
  {
    key: 'YASHIRO_SHUU_WANI',
    nameJa: 'シュウワニ',
    nameEn: 'Shuu Wani',
    category: 'command_normal',
    input: '→ + A',
    versions: [{
      version: 'A',
      attackTypeKey: 'YASHIRO_SHUU_WANI',
      differences: '上段突拳，对手必须站防',
      damageMultiplier: 1.0,
      knockdown: false,
      invincibleStartup: 0,
      isProjectile: false,
      isGrab: false,
    }],
  },
  {
    key: 'YASHIRO_JUU_ZUTSU',
    nameJa: 'ジュウズツ',
    nameEn: 'Juu Zutsu',
    category: 'command_normal',
    input: '→ + B',
    versions: [{
      version: 'B',
      attackTypeKey: 'YASHIRO_JUU_ZUTSU',
      differences: '中段overhead头槌，对手必须站防',
      damageMultiplier: 1.0,
      knockdown: false,
      invincibleStartup: 0,
      isProjectile: false,
      isGrab: false,
    }],
  },
  // ── 必杀技 ──
  {
    key: 'YASHIRO_UPPER_DU',
    nameJa: 'アッパーデューク',
    nameEn: 'Upper Duke',
    category: 'special',
    input: '↓↘→ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'YASHIRO_UPPER_DU',
        differences: '弱版，速度快8帧，勾拳突进',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: false,
      },
      {
        version: 'C',
        attackTypeKey: 'YASHIRO_UPPER_DU_C',
        differences: '強版，速度12帧，多段，击倒',
        damageMultiplier: 1.32,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: false,
      },
    ],
  },
  {
    key: 'YASHIRO_NIRAAI',
    nameJa: 'リグレットバッシュ',
    nameEn: 'Regret Bash',
    category: 'special',
    input: '↓↙← + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'YASHIRO_NIRAAI',
        differences: '弱版，速度10帧，中段砸击',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: false,
      },
      {
        version: 'C',
        attackTypeKey: 'YASHIRO_NIRAAI_C',
        differences: '強版，速度13帧，伤害高，击倒',
        damageMultiplier: 1.29,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: false,
      },
    ],
  },
  {
    key: 'YASHIRO_MUSATSU',
    nameJa: 'ジェットカウンター',
    nameEn: 'Jet Counter',
    category: 'special',
    input: '↓↘→ + B / D',
    versions: [
      {
        version: 'B',
        attackTypeKey: 'YASHIRO_MUSATSU',
        differences: '弱版，速度8帧，突进攻击',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: false,
      },
      {
        version: 'D',
        attackTypeKey: 'YASHIRO_MUSATSU_D',
        differences: '強版，速度10帧，伤害高，击倒',
        damageMultiplier: 1.2,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: false,
      },
    ],
  },
  {
    key: 'YASHIRO_SLEDGEHAMMER',
    nameJa: 'スレッジハンマー',
    nameEn: 'Sledgehammer',
    category: 'special',
    input: '→↓↘ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'YASHIRO_SLEDGEHAMMER',
        differences: '弱版对空，速度5帧，击倒',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: false,
      },
      {
        version: 'C',
        attackTypeKey: 'YASHIRO_SLEDGEHAMMER_C',
        differences: '強版对空，速度7帧，无敌4帧，伤害高',
        damageMultiplier: 1.31,
        knockdown: true,
        invincibleStartup: 4,
        isProjectile: false,
        isGrab: false,
      },
    ],
  },
  {
    key: 'YASHIRO_MISSED',
    nameJa: 'ミス',
    nameEn: 'Missed',
    category: 'special',
    input: '←↙↓↘→ + K',
    versions: [
      {
        version: 'B',
        attackTypeKey: 'YASHIRO_MISSED',
        differences: '假动作回避，无攻击判定',
        damageMultiplier: 0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: false,
      },
    ],
  },
  // ── 超必杀技 (DM) ──
  {
    key: 'DM_MILLION_BASH_STREAM',
    nameJa: 'ミリオンバッシュストリーム',
    nameEn: 'Million Bash Stream (DM)',
    category: 'dm',
    input: '↓↙←↓↙← + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'DM_MILLION_BASH_STREAM',
        differences: 'DM版连续重拳，伤害210',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 4,
        isProjectile: false,
        isGrab: false,
      },
    ],
  },
  {
    key: 'DM_ORE_MAJI_MAMIRE',
    nameJa: 'オレマジマミレ',
    nameEn: 'Ore Maji Mamire (DM)',
    category: 'dm',
    input: '←↙↓↘→←↙↓↘→ + P (near)',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'DM_ORE_MAJI_MAMIRE',
        differences: '投技DM，近身捕捉，伤害200',
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
    key: 'SDM_MILLION_BASH_STREAM',
    nameJa: 'ミリオンバッシュストリーム',
    nameEn: 'Million Bash Stream (SDM)',
    category: 'sdm',
    input: 'MAX ↓↙←↓↙← + AC',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'SDM_MILLION_BASH_STREAM',
      differences: '强化连续重拳，伤害320',
      damageMultiplier: 1.52,
      knockdown: true,
      invincibleStartup: 6,
      isProjectile: false,
      isGrab: false,
    }],
  },
  {
    key: 'SDM_ORE_MAJI_MAMIRE',
    nameJa: 'オレマジマミレ',
    nameEn: 'Ore Maji Mamire (SDM)',
    category: 'sdm',
    input: 'MAX ←↙↓↘→←↙↓↘→ + AC (near)',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'SDM_ORE_MAJI_MAMIRE',
      differences: '强化投技SDM，伤害270',
      damageMultiplier: 1.35,
      knockdown: true,
      invincibleStartup: 5,
      isProjectile: false,
      isGrab: true,
    }],
  },
];

// ===== Query API =====

export function getMoveByKey(key: string): MoveDefinition | undefined {
  return YASHIRO_MOVES.find(m => m.key === key);
}

export function getMoveByAttackType(attackTypeKey: string): MoveDefinition | undefined {
  return YASHIRO_MOVES.find(m =>
    m.versions.some(v => v.attackTypeKey === attackTypeKey)
  );
}

export function getMovesByCategory(category: MoveDefinition['category']): MoveDefinition[] {
  return YASHIRO_MOVES.filter(m => m.category === category);
}

export function getProjectileMoves(): MoveDefinition[] {
  return YASHIRO_MOVES.filter(m => m.versions.some(v => v.isProjectile));
}

export function getInvincibleMoves(): MoveDefinition[] {
  return YASHIRO_MOVES.filter(m => m.versions.some(v => v.invincibleStartup > 0));
}

export function getGrabMoves(): MoveDefinition[] {
  return YASHIRO_MOVES.filter(m => m.versions.some(v => v.isGrab));
}

export function getMoveStats(attackTypeKey: string): MoveVersionEntry | undefined {
  for (const move of YASHIRO_MOVES) {
    const v = move.versions.find(v => v.attackTypeKey === attackTypeKey);
    if (v) return v;
  }
  return undefined;
}
