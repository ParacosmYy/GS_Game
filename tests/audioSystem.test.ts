/**
 * Audio System Tests — SFX rendering, BGM generation, sampler integrity
 *
 * Tests verify that:
 * - All SampleId entries can be pre-rendered without crashing
 * - New SFX renderers produce valid AudioBuffer with reasonable duration
 * - BGM generation returns valid AudioBuffer
 * - Public play functions do not crash
 * - SampleId union type is complete
 * - Buffer structure is correct (mono, valid sampleRate, non-zero length)
 */
import { describe, it, expect, beforeAll, vi } from 'vitest';

// ─── AudioContext polyfill for Node.js test env ───

class MockAudioBuffer {
  readonly length: number;
  readonly sampleRate: number;
  readonly numberOfChannels: number;
  private channelData: Float32Array[];

  constructor(channels: number, length: number, sampleRate: number) {
    this.numberOfChannels = channels;
    this.length = length;
    this.sampleRate = sampleRate;
    this.channelData = [];
    for (let c = 0; c < channels; c++) {
      this.channelData.push(new Float32Array(length));
    }
  }

  getChannelData(channel: number): Float32Array {
    if (channel >= 0 && channel < this.channelData.length) {
      return this.channelData[channel];
    }
    return new Float32Array(0);
  }
}

class MockAudioNode {
  connect(_dest: unknown): unknown { return _dest; }
  disconnect(): void {}
}

class MockGainNode extends MockAudioNode {
  gain = { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() };
}

class MockBiquadFilterNode extends MockAudioNode {
  type: BiquadFilterType = 'lowpass';
  frequency = { value: 1000 };
  Q = { value: 1 };
  gain = { value: 0 };
}

class MockDynamicsCompressorNode extends MockAudioNode {
  threshold = { value: -24 };
  ratio = { value: 4 };
  attack = { value: 0.003 };
  release = { value: 0.25 };
}

class MockOscillatorNode extends MockAudioNode {
  type: OscillatorType = 'sine';
  frequency = { value: 440, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() };
  start = vi.fn();
  stop = vi.fn();
}

class MockBufferSourceNode extends MockAudioNode {
  buffer: AudioBuffer | null = null;
  playbackRate = { value: 1 };
  start = vi.fn();
  stop = vi.fn();
}

class MockConvolverNode extends MockAudioNode {
  buffer: AudioBuffer | null = null;
}

class MockAudioContext {
  sampleRate = 44100;
  currentTime = 0;
  destination = new MockAudioNode();

  createBuffer(channels: number, length: number, sampleRate: number): AudioBuffer {
    return new MockAudioBuffer(channels, length, sampleRate) as unknown as AudioBuffer;
  }

  createBufferSource(): BufferSourceNode {
    return new MockBufferSourceNode() as unknown as BufferSourceNode;
  }

  createGain(): GainNode {
    return new MockGainNode() as unknown as GainNode;
  }

  createOscillator(): OscillatorNode {
    return new MockOscillatorNode() as unknown as OscillatorNode;
  }

  createBiquadFilter(): BiquadFilterNode {
    return new MockBiquadFilterNode() as unknown as BiquadFilterNode;
  }

  createDynamicsCompressor(): DynamicsCompressorNode {
    return new MockDynamicsCompressorNode() as unknown as DynamicsCompressorNode;
  }

  createConvolver(): ConvolverNode {
    return new MockConvolverNode() as unknown as ConvolverNode;
  }

  close(): void {}
}

// Install the polyfill before any imports use AudioContext
(globalThis as Record<string, unknown>).AudioContext = MockAudioContext;
import {
  initSampler,
  _getSamples,
  type SampleId,
  getBattleBGM,
  playHit,
  playHeavyHit,
  playBlock,
  playSpecial,
  playDM,
  playKO,
  playSuperFlash,
  playCounter,
  playGuardCrush,
  playChip,
  playWallBounce,
  playCancel,
  playWire,
  playJuggleHit,
  playThrow,
  playThrowEscape,
  playSelect,
  playVictoryFanfare,
  playRoll,
  playLanding,
  playProjectileLaunch,
  playMAXActivation,
  playRoundCall,
  playTimeOver,
  playPerfect,
  playFight,
  playQuickStand,
  playStep,
  playCritHit,
  playDust,
  playAirHit,
  playWallBounceHeavy,
  playGuardBreak,
  playChargeUp,
  playBlockSpecial,
  playBlockDM,
  playSpecialLight,
  playSpecialHeavy,
  playKOHit,
  playLandingHeavy,
  playHitAccent,
  playHeavyLanding,
  playDizzyHit,
  playGroundBounce,
  playPerfectKO,
  playRoundStart,
  playTimeUp,
} from '../src/audio/sampler.js';

