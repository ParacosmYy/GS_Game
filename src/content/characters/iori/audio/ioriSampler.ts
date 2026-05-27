/**
 * Iori Audio Sampler — Character-specific sound renderers
 *
 * Registers Iori's move sound effects into the sampler registry.
 * Each render function produces a Float32Array from raw DSP primitives;
 * the core sampler handles AudioBuffer creation.
 *
 * Iori sound design: dark, purple, claw-like, aggressive.
 * Lower frequencies than Kyo, more sawtooth+noise (vs Kyo's fire tones),
 * sub-bass dark energy rumble, sharp transients simulating claw strikes.
 *
 * Move sounds:
 *   iori_aoihana   — 葵花 (rekka chain punch)
 *   iori_yamibarai — 闇払い (dark projectile)
 *   iori_oniyaki   — 鬼焼き (rising dark flame)
 *   iori_kototsuki — 琴月陰 (dashing dark energy)
 *   iori_kuzukaze  — 屑風 (command grab)
 *   iori_yumeyumi  — 夢弾 (overhead 2-hit)
 *   iori_katanugi  — 邯鄲 (low sweep kick)
 *   iori_yaotome   — 八稚女 (DM dark rush)
 */

import {
  renderOsc, renderNoise, highPass, bandPass,
  mixLayers, normalize, expDecay, padTo,
} from '../../../../audio/samplerRenderUtils.js';

type SampleRenderer = (sr: number) => Float32Array;

// === Iori 必杀技专属音效预渲染 ===

// 葵花 (AOIHANA): rekka连拳 — 锯齿波暗爪 + 噪声撕裂
function renderIoriAoihana(sr: number): Float32Array {
  const dur = 0.25;
  const claw = renderOsc(sr, dur, 'sawtooth', t => 180 - 2000 * t, t => expDecay(t, 0.25, 12));
  const tear = highPass(renderNoise(sr, dur * 0.7, t => expDecay(t, 0.18, 20)), sr, 4000);
  const slash = renderOsc(sr, 0.04, 'triangle', t => 2500 - 60000 * t, t => expDecay(t, 0.2, 45));
  const body = renderOsc(sr, 0.1, 'sine', t => 100 - 1000 * t, t => expDecay(t, 0.3, 15));

  const total = Math.ceil(sr * dur);
  const tearP = padTo(tear, total);
  const slashP = padTo(slash, total, Math.floor(sr * 0.02));
  const bodyP = padTo(body, total, Math.floor(sr * 0.03));

  return normalize(mixLayers(
    [claw, tearP, slashP, bodyP],
    [1, 0.65, 0.55, 0.85]
  ));
}

// 闇払い (YAMIBARAI): 暗色弹 — 锯齿波下扫 + 带通噪声暗核 + 子低音
function renderIoriYamibarai(sr: number): Float32Array {
  const dur = 0.4;
  const projectile = renderOsc(sr, dur, 'sawtooth',
    t => 120 - 150 * t,
    t => t < 0.05 ? t * 8 : expDecay(t - 0.05, 0.22, 5));
  const darkCore = bandPass(renderNoise(sr, dur * 0.7, t => expDecay(t, 0.18, 8)), sr, 800, 3000);
  const sub = renderOsc(sr, dur * 0.8, 'sine', t => 40 - 15 * t, t => t < 0.04 ? t * 5 : expDecay(t - 0.04, 0.3, 4));
  const launch = renderOsc(sr, 0.05, 'square', t => 1600 - 35000 * t, t => expDecay(t, 0.15, 40));
  const hum = renderOsc(sr, dur * 0.85, 'sine',
    t => 130 - 200 * t,
    t => t < 0.04 ? t * 5 : expDecay(t - 0.04, 0.18, 5));

  const total = Math.ceil(sr * dur);
  const darkCoreP = padTo(darkCore, total);
  const subP = padTo(sub, total);
  const launchP = padTo(launch, total);
  const humP = padTo(hum, total);

  return normalize(mixLayers(
    [projectile, darkCoreP, subP, launchP, humP],
    [1, 0.7, 0.9, 0.5, 0.6]
  ));
}

