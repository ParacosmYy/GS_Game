/**
 * 采样音效系统 — 离线预渲染所有音效到AudioBuffer
 * 替代实时振荡器合成，每帧播放仅消耗一个BufferSourceNode
 */
import { getCtx } from './audioCtx.js';

type SampleId =
  | 'hit_light' | 'hit_heavy' | 'block' | 'block_heavy'
  | 'special' | 'dm' | 'ko' | 'counter' | 'guard_crush'
  | 'chip' | 'wall_bounce' | 'cancel' | 'wire' | 'juggle'
  | 'super_flash' | 'super_flash_sdm'
  | 'throw' | 'throw_escape' | 'select' | 'victory'
  | 'roll' | 'landing' | 'projectile' | 'max_activation'
  | 'round_call' | 'time_over' | 'perfect' | 'fight'
  | 'quick_stand' | 'step';

const samples = new Map<SampleId, AudioBuffer>();
let initialized = false;

// 离线渲染一个振荡器层到buffer
function renderOsc(
  sr: number, duration: number,
  type: OscillatorType, freqFn: (t: number) => number, ampFn: (t: number) => number,
): Float32Array {
  const len = Math.ceil(sr * duration);
  const buf = new Float32Array(len);
  let phase = 0;
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const freq = freqFn(t);
    const amp = ampFn(t);
    phase += (2 * Math.PI * freq) / sr;
    let val: number;
    switch (type) {
      case 'sine': val = Math.sin(phase); break;
      case 'square': val = Math.sin(phase) > 0 ? 1 : -1; break;
      case 'sawtooth': val = 2 * ((phase / (2 * Math.PI)) % 1) - 1; break;
      case 'triangle': val = 4 * Math.abs(((phase / (2 * Math.PI)) + 0.25) % 1 - 0.5) - 1; break;
      default: val = Math.sin(phase);
    }
    buf[i] = val * amp;
  }
  return buf;
}

// 生成噪声buffer
function renderNoise(sr: number, duration: number, ampFn: (t: number) => number): Float32Array {
  const len = Math.ceil(sr * duration);
  const buf = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    buf[i] = (Math.random() * 2 - 1) * ampFn(i / sr);
  }
  return buf;
}

// 应用IIR低通滤波
function lowPass(data: Float32Array, sr: number, cutoff: number): Float32Array {
  const rc = 1 / (2 * Math.PI * cutoff);
  const dt = 1 / sr;
  const alpha = dt / (rc + dt);
  const out = new Float32Array(data.length);
  out[0] = data[0];
  for (let i = 1; i < data.length; i++) {
    out[i] = out[i - 1] + alpha * (data[i] - out[i - 1]);
  }
  return out;
}

// 应用IIR高通滤波
function highPass(data: Float32Array, sr: number, cutoff: number): Float32Array {
  const rc = 1 / (2 * Math.PI * cutoff);
  const dt = 1 / sr;
  const alpha = rc / (rc + dt);
  const out = new Float32Array(data.length);
  out[0] = data[0];
  for (let i = 1; i < data.length; i++) {
    out[i] = alpha * (out[i - 1] + data[i] - data[i - 1]);
  }
  return out;
}

// 带通 = lowPass(highPass(data))
function bandPass(data: Float32Array, sr: number, low: number, high: number): Float32Array {
  return lowPass(highPass(data, sr, low), sr, high);
}

// 混合多个层
function mixLayers(layers: Float32Array[], gains: number[]): Float32Array {
  const len = layers[0].length;
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    let v = 0;
    for (let l = 0; l < layers.length; l++) {
      v += layers[l][i] * gains[l];
    }
    out[i] = v;
  }
  return out;
}

function clamp(v: number): number {
  return Math.max(-1, Math.min(1, v));
}

function normalize(data: Float32Array): Float32Array {
  let peak = 0;
  for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
  if (peak < 0.001) return data;
  const scale = 0.95 / peak;
  const out = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) out[i] = clamp(data[i] * scale);
  return out;
}

function makeBuffer(ctx: AudioContext, data: Float32Array): AudioBuffer {
  const buf = ctx.createBuffer(1, data.length, ctx.sampleRate);
  buf.getChannelData(0).set(data);
  return buf;
}

// 指数衰减辅助
function expDecay(t: number, start: number, decay: number): number {
  return start * Math.exp(-t * decay);
}

