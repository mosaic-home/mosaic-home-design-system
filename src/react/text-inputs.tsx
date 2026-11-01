// text-inputs group: React bindings. Same DOM and classes as the web renderer; native controls stay controlled
// through `value` / `onChange` (or uncontrolled through `defaultValue`).
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { mdiCheck, mdiChevronDown, mdiClose, mdiContentCopy, mdiEyeOffOutline, mdiEyeOutline, mdiMagnify, mdiMinus, mdiPlus } from '@mdi/js';
import { cx } from '../web/dom.ts';
import type { IconName } from '../web/icons.ts';
import { fieldClass, fieldCountText, fieldStatus } from '../web/text-inputs/field.ts';
import { SEARCH_CLEAR_CLASS, searchFieldClass } from '../web/text-inputs/searchField.ts';
import { isOptionGroup, selectClass, type SelectItem, type SelectOption } from '../web/text-inputs/select.ts';
import { autoSize } from '../web/text-inputs/textArea.ts';
import { inputClass, type InputSize } from '../web/text-inputs/textField.ts';
import { Icon } from './foundations.tsx';
import { buttonClass } from '../web/actions/button.ts';
import { COMPOSER_ACTIONS, composerClass, composerClearLabel, composerEnterKeyHint, composerShouldSubmit, type ComposerActionKind, type ComposerEnterSends, type ComposerMode } from '../web/text-inputs/composer.ts';
import { IconButton, type IconButtonProps } from './actions.tsx';
import { Chip } from './choice-inputs.tsx';
import { holdToRepeat, nextEnabled, revealOption } from '../web/text-inputs/listbox.ts';
import {
  attachScrub,
  clampNumber,
  formatNumber,
  NUMBER_INPUT_LABELS,
  numberInputClass,
  numberInputKey,
  numberInputMode,
  numberInputRange,
  numberInputValueText,
  parseNumber,
  SCRUB_ICON,
} from '../web/text-inputs/numberInput.ts';
import { copyText, INPUT_ACTION_CLASS, SECRET_COPIED_MS, secretFieldClass, secretInputAttrs, secretLabels, type SecretKind } from '../web/text-inputs/secretField.ts';
import { HOTKEY_TEXT, hotkeyDisplay, hotkeyFieldClass, hotkeyKeyAction, hotkeySpoken, hotkeyToString, isApplePlatform, isModifierKey, parseHotkey, type Hotkey } from '../web/text-inputs/hotkeyField.ts';
import { commandBarBoxClass, commandBarClass, commandSuggestionsFor, historyStep, pushHistory, type CommandSuggestion, type CommandSuggestions } from '../web/text-inputs/commandBar.ts';
import { DURATION_ICON, DURATION_TEXT, durationError, durationFieldClass, durationPreview, formatDuration, parseDuration, type DurationMessages, type DurationUnit } from '../web/text-inputs/durationField.ts';
import {
  filterMultiSelect,
  flattenMultiSelect,
  isMultiSelectGroup,
  MULTI_SELECT_TEXT,
  multiSelectAnnouncement,
  multiSelectBoxClass,
  multiSelectClass,
  multiSelectOptionId,
  toggleValue,
  type MultiSelectItem,
  type MultiSelectOption,
} from '../web/text-inputs/multiSelect.ts';
import {
  TRANSFER_BUTTON_CLASS,
  TRANSFER_ICONS,
  TRANSFER_TEXT,
  transferCount,
  transferKey,
  transferListClass,
  transferMove,
  transferNormalize,
  transferSideItems,
  type TransferItem,
  type TransferSide,
} from '../web/text-inputs/transferList.ts';

/** What `Field` passes to its control: spread these onto the input, select or textarea. */
export interface FieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  'aria-labelledby'?: string;
  'aria-required'?: true;
  required?: boolean;
}

export interface FieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  label: ReactNode;
  helper?: string;
  error?: string;
  success?: string;
  required?: boolean;
  labelStyle?: 'label' | 'eyebrow';
  /** Counter text (see `fieldCountText`); the counter is rendered when this is set. */
  count?: string;
  disabled?: boolean;
  /** The control's id; generated otherwise. */
  controlId?: string;
  /** The control is not an input, select or textarea: the label becomes a span the control references. */
  group?: boolean;
  /** The control, or a function that receives the ids and ARIA to spread onto it. */
  children: ReactNode | ((control: FieldControlProps) => ReactNode);
}

/** Same DOM and classes as `createField`. */
export function Field({ label, helper, error, success, required, labelStyle, count, disabled, controlId, group, children, className, ...rest }: FieldProps) {
  const auto = useId();
  const id = controlId ?? `${auto}control`;
  const labelId = `${auto}label`;
  const messageId = `${auto}message`;
  const status = fieldStatus(error, success);
  const text = error || success || helper || '';
  const control: FieldControlProps = {
    id,
    'aria-describedby': text ? messageId : undefined,
    'aria-invalid': status === 'error' ? true : undefined,
    'aria-labelledby': group ? labelId : undefined,
    'aria-required': group && required ? true : undefined,
    required: !group && required ? true : undefined,
  };
  const marker = required ? (
    <span className="mh-field__required" aria-hidden="true">
      *
    </span>
  ) : null;
  return (
    <div {...rest} className={cx(fieldClass(status, labelStyle, disabled), className)}>
      {group ? (
        <span className="mh-field__label" id={labelId}>
          {label}
          {marker}
        </span>
      ) : (
        <label className="mh-field__label" id={labelId} htmlFor={id}>
          {label}
          {marker}
        </label>
      )}
      {typeof children === 'function' ? children(control) : children}
      <div className="mh-field__footer">
        <p className="mh-field__message" id={messageId} aria-live="polite" hidden={!text}>
          {text}
        </p>
        {count !== undefined && <span className="mh-field__count">{count}</span>}
      </div>
    </div>
  );
}

/** Focuses the native control when the padding or an adornment of the box is pressed. */
function boxMouseDown(ref: RefObject<HTMLElement | null>) {
  return (event: MouseEvent<HTMLElement>) => {
    const control = ref.current;
    if (control && event.target !== control && !(event.target as Element).closest('button')) {
      event.preventDefault();
      control.focus();
    }
  };
}

function Adornment({ end, children }: { end?: boolean; children: ReactNode }) {
  return <span className={cx('mh-input__adornment', end && 'mh-input__adornment--end')}>{children}</span>;
}

/** Tracks the length of a controlled or uncontrolled value, for the counter. */
function useLength(value: unknown, defaultValue: unknown): [number, (n: number) => void] {
  const [inner, setInner] = useState(String(defaultValue ?? '').length);
  return [value !== undefined && value !== null ? String(value).length : inner, setInner];
}

interface FieldParts {
  label?: ReactNode;
  helper?: string;
  error?: string;
  success?: string;
  labelStyle?: 'label' | 'eyebrow';
}

export interface TextFieldProps extends FieldParts, Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  size?: InputSize;
  icon?: IconName | string;
  prefix?: string;
  suffix?: string;
  showCount?: boolean;
}

