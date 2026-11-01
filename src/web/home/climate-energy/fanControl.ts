import { mdiArrowOscillating, mdiFan, mdiRotateLeft, mdiRotateRight } from '@mdi/js';
import { createSegmentedControl, type SegmentedControlHandle, type SegmentOption } from '../../choice-inputs/segmentedControl.ts';
import { createSwitch, type SwitchHandle } from '../../choice-inputs/switch.ts';
import { cx, h } from '../../dom.ts';
import type { IconName } from '../../icons.ts';
import { createSelect, type SelectHandle } from '../../text-inputs/select.ts';
import { syncChildren } from '../children.ts';
import { createHomeSlider, type HomeSliderHandle } from '../homeSlider.ts';
import { clampTo, isNum } from './shared.ts';

/** Which way the blades turn: `forward` pushes air down (summer), `reverse` pulls it up (winter). */
export type FanDirection = 'forward' | 'reverse';

export interface FanPreset {
  value: string;
  label: string;
  icon?: IconName | string;
}

/** Every visible and spoken word, for translation. */
export interface FanControlLabels {
  power: string;
  speed: string;
  oscillate: string;
  direction: string;
  forward: string;
  reverse: string;
  preset: string;
  on: string;
  off: string;
}

export const FAN_CONTROL_LABELS: FanControlLabels = {
  power: 'Power',
  speed: 'Speed',
  oscillate: 'Oscillate',
  direction: 'Direction',
  forward: 'Forward',
  reverse: 'Reverse',
  preset: 'Preset',
  on: 'On',
  off: 'Off',
};

export interface FanControlOptions {
  /** Accessible name of the whole control (default "Fan"). */
  label?: string;
  on: boolean;
  /** Speed as a percentage (0–100); `null` when the fan doesn't report one. */
  percentage?: number | null;
  /**
   * How many speeds the fan has. Two to six become step buttons ("1", "2", "3"); more, or none given, a 0–100%
   * slider (stepping by one speed when a count is given).
   */
  speedCount?: number;
  /** Oscillation; `null` or omitted hides the switch. */
  oscillating?: boolean | null;
  /** Blade direction; `null` or omitted hides the choice. */
  direction?: FanDirection | null;
  preset?: string | null;
  /** Up to four become a segmented control, more a select. */
  presets?: readonly FanPreset[];
  disabled?: boolean;
  labels?: Partial<FanControlLabels>;
  onToggle?: (on: boolean) => void;
  /** The chosen speed as a percentage: at once for a step, on release for the slider. */
  onPercentage?: (percentage: number) => void;
  onOscillate?: (oscillating: boolean) => void;
  onDirection?: (direction: FanDirection) => void;
  onPreset?: (preset: string) => void;
}

export interface FanControlHandle {
  el: HTMLDivElement;
  /** Applies changed options; omitted ones keep their value. A dragged speed stays on screen until it is sent. */
  update(changes: Partial<FanControlOptions>): void;
  /** Sends a dragged speed that was never released. */
  destroy(): void;
}

/** Most speeds shown as step buttons; above this the speed is a slider. */
export const FAN_STEP_LIMIT = 6;
/** Most presets shown as a segmented control; above this they are a select. */
export const FAN_PRESET_LIMIT = 4;

/** Whether a fan with this many speeds gets step buttons. */
export function fanUsesSteps(speedCount: number | undefined): boolean {
  return isNum(speedCount) && speedCount >= 2 && speedCount <= FAN_STEP_LIMIT;
}

/** The speed step (1..count) nearest a percentage (any speed above 0% is at least step 1), or 0 for 0% and unknown. */
export function fanStepOf(percentage: number | null | undefined, count: number): number {
  if (!isNum(percentage) || percentage <= 0 || count < 1) return 0;
  return clampTo(Math.round((percentage * count) / 100), 1, count);
}

/** The percentage of a speed step (step 2 of 3 → 67). */
export function fanStepPercentage(step: number, count: number): number {
  return count < 1 ? 0 : Math.round((clampTo(step, 0, count) * 100) / count);
}

/** The slider's step: one speed when the count is known, else 1%. */
export function fanSliderStep(speedCount: number | undefined): number {
  return isNum(speedCount) && speedCount > 0 ? 100 / speedCount : 1;
}

export function formatFanSpeed(percentage: number): string {
  return `${Math.round(percentage)}%`;
}

/** One turn of the spinning icon, in seconds: slower at low speed. `null` when it shouldn't spin. */
export function fanSpinSeconds(on: boolean, percentage: number | null | undefined): number | null {
  if (!on) return null;
  const p = isNum(percentage) ? clampTo(percentage, 0, 100) : 50;
  if (p <= 0) return null;
  return Math.round((2.4 - (p / 100) * 1.95) * 100) / 100;
}

/** The `style` of the root: the spin time as `--_spin`, or nothing. */
export function fanControlStyle(on: boolean, percentage: number | null | undefined): string | undefined {
  const s = fanSpinSeconds(on, percentage);
  return s === null ? undefined : `--_spin: ${s}s`;
}

export function fanControlClass(o: { on: boolean; disabled?: boolean; spinning?: boolean }): string {
  return cx('mh-fan-control', o.on && 'is-on', o.spinning && 'is-spinning', o.disabled && 'is-disabled');
}

/** The step buttons ("1" … "n"), each named "Speed 2 of 3" for screen readers through the group label. */
export function fanStepOptions(count: number): SegmentOption[] {
  return Array.from({ length: count }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));
}

export function fanDirectionOptions(labels: FanControlLabels): SegmentOption[] {
  return [
    { value: 'forward', label: labels.forward, icon: mdiRotateRight },
    { value: 'reverse', label: labels.reverse, icon: mdiRotateLeft },
  ];
}

