import { mdiBackspaceOutline, mdiShieldAlert, mdiShieldHome, mdiShieldLock, mdiShieldMoon, mdiShieldOff, mdiShieldSync } from '@mdi/js';
import { buttonClass, createButton, type ButtonHandle, type ButtonVariant } from '../../actions/button.ts';
import { cx, h } from '../../dom.ts';
import { createIcon, type IconName } from '../../icons.ts';
import { syncChildren } from '../children.ts';

/**
 * Where the alarm is. `arming` is the exit delay, `pending` the entry delay (someone came in and has a little while
 * to enter the code), `triggered` the alarm going off.
 */
export type AlarmState = 'disarmed' | 'arming' | 'armed' | 'pending' | 'triggered' | 'disarming';

/** One way to arm ("Home", "Away", "Night"); the app chooses which it offers. */
export interface AlarmMode {
  id: string;
  label: string;
  icon?: IconName | string;
}

export const ALARM_PANEL_MODES: readonly AlarmMode[] = [
  { id: 'home', label: 'Home', icon: mdiShieldHome },
  { id: 'away', label: 'Away', icon: mdiShieldLock },
  { id: 'night', label: 'Night', icon: mdiShieldMoon },
];

/** Every visible and spoken word, for translation. `{mode}` is replaced by the mode's label, `{n}` by a number. */
export interface AlarmPanelLabels {
  states: Record<AlarmState | 'unknown', string>;
  /** A second line under the state, by state (empty for none). */
  details: Record<AlarmState, string>;
  /** Shown in the code box while it is empty. */
  enterCode: string;
  /** Spoken count of entered digits: none, one, more. The digits themselves are never spoken or shown. */
  codeEmpty: string;
  codeOne: string;
  codeMany: string;
  keypad: string;
  /** The keypad key that empties the code. */
  clear: string;
  /** The keypad key that removes the last digit. */
  back: string;
  /** Accessible name of the arm buttons ("Arm Away"). */
  arm: string;
  /** The group of arm buttons. */
  armGroup: string;
  disarm: string;
  /** The disarm button during the exit delay. */
  cancel: string;
}

export const ALARM_PANEL_LABELS: AlarmPanelLabels = {
  states: {
    disarmed: 'Disarmed',
    arming: 'Arming · {mode}',
    armed: 'Armed · {mode}',
    pending: 'Enter the code',
    triggered: 'Alarm triggered',
    disarming: 'Disarming',
    unknown: 'Unknown',
  },
  details: {
    disarmed: 'Choose how to arm',
    arming: 'Leave before the time runs out',
    armed: '',
    pending: 'The alarm sounds when the time runs out',
    triggered: 'Enter the code to stop it',
    disarming: '',
  },
  enterCode: 'Enter code',
  codeEmpty: 'No digits entered',
  codeOne: '1 digit entered',
  codeMany: '{n} digits entered',
  keypad: 'Keypad',
  clear: 'Clear',
  back: 'Delete last digit',
  arm: 'Arm {mode}',
  armGroup: 'Arm',
  disarm: 'Disarm',
  cancel: 'Cancel',
};

export type AlarmPanelLabelsInput = Partial<Omit<AlarmPanelLabels, 'states' | 'details'>> & { states?: Partial<AlarmPanelLabels['states']>; details?: Partial<AlarmPanelLabels['details']> };

