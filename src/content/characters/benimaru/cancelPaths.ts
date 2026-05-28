/**
 * Benimaru Cancel Paths — Cancel route matrix for Benimaru Nikaido
 *
 * Defines all cancel routes for Benimaru's moveset:
 * - Normal -> Special cancels (emphasis on lightning combos)
 * - Rapid cancel chains (light normals)
 * - Special -> Super (DM) cancels
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

export type CancelType = 'normal' | 'rapid' | 'super' | 'free' | 'command';

export interface CancelRoute {
  from: string;
  to: string[];
  cancelType: CancelType;
  requiresHit: boolean;
  stockCost: number;
  timerCost: number;
  windowFrames: number;
}

// ===== Benimaru Normal -> Special Cancel Routes =====

const BENIMARU_SPECIALS = [
  'BENIMARU_RAIJINKEN', 'BENIMARU_RAIJINKEN_C',
  'BENIMARU_IAI_GERI', 'BENIMARU_IAI_GERI_D',
  'BENIMARU_HANDOU_SANDAN_GERI',
  'BENIMARU_SHINKUU_KATATEGOMA', 'BENIMARU_SHINKUU_KATATEGOMA_C',
  'BENIMARU_COLLIDER',
  'BENIMARU_SUPER_INAZUMA_KICK', 'BENIMARU_SUPER_INAZUMA_KICK_D',
];

const BENIMARU_NORMAL_TO_SPECIAL: CancelRoute[] = [
  // Far stand normals -> specials
  { from: 'STAND_A', to: [...BENIMARU_SPECIALS], cancelType: 'normal', requiresHit: false, stockCost: 0, timerCost: 0, windowFrames: CANCEL_WINDOW_NORMAL },
  { from: 'STAND_B', to: [...BENIMARU_SPECIALS], cancelType: 'normal', requiresHit: false, stockCost: 0, timerCost: 0, windowFrames: CANCEL_WINDOW_NORMAL },
  { from: 'STAND_C', to: [...BENIMARU_SPECIALS], cancelType: 'normal', requiresHit: false, stockCost: 0, timerCost: 0, windowFrames: CANCEL_WINDOW_NORMAL },
  { from: 'STAND_D', to: [...BENIMARU_SPECIALS], cancelType: 'normal', requiresHit: false, stockCost: 0, timerCost: 0, windowFrames: CANCEL_WINDOW_NORMAL },
  // Close normals -> specials
  { from: 'CLOSE_A', to: [...BENIMARU_SPECIALS], cancelType: 'normal', requiresHit: false, stockCost: 0, timerCost: 0, windowFrames: CANCEL_WINDOW_NORMAL },
  { from: 'CLOSE_B', to: [...BENIMARU_SPECIALS], cancelType: 'normal', requiresHit: false, stockCost: 0, timerCost: 0, windowFrames: CANCEL_WINDOW_NORMAL },
  { from: 'CLOSE_C', to: [...BENIMARU_SPECIALS], cancelType: 'normal', requiresHit: false, stockCost: 0, timerCost: 0, windowFrames: CANCEL_WINDOW_NORMAL },
  { from: 'CLOSE_D', to: [...BENIMARU_SPECIALS], cancelType: 'normal', requiresHit: false, stockCost: 0, timerCost: 0, windowFrames: CANCEL_WINDOW_NORMAL },
  // Crouch normals -> specials
  { from: 'CROUCH_A', to: [...BENIMARU_SPECIALS], cancelType: 'normal', requiresHit: false, stockCost: 0, timerCost: 0, windowFrames: CANCEL_WINDOW_NORMAL },
  { from: 'CROUCH_B', to: [...BENIMARU_SPECIALS], cancelType: 'normal', requiresHit: false, stockCost: 0, timerCost: 0, windowFrames: CANCEL_WINDOW_NORMAL },
  { from: 'CROUCH_C', to: [...BENIMARU_SPECIALS], cancelType: 'normal', requiresHit: false, stockCost: 0, timerCost: 0, windowFrames: CANCEL_WINDOW_NORMAL },
  { from: 'CROUCH_D', to: [...BENIMARU_SPECIALS], cancelType: 'normal', requiresHit: false, stockCost: 0, timerCost: 0, windowFrames: CANCEL_WINDOW_NORMAL },
  // Command normals -> specials
  {
    from: 'BENIMARU_JACKKNIFE_KICK', to: ['BENIMARU_RAIJINKEN', 'BENIMARU_RAIJINKEN_C', 'BENIMARU_SUPER_INAZUMA_KICK'],
    cancelType: 'command', requiresHit: true, stockCost: 0, timerCost: 0, windowFrames: CANCEL_WINDOW_NORMAL,
  },
];

// ===== Benimaru Special -> Super (DM) Cancel Routes =====

const BENIMARU_DMS = ['DM_RAIKOUKEN', 'DM_RAIKOUKEN_A', 'DM_RAIKOUKEN_C', 'DM_GENEI_HURRICANE', 'SDM_RAIKOUKEN'];

const BENIMARU_SPECIAL_TO_DM: CancelRoute[] = BENIMARU_SPECIALS.map(src => ({
  from: src,
  to: [...BENIMARU_DMS],
  cancelType: 'super',
  requiresHit: true,
  stockCost: SUPER_CANCEL_STOCK_COST,
  timerCost: 0,
  windowFrames: CANCEL_WINDOW_SUPER,
}));

// ===== Benimaru MAX Mode Free Cancel Routes =====

const BENIMARU_FREE_CANCEL: CancelRoute[] = BENIMARU_SPECIALS.map(src => ({
  from: src,
  to: BENIMARU_SPECIALS.filter(t => t !== src),
  cancelType: 'free',
  requiresHit: true,
  stockCost: 0,
  timerCost: FREE_CANCEL_TIMER_COST,
  windowFrames: CANCEL_WINDOW_FREE,
}));

// ===== Rapid Cancel (Light Normal Chains) =====

const BENIMARU_RAPID_CANCEL: CancelRoute[] = [
  { from: 'STAND_A', to: ['STAND_A', 'STAND_B', 'CROUCH_A', 'CROUCH_B', 'CLOSE_A', 'CLOSE_B'], cancelType: 'rapid', requiresHit: true, stockCost: 0, timerCost: 0, windowFrames: CANCEL_WINDOW_RAPID },
  { from: 'CLOSE_A', to: ['STAND_A', 'STAND_B', 'CROUCH_A', 'CROUCH_B', 'CLOSE_B'], cancelType: 'rapid', requiresHit: true, stockCost: 0, timerCost: 0, windowFrames: CANCEL_WINDOW_RAPID },
  { from: 'CROUCH_A', to: ['STAND_A', 'STAND_B', 'CROUCH_A', 'CROUCH_B', 'CLOSE_A', 'CLOSE_B'], cancelType: 'rapid', requiresHit: true, stockCost: 0, timerCost: 0, windowFrames: CANCEL_WINDOW_RAPID },
  { from: 'STAND_B', to: ['STAND_A', 'STAND_B', 'CROUCH_A', 'CROUCH_B'], cancelType: 'rapid', requiresHit: true, stockCost: 0, timerCost: 0, windowFrames: CANCEL_WINDOW_RAPID },
  { from: 'CLOSE_B', to: ['STAND_A', 'STAND_B', 'CROUCH_A', 'CROUCH_B', 'CLOSE_A'], cancelType: 'rapid', requiresHit: true, stockCost: 0, timerCost: 0, windowFrames: CANCEL_WINDOW_RAPID },
  { from: 'CROUCH_B', to: ['STAND_A', 'STAND_B', 'CROUCH_A', 'CROUCH_B'], cancelType: 'rapid', requiresHit: true, stockCost: 0, timerCost: 0, windowFrames: CANCEL_WINDOW_RAPID },
];

// ===== Complete Cancel Matrix =====

export const BENIMARU_CANCEL_PATHS: CancelRoute[] = [
  ...BENIMARU_RAPID_CANCEL,
  ...BENIMARU_NORMAL_TO_SPECIAL,
  ...BENIMARU_SPECIAL_TO_DM,
  ...BENIMARU_FREE_CANCEL,
];

// ===== Cancel Validation API =====

export function findCancelRoute(source: string, target: string): CancelRoute | null {
  for (const route of BENIMARU_CANCEL_PATHS) {
    if (route.from === source && route.to.includes(target)) {
      return route;
    }
  }
  return null;
}

export function getCancelTargets(source: string): string[] {
  const targets = new Set<string>();
  for (const route of BENIMARU_CANCEL_PATHS) {
    if (route.from === source) {
      for (const t of route.to) targets.add(t);
    }
  }
  return Array.from(targets);
}

export function validateCancel(
  source: string, target: string,
  hitConfirmed: boolean, stocks: number,
  maxModeActive: boolean, maxModeTimer: number, maxModeDuration: number,
  framesSinceHit: number,
): { valid: boolean; reason?: string } {
  const route = findCancelRoute(source, target);
  if (!route) return { valid: false, reason: `No cancel route from ${source} to ${target}` };
  if (route.requiresHit && !hitConfirmed) return { valid: false, reason: `${route.cancelType} cancel requires hit` };
  if (framesSinceHit > route.windowFrames) return { valid: false, reason: `Cancel window expired` };
  if (route.stockCost > 0 && stocks < route.stockCost) return { valid: false, reason: `Not enough stocks` };
  if (route.cancelType === 'free' && !maxModeActive) return { valid: false, reason: 'Free cancel requires MAX mode' };
  if (route.timerCost > 0 && maxModeActive) {
    const drain = Math.max(1, Math.round(maxModeDuration * route.timerCost));
    if (maxModeTimer < drain) return { valid: false, reason: `Not enough MAX timer` };
  }
  return { valid: true };
}

export function getCancelRoutesByType(cancelType: CancelType): CancelRoute[] {
  return BENIMARU_CANCEL_PATHS.filter(r => r.cancelType === cancelType);
}

export function isCancelSource(attackType: string): boolean {
  return BENIMARU_CANCEL_PATHS.some(r => r.from === attackType);
}

export function getBestCancelRoute(source: string, availableStocks: number, maxModeActive: boolean): CancelRoute | null {
  const priority: CancelType[] = ['super', 'free', 'command', 'normal', 'rapid'];
  for (const type of priority) {
    const route = BENIMARU_CANCEL_PATHS.find(r =>
      r.from === source && r.cancelType === type
      && r.stockCost <= availableStocks
      && (type !== 'free' || maxModeActive)
    );
    if (route) return route;
  }
  return null;
}
