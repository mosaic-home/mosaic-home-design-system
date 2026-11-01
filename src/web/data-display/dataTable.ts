import { mdiArrowDown, mdiArrowUp } from '@mdi/js';
import { append, cx, h, uid, type Child } from '../dom.ts';
import { createIcon, iconPath } from '../icons.ts';
import { createCheckbox, type CheckboxHandle } from '../choice-inputs/checkbox.ts';

export type DataTableAlign = 'start' | 'center' | 'end';
export type DataTableSortDirection = 'ascending' | 'descending';
export type DataTableValue = string | number | null | undefined;

export interface DataTableSort {
  column: string;
  direction: DataTableSortDirection;
}

export interface DataTableColumn<T> {
  id: string;
  label: string;
  /** The cell value, used for sorting and as the cell text. Default `row[id]`. */
  value?: (row: T) => DataTableValue;
  /** Custom cell content (a badge, a button); the value still sorts. */
  render?: (row: T) => Child | Child[];
  /** Default `start`; numbers usually `end`. */
  align?: DataTableAlign;
  sortable?: boolean;
  /** Can be dragged (or moved with arrow keys) wider or narrower; default the table's `resizable`. */
  resizable?: boolean;
  /** Starting width in CSS pixels. */
  width?: number;
  /** Narrowest width when resizing; default 48. */
  minWidth?: number;
}

/** The part of a column the sorting and value helpers read. */
export type DataTableValueColumn<T> = Pick<DataTableColumn<T>, 'id' | 'value'>;

export interface DataTableOptions<T> {
  columns: readonly DataTableColumn<T>[];
  rows: readonly T[];
  /** A stable id per row (selection, keys). */
  rowId: (row: T) => string;
  /** Required: the table's name, also its caption. */
  label: string;
  /** Shows the caption above the table (default hidden, read by screen readers). */
  showCaption?: boolean;
  sort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort) => void;
  /** A checkbox column with select-all in the header. */
  selectable?: boolean;
  selected?: readonly string[];
  onSelectionChange?: (selected: string[]) => void;
  /** Names a row for its checkbox ("Select Kitchen light"); default the first column's value. */
  rowLabel?: (row: T) => string;
  /** Every column can be resized. */
  resizable?: boolean;
  onColumnResize?: (column: string, width: number) => void;
  /** Tighter rows. */
  dense?: boolean;
  /** Alternate row shading. */
  striped?: boolean;
  /** The header stays put while the body scrolls (default true; needs `maxHeight`). */
  stickyHeader?: boolean;
  /** The first column stays put while the table scrolls sideways. */
  stickyColumn?: boolean;
  /** A CSS length; the body scrolls inside it ("24rem", "60vh"). */
  maxHeight?: string;
  /** Shown in place of the rows when there are none. Default "Nothing to show". */
  empty?: string;
}

export interface DataTableHandle<T> {
  el: HTMLElement;
  setRows(rows: readonly T[]): void;
  sort(): DataTableSort | null;
  setSort(sort: DataTableSort | null): void;
  selected(): string[];
  setSelected(ids: readonly string[]): void;
  /** Current widths of resized columns, by id. */
  columnWidths(): Record<string, number>;
}

export function dataTableClass(options: Pick<DataTableOptions<unknown>, 'dense' | 'striped' | 'stickyHeader' | 'stickyColumn' | 'selectable'>): string {
  return cx(
    'mh-data-table',
    options.dense && 'mh-data-table--dense',
    options.striped && 'mh-data-table--striped',
    (options.stickyHeader ?? true) && 'mh-data-table--sticky-header',
    options.stickyColumn && 'mh-data-table--sticky-column',
    options.selectable && 'mh-data-table--selectable',
  );
}

export function dataTableCellClass(align: DataTableAlign = 'start', head = false): string {
  return cx(head ? 'mh-data-table__th' : 'mh-data-table__td', align !== 'start' && `mh-data-table__cell--${align}`);
}

