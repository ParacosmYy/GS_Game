/**
 * ReplaySession — 对局复现封装
 *
 * 负责把对局元数据、RNG 边界和输入日志绑成一个可导出的工件。
 */
import { getGameRngSnapshot, resetGameRng } from './prng.js';
import type { InputLogMeta, InputLogger } from './inputLog.js';

export interface ReplaySessionOptions {
  seed: number;
  label: string;
  round: number;
  p1CharId: string;
  p2CharId: string;
  stageId: string;
  teamMode: boolean;
  trainingMode: boolean;
}

export class ReplaySession {
  private readonly inputLog: InputLogger;

  constructor(inputLog: InputLogger) {
    this.inputLog = inputLog;
  }

  beginLiveMatch(options: ReplaySessionOptions): void {
    resetGameRng(options.seed);
    this.inputLog.clear();

    const rngSnapshot = getGameRngSnapshot();
    const meta: InputLogMeta = {
      rngSeed: options.seed,
      rngState: rngSnapshot.state,
      label: options.label,
      source: 'live',
      round: options.round,
      p1CharId: options.p1CharId,
      p2CharId: options.p2CharId,
      stageId: options.stageId,
      teamMode: options.teamMode,
      trainingMode: options.trainingMode,
    };

    this.inputLog.setMeta(meta);
    this.inputLog.setRngSnapshot(rngSnapshot);
  }

  exportBundle(): string {
    return this.inputLog.dump();
  }
}