// === 各音效预渲染函数 ===

function renderHitLight(sr: number): Float32Array {
  const dur = 0.06;
  // 噪声层
  const noise = bandPass(renderNoise(sr, dur, t => expDecay(t, 0.35, 25)), sr, 800, 3000);
  // 低频体感
  const body = renderOsc(sr, dur, 'sine', t => 180 - 2800 * t, t => expDecay(t, 0.3, 25));
  // 高频打击感
  const snap = renderOsc(sr, dur, 'triangle', t => 1200 - 9000 * t, t => expDecay(t, 0.15, 50));
  return normalize(mixLayers([noise, body, snap], [1, 0.8, 0.4]));
}

function renderHitHeavy(sr: number): Float32Array {
  const dur = 0.14;
  const noise = bandPass(renderNoise(sr, dur, t => expDecay(t, 0.4, 12)), sr, 300, 2000);
  const body = renderOsc(sr, dur, 'sine', t => 100 - 600 * t, t => expDecay(t, 0.5, 12));
  const crack = renderOsc(sr, dur, 'triangle', t => 500 - 8000 * t, t => expDecay(t, 0.25, 30));
  const harm = renderOsc(sr, dur, 'sawtooth', t => 800 - 8000 * t, t => expDecay(t, 0.1, 20));
  const hi = renderOsc(sr, 0.03, 'square', t => 2500 - 60000 * t, t => expDecay(t, 0.08, 60));
  const padded = new Float32Array(Math.ceil(sr * dur));
  padded.set(hi);
  return normalize(mixLayers([noise, body, crack, harm, padded], [1, 1.2, 0.7, 0.3, 0.2]));
}

function renderBlock(sr: number, heavy: boolean): Float32Array {
  const dur = heavy ? 0.12 : 0.09;
  const baseF = heavy ? 900 : 1100;
  const metal = renderOsc(sr, dur, 'square', t => baseF - baseF * 8 * t, t => expDecay(t, 0.15, heavy ? 15 : 20));
  const res = renderOsc(sr, dur, 'sine', t => 2200 - 3000 * t, t => expDecay(t, 0.06, 25));
  const noise = highPass(renderNoise(sr, dur, t => expDecay(t, heavy ? 0.2 : 0.12, heavy ? 20 : 30)), sr, heavy ? 2000 : 2500);
  const layers = [metal, res, noise];
  const gains = [1, 0.4, heavy ? 0.8 : 0.5];
  if (heavy) {
    const lo = renderOsc(sr, 0.12, 'sine', t => 150 - 900 * t, t => expDecay(t, 0.12, 15));
    layers.push(lo);
    gains.push(0.8);
  }
  return normalize(mixLayers(layers, gains));
}

function renderSpecial(sr: number): Float32Array {
  const dur = 0.25;
  const whoosh = renderOsc(sr, dur, 'sawtooth',
    t => t < 0.08 ? 200 + 7500 * t : 800 - 3000 * (t - 0.08),
    t => t < 0.08 ? 0.18 + t * 0.5 : expDecay(t - 0.08, 0.22, 8));
  const noise = bandPass(renderNoise(sr, 0.15, t => expDecay(t, 0.12, 10)), sr, 400, 3500);
  const metal = renderOsc(sr, 0.07, 'triangle', t => 2400 - 25000 * t, t => expDecay(t, 0.08, 30));
  const nPadded = new Float32Array(Math.ceil(sr * dur));
  nPadded.set(noise);
  return normalize(mixLayers([whoosh, nPadded, metal], [1, 0.6, 0.5]));
}

function renderDM(sr: number): Float32Array {
  const dur = 0.5;
  const bass = renderOsc(sr, dur, 'sawtooth', t => 80 - 150 * t, t => expDecay(t, 0.3, 5));
  const mid = renderOsc(sr, 0.22, 'square', t => 1200 - 5000 * t, t => expDecay(t, 0.12, 8));
  const noise = bandPass(renderNoise(sr, 0.25, t => expDecay(t, 0.35, 6)), sr, 300, 2000);
  const sub = renderOsc(sr, 0.4, 'sine', t => 60 - 130 * t, t => expDecay(t, 0.4, 4));
  const burst = highPass(renderNoise(sr, 0.1, t => t < 0.001 ? 0 : expDecay(t - 0.001, 0.15, 15)), sr, 2000);
  const midP = new Float32Array(Math.ceil(sr * dur)); midP.set(mid);
  const noiseP = new Float32Array(Math.ceil(sr * dur)); noiseP.set(noise);
  const burstP = new Float32Array(Math.ceil(sr * dur));
  const burstOffset = Math.floor(sr * 0.1);
  burstP.set(burst, Math.min(burstOffset, burstP.length - burst.length));
  return normalize(mixLayers([bass, midP, noiseP, sub, burstP], [1, 0.4, 1, 1.2, 0.4]));
}

