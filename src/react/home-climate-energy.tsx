// React bindings for the home group: Climate and energy: fans, humidity, air quality, schedules, energy flow, prices, charging, usage.
// Same DOM and classes as the web renderer. The drawn components share their markup with it through the chart tree;
// the fan and humidity controls are written out with the React form controls.
import { mdiFan, mdiMinus, mdiPlus } from '@mdi/js';
import { createElement, useEffect, useReducer, useRef, type CSSProperties, type ReactElement, type ReactNode, type Ref } from 'react';
import type { ChartNode } from '../web/charts/tree.ts';
import { cx } from '../web/dom.ts';
import {
  FAN_CONTROL_LABELS,
  FAN_OSCILLATE_ICON,
  FAN_PRESET_LIMIT,
  HUMIDITY_CONTROL_LABELS,
  HUMIDITY_SEGMENT_LIMIT,
  airQualityTree,
  attachSchedule,
  chargeCardTree,
  energyFlowTree,
  fanControlClass,
  fanDirectionOptions,
  fanSliderStep,
  fanSpinSeconds,
  fanStepOf,
  fanStepOptions,
  fanStepPercentage,
  fanUsesSteps,
  formatFanSpeed,
  formatHumidity,
  humidityActionClass,
  humidityControlClass,
  humidityGauge,
  humidityLimits,
  nudgeHumidity,
  priceStripTree,
  scheduleEditorTree,
  scheduleFocus,
  usageComparisonTree,
  type AirQualityOptions,
  type ChargeCardOptions,
  type EnergyFlowOptions,
  type FanControlLabels,
  type FanDirection,
  type FanPreset,
  type HumidityAction,
  type HumidityComfort,
  type HumidityControlLabels,
  type HumidityMode,
  type PriceStripOptions,
  type ScheduleEditorOptions,
  type ScheduleFocus,
  type UsageComparisonOptions,
} from '../web/home/climate-energy/index.ts';
import { createPendingValue, PENDING_DELAY, type PendingValue } from '../web/home/pending.ts';
import { IconButton } from './actions.tsx';
import { SegmentedControl, Switch } from './choice-inputs.tsx';
import { HomeSlider } from './home-controls.tsx';
import { Select } from './text-inputs.tsx';

// Tree to React --------------------------------------------------------------------------------------------------

const ATTRS: Record<string, string> = { class: 'className', tabindex: 'tabIndex', 'vector-effect': 'vectorEffect', for: 'htmlFor' };
const BOOLEAN = new Set(['disabled', 'hidden']);

function styleProps(style: string): CSSProperties {
  const out: Record<string, string> = {};
  for (const decl of style.split(';')) {
    const at = decl.indexOf(':');
    if (at < 0) continue;
    const prop = decl.slice(0, at).trim();
    out[prop.startsWith('--') ? prop : prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] = decl.slice(at + 1).trim();
  }
  return out as CSSProperties;
}

/** React elements for a tree; `root` props (ref, className) go on the outer element. */
function fromClimateTree(n: ChartNode, key?: number, root?: { className?: string; ref?: Ref<HTMLDivElement> }): ReactElement {
  const props: Record<string, unknown> = { key };
  for (const [k, v] of Object.entries(n.attrs)) {
    if (k === 'style') props['style'] = styleProps(v);
    else if (BOOLEAN.has(k)) props[k] = true;
    else props[ATTRS[k] ?? k] = v;
  }
  if (root) {
    props['className'] = cx(n.attrs['class'], root.className) || undefined;
    if (root.ref) props['ref'] = root.ref;
  }
  return createElement(n.tag, props, ...n.children.map((c, i) => (typeof c === 'string' ? c : fromClimateTree(c, i))));
}

// Fan control ----------------------------------------------------------------------------------------------------

export interface FanControlProps {
  label?: string;
  on: boolean;
  percentage?: number | null;
  speedCount?: number;
  oscillating?: boolean | null;
  direction?: FanDirection | null;
  preset?: string | null;
  presets?: readonly FanPreset[];
  disabled?: boolean;
  labels?: Partial<FanControlLabels>;
  onToggle?: (on: boolean) => void;
  /** At once for a step, on release for the slider. */
  onPercentage?: (percentage: number) => void;
  onOscillate?: (oscillating: boolean) => void;
  onDirection?: (direction: FanDirection) => void;
  onPreset?: (preset: string) => void;
  className?: string;
}

const fanField = (kind: string, label: string, control: ReactNode) => (
  <div className={`mh-fan-control__field mh-fan-control__field--${kind}`}>
    <span className="mh-fan-control__field-label" aria-hidden="true">
      {label}
    </span>
    {control}
  </div>
);

