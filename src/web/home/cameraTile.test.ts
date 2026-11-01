import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CAMERA_REFRESH_PARAM, cameraAgeText, cameraRefreshMs, cameraTileUrl, createCameraTile, watchCameraRefresh } from './index.ts';

/** Stands in for `Image` so tests decide when a frame loads. */
class FakeImage {
  static made: FakeImage[] = [];
  referrerPolicy = '';
  src = '';
  private listeners: Record<string, (() => void)[]> = {};
  constructor() {
    FakeImage.made.push(this);
  }
  addEventListener(type: string, fn: () => void): void {
    (this.listeners[type] ??= []).push(fn);
  }
  removeAttribute(): void {}
  fire(type: 'load' | 'error'): void {
    for (const fn of this.listeners[type] ?? []) fn();
  }
}

const setVisibility = (state: 'visible' | 'hidden'): void => {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
};

describe('cameraTileUrl and cameraRefreshMs', () => {
  it('adds a cache-busting parameter before the fragment', () => {
    expect(cameraTileUrl('https://cam.example/snap.jpg', 5)).toBe(`https://cam.example/snap.jpg?${CAMERA_REFRESH_PARAM}=5`);
    expect(cameraTileUrl('/snap?w=640#x', 7)).toBe(`/snap?w=640&${CAMERA_REFRESH_PARAM}=7#x`);
    expect(cameraTileUrl('data:image/png;base64,AAA', 7)).toBe('data:image/png;base64,AAA');
  });

  it('turns seconds into a period, none for nothing', () => {
    expect(cameraRefreshMs(10)).toBe(10000);
    expect(cameraRefreshMs(0.2)).toBe(1000);
    expect(cameraRefreshMs(0)).toBe(0);
    expect(cameraRefreshMs(null)).toBe(0);
  });
});

describe('createCameraTile', () => {
  it('renders a figure with the picture, name, status and action', () => {
    const action = document.createElement('button');
    const { el, update } = createCameraTile({ src: 'https://cam.example/a.jpg', name: 'Front door', status: 'Motion · 2 min ago', action, aspect: 4 / 3 });
    expect(el.tagName).toBe('FIGURE');
    expect(el.className).toBe('mh-camera-tile');
    const img = el.querySelector('img')!;
    expect(img.getAttribute('referrerpolicy')).toBe('no-referrer');
    expect(img.getAttribute('src')).toBe('https://cam.example/a.jpg');
    expect(img.alt).toBe('Front door');
    expect(el.querySelector<HTMLElement>('.mh-camera-tile__frame')!.style.aspectRatio).toMatch(/^1.3333/);
    expect(el.querySelector('figcaption .mh-camera-tile__name')!.textContent).toBe('Front door');
    expect(el.querySelector('.mh-camera-tile__status')!.textContent).toBe('Motion · 2 min ago');
    expect(el.querySelector('.mh-camera-tile__action')!.firstChild).toBe(action);

    update({ src: null, name: 'Front door' });
    expect(el.className).toBe('mh-camera-tile is-empty');
    expect(el.querySelector('img')).toBeNull();
    expect(el.querySelector('.mh-camera-tile__status')).toBeNull();
    expect(el.querySelector('.mh-camera-tile__action')).toBeNull();
    expect(el.querySelector('.mh-camera-tile__placeholder svg')).not.toBeNull();
  });

  it('shows the placeholder when the picture fails', () => {
    const { el } = createCameraTile({ src: 'https://cam.example/a.jpg', name: 'Garage' });
    el.querySelector('img')!.dispatchEvent(new Event('error'));
    expect(el.className).toBe('mh-camera-tile is-empty');
    expect(el.querySelector('img')).toBeNull();
  });
});

