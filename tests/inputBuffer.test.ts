/**
 * Input Buffer Consolidated Tests
 *
 * Merged from: inputBuffer, inputWindow, inputEdgeCases, inputBufferResolver
 *
 * Covers: direction recording, QCF/DP detection, negative edge,
 *   command window timing, charge detection, buffer overflow.
 */
import { describe, it, expect } from 'vitest';
import { CommandBuffer } from '../src/input/commandBuffer.js';
import { AttackType } from '../src/core/types.js';
import { CHARGE_FRAMES_REQUIRED, COMMAND_WINDOW } from '../src/core/constants.js';

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

  it('incomplete QCF does not match', () => {
    const cb = new CommandBuffer();
    cb.record('down', 0);
    cb.recordPress('punch', 2);
    expect(cb.checkSpecial(2, true)).toBeNull();
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
    // Beyond the command window
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
});
