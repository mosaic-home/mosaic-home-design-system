import { beforeEach, describe, expect, it } from 'vitest';
import { accordionInitial, accordionKeyTarget, accordionNext, createAccordion } from './accordion.ts';
import { createDataTable, dataTableNextSort, dataTableResizeKey, dataTableSelectAll, dataTableSortRows, dataTableToggleAll, type DataTableColumn } from './dataTable.ts';
import { createTree, treeCheckState, treeKeyAction, treeNormalizeChecked, treeRows, treeToggleChecked, type TreeNode } from './tree.ts';

const key = (target: Element, k: string, init: KeyboardEventInit = {}): void => {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
};

beforeEach(() => document.body.replaceChildren());

describe('accordion', () => {
  const sections = [
    { id: 'a', title: 'Lights', subtitle: '4 on', icon: 'lightbulb', meta: '4', content: 'Light settings' },
    { id: 'b', title: 'Climate', content: 'Climate settings' },
    { id: 'c', title: 'Locked', disabled: true, content: 'Nothing' },
  ];

  it('wires triggers to regions and toggles many', () => {
    const changes: string[][] = [];
    const acc = createAccordion({ sections, open: ['a'], onChange: (o) => changes.push(o) });
    document.body.append(acc.el);
    expect(acc.el.className).toBe('mh-accordion mh-accordion--plain');
    const triggers = acc.el.querySelectorAll<HTMLButtonElement>('.mh-accordion__trigger');
    const panels = acc.el.querySelectorAll<HTMLElement>('.mh-accordion__panel');
    expect(acc.el.querySelector('h3.mh-accordion__heading')).not.toBeNull();
    expect(triggers[0]!.getAttribute('aria-expanded')).toBe('true');
    expect(triggers[0]!.getAttribute('aria-controls')).toBe(panels[0]!.id);
    expect(panels[0]!.getAttribute('role')).toBe('region');
    expect(panels[0]!.getAttribute('aria-labelledby')).toBe(triggers[0]!.id);
    expect(panels[1]!.hidden).toBe(true);
    expect(triggers[2]!.disabled).toBe(true);
    triggers[1]!.click();
    expect(acc.open()).toEqual(['a', 'b']);
    triggers[0]!.click();
    expect(acc.open()).toEqual(['b']);
    expect(panels[0]!.hidden).toBe(true);
    expect(changes).toEqual([['a', 'b'], ['b']]);
  });

  it('single mode keeps one open; required keeps it open', () => {
    const acc = createAccordion({ sections, mode: 'single', required: true, variant: 'separated', headingLevel: 2 });
    document.body.append(acc.el);
    expect(acc.open()).toEqual(['a']);
    const triggers = acc.el.querySelectorAll<HTMLButtonElement>('h2 > .mh-accordion__trigger');
    expect(triggers[0]!.getAttribute('aria-disabled')).toBe('true');
    triggers[0]!.click();
    expect(acc.open()).toEqual(['a']);
    triggers[1]!.click();
    expect(acc.open()).toEqual(['b']);
    expect(triggers[0]!.hasAttribute('aria-disabled')).toBe(false);
  });

  it('arrow keys move between headers, skipping disabled ones', () => {
    const acc = createAccordion({ sections });
    document.body.append(acc.el);
    const triggers = acc.el.querySelectorAll<HTMLButtonElement>('.mh-accordion__trigger');
    triggers[1]!.focus();
    key(triggers[1]!, 'ArrowDown');
    expect(document.activeElement).toBe(triggers[0]);
    key(triggers[0]!, 'End');
    expect(document.activeElement).toBe(triggers[1]);
  });

  it('helpers', () => {
    expect(accordionNext(['a'], 'b', 'single')).toEqual(['b']);
    expect(accordionNext(['a'], 'a', 'single')).toEqual([]);
    expect(accordionNext(['a'], 'a', 'single', true)).toEqual(['a']);
    expect(accordionNext(['a'], 'a', 'multiple', false, true)).toEqual(['a']);
    expect(accordionInitial(sections, ['x', 'b', 'a'], 'single')).toEqual(['b']);
    expect(accordionInitial(sections, [], 'single', true)).toEqual(['a']);
    expect(accordionKeyTarget(sections, 0, 'ArrowUp')).toBe(1);
    expect(accordionKeyTarget(sections, 0, 'x')).toBeNull();
  });
});

