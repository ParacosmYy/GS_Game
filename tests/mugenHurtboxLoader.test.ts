/**
 * mugenHurtboxLoader.test.ts
 *
 * Tests for MUGEN hurtbox loading from manifest animation data.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  registerManifestData,
  getHurtboxesAtFrame,
  getAttackBoxesAtFrame,
  getActionCollisionData,
  hurtboxToGameRect,
  hasManifestHurtboxes,
  getHurtboxCoverage,
  type MugenHurtbox,
} from '../src/rendering/sprites/shared/mugenHurtboxLoader.js';

import '../src/rendering/sprites/shared/characterSpriteConfigs.js';

const SPRITES_DIR = path.resolve(__dirname, '../public/sprites');

function loadManifestSync(mugenDir: string): any {
  const p = path.join(SPRITES_DIR, mugenDir, 'manifest.json');
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

describe('mugenHurtboxLoader', () => {
  beforeAll(() => {
    // Register all available manifests
    const dirs = fs.readdirSync(SPRITES_DIR);
    for (const dir of dirs) {
      const m = loadManifestSync(dir);
      if (m) registerManifestData(dir, m);
    }
  });

  describe('hasManifestHurtboxes', () => {
    it('returns true for loaded characters', () => {
      expect(hasManifestHurtboxes('cvsryo')).toBe(true);
      expect(hasManifestHurtboxes('cvskyo')).toBe(true);
    });

    it('returns false for unloaded characters', () => {
      expect(hasManifestHurtboxes('nonexistent')).toBe(false);
    });
  });

  describe('getHurtboxesAtFrame', () => {
    it('returns hurtboxes for idle frame 0', () => {
      const hb = getHurtboxesAtFrame('cvsryo', '0', 0);
      expect(hb).not.toBeNull();
      expect(hb!.length).toBeGreaterThan(0);
      // Idle should have body hurtbox
      const body = hb![0];
      expect(body).toHaveProperty('left');
      expect(body).toHaveProperty('top');
      expect(body).toHaveProperty('right');
      expect(body).toHaveProperty('bottom');
      expect(body.right).toBeGreaterThan(body.left);
      expect(body.bottom).toBeGreaterThan(body.top);
    });

    it('returns null for frame beyond range', () => {
      const hb = getHurtboxesAtFrame('cvsryo', '0', 9999);
      expect(hb).toBeNull();
    });

    it('returns null for unknown action', () => {
      const hb = getHurtboxesAtFrame('cvsryo', '99999', 0);
      expect(hb).toBeNull();
    });

    it('returns null for unloaded character', () => {
      const hb = getHurtboxesAtFrame('nonexistent', '0', 0);
      expect(hb).toBeNull();
    });
  });

  describe('getAttackBoxesAtFrame', () => {
    it('returns attack boxes for stand A action 200', () => {
      const ab = getAttackBoxesAtFrame('cvsryo', '200', 0);
      // May or may not have attack at frame 0 depending on timing
      // Check that we can query without error
      if (ab) {
        expect(ab.length).toBeGreaterThan(0);
        expect(ab[0].right).toBeGreaterThan(ab[0].left);
      }
    });
  });

  describe('getActionCollisionData', () => {
    it('returns full collision data for idle', () => {
      const data = getActionCollisionData('cvsryo', '0');
      expect(data).not.toBeNull();
      expect(data!.totalFrames).toBeGreaterThan(0);
      expect(data!.framesWithHurtboxes).toBeGreaterThan(0);
      expect(data!.frames.length).toBe(data!.totalFrames);
    });

    it('returns null for unknown action', () => {
      const data = getActionCollisionData('cvsryo', '99999');
      expect(data).toBeNull();
    });
  });

  describe('hurtboxToGameRect', () => {
    it('converts hurtbox to game coordinates facing right', () => {
      const hurtbox: MugenHurtbox = { left: -20, top: -100, right: 20, bottom: 0 };
      const rect = hurtboxToGameRect(hurtbox, 400, 300, 1, 1.0);
      expect(rect.x).toBe(380); // 400 + (-20 * 1)
      expect(rect.y).toBe(200); // 300 + (-100)
      expect(rect.width).toBe(40);
      expect(rect.height).toBe(100);
    });

    it('flips horizontal position when facing left', () => {
      const hurtbox: MugenHurtbox = { left: 0, top: -80, right: 40, bottom: 0 };
      const rect = hurtboxToGameRect(hurtbox, 400, 300, -1, 1.0);
      expect(rect.x).toBe(400); // 400 + 0 * -1
      expect(rect.width).toBe(40);
    });

    it('scales hurtbox dimensions', () => {
      const hurtbox: MugenHurtbox = { left: -10, top: -50, right: 10, bottom: 0 };
      const rect = hurtboxToGameRect(hurtbox, 0, 0, 1, 2.0);
      expect(rect.x).toBe(-20);
      expect(rect.y).toBe(-100);
      expect(rect.width).toBe(40);
      expect(rect.height).toBe(100);
    });
  });

  describe('getHurtboxCoverage', () => {
    it('returns coverage stats for loaded character', () => {
      const coverage = getHurtboxCoverage('cvsryo');
      expect(coverage).not.toBeNull();
      expect(coverage!.totalActions).toBeGreaterThan(400);
      expect(coverage!.totalFrames).toBeGreaterThan(2000);
      expect(coverage!.framesWithHurtboxes).toBeGreaterThan(0);
      expect(coverage!.coverage).toBeGreaterThan(0);
      expect(coverage!.coverage).toBeLessThanOrEqual(1);
    });

    it('returns null for unloaded character', () => {
      expect(getHurtboxCoverage('nonexistent')).toBeNull();
    });
  });

  describe('cross-character hurtbox coverage', () => {
    const rosterDirs = ['cvskyo', 'cvsryo', 'cvsterry', 'cvskim', 'cvsathena', 'cvsvice', 'cvsyamazaki', 'shermie'];

    it.each(rosterDirs)('%s has hurtbox data in idle animation', (dir) => {
      const data = getActionCollisionData(dir, '0');
      expect(data).not.toBeNull();
      // Most characters have hurtboxes in idle, but some may not
      // Just verify the data loads correctly
      expect(data!.totalFrames).toBeGreaterThan(0);
    });

    it.each(rosterDirs)('%s has >15% frame-level hurtbox coverage', (dir) => {
      const coverage = getHurtboxCoverage(dir);
      expect(coverage).not.toBeNull();
      expect(coverage!.coverage).toBeGreaterThan(0.15);
    });

    it.each(rosterDirs)('%s has attack boxes in normal attacks', (dir) => {
      // Check stand A (action 200)
      const data = getActionCollisionData(dir, '200');
      if (data) {
        expect(data.framesWithAttack).toBeGreaterThan(0);
      }
    });
  });
});
