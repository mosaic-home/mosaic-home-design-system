import { mdiCheckCircleOutline, mdiPause, mdiPlay, mdiWashingMachine } from '@mdi/js';
import { createButton } from '../../actions/button.ts';
import { createIconButton } from '../../actions/iconButton.ts';
import { cx, h } from '../../dom.ts';
import { createIcon, type IconName } from '../../icons.ts';
import { createProgressBar } from '../../feedback/progress.ts';
import { syncChildren } from '../children.ts';
import { createControlCard } from '../controlCard.ts';

export type ApplianceState = 'idle' | 'running' | 'paused' | 'finished' | 'error';

/** Every visible or spoken word, for translation. */
export interface ApplianceCycleLabels {
  states: Record<ApplianceState, string>;
  /** "1 h 12 min left". */
  left(time: string): string;
  progress: string;
  stages: string;
  pause: string;
  resume: string;
  /** The finished state's button ("Done": the laundry is out). */
  dismiss: string;
}

export const APPLIANCE_CYCLE_LABELS: ApplianceCycleLabels = {
  states: { idle: 'Ready', running: 'Running', paused: 'Paused', finished: 'Finished', error: 'Needs attention' },
  left: (time) => `${time} left`,
  progress: 'Progress',
  stages: 'Stages',
  pause: 'Pause',
  resume: 'Resume',
  dismiss: 'Done',
};

export interface ApplianceCycleOptions {
  /** The appliance's name ("Washing machine"); also the card's accessible name. */
  name: string;
  /** Default a washing machine. */
  icon?: IconName | string;
  state: ApplianceState;
  /** The programme ("Cotton 40°"). */
  programme?: string;
  /** The programme's stages in order ("Wash", "Rinse", "Spin"). */
  stages?: readonly string[];
  /** Index of the stage running now. */
  stage?: number | null;
  /** Seconds left. */
  remaining?: number | null;
  /** Percent done, 0 to 100 (default from `remaining` and `duration` when both are known). */
  progress?: number | null;
  /** Total seconds of the programme. */
  duration?: number | null;
  /** When it ends or ended, as the app formats it ("Ends 14:20", "Done at 14:20"). */
  endsAt?: string;
  /** What is wrong while `state` is `error` ("Door open"). */
  error?: string;
  labels?: Partial<ApplianceCycleLabels>;
  unavailable?: boolean;
  /** Shows a pause button while running (and resume while paused). */
  onPause?: () => void;
  onResume?: () => void;
  /** Shows a button on the finished state (the load has been taken out). */
  onDismiss?: () => void;
}

export interface ApplianceCycleHandle {
  el: HTMLDivElement;
  update(changes: Partial<ApplianceCycleOptions>): void;
}

