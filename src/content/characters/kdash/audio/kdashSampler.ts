/**
 * K' Audio Sampler — Character-specific sound renderers
 *
 * Move sounds:
 *   kdash_eins        — 火焰飞行道具 (fire projectile)
 *   kdash_crow        — 对空上勾拳 (rising uppercut)
 *   kdash_minute      — 空中踢击 (overhead kick)
 *   kdash_narrow      — 低段突进踢 (low kick)
 *   kdash_one_inch    — 短距离爆发 (close-range burst)
 *   kdash_chain_shot  — 连续打击DM (chain super)
 */

import {
  renderOsc, renderNoise, lowPass, highPass, bandPass,
  mixLayers, normalize, expDecay, padTo,
} from '../../../../audio/samplerRenderUtils.js';

type SampleRenderer = (sr: number) => Float32Array;

// 火焰飞行道具 (KDASH_EINS): Eins Trigger — 火焰发射 + 飞行弹
function renderKdashEins(sr: number): Float32Array {
  const dur = 0.28;
  const ignition = renderOsc(sr, 0.06, 'sawtooth',
    t => 300 + 6000 * t,
    t => expDecay(t, 0.15, 30));
  const fireball = renderOsc(sr, 0.12, 'square',
    t => 400 - 2000 * t,
    t => expDecay(t, 0.2, 12));
  const whoosh = highPass(renderNoise(sr, 0.08, t => expDecay(t, 0.12, 25)), sr, 3000);
  const sub = renderOsc(sr, 0.1, 'sine', t => 80 - 300 * t, t => expDecay(t, 0.3, 8));
  const crackle = bandPass(renderNoise(sr, 0.15, t => expDecay(t, 0.15, 10)), sr, 1000, 4000);

  const total = Math.ceil(sr * dur);
  const fireballP = padTo(fireball, total, Math.floor(sr * 0.04));
  const whooshP = padTo(whoosh, total, Math.floor(sr * 0.03));
  const subP = padTo(sub, total, Math.floor(sr * 0.06));
  const crackleP = padTo(crackle, total, Math.floor(sr * 0.05));

  return normalize(mixLayers(
    [ignition, fireballP, whooshP, subP, crackleP],
    [0.9, 1, 0.6, 0.8, 0.5]
  ));
}

// 对空上勾拳 (KDASH_CROW): Crow Bites — 上升火焰拳
function renderKdashCrow(sr: number): Float32Array {
  const dur = 0.3;
  const rise = renderOsc(sr, 0.1, 'sawtooth',
    t => 150 + 8000 * t,
    t => expDecay(t, 0.18, 15));
  const impact = bandPass(renderNoise(sr, 0.06, t => expDecay(t, 0.2, 35)), sr, 2000, 7000);
  const fire = renderOsc(sr, 0.08, 'square', t => 500 - 5000 * t, t => expDecay(t, 0.15, 20));
  const sub = renderOsc(sr, 0.15, 'sine', t => 60 - 30 * t, t => expDecay(t, 0.35, 5));

  const total = Math.ceil(sr * dur);
  const impactP = padTo(impact, total, Math.floor(sr * 0.04));
  const fireP = padTo(fire, total, Math.floor(sr * 0.03));
  const subP = padTo(sub, total, Math.floor(sr * 0.05));

  return normalize(mixLayers(
    [rise, impactP, fireP, subP],
    [1, 0.9, 0.7, 1]
  ));
}

// 空中踢击 (KDASH_MINUTE): Minute Spike — 踢击 + 空中风切
function renderKdashMinute(sr: number): Float32Array {
  const dur = 0.22;
  const kick = renderOsc(sr, 0.08, 'sawtooth',
    t => 200 + 6000 * t,
    t => expDecay(t, 0.15, 20));
  const air = highPass(renderNoise(sr, 0.06, t => expDecay(t, 0.15, 28)), sr, 4000);
  const snap = renderOsc(sr, 0.03, 'triangle', t => 1800 - 30000 * t, t => expDecay(t, 0.1, 40));

  const total = Math.ceil(sr * dur);
  const airP = padTo(air, total, Math.floor(sr * 0.02));
  const snapP = padTo(snap, total, Math.floor(sr * 0.03));

  return normalize(mixLayers(
    [kick, airP, snapP],
    [1, 0.7, 0.6]
  ));
}

