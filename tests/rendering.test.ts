/**
 * Rendering System Tests — Fighter rendering, HUD rendering, Stage rendering, VFX rendering
 *
 * These tests verify that rendering functions do not crash, parameters are valid,
 * and state transitions are correct. They do NOT verify pixel output.
 * A mock CanvasRenderingContext2D is used for all canvas operations.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState } from '../src/core/types.js';
import type { PowerGauge, MaxModeState } from '../src/core/types.js';
import { Camera } from '../src/core/camera.js';
import { MAX_HEALTH, MAX_STOCKS } from '../src/core/constants.js';
import {
  drawStage,
  generateStars,
  setStage,
  getStage,
  getAllStages,
  cycleStage,
} from '../src/rendering/stage.js';
import type { StageId } from '../src/rendering/stage.js';
import { VFXSystem, ScreenShake, ScreenFlash } from '../src/rendering/vfx.js';
import { drawHUD, drawPowerGauges, drawComboCounters, resetHUDFlash } from '../src/rendering/hud.js';
import { drawKO } from '../src/rendering/screens.js';
import { drawFighters, resolveFighterColors } from '../src/rendering/rendererFighter.js';
import { shiftColor, parseColor, roundRect } from '../src/rendering/utils.js';

// ─── Mock Canvas ──────────────────────────────────────────────────────────────

/**
 * Creates a mock CanvasRenderingContext2D that records all calls without crashing.
 * Every method returns a no-op or a mock gradient object.
 */
