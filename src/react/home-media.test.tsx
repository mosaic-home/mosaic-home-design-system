import { act, type ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createAgenda, createCameraTile, createForecastStrip, createMediaPlayer, createWeatherNow, type AgendaDay, type ForecastReading, type MediaPlayerData } from '../web/index.ts';
import { Agenda, CameraTile, ForecastStrip, MediaPlayer, WeatherNow } from './index.ts';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** Tag, classes, role, ARIA, `hidden`, `tabindex` and own text of every element, in document order. */
function shape(root: Element): string[] {
  const out: string[] = [];
  const walk = (el: Element): void => {
    const attrs = Array.from(el.attributes)
      .filter((a) => a.name === 'class' || a.name === 'role' || a.name === 'hidden' || a.name === 'tabindex' || a.name === 'referrerpolicy' || a.name.startsWith('aria-') || a.name === 'd')
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
  // React 19 hoists a preload <link> for images; skip it.
  return div.querySelector(':scope > :not(link)')!;
}

const ALL = { play: true, pause: true, stop: true, next: true, previous: true, volume: true, mute: true, seek: true };

describe('home parity', () => {
  it('MediaPlayer', () => {
    const cases: MediaPlayerData[] = [
      { title: 'Song', subtitle: 'Band', art: 'https://example.com/a.jpg', state: 'playing', position: 83, duration: 227, volume: 0.45, muted: false, can: ALL },
      { title: 'Show', state: 'paused', position: 10, duration: 60, volume: null, muted: true, can: { play: true, volume: true, mute: true } },
      { state: 'off', can: { play: true }, labels: { empty: 'Nichts' } },
      { title: 'Radio', state: 'buffering', can: { play: true, stop: true } },
      { title: 'Song', art: 'https://example.com/a.jpg', artLayout: 'banner', state: 'playing', position: 83, duration: 227, can: ALL },
      { title: 'Film', art: 'https://example.com/b.jpg', artLayout: 'banner', artShape: 'wide', state: 'paused', can: { play: true } },
      { title: 'Song', art: 'https://example.com/a.jpg', artLayout: 'banner', state: 'idle', can: { play: true } },
      { title: 'Song', art: null, artLayout: 'banner', state: 'playing', can: { pause: true } },
    ];
    for (const c of cases) expect(shape(react(<MediaPlayer {...c} />))).toEqual(shape(createMediaPlayer(c).el));
  });

  it('CameraTile', () => {
    expect(shape(react(<CameraTile src="https://cam.example/a.jpg" name="Porch" status="Motion" action={<button>Go</button>} />))).toEqual(
      shape(createCameraTile({ src: 'https://cam.example/a.jpg', name: 'Porch', status: 'Motion', action: Object.assign(document.createElement('button'), { textContent: 'Go' }) }).el),
    );
    expect(shape(react(<CameraTile src={null} name="Garage" />))).toEqual(shape(createCameraTile({ src: null, name: 'Garage' }).el));
    const open = (): void => {};
    expect(shape(react(<CameraTile src="https://cam.example/b.jpg" name="Gate" caption={false} onOpen={open} updated />))).toEqual(
      shape(createCameraTile({ src: 'https://cam.example/b.jpg', name: 'Gate', caption: false, onOpen: open, updated: true }).el),
    );
  });

  it('WeatherNow', () => {
    const a = { condition: 'rain' as const, temperature: 9, text: 'Light rain', detail: 'Feels 6°', place: 'Hillside' };
    expect(shape(react(<WeatherNow {...a} />))).toEqual(shape(createWeatherNow(a).el));
    expect(shape(react(<WeatherNow condition={null} temperature={null} />))).toEqual(shape(createWeatherNow({ condition: null, temperature: null }).el));
  });

  it('Agenda', () => {
    const days: AgendaDay[] = [
      { label: 'Today', events: [{ time: '09:00', end: '10:00', title: 'Standup', color: 2 }, { time: null, title: 'Bin day', color: 4 }, { time: '18:00', title: 'Piano', location: 'Music room' }] },
      { label: 'Fri', events: [{ time: null, title: 'Holiday' }] },
    ];
    expect(shape(react(<Agenda days={days} />))).toEqual(shape(createAgenda({ days }).el));
    expect(shape(react(<Agenda days={days} max={2} headingLevel={4} />))).toEqual(shape(createAgenda({ days, max: 2, headingLevel: 4 }).el));
    expect(shape(react(<Agenda days={[]} empty="Free" />))).toEqual(shape(createAgenda({ days: [], empty: 'Free' }).el));
  });

  it('ForecastStrip', () => {
    const readings: ForecastReading[] = [
      { label: 'Wed', condition: 'rain', value: 15, low: 9, sub: '80%' },
      { label: 'Thu', condition: null, conditionText: 'Bright spells', value: null, state: 'outside' },
    ];
    expect(shape(react(<ForecastStrip label="Week" readings={readings} subName="rain" />))).toEqual(shape(createForecastStrip({ label: 'Week', readings, subName: 'rain' }).el));
    expect(shape(react(<ForecastStrip label="Hours" readings={readings} variant="hours" unit="°C" />))).toEqual(
      shape(createForecastStrip({ label: 'Hours', readings, variant: 'hours', unit: '°C' }).el),
    );
  });
});

describe('MediaPlayer behaviour', () => {
  it('fires transport events and commits volume on release', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    const seen: (string | number | boolean)[] = [];
    const render = (volume: number) =>
      root.render(
        <MediaPlayer
          title="Song"
          state="paused"
          volume={volume}
          muted={false}
          can={{ play: true, volume: true, mute: true }}
          onPlay={() => seen.push('play')}
          onVolume={(v) => seen.push(v)}
          onMute={(m) => seen.push(m)}
        />,
      );
    await act(async () => render(0.2));
    await act(async () => host.querySelector<HTMLButtonElement>('.mh-media-player__main')!.click());
    await act(async () => host.querySelector<HTMLButtonElement>('.mh-media-player__mute')!.click());
    const level = host.querySelector<HTMLInputElement>('.mh-media-player__level input')!;
    expect(level.value).toBe('20');
    await act(async () => {
      level.value = '65';
      level.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(seen).toEqual(['play', true, 0.65]);
    // Until the data catches up, the slider stays where it was let go.
    expect(level.value).toBe('65');
    await act(async () => render(0.65));
    expect(level.value).toBe('65');
    await act(async () => root.unmount());
    host.remove();
  });
  it('shows banner art while playing and falls back to the thumb when it fails to load', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    await act(async () => root.render(<MediaPlayer title="Song" art="https://example.com/a.jpg" artLayout="banner" state="playing" />));
    const el = host.querySelector('.mh-media-player')!;
    expect(el.className).toBe('mh-media-player is-playing has-banner');
    expect(el.firstElementChild!.className).toBe('mh-media-player__banner is-square');
    expect(el.querySelector('.mh-media-player__art')).toBeNull();
    await act(async () => {
      el.querySelector('.mh-media-player__banner-image')!.dispatchEvent(new Event('error'));
    });
    expect(el.className).toBe('mh-media-player is-playing');
    expect(el.querySelector('.mh-media-player__banner')).toBeNull();
    expect(el.querySelector('.mh-media-player__art')!.className).toBe('mh-media-player__art is-empty');
    await act(async () => root.unmount());
    host.remove();
  });
});
