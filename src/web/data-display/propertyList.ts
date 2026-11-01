import { cx, h } from '../dom.ts';

export interface PropertyListItem {
  label: string;
  value: string | HTMLElement;
}

export interface PropertyListOptions {
  items: PropertyListItem[];
  /** Tighter rows, for inspectors and small panels. */
  dense?: boolean;
}

export interface PropertyListHandle {
  el: HTMLDListElement;
  setItems(items: PropertyListItem[]): void;
}

export function propertyListClass(dense = false): string {
  return cx('mh-property-list', dense && 'mh-property-list--dense');
}

/**
 * `dl.mh-property-list`: label / value rows (`__row` > `dt.__label` + `dd.__value`). Long values wrap; numbers use
 * tabular figures. `--dense` tightens the rows.
 */
export function createPropertyList(options: PropertyListOptions): PropertyListHandle {
  const el = h('dl', { class: propertyListClass(options.dense) });
  const setItems = (items: PropertyListItem[]): void => {
    el.replaceChildren(
      ...items.map((item) =>
        h('div', { class: 'mh-property-list__row' }, h('dt', { class: 'mh-property-list__label' }, item.label), h('dd', { class: 'mh-property-list__value' }, item.value)),
      ),
    );
  };
  setItems(options.items);
  return { el, setItems };
}
