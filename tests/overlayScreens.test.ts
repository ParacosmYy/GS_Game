import { describe, it, expect } from 'vitest';
import { getSuperFlashZoom, updateSuperFlashZoom, GAME_OVER_DURATION } from '../src/rendering/overlayScreens.js';
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
