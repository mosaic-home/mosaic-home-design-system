import { mdiLightbulbOutline, mdiSofaOutline, mdiWindowOpenVariant } from '@mdi/js';
import { cx, h } from '../../dom.ts';
import { createIcon, type IconName } from '../../icons.ts';
import { syncChildren } from '../children.ts';
import { createControlCard, type ControlCardTone } from '../controlCard.ts';

/** A quick toggle on a room card (the ceiling light, the fan, the blinds). */
export interface RoomToggle {
  id: string;
  /** Short visible label ("Lights", "Fan"). */
  label: string;
  icon: IconName | string;
  on: boolean;
  /** Colour while on (default `warm`, a lit light). */
  tone?: ControlCardTone;
  disabled?: boolean;
}

/** Every visible word, for translation. Counts are passed to functions so plurals can be right. */
export interface RoomCardLabels {
  /** "2 of 5 lights on"; `total` is null when unknown. */
  lights(on: number, total: number | null): string;
  /** "1 window open". */
  open(count: number): string;
  /** "48% humidity". */
  humidity(percent: number): string;
}

export const ROOM_CARD_LABELS: RoomCardLabels = {
  lights: (on, total) => (on === 0 ? 'Lights off' : total === null ? `${on} ${on === 1 ? 'light' : 'lights'} on` : `${on} of ${total} ${total === 1 ? 'light' : 'lights'} on`),
  open: (count) => `${count} ${count === 1 ? 'window' : 'windows'} open`,
  humidity: (percent) => `${percent}% humidity`,
};

export interface RoomCardOptions {
  /** The room's name; also the card's accessible name. */
  name: string;
  /** Leading icon (default a sofa). */
  icon?: IconName | string;
  /** The room temperature, already in `unit`. */
  temperature?: number | null;
  /** Default "°C". */
  unit?: string;
  /** Relative humidity in percent. */
  humidity?: number | null;
  /** Lights on now; the card takes the lit look while any are. */
  lightsOn?: number | null;
  lightsTotal?: number | null;
  /** Windows (or doors) open now; shown as a warning. */
  open?: number | null;
  toggles?: readonly RoomToggle[];
  labels?: Partial<RoomCardLabels>;
  unavailable?: boolean;
  /** Makes the header a button that opens the room. */
  onOpen?: (event: MouseEvent) => void;
  /** A quick toggle was pressed: its id and the state asked for. The toggle shows the new state once `update` brings it. */
  onToggle?: (id: string, on: boolean) => void;
}

export interface RoomCardHandle {
  el: HTMLDivElement;
  update(changes: Partial<RoomCardOptions>): void;
}

/** One fact line under the header. */
export interface RoomCardFact {
  kind: 'lights' | 'open';
  icon: string;
  text: string;
  tone: 'lit' | 'warning' | 'muted';
}

export const ROOM_CARD_ICON = mdiSofaOutline;

const roundOne = (n: number): string => (Math.round(n * 10) / 10).toString();

/** The header's state line: "21.5 °C · 48% humidity" (what is known). */
export function roomCardClimate(o: Pick<RoomCardOptions, 'temperature' | 'humidity' | 'unit'>, l: RoomCardLabels = ROOM_CARD_LABELS): string {
  const parts: string[] = [];
  if (typeof o.temperature === 'number') parts.push(`${roundOne(o.temperature)} ${o.unit ?? '°C'}`);
  if (typeof o.humidity === 'number') parts.push(l.humidity(Math.round(o.humidity)));
  return parts.join(' · ');
}

/** The fact lines that apply: lights when known, open windows when any. */
export function roomCardFacts(o: Pick<RoomCardOptions, 'lightsOn' | 'lightsTotal' | 'open'>, l: RoomCardLabels = ROOM_CARD_LABELS): RoomCardFact[] {
  const out: RoomCardFact[] = [];
  if (typeof o.lightsOn === 'number') {
    out.push({ kind: 'lights', icon: mdiLightbulbOutline, text: l.lights(o.lightsOn, typeof o.lightsTotal === 'number' ? o.lightsTotal : null), tone: o.lightsOn > 0 ? 'lit' : 'muted' });
  }
  if (typeof o.open === 'number' && o.open > 0) out.push({ kind: 'open', icon: mdiWindowOpenVariant, text: l.open(o.open), tone: 'warning' });
  return out;
}

export function roomCardFactClass(fact: Pick<RoomCardFact, 'kind' | 'tone'>): string {
  return cx('mh-room-card__fact', `mh-room-card__fact--${fact.kind}`, `is-${fact.tone}`);
}

export function roomCardToggleClass(t: Pick<RoomToggle, 'on' | 'tone'>): string {
  const tone = t.tone ?? 'warm';
  return cx('mh-room-card__toggle', tone !== 'accent' && `mh-room-card__toggle--${tone}`, t.on && 'is-on');
}

/**
 * `.mh-room-card` (on a `.mh-control-card` frame): the room name with temperature and humidity on the state line,
 * `__facts` (lights on, windows open) and `__toggles`, quick `button.mh-room-card__toggle`s with `aria-pressed`.
 * The card is lit (`warm`) while any light is on. Toggles are controlled: pressing one calls `onToggle` and the
 * pressed state follows the next `update`.
 */
export function createRoomCard(options: RoomCardOptions): RoomCardHandle {
  let o: RoomCardOptions = { ...options };
  const facts = h('ul', { class: 'mh-room-card__facts' });
  const toggles = h('div', { class: 'mh-room-card__toggles', role: 'group' });
  const body = h('div', { class: 'mh-room-card__body' });
  const buttons = new Map<string, HTMLButtonElement>();
  const card = createControlCard({ title: o.name, icon: o.icon ?? ROOM_CARD_ICON });

  const press = (id: string): void => {
    const now = (o.toggles ?? []).find((x) => x.id === id);
    if (now && !now.disabled && !o.unavailable) o.onToggle?.(id, !now.on);
  };

  const render = (): void => {
    const l = { ...ROOM_CARD_LABELS, ...o.labels };
    facts.replaceChildren(...roomCardFacts(o, l).map((f) => h('li', { class: roomCardFactClass(f) }, createIcon(f.icon), h('span', { class: 'mh-room-card__fact-text' }, f.text))));
    toggles.setAttribute('aria-label', o.name);
    const list = o.toggles ?? [];
    for (const [id, b] of buttons) {
      if (list.some((t) => t.id === id)) continue;
      buttons.delete(id);
      b.remove();
    }
    const els = list.map((t) => {
      let b = buttons.get(t.id);
      if (!b) {
        b = h('button', { type: 'button', onclick: (() => press(t.id)) as EventListener });
        buttons.set(t.id, b);
      }
      b.className = roomCardToggleClass(t);
      b.setAttribute('aria-pressed', String(t.on));
      b.disabled = !!t.disabled;
      b.replaceChildren(createIcon(t.icon), h('span', { class: 'mh-room-card__toggle-label' }, t.label));
      return b;
    });
    syncChildren(toggles, els);
    const parts: HTMLElement[] = [];
    if (facts.children.length) parts.push(facts);
    if (els.length) parts.push(toggles);
    syncChildren(body, parts);
    card.update({
      title: o.name,
      icon: o.icon ?? ROOM_CARD_ICON,
      state: roomCardClimate(o, l) || undefined,
      active: (o.lightsOn ?? 0) > 0,
      tone: 'warm',
      unavailable: o.unavailable,
      onOpen: o.onOpen,
      body: parts.length ? body : null,
    });
    card.el.classList.add('mh-room-card');
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
