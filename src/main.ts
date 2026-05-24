import { Camera } from './core/camera.js';
import { GameLoop } from './core/gameLoop.js';
import { STAGE_WIDTH, KO_DISPLAY_TIME, FRAME_DATA, DM_STOCK_COST, MAX_MODE_STOCK_COST, MAX_MODE_DMG_REDUCTION, MAX_HEALTH } from './core/constants.js';
import { AttackType, GameState, GamePhase, FighterState } from './core/types.js';
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
import { SimpleAI } from './ai/simpleAI.js';
import { initAudio, playHit, playBlock, playSpecial, playDM, playThrow, playKO, playSelect, playCounter } from './audio/sfx.js';
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

// Link gauges to controllers for Guard Cancel stock consumption
p1Ctrl.setGauge(gauges[0]);
p2Ctrl.setGauge(gauges[1]);

// Link MAX mode to controllers for Free Cancel
p1Ctrl.setMaxMode(maxModes[0]);
p2Ctrl.setMaxMode(maxModes[1]);

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

// AI system
let p2IsAI = true; // Default: P2 is AI
let p2AI: SimpleAI | null = null;

// ===== Cinematic Effects State =====
let hitStop = 0;         // Hit-stop frame freeze counter
let superFlashTimer = 0; // Super flash (DM dark screen) timer
let superFlashX = 0;     // Super flash center X (world)
let superFlashY = 0;     // Super flash center Y (world)
let koSlowMo = 0;        // KO slow-motion remaining frames
let koSlowMoTriggered = false; // Only trigger once per round
let koSlowMoFrameCounter = 0; // For 3-frame skip pattern
let superFlashAttacker = 0;  // 0=p1, 1=p2 — which player triggered super flash
let p1DamageTaken = 0;       // Accumulated damage P1 took (for PERFECT detection)
let p2DamageTaken = 0;       // Accumulated damage P2 took (for PERFECT detection)

// ===== Delayed Health Bar State =====
let p1DelayedHealth = MAX_HEALTH;
let p2DelayedHealth = MAX_HEALTH;

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
    __prevToggleAI: boolean;
  }
}
window.__fighters = [p1, p2];
window.__restart = restartGame;

