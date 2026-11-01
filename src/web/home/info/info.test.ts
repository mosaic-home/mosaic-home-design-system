import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  activityAgo,
  activityDayLabel,
  activityFeedView,
  ambientClockDrift,
  ambientClockNextTick,
  ambientClockParts,
  createActivityFeed,
  createAmbientClock,
  createDeparturesBoard,
  createNotificationCentre,
  createStateTimeline,
  createTodoList,
  departuresBoardView,
  notificationCentreView,
  stateTimelineTicks,
  stateTimelineView,
  todoListView,
  type Departure,
  type NotificationItem,
  type TodoItem,
} from './index.ts';

const UTC = { locale: 'en-GB', timeZone: 'UTC' } as const;
const at = (hhmm: string, day = '2026-10-16'): number => Date.parse(`${day}T${hhmm}:00Z`);

beforeEach(() => document.body.replaceChildren());

// Notification centre -------------------------------------------------------------------------------------------

const NOTES: NotificationItem[] = [
  { id: 'a', title: 'Back door open', group: 'Security', time: '2 min ago' },
  {
    id: 'b',
    title: 'Water leak under the sink',
    priority: 'critical',
    message: 'Kitchen sensor is wet.',
    actions: [{ id: 'valve', label: 'Close valve', tone: 'primary' }],
  },
  { id: 'c', title: 'Washer finished', unread: true },
  { id: 'd', title: 'Garage open', group: 'Security' },
  { id: 'e', title: 'Window open', group: 'Security' },
  { id: 'f', title: 'Porch motion', group: 'Security', priority: 'low' },
];

describe('notificationCentreView', () => {
  it('pins critical ones, groups the rest in order and folds long groups', () => {
    const v = notificationCentreView(NOTES);
    expect(v.pinned.map((n) => n.id)).toEqual(['b']);
    expect(v.groups.map((g) => [g.name, g.items.map((n) => n.id), g.hidden])).toEqual([
      ['Security', ['a', 'd', 'e'], 1],
      ['Other', ['c'], 0],
    ]);
    expect(v.dismissible).toEqual(['a', 'c', 'd', 'e', 'f']);
    expect(notificationCentreView(NOTES, { expanded: new Set(['Security']) }).groups[0]!.items).toHaveLength(4);
    expect(notificationCentreView(NOTES, { collapseAfter: 0 }).groups[0]!.hidden).toBe(0);
    expect(notificationCentreView([{ id: 'x', title: 'Hi' }]).groups[0]!.name).toBeNull();
  });
});

describe('createNotificationCentre', () => {
  it('renders the pinned section, groups, actions and dismiss buttons', () => {
    const onAction = vi.fn();
    const onDismiss = vi.fn();
    const { el } = createNotificationCentre({
      notifications: NOTES,
      onAction,
      onDismiss,
    });
    expect(el.getAttribute('aria-label')).toBe('Notifications');
    expect(el.querySelector('h2')!.textContent).toBe('Notifications');
    expect(el.querySelector('.mh-notification-centre__count')!.textContent).toBe('6');
    const pinned = el.querySelector('.mh-notification-centre__section--pinned')!;
    expect(pinned.querySelector('h3')!.textContent).toBe('Needs attention');
    const critical = pinned.querySelector('.mh-notification')!;
    expect(critical.className).toBe('mh-notification mh-notification--critical');
    expect(critical.querySelector('.mh-notification__title')!.textContent).toBe('Critical: Water leak under the sink');
    expect(critical.querySelector('.mh-notification__dismiss')).toBeNull();
    critical.querySelector<HTMLButtonElement>('.mh-button--tonal')!.click();
    expect(onAction).toHaveBeenCalledWith('b', 'valve');
    const unread = el.querySelector('[data-id="c"]')!;
    expect(unread.classList.contains('is-unread')).toBe(true);
    expect(unread.querySelector('.mh-notification__title')!.textContent).toBe('New: Washer finished');
    el.querySelector<HTMLButtonElement>('[data-id="a"] .mh-notification__dismiss')!.click();
    expect(onDismiss).toHaveBeenCalledWith('a');
    for (const list of el.querySelectorAll('ul')) expect(list.getAttribute('role')).toBe('list');
  });

  it('folds and unfolds a long group', () => {
    const { el } = createNotificationCentre({ notifications: NOTES });
    const more = el.querySelector<HTMLButtonElement>('.mh-notification-centre__more')!;
    expect(more.textContent).toBe('Show 1 more');
    expect(more.getAttribute('aria-expanded')).toBe('false');
    more.click();
    const again = el.querySelector<HTMLButtonElement>('.mh-notification-centre__more')!;
    expect(again.textContent).toBe('Show less');
    expect(again.getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelector('[data-id="f"]')!.className).toBe('mh-notification mh-notification--low');
  });

  it('moves focus to the next notification after a dismissal, and clears all', () => {
    let list = NOTES.slice(0, 3);
    const onClearAll = vi.fn();
    const c = createNotificationCentre({
      notifications: list,
      onDismiss: (id) => c.update({ notifications: (list = list.filter((n) => n.id !== id)) }),
      onClearAll,
    });
    document.body.append(c.el);
    const dismiss = c.el.querySelector<HTMLButtonElement>('[data-id="a"] .mh-notification__dismiss')!;
    dismiss.focus();
    dismiss.click();
    expect(c.el.querySelector('[data-id="a"]')).toBeNull();
    expect(document.activeElement).toBe(c.el.querySelector('[data-id="c"] .mh-notification__dismiss'));
    c.el.querySelector<HTMLButtonElement>('.mh-notification-centre__clear')!.click();
    expect(onClearAll).toHaveBeenCalledWith(['c']);
    c.update({ notifications: [] });
    expect(c.el.querySelector('.mh-notification-centre__empty')!.textContent).toBe('No notifications');
    expect(c.el.querySelector('.mh-notification-centre__clear')).toBeNull();
  });
});

