import { cx, h, uid } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';

export interface SegmentOption {
  value: string;
  label: string;
  icon?: IconName | string;
  /** Show only the icon; `label` becomes the accessible name. */
  iconOnly?: boolean;
  disabled?: boolean;
}

export interface SegmentedControlOptions {
  /** Accessible name of the group. */
  label: string;
  options: readonly SegmentOption[];
  value?: string;
  name?: string;
  size?: 'small' | 'medium';
  /** Stretch to the container, segments sharing the width. */
  fullWidth?: boolean;
  disabled?: boolean;
  onChange?: (value: string, event: Event) => void;
}

export interface SegmentedControlHandle {
  el: HTMLDivElement;
  inputs: HTMLInputElement[];
  getValue(): string | undefined;
  setValue(value: string): void;
  setDisabled(disabled: boolean): void;
}

/** CSS classes for a segmented control root. */
export function segmentedClass(size: 'small' | 'medium' = 'medium', fullWidth = false): string {
  return cx('mh-segmented', size === 'small' && 'mh-segmented--sm', fullWidth && 'mh-segmented--block');
}

/**
 * `.mh-segmented`: a pill radio group for a few options. Each segment is a native radio under its visible face,
 * so arrow keys move the selection and Tab enters on the chosen one.
 */
export function createSegmentedControl(options: SegmentedControlOptions): SegmentedControlHandle {
  const name = options.name ?? uid('mh-segment');
  const inputs: HTMLInputElement[] = [];
  const segments = options.options.map((o) => {
    const input = h('input', { type: 'radio', class: 'mh-segmented__input', name, value: o.value, 'aria-label': o.iconOnly ? o.label : undefined });
    input.checked = o.value === options.value;
    input.disabled = o.disabled ?? false;
    inputs.push(input);
    return h(
      'label',
      { class: 'mh-segmented__option', title: o.iconOnly ? o.label : undefined },
      input,
      h('span', { class: 'mh-segmented__face' }, o.icon ? createIcon(o.icon) : null, o.iconOnly ? null : h('span', { class: 'mh-segmented__label' }, o.label)),
    );
  });
  const el = h('div', { class: segmentedClass(options.size, options.fullWidth), role: 'radiogroup', 'aria-label': options.label }, ...segments);
  if (options.onChange) el.addEventListener('change', (event) => options.onChange!((event.target as HTMLInputElement).value, event));
  const handle: SegmentedControlHandle = {
    el,
    inputs,
    getValue: () => inputs.find((i) => i.checked)?.value,
    setValue(value) {
      for (const i of inputs) i.checked = i.value === value;
    },
    setDisabled(disabled) {
      inputs.forEach((i, n) => (i.disabled = disabled || (options.options[n]?.disabled ?? false)));
    },
  };
  if (options.disabled) handle.setDisabled(true);
  return handle;
}
