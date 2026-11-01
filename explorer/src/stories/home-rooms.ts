import {
  mdiBedOutline,
  mdiBookOpenVariant,
  mdiCeilingLight,
  mdiCoffeeOutline,
  mdiDeskLamp,
  mdiDishwasher,
  mdiDoor,
  mdiFan,
  mdiFloorLamp,
  mdiMotionSensor,
  mdiMovieOpenOutline,
  mdiPartyPopper,
  mdiShower,
  mdiSpeaker,
  mdiStove,
  mdiThermostat,
  mdiTumbleDryer,
  mdiWeatherNight,
  mdiWeatherSunset,
  mdiWindowOpenVariant,
} from '@mdi/js';
import { createSwitch } from '../../../src/web/choice-inputs/switch.ts';
import { h } from '../../../src/web/dom.ts';
import { createText } from '../../../src/web/foundations/text.ts';
import { createApplianceCycle, type ApplianceCycleOptions } from '../../../src/web/home/rooms/applianceCycle.ts';
import { createFloorPlan, type FloorPlanMarker, type FloorPlanRoom } from '../../../src/web/home/rooms/floorPlan.ts';
import { createIrrigationZones, type IrrigationZone } from '../../../src/web/home/rooms/irrigationZones.ts';
import { createLightGroup, type LightGroupMember } from '../../../src/web/home/rooms/lightGroup.ts';
import { createRoomCard, type RoomCardOptions, type RoomToggle } from '../../../src/web/home/rooms/roomCard.ts';
import { createSceneGrid, type Scene } from '../../../src/web/home/rooms/sceneGrid.ts';
import { createVacuumControl, type VacuumControlHandle, type VacuumState } from '../../../src/web/home/rooms/vacuumControl.ts';
import { homeColorVariables } from '../../../src/tokens/home.ts';
import type { Tokens } from '../../../src/tokens/types.ts';
import type { Story } from './types.ts';

// Room card, scenes, light groups, floor plan, vacuum, appliance cycle and irrigation. Every name and value is invented.

const stack = (...children: Node[]): HTMLElement => h('div', { class: 'ex-stack' }, ...children);
const grid = (...children: Node[]): HTMLElement => h('div', { class: 'mh-grid' }, ...children);
const caption = (text: string): HTMLElement => createText(text, { variant: 'label', tone: 'muted' });

/** The story with the optional home colours turned on (as an app would with `applyHomeColors`). */
const withHomeColors = (tokens: Tokens, el: HTMLElement): HTMLElement => {
  for (const [name, value] of Object.entries(homeColorVariables(tokens.theme))) el.style.setProperty(name, value);
  return el;
};

/** Pretends to be the device: answers a command after a short delay. */
const later = (fn: () => void, ms = 500): void => void setTimeout(fn, ms);

/** Runs `tick` every `ms` while `el` is on the page (the explorer replaces stories when the Tune bar changes). */
function every(el: HTMLElement, ms: number, tick: () => void): void {
  let seen = false;
  const timer = setInterval(() => {
    if (el.isConnected) seen = true;
    else if (seen) {
      clearInterval(timer);
      return;
    }
    tick();
  }, ms);
}

// Room card ------------------------------------------------------------------------------------------------------

function liveRoom(start: RoomCardOptions): HTMLElement {
  let o = { ...start };
  const card = createRoomCard({
    ...o,
    onOpen: () => undefined,
    onToggle: (id, on) =>
      later(() => {
        const toggles: RoomToggle[] = (o.toggles ?? []).map((t) => (t.id === id ? { ...t, on } : t));
        const lights = id === 'lights' && typeof o.lightsTotal === 'number' ? { lightsOn: on ? o.lightsTotal : 0 } : {};
        o = { ...o, toggles, ...lights };
        card.update({ toggles, ...lights });
      }),
  });
  return card.el;
}

// Floor plan -----------------------------------------------------------------------------------------------------

