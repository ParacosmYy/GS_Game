import { describe, it, expect } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { FighterController } from '../src/entities/fighterController.js';
import { CommandBuffer } from '../src/input/commandBuffer.js';
import { VFXSystem } from '../src/rendering/vfx.js';
import { KyoDef } from '../src/characters/kyo.js';
import { FighterState } from '../src/core/types.js';
import { resolveInput, createPrevAttack, updatePrevAttack, type RawInput } from '../src/input/inputResolver.js';
import { Projectile } from '../src/entities/projectile.js';

function makeRawInput(overrides: Partial<RawInput> = {}): RawInput {
  return {
    up: false,
    down: false,
    left: false,
    right: false,
    buttonA: false,
    buttonB: false,
    buttonC: false,
    buttonD: false,
    throwAttack: false,
    burst: false,
    start: false,
    ...overrides,
  };
}

function makeController() {
  const fighter = new Fighter(300, '#ff0000', 1);
  fighter.setStats(KyoDef.stats);
  const opponent = new Fighter(700, '#0000ff', -1);
  opponent.setStats(KyoDef.stats);
  const cmdBuf = new CommandBuffer();
  const vfx = new VFXSystem();
  const projectiles: Projectile[] = [];
  const tickRef = { value: 0 };
  const ctrl = new FighterController(fighter, 0, cmdBuf, vfx, projectiles, tickRef, KyoDef);
  ctrl.setOpponent(opponent);
  return { fighter, ctrl, tickRef };
}

function step(
  fighter: Fighter,
  ctrl: FighterController,
  tickRef: { value: number },
  prev: ReturnType<typeof createPrevAttack>,
  raw: RawInput,
): void {
  const input = resolveInput(raw, fighter.facing, prev);
  ctrl.update(input);
  updatePrevAttack(prev, raw);
  tickRef.value++;
}

describe('run double tap movement', () => {
  it('keeps RUN briefly after a double-tap forward even if the second tap is released immediately', () => {
    const { fighter, ctrl, tickRef } = makeController();
    const prev = createPrevAttack();

    step(fighter, ctrl, tickRef, prev, makeRawInput({ right: true }));
    expect(fighter.state).toBe(FighterState.WALK);

    step(fighter, ctrl, tickRef, prev, makeRawInput());
    expect(fighter.state).toBe(FighterState.IDLE);

    step(fighter, ctrl, tickRef, prev, makeRawInput({ right: true }));
    expect(fighter.state).toBe(FighterState.RUN);

    step(fighter, ctrl, tickRef, prev, makeRawInput());
    expect(fighter.state).toBe(FighterState.RUN);
  });
});
