import { cx, h } from '../dom.ts';
import { createSpinner } from '../feedback/spinner.ts';
import { createIcon, type IconName } from '../icons.ts';
import { syncChildren } from './children.ts';

/** The lit look of an active badge: the accent, a lit light (`warm`), heating or cooling. */
export type ControlCardTone = 'accent' | 'warm' | 'heat' | 'cool';

export interface ControlCardOptions {
  /** The thing's name; wraps, never cut short. Also the card's accessible name. */
  title: string;
  /** Leading icon: a short name or a raw MDI path. */
  icon: IconName | string;
  /** The state line ("On · 80%", "21.5 °C"), shown as given. */
  state?: string;
  /** The badge takes the lit look. */
  active?: boolean;
  /** Colour of the lit look (default `accent`). `warm`, `heat` and `cool` use the home colours when present. */
  tone?: ControlCardTone;
  /** Trailing control beside the title (a switch, a button). */
  control?: HTMLElement | null;
  /** On top, edge to edge (an image). */
  media?: HTMLElement | null;
  /** Below the header (sliders, rows). */
  body?: HTMLElement | null;
  /** Waiting for the thing: dimmed, with a spinner in place of the control. */
  loading?: boolean;
  /** Spoken while loading (default "Updating"). */
  loadingLabel?: string;
  /** The thing can't be reached: muted, and the controls in the control and body slots are disabled. */
  unavailable?: boolean;
  /** Makes the header (badge, title, state) a button that opens more controls. */
  onOpen?: (event: MouseEvent) => void;
}

export interface ControlCardHandle {
  el: HTMLDivElement;
  /** Applies changed options; omitted ones keep their value (`null` clears a slot). */
  update(changes: Partial<ControlCardOptions>): void;
}

/** CSS classes of a control card root. */
export function controlCardClass(o: Pick<ControlCardOptions, 'active' | 'tone' | 'loading' | 'unavailable'> & { pressable?: boolean }): string {
  return cx(
    'mh-control-card',
    o.tone && o.tone !== 'accent' && `mh-control-card--${o.tone}`,
    o.pressable && 'mh-control-card--pressable',
    o.active && 'is-active',
    o.loading && 'is-loading',
    o.unavailable && 'is-unavailable',
  );
}

/**
 * `.mh-control-card`: the frame for one controllable thing. `__media` on top, then `__header` with `__main`
 * (`__badge` icon, `__text` with `__title` and `__state`) and the trailing `__control`, then `__body`. With
 * `onOpen`, `__main` is a `<button>` and the trailing control stays its sibling, so no interactive element sits
 * inside another. The control and body slots are `<fieldset>`s, so `unavailable` disables every native control
 * in them. Modifiers `--warm | --heat | --cool`, `--pressable`; states `.is-active`, `.is-loading`,
 * `.is-unavailable`.
 */
export function createControlCard(options: ControlCardOptions): ControlCardHandle {
  let o: ControlCardOptions = { ...options };
  const el = h('div', { role: 'group' });
  const badge = h('span', { class: 'mh-control-card__badge' });
  const title = h('span', { class: 'mh-control-card__title' });
  const state = h('span', { class: 'mh-control-card__state' });
  const text = h('span', { class: 'mh-control-card__text' }, title);
  const header = h('div', { class: 'mh-control-card__header' });
  const control = h('fieldset', { class: 'mh-control-card__control' });
  const body = h('fieldset', { class: 'mh-control-card__body' });
  const mediaBox = h('div', { class: 'mh-control-card__media' });
  let main: HTMLElement | null = null;
  let icon: string | undefined;
  let spinner: HTMLElement | null = null;

  const open = (event: MouseEvent): void => o.onOpen?.(event);

  const render = (): void => {
    el.className = controlCardClass({ ...o, pressable: !!o.onOpen });
    el.setAttribute('aria-label', o.title);
    if (o.loading) el.setAttribute('aria-busy', 'true');
    else el.removeAttribute('aria-busy');
    if (icon !== o.icon) {
      icon = o.icon;
      badge.replaceChildren(createIcon(o.icon));
    }
    title.textContent = o.title;
    state.textContent = o.state ?? '';
    if (o.state) text.append(state);
    else state.remove();

    const wantButton = !!o.onOpen;
    if (!main || (main.tagName === 'BUTTON') !== wantButton) {
      const next = wantButton ? h('button', { type: 'button', class: 'mh-control-card__main', onclick: open as EventListener }) : h('div', { class: 'mh-control-card__main' });
      next.append(badge, text);
      if (main) main.replaceWith(next);
      main = next;
    }

    if (o.loading) {
      const label = o.loadingLabel ?? 'Updating';
      if (!spinner || spinner.textContent !== label) spinner = createSpinner({ size: 'small', label }).el;
    }
    const slot = o.loading ? spinner : (o.control ?? null);
    syncChildren(control, slot ? [slot] : []);
    control.disabled = !!o.unavailable;
    body.disabled = !!o.unavailable;
    syncChildren(body, o.body ? [o.body] : []);
    syncChildren(mediaBox, o.media ? [o.media] : []);
    syncChildren(header, slot ? [main, control] : [main]);
    syncChildren(el, [...(o.media ? [mediaBox] : []), header, ...(o.body ? [body] : [])]);
  };
  render();

  return {
    el,
    update(changes) {
      o = { ...o, ...changes };
      render();
    },
  };
}
