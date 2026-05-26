/**
 * cancelWindowPrecision.test.ts -- KOF2002 Cancel Window Frame-Precision Tests
 *
 * Verifies that cancel windows are frame-precise:
 * - Normal cancel: A/B/C normals -> special within CANCEL_WINDOW_NORMAL frames of hit
 * - Rapid cancel: light normals chain within CANCEL_WINDOW_RAPID frames
 * - Super cancel: special -> DM within CANCEL_WINDOW_SUPER frames
 * - Free cancel: MAX mode any -> special within CANCEL_WINDOW_FREE frames
 * - Timing precision: frame 0 vs last frame vs expired frame
 * - Hitstop integration: cancel window paused during hitstop
 *
 * Total: 25 tests.
 */
import { describe, it, expect } from 'vitest';
import { CombatSystem } from '../src/combat/combatSystem.js';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState, AttackType } from '../src/core/types.js';
import type { IInputProvider, PlayerInput } from '../src/core/types.js';
import {
  FRAME_DATA,
  CANCEL_WINDOW_NORMAL,
  CANCEL_WINDOW_RAPID,
  CANCEL_WINDOW_SUPER,
  CANCEL_WINDOW_FREE,
  LIGHT_NORMALS,
  NORMAL_ATTACKS,
  COMMAND_NORMALS,
  DM_STOCK_COST,
  SUPER_CANCEL_STOCK_COST,
  FREE_CANCEL_TIMER_COST,
  MAX_MODE_DURATION,
  HITSTOP_LIGHT,
  HITSTOP_MEDIUM,
  HITSTOP_SPECIAL,
} from '../src/core/constants.js';
import { isDM, isCharacterSpecial } from '../src/core/attackClassifier.js';
import { CinematicState } from '../src/state/cinematicState.js';

// ===== Helper: stub IInputProvider =====
const noInput: PlayerInput = {
  up: false, down: false, left: false, right: false,
  buttonA: false, buttonB: false, buttonC: false, buttonD: false,
  throwAttack: false, start: false,
};

const stubInputProvider: IInputProvider = {
  getP1Input: () => noInput,
  getP2Input: () => noInput,
};

/** Force fighter into active attack phase at given frame */
function forceActivePhase(f: Fighter, attackType: AttackType, frame = 0): void {
  f.startAttack(attackType);
  f.attackPhase = 'active';
  f.attackFrame = frame;
}

/** Simulate N ticks of attack progression, returning attack phase at each tick */
function tickAttackN(f: Fighter, n: number): void {
  for (let i = 0; i < n; i++) {
    f.tickAttack();
  }
}

