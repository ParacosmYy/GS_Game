/**
 * Frame Contract ↔ Animation Manifest cross-validation
 *
 * Verifies that the populated Frame Contract and the Animation Manifest
 * are aligned on frame counts, timing, and phase data for Ryo's actions.
 */
import { describe, it, expect } from 'vitest';
import { RYO_ACTION_CONTRACTS } from '../src/core/ryoFrameContract.js';
import { ANIMATION_MANIFEST } from '../src/core/animationManifestData.js';
import { FRAME_DATA } from '../src/core/frameDataConstants.js';

const ryoManifest = ANIMATION_MANIFEST.characters.ryo;

describe('Frame Contract ↔ Animation Manifest alignment', () => {
  const sharedActions = [
    { action: 'idle', anim: 'idle' },
    { action: 'walk_forward', anim: 'walk_forward' },
    { action: 'walk_backward', anim: 'walk_backward' },
    { action: 'stand_a', anim: 'stand_a' },
    { action: 'stand_c', anim: 'stand_c' },
    { action: 'hurt', anim: 'hitstun' },
    { action: 'knockdown', anim: 'knockdown' },
    { action: 'ryo_koou', anim: 'ryo_koou' },
    { action: 'ryo_ko_hou', anim: 'ryo_ko_hou' },
    { action: 'dm_ten_ha_ou', anim: 'dm_ten_ha_ou' },
  ];

  for (const { action, anim } of sharedActions) {
    describe(`${action}`, () => {
      it('exists in both Frame Contract and Animation Manifest', () => {
        const fc = RYO_ACTION_CONTRACTS.get(action);
        const seq = ryoManifest?.sequences[anim];
        expect(fc, `Frame Contract missing ${action}`).toBeDefined();
        expect(seq, `Animation Manifest missing ${anim}`).toBeDefined();
      });

      it('Frame Contract frame count is reasonable vs Animation Manifest', () => {
        const fc = RYO_ACTION_CONTRACTS.get(action);
        const seq = ryoManifest?.sequences[anim];
        if (!fc || !seq) return;
        // Frame counts may differ (Frame Contract uses actual animation data,
        // Animation Manifest uses auto-generated from FRAME_DATA).
        // Both should be > 0 and within reasonable range of each other.
        expect(fc.frames.length).toBeGreaterThan(0);
        expect(seq.frames.length).toBeGreaterThan(0);
        // Frame Contract total should be >= animation manifest frames
        // (FC has full startup+active+recovery, AM may have compressed frames)
        expect(fc.frames.length).toBeGreaterThanOrEqual(seq.frames.length);
      });

      it('Frame Contract startup+active+recovery total matches frame count', () => {
        const fc = RYO_ACTION_CONTRACTS.get(action);
        if (!fc) return;
        if (fc.startup === 0 && fc.active === 0 && fc.recovery === 0) return;
        expect(fc.totalFrames).toBe(fc.startup + fc.active + fc.recovery);
        expect(fc.frames.length).toBe(fc.totalFrames);
      });
    });
  }

  it('Frame Contract startup/active/recovery match FRAME_DATA for all attacks', () => {
    const mismatches: string[] = [];
    for (const [actionId, contract] of RYO_ACTION_CONTRACTS) {
      if (!contract.attackType) continue;
      const fd = (FRAME_DATA as any)[contract.attackType as string];
      if (!fd) continue;
      if (contract.startup !== fd.startup) {
        mismatches.push(`${actionId}: startup fc=${contract.startup} fd=${fd.startup}`);
      }
      if (contract.active !== fd.active) {
        mismatches.push(`${actionId}: active fc=${contract.active} fd=${fd.active}`);
      }
      if (contract.recovery !== fd.recovery) {
        mismatches.push(`${actionId}: recovery fc=${contract.recovery} fd=${fd.recovery}`);
      }
    }
    expect(mismatches, `Alignment issues:\n${mismatches.join('\n')}`).toEqual([]);
  });

  it('Animation Manifest cancel frames fall within Frame Contract totalFrames', () => {
    for (const { action, anim } of sharedActions) {
      const fc = RYO_ACTION_CONTRACTS.get(action);
      const seq = ryoManifest?.sequences[anim];
      if (!fc || !seq) continue;
      for (const cf of seq.cancelFrames) {
        expect(cf, `${action} cancel frame ${cf} >= totalFrames ${fc.totalFrames}`).toBeLessThan(fc.totalFrames);
      }
    }
  });
});
