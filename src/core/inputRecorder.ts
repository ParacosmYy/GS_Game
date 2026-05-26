/**
 * InputRecorder — 帧级输入录制器
 *
 * 在每个 tick 记录 P1/P2 的原始输入，用于回放和调试。
 * 与 InputLogger 互补：InputLogger 负责 dump/load + 元数据，
 * InputRecorder 提供更简洁的 start/record/stop API，
 * 适合直接嵌入游戏循环的录制流程。
 */
import type { PlayerInput } from './types.js';

/** 单帧录制数据 */
export interface RecordedInput {
  tick: number;
  player: 1 | 2;
  input: PlayerInput;
}

/**
 * 按 tick 索引的录制快照，用于快速查找。
 * 内部格式，不暴露给外部。
 */
interface TickSnapshot {
  tick: number;
  p1: PlayerInput;
  p2: PlayerInput;
}

export class InputRecorder {
  private snapshots: TickSnapshot[] = [];
  private isRecording = false;
  private startTick = 0;

  /**
   * 开始录制。
   * @param tick 当前 tick，用作录制起点。
   */
  start(tick: number): void {
    this.snapshots = [];
    this.startTick = tick;
    this.isRecording = true;
  }

  /**
   * 录制一帧输入。
   * 仅在 isRecording 为 true 时记录。
   */
  record(tick: number, player: 1 | 2, input: PlayerInput): void {
    if (!this.isRecording) return;

    // 检查是否已有该 tick 的 snapshot
    const last = this.snapshots[this.snapshots.length - 1];
    if (last && last.tick === tick) {
      // 更新现有 snapshot 中对应玩家的输入
      if (player === 1) {
        last.p1 = { ...input };
      } else {
        last.p2 = { ...input };
      }
      return;
    }

    // 新 tick：创建新 snapshot
    const snapshot: TickSnapshot = {
      tick,
      p1: player === 1 ? { ...input } : this.neutralInput(),
      p2: player === 2 ? { ...input } : this.neutralInput(),
    };
    this.snapshots.push(snapshot);
  }

  /**
   * 录制一帧的 P1+P2 输入（便捷方法，推荐在游戏循环中使用）。
   */
  recordFrame(tick: number, p1: PlayerInput, p2: PlayerInput): void {
    if (!this.isRecording) return;
    this.snapshots.push({ tick, p1: { ...p1 }, p2: { ...p2 } });
  }

  /**
   * 停止录制并返回录制数据。
   */
  stop(): RecordedInput[] {
    this.isRecording = false;
    return this.toRecordedInputs();
  }

  /**
   * 获取当前录制数据（不停止录制）。
   */
  getRecording(): RecordedInput[] {
    return this.toRecordedInputs();
  }

  /**
   * 获取内部 tick 快照数组（供 InputPlayback 直接消费，避免转换开销）。
   */
  getSnapshots(): TickSnapshot[] {
    return this.snapshots;
  }

  /** 当前是否正在录制 */
  get active(): boolean {
    return this.isRecording;
  }

  /** 录制的帧数 */
  get frameCount(): number {
    return this.snapshots.length;
  }

  /** 录制起始 tick */
  get recordedFromTick(): number {
    return this.startTick;
  }

  // --- 内部方法 ---

  private toRecordedInputs(): RecordedInput[] {
    const result: RecordedInput[] = [];
    for (const snap of this.snapshots) {
      result.push(
        { tick: snap.tick, player: 1, input: { ...snap.p1 } },
        { tick: snap.tick, player: 2, input: { ...snap.p2 } },
      );
    }
    return result;
  }

  private neutralInput(): PlayerInput {
    return {
      up: false, down: false, left: false, right: false,
      buttonA: false, buttonB: false, buttonC: false, buttonD: false,
      throwAttack: false, burst: false, start: false,
    };
  }
}
