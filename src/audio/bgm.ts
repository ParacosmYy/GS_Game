/**
 * BGM — KOF2002-style chiptune battle music
 * Stage-aware tracks with rock/metal energy
 * v3: 每个舞台独立的旋律/低音/和弦/Pad，舞台专属音阶与调性
 *
 * 舞台调性：
 *   temple  — C 大调五声 (C-D-E-G-A)，方波 lead，钟声点缀
 *   china   — G 大调五声高八度 (G-A-B-D-E)，三角波 lead，锣/笛点缀
 *   factory — E 小调 (E-F#-G-A-B-C-D)，锯齿波 lead，金属撞击
 *   street  — A 布鲁斯 (A-C-D-Eb-E-G)，失真锯齿 lead，硬摇滚节奏
 *   orochi  — 减音阶 (C-D-Eb-F#-G-A-Bb-B)，方波+低通 lead，暗黑压迫
 */

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

    // Dry path: masterGain -> sidechainGain -> comp -> compGain -> destination
    this.masterGain.connect(this.sidechainGain);
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

  setStage(id: string): void { this.stageId = id; }

  stop(): void {
    this.isPlaying = false;
    if (this.loopTimer) { clearInterval(this.loopTimer); this.loopTimer = null; }
    if (this.ctx) { this.ctx.close(); this.ctx = null; }
    this.masterGain = null;
    this.compGain = null;
    this.sidechainGain = null;
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
    }

    if (b8 === 2 || b8 === 6) this.playSnare(now, 0.22);
    if (b === 30 || b === 31) this.playSnare(now, 0.18);
    if (b === 62 || b === 63) this.playSnare(now, 0.22);
    if (b === 94) this.playSnare(now, 0.15);
    if (b === 126 || b === 127) this.playSnare(now, 0.22);
    if (section >= 2 && b8 === 1) this.playSnare(now, 0.08);
    if (section >= 2 && b8 === 5) this.playSnare(now, 0.08);

    if (b % 2 === 0) this.playHihat(now, 0.07, false);
    if (b % 2 === 1) this.playHihat(now, 0.04, false);
    if (b8 === 7 && (section === 0 || section === 2)) this.playHihat(now, 0.1, true);
    if (b8 === 3 && section >= 2) this.playHihat(now, 0.06, true);
    if (b >= 124 && b <= 127 && b % 2 === 0) this.playHihat(now, 0.08, false);

    if (b >= 28 && b <= 31) this.playTom(now, 180 - (b - 28) * 20);
    if (b >= 60 && b <= 63) this.playTom(now, 200 - (b - 60) * 25);
    if (b >= 92 && b <= 95) this.playTom(now, 220 - (b - 92) * 20);
    if (b === 44 || b === 45) this.playTom(now, 160);
    if (b === 108 || b === 109) this.playTom(now, 200);

    if (b === 0 || b === 32 || b === 64 || b === 96) this.playCrash(now);
    if (b === 16 || b === 48 || b === 80 || b === 112) this.playCrash(now, 0.06);

    // ── Bass: 舞台感知行走低音 ──
    const bassPattern = this.getBassPattern(stage, section);
    const bassIdx = b % 32;
    if (bassPattern[bassIdx] > 0) {
      this.playBass(now, bassPattern[bassIdx], 0.13);
    }

    // ── Lead melody: 舞台专属旋律 ──
    const leadNote = this.getLeadNote(stage, b, section);
    if (leadNote > 0) this.playStageLead(now, stage, leadNote);

    // ── Rhythm guitar / power chords: 舞台感知 ──
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

    // ── Pad 层: 每 16 拍触发，营造空间感 ──
    if (b % 16 === 0) {
      const padChords = this.getPadChords(stage, section);
      const pi = Math.floor(b / 16) % padChords.length;
      this.playBattlePad(now, padChords[pi], 0.6);
    }

    // ── Arp fill ──
    if (b === 29 || b === 61 || b === 93 || b === 125) this.playArpFill(now);
    if (section >= 2 && (b === 14 || b === 46)) this.playArpFill(now, 0.04);

    // ── Section transition fill: ascending arp at section boundaries ──
    if (b === 31 || b === 63 || b === 95) this.playTransitionFill(now);

    // ── Stage-specific accent: 每 8 拍触发 ──
    if (b % 8 === 0) {
      if (stage === 'temple') this.playBellAccent(now);
      else if (stage === 'china') this.playGongAccent(now);
      else if (stage === 'factory') this.playMetalHit(now);
      else if (stage === 'street') this.playStreetAccent(now);
      else if (stage === 'orochi') this.playDarkAccent(now);
    }
    // 额外变体：拍 4 上的次要点缀
    if (b8 === 4 && b % 16 === 12) {
      if (stage === 'temple') this.playBellAccent(now, 0.02);
      else if (stage === 'china') this.playFluteAccent(now);
      else if (stage === 'orochi') this.playDarkAccent(now, 0.03);
    }
  }

  // ─── 舞台专属旋律 ───

  private getLeadNote(stage: string, b: number, section: number): number {
    const melodies = this.getStageMelody(stage);
    const melody = section < 2 ? melodies[0] : melodies[1];
    return melody[b % melody.length];
  }

  private getStageMelody(stage: string): [number[], number[]] {
    switch (stage) {
      case 'temple':
        return [
          // A段: C 大调五声 — 宁静的日本寺庙
          // C5=523.3, D5=587.3, E5=659.3, G5=784, A5=880
          [523.3,0,659.3,0, 784,0,659.3,587.3, 523.3,0,587.3,0, 659.3,0,0,0,
           784,0,880,0, 784,659.3,587.3,0, 523.3,0,659.3,587.3, 523.3,0,0,0,
           880,0,784,659.3, 784,0,659.3,0, 587.3,0,523.3,0, 587.3,659.3,0,0,
           523.3,0,587.3,0, 659.3,0,784,0, 659.3,587.3,523.3,0, 0,0,0,0],
          // B段: 更活跃的五声变奏
          [880,0,784,659.3, 784,0,880,0, 1046.5,0,880,784, 659.3,0,0,0,
           784,0,659.3,587.3, 523.3,0,587.3,659.3, 784,0,880,784, 659.3,0,0,0,
           1046.5,0,880,0, 784,659.3,587.3,0, 659.3,0,784,880, 784,659.3,0,0,
           523.3,0,659.3,784, 880,0,784,659.3, 587.3,0,523.3,0, 0,0,0,0],
        ];
      case 'china':
        return [
          // A段: G 大调五声高八度 — 明亮穿透的中国风
          // G5=784, A5=880, B5=987.8, D6=1174.7, E6=1318.5
          [784,0,880,0, 987.8,0,1174.7,0, 1318.5,0,1174.7,987.8, 880,0,0,0,
           784,0,987.8,0, 1174.7,0,880,784, 880,0,987.8,0, 784,0,0,0,
           1174.7,0,1318.5,0, 1174.7,987.8,880,0, 784,0,880,987.8, 1174.7,0,0,0,
           987.8,0,880,784, 880,0,784,0, 987.8,880,784,0, 0,0,0,0],
          // B段: 高音区华丽变奏
          [1318.5,0,1174.7,987.8, 1174.7,0,1318.5,0, 1568,0,1318.5,1174.7, 987.8,0,0,0,
           1174.7,0,987.8,880, 784,0,880,987.8, 1174.7,0,1318.5,0, 987.8,880,0,0,
           1568,0,1318.5,1174.7, 1318.5,0,987.8,880, 1174.7,0,1318.5,1568, 1318.5,1174.7,0,0,
           987.8,0,880,784, 880,987.8,1174.7,0, 1318.5,0,987.8,0, 784,0,0,0],
        ];
      case 'factory':
        return [
          // A段: E 小调 — 工业摇滚
          // E5=659.3, F#5=740, G5=784, A5=880, B5=987.8, C6=1046.5, D6=1174.7
          [659.3,0,740,0, 784,0,880,0, 987.8,0,880,784, 740,0,0,0,
           659.3,0,784,659.3, 740,0,880,740, 659.3,0,0,784, 880,0,0,0,
           1174.7,0,1046.5,987.8, 880,0,784,0, 880,0,987.8,1046.5, 880,784,0,0,
           659.3,0,740,784, 880,0,784,740, 659.3,0,0,0, 0,0,0,0],
          // B段: 更激烈的摇滚
          [1174.7,0,1046.5,880, 784,0,880,1046.5, 1174.7,0,1318.5,0, 1174.7,1046.5,0,0,
           880,0,784,740, 659.3,0,740,880, 987.8,0,1046.5,1174.7, 1046.5,880,0,0,
           1318.5,0,1174.7,1046.5, 987.8,880,784,0, 880,987.8,1046.5,0, 1174.7,0,0,0,
           1046.5,880,784,659.3, 740,0,880,987.8, 1174.7,0,1046.5,0, 659.3,0,0,0],
        ];
      case 'street':
        return [
          // A段: A 布鲁斯 — 硬摇滚
          // A4=440, C5=523.3, D5=587.3, Eb5=622.3, E5=659.3, G5=784, A5=880
          [440,0,523.3,0, 587.3,0,622.3,659.3, 587.3,0,523.3,0, 440,0,0,0,
           659.3,0,587.3,523.3, 440,0,523.3,587.3, 659.3,0,784,0, 659.3,587.3,0,0,
           880,0,784,659.3, 622.3,0,587.3,523.3, 587.3,659.3,784,0, 659.3,0,0,0,
           523.3,0,587.3,622.3, 659.3,0,587.3,523.3, 440,0,523.3,0, 0,0,0,0],
          // B段: 更硬核的布鲁斯摇滚
          [880,0,784,659.3, 784,0,622.3,587.3, 659.3,0,784,880, 784,659.3,0,0,
           622.3,0,587.3,523.3, 440,0,523.3,587.3, 659.3,622.3,587.3,0, 659.3,0,0,0,
           880,784,659.3,587.3, 622.3,659.3,784,880, 1046.5,0,880,784, 659.3,587.3,0,0,
           784,659.3,587.3,523.3, 587.3,659.3,784,0, 880,0,659.3,0, 440,0,0,0],
        ];
      case 'orochi':
      default:
        return [
          // A段: 减音阶 — 暗黑压迫
          // C5=523.3, D5=587.3, Eb5=622.3, F#5=740, G5=784, A5=880, Bb5=932.3, B5=987.8
          [523.3,0,622.3,0, 740,0,622.3,587.3, 523.3,0,587.3,622.3, 740,0,0,0,
           784,0,880,740, 622.3,0,587.3,523.3, 587.3,0,622.3,740, 880,0,0,0,
           932.3,0,880,784, 740,0,622.3,587.3, 523.3,0,587.3,622.3, 740,784,0,0,
           880,0,740,622.3, 587.3,0,523.3,587.3, 622.3,0,523.3,0, 0,0,0,0],
          // B段: 更深沉的暗黑变奏
          [987.8,0,932.3,880, 784,0,740,622.3, 740,0,880,932.3, 987.8,880,0,0,
           784,0,622.3,587.3, 523.3,0,587.3,622.3, 740,0,784,880, 932.3,784,0,0,
           1046.5,0,987.8,932.3, 880,0,784,740, 880,932.3,987.8,0, 1046.5,932.3,0,0,
           880,0,740,622.3, 587.3,622.3,740,880, 987.8,0,784,0, 523.3,0,0,0],
        ];
    }
  }

  // ─── 舞台专属低音线 ───

  private getBassPattern(stage: string, section: number): number[] {
    switch (stage) {
      case 'temple': {
        // C 大调五声根音: C2=65.4, D2=73.4, E2=82.4, G2=98, A2=110
        const pA: number[] = [
          65.4,0,65.4,82.4, 98,0,65.4,0, 82.4,0,98,0, 110,0,82.4,0,
          65.4,0,73.4,0, 82.4,0,98,82.4, 110,0,98,82.4, 65.4,0,0,0];
        const pB: number[] = [
          110,0,98,82.4, 65.4,0,73.4,65.4, 82.4,0,98,110, 98,0,82.4,0,
          65.4,0,82.4,0, 98,0,110,98, 82.4,0,65.4,73.4, 65.4,0,0,0];
        return section % 2 === 0 ? pA : pB;
      }
      case 'china': {
        // G 大调五声根音: G2=98, A2=110, B2=123.5, D3=146.8, E3=164.8
        const pA: number[] = [
          98,0,98,123.5, 146.8,0,110,0, 123.5,0,146.8,0, 164.8,0,123.5,0,
          98,0,110,0, 123.5,0,146.8,123.5, 164.8,0,146.8,123.5, 98,0,0,0];
        const pB: number[] = [
          146.8,0,123.5,110, 98,0,110,123.5, 146.8,0,164.8,146.8, 123.5,0,98,0,
          110,0,123.5,0, 146.8,0,164.8,146.8, 123.5,0,110,98, 98,0,0,0];
        return section % 2 === 0 ? pA : pB;
      }
      case 'factory': {
        // E 小调: E2=82.4, F#2=92.5, G2=98, A2=110, B2=123.5, C3=130.8, D3=146.8
        const pA: number[] = [
          82.4,0,82.4,98, 110,0,82.4,0, 82.4,0,123.5,0, 110,0,82.4,0,
          82.4,0,92.5,0, 110,0,82.4,98, 123.5,0,110,82.4, 130.8,0,0,0];
        const pB: number[] = [
          110,0,110,123.5, 130.8,0,110,92.5, 123.5,0,123.5,130.8, 110,0,98,0,
          82.4,0,98,0, 110,0,123.5,110, 130.8,0,110,92.5, 82.4,0,0,0];
        return section % 2 === 0 ? pA : pB;
      }
      case 'street': {
        // A 布鲁斯: A2=110, C3=130.8, D3=146.8, Eb3=155.6, E3=164.8, G2=98
        const pA: number[] = [
          110,0,110,130.8, 146.8,0,110,0, 130.8,0,146.8,155.6, 164.8,0,130.8,0,
          110,0,98,0, 110,0,130.8,110, 146.8,0,155.6,146.8, 110,0,0,0];
        const pB: number[] = [
          146.8,0,130.8,110, 98,0,110,130.8, 146.8,0,155.6,164.8, 146.8,130.8,0,0,
          110,0,130.8,146.8, 155.6,0,146.8,130.8, 110,0,98,110, 110,0,0,0];
        return section % 2 === 0 ? pA : pB;
      }
      case 'orochi':
      default: {
        // 减音阶根音: C2=65.4, D2=73.4, Eb2=77.8, F#2=92.5, G2=98, A2=110, Bb2=116.5, B2=123.5
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

  // ─── 舞台专属和弦进行 ───

  private getChords(stage: string, section: number): number[][] {
    switch (stage) {
      case 'temple': {
        // C - Am - F - G (I - vi - IV - V)
        if (section < 2) return [
          [65.4, 98, 130.8],   // C:  C + G + E(高)
          [55, 82.4, 130.8],   // Am: A + E + C(高)
          [87.3, 130.8, 174.6],// F:  F + C + A(高)
          [98, 123.5, 146.8],  // G:  G + D + D(高)
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
          [98, 123.5, 146.8],  // G:  G + D + D(高)
          [82.4, 123.5, 164.8],// Em: E + B + E(高)
          [65.4, 98, 130.8],   // C:  C + G + E(高)
          [73.4, 110, 146.8],  // D:  D + A + D(高)
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
        // A - D - E - A (I - IV - V - I) 布鲁斯
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
        // Co - F#o - Go - Abo (减和弦循环)
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

  // ─── Pad 和弦数据 (微失谐正弦波叠层) ───

  private getPadChords(stage: string, _section: number): number[][] {
    switch (stage) {
      case 'temple':
        // Cmaj7 和弦音: C4, E4, G4, B4
        return [[261.6, 329.6, 392, 493.9], [220, 261.6, 329.6, 392]];
      case 'china':
        // Gmaj7 和弦音: G4, B4, D5, F#5
        return [[196, 246.9, 293.7, 370], [164.8, 196, 246.9, 293.7]];
      case 'factory':
        // Em7 和弦音: E4, G4, B4, D5
        return [[164.8, 196, 246.9, 293.7], [130.8, 164.8, 196, 246.9]];
      case 'street':
        // Am7 和弦音: A3, C4, E4, G4
        return [[220, 261.6, 329.6, 392], [196, 220, 261.6, 329.6]];
      case 'orochi':
      default:
        // 减七和弦: C4, Eb4, F#4, A4
        return [[261.6, 311.1, 370, 440], [220, 261.6, 311.1, 370]];
    }
  }

  // ─── 舞台专属 Lead 音色 ───

  private playStageLead(time: number, stage: string, freq: number): void {
    switch (stage) {
      case 'temple':
        // 方波 + 轻微 vibrato，清澈的寺庙感
        this.playTempleLead(time, freq);
        break;
      case 'china':
        // 三角波 + 泛音层，明亮穿透的笛/竹感
        this.playChinaLead(time, freq);
        break;
      case 'factory':
        // 锯齿波 + 失真低通，工业摇滚
        this.playFactoryLead(time, freq);
        break;
      case 'street':
        // 粗锯齿 + 布鲁斯微弯音，硬摇滚
        this.playStreetLead(time, freq);
        break;
      case 'orochi':
        // 方波 + 深低通，暗黑压迫
        this.playOrochiLead(time, freq);
        break;
      default:
        this.playGuitarLead(time, freq);
    }
  }

  private playTempleLead(time: number, freq: number): void {
    if (!this.ctx || !this.masterGain) return;
    const vol = 0.05;
    // 方波主音
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    // 轻微 vibrato
    const lfo = this.ctx.createOscillator();
    const lfoG = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 4;
    lfoG.gain.value = 2;
    lfo.connect(lfoG);
    lfoG.connect(osc.frequency);
    lfo.start(time); lfo.stop(time + 0.22);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.01);
    gain.gain.setValueAtTime(vol * 0.8, time + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
    // 低通柔化
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1800;
    lp.Q.value = 0.5;
    osc.connect(lp).connect(gain).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.22);
    // 五度泛音点缀
    const harm = this.ctx.createOscillator();
    const hg = this.ctx.createGain();
    harm.type = 'sine';
    harm.frequency.value = freq * 1.5;
    hg.gain.setValueAtTime(0, time);
    hg.gain.linearRampToValueAtTime(vol * 0.1, time + 0.02);
    hg.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
    harm.connect(hg).connect(this.masterGain);
    harm.start(time); harm.stop(time + 0.15);
  }

  private playChinaLead(time: number, freq: number): void {
    if (!this.ctx || !this.masterGain) return;
    const vol = 0.055;
    // 三角波主音
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    // 快速颤音 (竹笛风格)
    const lfo = this.ctx.createOscillator();
    const lfoG = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 6;
    lfoG.gain.value = 5;
    lfo.connect(lfoG);
    lfoG.connect(osc.frequency);
    lfo.start(time); lfo.stop(time + 0.22);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.008);
    gain.gain.setValueAtTime(vol * 0.85, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
    osc.connect(gain).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.22);
    // 高八度泛音 (竹笛泛音感)
    const harm = this.ctx.createOscillator();
    const hg = this.ctx.createGain();
    harm.type = 'sine';
    harm.frequency.value = freq * 2;
    hg.gain.setValueAtTime(0, time);
    hg.gain.linearRampToValueAtTime(vol * 0.18, time + 0.015);
    hg.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    harm.connect(hg).connect(this.masterGain);
    harm.start(time); harm.stop(time + 0.18);
  }

  private playFactoryLead(time: number, freq: number): void {
    if (!this.ctx || !this.masterGain) return;
    const vol = 0.06;
    // 锯齿波 + 失真低通
    const saw = this.ctx.createOscillator();
    const sqr = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
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
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.005);
    gain.gain.setValueAtTime(vol * 0.75, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.17);
    // 失真滤波
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
    // 粗锯齿 + 布鲁斯微弯音
    const saw = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    saw.type = 'sawtooth';
    saw.frequency.setValueAtTime(freq, time);
    // 布鲁斯弯音: 起音微升
    saw.frequency.linearRampToValueAtTime(freq * 1.03, time + 0.01);
    saw.frequency.linearRampToValueAtTime(freq, time + 0.04);
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
    // 低八度层增加粗犷感
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
    // 方波 + 深低通，暗黑感
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    // 慢速颤音 (不祥的起伏)
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
    // 深低通
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1200;
    lp.Q.value = 3;
    osc.connect(lp).connect(gain).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.25);
    // 三全音泛音 (减五度 = 暗黑感核心)
    const tritone = this.ctx.createOscillator();
    const tg = this.ctx.createGain();
    tritone.type = 'sine';
    tritone.frequency.value = freq * 1.414; // 三全音比率
    tg.gain.setValueAtTime(0, time);
    tg.gain.linearRampToValueAtTime(vol * 0.12, time + 0.02);
    tg.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    tritone.connect(tg).connect(this.masterGain);
    tritone.start(time); tritone.stop(time + 0.18);
  }

  // ─── 战斗 Pad: 微失谐正弦波叠层 ───

  private playBattlePad(time: number, freqs: number[], duration: number = 0.6): void {
    if (!this.ctx || !this.masterGain) return;
    for (const freq of freqs) {
      // 主正弦
      this.playPadVoice(time, freq, 0.018, duration);
      // 微失谐 +3 cents
      this.playPadVoice(time, freq * 1.0017, 0.012, duration);
      // 微失谐 -3 cents
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

  // ─── 舞台新增特色音色 ───

  private playStreetAccent(time: number): void {
    if (!this.ctx || !this.masterGain) return;
    // 街头电吉他刮弦
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
    // 低频冲击
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
    // 大蛇暗黑脉冲: 低频方波 + 高频泛音
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
    // 高频不和谐泛音
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
    // 中国笛子短装饰音
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    // 快速上行装饰: D6 -> G6
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

  // ─── Title Theme (100 BPM, 64 sub-beats) ───

  private playTitleBeat(now: number): void {
    if (!this.ctx || !this.masterGain) return;
    const b = this.beat;
    const b8 = b % 8;

    if (b8 === 0) this.playKick(now, 0.35);
    if (b8 === 4) this.playSnare(now, 0.12);
    if (b % 2 === 0) this.playHihat(now, 0.025, false);
    if (b8 === 3 && b % 16 >= 8) this.playRim(now, 0.06);

    if (b % 2 === 0) {
      const arpNotes = [261.6, 329.6, 392, 523.3, 493.9, 392, 329.6, 261.6,
                        220, 277.2, 329.6, 440, 392, 329.6, 277.2, 220,
                        246.9, 311.1, 370, 493.9, 440, 370, 311.1, 246.9,
                        261.6, 329.6, 392, 523.3, 493.9, 440, 392, 329.6];
      const n = arpNotes[(b / 2) % arpNotes.length];
      this.playSoftLead(now, n, 0.035);
    }

    if (b % 4 === 0) {
      const bassNotes = [65.4, 65.4, 73.4, 65.4, 55, 55, 61.7, 65.4,
                         73.4, 73.4, 65.4, 73.4, 61.7, 61.7, 55, 65.4];
      this.playBass(now, bassNotes[(b / 4) % bassNotes.length], 0.08);
    }

    if (b % 4 === 2) {
      const melody = [523.3, 0, 659.3, 0, 587.3, 523.3, 0, 440,
                      392, 0, 440, 0, 523.3, 493.9, 440, 392];
      const n = melody[(b / 4) % melody.length];
      if (n > 0) this.playSoftLead(now, n, 0.05);
    }

    if (b % 16 === 0) {
      const chords = [[261.6, 329.6, 392], [220, 277.2, 329.6], [246.9, 311.1, 370], [261.6, 329.6, 392]];
      this.playPad(now, chords[(b / 16) % 4], 1.8);
    }

    if (b % 32 === 0) {
      this.playSubPad(now, 65.4, 3.5);
    }
  }

  // ─── Core Synthesis Primitives ──

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
    // Sub层
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
    gain.gain.linearRampToValueAtTime(vol, time + 0.008);
    gain.gain.setValueAtTime(vol * 0.75, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.17);
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

  /** Section-transition fill: ascending arp (triangle wave, 3-4 quick notes). */
  private playTransitionFill(time: number): void {
    if (!this.ctx || !this.masterGain) return;
    const notes = [523.3, 659.3, 784, 1046.5];
    const vol = 0.04;
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t = time + i * 0.05;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.connect(gain).connect(this.masterGain!);
      osc.start(t); osc.stop(t + 0.07);
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

  private playBellAccent(time: number, vol: number = 0.04): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = 1760;
    gain2.gain.setValueAtTime(vol * 0.38, time);
    gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
    osc.connect(gain).connect(this.masterGain);
    osc2.connect(gain2).connect(this.masterGain);
    osc.start(time); osc.stop(time + 0.55);
    osc2.start(time); osc2.stop(time + 0.35);
  }

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
