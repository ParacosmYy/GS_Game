/**
 * Hit Effect Prefix Coverage Regression Tests
 *
 * Verifies that every character-specific attack type is handled by
 * the corresponding hit effects plugin (prefixes match all attacks).
 */
import { describe, it, expect } from 'vitest';
import { KYO_HIT_EFFECTS } from '../src/content/characters/kyo/hitEffects/kyoHitEffects.js';
import { IORI_HIT_EFFECTS } from '../src/content/characters/iori/hitEffects/ioriHitEffects.js';
import { KYO_ATTACK_KEYS } from '../src/content/characters/kyo/attacks/kyoAttacks.js';
import { IORI_ATTACK_KEYS } from '../src/content/characters/iori/attacks/ioriAttacks.js';

function isCoveredByPrefixes(atkName: string, prefixes: string[]): boolean {
  return prefixes.some(prefix => atkName.startsWith(prefix) || atkName === prefix);
}

// ===== Kyo Hit Effect Coverage =====

describe('Kyo Hit Effect Prefix Coverage', () => {
  const kyoSpecialAttacks = KYO_ATTACK_KEYS.filter(k =>
    k.startsWith('KYO_') || k.startsWith('CMD_') || k.startsWith('DM_')
    || k.startsWith('SDM_') || k.startsWith('HSDM_'),
  );

  it('all Kyo specials/commands/DMs are covered by hit effect prefixes', () => {
    const uncovered: string[] = [];
    for (const atk of kyoSpecialAttacks) {
      if (!isCoveredByPrefixes(atk, KYO_HIT_EFFECTS.prefixes)) {
        uncovered.push(atk);
      }
    }
    expect(uncovered, `Uncovered: ${uncovered.join(', ')}`).toHaveLength(0);
  });

  it('Kyo VFX handler processes at least 20 distinct attack types', () => {
    // Count how many attack types would be dispatched by prefix matching
    const covered = KYO_ATTACK_KEYS.filter(k => isCoveredByPrefixes(k, KYO_HIT_EFFECTS.prefixes));
    expect(covered.length).toBeGreaterThanOrEqual(20);
  });

  it('Kyo hit effects plugin charId is kyo', () => {
    expect(KYO_HIT_EFFECTS.charId).toBe('kyo');
  });

  it('Kyo hit effects has both VFX and SFX handlers', () => {
    expect(typeof KYO_HIT_EFFECTS.onHitVFX).toBe('function');
    expect(typeof KYO_HIT_EFFECTS.onHitSFX).toBe('function');
  });

  it('Kyo DM/SDM/HSDM are individually matched by prefixes', () => {
    expect(isCoveredByPrefixes('DM_OROCHINAGI', KYO_HIT_EFFECTS.prefixes)).toBe(true);
    expect(isCoveredByPrefixes('SDM_OROCHINAGI', KYO_HIT_EFFECTS.prefixes)).toBe(true);
    expect(isCoveredByPrefixes('HSDM_OROCHINAGI', KYO_HIT_EFFECTS.prefixes)).toBe(true);
  });

  it('Kyo command normals are covered by CMD_ prefix', () => {
    const commands = ['CMD_GOFU_YOU', 'CMD_88SHIKI', 'CMD_NARAKU'];
    for (const cmd of commands) {
      expect(isCoveredByPrefixes(cmd, KYO_HIT_EFFECTS.prefixes)).toBe(true);
    }
  });
});

// ===== Iori Hit Effect Coverage =====

describe('Iori Hit Effect Prefix Coverage', () => {
  const ioriSpecialAttacks = IORI_ATTACK_KEYS.filter(k =>
    k.startsWith('IORI_') || k.startsWith('DM_') || k.startsWith('SDM_') || k.startsWith('HSDM_'),
  );

  it('all Iori specials/commands/DMs are covered by hit effect prefixes', () => {
    const uncovered: string[] = [];
    for (const atk of ioriSpecialAttacks) {
      if (!isCoveredByPrefixes(atk, IORI_HIT_EFFECTS.prefixes)) {
        uncovered.push(atk);
      }
    }
    expect(uncovered, `Uncovered: ${uncovered.join(', ')}`).toHaveLength(0);
  });

  it('Iori VFX handler processes at least 18 distinct attack types', () => {
    const covered = IORI_ATTACK_KEYS.filter(k => isCoveredByPrefixes(k, IORI_HIT_EFFECTS.prefixes));
    expect(covered.length).toBeGreaterThanOrEqual(18);
  });

  it('Iori hit effects plugin charId is iori', () => {
    expect(IORI_HIT_EFFECTS.charId).toBe('iori');
  });

  it('Iori hit effects has both VFX and SFX handlers', () => {
    expect(typeof IORI_HIT_EFFECTS.onHitVFX).toBe('function');
    expect(typeof IORI_HIT_EFFECTS.onHitSFX).toBe('function');
  });

  it('Iori DM/SDM/HSDM are individually matched by prefixes', () => {
    expect(isCoveredByPrefixes('DM_YATAGARASU', IORI_HIT_EFFECTS.prefixes)).toBe(true);
    expect(isCoveredByPrefixes('SDM_YATAGARASU', IORI_HIT_EFFECTS.prefixes)).toBe(true);
    expect(isCoveredByPrefixes('HSDM_YAOTOME', IORI_HIT_EFFECTS.prefixes)).toBe(true);
  });

  it('Iori Aoihana rekka chain is fully covered', () => {
    const rekkaKeys = ['IORI_AOIHANA', 'IORI_AOIHANA_2', 'IORI_AOIHANA_3',
      'IORI_AOIHANA_C', 'IORI_AOIHANA_C_2', 'IORI_AOIHANA_C_3'];
    for (const key of rekkaKeys) {
      expect(isCoveredByPrefixes(key, IORI_HIT_EFFECTS.prefixes)).toBe(true);
    }
  });
});