// ─── Expected SampleId list (source of truth for completeness test) ───

const EXPECTED_SAMPLE_IDS: SampleId[] = [
  'hit_light', 'hit_heavy', 'block', 'block_heavy',
  'special', 'dm', 'ko', 'counter', 'guard_crush',
  'chip', 'wall_bounce', 'cancel', 'wire', 'juggle',
  'super_flash', 'super_flash_sdm',
  'throw', 'throw_escape', 'select', 'victory',
  'roll', 'landing', 'projectile', 'max_activation',
  'round_call', 'time_over', 'perfect', 'fight',
  'quick_stand', 'step',
  'hit_crit', 'dust', 'air_hit', 'wall_bounce_heavy',
  'guard_break', 'charge_up',
  'block_special', 'block_dm', 'special_light', 'special_heavy',
  'ko_hit', 'landing_heavy',
  'accent_fire', 'accent_purple', 'accent_ice', 'accent_generic',
  'dizzy_hit', 'ground_bounce',
  'perfect_ko', 'round_start', 'time_up',
  'battle_bgm',
];

// ─── Sampler initialization (2 tests) ───

describe('initSampler', () => {
  it('initializes without crashing', () => {
    initSampler();
    const samples = _getSamples();
    expect(samples.size).toBeGreaterThan(0);
  });

  it('is idempotent — calling twice does not duplicate entries', () => {
    initSampler();
    const size1 = _getSamples().size;
    initSampler();
    const size2 = _getSamples().size;
    expect(size1).toBe(size2);
  });
});

// ─── All SampleId completeness (2 tests) ───

describe('SampleId completeness', () => {
  beforeAll(() => { initSampler(); });

  it('every expected SampleId is registered in the sampler', () => {
    const samples = _getSamples();
    for (const id of EXPECTED_SAMPLE_IDS) {
      expect(samples.has(id), `Missing SampleId: ${id}`).toBe(true);
    }
  });

  it('sampler contains exactly the expected number of samples', () => {
    const samples = _getSamples();
    expect(samples.size).toBe(EXPECTED_SAMPLE_IDS.length);
  });
});

// ─── All samples produce valid AudioBuffer (4 tests) ───

describe('AudioBuffer validity', () => {
  beforeAll(() => { initSampler(); });

  it('every registered sample has a non-null AudioBuffer', () => {
    const samples = _getSamples();
    for (const id of EXPECTED_SAMPLE_IDS) {
      const buf = samples.get(id);
      expect(buf, `AudioBuffer null for: ${id}`).not.toBeNull();
      expect(buf, `AudioBuffer undefined for: ${id}`).not.toBeUndefined();
    }
  });

  it('every registered sample has non-zero length', () => {
    const samples = _getSamples();
    for (const id of EXPECTED_SAMPLE_IDS) {
      const buf = samples.get(id)!;
      expect(buf.length, `Zero length for: ${id}`).toBeGreaterThan(0);
    }
  });

  it('every registered sample has exactly 1 channel (mono)', () => {
    const samples = _getSamples();
    for (const id of EXPECTED_SAMPLE_IDS) {
      const buf = samples.get(id)!;
      expect(buf.numberOfChannels, `Wrong channel count for: ${id}`).toBe(1);
    }
  });

  it('every registered sample has valid sampleRate', () => {
    const samples = _getSamples();
    for (const id of EXPECTED_SAMPLE_IDS) {
      const buf = samples.get(id)!;
      expect(buf.sampleRate, `Invalid sampleRate for: ${id}`).toBeGreaterThan(0);
    }
  });
});

// ─── SFX duration sanity checks (3 tests) ───

