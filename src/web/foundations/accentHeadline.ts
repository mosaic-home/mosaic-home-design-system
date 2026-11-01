import { cx, h } from '../dom.ts';

export type AccentHeadlineSize = 'display' | 'headline' | 'title';
export type AccentHeadlineLevel = 1 | 2 | 3 | 4;
/** Colour of the accent phrase: the theme accent, or the headline's own colour (serif italic only). */
export type AccentHeadlineTone = 'accent' | 'inherit';

export interface AccentHeadlineOptions {
  /** The whole headline. */
  text: string;
  /** A phrase inside `text` set in serif italic; its first occurrence is used, or it is appended when absent. */
  accent?: string;
  size?: AccentHeadlineSize;
  /** Heading level; default 2. */
  level?: AccentHeadlineLevel;
  tone?: AccentHeadlineTone;
}

export interface AccentHeadlineHandle {
  el: HTMLHeadingElement;
  setText(text: string, accent?: string): void;
}

/** The headline split around its accent phrase: `[before, accent, after]`. */
export function splitAccent(text: string, accent?: string): [string, string, string] {
  if (!accent) return [text, '', ''];
  const at = text.indexOf(accent);
  if (at < 0) return [text ? `${text} ` : '', accent, ''];
  return [text.slice(0, at), accent, text.slice(at + accent.length)];
}

export function accentHeadlineClass(size: AccentHeadlineSize = 'headline', tone: AccentHeadlineTone = 'accent'): string {
  return cx('mh-accent-headline', `mh-accent-headline--${size}`, tone === 'inherit' && 'mh-accent-headline--inherit');
}

/**
 * `.mh-accent-headline--display | --headline | --title`: a heading in the sans face with one phrase,
 * `.mh-accent-headline__accent`, in the serif face, italic and (by default) in the accent colour.
 */
export function createAccentHeadline(options: AccentHeadlineOptions): AccentHeadlineHandle {
  const el = h(`h${options.level ?? 2}` as 'h2', { class: accentHeadlineClass(options.size, options.tone) });
  const setText = (text: string, accent?: string): void => {
    const [before, phrase, after] = splitAccent(text, accent);
    el.replaceChildren();
    if (before) el.append(before);
    if (phrase) el.append(h('em', { class: 'mh-accent-headline__accent' }, phrase));
    if (after) el.append(after);
  };
  setText(options.text, options.accent);
  return { el, setText };
}
