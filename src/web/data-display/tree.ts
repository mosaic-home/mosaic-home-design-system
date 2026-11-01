import { mdiCheck, mdiChevronRight, mdiMinus } from '@mdi/js';
import { cx, h } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';

export interface TreeNode {
  id: string;
  label: string;
  icon?: IconName | string;
  /** Short text at the end of the row ("4 devices", "On"). */
  meta?: string;
  disabled?: boolean;
  children?: readonly TreeNode[];
}

export type TreeCheckState = 'true' | 'false' | 'mixed';

export interface TreeOptions {
  nodes: readonly TreeNode[];
  /** Accessible name of the tree. */
  label?: string;
  /** Ids of the expanded parents at the start. */
  expanded?: readonly string[];
  /** Single selection (when not `checkable`). */
  selected?: string | null;
  /** Shows a checkbox per item: checking a parent checks everything under it, a partly checked parent is mixed. */
  checkable?: boolean;
  /** Checked ids at the start; a parent id stands for all its leaves. */
  checked?: readonly string[];
  /** Tighter rows. */
  dense?: boolean;
  onSelect?: (id: string) => void;
  onExpandedChange?: (expanded: string[]) => void;
  /** Called with the checked leaf ids. */
  onCheckedChange?: (checked: string[]) => void;
}

export interface TreeHandle {
  el: HTMLUListElement;
  expanded(): string[];
  setExpanded(ids: readonly string[]): void;
  selected(): string | null;
  setSelected(id: string | null): void;
  checked(): string[];
  setChecked(ids: readonly string[]): void;
}

export interface TreeRow {
  node: TreeNode;
  level: number;
  parent: string | null;
  posinset: number;
  setsize: number;
}

const hasChildren = (n: TreeNode): boolean => (n.children?.length ?? 0) > 0;

export function treeClass(checkable = false, dense = false): string {
  return cx('mh-tree', checkable && 'mh-tree--checkable', dense && 'mh-tree--dense');
}

/** The visible rows in order: every root, and the children of expanded parents. */
export function treeRows(nodes: readonly TreeNode[], expanded: readonly string[], level = 1, parent: string | null = null): TreeRow[] {
  const out: TreeRow[] = [];
  nodes.forEach((node, i) => {
    out.push({ node, level, parent, posinset: i + 1, setsize: nodes.length });
    if (hasChildren(node) && expanded.includes(node.id)) out.push(...treeRows(node.children!, expanded, level + 1, node.id));
  });
  return out;
}

export function treeFind(nodes: readonly TreeNode[], id: string): TreeNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = n.children ? treeFind(n.children, id) : null;
    if (found) return found;
  }
  return null;
}

/** Leaf ids under a node (the node itself when it is a leaf), skipping disabled ones. */
export function treeLeaves(node: TreeNode): string[] {
  if (node.disabled) return [];
  if (!hasChildren(node)) return [node.id];
  return node.children!.flatMap(treeLeaves);
}

/** Checked ids as leaves: a parent id expands to its enabled leaves; unknown ids are dropped. */
export function treeNormalizeChecked(nodes: readonly TreeNode[], ids: readonly string[]): string[] {
  const out = new Set<string>();
  for (const id of ids) {
    const node = treeFind(nodes, id);
    if (node) for (const leaf of treeLeaves(node)) out.add(leaf);
  }
  return [...out];
}

/** `true` when every enabled leaf under the node is checked, `mixed` when some are. */
export function treeCheckState(node: TreeNode, checked: readonly string[]): TreeCheckState {
  const leaves = treeLeaves(node);
  if (leaves.length === 0) return checked.includes(node.id) ? 'true' : 'false';
  const n = leaves.filter((id) => checked.includes(id)).length;
  return n === 0 ? 'false' : n === leaves.length ? 'true' : 'mixed';
}

/** Checked leaves after pressing a node's checkbox: a checked node unchecks everything under it, otherwise checks it. */
export function treeToggleChecked(nodes: readonly TreeNode[], id: string, checked: readonly string[]): string[] {
  const node = treeFind(nodes, id);
  if (!node || node.disabled) return [...checked];
  const leaves = treeLeaves(node);
  if (treeCheckState(node, checked) === 'true') return checked.filter((x) => !leaves.includes(x));
  return [...new Set([...checked, ...leaves])];
}

