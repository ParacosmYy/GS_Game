/**
 * Core Systems Consolidated Tests
 *
 * Merged from: frameData, charStrategies, camera
 *
 * Covers: frame data constants, AI character strategies, camera system.
 */
import { describe, it, expect } from 'vitest';
import { FRAME_DATA } from '../src/core/frameDataConstants.js';
import { getCharacterStrategy } from '../src/ai/characterStrategies.js';
import { Camera } from '../src/core/camera.js';

// ── Frame Data ────────────────────────────────────────────────
describe('FRAME_DATA', () => {
  const keys = Object.keys(FRAME_DATA);
  it('has 10+ entries', () => {
    expect(keys.length).toBeGreaterThanOrEqual(10);
  });
  it('has STAND_A entry', () => {
    expect(FRAME_DATA['STAND_A']).toBeDefined();
    expect(FRAME_DATA['STAND_A'].startup).toBeGreaterThan(0);
  });
  it('has STAND_C entry with damage', () => {
    expect(FRAME_DATA['STAND_C']).toBeDefined();
    expect(FRAME_DATA['STAND_C'].damage).toBeGreaterThan(0);
  });
  it('has CROUCH_A entry', () => {
    expect(FRAME_DATA['CROUCH_A']).toBeDefined();
  });
  it('has JUMP_C entry', () => {
    expect(FRAME_DATA['JUMP_C']).toBeDefined();
  });
  it('all entries have startup > 0', () => {
    for (const key of keys) {
      expect(FRAME_DATA[key].startup).toBeGreaterThan(0);
    }
  });
});

// ── AI Character Strategies ───────────────────────────────────
describe('characterStrategies', () => {
  it('getCharacterStrategy returns object for ryo', () => {
    const strat = getCharacterStrategy('ryo');
    expect(strat).toBeDefined();
    expect(typeof strat).toBe('object');
  });
  it('returns object for kyo', () => {
    const strat = getCharacterStrategy('kyo');
    expect(strat).toBeDefined();
  });
  it('returns object for iori', () => {
    const strat = getCharacterStrategy('iori');
    expect(strat).toBeDefined();
  });
  it('strategy has preferredRange', () => {
    const strat = getCharacterStrategy('ryo');
    expect(strat).toHaveProperty('preferredRange');
  });
  it('unknown char returns default', () => {
    const strat = getCharacterStrategy('unknown_char');
    expect(strat).toBeDefined();
  });
});

// ── Camera ────────────────────────────────────────────────────
describe('Camera', () => {
  it('can be instantiated with defaults', () => {
    const cam = new Camera();
    expect(cam.x).toBe(0);
    expect(cam.y).toBe(0);
    expect(cam.zoom).toBeCloseTo(1.0);
  });
  it('update adjusts position', () => {
    const cam = new Camera();
    cam.update(100, 300);
    expect(typeof cam.x).toBe('number');
  });
  it('update does not throw', () => {
    const cam = new Camera();
    expect(() => cam.update(0, 0)).not.toThrow();
  });
  it('shakeX starts at 0', () => {
    const cam = new Camera();
    expect(cam.shakeX).toBe(0);
  });
  it('shakeY starts at 0', () => {
    const cam = new Camera();
    expect(cam.shakeY).toBe(0);
  });
});
