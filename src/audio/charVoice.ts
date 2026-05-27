/**
 * Character Voice — Per-character attack vocalizations (kiai)
 *
 * Generates short combat grunts/shouts using formant synthesis.
 * Each character has a unique pitch profile and voice quality.
 * Called from attackSFX dispatch or hitCallback to add voice personality.
 *
 * Voice types:
 *   light   — short "ah" grunt (normals A/B)
 *   heavy   — stronger "oh" shout (normals C/D)
 *   special — character-specific kiai (special moves)
 *   dm      — dramatic battle shout (DM/SDM/HSDM)
 *   hurt    — pained "ugh" on taking a hit
 */
import { getCtx } from './audioCtx.js';

// ─── Voice Profile ──────────────────────────────────────────────

interface VoiceProfile {
  /** Base fundamental frequency (Hz) */
  baseFreq: number;
  /** Formant frequency multipliers [F1, F2, F3] relative to standard */
  formantScale: [number, number, number];
  /** Voice brightness (1.0 = standard, >1 = brighter, <1 = darker) */
  brightness: number;
  /** Attack aggressiveness (0-1, affects noise burst) */
  aggressiveness: number;
}

const VOICE_PROFILES: Record<string, VoiceProfile> = {
  // Ryo: Deep, powerful karate voice
  ryo:      { baseFreq: 135, formantScale: [0.95, 0.88, 0.92], brightness: 0.9,  aggressiveness: 0.7 },
  // Kyo: Mid-range, fiery and sharp
  kyo:      { baseFreq: 165, formantScale: [1.0,  1.05, 1.08], brightness: 1.1,  aggressiveness: 0.8 },
  // Iori: Low, dark and menacing
  iori:     { baseFreq: 118, formantScale: [0.88, 0.82, 0.85], brightness: 0.75, aggressiveness: 0.9 },
  // Terry: Energetic, mid-high
  terry:    { baseFreq: 158, formantScale: [1.0,  1.0,  1.0],  brightness: 1.0,  aggressiveness: 0.75 },
  // Kim: Sharp, disciplined
  kim:      { baseFreq: 172, formantScale: [1.05, 1.1,  1.12], brightness: 1.15, aggressiveness: 0.65 },
  // Leona: Controlled, lower female
  leona:    { baseFreq: 210, formantScale: [1.15, 1.2,  1.15], brightness: 1.05, aggressiveness: 0.6 },
  // Kula: Higher, lighter
  kula:     { baseFreq: 240, formantScale: [1.2,  1.25, 1.2],  brightness: 1.1,  aggressiveness: 0.4 },
  // K' (kdash): Edgy, mid
  kdash:    { baseFreq: 155, formantScale: [0.95, 0.92, 0.95], brightness: 0.85, aggressiveness: 0.85 },
  // Robert: Confident, mid-high
  robert:   { baseFreq: 160, formantScale: [1.0,  1.02, 1.0],  brightness: 1.05, aggressiveness: 0.7 },
  // Athena: Bright female
  athena:   { baseFreq: 250, formantScale: [1.25, 1.3,  1.25], brightness: 1.15, aggressiveness: 0.35 },
};

const DEFAULT_PROFILE: VoiceProfile = {
  baseFreq: 148,
  formantScale: [1.0, 1.0, 1.0],
  brightness: 1.0,
  aggressiveness: 0.7,
};

// ─── Formant definitions ────────────────────────────────────────

// ─── Syllable patterns per voice type ───────────────────────────

interface VowelDef {
  f1: number;
  f2: number;
  f3: number;
  bw: number[];
}

const VOWEL_AH: VowelDef = { f1: 600, f2: 1100, f3: 2800, bw: [80, 100, 140] };
const VOWEL_OH: VowelDef = { f1: 500, f2: 800,  f3: 2600, bw: [70, 90,  130] };
const VOWEL_IH: VowelDef = { f1: 350, f2: 2000, f3: 2800, bw: [60, 110, 150] };
const VOWEL_EH: VowelDef = { f1: 450, f2: 1700, f3: 2700, bw: [65, 100, 145] };
const VOWEL_UH: VowelDef = { f1: 400, f2: 900, f3: 2500, bw: [75, 95, 135] };

interface VoiceSyllable {
  vowel: VowelDef;
  durationMs: number;
  freqOffset: number;
  pitchEnd?: number;
  attackMs: number;
  releaseMs: number;
}