/** Same DOM and classes as `createTextField`. */
export function TextField({ label, helper, error, success, labelStyle, size, icon, prefix, suffix, showCount, required, disabled, className, type = 'text', value, defaultValue, onChange, maxLength, ...rest }: TextFieldProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [length, setLength] = useLength(value, defaultValue);
  const box = (control?: FieldControlProps) => (
    <div className={inputClass(size, cx(disabled && 'is-disabled', className))} onMouseDown={boxMouseDown(ref)}>
      {icon && (
        <Adornment>
          <Icon icon={icon} />
        </Adornment>
      )}
      {prefix && <Adornment>{prefix}</Adornment>}
      <input
        {...rest}
        {...control}
        ref={ref}
        className="mh-input__control"
        type={type}
        value={value}
        defaultValue={defaultValue}
        maxLength={maxLength}
        disabled={disabled}
        required={control?.required ?? required}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setLength(event.target.value.length);
          onChange?.(event);
        }}
      />
      {suffix && <Adornment end>{suffix}</Adornment>}
    </div>
  );
  if (!label) return box();
  return (
    <Field label={label} helper={helper} error={error} success={success} required={required} labelStyle={labelStyle} disabled={disabled} controlId={rest.id} count={showCount ? fieldCountText(length, maxLength) : undefined}>
      {box}
    </Field>
  );
}

export interface TextAreaProps extends FieldParts, TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Grows with its text up to this many rows (default 10). */
  maxRows?: number;
  /** Grow with the text (default true). */
  autoGrow?: boolean;
  showCount?: boolean;
}

/** Same DOM and classes as `createTextArea`; grows with its text after each change. */
export function TextArea({ label, helper, error, success, labelStyle, maxRows, autoGrow = true, showCount, required, disabled, className, rows = 3, value, defaultValue, onChange, maxLength, ...rest }: TextAreaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [length, setLength] = useLength(value, defaultValue);
  useLayoutEffect(() => {
    if (autoGrow && ref.current) autoSize(ref.current, maxRows);
  }, [autoGrow, maxRows, value, length]);
  const box = (control?: FieldControlProps) => (
    <div className={inputClass('medium', cx('mh-input--multiline', disabled && 'is-disabled', className))} onMouseDown={boxMouseDown(ref)}>
      <textarea
        {...rest}
        {...control}
        ref={ref}
        className="mh-input__control"
        rows={rows}
        value={value}
        defaultValue={defaultValue}
        maxLength={maxLength}
        disabled={disabled}
        required={control?.required ?? required}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
          setLength(event.target.value.length);
          onChange?.(event);
        }}
      />
    </div>
  );
  if (!label) return box();
  return (
    <Field label={label} helper={helper} error={error} success={success} required={required} labelStyle={labelStyle} disabled={disabled} controlId={rest.id} count={showCount ? fieldCountText(length, maxLength) : undefined}>
      {box}
    </Field>
  );
}

export interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'value' | 'defaultValue'> {
  /** Accessible name (default "Search"). */
  label?: string;
  value?: string;
  defaultValue?: string;
  size?: InputSize;
  clearLabel?: string;
  /** `role="search"` on the box; for a page's main search only. */
  landmark?: boolean;
  /** Called with the new text on every change, including the clear button and Escape. */
  onValueChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
}

/** Same DOM and classes as `createSearchField`. Clearing calls `onValueChange('')` and `onClear`. */
export function SearchField({ label = 'Search', value, defaultValue, size, clearLabel = 'Clear search', landmark, onValueChange, onSearch, onClear, onChange, onKeyDown, disabled, className, ...rest }: SearchFieldProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [inner, setInner] = useState(defaultValue ?? '');
  const current = value ?? inner;
  const clear = () => {
    setInner('');
    onValueChange?.('');
    onClear?.();
    ref.current?.focus();
  };
  return (
    <div className={cx(searchFieldClass(size), disabled && 'is-disabled', className)} role={landmark ? 'search' : undefined} onMouseDown={boxMouseDown(ref)}>
      <Adornment>
        <Icon icon={mdiMagnify} />
      </Adornment>
      <input
        autoComplete="off"
        enterKeyHint="search"
        {...rest}
        ref={ref}
        className="mh-input__control"
        type="search"
        aria-label={label}
        value={current}
        disabled={disabled}
        onChange={(event) => {
          setInner(event.target.value);
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
          onKeyDown?.(event);
          if (event.key === 'Escape' && current !== '') {
            event.preventDefault();
            event.stopPropagation();
            clear();
          } else if (event.key === 'Enter') onSearch?.(current);
        }}
      />
      <button type="button" className={SEARCH_CLEAR_CLASS} aria-label={clearLabel} title={clearLabel} hidden={current === '' || disabled} onClick={clear}>
        <Icon icon={mdiClose} />
      </button>
    </div>
  );
}

export interface SelectProps extends FieldParts, Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: readonly SelectItem[];
  /** A first, empty choice shown until one is picked. */
  placeholder?: string;
  size?: InputSize;
}

const renderOption = (o: SelectOption) => (
  <option key={o.value} value={o.value} disabled={o.disabled}>
    {o.label}
  </option>
);

/** Same DOM and classes as `createSelect`: a styled native select. */
export function Select({ label, helper, error, success, labelStyle, options, placeholder, size, required, disabled, className, value, defaultValue, ...rest }: SelectProps) {
  const box = (control?: FieldControlProps) => (
    <div className={cx(selectClass(size), disabled && 'is-disabled', className)}>
      <select
        {...rest}
        {...control}
        className="mh-input__control"
        value={value}
        defaultValue={value === undefined && defaultValue === undefined && placeholder !== undefined ? '' : defaultValue}
        disabled={disabled}
        required={control?.required ?? required}
      >
        {placeholder !== undefined && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((item) =>
          isOptionGroup(item) ? (
            <optgroup key={`g:${item.label}`} label={item.label}>
              {item.options.map(renderOption)}
            </optgroup>
          ) : (
            renderOption(item)
          ),
        )}
      </select>
      <span className="mh-select__chevron">
        <Icon icon={mdiChevronDown} />
      </span>
    </div>
  );
  if (!label) return box();
  return (
    <Field label={label} helper={helper} error={error} success={success} required={required} labelStyle={labelStyle} disabled={disabled} controlId={rest.id}>
      {box}
    </Field>
  );
}

export interface ComposerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onInput' | 'onSubmit' | 'children' | 'defaultValue'> {
  /** Controlled text; pair with `onInput`. */
  value?: string;
  defaultValue?: string;
  /** Accessible name of the text area (default "Message"). */
  ariaLabel?: string;
  placeholder?: string;
  name?: string;
  /** Grows with its text up to this many lines, then scrolls (default 6). */
  maxRows?: number;
  enterSends?: ComposerEnterSends;
  disabled?: boolean;
  disabledReason?: string;
  onRetry?: () => void;
  retryLabel?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  mode?: ComposerMode | null;
  suggestions?: readonly string[];
  suggestionsLabel?: string;
  onSuggestion?: (text: string) => void;
  onInput?: (value: string, event: ChangeEvent<HTMLTextAreaElement>) => void;
  /** Called with non-blank text when Enter sends (see `enterSends`); the composer doesn't clear itself. */
  onSubmit?: (value: string) => void;
  /** The text area, e.g. to focus it after sending. */
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
}

const filled = (node: ReactNode): boolean => node !== null && node !== undefined && node !== false;

