import { Camera } from './core/camera.js';
import { GameLoop } from './core/gameLoop.js';
import { STAGE_WIDTH, KO_DISPLAY_TIME, FRAME_DATA } from './core/constants.js';
import { FighterState, AttackType, GameState, GamePhase } from './core/types.js';
import { InputManager, CommandBuffer, resolveInput, getDirectionInput } from './input/index.js';
import type { ResolvedInput } from './input/index.js';
import { Fighter } from './entities/fighter.js';
import { Projectile } from './entities/projectile.js';
import { FighterController, resolvePushbox } from './entities/fighterController.js';
import { CombatSystem } from './combat/combatSystem.js';
import { Renderer } from './rendering/renderer.js';
import { VFXSystem, ScreenShake } from './rendering/vfx.js';

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
const vfx = new VFXSystem();
const screenShake = new ScreenShake();

// ===== Entities =====
const p1 = new Fighter(STAGE_WIDTH * 0.33, '#cc2222', 1);
const p2 = new Fighter(STAGE_WIDTH * 0.67, '#2244cc', -1);
const projectiles: Projectile[] = [];
const tickRef = { value: 0 };

const p1Cmd = new CommandBuffer();
const p2Cmd = new CommandBuffer();

const p1Ctrl = new FighterController(p1, 0, p1Cmd, vfx, projectiles, tickRef);
const p2Ctrl = new FighterController(p2, 1, p2Cmd, vfx, projectiles, tickRef);

// ===== State =====
let phase: GamePhase = GamePhase.INTRO;
let phaseTimer = 0;
const INTRO_DURATION = 120;
let koTimer = 0;
let winner: number | null = null;
let debugMode = false;
let comboCount = [0, 0];
let comboTimer = [0, 0];
const COMBO_TIMEOUT = 60;

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

// ===== Hit callback =====
function onHit(attacker: Fighter, defender: Fighter, attackType: AttackType, blocked: boolean): void {
  const data = FRAME_DATA[attackType];
  const hitX = (attacker.x + defender.x) / 2;
  const hitY = defender.y - defender.displayHeight / 2;
  const defIdx = defender === p1 ? 0 : 1;

  if (blocked) {
    vfx.spawnBlockFlash(hitX, hitY);
    screenShake.trigger(3, 4);
    comboCount[defIdx] = 0;
  } else {
    comboCount[defIdx]++;
    comboTimer[defIdx] = 0;
    vfx.spawnHitSparks(hitX, hitY, attackType === AttackType.SPECIAL_UPPER ? 14 : 8);
    vfx.spawnImpactRing(hitX, hitY);
    vfx.spawnDamageText(defender.x, defender.y - defender.displayHeight - 20, data.damage);
    if (comboCount[defIdx] >= 2) {
      vfx.spawnDamageText(defender.x, defender.y - defender.displayHeight - 40, comboCount[defIdx]);
    }
    const shake = attackType === AttackType.SPECIAL_UPPER ? 8 : attackType === AttackType.THROW ? 6 : data.damage > 60 ? 5 : 3;
    screenShake.trigger(shake, 8);
  }
}

// ===== Main Loop =====
function update(): void {
  vfx.update();
  screenShake.update();

  if (phase === GamePhase.INTRO) {
    phaseTimer++;
    if (phaseTimer >= INTRO_DURATION) { phase = GamePhase.FIGHTING; tickRef.value = 0; }
    return;
  }
  if (phase === GamePhase.KO) {
    koTimer++;
    if (koTimer > KO_DISPLAY_TIME && inputManager.isKeyDown('KeyR')) restartGame();
    return;
  }

  tickRef.value++;

  // Combo timeout
  for (let i = 0; i < 2; i++) {
    if (comboCount[i] > 0 && ++comboTimer[i] >= COMBO_TIMEOUT) comboCount[i] = 0;
  }

  const rawP1 = inputManager.getP1Input();
  const rawP2 = inputManager.getP2Input();
  p1.updateFacing(p2);
  p2.updateFacing(p1);

  const p1Input = resolveInput(rawP1, p1.facing, combatSystem.getPrevAttack(0));
  const p2Input = resolveInput(rawP2, p2.facing, combatSystem.getPrevAttack(1));
  combatSystem.updateEdgeTracking(rawP1, rawP2);

  p1Cmd.record(getDirectionInput(p1Input), tickRef.value);
  p2Cmd.record(getDirectionInput(p2Input), tickRef.value);

  p1Ctrl.update(p1Input);
  p2Ctrl.update(p2Input);
  resolvePushbox(p1, p2);

  for (const proj of projectiles) proj.update();
  combatSystem.resolveAttacks(p1, p2, projectiles, onHit);

  p1Ctrl.applyPhysics();
  p2Ctrl.applyPhysics();

  for (let i = projectiles.length - 1; i >= 0; i--) {
    if (!projectiles[i].active) projectiles.splice(i, 1);
  }

  if (p1.health <= 0 || p2.health <= 0) {
    phase = GamePhase.KO; koTimer = 0;
    winner = p1.health <= 0 && p2.health <= 0 ? null : p1.health <= 0 ? 1 : 0;
    vfx.spawnHitSparks((p1.x + p2.x) / 2, 380, 20);
    screenShake.trigger(12, 15);
  }
  if (tickRef.value >= 99 * 60) {
    phase = GamePhase.KO; koTimer = 0;
    winner = p1.health > p2.health ? 0 : p2.health > p1.health ? 1 : null;
    screenShake.trigger(8, 10);
  }

  window.__gameState = {
    players: [p1, p2].map(f => ({
      x: f.x, y: f.y, health: f.health, state: f.state,
      facing: f.facing, currentAttack: f.currentAttack,
      attackPhase: f.attackPhase, attackFrame: f.attackFrame,
    })),
    tick: tickRef.value, fps: renderer.getFps(), ko: phase === GamePhase.KO, winner,
  };
}

function render(): void {
  camera.update(p1, p2);
  const isKO = phase === GamePhase.KO;
  renderer.render([p1, p2], camera.x, tickRef.value, isKO, winner, screenShake.offsetX, screenShake.offsetY);
  renderer.drawProjectiles(projectiles, camera);
  vfx.render(ctx, camera.x);

  if (phase === GamePhase.INTRO) renderer.drawIntro(phaseTimer);
  renderer.drawComboCounters([p1, p2], comboCount, comboTimer, camera);
  renderer.drawControlsHint();
  if (debugMode) renderer.drawDebug([p1, p2], projectiles, camera, tickRef.value, renderer.getFps(), vfx.count, [p1Cmd, p2Cmd]);
}

function restartGame(): void {
  phase = GamePhase.INTRO;
  phaseTimer = 0;
  koTimer = 0;
  winner = null;
  tickRef.value = 0;
  comboCount = [0, 0];
  comboTimer = [0, 0];
  p1.reset(STAGE_WIDTH * 0.33);
  p2.reset(STAGE_WIDTH * 0.67);
  p1Cmd.reset();
  p2Cmd.reset();
  combatSystem.reset();
  projectiles.length = 0;
  vfx.reset();
}

// ===== F1 Toggle =====
let f1Down = false;
window.addEventListener('keydown', e => { if (e.code === 'F1') { e.preventDefault(); if (!f1Down) { f1Down = true; debugMode = !debugMode; } } });
window.addEventListener('keyup', e => { if (e.code === 'F1') f1Down = false; });

// ===== Start =====
new GameLoop(update, render).start();
console.log('KOF 2002 POC initialized');
