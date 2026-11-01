import { mdiAirHumidifier, mdiCeilingFan, mdiFan, mdiMoleculeCo2 } from '@mdi/js';
import { h } from '../../../src/web/dom.ts';
import { createText } from '../../../src/web/foundations/text.ts';
import { createCard } from '../../../src/web/data-display/card.ts';
import { createControlCard } from '../../../src/web/home/controlCard.ts';
import {
  createAirQuality,
  createChargeCard,
  createEnergyFlow,
  createFanControl,
  createHumidityControl,
  createPriceStrip,
  createScheduleEditor,
  createUsageComparison,
  formatFanSpeed,
  type ChargeCardOptions,
  type EnergyFlowOptions,
  type FanControlHandle,
  type FanControlOptions,
  type HumidityControlOptions,
  type ScheduleDay,
  type ScheduleLevel,
} from '../../../src/web/home/climate-energy/index.ts';
import { homeColorVariables } from '../../../src/tokens/home.ts';
import type { Tokens } from '../../../src/tokens/types.ts';
import type { Story } from './types.ts';

// Fan, humidity, air quality, schedule, energy flow, prices, charging and usage. Every name and value is invented.

const stack = (...children: Node[]): HTMLElement => h('div', { class: 'ex-stack' }, ...children);
const grid = (...children: Node[]): HTMLElement => h('div', { class: 'mh-grid' }, ...children);
const caption = (text: string): HTMLElement => createText(text, { variant: 'label', tone: 'muted' });
const inCard = (body: HTMLElement, title?: string): HTMLElement => createCard({ title, body }).el;
/** A box about as wide as a watch face. */
const watch = (child: HTMLElement): HTMLElement => h('div', { style: 'width: calc(var(--mh-control-lg) * 3.6); max-width: 100%' }, child);

const withHomeColors = (tokens: Tokens, el: HTMLElement): HTMLElement => {
  for (const [name, value] of Object.entries(homeColorVariables(tokens.theme))) el.style.setProperty(name, value);
  return el;
};

/** Pretends to be the device: answers a command after a short delay. */
const later = (fn: () => void, ms = 500): void => void setTimeout(fn, ms);

/** Runs `tick` every `ms` while `el` is on the page. */
function every(el: HTMLElement, ms: number, tick: () => void): void {
  const timer = setInterval(() => {
    if (!el.isConnected) {
      clearInterval(timer);
      return;
    }
    tick();
  }, ms);
}

// Fan ---------------------------------------------------------------------------------------------------------------

function liveFan(title: string, icon: string, start: Omit<FanControlOptions, 'onToggle' | 'onPercentage' | 'onOscillate' | 'onDirection' | 'onPreset'>): HTMLElement {
  let state = { ...start };
  const stateText = (): string => (state.on ? (typeof state.percentage === 'number' ? `On · ${formatFanSpeed(state.percentage)}` : 'On') : 'Off');
  let fan: FanControlHandle | null = null;
  const card = createControlCard({ title, icon, active: state.on, state: stateText() });
  const set = (changes: Partial<FanControlOptions>): void =>
    later(() => {
      state = { ...state, ...changes };
      fan?.update(changes);
      card.update({ active: state.on, state: stateText() });
    });
  fan = createFanControl({
    ...state,
    label: `${title} fan`,
    onToggle: (on) => set({ on }),
    onPercentage: (percentage) => set({ percentage, on: percentage > 0 }),
    onOscillate: (oscillating) => set({ oscillating }),
    onDirection: (direction) => set({ direction }),
    onPreset: (preset) => set({ preset }),
  });
  card.update({ body: fan.el });
  return card.el;
}

// Humidity ----------------------------------------------------------------------------------------------------------

