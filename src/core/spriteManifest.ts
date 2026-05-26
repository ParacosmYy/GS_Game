/**
 * Sprite Manifest — 精灵图 manifest 类型定义与查询接口
 *
 * 为未来资产管线奠定基础：运行时只读 manifest，不硬编码角色图形。
 * 当前阶段只定义数据结构和 fallback 颜色，不涉及实际 atlas 加载。
 *
 * 归属: core/ — 纯类型、纯函数，不持有运行时状态
 */

import { AttackType } from './types.js';

// ===== 类型定义 =====

/** 单个精灵图的锚点偏移 */
export interface SpriteAnchor {
  /** 角色脚底中心相对于精灵图左上角的X偏移 */
  x: number;
  /** 角色脚底中心相对于精灵图左上角的Y偏移 */
  y: number;
}

/** 单个精灵帧 */
export interface SpriteFrame {
  /** 精灵图atlas中的X位置 */
  atlasX: number;
  /** 精灵图atlas中的Y位置 */
  atlasY: number;
  /** 帧宽度 */
  width: number;
  /** 帧高度 */
  height: number;
  /** 锚点偏移 */
  anchor: SpriteAnchor;
  /** 帧持续毫秒(动画用) */
  duration?: number;
}

/** 动画序列 */
export interface SpriteAnimation {
  /** 动画名称 (idle, walk, jump, stand_a, stand_c, special_upper, dm_orochinagi 等) */
  name: string;
  /** 帧序列 */
  frames: SpriteFrame[];
  /** 是否循环 */
  loop: boolean;
  /** 取消窗口(从第N帧开始可以取消) */
  cancelStartFrame?: number;
}

/** 角色精灵图manifest */
export interface CharacterSpriteManifest {
  /** 角色ID */
  charId: string;
  /** 精灵图atlas路径 */
  atlasPath: string;
  /** 所有动画 */
  animations: Record<string, SpriteAnimation>;
  /** 替代色palette(可选) */
  palettes?: string[][];
  /** fallback颜色(无atlas时用) */
  fallbackColors: {
    body: string;
    head: string;
    outfit: string;
    hair: string;
  };
}

/** 全局manifest */
export interface SpriteManifest {
  /** 版本号 */
  version: number;
  /** 所有角色manifest */
  characters: Record<string, CharacterSpriteManifest>;
}

// ===== 查询函数 =====

/**
 * 根据charId和animation名称获取动画
 * @returns SpriteAnimation 或 undefined（角色或动画不存在时）
 */
export function getAnimation(
  manifest: SpriteManifest,
  charId: string,
  animName: string,
): SpriteAnimation | undefined {
  const charManifest = manifest.characters[charId];
  return charManifest?.animations[animName];
}

/**
 * 获取角色fallback颜色
 * @returns 角色定义的fallback颜色，角色不存在时返回默认色板
 */
export function getFallbackColors(
  manifest: SpriteManifest,
  charId: string,
): CharacterSpriteManifest['fallbackColors'] {
  const charManifest = manifest.characters[charId];
  return charManifest?.fallbackColors ?? {
    body: '#FFD699',
    head: '#FFD699',
    outfit: '#FF6600',
    hair: '#333333',
  };
}

/**
 * 获取角色的所有动画名称列表
 */
export function getAnimationNames(manifest: SpriteManifest, charId: string): string[] {
  const charManifest = manifest.characters[charId];
  if (!charManifest) return [];
  return Object.keys(charManifest.animations);
}

/**
 * 获取动画总时长（毫秒）
 * 将每帧 duration 累加，未定义 duration 的帧不计入
 */
export function getAnimationDuration(manifest: SpriteManifest, charId: string, animName: string): number {
  const anim = getAnimation(manifest, charId, animName);
  if (!anim) return 0;
  return anim.frames.reduce((sum, frame) => sum + (frame.duration ?? 0), 0);
}

/**
 * 获取动画帧数
 */
export function getAnimationFrameCount(manifest: SpriteManifest, charId: string, animName: string): number {
  const anim = getAnimation(manifest, charId, animName);
  if (!anim) return 0;
  return anim.frames.length;
}

/**
 * 检查角色是否拥有指定动画
 */
export function hasAnimation(manifest: SpriteManifest, charId: string, animName: string): boolean {
  return getAnimation(manifest, charId, animName) !== undefined;
}

/**
 * 获取 manifest 中所有角色 ID
 */
export function getCharacterIds(manifest: SpriteManifest): string[] {
  return Object.keys(manifest.characters);
}

/**
 * 将 AttackType 枚举值映射为动画名称
 * 规则：大写枚举值转小写，如 STAND_A -> 'stand_a'
 */
export function attackTypeToAnimName(attackType: AttackType): string {
  return attackType.toLowerCase();
}

/**
 * 根据攻击类型获取对应的动画
 * 先将 AttackType 映射为动画名称，再查询 manifest
 */
export function getAttackAnimation(
  manifest: SpriteManifest,
  charId: string,
  attackType: AttackType,
): SpriteAnimation | undefined {
  const animName = attackTypeToAnimName(attackType);
  return getAnimation(manifest, charId, animName);
}
