import { mdiArrowDown, mdiArrowRight, mdiArrowUp } from '@mdi/js';
import { cx, h, type Child } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';

export interface TileOptions {
  icon: IconName | string;
  /** Icon while on (default: `icon`). */
  iconOn?: IconName | string;
  label: string;
  /** Secondary text: the state or a reading ("On", "80%", "Locked"). */
  state?: string;
  /** Makes the tile a toggle (`aria-pressed`); on tiles use the accent. */
  on?: boolean;
  /** Called with the new state after a toggle tile is pressed. */
  onToggle?: (on: boolean) => void;
  /** For non-toggle tiles: what pressing does. */
  onClick?: (event: MouseEvent) => void;
  disabled?: boolean;
}

export interface TileHandle {
  el: HTMLButtonElement;
  setOn(on: boolean): void;
  setState(state: string): void;
}

export function tileClass(on = false): string {
  return cx('mh-tile', on && 'is-on');
}

/**
 * `button.mh-tile`: a square-ish action tile with `__icon`, `__label` and `__state`. A toggle tile has
 * `aria-pressed` and, when on, `.is-on` with `--mh-accent-soft`.
 */
export function createTile(options: TileOptions): TileHandle {
  const toggle = options.on !== undefined;
  const icon = h('span', { class: 'mh-tile__icon' });
  const state = h('span', { class: 'mh-tile__state' }, options.state ?? '');
  const el = h('button', { type: 'button', class: tileClass(), disabled: options.disabled }, icon, h('span', { class: 'mh-tile__label' }, options.label), state);
  let on = false;
  const setOn = (value: boolean): void => {
    on = value;
    el.className = tileClass(on);
    if (toggle) el.setAttribute('aria-pressed', String(on));
    icon.replaceChildren(createIcon(on && options.iconOn ? options.iconOn : options.icon));
  };
  el.addEventListener('click', (e) => {
    if (toggle) {
      setOn(!on);
      options.onToggle?.(on);
    }
    options.onClick?.(e);
  });
  setOn(options.on ?? false);
  return {
    el,
    setOn,
    setState(text) {
      state.textContent = text;
    },
  };
}

export type Trend = 'up' | 'down' | 'flat';

export interface StatTileOptions {
  label: string;
  value: string | number;
  unit?: string;
  icon?: IconName | string;
  /** A line under the value ("Since 07:00"). */
  caption?: string;
  trend?: Trend;
}

export interface StatTileHandle {
  el: HTMLDivElement;
  setValue(value: string | number): void;
}

const TREND_ICON: Record<Trend, string> = { up: mdiArrowUp, down: mdiArrowDown, flat: mdiArrowRight };
const TREND_LABEL: Record<Trend, string> = { up: 'rising', down: 'falling', flat: 'steady' };

export function statTrendLabel(trend: Trend): string {
  return TREND_LABEL[trend];
}

/** `.mh-tile.mh-tile--stat`: a reading with `__label`, `__value` (`__number`, `__unit`), `__trend` and `__caption`. */
export function createStatTile(options: StatTileOptions): StatTileHandle {
  const number = h('span', { class: 'mh-tile__number' }, String(options.value));
  const el = h(
    'div',
    { class: 'mh-tile mh-tile--stat' },
    h(
      'span',
      { class: 'mh-tile__label' },
      options.icon ? h('span', { class: 'mh-tile__icon' }, createIcon(options.icon)) : null,
      options.label,
    ),
    h(
      'span',
      { class: 'mh-tile__value' },
      number,
      options.unit ? h('span', { class: 'mh-tile__unit' }, options.unit) : null,
      options.trend ? h('span', { class: `mh-tile__trend mh-tile__trend--${options.trend}` }, createIcon(TREND_ICON[options.trend], { label: TREND_LABEL[options.trend] })) : null,
    ),
    options.caption ? h('span', { class: 'mh-tile__caption' }, options.caption) : null,
  );
  return {
    el,
    setValue(value) {
      number.textContent = String(value);
    },
  };
}

export type TileGridSize = 'small' | 'medium' | 'large';

export function tileGridClass(size: TileGridSize = 'medium'): string {
  return cx('mh-tile-grid', size !== 'medium' && `mh-tile-grid--${size === 'small' ? 'sm' : 'lg'}`);
}

/** `.mh-tile-grid`: a responsive grid of tiles; the minimum tile width follows the touch-target size. */
export function createTileGrid(children: Child[], options: { size?: TileGridSize; label?: string } = {}): { el: HTMLDivElement } {
  return { el: h('div', { class: tileGridClass(options.size), role: options.label ? 'group' : null, 'aria-label': options.label }, ...children) };
}
