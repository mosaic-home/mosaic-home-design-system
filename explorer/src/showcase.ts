import '../../src/web/style.css';
import '../../src/icons.ts';
import './showcase.css';
import { mdiBlindsHorizontal, mdiFloorLamp, mdiSourceFork, mdiThermostat } from '@mdi/js';
import { ACCENT_NAMES, namedAccent, type AccentName } from '../../src/tokens/accents.ts';
import { homeColorVariables } from '../../src/tokens/home.ts';
import { CORNERS, DENSITIES } from '../../src/tokens/resolve.ts';
import { THEMES, themeById } from '../../src/tokens/themes.ts';
import type { Character, Corners, Density, Depth, DeviceClass, Theme, Tokens } from '../../src/tokens/types.ts';
import { buttonClass, createButton } from '../../src/web/actions/button.ts';
import { createIconButton } from '../../src/web/actions/iconButton.ts';
import { createTrend } from '../../src/web/charts/trend.ts';
import { createSegmentedControl, type SegmentedControlHandle } from '../../src/web/choice-inputs/segmentedControl.ts';
import { createSwitch } from '../../src/web/choice-inputs/switch.ts';
import { createCard } from '../../src/web/data-display/card.ts';
import { createForecastStrip, type ForecastReading } from '../../src/web/data-display/forecastStrip.ts';
import { createStatTile, createTile, createTileGrid } from '../../src/web/data-display/tiles.ts';
import { h } from '../../src/web/dom.ts';
import { createText } from '../../src/web/foundations/text.ts';
import { createIcon } from '../../src/web/icons.ts';
import { createAgenda, type AgendaDay } from '../../src/web/home/agenda.ts';
import { createCameraTile } from '../../src/web/home/cameraTile.ts';
import { createControlCard } from '../../src/web/home/controlCard.ts';
import { createLightControl } from '../../src/web/home/lightControl.ts';
import { createLockControl } from '../../src/web/home/lockControl.ts';
import { createMediaPlayer, type MediaPlayerData, type MediaPlayerEvents } from '../../src/web/home/mediaPlayer.ts';
import { createPositionControl } from '../../src/web/home/positionControl.ts';
import { createThermostat } from '../../src/web/home/thermostat.ts';
import { createWeatherNow } from '../../src/web/home/weatherNow.ts';
import { applyTheme } from '../../src/web/theme.ts';

// The landing page: one home dashboard built from the components, re-themed live. Every name and value is invented.

const REPO = 'https://github.com/mosaic-home/mosaic-home-design-system';
const DEPTHS: readonly Depth[] = ['shadow', 'glow', 'flat'];

interface State {
  theme: string;
  accent: AccentName | 'default';
  corners: Corners | '';
  density: Density | '';
  depth: Depth | '';
}

const params = new URLSearchParams(location.search);
const pick = <T extends string>(value: string | null, allowed: readonly T[], fallback: T | ''): T | '' => (allowed.includes(value as T) ? (value as T) : fallback);
const state: State = {
  theme: themeById(params.get('theme') ?? '') ? params.get('theme')! : 'midnight',
  accent: pick(params.get('accent'), ACCENT_NAMES, '') || 'default',
  corners: pick(params.get('corners'), CORNERS, ''),
  density: pick(params.get('density'), DENSITIES, ''),
  depth: pick(params.get('depth'), DEPTHS, ''),
};

function characterOf(s: Pick<State, 'corners' | 'density' | 'depth'>): Partial<Character> {
  const c: Partial<Character> = {};
  if (s.corners) c.corners = s.corners;
  if (s.density) c.density = s.density;
  if (s.depth) c.depth = s.depth;
  if (s.depth === 'glow') c.glow = 1;
  return c;
}

const query = (): string => {
  const q = new URLSearchParams(Object.entries(state).filter(([, v]) => v && v !== 'default'));
  return q.size ? `?${q}` : '';
};

// Themed regions ------------------------------------------------------------------------------------------------
// Each region gets its own theme on its own element, and regions never nest, so a dark sample never sits inside a
// light page (component CSS keys on the nearest `data-mh-mode` ancestor and would pick up the outer one).