function liveHumidity(title: string, start: Omit<HumidityControlOptions, 'onTarget' | 'onMode' | 'onToggle'>, unavailable = false): HTMLElement {
  const card = createControlCard({ title, icon: mdiAirHumidifier, active: !!start.on, tone: 'cool', unavailable, state: start.on === false ? 'Off' : `Now ${start.current ?? '–'}%` });
  const control = createHumidityControl({
    ...start,
    label: `${title} humidity`,
    onTarget: (target) => later(() => control.update({ target })),
    onMode: (mode) => later(() => control.update({ mode })),
    onToggle: (on) =>
      later(() => {
        control.update({ on, action: on ? start.action : 'off' });
        card.update({ active: on, state: on ? `Now ${start.current ?? '–'}%` : 'Off' });
      }),
  });
  card.update({ body: control.el });
  return card.el;
}

// Schedule ----------------------------------------------------------------------------------------------------------

const HEAT_LEVELS: ScheduleLevel[] = [
  { value: 'comfort', label: '21°', color: 5 },
  { value: 'eco', label: '18°', color: 3 },
  { value: 'boost', label: '23°', color: 1 },
];

const workday = (): ScheduleDay['blocks'] => [
  { start: 6 * 60 + 30, end: 8 * 60, value: 'comfort' },
  { start: 17 * 60, end: 22 * 60 + 30, value: 'comfort' },
];
const weekend = (): ScheduleDay['blocks'] => [
  { start: 8 * 60, end: 11 * 60, value: 'comfort' },
  { start: 11 * 60, end: 15 * 60, value: 'eco' },
  { start: 15 * 60, end: 23 * 60, value: 'comfort' },
];
const WEEK: ScheduleDay[] = [
  { label: 'Mon', name: 'Monday', blocks: workday() },
  { label: 'Tue', name: 'Tuesday', blocks: workday() },
  { label: 'Wed', name: 'Wednesday', blocks: [...workday().slice(0, 1), { start: 12 * 60, end: 13 * 60, value: 'eco' }, ...workday().slice(1)] },
  { label: 'Thu', name: 'Thursday', blocks: workday() },
  { label: 'Fri', name: 'Friday', blocks: [workday()[0]!, { start: 16 * 60, end: 23 * 60 + 30, value: 'boost' }] },
  { label: 'Sat', name: 'Saturday', blocks: weekend() },
  { label: 'Sun', name: 'Sunday', blocks: weekend() },
];

const clock = (m: number): string => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

// Energy ------------------------------------------------------------------------------------------------------------

/** A made-up day: the sun rises and sets, the home's use wanders, the battery soaks up the surplus. */
function liveEnergy(start: EnergyFlowOptions, ms = 1600): HTMLElement {
  let t = 0;
  const flow = createEnergyFlow(start);
  const step = (): EnergyFlowOptions => {
    t += 1;
    const sun = Math.max(0, Math.sin((t % 24) / 24 * Math.PI)) * 5200;
    const home = 600 + Math.round(Math.abs(Math.sin(t * 1.7)) * 1400);
    const level = 30 + ((t * 3) % 60);
    let battery = 0;
    if (sun > home) battery = -Math.min(3000, sun - home);
    else if (level > 35) battery = Math.min(2500, home - sun);
    const grid = home - sun - battery;
    return { ...start, solar: Math.round(sun), home, battery: Math.round(battery), grid: Math.round(grid), batteryLevel: level };
  };
  every(flow.el, ms, () => flow.update(step()));
  return flow.el;
}

const PRICES = [0.31, 0.29, 0.24, 0.18, 0.15, 0.14, 0.17, 0.26, 0.34, 0.33, 0.27, 0.22, 0.19, 0.16, 0.13, 0.12, 0.18, 0.29, 0.41, 0.44, 0.38, 0.32, 0.28, 0.25];
const hourSlots = (values: readonly (number | null)[]) => values.map((value, i) => ({ label: String(i), name: `${String(i).padStart(2, '0')}:00`, value }));

