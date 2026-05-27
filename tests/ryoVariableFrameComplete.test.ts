/**
 * Ryo Variable Frame Completeness Test
 *
 * Validates that ALL Ryo animations use variable frame durations
 * (no remaining uniform registerFrames calls for animation data).
 * This ensures KOF2002-authentic per-frame timing across the entire moveset.
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const RENDER_FILE = path.resolve(__dirname, '../src/rendering/sprites/ryoHighResRender.ts');

describe('Ryo Variable Frame Completeness', () => {
  const source = fs.readFileSync(RENDER_FILE, 'utf8');

  it('has no remaining uniform registerFrames calls for animations', () => {
    // Find all direct registerFrames(' calls (not via baseHighResRenderer alias)
    const registerFramesCalls = source.match(/registerFrames\(['"]/g);
    const registerFramesDef = source.match(/function registerFrames\(/g);
    const baseImport = source.match(/registerFrames as reg/g);

    const callCount = registerFramesCalls ? registerFramesCalls.length : 0;
    const defCount = registerFramesDef ? registerFramesDef.length : 0;
    const usesBase = baseImport ? baseImport.length : 0;

    // With shared base: no local definition, no direct calls, uses base import
    if (usesBase > 0) {
      expect(callCount, 'No uniform registerFrames calls should remain').toBe(0);
    } else {
      // Legacy: function definition should exist, no direct calls
      expect(callCount, 'No uniform registerFrames calls should remain').toBe(0);
      expect(defCount, 'Function definition should exist').toBe(1);
    }
  });

  it('has all required animation states registered with variable frames', () => {
    const requiredAnimations = [
      'IDLE', 'WALK_FORWARD', 'WALK_BACKWARD',
      'STAND_A', 'STAND_C', 'STAND_B', 'STAND_D',
      'CLOSE_A', 'CLOSE_C', 'CLOSE_B', 'CLOSE_D',
      'CROUCH', 'CROUCH_A', 'CROUCH_C', 'CROUCH_B', 'CROUCH_D',
      'JUMP', 'AIR_A', 'AIR_C', 'AIR_D',
      'HURT', 'KNOCKDOWN',
      'KO_HOU', 'KOOU', 'HIEN', 'HAOU', 'KOOU_C', 'KO_HOU_C',
      'DM_TEN_HA_OU', 'DM_RYUKO_RANBU', 'SDM_TEN_HA_OU', 'HSDM_RYUKO_RANBU',
      'RUN', 'BACKDASH', 'ROLL', 'BACK_ROLL',
      'BLOCK', 'DIZZY', 'THROW', 'GUARD_CRUSH', 'MAX_MODE', 'TAUNT',
      'COUNTER_STANCE', 'RYUKO_RANBU', 'WIN',
    ];

    for (const anim of requiredAnimations) {
      const pattern = `registerVariableFrames('${anim}'`;
      const found = source.includes(pattern);
      expect(found, `Animation ${anim} should be registered with variable frames`).toBe(true);
    }
  });

  it('has correct number of variable frame registrations', () => {
    const matches = source.match(/registerVariableFrames\('/g);
    const count = matches ? matches.length : 0;
    // Should have 46+ registrations (all animation states)
    expect(count, 'Should have 45+ variable frame registrations').toBeGreaterThanOrEqual(45);
  });
});
