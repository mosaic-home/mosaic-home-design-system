import { mdiArrowSplitHorizontal, mdiArrowSplitVertical } from '@mdi/js';
import { cx, h } from '../dom.ts';
import { createIcon } from '../icons.ts';
import { clamp } from './timecode.ts';

export type CompareOrientation = 'horizontal' | 'vertical';

/** A picture for one side: shown with `object-fit: cover`. */
export interface CompareImage {
  src: string;
  alt: string;
}

export interface CompareSliderOptions {
  /** Accessible name of the divider ("Compare edits"). */
  label: string;
  before: CompareImage | Node;
  after: CompareImage | Node;
  beforeLabel?: string;
  afterLabel?: string;
  /** Share of the frame showing "before", 0 to 100 (default 50). */
  value?: number;
  /** `horizontal` (default) splits left / right; `vertical` splits top / bottom. */
  orientation?: CompareOrientation;
  /** Width / height (default 4 / 3). */
  aspect?: number;
  disabled?: boolean;
  onChange?: (value: number) => void;
}

export interface CompareSliderHandle {
  el: HTMLDivElement;
  input: HTMLInputElement;
  getValue(): number;
  setValue(value: number): void;
  setDisabled(disabled: boolean): void;
  destroy(): void;
}

export function compareSliderClass(orientation: CompareOrientation = 'horizontal'): string {
  return cx('mh-compare', orientation === 'vertical' && 'mh-compare--vertical');
}

/** Value (0 to 100) under a pointer, from the frame's rectangle. */
export function compareValueAt(rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>, clientX: number, clientY: number, orientation: CompareOrientation = 'horizontal'): number {
  const share = orientation === 'vertical' ? (clientY - rect.top) / (rect.height || 1) : (clientX - rect.left) / (rect.width || 1);
  return Math.round(clamp(share, 0, 1) * 1000) / 10;
}

/** The divider's spoken value: "40% before". */
export function compareValueText(value: number, beforeLabel = 'Before'): string {
  return `${Math.round(value)}% ${beforeLabel.toLowerCase()}`;
}

export const COMPARE_ASPECT = 4 / 3;

const isImage = (side: CompareImage | Node): side is CompareImage => typeof (side as CompareImage).src === 'string' && !(side instanceof Node);

/** Wires dragging on the frame: a press anywhere moves the divider there and dragging follows the pointer. */
export function attachCompareDrag(el: HTMLElement, orientation: CompareOrientation, isDisabled: () => boolean, onValue: (value: number) => void): () => void {
  let dragging: number | null = null;
  const at = (e: PointerEvent): number => compareValueAt(el.getBoundingClientRect(), e.clientX, e.clientY, orientation);
  const down = (e: PointerEvent): void => {
    if (isDisabled() || (e.pointerType === 'mouse' && e.button !== 0)) return;
    dragging = e.pointerId;
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      // Capture is optional.
    }
    el.classList.add('is-dragging');
    onValue(at(e));
    // Keep keyboard users and screen readers on the divider.
    el.querySelector<HTMLInputElement>('.mh-compare__input')?.focus({ preventScroll: true });
    e.preventDefault();
  };
  const move = (e: PointerEvent): void => {
    if (dragging === e.pointerId) onValue(at(e));
  };
  const up = (e: PointerEvent): void => {
    if (dragging !== e.pointerId) return;
    dragging = null;
    el.classList.remove('is-dragging');
  };
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  return () => {
    el.removeEventListener('pointerdown', down);
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerup', up);
    el.removeEventListener('pointercancel', up);
  };
}

/**
 * `.mh-compare` (`--vertical`): two panes stacked in one frame, "before" clipped to the divider's position, with a
 * draggable divider (`__divider` with `__handle`) and corner labels (`__label--before | --after`). A press anywhere
 * moves the divider; the keyboard drives a native range (`__input`, arrows, Page Up / Down, Home / End) that
 * carries the name and value. `--_at` (0 to 1) on the root positions everything.
 */
export function createCompareSlider(options: CompareSliderOptions): CompareSliderHandle {
  const orientation = options.orientation ?? 'horizontal';
  const beforeLabel = options.beforeLabel ?? 'Before';
  const afterLabel = options.afterLabel ?? 'After';
  const pane = (side: 'before' | 'after', content: CompareImage | Node): HTMLDivElement =>
    h('div', { class: `mh-compare__pane mh-compare__pane--${side}` }, isImage(content) ? h('img', { class: 'mh-compare__img', src: content.src, alt: content.alt, draggable: 'false' }) : content);
  const input = h('input', {
    type: 'range',
    class: 'mh-compare__input',
    min: 0,
    max: 100,
    step: 1,
    'aria-label': options.label,
    'aria-orientation': orientation === 'vertical' ? 'vertical' : undefined,
  });
  const el = h(
    'div',
    { class: compareSliderClass(orientation) },
    pane('after', options.after),
    pane('before', options.before),
    h('span', { class: 'mh-compare__label mh-compare__label--before', 'aria-hidden': 'true' }, beforeLabel),
    h('span', { class: 'mh-compare__label mh-compare__label--after', 'aria-hidden': 'true' }, afterLabel),
    h('div', { class: 'mh-compare__divider', 'aria-hidden': 'true' }, h('span', { class: 'mh-compare__handle' }, createIcon(orientation === 'vertical' ? mdiArrowSplitHorizontal : mdiArrowSplitVertical))),
    input,
  );
  el.style.aspectRatio = String(options.aspect && options.aspect > 0 ? options.aspect : COMPARE_ASPECT);
  let value = clamp(options.value ?? 50, 0, 100);
  input.disabled = options.disabled ?? false;

  const paint = (): void => {
    input.value = String(Math.round(value));
    input.setAttribute('aria-valuetext', compareValueText(value, beforeLabel));
    el.style.setProperty('--_at', String(Math.round(value * 10) / 1000));
  };
  const set = (next: number): void => {
    const v = clamp(next, 0, 100);
    if (v === value) return;
    value = v;
    paint();
    options.onChange?.(value);
  };
  input.addEventListener('input', () => set(Number(input.value)));
  const detach = attachCompareDrag(el, orientation, () => input.disabled, set);
  paint();

  return {
    el,
    input,
    getValue: () => value,
    setValue(next) {
      value = clamp(next, 0, 100);
      paint();
    },
    setDisabled(disabled) {
      input.disabled = disabled;
    },
    destroy: detach,
  };
}
