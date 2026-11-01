// choice-inputs group: React bindings. Same DOM and classes as the web renderer; native inputs stay controlled
// through `checked` / `value` and `onChange` (or uncontrolled through `defaultChecked` / `defaultValue`).
import { mdiCheck, mdiClose, mdiMinus, mdiPlus, mdiStar, mdiStarOutline } from '@mdi/js';
import { useEffect, useId, useRef, useState, type ChangeEvent, type CSSProperties, type InputHTMLAttributes, type KeyboardEvent, type PointerEvent, type ReactNode, type Ref } from 'react';
import { checkboxClass } from '../web/choice-inputs/checkbox.ts';
import { chipClass, chipRemoveLabel, type ChipItem } from '../web/choice-inputs/chip.ts';
import { choiceGroupClass, choiceLegendClass, type ChoiceOption } from '../web/choice-inputs/choiceGroup.ts';
import { segmentedClass, type SegmentOption } from '../web/choice-inputs/segmentedControl.ts';
import { sliderPosition, type SliderMark } from '../web/choice-inputs/slider.ts';
import { clampStep, stepperClass, stepperKey } from '../web/choice-inputs/stepper.ts';
import { switchClass } from '../web/choice-inputs/switch.ts';
import { CLICK_WHEEL_DETENTS, CLICK_WHEEL_INDICATOR, clickWheelClass, clickWheelLimits, clickWheelProgress, clickWheelTicks, clickWheelTurn, type ClickWheelCenter } from '../web/choice-inputs/clickWheel.ts';
import { DIAL_RADIUS, dialClass, dialGeometry, dialLimits, dialTicks, dialValueAt, type DialMode } from '../web/choice-inputs/radialDial.ts';
import { RANGE_SLIDER_LABELS, clampRange, nearestThumb, rangeLowOnTop, rangeSliderClass, rangeText, rangeValueAt, type RangeSliderLabels, type RangeValue } from '../web/choice-inputs/rangeSlider.ts';
import { ratingClass, ratingFill, ratingItemLabel, ratingValueText, type RatingTone } from '../web/choice-inputs/rating.ts';
import { rotaryAngleOf, rotaryClamp, rotaryDelta, rotaryKey, type RotaryLimits } from '../web/choice-inputs/rotary.ts';
import { toggleGroupClass, toggleGroupKey, toggleGroupNext, toggleGroupTabStop, type ToggleGroupType, type ToggleOption } from '../web/choice-inputs/toggleGroup.ts';
import { cx } from '../web/dom.ts';
import type { IconName } from '../web/icons.ts';
import { Icon } from './foundations.tsx';

type NativeCheckbox = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'children'>;

/** The label and description beside a checkbox, radio or switch. */
function ChoiceText({ block, label, description, descriptionId }: { block: string; label?: ReactNode; description?: ReactNode; descriptionId: string }) {
  if (!label) return null;
  return (
    <span className={`${block}__text`}>
      <span className={`${block}__label`}>{label}</span>
      {description && (
        <span className={`${block}__description`} id={descriptionId}>
          {description}
        </span>
      )}
    </span>
  );
}

export interface CheckboxProps extends NativeCheckbox {
  label?: ReactNode;
  description?: ReactNode;
  /** Mixed state; set it from your data (the DOM property is applied after render). */
  indeterminate?: boolean;
}

/** Same DOM and classes as `createCheckbox`. */
export function Checkbox({ label, description, indeterminate = false, className, ...rest }: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);
  const descriptionId = useId();
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <label className={checkboxClass(className)}>
      <span className="mh-checkbox__control">
        <input {...rest} ref={ref} type="checkbox" className="mh-checkbox__input" aria-describedby={description && label ? descriptionId : undefined} />
        <Icon icon={mdiCheck} className="mh-checkbox__check" />
        <Icon icon={mdiMinus} className="mh-checkbox__dash" />
      </span>
      <ChoiceText block="mh-checkbox" label={label} description={description} descriptionId={descriptionId} />
    </label>
  );
}

export interface SwitchProps extends NativeCheckbox {
  label?: ReactNode;
  description?: ReactNode;
  /** The settings toggle row: label at the start, switch at the end. */
  row?: boolean;
  icon?: IconName | string;
}

/** Same DOM and classes as `createSwitch`: `<input type="checkbox" role="switch">`. */
export function Switch({ label, description, row, icon, className, ...rest }: SwitchProps) {
  const descriptionId = useId();
  return (
    <label className={cx(switchClass(row), className)}>
      {icon && (
        <span className="mh-switch__icon">
          <Icon icon={icon} />
        </span>
      )}
      <ChoiceText block="mh-switch" label={label} description={description} descriptionId={descriptionId} />
      <span className="mh-switch__control">
        <input {...rest} type="checkbox" role="switch" className="mh-switch__input" aria-describedby={description && label ? descriptionId : undefined} />
        <span className="mh-switch__thumb" aria-hidden="true" />
      </span>
    </label>
  );
}

