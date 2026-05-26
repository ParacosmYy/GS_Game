/**
 * TrainingMode -- 训练模式状态与逻辑
 *
 * 管理训练模式下的假人行为、输入历史、帧数据展示和 HUD 开关。
 * 所有训练模式专用状态都在这里，不污染通用游戏状态。
 */
import { FRAME_DATA, STAGE_WIDTH, STAGE_GROUND_Y, MAX_HEALTH } from '../core/constants.js';
import type { AttackType, PlayerInput } from '../core/types.js';
import { Fighter } from '../entities/fighter.js';
import type { ResolvedInput } from '../input/inputResolver.js';

// ===== Dummy Behavior =====
export enum DummyBehavior {
  STAND = 'STAND',           // 站立不动，不防御
  BLOCK_ALL = 'BLOCK_ALL',   // 自动防御所有攻击
  BLOCK_LOW = 'BLOCK_LOW',   // 只防御下段
  BLOCK_HIGH = 'BLOCK_HIGH', // 只防御上段/中段（站防）
  CROUCH = 'CROUCH',         // 始终蹲下
  JUMP = 'JUMP',             // 反复跳跃
  REVERSAL = 'REVERSAL',     // 防御后自动出升龙
}

const DUMMY_BEHAVIOR_ORDER: DummyBehavior[] = [
  DummyBehavior.STAND,
  DummyBehavior.BLOCK_ALL,
  DummyBehavior.BLOCK_LOW,
  DummyBehavior.BLOCK_HIGH,
  DummyBehavior.CROUCH,
  DummyBehavior.JUMP,
  DummyBehavior.REVERSAL,
];

const DUMMY_BEHAVIOR_LABELS: Record<DummyBehavior, string> = {
  [DummyBehavior.STAND]: 'STAND',
  [DummyBehavior.BLOCK_ALL]: 'BLOCK ALL',
  [DummyBehavior.BLOCK_LOW]: 'BLOCK LOW',
  [DummyBehavior.BLOCK_HIGH]: 'BLOCK HIGH',
  [DummyBehavior.CROUCH]: 'CROUCH',
  [DummyBehavior.JUMP]: 'JUMP',
  [DummyBehavior.REVERSAL]: 'REVERSAL',
};

// ===== Input History Entry =====
export interface InputHistoryEntry {
  direction: string;     // direction arrow symbol
  buttons: string[];     // button letters pressed this frame
  frame: number;         // game tick when recorded
}

// ===== Input Record (for TrainingModeController input history) =====
export interface InputRecord {
  frame: number;
  direction: string;
  buttons: string[];
}

// ===== Move Display (complete frame data for a single move) =====
export interface MoveDisplay {
  name: string;
  startup: number;
  active: number;
  recovery: number;
  hitstun: number;
  blockstun: number;
  damage: number;
  guardType: string;     // 'MID' | 'LOW' | 'HIGH'
  cancelInto: string[];
}

/** Maximum input history buffer size in frames */
const INPUT_HISTORY_BUFFER_SIZE = 60;

// ===== Frame Data Display =====
export interface FrameDataDisplay {
  attackName: string;
  startup: number;
  active: number;
  recovery: number;
  damage: number;
  hitstun: number;
  blockstun: number;
  advantageHit: number;    // = hitstun - totalFrames
  advantageBlock: number;  // = blockstun - totalFrames
  currentFrame: number;    // current frame in the attack animation
  phase: string;           // 'startup' | 'active' | 'recovery'
}

// ===== Training Mode Controller =====
export type DummyBehaviorConfig =
  | 'stand'
  | 'crouch'
  | 'jump'
  | 'block_all'
  | 'block_high'
  | 'block_low'
  | 'reversal'
  | 'random'
  | 'playback';

export interface TrainingModeConfig {
  dummyBehavior: DummyBehaviorConfig;
  showHitboxes: boolean;
  showFrameData: boolean;
  infiniteTime: boolean;
  infiniteHealth: boolean;
  frameAdvance: boolean;
  inputDisplay: boolean;
}

