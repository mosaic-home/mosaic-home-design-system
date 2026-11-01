import { mdiChevronDown } from '@mdi/js';
import { append, cx, h, uid, type Child } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';

export type AccordionVariant = 'plain' | 'separated';

export interface AccordionSection {
  id: string;
  title: string;
  /** A muted second line under the title ("3 devices"). */
  subtitle?: string;
  icon?: IconName | string;
  /** Short text or a count at the end of the header row. */
  meta?: string;
  disabled?: boolean;
  content?: Child | Child[];
}

export interface AccordionOptions {
  sections: readonly AccordionSection[];
  /** Ids open at the start. In `single` mode only the first is used. */
  open?: readonly string[];
  /** `single`: opening one closes the others. Default `multiple`. */
  mode?: 'single' | 'multiple';
  /** In `single` mode, the open section can't be closed by pressing it again. */
  required?: boolean;
  /** `plain` (default): one panel with dividers. `separated`: each section is its own card. */
  variant?: AccordionVariant;
  /** Heading level of the section headers; default 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  onChange?: (open: string[]) => void;
}

export interface AccordionHandle {
  el: HTMLElement;
  open(): string[];
  setOpen(ids: readonly string[]): void;
  toggle(id: string, open?: boolean): void;
}

export function accordionClass(variant: AccordionVariant = 'plain'): string {
  return cx('mh-accordion', `mh-accordion--${variant}`);
}

/**
 * The open ids after pressing `id`. `single` keeps at most one open (and with `required` never none); `multiple`
 * toggles just that one. Shared with the React binding.
 */
export function accordionNext(open: readonly string[], id: string, mode: 'single' | 'multiple' = 'multiple', required = false, force?: boolean): string[] {
  const isOpen = open.includes(id);
  const want = force ?? !isOpen;
  if (mode === 'single') {
    if (want) return [id];
    return required && isOpen ? [id] : open.filter((x) => x !== id);
  }
  if (want) return isOpen ? [...open] : [...open, id];
  return open.filter((x) => x !== id);
}

/** The initial open ids for the mode: unknown ids dropped, at most one in `single`, one forced with `required`. */
export function accordionInitial(sections: readonly Pick<AccordionSection, 'id' | 'disabled'>[], open: readonly string[] = [], mode: 'single' | 'multiple' = 'multiple', required = false): string[] {
  const known = open.filter((id) => sections.some((s) => s.id === id));
  if (mode === 'multiple') return known;
  if (known.length > 0) return [known[0]!];
  const first = sections.find((s) => !s.disabled);
  return required && first ? [first.id] : [];
}

/** The trigger a key moves focus to (Up / Down wrap, Home, End), skipping disabled sections; null for other keys. */
export function accordionKeyTarget(sections: readonly Pick<AccordionSection, 'disabled'>[], from: number, key: string): number | null {
  const enabled = sections.map((s, i) => (s.disabled ? -1 : i)).filter((i) => i >= 0);
  const at = enabled.indexOf(from);
  if (at < 0) return null;
  switch (key) {
    case 'ArrowDown':
      return enabled[(at + 1) % enabled.length]!;
    case 'ArrowUp':
      return enabled[(at - 1 + enabled.length) % enabled.length]!;
    case 'Home':
      return enabled[0]!;
    case 'End':
      return enabled[enabled.length - 1]!;
    default:
      return null;
  }
}

/**
 * `.mh-accordion` (`--plain | --separated`): `.mh-accordion__item`s, each a heading holding a
 * `button.mh-accordion__trigger` (`aria-expanded`, `aria-controls`; `__icon`, `__title`, `__subtitle`, `__meta`,
 * `__chevron`) and a `.mh-accordion__panel` (`role="region"`, `hidden` when closed). Up and Down, Home and End
 * move between headers; Enter and Space toggle.
 */
export function createAccordion(options: AccordionOptions): AccordionHandle {
  const mode = options.mode ?? 'multiple';
  const required = options.required ?? false;
  const base = uid('mh-accordion');
  const el = h('div', { class: accordionClass(options.variant) });
  let open = accordionInitial(options.sections, options.open, mode, required);
  const triggers: HTMLButtonElement[] = [];
  const items: HTMLElement[] = [];
  const panels: HTMLElement[] = [];

  options.sections.forEach((section, i) => {
    const triggerId = `${base}-trigger-${i}`;
    const panelId = `${base}-panel-${i}`;
    const trigger = h(
      'button',
      { type: 'button', class: 'mh-accordion__trigger', id: triggerId, 'aria-controls': panelId, disabled: section.disabled ?? false },
      section.icon ? h('span', { class: 'mh-accordion__icon' }, createIcon(section.icon)) : null,
      h(
        'span',
        { class: 'mh-accordion__text' },
        h('span', { class: 'mh-accordion__title' }, section.title),
        section.subtitle ? h('span', { class: 'mh-accordion__subtitle' }, section.subtitle) : null,
      ),
      section.meta ? h('span', { class: 'mh-accordion__meta' }, section.meta) : null,
      createIcon(mdiChevronDown, { class: 'mh-accordion__chevron' }),
    );
    trigger.addEventListener('click', () => set(accordionNext(open, section.id, mode, required), true));
    const panel = h('div', { class: 'mh-accordion__panel', id: panelId, role: 'region', 'aria-labelledby': triggerId });
    const inner = h('div', { class: 'mh-accordion__content' });
    append(inner, ...(Array.isArray(section.content) ? section.content : [section.content]));
    panel.append(inner);
    const item = h('div', { class: 'mh-accordion__item' }, h(`h${options.headingLevel ?? 3}` as 'h3', { class: 'mh-accordion__heading' }, trigger), panel);
    triggers.push(trigger);
    panels.push(panel);
    items.push(item);
    el.append(item);
  });

  el.addEventListener('keydown', (e) => {
    const from = triggers.indexOf(e.target as HTMLButtonElement);
    if (from < 0) return;
    const to = accordionKeyTarget(options.sections, from, e.key);
    if (to === null) return;
    e.preventDefault();
    triggers[to]!.focus();
  });

  function sync(): void {
    options.sections.forEach((section, i) => {
      const on = open.includes(section.id);
      triggers[i]!.setAttribute('aria-expanded', String(on));
      // A required single section can't be closed: say so instead of offering a dead button.
      if (mode === 'single' && required && on) triggers[i]!.setAttribute('aria-disabled', 'true');
      else triggers[i]!.removeAttribute('aria-disabled');
      panels[i]!.hidden = !on;
      items[i]!.classList.toggle('is-open', on);
    });
  }

  function set(next: string[], notify: boolean): void {
    const same = next.length === open.length && next.every((id) => open.includes(id));
    open = next;
    sync();
    if (notify && !same) options.onChange?.([...open]);
  }

  sync();
  return {
    el,
    open: () => [...open],
    setOpen: (ids) => set(accordionInitial(options.sections, ids, mode, required), false),
    toggle: (id, force) => set(accordionNext(open, id, mode, required, force), false),
  };
}
