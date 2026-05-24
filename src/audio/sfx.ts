/**
 * SFX — Enhanced Web Audio synthesis
 * Multi-layered sounds with better filtering, richer harmonics
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

export function initAudio(): void {
  getCtx();
}

// Helper: create shaped noise buffer
function noiseBuffer(ctx: AudioContext, duration: number, decay: number): AudioBufferSourceNode {
  const size = Math.floor(ctx.sampleRate * duration);
  const buf = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (size * decay));
  const src = ctx.createBufferSource();
  src.buffer = buf;
  return src;
}

/** Light hit (A/B) — quick snap with body */
export function playHit(intensity: number = 1): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  // Noise burst with envelope shaping
  const noise = noiseBuffer(ctx, 0.06, 0.15);
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = 1200 + intensity * 200;
  noiseFilter.Q.value = 0.6;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.3 * intensity, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  // Low thump
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150 * intensity, now);
  osc.frequency.exponentialRampToValueAtTime(50, now + 0.04);
  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.25 * intensity, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  // Mid "snap" layer
  const snap = ctx.createOscillator();
  snap.type = 'triangle';
  snap.frequency.setValueAtTime(800, now);
  snap.frequency.exponentialRampToValueAtTime(200, now + 0.02);
  const snapGain = ctx.createGain();
  snapGain.gain.setValueAtTime(0.1 * intensity, now);
  snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

  // High transient (crispness)
  const hi = ctx.createOscillator();
  hi.type = 'square';
  hi.frequency.setValueAtTime(2000, now);
  hi.frequency.exponentialRampToValueAtTime(500, now + 0.015);
  const hiGain = ctx.createGain();
  hiGain.gain.setValueAtTime(0.04 * intensity, now);
  hiGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

  noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
  osc.connect(oscGain).connect(ctx.destination);
  snap.connect(snapGain).connect(ctx.destination);
  hi.connect(hiGain).connect(ctx.destination);
  noise.start(now); noise.stop(now + 0.07);
  osc.start(now); osc.stop(now + 0.05);
  snap.start(now); snap.stop(now + 0.03);
  hi.start(now); hi.stop(now + 0.025);
}

/** Block — metallic ring with resonance */
export function playBlock(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  // Metallic ring
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(900, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.06);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  // Impact layer
  const noise = noiseBuffer(ctx, 0.04, 0.2);
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.1, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 2000;

  osc.connect(gain).connect(ctx.destination);
  noise.connect(filter).connect(noiseGain).connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.07);
  noise.start(now); noise.stop(now + 0.04);
}

/** Special move — energy whoosh + impact */
export function playSpecial(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  // Rising sweep
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.18, now);
  gain.gain.setValueAtTime(0.22, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  // Whoosh noise
  const noise = noiseBuffer(ctx, 0.15, 0.25);
  const nFilter = ctx.createBiquadFilter();
  nFilter.type = 'bandpass';
  nFilter.frequency.setValueAtTime(500, now);
  nFilter.frequency.exponentialRampToValueAtTime(3000, now + 0.1);
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.12, now);
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  osc.connect(gain).connect(ctx.destination);
  noise.connect(nFilter).connect(nGain).connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.25);
  noise.start(now); noise.stop(now + 0.16);
}

