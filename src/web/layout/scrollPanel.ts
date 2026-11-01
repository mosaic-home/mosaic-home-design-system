import { cx, h, type Child } from '../dom.ts';

/** Height of the region: a multiple of the touch-target size, so it scales with the device class. */
export type ScrollPanelSize = 'small' | 'medium' | 'large' | 'fill';

export interface ScrollPanelOptions {
  /** Default `medium`; `fill` takes the height of its container. */
  size?: ScrollPanelSize;
  /** Scroll direction (default `y`). */
  axis?: 'x' | 'y';
  /** Accessible name; the viewport is a focusable region so keyboards can scroll it. */
  label: string;
  /** Edge shadows hint at more content (default true). */
  shadows?: boolean;
  /** An inset well instead of a bare region. */
  inset?: boolean;
}

export interface ScrollPanelController {
  /** Re-reads the scroll position (after content changes). */
  update(): void;
  destroy(): void;
}

export interface ScrollPanelHandle extends ScrollPanelController {
  el: HTMLDivElement;
  /** The scrolling element; append content here. */
  viewport: HTMLDivElement;
  scrollToStart(): void;
  scrollToEnd(): void;
}

export function scrollPanelClass(options: Omit<ScrollPanelOptions, 'label'> = {}): string {
  const size = options.size ?? 'medium';
  return cx(
    'mh-scroll-panel',
    size !== 'medium' && `mh-scroll-panel--${size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'fill'}`,
    options.axis === 'x' && 'mh-scroll-panel--x',
    options.shadows === false && 'mh-scroll-panel--plain',
    options.inset && 'mh-scroll-panel--inset',
  );
}

/** Which edges have content beyond them. A pixel of slack absorbs sub-pixel rounding. */
export function scrollOverflow(position: number, client: number, total: number): { start: boolean; end: boolean } {
  const pos = Math.abs(position);
  return { start: pos > 1, end: pos + client < total - 1 };
}

/** Keeps `.is-overflow-start` and `.is-overflow-end` on a scroll panel in step with its viewport. Shared with React. */
export function bindScrollPanel(root: HTMLElement): ScrollPanelController {
  const viewport = root.querySelector<HTMLElement>(':scope > .mh-scroll-panel__viewport')!;
  const horizontal = root.classList.contains('mh-scroll-panel--x');
  const update = (): void => {
    const o = horizontal
      ? scrollOverflow(viewport.scrollLeft, viewport.clientWidth, viewport.scrollWidth)
      : scrollOverflow(viewport.scrollTop, viewport.clientHeight, viewport.scrollHeight);
    root.classList.toggle('is-overflow-start', o.start);
    root.classList.toggle('is-overflow-end', o.end);
  };
  viewport.addEventListener('scroll', update, { passive: true });
  const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(update) : null;
  resize?.observe(viewport);
  const mutation = typeof MutationObserver === 'function' ? new MutationObserver(update) : null;
  mutation?.observe(viewport, { childList: true, subtree: true });
  update();
  return {
    update,
    destroy: () => {
      viewport.removeEventListener('scroll', update);
      resize?.disconnect();
      mutation?.disconnect();
    },
  };
}

/**
 * `.mh-scroll-panel` (`--sm | --lg | --fill`, `--x`, `--plain`, `--inset`; `.is-overflow-start`,
 * `.is-overflow-end`): a fixed-height region whose `__viewport` scrolls with a themed scrollbar and fades its edges
 * while there is more to see.
 */
export function createScrollPanel(options: ScrollPanelOptions, ...children: Child[]): ScrollPanelHandle {
  const viewport = h('div', { class: 'mh-scroll-panel__viewport', role: 'region', 'aria-label': options.label, tabindex: 0 }, ...children);
  const el = h('div', { class: scrollPanelClass(options) }, viewport);
  const controller = bindScrollPanel(el);
  const horizontal = options.axis === 'x';
  return {
    el,
    viewport,
    ...controller,
    scrollToStart: () => viewport.scrollTo(horizontal ? { left: 0 } : { top: 0 }),
    scrollToEnd: () => viewport.scrollTo(horizontal ? { left: viewport.scrollWidth } : { top: viewport.scrollHeight }),
  };
}
