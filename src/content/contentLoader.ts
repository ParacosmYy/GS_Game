/**
 * Content Loader — Unified character content access
 *
 * Provides a single function to load all content for a given character.
 * Supports MUGEN-backed KOF2002 content packages through one runtime-agnostic entry.
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
import {
  getBenimaruFrameData,
  BENIMARU_ATTACK_KEYS,
  BENIMARU_MOVE_LIST,
  BENIMARU_AVAILABLE_ACTIONS,
  BENIMARU_ANIMATION_META,
  getBenimaruAnimationNames,
  getBenimaruHitboxOffsets,
  getBenimaruAttackFrames,
  getBenimaruFeedbackTiers,
} from './characters/benimaru/index.js';
import {
  getAndyFrameData,
  ANDY_ATTACK_KEYS,
  ANDY_MOVE_LIST,
  ANDY_AVAILABLE_ACTIONS,
  ANDY_ANIMATION_META,
  getAndyAnimationNames,
  getAndyHitboxOffsets,
  getAndyAttackFrames,
  getAndyFeedbackTiers,
} from './characters/andy/index.js';
import {
  getClarkFrameData,
  CLARK_ATTACK_KEYS,
  CLARK_MOVE_LIST,
  CLARK_AVAILABLE_ACTIONS,
  CLARK_ANIMATION_META,
  getClarkAnimationNames,
  getClarkHitboxOffsets,
  getClarkAttackFrames,
  getClarkFeedbackTiers,
} from './characters/clark/index.js';
import {
  getKdashFrameData,
  KDASH_ATTACK_KEYS,
  KDASH_MOVE_LIST,
  KDASH_AVAILABLE_ACTIONS,
  KDASH_ANIMATION_META,
  getKdashAnimationNames,
  getKdashHitboxOffsets,
  getKdashAttackFrames,
  getKdashFeedbackTiers,
} from './characters/kdash/index.js';
import {
  getMaiFrameData,
  MAI_ATTACK_KEYS,
  MAI_MOVE_LIST,
  MAI_AVAILABLE_ACTIONS,
  MAI_ANIMATION_META,
  getMaiAnimationNames,
  getMaiHitboxOffsets,
  getMaiAttackFrames,
  getMaiFeedbackTiers,
} from './characters/mai/index.js';
import {
  getYashiroFrameData,
  YASHIRO_ATTACK_KEYS,
  YASHIRO_MOVE_LIST,
  YASHIRO_AVAILABLE_ACTIONS,
  YASHIRO_ANIMATION_META,
  getYashiroAnimationNames,
  getYashiroHitboxOffsets,
  getYashiroAttackFrames,
  getYashiroFeedbackTiers,
} from './characters/yashiro/index.js';
import {
  getYuriFrameData,
  YURI_ATTACK_KEYS,
  YURI_MOVE_LIST,
  YURI_AVAILABLE_ACTIONS,
  YURI_ANIMATION_META,
  getYuriAnimationNames,
  getYuriHitboxOffsets,
  getYuriAttackFrames,
  getYuriFeedbackTiers,
} from './characters/yuri/index.js';
import {
  getTakumaFrameData,
  TAKUMA_ATTACK_KEYS,
  TAKUMA_MOVE_LIST,
  TAKUMA_AVAILABLE_ACTIONS,
  TAKUMA_ANIMATION_META,
  getTakumaAnimationNames,
  getTakumaHitboxOffsets,
  getTakumaAttackFrames,
  getTakumaFeedbackTiers,
} from './characters/takuma/index.js';
import {
  getKensouFrameData,
  KENSOU_ATTACK_KEYS,
  KENSOU_MOVE_LIST,
  KENSOU_AVAILABLE_ACTIONS,
  KENSOU_ANIMATION_META,
  getKensouAnimationNames,
  getKensouHitboxOffsets,
  getKensouAttackFrames,
  getKensouFeedbackTiers,
} from './characters/kensou/index.js';
import { generateKyoDimensionReport } from '../tools/kyoCompletenessReport.js';
import { generateIoriDimensionReport } from '../tools/ioriCompletenessReport.js';
import { generateTerryDimensionReport } from '../tools/terryCompletenessReport.js';
import { generateKimDimensionReport } from '../tools/kimCompletenessReport.js';

const AVAILABLE_CONTENT_IDS = [
  'ryo',
  'kyo',
  'iori',
  'terry',
  'kim',
  'athena',
  'vice',
  'yamazaki',
  'shermie',
  'benimaru',
  'andy',
  'clark',
  'kdash',
  'mai',
  'yashiro',
  'yuri',
  'takuma',
  'kensou',
] as const;

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
    case 'benimaru':
      return loadBenimaruContent();
    case 'andy':
      return loadAndyContent();
    case 'clark':
      return loadClarkContent();
    case 'kdash':
      return loadKdashContent();
    case 'mai':
      return loadMaiContent();
    case 'yashiro':
      return loadYashiroContent();
    case 'yuri':
      return loadYuriContent();
    case 'takuma':
      return loadTakumaContent();
    case 'kensou':
      return loadKensouContent();
    default:
      throw new Error(`Unknown character: ${charId}`);
  }
}

/** Check if a character has a content package */
export function hasCharacterContent(charId: string): boolean {
  return AVAILABLE_CONTENT_IDS.includes(charId as (typeof AVAILABLE_CONTENT_IDS)[number]);
}

