/**
 * Ryo Attack & Hitbox Key Definitions Regression Tests
 *
 * Validates Ryo-specific attack keys, hitbox keys, frame data and attack frame queries.
 */
import { describe, it, expect } from 'vitest';
import {
  RYO_ATTACK_KEYS,
  getRyoFrameData,
  getRyoAttackFrameData,
} from '../src/content/characters/ryo/attacks/ryoAttacks.js';
import {
  RYO_HITBOX_KEYS,
  getRyoHitboxOffsets,
  RYO_ATTACK_FRAME_KEYS,
  getRyoAttackFrames,
} from '../src/content/characters/ryo/hitboxes/ryoHitboxes.js';

// ===== RYO_ATTACK_KEYS =====

describe('RYO_ATTACK_KEYS', () => {
  it('has standing normals', () => {
    for (const k of ['STAND_A', 'STAND_B', 'STAND_C', 'STAND_D']) {
      expect(RYO_ATTACK_KEYS).toContain(k);
    }
  });

  it('has close normals', () => {
    for (const k of ['CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D']) {
      expect(RYO_ATTACK_KEYS).toContain(k);
    }
  });

  it('has crouching normals', () => {
    for (const k of ['CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D']) {
      expect(RYO_ATTACK_KEYS).toContain(k);
    }
  });

  it('has jump normals', () => {
    for (const k of ['JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D']) {
      expect(RYO_ATTACK_KEYS).toContain(k);
    }
  });

  it('has command normals', () => {
    expect(RYO_ATTACK_KEYS).toContain('RYO_TSURIZAO');
    expect(RYO_ATTACK_KEYS).toContain('RYO_ORISHI');
  });

  it('has specials', () => {
    for (const k of ['RYO_KOOU', 'RYO_KO_HOU', 'RYO_HIEN', 'RYO_HAOU', 'RYO_ZANRETSU_KEN']) {
      expect(RYO_ATTACK_KEYS).toContain(k);
    }
  });

  it('has A and C versions for key specials', () => {
    expect(RYO_ATTACK_KEYS).toContain('RYO_KOOU');
    expect(RYO_ATTACK_KEYS).toContain('RYO_KOOU_C');
    expect(RYO_ATTACK_KEYS).toContain('RYO_KO_HOU');
    expect(RYO_ATTACK_KEYS).toContain('RYO_KO_HOU_C');
  });

  it('has throws and CD blowbacks', () => {
    for (const k of ['THROW', 'THROW_FORWARD', 'THROW_BACK', 'STAND_CD', 'JUMP_CD']) {
      expect(RYO_ATTACK_KEYS).toContain(k);
    }
  });

  it('has DM/SDM/HSDM', () => {
    expect(RYO_ATTACK_KEYS).toContain('DM_TEN_HA_OU');
    expect(RYO_ATTACK_KEYS).toContain('DM_RYUKO_RANBU');
    expect(RYO_ATTACK_KEYS).toContain('SDM_TEN_HA_OU');
    expect(RYO_ATTACK_KEYS).toContain('SDM_RYUKO_RANBU');
    expect(RYO_ATTACK_KEYS).toContain('HSDM_RYUKO_RANBU');
  });

  it('no duplicates', () => {
    expect(new Set(RYO_ATTACK_KEYS).size).toBe(RYO_ATTACK_KEYS.length);
  });

  it('count is reasonable (>25)', () => {
    expect(RYO_ATTACK_KEYS.length).toBeGreaterThan(25);
  });
});

// ===== getRyoFrameData =====

describe('getRyoFrameData', () => {
  it('returns frame data for known keys', () => {
    const fd = getRyoFrameData();
    expect(Object.keys(fd).length).toBeGreaterThan(0);
  });

  it('has STAND_A', () => {
    const fd = getRyoFrameData();
    expect(fd.STAND_A).toBeDefined();
  });

  it('has DM_TEN_HA_OU', () => {
    const fd = getRyoFrameData();
    expect(fd.DM_TEN_HA_OU).toBeDefined();
  });
});

describe('getRyoAttackFrameData', () => {
  it('returns data for RYO_KOOU', () => {
    const fd = getRyoAttackFrameData('RYO_KOOU');
    expect(fd).toBeDefined();
  });

  it('returns undefined for non-existent', () => {
    expect(getRyoAttackFrameData('FAKE')).toBeUndefined();
  });
});

// ===== RYO_HITBOX_KEYS =====

describe('RYO_HITBOX_KEYS', () => {
  it('has command normals', () => {
    expect(RYO_HITBOX_KEYS).toContain('RYO_TSURIZAO');
    expect(RYO_HITBOX_KEYS).toContain('RYO_ORISHI');
  });

  it('has specials', () => {
    for (const k of ['RYO_KOOU', 'RYO_KO_HOU', 'RYO_HIEN', 'RYO_ZANRETSU_KEN']) {
      expect(RYO_HITBOX_KEYS).toContain(k);
    }
  });

  it('has DM/SDM/HSDM', () => {
    expect(RYO_HITBOX_KEYS).toContain('DM_TEN_HA_OU');
    expect(RYO_HITBOX_KEYS).toContain('DM_RYUKO_RANBU');
    expect(RYO_HITBOX_KEYS).toContain('HSDM_RYUKO_RANBU');
  });

  it('no duplicates', () => {
    expect(new Set(RYO_HITBOX_KEYS).size).toBe(RYO_HITBOX_KEYS.length);
  });

  it('count is reasonable (>10)', () => {
    expect(RYO_HITBOX_KEYS.length).toBeGreaterThan(10);
  });
});

// ===== getRyoHitboxOffsets =====

describe('getRyoHitboxOffsets', () => {
  it('returns some hitbox data', () => {
    const hb = getRyoHitboxOffsets();
    expect(Object.keys(hb).length).toBeGreaterThan(0);
  });
});

// ===== RYO_ATTACK_FRAME_KEYS =====

describe('RYO_ATTACK_FRAME_KEYS', () => {
  it('includes SDM_TEN_HA_OU (not in HITBOX_KEYS)', () => {
    expect(RYO_ATTACK_FRAME_KEYS).toContain('SDM_TEN_HA_OU');
  });

  it('no duplicates', () => {
    expect(new Set(RYO_ATTACK_FRAME_KEYS).size).toBe(RYO_ATTACK_FRAME_KEYS.length);
  });

  it('count >= HITBOX_KEYS count', () => {
    expect(RYO_ATTACK_FRAME_KEYS.length).toBeGreaterThanOrEqual(RYO_HITBOX_KEYS.length);
  });
});

// ===== getRyoAttackFrames =====

describe('getRyoAttackFrames', () => {
  it('returns attack frame data', () => {
    const af = getRyoAttackFrames();
    expect(Object.keys(af).length).toBeGreaterThan(0);
  });

  it('has per-frame hitbox arrays', () => {
    const af = getRyoAttackFrames();
    for (const [key, frames] of Object.entries(af)) {
      expect(Array.isArray(frames), `${key} is array`).toBe(true);
      if (Array.isArray(frames)) {
        expect(frames.length, `${key} frames`).toBeGreaterThan(0);
      }
    }
  });
});
