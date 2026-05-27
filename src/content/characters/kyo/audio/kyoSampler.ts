/**
 * Kyo Audio Sampler — Character-specific sound renderers
 *
 * Registers Kyo's move sound effects into the sampler registry.
 * Each render function produces a Float32Array from raw DSP primitives;
 * the core sampler handles AudioBuffer creation.
 *
 * Move sounds:
 *   kyo_yamibarai  — 闇払い (fireball)
 *   kyo_oniyaki    — 鬼焼き (rising dragon punch)
 *   kyo_aragami    — 荒咬み (rekka 1st hit)
 *   kyo_dokugami   — 毒咬み (rekka heavy)
 *   kyo_75kai      — 75式改 (double kick)
 *   kyo_red_kick   — R.E.D. Kick (arc kick)
 *   kyo_orochinagi — 大蛇薙 (DM flame wave)
 */

import {
  renderOsc, renderNoise, highPass, bandPass,
  mixLayers, normalize, expDecay, padTo,
} from '../../../../audio/samplerRenderUtils.js';

type SampleRenderer = (sr: number) => Float32Array;

// === Kyo 必杀技专属音效预渲染 ===

// 闇払い (YAMIBARAI): 火焰弹 — whoosh + 火焰噼啪
function renderKyoYamibarai(sr: number): Float32Array {
  const dur = 0.4;
  const rumble = renderOsc(sr, dur, 'sawtooth',
    t => 200 - 300 * t,
    t => t < 0.05 ? t * 8 : expDecay(t - 0.05, 0.25, 5));
  const crackle = highPass(renderNoise(sr, dur * 0.7, t => expDecay(t, 0.18, 10)), sr, 5000);
  const core = bandPass(renderNoise(sr, dur * 0.6, t => expDecay(t, 0.2, 8)), sr, 1500, 4500);
  const launch = renderOsc(sr, 0.06, 'square', t => 1800 - 30000 * t, t => expDecay(t, 0.15, 35));
  const hum = renderOsc(sr, dur * 0.85, 'sine',
    t => 160 - 300 * t,
    t => t < 0.04 ? t * 6 : expDecay(t - 0.04, 0.2, 6));

  const total = Math.ceil(sr * dur);
  const crackleP = padTo(crackle, total);
  const coreP = padTo(core, total);
  const launchP = padTo(launch, total);
  const humP = padTo(hum, total);

  return normalize(mixLayers(
    [rumble, crackleP, coreP, launchP, humP],
    [1, 0.65, 0.75, 0.55, 0.6]
  ));
}

// 鬼焼き (ONIYAKI): 升龙火焰拳 — 上升频率sweep + 打击感
function renderKyoOniyaki(sr: number): Float32Array {
  const dur = 0.3;
  const sweep = renderOsc(sr, 0.15, 'sine',
    t => 150 + 3000 * t,
    t => expDecay(t, 0.22, 12));
  const burst = highPass(renderNoise(sr, 0.1, t => expDecay(t, 0.25, 25)), sr, 3000);
  const body = renderOsc(sr, 0.12, 'sine', t => 100 - 1000 * t, t => expDecay(t, 0.3, 10));
  const snap = renderOsc(sr, 0.04, 'triangle', t => 3500 - 80000 * t, t => expDecay(t, 0.15, 50));
  const sub = renderOsc(sr, 0.18, 'sine', t => 50 - 25 * t, t => expDecay(t, 0.35, 6));

  const total = Math.ceil(sr * dur);
  const burstP = padTo(burst, total);
  const snapP = padTo(snap, total, Math.floor(sr * 0.03));
  const subP = padTo(sub, total, Math.floor(sr * 0.03));

  return normalize(mixLayers(
    [sweep, burstP, body, snapP, subP],
    [1, 0.6, 0.85, 0.5, 0.9]
  ));
}

// 荒咬み (ARAGAMI): rekka起手式火焰拳 — 锐利火拳冲击
function renderKyoAragami(sr: number): Float32Array {
  const dur = 0.25;
  const punch = renderOsc(sr, 0.1, 'square', t => 300 - 2000 * t, t => expDecay(t, 0.2, 30));
  const fire = highPass(renderNoise(sr, 0.08, t => expDecay(t, 0.18, 30)), sr, 4000);
  const body = renderOsc(sr, 0.08, 'sine', t => 150 - 2000 * t, t => expDecay(t, 0.25, 20));
  const snap = renderOsc(sr, 0.025, 'triangle', t => 4000 - 80000 * t, t => expDecay(t, 0.12, 60));

  const total = Math.ceil(sr * dur);
  const fireP = padTo(fire, total);
  const snapP = padTo(snap, total, Math.floor(sr * 0.02));

  return normalize(mixLayers(
    [punch, fireP, body, snapP],
    [1, 0.7, 0.8, 0.55]
  ));
}

// 毒咬み (DOKUGAMI): 强rekka火焰拳 — 沉重火焰爆炸
function renderKyoDokugami(sr: number): Float32Array {
  const dur = 0.3;
  const blast = renderOsc(sr, 0.15, 'sawtooth', t => 250 - 1500 * t, t => expDecay(t, 0.22, 15));
  const fire = bandPass(renderNoise(sr, 0.12, t => expDecay(t, 0.2, 15)), sr, 2000, 7000);
  const body = renderOsc(sr, 0.12, 'sine', t => 120 - 1500 * t, t => expDecay(t, 0.3, 12));
  const crack = renderOsc(sr, 0.035, 'triangle', t => 3000 - 60000 * t, t => expDecay(t, 0.15, 45));
  const sub = renderOsc(sr, 0.15, 'sine', t => 50 - 30 * t, t => expDecay(t, 0.35, 8));

  const total = Math.ceil(sr * dur);
  const fireP = padTo(fire, total);
  const crackP = padTo(crack, total, Math.floor(sr * 0.03));
  const subP = padTo(sub, total);

  return normalize(mixLayers(
    [blast, fireP, body, crackP, subP],
    [1, 0.75, 0.9, 0.5, 0.85]
  ));
}