const TODAY = [0.31, 0.28, 0.27, 0.26, 0.27, 0.3, 0.52, 0.81, 0.64, 0.42, 0.38, 0.45, 0.61, 0.47, 0.39, null, null, null, null, null, null, null, null, null];
const YESTERDAY = [0.33, 0.3, 0.29, 0.28, 0.28, 0.34, 0.66, 0.92, 0.71, 0.5, 0.44, 0.52, 0.7, 0.55, 0.48, 0.5, 0.62, 0.95, 1.21, 1.08, 0.86, 0.71, 0.52, 0.4];

export const homeClimateEnergyStories: Story[] = [
  {
    id: 'fan-control',
    render: (tokens) =>
      withHomeColors(
        tokens,
        stack(
          caption('Three speeds as steps, with oscillation; the icon spins faster with the speed and stands still under reduced motion'),
          grid(
            liveFan('Bedroom', mdiFan, { on: true, percentage: 67, speedCount: 3, oscillating: true }),
            liveFan('Living room', mdiCeilingFan, { on: true, percentage: 40, direction: 'forward', preset: 'breeze', presets: [{ value: 'normal', label: 'Normal' }, { value: 'breeze', label: 'Breeze' }, { value: 'sleep', label: 'Sleep' }] }),
          ),
          caption('A percentage slider (stepping one speed of eight), many presets as a select; off and unavailable'),
          grid(
            liveFan('Study', mdiFan, {
              on: true,
              percentage: 25,
              speedCount: 8,
              preset: 'auto',
              presets: ['auto', 'quiet', 'normal', 'strong', 'turbo'].map((v) => ({ value: v, label: v[0]!.toUpperCase() + v.slice(1) })),
            }),
            liveFan('Loft', mdiFan, { on: false, percentage: 33, speedCount: 3 }),
            createControlCard({ title: 'Garage', icon: mdiFan, state: 'Unavailable', unavailable: true, body: createFanControl({ on: false, percentage: 0, speedCount: 4, disabled: true }).el }).el,
          ),
        ),
      ),
  },
  {
    id: 'humidity-control',
    render: (tokens) =>
      withHomeColors(
        tokens,
        stack(
          caption('Tap − / + a few times: one target is sent 0.7 s after the last tap. The gauge shows the comfortable band, the target and the reading'),
          grid(
            liveHumidity('Nursery', {
              current: 36,
              target: 45,
              on: true,
              action: 'humidifying',
              mode: 'normal',
              modes: [
                { value: 'normal', label: 'Normal' },
                { value: 'sleep', label: 'Sleep' },
                { value: 'auto', label: 'Auto' },
              ],
            }),
            liveHumidity('Cellar', { current: 68, target: 55, step: 5, on: true, action: 'drying', min: 35, max: 70 }),
          ),
          caption('Compact, idle, and without a reading; unavailable'),
          grid(
            liveHumidity('Studio', { current: 47, target: 50, compact: true, action: 'idle' }),
            liveHumidity('Shed', { current: null, target: 50, on: false, disabled: true, compact: true }, true),
          ),
        ),
      ),
  },
  {
    id: 'air-quality',
    render: () =>
      stack(
        caption('Carbon dioxide, particles and volatile compounds on good-to-poor bands, with the direction of the last readings'),
        grid(
          inCard(createAirQuality({ kind: 'co2', value: 640, trend: [520, 560, 600, 610, 640], trendLabel: 'Last 2 hours' }).el),
          inCard(createAirQuality({ kind: 'co2', value: 1340, trend: [700, 850, 1020, 1190, 1340], trendLabel: 'Last 2 hours' }).el),
          inCard(createAirQuality({ kind: 'pm25', value: 22, trend: [40, 34, 30, 26, 22], trendLabel: 'Since 06:00' }).el),
          inCard(createAirQuality({ kind: 'voc', value: 3400, trend: [3300, 3420, 3380, 3400], trendLabel: 'Last hour' }).el),
        ),
        caption('In a control card; a custom reading with its own bands; no reading yet'),
        grid(
          createControlCard({ title: 'Kitchen', icon: mdiMoleculeCo2, state: 'Window open since 14:20', body: createAirQuality({ kind: 'co2', value: 980, trend: [1400, 1300, 1150, 980] }).el }).el,
          inCard(createAirQuality({ name: 'Pollen', unit: 'grains/m³', value: 38, bands: { moderate: 20, poor: 50, veryPoor: 100, max: 150 }, trend: [10, 18, 30, 38] }).el),
          inCard(createAirQuality({ kind: 'pm10', value: null }).el),
        ),
        caption('Compact, for a watch'),
        watch(inCard(createAirQuality({ kind: 'co2', value: 870, compact: true, trend: [700, 760, 820, 870] }).el)),
      ),
  },
  {
    id: 'schedule-editor',
    render: () => {
      const log = caption('Drag a block or its ends, drag on an empty stretch to draw one, tap a block to change its value; on a focused block the arrows move and stretch it, Enter changes it, Delete removes it.');
      const heating = createScheduleEditor({
        label: 'Living room heating',
        days: WEEK,
        levels: HEAT_LEVELS,
        base: '16°',
        now: { day: 2, minute: 14 * 60 + 40 },
        onChange: (days) => {
          const blocks = days.reduce((n, d) => n + d.blocks.length, 0);
          const first = days[0]?.blocks[0];
          log.textContent = `${blocks} blocks this week${first ? `; Monday starts ${clock(first.start)}` : ''}`;
        },
      });
      const plug = createScheduleEditor({
        label: 'Aquarium light',
        days: [
          { label: 'Daily', blocks: [{ start: 9 * 60, end: 12 * 60, value: 'on' }, { start: 15 * 60, end: 21 * 60, value: 'on' }] },
        ],
        levels: [{ value: 'on', label: 'On', color: 'accent' }],
        base: 'Off',
        step: 30,
      });
      const locked = createScheduleEditor({
        label: 'Hot water (managed elsewhere)',
        days: WEEK.slice(0, 2).map((d) => ({ ...d, blocks: [{ start: 5 * 60, end: 7 * 60, value: 'boost' }] })),
        levels: HEAT_LEVELS,
        disabled: true,
      });
      return stack(log, inCard(heating.el, 'Living room heating'), caption('On or off, half-hour steps'), inCard(plug.el, 'Aquarium light'), caption('Disabled'), inCard(locked.el, 'Hot water'));
    },
  },
  {
    id: 'energy-flow',
    render: (tokens) =>
      withHomeColors(
        tokens,
        stack(
          caption('A made-up day running fast: the dots move faster and the lines get wider with more power; chevrons show the direction, and the dots stand still under reduced motion'),
          h('div', { style: 'max-width: calc(var(--mh-control-lg) * 9)' }, inCard(liveEnergy({ label: 'Energy now', solar: 3200, grid: -1100, battery: -800, home: 1300, batteryLevel: 64 }), 'Energy now')),
          caption('Evening: battery and grid share the load; night charging from the grid; no solar or battery'),
          grid(
            inCard(createEnergyFlow({ solar: 0, grid: 450, battery: 900, batteryLevel: 52 }).el),
            inCard(createEnergyFlow({ solar: 0, grid: 3400, battery: -3000, home: 400, batteryLevel: 18 }).el),
            inCard(createEnergyFlow({ grid: 760 }).el),
          ),
          caption('Watch size, compact'),
          h('div', { class: 'ex-row' }, watch(inCard(liveEnergy({ compact: true, solar: 2100, grid: -400, battery: -600, home: 1100, batteryLevel: 80 }, 2200))), watch(inCard(createEnergyFlow({ solar: null, grid: 1200, battery: 0, batteryLevel: 100, compact: true }).el))),
        ),
      ),
  },
  {
    id: 'price-strip',
    render: () =>
      stack(
        caption('Twenty-four hours, now at 09:00; the cheapest three hours ahead are shaded'),
        inCard(createPriceStrip({ label: 'Electricity prices today', prices: hourSlots(PRICES), current: 9, unit: '/kWh', end: '24:00' }).el, 'Electricity today'),
        caption('A two-hour window, small; tomorrow not yet known after 18:00'),
        grid(
          inCard(createPriceStrip({ prices: hourSlots(PRICES.map((v, i) => (i >= 18 ? null : v))), current: 2, window: 2, size: 'small', unit: '/kWh' }).el),
          inCard(createPriceStrip({ label: 'Windy night', prices: hourSlots([0.12, 0.06, -0.02, -0.04, 0.01, 0.08, 0.15, 0.22]), current: 0, unit: '/kWh', end: '08:00' }).el),
        ),
      ),
  },
  {
    id: 'charge-card',
    render: () => {
      const live: ChargeCardOptions = { name: 'Car', level: 46, limit: 80, state: 'charging', rate: 7400, minutesLeft: 95, detail: 'Range 180 km' };
      const card = createChargeCard(live);
      let level = live.level ?? 0;
      every(card.el, 1500, () => {
        level = level >= 80 ? 46 : level + 2;
        const done = level >= 80;
        card.update({ ...live, level, state: done ? 'full' : 'charging', minutesLeft: Math.round(((80 - level) / 34) * 95), detail: `Range ${Math.round(level * 3.9)} km` });
      });
      return stack(
        caption('Charging towards an 80% limit (ticking along); a home battery feeding the house; low and unplugged'),
        grid(
          card.el,
          createChargeCard({ name: 'Home battery', kind: 'battery', level: 72, state: 'discharging', rate: 1300, minutesLeft: 260, detail: 'Covers the evening' }).el,
          createChargeCard({ name: 'Bike', level: 14, state: 'unplugged', detail: 'Plug in tonight' }).el,
          createChargeCard({ name: 'Van', level: 100, state: 'full', detail: 'Ready since 05:40' }).el,
          createChargeCard({ name: 'Mower', kind: 'battery', level: null, state: 'plugged' }).el,
        ),
        caption('Compact, for small tiles and watches'),
        h('div', { class: 'ex-row' }, watch(createChargeCard({ name: 'Car', level: 64, limit: 80, state: 'charging', rate: 11000, minutesLeft: 25, compact: true }).el)),
      );
    },
  },
  {
    id: 'usage-comparison',
    render: () =>
      stack(
        caption('Today so far against yesterday by the hour; the totals compare the same hours'),
        inCard(createUsageComparison({ label: 'Electricity', slots: TODAY.map((_, i) => String(i)), slotNames: TODAY.map((_, i) => `${String(i).padStart(2, '0')}:00`), current: TODAY, previous: YESTERDAY, unit: 'kWh' }).el, 'Electricity'),
        caption('This week against last; more solar is the good direction'),
        grid(
          inCard(
            createUsageComparison({
              label: 'Heating gas',
              slots: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              current: [8.2, 9.1, 7.4, 10.3, null, null, null],
              previous: [7.1, 7.9, 7.6, 8.8, 9.4, 11.2, 10.6],
              periods: { current: 'This week', previous: 'Last week' },
              unit: 'm³',
              size: 'small',
            }).el,
          ),
          inCard(
            createUsageComparison({
              label: 'Solar',
              slots: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              current: [14.1, 18.6, 21.2, 9.8, 16.4, 22.5, 19.9],
              previous: [12.2, 13.5, 15.1, 11.4, 12.8, 17.6, 18.3],
              periods: { current: 'This week', previous: 'Last week' },
              unit: 'kWh',
              higherIsBetter: true,
              size: 'small',
            }).el,
          ),
        ),
      ),
  },
];
