import { mdiAlert, mdiCheckCircle, mdiDoorClosed, mdiDoorOpen, mdiGarageOpenVariant, mdiGarageVariant, mdiGate, mdiGateOpen, mdiWindowClosedVariant, mdiWindowOpenVariant } from '@mdi/js';
import { cx, h, uid } from '../../dom.ts';
import { createIcon } from '../../icons.ts';

export type OpeningKind = 'door' | 'window' | 'garage' | 'gate' | 'other';

export interface OpeningEntry {
  id: string;
  /** "Back door", "Bathroom window". */
  name: string;
  kind?: OpeningKind;
  open: boolean;
  /** Where it is ("Kitchen"). */
  area?: string;
  /** How long it has been open, as the app words it ("20 min"). */
  since?: string;
  /** It should be shut now (rain on the way, the alarm is armed, nobody home): takes the warning tone. */
  alert?: boolean;
}

export interface OpeningsSummaryLabels {
  title: string;
  /** The count: `{n}` open. */
  open: string;
  /** When nothing is open. */
  allShut: string;
  /** Spoken after an item that should be shut. */
  shouldBeShut: string;
  /** Shown on closed items with `showClosed`. */
  closed: string;
}

export const OPENINGS_SUMMARY_LABELS: OpeningsSummaryLabels = { title: 'Doors and windows', open: '{n} open', allShut: 'All shut', shouldBeShut: 'should be shut', closed: 'Closed' };

export interface OpeningsSummaryOptions {
  items: readonly OpeningEntry[];
  /** Why something should be shut ("Rain expected within the hour"); shown in the warning tone. */
  reason?: string | null;
  /** The warning tone even without an alerting item. */
  warning?: boolean;
  /** List closed items too, after the open ones. */
  showClosed?: boolean;
  /** Level of the title heading (default 3). */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  labels?: Partial<OpeningsSummaryLabels>;
  /** Makes each item a button. */
  onSelect?: (id: string) => void;
}

export interface OpeningsSummaryHandle {
  el: HTMLElement;
  update(changes: Partial<OpeningsSummaryOptions>): void;
}

export function openingsSummaryLabels(labels: Partial<OpeningsSummaryLabels> | undefined): OpeningsSummaryLabels {
  return { ...OPENINGS_SUMMARY_LABELS, ...labels };
}

const KIND_ICON: Record<OpeningKind, string> = { door: mdiDoorOpen, window: mdiWindowOpenVariant, garage: mdiGarageOpenVariant, gate: mdiGateOpen, other: mdiDoorOpen };

const KIND_ICON_SHUT: Record<OpeningKind, string> = { door: mdiDoorClosed, window: mdiWindowClosedVariant, garage: mdiGarageVariant, gate: mdiGate, other: mdiDoorClosed };

/** The icon of an item, open or shut. */
export const openingIcon = (kind: OpeningKind | undefined, open = true): string => (open ? KIND_ICON : KIND_ICON_SHUT)[kind ?? 'other'];

export interface OpeningsSummaryView {
  count: number;
  warning: boolean;
  countText: string;
  /** Open items first (those that should be shut at the top), then closed ones with `showClosed`. */
  items: OpeningEntry[];
  icon: string;
}

/** What the summary shows. */
export function openingsSummaryView(o: OpeningsSummaryOptions): OpeningsSummaryView {
  const l = openingsSummaryLabels(o.labels);
  const open = o.items.filter((i) => i.open);
  const alerting = open.filter((i) => i.alert);
  const rest = open.filter((i) => !i.alert);
  const closed = o.showClosed ? o.items.filter((i) => !i.open) : [];
  const warning = alerting.length > 0 || (!!o.warning && open.length > 0);
  return {
    count: open.length,
    warning,
    countText: open.length === 0 ? l.allShut : l.open.replace('{n}', String(open.length)),
    items: [...alerting, ...rest, ...closed],
    icon: warning ? mdiAlert : open.length === 0 ? mdiCheckCircle : mdiDoorOpen,
  };
}

