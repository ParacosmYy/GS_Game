/**
 * Terry Audio Sampler — Character-specific sound renderers
 *
 * Move sounds:
 *   terry_power_wave    — 能量波 (ground projectile)
 *   terry_burn_knuckle  — 燃烧拳 (energy dash punch)
 *   terry_crack_shot    — 碎裂踢 (rising kick)
 *   terry_power_dunk    — 能量灌篮 (leaping slam)
 *   terry_rising_tackle — 上升撞击 (multi-hit rising)
 *   terry_power_geyser  — 能量喷泉 (DM ground geyser)
 */

import {
  renderOsc, renderNoise, lowPass, highPass, bandPass,
  mixLayers, normalize, expDecay, padTo,
} from '../../../../audio/samplerRenderUtils.js';

type SampleRenderer = (sr: number) => Float32Array;

// 能量波 (POWER_WAVE): 地面能量弹 — 低频冲击 + 地面摩擦
function renderPowerWave(sr: number): Float32Array {
  const dur = 0.35;
  const ground = renderOsc(sr, dur, 'sawtooth',
    t => t < 0.05 ? 80 + 3000 * t : 230 - 800 * (t - 0.05),
    t => t < 0.05 ? 0.1 + t * 2 : expDecay(t - 0.05, 0.28, 5));
  const impact = renderOsc(sr, 0.12, 'sine', t => 120 - 1200 * t, t => expDecay(t, 0.3, 10));
  const friction = lowPass(renderNoise(sr, dur * 0.6, t => expDecay(t, 0.2, 8)), sr, 2000);
  const crack = highPass(renderNoise(sr, 0.06, t => expDecay(t, 0.15, 35)), sr, 4000);
  const sub = renderOsc(sr, 0.2, 'sine', t => 50 - 25 * t, t => expDecay(t, 0.4, 5));
  const launch = renderOsc(sr, 0.04, 'square', t => 1200 - 25000 * t, t => expDecay(t, 0.1, 40));

  const total = Math.ceil(sr * dur);
  const frictionP = padTo(friction, total, Math.floor(sr * 0.03));
  const crackP = padTo(crack, total, Math.floor(sr * 0.02));
  const subP = padTo(sub, total);
  const launchP = padTo(launch, total);

  return normalize(mixLayers(
    [ground, impact, frictionP, crackP, subP, launchP],
    [1, 0.8, 0.6, 0.5, 1, 0.4]
  ));
}

// 燃烧拳 (BURN_KNUCKLE): 能量冲拳 — 中高频能量 + 冲刺风
function renderBurnKnuckle(sr: number): Float32Array {
  const dur = 0.28;
  const energy = renderOsc(sr, dur, 'sawtooth',
    t => t < 0.04 ? 200 + 8000 * t : 520 - 1500 * (t - 0.04),
    t => t < 0.04 ? 0.08 + t * 3 : expDecay(t - 0.04, 0.22, 7));
  const dash = bandPass(renderNoise(sr, 0.15, t => expDecay(t, 0.12, 15)), sr, 1000, 4000);
  const crackle = highPass(renderNoise(sr, 0.08, t => expDecay(t, 0.15, 25)), sr, 5000);
  const hit = renderOsc(sr, 0.06, 'square', t => 600 - 15000 * t, t => expDecay(t, 0.2, 30));
  const hum = renderOsc(sr, 0.2, 'sine', t => 160 - 200 * t, t => expDecay(t, 0.25, 6));

  const total = Math.ceil(sr * dur);
  const dashP = padTo(dash, total, Math.floor(sr * 0.02));
  const crackleP = padTo(crackle, total, Math.floor(sr * 0.03));
  const hitP = padTo(hit, total, Math.floor(sr * 0.05));
  const humP = padTo(hum, total);

  return normalize(mixLayers(
    [energy, dashP, crackleP, hitP, humP],
    [1, 0.7, 0.5, 0.8, 0.6]
  ));
}

// 碎裂踢 (CRACK_SHOT): 上升踢 — 上升sweep + 破碎感
function renderCrackShot(sr: number): Float32Array {
  const dur = 0.25;
  const sweep = renderOsc(sr, 0.1, 'sawtooth',
    t => 300 + 12000 * t,
    t => expDecay(t, 0.18, 15));
  const kick = bandPass(renderNoise(sr, 0.06, t => expDecay(t, 0.2, 30)), sr, 1500, 6000);
  const snap = renderOsc(sr, 0.03, 'triangle', t => 2500 - 50000 * t, t => expDecay(t, 0.12, 45));
  const body = renderOsc(sr, 0.1, 'sine', t => 130 - 1200 * t, t => expDecay(t, 0.25, 12));

  const total = Math.ceil(sr * dur);
  const kickP = padTo(kick, total, Math.floor(sr * 0.04));
  const snapP = padTo(snap, total, Math.floor(sr * 0.03));
  const bodyP = padTo(body, total, Math.floor(sr * 0.04));

  return normalize(mixLayers(
    [sweep, kickP, snapP, bodyP],
    [1, 0.8, 0.5, 0.7]
  ));
}

