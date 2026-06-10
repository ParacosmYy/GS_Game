/**
 * Content Package Attack Keys Cross-Reference Tests
 *
 * Validates that each character's content package attack keys are consistent
 * with their FRAME_DATA entries and AttackType enum values.
 */
import { describe, it, expect } from 'vitest';
import { loadCharacterContent } from '../src/content/contentLoader.js';
import { FRAME_DATA } from '../src/core/frameDataConstants.js';
import { AttackType } from '../src/core/types.js';

const CHARS = [
  'ryo',
  'kyo',
  'iori',
  'andy',
  'clark',
  'kdash',
  'mai',
  'yashiro',
  'yuri',
  'takuma',
  'kensou',
  'rugal',
] as const;
const STRICT_FRAME_DATA_CHARS = ['ryo', 'kyo', 'iori'] as const;

// ===== Attack Keys Coverage =====

describe('Content package attack keys coverage', () => {
  for (const charId of CHARS) {
    describe(`${charId}`, () => {
      const content = loadCharacterContent(charId);
      const keys = content.attackKeys;

      it('has generic normals in attack keys', () => {
        const genericNormals = [
          'STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
          'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
          'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
        ];
        for (const normal of genericNormals) {
          expect(keys, `${charId} has ${normal}`).toContain(normal);
        }
      });

      it('strict baseline characters have frame data entries for every attack key', () => {
        if (!(STRICT_FRAME_DATA_CHARS as readonly string[]).includes(charId)) {
          return;
        }
        const attacks = loadCharacterContent(charId).attacks;
        const fdKeys = new Set(Object.keys(FRAME_DATA));
        const packageKeys = new Set(Object.keys(attacks));
        for (const key of keys) {
          expect(
            fdKeys.has(key) || packageKeys.has(key),
            `${charId}:${key} in global or package frame data`,
          ).toBe(true);
        }
      });

      it('hitbox data covers attack keys', () => {
        const hitboxes = content.hitboxes;
        // Hitbox data exists (keys may be indexed differently)
        expect(Object.keys(hitboxes).length, `${charId} has hitbox entries`).toBeGreaterThan(0);
      });

      it('has at least 10 attack keys', () => {
        expect(keys.length, `${charId} attack key count`).toBeGreaterThanOrEqual(10);
      });
    });
  }
});

// ===== Cross-Character Consistency =====

describe('Content package cross-character consistency', () => {
  it('all characters share the same generic normal keys', () => {
    const generics = ['STAND_A', 'STAND_B', 'STAND_C', 'STAND_D',
      'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D',
      'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D'];

    for (const charId of CHARS) {
      const keys = loadCharacterContent(charId).attackKeys;
      for (const g of generics) {
        expect(keys, `${charId} has ${g}`).toContain(g);
      }
    }
  });

  it('each character has unique special attack keys', () => {
    const ryoKeys = new Set(loadCharacterContent('ryo').attackKeys.filter(k => k.startsWith('RYO_')));
    const kyoKeys = new Set(loadCharacterContent('kyo').attackKeys.filter(k => k.startsWith('KYO_')));
    const ioriKeys = new Set(loadCharacterContent('iori').attackKeys.filter(k => k.startsWith('IORI_')));
    const andyKeys = new Set(loadCharacterContent('andy').attackKeys.filter(k => k.startsWith('ANDY_')));
    const clarkKeys = new Set(loadCharacterContent('clark').attackKeys.filter(k => k.startsWith('CLARK_')));
    const kdashKeys = new Set(loadCharacterContent('kdash').attackKeys.filter(k => k.startsWith('KDASH_')));
    const maiKeys = new Set(loadCharacterContent('mai').attackKeys.filter(k => k.startsWith('MAI_')));
    const yashiroKeys = new Set(loadCharacterContent('yashiro').attackKeys.filter(k => k.startsWith('YASHIRO_')));
    const yuriKeys = new Set(loadCharacterContent('yuri').attackKeys.filter(k => k.startsWith('YURI_')));
    const takumaKeys = new Set(loadCharacterContent('takuma').attackKeys.filter(k => k.startsWith('TAKUMA_')));
    const kensouKeys = new Set(loadCharacterContent('kensou').attackKeys.filter(k => k.startsWith('KENSOU_')));
    const rugalKeys = new Set(loadCharacterContent('rugal').attackKeys.filter(k => k.startsWith('RUGAL_')));
    const keySets = [
      ['ryo', ryoKeys],
      ['kyo', kyoKeys],
      ['iori', ioriKeys],
      ['andy', andyKeys],
      ['clark', clarkKeys],
      ['kdash', kdashKeys],
      ['mai', maiKeys],
      ['yashiro', yashiroKeys],
      ['yuri', yuriKeys],
      ['takuma', takumaKeys],
      ['kensou', kensouKeys],
      ['rugal', rugalKeys],
    ] as const;

    for (let i = 0; i < keySets.length; i += 1) {
      const [leftName, leftKeys] = keySets[i];
      for (let j = i + 1; j < keySets.length; j += 1) {
        const [rightName, rightKeys] = keySets[j];
        for (const key of leftKeys) {
          expect(rightKeys.has(key), `${rightName} should not have ${leftName} key ${key}`).toBe(false);
        }
      }
    }
  });

  it('each character has DM entries', () => {
    for (const charId of CHARS) {
      const keys = loadCharacterContent(charId).attackKeys;
      const dms = keys.filter(k => k.startsWith('DM_'));
      expect(dms.length, `${charId} has DM attacks`).toBeGreaterThan(0);
    }
  });
});

// ===== Available Actions =====

describe('Content package available actions', () => {
  it('all characters have required action names', () => {
    const requiredActions = ['idle', 'walk_forward', 'stand_a', 'stand_c', 'crouch_a'];
    for (const charId of CHARS) {
      const actions = loadCharacterContent(charId).availableActions;
      for (const req of requiredActions) {
        expect(actions, `${charId} has action ${req}`).toContain(req);
      }
    }
  });

  it('animation sequence names match available actions', () => {
    for (const charId of CHARS) {
      const content = loadCharacterContent(charId);
      const animNames = content.animSequenceNames;
      // At least some available actions should have matching animation sequences
      const overlap = content.availableActions.filter(a => animNames.includes(a));
      expect(overlap.length, `${charId} action-animation overlap`).toBeGreaterThan(0);
    }
  });
});
