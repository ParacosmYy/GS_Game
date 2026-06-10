import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  G_RUGAL_ATTACK_KEYS,
  G_RUGAL_AVAILABLE_ACTIONS,
  G_RUGAL_ANIMATION_META,
  G_RUGAL_MUGEN_ACTION_MAP,
  getGRugalAnimationNames,
  getGRugalFeedbackTiers,
  getGRugalHitboxOffsets,
} from '../src/content/characters/g_rugal/index.js';

const ROOT = process.cwd();
const G_RUGAL_SPRITE_DIR = path.join(ROOT, 'public', 'sprites', 'cvsg_rugal');

function loadJson(fileName: string): any {
  return JSON.parse(fs.readFileSync(path.join(G_RUGAL_SPRITE_DIR, fileName), 'utf8'));
}

describe('Omega Rugal minimal MUGEN-backed content package', () => {
  it('covers boss core actions through content package metadata', () => {
    expect(G_RUGAL_AVAILABLE_ACTIONS).toEqual(expect.arrayContaining([
      'idle',
      'walk_forward',
      'jump_up',
      'stand_a',
      'stand_c',
      'crouch_a',
      'crouch_c',
      'g_rugal_kaiser_wave',
    ]));

    expect(getGRugalAnimationNames()).toEqual(expect.arrayContaining([
      'idle',
      'walk_forward',
      'stand_a',
      'crouch_a',
      'g_rugal_kaiser_wave',
    ]));
    expect(G_RUGAL_ANIMATION_META.idle.loop).toBe(true);
  });

  it('keeps string attack keys and feedback mappings independent of core enum changes', () => {
    expect(G_RUGAL_ATTACK_KEYS).toEqual(expect.arrayContaining([
      'STAND_A',
      'STAND_C',
      'CROUCH_A',
      'CROUCH_C',
      'G_RUGAL_KAISER_WAVE',
      'G_RUGAL_GENOCIDE_CUTTER',
      'DM_G_RUGAL_GIGANTIC_PRESSURE',
    ]));

    const feedback = getGRugalFeedbackTiers();
    expect(feedback.STAND_A).toBe('light');
    expect(feedback.STAND_C).toBe('heavy');
    expect(feedback.G_RUGAL_KAISER_WAVE).toBe('special');
    expect(feedback.DM_G_RUGAL_GIGANTIC_PRESSURE).toBe('dm');
  });

  it('maps Omega Rugal content attacks only to existing MUGEN manifest actions', () => {
    const manifest = loadJson('manifest.json');
    const manifestActions = new Set(Object.keys(manifest.animations ?? {}));

    for (const [attackKey, actionId] of Object.entries(G_RUGAL_MUGEN_ACTION_MAP)) {
      expect(manifestActions.has(actionId), `${attackKey} -> action ${actionId}`).toBe(true);
    }
  });

  it('exposes Omega Rugal actions that have converted MUGEN hitboxes', () => {
    const hitboxes = loadJson('hitboxes.json');
    const hitboxActions = new Set(Object.keys(hitboxes.actions ?? hitboxes));
    const offsets = getGRugalHitboxOffsets();

    expect(Object.keys(offsets).length).toBeGreaterThan(0);
    for (const actionId of Object.values(offsets)) {
      expect(hitboxActions.has(actionId.actionId), `hitbox action ${actionId.actionId}`).toBe(true);
    }
  });
});
