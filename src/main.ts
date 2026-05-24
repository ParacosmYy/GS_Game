import { GameLoop, Camera } from './core/index.js';
import { InputManager, CommandBuffer, resolveInput, getDirectionInput } from './input/index.js';
import type { ResolvedInput, PrevAttack } from './input/index.js';
import { Fighter } from './entities/fighter.js';
import { Projectile } from './entities/projectile.js';
import { CombatSystem } from './combat/combatSystem.js';
import { Renderer } from './rendering/renderer.js';
import {
  STAGE_WIDTH, STAGE_GROUND_Y, FIGHTER_WIDTH,
  WALK_SPEED, GRAVITY, JUMP_VELOCITY,
  MAX_HEALTH, KO_DISPLAY_TIME, FRAME_DATA,
  LANDING_RECOVERY,
} from './core/constants.js';
import { FighterState, AttackType, GameState } from './core/types.js';

// ===== Canvas =====
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = 800;
canvas.height = 600;

// ===== Core Systems =====
const camera = new Camera();
const inputManager = new InputManager();
const combatSystem = new CombatSystem(inputManager);
const renderer = new Renderer(ctx);
const p1Cmd = new CommandBuffer();
const p2Cmd = new CommandBuffer();

// ===== Entities =====
const p1 = new Fighter(STAGE_WIDTH * 0.33, '#cc2222', 1);
const p2 = new Fighter(STAGE_WIDTH * 0.67, '#2244cc', -1);
const projectiles: Projectile[] = [];

// ===== State =====
let koState = false;
let koTimer = 0;
let winner: number | null = null;
let tick = 0;
let debugMode = false;

// ===== Window API =====
declare global {
  interface Window {
    __gameState: GameState;
    __fighters: Fighter[];
    __restart: () => void;
  }
}
window.__fighters = [p1, p2];
window.__restart = restartGame;

