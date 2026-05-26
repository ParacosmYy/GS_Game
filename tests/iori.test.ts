import { describe, it, expect } from 'vitest';
import { IoriDef } from '../src/characters/iori.js';

describe('iori', () => {
  it('has id iori', () => { expect(IoriDef.id).toBe('iori'); });
  it('has name', () => { expect(typeof IoriDef.name).toBe('string'); });
  it('has nameCn', () => { expect(typeof IoriDef.nameCn).toBe('string'); });
  it('has color string', () => { expect(typeof IoriDef.color).toBe('string'); });
  it('has winQuotes array', () => {
    expect(Array.isArray(IoriDef.winQuotes)).toBe(true);
    expect(IoriDef.winQuotes.length).toBeGreaterThan(0);
  });
  it('has stats', () => { expect(IoriDef.stats).toBeDefined(); });
  it('has poses', () => { expect(IoriDef.poses).toBeDefined(); });
  it('has moveList', () => { expect(Array.isArray(IoriDef.moveList)).toBe(true); });
  it('has proportions', () => { expect(IoriDef.proportions).toBeDefined(); });
});
