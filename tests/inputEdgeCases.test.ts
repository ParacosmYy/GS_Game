/**
 * Input system edge case tests — comprehensive boundary condition coverage
 * for input buffer, direction resolution, command detection, timing windows,
 * and combined edge cases.
 *
 * Tests the following layers:
 *   - InputResolver: resolveInput, getDirectionInput, edge detection
 *   - CommandBuffer: direction history, button history, command recognition
 *   - Integration: combined direction + button + timing scenarios
 *
 * Related test files (complementary, not duplicated):
 *   - commandBuffer.test.ts: basic command recognition and negative edge
 *   - chargeInput.test.ts: detailed charge motion and charge state
 *   - inputWindow.test.ts: timing window boundary constants
 *   - inputBuffer.test.ts: basic button recording
 */
import { describe, it, expect } from 'vitest';
import { CommandBuffer } from '../src/input/commandBuffer.js';
import { AttackType } from '../src/core/types.js';
import type { DirectionInput, Direction } from '../src/core/types.js';
import {
  COMMAND_WINDOW,
  HCF_WINDOW,
  DOUBLE_QCF_WINDOW,
  CHARGE_FRAMES_REQUIRED,
} from '../src/core/constants.js';
import {
  resolveInput,
  getDirectionInput,
  createPrevAttack,
  updatePrevAttack,
} from '../src/input/inputResolver.js';
import type { RawInput, PrevAttack } from '../src/input/inputResolver.js';

// Helper: build a RawInput with all buttons/directions off by default
function rawInput(overrides: Partial<RawInput> = {}): RawInput {
  return {
    up: false, down: false, left: false, right: false,
    buttonA: false, buttonB: false, buttonC: false, buttonD: false,
    throwAttack: false, start: false,
    ...overrides,
  };
}

// =====================================================================
// Section 1: Input Buffer (5 tests)
// =====================================================================
describe('1. Input Buffer', () => {
  it('1.1 simultaneous button presses registered correctly', () => {
    const prev = createPrevAttack();
    // Press A and C at the same time on the same frame
    const raw = rawInput({ buttonA: true, buttonC: true });
    const resolved = resolveInput(raw, 1 as Direction, prev);

    // Both individual buttons should be pressed
    expect(resolved.buttonA).toBe(true);
    expect(resolved.buttonC).toBe(true);
    // Both should register as "just pressed" (rising edge)
    expect(resolved.buttonAPressed).toBe(true);
    expect(resolved.buttonCPressed).toBe(true);
    // Combined punch (A or C) should also be pressed
    expect(resolved.punchPressed).toBe(true);
  });

  it('1.2 button release timing (edge detection)', () => {
    const prev = createPrevAttack();
    const held = rawInput({ buttonA: true });
    // Establish that A is held
    updatePrevAttack(prev, held);

    // Release A on the next frame
    const released = rawInput({ buttonA: false });
    const resolved = resolveInput(released, 1 as Direction, prev);

    // A should be released, and the negative edge should fire
    expect(resolved.buttonA).toBe(false);
    expect(resolved.buttonAPressed).toBe(false);
    expect(resolved.punchJustReleased).toBe(true);

    // After updating prev, a subsequent frame with A still released should not re-trigger
    updatePrevAttack(prev, released);
    const resolved2 = resolveInput(released, 1 as Direction, prev);
    expect(resolved2.punchJustReleased).toBe(false);
  });

  it('1.3 input buffer preserves order', () => {
    const buf = new CommandBuffer();
    // Record directions in a specific order
    buf.record('forward', 0);
    buf.record('down', 3);
    buf.record('downforward', 6);
    buf.record('back', 9);

    const history = buf.getRecentHistory(10);
    const dirs = history.map((r) => r.direction);
    expect(dirs).toEqual(['forward', 'down', 'downforward', 'back']);
    // Frame numbers should also be in order
    const frames = history.map((r) => r.frame);
    expect(frames).toEqual([0, 3, 6, 9]);
  });

  it('1.4 buffer overflow does not crash', () => {
    const buf = new CommandBuffer();
    // Record far more entries than the buffer can hold
    for (let i = 0; i < 200; i++) {
      // Alternate directions to exercise different paths
      const dir: DirectionInput = i % 2 === 0 ? 'down' : 'forward';
      buf.record(dir, i);
    }
    // Buffer should have trimmed and not crashed
    const history = buf.getRecentHistory(200);
    // After multiple trims, length should be bounded (trim at 40, keep 30)
    expect(history.length).toBeLessThanOrEqual(40);
    // Most recent entry should still be accessible
    expect(history[history.length - 1].frame).toBe(199);
    // Should still function correctly for command detection
    // The most recent entries should be forward (frame 199) and down (frame 198)
    expect(buf.hasQCF(200)).toBe(true);
  });

  it('1.5 buffer cleared on state transition (reset)', () => {
    const buf = new CommandBuffer();
    // Build up a full QCF
    buf.record('down', 0);
    buf.record('downforward', 4);
    buf.record('forward', 8);
    buf.recordPress('punch', 10);
    // Verify command is detectable before reset
    expect(buf.hasQCF(10)).toBe(true);

    // Simulate state transition (e.g., knockdown) — reset the buffer
    buf.reset();

    // After reset, nothing should be detectable
    expect(buf.getRecentHistory(10)).toHaveLength(0);
    expect(buf.hasQCF(10)).toBe(false);
    expect(buf.checkSpecial(10, true)).toBeNull();
    expect(buf.hasQCB(10)).toBe(false);
    expect(buf.hasHCB(10)).toBe(false);
  });
});

