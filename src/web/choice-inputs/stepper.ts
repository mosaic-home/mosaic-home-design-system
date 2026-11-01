import { mdiMinus, mdiPlus } from '@mdi/js';
import { cx, h } from '../dom.ts';
import { createIcon } from '../icons.ts';

export interface StepperOptions {
  /** Accessible name of the value (the spinbutton). */
  label: string;
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  /** Formats the shown and spoken value (e.g. `v => v + ' people'`). */
  format?: (value: number) => string;
  size?: 'small' | 'medium';
  disabled?: boolean;
  decreaseLabel?: string;
  increaseLabel?: string;
  onChange?: (value: number) => void;
}

export interface StepperHandle {
  el: HTMLDivElement;
  /** The focusable value (`role="spinbutton"`). */
  spinbutton: HTMLSpanElement;
  getValue(): number;
  setValue(value: number): void;
  setDisabled(disabled: boolean): void;
}

/** CSS classes for a stepper root. */
export function stepperClass(size: 'small' | 'medium' = 'medium'): string {
  return cx('mh-stepper', size === 'small' && 'mh-stepper--sm');
}

/** Clamps and snaps a stepper value. */
export function clampStep(value: number, min = -Infinity, max = Infinity, step = 1): number {
  const snapped = Number.isFinite(min) ? min + Math.round((value - min) / step) * step : Math.round(value / step) * step;
  return Math.min(max, Math.max(min, Number(snapped.toFixed(10))));
}

/** The next value for a key on a stepper, or `null` when the key does nothing. */
export function stepperKey(key: string, value: number, min: number, max: number, step: number): number | null {
  switch (key) {
    case 'ArrowUp':
    case 'ArrowRight':
      return clampStep(value + step, min, max, step);
    case 'ArrowDown':
    case 'ArrowLeft':
      return clampStep(value - step, min, max, step);
    case 'PageUp':
      return clampStep(value + step * 10, min, max, step);
    case 'PageDown':
      return clampStep(value - step * 10, min, max, step);
    case 'Home':
      return Number.isFinite(min) ? min : null;
    case 'End':
      return Number.isFinite(max) ? max : null;
    default:
      return null;
  }
}

/**
 * `.mh-stepper`: − value + for small counts. The value is a focusable `role="spinbutton"` (arrow keys, Page
 * Up/Down, Home/End); the buttons are for pointer and touch and stay out of the Tab order, as in the ARIA
 * spinbutton pattern. A button disables at its limit.
 */
export function createStepper(options: StepperOptions): StepperHandle {
  const min = options.min ?? 0;
  const max = options.max ?? Infinity;
  const step = options.step ?? 1;
  let value = clampStep(options.value ?? min, min, max, step);
  let disabled = options.disabled ?? false;

  const dec = h('button', { type: 'button', class: 'mh-stepper__button', tabindex: '-1', 'aria-label': options.decreaseLabel ?? 'Decrease' }, createIcon(mdiMinus));
  const inc = h('button', { type: 'button', class: 'mh-stepper__button', tabindex: '-1', 'aria-label': options.increaseLabel ?? 'Increase' }, createIcon(mdiPlus));
  const spinbutton = h('span', { class: 'mh-stepper__value', role: 'spinbutton', tabindex: '0', 'aria-label': options.label });
  if (Number.isFinite(min)) spinbutton.setAttribute('aria-valuemin', String(min));
  if (Number.isFinite(max)) spinbutton.setAttribute('aria-valuemax', String(max));
  const el = h('div', { class: stepperClass(options.size) }, dec, spinbutton, inc);

  const sync = (): void => {
    const text = options.format ? options.format(value) : String(value);
    spinbutton.textContent = text;
    spinbutton.setAttribute('aria-valuenow', String(value));
    if (options.format) spinbutton.setAttribute('aria-valuetext', text);
    dec.disabled = disabled || value <= min;
    inc.disabled = disabled || value >= max;
    spinbutton.tabIndex = disabled ? -1 : 0;
    if (disabled) spinbutton.setAttribute('aria-disabled', 'true');
    else spinbutton.removeAttribute('aria-disabled');
  };
  const set = (next: number): void => {
    if (next === value) return;
    value = next;
    sync();
    options.onChange?.(value);
  };
  dec.addEventListener('click', () => set(clampStep(value - step, min, max, step)));
  inc.addEventListener('click', () => set(clampStep(value + step, min, max, step)));
  spinbutton.addEventListener('keydown', (event) => {
    if (disabled) return;
    const next = stepperKey(event.key, value, min, max, step);
    if (next === null) return;
    event.preventDefault();
    set(next);
  });
  sync();

  return {
    el,
    spinbutton,
    getValue: () => value,
    setValue(next) {
      value = clampStep(next, min, max, step);
      sync();
    },
    setDisabled(next) {
      disabled = next;
      sync();
    },
  };
}
