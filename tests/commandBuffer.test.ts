import { describe, it, expect } from 'vitest';
import { CommandBuffer } from '../src/input/commandBuffer.js';
import { AttackType } from '../src/core/types.js';

describe('按键记录', () => {
  it('recordPress stores punch press event', () => {
    const buf = new CommandBuffer();
    buf.recordPress('punch', 10);
    // Punch press should not count as a recent release
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
});

describe('Negative Edge检测', () => {
  it('wasRecentlyReleased returns true when button was released within window', () => {
    const buf = new CommandBuffer();
    buf.recordRelease('punch', 100);
    // Default window is 3 frames, so frame 103 should still detect it
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
});

describe('QCF+松键触发', () => {
  it('checkSpecial returns SPECIAL_PROJECTILE when QCF motion + punch release (not press)', () => {
    const buf = new CommandBuffer();
    // Record QCF direction sequence: down -> downforward -> forward
    buf.record('down', 0);
    buf.record('downforward', 5);
    buf.record('forward', 10);
    // Record punch release (not press) on frame 12
    buf.recordRelease('punch', 12);
    // attackPressed=false, so only Negative Edge should trigger
    const result = buf.checkSpecial(12, false);
    expect(result).toBe(AttackType.SPECIAL_PROJECTILE);
  });
});

describe('方向序列匹配', () => {
  it('QCF sequence (down -> downforward -> forward) matches', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downforward', 5);
    buf.record('forward', 10);
    buf.recordPress('punch', 12);
    const result = buf.checkSpecial(12, true);
    expect(result).toBe(AttackType.SPECIAL_PROJECTILE);
  });

  it('QCF shortcut (down -> forward) matches', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('forward', 5);
    buf.recordPress('punch', 7);
    const result = buf.checkSpecial(7, true);
    expect(result).toBe(AttackType.SPECIAL_PROJECTILE);
  });

  it('DP sequence (forward -> down -> downforward) matches', () => {
    const buf = new CommandBuffer();
    buf.record('forward', 0);
    buf.record('down', 5);
    buf.record('downforward', 10);
    buf.recordPress('punch', 12);
    const result = buf.checkSpecial(12, true);
    expect(result).toBe(AttackType.SPECIAL_UPPER);
  });

  it('HCB sequence matches', () => {
    const buf = new CommandBuffer();
    // HCB: forward -> downforward -> down -> downback -> back
    buf.record('forward', 0);
    buf.record('downforward', 3);
    buf.record('down', 6);
    buf.record('downback', 9);
    buf.record('back', 12);
    // hasHCB checks with wider window
    expect(buf.hasHCB(15)).toBe(true);
  });

  it('Non-matching sequence returns null', () => {
    const buf = new CommandBuffer();
    buf.record('up', 0);
    buf.record('back', 5);
    buf.recordPress('punch', 7);
    const result = buf.checkSpecial(7, true);
    expect(result).toBeNull();
  });
});
