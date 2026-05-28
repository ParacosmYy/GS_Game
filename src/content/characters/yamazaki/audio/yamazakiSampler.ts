/**
 * Yamazaki Audio Sampler — Character-specific sound renderers
 *
 * Move sounds:
 *   yamazaki_snake_arm    — 蛇使い (snake arm whip lash)
 *   yamazaki_sandstorm    — 爆弾拳 (explosive sand burst)
 *   yamazaki_bai_ga_se    — 倍返し (counter sweep)
 *   yamazaki_drill        — ドリル (multi-hit drill rush)
 *   yamazaki_guillotine   — ギロチン DM (guillotine death slash)
 */

import {
  renderOsc, renderNoise, lowPass, highPass, bandPass,
  mixLayers, normalize, expDecay, padTo,
} from '../../../../audio/samplerRenderUtils.js';

type SampleRenderer = (sr: number) => Float32Array;

// 蛇使い (SNAKE_ARM): 蛇臂鞭击 — 中高频鞭打 + 能量伸展
function renderSnakeArm(sr: number): Float32Array {
  const dur = 0.3;
  const whip = renderOsc(sr, 0.08, 'sawtooth',
    t => 300 + 15000 * t,
    t => expDecay(t, 0.2, 20));
  const lash = bandPass(renderNoise(sr, 0.06, t => expDecay(t, 0.18, 35)), sr, 2000, 8000);
  const stretch = renderOsc(sr, 0.15, 'sawtooth',
    t => t < 0.03 ? 120 + 6000 * t : 300 - 1200 * (t - 0.03),
    t => t < 0.03 ? 0.1 + t * 3 : expDecay(t - 0.03, 0.12, 7));
  const snap = renderOsc(sr, 0.04, 'square', t => 1000 - 20000 * t, t => expDecay(t, 0.12, 40));
  const body = renderOsc(sr, 0.1, 'sine', t => 100 - 600 * t, t => expDecay(t, 0.25, 10));

  const total = Math.ceil(sr * dur);
  const lashP = padTo(lash, total, Math.floor(sr * 0.04));
  const snapP = padTo(snap, total, Math.floor(sr * 0.06));
  const bodyP = padTo(body, total, Math.floor(sr * 0.04));

  return normalize(mixLayers(
    [whip, lashP, stretch, snapP, bodyP],
    [1, 0.8, 0.9, 0.6, 0.7]
  ));
}

// 爆弾拳 (SANDSTORM): 爆发冲击 — 地面爆发 + 碎裂
function renderSandstorm(sr: number): Float32Array {
  const dur = 0.35;
  const burst = renderOsc(sr, 0.12, 'sawtooth',
    t => t < 0.04 ? 150 + 8000 * t : 470 - 1500 * (t - 0.04),
    t => t < 0.04 ? 0.1 + t * 4 : expDecay(t - 0.04, 0.2, 8));
  const impact = renderOsc(sr, 0.08, 'square', t => 500 - 12000 * t, t => expDecay(t, 0.25, 22));
  const debris = lowPass(renderNoise(sr, 0.15, t => expDecay(t, 0.18, 10)), sr, 2500);
  const sub = renderOsc(sr, 0.2, 'sine', t => 55 - 25 * t, t => expDecay(t, 0.35, 5));
  const rumble = renderOsc(sr, 0.15, 'sine', t => 65 - 20 * t, t => expDecay(t, 0.3, 6));

  const total = Math.ceil(sr * dur);
  const debrisP = padTo(debris, total, Math.floor(sr * 0.06));
  const subP = padTo(sub, total, Math.floor(sr * 0.08));
  const rumbleP = padTo(rumble, total, Math.floor(sr * 0.06));

  return normalize(mixLayers(
    [burst, impact, debrisP, subP, rumbleP],
    [1, 0.9, 0.7, 1, 0.8]
  ));
}