interface ChoiceGroupBase {
  legend: ReactNode;
  hideLegend?: boolean;
  options: readonly ChoiceOption[];
  name?: string;
  inline?: boolean;
  disabled?: boolean;
  className?: string;
}

function ChoiceFieldset({ legend, hideLegend, inline, disabled, className, children }: Omit<ChoiceGroupBase, 'options' | 'name'> & { children: ReactNode }) {
  return (
    <fieldset className={cx(choiceGroupClass(inline), className)} disabled={disabled}>
      <legend className={choiceLegendClass(hideLegend)}>{legend}</legend>
      <div className="mh-choice-group__items">{children}</div>
    </fieldset>
  );
}

function Radio({ option, name, checked, defaultChecked, onChange }: { option: ChoiceOption; name: string; checked?: boolean; defaultChecked?: boolean; onChange: (event: ChangeEvent<HTMLInputElement>) => void }) {
  const descriptionId = useId();
  return (
    <label className="mh-radio">
      <span className="mh-radio__control">
        <input
          type="radio"
          className="mh-radio__input"
          name={name}
          value={option.value}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={option.disabled}
          onChange={onChange}
          aria-describedby={option.description ? descriptionId : undefined}
        />
        <span className="mh-radio__dot" aria-hidden="true" />
      </span>
      <ChoiceText block="mh-radio" label={option.label} description={option.description} descriptionId={descriptionId} />
    </label>
  );
}

export interface RadioGroupProps extends ChoiceGroupBase {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
}

/** Same DOM and classes as `createRadioGroup`. */
export function RadioGroup({ options, name, value, defaultValue, onChange, ...group }: RadioGroupProps) {
  const auto = useId();
  return (
    <ChoiceFieldset {...group}>
      {options.map((o) => (
        <Radio
          key={o.value}
          option={o}
          name={name ?? auto}
          checked={value === undefined ? undefined : value === o.value}
          defaultChecked={value === undefined ? defaultValue === o.value : undefined}
          onChange={(event) => onChange?.(o.value, event)}
        />
      ))}
    </ChoiceFieldset>
  );
}

export interface CheckboxGroupProps extends ChoiceGroupBase {
  values?: readonly string[];
  defaultValues?: readonly string[];
  onChange?: (values: string[], event: ChangeEvent<HTMLInputElement>) => void;
}

/** Same DOM and classes as `createCheckboxGroup`. */
export function CheckboxGroup({ options, name, values, defaultValues, onChange, ...group }: CheckboxGroupProps) {
  const [inner, setInner] = useState<readonly string[]>(defaultValues ?? []);
  const current = values ?? inner;
  return (
    <ChoiceFieldset {...group}>
      {options.map((o) => (
        <Checkbox
          key={o.value}
          label={o.label}
          description={o.description}
          name={name}
          value={o.value}
          disabled={o.disabled}
          checked={current.includes(o.value)}
          onChange={(event) => {
            const next = event.target.checked ? [...current, o.value] : current.filter((v) => v !== o.value);
            setInner(next);
            onChange?.(next, event);
          }}
        />
      ))}
    </ChoiceFieldset>
  );
}

export interface SegmentedControlProps {
  /** Accessible name of the group. */
  label: string;
  options: readonly SegmentOption[];
  value?: string;
  defaultValue?: string;
  name?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
}

/** Same DOM and classes as `createSegmentedControl`. */
export function SegmentedControl({ label, options, value, defaultValue, name, size, fullWidth, disabled, className, onChange }: SegmentedControlProps) {
  const auto = useId();
  return (
    <div className={cx(segmentedClass(size, fullWidth), className)} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <label key={o.value} className="mh-segmented__option" title={o.iconOnly ? o.label : undefined}>
          <input
            type="radio"
            className="mh-segmented__input"
            name={name ?? auto}
            value={o.value}
            aria-label={o.iconOnly ? o.label : undefined}
            checked={value === undefined ? undefined : value === o.value}
            defaultChecked={value === undefined ? defaultValue === o.value : undefined}
            disabled={disabled || o.disabled}
            onChange={(event) => onChange?.(o.value, event)}
          />
          <span className="mh-segmented__face">
            {o.icon && <Icon icon={o.icon} />}
            {!o.iconOnly && <span className="mh-segmented__label">{o.label}</span>}
          </span>
        </label>
      ))}
    </div>
  );
}

