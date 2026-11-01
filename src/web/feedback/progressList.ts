import { h } from '../dom.ts';
import { createProgressBar, progressValueText, type ProgressBarHandle, type ProgressTone } from './progress.ts';

export interface ProgressListItem {
  name: string;
  /** 0 to 100; `null` is indeterminate (no percentage shown). */
  value: number | null;
  /** What is happening ("Downloading", "Paused"). */
  status?: string | null;
  /** More about it ("1.2 of 3.4 GB", "12 min left"). Shown after the status as "status · detail". */
  detail?: string | null;
  tone?: ProgressTone;
}

export interface ProgressListOptions {
  items: ProgressListItem[];
  /** Accessible name of the list ("Downloads", "Updates"). */
  label?: string;
}

export interface ProgressListHandle {
  el: HTMLUListElement;
  /** Updates rows in place (bars animate to their new value); adds or removes rows to match. */
  setItems(items: ProgressListItem[]): void;
}

/** The muted line under the bar: "status · detail", either alone, or '' when there is neither. */
export function progressListMeta(item: Pick<ProgressListItem, 'status' | 'detail'>): string {
  return [item.status, item.detail].filter((s): s is string => Boolean(s)).join(' · ');
}

interface Row {
  li: HTMLLIElement;
  name: HTMLSpanElement;
  value: HTMLSpanElement;
  meta: HTMLSpanElement;
  bar: ProgressBarHandle;
  tone: ProgressTone | undefined;
}

const bar = (item: ProgressListItem): ProgressBarHandle => createProgressBar({ label: item.name, value: item.value, tone: item.tone });

function createRow(item: ProgressListItem): Row {
  const name = h('span', { class: 'mh-progress-list__name' });
  const value = h('span', { class: 'mh-progress-list__value', 'aria-hidden': 'true' });
  const meta = h('span', { class: 'mh-progress-list__meta' });
  const b = bar(item);
  const li = h('li', { class: 'mh-progress-list__item' }, h('div', { class: 'mh-progress-list__header' }, name, value), b.el);
  const row: Row = { li, name, value, meta, bar: b, tone: item.tone };
  updateRow(row, item);
  return row;
}

function updateRow(row: Row, item: ProgressListItem): void {
  row.name.textContent = item.name;
  row.value.textContent = progressValueText(item.value);
  if (row.tone !== item.tone || row.bar.el.getAttribute('aria-label') !== item.name) {
    const next = bar(item);
    row.bar.el.replaceWith(next.el);
    row.bar = next;
    row.tone = item.tone;
  } else row.bar.setValue(item.value);
  const meta = progressListMeta(item);
  row.meta.textContent = meta;
  if (meta) row.li.append(row.meta);
  else row.meta.remove();
}

/**
 * `ul.mh-progress-list`: several jobs at once (downloads, updates, backups). Each `li.__item` has a `__header`
 * (`__name` and the `__value` percentage in tabular figures), a `.mh-progress` bar named by the item, and a muted
 * `__meta` line "status · detail". `null` values show an indeterminate bar and no percentage.
 */
export function createProgressList(options: ProgressListOptions): ProgressListHandle {
  const el = h('ul', { class: 'mh-progress-list', 'aria-label': options.label });
  let rows: Row[] = [];
  const setItems = (items: ProgressListItem[]): void => {
    items.forEach((item, i) => {
      const existing = rows[i];
      if (existing) updateRow(existing, item);
      else {
        const row = createRow(item);
        rows.push(row);
        el.append(row.li);
      }
    });
    for (const row of rows.slice(items.length)) row.li.remove();
    rows = rows.slice(0, items.length);
  };
  setItems(options.items);
  return { el, setItems };
}