interface Region {
  el: HTMLElement;
  /** Follows the page state as it is (the page's own chrome), rather than a fixed sample. */
  page: boolean;
  /** Theme, accent and character for this region, given the page state. */
  resolve(s: State): { theme: string; accent: AccentName | 'default'; character: Partial<Character>; device: DeviceClass };
  onTheme?(tokens: Tokens): void;
}

const regions: Region[] = [];
const narrow = matchMedia('(max-width: 760px)');
const pageDevice = (): DeviceClass => (narrow.matches ? 'phone' : 'tablet');

function region(el: HTMLElement, resolve?: Region['resolve'], onTheme?: Region['onTheme']): HTMLElement {
  regions.push({ el, page: !resolve, resolve: resolve ?? ((s) => ({ theme: s.theme, accent: s.accent, character: characterOf(s), device: pageDevice() })), onTheme });
  return el;
}

let pageTokens!: Tokens;
const listeners: ((tokens: Tokens) => void)[] = [];

function paint(): void {
  for (const r of regions) {
    const { theme, accent, character, device } = r.resolve(state);
    const tokens = applyTheme(theme, { deviceClass: device, character, accent }, r.el);
    for (const [name, value] of Object.entries(homeColorVariables(tokens.theme))) r.el.style.setProperty(name, value);
    r.onTheme?.(tokens);
    if (r.page) pageTokens = tokens;
  }
  document.body.style.background = pageTokens.theme.palette.canvasBottom;
  document.body.style.color = pageTokens.theme.palette.text;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', pageTokens.theme.palette.canvasTop);
  for (const fn of listeners) fn(pageTokens);
}

/** Changes the page state, cross-fading where the browser can. */
function set(patch: Partial<State>, { fromTour = false } = {}): void {
  if (!fromTour) stopTour();
  Object.assign(state, patch);
  history.replaceState(null, '', `${query()}${location.hash}`);
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (doc.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) doc.startViewTransition(paint);
  else paint();
}

// Stand-in pictures, drawn in the theme's own colours ------------------------------------------------------------

const svgUrl = (svg: string): string => `data:image/svg+xml,${encodeURIComponent(svg)}`;
const artUrl = (t: Tokens): string => {
  const s = t.theme.palette.series;
  return svgUrl(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><rect width='120' height='120' fill='${s[0]}'/><circle cx='84' cy='38' r='22' fill='${s[2]}'/><path d='M0 120 L0 82 Q30 62 60 80 T120 72 V120Z' fill='${s[3]}'/></svg>`,
  );
};
const cameraUrl = (t: Tokens): string => {
  const p = t.theme.palette;
  return svgUrl(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90'><rect width='160' height='90' fill='${p.series[3]}'/><rect y='52' width='160' height='38' fill='${p.series[2]}'/><rect x='92' y='22' width='26' height='40' fill='${p.surfaceRaised}'/><path d='M60 90 L92 62 H118 L100 90Z' fill='${p.surface}'/></svg>`,
  );
};

const later = (fn: () => void, ms = 500): void => void setTimeout(fn, ms);

// The dashboard ----------------------------------------------------------------------------------------------------

function thermostatCard(compact = false): HTMLElement {
  const card = createControlCard({ title: 'Living room', icon: mdiThermostat, state: 'Heating to 21°C', active: true, tone: 'heat' });
  const t = createThermostat({
    label: 'Living room thermostat',
    compact,
    current: 19.5,
    target: 21,
    mode: 'heat',
    action: 'heating',
    modes: compact ? undefined : [{ value: 'off', label: 'Off' }, { value: 'heat', label: 'Heat' }, { value: 'cool', label: 'Cool' }, { value: 'heat_cool', label: 'Auto' }],
    onTarget: (value) =>
      later(() => {
        if (typeof value !== 'number') return;
        t.update({ target: value });
        card.update({ state: `Heating to ${value}°C` });
      }),
    onMode: (mode) => later(() => t.update({ mode, action: mode === 'off' ? 'off' : 'idle' })),
  });
  card.update({ body: t.el });
  return card.el;
}

