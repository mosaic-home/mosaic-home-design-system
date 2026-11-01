import { mdiBattery, mdiBattery10, mdiBattery20, mdiBattery30, mdiBattery40, mdiBattery50, mdiBattery60, mdiBattery70, mdiBattery80, mdiBattery90, mdiBatteryAlertVariantOutline, mdiBatteryCharging, mdiBatteryCharging10, mdiBatteryCharging20, mdiBatteryCharging30, mdiBatteryCharging40, mdiBatteryCharging50, mdiBatteryCharging60, mdiBatteryCharging70, mdiBatteryCharging80, mdiBatteryCharging90, mdiBatteryOutline, mdiHomeImportOutline, mdiPause, mdiPlay, mdiRobotVacuum } from '@mdi/js';
import { createButton, type ButtonHandle } from '../../actions/button.ts';
import { createChip } from '../../choice-inputs/chip.ts';
import { cx, h } from '../../dom.ts';
import { createIcon, type IconName } from '../../icons.ts';
import { syncChildren } from '../children.ts';
import { createControlCard } from '../controlCard.ts';

export type VacuumState = 'docked' | 'idle' | 'cleaning' | 'paused' | 'returning' | 'error';

export interface VacuumRoom {
  id: string;
  name: string;
}

/** Every visible or spoken word, for translation. */
export interface VacuumControlLabels {
  states: Record<VacuumState, string>;
  /** Start with no rooms chosen. */
  start: string;
  /** Start with rooms chosen: "Clean 2 rooms". */
  startRooms(count: number): string;
  resume: string;
  pause: string;
  dock: string;
  rooms: string;
  battery: string;
  charging: string;
}

export const VACUUM_CONTROL_LABELS: VacuumControlLabels = {
  states: { docked: 'Docked', idle: 'Ready', cleaning: 'Cleaning', paused: 'Paused', returning: 'Returning to dock', error: 'Needs help' },
  start: 'Clean everywhere',
  startRooms: (count) => `Clean ${count} ${count === 1 ? 'room' : 'rooms'}`,
  resume: 'Resume',
  pause: 'Pause',
  dock: 'Dock',
  rooms: 'Rooms to clean',
  battery: 'Battery',
  charging: 'charging',
};

export interface VacuumControlOptions {
  /** The cleaner's name; also the card's accessible name. */
  name: string;
  icon?: IconName | string;
  state: VacuumState;
  /** Battery level, 0 to 100. */
  battery?: number | null;
  charging?: boolean;
  /** A line after the state ("Kitchen · 14 min"). */
  detail?: string;
  /** What is wrong, shown in a danger note while `state` is `error` ("Brush stuck"). */
  error?: string;
  /** Rooms that can be chosen for the next run. */
  rooms?: readonly VacuumRoom[];
  /** The chosen rooms (ids); kept by the control between updates once the user changes them. */
  selectedRooms?: readonly string[];
  labels?: Partial<VacuumControlLabels>;
  unavailable?: boolean;
  /** Start (with the chosen rooms; empty for everywhere) or resume. */
  onStart?: (rooms: string[]) => void;
  onPause?: () => void;
  onDock?: () => void;
  onRoomsChange?: (rooms: string[]) => void;
}

export interface VacuumControlHandle {
  el: HTMLDivElement;
  update(changes: Partial<VacuumControlOptions>): void;
}

export type VacuumAction = 'start' | 'pause' | 'dock';

export interface VacuumButton {
  action: VacuumAction;
  label: string;
  icon: string;
  disabled: boolean;
  primary: boolean;
}

const BATTERY = [mdiBatteryOutline, mdiBattery10, mdiBattery20, mdiBattery30, mdiBattery40, mdiBattery50, mdiBattery60, mdiBattery70, mdiBattery80, mdiBattery90, mdiBattery];
const CHARGING = [mdiBatteryCharging10, mdiBatteryCharging10, mdiBatteryCharging20, mdiBatteryCharging30, mdiBatteryCharging40, mdiBatteryCharging50, mdiBatteryCharging60, mdiBatteryCharging70, mdiBatteryCharging80, mdiBatteryCharging90, mdiBatteryCharging];

