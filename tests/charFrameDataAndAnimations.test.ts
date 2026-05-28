/**
 * Character Frame Data & Animation Meta Structural Tests
 *
 * Validates Kyo/Iori/Ryo per-character frame data records
 * and Kyo/Iori animation metadata tables.
 */
import { describe, it, expect } from 'vitest';
import { KYO_FRAME_DATA } from '../src/content/characters/kyo/frameData/kyoFrameData.js';
import { IORI_FRAME_DATA } from '../src/content/characters/iori/frameData/ioriFrameData.js';
import { RYO_FRAME_DATA } from '../src/content/characters/ryo/frameData/ryoFrameData.js';
import {
  KYO_ANIMATION_META, getKyoAnimationNames, getKyoAnimMeta,
  getKyoAttackAnimations, getKyoLoopAnimations,
} from '../src/content/characters/kyo/animations/kyoAnimations.js';
import {
  IORI_ANIMATION_META, getIoriAnimationNames, getIoriAnimMeta,
  getIoriAttackAnimations, getIoriLoopAnimations,
} from '../src/content/characters/iori/animations/ioriAnimations.js';

// ===== Shared validators =====

interface FrameDataEntry {
  startup: number;
  active: number;
  recovery: number;
  damage: number;
  hitstun: number;
  blockstun: number;
  pushback: number;
  hitLevel: string;
  knockdown: boolean;
  chipDamage?: number;
}

function validateFrameDataEntry(entry: FrameDataEntry, label: string) {
  expect(entry.startup, `${label}.startup >= 0`).toBeGreaterThanOrEqual(0);
  expect(entry.active, `${label}.active >= 0`).toBeGreaterThan(0);
  expect(entry.recovery, `${label}.recovery >= 0`).toBeGreaterThanOrEqual(0);
  expect(entry.damage, `${label}.damage > 0`).toBeGreaterThan(0);
  expect(entry.hitstun, `${label}.hitstun >= 0`).toBeGreaterThanOrEqual(0);
  expect(entry.blockstun, `${label}.blockstun >= 0`).toBeGreaterThanOrEqual(0);
  expect(entry.pushback, `${label}.pushback >= 0`).toBeGreaterThanOrEqual(0);
  expect(['MID', 'LOW', 'HIGH'], `${label}.hitLevel`).toContain(entry.hitLevel);
  expect(typeof entry.knockdown, `${label}.knockdown type`).toBe('boolean');
  if (entry.chipDamage !== undefined) {
    expect(entry.chipDamage, `${label}.chipDamage >= 0`).toBeGreaterThanOrEqual(0);
  }
}

function validateAnimMeta(meta: { name: string; type: string; totalFrames: number; ticksPerFrame: number; loop: boolean; transition: string; description: string }, label: string) {
  expect(meta.name, `${label}.name`).toBeTruthy();
  expect(['loop', 'once', 'attack'], `${label}.type`).toContain(meta.type);
  expect(meta.totalFrames, `${label}.totalFrames > 0`).toBeGreaterThan(0);
  expect(meta.ticksPerFrame, `${label}.ticksPerFrame > 0`).toBeGreaterThan(0);
  expect(typeof meta.loop, `${label}.loop type`).toBe('boolean');
  expect(['snap', 'ease_in', 'ease_out', 'blend'], `${label}.transition`).toContain(meta.transition);
  expect(meta.description.length, `${label}.description length`).toBeGreaterThan(0);
}

// ===== KYO_FRAME_DATA =====

