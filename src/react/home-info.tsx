// React bindings for the home group: Information screens: notification centre, ambient clock, state timeline, activity feed, departures board, to-do list.
import { mdiCheck, mdiMinus } from '@mdi/js';
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { iconButtonClass } from '../web/actions/iconButton.ts';
import { cx } from '../web/dom.ts';
import { bindReorderableList, defaultReorderMessages, moveItem } from '../web/layout/reorderableList.ts';
import { inputClass } from '../web/text-inputs/textField.ts';
import { formatTemperature, weatherIcon, weatherIconClass, weatherWord } from '../web/home/weather.ts';
import {
  NOTIFICATION_CENTRE_LABELS,
  NOTIFICATION_DISMISS_ICON,
  notificationActionVariant,
  notificationCentreView,
  notificationClass,
  notificationDismissible,
  notificationIcon,
  notificationPrefix,
  type NotificationCentreOptions,
  type NotificationItem,
} from '../web/home/info/notificationCentre.ts';
import {
  AMBIENT_CLOCK_EVENT_ICON,
  ambientClockClass,
  ambientClockDrift,
  ambientClockNextTick,
  ambientClockParts,
  type AmbientClockOptions,
} from '../web/home/info/ambientClock.ts';
import { STATE_TIMELINE_LABELS, stateTimelinePercent, stateTimelineSpanClass, stateTimelineView, type StateTimelineOptions } from '../web/home/info/stateTimeline.ts';
import {
  ACTIVITY_DEFAULT_ICON,
  ACTIVITY_FEED_LABELS,
  activityFeedView,
  activityItemClass,
  type ActivityEntryView,
  type ActivityFeedOptions,
} from '../web/home/info/activityFeed.ts';
import {
  DEPARTURES_BOARD_LABELS,
  DEPARTURE_LIVE_ICON,
  DEPARTURE_MODE_ICONS,
  DEPARTURE_STALE_ICON,
  departureDelay,
  departureLineClass,
  departureRowClass,
  departureWhen,
  departuresBoardView,
  type Departure,
  type DeparturesBoardOptions,
} from '../web/home/info/departuresBoard.ts';
import {
  TODO_ADD_ICON,
  TODO_HANDLE_ICON,
  TODO_LIST_LABELS,
  TODO_REMOVE_ICON,
  TODO_TOGGLE_ICON,
  todoItemClass,
  todoListRefocus,
  todoListView,
  type TodoItem,
  type TodoListOptions,
} from '../web/home/info/todoList.ts';
import { Button, IconButton } from './actions.tsx';
import { Icon } from './foundations.tsx';

const reducedMotion = (): boolean => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The latest value of a prop, for listeners bound once. */
function useLatestInfo<T>(value: T): { readonly current: T } {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}

/** The current time, refreshed every `every` ms while `on`. */
function useNow(on: boolean, every: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!on) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), every);
    return () => clearInterval(id);
  }, [on, every]);
  return now;
}

// Notification centre ------------------------------------------------------------------------------------------

export interface NotificationCentreProps extends NotificationCentreOptions {
  className?: string;
}

