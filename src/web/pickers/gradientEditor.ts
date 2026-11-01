import { mdiDeleteOutline, mdiPlus } from '@mdi/js';
import { iconButtonClass } from '../actions/iconButton.ts';
import { buttonClass } from '../actions/button.ts';
import { cx, h, uid } from '../dom.ts';
import { createIcon } from '../icons.ts';
import { inputAdornment, inputClass } from '../text-inputs/textField.ts';
import { cssRgba, mixRgba, parseHex, toHex, type Rgba } from './color.ts';
import { createColorPicker, type ColorPickerHandle, type ColorSwatch } from './colorPicker.ts';

export interface GradientStop {
  /** Position along the gradient, 0–100 (%). */
  offset: number;
  /** `#rrggbb`. */
  color: string;
  /** 0–1 (default 1). */
  opacity?: number;
}

export interface GradientEditorOptions {
  /** At least two stops (default: the theme-neutral black to white). */
  stops?: readonly GradientStop[];
  /** Direction in degrees for the CSS output and preview (default 90, left to right). */
  angle?: number;
  /** Shows an angle entry (default false). */
  showAngle?: boolean;
  /** Swatches for the stop colour picker (`false` hides them). */
  swatches?: readonly (string | ColorSwatch)[] | false;
  /** Accessible name (default "Gradient"). */
  label?: string;
  disabled?: boolean;
  /** While dragging or editing. */
  onInput?: (stops: GradientStop[], angle: number) => void;
  /** When a change is committed. */
  onChange?: (stops: GradientStop[], angle: number) => void;
}

export interface GradientEditorHandle {
  el: HTMLDivElement;
  picker: ColorPickerHandle;
  getStops(): GradientStop[];
  setStops(stops: readonly GradientStop[]): void;
  getAngle(): number;
  setAngle(angle: number): void;
  /** The gradient as a CSS `linear-gradient(...)`. */
  css(): string;
  setDisabled(disabled: boolean): void;
}

interface Stop {
  id: string;
  offset: number;
  rgba: Rgba;
}

const clampOffset = (n: number): number => Math.round(Math.min(100, Math.max(0, n)) * 10) / 10;

/** Stops sorted by offset, with defaults filled in and values clamped. */
export function normalizeStops(stops: readonly GradientStop[]): Required<GradientStop>[] {
  return stops
    .map((s) => ({ offset: clampOffset(s.offset), color: toHex(parseHex(s.color) ?? { r: 0, g: 0, b: 0, a: 1 }), opacity: Math.min(1, Math.max(0, s.opacity ?? 1)) }))
    .sort((a, b) => a.offset - b.offset);
}

/** The colour and opacity of a gradient at `offset` (0–100), interpolated between the stops either side. */
export function gradientColorAt(stops: readonly GradientStop[], offset: number): { color: string; opacity: number } {
  const list = normalizeStops(stops);
  if (list.length === 0) return { color: '#000000', opacity: 1 };
  const rgba = (s: Required<GradientStop>): Rgba => ({ ...parseHex(s.color)!, a: s.opacity });
  let result = rgba(list[0]!);
  if (offset >= list[list.length - 1]!.offset) result = rgba(list[list.length - 1]!);
  else {
    for (let i = 0; i < list.length - 1; i += 1) {
      const a = list[i]!;
      const b = list[i + 1]!;
      if (offset >= a.offset && offset <= b.offset) {
        result = mixRgba(rgba(a), rgba(b), b.offset === a.offset ? 0 : (offset - a.offset) / (b.offset - a.offset));
        break;
      }
    }
  }
  return { color: toHex(result), opacity: Math.round(result.a * 1000) / 1000 };
}

/** `linear-gradient(<angle>deg, rgb(...) <offset>%, …)`. */
export function gradientCss(stops: readonly GradientStop[], angle = 90): string {
  const list = normalizeStops(stops);
  const parts = list.map((s) => `${cssRgba({ ...parseHex(s.color)!, a: s.opacity })} ${s.offset}%`);
  return `linear-gradient(${Math.round(angle)}deg, ${parts.join(', ')})`;
}

const DEFAULT_STOPS: GradientStop[] = [
  { offset: 0, color: '#000000' },
  { offset: 100, color: '#ffffff' },
];

/**
 * `.mh-gradient-editor`: a preview track with a draggable `.mh-gradient-editor__stop` per colour stop
 * (`role="slider"`: arrow keys move it, Shift by ten, Delete removes it). Pressing the track adds a stop with the
 * colour found there. The selected stop is edited below: position, removal and a `.mh-color-picker` with opacity,
 * so each stop carries both a colour and an opacity.
 */
