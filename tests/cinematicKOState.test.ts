/**
 * CinematicState KO sequence + superFlash + perfect detection regression tests
 *
 * Protects: KO state machine, perfect detection, super flash lifecycle,
 * slow-mo frame skipping, finishing attack tier, damage tracking.
 */
import { describe, it, expect } from 'vitest';
import { CinematicState, KO_FLASH_DURATION, KO_ANNOUNCE_DURATION } from '../src/state/cinematicState.js';
import type { MaxModeState } from '../src/core/types.js';

function makeMaxModes(): [MaxModeState, MaxModeState] {
  return [
    { active: false, timer: 0, maxDuration: 600 },
    { active: false, timer: 0, maxDuration: 600 },
  ];
}

describe('KO state machine', () => {
  it('starts in PENDING phase', () => {
    const cs = new CinematicState();
    cs.triggerKOSequence(1, false);
    expect(cs.getKOPhase()).toBe('PENDING');
    expect(cs.getKOTimer()).toBe(0);
  });

  it('transitions PENDING → FLASH when slow-mo finishes', () => {
    const cs = new CinematicState();
    cs.triggerKOSequence(1, false);
    cs.triggerKOSlowMo();
    // Drain slow-mo by advancing frames
    while (!cs.isKOSlowMoDone()) {
      cs.shouldSkipFrame();
    }
    cs.tickKOState();
    expect(cs.getKOPhase()).toBe('FLASH');
  });

  it('FLASH phase lasts KO_FLASH_DURATION ticks', () => {
    const cs = new CinematicState();
    cs.triggerKOSequence(0, true);
    // Skip slow-mo instantly
    cs.koSlowMo = 0;
    cs.tickKOState(); // PENDING → FLASH
    expect(cs.getKOPhase()).toBe('FLASH');
    for (let i = 0; i < KO_FLASH_DURATION; i++) {
      cs.tickKOState();
    }
    expect(cs.getKOPhase()).toBe('ANNOUNCE');
  });

  it('ANNOUNCE phase lasts KO_ANNOUNCE_DURATION ticks', () => {
    const cs = new CinematicState();
    cs.triggerKOSequence(0, false);
    cs.koSlowMo = 0;
    cs.tickKOState(); // PENDING → FLASH
    for (let i = 0; i < KO_FLASH_DURATION; i++) cs.tickKOState();
    // Now in ANNOUNCE
    expect(cs.getKOPhase()).toBe('ANNOUNCE');
    for (let i = 0; i < KO_ANNOUNCE_DURATION; i++) cs.tickKOState();
    expect(cs.getKOPhase()).toBe('DONE');
  });

  it('DONE phase stays DONE on further ticks', () => {
    const cs = new CinematicState();
    cs.triggerKOSequence(0, false);
    cs.koState.phase = 'DONE';
    cs.tickKOState();
    expect(cs.getKOPhase()).toBe('DONE');
  });

  it('stores KO player index', () => {
    const cs = new CinematicState();
    cs.triggerKOSequence(1, false);
    expect(cs.koState.koPlayer).toBe(1);
  });

  it('stores perfect flag', () => {
    const cs = new CinematicState();
    cs.triggerKOSequence(0, true);
    expect(cs.koState.isPerfect).toBe(true);
  });
});

describe('Perfect detection', () => {
  it('returns null for null winner', () => {
    const cs = new CinematicState();
    expect(cs.getPerfectPlayer(null)).toBeNull();
  });

  it('returns winner if they took 0 damage', () => {
    const cs = new CinematicState();
    cs.trackDamage(1, 100); // P2 took damage
    expect(cs.getPerfectPlayer(0)).toBe(0); // P1 wins with 0 damage taken
  });

  it('returns null if winner took damage', () => {
    const cs = new CinematicState();
    cs.trackDamage(0, 50); // P1 took damage
    expect(cs.getPerfectPlayer(0)).toBeNull();
  });

  it('P2 perfect: P2 wins with 0 damage taken', () => {
    const cs = new CinematicState();
    cs.trackDamage(0, 100); // P1 took damage
    expect(cs.getPerfectPlayer(1)).toBe(1);
  });
});

describe('trackDamage accumulation', () => {
  it('accumulates P1 damage', () => {
    const cs = new CinematicState();
    cs.trackDamage(0, 30);
    cs.trackDamage(0, 50);
    expect(cs.p1DamageTaken).toBe(80);
    expect(cs.p2DamageTaken).toBe(0);
  });

  it('accumulates P2 damage', () => {
    const cs = new CinematicState();
    cs.trackDamage(1, 40);
    cs.trackDamage(1, 60);
    expect(cs.p2DamageTaken).toBe(100);
    expect(cs.p1DamageTaken).toBe(0);
  });
});

