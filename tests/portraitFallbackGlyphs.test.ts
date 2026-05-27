import { describe, it, expect } from 'vitest';
import { KyoDef } from '../src/characters/kyo.js';
import { IoriDef } from '../src/characters/iori.js';

function isEmojiLike(value: string): boolean {
  return /\p{Extended_Pictographic}/u.test(value);
}

describe('portrait fallback glyphs', () => {
  it('Kyo uses a non-emoji fallback glyph', () => {
    expect(isEmojiLike(KyoDef.portrait)).toBe(false);
  });

  it('Iori uses a non-emoji fallback glyph', () => {
    expect(isEmojiLike(IoriDef.portrait)).toBe(false);
  });
});
