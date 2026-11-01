import { mdiChevronDown } from '@mdi/js';
import { append, cx, h, uid, type Child } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';

/** `tool`: a compact surface for side panels and docks. `section`: a settings section with its title above a grouped surface. */
export type PanelVariant = 'tool' | 'section';

export interface PanelOptions {
  title: string;
  /** A line under the title (a settings section's explanation). */
  description?: string;
  icon?: IconName | string;
  /** Elements at the end of the header (icon buttons, a badge, a switch). */
  actions?: HTMLElement[];
  body?: Child | Child[];
  footer?: Child | Child[];
  /** Default `tool`. */
  variant?: PanelVariant;
  /** The title becomes a disclosure button that shows and hides the body. */
  collapsible?: boolean;
  /** Collapsible panels only: open at first (default true). */
  open?: boolean;
  /** Heading level of the title (default 3). */
  headingLevel?: 2 | 3 | 4;
  /** Body without padding, for lists that run edge to edge. */
  flush?: boolean;
  onToggle?: (open: boolean) => void;
}

export interface PanelHandle {
  el: HTMLElement;
  /** The body element, to append content later. */
  body: HTMLDivElement;
  open(): boolean;
  setOpen(open: boolean): void;
  setTitle(title: string): void;
}

export function panelClass(variant: PanelVariant = 'tool', collapsible = false, flush = false): string {
  return cx('mh-panel', variant === 'section' && 'mh-panel--section', collapsible && 'mh-panel--collapsible', flush && 'mh-panel--flush');
}

const list = (c: Child | Child[] | undefined): Child[] => (Array.isArray(c) ? c : c === undefined ? [] : [c]);

/**
 * `.mh-panel` (`--section`, `--collapsible`, `--flush`; `.is-collapsed`): a titled `section` with `__header`
 * (`__heading` holding the `__title`, or a `__toggle` disclosure button with a `__chevron`; `__description`,
 * `__actions`), a `__body` and an optional `__footer`.
 */
export function createPanel(options: PanelOptions): PanelHandle {
  const id = uid('mh-panel');
  const collapsible = options.collapsible ?? false;
  let isOpen = !collapsible || (options.open ?? true);
  const title = h('span', { class: 'mh-panel__title', id: `${id}-title` }, options.title);
  const titleContent: Child[] = [options.icon ? createIcon(options.icon, { class: 'mh-panel__icon' }) : null, title];
  const toggle = collapsible
    ? h('button', { type: 'button', class: 'mh-panel__toggle', 'aria-controls': `${id}-body` }, ...titleContent, createIcon(mdiChevronDown, { class: 'mh-panel__chevron' }))
    : null;
  const heading = h(`h${options.headingLevel ?? 3}` as 'h3', { class: 'mh-panel__heading' }, ...(toggle ? [toggle] : titleContent));
  const header = h(
    'div',
    { class: 'mh-panel__header' },
    h('div', { class: 'mh-panel__titles' }, heading, options.description ? h('p', { class: 'mh-panel__description' }, options.description) : null),
    options.actions?.length ? h('div', { class: 'mh-panel__actions' }, ...options.actions) : null,
  );
  const body = h('div', { class: 'mh-panel__body', id: `${id}-body` });
  append(body, ...list(options.body));
  const footer = options.footer !== undefined ? h('div', { class: 'mh-panel__footer' }, ...list(options.footer)) : null;
  const el = h('section', { class: panelClass(options.variant, collapsible, options.flush), 'aria-labelledby': `${id}-title` }, header, body, footer);

  const sync = (): void => {
    toggle?.setAttribute('aria-expanded', String(isOpen));
    el.classList.toggle('is-collapsed', !isOpen);
    body.hidden = !isOpen;
    if (footer) footer.hidden = !isOpen;
  };
  const setOpen = (value: boolean, notify: boolean): void => {
    if (!collapsible || value === isOpen) return;
    isOpen = value;
    sync();
    if (notify) options.onToggle?.(isOpen);
  };
  toggle?.addEventListener('click', () => setOpen(!isOpen, true));
  sync();

  return {
    el,
    body,
    open: () => isOpen,
    setOpen: (value) => setOpen(value, false),
    setTitle: (text) => {
      title.textContent = text;
    },
  };
}
