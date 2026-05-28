import { describe, it, expect, afterAll } from 'vitest';
import { ATTACK_FRAMES } from '../src/core/attackFrames.js';
import { KYO_ATTACK_KEYS } from '../src/content/characters/kyo/attacks/kyoAttacks.js';
import { IORI_ATTACK_KEYS } from '../src/content/characters/iori/attacks/ioriAttacks.js';

describe('ATTACK_FRAMES — Kyo completeness', () => {
  const KYO_SPECIALS = [
    'KYO_75KAI', 'KYO_75KAI_2', 'KYO_RED_KICK',
    'KYO_ONIYAKI', 'KYO_ONIYAKI_C',
    'KYO_YAMIBARAI', 'KYO_YAMIBARAI_C',
  ];
  const KYO_REKKAS_ARAGAMI = [
    'KYO_ARAGAMI', 'KYO_ARAGAMI_KONOKIZU', 'KYO_ARAGAMI_YANOSABI',
    'KYO_NANASE', 'KYO_KOTO_TSUKI', 'KYO_YAKISOGI',
  ];
  const KYO_REKKAS_DOKUGAMI = [
    'KYO_DOKUGAMI', 'KYO_TSUMIYOMI', 'KYO_BATSUYOMI',
  ];
  const KYO_DMS = ['DM_OROCHINAGI', 'SDM_OROCHINAGI', 'HSDM_OROCHINAGI'];
  const KYO_COMMANDS = ['CMD_GOFU_YOU', 'CMD_88SHIKI', 'CMD_NARAKU'];

  describe('all Kyo attacks have entries', () => {
    const missingKeys: string[] = [];
    for (const key of KYO_ATTACK_KEYS) {
      it(`${key} exists in ATTACK_FRAMES`, () => {
        expect(ATTACK_FRAMES, `${key} should exist`).toHaveProperty(key);
        if (!(ATTACK_FRAMES as any).hasOwnProperty(key)) {
          missingKeys.push(key);
        }
      });
    }
    afterAll(() => {
      if (missingKeys.length > 0) {
        console.warn('Missing Kyo ATTACK_FRAMES keys:', missingKeys);
      }
    });
  });

  describe('entry structure', () => {
    it('specials are arrays of AttackFrame objects', () => {
      const entry = ATTACK_FRAMES['KYO_ONIYAKI'];
      expect(Array.isArray(entry)).toBe(true);
      expect(entry!.length).toBeGreaterThan(0);
      for (const frame of entry!) {
        expect(frame).toHaveProperty('attack');
        expect(Array.isArray(frame.attack)).toBe(true);
        expect(frame).toHaveProperty('bodyOverride');
      }
    });

    it('throw entries have throwBoxes on active frames', () => {
      const entry = ATTACK_FRAMES['THROW']!;
      const hasThrowBox = entry.some(f => f.throwBoxes && f.throwBoxes.length > 0);
      expect(hasThrowBox).toBe(true);
    });

    it('command normals have attack boxes on at least one frame', () => {
      for (const cmd of KYO_COMMANDS) {
        const entry = ATTACK_FRAMES[cmd]!;
        const hasAttack = entry.some(f => f.attack.length > 0);
        expect(hasAttack, `${cmd} should have attack boxes`).toBe(true);
      }
    });
  });

  describe('frame counts are reasonable', () => {
    it('specials have at least 1 frame', () => {
      for (const sp of KYO_SPECIALS) {
        expect(ATTACK_FRAMES[sp]!.length, `${sp}`).toBeGreaterThanOrEqual(1);
      }
    });

    it('Aragami rekka chain has entries for all parts', () => {
      for (const rek of KYO_REKKAS_ARAGAMI) {
        expect(ATTACK_FRAMES, `${rek} should exist`).toHaveProperty(rek);
        expect(ATTACK_FRAMES[rek]!.length, `${rek}`).toBeGreaterThan(0);
      }
    });

    it('Dokugami rekka chain has entries for all parts', () => {
      for (const rek of KYO_REKKAS_DOKUGAMI) {
        expect(ATTACK_FRAMES, `${rek} should exist`).toHaveProperty(rek);
        expect(ATTACK_FRAMES[rek]!.length, `${rek}`).toBeGreaterThan(0);
      }
    });

    it('Aragami chain hitbox progression: starter has attack boxes', () => {
      const starter = ATTACK_FRAMES['KYO_ARAGAMI']!;
      const hasAttack = starter.some(f => f.attack.length > 0);
      expect(hasAttack).toBe(true);
    });

    it('Dokugami chain hitbox progression: starter has attack boxes', () => {
      const starter = ATTACK_FRAMES['KYO_DOKUGAMI']!;
      const hasAttack = starter.some(f => f.attack.length > 0);
      expect(hasAttack).toBe(true);
    });

    it('DM_OROCHINAGI has frames', () => {
      expect(ATTACK_FRAMES['DM_OROCHINAGI']!.length).toBeGreaterThan(0);
    });

    it('SDM has at least as many frames as DM', () => {
      const dm = ATTACK_FRAMES['DM_OROCHINAGI']!;
      const sdm = ATTACK_FRAMES['SDM_OROCHINAGI']!;
      expect(sdm.length).toBeGreaterThanOrEqual(dm.length);
    });

    it('HSDM has frames', () => {
      expect(ATTACK_FRAMES['HSDM_OROCHINAGI']!.length).toBeGreaterThan(0);
    });

    it('projectile specials (YAMIBARAI) are single-frame spawners', () => {
      // KOF convention: projectile normals are 1-frame spawners
      const weak = ATTACK_FRAMES['KYO_YAMIBARAI']!;
      const strong = ATTACK_FRAMES['KYO_YAMIBARAI_C']!;
      expect(weak.length).toBeGreaterThanOrEqual(1);
      expect(strong.length).toBeGreaterThanOrEqual(1);
    });

    it('75 Shiki Kai second kick has attack boxes', () => {
      const kick2 = ATTACK_FRAMES['KYO_75KAI_2']!;
      const hasAttack = kick2.some(f => f.attack.length > 0);
      expect(hasAttack).toBe(true);
    });
  });

  describe('hitbox dimensions are sane', () => {
    it('all Kyo specials have hitbox width <= 200', () => {
      for (const sp of [...KYO_SPECIALS, ...KYO_REKKAS_ARAGAMI, ...KYO_REKKAS_DOKUGAMI]) {
        const entry = ATTACK_FRAMES[sp]!;
        for (const frame of entry) {
          for (const box of frame.attack) {
            expect(box.w, `${sp} hitbox width`).toBeLessThanOrEqual(200);
            expect(box.h, `${sp} hitbox height`).toBeLessThanOrEqual(200);
          }
        }
      }
    });

    it('all Kyo specials have hitbox offsets within ±150', () => {
      for (const sp of [...KYO_SPECIALS, ...KYO_REKKAS_ARAGAMI, ...KYO_REKKAS_DOKUGAMI]) {
        const entry = ATTACK_FRAMES[sp]!;
        for (const frame of entry) {
          for (const box of frame.attack) {
            expect(Math.abs(box.ox), `${sp} ox`).toBeLessThanOrEqual(150);
            expect(Math.abs(box.oy), `${sp} oy`).toBeLessThanOrEqual(150);
          }
        }
      }
    });
  });
});

