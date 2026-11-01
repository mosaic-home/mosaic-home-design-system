import '../../src/web/style.css';
import '../../src/icons.ts';
import './explorer.css';
import { CATALOG, GROUPS, WEB_READY } from '../../src/catalog.ts';
import { ACCENT_NAMES } from '../../src/tokens/accents.ts';
import { CORNERS, DENSITIES, DEVICE_CLASSES } from '../../src/tokens/resolve.ts';
import { THEMES } from '../../src/tokens/themes.ts';
import type { Character, Tokens } from '../../src/tokens/types.ts';
import { h } from '../../src/web/dom.ts';
import { createText } from '../../src/web/foundations/text.ts';
import { createIconButton } from '../../src/web/actions/iconButton.ts';
import { createSegmentedControl } from '../../src/web/choice-inputs/segmentedControl.ts';
import { applyTheme } from '../../src/web/theme.ts';
import { STORIES } from './stories/index.ts';

// State lives in the URL, so any view can be linked: ?theme=daylight&device=tablet&corners=soft#button
const params = new URLSearchParams(location.search);
const state = {
  theme: params.get('theme') ?? 'midnight',
  device: (params.get('device') ?? 'phone') as (typeof DEVICE_CLASSES)[number],
  accent: params.get('accent') ?? 'default',
  corners: params.get('corners') ?? '',
  density: params.get('density') ?? '',
  depth: params.get('depth') ?? '',
};

const nav = h('nav', { class: 'ex-nav', 'aria-label': 'Components' });
const stage = h('main', { class: 'ex-stage' });
const tune = h('form', { class: 'ex-tune', 'aria-label': 'Tune' });
document.body.append(h('div', { class: 'ex-app mh-canvas' }, nav, h('div', { class: 'ex-main' }, tune, stage)));

let tokens: Tokens;

function select(name: keyof typeof state, label: string, options: readonly (readonly [string, string])[]): HTMLElement {
  const el = h('select', { name }, ...options.map(([value, text]) => h('option', { value, selected: state[name] === value }, text)));
  el.addEventListener('change', () => {
    (state as Record<string, string>)[name] = el.value;
    const q = new URLSearchParams(Object.entries(state).filter(([, v]) => v && v !== 'default'));
    history.replaceState(null, '', `?${q}${location.hash}`);
    render();
  });
  return h('label', { class: 'ex-tune__field' }, h('span', { class: 'mh-text--caption mh-text--muted' }, label), el);
}

tune.append(
  select('theme', 'Theme', THEMES.map((t) => [t.id, t.name] as const)),
  select('device', 'Device', DEVICE_CLASSES.map((d) => [d, d] as const)),
  select('accent', 'Accent', [['default', 'theme'], ...ACCENT_NAMES.map((a) => [a, a] as const)]),
  select('corners', 'Corners', [['', 'theme'], ...CORNERS.map((c) => [c, c] as const)]),
  select('density', 'Density', [['', 'theme'], ...DENSITIES.map((d) => [d, d] as const)]),
  select('depth', 'Depth', [['', 'theme'], ['shadow', 'shadow'], ['glow', 'glow'], ['flat', 'flat']]),
);

function render(): void {
  const character: Partial<Character> = {};
  if (state.corners) character.corners = state.corners as Character['corners'];
  if (state.density) character.density = state.density as Character['density'];
  if (state.depth) character.depth = state.depth as Character['depth'];
  if (state.depth === 'glow') character.glow = 1;
  tokens = applyTheme(state.theme, { deviceClass: state.device, character, accent: state.accent as never });
  renderNav();
  renderStage();
}

function renderNav(): void {
  const current = location.hash.slice(1) || STORIES[0]!.id;
  nav.replaceChildren(
    h('div', { class: 'ex-brand' }, h('a', { href: `index.html${location.search}`, class: 'ex-home' }, createText('Mosaic Home', { variant: 'title', as: 'span' })),createText(`${WEB_READY.size} of ${CATALOG.length} components`, { variant: 'caption', tone: 'muted', as: 'span' }), h('a', { href: 'themes.html', class: 'ex-studio' }, 'Theme studio')),
    ...GROUPS.map((g) =>
      h(
        'section',
        {},
        createText(g.name, { variant: 'eyebrow', tone: 'faint', as: 'h2' }),
        h(
          'ul',
          {},
          ...CATALOG.filter((e) => e.group === g.id).map((e) =>
            h('li', {}, WEB_READY.has(e.id) ? h('a', { href: `#${e.id}`, 'aria-current': e.id === current ? 'page' : null }, e.name) : h('span', { class: 'ex-planned', title: 'Planned' }, e.name)),
          ),
        ),
      ),
    ),
  );
}

// Example code: explorer/examples/{web,react}/<id>.ts(x), type-checked against the package's public entry points.
// The gallery shows the file with the group's stylesheet import added, ready to copy.