// 75式改 (75_KAI): 双段踢 — 两次短促冲击
function renderKyo75Kai(sr: number): Float32Array {
  const dur = 0.2;
  const kick1 = bandPass(renderNoise(sr, 0.04, t => expDecay(t, 0.25, 40)), sr, 1500, 6000);
  const kick2 = bandPass(renderNoise(sr, 0.04, t => expDecay(t, 0.25, 40)), sr, 1500, 6000);
  const body = renderOsc(sr, 0.1, 'sine', t => 130 - 1500 * t, t => expDecay(t, 0.28, 18));
  const wind = highPass(renderNoise(sr, 0.08, t => expDecay(t, 0.12, 25)), sr, 4000);

  const total = Math.ceil(sr * dur);
  const kick1P = padTo(kick1, total);
  const kick2P = padTo(kick2, total, Math.floor(sr * 0.08));
  const bodyP = padTo(body, total, Math.floor(sr * 0.02));
  const windP = padTo(wind, total);

  return normalize(mixLayers(
    [kick1P, kick2P, bodyP, windP],
    [1, 0.9, 0.75, 0.55]
  ));
}

// R.E.D. Kick: 弧形飞踢 — 频率下扫 + 噪声
function renderKyoRedKick(sr: number): Float32Array {
  const dur = 0.3;
  const swoop = renderOsc(sr, 0.18, 'sine',
    t => 400 - 1100 * t,
    t => expDecay(t, 0.2, 10));
  const wind = highPass(renderNoise(sr, 0.1, t => expDecay(t, 0.18, 20)), sr, 3000);
  const impact = bandPass(renderNoise(sr, 0.05, t => expDecay(t, 0.25, 35)), sr, 2000, 7000);
  const body = renderOsc(sr, 0.1, 'sine', t => 110 - 1200 * t, t => expDecay(t, 0.25, 18));

  const total = Math.ceil(sr * dur);
  const windP = padTo(wind, total);
  const impactP = padTo(impact, total, Math.floor(sr * 0.06));
  const bodyP = padTo(body, total, Math.floor(sr * 0.04));

  return normalize(mixLayers(
    [swoop, windP, impactP, bodyP],
    [0.9, 0.6, 1, 0.8]
  ));
}

// 大蛇薙 (OROCHINAGI): DM大蛇薙 — 巨大火焰波
function renderKyoOrochinagi(sr: number): Float32Array {
  const dur = 0.6;
  const bass = renderOsc(sr, dur, 'sawtooth',
    t => t < 0.08 ? 80 + 200 * t : 96 - 60 * (t - 0.08),
    t => t < 0.06 ? t * 6 : expDecay(t - 0.06, 0.35, 3));
  const mid = renderOsc(sr, dur * 0.8, 'square',
    t => 300 - 250 * t,
    t => t < 0.05 ? t * 5 : expDecay(t - 0.05, 0.25, 4));
  const crackle = highPass(renderNoise(sr, dur * 0.6, t => expDecay(t, 0.2, 6)), sr, 5000);
  const sub = renderOsc(sr, 0.3, 'sine', t => 45 - 30 * t, t => expDecay(t, 0.45, 3));
  const burst = bandPass(renderNoise(sr, dur * 0.5, t => expDecay(t, 0.25, 5)), sr, 400, 3000);
  const launch = renderOsc(sr, 0.06, 'square', t => 2000 - 35000 * t, t => expDecay(t, 0.18, 30));
  const metal = renderOsc(sr, 0.08, 'triangle', t => 2500 - 30000 * t, t => expDecay(t, 0.1, 20));

  const total = Math.ceil(sr * dur);
  const midP = padTo(mid, total);
  const crackleP = padTo(crackle, total);
  const subP = padTo(sub, total);
  const burstP = padTo(burst, total);
  const launchP = padTo(launch, total);
  const metalP = padTo(metal, total, Math.floor(sr * 0.05));

  return normalize(mixLayers(
    [bass, midP, crackleP, subP, burstP, launchP, metalP],
    [1.1, 0.8, 0.55, 1.15, 0.7, 0.6, 0.35]
  ));
}

/**
 * Register all Kyo sound renderers with the sampler.
 *
 * @param registerFn - Callback provided by the sampler core;
 *   receives (sampleId, renderFunction) pairs.
 */
export function registerKyoAudio(registerFn: (id: string, renderer: SampleRenderer) => void): void {
  registerFn('kyo_yamibarai', renderKyoYamibarai);
  registerFn('kyo_oniyaki', renderKyoOniyaki);
  registerFn('kyo_aragami', renderKyoAragami);
  registerFn('kyo_dokugami', renderKyoDokugami);
  registerFn('kyo_75kai', renderKyo75Kai);
  registerFn('kyo_red_kick', renderKyoRedKick);
  registerFn('kyo_orochinagi', renderKyoOrochinagi);
}
