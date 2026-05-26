/**
 * Character Core Consolidated Tests
 *
 * Merged from: characterDifferentiation, attackClassifier, constantsConsistency
 *
 * Covers: character uniqueness, attack classification, constant consistency.
 */
import { describe, it, expect } from 'vitest';
import { ROSTER } from '../src/characters/index.js';
import { FRAME_DATA } from '../src/core/constants.js';
import { isDM, isCharacterSpecial } from '../src/core/attackClassifier.js';

// ── 1. Character Differentiation ────────────────────────────
describe('Character Differentiation', () => {
  it('each character has unique id', () => {
    const ids = ROSTER.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('each character has valid color and accent color', () => {
    const hexRe = /^#[0-9A-Fa-f]{6}$/;
    for (const char of ROSTER) {
      expect(hexRe.test(char.color), `${char.id} color`).toBe(true);
      expect(hexRe.test(char.accentColor), `${char.id} accentColor`).toBe(true);
    }
  });

  it('character stats are reasonable', () => {
    for (const char of ROSTER) {
      expect(char.stats.walkSpeed).toBeGreaterThan(0);
      expect(char.stats.maxHealth).toBeGreaterThanOrEqual(800);
      expect(char.stats.maxHealth).toBeLessThanOrEqual(1200);
    }
  });
});

// ── 2. Attack Classifier ────────────────────────────────────
describe('Attack Classifier', () => {
  it('DM attacks are correctly classified', () => {
    expect(isDM('DM_OROCHINAGI')).toBe(true);
    expect(isDM('SDM_OROCHINAGI')).toBe(true);
    expect(isDM('STAND_A')).toBe(false);
  });

  it('character specials are correctly classified', () => {
    expect(isCharacterSpecial('KYO_ONIYAKI')).toBe(true);
    expect(isCharacterSpecial('IORI_AOIHANA')).toBe(true);
    expect(isCharacterSpecial('STAND_A')).toBe(false);
  });
});

// ── 3. Constants Consistency ────────────────────────────────
describe('Constants Consistency', () => {
  it('FRAME_DATA has all basic normal keys', () => {
    const required = ['STAND_A', 'STAND_C', 'CROUCH_A', 'CROUCH_C', 'JUMP_C'];
    for (const key of required) {
      expect(FRAME_DATA[key as keyof typeof FRAME_DATA], `${key} missing`).toBeDefined();
    }
  });

  it('all FRAME_DATA entries have positive damage', () => {
    for (const [key, fd] of Object.entries(FRAME_DATA)) {
      expect(fd.damage, `${key} damage`).toBeGreaterThan(0);
    }
  });
});
