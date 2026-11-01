import { mdiAlertCircleOutline } from '@mdi/js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  assistReplyView,
  createAssistReply,
  createSpeakerSelector,
  createTimer,
  createTvRemote,
  createTvRemoteRepeater,
  createUpNext,
  createVoiceRing,
  formatTimerTime,
  speakerSelectorView,
  timerAnnouncement,
  timerNextTick,
  timerStates,
  timerView,
  tvRemoteRocker,
  tvRemoteView,
  upNextFocusAfterRemove,
  upNextView,
  voiceRingText,
  TV_REMOTE_REPEAT_DELAY,
  TV_REMOTE_REPEAT_EVERY,
  type TimerItem,
  type TvRemoteKey,
  type UpNextItem,
} from './index.ts';

const labels = (el: Element, selector: string): string[] => [...el.querySelectorAll(selector)].map((b) => b.getAttribute('aria-label') ?? '');
const texts = (el: Element, selector: string): string[] => [...el.querySelectorAll(selector)].map((b) => b.textContent ?? '');

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

describe('timer helpers', () => {
  it('formats a countdown, rounding up', () => {
    expect(formatTimerTime(0)).toBe('0:00');
    expect(formatTimerTime(0.2)).toBe('0:01');
    expect(formatTimerTime(59)).toBe('0:59');
    expect(formatTimerTime(299.4)).toBe('5:00');
    expect(formatTimerTime(3725)).toBe('1:02:05');
    expect(formatTimerTime(-3)).toBe('0:00');
  });

  it('works out the time left from the end time, and finishes at zero', () => {
    const t: TimerItem = { id: 'a', name: ' Pasta ', duration: 600, state: 'running', endsAt: 100_000 };
    const v = timerView({ timers: [t] }, 40_000).items[0]!;
    expect(v.name).toBe('Pasta');
    expect(v.time).toBe('1:00');
    expect(v.fraction).toBe(0.1);
    expect(v.main).toBe('pause');
    expect(v.mainLabel).toBe('Pause Pasta');
    expect(v.addLabel).toBe('Add 1:00 to Pasta');
    const done = timerView({ timers: [t] }, 100_500).items[0]!;
    expect(done.state).toBe('finished');
    expect(done.className).toBe('mh-timer__item is-finished');
    expect(done.main).toBeNull();
    const paused = timerView({ timers: [{ id: 'b', duration: 120, state: 'paused', remaining: 30 }], addStep: 120 }, 0).items[0]!;
    expect(paused.name).toBe('Timer');
    expect(paused.time).toBe('0:30');
    expect(paused.mainLabel).toBe('Resume Timer');
    expect(paused.addText).toBe('+2:00');
  });

  it('ticks when the next shown second changes, only while something runs', () => {
    expect(timerNextTick([{ id: 'a', duration: 60, state: 'running', endsAt: 10_250 }], 0)).toBe(250);
    expect(timerNextTick([{ id: 'a', duration: 60, state: 'running', endsAt: 10_000 }], 0)).toBe(1000);
    expect(timerNextTick([{ id: 'a', duration: 60, state: 'paused', remaining: 5 }], 0)).toBeNull();
    expect(timerNextTick([{ id: 'a', duration: 60, state: 'running', endsAt: 5 }], 10)).toBeNull();
  });

  it('announces starts, pauses, resumes and finishes, not the first draw', () => {
    const view = (timers: TimerItem[]) => timerView({ timers }, 0);
    const first = view([{ id: 'a', name: 'Tea', duration: 60, state: 'running', endsAt: 60_000 }]);
    expect(timerAnnouncement(null, first)).toBe('');
    const paused = view([{ id: 'a', name: 'Tea', duration: 60, state: 'paused', remaining: 30 }]);
    expect(timerAnnouncement(timerStates(first), paused)).toBe('Tea paused, 0:30 left');
    expect(timerAnnouncement(timerStates(paused), first)).toBe('Tea running, 1:00 left');
    const both = view([
      { id: 'a', name: 'Tea', duration: 60, state: 'finished' },
      { id: 'b', name: 'Eggs', duration: 300, state: 'running', endsAt: 300_000 },
    ]);
    expect(timerAnnouncement(timerStates(first), both)).toBe('Tea finished. Eggs started, 5:00');
  });
});

