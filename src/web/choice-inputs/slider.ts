import { h, uid } from '../dom.ts';

export interface SliderMark {
  value: number;
  label?: string;
}

export interface SliderOptions {
  /** Visible label. Without one, pass `ariaLabel`. */
  label?: string;
  ariaLabel?: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  /** Shows the current value beside the label. */
  showValue?: boolean;
  /** Formats the shown value and the spoken `aria-valuetext` (e.g. `v => v + '%'`). */
  format?: (value: number) => string;
  /** Labelled positions under the track. */
  marks?: readonly SliderMark[];
  name?: string;
  disabled?: boolean;
  /** While dragging. */
  onInput?: (value: number, event: Event) => void;
  /** When the value is committed. */
  onChange?: (value: number, event: Event) => void;
}

export interface SliderHandle {
  el: HTMLDivElement;
  input: HTMLInputElement;
  getValue(): number;
  setValue(value: number): void;
  setDisabled(disabled: boolean): void;
}

/** Where `value` sits between `min` and `max`, 0 to 1 (the `--_at` custom property that draws the fill). */
export function sliderPosition(value: number, min = 0, max = 100): number {
  if (max <= min) return 0;
  return Math.round(Math.min(1, Math.max(0, (value - min) / (max - min))) * 10000) / 10000;
}

/**
 * `.mh-slider`: a styled native `<input type="range">` (arrow keys, Page Up/Down, Home/End and touch come from
 * the platform), with an optional label, value readout and marks. The fill is drawn from `--_at`.
 */
export function createSlider(options: SliderOptions): SliderHandle {
  const min = options.min ?? 0;
  const max = options.max ?? 100;
  const id = uid('mh-slider');
  const input = h('input', { type: 'range', class: 'mh-slider__input', id, name: options.name, min, max, step: options.step ?? 1, 'aria-label': options.label ? undefined : options.ariaLabel });
  input.value = String(options.value ?? min);
  input.disabled = options.disabled ?? false;
  const output = options.showValue ? h('output', { class: 'mh-slider__value', for: id }) : null;
  const head = options.label || output ? h('div', { class: 'mh-slider__head' }, options.label ? h('label', { class: 'mh-slider__label', for: id }, options.label) : null, output) : null;
  const marks = options.marks?.length
    ? h(
        'div',
        { class: 'mh-slider__marks', 'aria-hidden': 'true' },
        ...options.marks.map((m) => {
          const mark = h('span', { class: 'mh-slider__mark' }, m.label ?? '');
          mark.style.setProperty('--_at', String(sliderPosition(m.value, min, max)));
          return mark;
        }),
      )
    : null;
  const el = h('div', { class: 'mh-slider' }, head, input, marks);

  const sync = (): void => {
    const value = Number(input.value);
    input.style.setProperty('--_at', String(sliderPosition(value, min, max)));
    const text = options.format ? options.format(value) : String(value);
    if (options.format) input.setAttribute('aria-valuetext', text);
    if (output) output.textContent = text;
  };
  sync();
  input.addEventListener('input', (event) => {
    sync();
    options.onInput?.(Number(input.value), event);
  });
  if (options.onChange) input.addEventListener('change', (event) => options.onChange!(Number(input.value), event));

  return {
    el,
    input,
    getValue: () => Number(input.value),
    setValue(value) {
      input.value = String(value);
      sync();
    },
    setDisabled(disabled) {
      input.disabled = disabled;
    },
  };
}
