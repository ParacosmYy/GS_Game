/**
 * validateManifests.ts diagnostics tests.
 *
 * These guard the multi-manifest asset validator used for MUGEN sprite import
 * triage. Athena intentionally keeps its current manifest data unchanged here:
 * the test verifies the tool can distinguish absent animation sprite refs from
 * missing copied PNG files.
 */
import { describe, expect, it, vi } from 'vitest';
import {
  formatResult,
  summarizeMissingSpriteRefs,
  validateManifest,
} from '../src/tools/validateManifests.js';

describe('validateManifests — Athena missing sprite diagnostics', () => {
  it('reports Athena missing sprite refs as absent extracted sprites, not missing copied PNG files', () => {
    const result = validateManifest('cvsathena');
    const summary = summarizeMissingSpriteRefs(result);

    expect(result.totalSprites).toBe(1456);
    expect(result.totalAnims).toBe(509);
    expect(result.totalFrames).toBe(2715);
    expect(result.spriteFilesMissing).toBe(0);
    expect(result.missingSpriteRefs).toHaveLength(140);
    expect(result.missingSpriteRefDetails).toHaveLength(140);

    expect(summary.frameCount).toBe(140);
    expect(summary.uniqueSpriteKeyCount).toBe(123);
    expect(summary.referencedPngFilesPresent).toBe(0);
    expect(summary.actionCount).toBe(14);
    expect(summary.diagnosis).toContain('public PNG copy is not missing files');

    expect(summary.actions.map(action => action.actionId)).toEqual(
      expect.arrayContaining(['6505', '8041', '8300']),
    );
  });

  it('keeps the legacy string refs while exposing structured details', () => {
    const result = validateManifest('cvsathena');
    const detail = result.missingSpriteRefDetails[0];

    expect(result.missingSpriteRefs[0]).toMatch(/^Action \d+ frame \d+: \d+_\d+$/);
    expect(detail).toEqual(
      expect.objectContaining({
        actionId: expect.any(String),
        frameIndex: expect.any(Number),
        group: expect.any(Number),
        index: expect.any(Number),
        spriteKey: expect.any(String),
        expectedFile: expect.stringMatching(/^\d{5}_\d{4}\.png$/),
        fileExists: false,
      }),
    );
  });

  it('formats diagnostics without changing the legacy missing PNG summary meaning', () => {
    const output = formatResult(validateManifest('cvsathena'));

    expect(output).toContain('Sprites: 1456 (1456 exist, 0 missing)');
    expect(output).toContain('Issues:');
    expect(output).toContain('- 140 missing sprite refs');
    expect(output).toContain('Diagnostics:');
    expect(output).toContain('Missing sprite refs: 140 frames, 123 unique sprite keys, 14 actions, 0 referenced PNG files present');
    expect(output).toContain('AIR references sprites absent from manifest/SFF extraction; public PNG copy is not missing files.');
  });
});

describe('validateManifests — module import behavior', () => {
  it('does not execute the CLI main routine when imported by tests', async () => {
    vi.resetModules();
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await import('../src/tools/validateManifests.js');

    expect(logSpy).not.toHaveBeenCalled();
    logSpy.mockRestore();
  });
});
