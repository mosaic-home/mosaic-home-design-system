// A tiny element tree shared by the charts: each chart describes its markup once as a `ChartNode`, the web renderer
// turns it into DOM (and patches it in place on updates), and the React bindings turn the same tree into elements.
// That keeps the two renderers' markup identical by construction.

export type ChartChild = ChartNode | string;

export interface ChartNode {
  tag: string;
  attrs: Record<string, string>;
  children: ChartChild[];
}

type AttrValue = string | number | boolean | null | undefined;
type ChildInput = ChartChild | ChildInput[] | false | null | undefined;

/** Builds a node: `false`, `null` and `undefined` attributes and children are skipped, `true` is an empty attribute. */
export function node(tag: string, attrs: Record<string, AttrValue> = {}, ...children: ChildInput[]): ChartNode {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    out[k] = v === true ? '' : String(v);
  }
  const kids: ChartChild[] = [];
  const add = (c: ChildInput): void => {
    if (c === null || c === undefined || c === false) return;
    if (Array.isArray(c)) c.forEach(add);
    else kids.push(c);
  };
  children.forEach(add);
  return { tag, attrs: out, children: kids };
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Creates DOM for a tree; `svg` and everything inside it is created in the SVG namespace. */
export function toDom(n: ChartNode, inSvg = false): Element {
  const svg = inSvg || n.tag === 'svg';
  const el = svg ? document.createElementNS(SVG_NS, n.tag) : document.createElement(n.tag);
  for (const [k, v] of Object.entries(n.attrs)) el.setAttribute(k, v);
  for (const c of n.children) el.append(typeof c === 'string' ? document.createTextNode(c) : toDom(c, svg));
  return el;
}

/**
 * Brings `el` in line with `n` in place: attributes are synced, children of the same tag are patched recursively
 * and the rest replaced. Elements (and so focus and pointer capture) survive updates that keep the structure.
 */
export function patch(el: Element, n: ChartNode, inSvg = false): void {
  const svg = inSvg || n.tag === 'svg';
  for (const a of Array.from(el.attributes)) if (!(a.name in n.attrs)) el.removeAttribute(a.name);
  for (const [k, v] of Object.entries(n.attrs)) if (el.getAttribute(k) !== v) el.setAttribute(k, v);
  const existing = Array.from(el.childNodes);
  n.children.forEach((c, i) => {
    const cur = existing[i];
    if (typeof c === 'string') {
      if (cur && cur.nodeType === 3) {
        if (cur.textContent !== c) cur.textContent = c;
      } else if (cur) el.replaceChild(document.createTextNode(c), cur);
      else el.append(c);
      return;
    }
    if (cur instanceof Element && cur.tagName.toLowerCase() === c.tag.toLowerCase()) patch(cur, c, svg);
    else if (cur) el.replaceChild(toDom(c, svg), cur);
    else el.append(toDom(c, svg));
  });
  for (let i = existing.length - 1; i >= n.children.length; i -= 1) existing[i]!.remove();
}

/** Rounds to two decimals for compact path data. */
export const r2 = (n: number): number => Math.round(n * 100) / 100;

/** A series colour (`--mh-series-1` .. `--mh-series-6`) or the theme accent. */
export type ChartColor = 1 | 2 | 3 | 4 | 5 | 6 | 'accent';
export type ChartSize = 'small' | 'medium' | 'large';

/** `<block>--accent | --series-N`. */
export function colorModifier(block: string, color: ChartColor = 'accent'): string {
  return `${block}--${color === 'accent' ? 'accent' : `series-${color}`}`;
}

/** `<block>--sm | --lg`, or nothing for medium. */
export function sizeModifier(block: string, size: ChartSize = 'medium'): string | false {
  return size !== 'medium' && `${block}--${size === 'small' ? 'sm' : 'lg'}`;
}

export const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));
