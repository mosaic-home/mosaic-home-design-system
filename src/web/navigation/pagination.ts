import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import { cx, h } from '../dom.ts';
import { createIcon } from '../icons.ts';

export type PaginationVariant = 'pages' | 'compact';

export interface PaginationOptions {
  /** Number of pages (at least 1). */
  count: number;
  /** Current page, 1-based. Default 1. */
  page?: number;
  /** `pages` (default): numbered buttons with ellipses. `compact`: "3 of 12" between the arrows, for small screens. */
  variant?: PaginationVariant;
  /** Pages shown on each side of the current one; default 1. */
  siblings?: number;
  /** Pages always shown at each end; default 1. */
  boundaries?: number;
  /** Accessible name of the navigation; default "Pagination". */
  label?: string;
  /** Renders links instead of buttons (`?page=3`); clicks still call `onChange`. */
  href?: (page: number) => string;
  onChange?: (page: number) => void;
  previousLabel?: string;
  nextLabel?: string;
  /** Accessible name of a page button; default "Page {n}". */
  pageLabel?: (page: number) => string;
}

export interface PaginationHandle {
  el: HTMLElement;
  page(): number;
  setPage(page: number): void;
  setCount(count: number): void;
}

export type PaginationSlot = number | 'start-ellipsis' | 'end-ellipsis';

const range = (from: number, to: number): number[] => (to < from ? [] : Array.from({ length: to - from + 1 }, (_, i) => from + i));

/**
 * The page numbers to show, with ellipses for gaps of two or more pages. The row keeps a constant length while the
 * current page moves (an ellipsis that would hide a single page shows that page instead).
 */
export function paginationSlots(page: number, count: number, siblings = 1, boundaries = 1): PaginationSlot[] {
  const total = Math.max(1, Math.floor(count));
  const current = Math.min(Math.max(1, Math.floor(page)), total);
  const shown = boundaries * 2 + siblings * 2 + 3; // ends, siblings, current and two ellipses
  if (total <= shown) return range(1, total);
  const start = range(1, boundaries);
  const end = range(total - boundaries + 1, total);
  const lo = Math.max(Math.min(current - siblings, total - boundaries - siblings * 2 - 1), boundaries + 2);
  const hi = Math.min(Math.max(current + siblings, boundaries + siblings * 2 + 2), total - boundaries - 1);
  return [
    ...start,
    ...(lo > boundaries + 2 ? (['start-ellipsis'] as const) : lo > boundaries + 1 ? [boundaries + 1] : []),
    ...range(lo, hi),
    ...(hi < total - boundaries - 1 ? (['end-ellipsis'] as const) : hi < total - boundaries ? [total - boundaries] : []),
    ...end,
  ];
}

export function paginationClass(variant: PaginationVariant = 'pages'): string {
  return cx('mh-pagination', `mh-pagination--${variant}`);
}

export const paginationPageLabel = (page: number): string => `Page ${page}`;
export const paginationCompactText = (page: number, count: number): string => `${page} of ${count}`;

/**
 * `nav.mh-pagination` (`--pages | --compact`) > `ul.mh-pagination__list`: `__nav` previous and next buttons
 * (disabled at the ends), `__page` buttons or links (`aria-current="page"` on the current one) and decorative
 * `__ellipsis`; the compact variant shows `__status` ("3 of 12", announced politely) between the arrows instead.
 */
export function createPagination(options: PaginationOptions): PaginationHandle {
  const variant = options.variant ?? 'pages';
  const list = h('ul', { class: 'mh-pagination__list' });
  const el = h('nav', { class: paginationClass(variant), 'aria-label': options.label ?? 'Pagination' }, list);
  let count = Math.max(1, Math.floor(options.count));
  let page = Math.min(Math.max(1, Math.floor(options.page ?? 1)), count);
  const pageLabel = options.pageLabel ?? paginationPageLabel;

  function control(target: number, cls: string, label: string | null, disabled: boolean, ...content: (Node | string)[]): HTMLElement {
    const attrs = { class: cls, 'aria-label': label };
    let node: HTMLElement;
    if (options.href && !disabled) node = h('a', { ...attrs, href: options.href(target) }, ...content);
    else if (options.href) node = h('a', { ...attrs, 'aria-disabled': 'true', role: 'link' }, ...content);
    else node = h('button', { ...attrs, type: 'button', disabled }, ...content);
    if (!disabled) {
      node.addEventListener('click', (e) => {
        if (options.href && (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0)) return;
        if (options.href) e.preventDefault();
        go(target, true);
      });
    }
    return node;
  }

  function render(): void {
    const focusedIndex = Array.from(list.querySelectorAll('a, button')).indexOf(document.activeElement as Element);
    const prev = control(page - 1, 'mh-pagination__nav mh-pagination__nav--previous', options.previousLabel ?? 'Previous page', page <= 1, createIcon(mdiChevronLeft));
    const next = control(page + 1, 'mh-pagination__nav mh-pagination__nav--next', options.nextLabel ?? 'Next page', page >= count, createIcon(mdiChevronRight));
    const middle: HTMLElement[] =
      variant === 'compact'
        ? [h('li', { class: 'mh-pagination__item' }, h('span', { class: 'mh-pagination__status', 'aria-live': 'polite' }, paginationCompactText(page, count)))]
        : paginationSlots(page, count, options.siblings, options.boundaries).map((slot) => {
            if (typeof slot !== 'number') return h('li', { class: 'mh-pagination__item' }, h('span', { class: 'mh-pagination__ellipsis', 'aria-hidden': 'true' }, '…'));
            const btn = control(slot, 'mh-pagination__page', pageLabel(slot), false, String(slot));
            if (slot === page) btn.setAttribute('aria-current', 'page');
            return h('li', { class: 'mh-pagination__item' }, btn);
          });
    list.replaceChildren(h('li', { class: 'mh-pagination__item' }, prev), ...middle, h('li', { class: 'mh-pagination__item' }, next));
    if (focusedIndex >= 0) {
      // Keep focus on the arrow that was pressed, or on the new current page.
      const controls = Array.from(list.querySelectorAll<HTMLElement>('a, button'));
      const target = focusedIndex === 0 ? controls[0] : focusedIndex === controls.length - 1 ? controls[controls.length - 1] : list.querySelector<HTMLElement>('[aria-current="page"]');
      (target && !(target as HTMLButtonElement).disabled && target.getAttribute('aria-disabled') !== 'true' ? target : list.querySelector<HTMLElement>('[aria-current="page"]') ?? controls[0])?.focus();
    }
  }

  function go(target: number, notify: boolean): void {
    const next = Math.min(Math.max(1, Math.floor(target)), count);
    if (next === page) return;
    page = next;
    render();
    if (notify) options.onChange?.(page);
  }

  render();
  return {
    el,
    page: () => page,
    setPage: (p) => go(p, false),
    setCount(c) {
      count = Math.max(1, Math.floor(c));
      page = Math.min(page, count);
      render();
    },
  };
}
