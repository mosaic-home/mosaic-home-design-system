import { mdiMusic, mdiPause, mdiPlay, mdiSkipNext, mdiSkipPrevious, mdiStop, mdiVolumeHigh, mdiVolumeOff } from '@mdi/js';
import { iconButtonClass } from '../actions/iconButton.ts';
import { sliderPosition } from '../choice-inputs/slider.ts';
import { cx, h } from '../dom.ts';
import { createIcon } from '../icons.ts';

export type MediaPlayerState = 'playing' | 'paused' | 'buffering' | 'idle' | 'off';

/** Where the artwork goes: a small square beside the title, or a full-width banner above it while something plays. */
export type MediaPlayerArtLayout = 'thumb' | 'banner';

/** What the artwork is: a square cover, or a wide still (video, show). */
export type MediaPlayerArtShape = 'square' | 'wide';

/** What the player supports; only these buttons and controls are shown. */
export interface MediaPlayerCan {
  play?: boolean;
  pause?: boolean;
  stop?: boolean;
  next?: boolean;
  previous?: boolean;
  volume?: boolean;
  mute?: boolean;
  seek?: boolean;
}

/** Every word the player shows or speaks, for translation. */
export interface MediaPlayerLabels {
  player: string;
  playback: string;
  play: string;
  pause: string;
  stop: string;
  next: string;
  previous: string;
  mute: string;
  volume: string;
  seek: string;
  progress: string;
  /** Title when nothing is playing. */
  empty: string;
  /** "{elapsed} of {total}". */
  of: string;
  playing: string;
  paused: string;
  buffering: string;
  idle: string;
  off: string;
}

export const MEDIA_PLAYER_LABELS: MediaPlayerLabels = {
  player: 'Media player',
  playback: 'Playback',
  play: 'Play',
  pause: 'Pause',
  stop: 'Stop',
  next: 'Next',
  previous: 'Previous',
  mute: 'Mute',
  volume: 'Volume',
  seek: 'Position',
  progress: 'Progress',
  empty: 'Nothing playing',
  of: 'of',
  playing: 'Playing',
  paused: 'Paused',
  buffering: 'Loading',
  idle: 'Idle',
  off: 'Off',
};

export interface MediaPlayerEvents {
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  /** 0 to 1, when the volume slider is released (or a key changes it). */
  onVolume?: (volume: number) => void;
  /** The new muted state. */
  onMute?: (muted: boolean) => void;
  /** Seconds, when the position slider is released. */
  onSeek?: (seconds: number) => void;
}

export interface MediaPlayerData {
  title?: string | null;
  /** Artist, album or show. */
  subtitle?: string | null;
  /** Artwork URL; a themed music-note placeholder when null or failing. */
  art?: string | null;
  /**
   * `thumb` (default): the art is a small square in the row. `banner`: while playing, paused or buffering, the art
   * is a full-width banner above the row instead; idle, off or without art the player looks as with `thumb`.
   */
  artLayout?: MediaPlayerArtLayout;
  /** How the banner frames the art: `square` (default) centres a cover over a blurred copy, `wide` fills it. */
  artShape?: MediaPlayerArtShape;
  state: MediaPlayerState | null;
  /** Seconds; with `duration`, draws the progress line. Updated by the caller. */
  position?: number | null;
  duration?: number | null;
  /** 0 to 1. */
  volume?: number | null;
  muted?: boolean | null;
  can?: MediaPlayerCan;
  /** Accessible name of the player (default the title, else "Media player"). */
  label?: string;
  labels?: Partial<MediaPlayerLabels>;
}

export interface MediaPlayerOptions extends MediaPlayerData, MediaPlayerEvents {}

export interface MediaPlayerHandle {
  el: HTMLDivElement;
  update(options: MediaPlayerOptions): void;
}

/** "3:07", or "1:02:05" past an hour. */
export function formatMediaTime(seconds: number): string {
  const s = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, '0');
  return hh ? `${hh}:${String(mm).padStart(2, '0')}:${ss}` : `${mm}:${ss}`;
}

