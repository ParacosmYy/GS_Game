/**
 * 采样音效系统 — 离线预渲染所有音效到AudioBuffer
 * 替代实时振荡器合成，每帧播放仅消耗一个BufferSourceNode
 * v2: 多层噪声纹理、子低音共鸣、金属共鸣、能量蓄积
 *
 * Character-specific render functions live in each character's content package
 * (src/content/characters/<name>/audio/<name>Sampler.ts) and are registered
 * via initCharacterAudio() during initSampler().
 *
 * Generic render functions are in ./samplerRenderers.ts.
 */
import { getCtx } from './audioCtx.js';
import { initCharacterAudio } from './registerCharacterAudio.js';
import type { SampleRenderer } from './registerCharacterAudio.js';
import {
  renderHitLight, renderHitHeavy, renderBlock, renderSpecial, renderDM,
  renderKO, renderCounter, renderGuardCrush, renderChip, renderWallBounce,
  renderGroundBounce, renderCancel, renderWire, renderJuggle,
  renderSuperFlash, renderSuperFlashHSDM, renderThrow, renderThrowEscape,
  renderSelect, renderCursorMove, renderCursorConfirm, renderVictory,
  renderRoll, renderLanding, renderProjectile, renderMAXActivation,
  renderRoundCall, renderTimeOver, renderPerfect, renderFight,
  renderQuickStand, renderStep, renderHitCrit, renderDust, renderAirHit,
  renderWallBounceHeavy, renderGuardBreak, renderChargeUp,
  renderBlockSpecial, renderBlockDM, renderSpecialLight, renderSpecialHeavy,
  renderKOHit, renderLandingHeavy, renderAccentFire, renderAccentPurple,
  renderAccentIce, renderAccentGeneric, renderDizzyHit, renderPerfectKO,
  renderRoundStart, renderTimeUp, renderWhoosh, renderWhooshHeavy,
  renderFootstep, renderJump, renderLandingNormal, generateBattleBGM,
  renderStunRecovery,
} from './samplerRenderers.js';

type SampleId =
  | 'hit_light' | 'hit_heavy' | 'block' | 'block_heavy'
  | 'special' | 'dm' | 'ko' | 'counter' | 'guard_crush'
  | 'chip' | 'wall_bounce' | 'cancel' | 'wire' | 'juggle'
  | 'super_flash' | 'super_flash_sdm' | 'super_flash_hsdm'
  | 'throw' | 'throw_escape' | 'select' | 'victory'
  | 'roll' | 'landing' | 'projectile' | 'max_activation'
  | 'round_call' | 'time_over' | 'perfect' | 'fight'
  | 'quick_stand' | 'step'
  | 'hit_crit' | 'dust' | 'air_hit' | 'wall_bounce_heavy'
  | 'guard_break' | 'charge_up'
  | 'block_special' | 'block_dm' | 'special_light' | 'special_heavy'
  | 'ko_hit' | 'landing_heavy'
  | 'accent_fire' | 'accent_purple' | 'accent_ice' | 'accent_generic'
  | 'dizzy_hit' | 'ground_bounce'
  | 'perfect_ko' | 'round_start' | 'time_up'
  | 'battle_bgm'
  | 'whoosh' | 'whoosh_heavy' | 'footstep' | 'jump' | 'landing_normal'
  | 'ryo_koouken' | 'ryo_ko_hou' | 'ryo_hien' | 'ryo_haou'
  | 'ryo_tsurizao' | 'ryo_orishi'
  | 'ryo_hio_hacker' | 'ryo_zanretsu_ken'
  | 'kyo_yamibarai' | 'kyo_oniyaki' | 'kyo_aragami' | 'kyo_dokugami'
  | 'kyo_75kai' | 'kyo_red_kick' | 'kyo_orochinagi'
  | 'iori_aoihana' | 'iori_yamibarai' | 'iori_oniyaki' | 'iori_kototsuki'
  | 'iori_kuzukaze' | 'iori_yumeyumi' | 'iori_katanugi' | 'iori_yaotome'
  | 'cursor_move' | 'cursor_confirm'
  | 'stun_recovery';

