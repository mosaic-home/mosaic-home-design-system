import { cx, h } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';

export interface EmptyStateOptions {
  title: string;
  text?: string;
  icon?: IconName | string;
  /** One action (usually a button). */
  action?: HTMLElement;
  /** Less padding and a smaller icon, for inside cards and lists. */
  compact?: boolean;
  /** Heading level of the title (default 3). */
  headingLevel?: 2 | 3 | 4;
}

export function emptyStateClass(compact = false): string {
  return cx('mh-empty-state', compact && 'mh-empty-state--compact');
}

/** `.mh-empty-state`: nothing here yet. Parts `__icon`, `__title`, `__text`, `__action`. */
export function createEmptyState(options: EmptyStateOptions): { el: HTMLDivElement } {
  const el = h(
    'div',
    { class: emptyStateClass(options.compact) },
    options.icon ? h('span', { class: 'mh-empty-state__icon' }, createIcon(options.icon)) : null,
    h(`h${options.headingLevel ?? 3}` as 'h3', { class: 'mh-empty-state__title' }, options.title),
    options.text ? h('p', { class: 'mh-empty-state__text' }, options.text) : null,
    options.action ? h('div', { class: 'mh-empty-state__action' }, options.action) : null,
  );
  return { el };
}
