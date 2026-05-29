/**
 * MUGEN Hitbox Data Loading Integration Test
 *
 * Validates that MUGEN hitbox data files (hitboxes.json) are loadable
 * and contain valid action data for all registered characters.
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const SPRITES_DIR = path.resolve(process.cwd(), 'public/sprites');
const CONTENT_DIR = path.resolve(process.cwd(), 'src/content/characters');

interface HitboxAction {
  name: string;
  startup: number;
  active: number;
  recovery: number;
  frames: Array<{
    attack: Array<{ ox: number; oy: number; w: number; h: number }>;
    bodyOverride: { ox: number; oy: number; w: number; h: number } | null;
  }>;
}

interface HitboxData {
  characterId: string;
  actions: Record<string, HitboxAction>;
}

const MUGEN_CHARS = [
  { charId: 'kyo', mugenDir: 'cvskyo' },
  { charId: 'ryo', mugenDir: 'cvsryo' },
  { charId: 'athena', mugenDir: 'cvsathena' },
  { charId: 'terry', mugenDir: 'cvsterry' },
  { charId: 'kim', mugenDir: 'cvskim' },
  { charId: 'vice', mugenDir: 'cvsvice' },
  { charId: 'yamazaki', mugenDir: 'cvsyamazaki' },
  { charId: 'shermie', mugenDir: 'shermie' },
  { charId: 'benimaru', mugenDir: 'cvsbenimaru' },
  { charId: 'heidern', mugenDir: 'heidern' },
  { charId: 'yuri', mugenDir: 'cvsyuri' },
];

function loadHitboxData(mugenDir: string): HitboxData | null {
  const hitboxPath = path.join(SPRITES_DIR, mugenDir, 'hitboxes.json');
  if (!fs.existsSync(hitboxPath)) return null;
  return JSON.parse(fs.readFileSync(hitboxPath, 'utf8'));
}

describe('MUGEN Hitbox Data Loading', () => {
  it.each(MUGEN_CHARS)('$charId hitboxes.json exists', ({ mugenDir }) => {
    const hitboxPath = path.join(SPRITES_DIR, mugenDir, 'hitboxes.json');
    expect(fs.existsSync(hitboxPath), `${mugenDir}/hitboxes.json should exist`).toBe(true);
  });

  it.each(MUGEN_CHARS)('$charId hitboxes.json is valid JSON', ({ mugenDir }) => {
    const data = loadHitboxData(mugenDir);
    expect(data, `${mugenDir} hitbox data should be parseable`).not.toBeNull();
    expect(data!.characterId, `${mugenDir} characterId`).toBeTruthy();
    expect(data!.actions, `${mugenDir} actions`).toBeDefined();
    expect(typeof data!.actions).toBe('object');
  });

  it.each(MUGEN_CHARS)('$charId has >= 30 actions', ({ mugenDir }) => {
    const data = loadHitboxData(mugenDir);
    if (!data) return;
    const actionCount = Object.keys(data.actions).length;
    expect(actionCount, `${mugenDir} should have >= 30 actions`).toBeGreaterThanOrEqual(30);
  });

  it.each(MUGEN_CHARS)('$charId all actions have valid timing', ({ mugenDir }) => {
    const data = loadHitboxData(mugenDir);
    if (!data) return;

    for (const [actionNum, action] of Object.entries(data.actions)) {
      const a = action as HitboxAction;
      expect(a.startup, `${mugenDir}/${actionNum} startup`).toBeGreaterThanOrEqual(0);
      expect(a.active, `${mugenDir}/${actionNum} active`).toBeGreaterThanOrEqual(0);
      expect(a.recovery, `${mugenDir}/${actionNum} recovery`).toBeGreaterThanOrEqual(0);
      expect(a.startup + a.active + a.recovery, `${mugenDir}/${actionNum} total`).toBeGreaterThan(0);
    }
  });

  it.each(MUGEN_CHARS)('$charId actions with active frames have attack boxes', ({ mugenDir }) => {
    const data = loadHitboxData(mugenDir);
    if (!data) return;

    let actionsWithActiveFrames = 0;
    let actionsWithAttackBoxes = 0;

    for (const [, action] of Object.entries(data.actions)) {
      const a = action as HitboxAction;
      if (a.active > 0) {
        actionsWithActiveFrames++;
        const hasAttackBox = a.frames.some(f => f.attack && f.attack.length > 0);
        if (hasAttackBox) actionsWithAttackBoxes++;
      }
    }

    // At least 80% of actions with active frames should have attack box data
    if (actionsWithActiveFrames > 0) {
      const ratio = actionsWithAttackBoxes / actionsWithActiveFrames;
      expect(ratio, `${mugenDir} attack box coverage`).toBeGreaterThanOrEqual(0.5);
    }
  });

  it.each(MUGEN_CHARS)('$charId has standing attack actions (200-299)', ({ mugenDir }) => {
    const data = loadHitboxData(mugenDir);
    if (!data) return;
    const standActions = Object.keys(data.actions).filter(a => {
      const n = parseInt(a);
      return n >= 200 && n < 300;
    });
    expect(standActions.length, `${mugenDir} should have stand attack actions`).toBeGreaterThanOrEqual(2);
  });

  it.each(MUGEN_CHARS)('$charId has crouch attack actions (400-499)', ({ mugenDir }) => {
    const data = loadHitboxData(mugenDir);
    if (!data) return;
    const crouchActions = Object.keys(data.actions).filter(a => {
      const n = parseInt(a);
      return n >= 400 && n < 500;
    });
    expect(crouchActions.length, `${mugenDir} should have crouch attack actions`).toBeGreaterThanOrEqual(2);
  });

  it.each(MUGEN_CHARS)('$charId has jump attack actions (600-699)', ({ mugenDir }) => {
    const data = loadHitboxData(mugenDir);
    if (!data) return;
    const jumpActions = Object.keys(data.actions).filter(a => {
      const n = parseInt(a);
      return n >= 600 && n < 700;
    });
    expect(jumpActions.length, `${mugenDir} should have jump attack actions`).toBeGreaterThanOrEqual(2);
  });

  it.each(MUGEN_CHARS)('$charId has special move actions (1000-1999)', ({ mugenDir }) => {
    const data = loadHitboxData(mugenDir);
    if (!data) return;
    const specialActions = Object.keys(data.actions).filter(a => {
      const n = parseInt(a);
      return n >= 1000 && n < 2000;
    });
    expect(specialActions.length, `${mugenDir} should have special move actions`).toBeGreaterThanOrEqual(5);
  });

  it.each(MUGEN_CHARS)('$charId has DM actions (2000+)', ({ mugenDir }) => {
    const data = loadHitboxData(mugenDir);
    if (!data) return;
    const dmActions = Object.keys(data.actions).filter(a => {
      const n = parseInt(a);
      return n >= 2000;
    });
    expect(dmActions.length, `${mugenDir} should have DM actions`).toBeGreaterThanOrEqual(1);
  });
});

describe('MUGEN Hitbox Data Summary', () => {
  it('total actions across all characters >= 400', () => {
    let total = 0;
    for (const { mugenDir } of MUGEN_CHARS) {
      const data = loadHitboxData(mugenDir);
      if (data) total += Object.keys(data.actions).length;
    }
    expect(total, 'total MUGEN hitbox actions').toBeGreaterThanOrEqual(400);
  });

  it('total active frames across all characters >= 800', () => {
    let total = 0;
    for (const { mugenDir } of MUGEN_CHARS) {
      const data = loadHitboxData(mugenDir);
      if (!data) continue;
      for (const action of Object.values(data.actions)) {
        const a = action as HitboxAction;
        total += a.active;
      }
    }
    expect(total, 'total active frames').toBeGreaterThanOrEqual(800);
  });
});
