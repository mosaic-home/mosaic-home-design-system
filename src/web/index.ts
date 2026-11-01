// @mosaic-home/design-system/web: CSS + vanilla TypeScript components.
//
//   import '@mosaic-home/design-system/style.css';
//   import { applyTheme, createButton } from '@mosaic-home/design-system/web';
//   applyTheme('midnight', { deviceClass: 'tablet' });
//   document.body.append(createButton({ label: 'Save' }).el);
//
// Each `create<Name>` returns a handle `{ el, ...setters }`. The classes are public too: markup-first pages can
// write `<button class="mh-button mh-button--primary">` directly.

export { append, cx, h, uid, type Attrs, type Child } from './dom.ts';
export { applyTheme, listThemes, type ApplyThemeOptions } from './theme.ts';
export { createIcon, iconPath, registerIcons, type IconName, type IconOptions } from './icons.ts';
export { ICONS } from './icon-set.ts';

export * from './foundations/index.ts';
export * from './actions/index.ts';
export * from './text-inputs/index.ts';
export * from './choice-inputs/index.ts';
export * from './pickers/index.ts';
export * from './navigation/index.ts';
export * from './overlays/index.ts';
export * from './feedback/index.ts';
export * from './data-display/index.ts';
export * from './charts/index.ts';
export * from './media/index.ts';
export * from './layout/index.ts';
export * from './home/index.ts';
