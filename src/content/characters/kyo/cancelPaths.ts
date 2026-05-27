/**
 * Kyo Cancel Paths — Cancel route matrix for Kyo Kusanagi
 *
 * Defines all cancel routes for Kyo's moveset:
 * - Normal -> Special cancels (e.g. STAND_A -> KYO_YAMIBARAI)
 * - Rapid cancel chains (light normals)
 * - Rekka followup chains (Aragami -> KonoKizu/YanoSabi, Dokugami -> Tsumiyomi)
 * - Command normal routes (Gofu You from stand B, 88shiki from crouch D)
 * - Special -> Super (DM) cancels (e.g. KYO_ONIYAKI -> DM_OROCHINAGI)
 * - Free cancel routes (MAX mode: special -> special)
 *
 * KOF2002 cancel rules:
 * - Normal -> Special: on hit or block, within cancel window
 * - Special -> DM (Super Cancel): on hit only, costs extra stock
 * - Rapid Cancel: light normal on hit chains to next light normal
 * - Free Cancel: MAX mode only, special -> special (drains timer)
 */
import {
  CANCEL_WINDOW_NORMAL,
  CANCEL_WINDOW_RAPID,
  CANCEL_WINDOW_SUPER,
  CANCEL_WINDOW_FREE,
  SUPER_CANCEL_STOCK_COST,
  FREE_CANCEL_TIMER_COST,
} from '../../../core/constants.js';

// ===== Cancel Route Types =====

export type CancelType = 'normal' | 'rapid' | 'super' | 'free' | 'command' | 'rekka';

export interface CancelRoute {
  /** Source attack type */
  from: string;
  /** Target attack types this can cancel into */
  to: string[];
  /** Cancel type (determines timing window and resource cost) */
  cancelType: CancelType;
  /** Whether the cancel requires a hit (vs block) */
  requiresHit: boolean;
  /** Stock cost for this cancel (0 = free, 1+ costs stocks) */
  stockCost: number;
  /** Timer cost ratio for MAX mode free cancels (0-1) */
  timerCost: number;
  /** Cancel window in frames */
  windowFrames: number;
}

// ===== Kyo Normal -> Special Cancel Routes =====
// KOF2002: Any grounded normal on hit can cancel into specials/command normals

const KYO_SPECIALS = [
  'KYO_YAMIBARAI', 'KYO_YAMIBARAI_C',
  'KYO_ONIYAKI', 'KYO_ONIYAKI_C',
  'KYO_75KAI', 'KYO_RED_KICK',
  'KYO_ARAGAMI', 'KYO_DOKUGAMI',
];

const KYO_SPECIALS_ALL = [
  ...KYO_SPECIALS,
  'KYO_ARAGAMI_KONOKIZU', 'KYO_ARAGAMI_YANOSABI',
  'KYO_NANASE', 'KYO_KOTO_TSUKI', 'KYO_YAKISOGI',
  'KYO_TSUMIYOMI', 'KYO_BATSUYOMI',
];

