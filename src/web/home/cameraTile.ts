import { mdiCameraOutline } from '@mdi/js';
import { cx, h } from '../dom.ts';
import { createIcon } from '../icons.ts';

export interface CameraTileOptions {
  /** Any image URL, or null when there is no picture. */
  src: string | null;
  /** The camera's name; also the picture's alternative text. */
  name: string;
  /** A status line ("Motion · 2 min ago"). */
  status?: string | null;
  /** Reloads the picture every this many seconds (a cache-busting query parameter), while it is visible. */
  refreshEvery?: number | null;
  /** Width / height of the picture (default 16 / 9). */
  aspect?: number;
  /** A control in the caption row (a button). */
  action?: HTMLElement | null;
  /** Show the caption row (default true); leave it out where a card's header already names the camera. */
  caption?: boolean;
  /** Tapping the picture (or Enter / Space on it) opens it, e.g. full screen. */
  onOpen?: (() => void) | null;
  /** Show how old the picture is ("Updated 2 min ago") over its corner, from when the last frame arrived. */
  updated?: boolean;
}

export interface CameraTileHandle {
  el: HTMLElement;
  update(options: CameraTileOptions): void;
  /** Reloads the picture now. */
  refresh(): void;
  /** Stops refreshing. */
  destroy(): void;
}

export const CAMERA_TILE_ASPECT = 16 / 9;
/** Name of the cache-busting query parameter. */
export const CAMERA_REFRESH_PARAM = '_mh';

/** The URL with a cache-busting query parameter (kept before any `#fragment`); `data:` and `blob:` URLs as they are. */
export function cameraTileUrl(src: string, stamp: number): string {
  if (/^(data|blob):/i.test(src)) return src;
  const hash = src.indexOf('#');
  const base = hash < 0 ? src : src.slice(0, hash);
  const fragment = hash < 0 ? '' : src.slice(hash);
  return `${base}${base.includes('?') ? '&' : '?'}${CAMERA_REFRESH_PARAM}=${stamp}${fragment}`;
}

export function cameraTileClass(hasPicture: boolean, openable = false): string {
  return cx('mh-camera-tile', !hasPicture && 'is-empty', openable && 'is-openable');
}

/** "Updated just now", "Updated 3 min ago", "Updated 2 h ago": the age of a frame that arrived at `at`. */
export function cameraAgeText(at: number, now: number = Date.now()): string {
  const minutes = Math.floor(Math.max(0, now - at) / 60000);
  if (minutes < 1) return 'Updated just now';
  if (minutes < 60) return `Updated ${minutes} min ago`;
  return `Updated ${Math.floor(minutes / 60)} h ago`;
}

/** How often the age label is redrawn. */
export const CAMERA_AGE_TICK_MS = 30000;

/** CSS `aspect-ratio` of the picture. */
export function cameraTileAspect(aspect: number | undefined): string {
  const a = aspect && aspect > 0 && Number.isFinite(aspect) ? aspect : CAMERA_TILE_ASPECT;
  return String(Math.round(a * 10000) / 10000);
}

/** The refresh period in milliseconds, or 0 for none (at least one second). */
export function cameraRefreshMs(refreshEvery: number | null | undefined): number {
  return refreshEvery && refreshEvery > 0 && Number.isFinite(refreshEvery) ? Math.max(1, refreshEvery) * 1000 : 0;
}

export interface CameraRefresher {
  /** Loads a new frame now. */
  refresh(): void;
  /** Stops the timer and the visibility watchers. */
  stop(): void;
}

/**
 * Reloads `src` every `refreshEvery` seconds while the page is visible and `el` is on screen. Each frame loads
 * off-screen (no referrer) and `onFrame` gets its URL once it has arrived, so the picture never blanks; a failed
 * frame is skipped. Coming back into view loads a frame at once.
 */
