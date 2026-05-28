/**
 * BGM — KOF2002-style chiptune battle music
 * Stage-aware tracks with rock/metal energy
 * v5: Synthesis primitives extracted to bgmSynthesis.ts
 *
 * Stage scales:
 *   temple  — C major pentatonic (C-D-E-G-A), square lead, bell accents, shamisen/koto
 *   china   — G major pentatonic high (G-A-B-D-E), triangle lead, gong/flute, erhu vibrato
 *   factory — E minor (E-F#-G-A-B-C-D), sawtooth lead, metallic percussion, industrial
 *   street  — A blues (A-C-D-Eb-E-G), distorted saw lead, blues bends, walking bass
 *   orochi  — diminished scale (C-D-Eb-F#-G-A-Bb-B), square+lowpass, choir pad, dark
 */

import {
  type SynthCtx,
  playKick as _playKick,
  playSnare as _playSnare,
  playHihat as _playHihat,
  playCrash as _playCrash,
  playBass as _playBass,
  playGuitarLead as _playGuitarLead,
  playSoftLead as _playSoftLead,
  playPowerChord as _playPowerChord,
  playPad as _playPad,
  playSubPad as _playSubPad,
  playTom as _playTom,
  playArpFill as _playArpFill,
  playTransitionFill as _playTransitionFill,
  playMetalHit as _playMetalHit,
  playGongAccent as _playGongAccent,
  playBellAccent as _playBellAccent,
  playRim as _playRim,
} from './bgmSynthesis.js';