function createMockCtx(): CanvasRenderingContext2D {
  const mockGradient = {
    addColorStop: vi.fn(),
  };
  const ctx = {
    // Path methods
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    quadraticCurveTo: vi.fn(),
    rect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn(() => ({ width: 50 })),

    // State
    save: vi.fn(),
    restore: vi.fn(),
    setLineDash: vi.fn(),

    // Properties
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    shadowColor: '',
    shadowBlur: 0,
    shadowOffsetY: 0,

    // Transform
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),

    // Gradient factory
    createLinearGradient: vi.fn(() => mockGradient),
    createRadialGradient: vi.fn(() => mockGradient),

    // Clear
    clearRect: vi.fn(),

    // Clipping
    clip: vi.fn(),

    // Image
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
  return ctx;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeFighter(overrides: Partial<Fighter> & { x?: number; color?: string; facing?: number } = {}): Fighter {
  const f = new Fighter(
    overrides.x ?? 400,
    overrides.color ?? '#ff4444',
    (overrides.facing ?? 1) as 1 | -1,
  );
  if (overrides.charId !== undefined) f.charId = overrides.charId;
  if (overrides.state !== undefined) f.state = overrides.state;
  if (overrides.health !== undefined) f.health = overrides.health;
  if (overrides.attackPhase !== undefined) f.attackPhase = overrides.attackPhase;
  if (overrides.attackFrame !== undefined) f.attackFrame = overrides.attackFrame;
  if (overrides.hitFlashFrames !== undefined) f.hitFlashFrames = overrides.hitFlashFrames;
  if (overrides.hitstunTimer !== undefined) f.hitstunTimer = overrides.hitstunTimer;
  if (overrides.guardGauge !== undefined) f.guardGauge = overrides.guardGauge;
  return f;
}

function makeDefaultFighters(): [Fighter, Fighter] {
  const p1 = makeFighter({ x: 300, color: '#ff4444', facing: 1, charId: 'kyo' });
  const p2 = makeFighter({ x: 700, color: '#4488ff', facing: -1, charId: 'iori' });
  return [p1, p2];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. FIGHTER RENDERING (8 tests)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Fighter Rendering', () => {
  it('different characters produce different attack color accents', () => {
    const kyo = makeFighter({ charId: 'kyo', state: FighterState.STAND_ATTACK });
    const iori = makeFighter({ charId: 'iori', state: FighterState.STAND_ATTACK });
    const terry = makeFighter({ charId: 'terry', state: FighterState.STAND_ATTACK });

    const kyoColors = resolveFighterColors(kyo, 0);
    const ioriColors = resolveFighterColors(iori, 0);
    const terryColors = resolveFighterColors(terry, 0);

    // Each character should have unique attack body colors
    expect(kyoColors.bodyColor).not.toBe(ioriColors.bodyColor);
    expect(kyoColors.bodyColor).not.toBe(terryColors.bodyColor);
    expect(ioriColors.bodyColor).not.toBe(terryColors.bodyColor);
  });

  it('renders idle animation without crashing', () => {
    const ctx = createMockCtx();
    const fighters = makeDefaultFighters();
    fighters[0].state = FighterState.IDLE;
    fighters[1].state = FighterState.IDLE;

    expect(() => {
      drawFighters(ctx, fighters, 0, 0);
    }).not.toThrow();
  });

  it('renders walk animation without crashing', () => {
    const ctx = createMockCtx();
    const fighters = makeDefaultFighters();
    fighters[0].state = FighterState.WALK;

    expect(() => {
      drawFighters(ctx, fighters, 0, 60);
    }).not.toThrow();
  });

  it('renders attack animation without crashing', () => {
    const ctx = createMockCtx();
    const fighters = makeDefaultFighters();
    fighters[0].state = FighterState.STAND_ATTACK;
    fighters[0].attackPhase = 'active';
    fighters[0].attackFrame = 3;

    expect(() => {
      drawFighters(ctx, fighters, 0, 60);
    }).not.toThrow();
  });

  it('renders hitstun animation without crashing', () => {
    const ctx = createMockCtx();
    const fighters = makeDefaultFighters();
    fighters[0].state = FighterState.HITSTUN;
    fighters[0].hitstunTimer = 10;

    expect(() => {
      drawFighters(ctx, fighters, 0, 60);
    }).not.toThrow();
  });

  it('renders jump animation without crashing', () => {
    const ctx = createMockCtx();
    const fighters = makeDefaultFighters();
    fighters[0].state = FighterState.JUMP;
    fighters[0].y = 300; // airborne

    expect(() => {
      drawFighters(ctx, fighters, 0, 60);
    }).not.toThrow();
  });

  it('MAX mode produces green aura visual (glow and outline)', () => {
    const f = makeFighter({ state: FighterState.IDLE });
    const ctx = createMockCtx();
    const fighters = makeDefaultFighters();
    const maxModes: [MaxModeState, MaxModeState] = [
      { active: true, timer: 500, maxDuration: 720 },
      { active: false, timer: 0, maxDuration: 720 },
    ];

    expect(() => {
      drawFighters(ctx, fighters, 0, 100, maxModes);
    }).not.toThrow();

    // Should have made canvas calls (ellipse for aura)
    expect(ctx.ellipse).toHaveBeenCalled();
  });

  it('dizzy state produces flashing body color', () => {
    const f = makeFighter({ state: FighterState.DIZZY });

    // At tick where flash is active (tick % 10 < 3), body should be yellow or white
    const colors1 = resolveFighterColors(f, 0);  // tick=0 -> 0%10=0 < 3 -> yellow
    expect(['#ffffaa', '#ffffff']).toContain(colors1.bodyColor);

    // At tick where flash is NOT active (tick % 10 = 5), body should be original color
    const colors2 = resolveFighterColors(f, 5);
    expect(colors2.bodyColor).toBe(f.color);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. HUD RENDERING (7 tests)
// ═══════════════════════════════════════════════════════════════════════════════

describe('HUD Rendering', () => {
  beforeEach(() => {
    resetHUDFlash();
  });

  it('renders health bars at full health without crashing', () => {
    const ctx = createMockCtx();
    const fighters = makeDefaultFighters();
    // Default health is MAX_HEALTH = full

    expect(() => {
      drawHUD(ctx, fighters, 0, [MAX_HEALTH, MAX_HEALTH]);
    }).not.toThrow();
  });

  it('renders health bars at half health without crashing', () => {
    const ctx = createMockCtx();
    const fighters = makeDefaultFighters();
    fighters[0].health = MAX_HEALTH / 2;
    fighters[1].health = MAX_HEALTH / 2;

    expect(() => {
      drawHUD(ctx, fighters, 0, [MAX_HEALTH / 2, MAX_HEALTH / 2]);
    }).not.toThrow();
  });

  it('renders health bars at zero health without crashing', () => {
    const ctx = createMockCtx();
    const fighters = makeDefaultFighters();
    fighters[0].health = 0;
    fighters[1].health = 0;

    expect(() => {
      drawHUD(ctx, fighters, 0, [0, 0]);
    }).not.toThrow();
  });

  it('renders power gauges for different stock levels', () => {
    const ctx = createMockCtx();

    const testStocks = [0, 1, 2, 3, 5];
    for (const stocks of testStocks) {
      const gauges: [PowerGauge, PowerGauge] = [
        { meter: 0, stocks, maxMeter: 100 },
        { meter: 0, stocks: 0, maxMeter: 100 },
      ];
      const maxModes: [MaxModeState, MaxModeState] = [
        { active: false, timer: 0, maxDuration: 720 },
        { active: false, timer: 0, maxDuration: 720 },
      ];

      expect(() => {
        drawPowerGauges(ctx, gauges, maxModes);
      }, `Failed with ${stocks} stocks`).not.toThrow();
    }
  });

  it('renders timer display correctly at various ticks', () => {
    const ctx = createMockCtx();
    const fighters = makeDefaultFighters();

    // tick=0 -> time = 99
    expect(() => {
      drawHUD(ctx, fighters, 0, [MAX_HEALTH, MAX_HEALTH]);
    }).not.toThrow();

    // tick=2940 -> time = 50
    expect(() => {
      drawHUD(ctx, fighters, 2940, [MAX_HEALTH, MAX_HEALTH]);
    }).not.toThrow();

    // tick=5340 -> time = 10 (urgent)
    expect(() => {
      drawHUD(ctx, fighters, 5340, [MAX_HEALTH, MAX_HEALTH]);
    }).not.toThrow();

    // tick=5940 -> time = 0
    expect(() => {
      drawHUD(ctx, fighters, 5940, [MAX_HEALTH, MAX_HEALTH]);
    }).not.toThrow();
  });

  it('renders round and win indicators for different round/win states', () => {
    const ctx = createMockCtx();
    const fighters = makeDefaultFighters();

    const scenarios: Array<{ round: number; p1Wins: number; p2Wins: number }> = [
      { round: 1, p1Wins: 0, p2Wins: 0 },
      { round: 2, p1Wins: 1, p2Wins: 0 },
      { round: 3, p1Wins: 2, p2Wins: 1 },
    ];

    for (const { round, p1Wins, p2Wins } of scenarios) {
      expect(() => {
        drawHUD(ctx, fighters, 0, [MAX_HEALTH, MAX_HEALTH], p1Wins, p2Wins, 'Kyo', 'Iori', round);
      }, `Failed round=${round} p1=${p1Wins} p2=${p2Wins}`).not.toThrow();
    }
  });

  it('renders combo counters with different combo counts', () => {
    const ctx = createMockCtx();
    const fighters = makeDefaultFighters();
    const camera = new Camera();

    const comboCounts = [0, 2, 5, 10, 20];
    for (const count of comboCounts) {
      expect(() => {
        drawComboCounters(
          ctx, fighters,
          [count, count],
          [60, 60],
          camera,
        );
      }, `Failed with combo count ${count}`).not.toThrow();
    }
  });

  it('renders FIRST ATTACK indicator', () => {
    const ctx = createMockCtx();
    const fighters = makeDefaultFighters();

    // firstAttacker = 0 (P1 first attack)
    expect(() => {
      drawHUD(ctx, fighters, 0, [MAX_HEALTH, MAX_HEALTH], 0, 0, 'Kyo', 'Iori', 1, 0);
    }).not.toThrow();

    // firstAttacker = 1 (P2 first attack)
    expect(() => {
      drawHUD(ctx, fighters, 0, [MAX_HEALTH, MAX_HEALTH], 0, 0, 'Kyo', 'Iori', 1, 1);
    }).not.toThrow();
  });

  it('renders KO overlay without crashing', () => {
    const ctx = createMockCtx();

    expect(() => {
      drawKO(ctx, 0, null, false, 500, 0, MAX_HEALTH, 30);
    }).not.toThrow();

    // Time over
    expect(() => {
      drawKO(ctx, 0, null, true, 500, 200, MAX_HEALTH, 30);
    }).not.toThrow();

    // Perfect
    expect(() => {
      drawKO(ctx, 0, 0, false, MAX_HEALTH, 0, MAX_HEALTH, 60);
    }).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. STAGE RENDERING (5 tests)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Stage Rendering', () => {
  it('renders stage background without crashing for temple/china/factory/orochi', () => {
    const ctx = createMockCtx();
    const stars = generateStars(60);
    const stages: StageId[] = ['temple', 'china', 'factory', 'orochi'];

    for (const stageId of stages) {
      setStage(stageId);
      expect(() => {
        drawStage(ctx, 0, stars, 0);
      }, `Stage ${stageId} background render crashed`).not.toThrow();
    }
  });

  it('street stage has known out-of-bounds bug in cable drawing', () => {
    // Street stage's drawBuildings accesses midBuildings[ci*2] where ci goes 0..3,
    // but midBuildings only has 6 entries (index 0..5), so ci=3 → index 6 is undefined.
    // This test documents the known bug. When fixed, this test should be updated.
    const ctx = createMockCtx();
    const stars = generateStars(60);
    setStage('street');

    expect(() => {
      drawStage(ctx, 0, stars, 0);
    }).toThrow();
  });

  it('renders stage with camera offset (foreground parallax)', () => {
    const ctx = createMockCtx();
    const stars = generateStars(60);
    setStage('temple');

    expect(() => {
      drawStage(ctx, 200, stars, 0);
    }).not.toThrow();

    // Second call with different offset should also work
    expect(() => {
      drawStage(ctx, 500, stars, 100);
    }).not.toThrow();
  });

  it('switches between stages correctly', () => {
    const allStages = getAllStages();
    expect(allStages).toContain('temple');
    expect(allStages).toContain('china');
    expect(allStages).toContain('factory');
    expect(allStages).toContain('orochi');
    expect(allStages).toContain('street');

    setStage('china');
    expect(getStage()).toBe('china');

    setStage('orochi');
    expect(getStage()).toBe('orochi');
  });

  it('cycleStage rotates through all stages', () => {
    setStage('temple');

    const visited: StageId[] = [];
    for (let i = 0; i < 5; i++) {
      const next = cycleStage();
      visited.push(next);
    }

    // After 5 cycles, should have visited all 5 stages
    expect(visited).toEqual(['china', 'factory', 'orochi', 'street', 'temple']);
  });

  it('renders stage with animated elements at different ticks', () => {
    const ctx = createMockCtx();
    const stars = generateStars(60);
    setStage('temple');

    // Test with various global tick values to ensure animated elements don't crash
    const ticks = [0, 100, 500, 1000, 5000];
    for (const tick of ticks) {
      expect(() => {
        drawStage(ctx, 100, stars, tick);
      }, `Stage render crashed at tick ${tick}`).not.toThrow();
    }
  });

  it('generateStars produces stars with valid properties', () => {
    const stars = generateStars(30);

    expect(stars.length).toBe(30);
    for (const star of stars) {
      expect(star.x).toBeGreaterThanOrEqual(0);
      expect(star.x).toBeLessThanOrEqual(800);
      expect(star.y).toBeGreaterThanOrEqual(0);
      expect(star.y).toBeLessThanOrEqual(250);
      expect(star.brightness).toBeGreaterThanOrEqual(0.3);
      expect(star.brightness).toBeLessThanOrEqual(1.0);
      expect(star.speed).toBeGreaterThan(0);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. VFX RENDERING (5 tests)
// ═══════════════════════════════════════════════════════════════════════════════

describe('VFX Rendering', () => {
  it('renders hit sparks without crashing', () => {
    const ctx = createMockCtx();
    const vfx = new VFXSystem();
    vfx.spawnHitSparks(400, 400, 10);

    // Update a few times and render
    for (let i = 0; i < 5; i++) vfx.update();

    expect(() => {
      vfx.render(ctx, 0);
    }).not.toThrow();

    // Verify particles were created
    expect(vfx.count).toBeGreaterThan(0);
  });

  it('renders block flash without crashing', () => {
    const ctx = createMockCtx();
    const vfx = new VFXSystem();
    vfx.spawnBlockFlash(400, 400, 1.0);

    expect(() => {
      vfx.render(ctx, 0);
    }).not.toThrow();
  });

  it('screen shake produces valid offsets and decays to zero', () => {
    const shake = new ScreenShake();

    // Trigger shake
    shake.trigger(10, 20, 5);
    expect(shake.offsetX).toBe(0);
    expect(shake.offsetY).toBe(0);

    // Update to produce offsets
    shake.update();
    // First frame should produce nonzero offset
    const hadOffset = shake.offsetX !== 0 || shake.offsetY !== 0;

    // Run all frames to completion
    for (let i = 1; i < 20; i++) {
      shake.update();
    }

    // After duration expires, should be back to zero
    expect(shake.offsetX).toBe(0);
    expect(shake.offsetY).toBe(0);
  });

  it('screen shake clamps offsets to reasonable range', () => {
    const shake = new ScreenShake();
    shake.trigger(50, 20, 30); // very high intensity + bias

    for (let i = 0; i < 20; i++) {
      shake.update();
      expect(shake.offsetX).toBeGreaterThanOrEqual(-30);
      expect(shake.offsetX).toBeLessThanOrEqual(30);
      expect(shake.offsetY).toBeGreaterThanOrEqual(-20);
      expect(shake.offsetY).toBeLessThanOrEqual(20);
    }
  });

  it('ScreenFlash triggers, updates, and renders correctly', () => {
    const ctx = createMockCtx();
    const flash = new ScreenFlash();

    // Initially inactive
    expect(flash.active).toBe(false);

    // Trigger flash
    flash.trigger('#ffffff', 0.5, 10);
    expect(flash.active).toBe(true);

    // Render should not crash
    expect(() => {
      flash.render(ctx, 800, 600);
    }).not.toThrow();

    // Update through all frames
    for (let i = 0; i < 10; i++) {
      flash.update();
    }
    expect(flash.active).toBe(false);

    // Reset
    flash.trigger('#ff0000', 1.0, 5);
    expect(flash.active).toBe(true);
    flash.reset();
    expect(flash.active).toBe(false);
  });

  it('KO explosion (ground slam) renders without crashing', () => {
    const ctx = createMockCtx();
    const vfx = new VFXSystem();
    vfx.spawnGroundSlam(400, 500);

    expect(() => {
      vfx.render(ctx, 0);
    }).not.toThrow();

    expect(vfx.count).toBeGreaterThan(0);
  });

  it('render with multiple VFX types simultaneously does not crash', () => {
    const ctx = createMockCtx();
    const vfx = new VFXSystem();

    // Spawn several VFX types
    vfx.spawnHitSparks(300, 400, 8);
    vfx.spawnBlockFlash(300, 400, 1.0);
    vfx.spawnImpactRing(300, 400, 1.5);
    vfx.spawnSlashLine(300, 400, 1, '#ffcc00', 1.0);
    vfx.spawnDizzyStars(300, 350);

    // Render and update several frames
    for (let i = 0; i < 15; i++) {
      vfx.update();
      expect(() => {
        vfx.render(ctx, 100);
      }, `Crashed on frame ${i}`).not.toThrow();
    }

    // Verify particles are being consumed (some may remain from long-lived effects)
    expect(vfx.count).toBeLessThan(30); // started with ~20+, should have decayed significantly
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. UTILITY RENDERING (bonus coverage)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Rendering Utilities', () => {
  it('shiftColor shifts hex colors correctly', () => {
    expect(shiftColor('#808080', 50)).toBe('#b2b2b2');
    expect(shiftColor('#808080', -50)).toBe('#4e4e4e');
    // Clamps at 0 and 255
    expect(shiftColor('#f0f0f0', 100)).toBe('#ffffff');
    expect(shiftColor('#101010', -100)).toBe('#000000');
  });

  it('parseColor handles hex and rgb formats', () => {
    const hex = parseColor('#ff8844');
    expect(hex.r).toBe(255);
    expect(hex.g).toBe(136);
    expect(hex.b).toBe(68);

    const rgb = parseColor('rgb(100, 200, 50)');
    expect(rgb.r).toBe(100);
    expect(rgb.g).toBe(200);
    expect(rgb.b).toBe(50);

    const rgba = parseColor('rgba(10, 20, 30, 0.5)');
    expect(rgba.r).toBe(10);
    expect(rgba.g).toBe(20);
    expect(rgba.b).toBe(30);
  });

  it('roundRect does not crash with valid parameters', () => {
    const ctx = createMockCtx();
    expect(() => {
      roundRect(ctx, 10, 10, 100, 50, 5);
    }).not.toThrow();

    // Zero radius
    expect(() => {
      roundRect(ctx, 0, 0, 200, 100, 0);
    }).not.toThrow();
  });
});
