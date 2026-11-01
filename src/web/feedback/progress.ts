import { cx, h } from '../dom.ts';

export type ProgressTone = 'accent' | 'success' | 'warning' | 'danger';
export type ProgressSize = 'small' | 'medium' | 'large';

/** The share of `max` reached, clamped to 0..100; `null` when indeterminate. */
export function progressPercent(value: number | null | undefined, max = 100): number | null {
  if (value === null || value === undefined || !Number.isFinite(value) || max <= 0) return null;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

export interface ProgressAria {
  role: 'progressbar';
  'aria-label': string;
  'aria-valuemin': number;
  'aria-valuemax': number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
  'aria-busy'?: 'true';
}

/** The ARIA attributes of a progress indicator (indeterminate: no `aria-valuenow`; busy until complete). */
export function progressAria(value: number | null | undefined, max: number, label: string, valueText?: string): ProgressAria {
  const pct = progressPercent(value, max);
  const aria: ProgressAria = { role: 'progressbar', 'aria-label': label, 'aria-valuemin': 0, 'aria-valuemax': max };
  if (pct !== null) {
    aria['aria-valuenow'] = Math.max(0, Math.min(max, value!));
    if (valueText) aria['aria-valuetext'] = valueText;
  }
  if (pct === null || pct < 100) aria['aria-busy'] = 'true';
  return aria;
}

const ARIA_KEYS = ['aria-valuenow', 'aria-valuetext', 'aria-busy'] as const;

function setAria(el: HTMLElement, aria: ProgressAria): void {
  for (const k of ARIA_KEYS) el.removeAttribute(k);
  for (const [k, v] of Object.entries(aria)) el.setAttribute(k, String(v));
}

/** The value shown next to a bar or inside a ring. */
export function progressValueText(value: number | null | undefined, max = 100, valueText?: string): string {
  const pct = progressPercent(value, max);
  if (pct === null) return '';
  return valueText ?? `${Math.round(pct)}%`;
}

export interface ProgressBarOptions {
  /** Current value; `null` or omitted shows an indeterminate bar. */
  value?: number | null;
  max?: number;
  /** Accessible name (also shown above the bar with `showLabel`). */
  label: string;
  showLabel?: boolean;
  /** Shows the percentage (or `valueText`) above the bar. */
  showValue?: boolean;
  /** Text read and shown for the value, e.g. "3 of 8 rooms". */
  valueText?: string;
  tone?: ProgressTone;
  size?: ProgressSize;
}

export interface ProgressBarHandle {
  el: HTMLDivElement;
  /** `null` switches to indeterminate. */
  setValue(value: number | null, valueText?: string): void;
}

export function progressBarClass(tone: ProgressTone = 'accent', size: ProgressSize = 'medium', indeterminate = false): string {
  return cx(
    'mh-progress',
    tone !== 'accent' && `mh-progress--${tone}`,
    size !== 'medium' && `mh-progress--${size === 'small' ? 'sm' : 'lg'}`,
    indeterminate && 'mh-progress--indeterminate',
  );
}

/**
 * `.mh-progress`: a determinate or indeterminate bar (`role="progressbar"`). Parts `__header`, `__label`, `__value`,
 * `__track`, `__fill`; modifiers for tone, `--sm | --lg` and `--indeterminate`.
 */
export function createProgressBar(options: ProgressBarOptions): ProgressBarHandle {
  const max = options.max ?? 100;
  const fill = h('div', { class: 'mh-progress__fill' });
  const track = h('div', { class: 'mh-progress__track' }, fill);
  const value = options.showValue ? h('span', { class: 'mh-progress__value', 'aria-hidden': 'true' }) : null;
  const header =
    options.showLabel || value
      ? h('div', { class: 'mh-progress__header' }, options.showLabel ? h('span', { class: 'mh-progress__label', 'aria-hidden': 'true' }, options.label) : null, value)
      : null;
  const el = h('div', {}, header, track);
  const setValue = (v: number | null, valueText?: string): void => {
    const pct = progressPercent(v, max);
    el.className = progressBarClass(options.tone, options.size, pct === null);
    setAria(el, progressAria(v, max, options.label, valueText));
    fill.style.width = pct === null ? '' : `${pct}%`;
    if (value) value.textContent = progressValueText(v, max, valueText);
  };
  setValue(options.value ?? null, options.valueText);
  return { el, setValue };
}

export interface ProgressRingOptions {
  value?: number | null;
  max?: number;
  label: string;
  /** Shows the value in the middle (default true). */
  showValue?: boolean;
  valueText?: string;
  tone?: ProgressTone;
  size?: ProgressSize;
}

export interface ProgressRingHandle {
  el: HTMLDivElement;
  setValue(value: number | null, valueText?: string): void;
}

export function progressRingClass(tone: ProgressTone = 'accent', size: ProgressSize = 'medium', indeterminate = false): string {
  return cx(
    'mh-progress-ring',
    tone !== 'accent' && `mh-progress-ring--${tone}`,
    size !== 'medium' && `mh-progress-ring--${size === 'small' ? 'sm' : 'lg'}`,
    indeterminate && 'mh-progress-ring--indeterminate',
  );
}

/** Ring geometry: a 36-unit box; the arc is measured in percent through `pathLength="100"`. */
export const RING = { size: 36, radius: 16, center: 18 } as const;

/** `stroke-dasharray` of the arc: the percentage, or a quarter arc that spins when indeterminate. */
export function ringDash(value: number | null | undefined, max = 100): string {
  return `${progressPercent(value, max) ?? 25} 100`;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

function circle(cls: string): SVGCircleElement {
  const c = document.createElementNS(SVG_NS, 'circle');
  c.setAttribute('class', cls);
  c.setAttribute('cx', String(RING.center));
  c.setAttribute('cy', String(RING.center));
  c.setAttribute('r', String(RING.radius));
  c.setAttribute('pathLength', '100');
  return c;
}

/**
 * `.mh-progress-ring`: circular progress with the value in the middle. Parts `__svg`, `__track`, `__arc`, `__value`.
 * Without a value it spins (indeterminate).
 */
export function createProgressRing(options: ProgressRingOptions): ProgressRingHandle {
  const max = options.max ?? 100;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'mh-progress-ring__svg');
  svg.setAttribute('viewBox', `0 0 ${RING.size} ${RING.size}`);
  svg.setAttribute('aria-hidden', 'true');
  const arc = circle('mh-progress-ring__arc');
  svg.append(circle('mh-progress-ring__track'), arc);
  const value = h('span', { class: 'mh-progress-ring__value', 'aria-hidden': 'true' });
  const el = h('div', {}, svg, value);
  const setValue = (v: number | null, valueText?: string): void => {
    const pct = progressPercent(v, max);
    el.className = progressRingClass(options.tone, options.size, pct === null);
    setAria(el, progressAria(v, max, options.label, valueText));
    arc.setAttribute('stroke-dasharray', ringDash(v, max));
    value.textContent = options.showValue === false ? '' : progressValueText(v, max, valueText);
  };
  setValue(options.value ?? null, options.valueText);
  return { el, setValue };
}