// =====================================================================
// Section 2: Direction Resolution (5 tests)
// =====================================================================
describe('2. Direction Resolution', () => {
  it('2.1 forward/back resolved correctly for both facing directions', () => {
    const raw = rawInput({ right: true });
    const prev = createPrevAttack();

    // Facing right (1): right = forward
    const resolvedRight = resolveInput(raw, 1 as Direction, prev);
    expect(resolvedRight.forward).toBe(true);
    expect(resolvedRight.back).toBe(false);

    // Facing left (-1): right = back
    const resolvedLeft = resolveInput(raw, -1 as Direction, prev);
    expect(resolvedLeft.forward).toBe(false);
    expect(resolvedLeft.back).toBe(true);
  });

  it('2.2 down-forward diagonal counted as both down and forward', () => {
    const raw = rawInput({ down: true, right: true });
    const prev = createPrevAttack();
    const resolved = resolveInput(raw, 1 as Direction, prev);
    const dir = getDirectionInput(resolved);

    // Should resolve to the downforward diagonal
    expect(dir).toBe('downforward');
    // Both down and forward should be true
    expect(resolved.down).toBe(true);
    expect(resolved.forward).toBe(true);
  });

  it('2.3 neutral position returns all direction flags false', () => {
    const raw = rawInput(); // all directions false
    const prev = createPrevAttack();
    const resolved = resolveInput(raw, 1 as Direction, prev);
    const dir = getDirectionInput(resolved);

    expect(dir).toBe('neutral');
    expect(resolved.up).toBe(false);
    expect(resolved.down).toBe(false);
    expect(resolved.forward).toBe(false);
    expect(resolved.back).toBe(false);
  });

  it('2.4 multiple simultaneous directions resolve to diagonal', () => {
    const prev = createPrevAttack();

    // up + forward = upforward
    const upFwd = resolveInput(rawInput({ up: true, right: true }), 1 as Direction, prev);
    expect(getDirectionInput(upFwd)).toBe('upforward');

    // up + back = upback
    const upBack = resolveInput(rawInput({ up: true, left: true }), 1 as Direction, prev);
    expect(getDirectionInput(upBack)).toBe('upback');

    // down + back = downback
    const downBack = resolveInput(rawInput({ down: true, left: true }), 1 as Direction, prev);
    expect(getDirectionInput(downBack)).toBe('downback');

    // down + forward = downforward
    const downFwd = resolveInput(rawInput({ down: true, right: true }), 1 as Direction, prev);
    expect(getDirectionInput(downFwd)).toBe('downforward');
  });

  it('2.5 facing direction swap changes forward/back mapping', () => {
    const prev = createPrevAttack();

    // Press left while facing right: back
    const leftFacingRight = resolveInput(rawInput({ left: true }), 1 as Direction, prev);
    expect(leftFacingRight.forward).toBe(false);
    expect(leftFacingRight.back).toBe(true);

    // Press left while facing left: forward
    const leftFacingLeft = resolveInput(rawInput({ left: true }), -1 as Direction, prev);
    expect(leftFacingLeft.forward).toBe(true);
    expect(leftFacingLeft.back).toBe(false);

    // Verify that raw up/down are unaffected by facing
    const upRaw = resolveInput(rawInput({ up: true }), -1 as Direction, prev);
    expect(upRaw.up).toBe(true);
    const downRaw = resolveInput(rawInput({ down: true }), 1 as Direction, prev);
    expect(downRaw.down).toBe(true);
  });
});

