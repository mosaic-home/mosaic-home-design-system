import { h } from '../../../src/web/dom.ts';
import { createIconButton } from '../../../src/web/actions/iconButton.ts';
import { createCard } from '../../../src/web/data-display/card.ts';
import { createText } from '../../../src/web/foundations/text.ts';
import { createIcon } from '../../../src/web/icons.ts';
import { createAgenda, type AgendaDay } from '../../../src/web/home/agenda.ts';
import { createCameraTile } from '../../../src/web/home/cameraTile.ts';
import { createMediaPlayer, type MediaPlayerCan, type MediaPlayerData, type MediaPlayerEvents } from '../../../src/web/home/mediaPlayer.ts';
import { weatherConditionFromText, weatherIcon, weatherIconClass } from '../../../src/web/home/weather.ts';
import { createWeatherNow } from '../../../src/web/home/weatherNow.ts';
import type { Tokens } from '../../../src/tokens/types.ts';
import type { Story } from './types.ts';
import { homeControlStories } from './home-controls.ts';
import { homeClimateEnergyStories } from './home-climate-energy.ts';
import { homeSecurityStories } from './home-security.ts';
import { homeRoomsStories } from './home-rooms.ts';
import { homeMediaVoiceStories } from './home-media-voice.ts';
import { homeInfoStories } from './home-info.ts';

// Media player, camera tile, weather now, agenda ---------------------------------------------------------------

const mhStack = (...children: Node[]): HTMLElement => h('div', { class: 'ex-stack' }, ...children);
const mhGrid = (...children: Node[]): HTMLElement => h('div', { class: 'mh-grid' }, ...children);
const mhCaption = (text: string): HTMLElement => createText(text, { variant: 'label', tone: 'muted' });
const inCard = (body: HTMLElement, title?: string): HTMLElement => createCard({ title, body }).el;
const svgUrl = (svg: string): string => `data:image/svg+xml,${encodeURIComponent(svg)}`;

/** Stand-in album art in the theme's series colours, so the stories need no image files. */
const artUrl = (tokens: Tokens, a: number, b: number): string => {
  const s = tokens.theme.palette.series;
  return svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><rect width='120' height='120' fill='${s[a]}'/><circle cx='60' cy='60' r='28' fill='${s[b]}'/></svg>`);
};

/** An invented camera view: a path up to a door, in the theme's colours. */
const cameraUrl = (tokens: Tokens): string => {
  const p = tokens.theme.palette;
  return svgUrl(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90'><rect width='160' height='90' fill='${p.series[3]}'/><rect y='52' width='160' height='38' fill='${p.series[2]}'/><rect x='92' y='22' width='26' height='40' fill='${p.surfaceRaised}'/><path d='M60 90 L92 62 H118 L100 90Z' fill='${p.surface}'/></svg>`,
  );
};

/** A media player wired to itself, so its buttons and sliders do something here. */
function livePlayer(start: MediaPlayerData): HTMLElement {
  let data: MediaPlayerData = start;
  const set = (patch: Partial<MediaPlayerData>): void => {
    data = { ...data, ...patch };
    player.update({ ...data, ...events });
  };
  const events: MediaPlayerEvents = {
    onPlay: () => set({ state: 'playing' }),
    onPause: () => set({ state: 'paused' }),
    onStop: () => set({ state: 'idle', position: null }),
    onNext: () => set({ position: 0 }),
    onPrevious: () => set({ position: 0 }),
    onSeek: (position) => set({ position }),
    onVolume: (volume) => set({ volume, muted: false }),
    onMute: (muted) => set({ muted }),
  };
  const player = createMediaPlayer({ ...start, ...events });
  return player.el;
}

const ALL: MediaPlayerCan = { play: true, pause: true, stop: true, next: true, previous: true, volume: true, mute: true, seek: true };
const CONDITION_SAMPLES = ['Light rain showers', 'Mostly sunny', 'Thunderstorms', 'Overcast', 'Mist', 'Sleet showers', 'Gale-force winds', 'Clear night'];