/** Same DOM and classes as `createComposer`; grows with its text after each change. */
export function Composer({
  value,
  defaultValue,
  ariaLabel = 'Message',
  placeholder,
  name,
  maxRows = 6,
  enterSends = 'auto',
  disabled = false,
  disabledReason,
  onRetry,
  retryLabel = 'Retry',
  leading,
  trailing,
  mode,
  suggestions,
  suggestionsLabel = 'Suggestions',
  onSuggestion,
  onInput,
  onSubmit,
  textareaRef,
  className,
  ...rest
}: ComposerProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const auto = useId();
  const modeId = `${auto}mode`;
  const reasonId = `${auto}reason`;
  const reason = disabled && disabledReason ? disabledReason : '';
  const describedBy = [mode && modeId, reason && reasonId].filter(Boolean).join(' ') || undefined;
  useLayoutEffect(() => {
    if (ref.current) autoSize(ref.current, maxRows);
  }, [maxRows, value]);
  const submit = () => {
    const text = ref.current?.value ?? '';
    if (!disabled && text.trim() !== '') onSubmit?.(text);
  };
  return (
    <div {...rest} className={cx(composerClass(disabled, !!mode), className)}>
      {suggestions && suggestions.length > 0 && (
        <div className="mh-composer__suggestions" role="group" aria-label={suggestionsLabel}>
          {suggestions.map((text, i) => (
            <button key={`${i}:${text}`} type="button" className="mh-composer__suggestion" disabled={disabled} onClick={() => onSuggestion?.(text)}>
              {text}
            </button>
          ))}
        </div>
      )}
      <div className="mh-composer__notice" hidden={!reason}>
        <p className="mh-composer__reason" id={reasonId} aria-live="polite">
          {reason}
        </p>
        {onRetry && (
          <button type="button" className={buttonClass('text', 'small')} onClick={onRetry}>
            <span className="mh-button__label">{retryLabel}</span>
          </button>
        )}
      </div>
      <div
        className="mh-composer__field"
        onMouseDown={(event) => {
          const control = ref.current;
          if (control && event.target !== control && !(event.target as Element).closest('button')) {
            event.preventDefault();
            control.focus();
          }
        }}
      >
        {mode && (
          <div className="mh-composer__mode">
            {mode.icon && <Icon icon={mode.icon} className="mh-composer__mode-icon" />}
            <span className="mh-composer__mode-text" id={modeId}>
              <span className="mh-composer__mode-label">{mode.label}</span>
              {mode.hint && <span className="mh-composer__mode-hint">{mode.hint}</span>}
            </span>
            <button type="button" className="mh-composer__mode-clear" aria-label={composerClearLabel(mode)} title={composerClearLabel(mode)} onClick={() => mode.onClear()}>
              <Icon icon={mdiClose} />
            </button>
          </div>
        )}
        <div className="mh-composer__row">
          {filled(leading) && <div className="mh-composer__leading">{leading}</div>}
          <textarea
            ref={(node) => {
              ref.current = node;
              if (textareaRef) textareaRef.current = node;
            }}
            className="mh-composer__input"
            rows={1}
            name={name}
            placeholder={placeholder}
            aria-label={ariaLabel}
            aria-describedby={describedBy}
            enterKeyHint={composerEnterKeyHint(enterSends)}
            disabled={disabled}
            value={value}
            defaultValue={defaultValue}
            onChange={(event) => {
              autoSize(event.target, maxRows);
              onInput?.(event.target.value, event);
            }}
            onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
              if (composerShouldSubmit(enterSends, { key: event.key, shiftKey: event.shiftKey, altKey: event.altKey, ctrlKey: event.ctrlKey, metaKey: event.metaKey, isComposing: event.nativeEvent.isComposing })) {
                event.preventDefault();
                submit();
              }
            }}
          />
          {filled(trailing) && <div className="mh-composer__trailing">{trailing}</div>}
        </div>
      </div>
    </div>
  );
}

export interface ComposerActionProps extends Omit<IconButtonProps, 'icon' | 'label' | 'tone' | 'size' | 'filled'> {
  kind: ComposerActionKind;
  /** Accessible name; defaults per kind ("Send", "Dictate", ...). */
  label?: string;
}

/** Same DOM and classes as `createComposerAction`: an icon button sized and toned for a composer slot. */
export function ComposerAction({ kind, label, ...rest }: ComposerActionProps) {
  const style = COMPOSER_ACTIONS[kind];
  return <IconButton {...rest} icon={style.icon} label={label ?? style.label} tone={style.tone} size={style.size} filled={style.filled} />;
}

/** A value that is controlled when `value` is given, else kept inside, starting from `initial`. */
function useControlled<T>(value: T | undefined, initial: () => T): [T, (next: T) => void] {
  const [inner, setInner] = useState<T>(initial);
  return [value !== undefined ? value : inner, setInner];
}

/** Keeps a ref pointing at the latest value, for listeners attached once. */
function useLatest<T>(value: T): RefObject<T> {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}

export interface NumberInputProps extends FieldParts {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  largeStep?: number;
  precision?: number;
  unit?: string;
  prefix?: string;
  valueText?: (value: number) => string;
  scrub?: boolean;
  scrubDistance?: number;
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  size?: InputSize;
  decreaseLabel?: string;
  increaseLabel?: string;
  /** Accessible name without a visible label. */
  'aria-label'?: string;
  className?: string;
  onChange?: (value: number) => void;
}

