import { cx, h } from '../dom.ts';

export type SkeletonShape = 'text' | 'block' | 'circle';

export interface SkeletonOptions {
  shape?: SkeletonShape;
  /** Text: number of lines (default 3; the last one is shorter). */
  lines?: number;
  /** Any CSS length for `block` and `circle` (default: full width, one large control high). */
  width?: string;
  height?: string;
  /** Read by screen readers (default "Loading"). */
  label?: string;
}

/** Line widths for a text skeleton: full lines with a shorter last one. */
export function skeletonLineWidths(lines = 3): string[] {
  const n = Math.max(1, Math.floor(lines));
  return Array.from({ length: n }, (_, i) => (i === n - 1 && n > 1 ? '60%' : '100%'));
}

/** Inline size of a block or circle shape, or `undefined` for the CSS default. */
export function skeletonShapeStyle(width?: string, height?: string): string | undefined {
  const s = [width && `width: ${width}`, height && `height: ${height}`].filter(Boolean).join('; ');
  return s || undefined;
}

export function skeletonClass(shape: SkeletonShape = 'text'): string {
  return cx('mh-skeleton', `mh-skeleton--${shape}`);
}

/**
 * `.mh-skeleton--text | --block | --circle`: shimmering placeholders while content loads. The root is a busy status
 * (`role="status"`, `aria-busy`); the shapes inside (`__line`, `__shape`) are hidden from assistive technology.
 */
export function createSkeleton(options: SkeletonOptions = {}): { el: HTMLDivElement } {
  const shape = options.shape ?? 'text';
  const children =
    shape === 'text'
      ? skeletonLineWidths(options.lines).map((w) => h('span', { class: 'mh-skeleton__line', 'aria-hidden': 'true', style: `width: ${w}` }))
      : [h('span', { class: 'mh-skeleton__shape', 'aria-hidden': 'true', style: skeletonShapeStyle(options.width, options.height) })];
  const el = h('div', { class: skeletonClass(shape), role: 'status', 'aria-busy': 'true', 'aria-label': options.label ?? 'Loading' }, ...children);
  return { el };
}
