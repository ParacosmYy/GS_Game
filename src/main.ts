/**
 * KOF 2002 — Entry point
 * Pure initialization + game loop. All logic delegated to focused modules.
 */
import { GameLoop } from './core/gameLoop.js';
import { Camera } from './core/camera.js';
import { GameSpeedController, SLOWMO_SUPER_FLASH, SLOWMO_KO } from './core/gameSpeed.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, STAGE_WIDTH, STAGE_GROUND_Y, KO_DISPLAY_TIME, MAX_STOCKS, METER_PER_STOCK, FRAME_DATA, ROUND_TIME } from './core/constants.js';
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
import { cycleStage, setStage, getStage, getAllStages, type StageId } from './rendering/stage.js';
import { drawVictoryPose } from './rendering/skeletalFighter.js';
import { drawRyoWinPose } from './rendering/sprites/ryoHighResRender.js';
import type { TeamDisplayInfo } from './rendering/hud.js';
import { addArcadeScore, resetArcadeScore } from './rendering/hud.js';
import { ROSTER } from './characters/index.js';
import { SpriteManager, SpriteRenderer } from './rendering/spriteRenderer.js';
import { generatePlaceholderSpritesheet } from './rendering/placeholderSprites.js';
import { CinematicState } from './state/cinematicState.js';
import { SelectState } from './state/selectState.js';
import { RoundState } from './state/roundState.js';
import { DMManager } from './combat/dmManager.js';
import { createHitCallback, triggerKOGroundEffect } from './combat/hitCallback.js';
import { initAudio, initSampler, playKO, playVictoryFanfare, playMAXActivation, playPerfect, playThrowEscape, playFight, playRoll, playCancel, playQuickStand, playGuardCrush, playHit, playSpecialLight, playSpecialHeavy, playDM, playWhoosh, playHeavyWhoosh, playKoouken, playKoHou, playHien, playHaou, playCursorMove, playCursorConfirm, playTimeUp } from './audio/sampler.js';
import { tickAttackSFX, dispatchContractSFX } from './audio/attackSFX.js';
import { getContractEventTags } from './entities/fighter.js';
import { tickMotionSFX } from './audio/motionSFX.js';
import { createTeam, defeatActive, switchToNext, activeChar, teamOrderString, type TeamState } from './state/teamState.js';
import { resolveSimplified } from './input/simplifiedInput.js';
import { bgm } from './audio/bgm.js';
import { AmbientSoundPlayer } from './audio/ambient.js';
import { announcer } from './audio/announcer.js';
import { announcerOverlay } from './rendering/announcerOverlay.js';
import { AdvancedAI } from './ai/advancedAI.js';
import { updateMovementVfx } from './state/movementVfx.js';
import { WIN_QUOTE_DURATION, drawAnnounceSequence } from './rendering/screens.js';
import { getPortraitForSize } from './rendering/manifestRenderData.js';
import { GameStateManager } from './state/gameStateManager.js';
import { gameRandom, gameRandomInt } from './core/prng.js';
import { InputLogger } from './core/inputLog.js';
import { ReplaySession } from './core/replaySession.js';
import { createRoundStartSequence, createKOSequence, createTimeOverSequence, createWinnerSequence } from './state/announcePresets.js';
import { TrainingModeState } from './state/trainingMode.js';
import { drawPauseMenu } from './rendering/pauseMenu.js';
import { drawCharacterKOOverlay } from './rendering/overlayScreens.js';
import type { CharacterDefinition } from './characters/types.js';

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
const training = new TrainingModeState();
const gameSpeed = new GameSpeedController();

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
// Menu cursor prev-frame tracking for edge-triggered SFX
let prevModeCursor = -1;
let prevOptionsCursor = -1;
let prevStageCursor = -1;
const maxModes: [MaxModeState, MaxModeState] = [createMaxMode(), createMaxMode()];
p1Ctrl.setGauge(gauges[0]);
p2Ctrl.setGauge(gauges[1]);
p1Ctrl.setMaxMode(maxModes[0]);
p2Ctrl.setMaxMode(maxModes[1]);
// Wall splat screen shake callback
p1Ctrl.onScreenShake = (intensity, duration) => screenShake.trigger(intensity, duration);
p2Ctrl.onScreenShake = (intensity, duration) => screenShake.trigger(intensity, duration);

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
  vfx.spawnImpactRing(hitX, hitY, 1.5);
  screenFlash.trigger('#ff4444', 0.3, 12); screenShake.trigger(12, 15); playGuardCrush();
};

// ===== Derived state =====
const CONTINUE_DURATION = 600;
const INTRO_DURATION = 150;
let p2AI: InstanceType<typeof import('./ai/advancedAI.js').AdvancedAI> | null = null;
let p1Team: TeamState | null = null;
let p2Team: TeamState | null = null;
let p1DelayedHealth = p1.maxHealth;
let p2DelayedHealth = p2.maxHealth;
let prevTimeSeconds = 99; // Track time for countdown warning bell

function pickWinQuote(w: number | null): string {
  if (w === null) return '';
  const fighter = w === 0 ? p1 : p2;
  const charDef = ROSTER.find(c => c.id === fighter.charId);
  if (!charDef || !charDef.winQuotes.length) return '';
  return charDef.winQuotes[gameRandomInt(charDef.winQuotes.length)];
}

