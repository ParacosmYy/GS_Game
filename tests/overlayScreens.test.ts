import { describe, it, expect } from 'vitest';
import { getSuperFlashZoom, updateSuperFlashZoom, GAME_OVER_DURATION, drawTrainingHUD } from '../src/rendering/overlayScreens.js';
import type { RoundScoreBreakdown } from '../src/rendering/overlayScreens.js';

describe('overlayScreens', () => {
  it('getSuperFlashZoom returns number', () => {
    const z = getSuperFlashZoom();
    expect(typeof z).toBe('number');
  });
  it('default zoom is 1.0', () => {
    // After reset state (timer<=0 repeated calls)
    updateSuperFlashZoom(0, 10);
    updateSuperFlashZoom(0, 10);
    expect(getSuperFlashZoom()).toBe(1.0);
  });
  it('active timer increases zoom', () => {
    updateSuperFlashZoom(5, 10);
    const z = getSuperFlashZoom();
    expect(z).toBeGreaterThanOrEqual(1.0);
  });
  it('max progress caps at 1.08', () => {
    updateSuperFlashZoom(10, 10);
    const z = getSuperFlashZoom();
    expect(z).toBeLessThanOrEqual(1.09);
  });
  it('decay after timer ends approaches 1.0', () => {
    updateSuperFlashZoom(10, 10);
    for (let i = 0; i < 50; i++) updateSuperFlashZoom(0, 10);
    expect(getSuperFlashZoom()).toBeCloseTo(1.0, 2);
  });
});

describe('overlay constants', () => {
  it('GAME_OVER_DURATION is a positive number', () => {
    expect(GAME_OVER_DURATION).toBeGreaterThan(0);
  });
});

describe('RoundScoreBreakdown type', () => {
  it('can construct a valid breakdown', () => {
    const breakdown: RoundScoreBreakdown = {
      baseScore: 3000,
      hpBonus: 500,
      perfectBonus: 0,
      totalScore: 3500,
      isPerfect: false,
    };
    expect(breakdown.baseScore).toBe(3000);
    expect(breakdown.totalScore).toBe(3500);
    expect(breakdown.isPerfect).toBe(false);
  });

  it('perfect breakdown has correct total', () => {
    const breakdown: RoundScoreBreakdown = {
      baseScore: 3000,
      hpBonus: 1000,
      perfectBonus: 5000,
      totalScore: 9000,
      isPerfect: true,
    };
    expect(breakdown.baseScore + breakdown.hpBonus + breakdown.perfectBonus).toBe(breakdown.totalScore);
  });
});

describe('drawTrainingHUD with MAX/burst info', () => {
  function makeCtx() {
    const calls: string[] = [];
    const ctx = {
      save: () => { calls.push('save'); },
      restore: () => { calls.push('restore'); },
      fillRect: () => {},
      strokeRect: () => {},
      fillText: () => {},
      strokeText: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      stroke: () => {},
      fill: () => {},
      createLinearGradient: () => ({
        addColorStop: () => {},
      }),
      arc: () => {},
      rect: () => {},
      quadraticCurveTo: () => {},
      bezierCurveTo: () => {},
      set font(_f: string) {},
      get font() { return ''; },
      set textAlign(_a: string) {},
      get textAlign() { return 'left'; },
      set textBaseline(_b: string) {},
      get textBaseline() { return 'top'; },
      set fillStyle(_s: string | CanvasGradient) {},
      get fillStyle() { return '#000'; },
      set strokeStyle(_s: string | CanvasGradient) {},
      get strokeStyle() { return '#000'; },
      set lineWidth(_w: number) {},
      get lineWidth() { return 1; },
      set globalAlpha(_a: number) {},
      get globalAlpha() { return 1; },
      set shadowColor(_c: string) {},
      get shadowColor() { return ''; },
      set shadowBlur(_b: number) {},
      get shadowBlur() { return 0; },
      set shadowOffsetX(_x: number) {},
      get shadowOffsetX() { return 0; },
      set shadowOffsetY(_y: number) {},
      get shadowOffsetY() { return 0; },
      roundRect: () => {},
      measureText: () => ({ width: 40 }),
    } as unknown as CanvasRenderingContext2D;
    return { ctx, calls };
  }

  const training = {
    enabled: true,
    showMoveList: false,
    showInputHistory: false,
    showFrameData: false,
    inputHistory: [],
    lastFrameData: null,
    dummyBehavior: 'stand' as const,
    getDummyBehaviorLabel: () => 'STAND',
  };

  it('drawTrainingHUD renders without error', () => {
    const { ctx } = makeCtx();
    expect(() => drawTrainingHUD(ctx, training, 0, 0, 0)).not.toThrow();
  });

  it('drawTrainingHUD calls save/restore for each panel group', () => {
    const { ctx, calls } = makeCtx();
    drawTrainingHUD(ctx, training, 0, 0, 0);
    expect(calls.filter(c => c === 'save').length).toBeGreaterThanOrEqual(2);
    expect(calls.filter(c => c === 'restore').length).toBeGreaterThanOrEqual(2);
  });
});
