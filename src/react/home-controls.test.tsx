import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSwitch, createControlCard, createLightControl, createLockControl, createPositionControl, createThermostat, type ThermostatMode } from '../web/index.ts';
import { ControlCard, LightControl, LockControl, PositionControl, Switch, Thermostat } from './index.ts';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** Tag, classes, role, ARIA, `hidden` and own text of every element, in document order. */
function shape(root: Element): string[] {
  const out: string[] = [];
  const walk = (el: Element): void => {
    const attrs = Array.from(el.attributes)
      .filter((a) => a.name === 'class' || a.name === 'role' || a.name === 'hidden' || a.name === 'tabindex' || a.name.startsWith('aria-') || a.name === 'd' || a.name === 'type')
      .map((a) => `${a.name}=${a.value}`)
      .sort();
    const text = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent)
      .join('');
    out.push(`${el.tagName.toLowerCase()} ${attrs.join(' ')} ${text}`.trim());
    Array.from(el.children).forEach(walk);
  };
  walk(root);
  return out;
}

function react(node: ReactElement): Element {
  const div = document.createElement('div');
  div.innerHTML = renderToStaticMarkup(node);
  return div.firstElementChild!;
}

const MODES: ThermostatMode[] = [
  { value: 'off', label: 'Off' },
  { value: 'heat', label: 'Heat', icon: 'thermometer' },
  { value: 'cool', label: 'Cool' },
];
const MANY: ThermostatMode[] = [...MODES, { value: 'dry', label: 'Dry' }, { value: 'fan', label: 'Fan' }];

describe('home controls parity', () => {
  it('ControlCard', () => {
    expect(shape(react(<ControlCard title="Desk lamp" icon="lightbulb" state="On · 70%" active tone="warm" control={<Switch aria-label="Desk lamp power" />} />))).toEqual(
      shape(createControlCard({ title: 'Desk lamp', icon: 'lightbulb', state: 'On · 70%', active: true, tone: 'warm', control: createSwitch({ ariaLabel: 'Desk lamp power' }).el }).el),
    );
    const img = (): HTMLImageElement => Object.assign(document.createElement('img'), { alt: '' });
    const body = (): HTMLParagraphElement => Object.assign(document.createElement('p'), { textContent: 'More' });
    expect(
      shape(
        react(
          <ControlCard title="Porch" icon="camera" media={<img alt="" />} onOpen={() => undefined} loading loadingLabel="Waiting" unavailable>
            <p>More</p>
          </ControlCard>,
        ),
      ),
    ).toEqual(shape(createControlCard({ title: 'Porch', icon: 'camera', media: img(), body: body(), onOpen: () => undefined, loading: true, loadingLabel: 'Waiting', unavailable: true }).el));
    expect(shape(react(<ControlCard title="Shed" icon="lock" tone="cool" />))).toEqual(shape(createControlCard({ title: 'Shed', icon: 'lock', tone: 'cool' }).el));
  });

  it('Thermostat', () => {
    const cases = [
      { current: 19.5, target: 21, action: 'heating' as const, mode: 'heat', modes: MODES },
      { targetLow: 19, targetHigh: 24, unit: '°F', step: 1, compact: true, action: 'cooling' as const },
      { target: null, mode: 'dry', modes: MANY, disabled: true, label: 'Loft' },
      { target: 35, labels: { lower: 'Down', raise: 'Up', target: 'Set to' } },
    ];
    for (const c of cases) expect(shape(react(<Thermostat {...c} />))).toEqual(shape(createThermostat(c).el));
  });

  it('LightControl', () => {
    const cases = [
      { on: true, brightness: 40 },
      { on: false, brightness: 10, colorTemp: { value: 2700, min: 2000, max: 6500 }, hue: 200, disabled: true },
      { on: true, toggle: false, hue: 0, labels: { hue: 'Hue' } },
    ];
    for (const c of cases) expect(shape(react(<LightControl {...c} />))).toEqual(shape(createLightControl(c).el));
  });

  it('PositionControl', () => {
    const cases = [
      { state: 'opening' as const, position: 30, can: { open: true, close: true, stop: true, position: true }, labels: { open: 'Raise', close: 'Lower' } },
      { state: 'closed' as const, position: null },
      { state: null, position: 100, can: { stop: true, position: true }, disabled: true },
    ];
    for (const c of cases) expect(shape(react(<PositionControl {...c} />))).toEqual(shape(createPositionControl(c).el));
  });

  it('LockControl', () => {
    const cases = [{ state: 'locked' as const }, { state: 'jammed' as const, canOpen: true }, { state: null, disabled: true, label: 'Bike store' }];
    for (const c of cases) expect(shape(react(<LockControl {...c} />))).toEqual(shape(createLockControl(c).el));
  });
});

