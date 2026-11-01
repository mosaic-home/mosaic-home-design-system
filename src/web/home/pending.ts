// A value the user is changing locally before (and just after) it is sent: shared by the home controls so taps
// can be gathered into one event and a slider doesn't jump back while the new value travels.

export type PendingPhase = 'idle' | 'draft' | 'pending' | 'held';

export interface PendingValueOptions<T> {
  /** Sends the settled value (once per gesture or burst of taps). */
  send(value: T): void;
  /** Called when the shown value changes without a call from the owner (a timer settled or expired). */
  changed?(): void;
  /** Idle time after the last `schedule` before the value is sent, in ms (default 700). */
  delay?: number;
  /** How long a sent value is kept on screen while waiting for the new state, in ms (default 3000). */
  hold?: number;
  /** Equality of two values (default `Object.is`). */
  equal?(a: T, b: T): boolean;
}

export interface PendingValue<T> {
  readonly phase: PendingPhase;
  /** What to show: the local value while there is one, else `prop`. A changed `prop` ends the hold early. */
  shown(prop: T): T;
  /** A local change that is sent once the user stops for `delay` ms (taps on − / +). */
  schedule(value: T, prop: T): void;
  /** A local change that is not sent yet (a slider being dragged). */
  draft(value: T, prop: T): void;
  /** A local change that is sent now (a slider released, a key pressed). */
  commit(value: T, prop: T): void;
  /** Sends a scheduled or drafted value now, if there is one. */
  flush(): void;
  /** Sends what is pending and stops the timers (unmount); the value stays usable. */
  dispose(): void;
}

export const PENDING_DELAY = 700;
export const PENDING_HOLD = 3000;

/** Creates the local-value buffer (no DOM, no framework; the web and React controls both use it). */
export function createPendingValue<T>(options: PendingValueOptions<T>): PendingValue<T> {
  const equal = options.equal ?? Object.is;
  let phase: PendingPhase = 'idle';
  let local: T | undefined;
  let base: T | undefined;
  let sendTimer: ReturnType<typeof setTimeout> | undefined;
  let holdTimer: ReturnType<typeof setTimeout> | undefined;

  const clearTimers = (): void => {
    clearTimeout(sendTimer);
    clearTimeout(holdTimer);
    sendTimer = holdTimer = undefined;
  };
  const reset = (): void => {
    clearTimers();
    phase = 'idle';
    local = base = undefined;
  };
  const edit = (value: T, prop: T, next: PendingPhase): void => {
    clearTimers();
    if (phase === 'idle' || phase === 'held') base = prop;
    local = value;
    phase = next;
  };
  const send = (): void => {
    if (phase !== 'draft' && phase !== 'pending') return;
    clearTimers();
    phase = 'held';
    options.send(local as T);
    holdTimer = setTimeout(() => {
      reset();
      options.changed?.();
    }, options.hold ?? PENDING_HOLD);
  };

  return {
    get phase() {
      return phase;
    },
    shown(prop) {
      if (phase === 'held' && !equal(prop, base as T)) reset();
      return phase === 'idle' ? prop : (local as T);
    },
    schedule(value, prop) {
      edit(value, prop, 'pending');
      sendTimer = setTimeout(() => {
        send();
        options.changed?.();
      }, options.delay ?? PENDING_DELAY);
    },
    draft(value, prop) {
      edit(value, prop, 'draft');
    },
    commit(value, prop) {
      edit(value, prop, 'draft');
      send();
    },
    flush: send,
    dispose() {
      send();
      clearTimers();
      if (phase === 'held') reset();
    },
  };
}
