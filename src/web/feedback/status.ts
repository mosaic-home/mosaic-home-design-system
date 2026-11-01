import { cx, h } from '../dom.ts';

export type StatusState = 'online' | 'offline' | 'busy' | 'away' | 'error' | 'unknown' | 'live';

export interface StatusOptions {
  state: StatusState;
  /** Visible label; defaults to the state ("Online", "Live"). */
  label?: string;
  /** Makes it a polite live region (`role="status"`) so changes are announced. */
  announce?: boolean;
}

export interface StatusHandle {
  el: HTMLSpanElement;
  setState(state: StatusState, label?: string): void;
}

export const STATUS_LABELS: Record<StatusState, string> = {
  online: 'Online',
  offline: 'Offline',
  busy: 'Busy',
  away: 'Away',
  error: 'Error',
  unknown: 'Unknown',
  live: 'Live',
};

export function statusClass(state: StatusState): string {
  return cx('mh-status', `mh-status--${state}`);
}

/**
 * `.mh-status--online | --offline | --busy | --away | --error | --unknown | --live`: a dot and a label; `live` is the
 * pulsing LIVE badge. Parts `__dot` (decorative) and `__label`.
 */
export function createStatus(options: StatusOptions): StatusHandle {
  const label = h('span', { class: 'mh-status__label' });
  const el = h('span', { role: options.announce ? 'status' : null }, h('span', { class: 'mh-status__dot', 'aria-hidden': 'true' }), label);
  const setState = (state: StatusState, text?: string): void => {
    el.className = statusClass(state);
    label.textContent = text ?? STATUS_LABELS[state];
  };
  setState(options.state, options.label);
  return { el, setState };
}
