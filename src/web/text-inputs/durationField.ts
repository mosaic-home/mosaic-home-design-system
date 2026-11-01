import { mdiTimerOutline } from '@mdi/js';
import { cx, h } from '../dom.ts';
import { createIcon } from '../icons.ts';
import { createField, type FieldHandle } from './field.ts';
import { focusOnBoxClick, inputAdornment, inputClass, type InputSize } from './textField.ts';

/** A unit a bare number is read in. */
export type DurationUnit = 'd' | 'h' | 'm' | 's';

const UNIT_SECONDS: Record<DurationUnit, number> = { d: 86400, h: 3600, m: 60, s: 1 };
const ORDER: readonly DurationUnit[] = ['d', 'h', 'm', 's'];
const UNIT_WORDS: Record<string, DurationUnit> = {
  d: 'd',
  day: 'd',
  days: 'd',
  h: 'h',
  hr: 'h',
  hrs: 'h',
  hour: 'h',
  hours: 'h',
  m: 'm',
  min: 'm',
  mins: 'm',
  minute: 'm',
  minutes: 'm',
  s: 's',
  sec: 's',
  secs: 's',
  second: 's',
  seconds: 's',
};
const LONG: Record<DurationUnit, [string, string]> = { d: ['day', 'days'], h: ['hour', 'hours'], m: ['minute', 'minutes'], s: ['second', 'seconds'] };

/**
 * Reads a typed duration as whole seconds, or `null` when it doesn't read. Accepts units in short or long form
 * (`1h 30m`, `1 hour 30 minutes`, `2d4h`, `1.5h`, `1,5 h`, `90 sec`), clock form (`1:30` is 1 h 30 min, `0:45:10`),
 * and `and` or commas between parts. A bare number is in `defaultUnit` (minutes unless set); a bare number after a
 * unit is in the next smaller one (`1h 30` is 1 h 30 min). Each unit may appear once, largest first.
 */
export function parseDuration(text: string, defaultUnit: DurationUnit = 'm'): number | null {
  const t = text.trim().toLowerCase();
  if (t === '') return null;
  const clock = /^(\d+):([0-5]?\d)(?::([0-5]?\d))?$/.exec(t);
  if (clock) return Number(clock[1]) * 3600 + Number(clock[2]) * 60 + Number(clock[3] ?? 0);

  const s = t.replace(/\band\b/g, ' ').replace(/,(?=\s|$)/g, ' ');
  const part = /^\s*(\d+(?:[.,]\d+)?|[.,]\d+)\s*([a-z]*)\s*/;
  let rest = s;
  let total = 0;
  let last = -1;
  while (rest.trim() !== '') {
    const m = part.exec(rest);
    if (!m) return null;
    rest = rest.slice(m[0].length);
    const amount = Number(m[1]!.replace(',', '.'));
    let unit: DurationUnit | undefined;
    if (m[2]) unit = UNIT_WORDS[m[2]];
    else unit = last === -1 ? defaultUnit : ORDER[last + 1];
    if (!unit) return null;
    const at = ORDER.indexOf(unit);
    if (at <= last) return null;
    last = at;
    total += amount * UNIT_SECONDS[unit];
  }
  return Math.round(total);
}

/** The parts of a duration, largest first, without the zero ones. */
function durationParts(seconds: number): [number, DurationUnit][] {
  let left = Math.max(0, Math.round(seconds));
  const out: [number, DurationUnit][] = [];
  for (const unit of ORDER) {
    const n = Math.floor(left / UNIT_SECONDS[unit]);
    left -= n * UNIT_SECONDS[unit];
    if (n > 0) out.push([n, unit]);
  }
  return out;
}

/** A duration as text: `short` is `1h 30m` (also what the field reads back), `long` is `1 hour 30 minutes`. */
export function formatDuration(seconds: number, style: 'short' | 'long' = 'short'): string {
  const parts = durationParts(seconds);
  if (parts.length === 0) return style === 'short' ? '0m' : '0 minutes';
  return parts.map(([n, u]) => (style === 'short' ? `${n}${u}` : `${n} ${LONG[u][n === 1 ? 0 : 1]}`)).join(' ');
}

/** Why a duration is not accepted, or `undefined` when it is. */
export function durationError(seconds: number | null, text: string, limits: { min?: number; max?: number; required?: boolean }, messages: DurationMessages = DURATION_TEXT): string | undefined {
  if (text.trim() === '') return limits.required ? messages.required : undefined;
  if (seconds === null) return messages.invalid;
  if (limits.min !== undefined && seconds < limits.min) return `${messages.min} ${formatDuration(limits.min, 'long')}.`;
  if (limits.max !== undefined && seconds > limits.max) return `${messages.max} ${formatDuration(limits.max, 'long')}.`;
  return undefined;
}

export interface DurationMessages {
  invalid: string;
  required: string;
  /** Followed by the limit ("At least 5 minutes."). */
  min: string;
  max: string;
}

/** The default texts of a duration field. */
export const DURATION_TEXT: DurationMessages & { placeholder: string; presets: string } = {
  invalid: 'Enter a duration like 1h 30m.',
  required: 'Enter a duration.',
  min: 'At least',
  max: 'At most',
  placeholder: 'e.g. 1h 30m',
  presets: 'Quick picks',
};

/** The preview shown at the end of the box while typing: how the text reads, unless it already reads that way. */
export function durationPreview(text: string, defaultUnit: DurationUnit = 'm'): string {
  const seconds = parseDuration(text, defaultUnit);
  if (seconds === null || text.trim() === formatDuration(seconds)) return '';
  return formatDuration(seconds, 'long');
}

