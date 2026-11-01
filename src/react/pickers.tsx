// React bindings for the pickers group. The date & time field is plain markup with a controlled native input; the
// calendar, popover pickers, colour, gradient, icon and file widgets build the web renderer's handle in an effect
// (their DOM is exactly the web renderer's), inside a `display: contents` host.
import { useEffect, useRef, type ChangeEvent, type InputHTMLAttributes, type MouseEvent, type RefObject } from 'react';
import { cx } from '../web/dom.ts';
import type { IconName } from '../web/icons.ts';
import { createCalendar, type CalendarHandle, type CalendarOptions } from '../web/pickers/calendar.ts';
import { createColorPicker, type ColorPickerHandle, type ColorPickerOptions } from '../web/pickers/colorPicker.ts';
import { createDatePicker, type DatePickerHandle, type DatePickerOptions } from '../web/pickers/datePicker.ts';
import { createDateRangePicker, type CompleteDateRange, type DateRangePickerHandle, type DateRangePickerOptions } from '../web/pickers/dateRangePicker.ts';
import type { DateRange, IsoDate } from '../web/pickers/dates.ts';
import { DATETIME_BUTTON_CLASS, dateTimeFieldClass, dateTimeIcon, dateTimePickerLabel, openPlatformPicker, type DateTimeFieldType } from '../web/pickers/dateTimeField.ts';
import { createFileDropZone, type FileDropZoneHandle, type FileDropZoneOptions } from '../web/pickers/fileDropZone.ts';
import { createGradientEditor, normalizeStops, type GradientEditorHandle, type GradientEditorOptions, type GradientStop } from '../web/pickers/gradientEditor.ts';
import { createIconPicker, type IconPickerHandle, type IconPickerOptions } from '../web/pickers/iconPicker.ts';
import type { InputSize } from '../web/text-inputs/textField.ts';
import { Icon } from './foundations.tsx';
import { Field } from './text-inputs.tsx';

/** The host element imperative pickers render into; it adds no box. */
function Host({ hostRef, className }: { hostRef: RefObject<HTMLDivElement | null>; className?: string }) {
  return <div ref={hostRef} className={cx('mh-picker-host', className)} />;
}

/** A stable key for an option that is an array or object, so inline literals don't rebuild the widget. */
const keyOf = (value: unknown): string => JSON.stringify(value ?? null);

// ---- Date & time field ----

