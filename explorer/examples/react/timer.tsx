import { useState } from 'react';
import { Timer } from '@mosaic-home/design-system/react';
import type { TimerItem } from '@mosaic-home/design-system/web';

/** Seconds left on a timer. */
const left = (t: TimerItem): number =>
  t.state === 'running' && t.endsAt ? Math.max(0, (t.endsAt - Date.now()) / 1000) : (t.remaining ?? 0);

export function TimerExample() {
  const [timers, setTimers] = useState<TimerItem[]>(() => [
    { id: 'pasta', name: 'Pasta', duration: 600, state: 'running', endsAt: Date.now() + 431_000 },
    { id: 'bread', name: 'Bread proving', duration: 5400, state: 'paused', remaining: 3725 },
  ]);
  // Returning null removes the timer.
  const change = (id: string, next: (t: TimerItem) => TimerItem | null) =>
    setTimers((list) => list.flatMap((t) => (t.id === id ? (next(t) ?? []) : [t])));
  const remove = (id: string) => change(id, () => null);
  const resume = (id: string) =>
    change(id, (t) => ({ ...t, state: 'running', endsAt: Date.now() + left(t) * 1000, remaining: null }));
  const add = (id: string, seconds: number) =>
    change(id, (t) => {
      const rest = left(t) + seconds;
      const duration = Math.max(t.duration, rest);
      return t.state === 'paused'
        ? { ...t, remaining: rest, duration }
        : { ...t, state: 'running', endsAt: Date.now() + rest * 1000, remaining: null, duration };
    });
  return (
    <Timer
      timers={timers}
      onPause={(id) => change(id, (t) => ({ ...t, state: 'paused', remaining: left(t), endsAt: null }))}
      onResume={resume}
      onAdd={add}
      onFinish={(id) => change(id, (t) => ({ ...t, state: 'finished', endsAt: null }))}
      onCancel={remove}
      onStop={remove}
    />
  );
}
