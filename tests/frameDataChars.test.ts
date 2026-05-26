import { describe, it, expect } from 'vitest';
import { FRAME_DATA_CHARS } from '../src/core/frameDataChars.js';

describe('FRAME_DATA_CHARS', () => {
  const keys = Object.keys(FRAME_DATA_CHARS);
  it('has character-specific entries', () => {
    expect(keys.length).toBeGreaterThan(0);
  });
  it('has ryo entries', () => {
    const ryoKeys = keys.filter(k => k.toLowerCase().includes('ryo'));
    expect(ryoKeys.length).toBeGreaterThan(0);
  });
  it('all entries have startup > 0', () => {
    for (const key of keys) {
      const entry = FRAME_DATA_CHARS[key];
      if (entry && typeof entry.startup === 'number') {
        expect(entry.startup).toBeGreaterThan(0);
      }
    }
  });
  it('all entries have damage > 0', () => {
    for (const key of keys) {
      const entry = FRAME_DATA_CHARS[key];
      if (entry && typeof entry.damage === 'number') {
        expect(entry.damage).toBeGreaterThan(0);
      }
    }
  });
  it('has entries for multiple characters', () => {
    const prefixes = new Set(keys.map(k => k.split('_')[0].toLowerCase()));
    expect(prefixes.size).toBeGreaterThanOrEqual(3);
  });
});
