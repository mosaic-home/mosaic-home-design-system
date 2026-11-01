---
name: mosaic-home-design-system
description: Build UIs with the Mosaic Home design system (@mosaic-home/design-system), a set of themes, tokens and components for home dashboards and apps on wall tablets, phones, watches and TVs, in vanilla TypeScript or React. Use when code imports @mosaic-home/design-system, when building a home dashboard, smart-home control or kiosk screen with it, or when the user mentions Mosaic Home themes, tokens or mh-* components.
---

# Mosaic Home design system

`@mosaic-home/design-system` has four entry points:

| Import | What |
|---|---|
| `@mosaic-home/design-system/web` | Components as plain DOM: `create<Name>(options)` returns a handle `{ el, …setters }`. Also `applyTheme`. |
| `@mosaic-home/design-system/react` | The same components for React, with the same markup and classes. Also `ThemeProvider`, `useTokens`. |
| `@mosaic-home/design-system/tokens` | Themes, colours and sizes as plain data (no DOM): `resolveTokens`, `themeById`, `deriveTheme`, … |
| `@mosaic-home/design-system/icons` | Side-effect import that turns on short icon names (`icon: 'power'`). |

Styles come from `@mosaic-home/design-system/style.css` (everything) or `@mosaic-home/design-system/css/<group>`
(one group plus what it needs). Read [getting started](references/getting-started.md) for setup.

## Before writing code

1. Find the component in the index below and open its group's reference file. It holds the exact options, handle
   and React props from the source, plus a web and a React example. Use those names and types; don't guess them.
2. Import the stylesheet of every group you use (`css/<group>`), or `style.css` once.
3. Apply a theme once per page: `data-mh-theme` on `<html>`, `applyTheme()`, or `<ThemeProvider>`.

## Setup

```ts
import '@mosaic-home/design-system/css/home';            // or '@mosaic-home/design-system/style.css'
import { applyTheme } from '@mosaic-home/design-system/web';

applyTheme('midnight', { deviceClass: 'tablet' });       // or daylight, nightstand, contrast
document.body.classList.add('mh-canvas');                // the theme's backdrop on the page
```

```tsx
import '@mosaic-home/design-system/css/home';
import { ThemeProvider } from '@mosaic-home/design-system/react';

<ThemeProvider theme="midnight" deviceClass="phone" accent="teal" character={{ corners: 'soft' }}>
  <App />
</ThemeProvider>;
```

- **Device classes** `wearable`, `phone`, `tablet` and `tv` set type, spacing, radii and touch targets. Choose by
  the screen the UI is for, not the window width.
- **Accents:** `coral`, `amber`, `lime`, `teal`, `sky`, `violet`, `rose`, or `default` (the theme's own).
- **Character:** `corners` (`square` `crisp` `soft` `round` `pill` `mosaic`), `density` (`compact` `regular`
  `comfortable`), `depth` (`shadow` `glow` `flat`), `glow` 0–1, `outline` 1–3, `backdrop`, `outlined`.
- **Several themes on one page:** `applyTheme(theme, options, element)`, or `<ThemeProvider scope="local">`. Don't
  nest a themed region inside another one.
- **Home colours** (heat, cool, a lit light) are optional: `applyHomeColors(theme, element)` from `/web`.

## How components work

- **Web:** `const t = createThermostat({ …data, onTarget })`, then `parent.append(t.el)`. Callbacks report what the
  user asked for; when the real state changes (often after your backend confirms), push it back through the handle:
  `t.update({ target })`, or setters such as `setLoading`, `setValue`. Overlays have `open()` and `close()`.
- **React:** controlled props plus `on…` callbacks, e.g. `<Thermostat target={target} onTarget={setTarget} />`.
  Keep state in the parent.
- **Home components** take plain data and callbacks and never talk to a server. Map your backend's state into
  their options and send commands from the callbacks.
- **Text:** built-in text is English. Components with text of their own take a `labels` option.
- **Icons:** pass paths from `@mdi/js` (`icon: mdiPower`; add `@mdi/js` to the app's dependencies), or import
  `@mosaic-home/design-system/icons` once to use short names. `registerIcons({ name: path })` adds names.

## Styling your own parts

- Use the theme's CSS variables, never fixed colours or radii: `--mh-surface`, `--mh-surface-raised`, `--mh-text`,
  `--mh-text-muted`, `--mh-accent`, `--mh-outline`, `--mh-radius-lg`, `--mh-radius-control`, `--mh-space-md`,
  `--mh-control-md`, `--mh-text-title`, `--mh-shadow-1`, and so on. The full list of roles is in
  [the token format](references/tokens.md).
- In code (canvas, charts): `useTokens()` in React, or the tokens `applyTheme` returns.
- The public classes are `mh-<component>`, `mh-<component>__<part>` and `mh-<component>--<modifier>`. Prefer
  options over overriding them.

## Custom themes

```ts
import { deriveTheme, checkContrast, validateTheme } from '@mosaic-home/design-system/tokens';

const theme = deriveTheme({ id: 'harbour', name: 'Harbour', base: 'midnight', accent: '#4fd1c5' });
checkContrast(theme).filter((c) => !c.ok);   // pairs below their minimum
applyTheme(theme, { deviceClass: 'tablet' }); // a theme object works anywhere a theme id does
```

Load a theme file with `validateTheme(json)` first; it returns `{ ok: true, theme }` or `{ ok: false, errors }`.

## Components

<!-- components:start -->
<!-- components:end -->

## References

- [Getting started](references/getting-started.md): install, styles, themes, a first component, icons.
- [Token format](references/tokens.md): colour roles, sizes, resolution rules, custom themes.
- `references/components/<group>.md`: every component's API and examples, one file per group.