export interface TreeKeyResult {
  /** Move focus to this id. */
  focus?: string;
  /** The new expanded ids. */
  expanded?: string[];
  /** Enter or Space on the focused item: select it, or toggle its checkbox. */
  activate?: boolean;
}

/**
 * What a key does on the focused row (the tree view keyboard pattern): Up / Down move, Right expands or enters,
 * Left collapses or goes to the parent, Home / End, `*` expands the siblings, Enter / Space activate, a letter jumps
 * to the next row starting with it. Null for other keys.
 */
export function treeKeyAction(rows: readonly TreeRow[], focusId: string, key: string, expanded: readonly string[]): TreeKeyResult | null {
  const at = rows.findIndex((r) => r.node.id === focusId);
  if (at < 0) return null;
  const row = rows[at]!;
  const parent = hasChildren(row.node);
  const open = expanded.includes(focusId);
  switch (key) {
    case 'ArrowDown':
      return at < rows.length - 1 ? { focus: rows[at + 1]!.node.id } : {};
    case 'ArrowUp':
      return at > 0 ? { focus: rows[at - 1]!.node.id } : {};
    case 'Home':
      return { focus: rows[0]!.node.id };
    case 'End':
      return { focus: rows[rows.length - 1]!.node.id };
    case 'ArrowRight':
      if (!parent) return {};
      return open ? { focus: row.node.children![0]!.id } : { expanded: [...expanded, focusId] };
    case 'ArrowLeft':
      if (parent && open) return { expanded: expanded.filter((x) => x !== focusId) };
      return row.parent ? { focus: row.parent } : {};
    case '*': {
      const siblings = rows.filter((r) => r.parent === row.parent && hasChildren(r.node)).map((r) => r.node.id);
      return { expanded: [...new Set([...expanded, ...siblings])] };
    }
    case 'Enter':
    case ' ':
      return { activate: true };
    default: {
      if (key.length !== 1 || !/\S/.test(key)) return null;
      const k = key.toLocaleLowerCase();
      for (let i = 1; i <= rows.length; i++) {
        const r = rows[(at + i) % rows.length]!;
        if (r.node.label.toLocaleLowerCase().startsWith(k)) return { focus: r.node.id };
      }
      return {};
    }
  }
}

/** The row that takes Tab: the focused one if still visible, else the selected one, else the first. */
export function treeTabStop(rows: readonly TreeRow[], focusId: string | null, selected: string | null): string | null {
  if (focusId && rows.some((r) => r.node.id === focusId)) return focusId;
  if (selected && rows.some((r) => r.node.id === selected)) return selected;
  return rows[0]?.node.id ?? null;
}

/**
 * `ul.mh-tree` (`role="tree"`, `--checkable`, `--dense`): nested `li.mh-tree__item` (`role="treeitem"` with level,
 * position, `aria-expanded`, `aria-selected` or `aria-checked`, roving `tabindex`), each a `.mh-tree__row`
 * (`__toggle` chevron, `__check`, `__icon`, `__label`, `__meta`) and, when expanded, a `ul.mh-tree__group`.
 */
