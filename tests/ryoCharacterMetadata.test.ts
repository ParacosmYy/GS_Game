import { describe, it, expect } from 'vitest';
import { RyoDef } from '../src/characters/ryo.js';
import { FighterState } from '../src/core/types.js';

describe('Ryo Character Metadata', () => {
  describe('basic info', () => {
    it('id is ryo', () => {
      expect(RyoDef.id).toBe('ryo');
    });

    it('nameCn contains 亮', () => {
      expect(RyoDef.nameCn).toContain('亮');
    });

    it('name is defined', () => {
      expect(RyoDef.name).toBeTruthy();
    });
  });

  describe('colors', () => {
    it('has primaryColor (color)', () => {
      expect(RyoDef.color).toBeTruthy();
    });

    it('has accentColor', () => {
      expect(RyoDef.accentColor).toBeTruthy();
    });

    it('color is valid hex', () => {
      expect(RyoDef.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('accentColor is valid hex', () => {
      expect(RyoDef.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  describe('win quotes', () => {
    it('has at least 2 win quotes', () => {
      expect(RyoDef.winQuotes.length).toBeGreaterThanOrEqual(2);
    });

    it('win quotes are non-empty strings', () => {
      for (const q of RyoDef.winQuotes) {
        expect(q.length).toBeGreaterThan(0);
      }
    });

    it('first win quote contains 極限流', () => {
      expect(RyoDef.winQuotes[0]).toContain('極限流');
    });
  });

  describe('portrait', () => {
    it('has pixelPortrait defined', () => {
      expect(RyoDef.pixelPortrait).toBeDefined();
    });

    it('pixelPortrait has correct dimensions', () => {
      expect(RyoDef.pixelPortrait.width).toBe(64);
      expect(RyoDef.pixelPortrait.height).toBe(80);
    });
  });

  describe('poses', () => {
    it('has idle poses', () => {
      expect(RyoDef.poses[FighterState.IDLE]).toBeDefined();
    });

    it('idle has multiple frames', () => {
      const idle = RyoDef.poses[FighterState.IDLE];
      if (Array.isArray(idle)) {
        expect(idle.length).toBeGreaterThanOrEqual(4);
      }
    });

    it('has walk poses', () => {
      expect(RyoDef.poses[FighterState.WALK]).toBeDefined();
    });

    it('has jump poses', () => {
      expect(RyoDef.poses[FighterState.JUMP]).toBeDefined();
    });
  });
});
