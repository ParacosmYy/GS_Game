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
  | 'super_flash' | 'super_flash_sdm' | 'super_flash_hsdm'
  | 'throw' | 'throw_escape' | 'select' | 'victory'
  | 'roll' | 'landing' | 'projectile' | 'max_activation'
  | 'round_call' | 'time_over' | 'perfect' | 'fight'
  | 'quick_stand' | 'step'
  | 'hit_crit' | 'dust' | 'air_hit' | 'wall_bounce_heavy'
  | 'guard_break' | 'charge_up'
  | 'block_special' | 'block_dm' | 'special_light' | 'special_heavy'
  | 'ko_hit' | 'landing_heavy'
  | 'accent_fire' | 'accent_purple' | 'accent_ice' | 'accent_generic'
  | 'dizzy_hit' | 'ground_bounce'
  | 'perfect_ko' | 'round_start' | 'time_up'
  | 'battle_bgm'
  | 'whoosh' | 'whoosh_heavy' | 'footstep' | 'jump' | 'landing_normal'
  | 'ryo_koouken' | 'ryo_ko_hou' | 'ryo_hien' | 'ryo_haou'
  | 'ryo_tsurizao' | 'ryo_orishi'
  | 'ryo_hio_hacker' | 'ryo_zanretsu_ken';

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
  // Use the maximum length among all layers to avoid reading out-of-bounds
  // (Float32Array out-of-bounds returns undefined, which produces NaN in arithmetic)
  let len = 0;
  for (let l = 0; l < layers.length; l++) {
    if (layers[l].length > len) len = layers[l].length;
  }
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    let v = 0;
    for (let l = 0; l < layers.length; l++) {
      if (i < layers[l].length) {
        v += layers[l][i] * gains[l];
      }
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
  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    if (Number.isFinite(v)) peak = Math.max(peak, Math.abs(v));
  }
  if (peak < 0.001) return data;
  const scale = 0.95 / peak;
  const out = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    out[i] = Number.isFinite(v) ? clamp(v * scale) : 0;
  }
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

// 轻击：短促清脆，快速衰减 — A/B按钮打击感
// v2: 增加短促高频成分，更像拳击手套击打的"啪"声
function renderHitLight(sr: number): Float32Array {
  const dur = 0.075;
  // 中频噪声 — 紧凑肉体冲击
  const noiseMid = bandPass(renderNoise(sr, dur, t => expDecay(t, 0.45, 35)), sr, 900, 3500);
  // 高频噪声 — 快速衰减的空气噼啪感
  const noiseHi = bandPass(renderNoise(sr, dur, t => expDecay(t, 0.22, 45)), sr, 3500, 9000);
  // 低频体感 — 短促的拳肉接触低频
  const body = renderOsc(sr, dur, 'sine', t => 200 - 3500 * t, t => expDecay(t, 0.38, 32));
  // 高频打击瞬态 — 清脆起手
  const snap = renderOsc(sr, dur * 0.45, 'triangle', t => 1400 - 22000 * t, t => expDecay(t, 0.2, 65));
  // 中频共鸣 — 更快衰减
  const mid = renderOsc(sr, dur * 0.5, 'sine', t => 450 - 5500 * t, t => expDecay(t, 0.12, 38));
  // === v2新增 ===
  // 超高频手套击打瞬态 — 7000-12000Hz的极短"啪"声，模拟拳击手套皮革击打
  const gloveSlap = bandPass(renderNoise(sr, 0.02, t => expDecay(t, 0.3, 60)), sr, 7000, 12000);
  // 高频脆响三角波 — 拳击手套特有的清脆回弹
  const clickOsc = renderOsc(sr, 0.015, 'triangle', t => 6000 - 80000 * t, t => expDecay(t, 0.18, 80));
  // 中高频"呼吸"层 — 手套击打的空气挤出感
  const airPop = highPass(renderNoise(sr, 0.025, t => expDecay(t, 0.15, 55)), sr, 5000);

  const total = Math.ceil(sr * dur);
  const snapP = padTo(snap, total);
  const midP = padTo(mid, total);
  const gloveSlapP = padTo(gloveSlap, total);
  const clickP = padTo(clickOsc, total);
  const airPopP = padTo(airPop, total);

  return normalize(mixLayers(
    [noiseMid, noiseHi, body, snapP, midP, gloveSlapP, clickP, airPopP],
    [1, 0.55, 0.7, 0.55, 0.3, 0.7, 0.5, 0.35]
  ));
}

// 重击：更深更重，更多低频，更长衰减 — C/D按钮打击感
// v2: 增加低频body impact感，更深的拳头穿透质感
function renderHitHeavy(sr: number): Float32Array {
  const dur = 0.25;
  // 低频噪声带 — 深沉肉体冲击
  const noiseMid = bandPass(renderNoise(sr, dur, t => expDecay(t, 0.5, 8)), sr, 250, 1800);
  // 高频噪声 — 空气爆裂
  const noiseHi = highPass(renderNoise(sr, dur * 0.5, t => expDecay(t, 0.18, 18)), sr, 3000);
  // 低频体感 — 更深的低频
  const body = renderOsc(sr, dur, 'sine', t => 80 - 500 * t, t => expDecay(t, 0.6, 8));
  // 子低音隆隆声 — 更强的低频深度
  const sub = renderOsc(sr, dur * 1.2, 'sine', t => 45 - 60 * t, t => expDecay(t, 0.45, 4.5));
  // 裂纹瞬态
  const crack = renderOsc(sr, dur * 0.25, 'triangle', t => 450 - 12000 * t, t => expDecay(t, 0.35, 30));
  // 金属泛音 — 更明显的金属质感
  const metal = renderOsc(sr, dur * 0.4, 'sine', t => 1600 - 25000 * t, t => expDecay(t, 0.07, 18));
  // 谐波层 — 加厚冲击感
  const harm = renderOsc(sr, dur * 0.35, 'sawtooth', t => 700 - 9000 * t, t => expDecay(t, 0.12, 18));
  // 高频瞬态
  const hi = renderOsc(sr, 0.025, 'square', t => 2200 - 55000 * t, t => expDecay(t, 0.09, 65));
  // 50-120Hz权重层 — 可感知的打击深度
  const weight = renderOsc(sr, dur * 0.8, 'sine', t => 90 - 100 * t, t => expDecay(t, 0.5, 5));
  // === v2新增：低频body impact层 ===
  // 深层body冲击 — 60-90Hz的"穿透"感，模拟拳头深入躯体的低频反馈
  const bodyImpact = renderOsc(sr, 0.18, 'sine', t => 70 - 80 * t, t => expDecay(t, 0.55, 5));
  // 中低频冲击共鸣 — 躯体共振的"闷响"
  const chestThud = bandPass(renderNoise(sr, 0.12, t => expDecay(t, 0.4, 10)), sr, 120, 500);
  // 低频二次脉冲 — 击打后的"余震"
  const aftershock = renderOsc(sr, 0.2, 'sine', t => 55 - 45 * t, t => t < 0.02 ? 0 : expDecay(t - 0.02, 0.35, 4));

  const total = Math.ceil(sr * dur);
  const crackP = padTo(crack, total);
  const metalP = padTo(metal, total);
  const harmP = padTo(harm, total);
  const hiP = padTo(hi, total);
  const weightP = padTo(weight, total);
  const bodyImpactP = padTo(bodyImpact, total);
  const chestThudP = padTo(chestThud, total);
  const aftershockP = padTo(aftershock, total, Math.floor(sr * 0.04));

  return normalize(mixLayers(
    [noiseMid, noiseHi, body, sub, crackP, metalP, harmP, hiP, weightP, bodyImpactP, chestThudP, aftershockP],
    [1, 0.35, 1.3, 1.0, 0.65, 0.3, 0.35, 0.22, 0.9, 1.1, 0.8, 0.7]
  ));
}

function renderBlock(sr: number, heavy: boolean): Float32Array {
  const dur = heavy ? 0.18 : 0.1;
  const baseF = heavy ? 850 : 1050;
  // 金属方波主体 — 更高截止模拟沉闷感
  const metal = renderOsc(sr, dur, 'square', t => baseF - baseF * 6 * t, t => expDecay(t, 0.18, heavy ? 12 : 18));
  // 共鸣泛音
  const res = renderOsc(sr, dur, 'sine', t => 2200 - 3000 * t, t => expDecay(t, 0.07, heavy ? 18 : 25));
  // 高频噪声 — 更高截止的沉闷冲击
  const noise = highPass(renderNoise(sr, dur, t => expDecay(t, heavy ? 0.22 : 0.13, heavy ? 16 : 26)), sr, heavy ? 1800 : 2200);
  // 中低频沉闷层 — 填充"木闷"质感
  const thud = bandPass(renderNoise(sr, dur, t => expDecay(t, heavy ? 0.25 : 0.15, heavy ? 10 : 16)), sr, 300, 1200);
  // 二次泛音
  const res2 = renderOsc(sr, dur * 0.7, 'triangle', t => 3500 - 15000 * t, t => expDecay(t, 0.04, 20));
  const res2P = padTo(res2, Math.ceil(sr * dur));
  const layers = [metal, res, noise, thud, res2P];
  const gains: number[] = [1, 0.4, heavy ? 0.7 : 0.45, heavy ? 0.6 : 0.35, 0.15];

  if (!heavy) {
    // 轻防御新增：金属碰击高频瞬态 — 模拟手套碰防御壁的清脆"叮"声
    const metalPing = renderOsc(sr, 0.025, 'triangle', t => 3500 - 60000 * t, t => expDecay(t, 0.15, 55));
    const metalPingP = padTo(metalPing, Math.ceil(sr * dur));
    // 高频噪声瞬态 — 手套皮革碰壁的空气挤压
    const airBurst = bandPass(renderNoise(sr, 0.018, t => expDecay(t, 0.2, 60)), sr, 6000, 11000);
    const airBurstP = padTo(airBurst, Math.ceil(sr * dur));
    layers.push(metalPingP, airBurstP);
    gains.push(0.5, 0.4);
  }

  if (heavy) {
    const lo = renderOsc(sr, 0.14, 'sine', t => 150 - 1000 * t, t => expDecay(t, 0.14, 12));
    const tail = renderOsc(sr, 0.2, 'sine', _t => 800, t => expDecay(t, 0.05, 12));
    const tailP = padTo(tail, Math.ceil(sr * dur), Math.floor(sr * 0.05));
    layers.push(lo, tailP);
    gains.push(0.8, 0.2);
    // 重防御新增：80Hz低频共振层 — 更深的冲击感
    const deepResonance = renderOsc(sr, 0.15, 'sine', t => 80 - 40 * t, t => expDecay(t, 0.3, 6));
    const deepResonanceP = padTo(deepResonance, Math.ceil(sr * dur));
    // 低频共鸣噪声 — 80-200Hz区间，模拟防御壁震动
    const resonanceNoise = bandPass(renderNoise(sr, 0.12, t => expDecay(t, 0.2, 10)), sr, 80, 200);
    const resonanceNoiseP = padTo(resonanceNoise, Math.ceil(sr * dur));
    layers.push(deepResonanceP, resonanceNoiseP);
    gains.push(1.0, 0.7);
  }
  return normalize(mixLayers(layers, gains));
}