export interface FrameDataInfo {
  startup: number;
  active: number;
  recovery: number;
  advantage: number;
  cancelOptions: string[];
  damage: number;
  stun: number;
}

const DUMMY_BEHAVIOR_CONFIG_ORDER: DummyBehaviorConfig[] = [
  'stand',
  'block_all',
  'block_high',
  'block_low',
  'crouch',
  'jump',
  'reversal',
  'random',
  'playback',
];

export class TrainingModeController {
  config: TrainingModeConfig;

  /** Input history buffer for the last 60 frames */
  private _inputHistory: InputRecord[] = [];

  /** Reversal state: tracks if dummy is waiting to reversal after blockstun */
  private _reversalPending = false;

  constructor() {
    this.config = {
      dummyBehavior: 'stand',
      showHitboxes: false,
      showFrameData: false,
      infiniteTime: true,
      infiniteHealth: true,
      frameAdvance: false,
      inputDisplay: true,
    };
  }

  /** Reset round state: restore health and positions for both fighters */
  resetRound(p1: Fighter, p2: Fighter): void {
    p1.reset(STAGE_WIDTH * 0.33);
    p2.reset(STAGE_WIDTH * 0.67);
  }

  /** Apply dummy behavior: modify the dummy fighter state based on config */
  applyDummyBehavior(dummy: Fighter): void {
    switch (this.config.dummyBehavior) {
      case 'stand':
        // Stand idle: no forced state change
        break;
      case 'crouch':
        // Force crouch state if not in hitstun/knockdown/attack
        if (dummy.canAct()) {
          dummy.state = 'CROUCH' as any;
        }
        break;
      case 'block_all':
      case 'block_high':
      case 'block_low':
        // Blocking behavior is handled via getDummyInput, not forced state
        break;
      case 'jump':
        // Jump behavior is handled via getDummyInput tick, not forced state
        break;
      case 'reversal':
        // Reversal handled via getDummyInput and _reversalPending state
        break;
      case 'random':
        // Random behavior handled via getDummyInput
        break;
      case 'playback':
        // Playback handled externally
        break;
    }
  }

  /**
   * Calculate frame advantage for a given attack type and hit type.
   * Pure data-driven calculation from FRAME_DATA.
   *
   * Frame advantage = hitstun/blockstun - (totalAttackFrames - 1)
   * Positive = attacker advantage, negative = defender advantage.
   */
  calculateFrameAdvantage(attackType: AttackType, hitType: 'hit' | 'block'): number {
    const fd = FRAME_DATA[attackType as keyof typeof FRAME_DATA];
    if (!fd) return 0;

    const totalFrames = fd.startup + fd.active + fd.recovery;
    // KOF convention: advantage = stun - (total - 1) because frame 0 of recovery is shared
    if (hitType === 'hit') {
      return fd.hitstun - (totalFrames - 1);
    } else {
      return fd.blockstun - (totalFrames - 1);
    }
  }

  /**
   * Get complete move display information for a given attack type.
   * Returns null if the attack type has no frame data.
   */
  getCurrentMoveDisplay(attackType: AttackType | null): MoveDisplay | null {
    if (!attackType) return null;

    const fd = FRAME_DATA[attackType as keyof typeof FRAME_DATA];
    if (!fd) return null;

    return {
      name: attackType as string,
      startup: fd.startup,
      active: fd.active,
      recovery: fd.recovery,
      hitstun: fd.hitstun,
      blockstun: fd.blockstun,
      damage: fd.damage,
      guardType: fd.hitLevel,
      cancelInto: this._getCancelOptions(attackType as string),
    };
  }

  /**
   * Record a PlayerInput into the input history buffer.
   * Keeps only the last 60 frames of input.
   */
  recordInput(input: PlayerInput, frame: number): void {
    // Convert PlayerInput to direction string
    const direction = this._directionToString(input);
    // Collect pressed buttons
    const buttons: string[] = [];
    if (input.buttonA) buttons.push('A');
    if (input.buttonB) buttons.push('B');
    if (input.buttonC) buttons.push('C');
    if (input.buttonD) buttons.push('D');
    if (input.throwAttack) buttons.push('CD');

    this._inputHistory.push({ frame, direction, buttons });

    // Cap at INPUT_HISTORY_BUFFER_SIZE
    while (this._inputHistory.length > INPUT_HISTORY_BUFFER_SIZE) {
      this._inputHistory.shift();
    }
  }

