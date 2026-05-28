/**
 * BGM Core Synthesis Primitives — extracted from bgm.ts
 * Low-level Web Audio oscillators, noise generators, and instrument emulations.
 * All functions are stateless — they receive ctx + masterGain and schedule sounds.
 */

/** Synth context passed to every primitive */
export interface SynthCtx {
  ctx: AudioContext;
  masterGain: GainNode;
}

export function playKick(s: SynthCtx, time: number, vol: number): void {
  const { ctx, masterGain } = s;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(180, time);
  osc.frequency.exponentialRampToValueAtTime(25, time + 0.1);
  gain.gain.setValueAtTime(vol, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
  osc.connect(gain).connect(masterGain);
  osc.start(time); osc.stop(time + 0.22);
  const click = ctx.createOscillator();
  const cg = ctx.createGain();
  click.type = 'square';
  click.frequency.setValueAtTime(800, time);
  click.frequency.exponentialRampToValueAtTime(100, time + 0.02);
  cg.gain.setValueAtTime(vol * 0.3, time);
  cg.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
  click.connect(cg).connect(masterGain);
  click.start(time); click.stop(time + 0.05);
  const sub = ctx.createOscillator();
  const sg = ctx.createGain();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(60, time);
  sub.frequency.exponentialRampToValueAtTime(15, time + 0.15);
  sg.gain.setValueAtTime(vol * 0.4, time);
  sg.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
  sub.connect(sg).connect(masterGain);
  sub.start(time); sub.stop(time + 0.18);
}

export function playSnare(s: SynthCtx, time: number, vol: number): void {
  const { ctx, masterGain } = s;
  const size = Math.floor(ctx.sampleRate * 0.08);
  const buf = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(vol, time);
  ng.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 3500;
  bp.Q.value = 0.7;
  noise.connect(bp).connect(ng).connect(masterGain);
  noise.start(time); noise.stop(time + 0.15);
  const osc = ctx.createOscillator();
  const og = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(200, time);
  osc.frequency.exponentialRampToValueAtTime(80, time + 0.04);
  og.gain.setValueAtTime(vol * 0.6, time);
  og.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
  osc.connect(og).connect(masterGain);
  osc.start(time); osc.stop(time + 0.08);
}

export function playHihat(s: SynthCtx, time: number, vol: number, open: boolean): void {
  const { ctx, masterGain } = s;
  const dur = open ? 0.12 : 0.035;
  const size = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = open ? 7000 : 9500;
  noise.connect(hp).connect(gain).connect(masterGain);
  noise.start(time); noise.stop(time + dur + 0.01);
}

export function playCrash(s: SynthCtx, time: number, vol: number = 0.12): void {
  const { ctx, masterGain } = s;
  const size = Math.floor(ctx.sampleRate * 0.4);
  const buf = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (size * 0.3));
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 5000;
  noise.connect(hp).connect(gain).connect(masterGain);
  noise.start(time); noise.stop(time + 0.4);
}