/** Same DOM and classes as `createNumberInput`. Typed text is committed on Enter or blur; Escape reverts it. */
export function NumberInput({
  label,
  helper,
  error,
  success,
  labelStyle,
  value: valueProp,
  defaultValue,
  min,
  max,
  step,
  largeStep,
  precision,
  unit,
  prefix,
  valueText,
  scrub = true,
  scrubDistance = 8,
  name,
  id,
  required,
  disabled = false,
  size,
  decreaseLabel = NUMBER_INPUT_LABELS.decrease,
  increaseLabel = NUMBER_INPUT_LABELS.increase,
  'aria-label': ariaLabel,
  className,
  onChange,
}: NumberInputProps) {
  const range = useMemo(() => numberInputRange({ min, max, step, largeStep, precision }), [min, max, step, largeStep, precision]);
  const [stored, setStored] = useControlled(valueProp, () => clampNumber(defaultValue ?? (Number.isFinite(range.min) ? Math.max(range.min, 0) : 0), range));
  const value = clampNumber(stored, range);
  const [draft, setDraft] = useState<string | null>(null);
  const decRef = useRef<HTMLButtonElement>(null);
  const incRef = useRef<HTMLButtonElement>(null);
  const unitRef = useRef<HTMLSpanElement>(null);

  const set = (next: number): void => {
    const clamped = clampNumber(next, range);
    setDraft(null);
    if (clamped === value) return;
    setStored(clamped);
    onChange?.(clamped);
  };
  const current = (): number => (draft === null ? value : (parseNumber(draft) ?? value));
  const latest = useLatest({ set, current, range, disabled });

  useEffect(() => {
    const off: (() => void)[] = [];
    if (decRef.current) off.push(holdToRepeat(decRef.current, () => latest.current.set(latest.current.current() - latest.current.range.step)));
    if (incRef.current) off.push(holdToRepeat(incRef.current, () => latest.current.set(latest.current.current() + latest.current.range.step)));
    if (scrub && unitRef.current)
      off.push(
        attachScrub(unitRef.current, {
          distance: scrubDistance,
          enabled: () => !latest.current.disabled,
          onStep: (steps, large) => latest.current.set(latest.current.current() + steps * (large ? latest.current.range.largeStep : latest.current.range.step)),
        }),
      );
    return () => off.forEach((f) => f());
  }, [scrub, scrubDistance, latest]);

  const inputRef = useRef<HTMLInputElement>(null);
  const spoken = numberInputValueText(value, range, unit, valueText);
  const box = (control?: FieldControlProps) => (
    <div className={cx(numberInputClass(size, disabled), className)} onMouseDown={boxMouseDown(inputRef)}>
      <button ref={decRef} type="button" className="mh-number-input__step" tabIndex={-1} aria-label={decreaseLabel} title={decreaseLabel} disabled={disabled || value <= range.min}>
        <Icon icon={mdiMinus} />
      </button>
      {prefix && <Adornment>{prefix}</Adornment>}
      <input
        {...control}
        ref={inputRef}
        className="mh-input__control mh-number-input__control"
        type="text"
        role="spinbutton"
        name={name}
        inputMode={numberInputMode(range)}
        autoComplete="off"
        spellCheck={false}
        aria-valuemin={Number.isFinite(range.min) ? range.min : undefined}
        aria-valuemax={Number.isFinite(range.max) ? range.max : undefined}
        aria-valuenow={value}
        aria-valuetext={spoken}
        aria-label={label ? undefined : ariaLabel}
        required={control?.required ?? required}
        disabled={disabled}
        value={draft ?? formatNumber(value, range.precision)}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          if (draft !== null) set(current());
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') return set(current());
          if (event.key === 'Escape') {
            if (draft !== null && draft !== formatNumber(value, range.precision)) {
              event.preventDefault();
              event.stopPropagation();
            }
            setDraft(null);
            return;
          }
          const next = numberInputKey(event.key, current(), range);
          if (next === null) return;
          event.preventDefault();
          set(next);
        }}
      />
      {(unit || scrub) && (
        <span ref={unitRef} className={cx('mh-input__adornment', 'mh-input__adornment--end', 'mh-number-input__unit', scrub && 'mh-number-input__scrub')} aria-hidden="true" title={scrub ? NUMBER_INPUT_LABELS.scrub : undefined}>
          {unit ? unit : <Icon icon={SCRUB_ICON} />}
        </span>
      )}
      <button ref={incRef} type="button" className="mh-number-input__step" tabIndex={-1} aria-label={increaseLabel} title={increaseLabel} disabled={disabled || value >= range.max}>
        <Icon icon={mdiPlus} />
      </button>
    </div>
  );
  if (!label) return box();
  return (
    <Field label={label} helper={helper} error={error} success={success} required={required} labelStyle={labelStyle} disabled={disabled} controlId={id}>
      {box}
    </Field>
  );
}

export interface SecretFieldProps extends FieldParts {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  kind?: SecretKind;
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  size?: InputSize;
  icon?: IconName | string;
  /** Controlled reveal state; pair with `onRevealChange`. */
  revealed?: boolean;
  defaultRevealed?: boolean;
  copyable?: boolean;
  revealLabel?: string;
  copyLabel?: string;
  copiedText?: string;
  copyFailedText?: string;
  'aria-label'?: string;
  className?: string;
  /** Called with the new text on every change. */
  onValueChange?: (value: string) => void;
  onRevealChange?: (revealed: boolean) => void;
  onCopy?: (ok: boolean) => void;
}

/** Same DOM and classes as `createSecretField`. */
export function SecretField({
  label,
  helper,
  error,
  success,
  labelStyle,
  value: valueProp,
  defaultValue,
  placeholder,
  kind = 'password',
  name,
  id,
  required,
  disabled = false,
  readOnly,
  size,
  icon,
  revealed: revealedProp,
  defaultRevealed = false,
  copyable,
  revealLabel,
  copyLabel,
  copiedText,
  copyFailedText,
  'aria-label': ariaLabel,
  className,
  onValueChange,
  onRevealChange,
  onCopy,
}: SecretFieldProps) {
  const labels = secretLabels(kind);
  const [value, setValue] = useControlled(valueProp, () => defaultValue ?? '');
  const [revealed, setRevealed] = useControlled(revealedProp, () => defaultRevealed);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const reveal = revealLabel ?? labels.reveal;
  const copyName = copyLabel ?? labels.copy;
  const showCopy = copyable ?? kind === 'key';
  const copy = async (): Promise<void> => {
    const ok = await copyText(value);
    setStatus(ok ? (copiedText ?? labels.copied) : (copyFailedText ?? labels.failed));
    if (ok) {
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setCopied(false);
        setStatus('');
      }, SECRET_COPIED_MS);
    }
    onCopy?.(ok);
  };
  const attrs = secretInputAttrs(kind);
  const box = (control?: FieldControlProps) => (
    <div className={cx(secretFieldClass(size, kind, disabled), className)} onMouseDown={boxMouseDown(inputRef)}>
      {icon && (
        <Adornment>
          <Icon icon={icon} />
        </Adornment>
      )}
      <input
        {...control}
        ref={inputRef}
        className="mh-input__control"
        type={revealed ? 'text' : 'password'}
        name={name}
        placeholder={placeholder}
        readOnly={readOnly}
        autoComplete={attrs.autocomplete}
        spellCheck={false}
        autoCapitalize={attrs.autocapitalize}
        aria-label={label ? undefined : ariaLabel}
        required={control?.required ?? required}
        disabled={disabled}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          onValueChange?.(event.target.value);
        }}
      />
      <button
        type="button"
        className={cx(INPUT_ACTION_CLASS, 'mh-secret__reveal')}
        aria-label={reveal}
        title={reveal}
        aria-pressed={revealed}
        disabled={disabled}
        onClick={() => {
          setRevealed(!revealed);
          onRevealChange?.(!revealed);
        }}
      >
        <Icon icon={revealed ? mdiEyeOffOutline : mdiEyeOutline} />
      </button>
      {showCopy && (
        <button type="button" className={cx(INPUT_ACTION_CLASS, 'mh-secret__copy', copied && 'is-copied')} aria-label={copyName} title={copyName} disabled={disabled || value === ''} onClick={() => void copy()}>
          <Icon icon={copied ? mdiCheck : mdiContentCopy} />
        </button>
      )}
      <span className="mh-visually-hidden" role="status">
        {status}
      </span>
    </div>
  );
  if (!label) return box();
  return (
    <Field label={label} helper={helper} error={error} success={success} required={required} labelStyle={labelStyle} disabled={disabled} controlId={id}>
      {box}
    </Field>
  );
}

export interface HotkeyFieldProps extends FieldParts {
  /** Canonical text (`Ctrl+Shift+K`); empty for none. Pair with `onChange`. */
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  recordingText?: string;
  requireModifier?: boolean;
  appleSymbols?: boolean;
  clearable?: boolean;
  clearLabel?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  size?: InputSize;
  'aria-label'?: string;
  className?: string;
  onChange?: (value: string) => void;
}

const canonicalHotkey = (text: string | undefined): string => {
  const k = parseHotkey(text ?? '');
  return k ? hotkeyToString(k) : '';
};

