/**
 * TrainingMode -- 训练模式状态与逻辑
 *
 * 管理训练模式下的假人行为、输入历史、帧数据展示和 HUD 开关。
 * 所有训练模式专用状态都在这里，不污染通用游戏状态。
 */
import { FRAME_DATA, STAGE_WIDTH } from '../core/constants.js';
import type { Fighter } from '../entities/fighter.js';
import type { ResolvedInput } from '../input/inputResolver.js';

// ===== Dummy Behavior =====
export enum DummyBehavior {
  STAND = 'STAND',           // 站立不动，不防御
  BLOCK_ALL = 'BLOCK_ALL',   // 自动防御所有攻击
  BLOCK_LOW = 'BLOCK_LOW',   // 只防御下段
  CROUCH = 'CROUCH',         // 始终蹲下
  JUMP = 'JUMP',             // 反复跳跃
}

const DUMMY_BEHAVIOR_ORDER: DummyBehavior[] = [
  DummyBehavior.STAND,
  DummyBehavior.BLOCK_ALL,
  DummyBehavior.BLOCK_LOW,
  DummyBehavior.CROUCH,
  DummyBehavior.JUMP,
];

const DUMMY_BEHAVIOR_LABELS: Record<DummyBehavior, string> = {
  [DummyBehavior.STAND]: 'STAND',
  [DummyBehavior.BLOCK_ALL]: 'BLOCK ALL',
  [DummyBehavior.BLOCK_LOW]: 'BLOCK LOW',
  [DummyBehavior.CROUCH]: 'CROUCH',
  [DummyBehavior.JUMP]: 'JUMP',
};

// ===== Input History Entry =====
export interface InputHistoryEntry {
  direction: string;     // direction arrow symbol
  buttons: string[];     // button letters pressed this frame
  frame: number;         // game tick when recorded
}

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
    buttonAPressed: false,
    buttonBPressed: false,
    buttonCPressed: false,
    buttonDPressed: false,
    throwAttackPressed: false,
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
        // Auto-block all incoming attacks
        if (p1.attackPhase === 'active' && p2.canBlock()) {
          // Block = hold back relative to opponent
          // If P1 is to the left of P2, P2 needs to hold left (back)
          // "back" in ResolvedInput means away from opponent
          input.back = true;
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
  }
}
