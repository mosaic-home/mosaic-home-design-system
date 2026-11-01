import { act, useState, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createAirQuality,
  createChargeCard,
  createEnergyFlow,
  createFanControl,
  createHumidityControl,
  createPriceStrip,
  createScheduleEditor,
  createUsageComparison,
  type FanControlOptions,
  type HumidityControlOptions,
  type ScheduleDay,
  type ScheduleLevel,
} from '../web/home/climate-energy/index.ts';
import { AirQuality, ChargeCard, EnergyFlow, FanControl, HumidityControl, PriceStrip, ScheduleEditor, UsageComparison } from './home-climate-energy.tsx';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const KEPT = new Set(['class', 'role', 'hidden', 'tabindex', 'type', 'd', 'viewBox', 'preserveAspectRatio', 'vector-effect', 'cx', 'cy', 'r', 'data-day', 'data-index', 'data-add', 'data-edge', 'disabled', 'style', 'title']);

/** Tag, the attributes that matter (style without spaces), ARIA and own text of every element, in document order. */
function shape(root: Element): string[] {
  const out: string[] = [];
  const walk = (el: Element): void => {
    const attrs = Array.from(el.attributes)
      .filter((a) => KEPT.has(a.name) || a.name.startsWith('aria-'))
      .map((a) => `${a.name}=${a.name === 'style' ? a.value.replace(/\s+/g, '').replace(/;$/, '') : a.value}`)
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

/** The same as `shape`, without inline styles (the form controls set theirs from properties). */
const shapeNoStyle = (root: Element): string[] => shape(root).map((line) => line.replace(/ style=\S+/, ''));

function react(node: ReactElement): Element {
  const div = document.createElement('div');
  div.innerHTML = renderToStaticMarkup(node);
  return div.firstElementChild!;
}

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  document.body.replaceChildren();
  vi.useRealTimers();
});

const LEVELS: ScheduleLevel[] = [
  { value: 'comfort', label: '21°' },
  { value: 'eco', label: '18°', color: 'accent' },
];
const WEEK: ScheduleDay[] = [
  { label: 'Mon', name: 'Monday', blocks: [{ start: 390, end: 480, value: 'comfort' }, { start: 1020, end: 1320, value: 'eco' }] },
  { label: 'Tue', name: 'Tuesday', blocks: [] },
];

describe('climate and energy parity', () => {
  it('FanControl', () => {
    const cases: FanControlOptions[] = [
      { on: true, percentage: 67, speedCount: 3, label: 'Ceiling fan' },
      { on: false, percentage: 40, oscillating: true, direction: 'reverse', disabled: true },
      { on: true, percentage: null, preset: 'sleep', presets: [{ value: 'auto', label: 'Auto' }, { value: 'sleep', label: 'Sleep', icon: 'star' }] },
      {
        on: true,
        percentage: 20,
        speedCount: 8,
        preset: 'b',
        presets: ['a', 'b', 'c', 'd', 'e'].map((v) => ({ value: v, label: v.toUpperCase() })),
        labels: { power: 'Running', speed: 'Level' },
      },
    ];
    for (const c of cases) expect(shapeNoStyle(react(<FanControl {...c} />))).toEqual(shapeNoStyle(createFanControl(c).el));
  });

  it('HumidityControl', () => {
    const modes = [
      { value: 'normal', label: 'Normal' },
      { value: 'eco', label: 'Eco' },
    ];
    const cases: HumidityControlOptions[] = [
      { current: 38, target: 45, action: 'humidifying', on: true, modes, mode: 'eco' },
      { current: 71, target: 50, action: 'drying', compact: true, comfort: null, step: 5 },
      { target: null, disabled: true, on: false, label: 'Cellar', modes: [...modes, { value: 'a', label: 'A' }, { value: 'b', label: 'B' }, { value: 'c', label: 'C' }] },
    ];
    for (const c of cases) expect(shape(react(<HumidityControl {...c} />))).toEqual(shape(createHumidityControl(c).el));
  });

  it('AirQuality', () => {
    const cases = [
      { kind: 'co2' as const, value: 950, trend: [600, 700, 800, 950], trendLabel: 'Last 2 hours' },
      { kind: 'pm25' as const, value: null, compact: true },
      { name: 'Radon', unit: 'Bq/m³', value: 40, bands: { moderate: 100, poor: 200, veryPoor: 300, max: 400 }, trend: [40, 41, 39, 40] },
    ];
    for (const c of cases) expect(shape(react(<AirQuality {...c} />))).toEqual(shape(createAirQuality(c).el));
  });

  it('EnergyFlow', () => {
    const cases = [
      { solar: 3200, grid: -1100, battery: -800, home: 1300, batteryLevel: 64 },
      { grid: 500, compact: true, label: 'Power now' },
      { solar: null, grid: 2000, battery: 1500, batteryLevel: null },
    ];
    for (const c of cases) expect(shape(react(<EnergyFlow {...c} />))).toEqual(shape(createEnergyFlow(c).el));
  });

  it('PriceStrip', () => {
    const prices = [0.3, 0.28, 0.12, -0.02, 0.11, 0.25, 0.4, null].map((value, i) => ({ label: String(i), name: `${String(i).padStart(2, '0')}:00`, value }));
    const cases = [{ prices, current: 1, unit: '/kWh' }, { prices, window: 0, size: 'small' as const, labelEvery: 2 }];
    for (const c of cases) expect(shape(react(<PriceStrip {...c} />))).toEqual(shape(createPriceStrip(c).el));
  });

  it('ChargeCard', () => {
    const cases = [
      { name: 'Car', level: 64, limit: 80, state: 'charging' as const, rate: 7400, minutesLeft: 50, detail: 'Range 240 km' },
      { name: 'Home battery', kind: 'battery' as const, level: 12, state: 'discharging' as const, compact: true },
      { name: 'Scooter', level: null, state: 'unplugged' as const },
    ];
    for (const c of cases) expect(shape(react(<ChargeCard {...c} />))).toEqual(shape(createChargeCard(c).el));
  });

  it('UsageComparison', () => {
    const cases = [
      { slots: ['0', '1', '2', '3'], current: [1, 2, null, null], previous: [1.5, 2.5, 3, 1], unit: 'kWh' },
      { slots: ['Mon', 'Tue', 'Wed'], current: [4, 5, 6], previous: [5, 5, 5], periods: { current: 'This week', previous: 'Last week' }, higherIsBetter: true, size: 'large' as const },
    ];
    for (const c of cases) expect(shape(react(<UsageComparison {...c} />))).toEqual(shape(createUsageComparison(c).el));
  });

  it('ScheduleEditor', () => {
    const cases = [
      { label: 'Heating schedule', days: WEEK, levels: LEVELS, base: '16°', now: { day: 0, minute: 600 } },
      { label: 'Plug schedule', days: WEEK, levels: LEVELS, disabled: true },
    ];
    for (const c of cases) expect(shape(react(<ScheduleEditor {...c} />))).toEqual(shape(createScheduleEditor(c).el));
  });
});