export interface ChipProps {
  label: ReactNode;
  /** Accessible name of a selectable chip whose label is abbreviated. */
  ariaLabel?: string;
  icon?: IconName | string;
  selectable?: boolean;
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  removable?: boolean;
  removeLabel?: string;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
  /** Internal: the remove button, for focus management in `ChipGroup`. */
  removeRef?: Ref<HTMLButtonElement>;
}

/** Same DOM and classes as `createChip`. A selectable chip is controlled by `selected`. */
export function Chip({ label, ariaLabel, icon, selectable, selected = false, onSelectedChange, removable, removeLabel, onRemove, disabled, className, removeRef }: ChipProps) {
  if (selectable) {
    return (
      <button type="button" className={cx(chipClass(true), className)} aria-pressed={selected} aria-label={ariaLabel} disabled={disabled} onClick={() => onSelectedChange?.(!selected)}>
        <Icon icon={mdiCheck} className="mh-chip__check" />
        {icon && <Icon icon={icon} />}
        <span className="mh-chip__label">{label}</span>
      </button>
    );
  }
  const name = removeLabel ?? chipRemoveLabel(ariaLabel ?? (typeof label === 'string' ? label : ''));
  return (
    <span className={cx(chipClass(false, removable), disabled && 'is-disabled', className)}>
      {icon && <Icon icon={icon} />}
      <span className="mh-chip__label">{label}</span>
      {removable && (
        <button ref={removeRef} type="button" className="mh-chip__remove" aria-label={name} title={name} disabled={disabled} onClick={onRemove}>
          <Icon icon={mdiClose} />
        </button>
      )}
    </span>
  );
}

export interface ChipGroupProps {
  /** Accessible name of the group. */
  label: string;
  chips: readonly ChipItem[];
  selection?: 'multiple' | 'single' | 'none';
  values?: readonly string[];
  defaultValues?: readonly string[];
  onChange?: (values: string[]) => void;
  removable?: boolean;
  /** Remove the chip from `chips` in response; focus moves to a neighbouring chip. */
  onRemove?: (value: string) => void;
  className?: string;
}

/** Same DOM and classes as `createChipGroup`. */
export function ChipGroup({ label, chips, selection = 'multiple', values, defaultValues, onChange, removable, onRemove, className }: ChipGroupProps) {
  const [inner, setInner] = useState<readonly string[]>(defaultValues ?? []);
  const current = values ?? inner;
  const group = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<number | null>(null);
  useEffect(() => {
    if (pendingFocus.current === null || !group.current) return;
    const buttons = group.current.querySelectorAll<HTMLButtonElement>('.mh-chip__remove');
    (buttons[Math.min(pendingFocus.current, buttons.length - 1)] ?? group.current).focus();
    pendingFocus.current = null;
  }, [chips]);
  const selectable = selection !== 'none';
  const set = (next: string[]) => {
    setInner(next);
    onChange?.(next);
  };
  return (
    <div ref={group} className={cx('mh-chip-group', className)} role="group" aria-label={label} tabIndex={removable ? -1 : undefined}>
      {chips.map((c, index) => (
        <Chip
          key={c.value}
          label={c.label}
          ariaLabel={c.ariaLabel}
          icon={c.icon}
          disabled={c.disabled}
          selectable={selectable}
          selected={current.includes(c.value)}
          onSelectedChange={(on) => set(selection === 'single' ? (on ? [c.value] : []) : on ? [...current, c.value] : current.filter((v) => v !== c.value))}
          removable={!selectable && removable}
          onRemove={() => {
            pendingFocus.current = index;
            onRemove?.(c.value);
          }}
        />
      ))}
    </div>
  );
}

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'min' | 'max' | 'step'> {
  label?: ReactNode;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  showValue?: boolean;
  format?: (value: number) => string;
  marks?: readonly SliderMark[];
  /** Called with the number on every change. */
  onValueChange?: (value: number) => void;
}

