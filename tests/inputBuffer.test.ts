/**
 * Input Buffer Consolidated Tests
 *
 * Merged from: inputBuffer, inputWindow, inputEdgeCases, inputBufferResolver
 *
 * Covers: constants, direction recording, QCF/DP/HCB/DD detection, negative edge,
 *   command window timing, charge detection, DM motion, recovery buffer,
 *   inputResolver pure functions, display helpers.
 */
import { describe, it, expect } from 'vitest';
import { CommandBuffer, type ChargeDirection, type ChargeState } from '../src/input/commandBuffer.js';
import { AttackType, type Direction } from '../src/core/types.js';
import {
  COMMAND_WINDOW,
  HCF_WINDOW,
  DOUBLE_QCF_WINDOW,
  CHARGE_FRAMES_REQUIRED,
  RECOVERY_INPUT_BUFFER,
} from '../src/core/constants.js';
import {
  resolveInput,
  getDirectionInput,
  createPrevAttack,
  updatePrevAttack,
  getDirectionSymbol,
  getButtonDisplayString,
  getPressedButtonString,
  getCommandName,
  type RawInput,
} from '../src/input/inputResolver.js';

// ── 0. Constants ──────────────────────────────────────────────
describe('Input constants', () => {
  it('COMMAND_WINDOW should be 18', () => {
    expect(COMMAND_WINDOW).toBe(18);
  });
  it('RECOVERY_INPUT_BUFFER should be 10', () => {
    expect(RECOVERY_INPUT_BUFFER).toBe(10);
  });
  it('HCF_WINDOW should be 35', () => {
    expect(HCF_WINDOW).toBe(35);
  });
  it('DOUBLE_QCF_WINDOW should be 45', () => {
    expect(DOUBLE_QCF_WINDOW).toBe(45);
  });
  it('CHARGE_FRAMES_REQUIRED should be 40', () => {
    expect(CHARGE_FRAMES_REQUIRED).toBe(40);
  });
  it('window ordering: COMMAND < HCF < DOUBLE_QCF', () => {
    expect(COMMAND_WINDOW).toBeLessThan(HCF_WINDOW);
    expect(HCF_WINDOW).toBeLessThan(DOUBLE_QCF_WINDOW);
  });
});

// ── 1. Button Recording ─────────────────────────────────────
describe('Button Recording', () => {
  it('recordPress stores button press events', () => {
    const cb = new CommandBuffer();
    cb.recordPress('punch', 10);
    expect(cb.wasRecentlyReleased('punch', 10)).toBe(false); // press != release
  });

  it('recordRelease stores release events', () => {
    const cb = new CommandBuffer();
    cb.recordRelease('punch', 10);
    expect(cb.wasRecentlyReleased('punch', 10)).toBe(true);
  });

  it('reset clears all history', () => {
    const cb = new CommandBuffer();
    cb.recordPress('punch', 10);
    cb.reset();
    expect(cb.wasRecentlyReleased('punch', 10)).toBe(false);
  });
});

// ── 2. Negative Edge ────────────────────────────────────────
describe('Negative Edge', () => {
  it('wasRecentlyReleased returns true within window', () => {
    const cb = new CommandBuffer();
    cb.recordRelease('punch', 100);
    expect(cb.wasRecentlyReleased('punch', 100)).toBe(true);
    expect(cb.wasRecentlyReleased('punch', 102)).toBe(true);
  });

  it('wasRecentlyReleased returns false outside window', () => {
    const cb = new CommandBuffer();
    cb.recordRelease('punch', 100);
    expect(cb.wasRecentlyReleased('punch', 105)).toBe(false);
  });

  it('triggers special on button release', () => {
    const cb = new CommandBuffer();
    cb.record('down', 1);
    cb.record('downforward', 5);
    cb.record('forward', 10);
    cb.recordPress('punch', 8);
    cb.recordRelease('punch', 11);
    expect(cb.checkSpecial(12, false)).toBe(AttackType.SPECIAL_PROJECTILE);
  });
});

