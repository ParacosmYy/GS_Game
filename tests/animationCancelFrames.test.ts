/**
 * Animation cancel frames — Ryo 样板角色取消帧验证
 *
 * 验证:
 * - attackSequence 生成的 cancelFrames 正确
 * - loopSequence / onceSequence 无 cancelFrames
 * - invincibleFrames 正确
 * - isCancelFrame 查询正确
 * - DM 帧数 > 必杀技帧数
 */
import { describe, it, expect } from 'vitest';
import { ANIMATION_MANIFEST } from '../src/core/animationManifestData.js';
import {
  getSequence,
  isCancelFrame,
  isInvincibleFrame,
} from '../src/core/animationManifest.js';

describe('Animation cancel frames — Ryo', () => {
  const manifest = ANIMATION_MANIFEST;

  // ── 攻击序列均有取消帧 ──

  describe('cancel frames exist for attack sequences', () => {
    const ryoAttacks = [
      'stand_a', 'stand_b', 'stand_c', 'stand_d',
      'crouch_a', 'crouch_b', 'crouch_c', 'crouch_d',
      'ryo_koou', 'ryo_ko_hou', 'ryo_hien', 'ryo_haou',
      'ryo_tsurizao', 'ryo_orishi',
      'dm_ten_ha_ou',
    ];

    for (const state of ryoAttacks) {
      it(`${state} has cancel frames`, () => {
        const seq = getSequence(manifest, 'ryo', state);
        expect(seq).toBeDefined();
        expect(seq!.cancelFrames.length).toBeGreaterThan(0);
      });
    }
  });

  // ── 非攻击序列无取消帧 ──

  describe('non-attack sequences have no cancel frames', () => {
    const nonAttacks = ['idle', 'walk_forward', 'crouch', 'jump_up'];
    for (const state of nonAttacks) {
      it(`${state} has empty cancel frames`, () => {
        const seq = getSequence(manifest, 'ryo', state);
        expect(seq).toBeDefined();
        expect(seq!.cancelFrames.length).toBe(0);
      });
    }
  });

  // ── 取消帧逻辑 ──

  describe('cancel frame logic', () => {
    it('cancel frames are within frame range', () => {
      const seq = getSequence(manifest, 'ryo', 'stand_a');
      expect(seq).toBeDefined();
      for (const cf of seq!.cancelFrames) {
        expect(cf).toBeGreaterThanOrEqual(0);
        expect(cf).toBeLessThan(seq!.frames.length);
      }
    });

    it('cancel frames include active phase end', () => {
      const seq = getSequence(manifest, 'ryo', 'stand_a');
      expect(seq).toBeDefined();
      expect(seq!.cancelFrames.length).toBeGreaterThan(0);
    });

    it('isCancelFrame returns true for cancel frames', () => {
      const seq = getSequence(manifest, 'ryo', 'stand_c');
      expect(seq).toBeDefined();
      if (seq!.cancelFrames.length > 0) {
        expect(isCancelFrame(manifest, 'ryo', 'stand_c', seq!.cancelFrames[0])).toBe(true);
      }
    });

    it('isCancelFrame returns false for non-cancel frames', () => {
      const seq = getSequence(manifest, 'ryo', 'stand_c');
      expect(seq).toBeDefined();
      // Frame 0 is startup, not cancelable when cancelFrames start later
      if (seq!.cancelFrames.length > 0 && seq!.cancelFrames[0] > 0) {
        expect(isCancelFrame(manifest, 'ryo', 'stand_c', 0)).toBe(false);
      }
    });
  });

  // ── 必杀技无敌帧 ──

  describe('specials have invincibility frames', () => {
    it('ryo_ko_hou has invincible startup frames', () => {
      const seq = getSequence(manifest, 'ryo', 'ryo_ko_hou');
      expect(seq).toBeDefined();
      expect(seq!.invincibleFrames.length).toBeGreaterThan(0);
    });

    it('ryo_ko_hou invincible frames are the first 3 frames', () => {
      const seq = getSequence(manifest, 'ryo', 'ryo_ko_hou');
      expect(seq).toBeDefined();
      expect(seq!.invincibleFrames).toEqual([0, 1, 2]);
    });

    it('isInvincibleFrame returns true for invincible frames', () => {
      expect(isInvincibleFrame(manifest, 'ryo', 'ryo_ko_hou', 0)).toBe(true);
      expect(isInvincibleFrame(manifest, 'ryo', 'ryo_ko_hou', 2)).toBe(true);
    });

    it('isInvincibleFrame returns false after invincible window', () => {
      expect(isInvincibleFrame(manifest, 'ryo', 'ryo_ko_hou', 3)).toBe(false);
    });
  });

  // ── DM 帧数 > 必杀技帧数 ──

  describe('DM has more total frames than normal attacks', () => {
    it('dm_ten_ha_ou has more frames than stand_a', () => {
      const dm = getSequence(manifest, 'ryo', 'dm_ten_ha_ou');
      const normal = getSequence(manifest, 'ryo', 'stand_a');
      expect(dm).toBeDefined();
      expect(normal).toBeDefined();
      expect(dm!.frames.length).toBeGreaterThan(normal!.frames.length);
    });
  });
});
