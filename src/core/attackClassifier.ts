/**
 * AttackClassifier — 攻击分类器
 *
 * 替代所有硬编码的 startsWith('KYO_') 等角色前缀判断。
 * 分类逻辑由 AttackType 枚举值的命名规则 + COMMAND_NORMALS 集合驱动。
 *
 * 攻击命名规则：
 * - DM_* / SDM_* / HSDM_*  → 超必杀技
 * - KYO_* / IORI_* / ...    → 角色专属必杀技（角色ID大写 + '_'）
 *   但如果该值在 COMMAND_NORMALS 中，则属于指令通常技
 * - SPECIAL_*               → 通用必杀技
 * - CMD_*                   → 命令通常技
 * - CLOSE_* / STAND_* / CROUCH_* / JUMP_* → 通常技
 */

import { COMMAND_NORMALS } from './constants.js';

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

/** 判断是否为角色专属必杀技（不含 DM/SPECIAL/COMMAND_NORMALS） */
export function isCharacterSpecial(name: string): boolean {
  // COMMAND_NORMALS 中的角色前缀条目不是必杀技
  if (COMMAND_NORMALS.has(name)) return false;
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
  // COMMAND_NORMALS 包含 CMD_* 前缀和角色前缀的指令通常技（如 IORI_YUMEYUMI）
  if (COMMAND_NORMALS.has(name) || name.startsWith('CMD_')) return AttackCategory.COMMAND;
  if (isSpecialOrDM(name)) return AttackCategory.SPECIAL;
  if (name.startsWith('CLOSE_') || name.startsWith('STAND_') || name.startsWith('CROUCH_') || name.startsWith('JUMP_')) return AttackCategory.NORMAL;
  return AttackCategory.OTHER;
}