// ===== Fighter Controller (handles movement/state per fighter) =====
function controlFighter(fighter: Fighter, input: ResolvedInput, cmdBuf: CommandBuffer): void {
  switch (fighter.state) {
    case FighterState.IDLE:
    case FighterState.WALK: {
      fighter.displayHeight = 100;
      fighter.vx = 0;

      if (input.up && fighter.isGrounded()) {
        fighter.vy = JUMP_VELOCITY;
        fighter.state = FighterState.JUMP;
        return;
      }
      if (input.down && fighter.isGrounded()) {
        fighter.state = FighterState.CROUCH;
        fighter.displayHeight = 50;
        return;
      }
      if (input.throwAttackPressed && fighter.canAct()) {
        fighter.startAttack(AttackType.THROW);
        return;
      }

      const atkJustPressed = input.lightAttackPressed || input.heavyAttackPressed;
      if (atkJustPressed && fighter.canAct()) {
        const special = cmdBuf.checkSpecial(tick, true);
        if (special === AttackType.SPECIAL_PROJECTILE) { fighter.startAttack(special); return; }
        if (special === AttackType.SPECIAL_UPPER) { fighter.startAttack(special); return; }
        if (input.heavyAttackPressed) { fighter.startAttack(AttackType.STAND_HEAVY); return; }
        if (input.lightAttackPressed) { fighter.startAttack(AttackType.STAND_LIGHT); return; }
      }

      if (input.forward) {
        fighter.vx = WALK_SPEED * fighter.facing;
        fighter.state = FighterState.WALK;
      } else if (input.back) {
        fighter.vx = -WALK_SPEED * fighter.facing;
        fighter.state = FighterState.WALK;
      } else {
        fighter.state = FighterState.IDLE;
      }
      break;
    }

    case FighterState.JUMP: {
      if ((input.lightAttackPressed || input.heavyAttackPressed) && !fighter.currentAttack) {
        fighter.startAttack(AttackType.AIR_ATTACK);
      }
      fighter.vy += GRAVITY;
      break;
    }

    case FighterState.CROUCH: {
      fighter.displayHeight = 50;
      fighter.vx = 0;
      if (!input.down) { fighter.state = FighterState.IDLE; fighter.displayHeight = 100; return; }
      if ((input.lightAttackPressed || input.heavyAttackPressed) && fighter.canAct()) {
        fighter.startAttack(AttackType.CROUCH_ATTACK);
        return;
      }
      if (input.throwAttackPressed && fighter.canAct()) {
        fighter.startAttack(AttackType.THROW);
        return;
      }
      break;
    }

    case FighterState.STAND_ATTACK:
    case FighterState.CROUCH_ATTACK:
    case FighterState.AIR_ATTACK:
    case FighterState.THROW: {
      if (fighter.currentAttack === AttackType.SPECIAL_PROJECTILE && fighter.attackPhase === 'active' && fighter.attackFrame === 0) {
        const ownerId = fighter === p1 ? 0 : 1;
        projectiles.push(new Projectile(fighter.x + 50 * fighter.facing, fighter.y - 50, fighter.facing, FRAME_DATA.SPECIAL_PROJECTILE.active, ownerId));
      }
      if (fighter.currentAttack === AttackType.SPECIAL_UPPER && fighter.attackPhase === 'active') {
        fighter.vy = -6;
      }
      fighter.tickAttack();
      if (!fighter.currentAttack && !fighter.isGrounded()) {
        fighter.state = FighterState.JUMP;
      }
      break;
    }

    case FighterState.BLOCK:
      fighter.blockstunTimer--;
      fighter.vx *= 0.8;
      if (fighter.blockstunTimer <= 0) { fighter.state = FighterState.IDLE; fighter.vx = 0; }
      break;

    case FighterState.HITSTUN:
      fighter.hitstunTimer--;
      fighter.vx *= 0.85;
      if (fighter.hitstunTimer <= 0) { fighter.state = FighterState.IDLE; fighter.vx = 0; }
      break;

    case FighterState.KNOCKDOWN:
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

function applyPhysics(fighter: Fighter): void {
  fighter.x += fighter.vx;
  fighter.y += fighter.vy;

  if (fighter.y >= STAGE_GROUND_Y) {
    if (fighter.state === FighterState.JUMP || fighter.state === FighterState.AIR_ATTACK) {
      if (fighter.currentAttack) fighter.endAttack();
      fighter.y = STAGE_GROUND_Y;
      fighter.vy = 0;
      fighter.vx = 0;
      fighter.state = FighterState.IDLE;
      fighter.landingRecovery = LANDING_RECOVERY;
    } else if (fighter.vy > 0) {
      fighter.y = STAGE_GROUND_Y;
      fighter.vy = 0;
    }
  }

  fighter.x = Math.max(FIGHTER_WIDTH / 2, Math.min(fighter.x, STAGE_WIDTH - FIGHTER_WIDTH / 2));
}

function resolvePushbox(a: Fighter, b: Fighter): void {
  const aBox = a.getPushbox();
  const bBox = b.getPushbox();
  const overlap = Math.min(aBox.x + aBox.width, bBox.x + bBox.width) - Math.max(aBox.x, bBox.x);
  if (overlap > 0) {
    const push = overlap / 2 + 0.5;
    if (a.x < b.x) { a.x -= push; b.x += push; }
    else { a.x += push; b.x -= push; }
  }
}

// ===== Main Loop =====
function update(): void {
  if (koState) {
    koTimer++;
    if (koTimer > KO_DISPLAY_TIME && inputManager.isKeyDown('KeyR')) restartGame();
    return;
  }

  tick++;

  const rawP1 = inputManager.getP1Input();
  const rawP2 = inputManager.getP2Input();

  p1.updateFacing(p2);
  p2.updateFacing(p1);

  const prevP1 = combatSystem.getPrevAttack(0);
  const prevP2 = combatSystem.getPrevAttack(1);
  const p1Input = resolveInput(rawP1, p1.facing, prevP1);
  const p2Input = resolveInput(rawP2, p2.facing, prevP2);

  combatSystem.updateEdgeTracking(rawP1, rawP2);

  p1Cmd.record(getDirectionInput(p1Input), tick);
  p2Cmd.record(getDirectionInput(p2Input), tick);

  controlFighter(p1, p1Input, p1Cmd);
  controlFighter(p2, p2Input, p2Cmd);
  resolvePushbox(p1, p2);

  for (const proj of projectiles) proj.update();

  combatSystem.resolveAttacks(p1, p2, projectiles);

  applyPhysics(p1);
  applyPhysics(p2);

  for (let i = projectiles.length - 1; i >= 0; i--) {
    if (!projectiles[i].active) projectiles.splice(i, 1);
  }

  if (p1.health <= 0 || p2.health <= 0) {
    koState = true;
    koTimer = 0;
    winner = p1.health <= 0 && p2.health <= 0 ? null : p1.health <= 0 ? 1 : 0;
  }

  window.__gameState = {
    players: [p1, p2].map(f => ({
      x: f.x, y: f.y, health: f.health, state: f.state,
      facing: f.facing, currentAttack: f.currentAttack,
      attackPhase: f.attackPhase, attackFrame: f.attackFrame,
    })),
    tick, fps: renderer.getFps(), ko: koState, winner,
  };
}

function render(): void {
  camera.update(p1, p2);
  renderer.render([p1, p2], camera.x, tick, koState, winner);

  // Projectiles
  for (const proj of projectiles) {
    if (!proj.active) continue;
    const sx = camera.worldToScreen(proj.x);
    ctx.save();
    // Glow
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#ffaa22';
    ctx.beginPath();
    ctx.arc(sx, proj.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Core
    ctx.fillStyle = '#fff8e0';
    ctx.beginPath();
    ctx.arc(sx, proj.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Controls hint
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('P1: WASD + J/K/L | P2: Arrows + 4/5/6 | R: Restart | F1: Debug', 400, 596);
  ctx.textAlign = 'left';

  if (debugMode) drawDebug();
}

function drawDebug(): void {
  ctx.save();
  // Panel
  ctx.globalAlpha = 0.88;
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, 310, 220);
  ctx.globalAlpha = 1;
  ctx.font = '10px monospace';

  let y = 13;
  for (let i = 0; i < 2; i++) {
    const f = i === 0 ? p1 : p2;
    ctx.fillStyle = i === 0 ? '#ff5555' : '#5599ff';
    ctx.fillText(`P${i + 1} ────────────────────────`, 4, y); y += 13;
    ctx.fillStyle = '#ccc';
    ctx.fillText(` ${f.state}  hp:${f.health}  pos:(${Math.round(f.x)},${Math.round(f.y)})  face:${f.facing === 1 ? '→' : '←'}`, 4, y); y += 13;
    ctx.fillText(` vx:${f.vx.toFixed(1)} vy:${f.vy.toFixed(1)} ground:${f.isGrounded()}`, 4, y); y += 13;
    if (f.currentAttack) {
      ctx.fillStyle = '#ffcc00';
      const d = FRAME_DATA[f.currentAttack];
      ctx.fillText(` ATK:${f.currentAttack} [${f.attackPhase}] ${f.attackFrame}f dmg:${d.damage}`, 4, y); y += 13;
      // Progress bar
      const total = d.startup + d.active + d.recovery;
      let prog = f.attackPhase === 'startup' ? f.attackFrame / total : f.attackPhase === 'active' ? (d.startup + f.attackFrame) / total : (d.startup + d.active + f.attackFrame) / total;
      ctx.fillStyle = '#333'; ctx.fillRect(8, y, 200, 5);
      ctx.fillStyle = '#ccaa00'; ctx.fillRect(8, y, 200 * d.startup / total, 5);
      ctx.fillStyle = '#cc2200'; ctx.fillRect(8 + 200 * d.startup / total, y, 200 * d.active / total, 5);
      ctx.fillStyle = '#2244aa'; ctx.fillRect(8 + 200 * (d.startup + d.active) / total, y, 200 * d.recovery / total, 5);
      ctx.fillStyle = '#fff'; ctx.fillRect(8 + 200 * prog - 1, y - 1, 3, 7);
      y += 10;
    }
    if (f.hitstunTimer > 0) { ctx.fillStyle = '#ff8888'; ctx.fillText(` hitstun:${f.hitstunTimer}`, 4, y); y += 13; }
    if (f.blockstunTimer > 0) { ctx.fillStyle = '#8888ff'; ctx.fillText(` blockstun:${f.blockstunTimer}`, 4, y); y += 13; }
  }
  ctx.fillStyle = '#0f0';
  ctx.fillText(`tick:${tick} fps:${renderer.getFps()} proj:${projectiles.length}`, 4, y);

  // Collision box overlays
  for (const f of [p1, p2]) {
    const hitbox = f.getActiveHitbox();
    if (hitbox) {
      ctx.fillStyle = 'rgba(255,0,0,0.2)'; ctx.fillRect(hitbox.x - camera.x, hitbox.y, hitbox.width, hitbox.height);
      ctx.strokeStyle = 'rgba(255,0,0,0.7)'; ctx.lineWidth = 2; ctx.strokeRect(hitbox.x - camera.x, hitbox.y, hitbox.width, hitbox.height);
    }
    const hb = f.getHurtbox();
    ctx.strokeStyle = 'rgba(0,100,255,0.5)'; ctx.lineWidth = 1; ctx.strokeRect(hb.x - camera.x, hb.y, hb.width, hb.height);
    const pb = f.getPushbox();
    ctx.strokeStyle = 'rgba(0,255,0,0.3)'; ctx.setLineDash([3, 3]); ctx.strokeRect(pb.x - camera.x, pb.y, pb.width, pb.height); ctx.setLineDash([]);

    // State label above head
    const sx = camera.worldToScreen(f.x);
    ctx.fillStyle = '#fff'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
    ctx.fillText(f.state, sx, f.y - f.displayHeight - 6);
    ctx.textAlign = 'left';
  }

  // Input buffer panel
  ctx.globalAlpha = 0.88;
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(560, 0, 240, 110);
  ctx.globalAlpha = 1;
  ctx.font = '9px monospace';
  const symbols: Record<string, string> = { 'neutral': '·', 'up': '↑', 'down': '↓', 'forward': '→', 'back': '←', 'upforward': '↗', 'upback': '↖', 'downforward': '↘', 'downback': '↙' };

  for (let i = 0; i < 2; i++) {
    const buf = i === 0 ? p1Cmd : p2Cmd;
    const py = 13 + i * 48;
    ctx.fillStyle = i === 0 ? '#ff5555' : '#5599ff';
    ctx.fillText(`P${i + 1} Buffer:`, 564, py);
    const hist = buf.getRecentHistory(10);
    ctx.fillStyle = '#aaa';
    ctx.fillText(' ' + hist.map(h => symbols[h.direction] || '?').join(' '), 564, py + 12);
    ctx.fillStyle = '#555';
    ctx.fillText(' ages:' + hist.map(h => tick - h.frame).join(','), 564, py + 24);
  }

  ctx.restore();
}

function restartGame(): void {
  koState = false;
  koTimer = 0;
  winner = null;
  tick = 0;
  p1.reset(STAGE_WIDTH * 0.33);
  p2.reset(STAGE_WIDTH * 0.67);
  p1Cmd.reset();
  p2Cmd.reset();
  combatSystem.reset();
  projectiles.length = 0;
}

// ===== F1 Toggle =====
let f1Down = false;
window.addEventListener('keydown', e => { if (e.code === 'F1') { e.preventDefault(); if (!f1Down) { f1Down = true; debugMode = !debugMode; } } });
window.addEventListener('keyup', e => { if (e.code === 'F1') f1Down = false; });

// ===== Start =====
new GameLoop(update, render).start();
console.log('KOF 2002 POC initialized');