describe('createTimer', () => {
  it('counts down from the end time, finishes once and announces it', () => {
    vi.useFakeTimers();
    let now = 0;
    const finished: string[] = [];
    const timer = createTimer({ timers: [{ id: 'a', name: 'Eggs', duration: 10, state: 'running', endsAt: 3_000 }], now: () => now, onFinish: (id) => finished.push(id) });
    const el = timer.el;
    expect(el.getAttribute('role')).toBe('group');
    expect(el.getAttribute('aria-label')).toBe('Timers');
    expect(el.querySelector('.mh-timer__time')!.textContent).toBe('0:03');
    expect(el.querySelector('.mh-timer__time')!.getAttribute('role')).toBe('timer');
    expect(labels(el, '.mh-timer__actions button')).toEqual(['Pause Eggs', 'Add 1:00 to Eggs', 'Cancel Eggs']);
    now = 1_000;
    vi.advanceTimersByTime(1_000);
    expect(el.querySelector('.mh-timer__time')!.textContent).toBe('0:02');
    // The tab slept: the next draw is right at once.
    now = 9_000;
    document.dispatchEvent(new Event('visibilitychange'));
    expect(el.querySelector('.mh-timer__item')!.className).toBe('mh-timer__item is-finished');
    expect(el.querySelector('.mh-timer__announce')!.textContent).toBe('Eggs finished');
    expect(labels(el, '.mh-timer__actions button')).toEqual(['Add 1:00 to Eggs', 'Stop Eggs']);
    expect(finished).toEqual(['a']);
    vi.advanceTimersByTime(5_000);
    expect(finished).toEqual(['a']);
    timer.destroy();
  });

  it('keeps rows and focus across updates, and fires the buttons', () => {
    const seen: string[] = [];
    const events = {
      onPause: (id: string) => seen.push(`pause ${id}`),
      onResume: (id: string) => seen.push(`resume ${id}`),
      onAdd: (id: string, s: number) => seen.push(`add ${id} ${s}`),
      onCancel: (id: string) => seen.push(`cancel ${id}`),
    };
    const timer = createTimer({ timers: [{ id: 'a', name: 'Tea', duration: 60, state: 'running', endsAt: 60_000 }], now: () => 0, ...events });
    document.body.append(timer.el);
    const main = timer.el.querySelector<HTMLButtonElement>('.mh-timer__main')!;
    main.focus();
    main.click();
    timer.update({ timers: [{ id: 'a', name: 'Tea', duration: 60, state: 'paused', remaining: 60 }], now: () => 0, ...events });
    expect(timer.el.querySelector('.mh-timer__main')).toBe(main);
    expect(document.activeElement).toBe(main);
    expect(main.getAttribute('aria-label')).toBe('Resume Tea');
    expect(timer.el.querySelector('.mh-timer__glyph svg')).not.toBeNull();
    main.click();
    timer.el.querySelector<HTMLButtonElement>('.mh-timer__add')!.click();
    timer.el.querySelector<HTMLButtonElement>('.mh-timer__cancel')!.click();
    expect(seen).toEqual(['pause a', 'resume a', 'add a 60', 'cancel a']);
    expect(timer.el.querySelector('.mh-timer__announce')!.textContent).toBe('Tea paused, 1:00 left');
    timer.update({ timers: [], now: () => 0 });
    expect(timer.el.querySelector('.mh-timer__empty')!.textContent).toBe('No timers');
    timer.destroy();
  });

  it('stops a finished timer with onStop, or onCancel without it', () => {
    const seen: string[] = [];
    const t: TimerItem[] = [{ id: 'a', duration: 60, state: 'finished' }];
    const timer = createTimer({ timers: t, onCancel: (id) => seen.push(`cancel ${id}`) });
    timer.el.querySelector<HTMLButtonElement>('.mh-timer__stop')!.click();
    timer.update({ timers: t, onCancel: () => seen.push('no'), onStop: (id) => seen.push(`stop ${id}`) });
    timer.el.querySelector<HTMLButtonElement>('.mh-timer__stop')!.click();
    expect(seen).toEqual(['cancel a', 'stop a']);
    timer.destroy();
  });
});

