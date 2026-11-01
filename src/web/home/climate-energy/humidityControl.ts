import { mdiMinus, mdiPlus } from '@mdi/js';
import { createIconButton, type IconButtonHandle } from '../../actions/iconButton.ts';
import { createSegmentedControl } from '../../choice-inputs/segmentedControl.ts';
import { createSwitch, type SwitchHandle } from '../../choice-inputs/switch.ts';
import { cx, h } from '../../dom.ts';
import type { IconName } from '../../icons.ts';
import { createSelect } from '../../text-inputs/select.ts';
import { syncChildren } from '../children.ts';
import { createPendingValue, PENDING_DELAY } from '../pending.ts';
import { clampTo, isNum, roundToStep, stepDigits } from './shared.ts';

/** What the device is doing right now. */
export type HumidityAction = 'humidifying' | 'drying' | 'idle' | 'off';

export interface HumidityMode {
  value: string;
  label: string;
  icon?: IconName | string;
}

/** A comfortable range drawn on the gauge, in percent. */
export interface HumidityComfort {
  low: number;
  high: number;
}

/** Every visible and spoken word, for translation. */
export interface HumidityControlLabels {
  power: string;
  target: string;
  lower: string;
  raise: string;
  /** Before the current reading ("Now 48%"). */
  now: string;
  mode: string;
  humidifying: string;
  drying: string;
  idle: string;
  off: string;
}

export const HUMIDITY_CONTROL_LABELS: HumidityControlLabels = {
  power: 'Power',
  target: 'Target humidity',
  lower: 'Lower',
  raise: 'Raise',
  now: 'Now',
  mode: 'Mode',
  humidifying: 'Humidifying',
  drying: 'Drying',
  idle: 'Idle',
  off: 'Off',
};

export const HUMIDITY_DEFAULTS = { min: 30, max: 80, step: 1, comfort: { low: 40, high: 60 } } as const;

/** Above this many modes the mode is a select rather than a segmented control. */
export const HUMIDITY_SEGMENT_LIMIT = 4;

export interface HumidityControlOptions {
  /** Accessible name of the whole control (default "Humidity"). */
  label?: string;
  /** The measured relative humidity, in percent. */
  current?: number | null;
  /** The target, in percent. */
  target?: number | null;
  /** Default 30. */
  min?: number;
  /** Default 80. */
  max?: number;
  /** One tap of − / + (default 1); also sets the decimals shown. */
  step?: number;
  /** A boolean shows the power switch. */
  on?: boolean | null;
  mode?: string;
  /** Up to four become a segmented control, more a select. */
  modes?: readonly HumidityMode[];
  action?: HumidityAction | null;
  /** The band drawn as comfortable on the gauge (default 40–60%); `null` hides it. */
  comfort?: HumidityComfort | null;
  disabled?: boolean;
  /** Smaller type and controls, for small cards. */
  compact?: boolean;
  labels?: Partial<HumidityControlLabels>;
  /** Idle time after the last tap before `onTarget` fires, in ms (default 700). */
  delay?: number;
  /** The new target, once the taps settle. */
  onTarget?: (value: number) => void;
  onMode?: (value: string) => void;
  onToggle?: (on: boolean) => void;
}

export interface HumidityControlHandle {
  el: HTMLDivElement;
  /** Applies changed options; omitted ones keep their value. A target still being tapped stays on screen. */
  update(changes: Partial<HumidityControlOptions>): void;
  /** Sends a target that is still waiting for the taps to settle. */
  destroy(): void;
}

interface HumidityLimits {
  min: number;
  max: number;
  step: number;
}

export function humidityLimits(o: Pick<HumidityControlOptions, 'min' | 'max' | 'step'>): HumidityLimits {
  return { min: o.min ?? HUMIDITY_DEFAULTS.min, max: o.max ?? HUMIDITY_DEFAULTS.max, step: o.step ?? HUMIDITY_DEFAULTS.step };
}

/** "48" with the step's decimals, or an en dash when unknown. */
export function formatHumidity(value: number | null | undefined, step: number = HUMIDITY_DEFAULTS.step): string {
  return isNum(value) ? value.toFixed(stepDigits(step)) : '–';
}

