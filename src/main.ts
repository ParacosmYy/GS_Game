import { GameLoop } from './core/gameLoop.js';
import { InputManager } from './input/inputManager.js';
import { CommandBuffer } from './input/commandBuffer.js';
import { Fighter } from './entities/fighter.js';
import { Projectile } from './entities/projectile.js';
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
  THROW_RANGE,
  THROW_DISTANCE,
} from './core/constants.js';
import { FighterState, AttackType, GameState, DirectionInput, Direction } from './core/types.js';

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
const p1CommandBuffer = new CommandBuffer();
const p2CommandBuffer = new CommandBuffer();
const renderer = new Renderer(ctx);

// Projectiles
const projectiles: Projectile[] = [];

// ===== Game State =====
let koState = false;
let koTimer = 0;
let winner: number | null = null;
let tick = 0;
let debugMode = false;

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

// ===== Input helper =====
interface ResolvedInput {
  up: boolean;
  down: boolean;
  forward: boolean; // relative to facing
  back: boolean;
  lightAttack: boolean;
  heavyAttack: boolean;
  throwAttack: boolean;
}

function resolveInput(
  raw: { up: boolean; down: boolean; left: boolean; right: boolean; lightAttack: boolean; heavyAttack: boolean; throwAttack: boolean },
  facing: Direction,
): ResolvedInput {
  return {
    up: raw.up,
    down: raw.down,
    forward: facing === 1 ? raw.right : raw.left,
    back: facing === 1 ? raw.left : raw.right,
    lightAttack: raw.lightAttack,
    heavyAttack: raw.heavyAttack,
    throwAttack: raw.throwAttack,
  };
}

function getDirectionInput(input: ResolvedInput): DirectionInput {
  if (input.up && input.forward) return 'upforward';
  if (input.up && input.back) return 'upback';
  if (input.down && input.forward) return 'downforward';
  if (input.down && input.back) return 'downback';
  if (input.up) return 'up';
  if (input.down) return 'down';
  if (input.forward) return 'forward';
  if (input.back) return 'back';
  return 'neutral';
}

// ===== Main Update =====
function update(): void {
  if (koState) {
    koTimer++;
    if (koTimer > KO_DISPLAY_TIME) {
      if (inputManager.isKeyDown('KeyR')) {
        restartGame();
      }
    }
    return;
  }

  tick++;

  const rawP1 = inputManager.getP1Input();
  const rawP2 = inputManager.getP2Input();

  // Update facing
  p1.updateFacing(p2);
  p2.updateFacing(p1);

  const p1Input = resolveInput(rawP1, p1.facing);
  const p2Input = resolveInput(rawP2, p2.facing);

  // Record directions for command buffer
  p1CommandBuffer.record(getDirectionInput(p1Input), tick);
  p2CommandBuffer.record(getDirectionInput(p2Input), tick);

  // Process each fighter
  updateFighter(p1, p1Input, p2, p1CommandBuffer);
  updateFighter(p2, p2Input, p1, p2CommandBuffer);

  // Pushbox collision
  resolvePushbox(p1, p2);

  // Update projectiles
  for (const proj of projectiles) {
    proj.update();
  }

  // Combat resolution
  processCombat();

  // Clean up dead projectiles
  for (let i = projectiles.length - 1; i >= 0; i--) {
    if (!projectiles[i].active) {
      projectiles.splice(i, 1);
    }
  }

  // Check KO
  if (p1.health <= 0 || p2.health <= 0) {
    koState = true;
    koTimer = 0;
    if (p1.health <= 0 && p2.health <= 0) {
      winner = null;
    } else if (p1.health <= 0) {
      winner = 1;
    } else {
      winner = 0;
    }
  }

  // Debug toggle
  if (inputManager.isKeyDown('F1')) {
    debugMode = !debugMode;
  }

  // Update game state for testing
  window.__gameState = {
    players: fighters.map((f) => ({
      x: f.x,
      y: f.y,
      health: f.health,
      state: f.state,
      facing: f.facing,
      currentAttack: f.currentAttack,
      attackPhase: f.attackPhase,
      attackFrame: f.attackFrame,
    })),
    tick,
    fps: renderer.getFps(),
    ko: koState,
    winner,
  };
}