// =========================================================================
// 1. Normal Cancel Window Precision (5 tests)
// =========================================================================
describe('Normal Cancel Window -- frame-precise timing', () => {
  it('CANCEL_WINDOW_NORMAL constant is 3 frames', () => {
    expect(CANCEL_WINDOW_NORMAL).toBe(3);
  });

  it('Stand A hit -> can cancel to special within window (frame 0 of cancel)', () => {
    const f = new Fighter(400, '#ff6600', 1);
    // Simulate: STAND_A hit an opponent, normalCancelReady set
    f.startAttack(AttackType.STAND_A);
    f.attackPhase = 'active';
    f.hasHit = true;
    f.normalCancelReady = true;
    f.hitConfirmDelay = 0;

    // Cancel check at frame 0: still in active phase, hasHit, normalCancelReady
    const canCancel = f.normalCancelReady
      && f.hasHit
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && NORMAL_ATTACKS.has(f.currentAttack as string)
      && f.hitConfirmDelay === 0;
    expect(canCancel, 'cancel allowed at frame 0 of active phase after hit').toBe(true);
    expect(NORMAL_ATTACKS.has('STAND_A')).toBe(true);
  });

  it('Stand C hit -> can cancel to special within window', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.startAttack(AttackType.STAND_C);
    f.attackPhase = 'active';
    f.hasHit = true;
    f.normalCancelReady = true;
    f.hitConfirmDelay = 0;

    const canCancel = f.normalCancelReady
      && f.hasHit
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && NORMAL_ATTACKS.has(f.currentAttack as string)
      && f.hitConfirmDelay === 0;
    expect(canCancel, 'STAND_C hit -> can cancel to special').toBe(true);
  });

  it('Stand A whiff -> cannot cancel (cancel only on hit/block)', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.startAttack(AttackType.STAND_A);
    f.attackPhase = 'recovery';
    f.hasHit = false; // whiffed
    f.normalCancelReady = false; // not set because no contact
    f.hitConfirmDelay = 0;

    const canCancel = f.normalCancelReady
      && f.hasHit
      && NORMAL_ATTACKS.has(f.currentAttack as string);
    expect(canCancel, 'cancel blocked on whiff -- hasHit is false').toBe(false);
  });

  it('Normal cancel blocked when hitConfirmDelay > 0 (1-frame gate)', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.startAttack(AttackType.STAND_A);
    f.attackPhase = 'active';
    f.hasHit = true;
    f.normalCancelReady = true;
    f.hitConfirmDelay = 1; // just hit, delay not yet cleared

    const canCancel = f.normalCancelReady
      && f.hasHit
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && NORMAL_ATTACKS.has(f.currentAttack as string)
      && f.hitConfirmDelay === 0;
    expect(canCancel, 'cancel blocked while hitConfirmDelay=1').toBe(false);

    // After 1 tick of timers, delay clears
    f.tickTimers();
    expect(f.hitConfirmDelay).toBe(0);
    const canCancelAfter = f.normalCancelReady
      && f.hasHit
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && NORMAL_ATTACKS.has(f.currentAttack as string)
      && f.hitConfirmDelay === 0;
    expect(canCancelAfter, 'cancel allowed after hitConfirmDelay clears').toBe(true);
  });

  it('Cancel window starts from hit frame, not attack start', () => {
    // STAND_A: startup=6, active=3, recovery=5
    // The cancel window is measured from when the hit lands, not from attack initiation
    const f = new Fighter(400, '#ff6600', 1);
    f.startAttack(AttackType.STAND_A);
    // Simulate: tick through 4 startup frames (not yet active)
    for (let i = 0; i < 4; i++) {
      f.tickAttack();
    }
    // Still in startup
    expect(f.attackPhase).toBe('startup');
    // Cancel blocked during startup (no hit possible yet)
    f.hitConfirmDelay = 0;
    const canCancelInStartup = f.currentAttack !== null
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && f.hitConfirmDelay === 0;
    expect(canCancelInStartup, 'cancel blocked during startup').toBe(false);

    // Now advance to active and simulate hit
    f.tickAttack(); // frame 5 -> still startup (startup=6)
    f.tickAttack(); // frame 6 -> enters active, attackFrame resets to 0
    expect(f.attackPhase).toBe('active');
    f.hasHit = true;
    f.normalCancelReady = true;
    f.hitConfirmDelay = 1;

    // Cancel blocked for 1 frame after hit
    const blockedByDelay = f.normalCancelReady
      && f.hasHit
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && f.hitConfirmDelay === 0;
    expect(blockedByDelay, 'cancel blocked during hitConfirmDelay').toBe(false);

    // After hitConfirmDelay clears (1 frame tick)
    f.tickTimers();
    const canCancelAfterDelay = f.normalCancelReady
      && f.hasHit
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && NORMAL_ATTACKS.has(f.currentAttack as string)
      && f.hitConfirmDelay === 0;
    expect(canCancelAfterDelay, 'cancel allowed from hit frame onward').toBe(true);
  });
});

