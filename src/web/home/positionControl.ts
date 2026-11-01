import { mdiChevronDown, mdiChevronUp, mdiStop } from '@mdi/js';
import { buttonClass, createButton, type ButtonHandle } from '../actions/button.ts';
import { cx, h } from '../dom.ts';
import { syncChildren } from './children.ts';
import { createHomeSlider, type HomeSliderHandle } from './homeSlider.ts';

/** Where the thing is, or where it is going. */
export type PositionState = 'open' | 'closed' | 'opening' | 'closing' | 'stopped';

/** What the thing can do; a button or the slider is shown only for what is true. */
export interface PositionCapabilities {
  open?: boolean;
  close?: boolean;
  stop?: boolean;
  position?: boolean;
}

/** Every visible word, for translation ("Raise" / "Lower" for blinds). */
export interface PositionControlLabels {
  open: string;
  close: string;
  stop: string;
  position: string;
}

export const POSITION_CONTROL_LABELS: PositionControlLabels = { open: 'Open', close: 'Close', stop: 'Stop', position: 'Position' };

export interface PositionControlOptions {
  /** Accessible name of the whole control (default "Position"). */
  label?: string;
  state?: PositionState | null;
  /** 0 to 100, 100 fully open. */
  position?: number | null;
  /** Default: open and close. */
  can?: PositionCapabilities;
  labels?: Partial<PositionControlLabels>;
  disabled?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onStop?: () => void;
  /** Sent when the finger lifts (not while dragging); a key press sends at once. */
  onPosition?: (value: number) => void;
}

export interface PositionControlHandle {
  el: HTMLDivElement;
  /** Applies changed options; omitted ones keep their value. A slider being dragged keeps the user's value. */
  update(changes: Partial<PositionControlOptions>): void;
  /** Sends a dragged value that was never released. */
  destroy(): void;
}

export type PositionAction = 'open' | 'stop' | 'close';

const ICON: Record<PositionAction, string> = { open: mdiChevronUp, stop: mdiStop, close: mdiChevronDown };

export const POSITION_DEFAULT_CAN: PositionCapabilities = { open: true, close: true };

export const formatPosition = (value: number): string => `${Math.round(value)}%`;

export const positionMoving = (state: PositionState | null | undefined): boolean => state === 'opening' || state === 'closing';

export function positionControlClass(o: Pick<PositionControlOptions, 'state' | 'disabled'>): string {
  return cx('mh-position-control', positionMoving(o.state) && 'is-moving', o.disabled && 'is-disabled');
}

/** The buttons the options call for, in order, with their state. */
export function positionButtons(o: PositionControlOptions): { action: PositionAction; icon: string; label: string; disabled: boolean; active: boolean }[] {
  const can = o.can ?? POSITION_DEFAULT_CAN;
  const l = { ...POSITION_CONTROL_LABELS, ...o.labels };
  const known = typeof o.position === 'number';
  const fullyOpen = known ? o.position! >= 100 : o.state === 'open';
  const fullyClosed = known ? o.position! <= 0 : o.state === 'closed';
  const out: { action: PositionAction; icon: string; label: string; disabled: boolean; active: boolean }[] = [];
  if (can.open) out.push({ action: 'open', icon: ICON.open, label: l.open, disabled: !!o.disabled || (fullyOpen && o.state !== 'closing'), active: o.state === 'opening' });
  if (can.stop) out.push({ action: 'stop', icon: ICON.stop, label: l.stop, disabled: !!o.disabled, active: false });
  if (can.close) out.push({ action: 'close', icon: ICON.close, label: l.close, disabled: !!o.disabled || (fullyClosed && o.state !== 'opening'), active: o.state === 'closing' });
  return out;
}

/** The classes one button adds to a secondary button: `__button--<action>`, `.is-active` while moving that way. */
export function positionButtonClass(action: PositionAction, active = false): string {
  return cx('mh-position-control__button', `mh-position-control__button--${action}`, active && 'is-active');
}

export const POSITION_SLIDER_CLASS = 'mh-position-control__slider';

/**
 * `.mh-position-control`: for blinds, shades, awnings, gates, garage doors and valves. `__buttons` holds
 * `__button--open | --stop | --close` for what `can` allows (the one moving now is `.is-active` and its arrow
 * drifts, unless reduced motion is asked for); `__slider` sets the position (100 = open) and sends it on release.
 * States `.is-moving`, `.is-disabled`.
 */
export function createPositionControl(options: PositionControlOptions): PositionControlHandle {
  let o: PositionControlOptions = { ...options };
  const el = h('div', { role: 'group' });
  const row = h('div', { class: 'mh-position-control__buttons' });
  const buttons = new Map<PositionAction, ButtonHandle>();
  let buttonsKey = '';
  let slider: HomeSliderHandle | null = null;
  let sliderLabel = '';

  const fire = (action: PositionAction): void => {
    if (action === 'open') o.onOpen?.();
    else if (action === 'close') o.onClose?.();
    else o.onStop?.();
  };

  const render = (): void => {
    const l = { ...POSITION_CONTROL_LABELS, ...o.labels };
    el.className = positionControlClass(o);
    el.setAttribute('aria-label', o.label ?? 'Position');

    const wanted = positionButtons(o);
    const key = JSON.stringify(wanted.map((b) => [b.action, b.label]));
    if (key !== buttonsKey) {
      buttonsKey = key;
      buttons.clear();
      row.replaceChildren(
        ...wanted.map((b) => {
          const button = createButton({ label: b.label, icon: b.icon, variant: 'secondary', onClick: () => fire(b.action) });
          buttons.set(b.action, button);
          return button.el;
        }),
      );
    }
    for (const b of wanted) {
      const button = buttons.get(b.action)!;
      button.el.className = cx(buttonClass('secondary'), positionButtonClass(b.action, b.active));
      button.setDisabled(b.disabled);
    }

    const can = o.can ?? POSITION_DEFAULT_CAN;
    const showSlider = !!can.position && typeof o.position === 'number';
    if (slider && (!showSlider || sliderLabel !== l.position)) {
      slider.dispose();
      slider = null;
    }
    if (showSlider) {
      const state = { value: o.position!, min: 0, max: 100, disabled: !!o.disabled };
      if (!slider) {
        sliderLabel = l.position;
        slider = createHomeSlider({ ...state, label: l.position, className: POSITION_SLIDER_CLASS, format: formatPosition, onCommit: (v) => o.onPosition?.(v) });
      } else slider.set(state);
    }

    const children: HTMLElement[] = [];
    if (wanted.length) children.push(row);
    if (slider) children.push(slider.el);
    syncChildren(el, children);
  };
  render();

  return {
    el,
    update(changes) {
      o = { ...o, ...changes };
      render();
    },
    destroy: () => slider?.dispose(),
  };
}
