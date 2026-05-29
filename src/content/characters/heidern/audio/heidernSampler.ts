/**
 * Heidern Audio Sampler — Character-specific sound renderers
 *
 * Move sounds:
 *   heidern_cross_cutter   — クロスカッター (military blade projectile)
 *   heidern_moon_slasher   — ムーンスラッシャー (rising anti-air slash)
 *   heidern_neck_roller    — ネックローリング (neck grab throw)
 *   heidern_stormbringer   — ストームブリンガー (command grab)
 *   heidern_killing_bringer — キリングブリンガー (counter grab)
 *   heidern_leiden_reitter — ライデンライター (spinning kick)
 *   heidern_end_dm         — ハイデルンエンド (DM rush slash)
 */

import {
  renderOsc, renderNoise, lowPass, highPass, bandPass,
  mixLayers, normalize, expDecay, padTo,
} from '../../../../audio/samplerRenderUtils.js';

type SampleRenderer = (sr: number) => Float32Array;

// クロスカッター (CROSS_CUTTER): 军刀斩击波 — 高频刀刃 + 能量波
function renderCrossCutter(sr: number): Float32Array {
  const dur = 0.3;
  const blade = renderOsc(sr, dur, 'sawtooth',
    t => t < 0.04 ? 400 + 6000 * t : 640 - 1000 * (t - 0.04),
    t => t < 0.04 ? 0.1 + t * 2.5 : expDecay(t - 0.04, 0.22, 6));
  const wave = renderOsc(sr, dur * 0.8, 'sine',
    t => 900 - 2000 * t,
    t => expDecay(t, 0.3, 8));
  const slice = highPass(renderNoise(sr, 0.06, t => expDecay(t, 0.12, 30)), sr, 5000);
  const launch = renderOsc(sr, 0.03, 'square', t => 1800 - 30000 * t, t => expDecay(t, 0.1, 40));
  const sub = renderOsc(sr, 0.1, 'sine', t => 140 - 200 * t, t => expDecay(t, 0.25, 7));

  const total = Math.ceil(sr * dur);
  const sliceP = padTo(slice, total, Math.floor(sr * 0.02));
  const subP = padTo(sub, total, Math.floor(sr * 0.02));

  return normalize(mixLayers(
    [blade, wave, sliceP, launch, subP],
    [1, 0.7, 0.5, 0.6, 0.6]
  ));
}

// ムーンスラッシャー (MOON_SLASHER): 月牙斩 — 上升斩 + 军刀能量
function renderMoonSlasher(sr: number): Float32Array {
  const dur = 0.28;
  const slash = renderOsc(sr, 0.08, 'sawtooth',
    t => 300 + 12000 * t,
    t => expDecay(t, 0.15, 20));
  const energy = renderOsc(sr, dur * 0.7, 'sawtooth',
    t => 500 - 800 * t,
    t => expDecay(t, 0.2, 8));
  const snap = renderOsc(sr, 0.03, 'triangle', t => 3000 - 60000 * t, t => expDecay(t, 0.12, 50));
  const sub = renderOsc(sr, 0.1, 'sine', t => 120 - 1000 * t, t => expDecay(t, 0.3, 12));
  const blade = bandPass(renderNoise(sr, 0.1, t => expDecay(t, 0.18, 22)), sr, 1500, 6000);

  const total = Math.ceil(sr * dur);
  const energyP = padTo(energy, total, Math.floor(sr * 0.03));
  const snapP = padTo(snap, total, Math.floor(sr * 0.03));
  const subP = padTo(sub, total, Math.floor(sr * 0.04));
  const bladeP = padTo(blade, total, Math.floor(sr * 0.04));

  return normalize(mixLayers(
    [slash, energyP, snapP, subP, bladeP],
    [1, 0.8, 0.5, 0.7, 0.6]
  ));
}

