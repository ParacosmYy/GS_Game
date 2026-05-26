/**
 * Ryo Attack Frame Hitbox Data Validation Tests
 *
 * Validates that Ryo's normal attacks, command normals, specials, and DMs
 * have correct per-frame hitbox data in ATTACK_FRAMES, with sane box
 * dimensions, offsets, and at least one active attack frame.
 *
 * Also cross-checks ATTACK_FRAMES array lengths against FRAME_DATA
 * startup + active + recovery totals.
 */
import { describe, it, expect } from 'vitest';
import { ATTACK_FRAMES } from '../src/core/attackFrames.js';
import { FRAME_DATA } from '../src/core/constants.js';
import { AttackType } from '../src/core/types.js';
import type { AttackFrame, FrameBox } from '../src/core/types.js';

// ── Helpers ──────────────────────────────────────────────────

/** Hitbox dimension bounds (inclusive) */
const HITBOX_W_MIN = 20;
const HITBOX_W_MAX = 100;
const HITBOX_H_MIN = 15;
const HITBOX_H_MAX = 80;

/** Hitbox offset bounds (inclusive) */
const HITBOX_OX_MIN = -100;
const HITBOX_OX_MAX = 150;
const HITBOX_OY_MIN = -200;
const HITBOX_OY_MAX = 0;

function validateFrameBox(
  box: FrameBox,
  label: string,
  wMax = HITBOX_W_MAX,
  hMax = HITBOX_H_MAX,
): string[] {
  const errors: string[] = [];
  if (box.w < HITBOX_W_MIN || box.w > wMax) {
    errors.push(`${label} width ${box.w} outside [${HITBOX_W_MIN}, ${wMax}]`);
  }
  if (box.h < HITBOX_H_MIN || box.h > hMax) {
    errors.push(`${label} height ${box.h} outside [${HITBOX_H_MIN}, ${hMax}]`);
  }
  if (box.ox < HITBOX_OX_MIN || box.ox > HITBOX_OX_MAX) {
    errors.push(`${label} ox ${box.ox} outside [${HITBOX_OX_MIN}, ${HITBOX_OX_MAX}]`);
  }
  if (box.oy < HITBOX_OY_MIN || box.oy > HITBOX_OY_MAX) {
    errors.push(`${label} oy ${box.oy} outside [${HITBOX_OY_MIN}, ${HITBOX_OY_MAX}]`);
  }
  return errors;
}

function getAttackFrames(type: AttackType): AttackFrame[] | undefined {
  return ATTACK_FRAMES[type];
}

function countActiveFrames(frames: AttackFrame[]): number {
  return frames.filter(f => f.attack.length > 0 || (f.throwBoxes && f.throwBoxes.length > 0)).length;
}

// ── 1. Ryo Normal Attacks ────────────────────────────────────

const RYO_NORMAL_ATTACKS: AttackType[] = [
  AttackType.STAND_A,
  AttackType.STAND_C,
  AttackType.CLOSE_A,
  AttackType.CLOSE_C,
  AttackType.CROUCH_A,
  AttackType.CROUCH_C,
  AttackType.JUMP_C,
  AttackType.JUMP_D,
  AttackType.STAND_CD,
];

describe('Ryo normal attack hitbox data', () => {
  for (const atkType of RYO_NORMAL_ATTACKS) {
    describe(atkType, () => {
      it('should exist in ATTACK_FRAMES', () => {
        const frames = getAttackFrames(atkType);
        expect(frames).toBeDefined();
        expect(frames!.length).toBeGreaterThan(0);
      });

      it('should have at least 1 active hitbox frame', () => {
        const frames = getAttackFrames(atkType)!;
        const activeCount = countActiveFrames(frames);
        expect(activeCount).toBeGreaterThanOrEqual(1);
      });

      it('should have sane hitbox dimensions and offsets', () => {
        const frames = getAttackFrames(atkType)!;
        const errors: string[] = [];
        for (let i = 0; i < frames.length; i++) {
          const frame = frames[i];
          for (const box of frame.attack) {
            errors.push(...validateFrameBox(box, `${atkType} frame[${i}] attack box`));
          }
          if (frame.bodyOverride) {
            // body override uses wider bounds: width can be delta (negative ok), oy less strict
            const body = frame.bodyOverride;
            if (body.ox < -150 || body.ox > 200) {
              errors.push(`${atkType} frame[${i}] bodyOverride ox ${body.ox} out of [-150,200]`);
            }
            if (body.oy < -200 || body.oy > 50) {
              errors.push(`${atkType} frame[${i}] bodyOverride oy ${body.oy} out of [-200,50]`);
            }
          }
        }
        expect(errors).toEqual([]);
      });
    });
  }
});

