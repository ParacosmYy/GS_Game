import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  KENSOU_ATTACK_KEYS,
  KENSOU_AVAILABLE_ACTIONS,
  KENSOU_ANIMATION_META,
  KENSOU_MUGEN_ACTION_MAP,
  getKensouAnimationNames,
  getKensouFeedbackTiers,
  getKensouHitboxOffsets,
} from '../src/content/characters/kensou/index.js';

const ROOT = process.cwd();
const KENSOU_SPRITE_DIR = path.join(ROOT, 'public', 'sprites', 'kensou');

function loadJson(fileName: string): any {
  return JSON.parse(fs.readFileSync(path.join(KENSOU_SPRITE_DIR, fileName), 'utf8'));
}

describe('Kensou minimal MUGEN-backed content package', () => {
  it('covers core actions through content package metadata', () => {
    expect(KENSOU_AVAILABLE_ACTIONS).toEqual(expect.arrayContaining([
      'idle',
      'walk_forward',
      'jump_up',
      'stand_a',
      'stand_c',
      'crouch_a',
      'crouch_c',
      'kensou_chou_kyuu_dan',
    ]));

    expect(getKensouAnimationNames()).toEqual(expect.arrayContaining([
      'idle',
      'walk_forward',
      'stand_a',
      'crouch_a',
      'kensou_chou_kyuu_dan',
    ]));
    expect(KENSOU_ANIMATION_META.idle.loop).toBe(true);
  });

  it('keeps attack keys and feedback mappings available without touching core types', () => {
    expect(KENSOU_ATTACK_KEYS).toEqual(expect.arrayContaining([
      'STAND_A',
      'STAND_C',
      'CROUCH_A',
      'CROUCH_C',
      'KENSOU_CHOU_KYUU_DAN',
      'KENSOU_RYUSOU_GEKI',
    ]));

    const feedback = getKensouFeedbackTiers();
    expect(feedback.STAND_A).toBe('light');
    expect(feedback.STAND_C).toBe('heavy');
    expect(feedback.KENSOU_CHOU_KYUU_DAN).toBe('special');
    expect(feedback.KENSOU_RYUSOU_GEKI).toBe('special');
  });

  it('maps Kensou content attacks only to existing MUGEN manifest actions', () => {
    const manifest = loadJson('manifest.json');
    const manifestActions = new Set(Object.keys(manifest.animations ?? {}));

    for (const [attackKey, actionId] of Object.entries(KENSOU_MUGEN_ACTION_MAP)) {
      expect(manifestActions.has(actionId), `${attackKey} -> action ${actionId}`).toBe(true);
    }
  });

  it('exposes Kensou actions that have converted MUGEN hitboxes', () => {
    const hitboxes = loadJson('hitboxes.json');
    const hitboxActions = new Set(Object.keys(hitboxes.actions ?? hitboxes));
    const offsets = getKensouHitboxOffsets();

    expect(Object.keys(offsets).length).toBeGreaterThan(0);
    for (const actionId of Object.values(offsets)) {
      expect(hitboxActions.has(actionId.actionId), `hitbox action ${actionId.actionId}`).toBe(true);
    }
  });
});
