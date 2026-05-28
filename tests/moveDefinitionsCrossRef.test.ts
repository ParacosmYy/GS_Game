/**
 * Move Definitions → FRAME_DATA Cross-Reference Tests
 *
 * Validates that all move definitions for Ryo/Kyo/Iori reference
 * AttackType keys that exist in FRAME_DATA. Catches orphaned move
 * definitions when FRAME_DATA keys are renamed or removed.
 */
import { describe, it, expect } from 'vitest';
import { FRAME_DATA } from '../src/core/frameDataConstants.js';
import { RYO_MOVES } from '../src/content/characters/ryo/moves/ryoMoves.js';
import { KYO_MOVES } from '../src/content/characters/kyo/moves/kyoMoves.js';
import { IORI_MOVES } from '../src/content/characters/iori/moves/ioriMoves.js';
import type { MoveDefinition } from '../src/content/characters/ryo/moves/ryoMoves.js';

const fdKeys = new Set(Object.keys(FRAME_DATA));

function validateMoves(moves: MoveDefinition[], charLabel: string) {
  describe(`${charLabel} move definitions`, () => {
    it('has moves defined', () => {
      expect(moves.length).toBeGreaterThan(0);
    });

    it('all version attackTypeKeys exist in FRAME_DATA', () => {
      for (const move of moves) {
        for (const ver of move.versions) {
          expect(fdKeys.has(ver.attackTypeKey),
            `${charLabel}: ${ver.attackTypeKey} in FRAME_DATA`).toBe(true);
        }
      }
    });

    it('all move keys are unique', () => {
      const keys = moves.map(m => m.key);
      expect(new Set(keys).size).toBe(keys.length);
    });

    it('has at least one DM', () => {
      const dms = moves.filter(m => m.category === 'dm');
      expect(dms.length, `${charLabel} DMs`).toBeGreaterThan(0);
    });

    it('has at least one special', () => {
      const specials = moves.filter(m => m.category === 'special');
      expect(specials.length, `${charLabel} specials`).toBeGreaterThan(0);
    });

    it('all damage multipliers are positive', () => {
      for (const move of moves) {
        for (const ver of move.versions) {
          expect(ver.damageMultiplier,
            `${charLabel}:${ver.attackTypeKey} multiplier`).toBeGreaterThan(0);
        }
      }
    });

    it('C version does more damage than A version (where both exist)', () => {
      for (const move of moves) {
        const aVer = move.versions.find(v => v.version === 'A');
        const cVer = move.versions.find(v => v.version === 'C');
        if (aVer && cVer) {
          expect(cVer.damageMultiplier,
            `${charLabel}:${move.key} C multiplier >= A`).toBeGreaterThanOrEqual(aVer.damageMultiplier);
        }
      }
    });

    it('SDM category does more damage than DM category', () => {
      const dms = moves.filter(m => m.category === 'dm');
      const sdms = moves.filter(m => m.category === 'sdm');
      if (dms.length > 0 && sdms.length > 0) {
        const avgDm = dms.reduce((s, m) => s + m.versions[0].damageMultiplier, 0) / dms.length;
        const avgSdm = sdms.reduce((s, m) => s + m.versions[0].damageMultiplier, 0) / sdms.length;
        expect(avgSdm, `SDM avg(${avgSdm}) >= DM avg(${avgDm})`).toBeGreaterThanOrEqual(avgDm);
      }
    });
  });
}

validateMoves(RYO_MOVES, 'Ryo');
validateMoves(KYO_MOVES, 'Kyo');
validateMoves(IORI_MOVES, 'Iori');
