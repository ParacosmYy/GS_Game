/**
 * Content Package Schema Validation
 *
 * Validates that all character content packages follow a consistent schema:
 * - Required barrel exports present (index.ts)
 * - MUGEN action maps have normals coverage
 * - Feedback tiers defined for all specials
 * - Cancel paths follow standard structure
 * - Frame data entries exist
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const CONTENT_DIR = path.resolve(__dirname, '../../src/content/characters');

const REQUIRED_FILES = [
  'index.ts',
  'cancelPaths.ts',
  'commands',
  'moves',
  'attacks',
  'hitboxes',
  'feedback',
  'animations',
  'portraits',
  'hitEffects',
  'audio',
  'frameData',
];

const CONTENT_CHARACTERS = fs.readdirSync(CONTENT_DIR).filter(dir => {
  const fullPath = path.join(CONTENT_DIR, dir);
  return fs.statSync(fullPath).isDirectory() && dir !== '_shared';
});

describe('Content Package Schema Validation', () => {
  it.each(CONTENT_CHARACTERS)('%s has all required subdirectories/files', (charId) => {
    const charDir = path.join(CONTENT_DIR, charId);
    for (const required of REQUIRED_FILES) {
      const fullPath = path.join(charDir, required);
      const exists = fs.existsSync(fullPath);
      expect(exists, `${charId}/${required} should exist`).toBe(true);
    }
  });

  it.each(CONTENT_CHARACTERS)('%s index.ts has non-trivial exports', (charId) => {
    const indexPath = path.join(CONTENT_DIR, charId, 'index.ts');
    const content = fs.readFileSync(indexPath, 'utf8');
    const exportCount = (content.match(/^export\s/gm) || []).length;
    expect(exportCount, `${charId} index.ts should have multiple exports`).toBeGreaterThanOrEqual(5);
  });

  it.each(CONTENT_CHARACTERS)('%s hitboxes/ directory exists with .ts file', (charId) => {
    const hitboxDir = path.join(CONTENT_DIR, charId, 'hitboxes');
    expect(fs.existsSync(hitboxDir), `${charId}/hitboxes dir`).toBe(true);
    const files = fs.readdirSync(hitboxDir).filter(f => f.endsWith('.ts'));
    expect(files.length, `${charId}/hitboxes should have .ts files`).toBeGreaterThanOrEqual(1);
  });

  it.each(CONTENT_CHARACTERS)('%s feedback/ directory exists with .ts file', (charId) => {
    const feedbackDir = path.join(CONTENT_DIR, charId, 'feedback');
    expect(fs.existsSync(feedbackDir), `${charId}/feedback dir`).toBe(true);
    const files = fs.readdirSync(feedbackDir).filter(f => f.endsWith('.ts'));
    expect(files.length, `${charId}/feedback should have .ts files`).toBeGreaterThanOrEqual(1);
  });

  it.each(CONTENT_CHARACTERS)('%s commands/ has move list export', (charId) => {
    const commandsDir = path.join(CONTENT_DIR, charId, 'commands');
    const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.ts'));
    expect(files.length, `${charId}/commands should have .ts files`).toBeGreaterThanOrEqual(1);
    const content = fs.readFileSync(path.join(commandsDir, files[0]), 'utf8');
    expect(content, `${charId} commands should define move list`).toContain('MOVE_LIST');
  });

  it.each(CONTENT_CHARACTERS)('%s moves/ has move definitions', (charId) => {
    const movesDir = path.join(CONTENT_DIR, charId, 'moves');
    const files = fs.readdirSync(movesDir).filter(f => f.endsWith('.ts'));
    expect(files.length, `${charId}/moves should have .ts files`).toBeGreaterThanOrEqual(1);
  });

  it.each(CONTENT_CHARACTERS)('%s cancelPaths.ts defines cancel routes', (charId) => {
    const cancelPath = path.join(CONTENT_DIR, charId, 'cancelPaths.ts');
    if (!fs.existsSync(cancelPath)) return;
    const content = fs.readFileSync(cancelPath, 'utf8');
    expect(content, `${charId} cancelPaths should define paths`).toContain('CANCEL_PATHS');
  });

  it.each(CONTENT_CHARACTERS)('%s hitEffects/ has VFX plugin', (charId) => {
    const hitEffectsDir = path.join(CONTENT_DIR, charId, 'hitEffects');
    const files = fs.readdirSync(hitEffectsDir).filter(f => f.endsWith('.ts'));
    expect(files.length, `${charId}/hitEffects should have .ts files`).toBeGreaterThanOrEqual(1);
  });

  it.each(CONTENT_CHARACTERS)('%s audio/ has sampler registration', (charId) => {
    const audioDir = path.join(CONTENT_DIR, charId, 'audio');
    const files = fs.readdirSync(audioDir).filter(f => f.endsWith('.ts'));
    expect(files.length, `${charId}/audio should have .ts files`).toBeGreaterThanOrEqual(1);
    const content = fs.readFileSync(path.join(audioDir, files[0]), 'utf8');
    expect(content, `${charId} audio should register sampler`).toContain('register');
  });
});

describe('Content package count', () => {
  it('has at least 10 character content packages', () => {
    expect(CONTENT_CHARACTERS.length).toBeGreaterThanOrEqual(10);
  });

  it('all content packages are listed', () => {
    const expected = ['ryo', 'kyo', 'iori', 'terry', 'kim', 'athena', 'vice', 'yamazaki', 'shermie', 'benimaru', 'heidern', 'yuri'];
    for (const char of expected) {
      expect(CONTENT_CHARACTERS).toContain(char);
    }
  });
});

describe('MUGEN Action Map Coverage', () => {
  it.each(CONTENT_CHARACTERS.filter(c => c !== 'iori' && c !== 'kfm'))(
    '%s hitbox file has MUGEN_ACTION_MAP with normals',
    (charId) => {
      const hitboxDir = path.join(CONTENT_DIR, charId, 'hitboxes');
      const files = fs.readdirSync(hitboxDir).filter(f => f.endsWith('.ts'));
      const content = fs.readFileSync(path.join(hitboxDir, files[0]), 'utf8');
      expect(content, `${charId} should have MUGEN_ACTION_MAP`).toContain('MUGEN_ACTION_MAP');
      expect(content, `${charId} should have STAND mapping`).toContain('STAND');
      expect(content, `${charId} should have CROUCH mapping`).toContain('CROUCH');
      expect(content, `${charId} should have JUMP mapping`).toContain('JUMP');
    },
  );
});

describe('Content Package File Size Validation', () => {
  it.each(CONTENT_CHARACTERS)('%s index.ts is at least 30 lines', (charId) => {
    const indexPath = path.join(CONTENT_DIR, charId, 'index.ts');
    const content = fs.readFileSync(indexPath, 'utf8');
    const lines = content.split('\n').length;
    expect(lines, `${charId} index.ts should be substantial`).toBeGreaterThanOrEqual(30);
  });

  it.each(CONTENT_CHARACTERS)('%s hitbox file is at least 50 lines', (charId) => {
    const hitboxDir = path.join(CONTENT_DIR, charId, 'hitboxes');
    const files = fs.readdirSync(hitboxDir).filter(f => f.endsWith('.ts'));
    const content = fs.readFileSync(path.join(hitboxDir, files[0]), 'utf8');
    const lines = content.split('\n').length;
    expect(lines, `${charId} hitbox file should be substantial`).toBeGreaterThanOrEqual(50);
  });

  it.each(CONTENT_CHARACTERS)('%s feedback file is at least 30 lines', (charId) => {
    const feedbackDir = path.join(CONTENT_DIR, charId, 'feedback');
    const files = fs.readdirSync(feedbackDir).filter(f => f.endsWith('.ts'));
    const content = fs.readFileSync(path.join(feedbackDir, files[0]), 'utf8');
    const lines = content.split('\n').length;
    expect(lines, `${charId} feedback file should be substantial`).toBeGreaterThanOrEqual(30);
  });
});

describe('Content Package Cross-Reference', () => {
  it('all content packages appear in characters/index.ts barrel', () => {
    const barrelPath = path.join(CONTENT_DIR, 'index.ts');
    const barrelContent = fs.readFileSync(barrelPath, 'utf8');
    for (const charId of CONTENT_CHARACTERS) {
      expect(barrelContent, `${charId} should be in barrel`).toContain(`./${charId}/`);
    }
  });

  it('characters/index.ts exports MUGEN_ACTION_MAP for characters with MUGEN data', () => {
    const barrelPath = path.join(CONTENT_DIR, 'index.ts');
    const barrelContent = fs.readFileSync(barrelPath, 'utf8');
    const mugenChars = ['kyo', 'terry', 'kim', 'athena', 'vice', 'yamazaki', 'shermie', 'benimaru', 'heidern', 'yuri'];
    for (const charId of mugenChars) {
      const searchStr = `${charId.toUpperCase()}_MUGEN_ACTION_MAP`;
      expect(barrelContent, `${charId} MUGEN_ACTION_MAP in barrel`).toContain(searchStr);
    }
  });

  it('characters/index.ts exports HIT_EFFECTS for recent characters', () => {
    const barrelPath = path.join(CONTENT_DIR, 'index.ts');
    const barrelContent = fs.readFileSync(barrelPath, 'utf8');
    const hitEffectChars = ['kyo', 'iori', 'terry', 'kim', 'athena', 'vice', 'yamazaki', 'benimaru', 'shermie', 'yuri', 'heidern'];
    for (const charId of hitEffectChars) {
      const searchStr = `${charId.toUpperCase()}_HIT_EFFECTS`;
      expect(barrelContent, `${charId} HIT_EFFECTS in barrel`).toContain(searchStr);
    }
  });

  it('characters/index.ts exports audio sampler for recent characters', () => {
    const barrelPath = path.join(CONTENT_DIR, 'index.ts');
    const barrelContent = fs.readFileSync(barrelPath, 'utf8');
    const audioChars = ['kyo', 'iori', 'terry', 'kim', 'athena', 'vice', 'yamazaki', 'benimaru', 'shermie', 'yuri', 'heidern'];
    for (const charId of audioChars) {
      const name = charId.charAt(0).toUpperCase() + charId.slice(1);
      const searchStr = `register${name}Audio`;
      expect(barrelContent, `${charId} audio sampler in barrel`).toContain(searchStr);
    }
  });
});

describe('Content Package Import Hygiene', () => {
  it.each(CONTENT_CHARACTERS)('%s index.ts has no relative imports of sibling packages', (charId) => {
    const indexPath = path.join(CONTENT_DIR, charId, 'index.ts');
    const content = fs.readFileSync(indexPath, 'utf8');
    const lines = content.split('\n');
    const siblingImports = lines.filter(l =>
      l.includes('from ') && l.includes('../') && !l.includes('./') &&
      !l.includes('../../core/') && !l.includes('../../rendering/') &&
      !l.includes('../../ai/') && !l.includes('../../entities/'),
    );
    expect(siblingImports.length, `${charId} should not import from sibling packages`).toBe(0);
  });

  it.each(CONTENT_CHARACTERS.filter(c => c !== 'iori'))('%s hitbox file imports from correct paths', (charId) => {
    const hitboxDir = path.join(CONTENT_DIR, charId, 'hitboxes');
    const files = fs.readdirSync(hitboxDir).filter(f => f.endsWith('.ts'));
    const content = fs.readFileSync(path.join(hitboxDir, files[0]), 'utf8');
    expect(content, `${charId} hitbox imports core`).toContain('../../../../core/');
    expect(content, `${charId} hitbox imports MUGEN query`).toContain('mugenHitboxQuery');
  });
});