const PATTERNS: Record<string, VoiceSyllable[]> = {
  light: [
    { vowel: VOWEL_AH, durationMs: 70,  freqOffset: 0,   attackMs: 5,  releaseMs: 25 },
  ],
  heavy: [
    { vowel: VOWEL_OH, durationMs: 110, freqOffset: -10,  attackMs: 6,  releaseMs: 35, pitchEnd: -30 },
  ],
  special: [
    { vowel: VOWEL_AH, durationMs: 60,  freqOffset: 20,  attackMs: 4,  releaseMs: 15 },
    { vowel: VOWEL_IH, durationMs: 100, freqOffset: 0,   attackMs: 5,  releaseMs: 30, pitchEnd: 40 },
  ],
  dm: [
    { vowel: VOWEL_AH, durationMs: 50,  freqOffset: 30,  attackMs: 3,  releaseMs: 10 },
    { vowel: VOWEL_OH, durationMs: 80,  freqOffset: 0,   attackMs: 4,  releaseMs: 20 },
    { vowel: VOWEL_AH, durationMs: 150, freqOffset: -20, attackMs: 5,  releaseMs: 50, pitchEnd: -40 },
  ],
  hurt: [
    { vowel: VOWEL_UH, durationMs: 90, freqOffset: -10, attackMs: 8, releaseMs: 40, pitchEnd: -50 },
  ],
  victory: [
    // Triumphant rising shout: "Ha!" → held "Aaah" → confident finish
    { vowel: VOWEL_AH, durationMs: 60,  freqOffset: 10,  attackMs: 3, releaseMs: 10 },
    { vowel: VOWEL_AH, durationMs: 120, freqOffset: 30,  attackMs: 4, releaseMs: 20, pitchEnd: 50 },
    { vowel: VOWEL_OH, durationMs: 200, freqOffset: 0,   attackMs: 5, releaseMs: 80, pitchEnd: -20 },
  ],
  dizzy: [
    // Dazed groan: low, wavering, disoriented
    { vowel: VOWEL_UH, durationMs: 200, freqOffset: -30, attackMs: 15, releaseMs: 80, pitchEnd: -20 },
    { vowel: VOWEL_OH, durationMs: 300, freqOffset: -40, attackMs: 10, releaseMs: 150, pitchEnd: 10 },
  ],
};

// ─── Buffer cache ───────────────────────────────────────────────

const bufferCache = new Map<string, AudioBuffer>();

function getCacheKey(charId: string, type: string): string {
  return `${charId}:${type}`;
}

// ─── Synthesis ──────────────────────────────────────────────────

function synthesizeVoice(
  charId: string,
  type: string,
  profile: VoiceProfile,
): AudioBuffer | null {
  const ctx = getCtx();
  if (ctx.state === 'suspended') return null;

  const syllables = PATTERNS[type];
  if (!syllables) return null;

  // Calculate total duration
  let totalMs = 0;
  for (const s of syllables) totalMs += s.durationMs;
  totalMs += 20; // padding
  const sr = ctx.sampleRate;
  const totalSamples = Math.ceil(sr * totalMs / 1000);
  const buffer = ctx.createBuffer(1, totalSamples, sr);
  const data = buffer.getChannelData(0);

  let offset = 0;

  for (const syl of syllables) {
    const vowel = syl.vowel;
    const sylSamples = Math.ceil(sr * syl.durationMs / 1000);
    const baseFreq = profile.baseFreq + syl.freqOffset;
    const fScale = profile.formantScale;
    const brightness = profile.brightness;

    // Formant frequencies scaled by character profile
    const f1 = vowel.f1 * fScale[0];
    const f2 = vowel.f2 * fScale[1];
    const f3 = vowel.f3 * fScale[2];
    const bw1 = vowel.bw[0];
    const bw2 = vowel.bw[1];
    const bw3 = vowel.bw[2];

    for (let i = 0; i < sylSamples; i++) {
      const t = i / sr;
      const progress = i / sylSamples;

      // Amplitude envelope: attack -> sustain -> release
      let amp: number;
      const attackFrac = syl.attackMs / syl.durationMs;
      const releaseFrac = syl.releaseMs / syl.durationMs;
      if (progress < attackFrac) {
        amp = progress / attackFrac;
      } else if (progress > 1 - releaseFrac) {
        amp = (1 - progress) / releaseFrac;
      } else {
        amp = 1.0;
      }

      // Pitch contour
      let freq = baseFreq;
      if (syl.pitchEnd !== undefined) {
        freq = baseFreq + syl.pitchEnd * progress;
      }

      // Fundamental: sawtooth for rich harmonics
      const phase = 2 * Math.PI * freq * t;
      const sawWave = 2 * ((freq * t) % 1) - 1;

      // Formant filtering: simulate bandpass resonance
      const formant1 = Math.sin(2 * Math.PI * f1 * t) * Math.exp(-bw1 * 0.01 * Math.abs(Math.sin(2 * Math.PI * f1 * t)));
      const formant2 = Math.sin(2 * Math.PI * f2 * t) * Math.exp(-bw2 * 0.01 * Math.abs(Math.sin(2 * Math.PI * f2 * t)));
      const formant3 = Math.sin(2 * Math.PI * f3 * t) * Math.exp(-bw3 * 0.01 * Math.abs(Math.sin(2 * Math.PI * f3 * t)));

      // Mix formants: F1 loudest, F2 medium, F3 quiet (brightness scales higher formants)
      const voice =
        sawWave * 0.15 +
        formant1 * 0.45 +
        formant2 * 0.30 * brightness +
        formant3 * 0.15 * brightness * brightness;

      // Noise burst on attack for breathiness/aggressiveness
      const burstEnv = progress < attackFrac * 2 ? 1 - progress / (attackFrac * 2) : 0;
      const noise = (Math.random() * 2 - 1) * profile.aggressiveness * burstEnv * 0.3;

      data[offset + i] = (voice + noise) * amp * 0.35;
    }

    offset += sylSamples;
  }

  return buffer;
}

