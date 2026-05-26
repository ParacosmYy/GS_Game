/**
 * Audio Manifest Tests
 *
 * Covers: manifest structure, sound effect mappings for Ryo attacks,
 *   synth param validity, tier coverage, lookup functions.
 */
import { describe, it, expect } from 'vitest';
import {
  AUDIO_MANIFEST,
  getSoundEntry,
  getSampledSounds,
  type SoundEntry,
  type SynthParams,
} from '../src/audio/audioManifest.js';

const VALID_TIERS = ['light', 'heavy', 'special', 'dm', 'sdm', 'system', 'ambient'] as const;
const VALID_OSC_TYPES: OscillatorType[] = ['sine', 'square', 'sawtooth', 'triangle'];

// ── 1. Manifest Structure ──────────────────────────────────

describe('Audio Manifest Structure', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(AUDIO_MANIFEST)).toBe(true);
    expect(AUDIO_MANIFEST.length).toBeGreaterThan(0);
  });

  it('every entry has valid shape', () => {
    for (const entry of AUDIO_MANIFEST) {
      expect(typeof entry.id).toBe('string');
      expect(entry.id.length).toBeGreaterThan(0);
      expect(VALID_TIERS).toContain(entry.tier);
      expect(entry.samplePath === null || typeof entry.samplePath === 'string').toBe(true);
      expect(entry.synth).toBeDefined();
      expect(typeof entry.synth.baseFreq).toBe('number');
      expect(VALID_OSC_TYPES).toContain(entry.synth.oscType);
      expect(typeof entry.synth.duration).toBe('number');
      expect(typeof entry.synth.volume).toBe('number');
    }
  });

  it('all IDs are unique', () => {
    const ids = AUDIO_MANIFEST.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ── 2. Synth Params Reasonableness ─────────────────────────

describe('Synth Params Reasonableness', () => {
  it('baseFreq is in audible range (20–20000 Hz)', () => {
    for (const entry of AUDIO_MANIFEST) {
      expect(entry.synth.baseFreq).toBeGreaterThanOrEqual(20);
      expect(entry.synth.baseFreq).toBeLessThanOrEqual(20000);
    }
  });

  it('duration is positive and under 2 seconds', () => {
    for (const entry of AUDIO_MANIFEST) {
      expect(entry.synth.duration).toBeGreaterThan(0);
      expect(entry.synth.duration).toBeLessThanOrEqual(2);
    }
  });

  it('volume is between 0 and 1', () => {
    for (const entry of AUDIO_MANIFEST) {
      expect(entry.synth.volume).toBeGreaterThanOrEqual(0);
      expect(entry.synth.volume).toBeLessThanOrEqual(1);
    }
  });
});

// ── 3. Sound Effect Mappings for Ryo Attacks ───────────────

describe('Ryo Attack Sound Mappings', () => {
  const requiredRyoAttackSounds = [
    'hit_light',   // stand_A, stand_B, close_A, close_B
    'hit_heavy',   // stand_C, stand_D, crouch_C, crouch_D, jump_C, jump_D, stand_CD
    'block_light',
    'block_heavy',
    'special',     // koouken, kohou, hien
    'projectile_launch',
    'dm_flash',
    'dm_impact',
    'sdm_flash',
    'sdm_impact',
  ] as const;

  it('all required Ryo attack sounds exist', () => {
    for (const id of requiredRyoAttackSounds) {
      const entry = getSoundEntry(id);
      expect(entry, `Missing sound entry: ${id}`).toBeDefined();
      expect(entry!.id).toBe(id);
    }
  });

  it('Ryo specials use appropriate tiers', () => {
    const specialEntry = getSoundEntry('special')!;
    expect(specialEntry.tier).toBe('special');

    const dmFlash = getSoundEntry('dm_flash')!;
    expect(dmFlash.tier).toBe('dm');

    const sdmFlash = getSoundEntry('sdm_flash')!;
    expect(sdmFlash.tier).toBe('sdm');
  });

  it('DM/SDM sounds have longer duration than light hits', () => {
    const lightHit = getSoundEntry('hit_light')!;
    const dmImpact = getSoundEntry('dm_impact')!;
    const sdmImpact = getSoundEntry('sdm_impact')!;

    // Duration scales up: light < DM < SDM
    expect(dmImpact.synth.duration).toBeGreaterThan(lightHit.synth.duration);
    expect(sdmImpact.synth.duration).toBeGreaterThan(dmImpact.synth.duration);

    // SDM is at least as loud as DM
    expect(sdmImpact.synth.volume).toBeGreaterThanOrEqual(dmImpact.synth.volume);
  });
});

// ── 4. System Sounds ───────────────────────────────────────

describe('System Sounds', () => {
  const systemIds = [
    'ko', 'counter', 'guard_crush', 'cancel',
    'wall_bounce', 'wire', 'juggle', 'chip',
    'max_activation', 'super_flash',
  ];

  it('core system sounds exist', () => {
    for (const id of systemIds) {
      const entry = getSoundEntry(id);
      expect(entry, `Missing system sound: ${id}`).toBeDefined();
      expect(entry!.tier).toBe('system');
    }
  });

  it('KO sound has substantial duration', () => {
    const ko = getSoundEntry('ko')!;
    expect(ko.synth.duration).toBeGreaterThanOrEqual(0.4);
    expect(ko.synth.volume).toBeGreaterThanOrEqual(0.3);
  });
});

// ── 5. Ambient Sounds ──────────────────────────────────────

describe('Ambient Sounds', () => {
  const ambientIds = ['step', 'landing', 'roll', 'quick_stand'];

  it('movement ambient sounds exist', () => {
    for (const id of ambientIds) {
      const entry = getSoundEntry(id);
      expect(entry, `Missing ambient sound: ${id}`).toBeDefined();
      expect(entry!.tier).toBe('ambient');
    }
  });

  it('ambient sounds are quiet (low volume)', () => {
    for (const id of ambientIds) {
      const entry = getSoundEntry(id)!;
      expect(entry.synth.volume).toBeLessThanOrEqual(0.15);
    }
  });
});

// ── 6. Announcer Sounds ────────────────────────────────────

describe('Announcer Sounds', () => {
  const annIds = [
    'ann_round1', 'ann_round2', 'ann_round3',
    'ann_fight', 'ann_ko', 'ann_perfect',
    'ann_timeOver', 'ann_winner',
  ];

  it('announcer entries exist', () => {
    for (const id of annIds) {
      const entry = getSoundEntry(id);
      expect(entry, `Missing announcer: ${id}`).toBeDefined();
    }
  });
});

// ── 7. Lookup Functions ────────────────────────────────────

describe('Lookup Functions', () => {
  it('getSoundEntry returns undefined for unknown id', () => {
    expect(getSoundEntry('nonexistent_sound_xyz')).toBeUndefined();
  });

  it('getSampledSounds returns empty array (no real samples yet)', () => {
    const sampled = getSampledSounds();
    expect(Array.isArray(sampled)).toBe(true);
    // All entries currently have samplePath: null
    expect(sampled.length).toBe(0);
  });
});

// ── 8. Tier Coverage ───────────────────────────────────────

describe('Tier Coverage', () => {
  it('all 7 tiers are represented', () => {
    const tiers = new Set(AUDIO_MANIFEST.map(e => e.tier));
    for (const t of VALID_TIERS) {
      expect(tiers.has(t), `Missing tier: ${t}`).toBe(true);
    }
  });
});