const byId = (files: Record<string, string>): Map<string, string> => new Map(Object.entries(files).map(([path, text]) => [path.replace(/^.*\/|\.tsx?$/g, ''), text]));
const WEB_EXAMPLES = byId(import.meta.glob<string>('../examples/web/*.ts', { query: '?raw', import: 'default', eager: true }));
const REACT_EXAMPLES = byId(import.meta.glob<string>('../examples/react/*.tsx', { query: '?raw', import: 'default', eager: true }));
type Flavour = 'web' | 'react';
const FLAVOUR_KEY = 'mh-explorer-code';
let flavour: Flavour = 'web';
try {
  if (localStorage.getItem(FLAVOUR_KEY) === 'react') flavour = 'react';
} catch {
  // Storage can be unavailable; TypeScript is the default.
}

/** An `icon` option, prop or `createIcon` call given a short name rather than a path. */
const SHORT_ICON_NAME = /(\b\w*[iI]con\w*\s*[:=]\s*\{?\s*|createIcon\(\s*)['"][a-z][a-z-]*['"]/;

/**
 * The example as a user would paste it: the stylesheet of the component's group first, and the short icon names
 * when the example uses them.
 */
function exampleCode(id: string, group: string, which: Flavour): string | undefined {
  const text = (which === 'web' ? WEB_EXAMPLES : REACT_EXAMPLES).get(id);
  if (!text) return undefined;
  if (!/from '@mosaic-home\/design-system\/(web|react)'/.test(text)) return text;
  const icons = SHORT_ICON_NAME.test(text) ? "import '@mosaic-home/design-system/icons';\n" : '';
  return `import '@mosaic-home/design-system/css/${group}';\n${icons}${text}`;
}

const TOKEN = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`)|\b(import|from|export|function|return|const|let|new|type|interface|if|else|true|false|null|undefined|await|async)\b|\b(\d+(?:\.\d+)?)\b/g;

/** Light syntax colouring: comments, strings, keywords and numbers, built as text nodes (nothing parsed as HTML). */
function highlight(code: string): Node[] {
  const out: Node[] = [];
  let at = 0;
  for (const m of code.matchAll(TOKEN)) {
    if (m.index > at) out.push(document.createTextNode(code.slice(at, m.index)));
    const kind = m[1] ? 'comment' : m[2] ? 'string' : m[3] ? 'keyword' : 'number';
    out.push(h('span', { class: `ex-code__${kind}` }, m[0]));
    at = m.index + m[0].length;
  }
  out.push(document.createTextNode(code.slice(at)));
  return out;
}

function codePanel(id: string, group: string): HTMLElement | null {
  const web = exampleCode(id, group, 'web');
  const react = exampleCode(id, group, 'react');
  if (!web && !react) return null;
  const code = h('code', {});
  const note = h('span', { class: 'ex-code__note', 'aria-live': 'polite' });
  const current = (): string => (flavour === 'react' ? react : web) ?? web ?? react ?? '';
  const show = (): void => {
    code.replaceChildren(...highlight(current()));
    note.textContent = '';
  };
  const tabs = createSegmentedControl({
    label: 'Example code',
    size: 'small',
    value: flavour,
    options: [
      { value: 'web', label: 'TypeScript', disabled: !web },
      { value: 'react', label: 'React', disabled: !react },
    ],
    onChange: (v) => {
      flavour = v as Flavour;
      try {
        localStorage.setItem(FLAVOUR_KEY, flavour);
      } catch {
        // Not remembered; fine.
      }
      show();
    },
  });
  const copy = createIconButton({
    icon: 'copy',
    label: 'Copy the example',
    size: 'small',
    onClick: () => {
      void navigator.clipboard?.writeText(current()).then(() => {
        note.textContent = 'Copied';
        setTimeout(() => (note.textContent = ''), 1500);
      });
    },
  });
  show();
  return h(
    'section',
    { class: 'ex-code', 'aria-label': 'Example code' },
    h('div', { class: 'ex-code__bar' }, createText('Code', { variant: 'title', as: 'h3' }), tabs.el, h('span', { class: 'ex-code__end' }, note, copy.el)),
    h('pre', { class: 'ex-code__pre', tabindex: '0' }, code),
  );
}

function renderStage(): void {
  const id = location.hash.slice(1) || STORIES[0]!.id;
  const story = STORIES.find((s) => s.id === id) ?? STORIES[0]!;
  const entry = CATALOG.find((e) => e.id === story.id)!;
  stage.replaceChildren(
    h('header', { class: 'ex-head' }, createText(entry.name, { variant: 'headline' }), createText(entry.summary, { tone: 'muted' })),
    h('section', { class: 'ex-demo' }, story.render(tokens)),
    ...[codePanel(story.id, entry.group)].filter((el) => el !== null),
  );
  nav.querySelectorAll('a').forEach((a) => a.toggleAttribute('aria-current', a.getAttribute('href') === `#${story.id}`));
}

window.addEventListener('hashchange', renderStage);
render();
