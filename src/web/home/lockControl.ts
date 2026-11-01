import { mdiDoorOpen, mdiLockAlertOutline, mdiLockClock, mdiLockOpenVariantOutline, mdiLockOutline, mdiLockQuestion } from '@mdi/js';
import { buttonClass, createButton, type ButtonHandle } from '../actions/button.ts';
import { cx, h } from '../dom.ts';
import { createIcon } from '../icons.ts';

export type LockState = 'locked' | 'unlocked' | 'locking' | 'unlocking' | 'jammed' | 'open' | 'opening';

/** The buttons: lock, unlock and open (unlatch). */
export type LockAction = 'lock' | 'unlock' | 'open';

/** Every visible and spoken word, for translation. */
export interface LockControlLabels {
  lock: string;
  unlock: string;
  /** The unlatch button. */
  open: string;
  /** The unlock button's second step when `confirm` is on. */
  confirmUnlock: string;
  /** The open button's second step when `confirm` is on. */
  confirmOpen: string;
  /** The state line, by state (`unknown` when the state is null). */
  states: Record<LockState | 'unknown', string>;
}

export const LOCK_CONTROL_LABELS: LockControlLabels = {
  lock: 'Lock',
  unlock: 'Unlock',
  open: 'Open',
  confirmUnlock: 'Tap again to unlock',
  confirmOpen: 'Tap again to open',
  states: { locked: 'Locked', unlocked: 'Unlocked', locking: 'Locking', unlocking: 'Unlocking', jammed: 'Jammed', open: 'Open', opening: 'Opening', unknown: 'Unknown' },
};

export interface LockControlOptions {
  /** Accessible name of the whole control (default "Lock"). */
  label?: string;
  state?: LockState | null;
  /** The lock can also unlatch the door: an Open button. */
  canOpen?: boolean;
  /** Unlock and open ask first: the first tap turns the button into "Tap again to unlock" for a few seconds. */
  confirm?: boolean;
  /** How long the second step waits, in ms (default 4000). */
  confirmTimeout?: number;
  disabled?: boolean;
  labels?: Partial<Omit<LockControlLabels, 'states'>> & { states?: Partial<LockControlLabels['states']> };
  onLock?: () => void;
  onUnlock?: () => void;
  onOpen?: () => void;
}

export interface LockControlHandle {
  el: HTMLDivElement;
  /** Applies changed options; omitted ones keep their value. A new state ends a pending second step. */
  update(changes: Partial<LockControlOptions>): void;
  /** Stops the second-step timer. */
  destroy(): void;
}

export const LOCK_CONFIRM_TIMEOUT = 4000;

/** Merges partial labels over the defaults. */
export function lockLabels(labels: LockControlOptions['labels']): LockControlLabels {
  return { ...LOCK_CONTROL_LABELS, ...labels, states: { ...LOCK_CONTROL_LABELS.states, ...labels?.states } };
}

const BUSY: readonly (LockState | null | undefined)[] = ['locking', 'unlocking', 'opening'];

export function lockControlClass(o: Pick<LockControlOptions, 'state' | 'disabled'> & { confirming?: LockAction | null }): string {
  return cx('mh-lock-control', `mh-lock-control--${o.state ?? 'unknown'}`, BUSY.includes(o.state) && 'is-busy', o.confirming && 'is-confirming', o.disabled && 'is-disabled');
}

/** The icon of the state line. */
export function lockStateIcon(state: LockState | null | undefined): string {
  switch (state) {
    case 'locked':
      return mdiLockOutline;
    case 'unlocked':
      return mdiLockOpenVariantOutline;
    case 'open':
    case 'opening':
      return mdiDoorOpen;
    case 'locking':
    case 'unlocking':
      return mdiLockClock;
    case 'jammed':
      return mdiLockAlertOutline;
    default:
      return mdiLockQuestion;
  }
}

const ICON: Record<LockAction, string> = { lock: mdiLockOutline, unlock: mdiLockOpenVariantOutline, open: mdiDoorOpen };

/** The buttons the options call for, with their label (the second-step text while confirming) and state. */
export function lockButtons(o: LockControlOptions, confirming: LockAction | null = null): { action: LockAction; icon: string; label: string; disabled: boolean; confirming: boolean }[] {
  const l = lockLabels(o.labels);
  const s = o.state;
  const off = !!o.disabled;
  const out: { action: LockAction; icon: string; label: string; disabled: boolean; confirming: boolean }[] = [
    { action: 'lock', icon: ICON.lock, label: l.lock, disabled: off || s === 'locked' || s === 'locking', confirming: false },
    {
      action: 'unlock',
      icon: ICON.unlock,
      label: confirming === 'unlock' ? l.confirmUnlock : l.unlock,
      disabled: off || s === 'unlocked' || s === 'unlocking' || s === 'open' || s === 'opening',
      confirming: confirming === 'unlock',
    },
  ];
  if (o.canOpen) out.push({ action: 'open', icon: ICON.open, label: confirming === 'open' ? l.confirmOpen : l.open, disabled: off || s === 'open' || s === 'opening', confirming: confirming === 'open' });
  return out;
}

