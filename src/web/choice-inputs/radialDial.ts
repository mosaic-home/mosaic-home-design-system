import { cx, h, uid } from '../dom.ts';
import { rotaryAngleOf, rotaryArc, rotaryClamp, rotaryKey, rotaryPoint, rotaryTicks, setRotaryAria, svgEl, type RotaryLimits } from './rotary.ts';

/** `amount`: a 270° arc from min to max, filled up to the value. `angle`: a full turn that wraps (a direction). */
export type DialMode = 'amount' | 'angle';

export interface RadialDialOptions {
  /** Visible label under the dial. Without one, pass `ariaLabel`. */
  label?: string;
  ariaLabel?: string;
  mode?: DialMode;
  /** Default 0. */
  min?: number;
  /** Default 100 (`amount`) or 360 (`angle`, where max equals min). */
  max?: number;
  step?: number;
  /** Page Up / Page Down; default ten steps. */
  bigStep?: number;
  value?: number;
  /** Formats the value in the middle and the spoken `aria-valuetext` (e.g. `v => v + '°'`). */
  format?: (value: number) => string;
  /** Shows the value in the middle. Default true. */
  showValue?: boolean;
  /** Tick marks around the dial. */
  ticks?: number;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  /** While turning. */
  onInput?: (value: number, event: Event) => void;
  /** When the dial is let go or moved by key. */
  onChange?: (value: number, event: Event) => void;
}

export interface RadialDialHandle {
  el: HTMLDivElement;
  /** The `role="slider"` element that takes focus. */
  control: HTMLDivElement;
  getValue(): number;
  setValue(value: number): void;
  setDisabled(disabled: boolean): void;
}

/** Radius of the dial's track in its 100-unit viewBox. */
export const DIAL_RADIUS = 38;
/** The `amount` arc runs from -135° to 135° (the gap at the bottom). */
export const DIAL_START = -135;
export const DIAL_SWEEP = 270;

export function dialLimits(o: Pick<RadialDialOptions, 'mode' | 'min' | 'max' | 'step' | 'bigStep'>): RotaryLimits {
  const angle = o.mode === 'angle';
  return { min: o.min ?? 0, max: o.max ?? (angle ? 360 : 100), step: o.step ?? 1, bigStep: o.bigStep, wrap: angle };
}

/** Where the value sits on the dial, in degrees. */
export function dialAngle(value: number, limits: RotaryLimits): number {
  const span = limits.max - limits.min;
  const at = span > 0 ? Math.min(1, Math.max(0, (value - limits.min) / span)) : 0;
  return limits.wrap ? at * 360 : DIAL_START + at * DIAL_SWEEP;
}

/**
 * The value for a pointer at `angle`. In `amount` mode the gap at the bottom snaps to the nearer end, and a turn that
 * would jump across the gap (from near max to near min) stays at the end it came from.
 */
export function dialValueAt(angle: number, limits: RotaryLimits, previous?: number): number {
  const { min, max } = limits;
  if (limits.wrap) return rotaryClamp(min + (angle / 360) * (max - min), limits);
  const signed = angle > 180 ? angle - 360 : angle;
  let value: number;
  if (signed < DIAL_START) value = min;
  else if (signed > DIAL_START + DIAL_SWEEP) value = max;
  else value = min + ((signed - DIAL_START) / DIAL_SWEEP) * (max - min);
  value = rotaryClamp(value, limits);
  if (previous !== undefined && Math.abs(value - previous) > (max - min) / 2) return previous - min > (max - min) / 2 ? max : min;
  return value;
}

/** The drawing of a dial at `value`: the track and fill paths and the thumb's centre. */
export function dialGeometry(value: number, limits: RotaryLimits): { track: string; fill: string; thumb: { cx: string; cy: string } } {
  const angle = dialAngle(value, limits);
  const p = rotaryPoint(angle, DIAL_RADIUS);
  const r2 = (n: number): string => (Math.round(n * 100) / 100).toString();
  return {
    track: limits.wrap ? '' : rotaryArc(DIAL_START, DIAL_START + DIAL_SWEEP, DIAL_RADIUS),
    fill: limits.wrap ? '' : rotaryArc(DIAL_START, angle, DIAL_RADIUS),
    thumb: { cx: r2(p.x), cy: r2(p.y) },
  };
}

/** Tick positions for a dial. */
export function dialTicks(count: number, limits: RotaryLimits): ReturnType<typeof rotaryTicks> {
  return limits.wrap ? rotaryTicks(count, 46, 49.5) : rotaryTicks(count, 46, 49.5, DIAL_START, DIAL_START + DIAL_SWEEP);
}

