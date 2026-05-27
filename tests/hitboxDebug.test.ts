/**
 * Hitbox debug overlay tests — verify visualization module works with Fighter/Projectile
 */
import { describe, it, expect } from 'vitest';
import { Fighter } from '../src/entities/fighter.js';
import { ROSTER } from '../src/characters/index.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../src/core/constants.js';

// Minimal mock canvas for testing
function createMockCanvas(): { ctx: CanvasRenderingContext2D; calls: string[] } {
  const calls: string[] = [];
  const handler = {
    get(target: Record<string, unknown>, prop: string) {
      if (prop === 'save' || prop === 'restore' || prop === 'beginPath' || prop === 'closePath' || prop === 'fill' || prop === 'stroke') {
        return () => { calls.push(prop); };
      }
      if (prop === 'fillRect' || prop === 'strokeRect') {
        return (...args: number[]) => { calls.push(`${prop}(${args.join(',')})`); };
      }
      if (prop === 'fillText') {
        return (text: string, ...args: number[]) => { calls.push(`fillText(${text})`); };
      }
      if (prop === 'arc') {
        return (...args: number[]) => { calls.push(`arc`); };
      }
      if (typeof prop === 'string' && !prop.startsWith('_')) {
        return target[prop] ?? '';
      }
      return undefined;
    },
    set(target: Record<string, unknown>, prop: string, value: unknown) {
      target[prop] = value;
      return true;
    },
  };
  const ctx = new Proxy({} as Record<string, unknown>, handler) as unknown as CanvasRenderingContext2D;
  return { ctx, calls };
}

describe('Hitbox Debug Visualization', () => {
  it('Fighter provides hurtbox, hitbox, pushbox data', () => {
    const f = new Fighter(400, '#ff6600', 1);
    const char = ROSTER[0]; // Kyo
    f.charId = char.id;
    f.color = char.color;
    f.setStats(char.stats);

    // Hurtbox should always exist
    const hurt = f.getHurtbox();
    expect(hurt).toBeDefined();
    expect(hurt.width).toBeGreaterThan(0);
    expect(hurt.height).toBeGreaterThan(0);

    // Pushbox should always exist
    const push = f.getPushbox();
    expect(push).toBeDefined();
    expect(push.width).toBeGreaterThan(0);
    expect(push.height).toBeGreaterThan(0);
  });

  it('Fighter hitboxes only exist during active attack phase', () => {
    const f = new Fighter(400, '#ff6600', 1);
    // No attack → no hitboxes
    expect(f.getActiveHitboxes()).toHaveLength(0);
  });

  it('getEffectiveHurtbox returns body or null if invincible', () => {
    const f = new Fighter(400, '#ff6600', 1);
    const hurt = f.getEffectiveHurtbox();
    // Default state should have a hurtbox
    expect(hurt).not.toBeNull();
  });

  it('getThrowbox returns null when not attacking', () => {
    const f = new Fighter(400, '#ff6600', 1);
    expect(f.getThrowbox()).toBeNull();
  });

  it('drawHitboxOverlay module exports correctly', async () => {
    const mod = await import('../src/rendering/hitboxDebug.js');
    expect(mod.drawHitboxOverlay).toBeDefined();
    expect(typeof mod.drawHitboxOverlay).toBe('function');
  });

  it('overlay does not crash with mock canvas', async () => {
    const { drawHitboxOverlay } = await import('../src/rendering/hitboxDebug.js');
    const { ctx } = createMockCanvas();

    const f1 = new Fighter(300, '#ff6600', 1);
    const f2 = new Fighter(500, '#4488ff', -1);

    // Should not throw
    expect(() => {
      drawHitboxOverlay(ctx, [f1, f2], [], { x: 0, worldToScreen: (x: number) => x } as any);
    }).not.toThrow();
  });
});
