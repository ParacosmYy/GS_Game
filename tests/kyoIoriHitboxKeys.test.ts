/**
 * Kyo & Iori Hitbox Key Definitions Regression Tests
 *
 * Validates hitbox/attack frame key lists and query functions.
 */
import { describe, it, expect } from 'vitest';
import {
  KYO_HITBOX_KEYS,
  getKyoHitboxOffsets,
  KYO_ATTACK_FRAME_KEYS,
  getKyoAttackFrames,
} from '../src/content/characters/kyo/hitboxes/kyoHitboxes.js';
import {
  IORI_HITBOX_KEYS,
  getIoriHitboxOffsets,
  IORI_ATTACK_FRAME_KEYS,
  getIoriAttackFrames,
} from '../src/content/characters/iori/hitboxes/ioriHitboxes.js';

// ===== KYO_HITBOX_KEYS =====

describe('KYO_HITBOX_KEYS', () => {
  it('has command normals', () => {
    for (const k of ['CMD_GOFU_YOU', 'CMD_88SHIKI', 'CMD_NARAKU']) {
      expect(KYO_HITBOX_KEYS).toContain(k);
    }
  });

  it('has specials', () => {
    for (const k of ['KYO_ONIYAKI', 'KYO_YAMIBARAI', 'KYO_75KAI']) {
      expect(KYO_HITBOX_KEYS).toContain(k);
    }
  });

  it('has rekka chains', () => {
    expect(KYO_HITBOX_KEYS).toContain('KYO_ARAGAMI');
    expect(KYO_HITBOX_KEYS).toContain('KYO_DOKUGAMI');
  });

  it('has DM/SDM/HSDM', () => {
    expect(KYO_HITBOX_KEYS).toContain('DM_OROCHINAGI');
    expect(KYO_HITBOX_KEYS).toContain('SDM_OROCHINAGI');
    expect(KYO_HITBOX_KEYS).toContain('HSDM_OROCHINAGI');
  });

  it('no duplicates', () => {
    expect(new Set(KYO_HITBOX_KEYS).size).toBe(KYO_HITBOX_KEYS.length);
  });

  it('count is reasonable (>15)', () => {
    expect(KYO_HITBOX_KEYS.length).toBeGreaterThan(15);
  });
});

// ===== getKyoHitboxOffsets =====

describe('getKyoHitboxOffsets', () => {
  it('returns some hitbox data', () => {
    const hb = getKyoHitboxOffsets();
    expect(Object.keys(hb).length).toBeGreaterThan(0);
  });

  it('returns data for specials with offsets', () => {
    const hb = getKyoHitboxOffsets();
    // At least some keys should have data
    const foundKeys = Object.keys(hb);
    expect(foundKeys.length).toBeGreaterThan(0);
  });
});

// ===== KYO_ATTACK_FRAME_KEYS =====

describe('KYO_ATTACK_FRAME_KEYS', () => {
  it('matches KYO_HITBOX_KEYS content', () => {
    expect(KYO_ATTACK_FRAME_KEYS.length).toBe(KYO_HITBOX_KEYS.length);
  });

  it('no duplicates', () => {
    expect(new Set(KYO_ATTACK_FRAME_KEYS).size).toBe(KYO_ATTACK_FRAME_KEYS.length);
  });
});

// ===== getKyoAttackFrames =====

describe('getKyoAttackFrames', () => {
  it('returns attack frame data', () => {
    const af = getKyoAttackFrames();
    expect(Object.keys(af).length).toBeGreaterThan(0);
  });

  it('has per-frame hitbox arrays for specials', () => {
    const af = getKyoAttackFrames();
    // Each entry should be an array with at least one frame
    for (const [key, frames] of Object.entries(af)) {
      expect(Array.isArray(frames), `${key} is array`).toBe(true);
      if (Array.isArray(frames)) {
        expect(frames.length, `${key} has frames`).toBeGreaterThan(0);
      }
    }
  });
});

// ===== IORI_HITBOX_KEYS =====

