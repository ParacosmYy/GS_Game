#!/usr/bin/env npx ts-node
/**
 * auditMugenSpriteRefs.ts
 *
 * Read-only source audit for manifest animation frames that reference sprites
 * absent from the extracted manifest. This tool adds AIR/CNS evidence without
 * modifying MUGEN files, PNGs, manifests, or runtime fallback behavior.
 *
 * Usage: npx ts-node src/tools/auditMugenSpriteRefs.ts --dir <mugenDir> [--source <characterDir>]
 */

import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';
import {
  type MissingSpriteRefDetail,
  type MissingSpriteRefSummary,
  summarizeMissingSpriteRefs,
  validateManifest,
} from './validateManifests.js';

export type CnsReferenceKind = 'anim' | 'anim-expression' | 'projanim' | 'id';
export type CnsEvidenceStrength =
  | 'animation-ref'
  | 'animation-expression-ref'
  | 'object-id-ref'
  | 'cleanup-id-ref';

export type MissingRefClassification =
  | 'public-copy-missing'
  | 'manifest-excludes-existing-png'
  | 'source-reference-missing'
  | 'suspected-fx-helper-reference'
  | 'suspected-groove-effect-reference'
  | 'suspected-common-system-effect-reference'
  | 'unclassified-missing-ref';

export type ClassificationConfidence = 'observed' | 'heuristic';
export type MissingRefEvidenceSource = 'manifest' | 'public-png' | 'reference-png' | 'cns' | 'air-pattern';
export type MissingRefEvidenceKind =
  | 'missing-ref'
  | 'file-presence'
  | 'animation-ref'
  | 'animation-expression-ref'
  | 'object-id-ref'
  | 'cleanup-id-ref'
  | 'cross-character-air-pattern';

export interface CnsUsageHint {
  actionId: string;
  file: string;
  line: number;
  referenceKind: CnsReferenceKind;
  evidenceStrength: CnsEvidenceStrength;
  controllerType: string | null;
  expression: string;
}

export interface ExtractedSpriteKeySummary {
  publicCount: number;
  referenceCount: number;
  publicKeys: string[];
  referenceKeys: string[];
}

export interface MissingRefEvidence {
  source: MissingRefEvidenceSource;
  kind: MissingRefEvidenceKind;
  file?: string;
  line?: number;
  excerpt: string;
}

export interface AirActionPatternEvidence {
  actionId: string;
  frameCount: number;
  patternHash: string;
  weakPatternHash: string;
  matchingCharacterCount: number;
  durationVariantCount: number;
  sampleCharacters: string[];
}

export interface MissingRefActionAudit {
  actionId: string;
  missingFrameCount: number;
  uniqueMissingSpriteKeyCount: number;
  referencedPngFilesPresent: number;
  extractedFrameCount: number;
  missingSpriteKeys: string[];
  extractedSpriteKeys: string[];
  cnsUsageHints: CnsUsageHint[];
  crossCharacterAirPattern?: AirActionPatternEvidence;
  controllerTypes: string[];
  referenceKinds: CnsReferenceKind[];
  classification: MissingRefClassification;
  confidence: ClassificationConfidence;
  affectsValidation: false;
  issueRetained: true;
  evidenceTags: string[];
  evidence: MissingRefEvidence[];
}

export interface MissingRefSourceAudit {
  mugenDir: string;
  sourceDir: string;
  validation: ReturnType<typeof validateManifest>;
  summary: MissingSpriteRefSummary;
  extractedSpriteKeys: ExtractedSpriteKeySummary;
  actions: MissingRefActionAudit[];
  cnsUsageHints: CnsUsageHint[];
  diagnosis: string;
  validationImpact: 'diagnostic-only';
  text: string;
}

interface ManifestSprites {
  sprites?: Record<string, unknown>;
  animations?: Record<string, {
    frames?: Array<{
      group: number;
      index: number;
    }>;
  }>;
}

interface AirFrameRef {
  group: number;
  index: number;
  duration: number;
}

interface AirActionOccurrence {
  characterId: string;
  actionId: string;
  frames: AirFrameRef[];
  strongSignature: string;
  weakSignature: string;
  patternHash: string;
  weakPatternHash: string;
}