export class BGMPlayer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compGain: GainNode | null = null;
  private sidechainGain: GainNode | null = null;
  private isPlaying = false;
  private loopTimer: ReturnType<typeof setInterval> | null = null;
  private volume = 0.25;
  private beat = 0;
  private track: 'title' | 'battle' = 'battle';
  private stageId: string = 'temple';

  // Crossfade state
  private crossfadeGain: GainNode | null = null;
  private crossfadeTarget: string = '';
  private crossfadeActive = false;

  private synth(): SynthCtx { return { ctx: this.ctx!, masterGain: this.masterGain! }; }

  /** Create a procedurally generated impulse response for reverb. */
  private createReverbIR(duration: number = 1.5, decay: number = 2.0): AudioBuffer {
    const rate = this.ctx!.sampleRate;
    const length = Math.ceil(rate * duration);
    const ir = this.ctx!.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = ir.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return ir;
  }

  start(track: 'title' | 'battle' = 'battle'): void {
    if (this.isPlaying) this.stop();
    this.track = track;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.volume;

    // Crossfade gain node: sits between masterGain and sidechain
    this.crossfadeGain = this.ctx.createGain();
    this.crossfadeGain.gain.value = 1.0;

    // Sidechain gain: allows SFX to temporarily dip BGM volume
    this.sidechainGain = this.ctx.createGain();
    this.sidechainGain.gain.value = 1.0;

    this.compGain = this.ctx.createGain();
    this.compGain.gain.value = 1;
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 4;
    comp.attack.value = 0.003;
    comp.release.value = 0.15;

    // Reverb: convolver + wet gain
    const convolver = this.ctx.createConvolver();
    convolver.buffer = this.createReverbIR(1.5, 2.0);
    const reverbGain = this.ctx.createGain();
    reverbGain.gain.value = 0.15;

    // Dry path: masterGain -> crossfadeGain -> sidechainGain -> comp -> compGain -> destination
    this.masterGain.connect(this.crossfadeGain);
    this.crossfadeGain.connect(this.sidechainGain);
    this.sidechainGain.connect(comp);
    comp.connect(this.compGain);
    this.compGain.connect(this.ctx.destination);

    // Wet path: masterGain -> convolver -> reverbGain -> comp
    this.masterGain.connect(convolver);
    convolver.connect(reverbGain);
    reverbGain.connect(comp);

    this.isPlaying = true;
    this.beat = 0;
    this.scheduleLoop();
  }

  setStage(id: string): void {
    // If already playing this stage, no-op
    if (this.stageId === id) return;

    if (this.isPlaying && this.track === 'battle') {
      // Crossfade: schedule a smooth transition over 2 seconds
      this.crossfadeTarget = id;
      this.crossfadeActive = true;
      if (this.ctx && this.crossfadeGain) {
        const now = this.ctx.currentTime;
        this.crossfadeGain.gain.setValueAtTime(this.crossfadeGain.gain.value, now);
        this.crossfadeGain.gain.linearRampToValueAtTime(0.0, now + 1.0);
        // After 1s fade-out, switch stage and fade back in
        // We use a delayed approach: switch the stage after half the fade
        setTimeout(() => {
          this.stageId = this.crossfadeTarget;
        }, 1000);
        // Fade back in from 1s to 2s
        this.crossfadeGain.gain.linearRampToValueAtTime(1.0, now + 2.0);
        setTimeout(() => {
          this.crossfadeActive = false;
        }, 2000);
      }
    } else {
      this.stageId = id;
    }
  }

  stop(): void {
    this.isPlaying = false;
    this.crossfadeActive = false;
    if (this.loopTimer) { clearInterval(this.loopTimer); this.loopTimer = null; }
    if (this.ctx) { this.ctx.close(); this.ctx = null; }
    this.masterGain = null;
    this.compGain = null;
    this.sidechainGain = null;
    this.crossfadeGain = null;
  }

  toggle(): boolean {
    if (this.isPlaying) this.stop(); else this.start(this.track);
    return this.isPlaying;
  }

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.masterGain) this.masterGain.gain.value = this.volume;
  }

  /** SFX-triggered sidechain dip: briefly lowers BGM volume for clarity. */
  duck(dipDb: number = 0.7, recoveryMs: number = 150): void {
    if (!this.sidechainGain || !this.isPlaying) return;
    const now = this.ctx!.currentTime;
    this.sidechainGain.gain.setValueAtTime(this.sidechainGain.gain.value, now);
    this.sidechainGain.gain.linearRampToValueAtTime(dipDb, now + 0.01);
    this.sidechainGain.gain.linearRampToValueAtTime(1.0, now + recoveryMs / 1000);
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

    const b = this.beat;
    const b8 = b % 8;
    const section = Math.floor(b / 32);
    const stage = this.stageId;
    const barInSection = Math.floor((b % 32) / 8); // 0-3, which bar within section
    const isPhraseBoundary = (b % 32 === 28 || b % 32 === 29 || b % 32 === 30 || b % 32 === 31);

    // ── Drums ──
    if (section === 0 || section === 2) {
      if (b8 === 0 || b8 === 4) this.playKick(now, 0.55);
      if (b8 === 6) this.playKick(now, 0.3);
      if (b8 === 7 && b % 32 >= 28) this.playKick(now, 0.25);
    } else if (section === 1) {
      if (b8 === 0 || b8 === 3 || b8 === 4) this.playKick(now, 0.5);
      if (b8 === 7) this.playKick(now, 0.25);
      if (b8 === 5 && b % 16 === 13) this.playKick(now, 0.2);
    } else {
      if (b8 === 0 || b8 === 3 || b8 === 4 || b8 === 6) this.playKick(now, 0.5);
      if (b8 === 7) this.playKick(now, 0.3);
      // Double-time kick on transitions at section 3
      if (barInSection === 3 && b8 === 2) this.playKick(now, 0.2);
    }

    // Main snares
    if (b8 === 2 || b8 === 6) this.playSnare(now, 0.22);
    // Snare fills at phrase boundaries
    if (b === 30 || b === 31) this.playSnare(now, 0.18);
    if (b === 62 || b === 63) this.playSnare(now, 0.22);
    if (b === 94) this.playSnare(now, 0.15);
    if (b === 126 || b === 127) this.playSnare(now, 0.22);

    // Ghost notes: subtle snares between main beats in sections 2+
    if (section >= 2 && b8 === 1) this.playSnare(now, 0.06);
    if (section >= 2 && b8 === 5) this.playSnare(now, 0.06);
    // Additional ghost notes in section 3 for intensity
    if (section >= 3 && b8 === 3) this.playSnare(now, 0.04);
    if (section >= 3 && b8 === 7) this.playSnare(now, 0.05);

    // Dynamic hi-hat patterns
    if (b % 2 === 0) this.playHihat(now, 0.07, false);
    if (b % 2 === 1) this.playHihat(now, 0.04, false);
    // Open hi-hat accents
    if (b8 === 7 && (section === 0 || section === 2)) this.playHihat(now, 0.1, true);
    if (b8 === 3 && section >= 2) this.playHihat(now, 0.06, true);
    // Extra open hi-hats in late sections
    if (section >= 3 && b8 === 5) this.playHihat(now, 0.05, true);
    if (b >= 124 && b <= 127 && b % 2 === 0) this.playHihat(now, 0.08, false);

    // Tom fills
    if (b >= 28 && b <= 31) this.playTom(now, 180 - (b - 28) * 20);
    if (b >= 60 && b <= 63) this.playTom(now, 200 - (b - 60) * 25);
    if (b >= 92 && b <= 95) this.playTom(now, 220 - (b - 92) * 20);
    if (b === 44 || b === 45) this.playTom(now, 160);
    if (b === 108 || b === 109) this.playTom(now, 200);

    if (b === 0 || b === 32 || b === 64 || b === 96) this.playCrash(now);
    if (b === 16 || b === 48 || b === 80 || b === 112) this.playCrash(now, 0.06);

    // ── Phrase boundary fills (every 8 bars = at beat 28-31 of each section) ──
    if (isPhraseBoundary && b % 32 === 28) this.playPhraseFill(now, stage);
    // Extra fill at bar 2 of each section for rhythmic interest
    if (b % 32 === 20) this.playMiniFill(now, stage);

    // ── Bass: stage-aware walking bass ──
    const bassPattern = this.getBassPattern(stage, section);
    const bassIdx = b % 32;
    if (bassPattern[bassIdx] > 0) {
      this.playBass(now, bassPattern[bassIdx], 0.13);
    }

    // ── Lead melody: stage-specific ──
    const leadNote = this.getLeadNote(stage, b, section);
    if (leadNote > 0) this.playStageLead(now, stage, leadNote);

    // ── Stage-specific melodic layers ──
    this.playStageMelodicLayer(now, stage, b, section);

    // ── Rhythm guitar / power chords: stage-aware ──
    if (b % 4 === 0) {
      const chords = this.getChords(stage, section);
      const ci = Math.floor(b / 8) % 4;
      this.playPowerChord(now, chords[ci]);
    }
    if (section >= 2 && b % 2 === 1) {
      const chords = this.getChords(stage, section);
      const ci = Math.floor(b / 8) % 4;
      this.playPowerChord(now, chords[ci], 0.015);
    }

    // ── Pad layer: every 16 beats, creating spatial depth ──
    if (b % 16 === 0) {
      const padChords = this.getPadChords(stage, section);
      const pi = Math.floor(b / 16) % padChords.length;
      if (stage === 'orochi') {
        this.playOrochiChoirPad(now, padChords[pi], 0.6);
      } else {
        this.playBattlePad(now, padChords[pi], 0.6);
      }
    }

    // ── Arp fill ──
    if (b === 29 || b === 61 || b === 93 || b === 125) this.playArpFill(now);
    if (section >= 2 && (b === 14 || b === 46)) this.playArpFill(now, 0.04);

    // ── Section transition fill: ascending arp at section boundaries ──
    if (b === 31 || b === 63 || b === 95) this.playTransitionFill(now);

    // ── Stage-specific accent: every 8 beats ──
    if (b % 8 === 0) {
      if (stage === 'temple') this.playBellAccent(now);
      else if (stage === 'china') this.playGongAccent(now);
      else if (stage === 'factory') this.playMetalHit(now);
      else if (stage === 'street') this.playStreetAccent(now);
      else if (stage === 'orochi') this.playDarkAccent(now);
    }
    // Secondary accents on beat 4
    if (b8 === 4 && b % 16 === 12) {
      if (stage === 'temple') this.playBellAccent(now, 0.02);
      else if (stage === 'china') this.playFluteAccent(now);
      else if (stage === 'orochi') this.playDarkAccent(now, 0.03);
    }

    // ── Factory: Industrial percussion layer (irregular metallic clanks) ──
    if (stage === 'factory' && b % 8 === 5 && section % 2 === 0) this.playIndustrialClank(now);
    if (stage === 'factory' && b % 8 === 3 && section % 2 === 1) this.playIndustrialClank(now, 0.03);
    if (stage === 'factory' && b === 50) this.playIndustrialClank(now, 0.05);
  }

  // ─── Stage melodic layer (koto arpeggios, erhu sustain, diminished runs, etc.) ───

  private playStageMelodicLayer(time: number, stage: string, b: number, section: number): void {
    switch (stage) {
      case 'temple':
        // Koto-like arpeggios: rapid ascending/descending patterns every 16 beats
        if (b % 16 === 8) this.playKotoArpeggio(time, section >= 2);
        // Additional shamisen pluck pattern on offbeats
        if (section >= 2 && b % 8 === 6 && b % 16 !== 14) this.playShamisenPluck(time);
        break;
      case 'china':
        // Erhu-like sustained melody: long notes with vibrato
        if (b % 16 === 0) this.playErhuSustain(time, section);
        // Trill ornament on beat 12 of each 16-beat phrase
        if (b % 16 === 12 && section >= 1) this.playErhuTrill(time);
        break;
      case 'factory':
        // Darker atmosphere: low drone hits on downbeats
        if (b % 32 === 0) this.playIndustrialDrone(time);
        // Metallic screech at phrase midpoints
        if (b % 16 === 8 && section >= 2) this.playMetalScreech(time);
        break;
      case 'street':
        // Walking bass pickup notes between main bass notes
        if (b % 8 === 7 && section >= 1) this.playWalkingBassPickup(time, Math.floor(b / 8) % 4);
        break;
      case 'orochi':
        // Ominous diminished runs at section boundaries
        if (b % 32 === 16) this.playDiminishedRun(time, section >= 2);
        // Low rumble pulses
        if (b % 8 === 4 && section >= 1) this.playDarkRumble(time);
        break;
    }
  }

  // ─── Stage-specific lead notes ───

  private getLeadNote(stage: string, b: number, section: number): number {
    const melodies = this.getStageMelody(stage);
    const melody = section < 2 ? melodies[0] : melodies[1];
    return melody[b % melody.length];
  }

  private getStageMelody(stage: string): [number[], number[]] {
    switch (stage) {
      case 'temple':
        return [
          // A: C major pentatonic — serene Japanese temple
          // C5=523.3, D5=587.3, E5=659.3, G5=784, A5=880
          // Ascending phrase pattern with koto-like spacing
          [523.3,0,659.3,0, 784,0,880,0, 784,659.3,587.3,0, 523.3,0,0,0,
           587.3,0,659.3,784, 880,0,784,0, 659.3,587.3,523.3,0, 587.3,0,0,0,
           // Descending phrase
           880,0,784,659.3, 587.3,0,523.3,0, 587.3,659.3,784,0, 659.3,0,0,0,
           523.3,0,587.3,659.3, 784,0,880,784, 659.3,587.3,523.3,0, 0,0,0,0],
          // B: More active pentatonic variation with wider intervals
          [880,0,784,659.3, 784,0,880,0, 1046.5,880,784,659.3, 587.3,0,0,0,
           523.3,0,587.3,659.3, 784,0,659.3,587.3, 523.3,0,587.3,0, 659.3,0,0,0,
           // Climax phrase ascending to high C
           1046.5,0,880,784, 659.3,784,880,1046.5, 880,784,659.3,0, 587.3,0,0,0,
           523.3,0,659.3,784, 880,0,784,659.3, 587.3,523.3,0,0, 0,0,0,0],
        ];
      case 'china':
        return [
          // A: G major pentatonic high — bright piercing Chinese style
          // G5=784, A5=880, B5=987.8, D6=1174.7, E6=1318.5
          // More pentatonic variation with ornamental grace notes
          [784,0,880,987.8, 1174.7,0,987.8,880, 784,0,880,0, 987.8,0,0,0,
           1174.7,0,1318.5,1174.7, 987.8,880,784,0, 880,987.8,1174.7,0, 987.8,0,0,0,
           // Descending with ornamental turns
           1318.5,1174.7,987.8,880, 784,0,880,987.8, 1174.7,0,987.8,880, 784,0,0,0,
           880,0,987.8,1174.7, 1318.5,0,1174.7,987.8, 880,784,0,0, 0,0,0,0],
          // B: High-register florid variation
          [1318.5,0,1174.7,987.8, 1174.7,1318.5,0,0, 1568,1318.5,1174.7,987.8, 880,0,0,0,
           1174.7,0,987.8,880, 784,880,987.8,1174.7, 1318.5,0,1174.7,0, 987.8,880,0,0,
           1568,0,1318.5,1174.7, 1318.5,1568,0,0, 1760,1568,1318.5,1174.7, 987.8,0,0,0,
           1174.7,987.8,880,784, 880,987.8,1174.7,0, 1318.5,0,784,0, 0,0,0,0],
        ];
      case 'factory':
        return [
          // A: E minor — industrial rock
          // E5=659.3, F#5=740, G5=784, A5=880, B5=987.8, C6=1046.5, D6=1174.7
          // Darker, more angular phrases
          [659.3,0,740,0, 784,740,659.3,0, 880,0,784,0, 740,659.3,0,0,
           987.8,0,880,784, 740,0,659.3,740, 880,784,0,0, 659.3,0,0,0,
           // Ascending tension phrase
           1174.7,1046.5,987.8,880, 784,0,880,987.8, 1046.5,0,1174.7,0, 987.8,880,0,0,
           784,0,740,659.3, 740,880,987.8,0, 880,784,740,659.3, 0,0,0,0],
          // B: More aggressive rock with wider jumps
          [1174.7,0,1046.5,880, 784,880,1046.5,0, 1174.7,0,1318.5,1174.7, 1046.5,0,0,0,
           880,784,740,659.3, 740,0,880,987.8, 1046.5,1174.7,0,0, 987.8,0,0,0,
           1318.5,0,1174.7,1046.5, 987.8,880,784,0, 880,987.8,1046.5,1174.7, 1318.5,0,0,0,
           1174.7,1046.5,880,784, 740,0,659.3,740, 880,0,659.3,0, 0,0,0,0],
        ];
      case 'street':
        return [
          // A: A blues — hard rock with bent notes
          // A4=440, C5=523.3, D5=587.3, Eb5=622.3, E5=659.3, G5=784, A5=880
          // Blues-like phrasing with blue notes (Eb)
          [440,0,523.3,0, 587.3,622.3,659.3,0, 587.3,0,523.3,440, 523.3,0,0,0,
           659.3,0,622.3,587.3, 523.3,0,440,523.3, 587.3,659.3,784,0, 659.3,0,0,0,
           // Blues turnaround feel
           880,784,659.3,622.3, 587.3,523.3,440,0, 523.3,587.3,659.3,622.3, 587.3,0,0,0,
           523.3,0,587.3,622.3, 659.3,622.3,587.3,523.3, 440,523.3,0,0, 0,0,0,0],
          // B: Harder blues-rock variation
          [880,0,784,659.3, 622.3,587.3,523.3,0, 659.3,784,880,0, 784,659.3,0,0,
           622.3,0,587.3,523.3, 440,0,523.3,587.3, 659.3,622.3,587.3,0, 659.3,784,0,0,
           // Climax with high bent notes
           1046.5,880,784,659.3, 622.3,659.3,784,880, 1046.5,0,880,784, 659.3,587.3,0,0,
           784,659.3,587.3,523.3, 587.3,659.3,784,0, 880,0,659.3,0, 440,0,0,0],
        ];
      case 'orochi':
      default:
        return [
          // A: Diminished scale — dark oppressive
          // C5=523.3, D5=587.3, Eb5=622.3, F#5=740, G5=784, A5=880, Bb5=932.3, B5=987.8
          // More angular diminished phrases with tritone emphasis
          [523.3,0,622.3,740, 622.3,587.3,523.3,0, 587.3,622.3,740,880, 740,622.3,0,0,
           784,0,740,622.3, 587.3,523.3,587.3,0, 622.3,740,880,740, 622.3,0,0,0,
           // Ominous descending sequence
           932.3,880,784,740, 622.3,587.3,523.3,0, 587.3,622.3,740,784, 880,740,0,0,
           622.3,0,587.3,523.3, 587.3,622.3,740,880, 622.3,523.3,0,0, 0,0,0,0],
          // B: Deeper dark variation with chromatic movement
          [987.8,932.3,880,0, 784,740,622.3,740, 880,932.3,987.8,0, 1046.5,0,0,0,
           784,0,622.3,587.3, 523.3,0,587.3,622.3, 740,784,880,932.3, 784,0,0,0,
           // Climax: chromatic ascent
           1046.5,987.8,932.3,880, 784,740,784,880, 932.3,987.8,1046.5,0, 987.8,932.3,0,0,
           880,740,622.3,587.3, 622.3,740,880,987.8, 784,0,523.3,0, 0,0,0,0],
        ];
    }
  }

  // ─── Stage-specific bass patterns ───

  private getBassPattern(stage: string, section: number): number[] {
    switch (stage) {
      case 'temple': {
        // C major pentatonic root: C2=65.4, D2=73.4, E2=82.4, G2=98, A2=110
        const pA: number[] = [
          65.4,0,65.4,82.4, 98,0,65.4,0, 82.4,0,98,0, 110,0,82.4,0,
          65.4,0,73.4,0, 82.4,0,98,82.4, 110,0,98,82.4, 65.4,0,0,0];
        const pB: number[] = [
          110,0,98,82.4, 65.4,0,73.4,65.4, 82.4,0,98,110, 98,0,82.4,0,
          65.4,0,82.4,0, 98,0,110,98, 82.4,0,65.4,73.4, 65.4,0,0,0];
        return section % 2 === 0 ? pA : pB;
      }
      case 'china': {
        // G major pentatonic root: G2=98, A2=110, B2=123.5, D3=146.8, E3=164.8
        const pA: number[] = [
          98,0,98,123.5, 146.8,0,110,0, 123.5,0,146.8,0, 164.8,0,123.5,0,
          98,0,110,0, 123.5,0,146.8,123.5, 164.8,0,146.8,123.5, 98,0,0,0];
        const pB: number[] = [
          146.8,0,123.5,110, 98,0,110,123.5, 146.8,0,164.8,146.8, 123.5,0,98,0,
          110,0,123.5,0, 146.8,0,164.8,146.8, 123.5,0,110,98, 98,0,0,0];
        return section % 2 === 0 ? pA : pB;
      }
      case 'factory': {
        // E minor: E2=82.4, F#2=92.5, G2=98, A2=110, B2=123.5, C3=130.8, D3=146.8
        const pA: number[] = [
          82.4,0,82.4,98, 110,0,82.4,0, 82.4,0,123.5,0, 110,0,82.4,0,
          82.4,0,92.5,0, 110,0,82.4,98, 123.5,0,110,82.4, 130.8,0,0,0];
        const pB: number[] = [
          110,0,110,123.5, 130.8,0,110,92.5, 123.5,0,123.5,130.8, 110,0,98,0,
          82.4,0,98,0, 110,0,123.5,110, 130.8,0,110,92.5, 82.4,0,0,0];
        return section % 2 === 0 ? pA : pB;
      }
      case 'street': {
        // A blues: A2=110, C3=130.8, D3=146.8, Eb3=155.6, E3=164.8, G2=98
        // Walking bass pattern with more movement
        const pA: number[] = [
          110,0,110,130.8, 146.8,155.6,146.8,130.8, 110,0,98,110, 130.8,0,110,0,
          146.8,0,130.8,110, 98,110,130.8,146.8, 155.6,146.8,130.8,0, 110,0,0,0];
        const pB: number[] = [
          146.8,130.8,110,98, 110,130.8,146.8,155.6, 164.8,146.8,130.8,0, 146.8,155.6,0,0,
          110,0,130.8,146.8, 155.6,146.8,130.8,110, 98,110,130.8,146.8, 110,0,0,0];
        return section % 2 === 0 ? pA : pB;
      }
      case 'orochi':
      default: {
        // Diminished root: C2=65.4, D2=73.4, Eb2=77.8, F#2=92.5, G2=98, A2=110, Bb2=116.5, B2=123.5
        const pA: number[] = [
          65.4,0,65.4,77.8, 92.5,0,65.4,0, 73.4,0,92.5,0, 98,0,73.4,0,
          65.4,0,77.8,0, 92.5,0,98,77.8, 110,0,92.5,73.4, 65.4,0,0,0];
        const pB: number[] = [
          110,0,98,92.5, 77.8,0,73.4,65.4, 77.8,0,92.5,98, 116.5,0,110,0,
          98,0,77.8,73.4, 65.4,0,73.4,77.8, 92.5,0,98,110, 65.4,0,0,0];
        return section % 2 === 0 ? pA : pB;
      }
    }
  }

  // ─── Stage-specific chord progressions ───

  private getChords(stage: string, section: number): number[][] {
    switch (stage) {
      case 'temple': {
        // C - Am - F - G (I - vi - IV - V)
        if (section < 2) return [
          [65.4, 98, 130.8],   // C:  C + G + E(high)
          [55, 82.4, 130.8],   // Am: A + E + C(high)
          [87.3, 130.8, 174.6],// F:  F + C + A(high)
          [98, 123.5, 146.8],  // G:  G + D + D(high)
        ];
        return [
          [65.4, 82.4, 98],
          [55, 65.4, 82.4],
          [87.3, 110, 130.8],
          [98, 123.5, 146.8],
        ];
      }
      case 'china': {
        // G - Em - C - D (I - vi - IV - V)
        if (section < 2) return [
          [98, 123.5, 146.8],  // G
          [82.4, 123.5, 164.8],// Em
          [65.4, 98, 130.8],   // C
          [73.4, 110, 146.8],  // D
        ];
        return [
          [98, 123.5, 164.8],
          [82.4, 98, 123.5],
          [65.4, 82.4, 98],
          [73.4, 98, 123.5],
        ];
      }
      case 'factory': {
        // Em - C - G - D (i - VI - III - VII)
        if (section < 2) return [
          [82.4, 123.5, 164.8],// Em
          [65.4, 98, 130.8],   // C
          [98, 146.8, 196],    // G
          [73.4, 110, 146.8],  // D
        ];
        return [
          [82.4, 98, 123.5],
          [65.4, 82.4, 98],
          [98, 123.5, 146.8],
          [73.4, 92.5, 110],
        ];
      }
      case 'street': {
        // A - D - E - A (I - IV - V - I) blues
        if (section < 2) return [
          [110, 164.8, 220],   // A
          [73.4, 110, 146.8],  // D
          [82.4, 123.5, 164.8],// E
          [110, 164.8, 220],   // A
        ];
        return [
          [110, 130.8, 164.8],
          [73.4, 92.5, 110],
          [82.4, 110, 130.8],
          [110, 146.8, 164.8],
        ];
      }
      case 'orochi':
      default: {
        // Co - F#o - Go - Abo (diminished chord cycle)
        if (section < 2) return [
          [65.4, 77.8, 92.5],  // Cdim
          [92.5, 110, 130.8],  // F#dim
          [98, 116.5, 138.6],  // Gdim
          [116.5, 138.6, 164.8],// Abdim
        ];
        return [
          [65.4, 77.8, 98],
          [92.5, 116.5, 138.6],
          [98, 116.5, 130.8],
          [110, 130.8, 155.6],
        ];
      }
    }
  }

  // ─── Pad chord data (detuned sine wave layers) ───

  private getPadChords(stage: string, _section: number): number[][] {
    switch (stage) {
      case 'temple':
        return [[261.6, 329.6, 392, 493.9], [220, 261.6, 329.6, 392]];
      case 'china':
        return [[196, 246.9, 293.7, 370], [164.8, 196, 246.9, 293.7]];
      case 'factory':
        return [[164.8, 196, 246.9, 293.7], [130.8, 164.8, 196, 246.9]];
      case 'street':
        return [[220, 261.6, 329.6, 392], [196, 220, 261.6, 329.6]];
      case 'orochi':
      default:
        return [[261.6, 311.1, 370, 440], [220, 261.6, 311.1, 370]];
    }
  }

  // ─── Stage-specific lead timbres ───

  private playStageLead(time: number, stage: string, freq: number): void {
    switch (stage) {
      case 'temple':
        this.playTempleLead(time, freq);
        break;
      case 'china':
        this.playChinaLead(time, freq);
        break;
      case 'factory':
        this.playFactoryLead(time, freq);
        break;
      case 'street':
        this.playStreetLead(time, freq);
        break;
      case 'orochi':
        this.playOrochiLead(time, freq);
        break;
      default:
        this.playGuitarLead(time, freq);
    }
  }

  private playTempleLead(time: number, freq: number): void {
    if (!this.ctx || !this.masterGain) return;
    const vol = 0.05;
    // Shamisen-like: square wave with very short attack and quick decay (plucked timbre)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    // Subtle vibrato (shamisen has less vibrato than erhu)
    const lfo = this.ctx.createOscillator();
    const lfoG = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 4;
    lfoG.gain.value = 2;
    lfo.connect(lfoG);
    lfoG.connect(osc.frequency);
    lfo.start(time); lfo.stop(time + 0.22);
    // Shamisen pluck envelope: very fast attack, quick decay
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.003);  // Very fast attack
    gain.gain.setValueAtTime(vol * 0.6, time + 0.02);       // Quick drop
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    // Lowpass for woody body
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2000;
    lp.Q.value = 0.7;
    osc.connect(lp).connect(gain).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.18);
    // Fifth harmonic accent (shamisen body resonance)
    const harm = this.ctx.createOscillator();
    const hg = this.ctx.createGain();
    harm.type = 'sine';
    harm.frequency.value = freq * 1.5;
    hg.gain.setValueAtTime(0, time);
    hg.gain.linearRampToValueAtTime(vol * 0.12, time + 0.002);
    hg.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
    harm.connect(hg).connect(this.masterGain);
    harm.start(time); harm.stop(time + 0.1);
  }

  private playChinaLead(time: number, freq: number): void {
    if (!this.ctx || !this.masterGain) return;
    const vol = 0.055;
    // Erhu-like sustained melody: triangle wave with strong vibrato
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    // Erhu vibrato: starts after initial attack, deep and expressive
    const lfo = this.ctx.createOscillator();
    const lfoG = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 5.5;
    // Delayed vibrato onset (erhu vibrato starts after the bow settles)
    lfoG.gain.setValueAtTime(0, time);
    lfoG.gain.linearRampToValueAtTime(0, time + 0.03);
    lfoG.gain.linearRampToValueAtTime(6, time + 0.08);
    lfoG.gain.setValueAtTime(6, time + 0.15);
    lfo.connect(lfoG);
    lfoG.connect(osc.frequency);
    lfo.start(time); lfo.stop(time + 0.25);
    // Erhu envelope: slightly slower attack (bow), sustained body
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.015);
    gain.gain.setValueAtTime(vol * 0.9, time + 0.06);
    gain.gain.setValueAtTime(vol * 0.85, time + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
    osc.connect(gain).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.25);
    // High octave harmonic (erhu harmonic resonance)
    const harm = this.ctx.createOscillator();
    const hg = this.ctx.createGain();
    harm.type = 'sine';
    harm.frequency.value = freq * 2;
    hg.gain.setValueAtTime(0, time);
    hg.gain.linearRampToValueAtTime(vol * 0.2, time + 0.02);
    hg.gain.exponentialRampToValueAtTime(0.001, time + 0.16);
    harm.connect(hg).connect(this.masterGain);
    harm.start(time); harm.stop(time + 0.2);
  }

  private playFactoryLead(time: number, freq: number): void {
    if (!this.ctx || !this.masterGain) return;
    const vol = 0.06;
    // Sawtooth + distortion lowpass — industrial rock
    const saw = this.ctx.createOscillator();
    const sqr = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    saw.type = 'sawtooth';
    saw.frequency.value = freq;
    sqr.type = 'square';
    sqr.frequency.value = freq;
    const lfo = this.ctx.createOscillator();
    const lfoG = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 5.5;
    lfoG.gain.value = 4;
    lfo.connect(lfoG);
    lfoG.connect(saw.frequency);
    lfoG.connect(sqr.frequency);
    lfo.start(time); lfo.stop(time + 0.2);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.005);
    gain.gain.setValueAtTime(vol * 0.75, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.17);
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2200;
    lp.Q.value = 2;
    const mix = this.ctx.createGain();
    mix.gain.value = 0.55;
    saw.connect(mix);
    sqr.connect(mix);
    mix.connect(lp).connect(gain).connect(this.masterGain);
    saw.start(time); saw.stop(time + 0.2);
    sqr.start(time); sqr.stop(time + 0.2);
  }

  private playStreetLead(time: number, freq: number): void {
    if (!this.ctx || !this.masterGain) return;
    const vol = 0.065;
    // Coarse sawtooth + blues micro-bend
    const saw = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    saw.type = 'sawtooth';
    saw.frequency.setValueAtTime(freq, time);
    // Blues bend: sharper initial rise then settle
    saw.frequency.linearRampToValueAtTime(freq * 1.04, time + 0.008);
    saw.frequency.linearRampToValueAtTime(freq * 1.01, time + 0.03);
    saw.frequency.linearRampToValueAtTime(freq, time + 0.06);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.005);
    gain.gain.setValueAtTime(vol * 0.8, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2800;
    lp.Q.value = 1;
    saw.connect(lp).connect(gain).connect(this.masterGain);
    saw.start(time); saw.stop(time + 0.22);
    // Low octave layer for grit
    const sub = this.ctx.createOscillator();
    const sg = this.ctx.createGain();
    sub.type = 'sawtooth';
    sub.frequency.value = freq / 2;
    sg.gain.setValueAtTime(0, time);
    sg.gain.linearRampToValueAtTime(vol * 0.15, time + 0.008);
    sg.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    const slp = this.ctx.createBiquadFilter();
    slp.type = 'lowpass';
    slp.frequency.value = 800;
    sub.connect(slp).connect(sg).connect(this.masterGain);
    sub.start(time); sub.stop(time + 0.18);
  }

  private playOrochiLead(time: number, freq: number): void {
    if (!this.ctx || !this.masterGain) return;
    const vol = 0.05;
    // Square + deep lowpass, dark oppressive feel
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    // Slow ominous vibrato
    const lfo = this.ctx.createOscillator();
    const lfoG = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 3;
    lfoG.gain.value = 6;
    lfo.connect(lfoG);
    lfoG.connect(osc.frequency);
    lfo.start(time); lfo.stop(time + 0.25);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.015);
    gain.gain.setValueAtTime(vol * 0.7, time + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1200;
    lp.Q.value = 3;
    osc.connect(lp).connect(gain).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.25);
    // Tritone harmonic (diminished fifth = core dark sound)
    const tritone = this.ctx.createOscillator();
    const tg = this.ctx.createGain();
    tritone.type = 'sine';
    tritone.frequency.value = freq * 1.414;
    tg.gain.setValueAtTime(0, time);
    tg.gain.linearRampToValueAtTime(vol * 0.12, time + 0.02);
    tg.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    tritone.connect(tg).connect(this.masterGain);
    tritone.start(time); tritone.stop(time + 0.18);
  }

  // ─── Battle Pad: detuned sine wave layers ───

  private playBattlePad(time: number, freqs: number[], duration: number = 0.6): void {
    if (!this.ctx || !this.masterGain) return;
    for (const freq of freqs) {
      this.playPadVoice(time, freq, 0.018, duration);
      this.playPadVoice(time, freq * 1.0017, 0.012, duration);
      this.playPadVoice(time, freq * 0.9983, 0.012, duration);
    }
  }

  private playPadVoice(time: number, freq: number, vol: number, duration: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + duration * 0.25);
    gain.gain.setValueAtTime(vol * 0.9, time + duration * 0.6);
    gain.gain.linearRampToValueAtTime(0, time + duration);
    osc.connect(gain).connect(this.masterGain);
    osc.start(time); osc.stop(time + duration + 0.05);
  }

  // ─── Orochi choir pad: heavily detuned oscillators for ominous choir effect ───

  private playOrochiChoirPad(time: number, freqs: number[], duration: number = 0.6): void {
    if (!this.ctx || !this.masterGain) return;
    for (const freq of freqs) {
      // Primary voice
      this.playChoirVoice(time, freq, 0.015, duration);
      // Heavy detune +7 cents (widened choir)
      this.playChoirVoice(time, freq * 1.004, 0.012, duration);
      // Heavy detune -7 cents
      this.playChoirVoice(time, freq * 0.996, 0.012, duration);
      // Octave below for body
      this.playChoirVoice(time, freq / 2, 0.008, duration);
    }
  }

  private playChoirVoice(time: number, freq: number, vol: number, duration: number): void {
    if (!this.ctx || !this.masterGain) return;
    // Mix of sine and triangle for vocal-like timbre
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = freq;
    osc2.type = 'triangle';
    osc2.frequency.value = freq * 1.002; // Slight detune between oscillators
    // Slow LFO for "vowel" modulation
    const lfo = this.ctx.createOscillator();
    const lfoG = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.8;
    lfoG.gain.value = 3;
    lfo.connect(lfoG);
    lfoG.connect(osc1.frequency);
    lfoG.connect(osc2.frequency);
    lfo.start(time); lfo.stop(time + duration + 0.1);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + duration * 0.3);
    gain.gain.setValueAtTime(vol * 0.85, time + duration * 0.65);
    gain.gain.linearRampToValueAtTime(0, time + duration);
    const mix = this.ctx.createGain();
    mix.gain.value = 0.5;
    osc1.connect(mix);
    osc2.connect(mix);
    // Bandpass for vocal formant feel
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 500;
    bp.Q.value = 0.8;
    mix.connect(bp).connect(gain).connect(this.masterGain);
    osc1.start(time); osc1.stop(time + duration + 0.1);
    osc2.start(time); osc2.stop(time + duration + 0.1);
  }

  // ─── Stage melodic layer sounds ───

  /** Koto-like arpeggio: rapid ascending/descending notes */
  private playKotoArpeggio(time: number, extended: boolean): void {
    if (!this.ctx || !this.masterGain) return;
    const notes = extended
      ? [523.3, 659.3, 784, 880, 1046.5, 880, 784, 659.3]
      : [523.3, 659.3, 784, 880, 784, 659.3];
    const vol = 0.025;
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t = time + i * 0.025;
      // Plucked: instant attack, fast decay
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.connect(gain).connect(this.masterGain!);
      osc.start(t); osc.stop(t + 0.08);
    });
  }

  /** Shamisen-style pluck: very short, percussive */
  private playShamisenPluck(time: number): void {
    if (!this.ctx || !this.masterGain) return;
    const freqs = [659.3, 784, 880];
    const freq = freqs[Math.floor(Math.random() * freqs.length)];
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    // Extremely short pluck
    gain.gain.setValueAtTime(0.03, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2500;
    lp.Q.value = 1;
    osc.connect(lp).connect(gain).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.06);
    // Pluck transient noise
    const size = Math.floor(this.ctx.sampleRate * 0.01);
    const buf = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(0.015, time);
    ng.gain.exponentialRampToValueAtTime(0.001, time + 0.015);
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2000;
    bp.Q.value = 2;
    noise.connect(bp).connect(ng).connect(this.masterGain);
    noise.start(time); noise.stop(time + 0.02);
  }

  /** Erhu sustained note with deep vibrato */
  private playErhuSustain(time: number, section: number): void {
    if (!this.ctx || !this.masterGain) return;
    const freqs = section < 2
      ? [987.8, 1174.7, 1318.5, 1568]
      : [1318.5, 1568, 1760, 1568];
    const freq = freqs[Math.floor(time * 10) % freqs.length];
    const vol = 0.035;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    // Deep erhu vibrato with delayed onset
    const lfo = this.ctx.createOscillator();
    const lfoG = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 5;
    lfoG.gain.setValueAtTime(0, time);
    lfoG.gain.linearRampToValueAtTime(8, time + 0.05);
    lfoG.gain.setValueAtTime(8, time + 0.3);
    lfo.connect(lfoG);
    lfoG.connect(osc.frequency);
    lfo.start(time); lfo.stop(time + 0.5);
    // Sustained envelope
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.02);
    gain.gain.setValueAtTime(vol * 0.9, time + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);
    osc.connect(gain).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.5);
  }

  /** Erhu trill ornament */
  private playErhuTrill(time: number): void {
    if (!this.ctx || !this.masterGain) return;
    const vol = 0.02;
    const notes = [1174.7, 1318.5, 1174.7, 1318.5, 1174.7];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t = time + i * 0.02;
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.connect(gain).connect(this.masterGain!);
      osc.start(t); osc.stop(t + 0.05);
    });
  }

  /** Industrial drone: low rumbling oscillator */
  private playIndustrialDrone(time: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 41.2; // E1
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.04, time + 0.1);
    gain.gain.setValueAtTime(0.04, time + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 150;
    lp.Q.value = 3;
    osc.connect(lp).connect(gain).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.85);
    // Sub rumble
    const sub = this.ctx.createOscillator();
    const sg = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.value = 30;
    sg.gain.setValueAtTime(0, time);
    sg.gain.linearRampToValueAtTime(0.025, time + 0.15);
    sg.gain.exponentialRampToValueAtTime(0.001, time + 0.7);
    sub.connect(sg).connect(this.masterGain);
    sub.start(time); sub.stop(time + 0.75);
  }

  /** Metal screech: high filtered noise burst */
  private playMetalScreech(time: number): void {
    if (!this.ctx || !this.masterGain) return;
    const size = Math.floor(this.ctx.sampleRate * 0.08);
    const buf = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(0.02, time);
    ng.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 3000;
    hp.Q.value = 5;
    noise.connect(hp).connect(ng).connect(this.masterGain);
    noise.start(time); noise.stop(time + 0.1);
  }

  /** Walking bass pickup: brief note leading into next bar */
  private playWalkingBassPickup(time: number, barIndex: number): void {
    if (!this.ctx || !this.masterGain) return;
    const pickupNotes = [130.8, 146.8, 164.8, 155.6]; // C3, D3, E3, Eb3
    const freq = pickupNotes[barIndex % 4];
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.06, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 500;
    lp.Q.value = 2;
    osc.connect(lp).connect(gain).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.1);
  }

  /** Diminished run: fast chromatic/diminished scale descent */
  private playDiminishedRun(time: number, extended: boolean): void {
    if (!this.ctx || !this.masterGain) return;
    const notes = extended
      ? [1046.5, 987.8, 932.3, 880, 784, 740, 622.3, 587.3, 523.3]
      : [880, 784, 740, 622.3, 587.3, 523.3];
    const vol = 0.03;
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      const t = time + i * 0.03;
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      const lp = this.ctx!.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 1500;
      lp.Q.value = 2;
      osc.connect(lp).connect(gain).connect(this.masterGain!);
      osc.start(t); osc.stop(t + 0.06);
    });
  }

  /** Dark rumble pulse for Orochi */
  private playDarkRumble(time: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(40, time);
    osc.frequency.exponentialRampToValueAtTime(25, time + 0.2);
    gain.gain.setValueAtTime(0.02, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 120;
    lp.Q.value = 4;
    osc.connect(lp).connect(gain).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.28);
  }

  // ─── Phrase fills at boundaries ───

  /** Full phrase fill at 8-bar boundaries */
  private playPhraseFill(time: number, stage: string): void {
    if (!this.ctx || !this.masterGain) return;
    switch (stage) {
      case 'temple': {
        // Koto cascade fill
        const notes = [880, 784, 659.3, 587.3, 523.3, 587.3, 659.3, 784];
        notes.forEach((freq, i) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          const t = time + i * 0.025;
          gain.gain.setValueAtTime(0.03, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
          osc.connect(gain).connect(this.masterGain!);
          osc.start(t); osc.stop(t + 0.08);
        });
        break;
      }
      case 'china': {
        // Erhu slide fill
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1568, time);
        osc.frequency.exponentialRampToValueAtTime(784, time + 0.15);
        gain.gain.setValueAtTime(0.04, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
        osc.connect(gain).connect(this.masterGain!);
        osc.start(time); osc.stop(time + 0.2);
        break;
      }
      case 'factory': {
        // Machine gun fill
        for (let i = 0; i < 6; i++) {
          const t = time + i * 0.02;
          this.playIndustrialClank(t, 0.04 + (i % 2) * 0.02);
        }
        break;
      }
      case 'street': {
        // Blues turnaround fill
        const notes = [659.3, 622.3, 587.3, 523.3];
        notes.forEach((freq, i) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq * 1.03, time + i * 0.03);
          osc.frequency.linearRampToValueAtTime(freq, time + i * 0.03 + 0.02);
          const t = time + i * 0.03;
          gain.gain.setValueAtTime(0.04, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
          const lp = this.ctx!.createBiquadFilter();
          lp.type = 'lowpass';
          lp.frequency.value = 2500;
          osc.connect(lp).connect(gain).connect(this.masterGain!);
          osc.start(t); osc.stop(t + 0.08);
        });
        break;
      }
      case 'orochi':
      default: {
        // Diminished cascade
        const notes = [784, 740, 622.3, 587.3, 523.3, 587.3, 622.3, 740];
        notes.forEach((freq, i) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'square';
          osc.frequency.value = freq;
          const t = time + i * 0.025;
          gain.gain.setValueAtTime(0.025, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
          const lp = this.ctx!.createBiquadFilter();
          lp.type = 'lowpass';
          lp.frequency.value = 1400;
          osc.connect(lp).connect(gain).connect(this.masterGain!);
          osc.start(t); osc.stop(t + 0.06);
        });
        break;
      }
    }
  }

  /** Mini fill at mid-phrase for rhythmic interest */
  private playMiniFill(time: number, stage: string): void {
    if (!this.ctx || !this.masterGain) return;
    // Quick 2-note fill
    const fillNotes: Record<string, [number, number]> = {
      temple: [784, 659.3],
      china: [1318.5, 987.8],
      factory: [880, 659.3],
      street: [659.3, 523.3],
      orochi: [740, 587.3],
    };
    const notes = fillNotes[stage] || [784, 659.3];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t = time + i * 0.03;
      gain.gain.setValueAtTime(0.025, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc.connect(gain).connect(this.masterGain!);
      osc.start(t); osc.stop(t + 0.06);
    });
  }

  // ─── Stage accent sounds ───

  private playStreetAccent(time: number): void {
    if (!this.ctx || !this.masterGain) return;
    // Street electric guitar scrape
    const size = Math.floor(this.ctx.sampleRate * 0.06);
    const buf = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(0.05, time);
    ng.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1200;
    bp.Q.value = 2;
    noise.connect(bp).connect(ng).connect(this.masterGain);
    noise.start(time); noise.stop(time + 0.08);
    const osc = this.ctx.createOscillator();
    const og = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(50, time + 0.08);
    og.gain.setValueAtTime(0.04, time);
    og.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 500;
    osc.connect(lp).connect(og).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.12);
  }

  private playDarkAccent(time: number, vol: number = 0.04): void {
    if (!this.ctx || !this.masterGain) return;
    // Orochi dark pulse: low square + high harmonic
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(55, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.3);
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 200;
    lp.Q.value = 5;
    osc.connect(lp).connect(gain).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.38);
    const harm = this.ctx.createOscillator();
    const hg = this.ctx.createGain();
    harm.type = 'sine';
    harm.frequency.setValueAtTime(440, time);
    harm.frequency.exponentialRampToValueAtTime(220, time + 0.15);
    hg.gain.setValueAtTime(vol * 0.5, time);
    hg.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
    harm.connect(hg).connect(this.masterGain);
    harm.start(time); harm.stop(time + 0.22);
  }

  private playFluteAccent(time: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1174.7, time);
    osc.frequency.linearRampToValueAtTime(1568, time + 0.04);
    gain.gain.setValueAtTime(0.03, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1400;
    bp.Q.value = 3;
    osc.connect(bp).connect(gain).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.25);
  }

  /** Industrial clank: metallic percussive hit */
  private playIndustrialClank(time: number, vol: number = 0.04): void {
    if (!this.ctx || !this.masterGain) return;
    // Metallic square wave with inharmonic overtones
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    const baseFreq = 100 + Math.random() * 80;
    osc.frequency.setValueAtTime(baseFreq, time);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.3, time + 0.1);
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 800 + Math.random() * 400;
    bp.Q.value = 4;
    osc.connect(bp).connect(gain).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.15);
    // High metal ping
    const ping = this.ctx.createOscillator();
    const pg = this.ctx.createGain();
    ping.type = 'sine';
    ping.frequency.value = 2000 + Math.random() * 1500;
    pg.gain.setValueAtTime(vol * 0.4, time);
    pg.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
    ping.connect(pg).connect(this.masterGain);
    ping.start(time); ping.stop(time + 0.08);
  }

  // ─── Title Theme (100 BPM, 64 sub-beats) ───

  private playTitleBeat(now: number): void {
    if (!this.ctx || !this.masterGain) return;
    const b = this.beat;
    const b8 = b % 8;
    const b16 = b % 16;

    // Dynamic range: first 16 beats are quiet intro, then full arrangement
    const isIntro = b < 16;
    const volMul = isIntro ? 0.6 : 1.0;

    if (b8 === 0) this.playKick(now, 0.35 * volMul);
    if (b8 === 4) this.playSnare(now, 0.12 * volMul);
    if (b % 2 === 0) this.playHihat(now, 0.025 * volMul, false);
    if (b8 === 3 && b % 16 >= 8) this.playRim(now, 0.06 * volMul);

    // Lead melody phrase: 4-bar phrase that repeats (memorable hook)
    // Plays on beats where b%4===2 (every other sub-beat in the melody slot)
    if (b % 4 === 2) {
      // 4-bar (16-sub-beat) melody phrase repeated 4 times with variation
      const melodyPhrases = [
        // Phrase 1: ascending motif
        [523.3, 0, 659.3, 587.3, 784, 0, 659.3, 0, 880, 0, 784, 659.3, 523.3, 0, 0, 0],
        // Phrase 2: response motif
        [587.3, 0, 523.3, 0, 659.3, 784, 0, 659.3, 523.3, 0, 587.3, 0, 659.3, 0, 0, 0],
        // Phrase 3: development (higher register)
        [880, 0, 784, 659.3, 587.3, 0, 523.3, 587.3, 659.3, 784, 880, 0, 784, 659.3, 0, 0],
        // Phrase 4: resolution back to root
        [659.3, 587.3, 523.3, 0, 587.3, 659.3, 784, 0, 659.3, 0, 523.3, 0, 0, 0, 0, 0],
      ];
      const phraseIdx = Math.floor(b16 / 4);
      const melody = melodyPhrases[phraseIdx];
      const noteIdx = b16 % 16;
      const n = melody[noteIdx];
      if (n > 0) this.playTitleLead(now, n, 0.05 * volMul);
    }

    // Chord progression underneath (every 4 beats)
    if (b % 4 === 0) {
      // C - Am - F - G progression
      const chordBass = [65.4, 55, 87.3, 98];
      this.playBass(now, chordBass[Math.floor(b / 4) % 4], 0.08 * volMul);
    }

    // Chord pads on 16-beat boundaries
    if (b % 16 === 0) {
      const chords = [
        [261.6, 329.6, 392],    // C major
        [220, 261.6, 329.6],    // A minor
        [174.6, 220, 261.6],    // F major
        [196, 246.9, 293.7],    // G major
      ];
      this.playPad(now, chords[(b / 16) % 4], 1.8 * volMul);
    }

    // Sub bass on 32-beat boundaries
    if (b % 32 === 0) {
      this.playSubPad(now, 65.4, 3.5 * volMul);
    }

    // Arpeggiated accompaniment (quiet intro → fuller in main section)
    if (b % 2 === 0 && !isIntro) {
      const arpNotes = [261.6, 329.6, 392, 523.3, 493.9, 392, 329.6, 261.6,
                        220, 277.2, 329.6, 440, 392, 329.6, 277.2, 220,
                        246.9, 311.1, 370, 493.9, 440, 370, 311.1, 246.9,
                        261.6, 329.6, 392, 523.3, 493.9, 440, 392, 329.6];
      const n = arpNotes[(b / 2) % arpNotes.length];
      this.playSoftLead(now, n, 0.03 * volMul);
    }

    // Additional snare fill at end of 32-beat phrase
    if (b === 30 || b === 31) this.playSnare(now, 0.06 * volMul);
    if (b === 62 || b === 63) this.playSnare(now, 0.08 * volMul);

    // Crash on phrase restarts
    if (b === 16 || b === 48) this.playCrash(now, 0.05 * volMul);
  }

  // ─── Title lead: slightly brighter than soft lead ───

  private playTitleLead(time: number, freq: number, vol: number): void {
    if (!this.ctx || !this.masterGain) return;
    // Sine + slight triangle harmonic for brightness
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    // Gentle vibrato for expressiveness
    const lfo = this.ctx.createOscillator();
    const lfoG = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 4;
    lfoG.gain.value = 2;
    lfo.connect(lfoG);
    lfoG.connect(osc.frequency);
    lfo.start(time); lfo.stop(time + 0.35);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.02);
    gain.gain.setValueAtTime(vol * 0.85, time + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
    osc.connect(gain).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.35);
    // Triangle harmonic for brightness
    const harm = this.ctx.createOscillator();
    const hg = this.ctx.createGain();
    harm.type = 'triangle';
    harm.frequency.value = freq * 2;
    hg.gain.setValueAtTime(0, time);
    hg.gain.linearRampToValueAtTime(vol * 0.15, time + 0.04);
    hg.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
    harm.connect(hg).connect(this.masterGain);
    harm.start(time); harm.stop(time + 0.22);
  }

  // ─── Core Synthesis Primitives (delegated to bgmSynthesis.ts) ──

  private playKick(time: number, vol: number): void {
    if (!this.ctx || !this.masterGain) return;
    _playKick(this.synth(), time, vol);
  }

  private playSnare(time: number, vol: number): void {
    if (!this.ctx || !this.masterGain) return;
    _playSnare(this.synth(), time, vol);
  }

  private playHihat(time: number, vol: number, open: boolean): void {
    if (!this.ctx || !this.masterGain) return;
    _playHihat(this.synth(), time, vol, open);
  }

  private playCrash(time: number, vol: number = 0.12): void {
    if (!this.ctx || !this.masterGain) return;
    _playCrash(this.synth(), time, vol);
  }

  private playBass(time: number, freq: number, vol: number): void {
    if (!this.ctx || !this.masterGain) return;
    _playBass(this.synth(), time, freq, vol);
  }

  private playGuitarLead(time: number, freq: number, vol: number = 0.06): void {
    if (!this.ctx || !this.masterGain) return;
    _playGuitarLead(this.synth(), time, freq, vol);
  }

  private playSoftLead(time: number, freq: number, vol: number): void {
    if (!this.ctx || !this.masterGain) return;
    _playSoftLead(this.synth(), time, freq, vol);
  }

  private playPowerChord(time: number, freqs: number[], vol: number = 0.03): void {
    if (!this.ctx || !this.masterGain) return;
    _playPowerChord(this.synth(), time, freqs, vol);
  }

  private playPad(time: number, freqs: number[], duration: number = 0.6): void {
    if (!this.ctx || !this.masterGain) return;
    _playPad(this.synth(), time, freqs, duration);
  }

  private playSubPad(time: number, freq: number, duration: number): void {
    if (!this.ctx || !this.masterGain) return;
    _playSubPad(this.synth(), time, freq, duration);
  }

  private playTom(time: number, freq: number): void {
    if (!this.ctx || !this.masterGain) return;
    _playTom(this.synth(), time, freq);
  }

  private playArpFill(time: number, vol: number = 0.05): void {
    if (!this.ctx || !this.masterGain) return;
    _playArpFill(this.synth(), time, vol);
  }

  /** Section-transition fill: ascending arp (triangle wave, quick notes). */
  private playTransitionFill(time: number): void {
    if (!this.ctx || !this.masterGain) return;
    _playTransitionFill(this.synth(), time);
  }

  private playMetalHit(time: number): void {
    if (!this.ctx || !this.masterGain) return;
    _playMetalHit(this.synth(), time);
  }

  private playGongAccent(time: number): void {
    if (!this.ctx || !this.masterGain) return;
    _playGongAccent(this.synth(), time);
  }

  private playBellAccent(time: number, vol: number = 0.04): void {
    if (!this.ctx || !this.masterGain) return;
    _playBellAccent(this.synth(), time, vol);
  }

  private playRim(time: number, vol: number): void {
    if (!this.ctx || !this.masterGain) return;
    _playRim(this.synth(), time, vol);
  }
}

export const bgm = new BGMPlayer();
