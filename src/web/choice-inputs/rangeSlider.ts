import { cx, h, uid } from '../dom.ts';
import { sliderPosition, type SliderMark } from './slider.ts';

export type RangeValue = readonly [number, number];

/** The spoken names of the two thumbs, for translation. */
export interface RangeSliderLabels {
  low: string;
  high: string;
}

export const RANGE_SLIDER_LABELS: RangeSliderLabels = { low: 'Minimum', high: 'Maximum' };

export interface RangeSliderOptions {
  /** Visible label. Without one, pass `ariaLabel`. */
  label?: string;
  ariaLabel?: string;
  min?: number;
  max?: number;
  step?: number;
  /** `[low, high]`. Default the whole range. */
  value?: RangeValue;
  /** The smallest distance kept between the thumbs. Default 0. */
  minGap?: number;
  /** Shows "low – high" beside the label. */
  showValue?: boolean;
  /** Formats the shown values and each thumb's spoken `aria-valuetext`. */
  format?: (value: number) => string;
  marks?: readonly SliderMark[];
  /** Form names of the two inputs. */
  names?: readonly [string, string];
  labels?: Partial<RangeSliderLabels>;
  disabled?: boolean;
  /** While dragging. */
  onInput?: (value: [number, number], event: Event) => void;
  /** When a thumb is let go or moved by key. */
  onChange?: (value: [number, number], event: Event) => void;
}

export interface RangeSliderHandle {
  el: HTMLDivElement;
  inputs: [HTMLInputElement, HTMLInputElement];
  getValue(): [number, number];
  setValue(value: RangeValue): void;
  setDisabled(disabled: boolean): void;
}

const decimalsOf = (n: number): number => {
  const text = String(n);
  const dot = text.indexOf('.');
  return dot < 0 ? 0 : text.length - dot - 1;
};

/** Rounds `value` to the step grid that starts at `min`, within `min` and `max`. */
export function snapToStep(value: number, min: number, max: number, step: number): number {
  const snapped = step > 0 ? min + Math.round((value - min) / step) * step : value;
  return Number(Math.min(max, Math.max(min, snapped)).toFixed(Math.max(decimalsOf(step), decimalsOf(min))));
}

/**
 * Keeps a range in order and inside the limits. `moved` says which end the user moved: that end gives way to the
 * gap, the other stays put.
 */
export function clampRange(value: RangeValue, min: number, max: number, minGap = 0, moved: 'low' | 'high' = 'high'): [number, number] {
  const gap = Math.max(0, Math.min(minGap, max - min));
  let [lo, hi] = value;
  lo = Math.min(max, Math.max(min, lo));
  hi = Math.min(max, Math.max(min, hi));
  if (moved === 'low') {
    hi = Math.max(hi, min + gap);
    lo = Math.min(lo, hi - gap);
  } else {
    lo = Math.min(lo, max - gap);
    hi = Math.max(hi, lo + gap);
  }
  return [lo, hi];
}

/** Which thumb a press at `value` should move: the nearer one; between equal thumbs, the one that can move that way. */
export function nearestThumb(value: number, range: RangeValue): 'low' | 'high' {
  const [lo, hi] = range;
  if (lo === hi) return value < lo ? 'low' : 'high';
  return Math.abs(value - lo) <= Math.abs(value - hi) ? 'low' : 'high';
}

/** The value text of a range, "low – high". */
export function rangeText(value: RangeValue, format?: (value: number) => string): string {
  const f = format ?? String;
  return `${f(value[0])} – ${f(value[1])}`;
}

/** CSS classes for a range slider root; `lowOnTop` lifts the low thumb when both sit at the top end. */
export function rangeSliderClass(lowOnTop = false, disabled = false): string {
  return cx('mh-range-slider', lowOnTop && 'is-low-on-top', disabled && 'is-disabled');
}

/** The value under a pointer at `clientX` on a range slider's `__control`, or null when it has no width. */
export function rangeValueAt(clientX: number, control: HTMLElement, min: number, max: number, step: number): number | null {
  const r = control.getBoundingClientRect();
  if (r.width <= 0) return null;
  const rtl = getComputedStyle(control).direction === 'rtl';
  const at = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
  return snapToStep(min + (rtl ? 1 - at : at) * (max - min), min, max, step);
}

/** True when the thumbs overlap near the top end, so the low thumb must be the one on top to be dragged down. */
export function rangeLowOnTop(value: RangeValue, min: number, max: number): boolean {
  return value[0] >= value[1] && value[0] > min + (max - min) / 2;
}

/**
 * `.mh-range-slider`: two thumbs choosing a range (a comfort band, a time window, a price filter). Each thumb is a
 * native `<input type="range">` laid over one shared track, so arrow keys, Page Up/Down, Home/End and screen readers
 * work per thumb; the thumbs never cross (`minGap` keeps them apart). Pressing the track moves the nearer thumb and
 * drags it. The fill is drawn from `--_lo` and `--_hi`.
 */
