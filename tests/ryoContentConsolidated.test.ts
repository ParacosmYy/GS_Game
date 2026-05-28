/**
 * Ryo Content Package Consolidated Tests
 *
 * Merged from: ryoCommands, ryoAttacks, ryoHitboxes, ryoAnimations, ryoMovementExt
 *
 * Covers: Ryo move list, attack keys, hitbox offsets, animation sequences,
 *   extended movement frames.
 */
import { describe, it, expect } from 'vitest';
import { RYO_MOVE_LIST, RYO_WIN_QUOTES } from '../src/content/characters/ryo/commands.js';
import { RYO_ATTACK_KEYS, getRyoFrameData, getRyoAttackFrameData } from '../src/content/characters/ryo/attacks.js';
import { RYO_HITBOX_KEYS, getRyoHitboxOffsets, RYO_ATTACK_FRAME_KEYS } from '../src/content/characters/ryo/hitboxes.js';
import { getRyoAnimations, getRyoAnimSequence, getRyoAnimSequenceNames } from '../src/content/characters/ryo/animations.js';
import {
  RYO_ROLL_FRAMES, RYO_BACK_ROLL_FRAMES, RYO_GUARD_CRUSH_FRAMES,
  RYO_MAX_MODE_FRAMES, RYO_TAUNT_FRAMES, RYO_COUNTER_STANCE_FRAMES,
  RYO_RYUKO_RANBU_FRAMES,
} from '../src/rendering/sprites/ryo/ryoMovementFrames.js';

// ── Commands ──────────────────────────────────────────────────
describe('ryoCommands', () => {
  it('RYO_MOVE_LIST is non-empty array', () => {
    expect(Array.isArray(RYO_MOVE_LIST)).toBe(true);
    expect(RYO_MOVE_LIST.length).toBeGreaterThan(0);
  });
  it('RYO_WIN_QUOTES is non-empty array', () => {
    expect(Array.isArray(RYO_WIN_QUOTES)).toBe(true);
    expect(RYO_WIN_QUOTES.length).toBeGreaterThan(0);
  });
  it('moves have name field', () => {
    for (const move of RYO_MOVE_LIST) {
      expect(move).toHaveProperty('name');
    }
  });
  it('moves have input field', () => {
    for (const move of RYO_MOVE_LIST) {
      expect(move).toHaveProperty('input');
    }
  });
  it('win quotes are strings', () => {
    for (const q of RYO_WIN_QUOTES) {
      expect(typeof q).toBe('string');
    }
  });
});

// ── Attacks ───────────────────────────────────────────────────
describe('ryoAttacks', () => {
  it('RYO_ATTACK_KEYS is non-empty array', () => {
    expect(Array.isArray(RYO_ATTACK_KEYS)).toBe(true);
    expect(RYO_ATTACK_KEYS.length).toBeGreaterThan(0);
  });
  it('getRyoFrameData returns object', () => {
    const data = getRyoFrameData();
    expect(data).toBeDefined();
    expect(typeof data).toBe('object');
  });
  it('getRyoAttackFrameData returns entry for valid key', () => {
    const firstKey = RYO_ATTACK_KEYS[0];
    const entry = getRyoAttackFrameData(firstKey);
    expect(entry).toBeDefined();
  });
  it('getRyoAttackFrameData returns undefined for invalid key', () => {
    const entry = getRyoAttackFrameData('nonexistent_attack');
    expect(entry).toBeUndefined();
  });
  it('RYO_ATTACK_KEYS contains STAND_A', () => {
    expect(RYO_ATTACK_KEYS).toContain('STAND_A');
  });
});

// ── Hitboxes ──────────────────────────────────────────────────
describe('ryoHitboxes', () => {
  it('RYO_HITBOX_KEYS is non-empty array', () => {
    expect(Array.isArray(RYO_HITBOX_KEYS)).toBe(true);
    expect(RYO_HITBOX_KEYS.length).toBeGreaterThan(0);
  });
  it('getRyoHitboxOffsets returns object', () => {
    const offsets = getRyoHitboxOffsets();
    expect(offsets).toBeDefined();
    expect(typeof offsets).toBe('object');
  });
  it('RYO_ATTACK_FRAME_KEYS is non-empty array', () => {
    expect(Array.isArray(RYO_ATTACK_FRAME_KEYS)).toBe(true);
    expect(RYO_ATTACK_FRAME_KEYS.length).toBeGreaterThan(0);
  });
  it('RYO_HITBOX_KEYS contains RYO_KOOU', () => {
    expect(RYO_HITBOX_KEYS).toContain('RYO_KOOU');
  });
  it('getRyoHitboxOffsets has RYO_KOOU entry', () => {
    const offsets = getRyoHitboxOffsets();
    expect(offsets).toHaveProperty('RYO_KOOU');
  });
});

// ── Animations ────────────────────────────────────────────────
describe('ryoAnimations', () => {
  it('getRyoAnimations returns object or undefined', () => {
    const anim = getRyoAnimations();
    expect(anim === undefined || typeof anim === 'object').toBe(true);
  });
  it('getRyoAnimSequenceNames returns array', () => {
    const names = getRyoAnimSequenceNames();
    expect(Array.isArray(names)).toBe(true);
    expect(names.length).toBeGreaterThan(0);
  });
  it('getRyoAnimSequence returns object for valid name', () => {
    const names = getRyoAnimSequenceNames();
    const seq = getRyoAnimSequence(names[0]);
    expect(seq).toBeDefined();
  });
  it('getRyoAnimSequence returns undefined for invalid', () => {
    const seq = getRyoAnimSequence('nonexistent_anim');
    expect(seq).toBeUndefined();
  });
  it('sequence names include idle', () => {
    const names = getRyoAnimSequenceNames();
    const hasIdle = names.some(n => n.toLowerCase().includes('idle'));
    expect(hasIdle).toBe(true);
  });
});

// ── Movement Frames ───────────────────────────────────────────
describe('ryoMovementFrames extended', () => {
  it('RYO_ROLL_FRAMES is non-empty', () => {
    expect(RYO_ROLL_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_BACK_ROLL_FRAMES is non-empty', () => {
    expect(RYO_BACK_ROLL_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_GUARD_CRUSH_FRAMES is non-empty', () => {
    expect(RYO_GUARD_CRUSH_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_MAX_MODE_FRAMES is non-empty', () => {
    expect(RYO_MAX_MODE_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_TAUNT_FRAMES is non-empty', () => {
    expect(RYO_TAUNT_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_COUNTER_STANCE_FRAMES is non-empty', () => {
    expect(RYO_COUNTER_STANCE_FRAMES.length).toBeGreaterThan(0);
  });
  it('RYO_RYUKO_RANBU_FRAMES is non-empty', () => {
    expect(RYO_RYUKO_RANBU_FRAMES.length).toBeGreaterThan(0);
  });
});
