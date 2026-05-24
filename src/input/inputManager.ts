import { PlayerInput } from '../core/types.js';

interface KeyState {
  [key: string]: boolean;
}

export class InputManager {
  private keys: KeyState = {};

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
}
