import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applianceProgress,
  applianceStages,
  createApplianceCycle,
  createFloorPlan,
  createIrrigationZones,
  createLightGroup,
  createRoomCard,
  createSceneGrid,
  createVacuumControl,
  floorPlanBounds,
  floorPlanCentroid,
  floorPlanMove,
  floorPlanStops,
  formatApplianceTime,
  irrigationProgress,
  irrigationStateText,
  IRRIGATION_ZONES_LABELS,
  lightGroupState,
  roomCardClimate,
  roomCardFacts,
  vacuumBatteryIcon,
  vacuumButtons,
  VACUUM_CONTROL_LABELS,
  type FloorPlanRoom,
} from './index.ts';

const mount = <T extends { el: HTMLElement }>(handle: T): T => {
  document.body.append(handle.el);
  return handle;
};
const all = <T extends Element = HTMLElement>(el: Element, selector: string): T[] => Array.from(el.querySelectorAll<T>(selector as never)) as T[];
const key = (target: Element, k: string): void => {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

describe('room card', () => {
  it('words the climate and the facts', () => {
    expect(roomCardClimate({ temperature: 21.46, humidity: 47.6 })).toBe('21.5 °C · 48% humidity');
    expect(roomCardClimate({ temperature: 70, unit: '°F' })).toBe('70 °F');
    expect(roomCardClimate({})).toBe('');
    expect(roomCardFacts({ lightsOn: 2, lightsTotal: 5, open: 1 }).map((f) => [f.text, f.tone])).toEqual([
      ['2 of 5 lights on', 'lit'],
      ['1 window open', 'warning'],
    ]);
    expect(roomCardFacts({ lightsOn: 0, open: 0 }).map((f) => f.text)).toEqual(['Lights off']);
  });

  it('is lit while lights are on, and its toggles ask for the other state', () => {
    const onToggle = vi.fn();
    const card = mount(createRoomCard({ name: 'Living room', temperature: 21, lightsOn: 1, lightsTotal: 3, toggles: [{ id: 'lights', label: 'Lights', icon: 'lightbulb', on: true }], onToggle }));
    expect(card.el.className).toContain('mh-room-card');
    expect(card.el.className).toContain('is-active');
    expect(card.el.querySelector('.mh-control-card__state')!.textContent).toBe('21 °C');
    const button = card.el.querySelector<HTMLButtonElement>('.mh-room-card__toggle')!;
    expect(button.getAttribute('aria-pressed')).toBe('true');
    button.click();
    expect(onToggle).toHaveBeenCalledWith('lights', false);
    card.update({ lightsOn: 0, toggles: [{ id: 'lights', label: 'Lights', icon: 'lightbulb', on: false }] });
    expect(card.el.querySelector('.mh-room-card__toggle')).toBe(button);
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(card.el.className).not.toContain('is-active');
    expect(card.el.className).toContain('mh-room-card');
  });

  it('disables its toggles when unavailable', () => {
    const card = mount(createRoomCard({ name: 'Study', toggles: [{ id: 'fan', label: 'Fan', icon: 'fan', on: false }], unavailable: true }));
    expect(card.el.querySelector<HTMLFieldSetElement>('.mh-control-card__body')!.disabled).toBe(true);
  });
});

describe('scene grid', () => {
  const scenes = [
    { id: 'morning', label: 'Morning', icon: 'lightbulb' },
    { id: 'evening', label: 'Evening', icon: 'lightbulb', description: 'Dim, warm' },
  ];

  it('marks the active scene and shows the applied state for a moment', () => {
    const onActivate = vi.fn();
    const grid = mount(createSceneGrid({ scenes, active: 'morning', onActivate, appliedFor: 1000 }));
    const [morning, evening] = all<HTMLButtonElement>(grid.el, '.mh-scene-grid__tile');
    expect(morning!.getAttribute('aria-current')).toBe('true');
    expect(evening!.hasAttribute('aria-current')).toBe(false);
    expect(morning!.querySelector('.mh-scene-grid__tag')!.textContent).toBe('Active');
    evening!.click();
    expect(onActivate).toHaveBeenCalledWith('evening');
    expect(evening!.className).toContain('is-applied');
    expect(evening!.querySelector('.mh-scene-grid__tag')!.textContent).toBe('Set');
    expect(grid.el.querySelector('[aria-live]')!.textContent).toBe('Evening set');
    grid.update({ active: 'evening' });
    vi.advanceTimersByTime(1000);
    expect(evening!.className).not.toContain('is-applied');
    expect(evening!.getAttribute('aria-current')).toBe('true');
    expect(evening!.querySelector('.mh-scene-grid__tag')!.textContent).toBe('Active');
  });

  it('ignores disabled scenes', () => {
    const onActivate = vi.fn();
    const grid = mount(createSceneGrid({ scenes: [{ ...scenes[0]!, disabled: true }], onActivate }));
    grid.el.querySelector<HTMLButtonElement>('button')!.click();
    expect(onActivate).not.toHaveBeenCalled();
  });
});

describe('light group', () => {
  const members = [
    { id: 'a', name: 'Pendant', on: true, brightness: 80 },
    { id: 'b', name: 'Strip', on: true, brightness: 40 },
    { id: 'c', name: 'Lamp', on: false, brightness: 0 },
    { id: 'd', name: 'Spot', on: true, unavailable: true },
  ];

  it('sums up the members', () => {
    expect(lightGroupState(members)).toEqual({ on: 2, total: 4, brightness: 60, dims: true });
    expect(lightGroupState([{ id: 'x', name: 'X', on: false }])).toEqual({ on: 0, total: 1, brightness: null, dims: false });
  });

  it('switches all, expands to each member and reports member changes', () => {
    const onToggle = vi.fn();
    const onMemberToggle = vi.fn();
    const onExpandedChange = vi.fn();
    const group = mount(createLightGroup({ name: 'Kitchen', members, onToggle, onMemberToggle, onExpandedChange }));
    expect(group.el.querySelector('.mh-control-card__state')!.textContent).toBe('2 of 4 on · 60%');
    const master = group.el.querySelector<HTMLInputElement>('.mh-control-card__control input')!;
    expect(master.checked).toBe(true);
    expect(master.getAttribute('aria-label')).toBe('All lights in Kitchen');
    master.click();
    expect(onToggle).toHaveBeenCalledWith(false);

    const expand = group.el.querySelector<HTMLButtonElement>('.mh-light-group__expand')!;
    const list = group.el.querySelector<HTMLUListElement>('.mh-light-group__members')!;
    expect(list.hidden).toBe(true);
    expect(expand.getAttribute('aria-expanded')).toBe('false');
    expect(expand.getAttribute('aria-controls')).toBe(list.id);
    expand.click();
    expect(list.hidden).toBe(false);
    expect(group.el.className).toContain('is-expanded');
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(all(list, '.mh-light-group__member')).toHaveLength(4);
    all<HTMLInputElement>(list, '.mh-light-control__power input')[2]!.click();
    expect(onMemberToggle).toHaveBeenCalledWith('c', true);
    expect(all<HTMLInputElement>(list, '.mh-light-control__power input')[3]!.disabled).toBe(true);
  });
});

describe('floor plan', () => {
  const rooms: FloorPlanRoom[] = [
    { id: 'living', name: 'Living room', shape: { x: 0, y: 0, width: 400, height: 300 }, light: 70, summary: '2 lights on' },
    { id: 'kitchen', name: 'Kitchen', shape: { x: 400, y: 0, width: 200, height: 300 }, climate: 'heat' },
    {
      id: 'hall',
      name: 'Hall',
      shape: {
        points: [
          [0, 300],
          [600, 300],
          [600, 400],
          [0, 400],
        ],
      },
      alert: true,
    },
    { id: 'store', name: 'Store', shape: { x: 600, y: 0, width: 100, height: 100 }, disabled: true },
  ];

  it('finds centroids and bounds', () => {
    expect(floorPlanCentroid({ x: 0, y: 0, width: 4, height: 2 })).toEqual([2, 1]);
    const l = floorPlanCentroid({
      points: [
        [0, 0],
        [2, 0],
        [2, 1],
        [1, 1],
        [1, 2],
        [0, 2],
      ],
    });
    expect(l[0]).toBeCloseTo(5 / 6);
    expect(l[1]).toBeCloseTo(5 / 6);
    expect(floorPlanBounds(rooms)).toEqual({ x: 0, y: 0, width: 700, height: 400 });
  });

  it('moves to the nearest stop in the direction of an arrow key', () => {
    const stops = floorPlanStops({ rooms });
    expect(stops.map((s) => s.id)).toEqual(['living', 'kitchen', 'hall']);
    expect(floorPlanMove(stops, 0, 'ArrowRight')).toBe(1);
    expect(floorPlanMove(stops, 0, 'ArrowDown')).toBe(2);
    expect(floorPlanMove(stops, 1, 'ArrowLeft')).toBe(0);
    expect(floorPlanMove(stops, 0, 'ArrowUp')).toBeNull();
    expect(floorPlanMove(stops, 1, 'Home')).toBe(0);
    expect(floorPlanMove(stops, 0, 'End')).toBe(2);
  });

  it('draws rooms as buttons with one tab stop, tints and rings', () => {
    const onRoom = vi.fn();
    const plan = mount(createFloorPlan({ label: 'Flat', rooms, selected: 'kitchen', onRoom }));
    expect(plan.el.getAttribute('aria-label')).toBe('Flat');
    expect(plan.el.querySelector('svg')!.getAttribute('viewBox')).toBe('0 0 700 400');
    const gs = all<SVGGElement & HTMLElement>(plan.el, '.mh-floor-plan__room');
    expect(gs.map((g) => g.getAttribute('role'))).toEqual(['button', 'button', 'button', 'button']);
    expect(gs[0]!.getAttribute('aria-label')).toBe('Living room, 2 lights on');
    expect(gs[0]!.getAttribute('class')).toContain('is-lit');
    expect(gs[0]!.querySelector('.mh-floor-plan__glow')).not.toBeNull();
    expect(gs[1]!.getAttribute('class')).toContain('is-heat');
    expect(gs[1]!.getAttribute('aria-current')).toBe('true');
    expect(gs.map((g) => g.getAttribute('tabindex'))).toEqual(['-1', '0', '-1', null]);
    expect(gs[3]!.getAttribute('aria-disabled')).toBe('true');
    expect(all(plan.el, '.mh-floor-plan__ring').map((r) => r.getAttribute('class'))).toEqual(['mh-floor-plan__ring mh-floor-plan__ring--alert', 'mh-floor-plan__ring mh-floor-plan__ring--selected']);
    expect(all(plan.el, '.mh-floor-plan__name').map((n) => n.textContent)).toEqual(['Living room', 'Kitchen', 'Hall', 'Store']);

    gs[1]!.focus();
    key(gs[1]!, 'ArrowLeft');
    expect(document.activeElement).toBe(gs[0]);
    expect(gs[0]!.getAttribute('tabindex')).toBe('0');
    expect(gs[1]!.getAttribute('tabindex')).toBe('-1');
    key(gs[0]!, 'Enter');
    expect(onRoom).toHaveBeenCalledWith('living');
    gs[2]!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onRoom).toHaveBeenCalledWith('hall');
    gs[3]!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onRoom).not.toHaveBeenCalledWith('store');
  });

  it('places markers, as buttons in the keyboard order when they can be pressed', () => {
    const markers = [{ id: 'm', x: 350, y: 50, icon: 'lightbulb', label: 'Lamp', state: 'On', active: true, tone: 'warm' as const }];
    const still = mount(createFloorPlan({ label: 'Flat', rooms, markers }));
    const span = still.el.querySelector<HTMLElement>('.mh-floor-plan__marker')!;
    expect(span.tagName).toBe('SPAN');
    expect(span.getAttribute('role')).toBe('img');
    expect(span.getAttribute('aria-label')).toBe('Lamp, On');
    expect(span.style.left).toBe('50%');
    expect(span.style.top).toBe('12.5%');
    const onMarker = vi.fn();
    still.update({ onMarker });
    const button = still.el.querySelector<HTMLButtonElement>('.mh-floor-plan__marker')!;
    expect(button.tagName).toBe('BUTTON');
    expect(button.className).toContain('mh-floor-plan__marker--warm');
    expect(button.className).toContain('is-active');
    button.click();
    expect(onMarker).toHaveBeenCalledWith('m');
    expect(floorPlanStops({ rooms, markers, onMarker }).map((s) => s.kind)).toEqual(['room', 'room', 'room', 'marker']);
  });

  it('hides names on request', () => {
    const plan = createFloorPlan({ label: 'Flat', rooms, showNames: false });
    expect(plan.el.querySelector<HTMLElement>('.mh-floor-plan__labels')!.hidden).toBe(true);
  });
});