/** A small invented flat, in centimetres: an L-shaped living room, kitchen, hall, bedroom, bathroom, study, balcony. */
const FLAT: FloorPlanRoom[] = [
  {
    id: 'living',
    name: 'Living room',
    shape: {
      points: [
        [0, 0],
        [500, 0],
        [500, 250],
        [380, 250],
        [380, 400],
        [0, 400],
      ],
    },
  },
  { id: 'kitchen', name: 'Kitchen', shape: { x: 500, y: 0, width: 300, height: 250 } },
  { id: 'hall', name: 'Hall', shape: { x: 380, y: 250, width: 420, height: 150 } },
  { id: 'bedroom', name: 'Bedroom', shape: { x: 0, y: 400, width: 420, height: 300 } },
  { id: 'bath', name: 'Bathroom', shape: { x: 420, y: 400, width: 200, height: 300 } },
  { id: 'study', name: 'Study', shape: { x: 620, y: 400, width: 180, height: 300 } },
  { id: 'balcony', name: 'Balcony', shape: { x: 800, y: 0, width: 100, height: 250 }, disabled: true },
];

interface FlatRoomState {
  light: number;
  climate: 'heat' | 'cool' | null;
  temp: number;
  open: boolean;
}

function floorPlanStory(): HTMLElement {
  const state: Record<string, FlatRoomState> = {
    living: { light: 70, climate: null, temp: 21.5, open: false },
    kitchen: { light: 100, climate: null, temp: 22, open: false },
    hall: { light: 0, climate: null, temp: 20, open: false },
    bedroom: { light: 0, climate: 'heat', temp: 18.5, open: false },
    bath: { light: 30, climate: null, temp: 23, open: true },
    study: { light: 0, climate: 'cool', temp: 25, open: false },
    balcony: { light: 0, climate: null, temp: 14, open: false },
  };
  const lamps: { id: string; room: string; x: number; y: number; icon: string; label: string }[] = [
    { id: 'lamp-living', room: 'living', x: 90, y: 90, icon: mdiFloorLamp, label: 'Living room lamp' },
    { id: 'lamp-kitchen', room: 'kitchen', x: 740, y: 60, icon: mdiCeilingLight, label: 'Kitchen ceiling light' },
    { id: 'lamp-hall', room: 'hall', x: 740, y: 325, icon: mdiCeilingLight, label: 'Hall light' },
    { id: 'lamp-bedroom', room: 'bedroom', x: 60, y: 640, icon: mdiDeskLamp, label: 'Bedside lamp' },
    { id: 'lamp-study', room: 'study', x: 740, y: 640, icon: mdiDeskLamp, label: 'Study desk lamp' },
  ];
  const others: FloorPlanMarker[] = [
    { id: 'motion-hall', x: 440, y: 325, icon: mdiMotionSensor, label: 'Hall motion sensor', state: 'Clear' },
    { id: 'thermo-bedroom', x: 360, y: 450, icon: mdiThermostat, label: 'Bedroom thermostat', state: 'Heating to 20 °C', active: true, tone: 'heat' },
    { id: 'thermo-study', x: 680, y: 450, icon: mdiFan, label: 'Study air conditioner', state: 'Cooling to 23 °C', active: true, tone: 'cool' },
    { id: 'window-bath', x: 560, y: 650, icon: mdiWindowOpenVariant, label: 'Bathroom window', state: 'Open', active: true, tone: 'alert' },
    { id: 'speaker-living', x: 320, y: 340, icon: mdiSpeaker, label: 'Living room speaker', state: 'Idle' },
    { id: 'door', x: 790, y: 325, icon: mdiDoor, label: 'Front door', state: 'Locked' },
  ];
  let selected: string | null = 'living';
  let showNames = true;
  const detail = createText('', { variant: 'label' });

  const summary = (id: string): string => {
    const s = state[id]!;
    const parts = [s.light > 0 ? `Lights ${s.light}%` : 'Lights off', `${s.temp.toFixed(1)} °C`];
    if (s.open) parts.push('Window open');
    return parts.join(' · ');
  };
  const rooms = (): FloorPlanRoom[] =>
    FLAT.map((r) => {
      const s = state[r.id]!;
      return { ...r, light: s.light, climate: s.climate, alert: s.open, summary: r.disabled ? undefined : `${s.temp.toFixed(1)} °C` };
    });
  const markers = (): FloorPlanMarker[] => [
    ...lamps.map((l) => ({ id: l.id, x: l.x, y: l.y, icon: l.icon, label: l.label, state: state[l.room]!.light > 0 ? 'On' : 'Off', active: state[l.room]!.light > 0, tone: 'warm' as const })),
    ...others,
  ];
  const describe = (): void => {
    const room = FLAT.find((r) => r.id === selected);
    detail.textContent = room ? `${room.name}: ${summary(room.id)}` : 'Tap a room; tap a lamp to switch it.';
  };
  const plan = createFloorPlan({
    label: 'Flat',
    rooms: rooms(),
    markers: markers(),
    selected,
    onRoom: (id) => {
      selected = id;
      plan.update({ selected });
      describe();
    },
    onMarker: (id) => {
      const lamp = lamps.find((l) => l.id === id);
      if (!lamp) return;
      later(() => {
        const s = state[lamp.room]!;
        s.light = s.light > 0 ? 0 : 80;
        plan.update({ rooms: rooms(), markers: markers() });
        describe();
      }, 300);
    },
  });
  describe();
  const names = createSwitch({
    label: 'Show room names',
    checked: true,
    onChange: (on) => {
      showNames = on;
      plan.update({ showNames });
    },
  });
  const small = createFloorPlan({ label: 'Flat, small', rooms: rooms(), showNames: false });
  small.el.style.maxWidth = 'calc(var(--mh-control-lg) * 5)';
  return stack(
    caption('Arrow keys move between rooms and markers by where they are; Enter or Space chooses. Lit rooms glow with their brightness; heated and cooled rooms take a warm or cool tint; an open window outlines the room.'),
    names.el,
    plan.el,
    detail,
    caption('Small, without names (the glow and tints still read)'),
    small.el,
  );
}