describe('home controls behaviour (React)', () => {
  let host: HTMLDivElement;
  let root: Root;
  beforeEach(() => {
    vi.useFakeTimers();
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
  });
  afterEach(() => {
    act(() => root.unmount());
    host.remove();
    vi.useRealTimers();
  });
  const render = (node: ReactElement): void => act(() => root.render(node));
  const tap = (selector: string, index = 0): void => act(() => host.querySelectorAll<HTMLElement>(selector)[index]!.click());

  it('Thermostat sends one target after the taps settle, and a pending one on unmount', () => {
    const onTarget = vi.fn();
    render(<Thermostat target={21} onTarget={onTarget} />);
    tap('.mh-thermostat__step', 1);
    tap('.mh-thermostat__step', 1);
    expect(host.querySelector('.mh-thermostat__number')!.textContent).toBe('22.0');
    act(() => vi.advanceTimersByTime(700));
    expect(onTarget).toHaveBeenCalledTimes(1);
    expect(onTarget).toHaveBeenCalledWith(22);
    // The old state re-rendered keeps the sent value; the new one takes over.
    render(<Thermostat target={21} current={20} onTarget={onTarget} />);
    expect(host.querySelector('.mh-thermostat__number')!.textContent).toBe('22.0');
    render(<Thermostat target={22.5} onTarget={onTarget} />);
    expect(host.querySelector('.mh-thermostat__number')!.textContent).toBe('22.5');
    tap('.mh-thermostat__step', 0);
    act(() => root.unmount());
    expect(onTarget).toHaveBeenLastCalledWith(22);
    root = createRoot(host);
  });

  it('LightControl commits a slider on release only', () => {
    const onBrightness = vi.fn();
    render(<LightControl on brightness={20} onBrightness={onBrightness} />);
    const input = host.querySelector<HTMLInputElement>('.mh-light-control__slider--brightness input')!;
    act(() => {
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      set.call(input, '64');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(onBrightness).not.toHaveBeenCalled();
    expect(host.querySelector('.mh-slider__value')!.textContent).toBe('64%');
    act(() => input.dispatchEvent(new Event('change', { bubbles: true })));
    expect(onBrightness).toHaveBeenCalledTimes(1);
    expect(onBrightness).toHaveBeenCalledWith(64);
  });

  it('LockControl asks for a second tap and drops it on a new state', () => {
    const onUnlock = vi.fn();
    render(<LockControl state="locked" confirm onUnlock={onUnlock} />);
    tap('.mh-lock-control__button--unlock');
    expect(onUnlock).not.toHaveBeenCalled();
    expect(host.querySelector('.mh-lock-control__button--unlock')!.textContent).toBe('Tap again to unlock');
    tap('.mh-lock-control__button--unlock');
    expect(onUnlock).toHaveBeenCalledTimes(1);
    tap('.mh-lock-control__button--unlock');
    render(<LockControl state="jammed" confirm onUnlock={onUnlock} />);
    expect(host.querySelector('.mh-lock-control__button--unlock')!.textContent).toBe('Unlock');
    tap('.mh-lock-control__button--unlock');
    act(() => vi.advanceTimersByTime(4000));
    expect(host.querySelector('.mh-lock-control__button--unlock')!.textContent).toBe('Unlock');
    expect(onUnlock).toHaveBeenCalledTimes(1);
  });

  it('PositionControl fires the button events', () => {
    const onStop = vi.fn();
    render(<PositionControl state="opening" position={40} can={{ open: true, stop: true, close: true }} onStop={onStop} />);
    tap('.mh-position-control__button--stop');
    expect(onStop).toHaveBeenCalledTimes(1);
  });
});
