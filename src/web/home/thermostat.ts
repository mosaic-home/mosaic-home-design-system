import { mdiMinus, mdiPlus } from '@mdi/js';
import { createIconButton, type IconButtonHandle } from '../actions/iconButton.ts';
import { createSegmentedControl } from '../choice-inputs/segmentedControl.ts';
import { cx, h } from '../dom.ts';
import { syncChildren } from './children.ts';
import type { IconName } from '../icons.ts';
import { createSelect } from '../text-inputs/select.ts';
import { createPendingValue, PENDING_DELAY } from './pending.ts';

/** What the device is doing right now. */
export type ThermostatAction = 'heating' | 'cooling' | 'drying' | 'fan' | 'idle' | 'off';

/** A heat-and-cool range: heat below `low`, cool above `high`. */
export interface ThermostatRange {
  low: number;
  high: number;
}

/** One target, or a range. */
export type ThermostatTarget = number | ThermostatRange;

export interface ThermostatMode {
  value: string;
  label: string;
  icon?: IconName | string;
}

/** Every visible and spoken word, for translation. */
export interface ThermostatLabels {
  /** Name of a single target's group. */
  target: string;
  /** Name (and visible label) of a range's lower end. */
  low: string;
  /** Name (and visible label) of a range's upper end. */
  high: string;
  lower: string;
  raise: string;
  /** Before the current reading ("Now 19.5°C"). */
  now: string;
  mode: string;
  heating: string;
  cooling: string;
  drying: string;
  fan: string;
  idle: string;
  off: string;
}

export const THERMOSTAT_LABELS: ThermostatLabels = {
  target: 'Target temperature',
  low: 'Heat to',
  high: 'Cool to',
  lower: 'Lower',
  raise: 'Raise',
  now: 'Now',
  mode: 'Mode',
  heating: 'Heating',
  cooling: 'Cooling',
  drying: 'Drying',
  fan: 'Fan',
  idle: 'Idle',
  off: 'Off',
};

export interface ThermostatOptions {
  /** Accessible name of the whole control (default "Thermostat"). */
  label?: string;
  /** The measured temperature. */
  current?: number | null;
  /** The single target; ignored when both `targetLow` and `targetHigh` are numbers. */
  target?: number | null;
  targetLow?: number | null;
  targetHigh?: number | null;
  /** Shown after the numbers (default "°C"); any string. */
  unit?: string;
  /** Default 7. */
  min?: number;
  /** Default 35. */
  max?: number;
  /** One tap of − / + (default 0.5); also sets the decimals shown. */
  step?: number;
  mode?: string;
  /** Up to four become a segmented control, more a select. */
  modes?: readonly ThermostatMode[];
  action?: ThermostatAction | null;
  disabled?: boolean;
  /** Smaller type and controls, for small cards. */
  compact?: boolean;
  labels?: Partial<ThermostatLabels>;
  /** Idle time after the last tap before `onTarget` fires, in ms (default 700). */
  delay?: number;
  /** The new target (or range), once the taps settle. */
  onTarget?: (value: ThermostatTarget) => void;
  onMode?: (value: string) => void;
}

export interface ThermostatHandle {
  el: HTMLDivElement;
  /** Applies changed options; omitted ones keep their value. A target still being tapped stays on screen. */
  update(changes: Partial<ThermostatOptions>): void;
  /** Sends a target that is still waiting for the taps to settle. */
  destroy(): void;
}

export type ThermostatPart = 'single' | 'low' | 'high';

export const THERMOSTAT_DEFAULTS = { unit: '°C', min: 7, max: 35, step: 0.5 } as const;

/** Above this many modes the mode is a select rather than a segmented control. */
export const THERMOSTAT_SEGMENT_LIMIT = 4;

const decimals = (step: number): number => {
  const text = String(step);
  const dot = text.indexOf('.');
  return dot < 0 ? 0 : text.length - dot - 1;
};

/** A temperature with the step's decimals ("21.5"), or an en dash when unknown. */
export function formatThermostatNumber(value: number | null | undefined, step: number = THERMOSTAT_DEFAULTS.step): string {
  return value === null || value === undefined || !Number.isFinite(value) ? '–' : value.toFixed(decimals(step));
}

/** A reading with its unit: degree units sit on the number ("19.5°C"), others after a space ("19.5 K"). */
export function withThermostatUnit(text: string, unit: string): string {
  if (!unit) return text;
  return unit.startsWith('°') ? `${text}${unit}` : `${text} ${unit}`;
}

/** The target the options describe: a range when both ends are numbers, else the single target, else null. */
export function thermostatTargetOf(o: Pick<ThermostatOptions, 'target' | 'targetLow' | 'targetHigh'>): ThermostatTarget | null {
  if (typeof o.targetLow === 'number' && typeof o.targetHigh === 'number') return { low: o.targetLow, high: o.targetHigh };
  return typeof o.target === 'number' ? o.target : null;
}