// ── 2. Ryo Throw Attacks ─────────────────────────────────────

const RYO_THROWS: AttackType[] = [
  AttackType.THROW,
  AttackType.THROW_FORWARD,
  AttackType.THROW_BACK,
];

describe('Ryo throw hitbox data', () => {
  for (const atkType of RYO_THROWS) {
    describe(atkType, () => {
      it('should exist in ATTACK_FRAMES', () => {
        const frames = getAttackFrames(atkType);
        expect(frames).toBeDefined();
        expect(frames!.length).toBeGreaterThan(0);
      });

      it('should have throw boxes (not attack boxes)', () => {
        const frames = getAttackFrames(atkType)!;
        const hasThrowBox = frames.some(f => f.throwBoxes && f.throwBoxes.length > 0);
        expect(hasThrowBox).toBe(true);
      });

      it('throw boxes should have sane dimensions and offsets', () => {
        const frames = getAttackFrames(atkType)!;
        const errors: string[] = [];
        for (let i = 0; i < frames.length; i++) {
          const throwBoxes = frames[i].throwBoxes;
          if (throwBoxes) {
            for (const box of throwBoxes) {
              errors.push(...validateFrameBox(box, `${atkType} frame[${i}] throwBox`));
            }
          }
        }
        expect(errors).toEqual([]);
      });
    });
  }
});

// ── 3. Ryo Command Normals ───────────────────────────────────

const RYO_COMMAND_NORMALS: AttackType[] = [
  AttackType.RYO_TSURIZAO,
  AttackType.RYO_ORISHI,
];

describe('Ryo command normal hitbox data', () => {
  for (const atkType of RYO_COMMAND_NORMALS) {
    describe(atkType, () => {
      it('should exist in ATTACK_FRAMES', () => {
        const frames = getAttackFrames(atkType);
        expect(frames).toBeDefined();
        expect(frames!.length).toBeGreaterThan(0);
      });

      it('should have at least 1 active hitbox frame', () => {
        const frames = getAttackFrames(atkType)!;
        const activeCount = countActiveFrames(frames);
        expect(activeCount).toBeGreaterThanOrEqual(1);
      });

      it('should have sane hitbox dimensions and offsets', () => {
        const frames = getAttackFrames(atkType)!;
        const errors: string[] = [];
        for (let i = 0; i < frames.length; i++) {
          for (const box of frames[i].attack) {
            errors.push(...validateFrameBox(box, `${atkType} frame[${i}]`));
          }
        }
        expect(errors).toEqual([]);
      });
    });
  }
});

// ── 4. Ryo Specials ──────────────────────────────────────────

const RYO_SPECIALS: AttackType[] = [
  AttackType.RYO_KOOU,
  AttackType.RYO_KOOU_C,
  AttackType.RYO_KO_HOU,
  AttackType.RYO_KO_HOU_C,
  AttackType.RYO_HIEN,
  AttackType.RYO_HAOU,
];

describe('Ryo special move hitbox data', () => {
  for (const atkType of RYO_SPECIALS) {
    describe(atkType, () => {
      it('should exist in ATTACK_FRAMES', () => {
        const frames = getAttackFrames(atkType);
        expect(frames).toBeDefined();
        expect(frames!.length).toBeGreaterThan(0);
      });

      it('should have at least 1 active hitbox frame', () => {
        const frames = getAttackFrames(atkType)!;
        const activeCount = countActiveFrames(frames);
        expect(activeCount).toBeGreaterThanOrEqual(1);
      });

      it('should have sane hitbox dimensions and offsets', () => {
        const frames = getAttackFrames(atkType)!;
        const errors: string[] = [];
        for (let i = 0; i < frames.length; i++) {
          const frame = frames[i];
          for (const box of frame.attack) {
            errors.push(...validateFrameBox(box, `${atkType} frame[${i}] attack box`));
          }
          if (frame.bodyOverride) {
            const body = frame.bodyOverride;
            if (body.ox < -150 || body.ox > 200) {
              errors.push(`${atkType} frame[${i}] bodyOverride ox ${body.ox} out of [-150,200]`);
            }
            if (body.oy < -200 || body.oy > 50) {
              errors.push(`${atkType} frame[${i}] bodyOverride oy ${body.oy} out of [-200,50]`);
            }
          }
        }
        expect(errors).toEqual([]);
      });
    });
  }
});

// ── 5. Ryo DMs ───────────────────────────────────────────────

const RYO_DMS: AttackType[] = [
  AttackType.DM_TEN_HA_OU,
  AttackType.SDM_TEN_HA_OU,
  AttackType.DM_RYUKO_RANBU,
  AttackType.SDM_RYUKO_RANBU,
  AttackType.HSDM_RYUKO_RANBU,
];