/** "1 h 12 min", "8 min", "< 1 min". */
export function formatApplianceTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0 min';
  if (seconds < 60) return '< 1 min';
  const minutes = Math.round(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${minutes} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

/** Percent done: `progress` when given, else from the time left; 100 when finished; null when unknown. */
export function applianceProgress(o: Pick<ApplianceCycleOptions, 'state' | 'progress' | 'remaining' | 'duration'>): number | null {
  if (o.state === 'finished') return 100;
  if (typeof o.progress === 'number') return Math.max(0, Math.min(100, o.progress));
  if (typeof o.remaining === 'number' && typeof o.duration === 'number' && o.duration > 0) return Math.round(Math.max(0, Math.min(100, (1 - o.remaining / o.duration) * 100)) * 10) / 10;
  return null;
}

export type ApplianceStageStatus = 'done' | 'current' | 'next';

/** Each stage's status: done before the current one, all done when finished. */
export function applianceStages(o: Pick<ApplianceCycleOptions, 'state' | 'stages' | 'stage'>): { label: string; status: ApplianceStageStatus }[] {
  const at = o.state === 'finished' ? Infinity : typeof o.stage === 'number' ? o.stage : -1;
  const running = o.state === 'running' || o.state === 'paused' || o.state === 'error';
  return (o.stages ?? []).map((label, i) => ({ label, status: i < at ? 'done' : i === at && running ? 'current' : 'next' }));
}

export function applianceCycleClass(o: Pick<ApplianceCycleOptions, 'state'>): string {
  return cx('mh-appliance-cycle', `mh-appliance-cycle--${o.state}`);
}

export function applianceStageClass(status: ApplianceStageStatus): string {
  return cx('mh-appliance-cycle__stage', `is-${status}`);
}

/** The header's state line: the state word, then the programme. */
export function applianceStateText(o: Pick<ApplianceCycleOptions, 'state' | 'programme'>, l: ApplianceCycleLabels): string {
  return o.programme ? `${l.states[o.state]} · ${o.programme}` : l.states[o.state];
}

export const APPLIANCE_ICON = mdiWashingMachine;

/**
 * `.mh-appliance-cycle` (on a `.mh-control-card` frame): the state and programme on the state line, an optional
 * pause or resume button in the trailing slot, then `__time` (time left large, `__ends` beside it), a progress
 * bar, `__stages` (an ordered list; the running stage has `aria-current="step"`) and, when finished, a success
 * `__done` line with a dismiss button. Modifier `--<state>`.
 */
export function createApplianceCycle(options: ApplianceCycleOptions): ApplianceCycleHandle {
  let o: ApplianceCycleOptions = { ...options };
  const card = createControlCard({ title: o.name, icon: o.icon ?? APPLIANCE_ICON });
  const body = h('div', { class: 'mh-appliance-cycle__body' });
  const live = h('span', { class: 'mh-visually-hidden', 'aria-live': 'polite' });
  const dismiss = createButton({ label: '', variant: 'tonal', size: 'small', onClick: () => o.onDismiss?.() });
  dismiss.el.classList.add('mh-appliance-cycle__dismiss');
  const step = createIconButton({ icon: mdiPause, label: '', filled: true, onClick: () => (o.state === 'paused' ? o.onResume?.() : o.onPause?.()) });
  step.el.classList.add('mh-appliance-cycle__toggle');

  const render = (): void => {
    const l = { ...APPLIANCE_CYCLE_LABELS, ...o.labels, states: { ...APPLIANCE_CYCLE_LABELS.states, ...o.labels?.states } };
    const parts: HTMLElement[] = [];
    const pct = applianceProgress(o);
    const showTime = (o.state === 'running' || o.state === 'paused') && typeof o.remaining === 'number';
    if (showTime || (o.endsAt && o.state !== 'finished')) {
      parts.push(
        h(
          'p',
          { class: 'mh-appliance-cycle__time' },
          showTime ? h('span', { class: 'mh-appliance-cycle__left' }, l.left(formatApplianceTime(o.remaining!))) : null,
          o.endsAt ? h('span', { class: 'mh-appliance-cycle__ends' }, o.endsAt) : null,
        ),
      );
    }
    if (o.state === 'error' && o.error) parts.push(h('p', { class: 'mh-appliance-cycle__error', role: 'alert' }, o.error));
    if (o.state === 'finished') {
      parts.push(
        h(
          'div',
          { class: 'mh-appliance-cycle__done' },
          h('span', { class: 'mh-appliance-cycle__done-icon' }, createIcon(mdiCheckCircleOutline)),
          h('span', { class: 'mh-appliance-cycle__done-text' }, o.endsAt ?? l.states.finished),
          o.onDismiss ? dismiss.el : null,
        ),
      );
    }
    if (o.state !== 'idle' && o.state !== 'finished' && pct !== null) {
      const bar = createProgressBar({ label: l.progress, value: pct, valueText: `${Math.round(pct)}%`, tone: o.state === 'error' ? 'danger' : 'accent' });
      bar.el.classList.add('mh-appliance-cycle__progress');
      parts.push(bar.el);
    }
    const stages = applianceStages(o);
    if (stages.length) {
      parts.push(
        h(
          'ol',
          { class: 'mh-appliance-cycle__stages', 'aria-label': l.stages },
          ...stages.map((s) => h('li', { class: applianceStageClass(s.status), 'aria-current': s.status === 'current' ? 'step' : null }, h('span', { class: 'mh-appliance-cycle__stage-label' }, s.label))),
        ),
      );
    }
    dismiss.setLabel(l.dismiss);
    if (live.textContent !== l.states[o.state]) live.textContent = l.states[o.state];
    parts.push(live);
    syncChildren(body, parts);

    const paused = o.state === 'paused';
    const canStep = (o.state === 'running' && !!o.onPause) || (paused && !!o.onResume);
    if (canStep) {
      step.setIcon(paused ? mdiPlay : mdiPause);
      step.el.setAttribute('aria-label', paused ? l.resume : l.pause);
      step.el.title = paused ? l.resume : l.pause;
    }
    const control = canStep ? step.el : null;

    card.update({
      title: o.name,
      icon: o.state === 'finished' ? mdiCheckCircleOutline : (o.icon ?? APPLIANCE_ICON),
      state: applianceStateText(o, l),
      active: o.state === 'running' || o.state === 'finished',
      unavailable: o.unavailable,
      control,
      body,
    });
    card.el.classList.add(...applianceCycleClass(o).split(' '));
  };
  render();

  return {
    el: card.el,
    update(changes) {
      o = { ...o, ...changes };
      render();
    },
  };
}
