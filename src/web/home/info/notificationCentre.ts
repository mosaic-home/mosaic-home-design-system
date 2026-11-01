import { mdiAlertCircle, mdiAlertOutline, mdiBellOutline, mdiClose } from '@mdi/js';
import { createButton, type ButtonVariant } from '../../actions/button.ts';
import { createIconButton } from '../../actions/iconButton.ts';
import { cx, h } from '../../dom.ts';
import { createIcon, type IconName } from '../../icons.ts';

/** `critical` is pinned on top and not dismissible unless asked; `high` is marked; `low` is quieter. */
export type NotificationPriority = 'critical' | 'high' | 'normal' | 'low';

export interface NotificationAction {
  id: string;
  label: string;
  /** `primary` for the main action (tonal button), `danger` for a destructive one; the rest are text buttons. */
  tone?: 'primary' | 'default' | 'danger';
}

export interface NotificationItem {
  id: string;
  title: string;
  message?: string | null;
  /** Shown as given ("2 min ago", "07:42"). */
  time?: string | null;
  /** Leading icon (default: a bell; an alert sign for critical and high). */
  icon?: IconName | string;
  /** Notifications with the same group are listed together under its name. */
  group?: string | null;
  priority?: NotificationPriority;
  actions?: readonly NotificationAction[];
  /** Default: every notification but a critical one, when `onDismiss` is set. */
  dismissible?: boolean;
  unread?: boolean;
}

export interface NotificationCentreLabels {
  /** The heading and accessible name. */
  title: string;
  /** Heading of the pinned critical notifications. */
  pinned: string;
  /** Heading of notifications without a group, when there are groups. */
  other: string;
  /** Spoken before a critical notification's title. */
  critical: string;
  /** Spoken before an unread notification's title. */
  unread: string;
  dismiss: (title: string) => string;
  clearAll: string;
  empty: string;
  showMore: (count: number) => string;
  showLess: string;
}

export const NOTIFICATION_CENTRE_LABELS: NotificationCentreLabels = {
  title: 'Notifications',
  pinned: 'Needs attention',
  other: 'Other',
  critical: 'Critical',
  unread: 'New',
  dismiss: (title) => `Dismiss ${title}`,
  clearAll: 'Clear all',
  empty: 'No notifications',
  showMore: (count) => `Show ${count} more`,
  showLess: 'Show less',
};

export interface NotificationCentreOptions {
  notifications: readonly NotificationItem[];
  /** Shows the title row (heading, count, "Clear all"); default true. The title stays the accessible name either way. */
  header?: boolean;
  /** Level of the title (default 2); group headings are one below. */
  headingLevel?: 2 | 3 | 4;
  /** A group longer than this shows its first ones and a "Show n more" button (default 3; 0 never folds). */
  collapseAfter?: number;
  onAction?: (id: string, actionId: string) => void;
  onDismiss?: (id: string) => void;
  /** Shows "Clear all"; called with the ids of every dismissible notification. */
  onClearAll?: (ids: string[]) => void;
  labels?: Partial<NotificationCentreLabels>;
}

export interface NotificationCentreHandle {
  el: HTMLElement;
  /** Applies changed options; omitted ones keep their value. */
  update(changes: Partial<NotificationCentreOptions>): void;
}

export interface NotificationGroupView {
  /** The group's key (`''` for notifications without one). */
  key: string;
  /** Its heading, or null when nothing needs one. */
  name: string | null;
  items: NotificationItem[];
  /** Left out while folded. */
  hidden: number;
  /** Unfolded by the user (only meaningful when the group can fold). */
  expanded: boolean;
  /** Longer than `collapseAfter`. */
  folds: boolean;
}

export interface NotificationCentreView {
  pinned: NotificationItem[];
  groups: NotificationGroupView[];
  /** Ids of every notification that can be dismissed. */
  dismissible: string[];
  count: number;
}

/** Whether a notification gets a dismiss button. */
export function notificationDismissible(n: NotificationItem, canDismiss: boolean): boolean {
  return canDismiss && (n.dismissible ?? n.priority !== 'critical');
}

/**
 * Critical notifications first (pinned), then the rest by group in order of first appearance, ungrouped ones last
 * (under "Other" when there are groups). Groups longer than `collapseAfter` are cut unless their key is in `expanded`.
 */
