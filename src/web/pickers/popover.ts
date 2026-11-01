import { h, uid } from '../dom.ts';
import { overlayHost, placeFloating, type FloatingPlacement } from '../overlays/layer.ts';

export interface PickerPopoverOptions {
  /** The button that opens the popover; it gets `aria-haspopup="dialog"`, `aria-expanded` and `aria-controls`. */
  anchor: HTMLElement;
  /** Accessible name of the popover. */
  label: string;
  content: Node[];
  placement?: FloatingPlacement;
  /** Portals into the nearest `[data-mh-theme]` ancestor of this element (default: the anchor's). */
  container?: HTMLElement | null;
  /** Where focus goes when it opens (default: the first focusable element). */
  initialFocus?: () => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export interface PickerPopoverHandle {
  el: HTMLDivElement;
  open(): void;
  /** Closes; `refocus` returns focus to the anchor (default true). */
  close(refocus?: boolean): void;
  isOpen(): boolean;
  /** Re-anchors after the content changed size. */
  reposition(): void;
  destroy(): void;
}

/**
 * `.mh-picker-popover`: a non-modal dialog anchored to a button, on the overlay layer (portalled into the themed
 * host, placed with `placeFloating`). Escape closes back to the button; a press outside or focus leaving closes it.
 */
export function createPickerPopover(options: PickerPopoverOptions): PickerPopoverHandle {
  const { anchor } = options;
  const el = h('div', { class: 'mh-picker-popover', role: 'dialog', id: uid('mh-picker-popover'), 'aria-label': options.label }, ...options.content);
  anchor.setAttribute('aria-haspopup', 'dialog');
  anchor.setAttribute('aria-expanded', 'false');
  let opened = false;

  const place = (): void => placeFloating(el, anchor, options.placement ?? 'bottom-start', 6);
  const onOutside = (e: Event): void => {
    const t = e.target as Node;
    if (!el.contains(t) && !anchor.contains(t)) close(false);
  };
  const onViewport = (e: Event): void => {
    if (!opened) return;
    // Scrolling inside the popover itself doesn't move it.
    if (e.type === 'scroll' && e.target instanceof Node && el.contains(e.target)) return;
    place();
  };

  function open(): void {
    if (opened) return;
    opened = true;
    overlayHost(options.container ?? anchor).append(el);
    anchor.setAttribute('aria-expanded', 'true');
    anchor.setAttribute('aria-controls', el.id);
    options.onOpen?.();
    place();
    document.addEventListener('pointerdown', onOutside, true);
    window.addEventListener('resize', onViewport);
    window.addEventListener('scroll', onViewport, true);
    if (options.initialFocus) options.initialFocus();
    else el.querySelector<HTMLElement>('button:not([disabled]), input:not([disabled]), [tabindex="0"]')?.focus({ preventScroll: true });
  }

  function close(refocus = true): void {
    if (!opened) return;
    opened = false;
    document.removeEventListener('pointerdown', onOutside, true);
    window.removeEventListener('resize', onViewport);
    window.removeEventListener('scroll', onViewport, true);
    anchor.setAttribute('aria-expanded', 'false');
    anchor.removeAttribute('aria-controls');
    const hadFocus = el.contains(document.activeElement);
    el.remove();
    if (refocus || hadFocus) anchor.focus({ preventScroll: true });
    options.onClose?.();
  }

  el.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close(true);
    }
  });
  el.addEventListener('focusout', (e) => {
    const next = e.relatedTarget as Node | null;
    if (opened && next && !el.contains(next) && next !== anchor) close(false);
  });

  return {
    el,
    open,
    close,
    isOpen: () => opened,
    reposition: () => {
      if (opened) place();
    },
    destroy() {
      close(false);
      anchor.removeAttribute('aria-haspopup');
      anchor.removeAttribute('aria-expanded');
    },
  };
}