/** Same DOM and classes as `createHotkeyField`. */
export function HotkeyField({
  label,
  helper,
  error,
  labelStyle,
  value: valueProp,
  defaultValue,
  placeholder,
  recordingText,
  requireModifier,
  appleSymbols,
  clearable = true,
  clearLabel = HOTKEY_TEXT.clear,
  name,
  required,
  disabled = false,
  size,
  'aria-label': ariaLabel,
  className,
  onChange,
}: HotkeyFieldProps) {
  const auto = useId();
  const keysId = `${auto}keys`;
  const hintId = `${auto}hint`;
  const nameId = `${auto}name`;
  const [stored, setStored] = useControlled(valueProp, () => canonicalHotkey(defaultValue));
  const value = canonicalHotkey(stored);
  const [recording, setRecording] = useState(false);
  const [held, setHeld] = useState<Hotkey | null>(null);
  const [status, setStatus] = useState('');
  const swallowKeyUp = useRef(false);
  const controlRef = useRef<HTMLButtonElement>(null);
  const apple = appleSymbols ?? isApplePlatform();
  const isRecording = recording && !disabled;
  const display = hotkeyDisplay(value, isRecording, held, apple, placeholder, recordingText);
  const stop = (): void => {
    setRecording(false);
    setHeld(null);
  };
  const set = (next: string): void => {
    stop();
    if (next !== value) {
      setStored(next);
      onChange?.(next);
    }
  };
  const box = (control?: FieldControlProps) => (
    <div className={cx(hotkeyFieldClass(size, isRecording, disabled), className)}>
      <button
        ref={controlRef}
        type="button"
        className="mh-input__control mh-hotkey__control"
        id={control?.id}
        aria-labelledby={`${control?.['aria-labelledby'] ?? nameId} ${keysId}`}
        aria-describedby={[control?.['aria-describedby'], hintId].filter(Boolean).join(' ')}
        aria-invalid={control?.['aria-invalid']}
        aria-required={control?.['aria-required']}
        disabled={disabled}
        onClick={() => {
          if (recording || disabled) return;
          setRecording(true);
          setHeld(null);
          setStatus(`${recordingText ?? HOTKEY_TEXT.recording}. ${HOTKEY_TEXT.hint}`);
        }}
        onBlur={() => {
          if (recording) stop();
        }}
        onKeyDown={(event) => {
          const action = hotkeyKeyAction(event, isRecording, requireModifier);
          if (action.type === 'ignore') return;
          if (!(action.type === 'cancel' && action.leave)) event.preventDefault();
          event.stopPropagation();
          switch (action.type) {
            case 'cancel':
              stop();
              setStatus('');
              return;
            case 'clear':
              swallowKeyUp.current = true;
              set('');
              setStatus(isRecording ? '' : clearLabel);
              return;
            case 'pending':
              setHeld(action.held);
              return;
            case 'needs-modifier':
              setStatus(HOTKEY_TEXT.needsModifier);
              return;
            case 'set':
              swallowKeyUp.current = true;
              set(hotkeyToString(action.hotkey));
              setStatus(hotkeySpoken(action.hotkey, apple));
              return;
          }
        }}
        onKeyUp={(event) => {
          if (swallowKeyUp.current) {
            event.preventDefault();
            swallowKeyUp.current = false;
          } else if (isRecording && isModifierKey(event.key)) {
            setHeld({ key: '', ctrl: event.ctrlKey, alt: event.altKey, shift: event.shiftKey, meta: event.metaKey });
          }
        }}
      >
        {!label && (
          <span className="mh-visually-hidden" id={nameId}>
            {ariaLabel ?? 'Shortcut'}
          </span>
        )}
        <span className="mh-hotkey__keys" id={keysId}>
          <span className="mh-visually-hidden">{display.spoken}</span>
          {display.caps.length ? (
            <span className="mh-hotkey__caps" aria-hidden="true">
              {display.caps.map((c, i) => (
                <kbd key={`${i}:${c}`} className="mh-hotkey__cap">
                  {c}
                </kbd>
              ))}
            </span>
          ) : (
            <span className={cx('mh-hotkey__text', display.empty && 'mh-hotkey__text--empty')} aria-hidden="true">
              {display.text}
            </span>
          )}
        </span>
      </button>
      {clearable && (
        <button
          type="button"
          className={cx(INPUT_ACTION_CLASS, 'mh-hotkey__clear')}
          aria-label={clearLabel}
          title={clearLabel}
          hidden={value === '' || isRecording || disabled}
          onClick={() => {
            set('');
            setStatus(clearLabel);
            controlRef.current?.focus();
          }}
        >
          <Icon icon={mdiClose} />
        </button>
      )}
      <span className="mh-visually-hidden" id={hintId}>
        {HOTKEY_TEXT.hint}
      </span>
      <span className="mh-visually-hidden" role="status">
        {status}
      </span>
      {name && <input type="hidden" name={name} value={value} />}
    </div>
  );
  if (!label) return box();
  return (
    <Field label={label} helper={helper} error={error} required={required} labelStyle={labelStyle} disabled={disabled} group>
      {box}
    </Field>
  );
}

export interface CommandBarProps {
  /** Controlled text; pair with `onValueChange`. */
  value?: string;
  defaultValue?: string;
  'aria-label'?: string;
  placeholder?: string;
  prompt?: string;
  name?: string;
  size?: InputSize;
  disabled?: boolean;
  suggestions?: CommandSuggestions;
  maxSuggestions?: number;
  /** Earlier commands to start with, oldest first. */
  defaultHistory?: readonly string[];
  historySize?: number;
  clearOnSubmit?: boolean;
  openUp?: boolean;
  listLabel?: string;
  className?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (command: string) => void;
}