// ── 3. QCF Detection ───────────────────────────────────────
describe('QCF Detection', () => {
  it('full QCF sequence matches', () => {
    const cb = new CommandBuffer();
    cb.record('down', 0);
    cb.record('downforward', 5);
    cb.record('forward', 10);
    cb.recordPress('punch', 12);
    expect(cb.checkSpecial(12, true)).toBe(AttackType.SPECIAL_PROJECTILE);
  });

  it('lenient QCF (down→forward) matches', () => {
    const cb = new CommandBuffer();
    cb.record('down', 1);
    cb.record('forward', 8);
    expect(cb.hasQCF(12)).toBe(true);
  });

  it('incomplete QCF does not match', () => {
    const cb = new CommandBuffer();
    cb.record('down', 0);
    cb.recordPress('punch', 2);
    expect(cb.checkSpecial(2, true)).toBeNull();
  });

  it('hasQCF returns false when window expired', () => {
    const cb = new CommandBuffer();
    cb.record('down', 1);
    cb.record('forward', 25);
    expect(cb.hasQCF(26)).toBe(false);
  });
});

// ── 4. DP Detection ────────────────────────────────────────
describe('DP Detection', () => {
  it('full DP sequence matches', () => {
    const cb = new CommandBuffer();
    cb.record('forward', 0);
    cb.record('down', 5);
    cb.record('downforward', 10);
    cb.recordPress('punch', 12);
    expect(cb.checkSpecial(12, true)).toBe(AttackType.SPECIAL_UPPER);
  });

  it('reverse DP does not trigger DP', () => {
    const cb = new CommandBuffer();
    cb.record('back', 0);
    cb.record('down', 5);
    cb.record('downback', 10);
    cb.recordPress('punch', 12);
    expect(cb.checkSpecial(12, true)).toBeNull();
  });
});

// ── 5. Command Window ───────────────────────────────────────
describe('Command Window', () => {
  it('COMMAND_WINDOW is positive', () => {
    expect(COMMAND_WINDOW).toBeGreaterThan(0);
  });

  it('inputs beyond command window are not detected', () => {
    const cb = new CommandBuffer();
    cb.record('down', 0);
    cb.record('forward', COMMAND_WINDOW + 5);
    cb.recordPress('punch', COMMAND_WINDOW + 7);
    expect(cb.checkSpecial(COMMAND_WINDOW + 7, true)).toBeNull();
  });
});

// ── 6. Charge Detection ─────────────────────────────────────
describe('Charge Detection', () => {
  it('CHARGE_FRAMES_REQUIRED is positive', () => {
    expect(CHARGE_FRAMES_REQUIRED).toBeGreaterThan(0);
  });

  it('holding direction for required frames sets ready', () => {
    const cb = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      cb.updateCharge('down');
    }
    const state = cb.getChargeState('down');
    expect(state.ready).toBe(true);
  });

  it('does NOT set ready before CHARGE_FRAMES_REQUIRED', () => {
    const cb = new CommandBuffer();
    cb.updateCharge('down');
    const state = cb.getChargeState('down');
    expect(state.ready).toBe(false);
  });

  it('resets charge when direction changes', () => {
    const cb = new CommandBuffer();
    for (let i = 0; i < 30; i++) cb.updateCharge('down');
    const state = cb.updateCharge('forward');
    expect(state.down.frames).toBe(0);
  });

  it('tracks back charge separately from down', () => {
    const cb = new CommandBuffer();
    let state: Record<ChargeDirection, ChargeState>;
    for (let i = 0; i < 40; i++) state = cb.updateCharge('back');
    expect(state!.back.ready).toBe(true);
    expect(state!.down.ready).toBe(false);
  });

  it('checkChargeMotion detects down_charge_up', () => {
    const cb = new CommandBuffer();
    for (let i = 0; i < 45; i++) cb.updateCharge('down');
    expect(cb.checkChargeMotion('up', 'punch', 50)).toBe('down_charge_up');
  });

  it('checkChargeMotion detects back_charge_forward', () => {
    const cb = new CommandBuffer();
    for (let i = 0; i < 45; i++) cb.updateCharge('back');
    expect(cb.checkChargeMotion('forward', 'kick', 50)).toBe('back_charge_forward');
  });

  it('checkChargeRelease returns false when not charged enough', () => {
    const cb = new CommandBuffer();
    for (let i = 0; i < 10; i++) cb.updateCharge('down');
    expect(cb.checkChargeRelease('down', 'up', 'up')).toBe(false);
  });

  it('checkChargeRelease returns true when charged and released', () => {
    const cb = new CommandBuffer();
    for (let i = 0; i < 42; i++) cb.updateCharge('down');
    expect(cb.checkChargeRelease('down', 'up', 'up')).toBe(true);
  });
});

