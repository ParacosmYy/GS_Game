/** Cinematic timing state: HitStop, SuperFlash, KO SlowMo, damage tracking, victory fanfare.
 *  Owns ALL cinematic effect variables; rendering/audio callbacks remain in main.ts. */
import type { MaxModeState } from '../core/types.js';

/** KO impact dust particle for rendering */
export interface KODustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export class CinematicState {
  hitStop = 0;
  superFlashTimer = 0;
  superFlashX = 0;
  superFlashY = 0;
  superFlashAttacker = 0; // 0=p1, 1=p2
  /** Flash type for current super flash */
  superFlashType: 'DM' | 'SDM' | 'HSDM' = 'DM';
  /** Defender index during hit-stop (for jitter rendering). -1 = none */
  hitStopDefender = -1;
  /** Directional bias for defender jitter (attacker's facing direction) */
  hitStopBias = 0;
  koSlowMo = 0;
  koSlowMoTriggered = false;
  koSlowMoFrameCounter = 0;
  /** KO去饱和闪光剩余帧 — 渲染层读取此值绘制灰度覆盖 */
  koDesaturateTimer = 0;
  /** KO红色暗角剩余帧 — 渲染层读取此值绘制红色边缘渐变 */
  koVignetteTimer = 0;
  /** KO impact dust particles — spawned at KO hit location */
  koDustParticles: KODustParticle[] = [];
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
  triggerSuperFlash(x: number, y: number, attacker: number, duration?: number, flashType?: 'DM' | 'SDM' | 'HSDM'): void {
    const dur = duration ?? 28;
    this.superFlashTimer = dur;
    this.superFlashX = x;
    this.superFlashY = y;
    this.superFlashAttacker = attacker;
    this.superFlashType = flashType ?? 'DM';
    this.hitStop = dur;
  }

  /** Trigger KO slow-motion (40 frames, every 3rd frame runs) */
  triggerKOSlowMo(): void {
    this.koSlowMoTriggered = true;
    this.koSlowMo = 40;
    this.koSlowMoFrameCounter = 0;
    // KO视觉序列: 去饱和闪光(8帧) + 红色暗角(整个慢动作期间)
    this.koDesaturateTimer = 8;
    this.koVignetteTimer = 60;
  }

  /** Trigger DM KO slow-motion — enhanced (60 frames, every 4th frame runs) */
  triggerDMKOSlowMo(): void {
    this.koSlowMoTriggered = true;
    this.koSlowMo = 60;
    this.koSlowMoFrameCounter = 0;
    // DM KO: 更长的去饱和(12帧) + 更强烈的暗角(90帧)
    this.koDesaturateTimer = 12;
    this.koVignetteTimer = 90;
  }

  /** Spawn KO impact dust particles at the hit location */
  spawnKODust(hitX: number, hitY: number, count: number = 20): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 1.5 + Math.random() * 4;
      const life = 30 + Math.floor(Math.random() * 30);
      this.koDustParticles.push({
        x: hitX + (Math.random() - 0.5) * 20,
        y: hitY + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        life,
        maxLife: life,
        size: 2 + Math.random() * 4,
        color: Math.random() > 0.5 ? '#c8a060' : '#a08050',
      });
    }
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
    // 衰减KO视觉效果
    if (this.koDesaturateTimer > 0) this.koDesaturateTimer--;
    if (this.koVignetteTimer > 0) this.koVignetteTimer--;
    // 更新KO灰尘粒子
    this.updateKODustParticles();
    return false;
  }

  /** Update KO dust particles (called during slow-mo frames) */
  private updateKODustParticles(): void {
    for (let i = this.koDustParticles.length - 1; i >= 0; i--) {
      const p = this.koDustParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12; // gravity
      p.vx *= 0.97; // friction
      p.life--;
      if (p.life <= 0) {
        this.koDustParticles.splice(i, 1);
      }
    }
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
    this.superFlashType = 'DM';
    this.koSlowMo = 0;
    this.koSlowMoTriggered = false;
    this.koSlowMoFrameCounter = 0;
    this.koDesaturateTimer = 0;
    this.koVignetteTimer = 0;
    this.koDustParticles = [];
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
    this.superFlashType = 'DM';
    this.koSlowMoTriggered = false;
    this.koSlowMo = 0;
    this.koSlowMoFrameCounter = 0;
    this.koDesaturateTimer = 0;
    this.koVignetteTimer = 0;
    this.koDustParticles = [];
    this.p1DamageTaken = 0;
    this.p2DamageTaken = 0;
  }
}