// Ambient clock -------------------------------------------------------------------------------------------------

describe('ambientClockParts', () => {
  it('follows the locale, or a forced 12 or 24 hours', () => {
    const t = at('19:05');
    expect(ambientClockParts(t, { locale: 'en-GB', timeZone: 'UTC' })).toMatchObject({ time: '19:05', period: '', date: 'Friday 16 October' });
    const us = ambientClockParts(t, { locale: 'en-US', timeZone: 'UTC' });
    expect(us.time).toBe('7:05');
    expect(us.period.toUpperCase()).toBe('PM');
    expect(us.periodFirst).toBe(false);
    expect(ambientClockParts(t, { locale: 'en-US', timeZone: 'UTC', hour12: false }).time).toBe('19:05');
    expect(ambientClockParts(t, { locale: 'en-GB', timeZone: 'UTC', hour12: true }).time).toBe('7:05');
    expect(ambientClockParts(at('07:05'), { locale: 'en-GB', timeZone: 'UTC' }, true).time).toBe('07:05:00');
    expect(ambientClockParts(t, UTC).iso).toBe('2026-10-16T19:05:00.000Z');
  });

  it('drifts within the unit square and ticks on the minute', () => {
    for (let s = 0; s < 200; s++) {
      const d = ambientClockDrift(s);
      expect(Math.abs(d.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(d.y)).toBeLessThanOrEqual(1);
    }
    expect(ambientClockDrift(1)).not.toEqual(ambientClockDrift(0));
    expect(ambientClockNextTick(at('10:00') + 59_000, false)).toBe(1005);
    expect(ambientClockNextTick(at('10:00') + 400, true)).toBe(605);
  });
});

describe('createAmbientClock', () => {
  afterEach(() => vi.useRealTimers());

  it('renders the face, event and weather, and dims at night', () => {
    const c = createAmbientClock({
      ...UTC,
      time: at('06:45'),
      nextEvent: { title: 'Bins out', when: '07:30' },
      weather: { condition: 'rain', temperature: 8 },
      drift: false,
    });
    const { el } = c;
    expect(el.className).toBe('mh-ambient-clock');
    expect(el.getAttribute('role')).toBe('group');
    expect(el.getAttribute('aria-label')).toBe('Clock');
    expect(el.querySelector('time')!.getAttribute('datetime')).toBe('2026-10-16T06:45:00.000Z');
    expect(el.querySelector('.mh-ambient-clock__digits')!.textContent).toBe('06:45');
    expect(el.querySelector('.mh-ambient-clock__period')).toBeNull();
    expect(el.querySelector('.mh-ambient-clock__date')!.textContent).toBe('Friday 16 October');
    expect(el.querySelector('.mh-ambient-clock__event')!.textContent).toBe('07:30Bins out');
    expect(el.querySelector('.mh-ambient-clock__temperature')!.textContent).toBe('8°');
    c.update({ night: true, seconds: true, date: false, weather: null });
    expect(el.className).toBe('mh-ambient-clock is-night');
    expect(el.querySelector('.mh-ambient-clock__digits')!.textContent).toBe('06:45');
    expect(el.querySelector('.mh-ambient-clock__date')).toBeNull();
    expect(el.querySelector('.mh-ambient-clock__weather')).toBeNull();
    c.update({ hour12: true, locale: 'en-US' });
    expect(el.querySelector('.mh-ambient-clock__period')).not.toBeNull();
    c.destroy();
  });

  it('keeps time on its own and drifts', () => {
    vi.useFakeTimers();
    vi.setSystemTime(at('08:59') + 30_000);
    const c = createAmbientClock({ ...UTC, driftEvery: 1000 });
    expect(c.el.querySelector('.mh-ambient-clock__digits')!.textContent).toBe('08:59');
    const before = c.el.style.getPropertyValue('--_dx');
    vi.advanceTimersByTime(31_000);
    expect(c.el.querySelector('.mh-ambient-clock__digits')!.textContent).toBe('09:00');
    expect(c.el.style.getPropertyValue('--_dx')).not.toBe(before);
    c.update({ drift: false });
    expect(c.el.style.getPropertyValue('--_dx')).toBe('');
    c.destroy();
  });
});

// State timeline ------------------------------------------------------------------------------------------------

describe('stateTimelineView', () => {
  const opts = {
    ...UTC,
    start: at('00:00'),
    end: at('00:00', '2026-10-17'),
    now: at('18:00'),
    rows: [
      {
        label: 'Hall light',
        spans: [
          { from: at('06:00'), to: at('09:00') },
          { from: at('17:00'), to: null },
        ],
      },
      {
        label: 'Back door',
        state: 'Open',
        color: 3 as const,
        spans: [{ from: at('22:00', '2026-10-15'), to: at('01:00') }],
      },
      { label: 'Garage', spans: [] },
    ],
  };

  it('places, clips and words the spans', () => {
    const v = stateTimelineView(opts);
    const [a, b] = v.rows[0]!.segments;
    expect(a).toMatchObject({
      left: 0.25,
      width: 0.125,
      openStart: false,
      openEnd: false,
      color: 'accent',
      text: 'On, 06:00 to 09:00',
    });
    expect(b!.text).toBe('On, 17:00 until now');
    expect(b!.width).toBeCloseTo(1 / 24);
    expect(b!.openEnd).toBe(true);
    expect(v.rows[1]!.segments[0]).toMatchObject({
      left: 0,
      openStart: true,
      color: 3,
      text: 'Open, since before 00:00 to 01:00',
    });
    expect(v.rows[2]!.segments).toEqual([]);
    expect(v.now).toBe(0.75);
  });

  it('puts ticks on round local hours', () => {
    expect(stateTimelineTicks(at('00:00'), at('00:00', '2026-10-17'), UTC).map((t) => t.label)).toEqual(['00:00', '06:00', '12:00', '18:00', '00:00']);
    const ticks = stateTimelineTicks(at('07:10'), at('09:10'), UTC);
    expect(ticks.map((t) => t.label)).toEqual(['07:30', '08:00', '08:30', '09:00']);
    expect(
      stateTimelineTicks(at('00:00'), at('12:00'), {
        locale: 'en-GB',
        timeZone: 'Asia/Kolkata',
      }).map((t) => t.label)[0],
    ).toBe('06:00');
  });

  it('renders rows, spans and the axis', () => {
    const { el } = createStateTimeline(opts);
    expect(el.getAttribute('role')).toBe('group');
    const spans = el.querySelectorAll('.mh-state-timeline__span');
    expect(spans).toHaveLength(3);
    expect(spans[0]!.getAttribute('title')).toBe('On, 06:00 to 09:00');
    expect((spans[0] as HTMLElement).style.getPropertyValue('--_from')).toBe('25%');
    expect(spans[1]!.className).toBe('mh-state-timeline__span is-open-end');
    expect(spans[2]!.className).toBe('mh-state-timeline__span mh-state-timeline__span--c3 is-open-start');
    expect(el.querySelectorAll('.mh-state-timeline__now')).toHaveLength(3);
    expect(el.querySelectorAll('.mh-state-timeline__row')[2]!.textContent).toBe('GarageNot at all');
    expect(el.querySelector('.mh-state-timeline__axis')!.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelectorAll('.mh-state-timeline__tick')).toHaveLength(5);
  });
});

// Activity feed -------------------------------------------------------------------------------------------------

describe('activity feed', () => {
  const now = at('12:00');
  it('says how long ago in the locale’s words', () => {
    expect(activityAgo(now - 10_000, now, UTC)).toBe('Just now');
    expect(activityAgo(now - 5 * 60_000, now, UTC)).toBe('5 minutes ago');
    expect(activityAgo(now - 3 * 3_600_000, now, UTC)).toBe('3 hours ago');
    expect(activityAgo(at('20:00', '2026-10-15'), now, UTC)).toBe('16 hours ago');
    expect(activityAgo(at('08:00', '2026-10-14'), now, UTC)).toBe('2 days ago');
    expect(activityAgo(at('08:00', '2026-10-01'), now, UTC)).toBe('1 Oct');
    expect(activityDayLabel(now, now, UTC)).toBe('Today');
    expect(activityDayLabel(at('08:00', '2026-10-15'), now, UTC)).toBe('Yesterday');
    expect(activityDayLabel(at('08:00', '2026-10-13'), now, UTC)).toBe('Tuesday');
    expect(activityDayLabel(at('08:00', '2026-10-01'), now, UTC)).toBe('Thursday 1 October');
  });

  const items = [
    {
      id: 'a',
      title: 'Heating on',
      time: at('07:00'),
      by: 'Morning routine',
      tone: 'warning' as const,
    },
    { id: 'b', title: 'Back door opened', time: at('11:58'), by: 'Sam' },
    { id: 'c', title: 'Lights off', time: at('23:10', '2026-10-15') },
  ];

  it('sorts newest first and splits into days', () => {
    const v = activityFeedView({ ...UTC, items }, now);
    expect(v.days.map((d) => [d.label, d.entries.map((e) => e.item.id)])).toEqual([
      ['Today', ['b', 'a']],
      ['Yesterday', ['c']],
    ]);
    expect(activityFeedView({ ...UTC, items, groupByDay: false, max: 2 }, now).days).toHaveLength(1);
  });

  it('renders entries, rows as buttons and the more button', () => {
    const onSelect = vi.fn();
    const onMore = vi.fn();
    const f = createActivityFeed({ ...UTC, items, now, onSelect, onMore });
    expect(f.el.getAttribute('aria-label')).toBe('Activity');
    expect([...f.el.querySelectorAll('h3')].map((n) => n.textContent)).toEqual(['Today', 'Yesterday']);
    const first = f.el.querySelector('.mh-activity-feed__item')!;
    expect(first.querySelector('.mh-activity-feed__by')!.textContent).toBe('by Sam');
    const time = first.querySelector('time')!;
    expect(time.textContent).toBe('2 minutes ago');
    expect(time.getAttribute('datetime')).toBe('2026-10-16T11:58:00.000Z');
    expect(f.el.querySelector('[data-id="c"] time')!.textContent).toBe('23:10');
    expect(f.el.querySelector('[data-id="a"]')!.className).toBe('mh-activity-feed__item mh-activity-feed__item--warning');
    first.querySelector<HTMLButtonElement>('button')!.click();
    expect(onSelect).toHaveBeenCalledWith('b');
    f.el.querySelector<HTMLButtonElement>('.mh-activity-feed__more')!.click();
    expect(onMore).toHaveBeenCalled();
    f.update({ items: [] });
    expect(f.el.querySelector('.mh-activity-feed__empty')).not.toBeNull();
    f.destroy();
  });

  it('refreshes the "ago" texts in place without a fixed now', () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const f = createActivityFeed({
      ...UTC,
      items: [{ id: 'x', title: 'Door', time: now - 60_000 }],
      onSelect: () => {},
    });
    const row = f.el.querySelector('button')!;
    expect(f.el.querySelector('time')!.textContent).toBe('1 minute ago');
    vi.advanceTimersByTime(120_000);
    expect(f.el.querySelector('time')!.textContent).toBe('3 minutes ago');
    expect(f.el.querySelector('button')).toBe(row);
    f.destroy();
    vi.useRealTimers();
  });
});