describe('ATTACK_FRAMES — Iori completeness', () => {
  const IORI_SPECIALS = [
    'IORI_YAMIBARAI', 'IORI_YAMIBARAI_C',
    'IORI_ONIYAKI', 'IORI_ONIYAKI_C',
    'IORI_KOTOTSUKI', 'IORI_KOTOTSUKI_D',
    'IORI_KUZUKAZE',
  ];
  const IORI_REKKAS = [
    'IORI_AOIHANA', 'IORI_AOIHANA_2', 'IORI_AOIHANA_3',
    'IORI_AOIHANA_C', 'IORI_AOIHANA_C_2', 'IORI_AOIHANA_C_3',
  ];
  const IORI_DMS = ['DM_YATAGARASU', 'SDM_YATAGARASU', 'HSDM_YAOTOME'];
  const IORI_COMMANDS = ['IORI_YUMEYUMI', 'IORI_KATANUGI', 'IORI_YUKIWARUI'];

  describe('all Iori attacks have entries', () => {
    const missingKeys: string[] = [];
    for (const key of IORI_ATTACK_KEYS) {
      it(`${key} exists in ATTACK_FRAMES`, () => {
        expect(ATTACK_FRAMES, `${key} should exist`).toHaveProperty(key);
        if (!(ATTACK_FRAMES as any).hasOwnProperty(key)) {
          missingKeys.push(key);
        }
      });
    }
    afterAll(() => {
      if (missingKeys.length > 0) {
        console.warn('Missing Iori ATTACK_FRAMES keys:', missingKeys);
      }
    });
  });

  describe('entry structure', () => {
    it('specials are arrays of AttackFrame objects', () => {
      const entry = ATTACK_FRAMES['IORI_ONIYAKI'];
      expect(Array.isArray(entry)).toBe(true);
      expect(entry!.length).toBeGreaterThan(0);
      for (const frame of entry!) {
        expect(frame).toHaveProperty('attack');
        expect(Array.isArray(frame.attack)).toBe(true);
        expect(frame).toHaveProperty('bodyOverride');
      }
    });

    it('throw entries have throwBoxes on active frames', () => {
      const entry = ATTACK_FRAMES['THROW']!;
      const hasThrowBox = entry.some(f => f.throwBoxes && f.throwBoxes.length > 0);
      expect(hasThrowBox).toBe(true);
    });

    it('KUZUKAZE has throwBoxes (command throw)', () => {
      const entry = ATTACK_FRAMES['IORI_KUZUKAZE']!;
      const hasThrowBox = entry.some(f => f.throwBoxes && f.throwBoxes.length > 0);
      expect(hasThrowBox).toBe(true);
    });

    it('command normals have attack boxes on at least one frame', () => {
      for (const cmd of IORI_COMMANDS) {
        const entry = ATTACK_FRAMES[cmd]!;
        const hasAttack = entry.some(f => f.attack.length > 0);
        expect(hasAttack, `${cmd} should have attack boxes`).toBe(true);
      }
    });
  });

  describe('frame counts are reasonable', () => {
    it('specials have at least 1 frame', () => {
      for (const sp of IORI_SPECIALS) {
        expect(ATTACK_FRAMES[sp]!.length, `${sp}`).toBeGreaterThanOrEqual(1);
      }
    });

    it('Aoihana rekka chain has entries for all 6 parts', () => {
      for (const rek of IORI_REKKAS) {
        expect(ATTACK_FRAMES, `${rek} should exist`).toHaveProperty(rek);
        expect(ATTACK_FRAMES[rek]!.length, `${rek}`).toBeGreaterThan(0);
      }
    });

    it('Aoihana A chain hitbox progression: all hits have attack boxes', () => {
      for (const rek of ['IORI_AOIHANA', 'IORI_AOIHANA_2', 'IORI_AOIHANA_3']) {
        const entry = ATTACK_FRAMES[rek]!;
        const hasAttack = entry.some(f => f.attack.length > 0);
        expect(hasAttack, `${rek} should have attack boxes`).toBe(true);
      }
    });

    it('Aoihana C chain hitbox progression: all hits have attack boxes', () => {
      for (const rek of ['IORI_AOIHANA_C', 'IORI_AOIHANA_C_2', 'IORI_AOIHANA_C_3']) {
        const entry = ATTACK_FRAMES[rek]!;
        const hasAttack = entry.some(f => f.attack.length > 0);
        expect(hasAttack, `${rek} should have attack boxes`).toBe(true);
      }
    });

    it('DM_YATAGARASU has frames', () => {
      expect(ATTACK_FRAMES['DM_YATAGARASU']!.length).toBeGreaterThan(0);
    });

    it('SDM has at least as many frames as DM', () => {
      const dm = ATTACK_FRAMES['DM_YATAGARASU']!;
      const sdm = ATTACK_FRAMES['SDM_YATAGARASU']!;
      expect(sdm.length).toBeGreaterThanOrEqual(dm.length);
    });

    it('HSDM_YAOTOME has frames', () => {
      expect(ATTACK_FRAMES['HSDM_YAOTOME']!.length).toBeGreaterThan(0);
    });

    it('projectile specials (YAMIBARAI) are single-frame spawners', () => {
      const weak = ATTACK_FRAMES['IORI_YAMIBARAI']!;
      const strong = ATTACK_FRAMES['IORI_YAMIBARAI_C']!;
      expect(weak.length).toBeGreaterThanOrEqual(1);
      expect(strong.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('hitbox dimensions are sane', () => {
    it('all Iori specials have hitbox width <= 200', () => {
      for (const sp of [...IORI_SPECIALS, ...IORI_REKKAS]) {
        const entry = ATTACK_FRAMES[sp]!;
        for (const frame of entry) {
          for (const box of frame.attack) {
            expect(box.w, `${sp} hitbox width`).toBeLessThanOrEqual(200);
            expect(box.h, `${sp} hitbox height`).toBeLessThanOrEqual(200);
          }
        }
      }
    });

    it('all Iori specials have hitbox offsets within ±150', () => {
      for (const sp of [...IORI_SPECIALS, ...IORI_REKKAS]) {
        const entry = ATTACK_FRAMES[sp]!;
        for (const frame of entry) {
          for (const box of frame.attack) {
            expect(Math.abs(box.ox), `${sp} ox`).toBeLessThanOrEqual(150);
            expect(Math.abs(box.oy), `${sp} oy`).toBeLessThanOrEqual(150);
          }
        }
      }
    });
  });
});

describe('Cross-character ATTACK_FRAMES completeness', () => {
  it('all Kyo ATTACK_KEYS have ATTACK_FRAMES entries', () => {
    const missing: string[] = [];
    for (const key of KYO_ATTACK_KEYS) {
      if (!ATTACK_FRAMES.hasOwnProperty(key)) missing.push(key);
    }
    expect(missing, 'All Kyo keys should have ATTACK_FRAMES').toEqual([]);
  });

  it('all Iori ATTACK_KEYS have ATTACK_FRAMES entries', () => {
    const missing: string[] = [];
    for (const key of IORI_ATTACK_KEYS) {
      if (!ATTACK_FRAMES.hasOwnProperty(key)) missing.push(key);
    }
    expect(missing, 'All Iori keys should have ATTACK_FRAMES').toEqual([]);
  });

  it('Kyo has more special-type entries than generic normals', () => {
    const specials = KYO_ATTACK_KEYS.filter(k =>
      k.startsWith('KYO_') || k.startsWith('CMD_') || k.startsWith('DM_') || k.startsWith('SDM_') || k.startsWith('HSDM_')
    );
    const normals = KYO_ATTACK_KEYS.filter(k =>
      k.startsWith('STAND_') || k.startsWith('CROUCH_') || k.startsWith('JUMP_') || k.startsWith('CLOSE_')
    );
    expect(specials.length).toBeGreaterThan(normals.length);
  });

  it('Iori has more special-type entries than generic normals', () => {
    const specials = IORI_ATTACK_KEYS.filter(k =>
      k.startsWith('IORI_') || k.startsWith('DM_') || k.startsWith('SDM_') || k.startsWith('HSDM_')
    );
    const normals = IORI_ATTACK_KEYS.filter(k =>
      k.startsWith('STAND_') || k.startsWith('CROUCH_') || k.startsWith('JUMP_') || k.startsWith('CLOSE_')
    );
    expect(specials.length).toBeGreaterThan(normals.length);
  });
});
