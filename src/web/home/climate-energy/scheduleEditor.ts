import { mdiPlus } from '@mdi/js';
import { colorModifier, node, patch, r2, toDom, type ChartColor, type ChartNode } from '../../charts/tree.ts';
import { cx } from '../../dom.ts';
import { iconButtonClass } from '../../actions/iconButton.ts';
import { clampTo, clockText, iconTree } from './shared.ts';

/** Minutes in a day: block times run from 0 to this. */
export const SCHEDULE_DAY = 1440;

/** A value a block can have ("Comfort 21°", "On"). */
export interface ScheduleLevel {
  value: string;
  /** Shown in the block and the legend; short ("21°"). */
  label: string;
  /** Default the series colour after the level before. */
  color?: ChartColor;
}

/** A stretch of a day with one value: minutes after midnight, `end` after `start`. */
export interface ScheduleBlock {
  start: number;
  end: number;
  value: string;
}

export interface ScheduleDay {
  /** The short row label ("Mon"). */
  label: string;
  /** The full name for screen readers ("Monday"); default the label. */
  name?: string;
  blocks: readonly ScheduleBlock[];
}

/** Every visible and spoken word, for translation. */
export interface ScheduleEditorLabels {
  /** Before the base value in the legend ("Otherwise"). */
  otherwise: string;
  /** Name of a day's add button, before the day ("Add a block on"). */
  add: string;
  /** Joins the two times of a block ("06:30 to 08:00"). */
  to: string;
  /** Spoken how-to for a focused block. */
  help: string;
}

export const SCHEDULE_EDITOR_LABELS: ScheduleEditorLabels = {
  otherwise: 'Otherwise',
  add: 'Add a block on',
  to: 'to',
  help: 'Left and right arrows move the block, up and down make it longer or shorter, Shift moves by an hour. Enter changes the value, Delete removes it.',
};

export interface ScheduleEditorOptions {
  /** The accessible name ("Heating schedule"). */
  label: string;
  /** Usually seven, Monday or Sunday first as the app likes. */
  days: readonly ScheduleDay[];
  /** The values a block can take; a new block takes the first. */
  levels: readonly ScheduleLevel[];
  /** What the gaps mean ("17°", "Off"), shown in the legend after "Otherwise". */
  base?: string;
  /** Snap of every time, in minutes (default 15). */
  step?: number;
  /** Length of a block added by tapping or with the add button, in minutes (default 60). */
  length?: number;
  /** Marks the time now on its day. */
  now?: { day: number; minute: number };
  disabled?: boolean;
  labels?: Partial<ScheduleEditorLabels>;
  /** Called with every day after each change (dragging, keys, taps). */
  onChange?: (days: ScheduleDay[]) => void;
}

export interface ScheduleEditorHandle {
  el: HTMLDivElement;
  getDays(): ScheduleDay[];
  setDays(days: readonly ScheduleDay[]): void;
  update(options: ScheduleEditorOptions): void;
  destroy(): void;
}

/** Where focus goes after a change: a block, or a day's add button when `index` is null. */
export interface ScheduleFocus {
  day: number;
  index: number | null;
}

const snap = (m: number, step: number): number => clampTo(Math.round(m / step) * step, 0, SCHEDULE_DAY);

/** Blocks sorted by start, kept inside the day, without overlaps (a later block starts where the one before ends) or empty ones. */
export function scheduleSorted(blocks: readonly ScheduleBlock[]): ScheduleBlock[] {
  const sorted = blocks
    .map((b) => ({ start: clampTo(Math.min(b.start, b.end), 0, SCHEDULE_DAY), end: clampTo(Math.max(b.start, b.end), 0, SCHEDULE_DAY), value: b.value }))
    .sort((a, b) => a.start - b.start);
  const out: ScheduleBlock[] = [];
  for (const b of sorted) {
    const start = Math.max(b.start, out[out.length - 1]?.end ?? 0);
    if (b.end > start) out.push({ ...b, start });
  }
  return out;
}

const room = (blocks: readonly ScheduleBlock[], index: number): { lo: number; hi: number } => ({ lo: blocks[index - 1]?.end ?? 0, hi: blocks[index + 1]?.start ?? SCHEDULE_DAY });

