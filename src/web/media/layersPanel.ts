import { mdiChevronRight, mdiDragVertical, mdiEyeOffOutline, mdiEyeOutline, mdiFolderOpenOutline, mdiFolderOutline, mdiImageOutline, mdiLockOpenVariantOutline, mdiLockOutline } from '@mdi/js';
import { cx, h, uid } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';
import { iconButtonClass } from '../actions/iconButton.ts';

/** One layer. The first in a list is the front-most. A layer with `children` is a group. */
export interface LayerItem {
  id: string;
  name: string;
  /** Picture of the layer (a URL); groups and layers without one show `icon`. */
  thumbnail?: string | null;
  icon?: IconName | string;
  /** Default true. */
  visible?: boolean;
  locked?: boolean;
  children?: readonly LayerItem[];
  /** Groups only; default true. */
  expanded?: boolean;
}

export interface LayersPanelLabels {
  hint: string;
  move: (name: string) => string;
  moved: (name: string, position: number, count: number) => string;
  hide: (name: string) => string;
  lock: (name: string) => string;
  contents: (name: string) => string;
}

export const LAYERS_LABELS: LayersPanelLabels = {
  hint: 'Drag, or press the up and down arrow keys, to move the layer.',
  move: (name) => `Move ${name}`,
  moved: (name, position, count) => `${name} moved to position ${position} of ${count}`,
  hide: (name) => `Hide ${name}`,
  lock: (name) => `Lock ${name}`,
  contents: (name) => `${name} contents`,
};

export interface LayersPanelOptions {
  /** Accessible name of the list ("Layers"). */
  label: string;
  layers: readonly LayerItem[];
  selected?: string | null;
  labels?: Partial<LayersPanelLabels>;
  onSelect?: (id: string) => void;
  onVisibleChange?: (id: string, visible: boolean) => void;
  onLockedChange?: (id: string, locked: boolean) => void;
  onExpandedChange?: (id: string, expanded: boolean) => void;
  /** A layer moved within its parent (`null` for the top level) to `index`; `layers` is the new tree. */
  onReorder?: (id: string, parentId: string | null, index: number, layers: LayerItem[]) => void;
}

export interface LayersPanelHandle {
  el: HTMLDivElement;
  getLayers(): LayerItem[];
  setLayers(layers: readonly LayerItem[]): void;
  setSelected(id: string | null): void;
  destroy(): void;
}

// Tree helpers --------------------------------------------------------------------------------------------------

export interface LayerLocation {
  layer: LayerItem;
  parent: LayerItem | null;
  index: number;
  siblings: readonly LayerItem[];
}

/** Where a layer is in the tree, or null. */
export function findLayer(layers: readonly LayerItem[], id: string, parent: LayerItem | null = null): LayerLocation | null {
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i]!;
    if (layer.id === id) return { layer, parent, index: i, siblings: layers };
    if (layer.children) {
      const found = findLayer(layer.children, id, layer);
      if (found) return found;
    }
  }
  return null;
}

/** A copy of the tree with one layer changed. */
export function updateLayer(layers: readonly LayerItem[], id: string, patch: Partial<Omit<LayerItem, 'id'>>): LayerItem[] {
  return layers.map((l) => (l.id === id ? { ...l, ...patch } : l.children ? { ...l, children: updateLayer(l.children, id, patch) } : l));
}

/** A copy of the tree with a layer moved to `index` among its siblings (clamped). */
export function moveLayer(layers: readonly LayerItem[], id: string, index: number): LayerItem[] {
  const move = (list: readonly LayerItem[]): LayerItem[] | null => {
    const from = list.findIndex((l) => l.id === id);
    if (from >= 0) {
      const next = [...list];
      const [item] = next.splice(from, 1);
      next.splice(Math.max(0, Math.min(next.length, index)), 0, item!);
      return next;
    }
    for (let i = 0; i < list.length; i++) {
      const children = list[i]!.children;
      const moved = children ? move(children) : null;
      if (moved) {
        const next = [...list];
        next[i] = { ...list[i]!, children: moved };
        return next;
      }
    }
    return null;
  };
  return move(layers) ?? [...layers];
}

