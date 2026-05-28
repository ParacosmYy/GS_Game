/**
 * DSP Sampler Render Utilities Tests
 *
 * Validates pure DSP functions from src/audio/samplerRenderUtils.ts.
 * All functions are stateless with no audio context dependency.
 */
import { describe, it, expect } from 'vitest';
import {
  renderOsc,
  renderNoise,
  lowPass,
  highPass,
  bandPass,
  mixLayers,
  clamp,
  normalize,
  expDecay,
  padTo,
} from '../src/audio/samplerRenderUtils.js';

const SR = 44100;

// ===== renderOsc =====

describe('renderOsc', () => {
  it('returns Float32Array with correct length', () => {
    const dur = 0.01; // 10ms
    const buf = renderOsc(SR, dur, 'sine', () => 440, () => 1);
    expect(buf.length).toBe(Math.ceil(SR * dur));
  });

  it('produces non-zero values for sine at 440Hz', () => {
    const buf = renderOsc(SR, 0.01, 'sine', () => 440, () => 1);
    const hasNonZero = buf.some(v => v !== 0);
    expect(hasNonZero).toBe(true);
  });

  it('square wave values are in [-1, 1]', () => {
    const buf = renderOsc(SR, 0.01, 'square', () => 440, () => 1);
    for (let i = 0; i < buf.length; i++) {
      expect(Math.abs(buf[i]), `square[${i}]`).toBeLessThanOrEqual(1.001);
    }
  });

  it('sawtooth wave values are in [-1, 1]', () => {
    const buf = renderOsc(SR, 0.01, 'sawtooth', () => 440, () => 1);
    for (let i = 0; i < buf.length; i++) {
      expect(Math.abs(buf[i]), `saw[${i}]`).toBeLessThanOrEqual(1.001);
    }
  });

  it('triangle wave values are in [-1, 1]', () => {
    const buf = renderOsc(SR, 0.01, 'triangle', () => 440, () => 1);
    for (let i = 0; i < buf.length; i++) {
      expect(Math.abs(buf[i]), `tri[${i}]`).toBeLessThanOrEqual(1.001);
    }
  });

  it('amplitude envelope scales output', () => {
    const full = renderOsc(SR, 0.005, 'sine', () => 440, () => 1);
    const half = renderOsc(SR, 0.005, 'sine', () => 440, () => 0.5);
    // Half amp should have lower peak
    const peakFull = Math.max(...Array.from(full).map(Math.abs));
    const peakHalf = Math.max(...Array.from(half).map(Math.abs));
    expect(peakHalf).toBeLessThan(peakFull);
  });

  it('returns empty buffer for duration 0', () => {
    const buf = renderOsc(SR, 0, 'sine', () => 440, () => 1);
    expect(buf.length).toBe(0);
  });
});

// ===== renderNoise =====

describe('renderNoise', () => {
  it('returns Float32Array with correct length', () => {
    const buf = renderNoise(SR, 0.01, () => 1);
    expect(buf.length).toBe(Math.ceil(SR * 0.01));
  });

  it('produces non-zero values', () => {
    const buf = renderNoise(SR, 0.01, () => 1);
    const hasNonZero = buf.some(v => v !== 0);
    expect(hasNonZero).toBe(true);
  });

  it('values are bounded by amplitude function', () => {
    const buf = renderNoise(SR, 0.01, () => 0.5);
    for (let i = 0; i < buf.length; i++) {
      expect(Math.abs(buf[i]), `noise[${i}]`).toBeLessThanOrEqual(0.5 + 0.001);
    }
  });
});

// ===== Filters =====

describe('lowPass', () => {
  it('returns same-length buffer', () => {
    const src = new Float32Array(100).map(() => Math.random() * 2 - 1);
    const out = lowPass(src, SR, 1000);
    expect(out.length).toBe(src.length);
  });

  it('smooths high-frequency noise', () => {
    const src = new Float32Array(200).map(() => Math.random() * 2 - 1);
    const out = lowPass(src, SR, 100);
    // Variance of filtered signal should be lower
    const varSrc = variance(src);
    const varOut = variance(out);
    expect(varOut).toBeLessThan(varSrc);
  });
});