describe('KYO_FRAME_DATA', () => {
  const keys = Object.keys(KYO_FRAME_DATA);

  it('has entries', () => {
    expect(keys.length).toBeGreaterThan(10);
  });

  it('all entries have valid frame data', () => {
    for (const [key, entry] of Object.entries(KYO_FRAME_DATA)) {
      validateFrameDataEntry(entry as FrameDataEntry, `KYO.${key}`);
    }
  });

  it('startup + active + recovery > 0 for all entries', () => {
    for (const [key, entry] of Object.entries(KYO_FRAME_DATA)) {
      const e = entry as FrameDataEntry;
      expect(e.startup + e.active + e.recovery, `KYO.${key} total`).toBeGreaterThan(0);
    }
  });

  it('covers yamibarai', () => {
    expect(KYO_FRAME_DATA.KYO_YAMIBARAI).toBeDefined();
    expect(KYO_FRAME_DATA.KYO_YAMIBARAI_C).toBeDefined();
  });

  it('covers oniyaki', () => {
    expect(KYO_FRAME_DATA.KYO_ONIYAKI).toBeDefined();
    expect(KYO_FRAME_DATA.KYO_ONIYAKI_C).toBeDefined();
  });

  it('covers aragami chain', () => {
    expect(KYO_FRAME_DATA.KYO_ARAGAMI).toBeDefined();
    expect(KYO_FRAME_DATA.KYO_ARAGAMI_KONOKIZU).toBeDefined();
    expect(KYO_FRAME_DATA.KYO_ARAGAMI_YANOSABI).toBeDefined();
  });

  it('covers dokugami chain', () => {
    expect(KYO_FRAME_DATA.KYO_DOKUGAMI).toBeDefined();
    expect(KYO_FRAME_DATA.KYO_TSUMIYOMI).toBeDefined();
    expect(KYO_FRAME_DATA.KYO_BATSUYOMI).toBeDefined();
  });

  it('covers DM/SDM/HSDM', () => {
    expect(KYO_FRAME_DATA.DM_OROCHINAGI).toBeDefined();
    expect(KYO_FRAME_DATA.SDM_OROCHINAGI).toBeDefined();
    expect(KYO_FRAME_DATA.HSDM_OROCHINAGI).toBeDefined();
  });

  it('DM < SDM < HSDM damage progression for orochinagi', () => {
    expect(KYO_FRAME_DATA.DM_OROCHINAGI.damage).toBeLessThan(KYO_FRAME_DATA.SDM_OROCHINAGI.damage);
    expect(KYO_FRAME_DATA.SDM_OROCHINAGI.damage).toBeLessThan(KYO_FRAME_DATA.HSDM_OROCHINAGI.damage);
  });

  it('C versions deal more damage than A versions', () => {
    expect(KYO_FRAME_DATA.KYO_ONIYAKI_C.damage).toBeGreaterThan(KYO_FRAME_DATA.KYO_ONIYAKI.damage);
    expect(KYO_FRAME_DATA.KYO_YAMIBARAI_C.damage).toBeGreaterThan(KYO_FRAME_DATA.KYO_YAMIBARAI.damage);
  });

  it('command normals exist', () => {
    expect(KYO_FRAME_DATA.CMD_GOFU_YOU).toBeDefined();
    expect(KYO_FRAME_DATA.CMD_88SHIKI).toBeDefined();
    expect(KYO_FRAME_DATA.CMD_NARAKU).toBeDefined();
  });
});

// ===== IORI_FRAME_DATA =====