function renderKO(sr: number): Float32Array {
  const dur = 0.65;
  const main = renderOsc(sr, dur, 'sawtooth', t => 200 - 300 * t, t => expDecay(t, 0.4, 4));
  const noise = renderNoise(sr, 0.4, t => expDecay(t, 0.2, 6));
  const sub = renderOsc(sr, 0.55, 'sine', t => 50 - 70 * t, t => expDecay(t, 0.35, 3.5));
  const ring = renderOsc(sr, 0.45, 'triangle', t => t < 0.01 ? 1800 : 1800 - 3500 * (t - 0.01), t => t < 0.1 ? 0.06 : expDecay(t - 0.1, 0.06, 8));
  const noiseP = new Float32Array(Math.ceil(sr * dur)); noiseP.set(noise);
  const ringP = new Float32Array(Math.ceil(sr * dur));
  const ringOff = Math.floor(sr * 0.1);
  ringP.set(ring, Math.min(ringOff, ringP.length - ring.length));
  return normalize(mixLayers([main, noiseP, sub, ringP], [1, 0.5, 1, 0.2]));
}

function renderCounter(sr: number): Float32Array {
  const dur = 0.15;
  const osc1 = renderOsc(sr, dur, 'square',
    t => t < 0.03 ? 1500 : 2000,
    t => expDecay(t, 0.15, 20));
  const osc2 = renderOsc(sr, dur, 'sawtooth',
    t => t < 0.05 ? 0 : 2500 - 25000 * (t - 0.05),
    t => t < 0.05 ? 0 : expDecay(t - 0.05, 0.1, 18));
  return normalize(mixLayers([osc1, osc2], [1, 0.7]));
}

function renderGuardCrush(sr: number): Float32Array {
  const dur = 0.18;
  const noise = highPass(renderNoise(sr, dur, t => expDecay(t, 0.3, 10)), sr, 1500);
  const crunch = renderOsc(sr, dur, 'square', t => 300 - 2200 * t, t => expDecay(t, 0.3, 12));
  const ring = renderOsc(sr, 0.12, 'sine', t => 2000 - 10000 * t, t => expDecay(t, 0.08, 15));
  const crack = renderOsc(sr, 0.05, 'sawtooth', t => 3500 - 70000 * t, t => expDecay(t, 0.15, 35));
  const ringP = new Float32Array(Math.ceil(sr * dur)); ringP.set(ring);
  return normalize(mixLayers([noise, crunch, ringP, crack], [1, 1, 0.3, 0.5]));
}

function renderChip(sr: number): Float32Array {
  const dur = 0.05;
  const noise = highPass(renderNoise(sr, dur, t => expDecay(t, 0.12, 30)), sr, 3000);
  const osc = renderOsc(sr, dur, 'triangle', _t => 800, t => expDecay(t, 0.06, 40));
  return normalize(mixLayers([noise, osc], [1, 0.5]));
}

function renderWallBounce(sr: number): Float32Array {
  const dur = 0.15;
  const metal = renderOsc(sr, dur, 'square', t => 600 - 4000 * t, t => expDecay(t, 0.2, 12));
  const noise = bandPass(renderNoise(sr, 0.1, t => expDecay(t, 0.12, 15)), sr, 1000, 4000);
  const debris = highPass(renderNoise(sr, 0.05, t => t < 0.003 ? 0 : expDecay(t - 0.003, 0.1, 25)), sr, 3000);
  const noiseP = new Float32Array(Math.ceil(sr * dur)); noiseP.set(noise);
  const debrisP = new Float32Array(Math.ceil(sr * dur));
  debrisP.set(debris, Math.min(Math.floor(sr * 0.03), debrisP.length - debris.length));
  return normalize(mixLayers([metal, noiseP, debrisP], [1, 0.6, 0.4]));
}