describe('tree', () => {
  const nodes: TreeNode[] = [
    {
      id: 'home',
      label: 'Home',
      icon: 'home',
      children: [
        { id: 'kitchen', label: 'Kitchen', children: [{ id: 'k1', label: 'Ceiling light' }, { id: 'k2', label: 'Counter strip' }] },
        { id: 'hall', label: 'Hallway', meta: '1', children: [{ id: 'h1', label: 'Motion sensor' }] },
        { id: 'garage', label: 'Garage', disabled: true },
      ],
    },
    { id: 'garden', label: 'Garden' },
  ];

  it('renders visible rows with levels, positions and roving tabindex', () => {
    const tree = createTree({ nodes, label: 'Rooms', expanded: ['home'], selected: 'hall' });
    document.body.append(tree.el);
    expect(tree.el.getAttribute('role')).toBe('tree');
    expect(tree.el.getAttribute('aria-label')).toBe('Rooms');
    const items = tree.el.querySelectorAll<HTMLElement>('[role="treeitem"]');
    expect(Array.from(items, (i) => i.dataset.id)).toEqual(['home', 'kitchen', 'hall', 'garage', 'garden']);
    const kitchen = items[1]!;
    expect(kitchen.getAttribute('aria-level')).toBe('2');
    expect(kitchen.getAttribute('aria-posinset')).toBe('1');
    expect(kitchen.getAttribute('aria-setsize')).toBe('3');
    expect(kitchen.getAttribute('aria-expanded')).toBe('false');
    expect(items[0]!.querySelector(':scope > ul.mh-tree__group[role="group"]')).not.toBeNull();
    expect(items[4]!.hasAttribute('aria-expanded')).toBe(false);
    expect(items[2]!.getAttribute('aria-selected')).toBe('true');
    expect(items[2]!.classList.contains('is-selected')).toBe(true);
    expect(items[2]!.tabIndex).toBe(0);
    expect(items[0]!.tabIndex).toBe(-1);
    expect(items[3]!.getAttribute('aria-disabled')).toBe('true');
  });

  it('keyboard: arrows move, expand, collapse and go to the parent; Enter selects', () => {
    const selected: string[] = [];
    const expandedLog: string[][] = [];
    const tree = createTree({ nodes, expanded: ['home'], onSelect: (id) => selected.push(id), onExpandedChange: (e) => expandedLog.push(e) });
    document.body.append(tree.el);
    const item = (id: string): HTMLElement => tree.el.querySelector<HTMLElement>(`[data-id="${id}"]`)!;
    item('home').focus();
    key(item('home'), 'ArrowDown');
    expect(document.activeElement).toBe(item('kitchen'));
    key(item('kitchen'), 'ArrowRight');
    expect(tree.expanded()).toEqual(['home', 'kitchen']);
    expect(document.activeElement).toBe(item('kitchen'));
    key(item('kitchen'), 'ArrowRight');
    expect(document.activeElement).toBe(item('k1'));
    key(item('k1'), 'ArrowLeft');
    expect(document.activeElement).toBe(item('kitchen'));
    key(item('kitchen'), 'ArrowLeft');
    expect(tree.expanded()).toEqual(['home']);
    key(item('kitchen'), 'Enter');
    expect(selected).toEqual(['kitchen']);
    expect(item('kitchen').getAttribute('aria-selected')).toBe('true');
    key(item('kitchen'), 'g');
    expect(document.activeElement).toBe(item('garage'));
    key(item('garage'), 'Enter');
    expect(selected).toEqual(['kitchen']);
    key(item('garage'), 'End');
    expect(document.activeElement).toBe(item('garden'));
    expect(expandedLog).toEqual([['home', 'kitchen'], ['home']]);
  });

  it('chevron click toggles; row click selects', () => {
    const tree = createTree({ nodes });
    document.body.append(tree.el);
    (tree.el.querySelector('[data-id="home"] .mh-tree__toggle') as HTMLElement).click();
    expect(tree.expanded()).toEqual(['home']);
    expect(tree.selected()).toBeNull();
    (tree.el.querySelector('[data-id="hall"] .mh-tree__row') as HTMLElement).click();
    expect(tree.selected()).toBe('hall');
  });

  it('checkboxes cascade and show mixed parents', () => {
    const changes: string[][] = [];
    const tree = createTree({ nodes, checkable: true, expanded: ['home', 'kitchen'], checked: ['k1'], onCheckedChange: (c) => changes.push(c) });
    document.body.append(tree.el);
    const item = (id: string): HTMLElement => tree.el.querySelector<HTMLElement>(`[data-id="${id}"]`)!;
    expect(tree.el.className).toBe('mh-tree mh-tree--checkable');
    expect(item('k1').getAttribute('aria-checked')).toBe('true');
    expect(item('kitchen').getAttribute('aria-checked')).toBe('mixed');
    expect(item('home').getAttribute('aria-checked')).toBe('mixed');
    expect(item('home').hasAttribute('aria-selected')).toBe(false);
    item('kitchen').focus();
    key(item('kitchen'), ' ');
    expect(tree.checked().sort()).toEqual(['k1', 'k2']);
    expect(item('kitchen').getAttribute('aria-checked')).toBe('true');
    expect(document.activeElement).toBe(item('kitchen'));
    item('home').click();
    expect(tree.checked().sort()).toEqual(['h1', 'k1', 'k2']);
    expect(item('home').getAttribute('aria-checked')).toBe('true');
    item('home').click();
    expect(tree.checked()).toEqual([]);
    expect(changes.length).toBe(3);
  });

  it('helpers', () => {
    expect(treeRows(nodes, []).map((r) => r.node.id)).toEqual(['home', 'garden']);
    expect(treeNormalizeChecked(nodes, ['home', 'nope'])).toEqual(['k1', 'k2', 'h1']);
    expect(treeCheckState(nodes[0]!, ['k1', 'k2', 'h1'])).toBe('true');
    expect(treeToggleChecked(nodes, 'garage', [])).toEqual([]);
    const rows = treeRows(nodes, ['home']);
    expect(treeKeyAction(rows, 'kitchen', '*', ['home'])).toEqual({ expanded: ['home', 'kitchen', 'hall'] });
    expect(treeKeyAction(rows, 'home', 'ArrowUp', ['home'])).toEqual({});
    expect(treeKeyAction(rows, 'home', 'Tab', ['home'])).toBeNull();
  });
});

