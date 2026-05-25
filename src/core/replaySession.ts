/**
 * ReplaySession — 对局复现封装
 *
 * 负责把对局元数据、RNG 边界和输入日志绑成一个可导出的工件，
 * 并提供导入与校验能力。
 */
import { getGameRngSnapshot, resetGameRng } from './prng.js';
import { InputLogger, type InputLogMeta, type RngSnapshot } from './inputLog.js';

const REPLAY_BUNDLE_VERSION = 1 as const;

export interface ReplaySessionOptions {
  seed: number;
  label: string;
  round: number;
  p1CharId: string;
  p2CharId: string;
  stageId: string;
  teamMode: boolean;
  trainingMode: boolean;
}

export interface ReplayMatchEnvelope extends ReplaySessionOptions {
  source: NonNullable<InputLogMeta['source']>;
}

export interface ReplayInputLogPayload {
  version: 1 | 2;
  meta?: InputLogMeta;
  frames: unknown[];
}

export interface ReplayBundleV1 {
  version: typeof REPLAY_BUNDLE_VERSION;
  match: ReplayMatchEnvelope;
  rngSnapshot: RngSnapshot;
  inputLog: ReplayInputLogPayload;
}

export type ReplayBundleImportResult =
  | { ok: true; bundle: ReplayBundleV1 }
  | { ok: false; error: string };

export class ReplaySession {
  private readonly inputLog: InputLogger;
  private matchEnvelope: ReplayMatchEnvelope | null = null;
  private rngSnapshot: RngSnapshot | null = null;

  constructor(inputLog: InputLogger) {
    this.inputLog = inputLog;
  }

  beginLiveMatch(options: ReplaySessionOptions): void {
    resetGameRng(options.seed);
    this.inputLog.clear();

    const rngSnapshot = getGameRngSnapshot();
    const match: ReplayMatchEnvelope = {
      ...options,
      source: 'live',
    };
    const meta: InputLogMeta = {
      rngSeed: options.seed,
      rngState: rngSnapshot.state,
      label: options.label,
      source: 'live',
      round: options.round,
      p1CharId: options.p1CharId,
      p2CharId: options.p2CharId,
      stageId: options.stageId,
      teamMode: options.teamMode,
      trainingMode: options.trainingMode,
    };

    this.matchEnvelope = match;
    this.rngSnapshot = rngSnapshot;
    this.inputLog.setMeta(meta);
    this.inputLog.setRngSnapshot(rngSnapshot);
  }

  exportBundle(): string {
    const bundle = this.buildBundle();
    return JSON.stringify(bundle);
  }

  importBundle(json: string): ReplayBundleImportResult {
    try {
      const raw = JSON.parse(json);
      const normalized = this.normalizeBundle(raw);
      if (!normalized.ok) return normalized;
      const bundle = normalized.bundle;

      const tempLog = new InputLogger();
      if (!tempLog.load(JSON.stringify(bundle.inputLog))) {
        return { ok: false, error: 'Replay bundle contains an invalid input log' };
      }

      const logMeta = tempLog.getMeta();
      const consistencyError = this.validateConsistency(bundle.match, logMeta, bundle.rngSnapshot);
      if (consistencyError) {
        return { ok: false, error: consistencyError };
      }

      if (!this.inputLog.load(JSON.stringify(bundle.inputLog))) {
        return { ok: false, error: 'Replay bundle input log could not be loaded' };
      }

      this.matchEnvelope = bundle.match;
      this.rngSnapshot = bundle.rngSnapshot;
      this.inputLog.setMeta(this.buildMeta(bundle.match, logMeta, bundle.rngSnapshot));
      this.inputLog.setRngSnapshot(bundle.rngSnapshot);
      return { ok: true, bundle };
    } catch {
      return { ok: false, error: 'Replay bundle JSON is invalid' };
    }
  }

  getMatchEnvelope(): ReplayMatchEnvelope | null {
    return this.matchEnvelope ? { ...this.matchEnvelope } : null;
  }

  getRngSnapshot(): RngSnapshot | null {
    return this.rngSnapshot ? { ...this.rngSnapshot } : null;
  }

