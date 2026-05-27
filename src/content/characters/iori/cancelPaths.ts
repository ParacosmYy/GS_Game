/**
 * Iori Cancel Paths — Cancel route matrix for Iori Yagami
 *
 * Defines all cancel routes for Iori's moveset:
 * - Normal -> Special cancels (e.g. STAND_A -> IORI_AOIHANA)
 * - Rapid cancel chains (light normals)
 * - Rekka followup chains (Aoihana -> Aoihana_2 -> Aoihana_3)
 * - Command normal routes (Yume Yumi from stand A, Katanugi from crouch B)
 * - Special -> Super (DM) cancels (e.g. IORI_ONIYAKI -> DM_YAOTOME)
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

// ===== Iori Normal -> Special Cancel Routes =====
// KOF2002: Any grounded normal on hit can cancel into specials/command normals

const IORI_SPECIALS = [
  'IORI_YAMIBARAI', 'IORI_YAMIBARAI_C',
  'IORI_ONIYAKI', 'IORI_ONIYAKI_C',
  'IORI_AOIHANA',
  'IORI_KOTOTSUKI',
  'IORI_KUZUKAZE',
];

const IORI_NORMAL_TO_SPECIAL: CancelRoute[] = [
  // Far stand normals -> specials
  {
    from: 'STAND_A',
    to: [...IORI_SPECIALS],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'STAND_B',
    to: [...IORI_SPECIALS],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'STAND_C',
    to: [...IORI_SPECIALS],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'STAND_D',
    to: [...IORI_SPECIALS],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  // Close normals -> specials (better combo starters)
  {
    from: 'CLOSE_A',
    to: [...IORI_SPECIALS],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'CLOSE_B',
    to: [...IORI_SPECIALS],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'CLOSE_C',
    to: [...IORI_SPECIALS],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'CLOSE_D',
    to: [...IORI_SPECIALS],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  // Crouch normals -> specials
  {
    from: 'CROUCH_A',
    to: [...IORI_SPECIALS],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'CROUCH_B',
    to: [...IORI_SPECIALS],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'CROUCH_C',
    to: [...IORI_SPECIALS],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'CROUCH_D',
    to: [...IORI_SPECIALS],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  // Command normals -> specials (only when cancelled into, not raw)
  {
    from: 'IORI_YUMEYUMI',
    to: ['IORI_ONIYAKI', 'IORI_ONIYAKI_C', 'IORI_YAMIBARAI'],
    cancelType: 'command',
    requiresHit: true,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'IORI_KATANUGI',
    to: ['IORI_ONIYAKI', 'IORI_ONIYAKI_C', 'IORI_YAMIBARAI'],
    cancelType: 'command',
    requiresHit: true,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
];

// ===== Iori Rekka Followup Chains =====
// Aoihana chain: Aoihana -> Aoihana_2 -> Aoihana_3

const IORI_REKKA_CHAINS: CancelRoute[] = [
  // 葵花 chain
  {
    from: 'IORI_AOIHANA',
    to: ['IORI_AOIHANA_2'],
    cancelType: 'rekka',
    requiresHit: true,
    stockCost: 0,
    timerCost: 0,
    windowFrames: 20, // REKKA_WINDOW
  },
  {
    from: 'IORI_AOIHANA_2',
    to: ['IORI_AOIHANA_3'],
    cancelType: 'rekka',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: 20,
  },
];

// ===== Iori Special -> Super (DM) Cancel Routes =====
// KOF2002: Super Cancel — special move on hit can cancel into DM

const IORI_SPECIAL_TO_DM: CancelRoute[] = [
  {
    from: 'IORI_YAMIBARAI',
    to: ['DM_YAOTOME'],
    cancelType: 'super',
    requiresHit: true,
    stockCost: SUPER_CANCEL_STOCK_COST,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_SUPER,
  },
  {
    from: 'IORI_YAMIBARAI_C',
    to: ['DM_YAOTOME'],
    cancelType: 'super',
    requiresHit: true,
    stockCost: SUPER_CANCEL_STOCK_COST,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_SUPER,
  },
  {
    from: 'IORI_ONIYAKI',
    to: ['DM_YAOTOME'],
    cancelType: 'super',
    requiresHit: true,
    stockCost: SUPER_CANCEL_STOCK_COST,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_SUPER,
  },
  {
    from: 'IORI_ONIYAKI_C',
    to: ['DM_YAOTOME'],
    cancelType: 'super',
    requiresHit: true,
    stockCost: SUPER_CANCEL_STOCK_COST,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_SUPER,
  },
  {
    from: 'IORI_KOTOTSUKI',
    to: ['DM_YAOTOME'],
    cancelType: 'super',
    requiresHit: true,
    stockCost: SUPER_CANCEL_STOCK_COST,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_SUPER,
  },
  {
    from: 'IORI_AOIHANA',
    to: ['DM_YAOTOME'],
    cancelType: 'super',
    requiresHit: true,
    stockCost: SUPER_CANCEL_STOCK_COST,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_SUPER,
  },
  {
    from: 'IORI_AOIHANA_2',
    to: ['DM_YAOTOME'],
    cancelType: 'super',
    requiresHit: true,
    stockCost: SUPER_CANCEL_STOCK_COST,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_SUPER,
  },
];

// ===== Iori MAX Mode Free Cancel Routes =====
// KOF2002: In MAX mode, any special can cancel into any other special

const IORI_FREE_CANCEL: CancelRoute[] = [
  {
    from: 'IORI_ONIYAKI',
    to: ['IORI_YAMIBARAI', 'IORI_YAMIBARAI_C', 'IORI_KOTOTSUKI', 'IORI_ONIYAKI_C', 'IORI_AOIHANA'],
    cancelType: 'free',
    requiresHit: true,
    stockCost: 0,
    timerCost: FREE_CANCEL_TIMER_COST,
    windowFrames: CANCEL_WINDOW_FREE,
  },
  {
    from: 'IORI_ONIYAKI_C',
    to: ['IORI_YAMIBARAI', 'IORI_YAMIBARAI_C', 'IORI_KOTOTSUKI', 'IORI_ONIYAKI', 'IORI_AOIHANA'],
    cancelType: 'free',
    requiresHit: true,
    stockCost: 0,
    timerCost: FREE_CANCEL_TIMER_COST,
    windowFrames: CANCEL_WINDOW_FREE,
  },
  {
    from: 'IORI_YAMIBARAI',
    to: ['IORI_ONIYAKI', 'IORI_ONIYAKI_C', 'IORI_KOTOTSUKI', 'IORI_YAMIBARAI_C', 'IORI_AOIHANA'],
    cancelType: 'free',
    requiresHit: true,
    stockCost: 0,
    timerCost: FREE_CANCEL_TIMER_COST,
    windowFrames: CANCEL_WINDOW_FREE,
  },
  {
    from: 'IORI_YAMIBARAI_C',
    to: ['IORI_ONIYAKI', 'IORI_ONIYAKI_C', 'IORI_KOTOTSUKI', 'IORI_YAMIBARAI', 'IORI_AOIHANA'],
    cancelType: 'free',
    requiresHit: true,
    stockCost: 0,
    timerCost: FREE_CANCEL_TIMER_COST,
    windowFrames: CANCEL_WINDOW_FREE,
  },
  {
    from: 'IORI_KOTOTSUKI',
    to: ['IORI_ONIYAKI', 'IORI_ONIYAKI_C', 'IORI_YAMIBARAI', 'IORI_YAMIBARAI_C', 'IORI_AOIHANA'],
    cancelType: 'free',
    requiresHit: true,
    stockCost: 0,
    timerCost: FREE_CANCEL_TIMER_COST,
    windowFrames: CANCEL_WINDOW_FREE,
  },
  {
    from: 'IORI_AOIHANA',
    to: ['IORI_ONIYAKI', 'IORI_ONIYAKI_C', 'IORI_YAMIBARAI', 'IORI_YAMIBARAI_C', 'IORI_KOTOTSUKI'],
    cancelType: 'free',
    requiresHit: true,
    stockCost: 0,
    timerCost: FREE_CANCEL_TIMER_COST,
    windowFrames: CANCEL_WINDOW_FREE,
  },
];

// ===== Rapid Cancel (Light Normal Chains) =====
// KOF2002: Light normals on hit can chain into other light normals

const IORI_RAPID_CANCEL: CancelRoute[] = [
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
 * All Iori cancel routes combined.
 * Ordered by priority: rapid > rekka > normal > command > free > super
 */