// Departures board ----------------------------------------------------------------------------------------------

const DEPARTURES: Departure[] = [
  {
    id: '1',
    line: '42',
    mode: 'bus',
    destination: 'Harbour Gate',
    minutes: 12,
    time: '08:52',
    delay: 3,
    live: true,
  },
  {
    id: '2',
    line: 'T2',
    mode: 'tram',
    color: 2,
    destination: 'Mill Lane',
    via: 'via Old Market',
    minutes: 0,
    live: true,
  },
  { id: '3', line: '42', destination: 'Harbour Gate', minutes: -1 },
  {
    id: '4',
    line: 'R7',
    mode: 'train',
    destination: 'Brackenmoor',
    platform: '2',
    minutes: 25,
    cancelled: true,
    time: '09:05',
  },
  { id: '5', line: '9', destination: 'Depot', minutes: null },
];

describe('departures board', () => {
  it('drops departed services, sorts by minutes and cuts to max', () => {
    const v = departuresBoardView(DEPARTURES);
    expect(v.rows.map((d) => d.id)).toEqual(['2', '1', '4', '5']);
    expect(v.platforms).toBe(true);
    const cut = departuresBoardView(DEPARTURES, 2);
    expect([cut.rows.length, cut.hidden, cut.platforms]).toEqual([2, 2, false]);
  });

  it('renders a table with spoken minutes, delays and cancellations', () => {
    const b = createDeparturesBoard({
      stop: 'Elm Street',
      updated: 'Updated 08:40',
      departures: DEPARTURES,
    });
    const { el } = b;
    expect(el.getAttribute('aria-label')).toBe('Elm Street');
    expect(el.querySelector('h3')!.textContent).toBe('Elm Street');
    expect([...el.querySelectorAll('th')].map((t) => t.textContent)).toEqual(['Line', 'Destination', 'Platform', 'Departs']);
    const rows = el.querySelectorAll('tbody tr');
    expect(rows[0]!.className).toBe('mh-departures-board__row is-due');
    expect(rows[0]!.querySelector('.mh-departures-board__line-badge')!.className).toBe('mh-departures-board__line-badge mh-departures-board__line-badge--c2');
    expect(rows[0]!.querySelector('.mh-departures-board__departs')!.textContent).toBe('NowNow');
    expect(rows[1]!.className).toBe('mh-departures-board__row is-late');
    expect(rows[1]!.querySelector('.mh-departures-board__departs')!.textContent).toBe('12minin 12 minutes+33 min lateTimetabled 08:52');
    expect(rows[1]!.querySelector('.mh-departures-board__live')!.getAttribute('aria-label')).toBe('Live');
    expect(rows[2]!.className).toBe('mh-departures-board__row is-cancelled');
    expect(rows[2]!.querySelector('.mh-departures-board__cancelled')!.textContent).toBe('Cancelled');
    expect(rows[2]!.querySelector('.mh-departures-board__platform')!.textContent).toBe('2');
    expect(rows[3]!.querySelector('.mh-departures-board__value')!.textContent).toBe('–');
    b.update({ stale: true, departures: [] });
    expect(el.className).toBe('mh-departures-board is-stale');
    expect(el.querySelector('.mh-departures-board__stale')).not.toBeNull();
    expect(el.querySelector('.mh-departures-board__empty')!.textContent).toBe('No departures soon');
  });
});

