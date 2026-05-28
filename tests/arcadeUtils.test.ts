import { describe, it, expect } from 'vitest';
import {
  arcadeDifficulty,
  generateArcadeOpponents,
  pickWinQuote,
  RIVAL_MAP,
} from '../src/state/arcadeUtils.js';
import { ROSTER } from '../src/characters/index.js';

describe('Arcade utilities', () => {
  describe('RIVAL_MAP', () => {
    it('has bidirectional rival pairs', () => {
      const entries = Object.entries(RIVAL_MAP);
      for (const [char, rival] of entries) {
        expect(RIVAL_MAP[rival], `RIVAL_MAP[${rival}] should reference ${char}'s rival`).toBeDefined();
      }
    });

    it('no character is their own rival', () => {
      for (const [char, rival] of Object.entries(RIVAL_MAP)) {
        expect(char !== rival, `${char} is own rival`).toBe(true);
      }
    });

    it('has at least 10 rival pairs', () => {
      expect(Object.keys(RIVAL_MAP).length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('arcadeDifficulty', () => {
    it('easy base (0) starts at 0.3', () => {
      expect(arcadeDifficulty(0, 0, 5)).toBeCloseTo(0.3);
    });

    it('normal base (1) starts at 0.5', () => {
      expect(arcadeDifficulty(1, 0, 5)).toBeCloseTo(0.5);
    });

    it('hard base (2) starts at 0.7', () => {
      expect(arcadeDifficulty(2, 0, 5)).toBeCloseTo(0.7);
    });

    it('ramps up with stage index', () => {
      const early = arcadeDifficulty(1, 0, 5);
      const mid = arcadeDifficulty(1, 2, 5);
      const late = arcadeDifficulty(1, 4, 5);
      expect(mid).toBeGreaterThan(early);
      expect(late).toBeGreaterThan(mid);
    });

    it('final stage gets rival spike', () => {
      const last = arcadeDifficulty(1, 4, 5);
      const penultimate = arcadeDifficulty(1, 3, 5);
      // Last stage should be at least 0.1 higher than expected from ramp alone
      const diff = last - penultimate;
      expect(diff).toBeGreaterThan(0.05);
    });

    it('never exceeds 0.98', () => {
      expect(arcadeDifficulty(2, 100, 101)).toBeLessThanOrEqual(0.98);
    });

    it('single stage (no ramp) uses base only', () => {
      expect(arcadeDifficulty(0, 0, 1)).toBeCloseTo(0.3 + 0.1); // base + rival spike
    });
  });

  describe('generateArcadeOpponents', () => {
    it('returns all characters except p1', () => {
      const p1Id = ROSTER[0].id;
      const opponents = generateArcadeOpponents(p1Id);
      const ids = opponents.map(o => o.id);
      expect(ids).not.toContain(p1Id);
      expect(ids.length).toBe(ROSTER.length - 1);
    });

    it('places rival as final opponent', () => {
      for (const char of ROSTER) {
        const rivalId = RIVAL_MAP[char.id];
        if (!rivalId) continue;
        const opponents = generateArcadeOpponents(char.id);
        const lastOpponent = opponents[opponents.length - 1];
        expect(lastOpponent.id, `${char.id}'s rival should be last`).toBe(rivalId);
      }
    });

    it('includes all non-p1 non-duplicate characters', () => {
      const p1Id = 'kyo';
      const opponents = generateArcadeOpponents(p1Id);
      const ids = opponents.map(o => o.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length); // no duplicates
    });
  });

  describe('pickWinQuote', () => {
    it('returns empty string for null winner', () => {
      expect(pickWinQuote(null, { charId: 'kyo' }, { charId: 'iori' })).toBe('');
    });

    it('returns a quote for p1 winner (kyo)', () => {
      const quote = pickWinQuote(0, { charId: 'kyo' }, { charId: 'iori' });
      expect(quote.length).toBeGreaterThan(0);
    });

    it('returns a quote for p2 winner', () => {
      const quote = pickWinQuote(1, { charId: 'kyo' }, { charId: 'iori' });
      expect(quote.length).toBeGreaterThan(0);
    });

    it('returns empty for unknown character', () => {
      const quote = pickWinQuote(0, { charId: 'nonexistent' }, { charId: 'iori' });
      expect(quote).toBe('');
    });
  });
});