describe('speaker selector', () => {
  it('shows a volume row only for picked speakers that have one', () => {
    const v = speakerSelectorView({
      speakers: [
        { id: 'a', name: 'Kitchen', detail: 'Shelf', selected: true, playing: true, volume: 0.426, muted: false },
        { id: 'b', name: 'Study', volume: 0.5 },
        { id: 'c', name: 'Loft', selected: true, unavailable: true, playing: true, volume: 0.2 },
      ],
    });
    expect(v.speakers.map((s) => [s.detail, s.volume, s.mute, s.level])).toEqual([
      ['Shelf · Playing', true, true, 43],
      ['', false, false, 50],
      ['Unavailable', false, false, 20],
    ]);
    expect(v.speakers[0]!.className).toBe('mh-speaker-selector__item is-selected is-playing');
    // One at a time: only the first pick counts.
    const one = speakerSelectorView({ multiple: false, speakers: [{ id: 'a', name: 'A', selected: true }, { id: 'b', name: 'B', selected: true }] });
    expect(one.speakers.map((s) => s.selected)).toEqual([true, false]);
  });

  it('reports picks, volume on release and mute', () => {
    const seen: string[] = [];
    const speakers = [
      { id: 'a', name: 'Kitchen', selected: true, volume: 0.4, muted: false },
      { id: 'b', name: 'Study' },
    ];
    const sel = createSpeakerSelector({
      speakers,
      onSelect: (id, on) => seen.push(`select ${id} ${on}`),
      onVolume: (id, v) => seen.push(`volume ${id} ${v}`),
      onMute: (id, m) => seen.push(`mute ${id} ${m}`),
    });
    const el = sel.el;
    document.body.append(el);
    expect(el.tagName).toBe('FIELDSET');
    expect(el.querySelector('legend')!.textContent).toBe('Play on');
    const inputs = el.querySelectorAll<HTMLInputElement>('.mh-speaker-selector__input');
    expect([...inputs].map((i) => [i.type, i.checked])).toEqual([
      ['checkbox', true],
      ['checkbox', false],
    ]);
    inputs[1]!.click();
    const range = el.querySelector<HTMLInputElement>('.mh-speaker-selector__level input')!;
    expect(range.getAttribute('aria-label')).toBe('Kitchen volume');
    range.value = '70';
    range.dispatchEvent(new Event('input'));
    range.dispatchEvent(new Event('change'));
    el.querySelector<HTMLButtonElement>('.mh-speaker-selector__mute')!.click();
    expect(seen).toEqual(['select b true', 'volume a 0.7', 'mute a true']);
    // Radios: the same rows, now one at a time.
    sel.update({ speakers, multiple: false });
    expect([...el.querySelectorAll<HTMLInputElement>('.mh-speaker-selector__input')].map((i) => i.type)).toEqual(['radio', 'radio']);
    expect(el.querySelectorAll('.mh-checkbox__control').length).toBe(0);
  });
});

