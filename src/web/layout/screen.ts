import { cx, h, type Child } from '../dom.ts';

export type ScreenWidth = 'narrow' | 'medium' | 'wide' | 'full';

export interface ScreenOptions {
  /** Width of the centred column (default `medium`). */
  width?: ScreenWidth;
  /** The canvas backdrop behind the page (default true); `false` leaves the background to the host. */
  canvas?: boolean;
  /** Content above the column's main content (a top app bar or a greeting). */
  header?: HTMLElement;
  /** Accessible name of the main region. */
  label?: string;
}

export interface ScreenHandle {
  el: HTMLDivElement;
  /** The `main` column to append content to. */
  main: HTMLElement;
}

export function screenClass(width: ScreenWidth = 'medium', canvas = true): string {
  return cx('mh-screen', canvas && 'mh-canvas', width !== 'medium' && `mh-screen--${width}`);
}

/**
 * `.mh-screen`: the page shell. The canvas backdrop (`.mh-canvas`), safe-area padding and a centred column
 * (`__column`, with an optional `__header` and the `main` region `__main`). Widths `--narrow | --wide | --full`.
 */
export function createScreen(options: ScreenOptions = {}, ...children: Child[]): ScreenHandle {
  const main = h('main', { class: 'mh-screen__main', 'aria-label': options.label }, ...children);
  const el = h(
    'div',
    { class: screenClass(options.width, options.canvas ?? true) },
    h('div', { class: 'mh-screen__column' }, options.header ? h('header', { class: 'mh-screen__header' }, options.header) : null, main),
  );
  return { el, main };
}
