/**
 * Rival Dialogue Data Regression Tests
 *
 * Validates rival dialogue entries and theme color system.
 */
import { describe, it, expect } from 'vitest';
import {
  getRivalDialogue,
  getRivalThemeColors,
} from '../src/core/rivalData.js';

describe('getRivalDialogue', () => {
  it('finds Kyo vs Iori rivalry', () => {
    const d = getRivalDialogue('kyo', 'iori');
    expect(d).toBeDefined();
    expect(d!.pair).toContain('kyo');
    expect(d!.pair).toContain('iori');
    expect(d!.theme).toBe('fire');
  });

  it('finds Ryo vs Robert rivalry', () => {
    const d = getRivalDialogue('ryo', 'robert');
    expect(d).toBeDefined();
    expect(d!.theme).toBe('honor');
  });

  it('finds Kyo vs Ryo rivalry', () => {
    const d = getRivalDialogue('kyo', 'ryo');
    expect(d).toBeDefined();
    expect(d!.theme).toBe('rivalry');
  });

  it('finds Iori vs Ryo rivalry', () => {
    const d = getRivalDialogue('iori', 'ryo');
    expect(d).toBeDefined();
    expect(d!.theme).toBe('dark');
  });

  it('order-independent lookup', () => {
    const ab = getRivalDialogue('kyo', 'iori');
    const ba = getRivalDialogue('iori', 'kyo');
    expect(ab).toBe(ba);
  });

  it('returns undefined for non-rival pair', () => {
    expect(getRivalDialogue('ryo', 'chang')).toBeUndefined();
  });

  it('returns undefined for identical characters', () => {
    expect(getRivalDialogue('kyo', 'kyo')).toBeUndefined();
  });

  it('has dialogue lines with content', () => {
    const d = getRivalDialogue('kyo', 'iori');
    expect(d!.lineA.length).toBeGreaterThan(0);
    expect(d!.lineB.length).toBeGreaterThan(0);
    expect(d!.lineA).not.toBe(d!.lineB);
  });

  it('has Kyo vs Kdash (flame successors)', () => {
    const d = getRivalDialogue('kyo', 'kdash');
    expect(d).toBeDefined();
    expect(d!.theme).toBe('fire');
  });

  it('has Terry vs Andy (brothers)', () => {
    const d = getRivalDialogue('terry', 'andy');
    expect(d).toBeDefined();
    expect(d!.theme).toBe('rivalry');
  });

  it('has Mai vs Andy (couple)', () => {
    const d = getRivalDialogue('mai', 'andy');
    expect(d).toBeDefined();
    expect(d!.theme).toBe('destiny');
  });

  it('has Kim vs Chang (justice vs criminal)', () => {
    const d = getRivalDialogue('kim', 'chang');
    expect(d).toBeDefined();
    expect(d!.theme).toBe('honor');
  });
});

describe('getRivalThemeColors', () => {
  const themes = ['fire', 'destiny', 'dark', 'honor', 'rivalry'] as const;

  it('returns color object for each theme', () => {
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

  it('border colors are hex or rgba', () => {
    for (const theme of themes) {
      const colors = getRivalThemeColors(theme);
      expect(colors.border).toMatch(/^(#[0-9a-fA-F]{3,6}|rgba?\()/);
    }
  });

  it('different themes have different border colors', () => {
    const borders = themes.map(t => getRivalThemeColors(t).border);
    const unique = new Set(borders);
    expect(unique.size).toBe(themes.length);
  });
});