/** Moves a block by `delta` minutes, keeping its length, between its neighbours. */
export function scheduleMove(blocks: readonly ScheduleBlock[], index: number, delta: number): ScheduleBlock[] {
  const b = blocks[index];
  if (!b) return [...blocks];
  const { lo, hi } = room(blocks, index);
  const len = b.end - b.start;
  const start = clampTo(b.start + delta, lo, hi - len);
  return blocks.map((x, i) => (i === index ? { ...x, start, end: start + len } : x));
}

/** Puts one edge of a block at `minute` (snapped), at least one step long and between its neighbours. */
export function scheduleResize(blocks: readonly ScheduleBlock[], index: number, edge: 'start' | 'end', minute: number, step = 15): ScheduleBlock[] {
  const b = blocks[index];
  if (!b) return [...blocks];
  const { lo, hi } = room(blocks, index);
  const m = snap(minute, step);
  return blocks.map((x, i) => {
    if (i !== index) return x;
    return edge === 'start' ? { ...x, start: clampTo(m, lo, x.end - step) } : { ...x, end: clampTo(m, x.start + step, hi) };
  });
}

/**
 * Adds a block of `length` minutes centred on `minute` (snapped), shrunk and shifted to fit the free time there.
 * `null` when the time is taken or the gap is shorter than one step.
 */
export function scheduleAdd(blocks: readonly ScheduleBlock[], minute: number, value: string, length = 60, step = 15): { blocks: ScheduleBlock[]; index: number } | null {
  const sorted = scheduleSorted(blocks);
  const m = clampTo(minute, 0, SCHEDULE_DAY);
  if (sorted.some((b) => m >= b.start && m < b.end)) return null;
  const lo = sorted.filter((b) => b.end <= m).reduce((a, b) => Math.max(a, b.end), 0);
  const hi = sorted.filter((b) => b.start > m).reduce((a, b) => Math.min(a, b.start), SCHEDULE_DAY);
  const len = Math.min(Math.max(step, snap(length, step)), hi - lo);
  if (len < step) return null;
  const start = clampTo(snap(m - len / 2, step), lo, hi - len);
  const block = { start, end: start + len, value };
  const next = scheduleSorted([...sorted, block]);
  return { blocks: next, index: next.findIndex((b) => b.start === start) };
}

/** The middle of the longest free time in a day, for the add button; `null` when the day is full. */
export function scheduleFreeSpot(blocks: readonly ScheduleBlock[], step = 15): number | null {
  const sorted = scheduleSorted(blocks);
  let best: { lo: number; hi: number } | null = null;
  let lo = 0;
  for (const b of [...sorted, { start: SCHEDULE_DAY, end: SCHEDULE_DAY, value: '' }]) {
    if (b.start - lo >= step && (!best || b.start - lo > best.hi - best.lo)) best = { lo, hi: b.start };
    lo = Math.max(lo, b.end);
  }
  return best ? (best.lo + best.hi) / 2 : null;
}

/** The next level's value for a block (wrapping round). */
export function scheduleCycle(blocks: readonly ScheduleBlock[], index: number, levels: readonly ScheduleLevel[]): ScheduleBlock[] {
  if (levels.length === 0) return [...blocks];
  return blocks.map((b, i) => {
    if (i !== index) return b;
    const at = levels.findIndex((l) => l.value === b.value);
    return { ...b, value: levels[(at + 1) % levels.length]!.value };
  });
}

/** What a key does to a focused block: the new blocks and the block to focus (`null` for the day's add button). */
export function scheduleKey(
  blocks: readonly ScheduleBlock[],
  index: number,
  key: string,
  shift: boolean,
  levels: readonly ScheduleLevel[],
  step = 15,
): { blocks: ScheduleBlock[]; focus: number | null } | null {
  const b = blocks[index];
  if (!b) return null;
  const s = shift ? 60 : step;
  switch (key) {
    case 'ArrowLeft':
      return { blocks: scheduleMove(blocks, index, -s), focus: index };
    case 'ArrowRight':
      return { blocks: scheduleMove(blocks, index, s), focus: index };
    case 'ArrowUp':
      return { blocks: scheduleResize(blocks, index, 'end', b.end + s, step), focus: index };
    case 'ArrowDown':
      return { blocks: scheduleResize(blocks, index, 'end', b.end - s, step), focus: index };
    case 'Enter':
    case ' ':
      return { blocks: scheduleCycle(blocks, index, levels), focus: index };
    case 'Delete':
    case 'Backspace': {
      const next = blocks.filter((_, i) => i !== index);
      return { blocks: next, focus: next.length === 0 ? null : Math.min(index, next.length - 1) };
    }
    default:
      return null;
  }
}

