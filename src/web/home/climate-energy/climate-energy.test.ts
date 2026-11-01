import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  airQualityLevel,
  airQualityTrend,
  airQualityZones,
  AIR_QUALITY_PRESETS,
  chargeLimitPath,
  chargeTimeText,
  CHARGE_CARD_LABELS,
  createAirQuality,
  createChargeCard,
  createEnergyFlow,
  createFanControl,
  createHumidityControl,
  createPriceStrip,
  createScheduleEditor,
  createUsageComparison,
  energyArrowPath,
  energyFlows,
  energyFlowStroke,
  energyHomeUse,
  fanSpinSeconds,
  fanStepOf,
  fanStepPercentage,
  fanUsesSteps,
  humidityGauge,
  nudgeHumidity,
  priceCheapestWindow,
  priceLevel,
  priceStripSummary,
  scheduleAdd,
  scheduleCycle,
  scheduleFreeSpot,
  scheduleKey,
  scheduleMove,
  scheduleResize,
  scheduleSorted,
  usageDifferenceText,
  usageTone,
  usageTotals,
  type ScheduleDay,
  type ScheduleLevel,
} from './index.ts';
import { formatMinutes, formatPower } from './shared.ts';

const mount = <T extends { el: HTMLElement }>(handle: T): T => {
  document.body.append(handle.el);
  return handle;
};
const q = <E extends Element = HTMLElement>(root: Element, selector: string): E => root.querySelector<E>(selector)!;
const all = (root: Element, selector: string): HTMLElement[] => Array.from(root.querySelectorAll<HTMLElement>(selector));

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

describe('shared formats', () => {
  it('writes power and durations', () => {
    expect(formatPower(850)).toBe('850 W');
    expect(formatPower(-1240)).toBe('1.2 kW');
    expect(formatPower(999.6)).toBe('1.0 kW');
    expect(formatMinutes(80)).toBe('1 h 20 min');
    expect(formatMinutes(45)).toBe('45 min');
    expect(formatMinutes(120)).toBe('2 h');
    expect(formatMinutes(0.2)).toBe('under a minute');
  });
});

describe('fan control', () => {
  it('maps percentages to speed steps and back', () => {
    expect(fanStepOf(0, 3)).toBe(0);
    expect(fanStepOf(null, 3)).toBe(0);
    expect(fanStepOf(33, 3)).toBe(1);
    expect(fanStepOf(10, 3)).toBe(1);
    expect(fanStepOf(50, 3)).toBe(2);
    expect(fanStepOf(67, 3)).toBe(2);
    expect(fanStepOf(100, 3)).toBe(3);
    expect(fanStepPercentage(2, 3)).toBe(67);
    expect(fanUsesSteps(3)).toBe(true);
    expect(fanUsesSteps(1)).toBe(false);
    expect(fanUsesSteps(10)).toBe(false);
    expect(fanSpinSeconds(false, 80)).toBeNull();
    expect(fanSpinSeconds(true, 0)).toBeNull();
    expect(fanSpinSeconds(true, 100)!).toBeLessThan(fanSpinSeconds(true, 20)!);
  });

  it('shows step buttons, spins while on and reports the chosen step', () => {
    const onPercentage = vi.fn();
    const fan = mount(createFanControl({ label: 'Ceiling fan', on: true, percentage: 67, speedCount: 3, onPercentage }));
    expect(fan.el.classList.contains('is-spinning')).toBe(true);
    expect(fan.el.getAttribute('style')).toMatch(/--_spin: [\d.]+s/);
    const radios = all(fan.el, '.mh-fan-control__field--speed input') as HTMLInputElement[];
    expect(radios.map((r) => r.checked)).toEqual([false, true, false]);
    radios[2]!.click();
    expect(onPercentage).toHaveBeenCalledWith(100);
    expect(fan.el.querySelector('.mh-fan-control__oscillate')).toBeNull();
    expect(fan.el.querySelector('.mh-fan-control__field--direction')).toBeNull();
    fan.update({ on: false, percentage: 33 });
    expect(fan.el.classList.contains('is-spinning')).toBe(false);
    expect(radios.map((r) => r.checked)).toEqual([true, false, false]);
    // Same inputs after a value update, so focus stays.
    expect(all(fan.el, '.mh-fan-control__field--speed input')[0]).toBe(radios[0]);
  });

  it('uses a slider without a step count, and switches, direction and presets when given', () => {
    const onOscillate = vi.fn();
    const onDirection = vi.fn();
    const onPreset = vi.fn();
    const fan = mount(
      createFanControl({
        on: true,
        percentage: 40,
        oscillating: false,
        direction: 'forward',
        preset: 'breeze',
        presets: [
          { value: 'auto', label: 'Auto' },
          { value: 'breeze', label: 'Breeze' },
          { value: 'sleep', label: 'Sleep' },
          { value: 'turbo', label: 'Turbo' },
          { value: 'quiet', label: 'Quiet' },
        ],
        onOscillate,
        onDirection,
        onPreset,
      }),
    );
    const slider = q<HTMLInputElement>(fan.el, '.mh-fan-control__slider input');
    expect(slider.value).toBe('40');
    expect(q(fan.el, '.mh-fan-control__slider .mh-slider__value').textContent).toBe('40%');
    q<HTMLInputElement>(fan.el, '.mh-fan-control__oscillate input').click();
    expect(onOscillate).toHaveBeenCalledWith(true);
    const dir = all(fan.el, '.mh-fan-control__field--direction input') as HTMLInputElement[];
    expect(dir[0]!.checked).toBe(true);
    dir[1]!.click();
    expect(onDirection).toHaveBeenCalledWith('reverse');
    const select = q<HTMLSelectElement>(fan.el, '.mh-fan-control__field--preset select');
    expect(select.value).toBe('breeze');
    select.value = 'sleep';
    select.dispatchEvent(new Event('change'));
    expect(onPreset).toHaveBeenCalledWith('sleep');
    fan.update({ disabled: true });
    expect(slider.disabled).toBe(true);
    expect(select.disabled).toBe(true);
  });
});