export function thermostatTargetsEqual(a: ThermostatTarget | null, b: ThermostatTarget | null): boolean {
  if (a === b) return true;
  if (a === null || b === null || typeof a === 'number' || typeof b === 'number') return false;
  return a.low === b.low && a.high === b.high;
}

const roundTo = (value: number, step: number): number => Number((Math.round(value / step) * step).toFixed(decimals(step)));
const clamp = (value: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, value));

interface Limits {
  min: number;
  max: number;
  step: number;
}

const limitsOf = (o: ThermostatOptions): Limits => ({ min: o.min ?? THERMOSTAT_DEFAULTS.min, max: o.max ?? THERMOSTAT_DEFAULTS.max, step: o.step ?? THERMOSTAT_DEFAULTS.step });

/** One − (-1) or + (1) tap on a part of the target, rounded to the step and kept within min / max (and the range in order). */
export function nudgeThermostat(target: ThermostatTarget, part: ThermostatPart, direction: 1 | -1, limits: Limits): ThermostatTarget {
  const { min, max, step } = limits;
  if (typeof target === 'number') return clamp(roundTo(target + direction * step, step), min, max);
  if (part === 'high') return { low: target.low, high: clamp(roundTo(target.high + direction * step, step), Math.max(min, target.low), max) };
  return { low: clamp(roundTo(target.low + direction * step, step), min, Math.min(max, target.high)), high: target.high };
}

/** The value of one part, and whether − and + can move it. */
export function thermostatPartState(target: ThermostatTarget | null, part: ThermostatPart, limits: Limits): { value: number | null; canLower: boolean; canRaise: boolean } {
  if (target === null) return { value: null, canLower: false, canRaise: false };
  const value = typeof target === 'number' ? target : part === 'high' ? target.high : target.low;
  const lowest = typeof target === 'number' || part === 'low' ? limits.min : Math.max(limits.min, target.low);
  const highest = typeof target === 'number' || part === 'high' ? limits.max : Math.min(limits.max, target.high);
  return { value, canLower: value > lowest, canRaise: value < highest };
}

/** The parts a target shows: one, or the two ends of a range (one unknown target still shows one). */
export function thermostatParts(target: ThermostatTarget | null): ThermostatPart[] {
  return target !== null && typeof target === 'object' ? ['low', 'high'] : ['single'];
}

/** `pending`: a target chosen here that the device has not confirmed yet (shown dimmed until it does). */
export function thermostatClass(o: Pick<ThermostatOptions, 'compact' | 'disabled'> & { range?: boolean; pending?: boolean }): string {
  return cx('mh-thermostat', o.compact && 'mh-thermostat--compact', o.range && 'mh-thermostat--range', o.disabled && 'is-disabled', o.pending && 'is-pending');
}

export function thermostatTargetClass(part: ThermostatPart): string {
  return cx('mh-thermostat__target', part !== 'single' && `mh-thermostat__target--${part}`);
}

export function thermostatActionClass(action: ThermostatAction): string {
  return `mh-thermostat__action mh-thermostat__action--${action}`;
}

/** The accessible name of a part's group. */
export function thermostatPartLabel(part: ThermostatPart, labels: ThermostatLabels): string {
  return part === 'single' ? labels.target : labels[part];
}

interface PartView {
  part: ThermostatPart;
  el: HTMLDivElement;
  lower: IconButtonHandle;
  raise: IconButtonHandle;
  number: HTMLSpanElement;
  unit: HTMLSpanElement;
  value: HTMLOutputElement;
}

/**
 * `.mh-thermostat`: the target big between − / + buttons (`__target` groups, `--low | --high` for a heat-and-cool
 * range, each with `__adjust`, `__step` buttons and an `__value` output of `__number` and `__unit`), then
 * `__status` with the `__current` reading and the `__action` hint (`--heating | --cooling | --drying | --fan |
 * --idle | --off`), then the `__mode` control. Taps change the number at once and `onTarget` fires once they
 * settle (and on `destroy` if still waiting). Modifiers `--compact`, `--range`; state `.is-disabled`.
 */
