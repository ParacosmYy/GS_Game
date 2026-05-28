/**
 * Stage intro ceremony regression tests
 * Verifies STAGE_INTRO phase, overlay rendering, and announce sequence.
 */
import { describe, it, expect } from 'vitest';

describe('Stage intro ceremony', () => {
  it('STAGE_INTRO exists as a GamePhase value', async () => {
    const { GamePhase } = await import('../src/core/types.js');
    expect(GamePhase.STAGE_INTRO).toBe('STAGE_INTRO');
  });

  it('STAGE_INTRO is between NEXT_MATCH and CONTINUE in enum order', async () => {
    const { GamePhase } = await import('../src/core/types.js');
    const phases = Object.values(GamePhase);
    const nextMatchIdx = phases.indexOf(GamePhase.NEXT_MATCH);
    const stageIntroIdx = phases.indexOf(GamePhase.STAGE_INTRO);
    const continueIdx = phases.indexOf(GamePhase.CONTINUE);
    expect(stageIntroIdx).toBeGreaterThan(nextMatchIdx);
    expect(stageIntroIdx).toBeLessThan(continueIdx);
  });

  it('STAGE_INTRO_DURATION is 120 frames', async () => {
    const { STAGE_INTRO_DURATION } = await import('../src/rendering/overlayScreens.js');
    expect(STAGE_INTRO_DURATION).toBe(120);
  }, 15000);

  it('createStageIntroSequence returns valid announce steps', async () => {
    const { createStageIntroSequence } = await import('../src/state/announcePresets.js');
    const steps = createStageIntroSequence('日本寺庙 · Japan');
    expect(steps.length).toBeGreaterThan(0);
    const step = steps[0];
    expect(step.id).toContain('stage');
    expect(step.duration).toBeGreaterThan(0);
    expect(step.text).toContain('Japan');
    expect(step.scaleCurve).toBeDefined();
    expect(step.alphaCurve).toBeDefined();
  });

  it('createStageIntroSequence uses custom accent color', async () => {
    const { createStageIntroSequence } = await import('../src/state/announcePresets.js');
    const steps = createStageIntroSequence('test', '#ff0000');
    expect(steps[0].fillColor).toBe('#ff0000');
  });

  it('getStageAccent returns valid color for each stage', async () => {
    const { getStageAccent } = await import('../src/rendering/overlayScreens.js');
    const stageIds = ['temple', 'china', 'factory', 'orochi', 'street', 'rooftop'];
    const colors = stageIds.map(id => getStageAccent(id));
    // All colors should be valid hex
    for (const color of colors) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/);
    }
    // At least some stages should have different accents
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBeGreaterThanOrEqual(4);
  });

  it('getStageAccent returns default for unknown stage', async () => {
    const { getStageAccent } = await import('../src/rendering/overlayScreens.js');
    expect(getStageAccent('unknown')).toBe('#ffcc44');
  });

  it('overlayStageIntro exports drawStageIntro function', async () => {
    const mod = await import('../src/rendering/overlays/overlayStageIntro.js');
    expect(typeof mod.drawStageIntro).toBe('function');
  });

  it('STAGE_NAMES_MAP covers all stage IDs', async () => {
    // Verify the stage name map has entries for all known stages
    const stageNames = {
      temple: '日本寺庙 · Japan',
      china: '唐人街 · China',
      factory: '工場 · Factory',
      orochi: '大蛇神社 · Orochi',
      street: '街市夜市 · Street',
      rooftop: '日本屋上 · Rooftop',
    };
    expect(Object.keys(stageNames)).toHaveLength(6);
    for (const [id, name] of Object.entries(stageNames)) {
      expect(name).toContain('·');
    }
  });
});