// 必杀技：蓄能呼啸 + 冲击 + 更强金属质感 + 贝斯层
function renderSpecial(sr: number): Float32Array {
  const dur = 0.3;
  // 能量蓄积呼啸
  const whoosh = renderOsc(sr, dur, 'sawtooth',
    t => t < 0.1 ? 200 + 8000 * t : 1000 - 3500 * (t - 0.1),
    t => t < 0.1 ? 0.15 + t * 0.8 : expDecay(t - 0.1, 0.25, 7));
  // 中频噪声带 — 能量质感
  const noiseMid = bandPass(renderNoise(sr, dur * 0.7, t => expDecay(t, 0.14, 8)), sr, 400, 3500);
  // 高频噪声 — 空气撕裂感
  const noiseHi = highPass(renderNoise(sr, dur * 0.4, t => expDecay(t, 0.1, 12)), sr, 4000);
  // 金属瞬态 — 更强的金属质感 + 延音
  const metal = renderOsc(sr, 0.12, 'triangle', t => 2600 - 30000 * t, t => expDecay(t, 0.1, 22));
  // 低频冲击波
  const impact = renderOsc(sr, 0.15, 'sine', t => 120 - 1000 * t, t => expDecay(t, 0.3, 12));
  // 贝斯层 — 50-120Hz深度
  const bass = renderOsc(sr, 0.2, 'sine', t => 70 - 80 * t, t => expDecay(t, 0.35, 5));
  // 金属泛音 — 延迟0.04s
  const metalHarmonic = renderOsc(sr, 0.06, 'sine', t => 5000 - 40000 * t, t => expDecay(t, 0.05, 25));
  const nMidP = padTo(noiseMid, Math.ceil(sr * dur));
  const nHiP = padTo(noiseHi, Math.ceil(sr * dur));
  const metalP = padTo(metal, Math.ceil(sr * dur));
  const impactP = padTo(impact, Math.ceil(sr * dur), Math.floor(sr * 0.06));
  const bassP = padTo(bass, Math.ceil(sr * dur), Math.floor(sr * 0.03));
  const metalHP = padTo(metalHarmonic, Math.ceil(sr * dur), Math.floor(sr * 0.04));
  return normalize(mixLayers([whoosh, nMidP, nHiP, metalP, impactP, bassP, metalHP], [1, 0.6, 0.3, 0.6, 0.7, 0.8, 0.25]));
}

// DM：爆炸分层 — 噪声爆发 + 低音爆炸 + 高频噼啪声
// v2: 增加持续时间，更戏剧化的能量爆发
function renderDM(sr: number): Float32Array {
  const dur = 0.85;
  // 低频扫频 — 能量蓄积
  const bass = renderOsc(sr, dur, 'sawtooth', t => 80 - 150 * t, t => expDecay(t, 0.35, 3.5));
  // 中频方波 — 攻击性质感
  const mid = renderOsc(sr, 0.28, 'square', t => 1200 - 5000 * t, t => expDecay(t, 0.16, 6));
  // 宽频噪声 — 主爆炸冲击波
  const noise = bandPass(renderNoise(sr, 0.35, t => expDecay(t, 0.45, 4)), sr, 200, 3500);
  // 子低音层 — 身体可感知的低频爆炸
  const sub = renderOsc(sr, 0.55, 'sine', t => 50 - 100 * t, t => expDecay(t, 0.5, 2.5));
  // 二次爆发 — 延迟0.1s
  const burst = highPass(renderNoise(sr, 0.14, t => t < 0.001 ? 0 : expDecay(t - 0.001, 0.2, 10)), sr, 2000);
  // 高频碎裂/噼啪声 — 延迟0.15s
  const shatter = renderOsc(sr, 0.1, 'sawtooth', t => 3500 - 40000 * t, t => expDecay(t, 0.12, 22));
  // 能量上升音
  const rise = renderOsc(sr, 0.14, 'sine', t => 200 + 16000 * t, t => expDecay(t, 0.13, 7));
  // 冲击波尾音 — 低频余震
  const aftershock = renderOsc(sr, 0.35, 'sine', t => 35 - 40 * t, t => t < 0.02 ? 0 : expDecay(t - 0.02, 0.22, 2.5));
  // 额外高频噼啪层 — DM特征性的高频"炸裂"感
  const crackLayer = highPass(renderNoise(sr, 0.08, t => t < 0.002 ? 0 : expDecay(t - 0.002, 0.25, 15)), sr, 6000);
  // 低频轰隆爆炸层
  const boom = renderOsc(sr, 0.3, 'sine', t => 40 - 50 * t, t => expDecay(t, 0.55, 2));

  const total = Math.ceil(sr * dur);
  const midP = padTo(mid, total);
  const noiseP = padTo(noise, total);
  const burstP = padTo(burst, total, Math.floor(sr * 0.1));
  const shatterP = padTo(shatter, total, Math.floor(sr * 0.15));
  const riseP = padTo(rise, total);
  const aftershockP = padTo(aftershock, total, Math.floor(sr * 0.25));
  const crackP = padTo(crackLayer, total, Math.floor(sr * 0.04));
  const boomP = padTo(boom, total);

  return normalize(mixLayers(
    [bass, midP, noiseP, sub, burstP, shatterP, riseP, aftershockP, crackP, boomP],
    [1, 0.4, 1, 1.3, 0.5, 0.35, 0.35, 0.65, 0.3, 1.1]
  ));
}

// KO：扩展低频轰鸣 + 巨大冲击 + 双重爆炸层
// v3: 添加初始爆裂+延迟余震双重爆炸层
function renderKO(sr: number): Float32Array {
  const dur = 1.2;
  // 主锯齿波 — 大幅下降
  const main = renderOsc(sr, dur, 'sawtooth', t => 200 - 200 * t, t => expDecay(t, 0.5, 3));
  // 宽频噪声 — 冲击质感
  const noise = renderNoise(sr, 0.6, t => expDecay(t, 0.28, 4));
  // 子低音隆隆声 — 更长更深
  const sub = renderOsc(sr, 0.8, 'sine', t => 40 - 40 * t, t => expDecay(t, 0.45, 2.2));
  // 金属质感回响 — 延迟0.1s
  const ring = renderOsc(sr, 0.6, 'triangle', t => t < 0.01 ? 1800 : 1800 - 3500 * (t - 0.01), t => t < 0.08 ? 0.07 : expDecay(t - 0.08, 0.06, 6));
  // 高冲击裂纹 — 瞬态
  const crack = renderOsc(sr, 0.05, 'square', t => 4000 - 80000 * t, t => expDecay(t, 0.22, 35));
  // 二次冲击 — 延迟0.08s
  const impact2 = renderOsc(sr, 0.18, 'sine', t => 300 - 2000 * t, t => expDecay(t, 0.35, 7));
  // 低频余震 — 更长延展
  const rumble = renderOsc(sr, 0.7, 'sine', t => 30 - 25 * t, t => t < 0.12 ? 0 : expDecay(t - 0.12, 0.18, 1.8));
  // 扩展低频轰鸣层 — KO标志性的"BOOM"
  const boom = renderOsc(sr, 0.6, 'sine', t => 55 - 50 * t, t => expDecay(t, 0.5, 2));
  // 高频碎片 — 延迟0.15s
  const debris = highPass(renderNoise(sr, 0.15, t => t < 0.005 ? 0 : expDecay(t - 0.005, 0.2, 12)), sr, 4000);

  // === v3新增：双重爆炸层 ===
  // 初始爆裂 — 0.35s处的第一重爆裂，尖锐的上升+急速衰减
  const initialBlast = renderOsc(sr, 0.12, 'sawtooth', t => 800 - 12000 * t, t => expDecay(t, 0.4, 12));
  // 初始爆裂噪声 — 宽频冲击波
  const blastNoise = bandPass(renderNoise(sr, 0.1, t => expDecay(t, 0.35, 8)), sr, 300, 5000);
  // 延迟余震 — 0.5s处的第二重低频余震，更深沉更慢
  const aftershockBoom = renderOsc(sr, 0.35, 'sine', t => 35 - 20 * t, t => expDecay(t, 0.45, 1.8));
  // 余震中频共鸣 — 像爆炸后的空气震动
  const aftershockMid = renderOsc(sr, 0.25, 'sawtooth', t => 200 - 2000 * t, t => expDecay(t, 0.2, 4));
  // 余震高频碎片 — 延迟余震中的碎石感
  const aftershockDebris = highPass(renderNoise(sr, 0.12, t => t < 0.005 ? 0 : expDecay(t - 0.005, 0.15, 14)), sr, 3500);

  const total = Math.ceil(sr * dur);
  const noiseP = padTo(noise, total);
  const ringP = padTo(ring, total, Math.floor(sr * 0.1));
  const crackP = padTo(crack, total);
  const impact2P = padTo(impact2, total, Math.floor(sr * 0.08));
  const rumbleP = padTo(rumble, total, Math.floor(sr * 0.2));
  const boomP = padTo(boom, total);
  const debrisP = padTo(debris, total, Math.floor(sr * 0.15));
  // 双重爆炸层延迟对齐
  const initialBlastP = padTo(initialBlast, total, Math.floor(sr * 0.35));
  const blastNoiseP = padTo(blastNoise, total, Math.floor(sr * 0.35));
  const aftershockBoomP = padTo(aftershockBoom, total, Math.floor(sr * 0.5));
  const aftershockMidP = padTo(aftershockMid, total, Math.floor(sr * 0.52));
  const aftershockDebrisP = padTo(aftershockDebris, total, Math.floor(sr * 0.55));

  return normalize(mixLayers(
    [main, noiseP, sub, ringP, crackP, impact2P, rumbleP, boomP, debrisP,
     initialBlastP, blastNoiseP, aftershockBoomP, aftershockMidP, aftershockDebrisP],
    [1, 0.5, 1.3, 0.25, 0.4, 0.55, 0.8, 1.2, 0.35,
     0.65, 0.55, 1.0, 0.4, 0.35]
  ));
}

