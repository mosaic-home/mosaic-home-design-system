import { mdiBatteryHigh, mdiCarElectricOutline, mdiEvPlugType2, mdiFlash, mdiPowerPlugOffOutline, mdiTimerOutline } from '@mdi/js';
import { node, patch, r2, toDom, type ChartNode } from '../../charts/tree.ts';
import { cx } from '../../dom.ts';
import type { IconName } from '../../icons.ts';
import { clampTo, formatMinutes, formatPower, iconTree, isNum } from './shared.ts';

/** Whether it is plugged in and what the charge is doing. */
export type ChargeState = 'unplugged' | 'plugged' | 'charging' | 'discharging' | 'full';

/** Every visible and spoken word, for translation. */
export interface ChargeCardLabels {
  unplugged: string;
  plugged: string;
  charging: string;
  discharging: string;
  full: string;
  charge: string;
  limit: string;
  /** "to full" after a time. */
  toFull: string;
  /** "to" before the limit after a time ("1 h to 80%"). */
  to: string;
  noData: string;
}

export const CHARGE_CARD_LABELS: ChargeCardLabels = {
  unplugged: 'Unplugged',
  plugged: 'Plugged in',
  charging: 'Charging',
  discharging: 'Discharging',
  full: 'Full',
  charge: 'Charge',
  limit: 'Limit',
  toFull: 'to full',
  to: 'to',
  noData: 'Unknown',
};

export interface ChargeCardOptions {
  /** The thing's name ("Car", "Home battery"); also the card's accessible name. */
  name: string;
  /** `vehicle` (default) or `battery` picks the icon. */
  kind?: 'vehicle' | 'battery';
  /** Leading icon instead of the kind's. */
  icon?: IconName | string;
  /** Charge in percent. */
  level: number | null;
  /** The charge limit in percent, marked on the ring; below 100 the time counts to it. */
  limit?: number | null;
  state?: ChargeState | null;
  /** Charging or discharging power in watts. */
  rate?: number | null;
  /** Minutes until full (or until the limit). */
  minutesLeft?: number | null;
  /** One more fact, as given ("Range 240 km"). */
  detail?: string | null;
  /** Below this the level is low (default 20). */
  low?: number;
  /** Smaller ring, for small tiles and watches. */
  compact?: boolean;
  /** Formats watts (default "7.4 kW"). */
  format?: (watts: number) => string;
  labels?: Partial<ChargeCardLabels>;
}

export interface ChargeCardHandle {
  el: HTMLDivElement;
  /** Replaces everything shown; the ring moves to the new level. */
  update(options: ChargeCardOptions): void;
}

const STATE_ICON: Record<ChargeState, string> = {
  unplugged: mdiPowerPlugOffOutline,
  plugged: mdiEvPlugType2,
  charging: mdiFlash,
  discharging: mdiFlash,
  full: mdiEvPlugType2,
};

/** The ring is a circle of circumference 100 in a 36 x 36 box, so a level is its dash length. */
export const CHARGE_RING = { size: 36, center: 18, radius: 15.9155 } as const;

/** The limit tick across the ring at `limit` percent, clockwise from the top. */
export function chargeLimitPath(limit: number): string {
  const a = (clampTo(limit, 0, 100) / 100) * 2 * Math.PI;
  const { center: c, radius: r } = CHARGE_RING;
  const sx = Math.sin(a);
  const cy = -Math.cos(a);
  return `M${r2(c + sx * (r - 3))} ${r2(c + cy * (r - 3))}L${r2(c + sx * (r + 3))} ${r2(c + cy * (r + 3))}`;
}

/** The time line ("1 h 20 min to full", "45 min to 80%"), or null. */
export function chargeTimeText(minutes: number | null | undefined, limit: number | null | undefined, labels: ChargeCardLabels): string | null {
  if (!isNum(minutes)) return null;
  const to = isNum(limit) && limit < 100 ? `${labels.to} ${Math.round(limit)}%` : labels.toFull;
  return `${formatMinutes(minutes)} ${to}`;
}

export function chargeCardClass(o: Pick<ChargeCardOptions, 'state' | 'compact' | 'level' | 'low'>): string {
  const low = isNum(o.level) && o.level < (o.low ?? 20);
  return cx('mh-charge-card', o.state && `mh-charge-card--${o.state}`, o.compact && 'mh-charge-card--compact', low && 'is-low', !isNum(o.level) && 'is-empty');
}