describe('climate and energy behaviour', () => {
  it('FanControl reports a step and the switch', () => {
    const onPercentage = vi.fn();
    const onToggle = vi.fn();
    act(() => root.render(<FanControl on percentage={33} speedCount={3} onPercentage={onPercentage} onToggle={onToggle} />));
    const radios = Array.from(container.querySelectorAll<HTMLInputElement>('.mh-fan-control__field--speed input'));
    expect(radios.map((r) => r.checked)).toEqual([true, false, false]);
    act(() => radios[1]!.click());
    expect(onPercentage).toHaveBeenCalledWith(67);
    act(() => container.querySelector<HTMLInputElement>('.mh-fan-control__power input')!.click());
    expect(onToggle).toHaveBeenCalledWith(false);
    expect(container.querySelector<HTMLElement>('.mh-fan-control')!.style.getPropertyValue('--_spin')).toMatch(/s$/);
  });

  it('HumidityControl gathers taps into one target', () => {
    vi.useFakeTimers();
    const onTarget = vi.fn();
    act(() => root.render(<HumidityControl target={45} onTarget={onTarget} />));
    const [, raise] = Array.from(container.querySelectorAll<HTMLButtonElement>('.mh-humidity-control__step'));
    act(() => raise!.click());
    act(() => raise!.click());
    expect(container.querySelector('.mh-humidity-control__number')!.textContent).toBe('47');
    act(() => vi.advanceTimersByTime(700));
    expect(onTarget).toHaveBeenCalledTimes(1);
    expect(onTarget).toHaveBeenCalledWith(47);
  });

  it('ScheduleEditor is controlled and keeps focus on the edited block', () => {
    const seen: ScheduleDay[][] = [];
    function Host() {
      const [days, setDays] = useState(WEEK);
      return (
        <ScheduleEditor
          label="Heating schedule"
          days={days}
          levels={LEVELS}
          onChange={(next) => {
            seen.push(next);
            setDays(next);
          }}
        />
      );
    }
    act(() => root.render(<Host />));
    const block = container.querySelector<HTMLElement>('.mh-schedule__block')!;
    block.focus();
    act(() => {
      block.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    });
    expect(seen[0]![0]!.blocks[0]).toEqual({ start: 405, end: 495, value: 'comfort' });
    expect(container.querySelector('.mh-schedule__block')!.getAttribute('aria-label')).toBe('06:45 to 08:15, 21°');
    expect(document.activeElement).toBe(container.querySelector('.mh-schedule__block'));
    act(() => container.querySelectorAll<HTMLButtonElement>('.mh-schedule__add')[1]!.click());
    expect(seen[1]![1]!.blocks).toHaveLength(1);
    expect(document.activeElement).toBe(container.querySelector('.mh-schedule__block[data-day="1"]'));
  });
});
