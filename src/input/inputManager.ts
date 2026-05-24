import { PlayerInput, DirectionInput, Direction } from '../core/types.js';

interface KeyState {
  [key: string]: boolean;
}

interface DirectionRecord {
  direction: DirectionInput;
  frame: number;
}

export class InputManager {
  private keys: KeyState = {};
  private directionHistory: DirectionRecord[] = [];

  // P1: WASD + JKL
  // P2: Arrow keys + 456 (number row)
  private static readonly P1_MAP = {
    up: 'KeyW',
    down: 'KeyS',
    left: 'KeyA',
    right: 'KeyD',
    lightAttack: 'KeyJ',
    heavyAttack: 'KeyK',
    throwAttack: 'KeyL',
  };

  private static readonly P2_MAP = {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
    lightAttack: 'Digit4',
    heavyAttack: 'Digit5',
    throwAttack: 'Digit6',
  };

  constructor() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      // Prevent default for game keys to stop scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Reset all keys when window loses focus (prevents stuck keys)
    window.addEventListener('blur', () => {
      this.keys = {};
    });
  }

  getP1Input(): PlayerInput {
    return this.mapInput(InputManager.P1_MAP);
  }

  getP2Input(): PlayerInput {
    return this.mapInput(InputManager.P2_MAP);
  }

  /** Record direction for a player (called each logic frame) */
  recordDirection(facing: Direction, input: PlayerInput, frame: number): void {
    const dir = this.resolveDirection(facing, input);
    this.directionHistory.push({ direction: dir, frame });
    // Keep only last COMMAND_WINDOW + 5 frames of history
    if (this.directionHistory.length > 30) {
      this.directionHistory = this.directionHistory.slice(-20);
    }
  }

  getDirectionHistory(): DirectionRecord[] {
    return this.directionHistory;
  }

  clearDirectionHistory(): void {
    this.directionHistory = [];
  }

  isKeyDown(code: string): boolean {
    return this.keys[code] === true;
  }

  private mapInput(keyMap: Record<string, string>): PlayerInput {
    return {
      up: this.keys[keyMap.up] === true,
      down: this.keys[keyMap.down] === true,
      left: this.keys[keyMap.left] === true,
      right: this.keys[keyMap.right] === true,
      lightAttack: this.keys[keyMap.lightAttack] === true,
      heavyAttack: this.keys[keyMap.heavyAttack] === true,
      throwAttack: this.keys[keyMap.throwAttack] === true,
    };
  }

  private resolveDirection(facing: Direction, input: PlayerInput): DirectionInput {
    const rawForward = facing === 1 ? input.right : input.left;
    const rawBack = facing === 1 ? input.left : input.right;

    if (input.up && rawForward) return 'upforward';
    if (input.up && rawBack) return 'upback';
    if (input.down && rawForward) return 'downforward';
    if (input.down && rawBack) return 'downback';
    if (input.up) return 'up';
    if (input.down) return 'down';
    if (rawForward) return 'forward';
    if (rawBack) return 'back';
    return 'neutral';
  }
}
