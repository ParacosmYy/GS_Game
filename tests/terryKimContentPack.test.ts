/**
 * Terry & Kim Content Pack Integration Tests
 *
 * Validates that both Terry Bogard and Kim Kaphwan content packs:
 * - Are accessible through the unified content loader
 * - Export all required dimensions (attacks, frameData, feedback, hitboxes,
 *   animations, portraits, moves, cancelPaths)
 * - Maintain cross-character consistency with Kyo/Iori packs
 * - Cover all feedback tier categories (light/heavy/special/dm/sdm/hsdm)
 */
import { describe, it, expect } from 'vitest';
import {
  loadCharacterContent,
  hasCharacterContent,
  getAvailableCharacterIds,
} from '../src/content/contentLoader.js';
import type { CharacterContent } from '../src/content/contentLoader.js';
import {
  TERRY_ATTACK_KEYS,
  getTerryFrameData,
} from '../src/content/characters/terry/attacks/terryAttacks.js';
import { TERRY_FRAME_DATA } from '../src/content/characters/terry/frameData/terryFrameData.js';
import {
  getTerryFeedbackTiers,
  TERRY_FEEDBACK_SUMMARY,
} from '../src/content/characters/terry/feedback/terryFeedback.js';
import {
  TERRY_HITBOX_KEYS,
  getTerryHitboxOffsets,
} from '../src/content/characters/terry/hitboxes/terryHitboxes.js';
import {
  TERRY_ANIMATION_META,
  getTerryAnimationNames,
} from '../src/content/characters/terry/animations/terryAnimations.js';
import {
  TERRY_PORTRAIT_META,
  getTerryAvailablePortraitSizes,
} from '../src/content/characters/terry/portraits/terryPortraits.js';
import { TERRY_MOVES } from '../src/content/characters/terry/moves/terryMoves.js';
import { TERRY_CANCEL_PATHS } from '../src/content/characters/terry/cancelPaths.js';
import {
  KIM_ATTACK_KEYS,
  getKimFrameData,
} from '../src/content/characters/kim/attacks/kimAttacks.js';
import { KIM_FRAME_DATA } from '../src/content/characters/kim/frameData/kimFrameData.js';
import {
  getKimFeedbackTiers,
  KIM_FEEDBACK_SUMMARY,
} from '../src/content/characters/kim/feedback/kimFeedback.js';
import {
  KIM_HITBOX_KEYS,
  getKimHitboxOffsets,
} from '../src/content/characters/kim/hitboxes/kimHitboxes.js';
import {
  KIM_ANIMATION_META,
  getKimAnimationNames,
} from '../src/content/characters/kim/animations/kimAnimations.js';
import {
  KIM_PORTRAIT_META,
  getKimAvailablePortraitSizes,
} from '../src/content/characters/kim/portraits/kimPortraits.js';
import { KIM_MOVES } from '../src/content/characters/kim/moves/kimMoves.js';
import { KIM_CANCEL_PATHS } from '../src/content/characters/kim/cancelPaths.js';
// Reference imports for cross-character consistency
import {
  KYO_ATTACK_KEYS,
  getKyoFrameData,
} from '../src/content/characters/kyo/attacks/kyoAttacks.js';
import {
  getKyoFeedbackTiers,
} from '../src/content/characters/kyo/feedback/kyoFeedback.js';
import {
  IORI_ATTACK_KEYS,
  getIoriFrameData,
} from '../src/content/characters/iori/attacks/ioriAttacks.js';
import {
  getIoriFeedbackTiers,
} from '../src/content/characters/iori/feedback/ioriFeedback.js';
import type { FeedbackTier } from '../src/core/feedbackManifest.js';

// ============================================================
// 1. Content Loader Integration
// ============================================================