const samples = new Map<SampleId, AudioBuffer>();
let initialized = false;

function makeBuffer(ctx: AudioContext, data: Float32Array): AudioBuffer {
  const buf = ctx.createBuffer(1, data.length, ctx.sampleRate);
  buf.getChannelData(0).set(data);
  return buf;
}

// === 初始化：预渲染所有采样 ===

export function initSampler(): void {
  if (initialized) return;
  const ctx = getCtx();
  const sr = ctx.sampleRate;

  const renderers: [SampleId, (sr: number) => Float32Array][] = [
    ['hit_light', renderHitLight],
    ['hit_heavy', renderHitHeavy],
    ['block', sr => renderBlock(sr, false)],
    ['block_heavy', sr => renderBlock(sr, true)],
    ['special', renderSpecial],
    ['dm', renderDM],
    ['ko', renderKO],
    ['counter', renderCounter],
    ['guard_crush', renderGuardCrush],
    ['chip', renderChip],
    ['wall_bounce', renderWallBounce],
    ['cancel', renderCancel],
    ['wire', renderWire],
    ['juggle', renderJuggle],
    ['super_flash', sr => renderSuperFlash(sr, false)],
    ['super_flash_sdm', sr => renderSuperFlash(sr, true)],
    ['super_flash_hsdm', sr => renderSuperFlashHSDM(sr)],
    ['throw', renderThrow],
    ['throw_escape', renderThrowEscape],
    ['select', renderSelect],
    ['cursor_move', renderCursorMove],
    ['cursor_confirm', renderCursorConfirm],
    ['victory', renderVictory],
    ['roll', renderRoll],
    ['landing', renderLanding],
    ['projectile', renderProjectile],
    ['max_activation', renderMAXActivation],
    ['round_call', renderRoundCall],
    ['time_over', renderTimeOver],
    ['perfect', renderPerfect],
    ['fight', renderFight],
    ['quick_stand', renderQuickStand],
    ['step', renderStep],
    // 新增音效
    ['hit_crit', renderHitCrit],
    ['dust', renderDust],
    ['air_hit', renderAirHit],
    ['wall_bounce_heavy', renderWallBounceHeavy],
    ['guard_break', renderGuardBreak],
    ['charge_up', renderChargeUp],
    // 打击音效分层
    ['block_special', renderBlockSpecial],
    ['block_dm', renderBlockDM],
    ['special_light', renderSpecialLight],
    ['special_heavy', renderSpecialHeavy],
    // KO命中 + 重落地
    ['ko_hit', renderKOHit],
    ['landing_heavy', renderLandingHeavy],
    // 角色特有音效点缀
    ['accent_fire', renderAccentFire],
    ['accent_purple', renderAccentPurple],
    ['accent_ice', renderAccentIce],
    ['accent_generic', renderAccentGeneric],
    // 新增：Dizzy Hit + Ground Bounce
    ['dizzy_hit', renderDizzyHit],
    ['ground_bounce', renderGroundBounce],
    // 新增：Perfect KO / Round Start / Time Up
    ['perfect_ko', renderPerfectKO],
    ['round_start', renderRoundStart],
    ['time_up', renderTimeUp],
    // 基础BGM
    ['battle_bgm', generateBattleBGM],
    // 运动音效：挥拳风声 / 脚步 / 跳跃 / 落地
    ['whoosh', renderWhoosh],
    ['whoosh_heavy', renderWhooshHeavy],
    ['footstep', renderFootstep],
    ['jump', renderJump],
    ['landing_normal', renderLandingNormal],
    ['stun_recovery', renderStunRecovery],
  ];

  for (const [id, renderer] of renderers) {
    samples.set(id, makeBuffer(ctx, renderer(sr)));
  }

  // Register character-specific audio from content packages
  const charRegister = (id: string, renderer: SampleRenderer) => {
    samples.set(id as SampleId, makeBuffer(ctx, renderer(sr)));
  };
  initCharacterAudio(charRegister);

  initialized = true;
}

