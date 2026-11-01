import { mdiCheck } from '@mdi/js';
import { append, cx, h } from '../../dom.ts';
import { createIcon, type IconName } from '../../icons.ts';
import { syncChildren } from '../children.ts';

export interface Scene {
  id: string;
  label: string;
  icon: IconName | string;
  /** A short line under the label ("Dim, warm"). */
  description?: string;
  disabled?: boolean;
}

/** Every visible or spoken word, for translation. */
export interface SceneGridLabels {
  /** Shown on the active tile. */
  active: string;
  /** Shown briefly after a tile is pressed. */
  applied: string;
  /** Announced after a tile is pressed: "Evening set". */
  announce(scene: string): string;
}

export const SCENE_GRID_LABELS: SceneGridLabels = { active: 'Active', applied: 'Set', announce: (scene) => `${scene} set` };

/** How long the applied state shows after a press, in ms. */
export const SCENE_APPLIED_MS = 1600;

export interface SceneGridOptions {
  /** Accessible name of the grid (default "Scenes"). */
  label?: string;
  scenes: readonly Scene[];
  /** The scene in effect now, marked with `aria-current`. */
  active?: string | null;
  /** Larger tiles in fewer columns (wall screens); default `regular`. */
  size?: 'compact' | 'regular' | 'large';
  labels?: Partial<SceneGridLabels>;
  /** How long the applied state shows, in ms. */
  appliedFor?: number;
  disabled?: boolean;
  /** A tile was pressed. */
  onActivate?: (id: string) => void;
}

export interface SceneGridHandle {
  el: HTMLDivElement;
  update(changes: Partial<SceneGridOptions>): void;
  /** Stops the applied timer. */
  destroy(): void;
}

export function sceneGridClass(o: Pick<SceneGridOptions, 'size' | 'disabled'>): string {
  return cx('mh-scene-grid', o.size && o.size !== 'regular' && `mh-scene-grid--${o.size}`, o.disabled && 'is-disabled');
}

export function sceneTileClass(active: boolean, applied: boolean): string {
  return cx('mh-scene-grid__tile', active && 'is-active', applied && 'is-applied');
}

/** The tag line of a tile: the applied word for a moment after a press, else the active word on the active tile. */
export function sceneTileTag(id: string, active: string | null | undefined, applied: string | null, l: SceneGridLabels): string {
  if (applied === id) return l.applied;
  if (active === id) return l.active;
  return '';
}

/**
 * `.mh-scene-grid`: a list of large `button.mh-scene-grid__tile`s (`__icon`, `__label`, `__description`, `__tag`).
 * The scene in effect has `aria-current="true"` and `.is-active`; after a press the tile shows `.is-applied`
 * with a check for `appliedFor` ms and a polite announcement. Sizes `--compact | --large`.
 */
export function createSceneGrid(options: SceneGridOptions): SceneGridHandle {
  let o: SceneGridOptions = { ...options };
  const list = h('ul', { class: 'mh-scene-grid__list', role: 'list' });
  const live = h('span', { class: 'mh-visually-hidden', 'aria-live': 'polite' });
  const el = h('div', {}, list, live);
  const items = new Map<string, { li: HTMLLIElement; button: HTMLButtonElement }>();
  let applied: string | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const press = (id: string): void => {
    const scene = o.scenes.find((s) => s.id === id);
    if (!scene || scene.disabled || o.disabled) return;
    const l = { ...SCENE_GRID_LABELS, ...o.labels };
    applied = id;
    live.textContent = l.announce(scene.label);
    clearTimeout(timer);
    timer = setTimeout(() => {
      applied = null;
      render();
    }, o.appliedFor ?? SCENE_APPLIED_MS);
    render();
    o.onActivate?.(id);
  };

  const render = (): void => {
    const l = { ...SCENE_GRID_LABELS, ...o.labels };
    el.className = sceneGridClass(o);
    el.setAttribute('role', 'group');
    el.setAttribute('aria-label', o.label ?? 'Scenes');
    for (const [id, item] of items) {
      if (o.scenes.some((s) => s.id === id)) continue;
      items.delete(id);
      item.li.remove();
    }
    const lis = o.scenes.map((s) => {
      let item = items.get(s.id);
      if (!item) {
        const button = h('button', { type: 'button', onclick: (() => press(s.id)) as EventListener });
        item = { li: h('li', { class: 'mh-scene-grid__item' }, button), button };
        items.set(s.id, item);
      }
      const isActive = o.active === s.id;
      const tag = sceneTileTag(s.id, o.active, applied, l);
      const b = item.button;
      b.className = sceneTileClass(isActive, applied === s.id);
      if (isActive) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
      b.disabled = !!(s.disabled || o.disabled);
      b.replaceChildren();
      append(
        b,
        h('span', { class: 'mh-scene-grid__icon' }, createIcon(applied === s.id ? mdiCheck : s.icon)),
        h('span', { class: 'mh-scene-grid__text' }, h('span', { class: 'mh-scene-grid__label' }, s.label), s.description ? h('span', { class: 'mh-scene-grid__description' }, s.description) : null),
        tag ? h('span', { class: 'mh-scene-grid__tag', 'aria-hidden': 'true' }, tag) : null,
      );
      return item.li;
    });
    syncChildren(list, lis);
  };
  render();

  return {
    el,
    update(changes) {
      o = { ...o, ...changes };
      render();
    },
    destroy() {
      clearTimeout(timer);
    },
  };
}
