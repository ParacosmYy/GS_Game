/**
 * Animation Manifest 测试 — 数据完整性、帧时序、取消窗口、hitbox 引用
 *
 * 覆盖:
 * 1. 结构与完整性 (4 tests)
 * 2. 帧时序对齐 FRAME_DATA (4 tests)
 * 3. 取消窗口 (3 tests)
 * 4. 循环/非循环 (2 tests)
 * 5. Hitbox 引用 (2 tests)
 * 6. 无敌帧 (2 tests)
 * 7. 查询函数 (3 tests)
 */
import { describe, it, expect } from 'vitest';
import {
  getSequence,
  getSequenceNames,
  hasSequence,
  getSequenceFrameCount,
  getSequenceTotalDuration,
  getAnimCharacterIds,
  isCancelFrame,
  isInvincibleFrame,
  getActiveFrames,
  type AnimationManifest,
  type AnimSequence,
  type AnimFrame,
} from '../src/core/animationManifest.js';
import {
  ANIMATION_MANIFEST,
  REQUIRED_SEQUENCES,
} from '../src/core/animationManifestData.js';
import { FRAME_DATA } from '../src/core/frameDataConstants.js';

// ===== 常量 =====

const EXPECTED_CHARS = ['kyo', 'iori', 'ryo'];

// =====================================================================
// 1. 结构与完整性
// =====================================================================

describe('Structure and completeness', () => {
  it('manifest has version 1', () => {
    expect(ANIMATION_MANIFEST.version).toBe(1);
  });

  it('manifest contains exactly kyo, iori, ryo', () => {
    const ids = getAnimCharacterIds(ANIMATION_MANIFEST);
    expect(ids.sort()).toEqual(['iori', 'kyo', 'ryo']);
  });

  it('every character has all required sequences', () => {
    for (const charId of EXPECTED_CHARS) {
      for (const reqName of REQUIRED_SEQUENCES) {
        expect(
          hasSequence(ANIMATION_MANIFEST, charId, reqName),
          `${charId} missing required sequence "${reqName}"`,
        ).toBe(true);
      }
    }
  });

  it('every sequence has at least 1 frame', () => {
    for (const charId of EXPECTED_CHARS) {
      const names = getSequenceNames(ANIMATION_MANIFEST, charId);
      for (const name of names) {
        const seq = getSequence(ANIMATION_MANIFEST, charId, name);
        expect(seq!.frames.length, `${charId}/${name} has 0 frames`).toBeGreaterThanOrEqual(1);
      }
    }
  });
});

// =====================================================================
// 2. 帧时序对齐 FRAME_DATA
// =====================================================================

