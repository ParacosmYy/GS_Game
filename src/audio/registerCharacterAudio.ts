/**
 * Auto-register all character-specific audio samplers
 *
 * Called once during initSampler(). After this, play() can find
 * character samples by ID without knowing where renderers live.
 */

import { registerRyoAudio } from '../content/characters/ryo/audio/ryoSampler.js';
import { registerKyoAudio } from '../content/characters/kyo/audio/kyoSampler.js';
import { registerIoriAudio } from '../content/characters/iori/audio/ioriSampler.js';

export type SampleRenderer = (sr: number) => Float32Array;

/**
 * Register all character audio renderers via a callback.
 *
 * @param registerFn - Sampler core's registration function;
 *   receives (sampleId, renderFunction) pairs.
 */
export function initCharacterAudio(registerFn: (id: string, renderer: SampleRenderer) => void): void {
  registerRyoAudio(registerFn);
  registerKyoAudio(registerFn);
  registerIoriAudio(registerFn);
}
