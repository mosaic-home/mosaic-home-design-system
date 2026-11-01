import { describe, expect, it } from 'vitest';
import { createMediaPlayer, formatMediaTime, mediaPlayerView, type MediaPlayerOptions } from './index.ts';

const ALL = { play: true, pause: true, stop: true, next: true, previous: true, volume: true, mute: true, seek: true };
const names = (el: Element, selector: string): string[] => [...el.querySelectorAll(selector)].map((b) => b.getAttribute('aria-label') ?? '');

describe('formatMediaTime', () => {
  it('formats minutes and hours', () => {
    expect(formatMediaTime(0)).toBe('0:00');
    expect(formatMediaTime(83.9)).toBe('1:23');
    expect(formatMediaTime(3725)).toBe('1:02:05');
    expect(formatMediaTime(-5)).toBe('0:00');
  });
});

describe('mediaPlayerView', () => {
  it('chooses the main button from the state and what the player can do', () => {
    expect(mediaPlayerView({ state: 'playing', can: { pause: true } }).main).toBe('pause');
    expect(mediaPlayerView({ state: 'buffering', can: { play: true, pause: true } }).main).toBe('pause');
    expect(mediaPlayerView({ state: 'playing', can: { play: true } }).main).toBeNull();
    expect(mediaPlayerView({ state: 'paused', can: { play: true } }).main).toBe('play');
    expect(mediaPlayerView({ state: null }).transport).toBe(false);
  });

  it('needs both position and duration for progress, and clamps', () => {
    expect(mediaPlayerView({ state: 'playing', position: 10 }).progress).toBeNull();
    expect(mediaPlayerView({ state: 'playing', position: 10, duration: 0 }).progress).toBeNull();
    const p = mediaPlayerView({ state: 'playing', position: 300, duration: 200 }).progress!;
    expect(p.position).toBe(200);
    expect(p.at).toBe(1);
    expect(p.text).toBe('3:20 of 3:20');
    expect(mediaPlayerView({ state: 'playing', position: 1, duration: 2, can: { seek: true } }).seek).toBe(true);
    expect(mediaPlayerView({ state: 'playing', can: { seek: true } }).seek).toBe(false);
  });
});

describe('mediaPlayerView banner', () => {
  const art = 'https://example.com/cover.jpg';
  it('shows the banner only with banner layout, art and a non-compact state', () => {
    expect(mediaPlayerView({ state: 'playing', art, artLayout: 'banner' }).banner).toBe(true);
    expect(mediaPlayerView({ state: 'paused', art, artLayout: 'banner' }).banner).toBe(true);
    expect(mediaPlayerView({ state: 'buffering', art, artLayout: 'banner' }).banner).toBe(true);
    expect(mediaPlayerView({ state: 'idle', art, artLayout: 'banner' }).banner).toBe(false);
    expect(mediaPlayerView({ state: 'off', art, artLayout: 'banner' }).banner).toBe(false);
    expect(mediaPlayerView({ state: 'playing', art: null, artLayout: 'banner' }).banner).toBe(false);
    expect(mediaPlayerView({ state: 'playing', art, artLayout: 'thumb' }).banner).toBe(false);
    expect(mediaPlayerView({ state: 'playing', art }).banner).toBe(false);
  });

  it('defaults the shape to square', () => {
    expect(mediaPlayerView({ state: 'playing' }).artShape).toBe('square');
    expect(mediaPlayerView({ state: 'playing', artShape: 'wide' }).artShape).toBe('wide');
  });
});

