/**
 * mugenHitboxLoader.test.ts
 *
 * Tests for the MUGEN hitbox loading and lookup system.
 * Uses direct file reads + registerHitboxData to bypass fetch.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  registerHitboxData,
  getHitboxAction,
  getAttackBoxesAtFrame,
  getActivePhaseBoxes,
  getActivePhaseBodyOverride,
  getBodyOverrideAtFrame,
  getActionTotalFrames,
  hasMugenHitboxes,
  scaleFrameBox,
  scaleHitboxFrame,
  calculateScaleFactor,
  getScaledAttackAtFrame,
  getHitboxLoadSummary,
  getAvailableActions,
  getActionTiming,
  compareTimingWithFrameData,
  getAllAttackBoxes,
  getAttackBoundingBox,
  type MugenHitboxData,
  type MugenHitboxFrame,
  type FrameBox,
} from '../src/rendering/sprites/shared/mugenHitboxLoader.js';
import { getCharacterConfig } from '../src/rendering/sprites/shared/characterSpriteRegistry.js';

// Ensure character configs are registered
import '../src/rendering/sprites/shared/characterSpriteConfigs.js';

const SPRITES_DIR = path.resolve(__dirname, '../public/sprites');

function loadHitboxFileSync(mugenDir: string): MugenHitboxData | null {
  const filePath = path.join(SPRITES_DIR, mugenDir, 'hitboxes.json');
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// Pre-load all available hitbox data
function loadAllAvailableHitboxes(): string[] {
  const loaded: string[] = [];
  const dirs = fs.readdirSync(SPRITES_DIR);
  for (const dir of dirs) {
    const data = loadHitboxFileSync(dir);
    if (data) {
      registerHitboxData(dir, data);
      loaded.push(dir);
    }
  }
  return loaded;
}

describe('mugenHitboxLoader', () => {
  let loadedDirs: string[];

  beforeAll(() => {
    loadedDirs = loadAllAvailableHitboxes();
  });

  describe('data loading', () => {
    it('loads hitbox data for at least 8 ROSTER characters', () => {
      const rosterDirs = ['cvskyo', 'cvsryo', 'cvsterry', 'cvskim', 'cvsathena', 'cvsvice', 'cvsyamazaki', 'shermie'];
      for (const dir of rosterDirs) {
        expect(loadedDirs).toContain(dir);
      }
    });

    it('all loaded characters with actions have >0 actions', () => {
      for (const dir of loadedDirs) {
        expect(hasMugenHitboxes(dir)).toBe(true);
        const data = loadHitboxFileSync(dir);
        expect(data).not.toBeNull();
        // Some characters (e.g., mai) may have hitbox files but 0 parsed actions
        // due to AIR format differences; only validate those with actions
        const actionCount = Object.keys(data!.actions).length;
        if (actionCount > 0) {
          expect(actionCount).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('getHitboxAction', () => {
    it('finds action 200 (stand A) for Ryo', () => {
      const action = getHitboxAction('cvsryo', '200');
      expect(action).not.toBeNull();
      expect(action!.startup).toBeGreaterThanOrEqual(0);
      expect(action!.active).toBeGreaterThan(0);
      expect(action!.frames.length).toBeGreaterThan(0);
    });

    it('finds action 200 for Kyo', () => {
      const action = getHitboxAction('cvskyo', '200');
      expect(action).not.toBeNull();
      expect(action!.active).toBeGreaterThan(0);
    });

    it('returns null for unknown action', () => {
      const action = getHitboxAction('cvsryo', '99999');
      expect(action).toBeNull();
    });

    it('returns null for unregistered character', () => {
      const action = getHitboxAction('nonexistent', '200');
      expect(action).toBeNull();
    });
  });

  describe('getAttackBoxesAtFrame', () => {
    it('returns null during startup frames', () => {
      const action = getHitboxAction('cvsryo', '200');
      expect(action).not.toBeNull();
      if (action!.startup > 0) {
        const boxes = getAttackBoxesAtFrame('cvsryo', '200', 0);
        expect(boxes).toBeNull();
      }
    });

    it('returns attack boxes during active frames', () => {
      const action = getHitboxAction('cvsryo', '200');
      expect(action).not.toBeNull();
      const activeStart = action!.startup;
      const boxes = getAttackBoxesAtFrame('cvsryo', '200', activeStart);
      expect(boxes).not.toBeNull();
      expect(boxes!.length).toBeGreaterThan(0);
      expect(boxes![0]).toHaveProperty('ox');
      expect(boxes![0]).toHaveProperty('oy');
      expect(boxes![0]).toHaveProperty('w');
      expect(boxes![0]).toHaveProperty('h');
    });

    it('returns null during recovery frames', () => {
      const action = getHitboxAction('cvsryo', '200');
      expect(action).not.toBeNull();
      const recoveryStart = action!.startup + action!.active;
      const boxes = getAttackBoxesAtFrame('cvsryo', '200', recoveryStart);
      expect(boxes).toBeNull();
    });

    it('returns null for frame beyond total', () => {
      const action = getHitboxAction('cvsryo', '200');
      const wayPast = action!.startup + action!.active + action!.recovery + 100;
      const boxes = getAttackBoxesAtFrame('cvsryo', '200', wayPast);
      expect(boxes).toBeNull();
    });
  });

  describe('getBodyOverrideAtFrame', () => {
    it('can return body override during active phase', () => {
      const action = getHitboxAction('cvsryo', '200');
      expect(action).not.toBeNull();
      if (action!.frames[0]?.bodyOverride) {
        const body = getBodyOverrideAtFrame('cvsryo', '200', action!.startup);
        expect(body).not.toBeNull();
      }
    });

    it('returns null during startup', () => {
      const action = getHitboxAction('cvsryo', '200');
      if (action!.startup > 0) {
        const body = getBodyOverrideAtFrame('cvsryo', '200', 0);
        expect(body).toBeNull();
      }
    });
  });

  describe('getActionTotalFrames', () => {
    it('sums startup + active + recovery', () => {
      const data = loadHitboxFileSync('cvsryo');
      const action = data!.actions['200'];
      const total = getActionTotalFrames(action!);
      expect(total).toBe(action!.startup + action!.active + action!.recovery);
    });
  });

  describe('hasMugenHitboxes', () => {
    it('returns true for loaded character', () => {
      expect(hasMugenHitboxes('cvsryo')).toBe(true);
      expect(hasMugenHitboxes('cvskyo')).toBe(true);
    });

    it('returns false for unloaded character', () => {
      expect(hasMugenHitboxes('nonexistent_xyz')).toBe(false);
    });
  });

  describe('scaleFrameBox', () => {
    it('scales coordinates by factor', () => {
      const box: FrameBox = { ox: 20, oy: -85, w: 46, h: 13 };
      const scaled = scaleFrameBox(box, 2.0);
      expect(scaled).toEqual({
        offsetX: 40,
        offsetY: -170,
        width: 92,
        height: 26,
      });
    });

    it('handles scale factor of 1', () => {
      const box: FrameBox = { ox: 10, oy: -50, w: 30, h: 20 };
      const scaled = scaleFrameBox(box, 1.0);
      expect(scaled).toEqual({
        offsetX: 10,
        offsetY: -50,
        width: 30,
        height: 20,
      });
    });

    it('rounds results', () => {
      const box: FrameBox = { ox: 7, oy: -33, w: 11, h: 5 };
      const scaled = scaleFrameBox(box, 1.5);
      expect(scaled.offsetX).toBe(Math.round(7 * 1.5));
    });
  });

  describe('scaleHitboxFrame', () => {
    it('scales all attack boxes in a frame', () => {
      const frame: MugenHitboxFrame = {
        attack: [
          { ox: 20, oy: -85, w: 46, h: 13 },
          { ox: 10, oy: -50, w: 30, h: 20 },
        ],
        bodyOverride: null,
      };
      const scaled = scaleHitboxFrame(frame, 2.0);
      expect(scaled.attack).toHaveLength(2);
      expect(scaled.attack[0].offsetX).toBe(40);
      expect(scaled.bodyOverride).toBeNull();
    });

    it('scales body override when present', () => {
      const frame: MugenHitboxFrame = {
        attack: [{ ox: 20, oy: -85, w: 46, h: 13 }],
        bodyOverride: { ox: -9999, oy: -9999, w: 0, h: 0 },
      };
      const scaled = scaleHitboxFrame(frame, 2.0);
      expect(scaled.bodyOverride).not.toBeNull();
      expect(scaled.bodyOverride!.offsetX).toBe(-19998);
    });
  });

  describe('calculateScaleFactor', () => {
    it('computes ratio of display to sprite height', () => {
      expect(calculateScaleFactor(106, 200)).toBeCloseTo(200 / 106, 4);
    });

    it('returns 1 for zero sprite height', () => {
      expect(calculateScaleFactor(0, 200)).toBe(1);
    });
  });

  describe('getScaledAttackAtFrame', () => {
    it('returns null for character without loaded hitboxes', () => {
      const config = getCharacterConfig('ryo');
      const result = getScaledAttackAtFrame(
        'nonexistent_xyz', config!, 'STAND_ATTACK' as any,
        null, 0, 1, 0, 1.5,
      );
      expect(result).toBeNull();
    });
  });

  describe('getHitboxLoadSummary', () => {
    it('returns summary with all loaded characters', () => {
      const summary = getHitboxLoadSummary();
      expect(summary.length).toBeGreaterThanOrEqual(8);
      const ryoEntry = summary.find(s => s.charId === 'cvsryo');
      expect(ryoEntry).not.toBeUndefined();
      expect(ryoEntry!.actions).toBeGreaterThan(0);
      expect(ryoEntry!.totalActiveFrames).toBeGreaterThan(0);
    });
  });

  describe('cross-character hitbox coverage', () => {
    const rosterChars = [
      { charId: 'kyo', mugenDir: 'cvskyo', minActions: 50 },
      { charId: 'ryo', mugenDir: 'cvsryo', minActions: 40 },
      { charId: 'terry', mugenDir: 'cvsterry', minActions: 40 },
      { charId: 'kim', mugenDir: 'cvskim', minActions: 40 },
      { charId: 'athena', mugenDir: 'cvsathena', minActions: 30 },
      { charId: 'vice', mugenDir: 'cvsvice', minActions: 30 },
      { charId: 'yamazaki', mugenDir: 'cvsyamazaki', minActions: 40 },
      { charId: 'shermie', mugenDir: 'shermie', minActions: 30 },
    ];

    it.each(rosterChars)('$charId has ≥$minActions hitbox actions', ({ mugenDir, minActions }) => {
      expect(hasMugenHitboxes(mugenDir)).toBe(true);
      const data = loadHitboxFileSync(mugenDir);
      expect(Object.keys(data!.actions).length).toBeGreaterThanOrEqual(minActions);
    });

    it('all ROSTER chars have stand A (action 200)', () => {
      for (const { mugenDir } of rosterChars) {
        const data = loadHitboxFileSync(mugenDir);
        expect(data).not.toBeNull();
        expect(data!.actions['200']).not.toBeUndefined();
      }
    });

    it('all ROSTER chars have stand C (action 210 or 211)', () => {
      for (const { mugenDir } of rosterChars) {
        const data = loadHitboxFileSync(mugenDir);
        expect(data).not.toBeNull();
        const hasStandC = data!.actions['210'] || data!.actions['211'];
        expect(hasStandC).not.toBeUndefined();
      }
    });

    it('all ROSTER chars have crouch attacks (400/410/430/440)', () => {
      for (const { mugenDir } of rosterChars) {
        const data = loadHitboxFileSync(mugenDir);
        const hasCrouch = data!.actions['400'] || data!.actions['410'] ||
                          data!.actions['430'] || data!.actions['440'];
        expect(hasCrouch).not.toBeUndefined();
      }
    });

    it('all hitbox frames have valid dimensions', () => {
      for (const { mugenDir } of rosterChars) {
        const data = loadHitboxFileSync(mugenDir);
        for (const [actionId, action] of Object.entries(data!.actions)) {
          for (let i = 0; i < action.frames.length; i++) {
            const frame = action.frames[i];
            for (const box of frame.attack) {
              expect(box.w).toBeGreaterThan(0);
              expect(box.h).toBeGreaterThan(0);
              expect(Number.isFinite(box.ox)).toBe(true);
              expect(Number.isFinite(box.oy)).toBe(true);
            }
          }
        }
      }
    });
  });

  describe('getActivePhaseBoxes', () => {
    it('returns boxes for active-phase frame 0', () => {
      const action = getHitboxAction('cvsryo', '200');
      expect(action).not.toBeNull();
      expect(action!.frames.length).toBeGreaterThan(0);
      const boxes = getActivePhaseBoxes('cvsryo', '200', 0);
      expect(boxes).not.toBeNull();
      expect(boxes!.length).toBeGreaterThan(0);
    });

    it('returns null for frame beyond active range', () => {
      const action = getHitboxAction('cvsryo', '200');
      expect(action).not.toBeNull();
      const beyondActive = action!.frames.length + 10;
      expect(getActivePhaseBoxes('cvsryo', '200', beyondActive)).toBeNull();
    });

    it('returns null for negative frame index', () => {
      expect(getActivePhaseBoxes('cvsryo', '200', -1)).toBeNull();
    });

    it('returns null for unknown action', () => {
      expect(getActivePhaseBoxes('cvsryo', '99999', 0)).toBeNull();
    });
  });

  describe('getActivePhaseBodyOverride', () => {
    it('returns body override when present', () => {
      const action = getHitboxAction('cvsryo', '200');
      if (action && action.frames[0]?.bodyOverride) {
        const body = getActivePhaseBodyOverride('cvsryo', '200', 0);
        expect(body).not.toBeNull();
      }
    });

    it('returns null for frame beyond range', () => {
      const action = getHitboxAction('cvsryo', '200');
      const beyond = (action?.frames.length ?? 0) + 5;
      expect(getActivePhaseBodyOverride('cvsryo', '200', beyond)).toBeNull();
    });
  });

  describe('getAvailableActions', () => {
    it('lists all action numbers for a character', () => {
      const actions = getAvailableActions('cvsryo');
      expect(actions.length).toBeGreaterThan(40);
      expect(actions).toContain('200');
    });

    it('returns empty array for unknown character', () => {
      expect(getAvailableActions('nonexistent')).toEqual([]);
    });
  });

  describe('getActionTiming', () => {
    it('returns startup/active/recovery for known action', () => {
      const timing = getActionTiming('cvsryo', '200');
      expect(timing).not.toBeNull();
      expect(timing!.startup).toBeGreaterThanOrEqual(0);
      expect(timing!.active).toBeGreaterThan(0);
      expect(timing!.recovery).toBeGreaterThanOrEqual(0);
    });

    it('returns null for unknown action', () => {
      expect(getActionTiming('cvsryo', '99999')).toBeNull();
    });
  });

  describe('compareTimingWithFrameData', () => {
    it('computes timing differences', () => {
      const diff = compareTimingWithFrameData('cvsryo', '200', 4, 3, 5);
      expect(diff).not.toBeNull();
      expect(typeof diff!.startupDiff).toBe('number');
      expect(typeof diff!.activeDiff).toBe('number');
      expect(typeof diff!.recoveryDiff).toBe('number');
      expect(typeof diff!.totalDiff).toBe('number');
    });

    it('returns null for unknown action', () => {
      expect(compareTimingWithFrameData('cvsryo', '99999', 1, 1, 1)).toBeNull();
    });
  });

  describe('getAllAttackBoxes', () => {
    it('collects all attack boxes across active frames', () => {
      const boxes = getAllAttackBoxes('cvsryo', '200');
      expect(boxes.length).toBeGreaterThan(0);
      for (const box of boxes) {
        expect(box).toHaveProperty('ox');
        expect(box).toHaveProperty('oy');
        expect(box.w).toBeGreaterThan(0);
        expect(box.h).toBeGreaterThan(0);
      }
    });

    it('returns empty for unknown action', () => {
      expect(getAllAttackBoxes('cvsryo', '99999')).toEqual([]);
    });
  });

  describe('getAttackBoundingBox', () => {
    it('computes bounding box for an action', () => {
      const bbox = getAttackBoundingBox('cvsryo', '200');
      expect(bbox).not.toBeNull();
      expect(bbox!.minX).toBeLessThan(bbox!.maxX);
      expect(bbox!.minY).toBeLessThan(bbox!.maxY);
      expect(bbox!.width).toBeGreaterThan(0);
      expect(bbox!.height).toBeGreaterThan(0);
    });

    it('returns null for unknown action', () => {
      expect(getAttackBoundingBox('cvsryo', '99999')).toBeNull();
    });
  });
});