// ネックローリング (NECK_ROLLER): 首投げ — 抓取 + 旋转摔
function renderNeckRoller(sr: number): Float32Array {
  const dur = 0.35;
  const grab = renderOsc(sr, 0.06, 'square', t => 300 - 5000 * t, t => expDecay(t, 0.15, 30));
  const spin = renderOsc(sr, 0.12, 'sawtooth',
    t => 100 + 4000 * t,
    t => expDecay(t, 0.18, 15));
  const slam = renderOsc(sr, 0.08, 'sine', t => 80 - 600 * t, t => expDecay(t, 0.25, 12));
  const impact = lowPass(renderNoise(sr, 0.1, t => expDecay(t, 0.2, 10)), sr, 2000);
  const sub = renderOsc(sr, 0.15, 'sine', t => 50 - 20 * t, t => expDecay(t, 0.35, 5));

  const total = Math.ceil(sr * dur);
  const spinP = padTo(spin, total, Math.floor(sr * 0.06));
  const slamP = padTo(slam, total, Math.floor(sr * 0.15));
  const impactP = padTo(impact, total, Math.floor(sr * 0.15));
  const subP = padTo(sub, total, Math.floor(sr * 0.1));

  return normalize(mixLayers(
    [grab, spinP, slamP, impactP, subP],
    [0.8, 1, 0.9, 0.7, 1]
  ));
}

// ストームブリンガー (STORMBRINGER): コマンド投げ — 抓取 + 连打 + 能量吸收
function renderStormbringer(sr: number): Float32Array {
  const dur = 0.4;
  const grab = renderOsc(sr, 0.05, 'square', t => 400 - 6000 * t, t => expDecay(t, 0.12, 35));
  const hits: Float32Array[] = [];
  for (let i = 0; i < 4; i++) {
    const offset = Math.floor(sr * (0.06 + i * 0.04));
    const hit = bandPass(renderNoise(sr, 0.03, t => expDecay(t, 0.15, 30)), sr, 1500, 5000);
    hits.push(padTo(hit, Math.ceil(sr * dur), offset));
  }
  const drain = renderOsc(sr, 0.2, 'sawtooth',
    t => 200 - 400 * t,
    t => expDecay(t, 0.25, 8));
  const slam = renderOsc(sr, 0.1, 'sine', t => 80 - 500 * t, t => expDecay(t, 0.3, 10));
  const sub = renderOsc(sr, 0.2, 'sine', t => 50 - 15 * t, t => expDecay(t, 0.4, 4));

  const total = Math.ceil(sr * dur);
  const drainP = padTo(drain, total, Math.floor(sr * 0.15));
  const slamP = padTo(slam, total, Math.floor(sr * 0.25));
  const subP = padTo(sub, total, Math.floor(sr * 0.2));

  return normalize(mixLayers(
    [grab, ...hits, drainP, slamP, subP],
    [0.8, 1, 1, 1, 1, 0.7, 0.9, 1]
  ));
}

// キリングブリンガー (KILLING_BRINGER): 当て身投げ — 捕捉 + 摔
function renderKillingBringer(sr: number): Float32Array {
  const dur = 0.3;
  const catchSound = renderOsc(sr, 0.04, 'square', t => 500 - 8000 * t, t => expDecay(t, 0.1, 35));
  const grab = renderOsc(sr, 0.06, 'sawtooth', t => 200 - 3000 * t, t => expDecay(t, 0.15, 20));
  const slam = renderOsc(sr, 0.1, 'sawtooth', t => 150 - 2000 * t, t => expDecay(t, 0.2, 15));
  const ground = lowPass(renderNoise(sr, 0.1, t => expDecay(t, 0.18, 8)), sr, 2500);
  const sub = renderOsc(sr, 0.12, 'sine', t => 55 - 25 * t, t => expDecay(t, 0.3, 5));

  const total = Math.ceil(sr * dur);
  const grabP = padTo(grab, total, Math.floor(sr * 0.04));
  const slamP = padTo(slam, total, Math.floor(sr * 0.08));
  const groundP = padTo(ground, total, Math.floor(sr * 0.1));
  const subP = padTo(sub, total, Math.floor(sr * 0.08));

  return normalize(mixLayers(
    [catchSound, grabP, slamP, groundP, subP],
    [0.8, 0.9, 1, 0.7, 1]
  ));
}

