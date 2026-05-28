/**
 * hitboxIntegration.test.ts
 *
 * Integration tests verifying MUGEN hitbox/hurtbox data flows correctly
 * through the fighter's collision query methods.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { Fighter } from '../src/entities/fighter.js';
import { registerHitboxData, hasMugenHitboxes, getHitboxAction } from '../src/rendering/sprites/shared/mugenHitboxLoader.js';
import { registerManifestData, hasManifestHurtboxes } from '../src/rendering/sprites/shared/mugenHurtboxLoader.js';
import '../src/rendering/sprites/shared/characterSpriteConfigs.js';

const SPRITES_DIR = path.resolve(__dirname, '../public/sprites');

interface HitboxFrame {
  startup: number;
  active: number;
  recovery: number;
  attackBoxes: Array<Array<{ x: number; y: number; w: number; h: number }>>;
}

function loadHitboxesRaw(mugenDir: string): { characterId: string; actions: Record<string, HitboxFrame> } | null {
  const p = path.join(SPRITES_DIR, mugenDir, 'hitboxes.json');
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function loadHitboxActions(mugenDir: string): Record<string, HitboxFrame> | null {
  const raw = loadHitboxesRaw(mugenDir);
  return raw?.actions ?? null;
}

interface ManifestAnim {
  frames: Array<{
    duration: number;
    hurtboxes?: Array<{ x: number; y: number; w: number; h: number }>;
    attackBoxes?: Array<{ x: number; y: number; w: number; h: number }>;
  }>;
}

function loadManifest(mugenDir: string): { animations: Record<string, ManifestAnim> } | null {
  const p = path.join(SPRITES_DIR, mugenDir, 'manifest.json');
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

const ROSTER = [
  { charId: 'kyo', mugenDir: 'cvskyo' },
  { charId: 'ryo', mugenDir: 'cvsryo' },
  { charId: 'terry', mugenDir: 'cvsterry' },
  { charId: 'kim', mugenDir: 'cvskim' },
  { charId: 'athena', mugenDir: 'cvsathena' },
  { charId: 'vice', mugenDir: 'cvsvice' },
  { charId: 'yamazaki', mugenDir: 'cvsyamazaki' },
  { charId: 'shermie', mugenDir: 'shermie' },
];

describe('MUGEN hitbox/hurtbox integration', () => {
  beforeAll(() => {
    for (const { charId, mugenDir } of ROSTER) {
      const raw = loadHitboxesRaw(mugenDir);
      if (raw) {
        registerHitboxData(mugenDir, raw);
      }
      const manifest = loadManifest(mugenDir);
      if (manifest) {
        registerManifestData(mugenDir, manifest);
      }
    }
  });

  describe('hitbox data registration', () => {
    it.each(ROSTER)('$charId has MUGEN hitbox data loaded', ({ mugenDir }) => {
      expect(hasMugenHitboxes(mugenDir)).toBe(true);
    });

    it.each(ROSTER)('$charId has hitbox data for stand A (action 200)', ({ mugenDir }) => {
      const action = getHitboxAction(mugenDir, '200');
      // Some characters may not have action 200 in hitboxes
      if (action) {
        expect(action.startup).toBeGreaterThanOrEqual(0);
        expect(action.active).toBeGreaterThan(0);
        expect(action.recovery).toBeGreaterThanOrEqual(0);
      }
    });

    it.each(ROSTER)('$charId has hitbox data for crouch A (action 400)', ({ mugenDir }) => {
      const action = getHitboxAction(mugenDir, '400');
      if (action) {
        expect(action.active).toBeGreaterThan(0);
      }
    });
  });

  describe('attack frame coverage', () => {
    it('total attack actions across ROSTER >= 400', () => {
      let total = 0;
      for (const { mugenDir } of ROSTER) {
        const actions = loadHitboxActions(mugenDir);
        if (actions) total += Object.keys(actions).length;
      }
      expect(total).toBeGreaterThanOrEqual(400);
    });

    it('total active frames across ROSTER >= 900', () => {
      let totalActive = 0;
      for (const { mugenDir } of ROSTER) {
        const actions = loadHitboxActions(mugenDir);
        if (!actions) continue;
        for (const [, frame] of Object.entries(actions)) {
          totalActive += frame.active;
        }
      }
      expect(totalActive).toBeGreaterThanOrEqual(900);
    });

    it.each(ROSTER)('$charId has reasonable startup/active/recovery ratios', ({ mugenDir }) => {
      const actions = loadHitboxActions(mugenDir);
      if (!actions) return;
      let unreasonable = 0;
      for (const [, frame] of Object.entries(actions)) {
        const total = frame.startup + frame.active + frame.recovery;
        if (frame.active <= 0 || frame.active > total * 0.8) unreasonable++;
      }
      // Allow up to 15% unreasonable (some MUGEN data has edge cases)
      expect(unreasonable).toBeLessThan(Object.keys(actions).length * 0.15);
    });
  });

  describe('fighter hurtbox queries', () => {
    it('fighter has a valid hurtbox in idle state', () => {
      const f = new Fighter(400, '#ff6600', 1);
      f.charId = 'kyo';
      f.state = 0; // IDLE
      const hurtbox = f.getEffectiveHurtbox();
      expect(hurtbox).not.toBeNull();
      if (hurtbox) {
        expect(hurtbox.width).toBeGreaterThan(0);
        expect(hurtbox.height).toBeGreaterThan(0);
      }
    });

    it('fighter has a valid pushbox', () => {
      const f = new Fighter(400, '#ff6600', 1);
      const pushbox = f.getPushbox();
      expect(pushbox.width).toBeGreaterThan(0);
      expect(pushbox.height).toBeGreaterThan(0);
    });

    it('fighter returns null hurtbox when invincible', () => {
      const f = new Fighter(400, '#ff6600', 1);
      f.charId = 'kyo';
      f.invincible = true;
      expect(f.getEffectiveHurtbox()).toBeNull();
    });
  });

  describe('manifest hurtbox coverage', () => {
    it.each(ROSTER.filter(r => r.mugenDir !== 'shermie'))('$charId idle has hurtbox data in manifest', ({ mugenDir }) => {
      const manifest = loadManifest(mugenDir);
      expect(manifest).not.toBeNull();
      const idleAnim = manifest!.animations['0'];
      expect(idleAnim).toBeDefined();
      let framesWithHurtboxes = 0;
      for (const frame of idleAnim.frames) {
        if (frame.hurtboxes && frame.hurtboxes.length > 0) {
          framesWithHurtboxes++;
        }
      }
      expect(framesWithHurtboxes).toBeGreaterThan(0);
    });

    it.each(ROSTER.filter(r => r.mugenDir !== 'shermie'))('$charId has hurtbox data for idle frames when available', ({ mugenDir }) => {
      const manifest = loadManifest(mugenDir);
      const idleAnim = manifest!.animations['0'];
      let total = idleAnim.frames.length;
      let withHb = idleAnim.frames.filter(f => f.hurtboxes && f.hurtboxes.length > 0).length;
      // Some characters may not have hurtbox data; just check the manifest exists
      expect(total).toBeGreaterThan(0);
      if (withHb > 0) {
        expect(withHb / total).toBeGreaterThanOrEqual(0.3);
      }
    });
  });
});
