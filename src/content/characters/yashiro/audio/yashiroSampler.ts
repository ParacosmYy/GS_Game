/**
 * Yashiro Audio Sampler — Character-specific sound renderers
 *
 * Move sounds:
 *   yashiro_upper_du       — 勾拳突进 (hook punch rush)
 *   yashiro_niraai         — 中段砸击 (palm strike)
 *   yashiro_musatsu        — 突进攻击 (jet counter)
 *   yashiro_sledgehammer   — 对空勾拳 (anti-air uppercut)
 *   yashiro_million_bash   — 连续重拳DM (multi-hit punch super)
 */

import {
  renderOsc, renderNoise, lowPass, highPass, bandPass,
  mixLayers, normalize, expDecay, padTo,
} from '../../../../audio/samplerRenderUtils.js';

type SampleRenderer = (sr: number) => Float32Array;

// 勾拳突进 (YASHIRO_UPPER_DU): 勾拳突进 — 重拳风 + 冲击
function renderYashiroUpperDu(sr: number): Float32Array {
  const dur = 0.22;
  const punch = renderOsc(sr, dur, 'sawtooth',
    t => 300 + 5000 * t,
    t => expDecay(t, 0.15, 14));
  const impact = bandPass(renderNoise(sr, 0.06, t => expDecay(t, 0.18, 30)), sr, 1200, 5000);
  const body = renderOsc(sr, 0.08, 'sine', t => 140 - 900 * t, t => expDecay(t, 0.2, 10));
  const snap = renderOsc(sr, 0.03, 'triangle', t => 2500 - 30000 * t, t => expDecay(t, 0.1, 40));

  const total = Math.ceil(sr * dur);
  const impactP = padTo(impact, total, Math.floor(sr * 0.03));
  const bodyP = padTo(body, total, Math.floor(sr * 0.04));
  const snapP = padTo(snap, total, Math.floor(sr * 0.02));

  return normalize(mixLayers(
    [punch, impactP, bodyP, snapP],
    [1, 0.8, 0.7, 0.5]
  ));
}

// 中段砸击 (YASHIRO_NIRAAI): 掌击 — 重砸 + 震动
function renderYashiroNiraai(sr: number): Float32Array {
  const dur = 0.28;
  const slam = renderOsc(sr, 0.1, 'sawtooth',
    t => 200 + 6000 * t,
    t => expDecay(t, 0.18, 12));
  const impact = lowPass(renderNoise(sr, 0.08, t => expDecay(t, 0.15, 20)), sr, 2500);
  const sub = renderOsc(sr, 0.12, 'sine', t => 60 - 30 * t, t => expDecay(t, 0.3, 6));
  const crack = renderOsc(sr, 0.04, 'square', t => 1800 - 25000 * t, t => expDecay(t, 0.1, 35));

  const total = Math.ceil(sr * dur);
  const impactP = padTo(impact, total, Math.floor(sr * 0.03));
  const subP = padTo(sub, total, Math.floor(sr * 0.08));
  const crackP = padTo(crack, total, Math.floor(sr * 0.04));

  return normalize(mixLayers(
    [slam, impactP, subP, crackP],
    [1, 0.7, 1, 0.6]
  ));
}

// 突进攻击 (YASHIRO_MUSATSU): 突进 — 风切 + 撞击
function renderYashiroMusatsu(sr: number): Float32Array {
  const dur = 0.3;
  const dash = renderOsc(sr, 0.12, 'sawtooth',
    t => 150 + 7000 * t,
    t => expDecay(t, 0.16, 10));
  const wind = highPass(renderNoise(sr, 0.1, t => expDecay(t, 0.12, 16)), sr, 3000);
  const hit = bandPass(renderNoise(sr, 0.06, t => expDecay(t, 0.2, 28)), sr, 1500, 5500);
  const sub = renderOsc(sr, 0.1, 'sine', t => 100 - 500 * t, t => expDecay(t, 0.25, 8));
  const body = renderOsc(sr, 0.06, 'triangle', t => 2000 - 20000 * t, t => expDecay(t, 0.12, 35));

  const total = Math.ceil(sr * dur);
  const windP = padTo(wind, total, Math.floor(sr * 0.02));
  const hitP = padTo(hit, total, Math.floor(sr * 0.1));
  const subP = padTo(sub, total, Math.floor(sr * 0.1));
  const bodyP = padTo(body, total, Math.floor(sr * 0.12));

  return normalize(mixLayers(
    [dash, windP, hitP, subP, bodyP],
    [0.9, 0.6, 1, 0.9, 0.5]
  ));
}

