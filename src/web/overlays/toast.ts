import { mdiAlertOutline, mdiCheckCircleOutline, mdiClose, mdiCloseCircleOutline, mdiInformationOutline } from '@mdi/js';
import { createButton } from '../actions/button.ts';
import { createIconButton } from '../actions/iconButton.ts';
import { cx, h } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';
import { overlayHost } from './layer.ts';

export type ToastTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  message: string;
  title?: string;
  tone?: ToastTone;
  /** One action button (Undo, Retry); choosing it also dismisses the toast. */
  action?: ToastAction;
  /** Time on screen in ms; 0 keeps it until dismissed. Default from the toaster (longer with an action). */
  duration?: number;
  /** A close button. Default true. */
  dismissible?: boolean;
  /** Overrides the tone's icon; `false` for none. */
  icon?: IconName | string | false;
  onDismiss?: () => void;
}

export interface ToastHandle {
  el: HTMLElement;
  dismiss(): void;
}

export type ToasterPlacement = 'top' | 'top-end' | 'bottom' | 'bottom-end';

export interface ToasterOptions {
  /** Portals into the nearest `[data-mh-theme]` ancestor of this element (default `document.body`). */
  container?: HTMLElement | null;
  /** Default `bottom`. */
  placement?: ToasterPlacement;
  /** How many show at once; the rest wait in a queue. 1 shows one at a time. Default 3. */
  max?: number;
  /** Default time on screen in ms. Default 5000 (8000 with an action). */
  duration?: number;
  /** Accessible name of the region. Default "Notifications". */
  label?: string;
}

export interface Toaster {
  el: HTMLElement;
  show(options: ToastOptions | string): ToastHandle;
  dismissAll(): void;
  destroy(): void;
}

const TONE_ICON: Record<ToastTone, string | null> = { neutral: null, info: mdiInformationOutline, success: mdiCheckCircleOutline, warning: mdiAlertOutline, danger: mdiCloseCircleOutline };
const LEAVE_FALLBACK_MS = 400;
/** A live region needs a moment in the page before screen readers announce changes to it. */
const REGION_SETTLE_MS = 100;

export function toasterClass(placement: ToasterPlacement = 'bottom'): string {
  return `mh-toaster mh-toaster--${placement}`;
}

export function toastClass(tone: ToastTone = 'neutral'): string {
  return cx('mh-toast', `mh-toast--${tone}`);
}

interface Entry {
  handle: ToastHandle;
  mount(): void;
  shown: boolean;
}

/**
 * `.mh-toaster` (`--top | --top-end | --bottom | --bottom-end`): a polite live region that shows `.mh-toast`
 * messages (`--neutral | --info | --success | --warning | --danger`), up to `max` at a time with the rest queued.
 * Toasts dismiss themselves after `duration`; hovering or focusing one pauses its timer, Escape inside closes it.
 * Danger toasts are `role="alert"`.
 */
