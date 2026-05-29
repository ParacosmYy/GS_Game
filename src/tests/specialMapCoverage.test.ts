/**
 * SpecialMap Coverage Tests
 *
 * Validates that all KOF2002 roster characters with MUGEN sprites
 * have complete specialMap entries covering normals, specials, and DMs.
 */
import { describe, it, expect } from 'vitest';
import { getCharacterConfig, getAllRegisteredCharacters } from '../rendering/sprites/shared/characterSpriteRegistry.js';
import '../rendering/sprites/shared/characterSpriteConfigs.js';

const KOF2002_ROSTER = [
  'kyo', 'ryo', 'athena', 'terry', 'kim',
  'vice', 'yamazaki', 'shermie', 'benimaru', 'heidern', 'yuri',
];

const NORMAL_ATTACKS = [
  'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
  'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
];

describe('SpecialMap Coverage — KOF2002 Roster', () => {
  it('all KOF2002 roster characters are registered', () => {
    for (const charId of KOF2002_ROSTER) {
      const config = getCharacterConfig(charId);
      expect(config, `${charId} should be registered`).toBeDefined();
    }
  });

  it.each(KOF2002_ROSTER)('%s has at least 15 specialMap entries', (charId) => {
    const config = getCharacterConfig(charId)!;
    const entries = Object.keys(config.specialMap);
    expect(entries.length, `${charId} specialMap size`).toBeGreaterThanOrEqual(15);
  });

  it.each(KOF2002_ROSTER.filter(c => c !== 'kyo' && c !== 'ryo'))(
    '%s has all 12 normal attack mappings',
    (charId) => {
      const config = getCharacterConfig(charId)!;
      for (const normal of NORMAL_ATTACKS) {
        expect(
          config.specialMap[normal as keyof typeof config.specialMap],
          `${charId} should map ${normal}`,
        ).toBeDefined();
      }
    },
  );

  it('total specialMap entries across all KOF2002 roster >= 200', () => {
    let total = 0;
    for (const charId of KOF2002_ROSTER) {
      const config = getCharacterConfig(charId);
      if (config) {
        total += Object.keys(config.specialMap).length;
      }
    }
    expect(total).toBeGreaterThanOrEqual(200);
  });

  it('each character has DM entries in specialMap', () => {
    for (const charId of KOF2002_ROSTER) {
      const config = getCharacterConfig(charId)!;
      const dmEntries = Object.keys(config.specialMap).filter(k =>
        k.startsWith('DM_') || k.startsWith('SDM_') || k.startsWith('HSDM_'),
      );
      expect(dmEntries.length, `${charId} should have DM entries`).toBeGreaterThanOrEqual(1);
    }
  });

  it('action numbers are valid MUGEN format (numeric strings)', () => {
    for (const charId of KOF2002_ROSTER) {
      const config = getCharacterConfig(charId)!;
      for (const [attack, action] of Object.entries(config.specialMap)) {
        expect(
          /^\d{3,4}$/.test(action),
          `${charId} ${attack}→${action} should be numeric MUGEN action`,
        ).toBe(true);
      }
    }
  });

  it('no duplicate action numbers within a character', () => {
    for (const charId of KOF2002_ROSTER) {
      const config = getCharacterConfig(charId)!;
      const actions = Object.values(config.specialMap);
      const unique = new Set(actions);
      // Allow some duplicates (e.g., close/stand sharing action) but not too many
      expect(unique.size, `${charId} should have mostly unique action numbers`).toBeGreaterThanOrEqual(actions.length * 0.6);
    }
  });
});

describe('SpecialMap registry consistency', () => {
  it('all registered characters have valid mugenDir', () => {
    const all = getAllRegisteredCharacters();
    for (const config of all) {
      expect(config.mugenDir, `${config.charId} mugenDir`).toBeTruthy();
      expect(config.targetDisplayHeight, `${config.charId} height`).toBeGreaterThan(50);
      expect(config.targetDisplayHeight, `${config.charId} height`).toBeLessThan(200);
    }
  });

  it('defaultTint is a valid hex color', () => {
    const hexRegex = /^#[0-9a-f]{6}$/;
    const all = getAllRegisteredCharacters();
    for (const config of all) {
      expect(hexRegex.test(config.defaultTint), `${config.charId} tint ${config.defaultTint}`).toBe(true);
    }
  });

  it('all KOF2002 roster characters have targetDisplayHeight in reasonable range', () => {
    for (const charId of KOF2002_ROSTER) {
      const config = getCharacterConfig(charId)!;
      expect(config.targetDisplayHeight).toBeGreaterThanOrEqual(80);
      expect(config.targetDisplayHeight).toBeLessThanOrEqual(140);
    }
  });
});
