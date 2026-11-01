# Notes for agents

Read README.md first. This file holds the rules and conventions it doesn't.

## Rules

- **General-purpose and open source.** Nothing here names a particular person's home, devices, entities, network
  or accounts, and nothing depends on another product's code. Home-control colours (heat, cool, a lit light) are
  an optional add-on (`src/tokens/home.ts`), never assumed by a component.
- **One source of truth.** Themes, scales and the component catalogue are defined once, in `src/tokens` and
  `src/catalog.ts`. Other renderers (the LVGL kit, mosaic-home-design-system-lvgl) consume the generated
  `tokens/*.json`; they never redefine a colour or add a catalogue id on their own. A new theme, role or
  component starts here.
- **Every visual value comes from the theme.** Component CSS uses only `--mh-*` variables: no hex colours, no
  fixed radii for controls (`--mh-radius-control`), no fixed heights for touch targets (`--mh-control-*`). A
  theme must be able to change corners, density, depth and outline width without touching component CSS.
- **Tokens stay pure.** `src/tokens` and `src/catalog.ts` have no DOM and no React, so React Native and build
  tools can import them.
- **The explorer shows everything that's built.** A web component is "ready" only when its catalogue id is in
  `src/ready/<group>.ts` and it has a story in `explorer/src/stories/<group>.ts` (`catalog.test.ts` checks both).

## Layout

```
src/tokens/        types, built-in themes, per-device scales, accents, CSS variable output, JSON export
src/catalog.ts     the component catalogue (groups and entries)
src/ready/         per group: the catalogue ids the web renderer has built
src/web/           CSS + vanilla TypeScript renderer
  <group>/         components (one file each, `create<Name>` returning a handle) + <group>.css + index.ts
src/react/         React DOM bindings, one file per group, rendering the web renderer's exact DOM and classes
explorer/          Vite site: the showcase (index.html, src/showcase.ts), the gallery of every ready component
                   (components.html, src/main.ts) with a Tune bar (theme, device, accent, character), and the
                   theme studio (themes.html, src/studio.ts)
tokens/            generated: mosaic-home.tokens.json, catalog.json (don't edit; `npm run tokens`)
skills/            the agent skill (`npx skills add mosaic-home/mosaic-home-design-system`): SKILL.md is written by
                   hand outside its component index; references/ is generated (`npm run skill`)
docs/              getting-started.md (for people), tokens.md (the token format), and the generated demo site
                   (index.html, components.html, themes.html, assets/, .nojekyll; `npm run demo`)
tools/             build-tokens.ts (generated files), build-skill.ts (the skill), bundle-css.ts (dist/style.css,
                   dist/css/<group>)
```

## Writing a component

Follow `src/web/actions/button.ts` and `src/react/actions.tsx`:

- `create<Name>(options)` returns a handle `{ el, ...setters }`; the root element carries `.mh-<name>` and BEM-ish
  modifiers (`.mh-<name>--<modifier>`, `.mh-<name>__<part>`, states as `.is-<state>` or ARIA attributes).
- Export a `<name>Class(...)` helper when the React binding needs the same class string.
- Screen-reader-only text uses `.mh-visually-hidden` (base.css); borders of controls use `--mh-outline-strong`.
- Native elements first (`<button>`, `<input type="checkbox" role="switch">`, `<dialog>`), with the ARIA the
  pattern needs and keyboard support. No framework, no dependencies beyond `@mdi/js`.
- The React binding renders the same DOM and classes (parity is tested), keeps native inputs controlled through
  React's `value` / `checked` / `onChange`, and wraps imperative widgets (overlays) by building the vanilla handle
  in an effect when markup parity is impractical.
- Register the group in `src/web/<group>/index.ts`, `src/react/<group>.tsx`, `src/ready/<group>.ts` and
  `explorer/src/stories/<group>.ts`. Tests go next to the code (`*.test.ts`, happy-dom).
- Components pass icon paths imported from `@mdi/js` (`createIcon(mdiClose)`, `icon: mdiChevronDown`), never short
  names: the names are an opt-in for apps (`src/icons.ts`), and `icon-names.test.ts` fails on a component that
  uses one.
- A component that renders another group's components or classes adds that group to its group's `needs` in
  `src/web/style-groups.ts` (`style-groups.test.ts` catches a missing one).

## Checks

- `npm run check`: generated files (tokens and the skill) up to date, lint, typecheck, tests. After changing a
  component's options, an example or the docs, run `npm run skill`.
- `npm run explorer` for a live view; `npm run demo` rebuilds the committed demo site in `docs/` (GitHub Pages,
  no CI: the owner commits the build). `npm run check` fails while the demo is out of date. Check a visual change in at
  least a dark and a light theme, phone and tablet, and with corners `square` and density `compact`.
- Tools are TypeScript run directly by Node 22.18+ (`node tools/build-tokens.ts`).
