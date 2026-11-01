import { mdiDragHorizontalVariant, mdiMinus, mdiPlus } from '@mdi/js';
import { clampStep } from '../choice-inputs/stepper.ts';
import { cx, h } from '../dom.ts';
import { createIcon } from '../icons.ts';
import { createField, type FieldHandle } from './field.ts';
import { holdToRepeat } from './listbox.ts';
import { focusOnBoxClick, inputAdornment, inputClass, type InputSize } from './textField.ts';

export interface NumberInputOptions {
  /** Visible label. Without one, pass `ariaLabel`; the input then renders the box alone. */
  label?: string;
  ariaLabel?: string;
  value?: number;
  min?: number;
  max?: number;
  /** Step of the buttons, the arrow keys and scrubbing (default 1). Typed values snap to it. */
  step?: number;
  /** Step of Page Up / Page Down and of Shift while scrubbing (default ten steps). */
  largeStep?: number;
  /** Decimal places shown; default: those of `step`. */
  precision?: number;
  /** The unit after the value ("°C", "%", "min"). */
  unit?: string;
  /** Text before the value, e.g. a currency sign. */
  prefix?: string;
  /** The spoken value; default the value and unit ("21.5 °C"). */
  valueText?: (value: number) => string;
  /** Dragging the unit (or a grip when there is no unit) sideways changes the value (default true). */
  scrub?: boolean;
  /** Pixels of drag per step (default 8). */
  scrubDistance?: number;
  name?: string;
  helper?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  size?: InputSize;
  labelStyle?: 'label' | 'eyebrow';
  decreaseLabel?: string;
  increaseLabel?: string;
  /** Called with each new value: a step, a scrub, or typed text once it is committed (Enter or leaving the field). */
  onChange?: (value: number) => void;
}

export interface NumberInputHandle {
  /** The field (or the bare box without a label). */
  el: HTMLElement;
  /** The text input (`role="spinbutton"`). */
  input: HTMLInputElement;
  field: FieldHandle | null;
  getValue(): number;
  setValue(value: number): void;
  setError(text: string | undefined): void;
  setHelper(text: string | undefined): void;
  setDisabled(disabled: boolean): void;
}

/** The limits and steps of a number input, with defaults filled in. */
export interface NumberInputRange {
  min: number;
  max: number;
  step: number;
  largeStep: number;
  precision: number;
}

/** Decimal places of a step (`0.25` → 2). */
export function stepPrecision(step: number): number {
  const text = String(step);
  const exp = /e-(\d+)$/.exec(text);
  if (exp) return Number(exp[1]);
  const dot = text.indexOf('.');
  return dot === -1 ? 0 : text.length - dot - 1;
}

export function numberInputRange(options: Pick<NumberInputOptions, 'min' | 'max' | 'step' | 'largeStep' | 'precision'>): NumberInputRange {
  const step = options.step && options.step > 0 ? options.step : 1;
  return {
    min: options.min ?? -Infinity,
    max: options.max ?? Infinity,
    step,
    largeStep: options.largeStep ?? step * 10,
    precision: options.precision ?? stepPrecision(step),
  };
}

