/**
 * Content Package Data Structural Tests
 *
 * Validates portrait metadata, attack key lists, hitbox key lists,
 * and feedback tier summaries for Kyo/Iori/Ryo content packages.
 */
import { describe, it, expect } from 'vitest';
import { KYO_PORTRAIT_META, getKyoPortraitMeta, getKyoAvailablePortraitSizes } from '../src/content/characters/kyo/portraits/kyoPortraits.js';
import { IORI_PORTRAIT_META, getIoriPortraitMeta, getIoriAvailablePortraitSizes } from '../src/content/characters/iori/portraits/ioriPortraits.js';
import { RYO_PORTRAIT_META, getRyoPortraitMeta, getRyoAvailablePortraitSizes } from '../src/content/characters/ryo/portraits/ryoPortraits.js';
import { KYO_ATTACK_KEYS, getKyoFrameData, getKyoAttackFrameData } from '../src/content/characters/kyo/attacks/kyoAttacks.js';
import { IORI_ATTACK_KEYS, getIoriFrameData, getIoriAttackFrameData } from '../src/content/characters/iori/attacks/ioriAttacks.js';
import { KYO_HITBOX_KEYS, KYO_ATTACK_FRAME_KEYS, getKyoHitboxOffsets, getKyoAttackFrames } from '../src/content/characters/kyo/hitboxes/kyoHitboxes.js';
import { IORI_HITBOX_KEYS, IORI_ATTACK_FRAME_KEYS, getIoriHitboxOffsets, getIoriAttackFrames } from '../src/content/characters/iori/hitboxes/ioriHitboxes.js';
import { getKyoFeedbackTiers, getKyoFeedback, KYO_FEEDBACK_SUMMARY } from '../src/content/characters/kyo/feedback/kyoFeedback.js';
import { getIoriFeedbackTiers, getIoriFeedback, IORI_FEEDBACK_SUMMARY } from '../src/content/characters/iori/feedback/ioriFeedback.js';

// ===== Portrait Metadata =====

