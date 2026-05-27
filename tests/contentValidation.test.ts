/**
 * Content package validation tests — ensure manifest integrity across all characters
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { validateCharacter, type CharacterReport } from '../src/tools/validateManifest.js';
import { ROSTER } from '../src/characters/index.js';

const REQUIRED_CHARS = ['ryo', 'kyo', 'iori'];

describe('Content Package Validation', () => {
  const results: Map<string, CharacterReport> = new Map();

  beforeAll(() => {
    for (const id of REQUIRED_CHARS) {
      const r = validateCharacter(id);
      if (r.sections.length > 0) results.set(id, r);
    }
  });

  it('all required characters have validation results', () => {
    for (const id of REQUIRED_CHARS) {
      expect(results.has(id), `${id} should have validation result`).toBe(true);
    }
  });

  it('Ryo passes all 80 checks', () => {
    const ryo = results.get('ryo');
    expect(ryo).toBeDefined();
    const total = ryo!.sections.reduce((s, sec) => s + sec.result.total, 0);
    const passed = ryo!.sections.reduce((s, sec) => s + sec.result.pass, 0);
    expect(passed).toBe(total);
    expect(total).toBeGreaterThanOrEqual(80);
  });

  it('Kyo passes all checks', () => {
    const kyo = results.get('kyo');
    expect(kyo).toBeDefined();
    const total = kyo!.sections.reduce((s, sec) => s + sec.result.total, 0);
    const passed = kyo!.sections.reduce((s, sec) => s + sec.result.pass, 0);
    expect(passed).toBe(total);
    expect(total).toBeGreaterThanOrEqual(86);
  });

  it('Iori passes all checks', () => {
    const iori = results.get('iori');
    expect(iori).toBeDefined();
    const total = iori!.sections.reduce((s, sec) => s + sec.result.total, 0);
    const passed = iori!.sections.reduce((s, sec) => s + sec.result.pass, 0);
    expect(passed).toBe(total);
    expect(total).toBeGreaterThanOrEqual(86);
  });

  it('total checks across all characters is 252+', () => {
    let total = 0;
    let passed = 0;
    for (const r of results.values()) {
      for (const sec of r.sections) {
        total += sec.result.total;
        passed += sec.result.pass;
      }
    }
    expect(total).toBeGreaterThanOrEqual(252);
    expect(passed).toBe(total);
  });
});
