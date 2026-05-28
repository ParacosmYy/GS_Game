/**
 * Athena Audio Sampler — Character-specific sound renderers
 *
 * Move sounds:
 *   athena_psycho_ball      — サイコボール (psychic projectile)
 *   athena_psycho_sword     — サイコソード (psychic rising slash)
 *   athena_phoenix_arrow    — フェニックスアロー (aerial dive)
 *   athena_psycho_teleport  — サイコテレポート (teleport)
 *   athena_shining_crystal  — シャイニングクリスタルビット (DM)
 */

import {
  renderOsc, renderNoise, lowPass, highPass, bandPass,
  mixLayers, normalize, expDecay, padTo,
} from '../../../../audio/samplerRenderUtils.js';

type SampleRenderer = (sr: number) => Float32Array;

// サイコボール (PSYCHO_BALL): サイコ弾 — 高频能量球 + 精神波
function renderPsychoBall(sr: number): Float32Array {
  const dur = 0.3;
  const psychic = renderOsc(sr, dur, 'sawtooth',
    t => t < 0.04 ? 300 + 6000 * t : 540 - 1200 * (t - 0.04),
    t => t < 0.04 ? 0.1 + t * 2.5 : expDecay(t - 0.04, 0.24, 6));
  const glow = renderOsc(sr, dur * 0.8, 'sine',
    t => 800 - 2000 * t,
    t => expDecay(t, 0.3, 8));
  const hum = renderOsc(sr, 0.15, 'sine', t => 180 - 300 * t, t => expDecay(t, 0.25, 7));
  const crackle = highPass(renderNoise(sr, 0.08, t => expDecay(t, 0.15, 25)), sr, 5000);
  const launch = renderOsc(sr, 0.03, 'square', t => 1400 - 28000 * t, t => expDecay(t, 0.1, 40));

  const total = Math.ceil(sr * dur);
  const glowP = padTo(glow, total);
  const humP = padTo(hum, total, Math.floor(sr * 0.02));
  const crackleP = padTo(crackle, total, Math.floor(sr * 0.02));
  const launchP = padTo(launch, total);

  return normalize(mixLayers(
    [psychic, glowP, humP, crackleP, launchP],
    [1, 0.7, 0.6, 0.4, 0.5]
  ));
}

// サイコソード (PSYCHO_SWORD): 精神剑 — 上升斩 + 能量爆发
function renderPsychoSword(sr: number): Float32Array {
  const dur = 0.28;
  const slash = renderOsc(sr, 0.08, 'sawtooth',
    t => 300 + 12000 * t,
    t => expDecay(t, 0.15, 20));
  const psychic = renderOsc(sr, dur * 0.7, 'sawtooth',
    t => 500 - 800 * t,
    t => expDecay(t, 0.2, 8));
  const energy = bandPass(renderNoise(sr, 0.1, t => expDecay(t, 0.18, 22)), sr, 1500, 6000);
  const snap = renderOsc(sr, 0.03, 'triangle', t => 3000 - 60000 * t, t => expDecay(t, 0.12, 50));
  const sub = renderOsc(sr, 0.1, 'sine', t => 120 - 1000 * t, t => expDecay(t, 0.3, 12));

  const total = Math.ceil(sr * dur);
  const psychicP = padTo(psychic, total, Math.floor(sr * 0.03));
  const energyP = padTo(energy, total, Math.floor(sr * 0.04));
  const snapP = padTo(snap, total, Math.floor(sr * 0.03));
  const subP = padTo(sub, total, Math.floor(sr * 0.04));

  return normalize(mixLayers(
    [slash, psychicP, energyP, snapP, subP],
    [1, 0.8, 0.6, 0.5, 0.7]
  ));
}

