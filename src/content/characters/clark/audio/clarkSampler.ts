/**
 * Clark Audio Sampler — Character-specific sound renderers
 *
 * Move sounds:
 *   clark_argentine      — スーパーアルゼンチンバックブリーカー (command grab)
 *   clark_napalm         — ナパームストレッチ (anti-air grab)
 *   clark_flash_elbow    — フラッシュエルボー (follow-up elbow)
 *   clark_mount_tackle   — マウントタックル (command grab tackle)
 *   clark_vulcan         — バルカンパンチ (multi-hit punches)
 *   clark_argentine_dm   — スーパーアルゼンチンバックブリーカー DM
 */

import {
  renderOsc, renderNoise, lowPass, highPass, bandPass,
  mixLayers, normalize, expDecay, padTo,
} from '../../../../audio/samplerRenderUtils.js';

type SampleRenderer = (sr: number) => Float32Array;

// スーパーアルゼンチンバックブリーカー (CLARK_ARGENTINE): 近身投技 — 抓取 + 背骨折摔
function renderClarkArgentine(sr: number): Float32Array {
  const dur = 0.35;
  const grab = renderOsc(sr, 0.06, 'square', t => 350 - 5000 * t, t => expDecay(t, 0.15, 30));
  const spin = renderOsc(sr, 0.12, 'sawtooth',
    t => 120 + 4500 * t,
    t => expDecay(t, 0.18, 15));
  const slam = renderOsc(sr, 0.1, 'sine', t => 90 - 700 * t, t => expDecay(t, 0.25, 12));
  const impact = lowPass(renderNoise(sr, 0.12, t => expDecay(t, 0.2, 10)), sr, 2000);
  const sub = renderOsc(sr, 0.15, 'sine', t => 55 - 25 * t, t => expDecay(t, 0.35, 5));

  const total = Math.ceil(sr * dur);
  const grabP = padTo(grab, total);
  const spinP = padTo(spin, total, Math.floor(sr * 0.06));
  const slamP = padTo(slam, total, Math.floor(sr * 0.16));
  const impactP = padTo(impact, total, Math.floor(sr * 0.16));
  const subP = padTo(sub, total, Math.floor(sr * 0.1));

  return normalize(mixLayers(
    [grabP, spinP, slamP, impactP, subP],
    [0.8, 1, 0.9, 0.7, 1]
  ));
}

// ナパームストレッチ (CLARK_NAPALM): 对空捕捉投 — 伸展抓取 + 空中拉摔
function renderClarkNapalm(sr: number): Float32Array {
  const dur = 0.28;
  const stretch = renderOsc(sr, 0.08, 'sawtooth',
    t => 200 + 6000 * t,
    t => expDecay(t, 0.15, 18));
  const grab = renderOsc(sr, 0.04, 'square', t => 400 - 6000 * t, t => expDecay(t, 0.1, 35));
  const slam = renderOsc(sr, 0.08, 'sine', t => 100 - 500 * t, t => expDecay(t, 0.22, 14));
  const impact = bandPass(renderNoise(sr, 0.08, t => expDecay(t, 0.18, 25)), sr, 1500, 5000);
  const air = highPass(renderNoise(sr, 0.1, t => expDecay(t, 0.12, 14)), sr, 3000);

  const total = Math.ceil(sr * dur);
  const grabP = padTo(grab, total, Math.floor(sr * 0.06));
  const slamP = padTo(slam, total, Math.floor(sr * 0.12));
  const impactP = padTo(impact, total, Math.floor(sr * 0.1));
  const airP = padTo(air, total, Math.floor(sr * 0.04));

  return normalize(mixLayers(
    [stretch, grabP, slamP, impactP, airP],
    [1, 0.7, 0.9, 0.8, 0.5]
  ));
}

// フラッシュエルボー (CLARK_FLASH_ELBOW): 追击肘击 — 快速冲肘 + 冲击
function renderClarkFlashElbow(sr: number): Float32Array {
  const dur = 0.2;
  const rush = renderOsc(sr, 0.06, 'sawtooth',
    t => 300 + 8000 * t,
    t => expDecay(t, 0.12, 20));
  const elbow = bandPass(renderNoise(sr, 0.05, t => expDecay(t, 0.15, 30)), sr, 2000, 7000);
  const crack = renderOsc(sr, 0.03, 'square', t => 2500 - 40000 * t, t => expDecay(t, 0.08, 50));
  const body = renderOsc(sr, 0.06, 'sine', t => 130 - 800 * t, t => expDecay(t, 0.2, 10));

  const total = Math.ceil(sr * dur);
  const elbowP = padTo(elbow, total, Math.floor(sr * 0.03));
  const crackP = padTo(crack, total, Math.floor(sr * 0.02));
  const bodyP = padTo(body, total, Math.floor(sr * 0.04));

  return normalize(mixLayers(
    [rush, elbowP, crackP, bodyP],
    [0.9, 0.8, 0.6, 0.7]
  ));
}

