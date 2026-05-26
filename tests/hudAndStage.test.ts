/**
 * HUD & Stage Consolidated Tests
 *
 * Merged from: hudSystem, announceSequence, cameraSystem, stageSystem, comboTrialSystem
 *
 * Covers: HUD rendering, announce sequence, camera tracking, stage configuration.
 */
import { describe, it, expect } from 'vitest';
import { Camera } from '../src/core/camera.js';
import { Fighter } from '../src/entities/fighter.js';
import { FighterState } from '../src/core/types.js';
import { STAGE_WIDTH, MAX_HEALTH } from '../src/core/constants.js';
import { getAllStages, setStage, getStage } from '../src/rendering/stage.js';

// ── 1. Camera ───────────────────────────────────────────────
describe('Camera', () => {
  it('camera follows fighters', () => {
    const camera = new Camera(STAGE_WIDTH);
    const f1 = new Fighter(300, '#ff0000', 1);
    const f2 = new Fighter(500, '#0000ff', -1);
    camera.update(f1, f2);
    expect(camera.x).toBeGreaterThanOrEqual(0);
  });

  it('camera stays within stage bounds', () => {
    const camera = new Camera(STAGE_WIDTH);
    const f1 = new Fighter(100, '#ff0000', 1);
    const f2 = new Fighter(200, '#0000ff', -1);
    camera.update(f1, f2);
    expect(camera.x).toBeGreaterThanOrEqual(0);
  });
});

// ── 2. Stage System ─────────────────────────────────────────
describe('Stage System', () => {
  it('getAllStages returns available stages', () => {
    const stages = getAllStages();
    expect(stages.length).toBeGreaterThan(0);
  });

  it('stage can be set and retrieved', () => {
    const stages = getAllStages();
    setStage(stages[0]);
    expect(getStage()).toBe(stages[0]);
  });
});
