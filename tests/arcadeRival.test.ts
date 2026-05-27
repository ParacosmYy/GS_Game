/**
 * Arcade rival system tests — verify rival mapping, opponent ordering, and difficulty
 */
import { describe, it, expect } from 'vitest';
import { ROSTER } from '../src/characters/index.js';

/** Rival map from main.ts — duplicated here for test independence */
const RIVAL_MAP: Record<string, string> = {
  kyo: 'iori',
  iori: 'kyo',
  ryo: 'robert',
  robert: 'ryo',
  terry: 'andy',
  andy: 'terry',
  joe: 'terry',
  kim: 'chang',
  chang: 'kim',
  choi: 'kim',
  leona: 'ralf',
  ralf: 'clark',
  clark: 'ralf',
  athena: 'mai',
  mai: 'andy',
  kdash: 'kula',
  kula: 'kdash',
  yashiro: 'chris',
  shermie: 'yashiro',
  chris: 'yashiro',
  mature: 'vice',
  vice: 'mature',
  billy: 'yamazaki',
  yamazaki: 'billy',
  mary: 'terry',
  xiangfei: 'athena',
  kasumi: 'mai',
};

/** Arcade difficulty function from main.ts */
function arcadeDifficulty(base: number, stageIndex: number, totalStages: number): number {
  const baseScalar = base === 0 ? 0.3 : base === 2 ? 0.7 : 0.5;
  const ramp = totalStages > 1 ? (stageIndex / (totalStages - 1)) * 0.3 : 0;
  const rivalSpike = stageIndex === totalStages - 1 ? 0.1 : 0;
  return Math.min(0.98, baseScalar + ramp + rivalSpike);
}

/** Generate opponents with rival at end (mirrors main.ts logic) */
function generateOpponents(p1CharId: string): string[] {
  const rosterIds = ROSTER.map(c => c.id);
  const available = rosterIds.filter(id => id !== p1CharId);
  const rivalId = RIVAL_MAP[p1CharId];
  const rival = rivalId ? available.find(id => id === rivalId) : undefined;
  const rest = rival ? available.filter(id => id !== rivalId) : available;
  // Shuffle (deterministic for test, just use order)
  // Place rival at end
  if (rival) rest.push(rival);
  return rest;
}

describe('Arcade Rival System', () => {
  const rosterIds = new Set(ROSTER.map(c => c.id));

  it('all rival references exist in current ROSTER', () => {
    for (const [charId, rivalId] of Object.entries(RIVAL_MAP)) {
      expect(rosterIds.has(charId), `${charId} should be in ROSTER`).toBe(true);
      expect(rosterIds.has(rivalId), `Rival ${rivalId} of ${charId} should be in ROSTER`).toBe(true);
    }
  });

  it('all ROSTER characters have rival entries', () => {
    for (const char of ROSTER) {
      expect(RIVAL_MAP[char.id], `${char.id} should have a rival`).toBeDefined();
    }
  });

  it('rival is not the same character', () => {
    for (const [charId, rivalId] of Object.entries(RIVAL_MAP)) {
      expect(rivalId, `${charId} rival should not be self`).not.toBe(charId);
    }
  });

  it('Kyo rival is Iori and vice versa', () => {
    expect(RIVAL_MAP.kyo).toBe('iori');
    expect(RIVAL_MAP.iori).toBe('kyo');
  });

  it('Ryo rival is Robert and vice versa', () => {
    expect(RIVAL_MAP.ryo).toBe('robert');
    expect(RIVAL_MAP.robert).toBe('ryo');
  });

  it('generated opponents place rival last', () => {
    const kyoOpponents = generateOpponents('kyo');
    expect(kyoOpponents[kyoOpponents.length - 1]).toBe('iori');
    expect(kyoOpponents).not.toContain('kyo');

    const ryoOpponents = generateOpponents('ryo');
    expect(ryoOpponents[ryoOpponents.length - 1]).toBe('robert');
    expect(ryoOpponents).not.toContain('ryo');
  });

  it('generated opponents include all roster except self', () => {
    const opponents = generateOpponents('kyo');
    const expectedCount = ROSTER.length - 1;
    expect(opponents.length).toBe(expectedCount);
    expect(new Set(opponents).size).toBe(expectedCount);
  });

  it('difficulty increases per stage', () => {
    const d0 = arcadeDifficulty(1, 0, 26);
    const d13 = arcadeDifficulty(1, 13, 26);
    const d25 = arcadeDifficulty(1, 25, 26);
    expect(d13).toBeGreaterThan(d0);
    expect(d25).toBeGreaterThan(d13);
  });

  it('final stage has boss spike', () => {
    const base = arcadeDifficulty(1, 24, 26);
    const final = arcadeDifficulty(1, 25, 26);
    // The jump from 24→25 should be larger than a typical single-stage jump
    const typicalJump = arcadeDifficulty(1, 1, 26) - arcadeDifficulty(1, 0, 26);
    const finalJump = final - base;
    expect(finalJump).toBeGreaterThan(typicalJump);
  });

  it('hard difficulty starts higher than normal', () => {
    const hard = arcadeDifficulty(2, 0, 26);
    const normal = arcadeDifficulty(1, 0, 26);
    const easy = arcadeDifficulty(0, 0, 26);
    expect(hard).toBeGreaterThan(normal);
    expect(normal).toBeGreaterThan(easy);
  });

  it('difficulty caps at 0.98', () => {
    const maxDiff = arcadeDifficulty(2, 25, 26);
    expect(maxDiff).toBeLessThanOrEqual(0.98);
  });
});