describe('vacuum control', () => {
  it('enables the buttons that do something', () => {
    const l = VACUUM_CONTROL_LABELS;
    const by = (state: Parameters<typeof vacuumButtons>[0]['state'], chosen = 0) => vacuumButtons({ state }, chosen, l).map((b) => `${b.label}:${b.disabled ? 'off' : 'on'}`);
    expect(by('docked')).toEqual(['Clean everywhere:on', 'Pause:off', 'Dock:off']);
    expect(by('cleaning')).toEqual(['Clean everywhere:off', 'Pause:on', 'Dock:on']);
    expect(by('paused')).toEqual(['Resume:on', 'Pause:off', 'Dock:on']);
    expect(by('idle', 2)).toEqual(['Clean 2 rooms:on', 'Pause:off', 'Dock:on']);
    expect(vacuumBatteryIcon(84)).not.toBe(vacuumBatteryIcon(84, true));
    expect(vacuumBatteryIcon(null)).not.toBe(vacuumBatteryIcon(0));
  });

  it('starts with the chosen rooms', () => {
    const onStart = vi.fn();
    const onRoomsChange = vi.fn();
    const vac = mount(createVacuumControl({ name: 'Cleaner', state: 'docked', battery: 15, rooms: [{ id: 'k', name: 'Kitchen' }, { id: 'h', name: 'Hall' }], onStart, onRoomsChange }));
    expect(vac.el.className).toContain('mh-vacuum-control--docked');
    expect(vac.el.querySelector('.mh-vacuum-control__battery')!.className).toContain('is-low');
    expect(vac.el.querySelector('.mh-vacuum-control__battery .mh-visually-hidden')!.textContent).toBe('Battery 15%');
    const chips = all<HTMLButtonElement>(vac.el, '.mh-chip');
    chips[1]!.click();
    expect(onRoomsChange).toHaveBeenCalledWith(['h']);
    const start = vac.el.querySelector<HTMLButtonElement>('.mh-vacuum-control__button--start')!;
    expect(start.textContent).toBe('Clean 1 room');
    start.click();
    expect(onStart).toHaveBeenCalledWith(['h']);
    vac.update({ state: 'cleaning', detail: 'Hall' });
    expect(vac.el.querySelector('.mh-control-card__state')!.textContent).toBe('Cleaning · Hall');
    expect(vac.el.className).toContain('is-busy');
    expect(all<HTMLButtonElement>(vac.el, '.mh-chip')[1]!.getAttribute('aria-pressed')).toBe('true');
  });

  it('shows what is wrong', () => {
    const vac = createVacuumControl({ name: 'Cleaner', state: 'error', error: 'Brush stuck' });
    expect(vac.el.querySelector('[role="alert"]')!.textContent).toBe('Brush stuck');
    expect(vac.el.querySelector('.mh-vacuum-control__battery')).toBeNull();
  });
});

