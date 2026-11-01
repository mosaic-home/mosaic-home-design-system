import { mdiChevronDown, mdiRhombus, mdiRhombusOutline, mdiRhombusSplit } from '@mdi/js';
import { sliderPosition } from '../choice-inputs/slider.ts';
import { cx, h, uid } from '../dom.ts';
import { createIcon } from '../icons.ts';
import { clamp, trimNumber } from './timecode.ts';

/** `off`: no keyframes; `animated`: keyframes elsewhere, none here; `on`: a keyframe at the current time. */
export type KeyframeState = 'off' | 'animated' | 'on';

interface InspectorParamBase {
  id: string;
  label: string;
  /** Shows the keyframe toggle in this state; leave it out for parameters that can't be animated. */
  keyframe?: KeyframeState;
  disabled?: boolean;
}

export interface InspectorSliderParam extends InspectorParamBase {
  kind: 'slider';
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  /** Decimals in the number field (default 2, trailing zeros dropped). */
  decimals?: number;
}

export interface InspectorToggleParam extends InspectorParamBase {
  kind: 'toggle';
  value: boolean;
}

export interface InspectorChoiceParam extends InspectorParamBase {
  kind: 'choice';
  value: string;
  options: readonly { value: string; label: string }[];
}

export type InspectorParam = InspectorSliderParam | InspectorToggleParam | InspectorChoiceParam;
export type InspectorValue = number | boolean | string;

export interface InspectorSection {
  id: string;
  title: string;
  /** Default true. */
  open?: boolean;
  params: readonly InspectorParam[];
}

export interface InspectorOptions {
  /** Accessible name of the panel ("Properties"). */
  label: string;
  sections: readonly InspectorSection[];
  /** A new value; `committed` is false while a slider is being dragged. */
  onChange?: (id: string, value: InspectorValue, committed: boolean) => void;
  /** The keyframe toggle was pressed; `on` is the new state at the current time. */
  onKeyframe?: (id: string, on: boolean) => void;
  onSectionToggle?: (id: string, open: boolean) => void;
}

export interface InspectorHandle {
  el: HTMLDivElement;
  setValue(id: string, value: InspectorValue): void;
  setKeyframe(id: string, state: KeyframeState): void;
  setOpen(sectionId: string, open: boolean): void;
}

/** The keyframe state after a press: a key is added (on) or removed (off; the caller may say `animated`). */
export function nextKeyframe(state: KeyframeState): KeyframeState {
  return state === 'on' ? 'off' : 'on';
}

export function keyframeIcon(state: KeyframeState): string {
  return state === 'on' ? mdiRhombus : state === 'animated' ? mdiRhombusSplit : mdiRhombusOutline;
}

export function keyframeClass(state: KeyframeState): string {
  return cx('mh-inspector__key', state === 'animated' && 'is-animated');
}

export function keyframeLabel(label: string): string {
  return `${label} keyframe`;
}

export function inspectorParamClass(kind: InspectorParam['kind']): string {
  return `mh-inspector__param mh-inspector__param--${kind}`;
}

/** Parses a typed number for a slider parameter, clamped to its range; null when it isn't a number. */
export function parseInspectorNumber(text: string, param: Pick<InspectorSliderParam, 'min' | 'max'>): number | null {
  const n = Number.parseFloat(text.replace(',', '.'));
  if (!Number.isFinite(n)) return null;
  return clamp(n, param.min ?? 0, param.max ?? 100);
}

/**
 * `.mh-inspector`: collapsible sections (native `<details>`: `__section`, `__summary` with `__title` and
 * `__caret`, `__body`) of parameter rows (`__param--slider | --toggle | --choice`). Each row has an optional
 * keyframe toggle (`__key`, `aria-pressed`, `.is-animated` when keyed elsewhere), a label and its control: a range
 * (`.mh-slider__input`) with an exact number field (`__number`, `__unit`), a switch (`.mh-switch`), or a select.
 */