function renderCancel(sr: number): Float32Array {
  const dur = 0.13;
  const osc = renderOsc(sr, dur, 'sawtooth',
    t => t < 0.04 ? 600 + 30000 * t : 1800 - 14000 * (t - 0.04),
    t => expDecay(t, 0.2, 12));
  const chime = renderOsc(sr, dur, 'sine', _t => 1400,
    t => t < 0.03 ? 0 : expDecay(t - 0.03, 0.08, 20));
  const sparkle = renderOsc(sr, 0.04, 'triangle', t => 3200 - 60000 * t, t => expDecay(t, 0.06, 40));
  const sparkleP = new Float32Array(Math.ceil(sr * dur)); sparkleP.set(sparkle);
  return normalize(mixLayers([osc, chime, sparkleP], [1, 0.4, 0.3]));
}

function renderWire(sr: number): Float32Array {
  const dur = 0.16;
  const osc = renderOsc(sr, dur, 'sawtooth',
    t => t < 0.06 ? 800 - 10000 * t : t < 0.12 ? 200 + 15000 * (t - 0.06) : 1200 - 15000 * (t - 0.12),
    t => expDecay(t, 0.2, 10));
  const noise = bandPass(renderNoise(sr, 0.08, t => t < 0.005 ? 0 : expDecay(t - 0.005, 0.15, 15)), sr, 800, 3000);
  const noiseP = new Float32Array(Math.ceil(sr * dur));
  noiseP.set(noise, Math.min(Math.floor(sr * 0.05), noiseP.length - noise.length));
  return normalize(mixLayers([osc, noiseP], [1, 0.6]));
}

function renderJuggle(sr: number): Float32Array {
  const dur = 0.05;
  const noise = highPass(renderNoise(sr, dur, t => expDecay(t, 0.15, 30)), sr, 1500);
  const osc = renderOsc(sr, dur, 'triangle', t => 600 - 13000 * t, t => expDecay(t, 0.12, 30));
  return normalize(mixLayers([noise, osc], [1, 0.8]));
}

function renderSuperFlash(sr: number, isSDM: boolean): Float32Array {
  const dur = isSDM ? 0.45 : 0.35;
  const osc = renderOsc(sr, dur, 'sawtooth',
    t => t < 0.12 ? 300 + 14000 * t : t < 0.25 ? 2000 - 10000 * (t - 0.12) : 600,
    t => t < 0.1 ? (isSDM ? 0.2 : 0.15) + t * 2 : expDecay(t - 0.1, isSDM ? 0.35 : 0.25, isSDM ? 5 : 7));
  const shimmer = highPass(renderNoise(sr, isSDM ? 0.2 : 0.16, t => expDecay(t, isSDM ? 0.14 : 0.08, 10)), sr, 4000);
  const shimmerP = new Float32Array(Math.ceil(sr * dur)); shimmerP.set(shimmer);
  const layers = [osc, shimmerP];
  const gains = [1, 0.4];
  if (isSDM) {
    const chime = renderOsc(sr, 0.35, 'sine',
      t => t < 0.05 ? 880 : t < 0.15 ? 880 + 8800 * (t - 0.05) : 1760 - 4000 * (t - 0.15),
      t => t < 0.05 ? 0 : expDecay(t - 0.05, 0.1, 6));
    const chimeP = new Float32Array(Math.ceil(sr * dur));
    chimeP.set(chime, Math.min(Math.floor(sr * 0.05), chimeP.length - chime.length));
    layers.push(chimeP);
    gains.push(0.3);
  }
  return normalize(mixLayers(layers, gains));
}

function renderThrow(sr: number): Float32Array {
  const dur = 0.16;
  const grab = renderOsc(sr, dur, 'square',
    t => t < 0.03 ? 400 : t < 0.06 ? 200 : 80,
    t => expDecay(t, 0.2, 15));
  const slam = renderOsc(sr, dur, 'sine',
    t => t < 0.05 ? 0 : 100 - 1200 * (t - 0.05),
    t => t < 0.05 ? 0 : expDecay(t - 0.05, 0.25, 12));
  return normalize(mixLayers([grab, slam], [0.7, 1]));
}