function readManifest(dir: string): ManifestSprites | null {
  const manifestPath = path.join(dir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return null;

  return JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as ManifestSprites;
}

function readManifestSpriteKeys(dir: string): Set<string> {
  const manifest = readManifest(dir);
  if (!manifest) return new Set();
  return new Set(Object.keys(manifest.sprites ?? {}));
}

function defaultSourceDir(mugenDir: string): string {
  return path.join('references', 'mugen', 'chars-extracted', 'warusaki3', 'characters', mugenDir);
}

export function collectExtractedSpriteKeys(mugenDir: string): ExtractedSpriteKeySummary {
  const publicKeys = readManifestSpriteKeys(path.join('public', 'sprites', mugenDir));
  const referenceKeys = readManifestSpriteKeys(path.join('references', 'mugen', 'sprites-kof2002', mugenDir));

  return {
    publicCount: publicKeys.size,
    referenceCount: referenceKeys.size,
    publicKeys: Array.from(publicKeys).sort(),
    referenceKeys: Array.from(referenceKeys).sort(),
  };
}

function listCnsFiles(sourceDir: string): string[] {
  if (!fs.existsSync(sourceDir)) return [];
  return fs.readdirSync(sourceDir)
    .filter(file => file.toLowerCase().endsWith('.cns'))
    .map(file => path.join(sourceDir, file))
    .sort();
}

function listAirFiles(charactersRoot: string): string[] {
  if (!fs.existsSync(charactersRoot)) return [];
  return fs.readdirSync(charactersRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.toLowerCase().startsWith('cvs'))
    .flatMap(entry => {
      const characterDir = path.join(charactersRoot, entry.name);
      return fs.readdirSync(characterDir)
        .filter(file => file.toLowerCase().endsWith('.air'))
        .map(file => path.join(characterDir, file));
    })
    .sort();
}

function extractNumbers(expression: string): string[] {
  return Array.from(expression.matchAll(/\b\d{3,5}\b/g)).map(match => match[0]);
}

function referenceKindForKey(key: string, expression: string): CnsReferenceKind | null {
  const normalized = key.toLowerCase();
  if (normalized === 'anim') {
    return /[(),+\-*/?:]/.test(expression) ? 'anim-expression' : 'anim';
  }
  if (normalized === 'projanim') return 'projanim';
  if (normalized === 'id') return 'id';
  return null;
}

function evidenceStrengthFor(referenceKind: CnsReferenceKind, controllerType: string | null): CnsEvidenceStrength {
  if (referenceKind === 'anim' || referenceKind === 'projanim') return 'animation-ref';
  if (referenceKind === 'anim-expression') return 'animation-expression-ref';
  if (controllerType?.toLowerCase() === 'removeexplod') return 'cleanup-id-ref';
  return 'object-id-ref';
}

export function scanCnsAnimationReferences(
  file: string,
  content: string,
  actionIds: Set<string>,
): CnsUsageHint[] {
  const hints: CnsUsageHint[] = [];
  const lines = content.split(/\r?\n/);
  let controllerType: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (/^\[State\b/i.test(line)) {
      controllerType = null;
      continue;
    }

    const typeMatch = line.match(/^type\s*=\s*([A-Za-z_][\w]*)/i);
    if (typeMatch) {
      controllerType = typeMatch[1];
      continue;
    }

    const assignmentMatch = line.match(/^(anim|projanim|id)\s*=\s*(.+)$/i);
    if (!assignmentMatch) continue;

    const key = assignmentMatch[1];
    const expression = assignmentMatch[2].split(';')[0].trim();
    const referenceKind = referenceKindForKey(key, expression);
    if (!referenceKind) continue;

    for (const number of extractNumbers(expression)) {
      if (!actionIds.has(number)) continue;
      hints.push({
        actionId: number,
        file,
        line: i + 1,
        referenceKind,
        evidenceStrength: evidenceStrengthFor(referenceKind, controllerType),
        controllerType,
        expression,
      });
    }
  }

  return hints;
}

export function scanCnsSourceDir(sourceDir: string, actionIds: Set<string>): CnsUsageHint[] {
  const hints: CnsUsageHint[] = [];

  for (const filePath of listCnsFiles(sourceDir)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    hints.push(...scanCnsAnimationReferences(path.basename(filePath), content, actionIds));
  }

  return hints;
}

function normalizeFrameSignature(frames: AirFrameRef[], includeDuration: boolean): string {
  return frames
    .map(frame => includeDuration
      ? `${frame.group}:${frame.index}:${frame.duration}`
      : `${frame.group}:${frame.index}`)
    .join('|');
}

function stableHash(value: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function parseAirActions(
  file: string,
  content: string,
  actionIds: Set<string>,
): AirActionOccurrence[] {
  const occurrences: AirActionOccurrence[] = [];
  const characterId = path.basename(path.dirname(file));
  const lines = content.split(/\r?\n/);
  let currentActionId: string | null = null;
  let currentFrames: AirFrameRef[] = [];

  const flush = () => {
    if (!currentActionId || currentFrames.length === 0 || !actionIds.has(currentActionId)) return;
    const strongSignature = normalizeFrameSignature(currentFrames, true);
    const weakSignature = normalizeFrameSignature(currentFrames, false);
    occurrences.push({
      characterId,
      actionId: currentActionId,
      frames: currentFrames,
      strongSignature,
      weakSignature,
      patternHash: stableHash(strongSignature),
      weakPatternHash: stableHash(weakSignature),
    });
  };

  for (const rawLine of lines) {
    const line = rawLine.split(';')[0].trim();
    const actionMatch = line.match(/^\[Begin\s+Action\s+(-?\d+)\]/i);
    if (actionMatch) {
      flush();
      currentActionId = actionMatch[1];
      currentFrames = [];
      continue;
    }

    if (!currentActionId || !actionIds.has(currentActionId)) continue;
    const frameMatch = line.match(/^\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)/);
    if (!frameMatch) continue;
    currentFrames.push({
      group: Number(frameMatch[1]),
      index: Number(frameMatch[2]),
      duration: Number(frameMatch[5]),
    });
  }

  flush();
  return occurrences;
}

function collectCrossCharacterAirPatterns(
  sourceDir: string,
  actionIds: Set<string>,
): Map<string, AirActionPatternEvidence> {
  const charactersRoot = path.dirname(sourceDir);
  const occurrences: AirActionOccurrence[] = [];

  for (const filePath of listAirFiles(charactersRoot)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    occurrences.push(...parseAirActions(filePath, content, actionIds));
  }

  const byAction = new Map<string, AirActionOccurrence[]>();
  for (const occurrence of occurrences) {
    const actionOccurrences = byAction.get(occurrence.actionId) ?? [];
    actionOccurrences.push(occurrence);
    byAction.set(occurrence.actionId, actionOccurrences);
  }

  const evidenceByAction = new Map<string, AirActionPatternEvidence>();
  const sourceCharacterId = path.basename(sourceDir);

  for (const [actionId, actionOccurrences] of byAction.entries()) {
    const sourceOccurrence = actionOccurrences.find(occurrence => occurrence.characterId === sourceCharacterId);
    if (!sourceOccurrence) continue;
    const matchingOccurrences = actionOccurrences.filter(
      occurrence => occurrence.weakSignature === sourceOccurrence.weakSignature,
    );
    const strongVariants = new Set(matchingOccurrences.map(occurrence => occurrence.strongSignature));
    evidenceByAction.set(actionId, {
      actionId,
      frameCount: sourceOccurrence.frames.length,
      patternHash: sourceOccurrence.patternHash,
      weakPatternHash: sourceOccurrence.weakPatternHash,
      matchingCharacterCount: collectSortedUnique(matchingOccurrences.map(occurrence => occurrence.characterId)).length,
      durationVariantCount: strongVariants.size,
      sampleCharacters: collectSortedUnique(matchingOccurrences.map(occurrence => occurrence.characterId)).slice(0, 8),
    });
  }

  return evidenceByAction;
}

function groupDetailsByAction(details: MissingSpriteRefDetail[]): Map<string, MissingSpriteRefDetail[]> {
  const byAction = new Map<string, MissingSpriteRefDetail[]>();
  for (const detail of details) {
    const actionDetails = byAction.get(detail.actionId) ?? [];
    actionDetails.push(detail);
    byAction.set(detail.actionId, actionDetails);
  }
  return byAction;
}

function spriteKeysForAction(details: MissingSpriteRefDetail[]): string[] {
  return Array.from(new Set(details.map(detail => detail.spriteKey))).sort();
}

function spriteKey(group: number, index: number): string {
  return `${group}_${index}`;
}

function countExtractedFramesForAction(
  mugenDir: string,
  actionId: string,
  extractedKeys: Set<string>,
): number {
  const manifest = readManifest(path.join('public', 'sprites', mugenDir));
  const frames = manifest?.animations?.[actionId]?.frames ?? [];
  return frames.filter(frame => frame.group !== -1 && extractedKeys.has(spriteKey(frame.group, frame.index))).length;
}

function buildDiagnosis(summary: MissingSpriteRefSummary, extracted: ExtractedSpriteKeySummary): string {
  if (summary.frameCount === 0) {
    return 'No missing manifest sprite refs were found.';
  }

  if (summary.referencedPngFilesPresent === 0) {
    return 'Missing refs point to source-side or effect/helper references absent from current extraction; public PNG copy is not missing files.';
  }

  return `Missing refs include ${summary.referencedPngFilesPresent} expected PNG files that exist on disk but are not present in manifest sprites; extracted public=${extracted.publicCount}, reference=${extracted.referenceCount}.`;
}

function collectSortedUnique<T>(values: T[]): T[] {
  return Array.from(new Set(values)).sort();
}

function classifyAction(
  actionId: string,
  missingFrameCount: number,
  extractedFrameCount: number,
  referencedPngFilesPresent: number,
  cnsUsageHints: CnsUsageHint[],
  crossCharacterAirPattern: AirActionPatternEvidence | undefined,
  spriteFilesMissing: number,
): {
  classification: MissingRefClassification;
  confidence: ClassificationConfidence;
  evidenceTags: string[];
} {
  const evidenceTags: string[] = ['manifest-missing-ref', 'issue-retained'];
  const hasAnimationRef = cnsUsageHints.some(hint =>
    hint.evidenceStrength === 'animation-ref' || hint.evidenceStrength === 'animation-expression-ref');
  const hasHelperContext = cnsUsageHints.some(hint => hint.controllerType?.toLowerCase() === 'helper');
  const hasExplodContext = cnsUsageHints.some(hint => hint.controllerType?.toLowerCase().includes('explod'));
  const hasGrooveFile = cnsUsageHints.some(hint => hint.file.toLowerCase().includes('groove'));
  const hasOnlyWeakIdRefs = cnsUsageHints.length > 0 && cnsUsageHints.every(hint =>
    hint.evidenceStrength === 'object-id-ref' || hint.evidenceStrength === 'cleanup-id-ref');

  if (referencedPngFilesPresent > 0 && extractedFrameCount === 0) {
    evidenceTags.push('expected-png-present');
    return {
      classification: 'manifest-excludes-existing-png',
      confidence: 'observed',
      evidenceTags,
    };
  }

  if (spriteFilesMissing > 0) {
    evidenceTags.push('public-copy-missing');
    return {
      classification: 'public-copy-missing',
      confidence: 'observed',
      evidenceTags,
    };
  }

  if (extractedFrameCount > 0 && missingFrameCount > 0) {
    evidenceTags.push('partial-extracted-frames');
    if (hasAnimationRef) evidenceTags.push('cns-animation-ref');
    if (hasGrooveFile) evidenceTags.push('cns-groove-context');
    return {
      classification: 'source-reference-missing',
      confidence: 'observed',
      evidenceTags,
    };
  }

  if (hasAnimationRef && (hasHelperContext || hasExplodContext)) {
    evidenceTags.push('cns-animation-ref');
    if (hasHelperContext) evidenceTags.push('cns-helper-context');
    if (hasExplodContext) evidenceTags.push('cns-explod-context');
    if (hasGrooveFile) evidenceTags.push('cns-groove-context');
    return {
      classification: !hasHelperContext && hasGrooveFile
        ? 'suspected-groove-effect-reference'
        : 'suspected-fx-helper-reference',
      confidence: 'heuristic',
      evidenceTags,
    };
  }

  if (hasOnlyWeakIdRefs) {
    evidenceTags.push('weak-cns-id-only');
  }

  if (crossCharacterAirPattern && crossCharacterAirPattern.matchingCharacterCount >= 20) {
    evidenceTags.push('cross-character-air-pattern');
    evidenceTags.push('shared-system-effect-candidate');
    return {
      classification: 'suspected-common-system-effect-reference',
      confidence: 'heuristic',
      evidenceTags,
    };
  }

  if (actionId) {
    evidenceTags.push('unclassified-risk-retained');
  }

  return {
    classification: 'unclassified-missing-ref',
    confidence: 'heuristic',
    evidenceTags,
  };
}

function buildActionEvidence(
  actionId: string,
  missingFrameCount: number,
  referencedPngFilesPresent: number,
  cnsUsageHints: CnsUsageHint[],
  crossCharacterAirPattern: AirActionPatternEvidence | undefined,
): MissingRefEvidence[] {
  const evidence: MissingRefEvidence[] = [
    {
      source: 'manifest',
      kind: 'missing-ref',
      excerpt: `${missingFrameCount} animation frames reference sprite keys absent from manifest.sprites for action ${actionId}.`,
    },
    {
      source: 'public-png',
      kind: 'file-presence',
      excerpt: `${referencedPngFilesPresent} expected public PNG files are present for the missing refs.`,
    },
    {
      source: 'reference-png',
      kind: 'file-presence',
      excerpt: 'Reference manifest key presence is represented by extractedSpriteKeys and does not change validation status.',
    },
  ];

  for (const hint of cnsUsageHints.slice(0, 6)) {
    evidence.push({
      source: 'cns',
      kind: hint.evidenceStrength,
      file: hint.file,
      line: hint.line,
      excerpt: `${hint.controllerType ?? 'unknown'}.${hint.referenceKind} = ${hint.expression}`,
    });
  }

  if (crossCharacterAirPattern) {
    evidence.push({
      source: 'air-pattern',
      kind: 'cross-character-air-pattern',
      excerpt: `Action ${actionId} matches ${crossCharacterAirPattern.matchingCharacterCount} CVS character AIR patterns by group/index signature; missing refs remain actionable until source sprite status is confirmed.`,
    });
  }

  return evidence;
}

export function formatAuditReport(report: Omit<MissingRefSourceAudit, 'text'>): string {
  const lines: string[] = [];
  lines.push(`[${report.mugenDir}]`);
  lines.push(`  Source: ${report.sourceDir}`);
  lines.push(
    `  Missing sprite refs: ${report.summary.frameCount} frames, ${report.summary.uniqueSpriteKeyCount} unique sprite keys, ${report.summary.actionCount} actions`,
  );
  lines.push(
    `  Extracted sprite keys: public=${report.extractedSpriteKeys.publicCount}, reference=${report.extractedSpriteKeys.referenceCount}`,
  );
  lines.push(`  Diagnosis: ${report.diagnosis}`);
  lines.push(`  Validation impact: validationImpact=${report.validationImpact}`);

  if (report.actions.length > 0) {
    lines.push(`  Actions:`);
    for (const action of report.actions.slice(0, 12)) {
      lines.push(
        `    - ${action.actionId}: missing=${action.missingFrameCount}, extracted=${action.extractedFrameCount}, cnsHints=${action.cnsUsageHints.length}, airMatches=${action.crossCharacterAirPattern?.matchingCharacterCount ?? 0}, classification=${action.classification}, issueRetained=${action.issueRetained}`,
      );
    }
  }

  if (report.cnsUsageHints.length > 0) {
    lines.push(`  CNS usage hints:`);
    for (const hint of report.cnsUsageHints.slice(0, 12)) {
      lines.push(
        `    - ${hint.actionId}: ${hint.file}:${hint.line} ${hint.controllerType ?? 'unknown'}.${hint.referenceKind} ${hint.evidenceStrength} = ${hint.expression}`,
      );
    }
  }

  return lines.join('\n');
}

export function auditMissingRefSources(
  mugenDir: string,
  sourceDir = defaultSourceDir(mugenDir),
): MissingRefSourceAudit {
  const validation = validateManifest(mugenDir);
  const summary = summarizeMissingSpriteRefs(validation);
  const extractedSpriteKeys = collectExtractedSpriteKeys(mugenDir);
  const actionIds = new Set(validation.missingSpriteRefDetails.map(detail => detail.actionId));
  const cnsUsageHints = scanCnsSourceDir(sourceDir, actionIds);
  const airPatterns = collectCrossCharacterAirPatterns(sourceDir, actionIds);
  const hintsByAction = new Map<string, CnsUsageHint[]>();

  for (const hint of cnsUsageHints) {
    const actionHints = hintsByAction.get(hint.actionId) ?? [];
    actionHints.push(hint);
    hintsByAction.set(hint.actionId, actionHints);
  }

  const publicKeys = new Set(extractedSpriteKeys.publicKeys);
  const referenceKeys = new Set(extractedSpriteKeys.referenceKeys);
  const combinedExtractedKeys = new Set([...publicKeys, ...referenceKeys]);
  const byAction = groupDetailsByAction(validation.missingSpriteRefDetails);
  const actions = Array.from(byAction.entries())
    .map(([actionId, details]) => {
      const missingSpriteKeys = spriteKeysForAction(details);
      const extractedMissingSpriteKeys = missingSpriteKeys.filter(
        key => publicKeys.has(key) || referenceKeys.has(key),
      );
      const actionHints = hintsByAction.get(actionId) ?? [];
      const crossCharacterAirPattern = airPatterns.get(actionId);
      const referencedPngFilesPresent = details.filter(detail => detail.fileExists).length;
      const extractedFrameCount = countExtractedFramesForAction(mugenDir, actionId, combinedExtractedKeys);
      const classification = classifyAction(
        actionId,
        details.length,
        extractedFrameCount,
        referencedPngFilesPresent,
        actionHints,
        crossCharacterAirPattern,
        validation.spriteFilesMissing,
      );
      return {
        actionId,
        missingFrameCount: details.length,
        uniqueMissingSpriteKeyCount: missingSpriteKeys.length,
        referencedPngFilesPresent,
        extractedFrameCount,
        missingSpriteKeys,
        extractedSpriteKeys: extractedMissingSpriteKeys,
        cnsUsageHints: actionHints,
        crossCharacterAirPattern,
        controllerTypes: collectSortedUnique(actionHints.map(hint => hint.controllerType ?? 'unknown')),
        referenceKinds: collectSortedUnique(actionHints.map(hint => hint.referenceKind)),
        classification: classification.classification,
        confidence: classification.confidence,
        affectsValidation: false as const,
        issueRetained: true as const,
        evidenceTags: classification.evidenceTags,
        evidence: buildActionEvidence(
          actionId,
          details.length,
          referencedPngFilesPresent,
          actionHints,
          crossCharacterAirPattern,
        ),
      };
    })
    .sort((a, b) => Number(a.actionId) - Number(b.actionId));

  const diagnosis = buildDiagnosis(summary, extractedSpriteKeys);
  const partialReport = {
    mugenDir,
    sourceDir,
    validation,
    summary,
    extractedSpriteKeys,
    actions,
    cnsUsageHints,
    diagnosis,
    validationImpact: 'diagnostic-only' as const,
  };
  const text = formatAuditReport(partialReport);

  return {
    ...partialReport,
    text,
  };
}

function main() {
  const args = process.argv.slice(2);
  const dirIdx = args.indexOf('--dir');
  const sourceIdx = args.indexOf('--source');
  const mugenDir = dirIdx >= 0 ? args[dirIdx + 1] : null;

  if (!mugenDir) {
    console.error('Usage: npx ts-node src/tools/auditMugenSpriteRefs.ts --dir <mugenDir> [--source <characterDir>]');
    process.exit(1);
  }

  const sourceDir = sourceIdx >= 0 && args[sourceIdx + 1]
    ? args[sourceIdx + 1]
    : defaultSourceDir(mugenDir);
  console.log(auditMissingRefSources(mugenDir, sourceDir).text);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