export interface AlarmPanelOptions {
  /** Accessible name of the panel (default "Alarm"). */
  label?: string;
  state?: AlarmState | null;
  /** The mode it is armed in or arming to (an id from `modes`). */
  mode?: string | null;
  /** The modes offered while disarmed (default home, away, night). */
  modes?: readonly AlarmMode[];
  /** When the exit or entry delay ends, in epoch milliseconds; shows a countdown. */
  deadline?: number | null;
  /** The whole delay in seconds, for the countdown bar. */
  delay?: number | null;
  /** Arming needs the code (default false). */
  codeToArm?: boolean;
  /** Disarming needs the code (default true). */
  codeToDisarm?: boolean;
  /** The code has this many digits: the box shows that many slots. */
  codeLength?: number | null;
  /** Longest code the keypad takes (default 12, or `codeLength`). */
  maxCodeLength?: number;
  /** A message such as "Wrong code"; a new message empties the code. */
  error?: string | null;
  disabled?: boolean;
  labels?: AlarmPanelLabelsInput;
  /** Arm in a mode, with the code when one was entered. The code is cleared from the panel straight after. */
  onArm?: (mode: string, code: string | undefined) => void;
  /** Disarm (or cancel arming), with the code when one was entered. The code is cleared straight after. */
  onDisarm?: (code: string | undefined) => void;
}

export interface AlarmPanelHandle {
  el: HTMLDivElement;
  /** Applies changed options; omitted ones keep their value. A new state or error empties the code. */
  update(changes: Partial<AlarmPanelOptions>): void;
  /** Empties the code. */
  clearCode(): void;
  /** Stops the countdown timer. */
  destroy(): void;
}

export const ALARM_MAX_CODE = 12;

const STATE_ICON: Record<AlarmState | 'unknown', string> = {
  disarmed: mdiShieldOff,
  arming: mdiShieldSync,
  armed: mdiShieldLock,
  pending: mdiShieldAlert,
  triggered: mdiShieldAlert,
  disarming: mdiShieldSync,
  unknown: mdiShieldOff,
};

/** Merges partial labels over the defaults. */
export function alarmPanelLabels(labels: AlarmPanelLabelsInput | undefined): AlarmPanelLabels {
  return { ...ALARM_PANEL_LABELS, ...labels, states: { ...ALARM_PANEL_LABELS.states, ...labels?.states }, details: { ...ALARM_PANEL_LABELS.details, ...labels?.details } };
}

const fill = (text: string, values: Record<string, string | number>): string => text.replace(/\{(\w+)\}/g, (m, key: string) => (key in values ? String(values[key]) : m));

