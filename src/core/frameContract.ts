/**
 * Frame Contract — 动作帧合约类型系统
 *
 * 定义每个动作帧的完整数据契约：视觉、判定、事件、取消窗口。
 * 所有动作相关系统（combat、rendering、audio、vfx）围绕此合约对齐。
 *
 * 归属: core/ — 纯类型、纯数据、纯函数，不持有运行时状态
 */

import type { AttackType, FighterState, HitLevel, FrameBox } from './types.js';

// ===== 核心合约类型 =====

/** 单帧的视觉描述 */
export interface FrameSpriteRef {
  /** 视觉资产引用 (atlas 区域名或 pixelFrame key) */
  spriteRef: string;
  /** 帧锚点 (角色中心底部为原点) */
  anchor: { x: number; y: number };
  /** 视觉偏移 (相对 anchor 的额外位移) */
  offset: { x: number; y: number };
  /** 帧持续时间 (ticks) */
  duration: number;
}

/** 单帧的判定描述 */
export interface FrameCollision {
  /** 攻击判定框 (null = 无攻击判定) */
  hitboxes: FrameBox[];
  /** 受击判定框覆盖 (null = 使用默认 hurtbox) */
  hurtboxOverride: FrameBox | null;
  /** 投技判定框 */
  throwBoxes: FrameBox[];
}

/** 帧上触发的事件标签 */
export type FrameEventTag =
  | 'footstep'      // 脚步声
  | 'swing'         // 挥拳/挥脚音效
  | 'hit'           // 命中时触发
  | 'land'          // 落地
  | 'super_flash'   // DM/SDM 超级闪光
  | 'vfx_spawn'     // 特效生成
  | 'cancel_point'  // 取消点
  | 'chain_point'   // 连段点 (rekka 等)
  | 'sound';        // 通用音效

/** 单帧的完整合约 */
export interface FrameContract {
  /** 角色ID */
  characterId: string;
  /** 动作ID (对应 FighterState 或 AttackType) */
  actionId: string;
  /** 帧索引 (0-based) */
  frameIndex: number;
  /** 视觉描述 */
  sprite: FrameSpriteRef;
  /** 判定描述 (null = 此帧无判定) */
  collision: FrameCollision | null;
  /** 事件标签 */
  eventTags: FrameEventTag[];
}

// ===== 动作级合约 =====

/** 攻击阶段划分 */
export type AttackPhase = 'startup' | 'active' | 'recovery';

/** 取消窗口定义 */
export interface CancelWindow {
  /** 允许取消的帧范围 [startFrame, endFrame] (inclusive) */
  frames: [number, number];
  /** 可取消到的攻击类型列表 ('special'=必杀, 'super'=DM/SDM, 'normal'=通常技, 'command'=命令通常技, 'any'=任意) */
  targetTypes: ('special' | 'super' | 'normal' | 'command' | 'any')[];
  /** 是否需要命中才能取消 */
  requiresHit: boolean;
  /** MAX 模式专用取消 */
  maxOnly: boolean;
}

/** 单个动作的完整帧合约 */
export interface ActionContract {
  /** 角色ID */
  characterId: string;
  /** 动作ID */
  actionId: string;
  /** 关联的 FighterState */
  state: FighterState;
  /** 关联的 AttackType (null 表示非攻击动作) */
  attackType: AttackType | null;
  /** 帧序列 */
  frames: FrameContract[];
  /** 命中等级 */
  hitLevel: HitLevel;
  /** 是否击倒 */
  knockdown: boolean;
  /** startup 帧数 */
  startup: number;
  /** active 帧数 */
  active: number;
  /** recovery 帧数 */
  recovery: number;
  /** 总帧数 */
  totalFrames: number;
  /** 取消窗口列表 */
  cancelWindows: CancelWindow[];
  /** 反馈档位覆盖 (null = 使用自动推断) */
  feedbackTierOverride: string | null;
}

// ===== 角色合约 manifest =====

/** 角色的所有动作合约 */
export interface CharacterFrameContract {
  characterId: string;
  actions: Map<string, ActionContract>;
}

/** 全局帧合约 manifest */
export interface FrameContractManifest {
  version: number;
  characters: Map<string, CharacterFrameContract>;
}

// ===== 查询函数 =====

/**
 * 获取动作的帧合约
 */
export function getActionContract(
  manifest: FrameContractManifest,
  characterId: string,
  actionId: string,
): ActionContract | null {
  const char = manifest.characters.get(characterId);
  if (!char) return null;
  return char.actions.get(actionId) ?? null;
}

/**
 * 获取角色所有动作ID
 */
