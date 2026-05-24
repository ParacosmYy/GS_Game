import { Camera } from './core/camera.js';
import { GameLoop } from './core/gameLoop.js';
import { STAGE_WIDTH, KO_DISPLAY_TIME, FRAME_DATA, DM_STOCK_COST, MAX_MODE_STOCK_COST, MAX_MODE_DMG_REDUCTION } from './core/constants.js';
import { AttackType, GameState, GamePhase } from './core/types.js';
import type { PowerGauge, MaxModeState } from './core/types.js';
import { ROSTER } from './characters/index.js';
import type { CharacterDefinition } from './characters/types.js';
import { InputManager, CommandBuffer, resolveInput, getDirectionInput } from './input/index.js';
import type { ResolvedInput } from './input/index.js';
import { Fighter } from './entities/fighter.js';
import { Projectile } from './entities/projectile.js';
import { FighterController, resolvePushbox } from './entities/fighterController.js';
import { CombatSystem } from './combat/combatSystem.js';
import { Renderer } from './rendering/renderer.js';
import { VFXSystem, ScreenShake } from './rendering/vfx.js';
import {
  createPowerGauge, createMaxMode,
  gainMeterOnHit, gainMeterOnBlock, gainMeterOnHitstun,
  spendStocks, activateMaxMode, tickMaxMode, resetMeterSystem,
} from './combat/meter.js';

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
const p1 = new Fighter(STAGE_WIDTH * 0.33, ROSTER[0].color, 1);
const p2 = new Fighter(STAGE_WIDTH * 0.67, ROSTER[1].color, -1);
const projectiles: Projectile[] = [];
const tickRef = { value: 0 };

const p1Cmd = new CommandBuffer();
const p2Cmd = new CommandBuffer();

const p1Ctrl = new FighterController(p1, 0, p1Cmd, vfx, projectiles, tickRef, ROSTER[0]);
const p2Ctrl = new FighterController(p2, 1, p2Cmd, vfx, projectiles, tickRef, ROSTER[1]);
p1Ctrl.setOpponent(p2);
p2Ctrl.setOpponent(p1);

// ===== Power Gauge & MAX Mode =====
const gauges: [PowerGauge, PowerGauge] = [createPowerGauge(), createPowerGauge()];
const maxModes: [MaxModeState, MaxModeState] = [createMaxMode(), createMaxMode()];

// ===== State =====
let phase: GamePhase = GamePhase.SELECT;
let phaseTimer = 0;
const INTRO_DURATION = 120;
let koTimer = 0;
let winner: number | null = null;
let debugMode = false;

// Character select state
let p1SelectCursor = 0;
let p2SelectCursor = 1;
let p1Ready = false;
let p2Ready = false;
let selectCountdown = -1;

// ===== Window API =====
declare global {
  interface Window {
    __gameState: GameState;
    __fighters: Fighter[];
    __restart: () => void;
    __prevP1Left: boolean;
    __prevP1Right: boolean;
    __prevP2Left: boolean;
    __prevP2Right: boolean;
  }
}
window.__fighters = [p1, p2];
window.__restart = restartGame;

