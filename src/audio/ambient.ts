/**
 * AmbientSoundPlayer — stage-specific ambient soundscapes
 *
 * Uses offline-prerendered 6-second loop AudioBuffers via Web Audio API.
 * Extremely low master volume (0.06) to avoid interfering with BGM and SFX.
 *
 * Stages:
 *   temple  — wind bell chimes, distant temple bell, low-frequency rumble
 *   china   — flowing water (bandpass noise), bird chirps
 *   factory — 60Hz mechanical hum, steam release bursts
 *   orochi  — 40Hz ultra-low drone, wind noise, energy pulses
 *   street  — city low-frequency rumble, 60Hz neon hum, occasional horns
 */

import { getCtx } from './audioCtx.js';

type StageId = 'temple' | 'china' | 'factory' | 'orochi' | 'street';

export class AmbientSoundPlayer {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private currentSource: AudioBufferSourceNode | null = null;
  private currentGain: GainNode | null = null;
  private currentStage: StageId | null = null;
  private buffers: Map<StageId, AudioBuffer> = new Map();

  constructor() {
    this.ctx = getCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.06;
    this.masterGain.connect(this.ctx.destination);
    this.prerenderAll();
  }

  private prerenderAll(): void {
    const stages: StageId[] = ['temple', 'china', 'factory', 'orochi', 'street'];
    for (const s of stages) {
      this.buffers.set(s, this.renderStage(s));
    }
  }

  private renderStage(stage: StageId): AudioBuffer {
    const duration = 6;
    const rate = this.ctx.sampleRate;
    const length = rate * duration;
    const buffer = this.ctx.createBuffer(1, length, rate);
    const data = buffer.getChannelData(0);

    switch (stage) {
      case 'temple': this.renderTemple(data, rate); break;
      case 'china': this.renderChina(data, rate); break;
      case 'factory': this.renderFactory(data, rate); break;
      case 'orochi': this.renderOrochi(data, rate); break;
      case 'street': this.renderStreet(data, rate); break;
    }

    // Crossfade loop endpoints (100ms smooth splice)
    const fadeLen = Math.floor(rate * 0.1);
    for (let i = 0; i < fadeLen; i++) {
      const t = i / fadeLen;
      data[i] = data[i] * t + data[length - fadeLen + i] * (1 - t);
    }

    return buffer;
  }

  // ─── Stage Renderers ───