export function createThermostat(options: ThermostatOptions): ThermostatHandle {
  let o: ThermostatOptions = { ...options };
  const el = h('div', { role: 'group' });
  const targets = h('div', { class: 'mh-thermostat__targets' });
  const current = h('span', { class: 'mh-thermostat__current' });
  const action = h('span', {});
  const status = h('div', { class: 'mh-thermostat__status' });
  const modeBox = h('div', { class: 'mh-thermostat__mode' });
  let parts: PartView[] = [];
  let partsKey = '';
  let modeKey = '';
  let setModeValue: ((value: string) => void) | null = null;
  let setModeDisabled: ((disabled: boolean) => void) | null = null;

  const labels = (): ThermostatLabels => ({ ...THERMOSTAT_LABELS, ...o.labels });
  const prop = (): ThermostatTarget | null => thermostatTargetOf(o);
  const pending = createPendingValue<ThermostatTarget | null>({
    send: (value) => {
      if (value !== null) o.onTarget?.(value);
    },
    changed: () => render(),
    delay: o.delay ?? PENDING_DELAY,
    equal: thermostatTargetsEqual,
  });

  const tap = (part: ThermostatPart, direction: 1 | -1): void => {
    const shown = pending.shown(prop());
    if (shown === null || o.disabled) return;
    pending.schedule(nudgeThermostat(shown, part, direction, limitsOf(o)), prop());
    render();
  };

  const buildPart = (part: ThermostatPart): PartView => {
    const l = labels();
    const size = o.compact ? 'small' : 'medium';
    const lower = createIconButton({ icon: mdiMinus, label: l.lower, size, filled: true, onClick: () => tap(part, -1) });
    const raise = createIconButton({ icon: mdiPlus, label: l.raise, size, filled: true, onClick: () => tap(part, 1) });
    lower.el.classList.add('mh-thermostat__step');
    raise.el.classList.add('mh-thermostat__step');
    const number = h('span', { class: 'mh-thermostat__number' });
    const unit = h('span', { class: 'mh-thermostat__unit' });
    const value = h('output', { class: 'mh-thermostat__value' }, number, unit);
    const name = thermostatPartLabel(part, l);
    const elPart = h(
      'div',
      { class: thermostatTargetClass(part), role: 'group', 'aria-label': name },
      part === 'single' ? null : h('span', { class: 'mh-thermostat__target-label', 'aria-hidden': 'true' }, name),
      h('div', { class: 'mh-thermostat__adjust' }, lower.el, value, raise.el),
    );
    return { part, el: elPart, lower, raise, number, unit, value };
  };

  const renderMode = (): void => {
    const modes = o.modes ?? [];
    const key = JSON.stringify([modes, o.compact, labels().mode]);
    if (key !== modeKey) {
      modeKey = key;
      const onChange = (value: string): void => o.onMode?.(value);
      if (modes.length === 0) {
        modeBox.replaceChildren();
        setModeValue = setModeDisabled = null;
      } else if (modes.length <= THERMOSTAT_SEGMENT_LIMIT) {
        const seg = createSegmentedControl({ label: labels().mode, options: modes, value: o.mode, size: o.compact ? 'small' : 'medium', fullWidth: true, onChange });
        modeBox.replaceChildren(seg.el);
        setModeValue = seg.setValue;
        setModeDisabled = seg.setDisabled;
      } else {
        const select = createSelect({ ariaLabel: labels().mode, options: modes.map((m) => ({ value: m.value, label: m.label })), value: o.mode, size: o.compact ? 'small' : 'medium', onChange });
        modeBox.replaceChildren(select.el);
        setModeValue = select.setValue;
        setModeDisabled = select.setDisabled;
      }
    }
    if (o.mode !== undefined) setModeValue?.(o.mode);
    setModeDisabled?.(!!o.disabled);
  };

  const render = (): void => {
    const l = labels();
    const shown = pending.shown(prop());
    const kinds = thermostatParts(shown);
    const limits = limitsOf(o);
    el.className = thermostatClass({ ...o, range: kinds.length === 2, pending: pending.phase !== 'idle' });
    el.setAttribute('aria-label', o.label ?? 'Thermostat');

    const key = JSON.stringify([kinds, o.compact, o.labels]);
    if (key !== partsKey) {
      partsKey = key;
      parts = kinds.map(buildPart);
      targets.replaceChildren(...parts.map((p) => p.el));
    }
    for (const p of parts) {
      const s = thermostatPartState(shown, p.part, limits);
      p.number.textContent = formatThermostatNumber(s.value, limits.step);
      p.unit.textContent = s.value === null ? '' : (o.unit ?? THERMOSTAT_DEFAULTS.unit);
      p.lower.setDisabled(!!o.disabled || !s.canLower);
      p.raise.setDisabled(!!o.disabled || !s.canRaise);
    }

    const hasCurrent = typeof o.current === 'number';
    current.textContent = hasCurrent ? `${l.now} ${withThermostatUnit(formatThermostatNumber(o.current, limits.step), o.unit ?? THERMOSTAT_DEFAULTS.unit)}` : '';
    if (o.action) {
      action.className = thermostatActionClass(o.action);
      action.textContent = l[o.action];
    }
    status.replaceChildren(...(hasCurrent ? [current] : []), ...(o.action ? [action] : []));

    renderMode();
    const children: HTMLElement[] = [targets];
    if (hasCurrent || o.action) children.push(status);
    if ((o.modes ?? []).length > 0) children.push(modeBox);
    syncChildren(el, children);
  };
  render();

  return {
    el,
    update(changes) {
      o = { ...o, ...changes };
      render();
    },
    destroy: () => pending.dispose(),
  };
}