export function layerItemClass(layer: LayerItem, selected: boolean, hiddenByParent: boolean): string {
  return cx(
    'mh-layers__item',
    layer.children && 'mh-layers__item--group',
    selected && 'is-selected',
    layer.visible === false && 'is-hidden',
    hiddenByParent && 'is-hidden-by-parent',
    layer.locked && 'is-locked',
  );
}

export const layerToggleClass = (kind: 'visible' | 'lock'): string => cx(iconButtonClass('default', 'small'), 'mh-layers__toggle', `mh-layers__toggle--${kind}`);

/** The icon a layer shows without a thumbnail. */
export function layerIcon(layer: LayerItem, expanded = true): string {
  if (layer.icon) return layer.icon;
  return layer.children ? (expanded ? mdiFolderOpenOutline : mdiFolderOutline) : mdiImageOutline;
}

// Component -----------------------------------------------------------------------------------------------------

/** `mountLayersPanel` on a new `<div>`. */
export function createLayersPanel(options: LayersPanelOptions): LayersPanelHandle {
  return mountLayersPanel(h('div'), options);
}

/**
 * `.mh-layers`: a list of layers (`__list`, `__item` with `--group`, `.is-selected`, `.is-hidden`,
 * `.is-hidden-by-parent`, `.is-locked`), front-most first. Each `__row` (indented by `--_depth`) has a reorder grip
 * (`__grip`: drag it, or Up / Down on it), a group's expand button (`__expand`, `aria-expanded`), a thumbnail
 * (`__thumb`), the name (`__name`, `aria-pressed` when selected) and hide / lock toggles (`__toggle--visible |
 * --lock`, `aria-pressed`). Groups nest a `__list`. Moves are announced. Builds into `root`.
 */
