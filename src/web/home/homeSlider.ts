import { sliderPosition } from '../choice-inputs/slider.ts';
import { cx, h, uid } from '../dom.ts';
import { createPendingValue } from './pending.ts';

/** The range a home slider shows and the value it starts from. */
export interface HomeSliderState {
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
}

export interface HomeSliderOptions extends HomeSliderState {
  /** Visible label. */
  label: string;
  /** Extra classes on the `.mh-slider` root. */
  className: string;
  step?: number;
  /** The shown value and the spoken `aria-valuetext`. */
  format(value: number): string;
  /** The value, once: when the finger or mouse lifts, or at once for a key press. */
  onCommit(value: number): void;
}

export interface HomeSliderHandle {
  el: HTMLDivElement;
  input: HTMLInputElement;
  /** New state from the owner; ignored for the value while it is being dragged or was just sent. */
  set(state: HomeSliderState): void;
  /** Sends a dragged value that was never released. */
  dispose(): void;
}

/** CSS classes of a home slider root. */
export function homeSliderClass(className: string): string {
  return cx('mh-slider', className);
}

/**
 * A labelled `.mh-slider` (same DOM as `createSlider` with `label` and `showValue`) that commits on release: the
 * native `change` event fires when the pointer lifts and on every key press. While dragging, and until the new
 * state arrives, it keeps the user's value. `--_at` (0 to 1) and `--_value` are set on the input for styling.
 */
export function createHomeSlider(options: HomeSliderOptions): HomeSliderHandle {
  const id = uid('mh-slider');
  const input = h('input', { type: 'range', class: 'mh-slider__input', id, step: options.step ?? 1 });
  const output = h('output', { class: 'mh-slider__value', for: id });
  const el = h('div', { class: homeSliderClass(options.className) }, h('div', { class: 'mh-slider__head' }, h('label', { class: 'mh-slider__label', for: id }, options.label), output), input);
  let state: HomeSliderState = options;
  const pending = createPendingValue<number>({ send: options.onCommit, changed: () => render() });

  const paint = (value: number): void => {
    const text = options.format(value);
    input.style.setProperty('--_at', String(sliderPosition(value, state.min, state.max)));
    input.style.setProperty('--_value', String(value));
    input.setAttribute('aria-valuetext', text);
    output.textContent = text;
  };
  const render = (): void => {
    input.min = String(state.min);
    input.max = String(state.max);
    input.disabled = state.disabled ?? false;
    const value = pending.shown(state.value);
    input.value = String(value);
    paint(value);
  };
  input.addEventListener('input', () => {
    const value = Number(input.value);
    pending.draft(value, state.value);
    paint(value);
  });
  input.addEventListener('change', () => {
    const value = Number(input.value);
    pending.commit(value, state.value);
    paint(value);
  });
  render();

  return {
    el,
    input,
    set(next) {
      state = next;
      render();
    },
    dispose: () => pending.dispose(),
  };
}