export interface DurationFieldOptions {
  /** Visible label. Without one, pass `ariaLabel`. */
  label?: string;
  ariaLabel?: string;
  /** Seconds; `null` for empty. */
  value?: number | null;
  placeholder?: string;
  /** The unit of a bare number (default minutes). */
  defaultUnit?: DurationUnit;
  /** Shortest and longest accepted, in seconds. */
  min?: number;
  max?: number;
  /** Durations offered as buttons under the field (seconds), e.g. timer lengths. */
  presets?: readonly number[];
  presetsLabel?: string;
  /** A leading icon; default a timer, `false` for none. */
  icon?: string | false;
  name?: string;
  helper?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  size?: InputSize;
  labelStyle?: 'label' | 'eyebrow';
  messages?: Partial<DurationMessages>;
  /** Called with the seconds once the text is committed (Enter, leaving the field, or a preset), `null` when emptied. */
  onChange?: (seconds: number | null) => void;
}

export interface DurationFieldHandle {
  el: HTMLElement;
  input: HTMLInputElement;
  field: FieldHandle | null;
  getValue(): number | null;
  setValue(seconds: number | null): void;
  setError(text: string | undefined): void;
  setDisabled(disabled: boolean): void;
}

/** CSS classes for the duration box. */
export function durationFieldClass(size: InputSize = 'medium', disabled = false): string {
  return inputClass(size, cx('mh-duration__box', disabled && 'is-disabled'));
}

/** The timer icon a duration field leads with. */
export const DURATION_ICON = mdiTimerOutline;

/**
 * `.mh-duration`: free-text duration entry inside a `.mh-field`. The box shows how the text reads as you type
 * (`__preview`); on Enter or leaving the field the text is read (see `parseDuration`), checked against `min` and
 * `max` and rewritten in short form (`1h 30m`), or the field shows why it can't be. Optional `__presets` buttons
 * under the box set common lengths in one press (`aria-pressed` on the current one).
 */
export function createDurationField(options: DurationFieldOptions): DurationFieldHandle {
  const unit = options.defaultUnit ?? 'm';
  const messages = { ...DURATION_TEXT, ...options.messages };
  let value: number | null = options.value ?? null;
  let ownError: string | undefined;
  let disabled = false;

  const input = h('input', {
    class: 'mh-input__control',
    type: 'text',
    name: options.name,
    placeholder: options.placeholder ?? DURATION_TEXT.placeholder,
    autocomplete: 'off',
    spellcheck: 'false',
    autocapitalize: 'off',
    enterkeyhint: 'done',
    'aria-label': options.label ? undefined : options.ariaLabel,
  });
  input.value = value === null ? '' : formatDuration(value);
  const preview = h('span', { class: 'mh-input__adornment mh-input__adornment--end mh-duration__preview', 'aria-hidden': 'true' });
  const icon = options.icon === false ? null : inputAdornment(createIcon(options.icon ?? DURATION_ICON));
  const box = h('div', { class: durationFieldClass(options.size) }, icon, input, preview);
  focusOnBoxClick(box, input);

  const presetButtons = (options.presets ?? []).map((seconds) => {
    const b = h('button', { type: 'button', class: 'mh-duration__preset', 'aria-pressed': 'false', title: formatDuration(seconds, 'long') }, formatDuration(seconds));
    b.addEventListener('click', () => {
      input.value = formatDuration(seconds);
      commit();
    });
    return { seconds, b };
  });
  const presets = presetButtons.length ? h('div', { class: 'mh-duration__presets', role: 'group', 'aria-label': options.presetsLabel ?? DURATION_TEXT.presets }, ...presetButtons.map((p) => p.b)) : null;
  const root = h('div', { class: 'mh-duration' }, box, presets);

  const field = options.label ? createField({ label: options.label, control: root, target: input, helper: options.helper, error: options.error, required: options.required, labelStyle: options.labelStyle }) : null;

  const sync = (): void => {
    preview.textContent = durationPreview(input.value, unit);
    for (const p of presetButtons) {
      p.b.setAttribute('aria-pressed', String(p.seconds === value));
      p.b.disabled = disabled;
    }
    field?.setError(ownError ?? options.error);
  };
  function commit(): void {
    const seconds = parseDuration(input.value, unit);
    ownError = durationError(seconds, input.value, options, messages);
    if (!ownError) {
      const next = input.value.trim() === '' ? null : seconds;
      if (next !== null) input.value = formatDuration(next);
      if (next !== value) {
        value = next;
        options.onChange?.(value);
      }
    }
    sync();
  }
  input.addEventListener('input', () => {
    preview.textContent = durationPreview(input.value, unit);
  });
  input.addEventListener('change', commit);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.isComposing) commit();
  });

  const handle: DurationFieldHandle = {
    el: field?.el ?? root,
    input,
    field,
    getValue: () => value,
    setValue(seconds) {
      value = seconds;
      ownError = undefined;
      input.value = seconds === null ? '' : formatDuration(seconds);
      sync();
    },
    setError(text) {
      ownError = text;
      sync();
    },
    setDisabled(next) {
      disabled = next;
      input.disabled = next;
      box.classList.toggle('is-disabled', next);
      field?.setDisabled(next);
      sync();
    },
  };
  sync();
  if (options.disabled) handle.setDisabled(true);
  return handle;
}
