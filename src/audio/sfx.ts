/**
 * SFX — Combat sound effects (Web Audio synthesis).
 * Non-combat sounds live in sfxMisc.ts.
 * Shared helpers in audioCtx.ts.
 */
import { getCtx, initAudio, noiseBuffer } from './audioCtx.js';

// Re-export initAudio and all misc sounds for backward compatibility
export { initAudio } from './audioCtx.js';
export {
  playThrow, playSelect, playVictoryFanfare, playRoll,
  playThrowEscape, playLanding, playProjectileLaunch, playMAXActivation,
  playRoundCall, playTimeOver, playPerfect, playFight,
  playQuickStand, playStep,
} from './sfxMisc.js';

/** Light hit (A/B) — KOF-style snappy impact. combo: 连击数(0+), 高连击时音高递增 */
export function playHit(intensity: number = 1, combo: number = 0): void {
  const ctx = getCtx();
  const now = ctx.currentTime;
  const pitchShift = 1 + Math.min(combo, 15) * 0.04;

  const noise = noiseBuffer(ctx, 0.05, 0.12);
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = (1800 + intensity * 400) * pitchShift;
  noiseFilter.Q.value = 0.5;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.35 * intensity, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(180 * intensity * pitchShift, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.05);
  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.3 * intensity, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  const snap = ctx.createOscillator();
  snap.type = 'triangle';
  snap.frequency.setValueAtTime(1200 * pitchShift, now);
  snap.frequency.exponentialRampToValueAtTime(300, now + 0.025);
  const snapGain = ctx.createGain();
  snapGain.gain.setValueAtTime(0.15 * intensity, now);
  snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

  const hi = ctx.createOscillator();
  hi.type = 'square';
  hi.frequency.setValueAtTime(3000 * pitchShift, now);
  hi.frequency.exponentialRampToValueAtTime(800, now + 0.012);
  const hiGain = ctx.createGain();
  hiGain.gain.setValueAtTime(0.05 * intensity, now);
  hiGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

  noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
  osc.connect(oscGain).connect(ctx.destination);
  snap.connect(snapGain).connect(ctx.destination);
  hi.connect(hiGain).connect(ctx.destination);
  noise.start(now); noise.stop(now + 0.06);
  osc.start(now); osc.stop(now + 0.06);
  snap.start(now); snap.stop(now + 0.03);
  hi.start(now); hi.stop(now + 0.02);
}

/** Block — KOF-style metallic clang */
export function playBlock(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(1100, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  const res = ctx.createOscillator();
  res.type = 'sine';
  res.frequency.setValueAtTime(2200, now);
  res.frequency.exponentialRampToValueAtTime(600, now + 0.06);
  const resGain = ctx.createGain();
  resGain.gain.setValueAtTime(0.06, now);
  resGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  const noise = noiseBuffer(ctx, 0.04, 0.2);
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.12, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 2500;

  osc.connect(gain).connect(ctx.destination);
  res.connect(resGain).connect(ctx.destination);
  noise.connect(filter).connect(noiseGain).connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.09);
  res.start(now); res.stop(now + 0.07);
  noise.start(now); noise.stop(now + 0.04);
}

/** Special move — energy whoosh + impact + metallic edge */
export function playSpecial(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.18, now);
  gain.gain.setValueAtTime(0.22, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  const noise = noiseBuffer(ctx, 0.15, 0.25);
  const nFilter = ctx.createBiquadFilter();
  nFilter.type = 'bandpass';
  nFilter.frequency.setValueAtTime(500, now);
  nFilter.frequency.exponentialRampToValueAtTime(3000, now + 0.1);
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.12, now);
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  // KOF2002: 必杀技金属质感边缘 — 高频三角波短闪
  const metal = ctx.createOscillator();
  metal.type = 'triangle';
  metal.frequency.setValueAtTime(2400, now);
  metal.frequency.exponentialRampToValueAtTime(600, now + 0.06);
  const mGain = ctx.createGain();
  mGain.gain.setValueAtTime(0.08, now);
  mGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  osc.connect(gain).connect(ctx.destination);
  noise.connect(nFilter).connect(nGain).connect(ctx.destination);
  metal.connect(mGain).connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.25);
  noise.start(now); noise.stop(now + 0.16);
  metal.start(now); metal.stop(now + 0.07);
}

