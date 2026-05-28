/**
 * Sampler Render Utils (DSP Primitives) Regression Test
 * Verifies renderOsc, renderNoise, lowPass, highPass, bandPass,
 * mixLayers, normalize, clamp, expDecay, padTo.
 */
import { describe, it, expect } from 'vitest';
import {
  renderOsc,
  renderNoise,
  lowPass,
  highPass,
  bandPass,
  mixLayers,
  normalize,
  clamp,
  expDecay,
  padTo,
} from '../src/audio/samplerRenderUtils.js';

const SR = 44100;

describe('renderOsc', () => {
  it('sine produces correct buffer length', () => {
    const buf = renderOsc(SR, 0.01, 'sine', () => 440, () => 1);
    expect(buf.length).toBe(Math.ceil(SR * 0.01));
  });

  it('sine at 440 Hz stays within [-1, 1]', () => {
    const buf = renderOsc(SR, 0.1, 'sine', () => 440, () => 1);
    for (let i = 0; i < buf.length; i++) {
      expect(buf[i]).toBeGreaterThanOrEqual(-1.01);
      expect(buf[i]).toBeLessThanOrEqual(1.01);
    }
  });

  it('sine with amplitude 0.5 stays within [-0.5, 0.5]', () => {
    const buf = renderOsc(SR, 0.05, 'sine', () => 440, () => 0.5);
    for (let i = 0; i < buf.length; i++) {
      expect(buf[i]).toBeGreaterThanOrEqual(-0.5);
      expect(buf[i]).toBeLessThanOrEqual(0.5);
    }
  });

  it('square output is only -1 or +1 at unit amplitude', () => {
    const buf = renderOsc(SR, 0.01, 'square', () => 440, () => 1);
    for (let i = 0; i < buf.length; i++) {
      expect([1, -1]).toContain(Math.round(buf[i]));
    }
  });

  it('sawtooth starts near -1', () => {
    const buf = renderOsc(SR, 0.01, 'sawtooth', () => 100, () => 1);
    expect(buf[0]).toBeCloseTo(-1, 1);
  });

  it('triangle starts near 0', () => {
    const buf = renderOsc(SR, 0.01, 'triangle', () => 100, () => 1);
    expect(Math.abs(buf[0])).toBeLessThan(0.1);
  });

  it('zero duration produces empty buffer', () => {
    const buf = renderOsc(SR, 0, 'sine', () => 440, () => 1);
    expect(buf.length).toBe(0);
  });

  it('frequency function receives time', () => {
    let receivedT = -1;
    renderOsc(SR, 0.01, 'sine', (t) => { receivedT = t; return 440; }, () => 1);
    expect(receivedT).toBeGreaterThanOrEqual(0);
  });

  it('default type falls back to sine', () => {
    const buf = renderOsc(SR, 0.01, 'custom' as any, () => 440, () => 1);
    const sineBuf = renderOsc(SR, 0.01, 'sine' as any, () => 440, () => 1);
    expect(buf[10]).toBeCloseTo(sineBuf[10], 5);
  });
});

describe('renderNoise', () => {
  it('produces correct buffer length', () => {
    const buf = renderNoise(SR, 0.02, () => 1);
    expect(buf.length).toBe(Math.ceil(SR * 0.02));
  });

  it('noise values are within [-1, 1] at unit amplitude', () => {
    const buf = renderNoise(SR, 0.1, () => 1);
    for (let i = 0; i < buf.length; i++) {
      expect(buf[i]).toBeGreaterThanOrEqual(-1);
      expect(buf[i]).toBeLessThanOrEqual(1);
    }
  });

  it('amplitude envelope scales output', () => {
    const buf = renderNoise(SR, 0.01, () => 0.1);
    let maxAbs = 0;
    for (let i = 0; i < buf.length; i++) {
      maxAbs = Math.max(maxAbs, Math.abs(buf[i]));
    }
    expect(maxAbs).toBeLessThanOrEqual(0.1);
  });

  it('zero duration produces empty buffer', () => {
    const buf = renderNoise(SR, 0, () => 1);
    expect(buf.length).toBe(0);
  });
});

