import { cx, h } from '../dom.ts';

export type SpinnerSize = 'small' | 'medium' | 'large';

export interface SpinnerOptions {
  size?: SpinnerSize;
  /** Read by screen readers (default "Loading"). */
  label?: string;
  /** Takes the current text colour instead of the accent (inside buttons and chips). */
  inherit?: boolean;
}

export function spinnerClass(size: SpinnerSize = 'medium', inherit = false): string {
  return cx('mh-spinner', size !== 'medium' && `mh-spinner--${size === 'small' ? 'sm' : 'lg'}`, inherit && 'mh-spinner--inherit');
}

/** `.mh-spinner`: a busy indicator (`role="status"` with a visually hidden label `__label`). */
export function createSpinner(options: SpinnerOptions = {}): { el: HTMLSpanElement } {
  const el = h('span', { class: spinnerClass(options.size, options.inherit), role: 'status' }, h('span', { class: 'mh-visually-hidden' }, options.label ?? 'Loading'));
  return { el };
}
