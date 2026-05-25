/**
 * BGM — KOF2002-style chiptune battle music
 * Stage-aware tracks with rock/metal energy
 * 4 tracks: Title, Temple(ESAKA), China, Factory
 */

export class BGMPlayer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private loopTimer: ReturnType<typeof setInterval> | null = null;
  private volume = 0.25;
  private beat = 0;
  private track: 'title' | 'battle' = 'battle';
  private stageId: string = 'temple';

  start(track: 'title' | 'battle' = 'battle'): void {
    if (this.isPlaying) this.stop();
    this.track = track;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.volume;
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 4;
    comp.attack.value = 0.003;
    comp.release.value = 0.15;
    this.masterGain.connect(comp).connect(this.ctx.destination);
    this.isPlaying = true;
    this.beat = 0;
    this.scheduleLoop();
  }

  setStage(id: string): void { this.stageId = id; }

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
    const BPM = this.track === 'battle' ? 155 : 100;
    const subBeatMs = 60000 / BPM / 2;

    const play = (): void => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      if (this.track === 'battle') this.playBattleBeat(now);
      else this.playTitleBeat(now);
      this.beat = (this.beat + 1) % (this.track === 'battle' ? 128 : 64);
    };

    play();
    this.loopTimer = setInterval(play, subBeatMs);
  }

  // ─── Battle Theme (155 BPM, 128 sub-beats = 16 bars x 8 sub-beats) ───

  private playBattleBeat(now: number): void {
    if (!this.ctx || !this.masterGain) return;

    // ── Drums ──
    const b = this.beat;
    const b8 = b % 8;
    // Kick pattern: varied per section
    const section = Math.floor(b / 32); // 0-3
    if (section === 0 || section === 2) {
      if (b8 === 0 || b8 === 4) this.playKick(now, 0.55);
      if (b8 === 6) this.playKick(now, 0.3);
    } else {
      if (b8 === 0 || b8 === 3 || b8 === 4) this.playKick(now, 0.5);
      if (b8 === 7) this.playKick(now, 0.25);
    }
    // Snare on 2 and 6
    if (b8 === 2 || b8 === 6) this.playSnare(now, 0.22);
    // Double snare fill at end of section
    if (b === 30 || b === 31) this.playSnare(now, 0.18);
    if (b === 62 || b === 63) this.playSnare(now, 0.2);
    if (b === 94) this.playSnare(now, 0.15);
    if (b === 126 || b === 127) this.playSnare(now, 0.22);
    // Hi-hat: eighth notes, open on some
    if (b % 2 === 0) this.playHihat(now, 0.07, false);
    if (b % 2 === 1) this.playHihat(now, 0.04, false);
    // Open hi-hat at phrase boundaries
    if (b8 === 7 && (section === 0 || section === 2)) this.playHihat(now, 0.1, true);
    // Tom fill before section transitions
    if (b >= 28 && b <= 31) this.playTom(now, 180 - (b - 28) * 20);
    if (b >= 60 && b <= 63) this.playTom(now, 200 - (b - 60) * 25);
    if (b >= 92 && b <= 95) this.playTom(now, 220 - (b - 92) * 20);
    // Crash at section start
    if (b === 0 || b === 32 || b === 64 || b === 96) this.playCrash(now);

    // ── Bass ── 16th note patterns with groove
    const bassPattern = this.getBassPattern(section);
    const bassIdx = b % 32;
    if (bassPattern[bassIdx] > 0) {
      this.playBass(now, bassPattern[bassIdx], 0.13);
    }

    // ── Lead melody (stage-specific) ──
    const leadNote = this.getLeadNote(b, section);
    if (leadNote > 0) this.playGuitarLead(now, leadNote);

    // ── Rhythm guitar / power chords ──
    if (b % 4 === 0) {
      const chords = this.getChords(section);
      const ci = Math.floor(b / 8) % 4;
      this.playPowerChord(now, chords[ci]);
    }

    // ── Arp fill ──
    if (b === 29 || b === 61 || b === 93 || b === 125) this.playArpFill(now);

    // ── Stage-specific accent ──
    if (this.stageId === 'factory' && b % 16 === 8) this.playMetalHit(now);
    if (this.stageId === 'china' && b % 32 === 16) this.playGongAccent(now);
  }

  private getBassPattern(section: number): number[] {
    // E2=82.4, A2=110, B2=123.5, C3=130.8, D3=146.8, G2=98
    const patterns: number[][] = [
      // Section A: driving E minor
      [82.4,0,82.4,0, 110,0,0,82.4, 82.4,0,82.4,0, 123.5,0,110,0,
       82.4,0,82.4,0, 98,0,0,82.4, 82.4,0,110,0, 130.8,0,0,0],
      // Section B: more movement
      [110,0,110,0, 130.8,0,0,110, 123.5,0,123.5,0, 110,0,98,0,
       82.4,0,82.4,0, 98,0,110,0, 130.8,0,110,0, 82.4,0,0,0],
    ];
    return patterns[section % 2];
  }

  private getLeadNote(b: number, section: number): number {
    // KOF-style rock melody: memorable, energetic phrases
    // Notes as Hz, 0 = rest
    const melodyA: number[] = [
      // Phrase 1 (bars 1-4)
      659.3,0,784,0, 659.3,587.3,0,0, 523.3,0,587.3,659.3, 0,0,784,0,
      // Phrase 2 (bars 5-8)
      659.3,0,523.3,0, 440,0,0,523.3, 587.3,0,659.3,0, 784,0,0,0,
      // Phrase 3 (bars 9-12)
      880,0,784,659.3, 523.3,0,587.3,0, 659.3,784,0,880, 784,659.3,0,0,
      // Phrase 4 (bars 13-16) — resolution
      523.3,0,440,0, 392,0,440,523.3, 587.3,0,523.3,0, 440,0,0,0,
    ];
    const melodyB: number[] = [
      // Higher energy variation
      1046.5,0,880,0, 784,0,659.3,0, 784,880,0,1046.5, 880,784,0,0,
      659.3,0,784,0, 880,0,1046.5,0, 1174.7,0,1046.5,880, 784,0,0,0,
      880,0,1046.5,0, 1174.7,1046.5,880,0, 784,0,659.3,0, 784,880,0,0,
      1046.5,880,784,0, 659.3,0,784,880, 1046.5,0,880,0, 659.3,0,0,0,
    ];
    const melody = section < 2 ? melodyA : melodyB;
    return melody[b % melody.length];
  }

  private getChords(section: number): number[][] {
    // Power chords: root + fifth
    if (section < 2) {
      return [[82.4, 123.5], [110, 164.8], [98, 146.8], [82.4, 123.5]];
    }
    return [[110, 164.8], [130.8, 196], [123.5, 185], [110, 164.8]];
  }

  // ─── Title Theme (100 BPM, 64 sub-beats) ───

  private playTitleBeat(now: number): void {
    if (!this.ctx || !this.masterGain) return;
    const b = this.beat;
    const b8 = b % 8;

    // Sparse drums
    if (b8 === 0) this.playKick(now, 0.35);
    if (b8 === 4) this.playSnare(now, 0.15);
    if (b % 2 === 0) this.playHihat(now, 0.03, false);

    // Slow arpeggiated pad
    if (b % 2 === 0) {
      const arpNotes = [261.6, 329.6, 392, 523.3, 392, 329.6, 261.6, 196,
                        220, 277.2, 329.6, 440, 329.6, 277.2, 220, 164.8,
                        246.9, 311.1, 370, 493.9, 370, 311.1, 246.9, 185,
                        261.6, 329.6, 392, 523.3, 440, 392, 329.6, 261.6];
      const n = arpNotes[(b / 2) % arpNotes.length];
      this.playSoftLead(now, n, 0.035);
    }

    // Slow bass
    if (b % 8 === 0) {
      const bassNotes = [65.4, 65.4, 55, 55, 73.4, 73.4, 61.7, 65.4];
      this.playBass(now, bassNotes[(b / 8) % 8], 0.1);
    }

    // Gentle melody every 4 beats
    if (b % 4 === 2) {
      const melody = [523.3, 0, 659.3, 0, 587.3, 523.3, 0, 440,
                      392, 0, 440, 0, 523.3, 0, 440, 392];
      const n = melody[(b / 4) % melody.length];
      if (n > 0) this.playSoftLead(now, n, 0.05);
    }

    // Pad chord every 16 beats
    if (b % 16 === 0) {
      const chords = [[261.6, 329.6, 392], [220, 277.2, 329.6], [246.9, 311.1, 370], [261.6, 329.6, 392]];
      this.playPad(now, chords[(b / 16) % 4], 1.5);
    }
  }

  // ─── Enhanced Synthesis ───

  private playKick(time: number, vol: number): void {
    if (!this.ctx || !this.masterGain) return;
    // Layered: sine body + click transient
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(25, time + 0.1);
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
    osc.connect(gain).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.22);
    // Click transient
    const click = this.ctx.createOscillator();
    const cg = this.ctx.createGain();
    click.type = 'square';
    click.frequency.setValueAtTime(800, time);
    click.frequency.exponentialRampToValueAtTime(100, time + 0.02);
    cg.gain.setValueAtTime(vol * 0.3, time);
    cg.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
    click.connect(cg).connect(this.masterGain);
    click.start(time); click.stop(time + 0.05);
  }

  private playSnare(time: number, vol: number): void {
    if (!this.ctx || !this.masterGain) return;
    // Noise burst
    const size = Math.floor(this.ctx.sampleRate * 0.08);
    const buf = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(vol, time);
    ng.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 3500;
    bp.Q.value = 0.7;
    noise.connect(bp).connect(ng).connect(this.masterGain);
    noise.start(time); noise.stop(time + 0.15);
    // Body tone
    const osc = this.ctx.createOscillator();
    const og = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.04);
    og.gain.setValueAtTime(vol * 0.6, time);
    og.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
    osc.connect(og).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.08);
  }

  private playHihat(time: number, vol: number, open: boolean): void {
    if (!this.ctx || !this.masterGain) return;
    const dur = open ? 0.12 : 0.035;
    const size = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = open ? 7000 : 9500;
    noise.connect(hp).connect(gain).connect(this.masterGain);
    noise.start(time); noise.stop(time + dur + 0.01);
  }

  private playCrash(time: number): void {
    if (!this.ctx || !this.masterGain) return;
    const size = Math.floor(this.ctx.sampleRate * 0.4);
    const buf = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (size * 0.3));
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 5000;
    noise.connect(hp).connect(gain).connect(this.masterGain);
    noise.start(time); noise.stop(time + 0.4);
  }

  private playBass(time: number, freq: number, vol: number): void {
    if (!this.ctx || !this.masterGain || freq === 0) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.005);
    gain.gain.setValueAtTime(vol * 0.85, time + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 400;
    lp.Q.value = 2;
    osc.connect(lp).connect(gain).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.25);
  }

  private playGuitarLead(time: number, freq: number, vol: number = 0.06): void {
    if (!this.ctx || !this.masterGain) return;
    // Layered sawtooth + square for guitar-like tone
    const saw = this.ctx.createOscillator();
    const sqr = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const mix = this.ctx.createGain();
    saw.type = 'sawtooth';
    saw.frequency.value = freq;
    sqr.type = 'square';
    sqr.frequency.value = freq;
    // Vibrato
    const lfo = this.ctx.createOscillator();
    const lfoG = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 5.5;
    lfoG.gain.value = 4;
    lfo.connect(lfoG);
    lfoG.connect(saw.frequency);
    lfoG.connect(sqr.frequency);
    lfo.start(time); lfo.stop(time + 0.2);
    // ADSR
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.008);
    gain.gain.setValueAtTime(vol * 0.75, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.17);
    // Distortion-like filtering
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2500;
    lp.Q.value = 1;
    const gGain = this.ctx.createGain();
    gGain.gain.value = 0.6;
    saw.connect(gGain);
    sqr.connect(gGain);
    gGain.connect(lp).connect(gain).connect(this.masterGain);
    saw.start(time); saw.stop(time + 0.2);
    sqr.start(time); sqr.stop(time + 0.2);
  }

  private playSoftLead(time: number, freq: number, vol: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.05);
    gain.gain.setValueAtTime(vol * 0.8, time + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
    osc.connect(gain).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.38);
  }

  private playPowerChord(time: number, freqs: number[]): void {
    if (!this.ctx || !this.masterGain) return;
    for (const freq of freqs) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.03, time + 0.01);
      gain.gain.setValueAtTime(0.025, time + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 600;
      osc.connect(lp).connect(gain).connect(this.masterGain);
      osc.start(time); osc.stop(time + 0.28);
    }
  }

  private playPad(time: number, freqs: number[], duration: number = 0.6): void {
    if (!this.ctx || !this.masterGain) return;
    for (const freq of freqs) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.03, time + duration * 0.25);
      gain.gain.setValueAtTime(0.03, time + duration * 0.6);
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
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, time + 0.12);
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    osc.connect(gain).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.18);
  }

  private playArpFill(time: number): void {
    if (!this.ctx || !this.masterGain) return;
    const notes = [659.3, 784, 880, 1046.5, 1174.7];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      const t = time + i * 0.035;
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(gain).connect(this.masterGain!);
      osc.start(t); osc.stop(t + 0.1);
    });
  }

  private playMetalHit(time: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(120, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.15);
    gain.gain.setValueAtTime(0.06, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
    osc.connect(gain).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.22);
  }

  private playGongAccent(time: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 180;
    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 200;
    bp.Q.value = 5;
    osc.connect(bp).connect(gain).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.65);
  }
}

export const bgm = new BGMPlayer();
