/**
 * auditMugenSpriteRefs.ts tests.
 *
 * The source audit is intentionally evidence-first: it connects manifest
 * missing sprite refs to extracted keys and CNS usage hints without modifying
 * MUGEN assets or declaring an automatic repair.
 */
import { describe, expect, it } from 'vitest';
import {
  auditMissingRefSources,
  scanCnsAnimationReferences,
} from '../src/tools/auditMugenSpriteRefs.js';

describe('scanCnsAnimationReferences', () => {
  it('classifies anim expressions separately from helper/explod id references', () => {
    const text = `
[State 8300, Explod]
type = Explod
anim = ifelse(var(11)=1,8330,8300)
id = 8300

[State 8400, Helper]
type = Helper
helpertype = normal
anim = 6505

[State 8500, VarSet]
type = VarSet
value = 8300
`;

    const refs = scanCnsAnimationReferences('fixture.cns', text, new Set(['6505', '8300', '8330']));

    expect(refs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actionId: '8300',
          referenceKind: 'anim-expression',
          controllerType: 'Explod',
          expression: 'ifelse(var(11)=1,8330,8300)',
        }),
        expect.objectContaining({
          actionId: '8330',
          referenceKind: 'anim-expression',
          controllerType: 'Explod',
        }),
        expect.objectContaining({
          actionId: '6505',
          referenceKind: 'anim',
          controllerType: 'Helper',
          expression: '6505',
        }),
        expect.objectContaining({
          actionId: '8300',
          referenceKind: 'id',
          controllerType: 'Explod',
        }),
      ]),
    );
    expect(refs).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actionId: '8300',
          referenceKind: 'value',
        }),
      ]),
    );
  });
});

describe('auditMissingRefSources — Athena', () => {
  it('links Athena missing refs to extracted-key absence and CNS effect hints', () => {
    const report = auditMissingRefSources('cvsathena');
    const actions = new Map(report.actions.map(action => [action.actionId, action]));

    expect(report.mugenDir).toBe('cvsathena');
    expect(report.validation.missingSpriteRefs).toHaveLength(140);
    expect(report.validation.spriteFilesMissing).toBe(0);
    expect(report.summary.frameCount).toBe(140);
    expect(report.summary.uniqueSpriteKeyCount).toBe(123);
    expect(report.summary.referencedPngFilesPresent).toBe(0);
    expect(report.extractedSpriteKeys.publicCount).toBe(1456);
    expect(report.extractedSpriteKeys.referenceCount).toBe(1456);

    for (const actionId of ['6505', '8041', '8042', '8300', '8301', '8310', '8321']) {
      expect(actions.has(actionId), `${actionId} should be summarized`).toBe(true);
    }

    expect(actions.get('6505')?.missingFrameCount).toBe(1);
    expect(actions.get('6505')?.extractedFrameCount).toBe(8);
    expect(actions.get('6505')?.cnsUsageHints.map(hint => hint.controllerType)).toEqual(
      expect.arrayContaining(['Explod']),
    );
    expect(actions.get('8300')?.missingFrameCount).toBe(8);
    expect(actions.get('8300')?.extractedFrameCount).toBe(0);
    expect(actions.get('8300')?.cnsUsageHints.map(hint => hint.controllerType)).toEqual(
      expect.arrayContaining(['Helper', 'Explod']),
    );
    expect(actions.get('8041')?.missingFrameCount).toBe(16);
    expect(actions.get('8041')?.cnsUsageHints).toHaveLength(0);

    expect(report.diagnosis).toContain('source-side or effect/helper references');
    expect(report.diagnosis).toContain('public PNG copy is not missing files');
  });

  it('formats a concise CLI-friendly report without implying an automatic fix', () => {
    const report = auditMissingRefSources('cvsathena');
    const output = report.text;

    expect(output).toContain('[cvsathena]');
    expect(output).toContain('Missing sprite refs: 140 frames, 123 unique sprite keys');
    expect(output).toContain('Extracted sprite keys: public=1456, reference=1456');
    expect(output).toContain('6505: missing=1, extracted=8');
    expect(output).toContain('8300: missing=8, extracted=0');
    expect(output).toContain('CNS usage hints');
    expect(output).toContain('public PNG copy is not missing files');
    expect(output).not.toContain('Auto-fix');
  });
});
