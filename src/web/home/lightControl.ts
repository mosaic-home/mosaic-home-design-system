import { createSwitch, switchClass, type SwitchHandle } from '../choice-inputs/switch.ts';
import { cx, h } from '../dom.ts';
import { syncChildren } from './children.ts';
import { createHomeSlider, type HomeSliderHandle, type HomeSliderState } from './homeSlider.ts';

/** A colour temperature in kelvin and the range the light supports. */
export interface LightColorTemp {
  value: number;
  min: number;
  max: number;
}

/** Every visible word, for translation. */
export interface LightControlLabels {
  power: string;
  brightness: string;
  colorTemp: string;
  hue: string;
}

export const LIGHT_CONTROL_LABELS: LightControlLabels = { power: 'Power', brightness: 'Brightness', colorTemp: 'Colour temperature', hue: 'Colour' };

export interface LightControlOptions {
  /** Accessible name of the whole control (default "Light"). */
  label?: string;
  on: boolean;
  /** 0 to 100; no slider when null. */
  brightness?: number | null;
  /** Kelvin; no slider when null. */
  colorTemp?: LightColorTemp | null;
  /** 0 to 360 when the light takes colours; no slider when null. */
  hue?: number | null;
  disabled?: boolean;
  /** Show the on/off switch row (default true); leave it out when the card's trailing control is the switch. */
  toggle?: boolean;
  /**
   * Which of the supported sliders to show, e.g. `['brightness']` for a compact light, or only the slider of the
   * light's current colour mode. Default: every slider the options support.
   */
  sliders?: LightSlider[];
  labels?: Partial<LightControlLabels>;
  onToggle?: (on: boolean) => void;
  /** Sent when the finger lifts (not while dragging); a key press sends at once. */
  onBrightness?: (value: number) => void;
  onColorTemp?: (kelvin: number) => void;
  onHue?: (hue: number) => void;
}

export interface LightControlHandle {
  el: HTMLDivElement;
  /** Applies changed options; omitted ones keep their value. A slider being dragged keeps the user's value. */
  update(changes: Partial<LightControlOptions>): void;
  /** Sends a dragged value that was never released. */
  destroy(): void;
}

export type LightSlider = 'brightness' | 'temperature' | 'hue';

export function lightControlClass(o: Pick<LightControlOptions, 'on' | 'disabled'>): string {
  return cx('mh-light-control', o.on && 'is-on', o.disabled && 'is-disabled');
}

export function lightSliderClass(kind: LightSlider): string {
  return `mh-light-control__slider mh-light-control__slider--${kind}`;
}

/** The switch row's classes. */
export function lightPowerClass(): string {
  return cx(switchClass(true), 'mh-light-control__power');
}

/** Keyboard step of the colour temperature: about a hundredth of the range. */
export function lightTempStep(min: number, max: number): number {
  return Math.max(1, Math.round((max - min) / 100));
}

export const formatBrightness = (value: number): string => `${Math.round(value)}%`;
export const formatKelvin = (value: number): string => `${Math.round(value)} K`;
/** A colour's everyday name from its hue (0 to 360). */
export function hueName(value: number): string {
  const h = ((value % 360) + 360) % 360;
  if (h < 15 || h >= 345) return 'Red';
  if (h < 45) return 'Orange';
  if (h < 70) return 'Yellow';
  if (h < 160) return 'Green';
  if (h < 200) return 'Cyan';
  if (h < 255) return 'Blue';
  if (h < 290) return 'Purple';
  return 'Pink';
}

/** The hue slider's value text: the colour's name, not degrees. */
export const formatHue = (value: number): string => hueName(value);

/** The three sliders' current states, in order, for what the options support. */
export function lightSliders(o: LightControlOptions): { kind: LightSlider; state: HomeSliderState; step: number }[] {
  const disabled = !!o.disabled;
  const out: { kind: LightSlider; state: HomeSliderState; step: number }[] = [];
  if (typeof o.brightness === 'number') out.push({ kind: 'brightness', state: { value: o.brightness, min: 0, max: 100, disabled }, step: 1 });
  if (o.colorTemp) out.push({ kind: 'temperature', state: { ...o.colorTemp, disabled }, step: lightTempStep(o.colorTemp.min, o.colorTemp.max) });
  if (typeof o.hue === 'number') out.push({ kind: 'hue', state: { value: o.hue, min: 0, max: 360, disabled }, step: 1 });
  return o.sliders ? out.filter((s) => o.sliders!.includes(s.kind)) : out;
}

/**
 * `.mh-light-control`: an on/off switch row (`__power`) and the sliders a light supports (`__slider--brightness`
 * filled with the lit colour, `--temperature` on a warm-to-cool track, `--hue` on a colour wheel track). Sliders
 * send their value when released and at once for keys. State `.is-on`, `.is-disabled`.
 */
export function createLightControl(options: LightControlOptions): LightControlHandle {
  let o: LightControlOptions = { ...options };
  const el = h('div', { role: 'group' });
  const sliders = new Map<LightSlider, HomeSliderHandle>();
  let power: SwitchHandle | null = null;
  let labelsKey = '';

  const send: Record<LightSlider, (value: number) => void> = {
    brightness: (v) => o.onBrightness?.(v),
    temperature: (v) => o.onColorTemp?.(v),
    hue: (v) => o.onHue?.(v),
  };
  const sliderLabel = (kind: LightSlider, l: LightControlLabels): string => (kind === 'brightness' ? l.brightness : kind === 'temperature' ? l.colorTemp : l.hue);
  const format: Record<LightSlider, (value: number) => string> = { brightness: formatBrightness, temperature: formatKelvin, hue: formatHue };

  const render = (): void => {
    const l = { ...LIGHT_CONTROL_LABELS, ...o.labels };
    el.className = lightControlClass(o);
    el.setAttribute('aria-label', o.label ?? 'Light');
    const key = JSON.stringify(l);
    if (!power || key !== labelsKey) {
      labelsKey = key;
      power = createSwitch({ label: l.power, row: true, onChange: (on) => o.onToggle?.(on) });
      power.el.classList.add('mh-light-control__power');
      for (const slider of sliders.values()) slider.dispose();
      sliders.clear();
    }
    power.setChecked(o.on);
    power.setDisabled(!!o.disabled);

    const wanted = lightSliders(o);
    for (const [kind, slider] of sliders) {
      if (!wanted.some((w) => w.kind === kind)) {
        slider.dispose();
        sliders.delete(kind);
      }
    }
    const children: HTMLElement[] = o.toggle === false ? [] : [power.el];
    for (const w of wanted) {
      let slider = sliders.get(w.kind);
      if (!slider) {
        slider = createHomeSlider({ ...w.state, label: sliderLabel(w.kind, l), className: lightSliderClass(w.kind), step: w.step, format: format[w.kind], onCommit: (v) => send[w.kind](v) });
        sliders.set(w.kind, slider);
      } else {
        slider.input.step = String(w.step);
        slider.set(w.state);
      }
      children.push(slider.el);
    }
    syncChildren(el, children);
  };

  render();

  return {
    el,
    update(changes) {
      o = { ...o, ...changes };
      render();
    },
    destroy() {
      for (const s of sliders.values()) s.dispose();
    },
  };
}