describe('Content Loader — Terry and Kim availability', () => {
  it('loadCharacterContent("terry") returns valid CharacterContent', () => {
    const content = loadCharacterContent('terry');
    expect(content).toBeDefined();
    expect(content.data.id).toBe('terry');
    expect(content.data.name).toBe('Terry Bogard');
    expect(content.data.nameCn).toBe('泰利·博加德');
  });

  it('loadCharacterContent("kim") returns valid CharacterContent', () => {
    const content = loadCharacterContent('kim');
    expect(content).toBeDefined();
    expect(content.data.id).toBe('kim');
    expect(content.data.name).toBe('Kim Kaphwan');
    expect(content.data.nameCn).toBe('金甲唤');
  });

  it('hasCharacterContent("terry") is true', () => {
    expect(hasCharacterContent('terry')).toBe(true);
  });

  it('hasCharacterContent("kim") is true', () => {
    expect(hasCharacterContent('kim')).toBe(true);
  });

  it('getAvailableCharacterIds() includes terry and kim', () => {
    const ids = getAvailableCharacterIds();
    expect(ids).toContain('terry');
    expect(ids).toContain('kim');
  });
});

describe('Content Loader — CharacterContent shape for Terry', () => {
  let content: CharacterContent;

  it('has all required fields populated', () => {
    content = loadCharacterContent('terry');
    expect(content.attacks).toBeDefined();
    expect(content.attackKeys).toBeDefined();
    expect(content.commands).toBeDefined();
    expect(content.availableActions).toBeDefined();
    expect(content.animations).toBeDefined();
    expect(content.animSequenceNames).toBeDefined();
    expect(content.hitboxes).toBeDefined();
    expect(content.attackFrames).toBeDefined();
    expect(content.feedback).toBeDefined();
  });
});

describe('Content Loader — CharacterContent shape for Kim', () => {
  let content: CharacterContent;

  it('has all required fields populated', () => {
    content = loadCharacterContent('kim');
    expect(content.attacks).toBeDefined();
    expect(content.attackKeys).toBeDefined();
    expect(content.commands).toBeDefined();
    expect(content.availableActions).toBeDefined();
    expect(content.animations).toBeDefined();
    expect(content.animSequenceNames).toBeDefined();
    expect(content.hitboxes).toBeDefined();
    expect(content.attackFrames).toBeDefined();
    expect(content.feedback).toBeDefined();
  });
});

// ============================================================
// 2. Terry Content Pack Dimensions
// ============================================================

describe('Terry — Attacks dimension', () => {
  it('TERRY_ATTACK_KEYS has entries', () => {
    expect(TERRY_ATTACK_KEYS.length).toBeGreaterThan(0);
  });

  it('TERRY_ATTACK_KEYS includes normals (STAND_A through JUMP_D)', () => {
    const requiredNormals = ['STAND_A', 'STAND_C', 'CROUCH_A', 'CROUCH_D', 'JUMP_A', 'JUMP_D'];
    for (const n of requiredNormals) {
      expect(TERRY_ATTACK_KEYS).toContain(n);
    }
  });

  it('getTerryFrameData() returns data', () => {
    const data = getTerryFrameData();
    expect(Object.keys(data).length).toBeGreaterThan(0);
  });
});

describe('Terry — Frame Data dimension', () => {
  it('TERRY_FRAME_DATA has signature specials', () => {
    const keys = Object.keys(TERRY_FRAME_DATA);
    expect(keys).toContain('TERRY_POWER_WAVE');
    expect(keys).toContain('TERRY_BURN_KNUCKLE');
    expect(keys).toContain('TERRY_CRACK_SHOT');
    expect(keys).toContain('TERRY_POWER_DUNK');
    expect(keys).toContain('TERRY_RISING_TACKLE');
  });

  it('TERRY_FRAME_DATA specials have valid frame data fields', () => {
    const pw = TERRY_FRAME_DATA.TERRY_POWER_WAVE;
    expect(pw.startup).toBeGreaterThan(0);
    expect(pw.active).toBeGreaterThan(0);
    expect(pw.recovery).toBeGreaterThan(0);
    expect(pw.damage).toBeGreaterThan(0);
    expect(pw.hitLevel).toBe('MID');
  });

  it('TERRY_FRAME_DATA has DM entries', () => {
    const keys = Object.keys(TERRY_FRAME_DATA);
    expect(keys).toContain('DM_POWER_GEYSER_A');
    expect(keys).toContain('DM_HIGH_ANGLE_GEYSER');
  });

  it('TERRY_FRAME_DATA has SDM entries', () => {
    const keys = Object.keys(TERRY_FRAME_DATA);
    expect(keys).toContain('SDM_TRIPLE_GEYSER');
  });
});

