import { describe, it, expect } from 'vitest';
import { getCharacterStrategy } from '../src/ai/characterStrategies.js';

describe('characterStrategies', () => {
  it('getCharacterStrategy returns object for ryo', () => {
    const strat = getCharacterStrategy('ryo');
    expect(strat).toBeDefined();
    expect(typeof strat).toBe('object');
  });
  it('returns object for kyo', () => {
    const strat = getCharacterStrategy('kyo');
    expect(strat).toBeDefined();
  });
  it('returns object for iori', () => {
    const strat = getCharacterStrategy('iori');
    expect(strat).toBeDefined();
  });
  it('strategy has preferredRange', () => {
    const strat = getCharacterStrategy('ryo');
    expect(strat).toHaveProperty('preferredRange');
  });
  it('unknown char returns default', () => {
    const strat = getCharacterStrategy('unknown_char');
    expect(strat).toBeDefined();
  });
});
