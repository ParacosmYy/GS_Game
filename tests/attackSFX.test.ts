/**
 * Attack SFX Table Regression Test
 * Verifies all entries in ATTACK_SFX_TABLE have valid structure and phase/sfx consistency.
 */
import { describe, it, expect } from 'vitest';
import { ATTACK_SFX_TABLE, type AttackSFXEntry } from '../src/audio/attackSFX.js';

const VALID_PHASES = ['startup', 'active', 'recovery'];
const KNOWN_SFX = new Set([
  'playWhoosh', 'playHeavyWhoosh', 'playSlice', 'playThudKick', 'playThudPunch',
  'playHit', 'playHeavyHit', 'playBlock', 'playKOHit', 'playFireHit',
]);

describe('Attack SFX Table', () => {
  it('has at least 50 entries', () => {
    expect(ATTACK_SFX_TABLE.length).toBeGreaterThanOrEqual(50);
  });

  it('all entries have valid structure', () => {
    for (const entry of ATTACK_SFX_TABLE) {
      expect(entry.attackType, 'attackType').toBeTruthy();
      expect(VALID_PHASES, `phase ${entry.phase}`).toContain(entry.phase);
      expect(entry.frame, `frame for ${entry.attackType}`).toBeGreaterThanOrEqual(0);
      expect(entry.sfx, `sfx for ${entry.attackType}`).toBeTruthy();
      expect(entry.priority, `priority for ${entry.attackType}`).toBeGreaterThanOrEqual(0);
    }
  });

  it('all entries have non-empty attackType', () => {
    for (const entry of ATTACK_SFX_TABLE) {
      expect(entry.attackType.length).toBeGreaterThan(0);
    }
  });

  it('startup phase entries exist for normals', () => {
    const startupNormals = ATTACK_SFX_TABLE.filter(
      e => e.phase === 'startup' && (e.attackType.startsWith('STAND_') || e.attackType.startsWith('CROUCH_'))
    );
    expect(startupNormals.length).toBeGreaterThanOrEqual(8);
  });

  it('active phase entries exist for specials', () => {
    const activeSpecials = ATTACK_SFX_TABLE.filter(
      e => e.phase === 'active' && (e.attackType.startsWith('KYO_') || e.attackType.startsWith('IORI_') || e.attackType.startsWith('RYO_'))
    );
    expect(activeSpecials.length).toBeGreaterThanOrEqual(5);
  });

  it('no duplicate (attackType, phase, frame) tuples', () => {
    const seen = new Set<string>();
    for (const entry of ATTACK_SFX_TABLE) {
      const key = `${entry.attackType}:${entry.phase}:${entry.frame}`;
      expect(seen.has(key), `duplicate ${key}`).toBe(false);
      seen.add(key);
    }
  });

  it('wildcard entry (*) exists for fallback', () => {
    const wildcards = ATTACK_SFX_TABLE.filter(e => e.attackType === '*');
    expect(wildcards.length).toBeGreaterThanOrEqual(1);
  });

  it('DM entries have active phase SFX', () => {
    const dmEntries = ATTACK_SFX_TABLE.filter(
      e => e.attackType.startsWith('DM_') && e.phase === 'active'
    );
    expect(dmEntries.length).toBeGreaterThanOrEqual(1);
  });

  it('priority values are reasonable (0-10)', () => {
    for (const entry of ATTACK_SFX_TABLE) {
      expect(entry.priority).toBeGreaterThanOrEqual(0);
      expect(entry.priority).toBeLessThanOrEqual(10);
    }
  });

  it('Kyo-specific entries exist', () => {
    const kyoEntries = ATTACK_SFX_TABLE.filter(e => e.attackType.startsWith('KYO_'));
    expect(kyoEntries.length).toBeGreaterThanOrEqual(5);
  });

  it('Iori-specific entries exist', () => {
    const ioriEntries = ATTACK_SFX_TABLE.filter(e => e.attackType.startsWith('IORI_'));
    expect(ioriEntries.length).toBeGreaterThanOrEqual(5);
  });

  it('frame 0 is most common for SFX triggers', () => {
    const frame0 = ATTACK_SFX_TABLE.filter(e => e.frame === 0).length;
    const otherFrames = ATTACK_SFX_TABLE.filter(e => e.frame !== 0).length;
    expect(frame0).toBeGreaterThan(otherFrames);
  });
});
