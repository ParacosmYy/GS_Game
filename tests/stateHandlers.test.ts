import { describe, it, expect } from 'vitest';
import { fwdJP, backJP, dblFwd, dblBack, upReleased } from '../src/entities/stateHandlers.js';
import type { FighterCtx } from '../src/entities/stateContext.js';
import type { ResolvedInput } from '../src/input/inputResolver.js';

function makeCtx(overrides: Record<string, any> = {}): FighterCtx {
  return {
    tickRef: { value: 0 },
    opponent: null,
    lastForwardTick: -999,
    lastBackTick: -999,
    prevForward: false,
    prevBack: false,
    prevDown: false,
    upHoldFrames: 0,
    upWasPressed: false,
    lastDownTick: -999,
    ...overrides,
  } as FighterCtx;
}

function makeInput(overrides: Record<string, any> = {}): ResolvedInput {
  return {
    forward: false,
    back: false,
    up: false,
    down: false,
    light: false,
    medium: false,
    heavy: false,
    ...overrides,
  } as ResolvedInput;
}

describe('stateHandlers pure helpers', () => {
  describe('fwdJP', () => {
    it('detects forward just-pressed', () => {
      expect(fwdJP(makeCtx({ prevForward: false }), makeInput({ forward: true }))).toBe(true);
    });
    it('returns false when forward held', () => {
      expect(fwdJP(makeCtx({ prevForward: true }), makeInput({ forward: true }))).toBe(false);
    });
    it('returns false when forward not pressed', () => {
      expect(fwdJP(makeCtx({ prevForward: false }), makeInput({ forward: false }))).toBe(false);
    });
  });

  describe('backJP', () => {
    it('detects back just-pressed', () => {
      expect(backJP(makeCtx({ prevBack: false }), makeInput({ back: true }))).toBe(true);
    });
    it('returns false when back held', () => {
      expect(backJP(makeCtx({ prevBack: true }), makeInput({ back: true }))).toBe(false);
    });
  });

  describe('dblFwd', () => {
    it('detects double tap within window', () => {
      const ctx = makeCtx({ prevForward: false, lastForwardTick: 5 });
      ctx.tickRef.value = 10;
      expect(dblFwd(ctx, makeInput({ forward: true }))).toBe(true);
    });
    it('rejects double tap outside window', () => {
      const ctx = makeCtx({ prevForward: false, lastForwardTick: 0 });
      ctx.tickRef.value = 100;
      expect(dblFwd(ctx, makeInput({ forward: true }))).toBe(false);
    });
    it('updates lastForwardTick', () => {
      const ctx = makeCtx({ prevForward: false, lastForwardTick: 5 });
      ctx.tickRef.value = 10;
      dblFwd(ctx, makeInput({ forward: true }));
      expect(ctx.lastForwardTick).toBe(10);
    });
  });

  describe('dblBack', () => {
    it('detects double tap back within window', () => {
      const ctx = makeCtx({ prevBack: false, lastBackTick: 5 });
      ctx.tickRef.value = 10;
      expect(dblBack(ctx, makeInput({ back: true }))).toBe(true);
    });
    it('updates lastBackTick', () => {
      const ctx = makeCtx({ prevBack: false, lastBackTick: 5 });
      ctx.tickRef.value = 10;
      dblBack(ctx, makeInput({ back: true }));
      expect(ctx.lastBackTick).toBe(10);
    });
    it('rejects when gap is zero', () => {
      const ctx = makeCtx({ prevBack: false, lastBackTick: 10 });
      ctx.tickRef.value = 10;
      expect(dblBack(ctx, makeInput({ back: true }))).toBe(false);
    });
  });

  describe('upReleased', () => {
    it('detects up released after hold', () => {
      expect(upReleased(makeCtx({ upWasPressed: true, upHoldFrames: 5 }), makeInput({ up: false }))).toBe(true);
    });
    it('returns false when up still held', () => {
      expect(upReleased(makeCtx({ upWasPressed: true, upHoldFrames: 5 }), makeInput({ up: true }))).toBe(false);
    });
    it('returns false when up never pressed', () => {
      expect(upReleased(makeCtx({ upWasPressed: false, upHoldFrames: 0 }), makeInput({ up: false }))).toBe(false);
    });
  });
});

describe('stateHandlers module exports', () => {
  it('exports all handler functions', async () => {
    const mod = await import('../src/entities/stateHandlers.js');
    expect(typeof mod.handleIdleWalk).toBe('function');
    expect(typeof mod.handleRun).toBe('function');
    expect(typeof mod.handleBackdash).toBe('function');
    expect(typeof mod.handleRoll).toBe('function');
    expect(typeof mod.handleHop).toBe('function');
    expect(typeof mod.handleJump).toBe('function');
    expect(typeof mod.handleCrouch).toBe('function');
    expect(typeof mod.handleAttack).toBe('function');
    expect(typeof mod.handleTaunt).toBe('function');
  });

  it('re-exports stun handlers', async () => {
    const mod = await import('../src/entities/stateHandlers.js');
    expect(typeof mod.handleBlock).toBe('function');
    expect(typeof mod.handleHitstun).toBe('function');
    expect(typeof mod.handleKnockdown).toBe('function');
    expect(typeof mod.handleGetup).toBe('function');
    expect(typeof mod.handleDizzy).toBe('function');
  });
});