// 对空勾拳 (YASHIRO_SLEDGEHAMMER): 对空 — 升龙拳式上升
function renderYashiroSledgehammer(sr: number): Float32Array {
  const dur = 0.25;
  const rise = renderOsc(sr, dur, 'sawtooth',
    t => 200 + 8000 * t,
    t => expDecay(t, 0.18, 12));
  const hit = bandPass(renderNoise(sr, 0.05, t => expDecay(t, 0.15, 35)), sr, 1800, 6000);
  const sub = renderOsc(sr, 0.1, 'sine', t => 80 - 600 * t, t => expDecay(t, 0.22, 10));
  const crack = renderOsc(sr, 0.04, 'triangle', t => 3000 - 40000 * t, t => expDecay(t, 0.08, 45));

  const total = Math.ceil(sr * dur);
  const hitP = padTo(hit, total, Math.floor(sr * 0.04));
  const subP = padTo(sub, total, Math.floor(sr * 0.05));
  const crackP = padTo(crack, total, Math.floor(sr * 0.04));

  return normalize(mixLayers(
    [rise, hitP, subP, crackP],
    [1, 0.8, 0.9, 0.6]
  ));
}

// 连续重拳DM (MILLION_BASH_STREAM): DM连续重拳 — 紫色能量爆发 + 连续打击
function renderYashiroMillionBash(sr: number): Float32Array {
  const dur = 0.5;
  const charge = renderOsc(sr, 0.08, 'sawtooth',
    t => 80 + 5000 * t,
    t => expDecay(t, 0.12, 10));
  const eruption = renderOsc(sr, 0.2, 'sawtooth',
    t => t < 0.05 ? 150 + 10000 * t : 650 - 2500 * (t - 0.05),
    t => t < 0.05 ? 0.1 + t * 4 : expDecay(t - 0.05, 0.15, 6));
  const sub = renderOsc(sr, 0.25, 'sine', t => 45 - 18 * t, t => expDecay(t, 0.4, 4));
  const punches: Float32Array[] = [];
  for (let i = 0; i < 6; i++) {
    const offset = Math.floor(sr * (0.08 + i * 0.05));
    const hit = bandPass(renderNoise(sr, 0.04, t => expDecay(t, 0.18, 28)), sr, 1500, 6000);
    punches.push(padTo(hit, Math.ceil(sr * dur), offset));
  }
  const debris = lowPass(renderNoise(sr, 0.12, t => expDecay(t, 0.15, 8)), sr, 3000);
  const rumble = renderOsc(sr, 0.2, 'sine', t => 60 - 20 * t, t => expDecay(t, 0.3, 5));

  const total = Math.ceil(sr * dur);
  const chargeP = padTo(charge, total);
  const eruptionP = padTo(eruption, total, Math.floor(sr * 0.08));
  const subP = padTo(sub, total, Math.floor(sr * 0.08));
  const debrisP = padTo(debris, total, Math.floor(sr * 0.08));
  const rumbleP = padTo(rumble, total, Math.floor(sr * 0.06));

  return normalize(mixLayers(
    [chargeP, eruptionP, subP, ...punches, debrisP, rumbleP],
    [0.8, 1, 1.2, 1, 1, 1, 1, 1, 1, 0.7, 0.9]
  ));
}

export function registerYashiroAudio(registerFn: (id: string, renderer: SampleRenderer) => void): void {
  registerFn('yashiro_upper_du', renderYashiroUpperDu);
  registerFn('yashiro_niraai', renderYashiroNiraai);
  registerFn('yashiro_musatsu', renderYashiroMusatsu);
  registerFn('yashiro_sledgehammer', renderYashiroSledgehammer);
  registerFn('yashiro_million_bash', renderYashiroMillionBash);
}