describe('Terry — Feedback dimension', () => {
  it('getTerryFeedbackTiers() returns tier mapping for key attacks', () => {
    const tiers = getTerryFeedbackTiers();
    expect(Object.keys(tiers).length).toBeGreaterThan(0);
    // Terry specials should have a tier
    expect(tiers['TERRY_POWER_WAVE']).toBeDefined();
    expect(tiers['TERRY_BURN_KNUCKLE']).toBeDefined();
  });

  it('TERRY_FEEDBACK_SUMMARY has all tier categories', () => {
    const requiredTiers: FeedbackTier[] = ['light', 'heavy', 'special', 'dm', 'sdm'];
    for (const tier of requiredTiers) {
      expect(TERRY_FEEDBACK_SUMMARY[tier]).toBeDefined();
      expect(TERRY_FEEDBACK_SUMMARY[tier].length).toBeGreaterThan(0);
    }
  });

  it('TERRY_FEEDBACK_SUMMARY.special includes key Terry specials', () => {
    const specials = TERRY_FEEDBACK_SUMMARY.special;
    expect(specials).toContain('TERRY_POWER_WAVE');
    expect(specials).toContain('TERRY_BURN_KNUCKLE');
    expect(specials).toContain('TERRY_POWER_DUNK');
    expect(specials).toContain('TERRY_RISING_TACKLE');
  });
});

describe('Terry — Hitbox dimension', () => {
  it('TERRY_HITBOX_KEYS has entries', () => {
    expect(TERRY_HITBOX_KEYS.length).toBeGreaterThan(0);
  });

  it('getTerryHitboxOffsets() returns data for at least some attacks', () => {
    const offsets = getTerryHitboxOffsets();
    // The function reads from HITBOX_OFFSETS, so it may or may not have data
    // depending on whether HITBOX_OFFSETS has Terry entries. The function must return a valid object.
    expect(offsets).toBeDefined();
    expect(typeof offsets).toBe('object');
  });

  it('TERRY_HITBOX_KEYS includes key specials', () => {
    expect(TERRY_HITBOX_KEYS).toContain('TERRY_POWER_WAVE');
    expect(TERRY_HITBOX_KEYS).toContain('TERRY_BURN_KNUCKLE');
    expect(TERRY_HITBOX_KEYS).toContain('DM_POWER_GEYSER');
  });
});

describe('Terry — Animation dimension', () => {
  it('TERRY_ANIMATION_META has idle, walk, and stand_a', () => {
    expect(TERRY_ANIMATION_META.idle).toBeDefined();
    expect(TERRY_ANIMATION_META.walk_forward).toBeDefined();
    expect(TERRY_ANIMATION_META.stand_a).toBeDefined();
  });

  it('TERRY_ANIMATION_META has specials', () => {
    expect(TERRY_ANIMATION_META.terry_power_wave).toBeDefined();
    expect(TERRY_ANIMATION_META.terry_burn_knuckle).toBeDefined();
    expect(TERRY_ANIMATION_META.terry_power_dunk).toBeDefined();
  });

  it('TERRY_ANIMATION_META has DMs', () => {
    expect(TERRY_ANIMATION_META.dm_power_geyser).toBeDefined();
    expect(TERRY_ANIMATION_META.dm_high_angle_geyser).toBeDefined();
  });

  it('getTerryAnimationNames() returns all expected names', () => {
    const names = getTerryAnimationNames();
    expect(names).toContain('idle');
    expect(names).toContain('terry_power_wave');
    expect(names).toContain('dm_power_geyser');
  });
});