describe('SFX duration sanity', () => {
  beforeAll(() => { initSampler(); });

  it('short SFX are between 20ms and 250ms', () => {
    const shortIds: SampleId[] = ['hit_light', 'chip', 'step', 'juggle', 'air_hit', 'dust',
      'landing', 'landing_heavy'];
    const samples = _getSamples();
    for (const id of shortIds) {
      const buf = samples.get(id)!;
      const dur = buf.length / buf.sampleRate;
      expect(dur, `${id} duration ${dur}s outside 0.02-0.25s`).toBeGreaterThanOrEqual(0.02);
      expect(dur, `${id} duration ${dur}s outside 0.02-0.25s`).toBeLessThanOrEqual(0.25);
    }
  });

  it('medium SFX are between 100ms and 600ms', () => {
    const medIds: SampleId[] = ['block', 'block_heavy', 'special', 'counter', 'cancel', 'wire',
      'throw', 'select', 'roll', 'projectile', 'round_call', 'fight',
      'block_special', 'block_dm', 'special_light', 'special_heavy', 'round_start'];
    const samples = _getSamples();
    for (const id of medIds) {
      const buf = samples.get(id)!;
      const dur = buf.length / buf.sampleRate;
      expect(dur, `${id} duration ${dur}s outside 0.1-0.6s`).toBeGreaterThanOrEqual(0.1);
      expect(dur, `${id} duration ${dur}s outside 0.1-0.6s`).toBeLessThanOrEqual(0.6);
    }
  });

  it('long SFX are between 300ms and 2000ms', () => {
    const longIds: SampleId[] = ['dm', 'ko', 'victory', 'perfect', 'max_activation',
      'super_flash', 'super_flash_sdm', 'time_over', 'perfect_ko', 'time_up',
      'ko_hit', 'guard_break'];
    const samples = _getSamples();
    for (const id of longIds) {
      const buf = samples.get(id)!;
      const dur = buf.length / buf.sampleRate;
      expect(dur, `${id} duration ${dur}s outside 0.3-2.0s`).toBeGreaterThanOrEqual(0.3);
      expect(dur, `${id} duration ${dur}s outside 0.3-2.0s`).toBeLessThanOrEqual(2.0);
    }
  });
});

// ─── New SFX renderers specific tests (3 tests) ───

describe('New SFX renderers', () => {
  beforeAll(() => { initSampler(); });

  it('perfect_ko duration is in expected range (~1.5s)', () => {
    const buf = _getSamples().get('perfect_ko')!;
    const dur = buf.length / buf.sampleRate;
    expect(dur).toBeGreaterThanOrEqual(1.0);
    expect(dur).toBeLessThanOrEqual(2.0);
  });

  it('round_start duration is in expected range (~0.5s)', () => {
    const buf = _getSamples().get('round_start')!;
    const dur = buf.length / buf.sampleRate;
    expect(dur).toBeGreaterThanOrEqual(0.3);
    expect(dur).toBeLessThanOrEqual(0.7);
  });

  it('time_up duration is in expected range (~0.8s)', () => {
    const buf = _getSamples().get('time_up')!;
    const dur = buf.length / buf.sampleRate;
    expect(dur).toBeGreaterThanOrEqual(0.5);
    expect(dur).toBeLessThanOrEqual(1.2);
  });
});

// ─── BGM generation tests (4 tests) ───

describe('Battle BGM', () => {
  beforeAll(() => { initSampler(); });

  it('getBattleBGM returns a valid AudioBuffer', () => {
    const bgm = getBattleBGM();
    expect(bgm).not.toBeNull();
    expect(bgm!.length).toBeGreaterThan(0);
  });

  it('BGM duration is approximately 8 seconds (4 bars at 120 BPM)', () => {
    const bgm = getBattleBGM()!;
    const dur = bgm.length / bgm.sampleRate;
    // 120 BPM, 4/4, 4 bars = 16 beats = 8 seconds
    expect(dur).toBeGreaterThanOrEqual(7.5);
    expect(dur).toBeLessThanOrEqual(8.5);
  });

  it('BGM is mono (1 channel)', () => {
    const bgm = getBattleBGM()!;
    expect(bgm.numberOfChannels).toBe(1);
  });

  it('BGM buffer length matches duration * sampleRate', () => {
    const bgm = getBattleBGM()!;
    const expectedLen = Math.ceil(bgm.sampleRate * 8);
    expect(bgm.length).toBe(expectedLen);
  });
});

// ─── Improved SFX verification (3 tests) ───

describe('Improved SFX verification', () => {
  beforeAll(() => { initSampler(); });

  it('block (light) duration includes metal ping layers', () => {
    const buf = _getSamples().get('block')!;
    const dur = buf.length / buf.sampleRate;
    // Light block with new metal ping should be ~0.1s
    expect(dur).toBeGreaterThanOrEqual(0.05);
    expect(dur).toBeLessThanOrEqual(0.2);
  });

  it('block_heavy duration is longer due to resonance layers', () => {
    const buf = _getSamples().get('block_heavy')!;
    const dur = buf.length / buf.sampleRate;
    // Heavy block with 80Hz resonance should be >= 0.15s
    expect(dur).toBeGreaterThanOrEqual(0.15);
  });

  it('ko duration is extended with dual explosion layers', () => {
    const buf = _getSamples().get('ko')!;
    const dur = buf.length / buf.sampleRate;
    // v3 KO with dual explosions should be >= 1.0s (extended from original 1.0 to 1.2)
    expect(dur).toBeGreaterThanOrEqual(1.0);
  });
});

