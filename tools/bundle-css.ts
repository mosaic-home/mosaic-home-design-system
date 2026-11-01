// Writes the stylesheets in dist/:
//   dist/style.css        everything (src/web/style.css with its relative @imports inlined)
//   dist/css/core.css     the built-in themes and the base styles every group relies on
//   dist/css/<group>.css  one component group alone
//   dist/css/<group>.js   a group with core and the groups it needs, for bundlers: each stylesheet is its own
//                         module, so importing several groups loads each stylesheet once, in cascade order

import { mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STYLE_GROUPS } from '../src/web/style-groups.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src/web');
const dist = join(root, 'dist');
const out = join(dist, 'css');

function inline(file: string, seen = new Set<string>()): string {
  if (seen.has(file)) return '';
  seen.add(file);
  const css = readFileSync(file, 'utf8');
  return css.replace(/@import\s+'(\.[^']+)';\n?/g, (_m, rel: string) => `/* ${relative(src, join(dirname(file), rel)).replace(/\\/g, '/')} */\n${inline(join(dirname(file), rel), seen)}\n`);
}

mkdirSync(dist, { recursive: true });
writeFileSync(join(dist, 'style.css'), inline(join(src, 'style.css')));

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const write = (name: string, text: string): void => writeFileSync(join(out, name), text);
write('core.css', `/* Mosaic Home: built-in themes and base styles. */\n${inline(join(src, 'themes.css'))}\n${inline(join(src, 'base.css'))}`);
write('core.js', `import './core.css';\n`);
write('core.d.ts', 'export {};\n');
for (const g of STYLE_GROUPS) {
  write(`${g.id}.css`, `/* Mosaic Home: ${g.id}. Load after core.css${g.needs.length ? ` and ${g.needs.join(', ')}` : ''}. */\n${inline(join(src, g.id, `${g.id}.css`))}`);
  write(`${g.id}.js`, `${['core', ...g.needs].map((n) => `import './${n}.js';\n`).join('')}import './${g.id}.css';\n`);
  write(`${g.id}.d.ts`, 'export {};\n');
}
console.log(`wrote dist/style.css and dist/css (core + ${STYLE_GROUPS.length} groups)`);
