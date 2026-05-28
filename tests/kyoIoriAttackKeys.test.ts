/**
 * Kyo & Iori Attack Key Definitions Regression Tests
 *
 * Validates attack key lists, frame data queries, and cross-character consistency.
 */
import { describe, it, expect } from 'vitest';
import {
  KYO_ATTACK_KEYS,
  getKyoFrameData,
  getKyoAttackFrameData,
} from '../src/content/characters/kyo/attacks/kyoAttacks.js';
import {
  IORI_ATTACK_KEYS,
  getIoriFrameData,
  getIoriAttackFrameData,
} from '../src/content/characters/iori/attacks/ioriAttacks.js';

// ===== KYO_ATTACK_KEYS =====

describe('KYO_ATTACK_KEYS', () => {
  it('has entries for standing normals', () => {
    for (const k of ['STAND_A', 'STAND_B', 'STAND_C', 'STAND_D']) {
      expect(KYO_ATTACK_KEYS).toContain(k);
    }
  });

  it('has entries for close normals', () => {
    for (const k of ['CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D']) {
      expect(KYO_ATTACK_KEYS).toContain(k);
    }
  });

  it('has entries for crouching normals', () => {
    for (const k of ['CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D']) {
      expect(KYO_ATTACK_KEYS).toContain(k);
    }
  });

  it('has entries for jump normals', () => {
    for (const k of ['JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D']) {
      expect(KYO_ATTACK_KEYS).toContain(k);
    }
  });

  it('has command normals', () => {
    for (const k of ['CMD_GOFU_YOU', 'CMD_88SHIKI', 'CMD_NARAKU']) {
      expect(KYO_ATTACK_KEYS).toContain(k);
    }
  });

  it('has specials', () => {
    for (const k of ['KYO_ONIYAKI', 'KYO_YAMIBARAI', 'KYO_75KAI', 'KYO_RED_KICK']) {
      expect(KYO_ATTACK_KEYS).toContain(k);
    }
  });

  it('has rekka chains', () => {
    // Aragami chain
    expect(KYO_ATTACK_KEYS).toContain('KYO_ARAGAMI');
    expect(KYO_ATTACK_KEYS).toContain('KYO_ARAGAMI_KONOKIZU');
    expect(KYO_ATTACK_KEYS).toContain('KYO_ARAGAMI_YANOSABI');
    // Dokugami chain
    expect(KYO_ATTACK_KEYS).toContain('KYO_DOKUGAMI');
    expect(KYO_ATTACK_KEYS).toContain('KYO_TSUMIYOMI');
    expect(KYO_ATTACK_KEYS).toContain('KYO_BATSUYOMI');
  });

  it('has throws and CD blowbacks', () => {
    for (const k of ['THROW', 'THROW_FORWARD', 'THROW_BACK', 'STAND_CD', 'JUMP_CD']) {
      expect(KYO_ATTACK_KEYS).toContain(k);
    }
  });

  it('has DM/SDM/HSDM', () => {
    expect(KYO_ATTACK_KEYS).toContain('DM_OROCHINAGI');
    expect(KYO_ATTACK_KEYS).toContain('SDM_OROCHINAGI');
    expect(KYO_ATTACK_KEYS).toContain('HSDM_OROCHINAGI');
  });

  it('has no duplicates', () => {
    expect(new Set(KYO_ATTACK_KEYS).size).toBe(KYO_ATTACK_KEYS.length);
  });

  it('total count is reasonable (>30)', () => {
    expect(KYO_ATTACK_KEYS.length).toBeGreaterThan(30);
  });
});

// ===== getKyoFrameData =====

describe('getKyoFrameData', () => {
  it('returns frame data for known keys', () => {
    const fd = getKyoFrameData();
    expect(Object.keys(fd).length).toBeGreaterThan(0);
  });

  it('has STAND_A in result', () => {
    const fd = getKyoFrameData();
    expect(fd.STAND_A).toBeDefined();
  });

  it('has DM_OROCHINAGI in result', () => {
    const fd = getKyoFrameData();
    expect(fd.DM_OROCHINAGI).toBeDefined();
  });
});

describe('getKyoAttackFrameData', () => {
  it('returns data for STAND_A', () => {
    const fd = getKyoAttackFrameData('STAND_A');
    expect(fd).toBeDefined();
  });

  it('returns undefined for non-existent', () => {
    expect(getKyoAttackFrameData('FAKE_ATTACK')).toBeUndefined();
  });
});

// ===== IORI_ATTACK_KEYS =====

