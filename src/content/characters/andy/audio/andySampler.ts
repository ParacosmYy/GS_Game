/**
 * Andy Audio Sampler — Character-specific sound renderers
 *
 * Move sounds:
 *   andy_hishou_ken       — 飛翔拳 (energy projectile)
 *   andy_shouryuu_dan     — 昇龍弾 (rising uppercut)
 *   andy_zanei_ryusei_ken — 斬影流星拳 (dash punch)
 *   andy_geki_hishou_ken  — 激飛翔拳 (air dive)
 *   andy_cho_reppa_dan    — 超裂破弾 (DM multi-hit rising uppercut)
 */

import {
  renderOsc, renderNoise, lowPass, highPass, bandPass,
  mixLayers, normalize, expDecay, padTo,
} from '../../../../audio/samplerRenderUtils.js';

type SampleRenderer = (sr: number) => Float32Array;

// 飛翔拳 (HISHOU_KEN): 能量弹 — 能量蓄积 + 发射
function renderHishouKen(sr: number): Float32Array {
  const dur = 0.25;
  const charge = renderOsc(sr, 0.06, 'sawtooth',
    t => 200 + 4000 * t,
    t => expDecay(t, 0.16, 12));
  const blast = bandPass(renderNoise(sr, 0.08, t => expDecay(t, 0.2, 30)), sr, 1500, 5000);
  const energy = renderOsc(sr, 0.1, 'sine', t => 800 - 1200 * t, t => expDecay(t, 0.25, 8));
  const body = renderOsc(sr, 0.08, 'sine', t => 120 - 800 * t, t => expDecay(t, 0.22, 10));

  const total = Math.ceil(sr * dur);
  const blastP = padTo(blast, total, Math.floor(sr * 0.06));
  const energyP = padTo(energy, total, Math.floor(sr * 0.06));
  const bodyP = padTo(body, total, Math.floor(sr * 0.08));

  return normalize(mixLayers(
    [charge, blastP, energyP, bodyP],
    [0.8, 1, 0.7, 0.6]
  ));
}

// 昇龍弾 (SHOURYUU_DAN): 上升uppercut — 上升冲击 + 打击
function renderShouryuuDan(sr: number): Float32Array {
  const dur = 0.3;
  const rise = renderOsc(sr, dur, 'sawtooth',
    t => 200 + 6000 * t,
    t => expDecay(t, 0.2, 10));
  const hit = bandPass(renderNoise(sr, 0.06, t => expDecay(t, 0.18, 35)), sr, 2000, 6000);
  const snap = renderOsc(sr, 0.04, 'square', t => 1800 - 30000 * t, t => expDecay(t, 0.1, 40));
  const body = renderOsc(sr, 0.1, 'sine', t => 100 - 600 * t, t => expDecay(t, 0.28, 8));

  const total = Math.ceil(sr * dur);
  const hitP = padTo(hit, total, Math.floor(sr * 0.05));
  const snapP = padTo(snap, total, Math.floor(sr * 0.04));
  const bodyP = padTo(body, total, Math.floor(sr * 0.06));

  return normalize(mixLayers(
    [rise, hitP, snapP, bodyP],
    [0.9, 1, 0.6, 0.8]
  ));
}

// 斬影流星拳 (ZANEI_RYUSEI_KEN): dash punch — 冲刺风压 + 打击
function renderZaneiRyuseiKen(sr: number): Float32Array {
  const dur = 0.25;
  const dash = highPass(renderNoise(sr, 0.1, t => expDecay(t, 0.14, 18)), sr, 3000);
  const punch = renderOsc(sr, 0.06, 'sawtooth', t => 300 + 2000 * t, t => expDecay(t, 0.15, 25));
  const impact = bandPass(renderNoise(sr, 0.05, t => expDecay(t, 0.2, 30)), sr, 1500, 5000);
  const body = renderOsc(sr, 0.08, 'sine', t => 100 - 500 * t, t => expDecay(t, 0.25, 8));

  const total = Math.ceil(sr * dur);
  const punchP = padTo(punch, total, Math.floor(sr * 0.06));
  const impactP = padTo(impact, total, Math.floor(sr * 0.08));
  const bodyP = padTo(body, total, Math.floor(sr * 0.06));

  return normalize(mixLayers(
    [dash, punchP, impactP, bodyP],
    [0.7, 1, 0.9, 0.6]
  ));
}

