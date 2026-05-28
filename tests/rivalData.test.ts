/**
 * Rival Data Regression Test
 * Verifies rival dialogue data, bidirectional lookup, and theme color consistency.
 */
import { describe, it, expect } from 'vitest';
import {
  getRivalDialogue,
  getRivalThemeColors,
  type RivalDialogue,
} from '../src/core/rivalData.js';

describe('Rival Dialogues', () => {
  it('kyo vs iori has dialogue', () => {
    const d = getRivalDialogue('kyo', 'iori');
    expect(d).toBeDefined();
    expect(d!.theme).toBe('fire');
    expect(d!.lineA.length).toBeGreaterThan(0);
    expect(d!.lineB.length).toBeGreaterThan(0);
  });

  it('lookup is order-independent (iori vs kyo)', () => {
    const ab = getRivalDialogue('kyo', 'iori');
    const ba = getRivalDialogue('iori', 'kyo');
    expect(ab).toBe(ba);
  });

  it('ryo vs robert has honor theme', () => {
    const d = getRivalDialogue('ryo', 'robert');
    expect(d).toBeDefined();
    expect(d!.theme).toBe('honor');
  });

  it('kyo vs ryo has rivalry theme', () => {
    const d = getRivalDialogue('kyo', 'ryo');
    expect(d).toBeDefined();
    expect(d!.theme).toBe('rivalry');
  });

  it('returns undefined for non-rival pair', () => {
    const d = getRivalDialogue('clark', 'kula');
    expect(d).toBeUndefined();
  });

  it('returns undefined for same character', () => {
    const d = getRivalDialogue('kyo', 'kyo');
    expect(d).toBeUndefined();
  });

  it('all themes are valid', () => {
    const validThemes = new Set(['fire', 'destiny', 'dark', 'honor', 'rivalry']);
    // Check all pairs by trying known combinations
    const pairs: [string, string][] = [
      ['kyo', 'iori'], ['ryo', 'robert'], ['kyo', 'ryo'],
      ['iori', 'ryo'], ['kyo', 'kdash'], ['iori', 'leona'],
      ['kim', 'chang'], ['terry', 'andy'], ['mai', 'andy'],
      ['kdash', 'kula'], ['joe', 'terry'],
    ];
    for (const [a, b] of pairs) {
      const d = getRivalDialogue(a, b);
      if (d) {
        expect(validThemes, `${a} vs ${b}`).toContain(d.theme);
      }
    }
  });

  it('has at least 10 rival pairs', () => {
    // Count unique pairs by checking known characters
    const chars = ['kyo', 'iori', 'ryo', 'robert', 'kdash', 'leona', 'kim', 'chang',
                   'terry', 'andy', 'mai', 'kula', 'joe', 'chizuru', 'takuma'];
    let count = 0;
    for (let i = 0; i < chars.length; i++) {
      for (let j = i + 1; j < chars.length; j++) {
        if (getRivalDialogue(chars[i], chars[j])) count++;
      }
    }
    expect(count).toBeGreaterThanOrEqual(10);
  });
});

describe('Rival Theme Colors', () => {
  const themes = ['fire', 'destiny', 'dark', 'honor', 'rivalry'] as const;

  it('all 5 themes have color definitions', () => {
    for (const theme of themes) {
      const colors = getRivalThemeColors(theme);
      expect(colors).toBeDefined();
      expect(colors.bg).toBeTruthy();
      expect(colors.border).toBeTruthy();
      expect(colors.textA).toBeTruthy();
      expect(colors.textB).toBeTruthy();
      expect(colors.flash).toBeTruthy();
    }
  });

  it('border colors are hex format', () => {
    for (const theme of themes) {
      const colors = getRivalThemeColors(theme);
      expect(colors.border, `${theme} border`).toMatch(/^#[0-9a-f]{6}$/);
      expect(colors.flash, `${theme} flash`).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('bg colors are rgba format', () => {
    for (const theme of themes) {
      const colors = getRivalThemeColors(theme);
      expect(colors.bg, `${theme} bg`).toMatch(/^rgba\(/);
    }
  });

  it('text colors are distinct for A and B', () => {
    for (const theme of themes) {
      const colors = getRivalThemeColors(theme);
      expect(colors.textA).not.toBe(colors.textB);
    }
  });

  it('fire theme has warm colors', () => {
    const colors = getRivalThemeColors('fire');
    expect(colors.border).toContain('ff');
    expect(colors.flash).toContain('ff');
  });

  it('dark theme has purple tones', () => {
    const colors = getRivalThemeColors('dark');
    expect(colors.border).toContain('aa');
  });
});
