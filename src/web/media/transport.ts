import { mdiPause, mdiPlay, mdiRepeat, mdiSkipNext, mdiSkipPrevious, mdiStepBackward, mdiStepForward } from '@mdi/js';
import { cx, h } from '../dom.ts';
import { createIcon } from '../icons.ts';
import { iconButtonClass, type IconButtonSize } from '../actions/iconButton.ts';
import { clamp, formatTimecode } from './timecode.ts';

export type TransportSize = 'small' | 'medium' | 'large';

export interface TransportLabels {
  start: string;
  stepBack: string;
  play: string;
  pause: string;
  stepForward: string;
  end: string;
  loop: string;
  position: string;
  duration: string;
}

export const TRANSPORT_LABELS: TransportLabels = {
  start: 'Go to start',
  stepBack: 'Step back',
  play: 'Play',
  pause: 'Pause',
  stepForward: 'Step forward',
  end: 'Go to end',
  loop: 'Loop',
  position: 'Position',
  duration: 'Duration',
};

export interface TransportOptions {
  /** Accessible name of the group ("Playback"). */
  label: string;
  playing?: boolean;
  /** Seconds. */
  position?: number;
  /** Seconds; 0 or missing hides the duration. */
  duration?: number;
  /** Frames per second: the timecode gains frames and a step is one frame. */
  fps?: number;
  /** Seconds per step without `fps` (default 1). */
  step?: number;
  /** Shows the loop toggle with this state; leave it out to hide the toggle. */
  loop?: boolean;
  /** Shows go-to-start and go-to-end (default true). */
  skip?: boolean;
  /** Shows the step buttons (default true). */
  steps?: boolean;
  size?: TransportSize;
  disabled?: boolean;
  labels?: Partial<TransportLabels>;
  onPlayingChange?: (playing: boolean) => void;
  /** A new position from the step and skip buttons. */
  onSeek?: (position: number) => void;
  onLoopChange?: (loop: boolean) => void;
}

export interface TransportHandle {
  el: HTMLDivElement;
  setPlaying(playing: boolean): void;
  setPosition(position: number): void;
  setDuration(duration: number): void;
  setLoop(loop: boolean): void;
  setDisabled(disabled: boolean): void;
}

export function transportClass(size: TransportSize = 'medium'): string {
  return cx('mh-transport', size !== 'medium' && `mh-transport--${size === 'small' ? 'sm' : 'lg'}`);
}

const SIZE_DOWN: Record<TransportSize, IconButtonSize> = { small: 'small', medium: 'medium', large: 'large' };
const SIZE_UP: Record<TransportSize, IconButtonSize> = { small: 'medium', medium: 'large', large: 'large' };

/** Classes of a plain transport button. */
export function transportButtonClass(size: TransportSize = 'medium'): string {
  return cx(iconButtonClass('default', SIZE_DOWN[size]), 'mh-transport__button');
}

/** Classes of the play / pause button: filled accent, one size up. */
export function transportPlayClass(size: TransportSize = 'medium'): string {
  return cx(iconButtonClass('accent', SIZE_UP[size], true), 'mh-transport__play');
}

/** The seconds one step moves. */
export function transportStep(options: Pick<TransportOptions, 'fps' | 'step'>): number {
  if (options.fps && options.fps > 0) return 1 / Math.round(options.fps);
  return options.step && options.step > 0 ? options.step : 1;
}

/** Position after a step, kept inside 0…duration (unbounded above without a duration), snapped to whole steps. */
export function transportStepPosition(position: number, direction: 1 | -1, step: number, duration?: number): number {
  const index = Math.round(position / step + 1e-9);
  const onGrid = Math.abs(index * step - position) < 1e-6;
  const next = onGrid ? (index + direction) * step : direction > 0 ? Math.ceil(position / step) * step : Math.floor(position / step) * step;
  return clamp(next, 0, duration && duration > 0 ? duration : Number.POSITIVE_INFINITY);
}