// === 播放接口 ===

/** Add EQ boost for hit-type samples (3kHz peaking, +3dB). */
function addHitEQ(ctx: AudioContext, sampleId: string, destination: AudioNode): AudioNode {
  if (sampleId.startsWith('hit_') || sampleId === 'ko_hit') {
    const eq = ctx.createBiquadFilter();
    eq.type = 'peaking';
    eq.frequency.value = 3000;
    eq.Q.value = 1.5;
    eq.gain.value = 3;
    eq.connect(destination);
    return eq;
  }
  return destination;
}

/** Add a short sub-bass resonance pulse for dm-type samples. */
function addSubBassPulse(ctx: AudioContext, sampleId: string, now: number): void {
  if (sampleId === 'dm' || sampleId === 'ko' || sampleId === 'guard_break'
    || sampleId === 'wall_bounce_heavy' || sampleId === 'super_flash'
    || sampleId === 'super_flash_sdm' || sampleId === 'super_flash_hsdm'
    || sampleId === 'max_activation'
    || sampleId === 'ko_hit' || sampleId === 'landing_heavy'
    || sampleId === 'ground_bounce') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 60;
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }
}

function play(id: SampleId, volume: number = 1.0, playbackRate: number = 1.0): void {
  const buf = samples.get(id);
  if (!buf) return;
  const ctx = getCtx();
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = playbackRate;
  const gain = ctx.createGain();
  gain.gain.value = volume;
  // Post-processing: EQ for hit samples
  const output = addHitEQ(ctx, id, ctx.destination);
  src.connect(gain).connect(output);
  src.start();
  // Post-processing: sub-bass resonance for heavy samples
  addSubBassPulse(ctx, id, ctx.currentTime);
}

// 带变调的播放（用于连击音高递增）
// playbackRate randomized +-2% to avoid identical timbre on repeated hits
function playPitched(id: SampleId, combo: number, volume: number = 1.0): void {
  const baseRate = 1 + Math.min(combo, 15) * 0.04;
  const randomization = 0.98 + Math.random() * 0.04; // 0.98 ~ 1.02
  play(id, volume, baseRate * randomization);
}

// === 公开API — 直接替换原sfx.ts函数签名 ===

export function playHit(intensity: number = 1, combo: number = 0): void {
  initSampler(); playPitched('hit_light', combo, Math.min(intensity * 0.8, 1));
}
export function playHeavyHit(intensity: number = 1, combo: number = 0): void {
  initSampler(); playPitched('hit_heavy', combo, Math.min(intensity * 0.8, 1));
}
export function playBlock(heavy: boolean = false): void {
  initSampler(); play(heavy ? 'block_heavy' : 'block');
}
export function playSpecial(): void { initSampler(); play('special'); }
export function playDM(): void { initSampler(); play('dm'); }
export function playKO(): void { initSampler(); play('ko'); }
export function playSuperFlash(flashType: 'DM' | 'SDM' | 'HSDM' = 'DM'): void {
  initSampler();
  if (flashType === 'HSDM') play('super_flash_hsdm');
  else if (flashType === 'SDM') play('super_flash_sdm');
  else play('super_flash');
}
export function playCounter(): void { initSampler(); play('counter'); }

/** Combo milestone sound — plays at combo thresholds (5, 10, 15+) for escalating intensity */
export function playComboMilestone(combo: number): void {
  if (combo < 5) return;
  initSampler();
  if (combo >= 15) {
    // Extreme combo — layered: super flash + heavy hit
    play('super_flash', 0.4);
    play('ko_hit', 0.5);
  } else if (combo >= 10) {
    // High combo — counter hit ring sound
    play('counter', 0.5);
  } else if (combo >= 5) {
    // 5-hit combo — subtle escalation
    play('hit_crit', 0.35);
  }
}
export function playGuardCrush(): void { initSampler(); play('guard_crush'); }
export function playChip(): void { initSampler(); play('chip'); }
export function playWallBounce(): void { initSampler(); play('wall_bounce'); }
export function playCancel(): void { initSampler(); play('cancel'); }
export function playWire(): void { initSampler(); play('wire'); }
export function playJuggleHit(combo: number = 0): void { initSampler(); playPitched('juggle', combo); }