// Vacuum ---------------------------------------------------------------------------------------------------------

function liveVacuum(): HTMLElement {
  let state: VacuumState = 'docked';
  let battery = 96;
  let rooms: string[] = [];
  let here = 0;
  const names: Record<string, string> = { living: 'Living room', kitchen: 'Kitchen', hall: 'Hall', bedroom: 'Bedroom' };
  const vac: VacuumControlHandle = createVacuumControl({
    name: 'Floor cleaner',
    state,
    battery,
    charging: true,
    rooms: Object.entries(names).map(([id, name]) => ({ id, name })),
    onStart: (chosen) => {
      rooms = chosen.length ? chosen : Object.keys(names);
      later(() => set('cleaning'));
    },
    onPause: () => later(() => set('paused')),
    onDock: () => later(() => set('returning')),
  });
  const set = (next: VacuumState): void => {
    state = next;
    vac.update({ state, charging: state === 'docked', detail: state === 'cleaning' || state === 'paused' ? names[rooms[here % rooms.length]!] : undefined });
  };
  every(vac.el, 1500, () => {
    if (state === 'cleaning') {
      battery = Math.max(5, battery - 3);
      here += 1;
      if (battery <= 20) set('returning');
      else vac.update({ battery, detail: names[rooms[here % rooms.length]!] });
    } else if (state === 'returning') set('docked');
    else if (state === 'docked' && battery < 100) {
      battery = Math.min(100, battery + 4);
      vac.update({ battery });
    }
  });
  return vac.el;
}

// Appliance cycle ------------------------------------------------------------------------------------------------

function liveWasher(): HTMLElement {
  const stages = ['Wash', 'Rinse', 'Spin'];
  const duration = 5400;
  let remaining = 4320;
  let o: ApplianceCycleOptions = { name: 'Washing machine', state: 'running', programme: 'Cotton 40°', stages, stage: 0, remaining, duration, endsAt: 'Ends 14:20' };
  const stageAt = (left: number): number => Math.min(stages.length - 1, Math.floor(((duration - left) / duration) * stages.length));
  const cycle = createApplianceCycle({
    ...o,
    onPause: () => later(() => update({ state: 'paused' })),
    onResume: () => later(() => update({ state: 'running' })),
    onDismiss: () =>
      later(() => {
        remaining = duration;
        update({ state: 'running', remaining, stage: 0, endsAt: 'Ends 15:50' });
      }),
  });
  const update = (changes: Partial<ApplianceCycleOptions>): void => {
    o = { ...o, ...changes };
    cycle.update(changes);
  };
  // A minute a tick, so the stages and the finished state come round in under two minutes.
  every(cycle.el, 1000, () => {
    if (o.state !== 'running') return;
    remaining = Math.max(0, remaining - 60);
    if (remaining === 0) update({ state: 'finished', remaining: 0, endsAt: 'Done at 14:20' });
    else update({ remaining, stage: stageAt(remaining) });
  });
  return cycle.el;
}

// Irrigation -----------------------------------------------------------------------------------------------------