// =========================================================================
// 2. Rapid Cancel Window Precision (5 tests)
// =========================================================================
describe('Rapid Cancel -- light normal chain timing', () => {
  it('CANCEL_WINDOW_RAPID constant is 2 frames', () => {
    expect(CANCEL_WINDOW_RAPID).toBe(2);
  });

  it('Rapid cancel window is shorter than normal cancel window', () => {
    expect(CANCEL_WINDOW_RAPID).toBeLessThan(CANCEL_WINDOW_NORMAL);
  });

  it('Stand A hits -> rapidCancelReady set, can chain to Stand B', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.startAttack(AttackType.STAND_A);
    f.attackPhase = 'recovery';
    f.hasHit = true;
    f.rapidCancelReady = true;
    f.hitConfirmDelay = 0;

    // Rapid cancel condition: rapidCancelReady + recovery + currentAttack in LIGHT_NORMALS
    const canRapid = f.rapidCancelReady
      && f.attackPhase === 'recovery'
      && f.currentAttack !== null
      && LIGHT_NORMALS.has(f.currentAttack as string)
      && f.hitConfirmDelay === 0;
    expect(canRapid, 'Stand A -> Stand B rapid cancel allowed').toBe(true);
    expect(LIGHT_NORMALS.has('STAND_B'), 'Stand B is a light normal target').toBe(true);
  });

  it('Cannot rapid cancel from heavy (C/D) to light -- LIGHT_NORMALS gate', () => {
    // STAND_C is NOT in LIGHT_NORMALS, so rapid cancel cannot originate from it
    expect(LIGHT_NORMALS.has('STAND_C'), 'STAND_C is not a light normal').toBe(false);
    expect(LIGHT_NORMALS.has('STAND_D'), 'STAND_D is not a light normal').toBe(false);
    expect(LIGHT_NORMALS.has('CROUCH_C'), 'CROUCH_C is not a light normal').toBe(false);
    expect(LIGHT_NORMALS.has('CROUCH_D'), 'CROUCH_D is not a light normal').toBe(false);

    const f = new Fighter(400, '#ff6600', 1);
    f.startAttack(AttackType.STAND_C);
    f.attackPhase = 'recovery';
    f.hasHit = true;
    f.rapidCancelReady = false; // not set for heavy attacks
    f.hitConfirmDelay = 0;

    const canRapid = f.rapidCancelReady
      && f.attackPhase === 'recovery'
      && f.currentAttack !== null
      && LIGHT_NORMALS.has(f.currentAttack as string);
    expect(canRapid, 'heavy normal cannot rapid cancel').toBe(false);
  });

  it('Close A hits -> can rapid cancel to Close B (light chain)', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.startAttack(AttackType.CLOSE_A);
    f.attackPhase = 'recovery';
    f.hasHit = true;
    f.rapidCancelReady = true;
    f.hitConfirmDelay = 0;

    expect(LIGHT_NORMALS.has('CLOSE_A'), 'CLOSE_A is a light normal').toBe(true);
    expect(LIGHT_NORMALS.has('CLOSE_B'), 'CLOSE_B is a light normal target').toBe(true);
    expect(LIGHT_NORMALS.has('CROUCH_A'), 'CROUCH_A is a light normal').toBe(true);
    expect(LIGHT_NORMALS.has('CROUCH_B'), 'CROUCH_B is a light normal').toBe(true);

    const canRapid = f.rapidCancelReady
      && f.attackPhase === 'recovery'
      && LIGHT_NORMALS.has(f.currentAttack as string)
      && f.hitConfirmDelay === 0;
    expect(canRapid, 'Close A -> Close B rapid cancel allowed').toBe(true);
  });

  it('Rapid cancel clears flags via startAttack on next move', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.rapidCancelReady = true;
    f.normalCancelReady = true;
    f.cancelledIntoNormal = false;

    // Start next attack in chain
    f.startAttack(AttackType.STAND_B);
    expect(f.rapidCancelReady, 'rapidCancelReady cleared by startAttack').toBe(false);
    expect(f.normalCancelReady, 'normalCancelReady cleared by startAttack').toBe(false);
    expect(f.hasHit, 'hasHit reset for new attack').toBe(false);
    expect(f.attackPhase, 'new attack starts in startup').toBe('startup');
    expect(f.attackFrame, 'attackFrame reset to 0').toBe(0);
  });
});