// Counter：明亮金属质感 + 额外延音 + 高频裂纹声
// v2: 增加额外的高频裂纹声，让Counter Hit更有"打破"感
function renderCounter(sr: number): Float32Array {
  const dur = 0.3;
  // 尖锐方波瞬态 — 更高频率
  const osc1 = renderOsc(sr, 0.09, 'square',
    t => t < 0.02 ? 2200 : 2600,
    t => expDecay(t, 0.2, 18));
  // 锯齿波裂纹 — 延迟0.05s
  const osc2 = renderOsc(sr, 0.12, 'sawtooth',
    t => 2800 - 30000 * t,
    t => expDecay(t, 0.14, 15));
  // 金属延音层 — 更长的持续共鸣
  const sustain = renderOsc(sr, dur * 0.8, 'sine',
    _t => 1800,
    t => expDecay(t, 0.1, 6));
  // 回声层 — 延迟0.1s，衰减
  const echo = renderOsc(sr, 0.1, 'triangle',
    t => 1800 - 12000 * t,
    t => expDecay(t, 0.09, 20));
  // 高频闪亮感 — 更明显
  const sparkle = renderOsc(sr, 0.05, 'sine',
    t => 5000 - 35000 * t,
    t => expDecay(t, 0.08, 35));
  // 噪声层 — 尖锐打击感
  const noiseHit = highPass(renderNoise(sr, 0.06, t => expDecay(t, 0.18, 25)), sr, 5000);
  // 金属泛音 — 延迟0.04s
  const metalOvertone = renderOsc(sr, 0.08, 'triangle',
    t => 3600 - 20000 * t,
    t => expDecay(t, 0.06, 22));
  // === v2新增：高频裂纹声 ===
  // 极高频裂纹瞬态 — 模拟玻璃碎裂的尖锐"crack"
  const hiCrack = renderOsc(sr, 0.025, 'square', t => 6000 - 100000 * t, t => expDecay(t, 0.22, 55));
  // 高频噪声裂纹 — 空气撕裂的质感
  const airCrack = highPass(renderNoise(sr, 0.04, t => expDecay(t, 0.2, 35)), sr, 8000);
  // 尖锐泛音碎片 — 延迟0.02s
  const shard = renderOsc(sr, 0.03, 'sawtooth', t => 4500 - 50000 * t, t => expDecay(t, 0.12, 50));

  const total = Math.ceil(sr * dur);
  const osc1P = padTo(osc1, total);
  const osc2P = padTo(osc2, total, Math.floor(sr * 0.05));
  const sustainP = padTo(sustain, total, Math.floor(sr * 0.03));
  const echoP = padTo(echo, total, Math.floor(sr * 0.12));
  const sparkleP = padTo(sparkle, total, Math.floor(sr * 0.03));
  const noiseP = padTo(noiseHit, total);
  const metalP = padTo(metalOvertone, total, Math.floor(sr * 0.04));
  const hiCrackP = padTo(hiCrack, total);
  const airCrackP = padTo(airCrack, total);
  const shardP = padTo(shard, total, Math.floor(sr * 0.02));

  return normalize(mixLayers(
    [osc1P, osc2P, sustainP, echoP, sparkleP, noiseP, metalP, hiCrackP, airCrackP, shardP],
    [1, 0.7, 0.5, 0.4, 0.4, 0.5, 0.35, 0.6, 0.45, 0.4]
  ));
}

function renderGuardCrush(sr: number): Float32Array {
  const dur = 0.15;
  // 白噪声 — 金属碎裂的主体质感
  const noise = highPass(renderNoise(sr, dur, t => expDecay(t, 0.4, 12)), sr, 1500);
  // 高频共振(2kHz) — 金属碎片共鸣，快速衰减
  const resonance = renderOsc(sr, dur, 'sine', t => 2000 - 10000 * t, t => expDecay(t, 0.15, 18));
  // 尖锐裂纹瞬态
  const crack = renderOsc(sr, 0.04, 'square', t => 4000 - 80000 * t, t => expDecay(t, 0.2, 40));
  // 低频冲击层 — 碎裂的沉重感
  const impact = renderOsc(sr, dur * 0.6, 'sine', t => 150 - 1200 * t, t => expDecay(t, 0.3, 14));
  // 碎片散落噪声
  const debris = highPass(renderNoise(sr, 0.06, t => t < 0.008 ? 0 : expDecay(t - 0.008, 0.12, 20)), sr, 3500);
  const resonanceP = padTo(resonance, Math.ceil(sr * dur));
  const debrisP = padTo(debris, Math.ceil(sr * dur), Math.floor(sr * 0.03));
  return normalize(mixLayers([noise, resonanceP, crack, impact, debrisP], [1, 1, 0.6, 0.7, 0.4]));
}

function renderChip(sr: number): Float32Array {
  const dur = 0.05;
  const noise = highPass(renderNoise(sr, dur, t => expDecay(t, 0.12, 30)), sr, 3000);
  const osc = renderOsc(sr, dur, 'triangle', _t => 800, t => expDecay(t, 0.06, 40));
  return normalize(mixLayers([noise, osc], [1, 0.5]));
}

function renderWallBounce(sr: number): Float32Array {
  const dur = 0.1;
  // 低频撞击(150Hz) — 墙壁撞击的厚重主体
  const impact = renderOsc(sr, dur, 'sine', t => 150 - 800 * t, t => expDecay(t, 0.4, 16));
  // 噪声层 — 撞击的粗糙质感
  const noise = bandPass(renderNoise(sr, dur, t => expDecay(t, 0.2, 18)), sr, 800, 3500);
  // 高频碎片瞬态
  const debris = highPass(renderNoise(sr, 0.03, t => expDecay(t, 0.15, 30)), sr, 4000);
  // 金属回声
  const echo = renderOsc(sr, 0.05, 'sine', t => 600 - 4000 * t, t => expDecay(t, 0.08, 22));
  const debrisP = padTo(debris, Math.ceil(sr * dur));
  const echoP = padTo(echo, Math.ceil(sr * dur), Math.floor(sr * 0.03));
  return normalize(mixLayers([impact, noise, debrisP, echoP], [1.2, 0.7, 0.4, 0.3]));
}

