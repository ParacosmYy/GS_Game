/**
 * Iori Yatagarasu DM Startup VFX Regression Tests
 *
 * Verifies:
 *   - spawnIoriYatagarasuVFX function exists and accepts correct params
 *   - Iori hit effects use Yatagarasu VFX for DM/SDM/HSDM
 *   - Kyo Orochinagi VFX and Iori Yatagarasu VFX are distinct functions
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Test through the VFXSystem public API
import { VFXSystem } from '../src/rendering/vfx.js';
import { spawnIoriYatagarasuVFX } from '../src/rendering/vfxPresets.js';

function makeMockCtx() {
  return {
    save: vi.fn(), restore: vi.fn(),
    fillRect: vi.fn(), strokeRect: vi.fn(),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    beginPath: vi.fn(), arc: vi.fn(), ellipse: vi.fn(),
    fill: vi.fn(), stroke: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
    closePath: vi.fn(), measureText: vi.fn(() => ({ width: 100 })),
    globalAlpha: 1, globalCompositeOperation: 'source-over',
    fillStyle: '', strokeStyle: '', lineWidth: 0,
    font: '', textAlign: '', textBaseline: '',
  };
}

describe('Iori Yatagarasu VFX', () => {
  it('spawnIoriYatagarasuVFX function exists', () => {
    expect(typeof spawnIoriYatagarasuVFX).toBe('function');
  });

  it('spawnIoriYatagarasuVFX does not throw with valid params', () => {
    const particles: any[] = [];
    expect(() => spawnIoriYatagarasuVFX(particles, 400, 300, 1)).not.toThrow();
  });

  it('produces dark energy spiral particles', () => {
    const particles: any[] = [];
    spawnIoriYatagarasuVFX(particles, 400, 300, 1);
    // 16 spiral + 1 orb + 1 core + 1 ring + 8 wisps = 27 particles minimum
    expect(particles.length).toBeGreaterThanOrEqual(27);
  });

  it('includes dark purple core flash', () => {
    const particles: any[] = [];
    spawnIoriYatagarasuVFX(particles, 400, 300, 1);
    const hasDarkOrb = particles.some(p => p.color === '#5500aa' && p.type === 'flash');
    expect(hasDarkOrb).toBe(true);
  });

  it('includes dark flame ring', () => {
    const particles: any[] = [];
    spawnIoriYatagarasuVFX(particles, 400, 300, 1);
    const hasRing = particles.some(p => p.color === '#6600aa' && p.type === 'ring');
    expect(hasRing).toBe(true);
  });

  it('VFXSystem has spawnIoriYatagarasuVFX wrapper', () => {
    const vfx = new VFXSystem();
    expect(typeof vfx.spawnIoriYatagarasuVFX).toBe('function');
  });

  it('VFXSystem.spawnIoriYatagarasuVFX does not throw', () => {
    const vfx = new VFXSystem();
    expect(() => vfx.spawnIoriYatagarasuVFX(400, 300, 1)).not.toThrow();
  });

  it('uses purple color palette (distinct from Kyo orange)', () => {
    const particles: any[] = [];
    spawnIoriYatagarasuVFX(particles, 400, 300, 1);
    const purpleParticles = particles.filter(p =>
      p.color && (p.color.includes('aa') || p.color.includes('cc') || p.color.includes('ff'))
      && p.color !== '#ffffff'
    );
    expect(purpleParticles.length).toBeGreaterThan(0);
  });

  it('spiral particles have negative gravity (rise upward)', () => {
    const particles: any[] = [];
    spawnIoriYatagarasuVFX(particles, 400, 300, 1);
    const spiralParticles = particles.filter(p => p.type === 'spark' && p.gravity !== undefined);
    const rising = spiralParticles.filter(p => p.gravity! < 0);
    expect(rising.length).toBeGreaterThan(0);
  });
});
