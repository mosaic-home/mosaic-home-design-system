import { createTimer, type TimerEvents, type TimerItem } from '@mosaic-home/design-system/web';

let timers: TimerItem[] = [
  { id: 'pasta', name: 'Pasta', duration: 600, state: 'running', endsAt: Date.now() + 431_000 },
  { id: 'bread', name: 'Bread proving', duration: 5400, state: 'paused', remaining: 3725 },
];

/** Seconds left on a timer. */
const left = (t: TimerItem): number =>
  t.state === 'running' && t.endsAt ? Math.max(0, (t.endsAt - Date.now()) / 1000) : (t.remaining ?? 0);

// Returning null removes the timer.
const change = (id: string, next: (t: TimerItem) => TimerItem | null): void => {
  timers = timers.flatMap((t) => (t.id === id ? (next(t) ?? []) : [t]));
  timer.update({ timers, ...events });
};

const events: TimerEvents = {
  onPause: (id) => change(id, (t) => ({ ...t, state: 'paused', remaining: left(t), endsAt: null })),
  onResume: (id) =>
    change(id, (t) => ({ ...t, state: 'running', endsAt: Date.now() + left(t) * 1000, remaining: null })),
  onAdd: (id, seconds) =>
    change(id, (t) => {
      const rest = left(t) + seconds;
      const duration = Math.max(t.duration, rest);
      return t.state === 'paused'
        ? { ...t, remaining: rest, duration }
        : { ...t, state: 'running', endsAt: Date.now() + rest * 1000, remaining: null, duration };
    }),
  onFinish: (id) => change(id, (t) => ({ ...t, state: 'finished', endsAt: null })),
  onCancel: (id) => change(id, () => null),
  onStop: (id) => change(id, () => null),
};

const timer = createTimer({ timers, ...events });

document.body.append(timer.el);
