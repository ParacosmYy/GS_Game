/**
 * KOF 2002 — Entry point
 * Pure initialization + game loop. All logic delegated to focused modules.
 */
import { GameLoop } from './core/gameLoop.js';
import { Camera } from './core/camera.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, STAGE_WIDTH, STAGE_GROUND_Y, KO_DISPLAY_TIME, MAX_STOCKS, METER_PER_STOCK, FRAME_DATA } from './core/constants.js';
import { GamePhase, FighterState } from './core/types.js';
import type { PowerGauge, MaxModeState } from './core/types.js';
import { InputManager, CommandBuffer, resolveInput, getDirectionInput } from './input/index.js';
import { Fighter } from './entities/fighter.js';
import { Projectile } from './entities/projectile.js';
import { FighterController, resolvePushbox } from './entities/fighterController.js';
import { CombatSystem } from './combat/combatSystem.js';
import { createPowerGauge, createMaxMode, tickMaxMode, tickAutoMeter, gainMeterOnHit, drainMeterByTaunt } from './combat/meter.js';
import { Renderer } from './rendering/renderer.js';
import { VFXSystem, ScreenShake, ScreenFlash } from './rendering/vfx.js';
import { cycleStage, setStage, getStage, type StageId } from './rendering/stage.js';
import { drawVictoryPose } from './rendering/skeletalFighter.js';
import type { TeamDisplayInfo } from './rendering/hud.js';
import { ROSTER } from './characters/index.js';
import { SpriteManager, SpriteRenderer } from './rendering/spriteRenderer.js';
import { generatePlaceholderSpritesheet } from './rendering/placeholderSprites.js';
import { CinematicState } from './state/cinematicState.js';
import { SelectState } from './state/selectState.js';
import { RoundState } from './state/roundState.js';
import { DMManager } from './combat/dmManager.js';
import { createHitCallback, triggerKOGroundEffect } from './combat/hitCallback.js';
import { initAudio, initSampler, playKO, playVictoryFanfare, playMAXActivation, playPerfect, playThrowEscape, playFight, playRoll, playCancel, playQuickStand, playGuardCrush } from './audio/sampler.js';
import { createTeam, defeatActive, switchToNext, activeChar, teamOrderString, type TeamState } from './state/teamState.js';
import { resolveSimplified } from './input/simplifiedInput.js';
import { bgm } from './audio/bgm.js';
import { AmbientSoundPlayer } from './audio/ambient.js';
import { announcer } from './audio/announcer.js';
import { SimpleAI } from './ai/simpleAI.js';
import { updateMovementVfx } from './state/movementVfx.js';
import { WIN_QUOTE_DURATION, drawAnnounceSequence } from './rendering/screens.js';
import { GameStateManager } from './state/gameStateManager.js';
import { gameRandom, gameRandomInt } from './core/prng.js';
import { InputLogger } from './core/inputLog.js';
import { ReplaySession } from './core/replaySession.js';
import { createRoundStartSequence, createKOSequence, createTimeOverSequence, createWinnerSequence } from './state/announcePresets.js';

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
const gs = new GameStateManager();

// ===== Sprite System =====
const spriteManager = new SpriteManager();
const spriteRenderer = new SpriteRenderer(spriteManager);
for (const char of ROSTER) {
  const sheet = generatePlaceholderSpritesheet(char.color, char.id);
  spriteManager.register(char.id, '', sheet.animations);
  const asset = spriteManager.get(char.id);
  if (asset) { asset.image = sheet.image; asset.loaded = true; }
}
renderer.setSpriteRenderer(spriteRenderer);
const screenShake = new ScreenShake();
const screenFlash = new ScreenFlash();

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
combatSystem.defenderControllers = [p1Ctrl, p2Ctrl];
const gauges: [PowerGauge, PowerGauge] = [createPowerGauge(), createPowerGauge()];
const maxModes: [MaxModeState, MaxModeState] = [createMaxMode(), createMaxMode()];
p1Ctrl.setGauge(gauges[0]);
p2Ctrl.setGauge(gauges[1]);
p1Ctrl.setMaxMode(maxModes[0]);
p2Ctrl.setMaxMode(maxModes[1]);

// ===== State modules =====
const cinematic = new CinematicState();
const inputLog = new InputLogger();
const select = new SelectState(p1Ctrl, p2Ctrl, p1, p2, p2Cmd);
const rounds = new RoundState({ p1, p2, p1Cmd, p2Cmd, combatSystem, projectiles, vfx, cinematic, gauges, maxModes, tickRef });
const dmMgr = new DMManager({ gauges, maxModes, cinematic, vfx, screenShake, fighters: [p1, p2] });
const replaySession = new ReplaySession(inputLog);
const ambient = new AmbientSoundPlayer();
const onHit = createHitCallback({ fighters: [p1, p2], vfx, screenShake, screenFlash, gauges, cinematic, combatSystem });
combatSystem.onThrowEscape = (_attacker, defender, hitX, hitY) => {
  vfx.spawnThrowEscapeSparks(hitX, hitY); vfx.spawnTechText(hitX, hitY - 40);
  screenShake.trigger(6, 8); screenFlash.trigger('#aaddff', 0.1, 3); playThrowEscape();
  const atkIdx = _attacker === p1 ? 0 : 1;
  const defIdx = defender === p1 ? 0 : 1;
  gauges[atkIdx].meter = Math.min(gauges[atkIdx].meter + 8, MAX_STOCKS * METER_PER_STOCK);
  gauges[defIdx].meter = Math.min(gauges[defIdx].meter + 8, MAX_STOCKS * METER_PER_STOCK);
};
combatSystem.onGuardCrush = (fighter, hitX, hitY) => {
  vfx.spawnGuardCrushSparks(hitX, hitY); vfx.spawnGuardCrushText(hitX, hitY - 60); vfx.spawnHeavyDust(fighter.x, fighter.y, 14);
  screenFlash.trigger('#ff4444', 0.3, 12); screenShake.trigger(12, 15); playGuardCrush();
};

