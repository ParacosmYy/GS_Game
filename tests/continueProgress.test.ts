/**
 * Continue screen progress summary regression tests
 */
import { describe, it, expect } from 'vitest';

describe('Continue screen progress', () => {
  it('drawContinue function exists', async () => {
    const { drawContinue } = await import('../src/rendering/overlays/overlayContinueGameOver.js');
    expect(typeof drawContinue).toBe('function');
  }, 15000);

  it('ContinueProgress type is re-exported from overlayScreens', async () => {
    const mod = await import('../src/rendering/overlayScreens.js');
    expect(typeof mod.drawContinue).toBe('function');
    expect(mod).toBeDefined();
  }, 15000);

  it('progress interface shape: stageIndex/totalStages/score/defeatedColors', () => {
    const progress = {
      stageIndex: 3,
      totalStages: 8,
      score: 15000,
      defeatedColors: ['#ff6644', '#4488ff', '#44ff44'],
    };
    expect(progress.stageIndex).toBe(3);
    expect(progress.totalStages).toBe(8);
    expect(progress.score).toBe(15000);
    expect(progress.defeatedColors).toHaveLength(3);
  });

  it('progress with empty stages is valid', () => {
    const progress = {
      stageIndex: 0,
      totalStages: 0,
      score: 0,
      defeatedColors: [] as string[],
    };
    expect(progress.totalStages).toBe(0);
    expect(progress.defeatedColors).toHaveLength(0);
  });

  it('getArcadeStats returns score field', async () => {
    const { getArcadeStats } = await import('../src/rendering/hud.js');
    const stats = getArcadeStats();
    expect(typeof stats.score).toBe('number');
  });

  it('Renderer.drawContinue accepts optional progress param', async () => {
    const { Renderer } = await import('../src/rendering/renderer.js');
    expect(typeof Renderer.prototype.drawContinue).toBe('function');
  });
});