/** DM — massive energy explosion */
export function playDM(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  // Deep rumble
  const osc1 = ctx.createOscillator();
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(80, now);
  osc1.frequency.exponentialRampToValueAtTime(30, now + 0.4);
  const gain1 = ctx.createGain();
  gain1.gain.setValueAtTime(0.3, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

  // High shimmer
  const osc2 = ctx.createOscillator();
  osc2.type = 'square';
  osc2.frequency.setValueAtTime(1200, now);
  osc2.frequency.exponentialRampToValueAtTime(150, now + 0.2);
  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0.12, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  // Noise explosion
  const noise = noiseBuffer(ctx, 0.2, 0.35);
  const nFilter = ctx.createBiquadFilter();
  nFilter.type = 'bandpass';
  nFilter.frequency.value = 600;
  nFilter.Q.value = 0.5;
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.35, now);
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  // Sub impact
  const sub = ctx.createOscillator();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(60, now);
  sub.frequency.exponentialRampToValueAtTime(20, now + 0.3);
  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(0.4, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  osc1.connect(gain1).connect(ctx.destination);
  osc2.connect(gain2).connect(ctx.destination);
  noise.connect(nFilter).connect(nGain).connect(ctx.destination);
  sub.connect(subGain).connect(ctx.destination);
  osc1.start(now); osc1.stop(now + 0.45);
  osc2.start(now); osc2.stop(now + 0.22);
  noise.start(now); noise.stop(now + 0.25);
  sub.start(now); sub.stop(now + 0.4);
}

/** Throw — grab + slam */
export function playThrow(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.setValueAtTime(200, now + 0.03);
  osc.frequency.setValueAtTime(80, now + 0.06);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  // Impact thud
  const thud = ctx.createOscillator();
  thud.type = 'sine';
  thud.frequency.setValueAtTime(100, now + 0.05);
  thud.frequency.exponentialRampToValueAtTime(30, now + 0.12);
  const thudGain = ctx.createGain();
  thudGain.gain.setValueAtTime(0.25, now + 0.05);
  thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  osc.connect(gain).connect(ctx.destination);
  thud.connect(thudGain).connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.12);
  thud.start(now + 0.05); thud.stop(now + 0.16);
}

/** KO — dramatic final hit */
export function playKO(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(25, now + 0.6);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  // Echo noise
  const noise = noiseBuffer(ctx, 0.3, 0.4);
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.2, now);
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  osc.connect(gain).connect(ctx.destination);
  noise.connect(nGain).connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.65);
  noise.start(now); noise.stop(now + 0.4);
}

/** Select — bright confirmation chime */
export function playSelect(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.setValueAtTime(1100, now + 0.05);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  // Harmonic
  const harm = ctx.createOscillator();
  harm.type = 'sine';
  harm.frequency.value = 1760;
  const hGain = ctx.createGain();
  hGain.gain.setValueAtTime(0.05, now);
  hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  osc.connect(gain).connect(ctx.destination);
  harm.connect(hGain).connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.2);
  harm.start(now); harm.stop(now + 0.12);
}

/** Counter — sharp alert */
export function playCounter(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(1500, now);
  osc.frequency.setValueAtTime(2000, now + 0.03);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  // Second hit
  const osc2 = ctx.createOscillator();
  osc2.type = 'sawtooth';
  osc2.frequency.setValueAtTime(2500, now + 0.04);
  osc2.frequency.exponentialRampToValueAtTime(800, now + 0.1);
  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0.1, now + 0.04);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(gain).connect(ctx.destination);
  osc2.connect(gain2).connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.1);
  osc2.start(now + 0.04); osc2.stop(now + 0.13);
}

/** Victory fanfare — richer arrangement */
export function playVictoryFanfare(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const notes = [523.3, 659.3, 784, 1047]; // C5, E5, G5, C6
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.25;
  masterGain.connect(ctx.destination);

  notes.forEach((freq, i) => {
    // Main tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    const t = now + i * 0.15;
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(gain).connect(masterGain);
    osc.start(t); osc.stop(t + 0.4);

    // Harmony (octave below)
    const harm = ctx.createOscillator();
    const hGain = ctx.createGain();
    harm.type = 'triangle';
    harm.frequency.value = freq / 2;
    hGain.gain.setValueAtTime(0.1, t);
    hGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    harm.connect(hGain).connect(masterGain);
    harm.start(t); harm.stop(t + 0.35);
  });
}

