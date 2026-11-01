import { mdiCalendarBlankOutline, mdiChevronDown } from '@mdi/js';
import { buttonClass } from '../actions/button.ts';
import { cx, h, uid } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';
import { createField, type FieldHandle } from '../text-inputs/field.ts';
import { inputAdornment, inputClass, type InputSize } from '../text-inputs/textField.ts';
import { createCalendar, type CalendarHandle } from './calendar.ts';
import { clampDate, formatDate, inBounds, todayIso, type IsoDate, type Weekday } from './dates.ts';
import { createPickerPopover, type PickerPopoverHandle } from './popover.ts';

export interface PickerTriggerParts {
  el: HTMLButtonElement;
  value: HTMLSpanElement;
}

/** CSS classes of the button that shows a picked value and opens its popover. */
export function pickerTriggerClass(size: InputSize = 'medium'): string {
  return inputClass(size, 'mh-picker-trigger');
}

/** `.mh-input.mh-picker-trigger`: an input-looking button with a leading icon, the value and a chevron. */
export function createPickerTrigger(icon: IconName | string, size?: InputSize): PickerTriggerParts {
  const value = h('span', { class: 'mh-picker-trigger__value', id: uid('mh-picker-value') });
  const el = h('button', { type: 'button', class: pickerTriggerClass(size) }, inputAdornment(createIcon(icon)), value, inputAdornment(createIcon(mdiChevronDown, { class: 'mh-picker-trigger__chevron' }), true));
  return { el, value };
}

/** Labels the trigger with the field label followed by the value, so both are read. */
export function labelTrigger(trigger: PickerTriggerParts, field: FieldHandle | null, ariaLabel: string | undefined): void {
  if (field) trigger.el.setAttribute('aria-labelledby', `${field.label.id} ${trigger.value.id}`);
  else if (ariaLabel) {
    const hidden = h('span', { class: 'mh-visually-hidden', id: uid('mh-picker-name') }, ariaLabel);
    trigger.el.prepend(hidden);
    trigger.el.setAttribute('aria-labelledby', `${hidden.id} ${trigger.value.id}`);
  }
}

export interface DatePickerOptions {
  /** Visible label. Without one, pass `ariaLabel`; the picker then renders the button alone. */
  label?: string;
  ariaLabel?: string;
  value?: IsoDate | null;
  /** Shown while nothing is picked (default "Choose a date"). */
  placeholder?: string;
  min?: IsoDate | null;
  max?: IsoDate | null;
  isDateDisabled?: (date: IsoDate) => boolean;
  locale?: string;
  weekStartsOn?: Weekday;
  /** How the picked date is written on the button (default the locale's medium date). */
  format?: Intl.DateTimeFormatOptions;
  /** Adds a Clear button to the popover. */
  clearable?: boolean;
  /** Adds a Today button to the popover (default true). */
  showToday?: boolean;
  /** Submits the ISO date with forms through a hidden input. */
  name?: string;
  helper?: string;
  error?: string;
  size?: InputSize;
  labelStyle?: 'label' | 'eyebrow';
  disabled?: boolean;
  /** Portals the popover into the nearest `[data-mh-theme]` ancestor of this element. */
  container?: HTMLElement | null;
  onChange?: (value: IsoDate | null) => void;
}

export interface DatePickerHandle {
  el: HTMLElement;
  trigger: HTMLButtonElement;
  calendar: CalendarHandle;
  popover: PickerPopoverHandle;
  field: FieldHandle | null;
  getValue(): IsoDate | null;
  setValue(value: IsoDate | null): void;
  open(): void;
  close(): void;
  setError(text: string | undefined): void;
  setDisabled(disabled: boolean): void;
  destroy(): void;
}

/**
 * `.mh-date-picker`: an input-looking button (`.mh-picker-trigger`) that opens a `.mh-picker-popover` with a
 * `.mh-calendar` and optional Today and Clear buttons. Picking a date closes the popover back to the button. The
 * value is an ISO date (`YYYY-MM-DD`), free of time zones.
 */
