# Getting started

Mosaic Home is a set of themes, tokens and components for screens around a home: wall tablets, phones, watches and
TVs. This page takes you from an empty project to a themed control in a few minutes.

## 1. Install

```sh
npm install @mosaic-home/design-system @mdi/js
```

`@mdi/js` holds the icon paths you pass to components. React is optional; the React components need React 18 or
newer in your project.

Using an AI coding agent? Give it the design system's own skill, with every component's options and examples:

```sh
npx skills add mosaic-home/mosaic-home-design-system
```

## 2. Load the styles

Import everything, or only the groups you use. Each group brings the theme variables and the groups it builds on.

```ts
import '@mosaic-home/design-system/style.css';     // everything, about 70 KB gzipped
// or
import '@mosaic-home/design-system/css/actions';   // buttons only, about 5 KB
import '@mosaic-home/design-system/css/home';      // home controls, with what they need
```

The groups are `foundations`, `actions`, `choice-inputs`, `text-inputs`, `pickers`, `navigation`, `overlays`,
`feedback`, `data-display`, `charts`, `media`, `layout` and `home`. The component gallery shows each component's
group in its code sample.

## 3. Pick a theme

The quickest way is an attribute on `<html>`:

```html
<html data-mh-theme="auto" data-mh-device="tablet">
  <body class="mh-canvas">…</body>
</html>
```

- **Themes:** `midnight`, `daylight`, `nightstand`, `contrast`, or `auto` (midnight when the system is dark,
  daylight when it is light).
- **Device classes:** `wearable`, `phone` (the default), `tablet`, `tv`. They set the type scale, spacing, radii
  and touch targets.
- `mh-canvas` paints the theme's background on the page.

For more control (a named accent, different corners or density), apply the theme from code:

```ts
import { applyTheme } from '@mosaic-home/design-system/web';

applyTheme('daylight', { deviceClass: 'tablet', accent: 'teal', character: { corners: 'soft', density: 'compact' } });
```

## 4. Add a component

Vanilla TypeScript: every component is a `create…` function that returns a handle with its element and setters.

```ts
import '@mosaic-home/design-system/css/actions';
import { createButton } from '@mosaic-home/design-system/web';
import { mdiPower } from '@mdi/js';

const button = createButton({ label: 'Turn on', icon: mdiPower, onClick: () => button.setLoading(true) });
document.body.append(button.el);
```

React: the same components with the same markup, as controlled components.

```tsx
import '@mosaic-home/design-system/css/actions';
import { Button, ThemeProvider } from '@mosaic-home/design-system/react';
import { mdiPower } from '@mdi/js';

export function App() {
  return (
    <ThemeProvider theme="midnight" deviceClass="phone">
      <Button icon={mdiPower}>Turn on</Button>
    </ThemeProvider>
  );
}
```

## 5. Icons

Icons are [Material Design Icons](https://pictogrammers.com/library/mdi/) paths from `@mdi/js`. Pass a path
(`icon: mdiPower`), or import the short names once and write `icon: 'power'`:

```ts
import '@mosaic-home/design-system/icons';
```

## 6. Make it yours

- **The component gallery** shows every component in every theme, with copyable TypeScript and React code.
- **The theme studio** builds a theme of your own from a few colours and a character, checks its contrast and
  exports it as a theme file (load it with `validateTheme` and `applyTheme`) or as CSS.
- **Tokens** (`@mosaic-home/design-system/tokens`) give you the same colours and sizes as plain data, for canvas
  drawing, charts or another platform. See [the token format](tokens.md).

## Good to know

- Every value comes from `--mh-*` CSS variables, so your own CSS can use them too:
  `border-radius: var(--mh-radius-lg); color: var(--mh-text-muted);`.
- Home components take plain data and callbacks. They don't talk to any home-automation server themselves; your app
  passes the state in and acts on the callbacks.
- Built-in text is English. Components that show text of their own take a `labels` option to translate it.