/** Generate a shuffled opponent queue for arcade mode, excluding P1's character */
function generateArcadeOpponents(p1CharId: string): CharacterDefinition[] {
  const available = ROSTER.filter(c => c.id !== p1CharId);
  for (let i = available.length - 1; i > 0; i--) {
    const j = gameRandomInt(i + 1);
    [available[i], available[j]] = [available[j], available[i]];
  }
  return available;
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
    const startJ = inputManager.isKeyDown('KeyJ');
    const startEnter = inputManager.isKeyDown('Enter');
    const startR = inputManager.isKeyDown('KeyR');
    if (startJ) {
      select.primeInputs(inputManager.getP1Input(), inputManager.getP2Input());
      bgm.stop();
      gs.titleBgmStarted = false;
      gs.setPhase(GamePhase.SELECT);
      initAudio();
    } else if (startEnter || startR) {
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
    if (inputManager.isKeyDown('ArrowRight') || inputManager.isKeyDown('KeyD')) gs.modeSelectCursor = Math.min(3, gs.modeSelectCursor + 1);
    if (gs.modeSelectCursor !== prevModeCursor) { if (prevModeCursor >= 0) playCursorMove(); prevModeCursor = gs.modeSelectCursor; }
    if (inputManager.isKeyDown('Enter') || inputManager.isKeyDown('KeyJ')) {
      playCursorConfirm();
      if (gs.modeSelectCursor === 3) {
        gs.setPhase(GamePhase.OPTIONS);
        gs.optionsCursor = 0;
      } else {
        gs.teamMode = gs.modeSelectCursor === 1;
        gs.isTrainingMode = gs.modeSelectCursor === 2;
        gs.setPhase(GamePhase.SELECT);
      }
    }
    return;
  }

  if (gs.phase === GamePhase.OPTIONS) {
    tickRef.value++;
    const opts = gs.options;
    if (inputManager.isKeyDown('ArrowUp') || inputManager.isKeyDown('KeyW')) gs.optionsCursor = Math.max(0, gs.optionsCursor - 1);
    if (inputManager.isKeyDown('ArrowDown') || inputManager.isKeyDown('KeyS')) gs.optionsCursor = Math.min(5, gs.optionsCursor + 1); // 5 settings + BACK
    if (gs.optionsCursor !== prevOptionsCursor) { if (prevOptionsCursor >= 0) playCursorMove(); prevOptionsCursor = gs.optionsCursor; }
    if (inputManager.isKeyDown('ArrowLeft') || inputManager.isKeyDown('KeyA') || inputManager.isKeyDown('ArrowRight') || inputManager.isKeyDown('KeyD')) {
      if (gs.optionsCursor < 5) {
        playCursorMove();
        const dir = (inputManager.isKeyDown('ArrowRight') || inputManager.isKeyDown('KeyD')) ? 1 : -1;
        switch (gs.optionsCursor) {
          case 0: opts.difficulty = ((opts.difficulty + dir + 3) % 3) as 0|1|2; break;
          case 1: opts.roundsToWin = ((opts.roundsToWin + dir + 3) % 3) as 1|2|3; break;
          case 2: { const vals: (30|60|99|0)[] = [30,60,99,0]; const idx = vals.indexOf(opts.timeLimit); opts.timeLimit = vals[(idx + dir + 4) % 4]; break; }
          case 3: opts.crtEnabled = !opts.crtEnabled; renderer.crtEnabled = opts.crtEnabled; break;
          case 4: opts.simplifiedMode = !opts.simplifiedMode; gs.simplifiedMode = opts.simplifiedMode; break;
        }
      }
    }
    if (inputManager.isKeyDown('Enter') || inputManager.isKeyDown('KeyJ') || inputManager.isKeyDown('Escape')) {
      playCursorConfirm();
      gs.setPhase(GamePhase.MODE_SELECT);
      gs.modeSelectCursor = 3;
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
        gs.setPhase(GamePhase.GAME_OVER);
        gs.gameOverTimer = 0;
      }
    }
    if (gs.continueCountdown <= 0) {
      gs.setPhase(GamePhase.GAME_OVER);
      gs.gameOverTimer = 0;
    }
    return;
  }

  if (gs.phase === GamePhase.GAME_OVER) {
    tickRef.value++;
    gs.gameOverTimer++;
    if (gs.gameOverTimer >= 180) {
      gs.setPhase(GamePhase.TITLE);
      gs.gameOverTimer = 0;
    }
    return;
  }

  if (gs.phase === GamePhase.SELECT) {
    tickRef.value++;
    const result = select.update(inputManager.getP1Input(), inputManager.getP2Input(), inputManager.isKeyDown('KeyT'));
    if (result) {
      p2AI = gs.isTrainingMode ? null : result.p2AI;
      // Apply palette selection to fighters so rendering uses the correct color variant
      p1.colorIndex = result.p1ColorIndex;
      p2.colorIndex = result.p2ColorIndex;
      if (gs.teamMode) {
        p1Team = createTeam(result.p1Team);
        p2Team = createTeam(result.p2Team);
        // Go to team order select first
        gs.resetTeamOrder();
        gs.setPhase(GamePhase.TEAM_ORDER);
      } else {
        // Go directly to stage select
        gs.resetStageSelect();
        gs.setPhase(GamePhase.STAGE_SELECT);
      }
    }
    return;
  }

  if (gs.phase === GamePhase.TEAM_ORDER) {
    tickRef.value++;
    const p1Input = inputManager.getP1Input();
    // Throttle directional input to once every 10 frames
    if (gs.inputRepeatCooldown > 0) gs.inputRepeatCooldown--;
    const canRepeat = gs.inputRepeatCooldown === 0;

    if (!gs.teamOrderReady[0]) {
      if (!gs.teamOrderSwapMode) {
        if (p1Input.left && canRepeat) { gs.teamOrderCursor = Math.max(0, gs.teamOrderCursor - 1); gs.inputRepeatCooldown = 10; playCursorMove(); }
        if (p1Input.right && canRepeat) { gs.teamOrderCursor = Math.min(2, gs.teamOrderCursor + 1); gs.inputRepeatCooldown = 10; playCursorMove(); }
        // Press A (buttonA) to enter swap mode
        if (p1Input.buttonA) {
          gs.teamOrderSwapMode = true;
          gs.teamOrderSwapCursor = gs.teamOrderCursor;
        }
      } else {
        // In swap mode: left/right to pick target
        if (p1Input.left && canRepeat) { gs.teamOrderSwapCursor = Math.max(0, gs.teamOrderSwapCursor - 1); gs.inputRepeatCooldown = 10; playCursorMove(); }
        if (p1Input.right && canRepeat) { gs.teamOrderSwapCursor = Math.min(2, gs.teamOrderSwapCursor + 1); gs.inputRepeatCooldown = 10; playCursorMove(); }
        // Press A to confirm swap
        if (p1Input.buttonA && gs.teamOrderSwapCursor !== gs.teamOrderCursor) {
          const temp = gs.teamOrderSlots[0][gs.teamOrderCursor];
          gs.teamOrderSlots[0][gs.teamOrderCursor] = gs.teamOrderSlots[0][gs.teamOrderSwapCursor];
          gs.teamOrderSlots[0][gs.teamOrderSwapCursor] = temp;
          gs.teamOrderSwapMode = false;
          playCursorConfirm();
        }
        // Press C or D to cancel swap
        if (p1Input.buttonC || p1Input.buttonD) {
          gs.teamOrderSwapMode = false;
        }
      }

      // Press Enter/KeyJ to confirm order
      if (inputManager.isKeyDown('KeyJ') || inputManager.isKeyDown('Enter')) {
        playCursorConfirm();
        gs.teamOrderReady[0] = true;
        gs.teamOrderReady[1] = true; // AI confirms instantly
      }
    }

    // Both ready -> proceed to stage select
    if (gs.teamOrderReady[0] && gs.teamOrderReady[1]) {
      // Apply team order to teams
      if (p1Team && p2Team) {
        const p1Old = [...p1Team.members];
        const p2Old = [...p2Team.members];
        p1Team.members = gs.teamOrderSlots[0].map(i => p1Old[i]);
        p1Team.activeIndex = 0;
        p2Team.members = gs.teamOrderSlots[1].map(i => p2Old[i]);
        p2Team.activeIndex = 0;
      }
      gs.resetStageSelect();
      gs.setPhase(GamePhase.STAGE_SELECT);
    }
    return;
  }

  if (gs.phase === GamePhase.STAGE_SELECT) {
    tickRef.value++;
    const p1Input = inputManager.getP1Input();
    const allStages = getAllStages();
    const totalSlots = allStages.length + 1;

    if (gs.inputRepeatCooldown > 0) gs.inputRepeatCooldown--;
    const canRepeat = gs.inputRepeatCooldown === 0;

    if (!gs.stageSelectReady) {
      if (p1Input.left && canRepeat) { gs.stageSelectCursor = Math.max(0, gs.stageSelectCursor - 1); gs.inputRepeatCooldown = 10; }
      if (p1Input.right && canRepeat) { gs.stageSelectCursor = Math.min(totalSlots - 1, gs.stageSelectCursor + 1); gs.inputRepeatCooldown = 10; }
      if (gs.stageSelectCursor !== prevStageCursor) { if (prevStageCursor >= 0) playCursorMove(); prevStageCursor = gs.stageSelectCursor; }
      if (inputManager.isKeyDown('KeyJ') || inputManager.isKeyDown('Enter') || p1Input.buttonA) {
        playCursorConfirm();
        gs.stageSelectReady = true;
        // Resolve stage
        if (gs.stageSelectCursor >= allStages.length) {
          const randomIdx = gameRandomInt(allStages.length);
          gs.stageSelectConfirmed = allStages[randomIdx];
        } else {
          gs.stageSelectConfirmed = allStages[gs.stageSelectCursor];
        }
      }
    }

    if (gs.stageSelectReady) {
      if (gs.stageSelectConfirmed) {
        setStage(gs.stageSelectConfirmed as StageId);
      }

      if (gs.isTrainingMode) training.reset();
      // Generate arcade opponent ladder for non-training modes
      if (!gs.isTrainingMode) {
        gs.arcadeOpponents = generateArcadeOpponents(p1.charId);
        gs.arcadeOpponentIndex = 0;
        gs.arcadeComplete = false;
        resetArcadeScore();
      }
      initAudio();
      initSampler();
      rounds.currentRound = 1;
      gs.isTimeOver = false;
      gs.setPhase(GamePhase.INTRO);
      gs.phaseTimer = 0;
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
      bgm.setStage(getStage());
      bgm.start();
      ambient.start(getStage());
    }
    return;
  }

  if (gs.phase === GamePhase.KO) {
    gs.koTimer++;
    // Phase 52: Tick KO state machine
    cinematic.tickKOState();
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
        // Perfect KO golden screen flash
        screenFlash.trigger('#ffdd00', 0.15, 8);
        screenShake.trigger(6, 10);
        // Phase 52: PERFECT KO bonus meter award
        if (!cinematic.perfectMeterAwarded && gs.winner !== null) {
          cinematic.perfectMeterAwarded = true;
          const perfectWinner = gs.winner;
          // Award bonus meter: fill 1 full stock
          if (gauges[perfectWinner].stocks < MAX_STOCKS) {
            gauges[perfectWinner].meter = 0;
            gauges[perfectWinner].stocks = Math.min(MAX_STOCKS, gauges[perfectWinner].stocks + 1);
          }
        }
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
    // During cinematic round transition, keep ticking fade but skip re-entry logic
    if (rounds.isTransitioning()) {
      if (inputManager.isKeyDown('KeyR')) restartGame();
      return;
    }
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
            p2AI = new AdvancedAI(p2, p1, newChar, 'medium');
          }
          // Cinematic transition for team mode round change
          rounds.startCinematicTransition(
            () => {
              p1DelayedHealth = p1.maxHealth;
              p2DelayedHealth = p2.maxHealth;
              cinematic.reset();
            },
            () => {
              gs.setPhase(GamePhase.INTRO);
              gs.phaseTimer = 0;
              gs.resetForNextRound();
              gs.announceSequence.setSteps(createRoundStartSequence(rounds.currentRound));
              announcer.roundStart(rounds.currentRound);
              announcer.fight();
            },
          );
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
        // Start cinematic round transition: fade out → hold black → fade in
        rounds.startCinematicTransition(
          // onPeak: fires at full black — delayed health reset
          () => {
            gs.isTimeOver = false;
            gs.koGroundSlamDone = false;
            p1DelayedHealth = p1.maxHealth;
            p2DelayedHealth = p2.maxHealth;
          },
          // onComplete: fires when fade-in finishes — start next round
          () => {
            gs.setPhase(GamePhase.INTRO);
            gs.phaseTimer = 0;
            gs.resetForNextRound();
            gs.announceSequence.setSteps(createRoundStartSequence(rounds.currentRound));
            announcer.roundStart(rounds.currentRound);
            announcer.fight();
          },
        );
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
      // Arcade progression: P1 won and more opponents remain → next match
      const p1Won = gs.winner === 0;
      const moreOpponents = !gs.isTrainingMode && gs.arcadeOpponents.length > 0 && gs.arcadeOpponentIndex < gs.arcadeOpponents.length - 1;
      if (p1Won && moreOpponents) {
        gs.setPhase(GamePhase.NEXT_MATCH);
        gs.arcadeNextMatchTimer = 0;
      } else if (p1Won && gs.arcadeOpponents.length > 0 && gs.arcadeOpponentIndex >= gs.arcadeOpponents.length - 1) {
        // Beat all opponents — arcade complete
        gs.arcadeComplete = true;
        gs.setPhase(GamePhase.GAME_OVER);
        gs.gameOverTimer = 0;
      } else {
        gs.setPhase(GamePhase.CONTINUE);
        gs.continueCountdown = CONTINUE_DURATION;
        gs.continueCursorYes = true;
      }
    }
    return;
  }

  // Arcade: transition to next opponent
  if (gs.phase === GamePhase.NEXT_MATCH) {
    gs.arcadeNextMatchTimer++;
    // Play "new challenger" announcement once at start
    if (gs.arcadeNextMatchTimer === 1) {
      announcer.newChallenger();
    }
    // 120-frame transition: show "NEXT STAGE" text, then start next fight
    if (gs.arcadeNextMatchTimer >= 120 || (gs.arcadeNextMatchTimer > 30 && (inputManager.isKeyDown('KeyJ') || inputManager.isKeyDown('Enter')))) {
      gs.arcadeOpponentIndex++;
      const nextChar = gs.arcadeOpponents[gs.arcadeOpponentIndex];
      if (nextChar) {
        // Cycle to a different stage for variety (KOF2002: each fight on different stage)
        const allStages = getAllStages();
        const nextStage = allStages[gs.arcadeOpponentIndex % allStages.length];
        setStage(nextStage);
        // Set up P2 as next opponent
        p2.charId = nextChar.id;
        p2.color = nextChar.color;
        p2.setStats(nextChar.stats);
        p2Ctrl.setCharacter(nextChar);
        if (gs.teamMode && p2Team) {
          p2Team = createTeam([
            nextChar,
            gs.arcadeOpponents[(gs.arcadeOpponentIndex + 1) % gs.arcadeOpponents.length],
            gs.arcadeOpponents[(gs.arcadeOpponentIndex + 2) % gs.arcadeOpponents.length],
          ]);
        }
        p2AI = new AdvancedAI(p2, p1, nextChar, 'medium');
        // Reset for new match
        rounds.currentRound = 1;
        rounds.fullReset();
        cinematic.reset();
        p1.health = p1.maxHealth;
        p2.health = p2.maxHealth;
        p1DelayedHealth = p1.maxHealth;
        p2DelayedHealth = p2.maxHealth;
        p1.savePrevState();
        p2.savePrevState();
        // KOF2002: P1 keeps gauge progress, P2 gets fresh gauge
        gauges[1].meter = 0;
        gauges[1].stocks = 0;
        maxModes[0].active = false;
        maxModes[1].active = false;
        gs.isTimeOver = false;
        gs.matchStats = { p1TotalDamage: 0, p2TotalDamage: 0, p1LongestCombo: 0, p2LongestCombo: 0 };
        gs.setPhase(GamePhase.INTRO);
        gs.phaseTimer = 0;
        gs.announceSequence.setSteps(createRoundStartSequence(1));
        announcer.roundStart(1);
        announcer.fight();
      }
    }
    return;
  }

  // === FIGHTING phase ===
  // Pause menu toggle (Escape key) — works in both normal and training mode
  if (gs.isPaused) {
    // Only process pause menu navigation while paused
    if (inputManager.isKeyDown('Escape') || inputManager.isKeyDown('Enter')) {
      gs.unpause();
      inputManager.clearKey('Escape');
      inputManager.clearKey('Enter');
    }
    // Tab switching with left/right
    if (inputManager.isKeyDown('ArrowLeft') || inputManager.isKeyDown('KeyA')) {
      gs.pauseMenuCursor = Math.max(0, gs.pauseMenuCursor - 1);
      const tabs: Array<'moves' | 'controls' | 'settings'> = ['moves', 'controls', 'settings'];
      gs.pauseMenuTab = tabs[gs.pauseMenuCursor] ?? 'moves';
      inputManager.clearKey('ArrowLeft');
      inputManager.clearKey('KeyA');
    }
    if (inputManager.isKeyDown('ArrowRight') || inputManager.isKeyDown('KeyD')) {
      gs.pauseMenuCursor = Math.min(2, gs.pauseMenuCursor + 1);
      const tabs: Array<'moves' | 'controls' | 'settings'> = ['moves', 'controls', 'settings'];
      gs.pauseMenuTab = tabs[gs.pauseMenuCursor] ?? 'moves';
      inputManager.clearKey('ArrowRight');
      inputManager.clearKey('KeyD');
    }
    return; // Skip all game updates while paused
  }
  if (inputManager.isKeyDown('Escape') && gs.phase === GamePhase.FIGHTING) {
    gs.togglePause();
    inputManager.clearKey('Escape');
    return;
  }
  if (gs.isTrainingMode && inputManager.isKeyDown('Escape')) {
    bgm.stop(); ambient.stop(); gs.setPhase(GamePhase.SELECT); select.reset(); p2AI = null; gs.isTrainingMode = true; return;
  }
  if (cinematic.isFrozen()) { cinematic.tickInFreeze(maxModes); return; }
  cinematic.tickMaxModes(maxModes);
  cinematic.tickSuperFlash();

  // GameSpeed slow-motion integration: skip frames when slow-mo is active
  const speedFactor = gameSpeed.update();
  tickRef.value++;
  tickAutoMeter(gauges);
  // KOF2002: Timer countdown warning bell at 10s
  if (!gs.isTrainingMode) {
    const timeSeconds = Math.max(0, ROUND_TIME - Math.floor(tickRef.value / 60));
    if (timeSeconds === 10 && prevTimeSeconds > 10) {
      playTimeUp(); // Reuse time-up bell for countdown warning
    }
    prevTimeSeconds = timeSeconds;
  }
  // Slow-mo frame skip: probabilistic skip based on speed factor
  if (gameSpeed.isSlowMo() && Math.random() > speedFactor) return;

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
    vfx.spawnImpactRing(p1.x, p1.y - p1.displayHeight / 2, 1.3);
    try { announcer.maxActivation(); } catch { /* audio unavailable in test env */ }
    announcerOverlay.trigger('max_activation');
    p1.invincible = true; p1.throwInvulnFrames = 5;
  }
  if (maxModes[1].active && maxModes[1].timer === maxModes[1].maxDuration - 1) {
    playMAXActivation(); screenFlash.trigger('#44ff88', 0.3, 8);
    vfx.spawnMAXActivationFlash(p2.x, p2.y - p2.displayHeight / 2); vfx.spawnHeavyDust(p2.x, p2.y, 8);
    vfx.spawnImpactRing(p2.x, p2.y - p2.displayHeight / 2, 1.3);
    try { announcer.maxActivation(); } catch { /* audio unavailable in test env */ }
    announcerOverlay.trigger('max_activation');
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
  // Training mode: record P1 input history and update frame data
  if (gs.isTrainingMode) {
    const sym: Record<string, string> = { neutral: '·', up: '↑', down: '↓', forward: '→', back: '←', upforward: '↗', upback: '↖', downforward: '↘', downback: '↙' };
    const dir = sym[getDirectionInput(p1Input)] || '·';
    const btns: string[] = [];
    if (p1Input.buttonAPressed) btns.push('A');
    if (p1Input.buttonBPressed) btns.push('B');
    if (p1Input.buttonCPressed) btns.push('C');
    if (p1Input.buttonDPressed) btns.push('D');
    if (p1Input.throwAttackPressed) btns.push('CD');
    if (p1Input.burstPressed) btns.push('O');
    // Negative Edge display: show button releases with ~ prefix
    if (p1Input.punchJustReleased && !p1Input.punchPressed) btns.push('~P');
    if (p1Input.kickJustReleased && !p1Input.kickPressed) btns.push('~K');
    // Charge ready indicator
    const chargeReady = p1Cmd.getChargeState('down').ready || p1Cmd.getChargeState('back').ready;
    if (chargeReady) btns.push('CHG');
    training.recordInput(dir, btns, tickRef.value);
    training.updateFrameData(p1, tickRef.value);
  }
  if (gs.simplifiedMode && !p1.currentAttack && p1.canAct()) {
    const p1Char = ROSTER.find(c => c.id === p1.charId) || ROSTER[0];
    const simp = resolveSimplified(
      !!rawP1.buttonC && combatSystem.getPrevAttack(0) === null,
      !!rawP1.buttonD && combatSystem.getPrevAttack(0) === null,
      !!rawP1.burst && combatSystem.getPrevAttack(0) === null,
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
    const dummyInput = training.getDummyInput(p1, p2, tickRef.value, p2.facing);
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

  // Per-frame SFX dispatch: play whoosh/impact sounds at specific attack frames
  const attackSampler = { playHit, playSpecialLight, playSpecialHeavy, playDM, playWhoosh, playHeavyWhoosh,
    playStep: playWhoosh, playLandingNormal: playWhoosh, playSuperFlash: playSpecialLight, playCancel,
    playKoouken, playKoHou, playHien, playHaou };
  tickAttackSFX(p1, attackSampler, 0);
  tickAttackSFX(p2, attackSampler, 1);

  // Frame Contract event tag → SFX dispatch (supplements phase-based SFX table)
  for (let fi = 0; fi < 2; fi++) {
    const f = fi === 0 ? p1 : p2;
    if (f.currentAttack && f.attackPhase !== 'none') {
      const tags = getContractEventTags(f.charId, f.currentAttack as string,
        f.attackPhase as 'startup' | 'active' | 'recovery', f.attackFrame);
      if (tags.length > 0) {
        // Use phase + attackFrame as unique key for dedup
        dispatchContractSFX(fi, f.currentAttack as string, tags,
          (f.attackPhase === 'active' ? 100 : f.attackPhase === 'recovery' ? 200 : 0) + f.attackFrame,
          attackSampler);
      }
    }
  }

  if (!gs.firstHitTracked && (combatSystem.getComboCount(0) > 0 || combatSystem.getComboCount(1) > 0)) {
    gs.firstHitTracked = true;
    const hitterIdx = combatSystem.getComboCount(0) > 0 ? 0 : 1;
    gs.firstAttacker = hitterIdx;
    const hitter = hitterIdx === 0 ? p1 : p2;
    vfx.spawnFirstAttackText(hitter.x, hitter.y - hitter.displayHeight - 40);
    announcer.firstAttack();
    if (gauges[hitterIdx]) {
      gainMeterOnHit(gauges[hitterIdx], undefined, hitter.health, hitter.maxHealth);
    }
  }

  const healthDecay = Math.max(p1.maxHealth, p2.maxHealth) * 0.005;
  if (p1DelayedHealth > p1.health) p1DelayedHealth = Math.max(p1.health, p1DelayedHealth - healthDecay);
  if (p2DelayedHealth > p2.health) p2DelayedHealth = Math.max(p2.health, p2DelayedHealth - healthDecay);

  dmMgr.checkDMActivation();
  // GameSpeed slow-mo on super flash: 8 ticks at 0.3x (after hitstop ends, residual slow-mo)
  if (cinematic.superFlashTimer > 0 && !gameSpeed.isSlowMo()) {
    gameSpeed.triggerSlowMo(SLOWMO_SUPER_FLASH.slowMoDuration, SLOWMO_SUPER_FLASH.slowMoSpeed);
  }
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
        // Arcade score: combo bonus
        if (i === 1) { addArcadeScore(lastCombo * 100 + lastDmg * 5); }
      }
      if (lastCombo >= 2) {
        const opp = i === 0 ? p2 : p1;
        vfx.spawnDust(opp.x, STAGE_GROUND_Y);
      }
      combatSystem.resetCombo(i);
    }
    if (f.prevState === FighterState.BLOCK && f.state === FighterState.IDLE) vfx.spawnDust(f.x, STAGE_GROUND_Y);
    // Wakeup detection: KNOCKDOWN->GETUP (start of getup) or GETUP->IDLE (getup complete)
    if (f.prevState === FighterState.KNOCKDOWN && f.state === FighterState.GETUP) {
      vfx.spawnDust(f.x, STAGE_GROUND_Y);
    }
    if (f.prevState === FighterState.GETUP && f.state === FighterState.IDLE) {
      vfx.spawnDust(f.x, STAGE_GROUND_Y);
      vfx.spawnQuickStandText(f.x, f.y - f.displayHeight - 40);
      playQuickStand();
      const oppIdx = 1 - i;
      combatSystem.resetCombo(oppIdx);
    }
    // Legacy: direct KNOCKDOWN->IDLE (if getup was bypassed)
    if (f.prevState === FighterState.KNOCKDOWN && f.state === FighterState.IDLE) {
      vfx.spawnDust(f.x, STAGE_GROUND_Y);
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

  // Tick announcer overlay animations
  announcerOverlay.tick();

  // Motion SFX: footstep, jump, landing sounds based on state transitions
  tickMotionSFX([p1, p2], tickRef.value);

  // Dizzy stars: spawn periodically for fighters in DIZZY state
  for (const f of [p1, p2]) {
    if (f.state === FighterState.DIZZY && tickRef.value % 20 === 0) {
      vfx.spawnDizzyStars(f.x, f.y - f.displayHeight - 10);
    }
  }

  // Running speed lines
  for (const f of [p1, p2]) {
    if (f.state === FighterState.RUN && tickRef.value % 3 === 0) {
      vfx.spawnRunSpeedLines(f.x, f.y, f.facing, f.color);
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
      cinematic.reset(); gameSpeed.reset(); gs.koGroundSlamDone = false;
    }
  }

  if (!gs.isTrainingMode && (p1.health <= 0 || p2.health <= 0)) {
    if (!cinematic.koSlowMoTriggered) {
      const killer = p1.health <= 0 ? p2 : p1;
      const loser = p1.health <= 0 ? p1 : p2;
      const killerAttack = killer.currentAttack as string;
      const isDMKill = killerAttack?.startsWith('DM_') || killerAttack?.startsWith('SDM_');
      if (isDMKill) cinematic.triggerDMKOSlowMo();
      else cinematic.triggerKOSlowMo();
      // GameSpeed slow-mo on KO: 15 ticks at 0.2x
      gameSpeed.triggerSlowMo(SLOWMO_KO.slowMoDuration, SLOWMO_KO.slowMoSpeed);
      const koDefender = p1.health <= 0 ? 0 : 1;
      const koAttacker = p1.health <= 0 ? p2 : p1;
      cinematic.triggerHitStop(isDMKill ? 20 : 15, koDefender, koAttacker.facing);
      screenFlash.trigger('#ff2200', 0.35, 15);
      screenShake.trigger(isDMKill ? 18 : 14, 15);
      // KO impact dust particles at hit location
      const hitX = (killer.x + loser.x) / 2;
      const hitY = loser.y - loser.displayHeight / 2;
      cinematic.spawnKODust(hitX, hitY, isDMKill ? 30 : 20);
      camera.triggerKOZoom(hitX, hitY);
      playKO();
      bgm.stop();
      ambient.stop();
      // KOF2002: Double KO announcer when both die simultaneously
      const bothKO = p1.health <= 0 && p2.health <= 0;
      if (bothKO) {
        announcer.doubleKO();
      } else {
        announcer.knockOut();
      }
      // Phase 52: Initialize KO state machine
      const koPlayerIdx = p1.health <= 0 ? 0 : (p2.health <= 0 ? 1 : -1);
      cinematic.triggerKOSequence(koPlayerIdx, false);
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
      // Arcade score: round win bonus
      if (gs.winner === 0) {
        const hpBonus = Math.round(p1.health / p1.maxHealth * 1000);
        addArcadeScore(3000 + hpBonus);
      }
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
    // KOF2002: Draw game announcer when time over with equal health
    if (gs.winner === null) {
      announcer.drawGame();
    } else {
      announcer.timeOver();
    }
  }
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
  if (gs.phase === GamePhase.OPTIONS) {
    renderer.drawOptionsScreen(tickRef.value, gs.optionsCursor, gs.options);
    return;
  }
  if (gs.phase === GamePhase.CONTINUE) {
    renderer.drawContinue(Math.ceil(gs.continueCountdown / 60), gs.continueCursorYes);
    return;
  }
  if (gs.phase === GamePhase.GAME_OVER) {
    if (gs.arcadeComplete) {
      renderer.drawArcadeComplete(gs.gameOverTimer);
    } else {
      renderer.drawGameOver(gs.gameOverTimer);
    }
    return;
  }
  if (gs.phase === GamePhase.NEXT_MATCH) {
    const nextIdx = gs.arcadeOpponentIndex + 1;
    const nextChar = gs.arcadeOpponents[nextIdx];
    renderer.drawNextMatch(gs.arcadeNextMatchTimer, nextChar, gs.arcadeOpponentIndex + 1, gs.arcadeOpponents.length);
    return;
  }
  if (gs.phase === GamePhase.SELECT) {
    renderer.drawCharacterSelect(select, tickRef.value, gs.simplifiedMode, getStage());
    if (select.vsSplashTimer >= 0) {
      renderer.drawVSSplash(select, tickRef.value);
    }
    return;
  }

  if (gs.phase === GamePhase.TEAM_ORDER) {
    if (p1Team && p2Team) {
      renderer.drawTeamOrderSelect(
        tickRef.value,
        p1Team.members,
        p2Team.members,
        gs.teamOrderSlots[0],
        gs.teamOrderSlots[1],
        gs.teamOrderCursor,
        gs.teamOrderSwapMode,
        gs.teamOrderSwapCursor,
        gs.teamOrderReady[0],
        gs.teamOrderReady[1],
      );
    }
    return;
  }

  if (gs.phase === GamePhase.STAGE_SELECT) {
    renderer.drawStageSelect(tickRef.value, gs.stageSelectCursor, gs.stageSelectReady);
    return;
  }
  rounds.tickFade();
  camera.updateFromFighters(p1, p2);
  const perfectPlayer = (gs.phase === GamePhase.KO) ? cinematic.getPerfectPlayer(gs.winner) : null;
  const p1Char = ROSTER.find(c => c.id === p1.charId) || ROSTER[0];
  const p2Char = ROSTER.find(c => c.id === p2.charId) || ROSTER[1];
  renderer.render([p1, p2], camera.x, tickRef.value, gs.phase === GamePhase.KO, gs.winner, screenShake.offsetX, screenShake.offsetY,
    [p1DelayedHealth, p2DelayedHealth], maxModes, perfectPlayer, rounds.p1Wins, rounds.p2Wins, p1Char.nameCn, p2Char.nameCn, gs.isTimeOver, rounds.currentRound, gs.firstAttacker,
    cinematic.hitStopDefender, cinematic.hitStopBias, [p1Char.specialColor, p2Char.specialColor], gs.koTimer, cinematic.koDustParticles, camera.zoom, p1Char.moveList, gs.simplifiedMode,
    cinematic.getKOPhase(), cinematic.getKOTimer());
  renderer.drawProjectiles(projectiles, camera);
  vfx.render(ctx, camera.x);

  if (cinematic.superFlashTimer > 0) {
    // Phase 51: camera zoom during super flash
    renderer.updateSuperFlashZoom(cinematic.superFlashTimer, cinematic.superFlashType === 'HSDM' ? 32 : cinematic.superFlashType === 'SDM' ? 28 : 24);
    const zoom = renderer.getSuperFlashZoom();
    if (zoom > 1.001) {
      ctx.save();
      ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);
    }
    renderer.drawSuperFlash(ctx, cinematic.superFlashTimer, cinematic.superFlashX - camera.x, cinematic.superFlashY, cinematic.superFlashType, cinematic.superFlashMoveName);
    if (zoom > 1.001) {
      ctx.restore();
    }
  } else {
    // Decay zoom back to 1.0
    renderer.updateSuperFlashZoom(0, 24);
  }
  renderer.drawPowerGauges(gauges, maxModes);
  if (gs.phase === GamePhase.INTRO) {
    if (gs.announceSequence.isRunning()) {
      drawAnnounceSequence(ctx, gs.announceSequence, canvas.width, canvas.height);
    } else {
      renderer.drawIntro(gs.phaseTimer, rounds.currentRound, p1Char.nameCn, p2Char.nameCn, getStage());
    }
    // KOF2002: Round transition fade-in from black (30 frames = 0.5s)
    if (gs.phaseTimer < 30) {
      const alpha = 1 - gs.phaseTimer / 30;
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }
  if (gs.phase === GamePhase.KO && gs.announceSequence.isRunning()) {
    drawAnnounceSequence(ctx, gs.announceSequence, canvas.width, canvas.height);
  }
  // Character KO overlay — show winning character name in their color
  if (gs.phase === GamePhase.KO && gs.winner !== null) {
    const winnerChar = gs.winner === 0 ? p1Char : p2Char;
    drawCharacterKOOverlay(
      ctx,
      winnerChar.name,
      winnerChar.nameCn,
      winnerChar.color,
      null,
      gs.koTimer,
    );
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
    const wx = winner.x - camera.x;
    const wy = winner.y;
    if (!drawRyoWinPose(ctx, gs.winQuoteTimer, wx, wy, winner.facing)) {
      drawVictoryPose(ctx, wx, wy, winner.facing, winner.color, '#ffffff30', tickRef.value, winner.charId);
    }
    const charDef = ROSTER.find(c => c.id === winner.charId);
    renderer.drawWinQuote(
      gs.winQuoteTimer,
      gs.winQuoteCharName,
      gs.currentWinQuote,
      gs.winQuoteCharColor,
      charDef ? getPortraitForSize(charDef.id, 'win') ?? charDef.pixelPortrait : undefined,
    );
  }

  if (gs.phase === GamePhase.MATCH_END) {
    if (gs.winner !== null) {
      const w = gs.winner === 0 ? p1 : p2;
      const wx = w.x - camera.x;
      if (!drawRyoWinPose(ctx, gs.phaseTimer, wx, w.y, w.facing)) {
        drawVictoryPose(ctx, wx, w.y, w.facing, w.color, '#ffffff30', tickRef.value, w.charId);
      }
    }
    renderer.drawMatchEnd(gs.winner, rounds.p1Wins, rounds.p2Wins, gs.currentWinQuote || undefined, gs.winner !== null ? (gs.winner === 0 ? '#ff6644' : '#4488ff') : undefined, gs.phaseTimer, gs.winner !== null ? (gs.winner === 0 ? p1 : p2).charId ?? undefined : undefined);
    if (gs.announceSequence.isRunning()) {
      drawAnnounceSequence(ctx, gs.announceSequence, canvas.width, canvas.height);
    }
  }
  if (rounds.fadeAlpha > 0) {
    ctx.save();
    // Main fade overlay
    ctx.fillStyle = `rgba(0,0,0,${rounds.fadeAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Subtle warm edge glow during fade — gives cinematic round transition feel
    if (rounds.isTransitioning() && rounds.fadeAlpha >= 0.9) {
      const glowGrad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 40,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.5,
      );
      glowGrad.addColorStop(0, `rgba(255, 180, 60, ${0.08 * rounds.fadeAlpha})`);
      glowGrad.addColorStop(0.5, `rgba(255, 120, 30, ${0.04 * rounds.fadeAlpha})`);
      glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.restore();
  }
  screenFlash.render(ctx, canvas.width, canvas.height);
  // KO去饱和闪光 + 红色暗角 — 由CinematicState控制
  if (cinematic.koDesaturateTimer > 0) {
    const desatAlpha = cinematic.koDesaturateTimer / 12;
    ctx.save();
    ctx.globalAlpha = Math.min(0.6, desatAlpha * 0.6);
    ctx.fillStyle = '#888888';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
  if (cinematic.koVignetteTimer > 0) {
    const vigAlpha = Math.min(0.5, cinematic.koVignetteTimer / 90 * 0.5);
    ctx.save();
    const vigGrad = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, canvas.height * 0.25,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.8,
    );
    vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vigGrad.addColorStop(0.5, `rgba(80,0,0,${vigAlpha * 0.3})`);
    vigGrad.addColorStop(1, `rgba(120,0,0,${vigAlpha})`);
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
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
    renderer.drawTrainingHUD(training, combatSystem.getComboCount(0), combatSystem.getComboDamage(0), tickRef.value, p1Char.moveList);
  }

  // ===== HUD Info Display (Phase 69) =====
  renderer.updateHUDFps();

  // Match info panel — visible during FIGHTING, INTRO, and KO
  if (gs.phase === GamePhase.FIGHTING || gs.phase === GamePhase.INTRO || gs.phase === GamePhase.KO) {
    renderer.drawMatchInfoPanel({
      gameMode: gs.isTrainingMode ? 'TRAINING' : 'ARCADE',
      currentRound: rounds.currentRound,
      totalRounds: 3,
      stageName: gs.isTrainingMode ? 'TRAINING STAGE' : getStage().toUpperCase(),
    }, tickRef.value);
  }

  // Character info — always visible during fights
  if (gs.phase === GamePhase.FIGHTING || gs.phase === GamePhase.KO) {
    renderer.drawCharacterInfo([p1, p2], gauges, p1Char.nameCn, p2Char.nameCn);
  }

  // HUD debug overlay (F12 toggle)
  if (renderer.isDebugOverlayVisible() && (gs.phase === GamePhase.FIGHTING || gs.phase === GamePhase.KO)) {
    renderer.drawHUDDebugOverlay(
      [p1, p2], gauges, maxModes, camera, tickRef.value,
      [combatSystem.getComboCount(0), combatSystem.getComboCount(1)],
      [combatSystem.getComboDamage(0), combatSystem.getComboDamage(1)],
    );
  }

  // Input display (F3 toggle, non-training mode)
  if (renderer.isInputDisplayVisible() && (gs.phase === GamePhase.FIGHTING || gs.phase === GamePhase.KO)) {
    renderer.drawHUDInputDisplay(
      inputManager.getP1Input(), inputManager.getP2Input(),
      p1.facing, p2.facing,
    );
  }

  // Training mode frame advantage info — only when debug overlay is active
  if (gs.isTrainingMode && (gs.phase === GamePhase.FIGHTING || gs.phase === GamePhase.KO) && renderer.isDebugOverlayVisible()) {
    const p1Atk = p1.currentAttack;
    const atkInfo: import('./rendering/hudInfo.js').TrainingAttackInfo = p1Atk ? (() => {
      const fd = FRAME_DATA[p1Atk as keyof typeof FRAME_DATA];
      if (!fd) return { attackName: null, startup: 0, active: 0, recovery: 0, advantageHit: 0, advantageBlock: 0, lastComboDamage: 0, wasHit: false, wasBlocked: false };
      const total = fd.startup + fd.active + fd.recovery;
      return {
        attackName: p1Atk, startup: fd.startup, active: fd.active, recovery: fd.recovery,
        advantageHit: fd.hitstun - (total - 1), advantageBlock: fd.blockstun - (total - 1),
        lastComboDamage: combatSystem.getComboDamage(0), wasHit: p2.hitstunTimer > 0, wasBlocked: p2.blockstunTimer > 0,
      };
    })() : { attackName: null, startup: 0, active: 0, recovery: 0, advantageHit: 0, advantageBlock: 0, lastComboDamage: 0, wasHit: false, wasBlocked: false };
    renderer.drawHUDTrainingInfo(atkInfo);
  }

  // Announcer overlay (counter hit, MAX activation, etc.)
  announcerOverlay.draw(ctx, canvas.width, canvas.height);

  // KOF2002: Time critical screen edge glow — red vignette when ≤5 seconds
  if (!gs.isTrainingMode && gs.phase === GamePhase.FIGHTING && tickRef.value >= 3300 && tickRef.value < 3600) {
    const urgency = (tickRef.value - 3300) / 300; // 0→1 over last 5 seconds
    const pulse = 0.15 + 0.12 * Math.sin(tickRef.value * 0.3);
    const alpha = urgency * pulse;
    const grad = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, canvas.height * 0.3,
      canvas.width / 2, canvas.height / 2, canvas.height * 0.8,
    );
    grad.addColorStop(0, 'rgba(255, 0, 0, 0)');
    grad.addColorStop(1, `rgba(255, 0, 0, ${alpha})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Pause menu overlay (drawn last, on top of everything)
  if (gs.isPaused && (gs.phase === GamePhase.FIGHTING || gs.phase === GamePhase.KO)) {
    drawPauseMenu(ctx, canvas.width, canvas.height, gs.pauseMenuCursor, gs.pauseMenuTab, p1Char, p2Char);
  }
}

function restartGame(): void {
  bgm.stop();
  ambient.stop();
  gs.resetForNewGame();
  resetArcadeScore();
  tickRef.value = 0;
  select.reset();
  p2AI = null;
  cinematic.reset();
  gameSpeed.reset();
  rounds.fullReset();
  p1DelayedHealth = p1.maxHealth;
  p2DelayedHealth = p2.maxHealth;
}

// ===== Events =====
let f1Down = false;
window.addEventListener('keydown', e => {
  initAudio();
  if (e.code === 'F1') {
    e.preventDefault();
    if (!f1Down) {
      f1Down = true;
      if (gs.isTrainingMode) {
        training.handleKeyShortcuts('F1', true, p1, p2);
      } else {
        gs.debugMode = !gs.debugMode;
      }
    }
  }
  if (gs.isTrainingMode && (e.code === 'F2' || e.code === 'F3' || e.code === 'F4')) {
    e.preventDefault();
    training.handleKeyShortcuts(e.code, true, p1, p2);
  }
  if (e.code === 'KeyM') announcer.toggle();
  if (e.code === 'KeyB') bgm.toggle();
  if (e.code === 'Tab') { e.preventDefault(); gs.simplifiedMode = !gs.simplifiedMode; gs.modeIndicatorTimer = 120; }
  if (e.code === 'KeyN') { const s = cycleStage(); bgm.setStage(s); console.log('Stage:', s); gs.stageIndicatorTimer = 120; }
  // HUD Info Display toggles
  if (e.code === 'F12') { e.preventDefault(); renderer.toggleDebugOverlay(); }
  if (!gs.isTrainingMode && e.code === 'F3') { e.preventDefault(); renderer.toggleInputDisplay(); }
  if (e.code === 'F6') { e.preventDefault(); renderer.toggleCRT(); }
});
window.addEventListener('keyup', e => {
  if (e.code === 'F1') f1Down = false;
  if (gs.isTrainingMode) training.handleKeyShortcuts(e.code, false, p1, p2);
});

// ===== Start =====
new GameLoop(update, render).start();
