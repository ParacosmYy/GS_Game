/**
 * Manifest Render Data — 角色渲染数据查询接口
 *
 * 连接 spriteManifest / portraitManifest 和渲染层。
 * 提供 getCharacterRenderData() 供渲染器查询角色的 manifest fallbackColors
 * 和当前动画信息，替代硬编码颜色查找。
 *
 * 归属: rendering/ — 只读查询，不持有状态
 */

import {
  getFallbackColors,
  getAnimation,
  getAnimationNames,
} from '../core/spriteManifest.js';
import { SPRITE_MANIFEST } from '../core/spriteManifestData.js';
import {
  PORTRAIT_MANIFEST,
  getHUDPortrait,
  getSelectPortrait,
  getVSPortrait,
  getWinPortrait,
  hasPixelPortraitData,
  getPortraitFallbackColor,
  getPortraitFallbackAccent,
  type PortraitEntry,
  type PortraitSize,
} from '../core/portraitManifest.js';

/** 角色渲染用的完整数据包 */
export interface CharacterRenderData {
  /** 角色 ID */
  charId: string;
  /** manifest 中的 fallbackColors（body/head/outfit/hair） */
  fallbackColors: {
    body: string;
    head: string;
    outfit: string;
    hair: string;
  };
  /** 当前可用动画列表 */
  animationNames: string[];
  /** 是否在 manifest 中找到该角色 */
  found: boolean;
  /** HUD 肖像数据（可选） */
  hudPortrait: PortraitEntry | undefined;
  /** 选人画面肖像数据（可选） */
  selectPortrait: PortraitEntry | undefined;
  /** VS 画面肖像数据（可选） */
  vsPortrait: PortraitEntry | undefined;
  /** 胜利画面肖像数据（可选） */
  winPortrait: PortraitEntry | undefined;
  /** 是否有真实像素肖像数据可用 */
  hasPixelPortrait: boolean;
}

/**
 * 获取角色渲染数据 — 渲染层的统一入口
 *
 * 根据 charId 查询 SPRITE_MANIFEST 和 PORTRAIT_MANIFEST，
 * 返回渲染所需的所有 manifest 数据。
 * 如果角色不在 manifest 中，返回默认 fallback 数据。
 *
 * @param charId 角色 ID（如 'kyo', 'iori', 'ryo'）
 * @returns CharacterRenderData
 */
export function getCharacterRenderData(charId: string): CharacterRenderData {
  const found = charId in SPRITE_MANIFEST.characters;

  const fallbackColors = getFallbackColors(SPRITE_MANIFEST, charId);
  const animationNames = getAnimationNames(SPRITE_MANIFEST, charId);
  const hudPortrait = getHUDPortrait(PORTRAIT_MANIFEST, charId);
  const selectPortrait = getSelectPortrait(PORTRAIT_MANIFEST, charId);
  const vsPortrait = getVSPortrait(PORTRAIT_MANIFEST, charId);
  const winPortrait = getWinPortrait(PORTRAIT_MANIFEST, charId);
  const pixelAvailable = hasPixelPortraitData(PORTRAIT_MANIFEST, charId);

  return {
    charId,
    fallbackColors,
    animationNames,
    found,
    hudPortrait,
    selectPortrait,
    vsPortrait,
    winPortrait,
    hasPixelPortrait: pixelAvailable,
  };
}

/**
 * 获取角色的 manifest fallbackColors 简写
 *
 * 供渲染器在需要快速获取颜色时使用，
 * 避免每次调用 getCharacterRenderData 获取完整数据。
 *
 * @param charId 角色 ID
 * @returns { body, head, outfit, hair } 颜色
 */
export function getCharacterColors(charId: string): { body: string; head: string; outfit: string; hair: string } {
  return getFallbackColors(SPRITE_MANIFEST, charId);
}

/**
 * 获取角色指定动画的帧信息（用于渲染尺寸计算）
 *
 * 返回帧数和首帧尺寸，供渲染器按比例绘制占位角色。
 *
 * @param charId 角色 ID
 * @param animName 动画名称（如 'idle', 'stand_a'）
 * @returns 动画帧数据，角色或动画不存在时返回 null
 */
export function getCharacterAnimFrameInfo(
  charId: string,
  animName: string,
): { frameCount: number; width: number; height: number; anchorX: number; anchorY: number } | null {
  const anim = getAnimation(SPRITE_MANIFEST, charId, animName);
  if (!anim || anim.frames.length === 0) return null;

  const firstFrame = anim.frames[0];
  return {
    frameCount: anim.frames.length,
    width: firstFrame.width,
    height: firstFrame.height,
    anchorX: firstFrame.anchor.x,
    anchorY: firstFrame.anchor.y,
  };
}

/**
 * 获取角色的 outfit 颜色用于占位渲染的 body/shirt
 *
 * 当渲染器需要从 manifest 获取角色服装色来替代 fighter.color 时使用。
 * 对于已定义 fallbackColors.outfit 的角色返回 outfit 色，
 * 否则返回 fighter.color 原始值。
 *
 * @param charId 角色 ID
 * @param fallback 如果 manifest 没有该角色，使用此颜色作为回退
 * @returns outfit 颜色字符串
 */
export function getOutfitColor(charId: string, fallback: string): string {
  const colors = getFallbackColors(SPRITE_MANIFEST, charId);
  return colors.outfit;
}

/**
 * 获取角色的 head/skin 颜色用于占位头部渲染
 *
 * @param charId 角色 ID
 * @returns head 颜色字符串
 */
export function getHeadColor(charId: string): string {
  return getFallbackColors(SPRITE_MANIFEST, charId).head;
}

/**
 * 获取角色的 hair 颜色用于占位头发渲染
 *
 * @param charId 角色 ID
 * @returns hair 颜色字符串
 */
export function getHairColor(charId: string): string {
  return getFallbackColors(SPRITE_MANIFEST, charId).hair;
}

// Re-export manifest instances for direct access in rendering code
export { SPRITE_MANIFEST, PORTRAIT_MANIFEST };