function renderThrowEscape(sr: number): Float32Array {
  const dur = 0.12;
  const osc = renderOsc(sr, dur, 'triangle',
    t => t < 0.03 ? 600 : t < 0.06 ? 800 : 500,
    t => expDecay(t, 0.15, 18));
  const chime = renderOsc(sr, dur, 'sine', _t => 1200,
    t => t < 0.04 ? 0 : expDecay(t - 0.04, 0.05, 25));
  return normalize(mixLayers([osc, chime], [1, 0.3]));
}

function renderSelect(sr: number): Float32Array {
  const dur = 0.2;
  const osc = renderOsc(sr, dur, 'sine',
    t => t < 0.05 ? 880 : 1100,
    t => expDecay(t, 0.2, 12));
  const harm = renderOsc(sr, dur, 'sine', _t => 1760, t => expDecay(t, 0.05, 18));
  return normalize(mixLayers([osc, harm], [1, 0.25]));
}

function renderVictory(sr: number): Float32Array {
  const notes = [523.3, 659.3, 784, 1047];
  const noteDur = 0.4;
  const totalDur = notes.length * 0.15 + noteDur;
  const len = Math.ceil(sr * totalDur);
  const out = new Float32Array(len);
  for (let n = 0; n < notes.length; n++) {
    const offset = Math.floor(sr * n * 0.15);
    const tone = renderOsc(sr, noteDur, 'square', _t => notes[n], t => expDecay(t, 0.3, 5));
    const harm = renderOsc(sr, noteDur * 0.8, 'triangle', _t => notes[n] / 2, t => expDecay(t, 0.1, 6));
    for (let i = 0; i < tone.length && offset + i < len; i++) {
      out[offset + i] += tone[i] * 0.3 + harm[i] * 0.1;
    }
  }
  return normalize(out);
}

function renderRoll(sr: number): Float32Array {
  const dur = 0.15;
  const osc = renderOsc(sr, dur, 'sine',
    t => t < 0.08 ? 200 + 2500 * t : 400 - 2000 * (t - 0.08),
    t => expDecay(t, 0.1, 18));
  const noise = renderNoise(sr, 0.1, t => expDecay(t, 0.06, 25));
  const noiseP = new Float32Array(Math.ceil(sr * dur)); noiseP.set(noise);
  return normalize(mixLayers([osc, noiseP], [1, 0.4]));
}

function renderLanding(sr: number): Float32Array {
  const dur = 0.07;
  const thud = renderOsc(sr, dur, 'sine', t => 80 - 800 * t, t => expDecay(t, 0.1, 25));
  const dust = renderNoise(sr, 0.04, t => expDecay(t, 0.06, 30));
  const dustP = new Float32Array(Math.ceil(sr * dur)); dustP.set(dust);
  return normalize(mixLayers([thud, dustP], [1, 0.5]));
}

function renderProjectile(sr: number): Float32Array {
  const dur = 0.2;
  const osc = renderOsc(sr, dur, 'sawtooth',
    t => t < 0.05 ? 300 + 6000 * t : 600 - 3000 * (t - 0.05),
    t => expDecay(t, 0.15, 10));
  const charge = renderOsc(sr, 0.06, 'triangle', t => 400 + 6000 * t, t => expDecay(t, 0.08, 25));
  const chargeP = new Float32Array(Math.ceil(sr * dur)); chargeP.set(charge);
  return normalize(mixLayers([osc, chargeP], [1, 0.5]));
}

function renderMAXActivation(sr: number): Float32Array {
  const dur = 0.6;
  const osc = renderOsc(sr, dur, 'sawtooth',
    t => t < 0.15 ? 150 + 12000 * t : t < 0.35 ? 2000 - 4000 * (t - 0.15) : 1200 - 1200 * (t - 0.35),
    t => t < 0.12 ? 0.2 + t * 1.5 : expDecay(t - 0.12, 0.38, 5));
  const sub = renderOsc(sr, 0.45, 'sine', t => 50 - 40 * t, t => expDecay(t, 0.35, 4));
  const sparkle = highPass(renderNoise(sr, 0.25, t => t < 0.08 ? 0 : expDecay(t - 0.08, 0.12, 8)), sr, 5000);
  const sparkleP = new Float32Array(Math.ceil(sr * dur)); sparkleP.set(sparkle, Math.floor(sr * 0.08));
  const hum = renderOsc(sr, 0.5, 'triangle',
    t => t < 0.1 ? 0 : t < 0.2 ? 300 + 6000 * (t - 0.1) : t < 0.4 ? 900 - 2500 * (t - 0.2) : 400,
    t => t < 0.1 ? 0 : expDecay(t - 0.1, 0.15, 6));
  return normalize(mixLayers([osc, sub, sparkleP, hum], [1, 1.2, 0.4, 0.5]));
}