describe('TV remote', () => {
  it('lays out only the keys asked for', () => {
    const v = tvRemoteView({ keys: ['up', 'ok', 'volume-down', 'home'] });
    expect([v.top, v.pad, v.nav, v.volume, v.channel]).toEqual([[], ['up', 'ok'], ['home'], ['volume-down'], []]);
    expect(tvRemoteRocker(['volume-up', 'volume-down'])).toEqual(['volume-up', null, 'volume-down']);
    expect(tvRemoteRocker(['channel-down'])).toEqual([null, 'channel-down']);
    const el = createTvRemote({ keys: ['up', 'ok', 'volume-down', 'home'] }).el;
    expect(labels(el, 'button')).toEqual(['Up', 'OK', 'Home', 'Volume down']);
    expect(el.querySelector('.mh-tv-remote__sources')).toBeNull();
  });

  it('sends a key on click without a pointer, arrows on the pad, and sources', () => {
    const seen: string[] = [];
    const remote = createTvRemote({ sources: [{ id: 'hdmi', label: 'HDMI 1', active: true }, { id: 'app', label: 'Films' }], muted: true, onKey: (k) => seen.push(k), onSource: (id) => seen.push(`source ${id}`) });
    const el = remote.el;
    document.body.append(el);
    expect(el.querySelector('.mh-tv-remote__key--mute')!.getAttribute('aria-pressed')).toBe('true');
    el.querySelector<HTMLButtonElement>('.mh-tv-remote__ok')!.click();
    el.querySelector('.mh-tv-remote__ok')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    el.querySelector<HTMLButtonElement>('.mh-tv-remote__source:not(.is-active)')!.click();
    expect(seen).toEqual(['ok', 'left', 'source app']);
    expect(texts(el, '.mh-tv-remote__rocker-label')).toEqual(['Vol', 'Ch']);
    // A redraw keeps the same buttons, so the focus stays.
    const ok = el.querySelector<HTMLButtonElement>('.mh-tv-remote__ok')!;
    ok.focus();
    remote.update({ muted: false, onKey: (k) => seen.push(k) });
    expect(el.querySelector('.mh-tv-remote__ok')).toBe(ok);
    expect(document.activeElement).toBe(ok);
    expect(el.querySelector('.mh-tv-remote__sources')).toBeNull();
    remote.update({ disabled: true, onKey: (k) => seen.push(k) });
    ok.click();
    expect(seen).toEqual(['ok', 'left', 'source app']);
    remote.destroy();
  });

  it('repeats a held key until it is let go', () => {
    vi.useFakeTimers();
    const sent: TvRemoteKey[] = [];
    const r = createTvRemoteRepeater((k) => sent.push(k));
    r.down('volume-up');
    expect(sent).toEqual(['volume-up']);
    vi.advanceTimersByTime(TV_REMOTE_REPEAT_DELAY + TV_REMOTE_REPEAT_EVERY * 3);
    expect(sent.length).toBe(4);
    r.up();
    vi.advanceTimersByTime(2_000);
    expect(sent.length).toBe(4);
    r.down('power');
    vi.advanceTimersByTime(2_000);
    expect(sent.length).toBe(5);
  });
});

describe('up next', () => {
  const items: UpNextItem[] = [
    { id: 'a', title: 'First Song', subtitle: 'Band', duration: 200 },
    { id: 'b', title: 'Second Song', art: 'https://example.com/b.jpg' },
    { id: 'c', title: 'Third Song' },
  ];

  it('names the buttons after the item and counts what is left out', () => {
    const v = upNextView({ items, max: 2 });
    expect(v.items.map((i) => [i.playLabel, i.duration])).toEqual([
      ['Play First Song now', '3:20'],
      ['Play Second Song now', ''],
    ]);
    expect(v.more).toBe('1 more');
    expect(upNextFocusAfterRemove(2, 2)).toBe(1);
    expect(upNextFocusAfterRemove(0, 0)).toBe(-1);
    const el = createUpNext({ items, max: 2, onRemove: () => {} }).el;
    expect(el.querySelector('ol')).not.toBeNull();
    expect(labels(el, 'button')).toEqual(['Play First Song now', 'Remove First Song', 'Play Second Song now', 'Remove Second Song']);
    expect(el.querySelector('.mh-up-next__more')!.textContent).toBe('1 more');
    expect(createUpNext({ items }).el.querySelector('.mh-up-next__remove')).toBeNull();
  });

  it('moves the focus to the next item when the focused one is removed', () => {
    let list = items;
    const onRemove = (id: string): void => {
      list = list.filter((i) => i.id !== id);
      queue.update({ items: list, onRemove });
    };
    const queue = createUpNext({ items: list, onRemove });
    document.body.append(queue.el);
    const removes = (): HTMLButtonElement[] => [...queue.el.querySelectorAll<HTMLButtonElement>('.mh-up-next__remove')];
    removes()[1]!.focus();
    removes()[1]!.click();
    expect(document.activeElement).toBe(removes()[1]);
    expect(document.activeElement!.getAttribute('aria-label')).toBe('Remove Third Song');
    removes()[1]!.click();
    expect(document.activeElement!.getAttribute('aria-label')).toBe('Remove First Song');
    removes()[0]!.click();
    expect(document.activeElement).toBe(queue.el);
    expect(queue.el.querySelector('.mh-up-next__empty')!.textContent).toBe('Nothing up next');
  });
});

