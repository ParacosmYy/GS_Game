/**
 * Kyo Animation Metadata & Commands Regression Tests
 *
 * Validates Kyo's animation metadata structure, query functions, and command data.
 */
import { describe, it, expect } from 'vitest';
import {
  KYO_ANIMATION_META,
  getKyoAnimationNames,
  getKyoAnimMeta,
  getKyoAttackAnimations,
  getKyoLoopAnimations,
  type AnimationMeta,
} from '../src/content/characters/kyo/animations/kyoAnimations.js';
import {
  KYO_MOVE_LIST,
  KYO_WIN_QUOTES,
  KYO_AVAILABLE_ACTIONS,
  type KyoMoveEntry,
} from '../src/content/characters/kyo/commands/kyoCommands.js';
import {
  IORI_ANIMATION_META,
  getIoriAnimationNames,
  getIoriAnimMeta,
  getIoriAttackAnimations,
  getIoriLoopAnimations,
} from '../src/content/characters/iori/animations/ioriAnimations.js';
import {
  IORI_MOVE_LIST,
  IORI_WIN_QUOTES,
  IORI_AVAILABLE_ACTIONS,
} from '../src/content/characters/iori/commands/ioriCommands.js';

// ===== KYO_ANIMATION_META =====

function validateMeta(m: AnimationMeta, label: string) {
  expect(m.name, `${label} name`).toBeTruthy();
  expect(['loop', 'once', 'attack'], `${label} type`).toContain(m.type);
  expect(m.totalFrames, `${label} totalFrames`).toBeGreaterThan(0);
  expect(m.ticksPerFrame, `${label} ticksPerFrame`).toBeGreaterThan(0);
  expect(typeof m.loop, `${label} loop`).toBe('boolean');
  expect(['snap', 'ease_in', 'ease_out', 'blend'], `${label} transition`).toContain(m.transition);
  expect(m.description, `${label} description`).toBeTruthy();
}