// ===== Derived state =====
const CONTINUE_DURATION = 600;
const INTRO_DURATION = 150;
let p2AI: InstanceType<typeof import('./ai/simpleAI.js').SimpleAI> | null = null;
let p1Team: TeamState | null = null;
let p2Team: TeamState | null = null;
let p1DelayedHealth = p1.maxHealth;
let p2DelayedHealth = p2.maxHealth;

function pickWinQuote(w: number | null): string {
  if (w === null) return '';
  const fighter = w === 0 ? p1 : p2;
  const charDef = ROSTER.find(c => c.id === fighter.charId);
  if (!charDef || !charDef.winQuotes.length) return '';
  return charDef.winQuotes[gameRandomInt(charDef.winQuotes.length)];
}

// ===== Update =====
function update(): void {
  vfx.update();
  screenShake.update();
  screenFlash.update();

  if (gs.phase === GamePhase.TITLE) {
    tickRef.value++;
    // Start title BGM on first frame of TITLE phase
    if (!gs.titleBgmStarted) {
      gs.titleBgmStarted = true;
      bgm.start('title');
    }
    if (inputManager.isKeyDown('Enter') || inputManager.isKeyDown('KeyJ') || inputManager.isKeyDown('KeyR')) {
      bgm.stop();
      gs.titleBgmStarted = false;
      gs.setPhase(GamePhase.MODE_SELECT);
      gs.modeSelectCursor = 0;
      initAudio();
    }
    return;
  }

  if (gs.phase === GamePhase.MODE_SELECT) {
    tickRef.value++;
    if (inputManager.isKeyDown('ArrowLeft') || inputManager.isKeyDown('KeyA')) gs.modeSelectCursor = Math.max(0, gs.modeSelectCursor - 1);
    if (inputManager.isKeyDown('ArrowRight') || inputManager.isKeyDown('KeyD')) gs.modeSelectCursor = Math.min(2, gs.modeSelectCursor + 1);
    if (inputManager.isKeyDown('Enter') || inputManager.isKeyDown('KeyJ')) {
      gs.teamMode = gs.modeSelectCursor === 1;
      gs.isTrainingMode = gs.modeSelectCursor === 2;
      gs.setPhase(GamePhase.SELECT);
    }
    return;
  }

  if (gs.phase === GamePhase.CONTINUE) {
    tickRef.value++;
    gs.continueCountdown--;
    if (inputManager.isKeyDown('ArrowLeft')) gs.continueCursorYes = true;
    if (inputManager.isKeyDown('ArrowRight')) gs.continueCursorYes = false;
    if (inputManager.isKeyDown('KeyJ') || inputManager.isKeyDown('Enter')) {
      if (gs.continueCursorYes) {
        gs.setPhase(GamePhase.INTRO);
        gs.phaseTimer = 0;
        rounds.currentRound = 1;
        rounds.fullReset();
        cinematic.reset();
        p1DelayedHealth = p1.maxHealth;
        p2DelayedHealth = p2.maxHealth;
        p1.savePrevState();
        p2.savePrevState();
        gs.announceSequence.setSteps(createRoundStartSequence(1));
        announcer.roundStart(1);
        announcer.fight();
      } else {
        gs.setPhase(GamePhase.TITLE);
      }
    }
    if (gs.continueCountdown <= 0) {
      gs.setPhase(GamePhase.TITLE);
    }
    return;
  }

  if (gs.phase === GamePhase.SELECT) {
    tickRef.value++;
    const result = select.update(inputManager.getP1Input(), inputManager.getP2Input(), inputManager.isKeyDown('KeyT'));
    if (result) {
      p2AI = gs.isTrainingMode ? null : result.p2AI;
      if (gs.teamMode) {
        p1Team = createTeam(result.p1Team);
        p2Team = createTeam(result.p2Team);
      }
      gs.setPhase(GamePhase.INTRO);
      gs.phaseTimer = 0;
      initAudio();
      initSampler();
      rounds.currentRound = 1;
      gs.isTimeOver = false;
      p1DelayedHealth = p1.maxHealth;
      p2DelayedHealth = p2.maxHealth;
      p1.savePrevState();
      p2.savePrevState();
      gs.announceSequence.setSteps(createRoundStartSequence(1));
      announcer.roundStart(1);
      announcer.fight();
    }
    return;
  }

  if (gs.phase === GamePhase.INTRO) {
    gs.phaseTimer++;
    // Tick announce sequence, play SFX on trigger frames
    if (gs.announceSequence.isRunning()) {
      const sfxId = gs.announceSequence.tick();
      if (sfxId === 'fight') {
        playFight();
        screenFlash.trigger('#ffffff', 0.2, 6);
      } else if (sfxId === 'round_call') {
        announcer.roundStart(rounds.currentRound);
      }
    }
    // Transition to FIGHTING when announce sequence completes (or fallback timer)
    const announceDone = gs.announceSequence.isComplete();
    if (announceDone || gs.phaseTimer >= INTRO_DURATION) {
      gs.setPhase(GamePhase.FIGHTING);
      tickRef.value = 0;
      const replaySeed = Date.now() & 0xFFFF;
      const replayLabel = `${p1.charId} vs ${p2.charId} - round ${rounds.currentRound}`;
      replaySession.beginLiveMatch({
        seed: replaySeed,
        label: replayLabel,
        round: rounds.currentRound,
        p1CharId: p1.charId,
        p2CharId: p2.charId,
        stageId: getStage(),
        teamMode: gs.teamMode,
        trainingMode: gs.isTrainingMode,
      });
      gs.modeIndicatorTimer = 180;
      gs.firstHitTracked = false;
      gs.firstAttacker = null;
      gs.koGroundSlamDone = false;
      bgm.start();
      ambient.start(getStage());
    }
    return;
  }

  if (gs.phase === GamePhase.KO) {
    gs.koTimer++;
    // Tick announce sequence for KO/TIME OVER text animation
    if (gs.announceSequence.isRunning()) {
      const sfxId = gs.announceSequence.tick();
      if (sfxId === 'ko') {
        // KO SFX already played during cinematic slow-mo, no replay needed
      } else if (sfxId === 'time_over') {
        // TIME OVER SFX already played on phase entry, no replay needed
      } else if (sfxId === 'perfect') {
        playPerfect();
        announcer.perfect();
      }
    }
    // Transition to WIN_QUOTE when announce sequence completes (or fallback timer)
    const announceDone = gs.announceSequence.isComplete();
    if (announceDone || gs.koTimer > KO_DISPLAY_TIME) {
      // Reset announce sequence so it doesn't render in next phase
      gs.announceSequence.reset();
      gs.currentWinQuote = pickWinQuote(gs.winner);
      if (gs.winner !== null) {
        const fighter = gs.winner === 0 ? p1 : p2;
        const charDef = ROSTER.find(c => c.id === fighter.charId);
        gs.winQuoteCharName = charDef?.nameCn ?? '';
        gs.winQuoteCharColor = charDef?.color ?? '#ffcc00';
      } else {
        gs.winQuoteCharName = '';
        gs.winQuoteCharColor = '#ffcc00';
      }
      gs.setPhase(GamePhase.WIN_QUOTE);
      gs.winQuoteTimer = 0;
    }
    if (gs.koTimer <= KO_DISPLAY_TIME && inputManager.isKeyDown('KeyR')) restartGame();
    return;
  }

  if (gs.phase === GamePhase.WIN_QUOTE) {
    gs.winQuoteTimer++;
    if (gs.winQuoteTimer >= WIN_QUOTE_DURATION) {
      if (gs.teamMode && p1Team && p2Team && gs.winner !== null) {
        const loserTeam = gs.winner === 0 ? p2Team : p1Team;
        const hasAlive = defeatActive(loserTeam);
        if (hasAlive && switchToNext(loserTeam)) {
          const losingIdx = gs.winner === 0 ? 1 : 0;
          const newChar = activeChar(loserTeam);
          const loser = losingIdx === 0 ? p1 : p2;
          const loserCtrl = losingIdx === 0 ? p1Ctrl : p2Ctrl;
          loser.charId = newChar.id;
          loser.color = newChar.color;
          loser.setStats(newChar.stats);
          loserCtrl.setCharacter(newChar);
          if (p2AI && losingIdx === 1) {
            p2AI = new SimpleAI(p2, p1, newChar, 0.6);
          }
          rounds.currentRound++;
          rounds.resetForNextRound();
          gs.setPhase(GamePhase.INTRO);
          gs.phaseTimer = 0;
          p1DelayedHealth = p1.maxHealth;
          p2DelayedHealth = p2.maxHealth;
          cinematic.reset();
          gs.announceSequence.setSteps(createRoundStartSequence(rounds.currentRound));
          announcer.roundStart(rounds.currentRound);
          announcer.fight();
          return;
        }
        if (!p1Team.alive || !p2Team.alive) {
          gs.setPhase(GamePhase.MATCH_END);
          gs.koTimer = 0;
          announcer.winner();
          {
            const matchWinner = !p1Team.alive ? 1 : 0;
            const wf = matchWinner === 0 ? p1 : p2;
            const wc = ROSTER.find(c => c.id === wf.charId);
            gs.announceSequence.setSteps(createWinnerSequence(wc?.nameCn ?? ''));
          }
          return;
        }
      }
      const matchWinner = rounds.addWin(gs.winner);
      if (matchWinner !== null) {
        gs.setPhase(GamePhase.MATCH_END);
        gs.koTimer = 0;
        announcer.winner();
        {
          const wf = matchWinner === 0 ? p1 : p2;
          const wc = ROSTER.find(c => c.id === wf.charId);
          gs.announceSequence.setSteps(createWinnerSequence(wc?.nameCn ?? ''));
        }
      } else {
        rounds.currentRound++;
        rounds.resetForNextRound();
        gs.setPhase(GamePhase.INTRO);
        gs.phaseTimer = 0;
        gs.isTimeOver = false;
        gs.koGroundSlamDone = false;
        p1DelayedHealth = p1.maxHealth;
        p2DelayedHealth = p2.maxHealth;
        gs.announceSequence.setSteps(createRoundStartSequence(rounds.currentRound));
        announcer.roundStart(rounds.currentRound);
        announcer.fight();
      }
    }
    if (inputManager.isKeyDown('KeyR')) restartGame();
    return;
  }

  if (gs.phase === GamePhase.MATCH_END) {
    gs.koTimer++;
    if (!cinematic.victoryFanfarePlayed) { cinematic.victoryFanfarePlayed = true; playVictoryFanfare(); }
    // Tick announce sequence for winner name animation
    if (gs.announceSequence.isRunning()) {
      const sfxId = gs.announceSequence.tick();
      if (sfxId === 'victory') {
        // Victory fanfare already played above, announce sequence is visual only
      }
    }
    if (gs.koTimer > 180 || (gs.koTimer > 60 && (inputManager.isKeyDown('KeyR') || inputManager.isKeyDown('KeyJ') || inputManager.isKeyDown('Enter')))) {
      gs.announceSequence.reset();
      gs.setPhase(GamePhase.CONTINUE);
      gs.continueCountdown = CONTINUE_DURATION;
      gs.continueCursorYes = true;
    }
    return;
  }

  // === FIGHTING phase ===
  if (gs.isTrainingMode && inputManager.isKeyDown('Escape')) {
    bgm.stop(); ambient.stop(); gs.setPhase(GamePhase.SELECT); select.reset(); p2AI = null; gs.isTrainingMode = true; return;
  }
  if (cinematic.isFrozen()) { cinematic.tickInFreeze(maxModes); return; }
  cinematic.tickMaxModes(maxModes);
  cinematic.tickSuperFlash();
  tickRef.value++;
  tickAutoMeter(gauges);
  if (cinematic.shouldSkipFrame()) return;
  const rawP1 = inputManager.getP1Input();
  const rawP2 = inputManager.getP2Input();
  inputLog.record(tickRef.value, rawP1, rawP2);
  p1.updateFacing(p2);
  p2.updateFacing(p1);
  const p1Input = resolveInput(rawP1, p1.facing, combatSystem.getPrevAttack(0));
  const p2Input = resolveInput(rawP2, p2.facing, combatSystem.getPrevAttack(1));
  combatSystem.updateEdgeTracking(rawP1, rawP2);
  dmMgr.checkMaxActivation(p1Input, 0);
  dmMgr.checkMaxActivation(p2Input, 1);
  if (maxModes[0].active && maxModes[0].timer === maxModes[0].maxDuration - 1) {
    playMAXActivation(); screenFlash.trigger('#44ff88', 0.3, 8);
    vfx.spawnMAXActivationFlash(p1.x, p1.y - p1.displayHeight / 2); vfx.spawnHeavyDust(p1.x, p1.y, 8);
    p1.invincible = true; p1.throwInvulnFrames = 5;
  }
  if (maxModes[1].active && maxModes[1].timer === maxModes[1].maxDuration - 1) {
    playMAXActivation(); screenFlash.trigger('#44ff88', 0.3, 8);
    vfx.spawnMAXActivationFlash(p2.x, p2.y - p2.displayHeight / 2); vfx.spawnHeavyDust(p2.x, p2.y, 8);
    p2.invincible = true; p2.throwInvulnFrames = 5;
  }
  p1Cmd.record(getDirectionInput(p1Input), tickRef.value);
  p2Cmd.record(getDirectionInput(p2Input), tickRef.value);
  if (p1Input.punchPressed) p1Cmd.recordPress('punch', tickRef.value);
  if (p1Input.kickPressed) p1Cmd.recordPress('kick', tickRef.value);
  if (p1Input.punchJustReleased) p1Cmd.recordRelease('punch', tickRef.value);
  if (p1Input.kickJustReleased) p1Cmd.recordRelease('kick', tickRef.value);
  if (p2Input.punchPressed) p2Cmd.recordPress('punch', tickRef.value);
  if (p2Input.kickPressed) p2Cmd.recordPress('kick', tickRef.value);
  if (p2Input.punchJustReleased) p2Cmd.recordRelease('punch', tickRef.value);
  if (p2Input.kickJustReleased) p2Cmd.recordRelease('kick', tickRef.value);
  if (gs.simplifiedMode && !p1.currentAttack && p1.canAct()) {
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
    p2AI.gauge = gauges[1];
    p2AI.maxMode = maxModes[1];
    const aiInput = p2AI.getInput();
    p2Ctrl.update(aiInput);
    if (p2.canAct() && gameRandom() < 0.02) { const s = p2AI.triggerSpecial(); if (s) p2.startAttack(s); }
  } else if (gs.isTrainingMode) {
    const dummyInput = { ...p2Input };
    if (p1.attackPhase === 'active' && p2.canBlock()) {
      if (p1.x < p2.x) dummyInput.back = true;
      else dummyInput.forward = true;
    }
    p2Ctrl.update(dummyInput);
  } else {
    p2Ctrl.update(p2Input);
  }

  resolvePushbox(p1, p2);

  // KOF2002: Taunt meter drain — 嘲讽峰值帧(第20帧)削减对手气槽
  if (p1.state === FighterState.TAUNT && p1.tauntTimer === Math.floor(Fighter.TAUNT_DURATION / 2)) {
    drainMeterByTaunt(gauges[1]); vfx.spawnTauntSparks(p1.x, p1.y - p1.displayHeight * 0.7);
  }
  if (p2.state === FighterState.TAUNT && p2.tauntTimer === Math.floor(Fighter.TAUNT_DURATION / 2)) {
    drainMeterByTaunt(gauges[0]); vfx.spawnTauntSparks(p2.x, p2.y - p2.displayHeight * 0.7);
  }

  for (const proj of projectiles) proj.update();
  combatSystem.resolveAttacks(p1, p2, projectiles, onHit, tickRef.value, [maxModes[0].active, maxModes[1].active]);
  combatSystem.tickComboTimeout(tickRef.value);
  combatSystem.tickThrowState(p1, p2, onHit);

  if (!gs.firstHitTracked && (combatSystem.getComboCount(0) > 0 || combatSystem.getComboCount(1) > 0)) {
    gs.firstHitTracked = true;
    const hitterIdx = combatSystem.getComboCount(0) > 0 ? 0 : 1;
    gs.firstAttacker = hitterIdx;
    const hitter = hitterIdx === 0 ? p1 : p2;
    vfx.spawnFirstAttackText(hitter.x, hitter.y - hitter.displayHeight - 40);
    announcer.firstAttack();
    if (gauges[hitterIdx]) {
      gainMeterOnHit(gauges[hitterIdx]);
    }
  }

  const healthDecay = Math.max(p1.maxHealth, p2.maxHealth) * 0.005;
  if (p1DelayedHealth > p1.health) p1DelayedHealth = Math.max(p1.health, p1DelayedHealth - healthDecay);
  if (p2DelayedHealth > p2.health) p2DelayedHealth = Math.max(p2.health, p2DelayedHealth - healthDecay);

  dmMgr.checkDMActivation();
  p1Ctrl.applyPhysics();
  p2Ctrl.applyPhysics();

  [p1, p2].forEach((f, i) => {
    const wasStun = f.prevState === FighterState.HITSTUN || f.prevState === FighterState.KNOCKDOWN;
    if (wasStun && f.state === FighterState.IDLE) {
      const lastCombo = combatSystem.getComboCount(i);
      if (lastCombo >= 3) {
        const lastDmg = combatSystem.getComboDamage(i);
        vfx.spawnComboEndText(f.x, f.y - f.displayHeight - 50, lastCombo);
        vfx.spawnComboDamageText(f.x, f.y - f.displayHeight - 50, lastDmg);
      }
      if (lastCombo >= 2) {
        const opp = i === 0 ? p2 : p1;
        vfx.spawnDust(opp.x, STAGE_GROUND_Y);
      }
      combatSystem.resetCombo(i);
    }
    if (f.prevState === FighterState.BLOCK && f.state === FighterState.IDLE) vfx.spawnDust(f.x, STAGE_GROUND_Y);
    if (f.prevState === FighterState.KNOCKDOWN && f.state === FighterState.IDLE && f.throwInvincibilityTimer === 0) {
      vfx.spawnDust(f.x, STAGE_GROUND_Y);
      vfx.spawnQuickStandText(f.x, f.y - f.displayHeight - 40);
      playQuickStand();
      const oppIdx = 1 - i;
      combatSystem.resetCombo(oppIdx);
    }

    if (f.prevState !== FighterState.ROLL && f.state === FighterState.ROLL) {
      playRoll();
      if (f.prevState === FighterState.BLOCK) {
        playCancel();
        vfx.spawnGCCDText(f.x, f.y - f.displayHeight - 30);
        screenFlash.trigger('#22ff88', 0.1, 3);
      }
    }

    if (f.prevState === FighterState.BLOCK
      && (f.state === FighterState.STAND_ATTACK || f.state === FighterState.CROUCH_ATTACK)) {
      playCancel();
      vfx.spawnCharacterHitSparks(f.x, f.y - f.displayHeight / 2, 12, '#ff8800');
      vfx.spawnGCCDText(f.x, f.y - f.displayHeight - 30);
      screenFlash.trigger('#ff8800', 0.1, 3);
    }

    if (f.cancelEvent) {
      const cx = f.x;
      const cy = f.y - f.displayHeight - 30;
      if (f.cancelEvent === 'super_cancel') {
        vfx.spawnSuperCancelText(cx, cy);
        screenFlash.trigger('#4488ff', 0.15, 4);
        playCancel();
      } else if (f.cancelEvent === 'free_cancel') {
        vfx.spawnFreeCancelText(cx, cy);
        screenFlash.trigger('#44ff88', 0.12, 3);
        playCancel();
      } else if (f.cancelEvent === 'rapid_cancel' || f.cancelEvent === 'command_cancel') {
        playCancel();
      }
      f.cancelEvent = null;
    }

    f.savePrevState();
  });

  updateMovementVfx([p1, p2], vfx, tickRef.value);

  // Dizzy stars: spawn periodically for fighters in DIZZY state
  for (const f of [p1, p2]) {
    if (f.state === FighterState.DIZZY && tickRef.value % 20 === 0) {
      vfx.spawnDizzyStars(f.x, f.y - f.displayHeight - 10);
    }
  }

  for (let i = projectiles.length - 1; i >= 0; i--) { if (!projectiles[i].active) projectiles.splice(i, 1); }

  for (let i = 0; i < projectiles.length; i++) {
    const a = projectiles[i];
    if (!a.active) continue;
    for (let j = i + 1; j < projectiles.length; j++) {
      const b = projectiles[j];
      if (!b.active) continue;
      if (a.ownerId === b.ownerId) continue;
      const aBox = a.getHitbox();
      const bBox = b.getHitbox();
      if (!aBox || !bBox) continue;
      const overlap = Math.min(aBox.x + aBox.width, bBox.x + bBox.width) - Math.max(aBox.x, bBox.x);
      if (overlap <= 0) continue;
      const vOverlap = Math.min(aBox.y + aBox.height, bBox.y + bBox.height) - Math.max(aBox.y, bBox.y);
      if (vOverlap <= 0) continue;
      a.active = false; b.active = false;
      const collX = (a.x + b.x) / 2, collY = (a.y + b.y) / 2;
      vfx.spawnCharacterHitSparks(collX, collY, 20, '#ffffff');
      vfx.spawnImpactRing(collX, collY);
      break;
    }
  }
  for (let i = projectiles.length - 1; i >= 0; i--) { if (!projectiles[i].active) projectiles.splice(i, 1); }

  if (gs.isTrainingMode) {
    if (p1.health < p1.maxHealth && p1.health > 0) p1.health = Math.min(p1.maxHealth, p1.health + p1.maxHealth * 0.02);
    if (p2.health < p2.maxHealth && p2.health > 0) p2.health = Math.min(p2.maxHealth, p2.health + p2.maxHealth * 0.02);
    if (p1.health <= 0 || p2.health <= 0) {
      p1.health = p1.maxHealth; p2.health = p2.maxHealth;
      p1DelayedHealth = p1.maxHealth; p2DelayedHealth = p2.maxHealth;
      cinematic.reset(); gs.koGroundSlamDone = false;
    }
  }

  if (!gs.isTrainingMode && (p1.health <= 0 || p2.health <= 0)) {
    if (!cinematic.koSlowMoTriggered) {
      const killer = p1.health <= 0 ? p2 : p1;
      const killerAttack = killer.currentAttack as string;
      const isDMKill = killerAttack?.startsWith('DM_') || killerAttack?.startsWith('SDM_');
      if (isDMKill) cinematic.triggerDMKOSlowMo();
      else cinematic.triggerKOSlowMo();
      const koDefender = p1.health <= 0 ? 0 : 1;
      const koAttacker = p1.health <= 0 ? p2 : p1;
      cinematic.triggerHitStop(isDMKill ? 20 : 15, koDefender, koAttacker.facing);
      screenFlash.trigger('#ff2200', 0.35, 15);
      screenShake.trigger(isDMKill ? 18 : 14, 15);
      playKO();
      bgm.stop();
      ambient.stop();
      announcer.knockOut();
    }
    if (!gs.koGroundSlamDone && cinematic.koSlowMoTriggered) {
      const bothKO = p1.health <= 0 && p2.health <= 0;
      const loser = p1.health <= 0 ? p1 : p2;
      if (loser.isGrounded()) {
        gs.koGroundSlamDone = true;
        triggerKOGroundEffect({ vfx, screenFlash, screenShake }, loser);
        if (bothKO) triggerKOGroundEffect({ vfx, screenFlash, screenShake }, p1.health <= 0 ? p1 : p2);
      }
    }
    if (cinematic.koSlowMoTriggered && cinematic.isKOSlowMoDone()) {
      gs.setPhase(GamePhase.KO);
      gs.koTimer = 0;
      gs.winner = rounds.determineWinner();
      const isPerfect = gs.winner !== null && cinematic.getPerfectPlayer(gs.winner) !== null;
      gs.announceSequence.setSteps(createKOSequence(isPerfect));
      if (isPerfect) {
        const pw = gs.winner === 0 ? p1 : p2;
        vfx.spawnPerfectFlash(pw.x, pw.y - pw.displayHeight / 2);
        screenFlash.trigger('#ffcc00', 0.25, 8);
      }
    }
  }

  if (!gs.isTrainingMode && tickRef.value >= 3600) {
    gs.setPhase(GamePhase.KO);
    gs.koTimer = 0;
    gs.isTimeOver = true;
    gs.winner = rounds.determineWinner();
    gs.announceSequence.setSteps(createTimeOverSequence());
    screenShake.trigger(8, 10);
    screenFlash.trigger('#ffaa00', 0.2, 8);
    bgm.stop();
    ambient.stop();
    announcer.timeOver();
  }
}