function updateFighter(
  fighter: Fighter,
  input: ResolvedInput,
  opponent: Fighter,
  commandBuffer: CommandBuffer,
): void {
  switch (fighter.state) {
    case FighterState.IDLE:
    case FighterState.WALK: {
      fighter.displayHeight = 100;

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
      if (input.throwAttack && fighter.canAct()) {
        fighter.startAttack(AttackType.THROW);
        break;
      }

      // Check for special moves first (priority over normals)
      const attackPressed = input.lightAttack || input.heavyAttack;
      if (attackPressed && fighter.canAct()) {
        const special = commandBuffer.checkSpecial(tick, true);
        if (special === AttackType.SPECIAL_PROJECTILE) {
          fighter.startAttack(AttackType.SPECIAL_PROJECTILE);
          // Spawn projectile at end of startup
          break;
        }
        if (special === AttackType.SPECIAL_UPPER) {
          fighter.startAttack(AttackType.SPECIAL_UPPER);
          break;
        }

        // Normal attacks
        if (input.heavyAttack) {
          fighter.startAttack(AttackType.STAND_HEAVY);
          break;
        }
        if (input.lightAttack) {
          fighter.startAttack(AttackType.STAND_LIGHT);
          break;
        }
      }

      // Movement
      if (input.forward || input.back) {
        const moveDir = input.forward ? fighter.facing : -fighter.facing;
        fighter.vx = WALK_SPEED * (input.forward ? 1 : -1) * fighter.facing;
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
      fighter.vy += GRAVITY;
      break;
    }

    case FighterState.CROUCH: {
      fighter.displayHeight = 50;

      if (!input.down) {
        fighter.state = FighterState.IDLE;
        fighter.displayHeight = 100;
        break;
      }

      // Crouch attack
      if ((input.lightAttack || input.heavyAttack) && fighter.canAct()) {
        fighter.startAttack(AttackType.CROUCH_ATTACK);
        break;
      }

      // Throw
      if (input.throwAttack && fighter.canAct()) {
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
      // Special move handling during active frames
      if (fighter.currentAttack === AttackType.SPECIAL_PROJECTILE && fighter.attackPhase === 'active' && fighter.attackFrame === 0) {
        // Spawn projectile once at start of active phase
        projectiles.push(new Projectile(
          fighter.x + 50 * fighter.facing,
          fighter.y - 50,
          fighter.facing,
          FRAME_DATA.SPECIAL_PROJECTILE.active,
        ));
      }

      if (fighter.currentAttack === AttackType.SPECIAL_UPPER) {
        // Rise during active frames
        if (fighter.attackPhase === 'active') {
          fighter.vy = -6;
        }
      }

      fighter.tickAttack();
      break;
    }

    case FighterState.BLOCK: {
      fighter.blockstunTimer--;
      fighter.vx *= 0.8;
      if (fighter.blockstunTimer <= 0) {
        fighter.state = FighterState.IDLE;
        fighter.vx = 0;
      }
      break;
    }

    case FighterState.HITSTUN: {
      fighter.hitstunTimer--;
      fighter.vx *= 0.85;
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
      if (fighter.currentAttack) fighter.endAttack();
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

// ===== AABB check =====
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
  // Fighter vs Fighter
  resolveAttack(p1, p2);
  resolveAttack(p2, p1);

  // Projectile vs Fighter
  for (const proj of projectiles) {
    const hitbox = proj.getHitbox();
    if (!hitbox) continue;

    // Check against both fighters (skip the owner based on facing)
    for (const defender of fighters) {
      const hurtbox = defender.getHurtbox();
      if (aabbCheck(hitbox, hurtbox)) {
        const attackData = FRAME_DATA.SPECIAL_PROJECTILE;

        // Block check
        const defInput = defender === p1
          ? resolveInput(inputManager.getP1Input(), defender.facing)
          : resolveInput(inputManager.getP2Input(), defender.facing);
        const isHoldingBack = defInput.back;

        if (defender.canBlock() && isHoldingBack) {
          defender.applyBlockstun(attackData.blockstun, attackData.pushback);
        } else {
          defender.health -= attackData.damage;
          defender.health = Math.max(0, defender.health);
          defender.applyHitstun(attackData.hitstun, attackData.pushback);
        }
        proj.active = false;
        break;
      }
    }
  }
}

function resolveAttack(attacker: Fighter, defender: Fighter): void {
  const hitbox = attacker.getActiveHitbox();
  if (!hitbox || attacker.hasHit) return;

  const hurtbox = defender.getHurtbox();
  if (!aabbCheck(hitbox, hurtbox)) return;

  const attackType = attacker.currentAttack;
  if (!attackType) return;
  const attackData = FRAME_DATA[attackType];

  attacker.hasHit = true;

  // Throw handling
  if (attackType === AttackType.THROW) {
    const dist = Math.abs(attacker.x - defender.x);
    if (dist > THROW_RANGE || !defender.isGrounded()) {
      return;
    }
    defender.health -= attackData.damage;
    defender.health = Math.max(0, defender.health);
    defender.applyKnockdown(30);
    defender.x = attacker.x - THROW_DISTANCE * attacker.facing;
    return;
  }

  // Block check
  const defRaw = defender === p1
    ? inputManager.getP1Input()
    : inputManager.getP2Input();
  const defInput = resolveInput(defRaw, defender.facing);
  const isHoldingBack = defInput.back;

  if (defender.canBlock() && isHoldingBack) {
    const isLowAttack = attackType === AttackType.CROUCH_ATTACK;
    const isOverhead = attackType === AttackType.AIR_ATTACK;
    const defenderCrouching = defender.state === FighterState.CROUCH;

    let blocked = true;
    if (isLowAttack && !defenderCrouching) blocked = false;
    if (isOverhead && defenderCrouching) blocked = false;

    if (blocked) {
      defender.applyBlockstun(attackData.blockstun, attackData.pushback);
      return;
    }
  }

  // Hit
  defender.health -= attackData.damage;
  defender.health = Math.max(0, defender.health);
  defender.applyHitstun(attackData.hitstun, attackData.pushback);
}

function restartGame(): void {
  koState = false;
  koTimer = 0;
  winner = null;
  tick = 0;
  p1.reset(STAGE_WIDTH * 0.33);
  p2.reset(STAGE_WIDTH * 0.67);
  p1CommandBuffer.reset();
  p2CommandBuffer.reset();
  projectiles.length = 0;
}

// ===== Render =====
function render(): void {
  renderer.render(fighters, tick, koState, winner);

  // Draw projectiles
  const cameraX = (p1.x + p2.x) / 2 - 400;
  const clampedCameraX = Math.max(0, Math.min(cameraX, STAGE_WIDTH - 800));

  for (const proj of projectiles) {
    if (!proj.active) continue;
    const sx = proj.x - clampedCameraX;
    const sy = proj.y;
    ctx.fillStyle = '#ff8800';
    ctx.beginPath();
    ctx.arc(sx, sy, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Debug overlay
  if (debugMode) {
    drawDebug(clampedCameraX);
  }
}

function drawDebug(cameraX: number): void {
  ctx.save();
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 250, 180);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#0f0';
  ctx.font = '11px monospace';

  let y = 15;
  for (let i = 0; i < fighters.length; i++) {
    const f = fighters[i];
    ctx.fillText(`P${i + 1}: ${f.state} hp=${f.health} x=${Math.round(f.x)} facing=${f.facing}`, 5, y);
    y += 14;
    if (f.currentAttack) {
      ctx.fillText(`  ATK: ${f.currentAttack} ${f.attackPhase} frame=${f.attackFrame}`, 5, y);
      y += 14;
    }

    // Draw hitbox
    const hitbox = f.getActiveHitbox();
    if (hitbox) {
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        hitbox.x - cameraX,
        hitbox.y,
        hitbox.width,
        hitbox.height,
      );
    }

    // Draw hurtbox
    const hurtbox = f.getHurtbox();
    ctx.strokeStyle = 'rgba(0, 100, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      hurtbox.x - cameraX,
      hurtbox.y,
      hurtbox.width,
      hurtbox.height,
    );
  }

  ctx.fillText(`tick: ${tick}  fps: ${renderer.getFps()}`, 5, y);
  y += 14;
  ctx.fillText(`projectiles: ${projectiles.length}`, 5, y);

  ctx.restore();
}

// ===== F1 toggle (debounced) =====
let f1Pressed = false;
window.addEventListener('keydown', (e) => {
  if (e.code === 'F1') {
    e.preventDefault();
    if (!f1Pressed) {
      f1Pressed = true;
      debugMode = !debugMode;
    }
  }
});
window.addEventListener('keyup', (e) => {
  if (e.code === 'F1') f1Pressed = false;
});

// ===== Start =====
const gameLoop = new GameLoop(update, render);
gameLoop.start();
console.log('KOF 2002 POC initialized');
