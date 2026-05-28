/**
 * Victory Pose Data Regression Tests
 *
 * Validates getVictoryPose() pure function returns correct Pose structures
 * for all character IDs and the default fallback.
 */
import { describe, it, expect } from 'vitest';
import { getVictoryPose } from '../src/rendering/victoryPose.js';

const BODY_PARTS = ['head', 'body', 'armFront', 'armBack', 'legFront', 'legBack'] as const;
const KNOWN_CHARS = ['kyo', 'iori', 'terry', 'kim', 'ryo', 'leona', 'kdash', 'kula', 'robert'];

function validatePose(pose: ReturnType<typeof getVictoryPose>, label: string) {
  for (const part of BODY_PARTS) {
    expect(pose[part], `${label}.${part}`).toBeDefined();
    expect(typeof pose[part].ox, `${label}.${part}.ox`).toBe('number');
    expect(typeof pose[part].oy, `${label}.${part}.oy`).toBe('number');
    expect(typeof pose[part].rot, `${label}.${part}.rot`).toBe('number');
    expect(typeof pose[part].scale, `${label}.${part}.scale`).toBe('number');
    expect(isFinite(pose[part].ox), `${label}.${part}.ox finite`).toBe(true);
    expect(isFinite(pose[part].oy), `${label}.${part}.oy finite`).toBe(true);
    expect(isFinite(pose[part].rot), `${label}.${part}.rot finite`).toBe(true);
    expect(pose[part].scale, `${label}.${part}.scale > 0`).toBeGreaterThan(0);
  }
}

describe('getVictoryPose', () => {
  it('returns a pose with all 6 body parts for each known character', () => {
    for (const charId of KNOWN_CHARS) {
      const pose = getVictoryPose(charId, 0);
      validatePose(pose, charId);
    }
  });

  it('returns a valid pose for unknown character (default)', () => {
    const pose = getVictoryPose('unknown_char', 0);
    validatePose(pose, 'default');
  });

  it('returns a valid pose for empty string', () => {
    const pose = getVictoryPose('', 0);
    validatePose(pose, 'empty');
  });

  it('each known character has a distinct armFront position', () => {
    const positions = KNOWN_CHARS.map(id => {
      const pose = getVictoryPose(id, 0);
      return `${pose.armFront.ox},${pose.armFront.oy}`;
    });
    expect(new Set(positions).size).toBe(KNOWN_CHARS.length);
  });

  it('bounce affects oy values at different ticks', () => {
    const pose0 = getVictoryPose('kyo', 0);
    const pose50 = getVictoryPose('kyo', 50);
    // bounce = sin(tick * 0.08) * 3; at tick=0 bounce=0, at tick=50 bounce!=0
    expect(pose50.head.oy).not.toBe(pose0.head.oy);
  });

  it('bounce is consistent for same tick', () => {
    const a = getVictoryPose('ryo', 100);
    const b = getVictoryPose('ryo', 100);
    expect(a.head.oy).toBe(b.head.oy);
    expect(a.body.oy).toBe(b.body.oy);
  });

  it('kyo has raised arm (armFront.oy is negative)', () => {
    const pose = getVictoryPose('kyo', 0);
    expect(pose.armFront.oy).toBeLessThan(0);
  });

  it('ryo has wide arms (armFront scale > 1)', () => {
    const pose = getVictoryPose('ryo', 0);
    expect(pose.armFront.scale).toBeGreaterThan(1);
  });

  it('default pose has raised arms', () => {
    const pose = getVictoryPose('nonexistent', 0);
    expect(pose.armFront.oy).toBeLessThan(0);
    expect(pose.armBack.oy).toBeLessThan(0);
  });

  it('scale values are reasonable (0.5 to 1.5)', () => {
    for (const charId of KNOWN_CHARS) {
      const pose = getVictoryPose(charId, 0);
      for (const part of BODY_PARTS) {
        expect(pose[part].scale).toBeGreaterThanOrEqual(0.5);
        expect(pose[part].scale).toBeLessThanOrEqual(1.5);
      }
    }
  });

  it('rotation values are in radians range (-PI to PI)', () => {
    for (const charId of KNOWN_CHARS) {
      const pose = getVictoryPose(charId, 0);
      for (const part of BODY_PARTS) {
        expect(Math.abs(pose[part].rot)).toBeLessThanOrEqual(Math.PI);
      }
    }
  });

  it('leg parts have near-zero oy at tick=0 (standing)', () => {
    for (const charId of KNOWN_CHARS) {
      const pose = getVictoryPose(charId, 0);
      expect(Math.abs(pose.legFront.oy)).toBeLessThan(5);
      expect(Math.abs(pose.legBack.oy)).toBeLessThan(5);
    }
  });

  it('terry has symmetric arms at tick=0', () => {
    const pose = getVictoryPose('terry', 0);
    expect(pose.armFront.ox).toBe(-pose.armBack.ox);
    expect(pose.armFront.oy).toBeCloseTo(pose.armBack.oy, 1);
  });
});
