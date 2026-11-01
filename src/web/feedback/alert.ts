import { mdiAlertCircleOutline, mdiAlertOutline, mdiCheckCircleOutline, mdiClose, mdiInformationOutline } from '@mdi/js';
import { cx, h } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

export interface AlertOptions {
  message: string;
  tone?: AlertTone;
  title?: string;
  /** Replaces the tone's icon; `false` hides the icon. */
  icon?: IconName | string | false;
  /** An action at the end (a text button or link). */
  action?: HTMLElement;
  /** Shows a close button; `onDismiss` runs and the alert removes itself. */
  dismissible?: boolean;
  /** Label of the close button (default "Dismiss"). */
  dismissLabel?: string;
  onDismiss?: () => void;
}

export interface AlertHandle {
  el: HTMLDivElement;
  setMessage(message: string): void;
  setTitle(title: string | null): void;
  dismiss(): void;
}

/** The icon each tone shows by default. */
export const ALERT_ICONS: Record<AlertTone, string> = { info: mdiInformationOutline, success: mdiCheckCircleOutline, warning: mdiAlertOutline, danger: mdiAlertCircleOutline };

export function alertClass(tone: AlertTone = 'info'): string {
  return cx('mh-alert', `mh-alert--${tone}`);
}

/** Warnings and errors interrupt (`role="alert"`); info and success are polite (`role="status"`). */
export function alertRole(tone: AlertTone = 'info'): 'alert' | 'status' {
  return tone === 'warning' || tone === 'danger' ? 'alert' : 'status';
}

/**
 * `.mh-alert--info | --success | --warning | --danger`: an inline message with an icon, optional title, action and
 * close button. Parts `__icon`, `__body`, `__title`, `__message`, `__action`, `__dismiss`.
 */
export function createAlert(options: AlertOptions): AlertHandle {
  const tone = options.tone ?? 'info';
  const message = h('p', { class: 'mh-alert__message' }, options.message);
  const body = h('div', { class: 'mh-alert__body' }, message);
  let title: HTMLElement | null = null;
  const setTitle = (text: string | null): void => {
    if (text === null) {
      title?.remove();
      title = null;
      return;
    }
    if (!title) {
      title = h('p', { class: 'mh-alert__title' });
      body.prepend(title);
    }
    title.textContent = text;
  };
  const icon = options.icon === false ? null : h('span', { class: 'mh-alert__icon' }, createIcon(options.icon ?? ALERT_ICONS[tone]));
  const el = h('div', { class: alertClass(tone), role: alertRole(tone) }, icon, body);
  if (options.action) el.append(h('div', { class: 'mh-alert__action' }, options.action));
  const dismiss = (): void => {
    options.onDismiss?.();
    el.remove();
  };
  if (options.dismissible) {
    const label = options.dismissLabel ?? 'Dismiss';
    el.append(h('button', { type: 'button', class: 'mh-alert__dismiss', 'aria-label': label, title: label, onclick: dismiss }, createIcon(mdiClose)));
  }
  if (options.title) setTitle(options.title);
  return {
    el,
    setMessage(text) {
      message.textContent = text;
    },
    setTitle,
    dismiss,
  };
}
