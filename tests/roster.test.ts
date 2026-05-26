import { describe, it, expect } from 'vitest';
import { ROSTER } from '../src/characters/index.js';

const EXPECTED_ROSTER_SIZE = 27;

describe('ROSTER validation', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(ROSTER)).toBe(true);
    expect(ROSTER.length).toBeGreaterThan(0);
  });

  it(`has ${EXPECTED_ROSTER_SIZE} characters`, () => {
    expect(ROSTER.length).toBe(EXPECTED_ROSTER_SIZE);
  });

  it('all characters have required fields: id, nameCn, poses, stats', () => {
    for (const char of ROSTER) {
      expect(char).toHaveProperty('id');
      expect(char).toHaveProperty('nameCn');
      expect(char).toHaveProperty('poses');
      expect(char).toHaveProperty('stats');

      expect(typeof char.id).toBe('string');
      expect(char.id.length).toBeGreaterThan(0);
      expect(typeof char.nameCn).toBe('string');
      expect(char.nameCn.length).toBeGreaterThan(0);
      expect(typeof char.poses).toBe('object');
      expect(typeof char.stats).toBe('object');
    }
  });

  it('all character IDs are unique', () => {
    const ids = ROSTER.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('Ryo is present in the roster', () => {
    const ryo = ROSTER.find(c => c.id === 'ryo');
    expect(ryo).toBeDefined();
  });

  it('Ryo has expected properties', () => {
    const ryo = ROSTER.find(c => c.id === 'ryo')!;
    expect(ryo.nameCn).toBeTruthy();
    expect(ryo.poses).toBeDefined();
    expect(ryo.stats).toBeDefined();
    expect(ryo.stats).toHaveProperty('walkSpeed');
    expect(ryo.stats).toHaveProperty('maxHealth');
    expect(typeof ryo.stats.maxHealth).toBe('number');
    expect(ryo.stats.maxHealth).toBeGreaterThan(0);
    expect(ryo.routeSpecial).toBeDefined();
    expect(typeof ryo.routeSpecial).toBe('function');
    expect(ryo.routeNormal).toBeDefined();
    expect(typeof ryo.routeNormal).toBe('function');
  });
});