/** Same DOM and classes as `createNotificationCentre`. */
export function NotificationCentre({ notifications, header = true, headingLevel = 2, collapseAfter, onAction, onDismiss, onClearAll, labels, className }: NotificationCentreProps) {
  const L = { ...NOTIFICATION_CENTRE_LABELS, ...labels };
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());
  const ref = useRef<HTMLElement>(null);
  const refocusAt = useRef<number | null>(null);
  const canDismiss = !!onDismiss;
  const view = notificationCentreView(notifications, {
    collapseAfter,
    expanded,
    canDismiss,
    other: L.other,
  });
  const Head = `h${headingLevel}` as 'h2';
  const Sub = `h${Math.min(headingLevel + 1, 6)}` as 'h3';

  useLayoutEffect(() => {
    const root = ref.current;
    const at = refocusAt.current;
    if (!root || at === null) return;
    refocusAt.current = null;
    if (root.contains(document.activeElement) && document.activeElement !== root) return;
    const rows = [...root.querySelectorAll<HTMLElement>('.mh-notification')];
    const row = rows[Math.min(at, rows.length - 1)];
    (row?.querySelector<HTMLElement>('.mh-notification__dismiss, button') ?? root).focus();
  }, [notifications]);

  const item = (n: NotificationItem) => {
    const prefix = notificationPrefix(n, L);
    return (
      <li key={n.id} className={notificationClass(n)} data-id={n.id}>
        <span className="mh-notification__icon" aria-hidden="true">
          <Icon icon={notificationIcon(n)} />
        </span>
        <div className="mh-notification__body">
          <div className="mh-notification__top">
            <span className="mh-notification__title">
              {prefix && <span className="mh-visually-hidden">{prefix}</span>}
              {n.title}
            </span>
            {n.time && <span className="mh-notification__time">{n.time}</span>}
          </div>
          {n.message && <p className="mh-notification__message">{n.message}</p>}
          {!!n.actions?.length && (
            <div className="mh-notification__actions">
              {n.actions.map((a) => (
                <Button key={a.id} size="small" variant={notificationActionVariant(a.tone)} onClick={() => onAction?.(n.id, a.id)}>
                  {a.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        {notificationDismissible(n, canDismiss) && (
          <IconButton
            icon={NOTIFICATION_DISMISS_ICON}
            label={L.dismiss(n.title)}
            size="small"
            className="mh-notification__dismiss"
            onClick={(e) => {
              const li = e.currentTarget.closest('.mh-notification');
              refocusAt.current = li && ref.current ? [...ref.current.querySelectorAll('.mh-notification')].indexOf(li) : null;
              onDismiss?.(n.id);
            }}
          />
        )}
      </li>
    );
  };

  const section = (key: string, name: string | null, items: NotificationItem[], pinned: boolean, group?: (typeof view.groups)[number]) => (
    <div key={key} className={cx('mh-notification-centre__section', pinned && 'mh-notification-centre__section--pinned')}>
      {name && <Sub className="mh-notification-centre__section-title">{name}</Sub>}
      <ul className="mh-notification-centre__list" role="list">
        {items.map(item)}
      </ul>
      {group?.folds && (
        <Button
          size="small"
          variant="text"
          className="mh-notification-centre__more"
          aria-expanded={group.expanded}
          data-group={group.key}
          onClick={() =>
            setExpanded((prev) => {
              const next = new Set(prev);
              if (next.has(group.key)) next.delete(group.key);
              else next.add(group.key);
              return next;
            })
          }
        >
          {group.expanded ? L.showLess : L.showMore(group.hidden)}
        </Button>
      )}
    </div>
  );

  return (
    <section ref={ref} className={cx('mh-notification-centre', className)} tabIndex={-1} aria-label={L.title}>
      {header && (
        <div className="mh-notification-centre__header">
          <Head className="mh-notification-centre__title">{L.title}</Head>
          {view.count > 0 && <span className="mh-notification-centre__count">{view.count}</span>}
          {onClearAll && view.dismissible.length > 0 && (
            <Button size="small" variant="text" className="mh-notification-centre__clear" onClick={() => onClearAll(view.dismissible)}>
              {L.clearAll}
            </Button>
          )}
        </div>
      )}
      {view.pinned.length > 0 && section('\u0000pinned', L.pinned, view.pinned, true)}
      {view.groups.map((g) => section(g.key, g.name, g.items, false, g))}
      {view.count === 0 && <p className="mh-notification-centre__empty">{L.empty}</p>}
    </section>
  );
}

// Ambient clock ------------------------------------------------------------------------------------------------

export interface AmbientClockProps extends AmbientClockOptions {
  className?: string;
}

/** Same DOM and classes as `createAmbientClock`; keeps its own time when `time` is absent. */
export function AmbientClock({
  time,
  locale,
  hour12,
  timeZone,
  seconds,
  date = true,
  nextEvent,
  weather,
  night,
  drift = true,
  driftEvery = 60_000,
  label = 'Clock',
  className,
}: AmbientClockProps) {
  const showSeconds = !!seconds && !night;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (time !== undefined) return;
    let id: ReturnType<typeof setTimeout>;
    const loop = (): void => {
      id = setTimeout(
        () => {
          setNow(Date.now());
          loop();
        },
        ambientClockNextTick(Date.now(), showSeconds),
      );
    };
    setNow(Date.now());
    loop();
    return () => clearTimeout(id);
  }, [time, showSeconds]);
  const [step, setStep] = useState(0);
  const [moving, setMoving] = useState(false);
  useEffect(() => {
    if (!drift || reducedMotion()) {
      setMoving(false);
      return;
    }
    setMoving(true);
    const id = setInterval(() => setStep((s) => s + 1), driftEvery);
    return () => clearInterval(id);
  }, [drift, driftEvery]);
  const p = ambientClockParts(time ?? now, { locale, hour12, timeZone }, showSeconds);
  const d = ambientClockDrift(step);
  const style = moving ? ({ '--_dx': String(d.x), '--_dy': String(d.y) } as CSSProperties) : undefined;
  const digits = <span className="mh-ambient-clock__digits">{p.time}</span>;
  const period = p.period ? <span className="mh-ambient-clock__period">{p.period}</span> : null;
  const word = weather ? (weather.text ?? weatherWord(weather.condition)) : '';
  return (
    <div className={cx(ambientClockClass({ night }), className)} role="group" aria-label={label} style={style}>
      <div className="mh-ambient-clock__face">
        <time className="mh-ambient-clock__time" dateTime={p.iso}>
          {p.periodFirst && period}
          {digits}
          {!p.periodFirst && period}
        </time>
        {date && <div className="mh-ambient-clock__date">{p.date}</div>}
        {(nextEvent || weather) && (
          <div className="mh-ambient-clock__extras">
            {nextEvent && (
              <div className="mh-ambient-clock__event">
                <Icon icon={nextEvent.icon ?? AMBIENT_CLOCK_EVENT_ICON} className="mh-ambient-clock__event-icon" />
                {nextEvent.when && <span className="mh-ambient-clock__event-when">{nextEvent.when}</span>}
                <span className="mh-ambient-clock__event-title">{nextEvent.title}</span>
              </div>
            )}
            {weather && (
              <div className="mh-ambient-clock__weather">
                <Icon icon={weatherIcon(weather.condition)} className={weatherIconClass(weather.condition, 'mh-ambient-clock__weather-icon')} />
                <span className="mh-ambient-clock__temperature">{formatTemperature(weather.temperature, weather.unit)}</span>
                {word && <span className="mh-ambient-clock__condition">{word}</span>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// State timeline -----------------------------------------------------------------------------------------------

export interface StateTimelineProps extends StateTimelineOptions {
  className?: string;
}

/** Same DOM and classes as `createStateTimeline`. */
export function StateTimeline({ className, ...options }: StateTimelineProps) {
  const L = { ...STATE_TIMELINE_LABELS, ...options.labels };
  const view = stateTimelineView(options);
  const at = (v: number): CSSProperties => ({ '--_at': stateTimelinePercent(v) }) as CSSProperties;
  return (
    <div className={cx('mh-state-timeline', className)} role="group" aria-label={options.label ?? 'Timeline'}>
      <ul className="mh-state-timeline__rows" role="list">
        {view.rows.map((row, r) => (
          <li key={options.rows[r]?.id ?? r} className="mh-state-timeline__row">
            <span className="mh-state-timeline__label">
              {row.icon && <Icon icon={row.icon} className="mh-state-timeline__icon" />}
              <span className="mh-state-timeline__name">{row.label}</span>
            </span>
            <span className="mh-state-timeline__track">
              {row.segments.map((s, i) => (
                <span
                  key={i}
                  className={stateTimelineSpanClass(s)}
                  title={s.text}
                  style={
                    {
                      '--_from': stateTimelinePercent(s.left),
                      '--_len': stateTimelinePercent(s.width),
                    } as CSSProperties
                  }
                >
                  <span className="mh-visually-hidden">{s.text}</span>
                </span>
              ))}
              {row.segments.length === 0 && <span className="mh-visually-hidden">{L.none}</span>}
              {view.now !== null && <span className="mh-state-timeline__now" aria-hidden="true" style={at(view.now)} />}
            </span>
          </li>
        ))}
      </ul>
      <div className="mh-state-timeline__axis" aria-hidden="true">
        <span className="mh-state-timeline__scale">
          {view.ticks.map((t) => (
            <span
              key={t.at}
              className="mh-state-timeline__tick"
              style={
                {
                  '--_at': stateTimelinePercent(t.at),
                  '--_k': String(Math.round(t.at * 1000) / 1000),
                } as CSSProperties
              }
            >
              {t.label}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}

// Activity feed ------------------------------------------------------------------------------------------------

export interface ActivityFeedProps extends ActivityFeedOptions {
  className?: string;
}

/** Same DOM and classes as `createActivityFeed`; refreshes its "ago" texts when `now` is absent. */
export function ActivityFeed({ className, ...options }: ActivityFeedProps) {
  const L = { ...ACTIVITY_FEED_LABELS, ...options.labels };
  const clock = useNow(options.now === undefined, 30_000);
  const view = activityFeedView(options, options.now ?? clock);
  const Heading = `h${options.headingLevel ?? 3}` as 'h3';
  const { onSelect, onMore } = options;
  const content = (e: ActivityEntryView) => (
    <>
      <span className="mh-activity-feed__icon" aria-hidden="true">
        <Icon icon={e.item.icon ?? ACTIVITY_DEFAULT_ICON} />
      </span>
      <span className="mh-activity-feed__text">
        <span className="mh-activity-feed__title">{e.item.title}</span>
        {e.item.by && (
          <span className="mh-activity-feed__by">
            <span className="mh-visually-hidden">{`${L.by} `}</span>
            {e.item.by}
          </span>
        )}
      </span>
      <time className="mh-activity-feed__time" dateTime={e.iso} title={e.full}>
        {e.ago}
      </time>
    </>
  );
  return (
    <section className={cx('mh-activity-feed', className)} aria-label={options.label ?? 'Activity'}>
      {view.days.map((d, i) => (
        <div key={d.label ?? i} className="mh-activity-feed__day">
          {d.label && <Heading className="mh-activity-feed__day-label">{d.label}</Heading>}
          <ol className="mh-activity-feed__list" role="list">
            {d.entries.map((e) => (
              <li key={e.item.id} className={activityItemClass(e.item.tone)} data-id={e.item.id}>
                {onSelect ? (
                  <button type="button" className="mh-activity-feed__row mh-activity-feed__row--button" onClick={() => onSelect(e.item.id)}>
                    {content(e)}
                  </button>
                ) : (
                  <div className="mh-activity-feed__row">{content(e)}</div>
                )}
              </li>
            ))}
          </ol>
        </div>
      ))}
      {view.empty && <p className="mh-activity-feed__empty">{L.empty}</p>}
      {onMore && (
        <Button variant="text" size="small" className="mh-activity-feed__more" onClick={() => onMore()}>
          {L.more}
        </Button>
      )}
    </section>
  );
}

// Departures board ---------------------------------------------------------------------------------------------

export interface DeparturesBoardProps extends DeparturesBoardOptions {
  className?: string;
}

/** Same DOM and classes as `createDeparturesBoard`. */
export function DeparturesBoard({ stop, departures, max, updated, stale, headingLevel = 3, label, labels, className }: DeparturesBoardProps) {
  const L = { ...DEPARTURES_BOARD_LABELS, ...labels };
  const view = departuresBoardView(departures, max);
  const Heading = `h${headingLevel}` as 'h3';
  const row = (d: Departure) => {
    const when = departureWhen(d, L);
    const delay = departureDelay(d, L);
    const live = d.live && !stale && !d.cancelled;
    return (
      <tr key={d.id} className={departureRowClass(d)} data-id={d.id}>
        <td className="mh-departures-board__line">
          <span className={departureLineClass(d.color)}>
            {d.mode && <Icon icon={DEPARTURE_MODE_ICONS[d.mode]} />}
            <span className="mh-departures-board__line-name">{d.line}</span>
          </span>
        </td>
        <td className="mh-departures-board__destination">
          <span className="mh-departures-board__name">{d.destination}</span>
          {d.via && <span className="mh-departures-board__via">{d.via}</span>}
          {d.note && <span className="mh-departures-board__note">{d.note}</span>}
        </td>
        {view.platforms && <td className="mh-departures-board__platform">{d.platform ?? ''}</td>}
        <td className="mh-departures-board__departs">
          {d.cancelled ? (
            <span className="mh-departures-board__cancelled">{L.cancelled}</span>
          ) : (
            <span className="mh-departures-board__minutes">
              {live && <Icon icon={DEPARTURE_LIVE_ICON} className="mh-departures-board__live" label={L.live} />}
              <span className="mh-departures-board__value" aria-hidden={when.spoken ? true : undefined}>
                {when.value}
              </span>
              {when.unit && (
                <span className="mh-departures-board__unit" aria-hidden="true">
                  {when.unit}
                </span>
              )}
              {when.spoken && <span className="mh-visually-hidden">{when.spoken}</span>}
            </span>
          )}
          {delay && (
            <span className="mh-departures-board__delay">
              <span aria-hidden="true">{delay.text}</span>
              <span className="mh-visually-hidden">{delay.spoken}</span>
            </span>
          )}
          {d.time && (
            <span className="mh-departures-board__time">
              <span className="mh-visually-hidden">{`${L.scheduled} `}</span>
              {d.time}
            </span>
          )}
        </td>
      </tr>
    );
  };
  return (
    <section className={cx('mh-departures-board', stale && 'is-stale', className)} aria-label={stop || label || 'Departures'}>
      {(stop || updated) && (
        <div className="mh-departures-board__header">
          {stop && <Heading className="mh-departures-board__stop">{stop}</Heading>}
          {updated && <span className="mh-departures-board__updated">{updated}</span>}
        </div>
      )}
      {stale && (
        <p className="mh-departures-board__stale">
          <Icon icon={DEPARTURE_STALE_ICON} />
          {L.stale}
        </p>
      )}
      {view.rows.length > 0 ? (
        <table className="mh-departures-board__table">
          <thead className="mh-visually-hidden">
            <tr>
              <th scope="col" className="mh-departures-board__th">
                {L.line}
              </th>
              <th scope="col" className="mh-departures-board__th">
                {L.destination}
              </th>
              {view.platforms && (
                <th scope="col" className="mh-departures-board__th">
                  {L.platform}
                </th>
              )}
              <th scope="col" className="mh-departures-board__th">
                {L.departs}
              </th>
            </tr>
          </thead>
          <tbody>{view.rows.map(row)}</tbody>
        </table>
      ) : (
        <p className="mh-departures-board__empty">{L.empty}</p>
      )}
      {view.hidden > 0 && <p className="mh-departures-board__more">{L.more(view.hidden)}</p>}
    </section>
  );
}

// To-do list ---------------------------------------------------------------------------------------------------

export interface TodoListProps extends TodoListOptions {
  className?: string;
}

/** Same DOM and classes as `createTodoList`; reordering comes from the layout group's `bindReorderableList`. */
export function TodoList({ label, items, onAdd, onToggle, onReorder, onRemove, onClearCompleted, completedOpen = false, messages, labels, className }: TodoListProps) {
  const L = { ...TODO_LIST_LABELS, ...labels };
  const m = { ...defaultReorderMessages, ...messages };
  const instructionsId = useId();
  const doneListId = useId();
  const [text, setText] = useState('');
  const [doneOpen, setDoneOpen] = useState(completedOpen);
  useEffect(() => setDoneOpen(completedOpen), [completedOpen]);
  const [order, setOrder] = useState<string[] | null>(null);
  useEffect(() => setOrder(null), [items]);
  const view = todoListView(items);
  const open = order ? order.map((id) => view.open.find((i) => i.id === id)).filter((i): i is TodoItem => !!i) : view.open;
  const rootRef = useRef<HTMLElement>(null);
  const openRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const refocus = useRef<{ id: string; at: number } | null>(null);
  const latest = useLatestInfo({ open, onReorder, messages });

  const announce = (words: string): void => {
    if (liveRef.current) liveRef.current.textContent = words;
  };

  useEffect(() => {
    const c = bindReorderableList(openRef.current!, {
      get messages() {
        return latest.current.messages;
      },
      onMove: (from, to) => {
        const next = moveItem(
          latest.current.open.map((i) => i.id),
          from,
          to,
        );
        setOrder(next);
        latest.current.onReorder?.(next);
      },
    });
    return () => c.destroy();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    const root = rootRef.current;
    const r = refocus.current;
    if (!root || r === null) return;
    refocus.current = null;
    if (root.contains(document.activeElement)) return;
    const box = [...root.querySelectorAll<HTMLElement>('.mh-todo-list__item')].find((li) => li.dataset.id === r.id)?.querySelector<HTMLInputElement>('.mh-checkbox__input');
    todoListRefocus(root, box ?? null, r.at);
  }, [items]);

  const submit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    onAdd?.(t);
    setText('');
    announce(L.added(t));
  };

  const row = (item: TodoItem) => (
    <li key={item.id} className={todoItemClass(item.done)} data-id={item.id}>
      {!item.done && onReorder && (
        <button type="button" className="mh-reorder__handle" aria-label={m.handle(item.text)} aria-describedby={instructionsId} aria-pressed="false">
          <Icon icon={TODO_HANDLE_ICON} />
        </button>
      )}
      <label className="mh-checkbox mh-todo-list__check">
        <span className="mh-checkbox__control">
          <input
            type="checkbox"
            className="mh-checkbox__input"
            checked={item.done}
            onChange={(e) => {
              const li = e.target.closest('li');
              refocus.current = {
                id: item.id,
                at: li ? Array.from(li.parentElement?.children ?? []).indexOf(li) : 0,
              };
              announce((e.target.checked ? L.checked : L.unchecked)(item.text));
              onToggle?.(item.id, e.target.checked);
            }}
          />
          <Icon icon={mdiCheck} className="mh-checkbox__check" />
          <Icon icon={mdiMinus} className="mh-checkbox__dash" />
        </span>
        <span className="mh-checkbox__text">
          <span className="mh-checkbox__label mh-reorder__label mh-todo-list__text">{item.text}</span>
          {item.note && <span className="mh-checkbox__description mh-todo-list__note">{item.note}</span>}
        </span>
      </label>
      {onRemove && (
        <button
          type="button"
          className={cx(iconButtonClass('default', 'small'), 'mh-todo-list__remove')}
          aria-label={L.remove(item.text)}
          title={L.remove(item.text)}
          onClick={() => onRemove(item.id)}
        >
          <Icon icon={TODO_REMOVE_ICON} />
        </button>
      )}
    </li>
  );

  return (
    <section ref={rootRef} className={cx('mh-todo-list', className)} aria-label={label}>
      {onAdd && (
        <form className="mh-todo-list__add" onSubmit={submit}>
          <div className={inputClass('medium', 'mh-todo-list__input')}>
            <input
              className="mh-input__control"
              type="text"
              autoComplete="off"
              enterKeyHint="done"
              aria-label={L.newItem}
              placeholder={L.newItem}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <button type="submit" className={cx(iconButtonClass('accent', 'medium', true), 'mh-todo-list__add-button')} aria-label={L.add} title={L.add}>
            <Icon icon={TODO_ADD_ICON} />
          </button>
        </form>
      )}
      <div ref={openRef} className="mh-reorder mh-todo-list__open">
        {onReorder && (
          <p className="mh-visually-hidden" id={instructionsId}>
            {m.instructions}
          </p>
        )}
        <ul className="mh-reorder__list mh-todo-list__list" aria-label={label}>
          {open.map(row)}
        </ul>
        <div ref={liveRef} className="mh-reorder__live mh-visually-hidden" aria-live="polite" aria-atomic="true" />
      </div>
      {open.length === 0 && <p className="mh-todo-list__empty">{view.done.length ? L.allDone : L.empty}</p>}
      {view.done.length > 0 && (
        <div className="mh-todo-list__done">
          <div className="mh-todo-list__done-header">
            <button type="button" className="mh-todo-list__toggle" aria-controls={doneListId} aria-expanded={doneOpen} onClick={() => setDoneOpen(!doneOpen)}>
              <Icon icon={TODO_TOGGLE_ICON} className="mh-todo-list__chevron" />
              <span className="mh-todo-list__toggle-text">{L.completed(view.done.length)}</span>
            </button>
            {onClearCompleted && (
              <Button variant="text" size="small" className="mh-todo-list__clear" onClick={() => onClearCompleted(view.done.map((i) => i.id))}>
                {L.clearCompleted}
              </Button>
            )}
          </div>
          <ul className="mh-reorder__list mh-todo-list__list mh-todo-list__done-list" id={doneListId} hidden={!doneOpen} aria-label={L.completed(view.done.length)}>
            {view.done.map(row)}
          </ul>
        </div>
      )}
    </section>
  );
}
