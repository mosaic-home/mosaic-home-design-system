// Shared plumbing for overlays: where to portal them, focus helpers, scroll lock and anchored placement.

/**
 * The element an overlay is appended to: the nearest `[data-mh-theme]` ancestor of `container`, so a locally themed
 * area keeps its theme, or `document.body` (the theme is normally on `<html>`, which body inherits from).
 */
export function overlayHost(container?: HTMLElement | null): HTMLElement {
  const themed = container?.closest<HTMLElement>('[data-mh-theme]');
  return themed && themed !== document.documentElement ? themed : document.body;
}

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

/** Keyboard-focusable elements inside `root`, in DOM order. */
export function focusables(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => !el.closest('[hidden], [inert]'));
}

/** Keeps Tab and Shift+Tab inside `root` (call from a keydown listener). */
export function trapTab(event: KeyboardEvent, root: HTMLElement): void {
  if (event.key !== 'Tab') return;
  const list = focusables(root);
  if (list.length === 0) {
    event.preventDefault();
    return;
  }
  const i = list.indexOf(document.activeElement as HTMLElement);
  if (event.shiftKey && i <= 0) {
    event.preventDefault();
    list[list.length - 1]!.focus();
  } else if (!event.shiftKey && (i === -1 || i === list.length - 1)) {
    event.preventDefault();
    list[0]!.focus();
  }
}

let locks = 0;
let savedOverflow = '';

/** Stops the page behind a modal from scrolling; returns the release function (locks nest). */
export function lockScroll(): () => void {
  const root = document.documentElement;
  if (locks === 0) {
    savedOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
  }
  locks += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks -= 1;
    if (locks === 0) root.style.overflow = savedOverflow;
  };
}

export type FloatingPlacement = 'top' | 'bottom' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';

const EDGE = 8;

/**
 * Positions a `position: fixed` element next to an anchor, flipping to the other side when it doesn't fit and
 * staying inside the viewport. Records the side used in `data-side` (for the enter animation's origin).
 */
export function placeFloating(floating: HTMLElement, anchor: Element, placement: FloatingPlacement, gap = 6): void {
  const a = anchor.getBoundingClientRect();
  const f = floating.getBoundingClientRect();
  const vw = document.documentElement.clientWidth || window.innerWidth;
  const vh = document.documentElement.clientHeight || window.innerHeight;
  const [prefer, align] = placement.split('-') as ['top' | 'bottom', 'start' | 'end' | undefined];
  const below = vh - a.bottom - gap;
  const above = a.top - gap;
  let side = prefer;
  if (side === 'bottom' && f.height > below && above > below) side = 'top';
  else if (side === 'top' && f.height > above && below > above) side = 'bottom';
  let top = side === 'bottom' ? a.bottom + gap : a.top - gap - f.height;
  top = Math.max(EDGE, Math.min(top, vh - f.height - EDGE));
  let left = align === 'start' ? a.left : align === 'end' ? a.right - f.width : a.left + a.width / 2 - f.width / 2;
  left = Math.max(EDGE, Math.min(left, vw - f.width - EDGE));
  floating.style.top = `${Math.round(top)}px`;
  floating.style.left = `${Math.round(left)}px`;
  floating.dataset.side = side;
}
