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
import type { PixelPortraitData } from '../rendering/pixelPortraits.js';

// ===== 骨骼动画系统 (Skeletal Pose System) =====

/** 单个骨骼部位的位置偏移和旋转 */
export interface BonePose {
  /** 相对于身体中心的 X 偏移 (正=前) */
  ox: number;
  /** 相对于身体顶部的 Y 偏移 (正=下) */
  oy: number;
  /** 旋转角度 (弧度, 正=顺时针) */
  rot: number;
  /** 缩放 (1.0 = 正常) */
  scale: number;
}

/** 一个完整的角色姿态 — 6个骨骼部位 */
export interface Pose {
  /** 头部 */
  head: BonePose;
  /** 身体/躯干 */
  body: BonePose;
  /** 前臂 (面朝方向的手) */
  armFront: BonePose;
  /** 后臂 */
  armBack: BonePose;
  /** 前腿 */
  legFront: BonePose;
  /** 后腿 */
  legBack: BonePose;
}

/** 骨骼部位名称 */
export type BoneName = keyof Pose;

/** 完整的角色姿态库 — 每个 FighterState 对应一个 Pose 或 Pose[] 动画序列 */
export type PoseSet = Partial<Record<FighterState, Pose | Pose[]>>;

/** 创建 BonePose 的辅助函数 */
export function bone(ox: number, oy: number, rot: number = 0, scale: number = 1): BonePose {
  return { ox, oy, rot, scale };
}

/** 创建 Pose 的辅助函数 — 只指定与默认不同的部位 */
export function pose(overrides: Partial<Pose> = {}): Pose {
  const defaults: Pose = {
    head: bone(0, 0),
    body: bone(0, 0),
    armFront: bone(8, 15, 0.2),
    armBack: bone(-5, 15, -0.3),
    legFront: bone(4, 0, 0),
    legBack: bone(-4, 0, 0),
  };
  return { ...defaults, ...overrides };
}

// ===== 角色数值定义 =====

/** 角色差异化数值 — 每个角色的移动/生命等基础参数 */
export interface CharacterStats {
  walkSpeed: number;         // 步行速度 (default: 4)
  runSpeed: number;          // 跑步速度 (default: 7)
  jumpVelocity: number;      // 普通跳垂直初速 (default: -14)
  hopVelocity: number;       // 小跳垂直初速 (default: -10)
  hyperJumpVelocity: number; // 大跳垂直初速 (default: -17)
  maxHealth: number;         // 最大生命值 (default: 1000)
  pushWidth: number;         // 推挤碰撞宽度 (default: 60)
  jumpForwardSpeed: number;  // 跳跃水平速度 (default: 5)
}

// ===== 角色定义接口 =====

/** 角色定义 — 所有招式路由逻辑都在这里 */
export interface CharacterDefinition {
  // ── 元信息 ──
  id: string;
  name: string;
  nameCn: string;
  color: string;        // 角色主色
  accentColor: string;  // 辅色
  specialColor: string;  // 必杀技特效色 (火/气/光)
  specialGlow: string;   // 必杀技光晕色
  portrait: string;     // 选人界面图标
  pixelPortrait?: PixelPortraitData; // SNK-style pixel portrait for character select

  // ── 数值 ──
  /** 角色差异化数值 (速度/生命/碰撞) */
  stats: CharacterStats;

  // ── 骨骼动画 ──
  /** 角色姿态库: FighterState → Pose 映射 */
  poses: PoseSet;

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
