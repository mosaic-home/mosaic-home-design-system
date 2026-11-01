import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RECORDING_PILL_SAMPLES, createNotice, createRecordingPill, formatElapsed, pushRecordingLevel } from './index.ts';

beforeEach(() => document.body.replaceChildren());

describe('notices', () => {
  it('permission: a section named by its heading, with points and actions', () => {
    const allow = vi.fn();
    const n = createNotice({
      kind: 'permission',
      icon: 'microphone',
      title: 'Talk to your home',
      message: 'Allow microphone access.',
      points: ['Only while you hold the button'],
      actions: [{ label: 'Allow', primary: true, onClick: allow }, { label: 'Not now', dismisses: true }],
    });
    document.body.append(n.el);
    expect(n.el.tagName).toBe('SECTION');
    expect(n.el.className).toBe('mh-notice mh-notice--permission');
    const heading = n.el.querySelector('h3.mh-notice__title')!;
    expect(n.el.getAttribute('aria-labelledby')).toBe(heading.id);
    expect(n.el.querySelectorAll('.mh-notice__point')).toHaveLength(1);
    expect(n.el.querySelector('.mh-notice__dismiss')).toBeNull();
    const [primary, secondary] = [...n.el.querySelectorAll<HTMLButtonElement>('.mh-notice__actions button')];
    expect(primary!.className).toBe('mh-button mh-button--primary');
    expect(secondary!.className).toBe('mh-button mh-button--text');
    primary!.click();
    expect(allow).toHaveBeenCalledTimes(1);
    expect(n.el.isConnected).toBe(true);
    secondary!.click();
    expect(n.el.isConnected).toBe(false);
  });

  it('tip: a dismissible note', () => {
    const onDismiss = vi.fn();
    const n = createNotice({ message: 'Long-press a tile.', onDismiss, actions: [{ label: 'Got it', primary: true }] });
    document.body.append(n.el);
    expect(n.el.getAttribute('role')).toBe('note');
    expect(n.el.className).toBe('mh-notice mh-notice--tip');
    expect(n.el.querySelector('.mh-notice__actions button')!.className).toBe('mh-button mh-button--tonal mh-button--sm');
    n.el.querySelector<HTMLButtonElement>('.mh-notice__dismiss')!.click();
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(n.el.isConnected).toBe(false);
  });

  it('capability: a quiet note, not dismissible by default', () => {
    const n = createNotice({ kind: 'capability', title: 'No microphone', message: 'Voice is off here.', icon: false });
    expect(n.el.getAttribute('role')).toBe('note');
    expect(n.el.querySelector('.mh-notice__icon')).toBeNull();
    expect(n.el.querySelector('p.mh-notice__title')!.textContent).toBe('No microphone');
    expect(n.el.querySelector('.mh-notice__dismiss')).toBeNull();
    n.setMessage('Changed');
    expect(n.el.querySelector('.mh-notice__message')!.textContent).toBe('Changed');
  });
});

describe('recording pill', () => {
  afterEach(() => vi.useRealTimers());

  it('formats elapsed time', () => {
    expect(formatElapsed(0)).toBe('0:00');
    expect(formatElapsed(42.9)).toBe('0:42');
    expect(formatElapsed(605)).toBe('10:05');
    expect(formatElapsed(3725)).toBe('1:02:05');
    expect(formatElapsed(-3)).toBe('0:00');
  });

  it('keeps a fixed-length waveform', () => {
    let levels = new Array<number>(RECORDING_PILL_SAMPLES).fill(0);
    levels = pushRecordingLevel(levels, 2);
    expect(levels).toHaveLength(RECORDING_PILL_SAMPLES);
    expect(levels.at(-1)).toBe(1);
  });

  it('renders the status, a timer and the waveform', () => {
    const p = createRecordingPill({ elapsed: 42, ticking: false, level: 0.5 });
    expect(p.el.className).toBe('mh-recording-pill is-recording');
    expect(p.el.getAttribute('role')).toBe('group');
    expect(p.el.getAttribute('aria-label')).toBe('Recording');
    const timer = p.el.querySelector('.mh-recording-pill__timer')!;
    expect(timer.getAttribute('role')).toBe('timer');
    expect(timer.textContent).toBe('0:42');
    expect(timer.getAttribute('datetime')).toBe('PT42S');
    const bars = p.el.querySelectorAll<HTMLElement>('.mh-recording-pill__bar');
    expect(bars).toHaveLength(RECORDING_PILL_SAMPLES);
    expect(bars[bars.length - 1]!.style.getPropertyValue('--_v')).toBe('0.5');
    expect(p.el.querySelector('button')).toBeNull();
  });

  it('counts up while recording and stops when paused', () => {
    vi.useFakeTimers();
    const p = createRecordingPill({ elapsed: 5 });
    document.body.append(p.el);
    vi.advanceTimersByTime(3000);
    expect(p.el.querySelector('.mh-recording-pill__timer')!.textContent).toBe('0:08');
    p.setPaused(true);
    vi.advanceTimersByTime(5000);
    expect(p.elapsed).toBe(8);
    expect(p.el.className).toBe('mh-recording-pill is-paused');
    expect(p.el.querySelector('.mh-recording-pill__status')!.textContent).toBe('Paused');
    p.destroy();
  });

  it('pauses, resumes and stops through its buttons', () => {
    const onPauseToggle = vi.fn();
    const onStop = vi.fn();
    const p = createRecordingPill({ ticking: false, floating: 'top', onPauseToggle, onStop });
    expect(p.el.className).toBe('mh-recording-pill mh-recording-pill--floating mh-recording-pill--top is-recording');
    const pause = p.el.querySelector<HTMLButtonElement>('.mh-recording-pill__pause')!;
    expect(pause.getAttribute('aria-label')).toBe('Pause recording');
    pause.click();
    expect(onPauseToggle).toHaveBeenCalledWith(true);
    expect(pause.getAttribute('aria-label')).toBe('Resume recording');
    p.el.querySelector<HTMLButtonElement>('.mh-recording-pill__stop')!.click();
    expect(onStop).toHaveBeenCalledTimes(1);
  });
});
