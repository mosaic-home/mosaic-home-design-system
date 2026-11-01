// home group, controls for things in a home: React bindings. Same DOM and classes as the web renderer; local
// values (taps, a dragged slider) go through the same pending buffer as the web controls.
import { mdiMinus, mdiPlus } from '@mdi/js';
import { useEffect, useId, useReducer, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { sliderPosition } from '../web/choice-inputs/slider.ts';
import { cx } from '../web/dom.ts';
import type { IconName } from '../web/icons.ts';
import { controlCardClass, type ControlCardTone } from '../web/home/controlCard.ts';
import { homeSliderClass } from '../web/home/homeSlider.ts';
import { LIGHT_CONTROL_LABELS, formatBrightness, formatHue, formatKelvin, lightControlClass, lightSliderClass, lightSliders, type LightColorTemp, type LightControlLabels, type LightSlider } from '../web/home/lightControl.ts';
import { lockButtonClass, lockButtons, lockControlClass, lockLabels, lockPrompt, lockStateIcon, LOCK_CONFIRM_TIMEOUT, type LockAction, type LockControlOptions, type LockState } from '../web/home/lockControl.ts';
import { createPendingValue, type PendingValue } from '../web/home/pending.ts';
import { formatPosition, positionButtonClass, positionButtons, positionControlClass, POSITION_CONTROL_LABELS, POSITION_DEFAULT_CAN, POSITION_SLIDER_CLASS, type PositionCapabilities, type PositionControlLabels, type PositionState } from '../web/home/positionControl.ts';
import {
  THERMOSTAT_DEFAULTS,
  THERMOSTAT_LABELS,
  THERMOSTAT_SEGMENT_LIMIT,
  formatThermostatNumber,
  nudgeThermostat,
  thermostatActionClass,
  thermostatClass,
  thermostatPartLabel,
  thermostatPartState,
  thermostatParts,
  thermostatTargetClass,
  thermostatTargetOf,
  thermostatTargetsEqual,
  withThermostatUnit,
  type ThermostatAction,
  type ThermostatLabels,
  type ThermostatMode,
  type ThermostatPart,
  type ThermostatTarget,
} from '../web/home/thermostat.ts';
import { Button, IconButton } from './actions.tsx';
import { SegmentedControl, Switch } from './choice-inputs.tsx';
import { Spinner } from './feedback.tsx';
import { Icon } from './foundations.tsx';
import { Select } from './text-inputs.tsx';

const filled = (node: ReactNode): boolean => node !== undefined && node !== null && node !== false;

/** A pending buffer that lives as long as the component and re-renders it when a timer settles. */
function usePending<T>(send: (value: T) => void, options: { delay?: number; equal?: (a: T, b: T) => boolean } = {}): PendingValue<T> {
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const latest = useRef(send);
  useEffect(() => {
    latest.current = send;
  });
  const buffer = useRef<PendingValue<T> | null>(null);
  if (!buffer.current) buffer.current = createPendingValue<T>({ send: (v) => latest.current(v), changed: rerender, delay: options.delay, equal: options.equal });
  useEffect(() => {
    const b = buffer.current!;
    return () => b.dispose();
  }, []);
  return buffer.current;
}

// Control card -------------------------------------------------------------------------------------------------

export interface ControlCardProps {
  /** The thing's name; wraps, never cut short. Also the card's accessible name. */
  title: string;
  icon: IconName | string;
  /** The state line, shown as given. */
  state?: string;
  active?: boolean;
  tone?: ControlCardTone;
  /** Trailing control beside the title. */
  control?: ReactNode;
  /** On top, edge to edge. */
  media?: ReactNode;
  /** The body below the header. */
  children?: ReactNode;
  loading?: boolean;
  loadingLabel?: string;
  /** Muted, and every native control in the control and body slots disabled. */
  unavailable?: boolean;
  /** Makes the header a button that opens more controls. */
  onOpen?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

/** Same DOM and classes as `createControlCard`. */
export function ControlCard({ title, icon, state, active, tone, control, media, children, loading, loadingLabel = 'Updating', unavailable, onOpen, className }: ControlCardProps) {
  const inner = (
    <>
      <span className="mh-control-card__badge">
        <Icon icon={icon} />
      </span>
      <span className="mh-control-card__text">
        <span className="mh-control-card__title">{title}</span>
        {state && <span className="mh-control-card__state">{state}</span>}
      </span>
    </>
  );
  return (
    <div className={cx(controlCardClass({ active, tone, loading, unavailable, pressable: !!onOpen }), className)} role="group" aria-label={title} aria-busy={loading || undefined}>
      {filled(media) && <div className="mh-control-card__media">{media}</div>}
      <div className="mh-control-card__header">
        {onOpen ? (
          <button type="button" className="mh-control-card__main" onClick={onOpen}>
            {inner}
          </button>
        ) : (
          <div className="mh-control-card__main">{inner}</div>
        )}
        {(loading || filled(control)) && (
          <fieldset className="mh-control-card__control" disabled={unavailable}>
            {loading ? <Spinner size="small" label={loadingLabel} /> : control}
          </fieldset>
        )}
      </div>
      {filled(children) && (
        <fieldset className="mh-control-card__body" disabled={unavailable}>
          {children}
        </fieldset>
      )}
    </div>
  );
}

// Home slider --------------------------------------------------------------------------------------------------

export interface HomeSliderProps {
  label: string;
  /** Extra classes on the `.mh-slider` root. */
  className: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  format: (value: number) => string;
  /** The value, once: when the pointer lifts, or at once for a key press. */
  onCommit: (value: number) => void;
}

/** Same DOM and classes as `createHomeSlider`: a labelled slider that commits on release. */
export function HomeSlider({ label, className, value, min, max, step = 1, disabled, format, onCommit }: HomeSliderProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const pending = usePending<number>(onCommit);
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const prop = useRef(value);
  useEffect(() => {
    prop.current = value;
  });
  useEffect(() => {
    // React's onChange follows `input`; the native `change` fires on release and for each key press.
    const el = input.current!;
    const commit = (): void => {
      pending.commit(Number(el.value), prop.current);
      rerender();
    };
    el.addEventListener('change', commit);
    return () => el.removeEventListener('change', commit);
  }, [pending]);
  const shown = pending.shown(value);
  const text = format(shown);
  return (
    <div className={homeSliderClass(className)}>
      <div className="mh-slider__head">
        <label className="mh-slider__label" htmlFor={id}>
          {label}
        </label>
        <output className="mh-slider__value" htmlFor={id}>
          {text}
        </output>
      </div>
      <input
        ref={input}
        id={id}
        type="range"
        className="mh-slider__input"
        min={min}
        max={max}
        step={step}
        value={shown}
        disabled={disabled}
        aria-valuetext={text}
        style={{ '--_at': sliderPosition(shown, min, max), '--_value': shown } as CSSProperties}
        onChange={(event) => {
          pending.draft(Number(event.target.value), value);
          rerender();
        }}
      />
    </div>
  );
}

// Thermostat ---------------------------------------------------------------------------------------------------

export interface ThermostatProps {
  label?: string;
  current?: number | null;
  target?: number | null;
  targetLow?: number | null;
  targetHigh?: number | null;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  mode?: string;
  modes?: readonly ThermostatMode[];
  action?: ThermostatAction | null;
  disabled?: boolean;
  compact?: boolean;
  labels?: Partial<ThermostatLabels>;
  /** Idle time after the last tap before `onTarget` fires, in ms (default 700). */
  delay?: number;
  /** The new target (or range), once the taps settle; also on unmount if still waiting. */
  onTarget?: (value: ThermostatTarget) => void;
  onMode?: (value: string) => void;
  className?: string;
}

/** Same DOM and classes as `createThermostat`. */
export function Thermostat(props: ThermostatProps) {
  const { label = 'Thermostat', current, unit = THERMOSTAT_DEFAULTS.unit, mode, modes = [], action, disabled, compact, onMode, className } = props;
  const limits = { min: props.min ?? THERMOSTAT_DEFAULTS.min, max: props.max ?? THERMOSTAT_DEFAULTS.max, step: props.step ?? THERMOSTAT_DEFAULTS.step };
  const l = { ...THERMOSTAT_LABELS, ...props.labels };
  const pending = usePending<ThermostatTarget | null>(
    (v) => {
      if (v !== null) props.onTarget?.(v);
    },
    { delay: props.delay, equal: thermostatTargetsEqual },
  );
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const prop = thermostatTargetOf(props);
  const shown = pending.shown(prop);
  const kinds = thermostatParts(shown);
  const tap = (part: ThermostatPart, direction: 1 | -1): void => {
    if (shown === null || disabled) return;
    pending.schedule(nudgeThermostat(shown, part, direction, limits), prop);
    rerender();
  };
  const hasCurrent = typeof current === 'number';
  const size = compact ? 'small' : 'medium';
  return (
    <div className={cx(thermostatClass({ compact, disabled, range: kinds.length === 2, pending: pending.phase !== 'idle' }), className)} role="group" aria-label={label}>
      <div className="mh-thermostat__targets">
        {kinds.map((part) => {
          const s = thermostatPartState(shown, part, limits);
          const name = thermostatPartLabel(part, l);
          return (
            <div key={part} className={thermostatTargetClass(part)} role="group" aria-label={name}>
              {part !== 'single' && (
                <span className="mh-thermostat__target-label" aria-hidden="true">
                  {name}
                </span>
              )}
              <div className="mh-thermostat__adjust">
                <IconButton icon={mdiMinus} label={l.lower} size={size} filled className="mh-thermostat__step" disabled={disabled || !s.canLower} onClick={() => tap(part, -1)} />
                <output className="mh-thermostat__value">
                  <span className="mh-thermostat__number">{formatThermostatNumber(s.value, limits.step)}</span>
                  <span className="mh-thermostat__unit">{s.value === null ? '' : unit}</span>
                </output>
                <IconButton icon={mdiPlus} label={l.raise} size={size} filled className="mh-thermostat__step" disabled={disabled || !s.canRaise} onClick={() => tap(part, 1)} />
              </div>
            </div>
          );
        })}
      </div>
      {(hasCurrent || action) && (
        <div className="mh-thermostat__status">
          {hasCurrent && <span className="mh-thermostat__current">{`${l.now} ${withThermostatUnit(formatThermostatNumber(current, limits.step), unit)}`}</span>}
          {action && <span className={thermostatActionClass(action)}>{l[action]}</span>}
        </div>
      )}
      {modes.length > 0 && (
        <div className="mh-thermostat__mode">
          {modes.length <= THERMOSTAT_SEGMENT_LIMIT ? (
            <SegmentedControl label={l.mode} options={modes} value={mode} size={size} fullWidth disabled={disabled} onChange={(value) => onMode?.(value)} />
          ) : (
            <Select aria-label={l.mode} options={modes.map((m) => ({ value: m.value, label: m.label }))} value={mode} size={size} disabled={disabled} onChange={(event) => onMode?.(event.target.value)} />
          )}
        </div>
      )}
    </div>
  );
}

// Light control ------------------------------------------------------------------------------------------------

export interface LightControlProps {
  label?: string;
  on: boolean;
  brightness?: number | null;
  colorTemp?: LightColorTemp | null;
  hue?: number | null;
  disabled?: boolean;
  /** Show the on/off switch row (default true). */
  toggle?: boolean;
  /** Which of the supported sliders to show (default all). */
  sliders?: LightSlider[];
  labels?: Partial<LightControlLabels>;
  onToggle?: (on: boolean) => void;
  onBrightness?: (value: number) => void;
  onColorTemp?: (kelvin: number) => void;
  onHue?: (hue: number) => void;
  className?: string;
}

/** Same DOM and classes as `createLightControl`. */
export function LightControl(props: LightControlProps) {
  const { label = 'Light', on, disabled, toggle = true, onToggle, className } = props;
  const l = { ...LIGHT_CONTROL_LABELS, ...props.labels };
  const send: Record<LightSlider, (value: number) => void> = {
    brightness: (v) => props.onBrightness?.(v),
    temperature: (v) => props.onColorTemp?.(v),
    hue: (v) => props.onHue?.(v),
  };
  const name: Record<LightSlider, string> = { brightness: l.brightness, temperature: l.colorTemp, hue: l.hue };
  const format: Record<LightSlider, (value: number) => string> = { brightness: formatBrightness, temperature: formatKelvin, hue: formatHue };
  return (
    <div className={cx(lightControlClass({ on, disabled }), className)} role="group" aria-label={label}>
      {toggle && <Switch row label={l.power} className="mh-light-control__power" checked={on} disabled={disabled} onChange={(event) => onToggle?.(event.target.checked)} />}
      {lightSliders(props).map((s) => (
        <HomeSlider key={s.kind} label={name[s.kind]} className={lightSliderClass(s.kind)} {...s.state} step={s.step} format={format[s.kind]} onCommit={send[s.kind]} />
      ))}
    </div>
  );
}

// Position control ---------------------------------------------------------------------------------------------

export interface PositionControlProps {
  label?: string;
  state?: PositionState | null;
  position?: number | null;
  can?: PositionCapabilities;
  labels?: Partial<PositionControlLabels>;
  disabled?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onStop?: () => void;
  onPosition?: (value: number) => void;
  className?: string;
}

/** Same DOM and classes as `createPositionControl`. */
export function PositionControl(props: PositionControlProps) {
  const { label = 'Position', state, position, can = POSITION_DEFAULT_CAN, disabled, className } = props;
  const l = { ...POSITION_CONTROL_LABELS, ...props.labels };
  const buttons = positionButtons(props);
  const fire = { open: props.onOpen, close: props.onClose, stop: props.onStop };
  return (
    <div className={cx(positionControlClass({ state, disabled }), className)} role="group" aria-label={label}>
      {buttons.length > 0 && (
        <div className="mh-position-control__buttons">
          {buttons.map((b) => (
            <Button key={b.action} variant="secondary" icon={b.icon} className={positionButtonClass(b.action, b.active)} disabled={b.disabled} onClick={() => fire[b.action]?.()}>
              {b.label}
            </Button>
          ))}
        </div>
      )}
      {can.position && typeof position === 'number' && (
        <HomeSlider key={l.position} label={l.position} className={POSITION_SLIDER_CLASS} value={position} min={0} max={100} disabled={disabled} format={formatPosition} onCommit={(v) => props.onPosition?.(v)} />
      )}
    </div>
  );
}

// Lock control -------------------------------------------------------------------------------------------------

export interface LockControlProps {
  label?: string;
  state?: LockState | null;
  canOpen?: boolean;
  /** Unlock and open ask first, inline: "Tap again to unlock". */
  confirm?: boolean;
  confirmTimeout?: number;
  disabled?: boolean;
  labels?: LockControlOptions['labels'];
  onLock?: () => void;
  onUnlock?: () => void;
  onOpen?: () => void;
  className?: string;
}

/** Same DOM and classes as `createLockControl`. */
export function LockControl(props: LockControlProps) {
  const { label = 'Lock', state, disabled, confirm, confirmTimeout = LOCK_CONFIRM_TIMEOUT, className } = props;
  const [confirming, setConfirming] = useState<LockAction | null>(null);
  const [seenState, setSeenState] = useState(state);
  if (seenState !== state) {
    // A new state ends a pending second step.
    setSeenState(state);
    setConfirming(null);
  }
  useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(null), confirmTimeout);
    return () => clearTimeout(timer);
  }, [confirming, confirmTimeout]);
  const l = lockLabels(props.labels);
  const press = (action: LockAction): void => {
    if (confirm && action !== 'lock' && confirming !== action) {
      setConfirming(action);
      return;
    }
    setConfirming(null);
    if (action === 'lock') props.onLock?.();
    else if (action === 'unlock') props.onUnlock?.();
    else props.onOpen?.();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Escape' && confirming) {
      event.stopPropagation();
      setConfirming(null);
    }
  };
  return (
    <div className={cx(lockControlClass({ state, disabled, confirming }), className)} role="group" aria-label={label} onKeyDown={onKeyDown}>
      <div className="mh-lock-control__status">
        <span className="mh-lock-control__icon">
          <Icon icon={lockStateIcon(state)} />
        </span>
        <span className="mh-lock-control__state" aria-live="polite">
          {l.states[state ?? 'unknown']}
        </span>
      </div>
      <div className="mh-lock-control__actions">
        {lockButtons(props, confirming).map((b) => (
          <Button key={b.action} variant="secondary" icon={b.icon} className={lockButtonClass(b.action, b.confirming)} disabled={b.disabled} onClick={() => press(b.action)}>
            {b.label}
          </Button>
        ))}
      </div>
      <span className="mh-visually-hidden" aria-live="assertive">
        {lockPrompt(props, confirming)}
      </span>
    </div>
  );
}
