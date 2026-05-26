import { describe, it, expect } from 'vitest';
import { COMBO_TRIALS, getTrialsForCharacter, getTrialsByDifficulty, getTrialById, getTrialCharacterIds } from '../src/state/comboTrialData.js';

describe('comboTrialData', () => {
  it('COMBO_TRIALS has entries', () => {
    expect(COMBO_TRIALS.length).toBeGreaterThan(0);
  });
  it('getTrialsForCharacter returns array', () => {
    const ryoTrials = getTrialsForCharacter('ryo');
    expect(Array.isArray(ryoTrials)).toBe(true);
  });
  it('getTrialsByDifficulty returns array', () => {
    const easy = getTrialsByDifficulty('easy');
    expect(Array.isArray(easy)).toBe(true);
  });
  it('getTrialById returns trial or undefined', () => {
    if (COMBO_TRIALS.length > 0) {
      const first = COMBO_TRIALS[0];
      const found = getTrialById(first.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(first.id);
    }
  });
  it('getTrialById returns undefined for unknown id', () => {
    expect(getTrialById('nonexistent_trial_xyz')).toBeUndefined();
  });
  it('getTrialCharacterIds returns non-empty array', () => {
    const ids = getTrialCharacterIds();
    expect(Array.isArray(ids)).toBe(true);
    expect(ids.length).toBeGreaterThan(0);
  });
});