describe('IORI_FRAME_DATA', () => {
  const keys = Object.keys(IORI_FRAME_DATA);

  it('has entries', () => {
    expect(keys.length).toBeGreaterThan(10);
  });

  it('all entries have valid frame data', () => {
    for (const [key, entry] of Object.entries(IORI_FRAME_DATA)) {
      validateFrameDataEntry(entry as FrameDataEntry, `IORI.${key}`);
    }
  });

  it('covers aoihana chain (A)', () => {
    expect(IORI_FRAME_DATA.IORI_AOIHANA).toBeDefined();
    expect(IORI_FRAME_DATA.IORI_AOIHANA_2).toBeDefined();
    expect(IORI_FRAME_DATA.IORI_AOIHANA_3).toBeDefined();
  });

  it('covers aoihana chain (C)', () => {
    expect(IORI_FRAME_DATA.IORI_AOIHANA_C).toBeDefined();
    expect(IORI_FRAME_DATA.IORI_AOIHANA_C_2).toBeDefined();
    expect(IORI_FRAME_DATA.IORI_AOIHANA_C_3).toBeDefined();
  });

  it('covers yamibarai', () => {
    expect(IORI_FRAME_DATA.IORI_YAMIBARAI).toBeDefined();
    expect(IORI_FRAME_DATA.IORI_YAMIBARAI_C).toBeDefined();
  });

  it('covers oniyaki', () => {
    expect(IORI_FRAME_DATA.IORI_ONIYAKI).toBeDefined();
    expect(IORI_FRAME_DATA.IORI_ONIYAKI_C).toBeDefined();
  });

  it('covers kuzukaze', () => {
    expect(IORI_FRAME_DATA.IORI_KUZUKAZE).toBeDefined();
  });

  it('covers DM/SDM/HSDM', () => {
    expect(IORI_FRAME_DATA.DM_YATAGARASU).toBeDefined();
    expect(IORI_FRAME_DATA.SDM_YATAGARASU).toBeDefined();
    expect(IORI_FRAME_DATA.HSDM_YAOTOME).toBeDefined();
  });

  it('DM < SDM damage progression for yatagarasu', () => {
    expect(IORI_FRAME_DATA.DM_YATAGARASU.damage).toBeLessThan(IORI_FRAME_DATA.SDM_YATAGARASU.damage);
  });

  it('C versions deal more damage than A versions', () => {
    expect(IORI_FRAME_DATA.IORI_ONIYAKI_C.damage).toBeGreaterThan(IORI_FRAME_DATA.IORI_ONIYAKI.damage);
    expect(IORI_FRAME_DATA.IORI_YAMIBARAI_C.damage).toBeGreaterThan(IORI_FRAME_DATA.IORI_YAMIBARAI.damage);
  });

  it('command normals exist', () => {
    expect(IORI_FRAME_DATA.IORI_YUMEYUMI).toBeDefined();
    expect(IORI_FRAME_DATA.IORI_KATANUGI).toBeDefined();
    expect(IORI_FRAME_DATA.IORI_YUKIWARUI).toBeDefined();
  });
});

// ===== RYO_FRAME_DATA =====

describe('RYO_FRAME_DATA', () => {
  const keys = Object.keys(RYO_FRAME_DATA);

  it('has entries', () => {
    expect(keys.length).toBeGreaterThan(10);
  });

  it('all entries have valid frame data', () => {
    for (const [key, entry] of Object.entries(RYO_FRAME_DATA)) {
      validateFrameDataEntry(entry as FrameDataEntry, `RYO.${key}`);
    }
  });

  it('covers koouken', () => {
    expect(RYO_FRAME_DATA.RYO_KOOU).toBeDefined();
    expect(RYO_FRAME_DATA.RYO_KOOU_C).toBeDefined();
    expect(RYO_FRAME_DATA.RYO_KOOUKEN_D).toBeDefined();
  });

  it('covers kohou', () => {
    expect(RYO_FRAME_DATA.RYO_KO_HOU).toBeDefined();
    expect(RYO_FRAME_DATA.RYO_KO_HOU_C).toBeDefined();
  });

  it('covers hien', () => {
    expect(RYO_FRAME_DATA.RYO_HIEN).toBeDefined();
  });

  it('covers DM/SDM/HSDM', () => {
    expect(RYO_FRAME_DATA.DM_TEN_HA_OU).toBeDefined();
    expect(RYO_FRAME_DATA.DM_RYUKO_RANBU).toBeDefined();
    expect(RYO_FRAME_DATA.SDM_RYUKO_RANBU).toBeDefined();
    expect(RYO_FRAME_DATA.HSDM_RYUKO_RANBU).toBeDefined();
  });

  it('DM < SDM < HSDM damage for ryuko ranbu', () => {
    expect(RYO_FRAME_DATA.DM_RYUKO_RANBU.damage).toBeLessThan(RYO_FRAME_DATA.SDM_RYUKO_RANBU.damage);
    expect(RYO_FRAME_DATA.SDM_RYUKO_RANBU.damage).toBeLessThan(RYO_FRAME_DATA.HSDM_RYUKO_RANBU.damage);
  });

  it('C versions deal more damage than A versions', () => {
    expect(RYO_FRAME_DATA.RYO_KOOU_C.damage).toBeGreaterThan(RYO_FRAME_DATA.RYO_KOOU.damage);
    expect(RYO_FRAME_DATA.RYO_KO_HOU_C.damage).toBeGreaterThan(RYO_FRAME_DATA.RYO_KO_HOU.damage);
  });

  it('command normals exist', () => {
    expect(RYO_FRAME_DATA.RYO_TSURIZAO).toBeDefined();
    expect(RYO_FRAME_DATA.RYO_ORISHI).toBeDefined();
  });

  it('koouken D is heaviest', () => {
    expect(RYO_FRAME_DATA.RYO_KOOUKEN_D.damage).toBeGreaterThan(RYO_FRAME_DATA.RYO_KOOU_C.damage);
  });
});

