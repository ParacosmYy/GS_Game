import { PlayerInput } from '../core/types.js';

interface KeyState {
  [key: string]: boolean;
}

export class InputManager {
  private keys: KeyState = {};

  // P1: WASD + J(A) K(B) U(C) I(D) L(投)
  // P2: Arrows + Numpad1(A) 2(B) 3(C) 0(D) Decimal(投)
  private static readonly P1_MAP = {
    up: 'KeyW',
    down: 'KeyS',
    left: 'KeyA',
    right: 'KeyD',
    buttonA: 'KeyJ',
    buttonB: 'KeyK',
    buttonC: 'KeyU',
    buttonD: 'KeyI',
    throwAttack: 'KeyL',
    start: 'KeyP',
  };

  private static readonly P2_MAP = {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
    buttonA: 'Numpad1',
    buttonB: 'Numpad2',
    buttonC: 'Numpad3',
    buttonD: 'Numpad0',
    throwAttack: 'NumpadDecimal',
    start: 'NumpadEnter',
  };

  constructor() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

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
      buttonA: this.keys[keyMap.buttonA] === true,
      buttonB: this.keys[keyMap.buttonB] === true,
      buttonC: this.keys[keyMap.buttonC] === true,
      buttonD: this.keys[keyMap.buttonD] === true,
      throwAttack: this.keys[keyMap.throwAttack] === true,
      start: this.keys[keyMap.start] === true,
    };
  }
}