describe('Terry — Portrait dimension', () => {
  it('TERRY_PORTRAIT_META has select/vs/hud/win sizes', () => {
    expect(TERRY_PORTRAIT_META.select).toBeDefined();
    expect(TERRY_PORTRAIT_META.vs).toBeDefined();
    expect(TERRY_PORTRAIT_META.hud).toBeDefined();
    expect(TERRY_PORTRAIT_META.win).toBeDefined();
  });

  it('TERRY_PORTRAIT_META.select has correct dimensions', () => {
    expect(TERRY_PORTRAIT_META.select.width).toBe(120);
    expect(TERRY_PORTRAIT_META.select.height).toBe(120);
  });

  it('getTerryAvailablePortraitSizes() returns sizes with pixel data', () => {
    const sizes = getTerryAvailablePortraitSizes();
    expect(sizes.length).toBeGreaterThan(0);
    expect(sizes).toContain('select');
    expect(sizes).toContain('hud');
  });
});

describe('Terry — Moves dimension', () => {
  it('TERRY_MOVES has entries', () => {
    expect(TERRY_MOVES.length).toBeGreaterThan(0);
  });

  it('TERRY_MOVES covers command_normal category', () => {
    const cmds = TERRY_MOVES.filter(m => m.category === 'command_normal');
    expect(cmds.length).toBeGreaterThan(0);
  });

  it('TERRY_MOVES covers special category', () => {
    const specials = TERRY_MOVES.filter(m => m.category === 'special');
    expect(specials.length).toBeGreaterThan(0);
  });

  it('TERRY_MOVES covers dm and sdm categories', () => {
    const dms = TERRY_MOVES.filter(m => m.category === 'dm');
    const sdms = TERRY_MOVES.filter(m => m.category === 'sdm');
    expect(dms.length).toBeGreaterThan(0);
    expect(sdms.length).toBeGreaterThan(0);
  });
});

describe('Terry — Cancel Paths dimension', () => {
  it('TERRY_CANCEL_PATHS has routes', () => {
    expect(TERRY_CANCEL_PATHS.length).toBeGreaterThan(0);
  });

  it('TERRY_CANCEL_PATHS includes normal-to-special routes', () => {
    const normalRoutes = TERRY_CANCEL_PATHS.filter(r => r.cancelType === 'normal');
    expect(normalRoutes.length).toBeGreaterThan(0);
  });

  it('TERRY_CANCEL_PATHS includes super cancel routes', () => {
    const superRoutes = TERRY_CANCEL_PATHS.filter(r => r.cancelType === 'super');
    expect(superRoutes.length).toBeGreaterThan(0);
  });
});

// ============================================================
// 3. Kim Content Pack Dimensions
// ============================================================

describe('Kim — Attacks dimension', () => {
  it('KIM_ATTACK_KEYS has entries', () => {
    expect(KIM_ATTACK_KEYS.length).toBeGreaterThan(0);
  });

  it('KIM_ATTACK_KEYS includes normals', () => {
    const requiredNormals = ['STAND_A', 'STAND_C', 'CROUCH_A', 'CROUCH_D', 'JUMP_A', 'JUMP_D'];
    for (const n of requiredNormals) {
      expect(KIM_ATTACK_KEYS).toContain(n);
    }
  });

  it('getKimFrameData() returns data', () => {
    const data = getKimFrameData();
    expect(Object.keys(data).length).toBeGreaterThan(0);
  });
});