// ===== KYO_ANIMATION_META =====

describe('KYO_ANIMATION_META', () => {
  const keys = Object.keys(KYO_ANIMATION_META);

  it('has many entries', () => {
    expect(keys.length).toBeGreaterThan(30);
  });

  it('all entries have valid structure', () => {
    for (const [key, meta] of Object.entries(KYO_ANIMATION_META)) {
      validateAnimMeta(meta, `KYO_ANIM.${key}`);
    }
  });

  it('has core actions', () => {
    expect(KYO_ANIMATION_META.idle).toBeDefined();
    expect(KYO_ANIMATION_META.walk_forward).toBeDefined();
    expect(KYO_ANIMATION_META.jump_forward).toBeDefined();
    expect(KYO_ANIMATION_META.stand_a).toBeDefined();
    expect(KYO_ANIMATION_META.crouch_a).toBeDefined();
  });

  it('loop type matches loop flag', () => {
    for (const [key, meta] of Object.entries(KYO_ANIMATION_META)) {
      if (meta.type === 'loop') {
        expect(meta.loop, `${key} loop should be true`).toBe(true);
      }
    }
  });

  it('attack type implies not looping', () => {
    for (const [key, meta] of Object.entries(KYO_ANIMATION_META)) {
      if (meta.type === 'attack') {
        expect(meta.loop, `${key} attack should not loop`).toBe(false);
      }
    }
  });

  it('name matches key', () => {
    for (const [key, meta] of Object.entries(KYO_ANIMATION_META)) {
      expect(meta.name, `${key} name`).toBe(key);
    }
  });
});

describe('Kyo animation helpers', () => {
  it('getKyoAnimationNames returns array', () => {
    const names = getKyoAnimationNames();
    expect(names.length).toBeGreaterThan(30);
    expect(names).toContain('idle');
  });

  it('getKyoAnimMeta returns meta for known action', () => {
    const meta = getKyoAnimMeta('idle');
    expect(meta).toBeDefined();
    expect(meta!.type).toBe('loop');
  });

  it('getKyoAnimMeta returns undefined for unknown', () => {
    expect(getKyoAnimMeta('nonexistent')).toBeUndefined();
  });

  it('getKyoAttackAnimations returns only attacks', () => {
    const attacks = getKyoAttackAnimations();
    expect(attacks.length).toBeGreaterThan(10);
    for (const a of attacks) {
      expect(a.type).toBe('attack');
    }
  });

  it('getKyoLoopAnimations returns only loops', () => {
    const loops = getKyoLoopAnimations();
    expect(loops.length).toBeGreaterThan(0);
    for (const l of loops) {
      expect(l.loop).toBe(true);
    }
  });
});

// ===== IORI_ANIMATION_META =====