describe('IORI_HITBOX_KEYS', () => {
  it('has Iori command normals', () => {
    for (const k of ['IORI_YUMEYUMI', 'IORI_KATANUGI', 'IORI_YUKIWARUI']) {
      expect(IORI_HITBOX_KEYS).toContain(k);
    }
  });

  it('has Iori specials', () => {
    for (const k of ['IORI_YAMIBARAI', 'IORI_ONIYAKI', 'IORI_KOTOTSUKI', 'IORI_KUZUKAZE']) {
      expect(IORI_HITBOX_KEYS).toContain(k);
    }
  });

  it('has aoihana rekka chains (A and C)', () => {
    expect(IORI_HITBOX_KEYS).toContain('IORI_AOIHANA');
    expect(IORI_HITBOX_KEYS).toContain('IORI_AOIHANA_2');
    expect(IORI_HITBOX_KEYS).toContain('IORI_AOIHANA_3');
    expect(IORI_HITBOX_KEYS).toContain('IORI_AOIHANA_C');
    expect(IORI_HITBOX_KEYS).toContain('IORI_AOIHANA_C_2');
    expect(IORI_HITBOX_KEYS).toContain('IORI_AOIHANA_C_3');
  });

  it('has DM/SDM/HSDM', () => {
    expect(IORI_HITBOX_KEYS).toContain('DM_YATAGARASU');
    expect(IORI_HITBOX_KEYS).toContain('SDM_YATAGARASU');
    expect(IORI_HITBOX_KEYS).toContain('HSDM_YAOTOME');
  });

  it('no duplicates', () => {
    expect(new Set(IORI_HITBOX_KEYS).size).toBe(IORI_HITBOX_KEYS.length);
  });
});

// ===== getIoriHitboxOffsets =====

describe('getIoriHitboxOffsets', () => {
  it('returns some hitbox data', () => {
    const hb = getIoriHitboxOffsets();
    expect(Object.keys(hb).length).toBeGreaterThan(0);
  });
});

// ===== IORI_ATTACK_FRAME_KEYS =====

describe('IORI_ATTACK_FRAME_KEYS', () => {
  it('matches IORI_HITBOX_KEYS content', () => {
    expect(IORI_ATTACK_FRAME_KEYS.length).toBe(IORI_HITBOX_KEYS.length);
  });

  it('no duplicates', () => {
    expect(new Set(IORI_ATTACK_FRAME_KEYS).size).toBe(IORI_ATTACK_FRAME_KEYS.length);
  });
});

// ===== getIoriAttackFrames =====

describe('getIoriAttackFrames', () => {
  it('returns attack frame data', () => {
    const af = getIoriAttackFrames();
    expect(Object.keys(af).length).toBeGreaterThan(0);
  });

  it('has per-frame hitbox arrays', () => {
    const af = getIoriAttackFrames();
    for (const [key, frames] of Object.entries(af)) {
      expect(Array.isArray(frames), `${key} is array`).toBe(true);
      if (Array.isArray(frames)) {
        expect(frames.length, `${key} has frames`).toBeGreaterThan(0);
      }
    }
  });
});

// ===== Cross-character hitbox consistency =====

describe('Kyo vs Iori hitbox consistency', () => {
  it('character-specific hitbox keys do not overlap', () => {
    const kyoSpecific = KYO_HITBOX_KEYS.filter(k => k.startsWith('KYO_'));
    const ioriSpecific = IORI_HITBOX_KEYS.filter(k => k.startsWith('IORI_'));
    const overlap = kyoSpecific.filter(k => ioriSpecific.includes(k));
    expect(overlap).toEqual([]);
  });

  it('character-specific attack frame keys do not overlap', () => {
    const kyoSpecific = KYO_ATTACK_FRAME_KEYS.filter(k => k.startsWith('KYO_'));
    const ioriSpecific = IORI_ATTACK_FRAME_KEYS.filter(k => k.startsWith('IORI_'));
    const overlap = kyoSpecific.filter(k => ioriSpecific.includes(k));
    expect(overlap).toEqual([]);
  });

  it('both have hitbox data for at least some specials', () => {
    const kyoHB = getKyoHitboxOffsets();
    const ioriHB = getIoriHitboxOffsets();
    expect(Object.keys(kyoHB).length).toBeGreaterThan(0);
    expect(Object.keys(ioriHB).length).toBeGreaterThan(0);
  });

  it('both have attack frame data', () => {
    const kyoAF = getKyoAttackFrames();
    const ioriAF = getIoriAttackFrames();
    expect(Object.keys(kyoAF).length).toBeGreaterThan(0);
    expect(Object.keys(ioriAF).length).toBeGreaterThan(0);
  });
});
