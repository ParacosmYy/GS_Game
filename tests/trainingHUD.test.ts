import { describe, it, expect } from 'vitest';
import { CN_MOVE_NAMES } from '../src/rendering/moveNameDisplay.js';
import { RYO_MOVE_LIST } from '../src/content/characters/ryo/commands/ryoCommands.js';
import { KYO_MOVE_LIST } from '../src/content/characters/kyo/commands/kyoCommands.js';
import { IORI_MOVE_LIST } from '../src/content/characters/iori/commands/ioriCommands.js';
import { GameStateManager } from '../src/state/gameStateManager.js';

describe('CN_MOVE_NAMES coverage', () => {
  it('has Chinese names for all 3 characters HSDM attacks', () => {
    // Ryo HSDM
    expect(CN_MOVE_NAMES['HSDM_RYUKO_RANBU']).toBe('龍虎乱舞');
    // Kyo HSDM
    expect(CN_MOVE_NAMES['HSDM_OROCHINAGI']).toBe('大蛇薙');
    // Iori HSDM
    expect(CN_MOVE_NAMES['HSDM_YAOTOME']).toBe('八咫烏');
  });

  it('has Chinese names for command normals of all 3 characters', () => {
    // Ryo
    expect(CN_MOVE_NAMES['RYO_TSURIZAO']).toBe('釣瓶打');
    expect(CN_MOVE_NAMES['RYO_ORISHI']).toBe('卸し');
    // Kyo
    expect(CN_MOVE_NAMES['CMD_GOFU_YOU']).toBe('轟斧陽');
    expect(CN_MOVE_NAMES['CMD_88SHIKI']).toBe('八拾八式');
    expect(CN_MOVE_NAMES['CMD_NARAKU']).toBe('奈落落とし');
    // Iori
    expect(CN_MOVE_NAMES['IORI_YUMEYUMI']).toBe('弓月');
    expect(CN_MOVE_NAMES['IORI_KATANUGI']).toBe('鉈薙');
    expect(CN_MOVE_NAMES['IORI_YUKIWARUI']).toBe('雪割');
  });

  it('has Chinese names for special moves', () => {
    // Ryo
    expect(CN_MOVE_NAMES['RYO_KOOU']).toBe('虎煌拳');
    expect(CN_MOVE_NAMES['RYO_KO_HOU']).toBe('虎咆');
    // Kyo
    expect(CN_MOVE_NAMES['KYO_ONIYAKI']).toBe('鬼焼き');
    expect(CN_MOVE_NAMES['KYO_YAMIBARAI']).toBe('闇払い');
    // Iori
    expect(CN_MOVE_NAMES['IORI_AOIHANA']).toBe('葵花');
    expect(CN_MOVE_NAMES['IORI_KUZUKAZE']).toBe('屑風');
  });
});

describe('Move list HSDM category', () => {
  it('Ryo has HSDM entry in move list', () => {
    const hsdm = RYO_MOVE_LIST.filter(m => m.type === 'hsdm');
    expect(hsdm.length).toBeGreaterThanOrEqual(1);
  });

  it('Kyo has HSDM entry in move list', () => {
    const hsdm = KYO_MOVE_LIST.filter(m => m.type === 'hsdm');
    expect(hsdm.length).toBeGreaterThanOrEqual(1);
  });

  it('Iori has HSDM entry in move list', () => {
    const hsdm = IORI_MOVE_LIST.filter(m => m.type === 'hsdm');
    expect(hsdm.length).toBeGreaterThanOrEqual(1);
  });

  it('all HSDM entries have attackTypeKey for name display', () => {
    for (const list of [RYO_MOVE_LIST, KYO_MOVE_LIST, IORI_MOVE_LIST]) {
      const hsdm = list.filter(m => m.type === 'hsdm');
      for (const m of hsdm) {
        expect(m.attackTypeKey).toBeDefined();
        expect(CN_MOVE_NAMES[m.attackTypeKey!]).toBeDefined();
      }
    }
  });
});

describe('Move list coverage completeness', () => {
  it('all special+ moves have Chinese name mappings', () => {
    for (const list of [RYO_MOVE_LIST, KYO_MOVE_LIST, IORI_MOVE_LIST]) {
      const specials = list.filter(m => ['special', 'dm', 'sdm', 'hsdm'].includes(m.type ?? ''));
      for (const m of specials) {
        if (m.attackTypeKey) {
          expect(CN_MOVE_NAMES[m.attackTypeKey], `Missing CN name for ${m.attackTypeKey}`).toBeDefined();
        }
      }
    }
  });
});

describe('GameStateManager round score breakdown', () => {
  it('lastRoundScoreBreakdown starts null', () => {
    const gs = new GameStateManager();
    expect(gs.lastRoundScoreBreakdown).toBeNull();
  });

  it('can store and retrieve breakdown', () => {
    const gs = new GameStateManager();
    const breakdown = {
      baseScore: 3000,
      hpBonus: 750,
      perfectBonus: 5000,
      totalScore: 8750,
      isPerfect: true,
    };
    gs.lastRoundScoreBreakdown = breakdown;
    expect(gs.lastRoundScoreBreakdown).toEqual(breakdown);
    expect(gs.lastRoundScoreBreakdown!.isPerfect).toBe(true);
  });

  it('resetForNextRound clears breakdown', () => {
    const gs = new GameStateManager();
    gs.lastRoundScoreBreakdown = {
      baseScore: 3000,
      hpBonus: 500,
      perfectBonus: 0,
      totalScore: 3500,
      isPerfect: false,
    };
    gs.resetForNextRound();
    expect(gs.lastRoundScoreBreakdown).toBeNull();
  });
});
