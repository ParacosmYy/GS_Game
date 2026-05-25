/** Cinematic timing state: HitStop, SuperFlash, KO SlowMo, damage tracking, victory fanfare.
 *  Owns ALL cinematic effect variables; rendering/audio callbacks remain in main.ts. */
import type { MaxModeState } from '../core/types.js';

export class CinematicState {
  hitStop = 0;
  superFlashTimer = 0;
  superFlashX = 0;
  superFlashY = 0;
  superFlashAttacker = 0; // 0=p1, 1=p2
  /** Defender index during hit-stop (for jitter rendering). -1 = none */
  hitStopDefender = -1;
  /** Directional bias for defender jitter (attacker's facing direction) */
  hitStopBias = 0;
  koSlowMo = 0;
  koSlowMoTriggered = false;
  koSlowMoFrameCounter = 0;
  victoryFanfarePlayed = false;
  p1DamageTaken = 0;
  p2DamageTaken = 0;

  /** Tick MAX mode timers (always ticks, even during hit-stop) */
  tickMaxModes(maxModes: [MaxModeState, MaxModeState]): void {
    this.tickOneMaxMode(maxModes[0]);
    this.tickOneMaxMode(maxModes[1]);
  }

  private tickOneMaxMode(m: MaxModeState): void {
    if (!m.active) return;
    m.timer--;
    if (m.timer <= 0) { m.active = false; m.timer = 0; }
  }

  /** Decrement superFlashTimer (call during freeze) */
  tickSuperFlash(): void {
    if (this.superFlashTimer > 0) this.superFlashTimer--;
  }

  /** Returns true if hit-stop is active (freezes game logic). Decrements hitStop each call. */
  isFrozen(): boolean {
    if (this.hitStop > 0) { this.hitStop--; return true; }
    return false;
  }

  /** Called during hit-stop freeze: ticks MAX mode + super flash */
  tickInFreeze(maxModes: [MaxModeState, MaxModeState]): void {
    this.tickMaxModes(maxModes);
    this.tickSuperFlash();
  }

  /** Set hit-stop freeze for N frames, with defender info for jitter rendering */
  triggerHitStop(frames: number, defenderIdx: number = -1, bias: number = 0): void {
    this.hitStop = frames;
    this.hitStopDefender = defenderIdx;
    this.hitStopBias = bias;
  }

  /** Add frames to existing hit-stop (stack, not replace) */
  addHitStop(frames: number, defenderIdx: number = -1): void {
    this.hitStop += frames;
    if (defenderIdx >= 0) this.hitStopDefender = defenderIdx;
  }

  /** Trigger Super Flash (dark screen freeze) on DM startup */
  triggerSuperFlash(x: number, y: number, attacker: number): void {
    this.superFlashTimer = 24;
    this.superFlashX = x;
    this.superFlashY = y;
    this.superFlashAttacker = attacker;
    this.hitStop = 24;
  }

  /** Trigger KO slow-motion (40 frames, every 3rd frame runs) */
  triggerKOSlowMo(): void {
    this.koSlowMoTriggered = true;
    this.koSlowMo = 40;
    this.koSlowMoFrameCounter = 0;
  }

  /** Trigger DM KO slow-motion — enhanced (60 frames, every 4th frame runs) */
  triggerDMKOSlowMo(): void {
    this.koSlowMoTriggered = true;
    this.koSlowMo = 60;
    this.koSlowMoFrameCounter = 0;
  }

  /** KO slow-mo frame skip: returns true when frame should be skipped */
  shouldSkipFrame(): boolean {
    if (this.koSlowMo <= 0) return false;
    // DM KO uses slower rate (every 4th frame), normal KO every 3rd
    const skipRate = this.koSlowMo > 40 ? 4 : 3;
    this.koSlowMoFrameCounter++;
    if (this.koSlowMoFrameCounter < skipRate) return true;
    this.koSlowMoFrameCounter = 0;
    this.koSlowMo--;
    return false;
  }

  /** Returns true when KO slow-mo has finished */
  isKOSlowMoDone(): boolean { return this.koSlowMo <= 0; }

  /** Track damage for PERFECT detection. defenderIndex: 0=p1, 1=p2 */
  trackDamage(defenderIndex: number, damage: number): void {
    if (defenderIndex === 0) this.p1DamageTaken += damage;
    else this.p2DamageTaken += damage;
  }

  /** Which player achieved PERFECT? Returns winner index if winner took 0 damage. */
  getPerfectPlayer(winner: number | null): number | null {
    if (winner === null) return null;
    // PERFECT = winner received zero damage
    // p1DamageTaken = total damage P1 received. If P1 won (winner=0), check p1DamageTaken
    const winnerDamage = winner === 0 ? this.p1DamageTaken : this.p2DamageTaken;
    return winnerDamage === 0 ? winner : null;
  }

  /** Full reset: back to match-select / character-select state */
  reset(): void {
    this.hitStop = 0;
    this.hitStopDefender = -1;
    this.hitStopBias = 0;
    this.superFlashTimer = 0;
    this.superFlashX = 0;
    this.superFlashY = 0;
    this.superFlashAttacker = 0;
    this.koSlowMo = 0;
    this.koSlowMoTriggered = false;
    this.koSlowMoFrameCounter = 0;
    this.victoryFanfarePlayed = false;
    this.p1DamageTaken = 0;
    this.p2DamageTaken = 0;
  }

  /** Reset between rounds: slow-mo + hit-stop + superFlash + damage, keep victory fanfare */
  resetForNewRound(): void {
    this.hitStop = 0;
    this.hitStopDefender = -1;
    this.hitStopBias = 0;
    this.superFlashTimer = 0;
    this.koSlowMoTriggered = false;
    this.koSlowMo = 0;
    this.koSlowMoFrameCounter = 0;
    this.p1DamageTaken = 0;
    this.p2DamageTaken = 0;
  }
}