export function mountLayersPanel(root: HTMLDivElement, options: LayersPanelOptions): LayersPanelHandle {
  const labels = { ...LAYERS_LABELS, ...options.labels };
  const hintId = uid('mh-layers-hint');
  let layers: LayerItem[] = [...options.layers];
  let selected = options.selected ?? null;
  const status = h('span', { class: 'mh-visually-hidden', role: 'status' });
  const hint = h('span', { class: 'mh-visually-hidden', id: hintId }, labels.hint);
  const list = h('ul', { class: 'mh-layers__list', 'aria-label': options.label });
  root.classList.add('mh-layers');
  root.replaceChildren(list, hint, status);

  const focus = (id: string, part: string): void => {
    const item = [...root.querySelectorAll<HTMLElement>('[data-layer]')].find((el) => el.dataset.layer === id);
    item?.querySelector<HTMLElement>(`:scope > .mh-layers__row > .mh-layers__${part}`)?.focus();
  };

  const reorder = (id: string, index: number, keepFocus: string | null): void => {
    const at = findLayer(layers, id);
    if (!at) return;
    const to = Math.max(0, Math.min(at.siblings.length - 1, index));
    if (to === at.index) return;
    layers = moveLayer(layers, id, to);
    render();
    if (keepFocus) focus(id, keepFocus);
    status.textContent = labels.moved(at.layer.name, to + 1, at.siblings.length);
    options.onReorder?.(id, at.parent?.id ?? null, to, layers);
  };

  const dragFrom = (grip: HTMLButtonElement, item: HTMLLIElement, id: string): void => {
    let pointer: number | null = null;
    const down = (e: PointerEvent): void => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      pointer = e.pointerId;
      try {
        grip.setPointerCapture(e.pointerId);
      } catch {
        // Capture is optional.
      }
      item.classList.add('is-dragging');
      e.preventDefault();
    };
    const move = (e: PointerEvent): void => {
      if (pointer !== e.pointerId) return;
      const parent = item.parentElement!;
      const siblings = [...parent.children].filter((c): c is HTMLLIElement => c !== item && c instanceof HTMLLIElement);
      const before = siblings.find((s) => {
        const r = s.querySelector(':scope > .mh-layers__row')!.getBoundingClientRect();
        return e.clientY < r.top + r.height / 2;
      });
      if (before) {
        if (item.nextElementSibling !== before) parent.insertBefore(item, before);
      } else if (parent.lastElementChild !== item) parent.append(item);
    };
    const up = (e: PointerEvent): void => {
      if (pointer !== e.pointerId) return;
      pointer = null;
      item.classList.remove('is-dragging');
      const index = [...item.parentElement!.children].indexOf(item);
      const at = findLayer(layers, id);
      if (at && index !== at.index) reorder(id, index, 'grip');
      else render();
    };
    grip.addEventListener('pointerdown', down);
    grip.addEventListener('pointermove', move);
    grip.addEventListener('pointerup', up);
    grip.addEventListener('pointercancel', up);
  };

  const itemEl = (layer: LayerItem, depth: number, hiddenByParent: boolean, index: number): HTMLLIElement => {
    const visible = layer.visible !== false;
    const expanded = layer.expanded !== false;
    const grip = h('button', { type: 'button', class: 'mh-layers__grip', 'aria-label': labels.move(layer.name), 'aria-describedby': hintId }, createIcon(mdiDragVertical));
    grip.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        reorder(layer.id, index + (e.key === 'ArrowUp' ? -1 : 1), 'grip');
      }
    });
    const expand = layer.children
      ? h('button', { type: 'button', class: 'mh-layers__expand', 'aria-expanded': String(expanded), 'aria-label': labels.contents(layer.name) }, createIcon(mdiChevronRight))
      : h('span', { class: 'mh-layers__expand-space', 'aria-hidden': 'true' });
    expand.addEventListener('click', () => {
      layers = updateLayer(layers, layer.id, { expanded: !expanded });
      render();
      focus(layer.id, 'expand');
      options.onExpandedChange?.(layer.id, !expanded);
    });
    const thumb = h('span', { class: cx('mh-layers__thumb', !layer.thumbnail && 'mh-layers__thumb--icon'), 'aria-hidden': 'true' }, layer.thumbnail ? h('img', { src: layer.thumbnail, alt: '', draggable: 'false' }) : createIcon(layerIcon(layer, expanded)));
    const name = h('button', { type: 'button', class: 'mh-layers__name', 'aria-pressed': String(selected === layer.id) }, h('span', { class: 'mh-layers__label' }, layer.name));
    name.addEventListener('click', () => {
      selected = layer.id;
      render();
      focus(layer.id, 'name');
      options.onSelect?.(layer.id);
    });
    const hide = h('button', { type: 'button', class: layerToggleClass('visible'), 'aria-label': labels.hide(layer.name), title: labels.hide(layer.name), 'aria-pressed': String(!visible) }, createIcon(visible ? mdiEyeOutline : mdiEyeOffOutline));
    hide.addEventListener('click', () => {
      layers = updateLayer(layers, layer.id, { visible: !visible });
      render();
      focus(layer.id, 'toggle--visible');
      options.onVisibleChange?.(layer.id, !visible);
    });
    const lock = h('button', { type: 'button', class: layerToggleClass('lock'), 'aria-label': labels.lock(layer.name), title: labels.lock(layer.name), 'aria-pressed': String(!!layer.locked) }, createIcon(layer.locked ? mdiLockOutline : mdiLockOpenVariantOutline));
    lock.addEventListener('click', () => {
      layers = updateLayer(layers, layer.id, { locked: !layer.locked });
      render();
      focus(layer.id, 'toggle--lock');
      options.onLockedChange?.(layer.id, !layer.locked);
    });
    const row = h('div', { class: 'mh-layers__row', style: `--_depth: ${depth}` }, grip, expand, thumb, name, hide, lock);
    const item = h('li', { class: layerItemClass(layer, selected === layer.id, hiddenByParent), 'data-layer': layer.id }, row);
    if (layer.children) {
      const sub = h('ul', { class: 'mh-layers__list' }, ...layer.children.map((c, i) => itemEl(c, depth + 1, hiddenByParent || !visible, i)));
      sub.hidden = !expanded;
      item.append(sub);
    }
    dragFrom(grip, item, layer.id);
    return item;
  };

  function render(): void {
    list.replaceChildren(...layers.map((l, i) => itemEl(l, 0, false, i)));
  }
  render();

  return {
    el: root,
    getLayers: () => layers,
    setLayers(next) {
      layers = [...next];
      render();
    },
    setSelected(id) {
      selected = id;
      render();
    },
    destroy() {
      list.replaceChildren();
    },
  };
}