function lampCard(withSlider: boolean): HTMLElement {
  let on = true;
  let level = 70;
  const stateText = (): string => (on ? `On · ${level}%` : 'Off');
  const card = createControlCard({ title: 'Reading lamp', icon: mdiFloorLamp, state: stateText(), active: on, tone: 'warm' });
  if (withSlider) {
    const light = createLightControl({
      label: 'Reading lamp',
      on,
      brightness: level,
      colorTemp: { value: 2700, min: 2000, max: 6500 },
      onToggle: (next) =>
        later(() => {
          on = next;
          light.update({ on, brightness: on ? level : null });
          card.update({ active: on, state: stateText() });
        }),
      onBrightness: (b) =>
        later(() => {
          level = b;
          light.update({ brightness: b });
          card.update({ state: stateText() });
        }),
      onColorTemp: (value) => later(() => light.update({ colorTemp: { value, min: 2000, max: 6500 } })),
    });
    card.update({ body: light.el });
  } else {
    const toggle = createSwitch({
      ariaLabel: 'Reading lamp power',
      checked: on,
      onChange: (checked) => {
        card.update({ loading: true });
        later(() => {
          on = checked;
          card.update({ loading: false, active: on, state: stateText() });
        });
      },
    });
    card.update({ control: toggle.el });
  }
  return card.el;
}

function blindCard(): HTMLElement {
  let position = 60;
  let timer: ReturnType<typeof setInterval> | undefined;
  const card = createControlCard({ title: 'Studio blind', icon: mdiBlindsHorizontal, state: '60% open' });
  const go = (to: number): void => {
    clearInterval(timer);
    if (to === position) return;
    cover.update({ state: to > position ? 'opening' : 'closing' });
    timer = setInterval(() => {
      position += Math.sign(to - position) * Math.min(10, Math.abs(to - position));
      card.update({ state: position === 0 ? 'Closed' : position === 100 ? 'Open' : `${position}% open` });
      if (position === to) {
        clearInterval(timer);
        cover.update({ position, state: position === 100 ? 'open' : position === 0 ? 'closed' : 'stopped' });
      } else cover.update({ position });
    }, 300);
  };
  const cover = createPositionControl({
    label: 'Studio blind',
    state: 'stopped',
    position,
    can: { open: true, close: true, stop: true, position: true },
    labels: { open: 'Raise', close: 'Lower' },
    onOpen: () => go(100),
    onClose: () => go(0),
    onStop: () => {
      clearInterval(timer);
      cover.update({ state: 'stopped' });
    },
    onPosition: go,
  });
  card.update({ body: cover.el });
  return card.el;
}

function lockCard(): HTMLElement {
  const card = createControlCard({ title: 'Front door', icon: 'lock', state: 'Locked' });
  const lock = createLockControl({
    label: 'Front door',
    state: 'locked',
    confirm: true,
    onLock: () => {
      lock.update({ state: 'locking' });
      later(() => (lock.update({ state: 'locked' }), card.update({ state: 'Locked' })), 1100);
    },
    onUnlock: () => {
      lock.update({ state: 'unlocking' });
      later(() => (lock.update({ state: 'unlocked' }), card.update({ state: 'Unlocked' })), 1100);
    },
  });
  card.update({ body: lock.el });
  return card.el;
}

function mediaCard(): HTMLElement {
  let data: MediaPlayerData = {
    title: 'Lanterns Over the Quay',
    subtitle: 'Marlow and the Tidelines',
    art: null,
    state: 'playing',
    position: 83,
    duration: 227,
    volume: 0.45,
    muted: false,
    can: { play: true, pause: true, next: true, previous: true, volume: true, mute: true, seek: true },
  };
  const events: MediaPlayerEvents = {
    onPlay: () => put({ state: 'playing' }),
    onPause: () => put({ state: 'paused' }),
    onNext: () => put({ position: 0 }),
    onPrevious: () => put({ position: 0 }),
    onSeek: (position) => put({ position }),
    onVolume: (volume) => put({ volume, muted: false }),
    onMute: (muted) => put({ muted }),
  };
  const player = createMediaPlayer({ ...data, ...events });
  function put(patch: Partial<MediaPlayerData>): void {
    data = { ...data, ...patch };
    player.update({ ...data, ...events });
  }
  // The position ticks along while it plays.
  setInterval(() => {
    if (data.state === 'playing' && data.position != null && data.duration) put({ position: (data.position + 1) % data.duration });
  }, 1000);
  listeners.push((t) => put({ art: artUrl(t) }));
  return createCard({ title: 'Now playing', icon: 'music', body: player.el }).el;
}

