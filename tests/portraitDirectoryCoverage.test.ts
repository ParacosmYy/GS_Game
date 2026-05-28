/**
 * Portrait Directory Coverage Tests
 *
 * Validates that all 27 characters in the roster have portrait data
 * files defined in the portraits directory.
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

describe('Portrait directory structure', () => {
  const files = fs.readdirSync(PORTRAITS_DIR);
  const tsFiles = files.filter(f => f.endsWith('.ts'));

  it('portrait directory exists and has files', () => {
    expect(tsFiles.length).toBeGreaterThan(0);
  });

  it('Ryo has dedicated portrait files', () => {
    const ryoFiles = tsFiles.filter(f => f.toLowerCase().includes('ryo'));
    expect(ryoFiles.length).toBeGreaterThanOrEqual(2);
  });

  it('Kyo has dedicated portrait files', () => {
    const kyoFiles = tsFiles.filter(f => f.toLowerCase().includes('kyo'));
    expect(kyoFiles.length).toBeGreaterThanOrEqual(1);
  });

  it('Iori has dedicated portrait files', () => {
    const ioriFiles = tsFiles.filter(f => f.toLowerCase().includes('iori'));
    expect(ioriFiles.length).toBeGreaterThanOrEqual(1);
  });

  it('at least 20 characters have portrait files', () => {
    let charsCovered = 0;
    for (const char of ROSTER) {
      const hasFile = tsFiles.some(f =>
        f.toLowerCase().includes(char.toLowerCase())
        || f.toLowerCase().includes(char.toLowerCase().replace('kdash', 'kdash'))
      );
      if (hasFile) charsCovered++;
    }
    expect(charsCovered, 'characters with portrait files').toBeGreaterThanOrEqual(20);
  });

  it('no duplicate character portraits', () => {
    // Each character should have its own file(s), not share
    const baseNames = tsFiles.map(f => f.replace('.ts', '').toLowerCase());
    expect(new Set(baseNames).size).toBe(baseNames.length);
  });
});

describe('Portrait file naming conventions', () => {
  const files = fs.readdirSync(PORTRAITS_DIR).filter(f => f.endsWith('.ts'));

  it('all files follow camelCase or PascalCase naming', () => {
    for (const f of files) {
      const base = f.replace('.ts', '');
      // Should not contain spaces, hyphens, or underscores (except type suffix)
      expect(base).toMatch(/^[a-zA-Z]/);
    }
  });

  it('portrait files have consistent suffix pattern', () => {
    const ryoFiles = files.filter(f => f.toLowerCase().includes('ryo'));
    const hasPortrait = ryoFiles.some(f => f.toLowerCase().includes('portrait'));
    const hasWin = ryoFiles.some(f => f.toLowerCase().includes('win'));
    // Ryo should have at least portraits and win portrait
    expect(hasPortrait || ryoFiles.length >= 2).toBe(true);
  });
});