/** Same DOM and classes as `createCommandBar`. */
export function CommandBar({
  value: valueProp,
  defaultValue,
  'aria-label': ariaLabel = 'Command',
  placeholder,
  prompt = '>',
  name,
  size,
  disabled = false,
  suggestions,
  maxSuggestions = 8,
  defaultHistory,
  historySize = 50,
  clearOnSubmit = true,
  openUp,
  listLabel = 'Suggestions',
  className,
  onValueChange,
  onSubmit,
}: CommandBarProps) {
  const listId = `${useId()}list`;
  const [text, setText] = useControlled(valueProp, () => defaultValue ?? '');
  const [shown, setShown] = useState<CommandSuggestion[]>([]);
  const [active, setActive] = useState(-1);
  const [history, setHistory] = useState<string[]>(() => [...(defaultHistory ?? [])].slice(-historySize));
  const nav = useRef({ index: -1, draft: '' });
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const open = shown.length > 0 && !disabled;
  useEffect(() => {
    if (open && active >= 0) revealOption(listRef.current?.children[active]);
  }, [open, active]);
  const fill = (next: string): void => {
    setText(next);
    onValueChange?.(next);
  };
  const close = (): void => {
    setShown([]);
    setActive(-1);
  };
  const take = (s: CommandSuggestion): void => {
    fill(s.value);
    close();
    inputRef.current?.focus();
  };
  const submit = (): void => {
    if (disabled || text.trim() === '') return;
    setHistory(pushHistory(history, text, historySize));
    nav.current = { index: -1, draft: '' };
    close();
    onSubmit?.(text);
    if (clearOnSubmit) fill('');
  };
  const optionId = (i: number): string => `${listId}-${i}`;
  return (
    <div className={cx(commandBarClass(open, disabled, openUp), className)}>
      <div className={cx(commandBarBoxClass(size), disabled && 'is-disabled')} onMouseDown={boxMouseDown(inputRef)}>
        <span className="mh-input__adornment mh-command-bar__prompt" aria-hidden="true">
          {prompt}
        </span>
        <input
          ref={inputRef}
          className="mh-input__control mh-command-bar__input"
          type="text"
          name={name}
          placeholder={placeholder}
          role="combobox"
          aria-label={ariaLabel}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="go"
          disabled={disabled}
          value={text}
          onChange={(event) => {
            nav.current.index = -1;
            fill(event.target.value);
            setShown(commandSuggestionsFor(suggestions, event.target.value, maxSuggestions));
            setActive(-1);
          }}
          onBlur={close}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing) return;
            switch (event.key) {
              case 'ArrowDown':
              case 'ArrowUp': {
                if (event.altKey) return;
                event.preventDefault();
                if (open) {
                  const n = shown.length;
                  setActive(event.key === 'ArrowDown' ? (active + 1) % n : active <= 0 ? n - 1 : active - 1);
                  return;
                }
                if (history.length === 0) return;
                const next = historyStep(history.length, nav.current.index, event.key);
                if (next === nav.current.index) return;
                if (nav.current.index === -1) nav.current.draft = text;
                nav.current.index = next;
                fill(next === -1 ? nav.current.draft : history[history.length - 1 - next]!);
                return;
              }
              case 'Tab':
                if (!open || event.shiftKey) return;
                event.preventDefault();
                take(shown[Math.max(active, 0)]!);
                return;
              case 'Enter':
                event.preventDefault();
                if (open && active >= 0) take(shown[active]!);
                else submit();
                return;
              case 'Escape':
                if (open) {
                  event.preventDefault();
                  event.stopPropagation();
                  close();
                } else if (text !== '') {
                  event.preventDefault();
                  event.stopPropagation();
                  nav.current.index = -1;
                  fill('');
                }
                return;
            }
          }}
        />
      </div>
      <ul ref={listRef} className="mh-command-bar__list" id={listId} role="listbox" aria-label={listLabel} hidden={!open}>
        {open &&
          shown.map((s, i) => (
            <li key={`${i}:${s.value}`} className={cx('mh-command-bar__option', i === active && 'is-active')} id={optionId(i)} role="option" aria-selected={i === active} onMouseDown={(event) => event.preventDefault()} onClick={() => take(s)}>
              <span className="mh-command-bar__value">{s.value}</span>
              {s.description && <span className="mh-command-bar__description">{s.description}</span>}
            </li>
          ))}
      </ul>
    </div>
  );
}

export interface DurationFieldProps extends FieldParts {
  /** Seconds, `null` for empty; pair with `onChange`. */
  value?: number | null;
  defaultValue?: number | null;
  placeholder?: string;
  defaultUnit?: DurationUnit;
  min?: number;
  max?: number;
  presets?: readonly number[];
  presetsLabel?: string;
  icon?: string | false;
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  size?: InputSize;
  messages?: Partial<DurationMessages>;
  'aria-label'?: string;
  className?: string;
  onChange?: (seconds: number | null) => void;
}

