/**
 * CinematicState Tests — HitStop, SuperFlash, KO SlowMo, timers, PERFECT detection.
 *
 * Tests cover all cinematic timing subsystems including freeze behavior,
 * super flash countdown, KO slow-motion skip frames, damage tracking,
 * and reset lifecycle.
 */
import { describe, it, expect } from 'vitest';
import { CinematicState } from '../src/state/cinematicState.js';
import type { MaxModeState } from '../src/core/types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeMaxMode(overrides: Partial<MaxModeState> = {}): MaxModeState {
  return {
    active: overrides.active ?? false,
    timer: overrides.timer ?? 0,
    maxDuration: overrides.maxDuration ?? 300,
  };
}

// ===========================================================================
// 1. SuperFlash Timer Countdown
// ===========================================================================

describe('CinematicState — SuperFlash Timer', () => {
  it('superFlashTimer starts at 0', () => {
    const cs = new CinematicState();
    expect(cs.superFlashTimer).toBe(0);
  });

  it('triggerSuperFlash sets timer to 28 frames', () => {
    const cs = new CinematicState();
    cs.triggerSuperFlash(200, 100, 0);
    expect(cs.superFlashTimer).toBe(28);
    expect(cs.superFlashX).toBe(200);
    expect(cs.superFlashY).toBe(100);
    expect(cs.superFlashAttacker).toBe(0);
  });

  it('triggerSuperFlash also sets hitStop to 28', () => {
    const cs = new CinematicState();
    cs.triggerSuperFlash(200, 100, 1);
    expect(cs.hitStop).toBe(28);
  });

  it('tickSuperFlash decrements timer', () => {
    const cs = new CinematicState();
    cs.triggerSuperFlash(0, 0, 0);
    expect(cs.superFlashTimer).toBe(28);
    cs.tickSuperFlash();
    expect(cs.superFlashTimer).toBe(27);
  });

  it('tickSuperFlash does not go below 0', () => {
    const cs = new CinematicState();
    cs.superFlashTimer = 0;
    cs.tickSuperFlash();
    expect(cs.superFlashTimer).toBe(0);
  });

  it('superFlashTimer counts down to 0 with repeated ticks', () => {
    const cs = new CinematicState();
    cs.triggerSuperFlash(150, 80, 0);
    for (let i = 0; i < 28; i++) {
      cs.tickSuperFlash();
    }
    expect(cs.superFlashTimer).toBe(0);
  });
});

// ===========================================================================
// 2. HitStop / Freeze
// ===========================================================================

describe('CinematicState — HitStop / Freeze', () => {
  it('triggerHitStop sets freeze frames and defender info', () => {
    const cs = new CinematicState();
    cs.triggerHitStop(5, 1, 1);
    expect(cs.hitStop).toBe(5);
    expect(cs.hitStopDefender).toBe(1);
    expect(cs.hitStopBias).toBe(1);
  });

  it('isFrozen returns true while hitStop > 0 and decrements', () => {
    const cs = new CinematicState();
    cs.triggerHitStop(3);
    expect(cs.isFrozen()).toBe(true);
    expect(cs.hitStop).toBe(2);
    expect(cs.isFrozen()).toBe(true);
    expect(cs.hitStop).toBe(1);
    expect(cs.isFrozen()).toBe(true);
    expect(cs.hitStop).toBe(0);
    expect(cs.isFrozen()).toBe(false);
  });

  it('isFrozen returns false when hitStop is 0', () => {
    const cs = new CinematicState();
    expect(cs.isFrozen()).toBe(false);
  });

  it('addHitStop stacks frames instead of replacing', () => {
    const cs = new CinematicState();
    cs.triggerHitStop(3);
    cs.addHitStop(2, 0);
    expect(cs.hitStop).toBe(5); // 3 + 2
  });

  it('addHitStop with defenderIdx -1 does not override defender', () => {
    const cs = new CinematicState();
    cs.triggerHitStop(3, 1);
    cs.addHitStop(2); // default defenderIdx = -1
    expect(cs.hitStopDefender).toBe(1); // preserved
  });

  it('tickInFreeze ticks both MAX modes and super flash', () => {
    const cs = new CinematicState();
    const mm1 = makeMaxMode({ active: true, timer: 10 });
    const mm2 = makeMaxMode({ active: true, timer: 20 });
    cs.superFlashTimer = 5;

    cs.tickInFreeze([mm1, mm2]);

    expect(mm1.timer).toBe(9);
    expect(mm2.timer).toBe(19);
    expect(cs.superFlashTimer).toBe(4);
  });
});

// ===========================================================================
// 3. KO Slow-Mo Timers
// ===========================================================================

