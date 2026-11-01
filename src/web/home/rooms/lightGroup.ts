import { mdiChevronDown, mdiLightbulbGroupOutline } from '@mdi/js';
import { createSwitch, type SwitchHandle } from '../../choice-inputs/switch.ts';
import { cx, h, uid } from '../../dom.ts';
import { createIcon, type IconName } from '../../icons.ts';
import { syncChildren } from '../children.ts';
import { createControlCard } from '../controlCard.ts';
import { createHomeSlider, type HomeSliderHandle } from '../homeSlider.ts';
import { createLightControl, formatBrightness, type LightControlHandle } from '../lightControl.ts';

export interface LightGroupMember {
  id: string;
  name: string;
  on: boolean;
  /** 0 to 100 when the light dims; no slider when null. */
  brightness?: number | null;
  /** Can't be reached: shown, but its controls are disabled. */
  unavailable?: boolean;
}

/** Every visible word, for translation. */
export interface LightGroupLabels {
  /** The state line: "2 of 4 on · 60%". `brightness` is null when no light that is on dims. */
  summary(on: number, total: number, brightness: number | null): string;
  /** The master switch's accessible name: "All lights in Kitchen". */
  all(group: string): string;
  brightness: string;
  /** The expander: "Show 4 lights". */
  show(count: number): string;
  hide: string;
}

export const LIGHT_GROUP_LABELS: LightGroupLabels = {
  summary: (on, total, brightness) => {
    const head = on === 0 ? 'All off' : on === total ? 'All on' : `${on} of ${total} on`;
    return brightness === null || on === 0 ? head : `${head} · ${formatBrightness(brightness)}`;
  },
  all: (group) => `All lights in ${group}`,
  brightness: 'Brightness',
  show: (count) => `Show ${count} ${count === 1 ? 'light' : 'lights'}`,
  hide: 'Hide lights',
};

export interface LightGroupOptions {
  /** The group's name ("Kitchen"); also the card's accessible name. */
  name: string;
  icon?: IconName | string;
  members: readonly LightGroupMember[];
  /** Show each member (default false); the expander changes it. */
  expanded?: boolean;
  labels?: Partial<LightGroupLabels>;
  unavailable?: boolean;
  /** The master switch: every member on or off. */
  onToggle?: (on: boolean) => void;
  /** The master brightness, sent on release: every dimmable member to this level. */
  onBrightness?: (value: number) => void;
  onMemberToggle?: (id: string, on: boolean) => void;
  onMemberBrightness?: (id: string, value: number) => void;
  onExpandedChange?: (expanded: boolean) => void;
}

export interface LightGroupHandle {
  el: HTMLDivElement;
  update(changes: Partial<LightGroupOptions>): void;
  /** Sends dragged values that were never released. */
  destroy(): void;
}

/** What the group shows as a whole. */
export interface LightGroupState {
  on: number;
  total: number;
  /** The average brightness of the members that are on and dim, rounded; null when there are none. */
  brightness: number | null;
  /** Some member dims (the master slider is shown). */
  dims: boolean;
}

export function lightGroupState(members: readonly LightGroupMember[]): LightGroupState {
  const available = members.filter((m) => !m.unavailable);
  const lit = available.filter((m) => m.on);
  const levels = lit.map((m) => m.brightness).filter((b): b is number => typeof b === 'number');
  return {
    on: lit.length,
    total: members.length,
    brightness: levels.length ? Math.round(levels.reduce((a, b) => a + b, 0) / levels.length) : null,
    dims: available.some((m) => typeof m.brightness === 'number'),
  };
}

export const LIGHT_GROUP_ICON = mdiLightbulbGroupOutline;
export const LIGHT_GROUP_SLIDER_CLASS = 'mh-light-control__slider mh-light-control__slider--brightness mh-light-group__level';

export function lightGroupClass(o: { on: boolean; expanded: boolean }): string {
  return cx('mh-light-group', o.on && 'is-on', o.expanded && 'is-expanded');
}

/**
 * `.mh-light-group` (on a lit `.mh-control-card` frame, states `.is-on`, `.is-expanded`): a master switch in the trailing slot (on while any member is
 * on; switching it sets every member), a master brightness slider (`__level`, the average of the lights that are on),
 * and a disclosure button (`__expand`, `aria-expanded`) that shows `__members`, one `.mh-light-control` per light.
 */