// ===== Hit callback =====
function onHit(attacker: Fighter, defender: Fighter, attackType: AttackType, blocked: boolean, counterHit: boolean): void {
  const data = FRAME_DATA[attackType as keyof typeof FRAME_DATA];
  const name = attackType as string;
  const hitX = (attacker.x + defender.x) / 2;
  const hitY = defender.y - defender.displayHeight / 2;
  const atkIdx = attacker === p1 ? 0 : 1;
  const defIdx = defender === p1 ? 0 : 1;

  if (blocked) {
    vfx.spawnBlockFlash(hitX, hitY);
    screenShake.trigger(3, 4);
    gainMeterOnBlock(gauges[atkIdx]);
    gainMeterOnHitstun(gauges[defIdx]);
    playBlock();
  } else {
    // ── Hit Stop: freeze game for cinematic impact ──
    const isDM = attackType === AttackType.DM_OROCHINAGI || attackType === AttackType.DM_YATAGARASU
      || attackType === AttackType.DM_POWER_GEYSER || attackType === AttackType.DM_PHOENIX_KICK;
    const isSpecial = attackType === AttackType.SPECIAL_PROJECTILE || attackType === AttackType.SPECIAL_UPPER
      || name.startsWith('KYO_') || name.startsWith('IORI_') || name.startsWith('TERRY_') || name.startsWith('KIM_');
    if (isDM) {
      hitStop = 8;
    } else if (isSpecial) {
      hitStop = 6;
    } else if (attackType === AttackType.STAND_C || attackType === AttackType.STAND_D
      || attackType === AttackType.CLOSE_C || attackType === AttackType.CLOSE_D
      || attackType === AttackType.CROUCH_C || attackType === AttackType.CROUCH_D
      || attackType === AttackType.JUMP_C || attackType === AttackType.JUMP_D) {
      hitStop = 5;
    } else {
      hitStop = 3;
    }
    if (counterHit) hitStop += 2;
    const comboCount = combatSystem.getComboCount(defIdx);
    gainMeterOnHit(gauges[atkIdx]);
    gainMeterOnHitstun(gauges[defIdx]);
    const atkCharDef = atkIdx === 0
      ? ROSTER.find(c => c.id === p1.charId) || ROSTER[0]
      : ROSTER.find(c => c.id === p2.charId) || ROSTER[1];
    vfx.spawnCharacterHitSparks(hitX, hitY, attackType === AttackType.SPECIAL_UPPER ? 14
      : attackType === AttackType.DM_OROCHINAGI || attackType === AttackType.DM_YATAGARASU
        || attackType === AttackType.DM_POWER_GEYSER || attackType === AttackType.DM_PHOENIX_KICK ? 20
      : counterHit ? 12 : 8, atkCharDef.specialColor);
    vfx.spawnImpactRing(hitX, hitY);
    vfx.spawnDamageText(defender.x, defender.y - defender.displayHeight - 20, data.damage);
    // Sound effects (reuse isDM/isSpecial from hit-stop above)
    if (isDM) playDM();
    else if (attackType === AttackType.THROW) playThrow();
    else if (isSpecial) playSpecial();
    else playHit(data.damage > 60 ? 1.3 : 1.0);
    if (counterHit) {
      vfx.spawnCounterText(defender.x, defender.y - defender.displayHeight - 55);
      playCounter();
    }
    // Counter Wire: spawn impact sparks when wall bounce triggers
    if (counterHit && (data as { counterWire?: boolean }).counterWire) {
      const wallX = defender.x <= STAGE_WIDTH / 2 ? 30 : STAGE_WIDTH - 30;
      vfx.spawnCounterWireSparks(wallX, defender.y - defender.displayHeight / 2);
      screenShake.trigger(10, 10);
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
    // Track damage for PERFECT detection
    if (defIdx === 0) p1DamageTaken += data.damage;
    else p2DamageTaken += data.damage;
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
  // ── Hit Stop: skip all game logic while active (still render) ──
  if (hitStop > 0) {
    hitStop--;
    // Still update VFX/screenShake so particles don't freeze
    vfx.update();
    screenShake.update();
    tickMaxMode(maxModes[0]);
    tickMaxMode(maxModes[1]);
    if (superFlashTimer > 0) superFlashTimer--;
    return;
  }

  vfx.update();
  screenShake.update();

  // Tick MAX mode timers
  tickMaxMode(maxModes[0]);
  tickMaxMode(maxModes[1]);

  // ── Super Flash timer tick ──
  if (superFlashTimer > 0) superFlashTimer--;

  // ── CHARACTER SELECT PHASE ──
  if (phase === GamePhase.SELECT) {
  tickRef.value++;

  // ── KO Slow Motion: run update only every 3rd frame ──
  if (koSlowMo > 0) {
    koSlowMoFrameCounter++;
    if (koSlowMoFrameCounter < 3) return;
    koSlowMoFrameCounter = 0;
    koSlowMo--;
    if (koSlowMo <= 0) {
      // Slow-mo ended — proceed to KO phase normally
      koSlowMoTriggered = true;
    }
  }
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
        initAudio();
        playSelect();
      }
    }

    // P2 select: ←=left, →=right, Numpad1=confirm (or AI auto-confirm)
    if (p2IsAI) {
      // AI auto-selects a character after P1 confirms
      if (p1Ready && !p2Ready) {
        p2SelectCursor = (p1SelectCursor + 1 + Math.floor(Math.random() * (ROSTER.length - 1))) % ROSTER.length;
        p2Ready = true;
      }
    } else if (!p2Ready) {
      if (rawP2.left && !window.__prevP2Left) {
        p2SelectCursor = (p2SelectCursor - 1 + ROSTER.length) % ROSTER.length;
      }
      if (rawP2.right && !window.__prevP2Right) {
        p2SelectCursor = (p2SelectCursor + 1) % ROSTER.length;
      }
      if (rawP2.buttonA) {
        p2Ready = true;
      }
    }

    // Toggle AI: press T during select
    if (inputManager.isKeyDown('KeyT') && !window.__prevToggleAI) {
      p2IsAI = !p2IsAI;
    }
    window.__prevToggleAI = inputManager.isKeyDown('KeyT');

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
        // Apply character-specific stats (health, pushWidth)
        p1.setStats(ROSTER[p1SelectCursor].stats);
        p2.setStats(ROSTER[p2SelectCursor].stats);
        // Sync delayed health bars to new maxHealth
        p1DelayedHealth = p1.maxHealth;
        p2DelayedHealth = p2.maxHealth;
        // Initialize AI for P2
        if (p2IsAI) {
          p2AI = new SimpleAI(p2, p1, ROSTER[p2SelectCursor], 0.6);
        }
        phase = GamePhase.INTRO;
        phaseTimer = 0;
        p1.savePrevState(); p2.savePrevState();
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

  // P2: AI or human input
  if (p2IsAI && p2AI) {
    const aiInput = p2AI.getInput();
    p2Ctrl.update(aiInput);
    // AI special move direct trigger (bypass command buffer)
    if (p2.canAct() && Math.random() < 0.02) {
      const special = p2AI.triggerSpecial();
      if (special) p2.startAttack(special);
    }
  } else {
    p2Ctrl.update(p2Input);
  }
  resolvePushbox(p1, p2);

  for (const proj of projectiles) proj.update();
  combatSystem.resolveAttacks(p1, p2, projectiles, onHit);

  // Tick throw escape window — returns true if throw escaped
  const throwEscaped = combatSystem.tickThrowState(p1, p2, onHit);
  if (throwEscaped) {
    playBlock(); // block sound for throw escape
    vfx.spawnThrowEscapeSparks(
      (p1.x + p2.x) / 2,
      (p1.y + p2.y) / 2 - 50
    );
  }

  // ── Delayed health bar decay ──
  const healthDecayRate = Math.max(p1.maxHealth, p2.maxHealth) * 0.005; // ~0.5% per frame ≈ 1-2s catchup
  if (p1DelayedHealth > p1.health) p1DelayedHealth = Math.max(p1.health, p1DelayedHealth - healthDecayRate);
  if (p2DelayedHealth > p2.health) p2DelayedHealth = Math.max(p2.health, p2DelayedHealth - healthDecayRate);

  // Check if DM was started and consume stock
  for (let i = 0; i < 2; i++) {
    const f = i === 0 ? p1 : p2;
    if (f.currentAttack === AttackType.DM_OROCHINAGI && f.attackFrame === 0 && f.attackPhase === 'startup') {
      if (canUseDM(i)) {
        useDM(i);
        // ── Super Flash: trigger dark screen on DM startup ──
        superFlashTimer = 20;
        superFlashAttacker = i;
        superFlashX = f.x;
        superFlashY = f.y - f.displayHeight / 2;
        hitStop = 20; // Freeze during flash
      } else {
        // Not enough meter → cancel the DM, do nothing
        f.endAttack();
      }
    }
  }

  // ── Super Flash for other DMs (non-OROCHINAGI) ──
  for (let i = 0; i < 2; i++) {
    const f = i === 0 ? p1 : p2;
    const atk = f.currentAttack;
    if ((atk === AttackType.DM_YATAGARASU || atk === AttackType.DM_POWER_GEYSER || atk === AttackType.DM_PHOENIX_KICK)
      && f.attackFrame === 0 && f.attackPhase === 'startup') {
      superFlashTimer = 20;
      superFlashAttacker = i;
      superFlashX = f.x;
      superFlashY = f.y - f.displayHeight / 2;
      hitStop = 20;
    }
  }

  p1Ctrl.applyPhysics();
  p2Ctrl.applyPhysics();

  // A1: Combo reset when hitstun/knockdown ends (state transitions to IDLE)
  [p1, p2].forEach((f, i) => {
    const wasInHitstun = f.prevState === FighterState.HITSTUN || f.prevState === FighterState.KNOCKDOWN;
    if (wasInHitstun && f.state === FighterState.IDLE) {
      combatSystem.resetCombo(i);
    }
    f.savePrevState();
  });

  for (let i = projectiles.length - 1; i >= 0; i--) {
    if (!projectiles[i].active) projectiles.splice(i, 1);
  }

  // MAX mode damage reduction
  // (applied inside combatSystem would be cleaner, but keeping it simple here)

  if (p1.health <= 0 || p2.health <= 0) {
    if (!koSlowMoTriggered) {
      // Trigger KO slow-mo first time
      koSlowMoTriggered = true;
      koSlowMo = 40;
      koSlowMoFrameCounter = 0;
      vfx.spawnHitSparks((p1.x + p2.x) / 2, 380, 20);
      screenShake.trigger(12, 15);
      playKO();
    } else if (koSlowMo <= 0) {
      // Slow-mo finished — transition to KO phase
      phase = GamePhase.KO; koTimer = 0;
      winner = p1.health <= 0 && p2.health <= 0 ? null : p1.health <= 0 ? 1 : 0;
    }
  }
  if (tickRef.value >= 60 * 60) {
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
    renderer.drawCharacterSelect(p1SelectCursor, p2SelectCursor, p1Ready, p2Ready, tickRef.value, p2IsAI);
    return;
  }

  camera.update(p1, p2);
  const isKO = phase === GamePhase.KO;
  // PERFECT: winner took zero damage (health still at MAX)
  const perfectPlayer = isKO && winner !== null
    ? (winner === 0 ? (p2DamageTaken === 0 ? 0 : null) : (p1DamageTaken === 0 ? 1 : null))
    : null;
  renderer.render([p1, p2], camera.x, tickRef.value, isKO, winner, screenShake.offsetX, screenShake.offsetY, [p1DelayedHealth, p2DelayedHealth], maxModes, perfectPlayer);
  renderer.drawProjectiles(projectiles, camera);
  vfx.render(ctx, camera.x);

  // ── Super Flash dark overlay ──
  if (superFlashTimer > 0) {
    const flashType = maxModes[superFlashAttacker].active ? 'SDM' : 'DM';
    renderer.drawSuperFlash(ctx, superFlashTimer, superFlashX - camera.x, superFlashY, flashType);
  }

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
  p2AI = null;
  hitStop = 0;
  superFlashTimer = 0;
  koSlowMo = 0;
  koSlowMoTriggered = false;
  koSlowMoFrameCounter = 0;
  superFlashAttacker = 0;
  p1DamageTaken = 0;
  p2DamageTaken = 0;
  p1.reset(STAGE_WIDTH * 0.33);
  p2.reset(STAGE_WIDTH * 0.67);
  p1Cmd.reset();
  p2Cmd.reset();
  combatSystem.reset();
  projectiles.length = 0;
  vfx.reset();
  p1DelayedHealth = p1.maxHealth;
  p2DelayedHealth = p2.maxHealth;
  resetMeterSystem(gauges[0], maxModes[0]);
  resetMeterSystem(gauges[1], maxModes[1]);
}

// ===== F1 Toggle =====
let f1Down = false;
window.addEventListener('keydown', e => {
  initAudio(); // Initialize audio on first user interaction
  if (e.code === 'F1') { e.preventDefault(); if (!f1Down) { f1Down = true; debugMode = !debugMode; } }
});
window.addEventListener('keyup', e => { if (e.code === 'F1') f1Down = false; });

// ===== Start =====
new GameLoop(update, render).start();
console.log('KOF 2002 POC initialized');
