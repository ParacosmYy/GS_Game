import { describe, it, expect } from 'vitest';

describe('Ryo Content Package Exports', () => {
  it('exports RyoDef', async () => {
    const mod = await import('../src/content/characters/ryo/index.js');
    expect(mod.RyoDef).toBeDefined();
    expect(mod.RyoDef.id).toBe('ryo');
  });

  it('exports RYO_STATS', async () => {
    const mod = await import('../src/content/characters/ryo/index.js');
    expect(mod.RYO_STATS).toBeDefined();
    expect(mod.RYO_STATS.walkSpeed).toBeGreaterThan(0);
  });

  it('exports generateRyoReport', async () => {
    const mod = await import('../src/content/characters/ryo/index.js');
    expect(mod.generateRyoReport).toBeDefined();
    expect(typeof mod.generateRyoReport).toBe('function');
  });

  it('exports generateRyoExtendedReport', async () => {
    const mod = await import('../src/content/characters/ryo/index.js');
    expect(mod.generateRyoExtendedReport).toBeDefined();
    expect(typeof mod.generateRyoExtendedReport).toBe('function');
  });

  it('exports printRyoReport', async () => {
    const mod = await import('../src/content/characters/ryo/index.js');
    expect(mod.printRyoReport).toBeDefined();
    expect(typeof mod.printRyoReport).toBe('function');
  });

  it('RyoDef has required fields', async () => {
    const mod = await import('../src/content/characters/ryo/index.js');
    const def = mod.RyoDef;
    expect(def).toHaveProperty('id');
    expect(def).toHaveProperty('name');
    expect(def).toHaveProperty('poses');
    expect(def).toHaveProperty('stats');
    expect(def.nameCn).toContain('亮');
  });

  it('RyoDef has moveList', async () => {
    const mod = await import('../src/content/characters/ryo/index.js');
    const def = mod.RyoDef;
    expect(Array.isArray(def.moveList)).toBe(true);
    expect(def.moveList!.length).toBeGreaterThan(0);
  });

  it('generateRyoReport returns valid report', async () => {
    const mod = await import('../src/content/characters/ryo/index.js');
    const report = mod.generateRyoReport();
    expect(report.character).toBe('ryo');
    expect(report.overallProgress).toBeGreaterThan(0);
  });
});
