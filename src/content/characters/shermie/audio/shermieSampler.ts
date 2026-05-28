/**
 * Shermie Audio Sampler — Character-specific sound renderers
 *
 * Move sounds:
 *   shermie_shoot        — 旋转踢 (spinning kick)
 *   shermie_carnival     — 狂欢旋转 (multi-hit spinning attack)
 *   shermie_spiral       — 螺旋投 (command grab spiral throw)
 *   shermie_whip         — 鞭踢 (whip kick)
 *   shermie_suplex       — 过肩摔 (command grab slam)
 *   shermie_carnival_dm  — 狂欢旋转DM (multi-hit spinning super)
 */

import {
  renderOsc, renderNoise, lowPass, highPass, bandPass,
  mixLayers, normalize, expDecay, padTo,
} from '../../../../audio/samplerRenderUtils.js';

type SampleRenderer = (sr: number) => Float32Array;

// 旋转踢 (SHERMIE_SHOOT): 旋转踢击 — 旋转风 + 踢击冲击
function renderShermieShoot(sr: number): Float32Array {
  const dur = 0.25;
  const spin = renderOsc(sr, dur, 'sawtooth',
    t => 200 + 6000 * t,
    t => expDecay(t, 0.18, 12));
  const kick = bandPass(renderNoise(sr, 0.06, t => expDecay(t, 0.2, 28)), sr, 1500, 5000);
  const snap = renderOsc(sr, 0.03, 'triangle', t => 2200 - 40000 * t, t => expDecay(t, 0.1, 40));
  const body = renderOsc(sr, 0.08, 'sine', t => 120 - 800 * t, t => expDecay(t, 0.22, 10));

  const total = Math.ceil(sr * dur);
  const kickP = padTo(kick, total, Math.floor(sr * 0.04));
  const snapP = padTo(snap, total, Math.floor(sr * 0.03));
  const bodyP = padTo(body, total, Math.floor(sr * 0.04));

  return normalize(mixLayers(
    [spin, kickP, snapP, bodyP],
    [1, 0.8, 0.5, 0.7]
  ));
}

// 狂欢旋转 (SHERMIE_CARNIVAL): 多段旋转攻击 — 旋转螺旋 + 连续打击
function renderShermieCarnival(sr: number): Float32Array {
  const dur = 0.3;
  const spin = renderOsc(sr, dur, 'sawtooth',
    t => 150 + 8000 * t,
    t => expDecay(t, 0.2, 10));
  const hits: Float32Array[] = [];
  for (let i = 0; i < 3; i++) {
    const offset = Math.floor(sr * i * 0.05);
    const hit = bandPass(renderNoise(sr, 0.04, t => expDecay(t, 0.2, 30)), sr, 1800, 6000);
    hits.push(padTo(hit, Math.ceil(sr * dur), offset));
  }
  const wind = highPass(renderNoise(sr, 0.12, t => expDecay(t, 0.12, 14)), sr, 3000);
  const body = renderOsc(sr, 0.1, 'sine', t => 100 - 600 * t, t => expDecay(t, 0.28, 8));

  const total = Math.ceil(sr * dur);
  const windP = padTo(wind, total);
  const bodyP = padTo(body, total, Math.floor(sr * 0.03));

  return normalize(mixLayers(
    [spin, ...hits, windP, bodyP],
    [0.9, 1, 1, 1, 0.5, 0.7]
  ));
}

