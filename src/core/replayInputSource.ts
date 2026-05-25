/**
 * ReplayInputSource — 只读回放输入源
 *
 * 把合法 replay bundle 转成按 tick 读取的 P1/P2 输入流。
 */
import type { InputFrame } from './inputLog.js';
import type { ReplayBundleV1 } from './replaySession.js';
import type { PlayerInput } from './types.js';

export interface ReplayInputFrame extends InputFrame {
  recorded: boolean;
}

export interface ReplayInputSource {
  readFrame(tick: number): ReplayInputFrame;
  isFinished(tick: number): boolean;
  getFrameCount(): number;
}

const NEUTRAL_INPUT: PlayerInput = {
  up: false,
  down: false,
  left: false,
  right: false,
  buttonA: false,
  buttonB: false,
  buttonC: false,
  buttonD: false,
  throwAttack: false,
  start: false,
};

/**
 * 从 replay bundle 创建只读输入源。
 */
export function createReplayInputSource(bundle: ReplayBundleV1): ReplayInputSource {
  const frames = normalizeFrames(bundle);
  const byTick = new Map<number, InputFrame>();
  let lastTick = -1;

  for (const frame of frames) {
    byTick.set(frame.tick, frame);
    lastTick = Math.max(lastTick, frame.tick);
  }

  return {
    readFrame(tick: number): ReplayInputFrame {
      const frame = byTick.get(tick);
      if (!frame) {
        return {
          tick,
          p1: cloneInput(NEUTRAL_INPUT),
          p2: cloneInput(NEUTRAL_INPUT),
          recorded: false,
        };
      }

      return {
        tick: frame.tick,
        p1: cloneInput(frame.p1),
        p2: cloneInput(frame.p2),
        recorded: true,
      };
    },

    isFinished(tick: number): boolean {
      return tick > lastTick;
    },

    getFrameCount(): number {
      return frames.length;
    },
  };
}

function normalizeFrames(bundle: ReplayBundleV1): InputFrame[] {
  if (!isReplayBundle(bundle)) {
    throw new Error('Invalid replay bundle');
  }

  const frames = bundle.inputLog.frames as InputFrame[];
  return frames.map(frame => ({
    tick: frame.tick,
    p1: cloneInput(frame.p1),
    p2: cloneInput(frame.p2),
  }));
}

function isReplayBundle(raw: unknown): raw is ReplayBundleV1 {
  if (!raw || typeof raw !== 'object') return false;
  const bundle = raw as Record<string, unknown>;
  if (bundle.version !== 1) return false;
  if (!bundle.match || typeof bundle.match !== 'object') return false;
  if (!bundle.rngSnapshot || typeof bundle.rngSnapshot !== 'object') return false;

  const inputLog = bundle.inputLog as { frames?: unknown } | undefined;
  if (!inputLog || typeof inputLog !== 'object' || !Array.isArray(inputLog.frames)) return false;

  return inputLog.frames.every(isInputFrame);
}

function isInputFrame(raw: unknown): raw is InputFrame {
  if (!raw || typeof raw !== 'object') return false;
  const frame = raw as Record<string, unknown>;
  return typeof frame.tick === 'number'
    && Number.isFinite(frame.tick)
    && isPlayerInput(frame.p1)
    && isPlayerInput(frame.p2);
}

function isPlayerInput(raw: unknown): raw is PlayerInput {
  if (!raw || typeof raw !== 'object') return false;
  const input = raw as Record<keyof PlayerInput, unknown>;
  return typeof input.up === 'boolean'
    && typeof input.down === 'boolean'
    && typeof input.left === 'boolean'
    && typeof input.right === 'boolean'
    && typeof input.buttonA === 'boolean'
    && typeof input.buttonB === 'boolean'
    && typeof input.buttonC === 'boolean'
    && typeof input.buttonD === 'boolean'
    && typeof input.throwAttack === 'boolean'
    && typeof input.start === 'boolean';
}

function cloneInput(input: PlayerInput): PlayerInput {
  return { ...input };
}
