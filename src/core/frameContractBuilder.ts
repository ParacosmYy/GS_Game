/**
 * Frame Contract Builder — 运行时查询层
 *
 * 将 ActionContract 数据转换为运行时系统可消费的格式:
 * - combat: hitbox 查询、attack phase 判断
 * - rendering: spriteRef 解析、事件触发
 * - audio: eventTag 驱动音效
 *
 * 归属: core/ — 纯函数、无副作用、不持有状态
 */

import type {
  ActionContract,
  FrameContract,
  FrameCollision,
  FrameEventTag,
  AttackPhase,
} from './frameContract.js';

// ===== Tick-to-Frame Resolution =====

/**
 * 将游戏 tick 映射到帧索引。
 * 每帧有 duration (ticks)，逐帧累加直到找到当前 tick 落在哪一帧。
 *
 * @param action 动作合约
 * @param tick 从动作开始算起的 tick 数 (0-based)
 * @returns 帧索引 (0-based)，超出范围返回 frames.length - 1
 */
export function resolveFrameIndex(action: ActionContract, tick: number): number {
  if (tick < 0) return 0;
  let accumulated = 0;
  for (let i = 0; i < action.frames.length; i++) {
    accumulated += action.frames[i].sprite.duration;
    if (tick < accumulated) return i;
  }
  // tick 超出所有帧范围 → 返回最后一帧
  return Math.max(0, action.frames.length - 1);
}

// ===== Phase Resolution =====

/**
 * 获取当前帧所在的攻击阶段。
 * 基于 ActionContract 的 startup/active/recovery 划分。
 *
 * @param action 动作合约
 * @param frameIdx 动作内的绝对帧索引 (0-based)
 * @returns 攻击阶段 (非攻击动作返回 null)
 */
export function getCurrentPhase(
  action: ActionContract,
  frameIdx: number,
): AttackPhase | null {
  // 非攻击动作 (startup=0, active=0, recovery=0) 返回 null
  if (action.startup === 0 && action.active === 0 && action.recovery === 0) {
    return null;
  }

  if (frameIdx < 0) return 'startup';
  if (frameIdx < action.startup) return 'startup';
  if (frameIdx < action.startup + action.active) return 'active';
  return 'recovery';
}

// ===== Collision Queries =====

/**
 * 获取当前帧的有效 hitbox 列表。
 * 只有 active 阶段的帧才返回 hitbox。
 *
 * @param action 动作合约
 * @param frameIdx 帧索引
 * @returns hitbox FrameCollision 数组，无则空数组
 */
export function getEffectiveHitboxes(
  action: ActionContract,
  frameIdx: number,
): FrameCollision[] {
  const phase = getCurrentPhase(action, frameIdx);
  if (phase !== 'active') return [];

  const collision = getCollisionAtFrame(action, frameIdx);
  if (!collision) return [];

  // FrameCollision 本身包含 hitboxes 数组
  // 只有 hitboxes 非空的碰撞才视为有效
  if (collision.hitboxes.length > 0) {
    return [collision];
  }
  return [];
}

/**
 * 获取指定帧的原始碰撞数据。
 *
 * @param action 动作合约
 * @param frameIdx 帧索引
 * @returns FrameCollision 或 null
 */
export function getCollisionAtFrame(
  action: ActionContract,
  frameIdx: number,
): FrameCollision | null {
  if (frameIdx < 0 || frameIdx >= action.frames.length) return null;
  return action.frames[frameIdx].collision;
}

// ===== Event Queries =====

/**
 * 获取指定帧的事件标签。
 *
 * @param action 动作合约
 * @param frameIdx 帧索引
 * @returns FrameEventTag 数组
 */
export function getActiveEvents(
  action: ActionContract,
  frameIdx: number,
): FrameEventTag[] {
  if (frameIdx < 0 || frameIdx >= action.frames.length) return [];
  return action.frames[frameIdx].eventTags;
}

/**
 * 检查指定帧是否有特定的事件标签。
 */
export function hasEventTag(
  action: ActionContract,
  frameIdx: number,
  tag: FrameEventTag,
): boolean {
  return getActiveEvents(action, frameIdx).includes(tag);
}

// ===== Sprite Queries =====

/**
 * 获取指定帧的 spriteRef。
 * 用于渲染系统查找视觉资产。
 *
 * @param action 动作合约
 * @param frameIdx 帧索引
 * @returns spriteRef 字符串或 null
 */
export function getSpriteRef(
  action: ActionContract,
  frameIdx: number,
): string | null {
  if (frameIdx < 0 || frameIdx >= action.frames.length) return null;
  return action.frames[frameIdx].sprite.spriteRef;
}

/**
 * 获取指定帧的完整 FrameContract。
 */
export function getFrameAt(
  action: ActionContract,
  frameIdx: number,
): FrameContract | null {
  if (frameIdx < 0 || frameIdx >= action.frames.length) return null;
  return action.frames[frameIdx];
}

// ===== Contract Lookup =====

/**
 * 根据角色ID和攻击类型字符串查找 ActionContract。
 * 用于运行时从 fighter.currentAttack 映射到合约。
 *
 * @param characterContracts 角色的 action map (characterId -> actionId -> ActionContract)
 * @param characterId 角色ID
 * @param attackType 攻击类型字符串 (如 'STAND_A', 'CLOSE_C')
 * @returns ActionContract 或 null
 */
export function findActionContract(
  characterContracts: Map<string, Map<string, ActionContract>>,
  characterId: string,
  attackType: string,
): ActionContract | null {
  const charActions = characterContracts.get(characterId);
  if (!charActions) return null;
  return charActions.get(attackType) ?? null;
}

/**
 * 将 fighter 的 (attackPhase, attackFrame) 映射到合约的绝对帧索引。
 * Fighter 内部使用阶段内帧索引 (attackFrame 在 active 阶段从 0 开始)，
 * 而 ActionContract 使用绝对帧索引 (0 到 totalFrames-1)。
 *
 * @param action 动作合约
 * @param phase 当前攻击阶段 ('startup'|'active'|'recovery')
 * @param phaseFrame 阶段内帧索引 (0-based)
 * @returns 绝对帧索引
 */
export function phaseFrameToAbsolute(
  action: ActionContract,
  phase: 'startup' | 'active' | 'recovery',
  phaseFrame: number,
): number {
  switch (phase) {
    case 'startup':
      return phaseFrame;
    case 'active':
      return action.startup + phaseFrame;
    case 'recovery':
      return action.startup + action.active + phaseFrame;
  }
}