const finite = (n: number | null | undefined): n is number => n !== null && n !== undefined && Number.isFinite(n);

/** Everything the player draws, worked out from its data: the same for the web renderer and React. */
export interface MediaPlayerView {
  labels: MediaPlayerLabels;
  rootClass: string;
  label: string;
  title: string;
  subtitle: string;
  /** The state word, spoken. */
  stateText: string;
  art: string | null;
  /** The art shows as a banner above the row (until the image fails to load: then the renderer falls back to the thumb). */
  banner: boolean;
  artShape: MediaPlayerArtShape;
  /** True while playing or buffering: the main button pauses. */
  active: boolean;
  /** Idle or off: only the title and a play button, no progress, volume or other transport. */
  compact: boolean;
  /** The main button: `play`, `pause` or none. */
  main: 'play' | 'pause' | null;
  previous: boolean;
  stop: boolean;
  next: boolean;
  /** Any transport button shown. */
  transport: boolean;
  /** Position and duration, when both are known; `elapsed` and `total` are the visible time labels. */
  progress: { position: number; duration: number; at: number; text: string; elapsed: string; total: string } | null;
  seek: boolean;
  mute: boolean;
  muted: boolean;
  /** Volume slider shown, and its value 0 to 100 (null: unknown, slider disabled). */
  volume: boolean;
  level: number | null;
  /** The visible volume value ("45%"), empty when unknown. */
  levelText: string;
}

export function mediaPlayerView(data: MediaPlayerData): MediaPlayerView {
  const labels = { ...MEDIA_PLAYER_LABELS, ...data.labels };
  const can = data.can ?? {};
  const state = data.state ?? 'idle';
  const active = state === 'playing' || state === 'buffering';
  const compact = state === 'idle' || state === 'off';
  const main = active ? (can.pause ? 'pause' : null) : can.play ? 'play' : null;
  const title = data.title?.trim() || '';
  const duration = finite(data.duration) && data.duration > 0 ? data.duration : null;
  const position = finite(data.position) ? Math.min(Math.max(0, data.position), duration ?? Infinity) : null;
  const progress =
    duration !== null && position !== null && !compact
      ? {
          position,
          duration,
          at: sliderPosition(position, 0, duration),
          text: mediaTimeText(position, duration, labels),
          elapsed: formatMediaTime(position),
          total: formatMediaTime(duration),
        }
      : null;
  const level = finite(data.volume) ? Math.round(Math.min(1, Math.max(0, data.volume)) * 100) : null;
  return {
    labels,
    rootClass: cx('mh-media-player', `is-${state}`),
    label: data.label ?? (title || labels.player),
    title: title || labels.empty,
    subtitle: data.subtitle?.trim() || '',
    stateText: labels[state],
    art: data.art || null,
    banner: !!data.art && data.artLayout === 'banner' && !compact,
    artShape: data.artShape === 'wide' ? 'wide' : 'square',
    active,
    compact,
    main,
    previous: !compact && !!can.previous,
    stop: !compact && !!can.stop,
    next: !compact && !!can.next,
    transport: !!(main || (!compact && (can.previous || can.stop || can.next))),
    progress,
    seek: !!can.seek && progress !== null,
    mute: !compact && !!can.mute,
    muted: !!data.muted,
    volume: !compact && !!can.volume,
    level,
    levelText: level === null ? '' : `${level}%`,
  };
}

/** The root's classes, with `.has-banner` while the banner shows. */
export function mediaPlayerClass(view: Pick<MediaPlayerView, 'rootClass'>, banner: boolean): string {
  return cx(view.rootClass, banner && 'has-banner');
}

export function mediaPlayerBannerClass(shape: MediaPlayerArtShape): string {
  return cx('mh-media-player__banner', `is-${shape}`);
}

export function mediaPlayerArtClass(hasArt: boolean): string {
  return cx('mh-media-player__art', !hasArt && 'is-empty');
}

