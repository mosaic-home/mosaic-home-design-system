import { append, cx, h, uid, type Child } from '../dom.ts';

/** `horizontal` puts the panes side by side (a vertical divider); `vertical` stacks them. */
export type SplitOrientation = 'horizontal' | 'vertical';
/** Which pane folds away when the split collapses. */
export type SplitCollapsible = 'start' | 'end';

export interface SplitPaneBehaviour {
  orientation?: SplitOrientation;
  /** Share of the start pane in percent (default 50). */
  size?: number;
  /** Smallest share of the start pane in percent (default 20). */
  min?: number;
  /** Largest share of the start pane in percent (default 80). */
  max?: number;
  /** Percent moved by an arrow key (default 5); Page Up and Page Down move four steps. */
  step?: number;
  /** One pane can fold away: Enter or a double click on the divider, or dragging past half its minimum. */
  collapsible?: SplitCollapsible;
  collapsed?: boolean;
  onResize?: (size: number) => void;
  onCollapse?: (collapsed: boolean) => void;
}

export interface SplitPaneOptions extends SplitPaneBehaviour {
  start?: Child | Child[];
  end?: Child | Child[];
  /** Accessible name of the divider (default "Resize panes"). */
  label?: string;
  /** Accessible names of the panes; a named pane becomes a region. */
  startLabel?: string;
  endLabel?: string;
}

export interface SplitPaneController {
  size(): number;
  collapsed(): boolean;
  setSize(size: number): void;
  setCollapsed(collapsed: boolean): void;
  destroy(): void;
}

export interface SplitPaneHandle extends Omit<SplitPaneController, 'destroy'> {
  el: HTMLDivElement;
  startPane: HTMLDivElement;
  endPane: HTMLDivElement;
  destroy(): void;
}

export function splitPaneClass(orientation: SplitOrientation = 'horizontal', collapsible?: SplitCollapsible): string {
  return cx('mh-split', orientation === 'vertical' && 'mh-split--vertical', collapsible && `mh-split--collapse-${collapsible}`);
}

/** The divider's own orientation: perpendicular to the way the panes are laid out. */
export function splitHandleOrientation(orientation: SplitOrientation = 'horizontal'): 'vertical' | 'horizontal' {
  return orientation === 'vertical' ? 'horizontal' : 'vertical';
}

export function clampSplit(size: number, min = 20, max = 80): number {
  return Math.round(Math.min(max, Math.max(min, size)) * 10) / 10;
}

/** The value the divider reports: the start pane's share, 0 or 100 while a pane is folded away. */
/** The divider's reported range: it reaches 0 or 100 on the side that folds away. */
export function splitRange(options: Pick<SplitPaneBehaviour, 'min' | 'max' | 'collapsible'>): [number, number] {
  return [options.collapsible === 'start' ? 0 : (options.min ?? 20), options.collapsible === 'end' ? 100 : (options.max ?? 80)];
}

export function splitValue(size: number, collapsed: boolean, collapsible: SplitCollapsible | undefined): number {
  if (!collapsed || !collapsible) return size;
  return collapsible === 'start' ? 0 : 100;
}

const list = (c: Child | Child[] | undefined): Child[] => (Array.isArray(c) ? c : c === undefined ? [] : [c]);

/**
 * Adds dragging and keyboard resizing to split-pane markup (`.mh-split` with `__pane--start`, `__handle`,
 * `__pane--end`). The divider follows the window splitter pattern: arrows resize, Page Up and Page Down move
 * further, Home and End go to the limits, Enter folds the collapsible pane. Shared with the React binding.
 */
