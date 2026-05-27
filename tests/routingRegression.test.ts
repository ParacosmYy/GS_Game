/**
 * Routing Regression Tests — Verifies input routing for all 3 characters
 *
 * Protects against accidental routing regressions for:
 * - Ryo: QCF+D→KOOUKEN_D, QCB+P→ZANRETSU_KEN
 * - Iori: HCF+P→KUZUKAZE, HCF+K→KOTOTSUKI/D
 * - Kyo: DP+P→ONIYAKI/C, QCF+A→ARAGAMI, QCF+C→DOKUGAMI
 */
import { describe, it, expect } from 'vitest';
import { RyoDef } from '../src/characters/ryo.js';
import { KyoDef } from '../src/characters/kyo.js';
import { IoriDef } from '../src/characters/iori.js';
import { AttackType, FighterState } from '../src/core/types.js';
import { CommandBuffer } from '../src/input/commandBuffer.js';
import type { ResolvedInput } from '../src/input/inputResolver.js';

function makeInput(overrides: Partial<ResolvedInput> = {}): ResolvedInput {
  return {
    up: false, down: false, left: false, right: false,
    forward: false, back: false,
    buttonA: false, buttonB: false, buttonC: false, buttonD: false,
    throwAttack: false, burst: false,
    buttonAPressed: false, buttonBPressed: false,
    buttonCPressed: false, buttonDPressed: false,
    throwAttackPressed: false, burstPressed: false,
    punchPressed: false, kickPressed: false,
    rollPressed: false, blowbackPressed: false,
    punchJustReleased: false, kickJustReleased: false,
    startPressed: false,
    ...overrides,
  };
}

// Helper to create a mock CommandBuffer with motion detection
function mockCmdBuf(motions: Record<string, boolean> = {}): CommandBuffer {
  const buf = new CommandBuffer();
  // Override motion detection methods via prototype
  const origHasQCF = buf.hasQCF.bind(buf);
  const origHasQCB = buf.hasQCB.bind(buf);
  const origHasHCF = buf.hasHCF?.bind(buf) ?? (() => false);
  const origCheckSpecial = buf.checkSpecial.bind(buf);

  buf.hasQCF = (tick: number) => motions.hasQCF ?? origHasQCF(tick);
  buf.hasQCB = (tick: number) => motions.hasQCB ?? origHasQCB(tick);
  buf.hasHCF = (tick: number) => motions.hasHCF ?? origHasHCF(tick);
  buf.checkSpecial = (tick: number, pressed: boolean) =>
    motions.checkSpecial ? (motions.checkSpecial as AttackType) : origCheckSpecial(tick, pressed);
  buf.checkDMMotion = () => null;
  buf.checkKickSpecial = () => null;
  return buf;
}

const TICK = 0;

// ===== RYO =====
describe('Ryo Routing', () => {
  it('QCF+D routes to KOOUKEN_D (heavy projectile)', () => {
    const input = makeInput({ kickPressed: true, buttonDPressed: true });
    const cmdBuf = mockCmdBuf({ hasQCF: true });
    const result = RyoDef.routeSpecial(input, cmdBuf, TICK);
    expect(result).toBe(AttackType.RYO_KOOUKEN_D);
  });

  it('QCF+B routes to HAOU (counter strike)', () => {
    const input = makeInput({ kickPressed: true, buttonBPressed: true });
    const cmdBuf = mockCmdBuf({ hasQCF: true });
    const result = RyoDef.routeSpecial(input, cmdBuf, TICK);
    expect(result).toBe(AttackType.RYO_HAOU);
  });

  it('QCB+P routes to ZANRETSU_KEN (rapid punch)', () => {
    const input = makeInput({ punchPressed: true });
    const cmdBuf = mockCmdBuf({ hasQCB: true });
    const result = RyoDef.routeSpecial(input, cmdBuf, TICK);
    expect(result).toBe(AttackType.RYO_ZANRETSU_KEN);
  });

  it('QCF+P routes to KOOU (A version)', () => {
    const input = makeInput({ punchPressed: true, buttonAPressed: true });
    const cmdBuf = mockCmdBuf({ checkSpecial: AttackType.SPECIAL_PROJECTILE });
    const result = RyoDef.routeSpecial(input, cmdBuf, TICK);
    expect(result).toBe(AttackType.RYO_KOOU);
  });

  it('QCF+P with C button routes to KOOU_C (strong version)', () => {
    const input = makeInput({ punchPressed: true, buttonCPressed: true });
    const cmdBuf = mockCmdBuf({ checkSpecial: AttackType.SPECIAL_PROJECTILE });
    const result = RyoDef.routeSpecial(input, cmdBuf, TICK);
    expect(result).toBe(AttackType.RYO_KOOU_C);
  });

  it('→+A always routes to TSURIZAO regardless of range', () => {
    const input = makeInput({ buttonAPressed: true, forward: true });
    const result = RyoDef.routeNormal(input, FighterState.IDLE, true);
    expect(result).toBe(AttackType.RYO_TSURIZAO);
  });

  it('↘+B routes to ORISHI (low)', () => {
    const input = makeInput({ buttonBPressed: true, forward: true, down: true });
    const result = RyoDef.routeNormal(input, FighterState.IDLE, false);
    expect(result).toBe(AttackType.RYO_ORISHI);
  });
});

