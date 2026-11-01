import { mdiAlertCircleOutline, mdiCheck } from '@mdi/js';
import { cx, h } from '../dom.ts';
import { createIcon } from '../icons.ts';

export type StepsOrientation = 'horizontal' | 'vertical';
export type StepState = 'complete' | 'current' | 'upcoming' | 'error';

export interface StepItem {
  label: string;
  /** A second line ("Wi-Fi and password"). */
  description?: string;
  /** Marks the step as failed (shown in the danger colour with an alert icon). */
  error?: boolean;
  /** Shows "Optional" under the label. */
  optional?: boolean;
}

export interface StepsOptions {
  steps: readonly StepItem[];
  /** Index of the current step (0-based); steps before it are complete. Past the end, everything is complete. */
  current?: number;
  /** Default `horizontal`; a narrow container shows only the current step's label. */
  orientation?: StepsOrientation;
  /** Accessible name of the list; default "Progress". */
  label?: string;
  /** Makes completed steps buttons that go back to them. */
  onSelect?: (index: number) => void;
  optionalText?: string;
}

export interface StepsHandle {
  el: HTMLOListElement;
  current(): number;
  setCurrent(index: number): void;
  setSteps(steps: readonly StepItem[]): void;
}

/** The state of each step: before `current` complete, at it current, after it upcoming; `error` wins. */
export function stepState(step: Pick<StepItem, 'error'>, index: number, current: number): StepState {
  if (step.error) return 'error';
  return index < current ? 'complete' : index === current ? 'current' : 'upcoming';
}

export function stepsClass(orientation: StepsOrientation = 'horizontal'): string {
  return cx('mh-steps', `mh-steps--${orientation}`);
}

export function stepClass(state: StepState): string {
  return cx('mh-steps__step', `is-${state}`);
}

/** Screen-reader status after the label. */
export const STEP_STATE_TEXT: Record<StepState, string> = { complete: 'completed', current: 'current step', upcoming: 'not started', error: 'has an error' };

/**
 * `ol.mh-steps` (`--horizontal | --vertical`) of `li.mh-steps__step` (`.is-complete | .is-current | .is-upcoming |
 * .is-error`, `aria-current="step"` on the current one). Each holds a `.mh-steps__marker` (number, check or alert
 * icon), `.mh-steps__text` (`__label`, `__description`, `__optional`, and the state for screen readers) and, between
 * steps, a `.mh-steps__connector`. With `onSelect`, completed steps are `button.mh-steps__button`s.
 */
export function createSteps(options: StepsOptions): StepsHandle {
  const el = h('ol', { class: stepsClass(options.orientation), 'aria-label': options.label ?? 'Progress' });
  let steps = [...options.steps];
  let current = Math.max(0, Math.floor(options.current ?? 0));

  function render(): void {
    el.replaceChildren(
      ...steps.map((step, i) => {
        const state = stepState(step, i, current);
        const marker = h(
          'span',
          { class: 'mh-steps__marker', 'aria-hidden': 'true' },
          state === 'complete' ? createIcon(mdiCheck) : state === 'error' ? createIcon(mdiAlertCircleOutline) : String(i + 1),
        );
        const text = h(
          'span',
          { class: 'mh-steps__text' },
          h('span', { class: 'mh-steps__label' }, step.label),
          step.description ? h('span', { class: 'mh-steps__description' }, step.description) : null,
          step.optional ? h('span', { class: 'mh-steps__optional' }, options.optionalText ?? 'Optional') : null,
          h('span', { class: 'mh-visually-hidden' }, `, ${STEP_STATE_TEXT[state]}`),
        );
        const interactive = Boolean(options.onSelect) && state === 'complete';
        const body = interactive ? h('button', { type: 'button', class: 'mh-steps__button' }, marker, text) : h('span', { class: 'mh-steps__body' }, marker, text);
        if (interactive) body.addEventListener('click', () => options.onSelect!(i));
        return h(
          'li',
          { class: stepClass(state), 'aria-current': state === 'current' || (step.error && i === current) ? 'step' : null },
          body,
          i < steps.length - 1 ? h('span', { class: 'mh-steps__connector', 'aria-hidden': 'true' }) : null,
        );
      }),
    );
  }

  render();
  return {
    el,
    current: () => current,
    setCurrent(index) {
      current = Math.max(0, Math.floor(index));
      render();
    },
    setSteps(next) {
      steps = [...next];
      render();
    },
  };
}