export function playBass(s: SynthCtx, time: number, freq: number, vol: number): void {
  const { ctx, masterGain } = s;
  if (freq === 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(vol, time + 0.005);
  gain.gain.setValueAtTime(vol * 0.85, time + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 400;
  lp.Q.value = 2;
  osc.connect(lp).connect(gain).connect(masterGain);
  osc.start(time); osc.stop(time + 0.25);
  const sub = ctx.createOscillator();
  const sg = ctx.createGain();
  sub.type = 'sine';
  sub.frequency.value = freq / 2;
  sg.gain.setValueAtTime(0, time);
  sg.gain.linearRampToValueAtTime(vol * 0.3, time + 0.008);
  sg.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
  sub.connect(sg).connect(masterGain);
  sub.start(time); sub.stop(time + 0.22);
}

export function playGuitarLead(s: SynthCtx, time: number, freq: number, vol: number = 0.06): void {
  const { ctx, masterGain } = s;
  const saw = ctx.createOscillator();
  const sqr = ctx.createOscillator();
  const gain = ctx.createGain();
  saw.type = 'sawtooth';
  saw.frequency.value = freq;
  sqr.type = 'square';
  sqr.frequency.value = freq;
  const lfo = ctx.createOscillator();
  const lfoG = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.value = 5.5;
  lfoG.gain.value = 4;
  lfo.connect(lfoG);
  lfoG.connect(saw.frequency);
  lfoG.connect(sqr.frequency);
  lfo.start(time); lfo.stop(time + 0.2);
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(vol, time + 0.008);
  gain.gain.setValueAtTime(vol * 0.75, time + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.17);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 2500;
  lp.Q.value = 1;
  const gGain = ctx.createGain();
  gGain.gain.value = 0.6;
  saw.connect(gGain);
  sqr.connect(gGain);
  gGain.connect(lp).connect(gain).connect(masterGain);
  saw.start(time); saw.stop(time + 0.2);
  sqr.start(time); sqr.stop(time + 0.2);
}

export function playSoftLead(s: SynthCtx, time: number, freq: number, vol: number): void {
  const { ctx, masterGain } = s;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(vol, time + 0.05);
  gain.gain.setValueAtTime(vol * 0.8, time + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
  osc.connect(gain).connect(masterGain);
  osc.start(time); osc.stop(time + 0.38);
  const harm = ctx.createOscillator();
  const hg = ctx.createGain();
  harm.type = 'triangle';
  harm.frequency.value = freq * 2;
  hg.gain.setValueAtTime(0, time);
  hg.gain.linearRampToValueAtTime(vol * 0.15, time + 0.08);
  hg.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
  harm.connect(hg).connect(masterGain);
  harm.start(time); harm.stop(time + 0.28);
}

export function playPowerChord(s: SynthCtx, time: number, freqs: number[], vol: number = 0.03): void {
  const { ctx, masterGain } = s;
  for (const freq of freqs) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.01);
    gain.gain.setValueAtTime(vol * 0.85, time + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 600;
    osc.connect(lp).connect(gain).connect(masterGain);
    osc.start(time); osc.stop(time + 0.28);
  }
}

export function playPad(s: SynthCtx, time: number, freqs: number[], duration: number = 0.6): void {
  const { ctx, masterGain } = s;
  for (const freq of freqs) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.03, time + duration * 0.25);
    gain.gain.setValueAtTime(0.03, time + duration * 0.6);
    gain.gain.linearRampToValueAtTime(0, time + duration);
    osc.connect(gain).connect(masterGain);
    osc.start(time); osc.stop(time + duration + 0.05);
  }
}

export function playSubPad(s: SynthCtx, time: number, freq: number, duration: number): void {
  const { ctx, masterGain } = s;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.04, time + duration * 0.2);
  gain.gain.setValueAtTime(0.04, time + duration * 0.7);
  gain.gain.linearRampToValueAtTime(0, time + duration);
  osc.connect(gain).connect(masterGain);
  osc.start(time); osc.stop(time + duration + 0.1);
}

export function playTom(s: SynthCtx, time: number, freq: number): void {
  const { ctx, masterGain } = s;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, time);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.4, time + 0.12);
  gain.gain.setValueAtTime(0.2, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
  osc.connect(gain).connect(masterGain);
  osc.start(time); osc.stop(time + 0.18);
}

export function playArpFill(s: SynthCtx, time: number, vol: number = 0.05): void {
  const { ctx, masterGain } = s;
  const notes = [659.3, 784, 880, 1046.5, 1174.7];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    const t = time + i * 0.035;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(gain).connect(masterGain);
    osc.start(t); osc.stop(t + 0.1);
  });
}

export function playTransitionFill(s: SynthCtx, time: number): void {
  const { ctx, masterGain } = s;
  const notes = [523.3, 659.3, 784, 1046.5];
  const vol = 0.04;
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const t = time + i * 0.05;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    osc.connect(gain).connect(masterGain);
    osc.start(t); osc.stop(t + 0.07);
  });
}

export function playMetalHit(s: SynthCtx, time: number): void {
  const { ctx, masterGain } = s;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(120, time);
  osc.frequency.exponentialRampToValueAtTime(40, time + 0.15);
  gain.gain.setValueAtTime(0.06, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
  osc.connect(gain).connect(masterGain);
  osc.start(time); osc.stop(time + 0.22);
}

export function playGongAccent(s: SynthCtx, time: number): void {
  const { ctx, masterGain } = s;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 180;
  gain.gain.setValueAtTime(0.08, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 200;
  bp.Q.value = 5;
  osc.connect(bp).connect(gain).connect(masterGain);
  osc.start(time); osc.stop(time + 0.65);
}

export function playBellAccent(s: SynthCtx, time: number, vol: number = 0.04): void {
  const { ctx, masterGain } = s;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(vol, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.value = 1760;
  gain2.gain.setValueAtTime(vol * 0.38, time);
  gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
  osc.connect(gain).connect(masterGain);
  osc2.connect(gain2).connect(masterGain);
  osc.start(time); osc.stop(time + 0.55);
  osc2.start(time); osc2.stop(time + 0.35);
}

export function playRim(s: SynthCtx, time: number, vol: number): void {
  const { ctx, masterGain } = s;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(800, time);
  osc.frequency.exponentialRampToValueAtTime(300, time + 0.02);
  gain.gain.setValueAtTime(vol, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 1500;
  osc.connect(hp).connect(gain).connect(masterGain);
  osc.start(time); osc.stop(time + 0.05);
}
