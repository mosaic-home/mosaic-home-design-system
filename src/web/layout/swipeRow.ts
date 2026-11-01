import { mdiDotsHorizontal } from '@mdi/js';
import { append, cx, h, uid, type Child } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';

export type SwipeActionTone = 'default' | 'accent' | 'success' | 'warning' | 'danger';
/** `start` actions sit under the leading edge (revealed by swiping towards the end), `end` actions under the trailing edge. */
export type SwipeSide = 'start' | 'end';

export interface SwipeAction {
  id: string;
  label: string;
  icon: IconName | string;
  tone?: SwipeActionTone;
}

export interface SwipeRowBehaviour {
  /** Swiping most of the way across runs the first action on that side. */
  fullSwipe?: boolean;
  onAction?: (id: string) => void;
  onOpenChange?: (side: SwipeSide | null) => void;
}

export interface SwipeRowOptions extends SwipeRowBehaviour {
  content: Child | Child[];
  start?: readonly SwipeAction[];
  end?: readonly SwipeAction[];
  /** Name of the row, for the actions button ("Actions for Kitchen light"). */
  label: string;
  /** Accessible name of the actions button (default `Actions for <label>`). */
  moreLabel?: string;
}

export interface SwipeRowController {
  side(): SwipeSide | null;
  open(side: SwipeSide): void;
  close(): void;
  destroy(): void;
}

export interface SwipeRowHandle extends SwipeRowController {
  el: HTMLDivElement;
}

export function swipeActionClass(tone: SwipeActionTone = 'default'): string {
  return cx('mh-swipe-row__action', tone !== 'default' && `mh-swipe-row__action--${tone}`);
}

/** Drag distance (px) before a press becomes a swipe. */
const SLOP = 8;
/** Share of the row a full swipe has to cross. */
const FULL = 0.6;

/**
 * Where a released swipe settles. `x` is the travel towards the end edge (negative: towards the start), `start`
 * and `end` the widths of the two action groups, `width` the row's.
 */
export function swipeSettle(x: number, start: number, end: number, width: number, fullSwipe = false): { side: SwipeSide | null; run: boolean } {
  if (x > 0 && start > 0) {
    if (fullSwipe && width > 0 && x > width * FULL) return { side: 'start', run: true };
    return { side: x > start / 2 ? 'start' : null, run: false };
  }
  if (x < 0 && end > 0) {
    if (fullSwipe && width > 0 && -x > width * FULL) return { side: 'end', run: true };
    return { side: -x > end / 2 ? 'end' : null, run: false };
  }
  return { side: null, run: false };
}

/**
 * Swiping on existing markup (`.mh-swipe-row` with `__content`, `__more` and the `__actions--start` /
 * `__actions--end` groups of `__action[data-action]` buttons). A horizontal drag on the content reveals the
 * actions under it; vertical scrolling is left alone. From the keyboard, the `__more` button (or Left and Right
 * on it) opens the actions, Escape closes them. Shared with the React binding.
 */
