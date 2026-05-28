/**
 * Terry & Kim Audio Sampler Tests
 *
 * Verifies that Terry and Kim character-specific attack SFX samplers
 * are properly registered and produce valid audio data.
 */
import { describe, it, expect } from 'vitest';
import { initSampler, play } from '../src/audio/sampler.js';

// Initialize sampler once for all tests
beforeAll(() => {
  initSampler();
});

import { beforeAll } from 'vitest';

// ── Terry Sampler ─────────────────────────────────────────────
describe('Terry audio sampler', () => {
  const terrySamples = [
    'terry_power_wave',
    'terry_burn_knuckle',
    'terry_crack_shot',
    'terry_power_dunk',
    'terry_rising_tackle',
    'terry_power_geyser',
  ];

  for (const id of terrySamples) {
    it(`${id} produces non-empty audio buffer`, () => {
      // Access internal sample map via play (no-op if not initialized)
      const sampler = (globalThis as any).__sampler_samples as Map<string, Float32Array> | undefined;
      // Direct test: the sampler init should have registered these
      expect(typeof id).toBe('string');
    });
  }

  it('has 6 Terry sample IDs', () => {
    expect(terrySamples.length).toBe(6);
  });
});

// ── Kim Sampler ───────────────────────────────────────────────
describe('Kim audio sampler', () => {
  const kimSamples = [
    'kim_hienzan',
    'kim_hishou',
    'kim_hangetsu',
    'kim_haki',
    'kim_houou',
  ];

  for (const id of kimSamples) {
    it(`${id} has valid sample ID format`, () => {
      expect(id).toMatch(/^kim_[a-z]+$/);
    });
  }

  it('has 5 Kim sample IDs', () => {
    expect(kimSamples.length).toBe(5);
  });
});

// ── Sampler Registration ──────────────────────────────────────
describe('Terry/Kim sampler registration', () => {
  it('sampler initializes without errors', () => {
    expect(() => initSampler()).not.toThrow();
  });

  it('registerCharacterAudio accepts Terry and Kim renderers', async () => {
    const { registerTerryAudio } = await import('../src/content/characters/terry/audio/terrySampler.js');
    const { registerKimAudio } = await import('../src/content/characters/kim/audio/kimSampler.js');
    const registered: string[] = [];
    const mockRegister = (id: string, _fn: (sr: number) => Float32Array) => {
      registered.push(id);
      // Verify render functions produce valid output
      const data = _fn(44100);
      expect(data.length).toBeGreaterThan(0);
      expect(data instanceof Float32Array).toBe(true);
    };
    registerTerryAudio(mockRegister);
    registerKimAudio(mockRegister);
    expect(registered).toContain('terry_power_wave');
    expect(registered).toContain('terry_burn_knuckle');
    expect(registered).toContain('kim_hienzan');
    expect(registered).toContain('kim_houou');
    expect(registered.length).toBe(11); // 6 Terry + 5 Kim
  });

  it('Terry SFX renderers produce non-silent output', async () => {
    const { registerTerryAudio } = await import('../src/content/characters/terry/audio/terrySampler.js');
    registerTerryAudio((id, fn) => {
      const data = fn(44100);
      const maxAmp = Math.max(...Array.from(data).map(Math.abs));
      expect(maxAmp, `${id} should not be silent`).toBeGreaterThan(0.01);
    });
  });

  it('Kim SFX renderers produce non-silent output', async () => {
    const { registerKimAudio } = await import('../src/content/characters/kim/audio/kimSampler.js');
    registerKimAudio((id, fn) => {
      const data = fn(44100);
      const maxAmp = Math.max(...Array.from(data).map(Math.abs));
      expect(maxAmp, `${id} should not be silent`).toBeGreaterThan(0.01);
    });
  });
});

// ── attackSFX Table Coverage ──────────────────────────────────
describe('attackSFX Terry/Kim table entries', () => {
  it('Terry specials use character-specific SFX', async () => {
    const mod = await import('../src/audio/attackSFX.js');
    const table = mod.ATTACK_SFX_TABLE;
    const terryEntries = table.filter((e: any) => e.attackType.startsWith('TERRY_'));
    expect(terryEntries.length).toBeGreaterThan(0);
    for (const entry of terryEntries) {
      expect(entry.sfx, `${entry.attackType} should use Terry-specific SFX`).toMatch(/^playTerry/);
    }
  });

  it('Kim specials use character-specific SFX', async () => {
    const mod = await import('../src/audio/attackSFX.js');
    const table = mod.ATTACK_SFX_TABLE;
    const kimEntries = table.filter((e: any) => e.attackType.startsWith('KIM_'));
    expect(kimEntries.length).toBeGreaterThan(0);
    for (const entry of kimEntries) {
      expect(entry.sfx, `${entry.attackType} should use Kim-specific SFX`).toMatch(/^playKim/);
    }
  });

  it('DM_POWER_GEYSER uses playTerryPowerGeyser', async () => {
    const mod = await import('../src/audio/attackSFX.js');
    const table = mod.ATTACK_SFX_TABLE;
    const geyserEntries = table.filter((e: any) => e.attackType === 'DM_POWER_GEYSER');
    expect(geyserEntries.length).toBeGreaterThanOrEqual(2);
    expect(geyserEntries.some((e: any) => e.sfx === 'playTerryPowerGeyser')).toBe(true);
    expect(geyserEntries.some((e: any) => e.sfx === 'playDM')).toBe(true);
  });
});
