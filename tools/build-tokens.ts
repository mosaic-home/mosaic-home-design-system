// Writes the generated files from src/tokens and src/catalog.ts:
//   src/web/themes.css             CSS variables for the built-in themes and device classes
//   tokens/mosaic-home.tokens.json themes and scales as data, for other renderers (the LVGL kit imports it)
//   tokens/catalog.json            the component catalogue, with each renderer's status
// `--check` fails instead of writing when a file is out of date (CI).

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATALOG, GROUPS, WEB_READY } from '../src/catalog.ts';
import { exportTokens, themesStylesheet } from '../src/tokens/index.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');

const files: Record<string, string> = {
  'src/web/themes.css': themesStylesheet(),
  'tokens/mosaic-home.tokens.json': `${JSON.stringify(exportTokens(), null, 2)}\n`,
  'tokens/catalog.json': `${JSON.stringify(
    { groups: GROUPS, entries: CATALOG.map((e) => ({ ...e, web: WEB_READY.has(e.id) })) },
    null,
    2,
  )}\n`,
};

let stale = 0;
for (const [rel, content] of Object.entries(files)) {
  const path = join(root, rel);
  let current = '';
  try {
    current = readFileSync(path, 'utf8');
  } catch {
    // missing: written below, or stale in --check
  }
  if (current === content) continue;
  if (check) {
    console.error(`${rel} is out of date: run npm run tokens`);
    stale++;
    continue;
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  console.log(`wrote ${rel}`);
}
if (stale) process.exit(1);
