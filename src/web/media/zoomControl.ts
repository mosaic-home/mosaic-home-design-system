import { mdiChevronDown, mdiMinus, mdiPlus } from '@mdi/js';
import { cx, h } from '../dom.ts';
import { createIcon } from '../icons.ts';
import { iconButtonClass } from '../actions/iconButton.ts';
import { clamp } from './timecode.ts';

export type ZoomControlSize = 'small' | 'medium';

export interface ZoomControlLabels {
  group: string;
  zoomOut: string;
  zoomIn: string;
  level: string;
  fit: string;
}

export const ZOOM_CONTROL_LABELS: ZoomControlLabels = { group: 'Zoom', zoomOut: 'Zoom out', zoomIn: 'Zoom in', level: 'Zoom level', fit: 'Fit' };
/** Default presets: 25 % to 400 %. */
export const ZOOM_PRESETS: readonly number[] = [0.25, 0.5, 0.75, 1, 1.5, 2, 4];

export interface ZoomControlOptions {
  /** Current zoom; 1 is 100 %. */
  value: number;
  min?: number;
  max?: number;
  /** Levels offered in the menu and stepped through by − and +. */
  presets?: readonly number[];
  /** Shows the Fit button (default true). */
  showFit?: boolean;
  /** The view is fitted to its frame: the Fit button shows as pressed. */
  fitted?: boolean;
  size?: ZoomControlSize;
  disabled?: boolean;
  labels?: Partial<ZoomControlLabels>;
  /** A new level from −, + or the menu. */
  onChange?: (value: number) => void;
  onFit?: () => void;
}

export interface ZoomControlHandle {
  el: HTMLDivElement;
  setValue(value: number): void;
  setFitted(fitted: boolean): void;
  setDisabled(disabled: boolean): void;
}

/** "125%". */
export function formatZoom(value: number): string {
  return `${Math.round(value * 100)}%`;
}

const near = (a: number, b: number): boolean => Math.abs(a - b) <= Math.max(a, b) * 1e-3;

/** The presets inside `min`…`max`, sorted, without repeats. */
export function zoomPresets(presets: readonly number[], min: number, max: number): number[] {
  return [...new Set(presets.filter((p) => Number.isFinite(p) && p >= min - 1e-9 && p <= max + 1e-9))].sort((a, b) => a - b);
}

/** The next level up (`+1`) or down (`-1`): the nearest preset past `value`, or doubling / halving past the last one. */
export function zoomStep(value: number, direction: 1 | -1, presets: readonly number[] = ZOOM_PRESETS, min = 0.1, max = 8): number {
  const list = zoomPresets(presets, min, max);
  if (direction > 0) {
    const next = list.find((p) => p > value && !near(p, value));
    return clamp(next ?? value * 2, min, max);
  }
  const prev = [...list].reverse().find((p) => p < value && !near(p, value));
  return clamp(prev ?? value / 2, min, max);
}

export interface ZoomControlModel {
  /** Menu entries: the presets, plus the current level first when it isn't one. */
  options: { value: number; text: string }[];
  /** The selected entry's value. */
  selected: number;
  canZoomOut: boolean;
  canZoomIn: boolean;
}

/** What the control shows for a value. */
export function zoomControlModel(value: number, presets: readonly number[] = ZOOM_PRESETS, min = 0.1, max = 8): ZoomControlModel {
  const list = zoomPresets(presets, min, max);
  const match = list.find((p) => near(p, value));
  const options = list.map((p) => ({ value: p, text: formatZoom(p) }));
  if (match === undefined) {
    options.push({ value, text: formatZoom(value) });
    options.sort((a, b) => a.value - b.value);
  }
  return { options, selected: match ?? value, canZoomOut: value > min && !near(value, min), canZoomIn: value < max && !near(value, max) };
}

export function zoomControlClass(size: ZoomControlSize = 'medium'): string {
  return cx('mh-zoom-control', size === 'small' && 'mh-zoom-control--sm');
}

/** Classes of the − and + buttons. */
export function zoomControlButtonClass(size: ZoomControlSize = 'medium'): string {
  return cx(iconButtonClass('default', size === 'small' ? 'small' : 'medium'), 'mh-zoom-control__step');
}

/**
 * `.mh-zoom-control` (`--sm`): zoom out, a native `<select>` of preset levels (the current level is added when it
 * isn't a preset), zoom in, and a Fit toggle (`aria-pressed` while fitted). Parts: `__step`, `__level` with
 * `__select` and `__chevron`, `__fit`. − and + carry `aria-disabled` at the limits.
 */
export function createZoomControl(options: ZoomControlOptions): ZoomControlHandle {
  const labels = { ...ZOOM_CONTROL_LABELS, ...options.labels };
  const min = options.min ?? 0.1;
  const max = options.max ?? 8;
  const presets = options.presets ?? ZOOM_PRESETS;
  const size = options.size ?? 'medium';
  let value = clamp(options.value, min, max);
  let disabled = options.disabled ?? false;

  const out = h('button', { type: 'button', class: zoomControlButtonClass(size), 'aria-label': labels.zoomOut, title: labels.zoomOut }, createIcon(mdiMinus));
  const inn = h('button', { type: 'button', class: zoomControlButtonClass(size), 'aria-label': labels.zoomIn, title: labels.zoomIn }, createIcon(mdiPlus));
  const select = h('select', { class: 'mh-zoom-control__select', 'aria-label': labels.level });
  const level = h('span', { class: 'mh-zoom-control__level' }, select, createIcon(mdiChevronDown, { class: 'mh-zoom-control__chevron' }));
  const fit = options.showFit === false ? null : h('button', { type: 'button', class: 'mh-zoom-control__fit', 'aria-pressed': String(options.fitted ?? false) }, labels.fit);
  const el = h('div', { class: zoomControlClass(size), role: 'group', 'aria-label': labels.group }, out, level, inn, fit);

  const render = (): void => {
    const m = zoomControlModel(value, presets, min, max);
    select.replaceChildren(...m.options.map((o) => h('option', { value: String(o.value) }, o.text)));
    select.value = String(m.selected);
    // At a limit the step is marked unavailable but stays focusable, so focus doesn't drop out of it.
    out.disabled = disabled;
    inn.disabled = disabled;
    out.setAttribute('aria-disabled', String(!m.canZoomOut));
    inn.setAttribute('aria-disabled', String(!m.canZoomIn));
    select.disabled = disabled;
    if (fit) fit.disabled = disabled;
  };
  const set = (next: number): void => {
    value = clamp(next, min, max);
    render();
    options.onChange?.(value);
  };
  out.addEventListener('click', () => {
    if (out.getAttribute('aria-disabled') !== 'true') set(zoomStep(value, -1, presets, min, max));
  });
  inn.addEventListener('click', () => {
    if (inn.getAttribute('aria-disabled') !== 'true') set(zoomStep(value, 1, presets, min, max));
  });
  select.addEventListener('change', () => set(Number(select.value)));
  fit?.addEventListener('click', () => options.onFit?.());
  render();

  return {
    el,
    setValue(next) {
      value = clamp(next, min, max);
      render();
    },
    setFitted(fitted) {
      fit?.setAttribute('aria-pressed', String(fitted));
    },
    setDisabled(next) {
      disabled = next;
      render();
    },
  };
}
