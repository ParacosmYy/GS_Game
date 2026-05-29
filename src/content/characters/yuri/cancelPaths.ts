/**
 * Yuri Content Package — Cancel Paths
 *
 * Cancel route matrix: normal → special → DM → Free Cancel.
 */

import {
  CANCEL_WINDOW_NORMAL,
  CANCEL_WINDOW_RAPID,
  CANCEL_WINDOW_SUPER,
  CANCEL_WINDOW_FREE,
  SUPER_CANCEL_STOCK_COST,
  FREE_CANCEL_TIMER_COST,
} from '../../../core/constants.js';

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

const YURI_NORMALS = ['STAND_A', 'STAND_B', 'STAND_C', 'STAND_D', 'CLOSE_A', 'CLOSE_B', 'CLOSE_C', 'CLOSE_D', 'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D'];
const YURI_COMMAND_NORMALS = ['YURI_UPPER_BLOCK', 'YURI_LOWER_BLOCK'];
const YURI_SPECIALS = ['YURI_KO_OU_KEN', 'YURI_HAOH_SHO_KO_KEN', 'YURI_CHOU_UPPER', 'YURI_HYAKU_RETSU_BINTA', 'YURI_HIEN_HOU_OU_KYAKU', 'YURI_HISHOU_KUURETSU_ZAN', 'YURI_RAI_KEN'];
const YURI_DMS = ['DM_YURI_HAOH_SHO_KO_KEN', 'DM_YURI_HIEN_HOU_OU_KYAKU'];
const YURI_SDMS = ['SDM_YURI_HAOH_SHO_KO_KEN', 'SDM_YURI_HIEN_HOU_OU_KYAKU', 'HSDM_YURI_HISHOU_KUURETSU_ZAN'];

// Rapid cancel: command normals → specials
const RAPID_CANCEL: CancelRoute[] = YURI_COMMAND_NORMALS.map(from => ({
  from, to: [...YURI_SPECIALS], cancelType: 'rapid' as const, requiresHit: true, stockCost: 0, timerCost: 0, windowFrames: CANCEL_WINDOW_RAPID,
}));

// Normal → Special
const NORMAL_TO_SPECIAL: CancelRoute[] = YURI_NORMALS.map(from => ({
  from, to: [...YURI_SPECIALS], cancelType: 'normal' as const, requiresHit: false, stockCost: 0, timerCost: 0, windowFrames: CANCEL_WINDOW_NORMAL,
}));

// Special → DM (Super Cancel)
const SPECIAL_TO_DM: CancelRoute[] = YURI_SPECIALS.map(from => ({
  from, to: [...YURI_DMS, ...YURI_SDMS], cancelType: 'super' as const, requiresHit: true, stockCost: SUPER_CANCEL_STOCK_COST, timerCost: 0, windowFrames: CANCEL_WINDOW_SUPER,
}));

// Free Cancel (MAX mode: special → special)
const FREE_CANCEL: CancelRoute[] = YURI_SPECIALS.map(from => ({
  from, to: YURI_SPECIALS.filter(t => t !== from), cancelType: 'free' as const, requiresHit: true, stockCost: 0, timerCost: FREE_CANCEL_TIMER_COST, windowFrames: CANCEL_WINDOW_FREE,
}));

export const YURI_CANCEL_PATHS: CancelRoute[] = [
  ...RAPID_CANCEL,
  ...NORMAL_TO_SPECIAL,
  ...SPECIAL_TO_DM,
  ...FREE_CANCEL,
];

export function findCancelRoute(from: string, to: string): CancelRoute | undefined {
  return YURI_CANCEL_PATHS.find(r => r.from === from && r.to.includes(to));
}

export function getCancelTargets(from: string): CancelRoute[] {
  return YURI_CANCEL_PATHS.filter(r => r.from === from);
}

export function validateCancel(from: string, to: string, options: { hitConfirmed?: boolean; hasStock?: boolean; maxMode?: boolean; timerPercent?: number }): { valid: boolean; reason?: string } {
  const route = findCancelRoute(from, to);
  if (!route) return { valid: false, reason: 'No cancel route' };
  if (route.requiresHit && !options.hitConfirmed) return { valid: false, reason: 'Requires hit confirmation' };
  if (route.stockCost > 0 && !options.hasStock) return { valid: false, reason: `Requires ${route.stockCost} stock` };
  if (route.cancelType === 'free' && !options.maxMode) return { valid: false, reason: 'Requires MAX mode' };
  if (route.timerCost > 0 && (options.timerPercent ?? 0) < route.timerCost / 100) return { valid: false, reason: 'Insufficient MAX timer' };
  return { valid: true };
}

export function getCancelRoutesByType(type: CancelType): CancelRoute[] {
  return YURI_CANCEL_PATHS.filter(r => r.cancelType === type);
}

export function isCancelSource(attackKey: string): boolean {
  return YURI_CANCEL_PATHS.some(r => r.from === attackKey);
}

export function getBestCancelRoute(from: string, to: string): CancelRoute | undefined {
  const routes = YURI_CANCEL_PATHS.filter(r => r.from === from && r.to.includes(to));
  const priority: CancelType[] = ['free', 'super', 'normal', 'rapid', 'command'];
  for (const t of priority) {
    const found = routes.find(r => r.cancelType === t);
    if (found) return found;
  }
  return routes[0];
}
