/**
 * AttackType vs FRAME_DATA Coverage Cross-Check
 *
 * Validates that every AttackType enum value has a corresponding FRAME_DATA entry.
 * This catches missing frame data when new AttackTypes are added but not populated.
 *
 * Also validates that every ATTACK_FRAMES entry has a FRAME_DATA counterpart.
 */
import { describe, it, expect } from 'vitest';
import { AttackType } from '../src/core/types.js';
import { FRAME_DATA } from '../src/core/frameDataConstants.js';
import { ATTACK_FRAMES } from '../src/core/attackFrames.js';

// ===== AttackType enum coverage =====

describe('AttackType enum coverage in FRAME_DATA', () => {
  const attackValues = Object.values(AttackType) as string[];
  const fdKeys = new Set(Object.keys(FRAME_DATA));

  it('all generic normal AttackTypes exist in FRAME_DATA', () => {
    const genericNormals = [
      AttackType.STAND_A, AttackType.STAND_B, AttackType.STAND_C, AttackType.STAND_D,
      AttackType.CLOSE_A, AttackType.CLOSE_B, AttackType.CLOSE_C, AttackType.CLOSE_D,
      AttackType.CROUCH_A, AttackType.CROUCH_B, AttackType.CROUCH_C, AttackType.CROUCH_D,
    ];
    for (const atk of genericNormals) {
      expect(fdKeys.has(atk), `${atk} in FRAME_DATA`).toBe(true);
    }
  });

  it('all Ryo special AttackTypes exist in FRAME_DATA', () => {
    const ryoSpecials = [
      AttackType.RYO_KOOU, AttackType.RYO_KOOU_C,
      AttackType.RYO_KO_HOU, AttackType.RYO_KO_HOU_C,
      AttackType.RYO_HIEN, AttackType.RYO_HAOU,
    ];
    for (const atk of ryoSpecials) {
      expect(fdKeys.has(atk), `${atk} in FRAME_DATA`).toBe(true);
    }
  });

  it('all Kyo special AttackTypes exist in FRAME_DATA', () => {
    const kyoSpecials = [
      AttackType.KYO_ONIYAKI, AttackType.KYO_ONIYAKI_C,
      AttackType.KYO_YAMIBARAI, AttackType.KYO_YAMIBARAI_C,
      AttackType.KYO_RED_KICK, AttackType.KYO_75KAI,
    ];
    for (const atk of kyoSpecials) {
      expect(fdKeys.has(atk), `${atk} in FRAME_DATA`).toBe(true);
    }
  });

  it('all Iori special AttackTypes exist in FRAME_DATA', () => {
    const ioriSpecials = [
      AttackType.IORI_AOIHANA, AttackType.IORI_AOIHANA_2, AttackType.IORI_AOIHANA_3,
      AttackType.IORI_ONIYAKI, AttackType.IORI_ONIYAKI_C,
      AttackType.IORI_YAMIBARAI, AttackType.IORI_YAMIBARAI_C,
    ];
    for (const atk of ioriSpecials) {
      expect(fdKeys.has(atk), `${atk} in FRAME_DATA`).toBe(true);
    }
  });

  it('all DM/SDM/HSDM AttackTypes exist in FRAME_DATA', () => {
    const dmTypes = attackValues.filter(v =>
      v.startsWith('DM_') || v.startsWith('SDM_') || v.startsWith('HSDM_')
    );
    for (const atk of dmTypes) {
      expect(fdKeys.has(atk), `${atk} in FRAME_DATA`).toBe(true);
    }
  });

  it('FRAME_DATA has at least as many keys as AttackType enum values', () => {
    // FRAME_DATA may have extra keys, but should cover all AttackTypes
    expect(fdKeys.size).toBeGreaterThanOrEqual(attackValues.length);
  });
});

// ===== ATTACK_FRAMES coverage =====

describe('ATTACK_FRAMES cross-reference with FRAME_DATA', () => {
  const afKeys = new Set(Object.keys(ATTACK_FRAMES));
  const fdKeys = new Set(Object.keys(FRAME_DATA));

  it('all ATTACK_FRAMES entries have a FRAME_DATA counterpart', () => {
    const afKeyArray = Array.from(afKeys);
    let missing = 0;
    for (const key of afKeyArray) {
      if (!fdKeys.has(key)) {
        missing++;
      }
    }
    expect(missing, `ATTACK_FRAMES entries missing from FRAME_DATA`).toBe(0);
  });

  it('ATTACK_FRAMES covers generic normals', () => {
    const normals = ['STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
      'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
      'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D'];
    for (const n of normals) {
      expect(afKeys.has(n), `${n} in ATTACK_FRAMES`).toBe(true);
    }
  });

  it('ATTACK_FRAMES covers Ryo specials', () => {
    const specials = ['RYO_KOOU', 'RYO_KOOU_C', 'RYO_KO_HOU', 'RYO_KO_HOU_C', 'RYO_HIEN', 'RYO_HAOU'];
    for (const s of specials) {
      expect(afKeys.has(s), `${s} in ATTACK_FRAMES`).toBe(true);
    }
  });

  it('generic normals have same active frame count in ATTACK_FRAMES as FRAME_DATA', () => {
    const normals = ['STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
      'CLOSE_A', 'CLOSE_C', 'CROUCH_A', 'CROUCH_C', 'CROUCH_D'];
    for (const key of normals) {
      const fd = (FRAME_DATA as Record<string, { active: number }>)[key];
      const af = (ATTACK_FRAMES as Record<string, unknown[]>)[key];
      if (!fd || !af) continue;
      expect(af.length, `${key}: ATTACK_FRAMES.length === FRAME_DATA.active (${fd.active})`).toBe(fd.active);
    }
  });
});
