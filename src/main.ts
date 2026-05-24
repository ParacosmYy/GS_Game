/**
 * KOF 2002 — Entry point
 * Pure initialization + game loop. All logic delegated to focused modules.
 */
import { GameLoop } from './core/gameLoop.js';
import { Camera } from './core/camera.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, STAGE_WIDTH, STAGE_GROUND_Y, KO_DISPLAY_TIME } from './core/constants.js';
import { GamePhase, FighterState } from './core/types.js';
import type { PowerGauge, MaxModeState } from './core/types.js';
import { InputManager, CommandBuffer, resolveInput, getDirectionInput } from './input/index.js';
import { Fighter } from './entities/fighter.js';
import { Projectile } from './entities/projectile.js';
import { FighterController, resolvePushbox } from './entities/fighterController.js';
import { CombatSystem } from './combat/combatSystem.js';
import { createPowerGauge, createMaxMode, tickMaxMode, tickAutoMeter } from './combat/meter.js';
import { Renderer } from './rendering/renderer.js';
import { VFXSystem, ScreenShake } from './rendering/vfx.js';
import { drawVictoryPose } from './rendering/skeletalFighter.js';
import { ROSTER } from './characters/index.js';
import { CinematicState } from './state/cinematicState.js';
import { SelectState } from './state/selectState.js';
import { RoundState } from './state/roundState.js';
import { DMManager } from './combat/dmManager.js';
import { createHitCallback } from './combat/hitCallback.js';
import { initAudio, playKO, playVictoryFanfare } from './audio/sfx.js';
import { resolveSimplified } from './input/simplifiedInput.js';
import { bgm } from './audio/bgm.js';
import { announcer } from './audio/announcer.js';

// ===== Canvas =====
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// ===== Systems =====
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
const gauges: [PowerGauge, PowerGauge] = [createPowerGauge(), createPowerGauge()];
const maxModes: [MaxModeState, MaxModeState] = [createMaxMode(), createMaxMode()];
p1Ctrl.setGauge(gauges[0]);
p2Ctrl.setGauge(gauges[1]);
p1Ctrl.setMaxMode(maxModes[0]);
p2Ctrl.setMaxMode(maxModes[1]);

// ===== State modules =====
const cinematic = new CinematicState();
const select = new SelectState(p1Ctrl, p2Ctrl, p1, p2, p2Cmd);
const rounds = new RoundState({ p1, p2, p1Cmd, p2Cmd, combatSystem, projectiles, vfx, cinematic, gauges, maxModes, tickRef });
const dmMgr = new DMManager({ gauges, maxModes, cinematic, vfx, screenShake, fighters: [p1, p2] });
const onHit = createHitCallback({ fighters: [p1, p2], vfx, screenShake, gauges, cinematic, combatSystem });

// ===== Game state =====
let phase: GamePhase = GamePhase.SELECT;
let phaseTimer = 0;
let koTimer = 0;
let winner: number | null = null;
let debugMode = false;
let simplifiedMode = false; // Tab to toggle
let modeIndicatorTimer = 0;
let p2AI: InstanceType<typeof import('./ai/simpleAI.js').SimpleAI> | null = null;
const INTRO_DURATION = 120;
let p1DelayedHealth = p1.maxHealth;
let p2DelayedHealth = p2.maxHealth;

