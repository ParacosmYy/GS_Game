/**
 * Ryo Cancel Paths — Cancel route matrix for Ryo Sakazaki
 *
 * Defines all cancel routes for Ryo's moveset:
 * - Normal -> Special cancels (e.g. STAND_A -> RYO_KOOU)
 * - Special -> Super (DM) cancels (e.g. RYO_KOOU -> DM_TEN_HA_OU)
 * - Rapid cancel chains (light normals)
 * - Free cancel routes (MAX mode)
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

export type CancelType = 'normal' | 'rapid' | 'super' | 'free' | 'command';

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

// ===== Ryo Normal -> Special Cancel Routes =====
// KOF2002: Any grounded normal on hit can cancel into specials/command normals
// Light normals can also chain into each other (rapid cancel)

const RYO_NORMAL_TO_SPECIAL: CancelRoute[] = [
  // Far stand normals -> specials
  {
    from: 'STAND_A',
    to: ['RYO_KOOU', 'RYO_KO_HOU', 'RYO_HIEN', 'RYO_HAOU', 'RYO_TSURIZAO', 'RYO_ORISHI', 'RYO_KOOUKEN_D', 'RYO_HIO_HACKER', 'RYO_ZANRETSU_KEN'],
    cancelType: 'normal',
    requiresHit: false, // KOF2002: normal cancel works on hit AND block
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'STAND_B',
    to: ['RYO_KOOU', 'RYO_KO_HOU', 'RYO_HIEN', 'RYO_HAOU', 'RYO_TSURIZAO', 'RYO_ORISHI', 'RYO_KOOUKEN_D', 'RYO_HIO_HACKER', 'RYO_ZANRETSU_KEN'],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'STAND_C',
    to: ['RYO_KOOU', 'RYO_KOOU_C', 'RYO_KO_HOU', 'RYO_KO_HOU_C', 'RYO_HIEN', 'RYO_HAOU', 'RYO_TSURIZAO', 'RYO_ORISHI', 'RYO_KOOUKEN_D', 'RYO_HIO_HACKER', 'RYO_ZANRETSU_KEN'],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'STAND_D',
    to: ['RYO_KOOU', 'RYO_KOOU_C', 'RYO_KO_HOU', 'RYO_KO_HOU_C', 'RYO_HIEN', 'RYO_HAOU', 'RYO_TSURIZAO', 'RYO_ORISHI', 'RYO_KOOUKEN_D', 'RYO_HIO_HACKER', 'RYO_ZANRETSU_KEN'],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  // Close normals -> specials (better combo starters)
  {
    from: 'CLOSE_A',
    to: ['RYO_KOOU', 'RYO_KO_HOU', 'RYO_HIEN', 'RYO_HAOU', 'RYO_TSURIZAO', 'RYO_ORISHI', 'RYO_ZANRETSU_KEN'],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'CLOSE_B',
    to: ['RYO_KOOU', 'RYO_KO_HOU', 'RYO_HIEN', 'RYO_HAOU', 'RYO_TSURIZAO', 'RYO_ORISHI', 'RYO_ZANRETSU_KEN'],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'CLOSE_C',
    to: ['RYO_KOOU', 'RYO_KOOU_C', 'RYO_KO_HOU', 'RYO_KO_HOU_C', 'RYO_HIEN', 'RYO_HAOU', 'RYO_TSURIZAO', 'RYO_ORISHI', 'RYO_KOOUKEN_D', 'RYO_HIO_HACKER', 'RYO_ZANRETSU_KEN'],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'CLOSE_D',
    to: ['RYO_KOOU', 'RYO_KOOU_C', 'RYO_KO_HOU', 'RYO_KO_HOU_C', 'RYO_HIEN', 'RYO_HAOU', 'RYO_TSURIZAO', 'RYO_ORISHI', 'RYO_KOOUKEN_D', 'RYO_HIO_HACKER', 'RYO_ZANRETSU_KEN'],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  // Crouch normals -> specials
  {
    from: 'CROUCH_A',
    to: ['RYO_KOOU', 'RYO_KO_HOU', 'RYO_HIEN', 'RYO_HAOU', 'RYO_ZANRETSU_KEN'],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'CROUCH_B',
    to: ['RYO_KOOU', 'RYO_KO_HOU', 'RYO_HIEN', 'RYO_HAOU', 'RYO_ZANRETSU_KEN'],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'CROUCH_C',
    to: ['RYO_KOOU', 'RYO_KOOU_C', 'RYO_KO_HOU', 'RYO_KO_HOU_C', 'RYO_HIEN', 'RYO_HAOU', 'RYO_KOOUKEN_D', 'RYO_HIO_HACKER', 'RYO_ZANRETSU_KEN'],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'CROUCH_D',
    to: ['RYO_KOOU', 'RYO_KOOU_C', 'RYO_KO_HOU', 'RYO_KO_HOU_C', 'RYO_HIEN', 'RYO_HAOU', 'RYO_KOOUKEN_D', 'RYO_HIO_HACKER', 'RYO_ZANRETSU_KEN'],
    cancelType: 'normal',
    requiresHit: false,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  // Command normals -> specials (only when cancelled into, not raw)
  {
    from: 'RYO_TSURIZAO',
    to: ['RYO_KOOU', 'RYO_KO_HOU', 'RYO_HIEN'],
    cancelType: 'command',
    requiresHit: true,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
  {
    from: 'RYO_ORISHI',
    to: ['RYO_KOOU', 'RYO_KO_HOU', 'RYO_HIEN'],
    cancelType: 'command',
    requiresHit: true,
    stockCost: 0,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_NORMAL,
  },
];

// ===== Ryo Special -> Super (DM) Cancel Routes =====
// KOF2002: Super Cancel — special move on hit can cancel into DM
// Costs extra stock on top of DM cost

const RYO_SPECIAL_TO_DM: CancelRoute[] = [
  {
    from: 'RYO_KOOU',
    to: ['DM_TEN_HA_OU', 'DM_RYUKO_RANBU'],
    cancelType: 'super',
    requiresHit: true,
    stockCost: SUPER_CANCEL_STOCK_COST,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_SUPER,
  },
  {
    from: 'RYO_KOOU_C',
    to: ['DM_TEN_HA_OU', 'DM_RYUKO_RANBU'],
    cancelType: 'super',
    requiresHit: true,
    stockCost: SUPER_CANCEL_STOCK_COST,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_SUPER,
  },
  {
    from: 'RYO_KO_HOU',
    to: ['DM_TEN_HA_OU', 'DM_RYUKO_RANBU'],
    cancelType: 'super',
    requiresHit: true,
    stockCost: SUPER_CANCEL_STOCK_COST,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_SUPER,
  },
  {
    from: 'RYO_KO_HOU_C',
    to: ['DM_TEN_HA_OU', 'DM_RYUKO_RANBU'],
    cancelType: 'super',
    requiresHit: true,
    stockCost: SUPER_CANCEL_STOCK_COST,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_SUPER,
  },
  {
    from: 'RYO_HIEN',
    to: ['DM_TEN_HA_OU', 'DM_RYUKO_RANBU'],
    cancelType: 'super',
    requiresHit: true,
    stockCost: SUPER_CANCEL_STOCK_COST,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_SUPER,
  },
  {
    from: 'RYO_HAOU',
    to: ['DM_TEN_HA_OU', 'DM_RYUKO_RANBU'],
    cancelType: 'super',
    requiresHit: true,
    stockCost: SUPER_CANCEL_STOCK_COST,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_SUPER,
  },
  {
    from: 'RYO_KOOUKEN_D',
    to: ['DM_TEN_HA_OU', 'DM_RYUKO_RANBU'],
    cancelType: 'super',
    requiresHit: true,
    stockCost: SUPER_CANCEL_STOCK_COST,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_SUPER,
  },
  {
    from: 'RYO_HIO_HACKER',
    to: ['DM_TEN_HA_OU', 'DM_RYUKO_RANBU'],
    cancelType: 'super',
    requiresHit: true,
    stockCost: SUPER_CANCEL_STOCK_COST,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_SUPER,
  },
  {
    from: 'RYO_ZANRETSU_KEN',
    to: ['DM_TEN_HA_OU', 'DM_RYUKO_RANBU'],
    cancelType: 'super',
    requiresHit: true,
    stockCost: SUPER_CANCEL_STOCK_COST,
    timerCost: 0,
    windowFrames: CANCEL_WINDOW_SUPER,
  },
];

// ===== Ryo MAX Mode Free Cancel Routes =====
// KOF2002: In MAX mode, any special can cancel into any other special
// Drains MAX mode timer per cancel

const RYO_OTHER_SPECIALS = ['RYO_KOOU', 'RYO_KOOU_C', 'RYO_KO_HOU', 'RYO_KO_HOU_C', 'RYO_HIEN', 'RYO_HAOU', 'RYO_KOOUKEN_D', 'RYO_HIO_HACKER', 'RYO_ZANRETSU_KEN'];

const RYO_FREE_CANCEL: CancelRoute[] = [
  {
    from: 'RYO_KOOU',
    to: ['RYO_KO_HOU', 'RYO_KO_HOU_C', 'RYO_HIEN', 'RYO_HAOU', 'RYO_KOOU_C', 'RYO_KOOUKEN_D', 'RYO_HIO_HACKER', 'RYO_ZANRETSU_KEN'],
    cancelType: 'free',
    requiresHit: true,
    stockCost: 0,
    timerCost: FREE_CANCEL_TIMER_COST,
    windowFrames: CANCEL_WINDOW_FREE,
  },
  {
    from: 'RYO_KOOU_C',
    to: ['RYO_KO_HOU', 'RYO_KO_HOU_C', 'RYO_HIEN', 'RYO_HAOU', 'RYO_KOOU', 'RYO_KOOUKEN_D', 'RYO_HIO_HACKER', 'RYO_ZANRETSU_KEN'],
    cancelType: 'free',
    requiresHit: true,
    stockCost: 0,
    timerCost: FREE_CANCEL_TIMER_COST,
    windowFrames: CANCEL_WINDOW_FREE,
  },
  {
    from: 'RYO_KO_HOU',
    to: ['RYO_KOOU', 'RYO_KOOU_C', 'RYO_HIEN', 'RYO_HAOU', 'RYO_KOOUKEN_D', 'RYO_HIO_HACKER', 'RYO_ZANRETSU_KEN'],
    cancelType: 'free',
    requiresHit: true,
    stockCost: 0,
    timerCost: FREE_CANCEL_TIMER_COST,
    windowFrames: CANCEL_WINDOW_FREE,
  },
  {
    from: 'RYO_KO_HOU_C',
    to: ['RYO_KOOU', 'RYO_KOOU_C', 'RYO_HIEN', 'RYO_HAOU', 'RYO_KOOUKEN_D', 'RYO_HIO_HACKER', 'RYO_ZANRETSU_KEN'],
    cancelType: 'free',
    requiresHit: true,
    stockCost: 0,
    timerCost: FREE_CANCEL_TIMER_COST,
    windowFrames: CANCEL_WINDOW_FREE,
  },
  {
    from: 'RYO_HIEN',
    to: ['RYO_KOOU', 'RYO_KOOU_C', 'RYO_KO_HOU', 'RYO_KO_HOU_C', 'RYO_HAOU', 'RYO_KOOUKEN_D', 'RYO_HIO_HACKER', 'RYO_ZANRETSU_KEN'],
    cancelType: 'free',
    requiresHit: true,
    stockCost: 0,
    timerCost: FREE_CANCEL_TIMER_COST,
    windowFrames: CANCEL_WINDOW_FREE,
  },
  {
    from: 'RYO_HAOU',
    to: ['RYO_KOOU', 'RYO_KOOU_C', 'RYO_KO_HOU', 'RYO_KO_HOU_C', 'RYO_HIEN', 'RYO_KOOUKEN_D', 'RYO_HIO_HACKER', 'RYO_ZANRETSU_KEN'],
    cancelType: 'free',
    requiresHit: true,
    stockCost: 0,
    timerCost: FREE_CANCEL_TIMER_COST,
    windowFrames: CANCEL_WINDOW_FREE,
  },
  {
    from: 'RYO_KOOUKEN_D',
    to: ['RYO_KOOU', 'RYO_KOOU_C', 'RYO_KO_HOU', 'RYO_KO_HOU_C', 'RYO_HIEN', 'RYO_HAOU', 'RYO_HIO_HACKER', 'RYO_ZANRETSU_KEN'],
    cancelType: 'free',
    requiresHit: true,
    stockCost: 0,
    timerCost: FREE_CANCEL_TIMER_COST,
    windowFrames: CANCEL_WINDOW_FREE,
  },
  {
    from: 'RYO_HIO_HACKER',
    to: ['RYO_KOOU', 'RYO_KOOU_C', 'RYO_KO_HOU', 'RYO_KO_HOU_C', 'RYO_HIEN', 'RYO_HAOU', 'RYO_KOOUKEN_D', 'RYO_ZANRETSU_KEN'],
    cancelType: 'free',
    requiresHit: true,
    stockCost: 0,
    timerCost: FREE_CANCEL_TIMER_COST,
    windowFrames: CANCEL_WINDOW_FREE,
  },
  {
    from: 'RYO_ZANRETSU_KEN',
    to: ['RYO_KOOU', 'RYO_KOOU_C', 'RYO_KO_HOU', 'RYO_KO_HOU_C', 'RYO_HIEN', 'RYO_HAOU', 'RYO_KOOUKEN_D', 'RYO_HIO_HACKER'],
    cancelType: 'free',
    requiresHit: true,
    stockCost: 0,
    timerCost: FREE_CANCEL_TIMER_COST,
    windowFrames: CANCEL_WINDOW_FREE,
  },
];

// ===== Rapid Cancel (Light Normal Chains) =====
// KOF2002: Light normals on hit can chain into other light normals

const RYO_RAPID_CANCEL: CancelRoute[] = [
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
 * All Ryo cancel routes combined.
 * Ordered by priority: rapid > normal > command > free > super
 */
