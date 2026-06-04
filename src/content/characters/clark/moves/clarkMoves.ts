/**
 * Clark Content Package — Move / Skill Definitions
 *
 * 必杀技版本差异（A/C/D/B），MAX强化版属性，取消消耗。
 * 这不是渲染数据，是"技能是什么"的结构化定义。
 *
 * 归属: content/characters/clark/moves/ — 只放"技能是什么"
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

// ===== Clark 必杀技定义 =====

export const CLARK_MOVES: MoveDefinition[] = [
  // ── 命令通常技 ──
  {
    key: 'CLARK_DEATH_LAKE',
    nameJa: 'デスレイクドライブ',
    nameEn: 'Death Lake Drive',
    category: 'command_normal',
    input: '→ + A',
    versions: [{
      version: 'A',
      attackTypeKey: 'CLARK_DEATH_LAKE',
      differences: '上段打击,overhead,对手必须站防',
      damageMultiplier: 1.0,
      knockdown: false,
      invincibleStartup: 0,
      isProjectile: false,
      isGrab: false,
    }],
  },
  {
    key: 'CLARK_STOMP',
    nameJa: 'ストンピング',
    nameEn: 'Stomp',
    category: 'command_normal',
    input: '→ + B',
    versions: [{
      version: 'B',
      attackTypeKey: 'CLARK_STOMP',
      differences: '下段踩踏,对手必须蹲防',
      damageMultiplier: 1.0,
      knockdown: false,
      invincibleStartup: 0,
      isProjectile: false,
      isGrab: false,
    }],
  },
  // ── 必杀技 ──
  {
    key: 'CLARK_ARGENTINE',
    nameJa: 'スーパーアルゼンチンバックブリーカー',
    nameEn: 'Super Argentine Backbreaker',
    category: 'special',
    input: '↓↙← + A / C (near)',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'CLARK_ARGENTINE',
        differences: '弱版投技,速度5帧,抓取范围稍小',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: true,
      },
      {
        version: 'C',
        attackTypeKey: 'CLARK_ARGENTINE_C',
        differences: '強版投技,速度6帧,伤害高,抓取范围大',
        damageMultiplier: 1.18,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: true,
      },
    ],
  },
  {
    key: 'CLARK_NAPALM',
    nameJa: 'ナパームストレッチ',
    nameEn: 'Napalm Stretch',
    category: 'special',
    input: '↓↘→ + A / C',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'CLARK_NAPALM',
        differences: '对空捕捉投,速度8帧,抓住空中对手',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: true,
      },
    ],
  },
  {
    key: 'CLARK_FLASH_ELBOW',
    nameJa: 'フラッシュエルボー',
    nameEn: 'Flash Elbow',
    category: 'special',
    input: '↓↘→ + A / C (after throw)',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'CLARK_FLASH_ELBOW',
        differences: '投技后追击肘击,追加伤害',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: false,
      },
    ],
  },
  {
    key: 'CLARK_MOUNT_TACKLE',
    nameJa: 'マウントタックル',
    nameEn: 'Mount Tackle',
    category: 'special',
    input: '→↘↓↙← + A / C (near)',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'CLARK_MOUNT_TACKLE',
        differences: '近身冲撞投技,速度4帧,高速捕捉',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: true,
      },
    ],
  },
  {
    key: 'CLARK_VULCAN',
    nameJa: 'バルカンパンチ',
    nameEn: 'Vulcan Punch',
    category: 'special',
    input: '↓↘→ + B / D',
    versions: [
      {
        version: 'B',
        attackTypeKey: 'CLARK_VULCAN',
        differences: '多段连打,10帧启动,可取消',
        damageMultiplier: 1.0,
        knockdown: false,
        invincibleStartup: 0,
        isProjectile: false,
        isGrab: false,
      },
    ],
  },
  // ── 超必杀技 (DM) ──
  {
    key: 'DM_ARGENTINE_DM',
    nameJa: 'スーパーアルゼンチンバックブリーカー',
    nameEn: 'Super Argentine Backbreaker (DM)',
    category: 'dm',
    input: '↓↘→↓↘→ + A / C (near)',
    versions: [
      {
        version: 'A',
        attackTypeKey: 'DM_ARGENTINE_DM',
        differences: 'DM版近身投技,伤害200',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 5,
        isProjectile: false,
        isGrab: true,
      },
    ],
  },
  {
    key: 'DM_ROLLING_CRADLE',
    nameJa: 'ローリングクレイドル',
    nameEn: 'Rolling Cradle (DM)',
    category: 'dm',
    input: '↓↙←↓↙← + B / D (near)',
    versions: [
      {
        version: 'B',
        attackTypeKey: 'DM_ROLLING_CRADLE',
        differences: 'DM版回旋摇篮投,伤害190',
        damageMultiplier: 1.0,
        knockdown: true,
        invincibleStartup: 4,
        isProjectile: false,
        isGrab: true,
      },
    ],
  },
  // ── MAX超必杀技 (SDM) ──
  {
    key: 'SDM_ARGENTINE_DM',
    nameJa: 'スーパーアルゼンチンバックブリーカー',
    nameEn: 'Super Argentine Backbreaker (SDM)',
    category: 'sdm',
    input: 'MAX ↓↘→↓↘→ + AC (near)',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'SDM_ARGENTINE_DM',
      differences: '强化近身投技SDM,伤害280',
      damageMultiplier: 1.4,
      knockdown: true,
      invincibleStartup: 8,
      isProjectile: false,
      isGrab: true,
    }],
  },
  {
    key: 'SDM_ROLLING_CRADLE',
    nameJa: 'ローリングクレイドル',
    nameEn: 'Rolling Cradle (SDM)',
    category: 'sdm',
    input: 'MAX ↓↙←↓↙← + BD (near)',
    versions: [{
      version: 'MAX',
      attackTypeKey: 'SDM_ROLLING_CRADLE',
      differences: '强化回旋摇篮投SDM,伤害260',
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
  return CLARK_MOVES.find(m => m.key === key);
}

export function getMoveByAttackType(attackTypeKey: string): MoveDefinition | undefined {
  return CLARK_MOVES.find(m =>
    m.versions.some(v => v.attackTypeKey === attackTypeKey)
  );
}

export function getMovesByCategory(category: MoveDefinition['category']): MoveDefinition[] {
  return CLARK_MOVES.filter(m => m.category === category);
}

export function getProjectileMoves(): MoveDefinition[] {
  return CLARK_MOVES.filter(m => m.versions.some(v => v.isProjectile));
}

export function getInvincibleMoves(): MoveDefinition[] {
  return CLARK_MOVES.filter(m => m.versions.some(v => v.invincibleStartup > 0));
}

export function getGrabMoves(): MoveDefinition[] {
  return CLARK_MOVES.filter(m => m.versions.some(v => v.isGrab));
}

export function getMoveStats(attackTypeKey: string): MoveVersionEntry | undefined {
  for (const move of CLARK_MOVES) {
    const v = move.versions.find(v => v.attackTypeKey === attackTypeKey);
    if (v) return v;
  }
  return undefined;
}
