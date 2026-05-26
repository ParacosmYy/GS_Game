/**
 * Input system tests — CommandBuffer, charge motions, negative edge, priority
 */
import { describe, it, expect } from 'vitest';
import { CommandBuffer } from '../src/input/commandBuffer.js';
import { AttackType } from '../src/core/types.js';
import type { DirectionInput } from '../src/core/types.js';
import { CHARGE_FRAMES_REQUIRED } from '../src/core/constants.js';

describe('CommandBuffer — basic direction recording', () => {
  it('recordPress stores punch press event', () => {
    const buf = new CommandBuffer();
    buf.recordPress('punch', 10);
    expect(buf.wasRecentlyReleased('punch', 10)).toBe(false);
  });

  it('recordPress stores kick press event', () => {
    const buf = new CommandBuffer();
    buf.recordPress('kick', 10);
    expect(buf.wasRecentlyReleased('kick', 10)).toBe(false);
  });

  it('recordRelease stores punch release event', () => {
    const buf = new CommandBuffer();
    buf.recordRelease('punch', 10);
    expect(buf.wasRecentlyReleased('punch', 10)).toBe(true);
  });

  it('recordRelease stores kick release event', () => {
    const buf = new CommandBuffer();
    buf.recordRelease('kick', 10);
    expect(buf.wasRecentlyReleased('kick', 10)).toBe(true);
  });

  it('reset clears all history and charge state', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('forward', 5);
    buf.recordPress('punch', 10);
    buf.updateCharge('down');
    buf.updateCharge('down');
    buf.reset();
    expect(buf.getRecentHistory(10)).toHaveLength(0);
    expect(buf.getChargeState('down').frames).toBe(0);
  });
});

describe('Negative Edge detection', () => {
  it('wasRecentlyReleased returns true when button was released within window', () => {
    const buf = new CommandBuffer();
    buf.recordRelease('punch', 100);
    expect(buf.wasRecentlyReleased('punch', 100)).toBe(true);
    expect(buf.wasRecentlyReleased('punch', 101)).toBe(true);
    expect(buf.wasRecentlyReleased('punch', 103)).toBe(true);
  });

  it('wasRecentlyReleased returns false when button was released outside window', () => {
    const buf = new CommandBuffer();
    buf.recordRelease('punch', 100);
    // Default window is 3, so frame 104 is outside (104 - 100 = 4 > 3)
    expect(buf.wasRecentlyReleased('punch', 104)).toBe(false);
  });

  it('wasRecentlyReleased returns false when button was never released', () => {
    const buf = new CommandBuffer();
    expect(buf.wasRecentlyReleased('punch', 10)).toBe(false);
    expect(buf.wasRecentlyReleased('kick', 10)).toBe(false);
  });

  it('QCF + punch release triggers SPECIAL_PROJECTILE (negative edge)', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downforward', 5);
    buf.record('forward', 10);
    buf.recordRelease('punch', 12);
    // attackPressed=false, so only Negative Edge should trigger
    const result = buf.checkSpecial(12, false);
    expect(result).toBe(AttackType.SPECIAL_PROJECTILE);
  });

  it('QCF + kick release triggers SPECIAL_PROJECTILE (negative edge)', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downforward', 5);
    buf.record('forward', 10);
    buf.recordRelease('kick', 12);
    const result = buf.checkSpecial(12, false);
    expect(result).toBe(AttackType.SPECIAL_PROJECTILE);
  });

  it('DP + punch release triggers SPECIAL_UPPER (negative edge)', () => {
    const buf = new CommandBuffer();
    buf.record('forward', 0);
    buf.record('down', 5);
    buf.record('downforward', 10);
    buf.recordRelease('punch', 12);
    const result = buf.checkSpecial(12, false);
    expect(result).toBe(AttackType.SPECIAL_UPPER);
  });

  it('DM motion detected via negative edge', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downforward', 3);
    buf.record('forward', 6);
    buf.record('down', 9);
    buf.record('downforward', 12);
    buf.record('forward', 15);
    buf.recordRelease('punch', 17);
    const result = buf.checkDMMotion(17, false, false);
    expect(result).toBe('QCFx2_P');
  });
});