/** The colour of each level: its own, else the series after the one before. */
export function scheduleLevelColor(levels: readonly ScheduleLevel[], value: string): ChartColor {
  const at = levels.findIndex((l) => l.value === value);
  const l = levels[at];
  if (l?.color !== undefined) return l.color;
  return (((at < 0 ? 0 : at) % 6) + 1) as ChartColor;
}

/** The spoken name of a block ("06:30 to 08:00, 21°"). */
export function scheduleBlockText(b: ScheduleBlock, levels: readonly ScheduleLevel[], to = SCHEDULE_EDITOR_LABELS.to): string {
  const level = levels.find((l) => l.value === b.value);
  return `${clockText(b.start)} ${to} ${clockText(b.end)}, ${level?.label ?? b.value}`;
}

export function scheduleEditorClass(disabled = false): string {
  return cx('mh-schedule', disabled && 'is-disabled');
}

const pct = (m: number): number => r2((m / SCHEDULE_DAY) * 100);
const HOURS = [0, 3, 6, 9, 12, 15, 18, 21, 24];

/**
 * The markup of `.mh-schedule`: the `__hours` ruler, one `__day` row per day (`__day-label`, the `__track` with
 * the `__now` line and its `__block`s, each with `__handle--start | --end` grips and a `__block-label`, and the
 * `__add` button), then the `__legend` of levels (`__key`) and the base value. Blocks are focusable with keyboard
 * help in their description; `--accent | --series-N` colour them. State `.is-disabled`.
 */
export function scheduleEditorTree(o: ScheduleEditorOptions): ChartNode {
  const l = { ...SCHEDULE_EDITOR_LABELS, ...o.labels };
  const off = !!o.disabled;
  return node(
    'div',
    { class: scheduleEditorClass(off), role: 'group', 'aria-label': o.label },
    node(
      'div',
      { class: 'mh-schedule__hours', 'aria-hidden': 'true' },
      HOURS.map((h) => node('span', { class: cx('mh-schedule__hour', h % 6 !== 0 && 'is-minor'), style: `left: ${pct(h * 60)}%` }, String(h).padStart(2, '0'))),
    ),
    o.days.map((d, di) => {
      const blocks = scheduleSorted(d.blocks);
      const name = d.name ?? d.label;
      return node(
        'div',
        { class: 'mh-schedule__day', role: 'group', 'aria-label': name },
        node('span', { class: 'mh-schedule__day-label', 'aria-hidden': 'true' }, d.label),
        node(
          'div',
          { class: 'mh-schedule__track', 'data-day': di },
          o.now && o.now.day === di && node('span', { class: 'mh-schedule__now', style: `left: ${pct(clampTo(o.now.minute, 0, SCHEDULE_DAY))}%`, 'aria-hidden': 'true' }),
          blocks.map((b, bi) =>
            node(
              'div',
              {
                class: cx('mh-schedule__block', colorModifier('mh-schedule__block', scheduleLevelColor(o.levels, b.value))),
                'data-day': di,
                'data-index': bi,
                role: 'button',
                tabindex: off ? -1 : 0,
                'aria-label': scheduleBlockText(b, o.levels, l.to),
                'aria-description': l.help,
                'aria-disabled': off ? 'true' : undefined,
                style: `left: ${pct(b.start)}%; width: ${pct(b.end - b.start)}%`,
              },
              node('span', { class: 'mh-schedule__handle mh-schedule__handle--start', 'data-edge': 'start', 'aria-hidden': 'true' }),
              node('span', { class: 'mh-schedule__block-label', 'aria-hidden': 'true' }, o.levels.find((x) => x.value === b.value)?.label ?? b.value),
              node('span', { class: 'mh-schedule__handle mh-schedule__handle--end', 'data-edge': 'end', 'aria-hidden': 'true' }),
            ),
          ),
        ),
        node(
          'button',
          { type: 'button', class: cx(iconButtonClass('default', 'small'), 'mh-schedule__add'), 'data-add': di, 'aria-label': `${l.add} ${name}`, title: `${l.add} ${name}`, disabled: off },
          iconTree(mdiPlus),
        ),
      );
    }),
    node(
      'div',
      { class: 'mh-schedule__legend', 'aria-hidden': 'true' },
      o.levels.map((lv) => node('span', { class: cx('mh-schedule__key', colorModifier('mh-schedule__key', scheduleLevelColor(o.levels, lv.value))) }, lv.label)),
      o.base && node('span', { class: 'mh-schedule__key mh-schedule__key--base' }, `${l.otherwise} ${o.base}`),
    ),
  );
}