describe('Frame timing alignment with FRAME_DATA', () => {
  /** 攻击序列名称到 FRAME_DATA key 的映射 */
  const ATTACK_MAP: Record<string, string> = {
    stand_a: 'STAND_A',
    stand_b: 'STAND_B',
    stand_c: 'STAND_C',
    stand_d: 'STAND_D',
    crouch_a: 'CROUCH_A',
    crouch_b: 'CROUCH_B',
    crouch_c: 'CROUCH_C',
    crouch_d: 'CROUCH_D',
  };

  it('attack frame count equals startup+active+recovery for normal attacks', () => {
    for (const charId of EXPECTED_CHARS) {
      for (const [seqName, fdKey] of Object.entries(ATTACK_MAP)) {
        const seq = getSequence(ANIMATION_MANIFEST, charId, seqName);
        const fd = FRAME_DATA[fdKey as keyof typeof FRAME_DATA];
        if (!seq || !fd) continue;

        const expected = (fd as { startup: number; active: number; recovery: number }).startup
          + (fd as { startup: number; active: number; recovery: number }).active
          + (fd as { startup: number; active: number; recovery: number }).recovery;

        expect(
          seq.frames.length,
          `${charId}/${seqName}: expected ${expected} frames, got ${seq.frames.length}`,
        ).toBe(expected);
      }
    }
  });

  it('attack total duration equals startup+active+recovery (each frame=1 game frame)', () => {
    for (const charId of EXPECTED_CHARS) {
      for (const [seqName, fdKey] of Object.entries(ATTACK_MAP)) {
        const seq = getSequence(ANIMATION_MANIFEST, charId, seqName);
        const fd = FRAME_DATA[fdKey as keyof typeof FRAME_DATA];
        if (!seq || !fd) continue;

        const expected = (fd as { startup: number; active: number; recovery: number }).startup
          + (fd as { startup: number; active: number; recovery: number }).active
          + (fd as { startup: number; active: number; recovery: number }).recovery;

        const totalDur = getSequenceTotalDuration(ANIMATION_MANIFEST, charId, seqName);
        expect(
          totalDur,
          `${charId}/${seqName}: total duration ${totalDur} != expected ${expected}`,
        ).toBe(expected);
      }
    }
  });

  it('active frames have hitboxKey pointing to correct FRAME_DATA entry', () => {
    for (const charId of EXPECTED_CHARS) {
      const seq = getSequence(ANIMATION_MANIFEST, charId, 'stand_a');
      const fd = FRAME_DATA.STAND_A;
      const startup = (fd as { startup: number }).startup;
      const active = (fd as { active: number }).active;

      // startup frames should NOT have hitboxKey
      for (let i = 0; i < startup; i++) {
        expect(
          seq!.frames[i].hitboxKey,
          `${charId}/stand_a startup frame[${i}] should not have hitboxKey`,
        ).toBeUndefined();
      }

      // active frames should have hitboxKey = 'STAND_A'
      for (let i = startup; i < startup + active; i++) {
        expect(
          seq!.frames[i].hitboxKey,
          `${charId}/stand_a active frame[${i}] should have hitboxKey="STAND_A"`,
        ).toBe('STAND_A');
      }

      // recovery frames should NOT have hitboxKey
      for (let i = startup + active; i < seq!.frames.length; i++) {
        expect(
          seq!.frames[i].hitboxKey,
          `${charId}/stand_a recovery frame[${i}] should not have hitboxKey`,
        ).toBeUndefined();
      }
    }
  });

  it('getActiveFrames returns only active-phase frames with hitboxKey', () => {
    for (const charId of EXPECTED_CHARS) {
      const active = getActiveFrames(ANIMATION_MANIFEST, charId, 'stand_c');
      const fd = FRAME_DATA.STAND_C;
      const activeCount = (fd as { active: number }).active;
      expect(active.length, `${charId}/stand_c active frame count`).toBe(activeCount);
      for (const f of active) {
        expect(f.hitboxKey).toBe('STAND_C');
      }
    }
  });
});

// =====================================================================
// 3. 取消窗口
// =====================================================================

describe('Cancel window', () => {
  it('cancel frames fall within active/recovery range for normal attacks', () => {
    for (const charId of EXPECTED_CHARS) {
      const seq = getSequence(ANIMATION_MANIFEST, charId, 'stand_a');
      const fd = FRAME_DATA.STAND_A;
      const startup = (fd as { startup: number }).startup;

      // All cancel frames should be >= startup (never in startup phase)
      for (const cf of seq!.cancelFrames) {
        expect(
          cf,
          `${charId}/stand_a cancel frame ${cf} should be >= startup ${startup}`,
        ).toBeGreaterThanOrEqual(startup);
      }
    }
  });

  it('cancel frames do not exceed total frame count', () => {
    for (const charId of EXPECTED_CHARS) {
      const names = getSequenceNames(ANIMATION_MANIFEST, charId);
      for (const name of names) {
        const seq = getSequence(ANIMATION_MANIFEST, charId, name);
        if (!seq) continue;
        for (const cf of seq.cancelFrames) {
          expect(
            cf,
            `${charId}/${name} cancel frame ${cf} >= total ${seq.frames.length}`,
          ).toBeLessThan(seq.frames.length);
        }
      }
    }
  });

  it('non-attack loop sequences have empty cancel frames', () => {
    for (const charId of EXPECTED_CHARS) {
      const idle = getSequence(ANIMATION_MANIFEST, charId, 'idle');
      expect(idle!.cancelFrames).toEqual([]);

      const walk = getSequence(ANIMATION_MANIFEST, charId, 'walk_forward');
      expect(walk!.cancelFrames).toEqual([]);
    }
  });
});

// =====================================================================
// 4. 循环/非循环
// =====================================================================

