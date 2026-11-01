import {
  mdiDoorOpen,
  mdiGarage,
  mdiLightbulbOutline,
  mdiMotionSensor,
  mdiRobotVacuum,
  mdiThermostat,
  mdiWashingMachine,
  mdiWaterAlert,
  mdiWindowOpenVariant,
  mdiAccount,
  mdiLockOutline,
} from '@mdi/js';
import { createSwitch } from '../../../src/web/choice-inputs/switch.ts';
import { createCard } from '../../../src/web/data-display/card.ts';
import { h } from '../../../src/web/dom.ts';
import { createText } from '../../../src/web/foundations/text.ts';
import { createActivityFeed, type ActivityItem } from '../../../src/web/home/info/activityFeed.ts';
import { createAmbientClock } from '../../../src/web/home/info/ambientClock.ts';
import { createDeparturesBoard, type Departure } from '../../../src/web/home/info/departuresBoard.ts';
import { createNotificationCentre, type NotificationItem } from '../../../src/web/home/info/notificationCentre.ts';
import { createStateTimeline, type StateTimelineRow } from '../../../src/web/home/info/stateTimeline.ts';
import { createTodoList, type TodoItem } from '../../../src/web/home/info/todoList.ts';
import type { Story } from './types.ts';

// Information screens. Every name, place, line and stop is invented.

const stack = (...children: Node[]): HTMLElement => h('div', { class: 'ex-stack' }, ...children);
const grid = (...children: Node[]): HTMLElement => h('div', { class: 'mh-grid' }, ...children);
const caption = (text: string): HTMLElement => createText(text, { variant: 'label', tone: 'muted' });
const inCard = (body: HTMLElement, title?: string): HTMLElement => createCard({ title, body }).el;

// Notification centre -------------------------------------------------------------------------------------------

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'leak',
    title: 'Water under the kitchen sink',
    message: 'The leak sensor has been wet for 2 minutes.',
    priority: 'critical',
    icon: mdiWaterAlert,
    time: 'Now',
    actions: [
      { id: 'valve', label: 'Close main valve', tone: 'primary' },
      { id: 'ok', label: 'I’m on it' },
    ],
  },
  {
    id: 'door',
    title: 'Back door left open',
    message: 'Open for 10 minutes.',
    group: 'Security',
    priority: 'high',
    icon: mdiDoorOpen,
    time: '10 min',
    unread: true,
    actions: [{ id: 'remind', label: 'Remind me later' }],
  },
  {
    id: 'garage',
    title: 'Garage door open',
    group: 'Security',
    icon: mdiGarage,
    time: '25 min',
    actions: [{ id: 'close', label: 'Close it', tone: 'primary' }],
  },
  {
    id: 'window',
    title: 'Bathroom window open',
    group: 'Security',
    icon: mdiWindowOpenVariant,
    time: '1 h',
  },
  {
    id: 'motion',
    title: 'Motion on the porch',
    group: 'Security',
    priority: 'low',
    icon: mdiMotionSensor,
    time: '2 h',
  },
  {
    id: 'washer',
    title: 'Washing finished',
    message: 'Cotton 40° · 1 h 52 min',
    group: 'Appliances',
    icon: mdiWashingMachine,
    time: '12 min',
    unread: true,
  },
  {
    id: 'vacuum',
    title: 'Vacuum stuck under the sofa',
    group: 'Appliances',
    priority: 'high',
    icon: mdiRobotVacuum,
    time: '40 min',
    actions: [{ id: 'locate', label: 'Play sound' }],
  },
  {
    id: 'update',
    title: 'Two updates are ready',
    message: 'They install tonight at 03:00.',
    time: 'Yesterday',
    priority: 'low',
  },
];

