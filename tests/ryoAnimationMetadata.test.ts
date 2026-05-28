/**
 * Ryo Animation Metadata Regression Tests
 *
 * Validates Ryo animation metadata structure and completeness.
 */
import { describe, it, expect } from 'vitest';
import {
  RYO_ANIMATION_META, getRyoAnimationNames, getRyoAnimMeta,
  getRyoAttackAnimations, getRyoLoopAnimations,
  type AnimationMeta,
} from '../src/content/characters/ryo/animations/ryoAnimations.js';

describe('Ryo Animation Metadata', () => {
  const allEntries = Object.entries(RYO_ANIMATION_META);
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
    const names = getRyoAnimationNames();
    expect(names).toContain('idle');
    expect(names).toContain('walk_forward');
    expect(names).toContain('run');
    expect(names).toContain('jump_up');
    expect(names).toContain('crouch');
    expect(names).toContain('block');
  });

  it('has all standing normals', () => {
    const names = getRyoAnimationNames();
    expect(names).toContain('stand_a');
    expect(names).toContain('stand_b');
    expect(names).toContain('stand_c');
    expect(names).toContain('stand_d');
  });

  it('has all crouch normals', () => {
    const names = getRyoAnimationNames();
    expect(names).toContain('crouch_a');
    expect(names).toContain('crouch_b');
    expect(names).toContain('crouch_c');
    expect(names).toContain('crouch_d');
  });

  it('has Ryo-specific specials', () => {
    const names = getRyoAnimationNames();
    expect(names).toContain('ryo_koou');
    expect(names).toContain('ryo_koou_c');
    expect(names).toContain('ryo_ko_hou');
    expect(names).toContain('ryo_ko_hou_c');
    expect(names).toContain('ryo_hien');
  });

  it('has DM/SDM/HSDM', () => {
    const names = getRyoAnimationNames();
    expect(names).toContain('dm_ten_ha_ou');
    expect(names).toContain('dm_ryuko_ranbu');
    expect(names).toContain('sdm_ryuko_ranbu');
    expect(names).toContain('hsdm_ryuko_ranbu');
  });

  it('getRyoAnimMeta returns correct entry', () => {
    const idle = getRyoAnimMeta('idle');
    expect(idle).toBeDefined();
    expect(idle!.type).toBe('loop');
  });

  it('getRyoAnimMeta returns undefined for unknown', () => {
    expect(getRyoAnimMeta('nonexistent')).toBeUndefined();
  });

  it('getRyoAttackAnimations returns only attacks', () => {
    const attacks = getRyoAttackAnimations();
    expect(attacks.length).toBeGreaterThan(0);
    for (const a of attacks) {
      expect(a.type).toBe('attack');
    }
  });

  it('getRyoLoopAnimations returns only loops', () => {
    const loops = getRyoLoopAnimations();
    expect(loops.length).toBeGreaterThan(0);
    for (const l of loops) {
      expect(l.loop).toBe(true);
    }
  });

  it('C versions have more frames than A versions', () => {
    const koouA = RYO_ANIMATION_META.ryo_koou;
    const koouC = RYO_ANIMATION_META.ryo_koou_c;
    expect(koouC.totalFrames).toBeGreaterThanOrEqual(koouA.totalFrames);

    const houA = RYO_ANIMATION_META.ryo_ko_hou;
    const houC = RYO_ANIMATION_META.ryo_ko_hou_c;
    expect(houC.totalFrames).toBeGreaterThan(houA.totalFrames);
  });

  it('heavy attacks have more frames than light', () => {
    const standA = RYO_ANIMATION_META.stand_a;
    const standC = RYO_ANIMATION_META.stand_c;
    expect(standC.totalFrames).toBeGreaterThan(standA.totalFrames);
  });

  it('specials have more frames than normals', () => {
    const standC = RYO_ANIMATION_META.stand_c;
    const koou = RYO_ANIMATION_META.ryo_koou;
    expect(koou.totalFrames).toBeGreaterThan(standC.totalFrames);
  });

  it('DM has more frames than most specials', () => {
    const koou = RYO_ANIMATION_META.ryo_koou;
    const dm = RYO_ANIMATION_META.dm_ten_ha_ou;
    expect(dm.totalFrames).toBeGreaterThanOrEqual(koou.totalFrames);
  });

  it('has state animations', () => {
    const names = getRyoAnimationNames();
    expect(names).toContain('hitstun');
    expect(names).toContain('blockstun');
    expect(names).toContain('knockdown');
    expect(names).toContain('dizzy');
    expect(names).toContain('wakeup');
    expect(names).toContain('guard_crush');
  });

  it('has system animations', () => {
    const names = getRyoAnimationNames();
    expect(names).toContain('win');
    expect(names).toContain('taunt');
    expect(names).toContain('max_mode');
  });
});
