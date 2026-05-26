/**
 * trainingMode.test.ts -- TrainingModeController unit tests
 *
 * Covers: config defaults, dummy behavior, frame advantage, frame data display, round reset.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { TrainingModeController, DummyBehaviorConfig } from '../src/state/trainingMode.js';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState, AttackType } from '../src/core/types.js';
import { STAGE_WIDTH, MAX_HEALTH, STAGE_GROUND_Y } from '../src/core/constants.js';

function makeFighter(x = STAGE_WIDTH * 0.33, facing: 1 | -1 = 1): Fighter {
  return new Fighter(x, '#ff6600', facing);
}

// ===========================================================================
// 1. Config Defaults (3 tests)
// ===========================================================================
describe('TrainingModeController - Config Defaults', () => {
  let ctrl: TrainingModeController;

  beforeEach(() => {
    ctrl = new TrainingModeController();
  });

  it('has correct default config', () => {
    expect(ctrl.config.dummyBehavior).toBe('stand');
    expect(ctrl.config.showHitboxes).toBe(false);
    expect(ctrl.config.showFrameData).toBe(false);
    expect(ctrl.config.infiniteTime).toBe(true);
    expect(ctrl.config.infiniteHealth).toBe(true);
    expect(ctrl.config.frameAdvance).toBe(false);
    expect(ctrl.config.inputDisplay).toBe(true);
  });

  it('toggleHitboxes flips showHitboxes', () => {
    expect(ctrl.config.showHitboxes).toBe(false);
    ctrl.toggleHitboxes();
    expect(ctrl.config.showHitboxes).toBe(true);
    ctrl.toggleHitboxes();
    expect(ctrl.config.showHitboxes).toBe(false);
  });

  it('cycleDummyBehavior cycles through all behaviors', () => {
    const expected: DummyBehaviorConfig[] = [
      'block_all', 'block_high', 'block_low', 'crouch', 'jump', 'reversal', 'random', 'playback', 'stand',
    ];
    const results: DummyBehaviorConfig[] = [];
    for (let i = 0; i < expected.length; i++) {
      ctrl.cycleDummyBehavior();
      results.push(ctrl.config.dummyBehavior);
    }
    expect(results).toEqual(expected);
    // One more cycle wraps back
    ctrl.cycleDummyBehavior();
    expect(ctrl.config.dummyBehavior).toBe('block_all');
  });
});

// ===========================================================================
// 2. Dummy Behavior (4 tests)
// ===========================================================================
describe('TrainingModeController - Dummy Behavior', () => {
  let ctrl: TrainingModeController;
  let dummy: Fighter;

  beforeEach(() => {
    ctrl = new TrainingModeController();
    dummy = makeFighter(STAGE_WIDTH * 0.67, -1);
  });

  it('stand dummy remains idle', () => {
    ctrl.config.dummyBehavior = 'stand';
    ctrl.applyDummyBehavior(dummy);
    expect(dummy.state).toBe(FighterState.IDLE);
  });

  it('crouch dummy enters crouch state', () => {
    ctrl.config.dummyBehavior = 'crouch';
    ctrl.applyDummyBehavior(dummy);
    expect(dummy.state).toBe(FighterState.CROUCH);
  });

  it('block_all dummy does not force state change (handled via input)', () => {
    ctrl.config.dummyBehavior = 'block_all';
    ctrl.applyDummyBehavior(dummy);
    // Block_all does not force a state; it's driven by getDummyInput
    expect(dummy.state).toBe(FighterState.IDLE);
  });

  it('random dummy does not force state change (handled via input)', () => {
    ctrl.config.dummyBehavior = 'random';
    ctrl.applyDummyBehavior(dummy);
    expect(dummy.state).toBe(FighterState.IDLE);
  });
});

// ===========================================================================
// 3. Frame Advantage (3 tests)
// ===========================================================================
describe('TrainingModeController - Frame Advantage', () => {
  let ctrl: TrainingModeController;

  beforeEach(() => {
    ctrl = new TrainingModeController();
  });

  it('STAND_A on hit has positive advantage', () => {
    // STAND_A: startup=6, active=3, recovery=5, hitstun=11
    // total=14, advantage = 11 - (14-1) = 11 - 13 = -2
    const adv = ctrl.calculateFrameAdvantage(AttackType.STAND_A, 'hit');
    expect(adv).toBe(-2);
  });

  it('CLOSE_A on block has negative advantage', () => {
    // CLOSE_A: startup=4, active=5, recovery=5, blockstun=9
    // total=14, advantage = 9 - (14-1) = 9 - 13 = -4
    const adv = ctrl.calculateFrameAdvantage(AttackType.CLOSE_A, 'block');
    expect(adv).toBe(-4);
  });

  it('returns 0 when attack type has no frame data', () => {
    // Use an attack type not in FRAME_DATA (should return 0)
    const adv = ctrl.calculateFrameAdvantage('NONEXISTENT_ATTACK' as any, 'hit');
    expect(adv).toBe(0);
  });
});

// ===========================================================================
// 4. Frame Data Display (3 tests)
// ===========================================================================
describe('TrainingModeController - Frame Data Display', () => {
  let ctrl: TrainingModeController;

  beforeEach(() => {
    ctrl = new TrainingModeController();
  });

  it('shows startup, active, recovery for STAND_A', () => {
    const fd = ctrl.getFrameDataDisplay(AttackType.STAND_A);
    // STAND_A: startup=6, active=3, recovery=5
    expect(fd.startup).toBe(6);
    expect(fd.active).toBe(3);
    expect(fd.recovery).toBe(5);
  });

  it('shows damage and stun for CLOSE_C', () => {
    const fd = ctrl.getFrameDataDisplay(AttackType.CLOSE_C);
    // CLOSE_C: damage=100, hitstun=19
    expect(fd.damage).toBe(100);
    expect(fd.stun).toBe(19);
  });

  it('shows cancel options for light normal', () => {
    const fd = ctrl.getFrameDataDisplay(AttackType.CLOSE_A);
    expect(fd.cancelOptions).toContain('rapid');
    expect(fd.cancelOptions).toContain('special');
    expect(fd.cancelOptions).toContain('super');
  });
});

// ===========================================================================
// 5. Round Reset (2 tests)
// ===========================================================================
describe('TrainingModeController - Round Reset', () => {
  let ctrl: TrainingModeController;
  let p1: Fighter;
  let p2: Fighter;

  beforeEach(() => {
    ctrl = new TrainingModeController();
    p1 = makeFighter(STAGE_WIDTH * 0.33, 1);
    p2 = makeFighter(STAGE_WIDTH * 0.67, -1);
  });

  it('restores health to max for both fighters', () => {
    p1.health = 10;
    p2.health = 50;

    ctrl.resetRound(p1, p2);

    expect(p1.health).toBe(MAX_HEALTH);
    expect(p2.health).toBe(MAX_HEALTH);
  });

  it('resets positions to default', () => {
    p1.x = 999;
    p1.y = 100;
    p2.x = -50;
    p2.y = 200;

    ctrl.resetRound(p1, p2);

    expect(p1.x).toBe(STAGE_WIDTH * 0.33);
    expect(p1.y).toBe(STAGE_GROUND_Y);
    expect(p2.x).toBe(STAGE_WIDTH * 0.67);
    expect(p2.y).toBe(STAGE_GROUND_Y);
  });
});
