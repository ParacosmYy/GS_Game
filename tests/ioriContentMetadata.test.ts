/**
 * Iori Content Package Metadata Regression Tests
 *
 * Validates Iori animation metadata and feedback tier summary.
 */
import { describe, it, expect } from 'vitest';
import {
  IORI_ANIMATION_META, getIoriAnimationNames, getIoriAnimMeta,
  getIoriAttackAnimations, getIoriLoopAnimations,
  type AnimationMeta,
} from '../src/content/characters/iori/animations/ioriAnimations.js';
import {
  IORI_FEEDBACK_SUMMARY, getIoriFeedbackTiers, getIoriFeedback,
} from '../src/content/characters/iori/feedback/ioriFeedback.js';

describe('Iori Animation Metadata', () => {
  const allEntries = Object.entries(IORI_ANIMATION_META);
  const VALID_TYPES: AnimationMeta['type'][] = ['loop', 'once', 'attack'];
  const VALID_TRANSITIONS: AnimationMeta['transition'][] = ['snap', 'ease_in', 'ease_out', 'blend'];

  it('has at least 35 animation entries', () => {
    expect(allEntries.length).toBeGreaterThanOrEqual(35);
  });

  it('all entries have valid structure', () => {
    for (const [key, meta] of allEntries) {
      expect(meta.name, `${key}.name`).toBe(key);
      expect(VALID_TYPES, `${key}.type`).toContain(meta.type);
      expect(meta.totalFrames, `${key}.totalFrames`).toBeGreaterThan(0);
      expect(meta.ticksPerFrame, `${key}.ticksPerFrame`).toBeGreaterThan(0);
      expect(typeof meta.loop, `${key}.loop`).toBe('boolean');
      expect(VALID_TRANSITIONS, `${key}.transition`).toContain(meta.transition);
      expect(meta.description.length, `${key}.description`).toBeGreaterThan(0);
    }
  });

  it('loop animations have loop=true', () => {
    const loops = allEntries.filter(([, m]) => m.type === 'loop');
    for (const [key, m] of loops) {
      expect(m.loop, `${key}.loop`).toBe(true);
    }
  });

  it('attack animations have loop=false', () => {
    const attacks = allEntries.filter(([, m]) => m.type === 'attack');
    for (const [key, m] of attacks) {
      expect(m.loop, `${key}.loop`).toBe(false);
    }
  });

  it('has key movement animations', () => {
    const names = getIoriAnimationNames();
    expect(names).toContain('idle');
    expect(names).toContain('walk_forward');
    expect(names).toContain('run');
    expect(names).toContain('jump_up');
    expect(names).toContain('crouch');
    expect(names).toContain('block');
  });

  it('has all standing normals', () => {
    const names = getIoriAnimationNames();
    expect(names).toContain('stand_a');
    expect(names).toContain('stand_b');
    expect(names).toContain('stand_c');
    expect(names).toContain('stand_d');
  });

  it('has Iori-specific specials', () => {
    const names = getIoriAnimationNames();
    expect(names).toContain('iori_oniyaki');
    expect(names).toContain('iori_yamibarai');
    expect(names).toContain('iori_aoihana');
    expect(names).toContain('iori_aoihana_2');
    expect(names).toContain('iori_aoihana_3');
    expect(names).toContain('iori_kuzukaze');
    expect(names).toContain('iori_kototsuki');
  });

  it('has aoihana C chain', () => {
    const names = getIoriAnimationNames();
    expect(names).toContain('iori_aoihana_c');
    expect(names).toContain('iori_aoihana_c_2');
    expect(names).toContain('iori_aoihana_c_3');
  });

  it('has DM/SDM/HSDM', () => {
    const names = getIoriAnimationNames();
    expect(names).toContain('dm_yaotome');
    expect(names).toContain('sdm_yaotome');
    expect(names).toContain('hsdm_yaotome');
  });

  it('has command normals', () => {
    const names = getIoriAnimationNames();
    expect(names).toContain('iori_yumeyumi');
    expect(names).toContain('iori_katanugi');
    expect(names).toContain('iori_yukiwarui');
  });

  it('getIoriAnimMeta returns correct entry', () => {
    const idle = getIoriAnimMeta('idle');
    expect(idle).toBeDefined();
    expect(idle!.type).toBe('loop');
  });

  it('getIoriAnimMeta returns undefined for unknown', () => {
    expect(getIoriAnimMeta('nonexistent')).toBeUndefined();
  });

  it('getIoriAttackAnimations returns only attacks', () => {
    const attacks = getIoriAttackAnimations();
    expect(attacks.length).toBeGreaterThan(0);
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

  it('oniyaki C has more frames than oniyaki A', () => {
    const a = IORI_ANIMATION_META.iori_oniyaki;
    const c = IORI_ANIMATION_META.iori_oniyaki_c;
    expect(c.totalFrames).toBeGreaterThan(a.totalFrames);
  });

  it('yamibarai C has more frames than yamibarai A', () => {
    const a = IORI_ANIMATION_META.iori_yamibarai;
    const c = IORI_ANIMATION_META.iori_yamibarai_c;
    expect(c.totalFrames).toBeGreaterThan(a.totalFrames);
  });

  it('SDM has more frames than DM', () => {
    const dm = IORI_ANIMATION_META.dm_yaotome;
    const sdm = IORI_ANIMATION_META.sdm_yaotome;
    expect(sdm.totalFrames).toBeGreaterThan(dm.totalFrames);
  });

  it('HSDM has most frames', () => {
    const dm = IORI_ANIMATION_META.dm_yaotome;
    const hsdm = IORI_ANIMATION_META.hsdm_yaotome;
    expect(hsdm.totalFrames).toBeGreaterThan(dm.totalFrames);
  });

  it('aoihana chain has 3 stages for A and C', () => {
    const a1 = IORI_ANIMATION_META.iori_aoihana;
    const a2 = IORI_ANIMATION_META.iori_aoihana_2;
    const a3 = IORI_ANIMATION_META.iori_aoihana_3;
    expect(a1).toBeDefined();
    expect(a2).toBeDefined();
    expect(a3).toBeDefined();
  });
});

describe('Iori Feedback Tier Summary', () => {
  const TIERS = ['light', 'heavy', 'special', 'dm', 'sdm', 'hsdm'] as const;

  it('all 6 tiers have entries', () => {
    for (const tier of TIERS) {
      expect(IORI_FEEDBACK_SUMMARY[tier].length, `${tier} has entries`).toBeGreaterThan(0);
    }
  });

  it('no overlapping attack types between tiers', () => {
    const allTypes: string[] = [];
    for (const tier of TIERS) {
      allTypes.push(...IORI_FEEDBACK_SUMMARY[tier]);
    }
    expect(new Set(allTypes).size).toBe(allTypes.length);
  });

  it('light tier has stand_a and crouch_a', () => {
    expect(IORI_FEEDBACK_SUMMARY.light).toContain('STAND_A');
    expect(IORI_FEEDBACK_SUMMARY.light).toContain('CROUCH_A');
  });

  it('heavy tier has stand_c and stand_d', () => {
    expect(IORI_FEEDBACK_SUMMARY.heavy).toContain('STAND_C');
    expect(IORI_FEEDBACK_SUMMARY.heavy).toContain('STAND_D');
  });

  it('special tier has iori moves', () => {
    expect(IORI_FEEDBACK_SUMMARY.special).toContain('IORI_ONIYAKI');
    expect(IORI_FEEDBACK_SUMMARY.special).toContain('IORI_YAMIBARAI');
    expect(IORI_FEEDBACK_SUMMARY.special).toContain('IORI_KUZUKAZE');
    expect(IORI_FEEDBACK_SUMMARY.special).toContain('IORI_AOIHANA');
  });

  it('dm tier has DM_YATAGARASU', () => {
    expect(IORI_FEEDBACK_SUMMARY.dm).toContain('DM_YATAGARASU');
  });

  it('hsdm tier has HSDM_YAOTOME', () => {
    expect(IORI_FEEDBACK_SUMMARY.hsdm).toContain('HSDM_YAOTOME');
  });

  it('getIoriFeedbackTiers covers attack keys', () => {
    const tiers = getIoriFeedbackTiers();
    expect(Object.keys(tiers).length).toBeGreaterThan(0);
  });

  it('getIoriFeedback returns valid params', () => {
    const fb = getIoriFeedback('STAND_A');
    expect(fb.tier).toBe('light');
    expect(fb.hitstop).toBeGreaterThan(0);
  });

  it('special tier includes all aoihana stages', () => {
    const special = IORI_FEEDBACK_SUMMARY.special;
    expect(special).toContain('IORI_AOIHANA');
    expect(special).toContain('IORI_AOIHANA_2');
    expect(special).toContain('IORI_AOIHANA_3');
    expect(special).toContain('IORI_AOIHANA_C');
    expect(special).toContain('IORI_AOIHANA_C_2');
    expect(special).toContain('IORI_AOIHANA_C_3');
  });
});