// =====================================================================
// Section 3: Command Detection (5 tests)
// =====================================================================
describe('3. Command Detection', () => {
  it('3.1 QCF (quarter circle forward): down -> downforward -> forward + attack', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downforward', 3);
    buf.record('forward', 6);
    buf.recordPress('punch', 8);

    const result = buf.checkSpecial(8, true);
    expect(result).toBe(AttackType.SPECIAL_PROJECTILE);

    // Also verify via hasQCF
    expect(buf.hasQCF(8)).toBe(true);

    // Lenient shortcut (skip diagonal) also works within 6-frame proximity
    const buf2 = new CommandBuffer();
    buf2.record('down', 0);
    buf2.record('forward', 3);
    buf2.recordPress('punch', 5);
    expect(buf2.checkSpecial(5, true)).toBe(AttackType.SPECIAL_PROJECTILE);
  });

  it('3.2 QCB (quarter circle back): down -> downback -> back + attack', () => {
    // QCB is checked via hasQCB and checkKickSpecial
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downback', 3);
    buf.record('back', 6);

    // hasQCB should recognize the pattern
    expect(buf.hasQCB(8)).toBe(true);

    // Lenient shortcut (skip diagonal)
    const buf2 = new CommandBuffer();
    buf2.record('down', 0);
    buf2.record('back', 3);
    expect(buf2.hasQCB(5)).toBe(true);

    // QCB + kick triggers R.E.D. Kick in the kick special system
    const buf3 = new CommandBuffer();
    buf3.record('down', 0);
    buf3.record('downback', 3);
    buf3.record('back', 6);
    const kickResult = buf3.checkKickSpecial(8, true);
    expect(kickResult).toBe(AttackType.KYO_RED_KICK);
  });

  it('3.3 DP (dragon punch): forward -> down -> downforward + attack', () => {
    const buf = new CommandBuffer();
    buf.record('forward', 0);
    buf.record('down', 3);
    buf.record('downforward', 6);
    buf.recordPress('punch', 8);

    const result = buf.checkSpecial(8, true);
    // DP has higher priority than QCF and should be detected
    expect(result).toBe(AttackType.SPECIAL_UPPER);

    // DP shortcut: forward -> down (2-step)
    const buf2 = new CommandBuffer();
    buf2.record('forward', 0);
    buf2.record('down', 3);
    buf2.recordPress('punch', 5);
    // Shortcut only triggers if it does NOT also match a QCF pattern
    // forward->down without downforward: should trigger DP shortcut
    expect(buf2.checkSpecial(5, true)).toBe(AttackType.SPECIAL_UPPER);
  });

  it('3.4 HCF (half circle forward): back -> downback -> down -> downforward -> forward + attack', () => {
    const buf = new CommandBuffer();
    // Full HCF/HCB: forward -> downforward -> down -> downback -> back
    // Note: in KOF notation, HCB is forward-to-back, which the system checks as hasHCB
    buf.record('forward', 0);
    buf.record('downforward', 4);
    buf.record('down', 8);
    buf.record('downback', 12);
    buf.record('back', 16);

    expect(buf.hasHCB(20)).toBe(true);

    // HCB shortcut: forward -> down -> back
    const buf2 = new CommandBuffer();
    buf2.record('forward', 0);
    buf2.record('down', 6);
    buf2.record('back', 12);
    expect(buf2.hasHCB(16)).toBe(true);

    // HCB within HCF_WINDOW (24 frames)
    expect(buf.hasHCB(18)).toBe(true);
    // Beyond HCF_WINDOW should fail
    expect(buf.hasHCB(26)).toBe(false);
  });

  it('3.5 double QCF: two QCF motions + attack for DM', () => {
    // Full double QCF: down -> downforward -> forward -> down -> downforward -> forward
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downforward', 3);
    buf.record('forward', 6);
    buf.record('down', 9);
    buf.record('downforward', 12);
    buf.record('forward', 15);
    buf.recordPress('punch', 17);

    const dmResult = buf.checkDMMotion(17, true, false);
    expect(dmResult).toBe('QCFx2_P');

    // Lenient shortcut: down -> forward -> down -> forward
    const buf2 = new CommandBuffer();
    buf2.record('down', 0);
    buf2.record('forward', 3);
    buf2.record('down', 6);
    buf2.record('forward', 9);
    buf2.recordPress('punch', 11);
    expect(buf2.checkDMMotion(11, true, false)).toBe('QCFx2_P');

    // QCFx2 + kick should return QCFx2_K
    const buf3 = new CommandBuffer();
    buf3.record('down', 0);
    buf3.record('forward', 3);
    buf3.record('down', 6);
    buf3.record('forward', 9);
    expect(buf3.checkDMMotion(11, false, true)).toBe('QCFx2_K');

    // QCBx2 + kick should return QCBx2_K
    const buf4 = new CommandBuffer();
    buf4.record('down', 0);
    buf4.record('back', 3);
    buf4.record('down', 6);
    buf4.record('back', 9);
    expect(buf4.checkDMMotion(11, false, true)).toBe('QCBx2_K');
  });
});

