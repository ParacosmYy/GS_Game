/**
 * Sampler Render Utilities
 *
 * Shared DSP primitives used by both the core sampler and character-specific
 * audio renderers. Extracted so character content packages can define their
 * own render functions without depending on sampler.ts internals.
 */

/** Render an oscillator layer into a buffer. */
export function renderOsc(
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

/** Generate noise buffer. */
export function renderNoise(sr: number, duration: number, ampFn: (t: number) => number): Float32Array {
  const len = Math.ceil(sr * duration);
  const buf = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    buf[i] = (Math.random() * 2 - 1) * ampFn(i / sr);
  }
  return buf;
}

/** Apply IIR low-pass filter. */
export function lowPass(data: Float32Array, sr: number, cutoff: number): Float32Array {
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

/** Apply IIR high-pass filter. */
export function highPass(data: Float32Array, sr: number, cutoff: number): Float32Array {
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

/** Band-pass = lowPass(highPass(data)). */
export function bandPass(data: Float32Array, sr: number, low: number, high: number): Float32Array {
  return lowPass(highPass(data, sr, low), sr, high);
}

/** Mix multiple layers with per-layer gains. */
export function mixLayers(layers: Float32Array[], gains: number[]): Float32Array {
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

/** Clamp value to [-1, 1]. */
export function clamp(v: number): number {
  return Math.max(-1, Math.min(1, v));
}

/** Normalize buffer to peak 0.95. */
export function normalize(data: Float32Array): Float32Array {
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

/** Exponential decay helper. */
export function expDecay(t: number, start: number, decay: number): number {
  return start * Math.exp(-t * decay);
}

/** Pad source to target length at a given offset. */
export function padTo(src: Float32Array, totalLen: number, offset: number = 0): Float32Array {
  const out = new Float32Array(totalLen);
  const copyLen = Math.min(src.length, totalLen - offset);
  if (copyLen > 0 && offset < totalLen) out.set(src.subarray(0, copyLen), offset);
  return out;
}