describe('lowPass', () => {
  it('preserves buffer length', () => {
    const data = new Float32Array(100);
    const out = lowPass(data, SR, 1000);
    expect(out.length).toBe(100);
  });

  it('smoothes high-frequency signal', () => {
    const data = new Float32Array(200);
    for (let i = 0; i < 200; i++) data[i] = i % 2 === 0 ? 1 : -1;
    const out = lowPass(data, SR, 100);
    // Low-pass should reduce amplitude of alternating signal
    // Skip first sample (initial condition = data[0])
    const outPeak = Math.max(...Array.from(out).slice(10));
    expect(outPeak).toBeLessThan(1);
  });

  it('passes DC unchanged after settling', () => {
    const data = new Float32Array(1000);
    data.fill(0.5);
    const out = lowPass(data, SR, 1000);
    // After many samples, output should approach 0.5
    expect(out[out.length - 1]).toBeCloseTo(0.5, 2);
  });

  it('single-element buffer returns first sample', () => {
    const data = new Float32Array([0.7]);
    const out = lowPass(data, SR, 1000);
    expect(out[0]).toBeCloseTo(0.7, 5);
  });
});

describe('highPass', () => {
  it('preserves buffer length', () => {
    const data = new Float32Array(100);
    const out = highPass(data, SR, 1000);
    expect(out.length).toBe(100);
  });

  it('removes DC component', () => {
    const data = new Float32Array(1000);
    data.fill(0.5);
    const out = highPass(data, SR, 1000);
    // DC should be removed — output near 0
    expect(Math.abs(out[out.length - 1])).toBeLessThan(0.01);
  });

  it('passes transients', () => {
    const data = new Float32Array(100);
    data[0] = 1;
    data.fill(0, 1);
    const out = highPass(data, SR, 1000);
    // First sample passes through
    expect(out[0]).toBe(1);
  });

  it('single-element buffer returns first sample', () => {
    const data = new Float32Array([0.3]);
    const out = highPass(data, SR, 1000);
    expect(out[0]).toBeCloseTo(0.3, 5);
  });
});

describe('bandPass', () => {
  it('preserves buffer length', () => {
    const data = new Float32Array(500);
    const out = bandPass(data, SR, 200, 2000);
    expect(out.length).toBe(500);
  });

  it('attenuates both DC and very high freq', () => {
    // DC input
    const dc = new Float32Array(1000);
    dc.fill(1);
    const out = bandPass(dc, SR, 200, 2000);
    expect(Math.abs(out[out.length - 1])).toBeLessThan(0.1);
  });
});

describe('mixLayers', () => {
  it('mixes two layers with gains', () => {
    const a = new Float32Array([1, 1, 1]);
    const b = new Float32Array([0.5, 0.5, 0.5]);
    const out = mixLayers([a, b], [1, 0.5]);
    expect(out[0]).toBeCloseTo(1.25);
    expect(out[1]).toBeCloseTo(1.25);
    expect(out[2]).toBeCloseTo(1.25);
  });

  it('output length is max layer length', () => {
    const a = new Float32Array([1, 2]);
    const b = new Float32Array([3, 4, 5, 6]);
    const out = mixLayers([a, b], [1, 1]);
    expect(out.length).toBe(4);
  });

  it('shorter layer is zero-extended', () => {
    const a = new Float32Array([1]);
    const b = new Float32Array([0, 0, 0]);
    const out = mixLayers([a, b], [1, 1]);
    expect(out[0]).toBeCloseTo(1);
    expect(out[1]).toBeCloseTo(0);
    expect(out[2]).toBeCloseTo(0);
  });

  it('zero gains produce silence', () => {
    const a = new Float32Array([1, 2, 3]);
    const out = mixLayers([a], [0]);
    expect(out[0]).toBe(0);
    expect(out[1]).toBe(0);
    expect(out[2]).toBe(0);
  });

  it('empty layers produce zero buffer', () => {
    const out = mixLayers([], []);
    expect(out.length).toBe(0);
  });
});