// ===== Update =====
function update(): void {
  vfx.update();
  screenShake.update();

  if (phase === GamePhase.SELECT) {
    tickRef.value++;
    const result = select.update(inputManager.getP1Input(), inputManager.getP2Input(), inputManager.isKeyDown('KeyT'));
    if (result) {
      p2AI = result.p2AI;
      phase = GamePhase.INTRO;
      phaseTimer = 0;
      rounds.currentRound = 1;
      p1DelayedHealth = p1.maxHealth;
      p2DelayedHealth = p2.maxHealth;
      p1.savePrevState();
      p2.savePrevState();
      announcer.roundStart(1);
      announcer.fight();
    }
    return;
  }

  if (phase === GamePhase.INTRO) {
    phaseTimer++;
    if (phaseTimer >= INTRO_DURATION) { phase = GamePhase.FIGHTING; tickRef.value = 0; modeIndicatorTimer = 180; bgm.start(); }
    return;
  }

  if (phase === GamePhase.KO) {
    koTimer++;
    if (koTimer > KO_DISPLAY_TIME) {
      const matchWinner = rounds.addWin(winner);
      if (matchWinner !== null) {
        phase = GamePhase.MATCH_END;
        koTimer = 0;
        announcer.winner();
      } else {
        rounds.startRoundTransition();
      }
    }
    if (koTimer <= KO_DISPLAY_TIME && inputManager.isKeyDown('KeyR')) restartGame();
    return;
  }

  if (phase === GamePhase.MATCH_END) {
    koTimer++;
    if (!cinematic.victoryFanfarePlayed) { cinematic.victoryFanfarePlayed = true; playVictoryFanfare(); }
    if (koTimer > 180 || (koTimer > 60 && (inputManager.isKeyDown('KeyR') || inputManager.isKeyDown('KeyJ') || inputManager.isKeyDown('Enter'))))
      restartGame();
    return;
  }

  // === FIGHTING phase ===
  if (cinematic.isFrozen()) { cinematic.tickInFreeze(maxModes); return; }
  cinematic.tickMaxModes(maxModes);
  cinematic.tickSuperFlash();
  tickRef.value++;
  tickAutoMeter(gauges);

  if (cinematic.shouldSkipFrame()) return;

  const rawP1 = inputManager.getP1Input();
  const rawP2 = inputManager.getP2Input();
  p1.updateFacing(p2);
  p2.updateFacing(p1);
  const p1Input = resolveInput(rawP1, p1.facing, combatSystem.getPrevAttack(0));
  const p2Input = resolveInput(rawP2, p2.facing, combatSystem.getPrevAttack(1));
  combatSystem.updateEdgeTracking(rawP1, rawP2);
  dmMgr.checkMaxActivation(p1Input, 0);
  dmMgr.checkMaxActivation(p2Input, 1);
  p1Cmd.record(getDirectionInput(p1Input), tickRef.value);
  p2Cmd.record(getDirectionInput(p2Input), tickRef.value);

  // Simplified mode: U/I/O trigger character-specific specials directly
  if (simplifiedMode && !p1.currentAttack && p1.canAct()) {
    const p1Char = ROSTER.find(c => c.id === p1.charId) || ROSTER[0];
    const simp = resolveSimplified(
      !!rawP1.buttonC && combatSystem.getPrevAttack(0) === null,
      !!rawP1.buttonD && combatSystem.getPrevAttack(0) === null,
      !!rawP1.throwAttack && combatSystem.getPrevAttack(0) === null,
      p1Char, gauges[0], maxModes[0],
    );
    if (simp.activateMax) dmMgr.checkMaxActivation(p1Input, 0);
    if (simp.attack) p1.startAttack(simp.attack);
  }

  p1Ctrl.update(p1Input);
  if (p2AI) {
    const aiInput = p2AI.getInput();
    p2Ctrl.update(aiInput);
    if (p2.canAct() && Math.random() < 0.02) { const s = p2AI.triggerSpecial(); if (s) p2.startAttack(s); }
  } else {
    p2Ctrl.update(p2Input);
  }

  resolvePushbox(p1, p2);
  for (const proj of projectiles) proj.update();
  combatSystem.resolveAttacks(p1, p2, projectiles, onHit);
  combatSystem.tickThrowState(p1, p2, onHit);

  const healthDecay = Math.max(p1.maxHealth, p2.maxHealth) * 0.005;
  if (p1DelayedHealth > p1.health) p1DelayedHealth = Math.max(p1.health, p1DelayedHealth - healthDecay);
  if (p2DelayedHealth > p2.health) p2DelayedHealth = Math.max(p2.health, p2DelayedHealth - healthDecay);

  dmMgr.checkDMActivation();
  p1Ctrl.applyPhysics();
  p2Ctrl.applyPhysics();

  [p1, p2].forEach((f, i) => {
    const wasStun = f.prevState === FighterState.HITSTUN || f.prevState === FighterState.KNOCKDOWN;
    if (wasStun && f.state === FighterState.IDLE) combatSystem.resetCombo(i);
    f.savePrevState();
  });

  for (let i = projectiles.length - 1; i >= 0; i--) { if (!projectiles[i].active) projectiles.splice(i, 1); }

  if (p1.health <= 0 || p2.health <= 0) {
    if (!cinematic.koSlowMoTriggered) {
      cinematic.triggerKOSlowMo();
      vfx.spawnHitSparks((p1.x + p2.x) / 2, STAGE_GROUND_Y - 100, 20);
      screenShake.trigger(12, 15);
      playKO();
      bgm.stop();
      announcer.knockOut();
    } else if (cinematic.isKOSlowMoDone()) {
      phase = GamePhase.KO;
      koTimer = 0;
      winner = rounds.determineWinner();
      if (winner !== null && cinematic.getPerfectPlayer(winner) !== null) announcer.perfect();
    }
  }

  if (tickRef.value >= 3600) {
    phase = GamePhase.KO;
    koTimer = 0;
    winner = rounds.determineWinner();
    screenShake.trigger(8, 10);
    bgm.stop();
    announcer.timeOver();
  }
}

