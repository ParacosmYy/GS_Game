/**
 * Announcer -- Formant-synthesis based voice announcement system
 *
 * Uses Web Audio API formant synthesis to produce voice-like tones:
 *   - Sawtooth source oscillator (rich harmonics) shaped by 3 bandpass formant filters
 *   - Per-phrase vowel patterns, pitch contours, and amplitude envelopes
 *   - Convolution reverb (small-room IR) for PA-speaker feel
 *   - Crowd roar on KO events
 *
 * Public API is unchanged: roundStart, fight, knockOut, perfect, timeOver,
 * winner, firstAttack, counter, guardCrush, superCancel, doubleKO,
 * newChallenger, toggle, setEnabled, isEnabled.
 */

import { getCtx } from './audioCtx.js';

// ─── Formant definitions (Hz) ──────────────────────────────────

interface FormantSet {
  f1: number;   // First formant (vowel body)
  f2: number;   // Second formant (vowel character)
  f3: number;   // Third formant (presence/clarity)
  bw1: number;  // Bandwidth for F1
  bw2: number;  // Bandwidth for F2
  bw3: number;  // Bandwidth for F3
}

// Standard vowel formant frequencies (male-like voice)
const VOWEL_AH: FormantSet = { f1: 600, f2: 1100, f3: 2800, bw1: 80, bw2: 100, bw3: 140 };
const VOWEL_EE: FormantSet = { f1: 300, f2: 2200, f3: 3000, bw1: 60, bw2: 120, bw3: 160 };
const VOWEL_OH: FormantSet = { f1: 500, f2: 800,  f3: 2600, bw1: 70, bw2: 90,  bw3: 130 };
const VOWEL_IH: FormantSet = { f1: 350, f2: 2000, f3: 2800, bw1: 60, bw2: 110, bw3: 150 };
const VOWEL_ER: FormantSet = { f1: 500, f2: 1500, f3: 2500, bw1: 70, bw2: 100, bw3: 140 };
const VOWEL_AI: [FormantSet, FormantSet] = [VOWEL_AH, VOWEL_EE];

// ─── Syllable definition ───────────────────────────────────────

interface Syllable {
  vowels: FormantSet | [FormantSet, FormantSet]; // static vowel or diphthong pair
  freq: number;           // Fundamental frequency (Hz)
  duration: number;       // Duration in ms
  gap: number;            // Gap before next syllable in ms
  pitchEnd?: number;      // Ending frequency for pitch contour (omit = static)
  attackMs?: number;      // Attack time in ms (default 8)
  releaseMs?: number;     // Release time in ms (default 30)
  vibrato?: boolean;      // Add slight vibrato (default false)
}

// ─── Phrase definitions ────────────────────────────────────────

// "Round X" -- descending announcement tone, "ah" vowel
function roundNotes(n: number): Syllable[] {
  const baseFreq = 140 + (n - 1) * 12; // slightly higher for later rounds
  return [
    { vowels: VOWEL_AH, freq: baseFreq + 40, duration: 200, gap: 80, pitchEnd: baseFreq, vibrato: true },
    { vowels: VOWEL_AH, freq: baseFreq,      duration: 350, gap: 0,   pitchEnd: baseFreq - 20 },
  ];
}

// "Fight" -- rising pitch, "ai" diphthong
const FIGHT_SYLLABLES: Syllable[] = [
  { vowels: VOWEL_AI, freq: 200, duration: 100, gap: 60, pitchEnd: 260 },
  { vowels: VOWEL_AI, freq: 260, duration: 80,  gap: 60, pitchEnd: 340 },
  { vowels: VOWEL_AI, freq: 340, duration: 350, gap: 0,  pitchEnd: 440, vibrato: true },
];

// "KO" -- low heavy, "oh" vowel
const KO_SYLLABLES: Syllable[] = [
  { vowels: VOWEL_OH, freq: 300, duration: 150, gap: 100, pitchEnd: 220 },
  { vowels: VOWEL_OH, freq: 180, duration: 450, gap: 0,   pitchEnd: 120, vibrato: true },
];