// ライデンライター (LEIDEN_REITTER): 回転踢り — 旋转踢 + 突进
function renderLeidenReitter(sr: number): Float32Array {
  const dur = 0.25;
  const spin = renderOsc(sr, 0.1, 'sawtooth',
    t => 200 + 6000 * t,
    t => expDecay(t, 0.15, 18));
  const kick = bandPass(renderNoise(sr, 0.06, t => expDecay(t, 0.2, 28)), sr, 1500, 5000);
  const impact = renderOsc(sr, 0.05, 'square', t => 500 - 10000 * t, t => expDecay(t, 0.2, 25));
  const wind = highPass(renderNoise(sr, 0.1, t => expDecay(t, 0.12, 12)), sr, 3000);

  const total = Math.ceil(sr * dur);
  const kickP = padTo(kick, total, Math.floor(sr * 0.03));
  const impactP = padTo(impact, total, Math.floor(sr * 0.05));
  const windP = padTo(wind, total);

  return normalize(mixLayers(
    [spin, kickP, impactP, windP],
    [1, 0.8, 0.7, 0.5]
  ));
}

// ハイデルンエンドDM (HEIDERN_END_DM): 超必杀军刀连斩 — 绿色能量爆发 + 连续斩击
function renderHeidernEndDM(sr: number): Float32Array {
  const dur = 0.5;
  const charge = renderOsc(sr, 0.08, 'sawtooth',
    t => 120 + 6000 * t,
    t => expDecay(t, 0.12, 10));
  const burst = renderOsc(sr, 0.2, 'sawtooth',
    t => t < 0.04 ? 250 + 12000 * t : 730 - 2000 * (t - 0.04),
    t => t < 0.04 ? 0.1 + t * 5 : expDecay(t - 0.04, 0.14, 5));
  const slashes: Float32Array[] = [];
  for (let i = 0; i < 5; i++) {
    const offset = Math.floor(sr * (0.08 + i * 0.06));
    const slash = bandPass(renderNoise(sr, 0.04, t => expDecay(t, 0.15, 25)), sr, 2000, 7000);
    slashes.push(padTo(slash, Math.ceil(sr * dur), offset));
  }
  const sub = renderOsc(sr, 0.25, 'sine', t => 50 - 20 * t, t => expDecay(t, 0.4, 4));
  const debris = lowPass(renderNoise(sr, 0.12, t => expDecay(t, 0.15, 8)), sr, 3000);

  const total = Math.ceil(sr * dur);
  const chargeP = padTo(charge, total);
  const burstP = padTo(burst, total, Math.floor(sr * 0.06));
  const subP = padTo(sub, total, Math.floor(sr * 0.08));
  const debrisP = padTo(debris, total, Math.floor(sr * 0.06));

  return normalize(mixLayers(
    [chargeP, burstP, ...slashes, subP, debrisP],
    [0.8, 1, 1, 1, 1, 1, 1, 1.2, 0.7]
  ));
}

export function registerHeidernAudio(registerFn: (id: string, renderer: SampleRenderer) => void): void {
  registerFn('heidern_cross_cutter', renderCrossCutter);
  registerFn('heidern_moon_slasher', renderMoonSlasher);
  registerFn('heidern_neck_roller', renderNeckRoller);
  registerFn('heidern_stormbringer', renderStormbringer);
  registerFn('heidern_killing_bringer', renderKillingBringer);
  registerFn('heidern_leiden_reitter', renderLeidenReitter);
  registerFn('heidern_end_dm', renderHeidernEndDM);
}
