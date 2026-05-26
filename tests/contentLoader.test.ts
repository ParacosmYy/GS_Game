import { describe, it, expect } from 'vitest';
import {
  loadCharacterContent,
  hasCharacterContent,
  getAvailableCharacterIds,
} from '../src/content/contentLoader.js';

describe('contentLoader', () => {
  describe('hasCharacterContent', () => {
    it('ryo has content', () => expect(hasCharacterContent('ryo')).toBe(true));
    it('kyo has no content yet', () => expect(hasCharacterContent('kyo')).toBe(false));
    it('empty string has no content', () => expect(hasCharacterContent('')).toBe(false));
    it('random id has no content', () => expect(hasCharacterContent('random')).toBe(false));
  });

  describe('getAvailableCharacterIds', () => {
    it('returns array with ryo', () => {
      const ids = getAvailableCharacterIds();
      expect(ids).toContain('ryo');
    });
    it('returns non-empty array', () => {
      expect(getAvailableCharacterIds().length).toBeGreaterThan(0);
    });
  });

  describe('loadCharacterContent', () => {
    it('loads ryo content successfully', () => {
      const content = loadCharacterContent('ryo');
      expect(content).toBeDefined();
      expect(content.data).toBeDefined();
      expect(content.attacks).toBeDefined();
      expect(content.attackKeys).toBeDefined();
      expect(content.commands).toBeDefined();
      expect(content.availableActions).toBeDefined();
      expect(content.animations).toBeDefined();
      expect(content.animSequenceNames).toBeDefined();
      expect(content.hitboxes).toBeDefined();
      expect(content.attackFrames).toBeDefined();
      expect(content.feedback).toBeDefined();
      expect(content.report).toBeDefined();
    });

    it('ryo content has correct character ID', () => {
      const content = loadCharacterContent('ryo');
      expect(content.data.id).toBe('ryo');
    });

    it('ryo attackKeys is non-empty array', () => {
      const content = loadCharacterContent('ryo');
      expect(Array.isArray(content.attackKeys)).toBe(true);
      expect(content.attackKeys.length).toBeGreaterThan(0);
    });

    it('ryo animSequenceNames is non-empty array', () => {
      const content = loadCharacterContent('ryo');
      expect(Array.isArray(content.animSequenceNames)).toBe(true);
      expect(content.animSequenceNames.length).toBeGreaterThan(0);
    });

    it('ryo feedback has entries', () => {
      const content = loadCharacterContent('ryo');
      expect(Object.keys(content.feedback).length).toBeGreaterThan(0);
    });

    it('ryo report is an object with character field', () => {
      const content = loadCharacterContent('ryo');
      expect(content.report).toBeDefined();
      expect(typeof content.report).toBe('object');
    });

    it('throws for unknown character', () => {
      expect(() => loadCharacterContent('unknown')).toThrow();
    });

    it('ryo availableActions includes basic actions', () => {
      const content = loadCharacterContent('ryo');
      expect(content.availableActions.length).toBeGreaterThan(0);
    });

    it('ryo hitboxes has entries', () => {
      const content = loadCharacterContent('ryo');
      expect(Object.keys(content.hitboxes).length).toBeGreaterThan(0);
    });
  });
});
