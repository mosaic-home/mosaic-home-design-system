import { cx, h, type Child } from '../dom.ts';
import { createScreen, type ScreenWidth } from './screen.ts';

/** Where the navigation slot sits: `start` (a rail), `bottom` (a bar), or `auto`: bottom on phones and watches, a rail elsewhere. */
export type AppShellNav = 'start' | 'bottom' | 'auto';

export interface AppShellOptions {
  /** The app or page title in the title bar (an `h1`). */
  title: string;
  subtitle?: string;
  /** Before the title: a back or menu button. */
  leading?: HTMLElement;
  /** At the end of the title bar: icon buttons, an avatar. */
  actions?: HTMLElement[];
  /** The navigation slot: a nav rail, a tab bar, a list of links. Wrap it in your own `nav` landmark. */
  nav?: HTMLElement;
  /** Default `auto`. */
  navPosition?: AppShellNav;
  /** Below everything: a status bar. */
  status?: HTMLElement;
  /** Width of the content column (default `wide`). */
  width?: ScreenWidth;
  /** Accessible name of the main region. */
  label?: string;
  /** The canvas backdrop behind the frame (default true). */
  canvas?: boolean;
  /** The title bar stays at the top while the content scrolls under it (default true). */
  fixed?: boolean;
}

export interface AppShellHandle {
  el: HTMLDivElement;
  /** The `main` region to append content to. */
  main: HTMLElement;
  /** The scrolling content area. */
  content: HTMLDivElement;
  setTitle(title: string): void;
  setSubtitle(subtitle: string): void;
}

export function appShellClass(navPosition: AppShellNav = 'auto', canvas = true, fixed = true): string {
  return cx('mh-app-shell', canvas && 'mh-canvas', `mh-app-shell--nav-${navPosition}`, fixed && 'mh-app-shell--fixed');
}

/**
 * `.mh-app-shell` (`--nav-start | --nav-bottom | --nav-auto`, `--fixed`): the app frame. A `header` title bar
 * (`__bar` with `__leading`, `__titles` holding the `h1` `__title` and `__subtitle`, and `__actions`), a `__body`
 * with the `__nav` slot and the scrolling `__content` (a `.mh-screen` column without its own canvas), and a
 * `__status` slot. Safe areas are padded on every edge.
 */
export function createAppShell(options: AppShellOptions, ...children: Child[]): AppShellHandle {
  const title = h('h1', { class: 'mh-app-shell__title' }, options.title);
  const subtitle = h('p', { class: 'mh-app-shell__subtitle', hidden: !options.subtitle }, options.subtitle ?? '');
  const bar = h(
    'header',
    { class: 'mh-app-shell__bar' },
    options.leading ? h('div', { class: 'mh-app-shell__leading' }, options.leading) : null,
    h('div', { class: 'mh-app-shell__titles' }, title, subtitle),
    options.actions?.length ? h('div', { class: 'mh-app-shell__actions' }, ...options.actions) : null,
  );
  const screen = createScreen({ canvas: false, width: options.width ?? 'wide', label: options.label }, ...children);
  const content = h('div', { class: 'mh-app-shell__content' }, screen.el);
  const body = h('div', { class: 'mh-app-shell__body' }, options.nav ? h('div', { class: 'mh-app-shell__nav' }, options.nav) : null, content);
  const el = h(
    'div',
    { class: appShellClass(options.navPosition, options.canvas ?? true, options.fixed ?? true) },
    bar,
    body,
    options.status ? h('div', { class: 'mh-app-shell__status' }, options.status) : null,
  );
  return {
    el,
    main: screen.main,
    content,
    setTitle: (text) => {
      title.textContent = text;
    },
    setSubtitle: (text) => {
      subtitle.textContent = text;
      subtitle.hidden = !text;
    },
  };
}