export const IORI_CANCEL_PATHS: CancelRoute[] = [
  ...IORI_RAPID_CANCEL,
  ...IORI_REKKA_CHAINS,
  ...IORI_NORMAL_TO_SPECIAL,
  ...IORI_SPECIAL_TO_DM,
  ...IORI_FREE_CANCEL,
];

// ===== Cancel Validation API =====

/**
 * Check if a cancel from `source` to `target` is valid for Iori.
 * Returns the matching CancelRoute if valid, null otherwise.
 */
export function findCancelRoute(source: string, target: string): CancelRoute | null {
  for (const route of IORI_CANCEL_PATHS) {
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
  for (const route of IORI_CANCEL_PATHS) {
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
 * Get all cancel routes of a specific type for Iori.
 */
export function getCancelRoutesByType(cancelType: CancelType): CancelRoute[] {
  return IORI_CANCEL_PATHS.filter(r => r.cancelType === cancelType);
}

/**
 * Check if a given attack is a valid cancel source for Iori.
 */
export function isCancelSource(attackType: string): boolean {
  return IORI_CANCEL_PATHS.some(r => r.from === attackType);
}

/**
 * Get the best cancel route from source to any available target.
 * Priority: super > free > rekka > command > normal > rapid
 */
export function getBestCancelRoute(source: string, availableStocks: number, maxModeActive: boolean): CancelRoute | null {
  const priority: CancelType[] = ['super', 'free', 'rekka', 'command', 'normal', 'rapid'];
  for (const type of priority) {
    const route = IORI_CANCEL_PATHS.find(r =>
      r.from === source && r.cancelType === type
      && r.stockCost <= availableStocks
      && (type !== 'free' || maxModeActive)
    );
    if (route) return route;
  }
  return null;
}
