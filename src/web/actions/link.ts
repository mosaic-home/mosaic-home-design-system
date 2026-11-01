import { mdiOpenInNew } from '@mdi/js';
import { cx, h } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';

export type LinkTone = 'accent' | 'muted' | 'inherit';
/** `always`: underlined at rest (the default, for links in running text). `hover`: underline on hover and focus only. */
export type LinkUnderline = 'always' | 'hover';

/** The icon after an external link. */
export const LINK_EXTERNAL_ICON = mdiOpenInNew;

export interface LinkOptions {
  text: string;
  /** Without an `href` the link is a `<button>` (an action styled as a link). */
  href?: string;
  tone?: LinkTone;
  underline?: LinkUnderline;
  /** Leading icon. */
  icon?: IconName | string;
  /** Opens in a new tab (`target="_blank"`, `rel="noopener noreferrer"`), with an icon and a spoken hint. */
  external?: boolean;
  /** The spoken hint of an external link; default "opens in a new tab". */
  newTabLabel?: string;
  onClick?: (event: MouseEvent) => void;
}

export interface LinkHandle {
  el: HTMLAnchorElement | HTMLButtonElement;
  setText(text: string): void;
}

export function linkClass(tone: LinkTone = 'accent', underline: LinkUnderline = 'always'): string {
  return cx('mh-link', `mh-link--${tone}`, underline === 'hover' && 'mh-link--subtle');
}

/**
 * `.mh-link--accent | --muted | --inherit` (`--subtle`: underline on hover): an inline text link. Parts `__text`
 * (carries the underline, so icons aren't underlined) and `__external`. A link with no `href` renders a `<button>`.
 */
export function createLink(options: LinkOptions): LinkHandle {
  const text = h('span', { class: 'mh-link__text' }, options.text);
  const external = options.href !== undefined && options.external;
  const children = [
    options.icon ? createIcon(options.icon) : null,
    text,
    external ? createIcon(LINK_EXTERNAL_ICON, { class: 'mh-link__external' }) : null,
    external ? h('span', { class: 'mh-visually-hidden' }, ` (${options.newTabLabel ?? 'opens in a new tab'})`) : null,
  ];
  const cls = linkClass(options.tone, options.underline);
  const el =
    options.href !== undefined
      ? h('a', { class: cls, href: options.href, target: external ? '_blank' : null, rel: external ? 'noopener noreferrer' : null }, ...children)
      : h('button', { type: 'button', class: cls }, ...children);
  if (options.onClick) el.addEventListener('click', options.onClick as EventListener);
  return {
    el,
    setText(value) {
      text.textContent = value;
    },
  };
}