export { initAudio } from './audioCtx.js';
export function playThrow(): void { initSampler(); play('throw'); }
export function playSelect(): void { initSampler(); play('select'); }
export function playVictoryFanfare(): void { initSampler(); play('victory'); }
export function playRoll(): void { initSampler(); play('roll'); }
export function playThrowEscape(): void { initSampler(); play('throw_escape'); }
export function playLanding(): void { initSampler(); play('landing'); }
export function playProjectileLaunch(): void { initSampler(); play('projectile'); }
export function playMAXActivation(): void { initSampler(); play('max_activation'); }
export function playRoundCall(): void { initSampler(); play('round_call'); }
export function playTimeOver(): void { initSampler(); play('time_over'); }
export function playPerfect(): void { initSampler(); play('perfect'); }
export function playFight(): void { initSampler(); play('fight'); }
export function playQuickStand(): void { initSampler(); play('quick_stand'); }
export function playStep(): void { initSampler(); play('step'); }

// 新增音效公开API
export function playCritHit(): void { initSampler(); play('hit_crit'); }
export function playDust(): void { initSampler(); play('dust', 0.5); }
export function playAirHit(): void { initSampler(); play('air_hit', 0.8); }
export function playWallBounceHeavy(): void { initSampler(); play('wall_bounce_heavy'); }
export function playGuardBreak(): void { initSampler(); play('guard_break'); }
export function playChargeUp(): void { initSampler(); play('charge_up', 0.6); }

// 打击音效分层公开API
export function playBlockSpecial(): void { initSampler(); play('block_special'); }
export function playBlockDM(): void { initSampler(); play('block_dm'); }
export function playSpecialLight(): void { initSampler(); play('special_light'); }
export function playSpecialHeavy(): void { initSampler(); play('special_heavy'); }

// KO命中 + 重落地公开API
export function playKOHit(): void { initSampler(); play('ko_hit'); }
export function playLandingHeavy(): void { initSampler(); play('landing_heavy'); }

// === 角色特有音效点缀系统 ===

/** 角色属性分类 — 决定使用哪种能量点缀音效 */
type CharacterAccent = 'fire' | 'purple' | 'ice' | 'generic';

/** 根据角色ID返回其能量属性 */
function getCharacterAccent(charId: string): CharacterAccent {
  switch (charId) {
    // 火属性: Kyo, Mai, Chris, Joe, K', Andy
    case 'kyo': case 'mai': case 'chris': case 'joe': case 'kdash': case 'andy':
      return 'fire';
    // 暗能量: Iori, Mature, Vice, Yamazaki
    case 'iori': case 'mature': case 'vice': case 'yamazaki':
      return 'purple';
    // 冰属性: Kula
    case 'kula':
      return 'ice';
    // 默认: 所有其他角色
    default:
      return 'generic';
  }
}

/** 播放角色特有的能量点缀音效 — 叠加在必杀技/DM命中音效上 */
export function playHitAccent(charId: string, isDM: boolean = false): void {
  initSampler();
  const accent = getCharacterAccent(charId);
  const accentMap: Record<CharacterAccent, SampleId> = {
    fire: 'accent_fire',
    purple: 'accent_purple',
    ice: 'accent_ice',
    generic: 'accent_generic',
  };
  // DM时音量更大
  play(accentMap[accent], isDM ? 0.9 : 0.55);
}

/** 播放重落地音效 — KO落地或从高处落下时使用 */
export function playHeavyLanding(): void { initSampler(); play('landing_heavy'); }