// 地面弹跳声 — 中频弹跳(300Hz) + 快速衰减
function renderGroundBounce(sr: number): Float32Array {
  const dur = 0.1;
  // 中频弹跳(300Hz) — 地面反弹的主体音
  const bounce = renderOsc(sr, dur, 'sine', t => 300 - 2500 * t, t => expDecay(t, 0.3, 22));
  // 低频体感 — 弹跳的重量感
  const body = renderOsc(sr, dur * 0.6, 'sine', t => 100 - 600 * t, t => expDecay(t, 0.25, 18));
  // 尘土噪声 — 地面摩擦质感
  const dust = lowPass(renderNoise(sr, dur * 0.5, t => expDecay(t, 0.08, 25)), sr, 1500);
  // 高频瞬态 — 弹跳的清脆感
  const snap = renderOsc(sr, 0.02, 'triangle', t => 2000 - 30000 * t, t => expDecay(t, 0.15, 45));
  const dustP = padTo(dust, Math.ceil(sr * dur));
  const snapP = padTo(snap, Math.ceil(sr * dur));
  return normalize(mixLayers([bounce, body, dustP, snapP], [1, 0.8, 0.5, 0.4]));
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

/** HSDM super flash — 最长最激烈的闪光音效, 红黑色调 */
function renderSuperFlashHSDM(sr: number): Float32Array {
  const dur = 0.65;
  // 主振荡器: 更低沉的扫频 + 更长的持续
  const osc = renderOsc(sr, dur, 'sawtooth',
    t => t < 0.15 ? 200 + 16000 * t : t < 0.3 ? 2600 - 12000 * (t - 0.15) : 400,
    t => t < 0.12 ? 0.25 + t * 2.5 : expDecay(t - 0.12, 0.45, 3.5));
  // 高频shimmer: 更密集
  const shimmer = highPass(renderNoise(sr, 0.3, t => expDecay(t, 0.2, 7)), sr, 3000);
  const shimmerP = padTo(shimmer, Math.ceil(sr * dur));
  // 低频轰鸣
  const rumble = renderOsc(sr, dur, 'sine', t => 80 + 40 * Math.sin(t * 20),
    t => t < 0.08 ? 0.15 : expDecay(t - 0.08, 0.5, 4));
  // 高频钟鸣 (HSDM特征)
  const chime = renderOsc(sr, 0.4, 'sine',
    t => t < 0.06 ? 660 : t < 0.18 ? 660 + 12000 * (t - 0.06) : 2100 - 6000 * (t - 0.18),
    t => t < 0.06 ? 0 : expDecay(t - 0.06, 0.12, 5));
  const chimeP = padTo(chime, Math.ceil(sr * dur), Math.floor(sr * 0.06));
  return normalize(mixLayers([osc, shimmerP, rumble, chimeP], [1, 0.45, 0.6, 0.35]));
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
  const dur = 0.09;
  // 低频着地冲击 — 更明显的"砰"
  const thud = renderOsc(sr, dur, 'sine', t => 90 - 900 * t, t => expDecay(t, 0.12, 22));
  // 地面尘土噪声
  const dust = bandPass(renderNoise(sr, 0.05, t => expDecay(t, 0.07, 28)), sr, 600, 2500);
  // 低频体感层 — 着地重量感
  const weight = renderOsc(sr, dur * 0.6, 'sine', t => 60 - 400 * t, t => expDecay(t, 0.15, 18));
  const dustP = new Float32Array(Math.ceil(sr * dur)); dustP.set(dust);
  const weightP = padTo(weight, Math.ceil(sr * dur));
  return normalize(mixLayers([thud, dustP, weightP], [1, 0.55, 0.7]));
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

// === KO命中音效 — 击中KO时的独立音效 ===

// KO命中：扩展低频轰鸣 + 巨大冲击 (用于KO最后一击命中时)
function renderKOHit(sr: number): Float32Array {
  const dur = 0.5;
  // 初始冲击裂纹 — 极尖锐瞬态
  const crack = renderOsc(sr, 0.04, 'square', t => 4500 - 90000 * t, t => expDecay(t, 0.25, 35));
  // 扩展低频轰鸣
  const rumble = renderOsc(sr, 0.45, 'sine', t => 50 - 55 * t, t => expDecay(t, 0.5, 2.2));
  // 子低音爆炸
  const sub = renderOsc(sr, 0.4, 'sine', t => 35 - 35 * t, t => expDecay(t, 0.45, 2));
  // 宽频噪声冲击波
  const noise = bandPass(renderNoise(sr, 0.25, t => expDecay(t, 0.4, 4)), sr, 200, 4000);
  // 高频碎片
  const debris = highPass(renderNoise(sr, 0.1, t => t < 0.005 ? 0 : expDecay(t - 0.005, 0.2, 15)), sr, 5000);
  // 金属回响 — 延迟
  const metal = renderOsc(sr, 0.15, 'triangle', t => 2000 - 15000 * t, t => expDecay(t, 0.1, 12));
  // 中频冲击
  const impact = renderOsc(sr, 0.12, 'sine', t => 200 - 1500 * t, t => expDecay(t, 0.35, 8));

  const total = Math.ceil(sr * dur);
  const crackP = padTo(crack, total);
  const debrisP = padTo(debris, total, Math.floor(sr * 0.03));
  const metalP = padTo(metal, total, Math.floor(sr * 0.06));
  const impactP = padTo(impact, total, Math.floor(sr * 0.04));

  return normalize(mixLayers(
    [crackP, rumble, sub, noise, debrisP, metalP, impactP],
    [0.5, 1.3, 1.2, 1, 0.4, 0.35, 0.7]
  ));
}

// 重落地：从高空落地的重击声，带低频震动
// v2: 增强低频震动层，让落地更有"重量"感
function renderLandingHeavy(sr: number): Float32Array {
  const dur = 0.2;
  // 深沉低频着地冲击
  const thud = renderOsc(sr, dur, 'sine', t => 70 - 700 * t, t => expDecay(t, 0.15, 14));
  // 低频体感层
  const sub = renderOsc(sr, dur * 0.9, 'sine', t => 40 - 250 * t, t => expDecay(t, 0.25, 10));
  // 地面尘土噪声 — 更强
  const dust = bandPass(renderNoise(sr, 0.1, t => expDecay(t, 0.1, 18)), sr, 500, 3000);
  // 中频冲击层
  const impact = renderOsc(sr, dur * 0.5, 'triangle', t => 200 - 2500 * t, t => expDecay(t, 0.12, 22));
  // 高频碎片 — 地面碎片飞溅感
  const debris = highPass(renderNoise(sr, 0.04, t => expDecay(t, 0.06, 35)), sr, 4000);
  // === v2新增：低频震动层 ===
  // 超低频地面震动 — 30-50Hz，模拟地面传导的震动感
  const groundRumble = renderOsc(sr, dur * 1.2, 'sine', t => 35 - 25 * t, t => expDecay(t, 0.3, 3));
  // 低频冲击余震 — 延迟0.04s
  const rumblePulse = renderOsc(sr, 0.15, 'sine', t => 50 - 40 * t, t => t < 0.01 ? 0 : expDecay(t - 0.01, 0.25, 5));

  const total = Math.ceil(sr * dur);
  const dustP = padTo(dust, total);
  const impactP = padTo(impact, total);
  const debrisP = padTo(debris, total);
  const groundRumbleP = padTo(groundRumble, Math.ceil(sr * dur * 1.2));
  const rumblePulseP = padTo(rumblePulse, total, Math.floor(sr * 0.04));

  // 混合时groundRumble可能比total长，取max
  const maxLen = Math.max(total, groundRumbleP.length);
  const allLayers = [thud, sub, dustP, impactP, debrisP, groundRumbleP, rumblePulseP];
  const padded = allLayers.map(l => {
    if (l.length >= maxLen) return l;
    const p = new Float32Array(maxLen);
    p.set(l);
    return p;
  });

  return normalize(mixLayers(padded, [1, 0.9, 0.7, 0.55, 0.35, 1.0, 0.7]));
}

// === 角色特有音效点缀 ===

// 火焰噼啪声 — Kyo/Mai/Chris等火属性角色特殊技/DM命中叠加
function renderAccentFire(sr: number): Float32Array {
  const dur = 0.18;
  // 火焰噪声 — 中高频不规则噼啪
  const crackle = bandPass(renderNoise(sr, dur, t => expDecay(t, 0.2, 12)), sr, 1500, 6000);
  // 火焰嘶嘶声 — 高频
  const hiss = highPass(renderNoise(sr, dur * 0.6, t => expDecay(t, 0.1, 18)), sr, 5000);
  // 热浪低频 — 隐约的隆隆声
  const warmth = renderOsc(sr, dur * 0.7, 'sine', t => 120 - 800 * t, t => expDecay(t, 0.12, 15));
  // 噼啪瞬态 — 模拟火星爆裂
  const pop = renderOsc(sr, 0.02, 'square', t => 3000 - 60000 * t, t => expDecay(t, 0.15, 50));
  // 高频闪烁
  const sparkle = renderOsc(sr, 0.04, 'sine', t => 5000 - 40000 * t, t => expDecay(t, 0.06, 35));

  const total = Math.ceil(sr * dur);
  const hissP = padTo(hiss, total);
  const warmthP = padTo(warmth, total);
  const popP = padTo(pop, total);
  const sparkleP = padTo(sparkle, total, Math.floor(sr * 0.02));

  return normalize(mixLayers([crackle, hissP, warmthP, popP, sparkleP], [1, 0.5, 0.6, 0.4, 0.3]));
}

// 紫色能量闪烁 — Iori/Mature/Vice等暗能量角色
function renderAccentPurple(sr: number): Float32Array {
  const dur = 0.2;
  // 能量嗡鸣 — 低中频
  const hum = renderOsc(sr, dur, 'sine', t => 300 - 1500 * t, t => expDecay(t, 0.15, 10));
  // 暗能量闪烁 — 高频噪声
  const shimmer = highPass(renderNoise(sr, dur * 0.7, t => expDecay(t, 0.12, 15)), sr, 4000);
  // 暗能量脉冲 — 中频三角波
  const pulse = renderOsc(sr, dur * 0.5, 'triangle', t => 800 - 8000 * t, t => expDecay(t, 0.1, 20));
  // 空洞回响 — 模拟暗能量的"空间感"
  const void_echo = renderOsc(sr, dur, 'sine', t => 200 - 1000 * t, t => t < 0.03 ? 0 : expDecay(t - 0.03, 0.08, 12));

  const total = Math.ceil(sr * dur);
  const shimmerP = padTo(shimmer, total);
  const pulseP = padTo(pulse, total);
  const echoP = padTo(void_echo, total);

  return normalize(mixLayers([hum, shimmerP, pulseP, echoP], [1, 0.6, 0.7, 0.4]));
}

// 冰晶声音 — Kula等冰属性角色
function renderAccentIce(sr: number): Float32Array {
  const dur = 0.2;
  // 高音冰晶碎裂 — 更高音调的结晶质感
  const crystal = renderOsc(sr, dur * 0.6, 'triangle', t => 4500 - 35000 * t, t => expDecay(t, 0.1, 22));
  // 冰面碎裂噪声 — 高频闪烁
  const crackle = highPass(renderNoise(sr, dur * 0.5, t => expDecay(t, 0.12, 20)), sr, 6000);
  // 冷冻共鸣 — 高频正弦
  const ring = renderOsc(sr, dur, 'sine', t => 3000 - 15000 * t, t => expDecay(t, 0.08, 15));
  // 颤音 — 模拟冰面震颤
  const vibrato = renderOsc(sr, dur * 0.4, 'sine',
    t => 2500 + 800 * Math.sin(t * 120),
    t => expDecay(t, 0.08, 25));

  const total = Math.ceil(sr * dur);
  const crackleP = padTo(crackle, total);
  const ringP = padTo(ring, total);
  const vibratoP = padTo(vibrato, total);

  return normalize(mixLayers([crystal, crackleP, ringP, vibratoP], [1, 0.5, 0.6, 0.4]));
}

// 通用能量点缀 — 非火/冰/暗角色的默认能量点缀
function renderAccentGeneric(sr: number): Float32Array {
  const dur = 0.12;
  // 中频能量脉冲
  const pulse = renderOsc(sr, dur, 'sine', t => 400 - 3000 * t, t => expDecay(t, 0.12, 18));
  // 高频闪烁
  const sparkle = highPass(renderNoise(sr, dur * 0.6, t => expDecay(t, 0.08, 25)), sr, 5000);
  // 短冲击
  const snap = renderOsc(sr, dur * 0.3, 'triangle', t => 1800 - 20000 * t, t => expDecay(t, 0.1, 30));

  const total = Math.ceil(sr * dur);
  const sparkleP = padTo(sparkle, total);
  const snapP = padTo(snap, total);

  return normalize(mixLayers([pulse, sparkleP, snapP], [1, 0.4, 0.5]));
}

// === 新增：Dizzy Hit / Ground Bounce SFX ===

// Dizzy Hit：带回声的打击声 — DIZZY状态被命中时叠加
// 特征：延迟回声 + 空洞共鸣 + 眩晕感
function renderDizzyHit(sr: number): Float32Array {
  const dur = 0.35;
  // 主冲击 — 中频噪声
  const impact = bandPass(renderNoise(sr, 0.08, t => expDecay(t, 0.35, 20)), sr, 800, 3000);
  // 低频体感
  const body = renderOsc(sr, 0.1, 'sine', t => 120 - 1500 * t, t => expDecay(t, 0.3, 15));
  // 第一次回声 — 延迟0.06s，音量衰减30%
  const echo1 = bandPass(renderNoise(sr, 0.06, t => expDecay(t, 0.2, 25)), sr, 1000, 3500);
  // 第二次回声 — 延迟0.14s，音量衰减55%
  const echo2 = bandPass(renderNoise(sr, 0.05, t => expDecay(t, 0.12, 30)), sr, 1200, 4000);
  // 空洞共鸣 — 模拟头部被击中的"嗡嗡"感
  const hollow = renderOsc(sr, 0.2, 'sine', t => 300 - 800 * t, t => expDecay(t, 0.1, 8));
  // 高频闪烁 — 眩晕"星星"感
  const stars = renderOsc(sr, 0.08, 'sine',
    t => 2000 + 3000 * Math.sin(t * 80),
    t => expDecay(t, 0.06, 20));

  const total = Math.ceil(sr * dur);
  const echo1P = padTo(echo1, total, Math.floor(sr * 0.06));
  const echo2P = padTo(echo2, total, Math.floor(sr * 0.14));
  const hollowP = padTo(hollow, total, Math.floor(sr * 0.03));
  const starsP = padTo(stars, total, Math.floor(sr * 0.02));

  return normalize(mixLayers(
    [impact, body, echo1P, echo2P, hollowP, starsP],
    [0.8, 0.7, 0.5, 0.3, 0.45, 0.35]
  ));
}

// === 新增 SFX: Perfect KO / Round Start / Time Up ===

// Perfect KO：三层SFX — 高频水晶碎裂 + 中频胜利号角 + 低频震撼
// 适用于完美KO（对手未造成任何伤害时KO对手）
function renderPerfectKO(sr: number): Float32Array {
  const dur = 1.5;
  const total = Math.ceil(sr * dur);

  // 第一层：高频水晶碎裂 — 清脆的玻璃破碎上升音
  const crystalBreak = renderOsc(sr, 0.15, 'triangle', t => 4000 - 50000 * t, t => expDecay(t, 0.2, 18));
  // 高频碎裂噪声 — 碎片飞溅
  const crystalNoise = highPass(renderNoise(sr, 0.12, t => expDecay(t, 0.2, 20)), sr, 6000);
  // 二次碎裂 — 延迟0.08s
  const crystal2 = renderOsc(sr, 0.1, 'square', t => 5000 - 60000 * t, t => expDecay(t, 0.15, 25));

  // 第二层：中频胜利号角 — C-E-G-C上行琶音
  const hornNotes = [523.3, 659.3, 784, 1046.5];
  const hornDur = 0.4;
  const hornLen = Math.ceil(sr * (hornNotes.length * 0.12 + hornDur));
  const hornData = new Float32Array(total);
  for (let n = 0; n < hornNotes.length; n++) {
    const offset = Math.floor(sr * (0.15 + n * 0.12));
    const tone = renderOsc(sr, hornDur, 'square', _t => hornNotes[n], t => expDecay(t, 0.3, 4));
    const harm = renderOsc(sr, hornDur * 0.6, 'triangle', _t => hornNotes[n] * 2, t => expDecay(t, 0.08, 8));
    for (let i = 0; i < tone.length && offset + i < total; i++) {
      hornData[offset + i] += tone[i] * 0.2 + harm[i] * 0.06;
    }
  }

  // 第三层：低频震撼 — KO标志性的深沉低频
  const shock = renderOsc(sr, 0.8, 'sine', t => 50 - 40 * t, t => expDecay(t, 0.5, 2));
  // 低频共振脉冲
  const pulse = renderOsc(sr, 0.6, 'sine', t => 35 - 25 * t, t => t < 0.05 ? 0 : expDecay(t - 0.05, 0.4, 1.8));
  // 中低频冲击波
  const impact = bandPass(renderNoise(sr, 0.3, t => expDecay(t, 0.35, 5)), sr, 150, 800);

  const crystalP = padTo(crystalBreak, total);
  const crystalNoiseP = padTo(crystalNoise, total);
  const crystal2P = padTo(crystal2, total, Math.floor(sr * 0.08));
  const hornP = padTo(hornData, total);
  const shockP = padTo(shock, total);
  const pulseP = padTo(pulse, total, Math.floor(sr * 0.1));
  const impactP = padTo(impact, total);

  return normalize(mixLayers(
    [crystalP, crystalNoiseP, crystal2P, hornP, shockP, pulseP, impactP],
    [0.6, 0.5, 0.4, 1.0, 1.2, 0.8, 0.7]
  ));
}

// Round Start：短促金属铃音 + 低频鼓点
// 用于回合开始时的倒计时结束提示音
function renderRoundStart(sr: number): Float32Array {
  const dur = 0.5;
  const total = Math.ceil(sr * dur);

  // 金属铃音 — 清脆的高频三角波，快速衰减
  const bell = renderOsc(sr, 0.25, 'triangle', t => 1200 - 800 * t, t => expDecay(t, 0.2, 8));
  // 铃音泛音 — 高八度
  const bellHarm = renderOsc(sr, 0.18, 'sine', t => 2400 - 1600 * t, t => expDecay(t, 0.1, 12));
  // 铃音二次泛音 — 更高频
  const bellHarm2 = renderOsc(sr, 0.12, 'triangle', t => 3600 - 3000 * t, t => expDecay(t, 0.05, 18));

  // 低频鼓点 — 回合开始的"咚"声
  const kick = renderOsc(sr, 0.18, 'sine', t => 150 - 1200 * t, t => expDecay(t, 0.35, 10));
  // 鼓点子低音 — 低频深度
  const kickSub = renderOsc(sr, 0.15, 'sine', t => 60 - 400 * t, t => expDecay(t, 0.3, 12));
  // 鼓点冲击瞬态
  const kickClick = renderOsc(sr, 0.025, 'square', t => 800 - 20000 * t, t => expDecay(t, 0.2, 45));

  const bellP = padTo(bell, total);
  const bellHarmP = padTo(bellHarm, total);
  const bellHarm2P = padTo(bellHarm2, total);
  const kickP = padTo(kick, total);
  const kickSubP = padTo(kickSub, total);
  const kickClickP = padTo(kickClick, total);

  return normalize(mixLayers(
    [bellP, bellHarmP, bellHarm2P, kickP, kickSubP, kickClickP],
    [1, 0.4, 0.2, 0.9, 0.7, 0.5]
  ));
}

// Time Up：下降音阶三角波 + 铃声
// 用于时间耗尽时的提示音
function renderTimeUp(sr: number): Float32Array {
  const dur = 0.8;
  const total = Math.ceil(sr * dur);
  const out = new Float32Array(total);

  // 下降音阶 — C-Bb-Ab-G 的三角波，模拟经典的"时间到"音效
  const notes = [523.3, 466.2, 415.3, 392];
  for (let n = 0; n < notes.length; n++) {
    const offset = Math.floor(sr * n * 0.15);
    const tone = renderOsc(sr, 0.2, 'triangle', _t => notes[n], t => expDecay(t, 0.15, 8));
    const harm = renderOsc(sr, 0.15, 'sine', _t => notes[n] * 2, t => expDecay(t, 0.06, 12));
    for (let i = 0; i < tone.length && offset + i < total; i++) {
      out[offset + i] += tone[i] * 0.25 + harm[i] * 0.08;
    }
  }

  // 铃声 — 高频金属泛音，在音阶之后
  const bell = renderOsc(sr, 0.3, 'sine', _t => 1800, t => t < 0.02 ? t * 5 : expDecay(t - 0.02, 0.12, 6));
  const bellHarm = renderOsc(sr, 0.2, 'triangle', _t => 3600, t => expDecay(t, 0.06, 10));
  // 低频尾声 — 缓慢衰减的低沉音
  const tail = renderOsc(sr, 0.4, 'sine', t => 120 - 80 * t, t => expDecay(t, 0.15, 4));

  const bellP = padTo(bell, total, Math.floor(sr * 0.55));
  const bellHarmP = padTo(bellHarm, total, Math.floor(sr * 0.58));
  const tailP = padTo(tail, total, Math.floor(sr * 0.5));

  // 混合音阶输出和铃声层
  const combined = new Float32Array(total);
  for (let i = 0; i < total; i++) {
    combined[i] = out[i] + bellP[i] * 0.3 + bellHarmP[i] * 0.15 + tailP[i] * 0.5;
  }

  return normalize(combined);
}

// === 运动音效：挥拳风声 / 脚步 / 跳跃 / 落地 ===

// 挥拳风声(轻)：短促的空气切割声，用于轻攻击startup帧
// 特征：高频带通噪声快速扫过 + 短促的sawtooth上扫
function renderWhoosh(sr: number): Float32Array {
  const dur = 0.07;
  // 高频噪声带 — 空气切割主体
  const noiseHi = bandPass(renderNoise(sr, dur, t => expDecay(t, 0.15, 45)), sr, 3000, 9000);
  // 中高频sawtooth上扫 — 挥拳的"嗖"感
  const sweep = renderOsc(sr, dur, 'sawtooth', t => 800 + 12000 * t, t => expDecay(t, 0.12, 50));
  // 宽频空气噪声 — 补充质感
  const air = highPass(renderNoise(sr, dur * 0.7, t => expDecay(t, 0.08, 55)), sr, 2000);
  // 短促三角波瞬态 — 挥拳起手的清脆感
  const snap = renderOsc(sr, dur * 0.4, 'triangle', t => 2000 - 30000 * t, t => expDecay(t, 0.1, 60));

  const total = Math.ceil(sr * dur);
  const snapP = padTo(snap, total);

  return normalize(mixLayers([noiseHi, sweep, air, snapP], [0.8, 0.6, 0.5, 0.4]));
}

// 蓄力气声(重)：更沉重更长的大幅挥拳风声，用于重攻击startup帧
// 特征：低频冲击 + 中频呼啸 + 高频撕裂感，蓄力后释放
function renderWhooshHeavy(sr: number): Float32Array {
  const dur = 0.14;
  // 低频体感 — 重挥拳的"呼"声底层
  const body = renderOsc(sr, dur, 'sine', t => 120 - 800 * t, t => expDecay(t, 0.2, 18));
  // 中频呼啸噪声 — 更宽的挥拳范围
  const noiseMid = bandPass(renderNoise(sr, dur, t => expDecay(t, 0.18, 20)), sr, 600, 3500);
  // 高频撕裂噪声 — 重击的空气撕裂
  const noiseHi = highPass(renderNoise(sr, dur * 0.7, t => expDecay(t, 0.1, 25)), sr, 4000);
  // 蓄力上扫sawtooth — 挥拳前的能量蓄积
  const charge = renderOsc(sr, dur * 0.6, 'sawtooth', t => 200 + 8000 * t, t => t < 0.03 ? t * 5 : expDecay(t - 0.03, 0.15, 30));
  // 释放瞬态 — 蓄力后的突然释放
  const release = renderOsc(sr, dur * 0.5, 'triangle', t => 1500 - 20000 * t, t => expDecay(t, 0.12, 35));
  // 低频冲击波 — 重攻击的力道感
  const impact = renderOsc(sr, dur * 0.8, 'sine', t => 80 - 500 * t, t => t < 0.04 ? 0 : expDecay(t - 0.04, 0.2, 12));

  const total = Math.ceil(sr * dur);
  const chargeP = padTo(charge, total);
  const releaseP = padTo(release, total);
  const impactP = padTo(impact, total, Math.floor(sr * 0.03));

  return normalize(mixLayers([body, noiseMid, noiseHi, chargeP, releaseP, impactP], [0.9, 1, 0.5, 0.7, 0.6, 0.8]));
}

// 脚步声：低通噪声 + 短促低频冲击，模拟鞋底踏地
// 区别于step：更丰富层次，有明显的脚跟/脚掌两层
function renderFootstep(sr: number): Float32Array {
  const dur = 0.06;
  // 脚跟冲击 — 短促低频"咚"
  const heel = renderOsc(sr, dur, 'sine', t => 150 - 2000 * t, t => expDecay(t, 0.15, 40));
  // 脚掌摩擦 — 低通噪声，鞋底与地面接触
  const sole = lowPass(renderNoise(sr, dur, t => expDecay(t, 0.08, 45)), sr, 1200);
  // 中高频瞬态 — 鞋底与地面的清脆接触
  const snap = renderOsc(sr, dur * 0.35, 'triangle', t => 600 - 10000 * t, t => expDecay(t, 0.08, 55));
  // 低频体感 — 踏地的重量
  const weight = renderOsc(sr, dur * 0.7, 'sine', t => 80 - 500 * t, t => expDecay(t, 0.12, 30));

  const total = Math.ceil(sr * dur);
  const snapP = padTo(snap, total);

  return normalize(mixLayers([heel, sole, snapP, weight], [1, 0.6, 0.35, 0.7]));
}

// 跳跃起跳音：上升音调的短促"嗖"声
// 特征：从低频快速上升到高频，模拟腿部发力离地的感觉
function renderJump(sr: number): Float32Array {
  const dur = 0.1;
  // 上升正弦波 — 离地时的发力感
  const rise = renderOsc(sr, dur, 'sine', t => 150 + 4000 * t, t => expDecay(t, 0.15, 22));
  // 脚掌离地噪声 — 短促的摩擦
  const noise = bandPass(renderNoise(sr, dur * 0.6, t => expDecay(t, 0.1, 30)), sr, 800, 3000);
  // 高频上扫 — 空气感
  const air = renderOsc(sr, dur * 0.8, 'sawtooth', t => 400 + 8000 * t, t => expDecay(t, 0.08, 35));
  // 起跳瞬态冲击 — 脚尖蹬地
  const push = renderOsc(sr, dur * 0.3, 'triangle', t => 300 - 5000 * t, t => expDecay(t, 0.12, 45));

  const total = Math.ceil(sr * dur);
  const noiseP = padTo(noise, total);
  const airP = padTo(air, total);
  const pushP = padTo(push, total);

  return normalize(mixLayers([rise, noiseP, airP, pushP], [1, 0.5, 0.4, 0.55]));
}

// 普通落地音(非KO/非重击)：比landing稍重，比landing_heavy轻
// 区别于landing：更丰富的层次感，有明显的着地双段(脚尖→全脚掌)
function renderLandingNormal(sr: number): Float32Array {
  const dur = 0.12;
  // 脚尖着地 — 第一段较轻的低频
  const toeDown = renderOsc(sr, dur * 0.5, 'sine', t => 180 - 1500 * t, t => expDecay(t, 0.15, 30));
  // 全脚掌落地 — 第二段较重的冲击
  const footFlat = renderOsc(sr, dur, 'sine', t => 100 - 900 * t, t => t < 0.015 ? 0 : expDecay(t - 0.015, 0.2, 18));
  // 地面尘土噪声 — 着地扬尘
  const dust = lowPass(renderNoise(sr, dur * 0.5, t => t < 0.01 ? 0 : expDecay(t - 0.01, 0.08, 22)), sr, 1500);
  // 低频体感 — 着地的重量感
  const weight = renderOsc(sr, dur * 0.8, 'sine', t => 65 - 400 * t, t => t < 0.015 ? 0 : expDecay(t - 0.015, 0.18, 14));

  const total = Math.ceil(sr * dur);
  const toeDownP = padTo(toeDown, total);
  const dustP = padTo(dust, total);
  const weightP = padTo(weight, total);

  return normalize(mixLayers([toeDownP, footFlat, dustP, weightP], [0.7, 1, 0.5, 0.8]));
}

// === Ryo 必杀技专属音效 ===

// 虎煌拳 (KOOU): 能量弹发射 — 低频 whoosh + 高频 sizzle
// 特征：低频弹体推进声 + 高频能量sizzle，像一颗凝聚的气弹射出
function renderKoouken(sr: number): Float32Array {
  const dur = 0.32;
  // 低频whoosh — 弹体推进的"嗡"声，从低频上升到中频
  const whoosh = renderOsc(sr, dur, 'sawtooth',
    t => t < 0.06 ? 100 + 6000 * t : 460 - 2000 * (t - 0.06),
    t => t < 0.06 ? 0.1 + t * 1.5 : expDecay(t - 0.06, 0.28, 6));
  // 高频sizzle — 能量弹表面的噼啪声
  const sizzle = highPass(renderNoise(sr, dur * 0.8, t => expDecay(t, 0.15, 10)), sr, 5000);
  // 中频能量体 — 气弹核心的"嗞"声
  const core = bandPass(renderNoise(sr, dur * 0.6, t => expDecay(t, 0.2, 8)), sr, 1500, 4500);
  // 低频冲击波 — 发射瞬间的"砰"
  const impact = renderOsc(sr, 0.1, 'sine', t => 100 - 800 * t, t => expDecay(t, 0.35, 12));
  // 高频发射瞬态 — 能量聚集释放的"嗞"声
  const launch = renderOsc(sr, 0.05, 'square', t => 2000 - 40000 * t, t => expDecay(t, 0.15, 40));
  // 低频弹体共振 — 持续的弹体"嗡嗡"声
  const hum = renderOsc(sr, dur * 0.9, 'sine',
    t => 180 - 400 * t,
    t => t < 0.04 ? t * 5 : expDecay(t - 0.04, 0.18, 6));

  const total = Math.ceil(sr * dur);
  const sizzleP = padTo(sizzle, total);
  const coreP = padTo(core, total);
  const impactP = padTo(impact, total, Math.floor(sr * 0.02));
  const launchP = padTo(launch, total);
  const humP = padTo(hum, total);

  return normalize(mixLayers(
    [whoosh, sizzleP, coreP, impactP, launchP, humP],
    [1, 0.6, 0.7, 0.8, 0.5, 0.65]
  ));
}

// 虎咆 (KO_HOU): 升龙拳式上勾 — 上升 sweep + 打击感
// 特征：快速上升的sweep + 强烈打击瞬态，模拟拳头上勾的力量感
function renderKoHou(sr: number): Float32Array {
  const dur = 0.28;
  // 上升sweep — 拳头快速上勾的"嗖"声，频率从低到高
  const sweep = renderOsc(sr, 0.12, 'sawtooth',
    t => 200 + 15000 * t,
    t => expDecay(t, 0.2, 12));
  // 打击瞬态 — 上勾拳命中的重击声
  const hit = renderOsc(sr, 0.08, 'square', t => 800 - 20000 * t, t => expDecay(t, 0.25, 25));
  // 低频冲击 — 上勾的身体力量感
  const body = renderOsc(sr, 0.15, 'sine', t => 100 - 1000 * t, t => expDecay(t, 0.3, 10));
  // 中高频噪声 — 拳头划破空气
  const airCut = highPass(renderNoise(sr, 0.1, t => expDecay(t, 0.18, 20)), sr, 3000);
  // 高频金属瞬态 — 拳击的清脆"啪"
  const snap = renderOsc(sr, 0.03, 'triangle', t => 3000 - 60000 * t, t => expDecay(t, 0.15, 50));
  // 子低音 — 上升击打的深层体感
  const sub = renderOsc(sr, 0.2, 'sine', t => 50 - 30 * t, t => expDecay(t, 0.35, 5));

  const total = Math.ceil(sr * dur);
  const hitP = padTo(hit, total, Math.floor(sr * 0.04));
  const airCutP = padTo(airCut, total);
  const snapP = padTo(snap, total, Math.floor(sr * 0.03));
  const subP = padTo(sub, total, Math.floor(sr * 0.03));

  return normalize(mixLayers(
    [sweep, hitP, body, airCutP, snapP, subP],
    [1, 0.7, 0.9, 0.5, 0.45, 0.8]
  ));
}

// 飛燕 (HIEN): 飞踢 — 快速风切 + 踢击
// 特征：极速的风切声 + 清脆的踢击瞬态，模拟飞腿的快速凌厉感
function renderHien(sr: number): Float32Array {
  const dur = 0.2;
  // 快速风切 — 飞踢划过空气的"嗖嗖"声
  const windCut = renderOsc(sr, 0.1, 'sawtooth',
    t => 300 + 20000 * t,
    t => expDecay(t, 0.15, 25));
  // 踢击瞬态 — 脚踢命中的"啪"声
  const kick = bandPass(renderNoise(sr, 0.06, t => expDecay(t, 0.25, 30)), sr, 2000, 8000);
  // 中频呼啸 — 飞踢的呼啸尾音
  const swoosh = bandPass(renderNoise(sr, 0.12, t => expDecay(t, 0.12, 15)), sr, 600, 3000);
  // 高频空气切割 — 快速的风刃声
  const airSlice = highPass(renderNoise(sr, 0.05, t => expDecay(t, 0.1, 40)), sr, 6000);
  // 低频踢击body — 踢击的重量感
  const kickBody = renderOsc(sr, 0.08, 'sine', t => 120 - 1500 * t, t => expDecay(t, 0.2, 18));

  const total = Math.ceil(sr * dur);
  const windCutP = padTo(windCut, total);
  const kickP = padTo(kick, total, Math.floor(sr * 0.04));
  const swooshP = padTo(swoosh, total, Math.floor(sr * 0.02));
  const airSliceP = padTo(airSlice, total);
  const kickBodyP = padTo(kickBody, total, Math.floor(sr * 0.03));

  return normalize(mixLayers(
    [windCutP, kickP, swooshP, airSliceP, kickBodyP],
    [0.9, 1, 0.7, 0.55, 0.8]
  ));
}

// 霸王翔吼拳 (HAOU): 强力能量弹 — 比 KOOU 更厚重
// 特征：比虎煌拳更厚重的低频 + 更强的能量爆发，像一颗浓缩的能量炮
function renderHaou(sr: number): Float32Array {
  const dur = 0.45;
  // 厚重低频推进 — 比KOOU更低的弹体推进声
  const whoosh = renderOsc(sr, dur, 'sawtooth',
    t => t < 0.08 ? 80 + 4000 * t : 400 - 1200 * (t - 0.08),
    t => t < 0.08 ? 0.08 + t * 2 : expDecay(t - 0.08, 0.32, 4));
  // 子低音冲击 — 发射的深沉"咚"
  const sub = renderOsc(sr, 0.25, 'sine', t => 45 - 35 * t, t => expDecay(t, 0.45, 4));
  // 中频能量爆发 — 核心的厚重能量感
  const burst = bandPass(renderNoise(sr, dur * 0.7, t => expDecay(t, 0.25, 5)), sr, 400, 3000);
  // 高频sizzle — 能量表面的强烈噼啪
  const sizzle = highPass(renderNoise(sr, dur * 0.5, t => expDecay(t, 0.15, 8)), sr, 5000);
  // 强力发射瞬态 — 能量聚集后的猛烈释放
  const launch = renderOsc(sr, 0.06, 'square', t => 1500 - 30000 * t, t => expDecay(t, 0.2, 30));
  // 低频共振弹体 — 持续的厚重弹体"嗡嗡"
  const hum = renderOsc(sr, dur * 0.85, 'sine',
    t => 140 - 300 * t,
    t => t < 0.05 ? t * 4 : expDecay(t - 0.05, 0.2, 4));
  // 金属泛音 — 能量弹的高频金属质感
  const metal = renderOsc(sr, 0.1, 'triangle', t => 2200 - 25000 * t, t => expDecay(t, 0.08, 20));

  const total = Math.ceil(sr * dur);
  const subP = padTo(sub, total);
  const burstP = padTo(burst, total);
  const sizzleP = padTo(sizzle, total);
  const launchP = padTo(launch, total);
  const humP = padTo(hum, total);
  const metalP = padTo(metal, total, Math.floor(sr * 0.05));

  return normalize(mixLayers(
    [whoosh, subP, burstP, sizzleP, launchP, humP, metalP],
    [1, 1.1, 0.8, 0.5, 0.6, 0.75, 0.35]
  ));
}

// 钓瓶打 (TSURIZAO): →+A 冰柱割り — sharp knife-hand slice
// 特征：清脆的"切"声，高频瞬态 + 中频刃风，模拟手刀劈下的凌厉感
function renderTsurizao(sr: number): Float32Array {
  const dur = 0.18;
  // 高频瞬态 — 手刀劈下的清脆"嗖"
  const slice = highPass(renderNoise(sr, 0.06, t => expDecay(t, 0.2, 35)), sr, 4000);
  // 中频刃风 — 劈下的风声
  const wind = bandPass(renderNoise(sr, 0.1, t => expDecay(t, 0.15, 20)), sr, 800, 3500);
  // 上升频率 sweep — 手刀下劈的动态
  const sweep = renderOsc(sr, 0.08, 'sawtooth',
    t => 1500 + 12000 * t,
    t => expDecay(t, 0.18, 25));
  // 低频打击body — 劈击的重量感
  const body = renderOsc(sr, 0.07, 'sine', t => 140 - 1500 * t, t => expDecay(t, 0.22, 20));

  const total = Math.ceil(sr * dur);
  const windP = padTo(wind, total, Math.floor(sr * 0.02));
  const sweepP = padTo(sweep, total);
  const bodyP = padTo(body, total, Math.floor(sr * 0.03));

  return normalize(mixLayers(
    [slice, windP, sweepP, bodyP],
    [1, 0.7, 0.6, 0.8]
  ));
}

// 落蹴 (ORISHI): ↘+B — low sweeping kick thud
// 特征：低沉的"咚"踢击声，中低频冲击 + 短促噪声，模拟低扫踢的闷响感
function renderOrishi(sr: number): Float32Array {
  const dur = 0.15;
  // 低频冲击 — 踢击的闷响"咚"
  const thud = renderOsc(sr, 0.1, 'sine', t => 100 - 800 * t, t => expDecay(t, 0.3, 15));
  // 中低频噪声 — 踢击扫过地面的沙沙声
  const sweep = lowPass(renderNoise(sr, 0.08, t => expDecay(t, 0.2, 25)), sr, 2000);
  // 短促中频瞬态 — 踢击命中的"啪"
  const snap = bandPass(renderNoise(sr, 0.04, t => expDecay(t, 0.25, 40)), sr, 1200, 5000);
  // 子低音 — 低扫踢的深层体感
  const sub = renderOsc(sr, 0.12, 'sine', t => 55 - 30 * t, t => expDecay(t, 0.35, 8));

  const total = Math.ceil(sr * dur);
  const sweepP = padTo(sweep, total, Math.floor(sr * 0.02));
  const snapP = padTo(snap, total, Math.floor(sr * 0.02));
  const subP = padTo(sub, total);

  return normalize(mixLayers(
    [thud, sweepP, snapP, subP],
    [1, 0.6, 0.5, 0.9]
  ));
}

// 猛速突進拳 (HIO_HACKER): dash strike
// 特征：突进冲击+快速挥拳，短促有力的"嗖—啪"
function renderHioHacker(sr: number): Float32Array {
  const dur = 0.2;
  const dash = highPass(renderNoise(sr, 0.08, t => expDecay(t, 0.15, 30)), sr, 3000);
  const impact = renderOsc(sr, 0.06, 'sawtooth', t => 800 - 2000 * t, t => expDecay(t, 0.25, 35));
  const body = renderOsc(sr, 0.08, 'sine', t => 180 - 400 * t, t => expDecay(t, 0.2, 20));
  const total = Math.ceil(sr * dur);
  const dashP = padTo(dash, total);
  const impactP = padTo(impact, total, Math.floor(sr * 0.03));
  return normalize(mixLayers([dashP, impactP, padTo(body, total)], [0.8, 1, 0.7]));
}

// 斩裂拳 (ZANRETSU_KEN): multi-punch rapid hits
// 特征：连打拳连击的密集"啪啪啪"，多次短促中频冲击
function renderZanretsuKen(sr: number): Float32Array {
  const dur = 0.25;
  const hits: Float32Array[] = [];
  for (let i = 0; i < 4; i++) {
    const offset = Math.floor(sr * i * 0.04);
    const hit = bandPass(renderNoise(sr, 0.05, t => expDecay(t, 0.2, 40)), sr, 1500, 6000);
    const padded = padTo(hit, Math.ceil(sr * dur), offset);
    hits.push(padded);
  }
  const body = renderOsc(sr, 0.15, 'sine', t => 120 - 200 * t, t => expDecay(t, 0.3, 12));
  const total = Math.ceil(sr * dur);
  return normalize(mixLayers([...hits, padTo(body, total)], [1, 1, 1, 1, 0.5]));
}

// === 基础 BGM 框架 ===

// 生成简单循环战斗BGM
// 使用低频bass线(60-120Hz) + 中频旋律三角波 + 高频hihat噪声
// 120 BPM, 4/4拍, 4小节循环，总时长约8秒(适合循环)
function generateBattleBGM(sr: number): Float32Array {
  const bpm = 120;
  const beatsPerSecond = bpm / 60;
  const bars = 4;
  const beatsPerBar = 4;
  const totalBeats = bars * beatsPerBar;
  const dur = totalBeats / beatsPerSecond; // 8秒
  const total = Math.ceil(sr * dur);
  const out = new Float32Array(total);

  // Bass线音符 — E minor进行：Em - C - G - D
  // E2=82.4, C3=130.8, G2=98, D3=146.8
  const bassPattern = [
    // 第1小节 Em
    [82.4, 0, 82.4, 0, 82.4, 0, 98, 0],
    // 第2小节 C
    [130.8, 0, 130.8, 0, 110, 0, 130.8, 0],
    // 第3小节 G
    [98, 0, 98, 0, 110, 0, 123.5, 0],
    // 第4小节 D
    [146.8, 0, 130.8, 0, 123.5, 0, 146.8, 0],
  ];

  // 旋律音符 — 简单的E minor pentatonic旋律
  // E5=659.3, G5=784, A5=880, B5=987.8, D6=1174.7
  const melodyPattern = [
    // 第1小节
    [659.3, 0, 784, 0, 880, 0, 784, 0],
    // 第2小节
    [880, 0, 987.8, 0, 880, 0, 784, 0],
    // 第3小节
    [987.8, 0, 1174.7, 0, 987.8, 0, 880, 0],
    // 第4小节
    [880, 0, 784, 0, 659.3, 0, 0, 0],
  ];

  const subBeatDur = 1 / (beatsPerSecond * 2); // 八分音符时值

  // 渲染bass线
  for (let bar = 0; bar < bars; bar++) {
    const barBeats = bassPattern[bar];
    for (let i = 0; i < 8; i++) {
      if (barBeats[i] === 0) continue;
      const offset = Math.floor(sr * ((bar * 8 + i) * subBeatDur));
      const noteDur = subBeatDur * 0.8;
      const len = Math.ceil(sr * noteDur);
      // 锯齿波bass + 低通
      for (let s = 0; s < len && offset + s < total; s++) {
        const t = s / sr;
        const phase = (barBeats[i] * t * 2 * Math.PI);
        // Sawtooth approximation
        const saw = 2 * ((phase / (2 * Math.PI)) % 1) - 1;
        // 低通模拟：简单一阶
        const env = Math.exp(-t * 12);
        out[offset + s] += saw * env * 0.08;
      }
    }
  }

  // 渲染旋律
  for (let bar = 0; bar < bars; bar++) {
    const barMelody = melodyPattern[bar];
    for (let i = 0; i < 8; i++) {
      if (barMelody[i] === 0) continue;
      const offset = Math.floor(sr * ((bar * 8 + i) * subBeatDur));
      const noteDur = subBeatDur * 1.5;
      const len = Math.ceil(sr * noteDur);
      for (let s = 0; s < len && offset + s < total; s++) {
        const t = s / sr;
        const phase = barMelody[i] * t * 2 * Math.PI;
        // Triangle wave
        const tri = 4 * Math.abs(((phase / (2 * Math.PI)) + 0.25) % 1 - 0.5) - 1;
        const env = Math.exp(-t * 6);
        out[offset + s] += tri * env * 0.04;
      }
    }
  }

  // 渲染hihat噪声 — 每个八分音符
  for (let i = 0; i < totalBeats * 2; i++) {
    const offset = Math.floor(sr * (i * subBeatDur));
    const noiseDur = (i % 2 === 0) ? 0.03 : 0.015; // 强拍更长
    const len = Math.ceil(sr * noiseDur);
    // 使用确定性种子让每次生成一致
    let noiseSeed = i * 7919 + 12345;
    for (let s = 0; s < len && offset + s < total; s++) {
      noiseSeed = (noiseSeed * 1103515245 + 12345) & 0x7fffffff;
      const noiseVal = (noiseSeed / 0x3fffffff) - 1;
      const t = s / sr;
      const env = Math.exp(-t * 80);
      // 高通近似：只保留高频变化
      const filtered = noiseVal - (noiseVal * 0.3);
      out[offset + s] += filtered * env * 0.025;
    }
  }

  // 渲染kick — 每小节第1拍和第3拍
  for (let bar = 0; bar < bars; bar++) {
    for (const beat of [0, 2]) {
      const offset = Math.floor(sr * ((bar * 4 + beat) / beatsPerSecond));
      const kickDur = 0.12;
      const len = Math.ceil(sr * kickDur);
      for (let s = 0; s < len && offset + s < total; s++) {
        const t = s / sr;
        const freq = 150 * Math.exp(-t * 30) + 40;
        const phase = freq * t * 2 * Math.PI;
        const val = Math.sin(phase);
        const env = Math.exp(-t * 15);
        out[offset + s] += val * env * 0.12;
      }
    }
  }

  // 渲染snare — 每小节第2拍和第4拍
  for (let bar = 0; bar < bars; bar++) {
    for (const beat of [1, 3]) {
      const offset = Math.floor(sr * ((bar * 4 + beat) / beatsPerSecond));
      const snareDur = 0.08;
      const len = Math.ceil(sr * snareDur);
      let noiseSeed = bar * 4 + beat + 99999;
      for (let s = 0; s < len && offset + s < total; s++) {
        noiseSeed = (noiseSeed * 1103515245 + 12345) & 0x7fffffff;
        const noiseVal = (noiseSeed / 0x3fffffff) - 1;
        const t = s / sr;
        const env = Math.exp(-t * 25);
        out[offset + s] += noiseVal * env * 0.05;
      }
    }
  }

  return normalize(out);
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
    ['super_flash_hsdm', sr => renderSuperFlashHSDM(sr)],
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
    // KO命中 + 重落地
    ['ko_hit', renderKOHit],
    ['landing_heavy', renderLandingHeavy],
    // 角色特有音效点缀
    ['accent_fire', renderAccentFire],
    ['accent_purple', renderAccentPurple],
    ['accent_ice', renderAccentIce],
    ['accent_generic', renderAccentGeneric],
    // 新增：Dizzy Hit + Ground Bounce
    ['dizzy_hit', renderDizzyHit],
    ['ground_bounce', renderGroundBounce],
    // 新增：Perfect KO / Round Start / Time Up
    ['perfect_ko', renderPerfectKO],
    ['round_start', renderRoundStart],
    ['time_up', renderTimeUp],
    // 基础BGM
    ['battle_bgm', generateBattleBGM],
    // 运动音效：挥拳风声 / 脚步 / 跳跃 / 落地
    ['whoosh', renderWhoosh],
    ['whoosh_heavy', renderWhooshHeavy],
    ['footstep', renderFootstep],
    ['jump', renderJump],
    ['landing_normal', renderLandingNormal],
    // Ryo 必杀技专属音效
    ['ryo_koouken', renderKoouken],
    ['ryo_ko_hou', renderKoHou],
    ['ryo_hien', renderHien],
    ['ryo_haou', renderHaou],
    ['ryo_tsurizao', renderTsurizao],
    ['ryo_orishi', renderOrishi],
    ['ryo_hio_hacker', renderHioHacker],
    ['ryo_zanretsu_ken', renderZanretsuKen],
  ];

  for (const [id, renderer] of renderers) {
    samples.set(id, makeBuffer(ctx, renderer(sr)));
  }
  initialized = true;
}

// === 播放接口 ===

/** Add EQ boost for hit-type samples (3kHz peaking, +3dB). */
function addHitEQ(ctx: AudioContext, sampleId: string, destination: AudioNode): AudioNode {
  if (sampleId.startsWith('hit_') || sampleId === 'ko_hit') {
    const eq = ctx.createBiquadFilter();
    eq.type = 'peaking';
    eq.frequency.value = 3000;
    eq.Q.value = 1.5;
    eq.gain.value = 3;
    eq.connect(destination);
    return eq;
  }
  return destination;
}

/** Add a short sub-bass resonance pulse for dm-type samples. */
function addSubBassPulse(ctx: AudioContext, sampleId: string, now: number): void {
  if (sampleId === 'dm' || sampleId === 'ko' || sampleId === 'guard_break'
    || sampleId === 'wall_bounce_heavy' || sampleId === 'super_flash'
    || sampleId === 'super_flash_sdm' || sampleId === 'super_flash_hsdm'
    || sampleId === 'max_activation'
    || sampleId === 'ko_hit' || sampleId === 'landing_heavy'
    || sampleId === 'ground_bounce') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 60;
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }
}