// 激飛翔拳 (GEKI_HISHOU_KEN): 空中diving attack — 下落风 + 打击
function renderGekiHishouKen(sr: number): Float32Array {
  const dur = 0.28;
  const dive = renderOsc(sr, 0.12, 'sawtooth',
    t => 300 + 5000 * t,
    t => expDecay(t, 0.18, 15));
  const slash = bandPass(renderNoise(sr, 0.06, t => expDecay(t, 0.2, 28)), sr, 2000, 7000);
  const impact = renderOsc(sr, 0.05, 'square', t => 1500 - 25000 * t, t => expDecay(t, 0.12, 35));
  const wind = highPass(renderNoise(sr, 0.08, t => expDecay(t, 0.15, 20)), sr, 4000);

  const total = Math.ceil(sr * dur);
  const slashP = padTo(slash, total, Math.floor(sr * 0.06));
  const impactP = padTo(impact, total, Math.floor(sr * 0.04));
  const windP = padTo(wind, total, Math.floor(sr * 0.05));

  return normalize(mixLayers(
    [dive, slashP, impactP, windP],
    [1, 0.8, 0.7, 0.5]
  ));
}

// 超裂破弾 (CHO_REPPA_DAN): DM多段上升 — 蓝色能量爆发 + 连续上升
function renderChoReppaDan(sr: number): Float32Array {
  const dur = 0.5;
  const charge = renderOsc(sr, 0.08, 'sawtooth',
    t => 100 + 6000 * t,
    t => expDecay(t, 0.12, 10));
  const eruption = renderOsc(sr, 0.2, 'sawtooth',
    t => t < 0.05 ? 200 + 12000 * t : 800 - 3000 * (t - 0.05),
    t => t < 0.05 ? 0.1 + t * 4 : expDecay(t - 0.05, 0.15, 6));
  const sub = renderOsc(sr, 0.25, 'sine', t => 50 - 20 * t, t => expDecay(t, 0.4, 4));
  const spin: Float32Array[] = [];
  for (let i = 0; i < 5; i++) {
    const offset = Math.floor(sr * (0.1 + i * 0.06));
    const hit = bandPass(renderNoise(sr, 0.04, t => expDecay(t, 0.2, 25)), sr, 1500, 6000);
    spin.push(padTo(hit, Math.ceil(sr * dur), offset));
  }
  const debris = lowPass(renderNoise(sr, 0.15, t => expDecay(t, 0.15, 8)), sr, 3000);
  const rumble = renderOsc(sr, 0.2, 'sine', t => 60 - 20 * t, t => expDecay(t, 0.3, 5));

  const total = Math.ceil(sr * dur);
  const chargeP = padTo(charge, total);
  const eruptionP = padTo(eruption, total, Math.floor(sr * 0.08));
  const subP = padTo(sub, total, Math.floor(sr * 0.08));
  const debrisP = padTo(debris, total, Math.floor(sr * 0.08));
  const rumbleP = padTo(rumble, total, Math.floor(sr * 0.06));

  return normalize(mixLayers(
    [chargeP, eruptionP, subP, ...spin, debrisP, rumbleP],
    [0.8, 1, 1.2, 1, 1, 1, 1, 1, 0.7, 0.9]
  ));
}

export function registerAndyAudio(registerFn: (id: string, renderer: SampleRenderer) => void): void {
  registerFn('andy_hishou_ken', renderHishouKen);
  registerFn('andy_shouryuu_dan', renderShouryuuDan);
  registerFn('andy_zanei_ryusei_ken', renderZaneiRyuseiKen);
  registerFn('andy_geki_hishou_ken', renderGekiHishouKen);
  registerFn('andy_cho_reppa_dan', renderChoReppaDan);
}
