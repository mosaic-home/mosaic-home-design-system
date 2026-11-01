import { mdiPlay, mdiSprinklerVariant, mdiStop, mdiWeatherRainy } from '@mdi/js';
import { createButton } from '../../actions/button.ts';
import { createIconButton, type IconButtonHandle } from '../../actions/iconButton.ts';
import { createSwitch } from '../../choice-inputs/switch.ts';
import { cx, h } from '../../dom.ts';
import { createIcon, type IconName } from '../../icons.ts';
import { createProgressBar } from '../../feedback/progress.ts';
import { syncChildren } from '../children.ts';
import { createControlCard } from '../controlCard.ts';
import { formatApplianceTime } from './applianceCycle.ts';

export interface IrrigationZone {
  id: string;
  name: string;
  /** Run time in minutes. */
  duration: number;
  disabled?: boolean;
}

/** The zone watering now. */
export interface IrrigationRun {
  zone: string;
  /** Seconds left. */
  remaining: number;
  /** Seconds in total (default the zone's duration). */
  duration?: number;
}

/** Every visible or spoken word, for translation. */
export interface IrrigationZonesLabels {
  /** "Watering Lawn". */
  watering(zone: string): string;
  /** "6 min left". */
  left(time: string): string;
  /** "Next run Tomorrow 06:00". */
  next(when: string): string;
  skipped: string;
  idle: string;
  /** "Run Lawn". */
  run(zone: string): string;
  stop: string;
  rainSkip: string;
  zones: string;
  progress: string;
  /** "10 min". */
  minutes(n: number): string;
}

export const IRRIGATION_ZONES_LABELS: IrrigationZonesLabels = {
  watering: (zone) => `Watering ${zone}`,
  left: (time) => `${time} left`,
  next: (when) => `Next run ${when}`,
  skipped: 'Next run skipped for rain',
  idle: 'No run planned',
  run: (zone) => `Run ${zone}`,
  stop: 'Stop',
  rainSkip: 'Skip for rain',
  zones: 'Zones',
  progress: 'Progress',
  minutes: (n) => `${n} min`,
};

export interface IrrigationZonesOptions {
  /** The system's name ("Garden"); also the card's accessible name. */
  name: string;
  icon?: IconName | string;
  zones: readonly IrrigationZone[];
  running?: IrrigationRun | null;
  /** The next planned run, as the app formats it ("Tomorrow 06:00"). */
  nextRun?: string | null;
  /** The next run is skipped because of rain. */
  rainSkip?: boolean;
  /** Why, or the forecast, under the switch ("8 mm expected tonight"). */
  rainNote?: string;
  labels?: Partial<IrrigationZonesLabels>;
  unavailable?: boolean;
  /** Start one zone now (a running zone stops first). */
  onRun?: (id: string) => void;
  onStop?: () => void;
  /** Shows the rain switch. */
  onRainSkip?: (skip: boolean) => void;
}

export interface IrrigationZonesHandle {
  el: HTMLDivElement;
  update(changes: Partial<IrrigationZonesOptions>): void;
}

/** The state line: what runs now, else when the next run is (or that it is skipped). */
export function irrigationStateText(o: Pick<IrrigationZonesOptions, 'zones' | 'running' | 'nextRun' | 'rainSkip'>, l: IrrigationZonesLabels): string {
  const zone = o.running ? o.zones.find((z) => z.id === o.running!.zone) : undefined;
  if (o.running && zone) return `${l.watering(zone.name)} · ${l.left(formatApplianceTime(o.running.remaining))}`;
  if (o.rainSkip) return l.skipped;
  if (o.nextRun) return l.next(o.nextRun);
  return l.idle;
}

/** Percent of the running zone done, 0 to 100; null when nothing runs. */
export function irrigationProgress(o: Pick<IrrigationZonesOptions, 'zones' | 'running'>): number | null {
  if (!o.running) return null;
  const zone = o.zones.find((z) => z.id === o.running!.zone);
  const total = o.running.duration ?? (zone ? zone.duration * 60 : 0);
  if (!(total > 0)) return null;
  return Math.round(Math.max(0, Math.min(100, (1 - o.running.remaining / total) * 100)) * 10) / 10;
}

export function irrigationZonesClass(o: Pick<IrrigationZonesOptions, 'running' | 'rainSkip'>): string {
  return cx('mh-irrigation-zones', o.running && 'is-running', o.rainSkip && 'is-skipping');
}

export function irrigationZoneClass(running: boolean, disabled: boolean): string {
  return cx('mh-irrigation-zones__zone', running && 'is-running', disabled && 'is-disabled');
}

export const IRRIGATION_ICON = mdiSprinklerVariant;
export const IRRIGATION_RAIN_ICON = mdiWeatherRainy;
export const IRRIGATION_STOP_ICON = mdiStop;

/**
 * `.mh-irrigation-zones` (on a `.mh-control-card` frame, lit in the cool colour while watering): the state line
 * (running zone and time left, or the next run), `__now` with the running zone's progress and a stop button,
 * a rain switch (`__rain`, with the note as its description) and `__zones`, one row per zone with its run time and
 * a run (or stop) button. States `.is-running`, `.is-skipping`.
 */