describe('highPass', () => {
  it('returns same-length buffer', () => {
    const src = new Float32Array(100).map(() => Math.random() * 2 - 1);
    const out = highPass(src, SR, 1000);
    expect(out.length).toBe(src.length);
  });

  it('removes DC offset', () => {
    const src = new Float32Array(200).map(() => 0.5); // constant DC
    const out = highPass(src, SR, 100);
    // After initial transient, output should be near zero
    const tailAvg = avg(Array.from(out).slice(50));
    expect(Math.abs(tailAvg)).toBeLessThan(0.15);
  });
});

describe('bandPass', () => {
  it('returns same-length buffer', () => {
    const src = new Float32Array(100).map(() => Math.random() * 2 - 1);
    const out = bandPass(src, SR, 200, 2000);
    expect(out.length).toBe(src.length);
  });
});

// ===== mixLayers =====

describe('mixLayers', () => {
  it('mixes two layers with gains', () => {
    const a = new Float32Array([1, 1, 1]);
    const b = new Float32Array([2, 2, 2]);
    const out = mixLayers([a, b], [0.5, 0.5]);
    expect(out.length).toBe(3);
    expect(out[0]).toBeCloseTo(1.5, 4);
  });

  it('handles different-length layers (zero-pads shorter)', () => {
    const a = new Float32Array([1, 1, 1, 1]);
    const b = new Float32Array([2, 2]);
    const out = mixLayers([a, b], [1, 1]);
    expect(out.length).toBe(4);
    expect(out[0]).toBeCloseTo(3, 4);
    expect(out[2]).toBeCloseTo(1, 4); // b is 0 here
  });

  it('returns empty buffer for no layers', () => {
    const out = mixLayers([], []);
    expect(out.length).toBe(0);
  });
});

// ===== clamp =====

describe('clamp', () => {
  it('clamps positive values to 1', () => {
    expect(clamp(5)).toBe(1);
  });
  it('clamps negative values to -1', () => {
    expect(clamp(-3)).toBe(-1);
  });
  it('passes values in [-1, 1] through', () => {
    expect(clamp(0.5)).toBe(0.5);
    expect(clamp(-0.5)).toBe(-0.5);
    expect(clamp(0)).toBe(0);
  });
});

// ===== normalize =====

describe('normalize', () => {
  it('normalizes peak to ~0.95', () => {
    const buf = new Float32Array([0, 0.5, 0, -0.5]);
    const out = normalize(buf);
    const peak = Math.max(...Array.from(out).map(Math.abs));
    expect(peak).toBeCloseTo(0.95, 2);
  });

  it('returns input unchanged when peak < 0.001', () => {
    const buf = new Float32Array([0.0001, 0.00005]);
    const out = normalize(buf);
    expect(out).toBe(buf); // same reference
  });

  it('handles NaN/Infinity gracefully', () => {
    const buf = new Float32Array([1, NaN, Infinity, -Infinity, 0.5]);
    const out = normalize(buf);
    const hasNaN = Array.from(out).some(v => !Number.isFinite(v));
    expect(hasNaN).toBe(false);
  });
});

// ===== expDecay =====

describe('expDecay', () => {
  it('returns start at t=0', () => {
    expect(expDecay(0, 1, 5)).toBe(1);
  });

  it('decays toward 0', () => {
    const val = expDecay(10, 1, 5);
    expect(val).toBeGreaterThan(0);
    expect(val).toBeLessThan(0.01);
  });

  it('preserves start value', () => {
    expect(expDecay(0, 2.5, 3)).toBeCloseTo(2.5, 6);
  });
});

// ===== padTo =====

describe('padTo', () => {
  it('pads source to target length', () => {
    const src = new Float32Array([1, 2, 3]);
    const out = padTo(src, 6);
    expect(out.length).toBe(6);
    expect(out[0]).toBe(1);
    expect(out[3]).toBe(0);
  });

  it('respects offset', () => {
    const src = new Float32Array([1, 2, 3]);
    const out = padTo(src, 6, 2);
    expect(out[0]).toBe(0);
    expect(out[2]).toBe(1);
    expect(out[4]).toBe(3);
    expect(out[5]).toBe(0);
  });

  it('handles src longer than target gracefully', () => {
    const src = new Float32Array([1, 2, 3, 4, 5]);
    const out = padTo(src, 3);
    expect(out.length).toBe(3);
  });
});

// ===== Helpers =====

function variance(arr: Float32Array | number[]): number {
  const a = Array.from(arr);
  const m = avg(a);
  return avg(a.map(v => (v - m) ** 2));
}

function avg(a: number[]): number {
  return a.reduce((s, v) => s + v, 0) / a.length;
}