export function watchCameraRefresh(el: Element, src: string, refreshEvery: number | null | undefined, onFrame: (url: string) => void): CameraRefresher {
  const ms = cameraRefreshMs(refreshEvery);
  let timer: ReturnType<typeof setInterval> | null = null;
  let onScreen = true;
  let loader: HTMLImageElement | null = null;
  let stopped = false;

  const refresh = (): void => {
    if (stopped) return;
    const next = new Image();
    next.referrerPolicy = 'no-referrer';
    loader = next;
    const url = cameraTileUrl(src, Date.now());
    next.addEventListener('load', () => {
      if (loader !== next || stopped) return;
      loader = null;
      onFrame(url);
    });
    next.addEventListener('error', () => {
      if (loader === next) loader = null;
    });
    next.src = url;
  };
  if (!ms) return { refresh, stop: () => void (stopped = true) };

  const visible = (): boolean => onScreen && document.visibilityState !== 'hidden';
  const schedule = (): void => {
    const run = visible();
    if (run && timer === null) {
      timer = setInterval(refresh, ms);
      return;
    }
    if (!run && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
  const onVisibility = (): void => {
    const wasRunning = timer !== null;
    schedule();
    // Back in view after a while: a fresh frame at once rather than a whole period later.
    if (!wasRunning && timer !== null) refresh();
  };
  document.addEventListener('visibilitychange', onVisibility);
  const observer =
    typeof IntersectionObserver === 'function'
      ? new IntersectionObserver((entries) => {
          const entry = entries[entries.length - 1];
          if (!entry) return;
          onScreen = entry.isIntersecting;
          onVisibility();
        })
      : null;
  observer?.observe(el);
  schedule();

  return {
    refresh,
    stop() {
      stopped = true;
      loader = null;
      if (timer !== null) clearInterval(timer);
      timer = null;
      observer?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    },
  };
}

/**
 * `.mh-camera-tile` (`.is-empty` without a picture): a `<figure>` with a `__frame` at the given aspect holding a
 * `__placeholder` camera icon and, over it, the `__image` (lazy, no referrer); a `<figcaption>` `__caption` with
 * `__text` (`__name`, `__status`) and an `__action` slot (`caption: false` leaves the caption out). With
 * `refreshEvery`, frames refresh as `watchCameraRefresh` describes; a failed first load shows the placeholder.
 * `onOpen` makes the frame a button (`.is-openable`); `updated` adds an `__updated` age label over the frame.
 */
export function createCameraTile(options: CameraTileOptions): CameraTileHandle {
  let current = options;
  let failed = false;
  let refresher: CameraRefresher | null = null;

  const image = h('img', { class: 'mh-camera-tile__image', alt: '', loading: 'lazy', decoding: 'async', referrerpolicy: 'no-referrer' });
  const placeholder = h('span', { class: 'mh-camera-tile__placeholder', 'aria-hidden': 'true' }, createIcon(mdiCameraOutline));
  const frame = h('div', { class: 'mh-camera-tile__frame' }, placeholder);
  const name = h('span', { class: 'mh-camera-tile__name' });
  const status = h('span', { class: 'mh-camera-tile__status' });
  const text = h('span', { class: 'mh-camera-tile__text' }, name);
  const actionSlot = h('span', { class: 'mh-camera-tile__action' });
  const caption = h('figcaption', { class: 'mh-camera-tile__caption' }, text);
  const el = h('figure', { class: 'mh-camera-tile' }, frame, caption);
  const age = h('span', { class: 'mh-camera-tile__updated' });
  let frameAt: number | null = null;
  let ageTimer: ReturnType<typeof setInterval> | null = null;
  const showAge = (): void => {
    const want = !!current.updated && frameAt !== null && !failed && !!current.src;
    if (want) {
      age.textContent = cameraAgeText(frameAt!);
      if (age.parentNode !== frame) frame.append(age);
      if (ageTimer === null) ageTimer = setInterval(showAge, CAMERA_AGE_TICK_MS);
    } else {
      age.remove();
      if (ageTimer !== null) clearInterval(ageTimer);
      ageTimer = null;
    }
  };
  frame.addEventListener('click', () => current.onOpen?.());
  frame.addEventListener('keydown', (event) => {
    if (!current.onOpen || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    current.onOpen();
  });

  const showPicture = (): void => {
    const has = !!current.src && !failed;
    el.className = cameraTileClass(has, !!current.onOpen);
    if (has && image.parentNode !== frame) frame.insertBefore(image, age.parentNode === frame ? age : null);
    if (!has) image.remove();
    showAge();
  };
  image.addEventListener('error', () => {
    failed = true;
    showPicture();
  });
  image.addEventListener('load', () => {
    failed = false;
    frameAt = Date.now();
    showPicture();
  });

  const update = (next: CameraTileOptions): void => {
    const restart = next.src !== current.src || next.refreshEvery !== current.refreshEvery || !refresher;
    const srcChanged = next.src !== current.src || !image.hasAttribute('src') !== !next.src;
    current = next;
    name.textContent = next.name;
    image.alt = next.name;
    const st = next.status?.trim();
    status.textContent = st ?? '';
    if (st && status.parentNode !== text) text.append(status);
    if (!st) status.remove();
    frame.style.aspectRatio = cameraTileAspect(next.aspect);
    if (next.onOpen) {
      frame.setAttribute('role', 'button');
      frame.setAttribute('tabindex', '0');
      frame.setAttribute('aria-label', next.name);
    } else {
      frame.removeAttribute('role');
      frame.removeAttribute('tabindex');
      frame.removeAttribute('aria-label');
    }
    if (next.caption === false) caption.remove();
    else if (caption.parentNode !== el) el.append(caption);
    if (next.action) {
      if (actionSlot.firstChild !== next.action) actionSlot.replaceChildren(next.action);
      if (actionSlot.parentNode !== caption) caption.append(actionSlot);
    } else actionSlot.remove();
    if (srcChanged) {
      failed = false;
      if (next.src) image.src = next.src;
      else image.removeAttribute('src');
    }
    showPicture();
    if (restart) {
      refresher?.stop();
      const src = next.src;
      refresher = src ? watchCameraRefresh(el, src, next.refreshEvery, (url) => (image.src = url)) : null;
    }
  };
  update(options);

  return {
    el,
    update,
    refresh: () => refresher?.refresh(),
    destroy() {
      refresher?.stop();
      refresher = null;
      if (ageTimer !== null) clearInterval(ageTimer);
      ageTimer = null;
    },
  };
}
