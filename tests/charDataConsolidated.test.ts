/**
 * Character Data Consolidated Tests
 *
 * Merged from: charVisuals, skeletalColors, comboTrialData, frameDataChars
 *
 * Covers: sprite visual data, skeletal color functions, combo trial data,
 *   character-specific frame data.
 */
import { describe, it, expect } from 'vitest';
import { CHAR_VISUALS, getDefaultVisual } from '../src/rendering/spritePoseData.js';
import { getHairColor, getHeadbandColor, getEyeColor } from '../src/rendering/skeletalParts.js';
import {
  COMBO_TRIALS, getTrialsForCharacter, getTrialsByDifficulty,
  getTrialById, getTrialCharacterIds,
} from '../src/state/comboTrialData.js';
import { FRAME_DATA_CHARS } from '../src/core/frameDataChars.js';

// ── Sprite Visual Data ────────────────────────────────────────
describe('spritePoseData CHAR_VISUALS', () => {
  const charIds = Object.keys(CHAR_VISUALS);
  it('has multiple character entries', () => {
    expect(charIds.length).toBeGreaterThanOrEqual(5);
  });
  it('ryo visual has expected fields', () => {
    const ryo = CHAR_VISUALS['ryo'];
    expect(ryo).toBeDefined();
    expect(ryo.hairColor).toBeDefined();
    expect(ryo.skinColor).toBeDefined();
    expect(ryo.shirtColor).toBeDefined();
    expect(ryo.hairStyle).toBeDefined();
    expect(ryo.idleStyle).toBeDefined();
  });
  it('kyo visual has spiky hair', () => {
    expect(CHAR_VISUALS['kyo'].hairStyle).toBe('spiky');
  });
  it('every visual has valid hairStyle', () => {
    const validStyles = ['spiky', 'long', 'short', 'ponytail', 'wild'];
    for (const id of Object.keys(CHAR_VISUALS)) {
      const v = CHAR_VISUALS[id];
      expect(validStyles).toContain(v.hairStyle);
    }
  });
  it('getDefaultVisual returns kyo-like visual', () => {
    const def = getDefaultVisual();
    expect(def.hairColor).toBeDefined();
    expect(typeof def.headW).toBe('number');
    expect(typeof def.legLen).toBe('number');
  });
});

// ── Skeletal Colors ───────────────────────────────────────────
describe('skeletalParts color functions', () => {
  it('getHairColor returns string for ryo', () => {
    const c = getHairColor('ryo');
    expect(typeof c).toBe('string');
    expect(c.length).toBeGreaterThan(0);
  });
  it('getHairColor returns string for kyo', () => {
    const c = getHairColor('kyo');
    expect(typeof c).toBe('string');
    expect(c.length).toBeGreaterThan(0);
  });
  it('getHeadbandColor returns string for ryo', () => {
    const c = getHeadbandColor('ryo');
    expect(typeof c).toBe('string');
    expect(c.length).toBeGreaterThan(0);
  });
  it('getEyeColor returns string for ryo', () => {
    const c = getEyeColor('ryo');
    expect(typeof c).toBe('string');
    expect(c.length).toBeGreaterThan(0);
  });
  it('colorIndex parameter works for ryo', () => {
    const c0 = getHairColor('ryo', 0);
    const c1 = getHairColor('ryo', 1);
    expect(typeof c0).toBe('string');
    expect(typeof c1).toBe('string');
  });
});

// ── Combo Trial Data ──────────────────────────────────────────
describe('comboTrialData', () => {
  it('COMBO_TRIALS has entries', () => {
    expect(COMBO_TRIALS.length).toBeGreaterThan(0);
  });
  it('getTrialsForCharacter returns array', () => {
    const ryoTrials = getTrialsForCharacter('ryo');
    expect(Array.isArray(ryoTrials)).toBe(true);
  });
  it('getTrialsByDifficulty returns array', () => {
    const easy = getTrialsByDifficulty('easy');
    expect(Array.isArray(easy)).toBe(true);
  });
  it('getTrialById returns trial or undefined', () => {
    if (COMBO_TRIALS.length > 0) {
      const first = COMBO_TRIALS[0];
      const found = getTrialById(first.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(first.id);
    }
  });
  it('getTrialById returns undefined for unknown id', () => {
    expect(getTrialById('nonexistent_trial_xyz')).toBeUndefined();
  });
  it('getTrialCharacterIds returns non-empty array', () => {
    const ids = getTrialCharacterIds();
    expect(Array.isArray(ids)).toBe(true);
    expect(ids.length).toBeGreaterThan(0);
  });
});

// ── Character-Specific Frame Data ─────────────────────────────
describe('FRAME_DATA_CHARS', () => {
  const keys = Object.keys(FRAME_DATA_CHARS);
  it('has character-specific entries', () => {
    expect(keys.length).toBeGreaterThan(0);
  });
  it('has ryo entries', () => {
    const ryoKeys = keys.filter(k => k.toLowerCase().includes('ryo'));
    expect(ryoKeys.length).toBeGreaterThan(0);
  });
  it('all entries have startup > 0', () => {
    for (const key of keys) {
      const entry = FRAME_DATA_CHARS[key];
      if (entry && typeof entry.startup === 'number') {
        expect(entry.startup).toBeGreaterThan(0);
      }
    }
  });
  it('all entries have damage > 0', () => {
    for (const key of keys) {
      const entry = FRAME_DATA_CHARS[key];
      if (entry && typeof entry.damage === 'number') {
        expect(entry.damage).toBeGreaterThan(0);
      }
    }
  });
  it('has entries for multiple characters', () => {
    const prefixes = new Set(keys.map(k => k.split('_')[0].toLowerCase()));
    expect(prefixes.size).toBeGreaterThanOrEqual(3);
  });
});
