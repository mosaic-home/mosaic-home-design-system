import { mdiLinkVariant, mdiLinkVariantOff } from '@mdi/js';
import { h, uid } from '../dom.ts';
import { createIcon } from '../icons.ts';
import { iconButtonClass } from '../actions/iconButton.ts';
import { trimNumber } from './timecode.ts';

/** A box: top-left corner, size and rotation in degrees (clockwise), before rotation. */
export interface TransformValue {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
}

export type TransformField = keyof TransformValue;

export type ReferencePoint = 'top-left' | 'top' | 'top-right' | 'left' | 'center' | 'right' | 'bottom-left' | 'bottom' | 'bottom-right';

/** The nine reference points, in reading order. */
export const REFERENCE_POINTS: readonly ReferencePoint[] = ['top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right'];

export const REFERENCE_POINT_NAMES: Record<ReferencePoint, string> = {
  'top-left': 'Top left',
  top: 'Top',
  'top-right': 'Top right',
  left: 'Left',
  center: 'Centre',
  right: 'Right',
  'bottom-left': 'Bottom left',
  bottom: 'Bottom',
  'bottom-right': 'Bottom right',
};

export interface TransformLabels {
  reference: string;
  lock: string;
  x: string;
  y: string;
  width: string;
  height: string;
  angle: string;
}

export const TRANSFORM_LABELS: TransformLabels = {
  reference: 'Reference point',
  lock: 'Keep proportions',
  x: 'X position',
  y: 'Y position',
  width: 'Width',
  height: 'Height',
  angle: 'Rotation',
};

/** The short names shown beside each field. */
export const TRANSFORM_SHORT: Record<TransformField, string> = { x: 'X', y: 'Y', width: 'W', height: 'H', angle: '∠' };
export const TRANSFORM_FIELDS: readonly TransformField[] = ['x', 'y', 'width', 'height', 'angle'];

/** Where a reference point sits on the box, 0 to 1 across and down. */
export function referenceFraction(ref: ReferencePoint): { fx: number; fy: number } {
  const i = REFERENCE_POINTS.indexOf(ref);
  const at = i < 0 ? 0 : i;
  return { fx: (at % 3) / 2, fy: Math.floor(at / 3) / 2 };
}

/** An angle in (-180, 180]. */
export function normaliseAngle(angle: number): number {
  if (!Number.isFinite(angle)) return 0;
  let a = angle % 360;
  if (a > 180) a -= 360;
  if (a <= -180) a += 360;
  return a;
}

/** What the fields show: X and Y are the reference point's position. */
export function transformShown(value: TransformValue, ref: ReferencePoint): TransformValue {
  const { fx, fy } = referenceFraction(ref);
  return { x: value.x + fx * value.width, y: value.y + fy * value.height, width: value.width, height: value.height, angle: normaliseAngle(value.angle) };
}

/**
 * The box after one field is set to `n` (as shown, relative to `ref`). A new size keeps the reference point in
 * place; with `lockAspect` the other side follows.
 */
export function applyTransformField(value: TransformValue, field: TransformField, n: number, ref: ReferencePoint, lockAspect = false): TransformValue {
  if (!Number.isFinite(n)) return value;
  const { fx, fy } = referenceFraction(ref);
  const ax = value.x + fx * value.width;
  const ay = value.y + fy * value.height;
  switch (field) {
    case 'x':
      return { ...value, x: n - fx * value.width };
    case 'y':
      return { ...value, y: n - fy * value.height };
    case 'angle':
      return { ...value, angle: normaliseAngle(n) };
    case 'width':
    case 'height': {
      let width = value.width;
      let height = value.height;
      if (field === 'width') {
        width = Math.max(0, n);
        if (lockAspect && value.width > 0) height = (value.height * width) / value.width;
      } else {
        height = Math.max(0, n);
        if (lockAspect && value.height > 0) width = (value.width * height) / value.height;
      }
      return { ...value, width, height, x: ax - fx * width, y: ay - fy * height };
    }
  }
}

export interface TransformFieldsOptions {
  /** Accessible name of the group ("Transform"). */
  label?: string;
  value: TransformValue;
  reference?: ReferencePoint;
  lockAspect?: boolean;
  /** Unit after X, Y, W and H (default `px`). */
  unit?: string;
  /** Arrow-key step (default 1; Shift for ten). */
  step?: number;
  /** Decimals shown (default 2, trailing zeros dropped). */
  decimals?: number;
  disabled?: boolean;
  labels?: Partial<TransformLabels>;
  onChange?: (value: TransformValue, field: TransformField) => void;
  onReferenceChange?: (reference: ReferencePoint) => void;
  onLockAspectChange?: (lockAspect: boolean) => void;
}

export interface TransformFieldsHandle {
  el: HTMLFieldSetElement;
  getValue(): TransformValue;
  setValue(value: TransformValue): void;
  setReference(reference: ReferencePoint): void;
  setDisabled(disabled: boolean): void;
}

/** Pixels of drag per step when scrubbing a field's name. */
export const SCRUB_PX = 2;

/** The value after a key press in a field, or null for keys the field leaves alone. */
export function transformKeyStep(key: string, shift: boolean, current: number, step: number): number | null {
  const k = shift ? step * 10 : step;
  if (key === 'ArrowUp') return current + k;
  if (key === 'ArrowDown') return current - k;
  return null;
}

/**
 * `.mh-transform`: a `<fieldset>` with a 3 x 3 reference-point grid (`__anchor`, native radios `__point`) and
 * number fields for X, Y, W, H and rotation (`__field` with `__name`, `__input`, `__unit`), plus a keep-proportions
 * toggle (`__lock`, `aria-pressed`) between W and H. X and Y are the reference point's position; resizing keeps
 * that point still. Fields commit on Enter or blur; Up / Down step (Shift for ten); dragging a field's name
 * scrubs its value.
 */
