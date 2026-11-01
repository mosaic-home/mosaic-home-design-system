// Tiny DOM helpers shared by the web components. No framework.

export type Child = Node | string | number | null | undefined | false;

export type Attrs = Record<string, string | number | boolean | null | undefined | EventListener>;

/** Creates an element: string and number attributes are set, `true` sets an empty attribute, `on*` functions become listeners. */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (typeof value === 'function') el.addEventListener(key.slice(2).toLowerCase(), value);
    else if (value === true) el.setAttribute(key, '');
    else el.setAttribute(key, String(value));
  }
  append(el, ...children);
  return el;
}

export function append(parent: Node, ...children: Child[]): void {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    parent.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
  }
}

/** Joins class names, skipping falsy ones. */
export function cx(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}

let nextId = 0;
/** A document-unique id for aria wiring. */
export function uid(prefix = 'mh'): string {
  nextId += 1;
  return `${prefix}-${nextId}`;
}