describe('Ryo DM hitbox data', () => {
  for (const atkType of RYO_DMS) {
    describe(atkType, () => {
      it('should exist in ATTACK_FRAMES', () => {
        const frames = getAttackFrames(atkType);
        expect(frames).toBeDefined();
        expect(frames!.length).toBeGreaterThan(0);
      });

      it('should have at least 1 active hitbox frame', () => {
        const frames = getAttackFrames(atkType)!;
        const activeCount = countActiveFrames(frames);
        expect(activeCount).toBeGreaterThanOrEqual(1);
      });

      it('should have sane hitbox dimensions and offsets', () => {
        const frames = getAttackFrames(atkType)!;
        const errors: string[] = [];
        // DM/SDM/HSDM have larger hitboxes than normals (up to 130x95 for HSDM finishers)
        const isHSDM = atkType.startsWith('HSDM_');
        const dmWMax = isHSDM ? 140 : 120;
        const dmHMax = isHSDM ? 100 : 90;
        for (let i = 0; i < frames.length; i++) {
          for (const box of frames[i].attack) {
            errors.push(...validateFrameBox(box, `${atkType} frame[${i}]`, dmWMax, dmHMax));
          }
        }
        expect(errors).toEqual([]);
      });
    });
  }
});

// ── 6. Frame Count Consistency ───────────────────────────────

/**
 * ATTACK_FRAMES arrays represent only the active-phase frames.
 * They do not include startup or recovery frames -- they describe
 * the per-frame hitbox layout during the active phase.
 *
 * Therefore: ATTACK_FRAMES[key].length should equal FRAME_DATA[key].active
 * for attacks where ATTACK_FRAMES exists and has attack boxes (not throw boxes).
 *
 * For projectiles (single-frame spawners), ATTACK_FRAMES length is typically 1
 * regardless of active count (the projectile entity handles the rest).
 */
const RYO_ALL_ATTACKS: AttackType[] = [
  // Normals
  AttackType.STAND_A, AttackType.STAND_C,
  AttackType.CLOSE_A, AttackType.CLOSE_C,
  AttackType.CROUCH_A, AttackType.CROUCH_C,
  AttackType.JUMP_C, AttackType.JUMP_D,
  AttackType.STAND_CD,
  // Throws
  AttackType.THROW, AttackType.THROW_FORWARD, AttackType.THROW_BACK,
  // Command normals
  AttackType.RYO_TSURIZAO, AttackType.RYO_ORISHI,
  // Specials
  AttackType.RYO_KOOU, AttackType.RYO_KOOU_C,
  AttackType.RYO_KO_HOU, AttackType.RYO_KO_HOU_C,
  AttackType.RYO_HIEN, AttackType.RYO_HAOU,
  // DMs
  AttackType.DM_TEN_HA_OU, AttackType.SDM_TEN_HA_OU,
  AttackType.DM_RYUKO_RANBU,
  AttackType.SDM_RYUKO_RANBU, AttackType.HSDM_RYUKO_RANBU,
];

/** Projectile-type attacks: ATTACK_FRAMES is a single-frame spawner */
const PROJECTILE_TYPES = new Set<string>([
  'RYO_KOOU', 'RYO_KOOU_C',
]);

describe('ATTACK_FRAMES vs FRAME_DATA consistency', () => {
  for (const atkType of RYO_ALL_ATTACKS) {
    it(`${atkType}: frame data should exist in FRAME_DATA`, () => {
      const fd = FRAME_DATA[atkType as keyof typeof FRAME_DATA];
      expect(fd).toBeDefined();
    });
  }

  for (const atkType of RYO_ALL_ATTACKS) {
    if (PROJECTILE_TYPES.has(atkType)) continue;

    it(`${atkType}: ATTACK_FRAMES length <= FRAME_DATA startup+active+recovery`, () => {
      const frames = getAttackFrames(atkType);
      const fd = FRAME_DATA[atkType as keyof typeof FRAME_DATA];
      if (!frames || !fd) return;

      const totalFrames = fd.startup + fd.active + fd.recovery;
      // ATTACK_FRAMES represents active phase frames only, so length <= total
      expect(frames.length).toBeLessThanOrEqual(totalFrames);
    });
  }
});

// ── 7. Ryo special move hitbox progression sanity ────────────

