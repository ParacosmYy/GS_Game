import { GameLoop } from './core/gameLoop.js';
import { InputManager } from './input/inputManager.js';
import { Fighter } from './entities/fighter.js';
import { Renderer } from './rendering/renderer.js';
import {
  STAGE_WIDTH,
  STAGE_GROUND_Y,
  FIGHTER_WIDTH,
  WALK_SPEED,
  GRAVITY,
  JUMP_VELOCITY,
  PUSH_BOX_WIDTH,
  LANDING_RECOVERY,
  MAX_HEALTH,
  KO_DISPLAY_TIME,
  FRAME_DATA,
} from './core/constants.js';
import { FighterState, AttackType, GameState } from './core/types.js';

// ===== Canvas Setup =====
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = 800;
canvas.height = 600;

// ===== Game Objects =====
const p1 = new Fighter(STAGE_WIDTH * 0.33, '#cc2222', 1);
const p2 = new Fighter(STAGE_WIDTH * 0.67, '#2244cc', -1);
const fighters = [p1, p2];

const inputManager = new InputManager();
const renderer = new Renderer(ctx);

// ===== Game State =====
let koState = false;
let koTimer = 0;
let winner: number | null = null;
let tick = 0;

// ===== Expose game state for testing =====
declare global {
  interface Window {
    __gameState: GameState;
    __fighters: Fighter[];
    __restart: () => void;
  }
}

window.__fighters = fighters;
window.__restart = restartGame;

// ===== P1 & P2 direction histories =====
const p1DirHistory: { direction: string; frame: number }[] = [];
const p2DirHistory: { direction: string; frame: number }[] = [];

// ===== Main Update =====
function update(): void {
  if (koState) {
    koTimer++;
    if (koTimer > KO_DISPLAY_TIME) {
      // Allow restart with R key
      if (inputManager.isKeyDown('KeyR')) {
        restartGame();
      }
    }
    return;
  }

  tick++;

  const p1Input = inputManager.getP1Input();
  const p2Input = inputManager.getP2Input();

  // Update facing
  p1.updateFacing(p2);
  p2.updateFacing(p1);

  // Process each fighter
  updateFighter(p1, p1Input, p2);
  updateFighter(p2, p2Input, p1);

  // Pushbox collision (prevent overlap)
  resolvePushbox(p1, p2);

  // Combat resolution
  processCombat();

  // Check KO
  if (p1.health <= 0 || p2.health <= 0) {
    koState = true;
    koTimer = 0;
    if (p1.health <= 0 && p2.health <= 0) {
      winner = null; // Draw
    } else if (p1.health <= 0) {
      winner = 1;
    } else {
      winner = 0;
    }
  }

  // Update game state for testing
  window.__gameState = renderer.getGameState(fighters, tick);
  window.__gameState.ko = koState;
  window.__gameState.winner = winner;
}

function updateFighter(fighter: Fighter, input: ReturnType<typeof inputManager.getP1Input>, opponent: Fighter): void {
  switch (fighter.state) {
    case FighterState.IDLE:
    case FighterState.WALK: {
      fighter.displayHeight = 100; // Reset height

      // Check for block (holding back direction)
      const isBack = fighter.facing === 1 ? input.left : input.right;
      if (isBack && opponent.state === FighterState.STAND_ATTACK || isBack && opponent.state === FighterState.CROUCH_ATTACK || isBack && opponent.state === FighterState.AIR_ATTACK) {
        // Will enter block on hit (handled in combat)
      }

      // Jump
      if (input.up && fighter.isGrounded()) {
        fighter.vy = JUMP_VELOCITY;
        fighter.state = FighterState.JUMP;
        break;
      }

      // Crouch
      if (input.down && fighter.isGrounded()) {
        fighter.state = FighterState.CROUCH;
        fighter.displayHeight = 50;
        break;
      }

      // Throw
      if (input.throwAttack) {
        fighter.startAttack(AttackType.THROW);
        break;
      }

      // Attacks
      if (input.heavyAttack) {
        fighter.startAttack(AttackType.STAND_HEAVY);
        break;
      }
      if (input.lightAttack) {
        fighter.startAttack(AttackType.STAND_LIGHT);
        break;
      }

      // Movement
      if (input.left || input.right) {
        const moveDir = input.right ? 1 : -1;
        fighter.vx = WALK_SPEED * moveDir;
        fighter.state = FighterState.WALK;
      } else {
        fighter.vx = 0;
        fighter.state = FighterState.IDLE;
      }
      break;
    }

    case FighterState.JUMP: {
      // Air attack
      if ((input.lightAttack || input.heavyAttack) && fighter.currentAttack === null) {
        fighter.startAttack(AttackType.AIR_ATTACK);
      }

      // Apply gravity
      fighter.vy += GRAVITY;
      break;
    }

    case FighterState.CROUCH: {
      fighter.displayHeight = 50;

      // Stand up
      if (!input.down) {
        fighter.state = FighterState.IDLE;
        fighter.displayHeight = 100;
        break;
      }

      // Crouch attack
      if (input.lightAttack || input.heavyAttack) {
        fighter.startAttack(AttackType.CROUCH_ATTACK);
        break;
      }

      // Throw
      if (input.throwAttack) {
        fighter.startAttack(AttackType.THROW);
        break;
      }

      fighter.vx = 0;
      break;
    }

    case FighterState.STAND_ATTACK:
    case FighterState.CROUCH_ATTACK:
    case FighterState.AIR_ATTACK:
    case FighterState.THROW: {
      fighter.tickAttack();
      break;
    }

    case FighterState.BLOCK: {
      fighter.blockstunTimer--;
      fighter.vx *= 0.8; // Friction on pushback
      if (fighter.blockstunTimer <= 0) {
        fighter.state = FighterState.IDLE;
        fighter.vx = 0;
      }
      break;
    }

    case FighterState.HITSTUN: {
      fighter.hitstunTimer--;
      fighter.vx *= 0.85; // Friction
      if (fighter.hitstunTimer <= 0) {
        fighter.state = FighterState.IDLE;
        fighter.vx = 0;
      }
      break;
    }

    case FighterState.KNOCKDOWN: {
      fighter.knockdownTimer--;
      fighter.vx *= 0.9;
      if (fighter.knockdownTimer <= 0) {
        fighter.state = FighterState.IDLE;
        fighter.isKnockedDown = false;
        fighter.displayHeight = 100;
        fighter.vx = 0;
      }
      break;
    }
  }

  // Apply physics
  fighter.x += fighter.vx;
  fighter.y += fighter.vy;

  // Ground check
  if (fighter.y >= STAGE_GROUND_Y) {
    if (fighter.state === FighterState.JUMP || fighter.state === FighterState.AIR_ATTACK) {
      // Landing
      if (fighter.state === FighterState.AIR_ATTACK) {
        fighter.endAttack();
      }
      fighter.y = STAGE_GROUND_Y;
      fighter.vy = 0;
      fighter.vx = 0;
      fighter.state = FighterState.IDLE;
      fighter.landingRecovery = LANDING_RECOVERY;
    } else {
      fighter.y = STAGE_GROUND_Y;
      fighter.vy = 0;
    }
  }

  // Stage boundary
  fighter.x = Math.max(FIGHTER_WIDTH / 2, Math.min(fighter.x, STAGE_WIDTH - FIGHTER_WIDTH / 2));
}