describe('CinematicState — KO Slow-Mo', () => {
  it('triggerKOSlowMo sets 40 frames and visual timers', () => {
    const cs = new CinematicState();
    cs.triggerKOSlowMo();
    expect(cs.koSlowMo).toBe(40);
    expect(cs.koSlowMoTriggered).toBe(true);
    expect(cs.koSlowMoFrameCounter).toBe(0);
    expect(cs.koDesaturateTimer).toBe(8);
    expect(cs.koVignetteTimer).toBe(60);
  });

  it('triggerDMKOSlowMo sets 60 frames and longer visual timers', () => {
    const cs = new CinematicState();
    cs.triggerDMKOSlowMo();
    expect(cs.koSlowMo).toBe(60);
    expect(cs.koSlowMoTriggered).toBe(true);
    expect(cs.koSlowMoFrameCounter).toBe(0);
    expect(cs.koDesaturateTimer).toBe(12);
    expect(cs.koVignetteTimer).toBe(90);
  });

  it('isKOSlowMoDone returns true when koSlowMo is 0', () => {
    const cs = new CinematicState();
    expect(cs.isKOSlowMoDone()).toBe(true);
    cs.triggerKOSlowMo();
    expect(cs.isKOSlowMoDone()).toBe(false);
  });

  it('triggerKOSlowMo vs triggerDMKOSlowMo have different durations', () => {
    const cs1 = new CinematicState();
    const cs2 = new CinematicState();
    cs1.triggerKOSlowMo();
    cs2.triggerDMKOSlowMo();
    expect(cs1.koSlowMo).toBe(40);
    expect(cs2.koSlowMo).toBe(60);
    expect(cs1.koDesaturateTimer).toBe(8);
    expect(cs2.koDesaturateTimer).toBe(12);
    expect(cs1.koVignetteTimer).toBe(60);
    expect(cs2.koVignetteTimer).toBe(90);
  });
});

// ===========================================================================
// 4. Skip Frame Logic
// ===========================================================================

describe('CinematicState — Skip Frame Logic', () => {
  it('shouldSkipFrame returns false when not in slow-mo', () => {
    const cs = new CinematicState();
    expect(cs.shouldSkipFrame()).toBe(false);
  });

  it('normal KO slow-mo skips every 3rd frame (runs 1 of 3)', () => {
    const cs = new CinematicState();
    cs.triggerKOSlowMo(); // 40 frames, skip rate 3

    // The pattern: skip, skip, run (every 3rd frame runs)
    const results: boolean[] = [];
    for (let i = 0; i < 9; i++) {
      results.push(cs.shouldSkipFrame());
    }
    // Pattern: skip(true), skip(true), run(false), repeat
    expect(results[0]).toBe(true);
    expect(results[1]).toBe(true);
    expect(results[2]).toBe(false);
    expect(results[3]).toBe(true);
    expect(results[4]).toBe(true);
    expect(results[5]).toBe(false);
  });

  it('DM KO slow-mo skips every 4th frame (runs 1 of 4)', () => {
    const cs = new CinematicState();
    cs.triggerDMKOSlowMo(); // 60 frames, skip rate 4

    const results: boolean[] = [];
    for (let i = 0; i < 12; i++) {
      results.push(cs.shouldSkipFrame());
    }
    // Pattern: skip(true), skip(true), skip(true), run(false), repeat
    expect(results[0]).toBe(true);
    expect(results[1]).toBe(true);
    expect(results[2]).toBe(true);
    expect(results[3]).toBe(false);
    expect(results[4]).toBe(true);
    expect(results[5]).toBe(true);
    expect(results[6]).toBe(true);
    expect(results[7]).toBe(false);
  });

  it('shouldSkipFrame decrements koSlowMo only on non-skip frames', () => {
    const cs = new CinematicState();
    cs.triggerKOSlowMo(); // koSlowMo = 40

    // 3 frames = 1 cycle: skip, skip, run (decrement)
    cs.shouldSkipFrame(); // skip
    cs.shouldSkipFrame(); // skip
    const before = cs.koSlowMo;
    cs.shouldSkipFrame(); // run — decrements
    expect(cs.koSlowMo).toBe(before - 1);
  });

  it('shouldSkipFrame decrements visual timers on run frames', () => {
    const cs = new CinematicState();
    cs.triggerKOSlowMo();

    // Advance to a run frame (every 3rd)
    cs.shouldSkipFrame(); // skip
    cs.shouldSkipFrame(); // skip
    const desatBefore = cs.koDesaturateTimer;
    const vigBefore = cs.koVignetteTimer;
    cs.shouldSkipFrame(); // run — timers decrement
    expect(cs.koDesaturateTimer).toBe(desatBefore - 1);
    expect(cs.koVignetteTimer).toBe(vigBefore - 1);
  });

  it('shouldSkipFrame does not decrement visual timers below 0', () => {
    const cs = new CinematicState();
    cs.triggerKOSlowMo();
    cs.koDesaturateTimer = 1;

    // Run many frames to exhaust desaturate timer
    for (let i = 0; i < 30; i++) {
      cs.shouldSkipFrame();
    }
    expect(cs.koDesaturateTimer).toBe(0);
  });

  it('full normal KO slow-mo takes 40 run frames (120 total calls)', () => {
    const cs = new CinematicState();
    cs.triggerKOSlowMo();

    let runFrames = 0;
    let totalCalls = 0;
    while (!cs.isKOSlowMoDone()) {
      const skipped = cs.shouldSkipFrame();
      totalCalls++;
      if (!skipped) runFrames++;
    }

    expect(runFrames).toBe(40);
    // Each run frame consumes 3 calls (2 skip + 1 run)
    expect(totalCalls).toBe(120);
  });
});