const withBlocks = (days: readonly ScheduleDay[], day: number, blocks: ScheduleBlock[]): ScheduleDay[] => days.map((d, i) => (i === day ? { ...d, blocks } : d));

/** Focuses a block (or a day's add button) inside a rendered schedule editor. */
export function scheduleFocus(el: HTMLElement, f: ScheduleFocus): void {
  const target = f.index === null ? el.querySelector<HTMLElement>(`[data-add="${f.day}"]`) : el.querySelector<HTMLElement>(`.mh-schedule__block[data-day="${f.day}"][data-index="${f.index}"]`);
  target?.focus();
}

/** A press that moves less than this many pixels is a tap. */
const TAP = 4;

type Drag =
  | { kind: 'edge'; id: number; day: number; index: number; edge: 'start' | 'end' }
  | { kind: 'move'; id: number; day: number; index: number; x: number; grab: number; moved: boolean }
  | { kind: 'paint'; id: number; day: number; x: number; anchor: number; index: number | null };

/**
 * Pointer and keyboard behaviour on a rendered schedule editor, shared by the web handle and the React binding.
 * Drag a grip to resize, the block to move it, an empty stretch to draw a new block; tap a block for its next
 * value, an empty spot for a new block. `change` gets every day and where focus should go. Returns a detach function.
 */
