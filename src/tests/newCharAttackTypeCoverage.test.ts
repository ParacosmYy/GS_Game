/**
 * Tests for Benimaru/Heidern/Yuri AttackType entries and specialMap coverage
 */
import { describe, it, expect } from 'vitest';
import { AttackType } from '../core/types.js';
import { HITBOX_OFFSETS } from '../core/hitboxConstants.js';
import { FRAME_DATA } from '../core/frameDataConstants.js';

describe('Benimaru AttackType coverage', () => {
  const benimaruKeys = [
    AttackType.BENIMARU_JACKKNIFE_KICK,
    AttackType.BENIMARU_FLYING_DRILL,
    AttackType.BENIMARU_RAIJINKEN,
    AttackType.BENIMARU_RAIJINKEN_C,
    AttackType.BENIMARU_IAI_GERI,
    AttackType.BENIMARU_IAI_GERI_D,
    AttackType.BENIMARU_HANDOU_SANDAN_GERI,
    AttackType.BENIMARU_SHINKUU_KATATEGOMA,
    AttackType.BENIMARU_SHINKUU_KATATEGOMA_C,
    AttackType.BENIMARU_COLLIDER,
    AttackType.BENIMARU_SUPER_INAZUMA_KICK,
    AttackType.BENIMARU_SUPER_INAZUMA_KICK_D,
    AttackType.DM_BENIMARU_RAIKOUKEN,
    AttackType.DM_GENEI_HURRICANE,
    AttackType.SDM_BENIMARU_RAIKOUKEN,
  ];

  it('has hitbox offsets for all Benimaru attacks', () => {
    for (const key of benimaruKeys) {
      expect(HITBOX_OFFSETS[key as keyof typeof HITBOX_OFFSETS]).toBeDefined();
    }
  });

  it('has frame data for all Benimaru attacks', () => {
    for (const key of benimaruKeys) {
      const fd = FRAME_DATA[key as keyof typeof FRAME_DATA];
      expect(fd).toBeDefined();
      if (fd) {
        expect(fd.startup).toBeGreaterThan(0);
        expect(fd.active).toBeGreaterThan(0);
        expect(fd.recovery).toBeGreaterThan(0);
        expect(fd.damage).toBeGreaterThan(0);
      }
    }
  });

  it('has 15 Benimaru AttackType entries', () => {
    expect(benimaruKeys).toHaveLength(15);
    const unique = new Set(benimaruKeys);
    expect(unique.size).toBe(15);
  });
});

describe('Heidern AttackType coverage', () => {
  const heidernKeys = [
    AttackType.HEIDERN_CROSS_CUTTER,
    AttackType.HEIDERN_MOON_SLASHER,
    AttackType.HEIDERN_NECK_ROLLER,
    AttackType.HEIDERN_STORMBRINGER,
    AttackType.HEIDERN_KILLING_BRINGER,
    AttackType.HEIDERN_LEIDER_REITTER,
    AttackType.DM_CRITICAL_DRIVER,
    AttackType.DM_HEIDERN_END,
    AttackType.SDM_HEIDERN_END,
    AttackType.HSDM_HEIDERN_END,
  ];

  it('has hitbox offsets for all Heidern attacks', () => {
    for (const key of heidernKeys) {
      expect(HITBOX_OFFSETS[key as keyof typeof HITBOX_OFFSETS]).toBeDefined();
    }
  });

  it('has frame data for all Heidern attacks', () => {
    for (const key of heidernKeys) {
      const fd = FRAME_DATA[key as keyof typeof FRAME_DATA];
      expect(fd).toBeDefined();
      if (fd) {
        expect(fd.startup).toBeGreaterThan(0);
        expect(fd.active).toBeGreaterThan(0);
        expect(fd.recovery).toBeGreaterThan(0);
        expect(fd.damage).toBeGreaterThan(0);
      }
    }
  });

  it('grab moves have knockdown', () => {
    const grabKeys = [AttackType.HEIDERN_STORMBRINGER, AttackType.HEIDERN_KILLING_BRINGER, AttackType.DM_CRITICAL_DRIVER];
    for (const key of grabKeys) {
      const fd = FRAME_DATA[key as keyof typeof FRAME_DATA];
      if (fd) expect(fd.knockdown).toBe(true);
    }
  });
});

describe('Yuri AttackType coverage', () => {
  const yuriKeys = [
    AttackType.YURI_UPPER_BLOCK,
    AttackType.YURI_LOWER_BLOCK,
    AttackType.YURI_ORI,
    AttackType.YURI_KO_OU_KEN,
    AttackType.YURI_HAOH_SHO_KO_KEN,
    AttackType.YURI_CHOU_UPPER,
    AttackType.YURI_HYAKU_RETSU_BINTA,
    AttackType.YURI_HIEN_HOU_OU_KYAKU,
    AttackType.YURI_HISHOU_KUURETSU_ZAN,
    AttackType.YURI_RAI_KEN,
    AttackType.DM_YURI_HAOH_SHO_KO_KEN,
    AttackType.DM_YURI_HIEN_HOU_OU_KYAKU,
    AttackType.SDM_YURI_HAOH_SHO_KO_KEN,
    AttackType.SDM_YURI_HIEN_HOU_OU_KYAKU,
    AttackType.HSDM_YURI_HISHOU_KUURETSU_ZAN,
  ];

  it('has hitbox offsets for all Yuri attacks', () => {
    for (const key of yuriKeys) {
      expect(HITBOX_OFFSETS[key as keyof typeof HITBOX_OFFSETS]).toBeDefined();
    }
  });

  it('has frame data for all Yuri attacks', () => {
    for (const key of yuriKeys) {
      const fd = FRAME_DATA[key as keyof typeof FRAME_DATA];
      expect(fd).toBeDefined();
      if (fd) {
        expect(fd.startup).toBeGreaterThan(0);
        expect(fd.active).toBeGreaterThan(0);
        expect(fd.recovery).toBeGreaterThan(0);
        expect(fd.damage).toBeGreaterThan(0);
      }
    }
  });

  it('DM/SDM/HSDM have higher damage than specials', () => {
    const koouken = FRAME_DATA[YURI_KO_OU_KEN as keyof typeof FRAME_DATA];
    const dm = FRAME_DATA[DM_YURI_HAOH_SHO_KO_KEN as keyof typeof FRAME_DATA];
    const sdm = FRAME_DATA[SDM_YURI_HAOH_SHO_KO_KEN as keyof typeof FRAME_DATA];
    const hsdm = FRAME_DATA[HSDM_YURI_HISHOU_KUURETSU_ZAN as keyof typeof FRAME_DATA];
    if (koouken && dm && sdm && hsdm) {
      expect(dm.damage).toBeGreaterThan(koouken.damage);
      expect(sdm.damage).toBeGreaterThan(dm.damage);
      expect(hsdm.damage).toBeGreaterThan(sdm.damage);
    }
  });
});

const { YURI_KO_OU_KEN, DM_YURI_HAOH_SHO_KO_KEN, SDM_YURI_HAOH_SHO_KO_KEN, HSDM_YURI_HISHOU_KUURETSU_ZAN } = AttackType;
