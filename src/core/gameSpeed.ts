/**
 * Game Speed Controller — adjustable game speed and slow-motion effects
 *
 * Provides speed control for dramatic slow-mo on super flash, KO, etc.
 * and configurable base speed for training mode.
 *
 * 归属: core/ — 纯逻辑，无渲染依赖
 */

export interface GameSpeedConfig {
  /** Base speed multiplier (0.25, 0.5, 0.75, 1.0, 1.5, 2.0) */
  speed: number;
  /** What triggers automatic slow-mo */
  slowMoTrigger: 'super_flash' | 'ko' | 'none';
  /** Slow-mo duration in ticks */
  slowMoDuration: number;
  /** Speed during slow-mo (e.g. 0.3 = 30% speed) */
  slowMoSpeed: number;
}

/** Preset slow-mo configurations */
export const SLOWMO_SUPER_FLASH: GameSpeedConfig = {
  speed: 1.0,
  slowMoTrigger: 'super_flash',
  slowMoDuration: 8,
  slowMoSpeed: 0.3,
};

export const SLOWMO_KO: GameSpeedConfig = {
  speed: 1.0,
  slowMoTrigger: 'ko',
  slowMoDuration: 15,
  slowMoSpeed: 0.2,
};

export class GameSpeedController {
  private baseSpeed: number = 1.0;
  private currentSpeed: number = 1.0;
  private slowMoRemaining: number = 0;
  private slowMoSpeed: number = 0.3;
  private slowMoTotal: number = 0; // for progress tracking

  /** Set the base gameplay speed (training mode etc.) */
  setSpeed(speed: number): void {
    if (speed <= 0) return;
    this.baseSpeed = speed;
  }

  /** Get the configured base speed */
  getBaseSpeed(): number {
    return this.baseSpeed;
  }

  /** Trigger a slow-motion effect with given duration and optional speed override */
  triggerSlowMo(duration: number, speed: number = 0.3): void {
    if (duration <= 0) return;
    this.slowMoRemaining = duration;
    this.slowMoTotal = duration;
    this.slowMoSpeed = Math.max(0.01, Math.min(1.0, speed));
  }

  /** Per-tick update. Returns current effective speed factor. */
  update(): number {
    if (this.slowMoRemaining > 0) {
      this.slowMoRemaining--;
      if (this.slowMoRemaining <= 0) {
        this.currentSpeed = this.baseSpeed;
      } else {
        this.currentSpeed = this.baseSpeed * this.slowMoSpeed;
      }
    } else {
      this.currentSpeed = this.baseSpeed;
    }
    return this.currentSpeed;
  }

  /** Get current effective speed without advancing state */
  getSpeed(): number {
    return this.currentSpeed;
  }

  /** Whether slow-mo is currently active */
  isSlowMo(): boolean {
    return this.slowMoRemaining > 0;
  }

  /** Get slow-mo progress (0 = just started, 1 = about to end) */
  getSlowMoProgress(): number {
    if (this.slowMoTotal <= 0) return 1;
    return 1 - (this.slowMoRemaining / this.slowMoTotal);
  }

  /** Cancel any active slow-mo immediately */
  cancelSlowMo(): void {
    this.slowMoRemaining = 0;
    this.slowMoTotal = 0;
    this.currentSpeed = this.baseSpeed;
  }

  /** Reset to defaults */
  reset(): void {
    this.baseSpeed = 1.0;
    this.currentSpeed = 1.0;
    this.slowMoRemaining = 0;
    this.slowMoSpeed = 0.3;
    this.slowMoTotal = 0;
  }
}
