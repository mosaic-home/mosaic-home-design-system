import { cx, h, type Child } from '../dom.ts';

/** A step of the theme's spacing scale (`--mh-space-*`), or none. */
export type Space = 'none' | 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type StackJustify = 'start' | 'center' | 'end' | 'between';

export interface StackOptions {
  /** `column` (default) or `row`. */
  direction?: 'column' | 'row';
  gap?: Space;
  align?: StackAlign;
  justify?: StackJustify;
  /** Rows wrap onto more lines. */
  wrap?: boolean;
  /** Element to render (default `div`). */
  as?: 'div' | 'section' | 'ul' | 'ol' | 'nav' | 'header' | 'footer';
}

export function stackClass(options: Omit<StackOptions, 'as'> = {}): string {
  const gap = options.gap ?? 'md';
  return cx(
    'mh-stack',
    options.direction === 'row' && 'mh-stack--row',
    gap !== 'md' && `mh-stack--gap-${gap}`,
    options.align && `mh-stack--align-${options.align}`,
    options.justify && `mh-stack--justify-${options.justify}`,
    options.wrap && 'mh-stack--wrap',
  );
}

/** `.mh-stack`: children in a column or (`--row`) a row, spaced by `--mh-space-*` (`--gap-<step>`, default `md`). */
export function createStack(options: StackOptions = {}, ...children: Child[]): { el: HTMLElement } {
  return { el: h(options.as ?? 'div', { class: stackClass(options) }, ...children) };
}

/** Shorthand for a row stack, centred on the cross axis. */
export function createRow(options: Omit<StackOptions, 'direction'> = {}, ...children: Child[]): { el: HTMLElement } {
  return createStack({ align: 'center', ...options, direction: 'row' }, ...children);
}

export type GridMin = 'small' | 'medium' | 'large';

export interface GridOptions {
  /** Minimum column width; columns fill the row (default `medium`). Follows the touch-target size. */
  min?: GridMin;
  gap?: Space;
  as?: 'div' | 'section' | 'ul' | 'ol';
}

export function gridClass(options: Omit<GridOptions, 'as'> = {}): string {
  const min = options.min ?? 'medium';
  const gap = options.gap ?? 'md';
  return cx('mh-grid', min !== 'medium' && `mh-grid--${min === 'small' ? 'sm' : 'lg'}`, gap !== 'md' && `mh-grid--gap-${gap}`);
}

/** `.mh-grid`: a responsive card grid (`--sm | --lg` minimum column, `--gap-<step>`). */
export function createGrid(options: GridOptions = {}, ...children: Child[]): { el: HTMLElement } {
  return { el: h(options.as ?? 'div', { class: gridClass(options) }, ...children) };
}