/**
 * The markup of `.mh-charge-card`: the `__ring` (a `role="meter"`: `__track` and `__fill` circles, the `__limit`
 * tick, and the `__level` number in the middle), then `__body` with `__title` (`__icon`, `__name`), the `__state`
 * line and the `__facts` list (`__fact--rate | --time | --limit | --detail`). Modifiers `--<state>`, `--compact`;
 * states `.is-low`, `.is-empty`.
 */
export function chargeCardTree(o: ChargeCardOptions): ChartNode {
  const l = { ...CHARGE_CARD_LABELS, ...o.labels };
  const fmt = o.format ?? formatPower;
  const has = isNum(o.level);
  const level = has ? Math.round(clampTo(o.level as number, 0, 100)) : 0;
  const hasLimit = isNum(o.limit) && o.limit < 100;
  const { size, center, radius } = CHARGE_RING;
  const time = o.state === 'charging' || o.state === 'discharging' ? chargeTimeText(o.minutesLeft, o.limit, l) : null;
  const facts: ChartNode[] = [];
  if ((o.state === 'charging' || o.state === 'discharging') && isNum(o.rate)) facts.push(node('li', { class: 'mh-charge-card__fact mh-charge-card__fact--rate' }, iconTree(mdiFlash), fmt(o.rate)));
  if (time) facts.push(node('li', { class: 'mh-charge-card__fact mh-charge-card__fact--time' }, iconTree(mdiTimerOutline), time));
  if (hasLimit) facts.push(node('li', { class: 'mh-charge-card__fact mh-charge-card__fact--limit' }, `${l.limit} ${Math.round(o.limit as number)}%`));
  if (o.detail) facts.push(node('li', { class: 'mh-charge-card__fact mh-charge-card__fact--detail' }, o.detail));
  const valueText = has ? `${level}%${hasLimit ? `, ${l.limit.toLowerCase()} ${Math.round(o.limit as number)}%` : ''}` : l.noData;
  return node(
    'div',
    { class: chargeCardClass(o), role: 'group', 'aria-label': o.name },
    node(
      'div',
      {
        class: 'mh-charge-card__ring',
        role: 'meter',
        'aria-label': l.charge,
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'aria-valuenow': has ? level : undefined,
        'aria-valuetext': valueText,
      },
      node(
        'svg',
        { class: 'mh-charge-card__svg', viewBox: `0 0 ${size} ${size}`, 'aria-hidden': 'true' },
        node('circle', { class: 'mh-charge-card__track', cx: center, cy: center, r: radius }),
        has && node('circle', { class: 'mh-charge-card__fill', cx: center, cy: center, r: radius, style: `--_level: ${level}` }),
        hasLimit && node('path', { class: 'mh-charge-card__limit', d: chargeLimitPath(o.limit as number) }),
      ),
      node('span', { class: 'mh-charge-card__level', 'aria-hidden': 'true' }, has ? String(level) : '–', has && node('span', { class: 'mh-charge-card__percent' }, '%')),
    ),
    node(
      'div',
      { class: 'mh-charge-card__body' },
      node('div', { class: 'mh-charge-card__title' }, iconTree(o.icon ?? (o.kind === 'battery' ? mdiBatteryHigh : mdiCarElectricOutline), 'mh-charge-card__icon'), node('span', { class: 'mh-charge-card__name' }, o.name)),
      o.state && node('span', { class: 'mh-charge-card__state' }, iconTree(STATE_ICON[o.state]), l[o.state]),
      facts.length > 0 && node('ul', { class: 'mh-charge-card__facts' }, facts),
    ),
  );
}

/**
 * `.mh-charge-card`: a battery or vehicle charge. A ring with the level (amber when low, a moving sheen while
 * charging that stops under reduced motion) and the limit tick, the plug state, and the charging power, time to
 * full or to the limit, and one free detail.
 */
export function createChargeCard(options: ChargeCardOptions): ChargeCardHandle {
  const el = toDom(chargeCardTree(options)) as HTMLDivElement;
  return { el, update: (next) => patch(el, chargeCardTree(next)) };
}
