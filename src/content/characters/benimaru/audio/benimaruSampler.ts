/**
 * Benimaru Audio Sampler — Character-specific sound renderers
 *
 * Move sounds:
 *   benimaru_raijinken            — 雷韧拳 (lightning anti-air punch)
 *   benimaru_iai_geri             — 居合蹴り (lightning kick)
 *   benimaru_shinkuu_katategoma   — 真空片手駒 (vacuum palm spin)
 *   benimaru_collider             — 紅丸コレダー (command grab)
 *   benimaru_super_inazuma_kick   — スーパー稲妻キック (rising lightning kick)
 *   benimaru_raikouken            — 雷光拳 (DM lightning fist)
 */

import {
  renderOsc, renderNoise, lowPass, highPass, bandPass,
  mixLayers, normalize, expDecay, padTo,
} from '../../../../audio/samplerRenderUtils.js';

type SampleRenderer = (sr: number) => Float32Array;

// 雷韧拳 (RAIJINKEN): 电光上升拳 — 电击高频 + 上升sweep
function renderRaijinken(sr: number): Float32Array {
  const dur = 0.30;
  const electric = renderOsc(sr, dur, 'sawtooth',
    t => t < 0.04 ? 300 + 12000 * t : 780 - 2000 * (t - 0.04),
    t => t < 0.04 ? 0.1 + t * 3 : expDecay(t - 0.04, 0.24, 8));
  const crackle = highPass(renderNoise(sr, 0.10, t => expDecay(t, 0.15, 30)), sr, 6000);
  const arc = renderOsc(sr, 0.08, 'square', t => 2000 + 8000 * Math.sin(t * 80), t => expDecay(t, 0.2, 20));
  const sub = renderOsc(sr, 0.15, 'sine', t => 80 - 60 * t, t => expDecay(t, 0.3, 5));
  const impact = renderOsc(sr, 0.05, 'sine', t => 150 - 2000 * t, t => expDecay(t, 0.15, 25));

  const total = Math.ceil(sr * dur);
  const crackleP = padTo(crackle, total, Math.floor(sr * 0.02));
  const arcP = padTo(arc, total, Math.floor(sr * 0.01));
  const subP = padTo(sub, total);
  const impactP = padTo(impact, total, Math.floor(sr * 0.03));

  return normalize(mixLayers(
    [electric, crackleP, arcP, subP, impactP],
    [1, 0.7, 0.6, 0.8, 0.9]
  ));
}

// 居合蹴り (IAI_GERI): 闪电踢 — 快速sweep + 电弧
function renderIaiGeri(sr: number): Float32Array {
  const dur = 0.22;
  const sweep = renderOsc(sr, 0.08, 'sawtooth',
    t => 250 + 10000 * t,
    t => expDecay(t, 0.15, 18));
  const kick = bandPass(renderNoise(sr, 0.05, t => expDecay(t, 0.2, 35)), sr, 2000, 8000);
  const spark = renderOsc(sr, 0.04, 'square', t => 3000 - 40000 * t, t => expDecay(t, 0.12, 40));
  const body = renderOsc(sr, 0.08, 'sine', t => 140 - 1000 * t, t => expDecay(t, 0.2, 12));

  const total = Math.ceil(sr * dur);
  const kickP = padTo(kick, total, Math.floor(sr * 0.03));
  const sparkP = padTo(spark, total, Math.floor(sr * 0.02));
  const bodyP = padTo(body, total, Math.floor(sr * 0.03));

  return normalize(mixLayers(
    [sweep, kickP, sparkP, bodyP],
    [1, 0.8, 0.5, 0.7]
  ));
}

// 真空片手駒 (SHINKUU_KATATEGOMA): 旋转掌 — 旋转sweep + 多段打击
function renderShinkuuKatategoma(sr: number): Float32Array {
  const dur = 0.28;
  const spin = renderOsc(sr, dur, 'sawtooth',
    t => 180 + 8000 * t,
    t => expDecay(t, 0.18, 10));
  const hits: Float32Array[] = [];
  for (let i = 0; i < 3; i++) {
    const offset = Math.floor(sr * i * 0.05);
    const hit = bandPass(renderNoise(sr, 0.03, t => expDecay(t, 0.2, 35)), sr, 2500, 7000);
    hits.push(padTo(hit, Math.ceil(sr * dur), offset));
  }
  const vacuum = lowPass(renderNoise(sr, 0.12, t => expDecay(t, 0.12, 12)), sr, 2000);
  const sub = renderOsc(sr, 0.1, 'sine', t => 90 - 600 * t, t => expDecay(t, 0.25, 8));

  const total = Math.ceil(sr * dur);
  const vacuumP = padTo(vacuum, total);
  const subP = padTo(sub, total, Math.floor(sr * 0.04));

  return normalize(mixLayers(
    [spin, ...hits, vacuumP, subP],
    [0.9, 1, 1, 1, 0.5, 0.6]
  ));
}

