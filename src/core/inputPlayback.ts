/**
 * InputPlayback — 帧级输入回放器
 *
 * 从 InputRecorder 或 RecordedInput[] 读取录制数据，
 * 按 tick 顺序回放 P1/P2 输入。
 *
 * 设计约束：
 * - 不修改战斗或渲染逻辑，只提供输入数据。
 * - playback tick 与录制 tick 精确对应。
 * - 未录制的 tick 返回 null（调用者应自行决定如何处理）。
 * - 支持从 InputRecorder.getSnapshots() 直接加载，避免序列化开销。
 */
import type { PlayerInput } from './types.js';
import type { RecordedInput } from './inputRecorder.js';

/** 内部 tick 快照格式（与 InputRecorder 一致） */
interface TickSnapshot {
  tick: number;
  p1: PlayerInput;
  p2: PlayerInput;
}

export class InputPlayback {
  private snapshots: TickSnapshot[] = [];
  private playbackIndex = 0;
  private isPlaying = false;
  private startTick = 0;
  private tickMap: Map<number, number> = new Map();

  /**
   * 从 RecordedInput[] 加载录制数据。
   */
  load(recording: RecordedInput[]): void {
    this.stop();

    // 将 RecordedInput[] 合并为 TickSnapshot[]
    const byTick = new Map<number, TickSnapshot>();

    for (const entry of recording) {
      let snap = byTick.get(entry.tick);
      if (!snap) {
        snap = {
          tick: entry.tick,
          p1: this.neutralInput(),
          p2: this.neutralInput(),
        };
        byTick.set(entry.tick, snap);
      }
      if (entry.player === 1) {
        snap.p1 = { ...entry.input };
      } else {
        snap.p2 = { ...entry.input };
      }
    }

    // 按 tick 排序
    this.snapshots = Array.from(byTick.values()).sort((a, b) => a.tick - b.tick);
    this.buildTickMap();
  }

  /**
   * 从 TickSnapshot[] 直接加载（避免 RecordedInput 转换开销）。
   */
  loadSnapshots(snapshots: TickSnapshot[]): void {
    this.stop();
    this.snapshots = snapshots.map(s => ({
      tick: s.tick,
      p1: { ...s.p1 },
      p2: { ...s.p2 },
    }));
    this.buildTickMap();
  }

  /**
   * 开始回放。
   * @param tick 当前 tick，作为回放起点（通常从 0 开始）。
   */
  start(tick: number): void {
    this.startTick = tick;
    this.playbackIndex = 0;
    this.isPlaying = true;
  }

  /**
   * 获取指定 tick 的指定玩家输入。
   * @returns 输入数据，如果该 tick 未录制或回放已结束则返回 null。
   */
  getInput(tick: number, player: 1 | 2): PlayerInput | null {
    if (!this.isPlaying) return null;

    const mapIndex = this.tickMap.get(tick);
    if (mapIndex === undefined) return null;

    const snap = this.snapshots[mapIndex];
    if (!snap) return null;

    return player === 1 ? { ...snap.p1 } : { ...snap.p2 };
  }

  /**
   * 获取指定 tick 的 P1+P2 输入。
   * @returns [p1, p2] 元组，如果该 tick 未录制则返回 null。
   */
  getFrame(tick: number): [PlayerInput, PlayerInput] | null {
    if (!this.isPlaying) return null;

    const mapIndex = this.tickMap.get(tick);
    if (mapIndex === undefined) return null;

    const snap = this.snapshots[mapIndex];
    if (!snap) return null;

    return [{ ...snap.p1 }, { ...snap.p2 }];
  }

  /**
   * 是否已回放完毕（所有录制帧都已超过）。
   */
  isFinished(): boolean {
    if (!this.isPlaying) return true;
    return this.playbackIndex >= this.snapshots.length;
  }

  /**
   * 停止回放。
   */
  stop(): void {
    this.isPlaying = false;
    this.playbackIndex = 0;
    this.startTick = 0;
  }

  /** 当前是否正在回放 */
  get active(): boolean {
    return this.isPlaying;
  }

  /** 录制中的总帧数 */
  get frameCount(): number {
    return this.snapshots.length;
  }

  /** 回放起始 tick */
  get startedFromTick(): number {
    return this.startTick;
  }

  /** 录制的 tick 范围 */
  get tickRange(): { first: number; last: number } | null {
    if (this.snapshots.length === 0) return null;
    return {
      first: this.snapshots[0].tick,
      last: this.snapshots[this.snapshots.length - 1].tick,
    };
  }

  // --- 内部方法 ---

  private buildTickMap(): void {
    this.tickMap.clear();
    for (let i = 0; i < this.snapshots.length; i++) {
      this.tickMap.set(this.snapshots[i].tick, i);
    }
  }

  private neutralInput(): PlayerInput {
    return {
      up: false, down: false, left: false, right: false,
      buttonA: false, buttonB: false, buttonC: false, buttonD: false,
      throwAttack: false, burst: false, start: false,
    };
  }
}