// === 倒计时音效 ===

/** Continue画面倒计时滴答声 — 短促高频beep */
export function playCountdownTick(urgent: boolean = false): void {
  const ctx = getCtx();
  if (ctx.state === 'suspended') return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = urgent ? 1200 : 800;
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(urgent ? 0.15 : 0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + (urgent ? 0.12 : 0.06));
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + (urgent ? 0.12 : 0.06));
}

/** Continue画面倒计时归零蜂鸣声 — 低沉长beep */
export function playCountdownBuzzer(): void {
  const ctx = getCtx();
  if (ctx.state === 'suspended') return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.5);
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.linearRampToValueAtTime(0.15, now + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.5);
}

/** 播放Dizzy Hit音效 — DIZZY状态被命中时叠加 */
export function playDizzyHit(): void { initSampler(); play('dizzy_hit', 0.8); }
export function playStunRecovery(): void { initSampler(); play('stun_recovery', 0.7); }

/** 播放Ground Bounce音效 — 角色从地面弹起时 */
export function playGroundBounce(): void { initSampler(); play('ground_bounce'); }

// === 新增 SFX 公开 API: Perfect KO / Round Start / Time Up ===

/** 播放Perfect KO音效 — 对手未造成任何伤害时KO对手 */
export function playPerfectKO(): void { initSampler(); play('perfect_ko'); }

/** 播放Round Start音效 — 回合开始提示 */
export function playRoundStart(): void { initSampler(); play('round_start'); }

/** 播放Time Up音效 — 时间耗尽提示 */
export function playTimeUp(): void { initSampler(); play('time_up'); }

/** 获取Battle BGM AudioBuffer — 用于循环播放战斗背景音乐 */
export function getBattleBGM(): AudioBuffer | null {
  initSampler();
  return samples.get('battle_bgm') ?? null;
}

/** 导出样本Map用于测试 */
export function _getSamples(): Map<SampleId, AudioBuffer> { return samples; }
/** 导出SampleId类型用于测试 */
export type { SampleId };

// === 运动音效公开 API ===

/** 播放挥拳风声 — 轻攻击startup帧使用 */
export function playWhoosh(): void { initSampler(); play('whoosh', 0.6); }

/** 播放蓄力气声 — 重攻击startup帧使用 */
export function playHeavyWhoosh(): void { initSampler(); play('whoosh_heavy', 0.65); }

/** 播放脚步声 — idle/walk/run帧切换时触发 */
export function playFootstep(): void { initSampler(); play('footstep', 0.4); }

/** 播放起跳音效 — 角色离地瞬间触发 */
export function playJump(): void { initSampler(); play('jump', 0.55); }

/** 播放普通落地音效 — 角色从跳跃落地时触发(非KO/非重落地) */
export function playLandingNormal(): void { initSampler(); play('landing_normal', 0.55); }

// === Ryo 必杀技专属音效 API ===

/** 播放虎煌拳音效 — 能量弹发射：低频 whoosh + 高频 sizzle */
export function playKoouken(): void { initSampler(); play('ryo_koouken'); }

/** 播放虎咆音效 — 升龙拳式上勾：上升 sweep + 打击感 */
export function playKoHou(): void { initSampler(); play('ryo_ko_hou'); }

/** 播放飛燕音效 — 飞踢：快速风切 + 踢击 */
export function playHien(): void { initSampler(); play('ryo_hien'); }

/** 播放霸王翔吼拳音效 — 强力能量弹：比 KOOU 更厚重 */
export function playHaou(): void { initSampler(); play('ryo_haou'); }

/** 播放钓瓶打音效 — ->+A 手刀劈击：清脆slice声 */
export function playSlice(): void { initSampler(); play('ryo_tsurizao', 0.65); }

/** 播放落蹴音效 — +B 低扫踢：低沉thud声 */
export function playThudKick(): void { initSampler(); play('ryo_orishi', 0.6); }

