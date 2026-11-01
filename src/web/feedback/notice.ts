import { mdiCheck, mdiClose, mdiInformationOutline, mdiLightbulbOutline, mdiShieldCheckOutline } from '@mdi/js';
import { buttonClass, type ButtonSize, type ButtonVariant } from '../actions/button.ts';
import { cx, h, uid } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';

/**
 * `permission`: explains why the app asks for access (microphone, location, notifications) before the system prompt.
 * `capability`: says a feature isn't available here, or needs something (a microphone, a newer version).
 * `tip`: a short hint, dismissible.
 */
export type NoticeKind = 'permission' | 'capability' | 'tip';

export interface NoticeAction {
  label: string;
  onClick?: () => void;
  /** The main action: a filled button (tonal for tips) rather than a text button. */
  primary?: boolean;
  /** Pressing it also dismisses the notice ("Got it", "Not now"). */
  dismisses?: boolean;
}

export interface NoticeOptions {
  kind?: NoticeKind;
  title?: string;
  message: string;
  /** Replaces the kind's icon; `false` hides it. */
  icon?: IconName | string | false;
  /** Permission: what the access is used for, as a short checklist. */
  points?: readonly string[];
  actions?: readonly NoticeAction[];
  /** A close button; default on for tips. */
  dismissible?: boolean;
  /** Default "Dismiss". */
  dismissLabel?: string;
  onDismiss?: () => void;
  /** Permission: the title's heading level (default 3). */
  headingLevel?: 2 | 3 | 4;
}

export interface NoticeHandle {
  el: HTMLElement;
  setMessage(message: string): void;
  dismiss(): void;
}

/** The icon each kind shows by default. */
export const NOTICE_ICONS: Record<NoticeKind, IconName | string> = { permission: mdiShieldCheckOutline, capability: mdiInformationOutline, tip: mdiLightbulbOutline };

export function noticeClass(kind: NoticeKind = 'tip'): string {
  return cx('mh-notice', `mh-notice--${kind}`);
}

/** Whether a kind shows a close button unless told otherwise. */
export const noticeDismissible = (kind: NoticeKind = 'tip', dismissible?: boolean): boolean => dismissible ?? kind === 'tip';

/** The button variant and size of an action. */
export function noticeActionStyle(kind: NoticeKind, primary = false): { variant: ButtonVariant; size: ButtonSize } {
  if (kind === 'permission') return { variant: primary ? 'primary' : 'text', size: 'medium' };
  return { variant: primary ? 'tonal' : 'text', size: 'small' };
}

/**
 * `.mh-notice--permission | --capability | --tip`. Permission is a `<section>` named by its heading; capability and
 * tip are `role="note"`. Parts `__icon`, `__body`, `__title`, `__message`, `__points`, `__point`, `__actions`,
 * `__dismiss`.
 */
export function createNotice(options: NoticeOptions): NoticeHandle {
  const kind = options.kind ?? 'tip';
  const titleId = kind === 'permission' && options.title ? uid('mh-notice') : null;
  const title = options.title
    ? kind === 'permission'
      ? h(`h${options.headingLevel ?? 3}` as 'h3', { class: 'mh-notice__title', id: titleId }, options.title)
      : h('p', { class: 'mh-notice__title' }, options.title)
    : null;
  const message = h('p', { class: 'mh-notice__message' }, options.message);
  const body = h('div', { class: 'mh-notice__body' }, title, message);
  if (options.points?.length) {
    body.append(h('ul', { class: 'mh-notice__points' }, ...options.points.map((p) => h('li', { class: 'mh-notice__point' }, createIcon(mdiCheck), h('span', {}, p)))));
  }
  const el =
    kind === 'permission'
      ? h('section', { class: noticeClass(kind), 'aria-labelledby': titleId })
      : h('div', { class: noticeClass(kind), role: 'note' });
  if (options.icon !== false) el.append(h('span', { class: 'mh-notice__icon' }, createIcon(options.icon ?? NOTICE_ICONS[kind])));
  el.append(body);

  const dismiss = (): void => {
    options.onDismiss?.();
    el.remove();
  };
  if (options.actions?.length) {
    const row = h('div', { class: 'mh-notice__actions' });
    for (const action of options.actions) {
      const { variant, size } = noticeActionStyle(kind, action.primary);
      const btn = h('button', { type: 'button', class: buttonClass(variant, size) }, h('span', { class: 'mh-button__label' }, action.label));
      btn.addEventListener('click', () => {
        action.onClick?.();
        if (action.dismisses) dismiss();
      });
      row.append(btn);
    }
    body.append(row);
  }
  if (noticeDismissible(kind, options.dismissible)) {
    const label = options.dismissLabel ?? 'Dismiss';
    el.append(h('button', { type: 'button', class: 'mh-notice__dismiss', 'aria-label': label, title: label, onclick: dismiss }, createIcon(mdiClose)));
  }
  return {
    el,
    setMessage(text) {
      message.textContent = text;
    },
    dismiss,
  };
}