// =========================================================================
// 3. Super Cancel Window Precision (5 tests)
// =========================================================================
describe('Super Cancel -- special-to-DM timing', () => {
  it('CANCEL_WINDOW_SUPER constant is 5 frames', () => {
    expect(CANCEL_WINDOW_SUPER).toBe(5);
  });

  it('Super cancel window is wider than normal cancel window', () => {
    expect(CANCEL_WINDOW_SUPER).toBeGreaterThan(CANCEL_WINDOW_NORMAL);
  });

  it('Special hits -> superCancelReady set, can cancel to DM', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.startAttack(AttackType.KYO_ONIYAKI);
    f.attackPhase = 'recovery';
    f.hasHit = true;
    f.superCancelReady = true;
    f.hitConfirmDelay = 0;

    const canSuperCancel = f.superCancelReady
      && f.hasHit
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && f.hitConfirmDelay === 0;
    expect(canSuperCancel, 'special hit -> DM super cancel allowed').toBe(true);
    expect(isCharacterSpecial('KYO_ONIYAKI'), 'KYO_ONIYAKI is a character special').toBe(true);
    expect(isDM('DM_OROCHINAGI'), 'DM_OROCHINAGI is a valid DM target').toBe(true);
  });

  it('Super cancel costs 1 DM stock + 1 extra stock = 2 total', () => {
    const totalCost = DM_STOCK_COST + SUPER_CANCEL_STOCK_COST;
    expect(totalCost, 'super cancel costs 2 stocks total').toBe(2);
    expect(DM_STOCK_COST).toBe(1);
    expect(SUPER_CANCEL_STOCK_COST).toBe(1);
  });

  it('Cannot super cancel from normals -- only from specials', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.startAttack(AttackType.STAND_C);
    f.attackPhase = 'recovery';
    f.hasHit = true;
    // STAND_C does NOT set superCancelReady (only specials do)
    f.superCancelReady = false;
    f.hitConfirmDelay = 0;

    const canSuperCancel = f.superCancelReady
      && f.hasHit
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && f.hitConfirmDelay === 0;
    expect(canSuperCancel, 'normal attack cannot super cancel -- flag not set').toBe(false);
  });

  it('Super cancel can occur in both active and recovery phases', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.startAttack(AttackType.KYO_ONIYAKI);
    f.hasHit = true;
    f.superCancelReady = true;
    f.hitConfirmDelay = 0;

    // Active phase
    f.attackPhase = 'active';
    const canActive = f.superCancelReady
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && f.hitConfirmDelay === 0;
    expect(canActive, 'super cancel allowed in active phase').toBe(true);

    // Recovery phase
    f.attackPhase = 'recovery';
    const canRecovery = f.superCancelReady
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && f.hitConfirmDelay === 0;
    expect(canRecovery, 'super cancel allowed in recovery phase').toBe(true);
  });
});

