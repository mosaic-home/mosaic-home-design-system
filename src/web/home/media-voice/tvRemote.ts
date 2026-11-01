import { mdiArrowULeftTop, mdiChevronDown, mdiChevronLeft, mdiChevronRight, mdiChevronUp, mdiHomeOutline, mdiMenu, mdiMinus, mdiPlayPause, mdiPlus, mdiPower, mdiVolumeOff } from '@mdi/js';
import { buttonClass } from '../../actions/button.ts';
import { iconButtonClass } from '../../actions/iconButton.ts';
import { cx, h } from '../../dom.ts';
import { createIcon, type IconName } from '../../icons.ts';
import { syncChildren } from '../children.ts';

export type TvRemoteKey =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'ok'
  | 'back'
  | 'home'
  | 'menu'
  | 'power'
  | 'mute'
  | 'play-pause'
  | 'volume-up'
  | 'volume-down'
  | 'channel-up'
  | 'channel-down';

/** Every key, in the order the remote lays them out. */
export const TV_REMOTE_KEYS: readonly TvRemoteKey[] = ['power', 'mute', 'play-pause', 'up', 'left', 'ok', 'right', 'down', 'back', 'home', 'menu', 'volume-up', 'volume-down', 'channel-up', 'channel-down'];

/** Keys that repeat while held. */
export const TV_REMOTE_REPEATING: ReadonlySet<TvRemoteKey> = new Set(['up', 'down', 'left', 'right', 'volume-up', 'volume-down', 'channel-up', 'channel-down']);

/** Hold time before a held key repeats, and the time between repeats, in ms. */
export const TV_REMOTE_REPEAT_DELAY = 450;
export const TV_REMOTE_REPEAT_EVERY = 140;

/** An input or app to switch to. */
export interface TvRemoteSource {
  id: string;
  label: string;
  icon?: IconName | string;
  /** The one showing now. */
  active?: boolean;
}

/** Every word the remote shows or speaks. */
export interface TvRemoteLabels {
  remote: string;
  navigation: string;
  up: string;
  down: string;
  left: string;
  right: string;
  ok: string;
  back: string;
  home: string;
  menu: string;
  power: string;
  mute: string;
  'play-pause': string;
  volume: string;
  'volume-up': string;
  'volume-down': string;
  channel: string;
  'channel-up': string;
  'channel-down': string;
  /** Short words on the rockers. */
  volumeShort: string;
  channelShort: string;
  sources: string;
}

export const TV_REMOTE_LABELS: TvRemoteLabels = {
  remote: 'Remote',
  navigation: 'Navigation',
  up: 'Up',
  down: 'Down',
  left: 'Left',
  right: 'Right',
  ok: 'OK',
  back: 'Back',
  home: 'Home',
  menu: 'Menu',
  power: 'Power',
  mute: 'Mute',
  'play-pause': 'Play or pause',
  volume: 'Volume',
  'volume-up': 'Volume up',
  'volume-down': 'Volume down',
  channel: 'Channel',
  'channel-up': 'Channel up',
  'channel-down': 'Channel down',
  volumeShort: 'Vol',
  channelShort: 'Ch',
  sources: 'Inputs and apps',
};

export interface TvRemoteData {
  /** The keys to show (default all of them); the sources row appears when there are `sources`. */
  keys?: readonly TvRemoteKey[];
  sources?: readonly TvRemoteSource[];
  /** The mute key reads as pressed. */
  muted?: boolean;
  /** Accessible name (default "Remote"). */
  label?: string;
  labels?: Partial<TvRemoteLabels>;
  disabled?: boolean;
}

export interface TvRemoteEvents {
  /** A key press; held direction, volume and channel keys repeat. */
  onKey?: (key: TvRemoteKey) => void;
  onSource?: (id: string) => void;
}

export interface TvRemoteOptions extends TvRemoteData, TvRemoteEvents {}

export interface TvRemoteHandle {
  el: HTMLDivElement;
  update(options: TvRemoteOptions): void;
  /** Stops a key that is repeating. */
  destroy(): void;
}

const KEY_ICONS: Record<Exclude<TvRemoteKey, 'ok'>, string> = {
  up: mdiChevronUp,
  down: mdiChevronDown,
  left: mdiChevronLeft,
  right: mdiChevronRight,
  back: mdiArrowULeftTop,
  home: mdiHomeOutline,
  menu: mdiMenu,
  power: mdiPower,
  mute: mdiVolumeOff,
  'play-pause': mdiPlayPause,
  'volume-up': mdiPlus,
  'volume-down': mdiMinus,
  'channel-up': mdiChevronUp,
  'channel-down': mdiChevronDown,
};

/** The icon of a key (none for OK, which is a word). */
export function tvRemoteKeyIcon(key: TvRemoteKey): string | null {
  return key === 'ok' ? null : KEY_ICONS[key];
}

