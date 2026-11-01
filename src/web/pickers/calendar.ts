import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import { iconButtonClass } from '../actions/iconButton.ts';
import { cx, h, uid } from '../dom.ts';
import { createIcon } from '../icons.ts';
import {
  addDays,
  addMonths,
  dateParts,
  firstDayOfWeek,
  inBounds,
  isoDate,
  monthGrid,
  monthTitle,
  orderDates,
  todayIso,
  utcDate,
  weekdayNames,
  weekdayOf,
  type DateRange,
  type IsoDate,
  type Weekday,
} from './dates.ts';

export type CalendarMode = 'single' | 'range';

export interface CalendarOptions {
  /** One date (default) or a start and end date. */
  mode?: CalendarMode;
  /** The selected date (single mode). */
  value?: IsoDate | null;
  /** The selected range (range mode). */
  range?: DateRange | null;
  /** Earliest and latest selectable dates. */
  min?: IsoDate | null;
  max?: IsoDate | null;
  /** Marks further dates unavailable (still focusable, never selectable). */
  isDateDisabled?: (date: IsoDate) => boolean;
  /** BCP 47 locale for names and the week start; default the platform's. */
  locale?: string;
  /** Overrides the locale's first day of the week (0 = Sunday). */
  weekStartsOn?: Weekday;
  /** Months shown side by side (default 1). */
  months?: number;
  /** A date in the first month shown; default the selection, else today. */
  month?: IsoDate;
  /** Accessible name of the whole calendar (default "Calendar"). */
  label?: string;
  /** "Today" for `aria-current` and the today marker; default the device's local date. */
  today?: IsoDate;
  /** A date was chosen (single mode). */
  onSelect?: (date: IsoDate) => void;
  /** The range changed (range mode): first with `end: null`, then complete. */
  onRangeChange?: (range: DateRange) => void;
}

export interface CalendarHandle {
  el: HTMLDivElement;
  getValue(): IsoDate | null;
  setValue(value: IsoDate | null): void;
  getRange(): DateRange | null;
  setRange(range: DateRange | null): void;
  /** Shows the month holding `date` (and moves the keyboard focus date there). */
  showMonth(date: IsoDate): void;
  /** Moves keyboard focus to the active day. */
  focus(): void;
}

/** Classes of one day button, for the state it is in. */
export function calendarDayClass(state: { outside?: boolean; today?: boolean; selected?: boolean; start?: boolean; end?: boolean; inRange?: boolean; preview?: boolean; disabled?: boolean }): string {
  return cx(
    'mh-calendar__day',
    state.outside && 'is-outside',
    state.today && 'is-today',
    state.selected && 'is-selected',
    state.start && 'is-range-start',
    state.end && 'is-range-end',
    state.inRange && 'is-in-range',
    state.preview && 'is-preview',
    state.disabled && 'is-disabled',
  );
}

const firstOfMonth = (iso: IsoDate): IsoDate => {
  const { year, month } = dateParts(iso);
  return isoDate(year, month, 1);
};

/**
 * `.mh-calendar`: one or more month grids (`role="grid"`) of `.mh-calendar__day` buttons, with previous and next
 * month buttons. Arrow keys move by day and week, Home and End to the ends of the week, Page Up and Page Down by
 * month (with Shift by year), Enter or Space picks. Weekday names, month titles and the first day of the week come
 * from Intl for the locale. Day states: `.is-today` (`aria-current="date"`), `.is-selected`, `.is-range-start`,
 * `.is-range-end`, `.is-in-range`, `.is-preview` (the range under the pointer), `.is-outside`, `.is-disabled`.
 */