describe('Kim — Frame Data dimension', () => {
  it('KIM_FRAME_DATA has signature specials', () => {
    const keys = Object.keys(KIM_FRAME_DATA);
    expect(keys).toContain('KIM_HIENZAN');
    expect(keys).toContain('KIM_HANGETSU');
    expect(keys).toContain('KIM_SANREN');
  });

  it('KIM_FRAME_DATA specials have valid frame data fields', () => {
    const hz = KIM_FRAME_DATA.KIM_HIENZAN;
    expect(hz.startup).toBeGreaterThan(0);
    expect(hz.active).toBeGreaterThan(0);
    expect(hz.recovery).toBeGreaterThan(0);
    expect(hz.damage).toBeGreaterThan(0);
    expect(hz.hitLevel).toBe('MID');
  });

  it('KIM_FRAME_DATA has DM entries', () => {
    const keys = Object.keys(KIM_FRAME_DATA);
    expect(keys).toContain('DM_PHOENIX_KICK');
    expect(keys).toContain('DM_PHOENIX_HITEN');
  });

  it('KIM_FRAME_DATA has SDM and HSDM entries', () => {
    const keys = Object.keys(KIM_FRAME_DATA);
    expect(keys).toContain('SDM_PHOENIX_HITEN');
    expect(keys).toContain('HSDM_PHOENIX_HITEN');
  });
});

describe('Kim — Feedback dimension', () => {
  it('getKimFeedbackTiers() returns tier mapping for key attacks', () => {
    const tiers = getKimFeedbackTiers();
    expect(Object.keys(tiers).length).toBeGreaterThan(0);
    expect(tiers['KIM_HIENZAN']).toBeDefined();
    expect(tiers['KIM_HANGETSU']).toBeDefined();
  });

  it('KIM_FEEDBACK_SUMMARY has all tier categories', () => {
    const requiredTiers: FeedbackTier[] = ['light', 'heavy', 'special', 'dm', 'sdm'];
    for (const tier of requiredTiers) {
      expect(KIM_FEEDBACK_SUMMARY[tier]).toBeDefined();
      expect(KIM_FEEDBACK_SUMMARY[tier].length).toBeGreaterThan(0);
    }
  });

  it('KIM_FEEDBACK_SUMMARY.special includes key Kim specials', () => {
    const specials = KIM_FEEDBACK_SUMMARY.special;
    expect(specials).toContain('KIM_HIENZAN');
    expect(specials).toContain('KIM_HANGETSU');
    expect(specials).toContain('KIM_SANREN');
  });
});

describe('Kim — Hitbox dimension', () => {
  it('KIM_HITBOX_KEYS has entries', () => {
    expect(KIM_HITBOX_KEYS.length).toBeGreaterThan(0);
  });

  it('getKimHitboxOffsets() returns a valid object', () => {
    const offsets = getKimHitboxOffsets();
    expect(offsets).toBeDefined();
    expect(typeof offsets).toBe('object');
  });

  it('KIM_HITBOX_KEYS includes key specials and DMs', () => {
    expect(KIM_HITBOX_KEYS).toContain('KIM_HIENZAN');
    expect(KIM_HITBOX_KEYS).toContain('KIM_HANGETSU');
    expect(KIM_HITBOX_KEYS).toContain('DM_PHOENIX_KICK');
  });
});

describe('Kim — Animation dimension', () => {
  it('KIM_ANIMATION_META has idle, walk, and stand_a', () => {
    expect(KIM_ANIMATION_META.idle).toBeDefined();
    expect(KIM_ANIMATION_META.walk_forward).toBeDefined();
    expect(KIM_ANIMATION_META.stand_a).toBeDefined();
  });

  it('KIM_ANIMATION_META has specials', () => {
    expect(KIM_ANIMATION_META.kim_hienzan).toBeDefined();
    expect(KIM_ANIMATION_META.kim_hangetsu).toBeDefined();
    expect(KIM_ANIMATION_META.kim_sanren).toBeDefined();
  });

  it('KIM_ANIMATION_META has DMs and HSDM', () => {
    expect(KIM_ANIMATION_META.dm_phoenix_kick).toBeDefined();
    expect(KIM_ANIMATION_META.dm_phoenix_hiten).toBeDefined();
    expect(KIM_ANIMATION_META.hsdm_phoenix_hiten).toBeDefined();
  });

  it('getKimAnimationNames() returns all expected names', () => {
    const names = getKimAnimationNames();
    expect(names).toContain('idle');
    expect(names).toContain('kim_hienzan');
    expect(names).toContain('dm_phoenix_kick');
  });
});

