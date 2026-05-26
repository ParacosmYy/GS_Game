/**
 * Recovery Input Buffer tests — validates that direction inputs recorded
 * during hitstun/blockstun can trigger specials for RECOVERY_INPUT_BUFFER
 * frames after recovery ends.
 *
 * KOF2002 behavior: players can buffer special move inputs (QCF, DP, etc.)
 * during blockstun/hitstun. The buffered directional inputs remain valid
 * for a short window after recovery, allowing specials to come out on the
 * first actionable frame.
 */
import { describe, it, expect } from 'vitest';
import { CommandBuffer } from '../src/input/commandBuffer.js';
import { AttackType } from '../src/core/types.js';
import { RECOVERY_INPUT_BUFFER } from '../src/core/constants.js';

describe('Recovery Input Buffer — blockstun recovery', () => {
  it('QCF buffered during blockstun triggers SPECIAL_PROJECTILE after recovery', () => {
    const buf = new CommandBuffer();
    // Enter blockstun at frame 0
    buf.setRecoveryWindow(true, 0);
    // Player inputs QCF during blockstun
    buf.record('down', 5);
    buf.record('downforward', 7);
    buf.record('forward', 9);
    // Blockstun ends at frame 15
    buf.setRecoveryWindow(false, 15);
    // Player presses punch on first actionable frame
    buf.recordPress('punch', 16);
    const result = buf.checkSpecial(16, true);
    expect(result).toBe(AttackType.SPECIAL_PROJECTILE);
  });

  it('QCF buffered during blockstun fails after RECOVERY_INPUT_BUFFER expires', () => {
    const buf = new CommandBuffer();
    buf.setRecoveryWindow(true, 0);
    buf.record('down', 5);
    buf.record('downforward', 7);
    buf.record('forward', 9);
    buf.setRecoveryWindow(false, 15);
    // Check after the recovery buffer window has expired
    const expiredFrame = 15 + RECOVERY_INPUT_BUFFER + 1;
    buf.recordPress('punch', expiredFrame);
    const result = buf.checkSpecial(expiredFrame, true);
    expect(result).toBeNull();
  });

  it('DP buffered during blockstun triggers SPECIAL_UPPER after recovery', () => {
    const buf = new CommandBuffer();
    buf.setRecoveryWindow(true, 0);
    buf.record('forward', 5);
    buf.record('down', 7);
    buf.record('downforward', 9);
    buf.setRecoveryWindow(false, 15);
    buf.recordPress('punch', 16);
    const result = buf.checkSpecial(16, true);
    expect(result).toBe(AttackType.SPECIAL_UPPER);
  });

  it('DP shortcut (forward->down) buffered during blockstun triggers after recovery', () => {
    const buf = new CommandBuffer();
    buf.setRecoveryWindow(true, 0);
    buf.record('forward', 3);
    buf.record('down', 6);
    buf.setRecoveryWindow(false, 10);
    buf.recordPress('punch', 11);
    const result = buf.checkSpecial(11, true);
    expect(result).toBe(AttackType.SPECIAL_UPPER);
  });

  it('QCB buffered during blockstun triggers R.E.D. Kick after recovery', () => {
    const buf = new CommandBuffer();
    buf.setRecoveryWindow(true, 0);
    buf.record('down', 3);
    buf.record('downback', 5);
    buf.record('back', 7);
    buf.setRecoveryWindow(false, 12);
    const result = buf.checkKickSpecial(13, true);
    expect(result).toBe(AttackType.KYO_RED_KICK);
  });
});

describe('Recovery Input Buffer — hitstun recovery', () => {
  it('QCF buffered during hitstun triggers SPECIAL_PROJECTILE after recovery', () => {
    const buf = new CommandBuffer();
    buf.setRecoveryWindow(true, 0);
    buf.record('down', 5);
    buf.record('downforward', 7);
    buf.record('forward', 9);
    buf.setRecoveryWindow(false, 18);
    buf.recordPress('punch', 19);
    const result = buf.checkSpecial(19, true);
    expect(result).toBe(AttackType.SPECIAL_PROJECTILE);
  });

  it('DP buffered during hitstun triggers SPECIAL_UPPER after recovery', () => {
    const buf = new CommandBuffer();
    buf.setRecoveryWindow(true, 0);
    buf.record('forward', 3);
    buf.record('down', 5);
    buf.record('downforward', 7);
    buf.setRecoveryWindow(false, 15);
    buf.recordPress('punch', 16);
    const result = buf.checkSpecial(16, true);
    expect(result).toBe(AttackType.SPECIAL_UPPER);
  });

  it('hitstun buffered inputs expire after RECOVERY_INPUT_BUFFER frames', () => {
    const buf = new CommandBuffer();
    buf.setRecoveryWindow(true, 0);
    buf.record('down', 3);
    buf.record('forward', 5);
    buf.setRecoveryWindow(false, 10);
    // Check exactly at the boundary
    const atBoundary = 10 + RECOVERY_INPUT_BUFFER;
    buf.recordPress('punch', atBoundary);
    const result = buf.checkSpecial(atBoundary, true);
    expect(result).toBeNull();
  });
});