// ===========================================================================
// 5. Reset clears all timers
// ===========================================================================

describe('CinematicState — Reset', () => {
  it('reset() clears all state to defaults', () => {
    const cs = new CinematicState();
    cs.triggerHitStop(10, 0, 1);
    cs.triggerSuperFlash(100, 200, 1);
    cs.triggerKOSlowMo();
    cs.trackDamage(0, 50);
    cs.trackDamage(1, 30);
    cs.victoryFanfarePlayed = true;

    cs.reset();

    expect(cs.hitStop).toBe(0);
    expect(cs.hitStopDefender).toBe(-1);
    expect(cs.hitStopBias).toBe(0);
    expect(cs.superFlashTimer).toBe(0);
    expect(cs.superFlashX).toBe(0);
    expect(cs.superFlashY).toBe(0);
    expect(cs.superFlashAttacker).toBe(0);
    expect(cs.koSlowMo).toBe(0);
    expect(cs.koSlowMoTriggered).toBe(false);
    expect(cs.koSlowMoFrameCounter).toBe(0);
    expect(cs.koDesaturateTimer).toBe(0);
    expect(cs.koVignetteTimer).toBe(0);
    expect(cs.victoryFanfarePlayed).toBe(false);
    expect(cs.p1DamageTaken).toBe(0);
    expect(cs.p2DamageTaken).toBe(0);
  });

  it('resetForNewRound clears timers and damage but not victory fanfare', () => {
    const cs = new CinematicState();
    cs.triggerHitStop(5);
    cs.triggerKOSlowMo();
    cs.trackDamage(0, 100);
    cs.trackDamage(1, 80);
    cs.victoryFanfarePlayed = true;

    cs.resetForNewRound();

    expect(cs.hitStop).toBe(0);
    expect(cs.koSlowMo).toBe(0);
    expect(cs.koDesaturateTimer).toBe(0);
    expect(cs.koVignetteTimer).toBe(0);
    expect(cs.p1DamageTaken).toBe(0);
    expect(cs.p2DamageTaken).toBe(0);
    expect(cs.victoryFanfarePlayed).toBe(true); // preserved
  });

  it('double reset is idempotent', () => {
    const cs = new CinematicState();
    cs.triggerKOSlowMo();
    cs.reset();
    cs.reset();
    expect(cs.koSlowMo).toBe(0);
    expect(cs.p1DamageTaken).toBe(0);
  });

  it('reset after partial slow-mo gives clean state', () => {
    const cs = new CinematicState();
    cs.triggerKOSlowMo();
    // Run a few frames
    for (let i = 0; i < 10; i++) cs.shouldSkipFrame();
    expect(cs.koSlowMo).toBeGreaterThan(0); // still running

    cs.reset();
    expect(cs.koSlowMo).toBe(0);
    expect(cs.koDesaturateTimer).toBe(0);
    expect(cs.koVignetteTimer).toBe(0);
  });
});

// ===========================================================================
// 6. MAX Mode Tick
// ===========================================================================

describe('CinematicState — MAX Mode Tick', () => {
  it('tickMaxModes decrements active MAX mode timers', () => {
    const cs = new CinematicState();
    const mm1 = makeMaxMode({ active: true, timer: 10 });
    const mm2 = makeMaxMode({ active: true, timer: 20 });

    cs.tickMaxModes([mm1, mm2]);
    expect(mm1.timer).toBe(9);
    expect(mm2.timer).toBe(19);
  });

  it('tickMaxModes deactivates when timer reaches 0', () => {
    const cs = new CinematicState();
    const mm = makeMaxMode({ active: true, timer: 1 });

    cs.tickMaxModes([mm, makeMaxMode()]);
    expect(mm.timer).toBe(0);
    expect(mm.active).toBe(false);
  });

  it('tickMaxModes skips inactive MAX modes', () => {
    const cs = new CinematicState();
    const mm = makeMaxMode({ active: false, timer: 5 });

    cs.tickMaxModes([mm, makeMaxMode()]);
    expect(mm.timer).toBe(5); // unchanged
  });
});

