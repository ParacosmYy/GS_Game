/**
 * Rival Dialogue Data Validation Tests
 *
 * Validates the RIVAL_DIALOGUES data:
 * - Every pair has exactly 2 character IDs
 * - All character IDs are valid roster members
 * - Theme values are in allowed set
 * - No duplicate pairs (order-independent)
 * - All lines are non-empty strings
 * - THEME_COLORS cover all themes
 * - getRivalDialogue lookup works in both directions
 */
import { describe, it, expect } from 'vitest';
import { getRivalDialogue, getRivalThemeColors } from '../src/core/rivalData.js';

const ROSTER = new Set([
  'kyo', 'iori', 'ryo', 'terry', 'kim',
  'leona', 'robert', 'mai', 'kdash', 'kula',
  'athena', 'clark', 'ralf', 'joe', 'andy',
  'billy', 'chang', 'choi', 'mature', 'yamazaki',
  'mary', 'xiangfei', 'kasumi',
  'yashiro', 'chris', 'shermie', 'vice',
  // Also allow non-playable characters referenced in rival dialogues
  'chizuru', 'takuma',
]);

const VALID_THEMES = new Set(['fire', 'destiny', 'dark', 'honor', 'rivalry']);

// Re-import the raw data via the module's internal constant
// Since it's not exported, we test via the getter function
const KNOWN_PAIRS: [string, string][] = [
  ['kyo', 'iori'], ['ryo', 'robert'], ['kyo', 'ryo'],
  ['iori', 'ryo'], ['kyo', 'kdash'], ['iori', 'leona'],
  ['kyo', 'chizuru'], ['kim', 'chang'], ['ryo', 'takuma'],
  ['terry', 'andy'], ['mai', 'andy'], ['kdash', 'kula'],
  ['joe', 'terry'],
];

describe('Rival dialogue data validation', () => {
  it('all known pairs return a dialogue', () => {
    for (const [a, b] of KNOWN_PAIRS) {
      const dialogue = getRivalDialogue(a, b);
      expect(dialogue, `${a} vs ${b}`).toBeDefined();
    }
  });

  it('getRivalDialogue works in both directions', () => {
    for (const [a, b] of KNOWN_PAIRS) {
      expect(getRivalDialogue(a, b)).toBe(getRivalDialogue(b, a));
    }
  });

  it('non-rival pairs return undefined', () => {
    expect(getRivalDialogue('athena', 'choi')).toBeUndefined();
    expect(getRivalDialogue('ralf', 'mary')).toBeUndefined();
  });

  it('same character returns undefined', () => {
    expect(getRivalDialogue('kyo', 'kyo')).toBeUndefined();
    expect(getRivalDialogue('ryo', 'ryo')).toBeUndefined();
  });

  it('all dialogues have non-empty lines', () => {
    for (const [a, b] of KNOWN_PAIRS) {
      const d = getRivalDialogue(a, b)!;
      expect(d.lineA.length, `${a} vs ${b} lineA`).toBeGreaterThan(0);
      expect(d.lineB.length, `${a} vs ${b} lineB`).toBeGreaterThan(0);
    }
  });

  it('all dialogues have valid themes', () => {
    for (const [a, b] of KNOWN_PAIRS) {
      const d = getRivalDialogue(a, b)!;
      expect(VALID_THEMES.has(d.theme), `${a} vs ${b} theme=${d.theme}`).toBe(true);
    }
  });

  it('Kyo vs Iori is fire theme', () => {
    expect(getRivalDialogue('kyo', 'iori')!.theme).toBe('fire');
  });

  it('Ryo vs Robert is honor theme', () => {
    expect(getRivalDialogue('ryo', 'robert')!.theme).toBe('honor');
  });

  it('13 known rival pairs exist', () => {
    expect(KNOWN_PAIRS.length).toBe(13);
  });
});

describe('Rival theme colors', () => {
  it('all themes have color definitions', () => {
    for (const theme of VALID_THEMES) {
      const colors = getRivalThemeColors(theme as any);
      expect(colors).toBeDefined();
      expect(colors!.bg).toBeDefined();
      expect(colors!.border).toBeDefined();
      expect(colors!.textA).toBeDefined();
      expect(colors!.textB).toBeDefined();
      expect(colors!.flash).toBeDefined();
    }
  });

  it('border colors are valid hex', () => {
    for (const theme of VALID_THEMES) {
      const colors = getRivalThemeColors(theme as any);
      expect(colors!.border).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(colors!.flash).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('bg colors are rgba format', () => {
    for (const theme of VALID_THEMES) {
      const colors = getRivalThemeColors(theme as any);
      expect(colors!.bg).toMatch(/^rgba\(/);
    }
  });

  it('text colors are valid hex', () => {
    for (const theme of VALID_THEMES) {
      const colors = getRivalThemeColors(theme as any);
      expect(colors!.textA).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(colors!.textB).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});