function cameraCard(): HTMLElement {
  const options = { name: 'Garden path', status: 'Motion · 2 min ago', src: null as string | null, action: createIconButton({ icon: 'refresh', label: 'Refresh Garden path', size: 'small' }).el };
  const cam = createCameraTile(options);
  listeners.push((t) => cam.update({ ...options, src: cameraUrl(t) }));
  return createCard({ body: cam.el }).el;
}

const AGENDA: AgendaDay[] = [
  {
    label: 'Today',
    events: [
      { time: null, title: 'Recycling collection', color: 4 },
      { time: '18:00', end: '18:45', title: 'Piano lesson', location: 'Music room', color: 3 },
      { time: '20:00', title: 'Book club', location: 'Living room', color: 1 },
    ],
  },
  { label: 'Tomorrow', events: [{ time: '10:00', end: '11:30', title: 'Boiler service', location: 'Home', color: 2 }] },
];

const TEMPERATURE = [19.2, 19.0, 18.8, 18.9, 19.4, 20.1, 20.8, 21.3, 21.6, 21.4, 21.9, 22.3, 22.1, 21.7, 21.5];
const POWER = [120, 340, 280, 90, 60, 75, 410, 520, 380, 210, 260, 230];
const WEEK: ForecastReading[] = [
  { label: 'Today', condition: 'partly-cloudy', value: 16, low: 9, sub: '10%' },
  { label: 'Thu', condition: 'rain', value: 14, low: 8, sub: '80%' },
  { label: 'Fri', condition: 'pouring', value: 12, low: 7, sub: '95%' },
  { label: 'Sat', condition: 'cloudy', value: 13, low: 6 },
  { label: 'Sun', condition: 'clear', value: 17, low: 7 },
  { label: 'Mon', condition: 'lightning-rain', value: 19, low: 11, sub: '60%' },
  { label: 'Tue', condition: 'partly-cloudy', value: 15, low: 8 },
];

function dashboard(): HTMLElement {
  const area = (name: string, ...children: HTMLElement[]): HTMLElement => h('div', { class: `sc-dash__${name}` }, ...children);
  const hello = h(
    'div',
    { class: 'sc-hello' },
    createText('Good evening', { variant: 'headline', as: 'h2' }),
    createText('3 lights on · doors locked · 21.5° inside', { tone: 'muted' }),
  );
  const tiles = createTileGrid(
    [
      createTile({ icon: 'lightbulb', iconOn: 'lightbulb-on', label: 'Kitchen', state: 'On', on: true }).el,
      createTile({ icon: 'lightbulb', iconOn: 'lightbulb-on', label: 'Hallway', state: 'Off', on: false }).el,
      createTile({ icon: 'fan', label: 'Bedroom fan', state: 'Speed 2', on: true }).el,
      createTile({ icon: 'music', label: 'Speaker', state: 'Kitchen', on: false }).el,
    ],
    { label: 'Quick toggles' },
  ).el;
  return h(
    'div',
    { class: 'sc-dash' },
    area('hello', hello),
    area('weather', createCard({ body: createWeatherNow({ condition: 'partly-cloudy', temperature: 14.4, place: 'Outside', detail: 'Feels 12° · 10% rain' }).el }).el),
    area('climate', thermostatCard()),
    area('lamp', lampCard(true)),
    area('blind', blindCard()),
    area('lock', lockCard()),
    area('media', mediaCard(), tiles),
    area('camera', cameraCard()),
    area('agenda', createCard({ title: 'Calendar', icon: 'calendar', body: createAgenda({ days: AGENDA }).el }).el),
    area(
      'trends',
      createCard({
        title: 'Living room',
        icon: 'thermometer',
        body: [
          createTrend({ name: 'Temperature', value: 21.5, unit: '°C', values: TEMPERATURE, format: (v) => v.toFixed(1) }).el,
          createTrend({ name: 'Power', value: 230, unit: 'W', values: POWER, color: 2 }).el,
        ],
      }).el,
    ),
    area('forecast', createCard({ title: 'This week', body: createForecastStrip({ label: 'Next 7 days', readings: WEEK, subName: 'rain' }).el }).el),
  );
}

