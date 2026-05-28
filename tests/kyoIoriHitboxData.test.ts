/**
 * Kyo/Iori Hitbox Data Regression Tests
 *
 * Validates hitbox key arrays, offset lookups, and attack frame lookups
 * for both Kyo and Iori content packages.
 */
import { describe, it, expect } from 'vitest';
import {
  KYO_HITBOX_KEYS, getKyoHitboxOffsets,
  KYO_ATTACK_FRAME_KEYS, getKyoAttackFrames,
} from '../src/content/characters/kyo/hitboxes/kyoHitboxes.js';
import {
  IORI_HITBOX_KEYS, getIoriHitboxOffsets,
  IORI_ATTACK_FRAME_KEYS, getIoriAttackFrames,
} from '../src/content/characters/iori/hitboxes/ioriHitboxes.js';

// ════════════════════════════════════════════════════════════════
// Kyo Hitbox Data
// ════════════════════════════════════════════════════════════════

describe('Kyo Hitbox Keys', () => {
  it('has at least 20 entries', () => {
    expect(KYO_HITBOX_KEYS.length).toBeGreaterThanOrEqual(20);
  });

  it('has command normals', () => {
    expect(KYO_HITBOX_KEYS).toContain('CMD_GOFU_YOU');
    expect(KYO_HITBOX_KEYS).toContain('CMD_88SHIKI');
    expect(KYO_HITBOX_KEYS).toContain('CMD_NARAKU');
  });

  it('has specials', () => {
    expect(KYO_HITBOX_KEYS).toContain('KYO_ONIYAKI');
    expect(KYO_HITBOX_KEYS).toContain('KYO_ONIYAKI_C');
    expect(KYO_HITBOX_KEYS).toContain('KYO_YAMIBARAI');
    expect(KYO_HITBOX_KEYS).toContain('KYO_YAMIBARAI_C');
    expect(KYO_HITBOX_KEYS).toContain('KYO_75KAI');
    expect(KYO_HITBOX_KEYS).toContain('KYO_RED_KICK');
  });

  it('has Aragami chain', () => {
    expect(KYO_HITBOX_KEYS).toContain('KYO_ARAGAMI');
    expect(KYO_HITBOX_KEYS).toContain('KYO_ARAGAMI_KONOKIZU');
    expect(KYO_HITBOX_KEYS).toContain('KYO_ARAGAMI_YANOSABI');
    expect(KYO_HITBOX_KEYS).toContain('KYO_NANASE');
    expect(KYO_HITBOX_KEYS).toContain('KYO_KOTO_TSUKI');
    expect(KYO_HITBOX_KEYS).toContain('KYO_YAKISOGI');
  });

  it('has Dokugami chain', () => {
    expect(KYO_HITBOX_KEYS).toContain('KYO_DOKUGAMI');
    expect(KYO_HITBOX_KEYS).toContain('KYO_TSUMIYOMI');
    expect(KYO_HITBOX_KEYS).toContain('KYO_BATSUYOMI');
  });

  it('has DM/SDM/HSDM', () => {
    expect(KYO_HITBOX_KEYS).toContain('DM_OROCHINAGI');
    expect(KYO_HITBOX_KEYS).toContain('SDM_OROCHINAGI');
    expect(KYO_HITBOX_KEYS).toContain('HSDM_OROCHINAGI');
  });

  it('no duplicate keys', () => {
    const unique = new Set(KYO_HITBOX_KEYS);
    expect(unique.size).toBe(KYO_HITBOX_KEYS.length);
  });
});

describe('Kyo Hitbox Lookups', () => {
  it('getKyoHitboxOffsets returns an object', () => {
    const offsets = getKyoHitboxOffsets();
    expect(typeof offsets).toBe('object');
  });

  it('getKyoHitboxOffsets has entries for known keys', () => {
    const offsets = getKyoHitboxOffsets();
    const keys = Object.keys(offsets);
    expect(keys.length).toBeGreaterThan(0);
  });
});

describe('Kyo Attack Frame Keys', () => {
  it('has at least 20 entries', () => {
    expect(KYO_ATTACK_FRAME_KEYS.length).toBeGreaterThanOrEqual(20);
  });

  it('has command normals', () => {
    expect(KYO_ATTACK_FRAME_KEYS).toContain('CMD_GOFU_YOU');
    expect(KYO_ATTACK_FRAME_KEYS).toContain('CMD_88SHIKI');
    expect(KYO_ATTACK_FRAME_KEYS).toContain('CMD_NARAKU');
  });

  it('has specials', () => {
    expect(KYO_ATTACK_FRAME_KEYS).toContain('KYO_ONIYAKI');
    expect(KYO_ATTACK_FRAME_KEYS).toContain('KYO_YAMIBARAI');
    expect(KYO_ATTACK_FRAME_KEYS).toContain('KYO_75KAI');
  });

  it('has DM/SDM/HSDM', () => {
    expect(KYO_ATTACK_FRAME_KEYS).toContain('DM_OROCHINAGI');
    expect(KYO_ATTACK_FRAME_KEYS).toContain('SDM_OROCHINAGI');
    expect(KYO_ATTACK_FRAME_KEYS).toContain('HSDM_OROCHINAGI');
  });

  it('no duplicate keys', () => {
    const unique = new Set(KYO_ATTACK_FRAME_KEYS);
    expect(unique.size).toBe(KYO_ATTACK_FRAME_KEYS.length);
  });

  it('getKyoAttackFrames returns an object', () => {
    const frames = getKyoAttackFrames();
    expect(typeof frames).toBe('object');
  });
});

// ════════════════════════════════════════════════════════════════
// Iori Hitbox Data
// ════════════════════════════════════════════════════════════════

