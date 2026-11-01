import { mdiPower } from '@mdi/js';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ICONS } from './icon-set.ts';
import { createIcon, iconPath, registerIcons } from './icons.ts';

const src = join(dirname(fileURLToPath(import.meta.url)), '..');
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f) ? [p] : [];
  });
const names = Object.keys(ICONS).join('|');
/** A short name in an icon position: `icon: 'x'`, `icon="x"`, `createIcon('x'`, `?? 'x'` after an icon. */
const SHORT = new RegExp(String.raw`(\b\w*[iI]con\w*\s*(?:[:=]|\?\?)\s*\{?\s*|createIcon\(\s*)(['"])(${names})\2`);

afterEach(() => vi.restoreAllMocks());

describe('icon names', () => {
  it('are never used by components themselves, so a bundle holds only the icons it draws', () => {
    const found: string[] = [];
    for (const file of [...walk(join(src, 'web')), ...walk(join(src, 'react'))]) {
      if (/icon-set\.ts$/.test(file)) continue;
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (SHORT.test(line) && !/^\s*(\/\/|\*)/.test(line)) found.push(`${file.slice(src.length + 1)}:${i + 1}`);
        });
    }
    expect(found).toEqual([]);
  });

  it('resolve once registered, and paths pass through', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(iconPath(mdiPower)).toBe(mdiPower);
    expect(iconPath('studio-lamp')).toBe('');
    expect(warn).toHaveBeenCalledTimes(1);
    registerIcons({ 'studio-lamp': mdiPower });
    expect(createIcon('studio-lamp').querySelector('path')!.getAttribute('d')).toBe(mdiPower);
  });
});