export function createLightGroup(options: LightGroupOptions): LightGroupHandle {
  let o: LightGroupOptions = { ...options };
  let expanded = !!o.expanded;
  const listId = uid('mh-light-group');
  const master: SwitchHandle = createSwitch({ ariaLabel: '', onChange: (on) => o.onToggle?.(on) });
  const expandLabel = h('span', { class: 'mh-light-group__expand-label' });
  const expand = h(
    'button',
    {
      type: 'button',
      class: 'mh-light-group__expand',
      'aria-controls': listId,
      onclick: (() => {
        expanded = !expanded;
        render();
        o.onExpandedChange?.(expanded);
      }) as EventListener,
    },
    expandLabel,
    createIcon(mdiChevronDown, { class: 'mh-light-group__chevron' }),
  );
  const list = h('ul', { class: 'mh-light-group__members', id: listId });
  const body = h('div', { class: 'mh-light-group__body' });
  const rows = new Map<string, { li: HTMLLIElement; light: LightControlHandle }>();
  let level: HomeSliderHandle | null = null;
  let levelLabel = '';
  const card = createControlCard({ title: o.name, icon: o.icon ?? LIGHT_GROUP_ICON, control: master.el });

  const render = (): void => {
    const l = { ...LIGHT_GROUP_LABELS, ...o.labels };
    const s = lightGroupState(o.members);
    master.input.setAttribute('aria-label', l.all(o.name));
    master.setChecked(s.on > 0);
    master.setDisabled(!!o.unavailable || s.total === 0);

    const parts: HTMLElement[] = [];
    if (s.dims) {
      if (!level || levelLabel !== l.brightness) {
        level?.dispose();
        levelLabel = l.brightness;
        level = createHomeSlider({ label: l.brightness, className: LIGHT_GROUP_SLIDER_CLASS, value: 0, min: 0, max: 100, format: formatBrightness, onCommit: (v) => o.onBrightness?.(v) });
      }
      level.set({ value: s.brightness ?? 0, min: 0, max: 100, disabled: !!o.unavailable });
      parts.push(level.el);
    } else if (level) {
      level.dispose();
      level = null;
    }

    if (o.members.length) {
      expand.setAttribute('aria-expanded', String(expanded));
      expandLabel.textContent = expanded ? l.hide : l.show(o.members.length);
      parts.push(expand);
      for (const [id, row] of rows) {
        if (o.members.some((m) => m.id === id)) continue;
        row.light.destroy();
        row.li.remove();
        rows.delete(id);
      }
      const lis = o.members.map((m) => {
        const changes = {
          label: m.name,
          on: m.on,
          brightness: typeof m.brightness === 'number' ? m.brightness : null,
          disabled: !!(m.unavailable || o.unavailable),
          labels: { power: m.name, brightness: l.brightness },
        };
        let row = rows.get(m.id);
        if (!row) {
          const light = createLightControl({ ...changes, onToggle: (on) => o.onMemberToggle?.(m.id, on), onBrightness: (v) => o.onMemberBrightness?.(m.id, v) });
          row = { li: h('li', { class: 'mh-light-group__member' }, light.el), light };
          rows.set(m.id, row);
        } else row.light.update(changes);
        row.li.classList.toggle('is-unavailable', !!m.unavailable);
        return row.li;
      });
      syncChildren(list, lis);
      list.hidden = !expanded;
      parts.push(list);
    }
    syncChildren(body, parts);

    card.update({
      title: o.name,
      icon: o.icon ?? LIGHT_GROUP_ICON,
      state: l.summary(s.on, s.total, s.brightness),
      active: s.on > 0,
      tone: 'warm',
      unavailable: o.unavailable,
      body: parts.length ? body : null,
    });
    card.el.classList.add(...lightGroupClass({ on: s.on > 0, expanded }).split(' '));
  };
  render();

  return {
    el: card.el,
    update(changes) {
      if (changes.expanded !== undefined) expanded = changes.expanded;
      o = { ...o, ...changes };
      render();
    },
    destroy() {
      level?.dispose();
      for (const row of rows.values()) row.light.destroy();
    },
  };
}