/** Heavy hit (C/D) — thick impact with body */
export function playHeavyHit(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  // Noise with body
  const noise = noiseBuffer(ctx, 0.1, 0.25);
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800;
  filter.Q.value = 0.8;
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.35, now);
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  // Deep thump
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(35, now + 0.1);
  const oGain = ctx.createGain();
  oGain.gain.setValueAtTime(0.4, now);
  oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  // Mid crack
  const crack = ctx.createOscillator();
  crack.type = 'triangle';
  crack.frequency.setValueAtTime(400, now);
  crack.frequency.exponentialRampToValueAtTime(80, now + 0.04);
  const cGain = ctx.createGain();
  cGain.gain.setValueAtTime(0.2, now);
  cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  // Upper harmonic
  const harm = ctx.createOscillator();
  harm.type = 'sawtooth';
  harm.frequency.setValueAtTime(600, now);
  harm.frequency.exponentialRampToValueAtTime(150, now + 0.06);
  const hGain = ctx.createGain();
  hGain.gain.setValueAtTime(0.08, now);
  hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  noise.connect(filter).connect(nGain).connect(ctx.destination);
  osc.connect(oGain).connect(ctx.destination);
  crack.connect(cGain).connect(ctx.destination);
  harm.connect(hGain).connect(ctx.destination);
  noise.start(now); noise.stop(now + 0.12);
  osc.start(now); osc.stop(now + 0.12);
  crack.start(now); crack.stop(now + 0.06);
  harm.start(now); harm.stop(now + 0.08);
}

/** Super Flash — DM startup shimmer */
export function playSuperFlash(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(2000, now + 0.12);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.25);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.setValueAtTime(0.25, now + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  // Shimmer layer
  const shimmer = noiseBuffer(ctx, 0.15, 0.3);
  const sFilter = ctx.createBiquadFilter();
  sFilter.type = 'highpass';
  sFilter.frequency.value = 4000;
  const sGain = ctx.createGain();
  sGain.gain.setValueAtTime(0.08, now);
  sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  osc.connect(gain).connect(ctx.destination);
  shimmer.connect(sFilter).connect(sGain).connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.35);
  shimmer.start(now); shimmer.stop(now + 0.16);
}

/** Roll — whoosh */
export function playRoll(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
  osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  const noise = noiseBuffer(ctx, 0.1, 0.3);
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.06, now);
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  osc.connect(gain).connect(ctx.destination);
  noise.connect(nGain).connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.2);
  noise.start(now); noise.stop(now + 0.12);
}

/** Guard Crush — shattering */
export function playGuardCrush(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const noise = noiseBuffer(ctx, 0.15, 0.2);
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1500;
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.3, now);
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);
  const oGain = ctx.createGain();
  oGain.gain.setValueAtTime(0.3, now);
  oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

  // Glass-like high ring
  const ring = ctx.createOscillator();
  ring.type = 'sine';
  ring.frequency.setValueAtTime(2000, now);
  ring.frequency.exponentialRampToValueAtTime(800, now + 0.1);
  const rGain = ctx.createGain();
  rGain.gain.setValueAtTime(0.08, now);
  rGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  noise.connect(filter).connect(nGain).connect(ctx.destination);
  osc.connect(oGain).connect(ctx.destination);
  ring.connect(rGain).connect(ctx.destination);
  noise.start(now); noise.stop(now + 0.18);
  osc.start(now); osc.stop(now + 0.15);
  ring.start(now); ring.stop(now + 0.12);
}

/** Throw escape */
export function playThrowEscape(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.setValueAtTime(800, now + 0.03);
  osc.frequency.setValueAtTime(500, now + 0.06);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  // Confirm chime
  const chime = ctx.createOscillator();
  chime.type = 'sine';
  chime.frequency.value = 1200;
  const cGain = ctx.createGain();
  cGain.gain.setValueAtTime(0.05, now + 0.04);
  cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain).connect(ctx.destination);
  chime.connect(cGain).connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.12);
  chime.start(now + 0.04); chime.stop(now + 0.1);
}

/** Landing — soft thud for ground impact */
export function playLanding(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(80, now);
  osc.frequency.exponentialRampToValueAtTime(30, now + 0.06);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  const noise = noiseBuffer(ctx, 0.04, 0.3);
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.06, now);
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain).connect(ctx.destination);
  noise.connect(nGain).connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.07);
  noise.start(now); noise.stop(now + 0.05);
}