describe('KYO_ANIMATION_META', () => {
  it('has entries for all major categories', () => {
    const types = new Set(Object.values(KYO_ANIMATION_META).map(m => m.type));
    expect(types.has('loop')).toBe(true);
    expect(types.has('once')).toBe(true);
    expect(types.has('attack')).toBe(true);
  });

  it('all entries have valid structure', () => {
    for (const [key, meta] of Object.entries(KYO_ANIMATION_META)) {
      validateMeta(meta, `kyo/${key}`);
    }
  });

  it('loop animations have loop=true', () => {
    const loops = Object.values(KYO_ANIMATION_META).filter(m => m.type === 'loop');
    for (const m of loops) {
      expect(m.loop, `${m.name} loop`).toBe(true);
    }
  });

  it('attack animations have loop=false', () => {
    const attacks = Object.values(KYO_ANIMATION_META).filter(m => m.type === 'attack');
    for (const m of attacks) {
      expect(m.loop, `${m.name} loop`).toBe(false);
    }
  });

  it('once animations have loop=false', () => {
    const once = Object.values(KYO_ANIMATION_META).filter(m => m.type === 'once');
    for (const m of once) {
      expect(m.loop, `${m.name} loop`).toBe(false);
    }
  });

  it('has basic movement animations', () => {
    for (const name of ['idle', 'walk_forward', 'walk_backward', 'run', 'crouch', 'block']) {
      expect(KYO_ANIMATION_META[name], name).toBeDefined();
      expect(KYO_ANIMATION_META[name].loop).toBe(true);
    }
  });

  it('has jump variants', () => {
    for (const name of ['jump_up', 'jump_forward', 'jump_backward']) {
      expect(KYO_ANIMATION_META[name], name).toBeDefined();
      expect(KYO_ANIMATION_META[name].type).toBe('once');
    }
  });

  it('has standing normals', () => {
    for (const name of ['stand_a', 'stand_b', 'stand_c', 'stand_d']) {
      expect(KYO_ANIMATION_META[name], name).toBeDefined();
      expect(KYO_ANIMATION_META[name].type).toBe('attack');
    }
  });

  it('has crouching normals', () => {
    for (const name of ['crouch_a', 'crouch_b', 'crouch_c', 'crouch_d']) {
      expect(KYO_ANIMATION_META[name], name).toBeDefined();
    }
  });

  it('has specials', () => {
    for (const name of ['kyo_yamibarai', 'kyo_oniyaki', 'kyo_75kai', 'kyo_red_kick']) {
      expect(KYO_ANIMATION_META[name], name).toBeDefined();
    }
  });

  it('has rekka chain animations', () => {
    expect(KYO_ANIMATION_META.kyo_aragami).toBeDefined();
    expect(KYO_ANIMATION_META.kyo_dokugami).toBeDefined();
    expect(KYO_ANIMATION_META.kyo_aragami_konokizu).toBeDefined();
    expect(KYO_ANIMATION_META.kyo_aragami_yanosabi).toBeDefined();
  });

  it('has DM/SDM/HSDM', () => {
    expect(KYO_ANIMATION_META.dm_orochinagi).toBeDefined();
    expect(KYO_ANIMATION_META.sdm_orochinagi).toBeDefined();
    expect(KYO_ANIMATION_META.hsdm_orochinagi).toBeDefined();
  });

  it('heavier normals have more frames', () => {
    expect(KYO_ANIMATION_META.stand_d.totalFrames).toBeGreaterThan(KYO_ANIMATION_META.stand_a.totalFrames);
    expect(KYO_ANIMATION_META.stand_c.totalFrames).toBeGreaterThan(KYO_ANIMATION_META.stand_a.totalFrames);
  });

  it('yamibarai has more ticks than any normal', () => {
    const maxNormalTicks = Math.max(
      KYO_ANIMATION_META.stand_d.totalFrames * KYO_ANIMATION_META.stand_d.ticksPerFrame,
      KYO_ANIMATION_META.crouch_d.totalFrames * KYO_ANIMATION_META.crouch_d.ticksPerFrame,
    );
    const yamibarai = KYO_ANIMATION_META.kyo_yamibarai.totalFrames * KYO_ANIMATION_META.kyo_yamibarai.ticksPerFrame;
    expect(yamibarai).toBeGreaterThan(maxNormalTicks);
  });

  it('DM has more frames than most specials', () => {
    const dm = KYO_ANIMATION_META.dm_orochinagi.totalFrames;
    expect(dm).toBeGreaterThan(KYO_ANIMATION_META.kyo_75kai.totalFrames);
  });
});

// ===== Query Functions =====

describe('getKyoAnimationNames', () => {
  it('returns all animation names', () => {
    const names = getKyoAnimationNames();
    expect(names.length).toBeGreaterThan(20);
    expect(names).toContain('idle');
    expect(names).toContain('stand_a');
    expect(names).toContain('dm_orochinagi');
  });

  it('matches KYO_ANIMATION_META keys', () => {
    const names = getKyoAnimationNames();
    const keys = Object.keys(KYO_ANIMATION_META);
    expect(names.length).toBe(keys.length);
  });
});

describe('getKyoAnimMeta', () => {
  it('returns meta for existing animation', () => {
    const meta = getKyoAnimMeta('idle');
    expect(meta).toBeDefined();
    expect(meta!.name).toBe('idle');
    expect(meta!.loop).toBe(true);
  });

  it('returns undefined for non-existent', () => {
    expect(getKyoAnimMeta('nonexistent')).toBeUndefined();
  });
});

describe('getKyoAttackAnimations', () => {
  it('returns only attack type animations', () => {
    const attacks = getKyoAttackAnimations();
    expect(attacks.length).toBeGreaterThan(5);
    expect(attacks.every(m => m.type === 'attack')).toBe(true);
  });

  it('includes normals and specials', () => {
    const names = getKyoAttackAnimations().map(m => m.name);
    expect(names).toContain('stand_a');
    expect(names).toContain('kyo_yamibarai');
    expect(names).toContain('dm_orochinagi');
  });
});