describe('Loop behavior', () => {
  it('loop sequences (idle, walk) have at least 2 frames', () => {
    for (const charId of EXPECTED_CHARS) {
      for (const name of ['idle', 'walk_forward', 'walk_backward']) {
        const seq = getSequence(ANIMATION_MANIFEST, charId, name);
        expect(seq!.loop, `${charId}/${name} should loop`).toBe(true);
        expect(
          seq!.frames.length,
          `${charId}/${name} loop sequence should have >= 2 frames`,
        ).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('attack sequences do not loop', () => {
    for (const charId of EXPECTED_CHARS) {
      for (const name of ['stand_a', 'stand_c', 'crouch_b', 'crouch_d']) {
        const seq = getSequence(ANIMATION_MANIFEST, charId, name);
        expect(seq!.loop, `${charId}/${name} should NOT loop`).toBe(false);
      }
    }
  });
});

// =====================================================================
// 5. Hitbox 引用
// =====================================================================

describe('Hitbox references', () => {
  it('all hitboxKey values reference existing FRAME_DATA entries', () => {
    for (const charId of EXPECTED_CHARS) {
      const names = getSequenceNames(ANIMATION_MANIFEST, charId);
      for (const name of names) {
        const seq = getSequence(ANIMATION_MANIFEST, charId, name);
        if (!seq) continue;
        for (let i = 0; i < seq.frames.length; i++) {
          const key = seq.frames[i].hitboxKey;
          if (key !== undefined) {
            expect(
              key in FRAME_DATA,
              `${charId}/${name} frame[${i}].hitboxKey="${key}" not found in FRAME_DATA`,
            ).toBe(true);
          }
        }
      }
    }
  });

  it('getActiveFrames returns empty for non-attack sequences', () => {
    for (const charId of EXPECTED_CHARS) {
      expect(getActiveFrames(ANIMATION_MANIFEST, charId, 'idle')).toEqual([]);
      expect(getActiveFrames(ANIMATION_MANIFEST, charId, 'walk_forward')).toEqual([]);
      expect(getActiveFrames(ANIMATION_MANIFEST, charId, 'hitstun')).toEqual([]);
    }
  });
});

// =====================================================================
// 6. 无敌帧
// =====================================================================

describe('Invincibility frames', () => {
  it('upper attacks (oniyaki, ko_hou) have invincible startup frames', () => {
    // Kyo oniyaki
    const kyoOni = getSequence(ANIMATION_MANIFEST, 'kyo', 'oniyaki');
    expect(kyoOni!.invincibleFrames.length, 'kyo/oniyaki should have invincible frames').toBeGreaterThan(0);
    // All invincible frames should be in startup
    for (const fi of kyoOni!.invincibleFrames) {
      expect(fi).toBeLessThan(6); // startup=6
    }

    // Ryo ko_hou
    const ryoKo = getSequence(ANIMATION_MANIFEST, 'ryo', 'ko_hou');
    expect(ryoKo!.invincibleFrames.length, 'ryo/ko_hou should have invincible frames').toBeGreaterThan(0);
    for (const fi of ryoKo!.invincibleFrames) {
      expect(fi).toBeLessThan(5); // startup=5
    }
  });

  it('non-upper attack sequences have empty invincible frames', () => {
    for (const charId of EXPECTED_CHARS) {
      for (const name of ['stand_a', 'crouch_c', 'idle', 'walk_forward']) {
        const seq = getSequence(ANIMATION_MANIFEST, charId, name);
        expect(
          seq!.invincibleFrames,
          `${charId}/${name} should have no invincible frames`,
        ).toEqual([]);
      }
    }
  });
});

// =====================================================================
// 7. 查询函数
// =====================================================================

describe('Query functions', () => {
  it('getSequence returns correct sequence by name', () => {
    const seq = getSequence(ANIMATION_MANIFEST, 'kyo', 'idle');
    expect(seq).toBeDefined();
    expect(seq!.name).toBe('idle');
    expect(seq!.loop).toBe(true);
  });

  it('getSequence returns undefined for missing character or sequence', () => {
    expect(getSequence(ANIMATION_MANIFEST, 'nonexistent', 'idle')).toBeUndefined();
    expect(getSequence(ANIMATION_MANIFEST, 'kyo', 'nonexistent')).toBeUndefined();
  });

  it('getSequenceNames returns all expected sequence names for each character', () => {
    for (const charId of EXPECTED_CHARS) {
      const names = getSequenceNames(ANIMATION_MANIFEST, charId);
      // Should have at least all required sequences
      for (const req of REQUIRED_SEQUENCES) {
        expect(names, `${charId} should have sequence "${req}"`).toContain(req);
      }
    }
  });
});
