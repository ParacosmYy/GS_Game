/**
 * Tests for FighterCtx interface contract and dependent state handler utilities
 */
import { describe, it, expect } from 'vitest';
import type { FighterCtx } from '../src/entities/stateContext.js';
import {
  fwdJP, backJP, dblFwd, dblBack,
  upReleased, hyperJump, closeRange,
} from '../src/entities/stateHandlers.js';
import { FighterState } from '../src/core/types.js';

// ─── Minimal mock factories ───

function makeMockFighter(overrides: Partial<{ x: number; state: FighterState }> = {}) {
  return {
    x: overrides.x ?? 200,
    state: overrides.state ?? FighterState.IDLE,
    isGrounded: () => true,
  } as any;
}

function makeMockCtx(overrides: Partial<FighterCtx> = {}): FighterCtx {
  return {
    fighter: makeMockFighter(),
    playerIndex: 0,
    cmdBuf: {} as any,
    vfx: {} as any,
    projectiles: [],
    tickRef: { value: 0 },
    opponent: null,
    character: { stats: { closeRange: 48 } } as any,
    stats: {} as any,
    gauge: null,
    maxMode: null,
    rekkaWindow: 0,
    counterStanceTimer: 0,
    chargeDownFrames: 0,
    wasChargingDown: false,
    wakeupBuffer: null,
    cancelSpecialBuffer: null,
    recoveryRollRequested: false,
    prevForward: false,
    prevBack: false,
    prevDown: false,
    upHoldFrames: 0,
    upWasPressed: false,
    lastForwardTick: -999,
    lastBackTick: -999,
    lastDownTick: -999,
    ...overrides,
  } as FighterCtx;
}

function makeInput(overrides: Record<string, boolean> = {}): any {
  return {
    forward: false,
    back: false,
    up: false,
    down: false,
    buttonAPressed: false,
    buttonBPressed: false,
    buttonCPressed: false,
    buttonDPressed: false,
    ...overrides,
  };
}

// ─── Tests ───

describe('FighterCtx interface contract', () => {
  it('should have all required fields when constructed', () => {
    const ctx = makeMockCtx();
    expect(ctx.fighter).toBeDefined();
    expect(ctx.playerIndex).toBe(0);
    expect(ctx.cmdBuf).toBeDefined();
    expect(ctx.vfx).toBeDefined();
    expect(ctx.projectiles).toEqual([]);
    expect(ctx.tickRef).toEqual({ value: 0 });
    expect(ctx.opponent).toBeNull();
    expect(ctx.character).toBeDefined();
    expect(ctx.stats).toBeDefined();
    expect(ctx.gauge).toBeNull();
    expect(ctx.maxMode).toBeNull();
    expect(ctx.rekkaWindow).toBe(0);
    expect(ctx.counterStanceTimer).toBe(0);
    expect(ctx.chargeDownFrames).toBe(0);
    expect(ctx.wasChargingDown).toBe(false);
    expect(ctx.wakeupBuffer).toBeNull();
    expect(ctx.cancelSpecialBuffer).toBeNull();
    expect(ctx.recoveryRollRequested).toBe(false);
    expect(ctx.prevForward).toBe(false);
    expect(ctx.prevBack).toBe(false);
    expect(ctx.prevDown).toBe(false);
    expect(ctx.upHoldFrames).toBe(0);
    expect(ctx.upWasPressed).toBe(false);
    expect(ctx.lastForwardTick).toBe(-999);
    expect(ctx.lastBackTick).toBe(-999);
    expect(ctx.lastDownTick).toBe(-999);
  });

  it('tickRef is a mutable shared reference', () => {
    const tickRef = { value: 42 };
    const ctx = makeMockCtx({ tickRef } as any);
    expect(ctx.tickRef.value).toBe(42);
    tickRef.value = 100;
    expect(ctx.tickRef.value).toBe(100);
  });

  it('opponent can be set to a Fighter', () => {
    const opp = makeMockFighter({ x: 300 });
    const ctx = makeMockCtx({ opponent: opp } as any);
    expect(ctx.opponent).not.toBeNull();
    expect(ctx.opponent!.x).toBe(300);
  });
});

describe('fwdJP — forward just-pressed', () => {
  it('returns true when forward pressed and was not pressed before', () => {
    const ctx = makeMockCtx();
    expect(fwdJP(ctx, makeInput({ forward: true }))).toBe(true);
  });

  it('returns false when forward pressed but was already pressed', () => {
    const ctx = makeMockCtx({ prevForward: true } as any);
    expect(fwdJP(ctx, makeInput({ forward: true }))).toBe(false);
  });

  it('returns false when forward not pressed', () => {
    const ctx = makeMockCtx();
    expect(fwdJP(ctx, makeInput())).toBe(false);
  });
});