  private buildBundle(): ReplayBundleV1 {
    if (!this.matchEnvelope) {
      throw new Error('Cannot export replay bundle before a match starts');
    }

    const rngSnapshot = this.rngSnapshot ?? this.inputLog.getRngSnapshot();
    if (!rngSnapshot) {
      throw new Error('Cannot export replay bundle without an RNG snapshot');
    }

    return {
      version: REPLAY_BUNDLE_VERSION,
      match: { ...this.matchEnvelope },
      rngSnapshot: { ...rngSnapshot },
      inputLog: JSON.parse(this.inputLog.dump()) as ReplayInputLogPayload,
    };
  }

  private normalizeBundle(raw: unknown): ReplayBundleImportResult {
    if (!raw || typeof raw !== 'object') {
      return { ok: false, error: 'Replay bundle must be a JSON object' };
    }

    const bundle = raw as Record<string, unknown>;
    if (bundle.version !== REPLAY_BUNDLE_VERSION) {
      return { ok: false, error: 'Unsupported replay bundle version' };
    }

    const match = this.normalizeMatchEnvelope(bundle.match);
    if (!match.ok) return match;

    const rngSnapshot = this.normalizeRngSnapshot(bundle.rngSnapshot);
    if (!rngSnapshot.ok) return rngSnapshot;

    const inputLog = this.normalizeInputLogPayload(bundle.inputLog);
    if (!inputLog.ok) return inputLog;

    return {
      ok: true,
      bundle: {
        version: REPLAY_BUNDLE_VERSION,
        match: match.match,
        rngSnapshot: rngSnapshot.rngSnapshot,
        inputLog: inputLog.inputLog,
      },
    };
  }

  private normalizeMatchEnvelope(raw: unknown): { ok: true; match: ReplayMatchEnvelope } | { ok: false; error: string } {
    if (!raw || typeof raw !== 'object') {
      return { ok: false, error: 'Replay bundle is missing the match envelope' };
    }

    const match = raw as Record<string, unknown>;
    if (typeof match.seed !== 'number' || !Number.isFinite(match.seed)) return { ok: false, error: 'Replay match seed is invalid' };
    if (typeof match.label !== 'string') return { ok: false, error: 'Replay match label is missing' };
    if (typeof match.round !== 'number' || !Number.isFinite(match.round)) return { ok: false, error: 'Replay match round is invalid' };
    if (typeof match.p1CharId !== 'string') return { ok: false, error: 'Replay match p1CharId is missing' };
    if (typeof match.p2CharId !== 'string') return { ok: false, error: 'Replay match p2CharId is missing' };
    if (typeof match.stageId !== 'string') return { ok: false, error: 'Replay match stageId is missing' };
    if (typeof match.teamMode !== 'boolean') return { ok: false, error: 'Replay match teamMode is invalid' };
    if (typeof match.trainingMode !== 'boolean') return { ok: false, error: 'Replay match trainingMode is invalid' };
    if (match.source !== 'live' && match.source !== 'replay') return { ok: false, error: 'Replay match source is invalid' };

    return {
      ok: true,
      match: {
        seed: match.seed,
        label: match.label,
        round: match.round,
        p1CharId: match.p1CharId,
        p2CharId: match.p2CharId,
        stageId: match.stageId,
        teamMode: match.teamMode,
        trainingMode: match.trainingMode,
        source: match.source,
      },
    };
  }

  private normalizeRngSnapshot(raw: unknown): { ok: true; rngSnapshot: RngSnapshot } | { ok: false; error: string } {
    if (!raw || typeof raw !== 'object') {
      return { ok: false, error: 'Replay bundle is missing the RNG snapshot' };
    }

    const rng = raw as Record<string, unknown>;
    if (typeof rng.state !== 'number' || !Number.isFinite(rng.state)) {
      return { ok: false, error: 'Replay bundle RNG snapshot is invalid' };
    }

    return { ok: true, rngSnapshot: { state: rng.state } };
  }

