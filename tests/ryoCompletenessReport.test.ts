import { describe, it, expect } from 'vitest';
import {
  generateRyoReport,
  generateRyoExtendedReport,
  generateRyoDimensionReport,
} from '../src/tools/ryoCompletenessReport.js';

describe('Ryo Completeness Report', () => {
  describe('generateRyoReport', () => {
    it('returns character ryo', () => {
      const report = generateRyoReport();
      expect(report.character).toBe('ryo');
    });

    it('has 8 total actions (minimum required)', () => {
      const report = generateRyoReport();
      expect(report.totalActions).toBe(8);
    });

    it('all 8 actions have status entries', () => {
      const report = generateRyoReport();
      expect(report.actions.length).toBe(8);
    });

    it('action names match minimum 8', () => {
      const report = generateRyoReport();
      const names = report.actions.map(a => a.name);
      expect(names).toContain('idle');
      expect(names).toContain('walk_forward');
      expect(names).toContain('walk_backward');
      expect(names).toContain('jump');
      expect(names).toContain('stand_a');
      expect(names).toContain('stand_c');
      expect(names).toContain('hurt');
      expect(names).toContain('knockdown');
    });

    it('idle action has frames', () => {
      const report = generateRyoReport();
      const idle = report.actions.find(a => a.name === 'idle');
      expect(idle).toBeDefined();
      expect(idle!.frameCount).toBeGreaterThan(0);
    });

    it('overallProgress is between 0 and 100', () => {
      const report = generateRyoReport();
      expect(report.overallProgress).toBeGreaterThanOrEqual(0);
      expect(report.overallProgress).toBeLessThanOrEqual(100);
    });

    it('has at least some complete actions', () => {
      const report = generateRyoReport();
      expect(report.completeActions).toBeGreaterThan(0);
    });
  });

  describe('generateRyoDimensionReport', () => {
    it('returns all 6 dimensions', () => {
      const dim = generateRyoDimensionReport();
      expect(dim).toHaveProperty('actionFrames');
      expect(dim).toHaveProperty('attackFrames');
      expect(dim).toHaveProperty('feedback');
      expect(dim).toHaveProperty('hurtbox');
      expect(dim).toHaveProperty('portrait');
      expect(dim).toHaveProperty('moveList');
    });

    it('portrait dimension has 4 size variants', () => {
      const dim = generateRyoDimensionReport();
      expect(dim.portrait.total).toBe(4);
    });

    it('portrait dimension has high completion', () => {
      const dim = generateRyoDimensionReport();
      expect(dim.portrait.pct).toBe(100);
    });

    it('overallScore is between 0 and 100', () => {
      const dim = generateRyoDimensionReport();
      expect(dim.overallScore).toBeGreaterThanOrEqual(0);
      expect(dim.overallScore).toBeLessThanOrEqual(100);
    });

    it('actionFrames dimension has 8 items', () => {
      const dim = generateRyoDimensionReport();
      expect(dim.actionFrames.total).toBe(8);
    });

    it('feedback dimension checks all Ryo attacks', () => {
      const dim = generateRyoDimensionReport();
      // RYO_ALL_ATTACKS has ~32 entries
      expect(dim.feedback.total).toBeGreaterThan(20);
    });

    it('each dimension has valid structure', () => {
      const dim = generateRyoDimensionReport();
      for (const d of [dim.actionFrames, dim.attackFrames, dim.feedback, dim.hurtbox, dim.portrait, dim.moveList]) {
        expect(d).toHaveProperty('dimension');
        expect(d).toHaveProperty('total');
        expect(d).toHaveProperty('passed');
        expect(d).toHaveProperty('pct');
        expect(d).toHaveProperty('missing');
        expect(d).toHaveProperty('complete');
        expect(d.total).toBeGreaterThanOrEqual(0);
        expect(d.passed).toBeGreaterThanOrEqual(0);
        expect(d.passed).toBeLessThanOrEqual(d.total);
      }
    });
  });

  describe('generateRyoExtendedReport', () => {
    it('has specialMoves array', () => {
      const report = generateRyoExtendedReport();
      expect(Array.isArray(report.specialMoves)).toBe(true);
      expect(report.specialMoves.length).toBeGreaterThan(0);
    });

    it('has portraitSizes array with 4 entries', () => {
      const report = generateRyoExtendedReport();
      expect(Array.isArray(report.portraitSizes)).toBe(true);
      expect(report.portraitSizes.length).toBe(4);
    });

    it('portraitSizes includes select, vs, hud, win', () => {
      const report = generateRyoExtendedReport();
      const sizes = report.portraitSizes.map(p => p.size);
      expect(sizes).toContain('select');
      expect(sizes).toContain('vs');
      expect(sizes).toContain('hud');
      expect(sizes).toContain('win');
    });

    it('specialMoves include Ryo key moves', () => {
      const report = generateRyoExtendedReport();
      const labels = report.specialMoves.map(m => m.label);
      expect(labels.some(l => l.includes('KOOU'))).toBe(true);
      expect(labels.some(l => l.includes('KO_HOU'))).toBe(true);
    });
  });
});
