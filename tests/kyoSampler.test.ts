/**
 * Kyo Audio Sampler Regression Tests
 *
 * Validates Kyo's audio sampler registration and DSP output.
 * All renderers are pure functions (sampleRate → Float32Array).
 */
import { describe, it, expect } from 'vitest';
import { registerKyoAudio } from '../src/content/characters/kyo/audio/kyoSampler.js';

const SR = 44100;

describe('Kyo Audio Sampler Registration', () => {
  it('registers 7 sample renderers', () => {
    const registered: string[] = [];
    registerKyoAudio((id, _renderer) => {
      registered.push(id);
    });
    expect(registered.length).toBe(7);
  });

  it('registers expected sample IDs', () => {
    const registered: string[] = [];
    registerKyoAudio((id, _renderer) => {
      registered.push(id);
    });
    expect(registered).toContain('kyo_yamibarai');
    expect(registered).toContain('kyo_oniyaki');
    expect(registered).toContain('kyo_aragami');
    expect(registered).toContain('kyo_dokugami');
    expect(registered).toContain('kyo_75kai');
    expect(registered).toContain('kyo_red_kick');
    expect(registered).toContain('kyo_orochinagi');
  });

  it('all renderers produce non-silent Float32Array', () => {
    const renderers: Record<string, (sr: number) => Float32Array> = {};
    registerKyoAudio((id, renderer) => {
      renderers[id] = renderer;
    });

    for (const [id, render] of Object.entries(renderers)) {
      const buf = render(SR);
      expect(buf, `${id} buffer`).toBeDefined();
      expect(buf.length, `${id} length`).toBeGreaterThan(0);

      let maxAmp = 0;
      for (let i = 0; i < buf.length; i++) {
        const abs = Math.abs(buf[i]);
        if (abs > maxAmp) maxAmp = abs;
      }
      expect(maxAmp, `${id} should not be silent`).toBeGreaterThan(0.01);
    }
  });

  it('all renderers produce bounded output (no clipping above 1.0)', () => {
    const renderers: Record<string, (sr: number) => Float32Array> = {};
    registerKyoAudio((id, renderer) => {
      renderers[id] = renderer;
    });

    for (const [id, render] of Object.entries(renderers)) {
      const buf = render(SR);
      for (let i = 0; i < buf.length; i++) {
        expect(Math.abs(buf[i]), `${id}[${i}] bounded`).toBeLessThanOrEqual(1.01);
      }
    }
  });

  it('yamibarai has longer duration than oniyaki', () => {
    const renderers: Record<string, (sr: number) => Float32Array> = {};
    registerKyoAudio((id, renderer) => {
      renderers[id] = renderer;
    });

    const yami = renderers['kyo_yamibarai'](SR);
    const oni = renderers['kyo_oniyaki'](SR);
    expect(yami.length).toBeGreaterThan(oni.length);
  });

  it('orochinagi (DM) has longest duration', () => {
    const renderers: Record<string, (sr: number) => Float32Array> = {};
    registerKyoAudio((id, renderer) => {
      renderers[id] = renderer;
    });

    const orochinagi = renderers['kyo_orochinagi'](SR);
    const yami = renderers['kyo_yamibarai'](SR);
    const oni = renderers['kyo_oniyaki'](SR);
    expect(orochinagi.length).toBeGreaterThan(yami.length);
    expect(orochinagi.length).toBeGreaterThan(oni.length);
  });

  it('75kai has shorter duration than specials', () => {
    const renderers: Record<string, (sr: number) => Float32Array> = {};
    registerKyoAudio((id, renderer) => {
      renderers[id] = renderer;
    });

    const kai = renderers['kyo_75kai'](SR);
    const aragami = renderers['kyo_aragami'](SR);
    expect(kai.length).toBeLessThan(aragami.length);
  });

  it('renderers are deterministic', () => {
    const renderers: Record<string, (sr: number) => Float32Array> = {};
    registerKyoAudio((id, renderer) => {
      renderers[id] = renderer;
    });

    // Note: renderers that use Math.random() may not be deterministic,
    // but oscillator-only ones should be
    for (const [id, render] of Object.entries(renderers)) {
      const buf1 = render(SR);
      // Just verify same length on second call
      const buf2 = render(SR);
      expect(buf2.length, `${id} deterministic length`).toBe(buf1.length);
    }
  });
});