describe('createMediaPlayer banner', () => {
  const art = 'https://example.com/cover.jpg';
  it('puts a square cover over a blurred copy above the row, without the thumb', () => {
    const { el } = createMediaPlayer({ title: 'Song', art, artLayout: 'banner', state: 'playing' });
    expect(el.className).toBe('mh-media-player is-playing has-banner');
    const banner = el.firstElementChild!;
    expect(banner.className).toBe('mh-media-player__banner is-square');
    expect(banner.getAttribute('aria-hidden')).toBe('true');
    const imgs = [...banner.querySelectorAll('img')];
    expect(imgs.map((i) => i.className)).toEqual(['mh-media-player__banner-backdrop', 'mh-media-player__banner-image']);
    for (const i of imgs) {
      expect(i.getAttribute('src')).toBe(art);
      expect(i.getAttribute('alt')).toBe('');
      expect(i.getAttribute('loading')).toBe('lazy');
      expect(i.getAttribute('referrerpolicy')).toBe('no-referrer');
    }
    expect(el.querySelector('.mh-media-player__art')).toBeNull();
  });

  it('fills a wide banner with the still alone', () => {
    const { el } = createMediaPlayer({ art, artLayout: 'banner', artShape: 'wide', state: 'paused' });
    expect(el.querySelector('.mh-media-player__banner')!.className).toBe('mh-media-player__banner is-wide');
    expect(el.querySelector('.mh-media-player__banner-backdrop')).toBeNull();
  });

  it('falls back to the thumb when idle, without art, in thumb layout, or when the image fails', () => {
    const player = createMediaPlayer({ art, artLayout: 'banner', state: 'idle' });
    expect(player.el.querySelector('.mh-media-player__banner')).toBeNull();
    expect(player.el.className).toBe('mh-media-player is-idle');
    expect(player.el.querySelector('.mh-media-player__art .mh-media-player__image')).not.toBeNull();
    player.update({ art: null, artLayout: 'banner', state: 'playing' });
    expect(player.el.querySelector('.mh-media-player__banner')).toBeNull();
    player.update({ art, state: 'playing' });
    expect(player.el.querySelector('.mh-media-player__banner')).toBeNull();
    player.update({ art, artLayout: 'banner', state: 'playing' });
    expect(player.el.querySelector('.mh-media-player__banner')).not.toBeNull();
    player.el.querySelector('.mh-media-player__banner-image')!.dispatchEvent(new Event('error'));
    expect(player.el.querySelector('.mh-media-player__banner')).toBeNull();
    expect(player.el.className).toBe('mh-media-player is-playing');
    expect(player.el.querySelector('.mh-media-player__art')!.className).toBe('mh-media-player__art is-empty');
    expect(player.el.firstElementChild!.className).toBe('mh-media-player__row');
  });
});

