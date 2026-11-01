import { mdiCalendarBlankOutline } from '@mdi/js';
import { cx, h } from '../dom.ts';
import { createField, type FieldHandle } from '../text-inputs/field.ts';
import type { InputSize } from '../text-inputs/textField.ts';
import { buttonClass } from '../actions/button.ts';
import { createCalendar, type CalendarHandle } from './calendar.ts';
import { clampDate, formatDate, formatDateRange, todayIso, type DateRange, type IsoDate, type Weekday } from './dates.ts';
import { createPickerTrigger, labelTrigger } from './datePicker.ts';
import { createPickerPopover, type PickerPopoverHandle } from './popover.ts';

/** A complete range: both ends picked. */
export interface CompleteDateRange {
  start: IsoDate;
  end: IsoDate;
}

export interface DateRangePreset {
  label: string;
  range: CompleteDateRange;
}

export interface DateRangePickerOptions {
  /** Visible label. Without one, pass `ariaLabel`; the picker then renders the button alone. */
  label?: string;
  ariaLabel?: string;
  value?: CompleteDateRange | null;
  /** Shown while nothing is picked (default "Choose dates"). */
  placeholder?: string;
  min?: IsoDate | null;
  max?: IsoDate | null;
  isDateDisabled?: (date: IsoDate) => boolean;
  locale?: string;
  weekStartsOn?: Weekday;
  /** Months side by side in the popover (default 2; one on narrow screens is up to the caller). */
  months?: number;
  /** Quick choices beside the calendar, e.g. "Last 7 days". */
  presets?: readonly DateRangePreset[];
  /** How each end is written on the button (default the locale's medium date). */
  format?: Intl.DateTimeFormatOptions;
  /** Adds a Clear button to the popover. */
  clearable?: boolean;
  /** Submits `<name>-start` and `<name>-end` with forms through hidden inputs. */
  name?: string;
  helper?: string;
  error?: string;
  size?: InputSize;
  labelStyle?: 'label' | 'eyebrow';
  disabled?: boolean;
  container?: HTMLElement | null;
  onChange?: (value: CompleteDateRange | null) => void;
}

export interface DateRangePickerHandle {
  el: HTMLElement;
  trigger: HTMLButtonElement;
  calendar: CalendarHandle;
  popover: PickerPopoverHandle;
  field: FieldHandle | null;
  getValue(): CompleteDateRange | null;
  setValue(value: CompleteDateRange | null): void;
  open(): void;
  close(): void;
  setError(text: string | undefined): void;
  setDisabled(disabled: boolean): void;
  destroy(): void;
}

/** Days in a range, both ends included. */
export function rangeLength(range: CompleteDateRange): number {
  const a = Date.parse(`${range.start}T00:00:00Z`);
  const b = Date.parse(`${range.end}T00:00:00Z`);
  return Math.round(Math.abs(b - a) / 86_400_000) + 1;
}

/**
 * `.mh-date-range-picker`: a `.mh-picker-trigger` button that opens a popover with one or more month grids in
 * range mode: the first press picks the start, the second the end (in either order), and the popover closes. A
 * status line says what to pick next; optional presets sit beside the calendar.
 */
export function createDateRangePicker(options: DateRangePickerOptions = {}): DateRangePickerHandle {
  const locale = options.locale;
  let value: CompleteDateRange | null = options.value ?? null;
  const trigger = createPickerTrigger(mdiCalendarBlankOutline, options.size);
  const hiddenStart = options.name ? h('input', { type: 'hidden', name: `${options.name}-start` }) : null;
  const hiddenEnd = options.name ? h('input', { type: 'hidden', name: `${options.name}-end` }) : null;
  const root = h('div', { class: 'mh-date-range-picker' }, trigger.el, hiddenStart, hiddenEnd);
  const status = h('p', { class: 'mh-picker-popover__status', 'aria-live': 'polite' });

  const calendar = createCalendar({
    mode: 'range',
    range: value,
    min: options.min,
    max: options.max,
    isDateDisabled: options.isDateDisabled,
    locale,
    weekStartsOn: options.weekStartsOn,
    months: options.months ?? 2,
    label: options.label ?? options.ariaLabel,
    onRangeChange: (range) => {
      if (range.end) {
        commit({ start: range.start, end: range.end });
        popover.close(true);
      } else showStatus(range);
    },
  });

  const showStatus = (range: DateRange | null): void => {
    status.textContent = range && !range.end ? `From ${formatDate(range.start, locale)}. Now pick the end date.` : 'Pick the start date.';
  };

  const presets = options.presets?.length
    ? h(
        'div',
        { class: 'mh-picker-popover__presets', role: 'group', 'aria-label': 'Presets' },
        ...options.presets.map((p) => {
          const b = h('button', { type: 'button', class: cx(buttonClass('text', 'small'), 'mh-picker-popover__preset') }, h('span', { class: 'mh-button__label' }, p.label));
          b.addEventListener('click', () => {
            commit({ ...p.range });
            popover.close(true);
          });
          return b;
        }),
      )
    : null;
  const clear = options.clearable ? h('button', { type: 'button', class: cx(buttonClass('text', 'small'), 'mh-picker-popover__clear') }, h('span', { class: 'mh-button__label' }, 'Clear')) : null;
  clear?.addEventListener('click', () => {
    commit(null);
    popover.close(true);
  });
  const footer = h('div', { class: 'mh-picker-popover__footer' }, status, clear);
  const body = h('div', { class: cx('mh-picker-popover__body', presets && 'mh-picker-popover__body--presets') }, presets, calendar.el);

  const popover = createPickerPopover({
    anchor: trigger.el,
    label: options.label ?? options.ariaLabel ?? 'Choose dates',
    content: [body, footer],
    container: options.container,
    onOpen: () => {
      calendar.setRange(value);
      calendar.showMonth(clampDate(value?.start ?? todayIso(), options.min, options.max));
      showStatus(null);
    },
    initialFocus: () => calendar.focus(),
  });

  const field = options.label
    ? createField({ label: options.label, control: root, target: trigger.el, helper: options.helper, error: options.error, labelStyle: options.labelStyle })
    : null;
  labelTrigger(trigger, field, options.ariaLabel);

  const sync = (): void => {
    trigger.value.textContent = value ? formatDateRange(value.start, value.end, locale, options.format) : (options.placeholder ?? 'Choose dates');
    trigger.el.classList.toggle('is-empty', !value);
    if (hiddenStart) hiddenStart.value = value?.start ?? '';
    if (hiddenEnd) hiddenEnd.value = value?.end ?? '';
  };
  function commit(next: CompleteDateRange | null): void {
    const changed = next?.start !== value?.start || next?.end !== value?.end;
    value = next;
    calendar.setRange(next);
    sync();
    if (changed) options.onChange?.(next ? { ...next } : null);
  }
  trigger.el.addEventListener('click', () => (popover.isOpen() ? popover.close(true) : popover.open()));
  trigger.el.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' && e.altKey) {
      e.preventDefault();
      popover.open();
    }
  });
  sync();

  const handle: DateRangePickerHandle = {
    el: field?.el ?? root,
    trigger: trigger.el,
    calendar,
    popover,
    field,
    getValue: () => (value ? { ...value } : null),
    setValue(next) {
      value = next ? { ...next } : null;
      calendar.setRange(value);
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