describe('refreshing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('Image', FakeImage);
    FakeImage.made = [];
    setVisibility('visible');
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    setVisibility('visible');
  });

  it('loads a cache-busted frame off-screen and swaps it in once it arrives', () => {
    const tile = createCameraTile({ src: 'https://cam.example/a.jpg', name: 'Porch', refreshEvery: 5 });
    const img = tile.el.querySelector('img')!;
    vi.advanceTimersByTime(4999);
    expect(FakeImage.made).toHaveLength(0);
    vi.advanceTimersByTime(1);
    expect(FakeImage.made).toHaveLength(1);
    const frame = FakeImage.made[0]!;
    expect(frame.referrerPolicy).toBe('no-referrer');
    expect(frame.src).toMatch(new RegExp(`^https://cam\\.example/a\\.jpg\\?${CAMERA_REFRESH_PARAM}=\\d+$`));
    expect(img.getAttribute('src')).toBe('https://cam.example/a.jpg');
    frame.fire('load');
    expect(img.getAttribute('src')).toBe(frame.src);
    // A failed frame keeps the last one.
    vi.advanceTimersByTime(5000);
    FakeImage.made[1]!.fire('error');
    expect(img.getAttribute('src')).toBe(frame.src);
    // Status updates don't restart the timer.
    vi.advanceTimersByTime(3000);
    tile.update({ src: 'https://cam.example/a.jpg', name: 'Porch', status: 'Now', refreshEvery: 5 });
    vi.advanceTimersByTime(2000);
    expect(FakeImage.made).toHaveLength(3);
    tile.destroy();
    vi.advanceTimersByTime(20000);
    expect(FakeImage.made).toHaveLength(3);
  });

  it('pauses while the page is hidden and catches up when it shows again', () => {
    const el = document.createElement('div');
    const frames: string[] = [];
    const r = watchCameraRefresh(el, '/snap.jpg', 2, (url) => frames.push(url));
    setVisibility('hidden');
    vi.advanceTimersByTime(10000);
    expect(FakeImage.made).toHaveLength(0);
    setVisibility('visible');
    expect(FakeImage.made).toHaveLength(1);
    FakeImage.made[0]!.fire('load');
    expect(frames).toHaveLength(1);
    r.stop();
    FakeImage.made.length = 0;
    vi.advanceTimersByTime(10000);
    setVisibility('hidden');
    setVisibility('visible');
    expect(FakeImage.made).toHaveLength(0);
  });

  it('does nothing without a period', () => {
    const r = watchCameraRefresh(document.createElement('div'), '/snap.jpg', null, () => undefined);
    vi.advanceTimersByTime(60000);
    expect(FakeImage.made).toHaveLength(0);
    r.refresh();
    expect(FakeImage.made).toHaveLength(1);
    r.stop();
  });
});

describe('camera tile options', () => {
  it('opens from the picture, hides the caption and shows the age of the frame', () => {
    const onOpen = vi.fn();
    const { el, update } = createCameraTile({ src: 'https://cam.example/a.jpg', name: 'Porch', onOpen, caption: false, updated: true });
    expect(el.className).toBe('mh-camera-tile is-openable');
    expect(el.querySelector('figcaption')).toBeNull();
    const frame = el.querySelector<HTMLElement>('.mh-camera-tile__frame')!;
    expect(frame.getAttribute('role')).toBe('button');
    frame.click();
    frame.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(onOpen).toHaveBeenCalledTimes(2);
    expect(el.querySelector('.mh-camera-tile__updated')).toBeNull();
    el.querySelector('img')!.dispatchEvent(new Event('load'));
    expect(el.querySelector('.mh-camera-tile__updated')!.textContent).toBe('Updated just now');
    update({ src: 'https://cam.example/a.jpg', name: 'Porch' });
    expect(el.querySelector('figcaption')).not.toBeNull();
    expect(el.querySelector('.mh-camera-tile__updated')).toBeNull();
    expect(frame.hasAttribute('role')).toBe(false);
  });

  it('words the age of a frame', () => {
    expect(cameraAgeText(0, 30000)).toBe('Updated just now');
    expect(cameraAgeText(0, 5 * 60000)).toBe('Updated 5 min ago');
    expect(cameraAgeText(0, 130 * 60000)).toBe('Updated 2 h ago');
  });
});