function play(id: SampleId, volume: number = 1.0, playbackRate: number = 1.0): void {
  const buf = samples.get(id);
  if (!buf) return;
  const ctx = getCtx();
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = playbackRate;
  const gain = ctx.createGain();
  gain.gain.value = volume;
  // Post-processing: EQ for hit samples
  const output = addHitEQ(ctx, id, ctx.destination);
  src.connect(gain).connect(output);
  src.start();
  // Post-processing: sub-bass resonance for heavy samples
  addSubBassPulse(ctx, id, ctx.currentTime);
}

// 带变调的播放（用于连击音高递增）
// playbackRate randomized ±2% to avoid identical timbre on repeated hits
function playPitched(id: SampleId, combo: number, volume: number = 1.0): void {
  const baseRate = 1 + Math.min(combo, 15) * 0.04;
  const randomization = 0.98 + Math.random() * 0.04; // 0.98 ~ 1.02
  play(id, volume, baseRate * randomization);
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
export function playSuperFlash(flashType: 'DM' | 'SDM' | 'HSDM' = 'DM'): void {
  initSampler();
  if (flashType === 'HSDM') play('super_flash_hsdm');
  else if (flashType === 'SDM') play('super_flash_sdm');
  else play('super_flash');
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

// KO命中 + 重落地公开API
export function playKOHit(): void { initSampler(); play('ko_hit'); }
export function playLandingHeavy(): void { initSampler(); play('landing_heavy'); }

// === 角色特有音效点缀系统 ===

/** 角色属性分类 — 决定使用哪种能量点缀音效 */
type CharacterAccent = 'fire' | 'purple' | 'ice' | 'generic';

/** 根据角色ID返回其能量属性 */
function getCharacterAccent(charId: string): CharacterAccent {
  switch (charId) {
    // 火属性: Kyo, Mai, Chris, Joe, K', Andy
    case 'kyo': case 'mai': case 'chris': case 'joe': case 'kdash': case 'andy':
      return 'fire';
    // 暗能量: Iori, Mature, Vice, Yamazaki
    case 'iori': case 'mature': case 'vice': case 'yamazaki':
      return 'purple';
    // 冰属性: Kula
    case 'kula':
      return 'ice';
    // 默认: 所有其他角色
    default:
      return 'generic';
  }
}

/** 播放角色特有的能量点缀音效 — 叠加在必杀技/DM命中音效上 */
export function playHitAccent(charId: string, isDM: boolean = false): void {
  initSampler();
  const accent = getCharacterAccent(charId);
  const accentMap: Record<CharacterAccent, SampleId> = {
    fire: 'accent_fire',
    purple: 'accent_purple',
    ice: 'accent_ice',
    generic: 'accent_generic',
  };
  // DM时音量更大
  play(accentMap[accent], isDM ? 0.9 : 0.55);
}

/** 播放重落地音效 — KO落地或从高处落下时使用 */
export function playHeavyLanding(): void { initSampler(); play('landing_heavy'); }

/** 播放Dizzy Hit音效 — DIZZY状态被命中时叠加 */
export function playDizzyHit(): void { initSampler(); play('dizzy_hit', 0.8); }

/** 播放Ground Bounce音效 — 角色从地面弹起时 */
export function playGroundBounce(): void { initSampler(); play('ground_bounce'); }

// === 新增 SFX 公开 API: Perfect KO / Round Start / Time Up ===

/** 播放Perfect KO音效 — 对手未造成任何伤害时KO对手 */
export function playPerfectKO(): void { initSampler(); play('perfect_ko'); }

/** 播放Round Start音效 — 回合开始提示 */
export function playRoundStart(): void { initSampler(); play('round_start'); }

/** 播放Time Up音效 — 时间耗尽提示 */
export function playTimeUp(): void { initSampler(); play('time_up'); }

/** 获取Battle BGM AudioBuffer — 用于循环播放战斗背景音乐 */
export function getBattleBGM(): AudioBuffer | null {
  initSampler();
  return samples.get('battle_bgm') ?? null;
}

/** 导出样本Map用于测试 */
export function _getSamples(): Map<SampleId, AudioBuffer> { return samples; }
/** 导出SampleId类型用于测试 */
export type { SampleId };

// === 运动音效公开 API ===

/** 播放挥拳风声 — 轻攻击startup帧使用 */
export function playWhoosh(): void { initSampler(); play('whoosh', 0.6); }

/** 播放蓄力气声 — 重攻击startup帧使用 */
export function playHeavyWhoosh(): void { initSampler(); play('whoosh_heavy', 0.65); }

/** 播放脚步声 — idle/walk/run帧切换时触发 */
export function playFootstep(): void { initSampler(); play('footstep', 0.4); }

/** 播放起跳音效 — 角色离地瞬间触发 */
export function playJump(): void { initSampler(); play('jump', 0.55); }

/** 播放普通落地音效 — 角色从跳跃落地时触发(非KO/非重落地) */
export function playLandingNormal(): void { initSampler(); play('landing_normal', 0.55); }

// === Ryo 必杀技专属音效 API ===

/** 播放虎煌拳音效 — 能量弹发射：低频 whoosh + 高频 sizzle */
export function playKoouken(): void { initSampler(); play('ryo_koouken'); }

/** 播放虎咆音效 — 升龙拳式上勾：上升 sweep + 打击感 */
export function playKoHou(): void { initSampler(); play('ryo_ko_hou'); }

/** 播放飛燕音效 — 飞踢：快速风切 + 踢击 */
export function playHien(): void { initSampler(); play('ryo_hien'); }

/** 播放霸王翔吼拳音效 — 强力能量弹：比 KOOU 更厚重 */
export function playHaou(): void { initSampler(); play('ryo_haou'); }

/** 播放钓瓶打音效 — →+A 手刀劈击：清脆slice声 */
export function playSlice(): void { initSampler(); play('ryo_tsurizao', 0.65); }

/** 播放落蹴音效 — ↘+B 低扫踢：低沉thud声 */
export function playThudKick(): void { initSampler(); play('ryo_orishi', 0.6); }

/** 播放氷果斬音效 — →+A 突进技：重击冲刺声 */
export function playHioHacker(): void { initSampler(); play('ryo_hio_hacker', 0.65); }

/** 播放斩裂拳音效 — qcb+P 连打技：快速连击声 */
export function playZanretsuKen(): void { initSampler(); play('ryo_zanretsu_ken', 0.6); }
