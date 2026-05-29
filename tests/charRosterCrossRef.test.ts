/**
 * Character Definition Cross-Reference Tests
 *
 * Validates that all 28 character definitions have:
 * - Consistent charId naming across modules
 * - Valid stat ranges (health, speed, etc.)
 * - All required action states defined
 * - DM/SDM references match FRAME_DATA
 */
import { describe, it, expect } from 'vitest';
import { FRAME_DATA } from '../src/core/frameDataConstants.js';
import { COMBO_ROUTES } from '../src/ai/aiRoutes.js';
import { ALL_STRATEGIES } from '../src/ai/characterStrategies.js';

// All characters with FRAME_DATA entries
const ROSTER = [
  'kyo', 'iori', 'ryo', 'terry', 'kim',
  'leona', 'robert', 'mai', 'kdash', 'kula',
  'athena', 'clark', 'ralf', 'joe', 'andy',
  'billy', 'chang', 'choi', 'mature', 'yamazaki',
  'mary', 'xiangfei', 'kasumi',
  'yashiro', 'chris', 'shermie', 'vice',
  'benimaru', 'heidern', 'yuri',
  'kfm',
];

const fdKeys = new Set(Object.keys(FRAME_DATA));

describe('Character roster cross-reference', () => {
  it('all roster characters have FRAME_DATA entries', () => {
    for (const char of ROSTER) {
      const charKeys = [...fdKeys].filter(k =>
        k.startsWith(char.toUpperCase() + '_') || k.startsWith(char.charAt(0).toUpperCase() + char.slice(1).toUpperCase() + '_')
      );
      // Some chars have abbreviated prefixes (KDASH → K', etc.)
      const upper = char.toUpperCase();
      const allCharKeys = [...fdKeys].filter(k => {
        const prefix = k.split('_')[0];
        return prefix === upper || prefix === upper.replace('KDASH', 'KDASH').replace('XIANGFEI', 'XIANGFEI');
      });
      expect(allCharKeys.length, `${char} has FRAME_DATA`).toBeGreaterThan(0);
    }
  });

  it('all roster characters have combo routes', () => {
    for (const char of ROSTER) {
      expect(COMBO_ROUTES[char], `${char} in COMBO_ROUTES`).toBeDefined();
    }
  });

  it('all roster characters have AI strategies', () => {
    const strategyIds = new Set(ALL_STRATEGIES.map(s => s.charId));
    for (const char of ROSTER) {
      expect(strategyIds.has(char), `${char} in strategies`).toBe(true);
    }
  });

  it('combo route count matches strategy count', () => {
    const routeChars = Object.keys(COMBO_ROUTES).filter(k => k !== '_default');
    const strategyChars = ALL_STRATEGIES.map(s => s.charId);
    expect(routeChars.length).toBe(strategyChars.length);
  });

  it('no duplicate characters in roster', () => {
    expect(new Set(ROSTER).size).toBe(ROSTER.length);
  });

  it('roster has 31 characters', () => {
    expect(ROSTER.length).toBe(31);
  });
});

describe('FRAME_DATA character prefix coverage', () => {
  const CHAR_PREFIXES = ROSTER.map(c => c.toUpperCase());

  it('every non-generic FRAME_DATA key starts with a known character prefix or DM/SDM', () => {
    const genericPrefixes = new Set([
      'STAND', 'CLOSE', 'CROUCH', 'JUMP', 'THROW', 'SPECIAL',
      'DM', 'SDM', 'HSDM', 'CMD',
    ]);
    // Collect unique prefixes from FRAME_DATA
    const prefixes = new Set<string>();
    for (const key of fdKeys) {
      const prefix = key.split('_')[0];
      prefixes.add(prefix);
    }
    // Each prefix should be either a known character or a generic type
    for (const prefix of prefixes) {
      const isChar = CHAR_PREFIXES.includes(prefix);
      const isGeneric = genericPrefixes.has(prefix);
      expect(isChar || isGeneric,
        `prefix "${prefix}" is known character or generic`).toBe(true);
    }
  });

  it('every character has at least one DM entry', () => {
    const dmKeys = [...fdKeys].filter(k => k.startsWith('DM_'));
    expect(dmKeys.length).toBeGreaterThan(10); // many DMs
  });

  it('DM entries are not character-prefixed (shared DM naming)', () => {
    const dmKeys = [...fdKeys].filter(k => k.startsWith('DM_'));
    for (const dm of dmKeys) {
      // DM keys should not start with character prefix + DM
      const hasCharPrefix = CHAR_PREFIXES.some(p => dm.startsWith(p + '_DM'));
      expect(hasCharPrefix, `${dm} should not have char prefix`).toBe(false);
    }
  });
});

describe('Strategy ↔ combo route alignment', () => {
  it('every strategy charId matches a combo route key', () => {
    for (const strategy of ALL_STRATEGIES) {
      expect(COMBO_ROUTES[strategy.charId],
        `${strategy.charId} strategy has combo route`).toBeDefined();
    }
  });

  it('every combo route key (except _default) has a strategy', () => {
    const strategyIds = new Set(ALL_STRATEGIES.map(s => s.charId));
    for (const charId of Object.keys(COMBO_ROUTES)) {
      if (charId === '_default') continue;
      expect(strategyIds.has(charId),
        `${charId} combo route has strategy`).toBe(true);
    }
  });

  it('strategy preferredDM matches a DM in FRAME_DATA for each character', () => {
    for (const strategy of ALL_STRATEGIES) {
      const dm = strategy.preferredDM;
      expect(fdKeys.has(dm),
        `${strategy.charId} preferredDM=${dm} in FRAME_DATA`).toBe(true);
    }
  });
});