/** DM — massive energy explosion */
export function playDM(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc1 = ctx.createOscillator();
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(80, now);
  osc1.frequency.exponentialRampToValueAtTime(30, now + 0.4);
  const gain1 = ctx.createGain();
  gain1.gain.setValueAtTime(0.3, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

  const osc2 = ctx.createOscillator();
  osc2.type = 'square';
  osc2.frequency.setValueAtTime(1200, now);
  osc2.frequency.exponentialRampToValueAtTime(150, now + 0.2);
  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0.12, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  const noise = noiseBuffer(ctx, 0.2, 0.35);
  const nFilter = ctx.createBiquadFilter();
  nFilter.type = 'bandpass';
  nFilter.frequency.value = 600;
  nFilter.Q.value = 0.5;
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.35, now);
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  const sub = ctx.createOscillator();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(60, now);
  sub.frequency.exponentialRampToValueAtTime(20, now + 0.3);
  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(0.4, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  // KOF2002: DM二次爆发 — 0.1s后高频碎裂声
  const burst = noiseBuffer(ctx, 0.08, 0.2);
  const bFilter = ctx.createBiquadFilter();
  bFilter.type = 'highpass';
  bFilter.frequency.value = 2000;
  const bGain = ctx.createGain();
  bGain.gain.setValueAtTime(0.15, now + 0.1);
  bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  osc1.connect(gain1).connect(ctx.destination);
  osc2.connect(gain2).connect(ctx.destination);
  noise.connect(nFilter).connect(nGain).connect(ctx.destination);
  sub.connect(subGain).connect(ctx.destination);
  burst.connect(bFilter).connect(bGain).connect(ctx.destination);
  osc1.start(now); osc1.stop(now + 0.45);
  osc2.start(now); osc2.stop(now + 0.22);
  noise.start(now); noise.stop(now + 0.25);
  sub.start(now); sub.stop(now + 0.4);
  burst.start(now + 0.1); burst.stop(now + 0.22);
}

/** KO — dramatic final hit with sub-bass rumble + metallic ring-out */
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

  const noise = noiseBuffer(ctx, 0.3, 0.4);
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.2, now);
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  // KOF2002: KO落地低频隆隆声
  const sub = ctx.createOscillator();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(50, now);
  sub.frequency.exponentialRampToValueAtTime(15, now + 0.5);
  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(0.35, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

  // KOF2002: 金属质感回响
  const ring = ctx.createOscillator();
  ring.type = 'triangle';
  ring.frequency.setValueAtTime(1800, now + 0.1);
  ring.frequency.exponentialRampToValueAtTime(400, now + 0.4);
  const ringGain = ctx.createGain();
  ringGain.gain.setValueAtTime(0.06, now + 0.1);
  ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

  osc.connect(gain).connect(ctx.destination);
  noise.connect(nGain).connect(ctx.destination);
  sub.connect(subGain).connect(ctx.destination);
  ring.connect(ringGain).connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.65);
  noise.start(now); noise.stop(now + 0.4);
  sub.start(now); sub.stop(now + 0.55);
  ring.start(now + 0.1); ring.stop(now + 0.55);
}

/** Heavy hit (C/D) — KOF-style deep meaty impact. intensity: 1.0-1.8, 按伤害值缩放 */
export function playHeavyHit(intensity: number = 1): void {
  const ctx = getCtx();
  const now = ctx.currentTime;
  const i = Math.min(intensity, 1.8);

  const noise = noiseBuffer(ctx, 0.12, 0.2);
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 600 * i;
  filter.Q.value = 0.6;
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.4 * i, now);
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(100 * i, now);
  osc.frequency.exponentialRampToValueAtTime(28, now + 0.12);
  const oGain = ctx.createGain();
  oGain.gain.setValueAtTime(0.5 * i, now);
  oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  const crack = ctx.createOscillator();
  crack.type = 'triangle';
  crack.frequency.setValueAtTime(500 * i, now);
  crack.frequency.exponentialRampToValueAtTime(100, now + 0.05);
  const cGain = ctx.createGain();
  cGain.gain.setValueAtTime(0.25 * i, now);
  cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  const harm = ctx.createOscillator();
  harm.type = 'sawtooth';
  harm.frequency.setValueAtTime(800 * i, now);
  harm.frequency.exponentialRampToValueAtTime(200, now + 0.07);
  const hGain = ctx.createGain();
  hGain.gain.setValueAtTime(0.1 * i, now);
  hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

  const hi = ctx.createOscillator();
  hi.type = 'square';
  hi.frequency.setValueAtTime(2500 * i, now);
  hi.frequency.exponentialRampToValueAtTime(400, now + 0.02);
  const hiGain = ctx.createGain();
  hiGain.gain.setValueAtTime(0.08 * i, now);
  hiGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

  noise.connect(filter).connect(nGain).connect(ctx.destination);
  osc.connect(oGain).connect(ctx.destination);
  crack.connect(cGain).connect(ctx.destination);
  harm.connect(hGain).connect(ctx.destination);
  hi.connect(hiGain).connect(ctx.destination);
  noise.start(now); noise.stop(now + 0.14);
  osc.start(now); osc.stop(now + 0.14);
  crack.start(now); crack.stop(now + 0.06);
  harm.start(now); harm.stop(now + 0.08);
  hi.start(now); hi.stop(now + 0.03);
}

