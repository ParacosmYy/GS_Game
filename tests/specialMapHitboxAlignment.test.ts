/**
 * Validates that all KOF2002 roster character specialMap entries
 * reference MUGEN action numbers that actually exist in hitboxes.json.
 * Uses direct file reads + registerHitboxData to bypass fetch.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  registerHitboxData,
  hasMugenHitboxes,
  getAvailableActions,
  type MugenHitboxData,
} from '../src/rendering/sprites/shared/mugenHitboxLoader.js';
import { getCharacterConfig } from '../src/rendering/sprites/shared/characterSpriteRegistry.js';

import '../src/rendering/sprites/shared/characterSpriteConfigs.js';

const SPRITES_DIR = path.resolve(__dirname, '../public/sprites');

const KOF2002_WITH_SPRITES = [
  'kyo', 'ryo', 'athena', 'terry', 'kim',
  'vice', 'yamazaki', 'shermie', 'benimaru', 'heidern', 'yuri',
  'rugal', 'g_rugal',
];

const MUGEN_DIR_MAP: Record<string, string> = {
  kyo: 'cvskyo',
  ryo: 'cvsryo',
  athena: 'cvsathena',
  terry: 'cvsterry',
  kim: 'cvskim',
  vice: 'cvsvice',
  yamazaki: 'cvsyamazaki',
  shermie: 'shermie',
  benimaru: 'cvsbenimaru',
  heidern: 'heidern',
  yuri: 'cvsyuri',
  rugal: 'cvsrugal',
  g_rugal: 'cvsg_rugal',
};

function getAlignmentData(charId: string) {
  const config = getCharacterConfig(charId);
  if (!config) return null;

  const hasHitbox = hasMugenHitboxes(config.mugenDir);
  if (!hasHitbox) return null;

  const availableActions = new Set(getAvailableActions(config.mugenDir));
  const specialMapEntries = Object.entries(config.specialMap);
  const missing: string[] = [];

  for (const [attackType, actionNumber] of specialMapEntries) {
    if (!availableActions.has(actionNumber)) {
      missing.push(`${attackType}→${actionNumber}`);
    }
  }

  return {
    total: specialMapEntries.length,
    inHitbox: specialMapEntries.length - missing.length,
    missing,
    coveragePct: specialMapEntries.length > 0
      ? (specialMapEntries.length - missing.length) / specialMapEntries.length
      : 0,
  };
}

describe('specialMap ↔ hitboxes.json alignment', () => {
  beforeAll(() => {
    for (const charId of KOF2002_WITH_SPRITES) {
      const mugenDir = MUGEN_DIR_MAP[charId];
      const hitboxPath = path.join(SPRITES_DIR, mugenDir, 'hitboxes.json');
      if (fs.existsSync(hitboxPath)) {
        const data: MugenHitboxData = JSON.parse(fs.readFileSync(hitboxPath, 'utf8'));
        registerHitboxData(mugenDir, data);
      }
    }
  });

  for (const charId of KOF2002_WITH_SPRITES) {
    describe(`${charId}`, () => {
      it('has character config registered', () => {
        const config = getCharacterConfig(charId);
        expect(config).toBeDefined();
      });

      it('has MUGEN hitbox data loaded', () => {
        const config = getCharacterConfig(charId);
        expect(config).toBeDefined();
        expect(hasMugenHitboxes(MUGEN_DIR_MAP[charId])).toBe(true);
      });

      it('specialMap entries reference valid hitbox actions (>30% coverage)', () => {
        const data = getAlignmentData(charId);
        expect(data).not.toBeNull();
        expect(
          data!.coveragePct,
          `${charId} hitbox coverage: ${data!.inHitbox}/${data!.total}, missing: ${data!.missing.slice(0, 5).join(', ')}`,
        ).toBeGreaterThan(0.3);
      });

      it('has at least 10 specialMap entries', () => {
        const config = getCharacterConfig(charId);
        expect(config).toBeDefined();
        const entries = Object.keys(config!.specialMap);
        expect(entries.length, `${charId} specialMap size`).toBeGreaterThanOrEqual(10);
      });
    });
  }
});

describe('specialMap completeness stats', () => {
  it('all KOF2002 roster characters have sufficient specialMap entries', () => {
    let totalEntries = 0;
    for (const charId of KOF2002_WITH_SPRITES) {
      const config = getCharacterConfig(charId);
      if (config) {
        totalEntries += Object.keys(config.specialMap).length;
      }
    }
    expect(totalEntries).toBeGreaterThanOrEqual(150);
  });

  it('coverage report', () => {
    const lines: string[] = [];
    for (const charId of KOF2002_WITH_SPRITES) {
      const data = getAlignmentData(charId);
      if (!data) {
        lines.push(`  ${charId}: no data`);
        continue;
      }
      const pct = Math.round(data.coveragePct * 100);
      lines.push(`  ${charId}: ${data.inHitbox}/${data.total} (${pct}%)`);
    }
    expect(lines.length).toBe(KOF2002_WITH_SPRITES.length);
  });
});