// The tune bar ------------------------------------------------------------------------------------------------------

function swatch(theme: Theme): HTMLElement {
  const p = theme.palette;
  return h(
    'span',
    { class: 'sc-swatch', 'aria-hidden': 'true', style: `background: linear-gradient(160deg, ${p.canvasTop}, ${p.canvasBottom}); border-color: ${p.outline}` },
    h('span', { style: `background: ${p.surfaceRaised}` }),
    h('span', { style: `background: ${p.accent}` }),
  );
}

function tuneBar(): HTMLElement {
  const themeButtons = THEMES.map((t) => {
    const b = h('button', { type: 'button', class: 'sc-theme-pick', 'aria-pressed': String(state.theme === t.id), onclick: () => set({ theme: t.id }) }, swatch(t), h('span', {}, t.name));
    return [t.id, b] as const;
  });
  const accentWrap = h('div', { class: 'sc-accents', role: 'group', 'aria-label': 'Accent' });
  const renderAccents = (): void => {
    const theme = themeById(state.theme)!;
    accentWrap.replaceChildren(
      ...(['default', ...ACCENT_NAMES] as const).map((a) =>
        h('button', {
          type: 'button',
          class: 'sc-accent',
          title: a === 'default' ? `${theme.name}’s own` : a,
          'aria-label': a === 'default' ? 'Theme accent' : `${a} accent`,
          'aria-pressed': String(state.accent === a),
          style: `--_c: ${a === 'default' ? theme.palette.accent : namedAccent(a, theme)}`,
          onclick: () => set({ accent: a }),
        }),
      ),
    );
  };
  const segment = (label: string, key: 'corners' | 'density' | 'depth', values: readonly string[]): SegmentedControlHandle =>
    createSegmentedControl({
      label,
      size: 'small',
      value: state[key],
      options: [{ value: '', label: 'Theme' }, ...values.map((v) => ({ value: v, label: v[0]!.toUpperCase() + v.slice(1) }))],
      onChange: (value) => set({ [key]: value } as Partial<State>),
    });
  const corners = segment('Corners', 'corners', CORNERS);
  const density = segment('Density', 'density', DENSITIES);
  const depth = segment('Depth', 'depth', DEPTHS);
  const tour = createButton({ label: 'Take the tour', icon: 'play', variant: 'tonal', size: 'small', onClick: () => (touring ? stopTour() : startTour()) });
  tourButton = tour;

  listeners.push(() => {
    for (const [id, b] of themeButtons) b.setAttribute('aria-pressed', String(state.theme === id));
    renderAccents();
    for (const [seg, key] of [[corners, 'corners'], [density, 'density'], [depth, 'depth']] as const) for (const input of seg.inputs) input.checked = input.value === state[key];
  });

  const field = (label: string, control: HTMLElement): HTMLElement => h('div', { class: 'sc-tune__field' }, createText(label, { variant: 'caption', tone: 'muted', as: 'span' }), control);
  return h(
    'div',
    { class: 'sc-tune__inner' },
    field('Theme', h('div', { class: 'sc-theme-picks', role: 'group', 'aria-label': 'Theme' }, ...themeButtons.map(([, b]) => b))),
    field('Accent', accentWrap),
    field('Corners', corners.el),
    field('Density', density.el),
    field('Depth', depth.el),
    h('div', { class: 'sc-tune__end' }, tour.el),
  );
}

// The tour: themes first, then the character axes on one palette. Stops at the first touch.