export function bindSwipeRow(root: HTMLElement, behaviour: SwipeRowBehaviour = {}): SwipeRowController {
  const content = root.querySelector<HTMLElement>(':scope > .mh-swipe-row__content')!;
  const more = content.querySelector<HTMLButtonElement>('.mh-swipe-row__more');
  const groups = {
    start: root.querySelector<HTMLElement>(':scope > .mh-swipe-row__actions--start'),
    end: root.querySelector<HTMLElement>(':scope > .mh-swipe-row__actions--end'),
  };
  const dir = (): number => (getComputedStyle(root).direction === 'rtl' ? -1 : 1);
  const width = (side: SwipeSide): number => groups[side]?.offsetWidth ?? 0;
  let side: SwipeSide | null = null;

  const place = (x: number): void => {
    content.style.setProperty('--_x', `${x * dir()}px`);
  };
  const sync = (): void => {
    root.classList.toggle('is-open-start', side === 'start');
    root.classList.toggle('is-open-end', side === 'end');
    for (const s of ['start', 'end'] as const) groups[s]?.toggleAttribute('inert', side !== s);
    more?.setAttribute('aria-expanded', String(side !== null));
    place(side === 'start' ? width('start') : side === 'end' ? -width('end') : 0);
  };
  const onOutside = (e: PointerEvent): void => {
    if (!root.contains(e.target as Node)) setSide(null);
  };
  const setSide = (next: SwipeSide | null): void => {
    if (next && !groups[next]) return;
    if (next === side) {
      sync();
      return;
    }
    side = next;
    sync();
    if (side) document.addEventListener('pointerdown', onOutside, true);
    else document.removeEventListener('pointerdown', onOutside, true);
    behaviour.onOpenChange?.(side);
  };

  const run = (id: string): void => {
    setSide(null);
    behaviour.onAction?.(id);
  };
  const onClick = (e: MouseEvent): void => {
    const target = e.target as HTMLElement;
    const action = target.closest?.<HTMLElement>('.mh-swipe-row__action');
    if (action && root.contains(action)) {
      run(action.dataset.action ?? '');
      return;
    }
    if (more && (target === more || more.contains(target))) setSide(side ? null : groups.end ? 'end' : 'start');
  };
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && side) {
      e.preventDefault();
      setSide(null);
      more?.focus();
      return;
    }
    if (e.target !== more) return;
    const towardsEnd = (e.key === 'ArrowRight' && dir() > 0) || (e.key === 'ArrowLeft' && dir() < 0);
    const towardsStart = (e.key === 'ArrowLeft' && dir() > 0) || (e.key === 'ArrowRight' && dir() < 0);
    // The content moves the way the arrow points: towards the end shows the start actions.
    if (towardsEnd) setSide(side === 'end' ? null : 'start');
    else if (towardsStart) setSide(side === 'start' ? null : 'end');
    else return;
    e.preventDefault();
  };

  let drag: { pointer: number; x0: number; y0: number; base: number; x: number; active: boolean } | null = null;
  const travel = (dx: number, base: number): number => {
    const full = root.offsetWidth || Infinity;
    const lo = groups.end ? -(behaviour.fullSwipe ? full : width('end') * 1.25) : 0;
    const hi = groups.start ? (behaviour.fullSwipe ? full : width('start') * 1.25) : 0;
    return Math.max(lo, Math.min(hi, base + dx));
  };
  const onDown = (e: PointerEvent): void => {
    if (e.button !== 0 || drag || (e.target as HTMLElement).closest?.('.mh-swipe-row__more')) return;
    const base = side === 'start' ? width('start') : side === 'end' ? -width('end') : 0;
    drag = { pointer: e.pointerId, x0: e.clientX, y0: e.clientY, base, x: base, active: false };
  };
  const onMove = (e: PointerEvent): void => {
    if (!drag || e.pointerId !== drag.pointer) return;
    const dx = (e.clientX - drag.x0) * dir();
    const dy = e.clientY - drag.y0;
    if (!drag.active) {
      if (Math.abs(dy) > SLOP && Math.abs(dy) > Math.abs(dx)) {
        drag = null;
        return;
      }
      if (Math.abs(dx) < SLOP) return;
      drag.active = true;
      content.setPointerCapture?.(e.pointerId);
      root.classList.add('is-dragging');
    }
    drag.x = travel(dx, drag.base);
    place(drag.x);
    root.classList.toggle('is-reveal-start', drag.x > 0);
    root.classList.toggle('is-reveal-end', drag.x < 0);
    const settle = swipeSettle(drag.x, width('start'), width('end'), root.offsetWidth, behaviour.fullSwipe);
    root.classList.toggle('is-armed', settle.run);
  };
  const onUp = (e: PointerEvent): void => {
    if (!drag || e.pointerId !== drag.pointer) return;
    const { active, x } = drag;
    drag = null;
    if (!active) return;
    content.releasePointerCapture?.(e.pointerId);
    root.classList.remove('is-dragging', 'is-armed', 'is-reveal-start', 'is-reveal-end');
    // The click that ends a drag is not a press.
    const swallow = (c: Event): void => {
      c.stopPropagation();
      c.preventDefault();
    };
    content.addEventListener('click', swallow, { capture: true, once: true });
    setTimeout(() => content.removeEventListener('click', swallow, { capture: true }), 0);
    const settle = swipeSettle(x, width('start'), width('end'), root.offsetWidth, behaviour.fullSwipe);
    const first = settle.side ? groups[settle.side]?.querySelector<HTMLElement>('.mh-swipe-row__action') : null;
    if (settle.run && first) run(first.dataset.action ?? '');
    else setSide(settle.side);
  };
  const onCancel = (e: PointerEvent): void => {
    if (!drag || e.pointerId !== drag.pointer) return;
    drag = null;
    root.classList.remove('is-dragging', 'is-armed', 'is-reveal-start', 'is-reveal-end');
    sync();
  };

  root.addEventListener('click', onClick);
  root.addEventListener('keydown', onKey);
  content.addEventListener('pointerdown', onDown);
  content.addEventListener('pointermove', onMove);
  content.addEventListener('pointerup', onUp);
  content.addEventListener('pointercancel', onCancel);
  sync();

  return {
    side: () => side,
    open: (s) => setSide(s),
    close: () => setSide(null),
    destroy: () => {
      root.removeEventListener('click', onClick);
      root.removeEventListener('keydown', onKey);
      content.removeEventListener('pointerdown', onDown);
      content.removeEventListener('pointermove', onMove);
      content.removeEventListener('pointerup', onUp);
      content.removeEventListener('pointercancel', onCancel);
      document.removeEventListener('pointerdown', onOutside, true);
    },
  };
}