/**
 * `.mh-transport` (`--sm | --lg`): go to start, step back, play / pause (filled accent, its name switches between
 * Play and Pause), step forward, go to end, an optional loop toggle (`aria-pressed`) and the timecode
 * (`__time` with `__current` and `__duration`). Parts: `__button` (`__skip`, `__loop`), `__play`. Steps are one frame with `fps`.
 */
export function createTransport(options: TransportOptions): TransportHandle {
  const labels = { ...TRANSPORT_LABELS, ...options.labels };
  const size = options.size ?? 'medium';
  const step = transportStep(options);
  let playing = options.playing ?? false;
  let position = Math.max(0, options.position ?? 0);
  let duration = Math.max(0, options.duration ?? 0);
  let loop = options.loop ?? false;
  let disabled = options.disabled ?? false;

  const button = (label: string, icon: string, onClick: () => void, extra?: string): HTMLButtonElement =>
    h('button', { type: 'button', class: cx(transportButtonClass(size), extra), 'aria-label': label, title: label, onClick: () => onClick() }, createIcon(icon));
  const seek = (next: number): void => {
    position = next;
    render();
    options.onSeek?.(position);
  };
  const skip = options.skip !== false;
  const steps = options.steps !== false;
  const start = skip ? button(labels.start, mdiSkipPrevious, () => seek(0), 'mh-transport__skip') : null;
  const back = steps ? button(labels.stepBack, mdiStepBackward, () => seek(transportStepPosition(position, -1, step, duration))) : null;
  const play = h('button', { type: 'button', class: transportPlayClass(size) });
  play.addEventListener('click', () => {
    playing = !playing;
    render();
    options.onPlayingChange?.(playing);
  });
  const forward = steps ? button(labels.stepForward, mdiStepForward, () => seek(transportStepPosition(position, 1, step, duration))) : null;
  const end = skip ? button(labels.end, mdiSkipNext, () => seek(duration), 'mh-transport__skip') : null;
  const loopButton =
    options.loop === undefined
      ? null
      : button(
          labels.loop,
          mdiRepeat,
          () => {
            loop = !loop;
            render();
            options.onLoopChange?.(loop);
          },
          'mh-transport__loop',
        );
  const current = h('span', { class: 'mh-transport__current' });
  const total = h('span', { class: 'mh-transport__duration' });
  const sep = h('span', { class: 'mh-transport__sep', 'aria-hidden': 'true' }, '/');
  const time = h('span', { class: 'mh-transport__time' }, current, sep, total);
  const el = h('div', { class: transportClass(size), role: 'group', 'aria-label': options.label }, h('div', { class: 'mh-transport__buttons' }, start, back, play, forward, end, loopButton), time);

  const tc = (s: number): string => formatTimecode(s, { fps: options.fps, hours: duration >= 3600 });
  const render = (): void => {
    const label = playing ? labels.pause : labels.play;
    play.setAttribute('aria-label', label);
    play.title = label;
    play.replaceChildren(createIcon(playing ? mdiPause : mdiPlay));
    loopButton?.setAttribute('aria-pressed', String(loop));
    current.textContent = tc(position);
    current.setAttribute('aria-label', `${labels.position} ${tc(position)}`);
    total.textContent = duration > 0 ? tc(duration) : '';
    total.setAttribute('aria-label', `${labels.duration} ${tc(duration)}`);
    total.hidden = duration <= 0;
    sep.hidden = duration <= 0;
    // Buttons stay enabled at the ends (a no-op there) so focus never drops out of a button that was just used.
    for (const b of [start, back, play, forward, loopButton]) if (b) b.disabled = disabled;
    if (end) end.disabled = disabled || duration <= 0;
  };
  render();

  return {
    el,
    setPlaying(next) {
      playing = next;
      render();
    },
    setPosition(next) {
      position = Math.max(0, next);
      render();
    },
    setDuration(next) {
      duration = Math.max(0, next);
      render();
    },
    setLoop(next) {
      loop = next;
      render();
    },
    setDisabled(next) {
      disabled = next;
      render();
    },
  };
}
