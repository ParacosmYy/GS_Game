/**
 * Auto-register all character-specific audio samplers
 *
 * Called once during initSampler(). After this, play() can find
 * character samples by ID without knowing where renderers live.
 */

import { registerRyoAudio } from '../content/characters/ryo/audio/ryoSampler.js';
import { registerKyoAudio } from '../content/characters/kyo/audio/kyoSampler.js';
import { registerIoriAudio } from '../content/characters/iori/audio/ioriSampler.js';
import { registerTerryAudio } from '../content/characters/terry/audio/terrySampler.js';
import { registerKimAudio } from '../content/characters/kim/audio/kimSampler.js';

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
  registerTerryAudio(registerFn);
  registerKimAudio(registerFn);
}
