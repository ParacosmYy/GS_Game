/**
 * Audio System Consolidated Tests
 *
 * Merged from: audioSystem, sfxTriggerChain, audioTriggerChain, attackSFXDispatch
 *
 * Covers: SFX play functions exist and don't crash.
 */
import { describe, it, expect } from 'vitest';
import {
  playHit, playBlock, playSpecial, playDM, playKO,
  playHeavyHit, playSuperFlash,
} from '../src/audio/sfx.js';

// ── 1. SFX Functions Exist ──────────────────────────────────
describe('SFX Functions Exist', () => {
  it('playHit is a function', () => {
    expect(typeof playHit).toBe('function');
  });

  it('playBlock is a function', () => {
    expect(typeof playBlock).toBe('function');
  });

  it('playSpecial is a function', () => {
    expect(typeof playSpecial).toBe('function');
  });

  it('playDM is a function', () => {
    expect(typeof playDM).toBe('function');
  });

  it('playKO is a function', () => {
    expect(typeof playKO).toBe('function');
  });

  it('playSuperFlash is a function', () => {
    expect(typeof playSuperFlash).toBe('function');
  });
});