describe('superFlash', () => {
  it('triggerSuperFlash sets timer and position', () => {
    const cs = new CinematicState();
    cs.triggerSuperFlash(400, 300, 0, 28, 'DM', '虎煌拳');
    expect(cs.superFlashTimer).toBe(28);
    expect(cs.superFlashX).toBe(400);
    expect(cs.superFlashY).toBe(300);
    expect(cs.superFlashAttacker).toBe(0);
    expect(cs.superFlashType).toBe('DM');
    expect(cs.superFlashMoveName).toBe('虎煌拳');
  });

  it('tickSuperFlash decrements timer', () => {
    const cs = new CinematicState();
    cs.triggerSuperFlash(100, 200, 1);
    cs.tickSuperFlash();
    expect(cs.superFlashTimer).toBe(27);
  });

  it('tickSuperFlash stops at 0', () => {
    const cs = new CinematicState();
    cs.triggerSuperFlash(100, 200, 0, 1);
    cs.tickSuperFlash();
    expect(cs.superFlashTimer).toBe(0);
    cs.tickSuperFlash();
    expect(cs.superFlashTimer).toBe(0);
  });

  it('default flash type is DM', () => {
    const cs = new CinematicState();
    cs.triggerSuperFlash(100, 200, 0);
    expect(cs.superFlashType).toBe('DM');
  });
});

describe('finishing attack tier', () => {
  it('DM_ prefix returns dm', () => {
    const cs = new CinematicState();
    cs.setFinishingAttack('DM_HAOU', 'ryo');
    expect(cs.getFinishTier()).toBe('dm');
  });

  it('SDM_ prefix returns sdm', () => {
    const cs = new CinematicState();
    cs.setFinishingAttack('SDM_RYUKO', 'ryo');
    expect(cs.getFinishTier()).toBe('sdm');
  });

  it('HSDM_ prefix returns hsdm', () => {
    const cs = new CinematicState();
    cs.setFinishingAttack('HSDM_TENCHI', 'ryo');
    expect(cs.getFinishTier()).toBe('hsdm');
  });

  it('normal attack returns empty string', () => {
    const cs = new CinematicState();
    cs.setFinishingAttack('STAND_C', 'ryo');
    expect(cs.getFinishTier()).toBe('');
  });

  it('stores finishing char ID', () => {
    const cs = new CinematicState();
    cs.setFinishingAttack('DM_OROCHINAGI', 'kyo');
    expect(cs.finishingCharId).toBe('kyo');
  });
});

describe('KO slow-mo', () => {
  it('triggerKOSlowMo sets 40-frame duration', () => {
    const cs = new CinematicState();
    cs.triggerKOSlowMo();
    expect(cs.koSlowMo).toBe(40);
    expect(cs.koSlowMoTriggered).toBe(true);
  });

  it('triggerDMKOSlowMo sets 60-frame duration', () => {
    const cs = new CinematicState();
    cs.triggerDMKOSlowMo();
    expect(cs.koSlowMo).toBe(60);
  });

  it('shouldSkipFrame returns false when no slow-mo', () => {
    const cs = new CinematicState();
    expect(cs.shouldSkipFrame()).toBe(false);
  });

  it('isKOSlowMoDone when counter reaches 0', () => {
    const cs = new CinematicState();
    cs.triggerKOSlowMo();
    // Drain all slow-mo frames
    while (!cs.isKOSlowMoDone()) {
      cs.shouldSkipFrame();
    }
    expect(cs.isKOSlowMoDone()).toBe(true);
  });
});

describe('reset and resetForNewRound', () => {
  it('reset clears all state', () => {
    const cs = new CinematicState();
    cs.triggerHitStop(10, 0, 1);
    cs.triggerKOSequence(0, true);
    cs.trackDamage(0, 100);
    cs.setFinishingAttack('DM_HAOU', 'ryo');
    cs.reset();
    expect(cs.hitStop).toBe(0);
    expect(cs.p1DamageTaken).toBe(0);
    expect(cs.p2DamageTaken).toBe(0);
    expect(cs.finishingAttackType).toBe('');
    expect(cs.finishingCharId).toBe('');
    expect(cs.getKOPhase()).toBe('PENDING');
  });

  it('resetForNewRound clears round state', () => {
    const cs = new CinematicState();
    cs.triggerHitStop(10, 0, 1);
    cs.triggerKOSequence(1, false);
    cs.trackDamage(0, 80);
    cs.setFinishingAttack('SDM_RYUKO', 'ryo');
    cs.resetForNewRound();
    expect(cs.hitStop).toBe(0);
    expect(cs.p1DamageTaken).toBe(0);
    expect(cs.p2DamageTaken).toBe(0);
    expect(cs.finishingAttackType).toBe('');
    expect(cs.getKOPhase()).toBe('PENDING');
  });
});
