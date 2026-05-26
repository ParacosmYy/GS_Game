import { describe, it, expect } from 'vitest';
import { FRAME_DATA } from '../src/core/frameDataConstants.js';

describe('frameDataConstants', () => {
  describe('FRAME_DATA', () => {
    it('is an object', () => {
      expect(typeof FRAME_DATA).toBe('object');
    });
    it('has STAND_A entry', () => {
      expect(FRAME_DATA.STAND_A).toBeDefined();
    });
    it('STAND_A has startup field', () => {
      expect(FRAME_DATA.STAND_A.startup).toBeGreaterThan(0);
    });
    it('STAND_A has damage field', () => {
      expect(FRAME_DATA.STAND_A.damage).toBeGreaterThan(0);
    });
    it('has CROUCH_A entry', () => {
      expect(FRAME_DATA.CROUCH_A).toBeDefined();
    });
    it('has JUMP_A entry', () => {
      expect(FRAME_DATA.JUMP_A).toBeDefined();
    });
    it('light attacks are faster than heavy', () => {
      expect(FRAME_DATA.STAND_A.startup).toBeLessThanOrEqual(FRAME_DATA.STAND_C.startup);
    });
    it('all entries have required fields', () => {
      for (const [key, fd] of Object.entries(FRAME_DATA)) {
        const f = fd as any;
        expect(f.startup).toBeDefined();
        expect(f.damage).toBeDefined();
      }
    });
    it('all startups are positive', () => {
      for (const fd of Object.values(FRAME_DATA) as any[]) {
        expect(fd.startup).toBeGreaterThan(0);
      }
    });
    it('all damages are positive', () => {
      for (const fd of Object.values(FRAME_DATA) as any[]) {
        expect(fd.damage).toBeGreaterThan(0);
      }
    });
  });
});