/** The battery glyph for a level, in steps of ten. */
export function vacuumBatteryIcon(level: number | null | undefined, charging = false): string {
  if (typeof level !== 'number' || !Number.isFinite(level)) return mdiBatteryAlertVariantOutline;
  const step = Math.max(0, Math.min(10, Math.round(level / 10)));
  return (charging ? CHARGING : BATTERY)[step]!;
}

export function vacuumBatteryClass(level: number | null | undefined, charging = false): string {
  const low = typeof level === 'number' && level < 20;
  return cx('mh-vacuum-control__battery', low && !charging && 'is-low', charging && 'is-charging');
}

/** The battery's visible text ("82%") and spoken text ("Battery 82%, charging"). */
export function vacuumBatteryText(level: number | null | undefined, charging: boolean, l: VacuumControlLabels): { text: string; label: string } {
  const text = typeof level === 'number' ? `${Math.round(level)}%` : '–';
  return { text, label: `${l.battery} ${text}${charging ? `, ${l.charging}` : ''}` };
}

export function vacuumControlClass(o: Pick<VacuumControlOptions, 'state'>): string {
  return cx('mh-vacuum-control', `mh-vacuum-control--${o.state}`, (o.state === 'cleaning' || o.state === 'returning') && 'is-busy');
}

/** The state line: the state word, then the detail. */
export function vacuumStateText(o: Pick<VacuumControlOptions, 'state' | 'detail'>, l: VacuumControlLabels): string {
  return o.detail ? `${l.states[o.state]} · ${o.detail}` : l.states[o.state];
}

/** The three buttons for a state: start (or resume), pause and dock, each enabled only when it does something. */
export function vacuumButtons(o: Pick<VacuumControlOptions, 'state' | 'unavailable'>, chosen: number, l: VacuumControlLabels): VacuumButton[] {
  const off = !!o.unavailable;
  const s = o.state;
  return [
    {
      action: 'start',
      label: s === 'paused' ? l.resume : chosen > 0 ? l.startRooms(chosen) : l.start,
      icon: mdiPlay,
      disabled: off || s === 'cleaning',
      primary: s !== 'cleaning',
    },
    { action: 'pause', label: l.pause, icon: mdiPause, disabled: off || (s !== 'cleaning' && s !== 'returning'), primary: false },
    { action: 'dock', label: l.dock, icon: mdiHomeImportOutline, disabled: off || s === 'docked' || s === 'returning', primary: false },
  ];
}

export function vacuumButtonClass(action: VacuumAction): string {
  return `mh-vacuum-control__button mh-vacuum-control__button--${action}`;
}

export const VACUUM_ICON = mdiRobotVacuum;

/**
 * `.mh-vacuum-control` (on a `.mh-control-card` frame): the state line with `__battery` (icon and percent; `.is-low`
 * below 20%, `.is-charging`) in the trailing slot, an `__error` note, `__actions` (start or resume, pause, dock) and
 * `__rooms`, a chip group choosing where the next run cleans. Modifier `--<state>`, `.is-busy` while moving.
 */