export function createIrrigationZones(options: IrrigationZonesOptions): IrrigationZonesHandle {
  let o: IrrigationZonesOptions = { ...options };
  const card = createControlCard({ title: o.name, icon: o.icon ?? IRRIGATION_ICON });
  const body = h('div', { class: 'mh-irrigation-zones__body' });
  const list = h('ul', { class: 'mh-irrigation-zones__zones' });
  const stop = createButton({ label: '', icon: IRRIGATION_STOP_ICON, variant: 'secondary', size: 'small', onClick: () => o.onStop?.() });
  stop.el.classList.add('mh-irrigation-zones__stop');
  const nowName = h('span', { class: 'mh-irrigation-zones__now-name' });
  const nowLeft = h('span', { class: 'mh-irrigation-zones__now-left' });
  let bar: ReturnType<typeof createProgressBar> | null = null;
  let barLabel = '';
  const now = h('div', { class: 'mh-irrigation-zones__now' }, h('span', { class: 'mh-irrigation-zones__now-icon' }, createIcon(IRRIGATION_ICON)), h('span', { class: 'mh-irrigation-zones__now-text' }, nowName, nowLeft), stop.el);
  const rows = new Map<string, { li: HTMLLIElement; name: HTMLElement; time: HTMLElement; button: IconButtonHandle }>();
  let rain: ReturnType<typeof createSwitch> | null = null;
  let rainKey = '';

  const render = (): void => {
    const l = { ...IRRIGATION_ZONES_LABELS, ...o.labels };
    const parts: HTMLElement[] = [];
    const runZone = o.running ? o.zones.find((z) => z.id === o.running!.zone) : undefined;
    const off = !!o.unavailable;

    if (o.running && runZone) {
      const left = l.left(formatApplianceTime(o.running.remaining));
      if (!bar || barLabel !== l.progress) {
        bar?.el.remove();
        barLabel = l.progress;
        bar = createProgressBar({ label: l.progress, size: 'small' });
        now.append(bar.el);
      }
      bar.setValue(irrigationProgress(o), left);
      bar.el.classList.add('mh-irrigation-zones__progress');
      nowName.textContent = runZone.name;
      nowLeft.textContent = left;
      stop.setLabel(l.stop);
      stop.setDisabled(off);
      parts.push(now);
    }

    if (o.onRainSkip) {
      const key = JSON.stringify([l.rainSkip, o.rainNote ?? '']);
      if (!rain || key !== rainKey) {
        rainKey = key;
        rain = createSwitch({ label: l.rainSkip, description: o.rainNote, row: true, icon: IRRIGATION_RAIN_ICON, onChange: (skip) => o.onRainSkip?.(skip) });
        rain.el.classList.add('mh-irrigation-zones__rain');
      }
      rain.setChecked(!!o.rainSkip);
      rain.setDisabled(off);
      parts.push(rain.el);
    }

    list.setAttribute('aria-label', l.zones);
    for (const [id, row] of rows) {
      if (o.zones.some((z) => z.id === id)) continue;
      row.li.remove();
      rows.delete(id);
    }
    const lis = o.zones.map((z) => {
      let row = rows.get(z.id);
      if (!row) {
        const name = h('span', { class: 'mh-irrigation-zones__zone-name' });
        const time = h('span', { class: 'mh-irrigation-zones__zone-time' });
        const button = createIconButton({
          icon: mdiPlay,
          label: '',
          onClick: () => {
            if (o.running?.zone === z.id) o.onStop?.();
            else o.onRun?.(z.id);
          },
        });
        button.el.classList.add('mh-irrigation-zones__run');
        row = { li: h('li', {}, h('span', { class: 'mh-irrigation-zones__zone-text' }, name, time), button.el), name, time, button };
        rows.set(z.id, row);
      }
      const running = o.running?.zone === z.id;
      row.li.className = irrigationZoneClass(running, !!z.disabled);
      row.name.textContent = z.name;
      row.time.textContent = l.minutes(z.duration);
      const label = running ? `${l.stop} ${z.name}` : l.run(z.name);
      row.button.setIcon(running ? IRRIGATION_STOP_ICON : mdiPlay);
      row.button.el.setAttribute('aria-label', label);
      row.button.el.title = label;
      row.button.setDisabled(off || (!running && !!z.disabled));
      return row.li;
    });
    syncChildren(list, lis);
    if (lis.length) parts.push(list);
    syncChildren(body, parts);

    card.update({
      title: o.name,
      icon: o.icon ?? IRRIGATION_ICON,
      state: irrigationStateText(o, l),
      active: !!runZone,
      tone: 'cool',
      unavailable: o.unavailable,
      body: parts.length ? body : null,
    });
    card.el.classList.add(...irrigationZonesClass(o).split(' '));
  };
  render();

  return {
    el: card.el,
    update(changes) {
      o = { ...o, ...changes };
      render();
    },
  };
}