// フェニックスアロー (PHOENIX_ARROW): 凤凰箭 — 空中突进 + 俯冲
function renderPhoenixArrow(sr: number): Float32Array {
  const dur = 0.25;
  const dive = renderOsc(sr, 0.1, 'sawtooth',
    t => 400 + 8000 * t,
    t => expDecay(t, 0.15, 18));
  const feather = bandPass(renderNoise(sr, 0.08, t => expDecay(t, 0.18, 28)), sr, 2000, 7000);
  const impact = renderOsc(sr, 0.06, 'square', t => 500 - 12000 * t, t => expDecay(t, 0.2, 25));
  const wind = highPass(renderNoise(sr, 0.12, t => expDecay(t, 0.12, 12)), sr, 3000);
  const body = renderOsc(sr, 0.08, 'sine', t => 140 - 1200 * t, t => expDecay(t, 0.25, 10));

  const total = Math.ceil(sr * dur);
  const featherP = padTo(feather, total, Math.floor(sr * 0.03));
  const impactP = padTo(impact, total, Math.floor(sr * 0.05));
  const windP = padTo(wind, total);
  const bodyP = padTo(body, total, Math.floor(sr * 0.04));

  return normalize(mixLayers(
    [dive, featherP, impactP, windP, bodyP],
    [1, 0.7, 0.8, 0.5, 0.6]
  ));
}

// サイコテレポート (PSYCHO_TELEPORT): 精神传送 — 消失/出现音
function renderPsychoTeleport(sr: number): Float32Array {
  const dur = 0.2;
  const vanish = renderOsc(sr, 0.08, 'sine',
    t => 600 + 10000 * t,
    t => expDecay(t, 0.1, 30));
  const warp = renderOsc(sr, dur * 0.6, 'triangle',
    t => 1200 - 3000 * t,
    t => expDecay(t, 0.15, 15));
  const sparkle = highPass(renderNoise(sr, 0.06, t => expDecay(t, 0.1, 35)), sr, 6000);
  const sub = renderOsc(sr, 0.1, 'sine', t => 80 - 200 * t, t => expDecay(t, 0.25, 6));

  const total = Math.ceil(sr * dur);
  const warpP = padTo(warp, total, Math.floor(sr * 0.04));
  const sparkleP = padTo(sparkle, total, Math.floor(sr * 0.02));
  const subP = padTo(sub, total, Math.floor(sr * 0.04));

  return normalize(mixLayers(
    [vanish, warpP, sparkleP, subP],
    [0.8, 1, 0.5, 0.7]
  ));
}

// シャイニングクリスタルビット (SHINING_CRYSTAL_BIT): DM — 精神结晶爆发
function renderShiningCrystal(sr: number): Float32Array {
  const dur = 0.5;
  const charge = renderOsc(sr, 0.1, 'sawtooth',
    t => 150 + 8000 * t,
    t => expDecay(t, 0.12, 10));
  const burst = renderOsc(sr, 0.2, 'sawtooth',
    t => t < 0.04 ? 300 + 15000 * t : 900 - 2500 * (t - 0.04),
    t => t < 0.04 ? 0.1 + t * 5 : expDecay(t - 0.04, 0.14, 5));
  const crystal = renderOsc(sr, 0.15, 'triangle',
    t => 1200 - 2000 * t,
    t => expDecay(t, 0.2, 8));
  const sub = renderOsc(sr, 0.3, 'sine', t => 50 - 25 * t, t => expDecay(t, 0.4, 4));
  const sparkle = highPass(renderNoise(sr, 0.15, t => expDecay(t, 0.12, 15)), sr, 6000);
  const shatter = lowPass(renderNoise(sr, 0.12, t => expDecay(t, 0.18, 10)), sr, 3000);

  const total = Math.ceil(sr * dur);
  const chargeP = padTo(charge, total);
  const burstP = padTo(burst, total, Math.floor(sr * 0.08));
  const crystalP = padTo(crystal, total, Math.floor(sr * 0.06));
  const subP = padTo(sub, total, Math.floor(sr * 0.08));
  const sparkleP = padTo(sparkle, total, Math.floor(sr * 0.08));
  const shatterP = padTo(shatter, total, Math.floor(sr * 0.06));

  return normalize(mixLayers(
    [chargeP, burstP, crystalP, subP, sparkleP, shatterP],
    [0.8, 1, 0.7, 1.2, 0.5, 0.6]
  ));
}

export function registerAthenaAudio(registerFn: (id: string, renderer: SampleRenderer) => void): void {
  registerFn('athena_psycho_ball', renderPsychoBall);
  registerFn('athena_psycho_sword', renderPsychoSword);
  registerFn('athena_phoenix_arrow', renderPhoenixArrow);
  registerFn('athena_psycho_teleport', renderPsychoTeleport);
  registerFn('athena_shining_crystal', renderShiningCrystal);
}
