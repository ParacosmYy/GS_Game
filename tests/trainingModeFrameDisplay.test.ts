/**
 * trainingModeFrameDisplay.test.ts -- Frame data display and input display tests
 *
 * Covers: frame advantage calculation, move display, input history,
 *         dummy block/reversal behavior.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  TrainingModeController,
  TrainingModeState,
  DummyBehavior,
  DummyBehaviorConfig,
} from '../src/state/trainingMode.js';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState, AttackType } from '../src/core/types.js';
import type { PlayerInput } from '../src/core/types.js';
import { STAGE_WIDTH, MAX_HEALTH } from '../src/core/constants.js';

function makeFighter(x = STAGE_WIDTH * 0.33, facing: 1 | -1 = 1): Fighter {
  return new Fighter(x, '#ff6600', facing);
}

function makePlayerInput(overrides: Partial<PlayerInput> = {}): PlayerInput {
  return {
    up: false,
    down: false,
    left: false,
    right: false,
    buttonA: false,
    buttonB: false,
    buttonC: false,
    buttonD: false,
    throwAttack: false,
    start: false,
    ...overrides,
  };
}

// ===========================================================================
// 1. Frame Advantage Calculation (7 tests)
// ===========================================================================
describe('TrainingModeController - Frame Advantage Calculation', () => {
  let ctrl: TrainingModeController;

  beforeEach(() => {
    ctrl = new TrainingModeController();
  });

  it('STAND_A on hit: hitstun - (total-1)', () => {
    // STAND_A: startup=6, active=3, recovery=5, hitstun=11
    // total=14, advantage = 11 - 13 = -2
    const adv = ctrl.calculateFrameAdvantage(AttackType.STAND_A, 'hit');
    expect(adv).toBe(-2);
  });

  it('STAND_A on block: blockstun - (total-1)', () => {
    // STAND_A: startup=6, active=3, recovery=5, blockstun=9
    // total=14, advantage = 9 - 13 = -4
    const adv = ctrl.calculateFrameAdvantage(AttackType.STAND_A, 'block');
    expect(adv).toBe(-4);
  });

  it('STAND_C on hit has negative advantage (heavy)', () => {
    // STAND_C: startup=7, active=3, recovery=20, hitstun=19
    // total=30, advantage = 19 - 29 = -10
    const adv = ctrl.calculateFrameAdvantage(AttackType.STAND_C, 'hit');
    expect(adv).toBe(-10);
  });

  it('STAND_C on block has deeply negative advantage', () => {
    // STAND_C: startup=7, active=3, recovery=20, blockstun=15
    // total=30, advantage = 15 - 29 = -14
    const adv = ctrl.calculateFrameAdvantage(AttackType.STAND_C, 'block');
    expect(adv).toBe(-14);
  });

  it('CLOSE_A on hit: light attack advantage', () => {
    // CLOSE_A: startup=4, active=5, recovery=5, hitstun=11
    // total=14, advantage = 11 - 13 = -2
    const adv = ctrl.calculateFrameAdvantage(AttackType.CLOSE_A, 'hit');
    expect(adv).toBe(-2);
  });

  it('CLOSE_C on hit has positive advantage (fast heavy)', () => {
    // CLOSE_C: startup=2, active=5, recovery=11, hitstun=19
    // total=18, advantage = 19 - 17 = +2
    const adv = ctrl.calculateFrameAdvantage(AttackType.CLOSE_C, 'hit');
    expect(adv).toBe(2);
  });

  it('CROUCH_A on block: light crouch advantage', () => {
    // CROUCH_A: startup=5, active=4, recovery=7, blockstun=9
    // total=16, advantage = 9 - 15 = -6
    const adv = ctrl.calculateFrameAdvantage(AttackType.CROUCH_A, 'block');
    expect(adv).toBe(-6);
  });

  it('returns 0 for unknown attack type', () => {
    const adv = ctrl.calculateFrameAdvantage('NONEXISTENT' as any, 'hit');
    expect(adv).toBe(0);
  });

  it('block advantage is always <= hit advantage for same move', () => {
    // blockstun <= hitstun in KOF2002 data, so block advantage <= hit advantage
    const advHit = ctrl.calculateFrameAdvantage(AttackType.STAND_D, 'hit');
    const advBlock = ctrl.calculateFrameAdvantage(AttackType.STAND_D, 'block');
    expect(advBlock).toBeLessThanOrEqual(advHit);
  });
});

// ===========================================================================
// 2. Move Display (5 tests)
// ===========================================================================
describe('TrainingModeController - Move Display', () => {
  let ctrl: TrainingModeController;

  beforeEach(() => {
    ctrl = new TrainingModeController();
  });

  it('returns null for null attack type', () => {
    expect(ctrl.getCurrentMoveDisplay(null)).toBeNull();
  });

  it('returns null for unknown attack type', () => {
    expect(ctrl.getCurrentMoveDisplay('NONEXISTENT' as any)).toBeNull();
  });

  it('shows correct startup/active/recovery for STAND_C', () => {
    const display = ctrl.getCurrentMoveDisplay(AttackType.STAND_C)!;
    expect(display).not.toBeNull();
    expect(display.name).toBe('STAND_C');
    expect(display.startup).toBe(7);
    expect(display.active).toBe(3);
    expect(display.recovery).toBe(20);
  });

  it('shows correct hitstun/blockstun/damage for CLOSE_B', () => {
    const display = ctrl.getCurrentMoveDisplay(AttackType.CLOSE_B)!;
    // CLOSE_B: hitstun=11, blockstun=9, damage=25
    expect(display.hitstun).toBe(11);
    expect(display.blockstun).toBe(9);
    expect(display.damage).toBe(25);
  });

  it('shows guard type LOW for CROUCH_B', () => {
    const display = ctrl.getCurrentMoveDisplay(AttackType.CROUCH_B)!;
    expect(display.guardType).toBe('LOW');
  });

  it('shows guard type MID for STAND_A', () => {
    const display = ctrl.getCurrentMoveDisplay(AttackType.STAND_A)!;
    expect(display.guardType).toBe('MID');
  });

  it('shows cancel options for light normals (rapid+special+super)', () => {
    const display = ctrl.getCurrentMoveDisplay(AttackType.STAND_A)!;
    expect(display.cancelInto).toContain('rapid');
    expect(display.cancelInto).toContain('special');
    expect(display.cancelInto).toContain('super');
  });

  it('shows cancel options for heavy normals (special+super, no rapid)', () => {
    const display = ctrl.getCurrentMoveDisplay(AttackType.STAND_C)!;
    expect(display.cancelInto).not.toContain('rapid');
    expect(display.cancelInto).toContain('special');
    expect(display.cancelInto).toContain('super');
  });

  it('shows empty cancel options for specials', () => {
    const display = ctrl.getCurrentMoveDisplay(AttackType.SPECIAL_PROJECTILE)!;
    expect(display.cancelInto).toEqual([]);
  });
});

// ===========================================================================
// 3. Input History (5 tests)
// ===========================================================================
describe('TrainingModeController - Input History', () => {
  let ctrl: TrainingModeController;

  beforeEach(() => {
    ctrl = new TrainingModeController();
  });

  it('records and retrieves input', () => {
    const input = makePlayerInput({ right: true, buttonA: true });
    ctrl.recordInput(input, 10);

    const history = ctrl.getInputHistory();
    expect(history).toHaveLength(1);
    expect(history[0].frame).toBe(10);
    expect(history[0].direction).toBe('6');
    expect(history[0].buttons).toEqual(['A']);
  });

  it('records multiple inputs', () => {
    ctrl.recordInput(makePlayerInput({ up: true }), 1);
    ctrl.recordInput(makePlayerInput({ down: true, buttonC: true }), 2);
    ctrl.recordInput(makePlayerInput({ right: true, buttonA: true, buttonB: true }), 3);

    const history = ctrl.getInputHistory();
    expect(history).toHaveLength(3);
    expect(history[0].direction).toBe('8');
    expect(history[1].direction).toBe('2');
    expect(history[1].buttons).toEqual(['C']);
    expect(history[2].direction).toBe('6');
    expect(history[2].buttons).toEqual(['A', 'B']);
  });

  it('caps at 60 frames', () => {
    for (let i = 0; i < 80; i++) {
      ctrl.recordInput(makePlayerInput({ right: true }), i);
    }

    const history = ctrl.getInputHistory();
    expect(history).toHaveLength(60);
    // First entry should be frame 20 (oldest 20 dropped)
    expect(history[0].frame).toBe(20);
    // Last entry should be frame 79
    expect(history[59].frame).toBe(79);
  });

  it('maps all 8 directions correctly', () => {
    const directions: [Partial<PlayerInput>, string][] = [
      [{ up: true }, '8'],
      [{ up: true, right: true }, '9'],
      [{ right: true }, '6'],
      [{ down: true, right: true }, '3'],
      [{ down: true }, '2'],
      [{ down: true, left: true }, '1'],
      [{ left: true }, '4'],
      [{ up: true, left: true }, '7'],
    ];

    for (const [overrides, expectedDir] of directions) {
      ctrl.recordInput(makePlayerInput(overrides), 0);
    }

    const history = ctrl.getInputHistory();
    for (let i = 0; i < directions.length; i++) {
      expect(history[i].direction).toBe(directions[i][1]);
    }
  });

  it('neutral input maps to direction 5', () => {
    ctrl.recordInput(makePlayerInput(), 0);
    expect(ctrl.getInputHistory()[0].direction).toBe('5');
  });

  it('records throwAttack as CD button', () => {
    ctrl.recordInput(makePlayerInput({ throwAttack: true }), 0);
    expect(ctrl.getInputHistory()[0].buttons).toEqual(['CD']);
  });
});

// ===========================================================================
// 4. Dummy Block Behavior via TrainingModeState (4 tests)
// ===========================================================================
describe('TrainingModeState - Dummy Block Behavior', () => {
  let state: TrainingModeState;
  let p1: Fighter;
  let p2: Fighter;

  beforeEach(() => {
    state = new TrainingModeState();
    p1 = makeFighter(STAGE_WIDTH * 0.33, 1);
    p2 = makeFighter(STAGE_WIDTH * 0.67, -1);
  });

  it('BLOCK_ALL blocks MID attacks with stand guard', () => {
    state.dummyBehavior = DummyBehavior.BLOCK_ALL;
    // Simulate P1 doing a MID attack (STAND_A)
    p1.currentAttack = AttackType.STAND_A;
    p1.attackPhase = 'active';

    const input = state.getDummyInput(p1, p2, 0, -1);
    expect(input.back).toBe(true);
    expect(input.down).toBe(false);
  });

  it('BLOCK_ALL blocks LOW attacks with crouch guard', () => {
    state.dummyBehavior = DummyBehavior.BLOCK_ALL;
    // Simulate P1 doing a LOW attack (CROUCH_B)
    p1.currentAttack = AttackType.CROUCH_B;
    p1.attackPhase = 'active';

    const input = state.getDummyInput(p1, p2, 0, -1);
    expect(input.back).toBe(true);
    expect(input.down).toBe(true);
  });

  it('BLOCK_LOW only blocks LOW attacks', () => {
    state.dummyBehavior = DummyBehavior.BLOCK_LOW;

    // MID attack should NOT be blocked
    p1.currentAttack = AttackType.STAND_A;
    p1.attackPhase = 'active';
    let input = state.getDummyInput(p1, p2, 0, -1);
    expect(input.back).toBe(false);

    // LOW attack should be blocked
    p1.currentAttack = AttackType.CROUCH_B;
    input = state.getDummyInput(p1, p2, 0, -1);
    expect(input.back).toBe(true);
    expect(input.down).toBe(true);
  });

  it('BLOCK_HIGH only blocks MID/HIGH attacks', () => {
    state.dummyBehavior = DummyBehavior.BLOCK_HIGH;

    // MID attack should be blocked
    p1.currentAttack = AttackType.STAND_A;
    p1.attackPhase = 'active';
    let input = state.getDummyInput(p1, p2, 0, -1);
    expect(input.back).toBe(true);

    // LOW attack should NOT be blocked
    p1.currentAttack = AttackType.CROUCH_B;
    input = state.getDummyInput(p1, p2, 0, -1);
    expect(input.back).toBe(false);
  });

  it('BLOCK_ALL does not block when P1 is not attacking', () => {
    state.dummyBehavior = DummyBehavior.BLOCK_ALL;
    p1.currentAttack = null;
    p1.attackPhase = 'none';

    const input = state.getDummyInput(p1, p2, 0, -1);
    expect(input.back).toBe(false);
    expect(input.down).toBe(false);
  });
});

// ===========================================================================
// 5. Dummy Reversal Behavior (3 tests)
// ===========================================================================
describe('TrainingModeState - Dummy Reversal Behavior', () => {
  let state: TrainingModeState;
  let p1: Fighter;
  let p2: Fighter;

  beforeEach(() => {
    state = new TrainingModeState();
    p1 = makeFighter(STAGE_WIDTH * 0.33, 1);
    p2 = makeFighter(STAGE_WIDTH * 0.67, -1);
    p2.blockstunTimer = 0;
  });

  it('REVERSAL blocks incoming attacks then attempts DP after blockstun ends', () => {
    state.dummyBehavior = DummyBehavior.REVERSAL;

    // Phase 1: P1 attacks, dummy blocks and enters blockstun
    p1.currentAttack = AttackType.STAND_A;
    p1.attackPhase = 'active';
    // Simulate dummy being in blockstun from the attack (blockstun is active)
    p2.blockstunTimer = 9;
    const input1 = state.getDummyInput(p1, p2, 0, -1);
    expect(input1.back).toBe(true);
    expect((state as any)._reversalPending).toBe(true);

    // Phase 2: blockstun still active, no DP yet
    p1.attackPhase = 'none';
    p1.currentAttack = null;
    p2.blockstunTimer = 5;
    const input2 = state.getDummyInput(p1, p2, 1, -1);
    // Should not DP while in blockstun
    expect(input2.forward).toBe(false);
    expect(input2.buttonC).toBe(false);

    // Phase 3: blockstun ends, dummy attempts DP
    p2.blockstunTimer = 0;
    expect(p2.canAct()).toBe(true);
    const input3 = state.getDummyInput(p1, p2, 2, -1);
    // DP motion: forward + down + punch
    expect(input3.forward).toBe(true);
    expect(input3.down).toBe(true);
    expect(input3.buttonC).toBe(true);
    expect((state as any)._reversalPending).toBe(false);
  });

  it('REVERSAL does not DP while still in blockstun', () => {
    state.dummyBehavior = DummyBehavior.REVERSAL;

    // Simulate being attacked (sets reversal pending) with blockstun active
    p1.currentAttack = AttackType.STAND_C;
    p1.attackPhase = 'active';
    p2.blockstunTimer = 15;
    state.getDummyInput(p1, p2, 0, -1);

    // Still in blockstun
    p2.blockstunTimer = 10;
    p1.attackPhase = 'none';
    const input = state.getDummyInput(p1, p2, 1, -1);
    // Should NOT attempt DP while in blockstun
    expect(input.forward).toBe(false);
    expect(input.buttonC).toBe(false);
  });

  it('REVERSAL blocks LOW attacks with crouch guard', () => {
    state.dummyBehavior = DummyBehavior.REVERSAL;

    // LOW attack
    p1.currentAttack = AttackType.CROUCH_B;
    p1.attackPhase = 'active';

    const input = state.getDummyInput(p1, p2, 0, -1);
    expect(input.back).toBe(true);
    expect(input.down).toBe(true);
  });
});

// ===========================================================================
// 6. setDummyBehavior (2 tests)
// ===========================================================================
describe('TrainingModeController - setDummyBehavior', () => {
  let ctrl: TrainingModeController;

  beforeEach(() => {
    ctrl = new TrainingModeController();
  });

  it('sets the dummy behavior correctly', () => {
    ctrl.setDummyBehavior('block_all');
    expect(ctrl.config.dummyBehavior).toBe('block_all');

    ctrl.setDummyBehavior('reversal');
    expect(ctrl.config.dummyBehavior).toBe('reversal');

    ctrl.setDummyBehavior('stand');
    expect(ctrl.config.dummyBehavior).toBe('stand');
  });

  it('accepts all valid behavior types', () => {
    const behaviors: DummyBehaviorConfig[] = [
      'stand', 'crouch', 'jump', 'block_all', 'block_high', 'block_low',
      'reversal', 'random', 'playback',
    ];
    for (const b of behaviors) {
      ctrl.setDummyBehavior(b);
      expect(ctrl.config.dummyBehavior).toBe(b);
    }
  });
});

// ===========================================================================
// 7. KOF2002 Known Values Validation (3 tests)
// ===========================================================================
describe('Frame Advantage - KOF2002 Known Values', () => {
  let ctrl: TrainingModeController;

  beforeEach(() => {
    ctrl = new TrainingModeController();
  });

  it('CLOSE_C is plus on hit (KOF2002: close C is one of the best punishes)', () => {
    // CLOSE_C: startup=2, active=5, recovery=11, hitstun=19
    // total=18, advantage = 19 - 17 = +2
    const adv = ctrl.calculateFrameAdvantage(AttackType.CLOSE_C, 'hit');
    expect(adv).toBeGreaterThan(0);
    expect(adv).toBe(2);
  });

  it('CROUCH_D sweep on hit is deeply minus', () => {
    // CROUCH_D: startup=5, active=6, recovery=31, hitstun=0
    // total=42, advantage = 0 - 41 = -41
    const adv = ctrl.calculateFrameAdvantage(AttackType.CROUCH_D, 'hit');
    expect(adv).toBe(-41);
  });

  it('STAND_CD on block is unsafe', () => {
    // STAND_CD: startup=11, active=5, recovery=24, blockstun=21
    // total=40, advantage = 21 - 39 = -18
    const adv = ctrl.calculateFrameAdvantage(AttackType.STAND_CD, 'block');
    expect(adv).toBeLessThan(0);
    expect(adv).toBe(-18);
  });
});