export function createTransformFields(options: TransformFieldsOptions): TransformFieldsHandle {
  const labels = { ...TRANSFORM_LABELS, ...options.labels };
  const unit = options.unit ?? 'px';
  const step = options.step ?? 1;
  const decimals = options.decimals ?? 2;
  let value = { ...options.value };
  let ref: ReferencePoint = options.reference ?? 'top-left';
  let lock = options.lockAspect ?? false;
  const name = uid('mh-transform-ref');

  const radios = REFERENCE_POINTS.map((p) => {
    const input = h('input', { type: 'radio', class: 'mh-transform__radio', name, value: p, 'aria-label': REFERENCE_POINT_NAMES[p] });
    input.addEventListener('change', () => {
      if (!input.checked) return;
      ref = p;
      render();
      options.onReferenceChange?.(ref);
    });
    return { p, input, el: h('label', { class: 'mh-transform__point', title: REFERENCE_POINT_NAMES[p] }, input, h('span', { class: 'mh-transform__dot', 'aria-hidden': 'true' })) };
  });
  const anchor = h('fieldset', { class: 'mh-transform__anchor' }, h('legend', { class: 'mh-visually-hidden' }, labels.reference), h('div', { class: 'mh-transform__grid' }, ...radios.map((r) => r.el)));

  const commit = (field: TransformField, n: number): void => {
    const next = applyTransformField(value, field, n, ref, lock);
    value = next;
    render();
    options.onChange?.({ ...value }, field);
  };

  const inputs = {} as Record<TransformField, HTMLInputElement>;
  const field = (f: TransformField): HTMLLabelElement => {
    const input = h('input', { type: 'number', class: 'mh-transform__input', inputmode: 'decimal', step: 'any', 'aria-label': labels[f], min: f === 'width' || f === 'height' ? 0 : undefined });
    inputs[f] = input;
    input.addEventListener('change', () => {
      const n = Number.parseFloat(input.value);
      if (Number.isFinite(n) && trimNumber(n, decimals) !== trimNumber(transformShown(value, ref)[f], decimals)) commit(f, n);
      else render();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        input.dispatchEvent(new Event('change'));
        return;
      }
      const n = transformKeyStep(e.key, e.shiftKey, transformShown(value, ref)[f], step);
      if (n === null) return;
      e.preventDefault();
      commit(f, n);
    });
    const short = h('span', { class: 'mh-transform__name', 'aria-hidden': 'true' }, TRANSFORM_SHORT[f]);
    attachTransformScrub(short, () => !el.disabled, () => transformShown(value, ref)[f], step, (n) => commit(f, n));
    return h('label', { class: `mh-transform__field mh-transform__field--${f}` }, short, input, h('span', { class: 'mh-transform__unit', 'aria-hidden': 'true' }, f === 'angle' ? '°' : unit));
  };

  const lockButton = h('button', { type: 'button', class: `${iconButtonClass('default', 'small')} mh-transform__lock`, 'aria-label': labels.lock, title: labels.lock });
  lockButton.addEventListener('click', () => {
    lock = !lock;
    render();
    options.onLockAspectChange?.(lock);
  });

  const el = h(
    'fieldset',
    { class: 'mh-transform' },
    h('legend', { class: 'mh-visually-hidden' }, options.label ?? 'Transform'),
    anchor,
    h('div', { class: 'mh-transform__fields' }, field('x'), field('y'), field('width'), lockButton, field('height'), field('angle')),
  );

  function render(): void {
    const shown = transformShown(value, ref);
    for (const f of TRANSFORM_FIELDS) inputs[f].value = trimNumber(shown[f], decimals);
    for (const r of radios) r.input.checked = r.p === ref;
    lockButton.setAttribute('aria-pressed', String(lock));
    lockButton.replaceChildren(createIcon(lock ? mdiLinkVariant : mdiLinkVariantOff));
  }
  el.disabled = options.disabled ?? false;
  render();

  return {
    el,
    getValue: () => ({ ...value }),
    setValue(next) {
      value = { ...next };
      render();
    },
    setReference(next) {
      ref = next;
      render();
    },
    setDisabled(disabled) {
      el.disabled = disabled;
    },
  };
}

/** Dragging `handle` left / right changes a number by `step` every few pixels (Shift for ten). Returns a detach. */
export function attachTransformScrub(handle: HTMLElement, enabled: () => boolean, read: () => number, step: number, write: (n: number) => void): () => void {
  let start: { x: number; value: number; id: number } | null = null;
  const down = (e: PointerEvent): void => {
    if (!enabled() || (e.pointerType === 'mouse' && e.button !== 0)) return;
    start = { x: e.clientX, value: read(), id: e.pointerId };
    try {
      handle.setPointerCapture(e.pointerId);
    } catch {
      // Capture is optional.
    }
    e.preventDefault();
  };
  const move = (e: PointerEvent): void => {
    if (!start || start.id !== e.pointerId) return;
    const steps = Math.trunc((e.clientX - start.x) / SCRUB_PX);
    const next = start.value + steps * step * (e.shiftKey ? 10 : 1);
    if (next !== read()) write(next);
  };
  const up = (e: PointerEvent): void => {
    if (start?.id === e.pointerId) start = null;
  };
  handle.addEventListener('pointerdown', down);
  handle.addEventListener('pointermove', move);
  handle.addEventListener('pointerup', up);
  handle.addEventListener('pointercancel', up);
  return () => {
    handle.removeEventListener('pointerdown', down);
    handle.removeEventListener('pointermove', move);
    handle.removeEventListener('pointerup', up);
    handle.removeEventListener('pointercancel', up);
  };
}