  /**
   * Get the input history (last 60 frames).
   */
  getInputHistory(): InputRecord[] {
    return this._inputHistory;
  }

  /**
   * Set the dummy behavior config.
   */
  setDummyBehavior(behavior: DummyBehaviorConfig): void {
    this.config.dummyBehavior = behavior;
    this._reversalPending = false;
  }

  /**
   * Convert PlayerInput to a direction string (numpad notation style).
   */
  private _directionToString(input: PlayerInput): string {
    const u = input.up;
    const d = input.down;
    const l = input.left;
    const r = input.right;
    if (u && !d && !l && !r) return '8';
    if (u && !d && r && !l) return '9';
    if (!u && !d && r && !l) return '6';
    if (!u && d && r && !l) return '3';
    if (!u && d && !l && !r) return '2';
    if (!u && d && l && !r) return '1';
    if (!u && !d && l && !r) return '4';
    if (u && !d && l && !r) return '7';
    return '5';
  }

  /** Calculate frame advantage from live fighter states (attacker's perspective) */
  calculateFrameAdvantageFromFighters(attacker: Fighter, defender: Fighter): number {
    if (!attacker.currentAttack && attacker.attackPhase === 'none') {
      // Use last recorded attack data if available
      return 0;
    }
    const attackId = attacker.currentAttack as string;
    const fd = FRAME_DATA[attackId as keyof typeof FRAME_DATA];
    if (!fd) return 0;

    const totalFrames = fd.startup + fd.active + fd.recovery;
    // On hit: advantage = defender hitstun - attacker total frames
    // On block: advantage = defender blockstun - attacker total frames
    const defenderStun = defender.blockstunTimer > 0 ? defender.blockstunTimer : defender.hitstunTimer;
    return defenderStun - totalFrames;
  }

  /** Get frame data display for a specific attack */
  getFrameDataDisplay(attackType: AttackType): FrameDataInfo {
    const fd = FRAME_DATA[attackType as keyof typeof FRAME_DATA];
    if (!fd) {
      return {
        startup: 0,
        active: 0,
        recovery: 0,
        advantage: 0,
        cancelOptions: [],
        damage: 0,
        stun: 0,
      };
    }

    const totalFrames = fd.startup + fd.active + fd.recovery;
    const advantageOnHit = fd.hitstun - totalFrames;
    const cancelOpts = this._getCancelOptions(attackType as string);

    return {
      startup: fd.startup,
      active: fd.active,
      recovery: fd.recovery,
      advantage: advantageOnHit,
      cancelOptions: cancelOpts,
      damage: fd.damage,
      stun: fd.hitstun,
    };
  }

  /** Toggle hitbox display */
  toggleHitboxes(): void {
    this.config.showHitboxes = !this.config.showHitboxes;
  }

  /** Toggle frame data display */
  toggleFrameData(): void {
    this.config.showFrameData = !this.config.showFrameData;
  }

  /** Toggle infinite time */
  toggleInfiniteTime(): void {
    this.config.infiniteTime = !this.config.infiniteTime;
  }

  /** Toggle infinite health */
  toggleInfiniteHealth(): void {
    this.config.infiniteHealth = !this.config.infiniteHealth;
  }

  /** Cycle dummy behavior to next option */
  cycleDummyBehavior(): void {
    const idx = DUMMY_BEHAVIOR_CONFIG_ORDER.indexOf(this.config.dummyBehavior);
    this.config.dummyBehavior =
      DUMMY_BEHAVIOR_CONFIG_ORDER[(idx + 1) % DUMMY_BEHAVIOR_CONFIG_ORDER.length];
  }

