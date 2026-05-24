/**
 * BGM — Web Audio Chiptune 战斗背景音乐
 *
 * 140BPM 热血格斗 BGM，使用振荡器 + 噪声合成。
 * 零依赖，程序化生成。A 小调五声音阶。
 */

export class BGMPlayer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private loopTimer: ReturnType<typeof setInterval> | null = null;
  private volume: number = 0.3;
  private beat: number = 0;

  start(): void {
    if (this.isPlaying) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.volume;
    this.masterGain.connect(this.ctx.destination);
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
    if (this.isPlaying) this.stop(); else this.start();
    return this.isPlaying;
  }

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.masterGain) this.masterGain.gain.value = this.volume;
  }

  get playing(): boolean { return this.isPlaying; }

  private scheduleLoop(): void {
    const BPM = 140;
    const beatMs = 60000 / BPM;

    const play = (): void => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;

      // Drum pattern: kick on 1,3; snare on 2,4; hihat every 8th
      if (this.beat % 4 === 0 || this.beat % 4 === 2) this.playKick(now);
      if (this.beat % 4 === 1 || this.beat % 4 === 3) this.playSnare(now);
      if (this.beat % 2 === 0) this.playHihat(now);

      // Bass line (4-bar loop, 16 beats)
      const bassNote = this.getBassNote(this.beat % 16);
      this.playBass(now, bassNote);

      // Melody (8-bar loop, 32 beats, plays on odd 8th notes)
      if (this.beat % 2 === 1) {
        const melodyNote = this.getMelodyNote(this.beat % 32);
        this.playMelody(now, melodyNote);
      }

      // Arpeggio accent every 4 bars (beat 0 of bar 4)
      if (this.beat % 32 === 28) this.playArpAccent(now);

      this.beat = (this.beat + 1) % 32;
    };

    play();
    this.loopTimer = setInterval(play, beatMs / 2);
  }

  // ─── Note patterns ───

  /** A minor pentatonic bass line (4 bars × 4 beats = 16 positions) */
  private getBassNote(pos: number): number {
    const bassLine = [
      82.4, 82.4, 110, 110,   // E2 E2 A2 A2
      130.8, 110, 82.4, 82.4,  // C3 A2 E2 E2
      146.8, 146.8, 130.8, 130.8, // D3 D3 C3 C3
      110, 82.4, 110, 82.4,   // A2 E2 A2 E2
    ];
    return bassLine[pos % bassLine.length];
  }

  /** Energetic melody in A minor (8 bars × 4 beats = 32 positions) */
  private getMelodyNote(pos: number): number {
    const melody = [
      659.3, 0, 784, 659.3,       // E5 - G5 E5
      523.3, 587.3, 659.3, 0,       // C5 D5 E5 -
      440, 523.3, 587.3, 659.3,     // A4 C5 D5 E5
      0, 784, 880, 0,               // - G5 A5 -
      659.3, 784, 880, 784,         // E5 G5 A5 G5
      659.3, 587.3, 523.3, 0,       // E5 D5 C5 -
      440, 0, 523.3, 587.3,         // A4 - C5 D5
      659.3, 0, 440, 0,             // E5 - A4 -
    ];
    return melody[pos % melody.length];
  }

  // ─── Synthesis ───

  private playKick(time: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.1);
    gain.gain.setValueAtTime(0.6, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    osc.connect(gain).connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.15);
  }

  private playSnare(time: number): void {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.08);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3000;
    noise.connect(filter).connect(gain).connect(this.masterGain);
    noise.start(time);
    noise.stop(time + 0.08);
  }

  private playHihat(time: number): void {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.03);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 8000;
    noise.connect(filter).connect(gain).connect(this.masterGain);
    noise.start(time);
    noise.stop(time + 0.03);
  }

  private playBass(time: number, freq: number): void {
    if (!this.ctx || !this.masterGain || freq === 0) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    osc.connect(filter).connect(gain).connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.2);
  }

  private playMelody(time: number, freq: number): void {
    if (!this.ctx || !this.masterGain || freq === 0) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    osc.connect(gain).connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.18);
  }

  /** Arpeggio accent at phrase boundary for energy */
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
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(gain).connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 0.1);
    });
  }
}

export const bgm = new BGMPlayer();