// ===========================================================================
// 7. Damage Tracking & PERFECT Detection
// ===========================================================================

describe('CinematicState — Damage & PERFECT', () => {
  it('trackDamage accumulates damage per player', () => {
    const cs = new CinematicState();
    cs.trackDamage(0, 20);
    cs.trackDamage(0, 30);
    cs.trackDamage(1, 50);

    expect(cs.p1DamageTaken).toBe(50);  // P1 took 20+30
    expect(cs.p2DamageTaken).toBe(50);  // P2 took 50
  });

  it('getPerfectPlayer returns winner if they took zero damage', () => {
    const cs = new CinematicState();
    cs.trackDamage(1, 80); // P2 took damage, P1 took none

    expect(cs.getPerfectPlayer(0)).toBe(0); // P1 won with no damage taken
  });

  it('getPerfectPlayer returns null if winner took damage', () => {
    const cs = new CinematicState();
    cs.trackDamage(0, 10); // P1 took some damage
    cs.trackDamage(1, 80);

    expect(cs.getPerfectPlayer(0)).toBeNull(); // P1 won but took damage
  });

  it('getPerfectPlayer returns null when winner is null', () => {
    const cs = new CinematicState();
    expect(cs.getPerfectPlayer(null)).toBeNull();
  });

  it('PERFECT detection works for P2 winner', () => {
    const cs = new CinematicState();
    cs.trackDamage(0, 100); // P1 took damage, P2 took none

    expect(cs.getPerfectPlayer(1)).toBe(1); // P2 won with no damage taken
  });

  it('damage resets properly between rounds', () => {
    const cs = new CinematicState();
    cs.trackDamage(0, 100);
    cs.trackDamage(1, 50);
    cs.resetForNewRound();

    expect(cs.p1DamageTaken).toBe(0);
    expect(cs.p2DamageTaken).toBe(0);
  });
});

// ===========================================================================
// 8. KO Dust Particles
// ===========================================================================

describe('CinematicState — KO Dust Particles', () => {
  it('spawnKODust creates the specified number of particles', () => {
    const cs = new CinematicState();
    cs.spawnKODust(300, 200, 20);
    expect(cs.koDustParticles.length).toBe(20);
  });

  it('spawnKODust defaults to 20 particles', () => {
    const cs = new CinematicState();
    cs.spawnKODust(100, 150);
    expect(cs.koDustParticles.length).toBe(20);
  });

  it('spawnKODust particles have required properties', () => {
    const cs = new CinematicState();
    cs.spawnKODust(100, 200, 5);
    for (const p of cs.koDustParticles) {
      expect(p.life).toBeGreaterThan(0);
      expect(p.maxLife).toBe(p.life);
      expect(p.size).toBeGreaterThan(0);
      expect(p.color).toBeTruthy();
      // Position should be near spawn point (within 20px offset)
      expect(Math.abs(p.x - 100)).toBeLessThanOrEqual(20);
      expect(Math.abs(p.y - 200)).toBeLessThanOrEqual(20);
    }
  });

  it('dust particles are updated during slow-mo and decrease in number over time', () => {
    const cs = new CinematicState();
    cs.triggerKOSlowMo();
    cs.spawnKODust(100, 100, 20);
    expect(cs.koDustParticles.length).toBe(20);

    // Run some frames — particles with shorter life will expire
    for (let i = 0; i < 100; i++) {
      cs.shouldSkipFrame();
    }
    // Some particles should have expired by now (life ranges 30-60,
    // each particle decrements life only on run frames = every 3rd call,
    // so after 100 calls ~33 run frames, particles with life <= 33 are gone)
    expect(cs.koDustParticles.length).toBeLessThan(20);
    expect(cs.koDustParticles.length).toBeGreaterThan(0);
  });

  it('dust particles are cleared by reset', () => {
    const cs = new CinematicState();
    cs.spawnKODust(100, 100, 10);
    expect(cs.koDustParticles.length).toBe(10);
    cs.reset();
    expect(cs.koDustParticles.length).toBe(0);
  });
});

// ===========================================================================
// 9. Victory Fanfare
// ===========================================================================

describe('CinematicState — Victory Fanfare', () => {
  it('victoryFanfarePlayed starts false', () => {
    const cs = new CinematicState();
    expect(cs.victoryFanfarePlayed).toBe(false);
  });

  it('victoryFanfarePlayed survives resetForNewRound', () => {
    const cs = new CinematicState();
    cs.victoryFanfarePlayed = true;
    cs.resetForNewRound();
    expect(cs.victoryFanfarePlayed).toBe(true);
  });

  it('victoryFanfarePlayed is cleared by full reset', () => {
    const cs = new CinematicState();
    cs.victoryFanfarePlayed = true;
    cs.reset();
    expect(cs.victoryFanfarePlayed).toBe(false);
  });
});