/** Classes of a transport button (`main` is the filled play / pause button) or the mute toggle. */
export function mediaPlayerButtonClass(part: string): string {
  const base = part === 'main' ? iconButtonClass('accent', 'medium', true) : part === 'mute' ? iconButtonClass('default', 'small') : iconButtonClass();
  return cx(base, `mh-media-player__${part}`);
}

/** "1:23 of 3:45". */
export function mediaTimeText(position: number, duration: number, labels: Pick<MediaPlayerLabels, 'of'> = MEDIA_PLAYER_LABELS): string {
  return `${formatMediaTime(position)} ${labels.of} ${formatMediaTime(duration)}`;
}

/** Puts exactly `wanted` (falsy entries skipped) in `parent`, in order, touching the DOM only when it differs, so a focused child keeps focus. */
function syncChildren(parent: Element, wanted: (Element | false | null | undefined)[]): void {
  const list = wanted.filter((c): c is Element => !!c);
  const now = Array.from(parent.children);
  if (now.length === list.length && now.every((c, i) => c === list[i])) return;
  for (const c of now) if (!list.includes(c)) c.remove();
  list.forEach((c, i) => {
    if (parent.children[i] !== c) parent.insertBefore(c, parent.children[i] ?? null);
  });
}

/** The main button's icon path. */
export function mediaPlayerMainIcon(main: 'play' | 'pause'): string {
  return main === 'pause' ? mdiPause : mdiPlay;
}

export function mediaPlayerLevelClass(muted: boolean): string {
  return cx('mh-slider', 'mh-media-player__level', muted && 'is-muted');
}

/**
 * `.mh-media-player` (`.is-playing | is-paused | is-buffering | is-idle | is-off`): a compact card body, a labelled
 * group. A `__row` with the 1:1 `__art` (`<img>` `__image`, lazy and without referrer, or a music-note
 * `__placeholder`; `.is-empty`), `__text` (`__title`, `__subtitle`, a hidden state word) and `__transport` (only
 * the buttons `can` allows: `__previous`, `__main` play/pause, `__stop`, `__next`). With `artLayout: 'banner'` and
 * art, while playing, paused or buffering, the root gets `.has-banner`: a full-width `__banner` (`.is-square` or
 * `.is-wide` from `artShape`, hidden from screen readers) sits above the row and the row drops its `__art`. A wide
 * still fills the 16:9 banner (`__banner-image`); a square cover sits centred at full height over a blurred, dimmed
 * copy of itself (`__banner-backdrop`). If the image fails to load the player falls back to the thumb layout. Below, when position and
 * duration are known, a thin `__progress` line (`role="progressbar"`) or, with `can.seek`, a `__seek` range. A
 * `__times` row (`__elapsed`, `__total`, hidden from screen readers) follows it. A `__volume` row with a `__mute`
 * toggle (`aria-pressed`), a `__level` range and its `__level-value` ("45%") when supported. Idle or off
 * (`.is-idle`, `.is-off`) the player is compact: title and play button only. Ranges commit on release:
 * `onVolume(0..1)`, `onSeek(seconds)`.
 */
