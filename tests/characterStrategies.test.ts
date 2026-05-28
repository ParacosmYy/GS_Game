/**
 * Character Strategies Regression Test
 * Verifies all AI character strategy definitions have valid structure and consistency.
 */
import { describe, it, expect } from 'vitest';
import {
  getCharacterStrategy,
  ALL_STRATEGIES,
  type CharacterStrategy,
} from '../src/ai/characterStrategies.js';

const VALID_RANGES = ['close', 'mid', 'far'];

function expectValidStrategy(s: CharacterStrategy) {
  expect(s.charId, 'charId').toBeTruthy();
  expect(VALID_RANGES, `range for ${s.charId}`).toContain(s.preferredRange);
  expect(s.aggressiveLevel, `aggression for ${s.charId}`).toBeGreaterThanOrEqual(0);
  expect(s.aggressiveLevel, `aggression for ${s.charId}`).toBeLessThanOrEqual(1);
  expect(s.preferredAntiAir, `antiAir for ${s.charId}`).toBeTruthy();
  expect(s.preferredPoke, `poke for ${s.charId}`).toBeTruthy();
  expect(s.preferredComboStarter, `comboStarter for ${s.charId}`).toBeTruthy();
  expect(s.preferredDM, `DM for ${s.charId}`).toBeTruthy();
  expect(s.wakeUpOptions.length, `wakeUp for ${s.charId}`).toBeGreaterThanOrEqual(1);
}

describe('Character Strategies Registry', () => {
  it('has at least 26 strategies', () => {
    expect(ALL_STRATEGIES.length).toBeGreaterThanOrEqual(26);
  });

  it('all strategies have valid structure', () => {
    for (const s of ALL_STRATEGIES) {
      expectValidStrategy(s);
    }
  });

  it('no duplicate charId entries', () => {
    const ids = ALL_STRATEGIES.map(s => s.charId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('key characters are present', () => {
    const ids = ALL_STRATEGIES.map(s => s.charId);
    expect(ids).toContain('kyo');
    expect(ids).toContain('iori');
    expect(ids).toContain('ryo');
    expect(ids).toContain('terry');
    expect(ids).toContain('kim');
  });

  it('getCharacterStrategy returns correct strategy for kyo', () => {
    const s = getCharacterStrategy('kyo');
    expect(s.charId).toBe('kyo');
    expect(s.preferredRange).toBe('close');
    expect(s.aggressiveLevel).toBe(0.8);
  });

  it('getCharacterStrategy returns default for unknown char', () => {
    const s = getCharacterStrategy('nonexistent_char');
    expect(s.charId).toBe('_default');
  });

  it('getCharacterStrategy returns iori with close range', () => {
    const s = getCharacterStrategy('iori');
    expect(s.preferredRange).toBe('close');
    expect(s.aggressiveLevel).toBe(0.9);
  });

  it('getCharacterStrategy returns ryo with mid range', () => {
    const s = getCharacterStrategy('ryo');
    expect(s.preferredRange).toBe('mid');
  });

  it('all strategies use CLOSE_C as combo starter', () => {
    for (const s of ALL_STRATEGIES) {
      expect(s.preferredComboStarter, `${s.charId} combo starter`).toBeTruthy();
    }
  });

  it('all wakeUpOptions have at least one non-throw option', () => {
    for (const s of ALL_STRATEGIES) {
      const nonThrow = s.wakeUpOptions.filter(o => !o.startsWith('THROW_'));
      expect(nonThrow.length, `${s.charId} non-throw wakeup`).toBeGreaterThanOrEqual(1);
    }
  });

  it('aggression levels vary across characters', () => {
    const levels = ALL_STRATEGIES.map(s => s.aggressiveLevel);
    const unique = new Set(levels);
    expect(unique.size).toBeGreaterThanOrEqual(5);
  });

  it('all preferredDM values are DM or SDM or HSDM', () => {
    for (const s of ALL_STRATEGIES) {
      expect(
        s.preferredDM.startsWith('DM_') || s.preferredDM.startsWith('SDM_') || s.preferredDM.startsWith('HSDM_'),
        `${s.charId} DM: ${s.preferredDM}`,
      ).toBe(true);
    }
  });

  it('close-range characters have higher aggression on average', () => {
    const closeChars = ALL_STRATEGIES.filter(s => s.preferredRange === 'close');
    const farChars = ALL_STRATEGIES.filter(s => s.preferredRange === 'far');
    if (closeChars.length > 0 && farChars.length > 0) {
      const avgClose = closeChars.reduce((sum, s) => sum + s.aggressiveLevel, 0) / closeChars.length;
      const avgFar = farChars.reduce((sum, s) => sum + s.aggressiveLevel, 0) / farChars.length;
      expect(avgClose).toBeGreaterThan(avgFar);
    }
  });

  it('range distribution has all three categories', () => {
    const ranges = ALL_STRATEGIES.map(s => s.preferredRange);
    expect(ranges).toContain('close');
    expect(ranges).toContain('mid');
    expect(ranges).toContain('far');
  });
});
