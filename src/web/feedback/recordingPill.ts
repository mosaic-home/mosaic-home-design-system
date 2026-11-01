import { mdiMicrophone, mdiPause, mdiStop } from '@mdi/js';
import { iconButtonClass } from '../actions/iconButton.ts';
import { cx, h } from '../dom.ts';
import { createIcon } from '../icons.ts';
import { voiceLevel } from './voiceBar.ts';

/** How many recent levels the waveform shows. */
export const RECORDING_PILL_SAMPLES = 16;

export type RecordingPillPlacement = 'top' | 'bottom';

export interface RecordingPillOptions {
  /** Seconds recorded so far (default 0). */
  elapsed?: number;
  paused?: boolean;
  /** Count up once a second while not paused (default true). Off: the timer only changes through `setElapsed`. */
  ticking?: boolean;
  /** Input level, 0–1; each new level adds a bar to the waveform. */
  level?: number;
  /** Name of the pill and its status while recording; default "Recording". */
  label?: string;
  /** Status while paused; default "Paused". */
  pausedLabel?: string;
  /** Float over the screen at the top or bottom centre instead of sitting in the flow. */
  floating?: RecordingPillPlacement;
  /** Shows a pause / resume button. */
  onPauseToggle?: (paused: boolean) => void;
  pauseLabel?: string;
  resumeLabel?: string;
  /** Shows a stop button. */
  onStop?: () => void;
  stopLabel?: string;
}

export interface RecordingPillHandle {
  el: HTMLDivElement;
  readonly elapsed: number;
  setElapsed(seconds: number): void;
  setPaused(paused: boolean): void;
  setLevel(level: number): void;
  /** Stops the internal clock. */
  destroy(): void;
}

/** Elapsed time as `m:ss`, or `h:mm:ss` from an hour. */
export function formatElapsed(seconds: number): string {
  const total = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  const hh = Math.floor(total / 3600);
  const mm = Math.floor((total % 3600) / 60);
  const ss = String(total % 60).padStart(2, '0');
  return hh ? `${hh}:${String(mm).padStart(2, '0')}:${ss}` : `${mm}:${ss}`;
}

/** The ISO 8601 duration of the elapsed time, for `<time datetime>`. */
export function elapsedDuration(seconds: number): string {
  return `PT${Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0))}S`;
}

/** An empty waveform. */
export const emptyRecordingLevels = (): number[] => new Array<number>(RECORDING_PILL_SAMPLES).fill(0);

/** The waveform with one more level at the end (the oldest drops off). */
export function pushRecordingLevel(levels: readonly number[], level: number | undefined): number[] {
  return [...levels, voiceLevel(level)].slice(-RECORDING_PILL_SAMPLES);
}

export function recordingPillClass(paused = false, floating?: RecordingPillPlacement): string {
  return cx('mh-recording-pill', floating && `mh-recording-pill--floating mh-recording-pill--${floating}`, paused ? 'is-paused' : 'is-recording');
}

/**
 * `.mh-recording-pill` (`--floating --top | --bottom`, `.is-recording | .is-paused`): recording status with a
 * pulsing dot, a `role="timer"` clock, a live waveform and optional pause and stop buttons. Parts `__dot`,
 * `__status` (visually hidden, announced on change), `__timer`, `__wave`, `__bar`, `__pause`, `__stop`.
 */
export function createRecordingPill(options: RecordingPillOptions = {}): RecordingPillHandle {
  const label = options.label ?? 'Recording';
  const pausedLabel = options.pausedLabel ?? 'Paused';
  let paused = options.paused ?? false;
  let elapsed = Math.max(0, options.elapsed ?? 0);
  let levels = options.level === undefined ? emptyRecordingLevels() : pushRecordingLevel(emptyRecordingLevels(), options.level);

  const status = h('span', { class: 'mh-recording-pill__status mh-visually-hidden', 'aria-live': 'polite' });
  const timer = h('time', { class: 'mh-recording-pill__timer', role: 'timer' });
  const bars = levels.map(() => h('span', { class: 'mh-recording-pill__bar' }));
  const el = h(
    'div',
    { class: recordingPillClass(paused, options.floating), role: 'group', 'aria-label': label },
    h('span', { class: 'mh-recording-pill__dot', 'aria-hidden': 'true' }),
    status,
    timer,
    h('span', { class: 'mh-recording-pill__wave', 'aria-hidden': 'true' }, ...bars),
  );
  let pause: HTMLButtonElement | null = null;
  if (options.onPauseToggle) {
    pause = h('button', { type: 'button', class: cx(iconButtonClass('default', 'small'), 'mh-recording-pill__pause') });
    pause.addEventListener('click', () => {
      handle.setPaused(!paused);
      options.onPauseToggle!(paused);
    });
    el.append(pause);
  }
  if (options.onStop) {
    const stopLabel = options.stopLabel ?? 'Stop recording';
    const stop = h('button', { type: 'button', class: cx(iconButtonClass('default', 'small'), 'mh-recording-pill__stop'), 'aria-label': stopLabel, title: stopLabel }, createIcon(mdiStop));
    stop.addEventListener('click', () => options.onStop!());
    el.append(stop);
  }

  const drawTime = (): void => {
    timer.textContent = formatElapsed(elapsed);
    timer.setAttribute('datetime', elapsedDuration(elapsed));
  };
  const drawWave = (): void => bars.forEach((bar, i) => bar.style.setProperty('--_v', String(levels[i])));
  const drawState = (): void => {
    el.className = recordingPillClass(paused, options.floating);
    status.textContent = paused ? pausedLabel : label;
    if (pause) {
      const text = paused ? (options.resumeLabel ?? 'Resume recording') : (options.pauseLabel ?? 'Pause recording');
      pause.setAttribute('aria-label', text);
      pause.title = text;
      pause.replaceChildren(createIcon(paused ? mdiMicrophone : mdiPause));
    }
  };

  // The clock: counts from an anchor so a slow timer never drifts.
  let anchor = 0;
  let clock: ReturnType<typeof setInterval> | null = null;
  let seen = false;
  const stopClock = (): void => {
    if (clock !== null) clearInterval(clock);
    clock = null;
  };
  const startClock = (): void => {
    stopClock();
    if (paused || options.ticking === false) return;
    anchor = Date.now() - elapsed * 1000;
    clock = setInterval(() => {
      if (el.isConnected) seen = true;
      else if (seen) return stopClock();
      const next = Math.floor((Date.now() - anchor) / 1000);
      if (next !== Math.floor(elapsed)) {
        elapsed = next;
        drawTime();
      }
    }, 250);
  };

  const handle: RecordingPillHandle = {
    el,
    get elapsed() {
      return elapsed;
    },
    setElapsed(seconds) {
      elapsed = Math.max(0, seconds);
      drawTime();
      if (clock !== null) startClock();
    },
    setPaused(value) {
      if (value === paused) return;
      paused = value;
      drawState();
      startClock();
    },
    setLevel(level) {
      levels = pushRecordingLevel(levels, level);
      drawWave();
    },
    destroy: stopClock,
  };
  drawTime();
  drawWave();
  drawState();
  startClock();
  return handle;
}
