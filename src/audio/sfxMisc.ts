/**
 * Non-combat sound effects — UI, movement, announcements.
 * Shared helpers imported from audioCtx.ts.
 */
import { getCtx, noiseBuffer } from './audioCtx.js';

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

/** Victory fanfare — richer arrangement */
export function playVictoryFanfare(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const notes = [523.3, 659.3, 784, 1047];
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.25;
  masterGain.connect(ctx.destination);

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    const t = now + i * 0.15;
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(gain).connect(masterGain);
    osc.start(t); osc.stop(t + 0.4);

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

/** MAX activation — dramatic power surge */
export function playMAXActivation(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(2000, now + 0.15);
  osc.frequency.exponentialRampToValueAtTime(1200, now + 0.35);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.5);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.setValueAtTime(0.38, now + 0.12);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

  const sub = ctx.createOscillator();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(50, now);
  sub.frequency.exponentialRampToValueAtTime(35, now + 0.4);
  const sGain = ctx.createGain();
  sGain.gain.setValueAtTime(0.35, now);
  sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  const sparkle = noiseBuffer(ctx, 0.25, 0.3);
  const spFilter = ctx.createBiquadFilter();
  spFilter.type = 'highpass';
  spFilter.frequency.value = 5000;
  const spGain = ctx.createGain();
  spGain.gain.setValueAtTime(0.12, now + 0.08);
  spGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  const hum = ctx.createOscillator();
  hum.type = 'triangle';
  hum.frequency.setValueAtTime(300, now + 0.1);
  hum.frequency.exponentialRampToValueAtTime(900, now + 0.2);
  hum.frequency.exponentialRampToValueAtTime(400, now + 0.4);
  const humGain = ctx.createGain();
  humGain.gain.setValueAtTime(0.15, now + 0.1);
  humGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

  osc.connect(gain).connect(ctx.destination);
  sub.connect(sGain).connect(ctx.destination);
  sparkle.connect(spFilter).connect(spGain).connect(ctx.destination);
  hum.connect(humGain).connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.6);
  sub.start(now); sub.stop(now + 0.45);
  sparkle.start(now + 0.08); sparkle.stop(now + 0.3);
  hum.start(now + 0.1); hum.stop(now + 0.5);
}

/** Round call — buzzer-like announcement chime */
export function playRoundCall(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.2;
  masterGain.connect(ctx.destination);

  const notes = [659.3, 784, 659.3];
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

  const notes = [523.3, 659.3, 784, 1047, 1319];
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

/** FIGHT! — round start announcement */
export function playFight(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = 0.25;
  master.connect(ctx.destination);

  for (let i = 0; i < 2; i++) {
    const kick = ctx.createOscillator();
    kick.type = 'sine';
    kick.frequency.setValueAtTime(200, now + i * 0.08);
    kick.frequency.exponentialRampToValueAtTime(50, now + i * 0.08 + 0.05);
    const kGain = ctx.createGain();
    kGain.gain.setValueAtTime(0.4, now + i * 0.08);
    kGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.06);
    kick.connect(kGain).connect(master);
    kick.start(now + i * 0.08); kick.stop(now + i * 0.08 + 0.07);
  }

  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(400, now + 0.16);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.22);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.3, now + 0.16);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  osc.connect(gain).connect(master);
  osc.start(now + 0.16); osc.stop(now + 0.36);
}

/** Quick Stand — rapid recovery */
export function playQuickStand(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  const noise = noiseBuffer(ctx, 0.05, 0.25);
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.08, now);
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain).connect(ctx.destination);
  noise.connect(nGain).connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.12);
  noise.start(now); noise.stop(now + 0.06);
}

/** Step — footstep for walking */
export function playStep(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const noise = noiseBuffer(ctx, 0.03, 0.15);
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.04, now);
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  noise.connect(filter).connect(nGain).connect(ctx.destination);
  noise.start(now); noise.stop(now + 0.04);
}
