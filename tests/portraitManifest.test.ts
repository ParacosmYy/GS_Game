import { describe, it, expect } from 'vitest';
import { PORTRAIT_SIZES, getPortrait, getSelectPortrait, getHUDPortrait, getVSPortrait } from '../src/core/portraitManifest.js';

describe('portraitManifest', () => {
  const mockManifest = {
    portraits: {
      ryo: {
        select: { canvas: null as any, x: 0, y: 0, w: 120, h: 120 },
        hud: { canvas: null as any, x: 0, y: 0, w: 40, h: 40 },
        vs: { canvas: null as any, x: 0, y: 0, w: 200, h: 200 },
      },
    },
  } as any;

  describe('PORTRAIT_SIZES', () => {
    it('is an object', () => expect(typeof PORTRAIT_SIZES).toBe('object'));
    it('has select size', () => expect(PORTRAIT_SIZES.select).toBeDefined());
    it('has hud size', () => expect(PORTRAIT_SIZES.hud).toBeDefined());
  });

  describe('getPortrait', () => {
    it('returns entry for valid char and size', () => {
      const entry = getPortrait(mockManifest, 'ryo', 'select');
      expect(entry).toBeDefined();
      expect(entry!.w).toBe(120);
    });
    it('returns undefined for unknown char', () => {
      expect(getPortrait(mockManifest, 'unknown', 'select')).toBeUndefined();
    });
  });

  describe('getSelectPortrait', () => {
    it('returns select portrait', () => {
      const entry = getSelectPortrait(mockManifest, 'ryo');
      expect(entry).toBeDefined();
    });
  });

  describe('getHUDPortrait', () => {
    it('returns hud portrait', () => {
      const entry = getHUDPortrait(mockManifest, 'ryo');
      expect(entry).toBeDefined();
    });
  });

  describe('getVSPortrait', () => {
    it('returns vs portrait', () => {
      const entry = getVSPortrait(mockManifest, 'ryo');
      expect(entry).toBeDefined();
    });
  });
});
