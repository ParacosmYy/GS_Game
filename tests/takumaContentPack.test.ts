import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  TAKUMA_ATTACK_KEYS,
  TAKUMA_AVAILABLE_ACTIONS,
  TAKUMA_ANIMATION_META,
  TAKUMA_MUGEN_ACTION_MAP,
  getTakumaAnimationNames,
  getTakumaFeedbackTiers,
  getTakumaHitboxOffsets,
} from '../src/content/characters/takuma/index.js';

const ROOT = process.cwd();
const TAKUMA_SPRITE_DIR = path.join(ROOT, 'public', 'sprites', 'takuma');

function loadJson(fileName: string): any {
  return JSON.parse(fs.readFileSync(path.join(TAKUMA_SPRITE_DIR, fileName), 'utf8'));
}

describe('Takuma minimal MUGEN-backed content package', () => {
  it('covers core actions through content package metadata', () => {
    expect(TAKUMA_AVAILABLE_ACTIONS).toEqual(expect.arrayContaining([
      'idle',
      'walk_forward',
      'jump_up',
      'stand_a',
      'stand_c',
      'crouch_a',
      'crouch_c',
      'takuma_ko_ou_ken',
    ]));

    expect(getTakumaAnimationNames()).toEqual(expect.arrayContaining([
      'idle',
      'walk_forward',
      'stand_a',
      'crouch_a',
      'takuma_ko_ou_ken',
    ]));
    expect(TAKUMA_ANIMATION_META.idle.loop).toBe(true);
  });

  it('keeps attack keys and feedback mappings available without touching core types', () => {
    expect(TAKUMA_ATTACK_KEYS).toEqual(expect.arrayContaining([
      'STAND_A',
      'STAND_C',
      'CROUCH_A',
      'CROUCH_C',
      'TAKUMA_KO_OU_KEN',
      'DM_RYUKO_RANBU_TAKUMA',
    ]));

    const feedback = getTakumaFeedbackTiers();
    expect(feedback.STAND_A).toBe('light');
    expect(feedback.STAND_C).toBe('heavy');
    expect(feedback.TAKUMA_KO_OU_KEN).toBe('special');
    expect(feedback.DM_RYUKO_RANBU_TAKUMA).toBe('dm');
  });

  it('maps Takuma content attacks only to existing MUGEN manifest actions', () => {
    const manifest = loadJson('manifest.json');
    const manifestActions = new Set(Object.keys(manifest.animations ?? {}));

    for (const [attackKey, actionId] of Object.entries(TAKUMA_MUGEN_ACTION_MAP)) {
      expect(manifestActions.has(actionId), `${attackKey} -> action ${actionId}`).toBe(true);
    }
  });

  it('exposes the subset of Takuma actions that have converted MUGEN hitboxes', () => {
    const hitboxes = loadJson('hitboxes.json');
    const hitboxActions = new Set(Object.keys(hitboxes.actions ?? hitboxes));
    const offsets = getTakumaHitboxOffsets();

    expect(Object.keys(offsets).length).toBeGreaterThan(0);
    for (const actionId of Object.values(offsets)) {
      expect(hitboxActions.has(actionId.actionId), `hitbox action ${actionId.actionId}`).toBe(true);
    }
  });
});
