/**
 * State handler context — shared interface for state handlers
 */
import type { Fighter } from './fighter.js';
import type { Projectile } from './projectile.js';
import type { AttackType } from '../core/types.js';
import type { CommandBuffer } from '../input/commandBuffer.js';
import type { ResolvedInput } from '../input/inputResolver.js';
import type { CharacterDefinition, CharacterStats } from '../characters/types.js';
import type { PowerGauge, MaxModeState } from '../core/types.js';
import type { VFXSystem } from '../rendering/vfx.js';

export interface FighterCtx {
  fighter: Fighter;
  playerIndex: number;
  cmdBuf: CommandBuffer;
  vfx: VFXSystem;
  projectiles: Projectile[];
  tickRef: { value: number };
  opponent: Fighter | null;
  character: CharacterDefinition;
  stats: CharacterStats;
  gauge: PowerGauge | null;
  maxMode: MaxModeState | null;
  rekkaWindow: number;
  counterStanceTimer: number;
  chargeDownFrames: number;
  wasChargingDown: boolean;
  wakeupBuffer: ResolvedInput | null;
  cancelSpecialBuffer: AttackType | null;
  recoveryRollRequested: boolean;
  prevForward: boolean;
  prevBack: boolean;
  prevDown: boolean;
  upHoldFrames: number;
  upWasPressed: boolean;
  lastForwardTick: number;
  lastBackTick: number;
  lastDownTick: number;
}
