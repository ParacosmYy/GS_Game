/**
 * Multi-character barrel export completeness test
 * Verifies the top-level characters/index.ts exposes all expected exports
 * for each character's content package.
 */
import { describe, it, expect } from 'vitest';

// Expected export categories per character
const KYO_EXPORTS = [
  'KYO_ATTACK_KEYS',
  'KYO_MOVE_LIST',
  'KYO_HITBOX_KEYS',
  'KYO_ATTACK_FRAME_KEYS',
  'KYO_FEEDBACK_SUMMARY',
  'KYO_ANIMATION_META',
  'KYO_PORTRAIT_META',
  'KYO_CANCEL_PATHS',
  'KYO_ACTION_CONTRACTS',
  'KYO_HIT_EFFECTS',
  'registerKyoAudio',
];

const IORI_EXPORTS = [
  'IORI_ATTACK_KEYS',
  'IORI_MOVE_LIST',
  'IORI_HITBOX_KEYS',
  'IORI_ATTACK_FRAME_KEYS',
  'IORI_FEEDBACK_SUMMARY',
  'IORI_ANIMATION_META',
  'IORI_PORTRAIT_META',
  'IORI_CANCEL_PATHS',
  'IORI_ACTION_CONTRACTS',
  'IORI_HIT_EFFECTS',
  'registerIoriAudio',
];

describe('Character barrel exports', () => {
  it('Kyo has all expected exports', async () => {
    const mod = await import('../src/content/characters/index.js');
    for (const name of KYO_EXPORTS) {
      expect(mod[name as keyof typeof mod], `Missing Kyo export: ${name}`).toBeDefined();
    }
  });

  it('Iori has all expected exports', async () => {
    const mod = await import('../src/content/characters/index.js');
    for (const name of IORI_EXPORTS) {
      expect(mod[name as keyof typeof mod], `Missing Iori export: ${name}`).toBeDefined();
    }
  });

  it('Kyo ANIMATION_META has >40 entries', async () => {
    const mod = await import('../src/content/characters/index.js');
    expect(Object.keys(mod.KYO_ANIMATION_META).length).toBeGreaterThan(40);
  });

  it('Iori ANIMATION_META has >40 entries', async () => {
    const mod = await import('../src/content/characters/index.js');
    expect(Object.keys(mod.IORI_ANIMATION_META).length).toBeGreaterThan(40);
  });

  it('Kyo ATTACK_KEYS is non-empty array', async () => {
    const mod = await import('../src/content/characters/index.js');
    expect(Array.isArray(mod.KYO_ATTACK_KEYS)).toBe(true);
    expect(mod.KYO_ATTACK_KEYS.length).toBeGreaterThan(0);
  });

  it('Iori ATTACK_KEYS is non-empty array', async () => {
    const mod = await import('../src/content/characters/index.js');
    expect(Array.isArray(mod.IORI_ATTACK_KEYS)).toBe(true);
    expect(mod.IORI_ATTACK_KEYS.length).toBeGreaterThan(0);
  });

  it('Kyo CANCEL_PATHS is non-empty', async () => {
    const mod = await import('../src/content/characters/index.js');
    expect(mod.KYO_CANCEL_PATHS.length).toBeGreaterThan(0);
  });

  it('Iori CANCEL_PATHS is non-empty', async () => {
    const mod = await import('../src/content/characters/index.js');
    expect(mod.IORI_CANCEL_PATHS.length).toBeGreaterThan(0);
  });

  it('Kyo ACTION_CONTRACTS is defined object', async () => {
    const mod = await import('../src/content/characters/index.js');
    expect(mod.KYO_ACTION_CONTRACTS).toBeDefined();
    expect(typeof mod.KYO_ACTION_CONTRACTS).toBe('object');
  });

  it('Iori ACTION_CONTRACTS is defined object', async () => {
    const mod = await import('../src/content/characters/index.js');
    expect(mod.IORI_ACTION_CONTRACTS).toBeDefined();
    expect(typeof mod.IORI_ACTION_CONTRACTS).toBe('object');
  });
});