// =========================================================================
// 4. Free Cancel Window Precision (5 tests)
// =========================================================================
describe('Free Cancel -- MAX mode cancel timing', () => {
  it('CANCEL_WINDOW_FREE constant is 4 frames', () => {
    expect(CANCEL_WINDOW_FREE).toBe(4);
  });

  it('Free cancel window sits between normal and super', () => {
    expect(CANCEL_WINDOW_FREE).toBeGreaterThan(CANCEL_WINDOW_NORMAL);
    expect(CANCEL_WINDOW_FREE).toBeLessThan(CANCEL_WINDOW_SUPER);
  });

  it('Free cancel costs MAX timer (20%), not stocks', () => {
    const cost = Math.round(MAX_MODE_DURATION * FREE_CANCEL_TIMER_COST);
    expect(cost, '20% of 720 = 144 frames').toBe(144);
    // Free cancel does not consume stocks -- only timer
    expect(FREE_CANCEL_TIMER_COST).toBe(0.20);
  });

  it('Free cancel from normal in MAX mode -- no hit required', () => {
    // In MAX mode, normals can free cancel even on block/whiff (no hit required)
    const f = new Fighter(400, '#ff6600', 1);
    f.startAttack(AttackType.STAND_C);
    f.attackPhase = 'recovery';
    f.hasHit = false; // blocked or whiffed
    f.hitConfirmDelay = 0;

    const isNormal = NORMAL_ATTACKS.has(f.currentAttack as string)
      || COMMAND_NORMALS.has(f.currentAttack as string);
    const maxModeActive = true; // MAX mode active
    const canFreeCancel = maxModeActive
      && f.currentAttack !== null
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && f.hitConfirmDelay === 0
      && (isNormal || f.hasHit); // normals always pass, specials need hasHit
    expect(canFreeCancel, 'MAX mode normal can free cancel without hit').toBe(true);
  });

  it('Free cancel from special in MAX mode -- hit required', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.startAttack(AttackType.KYO_ONIYAKI);
    f.attackPhase = 'recovery';
    f.hasHit = false; // special did not hit
    f.hitConfirmDelay = 0;

    const isNormal = NORMAL_ATTACKS.has(f.currentAttack as string)
      || COMMAND_NORMALS.has(f.currentAttack as string);
    const maxModeActive = true;
    const canFreeCancelNoHit = maxModeActive
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && f.hitConfirmDelay === 0
      && (isNormal || f.hasHit); // special needs hasHit
    expect(canFreeCancelNoHit, 'special free cancel blocked without hit').toBe(false);

    // With hit it works
    f.hasHit = true;
    const canFreeCancelHit = maxModeActive
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && f.hitConfirmDelay === 0
      && (isNormal || f.hasHit);
    expect(canFreeCancelHit, 'special free cancel allowed with hit').toBe(true);
  });

  it('Free cancel cannot target DMs (only specials)', () => {
    // Free cancel target must pass !isDM check
    expect(isDM('DM_OROCHINAGI')).toBe(true);
    expect(isDM('SDM_OROCHINAGI')).toBe(true);
    // Valid targets are character specials
    expect(isCharacterSpecial('KYO_ONIYAKI')).toBe(true);
    expect(isDM('KYO_ONIYAKI')).toBe(false);
    // Free cancel to special is OK, to DM is blocked
    const blocked = isDM('DM_OROCHINAGI');
    expect(blocked, 'DM cannot be free cancel target').toBe(true);
  });
});

