/**
 * Engine — 核心引擎接口
 *
 * 定义子系统生命周期接口，GameEngine 通过这些接口管理所有子系统。
 */

/** 逻辑更新子系统 */
export interface ISubsystem {
  /** 每个逻辑帧调用 */
  update(): void;
}

/** 渲染子系统 */
export interface IRenderSubsystem {
  /** 每帧渲染调用 */
  render(): void;
}

/** 游戏阶段处理器 — 每个阶段实现此接口 */
export interface IPhaseHandler {
  /** 阶段进入时调用 */
  onEnter?(): void;
  /** 每逻辑帧更新 */
  update(): void;
  /** 每帧渲染 */
  render(): void;
  /** 阶段退出时调用 */
  onExit?(): void;
}