// 鬼焼き (ONIYAKI): 升龙暗焰 — 正弦上升扫频 + 噪声爆发 + 低频闷响
function renderIoriOniyaki(sr: number): Float32Array {
  const dur = 0.3;
  const sweep = renderOsc(sr, 0.15, 'sine',
    t => 120 + 2533 * t,
    t => expDecay(t, 0.22, 10));
  const burst = highPass(renderNoise(sr, 0.1, t => expDecay(t, 0.25, 22)), sr, 2500);
  const thud = renderOsc(sr, 0.12, 'sine', t => 90 - 900 * t, t => expDecay(t, 0.32, 10));
  const crack = renderOsc(sr, 0.035, 'triangle', t => 3000 - 70000 * t, t => expDecay(t, 0.15, 50));
  const sub = renderOsc(sr, 0.18, 'sine', t => 45 - 20 * t, t => expDecay(t, 0.35, 6));

  const total = Math.ceil(sr * dur);
  const burstP = padTo(burst, total);
  const crackP = padTo(crack, total, Math.floor(sr * 0.03));
  const subP = padTo(sub, total, Math.floor(sr * 0.03));

  return normalize(mixLayers(
    [sweep, burstP, thud, crackP, subP],
    [1, 0.6, 0.9, 0.5, 0.85]
  ));
}

// 琴月陰 (KOTOTSUKI): 突进暗能量 — 锯齿波冲刺 + 噪声扫频 + 子低音
function renderIoriKototsuki(sr: number): Float32Array {
  const dur = 0.35;
  const rush = renderOsc(sr, dur, 'sawtooth',
    t => t < 0.06 ? 200 + 3000 * t : 380 - 900 * (t - 0.06),
    t => t < 0.06 ? t * 6 : expDecay(t - 0.06, 0.22, 6));
  const noise = bandPass(renderNoise(sr, dur * 0.6, t => expDecay(t, 0.18, 10)), sr, 600, 3500);
  const sub = renderOsc(sr, dur * 0.8, 'sine', t => 30 - 10 * t, t => t < 0.04 ? t * 4 : expDecay(t - 0.04, 0.3, 3));
  const impact = renderOsc(sr, 0.05, 'square', t => 1200 - 25000 * t, t => expDecay(t, 0.2, 35));

  const total = Math.ceil(sr * dur);
  const noiseP = padTo(noise, total);
  const subP = padTo(sub, total);
  const impactP = padTo(impact, total, Math.floor(sr * 0.06));

  return normalize(mixLayers(
    [rush, noiseP, subP, impactP],
    [1, 0.7, 1.0, 0.65]
  ));
}

// 屑風 (KUZUKAZE): 指令投 — 方波闷击 + 噪声碎裂 + 子低音
function renderIoriKuzukaze(sr: number): Float32Array {
  const dur = 0.2;
  const thud = renderOsc(sr, 0.1, 'square', t => 100 - 1200 * t, t => expDecay(t, 0.25, 18));
  const crack = highPass(renderNoise(sr, 0.08, t => expDecay(t, 0.2, 25)), sr, 3000);
  const sub = renderOsc(sr, 0.12, 'sine', t => 60 - 30 * t, t => expDecay(t, 0.35, 8));
  const grab = bandPass(renderNoise(sr, 0.06, t => expDecay(t, 0.2, 30)), sr, 800, 2500);

  const total = Math.ceil(sr * dur);
  const crackP = padTo(crack, total);
  const subP = padTo(sub, total);
  const grabP = padTo(grab, total, Math.floor(sr * 0.02));

  return normalize(mixLayers(
    [thud, crackP, subP, grabP],
    [1, 0.6, 0.85, 0.55]
  ));
}

// 夢弾 (YUMEYUMI): overhead 2连击 — 两段带通噪声爆发
function renderIoriYumeyumi(sr: number): Float32Array {
  const dur = 0.2;
  const hit1 = bandPass(renderNoise(sr, 0.04, t => expDecay(t, 0.25, 40)), sr, 1500, 6000);
  const hit2 = bandPass(renderNoise(sr, 0.04, t => expDecay(t, 0.25, 40)), sr, 1800, 7000);
  const body = renderOsc(sr, 0.1, 'sine', t => 110 - 1200 * t, t => expDecay(t, 0.28, 16));
  const darkSnap = renderOsc(sr, 0.03, 'triangle', t => 2200 - 50000 * t, t => expDecay(t, 0.15, 50));

  const total = Math.ceil(sr * dur);
  const hit1P = padTo(hit1, total);
  const hit2P = padTo(hit2, total, Math.floor(sr * 0.06));
  const bodyP = padTo(body, total, Math.floor(sr * 0.02));
  const darkSnapP = padTo(darkSnap, total);

  return normalize(mixLayers(
    [hit1P, hit2P, bodyP, darkSnapP],
    [1, 0.9, 0.75, 0.5]
  ));
}

