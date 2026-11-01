import { cx, h } from '../dom.ts';

export interface BackdropOptions {
  /** Cover the viewport (`position: fixed`) instead of the nearest `.mh-backdrop-host`. */
  fixed?: boolean;
  /** Let the ambient glow drift slowly. Still with reduced motion, and invisible in calm themes (no glow). */
  drift?: boolean;
  /** Lay the theme's scrim over the canvas, e.g. behind a screensaver clock. */
  dim?: boolean;
}

export interface BackdropHandle {
  el: HTMLDivElement;
  setDrift(drift: boolean): void;
  setDim(dim: boolean): void;
}

export function backdropClass(options: BackdropOptions = {}): string {
  return cx('mh-backdrop', options.fixed && 'mh-backdrop--fixed', options.drift && 'mh-backdrop--drift', options.dim && 'mh-backdrop--dim');
}

/**
 * `.mh-backdrop` (`--fixed`, `--drift`, `--dim`): the canvas behind a screen, a decorative layer painted from the
 * theme's `--mh-backdrop`: gradient and ambient glow, or the flat canvas when the theme turns its backdrop off. Put
 * it first inside a `.mh-backdrop-host` (or make it `fixed`); the host's content stays above it.
 */
export function createBackdrop(options: BackdropOptions = {}): BackdropHandle {
  const el = h('div', { class: backdropClass(options), 'aria-hidden': 'true' });
  return {
    el,
    setDrift(drift) {
      el.classList.toggle('mh-backdrop--drift', drift);
    },
    setDim(dim) {
      el.classList.toggle('mh-backdrop--dim', dim);
    },
  };
}
