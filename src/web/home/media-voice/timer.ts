import { mdiBellRing, mdiClose, mdiPause, mdiPlay } from '@mdi/js';
import { buttonClass } from '../../actions/button.ts';
import { iconButtonClass } from '../../actions/iconButton.ts';
import { cx, h } from '../../dom.ts';
import { createIcon } from '../../icons.ts';
import { syncChildren } from '../children.ts';

export type TimerState = 'running' | 'paused' | 'finished';

/** One countdown. Running timers carry their end time, so the time left is right even after the page slept. */
export interface TimerItem {
  id: string;
  /** "Pasta", "Tea"; without one the timer is called by `labels.timer`. */
  name?: string | null;
  /** The length it was set to, in seconds: draws the ring. */
  duration: number;
  state: TimerState;
  /** Running: when it ends, in ms since the epoch (`Date.now()` clock). */
  endsAt?: number | null;
  /** Paused (or running without `endsAt`): seconds left. */
  remaining?: number | null;
}

/** Every word the timers show or speak. `{name}` is the timer's name, `{time}` a time like "1:00". */
export interface TimerLabels {
  group: string;
  empty: string;
  /** Name of a timer that has none. */
  timer: string;
  running: string;
  paused: string;
  finished: string;
  pause: string;
  resume: string;
  /** Visible text of the add button. */
  addText: string;
  add: string;
  cancel: string;
  /** Visible text of the button that silences a finished timer. */
  stopText: string;
  stop: string;
  /** Spoken when a timer appears, pauses, resumes or finishes. */
  started: string;
  pausedNotice: string;
  resumedNotice: string;
  finishedNotice: string;
}

export const TIMER_LABELS: TimerLabels = {
  group: 'Timers',
  empty: 'No timers',
  timer: 'Timer',
  running: 'Running',
  paused: 'Paused',
  finished: 'Finished',
  pause: 'Pause {name}',
  resume: 'Resume {name}',
  addText: '+{time}',
  add: 'Add {time} to {name}',
  cancel: 'Cancel {name}',
  stopText: 'Stop',
  stop: 'Stop {name}',
  started: '{name} started, {time}',
  pausedNotice: '{name} paused, {time} left',
  resumedNotice: '{name} running, {time} left',
  finishedNotice: '{name} finished',
};

export interface TimerEvents {
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  /** The add button: `seconds` is `addStep`. Also offered on a finished timer, to run it a little longer. */
  onAdd?: (id: string, seconds: number) => void;
  onCancel?: (id: string) => void;
  /** Silences a finished timer (default `onCancel`). */
  onStop?: (id: string) => void;
  /** A running timer reached zero on this screen (once per timer), before the data says so. */
  onFinish?: (id: string) => void;
}

export interface TimerData {
  timers: readonly TimerItem[];
  /** Accessible name of the group (default "Timers"). */
  label?: string;
  /** Seconds the add button adds (default 60). */
  addStep?: number;
  labels?: Partial<TimerLabels>;
  /** The clock, in ms since the epoch (default `Date.now`); for tests and synced clocks. */
  now?: () => number;
}

export interface TimerOptions extends TimerData, TimerEvents {}

export interface TimerHandle {
  el: HTMLDivElement;
  update(options: TimerOptions): void;
  /** Stops the ticking and the wake-up listener. */
  destroy(): void;
}

/** A countdown: "4:59", "1:02:05". Rounds up, so it shows 0:01 until the time is really up. */
export function formatTimerTime(seconds: number): string {
  const s = Math.max(0, Math.ceil(Number.isFinite(seconds) ? seconds - 1e-6 : 0));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, '0');
  return hh ? `${hh}:${String(mm).padStart(2, '0')}:${ss}` : `${mm}:${ss}`;
}

const fill = (template: string, values: Record<string, string>): string => template.replace(/\{(\w+)\}/g, (all, key: string) => values[key] ?? all);

/** Seconds left at `now` (ms). */
export function timerLeft(timer: TimerItem, now: number): number {
  if (timer.state === 'finished') return 0;
  if (timer.state === 'running' && timer.endsAt !== null && timer.endsAt !== undefined && Number.isFinite(timer.endsAt)) return Math.max(0, (timer.endsAt - now) / 1000);
  const left = timer.remaining ?? timer.duration;
  return Math.max(0, Number.isFinite(left) ? left : 0);
}

/** The state shown: a running timer with no time left is finished. */
export function timerState(timer: TimerItem, now: number): TimerState {
  return timer.state === 'running' && timerLeft(timer, now) <= 0 ? 'finished' : timer.state;
}

/** Ms until the shown time of any running timer changes, or null when none is running. */
export function timerNextTick(timers: readonly TimerItem[], now: number): number | null {
  let next: number | null = null;
  for (const t of timers) {
    if (t.state !== 'running') continue;
    const ms = timerLeft(t, now) * 1000;
    if (ms <= 0) continue;
    const wait = Math.max(1, Math.ceil(ms % 1000 || 1000));
    next = next === null ? wait : Math.min(next, wait);
  }
  return next;
}