// ── 7. QCB / HCB / DD Detection ─────────────────────────────
describe('QCB Detection', () => {
  it('detects QCB via hasQCB', () => {
    const cb = new CommandBuffer();
    cb.record('down', 1);
    cb.record('downback', 5);
    cb.record('back', 10);
    expect(cb.hasQCB(12)).toBe(true);
  });
});

describe('HCB Detection', () => {
  it('detects full HCB', () => {
    const cb = new CommandBuffer();
    cb.record('forward', 1);
    cb.record('downforward', 5);
    cb.record('down', 10);
    cb.record('downback', 15);
    cb.record('back', 20);
    expect(cb.hasHCB(25)).toBe(true);
  });

  it('detects shortcut HCB (forward→down→back)', () => {
    const cb = new CommandBuffer();
    cb.record('forward', 1);
    cb.record('down', 10);
    cb.record('back', 20);
    expect(cb.hasHCB(25)).toBe(true);
  });
});

describe('↓↓ Detection', () => {
  it('detects double down', () => {
    const cb = new CommandBuffer();
    cb.record('down', 1);
    cb.record('down', 8);
    expect(cb.hasDD(12)).toBe(true);
  });

  it('does NOT detect single down', () => {
    const cb = new CommandBuffer();
    cb.record('down', 1);
    expect(cb.hasDD(5)).toBe(false);
  });
});

// ── 8. DM Motion Detection ──────────────────────────────────
describe('DM Motion Detection', () => {
  it('detects QCFx2_P', () => {
    const cb = new CommandBuffer();
    cb.record('down', 1);
    cb.record('downforward', 3);
    cb.record('forward', 5);
    cb.record('down', 10);
    cb.record('downforward', 13);
    cb.record('forward', 16);
    expect(cb.checkDMMotion(20, true, false)).toBe('QCFx2_P');
  });

  it('detects QCFx2_K', () => {
    const cb = new CommandBuffer();
    cb.record('down', 1);
    cb.record('forward', 4);
    cb.record('down', 8);
    cb.record('forward', 12);
    expect(cb.checkDMMotion(15, false, true)).toBe('QCFx2_K');
  });

  it('detects QCBx2_K', () => {
    const cb = new CommandBuffer();
    cb.record('down', 1);
    cb.record('downback', 3);
    cb.record('back', 5);
    cb.record('down', 10);
    cb.record('downback', 13);
    cb.record('back', 16);
    expect(cb.checkDMMotion(20, false, true)).toBe('QCBx2_K');
  });

  it('detects QCB_HCF_P', () => {
    const cb = new CommandBuffer();
    cb.record('down', 1);
    cb.record('downback', 5);
    cb.record('back', 10);
    cb.record('down', 15);
    cb.record('downforward', 20);
    cb.record('forward', 25);
    expect(cb.checkDMMotion(30, true, false)).toBe('QCB_HCF_P');
  });

  it('returns null when no buttons pressed', () => {
    const cb = new CommandBuffer();
    cb.record('down', 1);
    cb.record('forward', 4);
    cb.record('down', 8);
    cb.record('forward', 12);
    expect(cb.checkDMMotion(15, false, false)).toBeNull();
  });
});