/** Same DOM and classes as `createSlider`. */
export function Slider({ label, min = 0, max = 100, step = 1, value, defaultValue, showValue, format, marks, onValueChange, onChange, className, id, ...rest }: SliderProps) {
  const auto = useId();
  const inputId = id ?? auto;
  const [inner, setInner] = useState(defaultValue ?? min);
  const current = value ?? inner;
  const text = format ? format(current) : String(current);
  return (
    <div className={cx('mh-slider', className)}>
      {(label || showValue) && (
        <div className="mh-slider__head">
          {label && (
            <label className="mh-slider__label" htmlFor={inputId}>
              {label}
            </label>
          )}
          {showValue && (
            <output className="mh-slider__value" htmlFor={inputId}>
              {text}
            </output>
          )}
        </div>
      )}
      <input
        {...rest}
        id={inputId}
        type="range"
        className="mh-slider__input"
        min={min}
        max={max}
        step={step}
        value={current}
        aria-valuetext={format ? text : undefined}
        style={{ '--_at': sliderPosition(current, min, max) } as CSSProperties}
        onChange={(event) => {
          const next = Number(event.target.value);
          setInner(next);
          onChange?.(event);
          onValueChange?.(next);
        }}
      />
      {marks && marks.length > 0 && (
        <div className="mh-slider__marks" aria-hidden="true">
          {marks.map((m) => (
            <span key={m.value} className="mh-slider__mark" style={{ '--_at': sliderPosition(m.value, min, max) } as CSSProperties}>
              {m.label ?? ''}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export interface StepperProps {
  /** Accessible name of the value. */
  label: string;
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  format?: (value: number) => string;
  size?: 'small' | 'medium';
  disabled?: boolean;
  decreaseLabel?: string;
  increaseLabel?: string;
  className?: string;
  onChange?: (value: number) => void;
}

/** Same DOM and classes as `createStepper`. */
export function Stepper({ label, value, defaultValue, min = 0, max = Infinity, step = 1, format, size, disabled = false, decreaseLabel = 'Decrease', increaseLabel = 'Increase', className, onChange }: StepperProps) {
  const [inner, setInner] = useState(() => clampStep(defaultValue ?? min, min, max, step));
  const current = value ?? inner;
  const text = format ? format(current) : String(current);
  const set = (next: number) => {
    if (next === current) return;
    setInner(next);
    onChange?.(next);
  };
  return (
    <div className={cx(stepperClass(size), className)}>
      <button type="button" className="mh-stepper__button" tabIndex={-1} aria-label={decreaseLabel} disabled={disabled || current <= min} onClick={() => set(clampStep(current - step, min, max, step))}>
        <Icon icon={mdiMinus} />
      </button>
      <span
        className="mh-stepper__value"
        role="spinbutton"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={Number.isFinite(min) ? min : undefined}
        aria-valuemax={Number.isFinite(max) ? max : undefined}
        aria-valuenow={current}
        aria-valuetext={format ? text : undefined}
        aria-disabled={disabled || undefined}
        onKeyDown={(event: KeyboardEvent<HTMLSpanElement>) => {
          if (disabled) return;
          const next = stepperKey(event.key, current, min, max, step);
          if (next === null) return;
          event.preventDefault();
          set(next);
        }}
      >
        {text}
      </span>
      <button type="button" className="mh-stepper__button" tabIndex={-1} aria-label={increaseLabel} disabled={disabled || current >= max} onClick={() => set(clampStep(current + step, min, max, step))}>
        <Icon icon={mdiPlus} />
      </button>
    </div>
  );
}

export interface ToggleGroupProps {
  /** Accessible name of the group. */
  label: string;
  options: readonly ToggleOption[];
  type?: ToggleGroupType;
  values?: readonly string[];
  defaultValues?: readonly string[];
  required?: boolean;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  onChange?: (values: string[]) => void;
}

/** Same DOM and classes as `createToggleGroup`; controlled by `values` (or uncontrolled with `defaultValues`). */
export function ToggleGroup({ label, options, type = 'multiple', values, defaultValues, required, size, fullWidth, disabled = false, className, onChange }: ToggleGroupProps) {
  const one = (v: readonly string[]): string[] => (type === 'single' ? v.slice(0, 1) : [...v]);
  const [inner, setInner] = useState<string[]>(() => one(defaultValues ?? []));
  const current = one(values ?? inner);
  const [focus, setFocus] = useState<number | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const stop = focus !== null && !disabled && !options[focus]?.disabled ? focus : toggleGroupTabStop(options, current, disabled);
  return (
    <div className={cx(toggleGroupClass(size, fullWidth), className)} role="group" aria-label={label}>
      {options.map((o, i) => (
        <button
          key={o.value}
          ref={(b) => {
            refs.current[i] = b;
          }}
          type="button"
          className="mh-toggle-group__item"
          aria-label={o.iconOnly ? o.label : undefined}
          title={o.iconOnly ? o.label : undefined}
          data-value={o.value}
          aria-pressed={current.includes(o.value)}
          disabled={disabled || o.disabled}
          tabIndex={i === stop ? 0 : -1}
          onClick={() => {
            setFocus(i);
            const next = toggleGroupNext(current, o.value, type, required);
            if (next.length === current.length && next.every((v) => current.includes(v))) return;
            setInner(next);
            onChange?.(next);
          }}
          onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
            const to = toggleGroupKey(event.key, i, options);
            if (to === null) return;
            event.preventDefault();
            setFocus(to);
            refs.current[to]?.focus();
          }}
        >
          {o.icon && <Icon icon={o.icon} />}
          {!o.iconOnly && <span className="mh-toggle-group__label">{o.label}</span>}
        </button>
      ))}
    </div>
  );
}

export interface RangeSliderProps {
  label?: ReactNode;
  ariaLabel?: string;
  min?: number;
  max?: number;
  step?: number;
  value?: RangeValue;
  defaultValue?: RangeValue;
  minGap?: number;
  showValue?: boolean;
  format?: (value: number) => string;
  marks?: readonly SliderMark[];
  names?: readonly [string, string];
  labels?: Partial<RangeSliderLabels>;
  disabled?: boolean;
  className?: string;
  /** On every move. */
  onValueChange?: (value: [number, number]) => void;
  /** When a thumb is let go or moved by key. */
  onValueCommit?: (value: [number, number]) => void;
}

/** Same DOM and classes as `createRangeSlider`. */
export function RangeSlider({ label, ariaLabel, min = 0, max = 100, step = 1, value, defaultValue, minGap = 0, showValue, format, marks, names, labels, disabled = false, className, onValueChange, onValueCommit }: RangeSliderProps) {
  const labelId = useId();
  const names_ = { ...RANGE_SLIDER_LABELS, ...labels };
  const [inner, setInner] = useState<[number, number]>(() => clampRange(defaultValue ?? [min, max], min, max, minGap));
  const current = clampRange(value ?? inner, min, max, minGap);
  const latest = useRef(current);
  latest.current = current;
  const control = useRef<HTMLDivElement>(null);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const dragging = useRef<'low' | 'high' | null>(null);
  const set = (next: RangeValue, moved: 'low' | 'high'): void => {
    const clamped = clampRange(next, min, max, minGap, moved);
    if (clamped[0] === latest.current[0] && clamped[1] === latest.current[1]) return;
    latest.current = clamped;
    setInner(clamped);
    onValueChange?.(clamped);
  };
  const moveTo = (which: 'low' | 'high', clientX: number): void => {
    if (!control.current) return;
    const n = rangeValueAt(clientX, control.current, min, max, step);
    if (n !== null) set(which === 'low' ? [n, latest.current[1]] : [latest.current[0], n], which);
  };
  const thumb = (which: 'low' | 'high', index: 0 | 1) => (
    <input
      ref={(el) => {
        inputs.current[index] = el;
      }}
      type="range"
      className={`mh-range-slider__input mh-range-slider__input--${which}`}
      name={names?.[index]}
      min={min}
      max={max}
      step={step}
      aria-label={names_[which]}
      aria-valuetext={format ? format(current[index]) : undefined}
      value={current[index]}
      disabled={disabled}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        const n = Number(event.target.value);
        set(which === 'low' ? [n, latest.current[1]] : [latest.current[0], n], which);
      }}
      onPointerUp={() => onValueCommit?.(latest.current)}
      onKeyUp={() => onValueCommit?.(latest.current)}
    />
  );
  const style = { '--_lo': sliderPosition(current[0], min, max), '--_hi': sliderPosition(current[1], min, max) } as CSSProperties;
  return (
    <div className={cx(rangeSliderClass(rangeLowOnTop(current, min, max), disabled), className)} role="group" aria-labelledby={label ? labelId : undefined} aria-label={label ? undefined : ariaLabel} style={style}>
      {(label || showValue) && (
        <div className="mh-range-slider__head">
          {label && (
            <span className="mh-range-slider__label" id={labelId}>
              {label}
            </span>
          )}
          {showValue && (
            <output className="mh-range-slider__value" aria-hidden="true">
              {rangeText(current, format)}
            </output>
          )}
        </div>
      )}
      <div
        ref={control}
        className="mh-range-slider__control"
        onPointerDown={(event) => {
          if (disabled || event.button !== 0 || event.target instanceof HTMLInputElement || !control.current) return;
          const n = rangeValueAt(event.clientX, control.current, min, max, step);
          if (n === null) return;
          event.preventDefault();
          dragging.current = nearestThumb(n, latest.current);
          inputs.current[dragging.current === 'low' ? 0 : 1]?.focus();
          control.current.setPointerCapture?.(event.pointerId);
          moveTo(dragging.current, event.clientX);
        }}
        onPointerMove={(event) => {
          if (dragging.current) moveTo(dragging.current, event.clientX);
        }}
        onPointerUp={() => {
          if (!dragging.current) return;
          dragging.current = null;
          onValueCommit?.(latest.current);
        }}
        onPointerCancel={() => {
          dragging.current = null;
        }}
      >
        <div className="mh-range-slider__track">
          <div className="mh-range-slider__fill" />
        </div>
        {thumb('low', 0)}
        {thumb('high', 1)}
      </div>
      {marks && marks.length > 0 && (
        <div className="mh-range-slider__marks" aria-hidden="true">
          {marks.map((m) => (
            <span key={m.value} className="mh-range-slider__mark" style={{ '--_at': sliderPosition(m.value, min, max) } as CSSProperties}>
              {m.label ?? ''}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Keyboard handling and ARIA shared by the React dial and wheel. */
function rotaryAria(value: number, limits: RotaryLimits, text: string | undefined, disabled: boolean) {
  return {
    role: 'slider',
    tabIndex: disabled ? -1 : 0,
    'aria-valuemin': limits.min,
    'aria-valuemax': limits.max,
    'aria-valuenow': value,
    'aria-valuetext': text,
    'aria-disabled': disabled ? true : undefined,
  } as const;
}

export interface RadialDialProps {
  label?: ReactNode;
  ariaLabel?: string;
  mode?: DialMode;
  min?: number;
  max?: number;
  step?: number;
  bigStep?: number;
  value?: number;
  defaultValue?: number;
  format?: (value: number) => string;
  showValue?: boolean;
  ticks?: number;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
  /** While turning. */
  onValueChange?: (value: number) => void;
  /** When let go or moved by key. */
  onValueCommit?: (value: number) => void;
}

/** Same DOM and classes as `createRadialDial`. */
export function RadialDial({ label, ariaLabel, mode, min, max, step, bigStep, value, defaultValue, format, showValue = true, ticks, size, disabled = false, className, onValueChange, onValueCommit }: RadialDialProps) {
  const limits = dialLimits({ mode, min, max, step, bigStep });
  const labelId = useId();
  const [inner, setInner] = useState(() => rotaryClamp(defaultValue ?? limits.min, limits));
  const current = rotaryClamp(value ?? inner, limits);
  const latest = useRef(current);
  latest.current = current;
  const dragging = useRef<number | null>(null);
  const set = (next: number): boolean => {
    if (next === latest.current) return false;
    latest.current = next;
    setInner(next);
    onValueChange?.(next);
    return true;
  };
  const fromPointer = (event: PointerEvent<HTMLDivElement>, guard: boolean): void => {
    const box = event.currentTarget.getBoundingClientRect();
    if (box.width > 0) set(dialValueAt(rotaryAngleOf(event.clientX, event.clientY, box), limits, guard ? latest.current : undefined));
  };
  const g = dialGeometry(current, limits);
  const text = format ? format(current) : String(current);
  return (
    <div className={cx(dialClass({ mode, size, disabled }), className)}>
      <div
        className="mh-dial__control"
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : ariaLabel}
        {...rotaryAria(current, limits, format ? text : undefined, disabled)}
        onKeyDown={(event) => {
          if (disabled) return;
          const next = rotaryKey(event.key, latest.current, limits);
          if (next === null) return;
          event.preventDefault();
          if (set(next)) onValueCommit?.(next);
        }}
        onPointerDown={(event) => {
          if (disabled || event.button !== 0) return;
          event.preventDefault();
          dragging.current = latest.current;
          event.currentTarget.focus();
          event.currentTarget.setPointerCapture?.(event.pointerId);
          fromPointer(event, false);
        }}
        onPointerMove={(event) => {
          if (dragging.current !== null) fromPointer(event, true);
        }}
        onPointerUp={() => {
          if (dragging.current === null) return;
          const start = dragging.current;
          dragging.current = null;
          if (latest.current !== start) onValueCommit?.(latest.current);
        }}
        onPointerCancel={() => {
          dragging.current = null;
        }}
      >
        <svg className="mh-dial__svg" viewBox="0 0 100 100" aria-hidden="true">
          {ticks ? (
            <g className="mh-dial__ticks">
              {dialTicks(ticks, limits).map((t, i) => (
                <line key={i} className="mh-dial__tick" {...t} />
              ))}
            </g>
          ) : null}
          {limits.wrap ? <circle className="mh-dial__track" cx="50" cy="50" r={DIAL_RADIUS} /> : <path className="mh-dial__track" d={g.track} />}
          {!limits.wrap && <path className="mh-dial__fill" d={g.fill} />}
          {limits.wrap && <line className="mh-dial__needle" x1="50" y1="50" x2={g.thumb.cx} y2={g.thumb.cy} />}
          <circle className="mh-dial__thumb" r="7" cx={g.thumb.cx} cy={g.thumb.cy} />
        </svg>
        {showValue && (
          <span className="mh-dial__value" aria-hidden="true">
            {text}
          </span>
        )}
      </div>
      {label && (
        <span className="mh-dial__label" id={labelId}>
          {label}
        </span>
      )}
    </div>
  );
}

export interface ClickWheelProps {
  label?: ReactNode;
  ariaLabel?: string;
  min?: number;
  max?: number;
  step?: number;
  bigStep?: number;
  value?: number;
  defaultValue?: number;
  wrap?: boolean;
  detents?: number;
  format?: (value: number) => string;
  showValue?: boolean;
  center?: ClickWheelCenter;
  size?: 'small' | 'medium' | 'large';
  haptics?: boolean;
  disabled?: boolean;
  className?: string;
  /** On every detent. */
  onValueChange?: (value: number) => void;
  /** When a turn ends (let go, a key, a scroll notch). */
  onValueCommit?: (value: number) => void;
}

/** Same DOM and classes as `createClickWheel`. */
export function ClickWheel({ label, ariaLabel, min, max, step, bigStep, value, defaultValue, wrap, detents: detentsProp, format, showValue = true, center, size, haptics, disabled = false, className, onValueChange, onValueCommit }: ClickWheelProps) {
  const limits = clickWheelLimits({ min, max, step, bigStep, wrap });
  const detents = Math.max(1, Math.round(detentsProp ?? CLICK_WHEEL_DETENTS));
  const detentAngle = 360 / detents;
  const labelId = useId();
  const [inner, setInner] = useState(() => rotaryClamp(defaultValue ?? limits.min, limits));
  const current = rotaryClamp(value ?? inner, limits);
  const latest = useRef(current);
  latest.current = current;
  const [drift, setDrift] = useState(0);
  const drag = useRef<{ angle: number; drift: number; start: number } | null>(null);
  const wheel = useRef<HTMLDivElement>(null);
  const scroll = useRef(0);

  /** Moves by whole detents; returns how many it moved. */
  const turnBy = (count: number): number => {
    let moved = 0;
    const dir = Math.sign(count);
    for (let i = 0; i < Math.abs(count); i += 1) {
      const next = rotaryClamp(latest.current + dir * limits.step, limits);
      if (next === latest.current) break;
      latest.current = next;
      moved += dir;
      if (haptics) navigator.vibrate?.(4);
      onValueChange?.(next);
    }
    if (moved !== 0) setInner(latest.current);
    return moved;
  };

  // Scroll needs a non-passive listener to keep the page still while the wheel turns.
  const onScroll = useRef<(event: WheelEvent) => void>(() => undefined);
  onScroll.current = (event) => {
    if (disabled) return;
    const px = event.deltaMode === 1 ? event.deltaY * 40 : event.deltaMode === 2 ? event.deltaY * 120 : event.deltaY;
    if (rotaryClamp(latest.current + (px < 0 ? 1 : -1) * limits.step, limits) === latest.current) return;
    event.preventDefault();
    scroll.current += px;
    const count = Math.trunc(-scroll.current / 40);
    if (count === 0) return;
    scroll.current += count * 40;
    if (turnBy(count) !== 0) onValueCommit?.(latest.current);
  };
  useEffect(() => {
    const el = wheel.current;
    if (!el) return;
    const listener = (event: WheelEvent): void => onScroll.current(event);
    el.addEventListener('wheel', listener, { passive: false });
    return () => el.removeEventListener('wheel', listener);
  }, []);

  const text = format ? format(current) : String(current);
  const progress = clickWheelProgress(current, limits);
  return (
    <div className={cx(clickWheelClass({ size, disabled }), className)} style={{ '--_turn': `${clickWheelTurn(current, limits, detents) + drift}deg` } as CSSProperties}>
      <div className="mh-click-wheel__body">
        <div
          ref={wheel}
          className="mh-click-wheel__wheel"
          aria-labelledby={label ? labelId : undefined}
          aria-label={label ? undefined : ariaLabel}
          {...rotaryAria(current, limits, format ? text : undefined, disabled)}
          onKeyDown={(event) => {
            if (disabled) return;
            const next = rotaryKey(event.key, latest.current, limits);
            if (next === null) return;
            event.preventDefault();
            if (next === latest.current) return;
            latest.current = next;
            setInner(next);
            onValueChange?.(next);
            onValueCommit?.(next);
          }}
          onPointerDown={(event) => {
            if (disabled || event.button !== 0) return;
            const box = event.currentTarget.getBoundingClientRect();
            if (box.width <= 0) return;
            event.preventDefault();
            drag.current = { angle: rotaryAngleOf(event.clientX, event.clientY, box), drift: 0, start: latest.current };
            event.currentTarget.focus();
            event.currentTarget.setPointerCapture?.(event.pointerId);
          }}
          onPointerMove={(event) => {
            const d = drag.current;
            if (!d) return;
            const box = event.currentTarget.getBoundingClientRect();
            const dx = event.clientX - (box.left + box.width / 2);
            const dy = event.clientY - (box.top + box.height / 2);
            if (Math.hypot(dx, dy) < box.width * 0.12) return;
            const angle = rotaryAngleOf(event.clientX, event.clientY, box);
            d.drift += rotaryDelta(d.angle, angle);
            d.angle = angle;
            const count = Math.trunc(d.drift / detentAngle);
            if (count !== 0) {
              const moved = turnBy(count);
              d.drift = moved === count ? d.drift - count * detentAngle : 0;
            }
            setDrift(d.drift);
          }}
          onPointerUp={() => {
            const d = drag.current;
            if (!d) return;
            drag.current = null;
            setDrift(0);
            if (latest.current !== d.start) onValueCommit?.(latest.current);
          }}
          onPointerCancel={() => {
            drag.current = null;
            setDrift(0);
          }}
        >
          <svg className="mh-click-wheel__svg" viewBox="0 0 100 100" aria-hidden="true">
            <circle className="mh-click-wheel__disc" cx="50" cy="50" r="44" />
            {!limits.wrap && <circle className="mh-click-wheel__rim" cx="50" cy="50" r="46" />}
            {!limits.wrap && <path className="mh-click-wheel__progress" d={progress} />}
            <g className="mh-click-wheel__ticks">
              {clickWheelTicks(detents).map((t, i) => (
                <line key={i} className={cx('mh-click-wheel__tick', i === 0 && 'mh-click-wheel__tick--zero')} {...t} />
              ))}
            </g>
            <path className="mh-click-wheel__indicator" d={CLICK_WHEEL_INDICATOR} />
          </svg>
          {!center && showValue && (
            <span className="mh-click-wheel__value" aria-hidden="true">
              {text}
            </span>
          )}
        </div>
        {center && (
          <button type="button" className="mh-click-wheel__center" aria-label={center.label} title={center.label} disabled={disabled} onClick={(event) => center.onPress?.(event.nativeEvent)}>
            <Icon icon={center.icon} />
          </button>
        )}
      </div>
      {label && (
        <span className="mh-click-wheel__label" id={labelId}>
          {label}
        </span>
      )}
    </div>
  );
}

export interface RatingProps {
  /** Accessible name. */
  label: string;
  value?: number;
  defaultValue?: number;
  max?: number;
  readOnly?: boolean;
  allowClear?: boolean;
  size?: 'small' | 'medium' | 'large';
  tone?: RatingTone;
  icon?: IconName | string;
  emptyIcon?: IconName | string;
  itemLabel?: (n: number, max: number) => string;
  valueText?: (value: number, max: number) => string;
  name?: string;
  disabled?: boolean;
  className?: string;
  onChange?: (value: number) => void;
}

function RatingStar({ icon, emptyIcon }: { icon: IconName | string; emptyIcon: IconName | string }) {
  return (
    <span className="mh-rating__star">
      <Icon icon={emptyIcon} className="mh-rating__empty" />
      <Icon icon={icon} className="mh-rating__full" />
    </span>
  );
}

/** Same DOM and classes as `createRating`. */
export function Rating({ label, value, defaultValue, max: maxProp = 5, readOnly = false, allowClear = true, size, tone, icon = mdiStar, emptyIcon = mdiStarOutline, itemLabel = ratingItemLabel, valueText = ratingValueText, name, disabled = false, className, onChange }: RatingProps) {
  const max = Math.max(1, Math.round(maxProp));
  const clamp = (v: number): number => Math.min(max, Math.max(0, readOnly ? v : Math.round(v)));
  const auto = useId();
  const [inner, setInner] = useState(() => clamp(defaultValue ?? 0));
  const current = clamp(value ?? inner);
  const set = (next: number): void => {
    if (next === current) return;
    setInner(next);
    onChange?.(next);
  };
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  const cls = cx(ratingClass({ readOnly, size, tone, disabled }), className);
  if (readOnly) {
    return (
      <div className={cls} role="img" aria-label={`${label}: ${valueText(current, max)}`}>
        {stars.map((n) => (
          <span key={n} className="mh-rating__item" style={{ '--_fill': ratingFill(current, n) } as CSSProperties}>
            <RatingStar icon={icon} emptyIcon={emptyIcon} />
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className={cls} role="radiogroup" aria-label={label}>
      {stars.map((n) => (
        <label key={n} className="mh-rating__item" style={{ '--_fill': ratingFill(current, n) } as CSSProperties}>
          <input
            type="radio"
            className="mh-rating__input"
            name={name ?? auto}
            value={n}
            checked={current === n}
            disabled={disabled}
            onChange={() => set(n)}
            onClick={() => {
              if (current === n && allowClear) set(0);
            }}
          />
          <RatingStar icon={icon} emptyIcon={emptyIcon} />
          <span className="mh-visually-hidden">{itemLabel(n, max)}</span>
        </label>
      ))}
    </div>
  );
}
