/**
 * Mai Audio Sampler — Character-specific sound renderers
 *
 * Move sounds:
 *   mai_kachousen      — 花蝶扇 (fan projectile)
 *   mai_ryuuenbu       — 龍炎舞 (flame fan swipe)
 *   mai_ryuenjin       — 飛翔龍炎陣 (flame upper)
 *   mai_shinobibachi   — 必殺忍蜂 (overhead strike)
 *   mai_haka_otoshi_dm — 蜂巢落としDM (super fan dance)
 */

import {
  renderOsc, renderNoise, lowPass, highPass, bandPass,
  mixLayers, normalize, expDecay, padTo,
} from '../../../../audio/samplerRenderUtils.js';

type SampleRenderer = (sr: number) => Float32Array;

// 花蝶扇 (MAI_KA_CHO_SEN): 扇形飞行道具 — 投扇 + 飞行风切
function renderMaiKachousen(sr: number): Float32Array {
  const dur = 0.25;
  const throwFan = renderOsc(sr, 0.08, 'sawtooth',
    t => 300 + 4000 * t,
    t => expDecay(t, 0.15, 18));
  const wind = highPass(renderNoise(sr, 0.12, t => expDecay(t, 0.12, 14)), sr, 3000);
  const spin = renderOsc(sr, 0.15, 'triangle',
    t => 800 - 2000 * t,
    t => expDecay(t, 0.2, 10));
  const body = renderOsc(sr, 0.1, 'sine', t => 110 - 500 * t, t => expDecay(t, 0.25, 8));

  const total = Math.ceil(sr * dur);
  const throwP = padTo(throwFan, total);
  const windP = padTo(wind, total, Math.floor(sr * 0.03));
  const spinP = padTo(spin, total, Math.floor(sr * 0.05));
  const bodyP = padTo(body, total, Math.floor(sr * 0.04));

  return normalize(mixLayers(
    [throwP, windP, spinP, bodyP],
    [1, 0.7, 0.9, 0.8]
  ));
}

// 龍炎舞 (MAI_RYU_EN_BU): 火焰扇击 — 火焰爆发 + 扇击冲击
function renderMaiRyuuenbu(sr: number): Float32Array {
  const dur = 0.3;
  const flame = renderOsc(sr, 0.12, 'sawtooth',
    t => 150 + 6000 * t,
    t => expDecay(t, 0.15, 14));
  const impact = bandPass(renderNoise(sr, 0.06, t => expDecay(t, 0.18, 28)), sr, 1500, 5000);
  const crackle = renderOsc(sr, 0.04, 'square', t => 2200 - 30000 * t, t => expDecay(t, 0.1, 35));
  const body = renderOsc(sr, 0.1, 'sine', t => 100 - 500 * t, t => expDecay(t, 0.28, 8));
  const sub = renderOsc(sr, 0.15, 'sine', t => 55 - 20 * t, t => expDecay(t, 0.35, 5));

  const total = Math.ceil(sr * dur);
  const impactP = padTo(impact, total, Math.floor(sr * 0.03));
  const crackleP = padTo(crackle, total, Math.floor(sr * 0.02));
  const bodyP = padTo(body, total, Math.floor(sr * 0.05));
  const subP = padTo(sub, total, Math.floor(sr * 0.1));

  return normalize(mixLayers(
    [flame, impactP, crackleP, bodyP, subP],
    [0.9, 1, 0.6, 0.8, 1]
  ));
}

// 飛翔龍炎陣 (MAI_HISHO_RYU_EN_JIN): 火焰升龙 — 上升 + 火焰爆发
function renderMaiRyuenjin(sr: number): Float32Array {
  const dur = 0.35;
  const launch = renderOsc(sr, 0.08, 'sawtooth',
    t => 100 + 5000 * t,
    t => expDecay(t, 0.12, 16));
  const flame = renderOsc(sr, 0.15, 'sawtooth',
    t => 200 + 8000 * t,
    t => expDecay(t, 0.18, 12));
  const burst = bandPass(renderNoise(sr, 0.08, t => expDecay(t, 0.2, 22)), sr, 2000, 6000);
  const sub = renderOsc(sr, 0.2, 'sine', t => 50 - 20 * t, t => expDecay(t, 0.35, 5));
  const air = highPass(renderNoise(sr, 0.1, t => expDecay(t, 0.15, 16)), sr, 4000);

  const total = Math.ceil(sr * dur);
  const launchP = padTo(launch, total);
  const flameP = padTo(flame, total, Math.floor(sr * 0.08));
  const burstP = padTo(burst, total, Math.floor(sr * 0.08));
  const subP = padTo(sub, total, Math.floor(sr * 0.06));
  const airP = padTo(air, total, Math.floor(sr * 0.1));

  return normalize(mixLayers(
    [launchP, flameP, burstP, subP, airP],
    [0.8, 1, 0.9, 1, 0.5]
  ));
}

// 必殺忍蜂 (MAI_HISSATSU_SHINOBIBACHI): 忍蜂打击 — 快速打击 + 风切
function renderMaiShinobibachi(sr: number): Float32Array {
  const dur = 0.22;
  const sweep = renderOsc(sr, 0.08, 'sawtooth',
    t => 250 + 6000 * t,
    t => expDecay(t, 0.15, 18));
  const hit = bandPass(renderNoise(sr, 0.05, t => expDecay(t, 0.18, 30)), sr, 2000, 7000);
  const crack = renderOsc(sr, 0.03, 'square', t => 2000 - 30000 * t, t => expDecay(t, 0.1, 40));
  const air = highPass(renderNoise(sr, 0.06, t => expDecay(t, 0.12, 20)), sr, 3500);

  const total = Math.ceil(sr * dur);
  const hitP = padTo(hit, total, Math.floor(sr * 0.03));
  const crackP = padTo(crack, total, Math.floor(sr * 0.02));
  const airP = padTo(air, total, Math.floor(sr * 0.04));

  return normalize(mixLayers(
    [sweep, hitP, crackP, airP],
    [1, 0.8, 0.6, 0.5]
  ));
}

// 蜂巢落としDM (DM_HAKA_OTOSHI): 超必杀扇舞 — 粉红能量爆发 + 连续扇击
function renderMaiHakaOtoshiDM(sr: number): Float32Array {
  const dur = 0.5;
  const charge = renderOsc(sr, 0.08, 'sawtooth',
    t => 80 + 5000 * t,
    t => expDecay(t, 0.12, 10));
  const eruption = renderOsc(sr, 0.2, 'sawtooth',
    t => t < 0.05 ? 150 + 10000 * t : 650 - 2500 * (t - 0.05),
    t => t < 0.05 ? 0.1 + t * 4 : expDecay(t - 0.05, 0.15, 6));
  const sub = renderOsc(sr, 0.25, 'sine', t => 45 - 18 * t, t => expDecay(t, 0.4, 4));
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

export function registerMaiAudio(registerFn: (id: string, renderer: SampleRenderer) => void): void {
  registerFn('mai_kachousen', renderMaiKachousen);
  registerFn('mai_ryuuenbu', renderMaiRyuuenbu);
  registerFn('mai_ryuenjin', renderMaiRyuenjin);
  registerFn('mai_shinobibachi', renderMaiShinobibachi);
  registerFn('mai_haka_otoshi_dm', renderMaiHakaOtoshiDM);
}