export function createInspector(options: InspectorOptions): InspectorHandle {
  const setters = new Map<string, (v: InspectorValue) => void>();
  const keys = new Map<string, (s: KeyframeState) => void>();
  const sections = new Map<string, HTMLDetailsElement>();

  const keyButton = (p: InspectorParam): HTMLElement => {
    if (p.keyframe === undefined) return h('span', { class: 'mh-inspector__key-space', 'aria-hidden': 'true' });
    let state = p.keyframe;
    const b = h('button', { type: 'button', class: keyframeClass(state), 'aria-label': keyframeLabel(p.label), title: keyframeLabel(p.label) });
    const paint = (): void => {
      b.className = keyframeClass(state);
      b.setAttribute('aria-pressed', String(state === 'on'));
      b.replaceChildren(createIcon(keyframeIcon(state)));
    };
    b.addEventListener('click', () => {
      state = nextKeyframe(state);
      paint();
      options.onKeyframe?.(p.id, state === 'on');
    });
    keys.set(p.id, (s) => {
      state = s;
      paint();
    });
    b.disabled = p.disabled ?? false;
    paint();
    return b;
  };

  const sliderRow = (p: InspectorSliderParam): HTMLElement => {
    const id = uid('mh-inspector');
    const min = p.min ?? 0;
    const max = p.max ?? 100;
    const range = h('input', { type: 'range', class: 'mh-slider__input mh-inspector__range', id, min, max, step: p.step ?? 1 });
    const number = h('input', { type: 'number', class: 'mh-inspector__number', inputmode: 'decimal', min, max, step: p.step ?? 1, 'aria-label': `${p.label} value` });
    range.disabled = number.disabled = p.disabled ?? false;
    let value = p.value;
    const paint = (): void => {
      range.value = String(value);
      range.style.setProperty('--_at', String(sliderPosition(value, min, max)));
      number.value = trimNumber(value, p.decimals ?? 2);
    };
    const set = (v: number, committed: boolean): void => {
      value = clamp(v, min, max);
      paint();
      options.onChange?.(p.id, value, committed);
    };
    range.addEventListener('input', () => set(Number(range.value), false));
    range.addEventListener('change', () => set(Number(range.value), true));
    number.addEventListener('change', () => {
      const n = parseInspectorNumber(number.value, p);
      if (n === null) paint();
      else set(n, true);
    });
    setters.set(p.id, (v) => {
      value = Number(v);
      paint();
    });
    paint();
    return h(
      'div',
      { class: inspectorParamClass('slider') },
      keyButton(p),
      h('label', { class: 'mh-inspector__label', for: id }, p.label),
      range,
      h('span', { class: 'mh-inspector__value' }, number, p.unit ? h('span', { class: 'mh-inspector__unit', 'aria-hidden': 'true' }, p.unit) : null),
    );
  };

  const toggleRow = (p: InspectorToggleParam): HTMLElement => {
    const labelId = uid('mh-inspector');
    const input = h('input', { type: 'checkbox', role: 'switch', class: 'mh-switch__input', 'aria-labelledby': labelId });
    input.checked = p.value;
    input.disabled = p.disabled ?? false;
    input.addEventListener('change', () => options.onChange?.(p.id, input.checked, true));
    setters.set(p.id, (v) => {
      input.checked = Boolean(v);
    });
    return h(
      'div',
      { class: inspectorParamClass('toggle') },
      keyButton(p),
      h('span', { class: 'mh-inspector__label', id: labelId }, p.label),
      h('label', { class: 'mh-switch mh-inspector__switch' }, h('span', { class: 'mh-switch__control' }, input, h('span', { class: 'mh-switch__thumb', 'aria-hidden': 'true' }))),
    );
  };

  const choiceRow = (p: InspectorChoiceParam): HTMLElement => {
    const id = uid('mh-inspector');
    const select = h('select', { class: 'mh-inspector__select', id }, ...p.options.map((o) => h('option', { value: o.value }, o.label)));
    select.value = p.value;
    select.disabled = p.disabled ?? false;
    select.addEventListener('change', () => options.onChange?.(p.id, select.value, true));
    setters.set(p.id, (v) => {
      select.value = String(v);
    });
    return h(
      'div',
      { class: inspectorParamClass('choice') },
      keyButton(p),
      h('label', { class: 'mh-inspector__label', for: id }, p.label),
      h('span', { class: 'mh-inspector__choice' }, select, createIcon(mdiChevronDown, { class: 'mh-inspector__chevron' })),
    );
  };

  const row = (p: InspectorParam): HTMLElement => (p.kind === 'slider' ? sliderRow(p) : p.kind === 'toggle' ? toggleRow(p) : choiceRow(p));

  const el = h(
    'div',
    { class: 'mh-inspector', role: 'group', 'aria-label': options.label },
    ...options.sections.map((s) => {
      const details = h(
        'details',
        { class: 'mh-inspector__section', open: s.open !== false },
        h('summary', { class: 'mh-inspector__summary' }, h('span', { class: 'mh-inspector__title' }, s.title), createIcon(mdiChevronDown, { class: 'mh-inspector__caret' })),
        h('div', { class: 'mh-inspector__body' }, ...s.params.map(row)),
      );
      details.addEventListener('toggle', () => options.onSectionToggle?.(s.id, details.open));
      sections.set(s.id, details);
      return details;
    }),
  );

  return {
    el,
    setValue: (id, v) => setters.get(id)?.(v),
    setKeyframe: (id, s) => keys.get(id)?.(s),
    setOpen(id, open) {
      const d = sections.get(id);
      if (d) d.open = open;
    },
  };
}
