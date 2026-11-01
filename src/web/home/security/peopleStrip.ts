import { mdiHome, mdiMapMarker, mdiMapMarkerQuestion, mdiMapMarkerRadius } from '@mdi/js';
import { createAvatar } from '../../data-display/avatar.ts';
import { cx, h } from '../../dom.ts';
import { createIcon } from '../../icons.ts';

/** Where someone is: at home, away, in a named place (a zone such as "Office"), or not known. */
export type PersonWhere = 'home' | 'away' | 'zone' | 'unknown';

export interface PersonEntry {
  id: string;
  name: string;
  /** A picture URL; initials show without one. */
  picture?: string;
  where: PersonWhere;
  /** The place's name when `where` is `zone`. */
  zone?: string;
  /** How long they have been there, as the app words it ("2 h", "since 08:10"). */
  since?: string;
}

export interface PeopleStripLabels {
  /** Accessible name of the strip. */
  label: string;
  home: string;
  away: string;
  unknown: string;
  /** Added to the strip's name: `{n}` at home out of `{total}`. */
  summary: string;
}

export const PEOPLE_STRIP_LABELS: PeopleStripLabels = { label: 'People', home: 'Home', away: 'Away', unknown: 'Unknown', summary: '{n} of {total} home' };

export interface PeopleStripOptions {
  people: readonly PersonEntry[];
  /** Avatars only, the words spoken but not shown (watches, narrow strips). */
  compact?: boolean;
  labels?: Partial<PeopleStripLabels>;
  /** Makes each person a button (open their details). */
  onSelect?: (id: string) => void;
}

export interface PeopleStripHandle {
  el: HTMLUListElement;
  update(changes: Partial<PeopleStripOptions>): void;
}

export function peopleStripLabels(labels: Partial<PeopleStripLabels> | undefined): PeopleStripLabels {
  return { ...PEOPLE_STRIP_LABELS, ...labels };
}

export function peopleStripClass(compact = false): string {
  return cx('mh-people-strip', compact && 'mh-people-strip--compact');
}

export function peoplePersonClass(p: Pick<PersonEntry, 'where'>): string {
  return cx('mh-people-strip__person', `mh-people-strip__person--${p.where}`);
}

const WHERE_ICON: Record<PersonWhere, string> = { home: mdiHome, away: mdiMapMarker, zone: mdiMapMarkerRadius, unknown: mdiMapMarkerQuestion };

/** The badge icon for where someone is. */
export const peopleWhereIcon = (where: PersonWhere): string => WHERE_ICON[where];

/** The place line: "Home · 2 h", "Office · 25 min", "Away". */
export function peoplePlaceText(p: PersonEntry, labels?: Partial<PeopleStripLabels>): string {
  const l = peopleStripLabels(labels);
  const place = p.where === 'zone' ? p.zone?.trim() || l.away : l[p.where];
  return [place, p.since?.trim()].filter(Boolean).join(' · ');
}

/** The strip's accessible name: "People, 2 of 3 home". */
export function peopleStripSummary(people: readonly PersonEntry[], labels?: Partial<PeopleStripLabels>): string {
  const l = peopleStripLabels(labels);
  if (people.length === 0) return l.label;
  const n = people.filter((p) => p.where === 'home').length;
  return `${l.label}, ${l.summary.replace('{n}', String(n)).replace('{total}', String(people.length))}`;
}

function person(p: PersonEntry, o: PeopleStripOptions): HTMLLIElement {
  const avatar = createAvatar({ name: p.name, src: p.picture, size: o.compact ? 'medium' : 'large' }).el;
  const face = h('span', { class: 'mh-people-strip__face', 'aria-hidden': 'true' }, avatar, h('span', { class: 'mh-people-strip__badge' }, createIcon(peopleWhereIcon(p.where))));
  const text = h('span', { class: cx('mh-people-strip__text', o.compact && 'mh-visually-hidden') }, h('span', { class: 'mh-people-strip__name' }, p.name), h('span', { class: 'mh-people-strip__place' }, peoplePlaceText(p, o.labels)));
  const title = o.compact ? `${p.name}: ${peoplePlaceText(p, o.labels)}` : undefined;
  const main = o.onSelect
    ? h('button', { type: 'button', class: 'mh-people-strip__main', title, onclick: (() => o.onSelect?.(p.id)) as EventListener }, face, text)
    : h('span', { class: 'mh-people-strip__main', title }, face, text);
  return h('li', { class: peoplePersonClass(p) }, main);
}

/**
 * `ul.mh-people-strip` (`--compact`: avatars only): one `__person--home | --away | --zone | --unknown` per entry,
 * each a `__main` (a `<button>` with `onSelect`) holding the `__face` (the avatar and a `__badge` icon for where
 * they are) and `__text` (`__name`, `__place` with how long). People at home are lit; the others are dimmed. The
 * list is named "People, 2 of 3 home". It scrolls sideways when there are more people than room.
 */
export function createPeopleStrip(options: PeopleStripOptions): PeopleStripHandle {
  let o: PeopleStripOptions = { ...options };
  const el = h('ul', {});
  const render = (): void => {
    el.className = peopleStripClass(o.compact);
    el.setAttribute('aria-label', peopleStripSummary(o.people, o.labels));
    el.replaceChildren(...o.people.map((p) => person(p, o)));
  };
  render();
  return {
    el,
    update(changes) {
      o = { ...o, ...changes };
      render();
    },
  };
}
