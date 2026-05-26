import { describe, it, expect } from 'vitest';
import { RYO_MOVE_LIST, RYO_WIN_QUOTES } from '../src/content/characters/ryo/commands.js';

describe('ryoCommands', () => {
  it('RYO_MOVE_LIST is non-empty array', () => {
    expect(Array.isArray(RYO_MOVE_LIST)).toBe(true);
    expect(RYO_MOVE_LIST.length).toBeGreaterThan(0);
  });
  it('RYO_WIN_QUOTES is non-empty array', () => {
    expect(Array.isArray(RYO_WIN_QUOTES)).toBe(true);
    expect(RYO_WIN_QUOTES.length).toBeGreaterThan(0);
  });
  it('moves have name field', () => {
    for (const move of RYO_MOVE_LIST) {
      expect(move).toHaveProperty('name');
    }
  });
  it('moves have input field', () => {
    for (const move of RYO_MOVE_LIST) {
      expect(move).toHaveProperty('input');
    }
  });
  it('win quotes are strings', () => {
    for (const q of RYO_WIN_QUOTES) {
      expect(typeof q).toBe('string');
    }
  });
});
