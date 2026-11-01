import { cx, h, uid } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';
import { rotaryAngleOf, rotaryArc, rotaryClamp, rotaryDelta, rotaryKey, rotaryTicks, setRotaryAria, svgEl, type RotaryLimits } from './rotary.ts';

export interface ClickWheelCenter {
  /** Accessible name of the centre button. */
  label: string;
  icon: IconName | string;
  onPress?: (event: MouseEvent) => void;
}

export interface ClickWheelOptions {
  /** Visible label under the wheel. Without one, pass `ariaLabel`. */
  label?: string;
  ariaLabel?: string;
  /** Default 0. */
  min?: number;
  /** Default 100. */
  max?: number;
  /** One detent. Default 1. */
  step?: number;
  /** Page Up / Page Down; default ten steps. */
  bigStep?: number;
  value?: number;
  /** Past one end comes back at the other (an hour of the day, a list). `max` then equals `min`. */
  wrap?: boolean;
  /** Detents (and ticks) per full turn. Default 24. */
  detents?: number;
  format?: (value: number) => string;
  /** Shows the value in the middle (when there's no centre button). Default true. */
  showValue?: boolean;
  /** A button in the middle (play, confirm). */
  center?: ClickWheelCenter;
  size?: 'small' | 'medium' | 'large';
  /** A short vibration on each detent, where the device supports it. */
  haptics?: boolean;
  disabled?: boolean;
  /** On every detent. */
  onInput?: (value: number, event: Event) => void;
  /** When a turn ends (let go, a key, a scroll notch). */
  onChange?: (value: number, event: Event) => void;
}

export interface ClickWheelHandle {
  el: HTMLDivElement;
  /** The `role="slider"` wheel that takes focus. */
  wheel: HTMLDivElement;
  center: HTMLButtonElement | null;
  getValue(): number;
  setValue(value: number): void;
  setDisabled(disabled: boolean): void;
}

export const CLICK_WHEEL_DETENTS = 24;

/** The fixed marker at twelve o'clock that the ticks turn past. */
export const CLICK_WHEEL_INDICATOR = 'M 46.5 1.5 L 53.5 1.5 L 50 7 Z';

/** Pixels of scroll that make one detent. */
const SCROLL_PER_DETENT = 40;

export function clickWheelLimits(o: Pick<ClickWheelOptions, 'min' | 'max' | 'step' | 'bigStep' | 'wrap'>): RotaryLimits {
  return { min: o.min ?? 0, max: o.max ?? 100, step: o.step ?? 1, bigStep: o.bigStep, wrap: o.wrap ?? false };
}

/** How far the wheel has turned at `value`, in degrees: one detent per step. */
export function clickWheelTurn(value: number, limits: RotaryLimits, detents = CLICK_WHEEL_DETENTS): number {
  const steps = limits.step > 0 ? Math.round((value - limits.min) / limits.step) : 0;
  return Math.round(((steps * 360) / Math.max(1, detents)) * 100) / 100;
}

/** The progress arc around the rim of a bounded wheel (empty for a wrapping one). */
export function clickWheelProgress(value: number, limits: RotaryLimits): string {
  if (limits.wrap) return '';
  const span = limits.max - limits.min;
  const at = span > 0 ? Math.min(1, Math.max(0, (value - limits.min) / span)) : 0;
  return rotaryArc(0, Math.min(359.99, at * 360), 46);
}

/** The ticks on the wheel's face. */
export function clickWheelTicks(detents = CLICK_WHEEL_DETENTS): ReturnType<typeof rotaryTicks> {
  return rotaryTicks(detents, 30, 38);
}

export function clickWheelClass(o: Pick<ClickWheelOptions, 'size' | 'disabled'>): string {
  return cx('mh-click-wheel', o.size === 'small' && 'mh-click-wheel--sm', o.size === 'large' && 'mh-click-wheel--lg', o.disabled && 'is-disabled');
}

/**
 * `.mh-click-wheel`: a large rotary wheel with ticks, turned like a physical knob. It moves by detents (one step
 * each, `detents` per turn) relative to where the turn started, so it never jumps to the finger; the ticks turn with
 * it and an arc on the rim shows where a bounded value sits. The `__wheel` is a `role="slider"`: drag around it,
 * scroll over it, or use the arrow keys, Page Up/Down, Home and End. An optional `__center` button sits in the
 * middle. Parts `__wheel`, `__svg`, `__disc`, `__rim`, `__progress`, `__ticks`, `__tick`, `__indicator`,
 * `__value`, `__center`, `__label`.
 */
