/**
 * BGM — Enhanced chiptune battle music
 * Two tracks: Title theme + Battle theme
 * Richer synthesis with pads, arps, and better drums
 */

export class BGMPlayer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private loopTimer: ReturnType<typeof setInterval> | null = null;
  private volume: number = 0.25;
  private beat: number = 0;
  private track: 'title' | 'battle' = 'battle';

  start(track: 'title' | 'battle' = 'battle'): void {
    if (this.isPlaying) this.stop();
    this.track = track;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.volume;
    // Compressor for cleaner mix
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.ratio.value = 4;
    this.masterGain.connect(comp).connect(this.ctx.destination);
    this.isPlaying = true;
    this.beat = 0;
    this.scheduleLoop();
  }

  stop(): void {
    this.isPlaying = false;
    if (this.loopTimer) { clearInterval(this.loopTimer); this.loopTimer = null; }
    if (this.ctx) { this.ctx.close(); this.ctx = null; }
    this.masterGain = null;
  }

  toggle(): boolean {
    if (this.isPlaying) this.stop(); else this.start(this.track);
    return this.isPlaying;
  }

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.masterGain) this.masterGain.gain.value = this.volume;
  }

  get playing(): boolean { return this.isPlaying; }

  private scheduleLoop(): void {
    const BPM = this.track === 'battle' ? 150 : 110;
    const beatMs = 60000 / BPM;

    const play = (): void => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      if (this.track === 'battle') this.playBattleBeat(now);
      else this.playTitleBeat(now);

      this.beat = (this.beat + 1) % (this.track === 'battle' ? 64 : 32);
    };

    play();
    this.loopTimer = setInterval(play, beatMs / 2);
  }

  // ─── Battle Theme (150 BPM, 64 beats = 8 bars) ───

  private playBattleBeat(now: number): void {
    if (!this.ctx || !this.masterGain) return;

    // Drums — varied pattern
    const beatInBar = this.beat % 8;
    if (beatInBar === 0) this.playKick(now, 0.6);
    if (beatInBar === 2) this.playKick(now, 0.3);
    if (beatInBar === 4) this.playKick(now, 0.5);
    if (beatInBar === 6) this.playKick(now, 0.25);
    if (beatInBar === 2 || beatInBar === 6) this.playSnare(now);
    if (beatInBar === 0 || beatInBar === 4) this.playSnare(now);
    this.playHihat(now, this.beat % 2 === 0 ? 0.08 : 0.04);
    // Extra hihat on off-beats in second half
    if (this.beat >= 32 && this.beat % 2 === 0) this.playHihat(now, 0.05);

    // Bass line (16 positions) — more variation in second half
    const bassNotes = this.beat < 32
      ? [82.4, 82.4, 110, 82.4, 130.8, 110, 82.4, 98, 73.4, 73.4, 98, 73.4, 130.8, 110, 98, 82.4]
      : [98, 98, 82.4, 73.4, 110, 98, 130.8, 110, 82.4, 82.4, 110, 130.8, 98, 82.4, 73.4, 82.4];
    if (this.beat % 4 === 0) this.playBass(now, bassNotes[(this.beat / 4) % 16]);
    // Walking bass on off-beats in second half
    if (this.beat >= 32 && this.beat % 4 === 2) {
      this.playBass(now, bassNotes[(this.beat / 4) % 16] * 1.5, 0.06);
    }

    // Lead melody — two different phrases
    if (this.beat % 2 === 1) {
      const melodyA = [659.3, 0, 784, 659.3, 523.3, 587.3, 659.3, 0, 440, 523.3, 587.3, 659.3, 0, 784, 880, 0];
      const melodyB = [880, 784, 659.3, 523.3, 587.3, 659.3, 784, 880, 659.3, 784, 880, 1046.5, 880, 784, 659.3, 0];
      const melody = this.beat < 32 ? melodyA : melodyB;
      const note = melody[Math.floor(this.beat / 2) % melody.length];
      if (note > 0) this.playLead(now, note);
    }

    // Counter-melody (second voice, quieter)
    if (this.beat % 4 === 3 && this.beat >= 16) {
      const counterNotes = [392, 440, 523.3, 587.3, 440, 392, 349.2, 392, 523.3, 587.3, 659.3, 523.3, 440, 392, 349.2, 0];
      const cn = counterNotes[(this.beat / 4) % counterNotes.length];
      if (cn > 0) this.playLead(now, cn, 0.04);
    }

    // Pad chord (every 8 beats)
    if (this.beat % 8 === 0) {
      const chords = this.beat < 32
        ? [[220, 261.6, 329.6], [220, 277.2, 329.6], [196, 246.9, 293.7], [174.6, 220, 261.6],
            [220, 261.6, 329.6], [164.8, 196, 246.9], [196, 246.9, 293.7], [220, 261.6, 329.6]]
        : [[261.6, 329.6, 392], [220, 261.6, 329.6], [196, 246.9, 293.7], [174.6, 220, 261.6],
            [261.6, 329.6, 392], [220, 277.2, 329.6], [196, 246.9, 349.2], [220, 261.6, 329.6]];
      this.playPad(now, chords[(this.beat / 8) % 8]);
    }

    // Arp accent at phrase end
    if (this.beat === 60 || this.beat === 28) this.playArpAccent(now);

    // Tom fill before second half
    if (this.beat === 30 || this.beat === 31) this.playTom(now, this.beat === 30 ? 200 : 150);
  }

  // ─── Title Theme (110 BPM, 32 beats = 4 bars, calmer) ───

  private playTitleBeat(now: number): void {
    if (!this.ctx || !this.masterGain) return;

    // Sparse drums
    if (this.beat % 8 === 0) this.playKick(now, 0.3);
    if (this.beat % 8 === 4) this.playSnare(now);
    if (this.beat % 4 === 0) this.playHihat(now, 0.03);

    // Slow bass (8 positions)
    const bassNotes = [110, 110, 98, 98, 130.8, 130.8, 82.4, 82.4];
    if (this.beat % 4 === 0) this.playBass(now, bassNotes[(this.beat / 4) % 8], 0.3);

    // Gentle melody (every 4th beat)
    if (this.beat % 4 === 2) {
      const melody = [523.3, 587.3, 659.3, 784, 659.3, 587.3, 523.3, 440];
      this.playLead(now, melody[(this.beat / 4) % 8], 0.06);
    }

    // Pad every 8 beats
    if (this.beat % 8 === 0) {
      const chords = [
        [261.6, 329.6, 392], // C
        [220, 277.2, 329.6], // Am (no 3rd implied)
        [246.9, 311.1, 370], // B dim-ish
        [261.6, 329.6, 392], // C
      ];
      this.playPad(now, chords[(this.beat / 8) % 4], 0.4);
    }
  }

  // ─── Synthesis ───

  private playKick(time: number, vol: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, time);
    osc.frequency.exponentialRampToValueAtTime(28, time + 0.12);
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
    osc.connect(gain).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.2);
  }

  private playSnare(time: number): void {
    if (!this.ctx || !this.masterGain) return;
    const size = Math.floor(this.ctx.sampleRate * 0.08);
    const buf = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3000;
    filter.Q.value = 0.8;
    noise.connect(filter).connect(gain).connect(this.masterGain);
    noise.start(time); noise.stop(time + 0.1);
  }

  private playHihat(time: number, vol: number): void {
    if (!this.ctx || !this.masterGain) return;
    const size = Math.floor(this.ctx.sampleRate * 0.03);
    const buf = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 9000;
    noise.connect(filter).connect(gain).connect(this.masterGain);
    noise.start(time); noise.stop(time + 0.04);
  }

  private playBass(time: number, freq: number, vol: number = 0.12): void {
    if (!this.ctx || !this.masterGain || freq === 0) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 350;
    osc.connect(filter).connect(gain).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.28);
  }

  private playLead(time: number, freq: number, vol: number = 0.07): void {
    if (!this.ctx || !this.masterGain || freq === 0) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    // Slight vibrato
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 5;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 3;
    lfo.connect(lfoGain).connect(osc.frequency);
    lfo.start(time); lfo.stop(time + 0.22);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.setValueAtTime(vol * 0.8, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
    osc.connect(gain).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.2);
  }

  private playPad(time: number, freqs: number[], duration: number = 0.5): void {
    if (!this.ctx || !this.masterGain) return;
    for (const freq of freqs) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.04, time + 0.2);
      gain.gain.setValueAtTime(0.04, time + duration * 0.7);
      gain.gain.linearRampToValueAtTime(0, time + duration);
      osc.connect(gain).connect(this.masterGain);
      osc.start(time); osc.stop(time + duration + 0.05);
    }
  }

  private playTom(time: number, freq: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, time + 0.15);
    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
    osc.connect(gain).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.2);
  }

  private playArpAccent(time: number): void {
    if (!this.ctx || !this.masterGain) return;
    const notes = [659.3, 784, 880, 1046.5]; // E5 G5 A5 C6
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      const t = time + i * 0.04;
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(gain).connect(this.masterGain!);
      osc.start(t); osc.stop(t + 0.12);
    });
  }
}

export const bgm = new BGMPlayer();