describe('getKyoLoopAnimations', () => {
  it('returns only looping animations', () => {
    const loops = getKyoLoopAnimations();
    expect(loops.length).toBeGreaterThan(0);
    expect(loops.every(m => m.loop)).toBe(true);
  });

  it('includes idle, walk, crouch', () => {
    const names = getKyoLoopAnimations().map(m => m.name);
    expect(names).toContain('idle');
    expect(names).toContain('walk_forward');
    expect(names).toContain('crouch');
  });

  it('excludes attacks', () => {
    const names = getKyoLoopAnimations().map(m => m.name);
    expect(names).not.toContain('stand_a');
    expect(names).not.toContain('dm_orochinagi');
  });
});

// ===== KYO_MOVE_LIST =====

describe('KYO_MOVE_LIST', () => {
  it('has entries for all categories', () => {
    const categories = new Set(KYO_MOVE_LIST.map(m => m.type));
    expect(categories.has('command')).toBe(true);
    expect(categories.has('special')).toBe(true);
    expect(categories.has('dm')).toBe(true);
    expect(categories.has('system')).toBe(true);
  });

  it('all entries have valid structure', () => {
    for (const move of KYO_MOVE_LIST) {
      expect(move.name).toBeTruthy();
      expect(move.input).toBeTruthy();
      expect(['command', 'special', 'dm', 'sdm', 'hsdm', 'system']).toContain(move.type);
    }
  });

  it('has rekka chain entries', () => {
    const keys = KYO_MOVE_LIST.map(m => m.attackTypeKey);
    expect(keys).toContain('KYO_ARAGAMI');
    expect(keys).toContain('KYO_ARAGAMI_KONOKIZU');
    expect(keys).toContain('KYO_DOKUGAMI');
    expect(keys).toContain('KYO_TSUMIYOMI');
    expect(keys).toContain('KYO_BATSUYOMI');
  });

  it('has DM/SDM/HSDM entries', () => {
    const keys = KYO_MOVE_LIST.map(m => m.attackTypeKey);
    expect(keys).toContain('DM_OROCHINAGI');
    expect(keys).toContain('SDM_OROCHINAGI');
    expect(keys).toContain('HSDM_OROCHINAGI');
  });

  it('attackTypeKeys are unique', () => {
    const keys = KYO_MOVE_LIST.filter(m => m.attackTypeKey).map(m => m.attackTypeKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

// ===== KYO_WIN_QUOTES =====

describe('KYO_WIN_QUOTES', () => {
  it('is non-empty array', () => {
    expect(KYO_WIN_QUOTES.length).toBeGreaterThan(0);
  });

  it('all quotes are non-empty strings', () => {
    for (const q of KYO_WIN_QUOTES) {
      expect(q.length).toBeGreaterThan(0);
    }
  });
});

// ===== KYO_AVAILABLE_ACTIONS =====

describe('KYO_AVAILABLE_ACTIONS', () => {
  it('has all basic actions', () => {
    for (const a of ['idle', 'walk_forward', 'crouch', 'stand_a', 'throw']) {
      expect(KYO_AVAILABLE_ACTIONS).toContain(a);
    }
  });

  it('includes Kyo specials', () => {
    for (const a of ['kyo_yamibarai', 'kyo_oniyaki', 'kyo_aragami']) {
      expect(KYO_AVAILABLE_ACTIONS).toContain(a);
    }
  });

  it('no duplicates', () => {
    expect(new Set(KYO_AVAILABLE_ACTIONS).size).toBe(KYO_AVAILABLE_ACTIONS.length);
  });
});

// ===== IORI_ANIMATION_META =====

describe('IORI_ANIMATION_META', () => {
  it('has entries for all major categories', () => {
    const types = new Set(Object.values(IORI_ANIMATION_META).map(m => m.type));
    expect(types.has('loop')).toBe(true);
    expect(types.has('once')).toBe(true);
    expect(types.has('attack')).toBe(true);
  });

  it('all entries have valid structure', () => {
    for (const [key, meta] of Object.entries(IORI_ANIMATION_META)) {
      validateMeta(meta, `iori/${key}`);
    }
  });

  it('loop animations have loop=true', () => {
    for (const m of Object.values(IORI_ANIMATION_META).filter(m => m.type === 'loop')) {
      expect(m.loop, `${m.name} loop`).toBe(true);
    }
  });

  it('attack animations have loop=false', () => {
    for (const m of Object.values(IORI_ANIMATION_META).filter(m => m.type === 'attack')) {
      expect(m.loop, `${m.name} loop`).toBe(false);
    }
  });

  it('has basic movement animations', () => {
    for (const name of ['idle', 'walk_forward', 'walk_backward', 'run', 'crouch', 'block']) {
      expect(IORI_ANIMATION_META[name], name).toBeDefined();
    }
  });

  it('has Iori specials', () => {
    for (const name of ['iori_yamibarai', 'iori_oniyaki', 'iori_kototsuki', 'iori_kuzukaze']) {
      expect(IORI_ANIMATION_META[name], name).toBeDefined();
    }
  });

  it('has aoihana rekka chains', () => {
    expect(IORI_ANIMATION_META.iori_aoihana).toBeDefined();
    expect(IORI_ANIMATION_META.iori_aoihana_2).toBeDefined();
    expect(IORI_ANIMATION_META.iori_aoihana_3).toBeDefined();
    expect(IORI_ANIMATION_META.iori_aoihana_c).toBeDefined();
    expect(IORI_ANIMATION_META.iori_aoihana_c_2).toBeDefined();
    expect(IORI_ANIMATION_META.iori_aoihana_c_3).toBeDefined();
  });

  it('has DM/SDM/HSDM', () => {
    expect(IORI_ANIMATION_META.dm_yaotome).toBeDefined();
    expect(IORI_ANIMATION_META.sdm_yaotome).toBeDefined();
    expect(IORI_ANIMATION_META.hsdm_yaotome).toBeDefined();
  });

  it('DM < SDM < HSDM frame counts escalate', () => {
    const dm = IORI_ANIMATION_META.dm_yaotome.totalFrames;
    const sdm = IORI_ANIMATION_META.sdm_yaotome.totalFrames;
    const hsdm = IORI_ANIMATION_META.hsdm_yaotome.totalFrames;
    expect(sdm).toBeGreaterThan(dm);
    expect(hsdm).toBeGreaterThan(sdm);
  });
});

// ===== Iori Query Functions =====

describe('getIoriAnimationNames', () => {
  it('returns all names', () => {
    const names = getIoriAnimationNames();
    expect(names.length).toBeGreaterThan(20);
    expect(names).toContain('idle');
  });
});

describe('getIoriAnimMeta', () => {
  it('returns meta for existing', () => {
    const meta = getIoriAnimMeta('idle');
    expect(meta).toBeDefined();
    expect(meta!.loop).toBe(true);
  });

  it('returns undefined for non-existent', () => {
    expect(getIoriAnimMeta('nonexistent')).toBeUndefined();
  });
});

describe('getIoriAttackAnimations', () => {
  it('returns only attacks', () => {
    const attacks = getIoriAttackAnimations();
    expect(attacks.every(m => m.type === 'attack')).toBe(true);
    expect(attacks.length).toBeGreaterThan(5);
  });
});

describe('getIoriLoopAnimations', () => {
  it('returns only loops', () => {
    const loops = getIoriLoopAnimations();
    expect(loops.every(m => m.loop)).toBe(true);
    const names = loops.map(m => m.name);
    expect(names).toContain('idle');
    expect(names).not.toContain('stand_a');
  });
});

// ===== IORI_MOVE_LIST =====

describe('IORI_MOVE_LIST', () => {
  it('has entries for all categories', () => {
    const categories = new Set(IORI_MOVE_LIST.map(m => m.type));
    expect(categories.has('command')).toBe(true);
    expect(categories.has('special')).toBe(true);
    expect(categories.has('dm')).toBe(true);
  });

  it('all entries have valid structure', () => {
    for (const move of IORI_MOVE_LIST) {
      expect(move.name).toBeTruthy();
      expect(move.input).toBeTruthy();
      expect(['command', 'special', 'dm', 'sdm', 'hsdm', 'system']).toContain(move.type);
    }
  });

  it('has aoihana rekka chains (A and C)', () => {
    const keys = IORI_MOVE_LIST.map(m => m.attackTypeKey);
    expect(keys).toContain('IORI_AOIHANA');
    expect(keys).toContain('IORI_AOIHANA_2');
    expect(keys).toContain('IORI_AOIHANA_3');
    expect(keys).toContain('IORI_AOIHANA_C');
    expect(keys).toContain('IORI_AOIHANA_C_2');
    expect(keys).toContain('IORI_AOIHANA_C_3');
  });

  it('has DM/SDM/HSDM', () => {
    const keys = IORI_MOVE_LIST.map(m => m.attackTypeKey);
    expect(keys).toContain('DM_YATAGARASU');
    expect(keys).toContain('SDM_YATAGARASU');
    expect(keys).toContain('HSDM_YAOTOME');
  });

  it('attackTypeKeys are unique', () => {
    const keys = IORI_MOVE_LIST.filter(m => m.attackTypeKey).map(m => m.attackTypeKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

// ===== IORI_WIN_QUOTES =====

describe('IORI_WIN_QUOTES', () => {
  it('is non-empty', () => {
    expect(IORI_WIN_QUOTES.length).toBeGreaterThan(0);
  });
});

// ===== IORI_AVAILABLE_ACTIONS =====

describe('IORI_AVAILABLE_ACTIONS', () => {
  it('has basic actions', () => {
    for (const a of ['idle', 'walk_forward', 'stand_a', 'hitstun']) {
      expect(IORI_AVAILABLE_ACTIONS).toContain(a);
    }
  });

  it('includes Iori specials', () => {
    for (const a of ['aoihana', 'oniyaki', 'yamibarai']) {
      expect(IORI_AVAILABLE_ACTIONS).toContain(a);
    }
  });

  it('no duplicates', () => {
    expect(new Set(IORI_AVAILABLE_ACTIONS).size).toBe(IORI_AVAILABLE_ACTIONS.length);
  });
});

// ===== Cross-character Kyo vs Iori =====

describe('Kyo vs Iori cross-character animation consistency', () => {
  it('both share basic movement names', () => {
    const shared = ['idle', 'walk_forward', 'walk_backward', 'jump_up', 'crouch', 'block'];
    for (const name of shared) {
      expect(KYO_ANIMATION_META[name], `kyo ${name}`).toBeDefined();
      expect(IORI_ANIMATION_META[name], `iori ${name}`).toBeDefined();
    }
  });

  it('both share attack categories', () => {
    for (const name of ['stand_a', 'stand_b', 'stand_c', 'stand_d', 'crouch_a', 'crouch_d']) {
      expect(KYO_ANIMATION_META[name]).toBeDefined();
      expect(IORI_ANIMATION_META[name]).toBeDefined();
      expect(KYO_ANIMATION_META[name].type).toBe('attack');
      expect(IORI_ANIMATION_META[name].type).toBe('attack');
    }
  });

  it('character-specific specials are different', () => {
    expect(KYO_ANIMATION_META.kyo_yamibarai).toBeDefined();
    expect(IORI_ANIMATION_META.iori_yamibarai).toBeDefined();
    expect(KYO_ANIMATION_META.iori_yamibarai).toBeUndefined();
    expect(IORI_ANIMATION_META.kyo_yamibarai).toBeUndefined();
  });
});
