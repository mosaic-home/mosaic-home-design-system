// The modal shell shared by dialog, confirm, bottom sheet and drawer: a native <dialog> opened with showModal()
// (top layer, the page behind is inert), filling the viewport with a scrim and one panel. Escape and a scrim click
// close it when dismissible; Tab is kept inside; focus returns to where it was on close.

import { mdiClose } from '@mdi/js';
import { createIconButton } from '../actions/iconButton.ts';
import { append, cx, h, uid, type Child } from '../dom.ts';
import { lockScroll, overlayHost, trapTab } from './layer.ts';

export type OverlayCloseReason = 'escape' | 'scrim' | 'close-button' | 'swipe' | 'confirm' | 'cancel' | 'api';

export interface OverlayBaseOptions {
  /** Visible title; also the accessible name. */
  title?: string;
  /** Accessible name when there's no visible title. */
  label?: string;
  /** A close button in the header. Default true. */
  closeButton?: boolean;
  /** Accessible name of the close button. Default "Close". */
  closeLabel?: string;
  /** Escape and a scrim click close it. Default true. */
  dismissible?: boolean;
  /** Portals into the nearest `[data-mh-theme]` ancestor of this element (default `document.body`). */
  container?: HTMLElement | null;
  /** Body content. */
  content?: Child | Child[];
  /** Footer content (usually buttons); the footer is hidden when empty. */
  footer?: Child | Child[];
  /** Called on every close, with what closed it (`'api'` for `close()`). */
  onClose?: (reason: OverlayCloseReason) => void;
  onOpen?: () => void;
}

export interface OverlayHandle {
  /** The `<dialog>` root. */
  el: HTMLDialogElement;
  panel: HTMLElement;
  body: HTMLElement;
  footer: HTMLElement;
  open(): void;
  close(): void;
  isOpen(): boolean;
  setTitle(title: string): void;
  setContent(...children: Child[]): void;
  setFooter(...children: Child[]): void;
  /** Closes immediately and detaches. */
  destroy(): void;
}

export interface ShellOptions extends OverlayBaseOptions {
  /** Class block: `mh-<block>` on the root and `mh-<block>__<part>` on the parts. */
  block: string;
  modifiers?: (string | false | null | undefined)[];
  description?: string;
  role?: 'dialog' | 'alertdialog';
  /** Extra nodes at the top of the panel (the sheet's drag handle). */
  before?: Node;
  /** What gets focus on open; default an `[autofocus]` element, else the panel. */
  initialFocus?: () => HTMLElement | null | undefined;
}

export interface Shell extends OverlayHandle {
  /** Closes with a reason (the public `close()` uses `'api'`). */
  dismiss(reason: OverlayCloseReason): void;
  dismissible: boolean;
}

/** Fallback when no animationend arrives (reduced motion, no CSS, a test DOM). */
const CLOSE_FALLBACK_MS = 450;

const toArray = (c: Child | Child[] | undefined): Child[] => (Array.isArray(c) ? c : c === undefined ? [] : [c]);