const TOUR: Partial<State>[] = [
  { theme: 'midnight', accent: 'default', corners: '', density: '', depth: '' },
  { theme: 'daylight' },
  { theme: 'nightstand' },
  { theme: 'contrast' },
  { theme: 'midnight', corners: 'mosaic', density: 'comfortable', depth: 'glow' },
  { corners: 'square', density: 'compact', depth: 'flat' },
  { theme: 'daylight', accent: 'coral', corners: 'pill', density: 'regular', depth: 'shadow' },
  { accent: 'teal', corners: 'crisp' },
  { theme: 'midnight', accent: 'violet', corners: 'round', depth: 'glow' },
];
let touring: ReturnType<typeof setInterval> | undefined;
let tourButton: ReturnType<typeof createButton> | undefined;

function startTour(): void {
  let i = 0;
  set(TOUR[0]!, { fromTour: true });
  touring = setInterval(() => {
    i = (i + 1) % TOUR.length;
    set(TOUR[i]!, { fromTour: true });
  }, 2400);
  tourButton?.setLabel('Stop the tour');
}

function stopTour(): void {
  if (!touring) return;
  clearInterval(touring);
  touring = undefined;
  tourButton?.setLabel('Take the tour');
}

// Comparison strips -----------------------------------------------------------------------------------------------

function sample(): HTMLElement {
  return h(
    'div',
    { class: 'sc-sample' },
    lampCard(false),
    createTileGrid([
      createTile({ icon: 'lightbulb', iconOn: 'lightbulb-on', label: 'Kitchen', state: 'On', on: true }).el,
      createStatTile({ label: 'Inside', icon: 'thermometer', value: '21.5', unit: '°C', trend: 'up' }).el,
    ]).el,
    createTrend({ name: 'Temperature', value: 21.5, unit: '°C', values: TEMPERATURE, format: (v) => v.toFixed(1) }).el,
  );
}

/** A sample panel with a heading and a button that applies it to the page; the sample itself is a picture. */
function comparePanel(title: string, blurb: string, action: string, onPick: () => void): HTMLElement {
  const content = sample();
  content.inert = true;
  return h(
    'div',
    { class: 'sc-panel mh-canvas' },
    h(
      'div',
      { class: 'sc-panel__head' },
      h('div', {}, createText(title, { variant: 'title', as: 'h3' }), createText(blurb, { variant: 'caption', tone: 'muted' })),
      createButton({ label: action, variant: 'secondary', size: 'small', onClick: onPick }).el,
    ),
    content,
  );
}

function themeStrip(): HTMLElement {
  return h(
    'div',
    { class: 'sc-compare sc-compare--themes' },
    ...THEMES.map((t) => {
      const panel = comparePanel(t.name, t.description, `Use ${t.name}`, () => set({ theme: t.id, accent: 'default' }));
      return region(panel, (s) => ({ theme: t.id, accent: 'default', character: characterOf(s), device: 'phone' }));
    }),
  );
}

const CHARACTERS: { name: string; blurb: string; c: Pick<State, 'corners' | 'density' | 'depth'> }[] = [
  { name: 'Square', blurb: 'Sharp corners, compact, flat', c: { corners: 'square', density: 'compact', depth: 'flat' } },
  { name: 'Crisp', blurb: 'Small radii, regular, shadow', c: { corners: 'crisp', density: 'regular', depth: 'shadow' } },
  { name: 'Round', blurb: 'Round controls, comfortable', c: { corners: 'round', density: 'comfortable', depth: 'shadow' } },
  { name: 'Mosaic', blurb: 'Generous radii, pills, glow', c: { corners: 'mosaic', density: 'comfortable', depth: 'glow' } },
];

function characterStrip(): HTMLElement {
  return h(
    'div',
    { class: 'sc-compare sc-compare--characters' },
    ...CHARACTERS.map(({ name, blurb, c }) => {
      const panel = comparePanel(name, blurb, `Use ${name}`, () => set(c));
      return region(panel, (s) => ({ theme: s.theme, accent: s.accent, character: characterOf(c), device: 'phone' }));
    }),
  );
}

const DEVICES: { id: DeviceClass; name: string }[] = [
  { id: 'wearable', name: 'Wearable' },
  { id: 'phone', name: 'Phone' },
  { id: 'tablet', name: 'Tablet' },
];