// 能量灌篮 (POWER_DUNK): 跳跃重击 — 下降冲击 + 重落地
function renderPowerDunk(sr: number): Float32Array {
  const dur = 0.3;
  const rise = renderOsc(sr, 0.08, 'sawtooth',
    t => 200 + 8000 * t,
    t => expDecay(t, 0.2, 20));
  const slam = renderOsc(sr, 0.1, 'square', t => 400 - 10000 * t, t => expDecay(t, 0.25, 18));
  const ground = lowPass(renderNoise(sr, 0.12, t => expDecay(t, 0.2, 10)), sr, 2500);
  const sub = renderOsc(sr, 0.15, 'sine', t => 55 - 30 * t, t => expDecay(t, 0.35, 5));
  const impact = renderOsc(sr, 0.06, 'sine', t => 100 - 800 * t, t => expDecay(t, 0.3, 15));

  const total = Math.ceil(sr * dur);
  const slamP = padTo(slam, total, Math.floor(sr * 0.08));
  const groundP = padTo(ground, total, Math.floor(sr * 0.1));
  const subP = padTo(sub, total, Math.floor(sr * 0.08));
  const impactP = padTo(impact, total, Math.floor(sr * 0.1));

  return normalize(mixLayers(
    [rise, slamP, groundP, subP, impactP],
    [0.8, 1, 0.7, 1, 0.9]
  ));
}

// 上升撞击 (RISING_TACKLE): 多段上升 — 上升螺旋 + 连续打击
function renderRisingTackle(sr: number): Float32Array {
  const dur = 0.3;
  const spin = renderOsc(sr, dur, 'sawtooth',
    t => 150 + 10000 * t,
    t => expDecay(t, 0.2, 8));
  const hits: Float32Array[] = [];
  for (let i = 0; i < 3; i++) {
    const offset = Math.floor(sr * i * 0.06);
    const hit = bandPass(renderNoise(sr, 0.04, t => expDecay(t, 0.2, 35)), sr, 2000, 7000);
    hits.push(padTo(hit, Math.ceil(sr * dur), offset));
  }
  const wind = highPass(renderNoise(sr, 0.15, t => expDecay(t, 0.15, 12)), sr, 3000);
  const body = renderOsc(sr, 0.12, 'sine', t => 100 - 800 * t, t => expDecay(t, 0.3, 10));

  const total = Math.ceil(sr * dur);
  const windP = padTo(wind, total);
  const bodyP = padTo(body, total, Math.floor(sr * 0.03));

  return normalize(mixLayers(
    [spin, ...hits, windP, bodyP],
    [0.9, 1, 1, 1, 0.5, 0.7]
  ));
}

// 能量喷泉 (POWER_GEYSER): DM — 地面爆发 + 多层冲击
function renderPowerGeyser(sr: number): Float32Array {
  const dur = 0.5;
  const charge = renderOsc(sr, 0.1, 'sawtooth',
    t => 100 + 6000 * t,
    t => expDecay(t, 0.15, 10));
  const eruption = renderOsc(sr, 0.2, 'sawtooth',
    t => t < 0.05 ? 200 + 12000 * t : 800 - 3000 * (t - 0.05),
    t => t < 0.05 ? 0.1 + t * 4 : expDecay(t - 0.05, 0.15, 6));
  const sub = renderOsc(sr, 0.3, 'sine', t => 45 - 20 * t, t => expDecay(t, 0.45, 4));
  const debris = lowPass(renderNoise(sr, 0.2, t => expDecay(t, 0.18, 8)), sr, 3000);
  const sizzle = highPass(renderNoise(sr, 0.15, t => expDecay(t, 0.12, 12)), sr, 5000);
  const rumble = renderOsc(sr, 0.25, 'sine', t => 60 - 20 * t, t => expDecay(t, 0.3, 5));

  const total = Math.ceil(sr * dur);
  const chargeP = padTo(charge, total);
  const eruptionP = padTo(eruption, total, Math.floor(sr * 0.08));
  const subP = padTo(sub, total, Math.floor(sr * 0.08));
  const debrisP = padTo(debris, total, Math.floor(sr * 0.08));
  const sizzleP = padTo(sizzle, total, Math.floor(sr * 0.08));
  const rumbleP = padTo(rumble, total, Math.floor(sr * 0.06));

  return normalize(mixLayers(
    [chargeP, eruptionP, subP, debrisP, sizzleP, rumbleP],
    [0.8, 1, 1.2, 0.7, 0.5, 0.9]
  ));
}

export function registerTerryAudio(registerFn: (id: string, renderer: SampleRenderer) => void): void {
  registerFn('terry_power_wave', renderPowerWave);
  registerFn('terry_burn_knuckle', renderBurnKnuckle);
  registerFn('terry_crack_shot', renderCrackShot);
  registerFn('terry_power_dunk', renderPowerDunk);
  registerFn('terry_rising_tackle', renderRisingTackle);
  registerFn('terry_power_geyser', renderPowerGeyser);
}
