import { describe, it, expect } from 'vitest';
import { ATTACK_FRAMES } from '../src/core/attackFrames.js';

describe('attackFrames', () => {
  describe('ATTACK_FRAMES', () => {
    it('is an object', () => {
      expect(typeof ATTACK_FRAMES).toBe('object');
    });
    it('has STAND_A entry', () => {
      expect(ATTACK_FRAMES.STAND_A).toBeDefined();
    });
    it('has STAND_C entry', () => {
      expect(ATTACK_FRAMES.STAND_C).toBeDefined();
    });
    it('has CROUCH_A entry', () => {
      expect(ATTACK_FRAMES.CROUCH_A).toBeDefined();
    });
    it('has JUMP_A entry', () => {
      expect(ATTACK_FRAMES.JUMP_A).toBeDefined();
    });
    it('entries are arrays', () => {
      expect(Array.isArray(ATTACK_FRAMES.STAND_A)).toBe(true);
    });
    it('STAND_A has at least 1 frame', () => {
      expect(ATTACK_FRAMES.STAND_A.length).toBeGreaterThan(0);
    });
    it('STAND_C has at least 1 frame', () => {
      expect(ATTACK_FRAMES.STAND_C.length).toBeGreaterThan(0);
    });
    it('all entries are arrays with frames', () => {
      for (const [key, frames] of Object.entries(ATTACK_FRAMES)) {
        expect(Array.isArray(frames)).toBe(true);
      }
    });
  });
});