/** Same DOM and classes as `createDurationField`. */
export function DurationField({
  label,
  helper,
  error,
  labelStyle,
  value: valueProp,
  defaultValue,
  placeholder = DURATION_TEXT.placeholder,
  defaultUnit = 'm',
  min,
  max,
  presets,
  presetsLabel = DURATION_TEXT.presets,
  icon,
  name,
  id,
  required,
  disabled = false,
  size,
  messages,
  'aria-label': ariaLabel,
  className,
  onChange,
}: DurationFieldProps) {
  const [value, setValue] = useControlled<number | null>(valueProp, () => defaultValue ?? null);
  const [draft, setDraft] = useState<string | null>(null);
  const [ownError, setOwnError] = useState<string | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const text = draft ?? (value === null ? '' : formatDuration(value));
  const commit = (raw: string): void => {
    const seconds = parseDuration(raw, defaultUnit);
    const problem = durationError(seconds, raw, { min, max, required }, { ...DURATION_TEXT, ...messages });
    setOwnError(problem);
    if (problem) return setDraft(raw);
    const next = raw.trim() === '' ? null : seconds;
    setDraft(null);
    if (next !== value) {
      setValue(next);
      onChange?.(next);
    }
  };
  const box = (control?: FieldControlProps) => (
    <div className={cx('mh-duration', className)}>
      <div className={durationFieldClass(size, disabled)} onMouseDown={boxMouseDown(inputRef)}>
        {icon !== false && (
          <Adornment>
            <Icon icon={icon ?? DURATION_ICON} />
          </Adornment>
        )}
        <input
          {...control}
          ref={inputRef}
          className="mh-input__control"
          type="text"
          name={name}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          autoCapitalize="off"
          enterKeyHint="done"
          aria-label={label ? undefined : ariaLabel}
          required={control?.required ?? required}
          disabled={disabled}
          value={text}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => {
            if (draft !== null) commit(draft);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) commit(text);
          }}
        />
        <span className="mh-input__adornment mh-input__adornment--end mh-duration__preview" aria-hidden="true">
          {durationPreview(text, defaultUnit)}
        </span>
      </div>
      {presets && presets.length > 0 && (
        <div className="mh-duration__presets" role="group" aria-label={presetsLabel}>
          {presets.map((seconds) => (
            <button key={seconds} type="button" className="mh-duration__preset" aria-pressed={seconds === value} title={formatDuration(seconds, 'long')} disabled={disabled} onClick={() => commit(formatDuration(seconds))}>
              {formatDuration(seconds)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
  if (!label) return box();
  return (
    <Field label={label} helper={helper} error={ownError ?? error} required={required} labelStyle={labelStyle} disabled={disabled} controlId={id}>
      {box}
    </Field>
  );
}

export interface MultiSelectProps extends FieldParts {
  options: readonly MultiSelectItem[];
  /** Controlled selection, in the order picked; pair with `onChange`. */
  values?: readonly string[];
  defaultValues?: readonly string[];
  placeholder?: string;
  emptyText?: string;
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  size?: InputSize;
  'aria-label'?: string;
  className?: string;
  onChange?: (values: string[]) => void;
}

/** Same DOM and classes as `createMultiSelect`. */
export function MultiSelect({
  label,
  helper,
  error,
  labelStyle,
  options,
  values: valuesProp,
  defaultValues,
  placeholder,
  emptyText = MULTI_SELECT_TEXT.empty,
  name,
  id,
  required,
  disabled = false,
  size,
  'aria-label': ariaLabel,
  className,
  onChange,
}: MultiSelectProps) {
  const listId = `${useId()}list`;
  const [values, setValues] = useControlled<readonly string[]>(valuesProp, () => defaultValues ?? []);
  const [query, setQuery] = useState('');
  const [openState, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const open = openState && !disabled;
  const all = flattenMultiSelect(options);
  const filtered = filterMultiSelect(options, query);
  const visible = flattenMultiSelect(filtered);
  const activeShown = open && active !== null && visible.some((o) => o.value === active);
  const activeId = activeShown ? multiSelectOptionId(listId, options, active!) : undefined;

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside, true);
    return () => document.removeEventListener('pointerdown', outside, true);
  }, [open]);
  useEffect(() => {
    if (activeId) revealOption(listRef.current?.querySelector(`[id="${activeId}"]`));
  }, [activeId]);

  const toggle = (value: string): void => {
    const o = all.find((x) => x.value === value);
    if (!o || disabled) return;
    const added = !values.includes(value);
    const next = toggleValue(values, value);
    setValues(next);
    setQuery('');
    setStatus(multiSelectAnnouncement(o.label, added));
    onChange?.(next);
  };
  const openAt = (from: 'first' | 'last' | 'keep', list: MultiSelectOption[] = visible): void => {
    setOpen(true);
    if (from !== 'keep' || !list.some((o) => o.value === active)) {
      const i = from === 'last' ? nextEnabled(list, list.length, -1) : nextEnabled(list, -1, 1);
      setActive(list[i]?.value ?? null);
    }
  };
  const move = (delta: 1 | -1): void => {
    const i = nextEnabled(visible, visible.findIndex((o) => o.value === active), delta, true);
    setActive(visible[i]?.value ?? active);
  };
  const renderOption = (o: MultiSelectOption) => (
    <div
      key={o.value}
      className={cx('mh-multi-select__option', o.value === active && 'is-active')}
      id={multiSelectOptionId(listId, options, o.value)}
      role="option"
      aria-selected={values.includes(o.value)}
      aria-disabled={o.disabled ? true : undefined}
      onClick={() => {
        if (o.disabled) return;
        setActive(o.value);
        toggle(o.value);
      }}
    >
      <span className="mh-multi-select__check">
        <Icon icon={mdiCheck} />
      </span>
      {o.icon && <Icon icon={o.icon} className="mh-multi-select__icon" />}
      <span className="mh-multi-select__text">
        <span className="mh-multi-select__label">{o.label}</span>
        {o.description && <span className="mh-multi-select__description">{o.description}</span>}
      </span>
    </div>
  );
  const control = (field?: FieldControlProps) => (
    <div
      ref={rootRef}
      className={cx(multiSelectClass(open, disabled), className)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setQuery('');
          setOpen(false);
        }
      }}
    >
      <div
        className={multiSelectBoxClass(size, disabled)}
        onMouseDown={(event) => {
          if ((event.target as Element).closest('button') || disabled) return;
          if (event.target !== inputRef.current) event.preventDefault();
          inputRef.current?.focus();
          if (open) setOpen(false);
          else openAt('keep');
        }}
      >
        <span className="mh-multi-select__chips">
          {values.map((v) => {
            const o = all.find((x) => x.value === v);
            return (
              <Chip
                key={v}
                label={o?.label ?? v}
                icon={o?.icon}
                removable
                disabled={disabled}
                onRemove={() => {
                  toggle(v);
                  inputRef.current?.focus();
                }}
              />
            );
          })}
        </span>
        <input
          {...field}
          ref={inputRef}
          className="mh-input__control mh-multi-select__input"
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-haspopup="listbox"
          aria-activedescendant={activeId}
          aria-required={required ? true : undefined}
          autoComplete="off"
          spellCheck={false}
          aria-label={label ? undefined : ariaLabel}
          placeholder={values.length === 0 && placeholder ? placeholder : undefined}
          required={undefined}
          disabled={disabled}
          value={query}
          onChange={(event) => {
            const q = event.target.value;
            setQuery(q);
            const v = flattenMultiSelect(filterMultiSelect(options, q));
            setActive(v[nextEnabled(v, -1, 1)]?.value ?? null);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing || disabled) return;
            switch (event.key) {
              case 'ArrowDown':
                event.preventDefault();
                if (!open) openAt('first');
                else move(1);
                return;
              case 'ArrowUp':
                event.preventDefault();
                if (event.altKey) setOpen(false);
                else if (!open) openAt('last');
                else move(-1);
                return;
              case 'Enter':
                if (!open) return;
                event.preventDefault();
                if (active !== null && !all.find((o) => o.value === active)?.disabled) toggle(active);
                return;
              case 'Escape':
                if (open) {
                  event.preventDefault();
                  event.stopPropagation();
                  setOpen(false);
                } else if (query) {
                  event.preventDefault();
                  event.stopPropagation();
                  setQuery('');
                }
                return;
              case 'Backspace':
                if (query === '' && values.length > 0) {
                  event.preventDefault();
                  toggle(values.at(-1)!);
                }
                return;
              case 'Tab':
                setOpen(false);
                return;
            }
          }}
        />
        <span className="mh-multi-select__chevron">
          <Icon icon={mdiChevronDown} />
        </span>
      </div>
      <div className="mh-multi-select__popup" hidden={!open} onMouseDown={(event) => event.preventDefault()}>
        <div ref={listRef} className="mh-multi-select__list" id={listId} role="listbox" aria-multiselectable="true" aria-label={typeof label === 'string' ? label : ariaLabel}>
          {filtered.map((item, i) => {
            if (!isMultiSelectGroup(item)) return renderOption(item);
            const gid = `${listId}-g${i}`;
            return (
              <div key={`g:${item.label}`} className="mh-multi-select__group" role="group" aria-labelledby={gid}>
                <div className="mh-multi-select__group-label" id={gid} role="presentation">
                  {item.label}
                </div>
                {item.options.map(renderOption)}
              </div>
            );
          })}
        </div>
        <p className="mh-multi-select__empty" hidden={filtered.length > 0}>
          {emptyText}
        </p>
      </div>
      <span className="mh-visually-hidden" role="status">
        {status}
      </span>
      {name && (
        <span hidden>
          {values.map((v) => (
            <input key={v} type="hidden" name={name} value={v} />
          ))}
        </span>
      )}
    </div>
  );
  if (!label) return control();
  return (
    <Field label={label} helper={helper} error={error} required={required} labelStyle={labelStyle} disabled={disabled} controlId={id}>
      {control}
    </Field>
  );
}

export interface TransferListProps extends FieldParts {
  items: readonly TransferItem[];
  /** Controlled target values; pair with `onChange`. */
  values?: readonly string[];
  defaultValues?: readonly string[];
  sourceLabel?: string;
  targetLabel?: string;
  emptyText?: string;
  searchable?: boolean;
  disabled?: boolean;
  'aria-label'?: string;
  className?: string;
  onChange?: (values: string[]) => void;
}

interface TransferPanelState {
  query: string;
  selected: readonly string[];
  active: string | null;
  anchor: number;
}

const EMPTY_PANEL: TransferPanelState = { query: '', selected: [], active: null, anchor: -1 };