export const RYO_CANCEL_PATHS: CancelRoute[] = [
  ...RYO_RAPID_CANCEL,
  ...RYO_NORMAL_TO_SPECIAL,
  ...RYO_SPECIAL_TO_DM,
  ...RYO_FREE_CANCEL,
];

// ===== Cancel Validation API =====

/**
 * Check if a cancel from `source` to `target` is valid for Ryo.
 * Returns the matching CancelRoute if valid, null otherwise.
 */
export function findCancelRoute(source: string, target: string): CancelRoute | null {
  for (const route of RYO_CANCEL_PATHS) {
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
  for (const route of RYO_CANCEL_PATHS) {
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
 * Get all cancel routes of a specific type for Ryo.
 */
export function getCancelRoutesByType(cancelType: CancelType): CancelRoute[] {
  return RYO_CANCEL_PATHS.filter(r => r.cancelType === cancelType);
}

/**
 * Check if a given attack is a valid cancel source for Ryo.
 */
export function isCancelSource(attackType: string): boolean {
  return RYO_CANCEL_PATHS.some(r => r.from === attackType);
}

/**
 * Get the best cancel route from source to any available target.
 * Priority: super > free > command > normal > rapid
 */
export function getBestCancelRoute(source: string, availableStocks: number, maxModeActive: boolean): CancelRoute | null {
  const priority: CancelType[] = ['super', 'free', 'command', 'normal', 'rapid'];
  for (const type of priority) {
    const route = RYO_CANCEL_PATHS.find(r =>
      r.from === source && r.cancelType === type
      && r.stockCost <= availableStocks
      && (type !== 'free' || maxModeActive)
    );
    if (route) return route;
  }
  return null;
}