function renderRoundCall(sr: number): Float32Array {
  const notes = [659.3, 784, 659.3];
  const totalDur = notes.length * 0.12 + 0.18;
  const len = Math.ceil(sr * totalDur);
  const out = new Float32Array(len);
  for (let n = 0; n < notes.length; n++) {
    const offset = Math.floor(sr * n * 0.12);
    const tone = renderOsc(sr, 0.18, 'square', _t => notes[n], t => expDecay(t, 0.3, 8));
    for (let i = 0; i < tone.length && offset + i < len; i++) {
      out[offset + i] += tone[i] * 0.3;
    }
  }
  return normalize(out);
}

function renderTimeOver(sr: number): Float32Array {
  const len = Math.ceil(sr * 0.45);
  const out = new Float32Array(len);
  for (let i = 0; i < 3; i++) {
    const offset = Math.floor(sr * i * 0.15);
    const tone = renderOsc(sr, 0.12, 'square', _t => 440, t => expDecay(t, 0.2, 15));
    for (let j = 0; j < tone.length && offset + j < len; j++) {
      out[offset + j] += tone[j] * 0.2;
    }
  }
  return normalize(out);
}

function renderPerfect(sr: number): Float32Array {
  const notes = [523.3, 659.3, 784, 1047, 1319];
  const totalDur = notes.length * 0.08 + 0.35;
  const len = Math.ceil(sr * totalDur);
  const out = new Float32Array(len);
  for (let n = 0; n < notes.length; n++) {
    const offset = Math.floor(sr * n * 0.08);
    const tone = renderOsc(sr, 0.35, 'sine', _t => notes[n], t => expDecay(t, 0.25, 5));
    const harm = renderOsc(sr, 0.25, 'triangle', _t => notes[n] * 2, t => expDecay(t, 0.06, 8));
    for (let i = 0; i < tone.length && offset + i < len; i++) {
      out[offset + i] += tone[i] * 0.25 + harm[i] * 0.06;
    }
  }
  return normalize(out);
}

function renderFight(sr: number): Float32Array {
  const len = Math.ceil(sr * 0.4);
  const out = new Float32Array(len);
  for (let i = 0; i < 2; i++) {
    const offset = Math.floor(sr * i * 0.08);
    const kick = renderOsc(sr, 0.07, 'sine', _t => 200, t => expDecay(t, 0.4, 20));
    for (let j = 0; j < kick.length && offset + j < len; j++) {
      out[offset + j] += kick[j] * 0.4;
    }
  }
  const ann = renderOsc(sr, 0.22, 'square',
    t => t < 0.06 ? 0 : 400 + 6000 * (t - 0.06),
    t => t < 0.06 ? 0 : expDecay(t - 0.06, 0.3, 6));
  const annOffset = Math.floor(sr * 0.16);
  for (let i = 0; i < ann.length && annOffset + i < len; i++) {
    out[annOffset + i] += ann[i] * 0.3;
  }
  return normalize(out);
}

function renderQuickStand(sr: number): Float32Array {
  const dur = 0.12;
  const osc = renderOsc(sr, dur, 'triangle',
    t => t < 0.04 ? 300 + 7500 * t : t < 0.08 ? 600 - 5000 * (t - 0.04) : 400,
    t => expDecay(t, 0.12, 18));
  const noise = renderNoise(sr, 0.05, t => expDecay(t, 0.08, 25));
  const noiseP = new Float32Array(Math.ceil(sr * dur)); noiseP.set(noise);
  return normalize(mixLayers([osc, noiseP], [1, 0.5]));
}

function renderStep(sr: number): Float32Array {
  const dur = 0.04;
  const noise = lowPass(renderNoise(sr, dur, t => expDecay(t, 0.04, 40)), sr, 800);
  return normalize(noise);
}

// === 初始化：预渲染所有采样 ===

