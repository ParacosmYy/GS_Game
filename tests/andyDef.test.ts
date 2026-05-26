import { describe, it, expect } from 'vitest';
import { AndyDef } from '../src/characters/andy.js';

describe('Andy character definition', () => {
  it('has correct id', () => {
    expect(AndyDef.id).toBe('andy');
  });
  it('has name and nameCn', () => {
    expect(AndyDef.name).toBe('ANDY BOGARD');
    expect(AndyDef.nameCn).toBe('安迪');
  });
  it('has color and accentColor', () => {
    expect(AndyDef.color).toMatch(/^#[0-9a-f]{6}$/i);
    expect(AndyDef.accentColor).toMatch(/^#[0-9a-f]{6}$/i);
  });
  it('has stats with walkSpeed and maxHealth', () => {
    expect(AndyDef.stats).toBeDefined();
    expect(AndyDef.stats.walkSpeed).toBeGreaterThan(0);
    expect(AndyDef.stats.maxHealth).toBeGreaterThan(0);
  });
  it('has poses defined', () => {
    expect(AndyDef.poses).toBeDefined();
    expect(Object.keys(AndyDef.poses).length).toBeGreaterThan(0);
  });
});