/** Same DOM and classes as `createFanControl`. */
export function FanControl(props: FanControlProps) {
  const { label = 'Fan', on, percentage, speedCount, oscillating, direction, preset, presets = [], disabled, className } = props;
  const l = { ...FAN_CONTROL_LABELS, ...props.labels };
  const spin = fanSpinSeconds(on, percentage);
  return (
    <div
      className={cx(fanControlClass({ on, disabled, spinning: spin !== null }), className)}
      role="group"
      aria-label={label}
      style={spin === null ? undefined : ({ '--_spin': `${spin}s` } as CSSProperties)}
    >
      <Switch row label={l.power} icon={mdiFan} className="mh-fan-control__power" checked={on} disabled={disabled} onChange={(event) => props.onToggle?.(event.target.checked)} />
      {fanUsesSteps(speedCount)
        ? fanField(
            'speed',
            l.speed,
            <SegmentedControl
              label={l.speed}
              options={fanStepOptions(speedCount!)}
              value={String(fanStepOf(percentage, speedCount!))}
              fullWidth
              disabled={disabled}
              onChange={(v) => props.onPercentage?.(fanStepPercentage(Number(v), speedCount!))}
            />,
          )
        : percentage !== null &&
          percentage !== undefined && (
            <HomeSlider
              label={l.speed}
              className="mh-fan-control__slider"
              value={percentage}
              min={0}
              max={100}
              step={fanSliderStep(speedCount)}
              disabled={disabled}
              format={formatFanSpeed}
              onCommit={(v) => props.onPercentage?.(Math.round(v))}
            />
          )}
      {direction &&
        fanField(
          'direction',
          l.direction,
          <SegmentedControl label={l.direction} options={fanDirectionOptions(l)} value={direction} fullWidth disabled={disabled} onChange={(v) => props.onDirection?.(v as FanDirection)} />,
        )}
      {presets.length > 0 &&
        fanField(
          'preset',
          l.preset,
          presets.length <= FAN_PRESET_LIMIT ? (
            <SegmentedControl label={l.preset} options={presets} value={preset ?? ''} fullWidth disabled={disabled} onChange={(v) => props.onPreset?.(v)} />
          ) : (
            <Select aria-label={l.preset} options={presets.map((p) => ({ value: p.value, label: p.label }))} value={preset ?? ''} disabled={disabled} onChange={(event) => props.onPreset?.(event.target.value)} />
          ),
        )}
      {typeof oscillating === 'boolean' && (
        <Switch row label={l.oscillate} icon={FAN_OSCILLATE_ICON} className="mh-fan-control__oscillate" checked={oscillating} disabled={disabled} onChange={(event) => props.onOscillate?.(event.target.checked)} />
      )}
    </div>
  );
}

// Humidity control -----------------------------------------------------------------------------------------------

/** A pending buffer that lives as long as the component and re-renders it when a timer settles. */
function useClimatePending<T>(send: (value: T) => void, delay?: number): PendingValue<T> {
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const latest = useRef(send);
  useEffect(() => {
    latest.current = send;
  });
  const buffer = useRef<PendingValue<T> | null>(null);
  if (!buffer.current) buffer.current = createPendingValue<T>({ send: (v) => latest.current(v), changed: rerender, delay });
  useEffect(() => {
    const b = buffer.current!;
    return () => b.dispose();
  }, []);
  return buffer.current;
}

export interface HumidityControlProps {
  label?: string;
  current?: number | null;
  target?: number | null;
  min?: number;
  max?: number;
  step?: number;
  on?: boolean | null;
  mode?: string;
  modes?: readonly HumidityMode[];
  action?: HumidityAction | null;
  comfort?: HumidityComfort | null;
  disabled?: boolean;
  compact?: boolean;
  labels?: Partial<HumidityControlLabels>;
  /** Idle time after the last tap before `onTarget` fires, in ms (default 700). */
  delay?: number;
  /** The new target, once the taps settle; also on unmount if still waiting. */
  onTarget?: (value: number) => void;
  onMode?: (value: string) => void;
  onToggle?: (on: boolean) => void;
  className?: string;
}