// ===== KYO =====
describe('Kyo Routing', () => {
  it('DP+P A version routes to ONIYAKI', () => {
    const input = makeInput({ punchPressed: true, buttonAPressed: true });
    const cmdBuf = mockCmdBuf({ checkSpecial: AttackType.SPECIAL_UPPER });
    const result = KyoDef.routeSpecial(input, cmdBuf, TICK);
    expect(result).toBe(AttackType.KYO_ONIYAKI);
  });

  it('DP+P C version routes to ONIYAKI_C', () => {
    const input = makeInput({ punchPressed: true, buttonCPressed: true });
    const cmdBuf = mockCmdBuf({ checkSpecial: AttackType.SPECIAL_UPPER });
    const result = KyoDef.routeSpecial(input, cmdBuf, TICK);
    expect(result).toBe(AttackType.KYO_ONIYAKI_C);
  });

  it('QCF+A routes to ARAGAMI', () => {
    const input = makeInput({ buttonAPressed: true });
    const cmdBuf = mockCmdBuf({ hasQCF: true });
    const result = KyoDef.routeSpecial(input, cmdBuf, TICK);
    expect(result).toBe(AttackType.KYO_ARAGAMI);
  });

  it('QCF+C routes to DOKUGAMI', () => {
    const input = makeInput({ buttonCPressed: true });
    const cmdBuf = mockCmdBuf({ hasQCF: true });
    const result = KyoDef.routeSpecial(input, cmdBuf, TICK);
    expect(result).toBe(AttackType.KYO_DOKUGAMI);
  });
});

// ===== IORI =====
describe('Iori Routing', () => {
  it('HCF+P routes to KUZUKAZE (command grab)', () => {
    const input = makeInput({ punchPressed: true });
    const cmdBuf = mockCmdBuf({ hasHCF: true });
    const result = IoriDef.routeSpecial(input, cmdBuf, TICK);
    expect(result).toBe(AttackType.IORI_KUZUKAZE);
  });

  it('HCF+B routes to KOTOTSUKI', () => {
    const input = makeInput({ kickPressed: true, buttonBPressed: true });
    const cmdBuf = mockCmdBuf({ hasHCF: true });
    const result = IoriDef.routeSpecial(input, cmdBuf, TICK);
    expect(result).toBe(AttackType.IORI_KOTOTSUKI);
  });

  it('HCF+D routes to KOTOTSUKI_D', () => {
    const input = makeInput({ kickPressed: true, buttonDPressed: true });
    const cmdBuf = mockCmdBuf({ hasHCF: true });
    const result = IoriDef.routeSpecial(input, cmdBuf, TICK);
    expect(result).toBe(AttackType.IORI_KOTOTSUKI_D);
  });

  it('QCB+P A version routes to AOIHANA', () => {
    const input = makeInput({ punchPressed: true, buttonAPressed: true });
    const cmdBuf = mockCmdBuf({ hasQCB: true });
    const result = IoriDef.routeSpecial(input, cmdBuf, TICK);
    expect(result).toBe(AttackType.IORI_AOIHANA);
  });

  it('QCB+P C version routes to AOIHANA_C', () => {
    const input = makeInput({ punchPressed: true, buttonCPressed: true });
    const cmdBuf = mockCmdBuf({ hasQCB: true });
    const result = IoriDef.routeSpecial(input, cmdBuf, TICK);
    expect(result).toBe(AttackType.IORI_AOIHANA_C);
  });

  it('DP+P routes to ONIYAKI (A/C)', () => {
    const input = makeInput({ punchPressed: true, buttonAPressed: true });
    const cmdBuf = mockCmdBuf({ checkSpecial: AttackType.SPECIAL_UPPER });
    const result = IoriDef.routeSpecial(input, cmdBuf, TICK);
    expect(result).toBe(AttackType.IORI_ONIYAKI);
  });

  it('KUZUKAZE is marked as command throw', () => {
    expect(IoriDef.isCommandThrow?.(AttackType.IORI_KUZUKAZE)).toBe(true);
  });
});