describe('humidity control', () => {
  it('nudges within the limits and draws the gauge', () => {
    expect(nudgeHumidity(45, 1, { min: 30, max: 80, step: 5 })).toBe(50);
    expect(nudgeHumidity(80, 1, { min: 30, max: 80, step: 1 })).toBe(80);
    expect(humidityGauge({ current: 48, target: 55 })).toEqual({ current: 48, target: 55, comfort: { left: 40, width: 20 } });
    expect(humidityGauge({ comfort: null, current: 140 }).current).toBe(100);
  });

  it('gathers taps into one target and shows the status', () => {
    const onTarget = vi.fn();
    const c = mount(createHumidityControl({ label: 'Bedroom humidifier', current: 38, target: 45, action: 'humidifying', on: true, onTarget }));
    expect(q(c.el, '.mh-humidity-control__number').textContent).toBe('45');
    expect(q(c.el, '.mh-humidity-control__current').textContent).toBe('Now 38%');
    expect(q(c.el, '.mh-humidity-control__action').className).toContain('--humidifying');
    expect(c.el.querySelector('.mh-humidity-control__power')).not.toBeNull();
    const [lower, raise] = all(c.el, '.mh-humidity-control__step');
    raise!.click();
    raise!.click();
    lower!.click();
    raise!.click();
    expect(q(c.el, '.mh-humidity-control__number').textContent).toBe('47');
    expect(onTarget).not.toHaveBeenCalled();
    vi.advanceTimersByTime(700);
    expect(onTarget).toHaveBeenCalledTimes(1);
    expect(onTarget).toHaveBeenCalledWith(47);
    expect(q(c.el, '.mh-humidity-control__marker--target').getAttribute('style')).toBe('left: 47%');
    c.update({ target: 80, on: false });
    expect(c.el.classList.contains('is-off')).toBe(true);
    expect((all(c.el, '.mh-humidity-control__step')[1] as HTMLButtonElement).disabled).toBe(true);
  });

  it('leaves out the power switch, status and mode when not given', () => {
    const c = createHumidityControl({ target: null });
    expect(c.el.querySelector('.mh-humidity-control__power')).toBeNull();
    expect(c.el.querySelector('.mh-humidity-control__status')).toBeNull();
    expect(q(c.el, '.mh-humidity-control__number').textContent).toBe('–');
    expect(all(c.el, '.mh-humidity-control__step').every((b) => (b as HTMLButtonElement).disabled)).toBe(true);
  });
});

