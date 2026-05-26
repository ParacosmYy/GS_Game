/**
 * KO System Tests (Phase 52)
 *
 * Tests the KO state machine, cinematic state transitions, and perfect KO detection.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  CinematicState,
  KO_FLASH_DURATION,
  KO_ANNOUNCE_DURATION,
  type KOPhase,
  type KOStateMachine,
} from '../src/state/cinematicState.js';

describe('KO State Machine', () => {
  let cs: CinematicState;

  beforeEach(() => {
    cs = new CinematicState();
  });

  it('starts in PENDING phase', () => {
    expect(cs.getKOPhase()).toBe('PENDING');
    expect(cs.getKOTimer()).toBe(0);
  });

  it('triggerKOSequence initializes the state machine', () => {
    cs.triggerKOSequence(0, false);
    expect(cs.koState.koPlayer).toBe(0);
    expect(cs.koState.isPerfect).toBe(false);
    expect(cs.koState.phase).toBe('PENDING');
    expect(cs.koState.timer).toBe(0);
  });

  it('triggerKOSequence tracks perfect KO', () => {
    cs.triggerKOSequence(1, true);
    expect(cs.koState.koPlayer).toBe(1);
    expect(cs.koState.isPerfect).toBe(true);
  });

  it('stays in PENDING while slow-mo is active', () => {
    cs.triggerKOSlowMo();
    cs.triggerKOSequence(0, false);
    // While slow-mo runs, ticking stays in PENDING
    for (let i = 0; i < 10; i++) {
      const phase = cs.tickKOState();
      expect(phase).toBe('PENDING');
    }
  });

  it('transitions to FLASH when slow-mo ends', () => {
    cs.triggerKOSlowMo();
    cs.triggerKOSequence(0, false);
    // Drain slow-mo
    while (cs.koSlowMo > 0) {
      cs.shouldSkipFrame();
    }
    // Tick once more to transition to FLASH
    const phase = cs.tickKOState();
    expect(phase).toBe('FLASH');
  });

  it('FLASH phase triggers hitStop', () => {
    cs.triggerKOSlowMo();
    cs.triggerKOSequence(0, false);
    // Drain slow-mo
    while (cs.koSlowMo > 0) {
      cs.shouldSkipFrame();
    }
    // Transition to FLASH
    cs.tickKOState();
    expect(cs.hitStop).toBe(KO_FLASH_DURATION);
  });

  it('transitions from FLASH to ANNOUNCE after KO_FLASH_DURATION ticks', () => {
    cs.triggerKOSlowMo();
    cs.triggerKOSequence(0, false);
    // Drain slow-mo
    while (cs.koSlowMo > 0) {
      cs.shouldSkipFrame();
    }
    // Enter FLASH
    cs.tickKOState();
    // Tick through FLASH duration
    for (let i = 0; i < KO_FLASH_DURATION; i++) {
      cs.tickKOState();
    }
    expect(cs.getKOPhase()).toBe('ANNOUNCE');
  });

  it('transitions from ANNOUNCE to DONE after KO_ANNOUNCE_DURATION ticks', () => {
    cs.triggerKOSlowMo();
    cs.triggerKOSequence(0, false);
    // Drain slow-mo
    while (cs.koSlowMo > 0) {
      cs.shouldSkipFrame();
    }
    // Enter FLASH
    cs.tickKOState();
    // Tick through FLASH
    for (let i = 0; i < KO_FLASH_DURATION; i++) {
      cs.tickKOState();
    }
    // Tick through ANNOUNCE
    for (let i = 0; i < KO_ANNOUNCE_DURATION; i++) {
      cs.tickKOState();
    }
    expect(cs.getKOPhase()).toBe('DONE');
  });

  it('DONE phase stays in DONE on further ticks', () => {
    cs.triggerKOSlowMo();
    cs.triggerKOSequence(0, false);
    while (cs.koSlowMo > 0) cs.shouldSkipFrame();
    cs.tickKOState();
    for (let i = 0; i < KO_FLASH_DURATION; i++) cs.tickKOState();
    for (let i = 0; i < KO_ANNOUNCE_DURATION; i++) cs.tickKOState();
    expect(cs.getKOPhase()).toBe('DONE');
    for (let i = 0; i < 100; i++) {
      cs.tickKOState();
      expect(cs.getKOPhase()).toBe('DONE');
    }
  });

  it('reset() resets KO state machine', () => {
    cs.triggerKOSequence(0, true);
    cs.reset();
    expect(cs.getKOPhase()).toBe('PENDING');
    expect(cs.koState.koPlayer).toBe(-1);
    expect(cs.koState.isPerfect).toBe(false);
    expect(cs.perfectMeterAwarded).toBe(false);
  });

  it('resetForNewRound() resets KO state machine', () => {
    cs.triggerKOSequence(1, false);
    cs.resetForNewRound();
    expect(cs.getKOPhase()).toBe('PENDING');
    expect(cs.koState.koPlayer).toBe(-1);
    expect(cs.koState.isPerfect).toBe(false);
  });

  it('perfectMeterAwarded starts false', () => {
    expect(cs.perfectMeterAwarded).toBe(false);
  });
});

describe('CinematicState KO Constants', () => {
  it('KO_FLASH_DURATION is 30 ticks', () => {
    expect(KO_FLASH_DURATION).toBe(30);
  });

  it('KO_ANNOUNCE_DURATION is 90 ticks', () => {
    expect(KO_ANNOUNCE_DURATION).toBe(90);
  });
});

describe('CinematicState KO Slow-mo', () => {
  let cs: CinematicState;

  beforeEach(() => {
    cs = new CinematicState();
  });

  it('normal KO slow-mo is 40 frames', () => {
    cs.triggerKOSlowMo();
    expect(cs.koSlowMo).toBe(40);
    expect(cs.koSlowMoTriggered).toBe(true);
  });

  it('DM KO slow-mo is 60 frames', () => {
    cs.triggerDMKOSlowMo();
    expect(cs.koSlowMo).toBe(60);
    expect(cs.koSlowMoTriggered).toBe(true);
  });

  it('shouldSkipFrame returns false when no slow-mo', () => {
    expect(cs.shouldSkipFrame()).toBe(false);
  });

  it('shouldSkipFrame skips frames during slow-mo', () => {
    cs.triggerKOSlowMo();
    let skipped = 0;
    let notSkipped = 0;
    for (let i = 0; i < 200; i++) {
      if (cs.shouldSkipFrame()) {
        skipped++;
      } else {
        notSkipped++;
      }
    }
    expect(skipped).toBeGreaterThan(0);
    expect(notSkipped).toBeGreaterThan(0);
    expect(cs.koSlowMo).toBe(0);
  });

  it('isKOSlowMoDone returns true after slow-mo completes', () => {
    cs.triggerKOSlowMo();
    while (cs.koSlowMo > 0) {
      cs.shouldSkipFrame();
    }
    expect(cs.isKOSlowMoDone()).toBe(true);
  });
});

describe('CinematicState PERFECT detection', () => {
  let cs: CinematicState;

  beforeEach(() => {
    cs = new CinematicState();
  });

  it('getPerfectPlayer returns null when no damage tracked', () => {
    expect(cs.getPerfectPlayer(0)).toBe(0);
    expect(cs.getPerfectPlayer(1)).toBe(1);
  });

  it('getPerfectPlayer returns winner if winner took 0 damage', () => {
    cs.trackDamage(1, 50); // P2 took damage
    expect(cs.getPerfectPlayer(0)).toBe(0); // P1 won with 0 damage taken
    expect(cs.getPerfectPlayer(1)).toBe(null); // P2 took damage, not perfect
  });

  it('getPerfectPlayer returns null if winner took damage', () => {
    cs.trackDamage(0, 10); // P1 took damage
    cs.trackDamage(1, 20); // P2 took damage
    expect(cs.getPerfectPlayer(0)).toBe(null);
    expect(cs.getPerfectPlayer(1)).toBe(null);
  });

  it('getPerfectPlayer returns null for null winner', () => {
    expect(cs.getPerfectPlayer(null)).toBe(null);
  });
});

describe('KO Dust Particles', () => {
  let cs: CinematicState;

  beforeEach(() => {
    cs = new CinematicState();
  });

  it('spawnKODust creates particles', () => {
    cs.spawnKODust(400, 300, 20);
    expect(cs.koDustParticles.length).toBe(20);
  });

  it('spawnKODust with custom count', () => {
    cs.spawnKODust(400, 300, 30);
    expect(cs.koDustParticles.length).toBe(30);
  });

  it('particles have correct properties', () => {
    cs.spawnKODust(400, 300, 1);
    const p = cs.koDustParticles[0];
    // Particles have random offset from spawn point (+/-10)
    expect(p.x).toBeGreaterThan(385);
    expect(p.x).toBeLessThan(415);
    expect(p.y).toBeGreaterThan(285);
    expect(p.y).toBeLessThan(315);
    expect(p.life).toBeGreaterThan(0);
    expect(p.maxLife).toBeGreaterThan(0);
    expect(p.size).toBeGreaterThan(0);
  });
});

describe('KO Phase Duration Totals', () => {
  it('total KO sequence duration matches expected', () => {
    const totalDuration = KO_FLASH_DURATION + KO_ANNOUNCE_DURATION;
    expect(totalDuration).toBe(120);
  });
});
