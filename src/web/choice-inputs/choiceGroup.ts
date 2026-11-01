import { cx, h, uid } from '../dom.ts';
import { choiceText, createCheckbox, type CheckboxHandle } from './checkbox.ts';

export interface ChoiceOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

/** CSS classes for a checkbox or radio group (`<fieldset>`). */
export function choiceGroupClass(inline = false): string {
  return cx('mh-choice-group', inline && 'mh-choice-group--inline');
}

/** CSS classes for the group's legend. */
export function choiceLegendClass(hidden = false): string {
  return cx('mh-choice-group__legend', hidden && 'mh-visually-hidden');
}

function fieldset(legend: string, hideLegend: boolean | undefined, inline: boolean | undefined, items: HTMLElement[]): HTMLFieldSetElement {
  return h('fieldset', { class: choiceGroupClass(inline) }, h('legend', { class: choiceLegendClass(hideLegend) }, legend), h('div', { class: 'mh-choice-group__items' }, ...items));
}

export interface RadioGroupOptions {
  /** The question the group answers; the `<legend>`. */
  legend: string;
  /** Keep the legend for screen readers only. */
  hideLegend?: boolean;
  options: readonly ChoiceOption[];
  value?: string;
  /** Form name; one is generated otherwise (radios need a shared name for arrow keys). */
  name?: string;
  /** Options side by side, wrapping. */
  inline?: boolean;
  disabled?: boolean;
  onChange?: (value: string, event: Event) => void;
}

export interface RadioGroupHandle {
  el: HTMLFieldSetElement;
  inputs: HTMLInputElement[];
  getValue(): string | undefined;
  setValue(value: string | undefined): void;
  setDisabled(disabled: boolean): void;
}

/** One `.mh-radio`: native radio, drawn dot, label and description. */
export function createRadio(option: ChoiceOption, name: string, checked: boolean): { el: HTMLLabelElement; input: HTMLInputElement } {
  const input = h('input', { type: 'radio', class: 'mh-radio__input', name, value: option.value });
  input.checked = checked;
  input.disabled = option.disabled ?? false;
  const el = h('label', { class: 'mh-radio' }, h('span', { class: 'mh-radio__control' }, input, h('span', { class: 'mh-radio__dot', 'aria-hidden': 'true' })), choiceText('mh-radio', input, option.label, option.description));
  return { el, input };
}

/**
 * `.mh-choice-group` of `.mh-radio`: native radios in a fieldset, so arrow keys move the choice and Tab enters
 * and leaves the group, as on every platform.
 */
export function createRadioGroup(options: RadioGroupOptions): RadioGroupHandle {
  const name = options.name ?? uid('mh-radio');
  const radios = options.options.map((o) => createRadio(o, name, o.value === options.value));
  const el = fieldset(options.legend, options.hideLegend, options.inline, radios.map((r) => r.el));
  el.disabled = options.disabled ?? false;
  const inputs = radios.map((r) => r.input);
  if (options.onChange) el.addEventListener('change', (event) => options.onChange!((event.target as HTMLInputElement).value, event));
  return {
    el,
    inputs,
    getValue: () => inputs.find((i) => i.checked)?.value,
    setValue(value) {
      for (const i of inputs) i.checked = i.value === value;
    },
    setDisabled(disabled) {
      el.disabled = disabled;
    },
  };
}

export interface CheckboxGroupOptions {
  legend: string;
  hideLegend?: boolean;
  options: readonly ChoiceOption[];
  values?: readonly string[];
  name?: string;
  inline?: boolean;
  disabled?: boolean;
  onChange?: (values: string[], event: Event) => void;
}

export interface CheckboxGroupHandle {
  el: HTMLFieldSetElement;
  checkboxes: CheckboxHandle[];
  getValues(): string[];
  setValues(values: readonly string[]): void;
  setDisabled(disabled: boolean): void;
}

/** `.mh-choice-group` of `.mh-checkbox`: several independent choices under one legend. */
export function createCheckboxGroup(options: CheckboxGroupOptions): CheckboxGroupHandle {
  const values = new Set(options.values ?? []);
  const checkboxes = options.options.map((o) => createCheckbox({ label: o.label, description: o.description, value: o.value, name: options.name, checked: values.has(o.value), disabled: o.disabled }));
  const el = fieldset(options.legend, options.hideLegend, options.inline, checkboxes.map((c) => c.el));
  el.disabled = options.disabled ?? false;
  const getValues = (): string[] => checkboxes.filter((c) => c.isChecked()).map((c) => c.input.value);
  if (options.onChange) el.addEventListener('change', (event) => options.onChange!(getValues(), event));
  return {
    el,
    checkboxes,
    getValues,
    setValues(next) {
      for (const c of checkboxes) c.setChecked(next.includes(c.input.value));
    },
    setDisabled(disabled) {
      el.disabled = disabled;
    },
  };
}