// ===== Hit callback =====
function onHit(attacker: Fighter, defender: Fighter, attackType: AttackType, blocked: boolean, counterHit: boolean): void {
  const data = FRAME_DATA[attackType as keyof typeof FRAME_DATA];
  const hitX = (attacker.x + defender.x) / 2;
  const hitY = defender.y - defender.displayHeight / 2;
  const atkIdx = attacker === p1 ? 0 : 1;
  const defIdx = defender === p1 ? 0 : 1;

  if (blocked) {
    vfx.spawnBlockFlash(hitX, hitY);
    screenShake.trigger(3, 4);
    gainMeterOnBlock(gauges[atkIdx]);
    gainMeterOnHitstun(gauges[defIdx]);
  } else {
    const comboCount = combatSystem.getComboCount(defIdx);
    gainMeterOnHit(gauges[atkIdx]);
    gainMeterOnHitstun(gauges[defIdx]);
    vfx.spawnHitSparks(hitX, hitY, attackType === AttackType.SPECIAL_UPPER ? 14
      : attackType === AttackType.DM_OROCHINAGI ? 20
      : counterHit ? 12 : 8);
    vfx.spawnImpactRing(hitX, hitY);
    vfx.spawnDamageText(defender.x, defender.y - defender.displayHeight - 20, data.damage);
    if (counterHit) {
      vfx.spawnCounterText(defender.x, defender.y - defender.displayHeight - 55);
    }
    if (comboCount >= 2) {
      vfx.spawnDamageText(defender.x, defender.y - defender.displayHeight - 40, comboCount);
    }
    const shake = attackType === AttackType.DM_OROCHINAGI ? 14
      : attackType === AttackType.SPECIAL_UPPER ? 8
      : attackType === AttackType.THROW ? 6
      : counterHit ? 7
      : attackType === AttackType.STAND_C || attackType === AttackType.STAND_D ? 5
      : data.damage > 50 ? 4 : 3;
    screenShake.trigger(shake, 8);
  }
}

// ===== Check if DM can be used (has stocks) =====
function canUseDM(playerIndex: number): boolean {
  return gauges[playerIndex].stocks >= DM_STOCK_COST;
}

function useDM(playerIndex: number): void {
  spendStocks(gauges[playerIndex], DM_STOCK_COST);
}

// ===== Check B+C for MAX activation =====
function checkMaxActivation(input: ResolvedInput, playerIndex: number): void {
  // B+C = buttonB && buttonC
  if (input.buttonB && input.buttonC && (input.buttonBPressed || input.buttonCPressed)) {
    if (activateMaxMode(gauges[playerIndex], maxModes[playerIndex])) {
      vfx.spawnHitSparks(
        playerIndex === 0 ? p1.x : p2.x,
        playerIndex === 0 ? p1.y - 50 : p2.y - 50,
        15,
      );
      screenShake.trigger(6, 8);
    }
  }
}

