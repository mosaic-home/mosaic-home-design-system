// The component groups' stylesheets, in cascade order, and the groups each one needs: a group needs another when
// its components render that group's components or classes. style.css imports them in this order, and the build
// writes `css/<group>.css` (the group alone) and `css/<group>.js` (the group with everything it needs, once each,
// in this order) from it. style-groups.test.ts checks both against the source.

export interface StyleGroup {
  id: string;
  /** Groups whose stylesheets must load before this one; each comes earlier in `STYLE_GROUPS`. */
  needs: readonly string[];
}

export const STYLE_GROUPS: readonly StyleGroup[] = [
  { id: 'actions', needs: [] },
  { id: 'choice-inputs', needs: [] },
  { id: 'text-inputs', needs: ['actions', 'choice-inputs'] },
  { id: 'overlays', needs: ['actions'] },
  { id: 'pickers', needs: ['actions', 'text-inputs', 'overlays'] },
  { id: 'navigation', needs: ['actions'] },
  { id: 'feedback', needs: ['actions'] },
  { id: 'foundations', needs: ['feedback'] },
  { id: 'data-display', needs: ['actions', 'choice-inputs'] },
  { id: 'charts', needs: [] },
  { id: 'media', needs: ['actions', 'choice-inputs'] },
  { id: 'layout', needs: ['actions'] },
  { id: 'home', needs: ['actions', 'choice-inputs', 'text-inputs', 'feedback', 'data-display', 'charts', 'layout'] },
];

/** A group and everything it needs, in cascade order. */
export function styleGroupClosure(id: string): string[] {
  const want = new Set<string>();
  const add = (g: string): void => {
    if (want.has(g)) return;
    want.add(g);
    for (const n of STYLE_GROUPS.find((s) => s.id === g)?.needs ?? []) add(n);
  };
  add(id);
  return STYLE_GROUPS.map((g) => g.id).filter((g) => want.has(g));
}
