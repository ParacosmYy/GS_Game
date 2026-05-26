/**
 * Ryo Content Package — Animation Sequences
 *
 * Re-exports Ryo's animation sequences from the animation manifest.
 * Provides typed access to Ryo's frame timings, loop settings, and cancel frames.
 */
import { ANIMATION_MANIFEST, getCharacterAnimManifest } from '../../../core/animationManifestData.js';
import type { AnimSequence, CharacterAnimManifest } from '../../../core/animationManifest.js';

/** Get Ryo's full animation manifest */
export function getRyoAnimations(): CharacterAnimManifest | undefined {
  return getCharacterAnimManifest('ryo');
}

/** Get a specific Ryo animation sequence by name */
export function getRyoAnimSequence(name: string): AnimSequence | undefined {
  const manifest = getCharacterAnimManifest('ryo');
  return manifest?.sequences[name];
}

/** All Ryo animation sequence names */
export function getRyoAnimSequenceNames(): string[] {
  const manifest = getCharacterAnimManifest('ryo');
  return manifest ? Object.keys(manifest.sequences) : [];
}

/** Required sequences per CLAUDE.md 7.2 */
export const RYO_REQUIRED_ANIMATIONS: string[] = [
  'idle',
  'walk_forward',
  'walk_backward',
  'jump_up',
  'jump_forward',
  'jump_backward',
  'stand_a',
  'stand_c',
  'hitstun',
  'knockdown',
];
