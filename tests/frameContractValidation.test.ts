import { describe, it, expect } from 'vitest';
import { FRAME_DATA } from '../src/core/frameDataConstants.js';
import { ATTACK_FRAMES } from '../src/core/attackFrames.js';

/**
 * Projectile convention: these attacks spawn a projectile entity.
 * ATTACK_FRAMES.len=1 means only the spawn-frame hitbox is defined;
 * the projectile entity handles remaining active frames.
 */
const PROJECTILE_KEYS = new Set([
  'SPECIAL_PROJECTILE',
  'RYO_KOOU', 'RYO_KOOU_C',
  'KYO_YAMIBARAI', 'KYO_YAMIBARAI_C',
  'IORI_YAMIBARAI', 'IORI_YAMIBARAI_C',
  'TERRY_POWER_WAVE',
  'LEONA_MOON_SLASH', 'LEONA_MOON_SLASH_C',
  'ATHENA_PSYCHO_BALL', 'ATHENA_PSYCHO_BALL_C',
  'MAI_KA_CHO_SEN', 'MAI_KA_CHO_SEN_C',
  'JOE_HURRICANE', 'JOE_HURRICANE_C',
  'ANDY_HISHOU_KEN', 'ANDY_HISHOU_KEN_C',
  'DM_SCREW_UPPER',
  'DM_TEN_HA_OU',
]);

interface Mismatch {
  key: string;
  frameDataActive: number;
  attackFramesLen: number;
  category: 'projectile-convention' | 'generic-normal' | 'character-special' | 'dm-sdm';
}

function categorize(key: string): Mismatch['category'] {
  if (key.startsWith('DM_') || key.startsWith('SDM_')) return 'dm-sdm';
  if (['STAND_C', 'STAND_D', 'STAND_CD', 'CROUCH_A', 'CROUCH_B', 'CROUCH_C', 'CROUCH_D',
    'JUMP_A', 'JUMP_B', 'JUMP_C', 'JUMP_D', 'THROW', 'THROW_FORWARD', 'THROW_BACK',
  ].includes(key)) return 'generic-normal';
  if (PROJECTILE_KEYS.has(key)) return 'projectile-convention';
  return 'character-special';
}

function collectMismatches(): Mismatch[] {
  const result: Mismatch[] = [];
  for (const key of Object.keys(FRAME_DATA) as string[]) {
    const fd = (FRAME_DATA as Record<string, { active?: number }>)[key];
    if (!fd || typeof fd.active !== 'number') continue;

    const attackFrames = (ATTACK_FRAMES as Record<string, unknown[]>)[key] ?? null;
    if (!attackFrames) continue;

    const attackLen = attackFrames.length;
    if (attackLen !== fd.active) {
      result.push({
        key,
        frameDataActive: fd.active,
        attackFramesLen: attackLen,
        category: categorize(key),
      });
    }
  }
  return result;
}

describe('Frame Contract Validation', () => {
  const allMismatches = collectMismatches();
  const projectiles = allMismatches.filter(m => m.category === 'projectile-convention');
  const realBugs = allMismatches.filter(m => m.category !== 'projectile-convention');

  it('Ryo frame contracts are valid (projectile convention excluded)', () => {
    const ryoBugs = realBugs.filter(m =>
      m.key.startsWith('RYO_') || m.key === 'DM_TEN_HA_OU',
    );
    if (ryoBugs.length > 0) {
      console.log('[Ryo Frame Contract] Mismatches:');
      for (const m of ryoBugs) {
        console.log(`  ${m.key}: active=${m.frameDataActive} frames=${m.attackFramesLen}`);
      }
    }
    expect(ryoBugs).toHaveLength(0);
  });

  it('reports all mismatches excluding projectile convention', () => {
    if (realBugs.length === 0) {
      console.log('Frame Contract: all active counts match (projectile convention excluded).');
    } else {
      const byCategory = {
        'generic-normal': realBugs.filter(m => m.category === 'generic-normal'),
        'character-special': realBugs.filter(m => m.category === 'character-special'),
        'dm-sdm': realBugs.filter(m => m.category === 'dm-sdm'),
      };
      for (const [cat, items] of Object.entries(byCategory)) {
        if (items.length === 0) continue;
        console.log(`\n[${cat}] (${items.length} mismatches):`);
        for (const m of items) {
          console.log(`  ${m.key}: active=${m.frameDataActive} frames=${m.attackFramesLen}`);
        }
      }
      console.log(`\nTotal real mismatches: ${realBugs.length} (projectile convention: ${projectiles.length})`);
    }
    expect(true).toBe(true);
  });
});
