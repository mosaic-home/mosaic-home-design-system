import { cx, h, type Child } from '../dom.ts';

export type TextVariant = 'display' | 'headline' | 'title' | 'body' | 'label' | 'caption' | 'eyebrow' | 'mono';
export type TextTone = 'default' | 'muted' | 'faint' | 'accent' | 'success' | 'warning' | 'danger';

export interface TextOptions {
  variant?: TextVariant;
  tone?: TextTone;
  /** Element to render; default `p`, or `h1`–`h3` for display, headline and title. */
  as?: keyof HTMLElementTagNameMap;
}

const DEFAULT_TAG: Partial<Record<TextVariant, keyof HTMLElementTagNameMap>> = { display: 'h1', headline: 'h2', title: 'h3', eyebrow: 'span', mono: 'code' };

export function textClass(variant: TextVariant = 'body', tone: TextTone = 'default'): string {
  return cx('mh-text', `mh-text--${variant}`, tone !== 'default' && `mh-text--${tone}`);
}

/** `.mh-text--<variant>`: the type scale at the current device class. */
export function createText(content: Child, options: TextOptions = {}): HTMLElement {
  const tag = options.as ?? DEFAULT_TAG[options.variant ?? 'body'] ?? 'p';
  return h(tag, { class: textClass(options.variant, options.tone) }, content);
}

export interface DividerOptions {
  vertical?: boolean;
  label?: string;
}

/** `.mh-divider`: a horizontal or vertical rule, optionally labelled. */
export function createDivider(options: DividerOptions = {}): HTMLElement {
  if (options.label) return h('div', { class: 'mh-divider mh-divider--labelled', role: 'separator' }, options.label);
  return h('hr', { class: cx('mh-divider', options.vertical && 'mh-divider--vertical'), 'aria-orientation': options.vertical ? 'vertical' : null });
}