function deviceStrip(): HTMLElement {
  return h(
    'div',
    { class: 'sc-devices' },
    ...DEVICES.map(({ id, name }) =>
      h(
        'figure',
        { class: `sc-device sc-device--${id}` },
        region(h('div', { class: 'sc-device__screen mh-canvas' }, id === 'wearable' ? thermostatCard(true) : thermostatCard(id === 'phone')), (s) => ({ theme: s.theme, accent: s.accent, character: characterOf(s), device: id })),
        h('figcaption', {}, name),
      ),
    ),
  );
}

// Code samples ------------------------------------------------------------------------------------------------------

const CODE: Record<string, string> = {
  html: `<link rel="stylesheet" href="node_modules/@mosaic-home/design-system/dist/style.css" />
<html data-mh-theme="auto" data-mh-device="tablet">
  <button class="mh-button mh-button--primary">Turn on</button>
</html>`,
  ts: `import '@mosaic-home/design-system/style.css';
import { applyTheme, createButton } from '@mosaic-home/design-system/web';

applyTheme('nightstand', { deviceClass: 'tablet', character: { corners: 'soft' }, accent: 'teal' });
document.body.append(createButton({ label: 'Turn on', icon: 'power', onClick: () => {} }).el);`,
  react: `import '@mosaic-home/design-system/style.css';
import { Button, ThemeProvider } from '@mosaic-home/design-system/react';

<ThemeProvider theme="midnight" deviceClass="phone">
  <Button icon="power">Turn on</Button>
</ThemeProvider>;`,
  tokens: `import { resolveTokens, themeById } from '@mosaic-home/design-system/tokens';

const t = resolveTokens(themeById('daylight')!, 'phone');
t.theme.palette.accent; // '#2f62f5'
t.space.md; // 12`,
};

function codeBlock(): HTMLElement {
  const pre = h('pre', { class: 'sc-code' }, h('code', {}, CODE.html!));
  const tabs = createSegmentedControl({
    label: 'Code sample',
    size: 'small',
    value: 'html',
    options: [
      { value: 'html', label: 'HTML' },
      { value: 'ts', label: 'TypeScript' },
      { value: 'react', label: 'React' },
      { value: 'tokens', label: 'Tokens' },
    ],
    onChange: (v) => pre.replaceChildren(h('code', {}, CODE[v]!)),
  });
  return h('div', { class: 'sc-code-wrap' }, tabs.el, pre);
}

/** A command with a copy button: `caption` says what it is for. */
function commandChip(command: string, caption: string, copyLabel: string): HTMLElement {
  const copy = createIconButton({
    icon: 'copy',
    label: copyLabel,
    size: 'small',
    onClick: () => {
      void navigator.clipboard?.writeText(command).then(() => {
        note.textContent = 'Copied';
        later(() => (note.textContent = ''), 1500);
      });
    },
  });
  const note = h('span', { class: 'sc-install__note', 'aria-live': 'polite' });
  return h('div', { class: 'sc-install' }, h('span', { class: 'sc-install__caption' }, caption), h('code', {}, command), copy.el, note);
}

const GETTING_STARTED = `${REPO}/blob/main/docs/getting-started.md`;

/** The corner ribbon: a stitched band across the top-right corner, in the theme's accent. */
function ribbon(): HTMLElement {
  return h(
    'div',
    { class: 'sc-ribbon' },
    h('a', { class: 'sc-ribbon__band', href: REPO, 'aria-label': 'Open source: the code on GitHub' }, createIcon(mdiSourceFork), h('span', {}, 'Open source on GitHub')),
  );
}

function installChips(): HTMLElement {
  return h(
    'div',
    { class: 'sc-installs' },
    commandChip('npm install @mosaic-home/design-system', 'Install', 'Copy the install command'),
    commandChip('npx skills add mosaic-home/mosaic-home-design-system', 'Agent skill', 'Copy the agent skill command'),
  );
}

// The page ----------------------------------------------------------------------------------------------------------

const link = (href: string, label: string, variant: 'primary' | 'secondary' | 'text', size: 'small' | 'medium' | 'large' = 'large'): HTMLAnchorElement => {
  const a = h('a', { href, class: buttonClass(variant, size) }, h('span', { class: 'mh-button__label' }, label));
  return a;
};
const galleryLink = link('components.html', 'Browse the components', 'primary');
listeners.push(() => galleryLink.setAttribute('href', `components.html${query()}`));