/** The classes one button adds to a secondary button: `__button--<action>`, `.is-confirming` on the second step. */
export function lockButtonClass(action: LockAction, confirming = false): string {
  return cx('mh-lock-control__button', `mh-lock-control__button--${action}`, confirming && 'is-confirming');
}

/** The prompt read out while a second step waits, or an empty string. */
export function lockPrompt(o: LockControlOptions, confirming: LockAction | null): string {
  const l = lockLabels(o.labels);
  return confirming === 'unlock' ? l.confirmUnlock : confirming === 'open' ? l.confirmOpen : '';
}

/**
 * `.mh-lock-control`: a `__status` line (`__icon`, `__state`, announced politely) and `__actions` with
 * `__button--lock | --unlock | --open`; the button for the current state is disabled. With `confirm`, unlock and
 * open take a second tap: the button reads "Tap again to unlock" (`.is-confirming`) until it is tapped, another
 * button is used, Escape is pressed or the time runs out; no modal. Modifiers `--<state>` (`--jammed` takes the
 * alert tone, `--unknown` when null); states `.is-busy`, `.is-confirming`, `.is-disabled`.
 */
export function createLockControl(options: LockControlOptions): LockControlHandle {
  let o: LockControlOptions = { ...options };
  let confirming: LockAction | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const icon = h('span', { class: 'mh-lock-control__icon' });
  const state = h('span', { class: 'mh-lock-control__state', 'aria-live': 'polite' });
  const prompt = h('span', { class: 'mh-visually-hidden', 'aria-live': 'assertive' });
  const actions = h('div', { class: 'mh-lock-control__actions' });
  const el = h('div', { role: 'group' }, h('div', { class: 'mh-lock-control__status' }, icon, state), actions, prompt);
  const buttons = new Map<LockAction, ButtonHandle>();
  let iconPath = '';
  let shownState = o.state;

  const stopConfirm = (): void => {
    clearTimeout(timer);
    timer = undefined;
    confirming = null;
  };
  const press = (action: LockAction): void => {
    const asks = !!o.confirm && action !== 'lock';
    if (asks && confirming !== action) {
      stopConfirm();
      confirming = action;
      timer = setTimeout(() => {
        stopConfirm();
        render();
      }, o.confirmTimeout ?? LOCK_CONFIRM_TIMEOUT);
      render();
      return;
    }
    stopConfirm();
    render();
    if (action === 'lock') o.onLock?.();
    else if (action === 'unlock') o.onUnlock?.();
    else o.onOpen?.();
  };
  el.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && confirming) {
      event.stopPropagation();
      stopConfirm();
      render();
    }
  });

  const render = (): void => {
    const l = lockLabels(o.labels);
    el.className = lockControlClass({ ...o, confirming });
    el.setAttribute('aria-label', o.label ?? 'Lock');
    const path = lockStateIcon(o.state);
    if (path !== iconPath) {
      iconPath = path;
      icon.replaceChildren(createIcon(path));
    }
    state.textContent = l.states[o.state ?? 'unknown'];
    prompt.textContent = lockPrompt(o, confirming);

    const wanted = lockButtons(o, confirming);
    const have = [...buttons.keys()].join();
    if (have !== wanted.map((b) => b.action).join()) {
      buttons.clear();
      actions.replaceChildren(
        ...wanted.map((b) => {
          const button = createButton({ label: b.label, icon: b.icon, variant: 'secondary', onClick: () => press(b.action) });
          buttons.set(b.action, button);
          return button.el;
        }),
      );
    }
    for (const b of wanted) {
      const button = buttons.get(b.action)!;
      button.el.className = cx(buttonClass('secondary'), lockButtonClass(b.action, b.confirming));
      button.setLabel(b.label);
      button.setDisabled(b.disabled);
    }
  };
  render();

  return {
    el,
    update(changes) {
      o = { ...o, ...changes };
      if (o.state !== shownState) stopConfirm();
      shownState = o.state;
      render();
    },
    destroy: stopConfirm,
  };
}
