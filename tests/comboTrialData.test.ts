import { describe, it, expect } from 'vitest';
import { COMBO_TRIALS, getTrialsForCharacter, getTrialsByDifficulty, getTrialById, getTrialCharacterIds } from '../src/state/comboTrialData.js';

describe('comboTrialData', () => {
  it('COMBO_TRIALS is array', () => {
    expect(Array.isArray(COMBO_TRIALS)).toBe(true);
    expect(COMBO_TRIALS.length).toBeGreaterThan(0);
  });
  it('getTrialsForCharacter returns array', () => {
    const result = getTrialsForCharacter('ryo');
    expect(Array.isArray(result)).toBe(true);
  });
  it('getTrialsByDifficulty returns array', () => {
    const result = getTrialsByDifficulty('beginner');
    expect(Array.isArray(result)).toBe(true);
  });
  it('getTrialById returns undefined for missing', () => {
    const result = getTrialById('nonexistent');
    expect(result).toBeUndefined();
  });
  it('getTrialCharacterIds returns array', () => {
    const ids = getTrialCharacterIds();
    expect(Array.isArray(ids)).toBe(true);
  });
  it('trials have name and steps', () => {
    for (const trial of COMBO_TRIALS) {
      expect(trial).toHaveProperty('name');
      expect(trial).toHaveProperty('steps');
    }
  });
});
