import { describe, it, expect } from 'vitest';
import { KyoDef } from '../src/characters/kyo.js';

describe('kyo', () => {
  it('has id kyo', () => {
    expect(KyoDef.id).toBe('kyo');
  });
  it('has name', () => {
    expect(KyoDef.name).toBeDefined();
    expect(typeof KyoDef.name).toBe('string');
  });
  it('has color string', () => {
    expect(typeof KyoDef.color).toBe('string');
  });
  it('has winQuotes array', () => {
    expect(Array.isArray(KyoDef.winQuotes)).toBe(true);
    expect(KyoDef.winQuotes.length).toBeGreaterThan(0);
  });
  it('has stats', () => {
    expect(KyoDef.stats).toBeDefined();
  });
  it('has poses', () => {
    expect(KyoDef.poses).toBeDefined();
  });
  it('has moveList', () => {
    expect(Array.isArray(KyoDef.moveList)).toBe(true);
  });
  it('has proportions', () => {
    expect(KyoDef.proportions).toBeDefined();
  });
});
