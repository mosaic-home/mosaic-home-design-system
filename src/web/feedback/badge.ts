import { cx, h } from '../dom.ts';

export type BadgeTone = 'neutral' | 'accent' | 'info' | 'success' | 'warning' | 'danger';

export interface BadgeOptions {
  /** Text label ("Beta", "New"). For a dot, its accessible name. */
  label?: string;
  /** A count; shown as `max+` above `max`. Ignored when `label` is set. */
  count?: number;
  max?: number;
  /** Default: `danger` for counts and dots, `neutral` for labels. */
  tone?: BadgeTone;
  /** A small dot with no text. */
  dot?: boolean;
  /** Pinned to the top end corner of a `.mh-badge-host` parent (icon buttons, avatars). */
  attached?: boolean;
  /** Accessible text when the visible text alone isn't enough ("3 unread"). */
  ariaLabel?: string;
}

export interface BadgeHandle {
  el: HTMLSpanElement;
  /** Updates the count; zero hides the badge. */
  setCount(count: number): void;
  setLabel(label: string): void;
}

/** "99+" above `max`. */
export function badgeCountText(count: number, max = 99): string {
  return count > max ? `${max}+` : String(Math.max(0, Math.floor(count)));
}

export function badgeTone(options: Pick<BadgeOptions, 'tone' | 'dot' | 'count' | 'label'>): BadgeTone {
  return options.tone ?? (options.dot || (options.count !== undefined && options.label === undefined) ? 'danger' : 'neutral');
}

export function badgeClass(tone: BadgeTone = 'neutral', dot = false, attached = false): string {
  return cx('mh-badge', `mh-badge--${tone}`, dot && 'mh-badge--dot', attached && 'mh-badge--attached');
}

/** The visible text of a badge (empty for a dot). */
export function badgeText(options: Pick<BadgeOptions, 'dot' | 'count' | 'label' | 'max'>): string {
  if (options.dot) return '';
  return options.label ?? (options.count !== undefined ? badgeCountText(options.count, options.max) : '');
}

/** `.mh-badge--<tone>`: a small label, count or dot (`--dot`, `role="img"` named by its label). */
export function createBadge(options: BadgeOptions = {}): BadgeHandle {
  const max = options.max ?? 99;
  const el = h('span', { class: badgeClass(badgeTone(options), options.dot, options.attached) }, badgeText(options));
  if (options.dot) {
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', options.ariaLabel ?? options.label ?? 'New');
  } else if (options.ariaLabel) {
    el.setAttribute('aria-label', options.ariaLabel);
  }
  if (options.count !== undefined && options.count <= 0 && options.label === undefined) el.hidden = true;
  return {
    el,
    setCount(count) {
      if (!options.dot) el.textContent = badgeCountText(count, max);
      el.hidden = count <= 0;
    },
    setLabel(label) {
      if (options.dot) el.setAttribute('aria-label', label);
      else el.textContent = label;
    },
  };
}
