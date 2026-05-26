import { describe, it, expect } from 'vitest';
import { ROSTER } from '../src/characters/index.js';

describe('characters/index', () => {
  it('ROSTER is array', () => {
    expect(Array.isArray(ROSTER)).toBe(true);
  });
  it('ROSTER has at least 3 characters', () => {
    expect(ROSTER.length).toBeGreaterThanOrEqual(3);
  });
  it('ROSTER contains ryo', () => {
    const ryo = ROSTER.find(c => c.id === 'ryo');
    expect(ryo).toBeDefined();
  });
  it('each entry has id and name', () => {
    for (const char of ROSTER) {
      expect(char.id).toBeDefined();
      expect(char.name).toBeDefined();
    }
  });
  it('ROSTER contains kyo', () => {
    const kyo = ROSTER.find(c => c.id === 'kyo');
    expect(kyo).toBeDefined();
  });
  it('ROSTER contains iori', () => {
    const iori = ROSTER.find(c => c.id === 'iori');
    expect(iori).toBeDefined();
  });
});
