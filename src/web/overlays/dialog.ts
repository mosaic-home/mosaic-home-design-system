import { focusables } from './layer.ts';
import { createShell, publicHandle, type OverlayBaseOptions, type OverlayHandle } from './modal.ts';

export type DialogSize = 'small' | 'medium' | 'large';

export interface DialogOptions extends OverlayBaseOptions {
  description?: string;
  /** Width cap. Default `medium`. */
  size?: DialogSize;
  /** `alertdialog` for messages that need an answer. */
  role?: 'dialog' | 'alertdialog';
}

export type DialogHandle = OverlayHandle;

/**
 * `.mh-overlay.mh-dialog` (`--sm | --lg`): a native `<dialog>` opened with `showModal()`, centred over a scrim.
 * Focus goes to the first control in the body or footer (or an `[autofocus]` one). Parts: `__panel`, `__header`,
 * `__title`, `__description`, `__close`, `__body`, `__footer`.
 */
export function createDialog(options: DialogOptions = {}): DialogHandle {
  const size = options.size ?? 'medium';
  const shell = createShell({
    ...options,
    block: 'dialog',
    modifiers: [size !== 'medium' && `mh-dialog--${size === 'small' ? 'sm' : 'lg'}`],
    initialFocus: () => shell.panel.querySelector<HTMLElement>('[autofocus]') ?? focusables(shell.body)[0] ?? focusables(shell.footer)[0],
  });
  return publicHandle(shell);
}