describe('IORI_ANIMATION_META', () => {
  const keys = Object.keys(IORI_ANIMATION_META);

  it('has many entries', () => {
    expect(keys.length).toBeGreaterThan(30);
  });

  it('all entries have valid structure', () => {
    for (const [key, meta] of Object.entries(IORI_ANIMATION_META)) {
      validateAnimMeta(meta, `IORI_ANIM.${key}`);
    }
  });

  it('has core actions', () => {
    expect(IORI_ANIMATION_META.idle).toBeDefined();
    expect(IORI_ANIMATION_META.walk_forward).toBeDefined();
    expect(IORI_ANIMATION_META.jump_forward).toBeDefined();
    expect(IORI_ANIMATION_META.stand_a).toBeDefined();
    expect(IORI_ANIMATION_META.crouch_a).toBeDefined();
  });

  it('loop type matches loop flag', () => {
    for (const [key, meta] of Object.entries(IORI_ANIMATION_META)) {
      if (meta.type === 'loop') {
        expect(meta.loop, `${key} loop should be true`).toBe(true);
      }
    }
  });

  it('attack type implies not looping', () => {
    for (const [key, meta] of Object.entries(IORI_ANIMATION_META)) {
      if (meta.type === 'attack') {
        expect(meta.loop, `${key} attack should not loop`).toBe(false);
      }
    }
  });

  it('name matches key', () => {
    for (const [key, meta] of Object.entries(IORI_ANIMATION_META)) {
      expect(meta.name, `${key} name`).toBe(key);
    }
  });

  it('covers aoihana chain', () => {
    expect(IORI_ANIMATION_META.iori_aoihana).toBeDefined();
    expect(IORI_ANIMATION_META.iori_aoihana_2).toBeDefined();
    expect(IORI_ANIMATION_META.iori_aoihana_3).toBeDefined();
  });
});

describe('Iori animation helpers', () => {
  it('getIoriAnimationNames returns array', () => {
    const names = getIoriAnimationNames();
    expect(names.length).toBeGreaterThan(30);
    expect(names).toContain('idle');
  });

  it('getIoriAnimMeta returns meta for known action', () => {
    const meta = getIoriAnimMeta('idle');
    expect(meta).toBeDefined();
    expect(meta!.type).toBe('loop');
  });

  it('getIoriAnimMeta returns undefined for unknown', () => {
    expect(getIoriAnimMeta('nonexistent')).toBeUndefined();
  });

  it('getIoriAttackAnimations returns only attacks', () => {
    const attacks = getIoriAttackAnimations();
    expect(attacks.length).toBeGreaterThan(10);
    for (const a of attacks) {
      expect(a.type).toBe('attack');
    }
  });

  it('getIoriLoopAnimations returns only loops', () => {
    const loops = getIoriLoopAnimations();
    expect(loops.length).toBeGreaterThan(0);
    for (const l of loops) {
      expect(l.loop).toBe(true);
    }
  });
});

// ===== Cross-character frame data consistency =====

describe('Cross-character frame data consistency', () => {
  it('all three characters have frame data', () => {
    expect(Object.keys(KYO_FRAME_DATA).length).toBeGreaterThan(10);
    expect(Object.keys(IORI_FRAME_DATA).length).toBeGreaterThan(10);
    expect(Object.keys(RYO_FRAME_DATA).length).toBeGreaterThan(10);
  });

  it('all three characters have animation meta', () => {
    expect(Object.keys(KYO_ANIMATION_META).length).toBeGreaterThan(30);
    expect(Object.keys(IORI_ANIMATION_META).length).toBeGreaterThan(30);
  });

  it('both have shared action names', () => {
    const shared = ['idle', 'walk_forward', 'jump_forward', 'stand_a', 'crouch_a', 'knockdown'];
    for (const action of shared) {
      expect(KYO_ANIMATION_META[action], `KYO has ${action}`).toBeDefined();
      expect(IORI_ANIMATION_META[action], `IORI has ${action}`).toBeDefined();
    }
  });
});