/** One − (-1) or + (1) tap, rounded to the step and kept within min / max. */
export function nudgeHumidity(target: number, direction: 1 | -1, limits: HumidityLimits): number {
  return clampTo(roundToStep(target + direction * limits.step, limits.step), limits.min, limits.max);
}

/** Positions on the 0–100% gauge, in percent of its width; `null` for what isn't known or shown. */
export function humidityGauge(o: { current?: number | null; target?: number | null; comfort?: HumidityComfort | null }): {
  current: number | null;
  target: number | null;
  comfort: { left: number; width: number } | null;
} {
  const at = (v: number | null | undefined): number | null => (isNum(v) ? clampTo(v, 0, 100) : null);
  const c = o.comfort === undefined ? HUMIDITY_DEFAULTS.comfort : o.comfort;
  const comfort = c ? { left: clampTo(Math.min(c.low, c.high), 0, 100), width: clampTo(Math.abs(c.high - c.low), 0, 100) } : null;
  return { current: at(o.current), target: at(o.target), comfort };
}

export function humidityControlClass(o: { compact?: boolean; disabled?: boolean; off?: boolean }): string {
  return cx('mh-humidity-control', o.compact && 'mh-humidity-control--compact', o.off && 'is-off', o.disabled && 'is-disabled');
}

export function humidityActionClass(action: HumidityAction): string {
  return `mh-humidity-control__action mh-humidity-control__action--${action}`;
}

/** Inline style of a gauge part at `left` percent (and `width` for the band). */
export function humidityGaugeStyle(left: number, width?: number): string {
  return width === undefined ? `left: ${left}%` : `left: ${left}%; width: ${width}%`;
}

/**
 * `.mh-humidity-control`: an optional `__power` switch row, the target big between − / + buttons (`__target`
 * group with `__adjust`, `__step` buttons and an `__value` output of `__number` and `__unit`), a `__gauge` (0–100%
 * `__track` with the `__comfort` band, the `__marker--target` tick and the `__marker--current` dot; hidden from
 * screen readers, the words say the same), the `__status` line (`__current` reading and the `__action` hint
 * `--humidifying | --drying | --idle | --off`) and the `__mode` control. Taps change the number at once and
 * `onTarget` fires once they settle. Modifier `--compact`; states `.is-off`, `.is-disabled`.
 */
