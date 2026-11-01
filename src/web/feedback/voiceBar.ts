import { mdiCheck, mdiClose, mdiPhoneHangup } from '@mdi/js';
import { iconButtonClass } from '../actions/iconButton.ts';
import { append, cx, h, type Child } from '../dom.ts';
import { createIcon } from '../icons.ts';
import { createSpinner } from './spinner.ts';

/** `conversation`: talking with an assistant (animated mosaic, end button). `dictation`: speech to text (waveform, cancel, done). */
export type VoiceBarVariant = 'conversation' | 'dictation';

export type VoicePhase = 'listening' | 'transcribing' | 'thinking' | 'speaking' | 'idle';

/** Default status text per phase. */
export const VOICE_PHASE_LABELS: Readonly<Record<VoicePhase, string>> = {
  listening: 'Listening…',
  transcribing: 'Transcribing…',
  thinking: 'Thinking…',
  speaking: 'Speaking…',
  idle: 'Tap to talk',
};

/** How many recent levels the dictation waveform shows. */
export const VOICE_BAR_SAMPLES = 24;

export interface VoiceBarOptions {
  variant?: VoiceBarVariant;
  /** Default `listening`. */
  phase?: VoicePhase;
  /** Input level, 0–1: scales the mosaic while listening; each new level adds a bar to the dictation waveform. */
  level?: number;
  /** Status text; defaults to the phase's (`VOICE_PHASE_LABELS`). */
  label?: string;

  /** Conversation: before the mosaic, e.g. a "type instead" button. */
  leading?: Child | Child[];
  /** Conversation: pressing the mosaic (interrupt, listen again). Without it the mosaic is decorative. */
  onTap?: () => void;
  /** Conversation: the end button. */
  onEnd?: () => void;
  /** Default "End conversation". */
  endLabel?: string;

  /** Dictation: the done button shows a spinner and can't be pressed. */
  busy?: boolean;
  onCancel?: () => void;
  /** Default "Cancel". */
  cancelLabel?: string;
  onDone?: () => void;
  /** Default "Done". */
  doneLabel?: string;
}

export interface VoiceBarHandle {
  el: HTMLDivElement;
  setPhase(phase: VoicePhase): void;
  /** Sets the level; in dictation, also adds it to the waveform. */
  setLevel(level: number): void;
  /** `undefined` goes back to the phase's text. */
  setLabel(label: string | undefined): void;
  setBusy(busy: boolean): void;
}

export function voiceBarClass(variant: VoiceBarVariant = 'conversation', phase: VoicePhase = 'listening'): string {
  return cx('mh-voice-bar', `mh-voice-bar--${variant}`, `is-${phase}`);
}

/** A level clamped to 0–1 and rounded to two places, as written into the `--_level` / `--_v` style variables. */
export function voiceLevel(level: number | undefined): number {
  const v = Number.isFinite(level) ? Math.min(1, Math.max(0, level as number)) : 0;
  return Math.round(v * 100) / 100;
}

/** An empty waveform history. */
export const emptyVoiceLevels = (): number[] => new Array<number>(VOICE_BAR_SAMPLES).fill(0);

/** The waveform history with one more level at the end (the oldest drops off). */
export function pushVoiceLevel(levels: readonly number[], level: number | undefined): number[] {
  return [...levels, voiceLevel(level)].slice(-VOICE_BAR_SAMPLES);
}

/** `.mh-voice-bar`: shown in place of a composer during a voice conversation or dictation, the same height. */
export function createVoiceBar(options: VoiceBarOptions = {}): VoiceBarHandle {
  const variant = options.variant ?? 'conversation';
  let phase = options.phase ?? 'listening';
  let custom = options.label;
  const text = (): string => custom ?? VOICE_PHASE_LABELS[phase];

  const label = h('p', { class: 'mh-voice-bar__label', 'aria-live': 'polite' }, text());
  const el = h('div', { class: voiceBarClass(variant, phase) });
  const setLevelStyle = (target: HTMLElement, name: string, value: number): void => target.style.setProperty(name, String(value));

  let mosaic: HTMLElement | null = null;
  let bars: HTMLSpanElement[] = [];
  let levels = emptyVoiceLevels();
  let done: HTMLButtonElement | null = null;
  const drawWave = (): void => bars.forEach((bar, i) => setLevelStyle(bar, '--_v', levels[i]!));
  const doneLabel = options.doneLabel ?? 'Done';

  if (variant === 'conversation') {
    const tiles = [0, 1, 2, 3].map(() => h('span', { class: 'mh-voice-bar__tile' }));
    mosaic = options.onTap
      ? h('button', { type: 'button', class: 'mh-voice-bar__mosaic', 'aria-label': text() }, ...tiles)
      : h('span', { class: 'mh-voice-bar__mosaic', 'aria-hidden': 'true' }, ...tiles);
    if (options.onTap) mosaic.addEventListener('click', () => options.onTap!());
    setLevelStyle(mosaic, '--_level', voiceLevel(options.level));
    const endLabel = options.endLabel ?? 'End conversation';
    const end = h('button', { type: 'button', class: cx(iconButtonClass('danger'), 'mh-voice-bar__end'), 'aria-label': endLabel, title: endLabel }, createIcon(mdiPhoneHangup));
    if (options.onEnd) end.addEventListener('click', () => options.onEnd!());
    const leading = Array.isArray(options.leading) ? options.leading : [options.leading];
    if (leading.some((c) => c !== null && c !== undefined && c !== false)) {
      const slot = h('div', { class: 'mh-voice-bar__leading' });
      append(slot, ...leading);
      el.append(slot);
    }
    el.append(mosaic, label, end);
  } else {
    if (options.level !== undefined) levels = pushVoiceLevel(levels, options.level);
    bars = levels.map(() => h('span', { class: 'mh-voice-bar__bar' }));
    drawWave();
    const cancelLabel = options.cancelLabel ?? 'Cancel';
    const cancel = h('button', { type: 'button', class: cx(iconButtonClass(), 'mh-voice-bar__cancel'), 'aria-label': cancelLabel, title: cancelLabel }, createIcon(mdiClose));
    if (options.onCancel) cancel.addEventListener('click', () => options.onCancel!());
    done = h('button', { type: 'button', class: cx(iconButtonClass('accent', 'medium', true), 'mh-voice-bar__done'), 'aria-label': doneLabel, title: doneLabel });
    if (options.onDone) done.addEventListener('click', () => options.onDone!());
    el.append(cancel, h('div', { class: 'mh-voice-bar__wave', 'aria-hidden': 'true' }, ...bars), label, done);
  }

  const handle: VoiceBarHandle = {
    el,
    setPhase(next) {
      phase = next;
      el.className = voiceBarClass(variant, phase);
      handle.setLabel(custom);
    },
    setLevel(level) {
      if (mosaic) setLevelStyle(mosaic, '--_level', voiceLevel(level));
      if (bars.length) {
        levels = pushVoiceLevel(levels, level);
        drawWave();
      }
    },
    setLabel(value) {
      custom = value;
      label.textContent = text();
      if (mosaic?.tagName === 'BUTTON') mosaic.setAttribute('aria-label', text());
    },
    setBusy(busy) {
      if (!done) return;
      done.disabled = busy;
      if (busy) done.setAttribute('aria-busy', 'true');
      else done.removeAttribute('aria-busy');
      done.replaceChildren(busy ? createSpinner({ size: 'small', inherit: true, label: doneLabel }).el : createIcon(mdiCheck));
    },
  };
  handle.setBusy(options.busy ?? false);
  return handle;
}
