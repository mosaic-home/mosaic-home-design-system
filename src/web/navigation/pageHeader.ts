import { mdiChevronLeft } from '@mdi/js';
import { iconButtonClass } from '../actions/iconButton.ts';
import { append, h, type Child } from '../dom.ts';
import { createIcon } from '../icons.ts';

export interface PageHeaderBack {
  /** Accessible name. Default "Back". */
  label?: string;
  /** A link back instead of a button. */
  href?: string;
  onClick?: (event: MouseEvent) => void;
}

export interface PageHeaderOptions {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  /** Buttons or other controls on the trailing side. */
  actions?: Child[];
  /** A back button before the title. */
  back?: PageHeaderBack;
  /** Heading level of the title. Default 1. */
  level?: 1 | 2 | 3;
}

export interface PageHeaderHandle {
  el: HTMLElement;
  setTitle(title: string): void;
  setSubtitle(subtitle: string | null): void;
  setEyebrow(eyebrow: string | null): void;
  setActions(...actions: Child[]): void;
}

/** Classes of the back control (an icon button). */
export const pageHeaderBackClass = `${iconButtonClass()} mh-page-header__back`;

/**
 * `.mh-page-header`: an optional `.mh-page-header__back` button, an `<hgroup>` of `__eyebrow`, `__title` (an h1 by
 * default) and `__subtitle`, and an `__actions` slot that wraps under the text on narrow screens.
 */
export function createPageHeader(options: PageHeaderOptions): PageHeaderHandle {
  const backLabel = options.back?.label ?? 'Back';
  let back: HTMLElement | null = null;
  if (options.back) {
    back = options.back.href
      ? h('a', { class: pageHeaderBackClass, href: options.back.href, 'aria-label': backLabel, title: backLabel }, createIcon(mdiChevronLeft))
      : h('button', { type: 'button', class: pageHeaderBackClass, 'aria-label': backLabel, title: backLabel }, createIcon(mdiChevronLeft));
    if (options.back.onClick) back.addEventListener('click', options.back.onClick as EventListener);
  }
  const eyebrow = h('p', { class: 'mh-page-header__eyebrow' });
  const title = h(`h${options.level ?? 1}` as 'h1', { class: 'mh-page-header__title' }, options.title);
  const subtitle = h('p', { class: 'mh-page-header__subtitle' });
  const actions = h('div', { class: 'mh-page-header__actions' });
  const el = h('header', { class: 'mh-page-header' }, back, h('hgroup', { class: 'mh-page-header__text' }, eyebrow, title, subtitle), actions);

  const setText = (node: HTMLElement, text: string | null | undefined): void => {
    node.textContent = text ?? '';
    node.hidden = !text;
  };
  const handle: PageHeaderHandle = {
    el,
    setTitle: (text) => void (title.textContent = text),
    setSubtitle: (text) => setText(subtitle, text),
    setEyebrow: (text) => setText(eyebrow, text),
    setActions(...nodes) {
      actions.replaceChildren();
      append(actions, ...nodes);
      actions.hidden = actions.childNodes.length === 0;
    },
  };
  setText(eyebrow, options.eyebrow);
  setText(subtitle, options.subtitle);
  handle.setActions(...(options.actions ?? []));
  return handle;
}