export function createMediaPlayer(options: MediaPlayerOptions): MediaPlayerHandle {
  let current = options;
  let view = mediaPlayerView(options);
  let artFailed = false;
  let draggingSeek = false;
  let draggingLevel = false;

  const image = h('img', { class: 'mh-media-player__image', alt: '', loading: 'lazy', decoding: 'async', referrerpolicy: 'no-referrer' });
  const placeholder = h('span', { class: 'mh-media-player__placeholder' }, createIcon(mdiMusic));
  const art = h('div', { class: 'mh-media-player__art', 'aria-hidden': 'true' }, placeholder);
  const imageAttrs = { alt: '', loading: 'lazy', decoding: 'async', referrerpolicy: 'no-referrer' } as const;
  const bannerBackdrop = h('img', { class: 'mh-media-player__banner-backdrop', ...imageAttrs });
  const bannerImage = h('img', { class: 'mh-media-player__banner-image', ...imageAttrs });
  const banner = h('div', { class: 'mh-media-player__banner', 'aria-hidden': 'true' });
  const title = h('div', { class: 'mh-media-player__title' });
  const subtitle = h('div', { class: 'mh-media-player__subtitle' });
  const stateText = h('span', { class: 'mh-visually-hidden' });
  const text = h('div', { class: 'mh-media-player__text' });

  const button = (part: string, icon: string, onClick: () => void): HTMLButtonElement =>
    h('button', { type: 'button', class: mediaPlayerButtonClass(part), onclick: onClick }, createIcon(icon));
  const previous = button('previous', mdiSkipPrevious, () => current.onPrevious?.());
  const main = h('button', { type: 'button', class: mediaPlayerButtonClass('main') });
  main.addEventListener('click', () => (view.main === 'pause' ? current.onPause?.() : current.onPlay?.()));
  const stop = button('stop', mdiStop, () => current.onStop?.());
  const next = button('next', mdiSkipNext, () => current.onNext?.());
  const transport = h('div', { class: 'mh-media-player__transport', role: 'group' });
  const row = h('div', { class: 'mh-media-player__row' });

  const progress = h('div', { class: 'mh-media-player__progress', role: 'progressbar', 'aria-valuemin': 0 }, h('span', { class: 'mh-media-player__progress-fill' }));
  const seekInput = h('input', { type: 'range', class: 'mh-slider__input', min: 0, step: 1 });
  const seek = h('div', { class: 'mh-slider mh-media-player__seek' }, seekInput);
  seekInput.addEventListener('input', () => {
    draggingSeek = true;
    const max = Number(seekInput.max);
    seekInput.style.setProperty('--_at', String(sliderPosition(Number(seekInput.value), 0, max)));
    seekInput.setAttribute('aria-valuetext', mediaTimeText(Number(seekInput.value), max, view.labels));
    elapsed.textContent = formatMediaTime(Number(seekInput.value));
  });
  seekInput.addEventListener('change', () => {
    draggingSeek = false;
    current.onSeek?.(Number(seekInput.value));
  });

  const mute = h('button', { type: 'button', class: mediaPlayerButtonClass('mute') });
  mute.addEventListener('click', () => current.onMute?.(!view.muted));
  const levelInput = h('input', { type: 'range', class: 'mh-slider__input', min: 0, max: 100, step: 1 });
  const level = h('div', { class: 'mh-slider mh-media-player__level' }, levelInput);
  levelInput.addEventListener('input', () => {
    draggingLevel = true;
    levelInput.style.setProperty('--_at', String(sliderPosition(Number(levelInput.value))));
    levelInput.setAttribute('aria-valuetext', `${levelInput.value}%`);
    levelValue.textContent = `${levelInput.value}%`;
  });
  levelInput.addEventListener('change', () => {
    draggingLevel = false;
    current.onVolume?.(Number(levelInput.value) / 100);
  });
  const levelValue = h('span', { class: 'mh-media-player__level-value', 'aria-hidden': 'true' });
  const volume = h('div', { class: 'mh-media-player__volume' });
  const elapsed = h('span', { class: 'mh-media-player__elapsed' });
  const total = h('span', { class: 'mh-media-player__total' });
  const times = h('div', { class: 'mh-media-player__times', 'aria-hidden': 'true' }, elapsed, total);

  const el = h('div', { role: 'group' });

  /** The art, as a banner or a thumb: everything that changes when the image fails to load. */
  const showArt = (): void => {
    const has = !!view.art && !artFailed;
    const asBanner = view.banner && has;
    el.className = mediaPlayerClass(view, asBanner);
    art.className = mediaPlayerArtClass(has);
    syncChildren(art, [placeholder, has && image]);
    banner.className = mediaPlayerBannerClass(view.artShape);
    syncChildren(banner, [view.artShape === 'square' && bannerBackdrop, bannerImage]);
    syncChildren(row, [!asBanner && art, text, view.transport && transport]);
    if (el.firstElementChild === banner && !asBanner) banner.remove();
    if (asBanner && el.firstElementChild !== banner) el.prepend(banner);
  };
  for (const img of [image, bannerBackdrop, bannerImage])
    img.addEventListener('error', () => {
      artFailed = true;
      showArt();
    });

  const name = (b: HTMLButtonElement, label: string): void => {
    b.setAttribute('aria-label', label);
    b.title = label;
  };
  const setIcon = (b: HTMLButtonElement, icon: string): void => {
    if (b.dataset.icon === icon) return;
    b.dataset.icon = icon;
    b.replaceChildren(createIcon(icon));
  };

  const update = (nextOptions: MediaPlayerOptions): void => {
    current = nextOptions;
    const v = mediaPlayerView(nextOptions);
    if (v.art !== view.art || !image.hasAttribute('src') !== !v.art) {
      artFailed = false;
      for (const img of [image, bannerBackdrop, bannerImage]) {
        if (v.art) img.src = v.art;
        else img.removeAttribute('src');
      }
    }
    view = v;
    const L = v.labels;
    el.setAttribute('aria-label', v.label);
    title.textContent = v.title;
    subtitle.textContent = v.subtitle;
    stateText.textContent = v.stateText;
    syncChildren(text, [title, !!v.subtitle && subtitle, stateText]);

    transport.setAttribute('aria-label', L.playback);
    name(previous, L.previous);
    name(stop, L.stop);
    name(next, L.next);
    if (v.main) {
      name(main, L[v.main]);
      setIcon(main, mediaPlayerMainIcon(v.main));
    }
    syncChildren(transport, [v.previous && previous, !!v.main && main, v.stop && stop, v.next && next]);

    const p = v.progress;
    if (p) {
      if (!draggingSeek) elapsed.textContent = p.elapsed;
      total.textContent = p.total;
    }
    if (p && !v.seek) {
      progress.setAttribute('aria-label', L.progress);
      progress.setAttribute('aria-valuemax', String(Math.round(p.duration)));
      progress.setAttribute('aria-valuenow', String(Math.round(p.position)));
      progress.setAttribute('aria-valuetext', p.text);
      progress.style.setProperty('--_at', String(p.at));
    }
    if (p && v.seek) {
      seekInput.setAttribute('aria-label', L.seek);
      seekInput.max = String(Math.round(p.duration));
      if (!draggingSeek) {
        seekInput.value = String(Math.round(p.position));
        seekInput.setAttribute('aria-valuetext', mediaTimeText(Math.round(p.position), p.duration, L));
        seekInput.style.setProperty('--_at', String(sliderPosition(Math.round(p.position), 0, Math.round(p.duration))));
      }
    }

    name(mute, L.mute);
    mute.setAttribute('aria-pressed', String(v.muted));
    setIcon(mute, v.muted ? mdiVolumeOff : mdiVolumeHigh);
    level.className = mediaPlayerLevelClass(v.muted);
    levelInput.setAttribute('aria-label', L.volume);
    levelInput.disabled = v.level === null;
    if (!draggingLevel) {
      levelInput.value = String(v.level ?? 0);
      levelInput.setAttribute('aria-valuetext', `${v.level ?? 0}%`);
      levelInput.style.setProperty('--_at', String(sliderPosition(v.level ?? 0)));
      levelValue.textContent = v.levelText;
    }
    syncChildren(volume, [v.mute && mute, v.volume && level, v.volume && !!v.levelText && levelValue]);
    const asBanner = v.banner && !!v.art && !artFailed;
    syncChildren(el, [asBanner && banner, row, !!p && !v.seek && progress, v.seek && seek, !!p && times, (v.mute || v.volume) && volume]);
    showArt();
  };
  update(options);
  return { el, update };
}