function liveIrrigation(): HTMLElement {
  const zones: IrrigationZone[] = [
    { id: 'lawn', name: 'Front lawn', duration: 20 },
    { id: 'beds', name: 'Flower beds', duration: 10 },
    { id: 'veg', name: 'Vegetable patch', duration: 15 },
    { id: 'pots', name: 'Terrace pots', duration: 5, disabled: true },
  ];
  let running: { zone: string; remaining: number } | null = { zone: 'beds', remaining: 420 };
  const irr = createIrrigationZones({
    name: 'Garden watering',
    zones,
    running,
    nextRun: 'Tomorrow 06:00',
    rainNote: '6 mm of rain expected tonight',
    onRun: (id) =>
      later(() => {
        const zone = zones.find((z) => z.id === id)!;
        running = { zone: id, remaining: zone.duration * 60 };
        irr.update({ running });
      }),
    onStop: () =>
      later(() => {
        running = null;
        irr.update({ running });
      }),
    onRainSkip: (rainSkip) => later(() => irr.update({ rainSkip })),
  });
  // Ten seconds a tick.
  every(irr.el, 1000, () => {
    if (!running) return;
    running = running.remaining > 10 ? { ...running, remaining: running.remaining - 10 } : null;
    irr.update({ running });
  });
  return irr.el;
}

// Stories --------------------------------------------------------------------------------------------------------

const SCENES: Scene[] = [
  { id: 'morning', label: 'Morning', icon: mdiCoffeeOutline, description: 'Bright, cool white' },
  { id: 'evening', label: 'Evening', icon: mdiWeatherSunset, description: 'Dim, warm' },
  { id: 'film', label: 'Film night', icon: mdiMovieOpenOutline, description: 'Lamps low, blinds down' },
  { id: 'reading', label: 'Reading', icon: mdiBookOpenVariant, description: 'Chair lamp only' },
  { id: 'party', label: 'Party', icon: mdiPartyPopper, description: 'Colours on' },
  { id: 'night', label: 'Goodnight', icon: mdiWeatherNight, description: 'Everything off' },
];

function liveScenes(size: 'compact' | 'regular' | 'large', scenes: Scene[] = SCENES): HTMLElement {
  const grid2 = createSceneGrid({ label: 'Scenes', scenes, active: 'evening', size, onActivate: (id) => later(() => grid2.update({ active: id }), 400) });
  return grid2.el;
}

function liveGroup(name: string, members: LightGroupMember[], expanded = false): HTMLElement {
  let list = members;
  const set = (next: LightGroupMember[]): void => {
    list = next;
    later(() => group.update({ members: list }));
  };
  const group = createLightGroup({
    name,
    members: list,
    expanded,
    onToggle: (on) => set(list.map((m) => (m.unavailable ? m : { ...m, on, brightness: typeof m.brightness === 'number' ? (on ? Math.max(m.brightness, 60) : m.brightness) : m.brightness }))),
    onBrightness: (v) => set(list.map((m) => (m.unavailable || typeof m.brightness !== 'number' ? m : { ...m, brightness: v, on: v > 0 }))),
    onMemberToggle: (id, on) => set(list.map((m) => (m.id === id ? { ...m, on } : m))),
    onMemberBrightness: (id, v) => set(list.map((m) => (m.id === id ? { ...m, brightness: v, on: v > 0 } : m))),
  });
  return group.el;
}

