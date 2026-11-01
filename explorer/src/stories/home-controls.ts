import { mdiBlindsHorizontal, mdiCeilingLight, mdiDoor, mdiFloorLamp, mdiGarage, mdiRadiator, mdiThermostat, mdiValve } from '@mdi/js';
import { createIconButton } from '../../../src/web/actions/iconButton.ts';
import { createSwitch } from '../../../src/web/choice-inputs/switch.ts';
import { h } from '../../../src/web/dom.ts';
import { createText } from '../../../src/web/foundations/text.ts';
import { createControlCard, type ControlCardHandle } from '../../../src/web/home/controlCard.ts';
import { createLightControl, type LightControlOptions } from '../../../src/web/home/lightControl.ts';
import { createLockControl, type LockControlHandle, type LockState } from '../../../src/web/home/lockControl.ts';
import { createPositionControl, type PositionControlOptions } from '../../../src/web/home/positionControl.ts';
import { createThermostat, formatThermostatNumber, type ThermostatMode, type ThermostatOptions } from '../../../src/web/home/thermostat.ts';
import { homeColorVariables } from '../../../src/tokens/home.ts';
import type { Tokens } from '../../../src/tokens/types.ts';
import type { Story } from './types.ts';

// Control card, thermostat, light, position and lock controls. Every name and value is invented.

const stack = (...children: Node[]): HTMLElement => h('div', { class: 'ex-stack' }, ...children);
const grid = (...children: Node[]): HTMLElement => h('div', { class: 'mh-grid' }, ...children);
const caption = (text: string): HTMLElement => createText(text, { variant: 'label', tone: 'muted' });

/** The story with the optional home colours turned on (as an app would with `applyHomeColors`). */
const withHomeColors = (tokens: Tokens, el: HTMLElement): HTMLElement => {
  for (const [name, value] of Object.entries(homeColorVariables(tokens.theme))) el.style.setProperty(name, value);
  return el;
};

/** Pretends to be the device: answers a command after a short delay. */
const later = (fn: () => void, ms = 600): void => void setTimeout(fn, ms);

/** A lamp card whose switch and state line follow each other. */
function lampCard(title: string, icon: string, level: number | null): ControlCardHandle {
  let on = level !== null;
  const stateText = (): string => (on ? (level === null ? 'On' : `On · ${level}%`) : 'Off');
  const toggle = createSwitch({ ariaLabel: `${title} power`, checked: on, onChange: (checked) => set(checked) });
  const card = createControlCard({ title, icon, active: on, tone: 'warm', state: stateText(), control: toggle.el });
  const set = (checked: boolean): void => {
    card.update({ loading: true });
    later(() => {
      on = checked;
      if (on && level === null) level = 60;
      toggle.setChecked(on);
      card.update({ loading: false, active: on, state: stateText() });
    });
  };
  return card;
}

const COLD_MODES: ThermostatMode[] = [
  { value: 'off', label: 'Off' },
  { value: 'heat', label: 'Heat' },
  { value: 'cool', label: 'Cool' },
  { value: 'heat_cool', label: 'Auto' },
];

const MANY_MODES: ThermostatMode[] = [...COLD_MODES, { value: 'dry', label: 'Dry' }, { value: 'fan_only', label: 'Fan only' }];

/** A thermostat that "reaches" its new target a moment after it is sent. */
function liveThermostat(start: ThermostatOptions, log?: HTMLElement): HTMLElement {
  const t = createThermostat({
    ...start,
    onTarget: (value) => {
      if (log) log.textContent = `Sent ${typeof value === 'number' ? formatThermostatNumber(value) : `${formatThermostatNumber(value.low)}–${formatThermostatNumber(value.high)}`}`;
      later(() => t.update(typeof value === 'number' ? { target: value } : { targetLow: value.low, targetHigh: value.high }));
    },
    onMode: (mode) => later(() => t.update({ mode, action: mode === 'off' ? 'off' : 'idle' })),
  });
  return t.el;
}

function liveLight(start: Omit<LightControlOptions, 'onToggle' | 'onBrightness' | 'onColorTemp' | 'onHue'>): HTMLElement {
  const light = createLightControl({
    ...start,
    onToggle: (on) => later(() => light.update({ on, brightness: on ? 80 : null })),
    onBrightness: (brightness) => later(() => light.update({ brightness })),
    onColorTemp: (value) => later(() => light.update({ colorTemp: start.colorTemp ? { ...start.colorTemp, value } : null })),
    onHue: (hue) => later(() => light.update({ hue })),
  });
  return light.el;
}

