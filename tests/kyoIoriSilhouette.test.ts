import { describe, it, expect } from 'vitest';
import { KyoDef } from '../src/characters/kyo.js';
import { IoriDef } from '../src/characters/iori.js';
import { RyoDef } from '../src/characters/ryo.js';

describe('Kyo / Iori silhouette proportions', () => {
  it('Kyo stays slimmer than Ryo on the fallback silhouette', () => {
    expect(KyoDef.proportions.torsoW).toBeLessThan(RyoDef.proportions.torsoW);
    expect(KyoDef.proportions.armW).toBeLessThan(RyoDef.proportions.armW);
    expect(KyoDef.proportions.legW).toBeLessThan(RyoDef.proportions.legW);
    expect(KyoDef.proportions.headW).toBeLessThanOrEqual(RyoDef.proportions.headW);
  });

  it('Iori stays slim and readable instead of blocky', () => {
    expect(IoriDef.proportions.torsoW).toBeLessThan(RyoDef.proportions.torsoW);
    expect(IoriDef.proportions.armW).toBeLessThan(RyoDef.proportions.armW);
    expect(IoriDef.proportions.legW).toBeLessThan(RyoDef.proportions.legW);
    expect(IoriDef.proportions.headW).toBeLessThanOrEqual(RyoDef.proportions.headW);
  });
});
