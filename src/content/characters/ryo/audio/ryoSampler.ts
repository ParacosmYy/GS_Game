/**
 * Ryo Audio Sampler — Character-specific sound renderers
 *
 * Registers Ryo's move sound effects into the sampler registry.
 * Each render function produces a Float32Array from raw DSP primitives;
 * the core sampler handles AudioBuffer creation.
 *
 * Move sounds:
 *   ryo_koouken  — 虎煌拳 (energy projectile)
 *   ryo_ko_hou   — 虎咆 (rising uppercut)
 *   ryo_hien     — 飛燕 (flying kick)
 *   ryo_haou     — 霸王翔吼拳 (DM energy blast)
 *   ryo_tsurizao — 钓瓶打 (knife-hand slice)
 *   ryo_orishi   — 落蹴 (low sweeping kick)
 *   ryo_hio_hacker — 猛速突進拳 (dash strike)
 *   ryo_zanretsu_ken — 斩裂拳 (multi-punch rapid hits)
 */

import {
  renderOsc, renderNoise, lowPass, highPass, bandPass,
  mixLayers, normalize, expDecay, padTo,
} from '../../../../audio/samplerRenderUtils.js';

type SampleRenderer = (sr: number) => Float32Array;

// === Ryo 必杀技专属音效 ===

// 虎煌拳 (KOOU): 能量弹发射 — 低频 whoosh + 高频 sizzle
function renderKoouken(sr: number): Float32Array {
  const dur = 0.32;
  const whoosh = renderOsc(sr, dur, 'sawtooth',
    t => t < 0.06 ? 100 + 6000 * t : 460 - 2000 * (t - 0.06),
    t => t < 0.06 ? 0.1 + t * 1.5 : expDecay(t - 0.06, 0.28, 6));
  const sizzle = highPass(renderNoise(sr, dur * 0.8, t => expDecay(t, 0.15, 10)), sr, 5000);
  const core = bandPass(renderNoise(sr, dur * 0.6, t => expDecay(t, 0.2, 8)), sr, 1500, 4500);
  const impact = renderOsc(sr, 0.1, 'sine', t => 100 - 800 * t, t => expDecay(t, 0.35, 12));
  const launch = renderOsc(sr, 0.05, 'square', t => 2000 - 40000 * t, t => expDecay(t, 0.15, 40));
  const hum = renderOsc(sr, dur * 0.9, 'sine',
    t => 180 - 400 * t,
    t => t < 0.04 ? t * 5 : expDecay(t - 0.04, 0.18, 6));

  const total = Math.ceil(sr * dur);
  const sizzleP = padTo(sizzle, total);
  const coreP = padTo(core, total);
  const impactP = padTo(impact, total, Math.floor(sr * 0.02));
  const launchP = padTo(launch, total);
  const humP = padTo(hum, total);

  return normalize(mixLayers(
    [whoosh, sizzleP, coreP, impactP, launchP, humP],
    [1, 0.6, 0.7, 0.8, 0.5, 0.65]
  ));
}

// 虎咆 (KO_HOU): 升龙拳式上勾 — 上升 sweep + 打击感
function renderKoHou(sr: number): Float32Array {
  const dur = 0.28;
  const sweep = renderOsc(sr, 0.12, 'sawtooth',
    t => 200 + 15000 * t,
    t => expDecay(t, 0.2, 12));
  const hit = renderOsc(sr, 0.08, 'square', t => 800 - 20000 * t, t => expDecay(t, 0.25, 25));
  const body = renderOsc(sr, 0.15, 'sine', t => 100 - 1000 * t, t => expDecay(t, 0.3, 10));
  const airCut = highPass(renderNoise(sr, 0.1, t => expDecay(t, 0.18, 20)), sr, 3000);
  const snap = renderOsc(sr, 0.03, 'triangle', t => 3000 - 60000 * t, t => expDecay(t, 0.15, 50));
  const sub = renderOsc(sr, 0.2, 'sine', t => 50 - 30 * t, t => expDecay(t, 0.35, 5));

  const total = Math.ceil(sr * dur);
  const hitP = padTo(hit, total, Math.floor(sr * 0.04));
  const airCutP = padTo(airCut, total);
  const snapP = padTo(snap, total, Math.floor(sr * 0.03));
  const subP = padTo(sub, total, Math.floor(sr * 0.03));

  return normalize(mixLayers(
    [sweep, hitP, body, airCutP, snapP, subP],
    [1, 0.7, 0.9, 0.5, 0.45, 0.8]
  ));
}