// ===== Training Mode HUD =====
function drawTrainingHUD(
  ctx: CanvasRenderingContext2D, p1: Fighter, p2: Fighter,
  cs: CombatSystem, inputDisplay: string, tick: number,
): void {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 80, 0, 0.65)';
  ctx.fillRect(0, 0, 200, 28);
  ctx.fillStyle = '#44ff44';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('TRAINING MODE', 10, 19);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(CANVAS_WIDTH - 220, 0, 220, 60);
  ctx.font = '11px monospace';
  ctx.fillStyle = '#aaa';
  ctx.fillText('Combo:', CANVAS_WIDTH - 210, 16);
  ctx.fillStyle = '#ffcc00';
  ctx.fillText(`${cs.getComboCount(0)}`, CANVAS_WIDTH - 150, 16);
  ctx.fillStyle = '#aaa';
  ctx.fillText('Damage:', CANVAS_WIDTH - 210, 32);
  ctx.fillStyle = '#ff6644';
  ctx.fillText(`${cs.getComboDamage(0)}`, CANVAS_WIDTH - 140, 32);
  ctx.fillStyle = '#aaa';
  ctx.fillText('P1 HP:', CANVAS_WIDTH - 210, 48);
  ctx.fillStyle = '#44ff44';
  ctx.fillText(`${Math.round(p1.health)} / ${p1.maxHealth}`, CANVAS_WIDTH - 155, 48);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, CANVAS_HEIGHT - 40, 400, 40);
  ctx.font = '12px monospace';
  ctx.fillStyle = '#888';
  ctx.fillText('Input:', 8, CANVAS_HEIGHT - 20);
  ctx.fillStyle = '#ccffcc';
  ctx.fillText(inputDisplay, 60, CANVAS_HEIGHT - 20);

  if (p1.currentAttack) {
    const d = FRAME_DATA[p1.currentAttack as keyof typeof FRAME_DATA];
    if (d) {
      ctx.fillStyle = '#aaccff';
      ctx.fillText(`${p1.currentAttack} [${p1.attackPhase}] f${p1.attackFrame}  S:${d.startup} A:${d.active} R:${d.recovery} dmg:${d.damage}`, 8, CANVAS_HEIGHT - 6);
    }
  }
  ctx.restore();
}