/** 播放氷果斬音效 — ->+A 突进技：重击冲刺声 */
export function playHioHacker(): void { initSampler(); play('ryo_hio_hacker', 0.65); }

/** 播放斩裂拳音效 — qcb+P 连打技：快速连击声 */
export function playZanretsuKen(): void { initSampler(); play('ryo_zanretsu_ken', 0.6); }

// === Kyo 必杀技专属音效 API ===

/** 播放闇払い音效 — 火焰弹：低频火焰推进 + 高频噼啪 */
export function playKyoYamibarai(): void { initSampler(); play('kyo_yamibarai'); }

/** 播放鬼焼き音效 — 升龙火焰拳：上升sweep + 火焰打击 */
export function playKyoOniyaki(): void { initSampler(); play('kyo_oniyaki'); }

/** 播放荒咬み音效 — rekka起手火焰拳：锐利火拳冲击 */
export function playKyoAragami(): void { initSampler(); play('kyo_aragami', 0.65); }

/** 播放毒咬み音效 — 强rekka火焰拳：沉重火焰爆炸 */
export function playKyoDokugami(): void { initSampler(); play('kyo_dokugami', 0.65); }

/** 播放75式改音效 — 双段踢：两次短促冲击 */
export function playKyo75Kai(): void { initSampler(); play('kyo_75kai', 0.6); }

/** 播放R.E.D. Kick音效 — 弧形飞踢：频率下扫 + 风切 */
export function playKyoRedKick(): void { initSampler(); play('kyo_red_kick', 0.65); }

/** 播放大蛇薙音效 — DM巨大火焰波：低频隆隆 + 中频火焰 + 高频噼啪 */
export function playKyoOrochinagi(): void { initSampler(); play('kyo_orochinagi'); }

// === Iori 必杀技专属音效 API ===

/** 播放葵花音效 — rekka连拳：暗爪锯齿波 + 噪声撕裂 */
export function playIoriAoihana(): void { initSampler(); play('iori_aoihana', 0.65); }

/** 播放闇払い音效 — 暗色弹：锯齿波下扫 + 带通噪声暗核 + 子低音 */
export function playIoriYamibarai(): void { initSampler(); play('iori_yamibarai'); }

/** 播放鬼焼き音效 — 升龙暗焰：正弦上升扫频 + 噪声爆发 + 低频闷响 */
export function playIoriOniyaki(): void { initSampler(); play('iori_oniyaki'); }

/** 播放琴月陰音效 — 突进暗能量：锯齿波冲刺 + 噪声扫频 + 子低音 */
export function playIoriKototsuki(): void { initSampler(); play('iori_kototsuki', 0.65); }

/** 播放屑風音效 — 指令投：方波闷击 + 噪声碎裂 + 子低音 */
export function playIoriKuzukaze(): void { initSampler(); play('iori_kuzukaze', 0.6); }

/** 播放夢弾音效 — overhead 2连击：两段带通噪声爆发 */
export function playIoriYumeyumi(): void { initSampler(); play('iori_yumeyumi', 0.6); }

/** 播放邯鄲音效 — 下段扫踢：高通噪声swoosh + 正弦下扫 */
export function playIoriKatanugi(): void { initSampler(); play('iori_katanugi', 0.6); }

/** 播放八稚女音效 — DM暗色连突：多层暗能量叠加 */
export function playIoriYaotome(): void { initSampler(); play('iori_yaotome'); }

// === Character-themed normal attack accents ===

/** Kyo normal attack hit — fire-crackle accent */
export function playHitAccentFire(): void { initSampler(); play('accent_fire', 0.6); }

/** Iori normal attack hit — dark-purple accent */
export function playHitAccentPurple(): void { initSampler(); play('accent_purple', 0.6); }

// === Menu navigation SFX ===

export function playCursorMove(): void { initSampler(); play('cursor_move', 0.5); }
export function playCursorConfirm(): void { initSampler(); play('cursor_confirm', 0.7); }
