/**
 * Web Speech API Fight Announcer
 * Zero-dependency voice callouts using browser-native SpeechSynthesis
 * Configured to sound like a deep-voiced fighting game announcer
 */

export interface AnnouncerConfig {
  /** Speech pitch (0-2). Default 0.7 for deep announcer voice */
  pitch: number;
  /** Speech rate (0.1-10). Default 0.9 for dramatic pacing */
  rate: number;
  /** Volume (0-1). Default 0.8 */
  volume: number;
}

const DEFAULT_CONFIG: AnnouncerConfig = {
  pitch: 0.7,
  rate: 0.9,
  volume: 0.8,
};

class FightAnnouncer {
  private config: AnnouncerConfig;
  private enabled: boolean = true;

  constructor(config: Partial<AnnouncerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /** Speak a phrase. Cancels any currently playing speech. */
  private speak(text: string): void {
    if (!this.enabled || typeof speechSynthesis === 'undefined') return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = this.config.pitch;
    utterance.rate = this.config.rate;
    utterance.volume = this.config.volume;
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  }

  // ── Fight Events ──

  /** Called at round start: "Round X" */
  roundStart(roundNumber: number): void {
    this.speak(`Round ${roundNumber}`);
  }

  /** Called after round announcement: "Fight!" */
  fight(): void {
    setTimeout(() => this.speak('Fight!'), 800);
  }

  /** Called on KO */
  knockOut(): void {
    this.speak('K O!');
  }

  /** Called on perfect victory (no damage taken) */
  perfect(): void {
    setTimeout(() => this.speak('Perfect!'), 600);
  }

  /** Called on time over */
  timeOver(): void {
    this.speak('Time Over!');
  }

  /** Called on match winner */
  winner(): void {
    setTimeout(() => this.speak('Winner!'), 1200);
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