export function createGradientEditor(options: GradientEditorOptions = {}): GradientEditorHandle {
  const toStops = (list: readonly GradientStop[]): Stop[] => {
    const norm = normalizeStops(list.length >= 2 ? list : DEFAULT_STOPS);
    return norm.map((s) => ({ id: uid('mh-stop'), offset: s.offset, rgba: { ...parseHex(s.color)!, a: s.opacity } }));
  };
  let stops = toStops(options.stops ?? DEFAULT_STOPS);
  let selected = stops[0]!.id;
  let angle = options.angle ?? 90;
  let disabled = false;

  const fill = h('div', { class: 'mh-gradient-editor__fill', 'aria-hidden': 'true' });
  const handles = h('div', { class: 'mh-gradient-editor__stops' });
  const track = h('div', { class: 'mh-gradient-editor__track' }, fill, handles);
  const hint = h('p', { class: 'mh-gradient-editor__hint', id: uid('mh-gradient-hint') }, 'Press the bar to add a stop. Arrow keys move the selected stop; Delete removes it.');
  const position = h('input', { class: 'mh-input__control mh-gradient-editor__position', type: 'number', min: 0, max: 100, step: 1, inputmode: 'decimal', 'aria-label': 'Stop position' });
  const positionBox = h('div', { class: inputClass('small', 'mh-gradient-editor__position-box') }, position, inputAdornment('%', true));
  const remove = h('button', { type: 'button', class: cx(iconButtonClass('danger', 'small'), 'mh-gradient-editor__remove'), 'aria-label': 'Remove stop', title: 'Remove stop' }, createIcon(mdiDeleteOutline));
  const add = h('button', { type: 'button', class: cx(buttonClass('text', 'small'), 'mh-gradient-editor__add') }, createIcon(mdiPlus), h('span', { class: 'mh-button__label' }, 'Add stop'));
  const angleInput = options.showAngle ? h('input', { class: 'mh-input__control mh-gradient-editor__angle', type: 'number', min: 0, max: 360, step: 1, 'aria-label': 'Angle' }) : null;
  const angleBox = angleInput ? h('div', { class: inputClass('small', 'mh-gradient-editor__angle-box') }, angleInput, inputAdornment('°', true)) : null;
  const picker = createColorPicker({
    alpha: true,
    swatches: options.swatches,
    label: 'Stop colour',
    onInput: (v) => updateSelectedColor(v, false),
    onChange: (v) => updateSelectedColor(v, true),
  });

  const el = h(
    'div',
    { class: 'mh-gradient-editor', role: 'group', 'aria-label': options.label ?? 'Gradient' },
    track,
    hint,
    h('div', { class: 'mh-gradient-editor__toolbar' }, positionBox, remove, add, angleBox),
    picker.el,
  );

  const publicStops = (): GradientStop[] => [...stops].sort((a, b) => a.offset - b.offset).map((s) => ({ offset: s.offset, color: toHex(s.rgba), opacity: Math.round(s.rgba.a * 1000) / 1000 }));
  const emit = (commit: boolean): void => {
    const list = publicStops();
    options.onInput?.(list, angle);
    if (commit) options.onChange?.(list, angle);
  };
  const current = (): Stop => stops.find((s) => s.id === selected) ?? stops[0]!;

  const render = (focus = false): void => {
    el.style.setProperty('--_fill', gradientCss(publicStops(), 90));
    el.style.setProperty('--_gradient', gradientCss(publicStops(), angle));
    const sorted = [...stops].sort((a, b) => a.offset - b.offset);
    const existing = new Map([...handles.children].map((c) => [(c as HTMLElement).dataset.stop!, c as HTMLElement]));
    const keep = new Set<string>();
    sorted.forEach((s, i) => {
      keep.add(s.id);
      let btn = existing.get(s.id);
      if (!btn) {
        btn = h('div', { class: 'mh-gradient-editor__stop', role: 'slider', 'data-stop': s.id, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-describedby': hint.id }, h('span', { class: 'mh-gradient-editor__chip' }));
        handles.append(btn);
      }
      const hex = toHex(s.rgba);
      btn.style.setProperty('--_at', String(s.offset / 100));
      btn.style.setProperty('--_stop', cssRgba(s.rgba));
      btn.setAttribute('aria-valuenow', String(s.offset));
      btn.setAttribute('aria-valuetext', `${s.offset}%, ${hex}, opacity ${Math.round(s.rgba.a * 100)}%`);
      btn.setAttribute('aria-label', `Stop ${i + 1} of ${sorted.length}`);
      btn.tabIndex = disabled ? -1 : s.id === selected ? 0 : -1;
      btn.classList.toggle('is-selected', s.id === selected);
    });
    for (const [id, node] of existing) if (!keep.has(id)) node.remove();
    const sel = current();
    position.value = String(sel.offset);
    remove.disabled = disabled || stops.length <= 2;
    if (angleInput) angleInput.value = String(Math.round(angle));
    picker.setValue(toHex(sel.rgba, true));
    if (focus) handles.querySelector<HTMLElement>(`[data-stop="${selected}"]`)?.focus({ preventScroll: true });
  };

  function updateSelectedColor(value: string, commit: boolean): void {
    const rgba = parseHex(value);
    if (!rgba) return;
    current().rgba = rgba;
    render();
    emit(commit);
  }

  const select = (id: string, focus = true): void => {
    selected = id;
    render(focus);
  };
  const moveSelected = (offset: number, commit: boolean): void => {
    current().offset = clampOffset(offset);
    render(true);
    emit(commit);
  };
  const removeSelected = (): void => {
    if (stops.length <= 2) return;
    const sorted = [...stops].sort((a, b) => a.offset - b.offset);
    const i = sorted.findIndex((s) => s.id === selected);
    stops = stops.filter((s) => s.id !== selected);
    selected = (sorted[i + 1] ?? sorted[i - 1])!.id;
    render(true);
    emit(true);
  };
  const addAt = (offset: number): void => {
    const at = gradientColorAt(publicStops(), offset);
    const stop: Stop = { id: uid('mh-stop'), offset: clampOffset(offset), rgba: { ...parseHex(at.color)!, a: at.opacity } };
    stops = [...stops, stop];
    select(stop.id);
    emit(true);
  };

  const offsetFromPointer = (e: PointerEvent): number => {
    const r = track.getBoundingClientRect();
    if (r.width === 0) return current().offset;
    const x = (e.clientX - r.left) / r.width;
    return clampOffset((getComputedStyle(el).direction === 'rtl' ? 1 - x : x) * 100);
  };
  let dragging: string | null = null;
  track.addEventListener('pointerdown', (e) => {
    if (disabled || e.button !== 0) return;
    e.preventDefault();
    const stopEl = (e.target as Element).closest<HTMLElement>('.mh-gradient-editor__stop');
    if (stopEl?.dataset.stop) {
      select(stopEl.dataset.stop);
      dragging = stopEl.dataset.stop;
      track.setPointerCapture?.(e.pointerId);
      track.classList.add('is-dragging');
    } else addAt(offsetFromPointer(e));
  });
  track.addEventListener('pointermove', (e) => {
    if (dragging) moveSelected(offsetFromPointer(e), false);
  });
  const endDrag = (): void => {
    if (!dragging) return;
    dragging = null;
    track.classList.remove('is-dragging');
    emit(true);
  };
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);

  handles.addEventListener('focusin', (e) => {
    const id = (e.target as HTMLElement).dataset.stop;
    if (id && id !== selected) select(id, false);
  });
  handles.addEventListener('keydown', (e) => {
    if (disabled) return;
    const sel = current();
    const step = e.shiftKey ? 10 : 1;
    const rtl = getComputedStyle(el).direction === 'rtl';
    const sorted = [...stops].sort((a, b) => a.offset - b.offset);
    const i = sorted.findIndex((s) => s.id === sel.id);
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        moveSelected(sel.offset + (e.key === 'ArrowLeft' && rtl ? step : -step), true);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        moveSelected(sel.offset + (e.key === 'ArrowRight' && rtl ? -step : step), true);
        break;
      case 'Home':
        moveSelected(0, true);
        break;
      case 'End':
        moveSelected(100, true);
        break;
      case 'PageUp':
      case 'PageDown': {
        // Page keys step the selection to the neighbouring stop.
        const next = sorted[i + (e.key === 'PageUp' ? 1 : -1)];
        if (next) select(next.id);
        break;
      }
      case 'Delete':
      case 'Backspace':
        removeSelected();
        break;
      default:
        return;
    }
    e.preventDefault();
  });

  position.addEventListener('change', () => {
    const n = Number(position.value);
    if (position.value !== '' && Number.isFinite(n)) {
      current().offset = clampOffset(n);
      render();
      emit(true);
    } else render();
  });
  remove.addEventListener('click', removeSelected);
  add.addEventListener('click', () => {
    // Halfway to the next stop along, or to the previous one from the last stop.
    const sorted = [...stops].sort((a, b) => a.offset - b.offset);
    const i = sorted.findIndex((s) => s.id === selected);
    const a = sorted[i]!;
    const b = sorted[i + 1] ?? sorted[i - 1]!;
    addAt((a.offset + b.offset) / 2);
  });
  angleInput?.addEventListener('change', () => {
    const n = Number(angleInput.value);
    if (angleInput.value !== '' && Number.isFinite(n)) {
      angle = ((n % 360) + 360) % 360;
      emit(true);
    }
    render();
  });

  render();
  const handle: GradientEditorHandle = {
    el,
    picker,
    getStops: publicStops,
    setStops(list) {
      stops = toStops(list);
      selected = stops[0]!.id;
      render();
    },
    getAngle: () => angle,
    setAngle(value) {
      angle = value;
      render();
    },
    css: () => gradientCss(publicStops(), angle),
    setDisabled(value) {
      disabled = value;
      el.classList.toggle('is-disabled', value);
      position.disabled = value;
      add.disabled = value;
      if (angleInput) angleInput.disabled = value;
      picker.setDisabled(value);
      render();
    },
  };
  if (options.disabled) handle.setDisabled(true);
  return handle;
}