// ===== Main Loop =====
function update(): void {
  vfx.update();
  screenShake.update();

  // Tick MAX mode timers
  tickMaxMode(maxModes[0]);
  tickMaxMode(maxModes[1]);

  // ── CHARACTER SELECT PHASE ──
  if (phase === GamePhase.SELECT) {
    tickRef.value++;
    const rawP1 = inputManager.getP1Input();
    const rawP2 = inputManager.getP2Input();

    // P1 select: A=left, D=right, J=confirm
    if (!p1Ready) {
      if (rawP1.left && !window.__prevP1Left) {
        p1SelectCursor = (p1SelectCursor - 1 + ROSTER.length) % ROSTER.length;
      }
      if (rawP1.right && !window.__prevP1Right) {
        p1SelectCursor = (p1SelectCursor + 1) % ROSTER.length;
      }
      if (rawP1.buttonA) {  // J = buttonA for P1
        p1Ready = true;
      }
    }

    // P2 select: ←=left, →=right, Numpad1=confirm
    if (!p2Ready) {
      if (rawP2.left && !window.__prevP2Left) {
        p2SelectCursor = (p2SelectCursor - 1 + ROSTER.length) % ROSTER.length;
      }
      if (rawP2.right && !window.__prevP2Right) {
        p2SelectCursor = (p2SelectCursor + 1) % ROSTER.length;
      }
      if (rawP2.buttonA) {  // Numpad1 = buttonA for P2
        p2Ready = true;
      }
    }

    // Track prev inputs for edge detection
    window.__prevP1Left = rawP1.left;
    window.__prevP1Right = rawP1.right;
    window.__prevP2Left = rawP2.left;
    window.__prevP2Right = rawP2.right;

    // Both ready → start countdown then go to INTRO
    if (p1Ready && p2Ready) {
      if (selectCountdown < 0) selectCountdown = 60;
      selectCountdown--;
      if (selectCountdown <= 0) {
        // Apply selected characters
        p1Ctrl.setCharacter(ROSTER[p1SelectCursor]);
        p2Ctrl.setCharacter(ROSTER[p2SelectCursor]);
        phase = GamePhase.INTRO;
        phaseTimer = 0;
      }
    }

    return;
  }

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

  const rawP1 = inputManager.getP1Input();
  const rawP2 = inputManager.getP2Input();
  p1.updateFacing(p2);
  p2.updateFacing(p1);

  const p1Input = resolveInput(rawP1, p1.facing, combatSystem.getPrevAttack(0));
  const p2Input = resolveInput(rawP2, p2.facing, combatSystem.getPrevAttack(1));
  combatSystem.updateEdgeTracking(rawP1, rawP2);

  // Check MAX activation (B+C)
  checkMaxActivation(p1Input, 0);
  checkMaxActivation(p2Input, 1);

  p1Cmd.record(getDirectionInput(p1Input), tickRef.value);
  p2Cmd.record(getDirectionInput(p2Input), tickRef.value);

  p1Ctrl.update(p1Input);
  p2Ctrl.update(p2Input);
  resolvePushbox(p1, p2);

  for (const proj of projectiles) proj.update();
  combatSystem.resolveAttacks(p1, p2, projectiles, onHit);

  // Check if DM was started and consume stock
  for (let i = 0; i < 2; i++) {
    const f = i === 0 ? p1 : p2;
    if (f.currentAttack === AttackType.DM_OROCHINAGI && f.attackFrame === 0 && f.attackPhase === 'startup') {
      if (canUseDM(i)) {
        useDM(i);
      } else {
        // Not enough meter → cancel the DM, do nothing
        f.endAttack();
      }
    }
  }

  p1Ctrl.applyPhysics();
  p2Ctrl.applyPhysics();

  for (let i = projectiles.length - 1; i >= 0; i--) {
    if (!projectiles[i].active) projectiles.splice(i, 1);
  }

  // MAX mode damage reduction
  // (applied inside combatSystem would be cleaner, but keeping it simple here)

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
  if (phase === GamePhase.SELECT) {
    renderer.drawCharacterSelect(p1SelectCursor, p2SelectCursor, p1Ready, p2Ready, tickRef.value);
    return;
  }

  camera.update(p1, p2);
  const isKO = phase === GamePhase.KO;
  renderer.render([p1, p2], camera.x, tickRef.value, isKO, winner, screenShake.offsetX, screenShake.offsetY);
  renderer.drawProjectiles(projectiles, camera);
  vfx.render(ctx, camera.x);

  // Power gauge UI
  renderer.drawPowerGauges(gauges, maxModes);

  if (phase === GamePhase.INTRO) renderer.drawIntro(phaseTimer);
  renderer.drawComboCounters([p1, p2], [combatSystem.getComboCount(0), combatSystem.getComboCount(1)], [0, 0], camera);
  renderer.drawControlsHint();
  if (debugMode) renderer.drawDebug([p1, p2], projectiles, camera, tickRef.value, renderer.getFps(), vfx.count, [p1Cmd, p2Cmd]);
}

function restartGame(): void {
  phase = GamePhase.SELECT;
  phaseTimer = 0;
  koTimer = 0;
  winner = null;
  tickRef.value = 0;
  p1SelectCursor = 0;
  p2SelectCursor = 1;
  p1Ready = false;
  p2Ready = false;
  selectCountdown = -1;
  p1.reset(STAGE_WIDTH * 0.33);
  p2.reset(STAGE_WIDTH * 0.67);
  p1Cmd.reset();
  p2Cmd.reset();
  combatSystem.reset();
  projectiles.length = 0;
  vfx.reset();
  resetMeterSystem(gauges[0], maxModes[0]);
  resetMeterSystem(gauges[1], maxModes[1]);
}

// ===== F1 Toggle =====
let f1Down = false;
window.addEventListener('keydown', e => { if (e.code === 'F1') { e.preventDefault(); if (!f1Down) { f1Down = true; debugMode = !debugMode; } } });
window.addEventListener('keyup', e => { if (e.code === 'F1') f1Down = false; });

// ===== Start =====
new GameLoop(update, render).start();
console.log('KOF 2002 POC initialized');