// ===== Render =====
function render(): void {
  if (gs.phase === GamePhase.TITLE) {
    renderer.drawTitle(tickRef.value);
    return;
  }
  if (gs.phase === GamePhase.MODE_SELECT) {
    renderer.drawModeSelect(tickRef.value, gs.modeSelectCursor);
    return;
  }
  if (gs.phase === GamePhase.CONTINUE) {
    renderer.drawContinue(Math.ceil(gs.continueCountdown / 60), gs.continueCursorYes);
    return;
  }
  if (gs.phase === GamePhase.SELECT) {
    renderer.drawCharacterSelect(select, tickRef.value, gs.simplifiedMode, getStage());
    if (select.vsSplashTimer >= 0) {
      renderer.drawVSSplash(select, tickRef.value);
    }
    return;
  }
  rounds.tickFade();
  camera.update(p1, p2);
  const perfectPlayer = (gs.phase === GamePhase.KO) ? cinematic.getPerfectPlayer(gs.winner) : null;
  const p1Char = ROSTER.find(c => c.id === p1.charId) || ROSTER[0];
  const p2Char = ROSTER.find(c => c.id === p2.charId) || ROSTER[1];
  renderer.render([p1, p2], camera.x, tickRef.value, gs.phase === GamePhase.KO, gs.winner, screenShake.offsetX, screenShake.offsetY,
    [p1DelayedHealth, p2DelayedHealth], maxModes, perfectPlayer, rounds.p1Wins, rounds.p2Wins, p1Char.nameCn, p2Char.nameCn, gs.isTimeOver, rounds.currentRound, gs.firstAttacker,
    cinematic.hitStopDefender, cinematic.hitStopBias, [p1Char.specialColor, p2Char.specialColor]);
  renderer.drawProjectiles(projectiles, camera);
  vfx.render(ctx, camera.x);

  if (cinematic.superFlashTimer > 0)
    renderer.drawSuperFlash(ctx, cinematic.superFlashTimer, cinematic.superFlashX - camera.x, cinematic.superFlashY, maxModes[cinematic.superFlashAttacker].active ? 'SDM' : 'DM');
  renderer.drawPowerGauges(gauges, maxModes);
  if (gs.phase === GamePhase.INTRO) {
    if (gs.announceSequence.isRunning()) {
      drawAnnounceSequence(ctx, gs.announceSequence, canvas.width, canvas.height);
    } else {
      renderer.drawIntro(gs.phaseTimer, rounds.currentRound, p1Char.nameCn, p2Char.nameCn);
    }
  }
  if (gs.phase === GamePhase.KO && gs.announceSequence.isRunning()) {
    drawAnnounceSequence(ctx, gs.announceSequence, canvas.width, canvas.height);
  }
  renderer.drawComboCounters([p1, p2], [combatSystem.getComboCount(0), combatSystem.getComboCount(1)], [0, 0], camera, [combatSystem.getComboDamage(0), combatSystem.getComboDamage(1)]);
  if (gs.teamMode && p1Team && p2Team) {
    const toDisp = (t: TeamState): TeamDisplayInfo => ({
      members: t.members.map((m, i) => ({ name: m.charDef.nameCn, defeated: m.defeated, active: i === t.activeIndex && !m.defeated })),
    });
    renderer.drawTeamOrder(toDisp(p1Team), toDisp(p2Team));
  }
  renderer.drawControlsHint(gs.simplifiedMode, p1.charId);

  if (gs.phase === GamePhase.WIN_QUOTE && gs.winner !== null) {
    const winner = gs.winner === 0 ? p1 : p2;
    // KOF2002: 胜利姿势动画显示在胜利台词背景
    drawVictoryPose(ctx, winner.x - camera.x, winner.y, winner.facing, winner.color, '#ffffff30', tickRef.value, winner.charId);
    const charDef = ROSTER.find(c => c.id === winner.charId);
    renderer.drawWinQuote(
      gs.winQuoteTimer,
      gs.winQuoteCharName,
      gs.currentWinQuote,
      gs.winQuoteCharColor,
      charDef?.pixelPortrait,
    );
  }

  if (gs.phase === GamePhase.MATCH_END) {
    if (gs.winner !== null) { const w = gs.winner === 0 ? p1 : p2; drawVictoryPose(ctx, w.x - camera.x, w.y, w.facing, w.color, '#ffffff30', tickRef.value, w.charId); }
    renderer.drawMatchEnd(gs.winner, rounds.p1Wins, rounds.p2Wins, gs.currentWinQuote || undefined, gs.winner !== null ? (gs.winner === 0 ? '#ff6644' : '#4488ff') : undefined, gs.phaseTimer, gs.winner !== null ? (gs.winner === 0 ? p1 : p2).charId ?? undefined : undefined);
    if (gs.announceSequence.isRunning()) {
      drawAnnounceSequence(ctx, gs.announceSequence, canvas.width, canvas.height);
    }
  }
  if (rounds.fadeAlpha > 0) { ctx.fillStyle = `rgba(0,0,0,${rounds.fadeAlpha})`; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  screenFlash.render(ctx, canvas.width, canvas.height);
  if (gs.modeIndicatorTimer > 0) {
    renderer.drawModeIndicator(gs.simplifiedMode, Math.min(1, gs.modeIndicatorTimer / 60));
    gs.modeIndicatorTimer--;
  }
  if (gs.stageIndicatorTimer > 0) {
    renderer.drawStageIndicator(getStage(), Math.min(1, gs.stageIndicatorTimer / 60));
    gs.stageIndicatorTimer--;
  }
  if (gs.debugMode) {
    const symbols: Record<string, string> = { neutral: '·', up: '↑', down: '↓', forward: '→', back: '←', upforward: '↗', upback: '↖', downforward: '↘', downback: '↙' };
    const toHist = (cmd: CommandBuffer) => {
      const h = cmd.getRecentHistory(10);
      return { directionSymbols: h.map(e => symbols[e.direction] || '?'), directionAges: h.map(e => tickRef.value - e.frame) };
    };
    renderer.drawDebug([p1, p2], projectiles, camera, tickRef.value, renderer.getFps(), vfx.count, [toHist(p1Cmd), toHist(p2Cmd)]);
  }
  if (gs.isTrainingMode && (gs.phase === GamePhase.FIGHTING || gs.phase === GamePhase.KO)) {
    const sym: Record<string, string> = { neutral: '·', up: '↑', down: '↓', forward: '→', back: '←', upforward: '↗', upback: '↖', downforward: '↘', downback: '↙' };
    const inputStr = p1Cmd.getRecentHistory(16).map(h => sym[h.direction] || '?').join(' ');
    drawTrainingHUD(ctx, p1, p2, combatSystem, inputStr, tickRef.value);
  }
}

function restartGame(): void {
  bgm.stop();
  ambient.stop();
  gs.resetForNewGame();
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
  if (e.code === 'F1') { e.preventDefault(); if (!f1Down) { f1Down = true; gs.debugMode = !gs.debugMode; } }
  if (e.code === 'KeyM') announcer.toggle();
  if (e.code === 'KeyB') bgm.toggle();
  if (e.code === 'Tab') { e.preventDefault(); gs.simplifiedMode = !gs.simplifiedMode; gs.modeIndicatorTimer = 120; }
  if (e.code === 'KeyN') { const s = cycleStage(); console.log('Stage:', s); gs.stageIndicatorTimer = 120; }
});
window.addEventListener('keyup', e => { if (e.code === 'F1') f1Down = false; });

// ===== Start =====
new GameLoop(update, render).start();
