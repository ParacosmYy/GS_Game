/**
 * Vice Audio Sampler — Character-specific sound renderers
 *
 * Move sounds:
 *   vice_outrage        — アウトレイジ (rush punch)
 *   vice_black_end      — ブラックエンド (grab slam)
 *   vice_mayhem         — メイヘム (low rush)
 *   vice_gore_fest      — ゴアフェスト (command grab)
 *   vice_withering      — ウィザリングサーフェス (DM multi-hit)
 *   vice_negative_gain  — ネガティブゲイン (DM grab)
 */

import {
  renderOsc, renderNoise, lowPass, highPass, bandPass,
  mixLayers, normalize, expDecay, padTo,
} from '../../../../audio/samplerRenderUtils.js';

type SampleRenderer = (sr: number) => Float32Array;

// アウトレイジ (OUTRAGE): 突进拳击 — 低频冲击 + 黑暗能量爆发
function renderOutrage(sr: number): Float32Array {
  const dur = 0.28;
  const energy = renderOsc(sr, dur, 'sawtooth',
    t => t < 0.04 ? 180 + 6000 * t : 420 - 1200 * (t - 0.04),
    t => t < 0.04 ? 0.08 + t * 2.5 : expDecay(t - 0.04, 0.22, 7));
  const impact = renderOsc(sr, 0.08, 'square', t => 500 - 12000 * t, t => expDecay(t, 0.2, 30));
  const dark = bandPass(renderNoise(sr, 0.12, t => expDecay(t, 0.15, 18)), sr, 800, 3500);
  const sub = renderOsc(sr, 0.15, 'sine', t => 65 - 30 * t, t => expDecay(t, 0.3, 6));
  const crackle = highPass(renderNoise(sr, 0.06, t => expDecay(t, 0.12, 30)), sr, 5000);

  const total = Math.ceil(sr * dur);
  const impactP = padTo(impact, total, Math.floor(sr * 0.05));
  const darkP = padTo(dark, total, Math.floor(sr * 0.03));
  const subP = padTo(sub, total);
  const crackleP = padTo(crackle, total, Math.floor(sr * 0.04));

  return normalize(mixLayers(
    [energy, impactP, darkP, subP, crackleP],
    [1, 0.9, 0.7, 0.8, 0.5]
  ));
}

// ブラックエンド (BLACK_END): 投技摔投 — 重型着陆 + 黑暗波
function renderBlackEnd(sr: number): Float32Array {
  const dur = 0.32;
  const grab = renderOsc(sr, 0.06, 'sawtooth',
    t => 200 + 8000 * t,
    t => expDecay(t, 0.15, 20));
  const slam = renderOsc(sr, 0.12, 'square', t => 300 - 8000 * t, t => expDecay(t, 0.25, 15));
  const ground = lowPass(renderNoise(sr, 0.15, t => expDecay(t, 0.2, 10)), sr, 2500);
  const sub = renderOsc(sr, 0.2, 'sine', t => 50 - 25 * t, t => expDecay(t, 0.35, 5));
  const dark = bandPass(renderNoise(sr, 0.1, t => expDecay(t, 0.18, 12)), sr, 600, 3000);

  const total = Math.ceil(sr * dur);
  const slamP = padTo(slam, total, Math.floor(sr * 0.08));
  const groundP = padTo(ground, total, Math.floor(sr * 0.1));
  const subP = padTo(sub, total, Math.floor(sr * 0.08));
  const darkP = padTo(dark, total, Math.floor(sr * 0.06));

  return normalize(mixLayers(
    [grab, slamP, groundP, subP, darkP],
    [0.8, 1, 0.7, 1, 0.6]
  ));
}

// メイヘム (MAYHEM): 下段突进 — 低扫 + 地面摩擦
function renderMayhem(sr: number): Float32Array {
  const dur = 0.25;
  const sweep = renderOsc(sr, 0.08, 'sawtooth',
    t => 250 + 10000 * t,
    t => expDecay(t, 0.15, 18));
  const kick = bandPass(renderNoise(sr, 0.06, t => expDecay(t, 0.2, 28)), sr, 1200, 5000);
  const dust = lowPass(renderNoise(sr, 0.12, t => expDecay(t, 0.18, 10)), sr, 2000);
  const body = renderOsc(sr, 0.1, 'sine', t => 110 - 900 * t, t => expDecay(t, 0.25, 12));

  const total = Math.ceil(sr * dur);
  const kickP = padTo(kick, total, Math.floor(sr * 0.04));
  const dustP = padTo(dust, total, Math.floor(sr * 0.03));
  const bodyP = padTo(body, total, Math.floor(sr * 0.05));

  return normalize(mixLayers(
    [sweep, kickP, dustP, bodyP],
    [1, 0.8, 0.6, 0.7]
  ));
}