export function openingsSummaryClass(view: Pick<OpeningsSummaryView, 'count' | 'warning'>): string {
  return cx('mh-openings-summary', view.warning && 'is-warning', view.count === 0 && 'is-clear');
}

export function openingItemClass(item: Pick<OpeningEntry, 'open' | 'alert'>): string {
  return cx('mh-openings-summary__item', item.open && item.alert && 'is-alert', !item.open && 'is-closed');
}

/** The line under an item's name: "Kitchen · 20 min", or "Closed". */
export function openingMetaText(item: OpeningEntry, labels?: Partial<OpeningsSummaryLabels>): string {
  const l = openingsSummaryLabels(labels);
  return [item.area?.trim(), item.open ? item.since?.trim() : l.closed].filter(Boolean).join(' · ');
}

function itemEl(item: OpeningEntry, o: OpeningsSummaryOptions): HTMLLIElement {
  const l = openingsSummaryLabels(o.labels);
  const meta = openingMetaText(item, o.labels);
  const parts = [
    h('span', { class: 'mh-openings-summary__item-icon', 'aria-hidden': 'true' }, createIcon(openingIcon(item.kind, item.open))),
    h('span', { class: 'mh-openings-summary__item-text' }, h('span', { class: 'mh-openings-summary__name' }, item.name), meta ? h('span', { class: 'mh-openings-summary__meta' }, meta) : null),
    item.open && item.alert ? h('span', { class: 'mh-openings-summary__flag' }, createIcon(mdiAlert), h('span', { class: 'mh-visually-hidden' }, l.shouldBeShut)) : null,
  ];
  const row = o.onSelect
    ? h('button', { type: 'button', class: 'mh-openings-summary__row', onclick: (() => o.onSelect?.(item.id)) as EventListener }, ...parts)
    : h('span', { class: 'mh-openings-summary__row' }, ...parts);
  return h('li', { class: openingItemClass(item) }, row);
}

/**
 * `section.mh-openings-summary`: a `__header` (`__icon`, `__title` heading and the polite `__count`, "3 open" or
 * "All shut"), an optional `__reason`, and the `__list` of open items, the ones that should be shut first
 * (`__item.is-alert` with a `__flag`), each a `__row` (a `<button>` with `onSelect`) with `__item-icon`, `__name`
 * and `__meta`. States `.is-warning` (something should be shut) and `.is-clear` (nothing open).
 */
export function createOpeningsSummary(options: OpeningsSummaryOptions): OpeningsSummaryHandle {
  let o: OpeningsSummaryOptions = { ...options };
  const titleId = uid('mh-openings-title');
  const el = h('section', { 'aria-labelledby': titleId });
  const render = (): void => {
    const l = openingsSummaryLabels(o.labels);
    const view = openingsSummaryView(o);
    el.className = openingsSummaryClass(view);
    const title = h(`h${o.headingLevel ?? 3}` as 'h3', { class: 'mh-openings-summary__title', id: titleId }, l.title);
    const header = h(
      'div',
      { class: 'mh-openings-summary__header' },
      h('span', { class: 'mh-openings-summary__icon', 'aria-hidden': 'true' }, createIcon(view.icon)),
      h('div', { class: 'mh-openings-summary__heading' }, title, h('span', { class: 'mh-openings-summary__count', 'aria-live': 'polite' }, view.countText)),
    );
    const reason = view.warning && o.reason?.trim() ? h('p', { class: 'mh-openings-summary__reason' }, o.reason.trim()) : null;
    const list = view.items.length ? h('ul', { class: 'mh-openings-summary__list' }, ...view.items.map((i) => itemEl(i, o))) : null;
    const focused = el.contains(document.activeElement) ? (document.activeElement as HTMLElement).closest('li')?.dataset.id : undefined;
    el.replaceChildren(header, ...(reason ? [reason] : []), ...(list ? [list] : []));
    list?.querySelectorAll<HTMLLIElement>('li').forEach((li, i) => {
      li.dataset.id = view.items[i]!.id;
      if (focused !== undefined && li.dataset.id === focused) li.querySelector<HTMLElement>('button')?.focus();
    });
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