  private renderTemple(data: Float32Array, rate: number): void {
    const len = data.length;
    // Layer 1: low-frequency ambient noise (white noise -> lowpass 200Hz)
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.02;
    }
    let prev = 0;
    for (let i = 0; i < len; i++) {
      prev = prev * 0.995 + data[i] * 0.005;
      data[i] = prev;
    }
    // Layer 2: wind bell chimes (t=0.8s, 2.5s, 4.2s)
    this.addTone(data, rate, 0.8, 0.08, 1200, 1.5);
    this.addTone(data, rate, 2.5, 0.08, 1350, 1.5);
    this.addTone(data, rate, 4.2, 0.08, 1100, 1.5);
    // Layer 3: distant temple bell (t=1.5s, 4.5s)
    this.addTone(data, rate, 1.5, 0.04, 220, 2.5);
    this.addTone(data, rate, 4.5, 0.04, 220, 2.5);
  }

  private renderChina(data: Float32Array, rate: number): void {
    const len = data.length;
    // Layer 1: flowing water (bandpass noise 800-3000Hz)
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.025;
    }
    // Simple bandpass: lowpass then highpass
    let lp = 0;
    for (let i = 0; i < len; i++) {
      lp = lp * 0.997 + data[i] * 0.003;
      data[i] = (data[i] - lp) * 0.5;
    }
    // Layer 2: bird chirps (t=0.5s, 2.0s, 3.8s, 5.5s)
    this.addChirp(data, rate, 0.5, 0.02, 2000, 3000);
    this.addChirp(data, rate, 2.0, 0.02, 2200, 2800);
    this.addChirp(data, rate, 3.8, 0.02, 2500, 3200);
    this.addChirp(data, rate, 5.5, 0.02, 2000, 2600);
  }

  private renderFactory(data: Float32Array, rate: number): void {
    const len = data.length;
    // Layer 1: mechanical low-frequency hum (60Hz square wave)
    for (let i = 0; i < len; i++) {
      const t = i / rate;
      data[i] = (Math.sin(2 * Math.PI * 60 * t) > 0 ? 1 : -1) * 0.02;
    }
    // Layer 2: steam release bursts (t=1.2s, 3.8s, 5.5s)
    this.addNoiseBurst(data, rate, 1.2, 0.03, 0.5);
    this.addNoiseBurst(data, rate, 3.8, 0.03, 0.4);
    this.addNoiseBurst(data, rate, 5.5, 0.02, 0.3);
  }

  private renderOrochi(data: Float32Array, rate: number): void {
    const len = data.length;
    // Layer 1: ultra-low drone (40Hz sine)
    for (let i = 0; i < len; i++) {
      const t = i / rate;
      data[i] = Math.sin(2 * Math.PI * 40 * t) * 0.03;
    }
    // Layer 2: wind noise (lowpass noise)
    const noise = new Float32Array(len);
    for (let i = 0; i < len; i++) noise[i] = (Math.random() * 2 - 1) * 0.02;
    let lp = 0;
    for (let i = 0; i < len; i++) {
      lp = lp * 0.996 + noise[i] * 0.004;
      data[i] += lp;
    }
    // Layer 3: energy pulses (t=1.5s, 4.0s)
    this.addTone(data, rate, 1.5, 0.015, 120, 0.2);
    this.addTone(data, rate, 4.0, 0.015, 120, 0.2);
  }

  private renderStreet(data: Float32Array, rate: number): void {
    const len = data.length;
    // Layer 1: city low-frequency rumble
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.03;
    }
    let lp = 0;
    for (let i = 0; i < len; i++) {
      lp = lp * 0.993 + data[i] * 0.007;
      data[i] = lp;
    }
    // Layer 2: neon hum (60Hz)
    for (let i = 0; i < len; i++) {
      const t = i / rate;
      data[i] += Math.sin(2 * Math.PI * 60 * t) * 0.008;
    }
    // Layer 3: occasional horn (t=2.0s, 5.3s)
    this.addTone(data, rate, 2.0, 0.015, 350, 0.15);
    this.addTone(data, rate, 5.3, 0.015, 400, 0.15);
  }

  // ─── Synthesis Helpers ───

  private addTone(data: Float32Array, rate: number, timeSec: number, peakGain: number, freq: number, decaySec: number): void {
    const start = Math.floor(timeSec * rate);
    const len = Math.floor(decaySec * rate);
    for (let i = 0; i < len && start + i < data.length; i++) {
      const t = i / rate;
      const env = Math.exp((-t * 3) / decaySec) * peakGain;
      data[start + i] += Math.sin(2 * Math.PI * freq * t) * env;
    }
  }

  private addChirp(data: Float32Array, rate: number, timeSec: number, peakGain: number, fStart: number, fEnd: number): void {
    const start = Math.floor(timeSec * rate);
    const chirpLen = Math.floor(0.03 * rate);
    for (let i = 0; i < chirpLen && start + i < data.length; i++) {
      const p = i / chirpLen;
      const freq = fStart + (fEnd - fStart) * p;
      const env = Math.sin(Math.PI * p) * peakGain;
      const t = i / rate;
      data[start + i] += Math.sin(2 * Math.PI * freq * t) * env;
    }
  }

  private addNoiseBurst(data: Float32Array, rate: number, timeSec: number, peakGain: number, durationSec: number): void {
    const start = Math.floor(timeSec * rate);
    const len = Math.floor(durationSec * rate);
    for (let i = 0; i < len && start + i < data.length; i++) {
      const p = i / len;
      const env = Math.exp(-p * 3) * peakGain;
      data[start + i] += (Math.random() * 2 - 1) * env;
    }
  }

  // ─── Public API ───

  start(stage: StageId): void {
    this.stop();
    const buf = this.buffers.get(stage);
    if (!buf) return;
    this.currentStage = stage;
    const source = this.ctx.createBufferSource();
    source.buffer = buf;
    source.loop = true;
    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    source.connect(gain);
    gain.connect(this.masterGain);
    source.start();
    // Fade in over 0.5s
    gain.gain.linearRampToValueAtTime(1.0, this.ctx.currentTime + 0.5);
    this.currentSource = source;
    this.currentGain = gain;
  }

  stop(): void {
    if (this.currentSource) {
      try {
        if (this.currentGain) {
          this.currentGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
        }
        this.currentSource.stop(this.ctx.currentTime + 0.4);
      } catch {
        // Source already stopped
      }
      this.currentSource = null;
      this.currentGain = null;
    }
  }

  switchStage(stage: StageId): void {
    if (stage === this.currentStage) return;
    this.start(stage);
  }

  setVolume(v: number): void {
    this.masterGain.gain.value = Math.max(0, Math.min(0.15, v));
  }
}