/** Same DOM and classes as `createTransferList`. */
export function TransferList({
  label,
  helper,
  error,
  labelStyle,
  items,
  values: valuesProp,
  defaultValues,
  sourceLabel = TRANSFER_TEXT.source,
  targetLabel = TRANSFER_TEXT.target,
  emptyText = TRANSFER_TEXT.empty,
  searchable,
  disabled = false,
  'aria-label': ariaLabel,
  className,
  onChange,
}: TransferListProps) {
  const base = useId();
  const [stored, setStored] = useControlled<readonly string[]>(valuesProp, () => defaultValues ?? []);
  const values = transferNormalize(items, stored);
  const [panels, setPanels] = useState<Record<TransferSide, TransferPanelState>>({ source: EMPTY_PANEL, target: EMPTY_PANEL });
  const [status, setStatus] = useState('');
  const titles: Record<TransferSide, string> = { source: sourceLabel, target: targetLabel };
  const other = (side: TransferSide): TransferSide => (side === 'source' ? 'target' : 'source');
  const shownOf = (side: TransferSide): TransferItem[] => transferSideItems(items, values, side, panels[side].query);
  /** A panel's state with selection and active item limited to what it shows. */
  const view = (side: TransferSide): TransferPanelState => {
    const shown = shownOf(side);
    const p = panels[side];
    const has = (v: string | null): boolean => v !== null && shown.some((i) => i.value === v);
    return { ...p, selected: p.selected.filter(has), active: has(p.active) ? p.active : null };
  };
  const update = (side: TransferSide, patch: Partial<TransferPanelState>): void => setPanels((all) => ({ ...all, [side]: { ...view(side), ...patch } }));

  const transfer = (from: TransferSide, all: boolean, only?: readonly string[]): void => {
    if (disabled) return;
    const shown = shownOf(from);
    const p = view(from);
    const picked = only ?? p.selected;
    const moving = shown.filter((i) => !i.disabled && (all || picked.includes(i.value))).map((i) => i.value);
    if (moving.length === 0) return;
    const to = other(from);
    const next = transferMove(items, values, moving, to);
    const at = shown.findIndex((i) => i.value === p.active);
    const left = transferSideItems(items, next, from, p.query);
    setPanels((s) => ({ ...s, [from]: { ...p, selected: [], anchor: -1, active: left.length ? left[Math.min(Math.max(at, 0), left.length - 1)]!.value : null } }));
    setStored(next);
    setStatus(TRANSFER_TEXT.moved(moving.length, titles[to]));
    onChange?.(next);
  };

  const panel = (side: TransferSide) => {
    const shown = shownOf(side);
    const p = view(side);
    const listId = `${base}-${side}`;
    const titleId = `${listId}-title`;
    const emptyId = `${listId}-empty`;
    const optionId = (value: string): string => `${listId}-${items.findIndex((i) => i.value === value)}`;
    return (
      <div className={cx('mh-transfer__panel', `mh-transfer__panel--${side}`)}>
        <div className="mh-transfer__head">
          <span className="mh-transfer__title" id={titleId}>
            {titles[side]}
          </span>
          <span className="mh-transfer__count">{transferCount(p.selected.length, shown.length)}</span>
        </div>
        {searchable && (
          <div className="mh-transfer__filter">
            <SearchField size="small" label={`${TRANSFER_TEXT.filter} ${titles[side]}`} placeholder={TRANSFER_TEXT.filter} value={p.query} onValueChange={(q) => update(side, { query: q })} />
          </div>
        )}
        <div
          className="mh-transfer__list"
          id={listId}
          role="listbox"
          aria-multiselectable="true"
          aria-labelledby={titleId}
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled ? true : undefined}
          aria-describedby={shown.length === 0 ? emptyId : undefined}
          aria-activedescendant={p.active !== null ? optionId(p.active) : undefined}
          onFocus={(event) => {
            if (event.target !== event.currentTarget || p.active !== null) return;
            const first = shown[nextEnabled(shown, -1, 1)];
            if (first) update(side, { active: first.value });
          }}
          onKeyDown={(event) => {
            if (disabled) return;
            const current = shown.findIndex((i) => i.value === p.active);
            const action = transferKey(event, shown, current);
            if (action.type === 'none') return;
            event.preventDefault();
            const sel = new Set(p.selected);
            switch (action.type) {
              case 'move-active': {
                const next = shown[action.index];
                if (!next) return;
                if (action.extend) {
                  if (current >= 0 && !shown[current]!.disabled) sel.add(shown[current]!.value);
                  if (!next.disabled) sel.add(next.value);
                }
                return update(side, { active: next.value, selected: [...sel] });
              }
              case 'toggle': {
                if (current < 0 || shown[current]!.disabled) return;
                const v = shown[current]!.value;
                if (sel.has(v)) sel.delete(v);
                else sel.add(v);
                return update(side, { selected: [...sel], anchor: current });
              }
              case 'select-all': {
                const movable = shown.filter((i) => !i.disabled).map((i) => i.value);
                const allOn = movable.every((v) => sel.has(v));
                return update(side, { selected: allOn ? [] : movable });
              }
              case 'transfer':
                return transfer(side, false, p.selected.length === 0 && current >= 0 ? [shown[current]!.value] : undefined);
            }
          }}
        >
          {shown.map((item, index) => (
            <div
              key={item.value}
              className={cx('mh-transfer__option', item.value === p.active && 'is-active')}
              id={optionId(item.value)}
              role="option"
              aria-selected={p.selected.includes(item.value)}
              aria-disabled={item.disabled ? true : undefined}
              onMouseDown={(event) => {
                event.preventDefault();
                (event.currentTarget.parentElement as HTMLElement).focus();
              }}
              onClick={(event) => {
                if (disabled || item.disabled) return;
                const sel = new Set(p.selected);
                if (event.shiftKey && p.anchor >= 0) {
                  const [a, b] = p.anchor < index ? [p.anchor, index] : [index, p.anchor];
                  for (let i = a; i <= b; i++) if (!shown[i]!.disabled) sel.add(shown[i]!.value);
                  return update(side, { active: item.value, selected: [...sel] });
                }
                if (sel.has(item.value)) sel.delete(item.value);
                else sel.add(item.value);
                update(side, { active: item.value, selected: [...sel], anchor: index });
              }}
              onDoubleClick={() => {
                if (disabled || item.disabled) return;
                transfer(side, false, [item.value]);
              }}
            >
              <span className="mh-transfer__check">
                <Icon icon={mdiCheck} />
              </span>
              {item.icon && <Icon icon={item.icon} className="mh-transfer__icon" />}
              <span className="mh-transfer__text">
                <span className="mh-transfer__label">{item.label}</span>
                {item.description && <span className="mh-transfer__description">{item.description}</span>}
              </span>
            </div>
          ))}
        </div>
        <p className="mh-transfer__empty" id={emptyId} hidden={shown.length > 0}>
          {emptyText}
        </p>
      </div>
    );
  };

  const movable = (side: TransferSide, onlySelected: boolean): boolean => {
    const p = view(side);
    return shownOf(side).some((i) => !i.disabled && (!onlySelected || p.selected.includes(i.value)));
  };
  const moveButton = (from: TransferSide, all: boolean) => {
    const to = other(from);
    const name = all ? TRANSFER_TEXT.moveAll(titles[to]) : TRANSFER_TEXT.moveSelected(titles[to]);
    return (
      <button type="button" className={TRANSFER_BUTTON_CLASS} aria-label={name} title={name} disabled={disabled || !movable(from, !all)} onClick={() => transfer(from, all)}>
        <Icon icon={all ? TRANSFER_ICONS.all[to] : TRANSFER_ICONS.one[to]} />
      </button>
    );
  };
  const root = (field?: FieldControlProps) => (
    <div {...field} className={cx(transferListClass(disabled), className)} role="group" aria-label={label ? undefined : ariaLabel}>
      <div className="mh-transfer__layout">
        {panel('source')}
        <div className="mh-transfer__actions">
          {moveButton('source', false)}
          {moveButton('source', true)}
          {moveButton('target', false)}
          {moveButton('target', true)}
        </div>
        {panel('target')}
      </div>
      <span className="mh-visually-hidden" role="status">
        {status}
      </span>
    </div>
  );
  if (!label) return root();
  return (
    <Field label={label} helper={helper} error={error} labelStyle={labelStyle} disabled={disabled} group>
      {root}
    </Field>
  );
}