const section = (id: string, eyebrow: string, title: string, lead: string): HTMLElement =>
  region(
    h(
      'header',
      { class: 'sc-section__head', id },
      createText(eyebrow, { variant: 'eyebrow', tone: 'accent' }),
      createText(title, { variant: 'headline', as: 'h2' }),
      createText(lead, { tone: 'muted' }),
    ),
  );

document.body.append(
  region(
    h(
      'header',
      { class: 'sc-hero mh-canvas' },
      ribbon(),
      h(
        'nav',
        { class: 'sc-top', 'aria-label': 'Site' },
        h('span', { class: 'sc-logo' }, h('span', { class: 'sc-logo__mark', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'), h('i')), 'Mosaic Home'),
        h('span', { class: 'sc-top__links' }, link('components.html', 'Components', 'text', 'small'), link('themes.html', 'Theme studio', 'text', 'small'), link(GETTING_STARTED, 'Get started', 'text', 'small'), link(REPO, 'Source', 'text', 'small')),
      ),
      h(
        'div',
        { class: 'sc-hero__text' },
        createText('Open source · MIT', { variant: 'eyebrow', tone: 'accent' }),
        createText('A design system for the screens around your home', { variant: 'display', as: 'h1' }),
        createText('Themes, tokens and components for wall tablets, phones, watches and TVs. Plain CSS and TypeScript, with React bindings. Change the theme below: everything on this page is the real thing.', { tone: 'muted', as: 'p' }),
        h('div', { class: 'sc-hero__actions' }, galleryLink, link(GETTING_STARTED, 'Get started', 'secondary'), link(REPO, 'View the source', 'text')),
        installChips(),
        createText('The agent skill gives AI coding agents every component’s options and examples.', { variant: 'caption', tone: 'muted', as: 'span' }),
      ),
    ),
  ),
  region(h('div', { class: 'sc-tune' }, tuneBar())),
  region(h('main', { class: 'sc-stage mh-canvas', id: 'dashboard', 'aria-label': 'Sample home dashboard' }, dashboard())),
  h(
    'section',
    { class: 'sc-section' },
    section('themes', 'Four themes', 'One set of components, four moods', 'Each theme is a palette tuned for where the screen lives: a dark hallway, a bright kitchen, a bedroom at night, or eyes that need strong contrast. Pick one to apply it, or make your own in the theme studio.'),
    themeStrip(),
    h('p', { class: 'sc-more' }, link('themes.html', 'Make your own theme', 'secondary')),
  ),
  h(
    'section',
    { class: 'sc-section' },
    section('character', 'Character', 'Same palette, a different feel', 'Corners, density, depth and outlines are a theme’s character, separate from its colours. Components read them from the theme, so one palette can be sharp and dense or soft and roomy.'),
    characterStrip(),
  ),
  h(
    'section',
    { class: 'sc-section' },
    section('devices', 'Device classes', 'Sized for the screen it is on', 'Wearable, phone, tablet and TV each get their own type scale, spacing, radii and touch targets, from the same theme. Here is one thermostat on three of them.'),
    deviceStrip(),
  ),
  h(
    'section',
    { class: 'sc-section' },
    section('use', 'Use it', 'No framework required', 'Components are plain DOM with public mh-* classes. The React bindings render exactly the same markup, and the tokens work anywhere, without a DOM.'),
    region(h('div', { class: 'sc-use' }, codeBlock())),
  ),
  region(
    h(
      'footer',
      { class: 'sc-footer' },
      createText('Mosaic Home design system · MIT licence · Icons from Material Design Icons (Apache-2.0)', { variant: 'caption', tone: 'muted' }),
      h('span', { class: 'sc-top__links' }, link('components.html', 'Components', 'text', 'small'), link('themes.html', 'Theme studio', 'text', 'small'), link(REPO, 'Source', 'text', 'small')),
    ),
  ),
);

narrow.addEventListener('change', paint);
paint();
if (params.has('tour')) startTour();
