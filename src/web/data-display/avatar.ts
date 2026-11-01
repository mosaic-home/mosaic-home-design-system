import { cx, h } from '../dom.ts';

export type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

export interface AvatarOptions {
  /** Accessible name; initials are taken from it. */
  name: string;
  /** Image URL; initials show while it loads and if it fails. */
  src?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  /** Override the initials ("LR"). */
  initials?: string;
}

export interface AvatarHandle {
  el: HTMLSpanElement;
  setStatus(status: AvatarStatus | null): void;
}

/** Up to two initials: first and last word ("Living room" -> "LR"). */
export function avatarInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = words[0]!;
  const last = words.length > 1 ? words[words.length - 1]! : '';
  return (Array.from(first)[0]! + (last ? Array.from(last)[0]! : '')).toUpperCase();
}

/** A stable series colour (1..6) for a name, so the same name always gets the same colour. */
export function avatarTone(name: string): number {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.codePointAt(0)!) >>> 0;
  return (hash % 6) + 1;
}

const SIZE_CLASS: Record<AvatarSize, string | false> = { small: 'sm', medium: false, large: 'lg', xlarge: 'xl' };

export function avatarClass(name: string, size: AvatarSize = 'medium'): string {
  const s = SIZE_CLASS[size];
  return cx('mh-avatar', s && `mh-avatar--${s}`, `mh-avatar--tone-${avatarTone(name)}`);
}

const STATUS_TEXT: Record<AvatarStatus, string> = { online: 'online', offline: 'offline', busy: 'busy', away: 'away' };

/** The avatar's accessible name: its name, plus its status. */
export function avatarLabel(name: string, status?: AvatarStatus | null): string {
  return status ? `${name}, ${STATUS_TEXT[status]}` : name;
}

/**
 * `.mh-avatar`: initials on a series colour, or an image (`__image` over `__initials`), in sizes `--sm | --lg | --xl`,
 * with an optional `__status` dot. `role="img"` named by `name`.
 */
export function createAvatar(options: AvatarOptions): AvatarHandle {
  const el = h('span', { class: avatarClass(options.name, options.size), role: 'img' }, h('span', { class: 'mh-avatar__initials', 'aria-hidden': 'true' }, options.initials ?? avatarInitials(options.name)));
  if (options.src) {
    const img = h('img', { class: 'mh-avatar__image', src: options.src, alt: '' });
    img.addEventListener('error', () => (img.hidden = true));
    el.append(img);
  }
  let dot: HTMLSpanElement | null = null;
  const setStatus = (status: AvatarStatus | null): void => {
    el.setAttribute('aria-label', avatarLabel(options.name, status));
    if (!status) {
      dot?.remove();
      dot = null;
      return;
    }
    dot ??= el.appendChild(h('span', { 'aria-hidden': 'true' }));
    dot.className = `mh-avatar__status mh-avatar__status--${status}`;
  };
  setStatus(options.status ?? null);
  return { el, setStatus };
}

export interface AvatarGroupOptions {
  avatars: AvatarOptions[];
  /** Show at most this many; the rest become "+N". */
  max?: number;
  size?: AvatarSize;
  label?: string;
}

export function avatarMoreClass(size: AvatarSize = 'medium'): string {
  const s = SIZE_CLASS[size];
  return cx('mh-avatar', s && `mh-avatar--${s}`, 'mh-avatar--more');
}

/** `.mh-avatar-group`: overlapping avatars with a "+N" for the rest. */
export function createAvatarGroup(options: AvatarGroupOptions): { el: HTMLDivElement } {
  const max = options.max ?? options.avatars.length;
  const shown = options.avatars.slice(0, max);
  const rest = options.avatars.length - shown.length;
  const el = h(
    'div',
    { class: 'mh-avatar-group', role: 'group', 'aria-label': options.label },
    ...shown.map((a) => createAvatar({ ...a, size: options.size }).el),
    rest > 0 ? h('span', { class: avatarMoreClass(options.size), role: 'img', 'aria-label': `${rest} more` }, h('span', { class: 'mh-avatar__initials', 'aria-hidden': 'true' }, `+${rest}`)) : null,
  );
  return { el };
}