describe('air quality', () => {
  const co2 = AIR_QUALITY_PRESETS.co2.bands;

  it('finds the level, zones and trend', () => {
    expect(airQualityLevel(600, co2)).toBe('good');
    expect(airQualityLevel(800, co2)).toBe('moderate');
    expect(airQualityLevel(1500, co2)).toBe('poor');
    expect(airQualityLevel(2600, co2)).toBe('very-poor');
    expect(airQualityZones(co2)).toEqual([32, 16, 32, 20]);
    expect(airQualityTrend([600, 650, 700, 900, 1100], co2)).toBe('rising');
    expect(airQualityTrend([900, 880, 700, 520], co2)).toBe('falling');
    expect(airQualityTrend([700, 710, 705, 712], co2)).toBe('steady');
    expect(airQualityTrend([700, null], co2)).toBeNull();
  });

  it('renders a meter with the reading and level, and patches in place', () => {
    const a = createAirQuality({ kind: 'co2', value: 950, trend: [600, 700, 800, 950], trendLabel: 'Last 2 hours' });
    expect(a.el.className).toBe('mh-air-quality mh-air-quality--moderate');
    const band = q(a.el, '.mh-air-quality__band');
    expect(band.getAttribute('role')).toBe('meter');
    expect(band.getAttribute('aria-valuetext')).toBe('950 ppm, Moderate');
    expect(q(a.el, '.mh-air-quality__direction').textContent).toBe('Rising');
    expect(q(a.el, '.mh-air-quality__marker').getAttribute('style')).toBe('left: 38%');
    a.update({ kind: 'pm25', value: null });
    expect(a.el.classList.contains('is-empty')).toBe(true);
    expect(q(a.el, '.mh-air-quality__band').getAttribute('aria-valuetext')).toBe('No reading');
    expect(a.el.querySelector('.mh-air-quality__trend')).toBeNull();
  });
});