const KYO_NORMAL_TO_SPECIAL: CancelRoute[] = [
  // Far stand normals -> specials
  {
    from: 'STAND_A',
    to: [...KYO_SPECIALS],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'STAND_B',
    to: [...KYO_SPECIALS],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'STAND_C',
    to: [...KYO_SPECIALS],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'STAND_D',
    to: [...KYO_SPECIALS],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  // Close normals -> specials (better combo starters)
  {
    from: 'CLOSE_A',
    to: [...KYO_SPECIALS],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'CLOSE_B',
    to: [...KYO_SPECIALS],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'CLOSE_C',
    to: [...KYO_SPECIALS],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'CLOSE_D',
    to: [...KYO_SPECIALS],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  // Crouch normals -> specials
  {
    from: 'CROUCH_A',
    to: [...KYO_SPECIALS],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'CROUCH_B',
    to: [...KYO_SPECIALS],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'CROUCH_C',
    to: [...KYO_SPECIALS],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'CROUCH_D',
    to: [...KYO_SPECIALS],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  // Command normals -> specials (only when cancelled into, not raw)
  {
    from: 'CMD_GOFU_YOU',
    to: ['KYO_ONIYAKI', 'KYO_ONIYAKI_C', 'KYO_YAMIBARAI'],
    cancelType: 'command',
    requiresHit: true,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'CMD_88SHIKI',
    to: ['KYO_ONIYAKI', 'KYO_ONIYAKI_C', 'KYO_YAMIBARAI'],
    cancelType: 'command',
    requiresHit: true,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
];

// ===== Kyo Rekka Followup Chains =====
// Aragami chain: Aragami -> KonoKizu / YanoSabi
// KonoKizu -> Nanase / Gekio
// YanoSabi -> Gekio / YakiSogi
// Dokugami chain: Dokugami -> Tsumiyomi -> Batsuyomi

const KYO_REKKA_CHAINS: CancelRoute[] = [
  // 75 Shiki Kai followup
  {
    from: 'KYO_75KAI',
    to: ['KYO_75KAI_2'],
    cancelType: 'rekka',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: 20, // REKKA_WINDOW from kyo.ts
  },
  // Aragami chain
  {
    from: 'KYO_ARAGAMI',
    to: ['KYO_ARAGAMI_KONOKIZU', 'KYO_ARAGAMI_YANOSABI'],
    cancelType: 'rekka',
    requiresHit: true,
    stockCost: 0,
    timerCost: 0,
    windowFrames: 20,
  },
  {
    from: 'KYO_ARAGAMI_KONOKIZU',
    to: ['KYO_NANASE', 'KYO_KOTO_TSUKI'],
    cancelType: 'rekka',
    requiresHit: true,
    stockCost: 0,
    timerCost: 0,
    windowFrames: 20,
  },
  {
    from: 'KYO_ARAGAMI_YANOSABI',
    to: ['KYO_KOTO_TSUKI', 'KYO_YAKISOGI'],
    cancelType: 'rekka',
    requiresHit: true,
    stockCost: 0,
    timerCost: 0,
    windowFrames: 20,
  },
  // Dokugami chain
  {
    from: 'KYO_DOKUGAMI',
    to: ['KYO_TSUMIYOMI'],
    cancelType: 'rekka',
    requiresHit: true,
    stockCost: 0,
    timerCost: 0,
    windowFrames: 20,
  },
  {
    from: 'KYO_TSUMIYOMI',
    to: ['KYO_BATSUYOMI'],
    cancelType: 'rekka',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: 20,
  },
];

// ===== Kyo Special -> Super (DM) Cancel Routes =====
// KOF2002: Super Cancel — special move on hit can cancel into DM

const KYO_SPECIAL_TO_DM: CancelRoute[] = [
  {
    from: 'KYO_YAMIBARAI',
    to: ['DM_OROCHINAGI'],
    cancelType: 'super',
    requiresHit: true,
    stockCost: SUPER_CANCEL_STOCK_COST,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_SUPER,
  },
  {
    from: 'KYO_YAMIBARAI_C',
    to: ['DM_OROCHINAGI'],
    cancelType: 'super',
    requiresHit: true,
    stockCost: SUPER_CANCEL_STOCK_COST,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_SUPER,
  },
  {
    from: 'KYO_ONIYAKI',
    to: ['DM_OROCHINAGI'],
    cancelType: 'super',
    requiresHit: true,
    stockCost: SUPER_CANCEL_STOCK_COST,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_SUPER,
  },
  {
    from: 'KYO_ONIYAKI_C',
    to: ['DM_OROCHINAGI'],
    cancelType: 'super',
    requiresHit: true,
    stockCost: SUPER_CANCEL_STOCK_COST,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_SUPER,
  },
  {
    from: 'KYO_RED_KICK',
    to: ['DM_OROCHINAGI'],
    cancelType: 'super',
    requiresHit: true,
    stockCost: SUPER_CANCEL_STOCK_COST,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_SUPER,
  },
  {
    from: 'KYO_75KAI',
    to: ['DM_OROCHINAGI'],
    cancelType: 'super',
    requiresHit: true,
    stockCost: SUPER_CANCEL_STOCK_COST,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_SUPER,
  },
  {
    from: 'KYO_75KAI_2',
    to: ['DM_OROCHINAGI'],
    cancelType: 'super',
    requiresHit: true,
    stockCost: SUPER_CANCEL_STOCK_COST,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_SUPER,
  },
  {
    from: 'KYO_ARAGAMI',
    to: ['DM_OROCHINAGI'],
    cancelType: 'super',
    requiresHit: true,
    stockCost: SUPER_CANCEL_STOCK_COST,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_SUPER,
  },
  {
    from: 'KYO_DOKUGAMI',
    to: ['DM_OROCHINAGI'],
    cancelType: 'super',
    requiresHit: true,
    stockCost: SUPER_CANCEL_STOCK_COST,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_SUPER,
  },
];

// ===== Kyo MAX Mode Free Cancel Routes =====
// KOF2002: In MAX mode, any special can cancel into any other special

const KYO_FREE_CANCEL: CancelRoute[] = [
  {
    from: 'KYO_ONIYAKI',
    to: ['KYO_YAMIBARAI', 'KYO_YAMIBARAI_C', 'KYO_RED_KICK', 'KYO_ONIYAKI_C'],
    cancelType: 'free',
    requiresHit: true,
    stockCost: 0,
    timerCost: FREE_CANCEL_TIMER_COST,
    windowFrames: CANCEL_WINDOW_FREE,
  },
  {
    from: 'KYO_ONIYAKI_C',
    to: ['KYO_YAMIBARAI', 'KYO_YAMIBARAI_C', 'KYO_RED_KICK', 'KYO_ONIYAKI'],
    cancelType: 'free',
    requiresHit: true,
    stockCost: 0,
    timerCost: FREE_CANCEL_TIMER_COST,
    windowFrames: CANCEL_WINDOW_FREE,
  },
  {
    from: 'KYO_YAMIBARAI',
    to: ['KYO_ONIYAKI', 'KYO_ONIYAKI_C', 'KYO_RED_KICK', 'KYO_YAMIBARAI_C'],
    cancelType: 'free',
    requiresHit: true,
    stockCost: 0,
    timerCost: FREE_CANCEL_TIMER_COST,
    windowFrames: CANCEL_WINDOW_FREE,
  },
  {
    from: 'KYO_YAMIBARAI_C',
    to: ['KYO_ONIYAKI', 'KYO_ONIYAKI_C', 'KYO_RED_KICK', 'KYO_YAMIBARAI'],
    cancelType: 'free',
    requiresHit: true,
    stockCost: 0,
    timerCost: FREE_CANCEL_TIMER_COST,
    windowFrames: CANCEL_WINDOW_FREE,
  },
  {
    from: 'KYO_RED_KICK',
    to: ['KYO_ONIYAKI', 'KYO_ONIYAKI_C', 'KYO_YAMIBARAI', 'KYO_YAMIBARAI_C'],
    cancelType: 'free',
    requiresHit: true,
    stockCost: 0,
    timerCost: FREE_CANCEL_TIMER_COST,
    windowFrames: CANCEL_WINDOW_FREE,
  },
  {
    from: 'KYO_75KAI',
    to: ['KYO_ONIYAKI', 'KYO_ONIYAKI_C', 'KYO_YAMIBARAI', 'KYO_YAMIBARAI_C', 'KYO_RED_KICK'],
    cancelType: 'free',
    requiresHit: true,
    stockCost: 0,
    timerCost: FREE_CANCEL_TIMER_COST,
    windowFrames: CANCEL_WINDOW_FREE,
  },
];

// ===== Rapid Cancel (Light Normal Chains) =====
// KOF2002: Light normals on hit can chain into other light normals

const KYO_RAPID_CANCEL: CancelRoute[] = [
  {
    from: 'STAND_A',
    to: ['STAND_A', 'STAND_B', 'CROUCH_A', 'CROUCH_B', 'CLOSE_A', 'CLOSE_B'],
    cancelType: 'rapid',
    requiresHit: true,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_RAPID,
  },
  {
    from: 'CLOSE_A',
    to: ['STAND_A', 'STAND_B', 'CROUCH_A', 'CROUCH_B', 'CLOSE_B'],
    cancelType: 'rapid',
    requiresHit: true,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_RAPID,
  },
  {
    from: 'CROUCH_A',
    to: ['STAND_A', 'STAND_B', 'CROUCH_A', 'CROUCH_B', 'CLOSE_A', 'CLOSE_B'],
    cancelType: 'rapid',
    requiresHit: true,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_RAPID,
  },
  {
    from: 'STAND_B',
    to: ['STAND_A', 'STAND_B', 'CROUCH_A', 'CROUCH_B'],
    cancelType: 'rapid',
    requiresHit: true,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_RAPID,
  },
  {
    from: 'CLOSE_B',
    to: ['STAND_A', 'STAND_B', 'CROUCH_A', 'CROUCH_B', 'CLOSE_A'],
    cancelType: 'rapid',
    requiresHit: true,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_RAPID,
  },
  {
    from: 'CROUCH_B',
    to: ['STAND_A', 'STAND_B', 'CROUCH_A', 'CROUCH_B'],
    cancelType: 'rapid',
    requiresHit: true,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_RAPID,
  },
];

// ===== Complete Cancel Matrix =====

/**
 * All Kyo cancel routes combined.
 * Ordered by priority: rapid > rekka > normal > command > free > super
 */
export const KYO_CANCEL_PATHS: CancelRoute[] = [
  ...KYO_RAPID_CANCEL,
  ...KYO_REKKA_CHAINS,
  ...KYO_NORMAL_TO_SPECIAL,
  ...KYO_SPECIAL_TO_DM,
  ...KYO_FREE_CANCEL,
];

// ===== Cancel Validation API =====

/**
 * Check if a cancel from `source` to `target` is valid for Kyo.
 * Returns the matching CancelRoute if valid, null otherwise.
 */
export function findCancelRoute(source: string, target: string): CancelRoute | null {
  for (const route of KYO_CANCEL_PATHS) {
    if (route.from === source && route.to.includes(target)) {
      return route;
    }
  }
  return null;
}

/**
 * Get all valid cancel targets from a given source attack.
 */
export function getCancelTargets(source: string): string[] {
  const targets = new Set<string>();
  for (const route of KYO_CANCEL_PATHS) {
    if (route.from === source) {
      for (const t of route.to) {
        targets.add(t);
      }
    }
  }
  return Array.from(targets);
}

/**
 * Validate a cancel attempt.
 * Returns true if the cancel is valid given the current game state.
 */
export function validateCancel(
  source: string,
  target: string,
  hitConfirmed: boolean,
  stocks: number,
  maxModeActive: boolean,
  maxModeTimer: number,
  maxModeDuration: number,
  framesSinceHit: number,
): { valid: boolean; reason?: string } {
  const route = findCancelRoute(source, target);
  if (!route) {
    return { valid: false, reason: `No cancel route from ${source} to ${target}` };
  }

  // Check hit requirement
  if (route.requiresHit && !hitConfirmed) {
    return { valid: false, reason: `${route.cancelType} cancel requires hit confirmation` };
  }

  // Check cancel window timing
  if (framesSinceHit > route.windowFrames) {
    return { valid: false, reason: `Cancel window expired (${framesSinceHit} > ${route.windowFrames} frames)` };
  }

  // Check stock cost
  if (route.stockCost > 0 && stocks < route.stockCost) {
    return { valid: false, reason: `Not enough stocks (${stocks} < ${route.stockCost})` };
  }

  // Check MAX mode for free cancels
  if (route.cancelType === 'free' && !maxModeActive) {
    return { valid: false, reason: 'Free cancel requires MAX mode' };
  }

  // Check MAX mode timer for free cancels
  if (route.timerCost > 0 && maxModeActive) {
    const drainAmount = Math.max(1, Math.round(maxModeDuration * route.timerCost));
    if (maxModeTimer < drainAmount) {
      return { valid: false, reason: `Not enough MAX mode timer (${maxModeTimer} < ${drainAmount})` };
    }
  }

  return { valid: true };
}

/**
 * Get all cancel routes of a specific type for Kyo.
 */
export function getCancelRoutesByType(cancelType: CancelType): CancelRoute[] {
  return KYO_CANCEL_PATHS.filter(r => r.cancelType === cancelType);
}

/**
 * Check if a given attack is a valid cancel source for Kyo.
 */
export function isCancelSource(attackType: string): boolean {
  return KYO_CANCEL_PATHS.some(r => r.from === attackType);
}

/**
 * Get the best cancel route from source to any available target.
 * Priority: super > free > rekka > command > normal > rapid
 */
export function getBestCancelRoute(source: string, availableStocks: number, maxModeActive: boolean): CancelRoute | null {
  const priority: CancelType[] = ['super', 'free', 'rekka', 'command', 'normal', 'rapid'];
  for (const type of priority) {
    const route = KYO_CANCEL_PATHS.find(r =>
      r.from === source && r.cancelType === type
      && r.stockCost <= availableStocks
      && (type !== 'free' || maxModeActive)
    );
    if (route) return route;
  }
  return null;
}
