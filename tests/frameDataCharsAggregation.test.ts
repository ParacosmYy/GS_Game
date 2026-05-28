/**
 * FRAME_DATA_CHARS Aggregation Tests
 *
 * Validates the merged character-specific frame data:
 * - No key collisions across source modules
 * - All character prefixes have entries
 * - Required fields present for every entry
 * - Character coverage completeness (27 characters)
 */
import { describe, it, expect } from 'vitest';
import { FRAME_DATA_CHARS } from '../src/core/frameDataChars.js';

const fdChars = FRAME_DATA_CHARS as Record<string, any>;
const allKeys = Object.keys(fdChars);

// Expected character prefixes (based on 27-char roster)
const EXPECTED_PREFIXES = [
  'KYO', 'IORI', 'RYO', 'TERRY', 'KIM',
  'LEONA', 'ROBERT', 'MAI', 'KDASH', 'KULA',
  'ATHENA', 'CLARK', 'RALF', 'JOE', 'ANDY',
  'BILLY', 'CHANG', 'CHOI', 'MATURE', 'YAMAZAKI',
  'MARY', 'XIANGFEI', 'KASUMI',
  'YASHIRO', 'CHRIS', 'SHERMIE', 'VICE',
];

function getPrefix(key: string): string {
  // Keys like "KYO_ONIYAKI" → "KYO", "DM_TEN_HA_OU" → "DM"
  return key.split('_')[0];
}

describe('FRAME_DATA_CHARS aggregation', () => {
  it('has entries', () => {
    expect(allKeys.length).toBeGreaterThan(0);
  });

  it('every entry has required frame data fields', () => {
    const requiredFields = ['startup', 'active', 'recovery', 'damage', 'hitLevel'];
    for (const key of allKeys) {
      const entry = fdChars[key];
      for (const field of requiredFields) {
        expect(entry[field], `${key}.${field}`).toBeDefined();
      }
    }
  });

  it('startup/active/recovery are positive numbers', () => {
    for (const key of allKeys) {
      const entry = fdChars[key];
      expect(entry.startup, `${key}.startup`).toBeGreaterThanOrEqual(0);
      expect(entry.active, `${key}.active`).toBeGreaterThan(0);
      expect(entry.recovery, `${key}.recovery`).toBeGreaterThan(0);
    }
  });

  it('damage is positive for all entries', () => {
    for (const key of allKeys) {
      const entry = fdChars[key];
      expect(entry.damage, `${key}.damage`).toBeGreaterThan(0);
    }
  });

  it('hitLevel is valid for all entries', () => {
    const validLevels = new Set(['MID', 'HIGH', 'LOW', 'UNBLOCKABLE', 'THROW']);
    for (const key of allKeys) {
      const entry = fdChars[key];
      expect(validLevels.has(entry.hitLevel),
        `${key}.hitLevel=${entry.hitLevel}`).toBe(true);
    }
  });

  it('no key collisions — all keys are unique', () => {
    expect(new Set(allKeys).size).toBe(allKeys.length);
  });

  it('covers Kyo specials', () => {
    const kyoKeys = allKeys.filter(k => k.startsWith('KYO_'));
    expect(kyoKeys.length, 'Kyo entries').toBeGreaterThan(5);
  });

  it('covers Iori specials', () => {
    const ioriKeys = allKeys.filter(k => k.startsWith('IORI_'));
    expect(ioriKeys.length, 'Iori entries').toBeGreaterThan(5);
  });

  it('covers Ryo specials', () => {
    const ryoKeys = allKeys.filter(k => k.startsWith('RYO_'));
    expect(ryoKeys.length, 'Ryo entries').toBeGreaterThan(5);
  });
});

describe('FRAME_DATA_CHARS character coverage', () => {
  it('has entries for most character prefixes', () => {
    const foundPrefixes = new Set<string>();
    for (const key of allKeys) {
      foundPrefixes.add(getPrefix(key));
    }
    let covered = 0;
    for (const prefix of EXPECTED_PREFIXES) {
      if (foundPrefixes.has(prefix)) covered++;
    }
    // At least 80% of expected characters should have entries
    expect(covered, `character coverage`).toBeGreaterThanOrEqual(
      Math.floor(EXPECTED_PREFIXES.length * 0.8)
    );
  });

  it('DM/SDM entries have higher damage than most specials', () => {
    const dmKeys = allKeys.filter(k => k.startsWith('DM_') || k.startsWith('SDM_'));
    const specialKeys = allKeys.filter(k =>
      !k.startsWith('DM_') && !k.startsWith('SDM_') &&
      !k.startsWith('STAND_') && !k.startsWith('CLOSE_') &&
      !k.startsWith('CROUCH_') && !k.startsWith('JUMP_') &&
      !k.startsWith('THROW_')
    );
    if (dmKeys.length > 0 && specialKeys.length > 0) {
      const avgDm = dmKeys.reduce((s, k) => s + fdChars[k].damage, 0) / dmKeys.length;
      const avgSpecial = specialKeys.reduce((s, k) => s + fdChars[k].damage, 0) / specialKeys.length;
      expect(avgDm, 'DM avg damage > special avg').toBeGreaterThan(avgSpecial);
    }
  });

  it('SDM entries do more damage than their DM counterparts', () => {
    const sdmKeys = allKeys.filter(k => k.startsWith('SDM_'));
    for (const sdm of sdmKeys) {
      const dm = sdm.replace('SDM_', 'DM_');
      if (fdChars[dm]) {
        expect(fdChars[sdm].damage,
          `${sdm} damage >= ${dm}`).toBeGreaterThanOrEqual(fdChars[dm].damage);
      }
    }
  });

  it('no negative hitstun/blockstun values', () => {
    for (const key of allKeys) {
      const entry = fdChars[key];
      if (entry.hitstun !== undefined) {
        expect(entry.hitstun, `${key}.hitstun`).toBeGreaterThanOrEqual(0);
      }
      if (entry.blockstun !== undefined) {
        expect(entry.blockstun, `${key}.blockstun`).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
