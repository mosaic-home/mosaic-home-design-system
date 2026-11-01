import { cx, h } from '../dom.ts';

/** `horizontal`: a toolbar row. `vertical`: a tool rail down the side of a canvas. */
export type ToolbarOrientation = 'horizontal' | 'vertical';
/** `bar`: flush with its surroundings. `floating`: a raised pill over content. */
export type ToolbarVariant = 'bar' | 'floating';
/** A control, a `separator` between groups, or a `spacer` that pushes the rest to the far end. */
export type ToolbarItem = HTMLElement | 'separator' | 'spacer';

export interface ToolbarOptions {
  /** Required: the toolbar's accessible name. */
  label: string;
  items?: readonly ToolbarItem[];
  orientation?: ToolbarOrientation;
  variant?: ToolbarVariant;
}

export interface ToolbarController {
  /** Re-reads the controls (after adding or disabling some); the roving tab stop stays where it was. */
  refresh(): void;
  destroy(): void;
}

export interface ToolbarHandle extends ToolbarController {
  el: HTMLDivElement;
  /** Adds an item at the end. */
  add(item: ToolbarItem): void;
}

export function toolbarClass(orientation: ToolbarOrientation = 'horizontal', variant: ToolbarVariant = 'bar'): string {
  return cx('mh-toolbar', orientation === 'vertical' && 'mh-toolbar--vertical', variant === 'floating' && 'mh-toolbar--floating');
}

/** The separator's own orientation: across the toolbar. */
export function toolbarSeparatorOrientation(orientation: ToolbarOrientation = 'horizontal'): 'vertical' | 'horizontal' {
  return orientation === 'vertical' ? 'horizontal' : 'vertical';
}

export function toolbarItemElement(item: ToolbarItem, orientation: ToolbarOrientation = 'horizontal'): HTMLElement {
  if (item === 'separator') return h('div', { class: 'mh-toolbar__separator', role: 'separator', 'aria-orientation': toolbarSeparatorOrientation(orientation) });
  if (item === 'spacer') return h('div', { class: 'mh-toolbar__spacer', 'aria-hidden': 'true' });
  return item;
}

const FOCUSABLE = 'button, input, select, textarea, a[href], [tabindex]:not(.mh-toolbar__separator)';

/** Keys a text field inside the toolbar keeps for its own caret. */
const TEXT_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'Home', 'End']);

/**
 * The toolbar pattern on existing markup: one tab stop for the whole toolbar (a roving `tabindex`), arrows along
 * the toolbar move between controls (wrapping), Home and End go to the ends. Controls are found by query, so the
 * React binding can render its own children. Shared with the React binding.
 */
export function bindToolbar(root: HTMLElement): ToolbarController {
  const vertical = (): boolean => root.getAttribute('aria-orientation') === 'vertical';
  const controls = (): HTMLElement[] =>
    Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => !(el as HTMLButtonElement).disabled && !el.closest('[hidden], [inert]') && el.closest('.mh-toolbar') === root);
  let current: HTMLElement | null = null;

  const refresh = (): void => {
    const items = controls();
    if (!current || !items.includes(current)) current = items[0] ?? null;
    for (const item of items) item.tabIndex = item === current ? 0 : -1;
  };

  const onFocus = (e: FocusEvent): void => {
    const target = controls().find((c) => c === e.target || c.contains(e.target as Node));
    if (target && target !== current) {
      current = target;
      refresh();
    }
  };

  const onKey = (e: KeyboardEvent): void => {
    const items = controls();
    const at = items.findIndex((c) => c === e.target || c.contains(e.target as Node));
    if (at < 0) return;
    const target = e.target as HTMLElement;
    const isText = target instanceof HTMLInputElement ? !['button', 'checkbox', 'radio', 'range', 'color'].includes(target.type) : target instanceof HTMLTextAreaElement || target.isContentEditable;
    if (isText && TEXT_KEYS.has(e.key)) return;
    const rtl = !vertical() && getComputedStyle(root).direction === 'rtl';
    const next = vertical() ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
    const prev = vertical() ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
    let to: number | null = null;
    if (e.key === next) to = (at + 1) % items.length;
    else if (e.key === prev) to = (at - 1 + items.length) % items.length;
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = items.length - 1;
    if (to === null) return;
    e.preventDefault();
    current = items[to]!;
    refresh();
    current.focus();
  };

  root.addEventListener('focusin', onFocus);
  root.addEventListener('keydown', onKey);
  const observer = typeof MutationObserver === 'function' ? new MutationObserver(refresh) : null;
  observer?.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'hidden'] });
  refresh();
  return {
    refresh,
    destroy: () => {
      root.removeEventListener('focusin', onFocus);
      root.removeEventListener('keydown', onKey);
      observer?.disconnect();
    },
  };
}

/**
 * `.mh-toolbar` (`--vertical` tool rail, `--floating`): a `role="toolbar"` of controls with
 * `__separator` and `__spacer` items. One tab stop; arrows move between the controls.
 */
export function createToolbar(options: ToolbarOptions): ToolbarHandle {
  const orientation = options.orientation ?? 'horizontal';
  const el = h(
    'div',
    { class: toolbarClass(orientation, options.variant), role: 'toolbar', 'aria-label': options.label, 'aria-orientation': orientation },
    ...(options.items ?? []).map((item) => toolbarItemElement(item, orientation)),
  );
  const controller = bindToolbar(el);
  return {
    el,
    ...controller,
    add: (item) => {
      el.append(toolbarItemElement(item, orientation));
      controller.refresh();
    },
  };
}
