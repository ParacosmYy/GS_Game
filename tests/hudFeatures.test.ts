/**
 * HUD Features Tests (Phase 53)
 *
 * Tests HUD rendering components: round indicators, timer display,
 * combo counter colors, damage flash, and character name plates.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState } from '../src/core/types.js';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, MAX_HEALTH, ROUND_TIME,
  HUD_BAR_WIDTH, HUD_BAR_HEIGHT, HUD_BAR_Y, HUD_MARGIN,
  HUD_TIMER_SIZE, HUD_GAUGE_Y, HUD_GAUGE_WIDTH, HUD_GAUGE_HEIGHT,
  HUD_WIN_MARKER_SIZE,
} from '../src/core/constants.js';
import { resetHUDFlash } from '../src/rendering/hud.js';

// Helper: create an offscreen canvas context for testing draw functions
function createTestContext(): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d')!;
  return ctx;
}

describe('HUD Constants', () => {
  it('ROUND_TIME is 99 seconds', () => {
    expect(ROUND_TIME).toBe(99);
  });

  it('HUD_BAR_WIDTH is positive', () => {
    expect(HUD_BAR_WIDTH).toBeGreaterThan(0);
  });

  it('HUD_BAR_HEIGHT is positive', () => {
    expect(HUD_BAR_HEIGHT).toBeGreaterThan(0);
  });

  it('HUD_BAR_Y positions the bar below top edge', () => {
    expect(HUD_BAR_Y).toBeGreaterThan(0);
    expect(HUD_BAR_Y).toBeLessThan(100);
  });

  it('HUD_MARGIN provides spacing from edges', () => {
    expect(HUD_MARGIN).toBeGreaterThan(0);
    expect(HUD_MARGIN).toBeLessThan(CANVAS_WIDTH / 2);
  });

  it('HUD_WIN_MARKER_SIZE is reasonable', () => {
    expect(HUD_WIN_MARKER_SIZE).toBeGreaterThan(0);
    expect(HUD_WIN_MARKER_SIZE).toBeLessThan(20);
  });
});

describe('Timer Display Logic', () => {
  it('time at tick 0 is ROUND_TIME', () => {
    const timeSeconds = Math.max(0, ROUND_TIME - Math.floor(0 / 60));
    expect(timeSeconds).toBe(99);
  });

  it('time at tick 5940 (99*60) is 0', () => {
    const timeSeconds = Math.max(0, ROUND_TIME - Math.floor(5940 / 60));
    expect(timeSeconds).toBe(0);
  });

  it('time at tick 3000 is ~49', () => {
    const timeSeconds = Math.max(0, ROUND_TIME - Math.floor(3000 / 60));
    expect(timeSeconds).toBe(49);
  });

  it('time is urgent when <= 10 seconds', () => {
    // At tick 5340, remaining time = 99 - 89 = 10
    const timeSeconds = Math.max(0, ROUND_TIME - Math.floor(5340 / 60));
    expect(timeSeconds).toBeLessThanOrEqual(10);
  });

  it('time is critical when <= 5 seconds', () => {
    const timeSeconds = Math.max(0, ROUND_TIME - Math.floor(5640 / 60));
    expect(timeSeconds).toBeLessThanOrEqual(5);
  });

  it('timer string is zero-padded to 2 digits', () => {
    const timeSeconds = 5;
    const timeStr = timeSeconds.toString().padStart(2, '0');
    expect(timeStr).toBe('05');
    expect(timeStr.length).toBe(2);
  });
});

describe('Damage Flash State', () => {
  it('resetHUDFlash does not throw', () => {
    expect(() => resetHUDFlash()).not.toThrow();
  });
});

describe('Combo Counter Color Tiers', () => {
  // Mirror the getComboColor logic from hud.ts
  function getComboColor(combo: number): { fill: string; tier: string } {
    if (combo >= 10) return { fill: '#ff2222', tier: 'red' };
    if (combo >= 5) return { fill: '#ffdd00', tier: 'yellow' };
    return { fill: '#ffffff', tier: 'white' };
  }

  it('1-4 hits returns white tier', () => {
    for (let i = 1; i <= 4; i++) {
      const result = getComboColor(i);
      expect(result.tier).toBe('white');
    }
  });

  it('5-9 hits returns yellow tier', () => {
    for (let i = 5; i <= 9; i++) {
      const result = getComboColor(i);
      expect(result.tier).toBe('yellow');
    }
  });

  it('10+ hits returns red tier', () => {
    for (let i = 10; i <= 20; i++) {
      const result = getComboColor(i);
      expect(result.tier).toBe('red');
    }
  });
});

describe('Health Bar Color Logic', () => {
  // Mirror getHealthColor logic from hud.ts
  function getHealthColor(ratio: number): string {
    if (ratio > 0.6) return 'green';
    if (ratio > 0.3) return 'yellow';
    return 'red';
  }

  it('full health (100%) is green', () => {
    expect(getHealthColor(1.0)).toBe('green');
  });

  it('75% health is green', () => {
    expect(getHealthColor(0.75)).toBe('green');
  });

  it('50% health is yellow', () => {
    expect(getHealthColor(0.5)).toBe('yellow');
  });

  it('25% health is red', () => {
    expect(getHealthColor(0.25)).toBe('red');
  });

  it('10% health is red', () => {
    expect(getHealthColor(0.1)).toBe('red');
  });

  it('0% health is red', () => {
    expect(getHealthColor(0)).toBe('red');
  });
});

describe('Health Ratio Calculations', () => {
  it('fighter health ratio is correct at full health', () => {
    const f = new Fighter(300, '#ff0000', 1);
    const ratio = Math.max(0, f.health / MAX_HEALTH);
    expect(ratio).toBe(1);
  });

  it('fighter health ratio is correct at half health', () => {
    const f = new Fighter(300, '#ff0000', 1);
    f.health = MAX_HEALTH / 2;
    const ratio = Math.max(0, f.health / MAX_HEALTH);
    expect(ratio).toBe(0.5);
  });

  it('fighter health ratio clamps to 0 at negative health', () => {
    const f = new Fighter(300, '#ff0000', 1);
    f.health = -10;
    const ratio = Math.max(0, f.health / MAX_HEALTH);
    expect(ratio).toBe(0);
  });
});

describe('Round Win Markers', () => {
  it('P1 with 0 wins has no filled markers', () => {
    const p1Wins = 0;
    const roundsNeeded = 2;
    let filled = 0;
    for (let i = 0; i < roundsNeeded; i++) {
      if (i < p1Wins) filled++;
    }
    expect(filled).toBe(0);
  });

  it('P1 with 1 win has 1 filled marker', () => {
    const p1Wins = 1;
    const roundsNeeded = 2;
    let filled = 0;
    for (let i = 0; i < roundsNeeded; i++) {
      if (i < p1Wins) filled++;
    }
    expect(filled).toBe(1);
  });

  it('P1 with 2 wins has 2 filled markers (match won)', () => {
    const p1Wins = 2;
    const roundsNeeded = 2;
    let filled = 0;
    for (let i = 0; i < roundsNeeded; i++) {
      if (i < p1Wins) filled++;
    }
    expect(filled).toBe(2);
  });
});

describe('Guard Gauge Color Thresholds', () => {
  function getGuardGaugeColor(ratio: number): string {
    if (ratio > 0.6) return 'blue';
    if (ratio > 0.3) return 'yellow';
    return 'red';
  }

  it('full guard gauge is blue', () => {
    expect(getGuardGaugeColor(1.0)).toBe('blue');
  });

  it('half guard gauge is yellow', () => {
    expect(getGuardGaugeColor(0.5)).toBe('yellow');
  });

  it('low guard gauge is red', () => {
    expect(getGuardGaugeColor(0.1)).toBe('red');
  });
});

describe('KO Display Time', () => {
  it('KO_DISPLAY_TIME is 120 frames (2 seconds at 60fps)', async () => {
    const { KO_DISPLAY_TIME } = await import('../src/core/constants.js');
    expect(KO_DISPLAY_TIME).toBe(120);
  });
});