function liveNotifications(): HTMLElement {
  let list = NOTIFICATIONS;
  const log = caption('Tap an action, dismiss a notification or clear them all.');
  const centre = createNotificationCentre({
    notifications: list,
    onAction: (id, action) => {
      log.textContent = `Action “${action}” on ${id}`;
      if (id === 'leak')
        centre.update({
          notifications: (list = list.filter((n) => n.id !== 'leak')),
        });
    },
    onDismiss: (id) =>
      centre.update({
        notifications: (list = list.filter((n) => n.id !== id)),
      }),
    onClearAll: (ids) =>
      centre.update({
        notifications: (list = list.filter((n) => !ids.includes(n.id))),
      }),
  });
  const reset = h(
    'button',
    {
      type: 'button',
      class: 'mh-button mh-button--secondary mh-button--sm',
      onclick: () => centre.update({ notifications: (list = NOTIFICATIONS) }),
    },
    h('span', { class: 'mh-button__label' }, 'Bring them back'),
  );
  return stack(centre.el, h('div', { class: 'ex-row' }, reset, log));
}

// Ambient clock -------------------------------------------------------------------------------------------------

/** A screen-shaped box to show the clock in. */
const screen = (child: HTMLElement, attrs: Record<string, string> = {}): HTMLElement =>
  h(
    'div',
    {
      ...attrs,
      style:
        'display: grid; aspect-ratio: 16 / 10; min-height: 14rem; overflow: hidden; border-radius: var(--mh-radius-lg); border: var(--mh-border-width) solid var(--mh-panel-outline); background: linear-gradient(var(--mh-canvas-top), var(--mh-canvas-bottom)); color: var(--mh-text);',
    },
    child,
  );

function liveClock(): HTMLElement {
  const clock = createAmbientClock({
    nextEvent: { title: 'Bins out', when: '19:30' },
    weather: { condition: 'partly-cloudy', temperature: 14 },
    driftEvery: 4000,
  });
  const night = createSwitch({
    label: 'Night',
    onChange: (on) => clock.update({ night: on }),
  });
  const seconds = createSwitch({
    label: 'Seconds',
    onChange: (on) => clock.update({ seconds: on }),
  });
  const twelve = createSwitch({
    label: '12-hour',
    onChange: (on) => clock.update({ hour12: on ? true : undefined }),
  });
  return stack(
    screen(clock.el),
    h('div', { class: 'ex-row' }, night.el, seconds.el, twelve.el),
    caption('The face drifts a little every few seconds here (once a minute by default), and holds still with reduced motion.'),
  );
}

// State timeline ------------------------------------------------------------------------------------------------

const day = (hh: number, mm = 0): number => new Date(2026, 9, 16, hh, mm).getTime();

const TIMELINE_ROWS: StateTimelineRow[] = [
  {
    label: 'Hall light',
    icon: mdiLightbulbOutline,
    spans: [
      { from: day(6, 40), to: day(7, 55) },
      { from: day(17, 10), to: null },
    ],
  },
  {
    label: 'Back door',
    icon: mdiDoorOpen,
    state: 'Open',
    color: 2,
    spans: [
      { from: day(8, 5), to: day(8, 9) },
      { from: day(12, 30), to: day(12, 52) },
      { from: day(16, 2), to: day(16, 4) },
    ],
  },
  {
    label: 'Front lock',
    icon: mdiLockOutline,
    state: 'Unlocked',
    color: 4,
    spans: [
      { from: day(-2), to: day(7, 50) },
      { from: day(15, 45), to: day(16, 0) },
    ],
  },
  {
    label: 'Heating',
    icon: mdiThermostat,
    state: 'Heating',
    color: 5,
    spans: [
      { from: day(5, 30), to: day(8, 30) },
      { from: day(16, 30), to: null },
    ],
  },
  {
    label: 'Sam',
    icon: mdiAccount,
    state: 'Home',
    color: 1,
    spans: [
      { from: day(0), to: day(8, 10) },
      { from: day(15, 40), to: null },
    ],
  },
  { label: 'Garage door', icon: mdiGarage, state: 'Open', spans: [] },
];

// Activity feed -------------------------------------------------------------------------------------------------

const ago = (minutes: number): number => Date.now() - minutes * 60_000;

