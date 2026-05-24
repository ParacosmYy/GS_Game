/** Round State — round tracking, win counts, fade transitions, fighter resets.
 *  Owns all round/match state; main loop calls into this for round lifecycle. */
import { Fighter } from '../entities/fighter.js';
import { CommandBuffer } from '../input/commandBuffer.js';
import { CombatSystem } from '../combat/combatSystem.js';
import { Projectile } from '../entities/projectile.js';
import type { VFXSystem } from '../rendering/vfx.js';
import type { CinematicState } from './cinematicState.js';
import { resetMeterSystem } from '../combat/meter.js';
import { STAGE_WIDTH } from '../core/constants.js';
import type { PowerGauge, MaxModeState } from '../core/types.js';

/** Dependencies injected from main.ts — avoids global coupling */
interface RoundDeps {
  p1: Fighter; p2: Fighter;
  p1Cmd: CommandBuffer; p2Cmd: CommandBuffer;
  combatSystem: CombatSystem;
  projectiles: Projectile[];
  vfx: VFXSystem;
  cinematic: CinematicState;
  gauges: [PowerGauge, PowerGauge];
  maxModes: [MaxModeState, MaxModeState];
  tickRef: { value: number };
}

export class RoundState {
  p1Wins = 0;
  p2Wins = 0;
  currentRound = 1;
  readonly winsNeeded = 2;

  // Fade transition (0=none active)
  fadeAlpha = 0;
  fadeDirection = 0;  // 0=idle, 1=out(to black), -1=in(from black)
  fadeCallback: (() => void) | null = null;

  // Injected system refs
  private p1: Fighter;
  private p2: Fighter;
  private p1Cmd: CommandBuffer;
  private p2Cmd: CommandBuffer;
  private combatSystem: CombatSystem;
  private projectiles: Projectile[];
  private vfx: VFXSystem;
  private cinematic: CinematicState;
  private gauges: [PowerGauge, PowerGauge];
  private maxModes: [MaxModeState, MaxModeState];
  private tickRef: { value: number };

  constructor(d: RoundDeps) {
    this.p1 = d.p1; this.p2 = d.p2;
    this.p1Cmd = d.p1Cmd; this.p2Cmd = d.p2Cmd;
    this.combatSystem = d.combatSystem;
    this.projectiles = d.projectiles;
    this.vfx = d.vfx;
    this.cinematic = d.cinematic;
    this.gauges = d.gauges;
    this.maxModes = d.maxModes;
    this.tickRef = d.tickRef;
  }

  /** Add a win. Returns match winner (0 or 1), or null if match continues. */
  addWin(winner: number | null): number | null {
    if (winner === 0) this.p1Wins++;
    else if (winner === 1) this.p2Wins++;
    if (this.p1Wins >= this.winsNeeded) return 0;
    if (this.p2Wins >= this.winsNeeded) return 1;
    return null;
  }

  /** Determine round winner from health. 0=P1, 1=P2, null=draw */
  determineWinner(): number | null {
    const h1 = this.p1.health, h2 = this.p2.health;
    if (h1 <= 0 && h2 <= 0) return null;
    if (h1 <= 0) return 1;
    if (h2 <= 0) return 0;
    return h1 > h2 ? 0 : h2 > h1 ? 1 : null;
  }

  /** Start fade-to-black transition for next round */
  startRoundTransition(): void {
    this.fadeDirection = 1;
    this.fadeCallback = () => {
      this.currentRound++;
      this.resetForNewRound();
      this.fadeDirection = -1; // fade back in
    };
  }

  /** Tick fade alpha. Returns true while fade is active. */
  tickFade(): boolean {
    if (this.fadeDirection === 0) return false;
    this.fadeAlpha += this.fadeDirection * 0.04;
    if (this.fadeAlpha >= 1 && this.fadeDirection === 1) {
      this.fadeAlpha = 1;
      this.fadeCallback?.();
      this.fadeCallback = null;
    }
    if (this.fadeAlpha <= 0 && this.fadeDirection === -1) {
      this.fadeAlpha = 0;
      this.fadeDirection = 0;
    }
    return true;
  }

  /** Reset fighters + subsystems for a new round (keeps power gauge — authentic KOF) */
  private resetForNewRound(): void {
    this.p1.reset(STAGE_WIDTH * 0.30);
    this.p2.reset(STAGE_WIDTH * 0.70);
    this.tickRef.value = 0;
    this.p1Cmd.reset();
    this.p2Cmd.reset();
    this.combatSystem.reset();
    this.projectiles.length = 0;
    this.vfx.reset();
    this.cinematic.resetForNewRound();
  }

  /** Full match restart (back to select screen) */
  fullReset(): void {
    this.p1.reset(STAGE_WIDTH * 0.30);
    this.p2.reset(STAGE_WIDTH * 0.70);
    this.p1Wins = 0;
    this.p2Wins = 0;
    this.currentRound = 1;
    this.tickRef.value = 0;
    this.p1Cmd.reset();
    this.p2Cmd.reset();
    this.combatSystem.reset();
    this.projectiles.length = 0;
    this.vfx.reset();
    this.cinematic.reset();
    this.fadeAlpha = 0;
    this.fadeDirection = 0;
    this.fadeCallback = null;
    resetMeterSystem(this.gauges[0], this.maxModes[0]);
    resetMeterSystem(this.gauges[1], this.maxModes[1]);
  }
}
