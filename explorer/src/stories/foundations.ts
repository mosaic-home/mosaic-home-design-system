import { h } from '../../../src/web/dom.ts';
import { createIcon } from '../../../src/web/icons.ts';
import { ICONS } from '../../../src/web/icon-set.ts';
import { createDivider, createText } from '../../../src/web/foundations/text.ts';
import { createAccentHeadline } from '../../../src/web/foundations/accentHeadline.ts';
import { createKbd } from '../../../src/web/foundations/kbd.ts';
import { createBackdrop, type BackdropOptions } from '../../../src/web/foundations/backdrop.ts';
import { createBootSplash } from '../../../src/web/foundations/bootSplash.ts';
import { createButton } from '../../../src/web/actions/button.ts';
import type { TextRole } from '../../../src/tokens/types.ts';
import type { Story } from './types.ts';

const row = (...children: (Node | string)[]): HTMLElement => h('div', { class: 'ex-row' }, ...children);

const swatch = (name: string, variable: string): HTMLElement =>
  h('div', { class: 'ex-swatch' }, h('span', { class: 'ex-swatch__chip', style: `background: var(${variable})` }), h('span', { class: 'mh-text--caption' }, name));

export const foundationsStories: Story[] = [
  {
    id: 'text',
    render: () =>
      h(
        'div',
        { class: 'ex-stack' },
        createText('Living room', { variant: 'eyebrow', tone: 'muted' }),
        createText('21.5°', { variant: 'display' }),
        createText('Good evening', { variant: 'headline' }),
        createText('Lights and climate', { variant: 'title' }),
        createText('Body text reads comfortably at every device class.'),
        createText('Label', { variant: 'label' }),
        createText('Caption, muted', { variant: 'caption', tone: 'muted' }),
        row(createText('Success', { variant: 'label', tone: 'success' }), createText('Warning', { variant: 'label', tone: 'warning' }), createText('Danger', { variant: 'label', tone: 'danger' })),
      ),
  },
  {
    id: 'icon',
    render: () => h('div', { class: 'ex-icons' }, ...Object.keys(ICONS).map((name) => h('div', { class: 'ex-icon', title: name }, createIcon(name, { size: 24 }), h('span', { class: 'mh-text--caption mh-text--faint' }, name)))),
  },
  {
    id: 'divider',
    render: () => h('div', { class: 'ex-stack' }, createText('Above'), createDivider(), createText('Below'), createDivider({ label: 'or' }), row('Left', createDivider({ vertical: true }), 'Right')),
  },
  {
    id: 'palette',
    render: () => {
      const groups: [string, string[]][] = [
        ['Canvas & surfaces', ['canvas-top', 'canvas-bottom', 'surface', 'surface-raised', 'surface-pressed', 'input', 'divider']],
        ['Text', ['heading', 'text', 'text-muted', 'text-faint']],
        ['Accent', ['accent', 'accent-light', 'accent-dark', 'on-accent', 'focus', 'accent-soft']],
        ['Status', ['success', 'info', 'warning', 'danger', 'on-status']],
        ['Series', ['series-1', 'series-2', 'series-3', 'series-4', 'series-5', 'series-6']],
      ];
      return h('div', { class: 'ex-stack' }, ...groups.flatMap(([title, roles]) => [createText(title, { variant: 'label', tone: 'muted' }), h('div', { class: 'ex-swatches' }, ...roles.map((r) => swatch(r, `--mh-${r}`)))]));
    },
  },
  {
    id: 'type-scale',
    render: (tokens) =>
      h(
        'div',
        { class: 'ex-stack' },
        ...(Object.entries(tokens.type) as [TextRole, number][]).map(([role, size]) => row(h('span', { class: 'ex-meta' }, `${role} ${size}`), createText('Aa Living room', { variant: role, as: 'span' }))),
      ),
  },
  {
    id: 'shape-space',
    render: (tokens) =>
      h(
        'div',
        { class: 'ex-stack' },
        createText('Radii', { variant: 'label', tone: 'muted' }),
        row(...(['sm', 'md', 'lg', 'xl'] as const).map((k) => h('div', { class: 'ex-shape', style: `border-radius: var(--mh-radius-${k})` }, `${k} ${tokens.radius[k]}`))),
        createText('Spacing', { variant: 'label', tone: 'muted' }),
        ...Object.entries(tokens.space).map(([k, v]) => row(h('span', { class: 'ex-meta' }, `${k} ${v}`), h('span', { class: 'ex-space', style: `width: ${v}px` }))),
        createText('Control heights', { variant: 'label', tone: 'muted' }),
        row(...Object.entries(tokens.control).map(([k, v]) => h('div', { class: 'ex-control', style: `height: ${v}px` }, `${k} ${v}`))),
      ),
  },
  {
    id: 'elevation',
    render: () => row(...[0, 1, 2, 3].map((level) => h('div', { class: 'ex-card', style: level ? `box-shadow: var(--mh-shadow-${level})` : '' }, `Level ${level}`))),
  },
  {
    id: 'accent-headline',
    render: () =>
      h(
        'div',
        { class: 'ex-stack' },
        createAccentHeadline({ text: 'Good evening', accent: 'evening', size: 'display', level: 1 }).el,
        createAccentHeadline({ text: 'Welcome home, the lights are ready', accent: 'home' }).el,
        createAccentHeadline({ text: 'Your quiet hour starts at ten', accent: 'quiet hour', size: 'title', level: 3 }).el,
        createText('Tone inherit: serif italic only', { variant: 'label', tone: 'muted' }),
        createAccentHeadline({ text: 'Lanterns over the quay', accent: 'over the quay', tone: 'inherit' }).el,
      ),
  },
  {
    id: 'kbd',
    render: () => {
      const shortcut = (keys: string | string[], what: string, sequence = false): HTMLElement => row(h('span', { class: 'ex-meta' }, what), createKbd({ keys, sequence }).el);
      return h(
        'div',
        { class: 'ex-stack' },
        shortcut('Ctrl+K', 'Search'),
        shortcut('Esc', 'Close a dialog'),
        shortcut(['Ctrl', 'Shift', 'P'], 'All commands'),
        shortcut('Ctrl++', 'Zoom in'),
        shortcut(['ArrowUp', 'ArrowDown'], 'Move between rooms', true),
        shortcut(['G', 'H'], 'Go home', true),
        h('p', { class: 'mh-text--body', style: 'margin: 0' }, 'Press ', createKbd({ keys: '/', size: 'small' }).el, ' to search, or ', createKbd({ keys: 'Space', size: 'small' }).el, ' to toggle the selected light.'),
      );
    },
  },
  {
    id: 'backdrop',
    render: () => {
      const panel = (title: string, options: BackdropOptions): HTMLElement =>
        h(
          'div',
          { class: 'mh-backdrop-host', style: 'display: grid; place-items: center; min-height: 160px; overflow: hidden; border: 1px solid var(--mh-outline); border-radius: var(--mh-radius-lg)' },
          createBackdrop(options).el,
          createText(title, { variant: 'title' }),
        );
      return h(
        'div',
        { class: 'ex-stack' },
        createText('Calm themes (contrast, or the backdrop turned off in Tune) show the flat canvas.', { variant: 'label', tone: 'muted' }),
        panel('Canvas and glow', {}),
        panel('Drifting glow', { drift: true }),
        panel('Dimmed, behind a clock', { dim: true, drift: true }),
      );
    },
  },
  {
    id: 'boot-splash',
    render: () => {
      const frame = 'position: relative; overflow: hidden; border: 1px solid var(--mh-outline); border-radius: var(--mh-radius-lg)';
      const host = h('div', { style: `${frame}; height: 360px` });
      const steps = ['Starting…', 'Connecting to Home Assistant…', 'Loading rooms…', 'Almost ready…'];
      const boot = (): void => {
        host.replaceChildren();
        const splash = createBootSplash({ name: 'Mosaic Home', message: steps[0], progress: null, inline: true });
        host.append(splash.el);
        let step = 0;
        const timer = window.setInterval(() => {
          if (!splash.el.isConnected) return window.clearInterval(timer);
          step += 1;
          if (step < steps.length) {
            splash.setMessage(steps[step]!);
            splash.setProgress((step / (steps.length - 1)) * 100);
            return;
          }
          window.clearInterval(timer);
          const again = createButton({ label: 'Boot again', icon: 'refresh', variant: 'secondary', onClick: boot });
          void splash.dismiss().then(() => host.append(h('div', { style: 'display: grid; place-items: center; height: 100%' }, again.el)));
        }, 1400);
      };
      boot();
      const still = h('div', { style: `${frame}; height: 240px` }, createBootSplash({ name: 'Mosaic Home', message: 'Waiting for the network', inline: true }).el);
      return h('div', { class: 'ex-stack' }, createText('Boots, shows progress, then fades out', { variant: 'label', tone: 'muted' }), host, createText('Without progress', { variant: 'label', tone: 'muted' }), still);
    },
  },
];