export function notificationCentreView(
  items: readonly NotificationItem[],
  options: {
    collapseAfter?: number;
    expanded?: ReadonlySet<string>;
    canDismiss?: boolean;
    other?: string;
  } = {},
): NotificationCentreView {
  const limit = options.collapseAfter ?? 3;
  const pinned = items.filter((n) => n.priority === 'critical');
  const byGroup = new Map<string, NotificationItem[]>();
  for (const n of items) {
    if (n.priority === 'critical') continue;
    const key = n.group?.trim() ?? '';
    const list = byGroup.get(key) ?? [];
    list.push(n);
    byGroup.set(key, list);
  }
  const keys = [...byGroup.keys()].filter((k) => k !== '');
  if (byGroup.has('')) keys.push('');
  const named = keys.some((k) => k !== '');
  const groups = keys.map((key): NotificationGroupView => {
    const all = byGroup.get(key)!;
    const folds = limit > 0 && all.length > limit;
    const expanded = options.expanded?.has(key) ?? false;
    const shown = folds && !expanded ? all.slice(0, limit) : all;
    return {
      key,
      name: key ? key : named ? (options.other ?? NOTIFICATION_CENTRE_LABELS.other) : null,
      items: shown,
      hidden: all.length - shown.length,
      expanded,
      folds,
    };
  });
  const dismissible = items.filter((n) => notificationDismissible(n, options.canDismiss ?? true)).map((n) => n.id);
  return { pinned, groups, dismissible, count: items.length };
}

export function notificationClass(n: Pick<NotificationItem, 'priority' | 'unread'>): string {
  return cx('mh-notification', n.priority && n.priority !== 'normal' && `mh-notification--${n.priority}`, n.unread && 'is-unread');
}

/** The leading icon of a notification. */
export function notificationIcon(n: Pick<NotificationItem, 'priority' | 'icon'>): string {
  return n.icon ?? (n.priority === 'critical' ? mdiAlertCircle : n.priority === 'high' ? mdiAlertOutline : mdiBellOutline);
}

/** Button variant of an action. */
export function notificationActionVariant(tone: NotificationAction['tone']): ButtonVariant {
  return tone === 'primary' ? 'tonal' : tone === 'danger' ? 'danger' : 'text';
}

/** What a screen reader hears before the title ("Critical: ", "New: "). */
export function notificationPrefix(n: Pick<NotificationItem, 'priority' | 'unread'>, labels: NotificationCentreLabels): string {
  return [n.priority === 'critical' && labels.critical, n.unread && labels.unread].filter(Boolean).join(', ') + (n.priority === 'critical' || n.unread ? ': ' : '');
}

export const NOTIFICATION_DISMISS_ICON = mdiClose;

/**
 * `section.mh-notification-centre`: a `__header` (`__title`, `__count`, "Clear all"), then the pinned critical
 * notifications (`__section--pinned`) and one `__section` per group, each with a `__section-title` and a `__list`
 * of `li.mh-notification` (`--critical | --high | --low`, `.is-unread`): `__icon`, `__body` (`__top` with
 * `__title` and `__time`, `__message`, `__actions`) and a `__dismiss` button. A long group folds behind a
 * `__more` toggle. When a dismissed notification goes, focus moves to the next one (or the centre itself).
 */
