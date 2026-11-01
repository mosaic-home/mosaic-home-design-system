import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { createAccordion, createDataTable, createQrCode, createTree, encodeQr, type DataTableColumn, type TreeNode } from '../web/index.ts';
import { Accordion, DataTable, QrCode, Tree } from './index.ts';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** Tag, classes, role, ARIA, `hidden`, `tabindex`, SVG geometry and own text of every element, in document order. */
function shape(root: Element): string[] {
  const out: string[] = [];
  const walk = (el: Element): void => {
    const attrs = Array.from(el.attributes)
      .filter((a) => ['class', 'role', 'hidden', 'tabindex', 'scope', 'colspan', 'd', 'viewBox', 'width', 'height'].includes(a.name) || a.name.startsWith('aria-'))
      .map((a) => `${a.name}=${a.value}`)
      .sort();
    const text = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent)
      .join('');
    out.push(`${el.tagName.toLowerCase()} ${attrs.join(' ')} ${text}`.trim());
    Array.from(el.children).forEach(walk);
  };
  walk(root);
  return out;
}

/** Generated ids differ between renderers; compare the wiring instead (every reference resolves inside the root). */
function wiring(root: Element): void {
  for (const el of root.querySelectorAll('[aria-controls], [aria-labelledby]')) {
    for (const attr of ['aria-controls', 'aria-labelledby']) {
      const id = el.getAttribute(attr);
      if (id) expect(root.querySelector(`[id="${id}"]`), `${attr}=${id}`).not.toBeNull();
    }
  }
}

function react(node: ReactElement): Element {
  const div = document.createElement('div');
  div.innerHTML = renderToStaticMarkup(node);
  return div.firstElementChild!;
}

const noIds = (lines: string[]): string[] => lines.map((l) => l.replace(/aria-(controls|labelledby)=\S+/g, 'aria-$1=#'));

const mounted: { root: Root; host: HTMLElement }[] = [];
function mount(node: ReactElement): HTMLElement {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  act(() => root.render(node));
  mounted.push({ root, host });
  return host;
}
afterEach(() => {
  for (const { root, host } of mounted.splice(0)) {
    act(() => root.unmount());
    host.remove();
  }
});

const key = (target: Element, k: string): void => {
  act(() => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
  });
};

const nodes: TreeNode[] = [
  {
    id: 'home',
    label: 'Home',
    icon: 'home',
    children: [
      { id: 'kitchen', label: 'Kitchen', meta: '2', children: [{ id: 'k1', label: 'Ceiling' }, { id: 'k2', label: 'Strip' }] },
      { id: 'garage', label: 'Garage', disabled: true },
    ],
  },
  { id: 'garden', label: 'Garden' },
];

interface Device {
  id: string;
  name: string;
  battery: number | null;
}
const rows: Device[] = [
  { id: 'd1', name: 'Hall sensor', battery: 82 },
  { id: 'd2', name: 'Door lock', battery: 9 },
  { id: 'd3', name: 'Desk lamp', battery: null },
];
const columns: Omit<DataTableColumn<Device>, 'render'>[] = [
  { id: 'name', label: 'Name', sortable: true, resizable: true, width: 180 },
  { id: 'battery', label: 'Battery', align: 'end', sortable: true },
];

describe('data-display parity', () => {
  it('Accordion', () => {
    const sections = [
      { id: 'a', title: 'Lights', subtitle: '4 on', icon: 'lightbulb', meta: '4' },
      { id: 'b', title: 'Climate' },
      { id: 'c', title: 'Locked', disabled: true },
    ];
    const r = react(<Accordion sections={sections.map((s) => ({ ...s, content: 'Body' }))} defaultOpen={['a']} variant="separated" headingLevel={2} />);
    const w = createAccordion({ sections: sections.map((s) => ({ ...s, content: 'Body' })), open: ['a'], variant: 'separated', headingLevel: 2 }).el;
    expect(noIds(shape(r))).toEqual(noIds(shape(w)));
    wiring(r);
    wiring(w);
    expect(noIds(shape(react(<Accordion sections={sections} mode="single" required />)))).toEqual(noIds(shape(createAccordion({ sections, mode: 'single', required: true }).el)));
  });

  it('Tree', () => {
    expect(shape(react(<Tree nodes={nodes} label="Rooms" defaultExpanded={['home']} defaultSelected="kitchen" />))).toEqual(
      shape(createTree({ nodes, label: 'Rooms', expanded: ['home'], selected: 'kitchen' }).el),
    );
    expect(shape(react(<Tree nodes={nodes} checkable dense defaultExpanded={['home', 'kitchen']} defaultChecked={['k1']} />))).toEqual(
      shape(createTree({ nodes, checkable: true, dense: true, expanded: ['home', 'kitchen'], checked: ['k1'] }).el),
    );
  });

  it('DataTable', () => {
    const r = react(<DataTable columns={columns} rows={rows} rowId={(d) => d.id} label="Devices" selectable defaultSelected={['d2']} defaultSort={{ column: 'battery', direction: 'descending' }} dense stickyColumn />);
    const w = createDataTable({ columns, rows, rowId: (d) => d.id, label: 'Devices', selectable: true, selected: ['d2'], sort: { column: 'battery', direction: 'descending' }, dense: true, stickyColumn: true }).el;
    expect(noIds(shape(r))).toEqual(noIds(shape(w)));
    wiring(r);
    expect(noIds(shape(react(<DataTable columns={columns} rows={[]} rowId={(d) => d.id} label="Devices" showCaption empty="No devices" />)))).toEqual(
      noIds(shape(createDataTable({ columns, rows: [], rowId: (d) => d.id, label: 'Devices', showCaption: true, empty: 'No devices' }).el)),
    );
  });

  it('QrCode', () => {
    expect(shape(react(<QrCode value="https://example.com/pair" label="Pair" caption="Scan me" size="small" ecc="Q" />))).toEqual(
      shape(createQrCode({ value: 'https://example.com/pair', label: 'Pair', caption: 'Scan me', size: 'small', ecc: 'Q' }).el),
    );
    const r = react(<QrCode value="hello" quietZone={2} />);
    const m = encodeQr('hello', { ecc: 'M' });
    expect(r.querySelector('svg')!.getAttribute('viewBox')).toBe(`0 0 ${m.size + 4} ${m.size + 4}`);
  });
});