// マウントタックル (CLARK_MOUNT_TACKLE): 近身冲撞投 — 快速冲撞 + 扑倒
function renderClarkMountTackle(sr: number): Float32Array {
  const dur = 0.3;
  const rush = renderOsc(sr, 0.08, 'sawtooth',
    t => 180 + 7000 * t,
    t => expDecay(t, 0.14, 16));
  const grab = renderOsc(sr, 0.04, 'square', t => 350 - 5000 * t, t => expDecay(t, 0.1, 32));
  const ground = lowPass(renderNoise(sr, 0.12, t => expDecay(t, 0.18, 8)), sr, 2500);
  const slam = renderOsc(sr, 0.08, 'sine', t => 80 - 500 * t, t => expDecay(t, 0.25, 12));
  const sub = renderOsc(sr, 0.12, 'sine', t => 50 - 20 * t, t => expDecay(t, 0.3, 5));

  const total = Math.ceil(sr * dur);
  const grabP = padTo(grab, total, Math.floor(sr * 0.06));
  const groundP = padTo(ground, total, Math.floor(sr * 0.08));
  const slamP = padTo(slam, total, Math.floor(sr * 0.1));
  const subP = padTo(sub, total, Math.floor(sr * 0.08));

  return normalize(mixLayers(
    [rush, grabP, groundP, slamP, subP],
    [1, 0.7, 0.8, 0.9, 1]
  ));
}

// バルカンパンチ (CLARK_VULCAN): 多段连打 — 快速连拳 + 冲击
function renderClarkVulcan(sr: number): Float32Array {
  const dur = 0.3;
  const wind = renderOsc(sr, 0.06, 'sawtooth',
    t => 250 + 5000 * t,
    t => expDecay(t, 0.12, 16));
  const hits: Float32Array[] = [];
  for (let i = 0; i < 4; i++) {
    const offset = Math.floor(sr * i * 0.04);
    const hit = bandPass(renderNoise(sr, 0.04, t => expDecay(t, 0.18, 28)), sr, 1800, 6000);
    hits.push(padTo(hit, Math.ceil(sr * dur), offset));
  }
  const body = renderOsc(sr, 0.08, 'sine', t => 110 - 600 * t, t => expDecay(t, 0.25, 8));

  const total = Math.ceil(sr * dur);
  const bodyP = padTo(body, total, Math.floor(sr * 0.04));

  return normalize(mixLayers(
    [wind, ...hits, bodyP],
    [0.8, 1, 1, 1, 1, 0.7]
  ));
}

// スーパーアルゼンチンバックブリーカー DM (CLARK_ARGENTINE_DM): 超必杀投技 — 绿色能量爆发 + 连续背骨折
function renderClarkArgentineDM(sr: number): Float32Array {
  const dur = 0.5;
  const charge = renderOsc(sr, 0.08, 'sawtooth',
    t => 90 + 5500 * t,
    t => expDecay(t, 0.12, 10));
  const eruption = renderOsc(sr, 0.2, 'sawtooth',
    t => t < 0.05 ? 160 + 11000 * t : 710 - 2800 * (t - 0.05),
    t => t < 0.05 ? 0.1 + t * 4 : expDecay(t - 0.05, 0.15, 6));
  const sub = renderOsc(sr, 0.25, 'sine', t => 48 - 18 * t, t => expDecay(t, 0.4, 4));
  const slam: Float32Array[] = [];
  for (let i = 0; i < 4; i++) {
    const offset = Math.floor(sr * (0.1 + i * 0.06));
    const hit = bandPass(renderNoise(sr, 0.04, t => expDecay(t, 0.2, 25)), sr, 1500, 6000);
    slam.push(padTo(hit, Math.ceil(sr * dur), offset));
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
    [chargeP, eruptionP, subP, ...slam, debrisP, rumbleP],
    [0.8, 1, 1.2, 1, 1, 1, 1, 0.7, 0.9]
  ));
}

export function registerClarkAudio(registerFn: (id: string, renderer: SampleRenderer) => void): void {
  registerFn('clark_argentine', renderClarkArgentine);
  registerFn('clark_napalm', renderClarkNapalm);
  registerFn('clark_flash_elbow', renderClarkFlashElbow);
  registerFn('clark_mount_tackle', renderClarkMountTackle);
  registerFn('clark_vulcan', renderClarkVulcan);
  registerFn('clark_argentine_dm', renderClarkArgentineDM);
}