/** Projectile launch — energy burst with trailing whoosh */
export function playProjectileLaunch(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

  // Energy charge layer
  const charge = ctx.createOscillator();
  charge.type = 'triangle';
  charge.frequency.setValueAtTime(400, now);
  charge.frequency.exponentialRampToValueAtTime(800, now + 0.04);
  const cGain = ctx.createGain();
  cGain.gain.setValueAtTime(0.08, now);
  cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  osc.connect(gain).connect(ctx.destination);
  charge.connect(cGain).connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.2);
  charge.start(now); charge.stop(now + 0.08);
}

/** MAX activation — power surge */
export function playMAXActivation(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  // Rising sweep
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(1500, now + 0.2);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.4);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.setValueAtTime(0.35, now + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

  // Sub pulse
  const sub = ctx.createOscillator();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(60, now);
  sub.frequency.exponentialRampToValueAtTime(40, now + 0.3);
  const sGain = ctx.createGain();
  sGain.gain.setValueAtTime(0.3, now);
  sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  // Sparkle layer
  const sparkle = noiseBuffer(ctx, 0.2, 0.3);
  const spFilter = ctx.createBiquadFilter();
  spFilter.type = 'highpass';
  spFilter.frequency.value = 5000;
  const spGain = ctx.createGain();
  spGain.gain.setValueAtTime(0.1, now + 0.1);
  spGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.connect(gain).connect(ctx.destination);
  sub.connect(sGain).connect(ctx.destination);
  sparkle.connect(spFilter).connect(spGain).connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.55);
  sub.start(now); sub.stop(now + 0.4);
  sparkle.start(now + 0.1); sparkle.stop(now + 0.3);
}

/** Wall bounce — metallic impact */
export function playWallBounce(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  // Rattle
  const noise = noiseBuffer(ctx, 0.08, 0.25);
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.12, now);
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2000;
  filter.Q.value = 1.2;

  osc.connect(gain).connect(ctx.destination);
  noise.connect(filter).connect(nGain).connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.15);
  noise.start(now); noise.stop(now + 0.1);
}

/** Round call — buzzer-like announcement chime */
export function playRoundCall(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.2;
  masterGain.connect(ctx.destination);

  const notes = [659.3, 784, 659.3]; // E5 G5 E5
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    const t = now + i * 0.12;
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain).connect(masterGain);
    osc.start(t); osc.stop(t + 0.18);
  });
}

/** Time Over — warning buzzer */
export function playTimeOver(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  // Warning buzzer
  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 440;
    const t = now + i * 0.15;
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.12);
  }
}

/** Perfect — triumphant chime */
export function playPerfect(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.2;
  masterGain.connect(ctx.destination);

  const notes = [523.3, 659.3, 784, 1047, 1319]; // C5 E5 G5 C6 E6
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = now + i * 0.08;
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain).connect(masterGain);
    osc.start(t); osc.stop(t + 0.35);

    // Octave harmony
    const harm = ctx.createOscillator();
    const hGain = ctx.createGain();
    harm.type = 'triangle';
    harm.frequency.value = freq * 2;
    hGain.gain.setValueAtTime(0.06, t);
    hGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    harm.connect(hGain).connect(masterGain);
    harm.start(t); harm.stop(t + 0.25);
  });
}

/** Chip damage — weak hit */
export function playChip(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const noise = noiseBuffer(ctx, 0.04, 0.15);
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 3000;
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.12, now);
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = 800;
  const oGain = ctx.createGain();
  oGain.gain.setValueAtTime(0.06, now);
  oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  noise.connect(filter).connect(nGain).connect(ctx.destination);
  osc.connect(oGain).connect(ctx.destination);
  noise.start(now); noise.stop(now + 0.05);
  osc.start(now); osc.stop(now + 0.04);
}