export function bindSplitPane(root: HTMLElement, options: SplitPaneBehaviour = {}): SplitPaneController {
  const min = options.min ?? 20;
  const max = options.max ?? 80;
  const step = options.step ?? 5;
  const vertical = options.orientation === 'vertical';
  const handle = root.querySelector<HTMLElement>(':scope > .mh-split__handle')!;
  const startPane = root.querySelector<HTMLElement>(':scope > .mh-split__pane--start')!;
  const endPane = root.querySelector<HTMLElement>(':scope > .mh-split__pane--end')!;
  let size = clampSplit(options.size ?? 50, min, max);
  let collapsed = Boolean(options.collapsible && options.collapsed);

  const sync = (): void => {
    root.style.setProperty('--_size', `${size}%`);
    root.classList.toggle('is-collapsed', collapsed);
    startPane.hidden = collapsed && options.collapsible === 'start';
    endPane.hidden = collapsed && options.collapsible === 'end';
    handle.setAttribute('aria-valuenow', String(splitValue(size, collapsed, options.collapsible)));
  };

  const resize = (next: number, notify: boolean): void => {
    const value = clampSplit(next, min, max);
    const unfold = collapsed;
    if (value === size && !unfold) return;
    size = value;
    if (unfold) collapsed = false;
    sync();
    if (notify) {
      if (unfold) options.onCollapse?.(false);
      options.onResize?.(size);
    }
  };

  const fold = (value: boolean, notify: boolean): void => {
    if (!options.collapsible || value === collapsed) return;
    collapsed = value;
    sync();
    if (notify) options.onCollapse?.(collapsed);
  };

  const rtl = (): boolean => !vertical && getComputedStyle(root).direction === 'rtl';

  const onKey = (e: KeyboardEvent): void => {
    const less = vertical ? 'ArrowUp' : rtl() ? 'ArrowRight' : 'ArrowLeft';
    const more = vertical ? 'ArrowDown' : rtl() ? 'ArrowLeft' : 'ArrowRight';
    const from = collapsed ? splitValue(size, true, options.collapsible) : size;
    let next: number | null = null;
    if (e.key === less) next = from - step;
    else if (e.key === more) next = from + step;
    else if (e.key === 'PageUp') next = from - step * 4;
    else if (e.key === 'PageDown') next = from + step * 4;
    else if (e.key === 'Home') next = min;
    else if (e.key === 'End') next = max;
    else if (e.key === 'Enter' && options.collapsible) {
      e.preventDefault();
      fold(!collapsed, true);
      return;
    }
    if (next === null) return;
    e.preventDefault();
    // A folded pane opens only by moving away from its edge.
    if (collapsed && (options.collapsible === 'start' ? next <= from : next >= from)) return;
    resize(next, true);
  };

  let dragging: number | null = null;
  const pointerShare = (e: PointerEvent): number => {
    const rect = root.getBoundingClientRect();
    const length = vertical ? rect.height : rect.width;
    if (length <= 0) return size;
    const offset = vertical ? e.clientY - rect.top : rtl() ? rect.right - e.clientX : e.clientX - rect.left;
    return (offset / length) * 100;
  };
  const onDown = (e: PointerEvent): void => {
    if (e.button !== 0) return;
    e.preventDefault();
    dragging = e.pointerId;
    handle.setPointerCapture?.(e.pointerId);
    root.classList.add('is-resizing');
    handle.focus({ preventScroll: true });
  };
  const onMove = (e: PointerEvent): void => {
    if (dragging !== e.pointerId) return;
    const share = pointerShare(e);
    if (options.collapsible === 'start' && share < min / 2) fold(true, true);
    else if (options.collapsible === 'end' && share > max + (100 - max) / 2) fold(true, true);
    else resize(share, true);
  };
  const onUp = (e: PointerEvent): void => {
    if (dragging !== e.pointerId) return;
    dragging = null;
    handle.releasePointerCapture?.(e.pointerId);
    root.classList.remove('is-resizing');
  };
  const onDouble = (): void => fold(!collapsed, true);

  handle.addEventListener('keydown', onKey);
  handle.addEventListener('pointerdown', onDown);
  handle.addEventListener('pointermove', onMove);
  handle.addEventListener('pointerup', onUp);
  handle.addEventListener('pointercancel', onUp);
  handle.addEventListener('dblclick', onDouble);
  sync();

  return {
    size: () => size,
    collapsed: () => collapsed,
    setSize: (value) => {
      size = clampSplit(value, min, max);
      sync();
    },
    setCollapsed: (value) => fold(value, false),
    destroy: () => {
      handle.removeEventListener('keydown', onKey);
      handle.removeEventListener('pointerdown', onDown);
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      handle.removeEventListener('pointercancel', onUp);
      handle.removeEventListener('dblclick', onDouble);
    },
  };
}

/**
 * `.mh-split` (`--vertical`, `--collapse-start | --collapse-end`; states `.is-collapsed`, `.is-resizing`): two
 * panes (`__pane--start`, `__pane--end`) with a draggable `role="separator"` divider (`__handle` with a
 * `__grip`) between them. The start pane's share is the `--_size` custom property.
 */
export function createSplitPane(options: SplitPaneOptions = {}): SplitPaneHandle {
  const id = uid('mh-split');
  const startPane = h('div', { class: 'mh-split__pane mh-split__pane--start', id: `${id}-start`, role: options.startLabel ? 'region' : null, 'aria-label': options.startLabel });
  const endPane = h('div', { class: 'mh-split__pane mh-split__pane--end', id: `${id}-end`, role: options.endLabel ? 'region' : null, 'aria-label': options.endLabel });
  append(startPane, ...list(options.start));
  append(endPane, ...list(options.end));
  const handle = h(
    'div',
    {
      class: 'mh-split__handle',
      role: 'separator',
      tabindex: 0,
      'aria-orientation': splitHandleOrientation(options.orientation),
      'aria-label': options.label ?? 'Resize panes',
      'aria-controls': `${id}-${options.collapsible === 'end' ? 'end' : 'start'}`,
      'aria-valuemin': splitRange(options)[0],
      'aria-valuemax': splitRange(options)[1],
    },
    h('span', { class: 'mh-split__grip', 'aria-hidden': 'true' }),
  );
  const el = h('div', { class: splitPaneClass(options.orientation, options.collapsible) }, startPane, handle, endPane);
  const controller = bindSplitPane(el, options);
  return { el, startPane, endPane, ...controller };
}