// 紅丸コレダー (COLLIDER): 指令投 — 重抓取 + 电击
function renderCollider(sr: number): Float32Array {
  const dur = 0.32;
  const grab = renderOsc(sr, 0.08, 'sawtooth',
    t => 120 + 4000 * t,
    t => expDecay(t, 0.15, 12));
  const shock = highPass(renderNoise(sr, 0.15, t => expDecay(t, 0.12, 15)), sr, 4000);
  const slam = renderOsc(sr, 0.06, 'square', t => 200 - 5000 * t, t => expDecay(t, 0.2, 25));
  const sub = renderOsc(sr, 0.2, 'sine', t => 55 - 30 * t, t => expDecay(t, 0.35, 5));
  const crackle = renderOsc(sr, 0.10, 'sawtooth', t => 2000 + 6000 * Math.sin(t * 60), t => expDecay(t, 0.18, 10));

  const total = Math.ceil(sr * dur);
  const shockP = padTo(shock, total, Math.floor(sr * 0.04));
  const slamP = padTo(slam, total, Math.floor(sr * 0.06));
  const subP = padTo(sub, total, Math.floor(sr * 0.06));
  const crackleP = padTo(crackle, total, Math.floor(sr * 0.08));

  return normalize(mixLayers(
    [grab, shockP, slamP, subP, crackleP],
    [1, 0.7, 1, 1, 0.5]
  ));
}

// スーパー稲妻キック (SUPER_INAZUMA_KICK): 上升闪电踢 — 上升 + 电击
function renderSuperInazumaKick(sr: number): Float32Array {
  const dur = 0.26;
  const rise = renderOsc(sr, 0.08, 'sawtooth',
    t => 200 + 9000 * t,
    t => expDecay(t, 0.18, 20));
  const lightning = renderOsc(sr, 0.06, 'square', t => 2500 + 5000 * Math.sin(t * 100), t => expDecay(t, 0.15, 25));
  const crackle = highPass(renderNoise(sr, 0.08, t => expDecay(t, 0.15, 30)), sr, 5000);
  const sub = renderOsc(sr, 0.12, 'sine', t => 70 - 50 * t, t => expDecay(t, 0.3, 6));

  const total = Math.ceil(sr * dur);
  const crackleP = padTo(crackle, total, Math.floor(sr * 0.02));
  const subP = padTo(sub, total, Math.floor(sr * 0.04));

  return normalize(mixLayers(
    [rise, lightning, crackleP, subP],
    [1, 0.7, 0.6, 0.8]
  ));
}

// 雷光拳 (RAIKOUKEN): DM — 全力电光爆发
function renderRaikouken(sr: number): Float32Array {
  const dur = 0.50;
  const charge = renderOsc(sr, 0.08, 'sawtooth',
    t => 100 + 8000 * t,
    t => expDecay(t, 0.12, 10));
  const burst = renderOsc(sr, 0.18, 'sawtooth',
    t => t < 0.04 ? 200 + 15000 * t : 800 - 2500 * (t - 0.04),
    t => t < 0.04 ? 0.1 + t * 5 : expDecay(t - 0.04, 0.12, 5));
  const sub = renderOsc(sr, 0.25, 'sine', t => 40 - 15 * t, t => expDecay(t, 0.4, 4));
  const electric = highPass(renderNoise(sr, 0.18, t => expDecay(t, 0.12, 10)), sr, 5000);
  const crackle = renderOsc(sr, 0.12, 'square', t => 3000 + 8000 * Math.sin(t * 50), t => expDecay(t, 0.15, 8));
  const rumble = renderOsc(sr, 0.20, 'sine', t => 55 - 20 * t, t => expDecay(t, 0.3, 5));

  const total = Math.ceil(sr * dur);
  const chargeP = padTo(charge, total);
  const burstP = padTo(burst, total, Math.floor(sr * 0.06));
  const subP = padTo(sub, total, Math.floor(sr * 0.06));
  const electricP = padTo(electric, total, Math.floor(sr * 0.06));
  const crackleP = padTo(crackle, total, Math.floor(sr * 0.06));
  const rumbleP = padTo(rumble, total, Math.floor(sr * 0.04));

  return normalize(mixLayers(
    [chargeP, burstP, subP, electricP, crackleP, rumbleP],
    [0.8, 1, 1.2, 0.7, 0.6, 0.9]
  ));
}

export function registerBenimaruAudio(registerFn: (id: string, renderer: SampleRenderer) => void): void {
  registerFn('benimaru_raijinken', renderRaijinken);
  registerFn('benimaru_iai_geri', renderIaiGeri);
  registerFn('benimaru_shinkuu_katategoma', renderShinkuuKatategoma);
  registerFn('benimaru_collider', renderCollider);
  registerFn('benimaru_super_inazuma_kick', renderSuperInazumaKick);
  registerFn('benimaru_raikouken', renderRaikouken);
}
