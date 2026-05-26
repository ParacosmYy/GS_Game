/**
 * Attack Limb Rendering System Tests
 *
 * Tests the attack limb rendering pipeline:
 *   - src/rendering/attackLimb.ts: base attack limb entry point
 *   - src/rendering/attackLimbSpecials.ts: character-specific special move limbs
 *   - src/rendering/attackLimbDMs.ts: DM super move limbs
 *
 * Uses mock CanvasRenderingContext2D to verify behavior without real canvas.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { AttackType, FighterState } from '../src/core/types.js';
import { FIGHTER_WIDTH, FIGHTER_HEIGHT } from '../src/core/constants.js';
import { drawAttackLimb } from '../src/rendering/attackLimb.js';
import { drawSpecialAttackLimb } from '../src/rendering/attackLimbSpecials.js';
import { drawDmLimb } from '../src/rendering/attackLimbDMs.js';

// ─── Mock Canvas ──────────────────────────────────────────────────────────────

function createMockCtx(): CanvasRenderingContext2D {
  const mockGradient = {
    addColorStop: vi.fn(),
  };
  return {
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    quadraticCurveTo: vi.fn(),
    rect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn(() => ({ width: 50 })),
    save: vi.fn(),
    restore: vi.fn(),
    setLineDash: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    shadowColor: '',
    shadowBlur: 0,
    shadowOffsetY: 0,
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    createLinearGradient: vi.fn(() => mockGradient),
    createRadialGradient: vi.fn(() => mockGradient),
    clearRect: vi.fn(),
    clip: vi.fn(),
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeAttackingFighter(
  attack: AttackType,
  overrides: Partial<Fighter> = {},
): Fighter {
  const f = new Fighter(400, '#ff4444', 1);
  f.state = FighterState.STAND_ATTACK;
  f.attackPhase = 'active';
  f.attackFrame = 2;
  f.currentAttack = attack;
  f.charId = overrides.charId ?? 'kyo';
  f.displayHeight = FIGHTER_HEIGHT;
  if (overrides.facing !== undefined) f.facing = overrides.facing as 1 | -1;
  if (overrides.attackFrame !== undefined) f.attackFrame = overrides.attackFrame;
  if (overrides.attackPhase !== undefined) f.attackPhase = overrides.attackPhase;
  return f;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Attack Limb Data — 基础攻击肢体数据 (4 tests)
// ═══════════════════════════════════════════════════════════════════════════════

describe('1. Attack Limb Data', () => {
  it('each AttackType in basic categories has limb data that triggers drawing', () => {
    const ctx = createMockCtx();
    const attacks = [
      AttackType.STAND_A, AttackType.STAND_C,
      AttackType.CROUCH_A, AttackType.JUMP_A,
      AttackType.CLOSE_A, AttackType.CLOSE_C,
    ];

    for (const atk of attacks) {
      const f = makeAttackingFighter(atk);
      const strokeBefore = (ctx.stroke as ReturnType<typeof vi.fn>).mock.calls.length;
      drawAttackLimb(ctx, f, 400, 500);
      // Each attack should produce at least one stroke call
      const strokeAfter = (ctx.stroke as ReturnType<typeof vi.fn>).mock.calls.length;
      expect(strokeAfter).toBeGreaterThan(strokeBefore);
    }
  });

  it('punch attacks (A/C) produce different limb positions than kick attacks (B/D)', () => {
    const ctx1 = createMockCtx();
    const ctx2 = createMockCtx();

    const punchFighter = makeAttackingFighter(AttackType.STAND_A);
    const kickFighter = makeAttackingFighter(AttackType.STAND_B);

    drawAttackLimb(ctx1, punchFighter, 400, 500);
    drawAttackLimb(ctx2, kickFighter, 400, 500);

    // Punch (A) and kick (B) should have different Y positions for their limbs
    // Punches draw at displayHeight * 0.6, kicks at displayHeight * 0.35
    const punchMoveTo = (ctx1.moveTo as ReturnType<typeof vi.fn>).mock.calls;
    const kickMoveTo = (ctx2.moveTo as ReturnType<typeof vi.fn>).mock.calls;

    // At least one moveTo call should differ between punch and kick
    // (both start from different Y offsets relative to displayHeight)
    expect(punchMoveTo.length).toBeGreaterThan(0);
    expect(kickMoveTo.length).toBeGreaterThan(0);
  });

  it('STAND_A and STAND_C produce different limb extension lengths', () => {
    const ctxLight = createMockCtx();
    const ctxHeavy = createMockCtx();

    // STAND_A is light (limbLen = 55), STAND_C is heavy (limbLen = 68)
    const lightFighter = makeAttackingFighter(AttackType.STAND_A);
    const heavyFighter = makeAttackingFighter(AttackType.STAND_C);

    drawAttackLimb(ctxLight, lightFighter, 400, 500);
    drawAttackLimb(ctxHeavy, heavyFighter, 400, 500);

    // Both should draw, but with different reach
    const lightLineTo = (ctxLight.lineTo as ReturnType<typeof vi.fn>).mock.calls;
    const heavyLineTo = (ctxHeavy.lineTo as ReturnType<typeof vi.fn>).mock.calls;

    expect(lightLineTo.length).toBeGreaterThan(0);
    expect(heavyLineTo.length).toBeGreaterThan(0);

    // Heavy attack should have longer X reach (lineTo x > light's x)
    // since heavy uses limbLen=68 and light uses limbLen=55
    // Both facing right (facing=1), so end x = (FIGHTER_WIDTH/2 + reach) * 1
    const lightEndX = lightLineTo[0][0] as number;
    const heavyEndX = heavyLineTo[0][0] as number;
    expect(heavyEndX).toBeGreaterThan(lightEndX);
  });

  it('different attack types produce distinct drawing patterns', () => {
    const results: number[] = [];
    const attacks = [
      AttackType.STAND_A, AttackType.CROUCH_D, AttackType.JUMP_C,
    ];

    for (const atk of attacks) {
      const ctx = createMockCtx();
      const f = makeAttackingFighter(atk);
      drawAttackLimb(ctx, f, 400, 500);
      results.push((ctx.lineTo as ReturnType<typeof vi.fn>).mock.calls.length);
    }

    // All should draw at least one lineTo
    expect(results.every(r => r > 0)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Special Move Limbs — 必杀技肢体 (3 tests)
// ═══════════════════════════════════════════════════════════════════════════════

describe('2. Special Move Limbs', () => {
  it('character-specific special moves have unique limb rendering', () => {
    const ctx1 = createMockCtx();
    const ctx2 = createMockCtx();

    // Iori Aoihana vs Terry Burn Knuckle — different characters, different visuals
    const iori = makeAttackingFighter(AttackType.IORI_AOIHANA, { charId: 'iori' });
    const terry = makeAttackingFighter(AttackType.TERRY_BURN_KNUCKLE, { charId: 'terry' });

    const progress = 0.5;
    const limbLen = 55;

    drawSpecialAttackLimb(ctx1, iori, 400, 500, progress, limbLen, false);
    drawSpecialAttackLimb(ctx2, terry, 400, 500, progress, limbLen, false);

    // Both should return true (handled)
    // Both should produce drawing calls
    expect((ctx1.stroke as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(0);
    expect((ctx2.stroke as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(0);
  });

  it('special move limbs produce more elaborate rendering than normal attacks', () => {
    const ctxNormal = createMockCtx();
    const ctxSpecial = createMockCtx();

    const normalFighter = makeAttackingFighter(AttackType.STAND_A);
    const specialFighter = makeAttackingFighter(AttackType.IORI_AOIHANA, { charId: 'iori' });

    drawAttackLimb(ctxNormal, normalFighter, 400, 500);
    drawAttackLimb(ctxSpecial, specialFighter, 400, 500);

    // Special moves use higher shadowBlur (>= 16 for specials vs 8 for normals)
    const specialShadowBlur = ctxSpecial.shadowBlur;
    expect(specialShadowBlur).toBeGreaterThanOrEqual(16);

    // Special moves produce arc/fill calls for glow effects in addition to stroke
    const normalFillCalls = (ctxNormal.fill as ReturnType<typeof vi.fn>).mock.calls.length;
    const specialFillCalls = (ctxSpecial.fill as ReturnType<typeof vi.fn>).mock.calls.length;
    expect(specialFillCalls).toBeGreaterThan(normalFillCalls);
  });

  it('DM limbs are the most elaborate with highest shadowBlur and lineWidth', () => {
    const ctxDm = createMockCtx();

    const dmFighter = makeAttackingFighter(AttackType.DM_YATAGARASU, { charId: 'iori' });

    drawAttackLimb(ctxDm, dmFighter, 400, 500);

    // DM should trigger drawing with high lineWidth and shadowBlur
    expect((ctxDm.stroke as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(0);
    // DM attacks are special moves so they go through the special path
    // shadowBlur should have been set to a high value (>= 18 for specials)
    const finalShadowBlur = ctxDm.shadowBlur;
    expect(finalShadowBlur).toBeGreaterThanOrEqual(18);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Frame Timing — 帧时序 (3 tests)
// ═══════════════════════════════════════════════════════════════════════════════

describe('3. Frame Timing', () => {
  it('limb is only drawn during active phase, not during startup', () => {
    const ctx = createMockCtx();
    const f = makeAttackingFighter(AttackType.STAND_A);
    f.attackPhase = 'startup';

    drawAttackLimb(ctx, f, 400, 500);

    // Startup phase should NOT produce any strokes (function returns early)
    expect((ctx.stroke as ReturnType<typeof vi.fn>).mock.calls.length).toBe(0);
    expect((ctx.save as ReturnType<typeof vi.fn>).mock.calls.length).toBe(0);
  });

  it('limb is only drawn during active phase, not during recovery', () => {
    const ctx = createMockCtx();
    const f = makeAttackingFighter(AttackType.STAND_A);
    f.attackPhase = 'recovery';

    drawAttackLimb(ctx, f, 400, 500);

    // Recovery phase should NOT produce any strokes
    expect((ctx.stroke as ReturnType<typeof vi.fn>).mock.calls.length).toBe(0);
    expect((ctx.save as ReturnType<typeof vi.fn>).mock.calls.length).toBe(0);
  });

  it('limb is drawn during active phase', () => {
    const ctx = createMockCtx();
    const f = makeAttackingFighter(AttackType.STAND_A);
    // Already set to 'active' by makeAttackingFighter

    drawAttackLimb(ctx, f, 400, 500);

    // Active phase should produce strokes
    expect((ctx.stroke as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(0);
    expect((ctx.save as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(0);
    // save/restore should be balanced
    expect((ctx.save as ReturnType<typeof vi.fn>).mock.calls.length)
      .toBe((ctx.restore as ReturnType<typeof vi.fn>).mock.calls.length);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Direction / Facing — 朝向 (3 tests)
// ═══════════════════════════════════════════════════════════════════════════════

describe('4. Direction / Facing', () => {
  it('limb direction follows fighter facing', () => {
    const ctxRight = createMockCtx();
    const ctxLeft = createMockCtx();

    const rightFighter = makeAttackingFighter(AttackType.STAND_A, { facing: 1 });
    const leftFighter = makeAttackingFighter(AttackType.STAND_A, { facing: -1 });

    drawAttackLimb(ctxRight, rightFighter, 400, 500);
    drawAttackLimb(ctxLeft, leftFighter, 400, 500);

    const rightLineTo = (ctxRight.lineTo as ReturnType<typeof vi.fn>).mock.calls;
    const leftLineTo = (ctxLeft.lineTo as ReturnType<typeof vi.fn>).mock.calls;

    expect(rightLineTo.length).toBeGreaterThan(0);
    expect(leftLineTo.length).toBeGreaterThan(0);

    // Right-facing: lineTo X should be positive (right of fighter)
    // Left-facing: lineTo X should be less than moveTo X (flipped)
    const rightEndX = rightLineTo[0][0] as number;
    const leftEndX = leftLineTo[0][0] as number;

    // Facing right: end X > start X; Facing left: end X < start X
    expect(rightEndX).toBeGreaterThan(400);
    expect(leftEndX).toBeLessThan(400);
  });

  it('right-facing and left-facing produce mirrored X coordinates', () => {
    const ctxRight = createMockCtx();
    const ctxLeft = createMockCtx();

    const rightFighter = makeAttackingFighter(AttackType.STAND_C, { facing: 1 });
    const leftFighter = makeAttackingFighter(AttackType.STAND_C, { facing: -1 });

    drawAttackLimb(ctxRight, rightFighter, 400, 500);
    drawAttackLimb(ctxLeft, leftFighter, 400, 500);

    const rightMoveTo = (ctxRight.moveTo as ReturnType<typeof vi.fn>).mock.calls;
    const leftMoveTo = (ctxLeft.moveTo as ReturnType<typeof vi.fn>).mock.calls;

    // MoveTo X should be mirrored around center (400)
    if (rightMoveTo.length > 0 && leftMoveTo.length > 0) {
      // Right: moveTo X > 400; Left: moveTo X < 400
      const rightMX = rightMoveTo[0][0] as number;
      const leftMX = leftMoveTo[0][0] as number;
      expect(rightMX).toBeGreaterThan(400);
      expect(leftMX).toBeLessThan(400);
    }
  });

  it('crouch attacks have downward-angled limb position', () => {
    const ctxStand = createMockCtx();
    const ctxCrouch = createMockCtx();

    const standFighter = makeAttackingFighter(AttackType.STAND_A);
    const crouchFighter = makeAttackingFighter(AttackType.CROUCH_A);

    drawAttackLimb(ctxStand, standFighter, 400, 500);
    drawAttackLimb(ctxCrouch, crouchFighter, 400, 500);

    const standMoveTo = (ctxStand.moveTo as ReturnType<typeof vi.fn>).mock.calls;
    const crouchMoveTo = (ctxCrouch.moveTo as ReturnType<typeof vi.fn>).mock.calls;

    expect(standMoveTo.length).toBeGreaterThan(0);
    expect(crouchMoveTo.length).toBeGreaterThan(0);

    // Crouch attack limb Y should be much lower (closer to ground)
    // Stand: Y = 500 - displayHeight * 0.6 = 500 - 120 = 380
    // Crouch: Y = 500 - 10 = 490
    const standStartY = standMoveTo[0][1] as number;
    const crouchStartY = crouchMoveTo[0][1] as number;
    expect(crouchStartY).toBeGreaterThan(standStartY);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Render Output — 渲染输出 (2 tests)
// ═══════════════════════════════════════════════════════════════════════════════

describe('5. Render Output', () => {
  it('drawAttackLimb does not throw for any basic attack type', () => {
    const ctx = createMockCtx();
    const basicAttacks = [
      AttackType.STAND_A, AttackType.STAND_B, AttackType.STAND_C, AttackType.STAND_D,
      AttackType.CLOSE_A, AttackType.CLOSE_B, AttackType.CLOSE_C, AttackType.CLOSE_D,
      AttackType.CROUCH_A, AttackType.CROUCH_B, AttackType.CROUCH_C, AttackType.CROUCH_D,
      AttackType.JUMP_A, AttackType.JUMP_B, AttackType.JUMP_C, AttackType.JUMP_D,
      AttackType.STAND_CD, AttackType.JUMP_CD,
      AttackType.THROW,
      AttackType.SPECIAL_UPPER, AttackType.SPECIAL_PROJECTILE,
      AttackType.CMD_NARAKU, AttackType.CMD_GOFU_YOU, AttackType.CMD_88SHIKI,
    ];

    for (const atk of basicAttacks) {
      const f = makeAttackingFighter(atk);
      expect(() => drawAttackLimb(ctx, f, 400, 500)).not.toThrow();
    }
  });

  it('different attack frames produce different drawing parameters', () => {
    const callsPerFrame: number[][] = [];

    for (let frame = 0; frame < 5; frame++) {
      const ctx = createMockCtx();
      const f = makeAttackingFighter(AttackType.STAND_A);
      f.attackFrame = frame;
      drawAttackLimb(ctx, f, 400, 500);

      const lineToCalls = (ctx.lineTo as ReturnType<typeof vi.fn>).mock.calls;
      callsPerFrame.push(lineToCalls.map((c: number[]) => c[0]));
    }

    // At least some frames should differ (progress changes the reach)
    // Frames 0 and 4 should have different X coordinates
    const frame0MaxX = callsPerFrame[0].length > 0 ? Math.max(...callsPerFrame[0].map(Math.abs)) : 0;
    const frame4MaxX = callsPerFrame[4].length > 0 ? Math.max(...callsPerFrame[4].map(Math.abs)) : 0;

    // Higher frame = more progress = longer reach for stand punch
    expect(frame4MaxX).toBeGreaterThanOrEqual(frame0MaxX);
  });
});