/** Reads typed text as a number: accepts a decimal comma, a leading `+`, the minus sign `−` and spaces. */
export function parseNumber(text: string): number | null {
  const t = text.replace(/\s/g, '').replace('−', '-').replace(',', '.');
  if (t === '' || !/^[+-]?(\d+\.?\d*|\.\d+)$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/** Clamps a value to the range and snaps it to the step. */
export function clampNumber(value: number, range: NumberInputRange): number {
  return clampStep(value, range.min, range.max, range.step);
}

/** The text a number input shows for a value. */
export function formatNumber(value: number, precision: number): string {
  return value.toFixed(precision).replace('-', '−').replace(/^−(0\.?0*)$/, '$1');
}

/** The spoken value: the formatter's, else the value and unit. */
export function numberInputValueText(value: number, range: NumberInputRange, unit?: string, valueText?: (value: number) => string): string | undefined {
  if (valueText) return valueText(value);
  return unit ? `${formatNumber(value, range.precision)} ${unit}` : undefined;
}

/** The on-screen keyboard that fits: numbers only, with a decimal point, or the full keyboard for negatives. */
export function numberInputMode(range: NumberInputRange): 'numeric' | 'decimal' | 'text' {
  if (range.min < 0) return 'text';
  return range.precision > 0 ? 'decimal' : 'numeric';
}

/** The new value for a key on the input, or `null` when the key isn't a step. */
export function numberInputKey(key: string, value: number, range: NumberInputRange): number | null {
  switch (key) {
    case 'ArrowUp':
      return clampNumber(value + range.step, range);
    case 'ArrowDown':
      return clampNumber(value - range.step, range);
    case 'PageUp':
      return clampNumber(value + range.largeStep, range);
    case 'PageDown':
      return clampNumber(value - range.largeStep, range);
    default:
      return null;
  }
}

/** CSS classes for the number input box. */
export function numberInputClass(size: InputSize = 'medium', disabled = false): string {
  return inputClass(size, cx('mh-number-input', disabled && 'is-disabled'));
}

/** The default accessible names of the buttons. */
export const NUMBER_INPUT_LABELS = { decrease: 'Decrease', increase: 'Increase', scrub: 'Drag sideways to change' } as const;

/** The grip icon shown as the scrub handle when there is no unit. */
export const SCRUB_ICON = mdiDragHorizontalVariant;

/**
 * Lets a pointer drag sideways on `handle` to step a value: one step per `distance` pixels, large steps with
 * Shift. The handle takes `.is-scrubbing` while dragged. Returns a function that removes the listeners.
 */
export function attachScrub(handle: HTMLElement, options: { distance: number; onStep: (steps: number, large: boolean) => void; enabled?: () => boolean }): () => void {
  let lastX = 0;
  let carried = 0;
  let pointer: number | null = null;
  const down = (event: PointerEvent): void => {
    if (event.button !== 0 || options.enabled?.() === false) return;
    event.preventDefault();
    pointer = event.pointerId;
    lastX = event.clientX;
    carried = 0;
    handle.setPointerCapture?.(event.pointerId);
    handle.classList.add('is-scrubbing');
  };
  const move = (event: PointerEvent): void => {
    if (pointer !== event.pointerId) return;
    carried += event.clientX - lastX;
    lastX = event.clientX;
    const steps = Math.trunc(carried / options.distance);
    if (steps !== 0) {
      carried -= steps * options.distance;
      options.onStep(steps, event.shiftKey);
    }
  };
  const up = (event: PointerEvent): void => {
    if (pointer !== event.pointerId) return;
    pointer = null;
    handle.releasePointerCapture?.(event.pointerId);
    handle.classList.remove('is-scrubbing');
  };
  handle.addEventListener('pointerdown', down);
  handle.addEventListener('pointermove', move);
  handle.addEventListener('pointerup', up);
  handle.addEventListener('pointercancel', up);
  return () => {
    handle.removeEventListener('pointerdown', down);
    handle.removeEventListener('pointermove', move);
    handle.removeEventListener('pointerup', up);
    handle.removeEventListener('pointercancel', up);
  };
}

/**
 * `.mh-input.mh-number-input`: a value with − and + buttons either side, an optional prefix and unit, inside a
 * `.mh-field`. The value is a text input with `role="spinbutton"` (arrow keys step, Page Up/Down take large
 * steps, typed text is committed on Enter or blur and Escape reverts it); the buttons repeat while held and stay
 * out of the Tab order, as in the ARIA spinbutton pattern. Dragging the unit sideways scrubs the value.
 */
export function createNumberInput(options: NumberInputOptions): NumberInputHandle {
  const range = numberInputRange(options);
  const scrub = options.scrub ?? true;
  let value = clampNumber(options.value ?? (Number.isFinite(range.min) ? Math.max(range.min, 0) : 0), range);
  let disabled = false;

  const input = h('input', {
    class: 'mh-input__control mh-number-input__control',
    type: 'text',
    role: 'spinbutton',
    name: options.name,
    inputmode: numberInputMode(range),
    autocomplete: 'off',
    spellcheck: 'false',
    'aria-valuemin': Number.isFinite(range.min) ? range.min : undefined,
    'aria-valuemax': Number.isFinite(range.max) ? range.max : undefined,
    'aria-label': options.label ? undefined : options.ariaLabel,
  });
  const decLabel = options.decreaseLabel ?? NUMBER_INPUT_LABELS.decrease;
  const incLabel = options.increaseLabel ?? NUMBER_INPUT_LABELS.increase;
  const dec = h('button', { type: 'button', class: 'mh-number-input__step', tabindex: '-1', 'aria-label': decLabel, title: decLabel }, createIcon(mdiMinus));
  const inc = h('button', { type: 'button', class: 'mh-number-input__step', tabindex: '-1', 'aria-label': incLabel, title: incLabel }, createIcon(mdiPlus));
  const unit =
    options.unit || scrub
      ? h(
          'span',
          { class: cx('mh-input__adornment', 'mh-input__adornment--end', 'mh-number-input__unit', scrub && 'mh-number-input__scrub'), 'aria-hidden': 'true', title: scrub ? NUMBER_INPUT_LABELS.scrub : undefined },
          options.unit ? options.unit : createIcon(SCRUB_ICON),
        )
      : null;
  const box = h('div', { class: numberInputClass(options.size) }, dec, options.prefix ? inputAdornment(options.prefix) : null, input, unit, inc);
  focusOnBoxClick(box, input);

  const sync = (): void => {
    input.value = formatNumber(value, range.precision);
    input.setAttribute('aria-valuenow', String(value));
    const text = numberInputValueText(value, range, options.unit, options.valueText);
    if (text) input.setAttribute('aria-valuetext', text);
    else input.removeAttribute('aria-valuetext');
    dec.disabled = disabled || value <= range.min;
    inc.disabled = disabled || value >= range.max;
  };
  const set = (next: number): void => {
    const clamped = clampNumber(next, range);
    if (clamped === value) return sync();
    value = clamped;
    sync();
    options.onChange?.(value);
  };
  /** The typed value if it reads as a number, else the last committed one. */
  const current = (): number => parseNumber(input.value) ?? value;
  const commit = (): void => {
    const typed = parseNumber(input.value);
    set(typed ?? value);
  };

  holdToRepeat(dec, () => set(current() - range.step));
  holdToRepeat(inc, () => set(current() + range.step));
  if (scrub && unit) attachScrub(unit, { distance: options.scrubDistance ?? 8, enabled: () => !disabled, onStep: (steps, large) => set(current() + steps * (large ? range.largeStep : range.step)) });
  input.addEventListener('change', commit);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') return commit();
    if (event.key === 'Escape') {
      if (input.value !== formatNumber(value, range.precision)) {
        event.preventDefault();
        event.stopPropagation();
        sync();
      }
      return;
    }
    const next = numberInputKey(event.key, current(), range);
    if (next === null) return;
    event.preventDefault();
    set(next);
  });

  const field = options.label
    ? createField({ label: options.label, control: box, target: input, helper: options.helper, error: options.error, required: options.required, labelStyle: options.labelStyle })
    : null;

  const handle: NumberInputHandle = {
    el: field?.el ?? box,
    input,
    field,
    getValue: () => value,
    setValue(next) {
      value = clampNumber(next, range);
      sync();
    },
    setError: (text) => field?.setError(text),
    setHelper: (text) => field?.setHelper(text),
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
