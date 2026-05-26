/**
 * Content Loader — Unified character content access
 *
 * Provides a single function to load all content for a given character.
 * Currently supports 'ryo'; will expand as more characters get content packages.
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

/** Unified character content interface */
export interface CharacterContent {
  /** Character metadata */
  data: typeof RYO_CHARACTER_DATA;
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
  report: RyoCompletenessReport;
}

/** Load all content for a given character */
export function loadCharacterContent(charId: string): CharacterContent {
  switch (charId) {
    case 'ryo':
      return loadRyoContent();
    default:
      throw new Error(`Unknown character: ${charId}`);
  }
}

/** Check if a character has a content package */
export function hasCharacterContent(charId: string): boolean {
  return charId === 'ryo';
}

/** List all characters with content packages */
export function getAvailableCharacterIds(): string[] {
  return ['ryo'];
}

function loadRyoContent(): CharacterContent {
  return {
    data: RYO_CHARACTER_DATA,
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
