/**
 * animStateSyncIntegration.test.ts
 *
 * Integration tests for animStateSync with real manifest data.
 * Validates that frame durations from actual manifests are correctly
 * registered and resolved for all ROSTER characters.
 */

import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  registerAnimDurations,
  getAnimInfo,
  resolveFrameIndex,
  getFrameDuration,
  getTotalAnimDuration,
  getRegisteredActions,
  clearAnimCache,
  getFrameTickRange,
  getAnimStats,
} from '../src/rendering/sprites/shared/animStateSync.js';
import { FighterState, AttackType } from '../src/core/types.js';

// Ensure character configs are registered
import '../src/rendering/sprites/shared/characterSpriteConfigs.js';

const SPRITES_DIR = path.resolve(__dirname, '../public/sprites');

interface ManifestAnim {
  frames: Array<{ duration: number }>;
}

function loadManifest(mugenDir: string): { animations: Record<string, ManifestAnim> } | null {
  const p = path.join(SPRITES_DIR, mugenDir, 'manifest.json');
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function registerFromManifest(charId: string, mugenDir: string): number {
  const manifest = loadManifest(mugenDir);
  if (!manifest) return 0;

  const loopingActions = new Set(['0', '5', '11', '20', '21', '100', '105', '120', '181']);
  let count = 0;

  for (const [actionId, anim] of Object.entries(manifest.animations)) {
    const durations = anim.frames.map((f: { duration: number }) => f.duration);
    registerAnimDurations(charId, actionId, durations, loopingActions.has(actionId));
    count++;
  }

  return count;
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

/**
 * Register all ROSTER manifest data. Called in each describe block's beforeAll
 * to ensure data isolation between test groups.
 */
function registerAllRoster(): void {
  clearAnimCache();
  for (const { charId, mugenDir } of ROSTER) {
    registerFromManifest(charId, mugenDir);
  }
}

describe('animStateSync integration', () => {
  describe('real manifest registration', () => {
    beforeAll(registerAllRoster);

    it.each(ROSTER)('$charId has registered animations from manifest', ({ charId }) => {
      const actions = getRegisteredActions(charId);
      expect(actions.length).toBeGreaterThan(100);
    });

    it.each(ROSTER)('$charId idle animation has correct frame count', ({ charId }) => {
      const info = getAnimInfo(charId, '0');
      expect(info).not.toBeNull();
      expect(info!.frameDurations.length).toBeGreaterThan(5);
      expect(info!.totalDuration).toBeGreaterThan(0);
      expect(info!.looping).toBe(true);
    });

    it.each(ROSTER)('$charId stand A (action 200) has registered durations', ({ charId }) => {
      const info = getAnimInfo(charId, '200');
      expect(info).not.toBeNull();
      expect(info!.frameDurations.length).toBeGreaterThan(0);
    });

    it.each(ROSTER)('$charId walk has registered durations', ({ charId }) => {
      const info = getAnimInfo(charId, '20');
      expect(info).not.toBeNull();
    });

    it.each(ROSTER)('$charId crouch has registered durations', ({ charId }) => {
      const info = getAnimInfo(charId, '11');
      expect(info).not.toBeNull();
    });
  });

  describe('MUGEN -1 duration normalization', () => {
    // These tests use isolated charIds that don't interfere with ROSTER data
    it('normalizes -1 durations to previous frame value', () => {
      registerAnimDurations('normtest', '999', [5, -1, -1, 10, -1]);
      const info = getAnimInfo('normtest', '999');
      expect(info!.frameDurations).toEqual([5, 5, 5, 10, 10]);
      expect(info!.totalDuration).toBe(35);
    });

    it('normalizes leading -1 to default 4', () => {
      registerAnimDurations('normtest', '998', [-1, -1, 6]);
      const info = getAnimInfo('normtest', '998');
      expect(info!.frameDurations).toEqual([4, 4, 6]);
      expect(info!.totalDuration).toBe(14);
    });

    it('handles all -1 durations', () => {
      registerAnimDurations('normtest', '997', [-1, -1, -1]);
      const info = getAnimInfo('normtest', '997');
      expect(info!.frameDurations).toEqual([4, 4, 4]);
    });

    it('handles empty durations array', () => {
      registerAnimDurations('normtest', '996', []);
      const info = getAnimInfo('normtest', '996');
      expect(info!.frameDurations).toEqual([]);
      expect(info!.totalDuration).toBe(0);
    });
  });

  describe('normalized real manifest data', () => {
    beforeAll(registerAllRoster);

    it.each(ROSTER)('$charId has all positive frame durations after normalization', ({ charId }) => {
      const actions = getRegisteredActions(charId);
      for (const actionId of actions.slice(0, 50)) {
        const info = getAnimInfo(charId, actionId);
        expect(info).not.toBeNull();
        for (let i = 0; i < info!.frameDurations.length; i++) {
          expect(info!.frameDurations[i]).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('idle animation frame advancement', () => {
    beforeAll(registerAllRoster);

    it.each(ROSTER)('$charId frame 0 at tick 0', ({ charId }) => {
      const result = resolveFrameIndex(charId, FighterState.IDLE, null, 0, 1, 0, 0, 'none');
      expect(result.actionNumber).toBe('0');
      expect(result.frameIndex).toBe(0);
    });

    it.each(ROSTER)('$charId advances to frame 1 after first duration', ({ charId }) => {
      const info = getAnimInfo(charId, '0');
      expect(info).not.toBeNull();
      const result = resolveFrameIndex(charId, FighterState.IDLE, null, 0, 1, info!.frameDurations[0], 0, 'none');
      expect(result.frameIndex).toBe(1);
    });

    it.each(ROSTER)('$charId wraps around after full cycle', ({ charId }) => {
      const info = getAnimInfo(charId, '0');
      expect(info).not.toBeNull();
      const result = resolveFrameIndex(charId, FighterState.IDLE, null, 0, 1, info!.totalDuration, 0, 'none');
      expect(result.frameIndex).toBe(0);
    });
  });

  describe('frame tick range queries', () => {
    beforeAll(registerAllRoster);

    it.each(ROSTER.slice(0, 4))('$charId idle frame 0 starts at tick 0', ({ charId }) => {
      const range = getFrameTickRange(charId, '0', 0);
      expect(range).not.toBeNull();
      expect(range!.start).toBe(0);
      expect(range!.end).toBeGreaterThan(0);
    });

    it.each(ROSTER.slice(0, 4))('$charId idle frame 1 starts after frame 0', ({ charId }) => {
      const range0 = getFrameTickRange(charId, '0', 0);
      const range1 = getFrameTickRange(charId, '0', 1);
      expect(range0).not.toBeNull();
      expect(range1).not.toBeNull();
      expect(range1!.start).toBe(range0!.end);
    });

    it('returns null for out-of-range frame index', () => {
      expect(getFrameTickRange('kyo', '0', 999)).toBeNull();
    });

    it('returns null for negative frame index', () => {
      expect(getFrameTickRange('kyo', '0', -1)).toBeNull();
    });

    it('returns null for unknown action', () => {
      expect(getFrameTickRange('kyo', '99999', 0)).toBeNull();
    });
  });

  describe('animation statistics', () => {
    beforeAll(registerAllRoster);

    it.each(ROSTER)('$charId has comprehensive animation stats', ({ charId }) => {
      const stats = getAnimStats(charId);
      expect(stats.totalActions).toBeGreaterThan(100);
      expect(stats.totalFrames).toBeGreaterThan(500);
      expect(stats.totalDuration).toBeGreaterThan(3000);
      expect(stats.avgFrameDuration).toBeGreaterThan(0);
      expect(stats.loopingActions).toBeGreaterThan(0);
    });

    it('returns empty stats for unknown character', () => {
      const stats = getAnimStats('nonexistent');
      expect(stats.totalActions).toBe(0);
      expect(stats.totalFrames).toBe(0);
      expect(stats.totalDuration).toBe(0);
    });
  });

  describe('total animation coverage', () => {
    beforeAll(registerAllRoster);

    it('total registered actions across ROSTER >= 3000', () => {
      let total = 0;
      for (const { charId } of ROSTER) {
        total += getRegisteredActions(charId).length;
      }
      expect(total).toBeGreaterThanOrEqual(3000);
    });

    it('total animation frames across ROSTER >= 15000', () => {
      let totalFrames = 0;
      for (const { charId } of ROSTER) {
        const actions = getRegisteredActions(charId);
        for (const actionId of actions) {
          const info = getAnimInfo(charId, actionId);
          if (info) totalFrames += info.frameDurations.length;
        }
      }
      expect(totalFrames).toBeGreaterThanOrEqual(15000);
    });

    it('total animation duration across ROSTER >= 30000 ticks', () => {
      let totalDuration = 0;
      for (const { charId } of ROSTER) {
        const actions = getRegisteredActions(charId);
        for (const actionId of actions) {
          const info = getAnimInfo(charId, actionId);
          if (info) totalDuration += info.totalDuration;
        }
      }
      expect(totalDuration).toBeGreaterThanOrEqual(30000);
    });
  });

  describe('attack animation resolution', () => {
    beforeAll(registerAllRoster);

    it.each(ROSTER.slice(0, 4))('$charId resolves stand A attack to action 200', ({ charId }) => {
      const result = resolveFrameIndex(charId, FighterState.STAND_ATTACK, AttackType.CLOSE_A, 0, 1, 0, 0, 'startup');
      expect(result.actionNumber).toBe('200');
      expect(result.frameIndex).toBe(0);
    });

    it.each(ROSTER.slice(0, 4))('$charId resolves crouch A attack to action 400', ({ charId }) => {
      const result = resolveFrameIndex(charId, FighterState.CROUCH_ATTACK, AttackType.CROUCH_A, 0, 1, 0, 0, 'startup');
      expect(result.actionNumber).toBe('400');
    });

    it.each(ROSTER.slice(0, 4))('$charId resolves hitstun to action 5000', ({ charId }) => {
      const result = resolveFrameIndex(charId, FighterState.HITSTUN, null, 0, 1, 0, 0, 'none');
      expect(result.actionNumber).toBe('5000');
    });

    it.each(ROSTER.slice(0, 4))('$charId resolves run to action 100', ({ charId }) => {
      const result = resolveFrameIndex(charId, FighterState.RUN, null, 1, 1, 0, 0, 'none');
      expect(result.actionNumber).toBe('100');
    });
  });
});
