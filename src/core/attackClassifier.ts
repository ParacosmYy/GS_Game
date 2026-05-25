/**
 * AttackClassifier — 攻击分类器
 *
 * 替代所有硬编码的 startsWith('KYO_') 等角色前缀判断。
 * 分类逻辑由 AttackType 枚举值的命名规则驱动，无需维护角色列表。
 *
 * 攻击命名规则：
 * - DM_* / SDM_* / HSDM_*  → 超必杀技
 * - KYO_* / IORI_* / ...    → 角色专属必杀技（角色ID大写 + '_'）
 * - SPECIAL_*               → 通用必杀技
 * - CMD_*                   → 命令通常技
 * - CLOSE_* / STAND_* / CROUCH_* / JUMP_* → 通常技
 */

/** 攻击分类 */
export enum AttackCategory {
  DM = 'DM',
  SPECIAL = 'SPECIAL',
  COMMAND = 'COMMAND',
  NORMAL = 'NORMAL',
  THROW = 'THROW',
  BLOWBACK = 'BLOWBACK',
  OTHER = 'OTHER',
}

/** 判断是否为超必杀技 (DM/SDM/HSDM) */
export function isDM(name: string): boolean {
  return name.startsWith('DM_') || name.startsWith('SDM_') || name.startsWith('HSDM_');
}

// 通常技前缀 — 不是角色专属必杀技
const NORMAL_PREFIXES = new Set([
  'CLOSE', 'STAND', 'CROUCH', 'JUMP', 'CMD', 'THROW',
  'SPECIAL', 'DM', 'SDM', 'HSDM',
]);

/** 判断是否为角色专属必杀技（不含 DM/SPECIAL） */
export function isCharacterSpecial(name: string): boolean {
  const match = /^([A-Z][A-Z0-9]+)_/.exec(name);
  if (!match) return false;
  return !NORMAL_PREFIXES.has(match[1]);
}

/** 判断是否为必杀技（含 DM 和 SPECIAL） */
export function isSpecialOrDM(name: string): boolean {
  return isDM(name) || name.startsWith('SPECIAL_') || isCharacterSpecial(name);
}

/** 获取攻击分类 */
export function classify(name: string): AttackCategory {
  if (isDM(name)) return AttackCategory.DM;
  if (name === 'THROW' || name === 'THROW_FORWARD' || name === 'THROW_BACK') return AttackCategory.THROW;
  if (name === 'STAND_CD' || name === 'JUMP_CD') return AttackCategory.BLOWBACK;
  if (name.startsWith('CMD_')) return AttackCategory.COMMAND;
  if (isSpecialOrDM(name)) return AttackCategory.SPECIAL;
  if (name.startsWith('CLOSE_') || name.startsWith('STAND_') || name.startsWith('CROUCH_') || name.startsWith('JUMP_')) return AttackCategory.NORMAL;
  return AttackCategory.OTHER;
}