export function createDatePicker(options: DatePickerOptions = {}): DatePickerHandle {
  const locale = options.locale;
  let value: IsoDate | null = options.value ?? null;
  const trigger = createPickerTrigger(mdiCalendarBlankOutline, options.size);
  const hidden = options.name ? h('input', { type: 'hidden', name: options.name }) : null;
  const root = h('div', { class: 'mh-date-picker' }, trigger.el, hidden);

  const calendar = createCalendar({
    value,
    min: options.min,
    max: options.max,
    isDateDisabled: options.isDateDisabled,
    locale,
    weekStartsOn: options.weekStartsOn,
    label: options.label ?? options.ariaLabel,
    onSelect: (date) => {
      commit(date);
      popover.close(true);
    },
  });

  const today = todayIso();
  const todayOk = inBounds(today, options.min, options.max) && !(options.isDateDisabled?.(today) ?? false);
  const footerButtons: HTMLButtonElement[] = [];
  if (options.showToday ?? true) {
    const b = h('button', { type: 'button', class: cx(buttonClass('text', 'small'), 'mh-picker-popover__today') }, h('span', { class: 'mh-button__label' }, 'Today'));
    b.disabled = !todayOk;
    b.addEventListener('click', () => {
      commit(today);
      popover.close(true);
    });
    footerButtons.push(b);
  }
  if (options.clearable) {
    const b = h('button', { type: 'button', class: cx(buttonClass('text', 'small'), 'mh-picker-popover__clear') }, h('span', { class: 'mh-button__label' }, 'Clear'));
    b.addEventListener('click', () => {
      commit(null);
      popover.close(true);
    });
    footerButtons.push(b);
  }
  const footer = footerButtons.length ? h('div', { class: 'mh-picker-popover__footer' }, ...footerButtons) : null;

  const popover = createPickerPopover({
    anchor: trigger.el,
    label: options.label ?? options.ariaLabel ?? 'Choose a date',
    content: footer ? [calendar.el, footer] : [calendar.el],
    container: options.container,
    onOpen: () => calendar.showMonth(clampDate(value ?? today, options.min, options.max)),
    initialFocus: () => calendar.focus(),
  });

  const field = options.label
    ? createField({ label: options.label, control: root, target: trigger.el, helper: options.helper, error: options.error, labelStyle: options.labelStyle })
    : null;
  labelTrigger(trigger, field, options.ariaLabel);

  const sync = (): void => {
    trigger.value.textContent = value ? formatDate(value, locale, options.format) : (options.placeholder ?? 'Choose a date');
    trigger.el.classList.toggle('is-empty', !value);
    if (hidden) hidden.value = value ?? '';
  };
  function commit(next: IsoDate | null): void {
    const changed = next !== value;
    value = next;
    calendar.setValue(next);
    sync();
    if (changed) options.onChange?.(next);
  }
  trigger.el.addEventListener('click', () => (popover.isOpen() ? popover.close(true) : popover.open()));
  trigger.el.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' && e.altKey) {
      e.preventDefault();
      popover.open();
    }
  });
  sync();

  const handle: DatePickerHandle = {
    el: field?.el ?? root,
    trigger: trigger.el,
    calendar,
    popover,
    field,
    getValue: () => value,
    setValue(next) {
      value = next;
      calendar.setValue(next);
      sync();
    },
    open: () => popover.open(),
    close: () => popover.close(true),
    setError: (text) => field?.setError(text),
    setDisabled(disabled) {
      if (disabled) popover.close(false);
      trigger.el.disabled = disabled;
      trigger.el.classList.toggle('is-disabled', disabled);
      field?.setDisabled(disabled);
    },
    destroy: () => popover.destroy(),
  };
  if (options.disabled) handle.setDisabled(true);
  return handle;
}
