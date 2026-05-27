/**
 * DM Manager — DM activation, stock consumption, and Super Flash triggering.
 * Extracts canUseDM/useDM/checkMaxActivation + two DM detection loops from main.ts.
 */
import type { Fighter } from '../entities/fighter.js';
import type { PowerGauge, MaxModeState } from '../core/types.js';
import { AttackType } from '../core/types.js';
import { DM_STOCK_COST, DESPERATION_HEALTH_THRESHOLD, FREE_CANCEL_TIMER_COST } from '../core/constants.js';
import { spendStocks, activateMaxMode, isDesperation, drainMaxModeTimer } from './meter.js';
import type { CinematicState } from '../state/cinematicState.js';
import type { VFXSystem, ScreenShake } from '../rendering/vfx.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import { MOVE_NAME_MAP } from './hitCallback.js';

/** Format attack ID to display-friendly move name (Chinese from MOVE_NAME_MAP) */
function formatMoveName(atk: string): string {
  const cn = MOVE_NAME_MAP[atk as AttackType];
  if (cn) return cn;
  return atk
    .replace(/^(DM_|SDM_|HSDM_)/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// DM -> SDM upgrade mapping (all 29 characters)
// DM -> HSDM upgrade mapping (MAX + desperation)
const DM_TO_HSDM: Partial<Record<AttackType, AttackType>> = {
  [AttackType.DM_RYUKO_RANBU]: AttackType.HSDM_RYUKO_RANBU,
};

const DM_TO_SDM: Partial<Record<AttackType, AttackType>> = {
  // Kyo
  [AttackType.DM_OROCHINAGI]: AttackType.SDM_OROCHINAGI,
  // Iori
  [AttackType.DM_YATAGARASU]: AttackType.SDM_YATAGARASU,
  // Terry
  [AttackType.DM_POWER_GEYSER]: AttackType.SDM_POWER_GEYSER,
  // Kim
  [AttackType.DM_PHOENIX_KICK]: AttackType.SDM_PHOENIX_KICK,
  // Ryo
  [AttackType.DM_TEN_HA_OU]: AttackType.SDM_TEN_HA_OU,
  [AttackType.DM_RYUKO_RANBU]: AttackType.SDM_RYUKO_RANBU,
  // Leona
  [AttackType.DM_V_SLASHER]: AttackType.SDM_V_SLASHER,
  // K'
  [AttackType.DM_CHAIN_SHOT]: AttackType.SDM_CHAIN_SHOT,
  // Kula
  [AttackType.DM_FREEZE]: AttackType.SDM_FREEZE,
  // Robert
  [AttackType.DM_RYU_KO_RYU]: AttackType.SDM_RYU_KO_RYU,
  [AttackType.DM_HAOU_SHOKOU]: AttackType.SDM_HAOU_SHOKOU,
  // Mai
  [AttackType.DM_HAKA_OTOSHI]: AttackType.SDM_HAKA_OTOSHI,
  // Athena
  [AttackType.DM_SHINING_CRYSTAL_BIT]: AttackType.SDM_SHINING_CRYSTAL_BIT,
  // Clark
  [AttackType.DM_ARGENTINE_DM]: AttackType.SDM_ARGENTINE_DM,
  // Ralf
  [AttackType.DM_GALACTICA_PHANTOM]: AttackType.SDM_GALACTICA_PHANTOM,
  // Joe
  [AttackType.DM_SCREW_UPPER]: AttackType.SDM_SCREW_UPPER,
  // Andy
  [AttackType.DM_CHO_REPPA_DAN]: AttackType.SDM_CHO_REPPA_DAN,
  // Billy
  [AttackType.DM_KAEN_SENPU_JIN]: AttackType.SDM_KAEN_SENPU_JIN,
  // Chang
  [AttackType.DM_TEKKYUU_DAI_BOUSOU]: AttackType.SDM_TEKKYUU_DAI_BOUSOU,
  // Choi
  [AttackType.DM_SHIN_CHOU_HOUYOKU]: AttackType.SDM_SHIN_CHOU_HOUYOKU,
  // Mature
  [AttackType.DM_NOCTURNAL_LIGHT]: AttackType.SDM_NOCTURNAL_LIGHT,
  // Vice
  [AttackType.DM_NEGATIVE_GAIN]: AttackType.SDM_NEGATIVE_GAIN,
  // Yashiro
  [AttackType.DM_ARMAGEDDON_BUSTERS]: AttackType.SDM_ARMAGEDDON_BUSTERS,
  // Chris
  [AttackType.DM_CHAIN_SLIDE_TOUCH]: AttackType.SDM_CHAIN_SLIDE_TOUCH,
  // Shermie
  [AttackType.DM_SHERMIE_CARNIVAL]: AttackType.SDM_SHERMIE_CARNIVAL,
  // Mary
  [AttackType.DM_MARY_TYPHOON]: AttackType.SDM_MARY_TYPHOON,
  // Xiangfei
  [AttackType.DM_CHO_KA_RINGA]: AttackType.SDM_CHO_KA_RINGA,
  // Yamazaki
  [AttackType.DM_GUILLOTINE]: AttackType.SDM_GUILLOTINE,
  // Kasumi
  [AttackType.DM_CHO_MUKIGENZAN]: AttackType.SDM_CHO_MUKIGENZAN,
};

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

      if (!this.isDMAttack(atk) && !this.isSDMAttack(atk) && !this.isHSDMAttack(atk)) continue;

      if (this.isHSDMAttack(atk)) {
        // HSDM: longest flash, most dramatic
        drainMaxModeTimer(maxModes[i], FREE_CANCEL_TIMER_COST);
        cinematic.triggerSuperFlash(f.x, f.y - f.displayHeight / 2, i, 32, 'HSDM', formatMoveName(atk));
      } else if (this.isSDMAttack(atk)) {
        const inDesperation = isDesperation(f.health, f.maxHealth);
        if (maxModes[i].active) {
          drainMaxModeTimer(maxModes[i], FREE_CANCEL_TIMER_COST);
          cinematic.triggerSuperFlash(f.x, f.y - f.displayHeight / 2, i, 28, 'SDM', formatMoveName(atk));
          continue;
        }
        if (!inDesperation || gauges[i].stocks < 2) {
          f.endAttack(); // Not in MAX/desperation or not enough stocks -> cancel
          continue;
        }
        spendStocks(gauges[i], 2);
        cinematic.triggerSuperFlash(f.x, f.y - f.displayHeight / 2, i, 28, 'SDM', formatMoveName(atk));
      } else if (maxModes[i].active) {
        const inDesperation = isDesperation(f.health, f.maxHealth);
        // MAX + desperation: upgrade DM to HSDM (hidden super)
        if (inDesperation && DM_TO_HSDM[atk]) {
          f.currentAttack = DM_TO_HSDM[atk]!;
          drainMaxModeTimer(maxModes[i], FREE_CANCEL_TIMER_COST);
          cinematic.triggerSuperFlash(f.x, f.y - f.displayHeight / 2, i, 32, 'HSDM', formatMoveName(atk));
        } else if (DM_TO_SDM[atk]) {
          // MAX mode: upgrade DM to SDM and consume MAX timer, not stocks
          f.currentAttack = DM_TO_SDM[atk]!;
          drainMaxModeTimer(maxModes[i], FREE_CANCEL_TIMER_COST);
          cinematic.triggerSuperFlash(f.x, f.y - f.displayHeight / 2, i, 28, 'SDM', formatMoveName(atk));
        }
      } else {
        // Desperation mode: upgrade DM to SDM (costs 2 stocks instead of 1)
        const inDesperation = isDesperation(f.health, f.maxHealth);
        if (inDesperation && gauges[i].stocks >= 2 && DM_TO_SDM[atk]) {
          f.currentAttack = DM_TO_SDM[atk]!;
          spendStocks(gauges[i], 2);
          cinematic.triggerSuperFlash(f.x, f.y - f.displayHeight / 2, i, 28, 'SDM', formatMoveName(atk));
        } else if (gauges[i].stocks >= DM_STOCK_COST) {
          // Non-MAX, non-desperation: consume 1 stock for DM
          this.useDM(i);
          cinematic.triggerSuperFlash(f.x, f.y - f.displayHeight / 2, i, 24, 'DM', formatMoveName(atk));
        } else {
          f.endAttack(); // Not enough meter -> cancel
        }
      }
    }
  }

  /** Check B+C for MAX mode activation */
  checkMaxActivation(input: ResolvedInput, playerIndex: number): void {
    const comboTriggered = input.buttonB && input.buttonC && (input.buttonBPressed || input.buttonCPressed);
    if (input.burstPressed || comboTriggered) {
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
    return (atk as string).startsWith('DM_');
  }

  /** Whether the given attack type is an SDM */
  private isSDMAttack(atk: AttackType): boolean {
    return (atk as string).startsWith('SDM_');
  }

  /** Whether the given attack type is an HSDM (hidden super) */
  isHSDMAttack(atk: AttackType): boolean {
    return (atk as string).startsWith('HSDM_');
  }

  /**
   * Check if HSDM activation conditions are met:
   * KOF2002: health < 25% + MAX mode active + specific DM input
   */
  canUseHSDM(playerIndex: number): boolean {
    const f = this.deps.fighters[playerIndex];
    const mm = this.deps.maxModes[playerIndex];
    return mm.active && isDesperation(f.health, f.maxHealth);
  }
}