describe('backJP — back just-pressed', () => {
  it('returns true when back pressed and was not pressed before', () => {
    const ctx = makeMockCtx();
    expect(backJP(ctx, makeInput({ back: true }))).toBe(true);
  });

  it('returns false when back pressed but was already pressed', () => {
    const ctx = makeMockCtx({ prevBack: true } as any);
    expect(backJP(ctx, makeInput({ back: true }))).toBe(false);
  });
});

describe('dblFwd — double-tap forward', () => {
  it('returns false on first forward press', () => {
    const ctx = makeMockCtx();
    expect(dblFwd(ctx, makeInput({ forward: true }))).toBe(false);
  });

  it('returns true on second forward press within window', () => {
    const ctx = makeMockCtx({ lastForwardTick: 90 } as any);
    (ctx as any).tickRef = { value: 95 };
    expect(dblFwd(ctx, makeInput({ forward: true }))).toBe(true);
  });

  it('returns false on second forward press outside window', () => {
    const ctx = makeMockCtx({ lastForwardTick: 10 } as any);
    (ctx as any).tickRef = { value: 100 };
    expect(dblFwd(ctx, makeInput({ forward: true }))).toBe(false);
  });

  it('updates lastForwardTick side effect', () => {
    const ctx = makeMockCtx({ lastForwardTick: 10 } as any);
    (ctx as any).tickRef = { value: 50 };
    dblFwd(ctx, makeInput({ forward: true }));
    expect(ctx.lastForwardTick).toBe(50);
  });
});

describe('dblBack — double-tap back', () => {
  it('returns false on first back press', () => {
    const ctx = makeMockCtx();
    expect(dblBack(ctx, makeInput({ back: true }))).toBe(false);
  });

  it('returns true on second back press within window', () => {
    const ctx = makeMockCtx({ lastBackTick: 90 } as any);
    (ctx as any).tickRef = { value: 95 };
    expect(dblBack(ctx, makeInput({ back: true }))).toBe(true);
  });

  it('updates lastBackTick side effect', () => {
    const ctx = makeMockCtx({ lastBackTick: 10 } as any);
    (ctx as any).tickRef = { value: 55 };
    dblBack(ctx, makeInput({ back: true }));
    expect(ctx.lastBackTick).toBe(55);
  });
});

describe('upReleased', () => {
  it('returns true when up released after being pressed', () => {
    const ctx = makeMockCtx({ upWasPressed: true } as any);
    expect(upReleased(ctx, makeInput({ up: false }))).toBe(true);
  });

  it('returns false when up still held', () => {
    const ctx = makeMockCtx({ upWasPressed: true } as any);
    expect(upReleased(ctx, makeInput({ up: true }))).toBe(false);
  });

  it('returns false when up was never pressed', () => {
    const ctx = makeMockCtx();
    expect(upReleased(ctx, makeInput({ up: false }))).toBe(false);
  });
});

describe('hyperJump', () => {
  it('returns true when down was recently released within charge window', () => {
    const ctx = makeMockCtx({ lastDownTick: 90 } as any);
    (ctx as any).tickRef = { value: 95 };
    expect(hyperJump(ctx)).toBe(true);
  });

  it('returns false when down was released too long ago', () => {
    const ctx = makeMockCtx({ lastDownTick: 10 } as any);
    (ctx as any).tickRef = { value: 200 };
    expect(hyperJump(ctx)).toBe(false);
  });

  it('returns false when lastDownTick is in the future', () => {
    const ctx = makeMockCtx({ lastDownTick: 500 } as any);
    (ctx as any).tickRef = { value: 100 };
    expect(hyperJump(ctx)).toBe(false);
  });
});

describe('closeRange', () => {
  it('returns false when no opponent', () => {
    const ctx = makeMockCtx();
    expect(closeRange(ctx)).toBe(false);
  });

  it('returns true when opponent within close range', () => {
    const opp = makeMockFighter({ x: 220 });
    const ctx = makeMockCtx({
      fighter: makeMockFighter({ x: 200 }),
      opponent: opp,
    } as any);
    expect(closeRange(ctx)).toBe(true);
  });

  it('returns false when opponent beyond close range', () => {
    const opp = makeMockFighter({ x: 500 });
    const ctx = makeMockCtx({
      fighter: makeMockFighter({ x: 200 }),
      opponent: opp,
    } as any);
    expect(closeRange(ctx)).toBe(false);
  });
});
