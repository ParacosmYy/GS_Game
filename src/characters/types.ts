/**
 * Character System — 角色定义接口
 *
 * 每个角色实现此接口，FighterController 通过此接口委托招式路由。
 * 加新角色 = 新建一个文件实现此接口，注册到 ROSTER 即可。
 */
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import type { Fighter } from '../entities/fighter.js';
import type { Projectile } from '../entities/projectile.js';
import {
  FighterState,
  AttackType,
} from '../core/types.js';

/** 角色定义 — 所有招式路由逻辑都在这里 */
export interface CharacterDefinition {
  // ── 元信息 ──
  id: string;
  name: string;
  nameCn: string;
  color: string;        // 角色主色
  accentColor: string;  // 辅色
  portrait: string;     // 选人界面图标

  // ── 招式路由 ──

  /**
   * 必杀技路由: 输入+指令缓冲 → 返回必杀技 AttackType 或 null
   * 在普通攻击之前检查，优先级高于普通技。
   */
  routeSpecial(
    input: ResolvedInput,
    cmdBuf: CommandBuffer,
    tick: number,
  ): AttackType | null;

  /**
   * 通常技路由: 按键+站姿+距离 → 返回 AttackType 或 null
   * 用于命令通常技(→+B 等)和近距离/远距离区分。
   * 返回 null 时走默认路由。
   */
  routeNormal(
    input: ResolvedInput,
    state: FighterState,
    isCloseRange: boolean,
  ): AttackType | null;

  /**
   * 连段取消路由: 在连段技的 recovery 期间检测派生输入
   * 返回 null = 无可用的连段取消
   */
  routeRekkaFollowup(
    input: ResolvedInput,
    cmdBuf: CommandBuffer,
    tick: number,
    currentAttack: AttackType,
  ): AttackType | null;

  /**
   * 攻击激活时的特殊效果 (发射飞行道具/升龙跳跃等)
   * 返回 true = 该帧已处理，不需要默认行为
   */
  onAttackActive(
    fighter: Fighter,
    attackType: AttackType,
    projectiles: Projectile[],
    playerIndex: number,
  ): boolean;

  /** 获取该角色的连段类型 (用于跟踪连段状态) */
  getRekkaChain(attackType: AttackType): 'aragami' | 'dokugami' | 'aoihana' | null;
}
