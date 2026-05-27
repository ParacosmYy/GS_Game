/**
 * Content Loader — Unified character content access
 *
 * Provides a single function to load all content for a given character.
 * Currently supports 'ryo' and 'kyo'; will expand as more characters get content packages.
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
    default:
      throw new Error(`Unknown character: ${charId}`);
  }
}

/** Check if a character has a content package */
export function hasCharacterContent(charId: string): boolean {
  return charId === 'ryo' || charId === 'kyo';
}

/** List all characters with content packages */
export function getAvailableCharacterIds(): string[] {
  return ['ryo', 'kyo'];
}

function loadRyoContent(): CharacterContent {
  return {
    data: { id: RYO_CHARACTER_DATA.id, name: RYO_CHARACTER_DATA.displayName, nameCn: RYO_CHARACTER_DATA.nameCn, color: '#2196F3' },
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
    report: { total: 0, completed: 0, score: 0, subdomains: {} } as any,
  };
}
