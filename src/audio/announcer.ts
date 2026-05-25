/**
 * Web Speech API Fight Announcer
 * Zero-dependency voice callouts using browser-native SpeechSynthesis
 * v2: 更清晰的语音、更戏剧性的节奏、更好的音素选择
 */

export interface AnnouncerConfig {
  /** Speech pitch (0-2). Default 0.6 for deep announcer voice */
  pitch: number;
  /** Speech rate (0.1-10). Default 0.75 for dramatic pacing */
  rate: number;
  /** Volume (0-1). Default 0.9 */
  volume: number;
}

const DEFAULT_CONFIG: AnnouncerConfig = {
  pitch: 0.6,
  rate: 0.75,
  volume: 0.9,
};

class FightAnnouncer {
  private config: AnnouncerConfig;
  private enabled: boolean = true;
  private voice: SpeechSynthesisVoice | null = null;

  constructor(config: Partial<AnnouncerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    // 尝试选择英文男声
    this.selectBestVoice();
  }

  private selectBestVoice(): void {
    if (typeof speechSynthesis === 'undefined') return;
    const trySelect = (): void => {
      const voices = speechSynthesis.getVoices();
      // 优先选择英文男声
      const englishMale = voices.find(v =>
        v.lang.startsWith('en') && (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('daniel'))
      );
      const englishAny = voices.find(v => v.lang.startsWith('en-'));
      const anyEnglish = voices.find(v => v.lang.startsWith('en'));
      this.voice = englishMale || englishAny || anyEnglish || null;
    };
    trySelect();
    // 某些浏览器异步加载voice列表
    if (typeof speechSynthesis.onvoiceschanged !== 'undefined') {
      speechSynthesis.onvoiceschanged = trySelect;
    }
  }

  /** Speak a phrase. Cancels any currently playing speech. */
  private speak(text: string, pitchOverride?: number, rateOverride?: number): void {
    if (!this.enabled || typeof speechSynthesis === 'undefined') return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = pitchOverride ?? this.config.pitch;
    utterance.rate = rateOverride ?? this.config.rate;
    utterance.volume = this.config.volume;
    utterance.lang = 'en-US';
    if (this.voice) utterance.voice = this.voice;
    speechSynthesis.speak(utterance);
  }

  // ── Fight Events ──

  /** Called at round start: "Round X" */
  roundStart(roundNumber: number): void {
    // 更慢、更低沉的round call
    this.speak(`Round ${roundNumber}`, 0.55, 0.7);
  }

  /** Called after round announcement: "Fight!" */
  fight(): void {
    // 短促有力的 "Fight!"
    setTimeout(() => this.speak('Fight!', 0.65, 0.8), 800);
  }

  /** Called on KO */
  knockOut(): void {
    // K.O. — 拆分两个字母，更有戏剧性
    this.speak('K ... O!', 0.5, 0.6);
  }

  /** Called on perfect victory (no damage taken) */
  perfect(): void {
    setTimeout(() => this.speak('Perfect!', 0.7, 0.85), 600);
  }

  /** Called on time over */
  timeOver(): void {
    this.speak('Time Over!', 0.55, 0.8);
  }

  /** Called on first hit of the round */
  firstAttack(): void {
    this.speak('First Attack!', 0.65, 0.9);
  }

  /** Called on match winner */
  winner(): void {
    setTimeout(() => this.speak('Winner!', 0.6, 0.75), 1200);
  }

  /** Called on counter hit */
  counter(): void {
    this.speak('Counter!', 0.7, 1.0);
  }

  /** Called on guard crush */
  guardCrush(): void {
    this.speak('Guard Crush!', 0.55, 0.85);
  }

  /** Called on super cancel */
  superCancel(): void {
    this.speak('Super Cancel!', 0.7, 1.0);
  }

  /** Called on double KO */
  doubleKO(): void {
    this.speak('Double K O!', 0.5, 0.65);
  }

  /** Called on new challenger */
  newChallenger(): void {
    this.speak('Here comes a new challenger!', 0.65, 0.85);
  }

  /** Toggle announcer on/off */
  toggle(): void {
    this.enabled = !this.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export const announcer = new FightAnnouncer();