// ─── Play functions do not crash (1 test with many assertions) ───

describe('Play functions stability', () => {
  it('all play functions execute without throwing', () => {
    // These may not produce audible output in test env, but should not throw
    expect(() => playHit()).not.toThrow();
    expect(() => playHeavyHit()).not.toThrow();
    expect(() => playBlock(false)).not.toThrow();
    expect(() => playBlock(true)).not.toThrow();
    expect(() => playSpecial()).not.toThrow();
    expect(() => playDM()).not.toThrow();
    expect(() => playKO()).not.toThrow();
    expect(() => playSuperFlash(false)).not.toThrow();
    expect(() => playSuperFlash(true)).not.toThrow();
    expect(() => playCounter()).not.toThrow();
    expect(() => playGuardCrush()).not.toThrow();
    expect(() => playChip()).not.toThrow();
    expect(() => playWallBounce()).not.toThrow();
    expect(() => playCancel()).not.toThrow();
    expect(() => playWire()).not.toThrow();
    expect(() => playJuggleHit(3)).not.toThrow();
    expect(() => playThrow()).not.toThrow();
    expect(() => playThrowEscape()).not.toThrow();
    expect(() => playSelect()).not.toThrow();
    expect(() => playVictoryFanfare()).not.toThrow();
    expect(() => playRoll()).not.toThrow();
    expect(() => playLanding()).not.toThrow();
    expect(() => playProjectileLaunch()).not.toThrow();
    expect(() => playMAXActivation()).not.toThrow();
    expect(() => playRoundCall()).not.toThrow();
    expect(() => playTimeOver()).not.toThrow();
    expect(() => playPerfect()).not.toThrow();
    expect(() => playFight()).not.toThrow();
    expect(() => playQuickStand()).not.toThrow();
    expect(() => playStep()).not.toThrow();
    expect(() => playCritHit()).not.toThrow();
    expect(() => playDust()).not.toThrow();
    expect(() => playAirHit()).not.toThrow();
    expect(() => playWallBounceHeavy()).not.toThrow();
    expect(() => playGuardBreak()).not.toThrow();
    expect(() => playChargeUp()).not.toThrow();
    expect(() => playBlockSpecial()).not.toThrow();
    expect(() => playBlockDM()).not.toThrow();
    expect(() => playSpecialLight()).not.toThrow();
    expect(() => playSpecialHeavy()).not.toThrow();
    expect(() => playKOHit()).not.toThrow();
    expect(() => playLandingHeavy()).not.toThrow();
    expect(() => playHitAccent('kyo')).not.toThrow();
    expect(() => playHitAccent('iori')).not.toThrow();
    expect(() => playHitAccent('kula')).not.toThrow();
    expect(() => playHitAccent('ry', true)).not.toThrow();
    expect(() => playHeavyLanding()).not.toThrow();
    expect(() => playDizzyHit()).not.toThrow();
    expect(() => playGroundBounce()).not.toThrow();
    // New SFX play functions
    expect(() => playPerfectKO()).not.toThrow();
    expect(() => playRoundStart()).not.toThrow();
    expect(() => playTimeUp()).not.toThrow();
  });
});

// ─── Hit accent character mapping (3 tests) ───

describe('Character accent mapping', () => {
  it('fire characters produce fire accent without crashing', () => {
    expect(() => playHitAccent('kyo')).not.toThrow();
    expect(() => playHitAccent('mai')).not.toThrow();
    expect(() => playHitAccent('chris')).not.toThrow();
  });

  it('dark characters produce purple accent without crashing', () => {
    expect(() => playHitAccent('iori')).not.toThrow();
    expect(() => playHitAccent('mature')).not.toThrow();
    expect(() => playHitAccent('vice')).not.toThrow();
  });

  it('unknown characters produce generic accent without crashing', () => {
    expect(() => playHitAccent('ry')).not.toThrow();
    expect(() => playHitAccent('terry')).not.toThrow();
    expect(() => playHitAccent('unknown')).not.toThrow();
  });
});
