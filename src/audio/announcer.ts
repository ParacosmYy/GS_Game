/**
 * Announcer -- 合成播报系统
 * 使用 Web Audio API 合成短促音调序列替代 Web Speech API
 * 每个播报事件对应一段 2-6 个音符的序列，方波 + 三角波混合产生 8-bit/arcade 风格
 */

import { getCtx } from './audioCtx.js';

// 播报音符定义
interface NoteEvent {
  freq: number;       // 频率 Hz
  duration: number;   // 持续时间 ms
  gap: number;        // 与下一个音符间隔 ms
}

const SQUARE = 'square' as OscillatorType;
const SAWTOOTH = 'sawtooth' as OscillatorType;
const SINE = 'sine' as OscillatorType;

// 播报音序定义
const ROUND_NOTES: NoteEvent[] = [
  { freq: 440, duration: 120, gap: 150 },
  { freq: 523, duration: 180, gap: 0 },
];

const FIGHT_NOTES: NoteEvent[] = [
  { freq: 330, duration: 80, gap: 80 },
  { freq: 440, duration: 80, gap: 80 },
  { freq: 880, duration: 300, gap: 0 },
];

const KO_NOTES: NoteEvent[] = [
  { freq: 880, duration: 150, gap: 100 },
  { freq: 440, duration: 350, gap: 0 },
];

const PERFECT_NOTES: NoteEvent[] = [
  { freq: 523, duration: 80, gap: 80 },
  { freq: 659, duration: 80, gap: 80 },
  { freq: 784, duration: 80, gap: 80 },
  { freq: 1047, duration: 80, gap: 80 },
  { freq: 1319, duration: 200, gap: 0 },
];

const TIME_OVER_NOTES: NoteEvent[] = [
  { freq: 440, duration: 100, gap: 150 },
  { freq: 440, duration: 100, gap: 150 },
  { freq: 440, duration: 200, gap: 0 },
];

const WINNER_NOTES: NoteEvent[] = [
  { freq: 523, duration: 120, gap: 150 },
  { freq: 659, duration: 120, gap: 150 },
  { freq: 784, duration: 400, gap: 0 },
];

const FIRST_ATTACK_NOTES: NoteEvent[] = [
  { freq: 1047, duration: 80, gap: 100 },
  { freq: 1319, duration: 250, gap: 0 },
];

const COUNTER_NOTES: NoteEvent[] = [
  { freq: 1319, duration: 50, gap: 60 },
  { freq: 1047, duration: 50, gap: 60 },
  { freq: 1319, duration: 200, gap: 0 },
];

const GUARD_CRUSH_NOTES: NoteEvent[] = [
  { freq: 220, duration: 80, gap: 100 },
  { freq: 440, duration: 80, gap: 100 },
  { freq: 880, duration: 300, gap: 0 },
];

const DOUBLE_KO_NOTES: NoteEvent[] = [
  { freq: 880, duration: 100, gap: 120 },
  { freq: 440, duration: 100, gap: 120 },
  { freq: 220, duration: 400, gap: 0 },
];

const SUPER_CANCEL_NOTES: NoteEvent[] = [
  { freq: 523, duration: 50, gap: 60 },
  { freq: 659, duration: 50, gap: 60 },
  { freq: 784, duration: 50, gap: 60 },
  { freq: 1047, duration: 300, gap: 0 },
];

const NEW_CHALLENGER_NOTES: NoteEvent[] = [
  { freq: 440, duration: 60, gap: 80 },
  { freq: 523, duration: 60, gap: 80 },
  { freq: 659, duration: 60, gap: 80 },
  { freq: 880, duration: 60, gap: 80 },
  { freq: 1047, duration: 300, gap: 0 },
];

export class Announcer {
  private enabled = true;

  setEnabled(v: boolean): void { this.enabled = v; }

  isEnabled(): boolean { return this.enabled; }

  toggle(): void { this.enabled = !this.enabled; }

  private playSequence(notes: NoteEvent[], waveType: OscillatorType = SQUARE, volume: number = 0.15): void {
    if (!this.enabled) return;
    const ctx = getCtx();
    if (ctx.state === 'suspended') return;

    let offset = 0;
    for (const note of notes) {
      const startTime = ctx.currentTime + offset / 1000;
      const endTime = startTime + note.duration / 1000;

      // 主音
      const osc = ctx.createOscillator();
      osc.type = waveType;
      osc.frequency.value = note.freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.005);
      gain.gain.setValueAtTime(volume, endTime - 0.01);
      gain.gain.linearRampToValueAtTime(0, endTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(endTime + 0.01);

      // 泛音层 (triangle, 高八度, 音量 20%)
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.value = note.freq * 2;
      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0, startTime);
      gain2.gain.linearRampToValueAtTime(volume * 0.2, startTime + 0.005);
      gain2.gain.setValueAtTime(volume * 0.2, endTime - 0.01);
      gain2.gain.linearRampToValueAtTime(0, endTime);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(startTime);
      osc2.stop(endTime + 0.01);

      offset += note.duration + note.gap;
    }
  }

  roundStart(n: number): void {
    // 根据回合数调整结尾音高
    const base = ROUND_NOTES.map(note => ({ ...note }));
    base[1].freq = 523 + (n - 1) * 65; // ROUND 1=523, 2=587, 3=659, 4+=721
    this.playSequence(base);
  }

  fight(): void {
    this.playSequence(FIGHT_NOTES, SAWTOOTH, 0.18);
  }

  knockOut(): void {
    this.playSequence(KO_NOTES, SQUARE, 0.2);
  }

  perfect(): void {
    this.playSequence(PERFECT_NOTES, SINE, 0.15);
  }

  timeOver(): void {
    this.playSequence(TIME_OVER_NOTES);
  }

  winner(): void {
    this.playSequence(WINNER_NOTES, SINE, 0.15);
  }

  firstAttack(): void {
    this.playSequence(FIRST_ATTACK_NOTES);
  }

  counter(): void {
    this.playSequence(COUNTER_NOTES);
  }

  guardCrush(): void {
    this.playSequence(GUARD_CRUSH_NOTES, SAWTOOTH, 0.15);
  }

  superCancel(): void {
    this.playSequence(SUPER_CANCEL_NOTES);
  }

  doubleKO(): void {
    this.playSequence(DOUBLE_KO_NOTES);
  }

  newChallenger(): void {
    this.playSequence(NEW_CHALLENGER_NOTES);
  }
}

export const announcer = new Announcer();