export function createClickWheel(options: ClickWheelOptions): ClickWheelHandle {
  const limits = clickWheelLimits(options);
  const detents = Math.max(1, Math.round(options.detents ?? CLICK_WHEEL_DETENTS));
  const detentAngle = 360 / detents;
  const labelId = uid('mh-click-wheel-label');
  let disabled = options.disabled ?? false;
  let value = rotaryClamp(options.value ?? limits.min, limits);

  const progress = limits.wrap ? null : svgEl('path', { class: 'mh-click-wheel__progress' });
  const ticks = svgEl('g', { class: 'mh-click-wheel__ticks' }, ...clickWheelTicks(detents).map((t, i) => svgEl('line', { class: cx('mh-click-wheel__tick', i === 0 && 'mh-click-wheel__tick--zero'), ...t })));
  const svg = svgEl(
    'svg',
    { class: 'mh-click-wheel__svg', viewBox: '0 0 100 100', 'aria-hidden': 'true' },
    svgEl('circle', { class: 'mh-click-wheel__disc', cx: 50, cy: 50, r: 44 }),
    limits.wrap ? null : svgEl('circle', { class: 'mh-click-wheel__rim', cx: 50, cy: 50, r: 46 }),
    progress,
    ticks,
    svgEl('path', { class: 'mh-click-wheel__indicator', d: CLICK_WHEEL_INDICATOR }),
  );
  const valueEl = options.center || options.showValue === false ? null : h('span', { class: 'mh-click-wheel__value', 'aria-hidden': 'true' });
  const wheel = h('div', { class: 'mh-click-wheel__wheel', role: 'slider', 'aria-labelledby': options.label ? labelId : undefined, 'aria-label': options.label ? undefined : options.ariaLabel }, svg, valueEl);
  const center = options.center ? h('button', { type: 'button', class: 'mh-click-wheel__center', 'aria-label': options.center.label, title: options.center.label }, createIcon(options.center.icon)) : null;
  if (center && options.center?.onPress) center.addEventListener('click', options.center.onPress);
  const label = options.label ? h('span', { class: 'mh-click-wheel__label', id: labelId }, options.label) : null;
  const el = h('div', { class: clickWheelClass({ ...options, disabled }) }, h('div', { class: 'mh-click-wheel__body' }, wheel, center), label);

  let drift = 0;
  const sync = (): void => {
    el.style.setProperty('--_turn', `${clickWheelTurn(value, limits, detents) + drift}deg`);
    progress?.setAttribute('d', clickWheelProgress(value, limits));
    const text = options.format ? options.format(value) : String(value);
    if (valueEl) valueEl.textContent = text;
    setRotaryAria(wheel, value, limits.min, limits.max, options.format ? text : undefined, disabled);
    if (center) center.disabled = disabled;
    el.className = clickWheelClass({ ...options, disabled });
  };
  /** Moves by whole detents; returns how many it actually moved (fewer at an end). */
  const turnBy = (count: number, event: Event): number => {
    let moved = 0;
    const dir = Math.sign(count);
    for (let i = 0; i < Math.abs(count); i += 1) {
      const next = rotaryClamp(value + dir * limits.step, limits);
      if (next === value) break;
      value = next;
      moved += dir;
      if (options.haptics) navigator.vibrate?.(4);
      options.onInput?.(value, event);
    }
    return moved;
  };
  sync();

  wheel.addEventListener('keydown', (event) => {
    if (disabled) return;
    const next = rotaryKey(event.key, value, limits);
    if (next === null) return;
    event.preventDefault();
    if (next === value) return;
    value = next;
    sync();
    options.onInput?.(value, event);
    options.onChange?.(value, event);
  });

  let scroll = 0;
  wheel.addEventListener(
    'wheel',
    (event) => {
      if (disabled) return;
      const px = event.deltaMode === 1 ? event.deltaY * SCROLL_PER_DETENT : event.deltaMode === 2 ? event.deltaY * SCROLL_PER_DETENT * 3 : event.deltaY;
      // At an end, let the page scroll on.
      const dir = px < 0 ? 1 : -1;
      if (rotaryClamp(value + dir * limits.step, limits) === value) return;
      event.preventDefault();
      scroll += px;
      const count = Math.trunc(-scroll / SCROLL_PER_DETENT);
      if (count === 0) return;
      scroll += count * SCROLL_PER_DETENT;
      if (turnBy(count, event) !== 0) {
        sync();
        options.onChange?.(value, event);
      }
    },
    { passive: false },
  );

  let dragging = false;
  let lastAngle = 0;
  let startValue = value;
  wheel.addEventListener('pointerdown', (event) => {
    if (disabled || event.button !== 0) return;
    const box = wheel.getBoundingClientRect();
    if (box.width <= 0) return;
    event.preventDefault();
    dragging = true;
    startValue = value;
    drift = 0;
    lastAngle = rotaryAngleOf(event.clientX, event.clientY, box);
    wheel.focus();
    wheel.setPointerCapture?.(event.pointerId);
  });
  wheel.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const box = wheel.getBoundingClientRect();
    // Too near the middle the angle swings wildly: ignore it.
    const dx = event.clientX - (box.left + box.width / 2);
    const dy = event.clientY - (box.top + box.height / 2);
    if (Math.hypot(dx, dy) < box.width * 0.12) return;
    const angle = rotaryAngleOf(event.clientX, event.clientY, box);
    drift += rotaryDelta(lastAngle, angle);
    lastAngle = angle;
    const count = Math.trunc(drift / detentAngle);
    if (count !== 0) {
      const moved = turnBy(count, event);
      // At an end the wheel holds still; otherwise keep the part of a detent not yet used.
      drift = moved === count ? drift - count * detentAngle : 0;
    }
    sync();
  });
  const end = (event: Event): void => {
    if (!dragging) return;
    dragging = false;
    drift = 0;
    sync();
    if (value !== startValue) options.onChange?.(value, event);
  };
  wheel.addEventListener('pointerup', end);
  wheel.addEventListener('pointercancel', end);

  return {
    el,
    wheel,
    center,
    getValue: () => value,
    setValue(next) {
      value = rotaryClamp(next, limits);
      sync();
    },
    setDisabled(next) {
      disabled = next;
      sync();
    },
  };
}
