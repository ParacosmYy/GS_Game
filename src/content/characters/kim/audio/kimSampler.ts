/**
 * Kim Audio Sampler — Character-specific sound renderers
 *
 * Move sounds:
 *   kim_hienzan    — 飛燕斬 (rising crescent kick)
 *   kim_hishou     — 飛翔脚 (leaping kick)
 *   kim_hangetsu   — 半月蹴 (half-moon kick)
 *   kim_haki       — 霸気 (energy push)
 *   kim_houou      — 鳳凰脚 (DM flying phoenix kick)
 */

import {
  renderOsc, renderNoise, lowPass, highPass, bandPass,
  mixLayers, normalize, expDecay, padTo,
} from '../../../../audio/samplerRenderUtils.js';

type SampleRenderer = (sr: number) => Float32Array;

// 飛燕斬 (HIENZAN): 升龙踢 — 上升sweep + 空气切割
function renderHienzan(sr: number): Float32Array {
  const dur = 0.28;
  const sweep = renderOsc(sr, 0.1, 'sawtooth',
    t => 250 + 14000 * t,
    t => expDecay(t, 0.18, 15));
  const slash = highPass(renderNoise(sr, 0.06, t => expDecay(t, 0.2, 35)), sr, 4000);
  const kick = bandPass(renderNoise(sr, 0.05, t => expDecay(t, 0.22, 30)), sr, 2000, 7000);
  const body = renderOsc(sr, 0.1, 'sine', t => 120 - 1000 * t, t => expDecay(t, 0.28, 12));
  const snap = renderOsc(sr, 0.025, 'triangle', t => 3000 - 60000 * t, t => expDecay(t, 0.1, 50));

  const total = Math.ceil(sr * dur);
  const slashP = padTo(slash, total, Math.floor(sr * 0.03));
  const kickP = padTo(kick, total, Math.floor(sr * 0.04));
  const bodyP = padTo(body, total, Math.floor(sr * 0.03));
  const snapP = padTo(snap, total, Math.floor(sr * 0.02));

  return normalize(mixLayers(
    [sweep, slashP, kickP, bodyP, snapP],
    [1, 0.6, 0.8, 0.7, 0.45]
  ));
}

// 飛翔脚 (HISHOU): 跳跃踢 — 下降冲击 + 落地
function renderHishou(sr: number): Float32Array {
  const dur = 0.25;
  const dive = renderOsc(sr, 0.08, 'sawtooth',
    t => 200 + 10000 * t,
    t => expDecay(t, 0.15, 18));
  const impact = renderOsc(sr, 0.08, 'square', t => 500 - 12000 * t, t => expDecay(t, 0.22, 20));
  const slam = lowPass(renderNoise(sr, 0.1, t => expDecay(t, 0.18, 12)), sr, 2500);
  const body = renderOsc(sr, 0.08, 'sine', t => 110 - 900 * t, t => expDecay(t, 0.25, 15));

  const total = Math.ceil(sr * dur);
  const impactP = padTo(impact, total, Math.floor(sr * 0.06));
  const slamP = padTo(slam, total, Math.floor(sr * 0.07));
  const bodyP = padTo(body, total, Math.floor(sr * 0.06));

  return normalize(mixLayers(
    [dive, impactP, slamP, bodyP],
    [0.9, 1, 0.7, 0.8]
  ));
}

// 半月蹴 (HANGETSU): 弧形踢 — 弧线旋转 + 呼啸
function renderHangetsu(sr: number): Float32Array {
  const dur = 0.22;
  const arc = renderOsc(sr, 0.1, 'sawtooth',
    t => 180 + 8000 * t,
    t => expDecay(t, 0.16, 14));
  const whoosh = bandPass(renderNoise(sr, 0.08, t => expDecay(t, 0.15, 20)), sr, 800, 3500);
  const kick = bandPass(renderNoise(sr, 0.04, t => expDecay(t, 0.2, 30)), sr, 1500, 6000);
  const body = renderOsc(sr, 0.07, 'sine', t => 100 - 800 * t, t => expDecay(t, 0.22, 16));

  const total = Math.ceil(sr * dur);
  const whooshP = padTo(whoosh, total, Math.floor(sr * 0.02));
  const kickP = padTo(kick, total, Math.floor(sr * 0.04));
  const bodyP = padTo(body, total, Math.floor(sr * 0.03));

  return normalize(mixLayers(
    [arc, whooshP, kickP, bodyP],
    [1, 0.6, 0.8, 0.7]
  ));
}

// 霸気 (HAKI): 能量推掌 — 短促爆发
function renderHaki(sr: number): Float32Array {
  const dur = 0.18;
  const burst = renderOsc(sr, 0.06, 'sawtooth',
    t => 300 + 15000 * t,
    t => expDecay(t, 0.12, 25));
  const push = lowPass(renderNoise(sr, 0.08, t => expDecay(t, 0.15, 20)), sr, 3000);
  const body = renderOsc(sr, 0.05, 'sine', t => 150 - 1500 * t, t => expDecay(t, 0.2, 18));
  const snap = renderOsc(sr, 0.02, 'square', t => 2000 - 40000 * t, t => expDecay(t, 0.08, 40));

  const total = Math.ceil(sr * dur);
  const pushP = padTo(push, total, Math.floor(sr * 0.02));
  const bodyP = padTo(body, total, Math.floor(sr * 0.02));
  const snapP = padTo(snap, total);

  return normalize(mixLayers(
    [burst, pushP, bodyP, snapP],
    [1, 0.6, 0.7, 0.4]
  ));
}

// 鳳凰脚 (HOUOU): DM 飞踢 — 多层上升+冲击+爆发
function renderHouou(sr: number): Float32Array {
  const dur = 0.45;
  const charge = renderOsc(sr, 0.08, 'sawtooth',
    t => 120 + 8000 * t,
    t => expDecay(t, 0.12, 12));
  const rise = renderOsc(sr, 0.15, 'sawtooth',
    t => 300 + 12000 * t,
    t => expDecay(t, 0.18, 8));
  const impact = renderOsc(sr, 0.1, 'square', t => 500 - 10000 * t, t => expDecay(t, 0.2, 15));
  const sub = renderOsc(sr, 0.2, 'sine', t => 50 - 25 * t, t => expDecay(t, 0.35, 5));
  const flame = bandPass(renderNoise(sr, 0.2, t => expDecay(t, 0.15, 8)), sr, 1000, 4000);
  const sizzle = highPass(renderNoise(sr, 0.12, t => expDecay(t, 0.1, 15)), sr, 5000);

  const total = Math.ceil(sr * dur);
  const riseP = padTo(rise, total, Math.floor(sr * 0.06));
  const impactP = padTo(impact, total, Math.floor(sr * 0.12));
  const subP = padTo(sub, total, Math.floor(sr * 0.1));
  const flameP = padTo(flame, total, Math.floor(sr * 0.08));
  const sizzleP = padTo(sizzle, total, Math.floor(sr * 0.1));

  return normalize(mixLayers(
    [charge, riseP, impactP, subP, flameP, sizzleP],
    [0.8, 1, 1, 1.1, 0.7, 0.5]
  ));
}

export function registerKimAudio(registerFn: (id: string, renderer: SampleRenderer) => void): void {
  registerFn('kim_hienzan', renderHienzan);
  registerFn('kim_hishou', renderHishou);
  registerFn('kim_hangetsu', renderHangetsu);
  registerFn('kim_haki', renderHaki);
  registerFn('kim_houou', renderHouou);
}
