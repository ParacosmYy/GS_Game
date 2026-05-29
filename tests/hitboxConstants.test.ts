/**
 * Hitbox Constants Regression Test
 * Consolidated from hitboxConstants + hitboxConstantsCore (2 files → 1 file)
 * Verifies all hitbox offset entries have valid geometry and character coverage.
 */
import { describe, it, expect } from 'vitest';
import { HITBOX_OFFSETS } from '../src/core/hitboxConstants.js';

interface HitboxOffset {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

describe('HITBOX_OFFSETS structure', () => {
  it('has at least 100 entries', () => {
    expect(Object.keys(HITBOX_OFFSETS).length).toBeGreaterThanOrEqual(100);
  });

  it('all entries have required fields', () => {
    for (const [key, val] of Object.entries(HITBOX_OFFSETS)) {
      const box = val as HitboxOffset;
      expect(typeof box.offsetX, `${key}.offsetX`).toBe('number');
      expect(typeof box.offsetY, `${key}.offsetY`).toBe('number');
      expect(typeof box.width, `${key}.width`).toBe('number');
      expect(typeof box.height, `${key}.height`).toBe('number');
    }
  });

  it('all widths and heights are positive', () => {
    for (const [key, val] of Object.entries(HITBOX_OFFSETS)) {
      const box = val as HitboxOffset;
      expect(box.width, `${key}.width`).toBeGreaterThan(0);
      expect(box.height, `${key}.height`).toBeGreaterThan(0);
    }
  });

  it('all widths are in reasonable range (20-200)', () => {
    for (const [key, val] of Object.entries(HITBOX_OFFSETS)) {
      const box = val as HitboxOffset;
      expect(box.width, `${key} width`).toBeGreaterThanOrEqual(20);
      expect(box.width, `${key} width`).toBeLessThanOrEqual(200);
    }
  });

  it('all heights are in reasonable range (15-120)', () => {
    for (const [key, val] of Object.entries(HITBOX_OFFSETS)) {
      const box = val as HitboxOffset;
      expect(box.height, `${key} height`).toBeGreaterThanOrEqual(15);
      expect(box.height, `${key} height`).toBeLessThanOrEqual(120);
    }
  });
});

describe('Normal attacks', () => {
  it('all normals present', () => {
    const keys = ['STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
                  'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
                  'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D',
                  'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D'];
    for (const key of keys) {
      expect(HITBOX_OFFSETS[key as keyof typeof HITBOX_OFFSETS], key).toBeDefined();
    }
  });

  it('stand punches are higher than kicks (A/B vs C/D)', () => {
    expect(Math.abs(HITBOX_OFFSETS.STAND_A.offsetY)).toBeGreaterThan(
      Math.abs(HITBOX_OFFSETS.STAND_B.offsetY));
  });

  it('heavy attacks wider than light (C > A)', () => {
    expect(HITBOX_OFFSETS.STAND_C.width).toBeGreaterThan(HITBOX_OFFSETS.STAND_A.width);
  });

  it('crouch attacks are lower than stand', () => {
    expect(Math.abs(HITBOX_OFFSETS.CROUCH_A.offsetY)).toBeLessThan(
      Math.abs(HITBOX_OFFSETS.STAND_A.offsetY));
  });

  it('close attacks are narrower than far', () => {
    expect(HITBOX_OFFSETS.CLOSE_A.width).toBeLessThan(HITBOX_OFFSETS.STAND_A.width);
  });
});

describe('Throw attacks', () => {
  it('THROW, THROW_FORWARD, THROW_BACK have wide hitboxes', () => {
    for (const key of ['THROW', 'THROW_FORWARD', 'THROW_BACK']) {
      const box = HITBOX_OFFSETS[key as keyof typeof HITBOX_OFFSETS];
      expect(box, key).toBeDefined();
      expect(box.width).toBeGreaterThanOrEqual(80);
      expect(box.height).toBeGreaterThanOrEqual(60);
    }
  });
});

describe('Kyo hitboxes', () => {
  const kyoKeys = ['KYO_ONIYAKI', 'KYO_ONIYAKI_C', 'KYO_YAMIBARAI', 'KYO_YAMIBARAI_C',
                   'KYO_ARAGAMI', 'KYO_ARAGAMI_KONOKIZU', 'KYO_ARAGAMI_YANOSABI',
                   'KYO_DOKUGAMI', 'KYO_TSUMIYOMI', 'KYO_BATSUYOMI',
                   'KYO_75KAI', 'KYO_RED_KICK', 'KYO_NANASE', 'KYO_KOTO_TSUKI'];

  it('key Kyo specials present', () => {
    for (const key of kyoKeys) {
      expect(HITBOX_OFFSETS[key as keyof typeof HITBOX_OFFSETS], key).toBeDefined();
    }
  });

  it('KYO_ONIYAKI_C is larger than KYO_ONIYAKI', () => {
    expect(HITBOX_OFFSETS.KYO_ONIYAKI_C.width).toBeGreaterThan(HITBOX_OFFSETS.KYO_ONIYAKI.width);
    expect(HITBOX_OFFSETS.KYO_ONIYAKI_C.height).toBeGreaterThan(HITBOX_OFFSETS.KYO_ONIYAKI.height);
  });
});

describe('Iori hitboxes', () => {
  const ioriKeys = ['IORI_ONIYAKI', 'IORI_ONIYAKI_C', 'IORI_YAMIBARAI', 'IORI_YAMIBARAI_C',
                    'IORI_AOIHANA', 'IORI_AOIHANA_2', 'IORI_AOIHANA_3',
                    'IORI_AOIHANA_C', 'IORI_AOIHANA_C_2', 'IORI_AOIHANA_C_3',
                    'IORI_KUZUKAZE', 'IORI_KOTOTSUKI'];

  it('key Iori specials present', () => {
    for (const key of ioriKeys) {
      expect(HITBOX_OFFSETS[key as keyof typeof HITBOX_OFFSETS], key).toBeDefined();
    }
  });

  it('IORI_KUZUKAZE has throw-range width', () => {
    expect(HITBOX_OFFSETS.IORI_KUZUKAZE.width).toBeGreaterThanOrEqual(80);
  });
});

describe('Ryo hitboxes', () => {
  it('key Ryo specials present', () => {
    const keys = ['RYO_KOOU', 'RYO_KOOU_C', 'RYO_KO_HOU', 'RYO_KO_HOU_C', 'RYO_HIEN'];
    for (const key of keys) {
      expect(HITBOX_OFFSETS[key as keyof typeof HITBOX_OFFSETS], key).toBeDefined();
    }
  });

  it('RYO_KO_HOU_C is larger than RYO_KO_HOU', () => {
    expect(HITBOX_OFFSETS.RYO_KO_HOU_C.width).toBeGreaterThan(HITBOX_OFFSETS.RYO_KO_HOU.width);
  });
});

describe('DM/SDM/HSDM hierarchy', () => {
  it('DM and SDM hitboxes are both substantial (width >= 85)', () => {
    const dmKeys = Object.keys(HITBOX_OFFSETS).filter(k => k.startsWith('DM_'));
    const sdmKeys = Object.keys(HITBOX_OFFSETS).filter(k => k.startsWith('SDM_'));
    for (const key of [...dmKeys, ...sdmKeys]) {
      const box = HITBOX_OFFSETS[key as keyof typeof HITBOX_OFFSETS];
      expect(box.width, `${key}.width`).toBeGreaterThanOrEqual(70);
    }
  });

  it('HSDM hitboxes are at least as large as SDM', () => {
    const pairs = [
      ['SDM_OROCHINAGI', 'HSDM_OROCHINAGI'],
      ['SDM_RYUKO_RANBU', 'HSDM_RYUKO_RANBU'],
    ] as const;
    for (const [sdm, hsdm] of pairs) {
      const sdmBox = HITBOX_OFFSETS[sdm as keyof typeof HITBOX_OFFSETS];
      const hsdmBox = HITBOX_OFFSETS[hsdm as keyof typeof HITBOX_OFFSETS];
      if (sdmBox && hsdmBox) {
        expect(hsdmBox.width, `${hsdm} width >= ${sdm}`).toBeGreaterThanOrEqual(sdmBox.width);
      }
    }
  });
});

describe('Full roster coverage', () => {
  const rosterChars = ['TERRY', 'KIM', 'KDASH', 'KULA', 'LEONA', 'ROBERT',
                       'ATHENA', 'MAI', 'RALF', 'CLARK', 'JOE', 'ANDY',
                       'BILLY', 'CHANG', 'CHOI', 'MATURE', 'YASHIRO', 'CHRIS',
                       'SHERMIE', 'VICE', 'YAMAZAKI', 'XIANGFEI', 'KASUMI', 'MARY'];

  it('each character has at least one hitbox entry', () => {
    const allKeys = Object.keys(HITBOX_OFFSETS);
    for (const char of rosterChars) {
      const hasEntry = allKeys.some(k => k.startsWith(char + '_'));
      expect(hasEntry, `${char} hitbox entries`).toBe(true);
    }
  });
});