const ACTIVITY: ActivityItem[] = [
  {
    id: '1',
    title: 'Back door opened',
    by: 'Robin',
    time: ago(0.2),
    icon: mdiDoorOpen,
    tone: 'accent',
  },
  {
    id: '2',
    title: 'Heating set to 21 °C',
    by: 'Evening routine',
    time: ago(14),
    icon: mdiThermostat,
    tone: 'warning',
  },
  {
    id: '3',
    title: 'Hall light turned on',
    by: 'Motion in the hall',
    time: ago(52),
    icon: mdiLightbulbOutline,
  },
  {
    id: '4',
    title: 'Front door locked',
    by: 'Sam',
    time: ago(190),
    icon: mdiLockOutline,
    tone: 'success',
  },
  {
    id: '5',
    title: 'Water leak cleared',
    by: 'Kitchen leak sensor',
    time: ago(60 * 26),
    icon: mdiWaterAlert,
    tone: 'danger',
  },
  {
    id: '6',
    title: 'Washing finished',
    time: ago(60 * 29),
    icon: mdiWashingMachine,
  },
  {
    id: '7',
    title: 'Garage door closed',
    by: 'Robin',
    time: ago(60 * 24 * 3 + 30),
    icon: mdiGarage,
  },
];

// Departures board ----------------------------------------------------------------------------------------------

const DEPARTURES: Departure[] = [
  {
    id: 'a',
    line: '14',
    mode: 'bus',
    color: 1,
    destination: 'Harbour Gate',
    via: 'via Old Market',
    minutes: 0,
    live: true,
  },
  {
    id: 'b',
    line: 'T3',
    mode: 'tram',
    color: 3,
    destination: 'Mill Lane',
    minutes: 4,
    time: '08:46',
    live: true,
  },
  {
    id: 'c',
    line: '14',
    mode: 'bus',
    color: 1,
    destination: 'Harbour Gate',
    minutes: 13,
    time: '08:52',
    delay: 3,
    live: true,
  },
  {
    id: 'd',
    line: 'R2',
    mode: 'train',
    color: 5,
    destination: 'Brackenmoor Junction',
    platform: '2',
    minutes: 21,
    time: '09:03',
    cancelled: true,
  },
  {
    id: 'e',
    line: 'R2',
    mode: 'train',
    color: 5,
    destination: 'Brackenmoor Junction',
    platform: '1',
    minutes: 33,
    time: '09:15',
    note: 'Replacement bus from Fernhollow',
  },
  {
    id: 'f',
    line: 'N8',
    mode: 'bus',
    destination: 'Larkspur Park',
    minutes: 47,
    time: '09:29',
  },
  {
    id: 'g',
    line: 'F1',
    mode: 'ferry',
    color: 2,
    destination: 'Gull Island',
    minutes: 58,
    time: '09:40',
    delay: -1,
  },
];

function liveDepartures(): HTMLElement {
  let list = DEPARTURES;
  const board = createDeparturesBoard({
    stop: 'Elm Street',
    updated: 'Updated just now',
    departures: list,
    max: 6,
  });
  const tick = h(
    'button',
    {
      type: 'button',
      class: 'mh-button mh-button--secondary mh-button--sm',
      onclick: () =>
        board.update({
          departures: (list = list.map((d) => ({
            ...d,
            minutes: d.minutes === null ? null : d.minutes - 1,
          }))),
        }),
    },
    h('span', { class: 'mh-button__label' }, 'A minute later'),
  );
  return stack(board.el, h('div', { class: 'ex-row' }, tick));
}

// To-do list ----------------------------------------------------------------------------------------------------

const SHOPPING: TodoItem[] = [
  { id: 'milk', text: 'Oat milk', done: false, note: '2 cartons' },
  { id: 'bread', text: 'Sourdough loaf', done: false },
  { id: 'apples', text: 'Apples', done: false, note: 'The crunchy ones' },
  { id: 'soap', text: 'Washing-up liquid', done: false },
  { id: 'eggs', text: 'Eggs', done: true },
  { id: 'rice', text: 'Basmati rice', done: true },
];

