/**
 * Input buffer + resolver integration tests — validates the full pipeline from
 * raw direction recording through CommandBuffer history management, motion
 * detection (QCF/QCB/DP), charge tracking, button edge detection, and window
 * boundaries.
 *
 * Complementary to existing test files (no duplication):
 *   - commandBuffer.test.ts  : basic command recognition + negative edge
 *   - inputBuffer.test.ts    : basic button recording
 *   - inputWindow.test.ts    : timing window constants
 *   - chargeInput.test.ts    : detailed charge motion state machine
 *   - inputEdgeCases.test.ts : resolver edge cases + combined scenarios
 */
import { describe, it, expect } from 'vitest';
import { CommandBuffer } from '../src/input/commandBuffer.js';
import { AttackType } from '../src/core/types.js';
import type { DirectionInput } from '../src/core/types.js';
import {
  COMMAND_WINDOW,
  HCF_WINDOW,
  DOUBLE_QCF_WINDOW,
  CHARGE_FRAMES_REQUIRED,
} from '../src/core/constants.js';

// ---------------------------------------------------------------------------
// 1. Direction Recording
// ---------------------------------------------------------------------------
describe('Direction Recording', () => {
  it('recording a non-neutral direction grows the history', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('forward', 5);
    const history = buf.getRecentHistory(10);
    expect(history).toHaveLength(2);
    expect(history[0].direction).toBe('down');
    expect(history[1].direction).toBe('forward');
  });

  it('neutral direction is not recorded into history', () => {
    const buf = new CommandBuffer();
    buf.record('neutral', 0);
    buf.record('neutral', 1);
    buf.record('neutral', 2);
    const history = buf.getRecentHistory(10);
    expect(history).toHaveLength(0);
  });

  it('history is trimmed when it exceeds 40 entries', () => {
    const buf = new CommandBuffer();
    // Record 50 non-neutral entries
    // Trim logic: at entry 41, trim to last 30. Then entries 42-50 bring it to 39.
    // A second trim would happen if it reached 41 again.
    for (let i = 0; i < 50; i++) {
      buf.record('down', i);
    }
    const history = buf.getRecentHistory(100);
    // After insert-41 trim to 30, then 9 more entries => 39 total.
    // Never exceeds 40, never trimmed again.
    expect(history.length).toBeLessThanOrEqual(40);
    expect(history.length).toBeGreaterThan(0);
    // The most recent entry should be frame 49
    expect(history[history.length - 1].frame).toBe(49);
  });

  it('old records are effectively removed from the history', () => {
    const buf = new CommandBuffer();
    // Record enough entries to trigger multiple trims
    // Entry 41 triggers trim to 30. Entries 42-71 bring to 60. Entry 71 triggers trim again to 30.
    // Then 72-80 bring to 39. Total: 39 entries, oldest = frame 42 (after second trim).
    for (let i = 0; i < 80; i++) {
      buf.record('forward', i);
    }
    const history = buf.getRecentHistory(100);
    // After two trims, the first entry should be well past frame 0
    expect(history[0].frame).toBeGreaterThanOrEqual(40);
    // Entries from frames 0-39 should be gone
    const frame0Exists = history.some((r) => r.frame === 0);
    expect(frame0Exists).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 2. QCF Detection
// ---------------------------------------------------------------------------
describe('QCF Detection (down -> downforward -> forward)', () => {
  it('full QCF within window is correctly detected', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downforward', 4);
    buf.record('forward', 8);
    buf.recordPress('punch', 10);
    const result = buf.checkSpecial(10, true);
    expect(result).toBe(AttackType.SPECIAL_PROJECTILE);
    // Also check hasQCF
    expect(buf.hasQCF(10)).toBe(true);
  });

  it('QCF inputs beyond the command window are not detected', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downforward', 4);
    buf.record('forward', 8);
    // Check at frame 15: down(0) is 15 frames old, > COMMAND_WINDOW(12)
    buf.recordPress('punch', 15);
    const result = buf.checkSpecial(15, true);
    expect(result).toBeNull();
  });

  it('incomplete QCF (missing step) is not detected', () => {
    const buf = new CommandBuffer();
    // Only down, no forward or downforward
    buf.record('down', 0);
    buf.recordPress('punch', 5);
    const result = buf.checkSpecial(5, true);
    expect(result).toBeNull();

    // down + downforward, but no forward
    const buf2 = new CommandBuffer();
    buf2.record('down', 0);
    buf2.record('downforward', 3);
    buf2.recordPress('punch', 5);
    // No forward -> no QCF
    expect(buf2.checkSpecial(5, true)).toBeNull();
  });

  it('fast QCF completed within 6 frames is detected via lenient match', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('forward', 3); // 3 frames apart, within 6-frame leniency
    buf.recordPress('punch', 5);
    const result = buf.checkSpecial(5, true);
    expect(result).toBe(AttackType.SPECIAL_PROJECTILE);
  });
});