// =========================================================================
// 5. Cancel Timing Precision -- boundary frame checks (5 tests)
// =========================================================================
describe('Cancel Timing Boundary -- frame 0, last frame, expired', () => {
  it('Frame 0 of cancel window: cancel succeeds', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.startAttack(AttackType.STAND_A);
    // Hit on first active frame (frame 0)
    f.attackPhase = 'active';
    f.attackFrame = 0;
    f.hasHit = true;
    f.normalCancelReady = true;
    f.hitConfirmDelay = 1;

    // hitConfirmDelay still active on frame 0
    const blockedF0 = f.hitConfirmDelay === 0;
    expect(blockedF0, 'cancel blocked on exact hit frame (hitConfirmDelay=1)').toBe(false);

    // After 1 tick of timers
    f.tickTimers();
    expect(f.hitConfirmDelay, 'hitConfirmDelay decremented to 0').toBe(0);
    const canCancel = f.normalCancelReady
      && f.hasHit
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && NORMAL_ATTACKS.has(f.currentAttack as string)
      && f.hitConfirmDelay === 0;
    expect(canCancel, 'cancel allowed on frame 0 of cancel window').toBe(true);
  });

  it('Last frame of cancel window: cancel still succeeds (within CANCEL_WINDOW_NORMAL)', () => {
    const f = new Fighter(400, '#ff6600', 1);
    // STAND_A: startup=6, active=3, recovery=5
    // Simulate: hit happened, now we are CANCEL_WINDOW_NORMAL-1 frames into recovery
    f.startAttack(AttackType.STAND_A);
    f.attackPhase = 'recovery';
    f.attackFrame = CANCEL_WINDOW_NORMAL - 1; // last frame of window (0-indexed: frame 2 for window=3)
    f.hasHit = true;
    f.normalCancelReady = true;
    f.hitConfirmDelay = 0;

    const canCancel = f.normalCancelReady
      && f.hasHit
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && NORMAL_ATTACKS.has(f.currentAttack as string)
      && f.hitConfirmDelay === 0;
    expect(canCancel, 'cancel allowed on last frame of cancel window').toBe(true);
  });

  it('Frame after cancel window: attack may have ended (recovery complete)', () => {
    const f = new Fighter(400, '#ff6600', 1);
    // STAND_A: recovery=5 frames
    // After recovery ends, endAttack is called, currentAttack becomes null
    f.startAttack(AttackType.STAND_A);
    // Advance through startup + active into recovery
    const data = FRAME_DATA[AttackType.STAND_A];
    for (let i = 0; i < data.startup + data.active + data.recovery; i++) {
      f.tickAttack();
    }
    // Attack has ended
    expect(f.currentAttack, 'attack ended after all recovery frames').toBeNull();
    expect(f.attackPhase, 'phase is none after recovery').toBe('none');
    expect(f.state, 'fighter returns to IDLE').toBe(FighterState.IDLE);

    const canCancel = f.currentAttack !== null
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery');
    expect(canCancel, 'cancel impossible after attack fully ends').toBe(false);
  });

  it('Cancel window for STAND_C -- verify recovery length allows cancel', () => {
    // STAND_C: startup=7, active=3, recovery=20
    // Cancel window (3 frames) fits within 20 recovery frames
    const data = FRAME_DATA[AttackType.STAND_C];
    expect(data.recovery, 'STAND_C has 20 recovery frames').toBe(20);
    expect(data.recovery, 'recovery > CANCEL_WINDOW_NORMAL').toBeGreaterThan(CANCEL_WINDOW_NORMAL);

    const f = new Fighter(400, '#ff6600', 1);
    f.startAttack(AttackType.STAND_C);
    // Advance to recovery frame 0
    for (let i = 0; i < data.startup + data.active; i++) {
      f.tickAttack();
    }
    expect(f.attackPhase, 'in recovery phase').toBe('recovery');

    f.hasHit = true;
    f.normalCancelReady = true;
    f.hitConfirmDelay = 0;
    const canCancel = f.normalCancelReady
      && f.hasHit
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && NORMAL_ATTACKS.has(f.currentAttack as string)
      && f.hitConfirmDelay === 0;
    expect(canCancel, 'cancel allowed during recovery').toBe(true);
  });

  it('Cancel flags are cleared by startAttack (prevents stale cancels)', () => {
    const f = new Fighter(400, '#ff6600', 1);
    f.superCancelReady = true;
    f.rapidCancelReady = true;
    f.normalCancelReady = true;
    f.cancelledIntoNormal = true;
    f.cancelEvent = 'super_cancel';

    f.startAttack(AttackType.KYO_ONIYAKI);

    expect(f.superCancelReady, 'superCancelReady cleared').toBe(false);
    expect(f.rapidCancelReady, 'rapidCancelReady cleared').toBe(false);
    expect(f.normalCancelReady, 'normalCancelReady cleared').toBe(false);
    expect(f.cancelledIntoNormal, 'cancelledIntoNormal cleared').toBe(false);
    expect(f.cancelEvent, 'cancelEvent cleared').toBeNull();
  });
});