describe('QCF motion detection (hadouken: ↓↘→+P)', () => {
  it('full QCF sequence (down → downforward → forward) matches', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downforward', 5);
    buf.record('forward', 10);
    buf.recordPress('punch', 12);
    const result = buf.checkSpecial(12, true);
    expect(result).toBe(AttackType.SPECIAL_PROJECTILE);
  });

  it('QCF shortcut (down → forward) with lenient matching', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('forward', 3);
    buf.recordPress('punch', 5);
    const result = buf.checkSpecial(5, true);
    expect(result).toBe(AttackType.SPECIAL_PROJECTILE);
  });

  it('QCF shortcut rejects inputs that are too far apart (outside leniency)', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    // 8 frames apart — outside the 6-frame leniency window
    buf.record('forward', 8);
    buf.recordPress('punch', 10);
    // This should NOT match as QCF since the two inputs are too far apart
    // But it also should not match DP (no forward→down pattern)
    const result = buf.checkSpecial(10, true);
    expect(result).toBeNull();
  });

  it('hasQCF returns true for QCF motion', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downforward', 3);
    buf.record('forward', 6);
    expect(buf.hasQCF(8)).toBe(true);
  });

  it('hasQCF returns true for QCF shortcut', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('forward', 3);
    expect(buf.hasQCF(5)).toBe(true);
  });

  it('hasQCB returns true for QCB motion', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downback', 3);
    buf.record('back', 6);
    expect(buf.hasQCB(8)).toBe(true);
  });

  it('non-matching sequence returns null', () => {
    const buf = new CommandBuffer();
    buf.record('up', 0);
    buf.record('back', 5);
    buf.recordPress('punch', 7);
    const result = buf.checkSpecial(7, true);
    expect(result).toBeNull();
  });
});

describe('DP motion detection (shoryuken: →↓↘+P)', () => {
  it('full DP sequence (forward → down → downforward) matches', () => {
    const buf = new CommandBuffer();
    buf.record('forward', 0);
    buf.record('down', 5);
    buf.record('downforward', 10);
    buf.recordPress('punch', 12);
    const result = buf.checkSpecial(12, true);
    expect(result).toBe(AttackType.SPECIAL_UPPER);
  });

  it('DP shortcut (forward → down) matches', () => {
    const buf = new CommandBuffer();
    buf.record('forward', 0);
    buf.record('down', 5);
    buf.recordPress('punch', 7);
    const result = buf.checkSpecial(7, true);
    expect(result).toBe(AttackType.SPECIAL_UPPER);
  });

  it('HCB sequence matches', () => {
    const buf = new CommandBuffer();
    buf.record('forward', 0);
    buf.record('downforward', 3);
    buf.record('down', 6);
    buf.record('downback', 9);
    buf.record('back', 12);
    expect(buf.hasHCB(15)).toBe(true);
  });
});

describe('Priority system — complex motions checked first', () => {
  it('DP takes priority over QCF when both patterns exist', () => {
    const buf = new CommandBuffer();
    // Record a DP pattern that also contains a QCF sub-pattern
    // forward(0) → down(3) → downforward(6) contains both DP and QCF
    buf.record('forward', 0);
    buf.record('down', 3);
    buf.record('downforward', 6);
    buf.recordPress('punch', 8);
    // DP should be detected first (priority 1)
    const result = buf.checkSpecial(8, true);
    expect(result).toBe(AttackType.SPECIAL_UPPER);
  });

  it('when only QCF is present, QCF is detected (not DP)', () => {
    const buf = new CommandBuffer();
    // Only QCF pattern, no forward before down
    buf.record('down', 0);
    buf.record('downforward', 3);
    buf.record('forward', 6);
    buf.recordPress('punch', 8);
    const result = buf.checkSpecial(8, true);
    expect(result).toBe(AttackType.SPECIAL_PROJECTILE);
  });

  it('DM motion checked via checkDMMotion independently', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downforward', 3);
    buf.record('forward', 6);
    buf.record('down', 9);
    buf.record('downforward', 12);
    buf.record('forward', 15);
    buf.recordPress('punch', 17);
    // checkDMMotion has its own wider window
    const dmResult = buf.checkDMMotion(17, true, false);
    expect(dmResult).toBe('QCFx2_P');
  });
});