// =====================================================================
// Section 4: Input Timing Windows (4 tests)
// =====================================================================
describe('4. Input Timing Windows', () => {
  it('4.1 motion must be completed within specific frame window', () => {
    // COMMAND_WINDOW = 12 for single specials
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downforward', 6);
    buf.record('forward', 11);
    buf.recordPress('punch', 12);
    // All inputs within 12-frame window: should succeed
    expect(buf.checkSpecial(12, true)).toBe(AttackType.SPECIAL_PROJECTILE);
  });

  it('4.2 too slow motion does not register', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downforward', 6);
    buf.record('forward', 12);
    buf.recordPress('punch', 13);
    // At frame 13: down(0) is 13 frames ago > COMMAND_WINDOW(12)
    const result = buf.checkSpecial(13, true);
    expect(result).toBeNull();
  });

  it('4.3 too fast motion (skipping diagonals) may not register', () => {
    // Skipping the diagonal in QCF works via lenient matching, but only
    // if the two inputs are within the 6-frame leniency window.
    const buf = new CommandBuffer();
    buf.record('down', 0);
    // Forward 8 frames later — outside the 6-frame leniency for shortcut
    buf.record('forward', 8);
    buf.recordPress('punch', 10);
    const result = buf.checkSpecial(10, true);
    // With down and forward 8 frames apart and no diagonal, this is too
    // far for lenient matching and should not register as QCF
    expect(result).toBeNull();
  });

  it('4.4 button press must be during/after final direction', () => {
    const buf = new CommandBuffer();
    // Press button BEFORE the direction inputs — should not trigger
    buf.recordPress('punch', 0);
    buf.record('down', 5);
    buf.record('downforward', 7);
    buf.record('forward', 9);
    // The direction sequence is complete at frame 9, but button was pressed at frame 0.
    // checkSpecial only checks direction history, not when button was pressed relative
    // to direction. The attackPressed flag is the current-frame trigger.
    // Button at frame 0 is irrelevant — only the current-frame attackPressed matters.
    const result = buf.checkSpecial(10, false);
    expect(result).toBeNull();

    // Now press the button on the same frame as the final direction
    const buf2 = new CommandBuffer();
    buf2.record('down', 0);
    buf2.record('downforward', 3);
    buf2.record('forward', 6);
    // Button pressed after the final direction
    const result2 = buf2.checkSpecial(8, true);
    expect(result2).toBe(AttackType.SPECIAL_PROJECTILE);
  });
});