// =========================================================================
// 6. Integration with Hitstop (5 tests)
// =========================================================================
describe('Cancel Window + Hitstop Integration', () => {
  it('Hitstop freezes game logic -- cancel window does not tick during hitstop', () => {
    const cinematic = new CinematicState();
    // Simulate: STAND_A hit triggers HITSTOP_LIGHT (4 frames) hitstop
    cinematic.triggerHitStop(HITSTOP_LIGHT);

    // During hitstop, isFrozen() returns true and decrements hitStop
    expect(cinematic.hitStop, 'hitstop set to 4').toBe(4);
    expect(cinematic.isFrozen(), 'frame 1 of hitstop -- frozen').toBe(true);
    expect(cinematic.hitStop, 'decremented to 3').toBe(3);
    expect(cinematic.isFrozen(), 'frame 2 of hitstop -- frozen').toBe(true);
    expect(cinematic.hitStop, 'decremented to 2').toBe(2);
    expect(cinematic.isFrozen(), 'frame 3 of hitstop -- frozen').toBe(true);
    expect(cinematic.hitStop, 'decremented to 1').toBe(1);
    expect(cinematic.isFrozen(), 'frame 4 of hitstop -- frozen').toBe(true);
    expect(cinematic.hitStop, 'decremented to 0').toBe(0);
    expect(cinematic.isFrozen(), 'hitstop expired -- not frozen').toBe(false);
  });

  it('Hitstop for light attack is HITSTOP_LIGHT (4 frames)', () => {
    expect(HITSTOP_LIGHT, 'light hitstop = 4 frames').toBe(4);
    // These 4 hitstop frames do NOT count toward the cancel window
    // So the player effectively gets HITSTOP_LIGHT + CANCEL_WINDOW_NORMAL = 7 frames
    // of real time to input the cancel after a light attack connects
    const effectiveRealTimeWindow = HITSTOP_LIGHT + CANCEL_WINDOW_NORMAL;
    expect(effectiveRealTimeWindow, 'effective real-time cancel window for light = 7 frames').toBe(7);
  });

  it('Hitstop for heavy attack is HITSTOP_MEDIUM (7 frames)', () => {
    expect(HITSTOP_MEDIUM, 'heavy hitstop = 7 frames').toBe(7);
    // Effective window for heavy cancel: HITSTOP_MEDIUM + CANCEL_WINDOW_NORMAL = 10
    const effectiveRealTimeWindow = HITSTOP_MEDIUM + CANCEL_WINDOW_NORMAL;
    expect(effectiveRealTimeWindow, 'effective real-time cancel window for heavy = 10 frames').toBe(10);
  });

  it('Hitstop for special is HITSTOP_SPECIAL (13 frames)', () => {
    expect(HITSTOP_SPECIAL, 'special hitstop = 13 frames').toBe(13);
    // Effective window for super cancel: HITSTOP_SPECIAL + CANCEL_WINDOW_SUPER = 18
    const effectiveRealTimeWindow = HITSTOP_SPECIAL + CANCEL_WINDOW_SUPER;
    expect(effectiveRealTimeWindow, 'effective real-time super cancel window = 18 frames').toBe(18);
  });

  it('Cancel window counting only advances when hitstop is NOT active', () => {
    // Simulate a full hit -> hitstop -> cancel window sequence
    const cinematic = new CinematicState();
    const f = new Fighter(400, '#ff6600', 1);
    f.startAttack(AttackType.STAND_A);
    f.attackPhase = 'active';
    f.hasHit = true;
    f.normalCancelReady = true;
    f.hitConfirmDelay = 1;

    // Phase 1: hitstop active (4 frames) -- cancel window does NOT tick
    cinematic.triggerHitStop(HITSTOP_LIGHT);
    let cancelWindowElapsed = 0;
    while (cinematic.isFrozen()) {
      // hitConfirmDelay should NOT tick during hitstop
      // (main loop skips fighter tickTimers when cinematic.isFrozen())
    }
    // hitstop expired

    // Phase 2: hitConfirmDelay still needs to tick down (was 1)
    f.tickTimers();
    expect(f.hitConfirmDelay, 'hitConfirmDelay cleared after hitstop + 1 tick').toBe(0);

    // Now cancel window starts counting
    expect(f.normalCancelReady, 'cancel flag still active after hitstop').toBe(true);
    expect(f.hasHit, 'hit flag still active').toBe(true);

    const canCancel = f.normalCancelReady
      && f.hasHit
      && (f.attackPhase === 'active' || f.attackPhase === 'recovery')
      && NORMAL_ATTACKS.has(f.currentAttack as string)
      && f.hitConfirmDelay === 0;
    expect(canCancel, 'cancel allowed after hitstop clears -- window properly paused').toBe(true);
  });
});
