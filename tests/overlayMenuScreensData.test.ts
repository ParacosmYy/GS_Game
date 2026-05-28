/**
 * Overlay Menu Screens Data Tests
 *
 * Validates GameOptions type and DEFAULT_OPTIONS from overlayMenuScreens.ts.
 */
import { describe, it, expect } from 'vitest';
import { DEFAULT_OPTIONS } from '../src/rendering/overlays/overlayMenuScreens.js';
import type { GameOptions } from '../src/rendering/overlays/overlayMenuScreens.js';

describe('DEFAULT_OPTIONS', () => {
  it('has valid difficulty (0-2)', () => {
    expect(DEFAULT_OPTIONS.difficulty).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_OPTIONS.difficulty).toBeLessThanOrEqual(2);
    expect(Number.isInteger(DEFAULT_OPTIONS.difficulty)).toBe(true);
  });

  it('has valid roundsToWin (1-3)', () => {
    expect(DEFAULT_OPTIONS.roundsToWin).toBeGreaterThanOrEqual(1);
    expect(DEFAULT_OPTIONS.roundsToWin).toBeLessThanOrEqual(3);
    expect(Number.isInteger(DEFAULT_OPTIONS.roundsToWin)).toBe(true);
  });

  it('has valid timeLimit', () => {
    const valid = [30, 60, 99, 0];
    expect(valid).toContain(DEFAULT_OPTIONS.timeLimit);
  });

  it('crtEnabled is boolean', () => {
    expect(typeof DEFAULT_OPTIONS.crtEnabled).toBe('boolean');
  });

  it('simplifiedMode is boolean', () => {
    expect(typeof DEFAULT_OPTIONS.simplifiedMode).toBe('boolean');
  });

  it('default difficulty is Normal (1)', () => {
    expect(DEFAULT_OPTIONS.difficulty).toBe(1);
  });

  it('default roundsToWin is 2 (best of 3)', () => {
    expect(DEFAULT_OPTIONS.roundsToWin).toBe(2);
  });

  it('default timeLimit is 60', () => {
    expect(DEFAULT_OPTIONS.timeLimit).toBe(60);
  });

  it('is a valid GameOptions object', () => {
    const opts: GameOptions = DEFAULT_OPTIONS;
    expect(opts.difficulty).toBeDefined();
    expect(opts.roundsToWin).toBeDefined();
    expect(opts.timeLimit).toBeDefined();
    expect(opts.crtEnabled).toBeDefined();
    expect(opts.simplifiedMode).toBeDefined();
  });
});
