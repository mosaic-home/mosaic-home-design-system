import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createActivityFeed,
  createAmbientClock,
  createDeparturesBoard,
  createNotificationCentre,
  createStateTimeline,
  createTodoList,
  type Departure,
  type NotificationItem,
  type TodoItem,
} from '../web/index.ts';
import { ActivityFeed, AmbientClock, DeparturesBoard, NotificationCentre, StateTimeline, TodoList } from './index.ts';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const ID_REFS = new Set(['aria-controls', 'aria-labelledby', 'aria-describedby']);

/**
 * Tag, classes, role, ARIA, `hidden`, `tabindex`, `title`, `data-id` and own text of every element, in document
 * order. Ids differ between renderers, so id references are written as the position of the element they point at.
 */
function shape(root: Element): string[] {
  const all = [root, ...root.querySelectorAll('*')];
  const at = new Map(all.filter((el) => el.id).map((el) => [el.id, all.indexOf(el)]));
  const keep = (name: string): boolean => ['class', 'role', 'hidden', 'tabindex', 'title', 'data-id', 'type', 'scope', 'd'].includes(name) || name.startsWith('aria-');
  return all.map((el) => {
    const attrs = Array.from(el.attributes)
      .filter((a) => keep(a.name))
      .map(
        (a) =>
          `${a.name}=${
            ID_REFS.has(a.name)
              ? a.value
                  .split(' ')
                  .map((ref) => `#${at.get(ref) ?? '?'}`)
                  .join(' ')
              : a.value
          }`,
      )
      .sort();
    const text = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent)
      .join('');
    return `${el.tagName.toLowerCase()} ${attrs.join(' ')} ${text}`.trim();
  });
}

function stat(node: ReactElement): Element {
  const div = document.createElement('div');
  div.innerHTML = renderToStaticMarkup(node);
  return div.firstElementChild!;
}

let host: HTMLElement;
let root: Root;
beforeEach(() => {
  document.body.replaceChildren();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
});

async function mount(node: ReactElement): Promise<Element> {
  await act(async () => root.render(node));
  return host.firstElementChild!;
}

const UTC = { locale: 'en-GB', timeZone: 'UTC' } as const;
const at = (hhmm: string, day = '2026-10-16'): number => Date.parse(`${day}T${hhmm}:00Z`);

const NOTES: NotificationItem[] = [
  { id: 'a', title: 'Back door open', group: 'Security', time: '2 min ago' },
  {
    id: 'b',
    title: 'Water leak',
    priority: 'critical',
    message: 'Kitchen sensor is wet.',
    actions: [
      { id: 'v', label: 'Close valve', tone: 'primary' },
      { id: 'm', label: 'Mute' },
    ],
  },
  { id: 'c', title: 'Washer finished', unread: true },
  { id: 'd', title: 'Garage open', group: 'Security', priority: 'high' },
  { id: 'e', title: 'Window open', group: 'Security', priority: 'low' },
];

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
    note: 'Last tram',
  },
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
  { id: '5', line: '9', destination: 'Depot', minutes: null, delay: -1 },
];

const TODOS: TodoItem[] = [
  { id: 'm', text: 'Oat milk', done: false, note: '2 cartons' },
  { id: 'b', text: 'Bread', done: false },
  { id: 'e', text: 'Eggs', done: true },
];

describe('home info parity', () => {
  it('NotificationCentre', () => {
    const fn = (): void => {};
    expect(shape(stat(<NotificationCentre notifications={NOTES} onDismiss={fn} onClearAll={fn} collapseAfter={2} />))).toEqual(
      shape(
        createNotificationCentre({
          notifications: NOTES,
          onDismiss: fn,
          onClearAll: fn,
          collapseAfter: 2,
        }).el,
      ),
    );
    expect(shape(stat(<NotificationCentre notifications={[]} header={false} />))).toEqual(shape(createNotificationCentre({ notifications: [], header: false }).el));
    expect(shape(stat(<NotificationCentre notifications={NOTES.slice(2, 3)} headingLevel={3} labels={{ title: 'Alerts' }} />))).toEqual(
      shape(
        createNotificationCentre({
          notifications: NOTES.slice(2, 3),
          headingLevel: 3,
          labels: { title: 'Alerts' },
        }).el,
      ),
    );
  });

  it('AmbientClock', () => {
    const cases = [
      { ...UTC, time: at('06:45'), drift: false },
      {
        ...UTC,
        time: at('19:05'),
        locale: 'en-US',
        nextEvent: { title: 'Bins out', when: '07:30' },
        weather: { condition: 'rain' as const, temperature: 8 },
        night: true,
        drift: false,
      },
      {
        ...UTC,
        time: at('19:05'),
        hour12: true,
        seconds: true,
        date: false,
        weather: { condition: null, temperature: null, text: 'Unknown' },
        drift: false,
      },
    ];
    for (const c of cases) expect(shape(stat(<AmbientClock {...c} />))).toEqual(shape(createAmbientClock(c).el));
  });

  it('StateTimeline', () => {
    const o = {
      ...UTC,
      start: at('00:00'),
      end: at('00:00', '2026-10-17'),
      now: at('18:00'),
      rows: [
        {
          label: 'Hall light',
          icon: 'lightbulb',
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
    expect(shape(stat(<StateTimeline {...o} />))).toEqual(shape(createStateTimeline(o).el));
    expect(shape(stat(<StateTimeline {...o} now={null} label="Today" />))).toEqual(shape(createStateTimeline({ ...o, now: null, label: 'Today' }).el));
  });

  it('ActivityFeed', () => {
    const items = [
      {
        id: 'a',
        title: 'Heating on',
        time: at('07:00'),
        by: 'Morning routine',
        tone: 'warning' as const,
        icon: 'thermometer',
      },
      { id: 'b', title: 'Back door opened', time: at('11:58'), by: 'Sam' },
      { id: 'c', title: 'Lights off', time: at('23:10', '2026-10-15') },
    ];
    const now = at('12:00');
    const fn = (): void => {};
    expect(shape(stat(<ActivityFeed {...UTC} items={items} now={now} />))).toEqual(shape(createActivityFeed({ ...UTC, items, now }).el));
    expect(shape(stat(<ActivityFeed {...UTC} items={items} now={now} onSelect={fn} onMore={fn} groupByDay={false} />))).toEqual(
      shape(
        createActivityFeed({
          ...UTC,
          items,
          now,
          onSelect: fn,
          onMore: fn,
          groupByDay: false,
        }).el,
      ),
    );
    expect(shape(stat(<ActivityFeed items={[]} now={now} />))).toEqual(shape(createActivityFeed({ items: [], now }).el));
  });

  it('DeparturesBoard', () => {
    expect(shape(stat(<DeparturesBoard stop="Elm Street" updated="Updated 08:40" departures={DEPARTURES} />))).toEqual(
      shape(
        createDeparturesBoard({
          stop: 'Elm Street',
          updated: 'Updated 08:40',
          departures: DEPARTURES,
        }).el,
      ),
    );
    expect(shape(stat(<DeparturesBoard departures={DEPARTURES} stale max={2} />))).toEqual(shape(createDeparturesBoard({ departures: DEPARTURES, stale: true, max: 2 }).el));
    expect(shape(stat(<DeparturesBoard departures={[]} label="Next buses" />))).toEqual(shape(createDeparturesBoard({ departures: [], label: 'Next buses' }).el));
  });

  it('TodoList', async () => {
    const fn = (): void => {};
    const full = {
      label: 'Shopping',
      items: TODOS,
      onAdd: fn,
      onToggle: fn,
      onReorder: fn,
      onRemove: fn,
      onClearCompleted: fn,
    };
    expect(shape(await mount(<TodoList {...full} />))).toEqual(shape(createTodoList(full).el));
    const bare = { label: 'Chores', items: TODOS, completedOpen: true };
    expect(shape(await mount(<TodoList {...bare} />))).toEqual(shape(createTodoList(bare).el));
    expect(shape(await mount(<TodoList label="Empty" items={[]} />))).toEqual(shape(createTodoList({ label: 'Empty', items: [] }).el));
  });
});

describe('home info behaviour', () => {
  it('NotificationCentre folds and moves focus after a dismissal', async () => {
    const onDismiss = vi.fn();
    const el = await mount(<NotificationCentre notifications={NOTES} onDismiss={onDismiss} collapseAfter={2} />);
    const more = el.querySelector<HTMLButtonElement>('.mh-notification-centre__more')!;
    expect(more.textContent).toBe('Show 1 more');
    await act(async () => more.click());
    expect(el.querySelector('.mh-notification-centre__more')!.getAttribute('aria-expanded')).toBe('true');
    const dismiss = el.querySelector<HTMLButtonElement>('[data-id="a"] .mh-notification__dismiss')!;
    dismiss.focus();
    await act(async () => dismiss.click());
    expect(onDismiss).toHaveBeenCalledWith('a');
    await act(async () => root.render(<NotificationCentre notifications={NOTES.filter((n) => n.id !== 'a')} onDismiss={onDismiss} collapseAfter={2} />));
    expect(document.activeElement).toBe(el.querySelector('[data-id="d"] .mh-notification__dismiss'));
  });

  it('TodoList adds, toggles and reorders', async () => {
    const onAdd = vi.fn();
    const onToggle = vi.fn();
    const orders: string[][] = [];
    const el = await mount(<TodoList label="Shopping" items={TODOS} onAdd={onAdd} onToggle={onToggle} onReorder={(ids) => orders.push(ids)} />);
    const input = el.querySelector<HTMLInputElement>('.mh-todo-list__add input')!;
    await act(async () => {
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      set.call(input, ' Apples ');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => el.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(onAdd).toHaveBeenCalledWith('Apples');
    expect(input.value).toBe('');
    await act(async () => el.querySelector<HTMLInputElement>('[data-id="b"] input')!.click());
    expect(onToggle).toHaveBeenCalledWith('b', true);
    const handle = el.querySelector<HTMLButtonElement>('[data-id="m"] .mh-reorder__handle')!;
    handle.focus();
    const key = async (k: string): Promise<void> => {
      await act(async () => {
        handle.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: k,
            bubbles: true,
            cancelable: true,
          }),
        );
      });
    };
    await key(' ');
    await key('ArrowDown');
    expect(orders).toEqual([['b', 'm']]);
    expect([...el.querySelectorAll('.mh-todo-list__open .mh-todo-list__item')].map((r) => (r as HTMLElement).dataset.id)).toEqual(['b', 'm']);
    expect(document.activeElement).toBe(handle);
  });

  it('AmbientClock keeps time on its own', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(at('08:59') + 30_000);
    const el = await mount(<AmbientClock {...UTC} drift={false} />);
    expect(el.querySelector('.mh-ambient-clock__digits')!.textContent).toBe('08:59');
    await act(async () => {
      vi.advanceTimersByTime(31_000);
    });
    expect(el.querySelector('.mh-ambient-clock__digits')!.textContent).toBe('09:00');
    vi.useRealTimers();
  });
});
