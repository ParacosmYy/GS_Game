/**
 * DM Manager — DM activation, stock consumption, and Super Flash triggering.
 * Extracts canUseDM/useDM/checkMaxActivation + two DM detection loops from main.ts.
 */
import type { Fighter } from '../entities/fighter.js';
import type { PowerGauge, MaxModeState } from '../core/types.js';
import { AttackType } from '../core/types.js';
import { DM_STOCK_COST } from '../core/constants.js';
import { spendStocks, activateMaxMode } from './meter.js';
import type { CinematicState } from '../state/cinematicState.js';
import type { VFXSystem, ScreenShake } from '../rendering/vfx.js';
import type { ResolvedInput } from '../input/inputResolver.js';

/** Dependencies injected from main.ts during wiring (Phase 7) */
export interface DMManagerDeps {
  gauges: [PowerGauge, PowerGauge];
  maxModes: [MaxModeState, MaxModeState];
  cinematic: CinematicState;
  vfx: VFXSystem;
  screenShake: ScreenShake;
  fighters: [Fighter, Fighter];
}

export class DMManager {
  constructor(private deps: DMManagerDeps) {}

  /** Check if player can use DM (has enough stocks) */
  canUseDM(playerIndex: number): boolean {
    return this.deps.gauges[playerIndex].stocks >= DM_STOCK_COST;
  }

  /** Consume DM stocks */
  useDM(playerIndex: number): void {
    spendStocks(this.deps.gauges[playerIndex], DM_STOCK_COST);
  }

  /** Check and trigger Super Flash when a DM starts (replaces two loops in main.ts) */
  checkDMActivation(): void {
    const { fighters, cinematic, gauges, maxModes } = this.deps;
    for (let i = 0; i < 2; i++) {
      const f = fighters[i];
      const atk = f.currentAttack;
      if (!atk || f.attackPhase !== 'startup' || f.attackFrame !== 0) continue;

      if (!this.isDMAttack(atk)) continue;

      // 风云再起: DM usable anytime with ≥1 stock, or free in MAX mode (ends MAX)
      if (maxModes[i].active) {
        // MAX mode: DM is free but ends MAX mode immediately
        maxModes[i].active = false;
        maxModes[i].timer = 0;
        cinematic.triggerSuperFlash(f.x, f.y - f.displayHeight / 2, i);
      } else if (gauges[i].stocks >= DM_STOCK_COST) {
        // Non-MAX: consume 1 stock
        this.useDM(i);
        cinematic.triggerSuperFlash(f.x, f.y - f.displayHeight / 2, i);
      } else {
        f.endAttack(); // Not enough meter → cancel
      }
    }
  }

  /** Check B+C for MAX mode activation */
  checkMaxActivation(input: ResolvedInput, playerIndex: number): void {
    if (input.buttonB && input.buttonC && (input.buttonBPressed || input.buttonCPressed)) {
      const { gauges, maxModes, vfx, screenShake, fighters } = this.deps;
      if (activateMaxMode(gauges[playerIndex], maxModes[playerIndex])) {
        const f = fighters[playerIndex];
        vfx.spawnMAXAura(f.x, f.y);
        vfx.spawnMAXActivationFlash(f.x, f.y - f.displayHeight / 2);
        screenShake.trigger(8, 12);
      }
    }
  }

  /** Whether the given attack type is a DM */
  private isDMAttack(atk: AttackType): boolean {
    return (
      atk === AttackType.DM_OROCHINAGI ||
      atk === AttackType.DM_YATAGARASU ||
      atk === AttackType.DM_POWER_GEYSER ||
      atk === AttackType.DM_PHOENIX_KICK ||
      atk === AttackType.DM_CHAIN_SHOT ||
      atk === AttackType.DM_FREEZE
    );
  }
}