export function createToaster(options: ToasterOptions = {}): Toaster {
  const placement = options.placement ?? 'bottom';
  const max = Math.max(1, options.max ?? 3);
  const el = h('section', { class: toasterClass(placement), 'aria-label': options.label ?? 'Notifications', 'aria-live': 'polite', 'aria-relevant': 'additions', popover: 'manual' });
  overlayHost(options.container).append(el);
  // A manual popover lives in the top layer, so toasts show above open modals. Re-showing it moves it to the top of
  // that layer, above a modal opened after it.
  const raise = (): void => {
    if (typeof el.showPopover !== 'function') return;
    if (el.matches(':popover-open')) el.hidePopover();
    el.showPopover();
  };
  raise();
  const readyAt = Date.now() + REGION_SETTLE_MS;
  const visible: Entry[] = [];
  const queue: Entry[] = [];
  let pumpTimer: ReturnType<typeof setTimeout> | null = null;

  const pump = (): void => {
    const wait = readyAt - Date.now();
    if (wait > 0) {
      pumpTimer ??= setTimeout(() => {
        pumpTimer = null;
        pump();
      }, wait);
      return;
    }
    while (visible.length < max && queue.length > 0) {
      const next = queue.shift()!;
      visible.push(next);
      raise();
      next.mount();
    }
  };

  const show = (input: ToastOptions | string): ToastHandle => {
    const o: ToastOptions = typeof input === 'string' ? { message: input } : input;
    const tone = o.tone ?? 'neutral';
    const duration = o.duration ?? options.duration ?? (o.action ? 8000 : 5000);
    const iconName = o.icon === false ? null : (o.icon ?? TONE_ICON[tone]);
    let gone = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let remaining = duration;
    let startedAt = 0;
    const stop = (): void => {
      if (timer === null) return;
      clearTimeout(timer);
      timer = null;
      remaining -= Date.now() - startedAt;
    };
    const start = (): void => {
      if (gone || duration <= 0 || timer !== null) return;
      startedAt = Date.now();
      timer = setTimeout(dismiss, Math.max(0, remaining));
    };
    const dismiss = (): void => {
      if (gone) return;
      gone = true;
      if (timer !== null) clearTimeout(timer);
      timer = null;
      const qi = queue.indexOf(entry);
      if (qi >= 0) queue.splice(qi, 1);
      const vi = visible.indexOf(entry);
      if (vi >= 0) visible.splice(vi, 1);
      o.onDismiss?.();
      if (!entry.shown) return;
      node.classList.add('is-leaving');
      let removed = false;
      const remove = (): void => {
        if (removed) return;
        removed = true;
        node.remove();
      };
      node.addEventListener('animationend', remove, { once: true });
      setTimeout(remove, LEAVE_FALLBACK_MS);
      pump();
    };
    const actionBtn = o.action
      ? createButton({
          label: o.action.label,
          variant: 'text',
          size: 'small',
          onClick: () => {
            o.action!.onClick();
            dismiss();
          },
        }).el
      : null;
    actionBtn?.classList.add('mh-toast__action');
    const closeBtn = o.dismissible === false ? null : createIconButton({ icon: mdiClose, label: 'Dismiss', size: 'small', onClick: dismiss }).el;
    closeBtn?.classList.add('mh-toast__close');
    const node = h(
      'div',
      { class: toastClass(tone), role: tone === 'danger' ? 'alert' : null },
      iconName ? createIcon(iconName, { class: 'mh-toast__icon' }) : null,
      h('div', { class: 'mh-toast__content' }, o.title ? h('p', { class: 'mh-toast__title' }, o.title) : null, h('p', { class: 'mh-toast__message' }, o.message)),
      actionBtn,
      closeBtn,
    );
    node.addEventListener('pointerenter', stop);
    node.addEventListener('pointerleave', () => {
      if (!node.contains(document.activeElement)) start();
    });
    node.addEventListener('focusin', stop);
    node.addEventListener('focusout', (e) => {
      if (!node.contains(e.relatedTarget as Node | null)) start();
    });
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        dismiss();
      }
    });
    const handle: ToastHandle = { el: node, dismiss };
    const entry: Entry = {
      handle,
      shown: false,
      mount() {
        entry.shown = true;
        el.append(node);
        start();
      },
    };
    queue.push(entry);
    pump();
    return handle;
  };

  return {
    el,
    show,
    dismissAll() {
      for (const e of [...queue, ...visible]) e.handle.dismiss();
    },
    destroy() {
      if (pumpTimer !== null) clearTimeout(pumpTimer);
      queue.length = 0;
      for (const e of [...visible]) e.handle.dismiss();
      el.remove();
    },
  };
}

let shared: Toaster | null = null;

/** Shows a toast in a shared toaster (created on first use, at the bottom of `document.body`). */
export function toast(options: ToastOptions | string): ToastHandle {
  if (!shared || !shared.el.isConnected) shared = createToaster();
  return shared.show(options);
}
