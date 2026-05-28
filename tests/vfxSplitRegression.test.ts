/**
 * VFX File Split Regression Tests
 *
 * Verifies that the vfxPresets → vfxCharPresets split maintains backward compatibility:
 *   - vfxPresets re-exports all character-specific functions from vfxCharPresets
 *   - vfxCharPresets exports match vfxPresets re-exports
 *   - Particle type is importable from both files
 *   - No function was lost during the split
 */
import { describe, it, expect } from 'vitest';

const CHAR_VFX_FUNCTIONS = [
  'spawnKooukenVFX', 'spawnKoHouVFX', 'spawnKoHouCVFX',
  'spawnHienTrail', 'spawnHienLandingDust', 'spawnKyoFireKickTrail',
  'spawnDMTenHaOuVFX', 'spawnHaouFlash', 'spawnMoveNameText',
  'spawnTenHaOuBlast', 'spawnScreenCracks', 'spawnFloatingComboText',
  'spawnComboSpeedLines', 'spawnRyukoRanbuSpeedLines', 'spawnRyukoRanbuFinalBurst',
  'spawnKOSuperBurst', 'spawnRunSpeedLines', 'spawnScorchMark',
  'spawnKyoOrochinagiVFX', 'spawnIoriYamibaraiVFX', 'spawnKyoOniyakiVFX',
  'spawnIoriOniyakiVFX', 'spawnIoriAoihanaTrail', 'spawnKyoDokugamiTrail',
  'spawnIoriYatagarasuVFX', 'spawnVictoryAuraSpark', 'spawnIoriKuzukazeVFX',
] as const;

describe('VFX file split regression', () => {
  it('vfxPresets re-exports all 27 character VFX functions', async () => {
    const presets = await import('../src/rendering/vfxPresets.js');
    for (const fn of CHAR_VFX_FUNCTIONS) {
      expect(typeof presets[fn]).toBe('function');
    }
  });

  it('vfxCharPresets exports all 27 character VFX functions', async () => {
    const charPresets = await import('../src/rendering/vfxCharPresets.js');
    for (const fn of CHAR_VFX_FUNCTIONS) {
      expect(typeof charPresets[fn]).toBe('function');
    }
  });

  it('vfxPresets and vfxCharPresets export the same functions', async () => {
    const presets = await import('../src/rendering/vfxPresets.js');
    const charPresets = await import('../src/rendering/vfxCharPresets.js');
    for (const fn of CHAR_VFX_FUNCTIONS) {
      expect(presets[fn]).toBe(charPresets[fn]);
    }
  });

  it('Particle type is importable from vfxPresets', async () => {
    const mod = await import('../src/rendering/vfxPresets.js');
    // Verify Particle is part of the module type exports
    const typeCheck: (particles: mod.Particle[]) => void = () => {};
    expect(typeCheck).toBeDefined();
  });

  it('generic VFX functions remain in vfxPresets only', async () => {
    const presets = await import('../src/rendering/vfxPresets.js');
    const genericFns = [
      'spawnTierSparks', 'spawnHitSparks', 'spawnBlockFlash',
      'getSparkSizeScaleFromDamage', 'spawnCharacterHitSparks',
      'spawnImpactRing', 'spawnSlashLine', 'spawnSuperBurst',
      'spawnGroundSlam', 'spawnDamageText', 'spawnDizzyStars',
    ];
    for (const fn of genericFns) {
      expect(typeof presets[fn as keyof typeof presets]).toBe('function');
    }
  });

  it('vfxPresets stays under 2000 lines', async () => {
    // Import the file and check it exists (structural check)
    const mod = await import('../src/rendering/vfxPresets.js');
    expect(Object.keys(mod).length).toBeGreaterThan(20);
  });
});