describe('IORI_ATTACK_KEYS', () => {
  it('has standing normals', () => {
    for (const k of ['STAND_A', 'STAND_B', 'STAND_C', 'STAND_D']) {
      expect(IORI_ATTACK_KEYS).toContain(k);
    }
  });

  it('has Iori command normals', () => {
    for (const k of ['IORI_YUMEYUMI', 'IORI_KATANUGI', 'IORI_YUKIWARUI']) {
      expect(IORI_ATTACK_KEYS).toContain(k);
    }
  });

  it('has Iori specials', () => {
    for (const k of ['IORI_YAMIBARAI', 'IORI_ONIYAKI', 'IORI_KOTOTSUKI', 'IORI_KUZUKAZE']) {
      expect(IORI_ATTACK_KEYS).toContain(k);
    }
  });

  it('has aoihana rekka chains (A and C versions)', () => {
    // A chain
    expect(IORI_ATTACK_KEYS).toContain('IORI_AOIHANA');
    expect(IORI_ATTACK_KEYS).toContain('IORI_AOIHANA_2');
    expect(IORI_ATTACK_KEYS).toContain('IORI_AOIHANA_3');
    // C chain
    expect(IORI_ATTACK_KEYS).toContain('IORI_AOIHANA_C');
    expect(IORI_ATTACK_KEYS).toContain('IORI_AOIHANA_C_2');
    expect(IORI_ATTACK_KEYS).toContain('IORI_AOIHANA_C_3');
  });

  it('has DM/SDM/HSDM', () => {
    expect(IORI_ATTACK_KEYS).toContain('DM_YATAGARASU');
    expect(IORI_ATTACK_KEYS).toContain('SDM_YATAGARASU');
    expect(IORI_ATTACK_KEYS).toContain('HSDM_YAOTOME');
  });

  it('has no duplicates', () => {
    expect(new Set(IORI_ATTACK_KEYS).size).toBe(IORI_ATTACK_KEYS.length);
  });

  it('total count is reasonable (>25)', () => {
    expect(IORI_ATTACK_KEYS.length).toBeGreaterThan(25);
  });
});

// ===== getIoriFrameData =====

describe('getIoriFrameData', () => {
  it('returns frame data for known keys', () => {
    const fd = getIoriFrameData();
    expect(Object.keys(fd).length).toBeGreaterThan(0);
  });

  it('has IORI_AOIHANA in result', () => {
    const fd = getIoriFrameData();
    expect(fd.IORI_AOIHANA).toBeDefined();
  });
});

describe('getIoriAttackFrameData', () => {
  it('returns data for IORI_ONIYAKI', () => {
    const fd = getIoriAttackFrameData('IORI_ONIYAKI');
    expect(fd).toBeDefined();
  });

  it('returns undefined for non-existent', () => {
    expect(getIoriAttackFrameData('FAKE')).toBeUndefined();
  });
});

// ===== Cross-character consistency =====

describe('Kyo vs Iori attack key consistency', () => {
  it('share common normals', () => {
    const shared = ['STAND_A', 'STAND_B', 'STAND_C', 'STAND_D', 'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D'];
    for (const k of shared) {
      expect(KYO_ATTACK_KEYS).toContain(k);
      expect(IORI_ATTACK_KEYS).toContain(k);
    }
  });

  it('share system attacks', () => {
    for (const k of ['THROW', 'THROW_FORWARD', 'THROW_BACK', 'STAND_CD', 'JUMP_CD']) {
      expect(KYO_ATTACK_KEYS).toContain(k);
      expect(IORI_ATTACK_KEYS).toContain(k);
    }
  });

  it('character-specific specials do not overlap', () => {
    const kyoSpecials = KYO_ATTACK_KEYS.filter(k => k.startsWith('KYO_'));
    const ioriSpecials = IORI_ATTACK_KEYS.filter(k => k.startsWith('IORI_'));
    const overlap = kyoSpecials.filter(k => ioriSpecials.includes(k));
    expect(overlap).toEqual([]);
  });

  it('character-specific DMs do not overlap', () => {
    const kyoDMs = KYO_ATTACK_KEYS.filter(k => k.startsWith('DM_') || k.startsWith('SDM_') || k.startsWith('HSDM_'));
    const ioriDMs = IORI_ATTACK_KEYS.filter(k => k.startsWith('DM_') || k.startsWith('SDM_') || k.startsWith('HSDM_'));
    const overlap = kyoDMs.filter(k => ioriDMs.includes(k));
    expect(overlap).toEqual([]);
  });
});
