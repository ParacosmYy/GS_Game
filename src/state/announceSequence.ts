/**
 * AnnounceSequence — 回合过渡播报序列的数据驱动状态机
 * 管理回合过渡中的文字动画序列（ROUND X → FIGHT! → K.O. 等）
 *
 * 纯状态机，不依赖任何 Canvas / DOM / Audio API。
 * 渲染层通过 getCurrentRender() 读取当前帧数据，通过 tick() 返回值获知音效触发。
 */

/** 单个播报步骤的动画参数 */
export interface AnnounceStep {
  id: string;
  /** 显示的文字 */
  text: string;
  /** 持续帧数 */
  duration: number;
  /** 文字颜色 */
  fillColor: string;
  /** 发光颜色 */
  glowColor: string;
  /** 基础字号 */
  fontSize: number;
  /** 缩放曲线：0→1 progress 返回 scale 倍率 */
  scaleCurve: (progress: number) => number;
  /** 透明度曲线：0→1 progress 返回 alpha */
  alphaCurve: (progress: number) => number;
  /** 在此步骤的第 N 帧触发音效 */
  sfxTriggerFrame: number | null;
  /** 音效标识 */
  sfxId: string | null;
  /** 全屏闪光 */
  flash: { color: string; alpha: number; frames: number } | null;
  /** 冲击波环数量 */
  shockwaveRings: number;
}

export type SequencePhase = 'idle' | 'running' | 'complete';

export class AnnounceSequence {
  private steps: AnnounceStep[] = [];
  private currentStepIndex = 0;
  private stepFrame = 0;
  private phase: SequencePhase = 'idle';
  private triggeredSfx: Set<number> = new Set();

  /** 设置播报步骤并启动序列 */
  setSteps(steps: AnnounceStep[]): void {
    this.steps = steps;
    this.currentStepIndex = 0;
    this.stepFrame = 0;
    this.phase = 'running';
    this.triggeredSfx.clear();
  }

  /**
   * 每帧调用。推进内部帧计数，返回需要触发的 sfxId（如果有）。
   * 调用方负责将 sfxId 映射到实际音频播放。
   */
  tick(): string | null {
    if (this.phase !== 'running') return null;
    if (this.currentStepIndex >= this.steps.length) {
      this.phase = 'complete';
      return null;
    }

    const step = this.steps[this.currentStepIndex];
    let sfxToPlay: string | null = null;

    if (
      step.sfxTriggerFrame !== null &&
      step.sfxId !== null &&
      this.stepFrame === step.sfxTriggerFrame &&
      !this.triggeredSfx.has(this.currentStepIndex)
    ) {
      sfxToPlay = step.sfxId;
      this.triggeredSfx.add(this.currentStepIndex);
    }

    this.stepFrame++;

    if (this.stepFrame >= step.duration) {
      this.currentStepIndex++;
      this.stepFrame = 0;
      if (this.currentStepIndex >= this.steps.length) {
        this.phase = 'complete';
      }
    }

    return sfxToPlay;
  }

  /** 返回当前步骤及其进度 0→1，供渲染层使用 */
  getCurrentRender(): { step: AnnounceStep; progress: number } | null {
    if (this.phase !== 'running' || this.currentStepIndex >= this.steps.length) {
      return null;
    }
    const step = this.steps[this.currentStepIndex];
    return { step, progress: this.stepFrame / step.duration };
  }

  /** 获取当前显示文字 */
  getText(): string {
    if (this.phase !== 'running' || this.currentStepIndex >= this.steps.length) {
      return '';
    }
    return this.steps[this.currentStepIndex].text;
  }

  getPhase(): SequencePhase {
    return this.phase;
  }

  isComplete(): boolean {
    return this.phase === 'complete';
  }

  isRunning(): boolean {
    return this.phase === 'running';
  }

  reset(): void {
    this.currentStepIndex = 0;
    this.stepFrame = 0;
    this.phase = 'idle';
    this.triggeredSfx.clear();
  }
}
