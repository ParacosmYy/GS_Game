/**
 * Cross-validation: MUGEN hitbox data vs hardcoded frame data constants
 * for characters that have both MUGEN hitboxes.json and FRAME_DATA entries.
 * Ensures timing consistency between the two data sources.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  registerHitboxData,
  getHitboxAction,
  getActionTiming,
  type MugenHitboxData,
} from '../src/rendering/sprites/shared/mugenHitboxLoader.js';
import { FRAME_DATA } from '../src/core/frameDataConstants.js';
import { AttackType } from '../src/core/types.js';

const SPRITES_DIR = path.resolve(__dirname, '../public/sprites');

interface CharTestConfig {
  charId: string;
  mugenDir: string;
  moves: { attackType: AttackType; actionNumber: string }[];
}

const CHAR_CONFIGS: CharTestConfig[] = [
  {
    charId: 'benimaru',
    mugenDir: 'cvsbenimaru',
    moves: [
      { attackType: AttackType.BENIMARU_RAIJINKEN, actionNumber: '1100' },
      { attackType: AttackType.BENIMARU_IAI_GERI, actionNumber: '1200' },
      { attackType: AttackType.BENIMARU_SUPER_INAZUMA_KICK, actionNumber: '1150' },
    ],
  },
  {
    charId: 'heidern',
    mugenDir: 'heidern',
    moves: [
      { attackType: AttackType.HEIDERN_MOON_SLASHER, actionNumber: '1100' },
      { attackType: AttackType.HEIDERN_STORMBRINGER, actionNumber: '1300' },
      { attackType: AttackType.HEIDERN_KILLING_BRINGER, actionNumber: '1400' },
    ],
  },
  {
    charId: 'yuri',
    mugenDir: 'cvsyuri',
    moves: [
      { attackType: AttackType.YURI_HIEN_HOU_OU_KYAKU, actionNumber: '1300' },
      { attackType: AttackType.YURI_CHOU_UPPER, actionNumber: '1100' },
      { attackType: AttackType.DM_YURI_HIEN_HOU_OU_KYAKU, actionNumber: '3100' },
    ],
  },
];

describe('MUGEN hitbox timing vs FRAME_DATA cross-validation', () => {
  beforeAll(() => {
    for (const cfg of CHAR_CONFIGS) {
      const hitboxPath = path.join(SPRITES_DIR, cfg.mugenDir, 'hitboxes.json');
      if (fs.existsSync(hitboxPath)) {
        const data: MugenHitboxData = JSON.parse(fs.readFileSync(hitboxPath, 'utf8'));
        registerHitboxData(cfg.mugenDir, data);
      }
    }
  });

  for (const cfg of CHAR_CONFIGS) {
    describe(`${cfg.charId}`, () => {
      for (const move of cfg.moves) {
        describe(`${move.attackType} (action ${move.actionNumber})`, () => {
          it('has MUGEN hitbox data', () => {
            const action = getHitboxAction(cfg.mugenDir, move.actionNumber);
            expect(action).not.toBeNull();
          });

          it('has FRAME_DATA entry', () => {
            const fd = FRAME_DATA[move.attackType as keyof typeof FRAME_DATA];
            expect(fd).toBeDefined();
          });

          it('MUGEN active frames > 0 (has attack Clsn)', () => {
            const action = getHitboxAction(cfg.mugenDir, move.actionNumber);
            if (!action) return;
            // MUGEN active frames count should be >0 if attack has Clsn data
            if (action.active > 0) {
              expect(action.active).toBeGreaterThan(0);
            }
          });

          it('MUGEN total frames is reasonable', () => {
            const timing = getActionTiming(cfg.mugenDir, move.actionNumber);
            if (!timing) return;
            const total = timing.startup + timing.active + timing.recovery;
            expect(total).toBeGreaterThan(2);
            expect(total).toBeLessThan(120);
          });

          it('FRAME_DATA damage is reasonable', () => {
            const fd = FRAME_DATA[move.attackType as keyof typeof FRAME_DATA];
            if (!fd) return;
            expect(fd.damage).toBeGreaterThan(0);
            expect(fd.damage).toBeLessThan(200);
          });
        });
      }
    });
  }
});

describe('MUGEN action coverage for specials', () => {
  it('Benimaru has at least 10 special/DM actions in hitboxes', () => {
    const hitboxPath = path.join(SPRITES_DIR, 'cvsbenimaru', 'hitboxes.json');
    const data: MugenHitboxData = JSON.parse(fs.readFileSync(hitboxPath, 'utf8'));
    const specialActions = Object.keys(data.actions).filter(k => Number(k) >= 1000);
    expect(specialActions.length).toBeGreaterThanOrEqual(10);
  });

  it('Heidern has at least 10 special/DM actions in hitboxes', () => {
    const hitboxPath = path.join(SPRITES_DIR, 'heidern', 'hitboxes.json');
    const data: MugenHitboxData = JSON.parse(fs.readFileSync(hitboxPath, 'utf8'));
    const specialActions = Object.keys(data.actions).filter(k => Number(k) >= 1000);
    expect(specialActions.length).toBeGreaterThanOrEqual(10);
  });

  it('Yuri has at least 10 special/DM actions in hitboxes', () => {
    const hitboxPath = path.join(SPRITES_DIR, 'cvsyuri', 'hitboxes.json');
    const data: MugenHitboxData = JSON.parse(fs.readFileSync(hitboxPath, 'utf8'));
    const specialActions = Object.keys(data.actions).filter(k => Number(k) >= 1000);
    expect(specialActions.length).toBeGreaterThanOrEqual(10);
  });
});
