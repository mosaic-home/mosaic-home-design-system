import { buttonClass } from '../actions/button.ts';
import { append, cx, h, uid, type Child } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';

export interface OnboardingStep {
  title: string;
  text?: string;
  /** A large icon in a tile above the title. */
  icon?: IconName | string;
  /** An illustration or image in place of the icon. */
  media?: HTMLElement;
  /** Extra content under the text (a switch, a field). */
  content?: Child | Child[];
}

export interface OnboardingLabels {
  /** Accessible name of the whole intro (default "Introduction"). */
  label: string;
  next: string;
  back: string;
  done: string;
  skip: string;
  /** "Step 2 of 4". */
  step(position: number, count: number): string;
}

export const defaultOnboardingLabels: OnboardingLabels = {
  label: 'Introduction',
  next: 'Next',
  back: 'Back',
  done: 'Get started',
  skip: 'Skip',
  step: (position, count) => `Step ${position} of ${count}`,
};

export interface OnboardingOptions {
  steps: readonly OnboardingStep[];
  /** The step shown first (index, default 0). */
  step?: number;
  labels?: Partial<OnboardingLabels>;
  /** Shows a Skip button (default true). */
  skippable?: boolean;
  /** Heading level of step titles (default 2). */
  headingLevel?: 1 | 2 | 3;
  onStepChange?: (index: number) => void;
  onDone?: () => void;
  onSkip?: () => void;
}

export interface OnboardingHandle {
  el: HTMLElement;
  step(): number;
  setStep(index: number): void;
  next(): void;
  back(): void;
}

export function clampOnboardingStep(index: number, count: number): number {
  return Math.max(0, Math.min(count - 1, Math.round(index)));
}

/** Swipe distance (px) that turns the page. */
const TURN = 48;

/** The step a released swipe turns to: +1 (next), -1 (back) or 0. Mouse drags don't turn pages. `rtl` mirrors it. */
export function onboardingSwipe(dx: number, dy: number, pointerType: string, rtl = false): -1 | 0 | 1 {
  if (pointerType === 'mouse' || Math.abs(dx) < TURN || Math.abs(dx) < Math.abs(dy) * 1.5) return 0;
  const forward = rtl ? dx > 0 : dx < 0;
  return forward ? 1 : -1;
}

export function onboardingMediaClass(icon: boolean): string {
  return cx('mh-onboarding__media', icon && 'mh-onboarding__media--icon');
}

/**
 * `.mh-onboarding`: a step-by-step intro. A `__skip` button, the `__steps` (one `role="group"` `__step` per entry
 * with `__media`, `__title`, `__text` and `__content`; only the current one shown), a polite `__live` region, and
 * a `__footer` with `__back`, decorative `__dots` (`.is-current`, `.is-done`) and the `__next` button that becomes
 * the done button on the last step. Touch swipes and Left and Right turn the page.
 */
export function createOnboarding(options: OnboardingOptions): OnboardingHandle {
  const labels = { ...defaultOnboardingLabels, ...options.labels };
  const count = options.steps.length;
  const base = uid('mh-onboarding');
  let current = clampOnboardingStep(options.step ?? 0, count);

  const stepEls = options.steps.map((step, i) => {
    const media = step.media ?? (step.icon ? createIcon(step.icon) : null);
    const el = h(
      'div',
      { class: 'mh-onboarding__step', role: 'group', 'aria-label': labels.step(i + 1, count), id: `${base}-step-${i}` },
      media ? h('div', { class: onboardingMediaClass(!step.media) }, media) : null,
      h(`h${options.headingLevel ?? 2}` as 'h2', { class: 'mh-onboarding__title' }, step.title),
      step.text ? h('p', { class: 'mh-onboarding__text' }, step.text) : null,
    );
    if (step.content !== undefined) append(el, h('div', { class: 'mh-onboarding__content' }, ...(Array.isArray(step.content) ? step.content : [step.content])));
    return el;
  });
  const steps = h('div', { class: 'mh-onboarding__steps' }, ...stepEls);
  const live = h('div', { class: 'mh-onboarding__live mh-visually-hidden', 'aria-live': 'polite' });
  const skip = options.skippable === false ? null : h('button', { type: 'button', class: cx(buttonClass('text', 'small'), 'mh-onboarding__skip') }, h('span', { class: 'mh-button__label' }, labels.skip));
  const back = h('button', { type: 'button', class: cx(buttonClass('text'), 'mh-onboarding__back') }, h('span', { class: 'mh-button__label' }, labels.back));
  const nextLabel = h('span', { class: 'mh-button__label' }, labels.next);
  const next = h('button', { type: 'button', class: cx(buttonClass('primary'), 'mh-onboarding__next') }, nextLabel);
  const dots = options.steps.map(() => h('li', { class: 'mh-onboarding__dot' }));
  const el = h(
    'section',
    { class: 'mh-onboarding', 'aria-label': labels.label },
    skip ? h('div', { class: 'mh-onboarding__top' }, skip) : null,
    steps,
    live,
    h('div', { class: 'mh-onboarding__footer' }, back, h('ol', { class: 'mh-onboarding__dots', 'aria-hidden': 'true' }, ...dots), next),
  );

  const sync = (): void => {
    stepEls.forEach((s, i) => (s.hidden = i !== current));
    dots.forEach((d, i) => {
      d.classList.toggle('is-current', i === current);
      d.classList.toggle('is-done', i < current);
    });
    back.hidden = current === 0;
    nextLabel.textContent = current === count - 1 ? labels.done : labels.next;
  };

  const go = (index: number, notify: boolean): void => {
    const to = clampOnboardingStep(index, count);
    if (to === current) return;
    const hadFocus = document.activeElement === back;
    current = to;
    sync();
    if (hadFocus && back.hidden) next.focus();
    live.textContent = `${labels.step(current + 1, count)}: ${options.steps[current]!.title}`;
    if (notify) options.onStepChange?.(current);
  };
  const forward = (): void => {
    if (current === count - 1) options.onDone?.();
    else go(current + 1, true);
  };

  next.addEventListener('click', forward);
  back.addEventListener('click', () => go(current - 1, true));
  skip?.addEventListener('click', () => options.onSkip?.());
  el.addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('input, textarea, select, [contenteditable="true"], [role="slider"]')) return;
    const rtl = getComputedStyle(el).direction === 'rtl';
    if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight') && current < count - 1) go(current + 1, true);
    else if (e.key === (rtl ? 'ArrowRight' : 'ArrowLeft') && current > 0) go(current - 1, true);
    else return;
    e.preventDefault();
  });
  let press: { x: number; y: number; type: string } | null = null;
  steps.addEventListener('pointerdown', (e) => (press = { x: e.clientX, y: e.clientY, type: e.pointerType }));
  steps.addEventListener('pointerup', (e) => {
    if (!press) return;
    const turn = onboardingSwipe(e.clientX - press.x, e.clientY - press.y, press.type, getComputedStyle(el).direction === 'rtl');
    press = null;
    if (turn) go(current + turn, true);
  });
  steps.addEventListener('pointercancel', () => (press = null));

  sync();
  return {
    el,
    step: () => current,
    setStep: (index) => go(index, false),
    next: forward,
    back: () => go(current - 1, true),
  };
}
