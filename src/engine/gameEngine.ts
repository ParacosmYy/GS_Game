/**
 * GameEngine — 引擎编排器
 *
 * 管理子系统生命周期，驱动 update/render 循环。
 * 不包含任何游戏逻辑，只负责调度。
 */
import { GameLoop } from './gameLoop.js';
import type { ISubsystem, IRenderSubsystem } from './types.js';

export class GameEngine {
  private loop: GameLoop;
  private updateSubsystems: ISubsystem[] = [];
  private renderSubsystems: IRenderSubsystem[] = [];
  private globalUpdateFn: (() => void) | null = null;
  private globalRenderFn: (() => void) | null = null;

  constructor() {
    this.loop = new GameLoop(
      () => this.tick(),
      () => this.draw(),
    );
  }

  /** 注册逻辑更新子系统 */
  addSubsystem(sys: ISubsystem): void {
    this.updateSubsystems.push(sys);
  }

  /** 注册渲染子系统 */
  addRenderSubsystem(sys: IRenderSubsystem): void {
    this.renderSubsystems.push(sys);
  }

  /** 设置全局更新函数（游戏状态管理等） */
  setUpdateFn(fn: () => void): void {
    this.globalUpdateFn = fn;
  }

  /** 设置全局渲染函数 */
  setRenderFn(fn: () => void): void {
    this.globalRenderFn = fn;
  }

  /** 启动引擎 */
  start(): void {
    this.loop.start();
  }

  /** 停止引擎 */
  stop(): void {
    this.loop.stop();
  }

  private tick(): void {
    if (this.globalUpdateFn) this.globalUpdateFn();
    for (const sys of this.updateSubsystems) sys.update();
  }

  private draw(): void {
    if (this.globalRenderFn) this.globalRenderFn();
    for (const sys of this.renderSubsystems) sys.render();
  }
}