describe('data-display behaviour', () => {
  it('Accordion toggles uncontrolled and reports changes', () => {
    const changes: string[][] = [];
    const host = mount(<Accordion sections={[{ id: 'a', title: 'A', content: 'x' }, { id: 'b', title: 'B', content: 'y' }]} mode="single" onChange={(o) => changes.push(o)} />);
    const triggers = host.querySelectorAll<HTMLButtonElement>('.mh-accordion__trigger');
    act(() => triggers[1]!.click());
    expect(triggers[1]!.getAttribute('aria-expanded')).toBe('true');
    act(() => triggers[0]!.click());
    expect(triggers[1]!.getAttribute('aria-expanded')).toBe('false');
    expect(changes).toEqual([['b'], ['a']]);
    act(() => triggers[0]!.focus());
    key(triggers[0]!, 'ArrowDown');
    expect(document.activeElement).toBe(triggers[1]);
  });

  it('Tree keyboard and checkboxes', () => {
    const checked: string[][] = [];
    const host = mount(<Tree nodes={nodes} checkable defaultExpanded={['home']} onCheckedChange={(c) => checked.push(c)} />);
    const item = (id: string): HTMLElement => host.querySelector<HTMLElement>(`[data-id="${id}"]`)!;
    act(() => item('home').focus());
    key(item('home'), 'ArrowDown');
    expect(document.activeElement).toBe(item('kitchen'));
    key(item('kitchen'), 'ArrowRight');
    expect(item('kitchen').getAttribute('aria-expanded')).toBe('true');
    key(item('kitchen'), 'ArrowRight');
    expect(document.activeElement).toBe(item('k1'));
    key(item('k1'), ' ');
    expect(item('k1').getAttribute('aria-checked')).toBe('true');
    expect(item('kitchen').getAttribute('aria-checked')).toBe('mixed');
    expect(item('k1').tabIndex).toBe(0);
    act(() => item('home').click());
    expect(item('home').getAttribute('aria-checked')).toBe('true');
    expect(checked).toEqual([['k1'], ['k1', 'k2']]);
  });

  it('DataTable sorts, selects and resizes', () => {
    const selections: string[][] = [];
    const host = mount(<DataTable columns={columns} rows={rows} rowId={(d) => d.id} label="Devices" selectable onSelectionChange={(s) => selections.push(s)} />);
    const names = (): string[] => Array.from(host.querySelectorAll('tbody tr'), (tr) => tr.querySelectorAll('td')[1]!.textContent!);
    act(() => host.querySelectorAll<HTMLButtonElement>('.mh-data-table__sort')[0]!.click());
    expect(names()).toEqual(['Desk lamp', 'Door lock', 'Hall sensor']);
    expect(host.querySelectorAll('th')[1]!.getAttribute('aria-sort')).toBe('ascending');
    const all = host.querySelector<HTMLInputElement>('thead input')!;
    act(() => host.querySelectorAll<HTMLInputElement>('tbody input')[0]!.click());
    expect(all.indeterminate).toBe(true);
    act(() => all.click());
    expect(selections.at(-1)!.length).toBe(3);
    expect(host.querySelectorAll('tr.is-selected').length).toBe(3);
    const handle = host.querySelector<HTMLElement>('.mh-data-table__resize')!;
    expect(handle.getAttribute('aria-valuenow')).toBe('180');
    key(handle, 'ArrowRight');
    expect(host.querySelector<HTMLElement>('.mh-data-table__resize')!.getAttribute('aria-valuenow')).toBe('196');
    expect(host.querySelector('table')!.classList.contains('is-sized')).toBe(true);
  });
});
