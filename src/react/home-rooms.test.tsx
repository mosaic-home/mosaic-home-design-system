import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createApplianceCycle,
  createFloorPlan,
  createIrrigationZones,
  createLightGroup,
  createRoomCard,
  createSceneGrid,
  createVacuumControl,
  type FloorPlanRoom,
} from '../web/index.ts';
import { ApplianceCycle, FloorPlan, IrrigationZones, LightGroup, RoomCard, SceneGrid, VacuumControl } from './index.ts';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const KEPT = new Set(['class', 'role', 'hidden', 'tabindex', 'type', 'd', 'points', 'viewbox', 'style', 'title', 'disabled']);
// Generated ids differ between the renderers; what they point at is checked by the web tests.
const IDS = new Set(['aria-controls', 'aria-describedby', 'aria-labelledby']);

/** Tag, classes, role, ARIA, inline style and own text of every element, in document order. */
function shape(root: Element): string[] {
  const out: string[] = [];
  const walk = (el: Element): void => {
    const attrs = Array.from(el.attributes)
      .filter((a) => KEPT.has(a.name.toLowerCase()) || (a.name.startsWith('aria-') && !IDS.has(a.name)))
      .map((a) => `${a.name.toLowerCase()}=${a.name === 'style' ? a.value.replace(/\s+/g, '').replace(/;$/, '') : a.name === 'disabled' ? '' : a.value}`)
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

const ROOMS: FloorPlanRoom[] = [
  { id: 'living', name: 'Living room', shape: { x: 0, y: 0, width: 400, height: 300 }, light: 70, summary: '2 lights on' },
  { id: 'kitchen', name: 'Kitchen', shape: { x: 400, y: 0, width: 200, height: 300 }, climate: 'cool' },
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

describe('home rooms parity', () => {
  it('RoomCard', () => {
    const cases = [
      { name: 'Living room', temperature: 21.5, humidity: 48, lightsOn: 2, lightsTotal: 4, open: 1, toggles: [{ id: 'l', label: 'Lights', icon: 'lightbulb', on: true }, { id: 'f', label: 'Fan', icon: 'fan', on: false, tone: 'cool' as const, disabled: true }] },
      { name: 'Study', unavailable: true },
      { name: 'Bedroom', lightsOn: 0, icon: 'home' },
    ];
    for (const c of cases) expect(shape(react(<RoomCard {...c} />))).toEqual(shape(createRoomCard(c).el));
    expect(shape(react(<RoomCard name="Hall" onOpen={() => undefined} />))).toEqual(shape(createRoomCard({ name: 'Hall', onOpen: () => undefined }).el));
  });

  it('SceneGrid', () => {
    const scenes = [
      { id: 'a', label: 'Morning', icon: 'lightbulb', description: 'Bright' },
      { id: 'b', label: 'Film', icon: 'film', disabled: true },
    ];
    const cases = [{ scenes, active: 'a' }, { scenes, size: 'large' as const, label: 'Moods', disabled: true }, { scenes: [], size: 'compact' as const }];
    for (const c of cases) expect(shape(react(<SceneGrid {...c} />))).toEqual(shape(createSceneGrid(c).el));
  });

  it('LightGroup', () => {
    const members = [
      { id: 'a', name: 'Pendant', on: true, brightness: 80 },
      { id: 'b', name: 'Strip', on: false, brightness: 0, unavailable: true },
      { id: 'c', name: 'Lamp', on: true },
    ];
    const cases = [{ name: 'Kitchen', members }, { name: 'Kitchen', members, expanded: true }, { name: 'Porch', members: [{ id: 'x', name: 'Porch', on: false }], unavailable: true }, { name: 'Empty', members: [] }];
    for (const c of cases) expect(shape(react(<LightGroup {...c} />))).toEqual(shape(createLightGroup(c).el));
  });

  it('FloorPlan', () => {
    const markers = [
      { id: 'm1', x: 350, y: 50, icon: 'lightbulb', label: 'Lamp', state: 'On', active: true, tone: 'warm' as const },
      { id: 'm2', x: 100, y: 350, icon: 'lock', label: 'Door' },
    ];
    const cases = [
      { label: 'Flat', rooms: ROOMS, selected: 'kitchen' },
      { label: 'Flat', rooms: ROOMS, markers, showNames: false },
      { label: 'Flat', rooms: ROOMS, markers, onMarker: () => undefined, bounds: { x: -10, y: -10, width: 720, height: 420 } },
    ];
    for (const c of cases) expect(shape(react(<FloorPlan {...c} />))).toEqual(shape(createFloorPlan(c).el));
  });

  it('VacuumControl', () => {
    const rooms = [
      { id: 'k', name: 'Kitchen' },
      { id: 'h', name: 'Hall' },
    ];
    const cases = [
      { name: 'Cleaner', state: 'docked' as const, battery: 100, charging: true, rooms, selectedRooms: ['h'] },
      { name: 'Cleaner', state: 'cleaning' as const, battery: 12, detail: 'Kitchen' },
      { name: 'Cleaner', state: 'error' as const, error: 'Brush stuck', battery: null, unavailable: true, rooms },
      { name: 'Cleaner', state: 'paused' as const },
    ];
    for (const c of cases) expect(shape(react(<VacuumControl {...c} />))).toEqual(shape(createVacuumControl(c).el));
  });

  it('ApplianceCycle', () => {
    const stages = ['Wash', 'Rinse', 'Spin'];
    const cases = [
      { name: 'Washer', state: 'running' as const, programme: 'Cotton 40°', stages, stage: 1, remaining: 1500, duration: 6000, endsAt: 'Ends 14:20', onPause: () => undefined },
      { name: 'Washer', state: 'paused' as const, stages, stage: 2, remaining: 300, progress: 90, onResume: () => undefined },
      { name: 'Dishwasher', icon: 'home', state: 'finished' as const, stages, endsAt: 'Done at 14:25', onDismiss: () => undefined },
      { name: 'Washer', state: 'error' as const, error: 'Door open', progress: 40, stages, stage: 0 },
      { name: 'Washer', state: 'idle' as const, endsAt: 'Starts 22:00' },
    ];
    for (const c of cases) expect(shape(react(<ApplianceCycle {...c} />))).toEqual(shape(createApplianceCycle(c).el));
  });

  it('IrrigationZones', () => {
    const zones = [
      { id: 'lawn', name: 'Lawn', duration: 20 },
      { id: 'beds', name: 'Beds', duration: 10, disabled: true },
    ];
    const cases = [
      { name: 'Garden', zones, running: { zone: 'lawn', remaining: 600 }, onRainSkip: () => undefined, rainNote: '8 mm expected' },
      { name: 'Garden', zones, nextRun: 'Tomorrow 06:00', rainSkip: true, unavailable: true, onRainSkip: () => undefined },
      { name: 'Garden', zones: [] },
    ];
    for (const c of cases) expect(shape(react(<IrrigationZones {...c} />))).toEqual(shape(createIrrigationZones(c).el));
  });
});

describe('home rooms behaviour', () => {
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

  it('SceneGrid shows the applied state for a moment', () => {
    const onActivate = vi.fn();
    act(() => root.render(<SceneGrid scenes={[{ id: 'a', label: 'Morning', icon: 'lightbulb' }]} appliedFor={500} onActivate={onActivate} />));
    const tile = host.querySelector<HTMLButtonElement>('.mh-scene-grid__tile')!;
    act(() => tile.click());
    expect(onActivate).toHaveBeenCalledWith('a');
    expect(tile.className).toContain('is-applied');
    expect(host.querySelector('[aria-live]')!.textContent).toBe('Morning set');
    act(() => vi.advanceTimersByTime(500));
    expect(tile.className).not.toContain('is-applied');
  });

  it('LightGroup expands', () => {
    act(() => root.render(<LightGroup name="Kitchen" members={[{ id: 'a', name: 'Pendant', on: true }]} />));
    const expand = host.querySelector<HTMLButtonElement>('.mh-light-group__expand')!;
    const list = host.querySelector<HTMLUListElement>('.mh-light-group__members')!;
    expect(expand.getAttribute('aria-controls')).toBe(list.id);
    act(() => expand.click());
    expect(list.hidden).toBe(false);
    expect(expand.getAttribute('aria-expanded')).toBe('true');
  });

  it('FloorPlan moves focus with the arrow keys and chooses with Enter', () => {
    const onRoom = vi.fn();
    act(() => root.render(<FloorPlan label="Flat" rooms={ROOMS} onRoom={onRoom} />));
    const gs = Array.from(host.querySelectorAll<SVGGElement>('.mh-floor-plan__room'));
    expect(gs.map((g) => g.getAttribute('tabindex'))).toEqual(['0', '-1', '-1', null]);
    act(() => gs[0]!.focus());
    act(() => {
      gs[0]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    });
    expect(document.activeElement).toBe(gs[2]);
    expect(gs[2]!.getAttribute('tabindex')).toBe('0');
    act(() => {
      gs[2]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    });
    expect(onRoom).toHaveBeenCalledWith('hall');
  });

  it('VacuumControl starts with the chosen rooms', () => {
    const onStart = vi.fn();
    act(() => root.render(<VacuumControl name="Cleaner" state="docked" rooms={[{ id: 'k', name: 'Kitchen' }]} onStart={onStart} />));
    act(() => host.querySelector<HTMLButtonElement>('.mh-chip')!.click());
    const start = host.querySelector<HTMLButtonElement>('.mh-vacuum-control__button--start')!;
    expect(start.textContent).toBe('Clean 1 room');
    act(() => start.click());
    expect(onStart).toHaveBeenCalledWith(['k']);
  });
});
