/**
 * Ryo Audio Sampler Regression Tests
 *
 * Validates Ryo's audio sampler registration and DSP output.
 */
import { describe, it, expect } from 'vitest';
import { registerRyoAudio } from '../src/content/characters/ryo/audio/ryoSampler.js';

const SR = 44100;

describe('Ryo Audio Sampler Registration', () => {
  it('registers 8 sample renderers', () => {
    const registered: string[] = [];
    registerRyoAudio((id, _renderer) => {
      registered.push(id);
    });
    expect(registered.length).toBe(8);
  });

  it('registers expected sample IDs', () => {
    const registered: string[] = [];
    registerRyoAudio((id, _renderer) => {
      registered.push(id);
    });
    expect(registered).toContain('ryo_koouken');
    expect(registered).toContain('ryo_ko_hou');
    expect(registered).toContain('ryo_hien');
    expect(registered).toContain('ryo_haou');
    expect(registered).toContain('ryo_tsurizao');
    expect(registered).toContain('ryo_orishi');
    expect(registered).toContain('ryo_hio_hacker');
    expect(registered).toContain('ryo_zanretsu_ken');
  });

  it('all renderers produce non-silent Float32Array', () => {
    const renderers: Record<string, (sr: number) => Float32Array> = {};
    registerRyoAudio((id, renderer) => {
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
    registerRyoAudio((id, renderer) => {
      renderers[id] = renderer;
    });

    for (const [id, render] of Object.entries(renderers)) {
      const buf = render(SR);
      for (let i = 0; i < buf.length; i++) {
        expect(Math.abs(buf[i]), `${id}[${i}] bounded`).toBeLessThanOrEqual(1.01);
      }
    }
  });

  it('ko_hou (uppercut) has distinct length from koouken (projectile)', () => {
    const renderers: Record<string, (sr: number) => Float32Array> = {};
    registerRyoAudio((id, renderer) => {
      renderers[id] = renderer;
    });

    const koou = renderers['ryo_koouken'](SR);
    const kou = renderers['ryo_ko_hou'](SR);
    // Different moves should have different durations
    expect(koou.length).not.toBe(kou.length);
  });

  it('command normals have shorter duration than specials', () => {
    const renderers: Record<string, (sr: number) => Float32Array> = {};
    registerRyoAudio((id, renderer) => {
      renderers[id] = renderer;
    });

    const tsurizao = renderers['ryo_tsurizao'](SR);
    const koouken = renderers['ryo_koouken'](SR);
    expect(tsurizao.length).toBeLessThanOrEqual(koouken.length);
  });

  it('renderers produce same length on repeated calls', () => {
    const renderers: Record<string, (sr: number) => Float32Array> = {};
    registerRyoAudio((id, renderer) => {
      renderers[id] = renderer;
    });

    for (const [id, render] of Object.entries(renderers)) {
      const buf1 = render(SR);
      const buf2 = render(SR);
      expect(buf2.length, `${id} consistent length`).toBe(buf1.length);
    }
  });
});