export function dataTableValue<T>(column: DataTableValueColumn<T>, row: T): DataTableValue {
  if (column.value) return column.value(row);
  const v = (row as Record<string, unknown>)[column.id];
  return typeof v === 'string' || typeof v === 'number' ? v : v === null || v === undefined ? v : String(v);
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

/** Rows in sort order (stable); empty values go last in either direction. */
export function dataTableSortRows<T>(rows: readonly T[], columns: readonly DataTableValueColumn<T>[], sort: DataTableSort | null | undefined): T[] {
  const column = sort ? columns.find((c) => c.id === sort.column) : undefined;
  if (!sort || !column) return [...rows];
  const sign = sort.direction === 'ascending' ? 1 : -1;
  return rows
    .map((row, i) => ({ row, i, v: dataTableValue(column, row) }))
    .sort((a, b) => {
      const ae = a.v === null || a.v === undefined || a.v === '';
      const be = b.v === null || b.v === undefined || b.v === '';
      if (ae || be) return ae === be ? a.i - b.i : ae ? 1 : -1;
      const d = typeof a.v === 'number' && typeof b.v === 'number' ? a.v - b.v : collator.compare(String(a.v), String(b.v));
      return d === 0 ? a.i - b.i : d * sign;
    })
    .map((x) => x.row);
}

/** Pressing a column header: a new column sorts ascending, the sorted one flips. */
export function dataTableNextSort(sort: DataTableSort | null | undefined, column: string): DataTableSort {
  if (sort?.column === column) return { column, direction: sort.direction === 'ascending' ? 'descending' : 'ascending' };
  return { column, direction: 'ascending' };
}

/** The header checkbox: all rows selected, some, or none. */
export function dataTableSelectAll(rowIds: readonly string[], selected: readonly string[]): 'all' | 'some' | 'none' {
  const n = rowIds.filter((id) => selected.includes(id)).length;
  return n === 0 ? 'none' : n === rowIds.length ? 'all' : 'some';
}

/** Selection after pressing select-all: everything when not all were selected, else nothing (of these rows). */
export function dataTableToggleAll(rowIds: readonly string[], selected: readonly string[]): string[] {
  if (dataTableSelectAll(rowIds, selected) === 'all') return selected.filter((id) => !rowIds.includes(id));
  return [...new Set([...selected, ...rowIds])];
}

/** A resize handle's new width for a key (Left / Right step 16, with Shift 64), or null for other keys. */
export function dataTableResizeKey(width: number, key: string, shift: boolean, min = 48): number | null {
  const step = shift ? 64 : 16;
  if (key === 'ArrowLeft') return Math.max(min, width - step);
  if (key === 'ArrowRight') return width + step;
  return null;
}

/** The accessible name of a row's checkbox. */
export function dataTableRowLabel<T>(row: T, columns: readonly DataTableValueColumn<T>[], rowLabel?: (row: T) => string): string {
  const name = rowLabel ? rowLabel(row) : columns[0] ? String(dataTableValue(columns[0], row) ?? '') : '';
  return `Select ${name}`.trim();
}

/** Sort indicator icon: up or down for the sorted column, a faint up arrow for the others. */
export const dataTableSortIcon = (direction: DataTableSortDirection | undefined): string => (direction === 'descending' ? mdiArrowDown : mdiArrowUp);

/**
 * `.mh-data-table` (`--dense`, `--striped`, `--sticky-header`, `--sticky-column`, `--selectable`): a focusable,
 * scrolling `role="region"` around a native `table.mh-data-table__table` with a caption. Sortable headers hold a
 * `button.mh-data-table__sort` (`aria-sort` on the `th`); resizable ones a `.mh-data-table__resize` separator
 * (drag, or Left / Right with Shift for bigger steps). Selection adds a checkbox column with select-all; selected
 * rows get `.is-selected`.
 */
export function createDataTable<T>(options: DataTableOptions<T>): DataTableHandle<T> {
  const captionId = uid('mh-data-table');
  let rows = [...options.rows];
  let sort = options.sort ?? null;
  let selected = [...(options.selected ?? [])];
  const widths: Record<string, number> = {};
  for (const c of options.columns) if (c.width) widths[c.id] = c.width;

  const caption = h('caption', { class: cx('mh-data-table__caption', !options.showCaption && 'mh-visually-hidden'), id: captionId }, options.label);
  const colgroup = h('colgroup');
  const headRow = h('tr', { class: 'mh-data-table__head-row' });
  const tbody = h('tbody', { class: 'mh-data-table__body' });
  const table = h('table', { class: 'mh-data-table__table' }, caption, colgroup, h('thead', { class: 'mh-data-table__head' }, headRow), tbody);
  const el = h('div', { class: dataTableClass(options), role: 'region', 'aria-labelledby': captionId, tabindex: 0 }, table);
  if (options.maxHeight) el.style.maxHeight = options.maxHeight;

  const cols: HTMLTableColElement[] = [];
  let selectAll: CheckboxHandle | null = null;
  if (options.selectable) {
    colgroup.append(h('col', { class: 'mh-data-table__col mh-data-table__col--select' }));
    selectAll = createCheckbox({
      ariaLabel: 'Select all rows',
      onChange: () => setSelectedInner(dataTableToggleAll(rows.map(options.rowId), selected), true),
    });
    headRow.append(h('th', { class: 'mh-data-table__th mh-data-table__select', scope: 'col' }, selectAll.el));
  }

  const ths: HTMLTableCellElement[] = [];
  const sortIcons: SVGSVGElement[] = [];
  const handles: (HTMLElement | null)[] = [];
  options.columns.forEach((column, i) => {
    const col = h('col', { class: 'mh-data-table__col' });
    cols.push(col);
    colgroup.append(col);
    const th = h('th', { class: dataTableCellClass(column.align, true), scope: 'col' });
    if (column.sortable) {
      const icon = createIcon(mdiArrowUp, { class: 'mh-data-table__sort-icon' });
      sortIcons[i] = icon;
      const btn = h('button', { type: 'button', class: 'mh-data-table__sort' }, h('span', { class: 'mh-data-table__label' }, column.label), icon);
      btn.addEventListener('click', () => {
        sort = dataTableNextSort(sort, column.id);
        renderBody();
        syncHead();
        options.onSortChange?.({ ...sort });
      });
      th.append(btn);
    } else {
      th.append(h('span', { class: 'mh-data-table__label' }, column.label));
    }
    const resizable = column.resizable ?? options.resizable ?? false;
    handles[i] = null;
    if (resizable) {
      const handle = h('span', {
        class: 'mh-data-table__resize',
        role: 'separator',
        'aria-orientation': 'vertical',
        'aria-label': `Resize ${column.label}`,
        'aria-valuemin': column.minWidth ?? 48,
        tabindex: 0,
      });
      handles[i] = handle;
      handle.addEventListener('keydown', (e) => {
        const next = dataTableResizeKey(currentWidth(i), e.key, e.shiftKey, column.minWidth);
        if (next === null) return;
        e.preventDefault();
        resize(i, next);
      });
      handle.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const startX = e.clientX;
        const start = currentWidth(i);
        handle.setPointerCapture?.(e.pointerId);
        handle.classList.add('is-active');
        const move = (ev: PointerEvent): void => resize(i, Math.max(column.minWidth ?? 48, start + (ev.clientX - startX)));
        const up = (): void => {
          handle.classList.remove('is-active');
          handle.removeEventListener('pointermove', move);
          handle.removeEventListener('pointerup', up);
          handle.removeEventListener('pointercancel', up);
        };
        handle.addEventListener('pointermove', move);
        handle.addEventListener('pointerup', up);
        handle.addEventListener('pointercancel', up);
      });
      handle.addEventListener('click', (e) => e.stopPropagation());
      th.append(handle);
    }
    ths.push(th);
    headRow.append(th);
  });

  /** Freezes every column at its laid-out width the first time one is resized, so only that one changes. */
  function freeze(): void {
    if (table.classList.contains('is-sized')) return;
    options.columns.forEach((c, i) => {
      if (widths[c.id] === undefined) widths[c.id] = Math.round(ths[i]!.getBoundingClientRect().width) || c.minWidth || 120;
    });
    table.classList.add('is-sized');
    syncWidths();
  }

  function currentWidth(i: number): number {
    freeze();
    return widths[options.columns[i]!.id]!;
  }

  function resize(i: number, width: number): void {
    const column = options.columns[i]!;
    widths[column.id] = Math.round(width);
    syncWidths();
    options.onColumnResize?.(column.id, widths[column.id]!);
  }

  function syncWidths(): void {
    options.columns.forEach((c, i) => {
      const w = widths[c.id];
      cols[i]!.style.width = w === undefined ? '' : `${w}px`;
      handles[i]?.setAttribute('aria-valuenow', String(w ?? ''));
      if (w === undefined) handles[i]?.removeAttribute('aria-valuenow');
    });
    if (Object.keys(widths).length > 0 && options.columns.every((c) => widths[c.id] !== undefined)) table.classList.add('is-sized');
  }

  function syncHead(): void {
    options.columns.forEach((column, i) => {
      const th = ths[i]!;
      const on = sort?.column === column.id;
      if (column.sortable) th.setAttribute('aria-sort', on ? sort!.direction : 'none');
      th.classList.toggle('is-sorted', on);
      const icon = sortIcons[i];
      if (icon) icon.querySelector('path')!.setAttribute('d', iconPath(dataTableSortIcon(on ? sort!.direction : undefined)));
    });
  }

  function syncSelectAll(): void {
    if (!selectAll) return;
    const state = dataTableSelectAll(rows.map(options.rowId), selected);
    selectAll.setChecked(state === 'all');
    selectAll.setIndeterminate(state === 'some');
    selectAll.setDisabled(rows.length === 0);
  }

  const rowParts = new Map<string, { tr: HTMLTableRowElement; box: CheckboxHandle | null }>();

  function renderBody(): void {
    rowParts.clear();
    const sorted = dataTableSortRows(rows, options.columns, sort);
    if (sorted.length === 0) {
      tbody.replaceChildren(
        h('tr', { class: 'mh-data-table__row' }, h('td', { class: 'mh-data-table__empty', colspan: options.columns.length + (options.selectable ? 1 : 0) }, options.empty ?? 'Nothing to show')),
      );
      syncSelectAll();
      return;
    }
    tbody.replaceChildren(
      ...sorted.map((row) => {
        const id = options.rowId(row);
        const on = selected.includes(id);
        const tr = h('tr', { class: cx('mh-data-table__row', on && 'is-selected'), 'data-id': id });
        if (options.selectable) {
          const box = createCheckbox({
            ariaLabel: dataTableRowLabel(row, options.columns, options.rowLabel),
            checked: on,
            onChange: (checked) => setSelectedInner(checked ? [...selected, id] : selected.filter((x) => x !== id), true),
          });
          tr.append(h('td', { class: 'mh-data-table__td mh-data-table__select' }, box.el));
          rowParts.set(id, { tr, box });
        }
        for (const column of options.columns) {
          const td = h('td', { class: dataTableCellClass(column.align) });
          if (column.render) {
            const content = column.render(row);
            append(td, ...(Array.isArray(content) ? content : [content]));
          } else {
            const v = dataTableValue(column, row);
            td.append(v === null || v === undefined ? '' : String(v));
          }
          tr.append(td);
        }
        return tr;
      }),
    );
    syncSelectAll();
  }

  /** Updates checkboxes and row states in place, so focus stays on the checkbox that was pressed. */
  function syncSelection(): void {
    for (const [id, { tr, box }] of rowParts) {
      const on = selected.includes(id);
      tr.classList.toggle('is-selected', on);
      box?.setChecked(on);
    }
    syncSelectAll();
  }

  function setSelectedInner(next: string[], notify: boolean): void {
    selected = [...new Set(next)];
    syncSelection();
    if (notify) options.onSelectionChange?.([...selected]);
  }

  syncWidths();
  syncHead();
  renderBody();
  return {
    el,
    setRows(next) {
      rows = [...next];
      renderBody();
    },
    sort: () => (sort ? { ...sort } : null),
    setSort(next) {
      sort = next;
      syncHead();
      renderBody();
    },
    selected: () => [...selected],
    setSelected: (ids) => setSelectedInner([...ids], false),
    columnWidths: () => ({ ...widths }),
  };
}