// =====================================================================
// Section 5: Edge Cases (4 tests)
// =====================================================================
describe('5. Edge Cases', () => {
  it('5.1 holding button does not re-trigger', () => {
    const prev = createPrevAttack();
    const held = rawInput({ buttonA: true });

    // First frame: rising edge detected
    const resolved1 = resolveInput(held, 1 as Direction, prev);
    expect(resolved1.buttonAPressed).toBe(true);
    updatePrevAttack(prev, held);

    // Subsequent frames while held: no re-trigger
    for (let i = 0; i < 20; i++) {
      const resolved = resolveInput(held, 1 as Direction, prev);
      expect(resolved.buttonAPressed).toBe(false);
      expect(resolved.punchPressed).toBe(false);
      updatePrevAttack(prev, held);
    }
  });

  it('5.2 same command twice rapidly (negative edge)', () => {
    // First trigger via button press
    const buf1 = new CommandBuffer();
    buf1.record('down', 0);
    buf1.record('downforward', 3);
    buf1.record('forward', 6);
    buf1.recordPress('punch', 8);
    expect(buf1.checkSpecial(8, true)).toBe(AttackType.SPECIAL_PROJECTILE);

    // Second trigger via button release (negative edge)
    const buf2 = new CommandBuffer();
    buf2.record('down', 0);
    buf2.record('downforward', 3);
    buf2.record('forward', 6);
    buf2.recordRelease('punch', 8);
    // attackPressed=false, but negative edge fires
    expect(buf2.checkSpecial(8, false)).toBe(AttackType.SPECIAL_PROJECTILE);

    // A fresh QCF motion can be triggered again after the first one completes
    const buf3 = new CommandBuffer();
    // First QCF
    buf3.record('down', 0);
    buf3.record('forward', 3);
    // Second QCF (different motion — these overlap, simulating rapid re-input)
    buf3.record('down', 5);
    buf3.record('forward', 8);
    buf3.recordPress('punch', 10);
    // Should detect DM (double QCF), not a single QCF
    expect(buf3.checkDMMotion(10, true, false)).toBe('QCFx2_P');
  });

  it('5.3 command input during hitstun is buffered but not executed', () => {
    // GAP DOCUMENTATION: The current input system does not have explicit hitstun
    // buffering logic. CommandBuffer records inputs regardless of fighter state.
    // The combat system is responsible for checking whether the fighter can act.
    //
    // This test documents the expected behavior: CommandBuffer accepts inputs
    // during any state, but the combat layer must gate execution.
    const buf = new CommandBuffer();
    // Simulate a QCF input happening during what would be hitstun
    buf.record('down', 0);
    buf.record('downforward', 3);
    buf.record('forward', 6);
    buf.recordPress('punch', 8);

    // The command buffer itself will detect the QCF — it has no state awareness
    expect(buf.checkSpecial(8, true)).toBe(AttackType.SPECIAL_PROJECTILE);
    // The combat system (not tested here) must check fighter.state !== 'HITSTUN'
    // before acting on the detected command.
    //
    // This is an architectural note: input detection and input execution are
    // separate concerns. The buffer detects, the combat system decides.
  });

  it('5.4 simultaneous attack buttons (A+B, A+C, etc.)', () => {
    const prev = createPrevAttack();

    // A+B simultaneous press (roll)
    const ab = resolveInput(rawInput({ buttonA: true, buttonB: true }), 1 as Direction, prev);
    expect(ab.rollPressed).toBe(true);
    expect(ab.buttonA).toBe(true);
    expect(ab.buttonB).toBe(true);
    expect(ab.buttonAPressed).toBe(true);
    expect(ab.buttonBPressed).toBe(true);

    // C+D simultaneous press (blowback)
    const prev2 = createPrevAttack();
    const cd = resolveInput(rawInput({ buttonC: true, buttonD: true }), 1 as Direction, prev2);
    expect(cd.blowbackPressed).toBe(true);
    expect(cd.buttonC).toBe(true);
    expect(cd.buttonD).toBe(true);

    // A+C simultaneous press — both are punch buttons
    const prev3 = createPrevAttack();
    const ac = resolveInput(rawInput({ buttonA: true, buttonC: true }), 1 as Direction, prev3);
    expect(ac.punchPressed).toBe(true);
    // Neither roll (needs A+B) nor blowback (needs C+D)
    expect(ac.rollPressed).toBe(false);
    expect(ac.blowbackPressed).toBe(false);

    // B+D simultaneous press — both are kick buttons
    const prev4 = createPrevAttack();
    const bd = resolveInput(rawInput({ buttonB: true, buttonD: true }), 1 as Direction, prev4);
    expect(bd.kickPressed).toBe(true);
    expect(bd.rollPressed).toBe(false);
    expect(bd.blowbackPressed).toBe(false);

    // A+B+C+D all buttons at once
    const prev5 = createPrevAttack();
    const all = resolveInput(
      rawInput({ buttonA: true, buttonB: true, buttonC: true, buttonD: true }),
      1 as Direction,
      prev5,
    );
    expect(all.rollPressed).toBe(true);
    expect(all.blowbackPressed).toBe(true);
    expect(all.punchPressed).toBe(true);
    expect(all.kickPressed).toBe(true);
  });
});