describe('appliance cycle', () => {
  it('formats time and progress', () => {
    expect(formatApplianceTime(4320)).toBe('1 h 12 min');
    expect(formatApplianceTime(3600)).toBe('1 h');
    expect(formatApplianceTime(480)).toBe('8 min');
    expect(formatApplianceTime(30)).toBe('< 1 min');
    expect(applianceProgress({ state: 'running', remaining: 900, duration: 3600 })).toBe(75);
    expect(applianceProgress({ state: 'running', progress: 120 })).toBe(100);
    expect(applianceProgress({ state: 'finished' })).toBe(100);
    expect(applianceProgress({ state: 'running' })).toBeNull();
    expect(applianceStages({ state: 'running', stages: ['Wash', 'Rinse', 'Spin'], stage: 1 }).map((s) => s.status)).toEqual(['done', 'current', 'next']);
    expect(applianceStages({ state: 'finished', stages: ['Wash', 'Rinse'] }).map((s) => s.status)).toEqual(['done', 'done']);
  });

  it('shows the running stage, keeps its pause button and finishes', () => {
    const onPause = vi.fn();
    const onResume = vi.fn();
    const onDismiss = vi.fn();
    const cycle = mount(createApplianceCycle({ name: 'Washer', state: 'running', programme: 'Cotton 40°', stages: ['Wash', 'Rinse', 'Spin'], stage: 0, remaining: 4320, duration: 6000, endsAt: 'Ends 14:20', onPause, onResume, onDismiss }));
    expect(cycle.el.querySelector('.mh-control-card__state')!.textContent).toBe('Running · Cotton 40°');
    expect(cycle.el.querySelector('.mh-appliance-cycle__left')!.textContent).toBe('1 h 12 min left');
    expect(cycle.el.querySelector('[aria-current="step"]')!.textContent).toBe('Wash');
    expect(cycle.el.querySelector('.mh-progress')!.getAttribute('aria-valuenow')).toBe('28');
    const toggle = cycle.el.querySelector<HTMLButtonElement>('.mh-appliance-cycle__toggle')!;
    toggle.click();
    expect(onPause).toHaveBeenCalled();
    cycle.update({ state: 'paused', remaining: 4300 });
    expect(cycle.el.querySelector('.mh-appliance-cycle__toggle')).toBe(toggle);
    expect(toggle.getAttribute('aria-label')).toBe('Resume');
    toggle.click();
    expect(onResume).toHaveBeenCalled();
    cycle.update({ state: 'finished', endsAt: 'Done at 14:25' });
    expect(cycle.el.className).toContain('mh-appliance-cycle--finished');
    expect(cycle.el.querySelector('.mh-appliance-cycle__toggle')).toBeNull();
    expect(cycle.el.querySelector('.mh-appliance-cycle__done-text')!.textContent).toBe('Done at 14:25');
    expect(cycle.el.querySelector('.mh-progress')).toBeNull();
    expect(cycle.el.querySelector('[aria-live]')!.textContent).toBe('Finished');
    cycle.el.querySelector<HTMLButtonElement>('.mh-appliance-cycle__dismiss')!.click();
    expect(onDismiss).toHaveBeenCalled();
  });
});