/** Super Flash — DM startup shimmer. isSDM: 金色谐振增强 */
export function playSuperFlash(isSDM: boolean = false): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(2000, now + 0.12);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.25);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(isSDM ? 0.2 : 0.15, now);
  gain.gain.setValueAtTime(isSDM ? 0.35 : 0.25, now + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, now + (isSDM ? 0.4 : 0.3));

  const shimmer = noiseBuffer(ctx, 0.15, 0.3);
  const sFilter = ctx.createBiquadFilter();
  sFilter.type = 'highpass';
  sFilter.frequency.value = 4000;
  const sGain = ctx.createGain();
  sGain.gain.setValueAtTime(isSDM ? 0.14 : 0.08, now);
  sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  osc.connect(gain).connect(ctx.destination);
  shimmer.connect(sFilter).connect(sGain).connect(ctx.destination);
  osc.start(now); osc.stop(now + (isSDM ? 0.45 : 0.35));
  shimmer.start(now); shimmer.stop(now + (isSDM ? 0.2 : 0.16));

  // SDM: 额外金色谐振层
  if (isSDM) {
    const chime = ctx.createOscillator();
    chime.type = 'sine';
    chime.frequency.setValueAtTime(880, now + 0.05);
    chime.frequency.exponentialRampToValueAtTime(1760, now + 0.15);
    chime.frequency.exponentialRampToValueAtTime(440, now + 0.35);
    const chGain = ctx.createGain();
    chGain.gain.setValueAtTime(0.1, now + 0.05);
    chGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    chime.connect(chGain).connect(ctx.destination);
    chime.start(now + 0.05); chime.stop(now + 0.4);
  }
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

/** Guard Crush — shattering + sharp initial crack */
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

  const ring = ctx.createOscillator();
  ring.type = 'sine';
  ring.frequency.setValueAtTime(2000, now);
  ring.frequency.exponentialRampToValueAtTime(800, now + 0.1);
  const rGain = ctx.createGain();
  rGain.gain.setValueAtTime(0.08, now);
  rGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  // 初始尖锐裂纹
  const crack = ctx.createOscillator();
  crack.type = 'sawtooth';
  crack.frequency.setValueAtTime(3500, now);
  crack.frequency.exponentialRampToValueAtTime(600, now + 0.04);
  const cGain = ctx.createGain();
  cGain.gain.setValueAtTime(0.15, now);
  cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  noise.connect(filter).connect(nGain).connect(ctx.destination);
  osc.connect(oGain).connect(ctx.destination);
  ring.connect(rGain).connect(ctx.destination);
  crack.connect(cGain).connect(ctx.destination);
  noise.start(now); noise.stop(now + 0.18);
  osc.start(now); osc.stop(now + 0.15);
  ring.start(now); ring.stop(now + 0.12);
  crack.start(now); crack.stop(now + 0.05);
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

/** Cancel — Super Cancel/Free Cancel */
export function playCancel(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(1800, now + 0.04);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  const chime = ctx.createOscillator();
  chime.type = 'sine';
  chime.frequency.value = 1400;
  const cGain = ctx.createGain();
  cGain.gain.setValueAtTime(0.08, now + 0.03);
  cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain).connect(ctx.destination);
  chime.connect(cGain).connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.13);
  chime.start(now + 0.03); chime.stop(now + 0.1);
}

/** Wire — Counter Wire wall bounce */
export function playWire(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);
  osc.frequency.exponentialRampToValueAtTime(1200, now + 0.12);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  const noise = noiseBuffer(ctx, 0.1, 0.2);
  const nFilter = ctx.createBiquadFilter();
  nFilter.type = 'bandpass';
  nFilter.frequency.value = 1500;
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.15, now + 0.05);
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(gain).connect(ctx.destination);
  noise.connect(nFilter).connect(nGain).connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.16);
  noise.start(now + 0.05); noise.stop(now + 0.13);
}

/** Juggle hit — floating impact. combo: 连击数, 高连击时音高递增 */
export function playJuggleHit(combo: number = 0): void {
  const ctx = getCtx();
  const now = ctx.currentTime;
  const pitchShift = 1 + Math.min(combo, 15) * 0.04;

  const noise = noiseBuffer(ctx, 0.04, 0.12);
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1500 * pitchShift;
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.15, now);
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(600 * pitchShift, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);
  const oGain = ctx.createGain();
  oGain.gain.setValueAtTime(0.12, now);
  oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  noise.connect(filter).connect(nGain).connect(ctx.destination);
  osc.connect(oGain).connect(ctx.destination);
  noise.start(now); noise.stop(now + 0.05);
  osc.start(now); osc.stop(now + 0.05);
}
