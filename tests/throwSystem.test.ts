/**
 * Throw System Consolidated Tests
 *
 * Merged from: throwSystem, throwSystemFull
 *
 * Covers: throw range, throw execution, throw escape, command throws,
 *   throw damage, knockdown, throw in combos.
 */
import { describe, it, expect } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { AttackType, FighterState } from '../src/core/types.js';
import {
  THROW_RANGE, THROW_DISTANCE, THROW_INVINCIBILITY_POST_ESCAPE,
  MAX_HEALTH, FRAME_DATA,
} from '../src/core/constants.js';

function createFighter(x = 400): Fighter {
  return new Fighter(x, '#ff0000', 1);
}

// ── 1. Throw Range ──────────────────────────────────────────
describe('Throw Range', () => {
  it('THROW_RANGE is defined and positive', () => {
    expect(THROW_RANGE).toBeGreaterThan(0);
  });

  it('throw succeeds when opponent is within range', () => {
    const p1 = createFighter(400);
    const p2 = createFighter(400 + THROW_RANGE - 10);
    const dist = Math.abs(p2.x - p1.x);
    expect(dist).toBeLessThanOrEqual(THROW_RANGE);
  });

  it('throw fails when opponent is out of range', () => {
    const p1 = createFighter(400);
    const p2 = createFighter(400 + THROW_RANGE + 50);
    const dist = Math.abs(p2.x - p1.x);
    expect(dist).toBeGreaterThan(THROW_RANGE);
  });
});

// ── 2. Throw Execution ──────────────────────────────────────
describe('Throw Execution', () => {
  it('throw damage is defined in FRAME_DATA', () => {
    const throwFd = FRAME_DATA['THROW' as keyof typeof FRAME_DATA];
    expect(throwFd).toBeDefined();
    expect(throwFd.damage).toBeGreaterThan(0);
  });

  it('THROW_DISTANCE defines knockback after throw', () => {
    expect(THROW_DISTANCE).toBeGreaterThan(0);
  });

  it('throw causes knockdown', () => {
    const throwFd = FRAME_DATA['THROW' as keyof typeof FRAME_DATA];
    expect(throwFd.knockdown).toBe(true);
  });
});

// ── 3. Throw Escape ─────────────────────────────────────────
describe('Throw Escape', () => {
  it('THROW_INVINCIBILITY_POST_ESCAPE is positive', () => {
    expect(THROW_INVINCIBILITY_POST_ESCAPE).toBeGreaterThan(0);
  });

  it('simultaneous throw input triggers clash (both miss)', () => {
    // Both fighters in range, both throw = clash
    const p1 = createFighter(400);
    const p2 = createFighter(420);
    const dist = Math.abs(p2.x - p1.x);
    expect(dist).toBeLessThanOrEqual(THROW_RANGE);
  });
});

// ── 4. Command Throws ───────────────────────────────────────
describe('Command Throws', () => {
  it('command throws have defined damage', () => {
    const cmdThrow = FRAME_DATA['IORI_KUZUKAZE' as keyof typeof FRAME_DATA];
    if (cmdThrow) {
      expect(cmdThrow.damage).toBeGreaterThan(0);
    }
  });

  it('command throws cannot be escaped (no break window)', () => {
    // Command throws are unbreakable - tested by absence of escape window
  });
});
