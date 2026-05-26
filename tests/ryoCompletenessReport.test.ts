/**
 * Ryo Completeness Report Tests
 *
 * Validates that the report tool correctly reads Ryo's asset state
 * and produces a well-structured report covering all 8 minimum actions.
 */
import { describe, it, expect } from 'vitest';
import {
  generateRyoReport,
  generateRyoExtendedReport,
} from '../src/tools/ryoCompletenessReport.js';

describe('Ryo Completeness Report', () => {
  it('generates a report without errors', () => {
    const report = generateRyoReport();
    expect(report).toBeDefined();
    expect(report.character).toBe('ryo');
  });

  it('tracks all 8 minimum actions', () => {
    const report = generateRyoReport();
    const expectedActions = [
      'idle',
      'walk_forward',
      'walk_backward',
      'jump',
      'stand_a',
      'stand_c',
      'hurt',
      'knockdown',
    ];

    expect(report.totalActions).toBe(8);
    expect(report.actions.length).toBe(8);

    const reportedNames = report.actions.map(a => a.name);
    for (const expected of expectedActions) {
      expect(reportedNames).toContain(expected);
    }
  });

  it('reports overall progress greater than 0', () => {
    const report = generateRyoReport();
    expect(report.overallProgress).toBeGreaterThan(0);
    expect(report.overallProgress).toBeLessThanOrEqual(100);
  });

  it('marks actions with correct status values', () => {
    const report = generateRyoReport();
    const validStatuses = new Set(['complete', 'partial', 'missing']);

    for (const action of report.actions) {
      expect(validStatuses.has(action.status)).toBe(true);
      expect(action.frameCount).toBeGreaterThanOrEqual(0);
      expect(action.minRequired).toBeGreaterThan(0);
    }
  });

  it('has idle and walk poses with sufficient frames', () => {
    const report = generateRyoReport();

    const idle = report.actions.find(a => a.name === 'idle');
    expect(idle).toBeDefined();
    expect(idle!.frameCount).toBeGreaterThanOrEqual(4);
    expect(idle!.status).toBe('complete');

    const walk = report.actions.find(a => a.name === 'walk_forward');
    expect(walk).toBeDefined();
    expect(walk!.frameCount).toBeGreaterThanOrEqual(4);
    expect(walk!.status).toBe('complete');
  });

  it('has jump pose with at least 2 frames', () => {
    const report = generateRyoReport();
    const jump = report.actions.find(a => a.name === 'jump');
    expect(jump).toBeDefined();
    expect(jump!.frameCount).toBeGreaterThanOrEqual(2);
    expect(jump!.status).toBe('complete');
  });

  it('has hurt and knockdown poses', () => {
    const report = generateRyoReport();
    const hurt = report.actions.find(a => a.name === 'hurt');
    expect(hurt).toBeDefined();
    expect(hurt!.frameCount).toBeGreaterThanOrEqual(1);

    const knockdown = report.actions.find(a => a.name === 'knockdown');
    expect(knockdown).toBeDefined();
    expect(knockdown!.frameCount).toBeGreaterThanOrEqual(1);
  });

  it('stand_a and stand_c have FRAME_DATA entries', () => {
    const report = generateRyoReport();
    const standA = report.actions.find(a => a.name === 'stand_a');
    expect(standA).toBeDefined();
    expect(standA!.hasFrameData).toBe(true);

    const standC = report.actions.find(a => a.name === 'stand_c');
    expect(standC).toBeDefined();
    expect(standC!.hasFrameData).toBe(true);
  });

  it('portrait data exists for ryo', () => {
    const report = generateRyoReport();
    // At least one action should report hasPortrait
    const withPortrait = report.actions.filter(a => a.hasPortrait);
    expect(withPortrait.length).toBeGreaterThan(0);
  });

  it('missingActions only contains actions with status missing', () => {
    const report = generateRyoReport();
    const missingNames = new Set(report.missingActions);
    for (const action of report.actions) {
      if (action.status === 'missing') {
        expect(missingNames.has(action.name)).toBe(true);
      } else {
        expect(missingNames.has(action.name)).toBe(false);
      }
    }
  });

  it('completeActions count matches actions with complete status', () => {
    const report = generateRyoReport();
    const expectedComplete = report.actions.filter(a => a.status === 'complete').length;
    expect(report.completeActions).toBe(expectedComplete);
  });
});

describe('Ryo Extended Report', () => {
  it('generates extended report with special moves', () => {
    const report = generateRyoExtendedReport();
    expect(report.specialMoves).toBeDefined();
    expect(report.specialMoves.length).toBeGreaterThan(0);
  });

  it('tracks Ryo-specific special move FRAME_DATA', () => {
    const report = generateRyoExtendedReport();
    const koou = report.specialMoves.find(m => m.key === 'RYO_KOOU');
    expect(koou).toBeDefined();
    expect(koou!.hasFrameData).toBe(true);
  });

  it('reports portrait size variants', () => {
    const report = generateRyoExtendedReport();
    expect(report.portraitSizes).toBeDefined();
    expect(report.portraitSizes.length).toBe(4);

    const sizeNames = report.portraitSizes.map(p => p.size);
    expect(sizeNames).toContain('select');
    expect(sizeNames).toContain('hud');
  });
});