export function createHumidityControl(options: HumidityControlOptions): HumidityControlHandle {
  let o: HumidityControlOptions = { ...options };
  const el = h('div', { role: 'group' });
  const number = h('span', { class: 'mh-humidity-control__number' });
  const unit = h('span', { class: 'mh-humidity-control__unit' });
  const value = h('output', { class: 'mh-humidity-control__value' }, number, unit);
  const adjust = h('div', { class: 'mh-humidity-control__adjust' });
  const target = h('div', { class: 'mh-humidity-control__target', role: 'group' }, adjust);
  const track = h('div', { class: 'mh-humidity-control__track' });
  const gauge = h('div', { class: 'mh-humidity-control__gauge', 'aria-hidden': 'true' }, track);
  const comfortEl = h('span', { class: 'mh-humidity-control__comfort' });
  const targetMark = h('span', { class: 'mh-humidity-control__marker mh-humidity-control__marker--target' });
  const currentMark = h('span', { class: 'mh-humidity-control__marker mh-humidity-control__marker--current' });
  const current = h('span', { class: 'mh-humidity-control__current' });
  const action = h('span', {});
  const status = h('div', { class: 'mh-humidity-control__status' });
  const modeBox = h('div', { class: 'mh-humidity-control__mode' });
  let lower: IconButtonHandle | null = null;
  let raise: IconButtonHandle | null = null;
  let power: SwitchHandle | null = null;
  let powerLabel = '';
  let buttonsKey = '';
  let modeKey = '';
  let setModeValue: ((value: string) => void) | null = null;
  let setModeDisabled: ((disabled: boolean) => void) | null = null;

  const labels = (): HumidityControlLabels => ({ ...HUMIDITY_CONTROL_LABELS, ...o.labels });
  const prop = (): number | null => (isNum(o.target) ? o.target : null);
  const pending = createPendingValue<number | null>({
    send: (v) => {
      if (v !== null) o.onTarget?.(v);
    },
    changed: () => render(),
    delay: o.delay ?? PENDING_DELAY,
  });
  const tap = (direction: 1 | -1): void => {
    const shown = pending.shown(prop());
    if (shown === null || o.disabled) return;
    pending.schedule(nudgeHumidity(shown, direction, humidityLimits(o)), prop());
    render();
  };

  const renderMode = (l: HumidityControlLabels): void => {
    const modes = o.modes ?? [];
    const k = JSON.stringify([modes, o.compact, l.mode]);
    if (k !== modeKey) {
      modeKey = k;
      const onChange = (v: string): void => o.onMode?.(v);
      const size = o.compact ? 'small' : 'medium';
      if (modes.length === 0) {
        modeBox.replaceChildren();
        setModeValue = setModeDisabled = null;
      } else if (modes.length <= HUMIDITY_SEGMENT_LIMIT) {
        const seg = createSegmentedControl({ label: l.mode, options: modes, value: o.mode, size, fullWidth: true, onChange });
        modeBox.replaceChildren(seg.el);
        setModeValue = seg.setValue;
        setModeDisabled = seg.setDisabled;
      } else {
        const select = createSelect({ ariaLabel: l.mode, options: modes.map((m) => ({ value: m.value, label: m.label })), value: o.mode, size, onChange });
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
    const limits = humidityLimits(o);
    const shown = pending.shown(prop());
    const disabled = !!o.disabled;
    el.className = humidityControlClass({ compact: o.compact, disabled, off: o.on === false });
    el.setAttribute('aria-label', o.label ?? 'Humidity');

    const hasPower = typeof o.on === 'boolean';
    if (hasPower && (!power || powerLabel !== l.power)) {
      powerLabel = l.power;
      power = createSwitch({ label: l.power, row: true, checked: !!o.on, onChange: (checked) => o.onToggle?.(checked) });
      power.el.classList.add('mh-humidity-control__power');
    }
    if (!hasPower) power = null;
    power?.setChecked(!!o.on);
    power?.setDisabled(disabled);

    const k = JSON.stringify([o.compact, l.lower, l.raise]);
    if (k !== buttonsKey) {
      buttonsKey = k;
      const size = o.compact ? 'small' : 'medium';
      lower = createIconButton({ icon: mdiMinus, label: l.lower, size, filled: true, onClick: () => tap(-1) });
      raise = createIconButton({ icon: mdiPlus, label: l.raise, size, filled: true, onClick: () => tap(1) });
      lower.el.classList.add('mh-humidity-control__step');
      raise.el.classList.add('mh-humidity-control__step');
      adjust.replaceChildren(lower.el, value, raise.el);
    }
    target.setAttribute('aria-label', l.target);
    number.textContent = formatHumidity(shown, limits.step);
    unit.textContent = shown === null ? '' : '%';
    lower?.setDisabled(disabled || shown === null || shown <= limits.min);
    raise?.setDisabled(disabled || shown === null || shown >= limits.max);

    const g = humidityGauge({ current: o.current, target: shown, comfort: o.comfort });
    const marks: HTMLElement[] = [];
    if (g.comfort) {
      comfortEl.setAttribute('style', humidityGaugeStyle(g.comfort.left, g.comfort.width));
      marks.push(comfortEl);
    }
    if (g.target !== null) {
      targetMark.setAttribute('style', humidityGaugeStyle(g.target));
      marks.push(targetMark);
    }
    if (g.current !== null) {
      currentMark.setAttribute('style', humidityGaugeStyle(g.current));
      marks.push(currentMark);
    }
    syncChildren(track, marks);

    const hasCurrent = isNum(o.current);
    current.textContent = hasCurrent ? `${l.now} ${formatHumidity(o.current, limits.step)}%` : '';
    if (o.action) {
      action.className = humidityActionClass(o.action);
      action.textContent = l[o.action];
    }
    syncChildren(status, [...(hasCurrent ? [current] : []), ...(o.action ? [action] : [])]);

    renderMode(l);
    const children: HTMLElement[] = [];
    if (power) children.push(power.el);
    children.push(target, gauge);
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
