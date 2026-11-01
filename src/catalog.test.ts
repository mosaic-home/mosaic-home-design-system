import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CATALOG, GROUPS, WEB_READY } from './catalog.ts';
import { STORIES } from '../explorer/src/stories/index.ts';

describe('catalog', () => {
  it('has unique ids in known groups', () => {
    expect(new Set(CATALOG.map((e) => e.id)).size).toBe(CATALOG.length);
    const groups = new Set(GROUPS.map((g) => g.id));
    for (const e of CATALOG) expect(groups.has(e.group), e.id).toBe(true);
  });

  it('marks only catalogue entries as ready', () => {
    const ids = new Set(CATALOG.map((e) => e.id));
    for (const id of WEB_READY) expect(ids.has(id), id).toBe(true);
  });

  it('has an explorer story for every ready web component, and none for unbuilt ones', () => {
    const stories = new Set(STORIES.map((s) => s.id));
    for (const id of WEB_READY) expect(stories.has(id), `story for ${id}`).toBe(true);
    for (const id of stories) expect(WEB_READY.has(id), `${id} has a story but is not in WEB_READY`).toBe(true);
  });

  it('has example code, through the package entry points only, for every ready web component', () => {
    const examples = join(dirname(fileURLToPath(import.meta.url)), '../explorer/examples');
    const file = (kind: 'web' | 'react', id: string): string => join(examples, kind, `${id}.${kind === 'web' ? 'ts' : 'tsx'}`);
    for (const id of WEB_READY)
      for (const kind of ['web', 'react'] as const) {
        const url = file(kind, id);
        expect(existsSync(url), `${kind} example for ${id}`).toBe(true);
        if (!existsSync(url)) continue;
        for (const m of readFileSync(url, 'utf8').matchAll(/from '([^']+)'/g)) expect(m[1], `${kind}/${id} imports ${m[1]}`).toMatch(/^(@mosaic-home\/design-system\/(web|react|tokens)|@mdi\/js|react)$/);
      }
  });
});