// "Perfect" -- high shimmering, "ih" vowel
const PERFECT_SYLLABLES: Syllable[] = [
  { vowels: VOWEL_IH, freq: 350, duration: 80,  gap: 70, pitchEnd: 400 },
  { vowels: VOWEL_IH, freq: 400, duration: 80,  gap: 70, pitchEnd: 460 },
  { vowels: VOWEL_IH, freq: 460, duration: 80,  gap: 70, pitchEnd: 520 },
  { vowels: VOWEL_IH, freq: 520, duration: 80,  gap: 70, pitchEnd: 600 },
  { vowels: VOWEL_IH, freq: 600, duration: 280, gap: 0,  vibrato: true, releaseMs: 60 },
];

// "Time Over" -- flat, slightly descending, "ah" vowel
const TIME_OVER_SYLLABLES: Syllable[] = [
  { vowels: VOWEL_AH, freq: 180, duration: 130, gap: 100, pitchEnd: 170 },
  { vowels: VOWEL_AH, freq: 170, duration: 130, gap: 100, pitchEnd: 155 },
  { vowels: VOWEL_AH, freq: 155, duration: 280, gap: 0,   pitchEnd: 130 },
];

// "Winner" -- "ih" -> "er" transition
const WINNER_SYLLABLES: Syllable[] = [
  { vowels: VOWEL_IH, freq: 260, duration: 130, gap: 120, pitchEnd: 290 },
  { vowels: VOWEL_ER, freq: 290, duration: 130, gap: 120, pitchEnd: 330 },
  { vowels: VOWEL_ER, freq: 330, duration: 450, gap: 0,   vibrato: true },
];

// "First Attack" -- bright, ascending
const FIRST_ATTACK_SYLLABLES: Syllable[] = [
  { vowels: VOWEL_AH, freq: 440, duration: 100, gap: 100, pitchEnd: 500 },
  { vowels: VOWEL_AH, freq: 580, duration: 300, gap: 0,   vibrato: true },
];

// "Counter" -- quick, punchy
const COUNTER_SYLLABLES: Syllable[] = [
  { vowels: VOWEL_AH, freq: 520, duration: 70,  gap: 60, pitchEnd: 480 },
  { vowels: VOWEL_AH, freq: 480, duration: 70,  gap: 60, pitchEnd: 550 },
  { vowels: VOWEL_AH, freq: 550, duration: 250, gap: 0,  pitchEnd: 500 },
];

// "Guard Crush" -- grinding feel
const GUARD_CRUSH_SYLLABLES: Syllable[] = [
  { vowels: VOWEL_AH, freq: 160, duration: 100, gap: 80, pitchEnd: 200 },
  { vowels: VOWEL_AH, freq: 200, duration: 100, gap: 80, pitchEnd: 300 },
  { vowels: VOWEL_OH, freq: 300, duration: 350, gap: 0,  pitchEnd: 200 },
];

// "Double KO" -- dramatic low
const DOUBLE_KO_SYLLABLES: Syllable[] = [
  { vowels: VOWEL_OH, freq: 300, duration: 120, gap: 100, pitchEnd: 220 },
  { vowels: VOWEL_OH, freq: 200, duration: 120, gap: 100, pitchEnd: 140 },
  { vowels: VOWEL_OH, freq: 120, duration: 450, gap: 0,   pitchEnd: 80 },
];

// "Super Cancel" -- bright ascending flourish
const SUPER_CANCEL_SYLLABLES: Syllable[] = [
  { vowels: VOWEL_IH, freq: 350, duration: 70, gap: 55, pitchEnd: 400 },
  { vowels: VOWEL_IH, freq: 400, duration: 70, gap: 55, pitchEnd: 460 },
  { vowels: VOWEL_IH, freq: 460, duration: 70, gap: 55, pitchEnd: 530 },
  { vowels: VOWEL_IH, freq: 530, duration: 350, gap: 0,  vibrato: true, releaseMs: 50 },
];

// "New Challenger" -- quick rising fanfare
const NEW_CHALLENGER_SYLLABLES: Syllable[] = [
  { vowels: VOWEL_AH, freq: 260, duration: 70, gap: 60, pitchEnd: 300 },
  { vowels: VOWEL_AH, freq: 300, duration: 70, gap: 60, pitchEnd: 350 },
  { vowels: VOWEL_AH, freq: 350, duration: 70, gap: 60, pitchEnd: 410 },
  { vowels: VOWEL_AH, freq: 410, duration: 70, gap: 60, pitchEnd: 480 },
  { vowels: VOWEL_AH, freq: 480, duration: 320, gap: 0,  vibrato: true },
];

