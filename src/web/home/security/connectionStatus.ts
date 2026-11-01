import { mdiCloudCheck, mdiCloudOff, mdiCloudSync, mdiKeyAlert } from '@mdi/js';
import { buttonClass } from '../../actions/button.ts';
import { cx, h } from '../../dom.ts';
import { createIcon } from '../../icons.ts';
import { syncChildren } from '../children.ts';

/**
 * The link to the home server. `rejected`: the server answered but refused the credentials (a revoked access
 * token), so retrying alone won't help.
 */
export type ConnectionState = 'connected' | 'connecting' | 'reconnecting' | 'offline' | 'rejected';

export type ConnectionStatusVariant = 'pill' | 'banner';

export interface ConnectionStatusLabels {
  states: Record<ConnectionState, string>;
  /** The countdown: `{time}` is "12 s" or "1 min 5 s". */
  retryIn: string;
  /** When the countdown has run out. */
  retrying: string;
  retry: string;
}

export const CONNECTION_STATUS_LABELS: ConnectionStatusLabels = {
  states: { connected: 'Connected', connecting: 'Connecting', reconnecting: 'Reconnecting', offline: 'Offline', rejected: 'Access refused' },
  retryIn: 'Retrying in {time}',
  retrying: 'Retrying…',
  retry: 'Retry now',
};

export type ConnectionStatusLabelsInput = Partial<Omit<ConnectionStatusLabels, 'states'>> & { states?: Partial<ConnectionStatusLabels['states']> };

export interface ConnectionStatusOptions {
  state: ConnectionState;
  /** The server's name or address ("homeassistant.local"), shown after the state. */
  server?: string | null;
  /** When the next attempt starts, in epoch milliseconds: a countdown. */
  retryAt?: number | null;
  /** Replaces the second line (for example "Check the access token in Settings"). */
  detail?: string | null;
  /** `pill` (default) sits in a corner; `banner` spans the top of a screen. */
  variant?: ConnectionStatusVariant;
  /** While connected, only a small dot (named for screen readers). */
  quietWhenConnected?: boolean;
  labels?: ConnectionStatusLabelsInput;
  /** Offers "Retry now" while not connected. */
  onRetry?: () => void;
}

export interface ConnectionStatusHandle {
  el: HTMLDivElement;
  update(changes: Partial<ConnectionStatusOptions>): void;
  /** Stops the countdown timer. */
  destroy(): void;
}

export function connectionStatusLabels(labels: ConnectionStatusLabelsInput | undefined): ConnectionStatusLabels {
  return { ...CONNECTION_STATUS_LABELS, ...labels, states: { ...CONNECTION_STATUS_LABELS.states, ...labels?.states } };
}

const ICON: Record<ConnectionState, string> = { connected: mdiCloudCheck, connecting: mdiCloudSync, reconnecting: mdiCloudSync, offline: mdiCloudOff, rejected: mdiKeyAlert };

export const connectionIcon = (state: ConnectionState): string => ICON[state];

/** "12 s", "1 min 5 s". */
export function formatRetryIn(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m} min ${r} s` : `${m} min`;
}

export interface ConnectionStatusView {
  stateText: string;
  /** The second line (countdown, detail or server), or empty. */
  detail: string;
  quiet: boolean;
  retry: boolean;
  busy: boolean;
}

/** What the status shows at time `now`. */
export function connectionStatusView(o: ConnectionStatusOptions, now: number): ConnectionStatusView {
  const l = connectionStatusLabels(o.labels);
  const connected = o.state === 'connected';
  const quiet = connected && !!o.quietWhenConnected;
  let detail = o.detail?.trim() ?? '';
  if (!detail && !connected && o.state !== 'rejected' && o.retryAt !== null && o.retryAt !== undefined && Number.isFinite(o.retryAt)) {
    const left = Math.ceil((o.retryAt - now) / 1000);
    detail = left > 0 ? l.retryIn.replace('{time}', formatRetryIn(left)) : l.retrying;
  }
  if (!detail) detail = o.server?.trim() ?? '';
  return { stateText: l.states[o.state], detail: quiet ? '' : detail, quiet, retry: !connected && !!o.onRetry, busy: o.state === 'connecting' || o.state === 'reconnecting' };
}

export function connectionStatusClass(o: Pick<ConnectionStatusOptions, 'state' | 'variant'>, view: Pick<ConnectionStatusView, 'quiet' | 'busy'>): string {
  return cx('mh-connection-status', `mh-connection-status--${o.state}`, o.variant === 'banner' && 'mh-connection-status--banner', view.quiet && 'is-quiet', view.busy && 'is-busy');
}

export const CONNECTION_RETRY_CLASS = cx(buttonClass('secondary', 'small'), 'mh-connection-status__retry');

/**
 * `.mh-connection-status` (`--<state>`, `--banner`): an `__icon`, `__text` with the `__state` (a `role="status"`
 * region, so changes are announced, the ticking countdown not) and the `__detail` line (the retry countdown,
 * a given detail or the server's name), and a "Retry now" `__retry` button while not connected. States
 * `.is-busy` (connecting, the icon pulses unless motion is reduced) and `.is-quiet` (connected with
 * `quietWhenConnected`: a dot only).
 */
export function createConnectionStatus(options: ConnectionStatusOptions): ConnectionStatusHandle {
  let o: ConnectionStatusOptions = { ...options };
  let timer: ReturnType<typeof setInterval> | undefined;
  const icon = h('span', { class: 'mh-connection-status__icon', 'aria-hidden': 'true' });
  const state = h('span', { class: 'mh-connection-status__state', role: 'status' });
  const detail = h('span', { class: 'mh-connection-status__detail' });
  const text = h('span', { class: 'mh-connection-status__text' }, state);
  const retry = h('button', { type: 'button', class: CONNECTION_RETRY_CLASS }, h('span', { class: 'mh-button__label' }));
  retry.addEventListener('click', () => o.onRetry?.());
  const el = h('div', {});
  let iconPath = '';

  const tick = (): void => {
    const counting = o.state !== 'connected' && o.state !== 'rejected' && !o.detail && typeof o.retryAt === 'number' && o.retryAt > Date.now();
    if (counting && timer === undefined) timer = setInterval(render, 1000);
    if (!counting && timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  };
  function render(): void {
    const l = connectionStatusLabels(o.labels);
    const view = connectionStatusView(o, Date.now());
    el.className = connectionStatusClass(o, view);
    const path = connectionIcon(o.state);
    if (path !== iconPath) {
      iconPath = path;
      icon.replaceChildren(createIcon(path));
    }
    state.textContent = view.stateText;
    state.classList.toggle('mh-visually-hidden', view.quiet);
    detail.textContent = view.detail;
    syncChildren(text, view.detail ? [state, detail] : [state]);
    retry.firstElementChild!.textContent = l.retry;
    syncChildren(el, view.retry ? [icon, text, retry] : [icon, text]);
    tick();
  }
  render();
  return {
    el,
    update(changes) {
      o = { ...o, ...changes };
      render();
    },
    destroy() {
      clearInterval(timer);
      timer = undefined;
    },
  };
}
