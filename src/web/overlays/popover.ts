import { mdiClose } from '@mdi/js';
import { createIconButton } from '../actions/iconButton.ts';
import { append, cx, h, uid, type Child } from '../dom.ts';
import { focusables, overlayHost, placeFloating, type FloatingPlacement } from './layer.ts';

export type PopoverCloseReason = 'escape' | 'outside' | 'anchor' | 'close-button' | 'focus' | 'api';

export interface PopoverOptions {
  /** The control that opens the popover; it gets `aria-haspopup`, `aria-expanded` and `aria-controls`. */
  anchor: HTMLElement;
  /** Visible heading; also the accessible name. */
  title?: string;
  /** Accessible name when there's no title. */
  label?: string;
  content?: Child | Child[];
  /** Default `bottom`; flips when there's no room. */
  placement?: FloatingPlacement;
  /** A close button beside the title. Default false (Escape and a press outside close it). */
  closeButton?: boolean;
  closeLabel?: string;
  /** Clicking the anchor opens and closes it. Default true; false leaves opening to `open()`. */
  toggleOnClick?: boolean;
  /** Width: `auto` (content, capped), or `wide` for forms. */
  size?: 'auto' | 'wide';
  /** Portals into the nearest `[data-mh-theme]` ancestor of this element (default: the anchor's). */
  container?: HTMLElement | null;
  onOpen?: () => void;
  onClose?: (reason: PopoverCloseReason) => void;
}

export interface PopoverHandle {
  el: HTMLElement;
  body: HTMLElement;
  open(): void;
  close(): void;
  toggle(): void;
  isOpen(): boolean;
  setTitle(title: string): void;
  setContent(...children: Child[]): void;
  /** Places it again (after its content changed size). */
  reposition(): void;
  /** Closes it and detaches it and its listeners from the anchor. */
  destroy(): void;
}

const toArray = (c: Child | Child[] | undefined): Child[] => (Array.isArray(c) ? c : c === undefined ? [] : [c]);

export function popoverClass(size: 'auto' | 'wide' = 'auto'): string {
  return cx('mh-popover', size === 'wide' && 'mh-popover--wide');
}

/**
 * `.mh-popover` (`role="dialog"`, not modal): a floating panel anchored to a control, for a few quick settings
 * (a light's brightness, a filter) without leaving the page. Opens from its anchor and takes focus (the first
 * control, or the panel); Escape closes it back to the anchor; a press outside or Tab leaving it closes it. Parts
 * `__header`, `__title`, `__close`, `__body`.
 */
export function createPopover(options: PopoverOptions): PopoverHandle {
  const anchor = options.anchor;
  const placement = options.placement ?? 'bottom';
  const titleId = uid('mh-popover-title');
  const title = h('h2', { class: 'mh-popover__title', id: titleId }, options.title ?? '');
  const closeBtn = options.closeButton
    ? createIconButton({ icon: mdiClose, label: options.closeLabel ?? 'Close', size: 'small', onClick: () => close('close-button', true) }).el
    : null;
  closeBtn?.classList.add('mh-popover__close');
  const header = h('div', { class: 'mh-popover__header' }, title, closeBtn);
  const body = h('div', { class: 'mh-popover__body' });
  append(body, ...toArray(options.content));
  const el = h(
    'div',
    {
      class: popoverClass(options.size),
      role: 'dialog',
      id: uid('mh-popover'),
      tabindex: -1,
      'aria-labelledby': options.title ? titleId : null,
      'aria-label': options.title ? null : (options.label ?? null),
    },
    header,
    body,
  );
  const syncHeader = (text: string): void => {
    title.hidden = !text;
    header.hidden = !text && !closeBtn;
  };
  syncHeader(options.title ?? '');
  anchor.setAttribute('aria-haspopup', 'dialog');
  anchor.setAttribute('aria-expanded', 'false');
  let opened = false;

  const place = (): void => placeFloating(el, anchor, placement, 8);
  const onOutside = (e: Event): void => {
    const t = e.target as Node;
    if (!el.contains(t) && !anchor.contains(t)) close('outside', false);
  };
  const onViewport = (): void => {
    if (opened) place();
  };

  function open(): void {
    if (opened) return;
    opened = true;
    overlayHost(options.container ?? anchor).append(el);
    anchor.setAttribute('aria-expanded', 'true');
    anchor.setAttribute('aria-controls', el.id);
    place();
    document.addEventListener('pointerdown', onOutside, true);
    window.addEventListener('resize', onViewport);
    window.addEventListener('scroll', onViewport, true);
    const target = body.querySelector<HTMLElement>('[autofocus]') ?? focusables(body)[0] ?? el;
    target.focus({ preventScroll: true });
    options.onOpen?.();
  }

  function close(reason: PopoverCloseReason, refocus: boolean): void {
    if (!opened) return;
    opened = false;
    document.removeEventListener('pointerdown', onOutside, true);
    window.removeEventListener('resize', onViewport);
    window.removeEventListener('scroll', onViewport, true);
    anchor.setAttribute('aria-expanded', 'false');
    anchor.removeAttribute('aria-controls');
    const hadFocus = el.contains(document.activeElement);
    el.remove();
    if (refocus || (hadFocus && reason !== 'focus')) anchor.focus({ preventScroll: true });
    options.onClose?.(reason);
  }

  const onAnchorClick = (): void => {
    if (opened) close('anchor', true);
    else open();
  };
  if (options.toggleOnClick ?? true) anchor.addEventListener('click', onAnchorClick);

  el.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    e.stopPropagation();
    close('escape', true);
  });
  el.addEventListener('focusout', (e) => {
    const next = e.relatedTarget as Node | null;
    if (opened && next && !el.contains(next) && next !== anchor) close('focus', false);
  });

  return {
    el,
    body,
    open,
    close: () => close('api', false),
    toggle: () => (opened ? close('api', false) : open()),
    isOpen: () => opened,
    setTitle(text) {
      title.textContent = text;
      syncHeader(text);
      if (text) {
        el.setAttribute('aria-labelledby', titleId);
        el.removeAttribute('aria-label');
      }
      if (opened) place();
    },
    setContent(...children) {
      body.replaceChildren();
      append(body, ...children);
      if (opened) place();
    },
    reposition: () => {
      if (opened) place();
    },
    destroy() {
      close('api', false);
      anchor.removeEventListener('click', onAnchorClick);
      anchor.removeAttribute('aria-haspopup');
      anchor.removeAttribute('aria-expanded');
    },
  };
}