function liveTodo(label: string, start: TodoItem[], completedOpen = false): HTMLElement {
  let items = start;
  let next = 0;
  const set = (value: TodoItem[]): void => list.update({ items: (items = value) });
  const list = createTodoList({
    label,
    items,
    completedOpen,
    onAdd: (text) => set([...items, { id: `new-${next++}`, text, done: false }]),
    onToggle: (id, done) => set(items.map((i) => (i.id === id ? { ...i, done } : i))),
    onReorder: (ids) => set([...ids.map((id) => items.find((i) => i.id === id)!), ...items.filter((i) => i.done)]),
    onRemove: (id) => set(items.filter((i) => i.id !== id)),
    onClearCompleted: (ids) => set(items.filter((i) => !ids.includes(i.id))),
  });
  return list.el;
}

export const homeInfoStories: Story[] = [
  {
    id: 'notification-centre',
    render: () =>
      grid(
        inCard(liveNotifications()),
        stack(
          inCard(
            createNotificationCentre({
              notifications: NOTIFICATIONS.slice(5, 7),
              labels: { title: 'Kitchen' },
              headingLevel: 3,
              onDismiss: () => {},
            }).el,
          ),
          inCard(createNotificationCentre({ notifications: [] }).el),
        ),
      ),
  },
  {
    id: 'ambient-clock',
    render: () =>
      stack(
        liveClock(),
        caption('Fixed times: a 12-hour locale, and the night look in the nightstand theme'),
        grid(
          screen(
            createAmbientClock({
              time: new Date(2026, 9, 16, 7, 5),
              locale: 'en-US',
              weather: { condition: 'clear', temperature: 61, unit: '°F' },
              drift: false,
            }).el,
          ),
          screen(
            createAmbientClock({
              time: new Date(2026, 9, 16, 23, 42),
              night: true,
              nextEvent: { title: 'Alarm', when: '06:30' },
              drift: false,
            }).el,
            { 'data-mh-theme': 'nightstand' },
          ),
        ),
      ),
  },
  {
    id: 'state-timeline',
    render: () =>
      stack(
        inCard(
          createStateTimeline({
            label: 'Today at home',
            rows: TIMELINE_ROWS,
            start: day(0),
            end: day(24),
            now: day(18, 20),
          }).el,
          'Today',
        ),
        inCard(
          createStateTimeline({
            label: 'This morning',
            rows: TIMELINE_ROWS.slice(0, 3),
            start: day(6),
            end: day(9),
            ticks: 6,
          }).el,
          'This morning, 06:00 to 09:00',
        ),
      ),
  },
  {
    id: 'activity-feed',
    render: () => {
      const log = caption('Select an entry.');
      return grid(
        inCard(
          stack(
            createActivityFeed({
              items: ACTIVITY,
              onSelect: (id) => (log.textContent = `Selected entry ${id}`),
              onMore: () => (log.textContent = 'Load older entries'),
            }).el,
            log,
          ),
          'Activity',
        ),
        inCard(
          createActivityFeed({
            items: ACTIVITY.slice(0, 4),
            groupByDay: false,
            max: 3,
          }).el,
          'Latest',
        ),
      );
    },
  },
  {
    id: 'departures-board',
    render: () =>
      grid(
        inCard(liveDepartures()),
        stack(
          inCard(
            createDeparturesBoard({
              stop: 'Quayside',
              departures: DEPARTURES.slice(0, 3),
              stale: true,
            }).el,
          ),
          inCard(createDeparturesBoard({ stop: 'Larkspur Park', departures: [] }).el),
        ),
      ),
  },
  {
    id: 'todo-list',
    render: () =>
      grid(
        inCard(liveTodo('Shopping', SHOPPING), 'Shopping'),
        inCard(
          liveTodo(
            'Chores',
            [
              { id: 'plants', text: 'Water the plants', done: false },
              {
                id: 'filter',
                text: 'Change the hood filter',
                done: false,
                note: 'Every 3 months',
              },
              { id: 'bins', text: 'Bins out', done: true },
            ],
            true,
          ),
          'Chores',
        ),
      ),
  },
];
