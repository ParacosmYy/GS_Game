/**
 * Animation Manifest Data Tests
 *
 * Validates ANIMATION_MANIFEST, getCharacterAnimManifest, REQUIRED_SEQUENCES
 * from src/core/animationManifestData.ts.
 * Checks: manifest structure, per-character sequence completeness,
 * required sequences coverage, frame integrity.
 */
import { describe, it, expect } from 'vitest';
import {
  ANIMATION_MANIFEST,
  getCharacterAnimManifest,
  REQUIRED_SEQUENCES,
} from '../src/core/animationManifestData.js';
import type { AnimSequence, AnimFrame } from '../src/core/animationManifest.js';

// ===== Manifest Structure =====

describe('ANIMATION_MANIFEST structure', () => {
  it('has version 1', () => {
    expect(ANIMATION_MANIFEST.version).toBe(1);
  });

  it('has kyo, iori, ryo characters', () => {
    expect(ANIMATION_MANIFEST.characters.kyo).toBeDefined();
    expect(ANIMATION_MANIFEST.characters.iori).toBeDefined();
    expect(ANIMATION_MANIFEST.characters.ryo).toBeDefined();
  });

  it('each character has charId matching key', () => {
    for (const [charId, charManifest] of Object.entries(ANIMATION_MANIFEST.characters)) {
      expect(charManifest.charId).toBe(charId);
    }
  });
});

// ===== getCharacterAnimManifest =====

describe('getCharacterAnimManifest', () => {
  it('returns kyo manifest', () => {
    const m = getCharacterAnimManifest('kyo');
    expect(m).toBeDefined();
    expect(m!.charId).toBe('kyo');
  });

  it('returns ryo manifest', () => {
    const m = getCharacterAnimManifest('ryo');
    expect(m).toBeDefined();
    expect(m!.charId).toBe('ryo');
  });

  it('returns undefined for unknown character', () => {
    expect(getCharacterAnimManifest('andy')).toBeUndefined();
  });
});

// ===== REQUIRED_SEQUENCES =====

describe('REQUIRED_SEQUENCES', () => {
  it('is a non-empty array', () => {
    expect(REQUIRED_SEQUENCES.length).toBeGreaterThan(0);
  });

  it('contains idle', () => {
    expect(REQUIRED_SEQUENCES).toContain('idle');
  });

  it('contains basic normals', () => {
    expect(REQUIRED_SEQUENCES).toContain('stand_a');
    expect(REQUIRED_SEQUENCES).toContain('stand_c');
    expect(REQUIRED_SEQUENCES).toContain('crouch_a');
    expect(REQUIRED_SEQUENCES).toContain('crouch_d');
  });

  it('contains hitstun and knockdown', () => {
    expect(REQUIRED_SEQUENCES).toContain('hitstun');
    expect(REQUIRED_SEQUENCES).toContain('knockdown');
  });
});

// ===== Per-Character Sequence Validation =====

function validateCharSequences(charId: string) {
  describe(`${charId} sequences`, () => {
    const charManifest = getCharacterAnimManifest(charId)!;
    const sequences = charManifest.sequences;

    it('has sequences', () => {
      expect(Object.keys(sequences).length).toBeGreaterThan(0);
    });

    // Check required sequences
    for (const reqSeq of REQUIRED_SEQUENCES) {
      it(`has required sequence '${reqSeq}'`, () => {
        expect(sequences[reqSeq], `${charId}.${reqSeq}`).toBeDefined();
      });
    }

    // Validate each sequence structure
    for (const [seqName, seq] of Object.entries(sequences)) {
      describe(`${charId}.${seqName}`, () => {
        it('has valid name', () => {
          expect(seq.name).toBe(seqName);
        });

        it('has frames', () => {
          expect(seq.frames.length).toBeGreaterThan(0);
        });

        it('each frame has index and duration > 0', () => {
          for (let i = 0; i < seq.frames.length; i++) {
            const f = seq.frames[i];
            expect(f.duration, `${seqName}[${i}].duration`).toBeGreaterThan(0);
            expect(typeof f.offsetX, `${seqName}[${i}].offsetX`).toBe('number');
            expect(typeof f.offsetY, `${seqName}[${i}].offsetY`).toBe('number');
          }
        });

        it('loop sequences has loop=true', () => {
          if (['idle', 'walk_forward', 'walk_backward'].includes(seqName)) {
            expect(seq.loop, `${seqName}.loop`).toBe(true);
          }
        });

        it('attack sequence has hitboxKey on active frames', () => {
          if (seqName.startsWith('stand_') || seqName.startsWith('crouch_')) {
            const hasHitbox = seq.frames.some(f => f.hitboxKey !== undefined);
            expect(hasHitbox, `${seqName} has at least one frame with hitboxKey`).toBe(true);
          }
        });
      });
    }
  });
}

validateCharSequences('kyo');
validateCharSequences('iori');
validateCharSequences('ryo');

// ===== Cross-Character Consistency =====

describe('Cross-character consistency', () => {
  it('all 3 characters share the same required sequences', () => {
    for (const charId of ['kyo', 'iori', 'ryo']) {
      const m = getCharacterAnimManifest(charId)!;
      for (const req of REQUIRED_SEQUENCES) {
        expect(m.sequences[req], `${charId}.${req} exists`).toBeDefined();
      }
    }
  });

  it('idle sequences are loops with >= 4 frames', () => {
    for (const charId of ['kyo', 'iori', 'ryo']) {
      const idle = getCharacterAnimManifest(charId)!.sequences.idle;
      expect(idle.loop, `${charId}.idle.loop`).toBe(true);
      expect(idle.frames.length, `${charId}.idle.frames`).toBeGreaterThanOrEqual(4);
    }
  });

  it('walk_forward sequences are loops with >= 4 frames', () => {
    for (const charId of ['kyo', 'iori', 'ryo']) {
      const wf = getCharacterAnimManifest(charId)!.sequences.walk_forward;
      expect(wf.loop, `${charId}.walk_forward.loop`).toBe(true);
      expect(wf.frames.length, `${charId}.walk_forward.frames`).toBeGreaterThanOrEqual(4);
    }
  });

  it('hitstun is non-looping', () => {
    for (const charId of ['kyo', 'iori', 'ryo']) {
      const hs = getCharacterAnimManifest(charId)!.sequences.hitstun;
      expect(hs.loop, `${charId}.hitstun.loop`).toBe(false);
    }
  });

  it('knockdown is non-looping', () => {
    for (const charId of ['kyo', 'iori', 'ryo']) {
      const kd = getCharacterAnimManifest(charId)!.sequences.knockdown;
      expect(kd.loop, `${charId}.knockdown.loop`).toBe(false);
    }
  });
});