// ─── Reverb IR generation ──────────────────────────────────────

function createReverbIR(ctx: AudioContext, durationSec: number, decay: number): AudioBuffer {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * durationSec);
  const buffer = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      const t = i / length;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
    }
  }
  return buffer;
}

// ─── Crowd roar buffer ─────────────────────────────────────────

function createCrowdRoarBuffer(ctx: AudioContext, durationSec: number): AudioBuffer {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * durationSec);
  const buffer = ctx.createBuffer(1, length, rate);
  const data = buffer.getChannelData(0);

  // Layer multiple noise streams at different frequency bands for crowd texture
  // Band 1: 800-1500 Hz (mid crowd)
  // Band 2: 1500-2500 Hz (voices)
  // Band 3: 2500-4000 Hz (cheering high end)
  const attackTime = 0.15;  // seconds
  const sustainEnd = 0.7;   // fraction of duration where sustain holds

  for (let i = 0; i < length; i++) {
    const t = i / rate;
    const frac = i / length;

    // Amplitude envelope: slow attack -> sustain -> medium release
    let env: number;
    if (t < attackTime) {
      env = t / attackTime; // linear attack
    } else if (frac < sustainEnd) {
      env = 1.0;
    } else {
      const releaseFrac = (frac - sustainEnd) / (1 - sustainEnd);
      env = 1.0 - releaseFrac * 0.7; // partial release, still present
    }

    // Combine noise layers
    const noise = (Math.random() * 2 - 1);
    const noise2 = (Math.random() * 2 - 1);
    const noise3 = (Math.random() * 2 - 1);

    // Approximate bandpass by combining filtered noise
    data[i] = (
      noise * 0.4 +    // broad energy
      noise2 * 0.35 +  // mid detail
      noise3 * 0.25    // high sibilance
    ) * env * 0.3;
  }

  // Apply simple lowpass (moving average) to soften high frequencies
  let prev = 0;
  for (let i = 0; i < length; i++) {
    prev = prev * 0.92 + data[i] * 0.08;
    data[i] = data[i] * 0.4 + prev * 0.6;
  }

  return buffer;
}

// ─── Announcer class ───────────────────────────────────────────

export class Announcer {
  private enabled = true;
  private reverbNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private reverbReady = false;
  private crowdRoarBuffer: AudioBuffer | null = null;

  setEnabled(v: boolean): void { this.enabled = v; }

  isEnabled(): boolean { return this.enabled; }

  toggle(): void { this.enabled = !this.enabled; }

  /** Lazily initialize reverb (needs AudioContext runtime) */
  private ensureReverb(): { reverb: ConvolverNode; wet: GainNode; dry: GainNode } | null {
    const ctx = getCtx();
    if (ctx.state === 'suspended') return null;

    if (!this.reverbReady || !this.reverbNode) {
      try {
        const ir = createReverbIR(ctx, 0.6, 2.5);
        this.reverbNode = ctx.createConvolver();
        this.reverbNode.buffer = ir;
        this.reverbGain = ctx.createGain();
        this.reverbGain.gain.value = 0.25; // wet/dry mix
        this.reverbNode.connect(this.reverbGain);
        this.reverbGain.connect(ctx.destination);
        this.reverbReady = true;
      } catch {
        return null;
      }
    }

    // Dry path gain node (caller connects source to this too)
    const dry = ctx.createGain();
    dry.gain.value = 0.75;
    dry.connect(ctx.destination);

    return { reverb: this.reverbNode, wet: this.reverbGain!, dry };
  }

  /** Lazy-init crowd roar buffer */
  private ensureCrowdRoar(): AudioBuffer | null {
    if (!this.crowdRoarBuffer) {
      try {
        const ctx = getCtx();
        if (ctx.state === 'suspended') return null;
        this.crowdRoarBuffer = createCrowdRoarBuffer(ctx, 1.5);
      } catch {
        return null;
      }
    }
    return this.crowdRoarBuffer;
  }