// To-do list ----------------------------------------------------------------------------------------------------

const TODOS: TodoItem[] = [
  { id: 'm', text: 'Oat milk', done: false, note: '2 cartons' },
  { id: 'b', text: 'Bread', done: false },
  { id: 'e', text: 'Eggs', done: true },
];

describe('todo list', () => {
  it('splits open and done items', () => {
    expect(todoListView(TODOS)).toEqual({
      open: TODOS.slice(0, 2),
      done: TODOS.slice(2),
    });
  });

  it('adds, toggles, removes and clears', () => {
    const onAdd = vi.fn();
    const onToggle = vi.fn();
    const onRemove = vi.fn();
    const onClearCompleted = vi.fn();
    const t = createTodoList({
      label: 'Shopping',
      items: TODOS,
      onAdd,
      onToggle,
      onRemove,
      onClearCompleted,
    });
    const { el } = t;
    document.body.append(el);
    expect(el.getAttribute('aria-label')).toBe('Shopping');
    const input = el.querySelector<HTMLInputElement>('.mh-todo-list__add input')!;
    input.value = '  Apples ';
    el.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(onAdd).toHaveBeenCalledWith('Apples');
    expect(input.value).toBe('');
    expect(el.querySelector('.mh-reorder__live')!.textContent).toBe('Apples added');
    const open = el.querySelectorAll('.mh-todo-list__open .mh-todo-list__item');
    expect(open).toHaveLength(2);
    expect(open[0]!.querySelector('.mh-reorder__handle')).toBeNull();
    expect(open[0]!.querySelector('label')!.textContent).toBe('Oat milk2 cartons');
    const box = open[1]!.querySelector<HTMLInputElement>('input')!;
    box.checked = true;
    box.dispatchEvent(new Event('change'));
    expect(onToggle).toHaveBeenCalledWith('b', true);
    open[0]!.querySelector<HTMLButtonElement>('.mh-todo-list__remove')!.click();
    expect(onRemove).toHaveBeenCalledWith('m');
    const toggle = el.querySelector<HTMLButtonElement>('.mh-todo-list__toggle')!;
    expect(toggle.textContent).toBe('Completed (1)');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelector<HTMLElement>('.mh-todo-list__done-list')!.hidden).toBe(true);
    toggle.click();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelector<HTMLElement>('.mh-todo-list__done-list')!.hidden).toBe(false);
    el.querySelector<HTMLButtonElement>('.mh-todo-list__clear')!.click();
    expect(onClearCompleted).toHaveBeenCalledWith(['e']);
    t.update({ items: [] });
    expect(el.querySelector('.mh-todo-list__empty')!.textContent).toBe('Nothing on the list');
    expect(el.querySelector('.mh-todo-list__done')).toBeNull();
    t.update({ items: [{ id: 'x', text: 'Done thing', done: true }] });
    expect(el.querySelector('.mh-todo-list__empty')!.textContent).toBe('All done');
    t.destroy();
  });

  it('keeps focus on a checked-off item and its row when nothing changed', () => {
    let items = TODOS;
    const t = createTodoList({
      label: 'Shopping',
      items,
      completedOpen: true,
      onToggle: (id, done) =>
        t.update({
          items: (items = items.map((i) => (i.id === id ? { ...i, done } : i))),
        }),
    });
    document.body.append(t.el);
    const breadRow = t.el.querySelector('[data-id="b"]');
    const milk = t.el.querySelector<HTMLInputElement>('[data-id="m"] input')!;
    milk.focus();
    milk.checked = true;
    milk.dispatchEvent(new Event('change'));
    expect(t.el.querySelector('[data-id="b"]')).toBe(breadRow);
    const moved = t.el.querySelector<HTMLInputElement>('.mh-todo-list__done-list [data-id="m"] input')!;
    expect(moved.checked).toBe(true);
    expect(document.activeElement).toBe(moved);
    t.destroy();
  });

  it('moves focus to the next open item when the completed list is folded', () => {
    let items: TodoItem[] = [...TODOS.slice(0, 2), { id: 'c', text: 'Cheese', done: false }];
    const t = createTodoList({
      label: 'Shopping',
      items,
      onToggle: (id, done) =>
        t.update({
          items: (items = items.map((i) => (i.id === id ? { ...i, done } : i))),
        }),
    });
    document.body.append(t.el);
    const bread = t.el.querySelector<HTMLInputElement>('[data-id="b"] input')!;
    bread.focus();
    bread.checked = true;
    bread.dispatchEvent(new Event('change'));
    expect(document.activeElement).toBe(t.el.querySelector('[data-id="c"] input'));
    t.destroy();
  });

  it('reorders open items from the keyboard', () => {
    const orders: string[][] = [];
    const t = createTodoList({
      label: 'Shopping',
      items: TODOS,
      onReorder: (ids) => orders.push(ids),
    });
    document.body.append(t.el);
    const handle = t.el.querySelector<HTMLButtonElement>('[data-id="m"] .mh-reorder__handle')!;
    expect(handle.getAttribute('aria-label')).toBe('Reorder Oat milk');
    expect(t.el.querySelector('.mh-todo-list__done-list .mh-reorder__handle')).toBeNull();
    handle.focus();
    const key = (k: string): boolean =>
      handle.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: k,
          bubbles: true,
          cancelable: true,
        }),
      );
    key(' ');
    key('ArrowDown');
    key(' ');
    expect(orders).toEqual([['b', 'm']]);
    expect([...t.el.querySelectorAll('.mh-todo-list__open .mh-todo-list__item')].map((r) => (r as HTMLElement).dataset.id)).toEqual(['b', 'm']);
    expect(t.el.querySelector('.mh-reorder__live')!.textContent).toBe('Oat milk dropped at position 2 of 2.');
    t.destroy();
  });
});
