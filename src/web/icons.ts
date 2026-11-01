// Icons: inline SVG paths from Material Design Icons (Apache-2.0). Components pass the paths they need, imported
// from `@mdi/js`, so a bundle holds only those. Apps can also pass short names (`'power'`) once the names are
// registered: `import '@mosaic-home/design-system/icons'` registers the built-in set, `registerIcons` adds more.

import type { ICONS } from './icon-set.ts';

const SVG_NS = 'http://www.w3.org/2000/svg';

export type IconName = keyof typeof ICONS;

export interface IconOptions {
  /** Size in px; default follows the font size (1.25em). */
  size?: number;
  /** Accessible label; without one the icon is decorative (`aria-hidden`). */
  label?: string;
  class?: string;
}

const registry = new Map<string, string>();
const warned = new Set<string>();
/** SVG path data starts with a move-to command. */
const PATH = /^[Mm][\s\d.,-]/;

/** Makes short names available to `createIcon`, `iconPath` and every component's `icon` option. */
export function registerIcons(icons: Readonly<Record<string, string>>): void {
  for (const [name, path] of Object.entries(icons)) registry.set(name, path);
}

/** The SVG path data of a registered name, or the argument itself when it is already a path. */
export function iconPath(icon: IconName | string): string {
  const named = registry.get(icon);
  if (named !== undefined) return named;
  if (PATH.test(icon) || icon === '') return icon;
  if (!warned.has(icon)) {
    warned.add(icon);
    console.warn(`Mosaic Home: no icon named "${icon}". Import '@mosaic-home/design-system/icons' once to use the short names, or pass an icon path from @mdi/js.`);
  }
  return '';
}

/** `.mh-icon`: an inline SVG that takes `currentColor`. */
export function createIcon(icon: IconName | string, options: IconOptions = {}): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', options.class ? `mh-icon ${options.class}` : 'mh-icon');
  if (options.size) {
    svg.setAttribute('width', String(options.size));
    svg.setAttribute('height', String(options.size));
  }
  if (options.label) {
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', options.label);
  } else {
    svg.setAttribute('aria-hidden', 'true');
  }
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', iconPath(icon));
  path.setAttribute('fill', 'currentColor');
  svg.appendChild(path);
  return svg;
}