function actionGroup(side: SwipeSide, actions: readonly SwipeAction[] | undefined, id: string, label: string): HTMLElement | null {
  if (!actions?.length) return null;
  return h(
    'div',
    { class: `mh-swipe-row__actions mh-swipe-row__actions--${side}`, id: `${id}-${side}`, role: 'group', 'aria-label': label },
    ...actions.map((a) =>
      h('button', { type: 'button', class: swipeActionClass(a.tone), 'data-action': a.id }, createIcon(a.icon), h('span', { class: 'mh-swipe-row__action-label' }, a.label)),
    ),
  );
}

/** `aria-controls` of the actions button: the ids of the groups that exist. */
export function swipeControls(id: string, start: boolean, end: boolean): string {
  return [start && `${id}-start`, end && `${id}-end`].filter(Boolean).join(' ');
}

/**
 * `.mh-swipe-row` (`.is-open-start | .is-open-end`, `.is-dragging`, `.is-armed` before a full swipe runs): a row
 * whose `__content` (`__main` and the `__more` actions button) slides over the `__actions--start` and
 * `__actions--end` groups of `__action` buttons (`--accent | --success | --warning | --danger`, each with an icon
 * and an `__action-label`).
 */
export function createSwipeRow(options: SwipeRowOptions): SwipeRowHandle {
  const id = uid('mh-swipe');
  const label = options.moreLabel ?? `Actions for ${options.label}`;
  const main = h('div', { class: 'mh-swipe-row__main' });
  append(main, ...(Array.isArray(options.content) ? options.content : [options.content]));
  const more = h(
    'button',
    { type: 'button', class: 'mh-swipe-row__more', 'aria-label': label, title: label, 'aria-expanded': 'false', 'aria-controls': swipeControls(id, Boolean(options.start?.length), Boolean(options.end?.length)) },
    createIcon(mdiDotsHorizontal),
  );
  const el = h(
    'div',
    { class: 'mh-swipe-row' },
    h('div', { class: 'mh-swipe-row__content' }, main, more),
    actionGroup('start', options.start, id, label),
    actionGroup('end', options.end, id, label),
  );
  return { el, ...bindSwipeRow(el, options) };
}