// 倍返し (BAI_GA_SE): 反击扫腿 — 扫地 + 低频冲击
function renderBaiGaSe(sr: number): Float32Array {
  const dur = 0.22;
  const sweep = renderOsc(sr, 0.08, 'sawtooth',
    t => 200 + 8000 * t,
    t => expDecay(t, 0.2, 18));
  const ground = lowPass(renderNoise(sr, 0.1, t => expDecay(t, 0.15, 12)), sr, 2000);
  const kick = bandPass(renderNoise(sr, 0.05, t => expDecay(t, 0.2, 30)), sr, 1500, 5000);
  const body = renderOsc(sr, 0.08, 'sine', t => 90 - 600 * t, t => expDecay(t, 0.25, 12));

  const total = Math.ceil(sr * dur);
  const groundP = padTo(ground, total, Math.floor(sr * 0.03));
  const kickP = padTo(kick, total, Math.floor(sr * 0.04));
  const bodyP = padTo(body, total, Math.floor(sr * 0.03));

  return normalize(mixLayers(
    [sweep, groundP, kickP, bodyP],
    [1, 0.7, 0.8, 0.6]
  ));
}

// ドリル (DRILL): 多段钻击 — 连续打击 + 旋转感
function renderDrill(sr: number): Float32Array {
  const dur = 0.4;
  const spin = renderOsc(sr, dur, 'sawtooth',
    t => 180 + 8000 * t,
    t => expDecay(t, 0.2, 7));
  const hits: Float32Array[] = [];
  for (let i = 0; i < 4; i++) {
    const offset = Math.floor(sr * i * 0.06);
    const hit = bandPass(renderNoise(sr, 0.04, t => expDecay(t, 0.18, 35)), sr, 2000, 7000);
    hits.push(padTo(hit, Math.ceil(sr * dur), offset));
  }
  const grind = lowPass(renderNoise(sr, 0.2, t => expDecay(t, 0.15, 10)), sr, 3000);
  const sub = renderOsc(sr, 0.25, 'sine', t => 50 - 20 * t, t => expDecay(t, 0.35, 5));

  const total = Math.ceil(sr * dur);
  const grindP = padTo(grind, total);
  const subP = padTo(sub, total, Math.floor(sr * 0.06));

  return normalize(mixLayers(
    [spin, ...hits, grindP, subP],
    [0.9, 1, 1, 1, 1, 0.6, 0.8]
  ));
}

// ギロチン (GUILLOTINE): DM — 断头台级重击 + 暗能量爆发
function renderGuillotine(sr: number): Float32Array {
  const dur = 0.5;
  const charge = renderOsc(sr, 0.1, 'sawtooth',
    t => 80 + 5000 * t,
    t => expDecay(t, 0.15, 10));
  const slash = renderOsc(sr, 0.15, 'sawtooth',
    t => t < 0.04 ? 200 + 10000 * t : 600 - 2000 * (t - 0.04),
    t => t < 0.04 ? 0.1 + t * 5 : expDecay(t - 0.04, 0.12, 7));
  const dark = renderOsc(sr, 0.2, 'square',
    t => 60 + 200 * Math.sin(t * 30),
    t => expDecay(t, 0.3, 5));
  const sub = renderOsc(sr, 0.3, 'sine', t => 45 - 20 * t, t => expDecay(t, 0.4, 4));
  const debris = lowPass(renderNoise(sr, 0.2, t => expDecay(t, 0.18, 8)), sr, 3000);
  const impact = renderOsc(sr, 0.06, 'square', t => 400 - 12000 * t, t => expDecay(t, 0.25, 25));

  const total = Math.ceil(sr * dur);
  const chargeP = padTo(charge, total);
  const slashP = padTo(slash, total, Math.floor(sr * 0.08));
  const darkP = padTo(dark, total, Math.floor(sr * 0.08));
  const subP = padTo(sub, total, Math.floor(sr * 0.08));
  const debrisP = padTo(debris, total, Math.floor(sr * 0.08));
  const impactP = padTo(impact, total, Math.floor(sr * 0.1));

  return normalize(mixLayers(
    [chargeP, slashP, darkP, subP, debrisP, impactP],
    [0.8, 1, 0.7, 1.2, 0.6, 1]
  ));
}

export function registerYamazakiAudio(registerFn: (id: string, renderer: SampleRenderer) => void): void {
  registerFn('yamazaki_snake_arm', renderSnakeArm);
  registerFn('yamazaki_sandstorm', renderSandstorm);
  registerFn('yamazaki_bai_ga_se', renderBaiGaSe);
  registerFn('yamazaki_drill', renderDrill);
  registerFn('yamazaki_guillotine', renderGuillotine);
}
