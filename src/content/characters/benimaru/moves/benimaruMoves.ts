/**
 * Benimaru Content Package — Move / Skill Definitions (真实数据)
 *
 * 必杀技版本差异（A/C/D/B），MAX强化版属性，取消消耗。
 * 这不是渲染数据，是"技能是什么"的结构化定义。
 *
 * 归属: content/characters/benimaru/moves/ — 只放"技能是什么"
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

// ===== Benimaru 必杀技定义 =====

export const BENIMARU_MOVES: MoveDefinition[] = [
  // ── 命令通常技 ──
  {
    key: 'BENIMARU_JACKKNIFE_KICK',
    nameJa: 'ジャックナイフキック',
    nameEn: 'Jackknife Kick',
    category: 'command_normal',
    input: '→ + B',
    versions: [{
      version: 'B',
      attackTypeKey: 'BENIMARU_JACKKNIFE_KICK',
      differences: '中段攻击，对手必须站防',
      damageMultiplier: 1.0,
      knockdown: false,
      invincibleStartup: 0,
      isProjectile: false,
    }],
  },
  {
    key: 'BENIMARU_FLYING_DRILL',
    nameJa: 'フライングドリル',
    nameEn: 'Flying Drill',
    category: 'command_normal',
    input: '空中 ↓ + D',
    versions: [{
      version: 'D',
      attackTypeKey: 'BENIMARU_FLYING_DRILL',
      differences: '空中下段多段钻踢，空中专用',
      damageMultiplier: 1.0,
      knockdown: false,
      invincibleStartup: 0,
      isProjectile: false,
    }],
  },
  // ── 必杀技 ──
  {
    key: 'BENIMARU_RAIJINKEN',
    nameJa: '雷韧拳',
    nameEn: 'Raijinken (Thunder Lightning Punch)',
    category: 'special',
    input: '↓↘→ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'BENIMARU_RAIJINKEN',
        differences: '弱版，速度6帧，对空电光上升拳',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 2,
        isProjectile: false,
      },
      {
        version: 'C',
        attackTypeKey: 'BENIMARU_RAIJINKEN_C',
        differences: '強版，速度9帧，伤害高，击倒',
        damageMultiplier: 1.43,
        knockdown: true,
        invincibleStartup: 3,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'BENIMARU_IAI_GERI',
    nameJa: '居合蹴り',
    nameEn: 'Iai Geri (Super Lightning Kick)',
    category: 'special',
    input: '↓↙← + B / D',
    versions: [
      {
        version: 'B',
        attackTypeKey: 'BENIMARU_IAI_GERI',
        differences: '弱版，速度8帧',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
      {
        version: 'D',
        attackTypeKey: 'BENIMARU_IAI_GERI_D',
        differences: '強版，速度10帧，伤害高',
        damageMultiplier: 1.27,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'BENIMARU_HANDOU_SANDAN_GERI',
    nameJa: '反動三段蹴り',
    nameEn: 'Handou Sandan Geri (3-Stage Kick)',
    category: 'special',
    input: 'Iai Geri中 ↓↘→ + B / D',
    versions: [{
      version: 'B',
      attackTypeKey: 'BENIMARU_HANDOU_SANDAN_GERI',
      differences: 'Iai Geri追加入力，三段连踢，击倒',
      damageMultiplier: 1.45,
      knockdown: true,
      invincibleStartup: 0,
      isProjectile: false,
    }],
  },
  {
    key: 'BENIMARU_SHINKUU_KATATEGOMA',
    nameJa: '真空片手駒',
    nameEn: 'Shinkuu Katategoma (Vacuum Palm Spin)',
    category: 'special',
    input: '→↓↘ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'BENIMARU_SHINKUU_KATATEGOMA',
        differences: '弱版，速度7帧，多段旋转掌',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 1,
        isProjectile: false,
      },
      {
        version: 'C',
        attackTypeKey: 'BENIMARU_SHINKUU_KATATEGOMA_C',
        differences: '強版，速度9帧，更多hits高伤害',
        damageMultiplier: 1.41,
        knockdown: true,
        invincibleStartup: 2,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'BENIMARU_COLLIDER',
    nameJa: '紅丸コレダー',
    nameEn: 'Benimaru Collider (Command Grab)',
    category: 'special',
    input: '→↘↓↙← → + A / C',
    versions: [{
      version: 'A',
      attackTypeKey: 'BENIMARU_COLLIDER',
      differences: '指令投，近距离专用，不可防御',
      damageMultiplier: 1.0,
      knockdown: true,
      invincibleStartup: 0,
      isProjectile: false,
    }],
  },
  {
    key: 'BENIMARU_SUPER_INAZUMA_KICK',
    nameJa: 'スーパー稲妻キック',
    nameEn: 'Super Inazuma Kick (Rising Lightning Kick)',
    category: 'special',
    input: '↓蓄↑ + B / D',
    versions: [
      {
        version: 'B',
        attackTypeKey: 'BENIMARU_SUPER_INAZUMA_KICK',
        differences: '弱版，速度6帧，上升闪电踢',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 2,
        isProjectile: false,
      },
      {
        version: 'D',
        attackTypeKey: 'BENIMARU_SUPER_INAZUMA_KICK_D',
        differences: '強版，速度8帧，伤害高',
        damageMultiplier: 1.47,
        knockdown: true,
        invincibleStartup: 3,
        isProjectile: false,
      },
    ],
  },
  // ── 超必杀技 (DM) ──
  {
    key: 'DM_RAIKOUKEN',
    nameJa: '雷光拳',
    nameEn: 'Raikouken (Lightning Fist DM)',
    category: 'dm',
    input: '↓↘→↓↘→ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'DM_RAIKOUKEN_A',
        differences: 'A版，伤害200',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 5,
        isProjectile: false,
      },
      {
        version: 'C',
        attackTypeKey: 'DM_RAIKOUKEN_C',
        differences: 'C版，伤害200',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 5,
        isProjectile: false,
      },
      {
        version: 'MAX',
        attackTypeKey: 'DM_RAIKOUKEN',
        differences: '默认版，伤害220',
        damageMultiplier: 1.1,
        knockdown: true,
        invincibleStartup: 6,
        isProjectile: false,
      },
    ],
  },
  {
    key: 'DM_GENEI_HURRICANE',
    nameJa: '幻影ハリケーン',
    nameEn: 'Genei Hurricane (Phantom Hurricane DM)',
    category: 'dm',
    input: '↓↘→↓↘→ + B / D',
    versions: [
      {
        version: 'B',
        attackTypeKey: 'DM_GENEI_HURRICANE_B',
        differences: 'B版，伤害180',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 4,
        isProjectile: false,
      },
      {
        version: 'D',
        attackTypeKey: 'DM_GENEI_HURRICANE_D',
        differences: 'D版，伤害180',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 4,
        isProjectile: false,
      },
      {
        version: 'MAX',
        attackTypeKey: 'DM_GENEI_HURRICANE',
        differences: '默认版，伤害200',
        damageMultiplier: 1.11,
        knockdown: true,
        invincibleStartup: 5,
        isProjectile: false,
      },
    ],
  },
  // ── MAX超必杀技 (SDM) ──
  {
    key: 'SDM_RAIKOUKEN',
    nameJa: '雷光拳 SDM',
    nameEn: 'Raikouken SDM',
    category: 'sdm',
    input: 'MAX ↓↘→↓↘→ + AC',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'SDM_RAIKOUKEN',
      differences: 'MAX雷光拳，伤害320，大范围电光',
      damageMultiplier: 1.6,
      knockdown: true,
      invincibleStartup: 8,
      isProjectile: false,
    }],
  },
  // ── 隐藏超必杀技 (HSDM) ──
  {
    key: 'HSDM_RAIKOUKEN',
    nameJa: '雷光拳 EX',
    nameEn: 'Raikouken EX (HSDM)',
    category: 'hsdm',
    input: 'MAX+红血 ↓↘→↓↘→ + AC',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'HSDM_RAIKOUKEN',
      differences: '终极雷光拳，伤害350，全屏电光',
      damageMultiplier: 1.75,
      knockdown: true,
      invincibleStartup: 10,
      isProjectile: false,
    }],
  },
];

// ===== Query API =====

export function getMoveByKey(key: string): MoveDefinition | undefined {
  return BENIMARU_MOVES.find(m => m.key === key);
}

export function getMoveByAttackType(attackTypeKey: string): MoveDefinition | undefined {
  return BENIMARU_MOVES.find(m =>
    m.versions.some(v => v.attackTypeKey === attackTypeKey)
  );
}

export function getMovesByCategory(category: MoveDefinition['category']): MoveDefinition[] {
  return BENIMARU_MOVES.filter(m => m.category === category);
}

export function getProjectileMoves(): MoveDefinition[] {
  return BENIMARU_MOVES.filter(m => m.versions.some(v => v.isProjectile));
}

export function getInvincibleMoves(): MoveDefinition[] {
  return BENIMARU_MOVES.filter(m => m.versions.some(v => v.invincibleStartup > 0));
}

export function getMoveStats(attackTypeKey: string): MoveVersionEntry | undefined {
  for (const move of BENIMARU_MOVES) {
    const v = move.versions.find(v => v.attackTypeKey === attackTypeKey);
    if (v) return v;
  }
  return undefined;
}