export function createCalendar(options: CalendarOptions = {}): CalendarHandle {
  const mode = options.mode ?? 'single';
  const locale = options.locale;
  const weekStart = options.weekStartsOn ?? firstDayOfWeek(locale);
  const count = Math.max(1, Math.min(4, Math.round(options.months ?? 1)));
  const today = options.today ?? todayIso();
  let value: IsoDate | null = options.value ?? null;
  let range: DateRange | null = options.range ?? null;
  let hover: IsoDate | null = null;

  const anchorDate = (): IsoDate => (mode === 'range' ? range?.start : value) ?? today;
  let view = firstOfMonth(options.month ?? anchorDate());
  let active = mode === 'range' ? (range?.start ?? (options.month ? view : today)) : (value ?? (options.month ? view : today));

  const longNames = weekdayNames(locale, weekStart, 'long');
  const shortNames = weekdayNames(locale, weekStart, 'narrow');
  const dayLabel = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const dayNumber = new Intl.NumberFormat(locale, { useGrouping: false });

  const unavailable = (iso: IsoDate): boolean => !inBounds(iso, options.min, options.max) || (options.isDateDisabled?.(iso) ?? false);

  const prev = h('button', { type: 'button', class: cx(iconButtonClass('default', 'small'), 'mh-calendar__nav'), 'aria-label': 'Previous month', title: 'Previous month' }, createIcon(mdiChevronLeft));
  const next = h('button', { type: 'button', class: cx(iconButtonClass('default', 'small'), 'mh-calendar__nav'), 'aria-label': 'Next month', title: 'Next month' }, createIcon(mdiChevronRight));

  const months = Array.from({ length: count }, (_, i) => {
    const titleId = uid('mh-calendar-title');
    const title = h('h2', { class: 'mh-calendar__title', id: titleId, 'aria-live': i === 0 ? 'polite' : null });
    const head = h('div', { class: 'mh-calendar__month-head' }, i === 0 ? prev : null, title, i === count - 1 ? next : null);
    const body = h('tbody');
    const grid = h(
      'table',
      { class: 'mh-calendar__grid', role: 'grid', 'aria-labelledby': titleId },
      h('thead', {}, h('tr', {}, ...longNames.map((name, d) => h('th', { scope: 'col', abbr: name, class: 'mh-calendar__weekday' }, h('span', { 'aria-hidden': 'true' }, shortNames[d]!), h('span', { class: 'mh-visually-hidden' }, name))))),
      body,
    );
    return { title, body, el: h('div', { class: 'mh-calendar__month' }, head, grid) };
  });

  const el = h('div', { class: cx('mh-calendar', count > 1 && 'mh-calendar--multi'), role: 'group', 'aria-label': options.label ?? 'Calendar' }, h('div', { class: 'mh-calendar__months' }, ...months.map((m) => m.el)));

  const lastView = (): IsoDate => addMonths(view, count - 1);
  const isVisible = (iso: IsoDate): boolean => iso >= view && iso < addMonths(view, count);

  let builtView = '';
  /** Rebuilds the grids when the visible months change. */
  const build = (): boolean => {
    if (builtView === view) return false;
    builtView = view;
    months.forEach((m, i) => {
      const first = addMonths(view, i);
      const { year, month } = dateParts(first);
      m.title.textContent = monthTitle(first, locale);
      const days = monthGrid(year, month, weekStart);
      const rows: HTMLTableRowElement[] = [];
      for (let r = 0; r < 6; r += 1) {
        const cells = days.slice(r * 7, r * 7 + 7).map((iso) => {
          const outside = dateParts(iso).month !== month;
          // With several months, a date belongs to its own month only; the neighbours leave the cell empty.
          if (outside && count > 1) return h('td', { role: 'gridcell', class: 'mh-calendar__cell is-empty' });
          const btn = h(
            'button',
            {
              type: 'button',
              'data-date': iso,
              'data-outside': outside ? 'true' : null,
              'aria-label': dayLabel.format(utcDate(iso)),
              'aria-current': iso === today ? 'date' : null,
            },
            dayNumber.format(dateParts(iso).day),
          );
          return h('td', { role: 'gridcell', class: 'mh-calendar__cell' }, btn);
        });
        rows.push(h('tr', {}, ...cells));
      }
      m.body.replaceChildren(...rows);
    });
    prev.disabled = !!options.min && addDays(view, -1) < options.min;
    next.disabled = !!options.max && addMonths(view, count) > options.max;
    return true;
  };

  /** Writes the selection, range, preview, focus and availability states onto the day buttons. */
  const paint = (): void => {
    const sel = mode === 'range' && range ? range : null;
    const previewEnd = sel && !sel.end && hover ? hover : null;
    const [lo, hi] = sel ? (sel.end ? orderDates(sel.start, sel.end) : previewEnd ? orderDates(sel.start, previewEnd) : [sel.start, sel.start]) : ['', ''];
    const spans = !!sel && (!!sel.end || !!previewEnd);
    for (const btn of el.querySelectorAll<HTMLButtonElement>('button[data-date]')) {
      const iso = btn.dataset.date!;
      const disabled = unavailable(iso);
      const selected = mode === 'single' ? iso === value : !!sel && (iso === sel.start || iso === sel.end);
      const between = !!sel && iso > lo && iso < hi;
      const isEnd = spans && iso === hi;
      btn.className = calendarDayClass({
        outside: btn.dataset.outside === 'true',
        today: iso === today,
        selected,
        start: spans && iso === lo,
        end: isEnd,
        inRange: between,
        preview: !!previewEnd && (between || isEnd),
        disabled,
      });
      btn.tabIndex = iso === active ? 0 : -1;
      if (disabled) btn.setAttribute('aria-disabled', 'true');
      else btn.removeAttribute('aria-disabled');
      btn.parentElement!.setAttribute('aria-selected', selected || between ? 'true' : 'false');
    }
  };

  const render = (): void => {
    const hadFocus = el.contains(document.activeElement);
    const rebuilt = build();
    paint();
    if (hadFocus && rebuilt) focusActive();
  };

  function focusActive(): void {
    el.querySelector<HTMLButtonElement>(`.mh-calendar__day[data-date="${active}"]`)?.focus({ preventScroll: true });
  }

  const moveTo = (iso: IsoDate, focus = true): void => {
    active = iso;
    if (!isVisible(iso)) view = iso < view ? firstOfMonth(iso) : firstOfMonth(addMonths(iso, -(count - 1)));
    render();
    if (focus) focusActive();
  };

  const pick = (iso: IsoDate): void => {
    if (unavailable(iso)) return;
    active = iso;
    if (mode === 'single') {
      value = iso;
      if (!isVisible(iso)) view = firstOfMonth(iso);
      render();
      focusActive();
      options.onSelect?.(iso);
      return;
    }
    if (!range || range.end) range = { start: iso, end: null };
    else {
      const [start, end] = orderDates(range.start, iso);
      range = { start, end };
    }
    hover = null;
    render();
    focusActive();
    options.onRangeChange?.({ ...range });
  };

  prev.addEventListener('click', () => {
    view = addMonths(view, -1);
    active = clampToView(addMonths(active, -1));
    render();
  });
  next.addEventListener('click', () => {
    view = addMonths(view, 1);
    active = clampToView(addMonths(active, 1));
    render();
  });
  function clampToView(iso: IsoDate): IsoDate {
    if (iso < view) return view;
    const end = addDays(addMonths(lastView(), 1), -1);
    return iso > end ? end : iso;
  }

  el.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>('.mh-calendar__day');
    if (btn?.dataset.date) pick(btn.dataset.date);
  });
  const onHover = (e: Event): void => {
    if (mode !== 'range' || !range || range.end) return;
    const btn = (e.target as Element).closest<HTMLButtonElement>('.mh-calendar__day');
    const date = btn?.dataset.date ?? null;
    if (date === hover) return;
    hover = date;
    paint();
  };
  el.addEventListener('pointerover', onHover);
  el.addEventListener('focusin', onHover);
  el.addEventListener('pointerleave', () => {
    if (hover && !el.contains(document.activeElement)) {
      hover = null;
      paint();
    }
  });

  el.addEventListener('keydown', (e) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>('.mh-calendar__day');
    if (!btn?.dataset.date) return;
    const from = btn.dataset.date;
    const rtl = getComputedStyle(el).direction === 'rtl';
    let to: IsoDate;
    switch (e.key) {
      case 'ArrowLeft':
        to = addDays(from, rtl ? 1 : -1);
        break;
      case 'ArrowRight':
        to = addDays(from, rtl ? -1 : 1);
        break;
      case 'ArrowUp':
        to = addDays(from, -7);
        break;
      case 'ArrowDown':
        to = addDays(from, 7);
        break;
      case 'Home':
        to = addDays(from, -((weekdayOf(from) - weekStart + 7) % 7));
        break;
      case 'End':
        to = addDays(from, 6 - ((weekdayOf(from) - weekStart + 7) % 7));
        break;
      case 'PageUp':
        to = addMonths(from, e.shiftKey ? -12 : -1);
        break;
      case 'PageDown':
        to = addMonths(from, e.shiftKey ? 12 : 1);
        break;
      default:
        return;
    }
    e.preventDefault();
    moveTo(to);
  });

  render();

  return {
    el,
    getValue: () => value,
    setValue(next) {
      value = next;
      if (next) {
        active = next;
        if (!isVisible(next)) view = firstOfMonth(next);
      }
      render();
    },
    getRange: () => (range ? { ...range } : null),
    setRange(next) {
      range = next ? { ...next } : null;
      hover = null;
      if (next) {
        active = next.start;
        if (!isVisible(next.start)) view = firstOfMonth(next.start);
      }
      render();
    },
    showMonth(date) {
      moveTo(date, false);
    },
    focus: focusActive,
  };
}
