/**
 * BGM — KOF2002-style chiptune battle music
 * Stage-aware tracks with rock/metal energy
 * v2: 行走低音模式、更丰富的鼓点加花、更丰富的和弦进行
 */

export class BGMPlayer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compGain: GainNode | null = null;
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
    this.compGain = this.ctx.createGain();
    this.compGain.gain.value = 1;
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 4;
    comp.attack.value = 0.003;
    comp.release.value = 0.15;
    this.masterGain.connect(comp).connect(this.compGain).connect(this.ctx.destination);
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
    this.compGain = null;
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

    const b = this.beat;
    const b8 = b % 8;
    const section = Math.floor(b / 32);

    // ── Drums ──
    // Kick模式：不同乐段不同模式
    if (section === 0 || section === 2) {
      if (b8 === 0 || b8 === 4) this.playKick(now, 0.55);
      if (b8 === 6) this.playKick(now, 0.3);
      // 加花：16分音符连击
      if (b8 === 7 && b % 32 >= 28) this.playKick(now, 0.25);
    } else if (section === 1) {
      // B段：更密集的kick
      if (b8 === 0 || b8 === 3 || b8 === 4) this.playKick(now, 0.5);
      if (b8 === 7) this.playKick(now, 0.25);
      // 16分音符double kick
      if (b8 === 5 && b % 16 === 13) this.playKick(now, 0.2);
    } else {
      // D段：最密集
      if (b8 === 0 || b8 === 3 || b8 === 4 || b8 === 6) this.playKick(now, 0.5);
      if (b8 === 7) this.playKick(now, 0.3);
    }

    // Snare: 2和6为主，段尾加花
    if (b8 === 2 || b8 === 6) this.playSnare(now, 0.22);
    // 段末加花
    if (b === 30 || b === 31) this.playSnare(now, 0.18);
    if (b === 62 || b === 63) this.playSnare(now, 0.22);
    if (b === 94) this.playSnare(now, 0.15);
    if (b === 126 || b === 127) this.playSnare(now, 0.22);
    // 额外snare ghost notes — 更密的节奏感
    if (section >= 2 && b8 === 1) this.playSnare(now, 0.08);
    if (section >= 2 && b8 === 5) this.playSnare(now, 0.08);

    // Hi-hat: 更丰富的节奏模式
    if (b % 2 === 0) this.playHihat(now, 0.07, false);
    if (b % 2 === 1) this.playHihat(now, 0.04, false);
    // 开镲在乐句边界
    if (b8 === 7 && (section === 0 || section === 2)) this.playHihat(now, 0.1, true);
    if (b8 === 3 && section >= 2) this.playHihat(now, 0.06, true);
    // 段末加速hi-hat
    if (b >= 124 && b <= 127 && b % 2 === 0) this.playHihat(now, 0.08, false);

    // Tom加花 — 段过渡
    if (b >= 28 && b <= 31) this.playTom(now, 180 - (b - 28) * 20);
    if (b >= 60 && b <= 63) this.playTom(now, 200 - (b - 60) * 25);
    if (b >= 92 && b <= 95) this.playTom(now, 220 - (b - 92) * 20);
    // 额外tom fill: 4小节分界
    if (b === 44 || b === 45) this.playTom(now, 160);
    if (b === 108 || b === 109) this.playTom(now, 200);

    // Crash at section start
    if (b === 0 || b === 32 || b === 64 || b === 96) this.playCrash(now);
    // 半程crash
    if (b === 16 || b === 48 || b === 80 || b === 112) this.playCrash(now, 0.06);

    // ── Bass: 行走低音模式 ──
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
    // 段2+：额外的节奏吉他16分音符
    if (section >= 2 && b % 2 === 1) {
      const chords = this.getChords(section);
      const ci = Math.floor(b / 8) % 4;
      this.playPowerChord(now, chords[ci], 0.015);
    }

    // ── Arp fill ──
    if (b === 29 || b === 61 || b === 93 || b === 125) this.playArpFill(now);
    // 段末额外arp
    if (section >= 2 && (b === 14 || b === 46)) this.playArpFill(now, 0.04);

    // ── Stage-specific accent ──
    if (this.stageId === 'factory' && b % 16 === 8) this.playMetalHit(now);
    if (this.stageId === 'china' && b % 32 === 16) this.playGongAccent(now);
    if (this.stageId === 'temple' && b % 24 === 12) this.playBellAccent(now);
  }

  // 行走低音模式：更多音符运动
  private getBassPattern(section: number): number[] {
    // E2=82.4, A2=110, B2=123.5, C3=130.8, D3=146.8, G2=98, F2=87.3, Bb2=116.5
    const patterns: number[][] = [
      // Section A: E小调行走低音
      [82.4,0,82.4,98, 110,0,82.4,0, 82.4,0,123.5,0, 110,0,82.4,0,
       82.4,0,98,0, 110,0,82.4,98, 123.5,0,110,82.4, 130.8,0,0,0],
      // Section B: 更多运动 — 带经过音
      [110,0,110,123.5, 130.8,0,116.5,110, 123.5,0,123.5,130.8, 110,0,98,0,
       87.3,0,98,0, 110,0,123.5,116.5, 130.8,0,110,98, 82.4,0,0,0],
    ];
    return patterns[section % 2];
  }

  private getLeadNote(b: number, section: number): number {
    const melodyA: number[] = [
      // Phrase 1 (bars 1-4): 主旋律
      659.3,0,784,0, 659.3,587.3,0,0, 523.3,0,587.3,659.3, 0,0,784,0,
      // Phrase 2 (bars 5-8): 问答
      659.3,0,523.3,0, 440,0,0,523.3, 587.3,0,659.3,0, 784,0,0,0,
      // Phrase 3 (bars 9-12): 发展
      880,0,784,659.3, 523.3,0,587.3,0, 659.3,784,0,880, 784,659.3,0,0,
      // Phrase 4 (bars 13-16): 解决
      523.3,0,440,0, 392,0,440,523.3, 587.3,0,523.3,0, 440,0,0,0,
    ];
    const melodyB: number[] = [
      // 高能量变奏
      1046.5,0,880,0, 784,0,659.3,0, 784,880,0,1046.5, 880,784,0,0,
      659.3,0,784,0, 880,0,1046.5,0, 1174.7,0,1046.5,880, 784,0,0,0,
      880,0,1046.5,0, 1174.7,1046.5,880,0, 784,0,659.3,0, 784,880,0,0,
      1046.5,880,784,0, 659.3,0,784,880, 1046.5,0,880,0, 659.3,0,0,0,
    ];
    const melody = section < 2 ? melodyA : melodyB;
    return melody[b % melody.length];
  }

  private getChords(section: number): number[][] {
    // 更丰富的和弦进行：加入小三度音
    if (section < 2) {
      // Em - Am - G - Em (i - iv - III - i)
      return [
        [82.4, 123.5, 98],   // Em: E + B + G
        [110, 164.8, 130.8], // Am: A + E + C
        [98, 146.8, 116.5],  // G:  G + D + Bb
        [82.4, 123.5, 98],   // Em
      ];
    }
    // B段: Am - C - B - Am
    return [
      [110, 164.8, 130.8],  // Am
      [130.8, 196, 164.8],  // C
      [123.5, 185, 146.8],  // B
      [110, 164.8, 130.8],  // Am
    ];
  }

  // ─── Title Theme (100 BPM, 64 sub-beats) ───

  private playTitleBeat(now: number): void {
    if (!this.ctx || !this.masterGain) return;
    const b = this.beat;
    const b8 = b % 8;

    // 更有氛围的鼓点
    if (b8 === 0) this.playKick(now, 0.35);
    if (b8 === 4) this.playSnare(now, 0.12);
    if (b % 2 === 0) this.playHihat(now, 0.025, false);
    // 偶尔的rim click
    if (b8 === 3 && b % 16 >= 8) this.playRim(now, 0.06);

    // 慢速琶音pad
    if (b % 2 === 0) {
      const arpNotes = [261.6, 329.6, 392, 523.3, 493.9, 392, 329.6, 261.6,
                        220, 277.2, 329.6, 440, 392, 329.6, 277.2, 220,
                        246.9, 311.1, 370, 493.9, 440, 370, 311.1, 246.9,
                        261.6, 329.6, 392, 523.3, 493.9, 440, 392, 329.6];
      const n = arpNotes[(b / 2) % arpNotes.length];
      this.playSoftLead(now, n, 0.035);
    }

    // 行走低音 — 更多的音调运动
    if (b % 4 === 0) {
      const bassNotes = [65.4, 65.4, 73.4, 65.4, 55, 55, 61.7, 65.4,
                         73.4, 73.4, 65.4, 73.4, 61.7, 61.7, 55, 65.4];
      this.playBass(now, bassNotes[(b / 4) % bassNotes.length], 0.08);
    }

    // 更丰富的旋律
    if (b % 4 === 2) {
      const melody = [523.3, 0, 659.3, 0, 587.3, 523.3, 0, 440,
                      392, 0, 440, 0, 523.3, 493.9, 440, 392];
      const n = melody[(b / 4) % melody.length];
      if (n > 0) this.playSoftLead(now, n, 0.05);
    }

    // Pad和弦每16拍
    if (b % 16 === 0) {
      const chords = [[261.6, 329.6, 392], [220, 277.2, 329.6], [246.9, 311.1, 370], [261.6, 329.6, 392]];
      this.playPad(now, chords[(b / 16) % 4], 1.8);
    }

    // 额外低频pad — 氛围感
    if (b % 32 === 0) {
      this.playSubPad(now, 65.4, 3.5);
    }
  }

  // ─── Enhanced Synthesis ──

  private playKick(time: number, vol: number): void {
    if (!this.ctx || !this.masterGain) return;
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
    // 额外的sub层 — 更深沉的kick
    const sub = this.ctx.createOscillator();
    const sg = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(60, time);
    sub.frequency.exponentialRampToValueAtTime(15, time + 0.15);
    sg.gain.setValueAtTime(vol * 0.4, time);
    sg.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    sub.connect(sg).connect(this.masterGain);
    sub.start(time); sub.stop(time + 0.18);
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

  private playCrash(time: number, vol: number = 0.12): void {
    if (!this.ctx || !this.masterGain) return;
    const size = Math.floor(this.ctx.sampleRate * 0.4);
    const buf = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (size * 0.3));
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 5000;
    noise.connect(hp).connect(gain).connect(this.masterGain);
    noise.start(time); noise.stop(time + 0.4);
  }

  private playBass(time: number, freq: number, vol: number): void {
    if (!this.ctx || !this.masterGain || freq === 0) return;
    // 主低音：锯齿波
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
    // 子低音层：正弦波低八度
    const sub = this.ctx.createOscillator();
    const sg = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.value = freq / 2;
    sg.gain.setValueAtTime(0, time);
    sg.gain.linearRampToValueAtTime(vol * 0.3, time + 0.008);
    sg.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
    sub.connect(sg).connect(this.masterGain);
    sub.start(time); sub.stop(time + 0.22);
  }

  private playGuitarLead(time: number, freq: number, vol: number = 0.06): void {
    if (!this.ctx || !this.masterGain) return;
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
    // 泛音层 — 更丰富的音色
    const harm = this.ctx.createOscillator();
    const hg = this.ctx.createGain();
    harm.type = 'triangle';
    harm.frequency.value = freq * 2;
    hg.gain.setValueAtTime(0, time);
    hg.gain.linearRampToValueAtTime(vol * 0.15, time + 0.08);
    hg.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
    harm.connect(hg).connect(this.masterGain);
    harm.start(time); harm.stop(time + 0.28);
  }

  private playPowerChord(time: number, freqs: number[], vol: number = 0.03): void {
    if (!this.ctx || !this.masterGain) return;
    for (const freq of freqs) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(vol, time + 0.01);
      gain.gain.setValueAtTime(vol * 0.85, time + 0.1);
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

  private playSubPad(time: number, freq: number, duration: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.04, time + duration * 0.2);
    gain.gain.setValueAtTime(0.04, time + duration * 0.7);
    gain.gain.linearRampToValueAtTime(0, time + duration);
    osc.connect(gain).connect(this.masterGain);
    osc.start(time); osc.stop(time + duration + 0.1);
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

  private playArpFill(time: number, vol: number = 0.05): void {
    if (!this.ctx || !this.masterGain) return;
    const notes = [659.3, 784, 880, 1046.5, 1174.7];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      const t = time + i * 0.035;
      gain.gain.setValueAtTime(vol, t);
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

  // 新增：寺庙钟声
  private playBellAccent(time: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.04, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
    // 共鸣泛音
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = 1760;
    gain2.gain.setValueAtTime(0.015, time);
    gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
    osc.connect(gain).connect(this.masterGain);
    osc2.connect(gain2).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.55);
    osc2.start(time); osc2.stop(time + 0.35);
  }

  // 新增：rim click — 标题界面节奏
  private playRim(time: number, vol: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, time);
    osc.frequency.exponentialRampToValueAtTime(300, time + 0.02);
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1500;
    osc.connect(hp).connect(gain).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.05);
  }
}

export const bgm = new BGMPlayer();
