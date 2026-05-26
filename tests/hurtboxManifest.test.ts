import { describe, it, expect } from 'vitest';
import { HURTBOX_TABLE, DEFAULT_HURTBOX, getHurtboxDef } from '../src/core/hurtboxManifest.js';

describe('hurtboxManifest', () => {
  describe('HURTBOX_TABLE', () => {
    it('is an object', () => {
      expect(typeof HURTBOX_TABLE).toBe('object');
    });
    it('has entries for multiple states', () => {
      expect(Object.keys(HURTBOX_TABLE).length).toBeGreaterThan(3);
    });
  });

  describe('DEFAULT_HURTBOX', () => {
    it('has offset fields', () => {
      expect(DEFAULT_HURTBOX).toBeDefined();
      expect(DEFAULT_HURTBOX.offsetX).toBeDefined();
      expect(DEFAULT_HURTBOX.offsetY).toBeDefined();
    });
    it('has width and height', () => {
      expect(DEFAULT_HURTBOX.width).toBeGreaterThan(0);
      expect(DEFAULT_HURTBOX.height).toBeGreaterThan(0);
    });
  });

  describe('getHurtboxDef', () => {
    it('returns definition for known state', () => {
      const def = getHurtboxDef('idle');
      expect(def).toBeDefined();
    });
    it('returns DEFAULT_HURTBOX for unknown state', () => {
      const def = getHurtboxDef('nonexistent_state');
      expect(def).toBe(DEFAULT_HURTBOX);
    });
    it('returned def has required fields', () => {
      const def = getHurtboxDef('idle');
      expect(def.offsetX).toBeDefined();
      expect(def.width).toBeGreaterThan(0);
    });
  });
});
