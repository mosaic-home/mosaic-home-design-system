import { h } from '../dom.ts';
import { createShell, publicHandle, type OverlayBaseOptions, type OverlayHandle } from './modal.ts';

export interface BottomSheetOptions extends OverlayBaseOptions {
  description?: string;
  /** Drag the handle or header down to close (phones; needs `dismissible`). Default true. */
  swipeToClose?: boolean;
}

export type BottomSheetHandle = OverlayHandle;

/** Distance (px) or speed (px/ms) of a downward drag that closes the sheet. */
const SWIPE_DISTANCE = 96;
const SWIPE_SPEED = 0.6;

/**
 * `.mh-overlay.mh-sheet`: a modal sheet that rises from the bottom edge on phones (drag handle, swipe down to close,
 * safe-area padding) and becomes a centred panel on wide screens. Parts: `__panel`, `__handle`, `__header`,
 * `__title`, `__description`, `__close`, `__body`, `__footer`.
 */
export function createBottomSheet(options: BottomSheetOptions = {}): BottomSheetHandle {
  const grip = h('div', { class: 'mh-sheet__handle', 'aria-hidden': 'true' });
  const shell = createShell({
    ...options,
    block: 'sheet',
    before: grip,
    onOpen: () => {
      shell.panel.style.removeProperty('transform');
      options.onOpen?.();
    },
  });
  if ((options.swipeToClose ?? true) && shell.dismissible) attachSwipe(shell.panel, grip, () => shell.dismiss('swipe'));
  return publicHandle(shell);
}

function attachSwipe(panel: HTMLElement, grip: HTMLElement, close: () => void): void {
  let start: { id: number; y: number; t: number } | null = null;
  let dy = 0;
  const onDown = (e: PointerEvent): void => {
    // Only where the handle shows (phones) and not from a button in the header.
    if (e.button !== 0 || grip.offsetParent === null || (e.target as Element).closest('button, a, input')) return;
    start = { id: e.pointerId, y: e.clientY, t: e.timeStamp };
    dy = 0;
    panel.setPointerCapture?.(e.pointerId);
    panel.classList.add('is-dragging');
  };
  const onMove = (e: PointerEvent): void => {
    if (!start || e.pointerId !== start.id) return;
    dy = Math.max(0, e.clientY - start.y);
    panel.style.transform = `translateY(${dy}px)`;
  };
  const onUp = (e: PointerEvent): void => {
    if (!start || e.pointerId !== start.id) return;
    const speed = dy / Math.max(1, e.timeStamp - start.t);
    start = null;
    panel.classList.remove('is-dragging');
    if (dy > SWIPE_DISTANCE || (dy > 16 && speed > SWIPE_SPEED)) close();
    else panel.style.removeProperty('transform');
  };
  for (const part of [grip, panel.querySelector<HTMLElement>('.mh-sheet__header')]) part?.addEventListener('pointerdown', onDown);
  panel.addEventListener('pointermove', onMove);
  panel.addEventListener('pointerup', onUp);
  panel.addEventListener('pointercancel', onUp);
}