describe('schedule editor', () => {
  const LEVELS: ScheduleLevel[] = [
    { value: 'comfort', label: '21°' },
    { value: 'eco', label: '18°' },
  ];
  const day = (blocks: ScheduleDay['blocks']): ScheduleDay => ({ label: 'Mon', name: 'Monday', blocks });

  it('keeps blocks sorted, inside the day and apart', () => {
    expect(
      scheduleSorted([
        { start: 600, end: 720, value: 'eco' },
        { start: -30, end: 120, value: 'comfort' },
        { start: 690, end: 800, value: 'comfort' },
        { start: 900, end: 900, value: 'eco' },
      ]),
    ).toEqual([
      { start: 0, end: 120, value: 'comfort' },
      { start: 600, end: 720, value: 'eco' },
      { start: 720, end: 800, value: 'comfort' },
    ]);
  });

  it('moves, resizes, adds, cycles and finds room', () => {
    const blocks = [
      { start: 360, end: 480, value: 'comfort' },
      { start: 1020, end: 1320, value: 'eco' },
    ];
    expect(scheduleMove(blocks, 0, -400)[0]).toEqual({ start: 0, end: 120, value: 'comfort' });
    expect(scheduleMove(blocks, 0, 1000)[0]).toEqual({ start: 900, end: 1020, value: 'comfort' });
    expect(scheduleResize(blocks, 0, 'end', 1100)[0]!.end).toBe(1020);
    expect(scheduleResize(blocks, 0, 'start', 470)[0]!.start).toBe(465);
    expect(scheduleResize(blocks, 1, 'start', 1003)[1]!.start).toBe(1005);
    expect(scheduleAdd(blocks, 400, 'eco')).toBeNull();
    expect(scheduleAdd(blocks, 720, 'eco')).toEqual({ blocks: [blocks[0], { start: 690, end: 750, value: 'eco' }, blocks[1]], index: 1 });
    expect(scheduleAdd(blocks, 1000, 'eco')?.blocks[1]).toEqual({ start: 960, end: 1020, value: 'eco' });
    expect(scheduleCycle(blocks, 1, LEVELS)[1]!.value).toBe('comfort');
    expect(scheduleFreeSpot(blocks)).toBe(750);
    expect(scheduleFreeSpot([{ start: 0, end: 1440, value: 'eco' }])).toBeNull();
  });

  it('answers keys on a block', () => {
    const blocks = [{ start: 360, end: 480, value: 'comfort' }];
    expect(scheduleKey(blocks, 0, 'ArrowRight', false, LEVELS)?.blocks[0]).toEqual({ start: 375, end: 495, value: 'comfort' });
    expect(scheduleKey(blocks, 0, 'ArrowLeft', true, LEVELS)?.blocks[0]).toEqual({ start: 300, end: 420, value: 'comfort' });
    expect(scheduleKey(blocks, 0, 'ArrowUp', false, LEVELS)?.blocks[0]!.end).toBe(495);
    expect(scheduleKey(blocks, 0, 'ArrowDown', true, LEVELS)?.blocks[0]!.end).toBe(420);
    expect(scheduleKey(blocks, 0, 'Enter', false, LEVELS)?.blocks[0]!.value).toBe('eco');
    expect(scheduleKey(blocks, 0, 'Delete', false, LEVELS)).toEqual({ blocks: [], focus: null });
    expect(scheduleKey(blocks, 0, 'x', false, LEVELS)).toBeNull();
  });

  it('renders rows of blocks and edits them with keys and the add button', () => {
    const onChange = vi.fn();
    const s = mount(createScheduleEditor({ label: 'Heating schedule', days: [day([{ start: 390, end: 480, value: 'comfort' }]), { label: 'Tue', blocks: [] }], levels: LEVELS, base: '16°', now: { day: 0, minute: 600 }, onChange }));
    const block = q(s.el, '.mh-schedule__block');
    expect(block.getAttribute('aria-label')).toBe('06:30 to 08:00, 21°');
    expect(block.getAttribute('style')).toBe('left: 27.08%; width: 6.25%');
    expect(block.className).toBe('mh-schedule__block mh-schedule__block--series-1');
    expect(q(s.el, '.mh-schedule__now').getAttribute('style')).toBe('left: 41.67%');
    expect(all(s.el, '.mh-schedule__key').map((k) => k.textContent)).toEqual(['21°', '18°', 'Otherwise 16°']);
    block.focus();
    block.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(onChange).toHaveBeenLastCalledWith([day([{ start: 405, end: 495, value: 'comfort' }]), { label: 'Tue', blocks: [] }]);
    expect(document.activeElement).toBe(q(s.el, '.mh-schedule__block'));
    q(s.el, '.mh-schedule__block').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(q(s.el, '.mh-schedule__block').className).toContain('--series-2');
    const add = all(s.el, '.mh-schedule__add')[1]!;
    expect(add.getAttribute('aria-label')).toBe('Add a block on Tue');
    add.click();
    expect(s.getDays()[1]!.blocks).toEqual([{ start: 690, end: 750, value: 'comfort' }]);
    expect(document.activeElement).toBe(q(s.el, '.mh-schedule__block[data-day="1"]'));
    q(s.el, '.mh-schedule__block[data-day="1"]').dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
    expect(s.getDays()[1]!.blocks).toEqual([]);
    expect(document.activeElement).toBe(all(s.el, '.mh-schedule__add')[1]);
    s.destroy();
  });

  it('draws, moves and taps with the pointer', () => {
    const onChange = vi.fn();
    const s = mount(createScheduleEditor({ label: 'Plug schedule', days: [day([{ start: 360, end: 480, value: 'comfort' }])], levels: LEVELS, onChange }));
    const track = q(s.el, '.mh-schedule__track');
    // 24 hours over 240 px: ten pixels per hour.
    track.getBoundingClientRect = () => ({ left: 0, top: 0, width: 240, height: 40, right: 240, bottom: 40, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
    const fire = (target: Element, type: string, x: number): void => {
      target.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: x, pointerId: 1, button: 0 }));
    };
    // Tap on the block: next value.
    const block = q(s.el, '.mh-schedule__block');
    fire(block, 'pointerdown', 70);
    fire(block, 'pointerup', 70);
    expect(s.getDays()[0]!.blocks[0]!.value).toBe('eco');
    // Drag the block two hours later.
    fire(q(s.el, '.mh-schedule__block'), 'pointerdown', 70);
    fire(s.el, 'pointermove', 90);
    fire(s.el, 'pointerup', 90);
    expect(s.getDays()[0]!.blocks[0]).toEqual({ start: 480, end: 600, value: 'eco' });
    // Drag the end grip to 14:00.
    fire(q(s.el, '.mh-schedule__handle--end'), 'pointerdown', 100);
    fire(s.el, 'pointermove', 140);
    fire(s.el, 'pointerup', 140);
    expect(s.getDays()[0]!.blocks[0]!.end).toBe(840);
    // Draw a new block from 18:00 to 21:00.
    fire(track, 'pointerdown', 180);
    fire(s.el, 'pointermove', 200);
    fire(s.el, 'pointermove', 210);
    fire(s.el, 'pointerup', 210);
    expect(s.getDays()[0]!.blocks[1]).toEqual({ start: 1080, end: 1260, value: 'comfort' });
    // Tap an empty spot: a one-hour block round it.
    fire(track, 'pointerdown', 30);
    fire(s.el, 'pointerup', 30);
    expect(s.getDays()[0]!.blocks[0]).toEqual({ start: 150, end: 210, value: 'comfort' });
    expect(onChange).toHaveBeenCalled();
  });

  it('does nothing when disabled', () => {
    const onChange = vi.fn();
    const s = mount(createScheduleEditor({ label: 'Off', days: [day([{ start: 60, end: 120, value: 'eco' }])], levels: LEVELS, disabled: true, onChange }));
    const block = q(s.el, '.mh-schedule__block');
    expect(block.getAttribute('tabindex')).toBe('-1');
    block.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    q(s.el, '.mh-schedule__add').click();
    expect(onChange).not.toHaveBeenCalled();
    expect((q(s.el, '.mh-schedule__add') as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('energy flow', () => {
  it('splits readings into flows', () => {
    // Sunny: solar covers the home, charges the battery and exports the rest.
    expect(energyFlows({ solar: 4000, grid: -1500, battery: -1000, home: 1500 })).toEqual({
      'solar-home': 1500,
      'solar-battery': 1000,
      'solar-grid': 1500,
      'grid-home': 0,
      'grid-battery': 0,
      'battery-home': 0,
      'battery-grid': 0,
    });
    // Evening: battery and grid share the home.
    const evening = energyFlows({ solar: 0, grid: 400, battery: 800 });
    expect(evening['battery-home']).toBe(800);
    expect(evening['grid-home']).toBe(400);
    // Cheap night charging from the grid.
    expect(energyFlows({ grid: 3300, battery: -3000, home: 300 })['grid-battery']).toBe(3000);
    expect(energyHomeUse({ solar: 2000, grid: -500 })).toBe(1500);
    expect(energyHomeUse({ solar: null, grid: 100 })).toBeNull();
  });

  it('sizes flows by power and points the arrows along them', () => {
    const small = energyFlowStroke(100, 4000);
    const big = energyFlowStroke(4000, 4000);
    expect(big.width).toBeGreaterThan(small.width);
    expect(big.seconds).toBeLessThan(small.seconds);
    expect(energyArrowPath([[0, 0], [10, 0], [20, 0], [30, 0]], 0.5, 2)).toBe('M13 1.5L15 0L13 -1.5');
  });

  it('draws the live flows, the places and the spoken list', () => {
    const f = createEnergyFlow({ solar: 3200, grid: -1100, battery: -800, home: 1300, batteryLevel: 64 });
    expect(all(f.el, '.mh-energy-flow__node').map((n) => n.className)).toEqual([
      'mh-energy-flow__node mh-energy-flow__node--solar',
      'mh-energy-flow__node mh-energy-flow__node--grid',
      'mh-energy-flow__node mh-energy-flow__node--battery',
      'mh-energy-flow__node mh-energy-flow__node--home',
    ]);
    expect(all(f.el, '.mh-energy-flow__flow').map((p) => p.getAttribute('class'))).toEqual([
      'mh-energy-flow__flow mh-energy-flow__flow--solar',
      'mh-energy-flow__flow mh-energy-flow__flow--solar',
      'mh-energy-flow__flow mh-energy-flow__flow--solar',
    ]);
    expect(all(f.el, '.mh-energy-flow__track')).toHaveLength(6);
    expect(all(f.el, '.mh-energy-flow__arrow')).toHaveLength(3);
    expect(q(f.el, '.mh-energy-flow__node--grid .mh-energy-flow__word').textContent).toBe('Export');
    expect(q(f.el, '.mh-energy-flow__node--battery .mh-energy-flow__word').textContent).toBe('64%');
    expect(all(f.el, '.mh-visually-hidden li').map((li) => li.textContent)).toEqual([
      'Solar producing 3.2 kW',
      'Grid exporting 1.1 kW',
      'Battery charging 800 W, 64%',
      'Home using 1.3 kW',
      'Solar to home 1.3 kW',
      'Solar to battery 800 W',
      'Solar to grid 1.1 kW',
    ]);
    f.update({ grid: 500, home: 500 });
    expect(all(f.el, '.mh-energy-flow__node')).toHaveLength(2);
    expect(all(f.el, '.mh-energy-flow__track')).toHaveLength(1);
    expect(q(f.el, '.mh-energy-flow__flow').getAttribute('class')).toContain('--grid');
  });
});

describe('price strip', () => {
  const PRICES = [0.3, 0.28, 0.12, 0.1, 0.11, 0.25, 0.4, null].map((value, i) => ({ label: String(i), name: `${String(i).padStart(2, '0')}:00`, value }));

  it('finds the cheapest window and the levels', () => {
    expect(priceCheapestWindow(PRICES.map((p) => p.value), 3)).toEqual({ start: 2, end: 5, average: 0.11 });
    expect(priceCheapestWindow(PRICES.map((p) => p.value), 3, 4)).toEqual({ start: 4, end: 7, average: (0.11 + 0.25 + 0.4) / 3 });
    expect(priceCheapestWindow([0.1, null, 0.1], 2)).toBeNull();
    expect(priceLevel(0.1, 0.1, 0.4)).toBe('low');
    expect(priceLevel(0.25, 0.1, 0.4)).toBe('mid');
    expect(priceLevel(0.4, 0.1, 0.4)).toBe('high');
  });

  it('marks now and the window, and says it all', () => {
    const p = createPriceStrip({ prices: PRICES, current: 1, unit: '/kWh' });
    const slots = all(p.el, '.mh-price-strip__slot');
    expect(slots[0]!.className).toContain('is-past');
    expect(slots[1]!.className).toContain('is-now');
    expect(slots.filter((s) => s.classList.contains('is-cheap'))).toHaveLength(3);
    expect(slots[7]!.className).toContain('is-empty');
    expect(q(p.el, '.mh-price-strip__window').getAttribute('style')).toBe('left: 25%; width: 37.5%');
    expect(q(p.el, '.mh-price-strip__cheap .mh-price-strip__stat-value').textContent).toBe('02:00–05:00');
    expect(q(p.el, '.mh-price-strip__now .mh-price-strip__stat-value').textContent).toBe('0.28/kWh');
    expect(priceStripSummary({ prices: PRICES, current: 1, unit: '/kWh' })).toBe(
      'Energy prices: 8 slots from 00:00, now 0.28/kWh, low 0.10/kWh at 03:00, high 0.40/kWh at 06:00, cheapest 02:00–05:00, average 0.11/kWh',
    );
    expect(q(p.el, '.mh-price-strip__bar--high')).not.toBeNull();
  });

  it('hangs negative prices below a zero line', () => {
    const p = createPriceStrip({ prices: [{ label: 'a', value: -0.05 }, { label: 'b', value: 0.2 }], window: 0 });
    expect(p.el.querySelector('.mh-price-strip__zero')).not.toBeNull();
    expect(p.el.querySelector('.mh-price-strip__window')).toBeNull();
    expect(all(p.el, '.mh-price-strip__bar')[0]!.getAttribute('style')).toMatch(/^bottom: [\d.]+%; height: [\d.]+%$/);
  });
});

describe('charge card', () => {
  it('marks the limit and says the time', () => {
    expect(chargeLimitPath(0)).toBe('M18 5.08L18 -0.92');
    expect(chargeLimitPath(25)).toBe('M30.92 18L36.92 18');
    expect(chargeTimeText(80, 100, CHARGE_CARD_LABELS)).toBe('1 h 20 min to full');
    expect(chargeTimeText(45, 80, CHARGE_CARD_LABELS)).toBe('45 min to 80%');
    expect(chargeTimeText(null, 80, CHARGE_CARD_LABELS)).toBeNull();
  });

  it('renders the ring as a meter with the facts', () => {
    const c = createChargeCard({ name: 'Car', level: 64, limit: 80, state: 'charging', rate: 7400, minutesLeft: 50, detail: 'Range 240 km' });
    expect(c.el.className).toBe('mh-charge-card mh-charge-card--charging');
    const ring = q(c.el, '.mh-charge-card__ring');
    expect(ring.getAttribute('aria-valuenow')).toBe('64');
    expect(ring.getAttribute('aria-valuetext')).toBe('64%, limit 80%');
    expect(q(c.el, '.mh-charge-card__fill').getAttribute('style')).toBe('--_level: 64');
    expect(all(c.el, '.mh-charge-card__fact').map((f) => f.textContent)).toEqual(['7.4 kW', '50 min to 80%', 'Limit 80%', 'Range 240 km']);
    expect(q(c.el, '.mh-charge-card__state').textContent).toBe('Charging');
    c.update({ name: 'Car', level: 12, state: 'unplugged', rate: 7400 });
    expect(c.el.className).toBe('mh-charge-card mh-charge-card--unplugged is-low');
    expect(all(c.el, '.mh-charge-card__fact')).toHaveLength(0);
    expect(c.el.querySelector('.mh-charge-card__limit')).toBeNull();
    c.update({ name: 'Home battery', kind: 'battery', level: null });
    expect(c.el.classList.contains('is-empty')).toBe(true);
    expect(q(c.el, '.mh-charge-card__level').textContent).toBe('–');
  });
});

describe('usage comparison', () => {
  const SLOTS = ['0', '1', '2', '3'];

  it('compares like with like', () => {
    const t = usageTotals({ slots: SLOTS, current: [1, 2, null, null], previous: [1.5, 2.5, 3, 1] });
    expect(t).toMatchObject({ upTo: 2, current: 3, previousSoFar: 4, previousAll: 8, difference: -1, ratio: -0.25, trend: 'less' });
    expect(usageDifferenceText(t, { unit: 'kWh' })).toBe('1 kWh less · 25%');
    expect(usageTone('less')).toBe('good');
    expect(usageTone('less', true)).toBe('bad');
    expect(usageTone('same')).toBe('neutral');
    expect(usageTotals({ slots: SLOTS, current: [1, 1, 1, 1], previous: [1, 1, 1, 1.05] }).trend).toBe('same');
  });

  it('draws both periods per slot and the totals', () => {
    const u = createUsageComparison({ slots: SLOTS, current: [1, 2, null, null], previous: [1.5, 2.5, 3, 1], unit: 'kWh' });
    expect(all(u.el, '.mh-usage-comparison__bar--previous')).toHaveLength(4);
    expect(all(u.el, '.mh-usage-comparison__bar--current')).toHaveLength(2);
    expect(all(u.el, '.mh-usage-comparison__slot.is-ahead')).toHaveLength(2);
    expect(q(u.el, '.mh-usage-comparison__previous').textContent).toBe('Yesterday 4 kWh by this time · 8 kWh in all');
    expect(q(u.el, '.mh-usage-comparison__difference').className).toContain('--good');
    expect(q(u.el, '.mh-usage-comparison__plot').getAttribute('aria-label')).toBe(
      'Energy use: Today 3 kWh, Yesterday 4 kWh by this time · 8 kWh in all, 1 kWh less · 25%; 0 1 against 1.5, 1 2 against 2.5, 2 no data against 3, 3 no data against 1',
    );
    u.update({ slots: SLOTS, current: [1, 2, 3, 4], previous: [1, 1, 1, 1], periods: { current: 'This week', previous: 'Last week' }, higherIsBetter: true });
    expect(q(u.el, '.mh-usage-comparison__previous').textContent).toBe('Last week 4');
    expect(q(u.el, '.mh-usage-comparison__difference').className).toContain('--good');
  });
});