describe('createMediaPlayer', () => {
  it('shows only the buttons the player allows', () => {
    const { el, update } = createMediaPlayer({ title: 'Song', subtitle: 'Band', state: 'paused', can: { play: true, next: true } });
    expect(el.getAttribute('role')).toBe('group');
    expect(el.getAttribute('aria-label')).toBe('Song');
    expect(el.className).toBe('mh-media-player is-paused');
    expect(names(el, '.mh-media-player__transport button')).toEqual(['Play', 'Next']);
    expect(el.querySelector('.mh-media-player__volume')).toBeNull();
    expect(el.querySelector('.mh-media-player__progress')).toBeNull();
    update({ title: 'Song', state: 'playing', can: ALL, position: 30, duration: 120, volume: 0.5, muted: false });
    expect(names(el, '.mh-media-player__transport button')).toEqual(['Previous', 'Pause', 'Stop', 'Next']);
    expect(el.querySelector('.mh-media-player__subtitle')).toBeNull();
    expect(el.querySelector('.mh-visually-hidden')!.textContent).toBe('Playing');
    update({ state: 'off' });
    expect(el.querySelector('.mh-media-player__transport')).toBeNull();
    expect(el.querySelector('.mh-media-player__title')!.textContent).toBe('Nothing playing');
    expect(el.getAttribute('aria-label')).toBe('Media player');
  });

  it('fires the transport events and keeps the focused button across updates', () => {
    const seen: string[] = [];
    const events: Partial<MediaPlayerOptions> = {
      onPlay: () => seen.push('play'),
      onPause: () => seen.push('pause'),
      onStop: () => seen.push('stop'),
      onNext: () => seen.push('next'),
      onPrevious: () => seen.push('previous'),
    };
    const player = createMediaPlayer({ state: 'paused', can: ALL, ...events });
    document.body.append(player.el);
    const main = player.el.querySelector<HTMLButtonElement>('.mh-media-player__main')!;
    main.focus();
    main.click();
    player.update({ state: 'playing', can: ALL, ...events });
    expect(player.el.querySelector('.mh-media-player__main')).toBe(main);
    expect(document.activeElement).toBe(main);
    expect(main.getAttribute('aria-label')).toBe('Pause');
    main.click();
    for (const part of ['previous', 'stop', 'next']) player.el.querySelector<HTMLButtonElement>(`.mh-media-player__${part}`)!.click();
    expect(seen).toEqual(['play', 'pause', 'previous', 'stop', 'next']);
    player.el.remove();
  });

  it('commits volume and position on release, and toggles mute', () => {
    const volumes: number[] = [];
    const seeks: number[] = [];
    const mutes: boolean[] = [];
    const options: MediaPlayerOptions = {
      state: 'playing',
      can: ALL,
      position: 30,
      duration: 200,
      volume: 0.4,
      muted: false,
      onVolume: (v) => volumes.push(v),
      onSeek: (s) => seeks.push(s),
      onMute: (m) => mutes.push(m),
    };
    const { el, update } = createMediaPlayer(options);
    const level = el.querySelector<HTMLInputElement>('.mh-media-player__level input')!;
    expect(level.value).toBe('40');
    expect(level.getAttribute('aria-label')).toBe('Volume');
    expect(level.getAttribute('aria-valuetext')).toBe('40%');
    level.value = '70';
    level.dispatchEvent(new Event('input'));
    expect(volumes).toEqual([]);
    // An update while dragging doesn't move the thumb.
    update({ ...options, volume: 0.1 });
    expect(level.value).toBe('70');
    level.dispatchEvent(new Event('change'));
    expect(volumes).toEqual([0.7]);

    const seek = el.querySelector<HTMLInputElement>('.mh-media-player__seek input')!;
    expect(seek.getAttribute('aria-label')).toBe('Position');
    expect(seek.max).toBe('200');
    expect(seek.getAttribute('aria-valuetext')).toBe('0:30 of 3:20');
    seek.value = '90';
    seek.dispatchEvent(new Event('input'));
    seek.dispatchEvent(new Event('change'));
    expect(seeks).toEqual([90]);

    const mute = el.querySelector<HTMLButtonElement>('.mh-media-player__mute')!;
    expect(mute.getAttribute('aria-pressed')).toBe('false');
    mute.click();
    expect(mutes).toEqual([true]);
    update({ ...options, muted: true });
    expect(mute.getAttribute('aria-pressed')).toBe('true');
    expect(el.querySelector('.mh-media-player__level')!.className).toBe('mh-slider mh-media-player__level is-muted');
  });

  it('draws a progress line when it cannot seek', () => {
    const { el } = createMediaPlayer({ state: 'playing', position: 61, duration: 180, can: {} });
    const bar = el.querySelector('.mh-media-player__progress')!;
    expect(bar.getAttribute('role')).toBe('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('61');
    expect(bar.getAttribute('aria-valuemax')).toBe('180');
    expect(bar.getAttribute('aria-valuetext')).toBe('1:01 of 3:00');
    expect(el.querySelector('.mh-media-player__seek')).toBeNull();
  });

  it('shows the art without a referrer, and the placeholder when it fails', () => {
    const { el, update } = createMediaPlayer({ state: 'idle', art: 'https://example.com/a.jpg' });
    const art = el.querySelector('.mh-media-player__art')!;
    const img = art.querySelector('img')!;
    expect(art.className).toBe('mh-media-player__art');
    expect(img.getAttribute('referrerpolicy')).toBe('no-referrer');
    expect(img.getAttribute('loading')).toBe('lazy');
    img.dispatchEvent(new Event('error'));
    expect(art.className).toBe('mh-media-player__art is-empty');
    expect(art.querySelector('img')).toBeNull();
    expect(art.querySelector('.mh-media-player__placeholder svg')).not.toBeNull();
    update({ state: 'idle', art: 'https://example.com/b.jpg' });
    expect(art.querySelector('img')!.getAttribute('src')).toBe('https://example.com/b.jpg');
    update({ state: 'idle', art: null });
    expect(art.querySelector('img')).toBeNull();
  });
});

describe('media player details', () => {
  it('draws a real icon on the main button', () => {
    const { el, update } = createMediaPlayer({ state: 'paused', can: ALL });
    const d = () => el.querySelector('.mh-media-player__main path')!.getAttribute('d') ?? '';
    const play = d();
    expect(play.length).toBeGreaterThan(5);
    update({ state: 'playing', can: ALL });
    expect(d().length).toBeGreaterThan(5);
    expect(d()).not.toBe(play);
  });

  it('is compact while idle or off', () => {
    for (const state of ['idle', 'off'] as const) {
      const { el } = createMediaPlayer({ title: 'Song', state, can: ALL, position: 10, duration: 100, volume: 0.5 });
      expect(names(el, '.mh-media-player__transport button')).toEqual(['Play']);
      expect(el.querySelector('.mh-media-player__progress, .mh-media-player__seek, .mh-media-player__times, .mh-media-player__volume')).toBeNull();
    }
  });

  it('shows the elapsed and total time and the volume value', () => {
    const { el } = createMediaPlayer({ state: 'playing', can: ALL, position: 83, duration: 227, volume: 0.45 });
    expect(el.querySelector('.mh-media-player__elapsed')!.textContent).toBe('1:23');
    expect(el.querySelector('.mh-media-player__total')!.textContent).toBe('3:47');
    expect(el.querySelector('.mh-media-player__level-value')!.textContent).toBe('45%');
  });
});