export function createNotificationCentre(options: NotificationCentreOptions): NotificationCentreHandle {
  let o: NotificationCentreOptions = { ...options };
  const expanded = new Set<string>();
  const el = h('section', { class: 'mh-notification-centre', tabindex: '-1' });
  /** Index (in display order) of the notification whose dismiss button was pressed, to move focus on. */
  let refocusAt: number | null = null;

  const item = (n: NotificationItem, labels: NotificationCentreLabels, canDismiss: boolean): HTMLLIElement => {
    const prefix = notificationPrefix(n, labels);
    const actions = n.actions?.length
      ? h(
          'div',
          { class: 'mh-notification__actions' },
          ...n.actions.map(
            (a) =>
              createButton({
                label: a.label,
                size: 'small',
                variant: notificationActionVariant(a.tone),
                onClick: () => o.onAction?.(n.id, a.id),
              }).el,
          ),
        )
      : null;
    const li = h(
      'li',
      { class: notificationClass(n), 'data-id': n.id },
      h('span', { class: 'mh-notification__icon', 'aria-hidden': 'true' }, createIcon(notificationIcon(n))),
      h(
        'div',
        { class: 'mh-notification__body' },
        h(
          'div',
          { class: 'mh-notification__top' },
          h('span', { class: 'mh-notification__title' }, prefix ? h('span', { class: 'mh-visually-hidden' }, prefix) : null, n.title),
          n.time ? h('span', { class: 'mh-notification__time' }, n.time) : null,
        ),
        n.message ? h('p', { class: 'mh-notification__message' }, n.message) : null,
        actions,
      ),
    );
    if (notificationDismissible(n, canDismiss)) {
      const dismiss = createIconButton({
        icon: NOTIFICATION_DISMISS_ICON,
        label: labels.dismiss(n.title),
        size: 'small',
        onClick: () => {
          refocusAt = [...el.querySelectorAll('.mh-notification')].indexOf(li);
          o.onDismiss?.(n.id);
        },
      }).el;
      dismiss.classList.add('mh-notification__dismiss');
      li.append(dismiss);
    }
    return li;
  };

  const render = (): void => {
    const labels = { ...NOTIFICATION_CENTRE_LABELS, ...o.labels };
    const canDismiss = !!o.onDismiss;
    const view = notificationCentreView(o.notifications, {
      collapseAfter: o.collapseAfter,
      expanded,
      canDismiss,
      other: labels.other,
    });
    const level = o.headingLevel ?? 2;
    const head = `h${level}` as 'h2';
    const sub = `h${Math.min(level + 1, 6)}` as 'h3';
    el.setAttribute('aria-label', labels.title);
    const section = (name: string | null, items: NotificationItem[], pinned: boolean, group?: NotificationGroupView): HTMLElement =>
      h(
        'div',
        {
          class: cx('mh-notification-centre__section', pinned && 'mh-notification-centre__section--pinned'),
        },
        name ? h(sub, { class: 'mh-notification-centre__section-title' }, name) : null,
        h('ul', { class: 'mh-notification-centre__list', role: 'list' }, ...items.map((n) => item(n, labels, canDismiss))),
        group?.folds
          ? (() => {
              const more = createButton({
                label: group.expanded ? labels.showLess : labels.showMore(group.hidden),
                size: 'small',
                variant: 'text',
                onClick: () => {
                  if (expanded.has(group.key)) expanded.delete(group.key);
                  else expanded.add(group.key);
                  render();
                  el.querySelector<HTMLElement>(`.mh-notification-centre__more[data-group="${CSS.escape(group.key)}"]`)?.focus();
                },
              }).el;
              more.classList.add('mh-notification-centre__more');
              more.setAttribute('aria-expanded', String(group.expanded));
              more.dataset.group = group.key;
              return more;
            })()
          : null,
      );
    const clear =
      o.onClearAll && view.dismissible.length
        ? createButton({
            label: labels.clearAll,
            size: 'small',
            variant: 'text',
            onClick: () =>
              o.onClearAll?.(
                notificationCentreView(o.notifications, {
                  canDismiss: !!o.onDismiss,
                }).dismissible,
              ),
          }).el
        : null;
    clear?.classList.add('mh-notification-centre__clear');
    el.replaceChildren(
      ...(o.header === false
        ? []
        : [
            h(
              'div',
              { class: 'mh-notification-centre__header' },
              h(head, { class: 'mh-notification-centre__title' }, labels.title),
              view.count ? h('span', { class: 'mh-notification-centre__count' }, view.count) : null,
              clear,
            ),
          ]),
      ...(view.pinned.length ? [section(labels.pinned, view.pinned, true)] : []),
      ...view.groups.map((g) => section(g.name, g.items, false, g)),
      ...(view.count ? [] : [h('p', { class: 'mh-notification-centre__empty' }, labels.empty)]),
    );
  };

  const restoreFocus = (): void => {
    if (refocusAt === null) return;
    const at = refocusAt;
    refocusAt = null;
    if (el.contains(document.activeElement) && document.activeElement !== el) return;
    const rows = [...el.querySelectorAll<HTMLElement>('.mh-notification')];
    const row = rows[Math.min(at, rows.length - 1)];
    (row?.querySelector<HTMLElement>('.mh-notification__dismiss, button') ?? el).focus();
  };

  render();
  return {
    el,
    update(changes) {
      o = { ...o, ...changes };
      render();
      restoreFocus();
    },
  };
}