export const homeRoomsStories: Story[] = [
  {
    id: 'room-card',
    render: (tokens) =>
      withHomeColors(
        tokens,
        stack(
          caption('Temperature and humidity on the state line; lights and open windows under it; quick toggles answer a moment later'),
          grid(
            liveRoom({
              name: 'Living room',
              temperature: 21.5,
              humidity: 46,
              lightsOn: 3,
              lightsTotal: 4,
              toggles: [
                { id: 'lights', label: 'Lights', icon: 'lightbulb', on: true },
                { id: 'fan', label: 'Fan', icon: mdiFan, on: false, tone: 'cool' },
                { id: 'music', label: 'Music', icon: mdiSpeaker, on: false, tone: 'accent' },
              ],
            }),
            liveRoom({ name: 'Bathroom', icon: mdiShower, temperature: 23.2, humidity: 71, lightsOn: 0, lightsTotal: 2, open: 1, toggles: [{ id: 'lights', label: 'Lights', icon: 'lightbulb', on: false }, { id: 'heat', label: 'Towel rail', icon: mdiThermostat, on: true, tone: 'heat' }] }),
          ),
          caption('Few facts, a long name, and unavailable'),
          grid(
            createRoomCard({ name: 'Kitchen', icon: mdiStove, temperature: 22 }).el,
            createRoomCard({ name: 'Guest bedroom by the garden stairs', icon: mdiBedOutline, temperature: 70, unit: '°F', lightsOn: 1 }).el,
            createRoomCard({ name: 'Loft', unavailable: true, lightsOn: 0, toggles: [{ id: 'lights', label: 'Lights', icon: 'lightbulb', on: false }] }).el,
          ),
        ),
      ),
  },
  {
    id: 'scene-grid',
    render: () =>
      stack(
        caption('Tap a tile: a check for a moment, then the active mark moves to it'),
        liveScenes('regular'),
        caption('Compact, for phones and small screens'),
        liveScenes('compact', SCENES.slice(0, 4)),
        caption('Large, for wall screens'),
        liveScenes('large', SCENES.slice(0, 3)),
      ),
  },
  {
    id: 'light-group',
    render: (tokens) =>
      withHomeColors(
        tokens,
        stack(
          caption('The master switch and slider set every light; expand for each one'),
          grid(
            liveGroup('Kitchen', [
              { id: 'pendants', name: 'Pendants', on: true, brightness: 80 },
              { id: 'counter', name: 'Counter strip', on: true, brightness: 40 },
              { id: 'spots', name: 'Spots', on: false, brightness: 0 },
              { id: 'cabinet', name: 'Cabinet light', on: false },
            ]),
            liveGroup(
              'Garden',
              [
                { id: 'path', name: 'Path lights', on: false },
                { id: 'string', name: 'String lights', on: false },
                { id: 'shed', name: 'Shed light', on: false, unavailable: true },
              ],
              true,
            ),
          ),
        ),
      ),
  },
  {
    id: 'floor-plan',
    render: (tokens) => withHomeColors(tokens, floorPlanStory()),
  },
  {
    id: 'vacuum-control',
    render: () =>
      stack(
        caption('Choose rooms (or none for everywhere), start, pause, send it home; the battery drains while it cleans'),
        grid(
          liveVacuum(),
          createVacuumControl({ name: 'Upstairs cleaner', state: 'error', battery: 41, error: 'Main brush is stuck. Free it and press start.', rooms: [{ id: 'landing', name: 'Landing' }] }).el,
        ),
        caption('Returning with a low battery; unavailable'),
        grid(createVacuumControl({ name: 'Floor cleaner', state: 'returning', battery: 12 }).el, createVacuumControl({ name: 'Garage cleaner', state: 'idle', battery: null, unavailable: true }).el),
      ),
  },
  {
    id: 'appliance-cycle',
    render: () =>
      stack(
        caption('Running, a minute a second here: stages, time left and progress; it finishes with a Done button'),
        grid(
          liveWasher(),
          createApplianceCycle({ name: 'Dishwasher', icon: mdiDishwasher, state: 'finished', programme: 'Eco', stages: ['Prewash', 'Wash', 'Rinse', 'Dry'], endsAt: 'Done at 13:05', onDismiss: () => undefined }).el,
        ),
        caption('Paused, needs attention, and ready with a planned start'),
        grid(
          createApplianceCycle({ name: 'Dryer', icon: mdiTumbleDryer, state: 'paused', programme: 'Cupboard dry', stages: ['Dry', 'Cool down'], stage: 0, remaining: 2100, duration: 4800, onResume: () => undefined }).el,
          createApplianceCycle({ name: 'Washing machine', state: 'error', programme: 'Wool 30°', stages: ['Wash', 'Rinse', 'Spin'], stage: 1, progress: 55, error: 'Door not closed' }).el,
          createApplianceCycle({ name: 'Dishwasher', icon: mdiDishwasher, state: 'idle', programme: 'Quick 45', endsAt: 'Starts 23:00' }).el,
        ),
      ),
  },
  {
    id: 'irrigation-zones',
    render: (tokens) =>
      withHomeColors(
        tokens,
        stack(
          caption('A zone runs now (ten seconds a second here); run another, stop, or skip the next run for rain'),
          grid(
            liveIrrigation(),
            createIrrigationZones({
              name: 'Back garden',
              zones: [
                { id: 'hedge', name: 'Hedge drip line', duration: 30 },
                { id: 'lawn', name: 'Lawn', duration: 25 },
              ],
              nextRun: 'Friday 05:30',
              rainSkip: true,
              rainNote: '12 mm fell overnight',
              onRainSkip: () => undefined,
              onRun: () => undefined,
            }).el,
          ),
        ),
      ),
  },
];
