import { describe, it, expect } from 'vitest';
import { HITBOX_OFFSETS } from '../src/core/hitboxConstants.js';

describe('hitboxConstants — Ryo completeness', () => {
  // All Ryo attack types that MUST have hitbox entries
  const RYO_ATTACKS = [
    // 通常技
    'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
    'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
    'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
    'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
    'STAND_CD', 'JUMP_CD',
    // 命令通常技
    'RYO_TSURIZAO', 'RYO_ORISHI',
    // 必杀技
    'RYO_KOOU', 'RYO_KOOU_C',
    'RYO_KO_HOU', 'RYO_KO_HOU_C',
    'RYO_HIEN', 'RYO_HAOU',
    // DM/SDM
    'DM_TEN_HA_OU', 'DM_RYUKO_RANBU',
    'SDM_RYUKO_RANBU', 'HSDM_RYUKO_RANBU',
  ] as const;

  it('all Ryo attacks have hitbox entries', () => {
    for (const key of RYO_ATTACKS) {
      expect(HITBOX_OFFSETS).toHaveProperty(key);
    }
  });

  it('all Ryo hitboxes have required fields', () => {
    for (const key of RYO_ATTACKS) {
      const hb = HITBOX_OFFSETS[key as keyof typeof HITBOX_OFFSETS];
      expect(hb).toHaveProperty('offsetX');
      expect(hb).toHaveProperty('offsetY');
      expect(hb).toHaveProperty('width');
      expect(hb).toHaveProperty('height');
    }
  });

  it('all Ryo hitbox offsets are positive numbers', () => {
    for (const key of RYO_ATTACKS) {
      const hb = HITBOX_OFFSETS[key as keyof typeof HITBOX_OFFSETS] as { offsetX: number; offsetY: number; width: number; height: number };
      expect(hb.offsetX).toBeGreaterThan(0);
      expect(typeof hb.offsetY).toBe('number'); // offsetY can be negative (upward)
      expect(hb.width).toBeGreaterThan(0);
      expect(hb.height).toBeGreaterThan(0);
    }
  });

  it('Ryo DM hitboxes are larger than specials', () => {
    const dmTenHaOu = HITBOX_OFFSETS.DM_TEN_HA_OU as { width: number; height: number };
    const koou = HITBOX_OFFSETS.RYO_KOOU as { width: number; height: number };
    expect(dmTenHaOu.width * dmTenHaOu.height).toBeGreaterThan(koou.width * koou.height);
  });

  it('Ryo SDM hitbox is larger than DM', () => {
    const sdm = HITBOX_OFFSETS.SDM_RYUKO_RANBU as { width: number; height: number };
    const dm = HITBOX_OFFSETS.DM_RYUKO_RANBU as { width: number; height: number };
    expect(sdm.width * sdm.height).toBeGreaterThanOrEqual(dm.width * dm.height);
  });

  it('Ryo C-version specials have larger hitboxes than A-version', () => {
    const koouC = HITBOX_OFFSETS.RYO_KOOU_C as { width: number; height: number };
    const koou = HITBOX_OFFSETS.RYO_KOOU as { width: number; height: number };
    expect(koouC.width * koouC.height).toBeGreaterThanOrEqual(koou.width * koou.height);

    const koHouC = HITBOX_OFFSETS.RYO_KO_HOU_C as { width: number; height: number };
    const koHou = HITBOX_OFFSETS.RYO_KO_HOU as { width: number; height: number };
    expect(koHouC.width * koHouC.height).toBeGreaterThanOrEqual(koHou.width * koHou.height);
  });

  it('crouch attacks have lower offsetY than stand attacks', () => {
    const crouchA = HITBOX_OFFSETS.CROUCH_A as { offsetY: number };
    const standA = HITBOX_OFFSETS.STAND_A as { offsetY: number };
    expect(crouchA.offsetY).toBeGreaterThan(standA.offsetY); // less negative = lower
  });

  it('throw hitbox exists', () => {
    expect(HITBOX_OFFSETS).toHaveProperty('THROW');
    const throwBox = HITBOX_OFFSETS.THROW as { width: number; height: number };
    expect(throwBox.width).toBeGreaterThan(0);
    expect(throwBox.height).toBeGreaterThan(0);
  });
});