export function attachSchedule(el: HTMLElement, get: () => ScheduleEditorOptions, change: (days: ScheduleDay[], focus?: ScheduleFocus) => void): () => void {
  let drag: Drag | null = null;
  const step = (): number => get().step ?? 15;
  const blocksOf = (day: number): ScheduleBlock[] => scheduleSorted(get().days[day]?.blocks ?? []);
  const minuteAt = (day: number, clientX: number): number => {
    const track = el.querySelector<HTMLElement>(`.mh-schedule__track[data-day="${day}"]`);
    const r = track?.getBoundingClientRect();
    return r && r.width > 0 ? clampTo(((clientX - r.left) / r.width) * SCHEDULE_DAY, 0, SCHEDULE_DAY) : 0;
  };
  const emit = (day: number, blocks: ScheduleBlock[], focus?: ScheduleFocus): void => change(withBlocks(get().days, day, blocks), focus);

  const down = (e: PointerEvent): void => {
    const o = get();
    if (o.disabled || e.button !== 0 || !(e.target instanceof Element)) return;
    const block = e.target.closest<HTMLElement>('.mh-schedule__block');
    const track = e.target.closest<HTMLElement>('.mh-schedule__track');
    if (!track) return;
    const day = Number(track.dataset['day']);
    if (block) {
      const index = Number(block.dataset['index']);
      const edge = e.target.closest<HTMLElement>('.mh-schedule__handle')?.dataset['edge'] as 'start' | 'end' | undefined;
      const b = blocksOf(day)[index];
      if (!b) return;
      drag = edge ? { kind: 'edge', id: e.pointerId, day, index, edge } : { kind: 'move', id: e.pointerId, day, index, x: e.clientX, grab: minuteAt(day, e.clientX) - b.start, moved: false };
    } else {
      drag = { kind: 'paint', id: e.pointerId, day, x: e.clientX, anchor: minuteAt(day, e.clientX), index: null };
    }
    e.preventDefault();
    el.setPointerCapture?.(e.pointerId);
  };

  const move = (e: PointerEvent): void => {
    if (!drag || e.pointerId !== drag.id) return;
    const s = step();
    const m = minuteAt(drag.day, e.clientX);
    const blocks = blocksOf(drag.day);
    if (drag.kind === 'edge') {
      emit(drag.day, scheduleResize(blocks, drag.index, drag.edge, m, s));
    } else if (drag.kind === 'move') {
      if (!drag.moved && Math.abs(e.clientX - drag.x) < TAP) return;
      drag.moved = true;
      const b = blocks[drag.index];
      if (b) emit(drag.day, scheduleMove(blocks, drag.index, snap(m - drag.grab, s) - b.start));
    } else {
      if (drag.index === null) {
        if (Math.abs(e.clientX - drag.x) < TAP) return;
        const added = scheduleAdd(blocks, drag.anchor, get().levels[0]?.value ?? '', s, s);
        if (!added) {
          drag = null;
          return;
        }
        drag.index = added.index;
        emit(drag.day, added.blocks);
        return;
      }
      const edge = m < drag.anchor ? 'start' : 'end';
      const b = blocks[drag.index];
      if (!b) return;
      // Keep the anchor inside the block while the far edge follows the pointer.
      const anchored = edge === 'start' ? scheduleResize(blocks, drag.index, 'end', Math.max(b.end, snap(drag.anchor, s)), s) : scheduleResize(blocks, drag.index, 'start', Math.min(b.start, snap(drag.anchor, s)), s);
      emit(drag.day, scheduleResize(anchored, drag.index, edge, m, s));
    }
  };

  const up = (e: PointerEvent): void => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    const o = get();
    const blocks = blocksOf(d.day);
    if (d.kind === 'move' && !d.moved) {
      emit(d.day, scheduleCycle(blocks, d.index, o.levels), { day: d.day, index: d.index });
    } else if (d.kind === 'paint' && d.index === null) {
      const added = scheduleAdd(blocks, d.anchor, o.levels[0]?.value ?? '', o.length ?? 60, step());
      if (added) emit(d.day, added.blocks, { day: d.day, index: added.index });
    } else {
      scheduleFocus(el, { day: d.day, index: d.index });
    }
  };
  const cancel = (e: PointerEvent): void => {
    if (drag && e.pointerId === drag.id) drag = null;
  };

  const key = (e: KeyboardEvent): void => {
    const o = get();
    if (o.disabled || !(e.target instanceof HTMLElement) || !e.target.classList.contains('mh-schedule__block')) return;
    const day = Number(e.target.dataset['day']);
    const index = Number(e.target.dataset['index']);
    const res = scheduleKey(blocksOf(day), index, e.key, e.shiftKey, o.levels, step());
    if (!res) return;
    e.preventDefault();
    emit(day, res.blocks, { day, index: res.focus });
  };

  const click = (e: MouseEvent): void => {
    const o = get();
    const add = e.target instanceof Element ? e.target.closest<HTMLElement>('.mh-schedule__add') : null;
    if (o.disabled || !add) return;
    const day = Number(add.dataset['add']);
    const blocks = blocksOf(day);
    const spot = scheduleFreeSpot(blocks, step());
    if (spot === null) return;
    const added = scheduleAdd(blocks, spot, o.levels[0]?.value ?? '', o.length ?? 60, step());
    if (added) emit(day, added.blocks, { day, index: added.index });
  };

  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', cancel);
  el.addEventListener('keydown', key);
  el.addEventListener('click', click);
  return () => {
    el.removeEventListener('pointerdown', down);
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerup', up);
    el.removeEventListener('pointercancel', cancel);
    el.removeEventListener('keydown', key);
    el.removeEventListener('click', click);
  };
}

/**
 * `.mh-schedule`: a week (or any set of days) of time blocks, one row per day on a 24-hour track, each block with a
 * value from `levels`. Drag to shape, tap to change, or use the keys on a focused block; every change calls
 * `onChange` with all the days. The web handle keeps its own days.
 */
export function createScheduleEditor(options: ScheduleEditorOptions): ScheduleEditorHandle {
  let current: ScheduleEditorOptions = { ...options };
  const el = toDom(scheduleEditorTree(current)) as HTMLDivElement;
  const update = (next: ScheduleEditorOptions): void => {
    current = { ...next };
    patch(el, scheduleEditorTree(current));
  };
  const days = (): ScheduleDay[] => current.days.map((d) => ({ ...d, blocks: scheduleSorted(d.blocks) }));
  const detach = attachSchedule(
    el,
    () => current,
    (next, focus) => {
      update({ ...current, days: next });
      if (focus) scheduleFocus(el, focus);
      current.onChange?.(days());
    },
  );
  return {
    el,
    update,
    getDays: days,
    setDays: (next) => update({ ...current, days: next }),
    destroy: detach,
  };
}
