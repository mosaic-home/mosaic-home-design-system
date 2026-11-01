import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { STYLE_GROUPS, styleGroupClosure } from './style-groups.ts';

const web = dirname(fileURLToPath(import.meta.url));
const ids = STYLE_GROUPS.map((g) => g.id);
const walk = (dir: string, test: (f: string) => boolean): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p, test) : test(f) ? [p] : [];
  });
const sources = (group: string): string[] => walk(join(web, group), (f) => /\.ts$/.test(f) && !/\.test\.ts$/.test(f));
const css = (group: string): string => walk(join(web, group), (f) => f.endsWith('.css')).map((f) => readFileSync(f, 'utf8')).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');

/** Imports that bring only helpers (no markup that needs the other group's styles). */
const HELPER_ONLY: Record<string, readonly string[]> = {
  // The forecast strip reuses the weather words and icon names; the icon tints are in data-display.css.
  'data-display': ['home'],
};

describe('style groups', () => {
  it('cover every group directory, in the order style.css imports them', () => {
    const dirs = readdirSync(web).filter((d) => statSync(join(web, d)).isDirectory() && walk(join(web, d), (f) => f === `${d}.css`).length);
    expect([...ids].sort()).toEqual(dirs.sort());
    const imports = [...readFileSync(join(web, 'style.css'), 'utf8').matchAll(/@import '\.\/([^']+)';/g)].map((m) => m[1]);
    expect(imports).toEqual(['themes.css', 'base.css', ...ids.map((g) => `${g}/${g}.css`)]);
  });

  it('list what they need before themselves', () => {
    STYLE_GROUPS.forEach((g, i) => {
      for (const n of g.needs) expect(ids.indexOf(n), `${g.id} needs ${n}`).toBeGreaterThanOrEqual(0);
      for (const n of g.needs) expect(ids.indexOf(n), `${g.id} needs ${n}, which must come first`).toBeLessThan(i);
    });
  });

  it('need every group whose components they render', () => {
    for (const g of ids) {
      const closure = styleGroupClosure(g);
      for (const file of sources(g)) {
        for (const m of readFileSync(file, 'utf8').matchAll(/from '(?:\.\.\/)+([a-z-]+)\//g)) {
          const other = m[1]!;
          if (other === g || !ids.includes(other) || HELPER_ONLY[g]?.includes(other)) continue;
          expect(closure, `${file} imports from ${other}`).toContain(other);
        }
      }
    }
  });

  it('need every group whose classes they use', () => {
    // A block belongs to the groups whose stylesheets start a rule with it.
    const owners = new Map<string, Set<string>>();
    for (const g of ids)
      for (const m of css(g).matchAll(/(?:^|[},])\s*\.(mh-[a-z0-9-]+?)(?=__|--|[\s.:,[{>+~)])/g)) {
        if (!owners.has(m[1]!)) owners.set(m[1]!, new Set());
        owners.get(m[1]!)!.add(g);
      }
    for (const g of ids) {
      const closure = new Set(styleGroupClosure(g));
      for (const file of sources(g))
        for (const m of readFileSync(file, 'utf8').matchAll(/['` ](mh-[a-z0-9-]+?)(?=__|--|['` $])/g)) {
          const own = owners.get(m[1]!);
          if (!own || own.has(g)) continue;
          expect([...own].some((o) => closure.has(o)), `${file} uses .${m[1]} from ${[...own].join(', ')}`).toBe(true);
        }
    }
  });

  it('closes over what each group needs, in cascade order', () => {
    expect(styleGroupClosure('pickers')).toEqual(['actions', 'choice-inputs', 'text-inputs', 'overlays', 'pickers']);
    expect(styleGroupClosure('charts')).toEqual(['charts']);
  });
});
