/**
 * Audio Manifest — maps sound IDs to sample paths and fallback synthesis params.
 * Phase 1: defines the manifest structure; synthesis fallback is the default.
 * When real samples are added to assets/audio/, the loader prefers them.
 */

export interface SoundEntry {
  /** Unique sound ID matching the synthesis function name */
  id: string;
  /** Tier this sound belongs to (determines which synthesis path to use) */
  tier: 'light' | 'heavy' | 'special' | 'dm' | 'sdm' | 'system' | 'ambient';
  /** Path to real audio sample (relative to project root). null = synthesis only */
  samplePath: string | null;
  /** Synthesis fallback parameters */
  synth: SynthParams;
}

export interface SynthParams {
  /** Base frequency in Hz */
  baseFreq: number;
  /** Oscillator type */
  oscType: OscillatorType;
  /** Duration in seconds */
  duration: number;
  /** Volume 0-1 */
  volume: number;
}

export const AUDIO_MANIFEST: SoundEntry[] = [
  // Light hits (stand_A, stand_B, close_A, close_B)
  { id: 'hit_light', tier: 'light', samplePath: null, synth: { baseFreq: 180, oscType: 'sine', duration: 0.05, volume: 0.35 } },
  { id: 'block_light', tier: 'light', samplePath: null, synth: { baseFreq: 1100, oscType: 'square', duration: 0.08, volume: 0.15 } },

  // Heavy hits (stand_C, stand_D, crouch_C, crouch_D, jump_C, jump_D, stand_CD)
  { id: 'hit_heavy', tier: 'heavy', samplePath: null, synth: { baseFreq: 100, oscType: 'sine', duration: 0.12, volume: 0.5 } },
  { id: 'block_heavy', tier: 'heavy', samplePath: null, synth: { baseFreq: 900, oscType: 'square', duration: 0.1, volume: 0.2 } },

  // Special moves
  { id: 'special', tier: 'special', samplePath: null, synth: { baseFreq: 200, oscType: 'sawtooth', duration: 0.2, volume: 0.22 } },
  { id: 'projectile_launch', tier: 'special', samplePath: null, synth: { baseFreq: 300, oscType: 'sawtooth', duration: 0.15, volume: 0.18 } },

  // DM / SDM
  { id: 'dm_flash', tier: 'dm', samplePath: null, synth: { baseFreq: 300, oscType: 'sawtooth', duration: 0.3, volume: 0.25 } },
  { id: 'dm_impact', tier: 'dm', samplePath: null, synth: { baseFreq: 80, oscType: 'sawtooth', duration: 0.45, volume: 0.3 } },
  { id: 'sdm_flash', tier: 'sdm', samplePath: null, synth: { baseFreq: 300, oscType: 'sawtooth', duration: 0.4, volume: 0.35 } },
  { id: 'sdm_impact', tier: 'sdm', samplePath: null, synth: { baseFreq: 60, oscType: 'sawtooth', duration: 0.55, volume: 0.4 } },

  // System sounds
  { id: 'ko', tier: 'system', samplePath: null, synth: { baseFreq: 200, oscType: 'sawtooth', duration: 0.6, volume: 0.4 } },
  { id: 'counter', tier: 'system', samplePath: null, synth: { baseFreq: 1500, oscType: 'square', duration: 0.1, volume: 0.15 } },
  { id: 'guard_crush', tier: 'system', samplePath: null, synth: { baseFreq: 300, oscType: 'square', duration: 0.14, volume: 0.3 } },
  { id: 'cancel', tier: 'system', samplePath: null, synth: { baseFreq: 600, oscType: 'sawtooth', duration: 0.12, volume: 0.2 } },
  { id: 'wall_bounce', tier: 'system', samplePath: null, synth: { baseFreq: 600, oscType: 'square', duration: 0.12, volume: 0.2 } },
  { id: 'wire', tier: 'system', samplePath: null, synth: { baseFreq: 800, oscType: 'sawtooth', duration: 0.15, volume: 0.2 } },
  { id: 'juggle', tier: 'system', samplePath: null, synth: { baseFreq: 600, oscType: 'triangle', duration: 0.04, volume: 0.12 } },
  { id: 'chip', tier: 'system', samplePath: null, synth: { baseFreq: 800, oscType: 'triangle', duration: 0.03, volume: 0.06 } },
  { id: 'max_activation', tier: 'system', samplePath: null, synth: { baseFreq: 440, oscType: 'sine', duration: 0.2, volume: 0.2 } },
  { id: 'super_flash', tier: 'system', samplePath: null, synth: { baseFreq: 300, oscType: 'sawtooth', duration: 0.25, volume: 0.15 } },

  // Motion / ambient
  { id: 'step', tier: 'ambient', samplePath: null, synth: { baseFreq: 100, oscType: 'sine', duration: 0.02, volume: 0.03 } },
  { id: 'landing', tier: 'ambient', samplePath: null, synth: { baseFreq: 150, oscType: 'triangle', duration: 0.04, volume: 0.08 } },
  { id: 'roll', tier: 'ambient', samplePath: null, synth: { baseFreq: 200, oscType: 'triangle', duration: 0.1, volume: 0.1 } },
  { id: 'throw_hit', tier: 'light', samplePath: null, synth: { baseFreq: 120, oscType: 'sine', duration: 0.08, volume: 0.25 } },
  { id: 'quick_stand', tier: 'ambient', samplePath: null, synth: { baseFreq: 400, oscType: 'triangle', duration: 0.06, volume: 0.1 } },
];

/** Quick lookup by sound ID */
const byId = new Map(AUDIO_MANIFEST.map(e => [e.id, e]));
export function getSoundEntry(id: string): SoundEntry | undefined { return byId.get(id); }

/** All sound IDs that currently have sample paths (real audio available) */
export function getSampledSounds(): string[] {
  return AUDIO_MANIFEST.filter(e => e.samplePath !== null).map(e => e.id);
}