describe('Charge motion detection', () => {
  it('down charge reaches ready state after required frames', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('down');
    }
    const state = buf.getChargeState('down');
    expect(state.ready).toBe(true);
    expect(state.frames).toBe(CHARGE_FRAMES_REQUIRED);
  });

  it('down charge is NOT ready before required frames', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED - 1; i++) {
      buf.updateCharge('down');
    }
    const state = buf.getChargeState('down');
    expect(state.ready).toBe(false);
  });

  it('down charge resets when direction changes to up', () => {
    const buf = new CommandBuffer();
    // Charge down for enough frames
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('down');
    }
    expect(buf.getChargeState('down').ready).toBe(true);

    // Release to up — should detect charge release
    const released = buf.checkChargeRelease('down', 'up', 'up');
    expect(released).toBe(true);
    expect(buf.getChargeState('down').frames).toBe(0);
  });

  it('back charge reaches ready state after required frames', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('back');
    }
    const state = buf.getChargeState('back');
    expect(state.ready).toBe(true);
  });

  it('back charge release to forward triggers back_charge_forward', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('back');
    }
    const motion = buf.checkChargeMotion('forward', 'punch', 100);
    expect(motion).toBe('back_charge_forward');
  });

  it('down charge release to up triggers down_charge_up', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('down');
    }
    const motion = buf.checkChargeMotion('up', 'punch', 100);
    expect(motion).toBe('down_charge_up');
  });

  it('down charge release to upforward also triggers down_charge_up', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('down');
    }
    const motion = buf.checkChargeMotion('upforward', 'punch', 100);
    expect(motion).toBe('down_charge_up');
  });

  it('charge does not release without sufficient frames', () => {
    const buf = new CommandBuffer();
    // Only 10 frames of charge, not enough
    for (let i = 0; i < 10; i++) {
      buf.updateCharge('down');
    }
    const motion = buf.checkChargeMotion('up', 'punch', 100);
    expect(motion).toBeNull();
  });

  it('charge resets when neutral direction is held', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('down');
    }
    expect(buf.getChargeState('down').ready).toBe(true);
    // Hold neutral — charge should reset
    buf.updateCharge('neutral');
    buf.updateCharge('neutral');
    expect(buf.getChargeState('down').frames).toBe(0);
    expect(buf.getChargeState('down').ready).toBe(false);
  });

  it('checkChargeRelease works for back → forward', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('back');
    }
    expect(buf.checkChargeRelease('back', 'forward', 'forward')).toBe(true);
    expect(buf.getChargeState('back').frames).toBe(0);
  });

  it('checkChargeRelease returns false without enough charge', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < 20; i++) {
      buf.updateCharge('back');
    }
    expect(buf.checkChargeRelease('back', 'forward', 'forward')).toBe(false);
  });

  it('diagonal downback charges both down and back', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('downback');
    }
    expect(buf.getChargeState('downback').ready).toBe(true);
    expect(buf.getChargeState('down').ready).toBe(true);
    expect(buf.getChargeState('back').ready).toBe(true);
  });
});

describe('Buffer timing — inputs within window', () => {
  it('inputs within 12-frame command window are recognized', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downforward', 6);
    buf.record('forward', 11);
    buf.recordPress('punch', 12);
    const result = buf.checkSpecial(12, true);
    expect(result).toBe(AttackType.SPECIAL_PROJECTILE);
  });

  it('inputs beyond command window are rejected', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downforward', 6);
    buf.record('forward', 11);
    // Check at frame 25 — all inputs are > 12 frames old
    buf.recordPress('punch', 25);
    const result = buf.checkSpecial(25, true);
    expect(result).toBeNull();
  });

  it('partial inputs within window are rejected (incomplete QCF)', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    // Only down, no forward
    buf.recordPress('punch', 5);
    const result = buf.checkSpecial(5, true);
    expect(result).toBeNull();
  });

  it('DM double QCF within wider window (28 frames)', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('forward', 3);
    buf.record('down', 14);
    buf.record('forward', 17);
    buf.recordPress('punch', 20);
    const result = buf.checkDMMotion(20, true, false);
    expect(result).toBe('QCFx2_P');
  });
});

describe('Kick special moves', () => {
  it('QCB + kickPress matches R.E.D. Kick', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downback', 3);
    buf.record('back', 6);
    const result = buf.checkKickSpecial(8, true);
    expect(result).toBe(AttackType.KYO_RED_KICK);
  });

  it('QCF + kickPress matches 75式改', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downforward', 3);
    buf.record('forward', 6);
    const result = buf.checkKickSpecial(8, true);
    expect(result).toBe(AttackType.KYO_75KAI);
  });

  it('QCB + kick release triggers via negative edge', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downback', 3);
    buf.record('back', 6);
    buf.recordRelease('kick', 8);
    const result = buf.checkKickSpecial(8, false);
    expect(result).toBe(AttackType.KYO_RED_KICK);
  });
});

describe('Rekka followup detection', () => {
  it('QCF followup during recovery', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downforward', 3);
    buf.record('forward', 6);
    buf.recordPress('punch', 8);
    const result = buf.checkRekkaFollowQCF(8, true);
    expect(result).toBe(AttackType.KYO_ARAGAMI_KONOKIZU);
  });

  it('HCB followup during recovery', () => {
    const buf = new CommandBuffer();
    buf.record('forward', 0);
    buf.record('down', 3);
    buf.record('back', 6);
    buf.recordPress('punch', 8);
    const result = buf.checkRekkaFollowHCB(8, true);
    expect(result).toBe(AttackType.KYO_ARAGAMI_YANOSABI);
  });

  it('rekka followup supports negative edge', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('forward', 3);
    buf.recordRelease('punch', 5);
    const result = buf.checkRekkaFollowQCF(5, false);
    expect(result).toBe(AttackType.KYO_ARAGAMI_KONOKIZU);
  });
});

describe('hasDD (↓↓ motion)', () => {
  it('two down inputs within window matches', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('down', 5);
    expect(buf.hasDD(8)).toBe(true);
  });

  it('single down does not match', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    expect(buf.hasDD(5)).toBe(false);
  });
});