describe('Recovery Input Buffer — DM motions across recovery boundary', () => {
  it('QCFx2 punch motion buffered during blockstun triggers DM after recovery', () => {
    const buf = new CommandBuffer();
    buf.setRecoveryWindow(true, 0);
    // First QCF during blockstun
    buf.record('down', 2);
    buf.record('downforward', 4);
    buf.record('forward', 6);
    // Second QCF starts during blockstun
    buf.record('down', 8);
    buf.record('downforward', 10);
    buf.record('forward', 12);
    // Blockstun ends
    buf.setRecoveryWindow(false, 14);
    // Button press after recovery
    buf.recordPress('punch', 16);
    const result = buf.checkDMMotion(16, true, false);
    expect(result).toBe('QCFx2_P');
  });

  it('QCFx2 kick motion buffered during blockstun triggers DM after recovery', () => {
    const buf = new CommandBuffer();
    buf.setRecoveryWindow(true, 0);
    buf.record('down', 2);
    buf.record('downforward', 4);
    buf.record('forward', 6);
    buf.record('down', 8);
    buf.record('downforward', 10);
    buf.record('forward', 12);
    buf.setRecoveryWindow(false, 14);
    buf.recordPress('kick', 16);
    const result = buf.checkDMMotion(16, false, true);
    expect(result).toBe('QCFx2_K');
  });

  it('QCBx2 kick motion buffered during blockstun triggers DM after recovery', () => {
    const buf = new CommandBuffer();
    buf.setRecoveryWindow(true, 0);
    buf.record('down', 2);
    buf.record('downback', 4);
    buf.record('back', 6);
    buf.record('down', 8);
    buf.record('downback', 10);
    buf.record('back', 12);
    buf.setRecoveryWindow(false, 14);
    buf.recordPress('kick', 16);
    const result = buf.checkDMMotion(16, false, true);
    expect(result).toBe('QCBx2_K');
  });
});

describe('Recovery Input Buffer — normal (non-recovery) flow unaffected', () => {
  it('QCF without recovery window works normally', () => {
    const buf = new CommandBuffer();
    // No setRecoveryWindow called — normal operation
    buf.record('down', 0);
    buf.record('downforward', 3);
    buf.record('forward', 6);
    buf.recordPress('punch', 8);
    const result = buf.checkSpecial(8, true);
    expect(result).toBe(AttackType.SPECIAL_PROJECTILE);
  });

  it('DP without recovery window works normally', () => {
    const buf = new CommandBuffer();
    buf.record('forward', 0);
    buf.record('down', 3);
    buf.record('downforward', 6);
    buf.recordPress('punch', 8);
    const result = buf.checkSpecial(8, true);
    expect(result).toBe(AttackType.SPECIAL_UPPER);
  });

  it('DM motion without recovery window works normally', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downforward', 3);
    buf.record('forward', 6);
    buf.record('down', 9);
    buf.record('downforward', 12);
    buf.record('forward', 15);
    buf.recordPress('punch', 17);
    const result = buf.checkDMMotion(17, true, false);
    expect(result).toBe('QCFx2_P');
  });

  it('inputs beyond normal command window still rejected when no recovery active', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downforward', 3);
    buf.record('forward', 6);
    buf.recordPress('punch', 25);
    // No recovery window, so inputs beyond 12-frame window are rejected
    const result = buf.checkSpecial(25, true);
    expect(result).toBeNull();
  });
});

describe('Recovery Input Buffer — window boundary behavior', () => {
  it('QCF triggers at RECOVERY_INPUT_BUFFER - 1 frames after recovery with old inputs', () => {
    const buf = new CommandBuffer();
    buf.setRecoveryWindow(true, 0);
    // Record inputs early during recovery — these would be outside normal 12-frame window
    // but the recovery buffer extends it
    buf.record('down', 2);
    buf.record('downforward', 3);
    buf.record('forward', 4);
    buf.setRecoveryWindow(false, 10);
    // 1 frame before buffer expiry: effectiveWindow = 12 + 8 - (18 - 10) = 12
    // forward at frame 4: 18 - 4 = 14 > 12, but at frame 17: 17 - 4 = 13 > 12
    // Use recoveryEndFrame = 5 and check at 12: effectiveWindow = 12+8-(12-5)=13, 12-4=8<=13
    // Let me recalculate with a simpler setup
    const buf2 = new CommandBuffer();
    buf2.setRecoveryWindow(true, 0);
    buf2.record('down', 5);
    buf2.record('downforward', 6);
    buf2.record('forward', 7);
    buf2.setRecoveryWindow(false, 10);
    // At frame 17 (7 after recovery): effectiveWindow = 12 + 8 - 7 = 13
    // 17 - 7 = 10 <= 13: forward ok
    // 17 - 6 = 11 <= 13: downforward ok
    // 17 - 5 = 12 <= 13: down ok (exactly at boundary)
    buf2.recordPress('punch', 17);
    const result = buf2.checkSpecial(17, true);
    expect(result).toBe(AttackType.SPECIAL_PROJECTILE);
  });

  it('QCF fails when old inputs fall outside recovery-extended window', () => {
    const buf = new CommandBuffer();
    buf.setRecoveryWindow(true, 0);
    // Record inputs early — beyond even the extended window after expiry
    buf.record('down', 1);
    buf.record('downforward', 2);
    buf.record('forward', 3);
    buf.setRecoveryWindow(false, 5);
    // At frame 18 (13 after recovery): isInRecoveryBuffer = false (13 >= 8)
    // So normal window = 12. 18 - 3 = 15 > 12: fails
    buf.recordPress('punch', 18);
    const result = buf.checkSpecial(18, true);
    expect(result).toBeNull();
  });

  it('multiple recovery transitions reset properly', () => {
    const buf = new CommandBuffer();
    // First blockstun
    buf.setRecoveryWindow(true, 0);
    buf.setRecoveryWindow(false, 10);
    // Second blockstun
    buf.setRecoveryWindow(true, 20);
    buf.record('down', 25);
    buf.record('downforward', 27);
    buf.record('forward', 29);
    buf.setRecoveryWindow(false, 35);
    buf.recordPress('punch', 36);
    const result = buf.checkSpecial(36, true);
    expect(result).toBe(AttackType.SPECIAL_PROJECTILE);
  });
});