  /** Determine cancel options for an attack type */
  private _getCancelOptions(attackId: string): string[] {
    const options: string[] = [];
    if (attackId.startsWith('CLOSE_') || attackId.startsWith('STAND_') || attackId.startsWith('CROUCH_')) {
      if (attackId.endsWith('_A') || attackId.endsWith('_B')) {
        options.push('rapid');
      }
      options.push('special');
      options.push('super');
    }
    return options;
  }
}

/** Create an empty ResolvedInput with all fields false */
function createEmptyResolvedInput(): ResolvedInput {
  return {
    up: false,
    down: false,
    forward: false,
    back: false,
    buttonA: false,
    buttonB: false,
    buttonC: false,
    buttonD: false,
    throwAttack: false,
    burst: false,
    buttonAPressed: false,
    buttonBPressed: false,
    buttonCPressed: false,
    buttonDPressed: false,
    throwAttackPressed: false,
    burstPressed: false,
    punchPressed: false,
    kickPressed: false,
    rollPressed: false,
    blowbackPressed: false,
    punchJustReleased: false,
    kickJustReleased: false,
    startPressed: false,
  };
}

// ===== Training Mode State =====
export class TrainingModeState {
  // Dummy
  dummyBehavior: DummyBehavior = DummyBehavior.STAND;

  // HUD toggles
  showInputHistory = true;
  showFrameData = true;

  // Input history (last 20 entries)
  inputHistory: InputHistoryEntry[] = [];

  // Frame data of last completed or active attack
  lastFrameData: FrameDataDisplay | null = null;

  // Keyboard debounce for F-keys
  private fKeyDebounce: Record<string, boolean> = {};

  // Reversal state for REVERSAL dummy behavior
  private _reversalPending = false;

  /**
   * Cycle dummy behavior to next option.
   */
  cycleDummyBehavior(): void {
    const idx = DUMMY_BEHAVIOR_ORDER.indexOf(this.dummyBehavior);
    this.dummyBehavior = DUMMY_BEHAVIOR_ORDER[(idx + 1) % DUMMY_BEHAVIOR_ORDER.length];
  }

  /**
   * Get human-readable label for current dummy behavior.
   */
  getDummyBehaviorLabel(): string {
    return DUMMY_BEHAVIOR_LABELS[this.dummyBehavior];
  }

  /**
   * Record P1 input into history buffer.
   */
  recordInput(direction: string, buttons: string[], frame: number): void {
    // Only record if there is meaningful input (not neutral + no buttons)
    if (direction === '·' && buttons.length === 0) return;

    this.inputHistory.push({ direction, buttons, frame });

    // Keep last 20 entries
    if (this.inputHistory.length > 20) {
      this.inputHistory.shift();
    }
  }

  /**
   * Update frame data display from P1 fighter.
   */
  updateFrameData(p1: Fighter, _tick: number): void {
    if (p1.currentAttack) {
      const attackId = p1.currentAttack as string;
      const fd = FRAME_DATA[attackId as keyof typeof FRAME_DATA];
      if (fd) {
        const totalFrames = fd.startup + fd.active + fd.recovery;
        const advBlock = fd.blockstun - totalFrames;
        const advHit = fd.hitstun - totalFrames;

        this.lastFrameData = {
          attackName: attackId,
          startup: fd.startup,
          active: fd.active,
          recovery: fd.recovery,
          damage: fd.damage,
          hitstun: fd.hitstun,
          blockstun: fd.blockstun,
          advantageHit: advHit,
          advantageBlock: advBlock,
          currentFrame: p1.attackFrame,
          phase: p1.attackPhase,
        };
      }
    }
  }