function resolvePushbox(a: Fighter, b: Fighter): void {
  const aBox = a.getPushbox();
  const bBox = b.getPushbox();

  const overlapX = Math.min(aBox.x + aBox.width, bBox.x + bBox.width) - Math.max(aBox.x, bBox.x);

  if (overlapX > 0) {
    const push = overlapX / 2 + 0.5;
    if (a.x < b.x) {
      a.x -= push;
      b.x += push;
    } else {
      a.x += push;
      b.x -= push;
    }
  }
}

// ===== Simple AABB check =====
function aabbCheck(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function processCombat(): void {
  resolveAttack(p1, p2);
  resolveAttack(p2, p1);
}

function resolveAttack(attacker: Fighter, defender: Fighter): void {
  const hitbox = attacker.getActiveHitbox();
  if (!hitbox || attacker.hasHit) return;

  const hurtbox = defender.getHurtbox();
  if (!aabbCheck(hitbox, hurtbox)) return;

  const attackData = attacker.currentAttack
    ? { ...FRAME_DATA[attacker.currentAttack] }
    : null;
  if (!attackData) return;

  attacker.hasHit = true;

  // Throw handling
  if (attacker.currentAttack === AttackType.THROW) {
    const dist = Math.abs(attacker.x - defender.x);
    if (dist > 80 || !defender.isGrounded()) {
      return; // Throw misses
    }
    // Throw always hits (unblockable)
    defender.health -= attackData.damage;
    defender.applyKnockdown(30);
    // Move defender behind attacker
    defender.x = attacker.x + attacker.facing * -100;
    return;
  }

  // Block check
  const isHoldingBack = defender.facing === 1
    ? (inputManager.getP1Input().left || inputManager.getP2Input().left)
    : (inputManager.getP1Input().right || inputManager.getP2Input().right);

  if (defender.canBlock() && isHoldingBack) {
    // Check high/low
    const isLowAttack =
      attacker.currentAttack === AttackType.CROUCH_ATTACK;
    const isOverheadAttack =
      attacker.currentAttack === AttackType.AIR_ATTACK;
    const defenderIsCrouching = defender.state === FighterState.CROUCH;

    let blocked = false;
    if (isLowAttack && !defenderIsCrouching) {
      // Low attack beats stand block
      blocked = false;
    } else if (isOverheadAttack && defenderIsCrouching) {
      // Overhead beats crouch block
      blocked = false;
    } else {
      blocked = true;
    }

    if (blocked) {
      defender.applyBlockstun(attackData.blockstun, attackData.pushback);
      return;
    }
  }

  // Hit!
  defender.health -= attackData.damage;
  defender.applyHitstun(attackData.hitstun, attackData.pushback);

  // Prevent health going below 0
  defender.health = Math.max(0, defender.health);
}

function restartGame(): void {
  koState = false;
  koTimer = 0;
  winner = null;
  tick = 0;
  p1.reset(STAGE_WIDTH * 0.33);
  p2.reset(STAGE_WIDTH * 0.67);
}

// ===== Render =====
function render(): void {
  renderer.render(fighters, tick, koState, winner);
}

// ===== Start =====
const gameLoop = new GameLoop(update, render);
gameLoop.start();
console.log('KOF 2002 POC initialized');