describe('data-table', () => {
  interface Device {
    id: string;
    name: string;
    room: string;
    battery: number | null;
  }
  const rows: Device[] = [
    { id: 'd1', name: 'Hall sensor', room: 'Hallway', battery: 82 },
    { id: 'd2', name: 'Door lock', room: 'Entrance', battery: 9 },
    { id: 'd3', name: 'Desk lamp', room: 'Study', battery: null },
    { id: 'd4', name: 'Bath sensor 10', room: 'Bathroom', battery: 100 },
    { id: 'd5', name: 'Bath sensor 2', room: 'Bathroom', battery: 45 },
  ];
  const columns: DataTableColumn<Device>[] = [
    { id: 'name', label: 'Name', sortable: true },
    { id: 'room', label: 'Room', sortable: true },
    { id: 'battery', label: 'Battery', align: 'end', sortable: true, value: (r) => r.battery, render: (r) => (r.battery === null ? '—' : `${r.battery}%`) },
  ];

  const names = (el: HTMLElement): string[] => Array.from(el.querySelectorAll('tbody tr'), (tr) => tr.querySelector('td:not(.mh-data-table__select)')!.textContent!);

  it('renders a captioned, focusable region with a native table', () => {
    const t = createDataTable({ columns, rows, rowId: (r) => r.id, label: 'Devices', dense: true, striped: true, stickyColumn: true, maxHeight: '20rem' });
    expect(t.el.className).toBe('mh-data-table mh-data-table--dense mh-data-table--striped mh-data-table--sticky-header mh-data-table--sticky-column');
    expect(t.el.getAttribute('role')).toBe('region');
    expect(t.el.tabIndex).toBe(0);
    const caption = t.el.querySelector('caption')!;
    expect(caption.textContent).toBe('Devices');
    expect(caption.classList.contains('mh-visually-hidden')).toBe(true);
    expect(t.el.getAttribute('aria-labelledby')).toBe(caption.id);
    expect(t.el.style.maxHeight).toBe('20rem');
    const ths = t.el.querySelectorAll('th');
    expect(ths[0]!.getAttribute('scope')).toBe('col');
    expect(ths[0]!.getAttribute('aria-sort')).toBe('none');
    expect(ths[2]!.className).toBe('mh-data-table__th mh-data-table__cell--end');
    expect(t.el.querySelectorAll('tbody tr').length).toBe(5);
    expect(t.el.querySelector('tbody tr td:nth-child(3)')!.textContent).toBe('82%');
  });

  it('sorts by header, numeric-aware, empties last', () => {
    const sorts: string[] = [];
    const t = createDataTable({ columns, rows, rowId: (r) => r.id, label: 'Devices', onSortChange: (s) => sorts.push(`${s.column}:${s.direction}`) });
    const buttons = t.el.querySelectorAll<HTMLButtonElement>('.mh-data-table__sort');
    buttons[0]!.click();
    expect(names(t.el)).toEqual(['Bath sensor 2', 'Bath sensor 10', 'Desk lamp', 'Door lock', 'Hall sensor']);
    expect(t.el.querySelectorAll('th')[0]!.getAttribute('aria-sort')).toBe('ascending');
    expect(t.el.querySelectorAll('th')[0]!.classList.contains('is-sorted')).toBe(true);
    buttons[2]!.click();
    buttons[2]!.click();
    expect(names(t.el)).toEqual(['Bath sensor 10', 'Hall sensor', 'Bath sensor 2', 'Door lock', 'Desk lamp']);
    expect(t.el.querySelectorAll('th')[2]!.getAttribute('aria-sort')).toBe('descending');
    expect(t.el.querySelectorAll('th')[0]!.getAttribute('aria-sort')).toBe('none');
    expect(sorts).toEqual(['name:ascending', 'battery:ascending', 'battery:descending']);
    t.setSort(null);
    expect(names(t.el)[0]).toBe('Hall sensor');
  });

  it('selects rows and all rows, keeping focus on the checkbox', () => {
    const changes: string[][] = [];
    const t = createDataTable({ columns, rows, rowId: (r) => r.id, label: 'Devices', selectable: true, selected: ['d2'], onSelectionChange: (s) => changes.push(s) });
    document.body.append(t.el);
    const all = t.el.querySelector<HTMLInputElement>('thead input')!;
    expect(all.getAttribute('aria-label')).toBe('Select all rows');
    expect(all.indeterminate).toBe(true);
    const boxes = t.el.querySelectorAll<HTMLInputElement>('tbody input');
    expect(boxes[0]!.getAttribute('aria-label')).toBe('Select Hall sensor');
    expect(boxes[1]!.checked).toBe(true);
    expect(t.el.querySelectorAll('tbody tr')[1]!.classList.contains('is-selected')).toBe(true);
    boxes[0]!.focus();
    boxes[0]!.click();
    expect(t.selected()).toEqual(['d2', 'd1']);
    expect(document.activeElement).toBe(boxes[0]);
    all.click();
    expect(t.selected().length).toBe(5);
    expect(all.checked).toBe(true);
    expect(all.indeterminate).toBe(false);
    all.click();
    expect(t.selected()).toEqual([]);
    expect(changes.length).toBe(3);
  });

  it('resizes columns from the keyboard', () => {
    const resized: [string, number][] = [];
    const t = createDataTable({ columns, rows, rowId: (r) => r.id, label: 'Devices', resizable: true, onColumnResize: (c, w) => resized.push([c, w]) });
    document.body.append(t.el);
    const handle = t.el.querySelector<HTMLElement>('.mh-data-table__resize')!;
    expect(handle.getAttribute('role')).toBe('separator');
    expect(handle.getAttribute('aria-label')).toBe('Resize Name');
    key(handle, 'ArrowRight');
    const w = t.columnWidths().name!;
    expect(resized).toEqual([['name', w]]);
    expect(handle.getAttribute('aria-valuenow')).toBe(String(w));
    expect(t.el.querySelector('table')!.classList.contains('is-sized')).toBe(true);
    expect(t.el.querySelector<HTMLElement>('col')!.style.width).toBe(`${w}px`);
    key(handle, 'ArrowLeft', { shiftKey: true });
    expect(t.columnWidths().name).toBe(Math.max(48, w - 64));
  });

  it('shows an empty row', () => {
    const t = createDataTable({ columns, rows: [], rowId: (r) => r.id, label: 'Devices', selectable: true, empty: 'No devices yet' });
    const td = t.el.querySelector('tbody td')!;
    expect(td.textContent).toBe('No devices yet');
    expect(td.getAttribute('colspan')).toBe('4');
    t.setRows(rows);
    expect(t.el.querySelectorAll('tbody tr').length).toBe(5);
  });

  it('helpers', () => {
    expect(dataTableNextSort(null, 'a')).toEqual({ column: 'a', direction: 'ascending' });
    expect(dataTableNextSort({ column: 'a', direction: 'ascending' }, 'a').direction).toBe('descending');
    expect(dataTableSelectAll(['a', 'b'], ['a'])).toBe('some');
    expect(dataTableToggleAll(['a', 'b'], ['a', 'b', 'z'])).toEqual(['z']);
    expect(dataTableResizeKey(60, 'ArrowLeft', false, 50)).toBe(50);
    expect(dataTableResizeKey(60, 'Enter', false)).toBeNull();
    expect(dataTableSortRows(rows, columns, { column: 'room', direction: 'ascending' }).map((r) => r.id)).toEqual(['d4', 'd5', 'd2', 'd1', 'd3']);
  });
});