// ─── Public API ─────────────────────────────────────────────────

let lastPlayTime = 0;
const MIN_INTERVAL_MS = 120;

/**
 * Play a character attack vocalization.
 * @param charId Character ID (ryo, kyo, iori, etc.)
 * @param type Voice type: 'light' | 'heavy' | 'special' | 'dm' | 'hurt'
 * @param volume Volume multiplier (0-1)
 */
export function playCharVoice(charId: string, type: string, volume: number = 0.5): void {
  const ctx = getCtx();
  if (ctx.state === 'suspended') return;

  // Throttle: don't overlap voice calls too rapidly
  const now = ctx.currentTime * 1000;
  if (now - lastPlayTime < MIN_INTERVAL_MS) return;
  lastPlayTime = now;

  const profile = VOICE_PROFILES[charId] ?? DEFAULT_PROFILE;

  // Try cache first
  const key = getCacheKey(charId, type);
  let buffer = bufferCache.get(key);

  if (!buffer) {
    const synthesized = synthesizeVoice(charId, type, profile);
    if (synthesized) {
      bufferCache.set(key, synthesized);
      buffer = synthesized;
    }
  }

  if (!buffer) return;

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.value = volume;

  source.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

/**
 * Determine voice type from attack name.
 */
export function inferVoiceType(attackType: string): string {
  const atk = attackType as string;
  if (atk.startsWith('HSDM_') || atk.startsWith('SDM_')) return 'dm';
  if (atk.startsWith('DM_')) return 'dm';
  if (atk.startsWith('RYO_KOOU') || atk.startsWith('RYO_KO_HOU') ||
      atk.startsWith('RYO_HIEN') || atk.startsWith('RYO_HAOU') ||
      atk.startsWith('KYO_') || atk.startsWith('IORI_')) {
    // Check if it's a special (not normal)
    if (!atk.includes('STAND_') && !atk.includes('CROUCH_') && !atk.includes('JUMP_') && !atk.includes('CLOSE_')) {
      return 'special';
    }
  }
  if (atk.endsWith('_C') || atk.endsWith('_D') || atk === 'STAND_CD' || atk === 'JUMP_CD') return 'heavy';
  return 'light';
}

/**
 * Pre-cache voice buffers for a character (call on character select).
 */
export function precacheCharVoice(charId: string): void {
  const profile = VOICE_PROFILES[charId];
  if (!profile) return;
  for (const type of ['light', 'heavy', 'special', 'dm', 'hurt']) {
    const key = getCacheKey(charId, type);
    if (!bufferCache.has(key)) {
      const buf = synthesizeVoice(charId, type, profile);
      if (buf) bufferCache.set(key, buf);
    }
  }
}