/** A blind that moves ten percent every 400 ms towards where it was sent. */
function liveCover(start: Omit<PositionControlOptions, 'onOpen' | 'onClose' | 'onStop' | 'onPosition'>): HTMLElement {
  let position = start.position ?? 0;
  let timer: ReturnType<typeof setInterval> | undefined;
  const stop = (): void => {
    clearInterval(timer);
    timer = undefined;
  };
  const go = (to: number): void => {
    stop();
    if (to === position) return;
    cover.update({ state: to > position ? 'opening' : 'closing' });
    timer = setInterval(() => {
      position += Math.sign(to - position) * Math.min(10, Math.abs(to - position));
      const done = position === to;
      cover.update(done ? { position, state: position === 100 ? 'open' : position === 0 ? 'closed' : 'stopped' } : { position });
      if (done) stop();
    }, 400);
  };
  const cover = createPositionControl({
    ...start,
    onOpen: () => go(100),
    onClose: () => go(0),
    onStop: () => {
      stop();
      cover.update({ state: 'stopped' });
    },
    onPosition: go,
  });
  return cover.el;
}

function liveLock(state: LockState, extra: { canOpen?: boolean; confirm?: boolean; label: string }): { el: HTMLElement; handle: LockControlHandle } {
  const handle = createLockControl({
    ...extra,
    state,
    onLock: () => {
      handle.update({ state: 'locking' });
      later(() => handle.update({ state: 'locked' }), 1200);
    },
    onUnlock: () => {
      handle.update({ state: 'unlocking' });
      later(() => handle.update({ state: 'unlocked' }), 1200);
    },
    onOpen: () => {
      handle.update({ state: 'opening' });
      later(() => handle.update({ state: 'open' }), 1200);
    },
  });
  return { el: handle.el, handle };
}