// ===== Render =====
function render(): void {
  if (phase === GamePhase.SELECT) {
    renderer.drawCharacterSelect(select.p1Cursor, select.p2Cursor, select.p1Ready, select.p2Ready, tickRef.value, select.p2IsAI, simplifiedMode);
    return;
  }
  rounds.tickFade();
  camera.update(p1, p2);
  const isKO = phase === GamePhase.KO || phase === GamePhase.MATCH_END;
  const perfectPlayer = isKO ? cinematic.getPerfectPlayer(winner) : null;
  const p1Char = ROSTER.find(c => c.id === p1.charId) || ROSTER[0];
  const p2Char = ROSTER.find(c => c.id === p2.charId) || ROSTER[1];
  renderer.render([p1, p2], camera.x, tickRef.value, phase === GamePhase.KO, winner, screenShake.offsetX, screenShake.offsetY,
    [p1DelayedHealth, p2DelayedHealth], maxModes, perfectPlayer, rounds.p1Wins, rounds.p2Wins, p1Char.nameCn, p2Char.nameCn);
  renderer.drawProjectiles(projectiles, camera);
  vfx.render(ctx, camera.x);

  if (cinematic.superFlashTimer > 0)
    renderer.drawSuperFlash(ctx, cinematic.superFlashTimer, cinematic.superFlashX - camera.x, cinematic.superFlashY, maxModes[cinematic.superFlashAttacker].active ? 'SDM' : 'DM');
  renderer.drawPowerGauges(gauges, maxModes);
  if (phase === GamePhase.INTRO) renderer.drawIntro(phaseTimer, rounds.currentRound);
  renderer.drawComboCounters([p1, p2], [combatSystem.getComboCount(0), combatSystem.getComboCount(1)], [0, 0], camera);
  renderer.drawControlsHint(simplifiedMode, p1.charId);

  if (phase === GamePhase.MATCH_END) {
    if (winner !== null) { const w = winner === 0 ? p1 : p2; drawVictoryPose(ctx, w.x - camera.x, w.y, w.facing, w.color, '#ffffff30', tickRef.value, w.charId); }
    renderer.drawMatchEnd(winner, rounds.p1Wins, rounds.p2Wins);
  }
  if (rounds.fadeAlpha > 0) { ctx.fillStyle = `rgba(0,0,0,${rounds.fadeAlpha})`; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  // Control mode indicator badge
  if (modeIndicatorTimer > 0) {
    renderer.drawModeIndicator(simplifiedMode, Math.min(1, modeIndicatorTimer / 60));
    modeIndicatorTimer--;
  }
  if (debugMode) renderer.drawDebug([p1, p2], projectiles, camera, tickRef.value, renderer.getFps(), vfx.count, [p1Cmd, p2Cmd]);
}

// ===== Restart =====
function restartGame(): void {
  bgm.stop();
  phase = GamePhase.SELECT;
  phaseTimer = 0;
  koTimer = 0;
  winner = null;
  tickRef.value = 0;
  select.reset();
  p2AI = null;
  cinematic.reset();
  rounds.fullReset();
  p1DelayedHealth = p1.maxHealth;
  p2DelayedHealth = p2.maxHealth;
}

// ===== Events =====
let f1Down = false;
window.addEventListener('keydown', e => {
  initAudio();
  if (e.code === 'F1') { e.preventDefault(); if (!f1Down) { f1Down = true; debugMode = !debugMode; } }
  if (e.code === 'KeyM') announcer.toggle();
  if (e.code === 'KeyB') bgm.toggle();
  if (e.code === 'Tab') { e.preventDefault(); simplifiedMode = !simplifiedMode; modeIndicatorTimer = 120; }
});
window.addEventListener('keyup', e => { if (e.code === 'F1') f1Down = false; });

// ===== Start =====
new GameLoop(update, render).start();
console.log('KOF 2002 initialized');
