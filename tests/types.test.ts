import { describe, it, expect } from 'vitest';
import { FighterState, AttackType, HitLevel, HitHeight, GamePhase } from '../src/core/types.js';

describe('core types', () => {
  describe('FighterState', () => {
    it('has IDLE', () => { expect(FighterState.IDLE).toBeDefined(); });
    it('has WALK', () => { expect(FighterState.WALK).toBeDefined(); });
    it('has CROUCH', () => { expect(FighterState.CROUCH).toBeDefined(); });
    it('has JUMP', () => { expect(FighterState.JUMP).toBeDefined(); });
    it('has HITSTUN', () => { expect(FighterState.HITSTUN).toBeDefined(); });
    it('has KNOCKDOWN', () => { expect(FighterState.KNOCKDOWN).toBeDefined(); });
  });

  describe('AttackType', () => {
    it('has STAND_A', () => { expect(AttackType.STAND_A).toBeDefined(); });
    it('has STAND_B', () => { expect(AttackType.STAND_B).toBeDefined(); });
    it('has CROUCH_A', () => { expect(AttackType.CROUCH_A).toBeDefined(); });
    it('has JUMP_A', () => { expect(AttackType.JUMP_A).toBeDefined(); });
  });

  describe('HitLevel', () => {
    it('contains MID', () => { const h: HitLevel = 'MID'; expect(h).toBe('MID'); });
    it('contains LOW', () => { const h: HitLevel = 'LOW'; expect(h).toBe('LOW'); });
    it('contains HIGH', () => { const h: HitLevel = 'HIGH'; expect(h).toBe('HIGH'); });
  });

  describe('HitHeight', () => {
    it('has HIGH', () => { expect(HitHeight.HIGH).toBeDefined(); });
    it('has MID', () => { expect(HitHeight.MID).toBeDefined(); });
    it('has LOW', () => { expect(HitHeight.LOW).toBeDefined(); });
  });

  describe('GamePhase', () => {
    it('has TITLE', () => { expect(GamePhase.TITLE).toBeDefined(); });
    it('has FIGHTING', () => { expect(GamePhase.FIGHTING).toBeDefined(); });
    it('has KO', () => { expect(GamePhase.KO).toBeDefined(); });
  });
});