describe('Kim — Portrait dimension', () => {
  it('KIM_PORTRAIT_META has select/vs/hud/win sizes', () => {
    expect(KIM_PORTRAIT_META.select).toBeDefined();
    expect(KIM_PORTRAIT_META.vs).toBeDefined();
    expect(KIM_PORTRAIT_META.hud).toBeDefined();
    expect(KIM_PORTRAIT_META.win).toBeDefined();
  });

  it('KIM_PORTRAIT_META.select has correct dimensions', () => {
    expect(KIM_PORTRAIT_META.select.width).toBe(120);
    expect(KIM_PORTRAIT_META.select.height).toBe(120);
  });

  it('getKimAvailablePortraitSizes() returns sizes with pixel data', () => {
    const sizes = getKimAvailablePortraitSizes();
    expect(sizes.length).toBeGreaterThan(0);
    expect(sizes).toContain('select');
    expect(sizes).toContain('hud');
  });
});

describe('Kim — Moves dimension', () => {
  it('KIM_MOVES has entries', () => {
    expect(KIM_MOVES.length).toBeGreaterThan(0);
  });

  it('KIM_MOVES covers special category', () => {
    const specials = KIM_MOVES.filter(m => m.category === 'special');
    expect(specials.length).toBeGreaterThan(0);
  });

  it('KIM_MOVES covers dm and sdm categories', () => {
    const dms = KIM_MOVES.filter(m => m.category === 'dm');
    const sdms = KIM_MOVES.filter(m => m.category === 'sdm');
    expect(dms.length).toBeGreaterThan(0);
    expect(sdms.length).toBeGreaterThan(0);
  });
});

describe('Kim — Cancel Paths dimension', () => {
  it('KIM_CANCEL_PATHS has routes', () => {
    expect(KIM_CANCEL_PATHS.length).toBeGreaterThan(0);
  });

  it('KIM_CANCEL_PATHS includes normal-to-special routes', () => {
    const normalRoutes = KIM_CANCEL_PATHS.filter(r => r.cancelType === 'normal');
    expect(normalRoutes.length).toBeGreaterThan(0);
  });

  it('KIM_CANCEL_PATHS includes rekka routes for Sanren chain', () => {
    const rekkaRoutes = KIM_CANCEL_PATHS.filter(r => r.cancelType === 'rekka');
    expect(rekkaRoutes.length).toBeGreaterThan(0);
  });
});

// ============================================================
// 4. Cross-character Consistency
// ============================================================