describe('voice ring', () => {
  it('follows the phase and level, and is a button only with onTap', () => {
    expect(voiceRingText('idle', undefined, true)).toBe('Tap to talk');
    expect(voiceRingText('idle', undefined, false)).toBe('Ready');
    expect(voiceRingText('muted', undefined, false)).toBe('Microphone off');
    const ring = createVoiceRing({ phase: 'listening', level: 0.456 });
    expect(ring.el.className).toBe('mh-voice-ring is-listening');
    const shape = ring.el.querySelector<HTMLElement>('.mh-voice-ring__ring')!;
    expect(shape.tagName).toBe('SPAN');
    expect(shape.getAttribute('aria-hidden')).toBe('true');
    expect(shape.style.getPropertyValue('--_level')).toBe('0.46');
    expect(ring.el.querySelector('.mh-voice-ring__label')!.getAttribute('aria-live')).toBe('polite');
    ring.setPhase('error');
    ring.setDetail('No answer');
    expect(ring.el.className).toBe('mh-voice-ring is-error');
    expect(ring.el.querySelector('.mh-voice-ring__label')!.textContent).toBe('Something went wrong');
    expect(ring.el.querySelector('.mh-voice-ring__detail')!.textContent).toBe('No answer');
    ring.setDetail(undefined);
    expect(ring.el.querySelector('.mh-voice-ring__detail')).toBeNull();

    let taps = 0;
    const tap = createVoiceRing({ size: 'medium', onTap: () => taps++ });
    expect(tap.el.className).toBe('mh-voice-ring mh-voice-ring--medium is-idle');
    const button = tap.el.querySelector<HTMLButtonElement>('button.mh-voice-ring__ring')!;
    expect(button.getAttribute('aria-label')).toBe('Tap to talk');
    button.click();
    tap.setLabel('Hold on');
    expect(button.getAttribute('aria-label')).toBe('Hold on');
    expect(taps).toBe(1);
  });
});

describe('assist reply', () => {
  it('shows what was heard, the reply and the changes', () => {
    const v = assistReplyView({ changes: [{ name: 'Fan', icon: 'fan', failed: true }, { name: 'Lamp', icon: 'lightbulb', state: 'On', active: true, tone: 'warm' }] });
    expect(v.changes.map((c) => [c.className, c.state, c.icon])).toEqual([
      ['mh-assist-reply__change is-failed', 'Didn’t respond', mdiAlertCircleOutline],
      ['mh-assist-reply__change mh-assist-reply__change--warm is-active', 'On', 'lightbulb'],
    ]);
    expect(v.undo).toBeNull();
    const el = createAssistReply({ heard: 'Lights off', reply: 'Done.', changes: [{ name: 'Lamp', icon: 'lightbulb', state: 'Off' }] }).el;
    expect(el.getAttribute('aria-label')).toBe('Assistant');
    expect(el.querySelector('.mh-assist-reply__heard')!.textContent).toBe('You said: Lights off');
    expect(el.querySelector('.mh-assist-reply__reply')!.getAttribute('aria-live')).toBe('polite');
    expect(el.querySelector('.mh-assist-reply__changes')!.getAttribute('aria-label')).toBe('Changed');
    expect(el.querySelector('.mh-assist-reply__footer')).toBeNull();
  });

  it('undoes, shows the busy state and then the note, keeping the focus in the reply', () => {
    let undos = 0;
    const onUndo = (): void => void undos++;
    const reply = createAssistReply({ reply: 'Done.', onUndo });
    document.body.append(reply.el);
    const undo = reply.el.querySelector<HTMLButtonElement>('.mh-assist-reply__undo')!;
    undo.focus();
    undo.click();
    reply.update({ reply: 'Done.', onUndo, undoing: true });
    expect(undo.disabled).toBe(true);
    expect(undo.getAttribute('aria-busy')).toBe('true');
    expect(undo.classList.contains('is-loading')).toBe(true);
    reply.update({ reply: 'Done.', onUndo, undone: true });
    expect(reply.el.querySelector('.mh-assist-reply__undo')).toBeNull();
    expect(reply.el.querySelector('.mh-assist-reply__undone')!.textContent).toBe('Undone');
    expect(document.activeElement).toBe(reply.el);
    expect(undos).toBe(1);
  });
});