export interface TimerItemView {
  id: string;
  name: string;
  state: TimerState;
  className: string;
  /** Seconds left. */
  left: number;
  time: string;
  /** Share of the time left, 0 to 1 (draws the ring). */
  fraction: number;
  stateText: string;
  /** The first button: pause or resume; none when finished. */
  main: 'pause' | 'resume' | null;
  mainLabel: string;
  addText: string;
  addLabel: string;
  cancelLabel: string;
  stopLabel: string;
}

export interface TimerView {
  labels: TimerLabels;
  label: string;
  addStep: number;
  items: TimerItemView[];
}

/** Everything the timers draw at `now`: the same for the web renderer and React. */
export function timerView(data: TimerData, now: number): TimerView {
  const labels = { ...TIMER_LABELS, ...data.labels };
  const addStep = data.addStep && data.addStep > 0 ? data.addStep : 60;
  const step = formatTimerTime(addStep);
  const items = data.timers.map((t): TimerItemView => {
    const name = t.name?.trim() || labels.timer;
    const state = timerState(t, now);
    const left = state === 'finished' ? 0 : timerLeft(t, now);
    const fraction = t.duration > 0 ? Math.round(Math.min(1, left / t.duration) * 1000) / 1000 : 0;
    const main = state === 'running' ? 'pause' : state === 'paused' ? 'resume' : null;
    return {
      id: t.id,
      name,
      state,
      className: cx('mh-timer__item', `is-${state}`),
      left,
      time: formatTimerTime(left),
      fraction,
      stateText: labels[state],
      main,
      mainLabel: main ? fill(labels[main], { name }) : '',
      addText: fill(labels.addText, { time: step }),
      addLabel: fill(labels.add, { name, time: step }),
      cancelLabel: fill(labels.cancel, { name }),
      stopLabel: fill(labels.stop, { name }),
    };
  });
  return { labels, label: data.label ?? labels.group, addStep, items };
}

/** What to say about the timers that changed since `before` (id to shown state); `null` before means the first draw. */
export function timerAnnouncement(before: Readonly<Record<string, TimerState>> | null, view: TimerView): string {
  if (!before) return '';
  const L = view.labels;
  const said: string[] = [];
  for (const item of view.items) {
    const was = before[item.id];
    if (was === item.state) continue;
    const values = { name: item.name, time: item.time };
    if (item.state === 'finished') said.push(fill(L.finishedNotice, values));
    else if (was === undefined) said.push(fill(L.started, values));
    else if (item.state === 'paused') said.push(fill(L.pausedNotice, values));
    else if (was === 'paused') said.push(fill(L.resumedNotice, values));
  }
  return said.join('. ');
}

/** The id to shown-state map that `timerAnnouncement` compares against. */
export function timerStates(view: TimerView): Record<string, TimerState> {
  return Object.fromEntries(view.items.map((i) => [i.id, i.state]));
}

/** Classes of the buttons of a timer. */
export function timerButtonClass(part: 'main' | 'add' | 'cancel' | 'stop'): string {
  if (part === 'add') return cx(buttonClass('tonal', 'small'), 'mh-timer__add');
  if (part === 'stop') return cx(buttonClass('primary', 'small'), 'mh-timer__stop');
  return cx(iconButtonClass('default', 'small', part === 'main'), `mh-timer__${part}`);
}

/** The glyph in the middle of the ring: a pause sign while paused, a ringing bell when finished. */
export function timerGlyph(state: TimerState): string | null {
  return state === 'paused' ? mdiPause : state === 'finished' ? mdiBellRing : null;
}

