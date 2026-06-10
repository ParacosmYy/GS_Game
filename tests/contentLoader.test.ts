import { describe, it, expect } from 'vitest';
import {
  loadCharacterContent,
  hasCharacterContent,
  getAvailableCharacterIds,
} from '../src/content/contentLoader.js';

const EXPANDED_MUGEN_CONTENT_IDS = ['andy', 'clark', 'kdash', 'mai', 'yashiro', 'yuri'] as const;
const MINIMAL_MUGEN_CONTENT_IDS = ['takuma', 'kensou', 'rugal', 'g_rugal'] as const;

describe('contentLoader', () => {
  describe('hasCharacterContent', () => {
    it('ryo has content', () => expect(hasCharacterContent('ryo')).toBe(true));
    it('kyo has content', () => expect(hasCharacterContent('kyo')).toBe(true));
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

    it('lists expanded MUGEN-backed content packages', () => {
      const ids = getAvailableCharacterIds();
      for (const charId of EXPANDED_MUGEN_CONTENT_IDS) {
        expect(ids, `${charId} is available through content loader`).toContain(charId);
      }
    });

    it('lists minimal MUGEN-backed content packages', () => {
      const ids = getAvailableCharacterIds();
      for (const charId of MINIMAL_MUGEN_CONTENT_IDS) {
        expect(ids, `${charId} is available through content loader`).toContain(charId);
      }
    });
  });

  describe('loadCharacterContent', () => {
    it.each(EXPANDED_MUGEN_CONTENT_IDS)('loads %s content package through the unified loader', (charId) => {
      expect(hasCharacterContent(charId), `${charId} has content`).toBe(true);

      const content = loadCharacterContent(charId);
      expect(content.data.id).toBe(charId);
      expect(content.data.name).toBeTruthy();
      expect(content.data.nameCn).toBeTruthy();
      expect(content.data.color).toBeTruthy();
      expect(content.attacks).toBeDefined();
      expect(content.attackKeys.length, `${charId} attack keys`).toBeGreaterThan(0);
      expect(content.commands).toBeDefined();
      expect(content.availableActions.length, `${charId} available actions`).toBeGreaterThan(0);
      expect(content.animations).toBeDefined();
      expect(content.animSequenceNames.length, `${charId} animation names`).toBeGreaterThan(0);
      expect(Object.keys(content.hitboxes).length, `${charId} hitboxes`).toBeGreaterThan(0);
      expect(content.attackFrames).toBeDefined();
      expect(Object.keys(content.feedback).length, `${charId} feedback`).toBeGreaterThan(0);
    });

    it.each(MINIMAL_MUGEN_CONTENT_IDS)('loads %s minimal content package through the unified loader', (charId) => {
      expect(hasCharacterContent(charId), `${charId} has content`).toBe(true);

      const content = loadCharacterContent(charId);
      expect(content.data.id).toBe(charId);
      expect(content.attackKeys).toEqual(expect.arrayContaining(['STAND_A', 'STAND_C', 'CROUCH_A', 'CROUCH_C']));
      expect(content.availableActions).toEqual(expect.arrayContaining(['idle', 'walk_forward', 'jump_up', 'stand_a', 'crouch_a']));
      expect(content.animSequenceNames).toEqual(expect.arrayContaining(['idle', 'walk_forward', 'stand_a', 'crouch_a']));
      expect(Object.keys(content.hitboxes).length, `${charId} MUGEN action map`).toBeGreaterThan(0);
      expect(Object.keys(content.feedback).length, `${charId} feedback`).toBeGreaterThan(0);
      expect(content.report).toBeNull();
    });

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