export function createRangeSlider(options: RangeSliderOptions): RangeSliderHandle {
  const min = options.min ?? 0;
  const max = options.max ?? 100;
  const step = options.step ?? 1;
  const gap = options.minGap ?? 0;
  const labels = { ...RANGE_SLIDER_LABELS, ...options.labels };
  const labelId = uid('mh-range-label');
  const make = (which: 'low' | 'high', index: 0 | 1): HTMLInputElement =>
    h('input', {
      type: 'range',
      class: `mh-range-slider__input mh-range-slider__input--${which}`,
      name: options.names?.[index],
      min,
      max,
      step,
      'aria-label': labels[which],
    });
  const low = make('low', 0);
  const high = make('high', 1);
  const fill = h('div', { class: 'mh-range-slider__fill' });
  const control = h('div', { class: 'mh-range-slider__control' }, h('div', { class: 'mh-range-slider__track' }, fill), low, high);
  const output = options.showValue ? h('output', { class: 'mh-range-slider__value', 'aria-hidden': 'true' }) : null;
  const head = options.label || output ? h('div', { class: 'mh-range-slider__head' }, options.label ? h('span', { class: 'mh-range-slider__label', id: labelId }, options.label) : null, output) : null;
  const marks = options.marks?.length
    ? h(
        'div',
        { class: 'mh-range-slider__marks', 'aria-hidden': 'true' },
        ...options.marks.map((m) => {
          const mark = h('span', { class: 'mh-range-slider__mark' }, m.label ?? '');
          mark.style.setProperty('--_at', String(sliderPosition(m.value, min, max)));
          return mark;
        }),
      )
    : null;
  const el = h('div', { class: rangeSliderClass(), role: 'group', 'aria-labelledby': options.label ? labelId : undefined, 'aria-label': options.label ? undefined : options.ariaLabel }, head, control, marks);

  let value = clampRange(options.value ?? [min, max], min, max, gap);
  const sync = (): void => {
    low.value = String(value[0]);
    high.value = String(value[1]);
    el.style.setProperty('--_lo', String(sliderPosition(value[0], min, max)));
    el.style.setProperty('--_hi', String(sliderPosition(value[1], min, max)));
    el.className = rangeSliderClass(rangeLowOnTop(value, min, max), low.disabled);
    if (options.format) {
      low.setAttribute('aria-valuetext', options.format(value[0]));
      high.setAttribute('aria-valuetext', options.format(value[1]));
    }
    if (output) output.textContent = rangeText(value, options.format);
  };
  const set = (next: RangeValue, moved: 'low' | 'high'): boolean => {
    const clamped = clampRange(next, min, max, gap, moved);
    const changed = clamped[0] !== value[0] || clamped[1] !== value[1];
    value = clamped;
    sync();
    return changed;
  };
  sync();

  const onThumbInput = (which: 'low' | 'high') => (event: Event) => {
    const n = Number((which === 'low' ? low : high).value);
    set(which === 'low' ? [n, value[1]] : [value[0], n], which);
    options.onInput?.([...value], event);
  };
  low.addEventListener('input', onThumbInput('low'));
  high.addEventListener('input', onThumbInput('high'));
  const onCommit = (event: Event): void => options.onChange?.([...value], event);
  low.addEventListener('change', onCommit);
  high.addEventListener('change', onCommit);

  // The inputs only take pointer events on their thumbs, so a press on the bare track lands here.
  let dragging: 'low' | 'high' | null = null;
  const valueAt = (clientX: number): number | null => rangeValueAt(clientX, control, min, max, step);
  const moveTo = (which: 'low' | 'high', clientX: number, event: Event): void => {
    const n = valueAt(clientX);
    if (n === null) return;
    if (set(which === 'low' ? [n, value[1]] : [value[0], n], which)) options.onInput?.([...value], event);
  };
  control.addEventListener('pointerdown', (event) => {
    if (low.disabled || event.button !== 0 || event.target === low || event.target === high) return;
    const n = valueAt(event.clientX);
    if (n === null) return;
    event.preventDefault();
    dragging = nearestThumb(n, value);
    (dragging === 'low' ? low : high).focus();
    control.setPointerCapture?.(event.pointerId);
    moveTo(dragging, event.clientX, event);
  });
  control.addEventListener('pointermove', (event) => {
    if (dragging) moveTo(dragging, event.clientX, event);
  });
  const endDrag = (event: Event): void => {
    if (!dragging) return;
    dragging = null;
    options.onChange?.([...value], event);
  };
  control.addEventListener('pointerup', endDrag);
  control.addEventListener('pointercancel', endDrag);

  const setDisabled = (disabled: boolean): void => {
    low.disabled = disabled;
    high.disabled = disabled;
    sync();
  };
  if (options.disabled) setDisabled(true);

  return {
    el,
    inputs: [low, high],
    getValue: () => [...value],
    setValue(next) {
      value = clampRange(next, min, max, gap);
      sync();
    },
    setDisabled,
  };
}
