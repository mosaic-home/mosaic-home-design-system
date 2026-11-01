// Builds the demo site (the explorer: showcase, component gallery, theme studio) into docs/, which GitHub Pages
// serves from the main branch. docs/ also holds the hand-written guides (*.md); only the site's own files are
// replaced. `node tools/build-demo.ts --check` builds to a temporary folder and fails when docs/ differs.

import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const explorer = join(root, 'explorer');
const docs = join(root, 'docs');
const check = process.argv.includes('--check');

/** The files and folders a build writes; everything else in docs/ is left alone. */
const PAGES = ['index.html', 'components.html', 'themes.html'];
const OWNED = [...PAGES, 'assets', '.nojekyll'];

const walk = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir).flatMap((f) => {
        const p = join(dir, f);
        return statSync(p).isDirectory() ? walk(p) : [p];
      })
    : [];
const siteFiles = (dir: string): Map<string, string> =>
  new Map(
    OWNED.flatMap((o) => (statSync(join(dir, o), { throwIfNoEntry: false })?.isDirectory() ? walk(join(dir, o)) : existsSync(join(dir, o)) ? [join(dir, o)] : [])).map(
      (p) => [relative(dir, p).replace(/\\/g, '/'), readFileSync(p, 'latin1')],
    ),
  );

async function buildTo(out: string): Promise<void> {
  for (const o of OWNED) rmSync(join(out, o), { recursive: true, force: true });
  await build({ configFile: join(explorer, 'vite.config.ts'), root: explorer, logLevel: 'warn', build: { outDir: out, emptyOutDir: false } });
  // Served as plain files: no site generator runs over them.
  writeFileSync(join(out, '.nojekyll'), '');
}

if (check) {
  const temp = mkdtempSync(join(tmpdir(), 'mosaic-demo-'));
  try {
    await buildTo(temp);
    const want = siteFiles(temp);
    const have = siteFiles(docs);
    const stale = [...new Set([...want.keys(), ...have.keys()])].filter((f) => want.get(f) !== have.get(f));
    if (stale.length) {
      for (const f of stale) console.error(`docs/${f} is ${want.has(f) ? (have.has(f) ? 'out of date' : 'missing') : 'left over'}`);
      console.error('Run `npm run demo`.');
      process.exitCode = 1;
    } else console.log('demo is up to date');
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
} else {
  await buildTo(docs);
  const files = siteFiles(docs);
  const bytes = [...files.values()].reduce((n, t) => n + t.length, 0);
  console.log(`wrote docs/: ${files.size} files, ${(bytes / 1024).toFixed(0)} KB`);
}