export function createTree(options: TreeOptions): TreeHandle {
  const checkable = options.checkable ?? false;
  const el = h('ul', { class: treeClass(checkable, options.dense), role: 'tree', 'aria-label': options.label });
  let expanded = [...(options.expanded ?? [])];
  let selected = options.selected ?? null;
  let checked = treeNormalizeChecked(options.nodes, options.checked ?? []);
  let focusId: string | null = null;

  const item = (row: TreeRow, rows: readonly TreeRow[], tabStop: string | null): HTMLLIElement => {
    const { node } = row;
    const parent = hasChildren(node);
    const open = parent && expanded.includes(node.id);
    const state = checkable ? treeCheckState(node, checked) : null;
    const li = h('li', {
      class: cx('mh-tree__item', !checkable && selected === node.id && 'is-selected'),
      role: 'treeitem',
      'data-id': node.id,
      'aria-level': row.level,
      'aria-setsize': row.setsize,
      'aria-posinset': row.posinset,
      'aria-expanded': parent ? String(open) : null,
      'aria-selected': checkable ? null : String(selected === node.id),
      'aria-checked': state,
      'aria-disabled': node.disabled ? 'true' : null,
      tabindex: tabStop === node.id ? 0 : -1,
    });
    const toggle = h('span', { class: cx('mh-tree__toggle', !parent && 'mh-tree__toggle--leaf'), 'aria-hidden': 'true' }, parent ? createIcon(mdiChevronRight) : null);
    if (parent) {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        focusId = node.id;
        setExpandedInner(open ? expanded.filter((x) => x !== node.id) : [...expanded, node.id], true, true);
      });
    }
    const row_ = h(
      'div',
      { class: 'mh-tree__row', style: `--_level: ${row.level - 1}` },
      toggle,
      checkable ? h('span', { class: 'mh-tree__check', 'aria-hidden': 'true' }, createIcon(mdiCheck, { class: 'mh-tree__check-mark' }), createIcon(mdiMinus, { class: 'mh-tree__check-dash' })) : null,
      node.icon ? h('span', { class: 'mh-tree__icon' }, createIcon(node.icon)) : null,
      h('span', { class: 'mh-tree__label' }, node.label),
      node.meta ? h('span', { class: 'mh-tree__meta' }, node.meta) : null,
    );
    li.append(row_);
    if (open) {
      const group = h('ul', { class: 'mh-tree__group', role: 'group' });
      for (const child of rows.filter((r) => r.parent === node.id)) group.append(item(child, rows, tabStop));
      li.append(group);
    }
    return li;
  };

  function render(): void {
    const hadFocus = el.contains(document.activeElement);
    const rows = treeRows(options.nodes, expanded);
    focusId = treeTabStop(rows, focusId, selected);
    el.replaceChildren(...rows.filter((r) => r.level === 1).map((r) => item(r, rows, focusId)));
    if (hadFocus && focusId) focusItem(focusId);
  }

  const itemOf = (id: string): HTMLElement | null => Array.from(el.querySelectorAll<HTMLElement>('[role="treeitem"]')).find((li) => li.dataset.id === id) ?? null;

  function focusItem(id: string): void {
    focusId = id;
    for (const li of el.querySelectorAll<HTMLElement>('[role="treeitem"]')) li.tabIndex = li.dataset.id === id ? 0 : -1;
    itemOf(id)?.focus();
  }

  function setExpandedInner(next: string[], notify: boolean, keepFocus = false): void {
    expanded = next;
    if (keepFocus && focusId) {
      render();
      focusItem(focusId);
    } else render();
    if (notify) options.onExpandedChange?.([...expanded]);
  }

  function activate(id: string): void {
    const node = treeFind(options.nodes, id);
    if (!node || node.disabled) return;
    focusId = id;
    if (checkable) {
      checked = treeToggleChecked(options.nodes, id, checked);
      render();
      focusItem(id);
      options.onCheckedChange?.([...checked]);
    } else {
      const changed = selected !== id;
      selected = id;
      render();
      focusItem(id);
      if (changed) options.onSelect?.(id);
    }
  }

  el.addEventListener('click', (e) => {
    const li = (e.target as Element).closest<HTMLElement>('[role="treeitem"]');
    if (li?.dataset.id) activate(li.dataset.id);
  });

  el.addEventListener('keydown', (e) => {
    const li = (e.target as Element).closest<HTMLElement>('[role="treeitem"]');
    if (!li?.dataset.id || e.target !== li || e.altKey || e.ctrlKey || e.metaKey) return;
    const rows = treeRows(options.nodes, expanded);
    const result = treeKeyAction(rows, li.dataset.id, e.key, expanded);
    if (!result) return;
    e.preventDefault();
    focusId = li.dataset.id;
    if (result.expanded) setExpandedInner(result.expanded, true, true);
    if (result.focus) focusItem(result.focus);
    if (result.activate) activate(li.dataset.id);
  });

  el.addEventListener('focusin', (e) => {
    const li = (e.target as Element).closest<HTMLElement>('[role="treeitem"]');
    if (li?.dataset.id && li.dataset.id !== focusId) focusItem(li.dataset.id);
  });

  render();
  return {
    el,
    expanded: () => [...expanded],
    setExpanded: (ids) => setExpandedInner([...ids], false),
    selected: () => selected,
    setSelected(id) {
      selected = id;
      render();
    },
    checked: () => [...checked],
    setChecked(ids) {
      checked = treeNormalizeChecked(options.nodes, ids);
      render();
    },
  };
}
