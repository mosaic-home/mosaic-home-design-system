import { createShell, publicHandle, type OverlayBaseOptions, type OverlayHandle } from './modal.ts';

export type DrawerSide = 'left' | 'right';

export interface DrawerOptions extends OverlayBaseOptions {
  /** Default `right`. */
  side?: DrawerSide;
  description?: string;
}

export type DrawerHandle = OverlayHandle;

/**
 * `.mh-overlay.mh-drawer.mh-drawer--left | --right`: a modal side panel the full height of the screen. Parts:
 * `__panel`, `__header`, `__title`, `__close`, `__body`, `__footer`.
 */
export function createDrawer(options: DrawerOptions = {}): DrawerHandle {
  return publicHandle(createShell({ ...options, block: 'drawer', modifiers: [`mh-drawer--${options.side ?? 'right'}`] }));
}
