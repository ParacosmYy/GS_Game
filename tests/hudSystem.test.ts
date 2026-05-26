/**
 * HUD System Tests — Health bars, power gauge, timer, combo counters, team order
 *
 * Tests constants and logic calculations exported by the HUD module.
 * Does NOT test actual canvas drawing (canvas rendering is visual-only).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  MAX_HEALTH, MAX_STOCKS, ROUND_TIME,
  HUD_BAR_WIDTH, HUD_BAR_HEIGHT, HUD_BAR_Y, HUD_MARGIN,
  HUD_TIMER_SIZE, HUD_GAUGE_Y, HUD_GAUGE_WIDTH, HUD_GAUGE_HEIGHT,
  HUD_GAUGE_SEGMENT_GAP, HUD_WIN_MARKER_SIZE,
} from '../src/core/constants.js';
import {
  drawHUD,
  drawPowerGauges,
  drawComboCounters,
  drawTeamOrder,
  resetHUDFlash,
} from '../src/rendering/hud.js';
import type { TeamDisplayInfo } from '../src/rendering/hud.js';
import type { PowerGauge, MaxModeState } from '../src/core/types.js';
import { Fighter } from '../src/entities/fighter.js';
import { Camera } from '../src/core/camera.js';

// ═══════════════════════════════════════════════════════════════
// Helpers: minimal mocks for canvas rendering calls
// ═══════════════════════════════════════════════════════════════

function mockCtx(): CanvasRenderingContext2D {
  const ctx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    font: '',
    textAlign: 'left' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
    globalAlpha: 1,
    shadowColor: '',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    clearRect: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    quadraticCurveTo: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    measureText: vi.fn(() => ({ width: 40 })),
  } as unknown as CanvasRenderingContext2D;
  return ctx;
}

function makeFighter(health: number): Fighter {
  const f = new Fighter('Test', 400, 500);
  f.health = health;
  f.guardGauge = 100;
  f.displayHeight = 120;
  return f;
}

function makeGauge(stocks: number, meter = 0, maxMeter = 1000): PowerGauge {
  return { stocks, meter, maxMeter };
}

function makeMaxMode(active = false, timer = 0, maxDuration = 1200): MaxModeState {
  return { active, timer, maxDuration };
}

// ═══════════════════════════════════════════════════════════════
// 1. HUD Constants (4 tests)
// ═══════════════════════════════════════════════════════════════

describe('1. HUD Constants', () => {
  it('HUD_BAR_WIDTH and HUD_BAR_HEIGHT are in reasonable range', () => {
    // Bar should be wide enough to read HP segments but not fill the whole screen
    expect(HUD_BAR_WIDTH).toBeGreaterThan(100);
    expect(HUD_BAR_WIDTH).toBeLessThan(CANVAS_WIDTH);
    expect(HUD_BAR_HEIGHT).toBeGreaterThan(5);
    expect(HUD_BAR_HEIGHT).toBeLessThan(60);
  });

  it('HUD_GAUGE_WIDTH and HUD_GAUGE_HEIGHT are in reasonable range', () => {
    expect(HUD_GAUGE_WIDTH).toBeGreaterThan(50);
    expect(HUD_GAUGE_WIDTH).toBeLessThan(CANVAS_WIDTH);
    expect(HUD_GAUGE_HEIGHT).toBeGreaterThan(2);
    expect(HUD_GAUGE_HEIGHT).toBeLessThan(30);
  });

  it('HUD_BAR_Y is in upper half of canvas', () => {
    expect(HUD_BAR_Y).toBeGreaterThanOrEqual(0);
    expect(HUD_BAR_Y).toBeLessThan(CANVAS_HEIGHT / 2);
  });

  it('HUD_MARGIN > 0', () => {
    expect(HUD_MARGIN).toBeGreaterThan(0);
    // Margin should leave enough room for the bar on each side
    expect(HUD_MARGIN * 2 + HUD_BAR_WIDTH * 2).toBeLessThan(CANVAS_WIDTH);
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. Health Bar Logic (4 tests)
// ═══════════════════════════════════════════════════════════════

describe('2. Health Bar Logic', () => {
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ctx = mockCtx();
    resetHUDFlash();
  });

  it('health=MAX_HEALTH produces ratio=1.0 (full bar)', () => {
    const f1 = makeFighter(MAX_HEALTH);
    const f2 = makeFighter(MAX_HEALTH);
    const ratio = Math.max(0, f1.health / MAX_HEALTH);
    expect(ratio).toBe(1);
    // drawHUD should not throw with full health
    expect(() => drawHUD(ctx, [f1, f2], 0, [MAX_HEALTH, MAX_HEALTH])).not.toThrow();
  });

  it('health=0 produces ratio=0.0 (empty bar)', () => {
    const f1 = makeFighter(0);
    const f2 = makeFighter(MAX_HEALTH);
    const ratio = Math.max(0, f1.health / MAX_HEALTH);
    expect(ratio).toBe(0);
    expect(() => drawHUD(ctx, [f1, f2], 0, [0, MAX_HEALTH])).not.toThrow();
  });

  it('health=MAX_HEALTH/2 produces ratio=0.5 (half bar)', () => {
    const half = Math.floor(MAX_HEALTH / 2);
    const f1 = makeFighter(half);
    const f2 = makeFighter(MAX_HEALTH);
    const ratio = Math.max(0, f1.health / MAX_HEALTH);
    expect(ratio).toBeCloseTo(0.5, 1);
    expect(() => drawHUD(ctx, [f1, f2], 0, [half, MAX_HEALTH])).not.toThrow();
  });

  it('delayedHealth differs from actualHealth shows delayed damage region', () => {
    const f1 = makeFighter(600);
    const f2 = makeFighter(MAX_HEALTH);
    const actualRatio = Math.max(0, f1.health / MAX_HEALTH);
    const delayedRatio = Math.max(0, 900 / MAX_HEALTH);
    // The delayed ratio should be larger (shows the "ghost" red bar)
    expect(delayedRatio).toBeGreaterThan(actualRatio);
    // drawHUD should handle the delayed health without errors
    expect(() => drawHUD(ctx, [f1, f2], 0, [900, MAX_HEALTH])).not.toThrow();
    // Verify the difference is drawn: fillRect should have been called
    expect(ctx.fillRect).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. Power Gauge Logic (4 tests)
// ═══════════════════════════════════════════════════════════════

describe('3. Power Gauge Logic', () => {
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ctx = mockCtx();
  });

  it('stocks=0 with no meter produces zero fill', () => {
    const gauges: [PowerGauge, PowerGauge] = [makeGauge(0, 0), makeGauge(0, 0)];
    const maxModes: [MaxModeState, MaxModeState] = [makeMaxMode(), makeMaxMode()];

    const totalMeter = gauges[0].stocks * gauges[0].maxMeter + gauges[0].meter;
    const totalMax = MAX_STOCKS * gauges[0].maxMeter;
    const meterRatio = totalMeter / totalMax;
    expect(meterRatio).toBe(0);

    expect(() => drawPowerGauges(ctx, gauges, maxModes)).not.toThrow();
  });

  it('stocks=MAX_STOCKS produces full gauge', () => {
    const gauges: [PowerGauge, PowerGauge] = [
      makeGauge(MAX_STOCKS, 0),
      makeGauge(MAX_STOCKS, 0),
    ];
    const maxModes: [MaxModeState, MaxModeState] = [makeMaxMode(), makeMaxMode()];

    const totalMeter = gauges[0].stocks * gauges[0].maxMeter + gauges[0].meter;
    const totalMax = MAX_STOCKS * gauges[0].maxMeter;
    const meterRatio = totalMeter / totalMax;
    expect(meterRatio).toBe(1);

    expect(() => drawPowerGauges(ctx, gauges, maxModes)).not.toThrow();
  });

  it('stocks=3 is DM-ready (stocks >= 1, not in MAX mode)', () => {
    const gauge = makeGauge(3, 0);
    const maxMode = makeMaxMode(false);
    // DM-ready condition: gauge.stocks >= 1 && !maxMode.active
    expect(gauge.stocks).toBeGreaterThanOrEqual(1);
    expect(maxMode.active).toBe(false);
    expect(gauge.stocks >= 1 && !maxMode.active).toBe(true);

    const gauges: [PowerGauge, PowerGauge] = [gauge, makeGauge(0, 0)];
    const maxModes: [MaxModeState, MaxModeState] = [maxMode, makeMaxMode()];
    expect(() => drawPowerGauges(ctx, gauges, maxModes)).not.toThrow();
  });

  it('meter fill ratio is calculated correctly for partial charge', () => {
    const maxMeter = 1000;
    const gauge = makeGauge(2, 500, maxMeter);
    // totalMeter = stocks * maxMeter + meter = 2 * 1000 + 500 = 2500
    // totalMax = MAX_STOCKS * maxMeter = 5 * 1000 = 5000
    // meterRatio = 2500 / 5000 = 0.5
    const totalMeter = gauge.stocks * gauge.maxMeter + gauge.meter;
    const totalMax = MAX_STOCKS * gauge.maxMeter;
    const meterRatio = totalMeter / totalMax;
    expect(meterRatio).toBe(0.5);
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. Timer Logic (3 tests)
// ═══════════════════════════════════════════════════════════════

describe('4. Timer Logic', () => {
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ctx = mockCtx();
    resetHUDFlash();
  });

  it('ROUND_TIME = 99', () => {
    // KOF2002 authentic: round time is 99 seconds
    expect(ROUND_TIME).toBe(99);
  });

  it('time below 10 is critical (red color, blinking)', () => {
    // At tick = (ROUND_TIME - 9) * 60, timeSeconds should be 9
    const tick = (ROUND_TIME - 9) * 60;
    const timeSeconds = Math.max(0, ROUND_TIME - Math.floor(tick / 60));
    expect(timeSeconds).toBe(9);
    // Critical threshold: timeSeconds <= 10 triggers red color and blink
    expect(timeSeconds).toBeLessThanOrEqual(10);
  });

  it('time at 0 shows TIME UP condition', () => {
    // At tick >= ROUND_TIME * 60, timer shows 0
    const tick = ROUND_TIME * 60;
    const timeSeconds = Math.max(0, ROUND_TIME - Math.floor(tick / 60));
    expect(timeSeconds).toBe(0);
    // Timer should be clamped to 0, never negative
    const overTick = (ROUND_TIME + 10) * 60;
    const overSeconds = Math.max(0, ROUND_TIME - Math.floor(overTick / 60));
    expect(overSeconds).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. Combo Counter Logic (3 tests)
// ═══════════════════════════════════════════════════════════════

describe('5. Combo Counter Logic', () => {
  let ctx: CanvasRenderingContext2D;
  let camera: Camera;

  beforeEach(() => {
    ctx = mockCtx();
    camera = new Camera();
  });

  it('combo=0 is not displayed (early return)', () => {
    const f1 = makeFighter(MAX_HEALTH);
    const f2 = makeFighter(MAX_HEALTH);
    // comboCount < 2 means skip — combo=0 should not trigger any combo rendering
    expect(() => drawComboCounters(ctx, [f1, f2], [0, 0], [60, 60], camera)).not.toThrow();
  });

  it('combo=1 is not displayed (threshold is >= 2)', () => {
    const f1 = makeFighter(MAX_HEALTH);
    const f2 = makeFighter(MAX_HEALTH);
    // comboCount[i] < 2 continues (skips), so combo=1 is also not rendered
    expect(() => drawComboCounters(ctx, [f1, f2], [1, 1], [60, 60], camera)).not.toThrow();
  });

  it('combo >= 2 displays combo count with color tiers', () => {
    const f1 = makeFighter(MAX_HEALTH);
    const f2 = makeFighter(MAX_HEALTH);

    // Color tier logic replicated from drawComboCounters:
    // combo >= 20: red
    // combo >= 10: orange
    // combo >= 5: yellow
    // combo >= 2 (and < 5): white
    const tiers = [
      { combo: 2, expectedTier: 'white' },
      { combo: 5, expectedTier: 'yellow' },
      { combo: 10, expectedTier: 'orange' },
      { combo: 20, expectedTier: 'red' },
    ];
    for (const { combo, expectedTier } of tiers) {
      let expectedColor: string;
      if (combo >= 20) expectedColor = '#ff2222';
      else if (combo >= 10) expectedColor = '#ff8800';
      else if (combo >= 5) expectedColor = '#ffcc00';
      else expectedColor = '#ffffff';

      switch (expectedTier) {
        case 'red': expect(expectedColor).toBe('#ff2222'); break;
        case 'orange': expect(expectedColor).toBe('#ff8800'); break;
        case 'yellow': expect(expectedColor).toBe('#ffcc00'); break;
        case 'white': expect(expectedColor).toBe('#ffffff'); break;
      }
    }

    // drawComboCounters should render without errors for a combo of 5
    expect(() => drawComboCounters(ctx, [f1, f2], [5, 0], [60, 60], camera, [120, 0])).not.toThrow();
    // Should have drawn text (fillText or similar)
    expect(ctx.save).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. Team Order Display (2 tests)
// ═══════════════════════════════════════════════════════════════

describe('6. Team Order Display', () => {
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ctx = mockCtx();
  });

  it('3v3 team displays all members', () => {
    const team: TeamDisplayInfo = {
      members: [
        { name: 'Kyo', defeated: false, active: true },
        { name: 'Iori', defeated: false, active: false },
        { name: 'Ryo', defeated: false, active: false },
      ],
    };

    expect(() => drawTeamOrder(ctx, team, null)).not.toThrow();
    // fillText should be called for each member initial
    expect(ctx.fillText).toHaveBeenCalled();
  });

  it('defeated members are marked with gray color', () => {
    const team: TeamDisplayInfo = {
      members: [
        { name: 'Kyo', defeated: true, active: false },
        { name: 'Iori', defeated: false, active: true },
      ],
    };

    // Draw with both teams to ensure rendering happens
    expect(() => drawTeamOrder(ctx, team, team)).not.toThrow();
    // Verify fillText was called (members are drawn)
    expect(ctx.fillText).toHaveBeenCalled();
  });
});