export function getActionIds(
  manifest: FrameContractManifest,
  characterId: string,
): string[] {
  const char = manifest.characters.get(characterId);
  if (!char) return [];
  return [...char.actions.keys()];
}

/**
 * 检查某帧是否在取消窗口内
 */
export function isCancelPoint(
  contract: ActionContract,
  frameIndex: number,
  hitConfirmed: boolean,
  inMaxMode: boolean,
): CancelWindow | null {
  for (const cw of contract.cancelWindows) {
    if (frameIndex < cw.frames[0] || frameIndex > cw.frames[1]) continue;
    if (cw.maxOnly && !inMaxMode) continue;
    if (cw.requiresHit && !hitConfirmed) continue;
    return cw;
  }
  return null;
}

/**
 * 获取某帧的事件标签
 */
export function getFrameEvents(
  contract: ActionContract,
  frameIndex: number,
): FrameEventTag[] {
  if (frameIndex < 0 || frameIndex >= contract.frames.length) return [];
  return contract.frames[frameIndex].eventTags;
}

/**
 * 获取某帧的判定数据
 */
export function getFrameCollision(
  contract: ActionContract,
  frameIndex: number,
): FrameCollision | null {
  if (frameIndex < 0 || frameIndex >= contract.frames.length) return null;
  return contract.frames[frameIndex].collision;
}

/**
 * 验证动作合约与 FRAME_DATA 的对齐
 */
export function validateActionAlignment(
  contract: ActionContract,
  frameDataStartup: number,
  frameDataActive: number,
  frameDataRecovery: number,
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (contract.startup !== frameDataStartup) {
    issues.push(`startup mismatch: contract=${contract.startup} frameData=${frameDataStartup}`);
  }
  if (contract.active !== frameDataActive) {
    issues.push(`active mismatch: contract=${contract.active} frameData=${frameDataActive}`);
  }
  if (contract.recovery !== frameDataRecovery) {
    issues.push(`recovery mismatch: contract=${contract.recovery} frameData=${frameDataRecovery}`);
  }
  const expectedTotal = frameDataStartup + frameDataActive + frameDataRecovery;
  if (contract.totalFrames !== expectedTotal) {
    issues.push(`totalFrames mismatch: contract=${contract.totalFrames} expected=${expectedTotal}`);
  }
  if (contract.frames.length !== expectedTotal) {
    issues.push(`frame count mismatch: frames=${contract.frames.length} expected=${expectedTotal}`);
  }
  return { valid: issues.length === 0, issues };
}

// ===== Shared Builder Helpers =====
// Extracted from per-character *FrameContract.ts to avoid identical makeFrames/makeAttackFrames
// duplication across Ryo/Kyo/Iori (and future characters).

/** Shared config for building per-character frame contracts */
export interface FrameBuilderConfig {
  characterId: string;
  pixelKeys: Record<string, string>;
  tpf: Record<string, number>;
}

/** Build non-attack animation frames using shared config */
export function makeFrames(
  cfg: FrameBuilderConfig,
  actionId: string,
  count: number,
): FrameContract[] {
  const pixelKey = cfg.pixelKeys[actionId] ?? 'IDLE';
  const tpf = cfg.tpf[pixelKey] ?? 8;
  return Array.from({ length: count }, (_, i) => ({
    characterId: cfg.characterId,
    actionId,
    frameIndex: i,
    sprite: { spriteRef: `${pixelKey}:${i}`, anchor: { x: 48, y: 144 }, offset: { x: 0, y: 0 }, duration: tpf },
    collision: null,
    eventTags: [] as FrameEventTag[],
  }));
}

/**
 * Build attack frames with real per-frame hitbox data from ATTACK_FRAMES.
 * Startup/recovery frames have collision=null. Active-phase frames get hitboxes from the data table.
 */
export function makeAttackFrames(
  cfg: FrameBuilderConfig,
  actionId: string,
  startup: number,
  active: number,
  recovery: number,
  attackType: AttackType,
  attackFramesTable: Partial<Record<AttackType, { attack: FrameBox[]; bodyOverride: FrameBox | null; throwBoxes?: FrameBox[] }[]>>,
): FrameContract[] {
  const total = startup + active + recovery;
  const frames = makeFrames(cfg, actionId, total);

  const attackFrameData = attackFramesTable[attackType];

  for (let i = 0; i < active; i++) {
    const frameIndex = startup + i;
    const perFrame = attackFrameData?.[i];

    frames[frameIndex].collision = {
      hitboxes: perFrame?.attack ?? [],
      hurtboxOverride: perFrame?.bodyOverride ?? null,
      throwBoxes: perFrame?.throwBoxes ?? [],
    };
    frames[frameIndex].eventTags.push('swing');
  }
  return frames;
}