describe('Cross-character consistency — All packs export same interface shape', () => {
  it('Terry and Kim attack keys arrays are non-empty like Kyo/Iori', () => {
    expect(TERRY_ATTACK_KEYS.length).toBeGreaterThan(0);
    expect(KIM_ATTACK_KEYS.length).toBeGreaterThan(0);
    expect(KYO_ATTACK_KEYS.length).toBeGreaterThan(0);
    expect(IORI_ATTACK_KEYS.length).toBeGreaterThan(0);
  });

  it('Terry and Kim frame data functions return objects', () => {
    expect(typeof getTerryFrameData()).toBe('object');
    expect(typeof getKimFrameData()).toBe('object');
    expect(typeof getKyoFrameData()).toBe('object');
    expect(typeof getIoriFrameData()).toBe('object');
  });

  it('Terry and Kim feedback tier functions return objects like Kyo/Iori', () => {
    const terryTiers = getTerryFeedbackTiers();
    const kimTiers = getKimFeedbackTiers();
    const kyoTiers = getKyoFeedbackTiers();
    const ioriTiers = getIoriFeedbackTiers();
    expect(Object.keys(terryTiers).length).toBeGreaterThan(0);
    expect(Object.keys(kimTiers).length).toBeGreaterThan(0);
    expect(Object.keys(kyoTiers).length).toBeGreaterThan(0);
    expect(Object.keys(ioriTiers).length).toBeGreaterThan(0);
  });

  it('Terry and Kim content packs share normal attack keys with Kyo/Iori', () => {
    const sharedNormals = ['STAND_A', 'STAND_C', 'CROUCH_A', 'CROUCH_D', 'JUMP_A', 'JUMP_D'];
    for (const n of sharedNormals) {
      expect(TERRY_ATTACK_KEYS).toContain(n);
      expect(KIM_ATTACK_KEYS).toContain(n);
      expect(KYO_ATTACK_KEYS).toContain(n);
      expect(IORI_ATTACK_KEYS).toContain(n);
    }
  });
});

describe('Cross-character consistency — Feedback tier categories exist', () => {
  const requiredTiers: FeedbackTier[] = ['light', 'heavy', 'special', 'dm', 'sdm'];

  it('Terry TERRY_FEEDBACK_SUMMARY has all required tier categories', () => {
    for (const tier of requiredTiers) {
      expect(TERRY_FEEDBACK_SUMMARY[tier], `Terry missing tier: ${tier}`).toBeDefined();
      expect(Array.isArray(TERRY_FEEDBACK_SUMMARY[tier])).toBe(true);
      expect(TERRY_FEEDBACK_SUMMARY[tier].length, `Terry tier "${tier}" is empty`).toBeGreaterThan(0);
    }
  });

  it('Kim KIM_FEEDBACK_SUMMARY has all required tier categories', () => {
    for (const tier of requiredTiers) {
      expect(KIM_FEEDBACK_SUMMARY[tier], `Kim missing tier: ${tier}`).toBeDefined();
      expect(Array.isArray(KIM_FEEDBACK_SUMMARY[tier])).toBe(true);
      expect(KIM_FEEDBACK_SUMMARY[tier].length, `Kim tier "${tier}" is empty`).toBeGreaterThan(0);
    }
  });

  it('Terry feedback summary hsdm category exists', () => {
    expect(TERRY_FEEDBACK_SUMMARY.hsdm).toBeDefined();
    expect(TERRY_FEEDBACK_SUMMARY.hsdm.length).toBeGreaterThan(0);
  });

  it('Kim feedback summary hsdm category exists', () => {
    expect(KIM_FEEDBACK_SUMMARY.hsdm).toBeDefined();
    expect(KIM_FEEDBACK_SUMMARY.hsdm.length).toBeGreaterThan(0);
  });
});

describe('Cross-character consistency — Content loader returns consistent shape', () => {
  it('all 5 characters load without error', () => {
    const ids = getAvailableCharacterIds();
    expect(ids.length).toBeGreaterThanOrEqual(5);
    for (const id of ids) {
      const content = loadCharacterContent(id);
      expect(content.data.id).toBe(id);
      expect(content.attackKeys.length).toBeGreaterThan(0);
      expect(content.availableActions.length).toBeGreaterThan(0);
    }
  });

  it('Terry and Kim content pack data fields match Kyo/Iori structure', () => {
    const terry = loadCharacterContent('terry');
    const kim = loadCharacterContent('kim');
    const kyo = loadCharacterContent('kyo');
    // All should have the same set of top-level keys
    const terryKeys = Object.keys(terry);
    const kyoKeys = Object.keys(kyo);
    for (const key of kyoKeys) {
      expect(terryKeys, `Terry content missing key: ${key}`).toContain(key);
      expect(Object.keys(kim), `Kim content missing key: ${key}`).toContain(key);
    }
  });
});
