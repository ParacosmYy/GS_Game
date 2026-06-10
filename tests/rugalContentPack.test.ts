import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  RUGAL_ATTACK_KEYS,
  RUGAL_AVAILABLE_ACTIONS,
  RUGAL_ANIMATION_META,
  RUGAL_MUGEN_ACTION_MAP,
  getRugalAnimationNames,
  getRugalFeedbackTiers,
  getRugalHitboxOffsets,
} from '../src/content/characters/rugal/index.js';

const ROOT = process.cwd();
const RUGAL_SPRITE_DIR = path.join(ROOT, 'public', 'sprites', 'cvsrugal');

function loadJson(fileName: string): any {
  return JSON.parse(fs.readFileSync(path.join(RUGAL_SPRITE_DIR, fileName), 'utf8'));
}

describe('Rugal minimal MUGEN-backed content package', () => {
  it('covers boss core actions through content package metadata', () => {
    expect(RUGAL_AVAILABLE_ACTIONS).toEqual(expect.arrayContaining([
      'idle',
      'walk_forward',
      'jump_up',
      'stand_a',
      'stand_c',
      'crouch_a',
      'crouch_c',
      'rugal_kaiser_wave',
    ]));

    expect(getRugalAnimationNames()).toEqual(expect.arrayContaining([
      'idle',
      'walk_forward',
      'stand_a',
      'crouch_a',
      'rugal_kaiser_wave',
    ]));
    expect(RUGAL_ANIMATION_META.idle.loop).toBe(true);
  });

  it('keeps string attack keys and feedback mappings independent of core enum changes', () => {
    expect(RUGAL_ATTACK_KEYS).toEqual(expect.arrayContaining([
      'STAND_A',
      'STAND_C',
      'CROUCH_A',
      'CROUCH_C',
      'RUGAL_KAISER_WAVE',
      'RUGAL_GENOCIDE_CUTTER',
      'DM_RUGAL_GIGANTIC_PRESSURE',
    ]));

    const feedback = getRugalFeedbackTiers();
    expect(feedback.STAND_A).toBe('light');
    expect(feedback.STAND_C).toBe('heavy');
    expect(feedback.RUGAL_KAISER_WAVE).toBe('special');
    expect(feedback.DM_RUGAL_GIGANTIC_PRESSURE).toBe('dm');
  });

  it('maps Rugal content attacks only to existing MUGEN manifest actions', () => {
    const manifest = loadJson('manifest.json');
    const manifestActions = new Set(Object.keys(manifest.animations ?? {}));

    for (const [attackKey, actionId] of Object.entries(RUGAL_MUGEN_ACTION_MAP)) {
      expect(manifestActions.has(actionId), `${attackKey} -> action ${actionId}`).toBe(true);
    }
  });

  it('exposes Rugal actions that have converted MUGEN hitboxes', () => {
    const hitboxes = loadJson('hitboxes.json');
    const hitboxActions = new Set(Object.keys(hitboxes.actions ?? hitboxes));
    const offsets = getRugalHitboxOffsets();

    expect(Object.keys(offsets).length).toBeGreaterThan(0);
    for (const actionId of Object.values(offsets)) {
      expect(hitboxActions.has(actionId.actionId), `hitbox action ${actionId.actionId}`).toBe(true);
    }
  });
});