// ── 9. Recovery Input Buffer ─────────────────────────────────
describe('Recovery Input Buffer', () => {
  it('extends command window during recovery', () => {
    const cb = new CommandBuffer();
    cb.setRecoveryWindow(true, 0);
    cb.record('down', 5);
    cb.record('downforward', 10);
    cb.record('forward', 15);
    cb.setRecoveryWindow(false, 20);
    cb.recordPress('punch', 25);
    expect(cb.checkSpecial(26, true)).toBe(AttackType.SPECIAL_PROJECTILE);
  });
});

// ── 10. checkBatsuyomiInput ───────────────────────────────────
describe('checkBatsuyomiInput', () => {
  it('returns true when forward and punch pressed', () => {
    const cb = new CommandBuffer();
    expect(cb.checkBatsuyomiInput(true, true)).toBe(true);
  });
  it('returns false when not forward', () => {
    const cb = new CommandBuffer();
    expect(cb.checkBatsuyomiInput(false, true)).toBe(false);
  });
  it('returns false when no punch', () => {
    const cb = new CommandBuffer();
    expect(cb.checkBatsuyomiInput(true, false)).toBe(false);
  });
});

// ── 11. inputResolver: createPrevAttack ──────────────────────
describe('createPrevAttack', () => {
  it('returns all false', () => {
    const prev = createPrevAttack();
    expect(prev).toEqual({ a: false, b: false, c: false, d: false, throwAtk: false, burst: false });
  });
});

// ── 12. inputResolver: updatePrevAttack ──────────────────────
describe('updatePrevAttack', () => {
  it('mirrors raw input booleans', () => {
    const prev = createPrevAttack();
    const raw: RawInput = {
      up: false, down: true, left: false, right: true,
      buttonA: true, buttonB: false, buttonC: true, buttonD: false,
      throwAttack: false, burst: true, start: false,
    };
    updatePrevAttack(prev, raw);
    expect(prev.a).toBe(true);
    expect(prev.b).toBe(false);
    expect(prev.c).toBe(true);
    expect(prev.burst).toBe(true);
  });
});

// ── 13. inputResolver: resolveInput ──────────────────────────
describe('resolveInput', () => {
  const noButtons: RawInput = {
    up: false, down: false, left: false, right: false,
    buttonA: false, buttonB: false, buttonC: false, buttonD: false,
    throwAttack: false, burst: false, start: false,
  };

  it('maps right as forward when facing right (1)', () => {
    const r = resolveInput({ ...noButtons, right: true }, 1 as Direction, createPrevAttack());
    expect(r.forward).toBe(true);
    expect(r.back).toBe(false);
  });

  it('maps right as back when facing left (-1)', () => {
    const r = resolveInput({ ...noButtons, right: true }, -1 as Direction, createPrevAttack());
    expect(r.forward).toBe(false);
    expect(r.back).toBe(true);
  });

  it('detects punchPressed on A press (rising edge)', () => {
    const r = resolveInput({ ...noButtons, buttonA: true }, 1 as Direction, createPrevAttack());
    expect(r.punchPressed).toBe(true);
    expect(r.buttonAPressed).toBe(true);
  });

  it('detects punchPressed on C press', () => {
    const r = resolveInput({ ...noButtons, buttonC: true }, 1 as Direction, createPrevAttack());
    expect(r.punchPressed).toBe(true);
  });

  it('does NOT detect punchPressed when button held', () => {
    const prev = createPrevAttack();
    prev.a = true;
    const r = resolveInput({ ...noButtons, buttonA: true }, 1 as Direction, prev);
    expect(r.punchPressed).toBe(false);
    expect(r.buttonA).toBe(true);
  });

  it('detects kickPressed on B press', () => {
    const r = resolveInput({ ...noButtons, buttonB: true }, 1 as Direction, createPrevAttack());
    expect(r.kickPressed).toBe(true);
  });

  it('detects kickPressed on D press', () => {
    const r = resolveInput({ ...noButtons, buttonD: true }, 1 as Direction, createPrevAttack());
    expect(r.kickPressed).toBe(true);
  });

  it('detects negative edge punch release', () => {
    const prev = createPrevAttack();
    prev.a = true;
    const r = resolveInput({ ...noButtons }, 1 as Direction, prev);
    expect(r.punchJustReleased).toBe(true);
  });

  it('detects negative edge kick release', () => {
    const prev = createPrevAttack();
    prev.d = true;
    const r = resolveInput({ ...noButtons }, 1 as Direction, prev);
    expect(r.kickJustReleased).toBe(true);
  });

  it('detects roll (A+B)', () => {
    const r = resolveInput({ ...noButtons, buttonA: true, buttonB: true }, 1 as Direction, createPrevAttack());
    expect(r.rollPressed).toBe(true);
  });

  it('detects blowback (C+D)', () => {
    const r = resolveInput({ ...noButtons, buttonC: true, buttonD: true }, 1 as Direction, createPrevAttack());
    expect(r.blowbackPressed).toBe(true);
  });

  it('passes through start as startPressed', () => {
    const r = resolveInput({ ...noButtons, start: true }, 1 as Direction, createPrevAttack());
    expect(r.startPressed).toBe(true);
  });
});