export const FAN_OSCILLATE_ICON = mdiArrowOscillating;

/**
 * `.mh-fan-control`: a `__power` switch row whose fan icon spins (faster with the speed; it stands still under
 * reduced motion), then `__field`s, each with a visible `__field-label`: `--speed` (step buttons for two to six speeds,
 * else a slider), `--direction` (forward / reverse) and `--preset` (segmented up to four, else a select), and the
 * `__oscillate` switch row. States `.is-on`, `.is-spinning`, `.is-disabled`.
 */
export function createFanControl(options: FanControlOptions): FanControlHandle {
  let o: FanControlOptions = { ...options };
  const el = h('div', { role: 'group' });
  let key = '';
  let power: SwitchHandle | null = null;
  let steps: SegmentedControlHandle | null = null;
  let slider: HomeSliderHandle | null = null;
  let oscillate: SwitchHandle | null = null;
  let direction: SegmentedControlHandle | null = null;
  let presetSeg: SegmentedControlHandle | null = null;
  let presetSelect: SelectHandle | null = null;

  const labels = (): FanControlLabels => ({ ...FAN_CONTROL_LABELS, ...o.labels });
  const field = (kind: string, label: string, control: HTMLElement): HTMLElement =>
    h('div', { class: `mh-fan-control__field mh-fan-control__field--${kind}` }, h('span', { class: 'mh-fan-control__field-label', 'aria-hidden': 'true' }, label), control);

  const build = (): void => {
    const l = labels();
    slider?.dispose();
    steps = slider = oscillate = direction = presetSeg = presetSelect = null;
    const parts: HTMLElement[] = [];
    power = createSwitch({ label: l.power, row: true, icon: mdiFan, checked: o.on, onChange: (checked) => o.onToggle?.(checked) });
    power.el.classList.add('mh-fan-control__power');
    parts.push(power.el);
    if (fanUsesSteps(o.speedCount)) {
      const count = o.speedCount!;
      steps = createSegmentedControl({ label: l.speed, options: fanStepOptions(count), fullWidth: true, onChange: (v) => o.onPercentage?.(fanStepPercentage(Number(v), count)) });
      parts.push(field('speed', l.speed, steps.el));
    } else if (o.percentage !== null && o.percentage !== undefined) {
      slider = createHomeSlider({
        label: l.speed,
        className: 'mh-fan-control__slider',
        value: o.percentage,
        min: 0,
        max: 100,
        step: fanSliderStep(o.speedCount),
        format: formatFanSpeed,
        onCommit: (v) => o.onPercentage?.(Math.round(v)),
      });
      parts.push(slider.el);
    }
    if (o.direction) {
      direction = createSegmentedControl({ label: l.direction, options: fanDirectionOptions(l), fullWidth: true, onChange: (v) => o.onDirection?.(v as FanDirection) });
      parts.push(field('direction', l.direction, direction.el));
    }
    const presets = o.presets ?? [];
    if (presets.length > 0) {
      const onChange = (v: string): void => o.onPreset?.(v);
      if (presets.length <= FAN_PRESET_LIMIT) {
        presetSeg = createSegmentedControl({ label: l.preset, options: presets, fullWidth: true, onChange });
        parts.push(field('preset', l.preset, presetSeg.el));
      } else {
        presetSelect = createSelect({ ariaLabel: l.preset, options: presets.map((p) => ({ value: p.value, label: p.label })), onChange });
        parts.push(field('preset', l.preset, presetSelect.el));
      }
    }
    if (typeof o.oscillating === 'boolean') {
      oscillate = createSwitch({ label: l.oscillate, row: true, icon: FAN_OSCILLATE_ICON, checked: o.oscillating, onChange: (checked) => o.onOscillate?.(checked) });
      oscillate.el.classList.add('mh-fan-control__oscillate');
      parts.push(oscillate.el);
    }
    syncChildren(el, parts);
  };

  const render = (): void => {
    const disabled = !!o.disabled;
    const spin = fanControlStyle(o.on, o.percentage);
    el.className = fanControlClass({ on: o.on, disabled, spinning: spin !== undefined });
    el.setAttribute('aria-label', o.label ?? 'Fan');
    if (spin) el.setAttribute('style', spin);
    else el.removeAttribute('style');
    const shape = JSON.stringify([
      fanUsesSteps(o.speedCount) ? o.speedCount : o.percentage === null || o.percentage === undefined ? 'none' : `slider${o.speedCount ?? ''}`,
      !!o.direction,
      typeof o.oscillating === 'boolean',
      o.presets ?? [],
      o.labels ?? {},
    ]);
    if (shape !== key) {
      key = shape;
      build();
    }
    power?.setChecked(o.on);
    power?.setDisabled(disabled);
    if (steps) {
      const at = fanStepOf(o.percentage, o.speedCount!);
      for (const input of steps.inputs) input.checked = Number(input.value) === at;
      steps.setDisabled(disabled);
    }
    if (slider && isNum(o.percentage)) slider.set({ value: o.percentage, min: 0, max: 100, disabled });
    if (oscillate && typeof o.oscillating === 'boolean') {
      oscillate.setChecked(o.oscillating);
      oscillate.setDisabled(disabled);
    }
    if (direction && o.direction) {
      direction.setValue(o.direction);
      direction.setDisabled(disabled);
    }
    if (presetSeg) {
      for (const input of presetSeg.inputs) input.checked = input.value === o.preset;
      presetSeg.setDisabled(disabled);
    }
    if (presetSelect) {
      presetSelect.setValue(o.preset ?? '');
      presetSelect.setDisabled(disabled);
    }
  };
  render();

  return {
    el,
    update(changes) {
      o = { ...o, ...changes };
      render();
    },
    destroy: () => slider?.dispose(),
  };
}
