import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BOOT_SPLASH_EXIT_MS, createAccentHeadline, createBackdrop, createBootSplash, createKbd, keyCap, parseKeys, splitAccent } from './index.ts';

beforeEach(() => document.body.replaceChildren());

describe('accent headline', () => {
  it('splits around the accent phrase', () => {
    expect(splitAccent('Good evening, home', 'evening')).toEqual(['Good ', 'evening', ', home']);
    expect(splitAccent('Welcome', 'home')).toEqual(['Welcome ', 'home', '']);
    expect(splitAccent('Plain')).toEqual(['Plain', '', '']);
  });

  it('renders a heading with one serif accent', () => {
    const a = createAccentHeadline({ text: 'Good evening, home', accent: 'evening', size: 'display', level: 1 });
    expect(a.el.tagName).toBe('H1');
    expect(a.el.className).toBe('mh-accent-headline mh-accent-headline--display');
    expect(a.el.querySelector('em.mh-accent-headline__accent')!.textContent).toBe('evening');
    expect(a.el.textContent).toBe('Good evening, home');
    a.setText('Quiet hour', 'Quiet');
    expect(a.el.firstElementChild!.textContent).toBe('Quiet');
    expect(a.el.textContent).toBe('Quiet hour');
    expect(createAccentHeadline({ text: 'Hi', accent: 'there', tone: 'inherit' }).el.className).toBe('mh-accent-headline mh-accent-headline--headline mh-accent-headline--inherit');
  });
});

describe('kbd', () => {
  it('parses chords, including the plus key', () => {
    expect(parseKeys('Ctrl+K')).toEqual(['Ctrl', 'K']);
    expect(parseKeys('Ctrl + Shift + P')).toEqual(['Ctrl', 'Shift', 'P']);
    expect(parseKeys('Ctrl++')).toEqual(['Ctrl', '+']);
    expect(parseKeys('+')).toEqual(['+']);
    expect(parseKeys(['G', 'H'])).toEqual(['G', 'H']);
  });

  it('names keys', () => {
    expect(keyCap('Control').text).toBe('Ctrl');
    expect(keyCap('Escape').text).toBe('Esc');
    expect(keyCap(' ').text).toBe('Space');
    expect(keyCap('k').text).toBe('K');
    expect(keyCap('ArrowUp')).toEqual({ text: '↑', spoken: 'Up arrow' });
  });

  it('nests a kbd per key with separators', () => {
    const k = createKbd({ keys: 'Ctrl+K' });
    expect(k.el.tagName).toBe('KBD');
    expect(k.el.className).toBe('mh-kbd');
    expect([...k.el.querySelectorAll('kbd.mh-kbd__key')].map((e) => e.textContent)).toEqual(['Ctrl', 'K']);
    expect(k.el.querySelector('.mh-kbd__sep')!.textContent).toBe('+');
    const seq = createKbd({ keys: ['ArrowUp', 'ArrowDown'], sequence: true, size: 'small' });
    expect(seq.el.className).toBe('mh-kbd mh-kbd--sm mh-kbd--sequence');
    expect(seq.el.querySelector('.mh-kbd__sep')!.textContent).toBe('then');
    expect(seq.el.querySelector('.mh-kbd__key .mh-visually-hidden')!.textContent).toBe('Up arrow');
    expect(seq.el.querySelector('.mh-kbd__key [aria-hidden="true"]')!.textContent).toBe('↑');
    seq.setKeys('Esc');
    expect(seq.el.querySelectorAll('.mh-kbd__key')).toHaveLength(1);
  });
});

describe('backdrop', () => {
  it('is a decorative layer with modifiers', () => {
    const b = createBackdrop({ fixed: true });
    expect(b.el.className).toBe('mh-backdrop mh-backdrop--fixed');
    expect(b.el.getAttribute('aria-hidden')).toBe('true');
    b.setDrift(true);
    b.setDim(true);
    expect(b.el.classList.contains('mh-backdrop--drift')).toBe(true);
    expect(b.el.classList.contains('mh-backdrop--dim')).toBe(true);
    b.setDim(false);
    expect(b.el.classList.contains('mh-backdrop--dim')).toBe(false);
  });
});

describe('boot splash', () => {
  afterEach(() => vi.useRealTimers());

  it('shows the mark, name, message and progress', () => {
    const s = createBootSplash({ name: 'Mosaic Home', message: 'Starting', progress: null });
    expect(s.el.className).toBe('mh-boot-splash');
    expect(s.el.getAttribute('aria-busy')).toBe('true');
    expect(s.el.querySelectorAll('.mh-boot-splash__tile')).toHaveLength(4);
    expect(s.el.querySelector('.mh-boot-splash__mark')!.getAttribute('aria-hidden')).toBe('true');
    expect(s.el.querySelector('.mh-boot-splash__name')!.textContent).toBe('Mosaic Home');
    const message = s.el.querySelector('.mh-boot-splash__message')!;
    expect(message.getAttribute('aria-live')).toBe('polite');
    const bar = s.el.querySelector('[role="progressbar"]')!;
    expect(bar.classList.contains('mh-progress--indeterminate')).toBe(true);
    s.setMessage('Loading rooms');
    s.setProgress(50);
    expect(message.textContent).toBe('Loading rooms');
    expect(bar.getAttribute('aria-valuenow')).toBe('50');
    s.setProgress(undefined);
    expect(s.el.querySelector('[role="progressbar"]')).toBeNull();
  });

  it('fades out and removes itself', async () => {
    vi.useFakeTimers();
    const onDismissed = vi.fn();
    const s = createBootSplash({ inline: true, onDismissed });
    expect(s.el.className).toBe('mh-boot-splash mh-boot-splash--inline');
    document.body.append(s.el);
    const gone = s.dismiss();
    expect(s.dismiss()).toBe(gone);
    expect(s.el.classList.contains('is-leaving')).toBe(true);
    expect(s.el.hasAttribute('aria-busy')).toBe(false);
    vi.advanceTimersByTime(BOOT_SPLASH_EXIT_MS);
    await gone;
    expect(s.el.isConnected).toBe(false);
    expect(onDismissed).toHaveBeenCalledTimes(1);
  });

  it('takes a custom mark', () => {
    const mark = document.createElement('img');
    const s = createBootSplash({ mark });
    expect(s.el.querySelector('.mh-boot-splash__mark')!.firstElementChild).toBe(mark);
  });
});