const homeMediaStories: Story[] = [
  {
    id: 'media-player',
    render: (tokens) =>
      mhStack(
        mhCaption('Playing, with art, every control, a seekable position and volume (the buttons work here)'),
        inCard(
          livePlayer({
            title: 'Lanterns Over the Quay',
            subtitle: 'Marlow and the Tidelines',
            art: artUrl(tokens, 0, 3),
            state: 'playing',
            position: 83,
            duration: 227,
            volume: 0.45,
            muted: false,
            can: ALL,
          }),
        ),
        mhCaption('Banner art: a square cover centred over a blurred copy of itself'),
        inCard(
          livePlayer({
            title: 'Lanterns Over the Quay',
            subtitle: 'Marlow and the Tidelines',
            art: artUrl(tokens, 0, 3),
            artLayout: 'banner',
            state: 'playing',
            position: 83,
            duration: 227,
            volume: 0.45,
            muted: false,
            can: ALL,
          }),
        ),
        mhCaption('Banner art: a wide still filling the banner, paused'),
        inCard(
          livePlayer({
            title: 'The Harbour Light, Part Two',
            subtitle: 'Season 1',
            art: cameraUrl(tokens),
            artLayout: 'banner',
            artShape: 'wide',
            state: 'paused',
            position: 1460,
            duration: 3125,
            can: ALL,
          }),
        ),
        mhCaption('Paused, no art (the placeholder), a progress line it can’t seek, volume only'),
        inCard(
          livePlayer({
            title: 'Episode 12: The Long Winter Garden',
            subtitle: 'Seed and Soil Hour',
            art: null,
            state: 'paused',
            position: 1460,
            duration: 3125,
            volume: 0.3,
            can: { play: true, pause: true, volume: true },
          }),
        ),
        mhCaption('Radio: buffering, no duration; play and stop, mute only, muted'),
        inCard(livePlayer({ title: 'Evening Jazz Hour', subtitle: 'Willowmere Radio', art: artUrl(tokens, 4, 1), state: 'buffering', muted: true, can: { play: true, stop: true, mute: true } })),
        mhCaption('Off: nothing playing, only play allowed'),
        inCard(livePlayer({ state: 'off', can: { play: true } })),
      ),
  },
  {
    id: 'camera-tile',
    render: (tokens) =>
      mhGrid(
        inCard(
          createCameraTile({
            src: cameraUrl(tokens),
            name: 'Front door',
            status: 'Motion · 2 min ago',
            refreshEvery: 10,
            action: createIconButton({ icon: 'refresh', label: 'Refresh Front door', size: 'small' }).el,
          }).el,
        ),
        inCard(createCameraTile({ src: cameraUrl(tokens), name: 'Garden', status: 'Square picture', aspect: 1 }).el),
        inCard(createCameraTile({ src: null, name: 'Garage', status: 'Offline' }).el),
        inCard(createCameraTile({ src: 'data:image/png;base64,broken', name: 'Side gate', status: 'The picture failed to load' }).el),
      ),
  },
  {
    id: 'weather-now',
    render: () =>
      mhStack(
        mhGrid(
          inCard(createWeatherNow({ condition: 'partly-cloudy', temperature: 14.4, place: 'Hillside', detail: 'Feels 12° · 10% rain' }).el),
          inCard(createWeatherNow({ condition: 'rain', temperature: 9, text: 'Light rain showers', detail: 'Feels 6° · 80% rain', place: 'Hillside' }).el),
          inCard(createWeatherNow({ condition: 'clear-night', temperature: 3, unit: '°C', detail: 'Wind 12 km/h' }).el),
          inCard(createWeatherNow({ condition: 'lightning-rain', temperature: 21, detail: 'Gusts to 60 km/h' }).el),
          inCard(createWeatherNow({ condition: null, temperature: null, detail: 'No reading yet' }).el),
        ),
        mhCaption('weatherConditionFromText maps a source’s own words to the vocabulary'),
        mhGrid(
          ...CONDITION_SAMPLES.map((text) => {
            const condition = weatherConditionFromText(text);
            return h(
              'div',
              { class: 'ex-row' },
              createIcon(weatherIcon(condition), { class: weatherIconClass(condition) }),
              createText(`${text} → ${condition ?? 'unknown'}`, { variant: 'label' }),
            );
          }),
        ),
      ),
  },
  {
    id: 'agenda',
    render: () => {
      const days: AgendaDay[] = [
        {
          label: 'Today',
          events: [
            { time: '08:30', end: '09:00', title: 'School run', color: 2 },
            { time: null, title: 'Bin day', color: 4 },
            { time: '12:15', end: '13:00', title: 'Lunch with Robin', location: 'Bramblewick Café', color: 1 },
            { time: '18:00', title: 'Piano lesson', location: 'Music room, 2 Elm Row', color: 3 },
          ],
        },
        {
          label: 'Thu 17 Oct',
          events: [
            { time: null, title: 'Grandma’s birthday', color: 5 },
            { time: null, title: 'Half term', color: 6 },
            { time: '10:00', end: '11:30', title: 'Boiler service', location: 'Home' },
          ],
        },
        { label: 'Fri 18 Oct', events: [{ time: '19:30', end: '22:00', title: 'Quiz night', location: 'Lantern Hall', color: 1 }] },
      ];
      return mhGrid(
        inCard(createAgenda({ days }).el, 'Family calendar'),
        inCard(createAgenda({ days, max: 4 }).el, 'Cut to four events'),
        inCard(createAgenda({ days: [{ label: 'Today', events: [] }] }).el, 'Nothing planned'),
      );
    },
  },
];

export const homeStories: Story[] = [
  ...homeMediaStories,
  ...homeControlStories,
  ...homeClimateEnergyStories,
  ...homeSecurityStories,
  ...homeRoomsStories,
  ...homeMediaVoiceStories,
  ...homeInfoStories,
];