describe('irrigation zones', () => {
  const zones = [
    { id: 'lawn', name: 'Lawn', duration: 20 },
    { id: 'beds', name: 'Beds', duration: 10, disabled: true },
  ];

  it('words the state line', () => {
    const l = IRRIGATION_ZONES_LABELS;
    expect(irrigationStateText({ zones, running: { zone: 'lawn', remaining: 360 } }, l)).toBe('Watering Lawn · 6 min left');
    expect(irrigationStateText({ zones, nextRun: 'Tomorrow 06:00' }, l)).toBe('Next run Tomorrow 06:00');
    expect(irrigationStateText({ zones, nextRun: 'Tomorrow 06:00', rainSkip: true }, l)).toBe('Next run skipped for rain');
    expect(irrigationStateText({ zones }, l)).toBe('No run planned');
    expect(irrigationProgress({ zones, running: { zone: 'lawn', remaining: 600 } })).toBe(50);
  });

  it('runs and stops zones and skips for rain', () => {
    const onRun = vi.fn();
    const onStop = vi.fn();
    const onRainSkip = vi.fn();
    const irr = mount(createIrrigationZones({ name: 'Garden', zones, nextRun: 'Tomorrow 06:00', rainNote: '8 mm expected', onRun, onStop, onRainSkip }));
    const runs = all<HTMLButtonElement>(irr.el, '.mh-irrigation-zones__run');
    expect(runs.map((b) => b.getAttribute('aria-label'))).toEqual(['Run Lawn', 'Run Beds']);
    expect(runs[1]!.disabled).toBe(true);
    runs[0]!.click();
    expect(onRun).toHaveBeenCalledWith('lawn');
    irr.update({ running: { zone: 'lawn', remaining: 600 } });
    expect(irr.el.className).toContain('is-running');
    expect(irr.el.querySelector('.mh-irrigation-zones__now-name')!.textContent).toBe('Lawn');
    expect(irr.el.querySelector('.mh-irrigation-zones__progress')!.getAttribute('aria-valuenow')).toBe('50');
    expect(all(irr.el, '.mh-irrigation-zones__run')[0]).toBe(runs[0]);
    expect(runs[0]!.getAttribute('aria-label')).toBe('Stop Lawn');
    runs[0]!.click();
    expect(onStop).toHaveBeenCalledTimes(1);
    irr.el.querySelector<HTMLButtonElement>('.mh-irrigation-zones__stop')!.click();
    expect(onStop).toHaveBeenCalledTimes(2);
    const rain = irr.el.querySelector<HTMLInputElement>('.mh-irrigation-zones__rain input')!;
    rain.click();
    expect(onRainSkip).toHaveBeenCalledWith(true);
    irr.update({ running: null });
    expect(irr.el.querySelector('.mh-irrigation-zones__now')).toBeNull();
  });
});