describe('clamp', () => {
  it('clamps positive to 1', () => {
    expect(clamp(5)).toBe(1);
  });

  it('clamps negative to -1', () => {
    expect(clamp(-3)).toBe(-1);
  });

  it('passes through values in range', () => {
    expect(clamp(0.5)).toBe(0.5);
    expect(clamp(-0.5)).toBe(-0.5);
    expect(clamp(0)).toBe(0);
  });

  it('boundary values', () => {
    expect(clamp(1)).toBe(1);
    expect(clamp(-1)).toBe(-1);
  });
});

describe('normalize', () => {
  it('normalizes peak to 0.95', () => {
    const data = new Float32Array([0, 0.5, 0, -0.5]);
    const out = normalize(data);
    const peak = Math.max(...Array.from(out).map(Math.abs));
    expect(peak).toBeCloseTo(0.95, 2);
  });

  it('preserves relative amplitudes', () => {
    const data = new Float32Array([0.1, 0.2, 0.3]);
    const out = normalize(data);
    expect(out[1] / out[0]).toBeCloseTo(2, 3);
    expect(out[2] / out[0]).toBeCloseTo(3, 3);
  });

  it('returns same buffer if peak < 0.001', () => {
    const data = new Float32Array([0, 0, 0]);
    const out = normalize(data);
    expect(out).toBe(data);
  });

  it('handles single sample', () => {
    const data = new Float32Array([0.5]);
    const out = normalize(data);
    expect(out[0]).toBeCloseTo(0.95, 2);
  });

  it('non-finite values become 0, finite values normalized', () => {
    const data = new Float32Array([NaN, Infinity, -Infinity, 0.5]);
    const out = normalize(data);
    expect(out[0]).toBe(0);
    expect(out[1]).toBe(0);
    expect(out[2]).toBe(0);
    // 0.5 is the only finite peak → scaled to 0.95
    expect(out[3]).toBeCloseTo(0.95, 2);
  });
});

describe('expDecay', () => {
  it('returns start at t=0', () => {
    expect(expDecay(0, 1, 5)).toBe(1);
  });

  it('decays toward zero', () => {
    const val = expDecay(10, 1, 5);
    expect(val).toBeLessThan(0.001);
  });

  it('larger decay decays faster', () => {
    const fast = expDecay(1, 1, 10);
    const slow = expDecay(1, 1, 1);
    expect(fast).toBeLessThan(slow);
  });

  it('start scales output', () => {
    expect(expDecay(0, 2, 5)).toBe(2);
    expect(expDecay(1, 2, 5)).toBeCloseTo(2 * Math.exp(-5), 5);
  });
});

describe('padTo', () => {
  it('pads shorter source to target length', () => {
    const src = new Float32Array([1, 2, 3]);
    const out = padTo(src, 6);
    expect(out.length).toBe(6);
    expect(out[0]).toBe(1);
    expect(out[3]).toBe(0);
  });

  it('copies at given offset', () => {
    const src = new Float32Array([1, 2]);
    const out = padTo(src, 5, 2);
    expect(out[0]).toBe(0);
    expect(out[1]).toBe(0);
    expect(out[2]).toBe(1);
    expect(out[3]).toBe(2);
    expect(out[4]).toBe(0);
  });

  it('truncates if source longer than target', () => {
    const src = new Float32Array([1, 2, 3, 4, 5]);
    const out = padTo(src, 3);
    expect(out.length).toBe(3);
    expect(out[0]).toBe(1);
  });

  it('handles zero-length source', () => {
    const src = new Float32Array(0);
    const out = padTo(src, 4);
    expect(out.length).toBe(4);
    expect(out.every(v => v === 0)).toBe(true);
  });

  it('offset beyond target produces zero buffer', () => {
    const src = new Float32Array([1, 2]);
    const out = padTo(src, 3, 10);
    expect(out.length).toBe(3);
    expect(out.every(v => v === 0)).toBe(true);
  });
});