// 飛燕 (HIEN): 飞踢 — 快速风切 + 踢击
function renderHien(sr: number): Float32Array {
  const dur = 0.2;
  const windCut = renderOsc(sr, 0.1, 'sawtooth',
    t => 300 + 20000 * t,
    t => expDecay(t, 0.15, 25));
  const kick = bandPass(renderNoise(sr, 0.06, t => expDecay(t, 0.25, 30)), sr, 2000, 8000);
  const swoosh = bandPass(renderNoise(sr, 0.12, t => expDecay(t, 0.12, 15)), sr, 600, 3000);
  const airSlice = highPass(renderNoise(sr, 0.05, t => expDecay(t, 0.1, 40)), sr, 6000);
  const kickBody = renderOsc(sr, 0.08, 'sine', t => 120 - 1500 * t, t => expDecay(t, 0.2, 18));

  const total = Math.ceil(sr * dur);
  const windCutP = padTo(windCut, total);
  const kickP = padTo(kick, total, Math.floor(sr * 0.04));
  const swooshP = padTo(swoosh, total, Math.floor(sr * 0.02));
  const airSliceP = padTo(airSlice, total);
  const kickBodyP = padTo(kickBody, total, Math.floor(sr * 0.03));

  return normalize(mixLayers(
    [windCutP, kickP, swooshP, airSliceP, kickBodyP],
    [0.9, 1, 0.7, 0.55, 0.8]
  ));
}

// 霸王翔吼拳 (HAOU): 强力能量弹 — 比 KOOU 更厚重
function renderHaou(sr: number): Float32Array {
  const dur = 0.45;
  const whoosh = renderOsc(sr, dur, 'sawtooth',
    t => t < 0.08 ? 80 + 4000 * t : 400 - 1200 * (t - 0.08),
    t => t < 0.08 ? 0.08 + t * 2 : expDecay(t - 0.08, 0.32, 4));
  const sub = renderOsc(sr, 0.25, 'sine', t => 45 - 35 * t, t => expDecay(t, 0.45, 4));
  const burst = bandPass(renderNoise(sr, dur * 0.7, t => expDecay(t, 0.25, 5)), sr, 400, 3000);
  const sizzle = highPass(renderNoise(sr, dur * 0.5, t => expDecay(t, 0.15, 8)), sr, 5000);
  const launch = renderOsc(sr, 0.06, 'square', t => 1500 - 30000 * t, t => expDecay(t, 0.2, 30));
  const hum = renderOsc(sr, dur * 0.85, 'sine',
    t => 140 - 300 * t,
    t => t < 0.05 ? t * 4 : expDecay(t - 0.05, 0.2, 4));
  const metal = renderOsc(sr, 0.1, 'triangle', t => 2200 - 25000 * t, t => expDecay(t, 0.08, 20));

  const total = Math.ceil(sr * dur);
  const subP = padTo(sub, total);
  const burstP = padTo(burst, total);
  const sizzleP = padTo(sizzle, total);
  const launchP = padTo(launch, total);
  const humP = padTo(hum, total);
  const metalP = padTo(metal, total, Math.floor(sr * 0.05));

  return normalize(mixLayers(
    [whoosh, subP, burstP, sizzleP, launchP, humP, metalP],
    [1, 1.1, 0.8, 0.5, 0.6, 0.75, 0.35]
  ));
}

