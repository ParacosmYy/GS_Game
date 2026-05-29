/**
 * Yuri Content Package — Audio Sampler
 *
 * Procedural audio sample renderers for Yuri's moves.
 */

import { renderOsc, renderNoise, lowPass, highPass, mixLayers, normalize, expDecay, bandPass } from '../../../../audio/samplerRenderUtils.js';

type SampleRenderer = (sr: number) => Float32Array;

function renderKoOuKen(sr: number): Float32Array {
  const fire = renderOsc(sr, 0.3, 'sawtooth',
    t => 200 + 6000 * t,
    t => expDecay(t, 0.2, 15));
  const burst = bandPass(renderNoise(sr, 0.1, t => expDecay(t, 0.15, 20)), sr, 1500, 4000);
  return normalize(mixLayers([fire, burst], [0.6, 0.4]));
}

function renderHaohShoKoKen(sr: number): Float32Array {
  const base = renderOsc(sr, 0.4, 'sawtooth',
    t => 150 + 4000 * t,
    t => expDecay(t, 0.25, 12));
  const high = renderOsc(sr, 0.3, 'square',
    t => 400 + 2000 * t,
    t => expDecay(t, 0.2, 10));
  const burst = lowPass(renderNoise(sr, 0.2, t => expDecay(t, 0.18, 15)), sr, 3000);
  return normalize(mixLayers([base, high, burst], [0.4, 0.3, 0.3]));
}

function renderChouUpper(sr: number): Float32Array {
  const rising = renderOsc(sr, 0.2, 'sawtooth',
    t => 300 + 8000 * t,
    t => expDecay(t, 0.15, 20));
  const impact = highPass(renderNoise(sr, 0.15, t => expDecay(t, 0.2, 25)), sr, 1500);
  return normalize(mixLayers([rising, impact], [0.5, 0.5]));
}

function renderHyakuRetsuBinta(sr: number): Float32Array {
  const slap1 = renderOsc(sr, 0.06, 'square',
    t => 500 + 2000 * t,
    t => expDecay(t, 0.1, 25));
  const slap2 = renderOsc(sr, 0.06, 'square',
    t => 550 + 1500 * t,
    t => expDecay(t, 0.1, 25));
  const slap3 = renderOsc(sr, 0.06, 'square',
    t => 600 + 1000 * t,
    t => expDecay(t, 0.1, 25));
  return normalize(mixLayers([slap1, slap2, slap3], [0.35, 0.35, 0.3]));
}

function renderHienHouOuKyaku(sr: number): Float32Array {
  const kick = renderOsc(sr, 0.25, 'sawtooth',
    t => 250 + 5000 * t,
    t => expDecay(t, 0.18, 15));
  const swoosh = lowPass(renderNoise(sr, 0.15, t => expDecay(t, 0.2, 20)), sr, 2500);
  return normalize(mixLayers([kick, swoosh], [0.6, 0.4]));
}

function renderHishouKuuretsuZan(sr: number): Float32Array {
  const dive = renderOsc(sr, 0.3, 'sawtooth',
    t => 180 + 6000 * t,
    t => expDecay(t, 0.2, 18));
  const air = lowPass(renderNoise(sr, 0.2, t => expDecay(t, 0.18, 15)), sr, 2000);
  return normalize(mixLayers([dive, air], [0.5, 0.5]));
}

function renderDmHaohShoKoKen(sr: number): Float32Array {
  const blast = renderOsc(sr, 0.5, 'sawtooth',
    t => 120 + 3000 * t,
    t => expDecay(t, 0.3, 10));
  const high = renderOsc(sr, 0.3, 'square',
    t => 500 + 2000 * t,
    t => expDecay(t, 0.2, 12));
  const rumble = lowPass(renderNoise(sr, 0.3, t => expDecay(t, 0.25, 8)), sr, 1500);
  return normalize(mixLayers([blast, high, rumble], [0.4, 0.3, 0.3]));
}

function renderDmHienHouOuKyaku(sr: number): Float32Array {
  const kick = renderOsc(sr, 0.4, 'sawtooth',
    t => 200 + 6000 * t,
    t => expDecay(t, 0.25, 12));
  const impact = lowPass(renderNoise(sr, 0.25, t => expDecay(t, 0.2, 18)), sr, 3000);
  const ring = renderOsc(sr, 0.2, 'sine',
    t => 800 - 200 * t,
    t => expDecay(t, 0.15, 15));
  return normalize(mixLayers([kick, impact, ring], [0.4, 0.35, 0.25]));
}

export function registerYuriAudio(registerFn: (id: string, renderer: SampleRenderer) => void): void {
  registerFn('yuri_ko_ou_ken', renderKoOuKen);
  registerFn('yuri_haoh_sho_ko_ken', renderHaohShoKoKen);
  registerFn('yuri_chou_upper', renderChouUpper);
  registerFn('yuri_hyaku_retsu_binta', renderHyakuRetsuBinta);
  registerFn('yuri_hien_hou_ou_kyaku', renderHienHouOuKyaku);
  registerFn('yuri_hishou_kuuretsu_zan', renderHishouKuuretsuZan);
  registerFn('dm_yuri_haoh_sho_ko_ken', renderDmHaohShoKoKen);
  registerFn('dm_yuri_hien_hou_ou_kyaku', renderDmHienHouOuKyaku);
}