  /**
   * Play a formant-synthesized syllable.
   * Creates sawtooth source -> 3 bandpass formant filters -> gain envelope -> reverb + output.
   */
  private playSyllable(
    syllable: Syllable,
    startTime: number,
    routing: { reverb: ConvolverNode; wet: GainNode; dry: GainNode } | null,
    volume: number,
  ): void {
    const ctx = getCtx();
    const durSec = syllable.duration / 1000;
    const endTime = startTime + durSec;
    const attackSec = (syllable.attackMs ?? 8) / 1000;
    const releaseSec = (syllable.releaseMs ?? 30) / 1000;
    const freqStart = syllable.freq;
    const freqEnd = syllable.pitchEnd ?? syllable.freq;
    const isDiphthong = Array.isArray(syllable.vowels);

    // Source oscillator: sawtooth (rich harmonics for voice)
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freqStart, startTime);
    if (freqEnd !== freqStart) {
      osc.frequency.linearRampToValueAtTime(freqEnd, endTime);
    }

    // Optional vibrato (6Hz, +/-8 cents)
    if (syllable.vibrato) {
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 6;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = freqStart * 0.005; // ~8 cents
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(startTime);
      lfo.stop(endTime + 0.05);
    }

    // Noise layer for breathiness (very quiet, filtered)
    const noiseLen = Math.floor(ctx.sampleRate * durSec);
    const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
    const noiseData = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) noiseData[i] = (Math.random() * 2 - 1);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuf;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = volume * 0.08; // very subtle breath
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = isDiphthong ? (syllable.vowels as [FormantSet, FormantSet])[0].f2 : (syllable.vowels as FormantSet).f2;
    noiseFilter.Q.value = 2;
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);

    // Formant filters
    const vowels = isDiphthong
      ? (syllable.vowels as [FormantSet, FormantSet])
      : [syllable.vowels as FormantSet, syllable.vowels as FormantSet];

    const makeFormant = (f: number, q: number): BiquadFilterNode => {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = f;
      bp.Q.value = f / (q * 2); // Q = center/bandwidth
      return bp;
    };

    const f1 = makeFormant(vowels[0].f1, vowels[0].bw1);
    const f2 = makeFormant(vowels[0].f2, vowels[0].bw2);
    const f3 = makeFormant(vowels[0].f3, vowels[0].bw3);

    // For diphthongs, transition formant frequencies over the syllable duration
    if (isDiphthong) {
      const v = syllable.vowels as [FormantSet, FormantSet];
      f1.frequency.linearRampToValueAtTime(v[1].f1, endTime);
      f2.frequency.linearRampToValueAtTime(v[1].f2, endTime);
      f3.frequency.linearRampToValueAtTime(v[1].f3, endTime);
      f1.Q.linearRampToValueAtTime(v[1].f1 / (v[1].bw1 * 2), endTime);
      f2.Q.linearRampToValueAtTime(v[1].f2 / (v[1].bw2 * 2), endTime);
      f3.Q.linearRampToValueAtTime(v[1].f3 / (v[1].bw3 * 2), endTime);
      // Update noise filter to track f2
      noiseFilter.frequency.linearRampToValueAtTime(v[1].f2, endTime);
    }

    // Per-formant gain (F1 loudest, F2 medium, F3 quiet)
    const g1 = ctx.createGain(); g1.gain.value = 1.0;
    const g2 = ctx.createGain(); g2.gain.value = 0.6;
    const g3 = ctx.createGain(); g3.gain.value = 0.3;

    // Master gain with envelope
    const masterGain = ctx.createGain();
    const sustainStart = Math.min(startTime + attackSec, endTime - releaseSec);
    masterGain.gain.setValueAtTime(0, startTime);
    masterGain.gain.linearRampToValueAtTime(volume, startTime + attackSec);
    masterGain.gain.setValueAtTime(volume, sustainStart);
    masterGain.gain.linearRampToValueAtTime(0, endTime);

    // Wire: osc -> [f1 -> g1, f2 -> g2, f3 -> g3] -> masterGain -> output
    osc.connect(f1); f1.connect(g1); g1.connect(masterGain);
    osc.connect(f2); f2.connect(g2); g2.connect(masterGain);
    osc.connect(f3); f3.connect(g3); g3.connect(masterGain);
    noiseGain.connect(masterGain);

    // Connect to reverb + dry output
    if (routing) {
      masterGain.connect(routing.dry);
      masterGain.connect(routing.reverb);
    } else {
      masterGain.connect(ctx.destination);
    }

    osc.start(startTime);
    osc.stop(endTime + 0.02);
    noiseSource.start(startTime);
    noiseSource.stop(endTime + 0.02);
  }

  /**
   * Play a sequence of syllables with formant synthesis.
   */
  private playPhrase(syllables: Syllable[], volume: number = 0.18): void {
    if (!this.enabled) return;
    const ctx = getCtx();
    if (ctx.state === 'suspended') return;

    const routing = this.ensureReverb();
    let offset = 0;

    for (const syl of syllables) {
      const startAt = ctx.currentTime + offset / 1000;
      this.playSyllable(syl, startAt, routing, volume);
      offset += syl.duration + syl.gap;
    }
  }

  /** Play crowd roar (layered noise burst) */
  private playCrowdRoar(): void {
    const buf = this.ensureCrowdRoar();
    if (!buf) return;
    const ctx = getCtx();
    if (ctx.state === 'suspended') return;

    const source = ctx.createBufferSource();
    source.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.value = 0.35;

    // Bandpass to emphasize 1-3kHz (crowd voice frequencies)
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1800;
    bp.Q.value = 0.5;

    source.connect(bp);
    bp.connect(gain);

    // Connect through reverb if available
    const routing = this.ensureReverb();
    if (routing) {
      gain.connect(routing.dry);
      gain.connect(routing.reverb);
    } else {
      gain.connect(ctx.destination);
    }

    source.start();
  }

  // ─── Public API (unchanged signatures) ─────────────────────

  roundStart(n: number): void {
    this.playPhrase(roundNotes(n), 0.16);
  }

  fight(): void {
    this.playPhrase(FIGHT_SYLLABLES, 0.20);
  }

  knockOut(): void {
    this.playPhrase(KO_SYLLABLES, 0.22);
    // Trigger crowd roar slightly after the KO announcement begins
    const ctx = getCtx();
    if (ctx.state !== 'suspended' && this.enabled) {
      const roarSource = ctx.createBufferSource();
      const buf = this.ensureCrowdRoar();
      if (buf) {
        roarSource.buffer = buf;
        const gain = ctx.createGain();
        gain.gain.value = 0;
        gain.gain.setValueAtTime(0, ctx.currentTime + 0.3);
        gain.gain.linearRampToValueAtTime(0.30, ctx.currentTime + 0.6);
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 1800;
        bp.Q.value = 0.5;
        roarSource.connect(bp);
        bp.connect(gain);

        const routing = this.ensureReverb();
        if (routing) {
          gain.connect(routing.dry);
          gain.connect(routing.reverb);
        } else {
          gain.connect(ctx.destination);
        }
        roarSource.start(ctx.currentTime + 0.3);
      }
    }
  }

  perfect(): void {
    this.playPhrase(PERFECT_SYLLABLES, 0.17);
  }

  timeOver(): void {
    this.playPhrase(TIME_OVER_SYLLABLES, 0.15);
  }

  winner(): void {
    this.playPhrase(WINNER_SYLLABLES, 0.18);
  }

  firstAttack(): void {
    this.playPhrase(FIRST_ATTACK_SYLLABLES, 0.16);
  }

  counter(): void {
    this.playPhrase(COUNTER_SYLLABLES, 0.17);
  }

  guardCrush(): void {
    this.playPhrase(GUARD_CRUSH_SYLLABLES, 0.18);
  }

  superCancel(): void {
    this.playPhrase(SUPER_CANCEL_SYLLABLES, 0.16);
  }

  doubleKO(): void {
    this.playPhrase(DOUBLE_KO_SYLLABLES, 0.20);
  }

  newChallenger(): void {
    this.playPhrase(NEW_CHALLENGER_SYLLABLES, 0.17);
  }
}

export const announcer = new Announcer();