/** Classes of a key's button. */
export function tvRemoteKeyClass(key: TvRemoteKey): string {
  if (key === 'up' || key === 'down' || key === 'left' || key === 'right') return cx('mh-tv-remote__dir', `mh-tv-remote__dir--${key}`);
  if (key === 'ok') return 'mh-tv-remote__ok';
  if (key.startsWith('volume-') || key.startsWith('channel-')) return cx('mh-tv-remote__step', `mh-tv-remote__step--${key.endsWith('up') ? 'up' : 'down'}`);
  return cx(iconButtonClass(key === 'power' ? 'danger' : 'default', 'medium', true), `mh-tv-remote__key mh-tv-remote__key--${key}`);
}

export function tvRemoteSourceClass(active: boolean): string {
  return cx(buttonClass(active ? 'primary' : 'tonal', 'small'), 'mh-tv-remote__source', active && 'is-active');
}

/** The direction an arrow key sends while focus is on the pad. */
export function tvRemoteArrowKey(key: string): TvRemoteKey | null {
  return key === 'ArrowUp' ? 'up' : key === 'ArrowDown' ? 'down' : key === 'ArrowLeft' ? 'left' : key === 'ArrowRight' ? 'right' : null;
}

/** The layout of the keys that are shown: the same for the web renderer and React. */
export interface TvRemoteView {
  labels: TvRemoteLabels;
  label: string;
  top: TvRemoteKey[];
  pad: TvRemoteKey[];
  nav: TvRemoteKey[];
  volume: TvRemoteKey[];
  channel: TvRemoteKey[];
  sources: TvRemoteSource[];
  muted: boolean;
  disabled: boolean;
}

export function tvRemoteView(data: TvRemoteData): TvRemoteView {
  const labels = { ...TV_REMOTE_LABELS, ...data.labels };
  const shown = new Set(data.keys ?? TV_REMOTE_KEYS);
  const pick = (keys: TvRemoteKey[]): TvRemoteKey[] => keys.filter((k) => shown.has(k));
  return {
    labels,
    label: data.label ?? labels.remote,
    top: pick(['power', 'mute', 'play-pause']),
    pad: pick(['up', 'left', 'ok', 'right', 'down']),
    nav: pick(['back', 'home', 'menu']),
    volume: pick(['volume-up', 'volume-down']),
    channel: pick(['channel-up', 'channel-down']),
    sources: [...(data.sources ?? [])],
    muted: !!data.muted,
    disabled: !!data.disabled,
  };
}

/** Press-and-hold for the remote's keys: no DOM, shared by the web renderer and React. */
export interface TvRemoteRepeater {
  /** A pointer went down on a key: sends it, and keeps sending while held if it repeats. */
  down(key: TvRemoteKey): void;
  /** The pointer went up, left or was cancelled. */
  up(): void;
}

export function createTvRemoteRepeater(send: (key: TvRemoteKey) => void): TvRemoteRepeater {
  let wait: ReturnType<typeof setTimeout> | undefined;
  let every: ReturnType<typeof setInterval> | undefined;
  const up = (): void => {
    clearTimeout(wait);
    clearInterval(every);
    wait = every = undefined;
  };
  return {
    down(key) {
      up();
      send(key);
      if (!TV_REMOTE_REPEATING.has(key)) return;
      wait = setTimeout(() => {
        every = setInterval(() => send(key), TV_REMOTE_REPEAT_EVERY);
      }, TV_REMOTE_REPEAT_DELAY);
    },
    up,
  };
}

/** A rocker's contents, top to bottom: the up key, the short word (`null`), the down key. */
export function tvRemoteRocker(keys: readonly TvRemoteKey[]): (TvRemoteKey | null)[] {
  const up = keys.find((k) => k.endsWith('-up'));
  const down = keys.find((k) => k.endsWith('-down'));
  return [...(up ? [up] : []), null, ...(down ? [down] : [])];
}

/**
 * Wires a key button: a primary pointer press sends at once (and repeats while held); a click without a pointer
 * press (Enter, Space, assistive technology, `detail === 0`) sends once.
 */
function wireKey(button: HTMLButtonElement, key: TvRemoteKey, repeater: TvRemoteRepeater, send: (key: TvRemoteKey) => void): void {
  button.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || button.disabled) return;
    repeater.down(key);
  });
  for (const type of ['pointerup', 'pointerleave', 'pointercancel']) button.addEventListener(type, () => repeater.up());
  button.addEventListener('click', (e) => {
    if (e.detail === 0) send(key);
  });
}

/**
 * `.mh-tv-remote`: a labelled group. A `__top` row (`__key--power`, `--mute` with `aria-pressed`, `--play-pause`);
 * the `__pad`, a labelled group with four `__dir` buttons around the `__ok` button (with focus on the pad, the
 * arrow keys send directions); a `__nav` row (back, home, menu); `__rocker`s for volume and channel (each a group
 * with `__step--up`, the short `__rocker-label` and `__step--down`); and a `__sources` group of buttons, the
 * active one `aria-pressed`. Direction, volume and channel keys repeat while held.
 */