// ---------------------------------------------------------------------------
// 3. DP Detection
// ---------------------------------------------------------------------------
describe('DP Detection (forward -> down -> downforward)', () => {
  it('full DP sequence is correctly detected', () => {
    const buf = new CommandBuffer();
    buf.record('forward', 0);
    buf.record('down', 4);
    buf.record('downforward', 8);
    buf.recordPress('punch', 10);
    const result = buf.checkSpecial(10, true);
    expect(result).toBe(AttackType.SPECIAL_UPPER);
  });

  it('reverse DP (back -> down -> downback) does not trigger DP', () => {
    const buf = new CommandBuffer();
    buf.record('back', 0);
    buf.record('down', 4);
    buf.record('downback', 8);
    buf.recordPress('punch', 10);
    const result = buf.checkSpecial(10, true);
    // back->down->downback does not match DP (forward->down->downforward)
    expect(result).toBeNull();
  });

  it('DP outside the command window is not detected', () => {
    const buf = new CommandBuffer();
    buf.record('forward', 0);
    buf.record('down', 4);
    buf.record('downforward', 8);
    // Check at frame 15: forward(0) is 15 frames old > COMMAND_WINDOW(12)
    buf.recordPress('punch', 15);
    const result = buf.checkSpecial(15, true);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 4. Charge Detection
// ---------------------------------------------------------------------------
describe('Charge Detection', () => {
  it('down charge reaches ready state after CHARGE_FRAMES_REQUIRED frames', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('down');
    }
    const state = buf.getChargeState('down');
    expect(state.ready).toBe(true);
    expect(state.frames).toBe(CHARGE_FRAMES_REQUIRED);
  });

  it('back charge requires CHARGE_FRAMES_REQUIRED frames to become ready', () => {
    const buf = new CommandBuffer();
    // 39 frames is not enough
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED - 1; i++) {
      buf.updateCharge('back');
    }
    expect(buf.getChargeState('back').ready).toBe(false);
    // One more frame makes it ready
    buf.updateCharge('back');
    expect(buf.getChargeState('back').ready).toBe(true);
  });

  it('charge resets to zero when direction changes away', () => {
    const buf = new CommandBuffer();
    // Charge down for 30 frames
    for (let i = 0; i < 30; i++) {
      buf.updateCharge('down');
    }
    expect(buf.getChargeState('down').frames).toBe(30);
    // Switch to forward (not a down direction) -> charge resets
    buf.updateCharge('forward');
    expect(buf.getChargeState('down').frames).toBe(0);
    expect(buf.getChargeState('down').ready).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 5. Button Recording
// ---------------------------------------------------------------------------
describe('Button Recording', () => {
  it('recordPress and recordRelease both store entries in button history', () => {
    const buf = new CommandBuffer();
    buf.recordPress('punch', 10);
    // Press is not a release
    expect(buf.wasRecentlyReleased('punch', 10)).toBe(false);

    buf.recordRelease('punch', 20);
    expect(buf.wasRecentlyReleased('punch', 20)).toBe(true);
    expect(buf.wasRecentlyReleased('punch', 23)).toBe(true);
  });

  it('button history is maintained correctly across multiple press/release cycles', () => {
    const buf = new CommandBuffer();
    // Press punch at frame 0, release at frame 5
    buf.recordPress('punch', 0);
    buf.recordRelease('punch', 5);
    // Press kick at frame 10, release at frame 15
    buf.recordPress('kick', 10);
    buf.recordRelease('kick', 15);

    // Punch release at frame 5 is outside default window(3) at frame 15
    expect(buf.wasRecentlyReleased('punch', 15)).toBe(false);
    // Kick release at frame 15 is within window at frame 15
    expect(buf.wasRecentlyReleased('kick', 15)).toBe(true);
    // Kick release at frame 18 is within window (18-15=3)
    expect(buf.wasRecentlyReleased('kick', 18)).toBe(true);
    // Kick release at frame 19 is outside window (19-15=4 > 3)
    expect(buf.wasRecentlyReleased('kick', 19)).toBe(false);
  });

  it('negative edge: button release triggers special when direction motion is present', () => {
    const buf = new CommandBuffer();
    // QCF motion
    buf.record('down', 0);
    buf.record('downforward', 4);
    buf.record('forward', 8);
    // Release punch instead of pressing
    buf.recordRelease('punch', 10);
    // attackPressed=false, negative edge should trigger
    const result = buf.checkSpecial(10, false);
    expect(result).toBe(AttackType.SPECIAL_PROJECTILE);
  });
});

// ---------------------------------------------------------------------------
// 6. Command Window
// ---------------------------------------------------------------------------
describe('Command Window', () => {
  it('COMMAND_WINDOW equals 12 frames', () => {
    expect(COMMAND_WINDOW).toBe(12);
  });

  it('command at window boundary (11 frames old) is still detected', () => {
    const buf = new CommandBuffer();
    // First input at frame 0, check at frame 11 => diff = 11 <= 12
    buf.record('down', 0);
    buf.record('downforward', 6);
    buf.record('forward', 11);
    buf.recordPress('punch', 11);
    const result = buf.checkSpecial(11, true);
    expect(result).toBe(AttackType.SPECIAL_PROJECTILE);
  });

  it('command 1 frame beyond window is not detected', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downforward', 6);
    buf.record('forward', 12);
    buf.recordPress('punch', 13);
    // down(0) at frame 13 => diff = 13 > COMMAND_WINDOW(12)
    const result = buf.checkSpecial(13, true);
    expect(result).toBeNull();
  });

  it('different commands use different windows (QCF=12 vs HCF=24 vs DoubleQCF=28)', () => {
    expect(COMMAND_WINDOW).toBe(12);
    expect(HCF_WINDOW).toBe(24);
    expect(DOUBLE_QCF_WINDOW).toBe(28);

    // QCF fits in 12 frames
    const bufQCF = new CommandBuffer();
    bufQCF.record('down', 0);
    bufQCF.record('forward', 6);
    expect(bufQCF.hasQCF(8)).toBe(true);
    // QCF fails when first input is 13 frames old
    expect(bufQCF.hasQCF(13)).toBe(false);

    // HCB fits in 24 frames
    const bufHCB = new CommandBuffer();
    bufHCB.record('forward', 0);
    bufHCB.record('down', 10);
    bufHCB.record('back', 20);
    expect(bufHCB.hasHCB(22)).toBe(true);
    // HCB fails when first input is 25 frames old
    expect(bufHCB.hasHCB(25)).toBe(false);

    // Double QCF fits in 28 frames
    const bufDQCF = new CommandBuffer();
    bufDQCF.record('down', 0);
    bufDQCF.record('forward', 7);
    bufDQCF.record('down', 14);
    bufDQCF.record('forward', 21);
    bufDQCF.recordPress('punch', 25);
    expect(bufDQCF.checkDMMotion(25, true, false)).toBe('QCFx2_P');
    // Double QCF fails when first input is 29 frames old
    expect(bufDQCF.checkDMMotion(29, true, false)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 7. Priority and Edge Cases
// ---------------------------------------------------------------------------
describe('Priority and Edge Cases', () => {
  it('DP takes priority over QCF when both patterns are present', () => {
    const buf = new CommandBuffer();
    // forward->down->downforward matches both DP (priority 1) and contains
    // a sub-sequence that could be QCF-like
    buf.record('forward', 0);
    buf.record('down', 3);
    buf.record('downforward', 6);
    buf.recordPress('punch', 8);
    const result = buf.checkSpecial(8, true);
    // DP has higher priority
    expect(result).toBe(AttackType.SPECIAL_UPPER);
  });

  it('rapid consecutive inputs are not lost', () => {
    const buf = new CommandBuffer();
    // Simulate very rapid input: all directions on consecutive frames
    buf.record('forward', 0);
    buf.record('down', 1);
    buf.record('downforward', 2);
    buf.recordPress('punch', 3);
    // This is a valid DP within window
    const result = buf.checkSpecial(3, true);
    expect(result).toBe(AttackType.SPECIAL_UPPER);
  });

  it('empty buffer never produces false detections', () => {
    const buf = new CommandBuffer();
    // No inputs recorded at all
    expect(buf.checkSpecial(0, true)).toBeNull();
    expect(buf.checkSpecial(100, true)).toBeNull();
    expect(buf.hasQCF(0)).toBe(false);
    expect(buf.hasQCB(0)).toBe(false);
    expect(buf.hasHCB(0)).toBe(false);
    expect(buf.hasDD(0)).toBe(false);
    expect(buf.checkDMMotion(0, true, false)).toBeNull();
    expect(buf.checkKickSpecial(0, true)).toBeNull();
  });

  it('charge and QCF can coexist independently', () => {
    const buf = new CommandBuffer();
    // Charge down for 40 frames
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('down');
    }
    // Charge should be ready
    expect(buf.getChargeState('down').ready).toBe(true);

    // Simultaneously, record a QCF motion in the direction history
    buf.record('down', 36);
    buf.record('downforward', 38);
    buf.record('forward', 40);
    buf.recordPress('punch', 42);

    // QCF should be detected from the direction history
    const special = buf.checkSpecial(42, true);
    expect(special).toBe(AttackType.SPECIAL_PROJECTILE);

    // Charge state should still be ready (checkSpecial doesn't reset charge)
    expect(buf.getChargeState('down').ready).toBe(true);
  });
});