/** List all characters with content packages */
export function getAvailableCharacterIds(): string[] {
  return [...AVAILABLE_CONTENT_IDS];
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

function loadBenimaruContent(): CharacterContent {
  return {
    data: { id: 'benimaru', name: 'Benimaru Nikaido', nameCn: '二階堂紅丸', color: '#FFD700' },
    attacks: getBenimaruFrameData(),
    attackKeys: BENIMARU_ATTACK_KEYS,
    commands: BENIMARU_MOVE_LIST,
    availableActions: BENIMARU_AVAILABLE_ACTIONS,
    animations: BENIMARU_ANIMATION_META,
    animSequenceNames: getBenimaruAnimationNames(),
    hitboxes: getBenimaruHitboxOffsets(),
    attackFrames: getBenimaruAttackFrames(),
    feedback: getBenimaruFeedbackTiers(),
    report: null,
  };
}

function loadAndyContent(): CharacterContent {
  return {
    data: { id: 'andy', name: 'Andy Bogard', nameCn: '安迪·博加德', color: '#4F7DD9' },
    attacks: getAndyFrameData(),
    attackKeys: ANDY_ATTACK_KEYS,
    commands: ANDY_MOVE_LIST,
    availableActions: ANDY_AVAILABLE_ACTIONS,
    animations: ANDY_ANIMATION_META,
    animSequenceNames: getAndyAnimationNames(),
    hitboxes: getAndyHitboxOffsets(),
    attackFrames: getAndyAttackFrames(),
    feedback: getAndyFeedbackTiers(),
    report: null,
  };
}

function loadClarkContent(): CharacterContent {
  return {
    data: { id: 'clark', name: 'Clark Still', nameCn: '克拉克·斯蒂尔', color: '#557A52' },
    attacks: getClarkFrameData(),
    attackKeys: CLARK_ATTACK_KEYS,
    commands: CLARK_MOVE_LIST,
    availableActions: CLARK_AVAILABLE_ACTIONS,
    animations: CLARK_ANIMATION_META,
    animSequenceNames: getClarkAnimationNames(),
    hitboxes: getClarkHitboxOffsets(),
    attackFrames: getClarkAttackFrames(),
    feedback: getClarkFeedbackTiers(),
    report: null,
  };
}

function loadKdashContent(): CharacterContent {
  return {
    data: { id: 'kdash', name: "K'", nameCn: "K'", color: '#D43A2F' },
    attacks: getKdashFrameData(),
    attackKeys: KDASH_ATTACK_KEYS,
    commands: KDASH_MOVE_LIST,
    availableActions: KDASH_AVAILABLE_ACTIONS,
    animations: KDASH_ANIMATION_META,
    animSequenceNames: getKdashAnimationNames(),
    hitboxes: getKdashHitboxOffsets(),
    attackFrames: getKdashAttackFrames(),
    feedback: getKdashFeedbackTiers(),
    report: null,
  };
}

function loadMaiContent(): CharacterContent {
  return {
    data: { id: 'mai', name: 'Mai Shiranui', nameCn: '不知火舞', color: '#D92F2F' },
    attacks: getMaiFrameData(),
    attackKeys: MAI_ATTACK_KEYS,
    commands: MAI_MOVE_LIST,
    availableActions: MAI_AVAILABLE_ACTIONS,
    animations: MAI_ANIMATION_META,
    animSequenceNames: getMaiAnimationNames(),
    hitboxes: getMaiHitboxOffsets(),
    attackFrames: getMaiAttackFrames(),
    feedback: getMaiFeedbackTiers(),
    report: null,
  };
}

function loadYashiroContent(): CharacterContent {
  return {
    data: { id: 'yashiro', name: 'Yashiro Nanakase', nameCn: '七枷社', color: '#A57A47' },
    attacks: getYashiroFrameData(),
    attackKeys: YASHIRO_ATTACK_KEYS,
    commands: YASHIRO_MOVE_LIST,
    availableActions: YASHIRO_AVAILABLE_ACTIONS,
    animations: YASHIRO_ANIMATION_META,
    animSequenceNames: getYashiroAnimationNames(),
    hitboxes: getYashiroHitboxOffsets(),
    attackFrames: getYashiroAttackFrames(),
    feedback: getYashiroFeedbackTiers(),
    report: null,
  };
}

function loadYuriContent(): CharacterContent {
  return {
    data: { id: 'yuri', name: 'Yuri Sakazaki', nameCn: '坂崎由莉', color: '#FF6699' },
    attacks: getYuriFrameData(),
    attackKeys: YURI_ATTACK_KEYS,
    commands: YURI_MOVE_LIST,
    availableActions: YURI_AVAILABLE_ACTIONS,
    animations: YURI_ANIMATION_META,
    animSequenceNames: getYuriAnimationNames(),
    hitboxes: getYuriHitboxOffsets(),
    attackFrames: getYuriAttackFrames(),
    feedback: getYuriFeedbackTiers(),
    report: null,
  };
}

function loadTakumaContent(): CharacterContent {
  return {
    data: { id: 'takuma', name: 'Takuma Sakazaki', nameCn: '坂崎琢磨', color: '#F0F0F0' },
    attacks: getTakumaFrameData(),
    attackKeys: TAKUMA_ATTACK_KEYS,
    commands: TAKUMA_MOVE_LIST,
    availableActions: TAKUMA_AVAILABLE_ACTIONS,
    animations: TAKUMA_ANIMATION_META,
    animSequenceNames: getTakumaAnimationNames(),
    hitboxes: getTakumaHitboxOffsets(),
    attackFrames: getTakumaAttackFrames(),
    feedback: getTakumaFeedbackTiers(),
    report: null,
  };
}

function loadKensouContent(): CharacterContent {
  return {
    data: { id: 'kensou', name: 'Sie Kensou', nameCn: '椎拳崇', color: '#66AAFF' },
    attacks: getKensouFrameData(),
    attackKeys: KENSOU_ATTACK_KEYS,
    commands: KENSOU_MOVE_LIST,
    availableActions: KENSOU_AVAILABLE_ACTIONS,
    animations: KENSOU_ANIMATION_META,
    animSequenceNames: getKensouAnimationNames(),
    hitboxes: getKensouHitboxOffsets(),
    attackFrames: getKensouAttackFrames(),
    feedback: getKensouFeedbackTiers(),
    report: null,
  };
}