/** Same DOM and classes as `createHumidityControl`. */
export function HumidityControl(props: HumidityControlProps) {
  const { label = 'Humidity', current, on, mode, modes = [], action, comfort, disabled, compact, onMode, className } = props;
  const l = { ...HUMIDITY_CONTROL_LABELS, ...props.labels };
  const limits = humidityLimits(props);
  const pending = useClimatePending<number | null>((v) => {
    if (v !== null) props.onTarget?.(v);
  }, props.delay ?? PENDING_DELAY);
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const prop = typeof props.target === 'number' && Number.isFinite(props.target) ? props.target : null;
  const shown = pending.shown(prop);
  const tap = (direction: 1 | -1): void => {
    if (shown === null || disabled) return;
    pending.schedule(nudgeHumidity(shown, direction, limits), prop);
    rerender();
  };
  const g = humidityGauge({ current, target: shown, comfort });
  const hasCurrent = typeof current === 'number' && Number.isFinite(current);
  const size = compact ? 'small' : 'medium';
  return (
    <div className={cx(humidityControlClass({ compact, disabled, off: on === false }), className)} role="group" aria-label={label}>
      {typeof on === 'boolean' && <Switch row label={l.power} className="mh-humidity-control__power" checked={on} disabled={disabled} onChange={(event) => props.onToggle?.(event.target.checked)} />}
      <div className="mh-humidity-control__target" role="group" aria-label={l.target}>
        <div className="mh-humidity-control__adjust">
          <IconButton icon={mdiMinus} label={l.lower} size={size} filled className="mh-humidity-control__step" disabled={disabled || shown === null || shown <= limits.min} onClick={() => tap(-1)} />
          <output className="mh-humidity-control__value">
            <span className="mh-humidity-control__number">{formatHumidity(shown, limits.step)}</span>
            <span className="mh-humidity-control__unit">{shown === null ? '' : '%'}</span>
          </output>
          <IconButton icon={mdiPlus} label={l.raise} size={size} filled className="mh-humidity-control__step" disabled={disabled || shown === null || shown >= limits.max} onClick={() => tap(1)} />
        </div>
      </div>
      <div className="mh-humidity-control__gauge" aria-hidden="true">
        <div className="mh-humidity-control__track">
          {g.comfort && <span className="mh-humidity-control__comfort" style={{ left: `${g.comfort.left}%`, width: `${g.comfort.width}%` }} />}
          {g.target !== null && <span className="mh-humidity-control__marker mh-humidity-control__marker--target" style={{ left: `${g.target}%` }} />}
          {g.current !== null && <span className="mh-humidity-control__marker mh-humidity-control__marker--current" style={{ left: `${g.current}%` }} />}
        </div>
      </div>
      {(hasCurrent || action) && (
        <div className="mh-humidity-control__status">
          {hasCurrent && <span className="mh-humidity-control__current">{`${l.now} ${formatHumidity(current, limits.step)}%`}</span>}
          {action && <span className={humidityActionClass(action)}>{l[action]}</span>}
        </div>
      )}
      {modes.length > 0 && (
        <div className="mh-humidity-control__mode">
          {modes.length <= HUMIDITY_SEGMENT_LIMIT ? (
            <SegmentedControl label={l.mode} options={modes} value={mode} size={size} fullWidth disabled={disabled} onChange={(value) => onMode?.(value)} />
          ) : (
            <Select aria-label={l.mode} options={modes.map((m) => ({ value: m.value, label: m.label }))} value={mode} size={size} disabled={disabled} onChange={(event) => onMode?.(event.target.value)} />
          )}
        </div>
      )}
    </div>
  );
}

// Drawn components -----------------------------------------------------------------------------------------------

export interface AirQualityProps extends AirQualityOptions {
  className?: string;
}

/** Same DOM and classes as `createAirQuality`. */
export function AirQuality({ className, ...options }: AirQualityProps) {
  return fromClimateTree(airQualityTree(options), undefined, { className });
}

export interface EnergyFlowProps extends EnergyFlowOptions {
  className?: string;
}

/** Same DOM and classes as `createEnergyFlow`. */
export function EnergyFlow({ className, ...options }: EnergyFlowProps) {
  return fromClimateTree(energyFlowTree(options), undefined, { className });
}

export interface PriceStripProps extends PriceStripOptions {
  className?: string;
}

/** Same DOM and classes as `createPriceStrip`. */
export function PriceStrip({ className, ...options }: PriceStripProps) {
  return fromClimateTree(priceStripTree(options), undefined, { className });
}

export interface ChargeCardProps extends ChargeCardOptions {
  className?: string;
}

/** Same DOM and classes as `createChargeCard`. */
export function ChargeCard({ className, ...options }: ChargeCardProps) {
  return fromClimateTree(chargeCardTree(options), undefined, { className });
}

export interface UsageComparisonProps extends UsageComparisonOptions {
  className?: string;
}

/** Same DOM and classes as `createUsageComparison`. */
export function UsageComparison({ className, ...options }: UsageComparisonProps) {
  return fromClimateTree(usageComparisonTree(options), undefined, { className });
}

export interface ScheduleEditorProps extends ScheduleEditorOptions {
  className?: string;
}

/**
 * Same DOM and classes as `createScheduleEditor`. Controlled: render the days from `onChange` back into `days`.
 * Focus follows the block a key press, tap or drag left selected.
 */
export function ScheduleEditor({ className, ...options }: ScheduleEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const latest = useRef(options);
  const focus = useRef<ScheduleFocus | undefined>(undefined);
  useEffect(() => {
    latest.current = options;
    const el = ref.current;
    if (el && focus.current) scheduleFocus(el, focus.current);
    focus.current = undefined;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return attachSchedule(
      el,
      () => latest.current,
      (days, f) => {
        focus.current = f;
        latest.current = { ...latest.current, days };
        latest.current.onChange?.(days);
      },
    );
  }, []);
  return fromClimateTree(scheduleEditorTree(options), undefined, { className, ref });
}