// 螺旋投 (SHERMIE_SPIRAL): 近身投技 — 抓取 + 旋转摔
function renderShermieSpiral(sr: number): Float32Array {
  const dur = 0.35;
  const grab = renderOsc(sr, 0.06, 'square', t => 300 - 5000 * t, t => expDecay(t, 0.15, 30));
  const spin = renderOsc(sr, 0.12, 'sawtooth',
    t => 100 + 4000 * t,
    t => expDecay(t, 0.18, 15));
  const slam = renderOsc(sr, 0.08, 'sine', t => 80 - 600 * t, t => expDecay(t, 0.25, 12));
  const impact = lowPass(renderNoise(sr, 0.1, t => expDecay(t, 0.2, 10)), sr, 2000);
  const sub = renderOsc(sr, 0.15, 'sine', t => 50 - 20 * t, t => expDecay(t, 0.35, 5));

  const total = Math.ceil(sr * dur);
  const grabP = padTo(grab, total);
  const spinP = padTo(spin, total, Math.floor(sr * 0.06));
  const slamP = padTo(slam, total, Math.floor(sr * 0.15));
  const impactP = padTo(impact, total, Math.floor(sr * 0.15));
  const subP = padTo(sub, total, Math.floor(sr * 0.1));

  return normalize(mixLayers(
    [grabP, spinP, slamP, impactP, subP],
    [0.8, 1, 0.9, 0.7, 1]
  ));
}

// 鞭踢 (SHERMIE_WHIP): 鞭踢 — 快速甩踢 + 风切
function renderShermieWhip(sr: number): Float32Array {
  const dur = 0.22;
  const sweep = renderOsc(sr, 0.08, 'sawtooth',
    t => 250 + 8000 * t,
    t => expDecay(t, 0.15, 18));
  const whip = bandPass(renderNoise(sr, 0.06, t => expDecay(t, 0.18, 32)), sr, 2000, 7000);
  const crack = renderOsc(sr, 0.03, 'square', t => 2000 - 35000 * t, t => expDecay(t, 0.1, 45));
  const air = highPass(renderNoise(sr, 0.08, t => expDecay(t, 0.12, 20)), sr, 4000);

  const total = Math.ceil(sr * dur);
  const whipP = padTo(whip, total, Math.floor(sr * 0.03));
  const crackP = padTo(crack, total, Math.floor(sr * 0.02));
  const airP = padTo(air, total, Math.floor(sr * 0.04));

  return normalize(mixLayers(
    [sweep, whipP, crackP, airP],
    [1, 0.8, 0.6, 0.5]
  ));
}

// 过肩摔 (SHERMIE_SUPLEX): 近身投技 — 快速捕捉 + 地面砸击
function renderShermieSuplex(sr: number): Float32Array {
  const dur = 0.3;
  const grab = renderOsc(sr, 0.04, 'square', t => 400 - 6000 * t, t => expDecay(t, 0.12, 35));
  const slam = renderOsc(sr, 0.1, 'sawtooth', t => 150 - 2000 * t, t => expDecay(t, 0.2, 15));
  const ground = lowPass(renderNoise(sr, 0.1, t => expDecay(t, 0.18, 8)), sr, 2500);
  const sub = renderOsc(sr, 0.12, 'sine', t => 55 - 25 * t, t => expDecay(t, 0.3, 5));
  const impact = renderOsc(sr, 0.05, 'sine', t => 100 - 600 * t, t => expDecay(t, 0.25, 15));

  const total = Math.ceil(sr * dur);
  const slamP = padTo(slam, total, Math.floor(sr * 0.04));
  const groundP = padTo(ground, total, Math.floor(sr * 0.08));
  const subP = padTo(sub, total, Math.floor(sr * 0.08));
  const impactP = padTo(impact, total, Math.floor(sr * 0.1));

  return normalize(mixLayers(
    [grab, slamP, groundP, subP, impactP],
    [0.7, 1, 0.7, 1, 0.9]
  ));
}

// 狂欢旋转DM (SHERMIE_CARNIVAL_DM): 多段旋转必杀 — 紫色能量爆发 + 连续旋转
function renderShermieCarnivalDM(sr: number): Float32Array {
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

export function registerShermieAudio(registerFn: (id: string, renderer: SampleRenderer) => void): void {
  registerFn('shermie_shoot', renderShermieShoot);
  registerFn('shermie_carnival', renderShermieCarnival);
  registerFn('shermie_spiral', renderShermieSpiral);
  registerFn('shermie_whip', renderShermieWhip);
  registerFn('shermie_suplex', renderShermieSuplex);
  registerFn('shermie_carnival_dm', renderShermieCarnivalDM);
}
