import { describe, it, expect } from 'vitest';
import { AthenaDef } from '../src/characters/athena.js';

describe('Athena character definition', () => {
  it('has correct id', () => {
    expect(AthenaDef.id).toBe('athena');
  });
  it('has name and nameCn', () => {
    expect(AthenaDef.name).toBeDefined();
    expect(AthenaDef.nameCn).toBeDefined();
  });
  it('has valid hex colors', () => {
    expect(AthenaDef.color).toMatch(/^#[0-9a-f]{6}$/i);
    expect(AthenaDef.accentColor).toMatch(/^#[0-9a-f]{6}$/i);
  });
  it('has stats with positive values', () => {
    expect(AthenaDef.stats.walkSpeed).toBeGreaterThan(0);
    expect(AthenaDef.stats.maxHealth).toBeGreaterThan(0);
  });
  it('has poses with idle state', () => {
    expect(AthenaDef.poses).toBeDefined();
    expect(Object.keys(AthenaDef.poses).length).toBeGreaterThan(0);
  });
});