export function createShell(options: ShellOptions): Shell {
  const b = options.block;
  const titleId = uid(`mh-${b}-title`);
  const descId = uid(`mh-${b}-desc`);
  const title = h('h2', { class: `mh-${b}__title`, id: titleId }, options.title ?? '');
  const description = options.description ? h('p', { class: `mh-${b}__description`, id: descId }, options.description) : null;
  const dismissible = options.dismissible ?? true;
  const closeBtn =
    options.closeButton === false
      ? null
      : createIconButton({ icon: mdiClose, label: options.closeLabel ?? 'Close', size: 'small', onClick: () => shell.dismiss('close-button') }).el;
  closeBtn?.classList.add(`mh-${b}__close`);
  const header = h('header', { class: `mh-${b}__header` }, h('div', { class: `mh-${b}__heading` }, title, description), closeBtn);
  header.hidden = !options.title && !closeBtn;
  title.hidden = !options.title;
  const body = h('div', { class: `mh-${b}__body` });
  append(body, ...toArray(options.content));
  const footer = h('footer', { class: `mh-${b}__footer` });
  const setFooter = (...children: Child[]): void => {
    footer.replaceChildren();
    append(footer, ...children);
    footer.hidden = footer.childNodes.length === 0;
  };
  setFooter(...toArray(options.footer));
  const panel = h('div', { class: `mh-${b}__panel`, tabindex: -1 }, options.before ?? null, header, body, footer);
  const scrim = h('div', { class: 'mh-overlay__scrim', 'aria-hidden': 'true' });
  const el = h(
    'dialog',
    {
      class: cx('mh-overlay', `mh-${b}`, ...(options.modifiers ?? [])),
      role: options.role === 'alertdialog' ? 'alertdialog' : null,
      'aria-modal': 'true',
      'aria-labelledby': options.title ? titleId : null,
      'aria-label': options.title ? null : (options.label ?? null),
      'aria-describedby': description ? descId : null,
    },
    scrim,
    panel,
  );

  let opened = false;
  let previous: HTMLElement | null = null;
  let unlock: (() => void) | null = null;
  let pending: (() => void) | null = null;

  const finish = (): void => {
    pending?.();
    pending = null;
    el.classList.remove('is-closing');
    if (el.open) el.close();
    el.removeAttribute('open');
    el.remove();
    unlock?.();
    unlock = null;
    const back = previous;
    previous = null;
    if (back?.isConnected) back.focus({ preventScroll: true });
  };

  const shell: Shell = {
    el,
    panel,
    body,
    footer,
    dismissible,
    open() {
      if (opened) return;
      opened = true;
      // Reopened while the close animation runs: keep the dialog, drop the pending teardown.
      if (pending) {
        pending();
        pending = null;
        el.classList.remove('is-closing');
      } else {
        const active = document.activeElement;
        previous = active instanceof HTMLElement && active !== document.body ? active : null;
      }
      if (!el.isConnected) overlayHost(options.container).append(el);
      if (!el.open) {
        if (typeof el.showModal === 'function') el.showModal();
        else el.setAttribute('open', '');
      }
      unlock ??= lockScroll();
      const target = options.initialFocus?.() ?? panel.querySelector<HTMLElement>('[autofocus]') ?? panel;
      target.focus({ preventScroll: true });
      options.onOpen?.();
    },
    dismiss(reason) {
      if (!opened) return;
      opened = false;
      el.classList.add('is-closing');
      const onEnd = (e: Event): void => {
        if (e.target === panel) finish();
      };
      const timer = setTimeout(finish, CLOSE_FALLBACK_MS);
      panel.addEventListener('animationend', onEnd);
      pending = () => {
        clearTimeout(timer);
        panel.removeEventListener('animationend', onEnd);
      };
      options.onClose?.(reason);
    },
    close() {
      shell.dismiss('api');
    },
    isOpen: () => opened,
    setTitle(text) {
      title.textContent = text;
      title.hidden = !text;
      header.hidden = !text && !closeBtn;
      if (text) {
        el.setAttribute('aria-labelledby', titleId);
        el.removeAttribute('aria-label');
      }
    },
    setContent(...children) {
      body.replaceChildren();
      append(body, ...children);
    },
    setFooter,
    destroy() {
      opened = false;
      finish();
    },
  };

  el.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Handled here so the browser's own cancel (and its close-watcher rules) never runs.
      e.preventDefault();
      e.stopPropagation();
      if (dismissible) shell.dismiss('escape');
    } else trapTab(e, panel);
  });
  el.addEventListener('cancel', (e) => {
    e.preventDefault();
    if (dismissible) shell.dismiss('escape');
  });
  // The browser closed it on its own (a forced close): keep the state in step.
  el.addEventListener('close', () => {
    if (opened && !el.open) {
      shell.dismiss('escape');
      finish();
    }
  });
  scrim.addEventListener('click', () => {
    if (dismissible) shell.dismiss('scrim');
  });
  return shell;
}

/** The public part of a shell. */
export function publicHandle(shell: Shell): OverlayHandle {
  const { el, panel, body, footer, open, close, isOpen, setTitle, setContent, setFooter, destroy } = shell;
  return { el, panel, body, footer, open, close, isOpen, setTitle, setContent, setFooter, destroy };
}
