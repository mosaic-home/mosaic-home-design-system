import { h, uid } from '../dom.ts';
import { overlayHost, placeFloating } from './layer.ts';

export type TooltipPlacement = 'top' | 'bottom';

export interface TooltipOptions {
  text: string;
  /** Default `top`; flips when there's no room. */
  placement?: TooltipPlacement;
  /** Hover delay in ms before showing. Default 500. Focus shows it at once. */
  delay?: number;
  /** Portals into the nearest `[data-mh-theme]` ancestor of this element (default: the target's). */
  container?: HTMLElement | null;
}

export interface TooltipHandle {
  el: HTMLElement;
  show(): void;
  hide(): void;
  setText(text: string): void;
  /** Removes the tooltip and its listeners, restoring the target's attributes. */
  destroy(): void;
}

const HIDE_GRACE_MS = 120;

/**
 * `.mh-tooltip` (`role="tooltip"`): a short hint for `target`, shown on hover (after `delay`) and on keyboard focus,
 * hidden on leave, blur or Escape. The pointer can move onto the hint without it vanishing. The target gets
 * `aria-describedby` unless its accessible name already says the same; its `title` is held back meanwhile so the
 * browser's own tooltip doesn't double it.
 */
export function createTooltip(target: HTMLElement, options: TooltipOptions): TooltipHandle {
  // Kept in the page (hidden) so `aria-describedby` always resolves.
  const el = h('div', { class: 'mh-tooltip', role: 'tooltip', id: uid('mh-tooltip'), hidden: true }, options.text);
  overlayHost(options.container ?? target).append(el);
  const savedTitle = target.getAttribute('title');
  target.removeAttribute('title');
  const describedBy = target.getAttribute('aria-describedby');
  let text = options.text;
  const syncDescribedBy = (): void => {
    const ids = (describedBy ?? '').split(/\s+/).filter(Boolean);
    if (target.getAttribute('aria-label') !== text) ids.push(el.id);
    if (ids.length) target.setAttribute('aria-describedby', ids.join(' '));
    else target.removeAttribute('aria-describedby');
  };
  syncDescribedBy();

  let showTimer: ReturnType<typeof setTimeout> | null = null;
  let hideTimer: ReturnType<typeof setTimeout> | null = null;
  let visible = false;
  const clear = (): void => {
    if (showTimer !== null) clearTimeout(showTimer);
    if (hideTimer !== null) clearTimeout(hideTimer);
    showTimer = hideTimer = null;
  };
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && visible) hide();
  };
  function show(): void {
    clear();
    if (visible) return;
    visible = true;
    const host = overlayHost(options.container ?? target);
    if (el.parentElement !== host) host.append(el);
    el.hidden = false;
    placeFloating(el, target, options.placement ?? 'top', 8);
    document.addEventListener('keydown', onKey, true);
  }
  function hide(): void {
    clear();
    if (!visible) return;
    visible = false;
    el.hidden = true;
    document.removeEventListener('keydown', onKey, true);
  }
  const hideSoon = (): void => {
    if (showTimer !== null) clearTimeout(showTimer);
    showTimer = null;
    hideTimer ??= setTimeout(hide, HIDE_GRACE_MS);
  };
  const onEnter = (e: PointerEvent): void => {
    if (e.pointerType === 'touch') return;
    if (hideTimer !== null) clearTimeout(hideTimer);
    hideTimer = null;
    if (!visible) showTimer ??= setTimeout(show, options.delay ?? 500);
  };
  const onFocus = (): void => {
    // Keyboard focus only: a mouse click that focuses the target shouldn't pop the hint.
    let keyboard = true;
    try {
      keyboard = target.matches(':focus-visible');
    } catch {
      // An engine without :focus-visible: show it.
    }
    if (keyboard) show();
  };
  const onTipEnter = (): void => {
    if (hideTimer !== null) clearTimeout(hideTimer);
    hideTimer = null;
  };

  target.addEventListener('pointerenter', onEnter);
  target.addEventListener('pointerleave', hideSoon);
  target.addEventListener('focus', onFocus);
  target.addEventListener('blur', hide);
  target.addEventListener('pointerdown', hide);
  el.addEventListener('pointerenter', onTipEnter);
  el.addEventListener('pointerleave', hideSoon);

  return {
    el,
    show,
    hide,
    setText(next) {
      text = next;
      el.textContent = next;
      syncDescribedBy();
      if (visible) placeFloating(el, target, options.placement ?? 'top', 8);
    },
    destroy() {
      hide();
      el.remove();
      target.removeEventListener('pointerenter', onEnter);
      target.removeEventListener('pointerleave', hideSoon);
      target.removeEventListener('focus', onFocus);
      target.removeEventListener('blur', hide);
      target.removeEventListener('pointerdown', hide);
      if (savedTitle !== null) target.setAttribute('title', savedTitle);
      if (describedBy !== null) target.setAttribute('aria-describedby', describedBy);
      else target.removeAttribute('aria-describedby');
    },
  };
}