export function createTvRemote(options: TvRemoteOptions): TvRemoteHandle {
  let current = options;
  let view = tvRemoteView(options);
  const send = (key: TvRemoteKey): void => {
    if (!view.disabled) current.onKey?.(key);
  };
  const repeater = createTvRemoteRepeater(send);
  const el = h('div', { class: 'mh-tv-remote', role: 'group' });
  const top = h('div', { class: 'mh-tv-remote__top' });
  const pad = h('div', { class: 'mh-tv-remote__pad', role: 'group' });
  const nav = h('div', { class: 'mh-tv-remote__nav' });
  const volume = h('div', { class: 'mh-tv-remote__rocker', role: 'group' });
  const channel = h('div', { class: 'mh-tv-remote__rocker', role: 'group' });
  const volumeLabel = h('span', { class: 'mh-tv-remote__rocker-label', 'aria-hidden': 'true' });
  const channelLabel = h('span', { class: 'mh-tv-remote__rocker-label', 'aria-hidden': 'true' });
  const rockers = h('div', { class: 'mh-tv-remote__rockers' });
  const sources = h('div', { class: 'mh-tv-remote__sources', role: 'group' });
  const keys = new Map<TvRemoteKey, HTMLButtonElement>();
  const sourceButtons = new Map<string, HTMLButtonElement>();

  pad.addEventListener('keydown', (e) => {
    const dir = tvRemoteArrowKey(e.key);
    if (!dir || !view.pad.includes(dir)) return;
    e.preventDefault();
    send(dir);
  });

  // Buttons are made once per key and kept, so a redraw never drops a held key or the focus.
  const key = (k: TvRemoteKey): HTMLButtonElement => {
    let b = keys.get(k);
    if (!b) {
      const icon = tvRemoteKeyIcon(k);
      b = h('button', { type: 'button', class: tvRemoteKeyClass(k) }, icon ? createIcon(icon) : h('span', { class: 'mh-tv-remote__ok-text' }));
      wireKey(b, k, repeater, send);
      keys.set(k, b);
    }
    const label = view.labels[k];
    b.setAttribute('aria-label', label);
    b.title = label;
    if (k === 'ok') b.firstElementChild!.textContent = label;
    if (k === 'mute') b.setAttribute('aria-pressed', String(view.muted));
    b.disabled = view.disabled;
    return b;
  };

  const source = (s: TvRemoteSource): HTMLButtonElement => {
    let b = sourceButtons.get(s.id);
    if (!b) {
      b = h('button', { type: 'button' });
      b.addEventListener('click', () => current.onSource?.(s.id));
      sourceButtons.set(s.id, b);
    }
    b.className = tvRemoteSourceClass(!!s.active);
    b.setAttribute('aria-pressed', String(!!s.active));
    b.disabled = view.disabled;
    b.replaceChildren(...(s.icon ? [createIcon(s.icon)] : []), h('span', { class: 'mh-button__label' }, s.label));
    return b;
  };

  const render = (): void => {
    const v = view;
    const L = v.labels;
    el.className = cx('mh-tv-remote', v.disabled && 'is-disabled');
    el.setAttribute('aria-label', v.label);
    pad.setAttribute('aria-label', L.navigation);
    volume.setAttribute('aria-label', L.volume);
    channel.setAttribute('aria-label', L.channel);
    sources.setAttribute('aria-label', L.sources);
    volumeLabel.textContent = L.volumeShort;
    channelLabel.textContent = L.channelShort;
    syncChildren(top, v.top.map(key));
    syncChildren(pad, v.pad.map(key));
    syncChildren(nav, v.nav.map(key));
    syncChildren(volume, tvRemoteRocker(v.volume).map((k) => (k === null ? volumeLabel : key(k))));
    syncChildren(channel, tvRemoteRocker(v.channel).map((k) => (k === null ? channelLabel : key(k))));
    syncChildren(rockers, [...(v.volume.length ? [volume] : []), ...(v.channel.length ? [channel] : [])]);
    const ids = new Set(v.sources.map((s) => s.id));
    for (const id of [...sourceButtons.keys()]) if (!ids.has(id)) sourceButtons.delete(id);
    syncChildren(sources, v.sources.map(source));
    syncChildren(el, [
      ...(v.top.length ? [top] : []),
      ...(v.pad.length ? [pad] : []),
      ...(v.nav.length ? [nav] : []),
      ...(v.volume.length || v.channel.length ? [rockers] : []),
      ...(v.sources.length ? [sources] : []),
    ]);
  };
  render();

  return {
    el,
    update(next) {
      current = next;
      view = tvRemoteView(next);
      render();
    },
    destroy: () => repeater.up(),
  };
}
