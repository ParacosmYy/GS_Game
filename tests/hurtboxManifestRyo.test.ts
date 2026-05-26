import { describe, it, expect } from 'vitest';
import { HURTBOX_TABLE } from '../src/core/hurtboxManifest.js';
import { FighterState } from '../src/core/types.js';

describe('HURTBOX_TABLE — Ryo relevance', () => {
  // States from ryoCompletenessReport.ts RYO_HURTBOX_STATES
  const REQUIRED_STATES = [
    { state: FighterState.IDLE, label: 'IDLE' },
    { state: FighterState.WALK, label: 'WALK' },
    { state: FighterState.JUMP, label: 'JUMP' },
    { state: FighterState.STAND_ATTACK, label: 'STAND_ATTACK' },
    { state: FighterState.HITSTUN, label: 'HITSTUN' },
    { state: FighterState.KNOCKDOWN, label: 'KNOCKDOWN' },
    { state: FighterState.CROUCH, label: 'CROUCH' },
    { state: FighterState.BLOCK, label: 'BLOCK' },
  ];

  describe('required states have entries', () => {
    for (const { state, label } of REQUIRED_STATES) {
      it(`${label} has hurtbox entry`, () => {
        expect(HURTBOX_TABLE).toHaveProperty(state);
      });
    }
  });

  describe('entry structure', () => {
    it('entries have width and height', () => {
      for (const { state } of REQUIRED_STATES) {
        const entry = HURTBOX_TABLE[state as keyof typeof HURTBOX_TABLE] as Record<string, unknown> | undefined;
        expect(entry).toBeDefined();
        expect(entry).toHaveProperty('width');
        expect(entry).toHaveProperty('height');
      }
    });

    it('width and height are positive', () => {
      for (const { state } of REQUIRED_STATES) {
        const entry = HURTBOX_TABLE[state as keyof typeof HURTBOX_TABLE] as { width: number; height: number };
        expect(entry.width).toBeGreaterThan(0);
        expect(entry.height).toBeGreaterThan(0);
      }
    });
  });

  describe('hurtbox logic', () => {
    it('crouch hurtbox is shorter than idle', () => {
      const idle = HURTBOX_TABLE[FighterState.IDLE] as { height: number };
      const crouch = HURTBOX_TABLE[FighterState.CROUCH] as { height: number };
      expect(crouch.height).toBeLessThan(idle.height);
    });

    it('jump hurtbox exists', () => {
      const jump = HURTBOX_TABLE[FighterState.JUMP];
      expect(jump).toBeDefined();
    });

    it('hitstun hurtbox exists', () => {
      const hitstun = HURTBOX_TABLE[FighterState.HITSTUN];
      expect(hitstun).toBeDefined();
    });
  });
});
