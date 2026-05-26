/**
 * Animation Manifest — 动画帧序列 manifest 类型定义与查询接口
 *
 * 定义角色动作的帧序列结构：每帧的 spritesheet 索引、持续时长、
 * 渲染偏移、hitbox 引用，以及序列级别的循环、取消、无敌信息。
 *
 * 与 spriteManifest 互补：
 * - spriteManifest: atlas 坐标、帧尺寸、锚点、fallback 颜色
 * - animationManifest: 帧序列逻辑、取消窗口、hitbox 链接、无敌帧
 *
 * 归属: core/ — 纯类型、纯函数，不持有运行时状态
 */

// ===== 类型定义 =====

/** 单个动画帧 */
export interface AnimFrame {
  /** 帧 spritesheet 索引 (对应 atlas 中的第 N 帧) */
  index: number;
  /** 显示持续游戏帧数 (@60fps) */
  duration: number;
  /** 渲染 X 偏移 (相对角色原点, 正值=前方) */
  offsetX: number;
  /** 渲染 Y 偏移 (相对角色原点, 正值=下方) */
  offsetY: number;
  /** 链接到 FRAME_DATA 条目的 key (该帧存在判定时设置) */
  hitboxKey?: string;
}

/** 动画序列 (如 "stand_A", "walk", "jump_up") */
export interface AnimSequence {
  /** 序列名称 (idle, walk_forward, stand_a, crouch_c, hitstun 等) */
  name: string;
  /** 帧序列 */
  frames: AnimFrame[];
  /** 是否循环 (idle/walk=true, attacks=false) */
  loop: boolean;
  /** 允许取消的帧索引列表 (0-based) */
  cancelFrames: number[];
  /** 拥有无敌的帧索引列表 (0-based) */
  invincibleFrames: number[];
}

/** 角色动画 manifest */
export interface CharacterAnimManifest {
  /** 角色 ID */
  charId: string;
  /** 所有动画序列, 按 action name 索引 */
  sequences: Record<string, AnimSequence>;
}

/** 全局动画 manifest */
export interface AnimationManifest {
  /** 版本号 */
  version: number;
  /** 所有角色 manifest */
  characters: Record<string, CharacterAnimManifest>;
}

// ===== 查询函数 =====

/**
 * 获取角色动画序列
 * @returns AnimSequence 或 undefined
 */
export function getSequence(
  manifest: AnimationManifest,
  charId: string,
  seqName: string,
): AnimSequence | undefined {
  return manifest.characters[charId]?.sequences[seqName];
}

/**
 * 获取角色所有序列名称
 */
export function getSequenceNames(manifest: AnimationManifest, charId: string): string[] {
  const char = manifest.characters[charId];
  if (!char) return [];
  return Object.keys(char.sequences);
}

/**
 * 检查角色是否拥有指定序列
 */
export function hasSequence(manifest: AnimationManifest, charId: string, seqName: string): boolean {
  return getSequence(manifest, charId, seqName) !== undefined;
}

/**
 * 获取序列总帧数
 */
export function getSequenceFrameCount(manifest: AnimationManifest, charId: string, seqName: string): number {
  const seq = getSequence(manifest, charId, seqName);
  if (!seq) return 0;
  return seq.frames.length;
}

/**
 * 获取序列总持续游戏帧数 (所有帧 duration 之和)
 */
export function getSequenceTotalDuration(manifest: AnimationManifest, charId: string, seqName: string): number {
  const seq = getSequence(manifest, charId, seqName);
  if (!seq) return 0;
  return seq.frames.reduce((sum, f) => sum + f.duration, 0);
}

/**
 * 获取 manifest 中所有角色 ID
 */
export function getAnimCharacterIds(manifest: AnimationManifest): string[] {
  return Object.keys(manifest.characters);
}

/**
 * 检查指定帧是否在取消窗口内
 */
export function isCancelFrame(
  manifest: AnimationManifest,
  charId: string,
  seqName: string,
  frameIndex: number,
): boolean {
  const seq = getSequence(manifest, charId, seqName);
  if (!seq) return false;
  return seq.cancelFrames.includes(frameIndex);
}

/**
 * 检查指定帧是否无敌
 */
export function isInvincibleFrame(
  manifest: AnimationManifest,
  charId: string,
  seqName: string,
  frameIndex: number,
): boolean {
  const seq = getSequence(manifest, charId, seqName);
  if (!seq) return false;
  return seq.invincibleFrames.includes(frameIndex);
}

/**
 * 获取序列中存在 hitbox 的所有帧
 */
export function getActiveFrames(
  manifest: AnimationManifest,
  charId: string,
  seqName: string,
): AnimFrame[] {
  const seq = getSequence(manifest, charId, seqName);
  if (!seq) return [];
  return seq.frames.filter(f => f.hitboxKey !== undefined);
}
