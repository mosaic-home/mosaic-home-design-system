# Mosaic Home design system

Themes, tokens and components for home dashboards and apps: wall tablets, phones, watches and TVs.

- **One set of themes, every renderer.** Colours, type, spacing, corners and depth are defined once, as data. The
  web renderer (CSS + vanilla TypeScript, with React bindings) ships here; the
  [LVGL kit](https://github.com/mosaic-home/mosaic-home-design-system-lvgl) draws the same themes on
  microcontroller screens from `tokens/mosaic-home.tokens.json`.
- **A theme is a palette plus a character.** The character sets the corner language, density, how surfaces lift
  off the canvas and whether panels are outlined, so one palette can look calm, dense or soft without touching a
  component.
- **Sized per device class.** Wearable, phone, tablet and TV each get their own type scale, radii and spacing.
- **No framework required.** Components are plain DOM with public `mh-*` classes; the React bindings render
  exactly the same markup.

## Themes

| Theme | |
|---|---|
| `midnight` | Deep blue-black canvas, cool glow, periwinkle accent (default) |
| `daylight` | Warm paper canvas, white cards, ink text, cobalt accent |
| `nightstand` | Near-black with warm amber text and a dim ember glow, for bedrooms at night |
| `contrast` | Black canvas, solid surfaces with white outlines, yellow accent; text keeps at least 7:1 |

`auto` follows the system: `midnight` when dark, `daylight` when light. Every theme takes a named accent
(`coral`, `amber`, `lime`, `teal`, `sky`, `violet`, `rose`) tuned for its canvas.

| Character axis | Values |
|---|---|
| Corners | `square`, `crisp`, `soft`, `round`, `pill`, `mosaic` (generous radii per device class, pill controls) |
| Density | `compact`, `regular`, `comfortable` |
| Depth | `shadow`, `glow`, `flat` |
| Outline | 1–3 dp hairlines; `outlined` panels on or off |
| Backdrop | canvas gradient and ambient glow on or off |

## Use it

```sh
npm install @mosaic-home/design-system
npx skills add mosaic-home/mosaic-home-design-system   # optional: the skill for AI coding agents
```

New here? [Getting started](docs/getting-started.md) takes you from install to a themed control. The skill gives
coding agents every component's options and examples (it lives in `skills/mosaic-home-design-system`).

Plain HTML, no JavaScript needed for a built-in theme:

```html
<link rel="stylesheet" href="node_modules/@mosaic-home/design-system/dist/style.css" />
<html data-mh-theme="auto" data-mh-device="tablet">
  <button class="mh-button mh-button--primary">Turn on</button>
</html>
```

Vanilla TypeScript:

```ts
import '@mosaic-home/design-system/style.css';
import '@mosaic-home/design-system/icons'; // short icon names such as 'power'
import { applyTheme, createButton } from '@mosaic-home/design-system/web';

applyTheme('nightstand', { deviceClass: 'tablet', character: { corners: 'soft' }, accent: 'teal' });
document.body.append(createButton({ label: 'Turn on', icon: 'power', onClick: () => {} }).el);
```

React:

```tsx
import '@mosaic-home/design-system/style.css';
import '@mosaic-home/design-system/icons';
import { Button, ThemeProvider } from '@mosaic-home/design-system/react';

<ThemeProvider theme="midnight" deviceClass="phone">
  <Button icon="power">Turn on</Button>
</ThemeProvider>;
```

### Only what you use

The JavaScript is plain ES modules, one file per component, so a bundler keeps only the components you import.
`style.css` is every component's styles (about 70 KB gzipped). For less, import the stylesheet of each group you
use instead; each brings the theme variables, the base styles and the groups it builds on, once each and in the
right order (a home thermostat brings buttons and sliders):

```ts
import '@mosaic-home/design-system/css/home';    // themes, base, actions, choice-inputs, … and home
import '@mosaic-home/design-system/css/charts';
```

| Group | Components |
|---|---|
| `core` | Built-in themes and base styles (every group includes it) |
| `foundations` | Text, accent headline, icons, keyboard keys, dividers, backdrop, boot splash |
| `actions` | Buttons, icon buttons, button groups, links, favourite toggle |
| `choice-inputs` | Checkboxes, radios, switches, segmented controls, toggle groups, chips, sliders, dials, click wheel, stepper, rating |
| `text-inputs` | Fields, text fields and areas, search, composer, number, secret, hotkey and duration fields, command bar, selects, transfer list |
| `pickers` | Date-time field, date and date-range pickers, colour picker, gradient editor, icon picker, file drop zone |
| `navigation` | Tabs, document tabs, menu bar, breadcrumbs, pagination, steps, nav rail, page header |
| `overlays` | Split button, dialogs and confirm, bottom sheet, drawer, popover, tooltip, menu, toasts, command palette |
| `feedback` | Alerts, progress bars, rings and lists, spinner, skeleton, badges, status, empty states, notices, recording pill, voice bar |
| `data-display` | Cards, lists, tiles, avatars, accordion, tree, data table, property list, carousel, timeline, QR code, forecast strip, media list |
| `charts` | Sparkline, trend, bar chart, month grid, meters, waveform, histogram, curves editor |
| `media` | Media timeline, transport, layers panel, zoom control, transform fields, inspector, compare slider, zoomable image, maps |
| `layout` | Screen, stacks, split pane, panels, scroll panel, toolbar, status bar, app shell, reorderable list, swipe row, onboarding |
| `home` | Every home control and screen (thermostat, lights, media player, energy, security, …) |

Without a bundler, link `css/core.css` and then each group's `css/<group>.css` in the order of this table; the
comment at the top of each file names the groups it needs.

Icons are paths from [Material Design Icons](https://pictogrammers.com/library/mdi/) (`@mdi/js`). Components carry
only the icons they draw. To pass short names such as `icon: 'power'`, import
`@mosaic-home/design-system/icons` once (the built-in set of about 60 names, 5 KB gzipped), register your own with
`registerIcons({ 'garden-lamp': mdiOutdoorLamp })`, or pass a path directly: `icon: mdiPower`.

Tokens only (any platform, React Native included; no DOM):

```ts
import { resolveTokens, themeById } from '@mosaic-home/design-system/tokens';

const t = resolveTokens(themeById('daylight')!, 'phone');
t.theme.palette.accent; // '#2f62f5'
t.space.md; // 12
```

## Components

The catalogue (`src/catalog.ts`, also `tokens/catalog.json`) lists every component in thirteen groups:
foundations, actions, text inputs, choice and range, pickers, navigation, overlays, feedback, data display,
charts, media, layout and home controls (thermostats, lights, blinds, locks; their heat, cool and lit-light colours
come from the optional `applyHomeColors` add-on). Each renderer marks what it has built; the explorer shows the rest
as planned.

The geo map draws places, areas and routes itself and loads nothing by default. For a street background, the app
passes its tile server's XYZ template and the credit that server requires; the design system names no provider.
Follow the server's usage policy (the map loads only the tiles in view, never prefetches, and keeps HTTP caching):

```ts
createGeoMap({
  label: 'Where Sam is',
  points: [{ lat: 51.0, lon: 7.0, label: 'Sam', accuracy: 30 }],
  shapes: [],
  tiles: { url: 'https://tiles.example.org/{z}/{x}/{y}.png', attribution: '© Example map contributors', maxZoom: 19 },
});
```

Dark themes tone the tiles down through `--mh-geo-map-tile-filter`; the credit is always shown in the corner.

## Explorer

```sh
npm install
npm run explorer          # showcase, gallery and theme studio on http://localhost:5173
npm run demo              # static build into docs/, the GitHub Pages site
```

Three pages: the showcase (`index.html`), a home dashboard built from the components that re-themes live, with the
themes, characters and device classes side by side; the gallery (`components.html`), every ready component
with a Tune bar for theme, device class, accent, corners, density and depth; and the theme studio (`themes.html`),
which makes a custom theme from a built-in one, a few colours and a character, checks its contrast and exports it
as a theme file, a CSS file or a tokens file (see [docs/tokens.md](docs/tokens.md#custom-themes)). All three keep
their settings in the URL, and `?tour` on the showcase starts the theme tour.

The built site is committed in `docs/` and served by GitHub Pages at
[mosaic-home.github.io/mosaic-home-design-system](https://mosaic-home.github.io/mosaic-home-design-system/)
(Settings → Pages → Deploy from a branch → `main`, folder `/docs`). Rebuild it with `npm run demo` after changing
the explorer or a component; `npm run check` fails while it is out of date.

## Develop

Node 22.18 or newer.

```sh
npm run check     # generated files up to date, lint, typecheck, tests
npm run tokens    # regenerate themes.css and tokens/*.json after changing src/tokens or the catalogue
npm run build     # dist/ (ES modules, type declarations, style.css, css/<group>)
```

See [AGENTS.md](AGENTS.md) for the conventions and [docs/tokens.md](docs/tokens.md) for the token format.

## Licence

MIT. Icons are [Material Design Icons](https://pictogrammers.com/library/mdi/) (Apache-2.0), installed as the `@mdi/js` dependency.
