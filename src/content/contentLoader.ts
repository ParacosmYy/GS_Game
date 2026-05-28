/**
 * Content Loader — Unified character content access
 *
 * Provides a single function to load all content for a given character.
 * Supports: ryo, kyo, iori, terry, kim, athena, vice, yamazaki, shermie
 */
import type { FeedbackTier } from '../core/feedbackManifest.js';
import {
  RyoDef,
  RYO_CHARACTER_DATA,
  RYO_STATS,
  getRyoFrameData,
  RYO_ATTACK_KEYS,
  RYO_MOVE_LIST,
  RYO_AVAILABLE_ACTIONS,
  getRyoAnimations,
  getRyoAnimSequenceNames,
  getRyoHitboxOffsets,
  getRyoAttackFrames,
  getRyoFeedbackTiers,
  generateRyoReport,
} from './characters/ryo/index.js';
import type { RyoStats, RyoCompletenessReport } from './characters/ryo/index.js';
import {
  getKyoFrameData,
  KYO_ATTACK_KEYS,
  KYO_MOVE_LIST,
  KYO_AVAILABLE_ACTIONS,
  KYO_ANIMATION_META,
  getKyoAnimationNames,
  getKyoHitboxOffsets,
  getKyoAttackFrames,
  getKyoFeedbackTiers,
} from './characters/kyo/index.js';
import {
  getIoriFrameData,
  IORI_ATTACK_KEYS,
  IORI_MOVE_LIST,
  IORI_AVAILABLE_ACTIONS,
  IORI_ANIMATION_META,
  getIoriAnimationNames,
  getIoriHitboxOffsets,
  getIoriAttackFrames,
  getIoriFeedbackTiers,
} from './characters/iori/index.js';
import {
  getTerryFrameData,
  TERRY_ATTACK_KEYS,
  TERRY_MOVE_LIST,
  TERRY_AVAILABLE_ACTIONS,
  TERRY_ANIMATION_META,
  getTerryAnimationNames,
  getTerryHitboxOffsets,
  getTerryAttackFrames,
  getTerryFeedbackTiers,
} from './characters/terry/index.js';
import {
  getKimFrameData,
  KIM_ATTACK_KEYS,
  KIM_MOVE_LIST,
  KIM_AVAILABLE_ACTIONS,
  KIM_ANIMATION_META,
  getKimAnimationNames,
  getKimHitboxOffsets,
  getKimAttackFrames,
  getKimFeedbackTiers,
} from './characters/kim/index.js';
import {
  getAthenaFrameData,
  ATHENA_ATTACK_KEYS,
  ATHENA_MOVE_LIST,
  ATHENA_AVAILABLE_ACTIONS,
  ATHENA_ANIMATION_META,
  getAthenaAnimationNames,
  getAthenaHitboxOffsets,
  getAthenaAttackFrames,
  getAthenaFeedbackTiers,
} from './characters/athena/index.js';
import {
  getViceFrameData,
  VICE_ATTACK_KEYS,
  VICE_MOVE_LIST,
  VICE_AVAILABLE_ACTIONS,
  VICE_ANIMATION_META,
  getViceAnimationNames,
  getViceHitboxOffsets,
  getViceAttackFrames,
  getViceFeedbackTiers,
} from './characters/vice/index.js';
import {
  getYamazakiFrameData,
  YAMAZAKI_ATTACK_KEYS,
  YAMAZAKI_MOVE_LIST,
  YAMAZAKI_AVAILABLE_ACTIONS,
  YAMAZAKI_ANIMATION_META,
  getYamazakiAnimationNames,
  getYamazakiHitboxOffsets,
  getYamazakiAttackFrames,
  getYamazakiFeedbackTiers,
} from './characters/yamazaki/index.js';
import {
  getShermieFrameData,
  SHERMIE_ATTACK_KEYS,
  SHERMIE_MOVE_LIST,
  SHERMIE_AVAILABLE_ACTIONS,
  SHERMIE_ANIMATION_META,
  getShermieAnimationNames,
  getShermieHitboxOffsets,
  getShermieAttackFrames,
  getShermieFeedbackTiers,
} from './characters/shermie/index.js';
import { generateKyoDimensionReport } from '../tools/kyoCompletenessReport.js';
import { generateIoriDimensionReport } from '../tools/ioriCompletenessReport.js';
import { generateTerryDimensionReport } from '../tools/terryCompletenessReport.js';
import { generateKimDimensionReport } from '../tools/kimCompletenessReport.js';