/** `m:ss` for a number of seconds (never below zero). */
export function formatAlarmCountdown(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Seconds left until `deadline`, or null without one. */
export function alarmSecondsLeft(deadline: number | null | undefined, now: number): number | null {
  if (deadline === null || deadline === undefined || !Number.isFinite(deadline)) return null;
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

export interface AlarmPanelAction {
  /** `arm:<mode>` or `disarm`. */
  key: string;
  kind: 'arm' | 'disarm';
  mode?: string;
  /** Visible text. */
  text: string;
  /** Accessible name when it differs from the text. */
  ariaLabel?: string;
  icon?: IconName | string;
  variant: ButtonVariant;
  disabled: boolean;
}

export interface AlarmPanelView {
  stateText: string;
  detail: string;
  icon: string;
  /** The keypad and code box are shown. */
  keypad: boolean;
  /** The countdown text, or null. */
  time: string | null;
  /** Fraction of the delay left (0..1) for the bar, or null. */
  left: number | null;
  /** `arm` buttons (in a group) or one `disarm` button. */
  actions: AlarmPanelAction[];
  /** Spoken count of entered digits. */
  codeText: string;
}

/** What the panel shows for these options, a code of `codeLength` digits and the time `now`. */
export function alarmPanelView(o: AlarmPanelOptions, codeLength: number, now: number): AlarmPanelView {
  const l = alarmPanelLabels(o.labels);
  const state = o.state ?? null;
  const modes = o.modes ?? ALARM_PANEL_MODES;
  const modeLabel = modes.find((m) => m.id === o.mode)?.label ?? o.mode ?? '';
  const raw = l.states[state ?? 'unknown'];
  const stateText = fill(raw, { mode: modeLabel }).replace(/\s*·\s*$/, '');
  const detail = state ? l.details[state] : '';
  const off = !!o.disabled || state === 'disarming' || state === null;
  const disarmed = state === 'disarmed';
  const needsCode = disarmed ? !!o.codeToArm : (o.codeToDisarm ?? true);
  const keypad = needsCode && state !== null && state !== 'disarming';
  const missing = needsCode && codeLength === 0;
  const actions: AlarmPanelAction[] = disarmed
    ? modes.map((m) => ({ key: `arm:${m.id}`, kind: 'arm' as const, mode: m.id, text: m.label, ariaLabel: fill(l.arm, { mode: m.label }), icon: m.icon, variant: 'secondary' as const, disabled: off || missing }))
    : state === null
      ? []
      : [{ key: 'disarm', kind: 'disarm', text: state === 'arming' ? l.cancel : l.disarm, icon: mdiShieldOff, variant: state === 'arming' ? 'secondary' : 'primary', disabled: off || missing }];
  const counting = state === 'arming' || state === 'pending';
  const secs = counting ? alarmSecondsLeft(o.deadline, now) : null;
  const left = secs !== null && o.delay && o.delay > 0 ? Math.min(1, secs / o.delay) : null;
  const codeText = codeLength === 0 ? l.codeEmpty : codeLength === 1 ? l.codeOne : fill(l.codeMany, { n: codeLength });
  return { stateText, detail, icon: STATE_ICON[state ?? 'unknown'], keypad, time: secs === null ? null : formatAlarmCountdown(secs), left, actions, codeText };
}

/** CSS classes of the panel root. */
export function alarmPanelClass(o: Pick<AlarmPanelOptions, 'state' | 'disabled' | 'error'>): string {
  return cx('mh-alarm-panel', `mh-alarm-panel--${o.state ?? 'unknown'}`, (o.state === 'arming' || o.state === 'disarming') && 'is-busy', !!o.error && 'is-error', o.disabled && 'is-disabled');
}

/** The keys in keypad order: digits, then clear and delete around the 0. */
export const ALARM_KEYS: readonly string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'];

/** Classes of one keypad key. */
export function alarmKeyClass(key: string): string {
  return cx('mh-alarm-panel__key', key === 'clear' ? 'mh-alarm-panel__key--clear' : key === 'back' ? 'mh-alarm-panel__key--back' : 'mh-alarm-panel__key--digit');
}

/** The masked slots: `codeLength` slots (or one per entered digit), the first `entered` filled. */
export function alarmCodeSlots(entered: number, codeLength: number | null | undefined): boolean[] {
  const n = codeLength && codeLength > 0 ? Math.max(codeLength, entered) : entered;
  return Array.from({ length: n }, (_, i) => i < entered);
}

/** The code after a key: a digit appended (up to `max`), the last removed, or emptied. */
export function alarmNextCode(code: string, key: string, max: number): string {
  if (key === 'clear') return '';
  if (key === 'back') return code.slice(0, -1);
  if (/^[0-9]$/.test(key) && code.length < max) return code + key;
  return code;
}

/** Longest code the keypad takes. */
export function alarmMaxCode(o: Pick<AlarmPanelOptions, 'codeLength' | 'maxCodeLength'>): number {
  return Math.max(1, o.codeLength && o.codeLength > 0 ? o.codeLength : (o.maxCodeLength ?? ALARM_MAX_CODE));
}

/**
 * Which action Enter runs: the only action there is, or null when there are several (pick a mode) or none can
 * run yet.
 */
export function alarmEnterAction(view: AlarmPanelView): AlarmPanelAction | null {
  return view.actions.length === 1 && !view.actions[0]!.disabled ? view.actions[0]! : null;
}

/** How urgently the state line is announced: at once when the alarm goes off. */
export function alarmLive(state: AlarmState | null | undefined): 'assertive' | 'polite' {
  return state === 'triggered' ? 'assertive' : 'polite';
}

/** The icon of a keypad key (digits are text). */
export const ALARM_BACK_ICON = mdiBackspaceOutline;

/**
 * `.mh-alarm-panel`: a `__status` row (`__icon`, `__text` with the polite `__state` and `__detail`, and a
 * `role="timer"` `__time` during the exit and entry delays), a `__bar` showing the delay left, the masked `__code`
 * box (`__slot` dots, `.is-filled`; never the digits), an `__message` (`role="alert"`), the `__keypad` of large
 * `__key`s and `__actions` (`__modes` group of arm buttons, or the disarm button). Digits, Backspace, Escape and
 * Enter work from a keyboard too. The code lives only in memory: it is never logged, put in an attribute or
 * shown, and it is cleared as soon as it has been handed to `onArm` or `onDisarm`. Modifiers `--<state>`
 * (`--unknown` when null); states `.is-busy`, `.is-error`, `.is-disabled`.
 */
export function createAlarmPanel(options: AlarmPanelOptions): AlarmPanelHandle {
  let o: AlarmPanelOptions = { ...options };
  let code = '';
  let timer: ReturnType<typeof setInterval> | undefined;

  const icon = h('span', { class: 'mh-alarm-panel__icon', 'aria-hidden': 'true' });
  const state = h('span', { class: 'mh-alarm-panel__state', 'aria-live': 'polite' });
  const detail = h('span', { class: 'mh-alarm-panel__detail' });
  const text = h('span', { class: 'mh-alarm-panel__text' }, state);
  const time = h('span', { class: 'mh-alarm-panel__time', role: 'timer' });
  const status = h('div', { class: 'mh-alarm-panel__status' }, icon, text);
  const barFill = h('span', { class: 'mh-alarm-panel__bar-fill' });
  const bar = h('div', { class: 'mh-alarm-panel__bar', 'aria-hidden': 'true' }, barFill);
  const slots = h('span', { class: 'mh-alarm-panel__slots', 'aria-hidden': 'true' });
  const spoken = h('span', { class: 'mh-visually-hidden', 'aria-live': 'polite' });
  const codeBox = h('div', { class: 'mh-alarm-panel__code' }, slots, spoken);
  const message = h('p', { class: 'mh-alarm-panel__message', role: 'alert' });
  const keypad = h('div', { class: 'mh-alarm-panel__keypad', role: 'group' });
  const keys = new Map<string, HTMLButtonElement>();
  for (const key of ALARM_KEYS) {
    const b = h('button', { type: 'button', class: alarmKeyClass(key) });
    b.addEventListener('click', () => press(key));
    keys.set(key, b);
    keypad.append(b);
  }
  const actions = h('div', { class: 'mh-alarm-panel__actions' });
  const el = h('div', { role: 'group' });
  let iconPath = '';
  let actionKeys = '';
  const buttons = new Map<string, ButtonHandle>();
  let shownState = o.state;
  let shownError = o.error;

  const run = (action: AlarmPanelAction): void => {
    if (action.disabled) return;
    const given = code === '' ? undefined : code;
    code = '';
    render();
    if (action.kind === 'arm') o.onArm?.(action.mode!, given);
    else o.onDisarm?.(given);
  };
  function press(key: string): void {
    if (o.disabled) return;
    const next = alarmNextCode(code, key, alarmMaxCode(o));
    if (next === code) return;
    code = next;
    render();
  }

  el.addEventListener('keydown', (event) => {
    const target = event.target as HTMLElement;
    if (target.closest('input, textarea, select, [contenteditable]')) return;
    const view = alarmPanelView(o, code.length, Date.now());
    if (!view.keypad && event.key !== 'Enter') return;
    if (/^[0-9]$/.test(event.key)) press(event.key);
    else if (event.key === 'Backspace') press('back');
    else if (event.key === 'Escape' && code) press('clear');
    else if (event.key === 'Enter' && target.tagName !== 'BUTTON') {
      const action = alarmEnterAction(view);
      if (action) run(action);
      else return;
    } else return;
    event.preventDefault();
    event.stopPropagation();
  });

  const tick = (): void => {
    const counting = (o.state === 'arming' || o.state === 'pending') && alarmSecondsLeft(o.deadline, Date.now()) !== null;
    if (counting && timer === undefined) timer = setInterval(render, 1000);
    if (!counting && timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  };

  function render(): void {
    const l = alarmPanelLabels(o.labels);
    const view = alarmPanelView(o, code.length, Date.now());
    el.className = alarmPanelClass(o);
    el.setAttribute('aria-label', o.label ?? 'Alarm');
    if (view.icon !== iconPath) {
      iconPath = view.icon;
      icon.replaceChildren(createIcon(view.icon));
    }
    state.textContent = view.stateText;
    state.setAttribute('aria-live', alarmLive(o.state));
    detail.textContent = view.detail;
    syncChildren(text, view.detail ? [state, detail] : [state]);
    time.textContent = view.time ?? '';
    syncChildren(status, view.time !== null ? [icon, text, time] : [icon, text]);
    if (view.left !== null) barFill.style.setProperty('--_left', String(view.left));

    const slotsWanted = alarmCodeSlots(code.length, o.codeLength);
    if (slotsWanted.length === 0) slots.replaceChildren(h('span', { class: 'mh-alarm-panel__prompt' }, l.enterCode));
    else slots.replaceChildren(...slotsWanted.map((on) => h('span', { class: cx('mh-alarm-panel__slot', on && 'is-filled') })));
    spoken.textContent = view.codeText;
    message.textContent = o.error ?? '';

    keypad.setAttribute('aria-label', l.keypad);
    for (const [key, b] of keys) {
      if (key === 'clear') b.textContent = l.clear;
      else if (key === 'back') {
        b.setAttribute('aria-label', l.back);
        b.title = l.back;
        if (!b.firstChild) b.append(createIcon(ALARM_BACK_ICON));
      } else b.textContent = key;
      b.disabled = !!o.disabled || (key === 'clear' || key === 'back' ? code === '' : code.length >= alarmMaxCode(o));
    }

    const wantedKeys = view.actions.map((a) => a.key).join();
    if (wantedKeys !== actionKeys) {
      actionKeys = wantedKeys;
      buttons.clear();
      const made = view.actions.map((a) => {
        const b = createButton({ label: a.text, icon: a.icon, variant: a.variant, size: 'large', onClick: () => run(alarmPanelView(o, code.length, Date.now()).actions.find((x) => x.key === a.key) ?? a) });
        buttons.set(a.key, b);
        return b.el;
      });
      const arming = view.actions[0]?.kind === 'arm';
      actions.replaceChildren(arming ? h('div', { class: 'mh-alarm-panel__modes', role: 'group', 'aria-label': l.armGroup }, ...made) : made[0] ?? '');
    }
    const modes = actions.querySelector('.mh-alarm-panel__modes');
    modes?.setAttribute('aria-label', l.armGroup);
    for (const a of view.actions) {
      const b = buttons.get(a.key)!;
      b.el.className = cx(buttonClass(a.variant, 'large'), 'mh-alarm-panel__action', `mh-alarm-panel__action--${a.kind}`);
      b.setLabel(a.text);
      b.setDisabled(a.disabled);
      if (a.ariaLabel) b.el.setAttribute('aria-label', a.ariaLabel);
      else b.el.removeAttribute('aria-label');
    }

    syncChildren(el, [status, ...(view.left !== null ? [bar] : []), ...(view.keypad ? [codeBox] : []), ...(o.error ? [message] : []), ...(view.keypad ? [keypad] : []), ...(view.actions.length ? [actions] : [])]);
    tick();
  }
  render();

  return {
    el,
    update(changes) {
      o = { ...o, ...changes };
      if (o.state !== shownState || (o.error && o.error !== shownError)) code = '';
      shownState = o.state;
      shownError = o.error;
      render();
    },
    clearCode() {
      code = '';
      render();
    },
    destroy() {
      clearInterval(timer);
      timer = undefined;
    },
  };
}