export interface DateTimeFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'value' | 'onChange'> {
  label?: string;
  type?: DateTimeFieldType;
  value?: string;
  helper?: string;
  error?: string;
  success?: string;
  size?: InputSize;
  labelStyle?: 'label' | 'eyebrow';
  /** The button that opens the platform's picker; `false` leaves only the native control. */
  icon?: IconName | string | false;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

/** Same DOM and classes as `createDateTimeField`; the input is controlled through `value` / `onChange`. */
export function DateTimeField({ label, type = 'date', helper, error, success, size, labelStyle, icon, required, disabled, className, id, ...rest }: DateTimeFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const glyph = icon === false ? null : (icon ?? dateTimeIcon(type));
  const onBoxMouseDown = (event: MouseEvent<HTMLDivElement>): void => {
    const input = inputRef.current;
    if (input && event.target !== input && !(event.target as Element).closest('button')) {
      event.preventDefault();
      input.focus();
    }
  };
  const box = (control: Record<string, unknown>) => (
    <div className={cx(dateTimeFieldClass(size), disabled && 'is-disabled', !label && className)} onMouseDown={onBoxMouseDown}>
      <input {...rest} {...control} ref={inputRef} className="mh-input__control" type={type} disabled={disabled} />
      {glyph && (
        <button
          type="button"
          className={DATETIME_BUTTON_CLASS}
          tabIndex={-1}
          aria-label={dateTimePickerLabel(type)}
          title={dateTimePickerLabel(type)}
          disabled={disabled}
          onClick={() => {
            const input = inputRef.current;
            if (input && !input.disabled && !input.readOnly) openPlatformPicker(input);
          }}
        >
          <Icon icon={glyph} />
        </button>
      )}
    </div>
  );
  if (!label) return box({ id, required });
  return (
    <Field label={label} helper={helper} error={error} success={success} required={required} labelStyle={labelStyle} disabled={disabled} controlId={id} className={className}>
      {(control) => box({ ...control })}
    </Field>
  );
}

// ---- Calendar ----

export interface CalendarProps extends Omit<CalendarOptions, 'onSelect' | 'onRangeChange' | 'isDateDisabled'> {
  className?: string;
  isDateDisabled?: (date: IsoDate) => boolean;
  onSelect?: (date: IsoDate) => void;
  onRangeChange?: (range: DateRange) => void;
}

/** `createCalendar` in a host; `value` and `range` follow the props. */
export function Calendar({ className, value, range, onSelect, onRangeChange, isDateDisabled, mode, min, max, locale, weekStartsOn, months, month, label, today }: CalendarProps) {
  const host = useRef<HTMLDivElement>(null);
  const handle = useRef<CalendarHandle | null>(null);
  const latest = useRef({ value, range, onSelect, onRangeChange, isDateDisabled });
  useEffect(() => {
    latest.current = { value, range, onSelect, onRangeChange, isDateDisabled };
  });
  useEffect(() => {
    const c = createCalendar({
      mode,
      min,
      max,
      locale,
      weekStartsOn,
      months,
      month,
      label,
      today,
      value: latest.current.value,
      range: latest.current.range,
      isDateDisabled: (d) => latest.current.isDateDisabled?.(d) ?? false,
      onSelect: (d) => latest.current.onSelect?.(d),
      onRangeChange: (r) => latest.current.onRangeChange?.(r),
    });
    host.current!.append(c.el);
    handle.current = c;
    return () => {
      c.el.remove();
      handle.current = null;
    };
  }, [mode, min, max, locale, weekStartsOn, months, month, label, today]);
  useEffect(() => {
    if (value !== undefined && handle.current && handle.current.getValue() !== value) handle.current.setValue(value);
  }, [value]);
  const rangeKey = keyOf(range);
  useEffect(() => {
    const r = latest.current.range;
    if (r !== undefined && handle.current && keyOf(handle.current.getRange()) !== rangeKey) handle.current.setRange(r);
  }, [rangeKey]);
  return <Host hostRef={host} className={className} />;
}

// ---- Date picker and date range picker ----

export interface DatePickerProps extends Omit<DatePickerOptions, 'onChange' | 'container'> {
  className?: string;
  onChange?: (value: IsoDate | null) => void;
}

/** `createDatePicker` in a host; `value`, `disabled` and `error` follow the props. */
export function DatePicker({ className, value, onChange, disabled, error, isDateDisabled, format, ...rest }: DatePickerProps) {
  const host = useRef<HTMLDivElement>(null);
  const handle = useRef<DatePickerHandle | null>(null);
  const latest = useRef({ value, onChange, isDateDisabled, format, disabled, error });
  useEffect(() => {
    latest.current = { value, onChange, isDateDisabled, format, disabled, error };
  });
  const { label, ariaLabel, placeholder, min, max, locale, weekStartsOn, clearable, showToday, name, helper, size, labelStyle } = rest;
  const formatKey = keyOf(format);
  useEffect(() => {
    const l = latest.current;
    const p = createDatePicker({
      label,
      ariaLabel,
      placeholder,
      min,
      max,
      locale,
      weekStartsOn,
      clearable,
      showToday,
      name,
      helper,
      size,
      labelStyle,
      format: formatKey === 'null' ? undefined : l.format,
      value: l.value,
      error: l.error,
      disabled: l.disabled,
      isDateDisabled: (d) => latest.current.isDateDisabled?.(d) ?? false,
      onChange: (v) => latest.current.onChange?.(v),
    });
    host.current!.append(p.el);
    handle.current = p;
    return () => {
      p.destroy();
      p.el.remove();
      handle.current = null;
    };
  }, [label, ariaLabel, placeholder, min, max, locale, weekStartsOn, clearable, showToday, name, helper, size, labelStyle, formatKey]);
  useEffect(() => {
    if (value !== undefined && handle.current && handle.current.getValue() !== value) handle.current.setValue(value);
  }, [value]);
  useEffect(() => handle.current?.setDisabled(!!disabled), [disabled]);
  useEffect(() => handle.current?.setError(error), [error]);
  return <Host hostRef={host} className={className} />;
}

export interface DateRangePickerProps extends Omit<DateRangePickerOptions, 'onChange' | 'container'> {
  className?: string;
  onChange?: (value: CompleteDateRange | null) => void;
}

/** `createDateRangePicker` in a host; `value`, `disabled` and `error` follow the props. */
export function DateRangePicker({ className, value, onChange, disabled, error, isDateDisabled, format, presets, ...rest }: DateRangePickerProps) {
  const host = useRef<HTMLDivElement>(null);
  const handle = useRef<DateRangePickerHandle | null>(null);
  const latest = useRef({ value, onChange, isDateDisabled, format, presets, disabled, error });
  useEffect(() => {
    latest.current = { value, onChange, isDateDisabled, format, presets, disabled, error };
  });
  const { label, ariaLabel, placeholder, min, max, locale, weekStartsOn, months, clearable, name, helper, size, labelStyle } = rest;
  const formatKey = keyOf(format);
  const presetsKey = keyOf(presets);
  useEffect(() => {
    const l = latest.current;
    const p = createDateRangePicker({
      label,
      ariaLabel,
      placeholder,
      min,
      max,
      locale,
      weekStartsOn,
      months,
      clearable,
      name,
      helper,
      size,
      labelStyle,
      format: formatKey === 'null' ? undefined : l.format,
      presets: presetsKey === 'null' ? undefined : l.presets,
      value: l.value,
      error: l.error,
      disabled: l.disabled,
      isDateDisabled: (d) => latest.current.isDateDisabled?.(d) ?? false,
      onChange: (v) => latest.current.onChange?.(v),
    });
    host.current!.append(p.el);
    handle.current = p;
    return () => {
      p.destroy();
      p.el.remove();
      handle.current = null;
    };
  }, [label, ariaLabel, placeholder, min, max, locale, weekStartsOn, months, clearable, name, helper, size, labelStyle, formatKey, presetsKey]);
  const valueKey = keyOf(value);
  useEffect(() => {
    const v = latest.current.value;
    if (v !== undefined && handle.current && keyOf(handle.current.getValue()) !== valueKey) handle.current.setValue(v);
  }, [valueKey]);
  useEffect(() => handle.current?.setDisabled(!!disabled), [disabled]);
  useEffect(() => handle.current?.setError(error), [error]);
  return <Host hostRef={host} className={className} />;
}

// ---- Colour picker and gradient editor ----

export interface ColorPickerProps extends Omit<ColorPickerOptions, 'onInput' | 'onChange'> {
  className?: string;
  onInput?: (value: string) => void;
  onChange?: (value: string) => void;
}

/** `createColorPicker` in a host; `value` and `disabled` follow the props. */
export function ColorPicker({ className, value, onInput, onChange, disabled, swatches, alpha, hexInput, eyedropper, label }: ColorPickerProps) {
  const host = useRef<HTMLDivElement>(null);
  const handle = useRef<ColorPickerHandle | null>(null);
  const latest = useRef({ value, onInput, onChange, swatches, disabled });
  useEffect(() => {
    latest.current = { value, onInput, onChange, swatches, disabled };
  });
  const swatchKey = keyOf(swatches);
  useEffect(() => {
    const l = latest.current;
    const p = createColorPicker({
      alpha,
      hexInput,
      eyedropper,
      label,
      swatches: swatchKey === 'null' ? undefined : l.swatches,
      value: l.value,
      disabled: l.disabled,
      onInput: (v) => latest.current.onInput?.(v),
      onChange: (v) => latest.current.onChange?.(v),
    });
    host.current!.append(p.el);
    handle.current = p;
    return () => {
      p.el.remove();
      handle.current = null;
    };
  }, [alpha, hexInput, eyedropper, label, swatchKey]);
  useEffect(() => {
    // An echo of what the picker already shows is skipped, so a drag isn't rounded back through hex.
    if (value !== undefined && handle.current && handle.current.getValue() !== value.toLowerCase()) handle.current.setValue(value);
  }, [value]);
  useEffect(() => handle.current?.setDisabled(!!disabled), [disabled]);
  return <Host hostRef={host} className={className} />;
}

export interface GradientEditorProps extends Omit<GradientEditorOptions, 'onInput' | 'onChange'> {
  className?: string;
  onInput?: (stops: GradientStop[], angle: number) => void;
  onChange?: (stops: GradientStop[], angle: number) => void;
}

/** `createGradientEditor` in a host; `stops`, `angle` and `disabled` follow the props. */
export function GradientEditor({ className, stops, angle, onInput, onChange, disabled, showAngle, swatches, label }: GradientEditorProps) {
  const host = useRef<HTMLDivElement>(null);
  const handle = useRef<GradientEditorHandle | null>(null);
  const latest = useRef({ stops, angle, onInput, onChange, swatches, disabled });
  useEffect(() => {
    latest.current = { stops, angle, onInput, onChange, swatches, disabled };
  });
  const swatchKey = keyOf(swatches);
  useEffect(() => {
    const l = latest.current;
    const g = createGradientEditor({
      showAngle,
      label,
      swatches: swatchKey === 'null' ? undefined : l.swatches,
      stops: l.stops,
      angle: l.angle,
      disabled: l.disabled,
      onInput: (s, a) => latest.current.onInput?.(s, a),
      onChange: (s, a) => latest.current.onChange?.(s, a),
    });
    host.current!.append(g.el);
    handle.current = g;
    return () => {
      g.el.remove();
      handle.current = null;
    };
  }, [showAngle, label, swatchKey]);
  const stopsKey = keyOf(stops ? normalizeStops(stops) : null);
  useEffect(() => {
    const s = latest.current.stops;
    if (s && handle.current && keyOf(normalizeStops(handle.current.getStops())) !== stopsKey) handle.current.setStops(s);
  }, [stopsKey]);
  useEffect(() => {
    if (angle !== undefined && handle.current && handle.current.getAngle() !== angle) handle.current.setAngle(angle);
  }, [angle]);
  useEffect(() => handle.current?.setDisabled(!!disabled), [disabled]);
  return <Host hostRef={host} className={className} />;
}

// ---- Icon picker ----

export interface IconPickerProps extends Omit<IconPickerOptions, 'onChange'> {
  className?: string;
  onChange?: (name: string | null) => void;
}

/** `createIconPicker` in a host; `value` and `disabled` follow the props. */
export function IconPicker({ className, value, onChange, disabled, icons, search, allowNone, label }: IconPickerProps) {
  const host = useRef<HTMLDivElement>(null);
  const handle = useRef<IconPickerHandle | null>(null);
  const latest = useRef({ value, onChange, icons, disabled });
  useEffect(() => {
    latest.current = { value, onChange, icons, disabled };
  });
  const iconsKey = keyOf(icons);
  useEffect(() => {
    const l = latest.current;
    const p = createIconPicker({
      search,
      allowNone,
      label,
      icons: iconsKey === 'null' ? undefined : l.icons,
      value: l.value,
      disabled: l.disabled,
      onChange: (n) => latest.current.onChange?.(n),
    });
    host.current!.append(p.el);
    handle.current = p;
    return () => {
      p.el.remove();
      handle.current = null;
    };
  }, [search, allowNone, label, iconsKey]);
  useEffect(() => {
    if (value !== undefined && handle.current && handle.current.getValue() !== value) handle.current.setValue(value);
  }, [value]);
  useEffect(() => handle.current?.setDisabled(!!disabled), [disabled]);
  return <Host hostRef={host} className={className} />;
}

// ---- File drop zone ----

export interface FileDropZoneProps extends Omit<FileDropZoneOptions, 'onFiles' | 'onChange'> {
  className?: string;
  /** An error to show (e.g. from an upload that failed). */
  error?: string;
  onFiles?: FileDropZoneOptions['onFiles'];
  onChange?: FileDropZoneOptions['onChange'];
}

/** `createFileDropZone` in a host; `disabled` and `error` follow the props. The file list is the widget's own. */
export function FileDropZone({ className, error, disabled, onFiles, onChange, title, hint, buttonLabel, icon, accept, multiple, maxSize, maxFiles, showList, name, locale }: FileDropZoneProps) {
  const host = useRef<HTMLDivElement>(null);
  const handle = useRef<FileDropZoneHandle | null>(null);
  const latest = useRef({ onFiles, onChange, disabled });
  useEffect(() => {
    latest.current = { onFiles, onChange, disabled };
  });
  useEffect(() => {
    const z = createFileDropZone({
      title,
      hint,
      buttonLabel,
      icon,
      accept,
      multiple,
      maxSize,
      maxFiles,
      showList,
      name,
      locale,
      disabled: latest.current.disabled,
      onFiles: (a, r) => latest.current.onFiles?.(a, r),
      onChange: (f) => latest.current.onChange?.(f),
    });
    host.current!.append(z.el);
    handle.current = z;
    return () => {
      z.el.remove();
      handle.current = null;
    };
  }, [title, hint, buttonLabel, icon, accept, multiple, maxSize, maxFiles, showList, name, locale]);
  useEffect(() => handle.current?.setDisabled(!!disabled), [disabled]);
  useEffect(() => {
    if (error !== undefined) handle.current?.setError(error || undefined);
  }, [error]);
  return <Host hostRef={host} className={className} />;
}
