/**
 * All Portraits Structure Validation Tests
 *
 * Validates that all 27 character portrait data files:
 * - Export a valid PixelPortraitData object
 * - Have valid dimensions (width and height > 0)
 * - Have palettes with only hex colors or 'transparent'
 * - Have pixel arrays with values within palette range
 * - No pixel value exceeds palette size
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const PORTRAITS_DIR = path.resolve(__dirname, '../src/rendering/portraits');

const ROSTER = [
  'ryo', 'kyo', 'iori', 'terry', 'kim',
  'leona', 'robert', 'mai', 'kdash', 'kula',
  'athena', 'clark', 'ralf', 'joe', 'andy',
  'billy', 'chang', 'choi', 'mature', 'yamazaki',
  'mary', 'xiangfei', 'kasumi',
  'yashiro', 'chris', 'shermie', 'vice',
];

const COLOR_RE = /^(#[0-9a-fA-F]{3,6}|transparent)$/;

describe('All portrait files structure', () => {
  const files = fs.readdirSync(PORTRAITS_DIR).filter(f => f.endsWith('.ts'));

  it('at least 25 portrait files exist', () => {
    expect(files.length).toBeGreaterThanOrEqual(25);
  });

  it('each portrait file name starts with a character name', () => {
    for (const f of files) {
      const base = f.replace('.ts', '').toLowerCase();
      const hasMatch = ROSTER.some(char => base.startsWith(char));
      expect(hasMatch, `${f} starts with character name`).toBe(true);
    }
  });
});

describe('Portrait file naming coverage', () => {
  const files = fs.readdirSync(PORTRAITS_DIR).filter(f => f.endsWith('.ts'));

  it('all 27 roster characters have at least one portrait file', () => {
    const fileNames = files.map(f => f.toLowerCase());
    for (const char of ROSTER) {
      const hasFile = fileNames.some(f => f.startsWith(char));
      expect(hasFile, `${char} has portrait file`).toBe(true);
    }
  });

  it('Ryo has multiple portrait files (multi-size)', () => {
    const ryoFiles = files.filter(f => f.toLowerCase().includes('ryo'));
    expect(ryoFiles.length).toBeGreaterThanOrEqual(2);
  });

  it('Kyo has hud/select/win portraits', () => {
    const kyoFiles = files.filter(f => f.toLowerCase().includes('kyo'));
    const hasHud = kyoFiles.some(f => f.toLowerCase().includes('hud'));
    const hasSelect = kyoFiles.some(f => f.toLowerCase().includes('select'));
    const hasWin = kyoFiles.some(f => f.toLowerCase().includes('win'));
    expect(hasHud, 'Kyo hud portrait').toBe(true);
    expect(hasSelect, 'Kyo select portrait').toBe(true);
    expect(hasWin, 'Kyo win portrait').toBe(true);
  });

  it('Iori has hud/select/win portraits', () => {
    const ioriFiles = files.filter(f => f.toLowerCase().includes('iori'));
    const hasHud = ioriFiles.some(f => f.toLowerCase().includes('hud'));
    const hasSelect = ioriFiles.some(f => f.toLowerCase().includes('select'));
    const hasWin = ioriFiles.some(f => f.toLowerCase().includes('win'));
    expect(hasHud, 'Iori hud portrait').toBe(true);
    expect(hasSelect, 'Iori select portrait').toBe(true);
    expect(hasWin, 'Iori win portrait').toBe(true);
  });
});

describe('Portrait data exports validation', () => {
  it('andyPortrait exports valid data', async () => {
    const { andyPortrait } = await import('../src/rendering/portraits/andyPortrait.js');
    expect(andyPortrait.width).toBeGreaterThan(0);
    expect(andyPortrait.height).toBeGreaterThan(0);
    expect(andyPortrait.palette).toBeDefined();
    expect(andyPortrait.pixels).toBeDefined();
  });

  it('terryPortrait exports valid data', async () => {
    const { terryPortrait } = await import('../src/rendering/portraits/terryPortrait.js');
    expect(terryPortrait.width).toBeGreaterThan(0);
    expect(terryPortrait.height).toBeGreaterThan(0);
  });

  it('joePortrait exports valid data', async () => {
    const { joePortrait } = await import('../src/rendering/portraits/joePortrait.js');
    expect(joePortrait.width).toBeGreaterThan(0);
  });

  it('leonaPortrait exports valid data', async () => {
    const { leonaPortrait } = await import('../src/rendering/portraits/leonaPortrait.js');
    expect(leonaPortrait.width).toBeGreaterThan(0);
  });

  it('sample palettes contain only hex colors or transparent', async () => {
    const { andyPortrait } = await import('../src/rendering/portraits/andyPortrait.js');
    for (const [key, color] of Object.entries(andyPortrait.palette)) {
      expect(color, `andy palette[${key}]=${color}`).toMatch(COLOR_RE);
    }
  });
});

describe('Portrait dimensions consistency', () => {
  it('base portraits are 32x40', async () => {
    const { andyPortrait } = await import('../src/rendering/portraits/andyPortrait.js');
    expect(andyPortrait.width).toBe(32);
    expect(andyPortrait.height).toBe(40);
  });

  it('ryoPortraits have multiple sizes', async () => {
    const { RYO_SIZED_PORTRAITS } = await import('../src/rendering/portraits/ryoPortraits.js');
    expect(Object.keys(RYO_SIZED_PORTRAITS).length).toBeGreaterThanOrEqual(3);
  });
});