export function createVacuumControl(options: VacuumControlOptions): VacuumControlHandle {
  let o: VacuumControlOptions = { ...options };
  let chosen: string[] = [...(o.selectedRooms ?? [])];
  const batteryIcon = h('span', { class: 'mh-vacuum-control__battery-icon' });
  const batteryText = h('span', { class: 'mh-vacuum-control__battery-text', 'aria-hidden': 'true' });
  const batteryLabel = h('span', { class: 'mh-visually-hidden' });
  const battery = h('span', {}, batteryIcon, batteryText, batteryLabel);
  const error = h('p', { class: 'mh-vacuum-control__error', role: 'alert' });
  const actions = h('div', { class: 'mh-vacuum-control__actions' });
  const roomsLabel = h('span', { class: 'mh-vacuum-control__rooms-label', 'aria-hidden': 'true' });
  const chips = h('div', { class: 'mh-chip-group', role: 'group' });
  const rooms = h('div', { class: 'mh-vacuum-control__rooms' }, roomsLabel, chips);
  const body = h('div', { class: 'mh-vacuum-control__body' });
  const buttons = new Map<VacuumAction, ButtonHandle>();
  let roomsKey = '';
  const card = createControlCard({ title: o.name, icon: o.icon ?? VACUUM_ICON });

  const fire = (action: VacuumAction): void => {
    if (action === 'start') o.onStart?.([...chosen]);
    else if (action === 'pause') o.onPause?.();
    else o.onDock?.();
  };

  const render = (): void => {
    const l = { ...VACUUM_CONTROL_LABELS, ...o.labels, states: { ...VACUUM_CONTROL_LABELS.states, ...o.labels?.states } };
    const known = new Set((o.rooms ?? []).map((r) => r.id));
    chosen = chosen.filter((id) => known.has(id));

    const parts: HTMLElement[] = [];
    if (o.state === 'error' && o.error) {
      error.textContent = o.error;
      parts.push(error);
    }
    const list = vacuumButtons(o, chosen.length, l);
    const btnEls = list.map((b) => {
      let handle = buttons.get(b.action);
      const variant = b.primary ? 'primary' : 'secondary';
      if (!handle || !handle.el.classList.contains(`mh-button--${variant}`)) {
        const next = createButton({ label: b.label, icon: b.icon, variant, onClick: () => fire(b.action) });
        next.el.classList.add(...vacuumButtonClass(b.action).split(' '));
        handle?.el.replaceWith(next.el);
        handle = next;
        buttons.set(b.action, handle);
      }
      handle.setLabel(b.label);
      handle.setDisabled(b.disabled);
      return handle.el;
    });
    syncChildren(actions, btnEls);
    parts.push(actions);

    if (o.rooms?.length) {
      roomsLabel.textContent = l.rooms;
      chips.setAttribute('aria-label', l.rooms);
      const key = JSON.stringify([o.rooms, chosen, !!o.unavailable]);
      if (key !== roomsKey) {
        roomsKey = key;
        const focusedAt = Array.from(chips.children).findIndex((c) => c === document.activeElement);
        chips.replaceChildren(
          ...o.rooms.map(
            (r) =>
              createChip({
                label: r.name,
                selectable: true,
                selected: chosen.includes(r.id),
                disabled: !!o.unavailable,
                onToggle: (on) => {
                  chosen = on ? [...chosen, r.id] : chosen.filter((id) => id !== r.id);
                  render();
                  o.onRoomsChange?.([...chosen]);
                },
              }).el,
          ),
        );
        if (focusedAt >= 0) (chips.children[focusedAt] as HTMLElement | undefined)?.focus();
      }
      parts.push(rooms);
    }
    syncChildren(body, parts);

    const charging = !!o.charging;
    batteryIcon.replaceChildren(createIcon(vacuumBatteryIcon(o.battery, charging)));
    const bt = vacuumBatteryText(o.battery, charging, l);
    batteryText.textContent = bt.text;
    batteryLabel.textContent = bt.label;
    battery.className = vacuumBatteryClass(o.battery, charging);

    card.update({
      title: o.name,
      icon: o.icon ?? VACUUM_ICON,
      state: vacuumStateText(o, l),
      active: o.state === 'cleaning' || o.state === 'returning',
      unavailable: o.unavailable,
      control: o.battery === undefined ? null : battery,
      body,
    });
    card.el.classList.add(...vacuumControlClass(o).split(' '));
  };
  render();

  return {
    el: card.el,
    update(changes) {
      if (changes.selectedRooms) chosen = [...changes.selectedRooms];
      o = { ...o, ...changes };
      render();
    },
  };
}
