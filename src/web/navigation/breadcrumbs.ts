import { mdiChevronRight, mdiDotsHorizontal } from '@mdi/js';
import { h } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: IconName | string;
  /** Makes the crumb a button (when there's no `href`). */
  onClick?: (event: MouseEvent) => void;
}

export interface BreadcrumbsOptions {
  /** From the top level down to the current page (the last item). */
  items: readonly BreadcrumbItem[];
  /** Accessible name of the navigation; default "Breadcrumb". */
  label?: string;
  /** Collapses the middle into a "…" button above this many items (at least 3). Default: never. */
  maxItems?: number;
  /** Label of the "…" button; default "Show {n} more". */
  moreLabel?: (hidden: number) => string;
}

export interface BreadcrumbsHandle {
  el: HTMLElement;
  setItems(items: readonly BreadcrumbItem[]): void;
}

export type BreadcrumbSlot = number | 'more';

/** What to show: item indexes, with `'more'` in place of the hidden middle (keeps the first and the last ones). */
export function breadcrumbSlots(count: number, maxItems: number | undefined, expanded: boolean): BreadcrumbSlot[] {
  const all = Array.from({ length: count }, (_, i) => i);
  if (expanded || maxItems === undefined || count <= maxItems) return all;
  const keep = Math.max(3, Math.floor(maxItems));
  if (count <= keep) return all;
  const tail = keep - 1;
  return [0, 'more', ...all.slice(count - tail + 1)];
}

export const breadcrumbMoreLabel = (hidden: number): string => `Show ${hidden} more`;

const separator = (): HTMLElement => h('span', { class: 'mh-breadcrumbs__separator', 'aria-hidden': 'true' }, createIcon(mdiChevronRight));

/**
 * `nav.mh-breadcrumbs` > `ol.mh-breadcrumbs__list` of `li.mh-breadcrumbs__item`s: `a.mh-breadcrumbs__link` (or a
 * button with `onClick`), then the current page as `span.mh-breadcrumbs__current` (`aria-current="page"`).
 * `.mh-breadcrumbs__separator` chevrons are decorative. With `maxItems`, the middle collapses into a
 * `button.mh-breadcrumbs__more` that expands the trail.
 */
export function createBreadcrumbs(options: BreadcrumbsOptions): BreadcrumbsHandle {
  const list = h('ol', { class: 'mh-breadcrumbs__list' });
  const el = h('nav', { class: 'mh-breadcrumbs', 'aria-label': options.label ?? 'Breadcrumb' }, list);
  let items = [...options.items];
  let expanded = false;

  function crumb(item: BreadcrumbItem, last: boolean): HTMLElement {
    const content = [item.icon ? createIcon(item.icon) : null, h('span', { class: 'mh-breadcrumbs__label' }, item.label)];
    if (last) return h('span', { class: 'mh-breadcrumbs__current', 'aria-current': 'page' }, ...content);
    if (item.href !== undefined) {
      const a = h('a', { class: 'mh-breadcrumbs__link', href: item.href }, ...content);
      if (item.onClick) a.addEventListener('click', item.onClick);
      return a;
    }
    const b = h('button', { type: 'button', class: 'mh-breadcrumbs__link' }, ...content);
    if (item.onClick) b.addEventListener('click', item.onClick);
    return b;
  }

  function render(): void {
    const slots = breadcrumbSlots(items.length, options.maxItems, expanded);
    const hidden = items.length - (slots.length - (slots.includes('more') ? 1 : 0));
    list.replaceChildren(
      ...slots.map((slot, i) => {
        const li = h('li', { class: 'mh-breadcrumbs__item' });
        if (slot === 'more') {
          const label = (options.moreLabel ?? breadcrumbMoreLabel)(hidden);
          const more = h('button', { type: 'button', class: 'mh-breadcrumbs__more', 'aria-label': label, title: label }, createIcon(mdiDotsHorizontal));
          more.addEventListener('click', () => {
            expanded = true;
            render();
            list.querySelectorAll<HTMLElement>('.mh-breadcrumbs__link')[1]?.focus();
          });
          li.append(more);
        } else {
          li.append(crumb(items[slot]!, slot === items.length - 1));
        }
        if (i < slots.length - 1) li.append(separator());
        return li;
      }),
    );
  }

  render();
  return {
    el,
    setItems(next) {
      items = [...next];
      expanded = false;
      render();
    },
  };
}
