import { mdiCalendarBlankOutline, mdiCalendarClockOutline, mdiCalendarMonthOutline, mdiCalendarWeekOutline, mdiClockOutline } from '@mdi/js';
import { iconButtonClass } from '../actions/iconButton.ts';
import { cx, h } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';
import { createField, type FieldHandle } from '../text-inputs/field.ts';
import { focusOnBoxClick, inputClass, type InputSize } from '../text-inputs/textField.ts';

export type DateTimeFieldType = 'date' | 'time' | 'datetime-local' | 'month' | 'week';

export interface DateTimeFieldOptions {
  /** Visible label. Without one, pass `ariaLabel`; the field then renders the box alone. */
  label?: string;
  ariaLabel?: string;
  /** Default `date`. */
  type?: DateTimeFieldType;
  /** In the input's own format: `2026-10-16`, `07:30`, `2026-10-16T07:30`, `2026-10`, `2026-W42`. */
  value?: string;
  min?: string;
  max?: string;
  /** In seconds for times (60 = minutes only, 1 = with seconds), days for dates. */
  step?: number;
  name?: string;
  helper?: string;
  error?: string;
  success?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  size?: InputSize;
  labelStyle?: 'label' | 'eyebrow';
  /** The button that opens the platform's picker; `false` leaves only the native control. */
  icon?: IconName | string | false;
  onInput?: (value: string, event: Event) => void;
  onChange?: (value: string, event: Event) => void;
}

export interface DateTimeFieldHandle {
  el: HTMLElement;
  input: HTMLInputElement;
  field: FieldHandle | null;
  getValue(): string;
  setValue(value: string): void;
  setError(text: string | undefined): void;
  setDisabled(disabled: boolean): void;
}

/** The icon of the picker button for an input type. */
export function dateTimeIcon(type: DateTimeFieldType): string {
  switch (type) {
    case 'time':
      return mdiClockOutline;
    case 'datetime-local':
      return mdiCalendarClockOutline;
    case 'month':
      return mdiCalendarMonthOutline;
    case 'week':
      return mdiCalendarWeekOutline;
    default:
      return mdiCalendarBlankOutline;
  }
}

/** Accessible name of the picker button. */
export function dateTimePickerLabel(type: DateTimeFieldType): string {
  return type === 'time' ? 'Open time picker' : 'Open date picker';
}

/** CSS classes of the box. */
export function dateTimeFieldClass(size?: InputSize): string {
  return inputClass(size, 'mh-datetime');
}

/** CSS classes of the picker button inside the box. */
export const DATETIME_BUTTON_CLASS = cx(iconButtonClass('default', 'small'), 'mh-datetime__button');

/** Opens the platform picker where `showPicker` exists; otherwise focuses the input. */
export function openPlatformPicker(input: HTMLInputElement): void {
  input.focus();
  try {
    input.showPicker?.();
  } catch {
    // Not allowed here (read-only, or no user gesture): the focused input still takes typing.
  }
}

/**
 * `.mh-input.mh-datetime`: the platform's date, time, date-and-time, month or week input in the design system's
 * box, inside a `.mh-field`. The platform does the parsing, locale formatting, keyboard entry and picker; the
 * trailing button opens that picker (it stays out of the Tab order, since the input already opens it from the
 * keyboard).
 */
export function createDateTimeField(options: DateTimeFieldOptions = {}): DateTimeFieldHandle {
  const type = options.type ?? 'date';
  const input = h('input', {
    class: 'mh-input__control',
    type,
    name: options.name,
    min: options.min,
    max: options.max,
    step: options.step,
    readonly: options.readOnly,
    'aria-label': options.label ? undefined : options.ariaLabel,
  });
  input.value = options.value ?? '';
  const icon = options.icon === false ? null : (options.icon ?? dateTimeIcon(type));
  const button = icon ? h('button', { type: 'button', class: DATETIME_BUTTON_CLASS, tabindex: -1, 'aria-label': dateTimePickerLabel(type), title: dateTimePickerLabel(type) }, createIcon(icon)) : null;
  button?.addEventListener('click', () => {
    if (!input.disabled && !input.readOnly) openPlatformPicker(input);
  });
  const box = h('div', { class: dateTimeFieldClass(options.size) }, input, button);
  focusOnBoxClick(box, input);

  const field = options.label
    ? createField({ label: options.label, control: box, target: input, helper: options.helper, error: options.error, success: options.success, required: options.required, labelStyle: options.labelStyle })
    : null;
  if (options.onInput) input.addEventListener('input', (e) => options.onInput!(input.value, e));
  if (options.onChange) input.addEventListener('change', (e) => options.onChange!(input.value, e));

  const handle: DateTimeFieldHandle = {
    el: field?.el ?? box,
    input,
    field,
    getValue: () => input.value,
    setValue(value) {
      input.value = value;
    },
    setError: (text) => field?.setError(text),
    setDisabled(disabled) {
      input.disabled = disabled;
      if (button) button.disabled = disabled;
      box.classList.toggle('is-disabled', disabled);
      field?.setDisabled(disabled);
    },
  };
  if (options.disabled) handle.setDisabled(true);
  return handle;
}
