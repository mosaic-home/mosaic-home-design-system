import { append, cx, h, type Child } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';

export type CardVariant = 'raised' | 'flat' | 'inset';
export type ClampLines = 1 | 2 | 3;

export interface CardOptions {
  title?: string;
  subtitle?: string;
  /** A small line above the title ("Source · 2 h ago"). */
  eyebrow?: string;
  /** Clamps the title to this many lines. */
  titleLines?: ClampLines;
  /** Small icon before the title. */
  icon?: IconName | string;
  /** An element at the end of the header (an icon button, a badge, a switch). */
  headerAction?: HTMLElement;
  /** Edge-to-edge media at the top (an `<img>`), shown 16:9 and cropped to cover. */
  media?: HTMLElement;
  /** Width / height of the media (default 16 / 9); a wider one (2 or 2.4) keeps pictures short in a list or carousel. */
  mediaAspect?: number;
  /** Body content. */
  body?: Child | Child[];
  /** Footer content (usually buttons). */
  footer?: Child | Child[];
  /** `raised` (default) lifts off the canvas with `--mh-shadow-1`; `flat` has no shadow; `inset` sits in a well. */
  variant?: CardVariant;
  /** The whole card is one link (`<a href>`). Don't put other links or buttons inside. */
  href?: string;
  /** Link target; `_blank` also sets `rel="noopener noreferrer"`. */
  target?: string;
  /** The whole card is one pressable target (`role="button"`, Enter and Space); with `href`, a click listener on the link. */
  onClick?: (event: MouseEvent | KeyboardEvent) => void;
  /** Accessible name of a pressable card (default: its text). */
  label?: string;
  /** Heading level of the title (default 3). */
  headingLevel?: 2 | 3 | 4;
}

export interface CardHandle {
  el: HTMLElement;
  /** The body element, to append content later. */
  body: HTMLDivElement;
  setTitle(title: string): void;
  setSubtitle(subtitle: string): void;
}

export function cardClass(variant: CardVariant = 'raised', interactive = false): string {
  return cx('mh-card', variant !== 'raised' && `mh-card--${variant}`, interactive && 'mh-card--interactive');
}

/** `.mh-clamp-<n>`: cuts text to n lines with an ellipsis (base.css). */
export function clampClass(lines: ClampLines | undefined): string | undefined {
  return lines ? `mh-clamp-${lines}` : undefined;
}

export function cardTitleClass(lines?: ClampLines): string {
  return cx('mh-card__title', clampClass(lines));
}

/** Inline style of the media box for a custom aspect, or null for the default 16:9. */
export function cardMediaStyle(aspect: number | undefined): string | null {
  return aspect && aspect > 0 && Number.isFinite(aspect) ? `aspect-ratio: ${Math.round(aspect * 10000) / 10000}` : null;
}

export function cardLinkRel(target: string | undefined): string | undefined {
  return target === '_blank' ? 'noopener noreferrer' : undefined;
}

const list = (c: Child | Child[] | undefined): Child[] => (Array.isArray(c) ? c : c === undefined ? [] : [c]);

/**
 * `.mh-card`: a surface with `--mh-surface`, the panel outline, `--mh-radius-lg` and `--mh-shadow-1`. Parts
 * `__media`, `__header` (`__icon`, `__heading` with `__eyebrow`, `__title`, `__subtitle`; `__action`), `__body`,
 * `__footer`. Variants `--flat`, `--inset`; `--interactive` when the whole card is pressable, as a `role="button"`
 * or, with `href`, as an `<a>`.
 */
export function createCard(options: CardOptions = {}): CardHandle {
  const link = options.href !== undefined;
  const interactive = link || Boolean(options.onClick);
  const title = h(`h${options.headingLevel ?? 3}` as 'h3', { class: cardTitleClass(options.titleLines) }, options.title ?? '');
  const subtitle = h('p', { class: 'mh-card__subtitle' }, options.subtitle ?? '');
  const hasHeader = options.title !== undefined || options.subtitle !== undefined || options.eyebrow !== undefined || options.headerAction !== undefined;
  const header = hasHeader
    ? h(
        'div',
        { class: 'mh-card__header' },
        options.icon ? h('span', { class: 'mh-card__icon' }, createIcon(options.icon)) : null,
        h(
          'div',
          { class: 'mh-card__heading' },
          options.eyebrow !== undefined && h('p', { class: 'mh-card__eyebrow' }, options.eyebrow),
          options.title !== undefined && title,
          options.subtitle !== undefined && subtitle,
        ),
        options.headerAction ? h('div', { class: 'mh-card__action' }, options.headerAction) : null,
      )
    : null;
  const media = options.media ? h('div', { class: 'mh-card__media', style: cardMediaStyle(options.mediaAspect) ?? undefined }, options.media) : null;
  const body = h('div', { class: 'mh-card__body' });
  append(body, ...list(options.body));
  const footerChildren = list(options.footer);
  const footer = footerChildren.length ? h('div', { class: 'mh-card__footer' }, ...footerChildren) : null;
  const cls = cardClass(options.variant, interactive);
  const el: HTMLElement = link
    ? h('a', { class: cls, href: options.href, target: options.target, rel: cardLinkRel(options.target), 'aria-label': options.label }, media, header, body, footer)
    : h(
        'div',
        { class: cls, role: interactive ? 'button' : null, tabindex: interactive ? 0 : null, 'aria-label': interactive ? options.label : null },
        media,
        header,
        body,
        footer,
      );
  if (options.onClick) {
    const onClick = options.onClick;
    el.addEventListener('click', (e) => onClick(e));
    if (!link)
      el.addEventListener('keydown', (e) => {
        if (e.target !== el || (e.key !== 'Enter' && e.key !== ' ')) return;
        e.preventDefault();
        onClick(e);
      });
  }
  return {
    el,
    body,
    setTitle(text) {
      title.textContent = text;
    },
    setSubtitle(text) {
      subtitle.textContent = text;
    },
  };
}