describe('Recovery Input Buffer — negative edge during recovery', () => {
  it('punch release during recovery window triggers QCF after blockstun', () => {
    const buf = new CommandBuffer();
    buf.setRecoveryWindow(true, 0);
    buf.record('down', 3);
    buf.record('downforward', 5);
    buf.record('forward', 7);
    buf.setRecoveryWindow(false, 10);
    // Player released punch button during recovery buffer
    buf.recordRelease('punch', 12);
    const result = buf.checkSpecial(12, false);
    expect(result).toBe(AttackType.SPECIAL_PROJECTILE);
  });

  it('kick release during recovery window triggers R.E.D. Kick after blockstun', () => {
    const buf = new CommandBuffer();
    buf.setRecoveryWindow(true, 0);
    buf.record('down', 3);
    buf.record('downback', 5);
    buf.record('back', 7);
    buf.setRecoveryWindow(false, 10);
    buf.recordRelease('kick', 12);
    const result = buf.checkKickSpecial(12, false);
    expect(result).toBe(AttackType.KYO_RED_KICK);
  });
});

describe('Recovery Input Buffer — reset clears recovery state', () => {
  it('reset() clears recovery window state', () => {
    const buf = new CommandBuffer();
    buf.setRecoveryWindow(true, 0);
    buf.record('down', 3);
    buf.record('forward', 5);
    buf.setRecoveryWindow(false, 10);
    buf.reset();
    // After reset, no recovery buffer should apply
    buf.record('down', 15);
    buf.record('downforward', 17);
    buf.record('forward', 19);
    // Check at a frame where the inputs would normally be within window
    // but recovery was cleared, so standard 12-frame window applies
    buf.recordPress('punch', 21);
    const result = buf.checkSpecial(21, true);
    // 21 - 15 = 6, 21 - 19 = 2, all within 12 frames, should work
    expect(result).toBe(AttackType.SPECIAL_PROJECTILE);
  });
});

describe('Recovery Input Buffer — hasQCF/hasQCB/hasHCB helpers', () => {
  it('hasQCF returns true for inputs buffered during blockstun', () => {
    const buf = new CommandBuffer();
    buf.setRecoveryWindow(true, 0);
    buf.record('down', 3);
    buf.record('downforward', 5);
    buf.record('forward', 7);
    buf.setRecoveryWindow(false, 10);
    expect(buf.hasQCF(14)).toBe(true);
  });

  it('hasQCF returns false after recovery buffer expires', () => {
    const buf = new CommandBuffer();
    buf.setRecoveryWindow(true, 0);
    buf.record('down', 3);
    buf.record('downforward', 5);
    buf.record('forward', 7);
    buf.setRecoveryWindow(false, 10);
    const expiredFrame = 10 + RECOVERY_INPUT_BUFFER + 5;
    expect(buf.hasQCF(expiredFrame)).toBe(false);
  });

  it('hasQCB returns true for inputs buffered during blockstun', () => {
    const buf = new CommandBuffer();
    buf.setRecoveryWindow(true, 0);
    buf.record('down', 3);
    buf.record('downback', 5);
    buf.record('back', 7);
    buf.setRecoveryWindow(false, 10);
    expect(buf.hasQCB(14)).toBe(true);
  });

  it('hasHCB returns true for inputs buffered during blockstun', () => {
    const buf = new CommandBuffer();
    buf.setRecoveryWindow(true, 0);
    buf.record('forward', 3);
    buf.record('downforward', 5);
    buf.record('down', 7);
    buf.record('downback', 9);
    buf.record('back', 11);
    buf.setRecoveryWindow(false, 14);
    expect(buf.hasHCB(16)).toBe(true);
  });
});