  /**
   * Generate dummy input based on current behavior setting.
   * Returns a ResolvedInput compatible with FighterController.update().
   * The p2Facing parameter indicates P2's facing direction (1=right, -1=left).
   */
  getDummyInput(
    p1: Fighter,
    p2: Fighter,
    tick: number,
    p2Facing: number,
  ): ResolvedInput {
    const input = createEmptyResolvedInput();

    switch (this.dummyBehavior) {
      case DummyBehavior.STAND:
        // Stand still, no blocking, no actions
        break;

      case DummyBehavior.BLOCK_ALL:
        // Auto-block all incoming attacks (stand block for MID/HIGH, crouch block for LOW)
        if (p1.attackPhase === 'active' && p2.canBlock()) {
          const fd = p1.currentAttack
            ? FRAME_DATA[p1.currentAttack as keyof typeof FRAME_DATA]
            : null;
          if (fd && fd.hitLevel === 'LOW') {
            input.down = true;
            input.back = true;
          } else {
            input.back = true;
          }
        }
        break;

      case DummyBehavior.BLOCK_LOW:
        // Only block low attacks (crouch + hold back)
        if (p1.attackPhase === 'active' && p2.canBlock()) {
          const fd = p1.currentAttack
            ? FRAME_DATA[p1.currentAttack as keyof typeof FRAME_DATA]
            : null;
          if (fd && fd.hitLevel === 'LOW') {
            input.down = true;
            input.back = true;
          }
        }
        break;

      case DummyBehavior.BLOCK_HIGH:
        // Only block mid/high attacks (stand + hold back)
        if (p1.attackPhase === 'active' && p2.canBlock()) {
          const fd = p1.currentAttack
            ? FRAME_DATA[p1.currentAttack as keyof typeof FRAME_DATA]
            : null;
          if (fd && fd.hitLevel !== 'LOW') {
            input.back = true;
          }
        }
        break;

      case DummyBehavior.CROUCH:
        // Always crouch
        input.down = true;
        break;

      case DummyBehavior.JUMP:
        // Repeatedly jump: jump every 60 frames if grounded
        if (p2.isGrounded() && tick % 60 < 2) {
          input.up = true;
        }
        break;

      case DummyBehavior.REVERSAL:
        // Block first hit, then input DP after blockstun ends
        if (p1.attackPhase === 'active' && p2.canBlock()) {
          const fd = p1.currentAttack
            ? FRAME_DATA[p1.currentAttack as keyof typeof FRAME_DATA]
            : null;
          if (fd && fd.hitLevel === 'LOW') {
            input.down = true;
            input.back = true;
          } else {
            input.back = true;
          }
          this._reversalPending = true;
        }
        // After blockstun ends and reversal is pending, input DP motion
        if (this._reversalPending && p2.blockstunTimer <= 0 && p2.canAct()) {
          // DP motion: →↓↘ + P (forward, down-forward, down + punch)
          input.forward = true;
          input.down = true;
          input.buttonC = true;
          this._reversalPending = false;
        }
        break;
    }

    return input;
  }

  /**
   * Handle training mode keyboard shortcuts.
   * Returns true if a shortcut was consumed (to prevent default).
   */
  handleKeyShortcuts(
    code: string,
    isDown: boolean,
    p1: Fighter,
    p2: Fighter,
  ): boolean {
    if (!isDown) {
      this.fKeyDebounce[code] = false;
      return false;
    }
    if (this.fKeyDebounce[code]) return false;

    switch (code) {
      case 'F1':
        this.fKeyDebounce[code] = true;
        this.cycleDummyBehavior();
        return true;

      case 'F2':
        this.fKeyDebounce[code] = true;
        // Reset positions to center
        p1.x = STAGE_WIDTH * 0.33;
        p2.x = STAGE_WIDTH * 0.67;
        p1.vx = 0;
        p2.vx = 0;
        p1.vy = 0;
        p2.vy = 0;
        return true;

      case 'F3':
        this.fKeyDebounce[code] = true;
        this.showInputHistory = !this.showInputHistory;
        return true;

      case 'F4':
        this.fKeyDebounce[code] = true;
        this.showFrameData = !this.showFrameData;
        return true;

      default:
        return false;
    }
  }

  /**
   * Reset training mode state (on entering training).
   */
  reset(): void {
    this.dummyBehavior = DummyBehavior.STAND;
    this.showInputHistory = true;
    this.showFrameData = true;
    this.inputHistory = [];
    this.lastFrameData = null;
    this.fKeyDebounce = {};
    this._reversalPending = false;
  }
}
