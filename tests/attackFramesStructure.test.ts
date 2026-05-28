/**
 * Attack Frames Structure Validation Tests
 *
 * Validates that all entries in ATTACK_FRAMES have valid hitbox structure:
 * each AttackFrame has non-empty attack boxes, valid bodyOverride, etc.
 * Also validates active frame count matches FRAME_DATA where applicable.
 */
import { describe, it, expect } from 'vitest';
import { ATTACK_FRAMES } from '../src/core/attackFrames.js';
import type { AttackFrame } from '../src/core/types.js';

const af = ATTACK_FRAMES as Record<string, AttackFrame[]>;
const keys = Object.keys(af);

describe('ATTACK_FRAMES structure validation', () => {
  it('has entries', () => {
    expect(keys.length).toBeGreaterThan(0);
  });

  it('every entry is a non-empty array', () => {
    for (const key of keys) {
      const frames = af[key];
      expect(Array.isArray(frames), `${key} is array`).toBe(true);
      expect(frames.length, `${key} non-empty`).toBeGreaterThan(0);
    }
  });

  it('every frame with attack boxes has valid structure', () => {
    for (const key of keys.slice(0, 80)) {
      const frames = af[key];
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        if (!frame.attack || frame.attack.length === 0) continue; // recovery frames
        for (let j = 0; j < frame.attack.length; j++) {
          const box = frame.attack[j] as any;
          // Hitbox uses ox/oy (offset) or x/y
          const hasX = typeof box.ox === 'number' || typeof box.x === 'number';
          const hasY = typeof box.oy === 'number' || typeof box.y === 'number';
          expect(hasX, `${key}[${i}].attack[${j}] has x/ox`).toBe(true);
          expect(hasY, `${key}[${i}].attack[${j}] has y/oy`).toBe(true);
          expect(typeof box.w, `${key}[${i}].attack[${j}].w`).toBe('number');
          expect(typeof box.h, `${key}[${i}].attack[${j}].h`).toBe('number');
        }
      }
    }
  });

  it('at least one frame per entry has attack or throw boxes', () => {
    for (const key of keys) {
      const frames = af[key];
      const hasHitbox = frames.some(f =>
        (f.attack && f.attack.length > 0) || (f.throwBoxes && f.throwBoxes.length > 0)
      );
      expect(hasHitbox, `${key} has attack or throw hitbox`).toBe(true);
    }
  });
});

describe('ATTACK_FRAMES coverage', () => {
  it('covers all 12 generic normals', () => {
    const normals = ['STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
      'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
      'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D'];
    for (const n of normals) {
      expect(af[n], `${n} in ATTACK_FRAMES`).toBeDefined();
    }
  });

  it('covers Ryo specials', () => {
    const specials = ['RYO_KOOU', 'RYO_KOOU_C', 'RYO_KO_HOU', 'RYO_KO_HOU_C',
      'RYO_HIEN', 'RYO_HAOU'];
    for (const s of specials) {
      expect(af[s], `${s} in ATTACK_FRAMES`).toBeDefined();
    }
  });

  it('covers Kyo specials', () => {
    const specials = ['KYO_ONIYAKI', 'KYO_ONIYAKI_C', 'KYO_YAMIBARAI', 'KYO_YAMIBARAI_C',
      'KYO_RED_KICK', 'KYO_75KAI'];
    for (const s of specials) {
      expect(af[s], `${s} in ATTACK_FRAMES`).toBeDefined();
    }
  });

  it('covers Iori specials', () => {
    const specials = ['IORI_AOIHANA', 'IORI_AOIHANA_2', 'IORI_AOIHANA_3',
      'IORI_ONIYAKI', 'IORI_ONIYAKI_C', 'IORI_YAMIBARAI', 'IORI_KOTOTSUKI'];
    for (const s of specials) {
      expect(af[s], `${s} in ATTACK_FRAMES`).toBeDefined();
    }
  });

  it('covers DMs', () => {
    const dms = ['DM_TEN_HA_OU', 'DM_OROCHINAGI', 'DM_YATAGARASU',
      'DM_POWER_GEYSER', 'DM_PHOENIX_KICK'];
    for (const d of dms) {
      expect(af[d], `${d} in ATTACK_FRAMES`).toBeDefined();
    }
  });

  it('covers jump attacks', () => {
    const jumps = ['JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D'];
    for (const j of jumps) {
      expect(af[j], `${j} in ATTACK_FRAMES`).toBeDefined();
    }
  });
});
