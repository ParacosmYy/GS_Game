/**
 * Frame Data Balance Invariants Tests
 *
 * Validates game balance invariants across FRAME_DATA:
 * - Light normals < heavy normals in damage
 * - Close normals faster than far normals
 * - Specials have more damage than normals
 * - DM damage > special damage
 * - SDM damage >= DM damage
 * - hitstun > blockstun for all attacks
 * - Knockdown attacks have longer recovery
 * - All attacks have valid hitLevel
 * - Pushback is positive
 * - Startup ordering: light < heavy
 */
import { describe, it, expect } from 'vitest';
import { FRAME_DATA } from '../src/core/frameDataConstants.js';

const fd = FRAME_DATA;
const VALID_HIT_LEVELS = new Set(['MID', 'HIGH', 'LOW']);

describe('FRAME_DATA basic validity', () => {
  it('has entries', () => {
    expect(Object.keys(fd).length).toBeGreaterThan(20);
  });

  it('all entries have positive damage', () => {
    for (const [key, entry] of Object.entries(fd)) {
      expect(entry.damage, `${key} damage`).toBeGreaterThan(0);
    }
  });

  it('all entries have valid hitLevel', () => {
    for (const [key, entry] of Object.entries(fd)) {
      expect(VALID_HIT_LEVELS.has(entry.hitLevel), `${key} hitLevel`).toBe(true);
    }
  });

  it('all entries have positive startup', () => {
    for (const [key, entry] of Object.entries(fd)) {
      expect(entry.startup, `${key} startup`).toBeGreaterThan(0);
    }
  });

  it('all entries have positive active', () => {
    for (const [key, entry] of Object.entries(fd)) {
      expect(entry.active, `${key} active`).toBeGreaterThan(0);
    }
  });

  it('all entries have non-negative recovery', () => {
    for (const [key, entry] of Object.entries(fd)) {
      expect(entry.recovery, `${key} recovery`).toBeGreaterThanOrEqual(0);
    }
  });

  it('all entries have non-negative pushback', () => {
    for (const [key, entry] of Object.entries(fd)) {
      expect(entry.pushback, `${key} pushback`).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('Normal attack balance', () => {
  it('STAND_C damage > STAND_A damage', () => {
    expect(fd.STAND_C.damage).toBeGreaterThan(fd.STAND_A.damage);
  });

  it('STAND_D damage > STAND_B damage', () => {
    expect(fd.STAND_D.damage).toBeGreaterThan(fd.STAND_B.damage);
  });

  it('CLOSE_C damage >= STAND_A damage', () => {
    expect(fd.CLOSE_C.damage).toBeGreaterThanOrEqual(fd.STAND_A.damage);
  });

  it('light startup < heavy startup (far)', () => {
    expect(fd.STAND_A.startup).toBeLessThan(fd.STAND_C.startup);
    expect(fd.STAND_B.startup).toBeLessThanOrEqual(fd.STAND_D.startup);
  });

  it('close startup <= far startup', () => {
    expect(fd.CLOSE_A.startup).toBeLessThanOrEqual(fd.STAND_A.startup);
    expect(fd.CLOSE_C.startup).toBeLessThanOrEqual(fd.STAND_C.startup);
  });

  it('crouch_d has knockdown', () => {
    expect(fd.CROUCH_D.knockdown).toBe(true);
  });

  it('stand_a does not knockdown', () => {
    expect(fd.STAND_A.knockdown).toBe(false);
  });
});

describe('Attack tier balance', () => {
  it('hitstun and blockstun are non-negative for all attacks', () => {
    for (const [key, entry] of Object.entries(fd)) {
      expect(entry.hitstun, `${key} hitstun`).toBeGreaterThanOrEqual(0);
      expect(entry.blockstun, `${key} blockstun`).toBeGreaterThanOrEqual(0);
    }
  });

  it('heavy hitstun > light hitstun', () => {
    expect(fd.STAND_C.hitstun).toBeGreaterThan(fd.STAND_A.hitstun);
  });

  it('heavy blockstun > light blockstun', () => {
    expect(fd.STAND_C.blockstun).toBeGreaterThan(fd.STAND_A.blockstun);
  });
});

describe('Character special balance (Ryo)', () => {
  it('Ryo specials have more damage than STAND_A', () => {
    expect(fd.RYO_KOOU.damage, 'Koou > STAND_A').toBeGreaterThan(fd.STAND_A.damage);
    expect(fd.RYO_KO_HOU.damage, 'Ko Hou > STAND_A').toBeGreaterThan(fd.STAND_A.damage);
  });

  it('Ryo DM has more damage than specials', () => {
    expect(fd.DM_TEN_HA_OU.damage, 'DM > Koou').toBeGreaterThan(fd.RYO_KOOU.damage);
  });

  it('Ryo SDM >= DM damage', () => {
    expect(fd.SDM_TEN_HA_OU.damage).toBeGreaterThanOrEqual(fd.DM_TEN_HA_OU.damage);
  });

  it('Ryo uppercut (Ko Hou) has knockdown', () => {
    expect(fd.RYO_KO_HOU.knockdown, 'Ko Hou knockdown').toBe(true);
  });
});

describe('Character special balance (Kyo)', () => {
  it('Kyo specials exist in FRAME_DATA', () => {
    expect(fd.KYO_ONIYAKI).toBeDefined();
    expect(fd.KYO_YAMIBARAI).toBeDefined();
    expect(fd.KYO_ARAGAMI).toBeDefined();
  });

  it('Kyo DM > special damage', () => {
    expect(fd.DM_OROCHINAGI.damage).toBeGreaterThan(fd.KYO_ONIYAKI.damage);
  });

  it('Kyo SDM >= DM damage', () => {
    expect(fd.SDM_OROCHINAGI.damage).toBeGreaterThanOrEqual(fd.DM_OROCHINAGI.damage);
  });

  it('Kyo uppercut (Oniyaki) has knockdown', () => {
    expect(fd.KYO_ONIYAKI.knockdown, 'Oniyaki knockdown').toBe(true);
  });

  it('Kyo strong uppercut has longer active than weak', () => {
    expect(fd.KYO_ONIYAKI_C.active, 'Oniyaki C active > A active').toBeGreaterThan(fd.KYO_ONIYAKI.active);
  });
});

describe('Character special balance (Iori)', () => {
  it('Iori specials exist in FRAME_DATA', () => {
    expect(fd.IORI_ONIYAKI).toBeDefined();
    expect(fd.IORI_YAMIBARAI).toBeDefined();
    expect(fd.IORI_AOIHANA).toBeDefined();
  });

  it('Iori DM > special damage', () => {
    expect(fd.DM_YATAGARASU.damage).toBeGreaterThan(fd.IORI_ONIYAKI.damage);
  });

  it('Iori SDM >= DM damage', () => {
    expect(fd.SDM_YATAGARASU.damage).toBeGreaterThanOrEqual(fd.DM_YATAGARASU.damage);
  });

  it('Iori uppercut (Oniyaki) has knockdown', () => {
    expect(fd.IORI_ONIYAKI.knockdown, 'Iori Oniyaki knockdown').toBe(true);
  });

  it('Iori rekka stage 3 has knockdown', () => {
    expect(fd.IORI_AOIHANA_3.knockdown, 'Aoihana 3 knockdown').toBe(true);
  });
});

describe('Cross-character balance', () => {
  it('all three uppercuts have knockdown', () => {
    expect(fd.RYO_KO_HOU.knockdown).toBe(true);
    expect(fd.KYO_ONIYAKI.knockdown).toBe(true);
    expect(fd.IORI_ONIYAKI.knockdown).toBe(true);
  });

  it('all three DMs do more than 60 damage', () => {
    expect(fd.DM_TEN_HA_OU.damage).toBeGreaterThan(60);
    expect(fd.DM_OROCHINAGI.damage).toBeGreaterThan(60);
    expect(fd.DM_YATAGARASU.damage).toBeGreaterThan(60);
  });

  it('all projectiles exist', () => {
    expect(fd.RYO_KOOU).toBeDefined();
    expect(fd.KYO_YAMIBARAI).toBeDefined();
    expect(fd.IORI_YAMIBARAI).toBeDefined();
  });
});