interface TimerRow {
  el: HTMLLIElement;
  glyph: HTMLSpanElement;
  glyphFor: string | null;
  name: HTMLSpanElement;
  time: HTMLSpanElement;
  state: HTMLSpanElement;
  actions: HTMLDivElement;
  main: HTMLButtonElement;
  mainFor: string | null;
  add: HTMLButtonElement;
  cancel: HTMLButtonElement;
  stop: HTMLButtonElement;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
function ringCircle(cls: string): SVGCircleElement {
  const c = document.createElementNS(SVG_NS, 'circle');
  c.setAttribute('class', cls);
  c.setAttribute('cx', '20');
  c.setAttribute('cy', '20');
  c.setAttribute('r', '17');
  c.setAttribute('pathLength', '100');
  return c;
}

/**
 * `.mh-timer`: named countdowns, several at once, as a labelled group with a `__list` of `__item`s
 * (`.is-running | is-paused | is-finished`). Each item has a `__dial` (an SVG `__ring` drained by `--_left`, and a
 * `__glyph`), `__text` (`__name`, the `__time` with `role="timer"`, the `__state` word) and `__actions` (pause or
 * resume, add a minute, cancel; a finished one offers add and `__stop`). Running timers are drawn from their end
 * time and re-checked once a second and when the page wakes, so a sleeping tab is right again at once. A hidden
 * polite live region says when a timer starts, pauses, resumes or finishes; the seconds themselves aren't spoken.
 */
export function createTimer(options: TimerOptions): TimerHandle {
  let current = options;
  const now = (): number => (current.now ?? Date.now)();
  const rows = new Map<string, TimerRow>();
  const list = h('ul', { class: 'mh-timer__list' });
  const empty = h('p', { class: 'mh-timer__empty' });
  const announce = h('div', { class: 'mh-visually-hidden mh-timer__announce', 'aria-live': 'polite' });
  const el = h('div', { class: 'mh-timer', role: 'group' });
  let before: Record<string, TimerState> | null = null;
  const finishedHere = new Set<string>();
  let tick: ReturnType<typeof setTimeout> | undefined;

  const row = (id: string): TimerRow => {
    const existing = rows.get(id);
    if (existing) return existing;
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'mh-timer__ring');
    svg.setAttribute('viewBox', '0 0 40 40');
    svg.append(ringCircle('mh-timer__track'), ringCircle('mh-timer__arc'));
    const glyph = h('span', { class: 'mh-timer__glyph' });
    const r: TimerRow = {
      el: h('li', {}),
      glyph,
      glyphFor: null,
      name: h('span', { class: 'mh-timer__name' }),
      time: h('span', { class: 'mh-timer__time', role: 'timer' }),
      state: h('span', { class: 'mh-timer__state' }),
      actions: h('div', { class: 'mh-timer__actions', role: 'group' }),
      main: h('button', { type: 'button', class: timerButtonClass('main') }),
      mainFor: null,
      add: h('button', { type: 'button', class: timerButtonClass('add') }, h('span', { class: 'mh-button__label' })),
      cancel: h('button', { type: 'button', class: timerButtonClass('cancel') }, createIcon(mdiClose)),
      stop: h('button', { type: 'button', class: timerButtonClass('stop') }, h('span', { class: 'mh-button__label' })),
    };
    const item = (): TimerItemView | undefined => view.items.find((i) => i.id === id);
    r.main.addEventListener('click', () => (item()?.main === 'pause' ? current.onPause?.(id) : current.onResume?.(id)));
    r.add.addEventListener('click', () => current.onAdd?.(id, view.addStep));
    r.cancel.addEventListener('click', () => current.onCancel?.(id));
    r.stop.addEventListener('click', () => (current.onStop ?? current.onCancel)?.(id));
    r.el.append(h('span', { class: 'mh-timer__dial', 'aria-hidden': 'true' }, svg, glyph), h('div', { class: 'mh-timer__text' }, r.name, r.time, r.state), r.actions);
    rows.set(id, r);
    return r;
  };

  const name = (b: HTMLButtonElement, label: string): void => {
    b.setAttribute('aria-label', label);
    b.title = label;
  };

  let view = timerView(options, now());
  const render = (): void => {
    const at = now();
    view = timerView(current, at);
    el.setAttribute('aria-label', view.label);
    const seen = new Set<string>();
    const items = view.items.map((v) => {
      seen.add(v.id);
      const r = row(v.id);
      r.el.className = v.className;
      r.el.style.setProperty('--_left', String(v.fraction));
      const glyph = timerGlyph(v.state);
      if (glyph !== r.glyphFor) {
        r.glyphFor = glyph;
        r.glyph.replaceChildren(...(glyph ? [createIcon(glyph)] : []));
      }
      r.name.textContent = v.name;
      r.time.textContent = v.time;
      r.state.textContent = v.stateText;
      r.actions.setAttribute('aria-label', v.name);
      if (v.main) {
        name(r.main, v.mainLabel);
        if (r.mainFor !== v.main) {
          r.mainFor = v.main;
          r.main.replaceChildren(createIcon(v.main === 'pause' ? mdiPause : mdiPlay));
        }
      }
      r.add.firstElementChild!.textContent = v.addText;
      name(r.add, v.addLabel);
      name(r.cancel, v.cancelLabel);
      r.stop.firstElementChild!.textContent = view.labels.stopText;
      name(r.stop, v.stopLabel);
      syncChildren(r.actions, v.state === 'finished' ? [r.add, r.stop] : [r.main, r.add, r.cancel]);
      return r.el;
    });
    for (const id of [...rows.keys()]) if (!seen.has(id)) rows.delete(id);
    syncChildren(list, items);
    empty.textContent = view.labels.empty;
    syncChildren(el, [view.items.length ? list : empty, announce]);

    const said = timerAnnouncement(before, view);
    if (said) announce.textContent = said;
    before = timerStates(view);
    for (const t of current.timers) {
      if (t.state === 'running' && timerState(t, at) === 'finished') {
        if (!finishedHere.has(t.id)) {
          finishedHere.add(t.id);
          current.onFinish?.(t.id);
        }
      } else finishedHere.delete(t.id);
    }

    clearTimeout(tick);
    const wait = timerNextTick(current.timers, at);
    tick = wait === null ? undefined : setTimeout(render, wait);
  };

  const wake = (): void => {
    if (document.visibilityState === 'visible') render();
  };
  document.addEventListener('visibilitychange', wake);
  render();

  return {
    el,
    update(next) {
      current = next;
      render();
    },
    destroy() {
      clearTimeout(tick);
      tick = undefined;
      document.removeEventListener('visibilitychange', wake);
    },
  };
}
