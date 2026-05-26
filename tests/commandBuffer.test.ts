/**
 * Command Buffer Consolidated Tests
 *
 * Merged from: commandBuffer, chargeInput, inputResolver
 *
 * Covers: direction matching, negative edge, charge detection,
 *   input resolution (directions, attacks, special moves).
 */
import { describe, it, expect } from 'vitest';
import { CommandBuffer } from '../src/input/commandBuffer.js';
import { AttackType } from '../src/core/types.js';
import { CHARGE_FRAMES_REQUIRED } from '../src/core/constants.js';
import {
  resolveInput, getDirectionInput, createPrevAttack,
} from '../src/input/inputResolver.js';
import type { RawInput } from '../src/input/inputResolver.js';

function raw(overrides: Partial<RawInput> = {}): RawInput {
  return {
    up: false, down: false, left: false, right: false,
    buttonA: false, buttonB: false, buttonC: false, buttonD: false,
    throwAttack: false, burst: false, start: false,
    ...overrides,
  };
}

// ── 1. Button Recording ─────────────────────────────────────
describe('Button Recording', () => {
  it('recordRelease stores release event detectable by wasRecentlyReleased', () => {
    const buf = new CommandBuffer();
    buf.recordRelease('punch', 10);
    expect(buf.wasRecentlyReleased('punch', 10)).toBe(true);
  });

  it('release outside window not detected', () => {
    const buf = new CommandBuffer();
    buf.recordRelease('punch', 100);
    expect(buf.wasRecentlyReleased('punch', 104)).toBe(false);
  });
});

// ── 2. Direction Sequence Matching ──────────────────────────
describe('Direction Sequence Matching', () => {
  it('QCF sequence matches', () => {
    const buf = new CommandBuffer();
    buf.record('down', 0);
    buf.record('downforward', 5);
    buf.record('forward', 10);
    buf.recordPress('punch', 12);
    expect(buf.checkSpecial(12, true)).toBe(AttackType.SPECIAL_PROJECTILE);
  });

  it('DP sequence matches', () => {
    const buf = new CommandBuffer();
    buf.record('forward', 0);
    buf.record('down', 5);
    buf.record('downforward', 10);
    buf.recordPress('punch', 12);
    expect(buf.checkSpecial(12, true)).toBe(AttackType.SPECIAL_UPPER);
  });

  it('non-matching sequence returns null', () => {
    const buf = new CommandBuffer();
    buf.record('up', 0);
    buf.recordPress('punch', 2);
    expect(buf.checkSpecial(2, true)).toBeNull();
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

// ── 3. Charge Detection ─────────────────────────────────────
describe('Charge Detection', () => {
  it('holding down for required frames sets ready=true', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) {
      buf.updateCharge('down');
    }
    const state = buf.getChargeState('down');
    expect(state.ready).toBe(true);
  });

  it('charge resets when direction changes', () => {
    const buf = new CommandBuffer();
    for (let i = 0; i < CHARGE_FRAMES_REQUIRED; i++) buf.updateCharge('down');
    buf.updateCharge('forward');
    const state = buf.getChargeState('down');
    expect(state.frames).toBeLessThan(CHARGE_FRAMES_REQUIRED);
  });
});

// ── 4. Input Resolution ─────────────────────────────────────
describe('Input Resolution', () => {
  it('empty input yields neutral direction', () => {
    const input = raw();
    const resolved = resolveInput(input, 1, createPrevAttack());
    const dir = getDirectionInput(resolved);
    expect(dir).toBe('neutral');
  });

  it('buttonA press triggers light attack', () => {
    const input = raw({ buttonA: true });
    const resolved = resolveInput(input, 1, createPrevAttack());
    expect(resolved.buttonA).toBe(true);
  });

  it('burst key is preserved through input resolution', () => {
    const input = raw({ burst: true });
    const resolved = resolveInput(input, 1, createPrevAttack());
    expect(resolved.burst).toBe(true);
    expect(resolved.burstPressed).toBe(true);
  });

  it('respects facing direction for left/right', () => {
    const input = raw({ right: true });
    const resolved1 = resolveInput(input, 1, createPrevAttack());
    const resolved2 = resolveInput(input, -1, createPrevAttack());
    expect(resolved1.forward).toBe(true);
    expect(resolved2.back).toBe(true);
  });
});