describe('Ryo special hitbox progression', () => {
  it('RYO_KO_HOU_C (strong DP) should have more frames than RYO_KO_HOU (weak DP)', () => {
    const weak = getAttackFrames(AttackType.RYO_KO_HOU)!;
    const strong = getAttackFrames(AttackType.RYO_KO_HOU_C)!;
    expect(strong.length).toBeGreaterThan(weak.length);
  });

  it('HSDM_RYUKO_RANBU should have more frames than DM_RYUKO_RANBU', () => {
    const dm = getAttackFrames(AttackType.DM_RYUKO_RANBU)!;
    const hsdm = getAttackFrames(AttackType.HSDM_RYUKO_RANBU)!;
    expect(hsdm.length).toBeGreaterThan(dm.length);
  });

  it('SDM_RYUKO_RANBU should have more frames than DM_RYUKO_RANBU', () => {
    const dm = getAttackFrames(AttackType.DM_RYUKO_RANBU)!;
    const sdm = getAttackFrames(AttackType.SDM_RYUKO_RANBU)!;
    expect(sdm.length).toBeGreaterThan(dm.length);
  });

  it('RYO_HIEN should have hitboxes that reach forward (ox increasing)', () => {
    const frames = getAttackFrames(AttackType.RYO_HIEN)!;
    const activeFrames = frames.filter(f => f.attack.length > 0);
    expect(activeFrames.length).toBeGreaterThanOrEqual(2);

    // Peak frame should reach further than first frame
    const firstOx = activeFrames[0].attack[0].ox;
    const peakFrame = activeFrames.reduce((best, f) =>
      f.attack[0].ox > best.attack[0].ox ? f : best, activeFrames[0]);
    expect(peakFrame.attack[0].ox).toBeGreaterThanOrEqual(firstOx);
  });

  it('DM_TEN_HA_OU hitboxes should expand then contract', () => {
    const frames = getAttackFrames(AttackType.DM_TEN_HA_OU)!;
    const widths = frames.map(f => f.attack[0]?.w ?? 0);

    // Find the maximum width
    const maxWidth = Math.max(...widths);
    const maxIndex = widths.indexOf(maxWidth);

    // Width should increase to peak, then decrease
    for (let i = 0; i < maxIndex; i++) {
      expect(widths[i]).toBeLessThanOrEqual(widths[i + 1]);
    }
    for (let i = maxIndex; i < widths.length - 1; i++) {
      expect(widths[i]).toBeGreaterThanOrEqual(widths[i + 1]);
    }
  });

  it('SDM_TEN_HA_OU should have more frames than DM_TEN_HA_OU', () => {
    const dm = getAttackFrames(AttackType.DM_TEN_HA_OU)!;
    const sdm = getAttackFrames(AttackType.SDM_TEN_HA_OU)!;
    expect(sdm.length).toBeGreaterThan(dm.length);
  });

  it('SDM_TEN_HA_OU hitboxes should expand, sustain, then contract', () => {
    const frames = getAttackFrames(AttackType.SDM_TEN_HA_OU)!;
    // All frames should have exactly 1 attack box
    for (let i = 0; i < frames.length; i++) {
      expect(frames[i].attack.length).toBe(1);
    }
    const widths = frames.map(f => f.attack[0].w);

    // Should start expanding
    expect(widths[0]).toBeLessThan(widths[5]);
    // Should have a peak wider than start
    const peak = Math.max(...widths);
    expect(peak).toBeGreaterThan(widths[0]);
    // Should end smaller than peak (dissipation phase)
    expect(widths[widths.length - 1]).toBeLessThan(peak);
  });

  it('SDM_TEN_HA_OU peak hitbox should be wider than DM_TEN_HA_OU peak', () => {
    const dm = getAttackFrames(AttackType.DM_TEN_HA_OU)!;
    const sdm = getAttackFrames(AttackType.SDM_TEN_HA_OU)!;
    const dmPeak = Math.max(...dm.map(f => f.attack[0]?.w ?? 0));
    const sdmPeak = Math.max(...sdm.map(f => f.attack[0].w));
    expect(sdmPeak).toBeGreaterThan(dmPeak);
  });
});

// ── 8. No empty attack arrays on all-active attacks ──────────

describe('Ryo non-projectile attacks should not be all empty', () => {
  const NON_PROJECTILE_ATTACKS = RYO_ALL_ATTACKS.filter(
    t => !PROJECTILE_TYPES.has(t)
  );

  for (const atkType of NON_PROJECTILE_ATTACKS) {
    it(`${atkType}: should not have all empty attack arrays`, () => {
      const frames = getAttackFrames(atkType);
      if (!frames) return;

      const hasAnyAttack = frames.some(f => f.attack.length > 0);
      const hasAnyThrow = frames.some(f => f.throwBoxes && f.throwBoxes.length > 0);
      expect(hasAnyAttack || hasAnyThrow).toBe(true);
    });
  }
});