export function dialClass(o: Pick<RadialDialOptions, 'mode' | 'size' | 'disabled'>): string {
  return cx('mh-dial', o.mode === 'angle' && 'mh-dial--angle', o.size === 'small' && 'mh-dial--sm', o.size === 'large' && 'mh-dial--lg', o.disabled && 'is-disabled');
}

/**
 * `.mh-dial`: a knob for an amount (volume, fan speed: a 270° arc filled to the value) or an angle (a direction,
 * a full turn that wraps). The `__control` is a `role="slider"`: drag around it, or use the arrow keys, Page Up/Down,
 * Home and End. Parts `__control`, `__svg`, `__track`, `__fill`, `__ticks`, `__thumb`, `__value`, `__label`.
 */
export function createRadialDial(options: RadialDialOptions): RadialDialHandle {
  const limits = dialLimits(options);
  const labelId = uid('mh-dial-label');
  let disabled = options.disabled ?? false;
  let value = rotaryClamp(options.value ?? limits.min, limits);

  const ticks = options.ticks ? svgEl('g', { class: 'mh-dial__ticks' }, ...dialTicks(options.ticks, limits).map((t) => svgEl('line', { class: 'mh-dial__tick', ...t }))) : null;
  const track = limits.wrap ? svgEl('circle', { class: 'mh-dial__track', cx: 50, cy: 50, r: DIAL_RADIUS }) : svgEl('path', { class: 'mh-dial__track' });
  const fill = limits.wrap ? null : svgEl('path', { class: 'mh-dial__fill' });
  const needle = limits.wrap ? svgEl('line', { class: 'mh-dial__needle', x1: 50, y1: 50 }) : null;
  const thumb = svgEl('circle', { class: 'mh-dial__thumb', r: 7 });
  const svg = svgEl('svg', { class: 'mh-dial__svg', viewBox: '0 0 100 100', 'aria-hidden': 'true' }, ticks, track, fill, needle, thumb);
  const valueEl = options.showValue === false ? null : h('span', { class: 'mh-dial__value', 'aria-hidden': 'true' });
  const control = h('div', { class: 'mh-dial__control', role: 'slider', 'aria-labelledby': options.label ? labelId : undefined, 'aria-label': options.label ? undefined : options.ariaLabel }, svg, valueEl);
  const label = options.label ? h('span', { class: 'mh-dial__label', id: labelId }, options.label) : null;
  const el = h('div', { class: dialClass({ ...options, disabled }) }, control, label);

  const sync = (): void => {
    const g = dialGeometry(value, limits);
    if (!limits.wrap) track.setAttribute('d', g.track);
    fill?.setAttribute('d', g.fill);
    thumb.setAttribute('cx', g.thumb.cx);
    thumb.setAttribute('cy', g.thumb.cy);
    needle?.setAttribute('x2', g.thumb.cx);
    needle?.setAttribute('y2', g.thumb.cy);
    const text = options.format ? options.format(value) : String(value);
    if (valueEl) valueEl.textContent = text;
    setRotaryAria(control, value, limits.min, limits.max, options.format ? text : undefined, disabled);
    el.className = dialClass({ ...options, disabled });
  };
  const set = (next: number, event: Event): boolean => {
    if (next === value) return false;
    value = next;
    sync();
    options.onInput?.(value, event);
    return true;
  };
  sync();

  control.addEventListener('keydown', (event) => {
    if (disabled) return;
    const next = rotaryKey(event.key, value, limits);
    if (next === null) return;
    event.preventDefault();
    if (set(next, event)) options.onChange?.(value, event);
  });

  let dragging = false;
  let startValue = value;
  // A press jumps to where it lands; a drag then never jumps across the gap.
  const fromPointer = (event: PointerEvent, guard: boolean): void => {
    const box = control.getBoundingClientRect();
    if (box.width <= 0) return;
    set(dialValueAt(rotaryAngleOf(event.clientX, event.clientY, box), limits, guard ? value : undefined), event);
  };
  control.addEventListener('pointerdown', (event) => {
    if (disabled || event.button !== 0) return;
    event.preventDefault();
    dragging = true;
    startValue = value;
    control.focus();
    control.setPointerCapture?.(event.pointerId);
    fromPointer(event, false);
  });
  control.addEventListener('pointermove', (event) => {
    if (dragging) fromPointer(event, true);
  });
  const end = (event: Event): void => {
    if (!dragging) return;
    dragging = false;
    if (value !== startValue) options.onChange?.(value, event);
  };
  control.addEventListener('pointerup', end);
  control.addEventListener('pointercancel', end);

  return {
    el,
    control,
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
