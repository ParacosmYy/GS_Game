import { describe, it, expect } from 'vitest';
import { ROSTER } from '../src/characters/index.js';

describe('ROSTER registry', () => {
  it('has 26+ characters', () => {
    expect(ROSTER.length).toBeGreaterThanOrEqual(26);
  });
  it('all entries have unique ids', () => {
    const ids = ROSTER.map(c => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
  it('contains ryo', () => {
    expect(ROSTER.some(c => c.id === 'ryo')).toBe(true);
  });
  it('contains kyo', () => {
    expect(ROSTER.some(c => c.id === 'kyo')).toBe(true);
  });
  it('all entries have valid stats', () => {
    for (const c of ROSTER) {
      expect(c.stats.walkSpeed).toBeGreaterThan(0);
      expect(c.stats.maxHealth).toBeGreaterThan(0);
    }
  });
});