// 钓瓶打 (TSURIZAO): →+A 冰柱割り — sharp knife-hand slice
function renderTsurizao(sr: number): Float32Array {
  const dur = 0.18;
  const slice = highPass(renderNoise(sr, 0.06, t => expDecay(t, 0.2, 35)), sr, 4000);
  const wind = bandPass(renderNoise(sr, 0.1, t => expDecay(t, 0.15, 20)), sr, 800, 3500);
  const sweep = renderOsc(sr, 0.08, 'sawtooth',
    t => 1500 + 12000 * t,
    t => expDecay(t, 0.18, 25));
  const body = renderOsc(sr, 0.07, 'sine', t => 140 - 1500 * t, t => expDecay(t, 0.22, 20));

  const total = Math.ceil(sr * dur);
  const windP = padTo(wind, total, Math.floor(sr * 0.02));
  const sweepP = padTo(sweep, total);
  const bodyP = padTo(body, total, Math.floor(sr * 0.03));

  return normalize(mixLayers(
    [slice, windP, sweepP, bodyP],
    [1, 0.7, 0.6, 0.8]
  ));
}

// 落蹴 (ORISHI): ↘+B — low sweeping kick thud
function renderOrishi(sr: number): Float32Array {
  const dur = 0.15;
  const thud = renderOsc(sr, 0.1, 'sine', t => 100 - 800 * t, t => expDecay(t, 0.3, 15));
  const sweep = lowPass(renderNoise(sr, 0.08, t => expDecay(t, 0.2, 25)), sr, 2000);
  const snap = bandPass(renderNoise(sr, 0.04, t => expDecay(t, 0.25, 40)), sr, 1200, 5000);
  const sub = renderOsc(sr, 0.12, 'sine', t => 55 - 30 * t, t => expDecay(t, 0.35, 8));

  const total = Math.ceil(sr * dur);
  const sweepP = padTo(sweep, total, Math.floor(sr * 0.02));
  const snapP = padTo(snap, total, Math.floor(sr * 0.02));
  const subP = padTo(sub, total);

  return normalize(mixLayers(
    [thud, sweepP, snapP, subP],
    [1, 0.6, 0.5, 0.9]
  ));
}

// 猛速突進拳 (HIO_HACKER): dash strike
function renderHioHacker(sr: number): Float32Array {
  const dur = 0.2;
  const dash = highPass(renderNoise(sr, 0.08, t => expDecay(t, 0.15, 30)), sr, 3000);
  const impact = renderOsc(sr, 0.06, 'sawtooth', t => 800 - 2000 * t, t => expDecay(t, 0.25, 35));
  const body = renderOsc(sr, 0.08, 'sine', t => 180 - 400 * t, t => expDecay(t, 0.2, 20));
  const total = Math.ceil(sr * dur);
  const dashP = padTo(dash, total);
  const impactP = padTo(impact, total, Math.floor(sr * 0.03));
  return normalize(mixLayers([dashP, impactP, padTo(body, total)], [0.8, 1, 0.7]));
}

// 斩裂拳 (ZANRETSU_KEN): multi-punch rapid hits
function renderZanretsuKen(sr: number): Float32Array {
  const dur = 0.25;
  const hits: Float32Array[] = [];
  for (let i = 0; i < 4; i++) {
    const offset = Math.floor(sr * i * 0.04);
    const hit = bandPass(renderNoise(sr, 0.05, t => expDecay(t, 0.2, 40)), sr, 1500, 6000);
    const padded = padTo(hit, Math.ceil(sr * dur), offset);
    hits.push(padded);
  }
  const body = renderOsc(sr, 0.15, 'sine', t => 120 - 200 * t, t => expDecay(t, 0.3, 12));
  const total = Math.ceil(sr * dur);
  return normalize(mixLayers([...hits, padTo(body, total)], [1, 1, 1, 1, 0.5]));
}

/**
 * Register all Ryo sound renderers with the sampler.
 *
 * @param registerFn - Callback provided by the sampler core;
 *   receives (sampleId, renderFunction) pairs.
 */
export function registerRyoAudio(registerFn: (id: string, renderer: SampleRenderer) => void): void {
  registerFn('ryo_koouken', renderKoouken);
  registerFn('ryo_ko_hou', renderKoHou);
  registerFn('ryo_hien', renderHien);
  registerFn('ryo_haou', renderHaou);
  registerFn('ryo_tsurizao', renderTsurizao);
  registerFn('ryo_orishi', renderOrishi);
  registerFn('ryo_hio_hacker', renderHioHacker);
  registerFn('ryo_zanretsu_ken', renderZanretsuKen);
}
