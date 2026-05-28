/**
 * Stage Atmosphere Regression Test
 * Verifies all stage atmosphere configs have valid structure and distinct identities.
 */
import { describe, it, expect } from 'vitest';
import { getStageAtmosphere, getStageDustColors } from '../src/rendering/stageAtmosphere.js';

const ALL_STAGES = ['temple', 'china', 'factory', 'orochi', 'street', 'rooftop'] as const;

describe('Stage atmosphere — all stages have valid config', () => {
  it('all 6 stages return atmosphere data', () => {
    for (const stage of ALL_STAGES) {
      const atm = getStageAtmosphere(stage);
      expect(atm, `${stage} atmosphere`).toBeDefined();
    }
  });

  it('gradeColor has valid RGBA', () => {
    for (const stage of ALL_STAGES) {
      const [r, g, b, a] = getStageAtmosphere(stage).gradeColor;
      expect(r, `${stage}.r 0..255`).toBeGreaterThanOrEqual(0);
      expect(r, `${stage}.r <= 255`).toBeLessThanOrEqual(255);
      expect(g, `${stage}.g 0..255`).toBeGreaterThanOrEqual(0);
      expect(g, `${stage}.g <= 255`).toBeLessThanOrEqual(255);
      expect(b, `${stage}.b 0..255`).toBeGreaterThanOrEqual(0);
      expect(b, `${stage}.b <= 255`).toBeLessThanOrEqual(255);
      expect(a, `${stage}.alpha 0..1`).toBeGreaterThan(0);
      expect(a, `${stage}.alpha < 1`).toBeLessThan(1);
    }
  });

  it('rayCount is positive', () => {
    for (const stage of ALL_STAGES) {
      const atm = getStageAtmosphere(stage);
      expect(atm.rayCount, `${stage}.rayCount`).toBeGreaterThan(0);
    }
  });

  it('rayAlpha is 0..1', () => {
    for (const stage of ALL_STAGES) {
      const atm = getStageAtmosphere(stage);
      expect(atm.rayAlpha, `${stage}.rayAlpha > 0`).toBeGreaterThan(0);
      expect(atm.rayAlpha, `${stage}.rayAlpha <= 1`).toBeLessThanOrEqual(1);
    }
  });

  it('vigTint has 3 numbers in 0..255', () => {
    for (const stage of ALL_STAGES) {
      const [r, g, b] = getStageAtmosphere(stage).vigTint;
      expect(r, `${stage}.vigTint[0]`).toBeGreaterThanOrEqual(0);
      expect(g, `${stage}.vigTint[1]`).toBeGreaterThanOrEqual(0);
      expect(b, `${stage}.vigTint[2]`).toBeGreaterThanOrEqual(0);
    }
  });

  it('particleColor is valid hex', () => {
    for (const stage of ALL_STAGES) {
      const c = getStageAtmosphere(stage).particleColor;
      expect(c, `${stage}.particleColor`).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('fogTint has 3 numbers', () => {
    for (const stage of ALL_STAGES) {
      const [r, g, b] = getStageAtmosphere(stage).fogTint;
      expect(r, `${stage}.fogTint[0]`).toBeGreaterThanOrEqual(0);
      expect(g, `${stage}.fogTint[1]`).toBeGreaterThanOrEqual(0);
      expect(b, `${stage}.fogTint[2]`).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('Stage dust colors', () => {
  it('all stages return valid dust colors', () => {
    for (const stage of ALL_STAGES) {
      const [c1, c2] = getStageDustColors(stage);
      expect(c1, `${stage} dust[0]`).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(c2, `${stage} dust[1]`).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('fallback works for unknown stage', () => {
    const [c1, c2] = getStageDustColors('unknown' as any);
    expect(c1).toBeDefined();
    expect(c2).toBeDefined();
  });
});

describe('Stage atmosphere distinctness', () => {
  it('no two stages share the same gradeColor', () => {
    const colors = ALL_STAGES.map(s => getStageAtmosphere(s).gradeColor.join(','));
    const unique = new Set(colors);
    expect(unique.size, 'all gradeColors unique').toBe(ALL_STAGES.length);
  });

  it('no two stages share the same particleColor', () => {
    const colors = ALL_STAGES.map(s => getStageAtmosphere(s).particleColor);
    const unique = new Set(colors);
    expect(unique.size, 'all particleColors unique').toBe(ALL_STAGES.length);
  });

  it('temple has warm tones (high R in gradeColor)', () => {
    const [r] = getStageAtmosphere('temple').gradeColor;
    expect(r, 'temple R > 200').toBeGreaterThan(200);
  });

  it('factory has cool tones (high B in gradeColor)', () => {
    const [, , b] = getStageAtmosphere('factory').gradeColor;
    expect(b, 'factory B > 100').toBeGreaterThan(100);
  });

  it('orochi has purple tones (high B, medium R)', () => {
    const [r, , b] = getStageAtmosphere('orochi').gradeColor;
    expect(b, 'orochi B > 100').toBeGreaterThan(100);
    expect(r, 'orochi R > 50').toBeGreaterThan(50);
  });
});
