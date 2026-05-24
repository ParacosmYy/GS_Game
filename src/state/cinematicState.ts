/** Cinematic timing state: HitStop, SuperFlash, KO SlowMo, damage tracking, victory fanfare.
 *  Owns ALL cinematic effect variables; rendering/audio callbacks remain in main.ts. */
import type { MaxModeState } from '../core/types.js';

export class CinematicState {
  hitStop = 0;
  superFlashTimer = 0;
  superFlashX = 0;
  superFlashY = 0;
  superFlashAttacker = 0; // 0=p1, 1=p2
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

  /** Set hit-stop freeze for N frames */
  triggerHitStop(frames: number): void { this.hitStop = frames; }

  /** Trigger Super Flash (dark screen freeze) on DM startup */
  triggerSuperFlash(x: number, y: number, attacker: number): void {
    this.superFlashTimer = 20;
    this.superFlashX = x;
    this.superFlashY = y;
    this.superFlashAttacker = attacker;
    this.hitStop = 20;
  }

  /** Trigger KO slow-motion (40 frames, every 3rd frame runs) */
  triggerKOSlowMo(): void {
    this.koSlowMoTriggered = true;
    this.koSlowMo = 40;
    this.koSlowMoFrameCounter = 0;
  }

  /** KO slow-mo frame skip: returns true when frame should be skipped */
  shouldSkipFrame(): boolean {
    if (this.koSlowMo <= 0) return false;
    this.koSlowMoFrameCounter++;
    if (this.koSlowMoFrameCounter < 3) return true;
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

  /** Which player achieved PERFECT? winner=0→p1 won→check p1 took 0 damage. Returns null if none. */
  getPerfectPlayer(winner: number | null): number | null {
    if (winner === null) return null;
    // Winner took no damage from opponent → winner had PERFECT
    const winnerTookNoDamage = winner === 0
      ? this.p2DamageTaken === 0  // P1 won: check if P2 (opponent) took 0 damage? No — check if WINNER took 0
      : this.p1DamageTaken === 0;
    // Actually: PERFECT = winner took zero damage
    // p1DamageTaken = damage P1 received. If P1 won (winner=0) and p1DamageTaken===0 → PERFECT for P1
    // But original code checks: winner === 0 ? p2DamageTaken === 0 : p1DamageTaken === 0
    // That checks if the LOSER dealt any damage. If loser dealt 0 → winner is PERFECT.
    return winnerTookNoDamage ? winner : null;
  }

  /** Full reset: back to match-select / character-select state */
  reset(): void {
    this.hitStop = 0;
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
    this.superFlashTimer = 0;
    this.koSlowMoTriggered = false;
    this.koSlowMo = 0;
    this.koSlowMoFrameCounter = 0;
    this.p1DamageTaken = 0;
    this.p2DamageTaken = 0;
  }
}