/** Unified character content interface */
export interface CharacterContent {
  /** Character metadata */
  data: { id: string; name: string; nameCn: string; color: string };
  /** All attack frame data for this character */
  attacks: Record<string, any>;
  /** Attack type keys */
  attackKeys: string[];
  /** Move list */
  commands: any;
  /** Available action names */
  availableActions: string[];
  /** Animation sequences */
  animations: any;
  /** Animation sequence names */
  animSequenceNames: string[];
  /** Hitbox offsets */
  hitboxes: Record<string, any>;
  /** Per-frame attack hitbox data */
  attackFrames: Record<string, any>;
  /** Attack-to-feedback-tier mapping */
  feedback: Record<string, FeedbackTier>;
  /** Completeness report */
  report: any;
}

/** Load all content for a given character */
export function loadCharacterContent(charId: string): CharacterContent {
  switch (charId) {
    case 'ryo':
      return loadRyoContent();
    case 'kyo':
      return loadKyoContent();
    case 'iori':
      return loadIoriContent();
    case 'terry':
      return loadTerryContent();
    case 'kim':
      return loadKimContent();
    case 'athena':
      return loadAthenaContent();
    case 'vice':
      return loadViceContent();
    case 'yamazaki':
      return loadYamazakiContent();
    case 'shermie':
      return loadShermieContent();
    default:
      throw new Error(`Unknown character: ${charId}`);
  }
}

/** Check if a character has a content package */
export function hasCharacterContent(charId: string): boolean {
  return ['ryo', 'kyo', 'iori', 'terry', 'kim', 'athena', 'vice', 'yamazaki', 'shermie'].includes(charId);
}

/** List all characters with content packages */
export function getAvailableCharacterIds(): string[] {
  return ['ryo', 'kyo', 'iori', 'terry', 'kim', 'athena', 'vice', 'yamazaki', 'shermie'];
}

function loadRyoContent(): CharacterContent {
  return {
    data: { ...RYO_CHARACTER_DATA, name: RYO_CHARACTER_DATA.displayName, color: '#2196F3' },
    attacks: getRyoFrameData(),
    attackKeys: RYO_ATTACK_KEYS,
    commands: RYO_MOVE_LIST,
    availableActions: RYO_AVAILABLE_ACTIONS,
    animations: getRyoAnimations(),
    animSequenceNames: getRyoAnimSequenceNames(),
    hitboxes: getRyoHitboxOffsets(),
    attackFrames: getRyoAttackFrames(),
    feedback: getRyoFeedbackTiers(),
    report: generateRyoReport(),
  };
}

function loadKyoContent(): CharacterContent {
  return {
    data: { id: 'kyo', name: 'Kyo Kusanagi', nameCn: '草薙京', color: '#FF6600' },
    attacks: getKyoFrameData(),
    attackKeys: KYO_ATTACK_KEYS,
    commands: KYO_MOVE_LIST,
    availableActions: KYO_AVAILABLE_ACTIONS,
    animations: KYO_ANIMATION_META,
    animSequenceNames: getKyoAnimationNames(),
    hitboxes: getKyoHitboxOffsets(),
    attackFrames: getKyoAttackFrames(),
    feedback: getKyoFeedbackTiers(),
    report: generateKyoDimensionReport(),
  };
}

function loadIoriContent(): CharacterContent {
  return {
    data: { id: 'iori', name: 'Iori Yagami', nameCn: '八神庵', color: '#8800CC' },
    attacks: getIoriFrameData(),
    attackKeys: IORI_ATTACK_KEYS,
    commands: IORI_MOVE_LIST,
    availableActions: IORI_AVAILABLE_ACTIONS,
    animations: IORI_ANIMATION_META,
    animSequenceNames: getIoriAnimationNames(),
    hitboxes: getIoriHitboxOffsets(),
    attackFrames: getIoriAttackFrames(),
    feedback: getIoriFeedbackTiers(),
    report: generateIoriDimensionReport(),
  };
}

