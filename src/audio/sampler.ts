/**
 * 采样音效系统 — 离线预渲染所有音效到AudioBuffer
 * 替代实时振荡器合成，每帧播放仅消耗一个BufferSourceNode
 * v2: 多层噪声纹理、子低音共鸣、金属共鸣、能量蓄积
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
  | 'quick_stand' | 'step'
  | 'hit_crit' | 'dust' | 'air_hit' | 'wall_bounce_heavy'
  | 'guard_break' | 'charge_up'
  | 'block_special' | 'block_dm' | 'special_light' | 'special_heavy';

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

// 延迟偏移辅助：将src对齐到目标长度中offset位置
function padTo(src: Float32Array, totalLen: number, offset: number = 0): Float32Array {
  const out = new Float32Array(totalLen);
  const copyLen = Math.min(src.length, totalLen - offset);
  if (copyLen > 0 && offset < totalLen) out.set(src.subarray(0, copyLen), offset);
  return out;
}

// === 各音效预渲染函数 ===

// 轻击：多层噪声纹理 + 中频体感 + 高频打击感
function renderHitLight(sr: number): Float32Array {
  const dur = 0.08;
  // 低频噪声纹理 — 中频质感
  const noiseMid = bandPass(renderNoise(sr, dur, t => expDecay(t, 0.4, 28)), sr, 800, 3000);
  // 高频噪声纹理 — 空气冲击感
  const noiseHi = bandPass(renderNoise(sr, dur, t => expDecay(t, 0.2, 35)), sr, 3000, 8000);
  // 低频体感 — 拳肉接触的低频
  const body = renderOsc(sr, dur, 'sine', t => 180 - 2800 * t, t => expDecay(t, 0.35, 25));
  // 高频打击瞬态
  const snap = renderOsc(sr, dur * 0.5, 'triangle', t => 1200 - 18000 * t, t => expDecay(t, 0.18, 55));
  // 中频共鸣层
  const mid = renderOsc(sr, dur * 0.6, 'sine', t => 400 - 4000 * t, t => expDecay(t, 0.1, 30));
  const snapP = padTo(snap, Math.ceil(sr * dur));
  const midP = padTo(mid, Math.ceil(sr * dur));
  return normalize(mixLayers([noiseMid, noiseHi, body, snapP, midP], [1, 0.6, 0.8, 0.5, 0.35]));
}

// 重击：子低音轰鸣 + 金属质感 + 多层噪声
function renderHitHeavy(sr: number): Float32Array {
  const dur = 0.18;
  // 中频噪声带 — 肉体冲击质感
  const noiseMid = bandPass(renderNoise(sr, dur, t => expDecay(t, 0.45, 10)), sr, 300, 2000);
  // 高频噪声 — 空气爆裂
  const noiseHi = highPass(renderNoise(sr, dur * 0.6, t => expDecay(t, 0.15, 20)), sr, 3000);
  // 低频体感
  const body = renderOsc(sr, dur, 'sine', t => 100 - 600 * t, t => expDecay(t, 0.55, 10));
  // 子低音隆隆声
  const sub = renderOsc(sr, dur, 'sine', t => 55 - 80 * t, t => expDecay(t, 0.4, 6));
  // 裂纹瞬态
  const crack = renderOsc(sr, dur * 0.3, 'triangle', t => 500 - 14000 * t, t => expDecay(t, 0.3, 35));
  // 金属泛音
  const metal = renderOsc(sr, dur * 0.5, 'sine', t => 1800 - 30000 * t, t => expDecay(t, 0.06, 22));
  // 谐波层
  const harm = renderOsc(sr, dur * 0.4, 'sawtooth', t => 800 - 10000 * t, t => expDecay(t, 0.1, 22));
  // 高频瞬态
  const hi = renderOsc(sr, 0.03, 'square', t => 2500 - 60000 * t, t => expDecay(t, 0.08, 60));
  const crackP = padTo(crack, Math.ceil(sr * dur));
  const metalP = padTo(metal, Math.ceil(sr * dur));
  const harmP = padTo(harm, Math.ceil(sr * dur));
  const hiP = padTo(hi, Math.ceil(sr * dur));
  return normalize(mixLayers(
    [noiseMid, noiseHi, body, sub, crackP, metalP, harmP, hiP],
    [1, 0.4, 1.2, 0.8, 0.7, 0.25, 0.3, 0.2]
  ));
}

function renderBlock(sr: number, heavy: boolean): Float32Array {
  const dur = heavy ? 0.16 : 0.1;
  const baseF = heavy ? 900 : 1100;
  // 金属方波主体
  const metal = renderOsc(sr, dur, 'square', t => baseF - baseF * 6 * t, t => expDecay(t, 0.18, heavy ? 12 : 18));
  // 共鸣泛音 — 模拟金属共振
  const res = renderOsc(sr, dur, 'sine', t => 2200 - 3000 * t, t => expDecay(t, 0.07, heavy ? 18 : 25));
  // 高频噪声 — 冲击质感
  const noise = highPass(renderNoise(sr, dur, t => expDecay(t, heavy ? 0.2 : 0.12, heavy ? 18 : 28)), sr, heavy ? 2000 : 2500);
  // 二次泛音 — 更丰富的金属质感
  const res2 = renderOsc(sr, dur * 0.7, 'triangle', t => 3500 - 15000 * t, t => expDecay(t, 0.04, 20));
  const res2P = padTo(res2, Math.ceil(sr * dur));
  const layers = [metal, res, noise, res2P];
  const gains: number[] = [1, 0.4, heavy ? 0.8 : 0.5, 0.15];
  if (heavy) {
    // 重防御低频层 — 厚重感
    const lo = renderOsc(sr, 0.14, 'sine', t => 150 - 1000 * t, t => expDecay(t, 0.14, 12));
    // 金属尾音
    const tail = renderOsc(sr, 0.2, 'sine', _t => 800, t => expDecay(t, 0.05, 12));
    const tailP = padTo(tail, Math.ceil(sr * dur), Math.floor(sr * 0.05));
    layers.push(lo, tailP);
    gains.push(0.8, 0.2);
  }
  return normalize(mixLayers(layers, gains));
}

// 必杀技：蓄能呼啸 + 冲击 + 金属质感
function renderSpecial(sr: number): Float32Array {
  const dur = 0.3;
  // 能量蓄积呼啸 — 频率上升后下降
  const whoosh = renderOsc(sr, dur, 'sawtooth',
    t => t < 0.1 ? 200 + 8000 * t : 1000 - 3500 * (t - 0.1),
    t => t < 0.1 ? 0.15 + t * 0.8 : expDecay(t - 0.1, 0.25, 7));
  // 中频噪声带 — 能量质感
  const noiseMid = bandPass(renderNoise(sr, dur * 0.7, t => expDecay(t, 0.14, 8)), sr, 400, 3500);
  // 高频噪声 — 空气撕裂感
  const noiseHi = highPass(renderNoise(sr, dur * 0.4, t => expDecay(t, 0.1, 12)), sr, 4000);
  // 金属瞬态
  const metal = renderOsc(sr, 0.08, 'triangle', t => 2400 - 28000 * t, t => expDecay(t, 0.09, 30));
  // 低频冲击波
  const impact = renderOsc(sr, 0.15, 'sine', t => 120 - 1000 * t, t => expDecay(t, 0.3, 12));
  const nMidP = padTo(noiseMid, Math.ceil(sr * dur));
  const nHiP = padTo(noiseHi, Math.ceil(sr * dur));
  const metalP = padTo(metal, Math.ceil(sr * dur));
  const impactP = padTo(impact, Math.ceil(sr * dur), Math.floor(sr * 0.06));
  return normalize(mixLayers([whoosh, nMidP, nHiP, metalP, impactP], [1, 0.6, 0.3, 0.5, 0.7]));
}

// DM：戏剧性能量蓄积 + 大规模爆炸
function renderDM(sr: number): Float32Array {
  const dur = 0.6;
  // 低频扫频 — 能量蓄积
  const bass = renderOsc(sr, dur, 'sawtooth', t => 80 - 150 * t, t => expDecay(t, 0.35, 4));
  // 中频方波 — 攻击性质感
  const mid = renderOsc(sr, 0.25, 'square', t => 1200 - 5000 * t, t => expDecay(t, 0.14, 7));
  // 宽频噪声 — 爆炸质感
  const noise = bandPass(renderNoise(sr, 0.3, t => expDecay(t, 0.4, 5)), sr, 200, 3000);
  // 子低音层 — 身体可感知的低频
  const sub = renderOsc(sr, 0.5, 'sine', t => 60 - 130 * t, t => expDecay(t, 0.45, 3));
  // 二次爆发 — 延迟0.1s
  const burst = highPass(renderNoise(sr, 0.12, t => t < 0.001 ? 0 : expDecay(t - 0.001, 0.18, 12)), sr, 2000);
  // 高频碎裂 — 延迟0.15s
  const shatter = renderOsc(sr, 0.08, 'sawtooth', t => 3000 - 35000 * t, t => expDecay(t, 0.1, 25));
  // 能量上升音 — 正弦波上升
  const rise = renderOsc(sr, 0.12, 'sine', t => 200 + 15000 * t, t => expDecay(t, 0.12, 8));
  // 冲击波尾音 — 低频余震
  const aftershock = renderOsc(sr, 0.3, 'sine', t => 40 - 50 * t, t => t < 0.02 ? 0 : expDecay(t - 0.02, 0.2, 3));

  const total = Math.ceil(sr * dur);
  const midP = padTo(mid, total);
  const noiseP = padTo(noise, total);
  const burstP = padTo(burst, total, Math.floor(sr * 0.1));
  const shatterP = padTo(shatter, total, Math.floor(sr * 0.15));
  const riseP = padTo(rise, total);
  const aftershockP = padTo(aftershock, total, Math.floor(sr * 0.25));

  return normalize(mixLayers(
    [bass, midP, noiseP, sub, burstP, shatterP, riseP, aftershockP],
    [1, 0.4, 1, 1.2, 0.45, 0.3, 0.35, 0.6]
  ));
}

// KO：戏剧性低频轰鸣 + 高冲击裂纹
function renderKO(sr: number): Float32Array {
  const dur = 0.8;
  // 主锯齿波 — 大幅下降
  const main = renderOsc(sr, dur, 'sawtooth', t => 200 - 250 * t, t => expDecay(t, 0.45, 3.5));
  // 宽频噪声 — 冲击质感
  const noise = renderNoise(sr, 0.5, t => expDecay(t, 0.25, 5));
  // 子低音隆隆声 — 身体可感知
  const sub = renderOsc(sr, 0.65, 'sine', t => 50 - 60 * t, t => expDecay(t, 0.4, 2.8));
  // 金属质感回响 — 延迟0.1s
  const ring = renderOsc(sr, 0.5, 'triangle', t => t < 0.01 ? 1800 : 1800 - 3500 * (t - 0.01), t => t < 0.08 ? 0.07 : expDecay(t - 0.08, 0.06, 7));
  // 高冲击裂纹 — 瞬态
  const crack = renderOsc(sr, 0.04, 'square', t => 4000 - 80000 * t, t => expDecay(t, 0.2, 40));
  // 二次冲击 — 延迟0.08s
  const impact2 = renderOsc(sr, 0.15, 'sine', t => 300 - 2000 * t, t => expDecay(t, 0.3, 8));
  // 低频余震
  const rumble = renderOsc(sr, 0.5, 'sine', t => 35 - 30 * t, t => t < 0.15 ? 0 : expDecay(t - 0.15, 0.15, 2));

  const total = Math.ceil(sr * dur);
  const noiseP = padTo(noise, total);
  const ringP = padTo(ring, total, Math.floor(sr * 0.1));
  const crackP = padTo(crack, total);
  const impact2P = padTo(impact2, total, Math.floor(sr * 0.08));
  const rumbleP = padTo(rumble, total, Math.floor(sr * 0.2));

  return normalize(mixLayers(
    [main, noiseP, sub, ringP, crackP, impact2P, rumbleP],
    [1, 0.5, 1.2, 0.25, 0.35, 0.5, 0.7]
  ));
}

// Counter：尖锐裂纹 + 延迟回声
function renderCounter(sr: number): Float32Array {
  const dur = 0.25;
  // 尖锐方波瞬态
  const osc1 = renderOsc(sr, 0.08, 'square',
    t => t < 0.02 ? 1800 : 2200,
    t => expDecay(t, 0.18, 22));
  // 锯齿波裂纹 — 延迟0.05s
  const osc2 = renderOsc(sr, 0.1, 'sawtooth',
    t => 2500 - 28000 * t,
    t => expDecay(t, 0.12, 18));
  // 回声层 — 延迟0.1s，衰减
  const echo = renderOsc(sr, 0.08, 'triangle',
    t => 1500 - 10000 * t,
    t => expDecay(t, 0.08, 25));
  // 高频闪亮感
  const sparkle = renderOsc(sr, 0.04, 'sine',
    t => 4000 - 30000 * t,
    t => expDecay(t, 0.06, 40));
  // 噪声层 — 尖锐打击感
  const noiseHit = highPass(renderNoise(sr, 0.05, t => expDecay(t, 0.15, 30)), sr, 5000);

  const total = Math.ceil(sr * dur);
  const osc2P = padTo(osc2, total, Math.floor(sr * 0.05));
  const echoP = padTo(echo, total, Math.floor(sr * 0.12));
  const sparkleP = padTo(sparkle, total, Math.floor(sr * 0.03));
  const noiseP = padTo(noiseHit, total);
  const osc1P = padTo(osc1, total);

  return normalize(mixLayers(
    [osc1P, osc2P, echoP, sparkleP, noiseP],
    [1, 0.7, 0.4, 0.3, 0.5]
  ));
}

function renderGuardCrush(sr: number): Float32Array {
  const dur = 0.2;
  const noise = highPass(renderNoise(sr, dur, t => expDecay(t, 0.35, 9)), sr, 1500);
  const crunch = renderOsc(sr, dur, 'square', t => 300 - 2200 * t, t => expDecay(t, 0.35, 10));
  const ring = renderOsc(sr, 0.14, 'sine', t => 2000 - 12000 * t, t => expDecay(t, 0.09, 13));
  const crack = renderOsc(sr, 0.05, 'sawtooth', t => 3500 - 70000 * t, t => expDecay(t, 0.17, 35));
  // 碎片散落质感
  const debris = highPass(renderNoise(sr, 0.08, t => t < 0.01 ? 0 : expDecay(t - 0.01, 0.1, 18)), sr, 3000);
  const ringP = padTo(ring, Math.ceil(sr * dur));
  const debrisP = padTo(debris, Math.ceil(sr * dur), Math.floor(sr * 0.04));
  return normalize(mixLayers([noise, crunch, ringP, crack, debrisP], [1, 1, 0.3, 0.5, 0.35]));
}

function renderChip(sr: number): Float32Array {
  const dur = 0.05;
  const noise = highPass(renderNoise(sr, dur, t => expDecay(t, 0.12, 30)), sr, 3000);
  const osc = renderOsc(sr, dur, 'triangle', _t => 800, t => expDecay(t, 0.06, 40));
  return normalize(mixLayers([noise, osc], [1, 0.5]));
}

function renderWallBounce(sr: number): Float32Array {
  const dur = 0.18;
  const metal = renderOsc(sr, dur, 'square', t => 600 - 4000 * t, t => expDecay(t, 0.22, 10));
  const noise = bandPass(renderNoise(sr, 0.12, t => expDecay(t, 0.14, 12)), sr, 1000, 4000);
  const debris = highPass(renderNoise(sr, 0.05, t => t < 0.003 ? 0 : expDecay(t - 0.003, 0.1, 22)), sr, 3000);
  // 金属回声
  const echo = renderOsc(sr, 0.08, 'sine', t => 800 - 5000 * t, t => expDecay(t, 0.06, 18));
  const noiseP = padTo(noise, Math.ceil(sr * dur));
  const debrisP = padTo(debris, Math.ceil(sr * dur), Math.floor(sr * 0.03));
  const echoP = padTo(echo, Math.ceil(sr * dur), Math.floor(sr * 0.06));
  return normalize(mixLayers([metal, noiseP, debrisP, echoP], [1, 0.6, 0.4, 0.3]));
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
  const dur = isSDM ? 0.5 : 0.38;
  const osc = renderOsc(sr, dur, 'sawtooth',
    t => t < 0.12 ? 300 + 14000 * t : t < 0.25 ? 2000 - 10000 * (t - 0.12) : 600,
    t => t < 0.1 ? (isSDM ? 0.22 : 0.16) + t * 2 : expDecay(t - 0.1, isSDM ? 0.38 : 0.27, isSDM ? 4.5 : 6.5));
  const shimmer = highPass(renderNoise(sr, isSDM ? 0.22 : 0.18, t => expDecay(t, isSDM ? 0.15 : 0.09, 9)), sr, 4000);
  const shimmerP = padTo(shimmer, Math.ceil(sr * dur));
  const layers = [osc, shimmerP];
  const gains = [1, 0.4];
  if (isSDM) {
    const chime = renderOsc(sr, 0.35, 'sine',
      t => t < 0.05 ? 880 : t < 0.15 ? 880 + 8800 * (t - 0.05) : 1760 - 4000 * (t - 0.15),
      t => t < 0.05 ? 0 : expDecay(t - 0.05, 0.1, 6));
    const chimeP = padTo(chime, Math.ceil(sr * dur), Math.floor(sr * 0.05));
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

// === 新增音效 ===

// 暴击：尖锐 + 共鸣 + 双层噪声
function renderHitCrit(sr: number): Float32Array {
  const dur = 0.2;
  // 高频裂纹瞬态
  const crack = renderOsc(sr, 0.04, 'square', t => 5000 - 100000 * t, t => expDecay(t, 0.25, 45));
  // 中频共鸣 — 持续较久
  const resonance = renderOsc(sr, dur, 'sine',
    t => 600 - 2000 * t,
    t => expDecay(t, 0.3, 8));
  // 低频冲击层
  const body = renderOsc(sr, dur, 'sine', t => 80 - 600 * t, t => expDecay(t, 0.5, 7));
  // 子低音 — 可感知的深度冲击
  const sub = renderOsc(sr, 0.3, 'sine', t => 45 - 60 * t, t => expDecay(t, 0.35, 4));
  // 宽频噪声 — 冲击纹理
  const noiseWide = bandPass(renderNoise(sr, dur, t => expDecay(t, 0.35, 10)), sr, 400, 4000);
  // 高频噪声 — 空气冲击
  const noiseHi = highPass(renderNoise(sr, 0.08, t => expDecay(t, 0.15, 20)), sr, 5000);
  // 金属泛音
  const metal = renderOsc(sr, 0.1, 'triangle', t => 2500 - 20000 * t, t => expDecay(t, 0.07, 18));

  const total = Math.ceil(sr * dur);
  const crackP = padTo(crack, total);
  const noiseHiP = padTo(noiseHi, total);
  const metalP = padTo(metal, total);
  const subP = padTo(sub, Math.ceil(sr * 0.3));

  // 混合时sub和total不同长度，取max
  const maxLen = Math.max(total, subP.length);
  const allLayers = [crackP, resonance, body, subP, noiseWide, noiseHiP, metalP];
  // 补齐所有层到maxLen
  const padded = allLayers.map(l => {
    if (l.length >= maxLen) return l;
    const p = new Float32Array(maxLen);
    p.set(l);
    return p;
  });
  return normalize(mixLayers(padded, [0.6, 1, 1.3, 1, 0.8, 0.3, 0.2]));
}

// 灰尘/地面喷射声
function renderDust(sr: number): Float32Array {
  const dur = 0.12;
  // 低通噪声 — 柔和的空气喷射
  const noiseLo = lowPass(renderNoise(sr, dur, t => expDecay(t, 0.08, 18)), sr, 1200);
  // 中频噪声 — 颗粒感
  const noiseMid = bandPass(renderNoise(sr, dur * 0.6, t => expDecay(t, 0.06, 25)), sr, 800, 2500);
  // 低频体感
  const thud = renderOsc(sr, dur * 0.5, 'sine', t => 100 - 1500 * t, t => expDecay(t, 0.1, 30));

  const total = Math.ceil(sr * dur);
  const noiseMidP = padTo(noiseMid, total);
  const thudP = padTo(thud, total);
  return normalize(mixLayers([noiseLo, noiseMidP, thudP], [1, 0.6, 0.7]));
}

// 空中打击：轻盈 + 更多呼啸感
function renderAirHit(sr: number): Float32Array {
  const dur = 0.07;
  // 高频噪声 — 空气切割感
  const noiseHi = highPass(renderNoise(sr, dur, t => expDecay(t, 0.18, 30)), sr, 2000);
  // 中频呼啸
  const swoosh = renderOsc(sr, dur, 'sawtooth', t => 300 - 5000 * t, t => expDecay(t, 0.12, 35));
  // 轻体感
  const body = renderOsc(sr, dur, 'sine', t => 200 - 3000 * t, t => expDecay(t, 0.15, 30));
  // 高频瞬态 — 轻盈打击
  const snap = renderOsc(sr, dur * 0.4, 'triangle', t => 1500 - 20000 * t, t => expDecay(t, 0.1, 45));
  const snapP = padTo(snap, Math.ceil(sr * dur));
  return normalize(mixLayers([noiseHi, swoosh, body, snapP], [1, 0.5, 0.6, 0.4]));
}

// 强力壁弹：金属撞击 + 碎片 + 剧烈低频
function renderWallBounceHeavy(sr: number): Float32Array {
  const dur = 0.3;
  // 强金属撞击
  const metal = renderOsc(sr, dur, 'square', t => 800 - 5000 * t, t => expDecay(t, 0.3, 7));
  // 子低音冲击
  const sub = renderOsc(sr, 0.25, 'sine', t => 60 - 100 * t, t => expDecay(t, 0.4, 4));
  // 宽频噪声
  const noise = bandPass(renderNoise(sr, 0.2, t => expDecay(t, 0.25, 6)), sr, 500, 5000);
  // 高频碎片
  const debris = highPass(renderNoise(sr, 0.08, t => t < 0.005 ? 0 : expDecay(t - 0.005, 0.12, 15)), sr, 4000);
  // 金属回响 — 延迟
  const echo = renderOsc(sr, 0.12, 'sine', t => 1000 - 6000 * t, t => expDecay(t, 0.08, 12));
  // 二次碎片 — 延迟0.1s
  const debris2 = highPass(renderNoise(sr, 0.06, t => expDecay(t, 0.08, 20)), sr, 5000);

  const total = Math.ceil(sr * dur);
  const debrisP = padTo(debris, total, Math.floor(sr * 0.02));
  const echoP = padTo(echo, total, Math.floor(sr * 0.08));
  const debris2P = padTo(debris2, total, Math.floor(sr * 0.12));

  return normalize(mixLayers(
    [metal, sub, noise, debrisP, echoP, debris2P],
    [1, 1, 0.8, 0.5, 0.35, 0.3]
  ));
}

// 防御崩坏：碎裂 + 能量释放
function renderGuardBreak(sr: number): Float32Array {
  const dur = 0.3;
  // 尖锐裂纹 — 初始破裂
  const crack = renderOsc(sr, 0.04, 'sawtooth', t => 5000 - 100000 * t, t => expDecay(t, 0.2, 40));
  // 碎裂噪声
  const shatter = highPass(renderNoise(sr, 0.15, t => expDecay(t, 0.3, 8)), sr, 1500);
  // 低频冲击
  const impact = renderOsc(sr, 0.2, 'sine', t => 120 - 800 * t, t => expDecay(t, 0.35, 8));
  // 能量释放上升音 — 延迟0.05s
  const release = renderOsc(sr, 0.12, 'sawtooth', t => 200 + 12000 * t, t => expDecay(t, 0.12, 10));
  // 碎片散落 — 延迟0.08s
  const debris = highPass(renderNoise(sr, 0.1, t => t < 0.01 ? 0 : expDecay(t - 0.01, 0.1, 15)), sr, 3000);
  // 金属残余共振
  const ring = renderOsc(sr, 0.2, 'triangle', t => 1500 - 5000 * t, t => expDecay(t, 0.08, 10));

  const total = Math.ceil(sr * dur);
  const crackP = padTo(crack, total);
  const releaseP = padTo(release, total, Math.floor(sr * 0.05));
  const debrisP = padTo(debris, total, Math.floor(sr * 0.08));
  const ringP = padTo(ring, total, Math.floor(sr * 0.06));

  return normalize(mixLayers(
    [crackP, shatter, impact, releaseP, debrisP, ringP],
    [0.6, 1, 1.2, 0.5, 0.4, 0.3]
  ));
}

// 气槽充能：能量上升 + 脉冲感
function renderChargeUp(sr: number): Float32Array {
  const dur = 0.4;
  // 上升正弦波 — 能量蓄积
  const rise = renderOsc(sr, dur, 'sine', t => 100 + 4000 * t, t => {
    // 脉冲调制：每0.05s一个脉冲
    const pulse = 0.15 + 0.05 * Math.sin(t * 80);
    return pulse * expDecay(t, 1, 2);
  });
  // 中频锯齿波 — 能量质感
  const energy = renderOsc(sr, dur, 'sawtooth', t => 150 + 3000 * t, t => expDecay(t, 0.1, 4));
  // 高频闪烁 — 火花质感
  const sparkle = highPass(renderNoise(sr, dur, t => expDecay(t, 0.08, 5)), sr, 6000);
  // 低频隆隆声 — 能量深度
  const rumble = renderOsc(sr, dur, 'sine', t => 50 + 500 * t, t => expDecay(t, 0.2, 3));

  const total = Math.ceil(sr * dur);
  const sparkleP = padTo(sparkle, total);

  return normalize(mixLayers(
    [rise, energy, sparkleP, rumble],
    [1, 0.4, 0.3, 0.6]
  ));
}


// 必杀技防御：在block基础上增加能量散射噪声层
function renderBlockSpecial(sr: number): Float32Array {
  const dur = 0.14;
  const metal = renderOsc(sr, dur, 'square', t => 1000 - 6000 * t, t => expDecay(t, 0.18, 15));
  const res = renderOsc(sr, dur, 'sine', t => 2000 - 2500 * t, t => expDecay(t, 0.07, 22));
  const noise = highPass(renderNoise(sr, dur, t => expDecay(t, 0.15, 20)), sr, 2500);
  const scatterNoise = highPass(renderNoise(sr, dur * 0.8, t => expDecay(t, 0.12, 16)), sr, 4000);
  const scatterSine = renderOsc(sr, dur * 0.6, 'sine', t => 600 - 4000 * t, t => expDecay(t, 0.15, 18));
  const scatterNoiseP = padTo(scatterNoise, Math.ceil(sr * dur));
  const scatterSineP = padTo(scatterSine, Math.ceil(sr * dur));
  return normalize(mixLayers([metal, res, noise, scatterNoiseP, scatterSineP], [1, 0.35, 0.6, 0.5, 0.45]));
}

// DM防御：在block_heavy基础上增加子低音冲击 + 宽频爆发噪声
function renderBlockDM(sr: number): Float32Array {
  const dur = 0.25;
  const metal = renderOsc(sr, dur, 'square', t => 900 - 5400 * t, t => expDecay(t, 0.2, 10));
  const res = renderOsc(sr, dur, 'sine', t => 2200 - 3000 * t, t => expDecay(t, 0.08, 16));
  const noise = highPass(renderNoise(sr, dur, t => expDecay(t, 0.2, 14)), sr, 2000);
  const res2 = renderOsc(sr, dur * 0.6, 'triangle', t => 3500 - 15000 * t, t => expDecay(t, 0.04, 18));
  const res2P = padTo(res2, Math.ceil(sr * dur));
  const lo = renderOsc(sr, dur * 0.8, 'sine', t => 150 - 1000 * t, t => expDecay(t, 0.14, 10));
  const tail = renderOsc(sr, dur, 'sine', _t => 800, t => expDecay(t, 0.05, 10));
  const tailP = padTo(tail, Math.ceil(sr * dur), Math.floor(sr * 0.05));
  const subImpact = renderOsc(sr, 0.2, 'sine', t => 45 - 30 * t, t => expDecay(t, 0.4, 5));
  const subImpactP = padTo(subImpact, Math.ceil(sr * dur));
  const burstNoise = renderNoise(sr, 0.1, t => expDecay(t, 0.3, 10));
  const burstNoiseP = padTo(burstNoise, Math.ceil(sr * dur), Math.floor(sr * 0.03));
  return normalize(mixLayers([metal, res, noise, res2P, lo, tailP, subImpactP, burstNoiseP], [1, 0.4, 0.8, 0.15, 0.8, 0.2, 1.2, 0.6]));
}

// 弱必杀命中：更轻更短的必杀技音效
function renderSpecialLight(sr: number): Float32Array {
  const dur = 0.22;
  const sweep = renderOsc(sr, 0.08, 'sawtooth', t => 200 + 8000 * t, t => expDecay(t, 0.15, 20));
  const noiseBp = bandPass(renderNoise(sr, 0.12, t => expDecay(t, 0.12, 12)), sr, 500, 2500);
  const metal = renderOsc(sr, 0.06, 'triangle', _t => 2000, t => expDecay(t, 0.08, 25));
  const impact = renderOsc(sr, 0.1, 'sine', t => 120 - 800 * t, t => expDecay(t, 0.2, 15));
  const total = Math.ceil(sr * dur);
  const sweepP = padTo(sweep, total);
  const noiseBpP = padTo(noiseBp, total);
  const metalP = padTo(metal, total, Math.floor(sr * 0.02));
  const impactP = padTo(impact, total, Math.floor(sr * 0.04));
  return normalize(mixLayers([sweepP, noiseBpP, metalP, impactP], [0.8, 1, 0.45, 0.7]));
}

// 强必杀命中：在renderSpecial基础上增加子低音层
function renderSpecialHeavy(sr: number): Float32Array {
  const dur = 0.35;
  const whoosh = renderOsc(sr, dur, 'sawtooth',
    t => t < 0.1 ? 200 + 8000 * t : 1000 - 3500 * (t - 0.1),
    t => t < 0.1 ? 0.15 + t * 0.8 : expDecay(t - 0.1, 0.25, 7));
  const noiseMid = bandPass(renderNoise(sr, dur * 0.7, t => expDecay(t, 0.14, 8)), sr, 400, 3500);
  const noiseHi = highPass(renderNoise(sr, dur * 0.4, t => expDecay(t, 0.1, 12)), sr, 4000);
  const metal = renderOsc(sr, 0.08, 'triangle', t => 2400 - 28000 * t, t => expDecay(t, 0.09, 30));
  const impact = renderOsc(sr, 0.15, 'sine', t => 120 - 1000 * t, t => expDecay(t, 0.3, 12));
  const sub = renderOsc(sr, 0.2, 'sine', t => 50 - 40 * t, t => expDecay(t, 0.35, 4));
  const total = Math.ceil(sr * dur);
  const nMidP = padTo(noiseMid, total);
  const nHiP = padTo(noiseHi, total);
  const metalP = padTo(metal, total);
  const impactP = padTo(impact, total, Math.floor(sr * 0.06));
  const subP = padTo(sub, total);
  return normalize(mixLayers([whoosh, nMidP, nHiP, metalP, impactP, subP], [1, 0.6, 0.3, 0.5, 0.7, 1.0]));
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
    // 新增音效
    ['hit_crit', renderHitCrit],
    ['dust', renderDust],
    ['air_hit', renderAirHit],
    ['wall_bounce_heavy', renderWallBounceHeavy],
    ['guard_break', renderGuardBreak],
    ['charge_up', renderChargeUp],
    // 打击音效分层
    ['block_special', renderBlockSpecial],
    ['block_dm', renderBlockDM],
    ['special_light', renderSpecialLight],
    ['special_heavy', renderSpecialHeavy],
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

// 新增音效公开API
export function playCritHit(): void { initSampler(); play('hit_crit'); }
export function playDust(): void { initSampler(); play('dust', 0.5); }
export function playAirHit(): void { initSampler(); play('air_hit', 0.8); }
export function playWallBounceHeavy(): void { initSampler(); play('wall_bounce_heavy'); }
export function playGuardBreak(): void { initSampler(); play('guard_break'); }
export function playChargeUp(): void { initSampler(); play('charge_up', 0.6); }

// 打击音效分层公开API
export function playBlockSpecial(): void { initSampler(); play('block_special'); }
export function playBlockDM(): void { initSampler(); play('block_dm'); }
export function playSpecialLight(): void { initSampler(); play('special_light'); }
export function playSpecialHeavy(): void { initSampler(); play('special_heavy'); }