  private normalizeInputLogPayload(raw: unknown): { ok: true; inputLog: ReplayInputLogPayload } | { ok: false; error: string } {
    if (!raw || typeof raw !== 'object') {
      return { ok: false, error: 'Replay bundle is missing the input log' };
    }

    const inputLog = raw as Record<string, unknown>;
    if (inputLog.version !== 1 && inputLog.version !== 2) {
      return { ok: false, error: 'Replay bundle input log version is invalid' };
    }
    if (!Array.isArray(inputLog.frames)) {
      return { ok: false, error: 'Replay bundle input log frames are missing' };
    }

    return {
      ok: true,
      inputLog: {
        version: inputLog.version,
        meta: this.normalizeMeta(inputLog.meta as InputLogMeta | undefined),
        frames: inputLog.frames,
      },
    };
  }

  private validateConsistency(match: ReplayMatchEnvelope, meta: InputLogMeta, rngSnapshot: RngSnapshot): string | null {
    if (typeof meta.rngSeed === 'number' && meta.rngSeed !== match.seed) return 'Replay bundle mismatch: RNG seed does not match the match envelope';
    if (typeof meta.label === 'string' && meta.label !== match.label) return 'Replay bundle mismatch: label does not match the match envelope';
    if (typeof meta.round === 'number' && meta.round !== match.round) return 'Replay bundle mismatch: round does not match the match envelope';
    if (typeof meta.p1CharId === 'string' && meta.p1CharId !== match.p1CharId) return 'Replay bundle mismatch: P1 character does not match the match envelope';
    if (typeof meta.p2CharId === 'string' && meta.p2CharId !== match.p2CharId) return 'Replay bundle mismatch: P2 character does not match the match envelope';
    if (typeof meta.stageId === 'string' && meta.stageId !== match.stageId) return 'Replay bundle mismatch: stage does not match the match envelope';
    if (typeof meta.teamMode === 'boolean' && meta.teamMode !== match.teamMode) return 'Replay bundle mismatch: team mode does not match the match envelope';
    if (typeof meta.trainingMode === 'boolean' && meta.trainingMode !== match.trainingMode) return 'Replay bundle mismatch: training mode does not match the match envelope';
    if (meta.source && meta.source !== match.source) return 'Replay bundle mismatch: source does not match the match envelope';
    if (typeof meta.rngState === 'number' && meta.rngState !== rngSnapshot.state) return 'Replay bundle mismatch: RNG state does not match the bundle snapshot';
    return null;
  }

  private buildMeta(match: ReplayMatchEnvelope, logMeta: InputLogMeta, rngSnapshot: RngSnapshot): InputLogMeta {
    return {
      ...logMeta,
      rngSeed: match.seed,
      rngState: rngSnapshot.state,
      label: match.label,
      source: match.source,
      round: match.round,
      p1CharId: match.p1CharId,
      p2CharId: match.p2CharId,
      stageId: match.stageId,
      teamMode: match.teamMode,
      trainingMode: match.trainingMode,
    };
  }

  private normalizeMeta(meta: InputLogMeta | undefined): InputLogMeta {
    if (!meta || typeof meta !== 'object') return {};

    const normalized: InputLogMeta = {};
    if (typeof meta.rngSeed === 'number' && Number.isFinite(meta.rngSeed)) {
      normalized.rngSeed = meta.rngSeed;
    }
    if (typeof meta.rngState === 'number' && Number.isFinite(meta.rngState)) {
      normalized.rngState = meta.rngState;
    }
    if (typeof meta.label === 'string') {
      normalized.label = meta.label;
    }
    if (meta.source === 'live' || meta.source === 'replay') {
      normalized.source = meta.source;
    }
    if (typeof meta.round === 'number' && Number.isFinite(meta.round)) {
      normalized.round = meta.round;
    }
    if (typeof meta.p1CharId === 'string') {
      normalized.p1CharId = meta.p1CharId;
    }
    if (typeof meta.p2CharId === 'string') {
      normalized.p2CharId = meta.p2CharId;
    }
    if (typeof meta.stageId === 'string') {
      normalized.stageId = meta.stageId;
    }
    if (typeof meta.teamMode === 'boolean') {
      normalized.teamMode = meta.teamMode;
    }
    if (typeof meta.trainingMode === 'boolean') {
      normalized.trainingMode = meta.trainingMode;
    }
    return normalized;
  }
}