describe('Iori Hitbox Keys', () => {
  it('has at least 15 entries', () => {
    expect(IORI_HITBOX_KEYS.length).toBeGreaterThanOrEqual(15);
  });

  it('has command normals', () => {
    expect(IORI_HITBOX_KEYS).toContain('IORI_YUMEYUMI');
    expect(IORI_HITBOX_KEYS).toContain('IORI_KATANUGI');
    expect(IORI_HITBOX_KEYS).toContain('IORI_YUKIWARUI');
  });

  it('has specials', () => {
    expect(IORI_HITBOX_KEYS).toContain('IORI_ONIYAKI');
    expect(IORI_HITBOX_KEYS).toContain('IORI_ONIYAKI_C');
    expect(IORI_HITBOX_KEYS).toContain('IORI_YAMIBARAI');
    expect(IORI_HITBOX_KEYS).toContain('IORI_YAMIBARAI_C');
    expect(IORI_HITBOX_KEYS).toContain('IORI_KOTOTSUKI');
    expect(IORI_HITBOX_KEYS).toContain('IORI_KUZUKAZE');
  });

  it('has Aoihana A chain', () => {
    expect(IORI_HITBOX_KEYS).toContain('IORI_AOIHANA');
    expect(IORI_HITBOX_KEYS).toContain('IORI_AOIHANA_2');
    expect(IORI_HITBOX_KEYS).toContain('IORI_AOIHANA_3');
  });

  it('has Aoihana C chain', () => {
    expect(IORI_HITBOX_KEYS).toContain('IORI_AOIHANA_C');
    expect(IORI_HITBOX_KEYS).toContain('IORI_AOIHANA_C_2');
    expect(IORI_HITBOX_KEYS).toContain('IORI_AOIHANA_C_3');
  });

  it('has DM/SDM/HSDM', () => {
    expect(IORI_HITBOX_KEYS).toContain('DM_YATAGARASU');
    expect(IORI_HITBOX_KEYS).toContain('SDM_YATAGARASU');
    expect(IORI_HITBOX_KEYS).toContain('HSDM_YAOTOME');
  });

  it('no duplicate keys', () => {
    const unique = new Set(IORI_HITBOX_KEYS);
    expect(unique.size).toBe(IORI_HITBOX_KEYS.length);
  });
});

describe('Iori Hitbox Lookups', () => {
  it('getIoriHitboxOffsets returns an object', () => {
    const offsets = getIoriHitboxOffsets();
    expect(typeof offsets).toBe('object');
  });

  it('getIoriHitboxOffsets has entries', () => {
    const offsets = getIoriHitboxOffsets();
    const keys = Object.keys(offsets);
    expect(keys.length).toBeGreaterThan(0);
  });
});

describe('Iori Attack Frame Keys', () => {
  it('has at least 15 entries', () => {
    expect(IORI_ATTACK_FRAME_KEYS.length).toBeGreaterThanOrEqual(15);
  });

  it('has specials', () => {
    expect(IORI_ATTACK_FRAME_KEYS).toContain('IORI_ONIYAKI');
    expect(IORI_ATTACK_FRAME_KEYS).toContain('IORI_YAMIBARAI');
    expect(IORI_ATTACK_FRAME_KEYS).toContain('IORI_KUZUKAZE');
  });

  it('has DM/SDM/HSDM', () => {
    expect(IORI_ATTACK_FRAME_KEYS).toContain('DM_YATAGARASU');
    expect(IORI_ATTACK_FRAME_KEYS).toContain('SDM_YATAGARASU');
    expect(IORI_ATTACK_FRAME_KEYS).toContain('HSDM_YAOTOME');
  });

  it('no duplicate keys', () => {
    const unique = new Set(IORI_ATTACK_FRAME_KEYS);
    expect(unique.size).toBe(IORI_ATTACK_FRAME_KEYS.length);
  });

  it('getIoriAttackFrames returns an object', () => {
    const frames = getIoriAttackFrames();
    expect(typeof frames).toBe('object');
  });
});

// ════════════════════════════════════════════════════════════════
// Cross-Character Hitbox Validation
// ════════════════════════════════════════════════════════════════

describe('Kyo/Iori Hitbox Cross-Validation', () => {
  it('no overlapping character-specific hitbox keys', () => {
    const kyoSpecific = KYO_HITBOX_KEYS.filter(k => k.startsWith('KYO_') || k.startsWith('CMD_'));
    const ioriSpecific = IORI_HITBOX_KEYS.filter(k => k.startsWith('IORI_'));
    const overlap = kyoSpecific.filter(k => ioriSpecific.includes(k));
    expect(overlap).toHaveLength(0);
  });

  it('DM keys are different between characters', () => {
    const kyoDms = KYO_HITBOX_KEYS.filter(k => k.startsWith('DM_') || k.startsWith('SDM_') || k.startsWith('HSDM_'));
    const ioriDms = IORI_HITBOX_KEYS.filter(k => k.startsWith('DM_') || k.startsWith('SDM_') || k.startsWith('HSDM_'));
    const overlap = kyoDms.filter(k => ioriDms.includes(k));
    expect(overlap).toHaveLength(0);
  });

  it('attack frame keys match hitbox keys for each character', () => {
    // Attack frame keys should be a subset or equal to hitbox keys
    for (const key of KYO_ATTACK_FRAME_KEYS) {
      expect(KYO_HITBOX_KEYS, `Kyo attack frame key ${key} in hitbox keys`).toContain(key);
    }
    for (const key of IORI_ATTACK_FRAME_KEYS) {
      expect(IORI_HITBOX_KEYS, `Iori attack frame key ${key} in hitbox keys`).toContain(key);
    }
  });
});