// 低段突进踢 (KDASH_NARROW): Narrow Spike — 低段突进 + 地面扫
function renderKdashNarrow(sr: number): Float32Array {
  const dur = 0.24;
  const sweep = renderOsc(sr, 0.08, 'sawtooth',
    t => 180 + 5000 * t,
    t => expDecay(t, 0.15, 18));
  const ground = lowPass(renderNoise(sr, 0.08, t => expDecay(t, 0.2, 10)), sr, 2000);
  const sub = renderOsc(sr, 0.1, 'sine', t => 70 - 400 * t, t => expDecay(t, 0.28, 8));

  const total = Math.ceil(sr * dur);
  const groundP = padTo(ground, total, Math.floor(sr * 0.03));
  const subP = padTo(sub, total, Math.floor(sr * 0.04));

  return normalize(mixLayers(
    [sweep, groundP, subP],
    [1, 0.8, 0.9]
  ));
}

// 短距离爆发 (KDASH_ONE_INCH): One Inch — 近距爆发冲击
function renderKdashOneInch(sr: number): Float32Array {
  const dur = 0.2;
  const burst = renderOsc(sr, 0.04, 'square', t => 500 - 8000 * t, t => expDecay(t, 0.1, 40));
  const impact = bandPass(renderNoise(sr, 0.06, t => expDecay(t, 0.18, 30)), sr, 1500, 5000);
  const fire = renderOsc(sr, 0.06, 'sawtooth', t => 300 - 4000 * t, t => expDecay(t, 0.15, 15));
  const sub = renderOsc(sr, 0.1, 'sine', t => 90 - 500 * t, t => expDecay(t, 0.25, 10));

  const total = Math.ceil(sr * dur);
  const impactP = padTo(impact, total, Math.floor(sr * 0.02));
  const fireP = padTo(fire, total, Math.floor(sr * 0.02));
  const subP = padTo(sub, total, Math.floor(sr * 0.04));

  return normalize(mixLayers(
    [burst, impactP, fireP, subP],
    [0.8, 1, 0.6, 1]
  ));
}

// 连续打击DM (KDASH_CHAIN_SHOT): Chain Shot DM — 火焰爆发 + 连续打击
function renderKdashChainShotDM(sr: number): Float32Array {
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
  const fire = renderOsc(sr, 0.15, 'square', t => 300 - 2000 * t, t => expDecay(t, 0.2, 8));
  const rumble = renderOsc(sr, 0.2, 'sine', t => 60 - 20 * t, t => expDecay(t, 0.3, 5));

  const total = Math.ceil(sr * dur);
  const chargeP = padTo(charge, total);
  const eruptionP = padTo(eruption, total, Math.floor(sr * 0.08));
  const subP = padTo(sub, total, Math.floor(sr * 0.08));
  const fireP = padTo(fire, total, Math.floor(sr * 0.08));
  const rumbleP = padTo(rumble, total, Math.floor(sr * 0.06));

  return normalize(mixLayers(
    [chargeP, eruptionP, subP, ...spin, fireP, rumbleP],
    [0.8, 1, 1.2, 1, 1, 1, 1, 1, 0.7, 0.9]
  ));
}

export function registerKdashAudio(registerFn: (id: string, renderer: SampleRenderer) => void): void {
  registerFn('kdash_eins', renderKdashEins);
  registerFn('kdash_crow', renderKdashCrow);
  registerFn('kdash_minute', renderKdashMinute);
  registerFn('kdash_narrow', renderKdashNarrow);
  registerFn('kdash_one_inch', renderKdashOneInch);
  registerFn('kdash_chain_shot', renderKdashChainShotDM);
}