// ── 14. inputResolver: getDirectionInput ─────────────────────
describe('getDirectionInput', () => {
  const mk = (up: boolean, down: boolean, forward: boolean, back: boolean) =>
    ({ up, down, forward, back, buttonA: false, buttonB: false, buttonC: false, buttonD: false,
       throwAttack: false, burst: false, buttonAPressed: false, buttonBPressed: false,
       buttonCPressed: false, buttonDPressed: false, throwAttackPressed: false,
       burstPressed: false, punchPressed: false, kickPressed: false, rollPressed: false,
       blowbackPressed: false, punchJustReleased: false, kickJustReleased: false, startPressed: false });

  it('returns neutral when no direction', () => expect(getDirectionInput(mk(false, false, false, false))).toBe('neutral'));
  it('returns up', () => expect(getDirectionInput(mk(true, false, false, false))).toBe('up'));
  it('returns down', () => expect(getDirectionInput(mk(false, true, false, false))).toBe('down'));
  it('returns forward', () => expect(getDirectionInput(mk(false, false, true, false))).toBe('forward'));
  it('returns back', () => expect(getDirectionInput(mk(false, false, false, true))).toBe('back'));
  it('returns upforward', () => expect(getDirectionInput(mk(true, false, true, false))).toBe('upforward'));
  it('returns upback', () => expect(getDirectionInput(mk(true, false, false, true))).toBe('upback'));
  it('returns downforward', () => expect(getDirectionInput(mk(false, true, true, false))).toBe('downforward'));
  it('returns downback', () => expect(getDirectionInput(mk(false, true, false, true))).toBe('downback'));
});

// ── 15. Display helpers ──────────────────────────────────────
describe('getDirectionSymbol', () => {
  it('returns correct symbols for all 9 directions', () => {
    expect(getDirectionSymbol('neutral')).toBe('·');
    expect(getDirectionSymbol('up')).toBe('↑');
    expect(getDirectionSymbol('down')).toBe('↓');
    expect(getDirectionSymbol('forward')).toBe('→');
    expect(getDirectionSymbol('back')).toBe('←');
    expect(getDirectionSymbol('upforward')).toBe('↗');
    expect(getDirectionSymbol('upback')).toBe('↖');
    expect(getDirectionSymbol('downforward')).toBe('↘');
    expect(getDirectionSymbol('downback')).toBe('↙');
  });
});

describe('getButtonDisplayString', () => {
  const mk = (a: boolean, b: boolean, c: boolean, d: boolean, burst: boolean) =>
    ({ up: false, down: false, forward: false, back: false,
       buttonA: a, buttonB: b, buttonC: c, buttonD: d,
       throwAttack: false, burst, buttonAPressed: false, buttonBPressed: false,
       buttonCPressed: false, buttonDPressed: false, throwAttackPressed: false,
       burstPressed: false, punchPressed: false, kickPressed: false, rollPressed: false,
       blowbackPressed: false, punchJustReleased: false, kickJustReleased: false, startPressed: false });

  it('returns empty string when no buttons', () => {
    expect(getButtonDisplayString(mk(false, false, false, false, false))).toBe('');
  });
  it('lists pressed buttons', () => {
    expect(getButtonDisplayString(mk(true, false, true, false, false))).toBe('A C');
  });
  it('includes burst as O', () => {
    expect(getButtonDisplayString(mk(false, false, false, false, true))).toBe('O');
  });
});

