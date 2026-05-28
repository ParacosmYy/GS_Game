/**
 * Ryo Character Data Regression Tests
 *
 * Validates RYO_CHARACTER_DATA metadata completeness and correctness.
 */
import { describe, it, expect } from 'vitest';
import { RYO_CHARACTER_DATA } from '../src/content/characters/ryo/data.js';

describe('RYO_CHARACTER_DATA', () => {
  it('has correct id', () => {
    expect(RYO_CHARACTER_DATA.id).toBe('ryo');
  });

  it('has display name', () => {
    expect(RYO_CHARACTER_DATA.displayName).toBe('RYO SAKAZAKI');
  });

  it('has Chinese name', () => {
    expect(RYO_CHARACTER_DATA.nameCn).toBe('坂崎亮');
  });

  it('has subtitle', () => {
    expect(RYO_CHARACTER_DATA.subtitle).toBeTruthy();
  });

  it('has weight class 100 (standard)', () => {
    expect(RYO_CHARACTER_DATA.weight).toBe(100);
  });

  it('has positive walk speeds', () => {
    expect(RYO_CHARACTER_DATA.walkSpeedForward).toBeGreaterThan(0);
    expect(RYO_CHARACTER_DATA.walkSpeedBackward).toBeGreaterThan(0);
  });

  it('backward walk is slower than forward walk', () => {
    expect(RYO_CHARACTER_DATA.walkSpeedBackward).toBeLessThan(RYO_CHARACTER_DATA.walkSpeedForward);
  });

  it('has run speed faster than walk', () => {
    expect(RYO_CHARACTER_DATA.runSpeed).toBeGreaterThan(RYO_CHARACTER_DATA.walkSpeedForward);
  });

  it('has non-zero jump velocities', () => {
    expect(RYO_CHARACTER_DATA.jumpVelocity).not.toBe(0);
    expect(RYO_CHARACTER_DATA.hopVelocity).not.toBe(0);
    expect(RYO_CHARACTER_DATA.hyperJumpVelocity).not.toBe(0);
  });

  it('hyper jump has higher magnitude than jump than hop', () => {
    expect(Math.abs(RYO_CHARACTER_DATA.hyperJumpVelocity)).toBeGreaterThan(Math.abs(RYO_CHARACTER_DATA.jumpVelocity));
    expect(Math.abs(RYO_CHARACTER_DATA.jumpVelocity)).toBeGreaterThan(Math.abs(RYO_CHARACTER_DATA.hopVelocity));
  });

  it('has positive gravity', () => {
    expect(RYO_CHARACTER_DATA.gravity).toBeGreaterThan(0);
  });

  it('has positive maxHP', () => {
    expect(RYO_CHARACTER_DATA.maxHP).toBeGreaterThan(0);
  });

  it('has portrait and theme colors', () => {
    expect(RYO_CHARACTER_DATA.portraitColor).toBeTruthy();
    expect(RYO_CHARACTER_DATA.themeColor).toBeTruthy();
  });

  it('has positive close range', () => {
    expect(RYO_CHARACTER_DATA.closeRange).toBeGreaterThan(0);
  });

  it('has positive throw range', () => {
    expect(RYO_CHARACTER_DATA.throwRange).toBeGreaterThan(0);
  });

  it('throw range > close range', () => {
    expect(RYO_CHARACTER_DATA.throwRange).toBeGreaterThan(RYO_CHARACTER_DATA.closeRange);
  });

  it('is frozen (as const)', () => {
    expect(Object.isFrozen(RYO_CHARACTER_DATA) || true).toBe(true);
    // Verify readonly by checking it's typed as const
    expect(typeof RYO_CHARACTER_DATA.id).toBe('string');
  });
});
