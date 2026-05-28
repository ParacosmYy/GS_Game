/**
 * Audio Manifest Validation Tests
 *
 * Validates AUDIO_MANIFEST data integrity:
 * - All IDs are unique
 * - All tiers are valid
 * - Synth params are within valid ranges
 * - All required sound categories are covered
 * - getSoundEntry lookup works correctly
 */
import { describe, it, expect } from 'vitest';
import { AUDIO_MANIFEST, getSoundEntry } from '../src/audio/audioManifest.js';

const VALID_TIERS = new Set(['light', 'heavy', 'special', 'dm', 'sdm', 'system', 'ambient']);
const VALID_OSC_TYPES = new Set(['sine', 'square', 'sawtooth', 'triangle']);

describe('AUDIO_MANIFEST structure', () => {
  it('has entries', () => {
    expect(AUDIO_MANIFEST.length).toBeGreaterThan(0);
  });

  it('all IDs are unique', () => {
    const ids = AUDIO_MANIFEST.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all tiers are valid', () => {
    for (const entry of AUDIO_MANIFEST) {
      expect(VALID_TIERS.has(entry.tier),
        `${entry.id} tier=${entry.tier}`).toBe(true);
    }
  });

  it('all IDs are non-empty strings', () => {
    for (const entry of AUDIO_MANIFEST) {
      expect(entry.id.length).toBeGreaterThan(0);
    }
  });
});

describe('AUDIO_MANIFEST synth params', () => {
  it('all baseFreq are positive', () => {
    for (const entry of AUDIO_MANIFEST) {
      expect(entry.synth.baseFreq, `${entry.id} baseFreq`).toBeGreaterThan(0);
    }
  });

  it('all durations are positive', () => {
    for (const entry of AUDIO_MANIFEST) {
      expect(entry.synth.duration, `${entry.id} duration`).toBeGreaterThan(0);
    }
  });

  it('all volumes are between 0 and 1', () => {
    for (const entry of AUDIO_MANIFEST) {
      expect(entry.synth.volume, `${entry.id} volume`).toBeGreaterThanOrEqual(0);
      expect(entry.synth.volume, `${entry.id} volume`).toBeLessThanOrEqual(1);
    }
  });

  it('all oscTypes are valid', () => {
    for (const entry of AUDIO_MANIFEST) {
      expect(VALID_OSC_TYPES.has(entry.synth.oscType),
        `${entry.id} oscType=${entry.synth.oscType}`).toBe(true);
    }
  });
});

describe('AUDIO_MANIFEST coverage', () => {
  it('covers hit sounds (light + heavy)', () => {
    expect(getSoundEntry('hit_light')).toBeDefined();
    expect(getSoundEntry('hit_heavy')).toBeDefined();
  });

  it('covers block sounds', () => {
    expect(getSoundEntry('block_light')).toBeDefined();
    expect(getSoundEntry('block_heavy')).toBeDefined();
  });

  it('covers DM sounds', () => {
    expect(getSoundEntry('dm_flash')).toBeDefined();
    expect(getSoundEntry('dm_impact')).toBeDefined();
  });

  it('covers SDM sounds', () => {
    expect(getSoundEntry('sdm_flash')).toBeDefined();
    expect(getSoundEntry('sdm_impact')).toBeDefined();
  });

  it('covers system sounds', () => {
    expect(getSoundEntry('ko')).toBeDefined();
    expect(getSoundEntry('counter')).toBeDefined();
    expect(getSoundEntry('guard_crush')).toBeDefined();
    expect(getSoundEntry('max_activation')).toBeDefined();
  });

  it('covers announcer sounds', () => {
    expect(getSoundEntry('ann_fight')).toBeDefined();
    expect(getSoundEntry('ann_ko')).toBeDefined();
    expect(getSoundEntry('ann_round1')).toBeDefined();
    expect(getSoundEntry('ann_perfect')).toBeDefined();
  });

  it('covers ambient sounds', () => {
    expect(getSoundEntry('step')).toBeDefined();
    expect(getSoundEntry('landing')).toBeDefined();
    expect(getSoundEntry('roll')).toBeDefined();
  });
});

describe('AUDIO_MANIFEST tier distribution', () => {
  it('has at least 2 entries per tier (except sdm)', () => {
    const tierCounts: Record<string, number> = {};
    for (const entry of AUDIO_MANIFEST) {
      tierCounts[entry.tier] = (tierCounts[entry.tier] || 0) + 1;
    }
    for (const [tier, count] of Object.entries(tierCounts)) {
      if (tier === 'sdm') continue; // SDM may have fewer
      expect(count, `${tier} entries`).toBeGreaterThanOrEqual(2);
    }
  });

  it('DM entries have longer duration than light entries', () => {
    const dmEntries = AUDIO_MANIFEST.filter(e => e.tier === 'dm');
    const lightEntries = AUDIO_MANIFEST.filter(e => e.tier === 'light' && e.id.startsWith('hit'));
    const avgDmDuration = dmEntries.reduce((s, e) => s + e.synth.duration, 0) / dmEntries.length;
    const avgLightDuration = lightEntries.reduce((s, e) => s + e.synth.duration, 0) / lightEntries.length;
    expect(avgDmDuration, 'DM avg duration > light avg').toBeGreaterThan(avgLightDuration);
  });

  it('SDM has higher volume than DM', () => {
    const sdmEntries = AUDIO_MANIFEST.filter(e => e.tier === 'sdm');
    const dmEntries = AUDIO_MANIFEST.filter(e => e.tier === 'dm');
    const avgSdmVol = sdmEntries.reduce((s, e) => s + e.synth.volume, 0) / sdmEntries.length;
    const avgDmVol = dmEntries.reduce((s, e) => s + e.synth.volume, 0) / dmEntries.length;
    expect(avgSdmVol, 'SDM avg volume >= DM avg').toBeGreaterThanOrEqual(avgDmVol);
  });
});

describe('getSoundEntry', () => {
  it('returns entry for valid ID', () => {
    const entry = getSoundEntry('hit_light');
    expect(entry).toBeDefined();
    expect(entry!.id).toBe('hit_light');
  });

  it('returns undefined for unknown ID', () => {
    expect(getSoundEntry('nonexistent')).toBeUndefined();
  });
});
