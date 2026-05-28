/**
 * Iori Audio Sampler Regression Tests
 *
 * Validates Iori's audio sampler registration and DSP output.
 */
import { describe, it, expect } from 'vitest';
import { registerIoriAudio } from '../src/content/characters/iori/audio/ioriSampler.js';

const SR = 44100;

describe('Iori Audio Sampler Registration', () => {
  it('registers 8 sample renderers', () => {
    const registered: string[] = [];
    registerIoriAudio((id, _renderer) => {
      registered.push(id);
    });
    expect(registered.length).toBe(8);
  });

  it('registers expected sample IDs', () => {
    const registered: string[] = [];
    registerIoriAudio((id, _renderer) => {
      registered.push(id);
    });
    expect(registered).toContain('iori_aoihana');
    expect(registered).toContain('iori_yamibarai');
    expect(registered).toContain('iori_oniyaki');
    expect(registered).toContain('iori_kototsuki');
    expect(registered).toContain('iori_kuzukaze');
    expect(registered).toContain('iori_yumeyumi');
    expect(registered).toContain('iori_katanugi');
    expect(registered).toContain('iori_yaotome');
  });

  it('all renderers produce non-silent Float32Array', () => {
    const renderers: Record<string, (sr: number) => Float32Array> = {};
    registerIoriAudio((id, renderer) => {
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

  it('all renderers produce bounded output', () => {
    const renderers: Record<string, (sr: number) => Float32Array> = {};
    registerIoriAudio((id, renderer) => {
      renderers[id] = renderer;
    });

    for (const [id, render] of Object.entries(renderers)) {
      const buf = render(SR);
      for (let i = 0; i < buf.length; i++) {
        expect(Math.abs(buf[i]), `${id}[${i}] bounded`).toBeLessThanOrEqual(1.01);
      }
    }
  });

  it('yaotome (DM) has longest duration', () => {
    const renderers: Record<string, (sr: number) => Float32Array> = {};
    registerIoriAudio((id, renderer) => {
      renderers[id] = renderer;
    });

    const yaotome = renderers['iori_yaotome'](SR);
    const yami = renderers['iori_yamibarai'](SR);
    const oni = renderers['iori_oniyaki'](SR);
    expect(yaotome.length).toBeGreaterThan(yami.length);
    expect(yaotome.length).toBeGreaterThan(oni.length);
  });

  it('command normals have shorter duration than specials', () => {
    const renderers: Record<string, (sr: number) => Float32Array> = {};
    registerIoriAudio((id, renderer) => {
      renderers[id] = renderer;
    });

    const yumeyumi = renderers['iori_yumeyumi'](SR);
    const aoihana = renderers['iori_aoihana'](SR);
    expect(yumeyumi.length).toBeLessThanOrEqual(aoihana.length);
  });

  it('renderers produce same length on repeated calls', () => {
    const renderers: Record<string, (sr: number) => Float32Array> = {};
    registerIoriAudio((id, renderer) => {
      renderers[id] = renderer;
    });

    for (const [id, render] of Object.entries(renderers)) {
      const buf1 = render(SR);
      const buf2 = render(SR);
      expect(buf2.length, `${id} consistent length`).toBe(buf1.length);
    }
  });
});