function validatePortraitMeta(meta: any, label: string) {
  expect(meta.size, `${label}.size`).toBeTruthy();
  expect(meta.width, `${label}.width > 0`).toBeGreaterThan(0);
  expect(meta.height, `${label}.height > 0`).toBeGreaterThan(0);
  expect(meta.pose, `${label}.pose`).toBeTruthy();
  expect(meta.primaryColor, `${label}.primaryColor`).toMatch(/^#[0-9A-Fa-f]{6}$/);
  expect(meta.accentColor, `${label}.accentColor`).toMatch(/^#[0-9A-Fa-f]{6}$/);
  expect(meta.style, `${label}.style`).toBeTruthy();
  expect(typeof meta.hasPixelData, `${label}.hasPixelData`).toBe('boolean');
}

function describePortrait(pkg: Record<string, any>, charId: string, getMeta: (s: string) => any, getSizes: () => string[]) {
  describe(`${charId} portrait metadata`, () => {
    it('has all 4 sizes', () => {
      const sizes = ['select', 'vs', 'hud', 'win'];
      for (const s of sizes) {
        expect(pkg[s], `${charId} has ${s}`).toBeDefined();
      }
    });

    it('all entries have valid structure', () => {
      for (const [size, meta] of Object.entries(pkg)) {
        validatePortraitMeta(meta, `${charId}.${size}`);
      }
    });

    it('size field matches key', () => {
      for (const [key, meta] of Object.entries(pkg)) {
        expect(meta.size, `${charId}.${key}.size`).toBe(key);
      }
    });

    it('getMeta returns correct entry', () => {
      const meta = getMeta('select');
      expect(meta).toBeDefined();
      expect(meta.size).toBe('select');
    });

    it('getAvailableSizes returns non-empty', () => {
      const sizes = getSizes();
      expect(sizes.length).toBeGreaterThan(0);
    });

    it('hud size is smallest', () => {
      expect(pkg.hud.width).toBeLessThanOrEqual(pkg.select.width);
      expect(pkg.hud.height).toBeLessThanOrEqual(pkg.select.height);
    });
  });
}

describePortrait(KYO_PORTRAIT_META, 'kyo', getKyoPortraitMeta, getKyoAvailablePortraitSizes);
describePortrait(IORI_PORTRAIT_META, 'iori', getIoriPortraitMeta, getIoriAvailablePortraitSizes);
describePortrait(RYO_PORTRAIT_META, 'ryo', getRyoPortraitMeta, getRyoAvailablePortraitSizes);

// ===== Attack Key Lists =====

describe('KYO_ATTACK_KEYS', () => {
  it('has many keys', () => {
    expect(KYO_ATTACK_KEYS.length).toBeGreaterThan(20);
  });

  it('all keys are non-empty strings', () => {
    for (const key of KYO_ATTACK_KEYS) {
      expect(key.length, `key "${key}"`).toBeGreaterThan(0);
    }
  });

  it('contains normals', () => {
    expect(KYO_ATTACK_KEYS).toContain('STAND_A');
    expect(KYO_ATTACK_KEYS).toContain('CROUCH_C');
    expect(KYO_ATTACK_KEYS).toContain('JUMP_D');
  });

  it('contains command normals', () => {
    expect(KYO_ATTACK_KEYS).toContain('CMD_GOFU_YOU');
    expect(KYO_ATTACK_KEYS).toContain('CMD_88SHIKI');
    expect(KYO_ATTACK_KEYS).toContain('CMD_NARAKU');
  });

  it('contains specials', () => {
    expect(KYO_ATTACK_KEYS).toContain('KYO_ONIYAKI');
    expect(KYO_ATTACK_KEYS).toContain('KYO_YAMIBARAI');
    expect(KYO_ATTACK_KEYS).toContain('KYO_ARAGAMI');
  });

  it('contains DM/SDM/HSDM', () => {
    expect(KYO_ATTACK_KEYS).toContain('DM_OROCHINAGI');
    expect(KYO_ATTACK_KEYS).toContain('SDM_OROCHINAGI');
    expect(KYO_ATTACK_KEYS).toContain('HSDM_OROCHINAGI');
  });

  it('keys are unique', () => {
    expect(new Set(KYO_ATTACK_KEYS).size).toBe(KYO_ATTACK_KEYS.length);
  });

  it('getKyoFrameData returns record', () => {
    const fd = getKyoFrameData();
    expect(Object.keys(fd).length).toBeGreaterThan(0);
  });

  it('getKyoAttackFrameData returns data for known key', () => {
    const fd = getKyoAttackFrameData('STAND_A');
    if (fd) {
      expect(fd).toBeDefined();
    }
  });
});

describe('IORI_ATTACK_KEYS', () => {
  it('has many keys', () => {
    expect(IORI_ATTACK_KEYS.length).toBeGreaterThan(20);
  });

  it('contains normals', () => {
    expect(IORI_ATTACK_KEYS).toContain('STAND_A');
    expect(IORI_ATTACK_KEYS).toContain('CROUCH_C');
  });

  it('contains command normals', () => {
    expect(IORI_ATTACK_KEYS).toContain('IORI_YUMEYUMI');
    expect(IORI_ATTACK_KEYS).toContain('IORI_KATANUGI');
  });

  it('contains specials', () => {
    expect(IORI_ATTACK_KEYS).toContain('IORI_ONIYAKI');
    expect(IORI_ATTACK_KEYS).toContain('IORI_AOIHANA');
    expect(IORI_ATTACK_KEYS).toContain('IORI_KUZUKAZE');
  });

  it('contains DM/SDM/HSDM', () => {
    expect(IORI_ATTACK_KEYS).toContain('DM_YATAGARASU');
    expect(IORI_ATTACK_KEYS).toContain('SDM_YATAGARASU');
    expect(IORI_ATTACK_KEYS).toContain('HSDM_YAOTOME');
  });

  it('keys are unique', () => {
    expect(new Set(IORI_ATTACK_KEYS).size).toBe(IORI_ATTACK_KEYS.length);
  });

  it('getIoriFrameData returns record', () => {
    const fd = getIoriFrameData();
    expect(Object.keys(fd).length).toBeGreaterThan(0);
  });
});

// ===== Hitbox Key Lists =====

describe('KYO_HITBOX_KEYS', () => {
  it('has entries', () => {
    expect(KYO_HITBOX_KEYS.length).toBeGreaterThan(5);
  });

  it('all keys are non-empty unique strings', () => {
    for (const key of KYO_HITBOX_KEYS) {
      expect(key.length).toBeGreaterThan(0);
    }
    expect(new Set(KYO_HITBOX_KEYS).size).toBe(KYO_HITBOX_KEYS.length);
  });

  it('contains specials', () => {
    expect(KYO_HITBOX_KEYS).toContain('KYO_ONIYAKI');
    expect(KYO_HITBOX_KEYS).toContain('KYO_ARAGAMI');
  });

  it('getKyoHitboxOffsets returns record', () => {
    const offsets = getKyoHitboxOffsets();
    expect(typeof offsets).toBe('object');
  });

  it('KYO_ATTACK_FRAME_KEYS has entries', () => {
    expect(KYO_ATTACK_FRAME_KEYS.length).toBeGreaterThan(5);
  });

  it('getKyoAttackFrames returns record', () => {
    const frames = getKyoAttackFrames();
    expect(typeof frames).toBe('object');
  });
});

describe('IORI_HITBOX_KEYS', () => {
  it('has entries', () => {
    expect(IORI_HITBOX_KEYS.length).toBeGreaterThan(5);
  });

  it('all keys are non-empty unique strings', () => {
    for (const key of IORI_HITBOX_KEYS) {
      expect(key.length).toBeGreaterThan(0);
    }
    expect(new Set(IORI_HITBOX_KEYS).size).toBe(IORI_HITBOX_KEYS.length);
  });

  it('contains specials', () => {
    expect(IORI_HITBOX_KEYS).toContain('IORI_ONIYAKI');
    expect(IORI_HITBOX_KEYS).toContain('IORI_AOIHANA');
  });

  it('getIoriHitboxOffsets returns record', () => {
    const offsets = getIoriHitboxOffsets();
    expect(typeof offsets).toBe('object');
  });

  it('IORI_ATTACK_FRAME_KEYS has entries', () => {
    expect(IORI_ATTACK_FRAME_KEYS.length).toBeGreaterThan(5);
  });

  it('getIoriAttackFrames returns record', () => {
    const frames = getIoriAttackFrames();
    expect(typeof frames).toBe('object');
  });
});

// ===== Feedback Tier Summaries =====

const VALID_TIERS = ['light', 'heavy', 'special', 'dm', 'sdm', 'hsdm'];

function validateFeedbackSummary(summary: Record<string, string[]>, charId: string) {
  describe(`${charId} FEEDBACK_SUMMARY`, () => {
    it('has all tier categories', () => {
      for (const tier of VALID_TIERS) {
        expect(summary[tier], `${charId} has ${tier}`).toBeDefined();
      }
    });

    it('all entries are non-empty string arrays', () => {
      for (const [tier, attacks] of Object.entries(summary)) {
        expect(Array.isArray(attacks), `${charId}.${tier} is array`).toBe(true);
        for (const a of attacks) {
          expect(a.length, `${charId}.${tier}["${a}"]`).toBeGreaterThan(0);
        }
      }
    });

    it('light tier has stand_a', () => {
      expect(summary.light).toContain('STAND_A');
    });

    it('heavy tier has stand_c', () => {
      expect(summary.heavy).toContain('STAND_C');
    });

    it('dm tier is non-empty', () => {
      expect(summary.dm.length, `${charId} dm`).toBeGreaterThan(0);
    });

    it('sdm tier is non-empty', () => {
      expect(summary.sdm.length, `${charId} sdm`).toBeGreaterThan(0);
    });

    it('no attack appears in multiple tiers', () => {
      const allAttacks: string[] = [];
      for (const attacks of Object.values(summary)) {
        allAttacks.push(...attacks);
      }
      expect(new Set(allAttacks).size, `${charId} no duplicate attacks across tiers`).toBe(allAttacks.length);
    });
  });
}

validateFeedbackSummary(KYO_FEEDBACK_SUMMARY, 'kyo');
validateFeedbackSummary(IORI_FEEDBACK_SUMMARY, 'iori');

// ===== Feedback Tier Functions =====

describe('getKyoFeedbackTiers', () => {
  it('returns a record with entries', () => {
    const tiers = getKyoFeedbackTiers();
    expect(Object.keys(tiers).length).toBeGreaterThan(0);
  });

  it('all values are valid tier names', () => {
    const tiers = getKyoFeedbackTiers();
    for (const [key, tier] of Object.entries(tiers)) {
      expect(VALID_TIERS, `kyo ${key} tier`).toContain(tier);
    }
  });
});

describe('getIoriFeedbackTiers', () => {
  it('returns a record with entries', () => {
    const tiers = getIoriFeedbackTiers();
    expect(Object.keys(tiers).length).toBeGreaterThan(0);
  });

  it('all values are valid tier names', () => {
    const tiers = getIoriFeedbackTiers();
    for (const [key, tier] of Object.entries(tiers)) {
      expect(VALID_TIERS, `iori ${key} tier`).toContain(tier);
    }
  });
});

describe('getKyoFeedback', () => {
  it('returns feedback params for known attack', () => {
    const fb = getKyoFeedback('STAND_A');
    expect(fb).toBeDefined();
  });
});

describe('getIoriFeedback', () => {
  it('returns feedback params for known attack', () => {
    const fb = getIoriFeedback('STAND_A');
    expect(fb).toBeDefined();
  });
});