// 邯鄲 (KATANUGI): 下段扫踢 — 高通噪声扫频 + 正弦下扫
function renderIoriKatanugi(sr: number): Float32Array {
  const dur = 0.2;
  const swoosh = highPass(renderNoise(sr, dur * 0.7, t => expDecay(t, 0.15, 22)), sr, 3000);
  const sweep = renderOsc(sr, dur, 'sine', t => 200 - 500 * t, t => expDecay(t, 0.2, 12));
  const body = renderOsc(sr, 0.08, 'sine', t => 90 - 800 * t, t => expDecay(t, 0.25, 18));
  const snap = renderOsc(sr, 0.025, 'triangle', t => 1800 - 40000 * t, t => expDecay(t, 0.12, 55));

  const total = Math.ceil(sr * dur);
  const swooshP = padTo(swoosh, total);
  const bodyP = padTo(body, total, Math.floor(sr * 0.03));
  const snapP = padTo(snap, total, Math.floor(sr * 0.02));

  return normalize(mixLayers(
    [swooshP, sweep, bodyP, snapP],
    [0.8, 1, 0.75, 0.5]
  ));
}

// 八稚女 (YAOTOME): DM暗色连突 — 多层暗能量叠加
function renderIoriYaotome(sr: number): Float32Array {
  const dur = 0.5;
  const bass = renderOsc(sr, dur, 'sawtooth',
    t => 100 - 100 * t,
    t => t < 0.06 ? t * 6 : expDecay(t - 0.06, 0.3, 3.5));
  const mid = renderOsc(sr, dur * 0.8, 'square',
    t => 200 - 150 * t,
    t => t < 0.05 ? t * 5 : expDecay(t - 0.05, 0.22, 4));
  const crackle = highPass(renderNoise(sr, dur * 0.6, t => expDecay(t, 0.2, 6)), sr, 4000);
  const sub = renderOsc(sr, 0.35, 'sine', t => 30 - 15 * t, t => expDecay(t, 0.4, 3));
  const burst = renderOsc(sr, 0.06, 'square', t => 1800 - 30000 * t, t => expDecay(t, 0.18, 30));
  const darkWave = bandPass(renderNoise(sr, dur * 0.5, t => expDecay(t, 0.2, 5)), sr, 300, 2500);
  const metal = renderOsc(sr, 0.08, 'triangle', t => 2000 - 25000 * t, t => expDecay(t, 0.1, 22));

  const total = Math.ceil(sr * dur);
  const midP = padTo(mid, total);
  const crackleP = padTo(crackle, total);
  const subP = padTo(sub, total);
  const burstP = padTo(burst, total);
  const darkWaveP = padTo(darkWave, total);
  const metalP = padTo(metal, total, Math.floor(sr * 0.04));

  return normalize(mixLayers(
    [bass, midP, crackleP, subP, burstP, darkWaveP, metalP],
    [1.1, 0.75, 0.55, 1.1, 0.6, 0.7, 0.35]
  ));
}

/**
 * Register all Iori sound renderers with the sampler.
 *
 * @param registerFn - Callback provided by the sampler core;
 *   receives (sampleId, renderFunction) pairs.
 */
export function registerIoriAudio(registerFn: (id: string, renderer: SampleRenderer) => void): void {
  registerFn('iori_aoihana', renderIoriAoihana);
  registerFn('iori_yamibarai', renderIoriYamibarai);
  registerFn('iori_oniyaki', renderIoriOniyaki);
  registerFn('iori_kototsuki', renderIoriKototsuki);
  registerFn('iori_kuzukaze', renderIoriKuzukaze);
  registerFn('iori_yumeyumi', renderIoriYumeyumi);
  registerFn('iori_katanugi', renderIoriKatanugi);
  registerFn('iori_yaotome', renderIoriYaotome);
}