function loadTerryContent(): CharacterContent {
  return {
    data: { id: 'terry', name: 'Terry Bogard', nameCn: '泰利·博加德', color: '#E03020' },
    attacks: getTerryFrameData(),
    attackKeys: TERRY_ATTACK_KEYS,
    commands: TERRY_MOVE_LIST,
    availableActions: TERRY_AVAILABLE_ACTIONS,
    animations: TERRY_ANIMATION_META,
    animSequenceNames: getTerryAnimationNames(),
    hitboxes: getTerryHitboxOffsets(),
    attackFrames: getTerryAttackFrames(),
    feedback: getTerryFeedbackTiers(),
    report: generateTerryDimensionReport(),
  };
}

function loadKimContent(): CharacterContent {
  return {
    data: { id: 'kim', name: 'Kim Kaphwan', nameCn: '金甲唤', color: '#FFFFFF' },
    attacks: getKimFrameData(),
    attackKeys: KIM_ATTACK_KEYS,
    commands: KIM_MOVE_LIST,
    availableActions: KIM_AVAILABLE_ACTIONS,
    animations: KIM_ANIMATION_META,
    animSequenceNames: getKimAnimationNames(),
    hitboxes: getKimHitboxOffsets(),
    attackFrames: getKimAttackFrames(),
    feedback: getKimFeedbackTiers(),
    report: generateKimDimensionReport(),
  };
}

function loadAthenaContent(): CharacterContent {
  return {
    data: { id: 'athena', name: 'Athena Asamiya', nameCn: '麻宫雅典娜', color: '#FF66AA' },
    attacks: getAthenaFrameData(),
    attackKeys: ATHENA_ATTACK_KEYS,
    commands: ATHENA_MOVE_LIST,
    availableActions: ATHENA_AVAILABLE_ACTIONS,
    animations: ATHENA_ANIMATION_META,
    animSequenceNames: getAthenaAnimationNames(),
    hitboxes: getAthenaHitboxOffsets(),
    attackFrames: getAthenaAttackFrames(),
    feedback: getAthenaFeedbackTiers(),
    report: null,
  };
}

function loadViceContent(): CharacterContent {
  return {
    data: { id: 'vice', name: 'Vice', nameCn: '麦卓', color: '#4B0082' },
    attacks: getViceFrameData(),
    attackKeys: VICE_ATTACK_KEYS,
    commands: VICE_MOVE_LIST,
    availableActions: VICE_AVAILABLE_ACTIONS,
    animations: VICE_ANIMATION_META,
    animSequenceNames: getViceAnimationNames(),
    hitboxes: getViceHitboxOffsets(),
    attackFrames: getViceAttackFrames(),
    feedback: getViceFeedbackTiers(),
    report: null,
  };
}

function loadYamazakiContent(): CharacterContent {
  return {
    data: { id: 'yamazaki', name: 'Ryuji Yamazaki', nameCn: '山崎竜二', color: '#556622' },
    attacks: getYamazakiFrameData(),
    attackKeys: YAMAZAKI_ATTACK_KEYS,
    commands: YAMAZAKI_MOVE_LIST,
    availableActions: YAMAZAKI_AVAILABLE_ACTIONS,
    animations: YAMAZAKI_ANIMATION_META,
    animSequenceNames: getYamazakiAnimationNames(),
    hitboxes: getYamazakiHitboxOffsets(),
    attackFrames: getYamazakiAttackFrames(),
    feedback: getYamazakiFeedbackTiers(),
    report: null,
  };
}

function loadShermieContent(): CharacterContent {
  return {
    data: { id: 'shermie', name: 'Shermie', nameCn: '夏尔美', color: '#8B008B' },
    attacks: getShermieFrameData(),
    attackKeys: SHERMIE_ATTACK_KEYS,
    commands: SHERMIE_MOVE_LIST,
    availableActions: SHERMIE_AVAILABLE_ACTIONS,
    animations: SHERMIE_ANIMATION_META,
    animSequenceNames: getShermieAnimationNames(),
    hitboxes: getShermieHitboxOffsets(),
    attackFrames: getShermieAttackFrames(),
    feedback: getShermieFeedbackTiers(),
    report: null,
  };
}
