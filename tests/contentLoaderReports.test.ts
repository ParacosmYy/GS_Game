/**
 * Content Loader Report Integration Test
 * Verifies loadCharacterContent returns real (non-placeholder) reports for all 3 characters.
 */
import { describe, it, expect } from 'vitest';
import {
  loadCharacterContent,
  hasCharacterContent,
  getAvailableCharacterIds,
} from '../src/content/contentLoader.js';

const CHARS = ['ryo', 'kyo', 'iori'];

describe('Content loader report integration', () => {
  it('all 3 characters have content packages', () => {
    for (const c of CHARS) {
      expect(hasCharacterContent(c), `${c} has content`).toBe(true);
    }
    expect(hasCharacterContent('unknown')).toBe(false);
  });

  it('getAvailableCharacterIds returns all 3', () => {
    const ids = getAvailableCharacterIds();
    expect(ids).toContain('ryo');
    expect(ids).toContain('kyo');
    expect(ids).toContain('iori');
  });

  it('loadCharacterContent returns real report for Ryo', () => {
    const content = loadCharacterContent('ryo');
    const report = content.report;
    expect(report).toBeDefined();
    expect(report.overallProgress ?? report.totalActions, 'Ryo report has data').toBeDefined();
    // Ryo should have non-zero progress
    if (report.overallProgress !== undefined) {
      expect(report.overallProgress, 'Ryo progress > 0').toBeGreaterThan(0);
    }
  });

  it('loadCharacterContent returns real report for Kyo', () => {
    const content = loadCharacterContent('kyo');
    const report = content.report;
    expect(report).toBeDefined();
    // Should not be a placeholder {total: 0, completed: 0, score: 0}
    const hasRealData = report.overallProgress !== undefined
      || (report.totalActions !== undefined && report.totalActions > 0)
      || (report.animationMeta !== undefined);
    expect(hasRealData, 'Kyo report has real data').toBe(true);
  });

  it('loadCharacterContent returns real report for Iori', () => {
    const content = loadCharacterContent('iori');
    const report = content.report;
    expect(report).toBeDefined();
    const hasRealData = report.overallProgress !== undefined
      || (report.totalActions !== undefined && report.totalActions > 0)
      || (report.animationMeta !== undefined);
    expect(hasRealData, 'Iori report has real data').toBe(true);
  });

  it('all content packages have valid data structure', () => {
    for (const charId of CHARS) {
      const content = loadCharacterContent(charId);
      expect(content.data, `${charId} data`).toBeDefined();
      expect(content.data.id, `${charId} data.id`).toBe(charId);
      expect(content.data.name, `${charId} data.name`).toBeTruthy();
      expect(content.data.nameCn, `${charId} data.nameCn`).toBeTruthy();
      expect(content.data.color, `${charId} data.color`).toBeTruthy();
      expect(content.attackKeys, `${charId} attackKeys`).toBeDefined();
      expect(Array.isArray(content.attackKeys), `${charId} attackKeys array`).toBe(true);
      expect(content.attackKeys.length, `${charId} attackKeys > 0`).toBeGreaterThan(0);
    }
  });

  it('all content packages have feedback tier mapping', () => {
    for (const charId of CHARS) {
      const content = loadCharacterContent(charId);
      const fb = content.feedback;
      expect(fb, `${charId} feedback`).toBeDefined();
      expect(Object.keys(fb).length, `${charId} feedback entries`).toBeGreaterThan(0);
    }
  });

  it('all content packages have animations', () => {
    for (const charId of CHARS) {
      const content = loadCharacterContent(charId);
      expect(content.animations, `${charId} animations`).toBeDefined();
      expect(content.animSequenceNames, `${charId} animSequenceNames`).toBeDefined();
      expect(Array.isArray(content.animSequenceNames), `${charId} names array`).toBe(true);
      expect(content.animSequenceNames.length, `${charId} names > 0`).toBeGreaterThan(0);
    }
  });

  it('all content packages have hitboxes', () => {
    for (const charId of CHARS) {
      const content = loadCharacterContent(charId);
      expect(content.hitboxes, `${charId} hitboxes`).toBeDefined();
      expect(Object.keys(content.hitboxes).length, `${charId} hitbox entries`).toBeGreaterThan(0);
    }
  });

  it('unknown character throws error', () => {
    expect(() => loadCharacterContent('unknown')).toThrow();
  });
});
