/**
 * Input Logger — 帧级输入录制/回放
 * 记录每帧 P1/P2 的 raw input，支持 dump JSON 和从 JSON 回放。
 * 用于确定性测试和 bug 复现。
 */
import type { RNGSnapshot } from './prng.js';
import type { PlayerInput } from './types.js';

export interface InputFrame {
  tick: number;
  p1: PlayerInput;
  p2: PlayerInput;
}

export interface InputLogMeta {
  rngSeed?: number;
  rngState?: number;
  label?: string;
  source?: 'live' | 'replay';
  round?: number;
  p1CharId?: string;
  p2CharId?: string;
  stageId?: string;
  teamMode?: boolean;
  trainingMode?: boolean;
}

export type RngSnapshot = RNGSnapshot;

interface InputLogDumpV1 {
  version: 1;
  frames: unknown[];
}

interface InputLogDumpV2 {
  version: 2;
  meta?: InputLogMeta;
  frames: unknown[];
}

const PLAYER_INPUT_KEYS: (keyof PlayerInput)[] = [
  'up',
  'down',
  'left',
  'right',
  'buttonA',
  'buttonB',
  'buttonC',
  'buttonD',
  'throwAttack',
  'start',
];

export class InputLogger {
  private frames: InputFrame[] = [];
  private meta: InputLogMeta = {};
  private maxFrames: number;

  constructor(maxFrames: number = 7200) {
    this.maxFrames = maxFrames; // 2分钟@60fps
  }

  /** 记录一帧输入 */
  record(tick: number, p1: PlayerInput, p2: PlayerInput): void {
    if (this.frames.length >= this.maxFrames) this.frames.shift();
    this.frames.push({
      tick,
      p1: { ...p1 },
      p2: { ...p2 },
    });
  }

  /** 附加回放/录制元数据，例如 RNG 快照 */
  setMeta(meta: InputLogMeta): void {
    this.meta = { ...meta };
  }

  /** 读取当前元数据快照 */
  getMeta(): InputLogMeta {
    return { ...this.meta };
  }

  /** 直接写入 RNG 快照，方便把输入日志和随机边界绑在一起 */
  setRngSnapshot(snapshot: RngSnapshot | null): void {
    if (!snapshot) {
      delete this.meta.rngState;
      return;
    }
    this.meta.rngState = snapshot.state;
  }

  /** 读取 RNG 快照，供回放层恢复随机边界 */
  getRngSnapshot(): RngSnapshot | null {
    return typeof this.meta.rngState === 'number' ? { state: this.meta.rngState } : null;
  }

  /** 导出为 JSON 字符串 */
  dump(): string {
    return JSON.stringify({ version: 2, meta: this.meta, frames: this.frames });
  }

  /** 从 JSON 字符串加载 */
  load(json: string): boolean {
    try {
      const data = JSON.parse(json);
      if (!data || typeof data !== 'object' || !Array.isArray((data as { frames?: unknown }).frames)) return false;

      const version = (data as { version?: unknown }).version;
      if (version !== 1 && version !== 2) return false;

      const rawFrames = (data as InputLogDumpV1 | InputLogDumpV2).frames;
      const frames: InputFrame[] = [];
      for (const rawFrame of rawFrames) {
        const frame = this.normalizeFrame(rawFrame);
        if (!frame) return false;
        frames.push(frame);
      }

      this.frames = frames;
      this.meta = version === 2 ? this.normalizeMeta((data as InputLogDumpV2).meta) : {};
      return true;
    } catch {
      return false;
    }
  }

  /** 获取指定 tick 的输入（回放用） */
  getFrame(tick: number): InputFrame | undefined {
    return this.frames.find(f => f.tick === tick);
  }

  /** 按索引获取 */
  getFrameByIndex(idx: number): InputFrame | undefined {
    return this.frames[idx];
  }

  get length(): number { return this.frames.length; }
  clear(): void {
    this.frames = [];
    this.meta = {};
  }

  private normalizeMeta(meta: InputLogMeta | undefined): InputLogMeta {
    if (!meta || typeof meta !== 'object') return {};

    const normalized: InputLogMeta = {};
    if (typeof meta.rngSeed === 'number' && Number.isFinite(meta.rngSeed)) {
      normalized.rngSeed = meta.rngSeed;
    }
    if (typeof meta.rngState === 'number' && Number.isFinite(meta.rngState)) {
      normalized.rngState = meta.rngState;
    }
    if (typeof meta.label === 'string') {
      normalized.label = meta.label;
    }
    if (meta.source === 'live' || meta.source === 'replay') {
      normalized.source = meta.source;
    }
    if (typeof meta.round === 'number' && Number.isFinite(meta.round)) {
      normalized.round = meta.round;
    }
    if (typeof meta.p1CharId === 'string') {
      normalized.p1CharId = meta.p1CharId;
    }
    if (typeof meta.p2CharId === 'string') {
      normalized.p2CharId = meta.p2CharId;
    }
    if (typeof meta.stageId === 'string') {
      normalized.stageId = meta.stageId;
    }
    if (typeof meta.teamMode === 'boolean') {
      normalized.teamMode = meta.teamMode;
    }
    if (typeof meta.trainingMode === 'boolean') {
      normalized.trainingMode = meta.trainingMode;
    }
    return normalized;
  }

  private normalizeFrame(rawFrame: unknown): InputFrame | null {
    if (!rawFrame || typeof rawFrame !== 'object') return null;
    const frame = rawFrame as Record<string, unknown>;
    if (typeof frame.tick !== 'number' || !Number.isFinite(frame.tick)) return null;

    const p1 = this.normalizePlayerInput(frame.p1);
    const p2 = this.normalizePlayerInput(frame.p2);
    if (!p1 || !p2) return null;

    return {
      tick: frame.tick,
      p1,
      p2,
    };
  }

  private normalizePlayerInput(rawInput: unknown): PlayerInput | null {
    if (!rawInput || typeof rawInput !== 'object') return null;
    const input = rawInput as Record<string, unknown>;

    for (const key of PLAYER_INPUT_KEYS) {
      if (typeof input[key] !== 'boolean') return null;
    }

    return {
      up: input.up as boolean,
      down: input.down as boolean,
      left: input.left as boolean,
      right: input.right as boolean,
      buttonA: input.buttonA as boolean,
      buttonB: input.buttonB as boolean,
      buttonC: input.buttonC as boolean,
      buttonD: input.buttonD as boolean,
      throwAttack: input.throwAttack as boolean,
      burst: typeof input.burst === 'boolean' ? input.burst as boolean : false,
      start: input.start as boolean,
    };
  }
}