// ゴアフェスト (GORE_FEST): 指令投 — 残忍抓取 + 重摔
function renderGoreFest(sr: number): Float32Array {
  const dur = 0.38;
  const lunge = renderOsc(sr, 0.06, 'sawtooth',
    t => 150 + 6000 * t,
    t => expDecay(t, 0.12, 25));
  const grab = renderOsc(sr, 0.08, 'square', t => 400 + 4000 * t, t => expDecay(t, 0.15, 20));
  const slam = renderOsc(sr, 0.1, 'square', t => 350 - 9000 * t, t => expDecay(t, 0.2, 18));
  const sub = renderOsc(sr, 0.2, 'sine', t => 45 - 20 * t, t => expDecay(t, 0.35, 5));
  const impact = lowPass(renderNoise(sr, 0.12, t => expDecay(t, 0.2, 8)), sr, 2500);
  const dark = bandPass(renderNoise(sr, 0.1, t => expDecay(t, 0.15, 15)), sr, 800, 3500);

  const total = Math.ceil(sr * dur);
  const grabP = padTo(grab, total, Math.floor(sr * 0.04));
  const slamP = padTo(slam, total, Math.floor(sr * 0.12));
  const subP = padTo(sub, total, Math.floor(sr * 0.1));
  const impactP = padTo(impact, total, Math.floor(sr * 0.14));
  const darkP = padTo(dark, total, Math.floor(sr * 0.08));

  return normalize(mixLayers(
    [lunge, grabP, slamP, subP, impactP, darkP],
    [0.8, 0.9, 1, 1.1, 0.7, 0.6]
  ));
}

// ウィザリングサーフェス (WITHERING_SURFACE): DM — 多段黑暗能量冲击
function renderWitheringSurface(sr: number): Float32Array {
  const dur = 0.5;
  const charge = renderOsc(sr, 0.1, 'sawtooth',
    t => 80 + 5000 * t,
    t => expDecay(t, 0.12, 12));
  const eruption = renderOsc(sr, 0.2, 'sawtooth',
    t => t < 0.05 ? 180 + 10000 * t : 680 - 2500 * (t - 0.05),
    t => t < 0.05 ? 0.1 + t * 3.5 : expDecay(t - 0.05, 0.15, 6));
  const sub = renderOsc(sr, 0.3, 'sine', t => 42 - 18 * t, t => expDecay(t, 0.4, 4));
  const dark = bandPass(renderNoise(sr, 0.18, t => expDecay(t, 0.15, 10)), sr, 800, 4000);
  const rumble = renderOsc(sr, 0.25, 'sine', t => 55 - 18 * t, t => expDecay(t, 0.28, 5));

  const total = Math.ceil(sr * dur);
  const chargeP = padTo(charge, total);
  const eruptionP = padTo(eruption, total, Math.floor(sr * 0.08));
  const subP = padTo(sub, total, Math.floor(sr * 0.08));
  const darkP = padTo(dark, total, Math.floor(sr * 0.08));
  const rumbleP = padTo(rumble, total, Math.floor(sr * 0.06));

  return normalize(mixLayers(
    [chargeP, eruptionP, subP, darkP, rumbleP],
    [0.8, 1, 1.2, 0.7, 0.9]
  ));
}

// ネガティブゲイン (NEGATIVE_GAIN): DM grab — 大蛇能量爆发
function renderNegativeGain(sr: number): Float32Array {
  const dur = 0.55;
  const lunge = renderOsc(sr, 0.06, 'sawtooth',
    t => 120 + 8000 * t,
    t => expDecay(t, 0.1, 20));
  const grab = renderOsc(sr, 0.08, 'square', t => 500 + 6000 * t, t => expDecay(t, 0.12, 18));
  const slam = renderOsc(sr, 0.15, 'sawtooth',
    t => t < 0.04 ? 200 + 12000 * t : 680 - 3000 * (t - 0.04),
    t => t < 0.04 ? 0.1 + t * 3 : expDecay(t - 0.04, 0.12, 7));
  const sub = renderOsc(sr, 0.35, 'sine', t => 38 - 15 * t, t => expDecay(t, 0.4, 4));
  const explosion = lowPass(renderNoise(sr, 0.2, t => expDecay(t, 0.15, 8)), sr, 3000);
  const dark = bandPass(renderNoise(sr, 0.15, t => expDecay(t, 0.12, 14)), sr, 700, 3500);
  const rumble = renderOsc(sr, 0.3, 'sine', t => 50 - 15 * t, t => expDecay(t, 0.35, 5));

  const total = Math.ceil(sr * dur);
  const grabP = padTo(grab, total, Math.floor(sr * 0.04));
  const slamP = padTo(slam, total, Math.floor(sr * 0.1));
  const subP = padTo(sub, total, Math.floor(sr * 0.1));
  const explosionP = padTo(explosion, total, Math.floor(sr * 0.1));
  const darkP = padTo(dark, total, Math.floor(sr * 0.08));
  const rumbleP = padTo(rumble, total, Math.floor(sr * 0.06));

  return normalize(mixLayers(
    [lunge, grabP, slamP, subP, explosionP, darkP, rumbleP],
    [0.7, 0.9, 1, 1.2, 0.8, 0.6, 0.9]
  ));
}

export function registerViceAudio(registerFn: (id: string, renderer: SampleRenderer) => void): void {
  registerFn('vice_outrage', renderOutrage);
  registerFn('vice_black_end', renderBlackEnd);
  registerFn('vice_mayhem', renderMayhem);
  registerFn('vice_gore_fest', renderGoreFest);
  registerFn('vice_withering', renderWitheringSurface);
  registerFn('vice_negative_gain', renderNegativeGain);
}