export const homeControlStories: Story[] = [
  {
    id: 'control-card',
    render: (tokens) => {
      const reading = createControlCard({ title: 'Reading nook', icon: mdiFloorLamp, state: 'On · 40%', active: true, tone: 'warm', onOpen: () => undefined });
      reading.update({ body: createLightControl({ on: true, brightness: 40, toggle: false }).el });
      const media = h('div', { style: 'aspect-ratio: 16 / 7; background: linear-gradient(135deg, var(--mh-accent-soft), var(--mh-surface-pressed));', role: 'img', 'aria-label': 'Snapshot of the porch' });
      return withHomeColors(
        tokens,
        stack(
          caption('Lights with a trailing switch: tap it to see the loading state, then the lit badge'),
          grid(lampCard('Desk lamp', mdiFloorLamp, 70).el, lampCard('Ceiling light over the long dining table by the window', mdiCeilingLight, null).el),
          caption('Tones: heat and cool (home colours), accent; the header opens more controls'),
          grid(
            createControlCard({ title: 'Hallway radiator', icon: mdiRadiator, state: 'Heating to 21°C', active: true, tone: 'heat', onOpen: () => undefined }).el,
            createControlCard({ title: 'Studio air', icon: mdiThermostat, state: 'Cooling · 24.5°C', active: true, tone: 'cool', onOpen: () => undefined }).el,
            createControlCard({ title: 'Garden valve', icon: mdiValve, state: 'Open', active: true, control: createIconButton({ icon: 'more', label: 'More' }).el }).el,
          ),
          caption('Body slot and media slot'),
          grid(reading.el, createControlCard({ title: 'Porch', icon: 'camera', state: 'Updated 2 min ago', media }).el),
          caption('Loading and unavailable (the switch is disabled, the state says what is given)'),
          grid(
            createControlCard({ title: 'Kitchen counter', icon: 'lightbulb', state: 'Turning on…', loading: true, control: createSwitch({ ariaLabel: 'Kitchen counter power' }).el }).el,
            createControlCard({ title: 'Shed light', icon: 'lightbulb', state: 'Unavailable', unavailable: true, control: createSwitch({ ariaLabel: 'Shed light power' }).el }).el,
          ),
          caption('Without the home colours: warm and heat fall back to the warning role, cool to info'),
          h(
            'div',
            { class: 'mh-grid', style: '--mh-home-heat: initial; --mh-home-cool: initial; --mh-home-light-on: initial;' },
            createControlCard({ title: 'Desk lamp', icon: mdiFloorLamp, state: 'On', active: true, tone: 'warm' }).el,
            createControlCard({ title: 'Hallway radiator', icon: mdiRadiator, state: 'Heating', active: true, tone: 'heat' }).el,
            createControlCard({ title: 'Studio air', icon: mdiThermostat, state: 'Cooling', active: true, tone: 'cool' }).el,
          ),
        ),
      );
    },
  },
  {
    id: 'thermostat',
    render: (tokens) => {
      const log = createText('Tap − / + a few times: one event is sent 0.7 s after the last tap.', { variant: 'label', tone: 'muted' });
      return withHomeColors(
        tokens,
        stack(
          log,
          grid(
            createControlCard({
              title: 'Living room',
              icon: mdiThermostat,
              state: 'Heating · Now 19.5°C',
              active: true,
              tone: 'heat',
              body: liveThermostat({ label: 'Living room thermostat', current: 19.5, target: 21, mode: 'heat', modes: COLD_MODES, action: 'heating' }, log),
            }).el,
            createControlCard({
              title: 'Studio',
              icon: mdiThermostat,
              state: 'Heat and cool',
              active: true,
              tone: 'cool',
              body: liveThermostat({ label: 'Studio thermostat', current: 23.4, targetLow: 19, targetHigh: 24, mode: 'heat_cool', modes: COLD_MODES, action: 'cooling' }, log),
            }).el,
          ),
          caption('More than four modes become a select; Fahrenheit with whole-degree steps'),
          grid(
            createControlCard({
              title: 'Guest room',
              icon: mdiThermostat,
              state: 'Drying',
              body: liveThermostat({ label: 'Guest room thermostat', current: 71, target: 70, unit: '°F', min: 50, max: 90, step: 1, mode: 'dry', modes: MANY_MODES, action: 'drying' }, log),
            }).el,
            createControlCard({
              title: 'Workshop',
              icon: mdiThermostat,
              state: 'Off',
              body: liveThermostat({ label: 'Workshop thermostat', current: 14, target: null, mode: 'off', modes: COLD_MODES, action: 'off' }),
            }).el,
          ),
          caption('Compact, for small cards; and disabled'),
          grid(
            createControlCard({ title: 'Nursery', icon: mdiThermostat, state: 'Idle', body: liveThermostat({ label: 'Nursery thermostat', compact: true, current: 20.5, target: 20.5, action: 'idle' }) }).el,
            createControlCard({ title: 'Loft', icon: mdiThermostat, state: 'Unavailable', unavailable: true, body: liveThermostat({ label: 'Loft thermostat', compact: true, disabled: true, current: null, target: 18 }) }).el,
          ),
        ),
      );
    },
  },
  {
    id: 'light-control',
    render: (tokens) =>
      withHomeColors(
        tokens,
        stack(
          caption('Sliders send when the finger lifts, or at once from the keyboard'),
          grid(
            createControlCard({ title: 'Bedside lamp', icon: mdiFloorLamp, state: 'On', active: true, tone: 'warm', body: liveLight({ label: 'Bedside lamp', on: true, brightness: 65, colorTemp: { value: 2700, min: 2000, max: 6500 } }) }).el,
            createControlCard({ title: 'Mood strip', icon: mdiCeilingLight, state: 'On', active: true, tone: 'warm', body: liveLight({ label: 'Mood strip', on: true, brightness: 80, colorTemp: { value: 4000, min: 2200, max: 6500 }, hue: 210 }) }).el,
          ),
          caption('Brightness only, off; and disabled'),
          grid(
            createControlCard({ title: 'Pantry', icon: 'lightbulb', state: 'Off', body: liveLight({ label: 'Pantry', on: false, brightness: 30 }) }).el,
            createControlCard({ title: 'Porch light', icon: 'lightbulb', state: 'Unavailable', unavailable: true, body: liveLight({ label: 'Porch light', on: false, brightness: 50, disabled: true }) }).el,
          ),
        ),
      ),
  },
  {
    id: 'position-control',
    render: () =>
      stack(
        caption('A blind with a position: open, stop, close and a slider; the arrow drifts while it moves'),
        grid(
          createControlCard({ title: 'Studio blind', icon: mdiBlindsHorizontal, state: 'Half open', body: liveCover({ label: 'Studio blind', state: 'stopped', position: 50, can: { open: true, close: true, stop: true, position: true }, labels: { open: 'Raise', close: 'Lower' } }) }).el,
          createControlCard({ title: 'Garage door', icon: mdiGarage, state: 'Closed', body: liveCover({ label: 'Garage door', state: 'closed', position: 0, can: { open: true, close: true, stop: true } }) }).el,
        ),
        caption('Only open and close (no position); and disabled'),
        grid(
          createControlCard({ title: 'Side gate', icon: mdiDoor, state: 'Open', body: createPositionControl({ label: 'Side gate', state: 'open', position: null }).el }).el,
          createControlCard({ title: 'Patio awning', icon: mdiBlindsHorizontal, state: 'Unavailable', unavailable: true, body: createPositionControl({ label: 'Patio awning', state: null, position: 30, disabled: true, can: { open: true, close: true, stop: true, position: true } }).el }).el,
        ),
      ),
  },
  {
    id: 'lock-control',
    render: () => {
      const front = liveLock('locked', { label: 'Front door', confirm: true, canOpen: true });
      return stack(
        caption('Unlock and open ask for a second tap (no modal); Escape or a few seconds cancel'),
        grid(
          createControlCard({ title: 'Front door', icon: 'lock', state: 'Locked', body: front.el }).el,
          createControlCard({ title: 'Back door', icon: 'lock', state: 'Unlocked', body: liveLock('unlocked', { label: 'Back door' }).el }).el,
        ),
        caption('Jammed takes the alert tone; unknown state'),
        grid(
          createControlCard({ title: 'Shed', icon: 'lock', state: 'Jammed', body: liveLock('jammed', { label: 'Shed' }).el }).el,
          createControlCard({ title: 'Bike store', icon: 'lock', state: 'Unknown', body: createLockControl({ label: 'Bike store', state: null }).el }).el,
        ),
      );
    },
  },
];