describe('getPressedButtonString', () => {
  const mk = (aP: boolean, bP: boolean, cP: boolean, dP: boolean, burstP: boolean, rollP: boolean, blowP: boolean) =>
    ({ up: false, down: false, forward: false, back: false,
       buttonA: false, buttonB: false, buttonC: false, buttonD: false,
       throwAttack: false, burst: false, buttonAPressed: aP, buttonBPressed: bP,
       buttonCPressed: cP, buttonDPressed: dP, throwAttackPressed: false,
       burstPressed: burstP, punchPressed: false, kickPressed: false, rollPressed: rollP,
       blowbackPressed: blowP, punchJustReleased: false, kickJustReleased: false, startPressed: false });

  it('returns empty array when nothing pressed', () => {
    expect(getPressedButtonString(mk(false, false, false, false, false, false, false))).toEqual([]);
  });
  it('lists pressed buttons', () => {
    expect(getPressedButtonString(mk(true, false, true, false, false, false, false))).toEqual(['A', 'C']);
  });
  it('includes roll and blowback', () => {
    expect(getPressedButtonString(mk(false, false, false, false, false, true, true))).toEqual(['A+B', 'C+D']);
  });
});

// ── 16. getCommandName ───────────────────────────────────────
describe('getCommandName', () => {
  const mk = (punchP: boolean, kickP: boolean, punchR: boolean, kickR: boolean) =>
    ({ up: false, down: false, forward: false, back: false,
       buttonA: false, buttonB: false, buttonC: false, buttonD: false,
       throwAttack: false, burst: false, buttonAPressed: false, buttonBPressed: false,
       buttonCPressed: false, buttonDPressed: false, throwAttackPressed: false,
       burstPressed: false, punchPressed: punchP, kickPressed: kickP, rollPressed: false,
       blowbackPressed: false, punchJustReleased: punchR, kickJustReleased: kickR, startPressed: false });

  it('returns DP+P for dragon punch with punch', () => {
    expect(getCommandName('forward', mk(true, false, false, false), false, false, false, true, false)).toBe('DP+P');
  });
  it('returns QCF+P for QCF with punch', () => {
    expect(getCommandName('forward', mk(true, false, false, false), true, false, false, false, false)).toBe('QCF+P');
  });
  it('returns QCF+K for QCF with kick', () => {
    expect(getCommandName('forward', mk(false, true, false, false), true, false, false, false, false)).toBe('QCF+K');
  });
  it('returns QCB+P for QCB with punch', () => {
    expect(getCommandName('back', mk(true, false, false, false), false, true, false, false, false)).toBe('QCB+P');
  });
  it('returns QCB+K for QCB with kick', () => {
    expect(getCommandName('back', mk(false, true, false, false), false, true, false, false, false)).toBe('QCB+K');
  });
  it('returns HCB+P for HCB with punch', () => {
    expect(getCommandName('back', mk(true, false, false, false), false, false, true, false, false)).toBe('HCB+P');
  });
  it('returns CHARGE READY when charge ready', () => {
    expect(getCommandName('down', mk(false, false, false, false), false, false, false, false, true)).toBe('CHARGE READY');
  });
  it('returns ~P for negative edge punch', () => {
    expect(getCommandName('neutral', mk(false, false, true, false), false, false, false, false, false)).toBe('~P');
  });
  it('returns ~K for negative edge kick', () => {
    expect(getCommandName('neutral', mk(false, false, false, true), false, false, false, false, false)).toBe('~K');
  });
  it('returns null when no command', () => {
    expect(getCommandName('neutral', mk(false, false, false, false), false, false, false, false, false)).toBeNull();
  });
  // Priority: DP > QCF > QCB > HCB > charge > negative edge
  it('DP takes priority over QCF', () => {
    expect(getCommandName('forward', mk(true, false, false, false), true, false, false, true, false)).toBe('DP+P');
  });
});