export function initSampler(): void {
  if (initialized) return;
  const ctx = getCtx();
  const sr = ctx.sampleRate;

  const renderers: [SampleId, (sr: number) => Float32Array][] = [
    ['hit_light', renderHitLight],
    ['hit_heavy', renderHitHeavy],
    ['block', sr => renderBlock(sr, false)],
    ['block_heavy', sr => renderBlock(sr, true)],
    ['special', renderSpecial],
    ['dm', renderDM],
    ['ko', renderKO],
    ['counter', renderCounter],
    ['guard_crush', renderGuardCrush],
    ['chip', renderChip],
    ['wall_bounce', renderWallBounce],
    ['cancel', renderCancel],
    ['wire', renderWire],
    ['juggle', renderJuggle],
    ['super_flash', sr => renderSuperFlash(sr, false)],
    ['super_flash_sdm', sr => renderSuperFlash(sr, true)],
    ['throw', renderThrow],
    ['throw_escape', renderThrowEscape],
    ['select', renderSelect],
    ['victory', renderVictory],
    ['roll', renderRoll],
    ['landing', renderLanding],
    ['projectile', renderProjectile],
    ['max_activation', renderMAXActivation],
    ['round_call', renderRoundCall],
    ['time_over', renderTimeOver],
    ['perfect', renderPerfect],
    ['fight', renderFight],
    ['quick_stand', renderQuickStand],
    ['step', renderStep],
  ];

  for (const [id, renderer] of renderers) {
    samples.set(id, makeBuffer(ctx, renderer(sr)));
  }
  initialized = true;
}

// === 播放接口 ===

function play(id: SampleId, volume: number = 1.0, playbackRate: number = 1.0): void {
  const buf = samples.get(id);
  if (!buf) return;
  const ctx = getCtx();
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = playbackRate;
  const gain = ctx.createGain();
  gain.gain.value = volume;
  src.connect(gain).connect(ctx.destination);
  src.start();
}

// 带变调的播放（用于连击音高递增）
function playPitched(id: SampleId, combo: number, volume: number = 1.0): void {
  const rate = 1 + Math.min(combo, 15) * 0.04;
  play(id, volume, rate);
}

// === 公开API — 直接替换原sfx.ts函数签名 ===

export function playHit(intensity: number = 1, combo: number = 0): void {
  initSampler(); playPitched('hit_light', combo, Math.min(intensity * 0.8, 1));
}
export function playHeavyHit(intensity: number = 1): void {
  initSampler(); play('hit_heavy', Math.min(intensity * 0.8, 1));
}
export function playBlock(heavy: boolean = false): void {
  initSampler(); play(heavy ? 'block_heavy' : 'block');
}
export function playSpecial(): void { initSampler(); play('special'); }
export function playDM(): void { initSampler(); play('dm'); }
export function playKO(): void { initSampler(); play('ko'); }
export function playSuperFlash(isSDM: boolean = false): void {
  initSampler(); play(isSDM ? 'super_flash_sdm' : 'super_flash');
}
export function playCounter(): void { initSampler(); play('counter'); }
export function playGuardCrush(): void { initSampler(); play('guard_crush'); }
export function playChip(): void { initSampler(); play('chip'); }
export function playWallBounce(): void { initSampler(); play('wall_bounce'); }
export function playCancel(): void { initSampler(); play('cancel'); }
export function playWire(): void { initSampler(); play('wire'); }
export function playJuggleHit(combo: number = 0): void { initSampler(); playPitched('juggle', combo); }

export { initAudio } from './audioCtx.js';
export function playThrow(): void { initSampler(); play('throw'); }
export function playSelect(): void { initSampler(); play('select'); }
export function playVictoryFanfare(): void { initSampler(); play('victory'); }
export function playRoll(): void { initSampler(); play('roll'); }
export function playThrowEscape(): void { initSampler(); play('throw_escape'); }
export function playLanding(): void { initSampler(); play('landing'); }
export function playProjectileLaunch(): void { initSampler(); play('projectile'); }
export function playMAXActivation(): void { initSampler(); play('max_activation'); }
export function playRoundCall(): void { initSampler(); play('round_call'); }
export function playTimeOver(): void { initSampler(); play('time_over'); }
export function playPerfect(): void { initSampler(); play('perfect'); }
export function playFight(): void { initSampler(); play('fight'); }
export function playQuickStand(): void { initSampler(); play('quick_stand'); }
export function playStep(): void { initSampler(); play('step'); }
